import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, ActivityIndicator, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  sector: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: string;
  deadline: string;
  description: string;
  requirements: string[];
  tags: string[];
}

const JOBS: Job[] = [
  { id: '1', title: 'Software Engineer', company: 'Vodacom Tanzania', location: 'Dar es Salaam', sector: 'tech', type: 'full-time', salary: 'TZS 2.5M–4M/month', deadline: 'June 30, 2025', description: 'Build and maintain mobile and web applications for Vodacom Tanzania\'s digital services.', requirements: ['BSc Computer Science or related', '2+ years experience', 'React or Angular', 'REST APIs'], tags: ['Tech', 'Engineering', 'Mobile'] },
  { id: '2', title: 'Finance Officer', company: 'CRDB Bank', location: 'Dar es Salaam', sector: 'finance', type: 'full-time', salary: 'TZS 1.8M–3M/month', deadline: 'June 15, 2025', description: 'Manage financial reporting, budgets and compliance for CRDB Bank branches.', requirements: ['Degree in Finance, Accounting or Economics', 'CPA preferred', '3+ years experience', 'QuickBooks/SAP skills'], tags: ['Finance', 'Banking', 'Accounting'] },
  { id: '3', title: 'Programme Manager', company: 'UNICEF Tanzania', location: 'Dar es Salaam', sector: 'ngo', type: 'full-time', salary: 'USD 3,500–5,000/month', deadline: 'June 20, 2025', description: 'Lead child protection and education programmes across Tanzania.', requirements: ['Masters in Social Sciences or International Development', '5+ years NGO experience', 'Project management skills', 'Swahili required'], tags: ['NGO', 'Management', 'Development'] },
  { id: '4', title: 'Medical Officer', company: 'Aga Khan Hospital', location: 'Dar es Salaam', sector: 'health', type: 'full-time', salary: 'TZS 3.5M–6M/month', deadline: 'July 10, 2025', description: 'Provide quality medical care to patients at Aga Khan Hospital Dar es Salaam.', requirements: ['MBChB or MD', 'Registered with Medical Council of Tanzania', '2+ years clinical experience'], tags: ['Health', 'Medical', 'Clinical'] },
  { id: '5', title: 'Data Analyst', company: 'NMB Bank', location: 'Dar es Salaam', sector: 'finance', type: 'full-time', salary: 'TZS 2M–3.5M/month', deadline: 'July 5, 2025', description: 'Analyse customer and transaction data to drive business insights at NMB Bank.', requirements: ['BSc Statistics, Mathematics or Computer Science', 'Python or R proficiency', 'SQL skills', '2+ years experience'], tags: ['Data', 'Finance', 'Analytics'] },
  { id: '6', title: 'Secondary School Teacher (Mathematics)', company: 'Arusha Municipal Council', location: 'Arusha', sector: 'government', type: 'full-time', salary: 'TZS 600K–900K/month', deadline: 'June 25, 2025', description: 'Teach O-level and A-level Mathematics in government secondary schools.', requirements: ['B.Ed. Mathematics or BSc with PGDE', 'Registered with NECTA', 'Swahili and English'], tags: ['Education', 'Teaching', 'Government'] },
  { id: '7', title: 'Project Coordinator', company: 'World Food Programme (WFP)', location: 'Dodoma', sector: 'ngo', type: 'contract', salary: 'USD 2,000–3,000/month', deadline: 'June 18, 2025', description: 'Coordinate food security and nutrition projects in central Tanzania.', requirements: ['Degree in Agriculture, Nutrition or Development', '3+ years project management', 'Swahili required', 'Driving licence'], tags: ['NGO', 'Food Security', 'Coordination'] },
  { id: '8', title: 'Human Resources Manager', company: 'Tanzania Breweries Limited', location: 'Dar es Salaam', sector: 'private', type: 'full-time', salary: 'TZS 3M–5M/month', deadline: 'July 1, 2025', description: 'Lead HR strategy, recruitment, and employee relations at TBL.', requirements: ['Degree in HRM or Business', 'CIPD or equivalent', '5+ years HR experience', 'Manufacturing sector preferred'], tags: ['HR', 'Management', 'FMCG'] },
  { id: '9', title: 'Monitoring & Evaluation Officer', company: 'PATH Tanzania', location: 'Dar es Salaam', sector: 'ngo', type: 'full-time', salary: 'USD 1,800–2,800/month', deadline: 'June 22, 2025', description: 'Design and implement M&E systems for health programmes across Tanzania.', requirements: ['Masters in Public Health, Statistics or related', '3+ years M&E experience', 'SPSS or Stata', 'ODK or KoboToolbox'], tags: ['NGO', 'M&E', 'Health'] },
  { id: '10', title: 'Civil Engineer', company: 'Tanzania Roads Authority (TANROADS)', location: 'Dodoma', sector: 'government', type: 'full-time', salary: 'TZS 1.5M–2.5M/month', deadline: 'July 15, 2025', description: 'Design and supervise road and infrastructure projects across Tanzania.', requirements: ['BSc Civil Engineering', 'ERB registered', '3+ years experience', 'AutoCAD proficiency'], tags: ['Engineering', 'Government', 'Infrastructure'] },
  { id: '11', title: 'Sales Representative', company: 'Azam Media', location: 'Dar es Salaam', sector: 'private', type: 'full-time', salary: 'TZS 800K–1.5M + commission', deadline: 'July 8, 2025', description: 'Drive subscription sales and partnerships for Azam TV services.', requirements: ['Diploma or Degree in Sales/Marketing', '1+ year sales experience', 'Good communication skills', 'Own motorcycle preferred'], tags: ['Sales', 'Media', 'Marketing'] },
  { id: '12', title: 'Pharmacist', company: 'Muhimbili National Hospital', location: 'Dar es Salaam', sector: 'government', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'June 28, 2025', description: 'Dispense medications and advise clinical staff at Tanzania\'s largest referral hospital.', requirements: ['B.Pharm', 'Registered with Pharmacy Council of Tanzania', '1+ year experience'], tags: ['Health', 'Pharmacy', 'Government'] },
  { id: '13', title: 'Digital Marketing Specialist', company: 'Selcom', location: 'Dar es Salaam', sector: 'tech', type: 'full-time', salary: 'TZS 1.5M–2.5M/month', deadline: 'July 3, 2025', description: 'Drive digital marketing campaigns for Tanzania\'s leading payment platform.', requirements: ['Degree in Marketing or Communications', 'Google Ads, Meta Ads experience', 'Content creation skills', '2+ years digital marketing'], tags: ['Marketing', 'Digital', 'Fintech'] },
  { id: '14', title: 'Agricultural Extension Officer', company: 'Ministry of Agriculture', location: 'Morogoro', sector: 'government', type: 'full-time', salary: 'TZS 700K–1.2M/month', deadline: 'July 12, 2025', description: 'Train smallholder farmers in modern agricultural practices in Morogoro region.', requirements: ['Diploma or Degree in Agriculture', 'Driving licence', 'Swahili required', 'Willingness to work in rural areas'], tags: ['Agriculture', 'Government', 'Rural'] },
  { id: '15', title: 'Legal Counsel', company: 'TPDC (Tanzania Petroleum Development)', location: 'Dar es Salaam', sector: 'government', type: 'full-time', salary: 'TZS 3M–5.5M/month', deadline: 'June 30, 2025', description: 'Provide legal advice on contracts, compliance, and regulatory matters for Tanzania\'s national oil company.', requirements: ['LLB + LLM preferred', '5+ years legal experience', 'Oil & gas sector experience valued', 'Bar admission in Tanzania'], tags: ['Legal', 'Oil & Gas', 'Government'] },
  { id: '16', title: 'Logistics Coordinator', company: 'Maersk Tanzania', location: 'Dar es Salaam', sector: 'private', type: 'full-time', salary: 'TZS 2M–3.5M/month', deadline: 'July 6, 2025', description: 'Coordinate freight logistics and container operations for Maersk Tanzania.', requirements: ['Degree in Logistics, Supply Chain or Business', '2+ years logistics experience', 'SAP/ERP skills', 'English required'], tags: ['Logistics', 'Shipping', 'Supply Chain'] },
  { id: '17', title: 'Nurse (ICU)', company: 'Muhimbili National Hospital', location: 'Dar es Salaam', sector: 'government', type: 'full-time', salary: 'TZS 900K–1.6M/month', deadline: 'July 9, 2025', description: 'Provide critical care nursing in the Intensive Care Unit.', requirements: ['Diploma or Degree in Nursing', 'Registered with Nursing Council', 'ICU experience preferred'], tags: ['Health', 'Nursing', 'Government'] },
  { id: '18', title: 'IT Support Engineer', company: 'Equity Bank Tanzania', location: 'Dar es Salaam', sector: 'finance', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'July 4, 2025', description: 'Provide IT support, system administration, and network management.', requirements: ['Diploma or Degree in IT or Computer Science', 'CCNA or CompTIA A+ preferred', '2+ years IT support experience'], tags: ['IT', 'Finance', 'Networking'] },
  { id: '19', title: 'Community Health Worker Trainer', company: 'Amref Health Africa', location: 'Mwanza', sector: 'ngo', type: 'contract', salary: 'TZS 1M–1.8M/month', deadline: 'June 17, 2025', description: 'Train and supervise community health workers in health promotion in lake zone.', requirements: ['Diploma in Public Health or Nursing', '3+ years community health experience', 'Swahili required', 'Lake zone residence preferred'], tags: ['Health', 'NGO', 'Training'] },
  { id: '20', title: 'Procurement Officer', company: 'Tanzania Electric Supply (TANESCO)', location: 'Dar es Salaam', sector: 'government', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'July 11, 2025', description: 'Manage procurement processes in accordance with Public Procurement Act.', requirements: ['Degree in Procurement and Supplies', 'PSPTB registration', '2+ years public procurement experience'], tags: ['Procurement', 'Government', 'Supply Chain'] },
  { id: '21', title: 'Mobile App Developer', company: 'Nala Money', location: 'Dar es Salaam', sector: 'tech', type: 'full-time', salary: 'USD 2,000–4,000/month', deadline: 'July 14, 2025', description: 'Build world-class financial services apps for the African market.', requirements: ['BSc Computer Science or related', 'React Native or Flutter', '3+ years mobile development', 'Fintech experience preferred'], tags: ['Tech', 'Mobile', 'Fintech'] },
  { id: '22', title: 'Research Assistant', company: 'Ifakara Health Institute', location: 'Dar es Salaam', sector: 'ngo', type: 'contract', salary: 'TZS 800K–1.4M/month', deadline: 'June 16, 2025', description: 'Assist in health research data collection and analysis.', requirements: ['Degree in Public Health, Medicine or Statistics', 'Research experience preferred', 'SPSS or R skills', 'Swahili and English'], tags: ['Research', 'Health', 'NGO'] },
  { id: '23', title: 'Bank Teller', company: 'NBC (National Bank of Commerce)', location: 'Moshi', sector: 'finance', type: 'full-time', salary: 'TZS 700K–1.1M/month', deadline: 'July 7, 2025', description: 'Handle cash transactions and customer service at NBC Moshi branch.', requirements: ['Diploma or Degree in Banking, Finance or Business', '1+ year banking experience', 'Strong numeracy and customer service'], tags: ['Banking', 'Finance', 'Customer Service'] },
  { id: '24', title: 'Environmental Officer', company: 'NEMC (National Environment Management)', location: 'Dar es Salaam', sector: 'government', type: 'full-time', salary: 'TZS 1M–1.8M/month', deadline: 'July 16, 2025', description: 'Monitor environmental compliance and enforce NEMC regulations.', requirements: ['Degree in Environmental Science or Engineering', '2+ years experience', 'Knowledge of environmental laws', 'Driving licence'], tags: ['Environment', 'Government', 'Science'] },
  { id: '25', title: 'Business Development Manager', company: 'Standard Chartered Bank Tanzania', location: 'Dar es Salaam', sector: 'finance', type: 'full-time', salary: 'TZS 4M–7M/month', deadline: 'July 13, 2025', description: 'Drive new business, partnerships and revenue growth for Standard Chartered Tanzania.', requirements: ['Degree in Business, Finance or Economics', 'MBA preferred', '7+ years banking/finance experience', 'Strong network in Tanzania business community'], tags: ['Finance', 'Business Development', 'Banking'] },
];

