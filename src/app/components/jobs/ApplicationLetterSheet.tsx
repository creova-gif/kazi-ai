import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Copy, Share2, Check, FileText } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Props { jobTitle?: string; company?: string; onClose: () => void; }

export function ApplicationLetterSheet({ jobTitle, company, onClose }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [stage, setStage] = useState<'form' | 'generating' | 'result'>('form');
  const [customJob, setCustomJob] = useState(jobTitle || '');
  const [customCo, setCustomCo] = useState(company || '');
  const [customRef, setCustomRef] = useState('');
  const [letterLang, setLetterLang] = useState<'sw' | 'en'>(lang);
  const [letterType, setLetterType] = useState<'government' | 'ngo' | 'private'>('government');
  const [letter, setLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const TYPE_LABELS = [
    { id: 'government', sw: '🏛️ Serikali', en: '🏛️ Government', desc_sw: 'Muundo rasmi wa barua za serikali', desc_en: 'Formal government application format' },
    { id: 'ngo', sw: '🌍 NGO / INGO', en: '🌍 NGO / INGO', desc_sw: 'Shirika lisilo la kiserikali', desc_en: 'Non-governmental organization style' },
    { id: 'private', sw: '🏢 Kampuni', en: '🏢 Private Company', desc_sw: 'Barua ya kampuni ya biashara', desc_en: 'Corporate / private sector format' },
  ] as const;

  const generate = async () => {
    if (!customJob.trim() || !customCo.trim()) {
      setError(lang === 'sw' ? 'Jaza nafasi ya kazi na jina la shirika.' : 'Please fill in the job title and organization name.');
      return;
    }
    setStage('generating');
    setError('');

    const edu = cv.education[0] ? `${cv.education[0].degree}, ${cv.education[0].institution} (${cv.education[0].year})` : '';
    const expText = cv.experience.slice(0, 2).map(e => `${e.title} at ${e.company}`).join('; ');
    const skills = cv.skills.slice(0, 6).map(s => s.name).join(', ');
    const today = new Date().toLocaleDateString(letterLang === 'sw' ? 'sw-TZ' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const typeGuide = letterType === 'government'
      ? (letterLang === 'sw' ? 'Muundo rasmi wa barua za serikali Tanzania. Anza na "Ndugu Mkurugenzi," au cheo cha mwajiri. Tumia lugha ya heshima na rasmi. Taja nambari ya tangazo ikiwa imetolewa.' : 'Formal Tanzania government letter format. Begin with "Dear Director," or the employer\'s title. Use formal respectful language. Reference the job advertisement number if provided.')
      : letterType === 'ngo'
      ? (letterLang === 'sw' ? 'Muundo wa shirika la kimataifa. Onyesha uelewa wa malengo ya shirika na uzoefu wa maendeleo.' : 'International NGO style. Show understanding of the organization\'s mission and development experience.')
      : (letterLang === 'sw' ? 'Barua ya biashara ya kisasa. Onyesha jinsi utakavyochangia ukuaji wa kampuni.' : 'Modern business letter style. Show how you will contribute to company growth.');

    const prompt = letterLang === 'sw'
      ? `Andika barua rasmi ya maombi ya kazi kwa Kiswahili kwa ${cv.firstName || 'mwombaji'} ${cv.lastName || ''} anayeomba nafasi ya "${customJob}" katika "${customCo}".

Tarehe: ${today}
Kumbuka (Ref): ${customRef || 'Tangazo la Kazi'}

Taarifa za Mwombaji:
- Elimu: ${edu || 'Haijabainishwa'}
- Uzoefu: ${expText || 'Mwanafunzi mpya'}
- Ujuzi: ${skills || 'Haujabainishwa'}

Aina ya Barua: ${typeGuide}

Muundo wa Barua:
1. Anwani ya juu (tarehe na rejea)
2. Salamu rasmi
3. Aya ya 1: Madhumuni ya barua — nafasi unayoomba na uliijua vipi
4. Aya ya 2: Sifa na uzoefu unaofaa
5. Aya ya 3: Kwa nini kampuni/shirika hili maalum
6. Hitimisho na ombi la mahojiano

Jibu na barua kamili tu — bila maelezo mengine.`
      : `Write a formal application letter in English for ${cv.firstName || 'the applicant'} ${cv.lastName || ''} applying for "${customJob}" at "${customCo}".

Date: ${today}
Reference: ${customRef || 'Job Advertisement'}

Applicant details:
- Education: ${edu || 'Not specified'}
- Experience: ${expText || 'Fresh graduate'}
- Skills: ${skills || 'Not specified'}

Letter style: ${typeGuide}

Letter structure:
1. Date and reference line
2. Formal salutation
3. Para 1: Purpose — the position and how you found it
4. Para 2: Your qualifications and relevant experience
5. Para 3: Why this specific organization
6. Closing with interview request

Reply with the complete letter only — no extra explanation.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 900, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text?.trim() || '';
      if (text) { setLetter(text); setStage('result'); }
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
      if (navigator.share) await navigator.share({ title: `Application Letter — ${customJob}`, text: letter });
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

          <div style={{ background: C.ink, margin: '16px 16px 0', borderRadius: 18, padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.08, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#F5F0E8' }}>
                  {lang === 'sw' ? 'Barua ya Maombi ya Kazi' : 'Application Letter'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 2 }}>Claude AI · Kiswahili & English</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={13} color="rgba(245,240,232,0.6)" />
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 20px 40px' }}>
            {stage === 'form' && (
              <>
                {/* Letter language */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {lang === 'sw' ? 'Lugha ya Barua' : 'Letter Language'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{ id: 'sw', label: '🇹🇿 Kiswahili' }, { id: 'en', label: '🇬🇧 English' }].map(l => (
                      <button key={l.id} onClick={() => setLetterLang(l.id as 'sw' | 'en')}
                        style={{ padding: '11px', borderRadius: 12, border: `2px solid ${letterLang === l.id ? C.coral : C.border2}`, background: letterLang === l.id ? 'rgba(231,99,59,0.08)' : 'white', fontSize: 13, fontWeight: 700, color: letterLang === l.id ? C.coral : C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter type */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {lang === 'sw' ? 'Aina ya Shirika' : 'Organization Type'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {TYPE_LABELS.map(t => (
                      <button key={t.id} onClick={() => setLetterType(t.id)}
                        style={{ padding: '12px 14px', borderRadius: 12, border: `2px solid ${letterType === t.id ? C.coral : C.border2}`, background: letterType === t.id ? 'rgba(231,99,59,0.08)' : 'white', fontSize: 13, fontWeight: 700, color: letterType === t.id ? C.coral : C.ink, cursor: 'pointer', fontFamily: "'Sora', sans-serif", textAlign: 'left' }}>
                        <div>{lang === 'sw' ? t.sw : t.en}</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: C.muted, marginTop: 2 }}>{lang === 'sw' ? t.desc_sw : t.desc_en}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                {[
                  { label: lang === 'sw' ? 'Nafasi ya Kazi' : 'Job Title', val: customJob, set: setCustomJob, ph: lang === 'sw' ? 'mf. Afisa Mwandamizi' : 'e.g. Senior Accountant' },
                  { label: lang === 'sw' ? 'Jina la Shirika / Kampuni' : 'Organization / Company', val: customCo, set: setCustomCo, ph: lang === 'sw' ? 'mf. Wizara ya Elimu' : 'e.g. Ministry of Education' },
                  { label: lang === 'sw' ? 'Kumbuka ya Tangazo (hiari)' : 'Advertisement Reference (optional)', val: customRef, set: setCustomRef, ph: lang === 'sw' ? 'mf. MEF/REC/2026/001' : 'e.g. HR/2026/SW/001' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 7, fontFamily: "'Space Grotesk', sans-serif" }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 13, border: `1.5px solid ${C.border2}`, fontSize: 14, color: C.ink, background: 'white', outline: 'none', fontFamily: "'Sora', sans-serif" }} />
                  </div>
                ))}

                {error && <p style={{ color: C.red, fontSize: 12, marginBottom: 14, background: '#FEF2F0', padding: '10px 12px', borderRadius: 10 }}>{error}</p>}

                <button onClick={generate}
                  style={{ width: '100%', padding: 16, background: C.coral, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={16} color="white" />
                  {lang === 'sw' ? 'Andika Barua →' : 'Write Letter →'}
                </button>
              </>
            )}

            {stage === 'generating' && (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.sand2}`, borderTopColor: C.coral, margin: '0 auto 20px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  {lang === 'sw' ? 'Inaandika barua yako...' : 'Writing your letter...'}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {lang === 'sw' ? 'Claude AI inatayarisha barua ya kitaalamu' : 'Claude AI is crafting a professional letter'}
                </div>
              </div>
            )}

            {stage === 'result' && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✉️ {lang === 'sw' ? 'Barua Iliyoandikwa na AI' : 'AI-Generated Letter'}
                </div>
                <textarea value={letter} onChange={e => setLetter(e.target.value)} rows={14}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, border: `1.5px solid rgba(231,99,59,0.35)`, fontSize: 12, color: C.ink, background: 'white', outline: 'none', resize: 'none', fontFamily: "'Sora', sans-serif", lineHeight: 1.8, marginBottom: 14 }} />

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button onClick={handleCopy}
                    style={{ flex: 1, padding: 13, borderRadius: 14, border: `1.5px solid ${C.border2}`, background: copied ? '#ECFDF5' : 'white', color: copied ? C.green : C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {copied ? <Check size={14} color={C.green} /> : <Copy size={14} color={C.muted} />}
                    {copied ? (lang === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (lang === 'sw' ? 'Nakili' : 'Copy')}
                  </button>
                  <button onClick={handleShare}
                    style={{ flex: 1, padding: 13, borderRadius: 14, background: C.green, border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Share2 size={14} color="white" />
                    {lang === 'sw' ? 'Shiriki' : 'Share'}
                  </button>
                </div>
                <button onClick={() => setStage('form')}
                  style={{ width: '100%', padding: 13, background: C.sand, border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Unda Barua Nyingine' : 'Write Another Letter'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
