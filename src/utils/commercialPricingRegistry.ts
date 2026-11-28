import type { CommercialPricingRegistry } from '../types/flagshipProducts';

/**
 * Single Central Commercial Pricing Registry (Source of Truth for /pricing, product pages & Super Admin).
 * Aligned with Section 19 + Rai Plus Revised Product & Pricing Brochure 2026-27.
 * SSB Academy defaults to 'enquiry_only' until Super Admin explicitly approves & publishes prices.
 * Career Intelligence is permanently FREE (₹0).
 */
export function createDefaultCommercialPricingRegistry(): CommercialPricingRegistry {
  const now = new Date().toISOString().slice(0, 10);
  return {
    gstPct: 18,
    gstDisclaimer:
      'All proposed annual subscription prices are in INR before 18% GST and subject to approved commercial configuration and signed order form.',
    topLearnerRewardsRule: {
      enabledInCalculator: true,
      minMonthlyPerClassInr: 500,
      maxMonthlyPerClassInr: 1000,
      schoolWideMonthlyInr: 1000,
      managedCampusTeamMonthlyInr: 175000,
    },
    schoolPackages: [
      {
        id: 'foundation',
        name: 'Foundation',
        tagline: 'Basic school administration and ERP.',
        annualPerStudentInr: 199,
        features: [
          'Student 360° profiles & digital admission enquiry',
          'One-Go daily attendance, monthly heatmaps & parent alerts',
          'Notebook checking, homework diary & standard report cards',
          'Fee ledger, sibling receipts & digital gate pass / visitors register',
          'Isolated multi-tenant school database & RBAC audit trail',
        ],
        usageLimitsNote: 'Standard cloud hosting & daily backups; SMS/WhatsApp/GPS hardware billed per usage.',
        active: true,
      },
      {
        id: 'growth',
        name: 'Growth',
        tagline: 'ERP, timetable, HR, admissions and management intelligence.',
        annualPerStudentInr: 399,
        highlightBadge: 'Most Popular',
        features: [
          'Everything in Foundation',
          'School Control Room live timeline & Smart Academic Calendar',
          'Smart Timetable with drag-and-drop optimizer & substitution engine',
          'Staff attendance, automated salary sync & HR governance',
          'Admissions CRM, home visits & Tally-ready accounting exports',
        ],
        usageLimitsNote: 'Includes defined monthly AI assistant quota per school; third-party messaging metered.',
        active: true,
      },
      {
        id: 'intelligence',
        name: 'Intelligence',
        tagline: 'Growth features plus AI learning, testing, Brain Gym and gamification.',
        annualPerStudentInr: 699,
        highlightBadge: 'Best Value',
        features: [
          'Everything in Growth',
          'Classes 6–12 Interactive Learning Portal (127 chapters & 394 visuals)',
          'Quick Revise Study Games, 6-Domain VCIP Cognitive Testing & Daily Brain Gym',
          'AI Inventory, Fixed Assets, QR Studio & Procurement Optimization',
          'NEP 2020 holistic progress cards & 15-OLQ growth dashboards',
        ],
        usageLimitsNote: 'AI recommendations & labs governed by defined per-student session entitlements.',
        active: true,
      },
      {
        id: 'infinity',
        name: 'Infinity',
        tagline: 'Complete digital curriculum, interactive labs, virtual experiences and advanced intelligence.',
        annualPerStudentInr: 999,
        highlightBadge: 'Complete Suite',
        features: [
          'Everything in Intelligence',
          'Complete digital curriculum, Interactive 3D Concept Labs & Reading/Numeracy Lab',
          'RCI-aligned Clinical, Speech, Dyslexia & Special Education Care 360°',
          'Psychometric & Career Intelligence Guidance Suite + Trustee Analytics',
          'Priority onboarding, multi-campus governance & dedicated SLA support',
        ],
        usageLimitsNote: 'Full digital suite within agreed campus entitlement; optional on-site Managed Campus team available.',
        active: true,
      },
    ],
    standaloneModules: [
      {
        id: 'mod-smart-timetable',
        name: 'Smart Timetable',
        billingBasis: 'tiered_school_year',
        priceSummary: 'Basic ₹2,999 · Advanced ₹4,999 · AI ₹7,999 / year',
        numericAmountInr: 4999,
        tiers: [
          { label: 'Basic', amountInr: 2999 },
          { label: 'Advanced', amountInr: 4999 },
          { label: 'AI', amountInr: 7999 },
        ],
        description: 'Drag-and-drop weekly schedule, conflict guards, and intelligent substitute allocation.',
        active: true,
      },
      {
        id: 'mod-hrms',
        name: 'HRMS & Attendance Payroll',
        billingBasis: 'per_staff_month',
        priceSummary: 'Proposed ₹50–₹65 / staff / month',
        numericAmountInr: 55,
        description: 'Staff attendance, leave balances, salary computation, and audited payroll slips.',
        active: true,
      },
      {
        id: 'mod-inventory',
        name: 'Inventory & Asset Management AI',
        billingBasis: 'per_school_year',
        priceSummary: '₹2,999 / school / year',
        numericAmountInr: 2999,
        description: 'Consumables ledger, QR fixed assets, procurement workflow, audits & AI optimization.',
        active: true,
      },
      {
        id: 'mod-library',
        name: 'Library Management',
        billingBasis: 'per_school_year',
        priceSummary: '₹2,999 / school / year',
        numericAmountInr: 2999,
        description: 'Catalogue, barcode issue/return, overdue tracking, and reading analytics.',
        active: true,
      },
      {
        id: 'mod-teacher-productivity',
        name: 'Teacher Productivity Analytics',
        billingBasis: 'per_school_year',
        priceSummary: '₹2,999 / school / year',
        numericAmountInr: 2999,
        description: 'Syllabus pacing, notebook check velocity, and lesson-plan governance.',
        active: true,
      },
      {
        id: 'mod-counselling',
        name: 'Counselling Management',
        billingBasis: 'per_school_year',
        priceSummary: '₹2,999 / school / year',
        numericAmountInr: 2999,
        description: 'Confidential student wellbeing records, session logs & parent follow-ups.',
        active: true,
      },
      {
        id: 'mod-cognitive',
        name: 'Cognitive Testing (VCIP)',
        billingBasis: 'per_student_year',
        priceSummary: '₹49 / student / year',
        numericAmountInr: 49,
        description: 'Original 6-domain longitudinal reasoning & cognitive skill benchmarking.',
        active: true,
      },
      {
        id: 'mod-brain-gym',
        name: 'Daily Brain Gym',
        billingBasis: 'per_student_year',
        priceSummary: '₹79 / student / year',
        numericAmountInr: 79,
        description: '5-minute daily memory, focus, and analytical habit-building exercises.',
        active: true,
      },
      {
        id: 'mod-digital-curriculum',
        name: 'Digital Curriculum (Classes 6–12)',
        billingBasis: 'per_student_year',
        priceSummary: '₹99 / student / year',
        numericAmountInr: 99,
        description: '127 interactive chapters, 394 visuals/3D models, flashcards & Syllabus Monitor.',
        active: true,
      },
      {
        id: 'mod-interactive-labs',
        name: 'Interactive Concept & Science Labs',
        billingBasis: 'per_school_year',
        priceSummary: 'Configured per lab pack (₹4,999 / school / year base)',
        numericAmountInr: 4999,
        description: 'Virtual physics, chemistry, maths, abacus & visual concept lab modules.',
        active: true,
      },
    ],
    ssbAcademy: {
      productName: 'Rai Plus SSB Academy',
      // Commercial rule: Do NOT invent or publicly display an unapproved SSB price until Super Admin approves!
      priceStatus: 'enquiry_only',
      enquiryCtaLabel: 'Request Early Access & Official Fee Schedule',
      monthlyInr: null,
      quarterlyInr: null,
      halfYearlyInr: null,
      annualInr: null,
      trialDays: 7,
      freeDemoSetsIncluded: 4,
      paidSetsIncluded: 100,
      gstPct: 18,
      benefits: [
        '100 structured practice sets across WAT, SRT, TAT & PPDT',
        'Timed real-exam practice mode + response-specific AI coaching',
        'Multi-evidence 15-OLQ behavioural development profile',
        'PPDT narration recorder & multi-perspective Group Discussion simulator',
        'Adaptive weekly & monthly improvement plan + downloadable PDF/JSON reports',
      ],
      coupons: [
        {
          code: 'DEFENCE-EARLY',
          discountPct: 20,
          active: true,
          expiresOn: '2027-03-31',
          note: 'Early-access cohort discount once pricing is published',
        },
      ],
      updatedAt: now,
      updatedBy: 'System Default (Unpriced until Super Admin approval)',
    },
    careerIntelligence: {
      productName: 'Rai Plus Career Intelligence',
      tagline: 'Understand Your Potential. Discover Your Possibilities. Build Your Future.',
      priceInr: 0,
      alwaysFreeGuarantee:
        '100% Free Forever for individual students & learners — no credit card required, no hidden paywall on the 5-stage report.',
      includedCapabilities: [
        'Stage 1: IQ, EQ, AQ & CQ Multi-Dimensional Capacity Profile',
        'Stage 2: Personality & 12 Working Environment Fit Analysis',
        'Stage 3: Financial Budget Analyzer & 18-Route Budget Constraint Bypass Engine',
        'Stage 4: India & International Career Market Intelligence (with verified sources)',
        'Stage 5: Competition Analysis, Skill Gap & 12-Month Free-Resource Roadmap',
        'Saveable 16-Section Career Intelligence Report & 3-Pathway Comparison Matrix',
      ],
    },
    publicCms: {
      ssbAcademy: {
        published: true,
        headline: 'Prepare Your Thinking. Develop Your Officer-Like Qualities. Train with Purpose.',
        subheading:
          'Structured SSB practice for future officers. Practise WAT, SRT, TAT and PPDT, understand your response patterns and build the qualities required for effective leadership.',
        primaryCta: 'START YOUR SSB PREPARATION',
        secondaryCta: 'EXPLORE FREE DEMO',
      },
      careerIntelligence: {
        published: true,
        headline: 'Discover What You Can Become. Find a Career That Fits Your Potential.',
        subheading:
          'Your capacity, personality, budget and the real-world job market should work together when you choose your future.',
        primaryCta: 'START MY FREE CAREER ANALYSIS',
        secondaryCta: 'EXPLORE THE FIVE STEPS',
      },
      smartCampusEnabled: true,
    },
    updatedAt: now,
    updatedBy: 'Platform Registry',
  };
}

