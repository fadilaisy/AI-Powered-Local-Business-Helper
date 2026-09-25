const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_PROMPT_LENGTH,
  classifyProviderFailure,
  generate,
  healthSnapshot,
  hashContent,
  isRetryable,
  normalizePlatform,
  validateRequest
} = require('./generation');
const {
  PLATFORM_KEYS,
  clamp,
  fallbackCopy,
  normalizeCategory,
  platformMaxChars,
  resolveCategoryForFallback
} = require('./platforms');

test('normalizes supported platform labels', () => {
  assert.equal(normalizePlatform('Twitter/X'), 'twitter_x');
  assert.equal(normalizePlatform('Google Business'), 'google_business');
  assert.equal(normalizePlatform('unknown'), null);
});

test('rejects malformed generation requests', () => {
  assert.equal(validateRequest({ prompt: 42 }).error.code, 'invalid_request');
  assert.equal(validateRequest({ prompt: ' ' }).error.code, 'invalid_request');
  assert.equal(validateRequest({ prompt: 'x'.repeat(MAX_PROMPT_LENGTH + 1) }).error.code, 'invalid_request');
});

test('returns deterministic fallback copy and canonical hash', async () => {
  const body = { prompt: 'Weekend coffee sale', businessCategory: 'food_beverage', platform: 'Instagram' };
  const first = await generate(body);
  const second = await generate(body);
  assert.equal(first.status, 200);
  assert.equal(first.body.source, 'fallback');
  assert.equal(first.body.degraded, true);
  assert.equal(first.body.platform, 'instagram');
  assert.equal(first.body.contentHash, hashContent(first.body.text));
  assert.equal(first.body.text, second.body.text);
  assert.equal(second.body.contentHash, first.body.contentHash);
});

test('health reports degraded when provider is not configured', () => {
  const snapshot = healthSnapshot();
  assert.ok(['ok', 'degraded'].includes(snapshot.status));
  assert.equal(snapshot.providerConfigured, Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY));
});

test('a missing platform falls back to general instead of erroring', () => {
  // Regression: the request validator defaulted to the literal 'general', which
  // was not a recognized alias, so omitting the platform returned a 400.
  const result = validateRequest({ prompt: 'Weekend coffee sale' });
  assert.equal(result.error, undefined);
  assert.equal(result.value.platform, 'general');
});

test('an unknown platform is still rejected', () => {
  assert.equal(validateRequest({ prompt: 'x', platform: 'myspace' }).error.code, 'invalid_request');
  assert.equal(normalizePlatform('myspace'), null);
});

test('rejects an unrecognized business category', () => {
  assert.equal(validateRequest({ prompt: 'x', businessCategory: 'astrophysics' }).error.code, 'invalid_request');
});

test('every category spelling used by the UI resolves to the same key', () => {
  // The form sends slugified labels while the picker shows "Food & Beverage";
  // both must be accepted or the app's own default category is rejected.
  const forms = ['Food & Beverage', 'food & beverage', 'food&beverage', 'food and beverage', 'food_beverage'];
  for (const form of forms) assert.equal(normalizeCategory(form), 'food_beverage', `failed for ${form}`);
  for (const form of ['Retail & Shopping', 'retail_shopping', 'retail and shopping']) {
    assert.equal(normalizeCategory(form), 'retail_shopping', `failed for ${form}`);
  }
  for (const form of ['Services & Wellness', 'services_wellness']) {
    assert.equal(normalizeCategory(form), 'services_wellness', `failed for ${form}`);
  }
  for (const form of ['Events & Entertainment', 'events_entertainment']) {
    assert.equal(normalizeCategory(form), 'events_entertainment', `failed for ${form}`);
  }
});

test('accepts the exact payload the generate form sends', () => {
  // Mirrors PromptForm defaults: category "Food & Beverage" slugified to
  // food_beverage, platform label "Instagram".
  const result = validateRequest({ prompt: 'Weekend coffee sale', businessCategory: 'food_beverage', platform: 'Instagram' });
  assert.equal(result.error, undefined);
  assert.equal(result.value.platform, 'instagram');
  assert.equal(result.value.businessCategory, 'food_beverage');
});

test('fallback copy is deterministic for an identical brief', () => {
  const args = { prompt: 'Same brief', businessCategory: 'general', platform: 'instagram' };
  assert.equal(fallbackCopy(args), fallbackCopy(args));
});

