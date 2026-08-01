# Kazi AI — ML/AI Engineering Audit

**Scope:** All "Claude AI"-branded features (CV summary generation, CV scoring, cover letters, application letters, skills-gap tips, AI-generated interview questions, AI Job Coach chat). Conducted as part of a multi-expert launch-readiness review.

**Verdict up front:** The AI is real. Every "Claude AI · Anthropic"-branded surface in this app makes a genuine, live call to `https://api.anthropic.com/v1/messages` with a real prompt built from the user's CV and a real Claude model (`claude-opus-4-5`). It is not lorem ipsum, not hardcoded, not simulated. However, the *way* it is wired is a textbook client-side-secret-exposure anti-pattern that is unsafe to ship to any public user this week, and the product's own PRD independently confirms this was never finished.

---

## 1. Summary

| Question | Answer |
|---|---|
| Is the AI output real or fake? | **Real.** Live `fetch()` calls to the Anthropic Messages API, in all 7 audited components. |
| Is `@anthropic-ai/sdk` used? | **No — zero matches anywhere in the repo.** All calls use raw `fetch`, not the SDK. The dependency is vestigial. |
| Is the API key safe? | **No — critical issue.** The key is read from `import.meta.env.VITE_ANTHROPIC_API_KEY` and sent directly from the browser, using the `anthropic-dangerous-direct-browser-access: 'true'` header, which exists specifically to let developers bypass Anthropic's CORS protection against this exact pattern. Any user of the deployed web build can read the production key from DevTools → Network, or by unminifying the JS bundle. |
| Is there a backend/proxy? | **No.** No `server/`, `backend/`, or API route directory exists anywhere in the repo. |
| Does this work on the actual mobile app? | **Likely not.** The app's primary target (per `README.md`, `package.json` `main: "expo-router/entry"`) is Expo/React Native, but all 7 AI call sites use `import.meta.env` — a Vite/web-only construct. In the Expo/Metro runtime this is undefined, so on-device the calls will send an empty `x-api-key` and silently fail into the generic "Error — please try again" state. |
| Does the PRD itself flag this? | **Yes.** `KaziAI_PRD.md` line 589 lists "Claude API Key Management — Ensure AI works for all users (env var setup)" as a **recommended next sprint** item, while the same document's status table marks AI Summary, CV Score (5.3/US-024, still `🔴 Not built`), Cover Letter, AI Mock Interviewer, and AI Job Coach as `✅ Implemented`. The PRD authors already knew the key/env wiring was incomplete. |

---

## 2. Findings, by severity

### 2.1 CRITICAL — Anthropic API key is exposed client-side in every AI feature

**Evidence** (identical pattern repeated in all 7 files):

```
src/app/components/builder/AISummarySheet.tsx:55-68
src/app/components/builder/CVScoreSheet.tsx:46-55
src/app/components/builder/SkillsGap.tsx:84-93
src/app/components/builder/JobCoach.tsx:69-83
src/app/components/builder/InterviewPrep.tsx:56-65
src/app/components/jobs/CoverLetterSheet.tsx:75-88
src/app/components/jobs/ApplicationLetterSheet.tsx:96-105
```

```ts
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  },
  body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
});
```

Why this is critical, not just sloppy:
- `VITE_*` env vars are inlined into the built JS bundle at build time — they are **public by construction**, not secrets. Anyone who loads the app can extract the key from the Network tab or from the shipped `dist/assets/*.js` (this repo already commits a built `dist/` folder to git, compounding the exposure surface — see 2.4).
- `anthropic-dangerous-direct-browser-access: 'true'` is not an incidental header — it's the explicit opt-out of Anthropic's CORS-based safeguard that exists *specifically* to stop browsers from calling the API directly with a raw key. Someone had to deliberately add this to make the insecure call work at all.
- Consequence if this key is ever a real production key: any visitor can steal it and (a) run up unbounded billing on the owner's Anthropic account, (b) use it for unrelated purposes outside this app, (c) potentially violate Anthropic's usage policies for the account, risking suspension.
- The original scaffolded version of these files (`src/imports/AISummarySheet.tsx` etc., the pre-edit Figma Make copies) called `fetch()` **without** the `x-api-key` header or the dangerous-access flag — i.e., it was calling out to nothing that would actually authenticate. Someone subsequently edited the `src/app/components/` copies to bolt on a raw client-side key to make the calls actually return data. That is a regression from "silently broken" to "actively insecure," not a fix.

**Fix required before any real user traffic:** move every one of these 7 call sites behind a server-held key (see Recommendation, §4).

