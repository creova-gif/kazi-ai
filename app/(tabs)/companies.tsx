import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { JOBS } from './jobs';

interface Review { author: string; rating: number; text: string; date: string; }

interface Company {
  id: string;
  name: string;
  flag: string;
  country: string;
  city: string;
  sectorLabel: string;
  sectorKey: string;
  size: string;
  founded: number;
  logoLetter: string;
  logoColor: string;
  rating: number;
  reviewCount: number;
  followers: number;
  mission: string;
  culture: string[];
  benefits: string[];
  reviews: Review[];
  website: string;
}

const COMPANIES: Company[] = [
  {
    id: 'vodacom-tz', name: 'Vodacom Tanzania', flag: '🇹🇿', country: 'Tanzania', city: 'Dar es Salaam',
    sectorLabel: 'Telecom', sectorKey: 'tech', size: '1,200+', founded: 1999,
    logoLetter: 'V', logoColor: '#E7633B', rating: 4.2, reviewCount: 48, followers: 3200,
    mission: 'Connecting Tanzanians to a better future through innovative telecommunications and digital financial services including M-Pesa.',
    culture: ['Strong internal mobility', 'Diversity & inclusion focus', 'Continuous learning culture', 'Innovation-driven teams'],
    benefits: ['Medical cover (employee + family)', 'Pension scheme', 'Annual performance bonus', 'Staff loans at preferential rates', 'Remote work flexibility', 'Education & training support'],
    reviews: [
      { author: 'Software Engineer', rating: 4, text: 'Great place for career growth with clear promotion paths. The tech teams are excellent and move fast.', date: 'Mar 2026' },
      { author: 'Finance Officer', rating: 4, text: 'Good salary and benefits. Work-life balance is reasonable for the private sector in Tanzania.', date: 'Jan 2026' },
    ],
    website: 'https://www.vodacom.co.tz/careers',
  },
  {
    id: 'crdb', name: 'CRDB Bank', flag: '🇹🇿', country: 'Tanzania', city: 'Dar es Salaam',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '3,500+', founded: 1996,
    logoLetter: 'C', logoColor: '#1A5276', rating: 4.0, reviewCount: 72, followers: 4800,
    mission: 'Empowering Tanzanians through innovative financial solutions, driving economic growth across Eastern and Central Africa.',
    culture: ['Customer-first mindset', 'Strong women in leadership programme', 'Community investment', 'Structured training rotations'],
    benefits: ['Comprehensive medical insurance', 'Housing allowance', 'Staff mortgage facility', 'Annual bonus scheme', 'Professional certification support', 'Staff savings account'],
    reviews: [
      { author: 'Relationship Manager', rating: 4, text: 'Excellent brand and very strong in the market. Professional culture with lots of learning opportunities.', date: 'Apr 2026' },
      { author: 'IT Analyst', rating: 4, text: 'One of the best Tanzanian banks to work for. The digital transformation journey is exciting.', date: 'Feb 2026' },
    ],
    website: 'https://crdbbank.go.tz/careers',
  },
  {
    id: 'nmb', name: 'NMB Bank', flag: '🇹🇿', country: 'Tanzania', city: 'Dar es Salaam',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '2,800+', founded: 1997,
    logoLetter: 'N', logoColor: '#2D6A4F', rating: 4.1, reviewCount: 61, followers: 3900,
    mission: 'Democratising access to financial services for all Tanzanians, from rural communities to urban businesses.',
    culture: ['Rural banking champions', 'Youth employment focus', 'Gender balance commitment', 'Technology-led innovation'],
    benefits: ['Medical cover', 'Pension (NSSF + supplementary)', 'Employee share scheme', 'Annual leave bonus', 'Staff loan scheme', 'Career development programme'],
    reviews: [
      { author: 'Branch Manager', rating: 4, text: 'Strong culture and great management support. Good opportunities to grow within the bank.', date: 'Mar 2026' },
      { author: 'Data Analyst', rating: 4, text: 'NMB is investing heavily in digital. Exciting time to join the tech team.', date: 'Dec 2025' },
    ],
    website: 'https://www.nmbtz.com/careers',
  },
  {
    id: 'nala', name: 'Nala Money', flag: '🇹🇿', country: 'Tanzania', city: 'Dar es Salaam',
    sectorLabel: 'Fintech', sectorKey: 'tech', size: '150+', founded: 2017,
    logoLetter: 'N', logoColor: '#6B5CDE', rating: 4.5, reviewCount: 19, followers: 1800,
    mission: 'Rebuilding Africa\'s financial infrastructure to make payments as easy as sending a text, starting with East Africa.',
    culture: ['Remote-first work culture', 'High ownership and autonomy', 'Globally distributed team', 'Solve real African problems'],
    benefits: ['Competitive USD-equivalent salaries', 'Flexible remote work', 'Stock options/equity', 'Health insurance', 'Learning & development budget', 'Company retreats'],
    reviews: [
      { author: 'Mobile Developer', rating: 5, text: 'The best engineering culture in East Africa. You are building for millions of people and you feel it every day.', date: 'May 2026' },
      { author: 'Product Manager', rating: 4, text: 'Fast-moving, ambitious and truly African. Great mission and excellent team.', date: 'Feb 2026' },
    ],
    website: 'https://nala.com/careers',
  },
  {
    id: 'tanesco', name: 'TANESCO', flag: '🇹🇿', country: 'Tanzania', city: 'Dar es Salaam',
    sectorLabel: 'Energy / Government', sectorKey: 'government', size: '5,000+', founded: 1964,
    logoLetter: 'T', logoColor: '#E7A43B', rating: 3.4, reviewCount: 95, followers: 6200,
    mission: 'Providing reliable, affordable and sustainable electricity to Tanzania for social and economic development.',
    culture: ['Job security valued', 'Structured career paths', 'Government pension', 'Infrastructure-scale impact'],
    benefits: ['Government pension (PPF)', 'Medical scheme', 'Housing allowance', 'Leave allowance', 'Transport allowance', 'Staff quarters (upcountry)'],
    reviews: [
      { author: 'Electrical Engineer', rating: 3, text: 'Stable employment with good benefits. Processes can be slow but the work is meaningful.', date: 'Jan 2026' },
      { author: 'Procurement Officer', rating: 4, text: 'Good exposure to large-scale infrastructure projects. Promotions take time but the environment is stable.', date: 'Nov 2025' },
    ],
    website: 'https://www.tanesco.co.tz',
  },
  {
    id: 'unicef-ea', name: 'UNICEF East Africa', flag: '🌍', country: 'East Africa', city: 'Nairobi',
    sectorLabel: 'NGO / UN System', sectorKey: 'ngo', size: '500+', founded: 1946,
    logoLetter: 'U', logoColor: '#00AEEF', rating: 4.3, reviewCount: 54, followers: 8900,
    mission: 'Working for the rights of every child across East Africa — ensuring every child has access to health, education, protection and clean water.',
    culture: ['Mission-driven culture', 'International team environment', 'Gender equality champion', 'Work-life balance respected'],
    benefits: ['UN salary scale (competitive)', 'Comprehensive medical (worldwide)', 'R&R travel allowance', 'Education grant for children', 'UN pension fund', 'Home leave travel'],
    reviews: [
      { author: 'Programme Officer', rating: 4, text: 'The most rewarding work I have ever done. The UN system has real impact across East Africa.', date: 'Apr 2026' },
      { author: 'M&E Specialist', rating: 4, text: 'Excellent learning environment. Exposure to best practice from global experts.', date: 'Feb 2026' },
    ],
    website: 'https://www.unicef.org/careers',
  },
  {
    id: 'safaricom', name: 'Safaricom PLC', flag: '🇰🇪', country: 'Kenya', city: 'Nairobi',
    sectorLabel: 'Telecom / Tech', sectorKey: 'tech', size: '6,000+', founded: 2000,
    logoLetter: 'S', logoColor: '#4CAF50', rating: 4.4, reviewCount: 186, followers: 12500,
    mission: 'Transforming lives across Africa through technology — from M-PESA money transfers to enterprise digital solutions.',
    culture: ['Innovation at the core', 'Diversity & inclusion leaders', 'Sustainability champions', 'Grow your own talent philosophy'],
    benefits: ['Above-market salary bands', 'Medical cover (employee + family)', 'Pension scheme', 'M-PESA transaction discounts', 'Annual performance bonus', 'Study leave & tuition support'],
    reviews: [
      { author: 'Software Engineer', rating: 5, text: 'Building M-PESA products at scale is a career-defining experience. Safaricom is truly world-class.', date: 'May 2026' },
      { author: 'Brand Manager', rating: 4, text: 'Incredible brand to work for. Competitive pay, strong culture and genuine care for employees.', date: 'Mar 2026' },
    ],
    website: 'https://www.safaricom.co.ke/careers',
  },
  {
    id: 'equity', name: 'Equity Group Holdings', flag: '🇰🇪', country: 'Kenya', city: 'Nairobi',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '8,000+', founded: 1984,
    logoLetter: 'E', logoColor: '#C0392B', rating: 4.1, reviewCount: 143, followers: 9800,
    mission: 'Democratising financial access to transform the livelihoods and lives of the people of Africa.',
    culture: ['African-led banking champion', 'Wings to Fly scholarship culture', 'Social impact central to business', 'Merit-based progression'],
    benefits: ['Competitive salary + commission', 'Medical insurance', 'Pension scheme', 'Group life assurance', 'Staff loans', 'Equity Group savings scheme'],
    reviews: [
      { author: 'Relationship Manager', rating: 4, text: 'Strong pan-African brand. Equity gives you real responsibility early in your career.', date: 'Apr 2026' },
      { author: 'Data Analyst', rating: 4, text: 'Good tech investment and serious about digital transformation. Data team is growing fast.', date: 'Jan 2026' },
    ],
    website: 'https://www.equitybankgroup.com/careers',
  },
  {
    id: 'kcb', name: 'KCB Group', flag: '🇰🇪', country: 'Kenya', city: 'Nairobi',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '7,500+', founded: 1896,
    logoLetter: 'K', logoColor: '#1A5276', rating: 4.0, reviewCount: 121, followers: 7600,
    mission: 'A leading East African financial services group committed to growth, innovation and creating value for our stakeholders across the region.',
    culture: ['Pan-African career opportunities', 'Strong compliance culture', 'Talent rotation across EA', 'Community banking leadership'],
    benefits: ['Market-leading salaries', 'Medical cover', 'Pension fund', 'KCB Foundation scholarships', 'Staff loan facility', 'Annual leave entitlement'],
    reviews: [
      { author: 'Compliance Officer', rating: 4, text: 'KCB has excellent career development paths and good exposure to regional banking operations.', date: 'May 2026' },
      { author: 'IT Manager', rating: 3, text: 'Large bank with good stability. Digital transformation is in progress — exciting if you join the right team.', date: 'Dec 2025' },
    ],
    website: 'https://kcbgroup.com/careers',
  },
  {
    id: 'mkopa', name: 'M-Kopa Solar', flag: '🇰🇪', country: 'Kenya', city: 'Nairobi',
    sectorLabel: 'Fintech / CleanTech', sectorKey: 'tech', size: '3,000+', founded: 2011,
    logoLetter: 'M', logoColor: '#F39C12', rating: 4.3, reviewCount: 67, followers: 4200,
    mission: 'Financing progress for everyday people across Africa — starting with solar energy and expanding to devices, financial services and health.',
    culture: ['Impact-first business model', 'Data-driven decision making', 'Inclusive finance champions', 'Hire for potential not pedigree'],
    benefits: ['Competitive USD-equivalent pay', 'Health insurance', 'Solar product discounts', 'Annual bonus', 'Remote work options', 'Learning budget'],
    reviews: [
      { author: 'Data Scientist', rating: 5, text: 'Working on credit scoring for underserved Africans — genuinely impactful and technically challenging.', date: 'Apr 2026' },
      { author: 'Product Manager', rating: 4, text: 'M-Kopa is solving real problems at scale. Good culture with smart, passionate people.', date: 'Feb 2026' },
    ],
    website: 'https://www.m-kopa.com/careers',
  },
  {
    id: 'eabl', name: 'East African Breweries (EABL)', flag: '🇰🇪', country: 'Kenya', city: 'Nairobi',
    sectorLabel: 'FMCG / Beverages', sectorKey: 'private', size: '2,000+', founded: 1922,
    logoLetter: 'E', logoColor: '#8E44AD', rating: 4.2, reviewCount: 83, followers: 5100,
    mission: 'Celebrating life every day, everywhere — brewing world-class beers and spirits that bring people together across East Africa.',
    culture: ['Diageo global brand backing', 'Entrepreneurial within a large company', 'Marketing excellence culture', 'Diversity as a business driver'],
    benefits: ['Above-market compensation', 'Medical insurance', 'Pension scheme', 'Product allowance', 'Annual bonus', 'Diageo Learning Hub access'],
    reviews: [
      { author: 'Brand Manager', rating: 4, text: 'The marketing academy at EABL is world-class. Excellent training and exposure to global brands.', date: 'May 2026' },
      { author: 'Supply Chain Manager', rating: 4, text: 'Strong Diageo backing means international standards and real career mobility across Africa.', date: 'Mar 2026' },
    ],
    website: 'https://www.eabl.com/careers',
  },
  {
    id: 'mtn-ug', name: 'MTN Uganda', flag: '🇺🇬', country: 'Uganda', city: 'Kampala',
    sectorLabel: 'Telecom', sectorKey: 'tech', size: '2,500+', founded: 1998,
    logoLetter: 'M', logoColor: '#FFCB00', rating: 3.9, reviewCount: 58, followers: 3600,
    mission: 'Leading digital solutions in Uganda, connecting people and communities through telecom and mobile financial services.',
    culture: ['Pan-African MTN group culture', 'BOLD values driven', 'Strong technical teams', 'Community empowerment'],
    benefits: ['Competitive salary', 'Medical cover', 'MTN Group pension', 'Staff airtime', 'Annual performance bonus', 'Training & development'],
    reviews: [
      { author: 'Network Engineer', rating: 4, text: 'Great technical exposure working on Uganda\'s largest network. Good colleagues and decent benefits.', date: 'Apr 2026' },
      { author: 'Finance Analyst', rating: 3, text: 'Stable job with reasonable pay. Decision-making can be slow but the work is good.', date: 'Jan 2026' },
    ],
    website: 'https://www.mtn.co.ug/careers',
  },
  {
    id: 'stanbic-ug', name: 'Stanbic Bank Uganda', flag: '🇺🇬', country: 'Uganda', city: 'Kampala',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '1,800+', founded: 1906,
    logoLetter: 'S', logoColor: '#1A5276', rating: 4.0, reviewCount: 44, followers: 2800,
    mission: 'Uganda\'s leading bank driving economic growth through innovative financial solutions for individuals and businesses.',
    culture: ['Standard Bank group standards', 'Meritocracy culture', 'Regional career mobility', 'Strong compliance environment'],
    benefits: ['Competitive salary', 'Medical insurance', 'Pension scheme', 'Staff loans', 'Study support', 'Annual bonus'],
    reviews: [
      { author: 'Senior Accountant', rating: 4, text: 'Professional environment with genuine career development. Standard Bank group gives good mobility.', date: 'Mar 2026' },
      { author: 'Relationship Manager', rating: 4, text: 'Excellent training programme and strong brand in Uganda. Good work-life balance compared to peers.', date: 'Nov 2025' },
    ],
    website: 'https://www.stanbicbank.co.ug/careers',
  },
  {
    id: 'andela', name: 'Andela', flag: '🇷🇼', country: 'Rwanda', city: 'Kigali (Remote)',
    sectorLabel: 'Tech / Talent', sectorKey: 'tech', size: '2,000+', founded: 2014,
    logoLetter: 'A', logoColor: '#6B5CDE', rating: 4.5, reviewCount: 112, followers: 8400,
    mission: 'Advancing human potential by connecting brilliant African technologists with global opportunities — without barriers.',
    culture: ['Remote-first, Africa-first', 'Global client exposure', 'Continuous technical growth', 'High performance, high support'],
    benefits: ['USD-based salaries (globally competitive)', 'Fully remote work', 'Health insurance', 'Equipment stipend', 'Learning platform access', 'Community events'],
    reviews: [
      { author: 'Full Stack Developer', rating: 5, text: 'Andela changed my career. Working with US tech companies while staying in Kigali is a dream come true.', date: 'May 2026' },
      { author: 'Product Manager', rating: 4, text: 'Incredible network of talented African professionals. The programme stretches you in the best ways.', date: 'Mar 2026' },
    ],
    website: 'https://andela.com/careers',
  },
  {
    id: 'bk', name: 'Bank of Kigali', flag: '🇷🇼', country: 'Rwanda', city: 'Kigali',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '1,200+', founded: 1966,
    logoLetter: 'B', logoColor: '#006A4E', rating: 4.1, reviewCount: 36, followers: 2400,
    mission: 'Rwanda\'s leading bank, driving financial inclusion and economic transformation through digital-first banking solutions.',
    culture: ['Rwanda\'s pride employer', 'Gender equality leader', 'Digital innovation culture', 'Customer-centric teams'],
    benefits: ['Competitive salary', 'Medical insurance', 'Pension fund', 'Housing loan scheme', 'Annual bonus', 'Professional development'],
    reviews: [
      { author: 'Investment Analyst', rating: 4, text: 'Bank of Kigali has excellent governance and a real focus on Rwanda\'s development. Proud to work here.', date: 'Apr 2026' },
      { author: 'IT Officer', rating: 4, text: 'Strong digital banking ambitions and good investment in technology talent.', date: 'Jan 2026' },
    ],
    website: 'https://www.bk.rw/careers',
  },
  {
    id: 'ethiopian-airlines', name: 'Ethiopian Airlines', flag: '🇪🇹', country: 'Ethiopia', city: 'Addis Ababa',
    sectorLabel: 'Aviation', sectorKey: 'private', size: '25,000+', founded: 1945,
    logoLetter: 'E', logoColor: '#006400', rating: 4.2, reviewCount: 198, followers: 18500,
    mission: 'Africa\'s leading airline, connecting the world to Africa and Africa to the world with world-class safety and service.',
    culture: ['Africa\'s aviation pioneer', 'World-class training academy', 'Global career exposure', 'Ethiopian pride employer'],
    benefits: ['Competitive aviation salary', 'Free/discounted air travel', 'Medical cover', 'Pension scheme', 'Housing allowance', 'Uniform allowance'],
    reviews: [
      { author: 'Operations Officer', rating: 4, text: 'Best airline in Africa and you feel it every day. The scale and global reach is unmatched.', date: 'May 2026' },
      { author: 'Finance Analyst', rating: 4, text: 'The travel benefits are incredible. Ethiopian Airlines is a genuinely world-class organisation.', date: 'Feb 2026' },
    ],
    website: 'https://www.ethiopianairlines.com/careers',
  },
  {
    id: 'cbe', name: 'Commercial Bank of Ethiopia', flag: '🇪🇹', country: 'Ethiopia', city: 'Addis Ababa',
    sectorLabel: 'Banking', sectorKey: 'finance', size: '12,000+', founded: 1942,
    logoLetter: 'C', logoColor: '#C0392B', rating: 3.8, reviewCount: 87, followers: 7200,
    mission: 'Ethiopia\'s largest bank, driving inclusive economic development through accessible financial services across the country.',
    culture: ['Ethiopia\'s largest employer brand', 'Structured career ladder', 'Government-backed stability', 'Strong training culture'],
    benefits: ['Government-competitive salary', 'Medical scheme', 'Pension fund', 'Housing loan', 'Annual leave bonus', 'Staff cooperative'],
    reviews: [
      { author: 'Senior Economist', rating: 4, text: 'CBE is the backbone of Ethiopia\'s economy. Great stability and strong learning opportunities.', date: 'Mar 2026' },
      { author: 'Branch Manager', rating: 3, text: 'Stable and respected employer. Growth is slower than private banks but very secure.', date: 'Dec 2025' },
    ],
    website: 'https://www.combanketh.et/careers',
  },
];

