import { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, ActivityIndicator, Linking,
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
  country: 'Tanzania' | 'Kenya' | 'Uganda' | 'Rwanda' | 'Ethiopia' | 'Remote';
  flag: string;
  sector: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: string;
  deadline: string;
  description: string;
  requirements: string[];
  tags: string[];
  applyUrl: string;
}

const getDaysLeft = (deadline: string): number => {
  const d = new Date(deadline + ', 2026');
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const JOBS: Job[] = [
  // ── Tanzania (25) ──
  { id: '1', title: 'Software Engineer', company: 'Vodacom Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'tech', type: 'full-time', salary: 'TZS 2.5M–4M/month', deadline: 'Jun 30', description: 'Build and maintain mobile and web applications for Vodacom Tanzania\'s digital services.', requirements: ['BSc Computer Science or related', '2+ years experience', 'React or Angular', 'REST APIs'], tags: ['Tech', 'Engineering', 'Mobile'], applyUrl: 'https://www.vodacom.co.tz/careers' },
  { id: '2', title: 'Finance Officer', company: 'CRDB Bank', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'finance', type: 'full-time', salary: 'TZS 1.8M–3M/month', deadline: 'Jun 15', description: 'Manage financial reporting, budgets and compliance for CRDB Bank branches.', requirements: ['Degree in Finance, Accounting or Economics', 'CPA preferred', '3+ years experience', 'QuickBooks/SAP skills'], tags: ['Finance', 'Banking', 'Accounting'], applyUrl: 'https://crdbbank.go.tz/careers' },
  { id: '3', title: 'Programme Manager', company: 'UNICEF Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'ngo', type: 'full-time', salary: 'USD 3,500–5,000/month', deadline: 'Jun 20', description: 'Lead child protection and education programmes across Tanzania.', requirements: ['Masters in Social Sciences or International Development', '5+ years NGO experience', 'Project management skills', 'Swahili required'], tags: ['NGO', 'Management', 'Development'], applyUrl: 'https://www.unicef.org/careers' },
  { id: '4', title: 'Medical Officer', company: 'Aga Khan Hospital', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'health', type: 'full-time', salary: 'TZS 3.5M–6M/month', deadline: 'Jul 10', description: 'Provide quality medical care to patients at Aga Khan Hospital Dar es Salaam.', requirements: ['MBChB or MD', 'Registered with Medical Council of Tanzania', '2+ years clinical experience'], tags: ['Health', 'Medical', 'Clinical'], applyUrl: 'https://www.agakhanhealth.org/careers' },
  { id: '5', title: 'Data Analyst', company: 'NMB Bank', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'finance', type: 'full-time', salary: 'TZS 2M–3.5M/month', deadline: 'Jul 5', description: 'Analyse customer and transaction data to drive business insights at NMB Bank.', requirements: ['BSc Statistics, Mathematics or Computer Science', 'Python or R proficiency', 'SQL skills', '2+ years experience'], tags: ['Data', 'Finance', 'Analytics'], applyUrl: 'https://www.nmbtz.com/careers' },
  { id: '6', title: 'Maths Teacher (O/A Level)', company: 'Arusha Municipal Council', location: 'Arusha', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 600K–900K/month', deadline: 'Jun 25', description: 'Teach O-level and A-level Mathematics in government secondary schools.', requirements: ['B.Ed. Mathematics or BSc with PGDE', 'Registered with NECTA', 'Swahili and English'], tags: ['Education', 'Teaching', 'Government'], applyUrl: 'https://www.ajira.go.tz' },
  { id: '7', title: 'Project Coordinator', company: 'World Food Programme', location: 'Dodoma', country: 'Tanzania', flag: '🇹🇿', sector: 'ngo', type: 'contract', salary: 'USD 2,000–3,000/month', deadline: 'Jun 18', description: 'Coordinate food security and nutrition projects in central Tanzania.', requirements: ['Degree in Agriculture, Nutrition or Development', '3+ years project management', 'Swahili required', 'Driving licence'], tags: ['NGO', 'Food Security', 'Coordination'], applyUrl: 'https://www.wfp.org/careers' },
  { id: '8', title: 'HR Manager', company: 'Tanzania Breweries Limited', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'private', type: 'full-time', salary: 'TZS 3M–5M/month', deadline: 'Jul 1', description: 'Lead HR strategy, recruitment, and employee relations at TBL.', requirements: ['Degree in HRM or Business', 'CIPD or equivalent', '5+ years HR experience', 'Manufacturing sector preferred'], tags: ['HR', 'Management', 'FMCG'], applyUrl: 'https://www.tbl.co.tz/careers' },
  { id: '9', title: 'M&E Officer', company: 'PATH Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'ngo', type: 'full-time', salary: 'USD 1,800–2,800/month', deadline: 'Jun 22', description: 'Design and implement M&E systems for health programmes across Tanzania.', requirements: ['Masters in Public Health, Statistics or related', '3+ years M&E experience', 'SPSS or Stata', 'ODK or KoboToolbox'], tags: ['NGO', 'M&E', 'Health'], applyUrl: 'https://www.path.org/careers' },
  { id: '10', title: 'Civil Engineer', company: 'TANROADS', location: 'Dodoma', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 1.5M–2.5M/month', deadline: 'Jul 15', description: 'Design and supervise road and infrastructure projects across Tanzania.', requirements: ['BSc Civil Engineering', 'ERB registered', '3+ years experience', 'AutoCAD proficiency'], tags: ['Engineering', 'Government', 'Infrastructure'], applyUrl: 'https://www.ajira.go.tz' },
  { id: '11', title: 'Sales Representative', company: 'Azam Media', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'private', type: 'full-time', salary: 'TZS 800K–1.5M + commission', deadline: 'Jul 8', description: 'Drive subscription sales and partnerships for Azam TV services.', requirements: ['Diploma or Degree in Sales/Marketing', '1+ year sales experience', 'Good communication skills', 'Own motorcycle preferred'], tags: ['Sales', 'Media', 'Marketing'], applyUrl: 'https://www.azamtv.co.tz/careers' },
  { id: '12', title: 'Pharmacist', company: 'Muhimbili National Hospital', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'Jun 28', description: 'Dispense medications and advise clinical staff at Tanzania\'s largest referral hospital.', requirements: ['B.Pharm', 'Registered with Pharmacy Council of Tanzania', '1+ year experience'], tags: ['Health', 'Pharmacy', 'Government'], applyUrl: 'https://www.mnh.or.tz/careers' },
  { id: '13', title: 'Digital Marketing Specialist', company: 'Selcom', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'tech', type: 'full-time', salary: 'TZS 1.5M–2.5M/month', deadline: 'Jul 3', description: 'Drive digital marketing campaigns for Tanzania\'s leading payment platform.', requirements: ['Degree in Marketing or Communications', 'Google Ads, Meta Ads experience', 'Content creation skills', '2+ years digital marketing'], tags: ['Marketing', 'Digital', 'Fintech'], applyUrl: 'https://selcom.net/careers' },
  { id: '14', title: 'Agricultural Extension Officer', company: 'Ministry of Agriculture', location: 'Morogoro', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 700K–1.2M/month', deadline: 'Jul 12', description: 'Train smallholder farmers in modern agricultural practices in Morogoro region.', requirements: ['Diploma or Degree in Agriculture', 'Driving licence', 'Swahili required', 'Willingness to work in rural areas'], tags: ['Agriculture', 'Government', 'Rural'], applyUrl: 'https://www.ajira.go.tz' },
  { id: '15', title: 'Legal Counsel', company: 'TPDC', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 3M–5.5M/month', deadline: 'Jun 30', description: 'Provide legal advice on contracts, compliance, and regulatory matters for TPDC.', requirements: ['LLB + LLM preferred', '5+ years legal experience', 'Oil & gas sector experience valued', 'Bar admission in Tanzania'], tags: ['Legal', 'Oil & Gas', 'Government'], applyUrl: 'https://www.tpdc.co.tz/careers' },
  { id: '16', title: 'Logistics Coordinator', company: 'Maersk Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'private', type: 'full-time', salary: 'TZS 2M–3.5M/month', deadline: 'Jul 6', description: 'Coordinate freight logistics and container operations for Maersk Tanzania.', requirements: ['Degree in Logistics, Supply Chain or Business', '2+ years logistics experience', 'SAP/ERP skills', 'English required'], tags: ['Logistics', 'Shipping', 'Supply Chain'], applyUrl: 'https://www.maersk.com/careers' },
  { id: '17', title: 'ICU Nurse', company: 'Muhimbili National Hospital', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 900K–1.6M/month', deadline: 'Jul 9', description: 'Provide critical care nursing in the Intensive Care Unit.', requirements: ['Diploma or Degree in Nursing', 'Registered with Nursing Council', 'ICU experience preferred'], tags: ['Health', 'Nursing', 'Government'], applyUrl: 'https://www.mnh.or.tz/careers' },
  { id: '18', title: 'IT Support Engineer', company: 'Equity Bank Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'finance', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'Jul 4', description: 'Provide IT support, system administration, and network management.', requirements: ['Diploma or Degree in IT or Computer Science', 'CCNA or CompTIA A+ preferred', '2+ years IT support experience'], tags: ['IT', 'Finance', 'Networking'], applyUrl: 'https://www.equitybankgroup.com/careers' },
  { id: '19', title: 'Community Health Trainer', company: 'Amref Health Africa', location: 'Mwanza', country: 'Tanzania', flag: '🇹🇿', sector: 'ngo', type: 'contract', salary: 'TZS 1M–1.8M/month', deadline: 'Jun 17', description: 'Train and supervise community health workers in health promotion in lake zone.', requirements: ['Diploma in Public Health or Nursing', '3+ years community health experience', 'Swahili required', 'Lake zone residence preferred'], tags: ['Health', 'NGO', 'Training'], applyUrl: 'https://amref.org/careers' },
  { id: '20', title: 'Procurement Officer', company: 'TANESCO', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 1.2M–2M/month', deadline: 'Jul 11', description: 'Manage procurement processes in accordance with Public Procurement Act.', requirements: ['Degree in Procurement and Supplies', 'PSPTB registration', '2+ years public procurement experience'], tags: ['Procurement', 'Government', 'Supply Chain'], applyUrl: 'https://www.tanesco.co.tz' },
  { id: '21', title: 'Mobile App Developer', company: 'Nala Money', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'tech', type: 'full-time', salary: 'USD 2,000–4,000/month', deadline: 'Jul 14', description: 'Build world-class financial services apps for the African market.', requirements: ['BSc Computer Science or related', 'React Native or Flutter', '3+ years mobile development', 'Fintech experience preferred'], tags: ['Tech', 'Mobile', 'Fintech'], applyUrl: 'https://nala.com/careers' },
  { id: '22', title: 'Research Assistant', company: 'Ifakara Health Institute', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'ngo', type: 'contract', salary: 'TZS 800K–1.4M/month', deadline: 'Jun 16', description: 'Assist in health research data collection and analysis.', requirements: ['Degree in Public Health, Medicine or Statistics', 'Research experience preferred', 'SPSS or R skills', 'Swahili and English'], tags: ['Research', 'Health', 'NGO'], applyUrl: 'https://ihi.or.tz/careers' },
  { id: '23', title: 'Bank Teller', company: 'NBC Bank', location: 'Moshi', country: 'Tanzania', flag: '🇹🇿', sector: 'finance', type: 'full-time', salary: 'TZS 700K–1.1M/month', deadline: 'Jul 7', description: 'Handle cash transactions and customer service at NBC Moshi branch.', requirements: ['Diploma or Degree in Banking, Finance or Business', '1+ year banking experience', 'Strong numeracy and customer service'], tags: ['Banking', 'Finance', 'Customer Service'], applyUrl: 'https://www.nbctz.com/careers' },
  { id: '24', title: 'Environmental Officer', company: 'NEMC', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'government', type: 'full-time', salary: 'TZS 1M–1.8M/month', deadline: 'Jul 16', description: 'Monitor environmental compliance and enforce NEMC regulations.', requirements: ['Degree in Environmental Science or Engineering', '2+ years experience', 'Knowledge of environmental laws', 'Driving licence'], tags: ['Environment', 'Government', 'Science'], applyUrl: 'https://www.ajira.go.tz' },
  { id: '25', title: 'Business Development Manager', company: 'Standard Chartered Tanzania', location: 'Dar es Salaam', country: 'Tanzania', flag: '🇹🇿', sector: 'finance', type: 'full-time', salary: 'TZS 4M–7M/month', deadline: 'Jul 13', description: 'Drive new business, partnerships and revenue growth for Standard Chartered Tanzania.', requirements: ['Degree in Business, Finance or Economics', 'MBA preferred', '7+ years banking/finance experience', 'Strong network in Tanzania'], tags: ['Finance', 'Business Development', 'Banking'], applyUrl: 'https://www.sc.com/tz/careers' },
  // ── Kenya (7) ──
  { id: '26', title: 'Software Engineer', company: 'Safaricom PLC', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'tech', type: 'full-time', salary: 'KES 120K–200K/month', deadline: 'Jul 20', description: 'Build and scale digital products on Safaricom\'s M-PESA and telecom platforms.', requirements: ['BSc Computer Science', '3+ years software engineering', 'Java or Python', 'API design experience'], tags: ['Tech', 'Fintech', 'Telecom'], applyUrl: 'https://www.safaricom.co.ke/careers' },
  { id: '27', title: 'Relationship Manager', company: 'Equity Bank Kenya', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'finance', type: 'full-time', salary: 'KES 80K–130K/month', deadline: 'Jul 10', description: 'Manage SME and corporate banking relationships for Equity Bank Kenya.', requirements: ['Degree in Business, Finance or Economics', '3+ years banking relationship management', 'Strong sales and networking skills'], tags: ['Finance', 'Banking', 'Sales'], applyUrl: 'https://www.equitybankgroup.com/careers' },
  { id: '28', title: 'Programme Officer', company: 'UNHCR Kenya', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'ngo', type: 'contract', salary: 'USD 2,500–3,500/month', deadline: 'Jul 5', description: 'Coordinate refugee protection and livelihood programmes in Kenya.', requirements: ['Masters in International Development or related', '4+ years humanitarian experience', 'Experience working with refugees', 'French or Somali an asset'], tags: ['NGO', 'Humanitarian', 'Protection'], applyUrl: 'https://www.unhcr.org/careers' },
  { id: '29', title: 'Data Scientist', company: 'M-Kopa Solar', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'tech', type: 'full-time', salary: 'KES 150K–250K/month', deadline: 'Jul 18', description: 'Build ML models to improve credit scoring and customer insights for M-Kopa.', requirements: ['BSc/MSc Statistics, Computer Science or related', 'Python (Pandas, Scikit-learn, TensorFlow)', '3+ years data science', 'Fintech experience preferred'], tags: ['Data', 'ML', 'Fintech'], applyUrl: 'https://www.m-kopa.com/careers' },
  { id: '30', title: 'Clinical Officer', company: 'Aga Khan University Hospital', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'health', type: 'full-time', salary: 'KES 60K–100K/month', deadline: 'Jul 8', description: 'Provide outpatient clinical services at Aga Khan University Hospital Nairobi.', requirements: ['Diploma in Clinical Medicine', 'Registered with Kenya Clinical Officers Council', '2+ years clinical experience'], tags: ['Health', 'Clinical', 'Hospital'], applyUrl: 'https://www.agakhanhealth.org/careers' },
  { id: '31', title: 'Brand Manager', company: 'East African Breweries', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'private', type: 'full-time', salary: 'KES 90K–150K/month', deadline: 'Jul 22', description: 'Drive brand strategy and marketing campaigns for EABL\'s portfolio across East Africa.', requirements: ['Degree in Marketing or Business', '4+ years brand management', 'FMCG or beverages experience', 'East Africa market knowledge'], tags: ['Marketing', 'FMCG', 'Branding'], applyUrl: 'https://www.eabl.com/careers' },
  { id: '32', title: 'Compliance Officer', company: 'KCB Group', location: 'Nairobi', country: 'Kenya', flag: '🇰🇪', sector: 'finance', type: 'full-time', salary: 'KES 100K–160K/month', deadline: 'Jul 15', description: 'Ensure KCB Group\'s compliance with CBK regulations and AML/KYC requirements.', requirements: ['Degree in Law, Finance or Business', 'CAMS certification preferred', '4+ years compliance in banking', 'Knowledge of CBK regulations'], tags: ['Finance', 'Compliance', 'Banking'], applyUrl: 'https://kcbgroup.com/careers' },
  // ── Uganda (5) ──
  { id: '33', title: 'Network Engineer', company: 'MTN Uganda', location: 'Kampala', country: 'Uganda', flag: '🇺🇬', sector: 'tech', type: 'full-time', salary: 'UGX 3M–6M/month', deadline: 'Jul 12', description: 'Design, deploy and optimise MTN Uganda\'s 4G/5G network infrastructure.', requirements: ['BSc Telecommunications or Electrical Engineering', 'CCNP or equivalent', '3+ years telecom network experience', 'LTE/5G knowledge'], tags: ['Tech', 'Telecom', 'Networking'], applyUrl: 'https://www.mtn.co.ug/careers' },
  { id: '34', title: 'Senior Accountant', company: 'Stanbic Bank Uganda', location: 'Kampala', country: 'Uganda', flag: '🇺🇬', sector: 'finance', type: 'full-time', salary: 'UGX 2.5M–4.5M/month', deadline: 'Jul 6', description: 'Manage financial reporting, reconciliations and regulatory submissions for Stanbic Uganda.', requirements: ['Degree in Accounting or Finance', 'CPA (U) or ACCA', '4+ years banking/finance experience', 'IFRS knowledge'], tags: ['Finance', 'Accounting', 'Banking'], applyUrl: 'https://www.stanbicbank.co.ug/careers' },
  { id: '35', title: 'Health Systems Specialist', company: 'WHO Uganda', location: 'Kampala', country: 'Uganda', flag: '🇺🇬', sector: 'ngo', type: 'contract', salary: 'USD 2,000–3,200/month', deadline: 'Jul 3', description: 'Strengthen health systems and primary healthcare delivery across Uganda.', requirements: ['MPH or Masters in Health Systems', '5+ years public health experience', 'WHO or UN system experience preferred', 'Quantitative research skills'], tags: ['Health', 'NGO', 'Systems'], applyUrl: 'https://www.who.int/careers' },
  { id: '36', title: 'Agricultural Loan Officer', company: 'Uganda Development Bank', location: 'Kampala', country: 'Uganda', flag: '🇺🇬', sector: 'finance', type: 'full-time', salary: 'UGX 1.8M–3M/month', deadline: 'Jul 9', description: 'Assess and manage agricultural and agribusiness loan portfolios for UDB.', requirements: ['Degree in Agriculture, Economics or Finance', '2+ years agricultural lending', 'Credit analysis skills', 'Driving licence'], tags: ['Finance', 'Agriculture', 'Development'], applyUrl: 'https://www.udb.ug/careers' },
  { id: '37', title: 'Country Representative', company: 'ActionAid Uganda', location: 'Kampala', country: 'Uganda', flag: '🇺🇬', sector: 'ngo', type: 'full-time', salary: 'USD 3,500–5,000/month', deadline: 'Jun 28', description: 'Lead ActionAid Uganda\'s programmes on women\'s rights, food security and climate justice.', requirements: ['Masters in Development Studies or related', '8+ years NGO leadership', 'Fundraising and donor relations', 'Uganda national required'], tags: ['NGO', 'Leadership', 'Development'], applyUrl: 'https://www.actionaid.org/careers' },
  // ── Rwanda (5) ──
  { id: '38', title: 'Full Stack Developer', company: 'Andela Rwanda', location: 'Kigali', country: 'Rwanda', flag: '🇷🇼', sector: 'tech', type: 'full-time', salary: 'USD 1,500–3,500/month', deadline: 'Jul 25', description: 'Join Andela\'s Kigali hub to build world-class software for global clients.', requirements: ['BSc Computer Science or self-taught equivalent', 'React, Node.js, TypeScript', '3+ years full stack development', 'Strong English communication'], tags: ['Tech', 'Remote', 'Global'], applyUrl: 'https://andela.com/careers' },
  { id: '39', title: 'Investment Analyst', company: 'Bank of Kigali', location: 'Kigali', country: 'Rwanda', flag: '🇷🇼', sector: 'finance', type: 'full-time', salary: 'RWF 600K–1M/month', deadline: 'Jul 11', description: 'Conduct financial analysis and due diligence for BK\'s investment and lending portfolio.', requirements: ['Degree in Finance, Economics or Business', 'CFA Level 1 preferred', '3+ years investment analysis', 'Financial modelling (Excel)'], tags: ['Finance', 'Investment', 'Banking'], applyUrl: 'https://www.bk.rw/careers' },
  { id: '40', title: 'Project Manager', company: 'GIZ Rwanda', location: 'Kigali', country: 'Rwanda', flag: '🇷🇼', sector: 'ngo', type: 'contract', salary: 'USD 3,000–5,000/month', deadline: 'Jun 30', description: 'Manage GIZ Rwanda\'s private sector development and green economy projects.', requirements: ['Masters in Development, Business or Engineering', 'PMP or PRINCE2 certified', '6+ years project management', 'German or French an asset'], tags: ['NGO', 'Development', 'Management'], applyUrl: 'https://www.giz.de/careers' },
  { id: '41', title: 'Health Programme Officer', company: 'Rwanda Biomedical Centre', location: 'Kigali', country: 'Rwanda', flag: '🇷🇼', sector: 'health', type: 'full-time', salary: 'RWF 500K–900K/month', deadline: 'Jul 4', description: 'Support HIV/AIDS, malaria and other health programme implementation at RBC.', requirements: ['Degree in Public Health or Medicine', 'Registered with Rwanda health council', '3+ years public health experience', 'Kinyarwanda and English required'], tags: ['Health', 'Government', 'HIV/AIDS'], applyUrl: 'https://www.rbc.gov.rw/careers' },
  { id: '42', title: 'Operations Manager', company: 'Marriott Kigali', location: 'Kigali', country: 'Rwanda', flag: '🇷🇼', sector: 'private', type: 'full-time', salary: 'RWF 400K–700K/month', deadline: 'Jul 17', description: 'Oversee daily hotel operations, F&B, housekeeping and guest services at Marriott Kigali.', requirements: ['Degree in Hospitality Management', '5+ years hotel management', 'Marriott or international chain experience', 'English and French required'], tags: ['Hospitality', 'Operations', 'Tourism'], applyUrl: 'https://www.marriott.com/careers' },
  // ── Ethiopia (5) ──
  { id: '43', title: 'Aviation Operations Officer', company: 'Ethiopian Airlines', location: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', sector: 'private', type: 'full-time', salary: 'ETB 25K–40K/month', deadline: 'Jul 20', description: 'Coordinate flight operations, scheduling and ground services for Africa\'s largest airline.', requirements: ['Degree in Aviation Management or Engineering', 'IATA certification preferred', '2+ years aviation operations', 'English required'], tags: ['Aviation', 'Operations', 'Transport'], applyUrl: 'https://www.ethiopianairlines.com/careers' },
  { id: '44', title: 'Senior Economist', company: 'Commercial Bank of Ethiopia', location: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', sector: 'finance', type: 'full-time', salary: 'ETB 20K–35K/month', deadline: 'Jul 8', description: 'Lead economic research, forecasting and policy analysis at CBE.', requirements: ['MSc or PhD in Economics', '5+ years economic research', 'Econometrics and data analysis', 'Published research an asset'], tags: ['Finance', 'Economics', 'Research'], applyUrl: 'https://www.combanketh.et/careers' },
  { id: '45', title: 'Animal Scientist', company: 'ILRI Ethiopia', location: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', sector: 'ngo', type: 'contract', salary: 'USD 2,000–3,200/month', deadline: 'Jul 1', description: 'Conduct livestock research to improve food security across sub-Saharan Africa.', requirements: ['PhD or MSc in Animal Science or Veterinary Science', '4+ years livestock research', 'Field research in East Africa', 'Scientific publishing record'], tags: ['Research', 'Agriculture', 'NGO'], applyUrl: 'https://www.ilri.org/careers' },
  { id: '46', title: 'Public Health Officer', company: 'WHO Ethiopia', location: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', sector: 'ngo', type: 'full-time', salary: 'USD 2,500–4,000/month', deadline: 'Jun 25', description: 'Support Ethiopia\'s national health strategy implementation and disease surveillance.', requirements: ['MPH or equivalent', 'WHO or UN experience preferred', '4+ years public health', 'Amharic and English required'], tags: ['Health', 'NGO', 'WHO'], applyUrl: 'https://www.who.int/careers' },
  { id: '47', title: 'Software Developer', company: 'Ethio Telecom', location: 'Addis Ababa', country: 'Ethiopia', flag: '🇪🇹', sector: 'tech', type: 'full-time', salary: 'ETB 18K–28K/month', deadline: 'Jul 14', description: 'Develop and maintain enterprise software systems for Ethio Telecom\'s digital services.', requirements: ['BSc Computer Science or Software Engineering', 'Java, Python or PHP', '2+ years software development', 'Amharic and English required'], tags: ['Tech', 'Telecom', 'Software'], applyUrl: 'https://www.ethiotelecom.et/careers' },
  // ── Remote (3) ──
  { id: '48', title: 'Product Manager', company: 'Andela (Remote)', location: 'Remote', country: 'Remote', flag: '💻', sector: 'tech', type: 'full-time', salary: 'USD 3,000–5,000/month', deadline: 'Jul 31', description: 'Lead product strategy and roadmap for Andela\'s talent marketplace platform across East Africa.', requirements: ['5+ years product management', 'Agile/Scrum', 'Data-driven decision making', 'Strong written English'], tags: ['Tech', 'Product', 'Remote'], applyUrl: 'https://andela.com/careers' },
  { id: '49', title: 'UX/UI Designer', company: 'Cellulant Africa (Remote)', location: 'Remote', country: 'Remote', flag: '💻', sector: 'tech', type: 'full-time', salary: 'USD 2,000–3,500/month', deadline: 'Jul 28', description: 'Design intuitive payment and fintech experiences for 18 African markets.', requirements: ['Degree in Design or HCI', 'Figma, Adobe XD', '3+ years product design', 'Mobile-first design expertise', 'African market user research'], tags: ['Design', 'Fintech', 'Remote'], applyUrl: 'https://cellulant.io/careers' },
  { id: '50', title: 'Climate Finance Specialist', company: 'African Development Fund (Remote)', location: 'Remote', country: 'Remote', flag: '💻', sector: 'ngo', type: 'contract', salary: 'USD 4,000–6,000/month', deadline: 'Jul 19', description: 'Structure and appraise climate finance instruments for East African infrastructure projects.', requirements: ['Masters in Finance, Economics or Environmental Science', '7+ years development finance', 'Green bonds or climate finance experience', 'CFA or equivalent preferred'], tags: ['Finance', 'Climate', 'Development'], applyUrl: 'https://www.afdb.org/careers' },
];

const COUNTRIES = [
  { id: 'Tanzania', flag: '🇹🇿' }, { id: 'Kenya', flag: '🇰🇪' }, { id: 'Uganda', flag: '🇺🇬' },
  { id: 'Rwanda', flag: '🇷🇼' }, { id: 'Ethiopia', flag: '🇪🇹' }, { id: 'Remote', flag: '💻' },
] as const;

const SECTORS = [
  { id: 'tech', label: 'Tech' }, { id: 'finance', label: 'Finance' },
  { id: 'ngo', label: 'NGO' }, { id: 'government', label: 'Government' },
  { id: 'health', label: 'Health' }, { id: 'education', label: 'Education' },
  { id: 'private', label: 'Private' },
];

const JOB_TYPES = [
  { id: 'full-time', label: '💼 Full-time' },
  { id: 'part-time', label: '⏰ Part-time' },
  { id: 'contract', label: '📄 Contract' },
  { id: 'internship', label: '🎓 Internship' },
];

const COLLECTIONS = [
  { id: 'remote', icon: '💻', title: 'Remote EA', color: '#6B5CDE', countryF: 'Remote' as const, sectorF: null, typeF: null },
  { id: 'ngo', icon: '🌱', title: 'NGO & Development', color: '#2D6A4F', countryF: null, sectorF: 'ngo', typeF: null },
  { id: 'tech', icon: '⚡', title: 'Tech & Innovation', color: '#1A5276', countryF: null, sectorF: 'tech', typeF: null },
  { id: 'finance', icon: '🏦', title: 'Finance & Banking', color: '#E7A43B', countryF: null, sectorF: 'finance', typeF: null },
  { id: 'health', icon: '⚕️', title: 'Health & Medical', color: '#C0392B', countryF: null, sectorF: 'health', typeF: null },
  { id: 'graduate', icon: '🎓', title: 'Graduate Friendly', color: '#E7633B', countryF: null, sectorF: null, typeF: 'contract' as const },
];

type TabType = 'all' | 'discover' | 'matches' | 'saved';
type CountryFilter = 'Tanzania' | 'Kenya' | 'Uganda' | 'Rwanda' | 'Ethiopia' | 'Remote' | null;
type TypeFilter = 'full-time' | 'part-time' | 'contract' | 'internship' | null;

export default function JobsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, toggleSaveJob } = useApp();
  const lang = state.language;

  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [showSalary, setShowSalary] = useState(false);

  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;

  const filtered = useMemo(() => {
    let jobs = JOBS;
    if (activeTab === 'matches') jobs = jobs.filter(j => state.cv.targetSector.includes(j.sector as any));
    if (activeTab === 'saved') jobs = jobs.filter(j => state.savedJobs.includes(j.id));
    if (countryFilter) jobs = jobs.filter(j => j.country === countryFilter);
    if (sectorFilter) jobs = jobs.filter(j => j.sector === sectorFilter);
    if (typeFilter) jobs = jobs.filter(j => j.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.country.toLowerCase().includes(q) ||
        j.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    return jobs;
  }, [search, sectorFilter, countryFilter, typeFilter, activeTab, state.savedJobs, state.cv.targetSector]);

  const handleCollection = (col: typeof COLLECTIONS[0]) => {
    setSectorFilter(col.sectorF);
    setCountryFilter(col.countryF as CountryFilter);
    setTypeFilter(col.typeF as TypeFilter);
    setActiveTab('all');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>🌍 {t('East Africa Jobs', 'Kazi Afrika Mashariki')}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {activeTab === 'all' ? `${filtered.length} ${t('opportunities', 'nafasi')}` :
              activeTab === 'discover' ? t('Curated collections', 'Makusanyo yaliyochaguliwa') :
              activeTab === 'matches' ? `${filtered.length} ${t('matched roles', 'nafasi zinazolingana')}` :
              `${filtered.length} ${t('saved jobs', 'kazi zilizohifadhiwa')}`}
          </Text>
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

      <View style={[styles.searchBar, { backgroundColor: colors.card, marginHorizontal: 16, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('Search jobs, companies, countries…', 'Tafuta kazi, makampuni, nchi…')}
          placeholderTextColor={colors.muted}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={colors.muted} /></TouchableOpacity> : null}
      </View>

      <View style={[styles.tabRow, { marginHorizontal: 16 }]}>
        {(['all', 'discover', 'matches', 'saved'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]}
            onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, activeTab === tab && { color: '#fff' }]}>
              {tab === 'all' ? t('All', 'Zote') : tab === 'discover' ? t('Discover', 'Gundua') :
                tab === 'matches' ? t('Matches', 'Mechi') : t('Saved', 'Iliyohifadhiwa')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'discover' ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}>
          <Text style={[styles.discoverHeading, { color: colors.foreground }]}>{t('Job Collections', 'Makusanyo ya Kazi')}</Text>
          <Text style={[styles.discoverSub, { color: colors.muted }]}>{t('Curated roles across East Africa', 'Nafasi zilizochaguliwa Afrika Mashariki')}</Text>
          <View style={styles.collectionsGrid}>
            {COLLECTIONS.map(col => {
              const count = JOBS.filter(j =>
                (!col.countryF || j.country === col.countryF) &&
                (!col.sectorF || j.sector === col.sectorF) &&
                (!col.typeF || j.type === col.typeF)
              ).length;
              return (
                <TouchableOpacity
                  key={col.id}
                  style={[styles.collectionCard, { backgroundColor: col.color }]}
                  onPress={() => handleCollection(col)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.collectionIcon}>{col.icon}</Text>
                  <Text style={styles.collectionTitle}>{col.title}</Text>
                  <Text style={styles.collectionCount}>{count} {t('roles', 'nafasi')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.discoverHeading, { color: colors.foreground, marginTop: 20 }]}>{t('Featured Jobs', 'Kazi Zilizoangaziwa')}</Text>
          {JOBS.filter(j => j.salary.includes('USD') || j.country === 'Remote').slice(0, 5).map(job => (
            <JobCard key={job.id} job={job} colors={colors} lang={lang} savedJobs={state.savedJobs} toggleSaveJob={toggleSaveJob} onPress={() => setSelectedJob(job)} />
          ))}
        </ScrollView>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            <TouchableOpacity style={[styles.filterChip, !countryFilter && { backgroundColor: colors.ink, borderColor: colors.ink }]} onPress={() => setCountryFilter(null)}>
              <Text style={[styles.filterChipText, !countryFilter && { color: '#fff' }]}>🌍 {t('All', 'Zote')}</Text>
            </TouchableOpacity>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c.id}
                style={[styles.filterChip, countryFilter === c.id && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                onPress={() => { setCountryFilter(countryFilter === c.id ? null : c.id); Haptics.selectionAsync(); }}>
                <Text style={[styles.filterChipText, countryFilter === c.id && { color: '#fff' }]}>{c.flag} {c.id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            <TouchableOpacity style={[styles.filterChip, !typeFilter && { backgroundColor: 'rgba(26,20,16,0.08)', borderColor: 'transparent' }]} onPress={() => setTypeFilter(null)}>
              <Text style={[styles.filterChipText, !typeFilter && { color: '#3D3025' }]}>{t('All Types', 'Aina Zote')}</Text>
            </TouchableOpacity>
            {JOB_TYPES.map(jt => (
              <TouchableOpacity key={jt.id}
                style={[styles.filterChip, typeFilter === jt.id && { backgroundColor: 'rgba(26,20,16,0.08)', borderColor: 'transparent' }]}
                onPress={() => { setTypeFilter(typeFilter === jt.id ? null : jt.id as TypeFilter); Haptics.selectionAsync(); }}>
                <Text style={[styles.filterChipText, typeFilter === jt.id && { color: '#3D3025' }]}>{jt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            <TouchableOpacity style={[styles.filterChip, !sectorFilter && { backgroundColor: 'rgba(26,20,16,0.06)', borderColor: 'transparent' }]} onPress={() => setSectorFilter(null)}>
              <Text style={[styles.filterChipText]}>{t('All Sectors', 'Sekta Zote')}</Text>
            </TouchableOpacity>
            {SECTORS.map(s => (
              <TouchableOpacity key={s.id}
                style={[styles.filterChip, sectorFilter === s.id && { backgroundColor: 'rgba(26,20,16,0.08)', borderColor: 'transparent' }]}
                onPress={() => { setSectorFilter(sectorFilter === s.id ? null : s.id); Haptics.selectionAsync(); }}>
                <Text style={[styles.filterChipText]}>{s.label}</Text>
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
                <Ionicons name="briefcase-outline" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>{t('No jobs found', 'Hakuna kazi')}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <JobCard job={item} colors={colors} lang={lang} savedJobs={state.savedJobs} toggleSaveJob={toggleSaveJob} onPress={() => setSelectedJob(item)} />
            )}
          />
        </>
      )}

      {selectedJob && <JobDetailModal job={selectedJob} visible={!!selectedJob} onClose={() => setSelectedJob(null)} lang={lang} />}
      <TrackerModal visible={showTracker} onClose={() => setShowTracker(false)} lang={lang} />
      <SalaryModal visible={showSalary} onClose={() => setShowSalary(false)} lang={lang} />
    </View>
  );
}

function JobCard({ job, colors, lang, savedJobs, toggleSaveJob, onPress }: any) {
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const daysLeft = getDaysLeft(job.deadline);
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const isClosed = daysLeft <= 0;

  return (
    <TouchableOpacity style={[styles.jobCard, { backgroundColor: colors.card, borderColor: isUrgent ? colors.error : colors.border }]}
      onPress={onPress} activeOpacity={0.85}>
      {isUrgent && (
        <View style={[styles.urgencyBadge, { backgroundColor: colors.error }]}>
          <Ionicons name="time" size={11} color="#fff" />
          <Text style={styles.urgencyText}>{t(`Closes in ${daysLeft}d`, `Inafunga siku ${daysLeft}`)}</Text>
        </View>
      )}
      {isClosed && (
        <View style={[styles.urgencyBadge, { backgroundColor: colors.muted }]}>
          <Text style={styles.urgencyText}>{t('Closed', 'Imefungwa')}</Text>
        </View>
      )}
      <View style={styles.jobCardTop}>
        <View style={styles.jobInfo}>
          <Text style={[styles.jobTitle, { color: colors.foreground }]}>{job.title}</Text>
          <Text style={[styles.jobCompany, { color: colors.primary }]}>{job.company}</Text>
          <View style={styles.jobMeta}>
            <Text style={{ fontSize: 12 }}>{job.flag}</Text>
            <Text style={[styles.jobMetaText, { color: colors.muted }]}>{job.location}</Text>
            <Text style={[styles.jobMetaDot, { color: colors.muted }]}>·</Text>
            <Text style={[styles.jobMetaText, { color: colors.muted }]}>{job.type}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => { toggleSaveJob(job.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.saveBtn}>
          <Ionicons name={savedJobs.includes(job.id) ? 'bookmark' : 'bookmark-outline'} size={22}
            color={savedJobs.includes(job.id) ? colors.primary : colors.muted} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.jobSalary, { color: colors.success }]}>{job.salary}</Text>
      <View style={styles.tagRow}>
        {job.tags.slice(0, 3).map((tag: string) => (
          <View key={tag} style={[styles.tag, { backgroundColor: colors.sand }]}>
            <Text style={[styles.tagText, { color: colors.foreground2 }]}>{tag}</Text>
          </View>
        ))}
        <Text style={[styles.deadline, { color: isUrgent ? colors.error : colors.muted }]}>
          {t('Deadline:', 'Muda wa Mwisho:')} {job.deadline}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

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
  const daysLeft = getDaysLeft(job.deadline);

  const generateLetter = async (type: 'cover' | 'app') => {
    setLoading(true);
    const cv = state.cv;
    const prompt = type === 'cover'
      ? `Write a professional cover letter for a job applicant in East Africa (${job.country}).
Job: ${job.title} at ${job.company}, ${job.location}.
Applicant: ${cv.firstName} ${cv.lastName}, Skills: ${cv.skills.map(s => s.name).join(', ')}, Experience: ${cv.experienceLevel}.
Make it compelling, 3 paragraphs, East Africa professional context. No placeholders.`
      : `Write a formal application letter in English and Kiswahili for:
Job: ${job.title} at ${job.company}, ${job.country}.
Applicant: ${cv.firstName} ${cv.lastName}, Phone: ${cv.phone}.
Use formal East Africa letter format. Start Swahili version with "Mheshimiwa".`;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
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
    if (job.applyUrl) {
      Linking.openURL(job.applyUrl).catch(() => {});
    }
    markApplied(job.id);
    upsertApplication({ jobId: job.id, jobTitle: job.title, company: job.company, status: 'applied', notes: '', salary: job.salary });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <TouchableOpacity onPress={() => { toggleSaveJob(job.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={isSaved ? colors.primary : colors.foreground} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontSize: 22 }}>{job.flag}</Text>
            <Text style={[detailStyles.title, { color: colors.foreground, flex: 1 }]}>{job.title}</Text>
          </View>
          <Text style={[detailStyles.company, { color: colors.primary }]}>{job.company}</Text>
          <View style={detailStyles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.muted} />
            <Text style={[detailStyles.metaText, { color: colors.muted }]}>{job.location}, {job.country}</Text>
            <Text style={[detailStyles.metaDot, { color: colors.muted }]}>·</Text>
            <Text style={[detailStyles.metaText, { color: colors.muted }]}>{job.type}</Text>
          </View>
          {daysLeft <= 7 && daysLeft > 0 && (
            <View style={[detailStyles.urgencyRow, { backgroundColor: 'rgba(192,57,43,0.08)' }]}>
              <Ionicons name="time" size={14} color={colors.error} />
              <Text style={[{ color: colors.error, fontSize: 13, fontWeight: '600' }]}>
                {t(`Closes in ${daysLeft} days — apply soon!`, `Inafunga siku ${daysLeft} — omba sasa!`)}
              </Text>
            </View>
          )}
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
            {t('Deadline:', 'Muda wa Mwisho:')} {job.deadline}, 2026
          </Text>
          <View style={detailStyles.actionGrid}>
            <TouchableOpacity style={[detailStyles.actionBtn, { backgroundColor: colors.sand, flex: 1 }]} onPress={() => generateLetter('cover')} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="document-text-outline" size={18} color={colors.primary} />}
              <Text style={[detailStyles.actionBtnText, { color: colors.primary }]}>{t('Cover Letter', 'Barua ya Nia')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[detailStyles.actionBtn, { backgroundColor: colors.sand, flex: 1 }]} onPress={() => generateLetter('app')} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color={colors.success} /> : <Ionicons name="mail-outline" size={18} color={colors.success} />}
              <Text style={[detailStyles.actionBtnText, { color: colors.success }]}>{t('Formal Letter', 'Barua Rasmi')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[detailStyles.applyBtn, { backgroundColor: isApplied ? colors.success : colors.primary }]}
            onPress={handleApply} activeOpacity={0.85}
          >
            <Ionicons name={isApplied ? 'checkmark-circle' : 'open-outline'} size={18} color="#fff" />
            <Text style={detailStyles.applyBtnText}>
              {isApplied ? t('Applied ✓', 'Umeomba ✓') : t('Apply Now →', 'Omba Sasa →')}
            </Text>
          </TouchableOpacity>
          {job.applyUrl ? (
            <Text style={[{ color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 6 }]}>{job.applyUrl}</Text>
          ) : null}
        </ScrollView>
        <LetterSheet visible={showCover} onClose={() => setShowCover(false)} title={t('Cover Letter', 'Barua ya Nia')} text={coverLetter} lang={lang} />
        <LetterSheet visible={showAppLetter} onClose={() => setShowAppLetter(false)} title={t('Application Letter', 'Barua ya Maombi')} text={appLetter} lang={lang} />
      </View>
    </Modal>
  );
}

function LetterSheet({ visible, onClose, title, text, lang }: any) {
  const colors = useColors();
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
                {t('No applications yet.\nApply to jobs to track them here.', 'Hakuna maombi bado.')}
              </Text>
            </View>
          ) : state.applications.map(app => (
            <View key={app.jobId} style={[detailStyles.salaryBadge, { backgroundColor: colors.card, borderRadius: 14, marginBottom: 12, flexDirection: 'column', alignItems: 'flex-start' }]}>
              <Text style={[detailStyles.company, { color: colors.foreground, fontSize: 15 }]}>{app.jobTitle}</Text>
              <Text style={[detailStyles.metaText, { color: colors.muted }]}>{app.company} · {app.dateApplied}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {(['applied', 'interview', 'offer', 'rejected'] as const).map(st => (
                  <TouchableOpacity key={st}
                    style={[styles.filterChip, { marginRight: 6, borderColor: app.status === st ? statusColors[st] : colors.border, backgroundColor: app.status === st ? statusColors[st] : colors.background }]}
                    onPress={() => updateApplicationStatus(app.jobId, st)}>
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

const SALARY_DATA = [
  { role: 'Software Engineer', tz: 'TZS 2.5M–6M', ke: 'KES 120K–250K', ug: 'UGX 3M–7M', rw: 'USD 1.5K–4K', sector: 'Tech' },
  { role: 'Finance Officer', tz: 'TZS 1.5M–3.5M', ke: 'KES 60K–130K', ug: 'UGX 1.5M–3M', rw: 'RWF 400K–800K', sector: 'Finance' },
  { role: 'Medical Officer', tz: 'TZS 2.5M–6M', ke: 'KES 80K–200K', ug: 'UGX 2M–5M', rw: 'RWF 500K–1M', sector: 'Health' },
  { role: 'Programme Manager (NGO)', tz: 'USD 2.5K–5K', ke: 'USD 2.5K–5K', ug: 'USD 2K–4K', rw: 'USD 2.5K–5K', sector: 'NGO' },
  { role: 'Bank Manager', tz: 'TZS 3.5M–8M', ke: 'KES 150K–350K', ug: 'UGX 3M–8M', rw: 'RWF 700K–1.5M', sector: 'Finance' },
  { role: 'Data Analyst', tz: 'TZS 1.8M–3.5M', ke: 'KES 80K–180K', ug: 'UGX 2M–4M', rw: 'USD 1K–2.5K', sector: 'Tech' },
  { role: 'Civil Servant (Entry)', tz: 'TZS 600K–1.2M', ke: 'KES 30K–60K', ug: 'UGX 600K–1.2M', rw: 'RWF 200K–400K', sector: 'Government' },
  { role: 'HR Manager', tz: 'TZS 2.5M–5M', ke: 'KES 100K–220K', ug: 'UGX 2M–4.5M', rw: 'RWF 500K–1M', sector: 'Private' },
  { role: 'Product Manager', tz: 'USD 2K–4K', ke: 'KES 150K–300K', ug: 'UGX 4M–8M', rw: 'USD 2K–4K', sector: 'Tech' },
];

function SalaryModal({ visible, onClose, lang }: { visible: boolean; onClose: () => void; lang: string }) {
  const colors = useColors();
  const t = (en: string, sw: string) => lang === 'sw' ? sw : en;
  const [selectedCountry, setSelectedCountry] = useState<'tz' | 'ke' | 'ug' | 'rw'>('tz');
  const countryLabels = { tz: '🇹🇿 Tanzania', ke: '🇰🇪 Kenya', ug: '🇺🇬 Uganda', rw: '🇷🇼 Rwanda' };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[detailStyles.container, { backgroundColor: colors.background }]}>
        <View style={[detailStyles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}><Ionicons name="chevron-down" size={26} color={colors.foreground} /></TouchableOpacity>
          <Text style={[detailStyles.title, { fontSize: 16, color: colors.foreground }]}>🌍 {t('EA Salary Guide', 'Mwongozo wa Mishahara')}</Text>
          <View style={{ width: 26 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
            {(Object.entries(countryLabels) as any[]).map(([code, label]: any) => (
              <TouchableOpacity key={code}
                style={[styles.filterChip, selectedCountry === code && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                onPress={() => setSelectedCountry(code)}>
                <Text style={[styles.filterChipText, selectedCountry === code && { color: '#fff' }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {SALARY_DATA.map(s => (
            <View key={s.role} style={[detailStyles.salaryBadge, { backgroundColor: colors.card, borderRadius: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={[detailStyles.company, { color: colors.foreground, fontSize: 14 }]}>{s.role}</Text>
                <Text style={[detailStyles.metaText, { color: colors.muted, fontSize: 11 }]}>{s.sector}</Text>
              </View>
              <Text style={[detailStyles.salary, { color: colors.success, textAlign: 'right', flexShrink: 1 }]}>{(s as any)[selectedCountry]}</Text>
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
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerIconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(26,20,16,0.06)', alignItems: 'center' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#8A7D6E' },
  filterScroll: { marginBottom: 6, flexGrow: 0 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(26,20,16,0.12)', backgroundColor: '#fff' },
  filterChipText: { fontSize: 12, fontWeight: '500', color: '#3D3025' },
  jobCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, shadowColor: '#1A1410', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 8 },
  urgencyText: { color: '#fff', fontSize: 10, fontWeight: '700' },
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
  discoverHeading: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  discoverSub: { fontSize: 13, marginBottom: 16 },
  collectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  collectionCard: { width: '47%', borderRadius: 16, padding: 16, minHeight: 100 },
  collectionIcon: { fontSize: 28, marginBottom: 8 },
  collectionTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  collectionCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
});

const detailStyles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  company: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  metaText: { fontSize: 13 },
  metaDot: { fontSize: 13, marginHorizontal: 4 },
  urgencyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginBottom: 10 },
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
