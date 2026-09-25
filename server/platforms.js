// Single source of truth for the target platform and business category vocabularies.
// Shared by prompt building, template fallback, and validation so the two never drift.

const CATEGORY_RULES = {
  general: 'a general local business',
  food_beverage: 'a food and beverage business (menu items, fresh ingredients, made to order)',
  retail_shopping: 'a retail and shopping business (products, stock, in-store picks)',
  services_wellness: 'a services and wellness business (appointments, care, expertise, trust)',
  events_entertainment: 'an events and entertainment business (dates, tickets, atmosphere, gathering)'
};

// Keys are already canonical snake_case: normalizeCategory() folds every input
// form ("Food & Beverage", "food&beverage", "food_beverage") into these.
const CATEGORY_ALIASES = {
  general: 'general',
  food_beverage: 'food_beverage',
  food: 'food_beverage',
  restaurant: 'food_beverage',
  cafe: 'food_beverage',
  retail_shopping: 'retail_shopping',
  retail: 'retail_shopping',
  shop: 'retail_shopping',
  shopping: 'retail_shopping',
  services_wellness: 'services_wellness',
  services: 'services_wellness',
  wellness: 'services_wellness',
  salon: 'services_wellness',
  events_entertainment: 'events_entertainment',
  events: 'events_entertainment',
  entertainment: 'events_entertainment'
};

const CATEGORY_KEYS = Object.keys(CATEGORY_RULES);

// Ordered for deterministic cycling; `general` is excluded because it is the
// catch-all rather than a real category a brief can be routed to.
const ROUTABLE_CATEGORY_KEYS = CATEGORY_KEYS.filter((key) => key !== 'general');

function normalizeCategory(value) {
  if (value === undefined || value === null) return 'general';
  if (typeof value !== 'string') return null;
  // Canonicalize to a single snake_case key so "Food & Beverage",
  // "food and beverage", "food&beverage" and "food_beverage" all collapse to
  // the same identifier. The shipped UI labels use spaced ampersands, so
  // matching only exact alias forms rejected the app's own default category.
  const normalized = value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/&|\band\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) return 'general';
  return CATEGORY_ALIASES[normalized] || null;
}

function categoryRule(categoryKey) {
  return CATEGORY_RULES[categoryKey] || CATEGORY_RULES.general;
}

// Turn a category key into a readable hashtag token, preserving the internal
// word boundaries: food_beverage -> "FoodBeverage", not "Foodbeverage".
function tagify(value, fallback) {
  const words = String(value || '')
    .split(/[_\-\s]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  if (words.length === 0) return fallback;
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}

// Deterministic 32-bit hash so a given brief always lands on the same variant.
// Keeps generation reproducible: identical input must yield an identical hash.
function stableIndex(seed, modulo) {
  let hash = 2166136261;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % modulo;
}

// A brief submitted as "general" has no category of its own, so route it across
// the routable categories instead of always landing on the same generic copy.
function resolveCategoryForFallback(categoryKey, prompt) {
  if (categoryKey && categoryKey !== 'general') return categoryKey;
  return ROUTABLE_CATEGORY_KEYS[stableIndex(prompt, ROUTABLE_CATEGORY_KEYS.length)];
}

const PLATFORM_REGISTRY = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    aliases: ['instagram', 'insta', 'ig', 'reels'],
    // The only platform with a real hard character ceiling we must respect in fallback.
    maxChars: 2200,
    rules: 'Generate engaging Instagram copy. Use a conversational tone, a strong call-to-action, and 3-5 relevant hashtags. Keep it concise.'
  },
  twitter_x: {
    id: 'twitter_x',
    label: 'X / Twitter',
    aliases: ['twitter', 'twitter_x', 'x'],
    // X enforces a hard 280-character limit per post.
    maxChars: 280,
    // Excluded from the cross-category fallback: the 280-character ceiling is too
    // tight to carry a category-flavoured body, so it always uses its own
    // hard-truncated single-line template instead.
    excludeFromCategoryFallback: true,
    rules: 'Generate punchy Twitter/X copy. Keep the complete post under 280 characters, use an action-oriented tone, and include 1-2 relevant hashtags.'
  },
  flyer: {
    id: 'flyer',
    label: 'Print flyer',
    aliases: ['flyer', 'print_flyer', 'poster'],
    maxChars: 1200,
    rules: 'Generate copy for a physical flyer. Use an attention-grabbing headline, concise bullet points, and a highly visible call-to-action.'
  },
  google_business: {
    id: 'google_business',
    label: 'Google Business',
    aliases: ['google_business', 'google', 'gbp', 'google_business_profile'],
    maxChars: 750,
    rules: 'Generate a Google Business profile update. Be professional and welcoming, focus on local customers, highlight the offer, and include a clear call-to-action.'
  }
};

const PLATFORM_KEYS = Object.keys(PLATFORM_REGISTRY);

// Aliases are canonical snake_case; normalizePlatform() folds input forms such as
// "Twitter/X", "Print flyer" and "X" into them.
const PLATFORM_ALIASES = (() => {
  const table = {};
  for (const platform of Object.values(PLATFORM_REGISTRY)) {
    for (const alias of platform.aliases) table[alias] = platform.id;
  }
  return table;
})();

function normalizePlatform(value) {
  if (value === undefined || value === null || value === '') return 'general';
  if (typeof value !== 'string') return null;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) return 'general';
  return PLATFORM_ALIASES[normalized] || null;
}

function platformLabel(platformKey) {
  return PLATFORM_REGISTRY[platformKey]?.label || 'General';
}

function platformMaxChars(platformKey) {
  return PLATFORM_REGISTRY[platformKey]?.maxChars || null;
}

