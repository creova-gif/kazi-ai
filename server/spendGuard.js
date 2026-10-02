// Config hook for an AI spend cap and alert.
//
// This does not talk to Anthropic's billing API. It estimates cost from the
// pinned max_tokens (worst-case output) using KAZI_AI_USD_PER_MILLION_OUTPUT_TOKENS.
//
// - capUsd null: cap disabled (dev default). Set KAZI_AI_SPEND_CAP_USD before launch.
// - alertUsd: onAlert fires when projected spend crosses this line. The call
//   is still allowed until the cap.
// - onAlert: replace this to page a person. The default only logs.
// - ledger: optional shared counter { total(), add(usd) }. The built-in
//   counter is process-local, same caveat as the dev rate-limit store.
//
// If a cap is set but the token price is not, calls are refused. A cap
// without a price would not actually limit spend.

function memoryLedger() {
  let spentUsd = 0;
  return {
    async total() {
      return spentUsd;
    },
    async add(usd) {
      spentUsd += usd;
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
        return { ok: false, estimateUsd: 0 };
      }
      const spentUsd = await ledger.total();
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
        return { ok: false, estimateUsd: estimateUsd ?? 0 };
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
      return { ok: true, estimateUsd: estimateUsd ?? 0 };
    },
    async record(estimateUsd) {
      if (!estimateUsd) return;
      await ledger.add(estimateUsd);
    },
  };
}
