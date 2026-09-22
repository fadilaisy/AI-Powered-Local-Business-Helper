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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, category = 'general', platform = '' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { systemPrompt, userPrompt } = buildPrompt(prompt, category, platform);
    let generatedText = '';

    if (llmProvider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: 'Gemini API key is not configured' });
      }
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const result = await model.generateContent([systemPrompt, userPrompt]);
      generatedText = result.response.text();
    } else if (llmProvider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
         return res.status(500).json({ error: 'OpenAI API key is not configured' });
      }
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      generatedText = completion.choices[0].message.content;
    } else {
      return res.status(500).json({ error: 'Invalid LLM provider configured' });
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
    res.status(500).json({ error: 'An error occurred while generating content' });
  }
});

// Run a normal server locally (Render / Railway / your machine).
// On Vercel (serverless), VERCEL is set, so we skip listen() and export the app instead.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`PromoVault backend listening on port ${port}`);
  });
}

module.exports = app;
