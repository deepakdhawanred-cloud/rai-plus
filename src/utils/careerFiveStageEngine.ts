import type {
  BudgetBypassPathway,
  CareerBudgetInput,
  CareerBudgetResult,
  CareerCapacityResult,
  CareerMarketOpportunity,
  CareerMatchedOpportunity,
  CareerPersonalityInput,
  CareerPersonalityResult,
  CareerRoadmapMilestone,
  FinancialCapacityTier,
} from '../types/flagshipProducts';

// ============================================================================
// STAGE 1: CAPACITY ASSESSMENT QUESTIONS (IQ / EQ / AQ / CQ)
// Transparent, non-clinical educational skill-discovery questions
// ============================================================================

export interface CapacityQuestion {
  id: string;
  dimension: 'iq_logical' | 'iq_numerical' | 'iq_verbal' | 'iq_abstract' | 'iq_pattern' | 'iq_spatial' | 'eq' | 'aq' | 'cq';
  label: string;
  prompt: string;
  options: Array<{ text: string; score: number }>;
}

export const STAGE1_CAPACITY_QUESTIONS: CapacityQuestion[] = [
  {
    id: 'cap-iq-log',
    dimension: 'iq_logical',
    label: 'IQ · Logical Reasoning',
    prompt: 'All certified solar technicians complete safety training. Some electronics graduates are certified solar technicians. Which statement MUST be true?',
    options: [
      { text: 'Some electronics graduates have completed safety training.', score: 100 },
      { text: 'All electronics graduates are certified solar technicians.', score: 25 },
      { text: 'No safety trainees are electronics graduates.', score: 15 },
      { text: 'All safety trainees are electronics graduates.', score: 25 },
    ],
  },
  {
    id: 'cap-iq-num',
    dimension: 'iq_numerical',
    label: 'IQ · Numerical Reasoning',
    prompt: 'A student scholarship covers 40% of a ₹1,50,000 annual fee, and an additional ₹15,000 state grant applies to the remainder. What is the net annual fee payable?',
    options: [
      { text: '₹75,000', score: 100 },
      { text: '₹90,000', score: 45 },
      { text: '₹81,000', score: 35 },
      { text: '₹60,000', score: 25 },
    ],
  },
  {
    id: 'cap-iq-ver',
    dimension: 'iq_verbal',
    label: 'IQ · Verbal Reasoning',
    prompt: 'Which sentence expresses a verified market insight most accurately without overclaiming?',
    options: [
      { text: 'Public labour surveys indicate rising demand for cloud security engineers, though entry still requires demonstrable projects.', score: 100 },
      { text: 'Every computer graduate is guaranteed a high-paying cloud security job immediately.', score: 20 },
      { text: 'Cloud security is easy and requires no formal practice.', score: 15 },
      { text: 'Only people with expensive foreign degrees can enter cloud security.', score: 20 },
    ],
  },
  {
    id: 'cap-iq-pat',
    dimension: 'iq_pattern',
    label: 'IQ · Pattern Recognition',
    prompt: 'Find the next number in the growth series: 3, 7, 15, 31, 63, ?',
    options: [
      { text: '127', score: 100 },
      { text: '125', score: 40 },
      { text: '95', score: 25 },
      { text: '126', score: 35 },
    ],
  },
  {
    id: 'cap-iq-abs',
    dimension: 'iq_abstract',
    label: 'IQ · Abstract & Analytical',
    prompt: 'If Process A halves error rate but doubles turnaround time, and Process B trims turnaround time by 30% with equal accuracy, which best fits emergency triage?',
    options: [
      { text: 'Process B for rapid triage, reserving Process A for high-risk confirmatory checks.', score: 100 },
      { text: 'Always use Process A regardless of urgency.', score: 45 },
      { text: 'Discard both processes without testing.', score: 15 },
      { text: 'Choose purely by whichever costs more.', score: 15 },
    ],
  },
  {
    id: 'cap-iq-spa',
    dimension: 'iq_spatial',
    label: 'IQ · Spatial Reasoning',
    prompt: 'A cube painted blue on all 6 faces is sliced cleanly into 27 equal smaller cubes (3×3×3). How many small cubes have ZERO blue faces?',
    options: [
      { text: '1 (only the centre cube)', score: 100 },
      { text: '6', score: 35 },
      { text: '8', score: 25 },
      { text: '0', score: 20 },
    ],
  },
  {
    id: 'cap-eq-1',
    dimension: 'eq',
    label: 'EQ · Empathy & Conflict Resolution',
    prompt: 'During a high-stakes group project, a usually reliable teammate snaps angrily at everyone and misses a deadline. Your best first step is:',
    options: [
      { text: 'Speak calmly one-on-one to understand what is overwhelming them, then rebalance immediate deliverables together.', score: 96 },
      { text: 'Publicly reprimand them in the group chat so everyone sees accountability.', score: 35 },
      { text: 'Silently redo all their work without talking to them.', score: 58 },
      { text: 'Report them immediately without asking what happened.', score: 45 },
    ],
  },
  {
    id: 'cap-eq-2',
    dimension: 'eq',
    label: 'EQ · Emotional Regulation',
    prompt: 'An interviewer challenges your project sharply and points out a genuine mistake. How do you react?',
    options: [
      { text: 'Stay composed, acknowledge the gap honestly, explain what you learned, and outline how you would fix it.', score: 96 },
      { text: 'Defend your original answer loudly so you do not appear weak.', score: 30 },
      { text: 'Freeze up and apologize repeatedly for the rest of the interview.', score: 42 },
      { text: 'Blame your teammate or college syllabus for the mistake.', score: 25 },
    ],
  },
  {
    id: 'cap-aq-1',
    dimension: 'aq',
    label: 'AQ · Recovery After Setback',
    prompt: 'You fail to clear a competitive entrance exam you prepared 8 months for. Within two weeks, what do you do?',
    options: [
      { text: 'Audit section-wise score gaps, build a targeted 90-day corrective plan, and evaluate parallel entry routes.', score: 96 },
      { text: 'Quit all structured preparation because the system feels unfair.', score: 25 },
      { text: 'Repeat the exact same study timetable without diagnosing mistakes.', score: 52 },
      { text: 'Switch impulsively to a totally unrelated field overnight.', score: 40 },
    ],
  },
  {
    id: 'cap-aq-2',
    dimension: 'aq',
    label: 'AQ · Ownership Under Stress',
    prompt: 'Your family budget tightens unexpectedly mid-year while you are preparing for higher studies. How do you respond?',
    options: [
      { text: 'Map verified scholarships, public institutions, and part-time skill income while keeping your core goal intact.', score: 96 },
      { text: 'Pause all learning indefinitely until finances return to normal.', score: 38 },
      { text: 'Take an unverified high-interest informal loan immediately.', score: 25 },
      { text: 'Hide the difficulty and hope it resolves itself.', score: 30 },
    ],
  },
  {
    id: 'cap-cq-1',
    dimension: 'cq',
    label: 'CQ · Creative Problem-Solving',
    prompt: 'Your town has high agricultural waste and rising local electricity outages. Which idea best connects unrelated concepts?',
    options: [
      { text: 'Pilot a community biomass-briquette micro-generator partnering local farmers with polytechnic students.', score: 96 },
      { text: 'Wait exclusively for a distant corporate grant to arrive.', score: 35 },
      { text: 'Import expensive diesel generators with no fuel plan.', score: 42 },
      { text: 'Write an essay complaining about both problems separately.', score: 48 },
    ],
  },
  {
    id: 'cap-cq-2',
    dimension: 'cq',
    label: 'CQ · Idea Generation & Flexibility',
    prompt: 'When asked to solve a familiar problem with half the normal budget, you naturally:',
    options: [
      { text: 'Brainstorm 4–5 unconventional open-source/local combinations, test the leanest one fast, and iterate.', score: 96 },
      { text: 'Declare the task impossible until full budget is restored.', score: 28 },
      { text: 'Copy last year’s method and cut quality in half.', score: 48 },
      { text: 'Ask someone else to decide every single detail.', score: 38 },
    ],
  },
];

