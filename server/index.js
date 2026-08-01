import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const PORT = process.env.PORT || 5000;

// Server-side only — never prefixed with EXPO_PUBLIC_/VITE_, so it is never
// inlined into a client bundle. Set this via your host's secret manager
// (e.g. Replit Secrets), not a committed file.
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;
if (!anthropic) {
  console.warn('[server] ANTHROPIC_API_KEY is not set — /api/ai/generate will return 503 until it is.');
}

const app = express();
app.use(express.json({ limit: '1mb' }));

// Minimal in-memory sliding-window rate limit, per IP. Good enough for a
// single-instance deploy; swap for a shared store (Redis, etc.) if this
// process ever runs behind a load balancer with multiple instances.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const requestLog = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many AI requests — please wait a few minutes and try again.' });
  }
  recent.push(now);
  requestLog.set(ip, recent);
  next();
}

const MAX_TOKENS_CEILING = 1500;

app.post('/api/ai/generate', rateLimit, async (req, res) => {
  if (!anthropic) {
    return res.status(503).json({ error: 'AI service is not configured.' });
  }

  const { model, max_tokens, messages, system } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages is required' });
  }

  try {
    const result = await anthropic.messages.create({
      model: model || 'claude-opus-4-5',
      max_tokens: Math.min(Number(max_tokens) || 500, MAX_TOKENS_CEILING),
      ...(system ? { system } : {}),
      messages,
    });
    res.json(result);
  } catch (err) {
    console.error('[server] Anthropic proxy error:', err?.message || err);
    res.status(502).json({ error: 'AI request failed.' });
  }
});

// Pure API proxy — the app ships to the App Store / Play Store as a native
// Expo build (see ../_archive/vite-web-prototype/README.md for why there's
// no static site served here). If a web build is ever wanted, serve it via
// Expo's own web target (`npm run web`) rather than adding one here.
app.listen(PORT, () => {
  console.log(`Kazi AI server listening on port ${PORT}`);
});
