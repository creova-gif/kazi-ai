import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { JobCoach } from './JobCoach';
import { SkillsGap } from './SkillsGap';
import { SoftSkillsTrainer } from './SoftSkillsTrainer';
import { CareerPathExplorer } from './CareerPathExplorer';
import { NetworkingKit } from './NetworkingKit';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

const QUESTIONS = {
  general: [
    { id: 'g1', sw: 'Niambie kuhusu wewe mwenyewe.', en: 'Tell me about yourself.', tip_sw: 'Anza na jina, elimu, uzoefu wa kazi, na mambo unayopenda. Fanya dakika 2-3. Fikia mwisho na kwa nini unataka nafasi hii.', tip_en: 'Start with your name, education, work experience, and interests. Keep it to 2-3 minutes. End with why you want this role.' },
    { id: 'g2', sw: 'Kwa nini unataka kufanya kazi hapa?', en: 'Why do you want to work here?', tip_sw: 'Tafuta taarifa za kampuni mapema. Eleza jinsi malengo yako yanavyolingana na dhamira ya kampuni. Epuka kusema tu "mshahara mzuri".', tip_en: 'Research the company beforehand. Show how your goals align with their mission. Avoid just saying "good salary".' },
    { id: 'g3', sw: 'Nguvu zako ni zipi?', en: 'What are your strengths?', tip_sw: 'Chagua nguvu 2-3 zinazohusiana na kazi unayoomba. Toa mifano halisi kutoka uzoefu wako.', tip_en: 'Choose 2-3 strengths relevant to the job. Give real examples from your experience.' },
    { id: 'g4', sw: 'Udhaifu wako ni nini?', en: 'What is your weakness?', tip_sw: 'Chagua udhaifu halisi lakini usiozuia kazi. Eleza jinsi unavyofanya kazi ili kuiondoa. Epuka kusema "mimi si mkamilifu".', tip_en: 'Choose a real but non-critical weakness. Explain how you\'re working to improve it. Avoid "I\'m a perfectionist".' },
    { id: 'g5', sw: 'Unatarajia mshahara gani?', en: 'What salary do you expect?', tip_sw: 'Tafuta wastani wa mshahara wa nafasi hiyo. Toa kiwango, si nambari moja. Mf: "TZS 1.5M hadi 2M kulingana na mafao."', tip_en: 'Research the salary range for this role. Give a range, not a single number. E.g. "TZS 1.5M to 2M depending on benefits."' },
    { id: 'g6', sw: 'Una maswali gani kwa ajili yetu?', en: 'Do you have any questions for us?', tip_sw: 'Daima uwe na maswali! Mf: "Siku yangu ya kawaida itakuwa nini?" au "Ni changamoto gani kubwa zaidi katika nafasi hii?"', tip_en: 'Always have questions! E.g. "What does a typical day look like?" or "What\'s the biggest challenge in this role?"' },
  ],
  behavioral: [
    { id: 'b1', sw: 'Eleza wakati ulioshinda tatizo gumu.', en: 'Describe a time you solved a difficult problem.', tip_sw: 'Tumia muundo wa STAR: Hali (Situation), Kazi (Task), Hatua (Action), Matokeo (Result). Chagua mfano halisi.', tip_en: 'Use STAR method: Situation, Task, Action, Result. Choose a real, specific example.' },
    { id: 'b2', sw: 'Niambie wakati ulifanya kazi na timu yenye ugumu.', en: 'Tell me about working in a challenging team.', tip_sw: 'Onyesha ujuzi wako wa mawasiliano na ushirikiano. Epuka kulaumu wengine — onyesha jinsi ulisaidia kuboresha hali.', tip_en: 'Show communication and collaboration skills. Avoid blaming others — show how you helped improve the situation.' },
    { id: 'b3', sw: 'Eleza jinsi unavyoongoza miradi mingi kwa wakati mmoja.', en: 'How do you manage multiple projects simultaneously?', tip_sw: 'Eleza mfumo wako wa kupanga kazi — labda orodha, kalenda, au programu. Toa mfano wa miradi miwili uliyofanikisha.', tip_en: 'Describe your prioritization system — lists, calendar, apps. Give an example of two projects you managed successfully.' },
  ],
  tips: [
    { id: 't1', icon: '👗', sw: 'Vaa vizuri', en: 'Dress professionally', body_sw: 'Vaa sare rasmi (formal) hata kwa mahojiano ya mtandaoni. Nguo safi na zisizo na mikunjo. Rangi zinazofaa: navy, black, gray, white.', body_en: 'Wear formal clothes even for online interviews. Clean, ironed clothes. Good colors: navy, black, gray, white.' },
    { id: 't2', icon: '⏰', sw: 'Fika mapema', en: 'Arrive early', body_sw: 'Kwa mahojiano ya ana kwa ana, fika dakika 10-15 mapema. Kwa mtandaoni, jaribu teknolojia dakika 30 kabla.', body_en: 'For in-person interviews, arrive 10-15 minutes early. For online, test technology 30 minutes before.' },
    { id: 't3', icon: '📚', sw: 'Jiandae na taarifa', en: 'Research the company', body_sw: 'Jua historia ya kampuni, bidhaa/huduma, na habari za hivi karibuni. Angalia LinkedIn ya watakaokuhoji.', body_en: 'Know the company history, products/services, and recent news. Check LinkedIn profiles of your interviewers.' },
    { id: 't4', icon: '💬', sw: 'Mawasiliano', en: 'Communication tips', body_sw: 'Zungumza polepole na wazi. Sikiliza swali zima kabla ya kujibu. Omba ufafanuzi ikiwa swali si wazi.', body_en: 'Speak slowly and clearly. Listen to the full question before answering. Ask for clarification if unclear.' },
    { id: 't5', icon: '🤝', sw: 'Lugha ya mwili', en: 'Body language', body_sw: 'Mkono imara (handshake). Angalia macho (eye contact). Kaa vizuri bila kuinama. Tabasamu!', body_en: 'Firm handshake. Maintain eye contact. Sit up straight. Smile!' },
  ],
};

