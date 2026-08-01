# Kazi AI — Full-Stack Engineering Audit

**Auditor:** Full-stack engineering specialist, launch-readiness audit team
**Scope:** Architecture coherence, code duplication/dead code, state management, dependency health, build verification, test/CI posture
**Date:** 2026-07-30

---

## Summary

Kazi AI is not one app with a web wrapper — it is **two independently hand-built applications** sharing a repo, a package.json, and a name. The Expo Router tree (`app/`, 3,727 lines) and the Vite web tree (`src/app/components/`, 9,795 lines) reimplement the same CV builder / jobs / interview-prep / profile features from scratch, in different UI primitives, against two different, hand-rolled state models with different persistence backends (AsyncStorage vs `localStorage`) and different field names for the same data (`CV.experience` vs `CVProfile.workExperience` vs a third, entirely dead `CVProfile` in `src/app/utils.ts`). Layered on top of that: 4,719 lines (~25% of the entire codebase) sit in `src/imports/` as orphaned Figma-Make export dead code that nothing imports; TanStack Query is installed and wired into a provider but has zero actual `useQuery`/`useMutation` call sites anywhere; and every AI feature (CV scoring, cover letters, interview prep, skills-gap coaching) calls `api.anthropic.com` **directly from client code** with a key baked in via `EXPO_PUBLIC_`/`VITE_` env vars, which is extractable by any user in both the web bundle and the compiled mobile binary. The Vite web build does succeed cleanly (609KB main chunk, 18s), but `tsc --noEmit` under the repo's own `strict: true` config produces 211 errors, including a path-alias misconfiguration that makes the type checker unable to resolve most of the live web component tree at all. There are zero test files and zero CI workflows, so none of this — the build, the type errors, or a future regression — is verified automatically anywhere.

---

## Findings by Severity

### Blocker

**B1. AI API keys are shipped to the client on both targets — full key exfiltration is trivial**
- Evidence: `app/(tabs)/jobs.tsx:395`, `app/(tabs)/prep.tsx:14`, `app/(tabs)/index.tsx:59,84` — `'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? ''`
- Evidence: `src/app/components/builder/{AISummarySheet,CVScoreSheet,InterviewPrep,JobCoach,SkillsGap}.tsx`, `src/app/components/jobs/{CoverLetterSheet,ApplicationLetterSheet}.tsx` — `'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || ''`
- All 9 call sites also set `'anthropic-dangerous-direct-browser-access': 'true'` and call `https://api.anthropic.com/v1/messages` directly from the browser/RN runtime.
- Why it matters: `EXPO_PUBLIC_*` and `VITE_*` prefixed env vars are inlined into the client bundle at build time by design — that's what the prefix means. Whatever key is set in CI/build config ends up in plaintext inside `dist/assets/*.js` for the web build and inside the compiled RN bundle for mobile. Any user can open devtools/network tab or unpack the app and get a live Anthropic key with no rate limiting on their end. This is a direct path to an unbounded billing bill or account suspension for ToS violation, and it affects **every** AI feature in the app (CV scoring, cover letters, interview prep, skills-gap coach) — i.e., the app's core value proposition.
- Fix: Stand up a minimal backend proxy (even a single serverless function) that holds the key server-side, and have the client call that instead. This blocks launch until resolved — there is no safe way to ship this pattern to production users.

**B2. README quickstart is broken — 2 of 3 documented commands do not exist**
- Evidence: `README.md` says `npm run dev # or: npm run android / npm run ios`; `package.json` scripts block is `{"build": "vite build", "dev": "vite"}` — no `android` or `ios` script exists.
- Why it matters: In a week-long push, any new contributor or the client's own team following the README will hit `npm error Missing script: "android"` on their first command. `npm run dev` is also silently wrong in intent — it launches the Vite **web** target, which `metro.config.cjs` itself labels "old web app" (see A1 below), not the Expo/RN target the app.json and README screenshot describe as the product.
- Fix: Add `"start": "expo start"`, `"android": "expo run:android"`, `"ios": "expo run:ios"` scripts, and rewrite the README quickstart to point at the actual shipping target.

### High

