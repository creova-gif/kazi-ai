# Kazi AI — Security Audit

**Auditor:** Security analyst, launch-readiness team
**Scope:** /Users/justinmafie/Desktop/Projects/kazi-ai (branch: `copilot/vscode-mpgdueco-6p31`, remote: `github.com/creova-gif/kazi-ai`)
**Date:** 2026-07-30

## Summary

No committed secrets were found in the working tree or full git history. However, the app calls `api.anthropic.com` directly from client-side JavaScript using `anthropic-dangerous-direct-browser-access: true` and reads the API key from a client-bundled env var (`EXPO_PUBLIC_ANTHROPIC_API_KEY` / `VITE_ANTHROPIC_API_KEY`) — and the `.replit` deployment config explicitly wires the real key into that exact variable for the production static build. If deployed as configured, Anthropic's key ships in plaintext inside the public JS bundle for anyone to extract. Separately, `.gitignore` has no env-file coverage at all, `dist/` build output is committed to git, `pnpm audit` reports 44 vulnerabilities (2 critical, 20 high), the app stores full CV PII (name, phone, email, references' contact info) in unencrypted AsyncStorage/localStorage with zero privacy policy or consent flow, and a 22KB proprietary PRD with monetization strategy sits in a public GitHub repo. None of these are exotic — they're all fixable within days, but several are launch blockers as-is.

## Findings

### Blocker

**B1 — Anthropic API key is designed to ship inside the public client bundle**
- Evidence: 10 files call `fetch('https://api.anthropic.com/v1/messages', ...)` directly from client code with header `'anthropic-dangerous-direct-browser-access': 'true'`, keyed by `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY` (Expo, inlined at build time) or `import.meta.env.VITE_ANTHROPIC_API_KEY` (Vite, also inlined at build time):
  `app/(tabs)/index.tsx`, `app/(tabs)/jobs.tsx`, `app/(tabs)/prep.tsx`, `src/app/components/builder/CVScoreSheet.tsx`, `AISummarySheet.tsx`, `InterviewPrep.tsx`, `JobCoach.tsx`, `SkillsGap.tsx`, `src/app/components/jobs/CoverLetterSheet.tsx`, `ApplicationLetterSheet.tsx` (plus duplicated copies under `src/imports/`).
- `.replit` confirms this is the intended production path: `[userenv.shared] EXPO_PUBLIC_ANTHROPIC_API_KEY = "USE_ANTHROPIC_API_KEY"`, and `[deployment] deploymentTarget = "static"`, `build = ["pnpm","run","build"]`, `publicDir = "dist"`. Both the `EXPO_PUBLIC_` and `VITE_` prefixes exist specifically so their bundlers inline the value into shipped JS — this is not a misconfiguration, it's the variable class working as designed against the wrong secret.
- I checked the currently-committed `dist/assets/index-*.js` bundle and found no live key baked in (it was built with the var unset), so there is no *currently leaked* key. But the architecture guarantees that the next production build with the real key set will embed it in a public static bundle, extractable via view-source in seconds by any visitor.
- Why it matters: anyone can steal the key and run unlimited (paid) requests against CREOVA's Anthropic account, or use the app as a free open proxy to Claude. There is no rate limiting, no auth, no per-user quota — just a bare fetch with a static key.
- Fix: remove all direct-from-client Anthropic calls before launch. Stand up a minimal backend/serverless endpoint (Cloudflare Worker, Vercel function, Supabase Edge Function, etc.) that holds the real key server-side, validates/sanitizes the prompt, and forwards the request. Delete every `anthropic-dangerous-direct-browser-access` usage and every client-exposed env var reference. If a backend can't be built before the launch deadline, ship with AI features disabled/mocked rather than with a live key in the client.

### High

