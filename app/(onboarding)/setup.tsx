import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp, type JobSector, type EACountry } from '@/context/AppContext';

const COUNTRIES: { id: EACountry; label: string; flag: string }[] = [
  { id: 'Tanzania', label: 'Tanzania', flag: '🇹🇿' },
  { id: 'Kenya', label: 'Kenya', flag: '🇰🇪' },
  { id: 'Uganda', label: 'Uganda', flag: '🇺🇬' },
  { id: 'Rwanda', label: 'Rwanda', flag: '🇷🇼' },
  { id: 'Ethiopia', label: 'Ethiopia', flag: '🇪🇹' },
  { id: 'Other', label: 'Other', flag: '🌍' },
];

const SECTORS: { id: JobSector; label: string; labelSw: string }[] = [
  { id: 'government', label: 'Government', labelSw: 'Serikali' },
  { id: 'ngo', label: 'NGO / Development', labelSw: 'NGO / Maendeleo' },
  { id: 'private', label: 'Private Sector', labelSw: 'Sekta Binafsi' },
  { id: 'tech', label: 'Technology', labelSw: 'Teknolojia' },
  { id: 'health', label: 'Health', labelSw: 'Afya' },
  { id: 'education', label: 'Education', labelSw: 'Elimu' },
  { id: 'finance', label: 'Finance / Banking', labelSw: 'Fedha / Benki' },
  { id: 'informal', label: 'Informal / Business', labelSw: 'Biashara / Zisizo Rasmi' },
];

const EXP_LEVELS = [
  { id: 'none', label: 'Student / Fresh', labelSw: 'Mwanafunzi / Mpya' },
  { id: 'entry', label: 'Entry Level (0–2 yrs)', labelSw: 'Mwanzo (0–2 miaka)' },
  { id: 'mid', label: 'Mid Level (3–7 yrs)', labelSw: 'Kati (3–7 miaka)' },
  { id: 'senior', label: 'Senior (8+ yrs)', labelSw: 'Mkuwa (8+ miaka)' },
];

export default function SetupScreen() {
  const { state, updateCV, completeOnboarding } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const lang = state.language;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState<EACountry>('Tanzania');
  const [selectedSectors, setSelectedSectors] = useState<JobSector[]>([]);
  const [expLevel, setExpLevel] = useState<'none' | 'entry' | 'mid' | 'senior'>('entry');

  const toggleSector = (id: JobSector) => {
    Haptics.selectionAsync();
    setSelectedSectors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleDone = () => {
    if (!firstName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateCV({
      firstName: firstName.trim(), lastName: lastName.trim(),
      phone, email, location, country,
      targetSector: selectedSectors, experienceLevel: expLevel,
    });
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F0E8' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>{t('Tell us about yourself', 'Tuambie kuhusu wewe')}</Text>
        <Text style={styles.sub}>{t('Personalise your CV and job matches across East Africa', 'Binafsisha CV na mechi za kazi Afrika Mashariki')}</Text>

        <Text style={styles.label}>{t('First Name *', 'Jina la Kwanza *')}</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="e.g. Amina" placeholderTextColor="#8A7D6E" />

        <Text style={styles.label}>{t('Last Name', 'Jina la Ukoo')}</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="e.g. Mapunda" placeholderTextColor="#8A7D6E" />

        <Text style={styles.label}>{t('Phone', 'Simu')}</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+255 7XX XXX XXX" keyboardType="phone-pad" placeholderTextColor="#8A7D6E" />

        <Text style={styles.label}>{t('Email', 'Barua Pepe')}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="example@email.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#8A7D6E" />

        <Text style={styles.label}>{t('City / Location', 'Mji / Mahali')}</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder={t('e.g. Dar es Salaam, Nairobi…', 'k.m. Dar es Salaam, Nairobi…')} placeholderTextColor="#8A7D6E" />

        <Text style={styles.label}>{t('Country', 'Nchi')}</Text>
        <View style={styles.chipRow}>
          {COUNTRIES.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, country === c.id && styles.chipActive]}
              onPress={() => { Haptics.selectionAsync(); setCountry(c.id); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, country === c.id && styles.chipTextActive]}>
                {c.flag} {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('Experience Level', 'Kiwango cha Uzoefu')}</Text>
        <View style={styles.chipRow}>
          {EXP_LEVELS.map(lvl => (
            <TouchableOpacity
              key={lvl.id}
              style={[styles.chip, expLevel === lvl.id && styles.chipActive]}
              onPress={() => { Haptics.selectionAsync(); setExpLevel(lvl.id as any); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, expLevel === lvl.id && styles.chipTextActive]}>
                {t(lvl.label, lvl.labelSw)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t('Target Sectors (select all that apply)', 'Sekta Unazolenga')}</Text>
        <View style={styles.chipRow}>
          {SECTORS.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, selectedSectors.includes(s.id) && styles.chipActive]}
              onPress={() => toggleSector(s.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedSectors.includes(s.id) && styles.chipTextActive]}>
                {t(s.label, s.labelSw)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, !firstName.trim() && styles.doneBtnDisabled]}
          onPress={handleDone}
          disabled={!firstName.trim()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>{t('Get Started', 'Anza Sasa')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  heading: { fontSize: 26, fontWeight: '800', color: '#1A1410', marginBottom: 8 },
  sub: { fontSize: 14, color: '#8A7D6E', marginBottom: 28, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#3D3025', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 15,
    color: '#1A1410', borderWidth: 1, borderColor: 'rgba(26,20,16,0.10)',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.12)',
  },
  chipActive: { backgroundColor: '#E7633B', borderColor: '#E7633B' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#3D3025' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  doneBtn: {
    backgroundColor: '#E7633B', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 32,
  },
  doneBtnDisabled: { opacity: 0.45 },
  doneBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
