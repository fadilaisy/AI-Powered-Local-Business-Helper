const STORAGE_KEY = 'promovault.history';
const CURRENT_KEY = 'promovault.generated';
export const HISTORY_LIMIT = 50;

function read() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.contentHash === 'string' && typeof entry.text === 'string');
  } catch {
    // A corrupt entry should never break the page; drop it and start clean.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable (private mode, quota) - history is best effort */
    }
    return [];
  }
}

function write(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory() {
  return read();
}

export function getCurrentCampaign() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.text !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

// Deduplicates on contentHash so regenerating identical copy (for example the
// same brief against a template fallback) does not pile up entries.
function upsert(entries, campaign) {
  if (!campaign || typeof campaign.contentHash !== 'string') return entries;
  const withoutDuplicate = entries.filter((entry) => entry.contentHash !== campaign.contentHash);
  return [{
    contentHash: campaign.contentHash,
    text: campaign.text,
    category: campaign.category || 'general',
    platform: campaign.platform || 'general',
    platformLabel: campaign.platformLabel || null,
    prompt: campaign.prompt || '',
    source: campaign.source || 'fallback',
    degradedReason: campaign.degradedReason || null,
    characterCount: campaign.characterCount ?? (campaign.text || '').length,
    createdAt: campaign.createdAt || new Date().toISOString(),
    txHash: campaign.txHash || null
  }, ...withoutDuplicate].slice(0, HISTORY_LIMIT);
}

export function addToHistory(campaign) {
  const next = upsert(read(), campaign);
  write(next);
  return next;
}

// Re-upserts an existing entry so reloading the app, or restoring a past round,
// refreshes its metadata without losing the original creation time or an
// already-recorded transaction hash.
export function upsertInHistory(campaign) {
  const existing = read().find((entry) => entry.contentHash === campaign?.contentHash);
  const next = upsert(read(), existing ? { ...existing, ...campaign, createdAt: existing.createdAt, txHash: campaign.txHash || existing.txHash } : campaign);
  write(next);
  return next;
}

// Anchoring updates an existing entry rather than adding a second copy, so the
// history reflects on-chain state for the exact text.
export function markAnchored(contentHash, txHash) {
  const entries = read().map((entry) => (entry.contentHash === contentHash ? { ...entry, txHash } : entry));
  write(entries);
  return entries;
}

export function removeFromHistory(contentHash) {
  const entries = read().filter((entry) => entry.contentHash !== contentHash);
  write(entries);
  return entries;
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

// A stored hash predating this feature may lack a timestamp; sort defensively
// so the newest round always appears first.
export function sortHistory(entries) {
  return [...entries].sort((a, b) => {
    const ta = Date.parse(a.createdAt || '') || 0;
    const tb = Date.parse(b.createdAt || '') || 0;
    return tb - ta;
  });
}
