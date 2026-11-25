import type {
  AcademicMonthKey,
  ComputerSkillAttempt,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NumeracyTestSession,
  ReadingTestSession,
  StudentRecord,
  ThinkingAssessmentSession,
  UserRole,
} from '../types';
import type { VcipAttemptRecord } from '../types/vcip';

export type SkillTestKey =
  | 'reading'
  | 'numeracy'
  | 'computer_skills'
  | 'thinking'
  | 'vcip';

export type LeaderboardIdentityMode = 'full' | 'initials' | 'anonymous';

export type LeaderboardPrivacyPreset =
  | 'staff_full'
  | 'relative_initials'
  | 'classroom_projector';

export type GrowthTierKey =
  | 'breakthrough'
  | 'strong'
  | 'steady'
  | 'holding'
  | 'support'
  | 'untested';

export interface GrowthLeaderboardPrivacySettings {
  identityMode: LeaderboardIdentityMode;
  hideRawScores: boolean;
  positiveGrowthOnly: boolean;
  lockedByRole?: boolean;
}

export const PRIVACY_PRESETS: Record<
  LeaderboardPrivacyPreset,
  {
    label: string;
    shortDescription: string;
    settings: GrowthLeaderboardPrivacySettings;
  }
> = {
  staff_full: {
    label: 'Staff Full View',
    shortDescription: 'Shows full student names, relative growth, and absolute scores for internal faculty review.',
    settings: {
      identityMode: 'full',
      hideRawScores: false,
      positiveGrowthOnly: false,
    },
  },
  relative_initials: {
    label: 'Initials · Relative Only',
    shortDescription: 'Masks full names to initials and hides raw test scores so focus stays purely on relative monthly growth.',
    settings: {
      identityMode: 'initials',
      hideRawScores: true,
      positiveGrowthOnly: false,
    },
  },
  classroom_projector: {
    label: 'Projector Safe (Anon)',
    shortDescription: 'Classroom-safe mode: anonymizes all identities, hides raw scores, and spotlights positive growth only.',
    settings: {
      identityMode: 'anonymous',
      hideRawScores: true,
      positiveGrowthOnly: true,
    },
  },
};

export const GROWTH_TIER_META: Record<
  GrowthTierKey,
  { label: string; shortLabel: string }
> = {
  breakthrough: { label: 'Breakthrough Growth', shortLabel: 'Breakthrough' },
  strong: { label: 'Strong Momentum', shortLabel: 'Strong Gain' },
  steady: { label: 'Steady Progress', shortLabel: 'Steady' },
  holding: { label: 'Holding Steady', shortLabel: 'Steady Base' },
  support: { label: 'Needs Guided Check-In', shortLabel: 'Check-In' },
  untested: { label: 'Awaiting Assessment', shortLabel: 'Pending' },
};

export const SKILL_TEST_META: Record<
  SkillTestKey,
  { label: string; unitLabel: string; description: string }
> = {
  reading: {
    label: 'Reading Fluency & Comprehension',
    unitLabel: '%',
    description: 'Monthly class relative improvement in reading accuracy, fluency WPM, and comprehension.',
  },
  numeracy: {
    label: 'Timed Tables & Numeracy',
    unitLabel: '%',
    description: 'Monthly class relative improvement in jumbled tables speed, recall accuracy, and mental maths.',
  },
  computer_skills: {
    label: 'Computer Skills & Typing Test',
    unitLabel: 'pts',
    description: 'Monthly class relative improvement across typing WPM, accuracy, and practical digital tasks.',
  },
  thinking: {
    label: 'Thinking Tests & OLQ (SRT/WAT/TAT/PPDT)',
    unitLabel: '%',
    description: 'Monthly class relative improvement in situational reasoning, constructive thinking, and 15 OLQs.',
  },
  vcip: {
    label: 'Cognitive Intelligence Profile (VCIP)',
    unitLabel: '%',
    description: 'Monthly class relative improvement across the 6 cognitive domains (Fluid, Memory, Speed, Verbal, Quantitative, Spatial).',
  },
};

export const LEADERBOARD_MONTHS: AcademicMonthKey[] = [
  'April',
  'May',
  'July',
  'August',
  'September',
  'October',
  'November',
];

