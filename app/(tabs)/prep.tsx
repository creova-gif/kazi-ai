import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const ANTHROPIC_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
};

const callClaude = async (prompt: string, maxTokens = 600) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: ANTHROPIC_HEADERS,
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
};

type Tool = 'interview' | 'skills' | 'coach' | 'networking' | null;

export default function PrepScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const lang = state.language;
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const [activeTool, setActiveTool] = useState<Tool>(null);
  const open = (tool: Tool) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveTool(tool); };

  const tools = [
    {
      id: 'interview' as Tool, icon: 'mic', title: t('Interview Prep', 'Maandalizi ya Usaili'),
      subtitle: t('Practice common Tanzania interview questions with AI feedback', 'Fanya mazoezi ya maswali ya usaili'),
      color: colors.primary,
    },
    {
      id: 'skills' as Tool, icon: 'trending-up', title: t('Skills Gap Analyser', 'Uchambuzi wa Ujuzi'),
      subtitle: t('Find skill gaps for your target roles and get learning tips', 'Pata mapungufu ya ujuzi na vidokezo vya kujifunza'),
      color: colors.success,
    },
    {
      id: 'coach' as Tool, icon: 'chatbubble-ellipses', title: t('AI Career Coach', 'Mshauri wa Kazi wa AI'),
      subtitle: t('Chat with an AI coach about your career questions', 'Zungumza na mshauri wa AI kuhusu kazi yako'),
      color: '#6B5CDE',
    },
    {
      id: 'networking' as Tool, icon: 'people', title: t('Networking Kit', 'Kit ya Mtandao'),
      subtitle: t('Templates, tips and platforms for building your network in Tanzania', 'Violezo, vidokezo na majukwaa ya mtandao'),
      color: '#E7A43B',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t('Interview & Career Prep', 'Maandalizi ya Kazi')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('AI-powered tools for job seekers', 'Zana za AI kwa watafutaji kazi')}</Text>
        </View>

        {tools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolCard, { backgroundColor: colors.card, marginHorizontal: 16, marginBottom: 14 }]}
            onPress={() => open(tool.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.toolIcon, { backgroundColor: `${tool.color}18` }]}>
              <Ionicons name={tool.icon as any} size={28} color={tool.color} />
            </View>
            <View style={styles.toolText}>
              <Text style={[styles.toolTitle, { color: colors.foreground }]}>{tool.title}</Text>
              <Text style={[styles.toolSub, { color: colors.muted }]}>{tool.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>
        ))}

        {/* Quick stats */}
        <View style={[styles.statCard, { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 8 }]}>
          <Text style={styles.statTitle}>{t('Tanzania Job Market Tip', 'Kidokezo cha Soko la Kazi Tanzania')}</Text>
          <Text style={styles.statText}>
            {t(
              'Most employers in Tanzania value both technical skills AND soft skills. Always mention teamwork, communication, and adaptability in interviews.',
              'Waajiri wengi Tanzania wanathamini ujuzi wa kitaalamu NA ujuzi laini. Daima taja ushirikiano, mawasiliano, na uwezo wa kubadilika katika mahojiano.'
            )}
          </Text>
        </View>
      </ScrollView>

      <InterviewModal visible={activeTool === 'interview'} onClose={() => setActiveTool(null)} lang={lang} />
      <SkillsModal visible={activeTool === 'skills'} onClose={() => setActiveTool(null)} lang={lang} />
      <CoachModal visible={activeTool === 'coach'} onClose={() => setActiveTool(null)} lang={lang} />
      <NetworkingModal visible={activeTool === 'networking'} onClose={() => setActiveTool(null)} lang={lang} />
    </View>
  );
}

