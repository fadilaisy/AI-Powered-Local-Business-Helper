const crypto = require('crypto');
const {
  buildPrompt,
  fallbackCopy,
  normalizeCategory,
  normalizePlatform,
  platformLabel
} = require('./platforms');

const MAX_PROMPT_LENGTH = 4000;
const MAX_CATEGORY_LENGTH = 80;
const MAX_PLATFORM_LENGTH = 40;
const PROVIDER_TIMEOUT_MS = 12000;
const PROVIDER_MAX_ATTEMPTS = 2;
const PROVIDER_RETRY_BASE_MS = 600;
// Must exceed the worst-case server time: attempt * (timeout + backoff).
const CLIENT_TIMEOUT_MS = 45000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateBuckets = new Map();

function jsonError(message, status = 400, code = 'invalid_request') {
  return { error: { code, message }, status };
}

function validateRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('Request body must be a JSON object');
  }

  const prompt = body.prompt;
  const businessCategory = body.businessCategory ?? body.category ?? 'general';
  // Omitting the platform is valid: it normalizes to the cross-category 'general'
  // target instead of being rejected.
  const platform = body.platform ?? '';

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonError('Prompt is required and must be a non-empty string');
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`);
  }
  if (typeof businessCategory !== 'string' || businessCategory.length > MAX_CATEGORY_LENGTH) {
    return jsonError('Business category is invalid');
  }
  if (typeof platform !== 'string' || platform.length > MAX_PLATFORM_LENGTH) {
    return jsonError('Platform is invalid');
  }

  const normalizedPlatform = normalizePlatform(platform);
  if (!normalizedPlatform) {
    return jsonError('Platform must be one of Instagram, X / Twitter, Print flyer, or Google Business');
  }

  const normalizedCategory = normalizeCategory(businessCategory);
  if (!normalizedCategory) {
    return jsonError('Business category is invalid');
  }

  return {
    value: {
      prompt: prompt.trim(),
      businessCategory: normalizedCategory,
      platform: normalizedPlatform
    }
  };
}

function hashContent(text) {
  return `0x${crypto.createHash('sha256').update(text, 'utf8').digest('hex')}`;
}

function providerSettings() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').trim().toLowerCase();
  if (!['gemini', 'openai'].includes(provider)) {
    throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }

  // Read the override for the *active* provider only. The previous code
  // coerced any Gemini model containing "2.0"/"1.5"/"2.5" to a hardcoded
  // default, so an operator's explicit GEMINI_MODEL was silently discarded, and
  // GEMINI_MODEL was consulted even when LLM_PROVIDER was openai.
  const model = provider === 'openai'
    ? (process.env.OPENAI_MODEL || 'gpt-4o-mini')
    : (process.env.GEMINI_MODEL || 'gemini-3.6-flash');

  return {
    provider,
    model,
    configured: Boolean(provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
  };
}

async function callProviderOnce(settings, systemPrompt, userPrompt) {
  if (settings.provider === 'gemini') {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: settings.model,
      systemInstruction: systemPrompt
    });
    const result = await Promise.race([
      model.generateContent(userPrompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request timed out')), PROVIDER_TIMEOUT_MS))
    ]);
    const text = result.response.text();
    if (!text?.trim()) throw new Error('Provider returned empty content');
    return text;
  }

  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await Promise.race([
    openai.chat.completions.create({
      model: settings.model,
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request timed out')), PROVIDER_TIMEOUT_MS))
  ]);
  const text = completion.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new Error('Provider returned empty content');
  return text;
}

// Capacity throttling (503/429) is usually transient and the docs say to retry,
// so one bounded attempt is made before dropping to the template. These are NOT
// worth retrying:
//   - quota exhaustion (the free tier is capped per day, so the suggested delay
//     is minutes, far beyond any request budget we can hold open)
//   - bad credentials, invalid model names, and our own timeout, which would
//     only add latency to a guaranteed failure.
function isRetryable(error) {
  const message = String(error?.message || '');
  if (/quota|exceeded your current quota|billing/i.test(message)) return false;
  if (/API_KEY_INVALID|API key not valid|permission|401|403|400|404/i.test(message)) return false;
  if (/timed out/i.test(message)) return false;
  return /\b(429|500|502|503|504)\b/.test(message)
    || /overloaded|high demand|rate limit|too many requests|try again later|ECONNRESET|ETIMEDOUT|EAI_AGAIN|fetch failed|ENOTFOUND/i.test(message);
}

// Distinguish "you are out of quota" from other provider failures so the client
// and the operator can tell a billing/limit problem from a transient blip.
function classifyProviderFailure(message) {
  const text = String(message || '');
  if (/quota|exceeded your current quota|billing/i.test(text)) return 'quota_exceeded';
  if (/API_KEY_INVALID|API key not valid|permission denied|unauthenticated/i.test(text)) return 'invalid_credentials';
  if (/timed out/i.test(text)) return 'timeout';
  if (/\b(429)\b/.test(text)) return 'rate_limited';
  if (/\b(500|502|503|504)\b/.test(text) || /overloaded|high demand|try again later/i.test(text)) return 'provider_unavailable';
  if (/not found|404|is not supported|invalid model/i.test(text)) return 'invalid_model';
  return 'provider_error';
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callProvider(systemPrompt, userPrompt) {
  const settings = providerSettings();
  if (!settings.configured) {
    return { text: null, source: 'fallback', reason: 'provider_not_configured' };
  }

  let lastError;
  for (let attempt = 0; attempt <= PROVIDER_MAX_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) await sleep(PROVIDER_RETRY_BASE_MS * attempt);
      const text = await callProviderOnce(settings, systemPrompt, userPrompt);
      return { text, source: settings.provider, model: settings.model };
    } catch (error) {
      lastError = error;
      const canRetry = attempt < PROVIDER_MAX_ATTEMPTS && isRetryable(error);
      if (canRetry) {
        console.warn(`LLM provider attempt ${attempt + 1} failed (${error.message}), retrying...`);
        continue;
      }
      console.warn('LLM provider failed, using fallback:', error.message);
      return {
        text: null,
        source: 'fallback',
        reason: classifyProviderFailure(error.message),
        error: error.message
      };
    }
  }

  console.warn('LLM provider failed, using fallback:', lastError?.message);
  return {
    text: null,
    source: 'fallback',
    reason: classifyProviderFailure(lastError?.message),
    error: lastError?.message
  };
}

// Bucket keys are only ever overwritten when the same key returns, so entries
// from clients that never came back accumulated forever. Sweep expired buckets
// on a fixed interval to bound the map, and unref the timer so it never keeps
// the process (or a test run) alive.
const rateBucketSweeper = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) rateBuckets.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS);
rateBucketSweeper.unref?.();

function allowRequest(key, now = Date.now()) {
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= RATE_LIMIT_MAX_REQUESTS;
}

function healthSnapshot() {
  const settings = providerSettings();
  return {
    status: settings.configured ? 'ok' : 'degraded',
    llmProvider: settings.provider,
    model: settings.model,
    providerConfigured: settings.configured,
    time: new Date().toISOString()
  };
}

async function generate(body) {
  const validation = validateRequest(body);
  if (validation.error) return validation;
  const request = validation.value;
  const { systemPrompt, userPrompt } = buildPrompt(request.prompt, request.businessCategory, request.platform);
  const provider = await callProvider(systemPrompt, userPrompt);
  const text = provider.text || fallbackCopy(request);
  return {
    status: 200,
    body: {
      text,
      contentHash: hashContent(text),
      characterCount: text.length,
      businessCategory: request.businessCategory,
      platform: request.platform,
      platformLabel: platformLabel(request.platform),
      source: provider.source,
      degraded: provider.source === 'fallback',
      ...(provider.reason ? { degradedReason: provider.reason } : {}),
      ...(provider.error ? { providerError: provider.error } : {}),
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  CLIENT_TIMEOUT_MS,
  MAX_PROMPT_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  allowRequest,
  classifyProviderFailure,
  fallbackCopy,
  generate,
  healthSnapshot,
  hashContent,
  isRetryable,
  normalizePlatform,
  providerSettings,
  validateRequest
};
