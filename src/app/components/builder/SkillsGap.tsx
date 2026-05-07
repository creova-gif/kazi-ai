import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', greenL: '#52B788', red: '#C0392B', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

const JOB_SKILL_PROFILES: Record<string, { required: string[]; preferred: string[]; resources: { name: string; url?: string; free: boolean }[] }> = {
  'Software Engineer': {
    required: ['JavaScript', 'React', 'Node.js', 'Git', 'SQL'],
    preferred: ['TypeScript', 'Docker', 'AWS', 'Python', 'REST APIs'],
    resources: [
      { name: 'freeCodeCamp', url: 'https://freecodecamp.org', free: true },
      { name: 'The Odin Project', url: 'https://theodinproject.com', free: true },
      { name: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu', free: true },
    ],
  },
  'Data Analyst': {
    required: ['Excel', 'SQL', 'Python', 'Data Visualization', 'Statistics'],
    preferred: ['Power BI', 'Tableau', 'R', 'Machine Learning', 'Google Analytics'],
    resources: [
      { name: 'Kaggle Learn', url: 'https://kaggle.com/learn', free: true },
      { name: 'Google Data Analytics (Coursera)', free: false },
      { name: 'SQLZoo', url: 'https://sqlzoo.net', free: true },
    ],
  },
  'Accountant': {
    required: ['Excel', 'QuickBooks', 'IFRS', 'Financial Reporting', 'Tax'],
    preferred: ['SAP', 'Oracle', 'Auditing', 'IPSAS', 'Payroll Systems'],
    resources: [
      { name: 'NBAA Tanzania', url: 'https://nbaa.or.tz', free: false },
      { name: 'AccountingCoach', url: 'https://accountingcoach.com', free: true },
      { name: 'CPA Tanzania (NBAA)', free: false },
    ],
  },
  'Program Officer (NGO)': {
    required: ['Project Management', 'Report Writing', 'M&E', 'Budget Management', 'Stakeholder Engagement'],
    preferred: ['Logframe', 'KOBO Toolbox', 'Donor Reporting', 'MEAL Systems', 'Community Mobilization'],
    resources: [
      { name: 'PMD Pro (Free)', url: 'https://pmdpro.org', free: true },
      { name: 'Coursera (Development)', free: false },
      { name: 'USAID Learning Resources', url: 'https://usaid.gov/learning-evaluation', free: true },
    ],
  },
  'Nurse (RN)': {
    required: ['Clinical Assessment', 'Patient Care', 'Medication Administration', 'Emergency Response', 'Medical Documentation'],
    preferred: ['ICU Skills', 'Wound Care', 'Pediatric Care', 'Mental Health First Aid', 'Infection Control'],
    resources: [
      { name: 'TNMC (Registration)', url: 'https://tnmc.go.tz', free: false },
      { name: 'Nurse.org Resources', free: true },
      { name: 'WHO e-Learning', url: 'https://openwho.org', free: true },
    ],
  },
};

interface Props { onBack: () => void; }

export function SkillsGap({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [selectedJob, setSelectedJob] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);

  const profile = JOB_SKILL_PROFILES[selectedJob];
  const userSkillNames = cv.skills.map(s => s.name.toLowerCase());

  const checkSkill = (skill: string) => userSkillNames.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));

  const requiredHave = profile.required.filter(checkSkill);
  const requiredMissing = profile.required.filter(s => !checkSkill(s));
  const preferredHave = profile.preferred.filter(checkSkill);
  const matchPct = Math.round((requiredHave.length / profile.required.length) * 100);

  const getAITips = async () => {
    setLoading(true);
    const missingStr = requiredMissing.join(', ');
    const prompt = lang === 'sw'
      ? `Mwombaji anataka kufanya kazi kama "${selectedJob}". Amekosea ujuzi huu: ${missingStr}. Toa maoni 3 mafupi ya jinsi ya kupata ujuzi huu Tanzania. Jibu kwa JSON tu: {"tips": ["kidokezo1", "kidokezo2", "kidokezo3"]}`
      : `An applicant wants to work as "${selectedJob}". They're missing these skills: ${missingStr}. Give 3 short, practical tips on how to gain these skills in Tanzania/East Africa. Reply with JSON only: {"tips": ["tip1", "tip2", "tip3"]}`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 400, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, '') || '{}');
      setAiTips(parsed.tips || []);
    } catch { setAiTips([]); }
    setLoading(false);
  };

  const matchColor = matchPct >= 80 ? C.green : matchPct >= 50 ? C.coral : C.red;

  return (
    <div style={{ background: C.cream, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200"><circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
          <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
            {lang === 'sw' ? 'Tathmini ya Ujuzi' : 'Skills Gap Analyzer'}
          </div>
        </div>
        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(245,240,232,0.06)', borderRadius: 16, padding: '14px 18px', position: 'relative' }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: matchColor, letterSpacing: '-0.04em' }}>{matchPct}%</div>
            <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>match</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8', marginBottom: 4 }}>
              {matchPct >= 80 ? (lang === 'sw' ? '🎉 Uko tayari!' : '🎉 You\'re ready!') : matchPct >= 50 ? (lang === 'sw' ? '📈 Karibu sana' : '📈 Getting close') : (lang === 'sw' ? '📚 Unahitaji ujuzi zaidi' : '📚 Needs more skills')}
            </div>
            <div style={{ height: 6, background: 'rgba(245,240,232,0.12)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${matchPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 99, background: matchColor }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
              {requiredHave.length}/{profile.required.length} {lang === 'sw' ? 'ujuzi muhimu' : 'required skills'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
        {/* Job picker */}
        <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          {lang === 'sw' ? 'Chagua Kazi' : 'Compare Against Role'}
        </label>
        <select value={selectedJob} onChange={e => { setSelectedJob(e.target.value); setAiTips([]); }}
          style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `1.5px solid ${C.border2}`, fontSize: 14, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif", marginBottom: 20 }}>
          {Object.keys(JOB_SKILL_PROFILES).map(job => <option key={job} value={job}>{job}</option>)}
        </select>

        {/* Skills you have */}
        {requiredHave.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif' " }}>
              ✓ {lang === 'sw' ? `Ujuzi uliopo (${requiredHave.length})` : `Skills you have (${requiredHave.length})`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {requiredHave.map(s => (
                <div key={s} style={{ padding: '7px 14px', borderRadius: 99, background: '#ECFDF5', border: '1px solid rgba(45,106,79,0.25)', fontSize: 12, fontWeight: 700, color: C.green }}>✓ {s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Skills you're missing */}
        {requiredMissing.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
              ✗ {lang === 'sw' ? `Ujuzi unaokosekana (${requiredMissing.length})` : `Missing skills (${requiredMissing.length})`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {requiredMissing.map(s => (
                <div key={s} style={{ padding: '7px 14px', borderRadius: 99, background: '#FEF2F0', border: '1px solid rgba(192,57,43,0.2)', fontSize: 12, fontWeight: 700, color: C.red }}>✗ {s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Preferred skills */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
            {lang === 'sw' ? 'Ujuzi wa Ziada (Faida)' : 'Preferred skills (bonus)'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.preferred.map(s => {
              const has = checkSkill(s);
              return (
                <div key={s} style={{ padding: '6px 12px', borderRadius: 99, background: has ? '#ECFDF5' : 'white', border: `1px solid ${has ? 'rgba(45,106,79,0.25)' : C.border}`, fontSize: 11, fontWeight: 600, color: has ? C.green : C.muted }}>
                  {has ? '✓ ' : ''}{s}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resources */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
            {lang === 'sw' ? '📚 Vyanzo vya Kujifunza' : '📚 Learning Resources'}
          </div>
          {profile.resources.map((r, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{r.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: r.free ? '#ECFDF5' : '#FEF2F0', color: r.free ? C.green : C.red }}>
                {r.free ? (lang === 'sw' ? 'Bure' : 'Free') : (lang === 'sw' ? 'Inagharimu' : 'Paid')}
              </span>
            </div>
          ))}
        </div>

        {/* AI Tips */}
        {requiredMissing.length > 0 && (
          <div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={getAITips} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? C.sand2 : C.ink, color: loading ? C.muted : '#F5F0E8', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 16, cursor: loading ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${C.muted}`, borderTopColor: 'transparent' }} />
                  {lang === 'sw' ? 'Inaandika...' : 'Thinking...'}
                </>
              ) : (
                <><Sparkles size={16} color="#F5F0E8" /> {lang === 'sw' ? '✨ AI: Jinsi ya Kujifunza' : '✨ AI: How to Learn These Skills'}</>
              )}
            </motion.button>

            {aiTips.length > 0 && (
              <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 16, border: '1px solid rgba(231,99,59,0.2)', padding: '16px' }}>
                {aiTips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < aiTips.length - 1 ? 10 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.55, margin: 0 }}>{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