const CALENDAR_MONTH_INDEX_TO_KEY: Record<number, AcademicMonthKey> = {
  3: 'April',
  4: 'May',
  5: 'May',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'November',
  0: 'November',
  1: 'November',
  2: 'April',
};

function parseIsoToAcademicMonth(iso?: string): AcademicMonthKey {
  if (!iso) return 'November';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'November';
  return CALENDAR_MONTH_INDEX_TO_KEY[d.getMonth()] || 'November';
}

export interface MonthlySkillPoint {
  month: AcademicMonthKey;
  score: number | null;
  secondaryMetric?: string;
}

export interface SkillMonthlyLeaderboardRow {
  rank: number;
  studentId: string;
  studentName: string;
  admissionNo: string;
  classSection: string;
  baselineMonth: AcademicMonthKey;
  baselineScore: number | null;
  previousMonthScore: number | null;
  selectedMonthScore: number | null;
  momDelta: number | null; // absolute point change vs previous active month
  cumulativeDelta: number | null; // absolute point change vs baseline
  relativeMomPct: number | null; // relative % improvement vs previous active month
  relativeSessionPct: number | null; // relative % improvement vs baseline
  growthIndex: number | null; // primary relative improvement ranking metric
  growthTier: GrowthTierKey;
  secondaryLabel: string;
  attemptCount: number;
  monthlySeries: MonthlySkillPoint[];
}

export interface SkillMonthlyClassSummary {
  skillKey: SkillTestKey;
  skillLabel: string;
  classSection: string;
  selectedMonth: AcademicMonthKey;
  previousMonth: AcademicMonthKey | null;
  totalStudentsInClass: number;
  assessedInSelectedMonth: number;
  improvingCount: number;
  positiveGrowthSharePct: number;
  classAverageSelectedMonth: number | null;
  classAveragePreviousMonth: number | null;
  classAverageMomDelta: number | null;
  classAverageCumulativeDelta: number | null;
  classRelativeMomPct: number | null;
  classRelativeSessionPct: number | null;
  topImprover: SkillMonthlyLeaderboardRow | null;
  monthlyClassTrend: Array<{
    month: AcademicMonthKey;
    avgScore: number | null;
    avgMomDelta: number | null;
    avgRelativeMomPct: number | null;
    assessedCount: number;
  }>;
  rows: SkillMonthlyLeaderboardRow[];
}

export interface PrivacyProjectedLeaderboardRow {
  rank: number;
  studentId: string;
  displayName: string;
  displaySubtext: string;
  isHighlightedSelf: boolean;
  canInspect: boolean;
  baselineMonth: AcademicMonthKey;
  baselineScore: number | null;
  previousMonthScore: number | null;
  selectedMonthScore: number | null;
  momDelta: number | null;
  cumulativeDelta: number | null;
  relativeMomPct: number | null;
  relativeSessionPct: number | null;
  growthTier: GrowthTierKey;
  secondaryLabel: string;
  scoresHidden: boolean;
}

export interface PrivacyProjectedLeaderboardResult {
  rows: PrivacyProjectedLeaderboardRow[];
  hiddenForPrivacyCount: number;
  topImproverDisplayName: string | null;
  activePreset: LeaderboardPrivacyPreset | 'custom';
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
}

/**
 * Computes relative percentage change from `base` to `current`.
 * Returns null if either value is missing.
 */
export function computeRelativeImprovementPct(
  current: number | null,
  base: number | null,
): number | null {
  if (current === null || base === null) return null;
  if (base <= 0) {
    return current > 0 ? 100 : 0;
  }
  return round1(((current - base) / base) * 100);
}

export function classifyGrowthTier(
  selectedMonthScore: number | null,
  relativeMomPct: number | null,
  relativeSessionPct: number | null,
): GrowthTierKey {
  if (selectedMonthScore === null) return 'untested';
  const metric = relativeMomPct ?? relativeSessionPct;
  if (metric === null) return 'holding';
  if (metric >= 15) return 'breakthrough';
  if (metric >= 5) return 'strong';
  if (metric > 0) return 'steady';
  if (metric === 0) return 'holding';
  return 'support';
}

