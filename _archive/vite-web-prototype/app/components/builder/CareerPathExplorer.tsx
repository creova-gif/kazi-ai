import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, TrendingUp, Clock, BookOpen, Briefcase } from 'lucide-react';
import { useApp, type EducationLevel } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };
const fmtK = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : `${(n/1000).toFixed(0)}K`;

interface PathNode {
  title: string;
  yearsToReach: number;
  salaryTZS: [number, number];
  requirements: string[];
  upskills: string[];
  color: string;
}

interface CareerPath {
  id: string;
  icon: string;
  sector: string;
  startRole: string;
  nodes: PathNode[];
  minEducation: EducationLevel;
  description_sw: string;
  description_en: string;
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: 'tech', icon: '💻', sector: 'Technology', startRole: 'Junior Developer',
    minEducation: 'certificate',
    description_sw: 'Moja ya sekta zinazolipwa vizuri Tanzania — na inakua kwa kasi',
    description_en: 'One of the best-paying sectors in Tanzania — and growing fast',
    nodes: [
      { title: 'Junior Developer', yearsToReach: 0, salaryTZS: [800000, 1500000], requirements: ['HTML/CSS basics', 'JavaScript fundamentals', 'Git basics'], upskills: ['freeCodeCamp', 'The Odin Project', 'CS50 (Free)'], color: C.muted },
      { title: 'Mid Developer', yearsToReach: 2, salaryTZS: [1800000, 3500000], requirements: ['React/Vue or Node.js', 'Database (SQL/MongoDB)', '2+ projects portfolio'], upskills: ['Build 3 projects', 'Contribute to open source', 'Get internship'], color: C.coral },
      { title: 'Senior Developer', yearsToReach: 5, salaryTZS: [3500000, 7000000], requirements: ['System design', 'Team leadership', '3+ years experience'], upskills: ['Architecture patterns', 'Code review skills', 'Mentoring juniors'], color: '#7C3AED' },
      { title: 'Tech Lead / CTO', yearsToReach: 8, salaryTZS: [7000000, 20000000], requirements: ['Business acumen', 'Team management', 'Product thinking'], upskills: ['MBA or management course', 'Start side projects', 'Network with founders'], color: C.green },
    ],
  },
  {
    id: 'finance', icon: '💰', sector: 'Banking & Finance', startRole: 'Bank Teller / Intern',
    minEducation: 'diploma',
    description_sw: 'Kazi thabiti, mazingira yenye heshima, inakuwa vizuri Tanzania',
    description_en: 'Stable work, respected profession, growing well in Tanzania',
    nodes: [
      { title: 'Bank Teller / Intern', yearsToReach: 0, salaryTZS: [500000, 900000], requirements: ['Form 6 / Diploma', 'Basic numeracy', 'Customer service skills'], upskills: ['Banking basics course', 'Excel skills', 'Communication skills'], color: C.muted },
      { title: 'Accounts Officer', yearsToReach: 2, salaryTZS: [900000, 1600000], requirements: ['Accounting basics', 'NBAA Foundation', 'Bank experience'], upskills: ['NBAA Part 1', 'QuickBooks', 'Internal bank training'], color: C.coral },
      { title: 'Senior Accountant', yearsToReach: 5, salaryTZS: [1600000, 2800000], requirements: ['CPA (T) or B.Com', '3+ years experience', 'Audit knowledge'], upskills: ['NBAA full certification', 'IFRS training', 'Excel advanced'], color: '#7C3AED' },
      { title: 'Finance Manager / CFO', yearsToReach: 10, salaryTZS: [3500000, 8000000], requirements: ['MBA or ACCA', 'Team management', 'Strategic finance'], upskills: ['MBA Finance', 'ACCA qualification', 'Risk management'], color: C.green },
    ],
  },
  {
    id: 'health', icon: '🏥', sector: 'Healthcare', startRole: 'Nursing Student / Clinical Officer',
    minEducation: 'diploma',
    description_sw: 'Kazi muhimu sana — daima ipo mahitaji ya wafanyakazi wa afya',
    description_en: 'Essential work — always in demand across Tanzania',
    nodes: [
      { title: 'Clinical Officer / Nurse', yearsToReach: 0, salaryTZS: [700000, 1400000], requirements: ['Nursing diploma/degree', 'TNMC registration', 'Clinical placement'], upskills: ['TNMC registration', 'CPD courses', 'First Aid cert'], color: C.muted },
      { title: 'Senior Nurse / Ward In-Charge', yearsToReach: 3, salaryTZS: [1400000, 2200000], requirements: ['3+ years clinical', 'Specialization cert', 'Leadership skills'], upskills: ['Specialty training', 'WHO training programs', 'Leadership skills'], color: C.coral },
      { title: 'Nursing Officer / Supervisor', yearsToReach: 7, salaryTZS: [2200000, 4000000], requirements: ['Degree in Nursing', 'Management training', 'Hospital experience'], upskills: ['BSc Nursing upgrade', 'Hospital management', 'Health policy'], color: '#7C3AED' },
      { title: 'Medical Superintendent / Director', yearsToReach: 12, salaryTZS: [4000000, 10000000], requirements: ['Masters in Health Admin', 'Hospital management', 'Policy experience'], upskills: ['MHA/MPH degree', 'Senior leadership roles', 'Government engagement'], color: C.green },
    ],
  },
  {
    id: 'education', icon: '🎓', sector: 'Education', startRole: 'Secondary School Teacher',
    minEducation: 'diploma',
    description_sw: 'Kazi yenye heshima — na inakupa muda wa biashara ndogo pia',
    description_en: 'Respected career — and leaves time for side businesses too',
    nodes: [
      { title: 'Secondary Teacher (Form 1-4)', yearsToReach: 0, salaryTZS: [600000, 1000000], requirements: ['Teaching diploma/degree', 'TCU registration', 'Subject specialization'], upskills: ['TCU registration', 'Pedagogy training', 'Subject mastery'], color: C.muted },
      { title: 'Head of Department', yearsToReach: 4, salaryTZS: [1000000, 1600000], requirements: ['4+ years teaching', 'Subject mastery', 'Management skills'], upskills: ['Educational leadership', 'Curriculum development', 'Mentoring skills'], color: C.coral },
      { title: 'Deputy Headmaster/mistress', yearsToReach: 8, salaryTZS: [1500000, 2500000], requirements: ['B.Ed or Masters', 'School management', 'Government approval'], upskills: ['Masters in Education', 'School administration', 'Community relations'], color: '#7C3AED' },
      { title: 'Headmaster/mistress / Education Officer', yearsToReach: 12, salaryTZS: [2000000, 4000000], requirements: ['Masters minimum', 'Government service', 'Leadership record'], upskills: ['Government service training', 'Educational policy', 'Stakeholder management'], color: C.green },
    ],
  },
  {
    id: 'entrepreneurship', icon: '🚀', sector: 'Entrepreneurship / SME', startRole: 'Side Business / MSME',
    minEducation: 'primary',
    description_sw: 'Njia ya uhuru wa kifedha — 66% ya vijana wa Tanzania wanataka hii',
    description_en: 'Path to financial freedom — 66% of Tanzanian youth want this',
    nodes: [
      { title: 'Side Business / Kiosk', yearsToReach: 0, salaryTZS: [200000, 800000], requirements: ['Capital TZS 50K–200K', 'Basic business sense', 'Product/service idea'], upskills: ['SIDO training (free)', 'Business plan basics', 'Market research'], color: C.muted },
      { title: 'Registered SME', yearsToReach: 1, salaryTZS: [500000, 2000000], requirements: ['BRELA registration', 'TIN number', 'Track record'], upskills: ['BRELA registration (TZS 22K)', 'Bookkeeping', 'WhatsApp business'], color: C.coral },
      { title: 'Growing Business (3-10 employees)', yearsToReach: 3, salaryTZS: [1500000, 5000000], requirements: ['Proven product-market fit', 'Team management', 'Access to credit'], upskills: ['NMB/CRDB SME loan', 'HR basics', 'Digital marketing'], color: '#7C3AED' },
      { title: 'Established Business / Employer', yearsToReach: 7, salaryTZS: [4000000, 50000000], requirements: ['Strong brand', 'Multiple revenue streams', 'Systems & processes'], upskills: ['TIC support', 'Export opportunities', 'Mentorship/investors'], color: C.green },
    ],
  },
];

