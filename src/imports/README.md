# PesaPlan v3

Mobile-first budgeting app for Tanzania. Built for Watanzania — Swahili-first, M-Pesa ready, works offline.

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS (minimal usage — mostly inline styles with design tokens)
- Motion (Framer Motion) for animations
- Recharts for data visualisation
- Sonner for toast notifications
- LocalStorage persistence (no backend required for MVP)

## Design System
- **Base**: Warm cream `#F5F0E8`
- **Accent**: Coral `#E7633B`
- **Dark surfaces**: Ink `#1A1410`
- **Typography**: Sora (display) + Space Grotesk (labels/numbers)
- **No card shadows** — flat borders only

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
```bash
npm run build
vercel --prod
```

## Environment
No environment variables required for the base MVP.
AI features (AIAssistant) use client-side pattern matching — no API key needed.

## Screens
1. Splash
2. Language selection
3. User type (student / biashara / informal / family)
4. Income frequency
5. Goal setup
6. Dashboard (home, goals, history, insights, settings)

Built by CREOVA Solutions — Justin Mafie, 2026
