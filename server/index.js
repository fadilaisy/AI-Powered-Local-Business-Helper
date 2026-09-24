require('dotenv').config();
const express = require('express');
const { allowRequest, generate, healthSnapshot, RATE_LIMIT_MAX_REQUESTS } = require('./generation');

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.length === 0 || (origin && allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.length > 0 ? origin : '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
});
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (req, res) => {
  const snapshot = healthSnapshot();
  res.status(snapshot.status === 'ok' ? 200 : 503).json({ ...snapshot, environment: 'standalone' });
});

app.post('/api/generate', async (req, res) => {
  if (!allowRequest(req.ip)) {
    return res.status(429).json({ error: { code: 'rate_limited', message: `Limit reached. Try again in a minute (maximum ${RATE_LIMIT_MAX_REQUESTS} requests).` } });
  }
  try {
    const result = await generate(req.body);
    return res.status(result.status).json(result.error ? result.error : result.body);
  } catch (error) {
    console.error('Generation handler failed:', error);
    return res.status(500).json({ error: { code: 'internal_error', message: 'Unable to generate content right now' } });
  }
});

const path = require('path');
const fs = require('fs');


const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/', (req, res) => {
  const indexHtml = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PromoVault API — Live</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; background: #070709; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 36px; max-width: 440px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
        .dot { width: 8px; height: 8px; background: #00D4AA; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .badge { display: inline-flex; align-items: center; background: rgba(0,212,170,0.12); color: #00D4AA; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 600; margin-bottom: 16px; border: 1px solid rgba(0,212,170,0.2); }
        h1 { font-size: 22px; font-weight: 600; margin: 0 0 8px; }
        p { color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.5; margin: 0 0 20px; }
        .link { display: inline-block; background: #00D4AA; color: #000; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span>PromoVault Backend Live</div>
        <h1>API Service Operational</h1>
        <p>Gemini 3.6 Flash & BOT Chain hashing endpoints are running.</p>
        <a class="link" href="/api/health">Check /api/health →</a>
      </div>
    </body>
    </html>
  `);
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.redirect('/');
});

// Run a normal server locally (your machine / Railway / Render).
// On Vercel (serverless), VERCEL is set, so we skip listen() and export the app instead.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`PromoVault backend listening on port ${port}`);
  });
}

module.exports = app;
