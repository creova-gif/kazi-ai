# Kazi AI — Data & Research Foundations Audit

**Scope:** Where do job listings, company data, salary benchmarks, and CV/skills "scores" actually come from in this codebase, and how far is that from what the PRD claims?
**Auditor:** Research engineering specialist, launch-readiness review
**Repo state audited:** branch `copilot/vscode-mpgdueco-6p31`, working tree as of 2026-07-30

---

## Summary

Every number in this app that looks like data — job listings, company profiles, employee reviews, salary ranges, career-path salaries, CV scores, job-match percentages — is either a **hardcoded literal typed into a `.tsx` file** or a **number hallucinated by an LLM on demand with no rubric, no calibration set, and no validation**. There is no database, no fixture file, no CSV, no API integration, and no scoring algorithm backed by real outcomes anywhere in the repo. A repo-wide search for data files found nothing but `package.json`/`tsconfig`/`vercel.json` — **zero `.json`/`.csv` data fixtures exist**.

The repo also contains **two parallel, inconsistent app shells** (an Expo/React Native app under `app/`, and a Vite/React web prototype under `src/app/`) with different, non-interoperable versions of the same mock data and different scoring implementations. `package.json` itself is contradictory: `"main": "expo-router/entry"` but `"scripts": { "build": "vite build", "dev": "vite" }` — it's unclear which app is actually meant to ship.

**Bottom line for this week:** none of the data-dependent claims (job listings, salaries, match scores, CV quality scores) should be shown to real Tanzanian users as if they reflect real market conditions. They are placeholder/demo content wearing the UI of production data.

---

## 1. Job listings & company data — source

### `app/(tabs)/jobs.tsx` (the Expo/RN app referenced by README)
- `export const JOBS: Job[] = [...]` — a **50-item hardcoded array literal**, `app/(tabs)/jobs.tsx:35-92`. Real company names (Vodacom Tanzania, CRDB Bank, UNICEF Tanzania, Safaricom, etc.), fabricated salary ranges, fabricated deadlines (all dated 2026), and `applyUrl` fields pointing to each company's real top-level careers page (e.g. `https://www.vodacom.co.tz/careers`, `app/(tabs)/jobs.tsx:37`).
- **Risk beyond "stale data":** tapping "Apply Now" (`handleApply`, `app/(tabs)/jobs.tsx:409-417`) sends the user to a real company's general careers URL for a specific job posting (title, salary, deadline) that does not exist at that company. That's not just missing data — it's data that will actively mislead a job seeker into thinking a specific vacancy exists.
- No `matchScore`/percentage match field exists on the `Job` type in this file. The "Matches" tab (`activeTab === 'matches'`) merely filters jobs whose `sector` is in `state.cv.targetSector` (`app/(tabs)/jobs.tsx:145`) — a boolean sector-inclusion filter, not a computed match score.

### `app/(tabs)/companies.tsx`
- `const COMPANIES: Company[] = [...]` — an **18-item hardcoded array**, `app/(tabs)/companies.tsx:37-259`, cross-referencing the same fabricated job list via `JOBS.filter(j => j.company.toLowerCase().includes(...))` (`companies.tsx:379, 450`).
- Each company entry includes a `rating` (e.g. `4.2`), `reviewCount` (e.g. `48`), `followers` (e.g. `3200`), and a `reviews: Review[]` array of **fabricated named "employee reviews"** with generic author titles ("Software Engineer", "Finance Officer"), star ratings, and quoted testimonial text (`companies.tsx:45-48` and throughout). The Reviews tab UI explicitly labels this "Reviews from employees and recent applicants" (`companies.tsx:563-564`).
- **This is the single most concrete legal/reputational risk found in the audit:** the app presents invented quotes attributed to invented "employees" of real companies (Vodacom, CRDB, Safaricom, KCB, Equity, etc.) as authentic review content. This is materially different from "seed job listings" — it is synthetic testimonial content misattributed to real employers.