export function InterviewPrep() {
  const { state } = useApp();
  const lang = state.language;
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'behavioral' | 'tips' | 'ai' | 'coach' | 'skills' | 'softskills' | 'career' | 'network'>('general');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQs, setAiQs] = useState<string[]>([]);
  const [aiError, setAiError] = useState('');

  const generateAIQuestions = async () => {
    setAiLoading(true);
    setAiError('');
    const cv = state.cv;
    const prompt = lang === 'sw'
      ? `Wewe ni mshauri wa kazi. Unda maswali 5 ya mahojiano maalum kwa mwombaji huyu. Jibu kwa JSON tu: {"questions": ["swali1", "swali2", ...]}
Taarifa: Jina: ${cv.firstName}, Cheo: ${cv.title || 'Hajabainisha'}, Uzoefu: ${cv.experience.map(e => e.title).join(', ') || 'Mwanafunzi'}, Sekta: ${cv.targetSector.join(', ')}`
      : `You are a career expert. Create 5 specific interview questions for this applicant. Reply with JSON only: {"questions": ["q1", "q2", ...]}
Info: Name: ${cv.firstName}, Title: ${cv.title || 'Not specified'}, Experience: ${cv.experience.map(e => e.title).join(', ') || 'Fresh graduate'}, Sector: ${cv.targetSector.join(', ')}`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 600, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setAiQs(parsed.questions || []);
    } catch {
      setAiError(lang === 'sw' ? 'Hitilafu — jaribu tena.' : 'Error — please try again.');
    }
    setAiLoading(false);
  };

  const tabs = [
    { id: 'general', sw: 'Maswali', en: 'Questions' },
    { id: 'behavioral', sw: 'STAR', en: 'STAR' },
    { id: 'tips', sw: '🎯 Tips', en: '🎯 Tips' },
    { id: 'ai', sw: '✨ AI', en: '✨ AI' },
    { id: 'coach', sw: '💬 Coach', en: '💬 Coach' },
    { id: 'skills', sw: '📊 Gap', en: '📊 Gap' },
    { id: 'softskills', sw: '🧠 Ujuzi', en: '🧠 Skills' },
    { id: 'career', sw: '🚀 Njia', en: '🚀 Career' },
    { id: 'network', sw: '🤝 Net', en: '🤝 Network' },
  ] as const;

  const Accordion = ({ id, q, tip }: { id: string; q: string; tip: string }) => {
    const open = openId === id;
    return (
      <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${open ? 'rgba(231,99,59,0.25)' : C.border}`, marginBottom: 9, overflow: 'hidden', transition: 'border-color 0.2s' }}>
        <button onClick={() => setOpenId(open ? null : id)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{q}</div>
          {open ? <ChevronUp size={16} color={C.coral} /> : <ChevronDown size={16} color={C.muted} />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ padding: '0 16px 14px', borderTop: `1px solid rgba(231,99,59,0.12)` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.coral, marginTop: 5, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.65 }}>{tip}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (activeTab === 'coach') return <JobCoach onBack={() => setActiveTab('general')} />;
  if (activeTab === 'skills') return <SkillsGap onBack={() => setActiveTab('general')} />;
  if (activeTab === 'softskills') return <SoftSkillsTrainer onBack={() => setActiveTab('general')} />;
  if (activeTab === 'career') return <CareerPathExplorer onBack={() => setActiveTab('general')} />;
  if (activeTab === 'network') return <NetworkingKit onBack={() => setActiveTab('general')} />;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 0', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200"><circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.03em' }}>{lang === 'sw' ? 'Jiandae Mahojiano' : 'Interview Prep'}</div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 3 }}>{lang === 'sw' ? 'Maswali na vidokezo vya kushinda mahojiano' : 'Questions and tips to ace your interview'}</div>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: activeTab === t.id ? '#F5F0E8' : 'rgba(245,240,232,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: activeTab === t.id ? '2px solid #E7633B' : '2px solid transparent', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.18s' }}>
              {lang === 'sw' ? t.sw : t.en}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
        {activeTab === 'general' && QUESTIONS.general.map(q => (
          <Accordion key={q.id} id={q.id} q={lang === 'sw' ? q.sw : q.en} tip={lang === 'sw' ? q.tip_sw : q.tip_en} />
        ))}

        {activeTab === 'behavioral' && (
          <>
            <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 14, padding: '12px 14px', marginBottom: 14, border: `1px solid rgba(231,99,59,0.2)` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.coralD, marginBottom: 4 }}>💡 STAR Method</div>
              <div style={{ fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>
                <b>S</b>ituation → <b>T</b>ask → <b>A</b>ction → <b>R</b>esult
              </div>
            </div>
            {QUESTIONS.behavioral.map(q => (
              <Accordion key={q.id} id={q.id} q={lang === 'sw' ? q.sw : q.en} tip={lang === 'sw' ? q.tip_sw : q.tip_en} />
            ))}
          </>
        )}

        {activeTab === 'tips' && QUESTIONS.tips.map(tip => (
          <motion.div key={tip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 10, display: 'flex', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>{tip.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 5 }}>{lang === 'sw' ? tip.sw : tip.en}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{lang === 'sw' ? tip.body_sw : tip.body_en}</div>
            </div>
          </motion.div>
        ))}

        {activeTab === 'ai' && (
          <div>
            <div style={{ background: C.ink, borderRadius: 18, padding: '18px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.06, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={20} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8', marginBottom: 3 }}>{lang === 'sw' ? 'Maswali Maalum kwa Wewe' : 'Personalized Questions'}</div>
                  <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.45)' }}>{lang === 'sw' ? 'Claude AI inaunda maswali kulingana na CV yako' : 'Claude AI generates questions based on your CV'}</div>
                </div>
              </div>
            </div>

            {aiQs.length === 0 && !aiLoading && (
              <button onClick={generateAIQuestions}
                style={{ width: '100%', padding: 16, background: C.coral, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <Sparkles size={16} color="white" />
                {lang === 'sw' ? 'Unda Maswali Yangu →' : 'Generate My Questions →'}
              </button>
            )}

            {aiLoading && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid #D4C8B8`, borderTopColor: C.coral, margin: '0 auto 14px' }} />
                <div style={{ fontSize: 13, color: C.muted }}>{lang === 'sw' ? 'Inaandika maswali yako...' : 'Generating your questions...'}</div>
              </div>
            )}

            {aiError && <p style={{ color: '#C0392B', fontSize: 12, background: '#FEF2F0', padding: '10px 12px', borderRadius: 10, marginBottom: 14 }}>{aiError}</p>}

            {aiQs.length > 0 && (
              <>
                {aiQs.map((q, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(231,99,59,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.coral, flexShrink: 0, fontFamily: "'Space Grotesk', sans-serif" }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.55, margin: 0 }}>{q}</p>
                  </div>
                ))}
                <button onClick={generateAIQuestions} style={{ width: '100%', padding: 13, background: C.sand, border: 'none', borderRadius: 14, fontSize: 12, fontWeight: 600, color: C.muted, cursor: 'pointer', fontFamily: "'Sora', sans-serif", marginTop: 6 }}>
                  {lang === 'sw' ? 'Unda Maswali Mapya' : 'Regenerate Questions'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
