import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';

export default function SplashIndex() {
  const { state } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const navigate = () => {
      if (state.onboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/language');
      }
    };

    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: useNative }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: useNative, damping: 12 }),
      ]),
      Animated.delay(200),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.delay(800),
    ]).start(({ finished }) => {
      if (finished) navigate();
    });

    const fallback = setTimeout(navigate, 2200);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoBox, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.logoK}>K</Text>
          <Text style={styles.logoRest}>azi</Text>
          <View style={styles.aiPill}>
            <Text style={styles.aiText}>AI</Text>
          </View>
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Jenga Mustakabali Wako
        </Animated.Text>
        <Animated.Text style={[styles.taglineEn, { opacity: taglineOpacity }]}>
          Build Your Future
        </Animated.Text>
      </View>
      <Animated.Text style={[styles.footer, { opacity: taglineOpacity, paddingBottom: insets.bottom + 24 }]}>
        Powered by AI · Made for Tanzania
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1410', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoK: { fontSize: 56, fontWeight: '800', color: '#E7633B', letterSpacing: -1 },
  logoRest: { fontSize: 56, fontWeight: '800', color: '#F5F0E8', letterSpacing: -1 },
  aiPill: {
    backgroundColor: '#E7633B', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    marginLeft: 6, marginBottom: 4,
  },
  aiText: { color: '#F5F0E8', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  tagline: { fontSize: 20, color: '#E8DFD0', fontWeight: '600', textAlign: 'center' },
  taglineEn: { fontSize: 14, color: '#8A7D6E', fontWeight: '400', textAlign: 'center', marginTop: 4 },
  footer: { fontSize: 12, color: '#8A7D6E', textAlign: 'center' },
});
