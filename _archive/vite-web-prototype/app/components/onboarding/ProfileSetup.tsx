import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ArrowRight } from 'lucide-react';
import { useApp } from '@/app/App';
import type { JobSector, ExperienceLevel } from '@/app/App';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Props {
  onNext: () => void;
}

export function ProfileSetup({ onNext }: Props) {
  const { state, updateCV } = useApp();
  const lang = state.language;
  const cv = state.cv;

  const [firstName, setFirstName] = useState(cv.firstName || '');
  const [lastName, setLastName] = useState(cv.lastName || '');
  const [title, setTitle] = useState(cv.title || '');
  const [email, setEmail] = useState(cv.email || '');
  const [phone, setPhone] = useState(cv.phone || '');
  const [location, setLocation] = useState(cv.location || '');

  const canProceed = firstName && lastName && email;

  const handleContinue = () => {
    updateCV({
      firstName,
      lastName,
      title,
      email,
      phone,
      location,
    });
    onNext();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 24px', flexShrink: 0 }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ width: 56, height: 56, borderRadius: 14, background: C.coral, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <User size={26} color="white" strokeWidth={2.5} />
        </motion.div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', marginBottom: 6, textAlign: 'center' }}>
          {lang === 'sw' ? 'Wasiliana' : 'Contact Info'}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', textAlign: 'center' }}>
          {lang === 'sw' ? 'Jaza maelezo yako ya msingi' : 'Fill in your basic details'}
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'JINA LA KWANZA *' : 'FIRST NAME *'}
            </label>
            <input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder={lang === 'sw' ? 'Jina lako la kwanza' : 'Your first name'}
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'JINA LA UKOO *' : 'LAST NAME *'}
            </label>
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder={lang === 'sw' ? 'Jina lako la ukoo' : 'Your last name'}
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'CHEO LA KAZI' : 'JOB TITLE'}
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={lang === 'sw' ? 'Mfano: Mhandisi Programu' : 'e.g. Software Engineer'}
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'BARUA PEPE *' : 'EMAIL *'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'NAMBA YA SIMU' : 'PHONE NUMBER'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+255 XXX XXX XXX"
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.ink2, marginBottom: 6, display: 'block', fontFamily: "'Space Grotesk', sans-serif" }}>
              {lang === 'sw' ? 'MAHALI' : 'LOCATION'}
            </label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={lang === 'sw' ? 'Mfano: Dar es Salaam' : 'e.g. Dar es Salaam'}
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${C.border2}`, borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: "'Sora', sans-serif", background: 'white', color: C.ink }}
            />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div style={{ padding: '16px 20px 28px', background: C.cream, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        <motion.button
          whileTap={{ scale: canProceed ? 0.97 : 1 }}
          onClick={handleContinue}
          disabled={!canProceed}
          style={{
            width: '100%',
            padding: '16px',
            background: canProceed ? C.coral : C.sand,
            color: canProceed ? 'white' : C.muted,
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            fontFamily: "'Sora', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          {lang === 'sw' ? 'Endelea' : 'Continue'}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