### Second, divergent copy of the same data: `src/app/components/jobs/JobsView.tsx` (Vite web prototype)
- Its own hardcoded `JOBS` array (`src/app/components/jobs/JobsView.tsx:15` onward) carries a literal `matchScore: number` field per job (92, 87, 78, 74, 85, …) — a **static number baked into the seed data**, identical for every user regardless of their CV. The file's own comment says it outright: `// Sample job data — in production would come from an API` (`JobsView.tsx:13`, and duplicated verbatim in `src/imports/JobsView.tsx:12` and `src/imports/JobsView-1.tsx:12`).
- `matchScore` is only ever *read* (for sorting/filtering/rendering, `JobsView.tsx:72,78,136,210-213,246`) — it is never *computed* from a user's CV anywhere in the codebase. This directly contradicts PRD **US-007** ("Score is calculated from CV sector, skills, and experience... Score updates when CV is updated") — as implemented, the score does not update with the CV; it's a fixed literal from the mock dataset.

**No live/external job-data source exists anywhere.** `grep` across the repo for BrighterMonday/Fuzu/UTUMISHI integration turns up only static reference links and tips text inside `app/(tabs)/prep.tsx:494,527` and `src/app/components/builder/NetworkingKit.tsx:166-167` — i.e. "here's a link to go check yourself," not an integration.

---

## 2. Salary / market-data claims — source

Two independent hardcoded salary tables exist, neither cited to any source:

- **`app/(tabs)/jobs.tsx:554-564`** — `const SALARY_DATA = [...]`, a 9-row table (Software Engineer, Finance Officer, Medical Officer, Programme Manager NGO, Bank Manager, Data Analyst, Civil Servant, HR Manager, Product Manager) with TZS/KES/UGX/RWF ranges, rendered by `SalaryModal` (`jobs.tsx:566-602`) as the PRD's "EA Salary Guide" (US-010).
- **`src/app/components/builder/CareerPathExplorer.tsx:36-90+`** — per-sector career ladders (Tech, Finance, Health, Education, Entrepreneurship, …) each with a `salaryTZS: [number, number]` tuple per career stage (e.g. Junior Developer `[800000, 1500000]`, Tech Lead/CTO `[7000000, 20000000]`, `CareerPathExplorer.tsx:36-39`).

Both are **plain number literals typed by whoever wrote the file**. There is no comment, footnote, citation, methodology note, survey reference, or data-collection date anywhere near either table. A repo-wide search for any actual market-data artifact (CSV, JSON fixture, scraped dataset, salary-survey reference) found **nothing** — the only non-config JSON file in the whole repo is `src/imports/vercel.json`.

**Conclusion:** the PRD's claim that "Data reflects Tanzanian market reality" (US-010 acceptance criteria) and "Salary at each stage shown in TZS" implying grounded figures (US-017) are **entirely aspirational text with zero corresponding data infrastructure**. The numbers may be directionally plausible (someone with domain familiarity typed them), but they are not sourced, not dated, not versioned, and not distinguishable in the UI from verified data.

---

## 3. CV scoring — is there a rubric, or is it a hallucinated number?

There is **no scoring algorithm, rubric, or weighting formula anywhere in the repo** for the CV "quality score." Every instance is the same pattern: build a text prompt, POST it to the Anthropic Messages API from the client, ask the model to invent a JSON object containing a number, and render whatever comes back.