// ─── Interview Prep Modal ───
function InterviewModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const { state } = useApp();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ q: string; tip: string }[]>([]);
  const [selectedQ, setSelectedQ] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [category, setCategory] = useState('general');

  const CATEGORIES = [
    { id: 'general', label: t('General', 'Jumla') },
    { id: 'behavioral', label: t('Behavioral', 'Tabia') },
    { id: 'technical', label: t('Technical', 'Kiufundi') },
    { id: 'tanzania', label: t('Tanzania-Specific', 'Tanzania') },
  ];

  const generate = async () => {
    setLoading(true);
    setQuestions([]);
    const cv = state.cv;
    const prompt = `Generate 6 ${category} job interview questions for a ${cv.experienceLevel}-level job seeker in Tanzania targeting ${cv.targetSector.join(', ') || 'general'} sector. For each question provide a brief tip.
Respond ONLY as JSON array: [{"q": "question text", "tip": "brief tip"}]`;
    try {
      const text = await callClaude(prompt, 800);
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setQuestions(parsed);
    } catch {
      setQuestions([{ q: t('Failed to load. Try again.', 'Imeshindwa. Jaribu tena.'), tip: '' }]);
    }
    setLoading(false);
  };

  const getFeedback = async () => {
    if (!answer.trim()) return;
    setFeedbackLoading(true);
    setFeedback('');
    const prompt = `Question: "${selectedQ}"\nCandidate's answer: "${answer}"\n\nProvide brief constructive feedback (2-3 sentences) for a Tanzanian job interview. Be encouraging but specific about improvements.`;
    try {
      const text = await callClaude(prompt, 300);
      setFeedback(text);
    } catch {
      setFeedback(t('Could not get feedback.', 'Imeshindwa kupata maoni.'));
    }
    setFeedbackLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Interview Prep', 'Maandalizi ya Usaili')} onClose={onClose} lang={lang} />
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={modalStyles.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c.id} style={[modalStyles.chip, category === c.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                onPress={() => setCategory(c.id)}>
                <Text style={[modalStyles.chipText, category === c.id && { color: '#fff' }]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[modalStyles.aiBtn, { backgroundColor: colors.primary }]} onPress={generate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="refresh" size={18} color="#fff" />}
            <Text style={modalStyles.aiBtnText}>{loading ? t('Generating...', 'Inaunda...') : t('Generate Questions', 'Unda Maswali')}</Text>
          </TouchableOpacity>
          {questions.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[modalStyles.qCard, { backgroundColor: selectedQ === item.q ? colors.sand : colors.card, borderColor: selectedQ === item.q ? colors.primary : colors.border }]}
              onPress={() => { setSelectedQ(item.q); setAnswer(''); setFeedback(''); }}
              activeOpacity={0.85}
            >
              <Text style={[modalStyles.qText, { color: colors.foreground }]}>{i + 1}. {item.q}</Text>
              {item.tip ? <Text style={[modalStyles.tipText, { color: colors.muted }]}>Tip: {item.tip}</Text> : null}
            </TouchableOpacity>
          ))}
          {selectedQ ? (
            <View style={[modalStyles.practiceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[modalStyles.practiceLabel, { color: colors.foreground2 }]}>{t('Your Answer:', 'Jibu lako:')}</Text>
              <TextInput
                style={[modalStyles.textarea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                value={answer}
                onChangeText={setAnswer}
                multiline numberOfLines={5}
                placeholder={t('Type your answer here...', 'Andika jibu lako hapa...')}
                placeholderTextColor={colors.muted}
              />
              <TouchableOpacity style={[modalStyles.aiBtn, { backgroundColor: colors.success, marginTop: 10 }]} onPress={getFeedback} disabled={feedbackLoading}>
                {feedbackLoading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="checkmark-circle" size={18} color="#fff" />}
                <Text style={modalStyles.aiBtnText}>{t('Get AI Feedback', 'Pata Maoni ya AI')}</Text>
              </TouchableOpacity>
              {feedback ? (
                <View style={[modalStyles.feedbackBox, { backgroundColor: colors.sand, borderColor: colors.sand2 }]}>
                  <Text style={[modalStyles.feedbackText, { color: colors.foreground }]}>{feedback}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Skills Gap Modal ───
function SkillsModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const { state } = useApp();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult] = useState<{ missing: string[]; present: string[]; tips: string[] } | null>(null);

  const analyse = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setResult(null);
    const cv = state.cv;
    const prompt = `Skills gap analysis for Tanzania job market.
Target role: "${targetRole}".
Current skills: ${cv.skills.map(s => s.name).join(', ') || 'none listed'}.
Experience: ${cv.experienceLevel}. Education: ${cv.educationLevel}.
Respond ONLY as JSON: {"missing": ["skill1","skill2","skill3"], "present": ["skill1","skill2"], "tips": ["learning tip1","tip2","tip3"]}`;
    try {
      const text = await callClaude(prompt, 600);
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setResult(parsed);
    } catch {
      setResult({ missing: [], present: [], tips: [t('Analysis failed. Try again.', 'Imeshindwa. Jaribu tena.')] });
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Skills Gap Analyser', 'Uchambuzi wa Ujuzi')} onClose={onClose} lang={lang} />
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={[modalStyles.label, { color: colors.muted }]}>{t('Target Role', 'Nafasi Inayolengwa')}</Text>
          <TextInput
            style={[modalStyles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
            value={targetRole}
            onChangeText={setTargetRole}
            placeholder={t('e.g. Finance Manager at a bank', 'k.m. Meneja wa Fedha')}
            placeholderTextColor={colors.muted}
          />
          <TouchableOpacity style={[modalStyles.aiBtn, { backgroundColor: colors.success }]} onPress={analyse} disabled={loading || !targetRole.trim()}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="analytics" size={18} color="#fff" />}
            <Text style={modalStyles.aiBtnText}>{loading ? t('Analysing...', 'Inachambua...') : t('Analyse My Skills', 'Chambua Ujuzi Wangu')}</Text>
          </TouchableOpacity>
          {result && (
            <>
              {result.present.length > 0 && (
                <View style={[modalStyles.resultBox, { backgroundColor: 'rgba(45,106,79,0.08)', borderColor: colors.success }]}>
                  <Text style={[modalStyles.resultTitle, { color: colors.success }]}>{t('Skills You Have', 'Ujuzi Ulio Nao')}</Text>
                  {result.present.map((s, i) => (
                    <View key={i} style={modalStyles.resultRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[modalStyles.resultText, { color: colors.foreground }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
              {result.missing.length > 0 && (
                <View style={[modalStyles.resultBox, { backgroundColor: 'rgba(231,99,59,0.08)', borderColor: colors.primary }]}>
                  <Text style={[modalStyles.resultTitle, { color: colors.primary }]}>{t('Skills to Develop', 'Ujuzi wa Kukuza')}</Text>
                  {result.missing.map((s, i) => (
                    <View key={i} style={modalStyles.resultRow}>
                      <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
                      <Text style={[modalStyles.resultText, { color: colors.foreground }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
              {result.tips.length > 0 && (
                <View style={[modalStyles.resultBox, { backgroundColor: colors.sand, borderColor: colors.sand2 }]}>
                  <Text style={[modalStyles.resultTitle, { color: colors.foreground2 }]}>{t('Learning Tips', 'Vidokezo vya Kujifunza')}</Text>
                  {result.tips.map((tip, i) => (
                    <View key={i} style={modalStyles.resultRow}>
                      <Ionicons name="bulb-outline" size={16} color={colors.primary} />
                      <Text style={[modalStyles.resultText, { color: colors.foreground }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Job Coach Modal ───
function CoachModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const { state, addCoachMessage, clearCoachMessages } = useApp();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const STARTERS = [
    t('How do I negotiate salary in Tanzania?', 'Jinsi ya kujadili mshahara Tanzania?'),
    t('What should I wear to a job interview?', 'Nivae nini kwenye mahojiano?'),
    t('How do I write a LinkedIn profile?', 'Jinsi ya kuandika wasifu wa LinkedIn?'),
    t('Tips for networking in Dar es Salaam', 'Vidokezo vya mtandao Dar es Salaam'),
  ];

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    addCoachMessage({ role: 'user', text: msg });
    setLoading(true);
    const cv = state.cv;
    const history = state.coachMessages.slice(-6).map(m => ({ role: m.role, content: m.text }));
    const systemContext = `You are KaziAI Career Coach, an expert in the Tanzanian job market. User background: ${cv.firstName} ${cv.lastName}, ${cv.experienceLevel} level, sector interest: ${cv.targetSector.join(', ')}. Give practical, specific advice for Tanzania. Be encouraging and concise (2-4 sentences).`;
    const prompt = `${systemContext}\n\nConversation:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\nuser: ${msg}`;
    try {
      const reply = await callClaude(prompt, 400);
      addCoachMessage({ role: 'assistant', text: reply });
    } catch {
      addCoachMessage({ role: 'assistant', text: t('Sorry, I could not respond. Please try again.', 'Samahani, sikuweza kujibu. Jaribu tena.') });
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
          <View style={[modalStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={24} color={colors.foreground} /></TouchableOpacity>
            <Text style={[modalStyles.headerTitle, { color: colors.foreground }]}>{t('AI Career Coach', 'Mshauri wa Kazi')}</Text>
            <TouchableOpacity onPress={clearCoachMessages}><Ionicons name="trash-outline" size={20} color={colors.muted} /></TouchableOpacity>
          </View>

          <FlatList
            data={state.coachMessages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 16 }}
            ListHeaderComponent={state.coachMessages.length === 0 ? (
              <View>
                <View style={[modalStyles.assistantBubble, { backgroundColor: colors.sand, marginBottom: 20 }]}>
                  <Text style={[modalStyles.bubbleText, { color: colors.foreground }]}>
                    {t(`Habari! I'm your KaziAI Career Coach. I know the Tanzanian job market well. Ask me anything about job hunting, interviews, salary, or career growth!`, `Habari! Mimi ni Mshauri wako wa Kazi KaziAI. Niulize chochote kuhusu kutafuta kazi, mahojiano, mshahara, au ukuaji wa kazi!`)}
                  </Text>
                </View>
                <Text style={[modalStyles.label, { color: colors.muted, marginBottom: 8 }]}>{t('Try asking:', 'Jaribu kuuliza:')}</Text>
                {STARTERS.map((s, i) => (
                  <TouchableOpacity key={i} style={[modalStyles.starterBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => send(s)}>
                    <Text style={[modalStyles.starterText, { color: colors.foreground }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            renderItem={({ item }) => (
              <View style={item.role === 'user' ? modalStyles.userBubbleRow : modalStyles.aiBubbleRow}>
                <View style={[
                  item.role === 'user'
                    ? [modalStyles.userBubble, { backgroundColor: colors.primary }]
                    : [modalStyles.assistantBubble, { backgroundColor: colors.sand }]
                ]}>
                  <Text style={[modalStyles.bubbleText, { color: item.role === 'user' ? '#fff' : colors.foreground }]}>{item.text}</Text>
                </View>
              </View>
            )}
            ListFooterComponent={loading ? (
              <View style={modalStyles.aiBubbleRow}>
                <View style={[modalStyles.assistantBubble, { backgroundColor: colors.sand }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            ) : null}
          />

          <View style={[modalStyles.inputRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TextInput
              style={[modalStyles.chatInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              value={input}
              onChangeText={setInput}
              placeholder={t('Ask your career question...', 'Uliza swali lako la kazi...')}
              placeholderTextColor={colors.muted}
              multiline
            />
            <TouchableOpacity style={[modalStyles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => send()} disabled={loading || !input.trim()}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Networking Kit Modal ───
const PLATFORMS = [
  { name: 'LinkedIn', url: 'linkedin.com', tip: 'Most used by international NGOs and private sector. Add a professional photo and complete summary.' },
  { name: 'BrighterMonday Tanzania', url: 'brightermonday.co.tz', tip: 'Tanzania\'s top job board. Create a full profile to be found by recruiters.' },
  { name: 'Kazi Mtandaoni', url: 'kazimtandaoni.co.tz', tip: 'Local job platform with government and NGO listings.' },
  { name: 'Jobs in Tanzania', url: 'jobsintanzania.net', tip: 'Good for NGO, health and development sector jobs.' },
  { name: 'NGO Tanzania Network', url: 'ngotanzania.or.tz', tip: 'Connect with NGO professionals. Active community events.' },
];

const TEMPLATES = [
  {
    title: 'LinkedIn Connection Request',
    text: 'Dear [Name],\n\nI came across your profile while researching professionals in [industry/sector] in Tanzania. I am impressed by your work at [Company] and would love to connect to learn more about your experience and the industry. I am currently [your situation].\n\nWarm regards,\n[Your Name]',
  },
  {
    title: 'Informational Interview Request',
    text: 'Dear [Name],\n\nMy name is [Your Name] and I am a [student/professional] interested in building a career in [sector]. I greatly admire your work at [Organisation] and would be very grateful for 20–30 minutes of your time to learn from your experience.\n\nI am happy to meet at your convenience, in person or via video call.\n\nThank you for your time.\n[Your Name] | [Phone] | [Email]',
  },
  {
    title: 'Thank You After Meeting',
    text: 'Dear [Name],\n\nThank you so much for taking the time to meet with me on [date]. Our conversation about [topic] was incredibly valuable and gave me clear direction for my next steps.\n\nI particularly appreciated your advice on [specific point]. I will definitely follow up on [action you\'ll take].\n\nI hope to stay in touch and contribute positively to the [sector] community in Tanzania.\n\nWith gratitude,\n[Your Name]',
  },
];

function NetworkingModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [tab, setTab] = useState<'tips' | 'templates' | 'platforms'>('tips');

  const TIPS = [
    t('Attend Tanzania Chamber of Commerce events and industry meetups', 'Hudhuria matukio ya Chumba cha Biashara'),
    t('Follow key companies on LinkedIn and engage with their content', 'Fuata makampuni muhimu LinkedIn'),
    t('Join sector-specific WhatsApp and Telegram groups', 'Jiunge na makundi ya WhatsApp/Telegram'),
    t('Volunteer with professional associations (ICPAT, EASSy, etc.)', 'Jitolee na vyama vya kitaalamu'),
    t('Keep your network warm — send updates every 2-3 months', 'Weka mtandao wako macho — tuma masasisho'),
    t('Offer to help before asking for favours', 'Toa msaada kabla ya kuomba'),
    t('Attend university alumni events — strong networks in Tanzania', 'Hudhuria matukio ya wahitimu wa vyuo vikuu'),
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Networking Kit', 'Kit ya Mtandao')} onClose={onClose} lang={lang} />
        <View style={[modalStyles.tabRow, { borderBottomColor: colors.border }]}>
          {(['tips', 'templates', 'platforms'] as const).map(t2 => (
            <TouchableOpacity key={t2} style={[modalStyles.tab, tab === t2 && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 }]} onPress={() => setTab(t2)}>
              <Text style={[modalStyles.tabText, { color: tab === t2 ? colors.primary : colors.muted }]}>
                {t2 === 'tips' ? t('Tips', 'Vidokezo') : t2 === 'templates' ? t('Templates', 'Violezo') : 'Platforms'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {tab === 'tips' && TIPS.map((tip, i) => (
            <View key={i} style={[modalStyles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[modalStyles.tipNum, { backgroundColor: colors.primary }]}><Text style={modalStyles.tipNumText}>{i + 1}</Text></View>
              <Text style={[modalStyles.tipCardText, { color: colors.foreground }]}>{tip}</Text>
            </View>
          ))}
          {tab === 'templates' && TEMPLATES.map((tmpl, i) => (
            <View key={i} style={[modalStyles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[modalStyles.templateTitle, { color: colors.foreground }]}>{tmpl.title}</Text>
              <Text style={[modalStyles.templateText, { color: colors.foreground2 }]}>{tmpl.text}</Text>
            </View>
          ))}
          {tab === 'platforms' && PLATFORMS.map((p, i) => (
            <View key={i} style={[modalStyles.platformCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[modalStyles.platformIcon, { backgroundColor: colors.primary }]}>
                <Text style={modalStyles.platformInitial}>{p.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.platformName, { color: colors.foreground }]}>{p.name}</Text>
                <Text style={[modalStyles.platformUrl, { color: colors.primary }]}>{p.url}</Text>
                <Text style={[modalStyles.platformTip, { color: colors.muted }]}>{p.tip}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ModalHeader({ title, onClose, lang }: { title: string; onClose: () => void; lang: string }) {
  const colors = useColors();
  return (
    <View style={[modalStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={24} color={colors.foreground} /></TouchableOpacity>
      <Text style={[modalStyles.headerTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  toolCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 20,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  toolIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  toolText: { flex: 1, marginRight: 8 },
  toolTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toolSub: { fontSize: 13, lineHeight: 18 },
  statCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  statTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 8 },
  statText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  textarea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 120, textAlignVertical: 'top' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 12 },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.15)' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#3D3025' },
  qCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  qText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  tipText: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  practiceBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8 },
  practiceLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  feedbackBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  feedbackText: { fontSize: 13, lineHeight: 20 },
  resultBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 16 },
  resultTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  resultText: { fontSize: 13, flex: 1, lineHeight: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userBubbleRow: { alignItems: 'flex-end', marginBottom: 10 },
  aiBubbleRow: { alignItems: 'flex-start', marginBottom: 10 },
  userBubble: { maxWidth: '80%', borderRadius: 18, borderBottomRightRadius: 4, padding: 12 },
  assistantBubble: { maxWidth: '85%', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12 },
  bubbleText: { fontSize: 14, lineHeight: 22 },
  starterBtn: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  starterText: { fontSize: 13 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 13, fontWeight: '600' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  tipNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tipCardText: { fontSize: 14, lineHeight: 20, flex: 1 },
  templateCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  templateTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  templateText: { fontSize: 13, lineHeight: 22 },
  platformCard: { flexDirection: 'row', gap: 14, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  platformIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  platformInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
  platformName: { fontSize: 15, fontWeight: '700' },
  platformUrl: { fontSize: 12, marginTop: 2 },
  platformTip: { fontSize: 12, marginTop: 4, lineHeight: 18 },
});
