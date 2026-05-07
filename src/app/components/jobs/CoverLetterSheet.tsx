import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Copy, Share2, Check } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Props {
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  onClose: () => void;
}

export function CoverLetterSheet({ jobTitle, company, jobDescription, onClose }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [stage, setStage] = useState<'form' | 'generating' | 'review'>('form');
  const [customJob, setCustomJob] = useState(jobTitle || '');
  const [customCo, setCustomCo] = useState(company || '');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'concise'>('professional');
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const TONES = [
    { id: 'professional', sw: 'Rasmi', en: 'Professional', desc: 'Barua rasmi ya kawaida' },
    { id: 'enthusiastic', sw: 'Yenye Moyo', en: 'Enthusiastic', desc: 'Inaonyesha shauku' },
    { id: 'concise', sw: 'Fupi', en: 'Concise', desc: 'Mfupi na wa moja kwa moja' },
  ] as const;

  const generate = async () => {
    if (!customJob || !customCo) return;
    setStage('generating');
    setError('');

    const expText = cv.experience.slice(0, 2).map(e =>
      `${e.title} at ${e.company}: ${e.description?.slice(0, 120) || ''}`
    ).join('\n');
    const skills = cv.skills.slice(0, 6).map(s => s.name).join(', ');
    const edu = cv.education[0] ? `${cv.education[0].degree} from ${cv.education[0].institution}` : '';

    const toneGuide = tone === 'enthusiastic' ? 'Write with genuine enthusiasm and passion.' : tone === 'concise' ? 'Keep it under 200 words. Every sentence must earn its place.' : 'Use a professional, formal tone appropriate for East African business culture.';

    const prompt = lang === 'sw'
      ? `Andika barua ya maombi ya kazi (cover letter) kwa Kiingereza kwa ajili ya ${cv.firstName} ${cv.lastName} anayeomba nafasi ya "${customJob}" katika kampuni ya "${customCo}".

Taarifa za Mwombaji:
- Cheo: ${cv.title || 'Software Developer'}
- Elimu: ${edu}
- Uzoefu: ${expText || 'Fresh graduate passionate about the field'}
- Ujuzi: ${skills}
- Muhtasari: ${cv.summary?.slice(0, 200) || ''}

Maelekezo ya mtindo: ${toneGuide}
Muundo: Paragraphs 3. Hakuna anwani ya barua — anza moja kwa moja na paragraph ya kwanza.
Jibu na barua hiyo tu — bila maneno ya utangulizi.`
      : `Write a cover letter for ${cv.firstName || 'the applicant'} ${cv.lastName || ''} applying for "${customJob}" at "${customCo}".

Applicant details:
- Title: ${cv.title || 'Software Developer'}
- Education: ${edu}
- Experience: ${expText || 'Fresh graduate passionate about the field'}
- Skills: ${skills}
- Summary: ${cv.summary?.slice(0, 200) || ''}

Style instruction: ${toneGuide}
Format: 3 paragraphs. No letter header — start directly with the first paragraph.
Reply with only the letter text, no preamble.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim() || '';
      if (text) { setLetter(text); setStage('review'); }
      else throw new Error('empty');
    } catch {
      setError(lang === 'sw' ? 'Hitilafu — jaribu tena.' : 'Error — please try again.');
      setStage('form');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(lang === 'sw' ? '✓ Imenakiliwa!' : '✓ Copied!');
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Cover Letter — ${customJob}`, text: letter });
      else handleCopy();
    } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.65)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
        onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ width: '100%', background: C.cream, borderRadius: '26px 26px 0 0', maxHeight: '94vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}>

          <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 0' }} />

          {/* Header */}
          <div style={{ background: C.ink, margin: '14px 16px 0', borderRadius: 18, padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.07, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100">
              <circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>
                  {lang === 'sw' ? 'AI Iandike Barua ya Maombi' : 'AI Cover Letter Writer'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>Claude AI · Anthropic</div>
              </div>
              <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <X size={13} color="rgba(245,240,232,0.6)" />
              </button>
            </div>
          </div>

          <div style={{ padding: '18px 20px 40px' }}>
            {stage === 'form' && (
              <>
                {[
                  { label: lang === 'sw' ? 'Jina la Kazi' : 'Job Title', val: customJob, set: setCustomJob, ph: 'e.g. Software Engineer' },
                  { label: lang === 'sw' ? 'Jina la Kampuni' : 'Company Name', val: customCo, set: setCustomCo, ph: 'e.g. Vodacom Tanzania' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: '100%', padding: '13px 16px', borderRadius: 14, border: `1.5px solid ${C.border2}`, fontSize: 14, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }} />
                  </div>
                ))}

                {/* Tone selector */}
                <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lang === 'sw' ? 'Mtindo wa Barua' : 'Letter Tone'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
                  {TONES.map(t => (
                    <button key={t.id} onClick={() => setTone(t.id)}
                      style={{ padding: '11px 8px', borderRadius: 13, border: `1.5px solid ${tone === t.id ? C.coral : C.border}`, background: tone === t.id ? 'rgba(231,99,59,0.07)' : 'white', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: tone === t.id ? C.coralD : C.ink, marginBottom: 3 }}>{lang === 'sw' ? t.sw : t.en}</div>
                      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>

                {error && <p style={{ fontSize: 12, color: '#C0392B', background: '#FEF2F0', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}>{error}</p>}

                <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={!customJob || !customCo}
                  style={{ width: '100%', padding: 16, background: !customJob || !customCo ? C.sand2 : C.coral, color: !customJob || !customCo ? C.muted : 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: !customJob || !customCo ? 'default' : 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={16} color={!customJob || !customCo ? C.muted : 'white'} />
                  {lang === 'sw' ? 'Iandike Barua Yangu →' : 'Write My Cover Letter →'}
                </motion.button>
              </>
            )}

            {stage === 'generating' && (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.sand2}`, borderTopColor: C.coral, margin: '0 auto 20px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  {lang === 'sw' ? 'Claude AI inaandika barua yako...' : 'Claude AI is writing your letter...'}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{lang === 'sw' ? 'Sekunde 5-10' : '5-10 seconds'}</div>
              </div>
            )}

            {stage === 'review' && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✨ {lang === 'sw' ? 'Barua Iliyoandikwa na AI' : 'AI-Generated Cover Letter'} — {customJob} @ {customCo}
                </div>

                <div style={{ background: 'white', borderRadius: 16, border: `1px solid rgba(231,99,59,0.2)`, padding: '18px', marginBottom: 16 }}>
                  <textarea value={letter} onChange={e => setLetter(e.target.value)} rows={12}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: C.ink2, lineHeight: 1.8, resize: 'none', fontFamily: "'Sora', sans-serif", background: 'transparent' }} />
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button onClick={() => setStage('form')} style={{ flex: 1, padding: '13px', borderRadius: 14, border: `1.5px solid ${C.border2}`, background: 'transparent', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    {lang === 'sw' ? 'Fanya Upya' : 'Regenerate'}
                  </button>
                  <button onClick={handleCopy} style={{ flex: 1, padding: '13px', borderRadius: 14, background: copied ? C.green : C.sand, border: 'none', color: copied ? 'white' : C.ink2, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
                    {copied ? <Check size={14} color="white" /> : <Copy size={14} color={C.muted} />}
                    {copied ? (lang === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (lang === 'sw' ? 'Nakili' : 'Copy')}
                  </button>
                  <button onClick={handleShare} style={{ flex: 1, padding: '13px', borderRadius: 14, background: C.coral, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Share2 size={14} color="white" />
                    {lang === 'sw' ? 'Shiriki' : 'Share'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>
                  {lang === 'sw' ? 'Unaweza kuhariri barua hapo juu kabla ya kutuma.' : 'You can edit the letter above before sending.'}
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