export function maskStudentName(
  fullName: string,
  mode: LeaderboardIdentityMode,
  anonymousOrdinal: number,
): string {
  if (mode === 'full') return fullName;
  if (mode === 'initials') {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return `L.${anonymousOrdinal}`;
    if (parts.length === 1) return `${parts[0][0].toUpperCase()}.`;
    return parts.map((p) => `${p[0].toUpperCase()}.`).join(' ');
  }
  return `Learner #${String(anonymousOrdinal).padStart(2, '0')}`;
}

export function resolveDefaultPrivacyForRole(
  role: UserRole,
): GrowthLeaderboardPrivacySettings {
  if (role === 'student' || role === 'parent') {
    return {
      identityMode: 'anonymous',
      hideRawScores: true,
      positiveGrowthOnly: false,
      lockedByRole: true,
    };
  }
  return {
    ...PRIVACY_PRESETS.relative_initials.settings,
    lockedByRole: false,
  };
}

export function detectPrivacyPreset(
  settings: GrowthLeaderboardPrivacySettings,
): LeaderboardPrivacyPreset | 'custom' {
  for (const key of Object.keys(PRIVACY_PRESETS) as LeaderboardPrivacyPreset[]) {
    const preset = PRIVACY_PRESETS[key].settings;
    if (
      preset.identityMode === settings.identityMode &&
      preset.hideRawScores === settings.hideRawScores &&
      preset.positiveGrowthOnly === settings.positiveGrowthOnly
    ) {
      return key;
    }
  }
  return 'custom';
}

/**
 * Deterministic privacy projection layer.
 * Ensures that anonymized / masked / positive-growth-only views never expose
 * raw student names, admission numbers, or absolute test scores when masked.
 */
export function applyLeaderboardPrivacyView(params: {
  summary: SkillMonthlyClassSummary;
  settings: GrowthLeaderboardPrivacySettings;
  selfStudentIds?: string[];
  allowInspect?: boolean;
}): PrivacyProjectedLeaderboardResult {
  const { summary, settings, selfStudentIds = [], allowInspect = false } = params;
  const selfSet = new Set(selfStudentIds);

  // Build deterministic non-rank-leaking learner alias order (alphabetical by studentId)
  const ordinalById = new Map<string, number>();
  const stableSortedIds = [...summary.rows]
    .map((r) => r.studentId)
    .sort((a, b) => a.localeCompare(b));
  stableSortedIds.forEach((id, idx) => ordinalById.set(id, idx + 1));

  let hiddenForPrivacyCount = 0;
  const filtered: SkillMonthlyLeaderboardRow[] = [];

  for (const row of summary.rows) {
    const isSelf = selfSet.has(row.studentId);
    if (settings.positiveGrowthOnly && !isSelf) {
      const hasPositiveGrowth =
        (row.relativeMomPct !== null && row.relativeMomPct > 0) ||
        (row.relativeMomPct === null &&
          row.relativeSessionPct !== null &&
          row.relativeSessionPct > 0);
      if (!hasPositiveGrowth) {
        hiddenForPrivacyCount += 1;
        continue;
      }
    }
    filtered.push(row);
  }

  const rows: PrivacyProjectedLeaderboardRow[] = filtered.map((row) => {
    const isSelf = selfSet.has(row.studentId);
    const ordinal = ordinalById.get(row.studentId) || row.rank;
    const displayName = isSelf
      ? `${row.studentName} (You)`
      : maskStudentName(row.studentName, settings.identityMode, ordinal);

    const displaySubtext =
      settings.identityMode === 'full' || isSelf
        ? `Class ${row.classSection} · ${row.admissionNo}`
        : `Class ${row.classSection} · Identity Protected`;

    return {
      rank: row.rank,
      studentId: row.studentId,
      displayName,
      displaySubtext,
      isHighlightedSelf: isSelf,
      canInspect: allowInspect && settings.identityMode === 'full' && !settings.lockedByRole,
      baselineMonth: row.baselineMonth,
      baselineScore: settings.hideRawScores && !isSelf ? null : row.baselineScore,
      previousMonthScore:
        settings.hideRawScores && !isSelf ? null : row.previousMonthScore,
      selectedMonthScore:
        settings.hideRawScores && !isSelf ? null : row.selectedMonthScore,
      momDelta: row.momDelta,
      cumulativeDelta: row.cumulativeDelta,
      relativeMomPct: row.relativeMomPct,
      relativeSessionPct: row.relativeSessionPct,
      growthTier: row.growthTier,
      secondaryLabel: settings.hideRawScores && !isSelf ? GROWTH_TIER_META[row.growthTier].label : row.secondaryLabel,
      scoresHidden: settings.hideRawScores && !isSelf,
    };
  });

  let topImproverDisplayName: string | null = null;
  if (summary.topImprover) {
    const topId = summary.topImprover.studentId;
    const isSelf = selfSet.has(topId);
    const ord = ordinalById.get(topId) || 1;
    topImproverDisplayName = isSelf
      ? `${summary.topImprover.studentName} (You)`
      : maskStudentName(summary.topImprover.studentName, settings.identityMode, ord);
  }

  return {
    rows,
    hiddenForPrivacyCount,
    topImproverDisplayName,
    activePreset: detectPrivacyPreset(settings),
  };
}

