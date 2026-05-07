import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'sw' | 'en';
export type JobSector = 'government' | 'ngo' | 'private' | 'informal' | 'tech' | 'health' | 'education' | 'finance';
export type EducationLevel = 'primary' | 'secondary' | 'certificate' | 'diploma' | 'degree' | 'masters' | 'phd';
export type ExperienceLevel = 'none' | 'entry' | 'mid' | 'senior';

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  grade?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'language' | 'soft' | 'professional';
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  email?: string;
  relationship: string;
}

export interface CVProfile {
  // Personal
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  nationality: string;
  linkedin?: string;
  // Summary
  summary: string;
  // Content
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  references: Reference[];
  certificates: Certificate[];
  languages: { lang: string; level: string }[];
  // Meta
  targetSector: JobSector[];
  experienceLevel: ExperienceLevel;
  completionPct: number;
}

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  sector: JobSector;
  salary?: string;
  deadline?: string;
  matchScore: number;
  tags: string[];
  description: string;
  requirements: string[];
}


export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface ApplicationEntry {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  appliedDate?: string;
  interviewDate?: string;
  notes: string;
  salary?: string;
}

export interface AppState {
  language: Language;
  onboardingComplete: boolean;
  cv: CVProfile;
  savedJobs: string[];
  appliedJobs: string[];
  interviewPrep: Record<string, boolean>;
  aiSummaryGenerated: boolean;
  lastGeneratedSummary: string;
  templateId: number;
  applications: ApplicationEntry[];
  coachMessages: {role:string;text:string}[];
}

const defaultCV: CVProfile = {
  firstName: '', lastName: '', title: '', email: '', phone: '',
  location: '', nationality: 'Tanzanian', linkedin: '',
  summary: '',
  experience: [], education: [], skills: [], references: [],
  languages: [{ lang: 'Kiswahili', level: 'Native' }, { lang: 'English', level: 'Fluent' }],
  targetSector: [], experienceLevel: 'entry', completionPct: 0,
};

const defaultState: AppState = {
  language: 'sw', onboardingComplete: false,
  cv: defaultCV, savedJobs: [], appliedJobs: [],
  interviewPrep: {}, aiSummaryGenerated: false,
  lastGeneratedSummary: '', templateId: 1,
  applications: [], coachMessages: [],
};

function calcCompletion(cv: CVProfile): number {
  let pts = 0, total = 10;
  if (cv.firstName && cv.lastName) pts++;
  if (cv.title) pts++;
  if (cv.email && cv.phone) pts++;
  if (cv.location) pts++;
  if (cv.summary?.length > 30) pts++;
  if (cv.experience.length > 0) pts++;
  if (cv.education.length > 0) pts++;
  if (cv.skills.length >= 3) pts++;
  if (cv.references.length > 0) pts++;
  if (cv.languages.length > 0) pts++;
  return Math.round((pts / total) * 100);
}

function persist(state: AppState) {
  try { localStorage.setItem('kazi_state', JSON.stringify(state)); } catch {}
}

