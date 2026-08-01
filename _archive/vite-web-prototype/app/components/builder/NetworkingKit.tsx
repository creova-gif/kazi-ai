import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Users, Copy, ChevronDown, ChevronUp, Check, ExternalLink } from 'lucide-react';
import { useApp } from '@/app/App';
import { toast } from 'sonner';

const C = { cream: '#F5F0E8', ink: '#1A1410', ink2: '#3D3025', muted: '#8A7D6E', coral: '#E7633B', sand: '#E8DFD0', sand2: '#D4C8B8', green: '#2D6A4F', border: 'rgba(26,20,16,0.10)', border2: 'rgba(26,20,16,0.18)' };

interface Props { onBack: () => void; }

export function NetworkingKit({ onBack }: Props) {
  const { state } = useApp();
  const lang = state.language;
  const cv = state.cv;
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success(lang === 'sw' ? '✓ Imenakiliwa!' : '✓ Copied!');
  };

  const name = `${cv.firstName || 'Jina'} ${cv.lastName || 'Lako'}`.trim();
  const title = cv.title || (lang === 'sw' ? 'Mtaalamu wa Kazi' : 'Professional');
  const skills = cv.skills.slice(0, 3).map(s => s.name).join(', ') || (lang === 'sw' ? 'ujuzi wako' : 'your skills');

  const TEMPLATES = {
    linkedin_request: {
      en: `Hi [Name],

I came across your profile and was impressed by your work at [Company]. I'm a ${title} based in Tanzania with experience in ${skills}. I'd love to connect and learn from your journey in the industry.

Looking forward to connecting!

${name}`,
      sw: `Habari [Jina],

Nimeona wasifu wako na kuvutiwa na kazi yako katika [Kampuni]. Mimi ni ${title} Tanzania mwenye uzoefu katika ${skills}. Ningependa kuunganika nawe na kujifunza kutoka kwa safari yako ya kitaalamu.

Asante,
${name}`,
    },
    follow_up: {
      en: `Hi [Name],

Thank you for connecting! I noticed we share an interest in [Field/Industry]. I'm currently exploring opportunities in Tanzania's ${cv.targetSector[0] || 'professional'} sector.

Would you be open to a brief 15-minute virtual chat sometime? I'd love to get your insights on the industry.

Best regards,
${name}`,
      sw: `Habari [Jina],

Asante kwa kuunganika! Nimeona tunashiriki nia katika [Uwanja/Sekta]. Kwa sasa ninachunguza fursa katika sekta ya ${cv.targetSector[0] || 'kitaalamu'} Tanzania.

Je, ungekuwa tayari kuzungumza kwa dakika 15 kwa mtandaoni? Ningependa kupata maarifa yako kuhusu sekta hii.

Kwa heshima,
${name}`,
    },
    informational: {
      en: `Subject: Request for Career Advice — ${title}

Dear [Name],

My name is ${name}, a ${title} based in Dar es Salaam. I've been following your work at [Company] and find your career path truly inspiring.

I'm currently seeking to grow in the ${cv.targetSector[0] || 'professional'} sector. Would you be willing to share 20 minutes of your time for a brief informational interview? I have specific questions about your career journey and advice for someone at my stage.

I'm flexible with timing and happy to accommodate your schedule.

Thank you for considering this,
${name}`,
      sw: `Mada: Ombi la Ushauri wa Kazi — ${title}

Ndugu [Jina],

Jina langu ni ${name}, ${title} nikiishi Dar es Salaam. Nimekuwa nikifuatilia kazi yako katika [Kampuni] na kupata msukumo mkubwa.

Kwa sasa ninatafuta kukua katika sekta ya ${cv.targetSector[0] || 'kitaalamu'}. Je, ungekuwa tayari kutoa dakika 20 kwa mazungumzo mafupi ya ushauri wa kazi? Nina maswali maalum kuhusu safari yako ya kitaalamu.

Niko huru kwa wakati wowote unaofaa kwako.

Asante kwa kuzingatia,
${name}`,
    },
    thank_you: {
      en: `Hi [Name],

Thank you so much for taking the time to speak with me today. Our conversation gave me a much clearer picture of [specific insight from the conversation].

I'll definitely follow your advice on [specific point]. I've also started looking into [resource/action they mentioned].

I hope to stay in touch and perhaps return the favor someday. If there's anything I can help you with, please don't hesitate to reach out.

With gratitude,
${name}`,
      sw: `Habari [Jina],

Asante sana kwa muda wako wa kuzungumza nami leo. Mazungumzo yetu yamenipatia picha wazi zaidi ya [kitu ulichojifunza].

Nitafuata ushauri wako kuhusu [jambo maalum]. Pia nimeanza kutafuta [rasilimali/hatua waliytaja].

Natumaini kubaki kuwasiliana nawe. Ikiwa kuna chochote naweza kukusaidia, tafadhali wasiliana nami.

Kwa shukrani,
${name}`,
    },
  };

  const TIPS = [
    {
      id: 'profile',
      icon: '📸',
      sw: 'Picha ya Kitaalamu ya LinkedIn',
      en: 'Professional LinkedIn Photo',
      body_sw: 'Tumia picha ya uso wazi, mwanga mzuri, na mandhari rahisi. Epuka picha za starehe au za familia. Vaa mavazi ya kikazi.',
      body_en: 'Use a clear headshot with good lighting and a simple background. Avoid casual or group photos. Wear professional attire.',
    },
    {
      id: 'headline',
      icon: '✍️',
      sw: 'Kichwa cha Wasifu (Headline)',
      en: 'LinkedIn Headline Formula',
      body_sw: 'Tumia muundo huu: [Cheo] | [Ujuzi wa Msingi] | [Sekta au Shabaha]. Mfano: "Mhandisi wa Programu | React & Node.js | Fintech Tanzania"',
      body_en: 'Use this formula: [Title] | [Key Skill] | [Industry/Goal]. Example: "Software Engineer | React & Node.js | Fintech Tanzania"',
    },
    {
      id: 'connect',
      icon: '🤝',
      sw: 'Jinsi ya Kuunganika kwa Ufanisi',
      en: 'How to Connect Effectively',
      body_sw: 'Daima tuma ujumbe wa kibinafsi unapoomba kuunganika. Eleza kwa nini unataka kuunganika. Usitume maombi ya wingi bila ujumbe.',
      body_en: 'Always send a personalized note when connecting. Explain why you want to connect. Never mass-connect without a message.',
    },
    {
      id: 'engage',
      icon: '💬',
      sw: 'Shiriki na Maudhui',
      en: 'Engage with Content',
      body_sw: 'Piga moyo maudhui ya watu unaowafuata. Acha maoni yenye thamani. Shiriki makala yanayofaa. Hii inakufanya uonekane kwa wengine.',
      body_en: 'Like and comment on posts from people you follow. Leave thoughtful comments. Share relevant articles. This increases your visibility.',
    },
    {
      id: 'post',
      icon: '📢',
      sw: 'Chapisha Mara kwa Mara',
      en: 'Post Regularly',
      body_sw: 'Chapisha mara 2-3 kwa wiki. Shiriki mafanikio, masomo uliyojifunza, au taarifa za sekta. Tumia vitambulisho (hashtags) vinavyofaa kwa Tanzania.',
      body_en: 'Post 2-3 times per week. Share achievements, lessons learned, or industry insights. Use relevant hashtags including Tanzania-specific ones.',
    },
    {
      id: 'groups',
      icon: '👥',
      sw: 'Jiunge na Makundi ya LinkedIn',
      en: 'Join LinkedIn Groups',
      body_sw: 'Makundi yanayofaa Tanzania: "Tanzania Professionals Network", "East Africa Business", sekta yako maalum. Shiriki mazungumzo mara kwa mara.',
      body_en: 'Relevant groups: "Tanzania Professionals Network", "East Africa Business", your specific industry group. Participate actively in discussions.',
    },
  ];

  const PLATFORMS = [
    { icon: '💼', name: 'LinkedIn', desc_sw: 'Mtandao mkubwa wa kitaalamu duniani', desc_en: 'World\'s largest professional network', url: 'https://linkedin.com', primary: true },
    { icon: '🌍', name: 'BrighterMonday TZ', desc_sw: 'Bodi kubwa ya kazi Tanzania', desc_en: 'Tanzania\'s largest job board', url: 'https://brightermonday.co.tz', primary: true },
    { icon: '🏛️', name: 'UTUMISHI (AJIRA Portal)', desc_sw: 'Kazi za serikali Tanzania', desc_en: 'Tanzania government jobs portal', url: 'https://ajira.go.tz', primary: true },
    { icon: '🤝', name: 'Fuzu', desc_sw: 'Kazi za Afrika Mashariki', desc_en: 'East African jobs platform', url: 'https://fuzu.com', primary: false },
    { icon: '📱', name: 'WhatsApp Groups', desc_sw: 'Makundi ya kazi kwenye WhatsApp', desc_en: 'Job hunting via WhatsApp groups', url: '', primary: false },
  ];

  const templateKeys = Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[];
  const templateLabels: Record<keyof typeof TEMPLATES, { sw: string; en: string }> = {
    linkedin_request: { sw: '🔗 Ombi la Kuunganika LinkedIn', en: '🔗 LinkedIn Connection Request' },
    follow_up: { sw: '📩 Ujumbe wa Kufuatilia', en: '📩 Follow-Up Message' },
    informational: { sw: '📧 Barua ya Mahojiano ya Taarifa', en: '📧 Informational Interview Email' },
    thank_you: { sw: '🙏 Barua ya Shukrani', en: '🙏 Thank You Note' },
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: C.cream, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: '52px 24px 20px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: 0, top: 0, opacity: 0.05, pointerEvents: 'none' }} width="200" height="200" viewBox="0 0 200 200"><circle cx="180" cy="20" r="150" fill="none" stroke="#E7633B" strokeWidth="1"/></svg>
        <button onClick={onBack} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <ArrowLeft size={16} color="rgba(245,240,232,0.7)" strokeWidth={2.5} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#F5F0E8' }}>
              {lang === 'sw' ? 'Mtandao wa Kazi' : 'Networking Kit'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)' }}>
              {lang === 'sw' ? 'Templeates, Vidokezo & Majukwaa' : 'Templates, Tips & Platforms'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* Message Templates */}
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: "'Space Grotesk', sans-serif" }}>
          ✉️ {lang === 'sw' ? 'Templeates za Ujumbe' : 'Message Templates'}
        </div>

        {templateKeys.map(key => {
          const text = TEMPLATES[key][lang === 'sw' ? 'sw' : 'en'];
          const label = lang === 'sw' ? templateLabels[key].sw : templateLabels[key].en;
          const isOpen = openId === key;
          return (
            <div key={key} style={{ background: 'white', borderRadius: 16, border: `1px solid ${isOpen ? 'rgba(231,99,59,0.25)' : C.border}`, marginBottom: 10, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(isOpen ? null : key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{label}</div>
                {isOpen ? <ChevronUp size={16} color={C.coral} /> : <ChevronDown size={16} color={C.muted} />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div style={{ padding: '0 16px 14px', borderTop: `1px solid rgba(231,99,59,0.12)` }}>
                      <pre style={{ fontSize: 12, color: C.ink2, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Sora', sans-serif", marginTop: 12, marginBottom: 12 }}>{text}</pre>
                      <button onClick={() => copy(text, key)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 99, background: copied === key ? '#ECFDF5' : C.sand, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied === key ? C.green : C.muted, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {copied === key ? <Check size={12} color={C.green} /> : <Copy size={12} color={C.muted} />}
                        {copied === key ? (lang === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (lang === 'sw' ? 'Nakili' : 'Copy Template')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Tips */}
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          💡 {lang === 'sw' ? 'Vidokezo vya Mtandao' : 'Networking Tips'}
        </div>
        {TIPS.map(tip => {
          const isOpen = openId === tip.id;
          return (
            <div key={tip.id} style={{ background: 'white', borderRadius: 16, border: `1px solid ${isOpen ? 'rgba(231,99,59,0.25)' : C.border}`, marginBottom: 8, overflow: 'hidden' }}>
              <button onClick={() => setOpenId(isOpen ? null : tip.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{tip.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{lang === 'sw' ? tip.sw : tip.en}</div>
                </div>
                {isOpen ? <ChevronUp size={16} color={C.coral} /> : <ChevronDown size={16} color={C.muted} />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div style={{ padding: '0 16px 14px 62px', borderTop: `1px solid rgba(231,99,59,0.12)` }}>
                      <p style={{ fontSize: 12, color: C.ink2, lineHeight: 1.65, marginTop: 10, marginBottom: 0 }}>{lang === 'sw' ? tip.body_sw : tip.body_en}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Platforms */}
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          🌐 {lang === 'sw' ? 'Majukwaa Muhimu' : 'Key Platforms'}
        </div>
        {PLATFORMS.map((p, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, border: `1px solid ${C.border}`, padding: '13px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: p.primary ? 'rgba(231,99,59,0.1)' : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{lang === 'sw' ? p.desc_sw : p.desc_en}</div>
            </div>
            {p.url && (
              <a href={p.url} target="_blank" rel="noreferrer"
                style={{ width: 30, height: 30, borderRadius: '50%', background: C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>
                <ExternalLink size={13} color={C.muted} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
