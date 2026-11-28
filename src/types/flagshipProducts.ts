import type { OlqGroup, OlqKey } from '../types';

// ============================================================================
// PART C & E — CENTRAL COMMERCIAL PRICING REGISTRY & PUBLIC CMS
// ============================================================================

export interface SchoolPricingTierSpec {
  id: 'foundation' | 'growth' | 'intelligence' | 'infinity';
  name: string;
  tagline: string;
  annualPerStudentInr: number;
  highlightBadge?: string;
  features: string[];
  usageLimitsNote: string;
  active: boolean;
}

export interface StandaloneModulePriceSpec {
  id: string;
  name: string;
  billingBasis: 'per_school_year' | 'per_student_year' | 'per_staff_month' | 'tiered_school_year';
  priceSummary: string;
  numericAmountInr: number;
  tiers?: Array<{ label: string; amountInr: number }>;
  description: string;
  active: boolean;
}

export interface SsbSubscriptionPricingConfig {
  productName: string;
  /** 'enquiry_only' until Super Admin explicitly approves & publishes public prices */
  priceStatus: 'enquiry_only' | 'published';
  enquiryCtaLabel: string;
  monthlyInr: number | null;
  quarterlyInr: number | null;
  halfYearlyInr: number | null;
  annualInr: number | null;
  trialDays: number;
  freeDemoSetsIncluded: number;
  paidSetsIncluded: number;
  gstPct: number;
  benefits: string[];
  coupons: Array<{
    code: string;
    discountPct: number;
    active: boolean;
    expiresOn: string;
    note: string;
  }>;
  updatedAt: string;
  updatedBy: string;
}

export interface PublicProductPageCms {
  ssbAcademy: {
    published: boolean;
    headline: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
  };
  careerIntelligence: {
    published: boolean;
    headline: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
  };
  smartCampusEnabled: boolean;
}

export interface CommercialPricingRegistry {
  gstPct: number;
  gstDisclaimer: string;
  topLearnerRewardsRule: {
    enabledInCalculator: boolean;
    minMonthlyPerClassInr: number;
    maxMonthlyPerClassInr: number;
    schoolWideMonthlyInr: number;
    managedCampusTeamMonthlyInr: number;
  };
  schoolPackages: SchoolPricingTierSpec[];
  standaloneModules: StandaloneModulePriceSpec[];
  ssbAcademy: SsbSubscriptionPricingConfig;
  careerIntelligence: {
    productName: string;
    tagline: string;
    priceInr: 0;
    alwaysFreeGuarantee: string;
    includedCapabilities: string[];
  };
  publicCms: PublicProductPageCms;
  updatedAt: string;
  updatedBy: string;
}

// ============================================================================
// PART A — RAI PLUS SSB ACADEMY
// ============================================================================

export type SsbTestFormat = 'WAT' | 'SRT' | 'TAT' | 'PPDT';
export type SsbDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Officer-Level';

export interface SsbPracticeStimulus {
  id: string;
  format: SsbTestFormat;
  prompt: string;
  /** For WAT: positive/negative/neutral/abstract/situational; For SRT: 12 categories */
  category: string;
  difficulty: SsbDifficulty;
  sceneCode?: string;
  sceneCaption?: string;
  recommendedSeconds: number;
  observationSeconds?: number;
  targetOlqs: OlqKey[];
  gdPerspectives?: Array<{
    speaker: string;
    stance: string;
    statement: string;
  }>;
}

export interface SsbPracticeSet {
  id: string;
  setNumber: number;
  code: string;
  title: string;
  format: SsbTestFormat;
  difficulty: SsbDifficulty;
  categoryFocus: string;
  isFreeDemo: boolean;
  published: boolean;
  estimatedMinutes: number;
  tags: string[];
  stimuli: SsbPracticeStimulus[];
  createdAt: string;
}

export interface SsbResponseAnalysis {
  stimulusId: string;
  prompt: string;
  candidateResponse: string;
  timeTakenSeconds: number;
  authenticityFlag: 'Authentic & Coherent' | 'Slightly Formulaic' | 'Cliche / Memorized Warning';
  relevanceOk: boolean;
  practicalityScore: number; // 0-100
  clarityScore: number; // 0-100
  positives: string[];
  improvements: string[];
  alternativeApproach: string;
  suggestedExercise: string;
  indicatorSignals: Partial<Record<OlqKey, number>>;
}

