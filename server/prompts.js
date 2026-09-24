function buildPrompt(userPrompt, businessCategory = 'general', platform = 'general') {
  const platformRules = {
    instagram: 'Generate engaging Instagram copy. Use a conversational tone, a strong call-to-action, and 3-5 relevant hashtags. Keep it concise.',
    twitter_x: 'Generate punchy Twitter/X copy. Keep the complete post under 280 characters, use an action-oriented tone, and include 1-2 relevant hashtags.',
    flyer: 'Generate copy for a physical flyer. Use an attention-grabbing headline, concise bullet points, and a highly visible call-to-action.',
    google_business: 'Generate a Google Business profile update. Be professional and welcoming, focus on local customers, highlight the offer, and include a clear call-to-action.'
  };
  const categoryContext = `The business category is ${businessCategory}. Use that context without inventing factual details.`;
  const systemPrompt = `You are an expert local-business marketing copywriter. ${platformRules[platform] || platformRules.instagram} ${categoryContext}`;
  return { systemPrompt, userPrompt };
}

module.exports = { buildPrompt };