function load(): AppState {
  try {
    const raw = localStorage.getItem('kazi_state');
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch { return defaultState; }
}

interface AppContextType {
  state: AppState;
  setLanguage: (l: Language) => void;
  updateCV: (updates: Partial<CVProfile>) => void;
  addExperience: (exp: Omit<WorkExperience, 'id'>) => void;
  updateExperience: (id: string, updates: Partial<WorkExperience>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  removeSkill: (id: string) => void;
  addReference: (ref: Omit<Reference, 'id'>) => void;
  removeReference: (id: string) => void;
  toggleSaveJob: (id: string) => void;
  markApplied: (id: string) => void;
  completeOnboarding: () => void;
  setTemplate: (id: number) => void;
  setAISummary: (summary: string) => void;
  clearAll: () => void;
  addCertificate: (c: Omit<Certificate, "id">) => void;
  removeCertificate: (id: string) => void;
  upsertApplication: (app: Omit<ApplicationEntry, "id">) => void;
  updateApplicationStatus: (jobId: string, status: ApplicationEntry["status"], extra?: Partial<ApplicationEntry>) => void;
  removeApplication: (jobId: string) => void;
  addCoachMessage: (msg: {role:string;text:string}) => void;
  clearCoachMessages: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => { persist(state); }, [state]);

  const setLang = (language: Language) => setState(p => ({ ...p, language }));

  const updateCV = (updates: Partial<CVProfile>) =>
    setState(p => {
      const cv = { ...p.cv, ...updates };
      cv.completionPct = calcCompletion(cv);
      return { ...p, cv };
    });

  const mkId = () => Math.random().toString(36).substr(2, 9);

  const addExperience = (exp: Omit<WorkExperience, 'id'>) =>
    setState(p => { const cv = { ...p.cv, experience: [...p.cv.experience, { ...exp, id: mkId() }] }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const updateExperience = (id: string, updates: Partial<WorkExperience>) =>
    setState(p => { const cv = { ...p.cv, experience: p.cv.experience.map(e => e.id === id ? { ...e, ...updates } : e) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const removeExperience = (id: string) =>
    setState(p => { const cv = { ...p.cv, experience: p.cv.experience.filter(e => e.id !== id) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const addEducation = (edu: Omit<Education, 'id'>) =>
    setState(p => { const cv = { ...p.cv, education: [...p.cv.education, { ...edu, id: mkId() }] }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const updateEducation = (id: string, updates: Partial<Education>) =>
    setState(p => { const cv = { ...p.cv, education: p.cv.education.map(e => e.id === id ? { ...e, ...updates } : e) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const removeEducation = (id: string) =>
    setState(p => { const cv = { ...p.cv, education: p.cv.education.filter(e => e.id !== id) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const addSkill = (skill: Omit<Skill, 'id'>) =>
    setState(p => { const cv = { ...p.cv, skills: [...p.cv.skills, { ...skill, id: mkId() }] }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const removeSkill = (id: string) =>
    setState(p => { const cv = { ...p.cv, skills: p.cv.skills.filter(s => s.id !== id) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const addReference = (ref: Omit<Reference, 'id'>) =>
    setState(p => { const cv = { ...p.cv, references: [...p.cv.references, { ...ref, id: mkId() }] }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const removeReference = (id: string) =>
    setState(p => { const cv = { ...p.cv, references: p.cv.references.filter(r => r.id !== id) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const toggleSaveJob = (id: string) =>
    setState(p => ({ ...p, savedJobs: p.savedJobs.includes(id) ? p.savedJobs.filter(j => j !== id) : [...p.savedJobs, id] }));

  const markApplied = (id: string) =>
    setState(p => ({ ...p, appliedJobs: [...new Set([...p.appliedJobs, id])] }));

  const completeOnboarding = () => setState(p => ({ ...p, onboardingComplete: true }));

  const setTemplate = (templateId: number) => setState(p => ({ ...p, templateId }));

  const setAISummary = (summary: string) =>
    setState(p => ({ ...p, aiSummaryGenerated: true, lastGeneratedSummary: summary, cv: { ...p.cv, summary, completionPct: calcCompletion({ ...p.cv, summary }) } }));

  const clearAll = () => { localStorage.removeItem('kazi_state'); setState(defaultState); };


  const addCertificate = (c: Omit<Certificate, 'id'>) =>
    setState(p => { const cv = { ...p.cv, certificates: [...(p.cv.certificates||[]), { ...c, id: mkId() }] }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const removeCertificate = (id: string) =>
    setState(p => { const cv = { ...p.cv, certificates: (p.cv.certificates||[]).filter(c => c.id !== id) }; cv.completionPct = calcCompletion(cv); return { ...p, cv }; });

  const upsertApplication = (app: Omit<ApplicationEntry, 'id'>) =>
    setState(p => {
      const exists = (p.applications||[]).find(a => a.jobId === app.jobId);
      if (exists) return { ...p, applications: p.applications.map(a => a.jobId === app.jobId ? { ...a, ...app } : a) };
      return { ...p, applications: [...(p.applications||[]), { ...app, id: mkId() }] };
    });

  const updateApplicationStatus = (jobId: string, status: ApplicationEntry['status'], extra?: Partial<ApplicationEntry>) =>
    setState(p => ({ ...p, applications: (p.applications||[]).map(a => a.jobId === jobId ? { ...a, status, ...extra } : a) }));

  const removeApplication = (jobId: string) =>
    setState(p => ({ ...p, applications: (p.applications||[]).filter(a => a.jobId !== jobId) }));

  const addCoachMessage = (msg: {role:string;text:string}) =>
    setState(p => ({ ...p, coachMessages: [...(p.coachMessages||[]), msg] }));

  const clearCoachMessages = () => setState(p => ({ ...p, coachMessages: [] }));

  return (
    <AppContext.Provider value={{
      state, setLanguage: setLang, updateCV,
      addExperience, updateExperience, removeExperience,
      addEducation, updateEducation, removeEducation,
      addSkill, removeSkill,
      addReference, removeReference,
      toggleSaveJob, markApplied, completeOnboarding,
      setTemplate, setAISummary, clearAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}

// ── Root ──────────────────────────────────────────────────────────────────────
import { SplashScreen } from '@/app/components/onboarding/SplashScreen';
import { LanguagePick } from '@/app/components/onboarding/LanguagePick';
import { ProfileSetup } from '@/app/components/onboarding/ProfileSetup';
import { MainApp } from '@/app/components/MainApp';
import { Toaster } from '@/app/components/ui/sonner';

function AppContent() {
  const { state, completeOnboarding } = useApp();
  const [step, setStep] = useState<'splash' | 'lang' | 'profile' | 'app'>('splash');

  useEffect(() => {
    if (state.onboardingComplete) setStep('app');
  }, [state.onboardingComplete]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--cream)' }}>
      {step === 'splash' && <SplashScreen onNext={() => setStep(state.onboardingComplete ? 'app' : 'lang')} />}
      {step === 'lang' && <LanguagePick onNext={() => setStep('profile')} />}
      {step === 'profile' && <ProfileSetup onNext={() => { completeOnboarding(); setStep('app'); }} />}
      {step === 'app' && <MainApp />}
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return <AppProvider><AppContent /></AppProvider>;
}
