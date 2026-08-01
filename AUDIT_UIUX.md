# Kazi AI — UI/UX Launch Readiness Audit

**Auditor role:** UI/UX specialist, multi-expert launch-readiness team
**Scope:** `app/(onboarding)/*`, `app/(tabs)/*`, `src/app/components/builder/*`, `src/app/components/jobs/*`, plus supporting theme/context files
**Date reference used for time-sensitive findings:** 2026-07-30 (system date at time of audit)

## Summary

Kazi AI is visually coherent and unexpectedly deep for a "prototype" — the CV builder, jobs browser, interview prep, and company directory are all fully built out with a consistent coral/cream East-Africa brand identity, working bilingual (EN/SW) strings on most screens, and sensible empty/loading states in the primary Expo Router app. However, the repository actually contains **two separate, independently-built product implementations** (an Expo Router/React Native app and an unrelated Vite/React-DOM web app) that have already drifted apart in content, tab structure, and even the fake job dataset — this is the single biggest structural risk. On top of that, the flagship "browse jobs" and "career events" screens ship **hardcoded seed dates that are already in the past** as of today, meaning a real user opening the app right now sees most listings as expired or closed. There is one confirmed dead button, several destructive actions with no confirmation, a cosmetic "Register" action that doesn't persist, and **zero accessibility semantics** anywhere in ~7,000+ lines of interactive UI code. None of this is unfixable, but several items directly undercut the "launch this Friday" plan.

## Findings

### Blocker