**H1 — No PII protection: full CV data stored unencrypted on-device and sent to a third party with no privacy policy or consent**
- Evidence: `context/AppContext.tsx` persists the entire `CV` object (first/last name, phone, email, location, employer history, education, skills, and references' name/title/company/**phone**/email) to `AsyncStorage` in plaintext (`AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))`, line 159). The web path (`src/app/App.tsx`, `src/app/utils.ts`) does the same via plain `localStorage`. Every "AI Summary / Score / Interview Prep / Cover Letter / Skills Gap" action (see B1 file list) sends this CV content — name, education, skills, summary text — in the prompt body directly to `api.anthropic.com`.
- No privacy policy, terms of service, or in-app consent/notice was found anywhere in the repo (`grep -rli privacy` found only the PRD file, not a policy). Tanzania's Personal Data Protection Act, 2022 requires a lawful basis, user notice, and (for data controllers/processors) registration before processing personal data — this app collects and transmits real users' personal data (CVs are inherently PII-dense: names, contact info, employment history) with none of that in place. This is a compliance consideration, not legal advice — get counsel before launch given the target market.
- Why it matters: this is a career app for a vulnerable population (job seekers); a data breach or undisclosed third-party sharing (to Anthropic) is a real trust and legal exposure, and there's currently no user-facing disclosure that CV data leaves the device at all.
- Fix: add a real privacy policy and a consent step before the first AI call or before storing PII; consider `expo-secure-store` (encrypted) instead of plain AsyncStorage for reference contact info at minimum; get local legal input on PDPA 2022 applicability before collecting real users' CVs.

**H2 — 44 dependency vulnerabilities via `pnpm audit` (2 critical, 20 high, 18 moderate, 4 low)**
- Critical: `shell-quote` (GHSA-w7jw-789q-3m8p, via `react-native > react-devtools-core`) and `node-tar` (GHSA-23hp-3jrh-7fpw, via `@tailwindcss/vite`). Both are dev-tooling paths, not shipped to end users, but they're a supply-chain risk to the build pipeline.
- High, and runtime-relevant: `react-router` 7.13.0 (a direct dependency actually shipped in the web bundle) has multiple high-severity advisories at this version — unauth RCE via vendored turbo-stream deserialization (GHSA-49rj-9fvp-4h2h, needs >=7.14.2), XSS via `javascript:` redirect targets (GHSA-8646-j5j9-6r62, needs >=7.13.2 — already patched at time of writing but verify), and DoS via unbounded path expansion / reflected input (needs >=7.15.0). Also `vite` (dev-server arbitrary file read, GHSA-p9ff-h696-f583) and `ws` (memory-exhaustion DoS, GHSA-96hv-2xvq-fx4p) via Expo/React Native tooling.
- Why it matters: `react-router` runs in the actual shipped web build, so its CVEs are directly exploitable against real users, not just the dev environment.
- Fix: bump `react-router` to >=7.15.1 (currently pinned at exactly `7.13.0` in `package.json`), and address the rest via `pnpm update`/`pnpm audit fix` before launch; re-run `pnpm audit` to confirm.

### Medium

**M1 — Proprietary business strategy exposed in a public repo**
- Evidence: `LICENSE` states "Proprietary — © CREOVA. All Rights Reserved," but the repo is at the public GitHub URL `github.com/creova-gif/kazi-ai` (per user-supplied context) and contains `KaziAI_PRD.md` (22KB), which includes target-user segmentation, the full feature roadmap, and monetization strategy — tiered pricing plans, M-Pesa premium payment plans, and an "Employer Portal" revenue line (`KaziAI_PRD.md` lines ~499, 560, 565). A proprietary license notice does not prevent competitors or recruiters from reading a public repo; it only restricts *reuse*.
- Why it matters: this hands a competitor CREOVA's go-to-market and monetization plan for free, which is an operational/business risk distinct from a code vulnerability.
- Fix: decide deliberately whether this repo should be public. If it's meant to be a public portfolio piece, strip or redact the monetization/strategy sections of `KaziAI_PRD.md` (or move it out of the repo entirely); if it was meant to be private, flip GitHub visibility now.

**M2 — `.gitignore` provides no coverage for env/secret files**
- Evidence: `.gitignore` contains only Expo-generated boilerplate (`expo-env.d.ts`) — there is no `.env`, `.env.*`, `*.pem`, `*.key`, or similar pattern. Confirmed with `git check-ignore -v .env` → no match (exit 1), meaning a real `.env` file created today would be tracked by default on `git add`.
- `SECURITY.md` tells contributors "never commit `.env` files," but nothing technically enforces that — it's an honor-system control on a repo that (per M1) is public.
- No secrets were found in `git log --all -p` grep for api-key/secret/token/password/sk-ant patterns, so nothing is leaked today — but this is a loaded gun for the next contributor who wires up a real backend key locally.
- Fix: add `.env`, `.env.local`, `.env.*.local` (with `!.env.example` if needed) to `.gitignore` immediately — this is a one-line, zero-risk fix and should happen regardless of the launch date.

**M3 — Build output (`dist/`) is committed to git**
- Evidence: `dist/assets/index-BajfMxTX.js`, `dist/assets/index-Cbgymy4e.css`, and `dist/index.html` are tracked in git (`git ls-files | grep '^dist/'`). I checked the current committed bundle for a leaked Anthropic key (`grep -o "sk-ant-..."`, `grep "ANTHROPIC_API_KEY"`) — none found, so today's commit is clean. But combined with B1, this means the *next* local `pnpm run build` done with a real `EXPO_PUBLIC_ANTHROPIC_API_KEY`/`VITE_ANTHROPIC_API_KEY` set in the shell, followed by a routine `git add -A && git commit`, would silently publish the real key to a public repo permanently (git history rewrite required to fix, per `SECURITY.md`'s own warning).
- Fix: add `dist/` to `.gitignore`, `git rm -r --cached dist`, and build via CI/CD or the Replit deploy step instead of committing build artifacts.

