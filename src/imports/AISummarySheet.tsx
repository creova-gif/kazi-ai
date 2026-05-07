import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', border2: 'rgba(26,20,16,0.18)' };

interface Props { onClose: () => void; }

export function AISummarySheet({ onClose }: Props) {
  const { state, setAISummary } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState(state.lastGeneratedSummary || cv.summary);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'intro' | 'generating' | 'review'>('intro');

  const generate = async () => {
    setLoading(true);
    setStage('generating');
    setError('');

    const expText = cv.experience.map(e => `${e.title} at ${e.company} (${e.startDate}–${e.current ? 'Present' : e.endDate}): ${e.description}`).join('\n');
    const eduText = cv.education.map(e => `${e.degree} from ${e.institution} (${e.year})`).join(', ');
    const skillsText = cv.skills.map(s => s.name).join(', ');

    const prompt = lang === 'sw'
      ? `Wewe ni mshauri wa kazi wa kitaalamu. Andika muhtasari wa kazi (professional summary) wa mistari 3-4 kwa Kiingereza kwa ajili ya CV. Muhtasari lazima uwe wa kitaalamu, una nguvu, na unaonyesha mafanikio.

Taarifa ya mwombaji:
- Jina: ${cv.firstName} ${cv.lastName}
- Cheo: ${cv.title || 'Hajabainisha'}
- Uzoefu: ${expText || 'Mwanafunzi mpya'}
- Elimu: ${eduText || 'Hajabainisha'}
- Ujuzi: ${skillsText || 'Hajabainisha'}
- Sekta: ${cv.targetSector.join(', ')}

Jibu kwa muhtasari WA MOJA tu, bila maneno mengine yoyote ya utangulizi.`
      : `You are a professional career advisor. Write a powerful 3-4 line professional summary for this person's CV. Be specific, achievement-focused, and compelling.

Applicant details:
- Name: ${cv.firstName} ${cv.lastName}
- Title: ${cv.title || 'Not specified'}
- Experience: ${expText || 'Fresh graduate'}
- Education: ${eduText || 'Not specified'}
- Skills: ${skillsText || 'Not specified'}
- Target sector: ${cv.targetSector.join(', ')}

Reply with ONLY the summary text, no preamble.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      if (text) {
        setDraft(text.trim());
        setStage('review');
      } else {
        throw new Error('No response');
      }
    } catch (e) {
      setError(lang === 'sw' ? 'Hitilafu — jaribu tena.' : 'Error — please try again.');
      setStage('intro');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.65)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
        onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ width: '100%', background: C.cream, borderRadius: '26px 26px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}>

          {/* Handle */}
          <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 0' }} />

          {/* Header */}
          <div style={{ background: C.ink, margin: '16px 16px 0', borderRadius: 18, padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.08, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>
                  {lang === 'sw' ? 'AI Iandike Muhtasari Wako' : 'AI-Powered Summary Writer'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 2 }}>Claude AI · Anthropic</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <X size={13} color="rgba(245,240,232,0.6)" />
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 20px 40px' }}>
            {stage === 'intro' && (
              <>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  {lang === 'sw'
                    ? 'Claude AI ataandika muhtasari wa kitaalamu wa kazi kulingana na uzoefu na ujuzi wako. Inachukua sekunde 5-10.'
                    : 'Claude AI will write a powerful professional summary based on your experience and skills. Takes 5-10 seconds.'}
                </p>
                {/* Data preview */}
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid rgba(26,20,16,0.10)`, padding: '14px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {lang === 'sw' ? 'Data Itakayotumika' : 'Data to be used'}
                  </div>
                  {[
                    { icon: '👤', label: lang === 'sw' ? 'Jina' : 'Name', val: `${cv.firstName} ${cv.lastName}`.trim() || (lang === 'sw' ? 'Hajajaza' : 'Not filled') },
                    { icon: '💼', label: lang === 'sw' ? 'Uzoefu' : 'Experience', val: `${cv.experience.length} ${lang === 'sw' ? 'kazi' : 'jobs'}` },
                    { icon: '🎓', label: lang === 'sw' ? 'Elimu' : 'Education', val: `${cv.education.length} ${lang === 'sw' ? 'shahada' : 'degrees'}` },
                    { icon: '⚡', label: lang === 'sw' ? 'Ujuzi' : 'Skills', val: `${cv.skills.length} ${lang === 'sw' ? 'ujuzi' : 'skills'}` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid rgba(26,20,16,0.06)` }}>
                      <span style={{ fontSize: 12, color: C.muted }}>{row.icon} {row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{row.val}</span>
                    </div>
                  ))}
                </div>
                {error && <p style={{ color: '#C0392B', fontSize: 12, marginBottom: 14, background: '#FEF2F0', padding: '10px 12px', borderRadius: 10 }}>{error}</p>}
                <button onClick={generate}
                  style={{ width: '100%', padding: 16, background: C.coral, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={16} color="white" />
                  {lang === 'sw' ? 'Iandike Muhtasari Wangu →' : 'Write My Summary →'}
                </button>
              </>
            )}

            {stage === 'generating' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.sand2}`, borderTopColor: C.coral, margin: '0 auto 20px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  {lang === 'sw' ? 'Claude AI inafikiria...' : 'Claude AI is writing...'}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {lang === 'sw' ? 'Inaandika muhtasari bora kwa ajili yako' : 'Crafting the perfect summary for you'}
                </div>
              </div>
            )}

            {stage === 'review' && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✨ {lang === 'sw' ? 'Muhtasari Uliandikwa na AI' : 'AI-Generated Summary'}
                </div>
                <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={6}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, border: `1.5px solid rgba(231,99,59,0.35)`, fontSize: 13, color: C.ink, background: 'white', outline: 'none', resize: 'none', fontFamily: "'Sora', sans-serif", lineHeight: 1.7, marginBottom: 14 }} />
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>{lang === 'sw' ? 'Unaweza kuhariri muhtasari hapo juu kabla ya kuhifadhi.' : 'You can edit the summary above before saving.'}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStage('intro')}
                    style={{ flex: 1, padding: 14, borderRadius: 14, border: `1.5px solid rgba(26,20,16,0.18)`, background: 'transparent', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    {lang === 'sw' ? 'Fanya Upya' : 'Regenerate'}
                  </button>
                  <button onClick={() => { setAISummary(draft); toast.success(lang === 'sw' ? '✓ Muhtasari umehifadhiwa!' : '✓ Summary saved!'); onClose(); }}
                    style={{ flex: 2, padding: 14, borderRadius: 14, background: C.green, color: 'white', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {lang === 'sw' ? 'Tumia Muhtasari Huu' : 'Use This Summary'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
