# Kazi AI — Master Launch-Readiness Audit

**Team:** UI/UX · Full-Stack · Security · Product · Research Engineering · ML/AI Engineering
**Date:** 2026-07-30
**Ask:** launch before end of week
**Repo:** `github.com/creova-gif/kazi-ai`, cloned to `/Users/justinmafie/Desktop/Projects/kazi-ai`

Six specialists independently audited this repo. Their full reports are in this same directory (`AUDIT_UIUX.md`, `AUDIT_FULLSTACK.md`, `AUDIT_SECURITY.md`, `AUDIT_PRODUCT.md`, `AUDIT_RESEARCH.md`, `AUDIT_ML_AI.md`). This document cross-references and prioritizes their findings into one verdict.

---

## Verdict

**No-go for a public release this week. Go, with cuts, for a closed beta or a controlled demo — conditional on fixing the API key exposure first, unconditionally.**

Four of six specialists independently flagged the same root problem from different angles (security, ML/AI, full-stack, product), and three independently flagged the app's split-personality architecture (UI/UX, full-stack, research). That level of independent convergence is itself a signal: these aren't edge-case nitpicks, they're structural.

**The one thing everyone needs to know:** the app is genuinely more built than its own README lets on — CV builder, application tracker, and Claude-backed AI tools (summary, scoring, cover letters, interview prep, coaching) are real, working, and reasonably polished. This isn't a shell. But it's currently wired to leak a live, billable Anthropic API key to anyone who downloads it, it presents fabricated "employee reviews" of real companies as genuine, and roughly a quarter of what the PRD calls "done" doesn't exist in the app a user would actually install.

---

## Cross-cutting blockers (found by multiple tracks independently)

### 1. Anthropic API key ships inside the public app — CRITICAL, non-negotiable
Every AI feature (CV summary, CV score, cover letter, application letter, interview prep, skills gap, job coach) calls `api.anthropic.com` **directly from client code**, with `anthropic-dangerous-direct-browser-access: 'true'` and the key read from `EXPO_PUBLIC_ANTHROPIC_API_KEY` / `VITE_ANTHROPIC_API_KEY` — both are bundler conventions that **inline the value into the shipped JS by design**. `.replit`'s production deploy config wires the real key straight into that variable. Any user, on web or mobile, can extract it from dev tools or the compiled bundle in seconds. No rate limiting, no per-user quota, no backend — so the blast radius is unlimited billing or account suspension.
→ Confirmed independently by **Security, ML/AI, Full-Stack, Product**.
→ **Fix: ~0.5–1 day.** One serverless/backend endpoint holding the key server-side; swap all 9 client call sites to call it instead. This is a mechanical change, not a rewrite — full detail and code pointers in `AUDIT_ML_AI.md` §4.

