import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)' };
const fmtK = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : `${(n/1000).toFixed(0)}K`;

const SALARY_DATA = [
  { role: 'Software Engineer', sector: 'tech', entry: [1200000, 2000000], mid: [2500000, 4000000], senior: [4500000, 8000000], demand: 'high' },
  { role: 'Data Analyst', sector: 'tech', entry: [900000, 1600000], mid: [2000000, 3500000], senior: [4000000, 6000000], demand: 'high' },
  { role: 'Accountant', sector: 'finance', entry: [700000, 1200000], mid: [1500000, 2500000], senior: [3000000, 5000000], demand: 'medium' },
  { role: 'Nurse (RN)', sector: 'health', entry: [800000, 1400000], mid: [1500000, 2200000], senior: [2500000, 4000000], demand: 'high' },
  { role: 'Teacher (Secondary)', sector: 'education', entry: [600000, 1000000], mid: [1000000, 1600000], senior: [1600000, 2500000], demand: 'medium' },
  { role: 'Program Officer (NGO)', sector: 'ngo', entry: [1500000, 2500000], mid: [2800000, 4500000], senior: [5000000, 9000000], demand: 'medium' },
  { role: 'Marketing Manager', sector: 'private', entry: [1000000, 1800000], mid: [2000000, 3500000], senior: [3500000, 6000000], demand: 'medium' },
  { role: 'Civil Engineer', sector: 'government', entry: [900000, 1500000], mid: [1600000, 2800000], senior: [3000000, 5000000], demand: 'medium' },
  { role: 'Doctor (Medical Officer)', sector: 'health', entry: [2000000, 3000000], mid: [3500000, 5500000], senior: [6000000, 12000000], demand: 'high' },
  { role: 'Business Analyst', sector: 'finance', entry: [1200000, 2000000], mid: [2500000, 4000000], senior: [4500000, 7000000], demand: 'high' },
  { role: 'HR Officer', sector: 'private', entry: [700000, 1300000], mid: [1500000, 2500000], senior: [2800000, 4500000], demand: 'low' },
  { role: 'Procurement Officer', sector: 'government', entry: [800000, 1400000], mid: [1600000, 2600000], senior: [2800000, 4500000], demand: 'medium' },
];

type ExpLevel = 'entry' | 'mid' | 'senior';
type Sector = string;

interface Props { onBack: () => void; }

