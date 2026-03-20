// In-process sliding window rate limiter.
// For single-server deploys this is sufficient.
// For multi-instance, replace the store with Redis (ioredis + INCR + EXPIRE).

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Evict stale entries every 5 minutes to prevent memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, win] of store) {
      if (win.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

/**
 * Check and increment a rate limit counter.
 * @param key    — unique identifier (e.g. `transcribe:userId`)
 * @param limit  — max requests per window
 * @param windowMs — window size in ms (default 60s)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): RateLimitResult {
  const now = Date.now();
  let win = store.get(key);

  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count++;

  return {
    allowed: win.count <= limit,
    remaining: Math.max(0, limit - win.count),
    resetAt: win.resetAt,
  };
}
