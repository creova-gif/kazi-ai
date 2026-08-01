// Kazi AI TypeScript Interfaces

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  field?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4; // 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface CVProfile {
  fullName: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  summary: string;
  sector: string;
  experienceLevel: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  references: Reference[];
  languages: Language[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  tags: string[];
  sector: string;
  postedDays: number;
  saved: boolean;
  applied: boolean;
}

export interface AppState {
  profile: CVProfile;
  jobs: Job[];
  currentView: 'splash' | 'cv' | 'jobs' | 'prep' | 'profile' | 'preview';
  onboardingComplete: boolean;
  language: 'sw' | 'en';
}
