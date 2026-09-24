const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_PROMPT_LENGTH,
  generate,
  healthSnapshot,
  hashContent,
  normalizePlatform,
  validateRequest
} = require('./generation');

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
