# Kazi AI — Ordered Launch Work Plan

Derived from `AUDIT_MASTER.md` and the six track reports. Ordered by what has to happen before what — not by severity alone. Target: public app store release (per client decision, 2026-07-30), tracked against the reality that store review + full readiness realistically extends past this week; see Phase 3.

Status legend: ⏳ not started · 🔧 in progress · ✅ done

---

## Phase 0 — Security-critical, blocks any real user ever seeing this app (~1 day)

| # | Item | Owner track | Est. | Status |
|---|---|---|---|---|
| 0.1 | Backend AI proxy — move Anthropic key server-side, remove `anthropic-dangerous-direct-browser-access` and all client key reads | Security / ML-AI / Full-Stack | 0.5–1 day | ✅ done — verified: build is key-free, server tested locally |
| 0.2 | `.gitignore` env-file coverage; untrack committed `dist/`; also added missing `node_modules/` entry (found while doing this — was never gitignored) | Security | 15 min | ✅ done |
| 0.3 | Fix `pnpm-workspace.yaml` placeholders + overrides location so `pnpm run build`/`dev` actually work as documented | Full-Stack | 15 min | ✅ done — verified: `pnpm install` and `pnpm run build` both succeed clean |
| 0.4 | Add missing `expo start`/`android`/`ios` scripts so the README quickstart actually works | Full-Stack | 5 min | ✅ done |
| 0.5 | Bump `react-router` to ≥7.15.1; `pnpm audit fix` pass on the rest | Security | 1–2 hr | ✅ done, with a correction — verified `react-router` has **zero** import sites and **zero** presence in the built bundle (the security audit's "shipped in the runtime bundle" claim was wrong; full-stack's "unused dependency" claim was right). Removed it entirely rather than bumping — cleaner fix, no CVE surface left. Also overrode `tar`, `ws`, `shell-quote` to patched versions via `pnpm-workspace.yaml`. Result: 44 → 24 vulnerabilities, **0 critical** (was 2), 12 high (was 15+react-router's). Remaining are all transitive Expo/Metro/Vite dev-tooling deps, not shipped to end users. Build re-verified clean after. |

## Phase 1 — Honesty/trust fixes, before any outside eyes (~1 day)

| # | Item | Owner track | Est. | Status |
|---|---|---|---|---|
| 1.1 | Remove or clearly relabel fabricated company "employee reviews" (`companies.tsx`) | Product / UI-UX / Research | 1–2 hr | ✅ done — banner + per-review "sample" tag + reworded footer, bilingual |
| 1.2 | Fix hardcoded `', 2026'` job/event deadlines — compute relative to `Date.now()` | UI-UX | 1–2 hr | ✅ done — `jobs.tsx` resolves to nearest upcoming occurrence, `prep.tsx` events computed as day-offsets from today; both self-adjust every year now |
| 1.3 | Wire "View Careers Page" `onPress` (one line) | UI-UX | 5 min | ✅ done |
| 1.4 | Add confirm dialogs to destructive CV deletes (experience/education/reference/skill) | UI-UX | 1 hr | ✅ done — shared `confirmDelete()` helper, applied to all 4 handlers in `index.tsx`, verified with `tsc` |
| 1.5 | Fix or relabel "Register" for events — persist to `AppContext`, or rename to "Remind me" | UI-UX | 1–2 hr | ✅ done — relabeled to "I'm interested" (honest about being a local, in-session toggle; did not add persistence — lower-risk path per the audit's own minimum bar) |
| 1.6 | Add "AI estimate — not verified against real hiring outcomes" disclaimer to CV Score, job match, salary guide | Product / Research | 1 hr | ✅ done — CV Score modal + Salary Guide modal, bilingual |
| 1.7 | Relabel job listings as sample/illustrative until real data source lands; stop "Apply Now" implying a specific real vacancy | Product / Research | 2–3 hr | ✅ done — "sample opportunities" label, "Apply Now" → "Go to Careers Page", added disclosure that the specific listing is illustrative |
| 1.8 | Decide + execute: Expo Router app is canonical (per README/package.json); archive `src/app/` + `src/imports/` or explicitly mark them non-shippable | Full-Stack / UI-UX / Product | decision + 1 hr | ✅ **decided and executed, 2026-08-01** — see "1.8 decision" section below |

---

## 1.8 decision: Expo Router is canonical (2026-08-01)

**Decision, given the client wants App Store + Play Store distribution:** the Vite tree (`src/app/`) has no path to either store — it's a plain web SPA, not a native build. The Expo Router app (`app/`) is the only tree EAS Build can turn into an `.ipa`/`.aab`. Not a close call.

**Executed:**
- Deleted `src/imports/` outright — confirmed 100% dead (zero import sites anywhere, including byte-identical duplicate files and one stray misplaced file from an unrelated project).
- Moved `src/app/`, `src/lib/`, `src/styles/`, `src/main.tsx`, root `index.html`, `vite.config.ts`, `postcss.config.mjs`, and the dead `default_shadcn_theme.css` into `_archive/vite-web-prototype/` (with its own README explaining why). Verified zero cross-imports between `app/` and `src/` in either direction before moving.
- Removed the now-unused `vite`/`tailwindcss`/`@tailwindcss/vite`/`@vitejs/plugin-react` devDependencies and the `build`/`dev` npm scripts. Added `npm run web` (Expo's own web target via `react-native-web`, already a dependency) as the honest replacement if a web version is ever wanted — shares code with the native app instead of duplicating it.
- Simplified `server/index.js` to a pure API proxy (dropped the static-file-serving of a `dist/` folder nothing produces anymore).
- Fixed `tsconfig.json` to exclude `_archive/` from type-checking, `.replit`'s deployment build step (referenced the now-removed `build` script), and `README.md`'s quickstart + folder overview (which was pointing at the *dead* tree as if it were where the CV builder lived).
- **Side benefit:** `@tailwindcss/oxide` and `esbuild` dropped out of the dependency tree entirely along with Vite/Tailwind, which also eliminated the `tar` CVE that came in through that exact path. Vulnerabilities: 24 → 17 → 16 (0 critical throughout this step).

### Two things found while verifying this, not previously caught by any of the 6 audits (none had attempted an actual native build)

**Fixed: `@expo/vector-icons` was never a declared dependency.** Every screen imports `Ionicons` from it, but it only existed as a *transitive* dependency of `expo` — pnpm's strict `node_modules` layout doesn't expose transitive packages for direct import, so **the app could not actually run at all** before this fix (Metro would fail to resolve the module on load). Added it explicitly to `package.json` at the already-resolved version (`15.1.1`). Verified fixed: `npx expo export -p web` now bundles cleanly (1377 modules) with all icon fonts resolving.

**NOT fixed — new Blocker, needs attention before any store build: native (iOS/Android) bundling currently fails.** `npx expo export -p android` (and `-p ios` separately) both crash with `SyntaxError: ... Cannot read properties of null (reading 'loc')` while parsing React Native's own internal codegen spec files (hit `VirtualView(Experimental)NativeComponent.js` and separately `react-native-safe-area-context`'s `NativeSafeAreaView.ts` across different attempts — the crash moves to a different file depending on exact dependency versions, which points to a `@babel/core`/parser-level bug, not a problem in any one package). The web export works fine, which is why none of this showed up until a native export was actually attempted.
- Confirmed this is **not** a simple version mismatch: `expo@55.0.23`'s own `bundledNativeModules.json` lists `react-native: 0.83.6` as the expected pair, and that's exactly what's installed.
- Tried bumping `babel-preset-expo` to its latest 55.x patch (55.0.24) — crash persisted, moved to a different file.
- Tried bumping `@babel/core` to its latest 7.x patch (7.29.7) — crash persisted.
- Reverted both bumps (no benefit, only deviates from Expo's tested pairing) rather than keep guessing through version combinations.
- **This is the actual, current blocker on the App Store / Play Store goal** — everything else in this plan can be true and this alone still stops a store submission, since there's no build to submit.

**Update, same day — tried EAS Build, hit an account wall; narrowed the cause further:**
- `eas whoami` / `eas build:configure` both require an interactive login (`stdin is not readable` in this environment) — I cannot authenticate as you, and won't handle Expo account credentials even if provided. **You need to run `eas login` yourself** (interactive terminal), then either run `eas build:configure && eas build --platform android` directly, or hand it back to me once logged in.
- Ruled out cache corruption: cleared Metro's transform cache entirely and rebuilt from cold — identical crash.
- New lead, not yet tested: local Node.js is **v24.11.1**. React Native's own `package.json` only declares `"node": ">= 20.19.4"` — that's a floor, not confirmation that the very newest Node major has been validated against this specific bleeding-edge SDK 55 / RN 0.83.6 pairing. Metro/Babel's parser internals have a history of being sensitive to exactly this kind of "newer Node than the toolchain has caught up to" gap.
- **Recommended next step, in order of effort:** (1) once you're logged into EAS, try a real `eas build` — it runs in Expo's own cloud environment with its own Node/toolchain, so if it succeeds despite the local failure, this was a local-environment issue and you're unblocked without touching Node at all; (2) if EAS also fails with the same error, try building locally under Node 20 or 22 LTS (via `nvm`) to test the Node-version hypothesis directly.

### Unrelated but worth knowing: your Mac's disk is at 100% capacity

Found while working in `~/Desktop/Projects/kazi-ai` — only 4.5GB free out of 926GB, with "Desktop & Documents" iCloud sync on. This caused real, repeated file-read timeouts during this session (files becoming iCloud-only "dataless" placeholders) and at least one outright failed iCloud upload (CloudKit error, 18 failed attempts). **Moved the whole project to `~/dev/kazi-ai`** (outside iCloud sync) to fix this for good — confirmed instant, reliable file access there afterward. The original copy is still sitting at `~/Desktop/Projects/kazi-ai`, fully intact; I left it rather than deleting a large directory tree myself, but it's now a duplicate and safe to remove once you've confirmed `~/dev/kazi-ai` is what you're using (`rm -rf ~/Desktop/Projects/kazi-ai` — do this yourself, or ask me to when you're ready). Separately from this repo: a near-full disk is a real risk for the Xcode/EAS build work still ahead — worth freeing up space and/or excluding your dev folder from iCloud sync before going further.

---

## Phase 2 — Required before any store submission (multi-day)

| # | Item | Owner track | Est. | Status |
|---|---|---|---|---|
| 2.1 | Real privacy policy + in-app consent before first AI call / first PII storage (store-mandatory) | Security | 0.5–1 day + legal review | ⏳ |
| 2.2 | Google Play Data Safety form / Apple privacy nutrition label, matching what's actually collected/sent to Anthropic | Security / Product | 2–4 hr | ⏳ |
| 2.3 | Fix `tsc --noEmit`'s 211 errors (alias mismatch root cause + real bugs it's hiding) | Full-Stack | 1 day | ⏳ |
| 2.4 | Minimal CI: build + typecheck on every PR | Full-Stack | 1 hr | ⏳ |
| 2.5 | PDF export (PRD's own P0, "most critical missing feature") | Product / Full-Stack | multi-day | ⏳ |
| 2.6 | Accessibility pass: `accessibilityLabel`/`accessibilityRole` on primary flows | UI-UX | 0.5–1 day | ⏳ |
| 2.7 | Confirm Apple/Google developer account, certificates, store listing assets (icons, screenshots) are actually ready | Product | unknown — depends on current state | ⏳ **needs your input** |
| 2.8 | Kiswahili content coverage pass (job/company content, templates, status labels currently English-only) | UI-UX / Product | 0.5–1 day | ⏳ |

## Phase 3 — Real data & validation (weeks–months, not this launch)

| # | Item | Est. |
|---|---|---|
| 3.1 | Real job-listing data pipeline (licensed/scraped ingestion, dedup, refresh cadence, ToS review) | weeks–months |
| 3.2 | Sourced, cited, dated salary benchmarks (government data minimum bar, or crowdsourced with disclosed sample size) | 1–3 weeks (coarse) to 1–2 months |
| 3.3 | CV-scoring rubric + labeled eval set + eval harness against real recruiter/hiring outcomes | 2–6 weeks for v1; multi-month for the README's own "validated against real hiring outcomes" bar |

---

## What's happening right now

**0.1–0.4 are done and verified.** See the "What changed" note at the bottom of `AUDIT_MASTER.md`-adjacent context, or just the summary below. Next up is **0.5** (react-router bump + audit fix) and **Phase 1** (honesty/trust fixes), pending your go-ahead — 1.8 in particular needs your decision before any further work touches the Vite tree.

### What changed (0.1–0.4)

- **New:** `server/index.js` — Express server holding `ANTHROPIC_API_KEY` server-side, exposes `POST /api/ai/generate`, rate-limited (20 req/10min/IP), serves the built `dist/` as static SPA.
- **New:** `lib/aiClient.ts` (Expo tree) and `src/lib/aiClient.ts` (Vite tree) — shared `callAI()` helper both trees now use instead of duplicated direct-fetch blocks.
- **Edited:** all 10 former direct-`api.anthropic.com` call sites (3 files in `app/`, 6 in `src/app/components/`) now call the proxy. Verified zero remaining `api.anthropic.com`, key, or `dangerous-direct-browser-access` references in either live tree, and zero leaked references in the actual built JS bundle (`grep`'d `dist/assets/*.js` after a real `pnpm run build`).
- **Fixed:** `.gitignore` (env files, `dist/`, and a previously-missing `node_modules/` entry — that last one was making every `git status` scan ~862MB/hundreds of thousands of files and hang), `pnpm-workspace.yaml` (`allowBuilds` placeholders resolved, `overrides` moved to its new required location), `package.json` (added `express`, added `start`/`android`/`ios`/`serve` scripts), `.replit` (deployment target changed to run the server; env var renamed off the `EXPO_PUBLIC_` prefix with a comment on why).
- **Untracked:** `dist/` removed from git's index (kept on disk, now gitignored).
- **New:** `.env.example` documenting the server-side `ANTHROPIC_API_KEY` var.
- **Verified end-to-end:** `pnpm install` → clean. `pnpm run build` → succeeds (previously broken — see 0.3). Started the real server locally: `/api/ai/generate` returns a clean `503` (not a crash) when no key is configured, `400` on a malformed request, `/` and SPA-fallback routes return `200`. `tsc --noEmit` error count went from 211 to 203 (no new errors from this work — the rest are the pre-existing alias-mismatch/implicit-any issues, item 2.3).
- **Not yet done:** nothing was actually deployed. You still need to set `ANTHROPIC_API_KEY` as a real secret in whatever host runs this (Replit Secrets if using Replit) — I don't have your credentials and wouldn't set a live key without you present regardless.

## Decisions only you can make (flagged inline above, repeated here)

- **1.8** — which app tree ships (recommend: Expo Router `app/`, delete/archive the Vite `src/app/` + `src/imports/` trees).
- **2.7** — current state of your Apple/Google developer accounts and store assets, which determines how much of Phase 2 is realistic before any store submission.
- Legal review for **2.1** (privacy policy, Tanzania PDPA 2022 applicability) — I can draft a starting policy, but this needs your/counsel's sign-off before it's real.
