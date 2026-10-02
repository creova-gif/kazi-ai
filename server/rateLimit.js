// Pluggable sliding-window rate limit.
//
// Store shape:
//   consume(key, { limit, windowMs, now? }) => Promise<{ allowed: boolean, remaining: number }>
//
// createMemoryRateLimitStore() is DEV-ONLY. It lives in this process, resets
// on restart, and is not shared across instances. Inject a shared store
// (Redis or similar) with the same consume() shape before a multi-instance
// launch.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

export function createMemoryRateLimitStore() {
  const buckets = new Map();
  return {
    devOnly: true,
    async consume(key, { limit, windowMs, now = Date.now() }) {
      const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        buckets.set(key, recent);
        return { allowed: false, remaining: 0 };
      }
      recent.push(now);
      buckets.set(key, recent);
      return { allowed: true, remaining: limit - recent.length };
    },
  };
}

export function createRateLimiter({ store, limit = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS, keyFn }) {
  if (!store || typeof store.consume !== 'function') {
    throw new Error('rate limiter requires a store with consume()');
  }
  return async function rateLimit(req, res, next) {
    try {
      const key = keyFn(req);
      if (!key) return next();
      const result = await store.consume(key, { limit, windowMs });
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too many AI requests — please wait a few minutes and try again.',
        });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS };
