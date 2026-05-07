# KaziAI — Product Requirements Document

**Version:** 1.0  
**Date:** May 2026  
**Product:** KaziAI — AI-Powered Career Platform for Tanzania  
**Built by:** CREOVA Solutions  
**Target Market:** Tanzania & East Africa  

---

## 1. Executive Summary

KaziAI is a mobile-first career development platform designed specifically for Tanzanian job seekers. It combines AI-powered tools (Claude AI) with a deep understanding of the local job market to help users build professional CVs, discover matched job opportunities, prepare for interviews, and grow their careers — all in English and Kiswahili.

The platform addresses a critical gap: most global career tools are built for Western markets, leaving African professionals without locally relevant salary data, sector guidance, or language support.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| Tanzanian graduates lack access to professional CV tools | Poor CV quality leads to missed opportunities |
| Global career platforms have no local salary/market data | Users cannot negotiate effectively |
| Interview preparation resources are in English only | Non-native English speakers are disadvantaged |
| No AI career coaching accessible on mobile in Tanzania | Users lack affordable, personalized guidance |
| Job matching is generic with no sector/region context | Irrelevant results waste users' time |

---

## 3. Target Users

### Primary Users
- **Fresh Graduates** (18–26): Entering the job market for the first time, need CV guidance and interview prep.
- **Mid-Career Professionals** (27–40): Looking to switch roles or industries, need skills gap analysis and salary benchmarks.
- **Job Seekers** (all ages): Actively searching for employment in Tanzania's formal and informal sectors.

### Secondary Users
- **Career Counselors**: Using the platform to support clients.
- **University Career Centers**: Deploying KaziAI as a student resource.

---

## 4. Current Features & User Stories

---

### 4.1 Onboarding

#### US-001 — Language Selection
> *As a Tanzanian user, I want to choose between Kiswahili and English so that I can use the app in my preferred language.*

**Acceptance Criteria:**
- [ ] User sees Kiswahili and English options on first launch
- [ ] Selected language persists across sessions
- [ ] All app text reflects the chosen language
- [ ] User can switch language at any time from Profile settings

**Priority:** P0 — Critical  
**Status:** ✅ Implemented

---

#### US-002 — Profile Setup
> *As a new user, I want to enter my basic details (name, sector, experience level) during onboarding so that the app can personalize job matches and AI suggestions from the start.*

**Acceptance Criteria:**
- [ ] Fields: First name, last name, job title, email, phone, location
- [ ] Onboarding completion is saved — user goes directly to main app on return
- [ ] Minimum required fields: first name, last name, email
- [ ] Experience level selection (Entry / Mid / Senior)

**Priority:** P0 — Critical  
**Status:** ✅ Implemented

---

### 4.2 CV Builder

#### US-003 — Build a Professional CV
> *As a job seeker, I want to fill in my work experience, education, skills, and references in a structured form so that I can generate a professional CV.*

**Acceptance Criteria:**
- [ ] Sections: Summary, Work Experience, Education, Skills, References, Languages
- [ ] Each section has add/edit/delete functionality
- [ ] CV completion percentage updates in real time
- [ ] Progress ring shows current completion visually

**Priority:** P0 — Critical  
**Status:** ✅ Implemented

---

#### US-004 — AI-Generated Professional Summary
> *As a user who struggles to describe themselves, I want Claude AI to generate a professional summary based on my profile so that I have a strong, well-written opener for my CV.*

**Acceptance Criteria:**
- [ ] AI summary is generated from CV data (name, title, experience, skills, sector)
- [ ] User can regenerate if not satisfied
- [ ] Generated summary is saved to profile
- [ ] Works in both English and Kiswahili
- [ ] Graceful error state if API fails

**Priority:** P0 — Critical  
**Status:** ✅ Implemented

---

#### US-005 — CV Preview
> *As a user, I want to preview my completed CV in a formatted layout so that I can see how it looks before downloading or sharing.*

**Acceptance Criteria:**
- [ ] CV renders with all sections in a clean, professional template
- [ ] User can scroll through the full document
- [ ] Template matches professional Tanzania/East Africa standards

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

### 4.3 Job Search & Matching

#### US-006 — Browse Curated Job Listings
> *As a job seeker, I want to browse job openings from Tanzanian companies so that I can find relevant opportunities without leaving the app.*

**Acceptance Criteria:**
- [ ] Jobs show: title, company, location, salary, sector tags
- [ ] Jobs can be searched by keyword
- [ ] Jobs can be filtered by sector
- [ ] Each job has a detailed view with requirements

**Priority:** P0 — Critical  
**Status:** ✅ Implemented

---

#### US-007 — AI Job Match Score
> *As a user, I want to see a percentage match score between my CV and each job listing so that I can prioritize which jobs to apply for.*

**Acceptance Criteria:**
- [ ] Match score is calculated from CV sector, skills, and experience
- [ ] Score is visible on job cards
- [ ] Score updates when CV is updated

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-008 — Save & Track Job Applications
> *As an active job seeker, I want to save jobs and track my application status (Saved → Applied → Interview → Offer → Rejected) so that I stay organized during my job search.*

**Acceptance Criteria:**
- [ ] Job can be bookmarked/saved from listing
- [ ] Application tracker shows status pipeline
- [ ] Status can be updated by user
- [ ] Notes can be added to each application

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-009 — AI Cover Letter Generator
> *As a job applicant, I want the app to generate a tailored cover letter for a specific job using my CV data so that I can apply confidently without writing from scratch.*

**Acceptance Criteria:**
- [ ] Cover letter is personalized to the specific job title, company, and requirements
- [ ] Generated using Claude AI from CV + job context
- [ ] User can copy text or share directly
- [ ] Available in English and Kiswahili

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-010 — Salary Guide
> *As a job seeker negotiating salary, I want to see market salary ranges for roles in Tanzania so that I can negotiate from an informed position.*

**Acceptance Criteria:**
- [ ] Salaries shown in TZS (and USD for international roles)
- [ ] Ranges for entry, mid, and senior levels
- [ ] Grouped by sector
- [ ] Data reflects Tanzanian market reality

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

### 4.4 Interview Preparation

#### US-011 — Interview Question Bank
> *As a job seeker preparing for an interview, I want access to common and behavioral interview questions with tips so that I feel confident walking in.*

**Acceptance Criteria:**
- [ ] General and behavioral question categories
- [ ] Expert answer tips per question
- [ ] Filter by industry/role type
- [ ] Available in Kiswahili and English

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-012 — STAR Method Trainer
> *As a user unfamiliar with behavioral interviews, I want to learn and practice the STAR framework so that I can structure my answers professionally.*

**Acceptance Criteria:**
- [ ] Explains Situation, Task, Action, Result framework
- [ ] Practice prompts with model answers
- [ ] Interactive examples

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-013 — AI Mock Interviewer
> *As a user preparing for a specific role, I want the AI to generate personalized interview questions based on my CV and target sector so that I can practice realistically.*

**Acceptance Criteria:**
- [ ] Questions are generated from user's actual CV data
- [ ] Sector-specific question sets
- [ ] Claude AI powered
- [ ] Feedback mechanism on answers

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-014 — AI Job Coach Chat
> *As a user seeking career guidance, I want to chat with an AI career coach at any time so that I get personalized advice without needing to pay for a human consultant.*