export interface SsbAssessmentSessionRecord {
  id: string;
  userId: string;
  setId: string;
  setCode: string;
  setTitle: string;
  format: SsbTestFormat;
  mode: 'timed' | 'full' | 'individual' | 'weak_area';
  startedAt: string;
  completedAt: string;
  totalDurationSeconds: number;
  responses: SsbResponseAnalysis[];
  overallPracticality: number;
  overallClarity: number;
  ppdtPerception?: {
    charactersCount: number;
    mainCharacterAge: string;
    mainCharacterMood: 'Positive' | 'Neutral' | 'Negative';
    actionSummary: string;
    narrationPracticed: boolean;
    gdContribution?: string;
    gdFeedback?: string[];
  };
  reflectionNote?: string;
}

export interface SsbOlqIndicatorSummary {
  key: OlqKey;
  name: string;
  group: OlqGroup;
  evidenceCount: number;
  /** Null until corroborated across >= 2 distinct exercises/sources */
  developmentLevel: 'Emerging' | 'Developing' | 'Consistent' | 'Insufficient Evidence';
  score: number | null;
  supportingSources: SsbTestFormat[];
  suggestedActivity: string;
}

export interface SsbSubscriptionRecord {
  userId: string;
  planStatus: 'Free Demo' | 'Trial Active' | 'Subscribed' | 'Suspended';
  billingTier?: 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'demo';
  startedAt: string;
  validUntil: string;
  unlockedSetLimit: number;
  couponApplied?: string | null;
  paymentHistory: Array<{
    id: string;
    date: string;
    amountInr: number;
    gstInr: number;
    status: 'Paid' | 'Trial' | 'Demo';
    reference: string;
  }>;
}

export interface SsbStudentProfile {
  userId: string;
  targetEntry: 'NDA' | 'CDS' | 'AFCAT' | 'TES / Direct Officer Entry';
  attemptNumber: number;
  streakDays: number;
  lastPracticedDate?: string | null;
  selfReflections: Array<{ id: string; date: string; note: string; focusOlq: OlqKey }>;
  subscription: SsbSubscriptionRecord;
  sessions: SsbAssessmentSessionRecord[];
}

// ============================================================================
// PART B — RAI PLUS FREE 5-STAGE CAREER INTELLIGENCE
// ============================================================================

export type FinancialCapacityTier =
  | 'Very Limited'
  | 'Limited'
  | 'Moderate'
  | 'Comfortable'
  | 'Flexible';

export interface CareerCapacityResult {
  iq: {
    overallPct: number;
    subdomains: Record<
      'logical' | 'numerical' | 'verbal' | 'abstract' | 'pattern' | 'spatial',
      number
    >;
  };
  eq: {
    overallPct: number;
    strengths: string[];
    developing: string[];
  };
  aq: {
    overallPct: number;
    resilienceBand: 'High Adaptability' | 'Steady Recovery' | 'Building Resilience';
    indicators: string[];
  };
  cq: {
    overallPct: number;
    innovationStyle: string;
    indicators: string[];
  };
  strengthAreas: string[];
  developingAreas: string[];
  evidenceSummary: string[];
  suggestedExercises: string[];
  suggestedClusters: string[];
  completedAt: string;
}

export interface CareerPersonalityInput {
  extroversion: number; // 1-5
  leadershipDrive: number; // 1-5
  independence: number; // 1-5
  teamOrientation: number; // 1-5
  structurePreference: number; // 1-5 (5 = highly structured, 1 = flexible)
  riskTolerance: number; // 1-5
  creativityDrive: number; // 1-5
  routineTolerance: number; // 1-5
  competitiveDrive: number; // 1-5
  pressureComposure: number; // 1-5
  communicationStyle: 'Analytical & Written' | 'Persuasive & Verbal' | 'Visual & Hands-on' | 'Empathetic & Collaborative';
  learningEnvironment: 'Structured Classroom' | 'Hands-on Labs & Field' | 'Self-Paced Digital' | 'Mentored Studio / Team';
  happinessDriver: string;
  topMotivation: 'Impact & Service' | 'Financial Growth' | 'Mastery & Innovation' | 'Stability & Balance' | 'Leadership & Autonomy';
}

export interface CareerPersonalityResult {
  input: CareerPersonalityInput;
  preferredEnvironments: Array<{ environment: string; fitPct: number; why: string }>;
  challengingEnvironments: Array<{ environment: string; frictionNote: string }>;
  productivityConditions: string[];
  dissatisfactionTriggers: string[];
  alignedClusters: string[];
  careerExperiments: string[];
  completedAt: string;
}

