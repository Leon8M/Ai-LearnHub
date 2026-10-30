// API key pool shared by all providers.
//
// Each provider reads up to MAX_KEYS keys: PREFIX, PREFIX_1 ... PREFIX_4 (e.g. GROQ_API_KEY_2).
// When a key is rate limited (429) or rejected (401/403) it is benched for a while and the next
// key is tried. Cooldowns live in memory per server instance: good enough to stop hammering a
// throttled key, and they reset harmlessly on a cold start.
//
// Note: keys from the SAME account/project share that account's rate limit. Several keys from
// one account add failover, not capacity.

export const MAX_KEYS = 4;

const cooldowns = new Map(); // "<provider>:<index>" -> timestamp (ms) when usable again

export function collectKeys(prefix) {
  const names = [prefix, ...Array.from({ length: MAX_KEYS }, (_, i) => `${prefix}_${i + 1}`)];
  const seen = new Set();
  const keys = [];
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value && !seen.has(value)) {
      seen.add(value);
      keys.push(value);
    }
  }
  return keys.slice(0, MAX_KEYS);
}

export const isCoolingDown = (provider, index, now = Date.now()) => (cooldowns.get(`${provider}:${index}`) ?? 0) > now;

export function benchKey(provider, index, ms) {
  cooldowns.set(`${provider}:${index}`, Date.now() + ms);
}

/** Seconds from a Retry-After header, as milliseconds, within sane bounds. */
export function retryAfterMs(response, fallbackMs = 60_000) {
  const seconds = Number(response?.headers?.get?.('retry-after'));
  return Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 15 * 60_000) : fallbackMs;
}

export const resetCooldowns = () => cooldowns.clear(); // for tests
