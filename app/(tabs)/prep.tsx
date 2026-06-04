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

interface CareerEvent {
  id: string;
  title: string;
  organizer: string;
  date: string;
  country: string;
  flag: string;
  city: string;
  type: 'virtual' | 'in-person' | 'hybrid';
  sector: string;
  color: string;
}

const EVENTS: CareerEvent[] = [
  { id: 'e1', title: 'KaziAI East Africa Career Fair', organizer: 'KaziAI', date: 'Jul 15, 2026', country: 'East Africa', flag: '🌍', city: 'Virtual', type: 'virtual', sector: 'All Sectors', color: '#E7633B' },
  { id: 'e2', title: 'Nairobi Tech Week Jobs Fair', organizer: 'iHub Nairobi', date: 'Jul 22, 2026', country: 'Kenya', flag: '🇰🇪', city: 'Nairobi', type: 'in-person', sector: 'Tech', color: '#2D6A4F' },
  { id: 'e3', title: 'Dar es Salaam Graduate Expo', organizer: 'UDSM Career Centre', date: 'Aug 5, 2026', country: 'Tanzania', flag: '🇹🇿', city: 'Dar es Salaam', type: 'hybrid', sector: 'All Sectors', color: '#1A5276' },
  { id: 'e4', title: 'Kigali Innovation & Jobs Conference', organizer: 'RDB Rwanda', date: 'Aug 10, 2026', country: 'Rwanda', flag: '🇷🇼', city: 'Kigali', type: 'in-person', sector: 'Tech & Finance', color: '#6B5CDE' },
  { id: 'e5', title: 'East Africa NGO Jobs Forum', organizer: 'NGO Network EA', date: 'Aug 20, 2026', country: 'Uganda', flag: '🇺🇬', city: 'Kampala', type: 'in-person', sector: 'NGO/Development', color: '#E7A43B' },
  { id: 'e6', title: 'Addis Ababa Careers Week', organizer: 'AAU Career Services', date: 'Sep 3, 2026', country: 'Ethiopia', flag: '🇪🇹', city: 'Addis Ababa', type: 'hybrid', sector: 'All Sectors', color: '#C0392B' },
];

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
      subtitle: t('Practice East Africa interview questions with AI feedback', 'Fanya mazoezi ya maswali ya usaili'),
      color: colors.primary,
    },
    {
      id: 'skills' as Tool, icon: 'trending-up', title: t('Skills Gap Analyser', 'Uchambuzi wa Ujuzi'),
      subtitle: t('Find skill gaps for your target roles across East Africa', 'Pata mapungufu ya ujuzi na vidokezo vya kujifunza'),
      color: colors.success,
    },
    {
      id: 'coach' as Tool, icon: 'chatbubble-ellipses', title: t('AI Career Coach', 'Mshauri wa Kazi wa AI'),
      subtitle: t('Chat with an AI coach about East Africa career opportunities', 'Zungumza na mshauri wa AI kuhusu kazi Afrika Mashariki'),
      color: '#6B5CDE',
    },
    {
      id: 'networking' as Tool, icon: 'people', title: t('Networking Kit', 'Kit ya Mtandao'),
      subtitle: t('Templates and tips for building your East Africa network', 'Violezo na vidokezo vya mtandao Afrika Mashariki'),
      color: '#E7A43B',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t('Career Prep', 'Maandalizi ya Kazi')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t('AI-powered tools for East Africa job seekers', 'Zana za AI kwa watafutaji kazi Afrika Mashariki')}</Text>
        </View>

        {/* Upcoming Events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <Text style={[styles.eventsTitle, { color: colors.foreground }]}>{t('Upcoming Events', 'Matukio Yajayo')}</Text>
            <View style={[styles.eaBadge, { backgroundColor: colors.sand }]}>
              <Text style={[styles.eaBadgeText, { color: colors.foreground2 }]}>🌍 East Africa</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {EVENTS.map(ev => (
              <TouchableOpacity
                key={ev.id}
                style={[styles.eventCard, { backgroundColor: colors.card }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                activeOpacity={0.85}
              >
                <View style={[styles.eventColorBar, { backgroundColor: ev.color }]} />
                <View style={styles.eventContent}>
                  <View style={[styles.eventTypePill, { backgroundColor: `${ev.color}18` }]}>
                    <Ionicons
                      name={ev.type === 'virtual' ? 'videocam' : ev.type === 'hybrid' ? 'git-merge' : 'location'}
                      size={11} color={ev.color}
                    />
                    <Text style={[styles.eventTypeText, { color: ev.color }]}>{ev.type}</Text>
                  </View>
                  <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={2}>{ev.title}</Text>
                  <Text style={[styles.eventOrg, { color: colors.muted }]}>{ev.organizer}</Text>
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventFlag}>{ev.flag}</Text>
                    <Text style={[styles.eventCity, { color: colors.muted }]}>{ev.city}</Text>
                  </View>
                  <View style={styles.eventDateRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.primary} />
                    <Text style={[styles.eventDate, { color: colors.primary }]}>{ev.date}</Text>
                  </View>
                  <Text style={[styles.eventSector, { color: colors.muted }]}>{ev.sector}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Tools */}
        <Text style={[styles.toolsLabel, { color: colors.muted, marginHorizontal: 16, marginBottom: 12 }]}>
          {t('AI TOOLS', 'ZANA ZA AI')}
        </Text>

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

        {/* East Africa Job Market Tip */}
        <View style={[styles.statCard, { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 8 }]}>
          <Text style={styles.statTitle}>🌍 {t('East Africa Job Market Tip', 'Kidokezo cha Soko la Kazi Afrika Mashariki')}</Text>
          <Text style={styles.statText}>
            {t(
              'Employers across Kenya, Tanzania, Uganda, Rwanda and Ethiopia increasingly value bilingual candidates. English + Swahili is a powerful combination. Highlight cross-border experience on your CV.',
              'Waajiri katika Kenya, Tanzania, Uganda, Rwanda na Ethiopia wanathamini sana wagombezi wa lugha mbili. Kiingereza + Kiswahili ni mchanganyiko wenye nguvu. Onyesha uzoefu wa nchi mbalimbali kwenye CV yako.'
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
    { id: 'east-africa', label: t('East Africa', 'Afrika Mashariki') },
  ];

  const generate = async () => {
    setLoading(true);
    setQuestions([]);
    const cv = state.cv;
    const country = cv.country || 'East Africa';
    const prompt = `Generate 6 ${category} job interview questions for a ${cv.experienceLevel}-level job seeker in ${country} (East Africa) targeting ${cv.targetSector.join(', ') || 'general'} sector. Include East Africa-specific context where relevant. For each question provide a brief tip.
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
    const prompt = `Question: "${selectedQ}"\nCandidate's answer: "${answer}"\n\nProvide brief constructive feedback (2-3 sentences) for an East Africa job interview. Be encouraging but specific about improvements.`;
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
    const country = cv.country || 'East Africa';
    const prompt = `Skills gap analysis for the East Africa job market (${country} context).
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
            placeholder={t('e.g. Finance Manager at a Nairobi bank', 'k.m. Meneja wa Fedha Nairobi')}
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
    t('How do salaries compare across East Africa?', 'Mishahara inafananaje Afrika Mashariki?'),
    t('Should I look for jobs in Kenya or Tanzania?', 'Nitafute kazi Kenya au Tanzania?'),
    t('How do I build a network across East Africa?', 'Jinsi ya kujenga mtandao Afrika Mashariki?'),
    t('Tips for working for an NGO in East Africa', 'Vidokezo vya kufanya kazi NGO Afrika Mashariki'),
  ];

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    addCoachMessage({ role: 'user', text: msg });
    setLoading(true);
    const cv = state.cv;
    const history = state.coachMessages.slice(-6).map(m => ({ role: m.role, content: m.text }));
    const systemContext = `You are KaziAI Career Coach, an expert in the East African job market covering Tanzania, Kenya, Uganda, Rwanda and Ethiopia. User background: ${cv.firstName} ${cv.lastName}, ${cv.experienceLevel} level, country: ${cv.country || 'East Africa'}, sector interest: ${cv.targetSector.join(', ')}. Give practical, specific advice for East Africa. Be encouraging and concise (2-4 sentences).`;
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
                    {t(`Habari! I'm your KaziAI Career Coach. I know the East African job market — Tanzania, Kenya, Uganda, Rwanda and Ethiopia. Ask me anything about job hunting, interviews, salary, or career growth!`, `Habari! Mimi ni Mshauri wako wa Kazi KaziAI. Niulize chochote kuhusu kutafuta kazi Afrika Mashariki!`)}
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
  { name: 'LinkedIn', url: 'linkedin.com', tip: 'Most used by international NGOs and private sector across East Africa. Add a professional photo and complete summary.' },
  { name: 'BrighterMonday EA', url: 'brightermonday.co.tz', tip: 'Top job board covering Tanzania, Kenya & Uganda. Create a full profile to be found by recruiters.' },
  { name: 'Fuzu', url: 'fuzu.com', tip: 'Growing platform across East Africa with smart job matching for Kenya, Uganda and Tanzania.' },
  { name: 'Jobs in Tanzania', url: 'jobsintanzania.net', tip: 'Good for NGO, health and development sector jobs in Tanzania.' },
  { name: 'MyJobMag Kenya', url: 'myjobmag.com/jobs/kenya', tip: 'Active Kenyan job board with strong private sector listings.' },
  { name: 'NGO East Africa Network', url: 'ngotanzania.or.tz', tip: 'Connect with NGO professionals across the region. Active community events.' },
];

const TEMPLATES = [
  {
    title: 'LinkedIn Connection Request',
    text: 'Dear [Name],\n\nI came across your profile while researching professionals in [industry/sector] across East Africa. I am impressed by your work at [Company] and would love to connect to learn more about your experience and the regional industry. I am currently [your situation].\n\nWarm regards,\n[Your Name]',
  },
  {
    title: 'Informational Interview Request',
    text: 'Dear [Name],\n\nMy name is [Your Name] and I am a [student/professional] interested in building a career in [sector] across East Africa. I greatly admire your work at [Organisation] and would be very grateful for 20–30 minutes of your time to learn from your experience across the region.\n\nI am happy to meet at your convenience, in person or via video call.\n\nThank you for your time.\n[Your Name] | [Phone] | [Email]',
  },
  {
    title: 'Thank You After Meeting',
    text: 'Dear [Name],\n\nThank you so much for taking the time to meet with me on [date]. Our conversation about [topic] and opportunities across East Africa was incredibly valuable.\n\nI particularly appreciated your advice on [specific point]. I will definitely follow up on [action].\n\nWith gratitude,\n[Your Name]',
  },
];

function NetworkingModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [tab, setTab] = useState<'tips' | 'templates' | 'platforms'>('tips');

  const TIPS = [
    t('Attend East Africa Chamber of Commerce events and industry meetups in your city', 'Hudhuria matukio ya Chumba cha Biashara Afrika Mashariki'),
    t('Follow key East African companies on LinkedIn and engage with their content regularly', 'Fuata makampuni ya Afrika Mashariki LinkedIn'),
    t('Join sector-specific WhatsApp and Telegram groups for your country and region', 'Jiunge na makundi ya WhatsApp/Telegram Afrika Mashariki'),
    t('Reach out to diaspora networks — many East Africans abroad hire back home', 'Wasiliana na mitandao ya diaspora'),
    t('Volunteer with NGOs to build your network and gain cross-border experience', 'Jitolee na NGOs kujenga mtandao na uzoefu wa kimataifa'),
    t('Use Fuzu, BrighterMonday and LinkedIn to be discovered by EA recruiters', 'Tumia Fuzu, BrighterMonday na LinkedIn kuonekana kwa waajiri'),
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Networking Kit', 'Kit ya Mtandao')} onClose={onClose} lang={lang} />
        <View style={[modalStyles.tabBar, { borderBottomColor: colors.border }]}>
          {(['tips', 'templates', 'platforms'] as const).map(tb => (
            <TouchableOpacity key={tb} style={[modalStyles.tabBtn, tab === tb && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]} onPress={() => setTab(tb)}>
              <Text style={[modalStyles.tabBtnText, { color: tab === tb ? colors.primary : colors.muted }]}>
                {tb === 'tips' ? t('Tips', 'Vidokezo') : tb === 'templates' ? t('Templates', 'Violezo') : t('Platforms', 'Majukwaa')}
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
              <Text style={[modalStyles.templateText, { color: colors.muted }]}>{tmpl.text}</Text>
            </View>
          ))}
          {tab === 'platforms' && PLATFORMS.map((p, i) => (
            <View key={i} style={[modalStyles.platformCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[modalStyles.platformName, { color: colors.primary }]}>{p.name}</Text>
              <Text style={[modalStyles.platformUrl, { color: colors.muted }]}>{p.url}</Text>
              <Text style={[modalStyles.platformTip, { color: colors.foreground }]}>{p.tip}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Shared Modal Header ───
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
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  eventsSection: { marginBottom: 8 },
  eventsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12, marginTop: 4 },
  eventsTitle: { fontSize: 16, fontWeight: '700' },
  eaBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  eaBadgeText: { fontSize: 12, fontWeight: '600' },
  eventCard: {
    width: 210, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  eventColorBar: { height: 4 },
  eventContent: { padding: 14 },
  eventTypePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 8 },
  eventTypeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  eventTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginBottom: 4 },
  eventOrg: { fontSize: 11, marginBottom: 6 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  eventFlag: { fontSize: 14 },
  eventCity: { fontSize: 11 },
  eventDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventDate: { fontSize: 11, fontWeight: '600' },
  eventSector: { fontSize: 10 },
  toolsLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8 },
  toolCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16 },
  toolIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  toolText: { flex: 1 },
  toolTitle: { fontSize: 16, fontWeight: '700' },
  toolSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  statCard: { borderRadius: 16, padding: 16, marginBottom: 8 },
  statTitle: { color: '#F5F0E8', fontSize: 14, fontWeight: '700', marginBottom: 8 },
  statText: { color: 'rgba(245,240,232,0.85)', fontSize: 13, lineHeight: 20 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.15)', backgroundColor: 'transparent' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#3D3025' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13, marginBottom: 16 },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  qCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  qText: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  tipText: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  practiceBox: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 8 },
  practiceLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  textarea: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  feedbackBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 10 },
  feedbackText: { fontSize: 14, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 15, marginBottom: 16 },
  resultBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  resultTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  resultText: { fontSize: 14, flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabBtnText: { fontSize: 14, fontWeight: '600' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  tipNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tipCardText: { fontSize: 14, flex: 1, lineHeight: 20 },
  templateCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  templateTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  templateText: { fontSize: 13, lineHeight: 20 },
  platformCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  platformName: { fontSize: 16, fontWeight: '700' },
  platformUrl: { fontSize: 12, marginBottom: 6 },
  platformTip: { fontSize: 13, lineHeight: 20 },
  userBubbleRow: { alignItems: 'flex-end', marginBottom: 10 },
  aiBubbleRow: { alignItems: 'flex-start', marginBottom: 10 },
  userBubble: { borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%' },
  assistantBubble: { borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%' },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  starterBtn: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  starterText: { fontSize: 14 },
  sand2: { color: 'transparent' },
});
