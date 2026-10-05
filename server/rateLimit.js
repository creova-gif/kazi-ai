// Pluggable sliding-window rate limit.
//
// Store shape:
//   consume(key, { limit, windowMs, now? }) => Promise<{ allowed: boolean, remaining: number }>
//   sweep?(now?, windowMs?) => Promise<number>  // optional expired-bucket cleanup
//
// createMemoryRateLimitStore() is DEV-ONLY. It lives in this process, resets
// on restart, and is not shared across instances. Inject a shared store
// (Redis or similar) with the same consume() shape before a multi-instance
// launch.

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const SWEEP_INTERVAL_MS = 60 * 1000;

export function createMemoryRateLimitStore({ sweepIntervalMs = SWEEP_INTERVAL_MS } = {}) {
  const buckets = new Map();
  let lastWindowMs = RATE_LIMIT_WINDOW_MS;

  function sweep(now = Date.now(), windowMs = lastWindowMs) {
    let removed = 0;
    for (const [key, stamps] of buckets) {
      const recent = stamps.filter((t) => now - t < windowMs);
      if (recent.length === 0) {
        buckets.delete(key);
        removed += 1;
      } else if (recent.length !== stamps.length) {
        buckets.set(key, recent);
      }
    }
    return removed;
  }

  let timer = null;
  if (sweepIntervalMs > 0) {
    timer = setInterval(() => {
      sweep(Date.now(), lastWindowMs);
    }, sweepIntervalMs);
    // Do not keep the process alive solely for cleanup.
    if (typeof timer.unref === 'function') timer.unref();
  }

  return {
    devOnly: true,
    async consume(key, { limit, windowMs, now = Date.now() }) {
      lastWindowMs = windowMs;
      const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        buckets.set(key, recent);
        return { allowed: false, remaining: 0 };
      }
      recent.push(now);
      buckets.set(key, recent);
      return { allowed: true, remaining: limit - recent.length };
    },
    async sweep(now = Date.now(), windowMs = lastWindowMs) {
      return sweep(now, windowMs);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
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