type TabType = 'all' | 'matches' | 'saved';

export default function JobsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, toggleSaveJob } = useApp();
  const lang = state.language;

  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const SECTORS = [
    { id: 'tech', label: 'Tech' }, { id: 'finance', label: t('Finance', 'Fedha') },
    { id: 'ngo', label: 'NGO' }, { id: 'government', label: t('Government', 'Serikali') },
    { id: 'health', label: t('Health', 'Afya') }, { id: 'education', label: t('Education', 'Elimu') },
    { id: 'private', label: t('Private', 'Binafsi') },
  ];

  const filtered = useMemo(() => {
    let jobs = JOBS;
    if (activeTab === 'matches') jobs = jobs.filter(j => state.cv.targetSector.includes(j.sector as any));
    if (activeTab === 'saved') jobs = jobs.filter(j => state.savedJobs.includes(j.id));
    if (sectorFilter) jobs = jobs.filter(j => j.sector === sectorFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return jobs;
  }, [search, sectorFilter, activeTab, state.savedJobs, state.cv.targetSector]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>{t('Job Board', 'Bodi ya Kazi')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{filtered.length} {t('opportunities', 'nafasi')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.card }]} onPress={() => setShowSalary(true)}>
            <Ionicons name="cash-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.card }]} onPress={() => setShowTracker(true)}>
            <Ionicons name="list-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, marginHorizontal: 16, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('Search jobs, companies...', 'Tafuta kazi, makampuni...')}
          placeholderTextColor={colors.muted}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.muted} /></TouchableOpacity> : null}
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { marginHorizontal: 16 }]}>
        {(['all', 'matches', 'saved'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]}
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: '#fff' }]}>
              {tab === 'all' ? t('All', 'Zote') : tab === 'matches' ? t('Matches', 'Mechi') : t('Saved', 'Zilizohifadhiwa')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sector filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity
          style={[styles.filterChip, !sectorFilter && { backgroundColor: colors.ink, borderColor: colors.ink }]}
          onPress={() => setSectorFilter(null)}
        >
          <Text style={[styles.filterChipText, !sectorFilter && { color: '#fff' }]}>{t('All Sectors', 'Sekta Zote')}</Text>
        </TouchableOpacity>
        {SECTORS.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.filterChip, sectorFilter === s.id && { backgroundColor: colors.ink, borderColor: colors.ink }]}
            onPress={() => { setSectorFilter(sectorFilter === s.id ? null : s.id); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.filterChipText, sectorFilter === s.id && { color: '#fff' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Job list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>{t('No jobs found', 'Hakuna kazi zilizopatikana')}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { setSelectedJob(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            activeOpacity={0.85}
          >
            <View style={styles.jobCardTop}>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.jobCompany, { color: colors.primary }]}>{item.company}</Text>
                <View style={styles.jobMeta}>
                  <Ionicons name="location-outline" size={12} color={colors.muted} />
                  <Text style={[styles.jobMetaText, { color: colors.muted }]}>{item.location}</Text>
                  <Text style={[styles.jobMetaDot, { color: colors.muted }]}>·</Text>
                  <Text style={[styles.jobMetaText, { color: colors.muted }]}>{item.type}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => { toggleSaveJob(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={styles.saveBtn}
              >
                <Ionicons
                  name={state.savedJobs.includes(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={22} color={state.savedJobs.includes(item.id) ? colors.primary : colors.muted}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.jobSalary, { color: colors.success }]}>{item.salary}</Text>
            <View style={styles.tagRow}>
              {item.tags.slice(0, 3).map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.sand }]}>
                  <Text style={[styles.tagText, { color: colors.foreground2 }]}>{tag}</Text>
                </View>
              ))}
              <Text style={[styles.deadline, { color: colors.muted }]}>Deadline: {item.deadline}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          visible={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          lang={lang}
        />
      )}

      {/* Application Tracker */}
      <TrackerModal visible={showTracker} onClose={() => setShowTracker(false)} lang={lang} />

      {/* Salary Guide */}
      <SalaryModal visible={showSalary} onClose={() => setShowSalary(false)} lang={lang} />
    </View>
  );
}