### 2.2 HIGH — No backend/proxy exists; app cannot be made safe without new infrastructure

Confirmed via search: no `server/`, `backend/`, `api/`, or equivalent directory anywhere in the repo; `package.json` has no server framework (no `express`, `fastify`, `hono`, etc.) and no deployment target for one. `vite.config.ts` is a pure static-site config. This means the exposure in 2.1 isn't a config mistake fixable by hiding an env var better — there is currently no code path capable of holding the key safely.

### 2.3 HIGH — No rate limiting or cost controls anywhere

Grepped for `rateLimit`, `throttle`, `debounce`, `cooldown` — no matches. Every "Regenerate" button, and the open-ended Job Coach chat input, can be clicked/submitted without limit, each call billed against whichever key is configured. Combined with 2.1 (public key) and 2.6 (Opus-tier model), this is a direct, unauthenticated cost-drain vector: a hostile actor doesn't even need to be a user of the app — they only need the extracted key.

### 2.4 MEDIUM — Built `dist/` output is committed to git

`git ls-files dist` shows `dist/assets/index-BajfMxTX.js`, `dist/assets/index-Cbgymy4e.css`, `dist/index.html` are tracked. I confirmed this specific committed bundle does **not** contain a literal leaked key today (it was built with `VITE_ANTHROPIC_API_KEY` unset, so the header ships as `'x-api-key': ''`). But the practice itself is a hazard: if anyone runs a local build with a real key in their shell/`.env.local` and commits `dist/` again (there is no `.gitignore` entry for `dist/` or for `.env*` — checked `.gitignore`, it only excludes `expo-env.d.ts`), the key ships to every git-history observer permanently, not just current visitors.

### 2.5 MEDIUM — Mobile (Expo/React Native) build path is likely broken for all AI features

The product is described in `README.md` as "a mobile app (Expo)" with `expo-router/entry` as `package.json`'s `main`. But `import.meta.env.VITE_ANTHROPIC_API_KEY` is Vite-specific; Expo/Metro does not populate `import.meta.env` the same way (Expo's convention is `process.env.EXPO_PUBLIC_*`). On an actual device build, `import.meta.env` is likely `undefined`, so `.VITE_ANTHROPIC_API_KEY` throws or evaluates to `undefined`, `x-api-key` becomes `''`, Anthropic returns 401, and the UI shows the generic localized "Error — please try again" (`AISummarySheet.tsx:78`, and equivalent in the other 6 files) — with no indication to the user or developer that the root cause is a missing key rather than a network blip. This needs verification against an actual Expo build, but nothing in the code suggests it was accounted for.

### 2.6 LOW/MEDIUM — Cost inefficiency: Opus-tier model hardcoded for small bounded tasks

All 7 call sites hardcode `model: 'claude-opus-4-5'` (`max_tokens` 400–900). Opus is the most capable/expensive tier; tasks like "write a 3-4 line CV summary" or "give 3 short skill-gap tips" are exactly the kind of low-complexity, bounded-output task that would run acceptably on a cheaper/faster model. This isn't a launch-blocker by itself, but combined with §2.3 (no rate limiting) it multiplies the blast radius of any abuse.

### 2.7 LOW — Output validation is minimal but not exploitable

`CVScoreSheet.tsx:58-59`, `SkillsGap.tsx:95`, `InterviewPrep.tsx:68` all do `JSON.parse(text.replace(/```json|```/g, '').trim())` on raw model output with only markdown-fence stripping, no schema validation (no zod/ajv, no bounds-checking on `overall` 0-100, no array-length checks). A malformed or adversarially-crafted response throws inside the `try/catch` and falls back to a generic error state — so this fails safe rather than rendering garbage or crashing the app. Because React escapes all rendered text by default, there is no XSS path even if Claude were tricked into returning HTML/script content. Acceptable for now; would want real schema validation (zod) before scaling.

### 2.8 LOW — Prompt injection surface from user-supplied CV text

Free-text CV fields (experience descriptions, summaries) are interpolated directly into prompts with no sanitization (e.g. `AISummarySheet.tsx:26-52`, `JobCoach.tsx:38-56`). Because model output here is only ever *displayed* (never executed, never used to trigger app actions or tool calls), the practical risk is limited to content-integrity issues — a user could try to manipulate their own CV summary or cover letter into saying something off-brand or nonsensical. Not a system-compromise vector. Low priority relative to the key-exposure issue.

---

## 3. Branding / trust risk (non-technical, but launch-relevant)