### Low

**L1 — Unvalidated external URL opening (currently low exploitability, becomes real once job data is dynamic)**
- Evidence: `app/(tabs)/jobs.tsx:411` — `Linking.openURL(job.applyUrl).catch(() => {})` with no scheme/host validation. Today `job.applyUrl` comes from hardcoded seed data (`src/app/utils.ts`), so this isn't exploitable yet. The README's own roadmap says "Wire a real job-listing/company data source" is still pending — once job listings come from an external/remote source, an unvalidated `applyUrl` becomes an open-redirect / malicious-deep-link vector.
- Fix: when the real job data source lands, validate `applyUrl` is `http(s)` before calling `Linking.openURL`.

**L2 — `dangerouslySetInnerHTML` usage is benign (verified, no action needed)**
- Evidence: `src/app/components/ui/chart.tsx:83` uses `dangerouslySetInnerHTML` only to inject a `<style>` block built from developer-controlled chart config (color/theme values), not user input. Flagging for completeness since it's a standard audit grep hit, but it is not exploitable as written.

### Nitpick

**N1 — `package.json` name is leftover Figma Make boilerplate**: `"name": "@figma/my-make-file"` — cosmetic, inconsistent with the "Proprietary — CREOVA" branding elsewhere.

**N2 — Stray unrelated file**: `src/imports/brute-audit-prompt.md` is a generic audit-prompt template for an unrelated "fintech budgeting app for East Africa," apparently copy-pasted into this repo by mistake. Not a security issue, but repo hygiene / confusion risk — worth removing.

## Dependency license check (proprietary commercial use)

`ATTRIBUTIONS.md` discloses shadcn/ui (MIT) and Unsplash photos (Unsplash license) — both compatible with proprietary/commercial redistribution. Scanning `package.json`'s dependency list (React, Radix UI, MUI, Expo/React Native ecosystem packages, react-router, recharts, etc.), all are mainstream MIT/permissive-licensed packages — no GPL/AGPL/copyleft packages observed that would block proprietary use. This was a manual read of `package.json`, not a full `license-checker` tool run; recommend running one (e.g., `npx license-checker --summary`) before launch for certainty, since a first-pass read can miss a transitive copyleft dependency.

## Launch verdict

**Not launch-ready as currently architected.** The Anthropic API key is wired to ship inside the public client bundle (B1) — this alone is a hard blocker; shipping it would hand out a live, billable Anthropic key to anyone who opens dev tools. Combine that with zero privacy policy for an app that collects and transmits real CV PII (H1), and this needs at least a day or two of focused work — a backend proxy for AI calls, a privacy notice/consent step, the `.gitignore` one-liner, and a `react-router` bump — before it should go in front of real Tanzanian job seekers. If the backend proxy can't be built by end of week, the safer path is to launch with AI features disabled rather than launch with a client-exposed key.
