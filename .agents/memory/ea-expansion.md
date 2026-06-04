---
name: KaziAI East Africa Expansion
description: How the app was expanded from Tanzania-only to all of East Africa
---

## Scope
App covers Tanzania, Kenya, Uganda, Rwanda, Ethiopia, Remote (East Africa-wide).
Vision: "Handshake for East Africa" — job discovery, career events, employer connections.

## Key Data Structures
- `EACountry` type exported from `context/AppContext.tsx`: `'Tanzania'|'Kenya'|'Uganda'|'Rwanda'|'Ethiopia'|'Other'`
- `CV` interface has `country: EACountry` field (default: 'Tanzania')
- `Job` interface in `app/(tabs)/jobs.tsx` has `country: 'Tanzania'|'Kenya'|'Uganda'|'Rwanda'|'Ethiopia'|'Remote'` + `flag: string`

## Job Data
50 jobs total in `JOBS` array (jobs.tsx): 25 Tanzania + 7 Kenya + 5 Uganda + 5 Rwanda + 5 Ethiopia + 3 Remote
Country filter chips above sector filter chips in Jobs tab UI.

## Events (prep.tsx)
6 career events in `EVENTS` array: KaziAI Virtual Fair, Nairobi Tech Week, DSM Graduate Expo, Kigali Innovation Conf, EA NGO Forum, Addis Careers Week. Horizontal scroll card section at top of Prep screen.

## Onboarding (setup.tsx)
Country picker chips (6 countries with flags) added after city/location field. Calls `updateCV({ country })`.

## Salary Guide (jobs.tsx)
`SalaryModal` shows per-country salary data with tab filter (TZ/KE/UG/RW).

**Why:** Expanding to East Africa is the core product vision. Country filter is purely UI-state — no backend or storage key changes needed.
