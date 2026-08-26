# CLAUDE.md — kazi-ai

## Project Overview
Job board product.

## Known Gap
No lint, test, or build script currently exists in `package.json`. CI is install-only (`npm ci`) — this honestly reflects the current state rather than pretending validation exists. A prior real bug in this repo: `react` was missing from `package.json` entirely despite `react-dom` being declared, which broke `npm install` for anyone — this class of dependency-declaration bug is worth checking for before assuming the app runs.

## Technology Stack
React (verify exact framework/bundler before assuming — check `package.json` directly).

## AI Agent Rules
- Before adding any feature, confirm `npm install` and a manual dev-server start actually work — there's no CI safety net here yet.
- If you add real functionality, add at minimum a `build` script so CI can validate something beyond install.

## Definition of Done
`npm install` succeeds. If practical, add a `build` script rather than leaving this at install-only indefinitely.