**Acceptance Criteria:**
- [ ] Real-time conversational interface
- [ ] Context-aware (knows user's CV and target sector)
- [ ] Covers: CV tips, job search strategy, career growth
- [ ] Powered by Claude AI
- [ ] Chat history persists in session

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-015 — Skills Gap Analyzer
> *As a professional looking to grow, I want to compare my skills against industry benchmarks so that I know exactly what to learn to qualify for my target role.*

**Acceptance Criteria:**
- [ ] Select target role (e.g., Software Engineer, Accountant, Nurse)
- [ ] Shows missing skills vs. current skills
- [ ] Recommends learning resources (free and paid)
- [ ] Local resources prioritized (NBAA, UDSM courses, etc.)

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-016 — Soft Skills Trainer
> *As a user who wants to improve beyond technical skills, I want gamified lessons on soft skills like communication and teamwork so that I become a more attractive candidate.*

**Acceptance Criteria:**
- [ ] Topics: Communication, Teamwork, Problem Solving, Adaptability, Negotiation
- [ ] Quiz format with XP/points rewards
- [ ] Progress tracking per skill topic
- [ ] Practical scenarios set in Tanzanian workplace contexts

**Priority:** P2 — Medium  
**Status:** ✅ Implemented

---

#### US-017 — Career Path Explorer
> *As a user planning long-term, I want to visualize career progression stages (e.g., Junior Developer → CTO) with expected salaries and skills needed at each level so that I can plan my future.*

**Acceptance Criteria:**
- [ ] Timeline view of career stages
- [ ] Salary at each stage shown in TZS
- [ ] Required skills and experience per stage
- [ ] Actionable next steps

**Priority:** P2 — Medium  
**Status:** ✅ Implemented

---

### 4.5 Profile & Settings

#### US-018 — Profile Dashboard
> *As a user, I want to see an overview of my CV completion, saved jobs, and applications in one place so that I can gauge my job search progress.*

**Acceptance Criteria:**
- [ ] Stats: CV%, jobs saved, applied count, experience entries
- [ ] Visual progress indicator
- [ ] Quick action links to incomplete sections

**Priority:** P1 — High  
**Status:** ✅ Implemented

---

#### US-019 — Share Profile Card
> *As a user who wants to network, I want to generate a visual shareable profile card for WhatsApp and Instagram so that I can share my professional credentials easily.*

**Acceptance Criteria:**
- [ ] Card shows name, title, key skills, KaziAI branding
- [ ] Shareable via native share API
- [ ] Visually polished, Tanzanian brand feel

**Priority:** P2 — Medium  
**Status:** ✅ Implemented

---

## 5. Proposed New Features & User Stories

---

### 5.1 CV Export & Download

#### US-020 — Download CV as PDF
> *As a job seeker, I want to download my completed CV as a PDF so that I can send it via email or WhatsApp to employers.*

**Why it matters:** This is arguably the most critical missing feature. Users build their CV in the app but currently cannot export it.

**Acceptance Criteria:**
- [ ] Export renders the same layout as the preview
- [ ] File name is auto-generated: `[FirstName]_[LastName]_CV.pdf`
- [ ] Works on mobile (downloads to device or shares via share sheet)
- [ ] Multiple template styles available (Classic, Modern, Minimal)

**Priority:** P0 — Critical  
**Effort:** Medium

---

#### US-021 — Multiple CV Templates
> *As a user applying to different sectors, I want to choose from multiple CV design templates so that my CV looks appropriate for the role (corporate vs. creative vs. NGO).*

**Acceptance Criteria:**
- [ ] At least 3 templates: Professional, Modern, Government/Formal
- [ ] Real-time template switching in preview
- [ ] Template selection persists per profile

**Priority:** P1 — High  
**Effort:** Medium

---

### 5.2 Real Job Listings & Alerts

#### US-022 — Live Job Feed Integration
> *As a job seeker, I want to see real, up-to-date job listings scraped from Tanzanian job boards (BrighterMonday, LinkedIn, Government portals) so that I have access to actual opportunities.*

**Acceptance Criteria:**
- [ ] Jobs updated daily from external sources
- [ ] Source tag shown (BrighterMonday, UTUMISHI, etc.)
- [ ] Application links to external sites
- [ ] Deduplication across sources

**Priority:** P0 — Critical  
**Effort:** High (requires backend + scraper/API)

---

#### US-023 — Job Alerts via WhatsApp/SMS
> *As a busy user, I want to receive WhatsApp or SMS alerts for new jobs matching my profile so that I never miss an opportunity.*

**Acceptance Criteria:**
- [ ] User opts into alerts during onboarding or settings
- [ ] Alerts sent maximum once daily
- [ ] Alert includes: job title, company, salary, quick apply link
- [ ] WhatsApp Business API or Africa's Talking SMS integration

**Priority:** P1 — High  
**Effort:** High (requires backend)

---

### 5.3 AI Enhancements

#### US-024 — CV Score & Improvement Suggestions
> *As a user who has completed my CV, I want an AI to analyze it and give me a quality score with specific improvement suggestions so that I know my CV is competitive.*

**Acceptance Criteria:**
- [ ] Score out of 100 with breakdown by section
- [ ] Specific, actionable suggestions (e.g., "Your summary is too short — add 2 more sentences")
- [ ] Comparison to top-performing CVs in the same sector
- [ ] Re-score after edits

**Priority:** P1 — High  
**Effort:** Low (Claude API prompt engineering)

---

#### US-025 — AI Interview Answer Feedback
> *As a user practicing interview answers, I want AI to evaluate my typed answer and give me feedback on clarity, relevance, and structure so that I actively improve.*

**Acceptance Criteria:**
- [ ] User types or speaks an answer to a practice question
- [ ] AI scores it on: Relevance, Structure (STAR), Clarity, Confidence
- [ ] Specific improvement tips given
- [ ] Example of a better answer provided

**Priority:** P1 — High  
**Effort:** Low–Medium

---

#### US-026 — AI-Powered Application Letter Personalization
> *As a user applying to a government or NGO role, I want the AI to generate a formal application letter in the correct Tanzanian format so that my application meets local expectations.*

**Acceptance Criteria:**
- [ ] Output follows formal Tanzanian letter structure
- [ ] Available in Kiswahili (critical for government applications)
- [ ] Fields auto-filled from user profile + job posting
- [ ] Copy and download options

**Priority:** P1 — High  
**Effort:** Low

---

### 5.4 User Accounts & Cloud Sync

#### US-027 — User Authentication
> *As a returning user, I want to create an account with my phone number or Google so that my data is saved to the cloud and accessible across devices.*

**Acceptance Criteria:**
- [ ] Sign up via phone number (OTP via Africa's Talking) or Google OAuth
- [ ] CV and application data synced to cloud
- [ ] Offline fallback with local storage
- [ ] Data privacy: GDPR-aligned, user can delete account

**Priority:** P0 — Critical  
**Effort:** High (requires backend)

---

#### US-028 — CV Version History
> *As a user who updates my CV frequently, I want to save multiple versions so that I can revert to a previous version if needed.*

**Acceptance Criteria:**
- [ ] Up to 5 CV snapshots saved
- [ ] Each snapshot timestamped and optionally labeled
- [ ] One-click restore

**Priority:** P2 — Medium  
**Effort:** Low (with cloud backend)

---

### 5.5 Networking & Community

#### US-029 — Professional Networking Directory
> *As a Tanzanian professional, I want to browse and connect with other KaziAI users in my sector so that I can grow my professional network locally.*

**Acceptance Criteria:**
- [ ] Opt-in directory of users (name, title, sector, location)
- [ ] Connection request system
- [ ] In-app messaging
- [ ] Profile visibility controls

**Priority:** P2 — Medium  
**Effort:** High

---

#### US-030 — Mentor Matching
> *As a junior professional, I want to be matched with a senior mentor in my sector so that I can get real-world career guidance.*

**Acceptance Criteria:**
- [ ] Mentors opt in and set availability
- [ ] Matching by sector, experience level, location
- [ ] Structured session booking (30 min video/voice call)
- [ ] Rating and review system post-session

**Priority:** P2 — Medium  
**Effort:** High

---

### 5.6 Employer-Facing Features

#### US-031 — Employer Portal
> *As an employer in Tanzania, I want to post jobs on KaziAI and be matched with qualified candidates so that I can hire faster without expensive recruitment agencies.*

**Acceptance Criteria:**
- [ ] Employer registration and company verification
- [ ] Job posting with requirements, salary, deadline
- [ ] AI-matched candidate shortlist
- [ ] Direct contact with candidates
- [ ] Tiered pricing (free: 2 posts/month, premium: unlimited)

**Priority:** P1 — High (Revenue Driver)  
**Effort:** Very High

---

### 5.7 Payments & Premium

#### US-032 — KaziAI Premium Subscription
> *As a serious job seeker, I want to pay a small monthly fee for premium features (unlimited AI, PDF downloads, priority job matching) so that I get better outcomes faster.*

**Acceptance Criteria:**
- [ ] Free tier: 5 AI generations/day, 1 CV template, basic job listings
- [ ] Premium tier (TZS 5,000/month): Unlimited AI, all templates, PDF export, live job alerts
- [ ] Payment via M-Pesa (Vodacom/Tigo), Airtel Money, card
- [ ] Family/University plan for bulk access

**Priority:** P1 — High (Revenue Driver)  
**Effort:** High

---

### 5.8 Accessibility & Offline

#### US-033 — Offline Mode
> *As a user in an area with unstable internet, I want core features (CV builder, saved jobs, interview prep) to work offline so that I can use the app anywhere in Tanzania.*

**Acceptance Criteria:**
- [ ] CV builder fully functional offline
- [ ] Question bank cached for offline access
- [ ] AI features show "Connect to the internet" state gracefully
- [ ] Data syncs when connection restores

**Priority:** P1 — High  
**Effort:** Medium

---

#### US-034 — Voice Input for CV Fields
> *As a user who types slowly or prefers speaking, I want to fill in CV fields using my voice so that building a CV is faster and more accessible.*

**Acceptance Criteria:**
- [ ] Voice input on all text fields
- [ ] Supports Kiswahili and English speech recognition
- [ ] Confirmation step before saving transcribed text

**Priority:** P2 — Medium  
**Effort:** Medium

---

## 6. Feature Priority Matrix

| Feature | Priority | Effort | Impact | Status |
|---|---|---|---|---|
| PDF CV Export | P0 | Medium | Very High | 🔴 Not built |
| Live Job Listings | P0 | High | Very High | 🔴 Not built |
| User Authentication / Cloud Sync | P0 | High | Very High | 🔴 Not built |
| CV Score & AI Suggestions | P1 | Low | High | 🔴 Not built |
| Job Alerts (WhatsApp/SMS) | P1 | High | High | 🔴 Not built |
| M-Pesa Payment / Premium | P1 | High | High (Revenue) | 🔴 Not built |
| AI Interview Feedback | P1 | Medium | High | 🔴 Not built |
| Formal Application Letter (SW) | P1 | Low | High | 🔴 Not built |
| Multiple CV Templates | P1 | Medium | High | 🔴 Not built |
| Offline Mode | P1 | Medium | High | 🔴 Not built |
| Employer Portal | P1 | Very High | Very High (Revenue) | 🔴 Not built |
| CV Version History | P2 | Low | Medium | 🔴 Not built |
| Mentor Matching | P2 | High | Medium | 🔴 Not built |
| Networking Directory | P2 | High | Medium | 🔴 Not built |
| Voice Input | P2 | Medium | Medium | 🔴 Not built |
| Language Selection | P0 | Low | Critical | ✅ Built |
| CV Builder (all sections) | P0 | Medium | Critical | ✅ Built |
| AI Summary Generator | P0 | Low | Very High | ✅ Built |
| Job Listings (Seed Data) | P0 | Low | High | ✅ Built |
| Application Tracker | P1 | Medium | High | ✅ Built |
| AI Cover Letter | P1 | Low | High | ✅ Built |
| Salary Guide | P1 | Low | High | ✅ Built |
| Interview Prep + AI Mock | P1 | Medium | High | ✅ Built |
| AI Job Coach Chat | P1 | Medium | High | ✅ Built |
| Skills Gap Analyzer | P1 | Medium | High | ✅ Built |
| Career Path Explorer | P2 | Medium | Medium | ✅ Built |
| Soft Skills Trainer | P2 | Medium | Medium | ✅ Built |
| Profile Share Card | P2 | Low | Medium | ✅ Built |

---

## 7. Recommended Next Sprint (V1.1)

1. **PDF Export** — Single highest-impact missing feature
2. **Claude API Key Management** — Ensure AI works for all users (env var setup)
3. **CV Score AI** — Low effort, high value, uses existing Claude integration
4. **Formal Application Letter in Kiswahili** — Critical for government applications
5. **Offline Mode** — Tanzania's connectivity challenges make this essential

---

## 8. Recommended V2.0 Scope

1. User Accounts + Phone OTP auth (Africa's Talking)
2. Real job listings (BrighterMonday API or scraper)
3. M-Pesa payment integration for Premium
4. Employer Portal (MVP)
5. WhatsApp job alerts

---

## 9. Technical Architecture Notes

### Current Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Custom CSS (Kazi brand)
- **Animations:** Motion (Framer Motion v12)
- **AI:** Anthropic Claude API (`@anthropic-ai/sdk`)
- **State:** React Context + localStorage
- **Icons:** Lucide React
- **UI Components:** Radix UI (Shadcn pattern)

### Required for V2
- **Backend:** Node.js (Express/Fastify) or Supabase
- **Database:** PostgreSQL (via Supabase or Neon)
- **Auth:** Supabase Auth (phone OTP)
- **File Storage:** Supabase Storage (for PDF export)
- **SMS/WhatsApp:** Africa's Talking API
- **Payments:** Flutterwave or DPO Pay (M-Pesa support)
- **Job Data:** BrighterMonday API or custom scraper

---

## 10. Success Metrics

| Metric | V1 Target | V2 Target |
|---|---|---|
| Monthly Active Users | 1,000 | 10,000 |
| CVs Created | 500 | 5,000 |
| AI Summaries Generated | 300 | 3,000 |
| App Store Rating | — | 4.5+ |
| Premium Conversion | — | 5% |
| Job Applications Tracked | 200 | 2,000 |
| WhatsApp Share Rate | 10% | 20% |

---

*Document prepared by KaziAI Product Team — CREOVA Solutions 🇹🇿*
