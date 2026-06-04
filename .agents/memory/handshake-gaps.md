---
name: Handshake gap features
description: Which Handshake parity features were built for KaziAI and which were deferred
---

## Built (all feasible client-side features)
- External apply URL on every job (`applyUrl` field, opens via `Linking.openURL`)
- Job type filter (Internship / Full-time / Part-time / Contract)
- CV Export / Share as plain text (Share.share() in index.tsx)
- Employer Profiles — Companies tab (companies.tsx, 18 EA employers, modal with Overview/Jobs/Reviews)
- Company Follow / Unfollow (followedCompanies in AppContext, toggleFollowCompany)
- Event Registration (registeredEvents Set<string> in prep.tsx, Register/Registered button on each card)
- Deadline countdown badge on job cards (getDaysLeft helper, red urgency badge)
- Discover curated job collections (6 collections in jobs.tsx Discover tab)
- Company Reviews (2 static reviews per company in CompanyModal)
- Graduation year + institution fields (CV interface, InfoModal, setup.tsx, profile.tsx header chip)
- AI prompts fixed to "East Africa" context
- Profile stat "Following" (followedCompanies count) replaces "Education" stat

## Deferred (require native build or backend)
- Profile photo upload — requires native file picker + storage
- Push notifications — requires APNs/FCM and native build
- Direct messaging — requires backend/websocket infrastructure

**Why:** These three require either native device capabilities not available in Expo Go web mode, or a persistent server-side infrastructure that doesn't exist yet.
