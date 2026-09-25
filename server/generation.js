const crypto = require('crypto');
const { buildPrompt } = require('./prompts');

const MAX_PROMPT_LENGTH = 4000;
const MAX_CATEGORY_LENGTH = 80;
const MAX_PLATFORM_LENGTH = 40;
const PROVIDER_TIMEOUT_MS = 12000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const PLATFORM_ALIASES = {
  instagram: 'instagram',
  'twitter/x': 'twitter_x',
  twitter_x: 'twitter_x',
  twitter: 'twitter_x',
  x: 'twitter_x',
  flyer: 'flyer',
  'print flyer': 'flyer',
  'google business': 'google_business',
  google_business: 'google_business'
};

const rateBuckets = new Map();

function jsonError(message, status = 400, code = 'invalid_request') {
  return { error: { code, message }, status };
}

function normalizePlatform(value) {
  if (value === undefined || value === null || value === '') return 'general';
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return PLATFORM_ALIASES[normalized] || null;
}

function validateRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('Request body must be a JSON object');
  }

  const prompt = body.prompt;
  const businessCategory = body.businessCategory ?? body.category ?? 'general';
  const platform = body.platform ?? 'general';

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
    return jsonError('Platform must be one of Instagram, Twitter/X, Flyer, or Google Business');
  }

  return {
    value: {
      prompt: prompt.trim(),
      businessCategory: businessCategory.trim() || 'general',
      platform: normalizedPlatform
    }
  };
}

function hashContent(text) {
  return `0x${crypto.createHash('sha256').update(text, 'utf8').digest('hex')}`;
}

function fallbackCopy({ prompt, businessCategory, platform }) {
  const categoryTag = businessCategory.replace(/[^a-zA-Z0-9]/g, '') || 'Promo';
  const hashtags = `#LocalBusiness #WeekendSale #${categoryTag} #ShopLocal #Community`;
  if (platform === 'twitter_x') {
    return `⚡ Weekend Special Alert!\n\n${prompt}\n\nDon't miss out—visit us today or click below to claim.\n\n#ShopLocal #Sale`;
  }
  if (platform === 'flyer') {
    return `SPECIAL COMMUNITY OFFER\n\n${prompt.toUpperCase()}\n\n• Available this weekend\n• Friendly local service\n• Visit us in-store today`;
  }
  if (platform === 'google_business') {
    return `${prompt}\n\nWe welcome you to visit us this weekend. Contact us or stop by to learn more.`;
  }
  return `✨ Exclusive Weekend Special! ✨\n\n${prompt}\n\n📍 Stop by this weekend for great quality and warm local service. Tag a friend who shouldn't miss this!\n\n👉 Follow us for weekly perks and special discounts.\n\n${hashtags}`;
}

function providerSettings() {
  const provider = process.env.LLM_PROVIDER || 'gemini';
  if (!['gemini', 'openai'].includes(provider)) {
    throw new Error(`Unsupported LLM_PROVIDER: ${provider}`);
  }

  let model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  if (provider === 'gemini') {
    if (model.includes('2.0') || model.includes('1.5') || model.includes('2.5')) {
      model = 'gemini-3.6-flash';
    }
  } else if (provider === 'openai') {
    model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  return {
    provider,
    model,
    configured: Boolean(provider === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY)
  };
}

async function callProvider(systemPrompt, userPrompt) {
  const settings = providerSettings();
  if (!settings.configured) {
    return { text: null, source: 'fallback', reason: 'provider_not_configured' };
  }

  try {
    if (settings.provider === 'gemini') {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: settings.model });
      const result = await Promise.race([
        model.generateContent([{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request timed out')), PROVIDER_TIMEOUT_MS))
      ]);
      const text = result.response.text();
      if (!text?.trim()) throw new Error('Provider returned empty content');
      return { text, source: settings.provider, model: settings.model };
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
    return { text, source: settings.provider, model: settings.model };
  } catch (error) {
    console.warn('LLM provider failed, using fallback:', error.message);
    return { text: null, source: 'fallback', reason: 'provider_error', error: error.message };
  }
}

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
      businessCategory: request.businessCategory,
      platform: request.platform,
      source: provider.source,
      degraded: provider.source === 'fallback',
      ...(provider.error ? { providerError: provider.error } : {}),
      timestamp: new Date().toISOString()
    }
  };
}

module.exports = {
  MAX_PROMPT_LENGTH,
  RATE_LIMIT_MAX_REQUESTS,
  allowRequest,
  fallbackCopy,
  generate,
  healthSnapshot,
  hashContent,
  normalizePlatform,
  providerSettings,
  validateRequest
};
