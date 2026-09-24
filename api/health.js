const { healthSnapshot } = require('../server/generation');

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS?.split(',')[0]?.trim() || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Use GET' } });
  const snapshot = healthSnapshot();
  return res.status(snapshot.status === 'ok' ? 200 : 503).json(snapshot);
};
