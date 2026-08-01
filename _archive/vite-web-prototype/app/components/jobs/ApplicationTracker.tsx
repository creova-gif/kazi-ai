import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, X, ChevronRight, Calendar, Edit3 } from 'lucide-react';
import { useApp, type ApplicationEntry } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', red: '#C0392B', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

type Status = ApplicationEntry['status'];

const STAGES: { id: Status; sw: string; en: string; color: string; bg: string; icon: string }[] = [
  { id: 'saved',     sw: 'Imehifadhiwa', en: 'Saved',     color: C.muted,   bg: C.sand,          icon: '🔖' },
  { id: 'applied',   sw: 'Imeomba',      en: 'Applied',   color: '#1D4ED8', bg: '#EFF6FF',        icon: '📤' },
  { id: 'interview', sw: 'Mahojiano',    en: 'Interview', color: '#B45309', bg: '#FFFBEB',        icon: '🎤' },
  { id: 'offer',     sw: 'Imetolewa',    en: 'Offer',     color: C.green,   bg: '#ECFDF5',        icon: '🎉' },
  { id: 'rejected',  sw: 'Ilikataliwa', en: 'Rejected',  color: C.red,     bg: '#FEF2F0',        icon: '❌' },
];

interface Props { onBack: () => void; }

export function ApplicationTracker({ onBack }: Props) {
  const { state, upsertApplication, updateApplicationStatus, removeApplication } = useApp();
  const lang = state.language;
  const apps = state.applications || [];

  const [addSheet, setAddSheet] = useState(false);
  const [detailApp, setDetailApp] = useState<ApplicationEntry | null>(null);
  const [form, setForm] = useState({ jobTitle: '', company: '', status: 'applied' as Status, notes: '', salary: '' });
  const [activeStage, setActiveStage] = useState<Status | 'all'>('all');

  const filtered = activeStage === 'all' ? apps : apps.filter(a => a.status === activeStage);

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s.id] = apps.filter(a => a.status === s.id).length;
    return acc;
  }, {} as Record<Status, number>);

  const handleAdd = () => {
    if (!form.jobTitle || !form.company) return;
    upsertApplication({
      jobId: Math.random().toString(36).substr(2, 9),
      jobTitle: form.jobTitle,
      company: form.company,
      status: form.status,
      notes: form.notes,
      salary: form.salary,
      appliedDate: form.status !== 'saved' ? new Date().toISOString().split('T')[0] : undefined,
    });
    setForm({ jobTitle: '', company: '', status: 'applied', notes: '', salary: '' });
    setAddSheet(false);
    toast.success(lang === 'sw' ? '✓ Maombi yameongezwa!' : '✓ Application added!');
  };

  const stage = (s: Status) => STAGES.find(x => x.id === s)!;

  const moveNext = (app: ApplicationEntry) => {
    const idx = STAGES.findIndex(s => s.id === app.status);
    if (idx < STAGES.length - 1) {
      const next = STAGES[idx + 1].id;
      updateApplicationStatus(app.jobId, next);
      toast.success(`→ ${STAGES[idx + 1][lang === 'sw' ? 'sw' : 'en']}`);
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
            </button>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
              {lang === 'sw' ? 'Fuatilia Maombi' : 'Application Tracker'}
            </div>
          </div>
          <button onClick={() => setAddSheet(true)} style={{ width: 34, height: 34, borderRadius: '50%', background: C.coral, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={18} color="white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Stage pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          <button onClick={() => setActiveStage('all')}
            style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${activeStage === 'all' ? 'rgba(245,240,232,0.5)' : 'rgba(245,240,232,0.15)'}`, background: activeStage === 'all' ? 'rgba(245,240,232,0.12)' : 'transparent', color: activeStage === 'all' ? '#F5F0E8' : 'rgba(245,240,232,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, transition: 'all 0.18s' }}>
            {lang === 'sw' ? 'Zote' : 'All'} ({apps.length})
          </button>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setActiveStage(s.id)}
              style={{ padding: '6px 12px', borderRadius: 99, border: `1.5px solid ${activeStage === s.id ? 'rgba(245,240,232,0.5)' : 'rgba(245,240,232,0.15)'}`, background: activeStage === s.id ? 'rgba(245,240,232,0.12)' : 'transparent', color: activeStage === s.id ? '#F5F0E8' : 'rgba(245,240,232,0.35)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, transition: 'all 0.18s' }}>
              {s.icon} {lang === 'sw' ? s.sw : s.en} {stageCounts[s.id] > 0 ? `(${stageCounts[s.id]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline summary */}
      <div style={{ padding: '14px 20px 0', background: C.cream, flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => setActiveStage(s.id)}
              style={{ background: activeStage === s.id ? s.bg : 'white', borderRadius: 12, padding: '8px 4px', textAlign: 'center', border: `1px solid ${activeStage === s.id ? s.color + '40' : C.border}`, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{stageCounts[s.id]}</div>
              <div style={{ fontSize: 8, color: C.muted, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                {lang === 'sw' ? s.sw.split(' ')[0] : s.en.split(' ')[0]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Applications list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 100px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 50 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>
              {lang === 'sw' ? 'Hakuna maombi bado' : 'No applications yet'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
              {lang === 'sw' ? 'Fuatilia maombi yako yote mahali pamoja' : 'Track all your job applications in one place'}
            </div>
            <button onClick={() => setAddSheet(true)} style={{ padding: '12px 24px', background: C.coral, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
              + {lang === 'sw' ? 'Ongeza Maombi ya Kwanza' : 'Add First Application'}
            </button>
          </div>
        ) : (
          filtered.map((app, i) => {
            const s = stage(app.status);
            return (
              <motion.div key={app.jobId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                {/* Status accent top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: 0.7 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingTop: 4 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{app.jobTitle}</div>
                    <div style={{ fontSize: 12, color: C.coral, fontWeight: 600, marginTop: 2 }}>{app.company}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.color}25`, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>
                    {s.icon} {lang === 'sw' ? s.sw : s.en}
                  </span>
                </div>

                {app.notes && (
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, padding: '8px 10px', background: C.sand, borderRadius: 9 }}>{app.notes}</div>
                )}
                {app.salary && (
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginBottom: 10 }}>💰 {app.salary}</div>
                )}

                {app.appliedDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
                    <Calendar size={12} color={C.muted} />
                    {lang === 'sw' ? 'Iliomba' : 'Applied'}: {app.appliedDate}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Move forward */}
                  {app.status !== 'offer' && app.status !== 'rejected' && (
                    <button onClick={() => moveNext(app)}
                      style={{ flex: 1, padding: '10px 8px', borderRadius: 12, background: C.sand, border: 'none', fontSize: 12, fontWeight: 700, color: C.coral, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                      → {lang === 'sw' ? STAGES[STAGES.findIndex(s => s.id === app.status)+1]?.sw : STAGES[STAGES.findIndex(s => s.id === app.status)+1]?.en}
                    </button>
                  )}
                  {/* Mark rejected */}
                  {app.status !== 'rejected' && app.status !== 'offer' && (
                    <button onClick={() => { updateApplicationStatus(app.jobId, 'rejected'); toast.success(lang === 'sw' ? 'Imesasishwa' : 'Updated'); }}
                      style={{ padding: '10px 12px', borderRadius: 12, background: '#FEF2F0', border: 'none', fontSize: 12, fontWeight: 700, color: C.red, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                      ✕
                    </button>
                  )}
                  <button onClick={() => { removeApplication(app.jobId); toast.success(lang === 'sw' ? 'Imefutwa' : 'Removed'); }}
                    style={{ padding: '10px 12px', borderRadius: 12, background: '#FEF2F0', border: 'none', fontSize: 12, fontWeight: 700, color: '#C0392B', cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    🗑
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Sheet */}
      <AnimatePresence>
        {addSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.6)', zIndex: 50 }} onClick={() => setAddSheet(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.cream, borderRadius: '26px 26px 0 0', padding: '0 20px 40px', zIndex: 51, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 20px' }} />
              <div style={{ fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 18 }}>
                📋 {lang === 'sw' ? 'Ongeza Maombi' : 'Add Application'}
              </div>

              {[
                { label: lang === 'sw' ? 'Jina la Kazi *' : 'Job Title *', key: 'jobTitle', ph: 'Software Engineer' },
                { label: lang === 'sw' ? 'Kampuni *' : 'Company *', key: 'company', ph: 'Vodacom Tanzania' },
                { label: lang === 'sw' ? 'Mshahara (hiari)' : 'Salary (optional)', key: 'salary', ph: 'TZS 2M/mwezi' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${C.border2}`, fontSize: 14, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }} />
                </div>
              ))}

              <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                {lang === 'sw' ? 'Hali' : 'Status'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {STAGES.slice(0, 3).map(s => (
                  <button key={s.id} onClick={() => setForm(p => ({ ...p, status: s.id }))}
                    style={{ padding: '10px 6px', borderRadius: 12, border: `1.5px solid ${form.status === s.id ? s.color : C.border}`, background: form.status === s.id ? s.bg : 'white', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: form.status === s.id ? s.color : C.muted, fontFamily: "'Sora', sans-serif" }}>
                    {s.icon} {lang === 'sw' ? s.sw : s.en}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lang === 'sw' ? 'Maelezo / Kumbuka' : 'Notes'}
                </label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder={lang === 'sw' ? 'Mf: Mahojiano Ijumaa saa 3...' : 'e.g. Interview Friday at 9am...'}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${C.border2}`, fontSize: 13, color: C.ink, background: 'white', outline: 'none', resize: 'none', fontFamily: "'Sora', sans-serif", lineHeight: 1.6 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setAddSheet(false)} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1.5px solid ${C.border2}`, background: 'transparent', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={!form.jobTitle || !form.company}
                  style={{ flex: 2, padding: 14, borderRadius: 14, background: !form.jobTitle || !form.company ? C.sand2 : C.coral, border: 'none', color: !form.jobTitle || !form.company ? C.muted : 'white', fontSize: 13, fontWeight: 700, cursor: !form.jobTitle || !form.company ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Hifadhi →' : 'Save →'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