export function evaluateStage1Capacity(answers: Record<string, number>): CareerCapacityResult {
  const get = (id: string) => {
    const q = STAGE1_CAPACITY_QUESTIONS.find((x) => x.id === id);
    const idx = answers[id];
    if (!q || idx == null || !q.options[idx]) return 60;
    return q.options[idx]!.score;
  };

  const subdomains = {
    logical: get('cap-iq-log'),
    numerical: get('cap-iq-num'),
    verbal: get('cap-iq-ver'),
    abstract: get('cap-iq-abs'),
    pattern: get('cap-iq-pat'),
    spatial: get('cap-iq-spa'),
  };
  const iqOverall = Math.round(
    Object.values(subdomains).reduce((a, b) => a + b, 0) / Object.values(subdomains).length,
  );
  const eqOverall = Math.round((get('cap-eq-1') + get('cap-eq-2')) / 2);
  const aqOverall = Math.round((get('cap-aq-1') + get('cap-aq-2')) / 2);
  const cqOverall = Math.round((get('cap-cq-1') + get('cap-cq-2')) / 2);

  const dims = [
    { name: 'Analytical & Problem-Solving Capacity (IQ)', score: iqOverall },
    { name: 'Emotional & Interpersonal Intelligence (EQ)', score: eqOverall },
    { name: 'Adversity Resilience & Ownership (AQ)', score: aqOverall },
    { name: 'Creative & Cross-Domain Thinking (CQ)', score: cqOverall },
  ].sort((a, b) => b.score - a.score);

  const strengthAreas = dims.filter((d) => d.score >= 70).map((d) => `${d.name} (${d.score}%)`);
  const developingAreas = dims.filter((d) => d.score < 70).map((d) => `${d.name} (${d.score}%)`);
  if (strengthAreas.length === 0) strengthAreas.push(`${dims[0]!.name} (${dims[0]!.score}%)`);

  const suggestedClusters: string[] = [];
  if (iqOverall >= 70) suggestedClusters.push('Software, Data & Engineering', 'Finance & Quantitative Policy');
  if (eqOverall >= 70) suggestedClusters.push('Healthcare, Education & Leadership', 'Public Services & Management');
  if (aqOverall >= 70) suggestedClusters.push('Armed Forces & Defence Officer Entry', 'Entrepreneurship & Field Operations');
  if (cqOverall >= 70) suggestedClusters.push('Product Design, ClimateTech & Creative Tech', 'Research & Innovation');
  if (suggestedClusters.length === 0) suggestedClusters.push('Skilled Technical & Applied Operations', 'Business & Administration');

  return {
    iq: { overallPct: iqOverall, subdomains },
    eq: {
      overallPct: eqOverall,
      strengths: eqOverall >= 75 ? ['Calm conflict de-escalation', 'Constructive response to feedback'] : ['Foundational empathy'],
      developing: eqOverall < 75 ? ['Active listening under critique', 'Structured difficult conversations'] : ['Executive stakeholder influence'],
    },
    aq: {
      overallPct: aqOverall,
      resilienceBand: aqOverall >= 80 ? 'High Adaptability' : aqOverall >= 60 ? 'Steady Recovery' : 'Building Resilience',
      indicators: aqOverall >= 75 ? ['Diagnoses setbacks objectively', 'Builds fallback routes proactively'] : ['Benefits from structured milestone recovery plans'],
    },
    cq: {
      overallPct: cqOverall,
      innovationStyle: cqOverall >= 75 ? 'Cross-Domain Builder & Resourceful Innovator' : 'Structured Practical Improver',
      indicators: cqOverall >= 75 ? ['Connects disparate domains cleanly', 'Iterates lean prototypes'] : ['Strengthen lateral brainstorming exercises'],
    },
    strengthAreas,
    developingAreas: developingAreas.length > 0 ? developingAreas : ['Continue deepening specialized domain projects across all 4 dimensions'],
    evidenceSummary: [
      `IQ sub-scores: Logical ${subdomains.logical}%, Numerical ${subdomains.numerical}%, Verbal ${subdomains.verbal}%, Pattern ${subdomains.pattern}%, Abstract ${subdomains.abstract}%, Spatial ${subdomains.spatial}%.`,
      `Non-clinical educational profile: multi-dimensional indicators are meant for career exploration, never a single fixed label.`,
    ],
    suggestedExercises: [
      'Solve 15 timed analytical & real-world case problems weekly.',
      'Practice structured 2-minute explanation of complex ideas to build EQ + communication clarity.',
      'Build one mini practical project under real constraints (zero budget) to boost AQ & CQ.',
    ],
    suggestedClusters: Array.from(new Set(suggestedClusters)),
    completedAt: new Date().toISOString(),
  };
}

export const CAREER_INTELLIGENCE_ETHICAL_DISCLAIMER =
  'Educational Career Guidance Only: Rai Plus Career Intelligence provides structured self-discovery, verified public scholarship references, and realistic market planning. It is NOT a guarantee of college admission, scholarship approval, visa grant, employment, or salary outcome.';

// ============================================================================
// STAGE 2: PERSONALITY & WORKING ENVIRONMENT FIT (12 Environments)
// ============================================================================

