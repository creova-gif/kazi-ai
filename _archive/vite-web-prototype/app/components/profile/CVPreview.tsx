import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2 } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', border: 'rgba(26,20,16,0.12)' };

interface Props { onClose: () => void; }

export function CVPreview({ onClose }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const LEVEL_DOTS: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

  const handleShare = async () => {
    const text = `${cv.firstName} ${cv.lastName} — ${cv.title}
${cv.phone} | ${cv.email}
${cv.location}

${cv.summary}

${lang === 'sw' ? 'Imejengwa na KaziAI' : 'Built with KaziAI'}`;
    try {
      if (navigator.share) await navigator.share({ title: `${cv.firstName} ${cv.lastName} CV`, text });
      else { await navigator.clipboard.writeText(text); toast.success(lang === 'sw' ? '✓ Imenakiliwa!' : '✓ Copied!'); }
    } catch {}
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.75)', zIndex: 60, display: 'flex', flexDirection: 'column' }}>

        {/* Toolbar */}
        <div style={{ background: C.ink, padding: '52px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>{lang === 'sw' ? 'Hakiki CV' : 'CV Preview'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.coral, border: 'none', borderRadius: 99, padding: '8px 14px', cursor: 'pointer' }}>
              <Share2 size={13} color="white" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'Shiriki' : 'Share'}</span>
            </button>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,240,232,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="rgba(245,240,232,0.7)" />
            </button>
          </div>
        </div>

        {/* CV Document */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px' }}>
          <div style={{ background: 'white', borderRadius: 18, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header banner */}
            <div style={{ background: C.ink, padding: '28px 28px 22px', position: 'relative', overflow: 'hidden' }}>
              <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.06, pointerEvents: 'none' }} width="150" height="120" viewBox="0 0 150 120"><circle cx="140" cy="10" r="110" fill="none" stroke="#E7633B" strokeWidth="1.5"/></svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#F5F0E8', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {cv.firstName || 'First'} {cv.lastName || 'Last'}
                  </div>
                  {cv.title && <div style={{ fontSize: 13, color: C.coral, fontWeight: 700, marginTop: 4 }}>{cv.title}</div>}
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                    {cv.phone && <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>📞 {cv.phone}</span>}
                    {cv.email && <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>✉ {cv.email}</span>}
                    {cv.location && <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>📍 {cv.location}</span>}
                  </div>
                </div>
                {/* Initials avatar */}
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'white', flexShrink: 0 }}>
                  {(cv.firstName[0] || 'A')}{(cv.lastName[0] || 'B')}
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Summary */}
              {cv.summary && (
                <Section title={lang === 'sw' ? 'Muhtasari wa Kazi' : 'Professional Summary'}>
                  <p style={{ fontSize: 12, color: '#3D3025', lineHeight: 1.7 }}>{cv.summary}</p>
                </Section>
              )}

              {/* Experience */}
              {cv.experience.length > 0 && (
                <Section title={lang === 'sw' ? 'Uzoefu wa Kazi' : 'Work Experience'}>
                  {cv.experience.map((exp, i) => (
                    <div key={exp.id} style={{ marginBottom: i < cv.experience.length - 1 ? 14 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{exp.title}</div>
                          <div style={{ fontSize: 12, color: C.coral, fontWeight: 600 }}>{exp.company}{exp.location ? ` — ${exp.location}` : ''}</div>
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Space Grotesk', sans-serif", textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                          {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                        </div>
                      </div>
                      {exp.description && <p style={{ fontSize: 12, color: '#3D3025', marginTop: 5, lineHeight: 1.6 }}>{exp.description}</p>}
                    </div>
                  ))}
                </Section>
              )}

              {/* Education */}
              {cv.education.length > 0 && (
                <Section title={lang === 'sw' ? 'Elimu' : 'Education'}>
                  {cv.education.map((edu, i) => (
                    <div key={edu.id} style={{ marginBottom: i < cv.education.length - 1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{edu.degree}</div>
                          <div style={{ fontSize: 12, color: C.coral, fontWeight: 600 }}>{edu.institution}</div>
                          {edu.grade && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{edu.grade}</div>}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>{edu.year}</div>
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {/* Skills */}
              {cv.skills.length > 0 && (
                <Section title={lang === 'sw' ? 'Ujuzi' : 'Skills'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cv.skills.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, background: '#F5F0E8', border: `1px solid rgba(26,20,16,0.12)` }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{s.name}</span>
                        <span style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4].map(d => (
                            <div key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: d <= LEVEL_DOTS[s.level] ? C.coral : C.sand }} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Languages */}
              {cv.languages.length > 0 && (
                <Section title={lang === 'sw' ? 'Lugha' : 'Languages'}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {cv.languages.filter(l => l.lang).map((l, i) => (
                      <div key={i} style={{ padding: '5px 12px', borderRadius: 99, background: '#F5F0E8', border: `1px solid rgba(26,20,16,0.12)` }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{l.lang}</span>
                        <span style={{ fontSize: 11, color: C.muted }}> · {l.level}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* References */}
              {cv.references.length > 0 && (
                <Section title={lang === 'sw' ? 'Marejeo' : 'References'}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {cv.references.map(ref => (
                      <div key={ref.id} style={{ background: '#F9F6F2', borderRadius: 12, padding: '12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{ref.name}</div>
                        <div style={{ fontSize: 11, color: C.coral, marginTop: 2 }}>{ref.title}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{ref.company}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>📞 {ref.phone}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Footer */}
              <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: 'rgba(26,20,16,0.25)', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Built with KaziAI · CREOVA Solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#E7633B', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</div>
        <div style={{ flex: 1, height: 1, background: 'rgba(231,99,59,0.25)' }} />
      </div>
      {children}
    </div>
  );
}