export interface BuildSkillLeaderboardParams {
  skillKey: SkillTestKey;
  students: StudentRecord[];
  classSection: string; // 'All' or exact classSection like '6-A'
  selectedMonth: AcademicMonthKey;
  readingReports?: MonthlyReadingReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyReports?: MonthlyNumeracyReport[];
  numeracyTestSessions?: NumeracyTestSession[];
  computerSkillAttempts?: ComputerSkillAttempt[];
  thinkingAssessments?: ThinkingAssessmentSession[];
  vcipAttempts?: VcipAttemptRecord[];
}

/**
 * Computes a complete, deterministic class-wide monthly relative growth leaderboard
 * for any of the 5 core skill tests so teachers, management, and privacy-scoped
 * learners can track relative improvement month by month across the academic session.
 */
export function computeSkillMonthlyGrowthLeaderboard(
  params: BuildSkillLeaderboardParams,
): SkillMonthlyClassSummary {
  const {
    skillKey,
    students,
    classSection,
    selectedMonth,
    readingReports = [],
    readingTestSessions = [],
    numeracyReports = [],
    numeracyTestSessions = [],
    computerSkillAttempts = [],
    thinkingAssessments = [],
    vcipAttempts = [],
  } = params;

  const scopedStudents =
    classSection === 'All'
      ? students
      : students.filter((s) => s.classSection === classSection);

  const selectedMonthIdx = Math.max(0, LEADERBOARD_MONTHS.indexOf(selectedMonth));
  const previousMonth: AcademicMonthKey | null =
    selectedMonthIdx > 0 ? LEADERBOARD_MONTHS[selectedMonthIdx - 1] : null;

  const scoresByStudent = new Map<
    string,
    Map<AcademicMonthKey, Array<{ score: number; secondary?: string }>>
  >();

  const pushScore = (
    studentId: string,
    month: AcademicMonthKey,
    score: number,
    secondary?: string,
  ) => {
    let mMap = scoresByStudent.get(studentId);
    if (!mMap) {
      mMap = new Map();
      scoresByStudent.set(studentId, mMap);
    }
    let arr = mMap.get(month);
    if (!arr) {
      arr = [];
      mMap.set(month, arr);
    }
    arr.push({ score: Math.max(0, Math.min(100, round1(score))), secondary });
  };

  if (skillKey === 'reading') {
    for (const r of readingReports) {
      pushScore(r.studentId, r.month, r.overallPct, `${r.wpm} WPM`);
    }
    for (const s of readingTestSessions) {
      pushScore(s.studentId, s.month, s.overallPct, `${s.wpm} WPM`);
    }
  } else if (skillKey === 'numeracy') {
    for (const n of numeracyReports) {
      pushScore(n.studentId, n.month, n.overallPct, `${n.tablesFluencyPct}% tables`);
    }
    for (const s of numeracyTestSessions) {
      pushScore(s.studentId, s.month, s.accuracyPct, `${s.questionsPerMinute} QPM`);
    }
  } else if (skillKey === 'computer_skills') {
    for (const a of computerSkillAttempts) {
      const m = parseIsoToAcademicMonth(a.submittedAt);
      pushScore(
        a.studentId,
        m,
        a.overallScore,
        `${a.netWpm} WPM · ${a.accuracyPct}%`,
      );
    }
  } else if (skillKey === 'thinking') {
    for (const t of thinkingAssessments) {
      const m = parseIsoToAcademicMonth(t.submittedAt);
      const pct = round1(
        (t.dimensionScores.betterThinking + t.dimensionScores.positiveThinking) / 2,
      );
      pushScore(t.studentId, m, pct, `${t.testType} · Better ${t.dimensionScores.betterThinking}%`);
    }
  } else if (skillKey === 'vcip') {
    for (const v of vcipAttempts) {
      const m = parseIsoToAcademicMonth(v.assessedAt);
      pushScore(v.studentId, m, v.developmentalScore, `${v.domain}`);
    }
  }

  const rawRows: Omit<SkillMonthlyLeaderboardRow, 'rank'>[] = scopedStudents.map((stu) => {
    const mMap = scoresByStudent.get(stu.id);
    let attemptCount = 0;

    const monthlySeries: MonthlySkillPoint[] = LEADERBOARD_MONTHS.map((m) => {
      const list = mMap?.get(m);
      if (!list || list.length === 0) {
        return { month: m, score: null };
      }
      attemptCount += list.length;
      const avgScore = average(list.map((x) => x.score));
      const latestSecondary = list[list.length - 1]?.secondary;
      return { month: m, score: avgScore, secondaryMetric: latestSecondary };
    });

    const firstWithScore = monthlySeries.find((p) => p.score !== null) || null;
    const selectedPoint = monthlySeries[selectedMonthIdx] || { month: selectedMonth, score: null };
    const prevPoint =
      previousMonth !== null
        ? monthlySeries[selectedMonthIdx - 1] || { month: previousMonth, score: null }
        : null;

    let effectivePrevScore = prevPoint?.score ?? null;
    if (effectivePrevScore === null && selectedMonthIdx > 0) {
      for (let i = selectedMonthIdx - 1; i >= 0; i--) {
        if (monthlySeries[i].score !== null) {
          effectivePrevScore = monthlySeries[i].score;
          break;
        }
      }
    }

    const baselineMonth = firstWithScore?.month || 'April';
    const baselineScore = firstWithScore?.score ?? null;
    const selectedMonthScore = selectedPoint.score;

    const momDelta =
      selectedMonthScore !== null && effectivePrevScore !== null
        ? round1(selectedMonthScore - effectivePrevScore)
        : null;

    const cumulativeDelta =
      selectedMonthScore !== null && baselineScore !== null
        ? round1(selectedMonthScore - baselineScore)
        : null;

    const relativeMomPct = computeRelativeImprovementPct(
      selectedMonthScore,
      effectivePrevScore,
    );
    const relativeSessionPct = computeRelativeImprovementPct(
      selectedMonthScore,
      baselineScore,
    );
    const growthIndex = relativeMomPct ?? relativeSessionPct;
    const growthTier = classifyGrowthTier(
      selectedMonthScore,
      relativeMomPct,
      relativeSessionPct,
    );

    return {
      studentId: stu.id,
      studentName: stu.name,
      admissionNo: stu.admissionNo,
      classSection: stu.classSection,
      baselineMonth,
      baselineScore,
      previousMonthScore: effectivePrevScore,
      selectedMonthScore,
      momDelta,
      cumulativeDelta,
      relativeMomPct,
      relativeSessionPct,
      growthIndex,
      growthTier,
      secondaryLabel: selectedPoint.secondaryMetric || firstWithScore?.secondaryMetric || '—',
      attemptCount,
      monthlySeries,
    };
  });

  // Sort primarily by relative monthly improvement %, then absolute MoM delta, then relative session growth, then score
  rawRows.sort((a, b) => {
    const aHas = a.selectedMonthScore !== null ? 1 : 0;
    const bHas = b.selectedMonthScore !== null ? 1 : 0;
    if (aHas !== bHas) return bHas - aHas;

    const aRel = a.relativeMomPct ?? -999;
    const bRel = b.relativeMomPct ?? -999;
    if (aRel !== bRel) return bRel - aRel;

    const aMom = a.momDelta ?? -999;
    const bMom = b.momDelta ?? -999;
    if (aMom !== bMom) return bMom - aMom;

    const aCumRel = a.relativeSessionPct ?? -999;
    const bCumRel = b.relativeSessionPct ?? -999;
    if (aCumRel !== bCumRel) return bCumRel - aCumRel;

    const aScore = a.selectedMonthScore ?? -1;
    const bScore = b.selectedMonthScore ?? -1;
    if (aScore !== bScore) return bScore - aScore;

    return a.studentName.localeCompare(b.studentName);
  });

  const rows: SkillMonthlyLeaderboardRow[] = rawRows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));

  const selectedScores = rows
    .map((r) => r.selectedMonthScore)
    .filter((v): v is number => v !== null);
  const prevScores = rows
    .map((r) => r.previousMonthScore)
    .filter((v): v is number => v !== null);
  const momDeltas = rows
    .map((r) => r.momDelta)
    .filter((v): v is number => v !== null);
  const cumDeltas = rows
    .map((r) => r.cumulativeDelta)
    .filter((v): v is number => v !== null);
  const relMomPcts = rows
    .map((r) => r.relativeMomPct)
    .filter((v): v is number => v !== null);
  const relSessionPcts = rows
    .map((r) => r.relativeSessionPct)
    .filter((v): v is number => v !== null);

  const improvingCount = rows.filter(
    (r) =>
      (r.relativeMomPct !== null && r.relativeMomPct > 0) ||
      (r.relativeMomPct === null &&
        r.relativeSessionPct !== null &&
        r.relativeSessionPct > 0),
  ).length;

  const positiveGrowthSharePct =
    selectedScores.length > 0
      ? round1((improvingCount / selectedScores.length) * 100)
      : 0;

  const monthlyClassTrend = LEADERBOARD_MONTHS.map((m, mIdx) => {
    const vals = rows
      .map((r) => r.monthlySeries[mIdx]?.score)
      .filter((v): v is number => v !== null);

    const monthMomDeltas: number[] = [];
    const monthRelPcts: number[] = [];
    if (mIdx > 0) {
      for (const r of rows) {
        const cur = r.monthlySeries[mIdx]?.score ?? null;
        if (cur === null) continue;
        let prev: number | null = null;
        for (let k = mIdx - 1; k >= 0; k--) {
          const candidate = r.monthlySeries[k]?.score ?? null;
          if (candidate !== null) {
            prev = candidate;
            break;
          }
        }
        if (prev !== null) {
          monthMomDeltas.push(round1(cur - prev));
          const rel = computeRelativeImprovementPct(cur, prev);
          if (rel !== null) monthRelPcts.push(rel);
        }
      }
    }

    return {
      month: m,
      avgScore: average(vals),
      avgMomDelta: average(monthMomDeltas),
      avgRelativeMomPct: average(monthRelPcts),
      assessedCount: vals.length,
    };
  });

  const topImprover =
    rows.find((r) => (r.relativeMomPct ?? -1) > 0) ||
    rows.find((r) => r.selectedMonthScore !== null) ||
    null;

  return {
    skillKey,
    skillLabel: SKILL_TEST_META[skillKey].label,
    classSection,
    selectedMonth,
    previousMonth,
    totalStudentsInClass: scopedStudents.length,
    assessedInSelectedMonth: selectedScores.length,
    improvingCount,
    positiveGrowthSharePct,
    classAverageSelectedMonth: average(selectedScores),
    classAveragePreviousMonth: average(prevScores),
    classAverageMomDelta: average(momDeltas),
    classAverageCumulativeDelta: average(cumDeltas),
    classRelativeMomPct: average(relMomPcts),
    classRelativeSessionPct: average(relSessionPcts),
    topImprover,
    monthlyClassTrend,
    rows,
  };
}