export function evaluateStage2Personality(input: CareerPersonalityInput): CareerPersonalityResult {
  const envScores = [
    {
      environment: 'Technology & Product Engineering',
      score: Math.round((input.independence * 16 + input.creativityDrive * 18 + (6 - input.routineTolerance) * 10 + input.pressureComposure * 14 + 40) / 1.4),
      why: 'Matches independent problem-solving, continuous learning, and rapid prototyping.',
    },
    {
      environment: 'Armed Forces & Defence Leadership',
      score: Math.round((input.leadershipDrive * 22 + input.teamOrientation * 18 + input.structurePreference * 16 + input.pressureComposure * 22 + input.competitiveDrive * 12) / 4.5),
      why: 'Aligns with disciplined structure, mission teamwork, leadership, and composure under pressure.',
    },
    {
      environment: 'Government & Civil Services',
      score: Math.round((input.structurePreference * 22 + input.routineTolerance * 16 + input.leadershipDrive * 16 + input.pressureComposure * 16 + (input.topMotivation === 'Impact & Service' ? 20 : 8)) / 4.2),
      why: 'Rewards institutional governance, public policy impact, and structured responsibility.',
    },
    {
      environment: 'Entrepreneurship & Startups',
      score: Math.round((input.riskTolerance * 24 + input.independence * 20 + input.creativityDrive * 20 + input.leadershipDrive * 18 + input.pressureComposure * 12) / 4.6),
      why: 'Fits high autonomy, comfort with ambiguity, and building from zero to one.',
    },
    {
      environment: 'Corporate Office & Consulting',
      score: Math.round((input.extroversion * 18 + input.competitiveDrive * 20 + input.teamOrientation * 18 + input.structurePreference * 14 + input.pressureComposure * 16) / 4.3),
      why: 'Suits collaborative business teams, measurable KPIs, and client-facing growth.',
    },
    {
      environment: 'Research & Academia',
      score: Math.round((input.independence * 22 + (6 - input.extroversion) * 14 + input.creativityDrive * 18 + input.structurePreference * 14 + (input.topMotivation === 'Mastery & Innovation' ? 22 : 10)) / 4.3),
      why: 'Supports deep uninterrupted inquiry, evidence-based discovery, and mentoring.',
    },
    {
      environment: 'Healthcare & Clinical Care',
      score: Math.round((input.teamOrientation * 20 + input.pressureComposure * 22 + input.structurePreference * 16 + (input.topMotivation === 'Impact & Service' ? 24 : 10) + (input.communicationStyle === 'Empathetic & Collaborative' ? 14 : 6)) / 4.5),
      why: 'Combines human empathy, calm decision-making, and tangible service outcomes.',
    },
    {
      environment: 'Creative Industries & Design',
      score: Math.round((input.creativityDrive * 28 + (6 - input.structurePreference) * 18 + (6 - input.routineTolerance) * 16 + input.independence * 16) / 4.0),
      why: 'Thrives on original expression, flexible workflows, and visual storytelling.',
    },
    {
      environment: 'Field Operations & Infrastructure',
      score: Math.round((input.extroversion * 16 + input.pressureComposure * 20 + input.teamOrientation * 18 + (6 - input.routineTolerance) * 16 + (input.learningEnvironment === 'Hands-on Labs & Field' ? 20 : 8)) / 4.3),
      why: 'Engages active, hands-on coordination outside a static desk.',
    },
    {
      environment: 'Remote Digital & Global Consulting',
      score: Math.round((input.independence * 26 + (6 - input.structurePreference) * 16 + (input.learningEnvironment === 'Self-Paced Digital' ? 22 : 10) + input.creativityDrive * 14) / 4.0),
      why: 'Leverages self-discipline, asynchronous clarity, and borderless opportunities.',
    },
    {
      environment: 'Social Development & Policy',
      score: Math.round((input.teamOrientation * 20 + input.extroversion * 16 + (input.topMotivation === 'Impact & Service' ? 26 : 10) + input.creativityDrive * 14) / 4.1),
      why: 'Matches mission-driven community impact and grassroots stakeholder engagement.',
    },
    {
      environment: 'Skilled Technical & Applied Trades',
      score: Math.round((input.independence * 18 + input.routineTolerance * 16 + (input.learningEnvironment === 'Hands-on Labs & Field' ? 24 : 10) + input.pressureComposure * 16) / 3.9),
      why: 'Rewards tangible craftsmanship, fast employability, and practical mastery.',
    },
  ].map((e) => ({ ...e, fitPct: Math.max(35, Math.min(97, e.score)) }));

  const sorted = [...envScores].sort((a, b) => b.fitPct - a.fitPct);
  const preferredEnvironments = sorted.slice(0, 4).map((e) => ({
    environment: e.environment,
    fitPct: e.fitPct,
    why: e.why,
  }));
  const challengingEnvironments = sorted.slice(-3).map((e) => ({
    environment: e.environment,
    frictionNote: `Lower natural alignment (${e.fitPct}%) with your current structure/risk/interaction preferences — test via short internship before committing.`,
  }));

  const productivityConditions: string[] = [
    input.structurePreference >= 4
      ? 'Clear milestones, defined standards, and predictable review cadences'
      : 'Flexible autonomy with outcome-based ownership instead of micromanagement',
    input.teamOrientation >= 4
      ? 'Collaborative team environment with shared goals'
      : 'Dedicated deep-focus blocks with independent problem ownership',
    `Communication mode centered on ${input.communicationStyle} and ${input.learningEnvironment}`,
  ];

  const dissatisfactionTriggers: string[] = [
    input.routineTolerance <= 2 ? 'Highly repetitive clerical tasks with zero variety' : 'Constant chaotic direction changes without clarity',
    input.riskTolerance <= 2 ? 'Unstable commission-only roles with no baseline security' : 'Overly rigid bureaucracy that blocks new ideas',
  ];

  return {
    input,
    preferredEnvironments,
    challengingEnvironments,
    productivityConditions,
    dissatisfactionTriggers,
    alignedClusters: preferredEnvironments.map((e) => e.environment),
    careerExperiments: [
      `Shadow or interview 2 professionals currently working in ${preferredEnvironments[0]!.environment} for 20 minutes.`,
      `Complete a 1-week real micro-project simulating daily work in ${preferredEnvironments[1]!.environment}.`,
      'Journal your energy levels after collaborative vs solo work sessions for 7 days to validate fit.',
    ],
    completedAt: new Date().toISOString(),
  };
}

// ============================================================================
// STAGE 3: BUDGET & 18-ROUTE BUDGET CONSTRAINT BYPASS ENGINE
// ============================================================================

