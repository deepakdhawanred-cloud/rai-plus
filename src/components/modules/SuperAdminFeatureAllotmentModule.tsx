import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Crown,
  Fingerprint,
  IndianRupee,
  Lock,
  MapPin,
  PenLine,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';
import type {
  AttendanceMarkingMode,
  BoardType,
  School,
  SubscriptionBillingCycle,
  SubscriptionPaymentStatus,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  ALL_PLATFORM_FEATURE_KEYS,
  ATTENDANCE_MODE_SPECS,
  countCustomOverridesForSchool,
  FEATURE_CATEGORY_ORDER,
  getAllowedAttendanceModesForSchool,
  getEffectivePlanPriceInr,
  getEnabledFeaturesForSchool,
  getPlanDefaultFeatures,
  isRaiPlusCoo,
  PLATFORM_FEATURES,
  resolvePlanTierId,
  resolveSubscriptionPlans,
  sanitizeFeatureOverrides,
  type PlatformFeatureCategory,
  type PlatformFeatureKey,
  type SubscriptionTierId,
} from '../../utils/subscriptionEntitlements';
import { pushToast } from '../ToastProvider';

interface SuperAdminFeatureAllotmentModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

interface DraftAllotmentState {
  subscriptionPlan: SubscriptionTierId;
  customFeatureOverrides: Record<string, boolean>;
  paymentStatus: SubscriptionPaymentStatus;
  billingCycle: SubscriptionBillingCycle;
  paidAmountInr: number;
  validUntil: string;
  allotmentNotes: string;
  active: boolean;
}

function buildDraftFromSchool(
  school: School,
  pricingCatalog?: WorkspaceData['planPricingCatalog'],
): DraftAllotmentState {
  const tierId = resolvePlanTierId(school.subscriptionPlan);
  const planDefaults = getPlanDefaultFeatures(tierId);
  const effectiveCatalogPrice = getEffectivePlanPriceInr(tierId, pricingCatalog);
  return {
    subscriptionPlan: tierId,
    customFeatureOverrides: sanitizeFeatureOverrides(school.customFeatureOverrides, planDefaults),
    paymentStatus: school.paymentStatus || 'Paid',
    billingCycle: school.billingCycle || 'Annual',
    paidAmountInr:
      typeof school.paidAmountInr === 'number' ? school.paidAmountInr : effectiveCatalogPrice,
    validUntil: school.validUntil || '2027-03-31',
    allotmentNotes: school.allotmentNotes || '',
    active: school.active,
  };
}

function formatAttendanceModeList(modes: AttendanceMarkingMode[]): string {
  if (modes.length === 0) return 'None';
  return modes
    .map((m) => (m === 'manual' ? 'Manual' : m === 'rfid' ? 'RFID' : 'Biometric'))
    .join(' · ');
}

type ConsoleTab = 'allotment' | 'coo_pricing';

interface PlanPriceDraftRow {
  priceMonthlyInr: number;
  annualDiscountPct: number;
  note: string;
}

export const SuperAdminFeatureAllotmentModule: React.FC<
  SuperAdminFeatureAllotmentModuleProps