**B1. Two disconnected app implementations exist side-by-side and have already diverged.**
`app/(onboarding)/*` + `app/(tabs)/*` (Expo Router, React Native primitives, `context/AppContext.tsx`) is a completely separate codebase from `src/app/App.tsx` + `src/app/components/*` (Vite, React-DOM, Radix/shadcn, its own inline `AppContext`). Confirmed by: `app/(tabs)/*.tsx` never imports anything from `src/app/components`; `vite.config.ts` builds `src/app/App.tsx` as its own entry point (`npm run dev` → `vite`, not Expo). Evidence of active drift:
- Tab structure differs: RN app has 5 tabs — CV, Jobs, **Companies**, Prep, Profile (`app/(tabs)/_layout.tsx:45-90`); the Vite app's `MainApp.tsx` has only 4 tabs — CV, Jobs, Prepare, Profile (`src/app/components/MainApp.tsx:18-22`) — the entire Companies/Employers feature does not exist in the web build.
- The two apps ship **different, hand-authored fake job datasets** with different IDs, companies, and counts: `app/(tabs)/jobs.tsx:35-92` (50 jobs) vs. `src/app/components/jobs/JobsView.tsx:14-40` (25 jobs, different schema — `matchScore` field doesn't exist in the RN version at all).
- `src/app/components/builder/CVBuilder.tsx` has a "Score My CV" feature (`CVScoreSheet`) that its sibling `src/imports/CVBuilder.tsx` lacks — confirmed via diff — showing the two component trees keep evolving independently.
- Why it matters: whichever surface a stakeholder demos determines what "Kazi AI" looks like; the other surface silently rots. Any UI/UX or content fix applied to one will not reach the other. For a Friday launch, someone needs to say out loud which of these two apps *is* the product — right now the repo doesn't answer that.
- Fix: pick one canonical implementation (the Expo Router app is more complete — 5 tabs, more jobs, RN Web coverage). Archive or delete the Vite app and `src/imports/*`, or explicitly document that the Vite tree is a design reference only and must not be treated as shippable.

**B2. Seed job/event data is already stale — the core "browse jobs" flow is broken today.**
`getDaysLeft()` in `app/(tabs)/jobs.tsx:29-33` does `new Date(deadline + ', 2026')` against every job's `deadline` string (e.g. `'Jun 30'`, `'Jul 5'`). With the system date at 2026-07-30, the large majority of the 50 hardcoded jobs (`app/(tabs)/jobs.tsx:37-91`, deadlines ranging Jun 15 – Jul 31 2026) are **already past their deadline**, so `JobCard` (line 331-335) renders them with an `isClosed` "Closed" badge, or the urgent "Closes in Xd" badge shows negative/near-zero days. The same pattern exists independently in the Vite app's `JOBS` array (`src/app/components/jobs/JobsView.tsx:15-39`, ISO deadlines through `2026-07-20`, one invalid date `2026-06-31`) and in `EVENTS` (`app/(tabs)/prep.tsx:43-48`) where 2 of 6 "Upcoming Events" (Jul 15, Jul 22) have already passed. Because the year is hardcoded (`', 2026'`), this isn't a one-time glitch — the exact same bug recurs identically every year after 2026 with zero code change needed to trigger it.
- Why it matters: this is the headline feature (job browsing) presenting itself as broken/dead on the very day of a demo or launch. A recruiter or investor opening the app today sees a wall of "Closed" tags.
- Fix: either regenerate seed deadlines relative to `Date.now()` at build/load time (e.g. `today + N days`), or wire the real job-listing source noted in the PRD roadmap before launch, or at minimum strip hardcoded years and use rolling relative dates for the demo build.

**B3. Dead button: "View Careers Page" does nothing.**
`app/(tabs)/companies.tsx:521-524`:
```tsx
<TouchableOpacity style={[styles.websiteBtn, { borderColor: company.logoColor }]}>
  <Ionicons name="open-outline" size={16} color={company.logoColor} />
  <Text style={[styles.websiteBtnText, { color: company.logoColor }]}>{t('View Careers Page', 'Angalia Ukurasa wa Kazi')}</Text>
</TouchableOpacity>
```
No `onPress` prop at all, despite every `Company` record already carrying a `website` URL (`app/(tabs)/companies.tsx:34`, populated per company e.g. line 49 `https://www.vodacom.co.tz/careers`). This was confirmed as the *only* `TouchableOpacity` in the entire `app/` tree missing a press handler (verified by scripted scan of every `<TouchableOpacity>` tag in `app/(tabs)` and `app/(onboarding)`).
- Why it matters: it's a primary CTA inside the Company detail sheet, visually identical to every other working button around it — a tester will tap it, nothing happens, no error, no feedback, and will reasonably conclude the app is buggy.
- Fix: `onPress={() => Linking.openURL(company.website).catch(() => {})}` — one line, matches the pattern already used for jobs (`handleApply` in `jobs.tsx:409-417`).

**B4. Every AI feature fails silently and identically if the API key isn't bundled — no diagnostic UX.**
`app/(tabs)/index.tsx:59,84`, `app/(tabs)/jobs.tsx:395`, `app/(tabs)/prep.tsx:14` all call `fetch('https://api.anthropic.com/v1/messages', ...)` directly from the client using `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? ''`. If this env var is unset/unavailable in the shipped build (a very live risk for a same-week release), every `catch` block renders the same generic string — `t('Failed to generate. Please try again.', 'Imeshindwa. Jaribu tena.')` — with no distinction between "no key configured," "network unreachable," "rate-limited," or "malformed AI response." This affects: AI Summary, CV Score, Cover Letter, Formal Application Letter, Interview Question generator, Interview Answer feedback, Skills Gap Analyser, and the AI Career Coach — i.e. most of the features the PRD calls "✅ Implemented."
- Why it matters: from a pure UI/UX lens, a user (or evaluator) mashing "Generate" across every AI surface and getting the same dead "try again" text on all of them reads as the app being fundamentally non-functional, not as a config issue — and "try again" gives false hope since retrying won't help if the key is genuinely missing.
- Fix (UX-scoped): differentiate the error state ("AI is temporarily unavailable" vs. a retry-affordance for transient failures), and confirm before launch that the key is actually present in the production build target.

### High

**H1. The bilingual (EN/SW) claim is only partially true — large content blocks are English-only.**
PRD US-001 requires "All app text reflects the chosen language." In practice, screen chrome (`nav labels, buttons, headers, empty states) is well covered via `t()` helpers (index.tsx has 100 `t()` calls, prep.tsx 55, jobs.tsx 34, companies.tsx 29). But substantial *content* never gets translated:
- All 50 job listings' `description`/`requirements`/`tags` (`app/(tabs)/jobs.tsx:37-91`) are English-only regardless of `lang`.
- All company `mission`/`culture`/`benefits`/`reviews` text (`app/(tabs)/companies.tsx:38-258`) is English-only.
- Networking Kit templates and platform tips (`app/(tabs)/prep.tsx:492-514, 521-527`) are entirely English, despite the PRD explicitly calling out Kiswahili as "critical for government applications" (US-026).
- Application status chips in the Tracker modal render the raw English enum values `'applied' | 'saved' | 'interview' | 'offer' | 'rejected'` untranslated even in Swahili mode (`app/(tabs)/jobs.tsx:538-543`).
- The empty-tracker string's Swahili half is truncated/incomplete: `t('No applications yet.\nApply to jobs to track them here.', 'Hakuna maombi bado.')` (`app/(tabs)/jobs.tsx:530`) — the English version has two sentences, the Swahili has one.
- Why it matters: for a product whose core differentiator is "in English and Kiswahili," a Kiswahili-primary user still reads most real content (the actual jobs, the actual companies, the actual templates) in English. This is the exact gap the PRD problem statement (`KaziAI_PRD.md` §2) calls out competitors for.
- Fix: prioritize translating job/company *content* fields (or generate bilingual copies at data-authoring time) over further chrome polish; fix the truncated Swahili string; localize the status enum labels.

**H2. Destructive CV edits have no confirmation, inconsistent with the rest of the app.**
Tapping the trash/remove icon next to a Work Experience, Education, or Reference entry deletes it immediately with no confirmation dialog: `removeExperience` (`app/(tabs)/index.tsx:410`), `removeEducation` (`:503`), `removeReference` (`:702`), `removeSkill` (`:608`). This is inconsistent with `handleClearData` in `app/(tabs)/profile.tsx:46-55`, which correctly wraps the equivalent (and far more destructive) "Clear All Data" action in an `Alert.alert` confirmation.
- Why it matters: a user who has manually typed out a job description or reference's phone number can lose it with a single mis-tap, with no undo. This is exactly the kind of paper-cut that turns into a 1-star review ("app deleted my CV").
- Fix: wrap all four `remove*` handlers in the same `Alert.alert` confirm pattern already established in `profile.tsx`.

**H3. "Register" for career events is cosmetic — it doesn't persist and does nothing.**
`app/(tabs)/prep.tsx:62-66`: `toggleRegister` only mutates a local `useState<Set<string>>` inside `PrepScreen`. It is never written to `AppContext`/`AsyncStorage`, triggers no calendar entry, notification, or backend call. The button fully commits to the "you did something real" pattern — success haptic, color change to green, icon swap to checkmark, label change to "Registered ✓" (`app/(tabs)/prep.tsx:132-141`) — but closing the Prep tab and returning, or restarting the app, silently reverts it.
- Why it matters: this actively misleads the user into believing they've registered for a real external event ("KaziAI East Africa Career Fair," "Nairobi Tech Week Jobs Fair," etc.) when nothing happened. Combined with B2 (some events already past), this is a trust-eroding combination.
- Fix (minimum for launch): either persist registration state to `AppContext` so it survives restarts, or relabel the action honestly (e.g. "Remind me" / "Add to interested") until real registration/notification plumbing exists.

**H4. "Export" produces a plain-text share, not the CV export users will expect.**
`app/(tabs)/index.tsx:99-148` (`exportCV`) builds a manually-formatted plain-text string and passes it to the native `Share.share` sheet. The button is labeled "Export" with a share/document icon (`index.tsx:175-178`) sitting directly next to "Preview," which *does* show a formatted CV. The PRD itself flags PDF export as the single most critical missing feature ("This is arguably the most critical missing feature," US-020, P0, marked 🔴 Not built in the priority matrix).
- Why it matters: a user builds a nicely formatted CV, taps "Export" expecting a document, and instead gets an ASCII-art-ish text blob to paste into WhatsApp/email — which undermines the app's entire pitch of helping users "build stronger applications." This is a launch-week credibility risk, not a nice-to-have.
- Fix: either rename the button to something honest ("Share as text") until PDF export ships, or fast-track PDF export (already flagged P0 in the PRD's own recommended next sprint).

**H5. No accessibility semantics anywhere in the audited code.**
A scripted search across every file in `app/(tabs)`, `app/(onboarding)` found **zero** uses of `accessibilityLabel` or `accessibilityRole`. A parallel search across `src/app/components/{builder,jobs,onboarding,profile}` found **zero** uses of any `aria-*` attribute. Every icon-only control (save/bookmark toggle, close "chevron-down", trash/delete, search-clear "×", filter chips) is exposed to assistive tech with no name at all.
- Why it matters: VoiceOver/TalkBack users cannot meaningfully operate this app — every icon button reads as "button" with no label. For a product explicitly positioned to reach underserved job seekers across five countries, this closes the door on users who rely on a screen reader.
- Fix: add `accessibilityLabel`/`accessibilityRole="button"` to icon-only `TouchableOpacity`s at minimum on primary flows (save job, apply, close modal, delete entry); mirror with `aria-label` on the Vite side.

### Medium

**M1. Touch targets are frequently under the ~44pt minimum.**
Examples: `saveBtn: { padding: 4 }` wrapping a 22px bookmark icon (`app/(tabs)/jobs.tsx:628`, used at `:347-350`) yields roughly a 30px hit area; header icon buttons are 38×38 (`jobs.tsx:609`); every modal's `chevron-down`/close control is a bare `<TouchableOpacity onPress={onClose}>` around a 24-26px `Ionicons` glyph with **no** padding or `hitSlop` at all (`jobs.tsx:423,500,521,574`; `companies.tsx:456`; `prep.tsx:574` `ModalHeader`; repeated across `index.tsx` modal headers).
- Why it matters: this is a broad, high-density target market on a wide range of Android devices; small, unpadded close/save buttons are exactly where mis-taps concentrate.
- Fix: add `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` to icon-only touch targets, or wrap in a min 44×44 pressable container — a one-line change repeatable across ~15 call sites.

**M2. `src/imports/` is dead, duplicated, drifting legacy code left in the repo.**
Confirmed via grep that nothing under `src/` or `src/app/` imports from `src/imports/*` — the directory (18 `.tsx` files, ~290KB) is fully orphaned. It also contains literal byte-identical duplicate files from the original Figma Make export: `ApplicationTracker.tsx`/`ApplicationTracker-1.tsx`, `CVPreview.tsx`/`CVPreview-1.tsx`, `JobsView.tsx`/`JobsView-1.tsx`, `SalaryGuide.tsx`/`SalaryGuide-1.tsx` (diffed as 0 lines different).
- Why it matters: doesn't affect the running app, but it's a landmine for anyone (human or AI) editing the "wrong" copy of a component and wondering why nothing changes, and it's dead weight in every codebase-wide search.
- Fix: delete `src/imports/` (or move to a clearly-labeled `_archive/` outside the build path) as part of pre-launch cleanup.

**M3. Fabricated "employee reviews" read as real user-generated content.**
Every company on `app/(tabs)/companies.tsx` (`COMPANIES` array, lines 38-258) ships 2 invented reviews with plausible job titles and 2025/2026 dates (e.g. "Software Engineer... Vodacom is truly world-class," dated "Mar 2026"), alongside a `reviewCount` field that never matches the number of reviews actually shown (e.g. Vodacom: `reviewCount: 48` but exactly 2 reviews render, `companies.tsx:41,45-48`).
- Why it matters: nothing in the UI marks these as illustrative/sample content — a user reading "48 reviews, 4.2★" with two named quotes has no way to know this is placeholder data, which is a step past a normal empty/seed-data problem into presenting fabricated testimonials as real social proof.
- Fix: either clearly label the section as "Sample reviews — coming soon" until real review data exists, or scope review counts to match the actual review array length.

**M4. Cold start can show a blank screen with no loading indicator.**
`context/AppContext.tsx:205` — `AppProvider` returns `null` while `AsyncStorage.getItem` resolves (`loaded === false`), which means the entire `<Stack>` (including the animated splash screen in `app/index.tsx`) doesn't mount at all until storage finishes loading.
- Why it matters: on a slow/low-end Android device (a realistic profile for the target market), there's a window where the app shows nothing — not even the branded splash — before anything renders, which reads as a hang or crash on first impression.
- Fix: render a minimal static splash (logo on brand background) as the `AppProvider` fallback instead of `null`.

**M5. Three disconnected, inconsistent theme sources in one repo.**
`default_shadcn_theme.css` (repo root) is never imported anywhere (confirmed via grep) and still holds the generic shadcn boilerplate palette (near-black `--primary: #030213`, greyscale everything) — nothing like the actual Kazi brand. The real brand palette is defined twice, independently: `constants/colors.ts` (RN app: coral `#E7633B` / cream `#F5F0E8` / ink `#1A1410`) and `src/styles/theme.css` (Vite app). None of the three are kept in sync by any tooling.
- Why it matters: low risk to the shipped UI directly (the dead file isn't loaded), but it's exactly the kind of leftover that causes a future contributor to "fix" the wrong file, or a design-system audit to draw the wrong conclusions about brand colors/contrast.
- Fix: delete `default_shadcn_theme.css`, or repurpose it as the single source of truth both apps pull from.

**M6. No dark mode despite the color-scheme abstraction implying one exists.**
`hooks/useColors.ts` hardcodes `return Colors.light`, and `constants/colors.ts` only defines a `light` key (`export const Colors = { light: {...} }`) — the `ColorScheme` type name and hook shape both suggest a light/dark switch that was never built.
- Why it matters: minor for launch, but any user with system-wide dark mode (common as a battery-saving default on Android) gets a jarring bright cream UI with no adaptation, and no in-app way to change it.
- Fix: out of scope for this week; flag for backlog rather than block launch on it.

### Low

**L1.** Tab title "CV" is not localized (`app/(tabs)/_layout.tsx:48`, `title: 'CV'`), while all four sibling tabs correctly use `t()` — inconsistent with the rest of the tab bar.

**L2.** Networking Kit templates (`app/(tabs)/prep.tsx:501-514`) are static text with bracketed placeholders (`[Name]`, `[Company]`) and no copy/share/fill-in affordance — a lower bar of interactivity than the AI-personalized Cover Letter/Application Letter features sitting one tab away in the same app, which feels like an unfinished corner next to a polished one.

**L3.** Company → open-roles matching (`app/(tabs)/companies.tsx:379,450`) uses a fragile heuristic — `JOBS.filter(j => j.company.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]))` — matching only on the first word of the company name, which risks false positives/negatives as more companies/jobs are added.

### Nitpick

**N1.** The "closes in Xd" / "deadline" formatting logic (`app/(tabs)/jobs.tsx:29-33` and inline `, 2026` suffix at `:462`) is duplicated rather than centralized, making the year-hardcoding bug (B2) easy to reintroduce even after a fix.

## Launch verdict

**Needs work — not a hard blocker on architecture/code quality, but not launchable Friday as-is.** The core screens are well-built, on-brand, and mostly bilingual, which is genuinely more than a typical "prototype." But B2 (dead-on-arrival job/event dates), B3 (a confirmed dead button), and B4 (every AI feature's failure mode looking identical and unexplained) are all user-visible within the first two minutes of using the app today, and B1 (two diverging codebases) is a structural risk that will only get more expensive to untangle the longer both are kept alive. Recommend: fix B2–B4 (all are small, mechanical fixes — hours, not days), make an explicit call on B1 before doing further work on either app, and treat H1–H5 as the punch list for the days immediately after launch rather than blockers, with H2 (destructive-delete confirmation) and H3 (fake "Register") ideally landing before Friday since both actively erode user trust.