export const VERIFIED_BUDGET_BYPASS_PATHWAYS: BudgetBypassPathway[] = [
  {
    id: 'bp-nsp-csss',
    category: 'Central Scholarship',
    name: 'Central Sector Scheme of Scholarships (NSP)',
    eligibility: 'Top 20th percentile in Class 12 board exam; family income within prescribed MoE limit.',
    estimatedBenefit: '₹12,000–₹20,000/year directly to student bank account',
    requiredDocuments: ['Class 12 Marksheet', 'Income Certificate', 'Aadhaar', 'Bonafide Institute Certificate'],
    applicationWindow: 'July – October (Annual)',
    officialUrl: 'https://scholarships.gov.in',
    conditions: 'Must maintain minimum 50% marks & 75% attendance for annual renewal.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate'],
  },
  {
    id: 'bp-state-postmatric',
    category: 'State Scholarship',
    name: 'State Post-Matric & Merit-cum-Means Scholarships (e.g., Har-Chhatravratti / State Portals)',
    eligibility: 'Domicile students from eligible income/category brackets enrolled in recognized courses.',
    estimatedBenefit: 'Full/partial tuition reimbursement + maintenance allowance',
    requiredDocuments: ['Domicile / Parivar Pehchan Patra', 'Income Certificate', 'Fee Receipt', 'Previous Marksheet'],
    applicationWindow: 'August – December',
    officialUrl: 'https://scholarships.gov.in',
    conditions: 'Subject to state portal verification and verified institutional affiliation.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited'],
  },
  {
    id: 'bp-pm-vidyalaxmi',
    category: 'Education Loan',
    name: 'PM-Vidyalaxmi / Vidya Lakshmi Collateral-Free Education Loan Portal',
    eligibility: 'Admitted to recognized Indian higher education institutions (QHEIs & accredited colleges).',
    estimatedBenefit: 'Up to ₹7.5L–₹10L collateral-free credit guarantee + interest subvention for eligible income tiers',
    requiredDocuments: ['Admission Letter', 'Fee Schedule', 'KYC & Income Proof', 'Academic Records'],
    applicationWindow: 'Year-round upon confirmed admission',
    officialUrl: 'https://pmvidyalaxmi.co.in',
    conditions: 'Loan approval subject to bank underwriting and verified admission offer.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate', 'Comfortable'],
  },
  {
    id: 'bp-aicte-pragati',
    category: 'Central Scholarship',
    name: 'AICTE Pragati (Girls) & Saksham (Differently-Abled) Technical Scholarships',
    eligibility: 'Admitted to AICTE-approved degree/diploma technical institutions within income cap.',
    estimatedBenefit: '₹50,000/year lump-sum academic support',
    requiredDocuments: ['AICTE Admission Proof', 'Income Certificate', 'Bank Details', 'Aadhaar'],
    applicationWindow: 'September – November',
    officialUrl: 'https://www.aicte-india.org',
    conditions: 'Up to 2 girls per family for Pragati; verified disability certificate (>=40%) for Saksham.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate'],
  },
  {
    id: 'bp-naps-apprentice',
    category: 'Apprenticeship / Earn-While-Learning',
    name: 'National Apprenticeship Promotion Scheme (NAPS) & Degree Apprenticeships',
    eligibility: '10th/12th/ITI/Diploma/Graduate youth aged 14–21+.',
    estimatedBenefit: 'Monthly stipend ₹7,000–₹18,000 + recognized industry certification',
    requiredDocuments: ['Marksheets', 'Aadhaar', 'Bank Account', 'Apprenticeship Portal Registration'],
    applicationWindow: 'Year-round rolling',
    officialUrl: 'https://www.apprenticeshipindia.gov.in',
    conditions: 'Selection by participating employer; on-the-job training attendance required.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate'],
  },
  {
    id: 'bp-swayam-nptel',
    category: 'Free Online Learning',
    name: 'SWAYAM & IIT-NPTEL Free Credit-Transfer Courses',
    eligibility: 'Open to all learners in India & abroad.',
    estimatedBenefit: '100% free IIT/IIM/Central University coursework (optional proctored exam ₹1,000 with fee waiver for eligible learners)',
    requiredDocuments: ['Email & ID for optional proctored certificate'],
    applicationWindow: 'January & July cycles',
    officialUrl: 'https://swayam.gov.in',
    conditions: 'Credit transfer subject to home university adoption.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate', 'Comfortable', 'Flexible'],
  },
  {
    id: 'bp-public-uni',
    category: 'Low-Cost Public Institutions',
    name: 'Central Universities (CUET), State Engineering/Medical Colleges & IITM BS Online Degree',
    eligibility: 'Merit-based entrance (CUET / JEE / NEET / Qualifier exam).',
    estimatedBenefit: '80%–90% lower tuition than private colleges (₹10,000–₹75,000/yr + fee waivers)',
    requiredDocuments: ['Entrance Scorecard', 'Class 12 Certificate', 'Category/Income Certificate (if applicable)'],
    applicationWindow: 'February – July',
    officialUrl: 'https://cuet.nta.nic.in',
    conditions: 'Merit cutoff varies annually by programme and campus.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate', 'Comfortable'],
  },
  {
    id: 'bp-ignou-open',
    category: 'Open & Distance Education',
    name: 'IGNOU UGC-Recognized Degrees (Study While Working)',
    eligibility: '10+2 for Bachelor’s / Graduate for Master’s.',
    estimatedBenefit: 'Complete degree under ₹15,000–₹35,000 total while earning full-time',
    requiredDocuments: ['10th/12th Marksheets', 'ID Proof', 'Passport Photo'],
    applicationWindow: 'January & July cycles',
    officialUrl: 'https://www.ignou.ac.in',
    conditions: 'Check statutory licensing rules (e.g., clinical/engineering degrees require regular mode).',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate'],
  },
  {
    id: 'bp-pmkvy-skill',
    category: 'Government Skill Programme',
    name: 'PMKVY / Skill India Digital Free Industry Certifications',
    eligibility: 'Indian youth seeking fast job-ready technical, healthcare, logistics or digital skills.',
    estimatedBenefit: 'Zero-fee training + NSDC recognized certificate + placement drives',
    requiredDocuments: ['Aadhaar', 'Education Proof'],
    applicationWindow: 'Year-round rolling',
    officialUrl: 'https://www.skillindiadigital.gov.in',
    conditions: 'Subject to training centre batch availability.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited'],
  },
  {
    id: 'bp-germany-public',
    category: 'Low-Tuition International Pathway',
    name: 'Germany Public Universities (Zero/Minimal Tuition) + DAAD Scholarships',
    eligibility: 'Strong academic record + IELTS/German B1-C1 + blocked account / DAAD funding.',
    estimatedBenefit: '€0 tuition at most German state universities (semester contribution ~€250–€350)',
    requiredDocuments: ['APS Certificate (India)', 'Transcripts', 'Language Proof', 'SOP'],
    applicationWindow: 'April – July (Winter) / Nov – Jan (Summer)',
    officialUrl: 'https://www.daad.de/en/',
    conditions: 'Living expenses (~€11,904/yr) still required via blocked account, part-time work (140 full days/yr), or scholarship.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Moderate', 'Comfortable', 'Flexible'],
  },
  {
    id: 'bp-defence-sponsored',
    category: 'Zero-Cost Sponsored Leadership Entry',
    name: 'NDA / TES / UES / CDS Armed Forces Training (Fully Government Funded)',
    eligibility: 'UPSC NDA / CDS / 10+2 TES + SSB + Medical fitness.',
    estimatedBenefit: '100% government-funded degree/training + monthly stipend during academy training',
    requiredDocuments: ['UPSC Admit Card', '10th/12th/Degree Certificates', 'Medical & Identity Docs'],
    applicationWindow: 'Twice yearly (UPSC NDA/CDS cycles)',
    officialUrl: 'https://upsc.gov.in',
    conditions: 'Selection strictly via UPSC exam, SSB & medical standards.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate', 'Comfortable', 'Flexible'],
  },
  {
    id: 'bp-staged-cert',
    category: 'Staged Certification & Paid Internships',
    name: 'Skill-First Entry → Paid Internship → Employer-Sponsored Upskilling',
    eligibility: 'Demonstrable GitHub/design/accounting portfolio + open certifications.',
    estimatedBenefit: 'Start earning ₹12,000–₹35,000/month within 6–9 months; self-fund advanced degree later',
    requiredDocuments: ['Portfolio Projects', 'Verified Open Certifications'],
    applicationWindow: 'Year-round',
    officialUrl: 'https://www.ncs.gov.in',
    conditions: 'Requires disciplined self-directed portfolio building and interview preparation.',
    verifiedDate: '2026-11-01',
    applicableTiers: ['Very Limited', 'Limited', 'Moderate', 'Comfortable', 'Flexible'],
  },
];

export function evaluateStage3Budget(input: CareerBudgetInput): CareerBudgetResult {
  const years = Math.max(1, Math.min(6, input.preparationYearsAvailable || 3));
  const annual = Math.max(0, Number(input.annualFamilyEducationBudgetInr) || 0);
  const savings = Math.max(0, Number(input.availableSavingsInr) || 0);
  const maxFeasibleTotalBudgetInr = annual * years + savings;

  const capacityTier: FinancialCapacityTier =
    annual < 40000
      ? 'Very Limited'
      : annual < 120000
        ? 'Limited'
        : annual < 350000
          ? 'Moderate'
          : annual < 800000
            ? 'Comfortable'
            : 'Flexible';

  const bypassPathways = VERIFIED_BUDGET_BYPASS_PATHWAYS.filter((p) =>
    p.applicableTiers.includes(capacityTier),
  );

  const pathwayComparisons: CareerBudgetResult['pathwayComparisons'] = [
    {
      mode: 'Full-Cost Pathway',
      estimatedTotalCostInr: 1200000,
      estimatedDurationYears: 4,
      feasibility: maxFeasibleTotalBudgetInr >= 1200000 ? 'Comfortable' : 'Stretch',
      notes: 'Private residential university + paid coaching + living expenses.',
    },
    {
      mode: 'Reduced-Cost Public Pathway',
      estimatedTotalCostInr: 220000,
      estimatedDurationYears: 3,
      feasibility: maxFeasibleTotalBudgetInr >= 220000 ? 'Comfortable' : 'Achievable with Aid',
      notes: 'Central/State public university via CUET/JEE/NEET + self-study/SWAYAM.',
    },
    {
      mode: 'Scholarship-Supported Pathway',
      estimatedTotalCostInr: 95000,
      estimatedDurationYears: 3,
      feasibility: maxFeasibleTotalBudgetInr >= 95000 ? 'Comfortable' : 'Achievable with Aid',
      notes: 'Public institution combined with NSP/State/AICTE scholarship & fee waiver.',
    },
    {
      mode: 'Earn-and-Learn Pathway',
      estimatedTotalCostInr: 45000,
      estimatedDurationYears: 3,
      feasibility: 'Comfortable',
      notes: 'NAPS apprenticeship or paid internship alongside IGNOU/online BS degree.',
    },
    {
      mode: 'Staged Certification Pathway',
      estimatedTotalCostInr: 20000,
      estimatedDurationYears: 1,
      feasibility: 'Comfortable',
      notes: 'Free SWAYAM/Skill India foundation → paid entry role → funded advanced degree.',
    },
  ];

  return {
    input,
    capacityTier,
    maxFeasibleTotalBudgetInr,
    bypassPathways,
    pathwayComparisons,
    completedAt: new Date().toISOString(),
  };
}