export function computeSchoolAnnualQuote(params: {
  registry: CommercialPricingRegistry;
  packageId: 'foundation' | 'growth' | 'intelligence' | 'infinity';
  studentsCount: number;
  classesCount: number;
  includeTopLearnerRewards: boolean;
  includeManagedCampus: boolean;
}): {
  softwareSubtotalInr: number;
  rewardsProvisionInr: number;
  managedCampusInr: number;
  preGstTotalInr: number;
  gstInr: number;
  grandTotalInr: number;
  effectivePerStudentInr: number;
} {
  const pkg =
    params.registry.schoolPackages.find((p) => p.id === params.packageId) ||
    params.registry.schoolPackages[0]!;
  const students = Math.max(50, Math.round(params.studentsCount || 500));
  const classes = Math.max(1, Math.round(params.classesCount || 12));
  const softwareSubtotalInr = students * pkg.annualPerStudentInr;
  const rewardsProvisionInr = params.includeTopLearnerRewards
    ? (classes * params.registry.topLearnerRewardsRule.maxMonthlyPerClassInr +
        params.registry.topLearnerRewardsRule.schoolWideMonthlyInr) *
      12
    : 0;
  const managedCampusInr = params.includeManagedCampus
    ? params.registry.topLearnerRewardsRule.managedCampusTeamMonthlyInr * 12
    : 0;
  const preGstTotalInr = softwareSubtotalInr + rewardsProvisionInr + managedCampusInr;
  const gstInr = Math.round((preGstTotalInr * params.registry.gstPct) / 100);
  const grandTotalInr = preGstTotalInr + gstInr;
  return {
    softwareSubtotalInr,
    rewardsProvisionInr,
    managedCampusInr,
    preGstTotalInr,
    gstInr,
    grandTotalInr,
    effectivePerStudentInr: Math.round(preGstTotalInr / students),
  };
}