export interface CareerBudgetInput {
  currentEducation: string;
  annualFamilyEducationBudgetInr: number;
  availableSavingsInr: number;
  locationCityState: string;
  willingToRelocate: boolean;
  willingToWorkWhileStudying: boolean;
  preparationYearsAvailable: number;
  categoryOrMeritScholarshipInterest: boolean;
}

export interface BudgetBypassPathway {
  id: string;
  category: string;
  name: string;
  eligibility: string;
  estimatedBenefit: string;
  requiredDocuments: string[];
  applicationWindow: string;
  officialUrl: string;
  conditions: string;
  verifiedDate: string;
  applicableTiers: FinancialCapacityTier[];
}

export interface CareerBudgetResult {
  input: CareerBudgetInput;
  capacityTier: FinancialCapacityTier;
  maxFeasibleTotalBudgetInr: number;
  bypassPathways: BudgetBypassPathway[];
  pathwayComparisons: Array<{
    mode:
      | 'Full-Cost Pathway'
      | 'Reduced-Cost Public Pathway'
      | 'Scholarship-Supported Pathway'
      | 'Earn-and-Learn Pathway'
      | 'Staged Certification Pathway';
    estimatedTotalCostInr: number;
    estimatedDurationYears: number;
    feasibility: 'Comfortable' | 'Achievable with Aid' | 'Stretch';
    notes: string;
  }>;
  completedAt: string;
}

export interface CareerMarketOpportunity {
  id: string;
  title: string;
  industry: string;
  category: string;
  scope: 'India' | 'International' | 'India & International';
  countries: string[];
  requiredEducation: string;
  entryQualifications: string[];
  employmentDemand: 'Very High' | 'High' | 'Steady' | 'Selective';
  indiaSalaryRangeInr: string;
  internationalSalaryRange?: string;
  growthOutlook: string;
  certifications: string[];
  coreSkills: string[];
  emergingSkills: string[];
  competitionLevel: 'High' | 'Moderate-High' | 'Moderate' | 'Specialized';
  competitionNotes: string;
  entryBarriers: string;
  licensingOrVisaNotes: string;
  estimatedIndiaCostInr: number;
  estimatedAbroadCostInr?: number;
  preparationMonths: number;
  sourceName: string;
  sourceDate: string;
  sourceScope: string;
  targetEnvironments: string[];
  capacityFocus: Array<'iq' | 'eq' | 'aq' | 'cq'>;
  alternativeEntryRoutes: string[];
}

export interface CareerMatchedOpportunity {
  opportunity: CareerMarketOpportunity;
  capacityMatchNote: string;
  personalityFitNote: string;
  budgetFitNote: string;
  whyItMatches: string[];
  alreadyPossessed: string[];
  missingGaps: string[];
  risks: string[];
  rankReason: string;
}

export interface CareerRoadmapMilestone {
  horizon: 'TODAY' | 'NEXT 7 DAYS' | 'NEXT 30 DAYS' | 'NEXT 90 DAYS' | 'NEXT 6 MONTHS' | 'NEXT 12 MONTHS';
  objective: string;
  timeRequirement: string;
  estimatedCostInr: number;
  learningResource: string;
  expectedOutput: string;
  completionCriteria: string;
}

export interface CareerUserWorkspaceState {
  userId: string;
  stage1Capacity?: CareerCapacityResult | null;
  stage2Personality?: CareerPersonalityResult | null;
  stage3Budget?: CareerBudgetResult | null;
  selectedCareerIds: string[];
  stage4Matches: CareerMatchedOpportunity[];
  stage5Roadmap?: {
    targetCareerId: string;
    targetCareerTitle: string;
    measurableCompetitionFacts: string[];
    qualitativeMarketAssessment: string[];
    skillGap: {
      demonstrated: string[];
      needsImprovement: string[];
      missingQualifications: string[];
      certifications: string[];
      experienceGaps: string[];
      communicationGaps: string[];
    };
    milestones: CareerRoadmapMilestone[];
    generatedAt: string;
  } | null;
  savedReports: Array<{
    id: string;
    createdAt: string;
    title: string;
    topCareerTitle: string;
    summary: string;
  }>;
  updatedAt: string;
}

export interface ProductEnquiryRecord {
  id: string;
  product: 'School ERP' | 'SSB Academy' | 'Career Intelligence' | 'Smart Campus' | 'AI Learning Ecosystem';
  name: string;
  email: string;
  phone: string;
  organizationOrGoal: string;
  message: string;
  status: 'New' | 'Contacted' | 'Converted' | 'Closed';
  createdAt: string;
}