// ============================================================================
// STAGE 4 & 5: INDIA + INTERNATIONAL MARKET STUDY, MATCHING & 12-MONTH ROADMAP
// ============================================================================

export const VERIFIED_CAREER_MARKET_CATALOG: CareerMarketOpportunity[] = [
  {
    id: 'mkt-software-ai',
    title: 'Software, Cloud & Applied AI Engineer',
    industry: 'Technology',
    category: 'Private Sector & Global Tech',
    scope: 'India & International',
    countries: ['India', 'Germany', 'UK', 'Canada', 'USA', 'Singapore', 'UAE'],
    requiredEducation: 'B.Tech / B.Sc CS / BCA / IITM BS or verified skill portfolio',
    entryQualifications: ['Strong DSA & Web/Backend fundamentals', '2–3 deployed GitHub projects'],
    employmentDemand: 'Very High',
    indiaSalaryRangeInr: '₹4.5L – ₹16L/yr entry (varies by city & skill tier)',
    internationalSalaryRange: '€52k–€75k (Germany) · $85k–$130k (USA) · SGD 60k–90k (Singapore)',
    growthOutlook: 'Strong multi-year demand in cloud reliability, cybersecurity, and AI systems integration.',
    certifications: ['AWS/GCP Cloud Practitioner', 'NPTEL Algorithms', 'Linux & Security Basics'],
    coreSkills: ['TypeScript / Python', 'SQL & APIs', 'Git & Testing', 'System Debugging'],
    emergingSkills: ['AI Agent Engineering', 'Cloud FinOps & Security', 'Data Pipelines'],
    competitionLevel: 'High',
    competitionNotes: 'High applicant volume for generic resumes; strong shortage of engineers who ship tested production systems.',
    entryBarriers: 'Portfolio proof & coding interviews outweigh degree brand after entry.',
    licensingOrVisaNotes: 'EU Blue Card (Germany), Skilled Worker Visa (UK), EP (Singapore) require recognized degree + salary threshold.',
    estimatedIndiaCostInr: 180000,
    estimatedAbroadCostInr: 1600000,
    preparationMonths: 12,
    sourceName: 'NASSCOM Strategic Review & US BLS / Germany Make-it-in-Germany',
    sourceDate: '2026-10',
    sourceScope: 'India, EU, UK, North America, APAC',
    targetEnvironments: ['Technology & Product Engineering', 'Remote Digital & Global Consulting', 'Entrepreneurship & Startups'],
    capacityFocus: ['iq', 'cq'],
    alternativeEntryRoutes: ['IITM BS Online + SWAYAM', 'NAPS Tech Apprenticeship', 'Open-source portfolio → startup internship'],
  },
  {
    id: 'mkt-defence-officer',
    title: 'Commissioned Officer — Indian Armed Forces (Army / Navy / Air Force)',
    industry: 'Armed Forces',
    category: 'National Defence & Leadership',
    scope: 'India',
    countries: ['India'],
    requiredEducation: 'Class 12 (NDA / TES) or Graduation (CDS / AFCAT)',
    entryQualifications: ['UPSC NDA/CDS or AFCAT Written', 'SSB 5-Day Interview', 'Armed Forces Medical Standards'],
    employmentDemand: 'Selective',
    indiaSalaryRangeInr: '₹11L – ₹16L/yr equivalent (Pay Level 10 + allowances + accommodation)',
    growthOutlook: 'Consistent bi-annual officer intake across technical, flying, logistics & combat arms.',
    certifications: ['UPSC NDA / CDS / AFCAT', 'Physical Endurance Standards'],
    coreSkills: ['Structured Reasoning & Decision Speed', 'Team Leadership', 'Clear Expression', 'Physical Stamina'],
    emergingSkills: ['Defence Cyber & Drone Systems', 'Joint-Theatre Logistics', 'Geospatial Intelligence'],
    competitionLevel: 'High',
    competitionNotes: 'Highly selective merit-based screening via UPSC written + SSB + medical board.',
    entryBarriers: 'Strict age limits, medical fitness, and holistic 15-OLQ assessment.',
    licensingOrVisaNotes: 'Indian citizenship / eligible domicile norms as per UPSC official notification.',
    estimatedIndiaCostInr: 15000,
    preparationMonths: 9,
    sourceName: 'UPSC Official Notifications & Join Indian Army/Navy/IAF Portals',
    sourceDate: '2026-10',
    sourceScope: 'India (All-India Merit)',
    targetEnvironments: ['Armed Forces & Defence Leadership', 'Field Operations & Infrastructure', 'Government & Civil Services'],
    capacityFocus: ['aq', 'eq', 'iq'],
    alternativeEntryRoutes: ['NCC Special Entry', '10+2 Technical Entry Scheme (TES)', 'Self-study + Rai Plus SSB Academy'],
  },
  {
    id: 'mkt-data-finance',
    title: 'Financial Analyst, Chartered Accountant & FinTech Risk Specialist',
    industry: 'Finance',
    category: 'Finance, Audit & Corporate Advisory',
    scope: 'India & International',
    countries: ['India', 'UAE', 'UK', 'Singapore', 'Australia'],
    requiredEducation: 'B.Com / BBA / Economics + CA / CFA / CMA / Financial Modelling',
    entryQualifications: ['Accounting & GST/Tax fluency', 'Excel/SQL financial modelling'],
    employmentDemand: 'High',
    indiaSalaryRangeInr: '₹4L – ₹14L/yr entry (higher post-CA/CFA qualification)',
    internationalSalaryRange: 'AED 120k–210k (UAE) · £40k–£65k (UK)',
    growthOutlook: 'Expanding demand across Indian GCCs (Global Capability Centres), SME compliance & UAE/UK finance.',
    certifications: ['ICAI CA', 'CFA Level 1', 'NISM Research Analyst', 'Tally & Power BI'],
    coreSkills: ['Financial Statement Analysis', 'GST & Direct Tax', 'Excel & SQL', 'Business Communication'],
    emergingSkills: ['Automated Audit Analytics', 'ESG Reporting', 'FinTech Compliance'],
    competitionLevel: 'Moderate-High',
    competitionNotes: 'Structured exam hurdle for CA/CFA, with steady demand for practical GST/FP&A analysts.',
    entryBarriers: 'Multi-stage exam persistence (CA/CFA) or strong articleship/internship.',
    licensingOrVisaNotes: 'ICAI reciprocity agreements with selected international accounting bodies.',
    estimatedIndiaCostInr: 120000,
    estimatedAbroadCostInr: 1400000,
    preparationMonths: 18,
    sourceName: 'ICAI Placement Reports, NCS India & UAE MOHRE Market Briefs',
    sourceDate: '2026-10',
    sourceScope: 'India, Middle East, UK, APAC',
    targetEnvironments: ['Corporate Office & Consulting', 'Government & Civil Services', 'Remote Digital & Global Consulting'],
    capacityFocus: ['iq', 'aq'],
    alternativeEntryRoutes: ['B.Com (Public Univ / IGNOU) + CA Articleship (stipend earned)', 'NISM + Paid Accounts Internship'],
  },
  {
    id: 'mkt-healthcare-allied',
    title: 'Clinical Healthcare, Allied Health & Digital Health Specialist (Nursing / Speech / Physio / MBBS)',
    industry: 'Healthcare',
    category: 'Healthcare & Rehabilitation',
    scope: 'India & International',
    countries: ['India', 'UK', 'Australia', 'Canada', 'Germany', 'UAE', 'Japan'],
    requiredEducation: 'B.Sc Nursing / BASLP / BPT / B.Pharm / MBBS',
    entryQualifications: ['Recognized clinical degree', 'Statutory council registration (INC / RCI / NMC)'],
    employmentDemand: 'Very High',
    indiaSalaryRangeInr: '₹3.5L – ₹12L/yr (hospital/clinic & tele-rehab growth)',
    internationalSalaryRange: '£32k–£52k (UK NHS) · AUD 75k–105k (Australia) · €42k–€58k (Germany)',
    growthOutlook: 'Structural shortage of licensed nurses, therapists & allied clinicians across India, UK, Germany, Australia & Japan.',
    certifications: ['Statutory Council Registration (RCI/INC/NMC)', 'OET / IELTS / German B2 for abroad'],
    coreSkills: ['Patient Assessment & Care', 'Clinical Documentation', 'Empathy & Ethics', 'Team Coordination'],
    emergingSkills: ['Tele-Rehabilitation', 'Electronic Health Records', 'Preventive Diagnostics'],
    competitionLevel: 'Moderate',
    competitionNotes: 'High demand once statutory qualification and registration are achieved.',
    entryBarriers: 'Mandatory regular-mode clinical training & licensing exams.',
    licensingOrVisaNotes: 'UK Health & Care Worker Visa, Australia Skills-in-Demand, Germany Skilled Immigration Act.',
    estimatedIndiaCostInr: 280000,
    estimatedAbroadCostInr: 950000,
    preparationMonths: 36,
    sourceName: 'WHO Health Workforce Outlook, UK NHS & India MoHFW / RCI',
    sourceDate: '2026-10',
    sourceScope: 'India, UK, EU, Australia, Japan',
    targetEnvironments: ['Healthcare & Clinical Care', 'Social Development & Policy', 'Research & Academia'],
    capacityFocus: ['eq', 'aq'],
    alternativeEntryRoutes: ['State Government Nursing / Allied Health Colleges (low tuition)', 'Post-Matric & AICTE Scholarships'],
  },
  {
    id: 'mkt-civil-policy',
    title: 'Civil Services, Public Administration & State Government Officer',
    industry: 'Government Services',
    category: 'Public Policy & Administration',
    scope: 'India',
    countries: ['India'],
    requiredEducation: 'Any recognized Bachelor’s degree (Public Univ or IGNOU eligible)',
    entryQualifications: ['UPSC CSE / State PCS / SSC CGL / RBI Grade B'],
    employmentDemand: 'Selective',
    indiaSalaryRangeInr: '₹8L – ₹15L/yr (7th CPC Pay Levels 7–10 + benefits)',
    growthOutlook: 'Stable annual recruitment across central ministries, state cadres, banking & regulatory bodies.',
    certifications: ['Recognized Graduation Degree', 'Public Policy / Data Literacy'],
    coreSkills: ['Analytical Writing', 'Indian Polity & Economy', 'Ethical Reasoning', 'Time-Bound Decision Making'],
    emergingSkills: ['Digital Public Infrastructure (DPI)', 'Evidence-Based Governance', 'GIS & Data Policy'],
    competitionLevel: 'High',
    competitionNotes: 'Very high exam competition; smart candidates pair preparation with a parallel Plan-B skill/degree.',
    entryBarriers: 'Multi-stage Prelims, Mains & Interview endurance.',
    licensingOrVisaNotes: 'Indian citizenship as per UPSC/State PSC eligibility rules.',
    estimatedIndiaCostInr: 45000,
    preparationMonths: 18,
    sourceName: 'UPSC Annual Report & DoPT / NCS India',
    sourceDate: '2026-10',
    sourceScope: 'India',
    targetEnvironments: ['Government & Civil Services', 'Social Development & Policy', 'Research & Academia'],
    capacityFocus: ['iq', 'aq', 'eq'],
    alternativeEntryRoutes: ['NCERT + Free SWAYAM + Public Library self-study', 'Parallel State PCS / Banking / Policy Fellowship'],
  },
  {
    id: 'mkt-renewable-mech',
    title: 'Renewable Energy, EV & Industrial Automation Technician / Engineer',
    industry: 'Emerging Industries',
    category: 'Clean Energy & Skilled Technical',
    scope: 'India & International',
    countries: ['India', 'Germany', 'UAE', 'Japan', 'Australia'],
    requiredEducation: 'ITI / Polytechnic Diploma / B.Tech Electrical or Mechanical',
    entryQualifications: ['Hands-on solar/EV/PLC certification', 'Electrical safety compliance'],
    employmentDemand: 'Very High',
    indiaSalaryRangeInr: '₹3.2L – ₹10L/yr (rapid progression for certified site leads)',
    internationalSalaryRange: '€44k–€62k (Germany) · JPY 3.8M–5.5M (Japan SSW/Engineer)',
    growthOutlook: 'India’s 500 GW renewable target & EV manufacturing expansion create high verified field & plant demand.',
    certifications: ['Skill India Solar PV Installer', 'PLC/SCADA Certification', 'EV Powertrain Diagnostics'],
    coreSkills: ['Electrical Diagnostics', 'Field Safety', 'CAD / PLC Basics', 'Preventive Maintenance'],
    emergingSkills: ['Battery Management Systems', 'Smart Grid Telemetry', 'Hydrogen & Energy Storage'],
    competitionLevel: 'Moderate',
    competitionNotes: 'Strong shortage of hands-on certified technicians willing to do field commissioning.',
    entryBarriers: 'Practical workshop proficiency rather than expensive degrees.',
    licensingOrVisaNotes: 'Germany Opportunity Card / Vocational Recognition; Japan Specified Skilled Worker (JLPT N4+).',
    estimatedIndiaCostInr: 65000,
    estimatedAbroadCostInr: 600000,
    preparationMonths: 12,
    sourceName: 'MNRE India, Skill Council for Green Jobs & Germany Federal Employment Agency',
    sourceDate: '2026-10',
    sourceScope: 'India, Germany, UAE, Japan, Australia',
    targetEnvironments: ['Field Operations & Infrastructure', 'Skilled Technical & Applied Trades', 'Technology & Product Engineering'],
    capacityFocus: ['iq', 'aq', 'cq'],
    alternativeEntryRoutes: ['PMKVY Free Green Skills', 'NAPS Paid Industrial Apprenticeship', 'Polytechnic → Lateral B.Tech'],
  },
  {
    id: 'mkt-ux-creative-digital',
    title: 'Product Designer (UI/UX), EdTech Content & Digital Brand Strategist',
    industry: 'Creative Industries',
    category: 'Design, Media & Digital Entrepreneurship',
    scope: 'India & International',
    countries: ['India', 'UK', 'Canada', 'UAE', 'Singapore', 'Remote Global'],
    requiredEducation: 'Any degree / Design diploma + strong case-study portfolio',
    entryQualifications: ['3 real UX/brand case studies', 'Figma & user research proficiency'],
    employmentDemand: 'High',
    indiaSalaryRangeInr: '₹4L – ₹14L/yr (plus global freelance/remote upside)',
    internationalSalaryRange: '$65k–$110k (Remote / North America) · £38k–£62k (UK)',
    growthOutlook: 'Steady demand for human-centered product designers who bridge user empathy with AI tools.',
    certifications: ['Google UX Design (Financial Aid available)', 'SWAYAM Visual Design'],
    coreSkills: ['User Research', 'Wireframing & Figma', 'Visual Hierarchy', 'Storytelling'],
    emergingSkills: ['AI-Assisted Prototyping', 'Design Systems', 'Accessibility (WCAG)'],
    competitionLevel: 'Moderate-High',
    competitionNotes: 'Crowded at beginner template level; stands out sharply with real user-tested case studies.',
    entryBarriers: 'Portfolio quality and communication of design rationale.',
    licensingOrVisaNotes: 'No statutory license required; remote international contracts feasible from India.',
    estimatedIndiaCostInr: 25000,
    estimatedAbroadCostInr: 1200000,
    preparationMonths: 8,
    sourceName: 'World Economic Forum Future of Jobs & India Design Council Briefs',
    sourceDate: '2026-10',
    sourceScope: 'India & Remote Global',
    targetEnvironments: ['Creative Industries & Design', 'Remote Digital & Global Consulting', 'Entrepreneurship & Startups'],
    capacityFocus: ['cq', 'eq'],
    alternativeEntryRoutes: ['Free Figma + Coursera Financial Aid', 'Redesign local SME websites as paid portfolio'],
  },
  {
    id: 'mkt-healthcare-nursing-allied',
    title: 'Clinical Nursing, Physiotherapy & Allied Health Specialist',
    industry: 'Healthcare & Life Sciences',
    category: 'Healthcare, Clinical Care & Global Mobility',
    scope: 'India & International',
    countries: ['India', 'UK', 'Germany', 'Australia', 'Canada', 'UAE'],
    requiredEducation: 'B.Sc Nursing / BPT / B.Pharm / Allied Health Degree from recognized university',
    entryQualifications: ['INC / State Nursing or Allied Health registration', 'Clinical internship hours'],
    employmentDemand: 'Very High',
    indiaSalaryRangeInr: '₹3.6L – ₹9.5L/yr (AIIMS/NORCET & Tier-1 hospitals)',
    internationalSalaryRange: '£30k–£44k (UK NHS Band 5/6) · €38k–€52k (Germany) · AUD 72k–95k (Australia)',
    growthOutlook: 'Structural long-term healthcare workforce shortage across India, UK NHS, Germany, and Australia.',
    certifications: ['AIIMS NORCET', 'OET / IELTS Healthcare (for UK/Aus)', 'Goethe B2 German (for Germany Triple Win)'],
    coreSkills: ['Clinical Patient Assessment', 'Emergency Triage', 'Medical Documentation', 'Empathetic Communication'],
    emergingSkills: ['Telehealth Systems', 'Electronic Health Records (EHR)', 'Geriatric & Rehab Care'],
    competitionLevel: 'Moderate',
    competitionNotes: 'Strong placement stability for licensed graduates who pass language/registration milestones.',
    entryBarriers: 'Accredited clinical degree and country-specific licensing exams (NMC CBT/OSCE for UK, Anerkennung for Germany).',
    licensingOrVisaNotes: 'UK Health & Care Worker Visa, Germany Triple Win Healthcare Programme, Australia Skilled Occupation List.',
    estimatedIndiaCostInr: 120000,
    estimatedAbroadCostInr: 350000,
    preparationMonths: 18,
    sourceName: 'WHO Global Health Workforce Projections, AIIMS NORCET & UK NHS Careers',
    sourceDate: '2026-10',
    sourceScope: 'India, UK, Germany, Australia, UAE',
    targetEnvironments: ['Healthcare & Clinical Support', 'Public Service & Administration', 'Field Operations & Infrastructure'],
    capacityFocus: ['eq', 'aq'],
    alternativeEntryRoutes: ['AIIMS / State Govt Nursing Colleges (near-zero tuition)', 'Germany Triple Win Funded Placement'],
  },
  {
    id: 'mkt-chartered-finance-fintech',
    title: 'Chartered Accountant (CA), Financial Analyst & FinTech Risk Officer',
    industry: 'Finance & Accounting',
    category: 'Finance, Audit & Global Capital Markets',
    scope: 'India & International',
    countries: ['India', 'UAE', 'Singapore', 'UK', 'Australia'],
    requiredEducation: 'B.Com / BBA + ICAI CA / ACCA / CFA Level 1+ / NISM Certifications',
    entryQualifications: ['ICAI CA Intermediate / Final or ACCA / CFA credential', 'Excel, Tally/ERP & Financial Modeling'],
    employmentDemand: 'High',
    indiaSalaryRangeInr: '₹6L – ₹16L/yr (entry CA/Analyst) · ₹18L–₹35L+ mid-career',
    internationalSalaryRange: 'AED 160k–260k (UAE) · £48k–£75k (UK) · SGD 70k–105k (Singapore)',
    growthOutlook: 'Steady high demand driven by GST compliance, ESG reporting, FinTech regulation, and India capital markets growth.',
    certifications: ['ICAI CA', 'NISM Research Analyst / Mutual Funds', 'ACCA / CFA Level 1', 'Power BI & SQL for Finance'],
    coreSkills: ['Financial Statement Analysis', 'Taxation & Audit Compliance', 'Excel Modeling', 'Risk Governance'],
    emergingSkills: ['Automated ERP Auditing', 'ESG Assurance', 'Python for Quantitative Finance'],
    competitionLevel: 'High',
    competitionNotes: 'ICAI pass rates require disciplined multi-attempt resilience; high ROI because total official exam fees are low.',
    entryBarriers: 'Structured exam rigor and mandatory articleship / practical audit hours.',
    licensingOrVisaNotes: 'ICAI has Mutual Recognition Agreements (MRAs) with ICAEW (UK), CPA Australia, and CPA Canada.',
    estimatedIndiaCostInr: 85000,
    estimatedAbroadCostInr: 650000,
    preparationMonths: 24,
    sourceName: 'ICAI Placement Reports, NISM & CFA Institute Market Briefs',
    sourceDate: '2026-10',
    sourceScope: 'India, UAE, Singapore, UK, Australia',
    targetEnvironments: ['Corporate Finance & Structured Operations', 'Research & Deep Analytical Work', 'Remote Digital & Global Consulting'],
    capacityFocus: ['iq', 'aq'],
    alternativeEntryRoutes: ['Direct ICAI CA Self-Study + Paid Articleship', 'B.Com (Govt College) + NISM + Paid Accounting Internship'],
  },
];

