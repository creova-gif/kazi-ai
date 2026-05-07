import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bookmark, BookmarkCheck, MapPin, Clock, ChevronRight, X } from 'lucide-react';
import { useApp, type JobMatch, type JobSector } from '@/app/App';
import { ApplicationTracker } from './ApplicationTracker';
import { SalaryGuide } from './SalaryGuide';
import { CoverLetterSheet } from './CoverLetterSheet';
import { ApplicationLetterSheet } from './ApplicationLetterSheet';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

// Sample job data — in production would come from an API
const JOBS: JobMatch[] = [
  { id: '1', title: 'Software Engineer', company: 'Vodacom Tanzania', location: 'Dar es Salaam', sector: 'tech', salary: 'TZS 2.5M–4M/mwezi', deadline: '2026-06-15', matchScore: 92, tags: ['React', 'Node.js', 'Mobile'], description: 'Vodacom Tanzania is looking for a talented Software Engineer to join our digital products team. You will build and maintain mobile and web applications serving millions of Tanzanians.', requirements: ['B.Sc. Computer Science or related', '2+ years web development experience', 'Knowledge of React or Vue.js', 'English and Swahili communication skills'] },
  { id: '2', title: 'Accountant', company: 'CRDB Bank', location: 'Dar es Salaam', sector: 'finance', salary: 'TZS 1.8M–2.8M/mwezi', deadline: '2026-06-30', matchScore: 87, tags: ['Accounting', 'Excel', 'IFRS'], description: 'CRDB Bank seeks a qualified accountant to support financial reporting and compliance activities across our branch network.', requirements: ['CPA (T) or B.Com Accounting', '1-3 years banking experience preferred', 'Proficiency in Excel and QuickBooks', 'Strong analytical skills'] },
  { id: '3', title: 'Program Officer', company: 'UNICEF Tanzania', location: 'Dar es Salaam', sector: 'ngo', salary: 'USD 2,000–3,500/mwezi', deadline: '2026-06-01', matchScore: 78, tags: ['Project Management', 'M&E', 'Report Writing'], description: 'UNICEF Tanzania is looking for a Program Officer to support education and child protection programs in mainland Tanzania and Zanzibar.', requirements: ['Masters degree in social sciences or development', '3+ years program management experience', 'Strong report writing skills', 'Experience with UN or NGO programs'] },
  { id: '4', title: 'Secondary School Teacher', company: 'Shule Direct', location: 'Multiple Regions', sector: 'education', salary: 'TZS 800K–1.4M/mwezi', deadline: '2026-06-20', matchScore: 74, tags: ['Teaching', 'Mathematics', 'English'], description: 'Shule Direct is hiring qualified secondary school teachers for Form 1-4 across Tanzania. Join our mission to improve education quality.', requirements: ['Diploma or Degree in Education', 'TCU registered', 'Subject specialization in STEM or Languages', 'Passion for student success'] },
  { id: '5', title: 'Data Analyst', company: 'Selcom', location: 'Dar es Salaam', sector: 'tech', salary: 'TZS 2M–3.5M/mwezi', deadline: '2026-06-28', matchScore: 85, tags: ['Python', 'SQL', 'Power BI'], description: 'Selcom Wireless seeks a Data Analyst to derive insights from transaction data and support business decisions.', requirements: ['B.Sc. Statistics, Mathematics, or Computer Science', 'Strong SQL and Excel skills', 'Experience with data visualization tools', 'Financial services experience a plus'] },
  { id: '6', title: 'Nurse (RN)', company: 'Aga Khan Hospital', location: 'Dar es Salaam', sector: 'health', salary: 'TZS 1.2M–2M/mwezi', deadline: '2026-06-10', matchScore: 80, tags: ['Nursing', 'Patient Care', 'ICU'], description: 'Aga Khan Hospital is hiring registered nurses with excellent clinical skills to join our growing team.', requirements: ['Diploma or Degree in Nursing', 'Registered with TNMC', '1+ years clinical experience', 'Good interpersonal skills'] },
  { id: '7', title: 'District Health Officer', company: 'Wizara ya Afya', location: 'Various Districts', sector: 'government', salary: 'TZS 900K–1.4M/mwezi', deadline: '2026-06-31', matchScore: 65, tags: ['Public Health', 'Government', 'Management'], description: 'The Ministry of Health is recruiting District Health Officers to coordinate health programs at district level.', requirements: ['B.Sc. Public Health or equivalent', 'Government employment readiness', 'Experience in community health', 'Valid driving license preferred'] },
  { id: '8', title: 'Marketing Manager', company: 'Azam Media', location: 'Dar es Salaam', sector: 'private', salary: 'TZS 2M–3.5M/mwezi', deadline: '2026-06-05', matchScore: 71, tags: ['Marketing', 'Digital Media', 'Strategy'], description: 'Azam Media seeks an experienced Marketing Manager to lead brand campaigns and grow viewership across all platforms.', requirements: ['B.A. Marketing or Business Administration', '4+ years marketing experience', 'Digital marketing expertise', 'Media industry experience preferred'] },
  { id: '9', title: 'Mobile App Developer', company: 'Jumo', location: 'Dar es Salaam', sector: 'tech', salary: 'TZS 2.5M–4.5M/mwezi', deadline: '2026-07-01', matchScore: 88, tags: ['Flutter', 'Dart', 'Firebase'], description: 'Jumo is building financial inclusion products for East Africa. We need a mobile developer to help grow our app to new markets.', requirements: ['2+ years Flutter or React Native experience', 'Experience with mobile financial services', 'Strong debugging skills', 'API integration experience'] },
  { id: '10', title: 'Loan Officer', company: 'Equity Bank Tanzania', location: 'Arusha', sector: 'finance', salary: 'TZS 1.5M–2.2M/mwezi', deadline: '2026-06-25', matchScore: 76, tags: ['Credit', 'Banking', 'SME Lending'], description: 'Equity Bank Tanzania seeks a Loan Officer to grow its SME loan portfolio and support entrepreneurs in Arusha region.', requirements: ['B.Com Finance or Accounting', 'Knowledge of credit analysis', '1+ years banking or microfinance experience', 'Kiswahili and English fluency'] },
  { id: '11', title: 'Field Coordinator', company: 'World Vision Tanzania', location: 'Dodoma', sector: 'ngo', salary: 'TZS 1.8M–2.5M/mwezi', deadline: '2026-06-18', matchScore: 72, tags: ['Field Work', 'Community Development', 'M&E'], description: 'World Vision Tanzania is hiring a Field Coordinator to implement child protection and WASH programs in Dodoma region.', requirements: ['B.A. Development Studies or Social Work', '2+ years field NGO experience', 'Experience with community mobilization', 'Valid driving license'] },
  { id: '12', title: 'Head of Department (Sciences)', company: 'Dar es Salaam International Academy', location: 'Dar es Salaam', sector: 'education', salary: 'TZS 2.5M–3.5M/mwezi', deadline: '2026-07-05', matchScore: 68, tags: ['Science', 'Leadership', 'IGCSE'], description: 'DISA is looking for an experienced Science HOD to lead its IGCSE science department and mentor junior teachers.', requirements: ['B.Ed. or B.Sc. in Science subject', '5+ years secondary teaching experience', 'IGCSE or A-Level teaching experience', 'Leadership experience in academic setting'] },
  { id: '13', title: 'Pharmacist', company: 'MSD (Medical Stores Dept)', location: 'Dar es Salaam', sector: 'government', salary: 'TZS 1.4M–2M/mwezi', deadline: '2026-06-30', matchScore: 69, tags: ['Pharmacy', 'Supply Chain', 'Government'], description: 'MSD is hiring pharmacists to support medicine supply chain and quality assurance programs.', requirements: ['B.Pharmacy from recognized institution', 'Registered with TFDA', 'Knowledge of supply chain management', 'Experience in public health systems'] },
  { id: '14', title: 'Sales Representative', company: 'Airtel Tanzania', location: 'Multiple Regions', sector: 'private', salary: 'TZS 800K–1.2M + commission', deadline: '2026-06-12', matchScore: 77, tags: ['Sales', 'Telecoms', 'Commission'], description: 'Airtel Tanzania is expanding its distribution network and needs Sales Representatives to grow subscriber base in key regions.', requirements: ['Diploma or Degree in any field', 'Strong communication and persuasion skills', 'Experience in sales or marketing', 'Motorcycle driving license preferred'] },
  { id: '15', title: 'Cybersecurity Analyst', company: 'TANESCO', location: 'Dar es Salaam', sector: 'government', salary: 'TZS 2.5M–4M/mwezi', deadline: '2026-07-10', matchScore: 83, tags: ['Cybersecurity', 'SIEM', 'Network Security'], description: 'TANESCO is strengthening its IT security infrastructure and seeks a Cybersecurity Analyst to protect critical energy systems.', requirements: ['B.Sc. Information Security or Computer Science', 'CompTIA Security+ or CISSP preferred', '2+ years security operations experience', 'Knowledge of SCADA systems a plus'] },
  { id: '16', title: 'Monitoring & Evaluation Officer', company: 'USAID Tanzania', location: 'Dar es Salaam', sector: 'ngo', salary: 'USD 1,800–2,800/mwezi', deadline: '2026-06-20', matchScore: 79, tags: ['M&E', 'PEPFAR', 'Data Management'], description: 'USAID Tanzania seeks an M&E Officer to track program indicators for health and agriculture development projects across Tanzania.', requirements: ['Masters in Public Health, Statistics, or related', '3+ years M&E experience', 'Proficiency in STATA, SPSS, or R', 'USAID/donor reporting experience'] },
  { id: '17', title: 'HR Officer', company: 'NMB Bank', location: 'Dar es Salaam', sector: 'finance', salary: 'TZS 1.8M–2.8M/mwezi', deadline: '2026-06-28', matchScore: 73, tags: ['HR', 'Recruitment', 'Performance Management'], description: 'NMB Bank needs a Human Resources Officer to support talent acquisition, employee relations and HR operations.', requirements: ['B.A. Human Resources or Business Administration', 'Knowledge of Tanzania Labour Laws', '2+ years HR experience', 'Excellent interpersonal and communication skills'] },
  { id: '18', title: 'Clinical Officer', company: 'Muhimbili National Hospital', location: 'Dar es Salaam', sector: 'health', salary: 'TZS 1.2M–1.8M/mwezi', deadline: '2026-06-15', matchScore: 70, tags: ['Clinical', 'Patient Care', 'Government Health'], description: 'MNH is recruiting Clinical Officers to provide quality outpatient and inpatient care across its departments.', requirements: ['Diploma in Clinical Medicine', 'Registered with CSST', '1+ years clinical experience', 'Ability to work shifts and night calls'] },
  { id: '19', title: 'Legal Officer', company: 'Tanzania Revenue Authority', location: 'Dar es Salaam', sector: 'government', salary: 'TZS 2M–3M/mwezi', deadline: '2026-07-15', matchScore: 66, tags: ['Law', 'Tax Law', 'Government'], description: 'TRA is looking for a Legal Officer to advise on tax disputes, contract review, and regulatory compliance matters.', requirements: ['LLB from recognized institution', 'Enrolled Advocate', '2+ years legal practice experience', 'Tax law knowledge is an advantage'] },
  { id: '20', title: 'Entrepreneur / SME Owner Support', company: 'Mkoba (BRAC Tanzania)', location: 'Multiple Regions', sector: 'informal', salary: 'TZS 600K–1.2M/mwezi', deadline: '2026-07-01', matchScore: 62, tags: ['Entrepreneurship', 'Microfinance', 'Business'], description: 'BRAC Tanzania Mkoba program is recruiting community entrepreneurs who want to build small businesses with group savings and training support.', requirements: ['Any educational background', 'Desire to start or grow a small business', 'Willingness to participate in group savings', 'Located in project district areas'] },
  { id: '21', title: 'UX/UI Designer', company: 'Nala Money', location: 'Dar es Salaam (Hybrid)', sector: 'tech', salary: 'USD 1,000–2,000/mwezi', deadline: '2026-07-20', matchScore: 86, tags: ['Figma', 'UX Research', 'Product Design'], description: 'Nala Money is redesigning its mobile remittance experience for East African users. We need a talented UX Designer who understands local contexts.', requirements: ['Portfolio demonstrating mobile UX', 'Proficiency in Figma', '2+ years product design experience', 'Experience designing for emerging markets'] },
  { id: '22', title: 'Agribusiness Extension Officer', company: 'ACT (Agriculture Council TZ)', location: 'Morogoro / Iringa', sector: 'ngo', salary: 'TZS 1.5M–2M/mwezi', deadline: '2026-06-30', matchScore: 60, tags: ['Agriculture', 'Extension Services', 'Farmers'], description: 'ACT is hiring extension officers to support smallholder farmers with training on modern farming techniques and market linkages.', requirements: ['B.Sc. Agriculture or Agricultural Economics', 'Experience working with farmers', 'Kiswahili fluency required', 'Willingness to work in rural areas'] },
  { id: '23', title: 'Supply Chain Manager', company: 'Mohammed Enterprises Tanzania', location: 'Dar es Salaam', sector: 'private', salary: 'TZS 3M–5M/mwezi', deadline: '2026-07-10', matchScore: 74, tags: ['Supply Chain', 'Procurement', 'Logistics'], description: 'MeTL is hiring a Supply Chain Manager to oversee procurement, warehousing and distribution across its diverse business divisions.', requirements: ['B.Sc. Procurement, Logistics, or Business', 'CIPS certification preferred', '5+ years supply chain experience', 'ERP system experience (SAP preferred)'] },
  { id: '24', title: 'Radio Presenter / Journalist', company: 'Clouds FM', location: 'Dar es Salaam', sector: 'private', salary: 'TZS 1M–2M/mwezi', deadline: '2026-06-25', matchScore: 63, tags: ['Journalism', 'Radio', 'Kiswahili'], description: 'Clouds FM is looking for a dynamic Radio Presenter to host morning and evening shows and produce engaging content for Tanzanian listeners.', requirements: ['Diploma or Degree in Mass Communication', 'Clear and engaging voice', 'Strong Kiswahili communication', 'Social media content experience a plus'] },
  { id: '25', title: 'Environmental Officer', company: 'NEMC (National Environment Mgmt Council)', location: 'Dar es Salaam', sector: 'government', salary: 'TZS 1.5M–2.2M/mwezi', deadline: '2026-07-08', matchScore: 67, tags: ['Environment', 'EIA', 'Government'], description: 'NEMC is recruiting Environmental Officers to conduct Environmental Impact Assessments and monitor compliance with environmental regulations.', requirements: ['B.Sc. Environmental Science or Natural Resources', 'Knowledge of EIA procedures', 'Experience in environmental monitoring', 'Report writing skills'] },
];

