import { View, Text, Pressable } from 'react-native';
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createSecureStorage } from '../secure-storage';
import { createStatePersistence } from './statePersistence';

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
  institution: string;
  gradYear: string;
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
  followedCompanies: string[];
}

const makeId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const defaultCV: CV = {
  firstName: '', lastName: '', title: '', phone: '', email: '',
  location: '', country: 'Tanzania', institution: '', gradYear: '',
  linkedin: '', summary: '',
  experience: [], education: [], skills: [],
  languages: [{ lang: 'Kiswahili', level: 'Native' }, { lang: 'English', level: 'Fluent' }],
  references: [], targetSector: [], experienceLevel: 'entry', educationLevel: 'degree',
};

const defaultState: AppState = {
  language: 'en', onboardingComplete: false, cv: defaultCV,
  savedJobs: [], appliedJobs: [], applications: [], coachMessages: [],
  followedCompanies: [],
};

const LEGACY_STORAGE_KEY = 'kazi_ai_state_v2';
// CV and profile are PII: stored via secure-storage (SecureStore + AES-GCM),
// not plaintext AsyncStorage. The legacy plaintext copy is migrated, verified
// and deleted on first launch (CRE-48 / mobile audit 2026-10-09).
const storage = createSecureStorage({ namespace: 'kazi', legacyKeys: { state: LEGACY_STORAGE_KEY } });
// A failed load blocks all saves, so defaults can never overwrite the real CV.
const persistence = createStatePersistence(storage, 'state');

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
  toggleFollowCompany: (id: string) => void;
  /** Wipes all on-device data. Rejects if the wipe was incomplete; callers must tell the user. */
  clearAll: () => Promise<void>;
  /** Set when a background save fails; data on device is the last good save. */
  saveError: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    persistence.load().then(raw => {
      if (cancelled) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setState({
            ...defaultState, ...parsed,
            cv: { ...defaultCV, ...parsed.cv },
            followedCompanies: parsed.followedCompanies ?? [],
          });
        } catch {
          // Unparseable stored state: do not start with defaults (a save would
          // overwrite it). Treat as a load error.
          setLoadError(true);
          return;
        }
      }
      setLoaded(true);
    }, () => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [loadAttempt]);

  useEffect(() => {
    if (!loaded || loadError) return;
    persistence.save(JSON.stringify(state)).then(() => setSaveError(false), () => setSaveError(true));
  }, [state, loaded, loadError]);

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
        const apps = [...s.applications]; apps[existing] = full;
        return { ...s, applications: apps };
      }
      return { ...s, applications: [...s.applications, full] };
    }),
    updateApplicationStatus: (jobId, status) => update(s => ({
      ...s, applications: s.applications.map(a => a.jobId === jobId ? { ...a, status } : a)
    })),
    addCoachMessage: (msg) => update(s => ({ ...s, coachMessages: [...s.coachMessages, msg] })),
    clearCoachMessages: () => update(s => ({ ...s, coachMessages: [] })),
    toggleFollowCompany: (id) => update(s => ({
      ...s, followedCompanies: s.followedCompanies.includes(id)
        ? s.followedCompanies.filter(c => c !== id)
        : [...s.followedCompanies, id]
    })),
    clearAll: async () => {
      // Serialised with saves inside secure-storage; errors propagate to the UI.
      await persistence.clear();
      setState(defaultState);
    },
    saveError,
  }), [state, saveError]);

  if (loadError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 16 }}>
          We couldn't open your saved data on this device. Nothing has been changed or deleted.
          {'\n\n'}Hatukuweza kufungua data yako iliyohifadhiwa. Hakuna kilichobadilishwa au kufutwa.
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setLoadAttempt(a => a + 1)} style={{ padding: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600' }}>Try again / Jaribu tena</Text>
        </Pressable>
      </View>
    );
  }
  if (!loaded) return null;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