interface Props { onBack: () => void; }

export function CareerPathExplorer({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const [selected, setSelected] = useState<CareerPath | null>(null);
  const [nodeIdx, setNodeIdx] = useState(0);

  const educationOrder: EducationLevel[] = ['primary', 'secondary', 'certificate', 'diploma', 'degree', 'masters', 'phd'];

  if (selected) {
    const node = selected.nodes[nodeIdx];
    const isFirst = nodeIdx === 0;
    const isLast = nodeIdx === selected.nodes.length - 1;

    return (
      <div style={{ background: C.cream, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="180" height="180" viewBox="0 0 180 180"><circle cx="160" cy="20" r="140" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
            </button>
            <div style={{ fontSize: '1.2rem' }}>{selected.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8' }}>{selected.sector}</div>
          </div>
          {/* Path progress */}
          <div style={{ display: 'flex', gap: 4 }}>
            {selected.nodes.map((_, i) => (
              <button key={i} onClick={() => setNodeIdx(i)}
                style={{ flex: 1, height: 5, borderRadius: 99, background: i <= nodeIdx ? (i === nodeIdx ? C.coral : 'rgba(245,240,232,0.4)') : 'rgba(245,240,232,0.12)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 40px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={nodeIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Node header */}
              <div style={{ background: C.ink, borderRadius: 20, padding: '20px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', right: -10, top: -10, opacity: 0.06, pointerEvents: 'none' }} width="120" height="120" viewBox="0 0 120 120"><circle cx="100" cy="20" r="90" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,240,232,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {nodeIdx === 0 ? (lang === 'sw' ? 'Mwanzo wa Safari' : 'Starting Point') : `${lang === 'sw' ? 'Baada ya miaka' : 'After'} ~${node.yearsToReach} ${lang === 'sw' ? '' : 'years'}`}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{node.title}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.coral, fontVariantNumeric: 'tabular-nums' }}>TZS {fmtK(node.salaryTZS[0])}–{fmtK(node.salaryTZS[1])}</div>
                    <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Grotesk', sans-serif', marginTop: 2" }}>{lang === 'sw' ? '/mwezi' : '/month'}</div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={12} color={C.muted} /> {lang === 'sw' ? 'Unahitaji Nini' : 'What You Need'}
                </div>
                {node.requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 7, alignItems: 'flex-start' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(231,99,59,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowRight size={10} color={C.coral} />
                    </div>
                    <span style={{ fontSize: 13, color: C.ink2 }}>{r}</span>
                  </div>
                ))}
              </div>

              {/* How to get there */}
              <div style={{ background: 'rgba(45,106,79,0.06)', borderRadius: 16, border: 'rgba(45,106,79,0.15) solid 1px', padding: '14px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={12} color={C.green} /> {lang === 'sw' ? 'Jinsi ya Kufika Hapa' : 'How to Get Here'}
                </div>
                {node.upskills.map((u, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.ink2 }}>{u}</span>
                  </div>
                ))}
              </div>

              {/* Timeline dot */}
              {!isLast && (
                <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 14, border: '1px solid rgba(231,99,59,0.15)', padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={14} color={C.coral} />
                  <div style={{ fontSize: 12, color: C.coralD, fontWeight: 600 }}>
                    {lang === 'sw' ? `Hatua inayofuata: ${selected.nodes[nodeIdx + 1].title} (~miaka ${selected.nodes[nodeIdx + 1].yearsToReach})` : `Next: ${selected.nodes[nodeIdx + 1].title} (~${selected.nodes[nodeIdx + 1].yearsToReach} years)`}
                  </div>
                </div>
              )}

              {/* Nav */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button disabled={isFirst} onClick={() => setNodeIdx(n => n - 1)} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1.5px solid ${isFirst ? 'transparent' : C.border2}`, background: isFirst ? 'transparent' : 'white', color: isFirst ? 'transparent' : C.muted, fontSize: 13, fontWeight: 600, cursor: isFirst ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  ← {lang === 'sw' ? 'Iliyopita' : 'Previous'}
                </button>
                <button disabled={isLast} onClick={() => setNodeIdx(n => n + 1)}
                  style={{ flex: 2, padding: 14, borderRadius: 14, background: isLast ? C.sand2 : C.coral, border: 'none', color: isLast ? C.muted : 'white', fontSize: 13, fontWeight: 700, cursor: isLast ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Hatua Inayofuata →' : 'Next Step →'}
                </button>
              </div>
              {isLast && <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: C.green, fontWeight: 700 }}>🎯 {lang === 'sw' ? 'Hii ndiyo lengo lako la mwisho!' : 'This is your ultimate goal!'}</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200"><circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, position: 'relative' }}>
          <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
          </button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
              {lang === 'sw' ? 'Chagua Njia Yako' : 'Career Path Explorer'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>
              {lang === 'sw' ? 'Angalia hatua zote hadi juu' : 'See every step from start to top'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 100px' }}>
        {/* Market insight */}
        <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 14, border: '1px solid rgba(231,99,59,0.18)', padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10 }}>
          <div style={{ fontSize: '1.2rem' }}>🔍</div>
          <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>
            {lang === 'sw' ? '66% ya vijana wa Tanzania wanataka kuanzisha biashara zao. Lakini kwa wale wanaotaka ajira — hizi ni njia halisi.' : '66% of Tanzanian youth want to start businesses. But for those who want employment — these are the real paths.'}
          </p>
        </div>

        {CAREER_PATHS.map((path, i) => (
          <motion.div key={path.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            onClick={() => { setSelected(path); setNodeIdx(0); }}
            style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{path.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{path.sector}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{lang === 'sw' ? path.description_sw : path.description_en}</div>
              </div>
              <ArrowRight size={16} color={C.sand2} />
            </div>

            {/* Mini salary ladder */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {path.nodes.map((node, ni) => (
                <div key={ni} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: node.color, fontFamily: "'Space Grotesk', sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                    {fmtK(Math.round((node.salaryTZS[0] + node.salaryTZS[1]) / 2))}K
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: `${node.color}30`, marginTop: 3, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(ni + 1) / path.nodes.length * 100}%`, background: node.color, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 8, color: C.muted, marginTop: 2, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {ni === 0 ? (lang === 'sw' ? 'Mwanzo' : 'Start') : `~${node.yearsToReach}${lang === 'sw' ? 'y' : 'yr'}`}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
