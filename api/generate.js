const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const { buildPrompt } = require('../server/prompts');

function generateFallbackCopy(prompt, category, platform) {
  const hashtags = `#LocalBusiness #WeekendSale #${category.replace(/[^a-zA-Z0-9]/g, '') || 'Promo'} #ShopLocal #Community`;
  
  if (platform && (platform.toLowerCase().includes('twitter') || platform.toLowerCase().includes('x'))) {
    return `⚡ Weekend Special Alert!\n\n${prompt}\n\nDon't miss out — visit us today or click below to claim.\n\n#ShopLocal #Sale`;
  }
  
  if (platform && platform.toLowerCase().includes('flyer')) {
    return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n       ★ SPECIAL COMMUNITY OFFER ★\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${prompt.toUpperCase()}\n\n• Available all weekend long\n• Fresh local quality, guaranteed\n• Friendly staff ready to welcome you\n\nVisit us in-store today!\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }
  
  return `✨ Exclusive Weekend Special! ✨\n\n${prompt}\n\n📍 Stop by this weekend to experience great quality and warm local service. Tag a friend who shouldn't miss this!\n\n👉 Follow us for weekly perks and special discounts.\n\n${hashtags}`;
}

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, category = 'general', platform = '' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const { systemPrompt, userPrompt } = buildPrompt(prompt, category, platform);
    let generatedText = '';
    const llmProvider = process.env.LLM_PROVIDER || 'gemini';

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
    } else if (llmProvider === 'openai' && process.env.OPENAI_API_KEY) {
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
        console.warn('OpenAI API call failed, using fallback:', openAiError.message);
        generatedText = generateFallbackCopy(prompt, category, platform);
      }
    } else {
      console.info('No LLM key configured. Using fallback copy generator.');
      generatedText = generateFallbackCopy(prompt, category, platform);
    }

    const hash = crypto.createHash('sha256').update(generatedText).digest('hex');
    const contentHash = '0x' + hash;

    return res.status(200).json({
      text: generatedText,
      contentHash,
      category,
      platform,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while generating content' });
  }
};