The app markets itself with "Claude AI · Anthropic" labels directly in the UI (`AISummarySheet.tsx:107`, `CVScoreSheet.tsx:95`, `JobCoach.tsx:114`, `CoverLetterSheet.tsx:137`, `ApplicationLetterSheet.tsx:151`, plus the `src/imports/` duplicates). Because the underlying calls are genuinely hitting Anthropic's API, the branding is **not currently false** — but it is being made true through a use of the Anthropic API that Anthropic's own API explicitly gates behind a "dangerous" opt-out flag intended for local prototyping, not for a public-facing product with real users. Shipping this as-is risks two distinct failure modes simultaneously:
1. **Technical/financial:** key theft and uncontrolled billing (§2.1, §2.3).
2. **Trust/compliance:** if the exposed key gets abused, rate-limited, or suspended by Anthropic for policy violations, every "Claude AI"-branded feature in the app breaks live for all users at once — the CV builder's flagship AI features (US-004, US-009, US-013, US-014, US-024 per the PRD) would fail simultaneously and visibly, with the brand name attached to the failure.

---

## 4. Recommendation

### What real integration requires (right-sized, not a rewrite)

1. **Stand up one thin backend endpoint** that holds the Anthropic key server-side and proxies requests — e.g. a single Cloudflare Worker, Vercel serverless function, or one Express/Fastify route (`POST /api/ai/generate`). This is genuinely small:
   - One handler that accepts `{ type, prompt, lang }` (or just forwards a system+user message), calls Anthropic server-side using the **actual `@anthropic-ai/sdk` package that's already in `package.json` but currently unused**, and returns the text/JSON to the client.
   - Swap all 7 client call sites from the direct `fetch('https://api.anthropic.com/...')` pattern to `fetch('/api/ai/generate', ...)`. This is a mechanical, low-risk change — the prompt-construction logic in each component stays exactly as-is; only the transport target changes.
   - Remove `anthropic-dangerous-direct-browser-access` and `VITE_ANTHROPIC_API_KEY` from client code entirely once the proxy is live.
   - Add basic per-IP or per-device rate limiting at that one endpoint (even an in-memory sliding window is enough for V1; Cloudflare/Vercel both have built-in primitives for this).
   - **Estimated effort: roughly 0.5–1 day** for someone familiar with the stack — it's one new endpoint plus seven mechanical call-site edits, not new architecture.
2. **Fix the Expo/mobile path separately** — once server endpoint exists, mobile calls it the same way web does (no env-var exposure question on-device at all, since the key never needs to reach the client on any platform). This removes the `import.meta.env` vs `process.env.EXPO_PUBLIC_*` mismatch as a side effect rather than requiring a separate fix. Budget another half day to verify against an actual Expo build.
3. **Add minimal output validation** (zod schema on the JSON-consuming responses: CV score, skills-gap tips, interview questions) — small addition, do it while touching these call sites anyway.
4. **Decide the model tier deliberately** rather than defaulting to Opus everywhere — cheaper/faster models are plausibly sufficient for short bounded outputs like summaries and tips; keep Opus (or your best model) for the more open-ended Job Coach chat if desired.

### What NOT to do

- Do **not** re-add a client-embedded key "temporarily" or "just for the demo" once the proxy exists — that's exactly the current state and it's already proven to leak into a committed build artifact.
- Do **not** keep `anthropic-dangerous-direct-browser-access` in anything that will see real user traffic; it is only appropriate for local, single-developer prototyping.
- Do **not** ship a mobile build assuming the Vite-era env wiring works — verify on-device before claiming AI features work cross-platform.

---

## 5. Launch verdict

**Can the "Claude AI"-branded features ship this week as currently wired? No.**

The AI itself works and is genuine — this is not a "the AI is fake" problem, it's a "the AI is real but insecurely and incompletely wired" problem. Shipping today means shipping a publicly extractable Anthropic API key with no rate limiting, no cost ceiling, and (probably) no functioning mobile path despite mobile being the app's primary stated platform.

**Conditions under which it would be honest and safe to ship this week:**
- A server-side proxy is stood up (§4.1) — this is the one non-negotiable blocker, and it is genuinely small (well within a week, likely under a day of focused work).
- The client-side key and the `dangerous-direct-browser-access` header are removed entirely, not just supplemented.
- Basic rate limiting exists on the new endpoint.
- The mobile (Expo) path is verified against the same endpoint before claiming feature parity with web.

Once those four items land, the existing prompt-construction and UI logic in all 7 components can ship unchanged — the branding would then be both technically accurate and safely implemented. Until then, the honest framing internally is: "Claude AI features are functional in the web preview build only, via an insecure direct-browser call not suitable for public users" — not "launch-ready."
