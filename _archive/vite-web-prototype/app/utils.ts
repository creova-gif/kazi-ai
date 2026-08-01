import type { CVProfile, Job } from './types';

const STORAGE_KEY = 'kaziAI_data';

export const defaultProfile: CVProfile = {
  fullName: '',
  title: '',
  phone: '',
  email: '',
  location: '',
  summary: '',
  sector: '',
  experienceLevel: '',
  workExperience: [],
  education: [],
  skills: [],
  references: [],
  languages: []
};

export const seedJobs: Job[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Vodacom Tanzania',
    location: 'Dar es Salaam',
    salary: 'TZS 2.5M–4M/mwezi',
    description: 'Build mobile and web applications for millions of Tanzanian users',
    requirements: ['React', 'Node.js', 'Mobile development experience'],
    tags: ['React', 'Node.js', 'Mobile'],
    sector: 'tech',
    postedDays: 29,
    saved: false,
    applied: false
  },
  {
    id: '2',
    title: 'Data Analyst',
    company: 'Selcom',
    location: 'Dar es Salaam',
    salary: 'TZS 2M–3.5M/mwezi',
    description: 'Analyze payment data and build dashboards for business insights',
    requirements: ['Python', 'SQL', 'Power BI', 'Data visualization'],
    tags: ['Python', 'SQL', 'Power BI'],
    sector: 'fintech',
    postedDays: 12,
    saved: false,
    applied: false
  },
  {
    id: '3',
    title: 'Accountant',
    company: 'CRDB Bank',
    location: 'Dar es Salaam',
    salary: 'TZS 1.8M–2.8M/mwezi',
    description: 'Manage financial records and ensure IFRS compliance',
    requirements: ['Accounting degree', 'Excel', 'IFRS knowledge'],
    tags: ['Accounting', 'Excel', 'IFRS'],
    sector: 'finance',
    postedDays: 14,
    saved: false,
    applied: false
  },
  {
    id: '4',
    title: 'Program Officer',
    company: 'UNICEF Tanzania',
    location: 'Dar es Salaam',
    salary: 'USD 2,000–3,500/mwezi',
    description: 'Lead child protection programs across Tanzania',
    requirements: ['Project Management', 'M&E', 'Community engagement'],
    tags: ['Project Mgmt', 'M&E'],
    sector: 'ngo',
    postedDays: 15,
    saved: false,
    applied: false
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Azam Media',
    location: 'Dar es Salaam',
    salary: 'TZS 3M–5M/mwezi',
    description: 'Manage cloud infrastructure for streaming platform',
    requirements: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    tags: ['AWS', 'Docker', 'K8s'],
    sector: 'tech',
    postedDays: 7,
    saved: false,
    applied: false
  },
  {
    id: '6',
    title: 'Nurse',
    company: 'Aga Khan Hospital',
    location: 'Dar es Salaam',
    salary: 'TZS 1.2M–2M/mwezi',
    description: 'Provide patient care in emergency department',
    requirements: ['Nursing degree', 'Valid license', '2+ years experience'],
    tags: ['Healthcare', 'Emergency'],
    sector: 'health',
    postedDays: 5,
    saved: false,
    applied: false
  },
  {
    id: '7',
    title: 'Policy Analyst',
    company: 'Ministry of Health',
    location: 'Dodoma',
    salary: 'TZS 1.5M–2.5M/mwezi',
    description: 'Develop healthcare policies and programs',
    requirements: ['Public health degree', 'Policy experience', 'Research skills'],
    tags: ['Policy', 'Research'],
    sector: 'government',
    postedDays: 18,
    saved: false,
    applied: false
  },
  {
    id: '8',
    title: 'Math Teacher',
    company: 'Shule Direct',
    location: 'Remote',
    salary: 'TZS 800K–1.5M/mwezi',
    description: 'Create engaging video lessons for secondary students',
    requirements: ['Teaching experience', 'Math expertise', 'Video skills'],
    tags: ['EdTech', 'Math', 'Video'],
    sector: 'education',
    postedDays: 21,
    saved: false,
    applied: false
  }
];

export function loadData() {
  if (typeof window === 'undefined') return { profile: defaultProfile, jobs: seedJobs };

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { profile: defaultProfile, jobs: seedJobs };
  }

  try {
    const data = JSON.parse(stored);
    return {
      profile: { ...defaultProfile, ...data.profile },
      jobs: data.jobs || seedJobs
    };
  } catch {
    return { profile: defaultProfile, jobs: seedJobs };
  }
}

export function saveData(profile: CVProfile, jobs: Job[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, jobs }));
}

export function calculateCompletion(profile: CVProfile): number {
  let score = 0;

  // Personal info (10 points each = 50 total)
  if (profile.fullName) score += 10;
  if (profile.title) score += 10;
  if (profile.phone) score += 10;
  if (profile.email) score += 10;
  if (profile.location) score += 10;

  // Summary (10 points)
  if (profile.summary) score += 10;

  // Work experience (10 points if at least 1)
  if (profile.workExperience.length > 0) score += 10;

  // Education (10 points if at least 1)
  if (profile.education.length > 0) score += 10;

  // Skills (10 points if at least 3)
  if (profile.skills.length >= 3) score += 10;

  // References (optional, 5 points if at least 2)
  if (profile.references.length >= 2) score += 5;

  // Languages (optional, 5 points if at least 1)
  if (profile.languages.length >= 1) score += 5;

  return Math.min(100, score);
}

export function calculateJobMatch(profile: CVProfile, job: Job): number {
  let score = 60; // Base score

  // Sector match (+20)
  if (profile.sector && profile.sector.toLowerCase() === job.sector.toLowerCase()) {
    score += 20;
  }

  // Skills match (+15 max, 3 per matching skill)
  const profileSkillNames = profile.skills.map(s => s.name.toLowerCase());
  const matchingSkills = job.tags.filter(tag =>
    profileSkillNames.some(skill => skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill))
  );
  score += Math.min(15, matchingSkills.length * 5);

  // Experience level match (+5)
  if (profile.experienceLevel === 'experienced' && job.requirements.length > 3) {
    score += 5;
  }

  return Math.min(100, score);
}

export function generateInitials(fullName: string): string {
  if (!fullName) return 'JM';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