**H1. Two fully independent app implementations, not a shared core with two renderers**
- Evidence: `context/AppContext.tsx` (213 lines, AsyncStorage, type `CV`) is the state layer for `app/` (Expo Router). `src/app/App.tsx` (326 lines, `localStorage`, type `CVProfile`) is a completely separate, independently-written state layer for `src/app/components/*` (Vite web). `app/` has zero imports from `src/` (verified via `grep -rn "from ['\"]@/app\|from ['\"]\.\./src" app/` — no matches).
- Field-level drift example: `CV.experience: WorkExperience[]` (context/AppContext.tsx) vs `CVProfile.experience` (src/app/App.tsx, has extra `certificates` field) vs `CVProfile.workExperience` (src/app/utils.ts, a third, entirely dead definition — see M1).
- Why it matters: every feature — CV builder, AI summary, cover letter generation, interview prep, skills gap, salary guide — exists as two hand-maintained code paths with two independent sets of bugs. A fix or content update made in one (e.g. a prompt tweak in `InterviewPrep.tsx`) will not propagate to the other. This roughly doubles the surface area that needs review, QA, and maintenance for the exact same feature set, at a moment when the client wants to launch in a week.
- Fix: Before launch, get an explicit answer to "which target actually ships" (see A1) and either deprecate/hide the other target's routes or treat it as an intentionally maintained second product with its own QA pass — not silently ignore the drift.

