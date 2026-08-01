import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', coral: '#E7633B', border2: 'rgba(26,20,16,0.18)' };

interface Props {
  onNext: () => void;
}

export function LanguagePick({ onNext }: Props) {
  const { state, setLanguage } = useApp();

  const handleSelect = (lang: 'sw' | 'en') => {
    setLanguage(lang);
    setTimeout(() => onNext(), 300);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.cream, padding: '0 32px' }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 64, height: 64, borderRadius: 16, background: C.coral, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Globe size={28} color="white" strokeWidth={2.5} />
      </motion.div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 8, textAlign: 'center' }}>
        Choose Language / Chagua Lugha
      </h2>
      <p style={{ fontSize: 13, color: C.ink2, marginBottom: 36, textAlign: 'center', maxWidth: 300 }}>
        Select your preferred language for the app
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect('sw')}
          style={{ padding: '18px 20px', background: state.language === 'sw' ? C.coral : 'white', border: `2px solid ${state.language === 'sw' ? C.coral : C.border2}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: "'Sora', sans-serif" }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: state.language === 'sw' ? 'white' : C.ink, marginBottom: 2 }}>
            🇹🇿 Kiswahili
          </div>
          <div style={{ fontSize: 12, color: state.language === 'sw' ? 'rgba(255,255,255,0.8)' : C.ink2 }}>
            Tumia programu kwa Kiswahili
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleSelect('en')}
          style={{ padding: '18px 20px', background: state.language === 'en' ? C.coral : 'white', border: `2px solid ${state.language === 'en' ? C.coral : C.border2}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: "'Sora', sans-serif" }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: state.language === 'en' ? 'white' : C.ink, marginBottom: 2 }}>
            🇬🇧 English
          </div>
          <div style={{ fontSize: 12, color: state.language === 'en' ? 'rgba(255,255,255,0.8)' : C.ink2 }}>
            Use the app in English
          </div>
        </motion.button>
      </div>
    </div>
  );
}
