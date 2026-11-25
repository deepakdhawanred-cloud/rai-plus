import type { UserRole } from '../types';
import type { PublicDemoAccount } from '../components/UnifiedLoginModal';

export type ArchitecturePillarId =
  | 'erp_evidence'
  | 'clinical_care'
  | 'olq_thinking'
  | 'vcip_cognitive'
  | 'mindmaps_career';

export type StakeholderRoleTabId =
  | 'principal'
  | 'teacher'
  | 'accountant'
  | 'clinical'
  | 'student'
  | 'parent'
  | 'counsellor';

export interface ArchitecturePillar {
  id: ArchitecturePillarId;
  index: string;
  shortLabel: string;
  title: string;
  summary: string;
  mechanismChain: string[];
  measurableOutcome: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel: string;
  recommendedRole: UserRole;
}

export interface StakeholderWorkspacePreview {
  id: StakeholderRoleTabId;
  label: string;
  roleTitle: string;
  targetRole: UserRole;
  headline: string;
  summary: string;
  dailyWorkflows: Array<{ title: string; detail: string }>;
  keyMetricLabel: string;
  keyMetricValue: string;
  ctaLabel: string;
}

export interface PublicFaqItem {
  id: string;
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

export interface PublicBrainGymSampleItem {
  id: string;
  domain: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PublicMindMapTopic {
  id: string;
  subject: string;
  classLabel: string;
  title: string;
  coreIdea: string;
  branches: Array<{
    id: string;
    heading: string;
    keyPoint: string;
    formulaOrExample: string;
  }>;
}

export const HERO_VCIP_RADAR_PREVIEW = [
  { domain: 'Fluid', current: 84, baseline: 68 },
  { domain: 'Memory', current: 78, baseline: 65 },
  { domain: 'Speed', current: 74, baseline: 62 },
  { domain: 'Verbal', current: 82, baseline: 71 },
  { domain: 'Quantitative', current: 88, baseline: 74 },
  { domain: 'Spatial', current: 71, baseline: 59 },
];

export const ARCHITECTURE_PILLARS: ArchitecturePillar[] = [
  {
    id: 'erp_evidence',
    index: '01',
    shortLabel: 'ERP, Today Desk & Finance 360°',
    title: 'Multi-Tenant School ERP, Today Workspace & Finance 360° Ledgers',
    summary:
      'Replace fragmented attendance registers, notebook checks, timetables, and Excel fee sheets with one school-isolated database. Teachers run One-Go Attendance and 30-second notebook checks from Today Workspace, while Accounts operates a dedicated Finance 360° desk.',
    mechanismChain: [
      'Keyboard-fast One-Go Attendance & whole-class notebook checks (A/B/C) with instant parent sync',
      'Smart Timetable & Leave substitution engine with one-tap teacher cover acknowledgement',
      'Dedicated Finance 360° fee ledger, family sibling alerts, daily closing tally & 30/60/90-day aging queue',
    ],
    measurableOutcome: '1 classroom entry updates 4 institutional records in under 30 seconds',
    imageSrc: '/assets/images/notebook_classroom_learning_1794713009152.jpg',
    imageAlt: 'Handwritten mathematics notebook open on classroom desk',
    ctaLabel: 'Try Teacher Today Workspace',
    recommendedRole: 'teacher',
  },
  {
    id: 'clinical_care',
    index: '02',
    shortLabel: 'Clinical & Developmental Care 360°',
    title: 'Early Developmental Screening, Speech Therapy Engine & RCI Governance',
    summary:
      'Support early identification across 12 developmental domains with parent questionnaires, classroom observation forms, bilingual English/Hindi speech sound therapy plans, and strict ethical clinical boundaries—never issuing automated diagnoses.',
    mechanismChain: [
      'Structured developmental history, parent questionnaire & non-diagnostic teacher observation logs',
      'Individualised Speech-Language Pathologist (SLP) sound-position targets & daily parent home practice',
      'Role-locked clinical privacy with RCI specialist sign-off, informed consent tracking & access audit trail',
    ],
    measurableOutcome: '100% specialist-governed care pathways with zero automated clinical labels',
    imageSrc: '/assets/images/science_lab_collaboration_1794713009857.jpg',
    imageAlt: 'Guided developmental and collaborative student learning session',
    ctaLabel: 'Explore Clinical Care 360°',
    recommendedRole: 'clinical_psychologist',
  },
  {
    id: 'olq_thinking',
    index: '03',
    shortLabel: '15 OLQs & Thinking Suite',
    title: 'Officer Like Qualities, Monthly SSB Thinking Tests & Computer Skills',
    summary:
      'Capture structured developmental evidence across all 15 OLQs without permanent labels. Run monthly class-calibrated SRT (60 situations), WAT (60 words), TAT (11 pictures), PPDT, and grade 1–12 Computer Skills benchmarks.',
    mechanismChain: [
      'Monthly rotating SRT, WAT, TAT & PPDT sets plus daily assigned drills for SSB-enrolled learners',
      'Practical Computer Skills lab with class-level WPM benchmarks & simulated file/clipboard checklists',
      'Fair Learners Score (0–100) where missing evidence is never treated as zero and quiet learners are never labelled Passive',
    ],
    measurableOutcome: '15 evidence-mapped traits + monthly thinking & practical skill records (Classes 1–12)',
    imageSrc: '/assets/images/science_lab_collaboration_1794713009857.jpg',
    imageAlt: 'Students collaborating on a structured science lab activity',
    ctaLabel: 'Explore Thinking & OLQ Lab',
    recommendedRole: 'student',
  },
  {
    id: 'vcip_cognitive',
    index: '04',
    shortLabel: 'Cognitive Profile & Brain Gym',
    title: 'Rai Plus Cognitive Intelligence Profile (VCIP) & 5-Minute Daily Brain Gym',
    summary:
      'Original, non-clinical assessments across six distinct cognitive domains—Fluid, Memory, Speed, Verbal (EN/HI), Quantitative, and Spatial—paired with a 5-exercise Daily Brain Gym embedded directly in the student dashboard.',
    mechanismChain: [
      'Six original visual, memory, symbol-matching, bilingual verbal, quantitative & 3D spatial modules',
      'Separate EN / हिन्दी language indicators and speed-vs-accuracy tracking with zero IQ conversion',
      'Daily Brain Gym tracks consecutive streaks strictly separate from formal VCIP developmental scores',
    ],
    measurableOutcome: '6 cognitive domains tracked longitudinally via radar & multi-cycle grouped bar charts',
    ctaLabel: 'Preview VCIP Cognitive Profile',
    recommendedRole: 'student',
  },
  {
    id: 'mindmaps_career',
    index: '05',
    shortLabel: 'Mindmaps & Career Guidance',
    title: 'Chapter Knowledge Mindmaps, Flowcharts & Counsellor-Reviewed Careers',
    summary:
      'Turn every HBSE, NCERT, and SCERT textbook chapter into an interactive visual mindmap, flowchart, and quick-revision sheet—connected to non-exclusionary career pathway briefs reviewed by qualified human counsellors.',
    mechanismChain: [
      'Interactive zoomable chapter mindmaps & step-by-step concept flowcharts for every class & subject',
      'Students pick their preferred revision format: Flowchart, Mindmap, Summary Notes, or Formula Sheet',
      'Exploratory CUET, JEE, NEET, CLAT & NDA stream indicators reviewed by human Career Counsellors',
    ],
    measurableOutcome: 'Every chapter visualised + human-reviewed stream & exam guidance for Classes 8–12',
    imageSrc: '/assets/images/career_counselling_session_1794713007994.jpg',
    imageAlt: 'Career counsellor reviewing academic stream charts with student',
    ctaLabel: 'Explore Career Intelligence',
    recommendedRole: 'counsellor',
  },
];

export const STAKEHOLDER_WORKSPACES: StakeholderWorkspacePreview[] = [
  {
    id: 'principal',
    label: 'Principals',
    roleTitle: 'Institutional Command & Morning Decision Inbox',
    targetRole: 'principal',
    headline: 'Complete school visibility across approvals, attendance, substitute covers, and fees.',
    summary:
      'Clear pending teacher leaves, publish substitute covers with live teacher acknowledgement tracking, approve accounting/payroll items, and release Student 360° reports from one unified morning inbox.',
    dailyWorkflows: [
      {
        title: 'Needs Your Decision Inbox',
        detail: 'Consolidates leaves, draft substitute covers, accounting approvals, and report sign-offs at the top of the dashboard.',
      },
      {
        title: 'Live Substitute Cover Tracking',
        detail: 'Monitor adjusted periods and confirm when each substitute teacher acknowledges cover duty.',
      },
      {
        title: 'Multi-School Tenant Isolation',
        detail: 'Keep every campus ledger, student record, and audit trail strictly partitioned by school code.',
      },
    ],
    keyMetricLabel: 'Governance Scope',
    keyMetricValue: '100% Audit-Logged',
    ctaLabel: 'Launch Principal Workspace',
  },
  {
    id: 'teacher',
    label: 'Teachers',
    roleTitle: 'Today Workspace · Zero-Duplication Teaching Desk',
    targetRole: 'teacher',
    headline: 'Spend time teaching—not copying attendance and remarks across five registers.',
    summary:
      'Start every morning in Today Workspace with your daily timetable, top adjusted substitute periods, keyboard-fast One-Go Attendance, 30-second notebook checks, lesson plans, and admissions/home-visit logging.',
    dailyWorkflows: [
      {
        title: 'Today Workspace & Substitute Covers',
        detail: 'See daily periods, acknowledge assigned substitute covers in 1 tap, and jump straight to class roll call.',
      },
      {
        title: 'Keyboard-Fast Attendance & Notebooks',
        detail: 'Use P/A/L and A/B/C keys with sticky bulk-save bars to finish a full class in under 30 seconds.',
      },
      {
        title: 'Admissions & Home Visits Access',
        detail: 'Log prospective student enquiries, schedule family home visits, and track conversion follow-ups.',
      },
    ],
    keyMetricLabel: 'Entry Time Saved',
    keyMetricValue: '30 sec / class',
    ctaLabel: 'Launch Teacher Workspace',
  },
  {
    id: 'accountant',
    label: 'Accounts',
    roleTitle: 'Finance 360° · Strictly Finance-Only Desk',
    targetRole: 'accountant',
    headline: 'Dedicated fee collections, daily closing tally, and overdue aging—zero academic clutter.',
    summary:
      'Operate a focused accounting workspace built around Cash/UPI/Bank daily closing tallies, 30/60/90-day overdue follow-up reminders, sibling family ledgers, payroll preparation, and bank reconciliation.',
    dailyWorkflows: [
      {
        title: 'Daily Closing Tally & CSV Export',
        detail: 'Reconcile Cash, UPI/QR, Bank/Cheque inflows against expenses and print an end-of-day closing sheet.',
      },
      {
        title: '30/60/90-Day Overdue Aging Queue',
        detail: 'Filter pending fee accounts by aging bracket and copy ready-to-send guardian reminders in one click.',
      },
      {
        title: 'Segregation of Duties Controls',
        detail: 'Prepare vouchers and payroll registers cleanly while Principal approval locks finalised periods.',
      },
    ],
    keyMetricLabel: 'Ledger Isolation',
    keyMetricValue: 'Finance-Only Scope',
    ctaLabel: 'Launch Accounts Workspace',
  },
  {
    id: 'clinical',
    label: 'Clinical (RCI)',
    roleTitle: 'Developmental Screening & Speech Therapy 360°',
    targetRole: 'clinical_psychologist',
    headline: 'Structured screening, bilingual speech therapy plans, and strict clinical confidentiality.',
    summary:
      'Coordinate RCI-registered psychologists, SLPs, audiologists, and special educators with informed consent logs, sound-position speech therapy progressions, and authorized non-clinical classroom guidance.',
    dailyWorkflows: [
      {
        title: '12-Domain Early Screening Workflows',
        detail: 'Combine developmental history, parent questionnaires, and observable classroom logs with non-diagnostic workflow statuses.',
      },
      {
        title: 'Speech Therapy Intelligence Engine',
        detail: 'Track English & Hindi phonetic targets across initial/medial/final positions and share safe home practice tips.',
      },
      {
        title: 'Strict Role & Audit Governance',
        detail: 'Clinical reports stay confidential to authorized specialists while sharing plain-language summaries only on consent.',
      },
    ],
    keyMetricLabel: 'Clinical Boundary',
    keyMetricValue: 'RCI Specialist Led',
    ctaLabel: 'Launch Clinical Workspace',
  },
  {
    id: 'student',
    label: 'Students (1–12)',
    roleTitle: 'Daily Brain Gym, Mindmaps & Skill Growth',
    targetRole: 'student',
    headline: 'Build sharp reasoning habits, master chapters visually, and track your own growth.',
    summary:
      'Start every day with a 5-exercise Daily Brain Gym on your dashboard, revise chapters using interactive flowcharts, and take VCIP, SRT/WAT/TAT/PPDT, and Computer Skill benchmarks.',
    dailyWorkflows: [
      {
        title: '5-Domain Daily Brain Gym',
        detail: 'Complete one quick Fluid, Memory, Quantitative, Verbal (EN/HI), and Spatial exercise daily to build streaks.',
      },
      {
        title: 'Interactive Chapter Mindmaps & Flowcharts',
        detail: 'Understand entire NCERT/HBSE chapters visually in minutes before unit tests.',
      },
      {
        title: 'VCIP, Thinking & Computer Skills Suite',
        detail: 'Measure cognitive growth over time, practice monthly SSB sets, and hit grade-level typing targets.',
      },
    ],
    keyMetricLabel: 'Daily Cognitive Habit',
    keyMetricValue: '5–10 min / day',
    ctaLabel: 'Launch Student Workspace',
  },
  {
    id: 'parent',
    label: 'Parents',
    roleTitle: '30-Second Bilingual Family Progress Portal',
    targetRole: 'parent',
    headline: 'See attendance, homework, and one simple home tip—in English or हिन्दी.',
    summary:
      'Switch between children in one tap, check the 30-second weekly digest, acknowledge daily attendance notifications, print office-ready progress summaries, and view family fee receipts safely.',
    dailyWorkflows: [
      {
        title: 'This Week at a Glance (EN / हिन्दी)',
        detail: 'See attendance, pending homework, and one calm daily home practice suggestion in plain language.',
      },
      {
        title: 'Pinned Multi-Child Sibling Switcher',
        detail: 'Compare siblings together or switch to a single child’s report and print summary in one click.',
      },
      {
        title: 'Approved 360° Progress & Fee Ledger',
        detail: 'Track developmental strengths without harsh labels while confidential specialist notes remain protected.',
      },
    ],
    keyMetricLabel: 'Privacy Boundary',
    keyMetricValue: 'Strict Family Scope',
    ctaLabel: 'Launch Parent Workspace',
  },
  {
    id: 'counsellor',
    label: 'Counsellors',
    roleTitle: 'Human-Guided Student & Public Advisory',
    targetRole: 'counsellor',
    headline: 'Combine cognitive profiles, OLQ trajectories, and student interests into ethical career guidance.',
    summary:
      'Review VCIP cognitive domain profiles, attach private counsellor observations, and guide both enrolled students and public applicants across CUET, JEE, NEET, CLAT, and NDA pathways.',
    dailyWorkflows: [
      {
        title: 'Cross-Layer Cognitive & OLQ Context',
        detail: 'Inspect separate Layer 1 Cognitive (VCIP) and Layer 2 OLQ evidence without conflating personality with ability.',
      },
      {
        title: 'Confidential Counsellor Observations',
        detail: 'Record timestamped professional notes kept strictly separated from general classroom views.',
      },
      {
        title: 'Public & School Career Advisory Queue',
        detail: 'Manage incoming career counselling bookings and non-exclusionary stream exploration briefs.',
      },
    ],
    keyMetricLabel: 'Guidance Standard',
    keyMetricValue: 'Human-Reviewed',
    ctaLabel: 'Launch Counsellor Workspace',
  },
];

export const PUBLIC_BRAIN_GYM_SAMPLES: PublicBrainGymSampleItem[] = [
  {
    id: 'bg-fluid',
    domain: 'Fluid Pattern',
    prompt: 'Look at the number pattern: 3, 6, 12, 24, ___. Which number comes next?',
    options: ['36', '42', '48', '54'],
    correctIndex: 2,
    explanation: 'Each step doubles the previous number (24 × 2 = 48).',
  },
  {
    id: 'bg-quant',
    domain: 'Quantitative Speed',
    prompt: 'A school library has 7 shelves with 18 books on each shelf. How many books are there in total?',
    options: ['116', '126', '132', '144'],
    correctIndex: 1,
    explanation: '7 × 10 = 70 and 7 × 8 = 56, so 70 + 56 = 126 books.',
  },
  {
    id: 'bg-verbal',
    domain: 'Verbal Logic',
    prompt: 'Thermometer is to Temperature as Compass is to ___.',
    options: ['Speed', 'Direction', 'Weight', 'Distance'],
    correctIndex: 1,
    explanation: 'A thermometer measures temperature; a compass indicates direction.',
  },
];

export const PUBLIC_MINDMAP_SAMPLES: PublicMindMapTopic[] = [
  {
    id: 'mm-science',
    subject: 'Science (NCERT / HBSE)',
    classLabel: 'Class 9',
    title: 'Force & Laws of Motion',
    coreIdea: 'An external unbalanced force changes an object’s state of rest, speed, or direction.',
    branches: [
      {
        id: 'b1',
        heading: '1st Law · Inertia',
        keyPoint: 'Objects resist any change in their state of rest or uniform motion.',
        formulaOrExample: 'Example: Passengers lean forward when a bus brakes suddenly.',
      },
      {
        id: 'b2',
        heading: '2nd Law · Momentum',
        keyPoint: 'Rate of change of momentum is directly proportional to applied unbalanced force.',
        formulaOrExample: 'Formula: F = m × a (Unit: Newton, N)',
      },
      {
        id: 'b3',
        heading: '3rd Law · Action–Reaction',
        keyPoint: 'Every action has an equal and opposite reaction acting on two different bodies.',
        formulaOrExample: 'Example: Swimmer pushes water backward to glide forward.',
      },
      {
        id: 'b4',
        heading: 'Conservation of Momentum',
        keyPoint: 'Total momentum of an isolated system remains constant before and after collision.',
        formulaOrExample: 'Formula: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂',
      },
    ],
  },
  {
    id: 'mm-math',
    subject: 'Mathematics (NCERT / HBSE)',
    classLabel: 'Class 10',
    title: 'Quadratic Equations',
    coreIdea: 'Any polynomial equation of degree 2 written in standard form ax² + bx + c = 0 (a ≠ 0).',
    branches: [
      {
        id: 'm1',
        heading: 'Standard Form',
        keyPoint: 'Identify coefficients a, b, and constant term c cleanly before solving.',
        formulaOrExample: 'Example: 2x² − 7x + 3 = 0 → a = 2, b = −7, c = 3',
      },
      {
        id: 'm2',
        heading: 'Factorisation Method',
        keyPoint: 'Split the middle term bx into two numbers whose product equals a × c.',
        formulaOrExample: '2x² − 6x − x + 3 = 0 → (2x − 1)(x − 3) = 0',
      },
      {
        id: 'm3',
        heading: 'Quadratic Formula',
        keyPoint: 'Works for every quadratic equation when factorisation is not obvious.',
        formulaOrExample: 'x = (−b ± √(b² − 4ac)) / 2a',
      },
      {
        id: 'm4',
        heading: 'Discriminant (D)',
        keyPoint: 'Determines the nature of roots before solving.',
        formulaOrExample: 'D > 0: 2 distinct real roots · D = 0: equal roots · D < 0: no real roots',
      },
    ],
  },
];

export const PUBLIC_FAQ_ITEMS: PublicFaqItem[] = [
  {
    id: 'faq-diagnosis',
    questionEn: 'Does Rai Plus automatically diagnose autism, ADHD, or learning disorders?',
    questionHi: 'क्या Rai Plus अपने-आप ऑटिज़्म, ADHD या किसी विकार का निदान (diagnosis) करता है?',
    answerEn:
      'No. The platform strictly supports early developmental screening, teacher/parent observation logs, and specialist referrals. Only qualified RCI/medical professionals can make clinical diagnoses within their scope of practice.',
    answerHi:
      'नहीं। यह प्लेटफ़ॉर्म केवल प्रारंभिक विकास स्क्रीनिंग, अभिभावक/शिक्षक अवलोकन और विशेषज्ञ रेफरल में सहायता करता है। क्लिनिकल निदान केवल योग्य आरसीआई/चिकित्सा विशेषज्ञ ही कर सकते हैं।',
  },
  {
    id: 'faq-privacy',
    questionEn: 'Who can view confidential clinical notes, speech therapy logs, and counsellor observations?',
    questionHi: 'गोपनीय क्लिनिकल नोट्स, स्पीच थेरेपी रिकॉर्ड और काउंसलर टिप्पणियाँ कौन देख सकता है?',
    answerEn:
      'Clinical records are strictly role-locked to authorised specialists (Clinical Psychologists, SLPs, Audiologists, Special Educators) with consent tracking and access audit logs. Teachers only see safe classroom guidance, and Accounts staff have zero access to academic or clinical records.',
    answerHi:
      'क्लिनिकल रिकॉर्ड केवल अधिकृत विशेषज्ञों के लिए सुरक्षित रहते हैं और हर एक्सेस का ऑडिट लॉग बनता है। शिक्षकों को केवल कक्षा सहायता सुझाव दिखते हैं, और एकाउंट्स विभाग के पास अकादमिक या क्लिनिकल डेटा की कोई पहुँच नहीं होती।',
  },
  {
    id: 'faq-fees',
    questionEn: 'Can our Accounts team migrate existing Excel fee sheets and track daily Cash/UPI closing?',
    questionHi: 'क्या हमारी एकाउंट्स टीम पुरानी एक्सेल फीस शीट आयात कर सकती है और रोज़ का कैश/UPI हिसाब देख सकती है?',
    answerEn:
      'Yes. Finance 360° supports family sibling ledgers, monthly demand sheets, Cash/UPI/Bank daily closing tallies with CSV export, 30/60/90-day overdue fee aging queues, and Principal approval workflows for vouchers and payroll.',
    answerHi:
      'हाँ। Finance 360° में परिवार/भाई-बहन फीस लेजर, रोज़ का कैश/UPI/बैंक क्लोज़िंग मिलान, CSV एक्सपोर्ट, 30/60/90 दिन बकाया रिमाइंडर कतार और प्रिंसिपल अनुमोदन शामिल हैं।',
  },
  {
    id: 'faq-board',
    questionEn: 'Is the platform aligned with HBSE, NCERT, SCERT, UDISE+, and Haryana MIS?',
    questionHi: 'क्या यह सिस्टम HBSE, NCERT, SCERT, UDISE+ और हरियाणा MIS के अनुरूप है?',
    answerEn:
      'Yes. Every school tenant stores its UDISE+ and Haryana MIS codes, maps chapter mindmaps and lesson plans to HBSE/NCERT syllabi across Classes 1–12, and exports compliance-ready registers.',
    answerHi:
      'हाँ। हर स्कूल के अपने UDISE+ और हरियाणा MIS कोड सुरक्षित रहते हैं, कक्षा 1–12 के पाठ व माइंडमैप HBSE/NCERT के अनुसार हैं, और रजिस्टर सीधे एक्सपोर्ट किए जा सकते हैं।',
  },
  {
    id: 'faq-mobile',
    questionEn: 'How easy is it for teachers and parents to use on regular Android smartphones?',
    questionHi: 'क्या शिक्षक और अभिभावक इसे सामान्य एंड्रॉयड स्मार्टफोन पर आसानी से उपयोग कर सकते हैं?',
    answerEn:
      'Both Teacher Today Workspace and the Bilingual Parent Portal are designed for fast mobile and low-bandwidth use—with thumb-friendly bottom navigation, 30-second One-Go Attendance, and a plain-language English/Hindi weekly digest.',
    answerHi:
      'जी हाँ। टीचर टुडे वर्कस्पेस और द्विभाषी अभिभावक पोर्टल मोबाइल के लिए सरल बनाए गए हैं—नीचे त्वरित नेविगेशन बार, 30-सेकंड उपस्थिति और हिंदी/अंग्रेज़ी साप्ताहिक सारांश के साथ।',
  },
  {
    id: 'faq-isolation',
    questionEn: 'If we run multiple campuses, is every school’s student and fee data strictly isolated?',
    questionHi: 'यदि हमारे एक से अधिक स्कूल कैंपस हैं, तो क्या हर स्कूल का डेटा पूरी तरह अलग रहता है?',
    answerEn:
      'Yes. Every campus operates as an isolated tenant with its own school code, faculty roster, student records, fee accounts, and audit logs. Staff only access their assigned campus.',
    answerHi:
      'हाँ। हर कैंपस का अलग स्कूल कोड, स्टाफ सूची, छात्र रिकॉर्ड, फीस खाता और ऑडिट लॉग होता है। स्टाफ केवल अपने निर्धारित स्कूल का डेटा ही देख सकता है।',
  },
];

export interface CareerFormDraft {
  applicantName: string;
  email: string;
  phone: string;
  currentStage: string;
  goalSummary: string;
}

export interface EnquiryFormDraft {
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

export interface ParentAdmissionFormDraft {
  studentName: string;
  applyingClass: string;
  parentName: string;
  phone: string;
  email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCareerForm(draft: CareerFormDraft): string | null {
  if (
    !draft.applicantName.trim() ||
    !draft.email.trim() ||
    !draft.phone.trim() ||
    !draft.currentStage.trim() ||
    !draft.goalSummary.trim()
  ) {
    return 'Please complete your name, email, phone, current educational stage, and career question.';
  }
  if (!EMAIL_PATTERN.test(draft.email.trim())) {
    return 'Please enter a valid email address so our counsellor can share your advisory brief.';
  }
  if (draft.phone.replace(/\D/g, '').length < 8) {
    return 'Please enter a valid phone or WhatsApp number (at least 8 digits).';
  }
  return null;
}

export function validateEnquiryForm(draft: EnquiryFormDraft): string | null {
  if (
    !draft.contactName.trim() ||
    !draft.email.trim() ||
    !draft.phone.trim() ||
    !draft.message.trim()
  ) {
    return 'Contact name, email, phone number, and message are required.';
  }
  if (!EMAIL_PATTERN.test(draft.email.trim())) {
    return 'Please enter a valid institutional or personal email address.';
  }
  if (draft.phone.replace(/\D/g, '').length < 8) {
    return 'Please enter a valid phone number (at least 8 digits).';
  }
  return null;
}

export function validateParentAdmissionForm(draft: ParentAdmissionFormDraft): string | null {
  if (
    !draft.studentName.trim() ||
    !draft.applyingClass.trim() ||
    !draft.parentName.trim() ||
    !draft.phone.trim()
  ) {
    return 'Student name, applying class, parent name, and mobile number are required.';
  }
  if (draft.phone.replace(/\D/g, '').length < 8) {
    return 'Please enter a valid mobile or WhatsApp number (at least 8 digits).';
  }
  if (draft.email?.trim() && !EMAIL_PATTERN.test(draft.email.trim())) {
    return 'Please enter a valid email address or leave email blank.';
  }
  return null;
}

export function findDemoAccountForRole(
  demoAccounts: PublicDemoAccount[],
  role: UserRole,
): PublicDemoAccount | null {
  if (!demoAccounts || demoAccounts.length === 0) return null;
  const preferredVis = demoAccounts.find(
    (acc) => acc.role === role && acc.schoolId === 'school-vis-jjr',
  );
  if (preferredVis) return preferredVis;
  return demoAccounts.find((acc) => acc.role === role) || null;
}
