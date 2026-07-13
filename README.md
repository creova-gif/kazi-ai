# Kazi AI

**A career and job-search companion — AI-assisted CV building, interview prep, career path exploration, and skills-gap coaching, for job seekers.**

![Status](https://img.shields.io/badge/status-active_development-yellow)
![License](https://img.shields.io/badge/license-proprietary-red)
![Platform](https://img.shields.io/badge/platform-React_Native_%2F_Expo-blue)

## What this is

Kazi ("kazi" — Swahili for work/job) is a mobile app (Expo) that helps job seekers build stronger applications: a CV builder with AI scoring and summaries, interview prep, a career-path explorer, a networking kit, a soft-skills trainer, and a skills-gap coach. It also includes company/job browsing and an onboarding flow with language selection.

[ADD SCREENSHOT HERE]

## Status: In active development

This is one of the more feature-complete prototypes in the portfolio (CV builder through interview prep are all built out), but the AI scoring/coaching logic has not been validated against real hiring outcomes, and there's no job-listing data source wired up yet.

### Roadmap
- Wire a real job-listing/company data source
- Validate AI CV scoring against real recruiter feedback
- Backend/persistence layer

## Quickstart

```bash
npm i
npm run dev        # or: npm run android / npm run ios
```

## Folder overview

- `app/(onboarding)/` and `app/(tabs)/` — Expo Router screens
- `src/app/components/builder/` — CV builder, career tools, interview prep

## Contributing

See the [org-wide CONTRIBUTING.md](https://github.com/creova-gif/.github/blob/main/CONTRIBUTING.md) for guidelines, including our AI-assisted contribution policy.

## License

Proprietary — © CREOVA. All rights reserved.
