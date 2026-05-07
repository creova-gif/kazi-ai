import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, Trash2, Sparkles } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

const STARTERS_SW = [
  'Jinsi ya kuomba kazi kwa barua pepe?',
  'CV yangu inaweza kuboreshwa vipi?',
  'Mishahara nzuri Tanzania kwa mhandisi?',
  'Jinsi ya kujitayarisha mahojiano?',
  'Tofauti kati ya CV na cover letter?',
];
const STARTERS_EN = [
  'How do I follow up after applying?',
  'How can I improve my CV?',
  'What salary should I ask for?',
  'How to prepare for a panel interview?',
  'What makes a great cover letter?',
];

interface Props { onBack: () => void; }

export function JobCoach({ onBack }: Props) {
  const { state, addCoachMessage, clearCoachMessages } = useApp();
  const lang = state.language;
  const messages = state.coachMessages || [];
  const cv = state.cv;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const SYSTEM = lang === 'sw'
    ? `Wewe ni mshauri wa kazi anayefahamu soko la kazi la Tanzania na Afrika Mashariki. Jina lako ni "Mshauri wa Kazi." Jibu kwa Kiswahili (au Kiingereza ikiwa mtumiaji anaandika Kiingereza). Toa ushauri wa vitendo, mfupi, na unaofaa kwa vijana wa Tanzania. Usiulize maswali mengi - toa majibu ya moja kwa moja.

Taarifa za mtumiaji:
- Jina: ${cv.firstName} ${cv.lastName}
- Cheo: ${cv.title || 'Haijulikani'}
- Uzoefu: ${cv.experience.length} kazi, Kiwango: ${cv.experienceLevel}
- Elimu: ${cv.education[0]?.degree || 'Haijulikani'}
- Ujuzi: ${cv.skills.slice(0, 5).map(s => s.name).join(', ') || 'Haujulikani'}
- Sekta zinazolengwa: ${cv.targetSector.join(', ') || 'Haijulikani'}`
    : `You are a career advisor specializing in the Tanzanian and East African job market. Your name is "Job Coach." Reply in English (or Swahili if the user writes in Swahili). Give practical, concise advice relevant to young Tanzanian professionals. Don't ask multiple questions — give direct, actionable answers.

User profile:
- Name: ${cv.firstName} ${cv.lastName}
- Title: ${cv.title || 'Unknown'}
- Experience: ${cv.experience.length} jobs, Level: ${cv.experienceLevel}
- Education: ${cv.education[0]?.degree || 'Unknown'}
- Skills: ${cv.skills.slice(0, 5).map(s => s.name).join(', ') || 'Unknown'}
- Target sectors: ${cv.targetSector.join(', ') || 'Unknown'}`;

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    addCoachMessage(userMsg);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg];
    const apiMessages = history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.text }));

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text?.trim() || (lang === 'sw' ? 'Samahani, hitilafu imetokea.' : 'Sorry, an error occurred.');
      addCoachMessage({ role: 'assistant', text: reply });
    } catch {
      addCoachMessage({ role: 'assistant', text: lang === 'sw' ? 'Hitilafu ya mtandao. Jaribu tena.' : 'Network error. Please try again.' });
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{ background: C.cream, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 18px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8' }}>{lang === 'sw' ? 'Mshauri wa Kazi' : 'Job Coach AI'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ED9A8' }} />
                  <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)' }}>Claude AI · Online</span>
                </div>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => clearCoachMessages()} style={{ background: 'rgba(245,240,232,0.08)', border: 'none', borderRadius: 99, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Trash2 size={12} color="rgba(245,240,232,0.5)" />
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.5)', fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Futa' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Welcome */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: C.coral, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={26} color="white" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, marginBottom: 6 }}>
              {lang === 'sw' ? `Habari ${cv.firstName || ''}!` : `Hi ${cv.firstName || 'there'}!`}
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
              {lang === 'sw' ? 'Mimi ni Mshauri wako wa Kazi. Niulize chochote kuhusu kazi, CV, au mahojiano.' : "I'm your Job Coach. Ask me anything about careers, CVs, or interviews."}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {(lang === 'sw' ? STARTERS_SW : STARTERS_EN).map((q, i) => (
                <button key={i} onClick={() => send(q)}
                  style={{ fontSize: 12, padding: '8px 14px', borderRadius: 99, border: `1.5px solid ${C.border2}`, background: 'white', color: C.ink2, cursor: 'pointer', fontWeight: 600, fontFamily: "'Sora', sans-serif", textAlign: 'left', transition: 'all 0.15s' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: 9, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
                <Sparkles size={14} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: '78%', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              padding: '11px 15px', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              background: msg.role === 'user' ? C.ink : 'white',
              color: msg.role === 'user' ? '#F5F0E8' : C.ink,
              border: msg.role === 'assistant' ? `1px solid ${C.border}` : 'none',
            }}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={14} color="white" />
            </div>
            <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: C.coral }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 16px 30px', borderTop: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', gap: 10, alignItems: 'center', background: C.cream }}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder={lang === 'sw' ? 'Niulize swali la kazi...' : 'Ask a career question...'}
          style={{ flex: 1, border: `1.5px solid ${C.border2}`, borderRadius: 16, padding: '12px 16px', fontSize: 13, outline: 'none', fontFamily: "'Sora', sans-serif", color: C.ink, background: 'white', transition: 'border-color 0.2s' }} />
        <motion.button whileTap={{ scale: 0.88 }} onClick={() => send(input)} disabled={!input.trim() || loading}
          style={{ width: 42, height: 42, borderRadius: '50%', background: input.trim() && !loading ? C.coral : C.sand2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, transition: 'background 0.2s' }}>
          <Send size={16} color="white" />
        </motion.button>
      </div>
    </div>
  );
}