const CATEGORY_FLAVOURS = {
  food_beverage: {
    headline: 'Fresh this week',
    body: 'Made to order and worth the trip. Ask about today’s specials and seasonal picks.',
    cta: 'Order ahead or stop by while it lasts.'
  },
  retail_shopping: {
    headline: 'New in store',
    body: 'Hand-picked favourites just landed on the shelves, with more restocks through the week.',
    cta: 'Pop in today and find yours.'
  },
  services_wellness: {
    headline: 'Now booking',
    body: 'Personalised service, honest advice, and an easy booking. Appointments are limited each week.',
    cta: 'Book your slot before it fills up.'
  },
  events_entertainment: {
    headline: 'Mark the date',
    body: 'Good music, good people, and a night worth planning for. Limited space, so get in early.',
    cta: 'Get your ticket while they last.'
  }
};

function buildHashtags(categoryKey, prompt) {
  const tag = tagify(categoryKey, 'LocalBusiness');
  const rotation = ['WeekendPerks', 'ShopLocal', 'Community', 'SpecialOffer'];
  const picks = [];
  const count = stableIndex(prompt, rotation.length);
  for (let i = 0; i < 2; i += 1) {
    const word = rotation[(count + i) % rotation.length];
    if (!picks.includes(word)) picks.push(word);
  }
  return ['LocalBusiness', ...picks, tag].map((word) => `#${word}`).join(' ');
}

// Hard character ceiling, used by the 280-character platform and as a final
// safety net so no platform ever hands back copy it cannot publish.
function clamp(text, maxChars) {
  if (!maxChars || text.length <= maxChars) return text;
  const hardLimit = maxChars - 1;
  const slice = text.slice(0, hardLimit);
  const lastBreak = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
  return `${(lastBreak > maxChars * 0.6 ? slice.slice(0, lastBreak) : slice).trimEnd()}…`;
}

function fallbackForGeneral({ prompt, categoryKey }) {
  const flavour = CATEGORY_FLAVOURS[categoryKey] || CATEGORY_FLAVOURS.food_beverage;
  return `✨ ${flavour.headline} ✨\n\n${prompt}\n\n${flavour.body}\n\n👉 ${flavour.cta}\n\n${buildHashtags(categoryKey, prompt)}`;
}

function fallbackForPlatform(platformKey, { prompt, categoryKey, flavour }) {
  if (platformKey === 'twitter_x') {
    // Own template, never the cross-category body: 280 characters is too tight.
    const base = `${flavour.headline}: ${prompt} ${flavour.cta} #ShopLocal`;
    return clamp(base, platformMaxChars('twitter_x'));
  }

  if (platformKey === 'flyer') {
    return [
      'SPECIAL COMMUNITY OFFER',
      '',
      prompt.toUpperCase(),
      '',
      `• ${flavour.body}`,
      '• Available this weekend',
      '• Friendly local service',
      '',
      `👉 ${flavour.cta.toUpperCase()}`
    ].join('\n');
  }

  if (platformKey === 'google_business') {
    return [
      prompt,
      '',
      flavour.body,
      '',
      `${flavour.cta} Contact us or stop by to learn more.`
    ].join('\n');
  }

  return `✨ ${flavour.headline} ✨\n\n${prompt}\n\n${flavour.body}\n\n👉 ${flavour.cta}\n\n${buildHashtags(categoryKey, prompt)}`;
}

function fallbackCopy({ prompt, businessCategory, platform }) {
  const categoryKey = normalizeCategory(businessCategory) || 'general';
  // X/Twitter keeps its own template; every other platform (including the
  // catch-all `general` platform) falls back across the routable categories.
  const routeCategory = PLATFORM_REGISTRY[platform]?.excludeFromCategoryFallback
    ? (categoryKey === 'general' ? 'food_beverage' : categoryKey)
    : resolveCategoryForFallback(categoryKey, prompt);

  const flavour = CATEGORY_FLAVOURS[routeCategory] || CATEGORY_FLAVOURS.food_beverage;
  const target = PLATFORM_REGISTRY[platform] ? platform : 'general';
  const text = target === 'general'
    ? fallbackForGeneral({ prompt, categoryKey: routeCategory })
    : fallbackForPlatform(target, { prompt, categoryKey: routeCategory, flavour });

  return clamp(text, platformMaxChars(target));
}

function buildPrompt(userPrompt, businessCategory, platform) {
  const categoryKey = normalizeCategory(businessCategory) || 'general';
  const platformRule = PLATFORM_REGISTRY[platform]?.rules || PLATFORM_REGISTRY.instagram.rules;
  const ceiling = platformMaxChars(platform);
  const limitNote = ceiling
    ? ` Hard limit: the finished post must stay under ${ceiling} characters.`
    : '';
  const systemPrompt = [
    'You are an expert local-business marketing copywriter.',
    platformRule,
    `Write for ${categoryRule(categoryKey)}. Use that context without inventing factual details.`,
    `Never invent prices, dates, addresses, or guarantees that the brief did not state.${limitNote}`
  ].join(' ');
  return { systemPrompt, userPrompt };
}

module.exports = {
  CATEGORY_ALIASES,
  CATEGORY_KEYS,
  CATEGORY_RULES,
  PLATFORM_ALIASES,
  PLATFORM_KEYS,
  PLATFORM_REGISTRY,
  buildPrompt,
  categoryRule,
  clamp,
  fallbackCopy,
  normalizeCategory,
  normalizePlatform,
  platformLabel,
  platformMaxChars,
  resolveCategoryForFallback,
  stableIndex
};
