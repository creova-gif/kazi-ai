import { Briefcase, Sparkles } from 'lucide-react';

const C = { cream: '#F5F0E8', ink: '#1A1410', coral: '#E7633B' };

interface Props {
  onNext: () => void;
}

export function SplashScreen({ onNext }: Props) {
  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.ink, padding: '0 32px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background Pattern */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, opacity: 0.03 }}>
        <circle cx="10%" cy="20%" r="150" fill="none" stroke={C.coral} strokeWidth="1"/>
        <circle cx="90%" cy="80%" r="120" fill="none" stroke={C.coral} strokeWidth="1"/>
        <rect x="70%" y="10%" width="100" height="100" fill="none" stroke={C.coral} strokeWidth="1"/>
      </svg>

      {/* Content */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div
          style={{ width: 80, height: 80, borderRadius: 20, background: C.coral, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(231,99,59,0.3)' }}
        >
          <Briefcase size={36} color="white" strokeWidth={2.5} />
        </div>

        <h1
          style={{ fontSize: 32, fontWeight: 900, color: '#F5F0E8', marginBottom: 12, letterSpacing: '-0.02em' }}
        >
          Kazi AI
        </h1>

        <p
          style={{ fontSize: 15, color: 'rgba(245,240,232,0.7)', lineHeight: 1.6, marginBottom: 48, maxWidth: 280 }}
        >
          Your intelligent career companion for the Tanzanian job market
        </p>

        <button
          onClick={onNext}
          style={{ background: C.coral, color: 'white', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 12px rgba(231,99,59,0.3)' }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Get Started
        </button>
      </div>

      {/* Footer */}
      <div
        style={{ position: 'absolute', bottom: 32, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(245,240,232,0.4)' }}
      >
        <Sparkles size={12} />
        <span>Powered by Claude AI</span>
      </div>
    </div>
  );
}
