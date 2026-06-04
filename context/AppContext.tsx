import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'sw' | 'en';
export type JobSector = 'government' | 'ngo' | 'private' | 'informal' | 'tech' | 'health' | 'education' | 'finance';
export type EACountry = 'Tanzania' | 'Kenya' | 'Uganda' | 'Rwanda' | 'Ethiopia' | 'Other';

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

export interface CV {
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  country: EACountry;
  linkedin: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages: { lang: string; level: string }[];
  references: Reference[];
  targetSector: JobSector[];
  experienceLevel: 'none' | 'entry' | 'mid' | 'senior';
  educationLevel: string;
}

export interface Application {
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'saved' | 'interview' | 'offer' | 'rejected';
  notes: string;
  salary: string;
  dateApplied: string;
}

export interface CoachMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface AppState {
  language: Language;
  onboardingComplete: boolean;
  cv: CV;
  savedJobs: string[];
  appliedJobs: string[];
  applications: Application[];
  coachMessages: CoachMessage[];
}

const makeId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const defaultCV: CV = {
  firstName: '', lastName: '', title: '', phone: '', email: '',
  location: '', country: 'Tanzania', linkedin: '', summary: '',
  experience: [], education: [], skills: [],
  languages: [{ lang: 'Kiswahili', level: 'Native' }, { lang: 'English', level: 'Fluent' }],
  references: [], targetSector: [], experienceLevel: 'entry', educationLevel: 'degree',
};

const defaultState: AppState = {
  language: 'en', onboardingComplete: false, cv: defaultCV,
  savedJobs: [], appliedJobs: [], applications: [], coachMessages: [],
};

const STORAGE_KEY = 'kazi_ai_state_v2';

interface AppContextValue {
  state: AppState;
  setLanguage: (l: Language) => void;
  completeOnboarding: () => void;
  updateCV: (partial: Partial<CV>) => void;
  addExperience: (exp: Omit<WorkExperience, 'id'>) => void;
  removeExperience: (id: string) => void;
  addEducation: (edu: Omit<Education, 'id'>) => void;
  removeEducation: (id: string) => void;
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  removeSkill: (id: string) => void;
  addReference: (ref: Omit<Reference, 'id'>) => void;
  removeReference: (id: string) => void;
  toggleSaveJob: (id: string) => void;
  markApplied: (id: string) => void;
  upsertApplication: (app: Omit<Application, 'dateApplied'>) => void;
  updateApplicationStatus: (jobId: string, status: Application['status']) => void;
  addCoachMessage: (msg: CoachMessage) => void;
  clearCoachMessages: () => void;
  clearAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setState({ ...defaultState, ...parsed, cv: { ...defaultCV, ...parsed.cv } });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const update = (updater: (s: AppState) => AppState) => setState(prev => updater(prev));

  const value = useMemo<AppContextValue>(() => ({
    state,
    setLanguage: (language) => update(s => ({ ...s, language })),
    completeOnboarding: () => update(s => ({ ...s, onboardingComplete: true })),
    updateCV: (partial) => update(s => ({ ...s, cv: { ...s.cv, ...partial } })),
    addExperience: (exp) => update(s => ({ ...s, cv: { ...s.cv, experience: [...s.cv.experience, { ...exp, id: makeId() }] } })),
    removeExperience: (id) => update(s => ({ ...s, cv: { ...s.cv, experience: s.cv.experience.filter(e => e.id !== id) } })),
    addEducation: (edu) => update(s => ({ ...s, cv: { ...s.cv, education: [...s.cv.education, { ...edu, id: makeId() }] } })),
    removeEducation: (id) => update(s => ({ ...s, cv: { ...s.cv, education: s.cv.education.filter(e => e.id !== id) } })),
    addSkill: (skill) => update(s => ({ ...s, cv: { ...s.cv, skills: [...s.cv.skills, { ...skill, id: makeId() }] } })),
    removeSkill: (id) => update(s => ({ ...s, cv: { ...s.cv, skills: s.cv.skills.filter(sk => sk.id !== id) } })),
    addReference: (ref) => update(s => ({ ...s, cv: { ...s.cv, references: [...s.cv.references, { ...ref, id: makeId() }] } })),
    removeReference: (id) => update(s => ({ ...s, cv: { ...s.cv, references: s.cv.references.filter(r => r.id !== id) } })),
    toggleSaveJob: (id) => update(s => ({
      ...s, savedJobs: s.savedJobs.includes(id) ? s.savedJobs.filter(j => j !== id) : [...s.savedJobs, id]
    })),
    markApplied: (id) => update(s => ({
      ...s, appliedJobs: s.appliedJobs.includes(id) ? s.appliedJobs : [...s.appliedJobs, id]
    })),
    upsertApplication: (app) => update(s => {
      const existing = s.applications.findIndex(a => a.jobId === app.jobId);
      const full: Application = { ...app, dateApplied: new Date().toISOString().split('T')[0] };
      if (existing >= 0) {
        const apps = [...s.applications];
        apps[existing] = full;
        return { ...s, applications: apps };
      }
      return { ...s, applications: [...s.applications, full] };
    }),
    updateApplicationStatus: (jobId, status) => update(s => ({
      ...s, applications: s.applications.map(a => a.jobId === jobId ? { ...a, status } : a)
    })),
    addCoachMessage: (msg) => update(s => ({ ...s, coachMessages: [...s.coachMessages, msg] })),
    clearCoachMessages: () => update(s => ({ ...s, coachMessages: [] })),
    clearAll: () => { AsyncStorage.removeItem(STORAGE_KEY); setState(defaultState); },
  }), [state]);

  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
