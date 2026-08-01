# KaziAI — Product Readiness Audit

**Auditor role:** Product/PM specialist, multi-expert launch-readiness audit
**Date of audit:** 2026-07-30
**Scope:** Gap analysis between `KaziAI_PRD.md` (dated May 2026) and the actual codebase at `/Users/justinmafie/Desktop/Projects/kazi-ai`
**Client ask:** Launch before end of week

---

## 0. A note on method

The repository contains **two parallel component trees**:

1. `app/(onboarding)/` + `app/(tabs)/` — the live Expo Router app. `app.json`/`package.json` (`"main": "expo-router/entry"`) confirm this is what actually ships to a device.
2. `src/app/` (`App.tsx`, `MainApp.tsx`, `components/**`) and `src/imports/` — a leftover **Figma Make / Vite web export** (uses `import.meta.env.VITE_*`, which doesn't exist in Expo/React Native; file names like `JobsView-1.tsx`, `CVPreview-1.tsx`, `SalaryGuide-1.tsx` are the classic Figma-export duplicate pattern). **Nothing in `app/` imports anything from `src/app/` or `src/imports/`.** This entire tree — roughly half of all component files in the repo — is dead code, unreachable by any real user.

This matters for the audit: the PRD's feature-status checkmarks appear to have been graded against the `src/` tree (or against design intent) rather than the shipping app. Several features marked "✅ Implemented" in the PRD **do not exist in the app a user would actually install.** The matrix below grades strictly against `app/(tabs)/*.tsx` and `app/(onboarding)/*.tsx`, per the task brief, and calls out every case where PRD status and shipping reality diverge.

---

## 1. Summary

KaziAI is a genuinely more complete prototype than its README modestly suggests — the CV builder, job browsing, application tracker, and several AI-backed tools are real, working, wired to a live Claude API, and reasonably polished. But the PRD overstates completeness in at least three concrete ways, and the app has one architecture-level defect serious enough to block any public release: **the Anthropic API key is shipped inside the client bundle** (`EXPO_PUBLIC_ANTHROPIC_API_KEY`, called directly from React Native to `api.anthropic.com`), meaning anyone who downloads the app can extract the key and run up the developer's Claude bill or exfiltrate it entirely.

Beyond that, the product's core value propositions — "job matching with local salary/market data" and "AI-validated CV scoring" — are not real in the sense a job seeker would assume. Job listings are ~25 hardcoded entries with fixed 2026 deadlines (no live data source, confirmed by the README itself). AI CV/interview scoring calls a real model but its outputs are unvalidated against any ground truth — the README says so explicitly, and there is no mechanism to make that visible to a user inside the app.

**"Launch this week" is not currently a well-formed instruction** — see Section 3. Depending on what the client means by "launch," the honest answer ranges from "yes, this week, with cuts" to "no, this is months away." That ambiguity needs to be resolved before a go/no-go verdict can be executed on.

---

## 2. PRD-vs-reality feature matrix

Grading strictly against `app/(tabs)/*.tsx` + `app/(onboarding)/*.tsx` (the shipping app). "PRD status" = what `KaziAI_PRD.md` §4/§6 claims.

### 4.1 Onboarding

| Feature | PRD status | Reality | Verdict |
|---|---|---|---|
| US-001 Language Selection | ✅ Implemented | `app/(onboarding)/language.tsx` — real screen, choice persists via `AppContext`/AsyncStorage. See §3 for depth of translation. | **Built** |
| US-002 Profile Setup | ✅ Implemented | `app/(onboarding)/setup.tsx` collects name/sector/experience, gates onboarding via `completeOnboarding()`. | **Built** |

### 4.2 CV Builder

| Feature | PRD status | Reality | Verdict |
|---|---|---|---|
| US-003 Build CV (sections, completion %) | ✅ Implemented | `app/(tabs)/index.tsx` — full CRUD for experience/education/skills/references, live completion ring. | **Built** |
| US-004 AI Professional Summary | ✅ Implemented | Real `fetch()` to `api.anthropic.com/v1/messages` with `claude-opus-4-5`, bilingual prompt, regenerate option. Works, but see §5 (API key exposure) and §4 (no validation of output quality). | **Built, but insecure architecture** |
| US-005 CV Preview | ✅ Implemented | Renders formatted preview inline in `index.tsx`. | **Built** |
| **US-020 PDF Export** (§5.1, new) | 🔴 Not built (PRD's own matrix agrees) | Confirmed: only `Share.share({ message: <plain text> })` exists — a native OS share sheet with a text dump, **not a PDF**, no file, no template styles. | **Not built** — PRD is accurate here |
| **US-021 Multiple CV Templates** | 🔴 Not built | Confirmed — one hardcoded preview layout, no template switcher in the live app. | **Not built** — PRD accurate |

### 4.3 Job Search & Matching

| Feature | PRD status | Reality | Verdict |
|---|---|---|---|
| US-006 Browse curated listings | ✅ Implemented | `app/(tabs)/jobs.tsx` — ~25 hardcoded jobs (title/company/location/salary/sector), keyword search, sector filter, detail view. Functionally works. | **Built, but static seed data only** |
| **US-007 AI Job Match Score (%)** | ✅ Implemented | **Does not exist in the live app.** `jobs.tsx` has no `matchScore` field at all — the "Matches" tab just boolean-filters jobs whose `sector` is in the user's `targetSector`, no percentage, no CV-based scoring. A percentage `matchScore` (hardcoded per job, not computed from any user data) exists only in the orphaned `src/app/components/jobs/JobsView.tsx` — dead code. | **Not built in the shipping app** — PRD is wrong |
| US-008 Save & track applications | ✅ Implemented | Real: bookmark toggle, `applied → interview → offer → rejected` pipeline via `updateApplicationStatus`, notes field. | **Built** |
| US-009 AI Cover Letter Generator | ✅ Implemented | Real Claude call from `jobs.tsx`, bilingual, copy/share. Same key-exposure issue as US-004. | **Built, but insecure architecture** |
| **US-010 Salary Guide** (dedicated, entry/mid/senior × sector) | ✅ Implemented | **Does not exist as a standalone feature.** No dedicated salary-by-level-by-sector data anywhere in the live app — only the per-job salary string embedded in each of the 25 static listings (e.g. "TZS 2.5M–4M/month"). That's not a "guide," it's a label. | **Not built as described** — PRD overstates |

### 4.4 Interview Preparation

| Feature | PRD status | Reality | Verdict |
|---|---|---|---|
| US-011 Interview Question Bank | ✅ Implemented | Present inside `prep.tsx` "Interview Prep" tool with tips, bilingual. | **Built** |
| **US-012 STAR Method Trainer** | ✅ Implemented | **Not found anywhere in the live app.** No "STAR," no Situation/Task/Action/Result framework in `app/`. Only exists (if at all) in the dead `src/` tree. | **Not built** — PRD is wrong |
| US-013 AI Mock Interviewer | ✅ Implemented | Present in `prep.tsx`, Claude-generated questions from CV data. | **Built** |
| US-014 AI Job Coach Chat | ✅ Implemented | Real, persistent-in-session, context-aware system prompt referencing user's CV/sector. Same key-exposure issue. | **Built, but insecure architecture** |
| US-015 Skills Gap Analyzer | ✅ Implemented | Present as a `prep.tsx` tool, AI-backed. | **Built** |
| **US-016 Soft Skills Trainer** | ✅ Implemented | **Not found in the live app.** Only exists as dead code in `src/app/components/builder/SoftSkillsTrainer.tsx`, unreachable from any screen. | **Not built** — PRD is wrong |
| **US-017 Career Path Explorer** | ✅ Implemented | **Not found in the live app.** Only exists as dead code (`src/app/components/builder/CareerPathExplorer.tsx`). | **Not built** — PRD is wrong |

### 4.5 Profile & Settings

| Feature | PRD status | Reality | Verdict |
|---|---|---|---|
| US-018 Profile Dashboard | ✅ Implemented | `profile.tsx` shows applied/saved/following/skills counts. | **Built** |
| **US-019 Share Profile Card** ("visual shareable... KaziAI branding") | ✅ Implemented | **Not what's described.** `handleShare()` in `profile.tsx` is a plain OS share sheet with a canned marketing sentence ("Check out KaziAI... Download: kaziaiapp.com") — not a personalized visual card with the user's name/title/skills. | **Not built as described** — PRD overstates |

### Proposed / V2 features (§5–§8 of PRD)

The PRD's own matrix (§6) already marks these 🔴 Not built, and this audit confirms that grading is accurate: PDF export, live job listings, user auth/cloud sync, CV score+suggestions *(partially wrong — see below)*, job alerts, M-Pesa/premium, formal application letter, multiple CV templates, offline mode, employer portal, CV version history, mentor matching, networking directory, voice input.

One correction: **US-024 CV Score & Improvement Suggestions** is listed as "🔴 Not built" in the PRD's own priority matrix, but this audit found it **is** built — `CVScoreSheet.tsx` (dead-tree copy) shows the pattern, and equivalent scoring logic exists reachable in the live app via the AI tools in `prep.tsx`/`index.tsx`. Effort was correctly estimated as low because it reuses the existing Claude wiring. This is a minor case of the PRD *understating* what exists, the mirror image of the overstatements above.

### Summary count

Of the 19 "✅ Implemented" (V1) user stories in the PRD:
- **13 are genuinely built and reachable in the shipping app.**
- **5 are not built at all in the shipping app** (US-007 match score, US-010 dedicated salary guide, US-012 STAR trainer, US-016 soft skills trainer, US-017 career path explorer) despite being checked off.
- **1 is built but materially different from its description** (US-019 share card).

---

## 3. Kiswahili localization — is it real?

**Verdict: Real, but shallow and fragile — not decorative, not complete.**

- **No i18n library.** `package.json` has no `react-i18next`, `i18next`, `expo-localization`, or any translation framework. Confirmed by grepping dependencies.
- **Language selection is real and persists.** `app/(onboarding)/language.tsx` sets `language: 'sw' | 'en'` via `AppContext`, which is written to AsyncStorage (`kazi_ai_state_v2`) and rehydrated on app start. It is *not* just a cosmetic picker — the value is read throughout the app.
- **Translation is hand-rolled, per-string, via `lang === 'sw' ? swahiliText : englishText` ternaries and a local `t(en, sw)` helper**, present in the large majority of live screens (`index.tsx`, `jobs.tsx`, `companies.tsx`, `prep.tsx`, `profile.tsx`, `setup.tsx`). This is a real, working pattern — Kiswahili strings are natural, not machine-translated filler (e.g. `"Habari! Mimi ni Mshauri wako wa Kazi KaziAI..."`, formal letter openers using "Mheshimiwa").
- **Coverage is inconsistent and unaudited.** Because every string is manually paired, there is no way to verify — and no build-time check that would catch — strings that were added in English only and never given a Kiswahili counterpart. Given engineering pace with no i18n tooling, silent partial-English fallback inside an otherwise-Kiswahili session is likely and would look broken/unprofessional to a Kiswahili-first user, exactly the audience this product claims to serve.
- **AI-generated content (summaries, cover letters, coach chat) is prompted per-language**, which works but is not guaranteed — a model can drift language mid-response, and there's no server-side or client-side check that the returned text is actually in the requested language before showing it to the user.
- **Risk:** because this is 100% manual and there's no test coverage (see §6), Kiswahili support will silently rot as new features are added by anyone not deliberately maintaining both strings per line.

**Bottom line:** the language picker is not decorative — real, useful Kiswahili exists behind it — but calling it a fully localized bilingual product overstates the engineering rigor behind it. It's "we translated most of what we wrote," not "this app is internationalized."

---

## 4. Is "launch" even a coherent goal here?

The request says "launch before the week ends" without specifying what launching means. That is a live ambiguity the client needs to resolve, because the honest answer is completely different depending on the target:

| Interpretation | Feasible in a week? | Why |
|---|---|---|
| **Public app store release** (Google Play / App Store, marketed to real Tanzanian job seekers) | **No.** | No PDF export (PRD's own "most critical missing feature"), no real job data, unvalidated AI scoring presented as authoritative, client-exposed API key, zero tests, no crash/analytics tooling, no app store assets confirmed beyond an icon. App store review alone (especially iOS) routinely takes longer than a week. |
| **Closed beta** (TestFlight/Play internal track, small group of real users, expectations set) | **Plausible this week**, if the API key issue is fixed first and every static/unvalidated feature is clearly labeled (see §6 punch list). |
| **Waitlist / landing page** (collect interest, no functional app in users' hands) | **Trivially feasible** — doesn't touch any of the app-layer risk below. |
| **Demo to investors/partners** (controlled walkthrough, not self-serve) | **Feasible now** — the app is demoable as-is; a guided demo doesn't expose the same trust risks as unsupervised real-world use. |

Recommendation: **do not proceed with punch-list prioritization work until the client states which of these "launch" means.** The engineering scope, risk tolerance, and go/no-go answer are materially different for each row.

---

## 5. Worst-case user-facing failure if shipped as-is to real job seekers this week

Target users are named in the PRD itself as fresh graduates and first-time job seekers — a vulnerable population for whom this may be their first professional CV and first real job search. Two failure modes stand out:

1. **Users trust a "CV Score" or AI feedback that has never been validated against real hiring outcomes** (README's own words). A user could act on AI advice — e.g., trim a section the model flagged as weak, or feel falsely confident because they scored "85/100" — that has no demonstrated correlation with what Tanzanian employers actually screen for. Because the CV score UI presents a specific number and specific critique with no disclaimer, it reads as authoritative. The realistic harm: a job seeker submits a worse CV than they would have without the tool, or delays applying while "improving" a score that means nothing, and blames themselves rather than the tool when they don't hear back.
2. **Users treat the ~25 static job listings as live openings.** Deadlines are hardcoded to specific 2026 dates that will pass or already look stale; `applyUrl` mostly points to a company's *generic* careers page, not the specific posting described — a user reading "Software Engineer at Vodacom Tanzania, deadline Jun 30" and clicking through may find no such listing exists, or that it closed months ago. For a job seeker under time and financial pressure, chasing a listing that was never real is a meaningful, personal cost — not just an app bug.

A secondary but real trust issue: `companies.tsx` ships **fabricated employee "reviews"** (named authors, star ratings, dated text) attributed to real companies (Vodacom, CRDB, etc.) with no disclosure that they're placeholder content. If a user or a company representative ever notices, that reads as making up quotes about a real employer — a reputational risk for CREOVA distinct from the AI-accuracy issue.

Combined with the API-key exposure (§0/§2), the realistic worst case isn't just "the app disappoints a user" — it's "a job seeker makes a worse career decision because the app presented fabricated or unvalidated content as fact, in a market where trust in a new local product is the entire value proposition."

---

## 6. Prioritized punch-list

### Minimum truthful, non-deceptive scope that COULD ship this week (as a closed beta or demo — not a public store release)

1. **Fix the API key exposure first, unconditionally.** Move every Claude call behind a minimal server-side proxy (even a single serverless function) before any build with real users. This is non-negotiable regardless of what "launch" means, the moment untrusted people can obtain the app binary.
2. **CV Builder + CV Preview**, as-is — genuinely solid, ship it.
3. **Application Tracker**, as-is — genuinely solid, ship it.
4. **Interview Question Bank + AI Mock Interviewer + AI Career Coach**, ship it, but visibly label AI output ("AI-generated — not verified against real hiring outcomes") rather than presenting it as expert fact.
5. **Job browsing**, but re-label it honestly: not "job listings," but something like "sample roles / market examples" until a real data source is wired, and strip or clearly flag deadlines that are static. Point `applyUrl` only at destinations known to be live, or remove the "Apply" affordance and replace with "Learn more about this employer."
6. **Remove or clearly flag the fake company reviews** in `companies.tsx` ("illustrative example," or delete until real reviews exist).
7. **CV Score feature**: keep it, but add an explicit, unavoidable disclaimer that the score is AI-generated and has not been validated by recruiters — do not let the number stand alone.
8. **Kiswahili**: spot-check every live screen for English fallback strings before beta; this is cheap insurance against an obvious embarrassment for the target audience.

### Should NOT ship as-is under any interpretation of "launch"

- **Any build with the Anthropic key embedded client-side**, to any audience wider than the current dev team.
- **The job match score / dedicated salary guide as "AI-powered" or "market data"** — they either don't exist in the live app (match score) or are just per-listing text (salary guide); marketing copy claiming otherwise would be actively false.
- **The static job listings presented as live/current opportunities without a "sample data" disclaimer.**
- **The fabricated company reviews, unlabeled.**
- **PDF export / multiple templates / auth / payments / employer portal** — correctly scoped by the PRD itself as not built; no risk in leaving these out as long as marketing doesn't promise them.

---

## 7. Launch verdict: **No-go for a public release this week. Go-with-cuts for a closed beta or investor demo, conditional on the API-key fix and honesty relabeling above.**

**Why:** The product is more built than the README's modest framing suggests, and several core flows (CV builder, application tracker, AI coach/interview prep) are real and usable today. But three things independently block an unqualified "go":

1. A **security defect** (client-exposed Anthropic API key) that would leak the moment the app is in anyone's hands outside the dev team — this alone rules out any public release this week regardless of feature completeness.
2. **The PRD materially overstates what's shipped** — 5 of 19 "done" V1 features don't exist in the actual app a user would install (job match score, dedicated salary guide, STAR trainer, soft skills trainer, career path explorer), and a 6th (share card) is not what it claims to be. Any launch messaging built off the PRD as-is would overpromise.
3. **The core trust surface — AI scoring and job data — is either unvalidated or fabricated**, aimed at a vulnerable, first-time-job-seeker audience where getting this wrong has real personal cost, not just a bad app review.

None of this rules out shipping *something* this week — a closed beta with the punch-list cuts above, or a controlled investor/partner demo, is realistic. But "launch" needs to be defined by the client (§4) before this verdict can be executed on, and the security fix is a hard prerequisite for any option that puts the app in outside hands.
