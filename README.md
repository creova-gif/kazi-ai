# Kazi AI

**A career and job-search companion — AI-assisted CV building, interview prep, career path exploration, and skills-gap coaching, for job seekers.**

![Status](https://img.shields.io/badge/status-active_development-yellow)
![License](https://img.shields.io/badge/license-proprietary-red)
![Platform](https://img.shields.io/badge/platform-React_Native_%2F_Expo-blue)

![Kazi AI landing page](docs/screenshots/dashboard.png)

## Overview
Kazi ("kazi" — Swahili for work/job) is a mobile app helping job seekers build stronger applications.

## Problem
Job seekers, especially first-time applicants, lack access to CV feedback, interview coaching, and career guidance that's normally gated behind expensive career coaches.

## Solution
An AI-scored CV builder, interview prep, career-path explorer, networking kit, soft-skills trainer, and skills-gap coach — plus company/job browsing.

## Key Capabilities
- CV builder with AI scoring and summaries
- Interview prep, career path explorer
- Networking kit, soft-skills trainer, skills-gap coach

## Architecture
Expo (React Native). AI features call a local proxy (`server/index.js`) that holds the Anthropic key server-side.

## Getting Started
```bash
npm i
npm start          # or: npm run android / npm run ios / npm run web
```
Run the AI proxy alongside the app (`npm run serve`) with `ANTHROPIC_API_KEY` set — see `.env.example`. Note: this repo previously had `react` missing from `package.json` entirely despite `react-dom` being declared, which broke install for anyone — check dependency declarations carefully before assuming they're complete.

## Repository Structure
- `app/(onboarding)/`, `app/(tabs)/` — Expo Router screens
- `app/(tabs)/index.tsx` — CV builder; `app/(tabs)/prep.tsx` — career tools, interview prep
- `server/` — Anthropic API proxy

## Project Status
One of the more feature-complete prototypes in the portfolio (CV builder through interview prep are built out), but AI scoring/coaching hasn't been validated against real hiring outcomes, and there's no job-listing data source wired up yet.

## Roadmap
- [ ] Wire a real job-listing/company data source
- [ ] Validate AI CV scoring against real recruiter feedback
- [ ] Backend/persistence layer

## Contributing
See the [org-wide CONTRIBUTING.md](https://github.com/creova-gif/.github/blob/main/CONTRIBUTING.md).

## License
Proprietary — © CREOVA. All rights reserved.

## Author / Organization
Built by [Justin Mafie](https://github.com/creova-gif) under CREOVA.
