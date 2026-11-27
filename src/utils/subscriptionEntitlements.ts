import type {
  AttendanceMarkingMode,
  School,
  SubscriptionPlanPricingOverride,
  UserAccount,
} from '../types';
import type { WorkspaceTab } from '../types/workspace';

export type SubscriptionTierId =
  | 'Starter ERP'
  | 'Growth ERP'
  | 'Premium Campus'
  | 'Enterprise 360°';

export type PlatformFeatureCategory =
  | 'Core ERP'
  | 'Academics & Engagement'
  | 'Premium Campus & Maps'
  | 'Enterprise Diagnostics & Care';

export type PlatformFeatureKey =
  | 'core_attendance_notebook'
  | 'attendance_manual'
  | 'attendance_rfid'
  | 'attendance_biometric'
  | 'marks_report_cards'
  | 'student_360'
  | 'finance_fees'
  | 'school_operations'
  | 'quick_revise_resources'
  | 'events_calendar'
  | 'smart_timetable_leave'
  | 'admissions_crm'
  | 'transport_basic'
  | 'google_maps_gps'
  | 'interactive_learning_lab'
  | 'reading_numeracy_lab'
  | 'intelligence_games'
  | 'cognitive_vcip_thinking'
  | 'psychometric_career'
  | 'clinical_remedial_care';

export interface PlatformFeatureSpec {
  key: PlatformFeatureKey;
  label: string;
  category: PlatformFeatureCategory;
  description: string;
  includedInPlans: SubscriptionTierId[];
  governedTabs: WorkspaceTab[];
  isCore?: boolean;
}

export interface SubscriptionPlanSpec {
  id: SubscriptionTierId;
  tierCategory: 'Standard' | 'Premium';
  googleMapsEnabled: boolean;
  headline: string;
  transportCapabilities: string;
  priceMonthlyInr: number;
  defaultFeatures: PlatformFeatureKey[];
}

