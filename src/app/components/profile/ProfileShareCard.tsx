import { motion } from 'motion/react';
import { X, Share2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', coral: '#E7633B', coralL: '#F4A080', sand: '#E8DFD0', green: '#2D6A4F', muted: '#8A7D6E', border: 'rgba(26,20,16,0.10)' };

interface Props { onClose: () => void; }

export function ProfileShareCard({ onClose }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const topSkills = cv.skills.slice(0, 6).map(s => s.name);
  const exp = cv.experience.length;
  const latestRole = cv.experience[0];
  const latestEdu = cv.education[0];

  const handleShare = async () => {
    const text = lang === 'sw'
      ? `👤 ${cv.firstName} ${cv.lastName}\n💼 ${cv.title || 'Mtaalamu'}\n📍 ${cv.location || 'Tanzania'}\n\n⚡ Ujuzi: ${topSkills.join(', ')}\n\n🎓 ${latestEdu ? `${latestEdu.degree} — ${latestEdu.institution}` : ''}\n💼 ${latestRole ? `${latestRole.title} — ${latestRole.company}` : ''}\n\n✨ CV iliyojengwa na KaziAI\nHifadhi CV yako — bit.ly/kaziaiapp`
      : `👤 ${cv.firstName} ${cv.lastName}\n💼 ${cv.title || 'Professional'}\n📍 ${cv.location || 'Tanzania'}\n\n⚡ Skills: ${topSkills.join(', ')}\n\n🎓 ${latestEdu ? `${latestEdu.degree} — ${latestEdu.institution}` : ''}\n💼 ${latestRole ? `${latestRole.title} — ${latestRole.company}` : ''}\n\n✨ CV built with KaziAI\nBuild yours — bit.ly/kaziaiapp`;
    try {
      if (navigator.share) await navigator.share({ title: `${cv.firstName} ${cv.lastName} — KaziAI`, text });
      else { await navigator.clipboard.writeText(text); toast.success(lang === 'sw' ? '✓ Imenakiliwa!' : '✓ Copied!'); }
    } catch {}
  };

  const SECTOR_ICONS: Record<string, string> = { government: '🏛️', ngo: '🌍', tech: '💻', health: '🏥', education: '🎓', finance: '💰', private: '🏢', informal: '🏪' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.8)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{ width: '100%', maxWidth: 340 }} onClick={e => e.stopPropagation()}>

        {/* THE CARD */}
        <div style={{ background: C.ink, borderRadius: 24, overflow: 'hidden', position: 'relative' }}>
          {/* Geometric BG */}
          <svg style={{ position: 'absolute', right: -20, top: -20, opacity: 0.06, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
            <circle cx="180" cy="20" r="160" fill="none" stroke="#E7633B" strokeWidth="1.5"/>
            <circle cx="180" cy="20" r="100" fill="none" stroke="#E7633B" strokeWidth="1.5"/>
            <circle cx="180" cy="20" r="50" fill="none" stroke="#E7633B" strokeWidth="1.5"/>
          </svg>

          {/* Top band */}
          <div style={{ background: C.coral, padding: '18px 22px 16px', position: 'relative' }}>
            <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.12, pointerEvents: 'none' }} width="100" height="70" viewBox="0 0 100 70">
              <defs><pattern id="dp" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="white"/></pattern></defs>
              <rect width="100" height="70" fill="url(#dp)"/>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.65)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Space Grotesk', sans-serif" }}>KaziAI Profile</div>
              <div style={{ fontSize: 20 }}>🇹🇿</div>
            </div>
          </div>

          <div style={{ padding: '20px 22px' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                {(cv.firstName[0] || 'K')}{(cv.lastName[0] || 'A')}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.cream, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {cv.firstName || 'First'} {cv.lastName || 'Last'}
                </div>
                {cv.title && <div style={{ fontSize: 12, color: C.coralL, fontWeight: 700, marginTop: 4 }}>{cv.title}</div>}
                {cv.location && <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.45)', marginTop: 3 }}>📍 {cv.location}</div>}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {[
                { val: exp, label: lang === 'sw' ? 'Kazi' : 'Jobs' },
                { val: cv.education.length, label: lang === 'sw' ? 'Elimu' : 'Degrees' },
                { val: cv.skills.length, label: lang === 'sw' ? 'Ujuzi' : 'Skills' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(245,240,232,0.06)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.cream, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.4)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            {topSkills.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.35)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  {lang === 'sw' ? 'Ujuzi' : 'Skills'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {topSkills.map(s => (
                    <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(231,99,59,0.2)', color: C.coralL, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sectors */}
            {cv.targetSector.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'rgba(245,240,232,0.35)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  {lang === 'sw' ? 'Sekta' : 'Target Sectors'}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {cv.targetSector.map(s => (
                    <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(245,240,232,0.08)', color: 'rgba(245,240,232,0.65)', fontWeight: 600 }}>
                      {SECTOR_ICONS[s]} {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CV completion */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {lang === 'sw' ? 'CV Imekamilika' : 'CV Complete'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: cv.completionPct >= 80 ? '#7ED9A8' : C.coralL }}>{cv.completionPct}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(245,240,232,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${cv.completionPct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 99, background: cv.completionPct >= 80 ? '#7ED9A8' : C.coral }} />
              </div>
            </div>

            {/* Watermark */}
            <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(245,240,232,0.2)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              kaziaiapp · CREOVA Solutions
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(245,240,232,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <X size={18} color={C.cream} />
          </button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleShare}
            style={{ flex: 1, padding: '14px', background: C.coral, color: C.cream, fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 13, cursor: 'pointer', fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Share2 size={16} color="white" />
            {lang === 'sw' ? 'Shiriki Wasifu Wako' : 'Share Your Profile'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
