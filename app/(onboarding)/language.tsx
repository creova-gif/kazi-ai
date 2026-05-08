import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';

export default function LanguageScreen() {
  const { setLanguage } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pick = (lang: 'en' | 'sw') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(lang);
    router.push('/(onboarding)/setup');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.content}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>Kazi<Text style={styles.logoAccent}>AI</Text></Text>
        </View>
        <Text style={styles.heading}>Chagua Lugha{'\n'}Choose Language</Text>

        <TouchableOpacity style={styles.langBtn} onPress={() => pick('en')} activeOpacity={0.82}>
          <View style={styles.langIcon}><Text style={styles.flag}>🇬🇧</Text></View>
          <View style={styles.langText}>
            <Text style={styles.langName}>English</Text>
            <Text style={styles.langSub}>Continue in English</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.langBtn} onPress={() => pick('sw')} activeOpacity={0.82}>
          <View style={styles.langIcon}><Text style={styles.flag}>🇹🇿</Text></View>
          <View style={styles.langText}>
            <Text style={styles.langName}>Kiswahili</Text>
            <Text style={styles.langSub}>Endelea kwa Kiswahili</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Unaweza kubadili lugha baadaye · You can change language later
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8', paddingHorizontal: 24 },
  content: { flex: 1, justifyContent: 'center' },
  logoRow: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: '800', color: '#1A1410' },
  logoAccent: { color: '#E7633B' },
  heading: {
    fontSize: 28, fontWeight: '700', color: '#1A1410', textAlign: 'center',
    marginBottom: 40, lineHeight: 38,
  },
  langBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 18, padding: 20, marginBottom: 16,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  langIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#F5F0E8',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  flag: { fontSize: 28 },
  langText: { flex: 1 },
  langName: { fontSize: 18, fontWeight: '700', color: '#1A1410' },
  langSub: { fontSize: 13, color: '#8A7D6E', marginTop: 2 },
  arrow: { fontSize: 24, color: '#E7633B', fontWeight: '300' },
  footer: { fontSize: 12, color: '#8A7D6E', textAlign: 'center' },
});
