import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Award } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', red: '#C0392B', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface ScoreResult {
  overall: number;
  sections: { name: string; score: number; tip: string }[];
  strengths: string[];
  improvements: string[];
}

interface Props { onClose: () => void; }

export function CVScoreSheet({ onClose }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;
  const [stage, setStage] = useState<'intro' | 'scoring' | 'result'>('intro');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');

  const scoreCV = async () => {
    setStage('scoring');
    setError('');

    const expText = cv.experience.map(e => `${e.title} at ${e.company}: ${e.description?.slice(0, 80)}`).join('; ');
    const skillsText = cv.skills.map(s => `${s.name}(${s.level})`).join(', ');

    const prompt = lang === 'sw'
      ? `Tathmini CV hii kwa makini na upe alama (JSON tu):
CV: Jina: ${cv.firstName} ${cv.lastName}, Cheo: ${cv.title}, Muhtasari: ${cv.summary?.slice(0,150)}, Uzoefu: ${expText || 'Hakuna'}, Elimu: ${cv.education.map(e=>e.degree+' '+e.institution).join('; ')||'Hakuna'}, Ujuzi: ${skillsText||'Hakuna'}, Marejeo: ${cv.references.length}, Lugha: ${cv.languages.map(l=>l.lang).join(', ')}

Jibu JSON hii peke yake (bila markdown):
{"overall":85,"sections":[{"name":"Muhtasari","score":80,"tip":"..."},{"name":"Uzoefu","score":90,"tip":"..."},{"name":"Elimu","score":75,"tip":"..."},{"name":"Ujuzi","score":85,"tip":"..."},{"name":"Uwasiliano","score":70,"tip":"..."}],"strengths":["nguvu1","nguvu2","nguvu3"],"improvements":["boresha1","boresha2","boresha3"]}`
      : `Score this CV objectively and return JSON only (no markdown):
CV: Name: ${cv.firstName} ${cv.lastName}, Title: ${cv.title}, Summary: ${cv.summary?.slice(0,150)}, Experience: ${expText||'None'}, Education: ${cv.education.map(e=>e.degree+' '+e.institution).join('; ')||'None'}, Skills: ${skillsText||'None'}, References: ${cv.references.length}, Languages: ${cv.languages.map(l=>l.lang).join(', ')}

Return ONLY this JSON structure:
{"overall":85,"sections":[{"name":"Summary","score":80,"tip":"..."},{"name":"Experience","score":90,"tip":"..."},{"name":"Education","score":75,"tip":"..."},{"name":"Skills","score":85,"tip":"..."},{"name":"Contact Info","score":70,"tip":"..."}],"strengths":["strength1","strength2","strength3"],"improvements":["improve1","improve2","improve3"]}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed: ScoreResult = JSON.parse(cleaned);
      setResult(parsed);
      setStage('result');
    } catch {
      setError(lang === 'sw' ? 'Hitilafu — jaribu tena.' : 'Error — please try again.');
      setStage('intro');
    }
  };

  const scoreColor = (s: number) => s >= 80 ? C.green : s >= 60 ? C.coral : C.red;
  const scoreLabel = (s: number) => {
    if (lang === 'sw') return s >= 80 ? 'Bora' : s >= 60 ? 'Wastani' : 'Inahitaji Kazi';
    return s >= 80 ? 'Strong' : s >= 60 ? 'Average' : 'Needs Work';
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.65)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
        onClick={onClose}>
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          style={{ width: '100%', background: C.cream, borderRadius: '26px 26px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}>

          <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 0' }} />

          <div style={{ background: C.ink, margin: '16px 16px 0', borderRadius: 18, padding: '18px', position: 'relative', overflow: 'hidden' }}>
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.08, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Award size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#F5F0E8' }}>
                  {lang === 'sw' ? 'Alama ya CV' : 'CV Score'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 2 }}>Claude AI · Anthropic</div>
              </div>
              <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={13} color="rgba(245,240,232,0.6)" />
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 20px 40px' }}>
            {stage === 'intro' && (
              <>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
                  {lang === 'sw'
                    ? 'Claude AI ataangalia CV yako na kukupa alama kwa kila sehemu pamoja na vidokezo vya kuboresha.'
                    : 'Claude AI will analyze your CV section by section, give you a score out of 100, and provide specific tips to make it stronger.'}
                </p>
                {error && <p style={{ color: C.red, fontSize: 12, marginBottom: 14, background: '#FEF2F0', padding: '10px 12px', borderRadius: 10 }}>{error}</p>}
                <button onClick={scoreCV}
                  style={{ width: '100%', padding: 16, background: C.coral, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Sparkles size={16} color="white" />
                  {lang === 'sw' ? 'Angalia Alama ya CV →' : 'Score My CV →'}
                </button>
              </>
            )}

            {stage === 'scoring' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid ${C.sand2}`, borderTopColor: C.coral, margin: '0 auto 20px' }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
                  {lang === 'sw' ? 'Claude AI inaangalia CV yako...' : 'Claude AI is scoring your CV...'}
                </div>
              </div>
            )}

            {stage === 'result' && result && (
              <>
                {/* Overall score */}
                <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
                  <div style={{ fontSize: 72, fontWeight: 900, color: scoreColor(result.overall), letterSpacing: '-0.05em', lineHeight: 1 }}>{result.overall}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(result.overall), marginTop: 4 }}>{scoreLabel(result.overall)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{lang === 'sw' ? 'kati ya 100' : 'out of 100'}</div>
                </div>

                {/* Section scores */}
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lang === 'sw' ? 'Alama kwa Sehemu' : 'Section Scores'}
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 16 }}>
                  {result.sections.map((s, i) => (
                    <div key={i} style={{ padding: '13px 16px', borderBottom: i < result.sections.length - 1 ? `1px solid rgba(26,20,16,0.06)` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{s.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: scoreColor(s.score) }}>{s.score}</div>
                      </div>
                      <div style={{ height: 4, background: C.sand, borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          style={{ height: '100%', borderRadius: 99, background: scoreColor(s.score) }} />
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>💡 {s.tip}</div>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ✓ {lang === 'sw' ? 'Nguvu Zako' : 'Your Strengths'}
                </div>
                <div style={{ background: '#ECFDF5', borderRadius: 14, border: '1px solid rgba(45,106,79,0.2)', padding: '12px 14px', marginBottom: 16 }}>
                  {result.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < result.strengths.length - 1 ? 8 : 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p style={{ fontSize: 13, color: C.green, lineHeight: 1.5, margin: 0, fontWeight: 600 }}>{s}</p>
                    </div>
                  ))}
                </div>

                {/* Improvements */}
                <div style={{ fontSize: 10, fontWeight: 700, color: C.coral, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                  ↑ {lang === 'sw' ? 'Maeneo ya Kuboresha' : 'Areas to Improve'}
                </div>
                <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 14, border: '1px solid rgba(231,99,59,0.2)', padding: '12px 14px', marginBottom: 20 }}>
                  {result.improvements.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < result.improvements.length - 1 ? 8 : 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 10, color: 'white', fontWeight: 800 }}>!</span>
                      </div>
                      <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.5, margin: 0 }}>{s}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setStage('intro'); setResult(null); }}
                  style={{ width: '100%', padding: 14, background: C.sand, border: 'none', borderRadius: 14, fontSize: 13, fontWeight: 600, color: C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Angalia Tena' : 'Re-Score CV'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
