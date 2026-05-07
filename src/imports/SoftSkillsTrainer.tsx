import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, Star, Check, RotateCcw } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', coralD: '#C44E29', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', greenL: '#52B788', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Lesson {
  id: string;
  skill: string;
  icon: string;
  tagline_sw: string;
  tagline_en: string;
  why_sw: string;
  why_en: string;
  tips: { sw: string; en: string; example_sw: string; example_en: string }[];
  quiz: { q_sw: string; q_en: string; options: string[]; correct: number; explain_sw: string; explain_en: string }[];
  xp: number;
  color: string;
}

const LESSONS: Lesson[] = [
  {
    id: 'communication', icon: '💬', skill: 'Communication',
    tagline_sw: 'Zungumza kwa ujasiri na wazi', tagline_en: 'Speak with confidence and clarity',
    why_sw: 'Waajiri wanasema mawasiliano mazuri ni ujuzi #1 wanaoangalia. 78% ya kazi zinaenda kwa watu wanaozungumza vizuri — si wenye shahada nzuri zaidi.',
    why_en: 'Employers say good communication is the #1 skill they look for. 78% of jobs go to people who communicate well — not those with the best degrees.',
    tips: [
      { sw: 'Sikiliza kabla ya kujibu', en: 'Listen before you respond', example_sw: 'Katika mahojiano: subiri swali liishe kabla ya kuanza kujibu. Chukua pumzi moja.', example_en: 'In interviews: let the question fully finish before responding. Take one breath.' },
      { sw: 'Zungumza kwa mifano', en: 'Speak with concrete examples', example_sw: 'Badala ya "Niko na uzoefu" — sema "Niliongoza timu ya watu 5 kwenye mradi wa miezi 3."', example_en: 'Instead of "I have experience" — say "I led a team of 5 on a 3-month project."' },
      { sw: 'Usitumie maneno ya upotevu', en: 'Avoid filler words', example_sw: '"Kwa hivyo... uh... yaani..." zinafanya uonekane hujajua unachosema. Jifunze kusimama kimya kidogo badala yake.', example_en: '"So... um... like..." make you sound unsure. Learn to pause briefly instead.' },
      { sw: 'Weka mawasiliano ya macho', en: 'Maintain eye contact', example_sw: 'Angalia mtu machoni kwa sekunde 3-5, kisha angalia mbali kidogo. Hii inaonyesha imani na heshima.', example_en: 'Hold eye contact for 3-5 seconds, then glance away briefly. Shows confidence and respect.' },
    ],
    quiz: [
      { q_sw: 'Wakati wa mahojiano, unapaswa...', q_en: 'During a job interview, you should...', options: ['Jibu haraka kabla ya swali kuisha', 'Sikiliza swali lote, fikiria kidogo, kisha jibu', 'Zungumza muda mwingi kadri uwezavyo', 'Kubaliana na kila kitu mhojiwa anachosema'], correct: 1, explain_sw: 'Kusikiliza swali lote na kufikiria kabla ya kujibu inaonyesha akili na heshima.', explain_en: 'Listening to the full question and thinking before answering shows intelligence and respect.' },
      { q_sw: '"Nilikuongoza timu ya watu 5" ni mfano wa...', q_en: '"I led a team of 5 people" is an example of...', options: ['Kujisifu kupita kiasi', 'Mawasiliano yenye mifano halisi', 'Kuzungumza kwa wingi', 'Kujibu swali ambalo halikuulizwa'], correct: 1, explain_sw: 'Kutoa nambari halisi na mifano kunafanya mawasiliano yako kuaminika zaidi.', explain_en: 'Giving concrete numbers and examples makes your communication more credible.' },
    ],
    xp: 150, color: '#2563EB',
  },
  {
    id: 'teamwork', icon: '🤝', skill: 'Teamwork',
    tagline_sw: 'Fanya kazi vizuri na wengine', tagline_en: 'Work effectively with others',
    why_sw: '94% ya waajiri wanasema ushirikiano ni muhimu. Hata ukifanya kazi peke yako, utashirikiana na wateja, wasambazaji, na wenzako.',
    why_en: '94% of employers say teamwork is critical. Even if you work alone, you\'ll collaborate with clients, suppliers, and colleagues.',
    tips: [
      { sw: 'Kubali tofauti za maoni', en: 'Embrace different opinions', example_sw: 'Badala ya "Hapana, hiyo si sahihi" — sema "Naona unavyofikiri, lakini ninaona tofauti hivi..."', example_en: 'Instead of "No, that\'s wrong" — say "I see your point, but I see it differently..."' },
      { sw: 'Toa na pokea msaada', en: 'Give and receive help', example_sw: 'Kuuliza msaada si udhaifu — ni akili. Waambie wenzako kwa uwazi unapohitaji msaada.', example_en: 'Asking for help is not weakness — it\'s wisdom. Tell teammates openly when you need support.' },
      { sw: 'Kaa na ahadi zako', en: 'Keep your commitments', example_sw: 'Ukisema utafanya kitu Ijumaa — fanya Ijumaa. Ahadi ndogo zinajenga imani kubwa.', example_en: 'If you say you\'ll do something by Friday — do it by Friday. Small promises build big trust.' },
      { sw: 'Shiriki sifa, kubali makosa', en: 'Share credit, own mistakes', example_sw: '"Timu yangu ilifanya vizuri" inajenga uhusiano. "Nilikosea na nitaboresha" inajenga heshima.', example_en: '"My team did great" builds relationships. "I made a mistake and will improve" builds respect.' },
    ],
    quiz: [
      { q_sw: 'Mwenzako ana wazo tofauti nawe. Unafanya nini?', q_en: 'A teammate has a different idea from yours. You should...', options: ['Pinga moja kwa moja', 'Sikia, uliza maswali, kisha shiriki mtazamo wako', 'Nakili wazo lake bila kulisema', 'Lalamika kwa msimamizi'], correct: 1, explain_sw: 'Kusikiliza na kisha kushiriki mtazamo wako kwa heshima ni njia ya ushirikiano bora.', explain_en: 'Listening first, then sharing your perspective respectfully is the way of good teamwork.' },
    ],
    xp: 120, color: '#059669',
  },
  {
    id: 'problemsolving', icon: '🧩', skill: 'Problem Solving',
    tagline_sw: 'Tafuta suluhu, si udhuru', tagline_en: 'Find solutions, not excuses',
    why_sw: 'Waajiri wanalipia kutatua matatizo. Kila nafasi ya kazi ni tatizo ambalo mwaajiri anataka mtu kutatua. Uwezo wa kutatua matatizo = thamani yako.',
    why_en: 'Employers pay you to solve problems. Every job opening is a problem the employer wants solved. Problem-solving ability = your value.',
    tips: [
      { sw: 'Eleza tatizo kwanza', en: 'Define the problem first', example_sw: 'Kabla ya kutafuta suluhu, uliza "Tatizo halisi ni nini?" Mara nyingi tunatafuta suluhu ya tatizo lisilo sahihi.', example_en: 'Before seeking solutions, ask "What is the real problem?" We often solve the wrong problem.' },
      { sw: 'Toa chaguzi 3 si 1', en: 'Offer 3 options, not 1', example_sw: 'Mwambie mkubwa wako: "Nina suluhu 3 na faida/hasara za kila moja. Wewe chagua." Inaonyesha akili na heshima.', example_en: 'Tell your boss: "I have 3 solutions with pros/cons for each. You decide." Shows intelligence and respect.' },
      { sw: 'Jifunze kutoka makosa', en: 'Learn from mistakes', example_sw: 'Baada ya tatizo kutatuliwa, jiulize: "Nilifanya nini vizuri? Ningeweza kufanya nini bora zaidi?" Andika jibu.', example_en: 'After a problem is solved, ask: "What did I do well? What could I improve?" Write it down.' },
    ],
    quiz: [
      { q_sw: 'Msimamizi wako anakuuliza jinsi ya kutatua tatizo. Jibu bora ni...', q_en: 'Your manager asks how to solve a problem. The best response is...', options: ['"Sijui"', '"Tatizo hili ni gumu sana"', '"Nina chaguzi 2-3, hebu tuziangalie pamoja"', '"Ni tatizo lako, si langu"'], correct: 2, explain_sw: 'Kutoa chaguzi nyingi inaonyesha umefikiria na unashirikiana, badala ya kusubiri tu maagizo.', explain_en: 'Offering multiple options shows you\'ve thought it through and are collaborative, not just waiting for orders.' },
    ],
    xp: 130, color: C.coral,
  },
  {
    id: 'adaptability', icon: '🔄', skill: 'Adaptability',
    tagline_sw: 'Badilika haraka, shinda mazingira', tagline_en: 'Change fast, win any situation',
    why_sw: 'Soko la kazi linabadilika kila mwaka — AI, teknolojia, sera. Watu wanaoweza kubadilika wana kazi hata wakati wengine wanafukuzwa.',
    why_en: 'The job market changes every year — AI, technology, policy. People who adapt keep jobs even when others are let go.',
    tips: [
      { sw: 'Jifunze kitu kipya kila mwezi', en: 'Learn something new every month', example_sw: 'Hata saa 1 kwa wiki kwenye YouTube au Coursera. Kwa mwaka, una ujuzi 12 mpya.', example_en: 'Even 1 hour per week on YouTube or Coursera. In a year, you have 12 new skills.' },
      { sw: 'Angalia mabadiliko kama fursa', en: 'See change as opportunity', example_sw: 'Wakati kampuni inabadilisha mfumo — kuwa wa kwanza kujifunza mfumo mpya. Utakuwa muhimu.', example_en: 'When a company changes systems — be the first to learn the new one. You become indispensable.' },
      { sw: 'Uliza maswali, usipinga bila kuelewa', en: 'Ask questions before resisting', example_sw: '"Kwa nini tunabadilika?" ni swali nzuri. "Mabadiliko haya hayafanyi kazi" bila maelezo ni tatizo.', example_en: '"Why are we changing?" is a good question. "This change won\'t work" without explanation is a problem.' },
    ],
    quiz: [
      { q_sw: 'Kampuni inabadilisha mfumo wa kompyuta unaoujua vizuri. Unafanya nini?', q_en: 'Your company is changing to a new software system you don\'t know. You...', options: ['Lalamika kwamba mfumo wa zamani ulikuwa bora', 'Jifunze mfumo mpya haraka iwezekanavyo', 'Kataaa kufuata mabadiliko', 'Fanya kazi polepole ili kuchelewa mabadiliko'], correct: 1, explain_sw: 'Kujifunza haraka inaonyesha kubadilika na inaifanya shirika likuone kama muhimu.', explain_en: 'Learning quickly shows adaptability and makes the organization see you as valuable.' },
    ],
    xp: 110, color: '#7C3AED',
  },
  {
    id: 'negotiation', icon: '💪', skill: 'Negotiation',
    tagline_sw: 'Omba unachotaka — kwa heshima', tagline_en: 'Ask for what you deserve — respectfully',
    why_sw: 'Wengi wa Watanzania hawajui jinsi ya kuomba mshahara bora au masharti mazuri. Kujifunza mazungumzo kunaweza kuongeza mshahara wako kwa 20-40%.',
    why_en: 'Many Tanzanians don\'t know how to ask for better pay or terms. Learning negotiation can increase your salary by 20-40%.',
    tips: [
      { sw: 'Fanya utafiti wa bei ya soko', en: 'Research market rates first', example_sw: 'Tumia KaziAI Salary Guide kuona wastani. Ujue TZS X hadi Y ni kawaida kabla ya kuzungumza na mwaajiri.', example_en: 'Use KaziAI Salary Guide to see averages. Know TZS X to Y is normal before talking to employer.' },
      { sw: 'Omba zaidi ya unachotaka', en: 'Ask for more than you want', example_sw: 'Unataka TZS 1.5M? Omba TZS 1.8M. Mazungumzo daima yanakwenda chini, kamwe hayakwendi juu.', example_en: 'Want TZS 1.5M? Ask for TZS 1.8M. Negotiations always go down, never up.' },
      { sw: 'Tumia ukimya kama silaha', en: 'Use silence as a tool', example_sw: 'Baada ya kutoa nambari yako — simama kimya. Yule anayezungumza kwanza anathibitisha nambari ya pili.', example_en: 'After stating your number — be quiet. The first person to speak after concedes the point.' },
      { sw: 'Usiomba kwa hofu — eleza thamani yako', en: 'Don\'t beg — explain your value', example_sw: '"Nahitaji pesa" ni dhaifu. "Kulingana na uzoefu wangu na soko, TZS 1.5M ni haki" ni nguvu.', example_en: '"I need money" is weak. "Based on my experience and market rates, TZS 1.5M is fair" is strong.' },
    ],
    quiz: [
      { q_sw: 'Mwaajiri anakuuliza unatarajia mshahara gani. Unasema...', q_en: 'An employer asks your salary expectation. You say...', options: ['"Lolote mtakalotoa"', '"Sijui — wewe nipe"', '"Kulingana na utafiti wa soko, TZS 1.5M hadi 2M inaonekana haki kwa nafasi hii"', '"Siwezi kusema"'], correct: 2, explain_sw: 'Kujibu kwa utafiti wa soko kunaonyesha uko tayari na unajua thamani yako.', explain_en: 'Answering with market research shows you\'re prepared and know your worth.' },
    ],
    xp: 180, color: C.coral,
  },
];

interface Props { onBack: () => void; }

export function SoftSkillsTrainer({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const [active, setActive] = useState<Lesson | null>(null);
  const [lessonStep, setLessonStep] = useState<'intro' | 'tips' | 'quiz' | 'done'>('intro');
  const [tipIdx, setTipIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const startLesson = (l: Lesson) => {
    setActive(l);
    setLessonStep('intro');
    setTipIdx(0);
    setQuizIdx(0);
    setSelected(null);
    setShowExplain(false);
    setCorrectCount(0);
  };

  const totalXP = completedIds.reduce((s, id) => s + (LESSONS.find(l => l.id === id)?.xp || 0), 0);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplain(true);
    if (idx === active!.quiz[quizIdx].correct) setCorrectCount(c => c + 1);
  };

  const nextQuiz = () => {
    if (quizIdx + 1 < active!.quiz.length) {
      setQuizIdx(q => q + 1);
      setSelected(null);
      setShowExplain(false);
    } else {
      setLessonStep('done');
      if (!completedIds.includes(active!.id)) setCompletedIds(p => [...p, active!.id]);
    }
  };

  if (active && lessonStep !== null) {
    const quiz = active.quiz[quizIdx];
    return (
      <div style={{ background: C.cream, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="160" height="160" viewBox="0 0 160 160"><circle cx="140" cy="20" r="120" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <button onClick={() => setActive(null)} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
            </button>
            <div style={{ fontSize: '1.4rem' }}>{active.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>{active.skill}</div>
            {/* XP badge */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,240,232,0.1)', borderRadius: 99, padding: '4px 10px' }}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', fontFamily: "'Space Grotesk', sans-serif" }}>+{active.xp} XP</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 14, height: 4, background: 'rgba(245,240,232,0.12)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
            <motion.div animate={{ width: lessonStep === 'intro' ? '10%' : lessonStep === 'tips' ? `${10 + (tipIdx / active.tips.length) * 60}%` : lessonStep === 'quiz' ? `${70 + (quizIdx / active.quiz.length) * 25}%` : '100%' }}
              style={{ height: '100%', background: active.color, borderRadius: 99 }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 40px' }}>
          <AnimatePresence mode="wait">
            {/* INTRO */}
            {lessonStep === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: 16 }}>{active.icon}</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 10 }}>
                  {lang === 'sw' ? active.tagline_sw : active.tagline_en}
                </h2>
                <div style={{ background: `${active.color}12`, borderRadius: 16, border: `1px solid ${active.color}30`, padding: '16px', marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active.color, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {lang === 'sw' ? 'Kwa nini ujuzi huu ni muhimu' : 'Why this skill matters'}
                  </div>
                  <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.7 }}>{lang === 'sw' ? active.why_sw : active.why_en}</p>
                </div>
                <div style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {lang === 'sw' ? 'Utakachojifunza' : 'What you\'ll learn'}
                  </div>
                  {[
                    `${active.tips.length} ${lang === 'sw' ? 'vidokezo vya vitendo' : 'practical tips'}`,
                    `${active.quiz.length} ${lang === 'sw' ? 'maswali ya kujaribu' : 'practice questions'}`,
                    `+${active.xp} XP ${lang === 'sw' ? 'ukimalizia' : 'upon completion'}`,
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: `${active.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} color={active.color} />
                      </div>
                      <span style={{ fontSize: 12, color: C.ink2 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setLessonStep('tips')}
                  style={{ width: '100%', padding: 16, background: active.color, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {lang === 'sw' ? 'Anza Somo →' : 'Start Lesson →'}
                </motion.button>
              </motion.div>
            )}

            {/* TIPS */}
            {lessonStep === 'tips' && (
              <motion.div key={`tip-${tipIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {lang === 'sw' ? 'Kidokezo' : 'Tip'} {tipIdx + 1}/{active.tips.length}
                  </span>
                </div>
                <div style={{ background: C.ink, borderRadius: 20, padding: '22px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                  <svg style={{ position: 'absolute', right: -10, top: -10, opacity: 0.06, pointerEvents: 'none' }} width="120" height="120" viewBox="0 0 120 120"><circle cx="100" cy="20" r="90" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{active.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em', marginBottom: 10, lineHeight: 1.2 }}>
                    {lang === 'sw' ? active.tips[tipIdx].sw : active.tips[tipIdx].en}
                  </h3>
                </div>
                <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 24 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
                    💡 {lang === 'sw' ? 'Mfano' : 'Example'}
                  </div>
                  <p style={{ fontSize: 13, color: C.ink2, lineHeight: 1.7, fontStyle: 'italic' }}>
                    "{lang === 'sw' ? active.tips[tipIdx].example_sw : active.tips[tipIdx].example_en}"
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { if (tipIdx + 1 < active.tips.length) setTipIdx(t => t + 1); else setLessonStep('quiz'); }}
                  style={{ width: '100%', padding: 16, background: active.color, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                  {tipIdx + 1 < active.tips.length ? (lang === 'sw' ? 'Kidokezo Kinachofuata →' : 'Next Tip →') : (lang === 'sw' ? 'Nenda Maswali →' : 'Go to Quiz →')}
                </motion.button>
              </motion.div>
            )}

            {/* QUIZ */}
            {lessonStep === 'quiz' && (
              <motion.div key={`quiz-${quizIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lang === 'sw' ? 'Swali' : 'Question'} {quizIdx + 1}/{active.quiz.length}
                </div>
                <div style={{ background: C.ink, borderRadius: 18, padding: '20px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                  <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="120" height="100" viewBox="0 0 120 100"><circle cx="110" cy="10" r="80" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.5, position: 'relative' }}>
                    {lang === 'sw' ? quiz.q_sw : quiz.q_en}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {quiz.options.map((opt, i) => {
                    const isCorrect = i === quiz.correct;
                    const isSelected = selected === i;
                    let bg = 'white', border = C.border2, color = C.ink;
                    if (selected !== null) {
                      if (isCorrect) { bg = '#ECFDF5'; border = 'rgba(45,106,79,0.4)'; color = C.green; }
                      else if (isSelected && !isCorrect) { bg = '#FEF2F0'; border = 'rgba(192,57,43,0.3)'; color = '#C0392B'; }
                      else { color = C.muted; }
                    }
                    return (
                      <motion.button key={i} onClick={() => handleAnswer(i)} whileTap={selected === null ? { scale: 0.97 } : {}}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, border: `1.5px solid ${border}`, background: bg, cursor: selected === null ? 'pointer' : 'default', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: selected !== null && isCorrect ? 'rgba(45,106,79,0.15)' : 'rgba(26,20,16,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: selected !== null && isCorrect ? C.green : C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                          {selected !== null && isCorrect ? '✓' : selected !== null && isSelected ? '✗' : 'ABCD'[i]}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color, lineHeight: 1.4 }}>{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>
                {showExplain && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: selected === quiz.correct ? '#ECFDF5' : '#FEF2F0', borderRadius: 14, padding: '14px', marginBottom: 16, border: `1px solid ${selected === quiz.correct ? 'rgba(45,106,79,0.2)' : 'rgba(192,57,43,0.2)'}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: selected === quiz.correct ? C.green : '#C0392B', marginBottom: 5 }}>
                      {selected === quiz.correct ? (lang === 'sw' ? '✓ Sahihi!' : '✓ Correct!') : (lang === 'sw' ? '✗ Jibu si sahihi' : '✗ Not quite')}
                    </div>
                    <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.6 }}>{lang === 'sw' ? quiz.explain_sw : quiz.explain_en}</p>
                  </motion.div>
                )}
                {showExplain && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={nextQuiz} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ width: '100%', padding: 15, background: active.color, color: 'white', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 16, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    {quizIdx + 1 < active.quiz.length ? (lang === 'sw' ? 'Swali Linalolifuata →' : 'Next Question →') : (lang === 'sw' ? 'Maliza Somo →' : 'Complete Lesson →')}
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* DONE */}
            {lessonStep === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', paddingTop: 20 }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>{active.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  {correctCount === active.quiz.length ? (lang === 'sw' ? '🎉 Bora Sana!' : '🎉 Perfect Score!') : correctCount >= active.quiz.length / 2 ? (lang === 'sw' ? '✨ Vizuri Sana!' : '✨ Well Done!') : (lang === 'sw' ? '📚 Jaribu Tena' : '📚 Keep Practicing')}
                </div>
                <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 18, border: '1px solid rgba(231,99,59,0.2)', padding: '20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.coral }}>{correctCount}/{active.quiz.length}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>{lang === 'sw' ? 'Majibu Sahihi' : 'Correct'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={20} fill="#F59E0B" color="#F59E0B" />+{active.xp}
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>XP</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>{active.tips.length}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase' }}>{lang === 'sw' ? 'Vidokezo' : 'Tips'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => startLesson(active)} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1.5px solid ${C.border2}`, background: 'transparent', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <RotateCcw size={14} color={C.muted} /> {lang === 'sw' ? 'Rudia' : 'Redo'}
                  </button>
                  <button onClick={() => setActive(null)} style={{ flex: 2, padding: 14, borderRadius: 14, background: C.ink, border: 'none', color: '#F5F0E8', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif" }}>
                    {lang === 'sw' ? 'Rudi Masomo →' : 'Back to Lessons →'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.cream, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200"><circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, position: 'relative' }}>
          <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
          </button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
              {lang === 'sw' ? 'Mafunzo ya Ujuzi' : 'Soft Skills Training'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>
              {lang === 'sw' ? 'Ujuzi wanaohitajika na waajiri wa Tanzania' : 'Skills Tanzanian employers actually want'}
            </div>
          </div>
        </div>
        {/* XP total */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,240,232,0.07)', borderRadius: 12, padding: '10px 14px', position: 'relative' }}>
          <Star size={18} color="#F59E0B" fill="#F59E0B" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B', fontVariantNumeric: 'tabular-nums' }}>{totalXP} XP</div>
            <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Grotesk', sans-serif" }}>{completedIds.length}/{LESSONS.length} {lang === 'sw' ? 'masomo' : 'lessons'} {lang === 'sw' ? 'yamekamilika' : 'completed'}</div>
          </div>
          <div style={{ flex: 1, marginLeft: 8, height: 5, background: 'rgba(245,240,232,0.12)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${(completedIds.length / LESSONS.length) * 100}%` }} style={{ height: '100%', background: '#F59E0B', borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Research insight */}
      <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
        <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 14, border: '1px solid rgba(231,99,59,0.18)', padding: '12px 14px', display: 'flex', gap: 10 }}>
          <div style={{ fontSize: '1.2rem' }}>📊</div>
          <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>
            {lang === 'sw' ? '83% ya waajiri wa Tanzania wanasema mawasiliano, ushirikiano, na utatuzi wa matatizo ni muhimu zaidi kuliko shahada.' : '83% of Tanzanian employers say communication, teamwork, and problem-solving matter more than your degree.'}
          </p>
        </div>
      </div>

      {/* Lesson cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 100px' }}>
        {LESSONS.map((l, i) => {
          const done = completedIds.includes(l.id);
          return (
            <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => startLesson(l)}
              style={{ background: done ? '#ECFDF5' : 'white', borderRadius: 18, border: `1px solid ${done ? 'rgba(45,106,79,0.25)' : C.border}`, padding: '16px 18px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
              <div style={{ width: 50, height: 50, borderRadius: 15, background: `${l.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{l.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{l.skill}</div>
                  {done && <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(45,106,79,0.12)', color: C.green }}>✓ Done</div>}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>{lang === 'sw' ? l.tagline_sw : l.tagline_en}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>+{l.xp} XP</span>
                  </div>
                  <span style={{ fontSize: 10, color: C.muted }}>·</span>
                  <span style={{ fontSize: 10, color: C.muted }}>{l.tips.length} {lang === 'sw' ? 'vidokezo' : 'tips'} + {l.quiz.length} quiz</span>
                </div>
              </div>
              <ChevronRight size={16} color={C.sand2} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
