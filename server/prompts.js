function buildPrompt(userPrompt, category = 'general', platform = '') {
  let systemPrompt = '';
  switch(category) {
    case 'instagram':
      systemPrompt = 'You are an expert social media marketer. Generate engaging Instagram marketing copy based on the user prompt. Make it visual, use a conversational tone, include a strong call-to-action, and add 3-5 relevant hashtags. Keep it concise.';
      break;
    case 'twitter':
    case 'twitter_x':
      systemPrompt = 'You are an expert social media marketer. Generate punchy Twitter/X marketing copy based on the user prompt. Make it action-oriented, under 280 characters, include a clear call-to-action, and use 1-2 relevant hashtags.';
      break;
    case 'flyer':
      systemPrompt = 'You are an expert copywriter. Generate marketing copy for a physical flyer based on the user prompt. Use attention-grabbing headlines, clear bullet points for key information, and a highly visible call-to-action. Keep the text brief so it fits on a single page.';
      break;
    case 'google_business':
      systemPrompt = 'You are an expert local marketer. Generate a Google Business profile update post based on the user prompt. Be professional yet welcoming, focus on local customers, highlight any offers or news, and include a clear call-to-action to visit or contact the business.';
      break;
    default:
      systemPrompt = 'You are an expert copywriter. Generate effective marketing copy based on the user prompt. Ensure it is engaging, action-oriented, and includes a clear call-to-action.';
      break;
  }
  
  if (platform && category === 'general') {
    systemPrompt += ` The target platform is ${platform}. Tailor the copy appropriately.`;
  }

  return { systemPrompt, userPrompt };
}

module.exports = { buildPrompt };
