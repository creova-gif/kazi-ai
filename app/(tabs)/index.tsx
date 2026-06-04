import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform,
  FlatList, Switch, Alert, ActivityIndicator, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type WorkExperience, type Education, type Skill, type Reference } from '@/context/AppContext';

const makeId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

type SectionType = 'info' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'references' | 'score' | 'preview' | null;

function cvCompletion(cv: ReturnType<typeof useApp>['state']['cv']) {
  let score = 0;
  if (cv.firstName) score += 15;
  if (cv.email) score += 10;
  if (cv.phone) score += 10;
  if (cv.summary && cv.summary.length > 30) score += 20;
  if (cv.experience.length > 0) score += 20;
  if (cv.education.length > 0) score += 15;
  if (cv.skills.length > 0) score += 10;
  return Math.min(score, 100);
}

export default function CVBuilderScreen() {
  const colors = useColors();
  const { state, updateCV, addExperience, removeExperience, addEducation, removeEducation, addSkill, removeSkill, addReference, removeReference } = useApp();
  const insets = useSafeAreaInsets();
  const lang = state.language;
  const cv = state.cv;

  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiScore, setAiScore] = useState<null | { score: number; feedback: string[]; improvements: string[] }>(null);
  const [showScore, setShowScore] = useState(false);

  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const completion = cvCompletion(cv);

  const open = (s: SectionType) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveSection(s); };
  const close = () => setActiveSection(null);

  const generateSummary = async () => {
    setAiLoading(true);
    setAiResult('');
    const prompt = lang === 'sw'
      ? `Andika muhtasari wa kitaaluma kwa ajili ya CV kwa Kiingereza (paragraphs 2-3, maneno 80-100). Mtu: ${cv.firstName} ${cv.lastName}, Kiwango: ${cv.experienceLevel}, Elimu: ${cv.educationLevel}, Ujuzi: ${cv.skills.map(s => s.name).join(', ')}. Fanya iwe ya kuvutia na ya kitaalamu.`
      : `Write a professional CV summary for: ${cv.firstName} ${cv.lastName}, Level: ${cv.experienceLevel}, Skills: ${cv.skills.map(s => s.name).join(', ')}, Education: ${cv.educationLevel}${cv.institution ? ', Institution: ' + cv.institution : ''}. 2-3 sentences, 60-80 words, East Africa job market context. Be specific and impactful.`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 300, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? '';
      setAiResult(text);
    } catch {
      setAiResult(t('Failed to generate. Please try again.', 'Imeshindwa. Jaribu tena.'));
    }
    setAiLoading(false);
  };

  const scoreCV = async () => {
    setShowScore(true);
    setAiScore(null);
    const prompt = `Score this CV for the East Africa job market (1-100). Name: ${cv.firstName} ${cv.lastName}, Summary: "${cv.summary?.slice(0, 200)}", Experience: ${cv.experience.length} items, Education: ${cv.education.length} items, Skills: ${cv.skills.map(s => s.name).join(', ')}.
Respond ONLY as JSON: {"score": 72, "feedback": ["strength1","strength2"], "improvements": ["tip1","tip2","tip3"]}`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 500, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? '{}';
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      setAiScore(json);
    } catch {
      setAiScore({ score: 0, feedback: [], improvements: [t('Could not analyse CV.', 'Imeshindwa kuchambua CV.')] });
    }
  };

  const exportCV = async () => {
    const lines: string[] = [];
    lines.push((`${cv.firstName} ${cv.lastName}`).trim().toUpperCase());
    if (cv.title) lines.push(cv.title);
    if (cv.phone) lines.push(`📞 ${cv.phone}`);
    if (cv.email) lines.push(`📧 ${cv.email}`);
    if (cv.location) lines.push(`📍 ${cv.location}${cv.country ? ', ' + cv.country : ''}`);
    if (cv.linkedin) lines.push(`LinkedIn: ${cv.linkedin}`);
    if (cv.institution) lines.push(`🎓 ${cv.institution}${cv.gradYear ? ' (' + cv.gradYear + ')' : ''}`);
    lines.push('');
    if (cv.summary) { lines.push('── PROFESSIONAL SUMMARY ──'); lines.push(cv.summary); lines.push(''); }
    if (cv.experience.length > 0) {
      lines.push('── WORK EXPERIENCE ──');
      cv.experience.forEach(exp => {
        lines.push(`${exp.title} | ${exp.company}`);
        lines.push(`${exp.startDate}–${exp.current ? 'Present' : exp.endDate} | ${exp.location}`);
        if (exp.description) lines.push(exp.description);
        lines.push('');
      });
    }
    if (cv.education.length > 0) {
      lines.push('── EDUCATION ──');
      cv.education.forEach(edu => {
        lines.push(`${edu.degree} | ${edu.institution}`);
        lines.push(`${edu.year}${edu.grade ? ' · Grade: ' + edu.grade : ''}`);
        lines.push('');
      });
    }
    if (cv.skills.length > 0) {
      lines.push('── SKILLS ──');
      lines.push(cv.skills.map(s => s.name).join(' · '));
      lines.push('');
    }
    if (cv.languages.length > 0) {
      lines.push('── LANGUAGES ──');
      lines.push(cv.languages.map(l => `${l.lang} (${l.level})`).join(' · '));
      lines.push('');
    }
    if (cv.references.length > 0) {
      lines.push('── REFERENCES ──');
      cv.references.forEach(ref => {
        lines.push(`${ref.name} | ${ref.title} | ${ref.company}`);
        lines.push(`📞 ${ref.phone}${ref.email ? ' | 📧 ' + ref.email : ''}`);
        lines.push('');
      });
    }
    try {
      await Share.share({ message: lines.join('\n'), title: `${cv.firstName} ${cv.lastName} - CV` });
    } catch {}
  };

  const sections = [
    { key: 'info' as SectionType, icon: 'person', label: t('Personal Info', 'Taarifa Binafsi'), done: !!(cv.firstName && cv.email) },
    { key: 'summary' as SectionType, icon: 'newspaper', label: t('Professional Summary', 'Muhtasari wa Kitaaluma'), done: cv.summary.length > 20 },
    { key: 'experience' as SectionType, icon: 'briefcase', label: t('Work Experience', 'Uzoefu wa Kazi'), done: cv.experience.length > 0, count: cv.experience.length },
    { key: 'education' as SectionType, icon: 'school', label: t('Education', 'Elimu'), done: cv.education.length > 0, count: cv.education.length },
    { key: 'skills' as SectionType, icon: 'construct', label: t('Skills', 'Ujuzi'), done: cv.skills.length > 0, count: cv.skills.length },
    { key: 'languages' as SectionType, icon: 'language', label: t('Languages', 'Lugha'), done: cv.languages.length > 0, count: cv.languages.length },
    { key: 'references' as SectionType, icon: 'people', label: t('References', 'Marejeo'), done: cv.references.length > 0, count: cv.references.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>{t('Your CV', 'CV Yako')}</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {cv.firstName ? `${cv.firstName} ${cv.lastName}`.trim() : t('Build your CV', 'Jenga CV yako')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.previewBtn, { backgroundColor: colors.success }]} onPress={exportCV} activeOpacity={0.85}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.previewBtnText}>{t('Export', 'Tuma')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.previewBtn, { backgroundColor: colors.primary }]} onPress={() => open('preview')} activeOpacity={0.85}>
              <Ionicons name="eye-outline" size={18} color="#fff" />
              <Text style={styles.previewBtnText}>{t('Preview', 'Tazama')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Completion bar */}
        <View style={[styles.completionCard, { backgroundColor: colors.card, marginHorizontal: 20 }]}>
          <View style={styles.completionRow}>
            <Text style={[styles.completionLabel, { color: colors.foreground2 }]}>{t('CV Strength', 'Nguvu ya CV')}</Text>
            <Text style={[styles.completionPct, { color: colors.primary }]}>{completion}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.sand }]}>
            <View style={[styles.progressFill, { width: `${completion}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.completionSub, { color: colors.muted }]}>
            {completion < 50 ? t('Keep going! Add more sections.', 'Endelea! Ongeza sehemu zaidi.')
              : completion < 80 ? t('Looking good! Almost there.', 'Vizuri! Karibu ukamilike.')
              : t('Excellent CV! Ready to apply.', 'CV bora! Uko tayari kuomba.')}
          </Text>
        </View>

        {/* AI action buttons */}
        <View style={styles.aiRow}>
          <TouchableOpacity
            style={[styles.aiBtn, { backgroundColor: colors.primary }]}
            onPress={() => open('summary')}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.aiBtnText}>{t('AI Summary', 'Muhtasari wa AI')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiBtn, { backgroundColor: colors.success }]}
            onPress={() => { setShowScore(false); setAiScore(null); open('score'); scoreCV(); }}
            activeOpacity={0.85}
          >
            <Ionicons name="stats-chart" size={16} color="#fff" />
            <Text style={styles.aiBtnText}>{t('Score CV', 'Pima CV')}</Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <Text style={[styles.sectionTitle, { color: colors.muted, marginHorizontal: 20 }]}>{t('CV SECTIONS', 'SEHEMU ZA CV')}</Text>
        {sections.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sectionCard, { backgroundColor: colors.card, marginHorizontal: 20 }]}
            onPress={() => open(s.key)}
            activeOpacity={0.82}
          >
            <View style={[styles.sectionIcon, { backgroundColor: s.done ? 'rgba(45,106,79,0.10)' : 'rgba(231,99,59,0.08)' }]}>
              <Ionicons name={s.icon as any} size={20} color={s.done ? colors.success : colors.primary} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionLabel, { color: colors.foreground }]}>{s.label}</Text>
              {(s as any).count !== undefined && (
                <Text style={[styles.sectionCount, { color: colors.muted }]}>
                  {(s as any).count} {t('added', 'imeongezwa')}
                </Text>
              )}
            </View>
            <Ionicons name={s.done ? 'checkmark-circle' : 'chevron-forward'} size={20} color={s.done ? colors.success : colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── MODALS ── */}

      {/* Personal Info */}
      <InfoModal visible={activeSection === 'info'} onClose={close} lang={lang} />

      {/* Summary */}
      <SummaryModal
        visible={activeSection === 'summary'}
        onClose={close}
        lang={lang}
        aiLoading={aiLoading}
        aiResult={aiResult}
        onGenerate={generateSummary}
        onUse={() => { if (aiResult) { updateCV({ summary: aiResult }); setAiResult(''); close(); } }}
      />

      {/* Experience */}
      <ExperienceModal visible={activeSection === 'experience'} onClose={close} lang={lang} />

      {/* Education */}
      <EducationModal visible={activeSection === 'education'} onClose={close} lang={lang} />

      {/* Skills */}
      <SkillsModal visible={activeSection === 'skills'} onClose={close} lang={lang} />

      {/* Languages */}
      <LanguagesModal visible={activeSection === 'languages'} onClose={close} lang={lang} />

      {/* References */}
      <ReferencesModal visible={activeSection === 'references'} onClose={close} lang={lang} />

      {/* CV Score */}
      <ScoreModal visible={activeSection === 'score'} onClose={close} lang={lang} score={aiScore} />

      {/* CV Preview */}
      <PreviewModal visible={activeSection === 'preview'} onClose={close} lang={lang} />
    </View>
  );
}

// ─── Personal Info Modal ───
function InfoModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, updateCV } = useApp();
  const colors = useColors();
  const cv = state.cv;
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const [form, setForm] = useState({
    firstName: cv.firstName, lastName: cv.lastName, title: cv.title,
    phone: cv.phone, email: cv.email, location: cv.location, linkedin: cv.linkedin,
    institution: cv.institution ?? '', gradYear: cv.gradYear ?? '',
  });

  const save = () => { updateCV(form); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
          <ModalHeader title={t('Personal Info', 'Taarifa Binafsi')} onClose={onClose} onSave={save} lang={lang} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            {[
              { key: 'firstName', label: t('First Name', 'Jina la Kwanza'), placeholder: 'Amina' },
              { key: 'lastName', label: t('Last Name', 'Jina la Ukoo'), placeholder: 'Mapunda' },
              { key: 'title', label: t('Job Title', 'Cheo'), placeholder: t('e.g. Software Engineer', 'k.m. Mhandisi wa Programu') },
              { key: 'phone', label: t('Phone', 'Simu'), placeholder: '+255 7XX XXX XXX', keyType: 'phone-pad' },
              { key: 'email', label: 'Email', placeholder: 'amina@gmail.com', keyType: 'email-address', autoCapitalize: 'none' },
              { key: 'location', label: t('Location', 'Mahali'), placeholder: 'Dar es Salaam, Tanzania' },
              { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/amina', keyType: 'url', autoCapitalize: 'none' },
              { key: 'institution', label: t('Institution / University', 'Chuo / Chuo Kikuu'), placeholder: t('e.g. University of Dar es Salaam', 'k.m. Chuo Kikuu cha Dar es Salaam') },
              { key: 'gradYear', label: t('Graduation Year', 'Mwaka wa Kuhitimu'), placeholder: 'e.g. 2024', keyType: 'numeric' },
            ].map(f => (
              <View key={f.key}>
                <Text style={[modalStyles.label, { color: colors.muted }]}>{f.label}</Text>
                <TextInput
                  style={[modalStyles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.muted}
                  keyboardType={(f as any).keyType ?? 'default'}
                  autoCapitalize={(f as any).autoCapitalize ?? 'words'}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Summary Modal ───
function SummaryModal({ visible, onClose, lang, aiLoading, aiResult, onGenerate, onUse }: any) {
  const { state, updateCV } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [text, setText] = useState(state.cv.summary);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
          <ModalHeader title={t('Professional Summary', 'Muhtasari')} onClose={onClose} onSave={() => { updateCV({ summary: text }); onClose(); }} lang={lang} />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[modalStyles.textarea, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={6}
              placeholder={t('Write your professional summary here...', 'Andika muhtasari wako wa kitaaluma hapa...')}
              placeholderTextColor={colors.muted}
            />
            <TouchableOpacity style={[modalStyles.aiActionBtn, { backgroundColor: colors.primary }]} onPress={onGenerate} activeOpacity={0.85}>
              {aiLoading ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
              <Text style={modalStyles.aiActionText}>{aiLoading ? t('Generating...', 'Inaandika...') : t('Generate with AI', 'Andika kwa AI')}</Text>
            </TouchableOpacity>
            {aiResult ? (
              <View style={[modalStyles.aiResultBox, { backgroundColor: colors.sand, borderColor: colors.primary }]}>
                <Text style={[modalStyles.aiResultText, { color: colors.foreground }]}>{aiResult}</Text>
                <TouchableOpacity style={[modalStyles.useBtn, { backgroundColor: colors.primary }]} onPress={() => { setText(aiResult); onUse(); }}>
                  <Text style={modalStyles.useBtnText}>{t('Use This', 'Tumia Hii')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Experience Modal ───
function ExperienceModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, addExperience, removeExperience } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [adding, setAdding] = useState(false);
  const blank: Omit<WorkExperience, 'id'> = { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.title || !form.company) return;
    addExperience(form);
    setForm(blank);
    setAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Work Experience', 'Uzoefu wa Kazi')} onClose={onClose} lang={lang}
          rightAction={adding ? undefined : { label: t('Add', 'Ongeza'), onPress: () => setAdding(true) }} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {state.cv.experience.map(exp => (
            <View key={exp.id} style={[modalStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.itemTitle, { color: colors.foreground }]}>{exp.title}</Text>
                <Text style={[modalStyles.itemSub, { color: colors.muted }]}>{exp.company} · {exp.location}</Text>
                <Text style={[modalStyles.itemDate, { color: colors.muted }]}>{exp.startDate} – {exp.current ? t('Present', 'Sasa') : exp.endDate}</Text>
              </View>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeExperience(exp.id); }}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {state.cv.experience.length === 0 && !adding && (
            <View style={modalStyles.emptyState}>
              <Ionicons name="briefcase-outline" size={40} color={colors.muted} />
              <Text style={[modalStyles.emptyText, { color: colors.muted }]}>{t('No experience added yet', 'Hakuna uzoefu uliongezwa')}</Text>
            </View>
          )}
          {adding && (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={[modalStyles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[modalStyles.addFormTitle, { color: colors.foreground }]}>{t('New Experience', 'Uzoefu Mpya')}</Text>
                {[
                  { key: 'title', label: t('Job Title', 'Cheo'), placeholder: 'Software Engineer' },
                  { key: 'company', label: t('Company', 'Kampuni'), placeholder: 'CRDB Bank' },
                  { key: 'location', label: t('Location', 'Mahali'), placeholder: 'Dar es Salaam' },
                  { key: 'startDate', label: t('Start Date', 'Tarehe ya Kuanza'), placeholder: 'Jan 2022' },
                  { key: 'endDate', label: t('End Date', 'Tarehe ya Mwisho'), placeholder: t('Mar 2024 or leave empty if current', 'Mar 2024') },
                ].map(f => (
                  <View key={f.key}>
                    <Text style={[modalStyles.label, { color: colors.muted }]}>{f.label}</Text>
                    <TextInput
                      style={[modalStyles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                      value={(form as any)[f.key]}
                      onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                      placeholder={f.placeholder}
                      placeholderTextColor={colors.muted}
                    />
                  </View>
                ))}
                <View style={modalStyles.switchRow}>
                  <Text style={[modalStyles.label, { color: colors.muted }]}>{t('Currently working here', 'Ninafanya kazi hapa sasa')}</Text>
                  <Switch value={form.current} onValueChange={v => setForm(prev => ({ ...prev, current: v }))} thumbColor={colors.primary} trackColor={{ true: colors.primary }} />
                </View>
                <Text style={[modalStyles.label, { color: colors.muted }]}>{t('Description', 'Maelezo')}</Text>
                <TextInput
                  style={[modalStyles.textarea, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                  value={form.description}
                  onChangeText={v => setForm(prev => ({ ...prev, description: v }))}
                  multiline numberOfLines={3}
                  placeholder={t('Describe your responsibilities...', 'Elezea majukumu yako...')}
                  placeholderTextColor={colors.muted}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[modalStyles.cancelBtn, { borderColor: colors.border }]} onPress={() => setAdding(false)}>
                    <Text style={[modalStyles.cancelBtnText, { color: colors.muted }]}>{t('Cancel', 'Ghairi')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
                    <Text style={modalStyles.saveBtnText}>{t('Save', 'Hifadhi')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Education Modal ───
function EducationModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, addEducation, removeEducation } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [adding, setAdding] = useState(false);
  const blank: Omit<Education, 'id'> = { degree: '', institution: '', location: '', year: '', grade: '' };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.degree || !form.institution) return;
    addEducation(form);
    setForm(blank);
    setAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Education', 'Elimu')} onClose={onClose} lang={lang}
          rightAction={adding ? undefined : { label: t('Add', 'Ongeza'), onPress: () => setAdding(true) }} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          {state.cv.education.map(edu => (
            <View key={edu.id} style={[modalStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.itemTitle, { color: colors.foreground }]}>{edu.degree}</Text>
                <Text style={[modalStyles.itemSub, { color: colors.muted }]}>{edu.institution}</Text>
                <Text style={[modalStyles.itemDate, { color: colors.muted }]}>{edu.year}{edu.grade ? ` · ${edu.grade}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => removeEducation(edu.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {state.cv.education.length === 0 && !adding && (
            <View style={modalStyles.emptyState}>
              <Ionicons name="school-outline" size={40} color={colors.muted} />
              <Text style={[modalStyles.emptyText, { color: colors.muted }]}>{t('No education added yet', 'Hakuna elimu iliyoongezwa')}</Text>
            </View>
          )}
          {adding && (
            <View style={[modalStyles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { key: 'degree', label: t('Degree / Qualification', 'Digrii / Sifa'), placeholder: 'BSc Computer Science' },
                { key: 'institution', label: t('Institution', 'Chuo'), placeholder: 'University of Dar es Salaam' },
                { key: 'location', label: t('Location', 'Mahali'), placeholder: 'Dar es Salaam' },
                { key: 'year', label: t('Year', 'Mwaka'), placeholder: '2020' },
                { key: 'grade', label: t('Grade / GPA (optional)', 'Daraja (hiari)'), placeholder: 'Second Class Upper / 3.5 GPA' },
              ].map(f => (
                <View key={f.key}>
                  <Text style={[modalStyles.label, { color: colors.muted }]}>{f.label}</Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.muted}
                  />
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[modalStyles.cancelBtn, { borderColor: colors.border }]} onPress={() => setAdding(false)}>
                  <Text style={[modalStyles.cancelBtnText, { color: colors.muted }]}>{t('Cancel', 'Ghairi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={modalStyles.saveBtnText}>{t('Save', 'Hifadhi')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Skills Modal ───
const SKILL_SUGGESTIONS = ['Microsoft Office', 'Data Analysis', 'Project Management', 'Python', 'Excel', 'Communication', 'Leadership', 'QuickBooks', 'SPSS', 'GIS', 'Swahili', 'English', 'French', 'Customer Service', 'Research'];

function SkillsModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, addSkill, removeSkill } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [skillName, setSkillName] = useState('');
  const [level, setLevel] = useState<Skill['level']>('intermediate');
  const [category, setCategory] = useState<Skill['category']>('professional');

  const save = () => {
    if (!skillName.trim()) return;
    addSkill({ name: skillName.trim(), level, category });
    setSkillName('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Skills', 'Ujuzi')} onClose={onClose} lang={lang} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <View style={[modalStyles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[modalStyles.label, { color: colors.muted }]}>{t('Skill Name', 'Jina la Ujuzi')}</Text>
            <TextInput
              style={[modalStyles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
              value={skillName}
              onChangeText={setSkillName}
              placeholder={t('e.g. Project Management', 'k.m. Usimamizi wa Miradi')}
              placeholderTextColor={colors.muted}
            />
            <Text style={[modalStyles.label, { color: colors.muted }]}>{t('Level', 'Kiwango')}</Text>
            <View style={modalStyles.chipRow}>
              {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map(l => (
                <TouchableOpacity key={l} style={[modalStyles.chip, level === l && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setLevel(l)}>
                  <Text style={[modalStyles.chipText, level === l && { color: '#fff' }]}>{t(l, l)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
              <Text style={modalStyles.saveBtnText}>{t('Add Skill', 'Ongeza Ujuzi')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[modalStyles.label, { color: colors.muted, marginTop: 16 }]}>{t('Suggestions', 'Mapendekezo')}</Text>
          <View style={modalStyles.chipRow}>
            {SKILL_SUGGESTIONS.filter(s => !state.cv.skills.find(sk => sk.name === s)).slice(0, 10).map(s => (
              <TouchableOpacity key={s} style={[modalStyles.chip, { borderColor: colors.border }]}
                onPress={() => { addSkill({ name: s, level: 'intermediate', category: 'professional' }); Haptics.selectionAsync(); }}>
                <Ionicons name="add" size={12} color={colors.primary} />
                <Text style={[modalStyles.chipText, { color: colors.foreground, marginLeft: 2 }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[modalStyles.label, { color: colors.muted, marginTop: 20 }]}>{t('Your Skills', 'Ujuzi Wako')}</Text>
          <View style={modalStyles.chipRow}>
            {state.cv.skills.map(sk => (
              <TouchableOpacity key={sk.id} style={[modalStyles.chip, { backgroundColor: colors.sand, borderColor: colors.sand2 }]}
                onPress={() => { removeSkill(sk.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <Text style={[modalStyles.chipText, { color: colors.foreground }]}>{sk.name}</Text>
                <Ionicons name="close" size={12} color={colors.muted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Languages Modal ───
const LANGUAGES = ['Kiswahili', 'English', 'French', 'Arabic', 'Chinese', 'Portuguese', 'German', 'Italian', 'Sheng'];

function LanguagesModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, updateCV } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [langs, setLangs] = useState(state.cv.languages);

  const addLang = (name: string) => {
    if (langs.find(l => l.lang === name)) return;
    setLangs(prev => [...prev, { lang: name, level: 'Conversational' }]);
    Haptics.selectionAsync();
  };
  const removeLang = (name: string) => setLangs(prev => prev.filter(l => l.lang !== name));
  const setLevel = (name: string, level: string) => setLangs(prev => prev.map(l => l.lang === name ? { ...l, level } : l));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('Languages', 'Lugha')} onClose={onClose} onSave={() => { updateCV({ languages: langs }); onClose(); }} lang={lang} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {langs.map(l => (
            <View key={l.lang} style={[modalStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[modalStyles.itemTitle, { color: colors.foreground, flex: 1 }]}>{l.lang}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Native', 'Fluent', 'Advanced', 'Conversational', 'Basic'].map(lv => (
                  <TouchableOpacity key={lv} style={[modalStyles.levelChip, l.level === lv && { backgroundColor: colors.primary }]}
                    onPress={() => setLevel(l.lang, lv)}>
                    <Text style={[modalStyles.levelChipText, l.level === lv && { color: '#fff' }]}>{lv}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => removeLang(l.lang)} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          <Text style={[modalStyles.label, { color: colors.muted, marginTop: 16 }]}>{t('Add Language', 'Ongeza Lugha')}</Text>
          <View style={modalStyles.chipRow}>
            {LANGUAGES.filter(l => !langs.find(ll => ll.lang === l)).map(l => (
              <TouchableOpacity key={l} style={[modalStyles.chip, { borderColor: colors.border }]} onPress={() => addLang(l)}>
                <Ionicons name="add" size={12} color={colors.primary} />
                <Text style={[modalStyles.chipText, { color: colors.foreground, marginLeft: 2 }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── References Modal ───
function ReferencesModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, addReference, removeReference } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [adding, setAdding] = useState(false);
  const blank: Omit<Reference, 'id'> = { name: '', title: '', company: '', phone: '', email: '', relationship: '' };
  const [form, setForm] = useState(blank);

  const save = () => {
    if (!form.name || !form.phone) return;
    addReference(form);
    setForm(blank);
    setAdding(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('References', 'Marejeo')} onClose={onClose} lang={lang}
          rightAction={adding ? undefined : { label: t('Add', 'Ongeza'), onPress: () => setAdding(true) }} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {state.cv.references.map(ref => (
            <View key={ref.id} style={[modalStyles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[modalStyles.itemTitle, { color: colors.foreground }]}>{ref.name}</Text>
                <Text style={[modalStyles.itemSub, { color: colors.muted }]}>{ref.title} · {ref.company}</Text>
                <Text style={[modalStyles.itemDate, { color: colors.muted }]}>{ref.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => removeReference(ref.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {state.cv.references.length === 0 && !adding && (
            <View style={modalStyles.emptyState}>
              <Ionicons name="people-outline" size={40} color={colors.muted} />
              <Text style={[modalStyles.emptyText, { color: colors.muted }]}>{t('No references added', 'Hakuna marejeo')}</Text>
            </View>
          )}
          {adding && (
            <View style={[modalStyles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { key: 'name', label: t('Full Name', 'Jina Kamili'), placeholder: 'Dr. John Mwamba' },
                { key: 'title', label: t('Job Title', 'Cheo'), placeholder: 'Director' },
                { key: 'company', label: t('Organisation', 'Shirika'), placeholder: 'Ministry of Health' },
                { key: 'phone', label: t('Phone', 'Simu'), placeholder: '+255 7XX XXX XXX', keyType: 'phone-pad' },
                { key: 'email', label: 'Email (optional)', placeholder: 'john@org.go.tz', keyType: 'email-address', autoCapitalize: 'none' },
                { key: 'relationship', label: t('Relationship', 'Uhusiano'), placeholder: t('Former Manager', 'Meneja wa Zamani') },
              ].map(f => (
                <View key={f.key}>
                  <Text style={[modalStyles.label, { color: colors.muted }]}>{f.label}</Text>
                  <TextInput
                    style={[modalStyles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
                    value={(form as any)[f.key]}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={colors.muted}
                    keyboardType={(f as any).keyType ?? 'default'}
                    autoCapitalize={(f as any).autoCapitalize ?? 'words'}
                  />
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={[modalStyles.cancelBtn, { borderColor: colors.border }]} onPress={() => setAdding(false)}>
                  <Text style={[modalStyles.cancelBtnText, { color: colors.muted }]}>{t('Cancel', 'Ghairi')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[modalStyles.saveBtn, { backgroundColor: colors.primary }]} onPress={save}>
                  <Text style={modalStyles.saveBtnText}>{t('Save', 'Hifadhi')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Score Modal ───
function ScoreModal({ visible, onClose, lang, score }: { visible: boolean; onClose: () => void; lang: string; score: any }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <ModalHeader title={t('CV Score', 'Alama ya CV')} onClose={onClose} lang={lang} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
          {!score ? (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[modalStyles.label, { color: colors.muted, marginTop: 16 }]}>{t('Analysing your CV...', 'Inachambua CV yako...')}</Text>
            </View>
          ) : (
            <>
              <View style={[styles.scoreBig, { borderColor: score.score >= 70 ? colors.success : score.score >= 50 ? colors.primary : colors.error }]}>
                <Text style={[styles.scoreBigNum, { color: score.score >= 70 ? colors.success : score.score >= 50 ? colors.primary : colors.error }]}>
                  {score.score}
                </Text>
                <Text style={[styles.scoreBigLabel, { color: colors.muted }]}>/100</Text>
              </View>
              <Text style={[styles.scoreMsg, { color: colors.foreground }]}>
                {score.score >= 80 ? t('Excellent! Top-tier CV.', 'Bora! CV ya hali ya juu.') :
                  score.score >= 60 ? t('Good CV. Room to improve.', 'CV nzuri. Bado inaweza kuboresha.') :
                  t('Needs work. Follow tips below.', 'Inahitaji kazi. Fuata vidokezo.')}
              </Text>
              {score.feedback?.length > 0 && (
                <View style={[modalStyles.addForm, { backgroundColor: colors.sand, borderColor: colors.sand2, width: '100%' }]}>
                  <Text style={[modalStyles.addFormTitle, { color: colors.foreground }]}>{t('Strengths', 'Nguvu')}</Text>
                  {score.feedback.map((f: string, i: number) => (
                    <View key={i} style={modalStyles.feedbackRow}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[modalStyles.feedbackText, { color: colors.foreground }]}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
              {score.improvements?.length > 0 && (
                <View style={[modalStyles.addForm, { backgroundColor: 'rgba(231,99,59,0.06)', borderColor: colors.primary, width: '100%' }]}>
                  <Text style={[modalStyles.addFormTitle, { color: colors.foreground }]}>{t('Improvements', 'Maboresho')}</Text>
                  {score.improvements.map((f: string, i: number) => (
                    <View key={i} style={modalStyles.feedbackRow}>
                      <Ionicons name="arrow-up-circle" size={16} color={colors.primary} />
                      <Text style={[modalStyles.feedbackText, { color: colors.foreground }]}>{f}</Text>
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

// ─── Preview Modal ───
function PreviewModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state } = useApp();
  const colors = useColors();
  const cv = state.cv;
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#f0ede8' }}>
        <View style={[previewStyles.topBar]}>
          <TouchableOpacity onPress={onClose} style={previewStyles.closeBtn}>
            <Ionicons name="chevron-down" size={24} color="#1A1410" />
          </TouchableOpacity>
          <Text style={previewStyles.topTitle}>{t('CV Preview', 'Muonekano wa CV')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={previewStyles.page}>
          <View style={previewStyles.cvHeader}>
            <Text style={previewStyles.cvName}>{cv.firstName} {cv.lastName}</Text>
            {cv.title ? <Text style={previewStyles.cvTitle}>{cv.title}</Text> : null}
            <View style={previewStyles.cvContactRow}>
              {cv.phone ? <Text style={previewStyles.cvContact}>{cv.phone}</Text> : null}
              {cv.email ? <Text style={previewStyles.cvContact}>{cv.email}</Text> : null}
              {cv.location ? <Text style={previewStyles.cvContact}>{cv.location}</Text> : null}
            </View>
          </View>
          {cv.summary ? (
            <CVSection title={t('PROFESSIONAL SUMMARY', 'MUHTASARI')}>
              <Text style={previewStyles.body}>{cv.summary}</Text>
            </CVSection>
          ) : null}
          {cv.experience.length > 0 && (
            <CVSection title={t('WORK EXPERIENCE', 'UZOEFU WA KAZI')}>
              {cv.experience.map(exp => (
                <View key={exp.id} style={{ marginBottom: 12 }}>
                  <Text style={previewStyles.itemTitle}>{exp.title}</Text>
                  <Text style={previewStyles.itemMeta}>{exp.company} | {exp.location} | {exp.startDate}–{exp.current ? t('Present', 'Sasa') : exp.endDate}</Text>
                  {exp.description ? <Text style={previewStyles.body}>{exp.description}</Text> : null}
                </View>
              ))}
            </CVSection>
          )}
          {cv.education.length > 0 && (
            <CVSection title={t('EDUCATION', 'ELIMU')}>
              {cv.education.map(edu => (
                <View key={edu.id} style={{ marginBottom: 10 }}>
                  <Text style={previewStyles.itemTitle}>{edu.degree}</Text>
                  <Text style={previewStyles.itemMeta}>{edu.institution} | {edu.year}{edu.grade ? ` | ${edu.grade}` : ''}</Text>
                </View>
              ))}
            </CVSection>
          )}
          {cv.skills.length > 0 && (
            <CVSection title={t('SKILLS', 'UJUZI')}>
              <Text style={previewStyles.body}>{cv.skills.map(s => s.name).join(' · ')}</Text>
            </CVSection>
          )}
          {cv.languages.length > 0 && (
            <CVSection title={t('LANGUAGES', 'LUGHA')}>
              {cv.languages.map(l => (
                <Text key={l.lang} style={previewStyles.body}>{l.lang} – {l.level}</Text>
              ))}
            </CVSection>
          )}
          {cv.references.length > 0 && (
            <CVSection title={t('REFERENCES', 'MAREJEO')}>
              {cv.references.map(ref => (
                <View key={ref.id} style={{ marginBottom: 8 }}>
                  <Text style={previewStyles.itemTitle}>{ref.name} – {ref.title}, {ref.company}</Text>
                  <Text style={previewStyles.itemMeta}>{ref.phone}{ref.email ? ` | ${ref.email}` : ''}</Text>
                </View>
              ))}
            </CVSection>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function CVSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={previewStyles.section}>
      <Text style={previewStyles.sectionTitle}>{title}</Text>
      <View style={previewStyles.divider} />
      {children}
    </View>
  );
}

// ─── Shared Modal Header ───
function ModalHeader({ title, onClose, onSave, lang, rightAction }: {
  title: string; onClose: () => void; onSave?: () => void; lang: string;
  rightAction?: { label: string; onPress: () => void };
}) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  return (
    <View style={[modalStyles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onClose} style={modalStyles.headerBtn}>
        <Ionicons name="chevron-down" size={24} color={colors.foreground} />
      </TouchableOpacity>
      <Text style={[modalStyles.headerTitle, { color: colors.foreground }]}>{title}</Text>
      {onSave ? (
        <TouchableOpacity onPress={onSave} style={modalStyles.headerBtn}>
          <Text style={[modalStyles.saveText, { color: colors.primary }]}>{t('Save', 'Hifadhi')}</Text>
        </TouchableOpacity>
      ) : rightAction ? (
        <TouchableOpacity onPress={rightAction.onPress} style={modalStyles.headerBtn}>
          <Text style={[modalStyles.saveText, { color: colors.primary }]}>{rightAction.label}</Text>
        </TouchableOpacity>
      ) : <View style={{ width: 60 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  name: { fontSize: 22, fontWeight: '800' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  previewBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  completionCard: { borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 0 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completionLabel: { fontSize: 13, fontWeight: '600' },
  completionPct: { fontSize: 18, fontWeight: '800' },
  progressTrack: { borderRadius: 6, height: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  completionSub: { fontSize: 12, marginTop: 8 },
  aiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  aiBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14 },
  aiBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  sectionCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  sectionInfo: { flex: 1 },
  sectionLabel: { fontSize: 15, fontWeight: '600' },
  sectionCount: { fontSize: 12, marginTop: 2 },
  scoreBig: { width: 130, height: 130, borderRadius: 65, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 20 },
  scoreBigNum: { fontSize: 44, fontWeight: '800' },
  scoreBigLabel: { fontSize: 14, fontWeight: '500' },
  scoreMsg: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerBtn: { width: 60, alignItems: 'flex-start' },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  saveText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  textarea: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  aiActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  aiActionText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  aiResultBox: { marginTop: 16, borderRadius: 14, borderWidth: 1.5, padding: 16 },
  aiResultText: { fontSize: 14, lineHeight: 22 },
  useBtn: { marginTop: 12, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  useBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  itemCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemSub: { fontSize: 13, marginTop: 2 },
  itemDate: { fontSize: 12, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },
  addForm: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  addFormTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.15)' },
  chipText: { fontSize: 12, fontWeight: '500' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600' },
  saveBtn: { flex: 2, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  levelChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#F0EDE8', marginRight: 6 },
  levelChipText: { fontSize: 12, fontWeight: '500', color: '#3D3025' },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  feedbackText: { fontSize: 13, lineHeight: 20, flex: 1 },
});

const previewStyles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, backgroundColor: '#f0ede8', borderBottomWidth: 1, borderBottomColor: '#E8DFD0' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#1A1410' },
  page: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 60, backgroundColor: '#fff', margin: 16, borderRadius: 4 },
  cvHeader: { alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#E7633B' },
  cvName: { fontSize: 24, fontWeight: '800', color: '#1A1410', textAlign: 'center' },
  cvTitle: { fontSize: 13, color: '#8A7D6E', marginTop: 4, textAlign: 'center' },
  cvContactRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  cvContact: { fontSize: 11, color: '#3D3025' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#E7633B' },
  divider: { height: 1, backgroundColor: '#E7633B', marginVertical: 4 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: '#1A1410' },
  itemMeta: { fontSize: 11, color: '#8A7D6E', marginTop: 1 },
  body: { fontSize: 12, color: '#3D3025', lineHeight: 18, marginTop: 4 },
});
