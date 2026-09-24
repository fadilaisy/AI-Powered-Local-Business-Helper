require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { buildPrompt } = require('./prompts');

const app = express();
const port = process.env.PORT || 3001;
const llmProvider = process.env.LLM_PROVIDER || 'gemini';

app.use(cors());
app.use(express.json());

// Fallback high-quality template generator in case API key is missing or rate-limited on Vercel
function generateFallbackCopy(prompt, category, platform) {
  const hashtags = `#LocalBusiness #WeekendSale #${category.replace(/[^a-zA-Z0-9]/g, '') || 'Promo'} #ShopLocal #Community`;
  
  if (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x')) {
    return `⚡ Weekend Special Alert!\n\n${prompt}\n\nDon't miss out — visit us today or click below to claim.\n\n#ShopLocal #Sale`;
  }
  
  if (platform.toLowerCase().includes('flyer')) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n       ★ SPECIAL COMMUNITY OFFER ★\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${prompt.toUpperCase()}\n\n• Available all weekend long\n• Fresh local quality, guaranteed\n• Friendly staff ready to welcome you\n\nVisit us in-store today!\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
  
  return `✨ Exclusive Weekend Special! ✨\n\n${prompt}\n\n📍 Stop by this weekend to experience great quality and warm local service. Tag a friend who shouldn't miss this!\n\n👉 Follow us for weekly perks and special discounts.\n\n${hashtags}`;
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    llmProvider,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    environment: process.env.VERCEL ? 'vercel-serverless' : 'standalone'
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, category = 'general', platform = '' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { systemPrompt, userPrompt } = buildPrompt(prompt, category, platform);
    let generatedText = '';

    // 1. Try Gemini if configured
    if (llmProvider === 'gemini' && process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const result = await model.generateContent([systemPrompt, userPrompt]);
        generatedText = result.response.text();
      } catch (geminiError) {
        console.warn('Gemini API call failed, using graceful fallback:', geminiError.message);
        generatedText = generateFallbackCopy(prompt, category, platform);
      }
    } 
    // 2. Try OpenAI if configured
    else if (llmProvider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        });
        generatedText = completion.choices[0].message.content;
      } catch (openAiError) {
        console.warn('OpenAI API call failed, using graceful fallback:', openAiError.message);
        generatedText = generateFallbackCopy(prompt, category, platform);
      }
    } 
    // 3. Graceful fallback if no API keys are set on Vercel yet
    else {
      console.info('No LLM API key configured in environment. Using fallback copy generator.');
      generatedText = generateFallbackCopy(prompt, category, platform);
    }

    const hash = crypto.createHash('sha256').update(generatedText).digest('hex');
    const contentHash = '0x' + hash;

    res.json({
      text: generatedText,
      contentHash,
      category,
      platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating copy:', error);
    res.status(500).json({ error: error.message || 'An error occurred while generating content' });
  }
});

const path = require('path');
const fs = require('fs');

const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(__dirname, '../frontend/dist/index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Run a normal server locally (your machine / Railway / Render).
// On Vercel (serverless), VERCEL is set, so we skip listen() and export the app instead.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`PromoVault backend listening on port ${port}`);
  });
}

module.exports = app;
