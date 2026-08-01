# Archived: Vite web prototype

This directory holds a second, independently-built implementation of Kazi AI —
a Vite + React-DOM web app — that was never reachable from the shipping app
and has no path to Apple App Store or Google Play distribution (it's a plain
web SPA, not a native build).

**Moved here on 2026-08-01** as part of the launch-readiness audit
(`../AUDIT_MASTER.md`, `../WORKPLAN.md` item 1.8), once the decision was made
to distribute via the App Store and Play Store: the canonical app is
`app/(onboarding)/` + `app/(tabs)/` (Expo Router), built and shipped via EAS
Build. This tree was confirmed to have zero imports from, or into, the
canonical app before archiving.

Kept for reference — bilingual prompt copy, some UI/visual design choices,
and a few components (e.g. `CareerPathExplorer`, `SoftSkillsTrainer`) don't
exist in the canonical app and might be worth porting over deliberately if
those features are wanted later. Not part of the active build: `vite build`
and `vite dev` no longer work as top-level scripts, and nothing in this
directory is exercised by CI, tests, or the app store build pipeline.

If you want to revive a web version of Kazi AI, the canonical app already
supports one via Expo's own web target (`react-native-web` is a dependency;
`expo start --web` / `expo export -p web`) — that's very likely a better
starting point than resurrecting this tree, since it shares code with the
native app instead of duplicating it.