const COUNTRY_FILTERS = [
  { id: 'Tanzania', flag: '🇹🇿' },
  { id: 'Kenya', flag: '🇰🇪' },
  { id: 'Uganda', flag: '🇺🇬' },
  { id: 'Rwanda', flag: '🇷🇼' },
  { id: 'Ethiopia', flag: '🇪🇹' },
  { id: 'East Africa', flag: '🌍' },
];

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size} color="#F39C12"
        />
      ))}
    </View>
  );
}

export default function CompaniesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, toggleFollowCompany } = useApp();
  const lang = state.language;
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const SECTOR_FILTERS = [
    { id: 'tech', label: 'Tech & Telecom' },
    { id: 'finance', label: t('Finance', 'Fedha') },
    { id: 'ngo', label: 'NGO' },
    { id: 'private', label: t('FMCG / Private', 'FMCG / Binafsi') },
    { id: 'government', label: t('Government', 'Serikali') },
  ];

  const filtered = useMemo(() => {
    let list = COMPANIES;
    if (countryFilter) list = list.filter(c => c.country === countryFilter || (countryFilter === 'East Africa' && true));
    if (sectorFilter) list = list.filter(c => c.sectorKey === sectorFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.sectorLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, countryFilter, sectorFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>🏢 {t('Top Employers', 'Waajiri Wakuu')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{filtered.length} {t('companies · East Africa', 'makampuni · Afrika Mashariki')}</Text>
        </View>
      </View>

      <View style={[styles.searchBar, { backgroundColor: colors.card, marginHorizontal: 16, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('Search companies, sectors…', 'Tafuta makampuni…')}
          placeholderTextColor={colors.muted}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.muted} /></TouchableOpacity> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={[styles.chip, !countryFilter && { backgroundColor: colors.ink, borderColor: colors.ink }]} onPress={() => setCountryFilter(null)}>
          <Text style={[styles.chipText, !countryFilter && { color: '#fff' }]}>🌍 {t('All', 'Zote')}</Text>
        </TouchableOpacity>
        {COUNTRY_FILTERS.map(c => (
          <TouchableOpacity key={c.id} style={[styles.chip, countryFilter === c.id && { backgroundColor: colors.ink, borderColor: colors.ink }]}
            onPress={() => { setCountryFilter(countryFilter === c.id ? null : c.id); Haptics.selectionAsync(); }}>
            <Text style={[styles.chipText, countryFilter === c.id && { color: '#fff' }]}>{c.flag} {c.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={[styles.chip, !sectorFilter && { backgroundColor: 'rgba(26,20,16,0.08)', borderColor: 'transparent' }]} onPress={() => setSectorFilter(null)}>
          <Text style={[styles.chipText, !sectorFilter && { color: '#3D3025' }]}>{t('All Sectors', 'Sekta Zote')}</Text>
        </TouchableOpacity>
        {SECTOR_FILTERS.map(s => (
          <TouchableOpacity key={s.id} style={[styles.chip, sectorFilter === s.id && { backgroundColor: 'rgba(26,20,16,0.08)', borderColor: 'transparent' }]}
            onPress={() => { setSectorFilter(sectorFilter === s.id ? null : s.id); Haptics.selectionAsync(); }}>
            <Text style={[styles.chipText, sectorFilter === s.id && { color: '#3D3025' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>{t('No companies found', 'Hakuna makampuni yaliyopatikana')}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isFollowing = state.followedCompanies.includes(item.id);
          const openRoles = JOBS.filter(j => j.company.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])).length;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { setSelectedCompany(item); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={[styles.logoCircle, { backgroundColor: item.logoColor }]}>
                  <Text style={styles.logoLetter}>{item.logoLetter}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.companyName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.companyMeta, { color: colors.muted }]}>{item.flag} {item.city} · {item.sectorLabel}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <StarRating rating={item.rating} size={11} />
                    <Text style={[styles.ratingText, { color: colors.muted }]}>{item.rating.toFixed(1)} ({item.reviewCount})</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, { backgroundColor: isFollowing ? colors.primary : 'transparent', borderColor: isFollowing ? colors.primary : colors.border }]}
                  onPress={() => { toggleFollowCompany(item.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <Text style={[styles.followBtnText, { color: isFollowing ? '#fff' : colors.muted }]}>
                    {isFollowing ? t('✓ Following', '✓ Unafuata') : t('Follow', 'Fuata')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.metaPill}>
                  <Ionicons name="people-outline" size={12} color={colors.muted} />
                  <Text style={[styles.metaPillText, { color: colors.muted }]}>{item.size}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                  <Text style={[styles.metaPillText, { color: colors.muted }]}>Est. {item.founded}</Text>
                </View>
                {openRoles > 0 && (
                  <View style={[styles.metaPill, { backgroundColor: 'rgba(45,106,79,0.10)' }]}>
                    <Ionicons name="briefcase-outline" size={12} color={colors.success} />
                    <Text style={[styles.metaPillText, { color: colors.success }]}>{openRoles} {t('open roles', 'nafasi wazi')}</Text>
                  </View>
                )}
                <View style={styles.metaPill}>
                  <Ionicons name="heart-outline" size={12} color={colors.muted} />
                  <Text style={[styles.metaPillText, { color: colors.muted }]}>{item.followers.toLocaleString()} {t('followers', 'wafuatiliaji')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          visible={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          lang={lang}
        />
      )}
    </View>
  );
}

function CompanyModal({ company, visible, onClose, lang }: { company: Company; visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const { state, toggleFollowCompany } = useApp();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [tab, setTab] = useState<'overview' | 'jobs' | 'reviews'>('overview');
  const isFollowing = state.followedCompanies.includes(company.id);
  const companyJobs = JOBS.filter(j => j.company.toLowerCase().includes(company.name.toLowerCase().split(' ')[0]));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[modalStyles.container, { backgroundColor: colors.background }]}>
        <View style={[modalStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[modalStyles.heroSection, { backgroundColor: company.logoColor + '18' }]}>
            <View style={[modalStyles.heroLogo, { backgroundColor: company.logoColor }]}>
              <Text style={modalStyles.heroLogoText}>{company.logoLetter}</Text>
            </View>
            <Text style={[modalStyles.heroName, { color: colors.foreground }]}>{company.name}</Text>
            <Text style={[modalStyles.heroMeta, { color: colors.muted }]}>{company.flag} {company.city} · {company.sectorLabel} · Est. {company.founded}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 }}>
              <StarRating rating={company.rating} size={14} />
              <Text style={[{ color: colors.muted, fontSize: 13 }]}>{company.rating.toFixed(1)} · {company.reviewCount} reviews</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[modalStyles.followBtn, { backgroundColor: isFollowing ? company.logoColor : 'transparent', borderColor: company.logoColor }]}
                onPress={() => { toggleFollowCompany(company.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              >
                <Ionicons name={isFollowing ? 'checkmark' : 'add'} size={16} color={isFollowing ? '#fff' : company.logoColor} />
                <Text style={[modalStyles.followBtnText, { color: isFollowing ? '#fff' : company.logoColor }]}>
                  {isFollowing ? t('Following', 'Unafuata') : t('Follow', 'Fuata')}
                </Text>
              </TouchableOpacity>
              <View style={[modalStyles.statPill, { backgroundColor: 'rgba(45,106,79,0.10)' }]}>
                <Text style={[{ color: colors.success, fontSize: 13, fontWeight: '600' }]}>{company.size} {t('employees', 'wafanyakazi')}</Text>
              </View>
            </View>
          </View>

          <View style={[modalStyles.tabBar, { borderBottomColor: colors.border }]}>
            {(['overview', 'jobs', 'reviews'] as const).map(tb => (
              <TouchableOpacity key={tb} style={[modalStyles.tabBtn, tab === tb && { borderBottomColor: company.logoColor, borderBottomWidth: 2.5 }]} onPress={() => setTab(tb)}>
                <Text style={[modalStyles.tabBtnText, { color: tab === tb ? company.logoColor : colors.muted }]}>
                  {tb === 'overview' ? t('Overview', 'Muhtasari') : tb === 'jobs' ? `${t('Open Jobs', 'Kazi Wazi')} (${companyJobs.length})` : t('Reviews', 'Maoni')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ padding: 20 }}>
            {tab === 'overview' && (
              <>
                <Text style={[modalStyles.sectionTitle, { color: colors.muted }]}>{t('ABOUT', 'KUHUSU')}</Text>
                <Text style={[modalStyles.bodyText, { color: colors.foreground }]}>{company.mission}</Text>

                <Text style={[modalStyles.sectionTitle, { color: colors.muted, marginTop: 20 }]}>{t('CULTURE', 'UTAMADUNI')}</Text>
                {company.culture.map((c, i) => (
                  <View key={i} style={modalStyles.listRow}>
                    <View style={[modalStyles.listDot, { backgroundColor: company.logoColor }]} />
                    <Text style={[modalStyles.bodyText, { color: colors.foreground }]}>{c}</Text>
                  </View>
                ))}

                <Text style={[modalStyles.sectionTitle, { color: colors.muted, marginTop: 20 }]}>{t('BENEFITS', 'MANUFAA')}</Text>
                <View style={styles.benefitsGrid}>
                  {company.benefits.map((b, i) => (
                    <View key={i} style={[styles.benefitChip, { backgroundColor: colors.sand }]}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text style={[styles.benefitText, { color: colors.foreground2 }]}>{b}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={[styles.websiteBtn, { borderColor: company.logoColor }]}>
                  <Ionicons name="open-outline" size={16} color={company.logoColor} />
                  <Text style={[styles.websiteBtnText, { color: company.logoColor }]}>{t('View Careers Page', 'Angalia Ukurasa wa Kazi')}</Text>
                </TouchableOpacity>
              </>
            )}

            {tab === 'jobs' && (
              companyJobs.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="briefcase-outline" size={40} color={colors.muted} />
                  <Text style={[modalStyles.bodyText, { color: colors.muted, textAlign: 'center', marginTop: 12 }]}>
                    {t('No open roles right now.\nFollow to get notified.', 'Hakuna nafasi sasa hivi.\nFuata ili upate taarifa.')}
                  </Text>
                </View>
              ) : companyJobs.map(job => (
                <View key={job.id} style={[styles.miniJobCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.miniJobTitle, { color: colors.foreground }]}>{job.title}</Text>
                  <Text style={[styles.miniJobMeta, { color: colors.muted }]}>{job.location} · {job.type}</Text>
                  <Text style={[styles.miniJobSalary, { color: colors.success }]}>{job.salary}</Text>
                  <Text style={[styles.miniJobDeadline, { color: colors.muted }]}>Deadline: {job.deadline}</Text>
                </View>
              ))
            )}

            {tab === 'reviews' && (
              <>
                <View style={[styles.ratingOverview, { backgroundColor: colors.card }]}>
                  <Text style={[styles.bigRating, { color: colors.foreground }]}>{company.rating.toFixed(1)}</Text>
                  <StarRating rating={company.rating} size={20} />
                  <Text style={[{ color: colors.muted, fontSize: 12, marginTop: 4 }]}>{t('Based on', 'Kulingana na')} {company.reviewCount} {t('reviews', 'maoni')}</Text>
                </View>
                {company.reviews.map((rev, i) => (
                  <View key={i} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={[styles.reviewAuthor, { color: colors.foreground }]}>{rev.author}</Text>
                      <Text style={[{ color: colors.muted, fontSize: 11 }]}>{rev.date}</Text>
                    </View>
                    <StarRating rating={rev.rating} size={12} />
                    <Text style={[styles.reviewText, { color: colors.foreground }]}>{rev.text}</Text>
                  </View>
                ))}
                <Text style={[{ color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 12 }]}>
                  {t('Reviews from employees and recent applicants.', 'Maoni kutoka kwa wafanyakazi na waombaji wa hivi karibuni.')}
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'flex-end' },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: { flexGrow: 0, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.12)', backgroundColor: '#fff' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#3D3025' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  logoCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoLetter: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardInfo: { flex: 1 },
  companyName: { fontSize: 15, fontWeight: '700' },
  companyMeta: { fontSize: 12, marginTop: 2 },
  ratingText: { fontSize: 11 },
  followBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  followBtnText: { fontSize: 12, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(26,20,16,0.05)' },
  metaPillText: { fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  benefitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  benefitChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  benefitText: { fontSize: 12 },
  websiteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1.5, paddingVertical: 13, marginTop: 8 },
  websiteBtnText: { fontSize: 14, fontWeight: '600' },
  miniJobCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  miniJobTitle: { fontSize: 14, fontWeight: '700' },
  miniJobMeta: { fontSize: 12, marginTop: 3 },
  miniJobSalary: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  miniJobDeadline: { fontSize: 11, marginTop: 2 },
  ratingOverview: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  bigRating: { fontSize: 48, fontWeight: '800', lineHeight: 52 },
  reviewCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  reviewAuthor: { fontSize: 14, fontWeight: '600' },
  reviewText: { fontSize: 14, lineHeight: 22, marginTop: 8 },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  heroSection: { alignItems: 'center', padding: 24, paddingTop: 28 },
  heroLogo: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroLogoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  heroName: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  heroMeta: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabBtnText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  bodyText: { fontSize: 14, lineHeight: 22, flex: 1 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  listDot: { width: 6, height: 6, borderRadius: 3, marginTop: 8, flexShrink: 0 },
  followBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
  followBtnText: { fontSize: 14, fontWeight: '700' },
  statPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
});