> = ({ data, token, onRefresh }) => {
  const schools = data.availableSchools.length > 0 ? data.availableSchools : [data.activeSchool];
  const isCoo = isRaiPlusCoo(data.user);
  const resolvedPlans = useMemo(
    () => resolveSubscriptionPlans(data.planPricingCatalog),
    [data.planPricingCatalog],
  );

  const [consoleTab, setConsoleTab] = useState<ConsoleTab>('allotment');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const [schoolQuery, setSchoolQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | PlatformFeatureCategory>('All');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // COO Plan Pricing Governance state
  const [pricingDraft, setPricingDraft] = useState<Record<SubscriptionTierId, PlanPriceDraftRow>>(
    () => {
      const initial = {} as Record<SubscriptionTierId, PlanPriceDraftRow>;
      for (const p of resolvedPlans) {
        initial[p.id] = {
          priceMonthlyInr: p.priceMonthlyInr,
          annualDiscountPct: p.annualDiscountPct,
          note: p.priceNote || '',
        };
      }
      return initial;
    },
  );
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    const synced = {} as Record<SubscriptionTierId, PlanPriceDraftRow>;
    for (const p of resolvedPlans) {
      synced[p.id] = {
        priceMonthlyInr: p.priceMonthlyInr,
        annualDiscountPct: p.annualDiscountPct,
        note: p.priceNote || '',
      };
    }
    setPricingDraft(synced);
  }, [resolvedPlans]);

  const hasUnsavedPricing = useMemo(
    () =>
      resolvedPlans.some((p) => {
        const row = pricingDraft[p.id];
        if (!row) return false;
        return (
          row.priceMonthlyInr !== p.priceMonthlyInr ||
          row.annualDiscountPct !== p.annualDiscountPct ||
          row.note.trim() !== (p.priceNote || '').trim()
        );
      }),
    [pricingDraft, resolvedPlans],
  );

  // Onboard new school panel state
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolBoard, setNewSchoolBoard] = useState<BoardType>('CBSE');
  const [newSchoolPlan, setNewSchoolPlan] = useState<SubscriptionTierId>('Growth ERP');
  const [creatingSchool, setCreatingSchool] = useState(false);

  const selectedSchool = useMemo(
    () => schools.find((s) => s.id === selectedSchoolId) || schools[0],
    [schools, selectedSchoolId],
  );

  const [draft, setDraft] = useState<DraftAllotmentState>(() =>
    selectedSchool
      ? buildDraftFromSchool(selectedSchool, data.planPricingCatalog)
      : {
          subscriptionPlan: 'Growth ERP',
          customFeatureOverrides: {},
          paymentStatus: 'Paid',
          billingCycle: 'Annual',
          paidAmountInr: getEffectivePlanPriceInr('Growth ERP', data.planPricingCatalog),
          validUntil: '2027-03-31',
          allotmentNotes: '',
          active: true,
        },
  );

  // Sync draft whenever selectedSchool changes or refreshed from server
  useEffect(() => {
    if (!selectedSchool) return;
    setDraft(buildDraftFromSchool(selectedSchool, data.planPricingCatalog));
    setErrorMsg(null);
  }, [
    selectedSchool?.id,
    selectedSchool?.subscriptionPlan,
    selectedSchool?.allotmentUpdatedAt,
    selectedSchool?.paymentStatus,
    selectedSchool?.paidAmountInr,
    selectedSchool?.active,
    data.planPricingCatalog,
  ]);

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) =>
      `${s.name} ${s.code} ${s.city} ${s.subscriptionPlan} ${s.board}`.toLowerCase().includes(q),
    );
  }, [schools, schoolQuery]);

  // Aggregate platform KPIs
  const platformStats = useMemo(() => {
    const activeCount = schools.filter((s) => s.active).length;
    const totalMonthlyValue = schools.reduce((sum, s) => {
      const catalogPrice = getEffectivePlanPriceInr(s.subscriptionPlan, data.planPricingCatalog);
      return sum + (typeof s.paidAmountInr === 'number' ? s.paidAmountInr : catalogPrice);
    }, 0);
    const customizedCount = schools.filter((s) => countCustomOverridesForSchool(s).total > 0).length;
    const hardwareAttendanceCount = schools.filter((s) => {
      const modes = getAllowedAttendanceModesForSchool(s);
      return modes.includes('rfid') || modes.includes('biometric');
    }).length;
    return { activeCount, totalMonthlyValue, customizedCount, hardwareAttendanceCount };
  }, [schools, data.planPricingCatalog]);

  const planDefaultsSet = useMemo(
    () => new Set<PlatformFeatureKey>(getPlanDefaultFeatures(draft.subscriptionPlan)),
    [draft.subscriptionPlan],
  );

  const draftEnabledFeatures = useMemo(
    () =>
      getEnabledFeaturesForSchool({
        subscriptionPlan: draft.subscriptionPlan,
        customFeatureOverrides: draft.customFeatureOverrides,
      }),
    [draft.subscriptionPlan, draft.customFeatureOverrides],
  );

  const draftEnabledSet = useMemo(() => new Set<string>(draftEnabledFeatures), [draftEnabledFeatures]);

  const draftOverrideStats = useMemo(
    () =>
      countCustomOverridesForSchool({
        subscriptionPlan: draft.subscriptionPlan,
        customFeatureOverrides: draft.customFeatureOverrides,
      }),
    [draft.subscriptionPlan, draft.customFeatureOverrides],
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!selectedSchool) return false;
    const baseline = buildDraftFromSchool(selectedSchool, data.planPricingCatalog);
    return (
      baseline.subscriptionPlan !== draft.subscriptionPlan ||
      baseline.paymentStatus !== draft.paymentStatus ||
      baseline.billingCycle !== draft.billingCycle ||
      baseline.paidAmountInr !== draft.paidAmountInr ||
      baseline.validUntil !== draft.validUntil ||
      baseline.allotmentNotes !== draft.allotmentNotes ||
      baseline.active !== draft.active ||
      JSON.stringify(baseline.customFeatureOverrides) !==
        JSON.stringify(draft.customFeatureOverrides)
    );
  }, [draft, selectedSchool, data.planPricingCatalog]);

  function handleSelectPlan(planId: SubscriptionTierId) {
    const planSpec = resolvedPlans.find((p) => p.id === planId);
    const nextDefaults = getPlanDefaultFeatures(planId);
    setDraft((prev) => ({
      ...prev,
      subscriptionPlan: planId,
      paidAmountInr: planSpec ? planSpec.priceMonthlyInr : prev.paidAmountInr,
      // Re-normalize overrides against the newly selected plan's defaults
      customFeatureOverrides: sanitizeFeatureOverrides(prev.customFeatureOverrides, nextDefaults),
    }));
  }

  async function handleSaveCooPricing(resetToDefaults = false) {
    if (!isCoo) return;
    setSavingPricing(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/platform/plan-pricing',
        {
          method: 'PATCH',
          body: JSON.stringify(
            resetToDefaults ? { resetToDefaults: true } : { prices: pricingDraft },
          ),
        },
        token,
      );
      await onRefresh();
      pushToast(
        resetToDefaults
          ? 'Reset Rai Plus plan prices to default catalog rates.'
          : 'Published updated Rai Plus plan prices by COO.',
        'success',
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to save COO plan prices.';
      setErrorMsg(message);
      pushToast(message, 'error');
    } finally {
      setSavingPricing(false);
    }
  }

  function handleToggleFeature(featureKey: PlatformFeatureKey) {
    const currentlyEnabled = draftEnabledSet.has(featureKey);
    const nextEnabled = !currentlyEnabled;
    const isDefault = planDefaultsSet.has(featureKey);

    setDraft((prev) => {
      const nextOverrides = { ...prev.customFeatureOverrides };
      if (nextEnabled === isDefault) {
        delete nextOverrides[featureKey];
      } else {
        nextOverrides[featureKey] = nextEnabled;
      }
      return {
        ...prev,
        customFeatureOverrides: nextOverrides,
      };
    });
  }

  function handleResetToPlanDefaults() {
    setDraft((prev) => ({
      ...prev,
      customFeatureOverrides: {},
    }));
  }

  async function handleSaveAllotment() {
    if (!selectedSchool) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        `/api/schools/${selectedSchool.id}/entitlements`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            subscriptionPlan: draft.subscriptionPlan,
            customFeatureOverrides: draft.customFeatureOverrides,
            paymentStatus: draft.paymentStatus,
            billingCycle: draft.billingCycle,
            paidAmountInr: Number(draft.paidAmountInr) || 0,
            validUntil: draft.validUntil,
            allotmentNotes: draft.allotmentNotes,
            active: draft.active,
          }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        `Saved ${draft.subscriptionPlan} & ${draftEnabledFeatures.length} allotted features for ${selectedSchool.name}.`,
        'success',
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to save school feature allotment.';
      setErrorMsg(message);
      pushToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSchool(e: React.FormEvent) {
    e.preventDefault();
    if (!newSchoolName.trim() || !newSchoolCode.trim() || !newSchoolCity.trim()) {
      setErrorMsg('Enter school name, institution code, and city to onboard a tenant.');
      return;
    }
    setCreatingSchool(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ school: School }>(
        '/api/schools',
        {
          method: 'POST',
          body: JSON.stringify({
            name: newSchoolName.trim(),
            code: newSchoolCode.trim().toUpperCase(),
            city: newSchoolCity.trim(),
            board: newSchoolBoard,
            subscriptionPlan: newSchoolPlan,
          }),
        },
        token,
      );
      await onRefresh();
      setSelectedSchoolId(res.school.id);
      setNewSchoolName('');
      setNewSchoolCode('');
      setNewSchoolCity('');
      setShowOnboardForm(false);
      pushToast(`Onboarded ${res.school.name} on ${res.school.subscriptionPlan}.`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to onboard school tenant.';
      setErrorMsg(message);
      pushToast(message, 'error');
    } finally {
      setCreatingSchool(false);
    }
  }

  const visibleCategories =
    categoryFilter === 'All' ? FEATURE_CATEGORY_ORDER : [categoryFilter];

  return (
    <div className="space-y-6" data-testid="super-admin-feature-allotment-console">
      {/* Header */}
      <div className="border-b border-[#E5D7C3] pb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#7B5D1C] flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isCoo
                ? 'COO · Rai Plus Plan Pricing & Feature Allotment Governance'
                : 'Super Admin · Paid Plan, Attendance Mode & Feature Allotment'}
            </p>
            <h1 className="font-display text-2xl font-bold text-[#142B46] mt-0.5">
              Plan, Pricing &amp; Feature Allotment Console
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Allot paid plans, control Manual / RFID / Biometric attendance access per school, and{' '}
              {isCoo
                ? 'customize official Rai Plus subscription plan prices.'
                : 'apply official COO-set Rai Plus plan pricing.'}
            </p>
          </div>

          <button
            type="button"
            data-testid="toggle-onboard-school-btn"
            onClick={() => setShowOnboardForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showOnboardForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />}
            {showOnboardForm ? 'Close Onboarding Form' : 'Onboard New School'}
          </button>
        </div>

        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#E5D7C3] bg-[#F3E6D8]/70 p-1">
          <button
            type="button"
            data-testid="super-admin-tab-allotment"
            onClick={() => setConsoleTab('allotment')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              consoleTab === 'allotment'
                ? 'bg-[#142B46] text-[#FAF4EC] shadow-xs'
                : 'text-[#142B46] hover:bg-white/80'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-[#D6B66D]" />
            School Allotment &amp; Attendance Access
          </button>
          <button
            type="button"
            data-testid="super-admin-tab-coo-pricing"
            onClick={() => setConsoleTab('coo_pricing')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              consoleTab === 'coo_pricing'
                ? 'bg-[#142B46] text-[#FAF4EC] shadow-xs'
                : 'text-[#142B46] hover:bg-white/80'
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5 text-[#D6B66D]" />
            {isCoo ? 'COO Plan Pricing Control' : 'Plan Pricing Catalog (COO Managed)'}
          </button>
        </div>
      </div>

      {/* Inline New School Onboarding Drawer */}
      {showOnboardForm && (
        <form
          onSubmit={(e) => void handleCreateSchool(e)}
          data-testid="super-admin-onboard-school-form"
          className="rounded-xl border border-[#D6B66D] bg-white p-5 space-y-4 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-sm font-bold text-[#142B46]">
                Onboard New Paid School Tenant
              </h2>
              <p className="text-xs text-slate-500">
                Register a new campus and assign its initial paid subscription plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              required
              placeholder="School Name"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none lg:col-span-2"
            />
            <input
              type="text"
              required
              placeholder="Code (e.g. DPS-RTK-03)"
              value={newSchoolCode}
              onChange={(e) => setNewSchoolCode(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono uppercase text-slate-900 focus:border-[#142B46] focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="City"
              value={newSchoolCity}
              onChange={(e) => setNewSchoolCity(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
            />
            <select
              aria-label="Curriculum board"
              value={newSchoolBoard}
              onChange={(e) => setNewSchoolBoard(e.target.value as BoardType)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
            >
              <option value="CBSE">CBSE</option>
              <option value="HBSE">HBSE</option>
              <option value="NCERT/SCERT">NCERT/SCERT</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Initial Paid Plan:</span>
              <select
                aria-label="Initial subscription plan"
                value={newSchoolPlan}
                onChange={(e) => setNewSchoolPlan(e.target.value as SubscriptionTierId)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] focus:border-[#142B46] focus:outline-none"
              >
                {resolvedPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} (₹{p.priceMonthlyInr.toLocaleString('en-IN')}/mo · {p.defaultFeatures.length} features)
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={creatingSchool}
              className="rounded-lg bg-[#3D6349] px-4 py-2 text-xs font-bold text-white hover:bg-[#31513B] disabled:opacity-60 whitespace-nowrap"
            >
              {creatingSchool ? 'Provisioning...' : 'Create School & Allot Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Compact Platform Entitlement Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E5D7C3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-[#142B46]" />
            School Tenants
          </p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1.5 tabular-nums">
            {platformStats.activeCount}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">
              / {schools.length} active
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E5D7C3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5 text-[#3D6349]" />
            Active Plan Value
          </p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1.5 tabular-nums">
            ₹{platformStats.totalMonthlyValue.toLocaleString('en-IN')}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">/mo</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E5D7C3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-[#7B5D1C]" />
            Custom Allotments
          </p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1.5 tabular-nums">
            {platformStats.customizedCount}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">
              customized {platformStats.customizedCount === 1 ? 'school' : 'schools'}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E5D7C3] bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Fingerprint className="h-3.5 w-3.5 text-[#3D6349]" />
            RFID / Biometric Ready
          </p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1.5 tabular-nums">
            {platformStats.hardwareAttendanceCount}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">
              of {schools.length} schools
            </span>
          </p>
        </div>
      </div>

      {/* TAB B: COO PLAN PRICING CATALOG */}
      {consoleTab === 'coo_pricing' && (
        <div
          data-testid="coo-plan-pricing-panel"
          className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-5 py-4 bg-[#FAF4EC]/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#142B46] flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#7B5D1C]" />
                Rai Plus Subscription Plan Pricing Catalog
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {isCoo
                  ? 'Signed in as COO of Rai Plus — customize official monthly rates and annual discounts across all 4 plans.'
                  : 'Official Rai Plus plan prices are managed exclusively by the COO of Rai Plus (coo@raiplus.in).'}
              </p>
            </div>
            {!isCoo && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                <Lock className="h-3.5 w-3.5" />
                Read-only · COO Authorization Required to Edit Prices
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Plan &amp; Included Attendance</th>
                  <th className="px-4 py-3 font-semibold">Catalog Base</th>
                  <th className="px-4 py-3 font-semibold">COO Monthly Rate (₹)</th>
                  <th className="px-4 py-3 font-semibold">Annual Discount %</th>
                  <th className="px-4 py-3 font-semibold text-right">Annual Billing (₹/yr)</th>
                  <th className="px-5 py-3 font-semibold">COO Pricing Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resolvedPlans.map((plan) => {
                  const row = pricingDraft[plan.id] || {
                    priceMonthlyInr: plan.priceMonthlyInr,
                    annualDiscountPct: plan.annualDiscountPct,
                    note: plan.priceNote || '',
                  };
                  const annualTotal = Math.round(
                    row.priceMonthlyInr * 12 * (1 - row.annualDiscountPct / 100),
                  );
                  const delta = row.priceMonthlyInr - plan.defaultPriceMonthlyInr;

                  return (
                    <tr key={plan.id} data-testid={`coo-price-row-${plan.id}`} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 align-top">
                        <p className="font-display text-sm font-bold text-[#142B46]">{plan.id}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5">{plan.headline}</p>
                        <p className="text-[11px] text-[#3D6349] font-medium mt-1">
                          Attendance: {formatAttendanceModeList(plan.defaultAttendanceModes)} ·{' '}
                          {plan.defaultFeatures.length} modules
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top font-mono text-slate-500 tabular-nums whitespace-nowrap">
                        ₹{plan.defaultPriceMonthlyInr.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        {isCoo ? (
                          <div className="space-y-1">
                            <input
                              type="number"
                              min={0}
                              max={10000000}
                              aria-label={`${plan.id} monthly price in INR`}
                              data-testid={`coo-price-input-${plan.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                              value={row.priceMonthlyInr}
                              onChange={(e) =>
                                setPricingDraft((prev) => ({
                                  ...prev,
                                  [plan.id]: {
                                    ...row,
                                    priceMonthlyInr: Math.max(0, Math.round(Number(e.target.value) || 0)),
                                  },
                                }))
                              }
                              className="w-32 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-[#142B46] tabular-nums focus:border-[#142B46] focus:outline-none"
                            />
                            {delta !== 0 && (
                              <p
                                className={`font-mono text-[11px] tabular-nums ${
                                  delta > 0 ? 'text-amber-700' : 'text-emerald-700'
                                }`}
                              >
                                {delta > 0 ? '+' : ''}₹{delta.toLocaleString('en-IN')} vs base
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-sm font-bold text-[#142B46] tabular-nums whitespace-nowrap">
                            ₹{plan.priceMonthlyInr.toLocaleString('en-IN')}/mo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        {isCoo ? (
                          <input
                            type="number"
                            min={0}
                            max={50}
                            aria-label={`${plan.id} annual discount percentage`}
                            value={row.annualDiscountPct}
                            onChange={(e) =>
                              setPricingDraft((prev) => ({
                                ...prev,
                                [plan.id]: {
                                  ...row,
                                  annualDiscountPct: Math.min(50, Math.max(0, Math.round(Number(e.target.value) || 0))),
                                },
                              }))
                            }
                            className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-[#142B46] tabular-nums focus:border-[#142B46] focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono tabular-nums text-slate-700">
                            {plan.annualDiscountPct}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top text-right font-mono font-bold text-[#142B46] tabular-nums whitespace-nowrap">
                        ₹{annualTotal.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        {isCoo ? (
                          <input
                            type="text"
                            maxLength={240}
                            value={row.note}
                            onChange={(e) =>
                              setPricingDraft((prev) => ({
                                ...prev,
                                [plan.id]: { ...row, note: e.target.value },
                              }))
                            }
                            placeholder="e.g., Q3 Academic Session Promo..."
                            className="w-full min-w-[180px] rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-600">
                            {plan.priceNote || (plan.priceUpdatedBy ? `Set by ${plan.priceUpdatedBy}` : 'Standard Catalog')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#E5D7C3] bg-[#FAF4EC] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              {resolvedPlans.some((p) => p.priceUpdatedAt)
                ? `Last published by ${resolvedPlans.find((p) => p.priceUpdatedBy)?.priceUpdatedBy || 'COO'} on ${resolvedPlans.find((p) => p.priceUpdatedAt)?.priceUpdatedAt?.slice(0, 10)}`
                : 'Using standard Rai Plus pricing catalog. Custom COO prices apply immediately to new allotments & onboarding.'}
              {errorMsg && <p className="text-rose-700 font-semibold mt-1">{errorMsg}</p>}
            </div>

            {isCoo && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={savingPricing}
                  onClick={() => void handleSaveCooPricing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Default Rates
                </button>
                <button
                  type="button"
                  data-testid="save-coo-plan-pricing-btn"
                  disabled={savingPricing || !hasUnsavedPricing}
                  onClick={() => void handleSaveCooPricing(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
                  {savingPricing ? 'Publishing...' : 'Publish COO Plan Prices'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB A: Master-Detail Allotment Workspace */}
      {consoleTab === 'allotment' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: School Directory */}
        <div className="lg:col-span-4 rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
          <div className="border-b border-slate-200 p-3.5 space-y-2.5 bg-[#FAF4EC]/60">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-[#142B46]">
                Subscribed Schools ({schools.length})
              </h2>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={schoolQuery}
                onChange={(e) => setSchoolQuery(e.target.value)}
                placeholder="Search school, code, city or plan..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {filteredSchools.map((s) => {
              const isSelected = selectedSchool?.id === s.id;
              const enabledCount = getEnabledFeaturesForSchool(s).length;
              const overrideInfo = countCustomOverridesForSchool(s);
              const payment = s.paymentStatus || 'Paid';
              return (
                <button
                  key={s.id}
                  type="button"
                  data-testid={`school-tenant-row-${s.id}`}
                  onClick={() => setSelectedSchoolId(s.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors space-y-1.5 ${
                    isSelected
                      ? 'bg-[#142B46] text-[#FAF4EC]'
                      : 'bg-white text-[#142B46] hover:bg-[#FAF4EC]/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-xs leading-snug truncate">{s.name}</p>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-[#A9C5D8]' : 'text-slate-500'
                        }`}
                      >
                        {s.code} · {s.city} · {s.board}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        payment === 'Paid' || payment === 'Custom Enterprise'
                          ? isSelected
                            ? 'bg-[#D6B66D] text-[#142B46]'
                            : 'bg-[#3D6349]/15 text-[#2C4A35]'
                          : isSelected
                            ? 'bg-amber-300/20 text-amber-200'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {payment}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-[#D6B66D]' : 'text-[#142B46]'
                      }`}
                    >
                      {s.subscriptionPlan}
                    </span>
                    <span
                      className={`font-mono tabular-nums ${
                        isSelected ? 'text-[#FAF4EC]/85' : 'text-slate-600'
                      }`}
                    >
                      {enabledCount}/{ALL_PLATFORM_FEATURE_KEYS.length} features
                      {overrideInfo.total > 0 ? ` · ${overrideInfo.total} custom` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredSchools.length === 0 && (
              <p className="p-6 text-center text-xs text-slate-500">
                No schools matched your search.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Plan Allotment & Granular Feature Matrix */}
        {selectedSchool && (
          <div className="lg:col-span-8 space-y-5">
            {/* Selected School Header & Billing Status */}
            <div className="rounded-xl border border-[#E5D7C3] bg-white p-5 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-[#142B46]">
                      {selectedSchool.name}
                    </h2>
                    <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {selectedSchool.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedSchool.city}, {selectedSchool.state} · {selectedSchool.board} · UDISE{' '}
                    <span className="font-mono">{selectedSchool.udiseCode}</span> ·{' '}
                    <span className="font-mono tabular-nums">
                      {selectedSchool.studentCount.toLocaleString()}
                    </span>{' '}
                    students
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#142B46] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => setDraft((prev) => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 rounded border-slate-300 accent-[#3D6349]"
                  />
                  <span>Tenant Active</span>
                </label>
              </div>

              {/* Step 1: Select Paid Plan */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B5D1C] flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5" />
                    1. Paid Subscription Plan
                  </h3>
                  <span className="text-xs text-slate-500">
                    Select the plan paid by this school to set baseline feature access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {resolvedPlans.map((plan) => {
                    const isSelectedPlan = draft.subscriptionPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        data-testid={`allot-plan-${plan.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        onClick={() => handleSelectPlan(plan.id)}
                        className={`text-left rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 transition-colors cursor-pointer ${
                          isSelectedPlan
                            ? 'border-[#142B46] bg-[#142B46] text-[#FAF4EC]'
                            : 'border-[#E5D7C3] bg-[#FAF4EC]/50 text-[#142B46] hover:border-[#142B46]/50 hover:bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-display text-xs font-bold">{plan.id}</span>
                            {isSelectedPlan && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#D6B66D] shrink-0" />
                            )}
                          </div>
                          <p
                            className={`font-mono text-sm font-extrabold tabular-nums ${
                              isSelectedPlan ? 'text-[#D6B66D]' : 'text-[#142B46]'
                            }`}
                          >
                            ₹{plan.priceMonthlyInr.toLocaleString('en-IN')}
                            <span className="text-[10px] font-sans font-normal opacity-80">/mo</span>
                          </p>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <p
                            className={`font-semibold ${
                              isSelectedPlan ? 'text-[#FAF4EC]' : 'text-slate-700'
                            }`}
                          >
                            {plan.defaultFeatures.length} features included
                          </p>
                          <p
                            className={isSelectedPlan ? 'text-[#A8D5B5]' : 'text-[#3D6349]'}
                          >
                            {formatAttendanceModeList(plan.defaultAttendanceModes)}
                          </p>
                          <p
                            className={`flex items-center gap-1 ${
                              plan.googleMapsEnabled
                                ? isSelectedPlan
                                  ? 'text-[#A8D5B5]'
                                  : 'text-[#3D6349]'
                                : isSelectedPlan
                                  ? 'text-[#A9C5D8]'
                                  : 'text-slate-500'
                            }`}
                          >
                            {plan.googleMapsEnabled ? (
                              <>
                                <MapPin className="h-3 w-3 shrink-0" />
                                Google Maps GPS
                              </>
                            ) : (
                              <>
                                <Lock className="h-3 w-3 shrink-0" />
                                Standard Transport
                              </>
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Dedicated Attendance Marking Modes Access */}
              <div className="space-y-2.5 border-t border-slate-200 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-[#7B5D1C] flex items-center gap-1.5">
                    <Fingerprint className="h-3.5 w-3.5" />
                    2. Attendance Marking Modes Allotted to {selectedSchool.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Grant or restrict Manual, RFID Smart Card &amp; Biometric attendance per school plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {ATTENDANCE_MODE_SPECS.map((spec) => {
                    const isEnabled = draftEnabledSet.has(spec.featureKey);
                    const isInPlanDefault = planDefaultsSet.has(spec.featureKey);
                    const Icon =
                      spec.mode === 'biometric'
                        ? Fingerprint
                        : spec.mode === 'rfid'
                          ? CreditCard
                          : PenLine;
                    const statusText =
                      isEnabled && !isInPlanDefault
                        ? 'Custom Add-On'
                        : !isEnabled && isInPlanDefault
                          ? 'Custom Disabled'
                          : isInPlanDefault
                            ? 'Plan Included'
                            : 'Not in Plan';

                    return (
                      <div
                        key={spec.mode}
                        data-testid={`attendance-mode-card-${spec.mode}`}
                        className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-colors ${
                          isEnabled
                            ? 'border-[#3D6349]/40 bg-white'
                            : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5 text-[#7B5D1C] shrink-0" />
                              {spec.label}
                            </p>
                            <p className="text-[11px] text-slate-500">{spec.defaultPlanHint}</p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            aria-label={`Toggle ${spec.label} for ${selectedSchool.name}`}
                            data-testid={`attendance-mode-toggle-${spec.mode}`}
                            onClick={() => handleToggleFeature(spec.featureKey)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                              isEnabled ? 'bg-[#3D6349]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span
                            className={`font-semibold ${
                              isEnabled ? 'text-[#3D6349]' : 'text-slate-500'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Locked'} · {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Billing Confirmation Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <label className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-600">Payment Status</span>
                  <select
                    value={draft.paymentStatus}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value as SubscriptionPaymentStatus,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#142B46] focus:border-[#142B46] focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Custom Enterprise">Custom Enterprise</option>
                    <option value="Trial">Trial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-600">Billing Cycle</span>
                  <select
                    value={draft.billingCycle}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        billingCycle: e.target.value as SubscriptionBillingCycle,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#142B46] focus:border-[#142B46] focus:outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-600">Paid Rate (₹ / mo)</span>
                  <input
                    type="number"
                    min={0}
                    max={10000000}
                    value={draft.paidAmountInr}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        paidAmountInr: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-[#142B46] tabular-nums focus:border-[#142B46] focus:outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-600">Valid Until</span>
                  <input
                    type="date"
                    value={draft.validUntil}
                    onChange={(e) => setDraft((prev) => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-[#142B46] focus:border-[#142B46] focus:outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1 text-xs">
                <span className="font-semibold text-slate-600">
                  Allotment &amp; Customization Note (Invoice Ref / Custom Add-On Agreement)
                </span>
                <input
                  type="text"
                  maxLength={400}
                  value={draft.allotmentNotes}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, allotmentNotes: e.target.value }))
                  }
                  placeholder="e.g., Invoice #INV-2026-114 · Paid Growth ERP + Google Maps GPS add-on"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#142B46] focus:outline-none"
                />
              </label>
            </div>

            {/* Step 2: Granular Feature Customization Matrix */}
            <div className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-4 bg-[#FAF4EC]/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B5D1C] flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" />
                    3. Custom Feature Allotment ({draftEnabledFeatures.length} /{' '}
                    {ALL_PLATFORM_FEATURE_KEYS.length} Enabled)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Toggle any feature on as a custom paid add-on or lock modules not purchased by{' '}
                    <span className="font-semibold text-[#142B46]">{selectedSchool.name}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {draftOverrideStats.total > 0 && (
                    <button
                      type="button"
                      data-testid="reset-plan-defaults-btn"
                      onClick={handleResetToPlanDefaults}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset to {draft.subscriptionPlan} Defaults
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Bar */}
              <div className="border-b border-slate-200 px-5 py-2.5 flex items-center gap-1.5 overflow-x-auto bg-white">
                {(['All', ...FEATURE_CATEGORY_ORDER] as const).map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-[#142B46] text-[#FAF4EC]'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#142B46]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Grouped Feature Toggle Rows */}
              <div className="divide-y divide-slate-200">
                {visibleCategories.map((category) => {
                  const categoryFeatures = PLATFORM_FEATURES.filter((f) => f.category === category);
                  const activeInCat = categoryFeatures.filter((f) => draftEnabledSet.has(f.key)).length;
                  return (
                    <div key={category} className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#142B46]">
                          {category}
                        </h4>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 tabular-nums">
                          {activeInCat} / {categoryFeatures.length} enabled
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                        {categoryFeatures.map((feat) => {
                          const isEnabled = draftEnabledSet.has(feat.key);
                          const isInPlanDefault = planDefaultsSet.has(feat.key);
                          const isCustomAddOn = isEnabled && !isInPlanDefault;
                          const isCustomLocked = !isEnabled && isInPlanDefault;

                          return (
                            <div
                              key={feat.key}
                              data-testid={`feature-row-${feat.key}`}
                              className={`px-4 py-3 flex items-center justify-between gap-4 transition-colors ${
                                isEnabled ? 'bg-white' : 'bg-slate-50/70'
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p
                                    className={`text-xs font-semibold ${
                                      isEnabled ? 'text-[#142B46]' : 'text-slate-500'
                                    }`}
                                  >
                                    {feat.label}
                                  </p>
                                  {isCustomAddOn && (
                                    <span className="rounded bg-[#D6B66D]/25 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#7B5D1C] whitespace-nowrap">
                                      Custom Add-On
                                    </span>
                                  )}
                                  {isCustomLocked && (
                                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700 whitespace-nowrap">
                                      Custom Disabled
                                    </span>
                                  )}
                                  {!isCustomAddOn && !isCustomLocked && (
                                    <span
                                      className={`text-[10px] font-semibold whitespace-nowrap ${
                                        isInPlanDefault ? 'text-[#3D6349]' : 'text-slate-400'
                                      }`}
                                    >
                                      {isInPlanDefault ? 'Plan Included' : 'Not in Plan'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  {feat.description}
                                </p>
                              </div>

                              <button
                                type="button"
                                role="switch"
                                aria-checked={isEnabled}
                                aria-label={`Toggle ${feat.label} for ${selectedSchool.name}`}
                                data-testid={`feature-toggle-${feat.key}`}
                                onClick={() => handleToggleFeature(feat.key)}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                                  isEnabled ? 'bg-[#3D6349]' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Allotment Footer Bar */}
              <div className="border-t border-[#E5D7C3] bg-[#FAF4EC] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-700 space-y-0.5">
                  <p className="font-semibold text-[#142B46]">
                    {draft.subscriptionPlan} · {draftEnabledFeatures.length} active{' '}
                    {draftEnabledFeatures.length === 1 ? 'feature' : 'features'}
                    {draftOverrideStats.total > 0 && (
                      <span className="text-[#7B5D1C]">
                        {' '}
                        ({draftOverrideStats.added > 0 ? `+${draftOverrideStats.added} add-on` : ''}
                        {draftOverrideStats.added > 0 && draftOverrideStats.removed > 0 ? ', ' : ''}
                        {draftOverrideStats.removed > 0 ? `-${draftOverrideStats.removed} disabled` : ''})
                      </span>
                    )}
                  </p>
                  {selectedSchool.allotmentUpdatedAt && (
                    <p className="text-[11px] text-slate-500">
                      Last updated by {selectedSchool.allotmentUpdatedBy || 'Super Admin'} ·{' '}
                      {selectedSchool.allotmentUpdatedAt.slice(0, 10)}
                    </p>
                  )}
                  {errorMsg && <p className="text-xs font-semibold text-rose-700">{errorMsg}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setDraft(buildDraftFromSchool(selectedSchool, data.planPricingCatalog))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      Discard
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="save-feature-allotment-btn"
                    disabled={saving || !hasUnsavedChanges}
                    onClick={() => void handleSaveAllotment()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
                    {saving ? 'Saving Allotment...' : 'Save Plan & Feature Allotment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
