const { allowRequest, generate, healthSnapshot, RATE_LIMIT_MAX_REQUESTS } = require('../server/generation');

function applyCors(req, res) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
  const origin = req.headers.origin;
  const allowOrigin = allowedOrigins.length > 0
    ? (origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0])
    : '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function clientKey(req) {
  return req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

module.exports = async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Use POST' } });
  if (!allowRequest(clientKey(req))) {
    return res.status(429).json({ error: { code: 'rate_limited', message: `Limit reached. Try again in a minute (maximum ${RATE_LIMIT_MAX_REQUESTS} requests).` } });
  }
  try {
    const result = await generate(req.body);
    return res.status(result.status).json(result.error ? result.error : result.body);
  } catch (error) {
    console.error('Generation handler failed:', error);
    return res.status(500).json({ error: { code: 'internal_error', message: 'Unable to generate content right now' } });
  }
};

module.exports.healthSnapshot = healthSnapshot;
