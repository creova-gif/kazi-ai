import { motion } from 'motion/react';
import { ArrowLeft, Users } from 'lucide-react';
import { useApp } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Props {
  onBack: () => void;
}

export function NetworkingKit({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F5F0E8' }}>
              {lang === 'sw' ? 'Mtandao wa Kazi' : 'Networking Kit'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>
              {lang === 'sw' ? 'Jenga uhusiano wa kitaaluma' : 'Build professional connections'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚧</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 6 }}>
            {lang === 'sw' ? 'Inakuja Hivi Karibuni' : 'Coming Soon'}
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
            {lang === 'sw'
              ? 'Kipengele hiki kitakuja na miongozo ya kujenga mtandao wa kitaaluma, LinkedIn tips, na rasilimali za kufuatilia watu.'
              : 'This feature will include professional networking tips, LinkedIn strategies, and connection tracking tools.'}
          </p>
        </div>
      </div>
    </div>
  );
}
