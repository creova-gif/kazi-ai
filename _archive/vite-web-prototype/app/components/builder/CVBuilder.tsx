import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit3, Trash2, X, Sparkles, Check, ChevronRight, Eye } from 'lucide-react';
import { useApp, type WorkExperience, type Education, type Skill } from '@/app/App';
import { toast } from 'sonner';
import { CVPreview } from './CVPreview';
import { AISummarySheet } from './AISummarySheet';
import { CVScoreSheet } from './CVScoreSheet';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

type Section = 'summary' | 'experience' | 'education' | 'skills' | 'references' | 'languages';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
const SKILL_CATS = [
  { v: 'technical', sw: 'Kiufundi', en: 'Technical' },
  { v: 'language', sw: 'Lugha', en: 'Language' },
  { v: 'soft', sw: 'Ujuzi wa Ushirikiano', en: 'Soft Skills' },
  { v: 'professional', sw: 'Kitaalamu', en: 'Professional' },
];

const LEVEL_COLORS: Record<string, string> = { beginner: '#D4C8B8', intermediate: '#F59E0B', advanced: C.coral, expert: '#2D6A4F' };

function ProgressRing({ pct }: { pct: number }) {
  const r = 28, c = 2 * Math.PI * r;
  const fill = (pct / 100) * c * 0.75;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E8DFD0" strokeWidth="6" strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeDashoffset={c * 0.125} strokeLinecap="round"/>
      <motion.circle cx="36" cy="36" r={r} fill="none" stroke={pct >= 80 ? '#2D6A4F' : '#E7633B'} strokeWidth="6"
        strokeDasharray={`${fill} ${c - fill + c * 0.25}`} strokeDashoffset={c * 0.125} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${fill} ${c - fill + c * 0.25}` }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.2 }}
      />
      <text x="36" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill={pct >= 80 ? '#2D6A4F' : '#E7633B'} fontFamily="Sora, sans-serif">{pct}%</text>
    </svg>
  );
}

export function CVBuilder() {
  const { state, updateCV, addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill, addReference, removeReference } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAISummary, setShowAISummary] = useState(false);
  const [showCVScore, setShowCVScore] = useState(false);

  // Form states
  const [expForm, setExpForm] = useState<Partial<Omit<WorkExperience,'id'>>>({});
  const [eduForm, setEduForm] = useState<Partial<Omit<Education,'id'>>>({});
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'beginner'|'intermediate'|'advanced'|'expert'>('intermediate');
  const [skillCat, setSkillCat] = useState<'technical'|'language'|'soft'|'professional'>('professional');
  const [refForm, setRefForm] = useState<Partial<Omit<import('@/app/App').Reference,'id'>>>({});
  const [summaryDraft, setSummaryDraft] = useState(cv.summary);

  const SECTIONS = [
    { id: 'summary' as Section, sw: 'Muhtasari wa Kazi', en: 'Professional Summary', icon: '✍️', filled: cv.summary.length > 10, count: null },
    { id: 'experience' as Section, sw: 'Uzoefu wa Kazi', en: 'Work Experience', icon: '💼', filled: cv.experience.length > 0, count: cv.experience.length },
    { id: 'education' as Section, sw: 'Elimu', en: 'Education', icon: '🎓', filled: cv.education.length > 0, count: cv.education.length },
    { id: 'skills' as Section, sw: 'Ujuzi', en: 'Skills', icon: '⚡', filled: cv.skills.length > 0, count: cv.skills.length },
    { id: 'references' as Section, sw: 'Marejeo', en: 'References', icon: '👥', filled: cv.references.length > 0, count: cv.references.length },
    { id: 'languages' as Section, sw: 'Lugha', en: 'Languages', icon: '🌍', filled: cv.languages.length > 0, count: cv.languages.length },
  ];

  const Sheet = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ width: '100%', background: C.cream, borderRadius: '26px 26px 0 0', maxHeight: '94vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{title}</div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: C.sand, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={13} color={C.muted}/></button>
          </div>
          <div style={{ padding: '16px 20px 40px' }}>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  const Field = ({ label, value, onChange, type = 'text', placeholder, multiline = false }: any) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7, fontFamily: "'Space Grotesk', sans-serif" }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${C.border2}`, fontSize: 13, color: C.ink, background: 'white', outline: 'none', resize: 'none', fontFamily: "'Sora', sans-serif", lineHeight: 1.6 }} />
        : <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${C.border2}`, fontSize: 14, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }} />
      }
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
          <circle cx="180" cy="20" r="90" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginBottom: 3 }}>
              {cv.firstName ? `${cv.firstName} ${cv.lastName}` : (lang === 'sw' ? 'CV Yako' : 'Your CV')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
              {lang === 'sw' ? 'Jenga CV Yako' : 'Build Your CV'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Preview btn */}
            <button onClick={() => setShowPreview(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,240,232,0.1)', border: '1px solid rgba(245,240,232,0.15)', borderRadius: 99, padding: '7px 12px', cursor: 'pointer' }}>
              <Eye size={14} color="rgba(245,240,232,0.7)" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(245,240,232,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Angalia' : 'Preview'}</span>
            </button>
          </div>
        </div>

        {/* Completion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, background: 'rgba(245,240,232,0.06)', borderRadius: 16, padding: '14px 18px', position: 'relative' }}>
          <ProgressRing pct={cv.completionPct} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8', marginBottom: 3 }}>
              {cv.completionPct >= 80
                ? (lang === 'sw' ? '🎉 CV yako iko tayari!' : '🎉 Your CV is ready!')
                : cv.completionPct >= 50
                ? (lang === 'sw' ? '✨ Karibu kukamilika' : '✨ Almost complete')
                : (lang === 'sw' ? 'Jaza CV yako ili kupata kazi' : 'Fill in your CV to get jobs')}
            </div>
            <div style={{ height: 5, background: 'rgba(245,240,232,0.12)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${cv.completionPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 99, background: cv.completionPct >= 80 ? '#52B788' : '#E7633B' }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
              {cv.completionPct < 100 && (lang === 'sw' ? `${100 - cv.completionPct}% imebaki kukamilika` : `${100 - cv.completionPct}% left to complete`)}
            </div>
          </div>
        </div>
      </div>

      {/* Sections list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
        {SECTIONS.map((s, i) => (
          <motion.button key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => setActiveSection(s.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 16, border: `1px solid ${s.filled ? 'rgba(231,99,59,0.25)' : C.border}`, background: s.filled ? 'rgba(231,99,59,0.04)' : 'white', cursor: 'pointer', marginBottom: 10, textAlign: 'left', transition: 'all 0.18s' }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: s.filled ? 'rgba(231,99,59,0.12)' : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
              {s.filled ? <span style={{ fontSize: '1rem' }}>✅</span> : <span>{s.icon}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{lang === 'sw' ? s.sw : s.en}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {s.count !== null && s.count > 0
                  ? `${s.count} ${lang === 'sw' ? 'iliyoongezwa' : 'added'}`
                  : s.filled
                  ? (lang === 'sw' ? 'Imekamilika' : 'Completed')
                  : (lang === 'sw' ? 'Bonyeza kuongeza' : 'Tap to add')}
              </div>
            </div>
            <ChevronRight size={16} color={C.sand2} />
          </motion.button>
        ))}

        {/* AI Summary CTA */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} onClick={() => setShowAISummary(true)}
          style={{ width: '100%', padding: '16px 18px', borderRadius: 16, background: C.ink, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8' }}>{lang === 'sw' ? 'AI Iandike Muhtasari' : 'AI Write My Summary'}</div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 2 }}>{lang === 'sw' ? 'Claude AI inakuandikia kwa sekunde' : 'Claude AI writes it in seconds'}</div>
          </div>
          <div style={{ fontSize: 18, color: C.coral }}>✨</div>
        </motion.button>

        {/* CV Score CTA */}
        <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onClick={() => setShowCVScore(true)}
          style={{ width: '100%', padding: '16px 18px', borderRadius: 16, background: 'white', border: `1.5px solid rgba(45,106,79,0.3)`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(45,106,79,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.3rem' }}>🏆</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{lang === 'sw' ? 'Angalia Alama ya CV Yangu' : 'Score My CV'}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{lang === 'sw' ? 'AI inakupa alama na vidokezo vya kuboresha' : 'AI gives you a score + improvement tips'}</div>
          </div>
          <div style={{ fontSize: 14, color: C.green }}>→</div>
        </motion.button>
      </div>

      {/* ── SECTION SHEETS ── */}

      {/* Summary */}
      {activeSection === 'summary' && (
        <Sheet title={lang === 'sw' ? '✍️ Muhtasari wa Kazi' : '✍️ Professional Summary'} onClose={() => setActiveSection(null)}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
            {lang === 'sw' ? 'Andika muhtasari mfupi wa ujuzi na malengo yako (mistari 3-5).' : 'Write a short summary of your skills and career goals (3-5 lines).'}
          </p>
          <textarea value={summaryDraft} onChange={e => setSummaryDraft(e.target.value)} rows={6}
            placeholder={lang === 'sw' ? 'Mf: Mwandishi mwenye uzoefu wa miaka 3 katika uandishi wa habari...' : 'e.g. Experienced software developer with 3 years in mobile applications...'}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: `1.5px solid ${C.border2}`, fontSize: 13, color: C.ink, background: 'white', outline: 'none', resize: 'none', fontFamily: "'Sora', sans-serif", lineHeight: 1.7, marginBottom: 14 }} />
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>{summaryDraft.length}/500 {lang === 'sw' ? 'herufi' : 'characters'}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setActiveSection(null); setShowAISummary(true); }}
              style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(231,99,59,0.1)', border: `1.5px solid rgba(231,99,59,0.25)`, color: C.coralD, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Sparkles size={14} color={C.coralD}/> AI
            </button>
            <button onClick={() => { updateCV({ summary: summaryDraft }); setActiveSection(null); toast.success(lang === 'sw' ? '✓ Imehifadhiwa!' : '✓ Saved!'); }}
              style={{ flex: 2, padding: 14, borderRadius: 14, background: C.ink, border: 'none', color: '#F5F0E8', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
              {lang === 'sw' ? 'Hifadhi' : 'Save'}
            </button>
          </div>
        </Sheet>
      )}

      {/* Experience */}
      {activeSection === 'experience' && (
        <Sheet title={lang === 'sw' ? '💼 Uzoefu wa Kazi' : '💼 Work Experience'} onClose={() => setActiveSection(null)}>
          {cv.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {cv.experience.map(exp => (
                <div key={exp.id} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{exp.company} · {exp.location}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{exp.startDate} — {exp.current ? (lang === 'sw' ? 'Sasa hivi' : 'Present') : exp.endDate}</div>
                  </div>
                  <button onClick={() => { removeExperience(exp.id); toast.success(lang === 'sw' ? 'Imefutwa' : 'Removed'); }} style={{ background: '#FEF2F0', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} color="#C0392B" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            {lang === 'sw' ? '+ Ongeza Mpya' : '+ Add New'}
          </div>
          <Field label={lang === 'sw' ? 'Cheo / Nafasi' : 'Job Title'} value={expForm.title} onChange={(v: string) => setExpForm(p => ({...p, title: v}))} placeholder={lang === 'sw' ? 'Mf: Msimamizi wa Akaunti' : 'e.g. Account Manager'} />
          <Field label={lang === 'sw' ? 'Kampuni' : 'Company'} value={expForm.company} onChange={(v: string) => setExpForm(p => ({...p, company: v}))} placeholder="CRDB Bank" />
          <Field label={lang === 'sw' ? 'Mahali' : 'Location'} value={expForm.location} onChange={(v: string) => setExpForm(p => ({...p, location: v}))} placeholder="Dar es Salaam" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label={lang === 'sw' ? 'Mwanzo' : 'Start'} value={expForm.startDate} onChange={(v: string) => setExpForm(p => ({...p, startDate: v}))} placeholder="Jan 2022" />
            <Field label={lang === 'sw' ? 'Mwisho' : 'End'} value={expForm.current ? '' : expForm.endDate} onChange={(v: string) => setExpForm(p => ({...p, endDate: v}))} placeholder={expForm.current ? (lang === 'sw' ? 'Sasa' : 'Present') : 'Dec 2023'} />
          </div>
          {/* Current toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <button onClick={() => setExpForm(p => ({...p, current: !p.current}))}
              style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: expForm.current ? C.coral : C.sand2, position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: expForm.current ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', display: 'block' }} />
            </button>
            <span style={{ fontSize: 12, color: C.muted }}>{lang === 'sw' ? 'Ninafanya kazi hapa sasa' : 'Currently working here'}</span>
          </div>
          <Field label={lang === 'sw' ? 'Maelezo ya Kazi' : 'Job Description'} value={expForm.description} onChange={(v: string) => setExpForm(p => ({...p, description: v}))} placeholder={lang === 'sw' ? 'Elezea majukumu yako...' : 'Describe your responsibilities...'} multiline />
          <button onClick={() => {
            if (!expForm.title || !expForm.company) return;
            addExperience({ title: expForm.title!, company: expForm.company!, location: expForm.location || '', startDate: expForm.startDate || '', endDate: expForm.endDate || '', current: expForm.current || false, description: expForm.description || '' });
            setExpForm({});
            toast.success(lang === 'sw' ? '✓ Uzoefu umeongezwa!' : '✓ Experience added!');
          }} disabled={!expForm.title || !expForm.company}
            style={{ width: '100%', padding: 14, background: !expForm.title || !expForm.company ? C.sand2 : C.coral, color: !expForm.title || !expForm.company ? C.muted : 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: !expForm.title || !expForm.company ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif" }}>
            {lang === 'sw' ? '+ Ongeza Uzoefu' : '+ Add Experience'}
          </button>
        </Sheet>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <Sheet title={lang === 'sw' ? '🎓 Elimu' : '🎓 Education'} onClose={() => setActiveSection(null)}>
          {cv.education.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {cv.education.map(edu => (
                <div key={edu.id} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 9, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{edu.degree}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{edu.institution} · {edu.year}</div>
                    {edu.grade && <div style={{ fontSize: 11, color: C.coral, marginTop: 1 }}>{edu.grade}</div>}
                  </div>
                  <button onClick={() => { removeEducation(edu.id); }} style={{ background: '#FEF2F0', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} color="#C0392B" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Field label={lang === 'sw' ? 'Shahada / Cheti' : 'Degree / Certificate'} value={eduForm.degree} onChange={(v: string) => setEduForm(p => ({...p, degree: v}))} placeholder={lang === 'sw' ? 'Mf: B.Sc. Uhandisi wa Kompyuta' : 'e.g. B.Sc. Computer Engineering'} />
          <Field label={lang === 'sw' ? 'Chuo / Shule' : 'Institution'} value={eduForm.institution} onChange={(v: string) => setEduForm(p => ({...p, institution: v}))} placeholder="University of Dar es Salaam" />
          <Field label={lang === 'sw' ? 'Mahali' : 'Location'} value={eduForm.location} onChange={(v: string) => setEduForm(p => ({...p, location: v}))} placeholder="Dar es Salaam" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label={lang === 'sw' ? 'Mwaka wa Kuhitimu' : 'Graduation Year'} value={eduForm.year} onChange={(v: string) => setEduForm(p => ({...p, year: v}))} placeholder="2022" />
            <Field label={lang === 'sw' ? 'Daraja / GPA' : 'Grade / GPA'} value={eduForm.grade} onChange={(v: string) => setEduForm(p => ({...p, grade: v}))} placeholder="Second Upper" />
          </div>
          <button onClick={() => {
            if (!eduForm.degree || !eduForm.institution) return;
            addEducation({ degree: eduForm.degree!, institution: eduForm.institution!, location: eduForm.location || '', year: eduForm.year || '', grade: eduForm.grade });
            setEduForm({});
            toast.success(lang === 'sw' ? '✓ Elimu imeongezwa!' : '✓ Education added!');
          }} disabled={!eduForm.degree || !eduForm.institution}
            style={{ width: '100%', padding: 14, background: !eduForm.degree || !eduForm.institution ? C.sand2 : C.coral, color: !eduForm.degree || !eduForm.institution ? C.muted : 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            {lang === 'sw' ? '+ Ongeza Elimu' : '+ Add Education'}
          </button>
        </Sheet>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <Sheet title={lang === 'sw' ? '⚡ Ujuzi' : '⚡ Skills'} onClose={() => setActiveSection(null)}>
          {cv.skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {cv.skills.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: `${LEVEL_COLORS[s.level]}25`, border: `1px solid ${LEVEL_COLORS[s.level]}50` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{s.name}</span>
                  <button onClick={() => removeSkill(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <X size={11} color={C.muted} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Field label={lang === 'sw' ? 'Jina la Ujuzi' : 'Skill Name'} value={skillName} onChange={setSkillName} placeholder={lang === 'sw' ? 'Mf: Microsoft Excel, Python, Uongozaji...' : 'e.g. Microsoft Excel, Python, Leadership...'} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Kiwango' : 'Level'}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {SKILL_LEVELS.map(l => (
                <button key={l} onClick={() => setSkillLevel(l)}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: `1.5px solid ${skillLevel === l ? LEVEL_COLORS[l] : C.border}`, background: skillLevel === l ? `${LEVEL_COLORS[l]}20` : 'white', fontSize: 10, fontWeight: 700, color: skillLevel === l ? C.ink : C.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif', transition: 'all 0.15s" }}>
                  {l === 'beginner' ? (lang === 'sw' ? 'Mwanzo' : 'Beginner') : l === 'intermediate' ? (lang === 'sw' ? 'Kati' : 'Mid') : l === 'advanced' ? (lang === 'sw' ? 'Juu' : 'Advanced') : 'Expert'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Aina' : 'Category'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SKILL_CATS.map(sc => (
                <button key={sc.v} onClick={() => setSkillCat(sc.v as any)}
                  style={{ padding: '9px', borderRadius: 11, border: `1.5px solid ${skillCat === sc.v ? C.coral : C.border}`, background: skillCat === sc.v ? 'rgba(231,99,59,0.07)' : 'white', fontSize: 12, fontWeight: 600, color: skillCat === sc.v ? C.coralD : C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? sc.sw : sc.en}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => {
            if (!skillName.trim()) return;
            addSkill({ name: skillName, level: skillLevel, category: skillCat });
            setSkillName('');
            toast.success(lang === 'sw' ? '✓ Ujuzi umeongezwa!' : '✓ Skill added!');
          }} disabled={!skillName.trim()}
            style={{ width: '100%', padding: 14, background: !skillName.trim() ? C.sand2 : C.coral, color: !skillName.trim() ? C.muted : 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            {lang === 'sw' ? '+ Ongeza Ujuzi' : '+ Add Skill'}
          </button>
        </Sheet>
      )}

      {/* References */}
      {activeSection === 'references' && (
        <Sheet title={lang === 'sw' ? '👥 Marejeo' : '👥 References'} onClose={() => setActiveSection(null)}>
          <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
            {lang === 'sw' ? 'Weka angalau marejeo 2 — bosi wa zamani au mwalimu.' : 'Add at least 2 references — former boss or lecturer.'}
          </p>
          {cv.references.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {cv.references.map(ref => (
                <div key={ref.id} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 9, display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{ref.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{ref.title} — {ref.company}</div>
                    <div style={{ fontSize: 11, color: C.coral }}>{ref.phone}</div>
                  </div>
                  <button onClick={() => removeReference(ref.id)} style={{ background: '#FEF2F0', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} color="#C0392B" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {(['name','title','company','phone','email','relationship'] as const).map(f => (
            <Field key={f} label={f === 'name' ? (lang === 'sw' ? 'Jina Kamili' : 'Full Name') : f === 'title' ? (lang === 'sw' ? 'Cheo' : 'Title') : f === 'company' ? (lang === 'sw' ? 'Kampuni' : 'Company') : f === 'phone' ? (lang === 'sw' ? 'Simu' : 'Phone') : f === 'email' ? 'Email' : (lang === 'sw' ? 'Uhusiano' : 'Relationship')}
              value={refForm[f]} onChange={(v: string) => setRefForm(p => ({...p, [f]: v}))}
              placeholder={f === 'phone' ? '+255 712 ...' : f === 'relationship' ? (lang === 'sw' ? 'Mf: Msimamizi wa zamani' : 'e.g. Former supervisor') : ''}
              type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} />
          ))}
          <button onClick={() => {
            if (!refForm.name || !refForm.phone) return;
            addReference({ name: refForm.name!, title: refForm.title || '', company: refForm.company || '', phone: refForm.phone!, email: refForm.email, relationship: refForm.relationship || '' });
            setRefForm({});
            toast.success(lang === 'sw' ? '✓ Marejeo yameongezwa!' : '✓ Reference added!');
          }}
            style={{ width: '100%', padding: 14, background: !refForm.name || !refForm.phone ? C.sand2 : C.coral, color: !refForm.name || !refForm.phone ? C.muted : 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            {lang === 'sw' ? '+ Ongeza Marejeo' : '+ Add Reference'}
          </button>
        </Sheet>
      )}

      {/* Languages */}
      {activeSection === 'languages' && (
        <Sheet title={lang === 'sw' ? '🌍 Lugha' : '🌍 Languages'} onClose={() => setActiveSection(null)}>
          {cv.languages.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input value={l.lang} onChange={e => { const langs = [...cv.languages]; langs[i] = {...l, lang: e.target.value}; updateCV({languages: langs}); }}
                style={{ flex: 2, padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${C.border2}`, fontSize: 13, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }} placeholder="Kiswahili" />
              <select value={l.level} onChange={e => { const langs = [...cv.languages]; langs[i] = {...l, level: e.target.value}; updateCV({languages: langs}); }}
                style={{ flex: 1, padding: '11px 10px', borderRadius: 12, border: `1.5px solid ${C.border2}`, fontSize: 12, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }}>
                {['Native','Fluent','Advanced','Intermediate','Basic'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
              </select>
              <button onClick={() => { const langs = cv.languages.filter((_, j) => j !== i); updateCV({languages: langs}); }} style={{ width: 34, flexShrink: 0, background: '#FEF2F0', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={12} color="#C0392B"/>
              </button>
            </div>
          ))}
          <button onClick={() => updateCV({languages: [...cv.languages, {lang: '', level: 'Intermediate'}]})}
            style={{ width: '100%', padding: 13, background: C.sand, border: 'none', borderRadius: 13, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
            + {lang === 'sw' ? 'Ongeza Lugha' : 'Add Language'}
          </button>
        </Sheet>
      )}

      {showAISummary && <AISummarySheet onClose={() => setShowAISummary(false)} />}
      {showPreview && <CVPreview onClose={() => setShowPreview(false)} />}
      {showCVScore && <CVScoreSheet onClose={() => setShowCVScore(false)} />}
    </div>
  );
}