export function matchStage4MarketOpportunities(params: {
  capacity: CareerCapacityResult;
  personality: CareerPersonalityResult;
  budget: CareerBudgetResult;
  scopeFilter?: 'All' | 'India' | 'International';
}): CareerMatchedOpportunity[] {
  const { capacity, personality, budget, scopeFilter = 'All' } = params;
  const topEnvs = new Set(personality.preferredEnvironments.map((e) => e.environment));
  const capMap = {
    iq: capacity.iq.overallPct,
    eq: capacity.eq.overallPct,
    aq: capacity.aq.overallPct,
    cq: capacity.cq.overallPct,
  };

  const catalog = VERIFIED_CAREER_MARKET_CATALOG.filter((opp) => {
    if (scopeFilter === 'India') return opp.scope === 'India' || opp.scope === 'India & International';
    if (scopeFilter === 'International')
      return opp.scope === 'International' || opp.scope === 'India & International';
    return true;
  });

  const scored = catalog.map((opp) => {
    const capAvg = Math.round(
      opp.capacityFocus.reduce((s, k) => s + capMap[k], 0) / Math.max(1, opp.capacityFocus.length),
    );
    const envMatches = opp.targetEnvironments.filter((e) => topEnvs.has(e));
    const envScore = envMatches.length >= 2 ? 92 : envMatches.length === 1 ? 78 : 55;
    const withinBudget = opp.estimatedIndiaCostInr <= budget.maxFeasibleTotalBudgetInr;
    const budgetScore = withinBudget
      ? 92
      : opp.alternativeEntryRoutes.length > 0
        ? 76
        : 50;

    const totalRank = capAvg * 0.4 + envScore * 0.35 + budgetScore * 0.25;

    const whyItMatches: string[] = [
      `Capacity alignment (${capAvg}%) on core dimensions (${opp.capacityFocus.map((k) => k.toUpperCase()).join(', ')}).`,
      envMatches.length > 0
        ? `Work-environment fit with your preferred setting: ${envMatches.join(', ')}.`
        : `Accessible adjacent environment (${opp.targetEnvironments[0]}) with structured growth.`,
      withinBudget
        ? `Estimated India pathway cost (₹${opp.estimatedIndiaCostInr.toLocaleString('en-IN')}) fits your current budget capacity.`
        : `Higher standard cost, but viable via budget-bypass routes: ${opp.alternativeEntryRoutes[0]}.`,
    ];

    return {
      totalRank,
      match: {
        opportunity: opp,
        capacityMatchNote: `${capAvg}% alignment on ${opp.capacityFocus.map((k) => k.toUpperCase()).join(' + ')}`,
        personalityFitNote:
          envMatches.length > 0
            ? `High fit (${envMatches.join(' & ')})`
            : `Moderate fit (adaptable to ${opp.targetEnvironments[0]})`,
        budgetFitNote: withinBudget
          ? `Affordable directly (est. ₹${opp.estimatedIndiaCostInr.toLocaleString('en-IN')})`
          : `Use Bypass Route: ${opp.alternativeEntryRoutes[0]}`,
        whyItMatches,
        alreadyPossessed: capacity.strengthAreas.slice(0, 2),
        missingGaps: opp.coreSkills.slice(0, 2),
        risks: [
          `Competition: ${opp.competitionLevel} — ${opp.competitionNotes}`,
          `Entry barrier: ${opp.entryBarriers}`,
        ],
        rankReason: `Ranked by combined Capacity (${capAvg}%), Environment Fit (${envScore}%), and Budget Feasibility (${budgetScore}%).`,
      } satisfies CareerMatchedOpportunity,
    };
  });

  return scored.sort((a, b) => b.totalRank - a.totalRank).map((x) => x.match);
}

