import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { requireAppDevice } from './auth.js';
import { createMemoryRateLimitStore, createRateLimiter, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './rateLimit.js';
import { createSpendGuard } from './spendGuard.js';
import { TaskError, buildTaskRequest } from './tasks.js';

// Server-owned pin. Client `model` is ignored. Override only via env or
// the createApp option — never from the request.
export const PINNED_MODEL = 'claude-opus-4-5';

function envNumber(name) {
  const raw = process.env[name];
  if (raw == null || String(raw).trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

export function createApp({
  anthropic = null,
  appKey = process.env.KAZI_APP_KEY || '',
  model = process.env.KAZI_AI_MODEL || PINNED_MODEL,
  rateLimitStore = createMemoryRateLimitStore(),
  rateLimit = {},
  spend = {},
} = {}) {
  const limit = rateLimit.max ?? RATE_LIMIT_MAX;
  const windowMs = rateLimit.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const spendGuard = createSpendGuard({
    capUsd: spend.capUsd !== undefined ? spend.capUsd : envNumber('KAZI_AI_SPEND_CAP_USD'),
    alertUsd: spend.alertUsd !== undefined ? spend.alertUsd : envNumber('KAZI_AI_SPEND_ALERT_USD'),
    usdPerMillionOutputTokens: spend.usdPerMillionOutputTokens !== undefined
      ? spend.usdPerMillionOutputTokens
      : envNumber('KAZI_AI_USD_PER_MILLION_OUTPUT_TOKENS'),
    onAlert: spend.onAlert,
    ledger: spend.ledger,
  });

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  const limitByIp = createRateLimiter({
    store: rateLimitStore,
    limit,
    windowMs,
    keyFn: (req) => `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`,
  });
  const limitByDevice = createRateLimiter({
    store: rateLimitStore,
    limit,
    windowMs,
    keyFn: (req) => (req.deviceId ? `device:${req.deviceId}` : ''),
  });

  app.post('/api/ai/generate', limitByIp, requireAppDevice(appKey), limitByDevice, async (req, res) => {
    if (!anthropic) {
      return res.status(503).json({ error: 'AI service is not configured.' });
    }

    // Client model, system, messages, and max_tokens are intentionally unused.
    const body = req.body ?? {};
    let built;
    try {
      built = buildTaskRequest(body.task, body.inputs);
    } catch (err) {
      if (err instanceof TaskError) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error('[server] task build failed:', err?.message || err);
      return res.status(400).json({ error: 'Invalid task' });
    }

    try {
      const gate = await spendGuard.beforeCall({ task: body.task, maxTokens: built.max_tokens });
      if (!gate.ok) {
        return res.status(429).json({ error: 'AI spend cap reached. Try again later.' });
      }

      const result = await anthropic.messages.create({
        model,
        max_tokens: built.max_tokens,
        system: built.system,
        messages: built.messages,
      });
      try {
        await spendGuard.record(gate.estimateUsd);
      } catch (err) {
        console.error('[spend] ledger record failed:', err?.message || err);
      }
      return res.json(result);
    } catch (err) {
      console.error('[server] Anthropic proxy error:', err?.message || err);
      return res.status(502).json({ error: 'AI request failed.' });
    }
  });

  return app;
}

if (isMainModule()) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const anthropic = apiKey ? new Anthropic({ apiKey }) : null;
  const appKey = process.env.KAZI_APP_KEY || '';
  const rateLimitStore = createMemoryRateLimitStore();

  if (!anthropic) {
    console.warn('[server] ANTHROPIC_API_KEY is not set — /api/ai/generate will return 503 until it is.');
  }
  if (!appKey) {
    console.warn('[server] KAZI_APP_KEY is not set — /api/ai/generate will fail closed (503) until it is.');
  }
  if (rateLimitStore.devOnly) {
    console.warn('[server] Rate limiter is the in-memory dev store. It does not survive restarts and is not shared across instances. Inject a shared store before launch.');
  }
  if (envNumber('KAZI_AI_SPEND_CAP_USD') == null) {
    console.warn('[server] KAZI_AI_SPEND_CAP_USD is not set — the spend cap hook will not block calls. Set it, the token price, and an alert hook before launch.');
  }

  const PORT = process.env.PORT || 5000;
  const app = createApp({ anthropic, appKey, rateLimitStore });
  app.listen(PORT, () => {
    console.log(`Kazi AI server listening on port ${PORT}`);
  });
}