**H2. `tsc --noEmit` produces 211 errors under the repo's own `strict: true` config**
- Evidence: `npx tsc --noEmit` (run from repo root) → 211 errors: 70× `TS2307` (cannot find module), 118× `TS7006` (implicit `any`), plus `TS2339`/`TS2551`/`TS2304`/`TS2740`/`TS2741`.
- Root cause of the bulk (70 `TS2307`s): `tsconfig.json` sets `"@/*": ["./*"]` (alias → repo root) while `vite.config.ts` sets `'@': path.resolve(__dirname, './src')` (alias → `src/`). The two build tools disagree on what `@/app/App` means. Vite resolves it correctly at build time (hence the build succeeds), but `tsc` cannot, so the type checker cannot see across nearly the entire `src/app/components/` tree — e.g. `src/app/components/MainApp.tsx(4,24): error TS2307: Cannot find module '@/app/App'`.
- The remaining errors are real, live-code bugs, not just alias noise — e.g. `src/app/components/jobs/SalaryGuide.tsx(150,89): error TS2551: Property 'coralD' does not exist on type '{...}'` (the file's local color palette object is missing a key it references, so that UI state silently renders an invalid CSS color at runtime) and 118 implicit-`any` parameters across live builder/jobs/profile components.
- Why it matters: `strict: true` is set but is not actually enforced by anything (no CI, and even run locally it's currently non-functional due to the alias bug), so it provides zero real protection today. A type error masquerading as "fine" because nobody runs the checker is exactly the kind of bug that ships silently during a rushed week.
- Fix: Align the `@` alias between `tsconfig.json` and `vite.config.ts` (point both at `src/`, or make `vite.config.ts`'s alias match tsconfig's root-based mapping), then re-run `tsc --noEmit` and fix the genuine errors that remain (implicit-any params, the color-palette typos).

**H3. Zero tests and zero CI — no automated safety net for a week-long push**
- Evidence: `find . -name "*.test.*" -o -name "*.spec.*"` → no results (excluding node_modules). `.github/` contains only `CODEOWNERS` and `dependabot.yml`; `.github/workflows/` does not exist.
- Concretely, for this week: every merge to the shipping branch is verified by nothing but a human eyeball. Nobody will catch a broken `pnpm run build`, a newly-introduced `tsc` error, a runtime crash in the AI call path, or a regression in either of the two parallel app implementations (H1) until a person manually clicks through the app — and given H1, they'd need to manually click through **both** implementations to be sure. There is no PR gate stopping a broken build from being merged, no smoke test confirming the Anthropic call path still returns valid JSON, and no regression test protecting the AsyncStorage/localStorage persistence logic that holds users' CV data.
- Fix, scoped to what's realistically achievable this week: (1) one GitHub Actions workflow that runs `pnpm install`, `pnpm run build`, and `tsc --noEmit` on every PR — this alone would have caught H2 and any future build break automatically, and is roughly an hour of work; (2) a small number of smoke tests on the state-persistence reducers in `context/AppContext.tsx` (pure functions, easy to test, protect the CV data users will be trusting the app with) if time allows. Full component/E2E coverage is not realistic in a week and shouldn't be the goal — the build+typecheck gate is the highest-leverage single addition.

### Medium

**M1. `src/imports/` is 4,719 lines (~25% of the codebase) of fully orphaned dead code**
- Evidence: `grep -rl "from ['\"].*imports/"` across the entire repo (excluding `src/imports` itself) → **zero matches**. Nothing anywhere imports anything from `src/imports/`.
- The directory is a raw, untouched Figma Make export: it contains its own `index.html`, `main.tsx`, `App.tsx`, `postcss.config.mjs`, and even a `vercel.json` — effectively a whole miniature duplicate project nested inside the real one, left over from whenever `src/app/components/` was forked off of it and hand-organized.
- A third, also-dead, parallel data model lives at `src/app/utils.ts` + `src/app/types.ts` (`defaultProfile`, `seedJobs`, a `CVProfile` type with `fullName`/`workExperience` field names that match neither of the two live models). `grep` confirms nothing imports `src/app/utils.ts`'s `seedJobs`/`defaultProfile` exports, and `src/app/types.ts` is only referenced by that dead file. Unlike `src/imports/`, this one sits directly inside the live `src/app/` tree, so it's easy for a developer to mistake it for real, load-bearing code.
- Why it matters: for a codebase this size (19,247 lines total), having a quarter of it be confirmed-dead is a real cost during a rushed week — it's noise in every grep, every "find all usages," every code review, and every onboarding read-through, and the `src/app/utils.ts` case specifically risks someone editing dead code and wondering why nothing changes.
- Fix: Delete `src/imports/` outright (git history preserves it if ever needed) and delete `src/app/utils.ts` + `src/app/types.ts`.

**M2. TanStack Query is installed, provided, and never used**
- Evidence: `@tanstack/react-query@^5.100.9` is a dependency; `lib/queryClient.ts` defines a `QueryClient`; `app/_layout.tsx` wraps the whole app in `<QueryClientProvider client={queryClient}>`. `grep -rl "useQuery\|useMutation\|useQueryClient"` across the repo (excluding `lib/queryClient.ts` itself) → **zero matches**.
- Why it matters: not a bug per se (there's no backend to query, consistent with the known-facts brief), but it's a live-but-pointless provider wrapping the entire component tree, and its presence signals a data-fetching layer that doesn't actually exist — anyone reading `app/_layout.tsx` would reasonably assume network data is flowing through it. When the backend from the README roadmap ("Wire a real job-listing/company data source") does get built, this scaffolding may or may not still fit the shape needed.
- Fix: no action required before launch; flag it for whoever wires up the real backend so they know the plumbing is there but unvalidated.

**M3. Unused heavy dependencies bloat `node_modules` and the audit/attack surface**
- Evidence (single-pass grep across all `.ts`/`.tsx`, excluding `node_modules`/`.git`/`dist`, for import specifiers): `@mui/material`, `@mui/icons-material`, `react-router`, `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `react-responsive-masonry`, `canvas-confetti`, `next-themes`, `@popperjs/core`, `react-popper`, `motion`, `date-fns`, `@emotion/react`, `@emotion/styled` — **zero import sites for any of them** anywhere in the live code.
- These do not bloat the shipped web bundle (Rollup/Vite tree-shakes unimported packages out entirely — confirmed by the 609KB build output), but they do bloat `pnpm install` time, `node_modules` size (@mui alone pulls several MB across its sub-packages), and the dependency graph Dependabot has to track for CVEs on packages nobody uses.
- Fix: low priority for this week specifically, but a 10-minute `pnpm remove` pass on the confirmed-zero-usage list would shrink install time and Dependabot noise with no functional risk (nothing imports them).

**M4. pnpm config drift — declared version pins are silently not applied**
- Evidence: `pnpm install` and `pnpm run build` both emit `[WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.overrides"`. The intended overrides (`vite: 6.3.5`, `react-native-worklets: 0.7.4`) are not present in `pnpm-workspace.yaml` either, so they are not applied at all with the installed pnpm (v11.18.0).
- Additionally, `pnpm-workspace.yaml`'s `allowBuilds` block is left as placeholder text (`'@tailwindcss/oxide': set this to true or false`), which is causing `pnpm install` to skip native build scripts for `@tailwindcss/oxide` and `esbuild` (`[ERR_PNPM_IGNORED_BUILDS]`), and is why `pnpm run build` / `pnpm run dev` fail outright in this environment (they invoke an internal dependency-status check that errors out on the ignored builds) — the Vite build above only succeeded by invoking `./node_modules/.bin/vite build` directly, bypassing pnpm's script runner.
- Why it matters: whoever set the version pins clearly had a reason (React 19 / RN 0.83 / Expo 55 is bleeding-edge, per the known-facts brief, and pinning `react-native-worklets` in particular suggests a known compatibility issue was being worked around). With pnpm silently ignoring that pin, a `pnpm install` today can resolve a different `react-native-worklets`/`vite` version than whatever was validated, and `pnpm run build`/`pnpm run dev` are currently broken as documented commands in this exact checkout.
- Fix: move the overrides into `pnpm-workspace.yaml`'s `overrides:` key (the new location per pnpm's own warning) and set `allowBuilds` to explicit `true`/`false` values instead of the placeholder text.

### Low

**L1. Built `dist/` output is committed to git and was already stale**
- Evidence: `git status --short` before this audit's build run showed `dist/assets/index-BajfMxTX.js` and `dist/assets/index-Cbgymy4e.css` as tracked-but-deleted and `dist/index.html` as modified the moment a fresh `vite build` ran — i.e., the committed `dist/` did not match current `src/`.
- Fix: add `dist/` to `.gitignore` and stop committing build output; it's regenerated by `pnpm run build` and only adds merge-conflict risk and repo bloat.

**L2. `useColors()` hardcodes light mode regardless of device setting**
- Evidence: `hooks/useColors.ts` — `export function useColors(): ColorScheme { return Colors.light; }`. Consistent with `app.json`'s `"userInterfaceStyle": "light"`, so likely intentional for now, but worth flagging since it means any future dark-mode work has a hook that looks live but is a no-op.

**L3. Per-component copy-pasted color palettes have already drifted**
- Evidence: `src/app/components/jobs/ApplicationLetterSheet.tsx:7` defines a local `const C = {...}` with a `coralD` key; `src/app/components/jobs/SalaryGuide.tsx`'s own local `C` object (same pattern, separately defined) is missing that key, which is the direct cause of the `TS2551` error in H2. Each file in `src/app/components/**` defines its own copy of the same ~10-color palette instead of importing a shared theme module.
- Fix: extract one shared color/theme module and import it everywhere instead of redefining `const C = {...}` per file — this is both a dedup and a correctness fix (would have caught the missing `coralD` at the source).

### Nitpick

**N1.** `package.json`'s `name` field is still `"@figma/my-make-file"` — cosmetic, but a visible tell (in any published package metadata, error stack traces referencing the package name, etc.) that this hasn't been renamed since the Figma Make export.

**N2.** No `engines` field in `package.json` to pin a Node version, in a repo already juggling several bleeding-edge, closely-coupled native package versions (React 19.2 / RN 0.83.6 / Expo 55.0.23) — worth pinning so `pnpm install` behaves consistently across whoever touches this during the week.

---

## Build Verification Results

| Check | Result |
|---|---|
| `pnpm install` | Succeeds (dependencies already resolved from lockfile); emits pnpm-field and ignored-build-script warnings (see M4) |
| `pnpm run build` (as documented) | **Fails** — errors out via an internal `pnpm install` dependency-status check triggered by the unresolved `allowBuilds` placeholders (M4) |
| `./node_modules/.bin/vite build` (direct invocation, bypassing pnpm's script runner) | **Succeeds** — `dist/index.html` 2.15kB, `dist/assets/index-*.css` 91.90kB (15.38kB gzip), `dist/assets/index-*.js` 609.69kB (173.23kB gzip), built in 18.02s. One warning: main JS chunk exceeds Rollup's 500kB guidance, suggesting no code-splitting is in place. |
| `npx tsc --noEmit` | **211 errors** under `strict: true` — see H2 for breakdown and root cause |
| Expo/RN build | Not attempted (no `android`/`ios`/`start` script exists to invoke — see B2; would require `npx expo start`/`expo run:*` directly, out of scope for a non-interactive build check) |

---

## Launch Verdict

**Not ready to ship as-is; the AI-key exposure (B1) is a hard blocker on its own, and the two-implementations problem (H1) means "did we test the app" is actually two separate questions.** The good news: the web build genuinely compiles, the Expo Router state layer (`context/AppContext.tsx`) is clean, well-typed, and persists correctly via AsyncStorage, and most of the "bad" findings here (dead code, unused deps, tsc noise) are cheap to fix and don't block a release on their own. The must-fix-before-launch list is short: (1) move the Anthropic API calls behind a server-side proxy — this is non-negotiable, every AI feature currently leaks a live API key to every user; (2) get an explicit, single answer on which target (Expo/RN or Vite/web) is actually shipping this week, and stop actively maintaining the other as if it were equally real; (3) fix the README/package.json script mismatch so the team can actually run the thing they're trying to launch; (4) add one CI workflow that runs build + typecheck on every PR, so the next five days of rushed commits have at least one automated check instead of zero. None of these are multi-day efforts individually, but B1 in particular cannot ship to real users in its current form regardless of timeline pressure.