test('a general brief resolves across every routable category', () => {
  // The point of the fix: a category-less brief must not always collapse onto
  // the same generic copy. Distinct briefs must reach distinct categories.
  const briefs = Array.from({ length: 12 }, (_, i) => `Brief number ${i} with some text`);
  const routed = new Set(briefs.map((prompt) => resolveCategoryForFallback('general', prompt)));
  assert.ok(routed.size >= 3, `expected spread across categories, got ${[...routed].join(',')}`);

  const headlines = new Set(briefs.map((prompt) => fallbackCopy({ prompt, businessCategory: 'general', platform: 'instagram' }).split('\n')[0]));
  assert.ok(headlines.size >= 3, 'fallback copy should vary by routed category');
});

test('fallback copy respects every platform character ceiling', () => {
  for (const platform of PLATFORM_KEYS) {
    const max = platformMaxChars(platform);
    const text = fallbackCopy({ prompt: 'x'.repeat(4000), businessCategory: 'general', platform });
    assert.ok(text.length <= max, `${platform} produced ${text.length} chars, limit ${max}`);
  }
});

test('X/Twitter fallback always fits 280 characters and stays on one line', () => {
  const text = fallbackCopy({ prompt: 'y'.repeat(2000), businessCategory: 'general', platform: 'twitter_x' });
  assert.ok(text.length <= 280);
  // A hard newline would be posted as a reply prompt rather than one post.
  assert.equal(text.includes('\n'), false);
});

test('X/Twitter keeps its own template instead of the shared category body', () => {
  // It is excluded from the cross-category fallback, so its output must not
  // carry the multi-line category body the other platforms use.
  const xText = fallbackCopy({ prompt: 'Weekend special', businessCategory: 'food_beverage', platform: 'twitter_x' });
  const igText = fallbackCopy({ prompt: 'Weekend special', businessCategory: 'food_beverage', platform: 'instagram' });
  assert.notEqual(xText, igText);
  assert.equal(xText.includes('•'), false);
});

test('clamp truncates on a word boundary and marks the cut', () => {
  const out = clamp('one two three four five six seven', 15);
  assert.ok(out.length <= 15);
  assert.ok(out.endsWith('…'));
});

test('generated payloads expose hash, counts, and platform label', async () => {
  const result = await generate({ prompt: 'Weekend coffee sale', businessCategory: 'food_beverage', platform: 'Google Business' });
  assert.equal(result.status, 200);
  assert.equal(result.body.platform, 'google_business');
  assert.equal(result.body.platformLabel, 'Google Business');
  assert.equal(result.body.characterCount, result.body.text.length);
  assert.equal(result.body.contentHash, hashContent(result.body.text));
  assert.ok(result.body.timestamp);
});

test('daily quota exhaustion is classified and never retried', () => {
  // The free tier caps requests per day, so the provider asks us to wait ~60s.
  // Retrying inside a request budget only adds latency to a certain failure.
  const quota = new Error('Error fetching ...: [429 ] You exceeded your current quota, please check your plan and billing details.');
  assert.equal(classifyProviderFailure(quota.message), 'quota_exceeded');
  assert.equal(isRetryable(quota), false);
});

test('transient provider errors are retryable', () => {
  for (const message of [
    '[503 ] This model is currently experiencing high demand.',
    '[502 ] upstream error',
    'fetch failed'
  ]) {
    assert.equal(isRetryable(new Error(message)), true, `expected retryable: ${message}`);
  }
  assert.equal(classifyProviderFailure('[503 ] high demand'), 'provider_unavailable');
});

test('credential, model, and timeout failures are not retried', () => {
  for (const message of [
    'API_KEY_INVALID: API key not valid',
    'the model is not found for your project',
    'Provider request timed out'
  ]) {
    assert.equal(isRetryable(new Error(message)), false, `expected not retryable: ${message}`);
  }
  assert.equal(classifyProviderFailure('API key not valid'), 'invalid_credentials');
  assert.equal(classifyProviderFailure('the model is not found'), 'invalid_model');
  assert.equal(classifyProviderFailure('Provider request timed out'), 'timeout');
});

test('fallback responses carry a machine-readable degraded reason', async () => {
  // The provider is unconfigured in tests, so every call takes the template path.
  const result = await generate({ prompt: 'Weekend sale', platform: 'Instagram' });
  assert.equal(result.body.degraded, true);
  assert.equal(result.body.degradedReason, 'provider_not_configured');
});

