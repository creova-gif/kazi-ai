import { motion } from 'motion/react';
import { Settings, Trash2, Share2, Globe, Plus, Award } from 'lucide-react';
import { ProfileShareCard } from './ProfileShareCard';
import { AnimatePresence } from 'motion/react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', red: '#C0392B', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

export function ProfileView() {
  const { state, setLanguage, clearAll } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const stats = [
    { icon: '📄', label: lang === 'sw' ? 'CV' : 'CV', val: `${cv.completionPct}%` },
    { icon: '💼', label: lang === 'sw' ? 'Kazi' : 'Jobs', val: cv.experience.length },
    { icon: '📚', label: lang === 'sw' ? 'Maombi' : 'Applied', val: state.appliedJobs.length },
    { icon: '🔖', label: lang === 'sw' ? 'Zilizohifadhiwa' : 'Saved', val: state.savedJobs.length },
  ];

  const handleShare = async () => {
    const text = lang === 'sw'
      ? `✨ Ninatumia KaziAI kujenga CV yangu ya kitaalamu!\n\nSaidia vijana wa Tanzania kupata kazi — jaribu KaziAI bure!\n\nIMEJENGWA NA CREOVA Solutions 🇹🇿`
      : `✨ I'm using KaziAI to build my professional CV!\n\nHelping Tanzanian youth get jobs — try KaziAI for free!\n\nBUILT BY CREOVA Solutions 🇹🇿`;
    try {
      if (navigator.share) await navigator.share({ title: 'KaziAI', text });
      else { await navigator.clipboard.writeText(text); toast.success('Copied!'); }
    } catch {}
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 28px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
          <circle cx="180" cy="20" r="90" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        {/* Avatar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, position: 'relative' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: 'white', flexShrink: 0 }}>
            {cv.firstName?.[0] || 'K'}{cv.lastName?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>
              {cv.firstName && cv.lastName ? `${cv.firstName} ${cv.lastName}` : (lang === 'sw' ? 'Wasifu Wako' : 'Your Profile')}
            </div>
            {cv.title && <div style={{ fontSize: 12, color: C.coral, fontWeight: 600, marginTop: 3 }}>{cv.title}</div>}
            {cv.location && <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>📍 {cv.location}</div>}
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, position: 'relative' }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(245,240,232,0.07)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', marginBottom: 3 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8', fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
              <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.35)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>

        {/* CV Completion */}
        {cv.completionPct < 100 && (
          <div style={{ background: 'rgba(231,99,59,0.07)', borderRadius: 16, border: `1px solid rgba(231,99,59,0.2)`, padding: '16px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem' }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                {lang === 'sw' ? 'CV yako ni' : 'Your CV is'} {cv.completionPct}% {lang === 'sw' ? 'iliyokamilika' : 'complete'}
              </div>
              <div style={{ height: 5, background: C.sand, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${cv.completionPct}%` }} transition={{ duration: 1 }}
                  style={{ height: '100%', borderRadius: 99, background: C.coral }} />
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {lang === 'sw' ? 'Ongeza maelezo zaidi ili kupata nafasi bora' : 'Add more details to get better job matches'}
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Mipangilio' : 'Settings'}</div>
        <div style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 14 }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: `1px solid rgba(26,20,16,0.06)` }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={16} color={C.muted} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{lang === 'sw' ? 'Lugha' : 'Language'}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{lang === 'sw' ? 'Kiswahili 🇹🇿' : 'English 🇬🇧'}</div>
            </div>
            <button onClick={() => setLanguage(lang === 'sw' ? 'en' : 'sw')}
              style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${C.border2}`, background: 'transparent', fontSize: 12, fontWeight: 700, color: C.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'Switch to EN' : 'Badili SW'}
            </button>
          </div>
          {/* Share */}
          <div onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: `1px solid rgba(26,20,16,0.06)`, cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Share2 size={16} color={C.muted} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{lang === 'sw' ? 'Shiriki KaziAI' : 'Share KaziAI'}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{lang === 'sw' ? 'Saidia marafiki wako kupata kazi' : 'Help your friends find jobs'}</div>
            </div>
            <div style={{ fontSize: 14, color: C.muted }}>→</div>
          </div>
          {/* Clear data */}
          <div onClick={() => { if (confirm(lang === 'sw' ? 'Una uhakika? Data yote itafutwa.' : 'Are you sure? All data will be deleted.')) { clearAll(); toast.success(lang === 'sw' ? 'Data imefutwa' : 'Data cleared'); } }}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#FEF2F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trash2 size={16} color={C.red} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.red }}>{lang === 'sw' ? 'Futa Data Yote' : 'Clear All Data'}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{lang === 'sw' ? 'Anza upya kutoka mwanzo' : 'Start fresh from scratch'}</div>
            </div>
          </div>
        </div>

        {/* Branding */}
        {/* Share Profile Card CTA */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowShareCard(true)}
          style={{ width: '100%', padding: '15px 18px', borderRadius: 18, background: C.ink, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Share2 size={20} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8' }}>{lang === 'sw' ? 'Shiriki Wasifu Wako' : 'Share Your Profile'}</div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 2 }}>{lang === 'sw' ? 'Kadi ya wasifu kwa WhatsApp / Instagram' : 'Profile card for WhatsApp / Instagram'}</div>
          </div>
          <div style={{ fontSize: 14, color: '#E7633B' }}>→</div>
        </motion.button>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.sand, borderRadius: 99, padding: '8px 16px' }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 44 44" fill="none"><rect x="6" y="16" width="32" height="22" rx="3" stroke="white" strokeWidth="2.5" fill="none"/><path d="M15 16V13a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>KaziAI</span>
            <span style={{ fontSize: 11, color: C.muted }}>by CREOVA Solutions</span>
            <span style={{ fontSize: 11 }}>🇹🇿</span>
          </div>
          <div style={{ fontSize: 10, color: C.sand2, marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>v1.0 · Dar es Salaam, Tanzania</div>
        </div>
      </div>
      <AnimatePresence>
        {showShareCard && <ProfileShareCard onClose={() => setShowShareCard(false)} />}
      </AnimatePresence>
    </div>
  );
}
