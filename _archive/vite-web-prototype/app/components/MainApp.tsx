import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Briefcase, BookOpen, User } from 'lucide-react';
import { useApp } from '@/app/App';
import { CVBuilder } from './builder/CVBuilder';
import { JobsView } from './jobs/JobsView';
import { InterviewPrep } from './builder/InterviewPrep';
import { ProfileView } from './profile/ProfileView';

type Tab = 'cv' | 'jobs' | 'prep' | 'profile';
const C = { cream: '#F5F0E8', ink: '#1A1410', muted: '#8A7D6E', coral: '#E7633B', border2: 'rgba(26,20,16,0.18)' };

export function MainApp() {
  const { state } = useApp();
  const lang = state.language;
  const [tab, setTab] = useState<Tab>('cv');

  const tabs: { id: Tab; Icon: typeof FileText; sw: string; en: string }[] = [
    { id: 'cv', Icon: FileText, sw: 'CV Yangu', en: 'My CV' },
    { id: 'jobs', Icon: Briefcase, sw: 'Kazi', en: 'Jobs' },
    { id: 'prep', Icon: BookOpen, sw: 'Jiandae', en: 'Prepare' },
    { id: 'profile', Icon: User, sw: 'Mimi', en: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: C.cream }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {tab === 'cv' && <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ height: '100%', overflow: 'hidden' }}><CVBuilder /></motion.div>}
          {tab === 'jobs' && <motion.div key="jobs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ height: '100%', overflow: 'hidden' }}><JobsView /></motion.div>}
          {tab === 'prep' && <motion.div key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ height: '100%', overflow: 'hidden' }}><InterviewPrep /></motion.div>}
          {tab === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={{ height: '100%', overflow: 'hidden' }}><ProfileView /></motion.div>}
        </AnimatePresence>
      </div>
      <nav style={{ background: 'white', borderTop: `1.5px solid ${C.border2}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '8px 4px 20px', flexShrink: 0, boxShadow: '0 -2px 12px rgba(26,20,16,0.06)' }}>
        {tabs.map(({ id, Icon, sw, en }) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 2px', background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' }}>
              {on && <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: C.coral, borderRadius: 99 }} />}
              <div style={{ width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(231,99,59,0.1)' : 'transparent', transition: 'background 0.2s' }}>
                <Icon size={20} color={on ? C.coral : C.muted} strokeWidth={on ? 2.2 : 1.8} />
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: on ? C.coral : C.muted, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em', transition: 'color 0.2s' }}>
                {lang === 'sw' ? sw : en}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