// ─── Job Detail Modal ───
function JobDetailModal({ job, visible, onClose, lang }: { job: Job; visible: boolean; onClose: () => void; lang: string }) {
  const { state, toggleSaveJob, markApplied, upsertApplication } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [showCover, setShowCover] = useState(false);
  const [showAppLetter, setShowAppLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [appLetter, setAppLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const isSaved = state.savedJobs.includes(job.id);
  const isApplied = state.appliedJobs.includes(job.id);

  const generateLetter = async (type: 'cover' | 'app') => {
    setLoading(true);
    const cv = state.cv;
    const prompt = type === 'cover'
      ? `Write a professional cover letter in English for a Tanzanian job applicant.
Job: ${job.title} at ${job.company}, ${job.location}.
Applicant: ${cv.firstName} ${cv.lastName}, Skills: ${cv.skills.map(s => s.name).join(', ')}, Experience: ${cv.experienceLevel}.
Make it compelling, 3 paragraphs, Tanzanian context. Do not add placeholders.`
      : `Write a formal application letter in both English and Swahili (provide both versions) for:
Job: ${job.title} at ${job.company}.
Applicant: ${cv.firstName} ${cv.lastName}, Phone: ${cv.phone}.
Use formal Tanzanian letter format. Start with "Mheshimiwa" for Swahili version.`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? '';
      if (type === 'cover') { setCoverLetter(text); setShowCover(true); }
      else { setAppLetter(text); setShowAppLetter(true); }
    } catch {
      if (type === 'cover') { setCoverLetter(t('Failed to generate.', 'Imeshindwa.')); setShowCover(true); }
      else { setAppLetter(t('Failed to generate.', 'Imeshindwa.')); setShowAppLetter(true); }
    }
    setLoading(false);
  };

  const handleApply = () => {
    markApplied(job.id);
    upsertApplication({ jobId: job.id, jobTitle: job.title, company: job.company, status: 'applied', notes: '', salary: job.salary });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleSaveJob(job.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={isSaved ? colors.primary : colors.foreground} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={[detailStyles.title, { color: colors.foreground }]}>{job.title}</Text>
          <Text style={[detailStyles.company, { color: colors.primary }]}>{job.company}</Text>
          <View style={detailStyles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={[detailStyles.metaText, { color: colors.muted }]}>{job.location}</Text>
            <Text style={[detailStyles.metaDot, { color: colors.muted }]}>·</Text>
            <Text style={[detailStyles.metaText, { color: colors.muted }]}>{job.type}</Text>
          </View>
          <View style={[detailStyles.salaryBadge, { backgroundColor: 'rgba(45,106,79,0.10)' }]}>
            <Ionicons name="cash-outline" size={16} color={colors.success} />
            <Text style={[detailStyles.salary, { color: colors.success }]}>{job.salary}</Text>
          </View>
          <Text style={[detailStyles.sectionLabel, { color: colors.muted }]}>{t('DESCRIPTION', 'MAELEZO')}</Text>
          <Text style={[detailStyles.body, { color: colors.foreground }]}>{job.description}</Text>
          <Text style={[detailStyles.sectionLabel, { color: colors.muted, marginTop: 16 }]}>{t('REQUIREMENTS', 'MAHITAJI')}</Text>
          {job.requirements.map((r, i) => (
            <View key={i} style={detailStyles.reqRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[detailStyles.reqText, { color: colors.foreground }]}>{r}</Text>
            </View>
          ))}
          <Text style={[detailStyles.deadline, { color: colors.muted, marginTop: 16 }]}>
            {t('Deadline:', 'Muda wa Mwisho:')} {job.deadline}
          </Text>

          {/* Action Buttons */}
          <View style={detailStyles.actionGrid}>
            <TouchableOpacity
              style={[detailStyles.actionBtn, { backgroundColor: colors.sand, flex: 1 }]}
              onPress={() => generateLetter('cover')}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="document-text-outline" size={18} color={colors.primary} />}
              <Text style={[detailStyles.actionBtnText, { color: colors.primary }]}>{t('Cover Letter', 'Barua ya Nia')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[detailStyles.actionBtn, { backgroundColor: colors.sand, flex: 1 }]}
              onPress={() => generateLetter('app')}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size="small" color={colors.success} /> : <Ionicons name="mail-outline" size={18} color={colors.success} />}
              <Text style={[detailStyles.actionBtnText, { color: colors.success }]}>{t('Formal Letter', 'Barua Rasmi')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[detailStyles.applyBtn, { backgroundColor: isApplied ? colors.success : colors.primary }]}
            onPress={handleApply}
            disabled={isApplied}
            activeOpacity={0.85}
          >
            <Ionicons name={isApplied ? 'checkmark-circle' : 'send'} size={18} color="#fff" />
            <Text style={detailStyles.applyBtnText}>{isApplied ? t('Applied', 'Umeomba') : t('Mark as Applied', 'Weka kama Umeomba')}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cover Letter Sheet */}
        <LetterSheet visible={showCover} onClose={() => setShowCover(false)} title={t('Cover Letter', 'Barua ya Nia')} text={coverLetter} lang={lang} />
        <LetterSheet visible={showAppLetter} onClose={() => setShowAppLetter(false)} title={t('Application Letter', 'Barua ya Maombi')} text={appLetter} lang={lang} />
      </View>
    </Modal>
  );
}