### 2. Two independent, diverging app implementations in one repo
`app/(onboarding)/` + `app/(tabs)/` (Expo Router, the app `package.json`'s `main: "expo-router/entry"` and the README both say is the product) and `src/app/` + `src/imports/` (a Vite/React-DOM web export, imports nothing from the other tree) are **two separately hand-maintained codebases** for the same features, with drifted tab counts (5 vs 4 — Companies is missing entirely from the web version), different fake job datasets, different field names for the same data, and independently-evolving components. A quarter of the entire codebase (`src/imports/`, ~4,719 lines) is fully dead — nothing imports it.
→ Confirmed independently by **UI/UX, Full-Stack, Product, Research**.
→ **Fix:** pick the Expo Router app as canonical (it's more complete and matches the README/package.json), archive or delete `src/app/` + `src/imports/`. This is a decision, not engineering work — but it needs to be made explicitly before anyone spends more time on either tree.

### 3. Fabricated content presented as real, attributed to real companies
`app/(tabs)/companies.tsx` ships invented "employee reviews" — named authors, job titles, star ratings, quoted testimonials — for real employers (Vodacom, CRDB, Safaricom, KCB, Equity, etc.), rendered under a UI label reading "Reviews from employees and recent applicants," with review counts that don't even match the number of reviews shown. This is qualitatively different from placeholder/seed data — it's synthetic testimonial content misattributed to real organizations.
→ Confirmed independently by **UI/UX, Product, Research** — Research's report calls it "the single most concrete legal/reputational risk found in the audit."
→ **Fix:** remove or clearly re-label as illustrative before any real user or company sees it. Hours, not days.

### 4. The PRD overstates what's actually shipping
Of the 19 "✅ Implemented" V1 features in `KaziAI_PRD.md`, **5 do not exist in the app a user would install**: AI job-match score, dedicated salary guide, STAR interview trainer, soft-skills trainer, career-path explorer. A 6th ("Share Profile Card") is built but materially different from its description. These all exist only in the dead `src/` tree or not at all.
→ Confirmed by **Product**, cross-checked against **Research**'s independent data-source audit.
→ **Fix:** correct any launch messaging built off the PRD as-is; either build the missing 5 for real or drop them from what's promised.

### 5. Core "browse jobs" flow is broken *today*, and the bug is permanent
`getDaysLeft()` hardcodes the year (`new Date(deadline + ', 2026')`) — as of today (2026-07-30) the large majority of the 50 seeded job listings and 2 of 6 "upcoming" career events already render as Closed/Expired. Because the year is hardcoded rather than relative, **this exact bug recurs identically every year** with zero code changes.
→ Found by **UI/UX**, data-sourcing context from **Research**.
→ **Fix:** hours — regenerate seed dates relative to `Date.now()`, or strip the hardcoded year.

### 6. None of the "data" in the app is real data
Job listings, company profiles, salaries, and career-path figures are all hardcoded array literals with zero citation, source, or freshness date. "CV Score" and "job match %" are not computed by any algorithm — they're numbers an LLM is asked to invent per call, unconstrained by any rubric, with no bounds-checking and no stability guarantee (the same CV scored twice can return different numbers). The one exception is the Skills Gap Analyzer, which uses a real (if crude) deterministic string-match algorithm.
→ **Research**'s full report has the complete sourcing trace, file-by-file.
→ **Fix is not a fix, it's a workstream:** real job-data pipelines, sourced salary data, and validated CV scoring are each independently weeks-to-months of work (backend, data partnerships, an eval harness against real recruiter/hiring outcomes). Not achievable this week. What *is* achievable this week: honest in-app labeling ("AI estimate, not verified," "sample roles, not live listings") so the app stops implying authority it doesn't have.

---

## Track-specific high-severity findings (not already covered above)

**Security**
- 44 dependency vulnerabilities via `pnpm audit` (2 critical, 20 high) — `react-router` 7.13.0 in particular ships in the actual runtime web bundle with multiple high-severity CVEs (unauth RCE path, XSS via redirect targets); bump to ≥7.15.1.
- Full CV PII (name, phone, email, references' contact info) stored unencrypted in AsyncStorage/localStorage, transmitted to Anthropic on every AI action, with **zero privacy policy or consent flow** anywhere in the app — a Tanzania PDPA 2022 consideration for a product targeting real users this week.
- `.gitignore` has no env-file coverage at all (`git check-ignore .env` fails) and `dist/` build output is committed to git — meaning the *next* local build with a real key set could silently publish it permanently.
- The public repo exposes `KaziAI_PRD.md`'s full monetization strategy (tiered pricing, M-Pesa plans, Employer Portal revenue line) despite the LICENSE claiming "Proprietary" — a license notice doesn't stop a competitor from reading a public repo.

**Full-Stack**
- `tsc --noEmit` produces **211 errors** under the repo's own `strict: true` — root cause is a path-alias mismatch between `tsconfig.json` and `vite.config.ts` that makes the type checker unable to resolve most of the live web component tree at all. Not just noise: it already hid a real bug (a missing color-palette key causing an invalid CSS color at runtime in `SalaryGuide.tsx`).
- The documented `pnpm run build` command **actually fails** in this checkout (pnpm config drift — `allowBuilds` left as unresolved placeholder text); the build only succeeds when invoking Vite directly, bypassing pnpm's script runner.
- README's own quickstart is broken — `npm run android`/`npm run ios` don't exist as scripts.
- Zero tests, zero CI (`.github/` has no Actions workflows) — nothing automated catches a broken build, a new type error, or a regression before it ships, for a repo actively juggling two parallel app implementations.

**UI/UX**
- A confirmed dead button ("View Careers Page" has no `onPress` at all, despite the URL already existing on the data model).
- Destructive CV edits (delete work experience/education/reference) have **no confirmation dialog**, inconsistent with the app's own "Clear All Data" pattern which does confirm.
- "Register" for career events is fully cosmetic — full success animation/haptic/checkmark, but the state lives in a local `useState` that's lost on app restart. Actively misleads users into thinking they registered for a real event.
- "Export CV" produces a plain-text share-sheet dump, not a PDF, despite the icon/label implying a document — and the PRD itself flags PDF export as the single most critical missing feature.
- Zero accessibility semantics anywhere audited (`accessibilityLabel`/`accessibilityRole` on native, `aria-*` on web) — every icon-only control is invisible to a screen reader.
- Bilingual (EN/Kiswahili) support is real but shallow: screen chrome is well-translated, but job/company *content*, networking templates, and status labels are English-only regardless of language setting — undercutting the product's core differentiator for Kiswahili-first users.

**Product**
- "Launch before the week ends" is not currently a well-formed instruction — the honest feasibility answer is completely different depending on whether "launch" means a public app-store release (no — blocked by all of the above, plus app-store review timelines alone routinely exceed a week), a closed beta (plausible this week with the fixes above), a waitlist/landing page (trivially feasible, doesn't touch any app-layer risk), or a controlled investor/partner demo (feasible now, as-is, since a guided walkthrough doesn't expose the same trust risks as unsupervised real-world use). **This needs to be resolved with the client before further prioritization work is scoped.**

---

## Minimum truthful scope that could realistically ship this week (closed beta / demo, not public store release)

1. Fix the API key exposure — non-negotiable, first, before anything else touches real users.
2. Ship CV Builder + CV Preview + Application Tracker as-is — genuinely solid.
3. Ship Interview Question Bank + AI Mock Interviewer + AI Career Coach, with visible "AI-generated, not verified against real hiring outcomes" labeling.
4. Re-label job browsing honestly ("sample roles / market examples," not "job listings") until a real data source exists; fix or remove the stale hardcoded deadlines; don't let "Apply Now" point at a real employer's generic careers page for a posting that doesn't exist.
5. Remove or clearly flag the fabricated company reviews.
6. Add an explicit, unavoidable disclaimer on the CV Score feature that it's AI-generated and unvalidated.
7. Spot-check every live screen for English-only fallback strings before a Kiswahili-first audience sees it.
8. Explicitly decide — out loud, in writing — which of the two app trees is shipping, and stop treating the other as equally real.

## Should not ship under any interpretation of "launch"

- Any build with the Anthropic key embedded client-side, to anyone outside the current dev team.
- The job-match score or "salary guide" marketed as AI-powered/market-backed — one doesn't exist in the shipping app, the other is just per-listing text with no source.
- Static job listings without a "sample data" disclaimer.
- Unlabeled fabricated company reviews.

---

## Full reports

| Track | File |
|---|---|
| UI/UX | `AUDIT_UIUX.md` |
| Full-Stack | `AUDIT_FULLSTACK.md` |
| Security | `AUDIT_SECURITY.md` |
| Product | `AUDIT_PRODUCT.md` |
| Research Engineering | `AUDIT_RESEARCH.md` |
| ML/AI Engineering | `AUDIT_ML_AI.md` |
