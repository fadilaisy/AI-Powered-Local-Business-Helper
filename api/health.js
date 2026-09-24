module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    llmProvider: process.env.LLM_PROVIDER || 'gemini',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
};
