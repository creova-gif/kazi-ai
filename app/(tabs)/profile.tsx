import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Alert, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp, type Language } from '@/context/AppContext';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, setLanguage, clearAll } = useApp();
  const lang = state.language;
  const cv = state.cv;
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const [showLangPicker, setShowLangPicker] = useState(false);

  const stats = [
    { icon: 'briefcase', value: state.appliedJobs.length.toString(), label: t('Applied', 'Maombi') },
    { icon: 'bookmark', value: state.savedJobs.length.toString(), label: t('Saved', 'Zilizohifadhiwa') },
    { icon: 'school', value: cv.education.length.toString(), label: t('Education', 'Elimu') },
    { icon: 'construct', value: cv.skills.length.toString(), label: t('Skills', 'Ujuzi') },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out KaziAI – the AI-powered CV builder for Tanzania! 🇹🇿\nDownload: kaziaiapp.com`,
        title: 'KaziAI',
      });
    } catch {}
  };

  const handleClearData = () => {
    Alert.alert(
      t('Clear All Data', 'Futa Data Yote'),
      t('This will permanently delete your CV and all data. Are you sure?', 'Hii itafuta CV yako na data yote. Una uhakika?'),
      [
        { text: t('Cancel', 'Ghairi'), style: 'cancel' },
        { text: t('Delete', 'Futa'), style: 'destructive', onPress: () => { clearAll(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
      ]
    );
  };

  const cvComplete = !!(cv.firstName && cv.email && cv.summary && cv.experience.length > 0 && cv.education.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={[styles.profileHeader, { paddingTop: insets.top + 20, backgroundColor: colors.ink }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {cv.firstName ? cv.firstName[0].toUpperCase() : '?'}
              {cv.lastName ? cv.lastName[0].toUpperCase() : ''}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {cv.firstName ? `${cv.firstName} ${cv.lastName}`.trim() : t('Your Name', 'Jina lako')}
          </Text>
          {cv.title ? <Text style={styles.profileTitle}>{cv.title}</Text> : null}
          <View style={styles.profileMeta}>
            {cv.location ? (
              <View style={styles.metaChip}>
                <Ionicons name="location-outline" size={12} color="rgba(245,240,232,0.7)" />
                <Text style={styles.metaChipText}>{cv.location}</Text>
              </View>
            ) : null}
            {cv.email ? (
              <View style={styles.metaChip}>
                <Ionicons name="mail-outline" size={12} color="rgba(245,240,232,0.7)" />
                <Text style={styles.metaChipText}>{cv.email}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.cvBadge, { backgroundColor: cvComplete ? colors.success : colors.primary }]}>
            <Ionicons name={cvComplete ? 'checkmark-circle' : 'create'} size={14} color="#fff" />
            <Text style={styles.cvBadgeText}>{cvComplete ? t('CV Complete', 'CV Imekamilika') : t('CV In Progress', 'CV Inaendelea')}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <Ionicons name={s.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CV Summary */}
        {cv.summary ? (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t('ABOUT ME', 'KUHUSU MIMI')}</Text>
            <Text style={[styles.summaryText, { color: colors.foreground }]} numberOfLines={4}>{cv.summary}</Text>
          </View>
        ) : null}

        {/* Skills preview */}
        {cv.skills.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, marginHorizontal: 16 }]}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>{t('TOP SKILLS', 'UJUZI MKUU')}</Text>
            <View style={styles.skillRow}>
              {cv.skills.slice(0, 8).map(sk => (
                <View key={sk.id} style={[styles.skillChip, { backgroundColor: colors.sand }]}>
                  <Text style={[styles.skillChipText, { color: colors.foreground2 }]}>{sk.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings section */}
        <Text style={[styles.sectionLabel, { color: colors.muted, marginHorizontal: 20, marginTop: 24, marginBottom: 8 }]}>{t('SETTINGS', 'MIPANGILIO')}</Text>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.card, marginHorizontal: 16 }]} onPress={() => setShowLangPicker(true)}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(231,99,59,0.10)' }]}>
            <Ionicons name="language" size={20} color={colors.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t('Language', 'Lugha')}</Text>
            <Text style={[styles.settingSub, { color: colors.muted }]}>{lang === 'sw' ? 'Kiswahili' : 'English'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.card, marginHorizontal: 16 }]} onPress={handleShare}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(45,106,79,0.10)' }]}>
            <Ionicons name="share-social" size={20} color={colors.success} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>{t('Share KaziAI', 'Shiriki KaziAI')}</Text>
            <Text style={[styles.settingSub, { color: colors.muted }]}>{t('Tell your friends about KaziAI', 'Mwambie rafiki yako')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: colors.card, marginHorizontal: 16 }]} onPress={handleClearData}>
          <View style={[styles.settingIcon, { backgroundColor: 'rgba(192,57,43,0.10)' }]}>
            <Ionicons name="trash" size={20} color={colors.error} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.error }]}>{t('Clear All Data', 'Futa Data Yote')}</Text>
            <Text style={[styles.settingSub, { color: colors.muted }]}>{t('Reset app to factory settings', 'Rudisha programu mwanzo')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.muted }]}>KaziAI v1.0 · Made with care for Tanzania</Text>
      </ScrollView>

      {/* Language picker modal */}
      <Modal visible={showLangPicker} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.langModal, { backgroundColor: colors.background }]}>
          <Text style={[styles.langModalTitle, { color: colors.foreground }]}>{t('Choose Language', 'Chagua Lugha')}</Text>
          {([['en', 'English', '🇬🇧'], ['sw', 'Kiswahili', '🇹🇿']] as const).map(([code, name, flag]) => (
            <TouchableOpacity
              key={code}
              style={[styles.langOption, { backgroundColor: lang === code ? colors.sand : colors.card, borderColor: lang === code ? colors.primary : colors.border }]}
              onPress={() => { setLanguage(code as Language); Haptics.selectionAsync(); setShowLangPicker(false); }}
            >
              <Text style={styles.langFlag}>{flag}</Text>
              <Text style={[styles.langOptionText, { color: colors.foreground }]}>{name}</Text>
              {lang === code ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.langCancelBtn, { borderColor: colors.border }]} onPress={() => setShowLangPicker(false)}>
            <Text style={[styles.langCancelText, { color: colors.muted }]}>{t('Cancel', 'Ghairi')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 30 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E7633B', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  profileName: { fontSize: 24, fontWeight: '800', color: '#F5F0E8', textAlign: 'center' },
  profileTitle: { fontSize: 14, color: '#8A7D6E', marginTop: 4, textAlign: 'center' },
  profileMeta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,240,232,0.08)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  metaChipText: { fontSize: 12, color: 'rgba(245,240,232,0.7)' },
  cvBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginTop: 14 },
  cvBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginTop: 20, marginBottom: 16 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 14,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  statValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  summaryText: { fontSize: 14, lineHeight: 22 },
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  skillChipText: { fontSize: 12, fontWeight: '500' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSub: { fontSize: 12, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24, marginBottom: 8 },
  langModal: { flex: 1, padding: 24 },
  langModalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 24 },
  langOption: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  langFlag: { fontSize: 28 },
  langOptionText: { fontSize: 17, fontWeight: '600', flex: 1 },
  langCancelBtn: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  langCancelText: { fontSize: 15, fontWeight: '600' },
});