const SECTOR_LABELS: Record<JobSector, { sw: string; en: string; icon: string }> = {
  government: { sw: 'Serikali', en: 'Government', icon: '🏛️' },
  ngo: { sw: 'NGO', en: 'NGO', icon: '🌍' },
  tech: { sw: 'Teknolojia', en: 'Tech', icon: '💻' },
  health: { sw: 'Afya', en: 'Health', icon: '🏥' },
  education: { sw: 'Elimu', en: 'Education', icon: '🎓' },
  finance: { sw: 'Fedha', en: 'Finance', icon: '💰' },
  private: { sw: 'Makampuni', en: 'Private', icon: '🏢' },
  informal: { sw: 'SME', en: 'SME', icon: '🏪' },
};

export function JobsView() {
  const { state, toggleSaveJob, markApplied } = useApp();
  const lang = state.language;
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState<JobSector | 'all'>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'match' | 'saved'>('match');
  const [selected, setSelected] = useState<JobMatch | null>(null);
  const [subView, setSubView] = useState<'list' | 'tracker' | 'salary'>('list');
  const [showCoverLetter, setShowCoverLetter] = useState<{title:string;company:string} | null>(null);
  const [showAppLetter, setShowAppLetter] = useState<{title:string;company:string} | null>(null);

  const { upsertApplication } = useApp();
  const upsertApp = (job: JobMatch, status: 'applied' | 'saved') => {
    upsertApplication({ jobId: job.id, jobTitle: job.title, company: job.company, status, notes: '', salary: job.salary });
  };

  const filtered = useMemo(() => {
    let jobs = JOBS;
    if (filterTab === 'saved') jobs = jobs.filter(j => state.savedJobs.includes(j.id));
    if (filterTab === 'match') jobs = jobs.filter(j => j.matchScore >= 70);
    if (filterSector !== 'all') jobs = jobs.filter(j => j.sector === filterSector);
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q)));
    }
    return jobs.sort((a, b) => b.matchScore - a.matchScore);
  }, [search, filterSector, filterTab, state.savedJobs]);

  const matchColor = (score: number) => score >= 85 ? C.green : score >= 70 ? C.coral : C.muted;
  const daysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return d;
  };

  if (subView === 'tracker') return <ApplicationTracker onBack={() => setSubView('list')} />;
  if (subView === 'salary') return <SalaryGuide onBack={() => setSubView('list')} />;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 0', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
          <circle cx="180" cy="20" r="90" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
            {cv_name(state.cv.firstName, state.cv.lastName)}
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
            {lang === 'sw' ? 'Nafasi za Kazi' : 'Job Opportunities'}
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,240,232,0.08)', borderRadius: 14, padding: '11px 14px', marginBottom: 0, border: '1px solid rgba(245,240,232,0.12)' }}>
          <Search size={15} color="rgba(245,240,232,0.5)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === 'sw' ? 'Tafuta nafasi za kazi...' : 'Search jobs...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#F5F0E8', fontFamily: "'Sora', sans-serif' " }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><X size={13} color="rgba(245,240,232,0.5)" /></button>}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => setSubView('tracker')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.15)', borderRadius: 99, cursor: 'pointer' }}>
            <span style={{ fontSize: 12 }}>📋</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'Fuatilia' : 'Tracker'}
              {(state.applications || []).length > 0 && <span style={{ marginLeft: 5, background: C.coral, color: 'white', borderRadius: 99, padding: '1px 6px', fontSize: 10 }}>{(state.applications||[]).length}</span>}
            </span>
          </button>
          <button onClick={() => setSubView('salary')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.15)', borderRadius: 99, cursor: 'pointer' }}>
            <span style={{ fontSize: 12 }}>💰</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Mishahara' : 'Salaries'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 12 }}>
          {[
            { id: 'match', sw: `🎯 Zinazofaa (${JOBS.filter(j => j.matchScore >= 70).length})`, en: `🎯 Matches (${JOBS.filter(j => j.matchScore >= 70).length})` },
            { id: 'all', sw: 'Zote', en: 'All' },
            { id: 'saved', sw: `🔖 ${state.savedJobs.length}`, en: `🔖 ${state.savedJobs.length}` },
          ].map(t => (
            <button key={t.id} onClick={() => setFilterTab(t.id as any)}
              style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: filterTab === t.id ? '#F5F0E8' : 'rgba(245,240,232,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: filterTab === t.id ? '2px solid #E7633B' : '2px solid transparent', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.01em', transition: 'all 0.18s' }}>
              {lang === 'sw' ? t.sw : t.en}
            </button>
          ))}
        </div>
      </div>

      {/* Sector filter chips */}
      <div style={{ padding: '10px 20px 0', background: C.cream, overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
          <button onClick={() => setFilterSector('all')}
            style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${filterSector === 'all' ? C.ink : C.border2}`, background: filterSector === 'all' ? C.ink : 'white', fontSize: 11, fontWeight: 700, color: filterSector === 'all' ? '#F5F0E8' : C.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
            {lang === 'sw' ? 'Zote' : 'All'}
          </button>
          {Object.entries(SECTOR_LABELS).map(([k, v]) => (
            <button key={k} onClick={() => setFilterSector(k as JobSector)}
              style={{ padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${filterSector === k ? C.coral : C.border2}`, background: filterSector === k ? 'rgba(231,99,59,0.08)' : 'white', fontSize: 11, fontWeight: 700, color: filterSector === k ? C.coralD : C.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
              {v.icon} {lang === 'sw' ? v.sw : v.en}
            </button>
          ))}
        </div>
      </div>

      {/* Job cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 100px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 50 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.ink2 }}>{lang === 'sw' ? 'Hakuna nafasi zinazofaa' : 'No matching jobs found'}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{lang === 'sw' ? 'Jaribu kuchunguza kwa maneno mengine' : 'Try different search terms'}</div>
          </div>
        ) : (
          filtered.map((job, i) => {
            const days = daysLeft(job.deadline);
            const saved = state.savedJobs.includes(job.id);
            const applied = state.appliedJobs.includes(job.id);
            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(job)}
                style={{ background: 'white', borderRadius: 18, border: `1px solid ${applied ? 'rgba(45,106,79,0.25)' : C.border}`, padding: '16px', marginBottom: 10, cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                {applied && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: C.green }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{job.title}</div>
                    <div style={{ fontSize: 12, color: C.coral, fontWeight: 600, marginTop: 2 }}>{job.company}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleSaveJob(job.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                    {saved ? <BookmarkCheck size={18} color={C.coral} /> : <Bookmark size={18} color={C.muted} />}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} color={C.muted}/> {job.location}</span>
                  {job.salary && <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>💰 {job.salary}</span>}
                  {days !== null && <span style={{ fontSize: 11, color: days <= 7 ? '#C44E29' : C.muted, fontWeight: days <= 7 ? 700 : 400, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11}/> {days <= 0 ? (lang === 'sw' ? 'Imepita' : 'Expired') : days <= 7 ? `${days}d!` : `${days}d`}</span>}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: C.sand, color: C.ink2, fontFamily: "'Space Grotesk', sans-serif" }}>{tag}</span>
                  ))}
                </div>

                {/* Match score */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ height: 5, width: 60, background: '#E8DFD0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${job.matchScore}%`, background: matchColor(job.matchScore), borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: matchColor(job.matchScore), fontFamily: "'Space Grotesk', sans-serif" }}>
                      {job.matchScore}% {lang === 'sw' ? 'inakufaa' : 'match'}
                    </span>
                  </div>
                  {applied && <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>✓ {lang === 'sw' ? 'Imeomba' : 'Applied'}</span>}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Job Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.65)', zIndex: 50 }} onClick={() => setSelected(null)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.cream, borderRadius: '26px 26px 0 0', maxHeight: '92vh', overflowY: 'auto', zIndex: 51 }}>
              <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 0' }} />

              {/* Job header */}
              <div style={{ background: C.ink, margin: '16px 16px 0', borderRadius: 18, padding: '18px', position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.06, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>{selected.title}</div>
                    <div style={{ fontSize: 13, color: C.coral, fontWeight: 700, marginTop: 3 }}>{selected.company}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11}/> {selected.location}</span>
                      {selected.salary && <span style={{ fontSize: 11, color: '#7ED9A8', fontWeight: 600 }}>💰 {selected.salary}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: matchColor(selected.matchScore) }}>{selected.matchScore}%</div>
                    <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>match</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 20px 40px' }}>
                {/* Description */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Kuhusu Kazi' : 'About the Role'}</div>
                <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.7, marginBottom: 20 }}>{selected.description}</p>

                {/* Requirements */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Mahitaji' : 'Requirements'}</div>
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px', marginBottom: 20 }}>
                  {selected.requirements.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: i < selected.requirements.length - 1 ? `1px solid rgba(26,20,16,0.06)` : 'none' }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.coral, marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.ink2, lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => { toggleSaveJob(selected.id); toast.success(state.savedJobs.includes(selected.id) ? (lang === 'sw' ? 'Imeondolewa' : 'Unsaved') : (lang === 'sw' ? '🔖 Imehifadhiwa!' : '🔖 Saved!')); }}
                    style={{ width: 48, height: 48, borderRadius: 14, border: `1.5px solid ${C.border2}`, background: state.savedJobs.includes(selected.id) ? 'rgba(231,99,59,0.08)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {state.savedJobs.includes(selected.id) ? <BookmarkCheck size={20} color={C.coral} /> : <Bookmark size={20} color={C.muted} />}
                  </button>
                  <button onClick={() => setShowCoverLetter({ title: selected.title, company: selected.company })}
                    style={{ flex: 1, padding: '12px', background: 'rgba(231,99,59,0.1)', border: `1.5px solid rgba(231,99,59,0.25)`, color: C.coralD, fontSize: 12, fontWeight: 700, borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    ✍️ {lang === 'sw' ? 'Cover Letter' : 'Cover Letter'}
                  </button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { markApplied(selected.id); upsertApp(selected, 'applied'); toast.success(lang === 'sw' ? '✓ Maombi yamerekodiwa!' : '✓ Application recorded!'); setSelected(null); }}
                    style={{ flex: 1, padding: '12px', background: state.appliedJobs.includes(selected.id) ? C.green : C.coral, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    {state.appliedJobs.includes(selected.id) ? (lang === 'sw' ? '✓ Imeomba' : '✓ Applied') : (lang === 'sw' ? '📨 Wasilisha' : '📨 Apply')}
                  </motion.button>
                </div>
                <button onClick={() => { setShowAppLetter({ title: selected.title, company: selected.company }); setSelected(null); }}
                  style={{ width: '100%', padding: '12px', background: 'rgba(45,106,79,0.08)', border: `1.5px solid rgba(45,106,79,0.25)`, color: C.green, fontSize: 13, fontWeight: 700, borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  📄 {lang === 'sw' ? 'Barua Rasmi ya Maombi (SW / EN)' : 'Formal Application Letter (SW / EN)'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {showCoverLetter && (
        <CoverLetterSheet jobTitle={showCoverLetter.title} company={showCoverLetter.company} onClose={() => setShowCoverLetter(null)} />
      )}
      {showAppLetter && (
        <ApplicationLetterSheet jobTitle={showAppLetter.title} company={showAppLetter.company} onClose={() => setShowAppLetter(null)} />
      )}
    </div>
  );
}

function cv_name(first: string, last: string) {
  if (first || last) return `${first} ${last}`.trim();
  return '';
}
