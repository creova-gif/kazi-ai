---
name: KaziAI Stack & Environment Quirks
description: Critical Expo 55 env fixes — must not be undone or app breaks
---

## Stack
- Expo SDK 55, expo-router (file-based), React 19.2.0
- `package.json` has `"type":"module"` — all config files use `.cjs` extension
- `"main": "expo-router/entry"`, `web.output = "single"` (SPA)
- Brand: cream #F5F0E8, ink #1A1410, coral #E7633B. `useColors()` hook in `hooks/useColors.ts`

## Critical Patches (must not revert)
1. **Babel __self patch** — `node_modules/.pnpm/@babel/plugin-transform-react-jsx@7.28.6/.../create-plugin.js`: two `throw sourceSelfError(...)` changed to `attr.remove(); break;` / `continue;`. Without this, bundler throws on every JSX file.
2. **logbox-web-polyfill stub** — `metro.config.cjs` blockList stubs out the missing module. Without it, web build errors on the missing native module.
3. **useNativeDriver guard** — splash screen (`app/index.tsx`) uses `Platform.OS !== 'web'` before setting `useNativeDriver: true` on Animated, plus `setTimeout` fallback.

## Storage
- AsyncStorage key: `kazi_ai_state_v2` — spread merge pattern: `{ ...defaultState, ...parsed, cv: { ...defaultCV, ...parsed.cv } }` keeps new fields backward-compatible without bumping key.

**Why:** These fixes were hard-won over many attempts. Reverting any of them silently breaks the bundler or runtime.