export const PLATFORM_FEATURES: PlatformFeatureSpec[] = [
  // Core ERP (Included in Starter ERP and above)
  {
    key: 'core_attendance_notebook',
    label: 'Attendance Heatmap & Notebook Check',
    category: 'Core ERP',
    description: 'Daily attendance ledger, monthly heatmaps, notebook verification & homework tracking.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['attendance_heatmap', 'notebook', 'today_workspace'],
    isCore: true,
  },
  {
    key: 'attendance_manual',
    label: 'Manual Attendance Roll Call',
    category: 'Core ERP',
    description: 'One-go whole-class manual roll call by teachers with instant parent alerts.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: [],
    isCore: true,
  },
  {
    key: 'marks_report_cards',
    label: 'Marks Dashboard & Holistic Report Cards',
    category: 'Core ERP',
    description: 'Class Test, UT & Semester exam marks entry with parent-visible skill report cards.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['marks_report_card'],
    isCore: true,
  },
  {
    key: 'student_360',
    label: 'Student 360° & OLQ Profiles',
    category: 'Core ERP',
    description: 'Unified student profiles, yearly skill plans, absence risk alerts & Learners Score.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['students'],
    isCore: true,
  },
  {
    key: 'finance_fees',
    label: 'Finance 360°, Staff Attendance & Payroll',
    category: 'Core ERP',
    description: 'Fee receipts, sibling family groups, accounting ledgers, staff attendance salary sync & payroll.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['finance', 'families', 'staff_payroll'],
  },
  {
    key: 'school_operations',
    label: 'School Control Room, Smart Calendar, Gate Pass & Governance',
    category: 'Core ERP',
    description: 'Live School Control Room timeline, Smart Academic Calendar & rescheduling engine, digital gate pass, visitors register & audit logs.',
    includedInPlans: ['Starter ERP', 'Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['operations', 'campus_gate', 'control_room', 'academic_calendar', 'learning_portal', 'inventory_assets'],
    isCore: true,
  },

  // Academics & Engagement (Included in Growth ERP and above)
  {
    key: 'quick_revise_resources',
    label: 'Quick Revise Study Games & Class Resources',
    category: 'Academics & Engagement',
    description: 'Gamified chapter/topic revision, Revision Streak reminders & teacher-pushed resources.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['academics', 'academic_resources'],
  },
  {
    key: 'events_calendar',
    label: 'School Events Calendar & Participation',
    category: 'Academics & Engagement',
    description: 'Upcoming events, parent participation requests, progress reports & coordinator issue tracking.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['events'],
  },
  {
    key: 'smart_timetable_leave',
    label: 'Smart Timetable, Substitutions & Productivity',
    category: 'Academics & Engagement',
    description: 'Automated teacher substitutions, leave balances, timetable matrix & productivity KPIs.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['timetable_leave', 'productivity'],
  },
  {
    key: 'admissions_crm',
    label: 'Admissions Pipeline & Home Visits',
    category: 'Academics & Engagement',
    description: 'Admission lead tracking, counselling follow-ups, home visits & bus route matching.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['admissions'],
  },
  {
    key: 'attendance_rfid',
    label: 'RFID Smart Card Attendance',
    category: 'Academics & Engagement',
    description: 'Contactless RFID student ID card tap check-in at school gates, classrooms & buses.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: [],
  },
  {
    key: 'transport_basic',
    label: 'Transport Rosters & Capacity Calculator',
    category: 'Academics & Engagement',
    description: 'Bus route rosters, seat capacity tracking, stop timetables & morning/evening roll call.',
    includedInPlans: ['Growth ERP', 'Premium Campus', 'Enterprise 360°'],
    governedTabs: ['transport'],
  },

  // Premium Campus & Maps (Included in Premium Campus and Enterprise 360°)
  {
    key: 'attendance_biometric',
    label: 'Biometric Attendance (Fingerprint / Face)',
    category: 'Premium Campus & Maps',
    description: 'Hardware biometric fingerprint & facial recognition terminal sync for verified attendance.',
    includedInPlans: ['Premium Campus', 'Enterprise 360°'],
    governedTabs: [],
  },
  {
    key: 'google_maps_gps',
    label: 'Google Maps Live GPS & Pin-Drop Route Optimizer',
    category: 'Premium Campus & Maps',
    description: 'Live Google Maps fleet tracking, parent single-bus map, geocoding & geolocation optimizer.',
    includedInPlans: ['Premium Campus', 'Enterprise 360°'],
    governedTabs: [],
  },
  {
    key: 'interactive_learning_lab',
    label: 'AI Interactive Learning Lab, Abacus & Simulations',
    category: 'Premium Campus & Maps',
    description: 'AI Chapter Intelligence blueprints, 20-format games, Digital Soroban Abacus & Chapter Coverage.',
    includedInPlans: ['Premium Campus', 'Enterprise 360°'],
    governedTabs: ['interactive_learning'],
  },
  {
    key: 'reading_numeracy_lab',
    label: 'Reading Fluency & Numeracy Diagnostic Lab',
    category: 'Premium Campus & Maps',
    description: 'Timed oral reading assessments, WPM diagnostics & structured numeracy fluency tests.',
    includedInPlans: ['Premium Campus', 'Enterprise 360°'],
    governedTabs: ['assessments'],
  },
  {
    key: 'intelligence_games',
    label: 'Intelligence Games & Cognitive Boosters',
    category: 'Premium Campus & Maps',
    description: 'Logic, memory, visual reasoning & executive-function training games.',
    includedInPlans: ['Premium Campus', 'Enterprise 360°'],
    governedTabs: ['games'],
  },

  // Enterprise Diagnostics & Care (Included in Enterprise 360°)
  {
    key: 'cognitive_vcip_thinking',
    label: 'Cognitive Profile (VCIP) & Thinking Tests',
    category: 'Enterprise Diagnostics & Care',
    description: 'VCIP cognitive profiling, Daily Brain Gym & OLQ thinking assessment batteries.',
    includedInPlans: ['Enterprise 360°'],
    governedTabs: ['cognitive_profile', 'thinking'],
  },
  {
    key: 'psychometric_career',
    label: 'Psychometric Suite, Computer Skills & Career AI',
    category: 'Enterprise Diagnostics & Care',
    description: 'Psychometric aptitude profiling, SSB/computer skill benchmarks & career guidance plans.',
    includedInPlans: ['Enterprise 360°'],
    governedTabs: ['psychometric', 'computer_skills', 'career'],
  },
  {
    key: 'clinical_remedial_care',
    label: 'Clinical & Care 360° & Developmental Remedials',
    category: 'Enterprise Diagnostics & Care',
    description: 'SLP, audiology, clinical psychology workflows, RCI care notes & remedial therapy plans.',
    includedInPlans: ['Enterprise 360°'],
    governedTabs: ['clinical_care', 'remedials'],
  },
];

export const ALL_PLATFORM_FEATURE_KEYS: PlatformFeatureKey[] = PLATFORM_FEATURES.map((f) => f.key);
const VALID_FEATURE_KEY_SET = new Set<string>(ALL_PLATFORM_FEATURE_KEYS);

export const FEATURE_CATEGORY_ORDER: PlatformFeatureCategory[] = [
  'Core ERP',
  'Academics & Engagement',
  'Premium Campus & Maps',
  'Enterprise Diagnostics & Care',
];

function featuresForPlan(planId: SubscriptionTierId): PlatformFeatureKey[] {
  return PLATFORM_FEATURES.filter((f) => f.includedInPlans.includes(planId)).map((f) => f.key);
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanSpec[] = [
  {
    id: 'Starter ERP',
    tierCategory: 'Standard',
    googleMapsEnabled: false,
    headline: 'Core Attendance, Fees, Marks & Report Cards',
    transportCapabilities:
      'Bus rosters, route timetables, morning/evening roll call & capacity calculator (no Google Maps)',
    priceMonthlyInr: 4999,
    defaultFeatures: featuresForPlan('Starter ERP'),
  },
  {
    id: 'Growth ERP',
    tierCategory: 'Standard',
    googleMapsEnabled: false,
    headline: 'Full School ERP, Quick Revise, Events & Admissions CRM',
    transportCapabilities:
      'Bus rosters, route attendance, area segregation & locality route matching (no Google Maps)',
    priceMonthlyInr: 8999,
    defaultFeatures: featuresForPlan('Growth ERP'),
  },
  {
    id: 'Premium Campus',
    tierCategory: 'Premium',
    googleMapsEnabled: true,
    headline: 'AI Interactive Learning Lab, Live Google Maps GPS & Diagnostics',
    transportCapabilities:
      'Live interactive Google Maps GPS fleet view, parent single-bus live map, address geocoding & pin-drop optimizer',
    priceMonthlyInr: 14999,
    defaultFeatures: featuresForPlan('Premium Campus'),
  },
  {
    id: 'Enterprise 360°',
    tierCategory: 'Premium',
    googleMapsEnabled: true,
    headline: 'Complete Education Intelligence, Clinical Care 360° & Fleet GPS Suite',
    transportCapabilities:
      'Unlimited Google Maps live fleet GPS, pin-drop route efficiency optimization, server-side address geocoding & multi-campus analytics',
    priceMonthlyInr: 22999,
    defaultFeatures: featuresForPlan('Enterprise 360°'),
  },
];

const PREMIUM_KEYWORDS = ['premium', 'enterprise', '360', 'pro', 'elite'];

export function resolvePlanTierId(subscriptionPlan?: string | null): SubscriptionTierId {
  const normalized = (subscriptionPlan || '').trim().toLowerCase();
  const exact = SUBSCRIPTION_PLANS.find((p) => p.id.toLowerCase() === normalized);
  if (exact) return exact.id;
  if (normalized.includes('enterprise') || normalized.includes('360')) return 'Enterprise 360°';
  if (normalized.includes('premium') || normalized.includes('pro') || normalized.includes('elite')) {
    return 'Premium Campus';
  }
  if (normalized.includes('starter') || normalized.includes('basic')) return 'Starter ERP';
  return 'Growth ERP';
}

export function getPlanDefaultFeatures(subscriptionPlan?: string | null): PlatformFeatureKey[] {
  const tierId = resolvePlanTierId(subscriptionPlan);
  const spec = SUBSCRIPTION_PLANS.find((p) => p.id === tierId);
  return spec ? [...spec.defaultFeatures] : featuresForPlan('Growth ERP');
}

/**
 * Validates and strips any unknown keys from a custom feature override payload.
 */
export function sanitizeFeatureOverrides(
  overrides: Record<string, unknown> | undefined | null,
  planDefaults?: PlatformFeatureKey[],
): Record<string, boolean> {
  if (!overrides || typeof overrides !== 'object') return {};
  const defaultSet = planDefaults ? new Set<string>(planDefaults) : null;
  const clean: Record<string, boolean> = {};
  for (const [key, val] of Object.entries(overrides)) {
    if (!VALID_FEATURE_KEY_SET.has(key) || typeof val !== 'boolean') continue;
    // Only store genuine overrides that differ from plan defaults when planDefaults provided
    if (defaultSet && defaultSet.has(key) === val) continue;
    clean[key] = val;
  }
  return clean;
}

/**
 * Resolves the effective enabled features for a school by applying Super Admin's
 * custom per-school overrides on top of the school's paid subscription plan defaults.
 */
export function getEnabledFeaturesForSchool(
  school?: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'> | null,
): PlatformFeatureKey[] {
  const defaults = new Set<PlatformFeatureKey>(getPlanDefaultFeatures(school?.subscriptionPlan));
  const overrides = school?.customFeatureOverrides;
  if (overrides && typeof overrides === 'object') {
    for (const [key, allowed] of Object.entries(overrides)) {
      if (!VALID_FEATURE_KEY_SET.has(key) || typeof allowed !== 'boolean') continue;
      if (allowed) {
        defaults.add(key as PlatformFeatureKey);
      } else {
        defaults.delete(key as PlatformFeatureKey);
      }
    }
    return ALL_PLATFORM_FEATURE_KEYS.filter((k) => defaults.has(k));
  }
  if (Array.isArray(school?.enabledFeatures) && school.enabledFeatures.length > 0) {
    const valid = school.enabledFeatures.filter((k): k is PlatformFeatureKey =>
      VALID_FEATURE_KEY_SET.has(k),
    );
    if (valid.length > 0) return valid;
  }
  return ALL_PLATFORM_FEATURE_KEYS.filter((k) => defaults.has(k));
}

export function isFeatureEnabledForSchool(
  school: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'> | null | undefined,
  featureKey: PlatformFeatureKey,
): boolean {
  return getEnabledFeaturesForSchool(school).includes(featureKey);
}

export function countCustomOverridesForSchool(
  school?: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides'> | null,
): { added: number; removed: number; total: number } {
  const defaults = new Set<string>(getPlanDefaultFeatures(school?.subscriptionPlan));
  const overrides = school?.customFeatureOverrides || {};
  let added = 0;
  let removed = 0;
  for (const [key, val] of Object.entries(overrides)) {
    if (!VALID_FEATURE_KEY_SET.has(key) || typeof val !== 'boolean') continue;
    if (val && !defaults.has(key)) added += 1;
    if (!val && defaults.has(key)) removed += 1;
  }
  return { added, removed, total: added + removed };
}

/**
 * Maps a workspace tab to its governing platform feature key (returns null for always-available Overview/Alerts/Allotment).
 */
export function getFeatureKeyForWorkspaceTab(tab: WorkspaceTab): PlatformFeatureKey | null {
  if (tab === 'overview' || tab === 'alerts' || tab === 'feature_allotment') return null;
  const spec = PLATFORM_FEATURES.find((f) => f.governedTabs.includes(tab));
  return spec ? spec.key : null;
}

export function isWorkspaceTabEnabledForSchool(
  school: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'> | null | undefined,
  tab: WorkspaceTab,
): boolean {
  const featureKey = getFeatureKeyForWorkspaceTab(tab);
  if (!featureKey) return true;
  return isFeatureEnabledForSchool(school, featureKey);
}

/**
 * Returns true when a school or subscription package has Google Maps Platform access.
 * Supports either a plan name string OR a full School object (respecting Super Admin custom overrides).
 */
export function hasGoogleMapsAccess(
  schoolOrPlan?:
    | string
    | null
    | Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'>,
): boolean {
  if (!schoolOrPlan) return false;
  if (typeof schoolOrPlan === 'object') {
    return isFeatureEnabledForSchool(schoolOrPlan, 'google_maps_gps');
  }
  const normalized = schoolOrPlan.trim().toLowerCase();
  if (!normalized) return false;
  return PREMIUM_KEYWORDS.some((kw) => normalized.includes(kw));
}

export function getPackageEntitlements(
  schoolOrPlan?:
    | string
    | null
    | Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'>,
): {
  planName: string;
  isPremium: boolean;
  googleMapsEnabled: boolean;
  liveGpsMapEnabled: boolean;
  addressGeocodingEnabled: boolean;
  pinDropOptimizerMapEnabled: boolean;
  upgradeTargetPlan: SubscriptionTierId;
  enabledFeatures: PlatformFeatureKey[];
} {
  const planName =
    typeof schoolOrPlan === 'object' && schoolOrPlan !== null
      ? (schoolOrPlan.subscriptionPlan || 'Growth ERP').trim() || 'Growth ERP'
      : (schoolOrPlan || 'Growth ERP').trim() || 'Growth ERP';
  const googleMapsEnabled = hasGoogleMapsAccess(schoolOrPlan);
  const isPremium = hasGoogleMapsAccess(planName);
  const enabledFeatures =
    typeof schoolOrPlan === 'object' && schoolOrPlan !== null
      ? getEnabledFeaturesForSchool(schoolOrPlan)
      : getPlanDefaultFeatures(planName);

  return {
    planName,
    isPremium,
    googleMapsEnabled,
    liveGpsMapEnabled: googleMapsEnabled,
    addressGeocodingEnabled: googleMapsEnabled,
    pinDropOptimizerMapEnabled: googleMapsEnabled,
    upgradeTargetPlan: 'Premium Campus',
    enabledFeatures,
  };
}

export interface AttendanceModeSpec {
  mode: AttendanceMarkingMode;
  featureKey: 'attendance_manual' | 'attendance_rfid' | 'attendance_biometric';
  label: string;
  shortLabel: string;
  defaultPlanHint: string;
  description: string;
}

export const ATTENDANCE_MODE_SPECS: AttendanceModeSpec[] = [
  {
    mode: 'manual',
    featureKey: 'attendance_manual',
    label: 'Manual Roll Call',
    shortLabel: 'Manual',
    defaultPlanHint: 'Included in all plans',
    description: 'Teacher marks Present, Absent, or Leave directly in One-Go class roster.',
  },
  {
    mode: 'rfid',
    featureKey: 'attendance_rfid',
    label: 'RFID Smart Card',
    shortLabel: 'RFID Card',
    defaultPlanHint: 'Included in Growth ERP & above',
    description: 'Instant student check-in by tapping school RFID ID card at gate or class reader.',
  },
  {
    mode: 'biometric',
    featureKey: 'attendance_biometric',
    label: 'Biometric Terminal',
    shortLabel: 'Biometric',
    defaultPlanHint: 'Included in Premium Campus & above',
    description: 'Verified fingerprint or facial recognition attendance synced from campus terminals.',
  },
];

export function getAttendanceFeatureKeyForMode(
  mode: AttendanceMarkingMode,
): 'attendance_manual' | 'attendance_rfid' | 'attendance_biometric' {
  if (mode === 'rfid') return 'attendance_rfid';
  if (mode === 'biometric') return 'attendance_biometric';
  return 'attendance_manual';
}

export function isAttendanceModeEnabledForSchool(
  school: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'> | null | undefined,
  mode: AttendanceMarkingMode,
): boolean {
  return isFeatureEnabledForSchool(school, getAttendanceFeatureKeyForMode(mode));
}

export function getAllowedAttendanceModesForSchool(
  school?: Pick<School, 'subscriptionPlan' | 'customFeatureOverrides' | 'enabledFeatures'> | null,
): AttendanceMarkingMode[] {
  return ATTENDANCE_MODE_SPECS.filter((spec) =>
    isFeatureEnabledForSchool(school, spec.featureKey),
  ).map((spec) => spec.mode);
}

/**
 * Only the COO of Rai Plus is authorized to customize global subscription plan catalog prices.
 */
export function isRaiPlusCoo(
  user?: Pick<UserAccount, 'role' | 'designation' | 'isPlatformCoo'> | null,
): boolean {
  if (!user || user.role !== 'super_admin') return false;
  if (user.isPlatformCoo === true) return true;
  return /\bcoo\b|chief operating officer/i.test(user.designation || '');
}

export interface ResolvedSubscriptionPlanSpec extends SubscriptionPlanSpec {
  defaultPriceMonthlyInr: number;
  annualDiscountPct: number;
  priceCustomized: boolean;
  priceUpdatedAt?: string;
  priceUpdatedBy?: string;
  priceNote?: string;
  defaultAttendanceModes: AttendanceMarkingMode[];
}

export function resolveSubscriptionPlans(
  pricingCatalog?: Record<string, SubscriptionPlanPricingOverride> | null,
): ResolvedSubscriptionPlanSpec[] {
  return SUBSCRIPTION_PLANS.map((plan) => {
    const override = pricingCatalog?.[plan.id];
    const hasCustomPrice =
      override &&
      typeof override.priceMonthlyInr === 'number' &&
      Number.isFinite(override.priceMonthlyInr) &&
      override.priceMonthlyInr >= 0;
    const priceMonthlyInr = hasCustomPrice ? Math.round(override.priceMonthlyInr) : plan.priceMonthlyInr;
    const annualDiscountPct =
      override &&
      typeof override.annualDiscountPct === 'number' &&
      Number.isFinite(override.annualDiscountPct)
        ? Math.min(50, Math.max(0, Math.round(override.annualDiscountPct)))
        : 10;
    const defaultAttendanceModes = ATTENDANCE_MODE_SPECS.filter((spec) =>
      plan.defaultFeatures.includes(spec.featureKey),
    ).map((spec) => spec.mode);

    return {
      ...plan,
      priceMonthlyInr,
      defaultPriceMonthlyInr: plan.priceMonthlyInr,
      annualDiscountPct,
      priceCustomized: Boolean(hasCustomPrice && priceMonthlyInr !== plan.priceMonthlyInr),
      priceUpdatedAt: override?.updatedAt,
      priceUpdatedBy: override?.updatedBy,
      priceNote: override?.note,
      defaultAttendanceModes,
    };
  });
}

export function getEffectivePlanPriceInr(
  subscriptionPlan: string | null | undefined,
  pricingCatalog?: Record<string, SubscriptionPlanPricingOverride> | null,
): number {
  const tierId = resolvePlanTierId(subscriptionPlan);
  const resolved = resolveSubscriptionPlans(pricingCatalog);
  return resolved.find((p) => p.id === tierId)?.priceMonthlyInr ?? 8999;
}

