import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AcademicMonthKey } from '../types';
import type { WorkspaceData } from '../types/workspace';
import {
  applyLeaderboardPrivacyView,
  computeSkillMonthlyGrowthLeaderboard,
  GROWTH_TIER_META,
  LEADERBOARD_MONTHS,
  PRIVACY_PRESETS,
  resolveDefaultPrivacyForRole,
  SKILL_TEST_META,
  type GrowthLeaderboardPrivacySettings,
  type GrowthTierKey,
  type LeaderboardIdentityMode,
  type LeaderboardPrivacyPreset,
  type SkillTestKey,
} from '../utils/skillGrowthLeaderboardEngine';
import { compareClassSections } from '../utils/visAcademicProgressEngine';

interface SkillMonthlyGrowthLeaderboardProps {
  data: WorkspaceData;
  skillKey: SkillTestKey;
  allowSkillSwitch?: boolean;
  defaultClassSection?: string;
  defaultMonth?: AcademicMonthKey;
  onInspectStudent?: (studentId: string) => void;
  compact?: boolean;
}

const STAFF_ROLES = new Set([
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'teacher',
  'counsellor',
]);

const PRIVACY_STORAGE_KEY = 'vs360_growth_leaderboard_privacy_v1';

function loadSavedStaffPrivacy(
  role: WorkspaceData['user']['role'],
): GrowthLeaderboardPrivacySettings {
  const defaults = resolveDefaultPrivacyForRole(role);
  if (defaults.lockedByRole || typeof window === 'undefined') return defaults;
  try {
    const raw = window.sessionStorage.getItem(PRIVACY_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<GrowthLeaderboardPrivacySettings>;
    if (
      (parsed.identityMode === 'full' ||
        parsed.identityMode === 'initials' ||
        parsed.identityMode === 'anonymous') &&
      typeof parsed.hideRawScores === 'boolean' &&
      typeof parsed.positiveGrowthOnly === 'boolean'
    ) {
      return {
        identityMode: parsed.identityMode,
        hideRawScores: parsed.hideRawScores,
        positiveGrowthOnly: parsed.positiveGrowthOnly,
        lockedByRole: false,
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return defaults;
}

function growthTierClasses(tier: GrowthTierKey): string {
  switch (tier) {
    case 'breakthrough':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'strong':
      return 'bg-blue-50 text-blue-900 border-blue-200';
    case 'steady':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'holding':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'support':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200';
  }
}

export const SkillMonthlyGrowthLeaderboard: React.FC<
  SkillMonthlyGrowthLeaderboardProps
> = ({
  data,
  skillKey: initialSkillKey,
  allowSkillSwitch = false,
  defaultClassSection,
  defaultMonth = 'November',
  onInspectStudent,
  compact = false,
}) => {
  const isStaff = STAFF_ROLES.has(data.user.role);
  const [activeSkill, setActiveSkill] = useState<SkillTestKey>(initialSkillKey);
  const [selectedMonth, setSelectedMonth] =
    useState<AcademicMonthKey>(defaultMonth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);
  const [chartMetric, setChartMetric] = useState<'relative_growth' | 'class_avg'>(
    'relative_growth',
  );
  const [showPrivacyControls, setShowPrivacyControls] = useState(false);

  const [privacySettings, setPrivacySettings] =
    useState<GrowthLeaderboardPrivacySettings>(() =>
      loadSavedStaffPrivacy(data.user.role),
    );

  const updatePrivacy = (next: GrowthLeaderboardPrivacySettings) => {
    if (!isStaff) return;
    const normalized: GrowthLeaderboardPrivacySettings = {
      ...next,
      lockedByRole: false,
    };
    setPrivacySettings(normalized);
    try {
      window.sessionStorage.setItem(
        PRIVACY_STORAGE_KEY,
        JSON.stringify(normalized),
      );
    } catch {
      // Ignore storage write errors
    }
  };

  const applyPreset = (preset: LeaderboardPrivacyPreset) => {
    updatePrivacy({ ...PRIVACY_PRESETS[preset].settings });
  };

  const classOptions = useMemo(() => {
    const set = new Set<string>(data.students.map((s) => s.classSection));
    return Array.from(set).sort(compareClassSections);
  }, [data.students]);

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (defaultClassSection && classOptions.includes(defaultClassSection)) {
      return defaultClassSection;
    }
    return classOptions[0] || 'All';
  });

  const effectiveClass =
    selectedClass === 'All' || classOptions.includes(selectedClass)
      ? selectedClass
      : classOptions[0] || 'All';

  const summary = useMemo(
    () =>
      computeSkillMonthlyGrowthLeaderboard({
        skillKey: activeSkill,
        students: data.students,
        classSection: effectiveClass,
        selectedMonth,
        readingReports: data.readingReports,
        readingTestSessions: data.readingTestSessions,
        numeracyReports: data.numeracyReports,
        numeracyTestSessions: data.numeracyTestSessions,
        computerSkillAttempts: data.computerSkillAttempts,
        thinkingAssessments: data.thinkingAssessments,
        vcipAttempts: data.vcipAttempts,
      }),
    [
      activeSkill,
      data.students,
      effectiveClass,
      selectedMonth,
      data.readingReports,
      data.readingTestSessions,
      data.numeracyReports,
      data.numeracyTestSessions,
      data.computerSkillAttempts,
      data.thinkingAssessments,
      data.vcipAttempts,
    ],
  );

  const selfStudentIds = useMemo(() => {
    if (isStaff) return [];
    return data.user.linkedStudentIds || data.students.map((s) => s.id);
  }, [isStaff, data.user.linkedStudentIds, data.students]);

  const effectivePrivacy: GrowthLeaderboardPrivacySettings = isStaff
    ? privacySettings
    : resolveDefaultPrivacyForRole(data.user.role);

  const projected = useMemo(
    () =>
      applyLeaderboardPrivacyView({
        summary,
        settings: effectivePrivacy,
        selfStudentIds,
        allowInspect: isStaff && Boolean(onInspectStudent),
      }),
    [summary, effectivePrivacy, selfStudentIds, isStaff, onInspectStudent],
  );

  const meta = SKILL_TEST_META[activeSkill];
  const isIdentityMasked = effectivePrivacy.identityMode !== 'full';

  // Disable name-based search probing when identities are masked
  const filteredRows = projected.rows.filter((r) => {
    if (isIdentityMasked || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      r.displayName.toLowerCase().includes(q) ||
      r.displaySubtext.toLowerCase().includes(q)
    );
  });

  const displayedRows = showAllRows
    ? filteredRows
    : filteredRows.slice(0, compact ? 10 : 25);

  const chartData = summary.monthlyClassTrend.map((pt) => ({
    month: pt.month.slice(0, 3),
    relativePct: pt.avgRelativeMomPct ?? 0,
    avg: pt.avgScore ?? 0,
    assessed: pt.assessedCount,
  }));

  const showRawScoreCols = !effectivePrivacy.hideRawScores;

  const formatSignedPercent = (val: number | null) => {
    if (val === null) return <span className="text-slate-400">—</span>;
    if (val > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 font-mono font-bold text-emerald-700 tabular-nums">
          <ArrowUpRight className="h-3.5 w-3.5" />+{val}%
        </span>
      );
    }
    if (val < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 font-mono font-bold text-amber-800 tabular-nums">
          <ArrowDownRight className="h-3.5 w-3.5" />
          {val}%
        </span>
      );
    }
    return <span className="font-mono text-slate-600 tabular-nums">0.0%</span>;
  };

  const formatDeltaPts = (delta: number | null) => {
    if (delta === null) return <span className="text-slate-400">—</span>;
    if (delta > 0) {
      return (
        <span className="font-mono font-semibold text-emerald-700 tabular-nums">
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="font-mono font-semibold text-amber-800 tabular-nums">
          {delta}
        </span>
      );
    }
    return <span className="font-mono text-slate-600 tabular-nums">0.0</span>;
  };

  const privacyBadgeText = effectivePrivacy.lockedByRole
    ? 'Privacy Locked · Personal Growth View'
    : effectivePrivacy.identityMode === 'anonymous'
      ? 'Projector Safe · Identities & Scores Masked'
      : effectivePrivacy.identityMode === 'initials'
        ? 'Privacy Active · Initials & Relative Growth'
        : effectivePrivacy.hideRawScores
          ? 'Relative Growth Only · Raw Scores Hidden'
          : 'Staff Full View';

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
      data-testid="skill-monthly-growth-leaderboard"
      data-skill={activeSkill}
    >
      {/* Header + Controls */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-900 shrink-0" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Growth Leaderboard · {meta.label}
              </h2>
              <span
                data-testid="leaderboard-privacy-badge"
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                  isIdentityMasked || effectivePrivacy.hideRawScores
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {effectivePrivacy.lockedByRole ? (
                  <Lock className="h-3 w-3" />
                ) : (
                  <ShieldCheck className="h-3 w-3" />
                )}
                {privacyBadgeText}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">{meta.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allowSkillSwitch && (
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                <span className="font-semibold">Skill:</span>
                <select
                  aria-label="Select skill test for monthly leaderboard"
                  value={activeSkill}
                  onChange={(e) => setActiveSkill(e.target.value as SkillTestKey)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                >
                  {(Object.keys(SKILL_TEST_META) as SkillTestKey[]).map((key) => (
                    <option key={key} value={key}>
                      {SKILL_TEST_META[key].label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isStaff && (
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                <span className="font-semibold">Class:</span>
                <select
                  aria-label="Select class for monthly growth leaderboard"
                  value={effectiveClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
                >
                  <option value="All">All Classes ({data.students.length})</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isStaff && (
              <button
                type="button"
                onClick={() => setShowPrivacyControls((v) => !v)}
                aria-expanded={showPrivacyControls}
                data-testid="toggle-privacy-settings"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  showPrivacyControls
                    ? 'border-blue-900 bg-blue-900 text-white'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Privacy View Settings
              </button>
            )}
          </div>
        </div>

        {/* Privacy-Conscious View Presets & Granular Controls */}
        {isStaff && (
          <div
            className="rounded-lg border border-slate-200 bg-white p-3 space-y-3"
            data-testid="leaderboard-privacy-bar"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Shield className="h-3.5 w-3.5 text-blue-900" />
                <span>Quick Privacy View:</span>
              </div>
              <div
                className="flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Leaderboard privacy presets"
              >
                {(
                  [
                    'relative_initials',
                    'classroom_projector',
                    'staff_full',
                  ] as LeaderboardPrivacyPreset[]
                ).map((presetKey) => {
                  const isActive = projected.activePreset === presetKey;
                  return (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => applyPreset(presetKey)}
                      aria-pressed={isActive}
                      data-testid={`privacy-preset-${presetKey}`}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-900 text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {PRIVACY_PRESETS[presetKey].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {showPrivacyControls && (
              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">
                    Identity Display
                  </span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    {(
                      [
                        ['anonymous', 'Anonymous'],
                        ['initials', 'Initials'],
                        ['full', 'Full Name'],
                      ] as Array<[LeaderboardIdentityMode, string]>
                    ).map(([mode, lbl]) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          updatePrivacy({ ...effectivePrivacy, identityMode: mode })
                        }
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                          effectivePrivacy.identityMode === mode
                            ? 'bg-white text-blue-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={effectivePrivacy.hideRawScores}
                    onChange={(e) =>
                      updatePrivacy({
                        ...effectivePrivacy,
                        hideRawScores: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 text-blue-900"
                  />
                  <span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      {effectivePrivacy.hideRawScores ? (
                        <EyeOff className="h-3 w-3 text-emerald-700" />
                      ) : (
                        <Eye className="h-3 w-3 text-slate-500" />
                      )}
                      Hide Raw Test Scores
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Display only relative % growth &amp; momentum tiers
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={effectivePrivacy.positiveGrowthOnly}
                    onChange={(e) =>
                      updatePrivacy({
                        ...effectivePrivacy,
                        positiveGrowthOnly: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-slate-300 text-blue-900"
                  />
                  <span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-700" />
                      Positive Growth Spotlight Only
                    </span>
                    <span className="text-[11px] text-slate-600 block">
                      Keep check-in &amp; untested rows private during class display
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Month Selector Strip + Search */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Select assessment month"
          >
            <span className="text-xs font-semibold text-slate-600 mr-1">
              Month:
            </span>
            {LEADERBOARD_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                aria-pressed={selectedMonth === m}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedMonth === m
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>

          {!isIdentityMasked ? (
            <div className="relative w-full sm:w-56">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student in class..."
                aria-label="Search student in monthly growth leaderboard"
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 inline-flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Name search disabled while identities are masked
            </span>
          )}
        </div>
      </div>

      {/* KPI Strip + Monthly Relative Improvement Chart */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-3.5 w-3.5 text-blue-900" />
                Class Improving
              </div>
              <p className="font-display text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {summary.positiveGrowthSharePct}%
              </p>
              <p className="text-[11px] text-slate-600 tabular-nums">
                {summary.improvingCount} of {summary.assessedInSelectedMonth} tested
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {selectedMonth.slice(0, 3)} Rel. Lift
              </div>
              <div className="font-display text-xl font-bold mt-1">
                {formatSignedPercent(summary.classRelativeMomPct)}
              </div>
              <p className="text-[11px] text-slate-600 tabular-nums">
                MoM Avg:{' '}
                {summary.classAverageMomDelta !== null
                  ? `${summary.classAverageMomDelta >= 0 ? '+' : ''}${summary.classAverageMomDelta} pts`
                  : '—'}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Session Gain
              </div>
              <div className="font-display text-xl font-bold mt-1">
                {formatSignedPercent(summary.classRelativeSessionPct)}
              </div>
              <p className="text-[11px] text-slate-600 tabular-nums">
                {showRawScoreCols && summary.classAverageSelectedMonth !== null
                  ? `Class avg ${summary.classAverageSelectedMonth}${meta.unitLabel === '%' ? '%' : ''}`
                  : `vs April baseline`}
              </p>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                <Award className="h-3.5 w-3.5" />
                Top Grower
              </div>
              <p className="font-display text-sm font-bold text-slate-900 mt-1 truncate">
                {projected.topImproverDisplayName || 'Pending'}
              </p>
              <p className="text-[11px] font-mono text-emerald-800 tabular-nums">
                {summary.topImprover?.relativeMomPct != null
                  ? `${summary.topImprover.relativeMomPct >= 0 ? '+' : ''}${summary.topImprover.relativeMomPct}% MoM`
                  : summary.topImprover?.relativeSessionPct != null
                    ? `${summary.topImprover.relativeSessionPct >= 0 ? '+' : ''}${summary.topImprover.relativeSessionPct}% Session`
                    : 'Awaiting comparison'}
              </p>
            </div>
          </div>

          {/* Month-by-Month Relative Improvement Bar Chart */}
          <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <BarChart3 className="h-3.5 w-3.5 text-blue-900" />
                {chartMetric === 'relative_growth'
                  ? 'Monthly Relative Growth (%)'
                  : 'Class Avg Trend (Apr–Nov)'}
              </span>
              {showRawScoreCols && (
                <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setChartMetric('relative_growth')}
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      chartMetric === 'relative_growth'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Rel %
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('class_avg')}
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      chartMetric === 'class_avg'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Avg
                  </button>
                </div>
              )}
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 6, right: 6, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={
                      chartMetric === 'relative_growth' || !showRawScoreCols
                        ? ['auto', 'auto']
                        : [0, 100]
                    }
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
                  <Tooltip
                    formatter={(value) => {
                      const num = Number(value ?? 0);
                      if (chartMetric === 'relative_growth' || !showRawScoreCols) {
                        return [
                          `${num >= 0 ? '+' : ''}${num}%`,
                          'Avg Relative Lift',
                        ];
                      }
                      return [
                        `${num}${meta.unitLabel === '%' ? '%' : ' pts'}`,
                        'Class Avg',
                      ];
                    }}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      borderColor: '#cbd5e1',
                    }}
                  />
                  <Bar
                    dataKey={
                      chartMetric === 'relative_growth' || !showRawScoreCols
                        ? 'relativePct'
                        : 'avg'
                    }
                    fill={
                      chartMetric === 'relative_growth' || !showRawScoreCols
                        ? '#047857'
                        : '#1e3a8a'
                    }
                    radius={[4, 4, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {projected.hiddenForPrivacyCount > 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-3.5 py-2 text-xs text-emerald-900 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              Positive Growth Spotlight is active: {projected.hiddenForPrivacyCount}{' '}
              learner(s) needing private check-in or awaiting assessment are kept off this shared board.
            </span>
          </div>
        )}

        {/* Full Class Relative Growth Table */}
        <div className="rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Learner</th>
                <th className="py-2.5 px-3 font-semibold text-emerald-800">
                  {selectedMonth.slice(0, 3)} Rel. Growth
                </th>
                <th className="py-2.5 px-3 font-semibold">Session Rel. Gain</th>
                <th className="py-2.5 px-3 font-semibold">MoM Change</th>
                <th className="py-2.5 px-3 font-semibold">Momentum Tier</th>
                {showRawScoreCols && (
                  <>
                    <th className="py-2.5 px-3 font-semibold">Baseline</th>
                    <th className="py-2.5 px-3 font-semibold">
                      {summary.previousMonth
                        ? summary.previousMonth.slice(0, 3)
                        : 'Prior'}
                    </th>
                    <th className="py-2.5 px-3 font-semibold text-blue-900">
                      {selectedMonth.slice(0, 3)} Score
                    </th>
                  </>
                )}
                {isStaff && onInspectStudent && !isIdentityMasked && (
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayedRows.map((row) => (
                <tr
                  key={row.studentId}
                  className={
                    row.isHighlightedSelf
                      ? 'bg-blue-50/70'
                      : 'hover:bg-slate-50/70 transition-colors'
                  }
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 tabular-nums">
                    #{row.rank}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-900">
                      {row.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {row.displaySubtext}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    {formatSignedPercent(row.relativeMomPct)}
                  </td>
                  <td className="py-2.5 px-3">
                    {formatSignedPercent(row.relativeSessionPct)}
                  </td>
                  <td className="py-2.5 px-3">
                    {formatDeltaPts(row.momDelta)}
                    {row.momDelta !== null && (
                      <span className="text-[10px] text-slate-400 ml-1">
                        {meta.unitLabel}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${growthTierClasses(row.growthTier)}`}
                    >
                      {GROWTH_TIER_META[row.growthTier].shortLabel}
                    </span>
                  </td>
                  {showRawScoreCols && (
                    <>
                      <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums">
                        {row.baselineScore !== null ? (
                          <>
                            {row.baselineScore}
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({row.baselineMonth.slice(0, 3)})
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 tabular-nums">
                        {row.previousMonthScore !== null
                          ? row.previousMonthScore
                          : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900 tabular-nums">
                        {row.selectedMonthScore !== null
                          ? `${row.selectedMonthScore}${meta.unitLabel === '%' ? '%' : ''}`
                          : 'Not tested'}
                      </td>
                    </>
                  )}
                  {isStaff && onInspectStudent && !isIdentityMasked && (
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onInspectStudent(row.studentId)}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-50"
                      >
                        Inspect
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {displayedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={showRawScoreCols ? 10 : 7}
                    className="py-6 text-center text-slate-500"
                  >
                    No learners matched the active month and privacy filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRows.length > (compact ? 10 : 25) && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllRows((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              {showAllRows
                ? 'Show Fewer Learners'
                : `Show Entire Class (${filteredRows.length} Learners)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
