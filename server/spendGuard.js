// Config hook for an AI spend cap and alert.
//
// This does not talk to Anthropic's billing API. It estimates cost from the
// pinned max_tokens (worst-case output) using KAZI_AI_USD_PER_MILLION_OUTPUT_TOKENS.
//
// - capUsd null: cap disabled (dev default). Set KAZI_AI_SPEND_CAP_USD before launch.
// - alertUsd: onAlert fires when projected spend crosses this line. The call
//   is still allowed until the cap.
// - onAlert: replace this to page a person. The default only logs.
// - ledger: optional shared counter. Preferred shape:
//     { total(), reserve(usd), commit(usd), release(usd) }
//   Legacy { total(), add(usd) } still works via an adapter, but concurrent
//   requests can overshoot the cap without reserve().
//
// If a cap is set but the token price is not, calls are refused. A cap
// without a price would not actually limit spend.

function memoryLedger() {
  let spentUsd = 0;
  let reservedUsd = 0;
  return {
    async total() {
      return spentUsd + reservedUsd;
    },
    async reserve(usd) {
      reservedUsd += usd;
    },
    async commit(usd) {
      reservedUsd = Math.max(0, reservedUsd - usd);
      spentUsd += usd;
    },
    async release(usd) {
      reservedUsd = Math.max(0, reservedUsd - usd);
    },
    // Legacy compatibility for callers/tests that still use add().
    async add(usd) {
      spentUsd += usd;
    },
  };
}

function adaptLegacyLedger(ledger) {
  if (typeof ledger.reserve === 'function' && typeof ledger.commit === 'function' && typeof ledger.release === 'function') {
    return ledger;
  }
  // Best-effort adapter: reserve bumps via add; release cannot reclaim.
  // Callers should migrate to reserve/commit/release for real concurrency safety.
  return {
    total: () => ledger.total(),
    async reserve(usd) {
      await ledger.add(usd);
    },
    async commit(_usd) {
      // already counted in reserve()
    },
    async release(_usd) {
      // cannot reclaim on legacy ledger
    },
  };
}

export function createSpendGuard({
  capUsd = null,
  alertUsd = null,
  usdPerMillionOutputTokens = null,
  onAlert = (event) => {
    console.warn(`[spend] ${event.level}: ${event.message}`);
  },
  ledger = memoryLedger(),
} = {}) {
  const store = adaptLegacyLedger(ledger);

  async function emit(event) {
    try {
      await onAlert(event);
    } catch (err) {
      console.error('[spend] alert hook failed:', err?.message || err);
    }
  }

  return {
    async beforeCall({ task, maxTokens }) {
      const price = Number(usdPerMillionOutputTokens);
      const estimateUsd = Number.isFinite(price) && price > 0
        ? (maxTokens / 1_000_000) * price
        : null;
      if (capUsd != null && estimateUsd == null) {
        await emit({
          level: 'cap',
          task,
          message: 'Spend cap is set but KAZI_AI_USD_PER_MILLION_OUTPUT_TOKENS is not. Refusing the call.',
          capUsd,
          alertUsd,
        });
        return { ok: false, estimateUsd: 0, reserved: false };
      }
      const spentUsd = await store.total();
      const projectedUsd = spentUsd + (estimateUsd ?? 0);
      if (capUsd != null && projectedUsd > capUsd) {
        await emit({
          level: 'cap',
          task,
          spentUsd,
          projectedUsd,
          estimateUsd,
          capUsd,
          alertUsd,
          message: `Projected spend ${projectedUsd} exceeds cap ${capUsd}.`,
        });
        return { ok: false, estimateUsd: estimateUsd ?? 0, reserved: false };
      }
      if (estimateUsd) {
        await store.reserve(estimateUsd);
      }
      if (alertUsd != null && spentUsd < alertUsd && projectedUsd >= alertUsd) {
        await emit({
          level: 'alert',
          task,
          spentUsd,
          projectedUsd,
          estimateUsd,
          capUsd,
          alertUsd,
          message: `Projected spend ${projectedUsd} crossed alert ${alertUsd}.`,
        });
      }
      return { ok: true, estimateUsd: estimateUsd ?? 0, reserved: Boolean(estimateUsd) };
    },
    async record(estimateUsd) {
      if (!estimateUsd) return;
      await store.commit(estimateUsd);
    },
    async release(estimateUsd) {
      if (!estimateUsd) return;
      await store.release(estimateUsd);
    },
  };
}