function LetterSheet({ visible, onClose, title, text, lang }: { visible: boolean; onClose: () => void; title: string; text: string; lang: string }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <Text style={[detailStyles.title, { fontSize: 16, color: colors.foreground }]}>{title}</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={[detailStyles.body, { color: colors.foreground, lineHeight: 24 }]}>{text}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Tracker Modal ───
function TrackerModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const { state, updateApplicationStatus } = useApp();
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const statusColors: Record<string, string> = { applied: colors.primary, saved: colors.muted, interview: colors.success, offer: '#2D6A4F', rejected: colors.error };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <Text style={[detailStyles.title, { fontSize: 16, color: colors.foreground }]}>{t('Application Tracker', 'Kufuatilia Maombi')}</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {state.applications.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="clipboard-outline" size={48} color={colors.muted} />
              <Text style={[detailStyles.body, { color: colors.muted, textAlign: 'center', marginTop: 12 }]}>
                {t('No applications tracked yet.\nApply to jobs to see them here.', 'Hakuna maombi yanayofuatiliwa bado.')}
              </Text>
            </View>
          ) : state.applications.map(app => (
            <View key={app.jobId} style={[detailStyles.salaryBadge, { backgroundColor: colors.card, borderRadius: 14, marginBottom: 12, flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[detailStyles.company, { color: colors.foreground, fontSize: 15 }]}>{app.jobTitle}</Text>
              <Text style={[detailStyles.metaText, { color: colors.muted }]}>{app.company} · {app.dateApplied}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {(['applied', 'interview', 'offer', 'rejected'] as const).map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.filterChip, { marginRight: 6, borderColor: app.status === st ? statusColors[st] : colors.border, backgroundColor: app.status === st ? statusColors[st] : colors.background }]}
                    onPress={() => updateApplicationStatus(app.jobId, st)}
                  >
                    <Text style={[styles.filterChipText, { color: app.status === st ? '#fff' : colors.muted }]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Salary Guide Modal ───
const SALARY_DATA = [
  { role: 'Software Engineer', range: 'TZS 2.5M–6M', sector: 'Tech' },
  { role: 'Finance Officer', range: 'TZS 1.5M–3.5M', sector: 'Finance' },
  { role: 'Medical Officer', range: 'TZS 2.5M–6M', sector: 'Health' },
  { role: 'Programme Manager (NGO)', range: 'USD 2,500–5,000', sector: 'NGO' },
  { role: 'Civil Servant (Entry)', range: 'TZS 600K–1.2M', sector: 'Government' },
  { role: 'Teacher (Government)', range: 'TZS 600K–900K', sector: 'Education' },
  { role: 'Bank Manager', range: 'TZS 3.5M–8M', sector: 'Finance' },
  { role: 'HR Manager', range: 'TZS 2.5M–5M', sector: 'Private' },
  { role: 'Data Analyst', range: 'TZS 1.8M–3.5M', sector: 'Tech' },
  { role: 'Nurse (Government)', range: 'TZS 900K–1.8M', sector: 'Health' },
  { role: 'Business Dev Manager', range: 'TZS 3.5M–7M', sector: 'Finance' },
  { role: 'Research Officer', range: 'TZS 1.2M–2.5M', sector: 'NGO' },
];

function SalaryModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <Text style={[detailStyles.title, { fontSize: 16, color: colors.foreground }]}>{t('Tanzania Salary Guide', 'Mwongozo wa Mishahara')}</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[detailStyles.body, { color: colors.muted, marginBottom: 16 }]}>
            {t('Market salary ranges for Tanzania (2025)', 'Viwango vya mishahara Tanzania (2025)')}
          </Text>
          {SALARY_DATA.map(s => (
            <View key={s.role} style={[detailStyles.salaryBadge, { backgroundColor: colors.card, borderRadius: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={[detailStyles.company, { color: colors.foreground, fontSize: 14 }]}>{s.role}</Text>
                <Text style={[detailStyles.metaText, { color: colors.muted, fontSize: 11 }]}>{s.sector}</Text>
              </View>
              <Text style={[detailStyles.salary, { color: colors.success, textAlign: 'right', flexShrink: 1 }]}>{s.range}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(26,20,16,0.06)' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#8A7D6E' },
  filterScroll: { marginBottom: 8, flexGrow: 0 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.12)', backgroundColor: '#fff' },
  filterChipText: { fontSize: 12, fontWeight: '500', color: '#3D3025' },
  jobCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12,
    shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  jobCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700' },
  jobCompany: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  jobMetaText: { fontSize: 12 },
  jobMetaDot: { fontSize: 12, marginHorizontal: 2 },
  saveBtn: { padding: 4 },
  jobSalary: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 11, fontWeight: '500' },
  deadline: { fontSize: 11, marginLeft: 'auto' as any },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  company: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  metaText: { fontSize: 13 },
  metaDot: { fontSize: 13, marginHorizontal: 4 },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },
  salary: { fontSize: 14, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 22 },
  reqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  reqText: { fontSize: 14, flex: 1 },
  deadline: { fontSize: 12, marginBottom: 20 },
  actionGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 13 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, marginTop: 4 },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