- **`app/(tabs)/index.tsx:74-97`** (`scoreCV`, the RN app's actual CV Score flow): prompt is `` `Score this CV for the East Africa job market (1-100)... Respond ONLY as JSON: {"score": 72, "feedback": [...], "improvements": [...]}` `` (`index.tsx:77-78`). The response is parsed with `JSON.parse(text.replace(/```json|```/g, '').trim())` (`index.tsx:92`) and set directly as UI state — **no bounds checking, no schema validation, no consistency check, no fallback scoring logic.** If the model returns malformed JSON, the catch block just sets `score: 0` (`index.tsx:95`).
- **`src/app/components/builder/CVScoreSheet.tsx:26-66`** (web prototype's version): same pattern, more elaborate — asks for an `overall` score plus 5 per-section scores (Summary/Experience/Education/Skills/Contact Info) and lists of strengths/improvements, again as free-form JSON the model is trusted to produce correctly (`CVScoreSheet.tsx:39-43`). No rubric defines what a "75" in the Education section means versus an "85" — that judgment is entirely inside the model's un-inspectable weights for this one API call.
- The API key is read from `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY` / `import.meta.env.VITE_ANTHROPIC_API_KEY` and the request is made **directly from the client** with `anthropic-dangerous-direct-browser-access: true` (`index.tsx:84-86`, `CVScoreSheet.tsx:50-52`) — meaning the key ships inside the built app bundle. This is a security finding adjacent to the research-quality one: not only is the score unvalidated, the mechanism producing it embeds a secret in a public artifact.
- PRD **US-024** claims "Comparison to top-performing CVs in the same sector" as an acceptance criterion — **no such comparison set, corpus, or benchmark exists anywhere in the code.** Nothing is compared to anything; the model is simply asked to imagine a number.

**Re-running the same CV through `scoreCV()` twice will not reliably return the same score** — nothing in the code caches, seeds, or otherwise stabilizes the output. There is no test, fixture, or eval harness in the repo that checks CV-scoring output against anything.

### Skills Gap Analyzer (`src/app/components/builder/SkillsGap.tsx`) — the one exception worth noting
This is the **only "scoring" logic in the codebase that is a real, deterministic, inspectable algorithm** rather than an LLM guess:
- `JOB_SKILL_PROFILES` (`SkillsGap.tsx:8-54`) is a hardcoded dictionary of exactly **5 roles** (Software Engineer, Data Analyst, Accountant, Program Officer NGO, Nurse RN), each with a `required`/`preferred` skill list and a short resource list.
- `matchPct = Math.round((requiredHave.length / profile.required.length) * 100)` (`SkillsGap.tsx:75`), where `checkSkill` does a **case-insensitive bidirectional substring match** between the user's typed skill names and the profile's skill strings (`SkillsGap.tsx:70`) — e.g. a user who types "javascripts" or "react native" would match "JavaScript"/"React" via substring inclusion, which is crude (false positives/negatives are easy to construct) but at least is a real, reproducible, auditable computation — unlike the CV score.
- The AI is only used afterward, to generate free-text *tips* on how to close the gap (`getAITips`, `SkillsGap.tsx:77-99`) — those tips are unvalidated LLM prose, but they don't feed back into the percentage.

---

## 4. Feasibility assessment — what a real pipeline would take, and how far this is from "launch this week"

### Job/company listings
A legitimate pipeline needs, at minimum:
1. **Licensed or scraped ingestion** from Tanzanian/EA job boards (BrighterMonday API if available, UTUMISHI/AJIRA government portal, LinkedIn Jobs via official API, direct employer feeds) — the PRD's own **US-022** already scopes this correctly as "Effort: High (requires backend + scraper/API)."
2. **Deduplication and normalization** across sources (title/company/location/salary text parsing into structured fields) — nontrivial NLP/ETL work, not present at all today.
3. **A refresh cadence and staleness policy** (PRD wants "updated daily") — requires a scheduled job + backend, which doesn't exist (there is no backend in this repo at all; state lives in React Context + localStorage per the PRD's own architecture notes, `KaziAI_PRD.md:613`).
4. Legal/ToS review before scraping third-party job boards.

This is realistically **weeks to a couple of months** of backend + data-engineering work for a first working pipeline, even before matching quality is considered — not a "launch this week" gap.

### Salary benchmarks
A defensible Tanzania salary guide needs an actual **primary data source** — options in rough order of speed/cost:
- Public/government wage data (NBS Tanzania Integrated Labour Force Survey, Ministry of Labour), which is coarse but citable.
- Partnering with or licensing data from an existing local salary-survey provider or recruiter panel (e.g. an HR consultancy's compensation survey).
- A lightweight in-app "tell us your salary" crowdsourcing feature, gated by minimum sample size per role/sector before showing a range — feasible in weeks but produces low-confidence numbers until volume builds, and needs disclosure of sample size/confidence to users.
- Minimum bar regardless of source: every figure needs a **cited source and a last-updated date** rendered in the UI. Today there is neither the data nor the UI affordance for either.

Time estimate: a defensible v1 (even coarse, government-sourced, clearly dated and caveated) is achievable in **1–3 weeks** if scoped narrowly; a crowdsourced or licensed version is **1–2 months**.

### CV-scoring validation
To go from "LLM guesses a number" to "validated scoring," you need:
1. **A rubric** — explicit, published criteria per section (what does a 90 in "Experience" require vs. a 60?), so scoring is reproducible and explainable to users.
2. **A labeled evaluation set** — real CVs with known outcomes (interview/no interview, hire/no hire) or at minimum recruiter-rated quality scores, ideally sourced from actual Tanzanian recruiters/employers the product claims to serve.
3. **An eval harness** that runs the scoring prompt (or a rubric-constrained version of it) against that labeled set and measures agreement (e.g. correlation with recruiter ratings, or classification accuracy against interview outcomes) — none of this exists; there isn't even a single test file for the scoring functions in the repo.
4. **Stability testing** — same CV in, same (or tightly bounded) score out, across repeated calls and across minor CV edits.
5. Ideally A/B or shadow-testing against real application outcomes over time.

Building steps 1–4 for a first defensible version is realistically **2–6 weeks** of focused work (rubric design + recruiter partnership for a labeled set + harness), assuming willing recruiter partners can be found quickly; getting to "validated against real hiring outcomes" as the README aspires to is a **multi-month, ongoing measurement effort**, not a one-time fix.

**Net assessment:** none of these three tracks (real job data, sourced salary data, validated CV scoring) is a small patch. All three require either new backend infrastructure, new external data partnerships, or new evaluation methodology that doesn't exist in any form today — not a rubric with a bug, not a partially-wired API, but genuinely absent. "This week" is enough time to add disclosure/caveat UI (see Launch Verdict below), not to build any of the three pipelines.

---

## 5. PRD claims that are empirically unverifiable or unsupported by anything in the repo

| PRD claim | Location | Status in repo |
|---|---|---|
| "Data reflects Tanzanian market reality" (salary guide acceptance criteria) | `KaziAI_PRD.md:186` | Unsupported — hardcoded literals, no source, `app/(tabs)/jobs.tsx:554-564` |
| "Score is calculated from CV sector, skills, and experience... Score updates when CV is updated" | `KaziAI_PRD.md:142-144` (US-007) | False as implemented in the web prototype — `matchScore` is a static seed-data literal (`src/app/components/jobs/JobsView.tsx:15+`); the RN app has no per-job score at all |
| "Comparison to top-performing CVs in the same sector" | `KaziAI_PRD.md:394` (US-024) | No such corpus or comparison exists anywhere; score is a single unconstrained LLM call |
| "Score out of 100 with breakdown by section" implying a consistent methodology | `KaziAI_PRD.md:392` (US-024) | Technically true a number is returned, but it's not backed by any rubric — same CV can plausibly score differently on repeat calls |
| "Local resources prioritized (NBAA, UDSM courses, etc.)" for Skills Gap | `KaziAI_PRD.md:258` (US-015) | Partially true — `SkillsGap.tsx:8-54` does list a few real local resources (NBAA, TNMC) but only for 5 hardcoded roles total; not generalized |
| Company review ratings/counts ("4.2 · 48 reviews") | Not explicitly in PRD, but rendered as if real user-generated content | Entirely fabricated — `app/(tabs)/companies.tsx:37-259` invents named reviewers, quotes, and star ratings attributed to real employers |
| Implicit claim that "Apply Now" leads to the advertised job | Job detail view UX, `app/(tabs)/jobs.tsx:474-485` | False — links to generic company careers pages, not the specific (fabricated) posting |
| "Jobs updated daily from external sources" (V2 feature, not yet claimed as live) | `KaziAI_PRD.md:362` (US-022) | Correctly scoped as not-yet-built in the PRD itself — no issue here, flagged only for completeness |

---

## Launch verdict

**Do not show the data-dependent claims to real users this week as if they reflect real market/employer information.** Specifically:

- **Job listings & "Apply Now" links** should either be clearly and persistently labeled as illustrative/sample content, or the `applyUrl` behavior should be changed so it doesn't imply a specific real vacancy exists at a real company — right now a user can tap Apply on a fabricated posting and land on a real employer's generic careers page, which is actively misleading, not just "stale."
- **Company reviews** (fabricated quotes attributed to invented "employees" of real companies) are the highest-severity item found and should be removed or explicitly re-labeled (e.g. "illustrative example reviews") before any real user sees them — this is the one item that reads as fabricated testimonial content about real organizations, not merely placeholder data.
- **Salary guide and career-path salary figures** need at minimum a visible "illustrative estimate, not verified market data" disclosure before shipping; they should not be presented as authoritative negotiation ammunition (which is literally the PRD's stated use case, US-010) without a cited source.
- **CV score and job-match percentages** should be described in-app as an AI estimate/opinion, not a validated quality metric, until a rubric + eval set exists. The number is real output from a real model call — it isn't fake in that sense — but it has no demonstrated relationship to actual hiring outcomes, and the README already admits this.

None of this requires ripping features out — it requires honest labeling now, and treating "real data + validated scoring" as a genuine multi-week-to-multi-month workstream (new backend, external data partnerships, recruiter-labeled eval set) rather than something adjacent to this week's launch scope.