export function SalaryGuide({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const [level, setLevel] = useState<ExpLevel>(state.cv.experienceLevel === 'none' ? 'entry' : (state.cv.experienceLevel as ExpLevel) || 'entry');
  const [sectorFilter, setSectorFilter] = useState<Sector>('all');
  const [selected, setSelected] = useState<typeof SALARY_DATA[0] | null>(null);

  const sectors = ['all', ...Array.from(new Set(SALARY_DATA.map(d => d.sector)))];
  const filtered = sectorFilter === 'all' ? SALARY_DATA : SALARY_DATA.filter(d => d.sector === sectorFilter);

  const TAX_RATE = 0.18; // simplified Tanzania PAYE estimate
  const takeHome = (gross: number) => Math.round(gross * (1 - TAX_RATE));

  const demandColor = (d: string) => d === 'high' ? C.green : d === 'medium' ? '#B45309' : C.muted;
  const demandLabel = (d: string) => d === 'high' ? (lang === 'sw' ? '🔥 Mahitaji Makubwa' : '🔥 High demand') : d === 'medium' ? (lang === 'sw' ? '📊 Wastani' : '📊 Medium demand') : (lang === 'sw' ? '📉 Chini' : '📉 Low demand');

  const LEVEL_LABELS = { entry: { sw: '0-2 miaka', en: '0-2 yrs' }, mid: { sw: '2-5 miaka', en: '2-5 yrs' }, senior: { sw: '5+ miaka', en: '5+ yrs' } };

  return (
    <div style={{ background: C.cream, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, position: 'relative' }}>
          <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
          </button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.03em' }}>
              {lang === 'sw' ? 'Mwongozo wa Mishahara' : 'Salary Guide'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 2 }}>
              {lang === 'sw' ? 'Tanzania 2026 — mishahara ya wastani' : 'Tanzania 2026 — average market rates'}
            </div>
          </div>
        </div>

        {/* Experience level toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 3, marginBottom: 0, position: 'relative' }}>
          {(['entry', 'mid', 'senior'] as ExpLevel[]).map(l => (
            <button key={l} onClick={() => setLevel(l)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 9, fontSize: 11, fontWeight: 600, color: level === l ? '#F5F0E8' : 'rgba(245,240,232,0.4)', background: level === l ? 'rgba(245,240,232,0.15)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", transition: 'all 0.2s' }}>
              {lang === 'sw' ? LEVEL_LABELS[l].sw : LEVEL_LABELS[l].en}
            </button>
          ))}
        </div>
      </div>

      {/* Sector filter */}
      <div style={{ padding: '10px 20px 0', background: C.cream, overflowX: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
          {sectors.map(s => (
            <button key={s} onClick={() => setSectorFilter(s)}
              style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${sectorFilter === s ? C.ink : C.border}`, background: sectorFilter === s ? C.ink : 'white', fontSize: 11, fontWeight: 700, color: sectorFilter === s ? '#F5F0E8' : C.muted, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0, transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {s === 'all' ? (lang === 'sw' ? 'Zote' : 'All') : s}
            </button>
          ))}
        </div>
      </div>

      {/* Salary cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 100px' }}>
        {filtered.map((d, i) => {
          const range = d[level];
          const midPt = Math.round((range[0] + range[1]) / 2);
          const maxAll = Math.max(...SALARY_DATA.map(x => x[level][1]));
          const pct = (range[1] / maxAll) * 100;

          return (
            <motion.div key={d.role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(d)}
              style={{ background: 'white', borderRadius: 18, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 10, cursor: 'pointer', transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>{d.role}</div>
                  <div style={{ fontSize: 11, color: demandColor(d.demand), fontWeight: 700, marginTop: 3 }}>{demandLabel(d.demand)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.coral, fontVariantNumeric: 'tabular-nums' }}>TZS {fmtK(midPt)}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{lang === 'sw' ? 'wastani' : 'median'}/mo</div>
                </div>
              </div>
              {/* Range bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>TZS {fmtK(range[0])}</span>
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>TZS {fmtK(range[1])}</span>
                </div>
                <div style={{ height: 6, background: C.sand, borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.04 }}
                    style={{ height: '100%', borderRadius: 99, background: C.coral }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>
                🏠 {lang === 'sw' ? `Baada ya Kodi: ~TZS ${fmtK(takeHome(midPt))}` : `Take-home: ~TZS ${fmtK(takeHome(midPt))}`}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Sheet */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }} onClick={() => setSelected(null)}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ width: '100%', background: C.cream, borderRadius: '26px 26px 0 0', padding: '0 24px 48px', maxHeight: '75vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: C.sand2, borderRadius: 99, margin: '14px auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{selected.role}</div>
            <div style={{ fontSize: 12, color: demandColor(selected.demand), fontWeight: 700, marginBottom: 20 }}>{demandLabel(selected.demand)}</div>

            {/* All levels */}
            {(['entry', 'mid', 'senior'] as ExpLevel[]).map(l => {
              const range = selected[l];
              const mid = Math.round((range[0] + range[1]) / 2);
              const th = takeHome(mid);
              return (
                <div key={l} style={{ background: l === level ? 'rgba(231,99,59,0.06)' : 'white', borderRadius: 16, border: `1px solid ${l === level ? 'rgba(231,99,59,0.25)' : C.border}`, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: l === level ? C.coralD : C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {lang === 'sw' ? LEVEL_LABELS[l].sw : LEVEL_LABELS[l].en} {l === level ? '← wewe' : ''}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: l === level ? C.coral : C.ink2, fontVariantNumeric: 'tabular-nums' }}>
                      TZS {fmtK(mid)}/mo
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    Mzigo: TZS {fmtK(range[0])} – {fmtK(range[1])}
                  </div>
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 4 }}>
                    🏠 {lang === 'sw' ? 'Baada ya kodi' : 'Take-home'}: ~TZS {fmtK(th)}
                  </div>
                </div>
              );
            })}

            <div style={{ background: C.sand, borderRadius: 14, padding: '12px 14px', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                ⚠️ {lang === 'sw' ? 'Mshahara unaweza kutofautiana kulingana na kampuni, uzoefu, na mahali pa kazi. Kodi ya PAYE imechangiwa kwa kiwango cha 18% kwa makadirio.' : 'Salaries vary by company, experience, and location. PAYE tax estimated at 18%.'}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