export function buildStage5CompetitionAndRoadmap(params: {
  career: CareerMarketOpportunity;
  capacity: CareerCapacityResult;
  budget: CareerBudgetResult;
}) {
  const { career, capacity, budget } = params;
  const milestones: CareerRoadmapMilestone[] = [
    {
      horizon: 'TODAY',
      objective: `Explore ${career.title} fundamentals & bookmark 1 verified official resource`,
      timeRequirement: '45 minutes',
      estimatedCostInr: 0,
      learningResource: `Official portal (${career.sourceName}) + SWAYAM free course catalog`,
      expectedOutput: '1-page personal career clarity sheet listing your top 3 core skills to build',
      completionCriteria: 'Written summary saved inside your Rai Plus Career Intelligence profile',
    },
    {
      horizon: 'NEXT 7 DAYS',
      objective: `Start foundational practice in ${career.coreSkills[0]} and talk to 1 field practitioner`,
      timeRequirement: '1 hour / day',
      estimatedCostInr: 0,
      learningResource: 'Free SWAYAM / NPTEL / YouTube foundational lectures & NCERT/official syllabus',
      expectedOutput: 'Completed Week-1 notes + 3 real takeaways from someone working in the industry',
      completionCriteria: '7-day habit log + verified skill checklist updated',
    },
    {
      horizon: 'NEXT 30 DAYS',
      objective: `Build measurable competence in ${career.coreSkills.slice(0, 2).join(' & ')}`,
      timeRequirement: '8–10 hours / week',
      estimatedCostInr: 0,
      learningResource: 'Free open-courseware + practice problem sets / mini case studies',
      expectedOutput: '1 tangible mini-project, mock test baseline, or documented practical case study',
      completionCriteria: 'Self-tested artifact ready to share with a mentor or peer reviewer',
    },
    {
      horizon: 'NEXT 90 DAYS',
      objective: `Complete 1 portfolio-grade practical project or full-length mock milestone + apply for budget aid`,
      timeRequirement: '10–12 hours / week',
      estimatedCostInr: budget.capacityTier === 'Very Limited' ? 0 : 1000,
      learningResource: `${career.certifications[0] || 'SWAYAM / Skill India'} + ${budget.bypassPathways[0]?.name || 'Public scholarship portal'}`,
      expectedOutput: 'Verified portfolio artifact / proctored certificate + scholarship/apprenticeship application filed',
      completionCriteria: 'Public portfolio link or verified assessment score recorded',
    },
    {
      horizon: 'NEXT 6 MONTHS',
      objective: `Earn ${career.certifications[0] || 'foundational industry certification'} & gain real exposure (internship / apprenticeship / mock boards)`,
      timeRequirement: '12 hours / week',
      estimatedCostInr: budget.capacityTier === 'Very Limited' ? 1000 : 5000,
      learningResource: `${career.alternativeEntryRoutes[0] || 'NAPS / Paid Internship / Public Institution'}`,
      expectedOutput: 'Real-world experience entry, supervisor feedback, and refined CV/interview pitch',
      completionCriteria: 'Completed internship/project evaluation or cleared preliminary qualification stage',
    },
    {
      horizon: 'NEXT 12 MONTHS',
      objective: `Achieve career-entry readiness for ${career.title} (${career.emergingSkills[0]})`,
      timeRequirement: 'Sustained weekly cadence',
      estimatedCostInr: Math.min(budget.maxFeasibleTotalBudgetInr, career.estimatedIndiaCostInr),
      learningResource: 'Official entrance/hiring portals + peer mock interviews + Rai Plus progress review',
      expectedOutput: 'Complete portfolio/exam readiness, shortlist of 10 target institutions/employers, and active applications',
      completionCriteria: 'Ready for formal admission, officer selection, apprenticeship, or entry-level interviews',
    },
  ];

  return {
    targetCareerId: career.id,
    targetCareerTitle: career.title,
    measurableCompetitionFacts: [
      `Entry qualifications required: ${career.entryQualifications.join('; ')}.`,
      `Market demand indicator (${career.sourceName}, ${career.sourceDate}): ${career.employmentDemand}.`,
      `Verified India salary reference (${career.sourceScope}): ${career.indiaSalaryRangeInr}${career.internationalSalaryRange ? ` | International: ${career.internationalSalaryRange}` : ''}.`,
    ],
    qualitativeMarketAssessment: [
      `Competition level: ${career.competitionLevel} — ${career.competitionNotes}`,
      `Common candidate weakness: relying solely on degree certificates without demonstrable practical work or clear communication.`,
      `Differentiating edge: combining ${career.coreSkills[0]} with emerging skill "${career.emergingSkills[0]}".`,
    ],
    skillGap: {
      demonstrated: capacity.strengthAreas,
      needsImprovement: capacity.developingAreas,
      missingQualifications: [career.requiredEducation],
      certifications: career.certifications,
      experienceGaps: [`Practical hands-on portfolio / field exposure in ${career.industry}`],
      communicationGaps: ['Structured interview articulation & evidence-backed storytelling'],
    },
    milestones,
    generatedAt: new Date().toISOString(),
  };
}
