import type {
  AcademicMonthKey,
  ClassGrowthBenchmarks,
  ClassGrowthLeaderboard,
  GrowthLeaderboardDomain,
  GrowthLeaderboardEntry,
  GrowthTierLabel,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NumeracyTestSession,
  ReadingTestSession,
  SchoolGrowthLeaderboards,
  StudentRecord,
} from '../types';
import {
  ACTIVE_SESSION_MONTHS,
  ALL_ACADEMIC_MONTHS,
  compareClassSections,
} from './visAcademicProgressEngine.ts';

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function averageOrNull(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (valid.length === 0) return null;
  return round1(valid.reduce((acc, v) => acc + v, 0) / valid.length);
}

/**
 * Class-calibrated target WPM scale so Reading fluency aligns fairly on 0–100 across age groups.
 */
export function resolveWpmFluencyTarget(classSection: string): number {
  const clean = classSection.trim().toLowerCase();
  if (clean.startsWith('nur') || clean === 'lkg' || clean === 'ukg') return 45;
  const num = Number(clean.match(/^(\d{1,2})/)?.[1] ?? 6);
  if (num <= 2) return 65;
  if (num <= 5) return 95;
  if (num <= 8) return 130;
  return 155;
}

export function normalizeWpmToFluencyPct(wpm: number, classSection: string): number {
  const target = resolveWpmFluencyTarget(classSection);
  const clamped = Math.max(0, Math.min(100, (wpm / target) * 100));
  return round1(clamped);
}

const MONTH_ORDER = new Map<AcademicMonthKey, number>(
  ALL_ACADEMIC_MONTHS.map((m, idx) => [m, idx]),
);

function sortByAcademicMonth<T extends { month: AcademicMonthKey; assessedAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const ma = MONTH_ORDER.get(a.month) ?? 99;
    const mb = MONTH_ORDER.get(b.month) ?? 99;
    if (ma !== mb) return ma - mb;
    return (a.assessedAt || '').localeCompare(b.assessedAt || '');
  });
}

function classifyGrowthTier(combinedGrowth: number | null, currentAvg: number | null): GrowthTierLabel {
  if (combinedGrowth === null) return 'Building Momentum';
  if (combinedGrowth >= 12 || (combinedGrowth >= 8 && (currentAvg ?? 0) >= 85)) {
    return 'Accelerated Climber';
  }
  if (combinedGrowth >= 5) return 'Steady Riser';
  if ((currentAvg ?? 0) >= 82 && combinedGrowth >= 0) return 'Consistent Achiever';
  return 'Building Momentum';
}

function assignRanks<T extends { studentId: string }>(
  items: T[],
  getPrimary: (item: T) => number | null,
  getSecondary: (item: T) => number,
): Map<string, number | null> {
  const eligible = items
    .map((item) => ({
      studentId: item.studentId,
      primary: getPrimary(item),
      secondary: getSecondary(item),
    }))
    .filter((x): x is { studentId: string; primary: number; secondary: number } => x.primary !== null);

  eligible.sort((a, b) => {
    if (b.primary !== a.primary) return b.primary - a.primary;
    if (b.secondary !== a.secondary) return b.secondary - a.secondary;
    return a.studentId.localeCompare(b.studentId);
  });

  const ranks = new Map<string, number | null>();
  for (let i = 0; i < eligible.length; i++) {
    const prev = i > 0 ? eligible[i - 1] : null;
    const prevRank = prev ? (ranks.get(prev.studentId) ?? i) : 1;
    const rank = prev && prev.primary === eligible[i].primary ? prevRank : i + 1;
    ranks.set(eligible[i].studentId, rank);
  }
  return ranks;
}

export function computeClassGrowthLeaderboard(params: {
  classSection: string;
  classStudents: StudentRecord[];
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyTestSessions?: NumeracyTestSession[];
}): ClassGrowthLeaderboard {
  const {
    classSection,
    classStudents,
    readingReports,
    numeracyReports,
    readingTestSessions = [],
    numeracyTestSessions = [],
  } = params;

  const readingByStudent = new Map<string, MonthlyReadingReport[]>();
  for (const r of readingReports) {
    if (!readingByStudent.has(r.studentId)) readingByStudent.set(r.studentId, []);
    readingByStudent.get(r.studentId)!.push(r);
  }

  const numeracyByStudent = new Map<string, MonthlyNumeracyReport[]>();
  for (const n of numeracyReports) {
    if (!numeracyByStudent.has(n.studentId)) numeracyByStudent.set(n.studentId, []);
    numeracyByStudent.get(n.studentId)!.push(n);
  }

  const latestReadingSessionByStudent = new Map<string, ReadingTestSession>();
  for (const rs of readingTestSessions) {
    const prev = latestReadingSessionByStudent.get(rs.studentId);
    if (!prev || rs.assessedAt.localeCompare(prev.assessedAt) > 0) {
      latestReadingSessionByStudent.set(rs.studentId, rs);
    }
  }

  const latestNumeracySessionByStudent = new Map<string, NumeracyTestSession>();
  for (const ns of numeracyTestSessions) {
    const prev = latestNumeracySessionByStudent.get(ns.studentId);
    if (!prev || ns.assessedAt.localeCompare(prev.assessedAt) > 0) {
      latestNumeracySessionByStudent.set(ns.studentId, ns);
    }
  }

  interface RawStudentMetrics {
    student: StudentRecord;
    monthsTracked: number;
    hasGrowthBaseline: boolean;
    fluencyStartPct: number | null;
    fluencyLatestPct: number | null;
    fluencyGrowthPts: number | null;
    accuracyStartPct: number | null;
    accuracyLatestPct: number | null;
    accuracyGrowthPts: number | null;
    combinedGrowthScore: number | null;
    readingWpmStart: number | null;
    readingWpmLatest: number | null;
    readingWpmGain: number | null;
    readingAccuracyStartPct: number | null;
    readingAccuracyLatestPct: number | null;
    readingAccuracyGrowthPts: number | null;
    readingGrowthScore: number | null;
    tablesFluencyStartPct: number | null;
    tablesFluencyLatestPct: number | null;
    tablesFluencyGrowthPts: number | null;
    numeracyAccuracyStartPct: number | null;
    numeracyAccuracyLatestPct: number | null;
    numeracyAccuracyGrowthPts: number | null;
    numeracyGrowthScore: number | null;
    currentProficiencyTieBreaker: number;
  }

  const rawRows: RawStudentMetrics[] = classStudents.map((student) => {
    const rList = sortByAcademicMonth(readingByStudent.get(student.id) || []);
    const nList = sortByAcademicMonth(numeracyByStudent.get(student.id) || []);
    const liveRead = latestReadingSessionByStudent.get(student.id);
    const liveNum = latestNumeracySessionByStudent.get(student.id);

    const monthSet = new Set<AcademicMonthKey>();
    for (const r of rList) monthSet.add(r.month);
    for (const n of nList) monthSet.add(n.month);
    if (liveRead) monthSet.add(liveRead.month);
    if (liveNum) monthSet.add(liveNum.month);

    const rFirst = rList[0] ?? null;
    const rLast = rList[rList.length - 1] ?? null;
    const rLatestWpm =
      liveRead && (!rLast || ACTIVE_SESSION_MONTHS.indexOf(liveRead.month) >= ACTIVE_SESSION_MONTHS.indexOf(rLast.month))
        ? liveRead.wpm
        : rLast?.wpm ?? null;
    const rLatestAcc =
      liveRead && (!rLast || ACTIVE_SESSION_MONTHS.indexOf(liveRead.month) >= ACTIVE_SESSION_MONTHS.indexOf(rLast.month))
        ? liveRead.accuracyPct
        : rLast?.accuracyPct ?? null;

    const rStartWpm = rFirst?.wpm ?? liveRead?.wpm ?? null;
    const rStartAcc = rFirst?.accuracyPct ?? liveRead?.accuracyPct ?? null;

    const rHasBaseline = rList.length >= 2 || (rList.length === 1 && liveRead !== undefined && liveRead.month !== rList[0].month);
    const readingWpmGain =
      rStartWpm !== null && rLatestWpm !== null && (rHasBaseline || rStartWpm !== rLatestWpm)
        ? round1(rLatestWpm - rStartWpm)
        : rStartWpm !== null
          ? 0
          : null;
    const readingFluencyStartPct =
      rStartWpm !== null ? normalizeWpmToFluencyPct(rStartWpm, student.classSection) : null;
    const readingFluencyLatestPct =
      rLatestWpm !== null ? normalizeWpmToFluencyPct(rLatestWpm, student.classSection) : null;
    const readingFluencyGrowthPts =
      readingFluencyStartPct !== null && readingFluencyLatestPct !== null
        ? round1(readingFluencyLatestPct - readingFluencyStartPct)
        : null;
    const readingAccuracyGrowthPts =
      rStartAcc !== null && rLatestAcc !== null ? round1(rLatestAcc - rStartAcc) : null;

    const readingGrowthScore =
      rHasBaseline && readingFluencyGrowthPts !== null && readingAccuracyGrowthPts !== null
        ? round1(0.5 * readingFluencyGrowthPts + 0.5 * readingAccuracyGrowthPts)
        : rList.length >= 2 && readingAccuracyGrowthPts !== null
          ? readingAccuracyGrowthPts
          : null;

    const nFirst = nList[0] ?? null;
    const nLast = nList[nList.length - 1] ?? null;
    const nStartTables = nFirst?.tablesFluencyPct ?? liveNum?.tablesFluencyPct ?? null;
    const nLatestTables =
      liveNum && (!nLast || ACTIVE_SESSION_MONTHS.indexOf(liveNum.month) >= ACTIVE_SESSION_MONTHS.indexOf(nLast.month))
        ? liveNum.tablesFluencyPct
        : nLast?.tablesFluencyPct ?? null;

    // For numeracy calculation accuracy: use live session exact accuracyPct if present for latest month, else mentalMathPct/overallPct blend
    const nStartAcc = nFirst
      ? round1(0.6 * nFirst.mentalMathPct + 0.4 * nFirst.overallPct)
      : liveNum?.accuracyPct ?? null;
    const nLatestAcc =
      liveNum && (!nLast || ACTIVE_SESSION_MONTHS.indexOf(liveNum.month) >= ACTIVE_SESSION_MONTHS.indexOf(nLast.month))
        ? liveNum.accuracyPct
        : nLast
          ? round1(0.6 * nLast.mentalMathPct + 0.4 * nLast.overallPct)
          : null;

    const nHasBaseline = nList.length >= 2 || (nList.length === 1 && liveNum !== undefined && liveNum.month !== nList[0].month);
    const tablesFluencyGrowthPts =
      nStartTables !== null && nLatestTables !== null ? round1(nLatestTables - nStartTables) : null;
    const numeracyAccuracyGrowthPts =
      nStartAcc !== null && nLatestAcc !== null ? round1(nLatestAcc - nStartAcc) : null;

    const numeracyGrowthScore =
      nHasBaseline && tablesFluencyGrowthPts !== null && numeracyAccuracyGrowthPts !== null
        ? round1(0.5 * tablesFluencyGrowthPts + 0.5 * numeracyAccuracyGrowthPts)
        : null;

    const fluencyStartPct = averageOrNull([readingFluencyStartPct, nStartTables]);
    const fluencyLatestPct = averageOrNull([readingFluencyLatestPct, nLatestTables]);
    const fluencyGrowthPts =
      fluencyStartPct !== null && fluencyLatestPct !== null
        ? round1(fluencyLatestPct - fluencyStartPct)
        : null;

    const accuracyStartPct = averageOrNull([rStartAcc, nStartAcc]);
    const accuracyLatestPct = averageOrNull([rLatestAcc, nLatestAcc]);
    const accuracyGrowthPts =
      accuracyStartPct !== null && accuracyLatestPct !== null
        ? round1(accuracyLatestPct - accuracyStartPct)
        : null;

    const hasGrowthBaseline = rHasBaseline || nHasBaseline;
    const combinedGrowthScore =
      hasGrowthBaseline && fluencyGrowthPts !== null && accuracyGrowthPts !== null
        ? round1(0.5 * fluencyGrowthPts + 0.5 * accuracyGrowthPts)
        : hasGrowthBaseline
          ? fluencyGrowthPts ?? accuracyGrowthPts
          : null;

    const currentProficiencyTieBreaker =
      averageOrNull([fluencyLatestPct, accuracyLatestPct]) ?? 0;

    return {
      student,
      monthsTracked: monthSet.size,
      hasGrowthBaseline,
      fluencyStartPct,
      fluencyLatestPct,
      fluencyGrowthPts,
      accuracyStartPct,
      accuracyLatestPct,
      accuracyGrowthPts,
      combinedGrowthScore,
      readingWpmStart: rStartWpm,
      readingWpmLatest: rLatestWpm,
      readingWpmGain,
      readingAccuracyStartPct: rStartAcc,
      readingAccuracyLatestPct: rLatestAcc,
      readingAccuracyGrowthPts,
      readingGrowthScore,
      tablesFluencyStartPct: nStartTables,
      tablesFluencyLatestPct: nLatestTables,
      tablesFluencyGrowthPts,
      numeracyAccuracyStartPct: nStartAcc,
      numeracyAccuracyLatestPct: nLatestAcc,
      numeracyAccuracyGrowthPts,
      numeracyGrowthScore,
      currentProficiencyTieBreaker,
    };
  });

  // Compute class benchmarks before rank deltas
  const rankedRaw = rawRows.filter((r) => r.combinedGrowthScore !== null);
  const sortedCombinedScores = rankedRaw
    .map((r) => r.combinedGrowthScore!)
    .sort((a, b) => b - a);
  const topQuartileIdx =
    sortedCombinedScores.length > 0
      ? Math.max(0, Math.ceil(sortedCombinedScores.length * 0.25) - 1)
      : 0;

  const benchmarks: ClassGrowthBenchmarks = {
    classSection,
    totalStudents: classStudents.length,
    rankedStudents: rankedRaw.length,
    classAvgFluencyPct: averageOrNull(rawRows.map((r) => r.fluencyLatestPct)),
    classAvgAccuracyPct: averageOrNull(rawRows.map((r) => r.accuracyLatestPct)),
    classAvgFluencyGrowthPts: averageOrNull(rankedRaw.map((r) => r.fluencyGrowthPts)),
    classAvgAccuracyGrowthPts: averageOrNull(rankedRaw.map((r) => r.accuracyGrowthPts)),
    classAvgCombinedGrowthScore: averageOrNull(rankedRaw.map((r) => r.combinedGrowthScore)),
    classAvgReadingWpm: averageOrNull(rawRows.map((r) => r.readingWpmLatest)),
    classAvgReadingWpmGain: averageOrNull(rankedRaw.map((r) => r.readingWpmGain)),
    classAvgReadingAccuracyPct: averageOrNull(rawRows.map((r) => r.readingAccuracyLatestPct)),
    classAvgReadingAccuracyGrowthPts: averageOrNull(
      rankedRaw.map((r) => r.readingAccuracyGrowthPts),
    ),
    classAvgTablesFluencyPct: averageOrNull(rawRows.map((r) => r.tablesFluencyLatestPct)),
    classAvgTablesFluencyGrowthPts: averageOrNull(
      rankedRaw.map((r) => r.tablesFluencyGrowthPts),
    ),
    classAvgNumeracyAccuracyPct: averageOrNull(rawRows.map((r) => r.numeracyAccuracyLatestPct)),
    classAvgNumeracyAccuracyGrowthPts: averageOrNull(
      rankedRaw.map((r) => r.numeracyAccuracyGrowthPts),
    ),
    topQuartileGrowthCutoff:
      sortedCombinedScores.length > 0 ? sortedCombinedScores[topQuartileIdx] : null,
  };

  const combinedRanks = assignRanks(
    rawRows.map((r) => ({ studentId: r.student.id, raw: r })),
    (x) => x.raw.combinedGrowthScore,
    (x) => x.raw.currentProficiencyTieBreaker,
  );
  const readingRanks = assignRanks(
    rawRows.map((r) => ({ studentId: r.student.id, raw: r })),
    (x) => x.raw.readingGrowthScore,
    (x) => averageOrNull([x.raw.readingWpmLatest, x.raw.readingAccuracyLatestPct]) ?? 0,
  );
  const numeracyRanks = assignRanks(
    rawRows.map((r) => ({ studentId: r.student.id, raw: r })),
    (x) => x.raw.numeracyGrowthScore,
    (x) => averageOrNull([x.raw.tablesFluencyLatestPct, x.raw.numeracyAccuracyLatestPct]) ?? 0,
  );

  const entries: GrowthLeaderboardEntry[] = rawRows.map((r) => {
    const combinedRank = combinedRanks.get(r.student.id) ?? null;
    const rankLabel = combinedRank !== null ? `#${combinedRank}` : 'Unranked';
    const aliasLabel = `Class ${classSection} Learner ${rankLabel}`;
    const vsClassFluencyDelta =
      r.fluencyLatestPct !== null && benchmarks.classAvgFluencyPct !== null
        ? round1(r.fluencyLatestPct - benchmarks.classAvgFluencyPct)
        : null;
    const vsClassAccuracyDelta =
      r.accuracyLatestPct !== null && benchmarks.classAvgAccuracyPct !== null
        ? round1(r.accuracyLatestPct - benchmarks.classAvgAccuracyPct)
        : null;
    const vsClassFluencyGrowthDelta =
      r.fluencyGrowthPts !== null && benchmarks.classAvgFluencyGrowthPts !== null
        ? round1(r.fluencyGrowthPts - benchmarks.classAvgFluencyGrowthPts)
        : null;
    const vsClassAccuracyGrowthDelta =
      r.accuracyGrowthPts !== null && benchmarks.classAvgAccuracyGrowthPts !== null
        ? round1(r.accuracyGrowthPts - benchmarks.classAvgAccuracyGrowthPts)
        : null;

    return {
      studentId: r.student.id,
      aliasLabel,
      displayName: r.student.name,
      realStudentName: r.student.name,
      classSection,
      isCurrentUser: false,
      hasGrowthBaseline: r.hasGrowthBaseline,
      monthsTracked: r.monthsTracked,
      combinedRank,
      readingRank: readingRanks.get(r.student.id) ?? null,
      numeracyRank: numeracyRanks.get(r.student.id) ?? null,
      fluencyStartPct: r.fluencyStartPct,
      fluencyLatestPct: r.fluencyLatestPct,
      fluencyGrowthPts: r.fluencyGrowthPts,
      accuracyStartPct: r.accuracyStartPct,
      accuracyLatestPct: r.accuracyLatestPct,
      accuracyGrowthPts: r.accuracyGrowthPts,
      combinedGrowthScore: r.combinedGrowthScore,
      readingWpmStart: r.readingWpmStart,
      readingWpmLatest: r.readingWpmLatest,
      readingWpmGain: r.readingWpmGain,
      readingAccuracyStartPct: r.readingAccuracyStartPct,
      readingAccuracyLatestPct: r.readingAccuracyLatestPct,
      readingAccuracyGrowthPts: r.readingAccuracyGrowthPts,
      readingGrowthScore: r.readingGrowthScore,
      tablesFluencyStartPct: r.tablesFluencyStartPct,
      tablesFluencyLatestPct: r.tablesFluencyLatestPct,
      tablesFluencyGrowthPts: r.tablesFluencyGrowthPts,
      numeracyAccuracyStartPct: r.numeracyAccuracyStartPct,
      numeracyAccuracyLatestPct: r.numeracyAccuracyLatestPct,
      numeracyAccuracyGrowthPts: r.numeracyAccuracyGrowthPts,
      numeracyGrowthScore: r.numeracyGrowthScore,
      vsClassFluencyDelta,
      vsClassAccuracyDelta,
      vsClassFluencyGrowthDelta,
      vsClassAccuracyGrowthDelta,
      growthTier: classifyGrowthTier(r.combinedGrowthScore, r.currentProficiencyTieBreaker),
    };
  });

  entries.sort((a, b) => {
    if (a.combinedRank !== null && b.combinedRank !== null) {
      if (a.combinedRank !== b.combinedRank) return a.combinedRank - b.combinedRank;
    } else if (a.combinedRank !== null) {
      return -1;
    } else if (b.combinedRank !== null) {
      return 1;
    }
    return a.displayName.localeCompare(b.displayName);
  });

  return {
    classSection,
    benchmarks,
    entries,
  };
}

export function computeSchoolGrowthLeaderboards(params: {
  schoolCode: string;
  students: StudentRecord[];
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyTestSessions?: NumeracyTestSession[];
}): SchoolGrowthLeaderboards {
  const {
    schoolCode,
    students,
    readingReports,
    numeracyReports,
    readingTestSessions = [],
    numeracyTestSessions = [],
  } = params;

  const byClass = new Map<string, StudentRecord[]>();
  for (const st of students) {
    if (!byClass.has(st.classSection)) byClass.set(st.classSection, []);
    byClass.get(st.classSection)!.push(st);
  }

  const studentSet = new Set(students.map((s) => s.id));
  const schoolReading = readingReports.filter((r) => studentSet.has(r.studentId));
  const schoolNumeracy = numeracyReports.filter((n) => studentSet.has(n.studentId));
  const schoolReadSessions = readingTestSessions.filter((rs) => studentSet.has(rs.studentId));
  const schoolNumSessions = numeracyTestSessions.filter((ns) => studentSet.has(ns.studentId));

  const classSections = Array.from(byClass.keys()).sort(compareClassSections);
  const classLeaderboards: Record<string, ClassGrowthLeaderboard> = {};

  for (const sec of classSections) {
    const classStudents = byClass.get(sec) || [];
    const secIds = new Set(classStudents.map((s) => s.id));
    classLeaderboards[sec] = computeClassGrowthLeaderboard({
      classSection: sec,
      classStudents,
      readingReports: schoolReading.filter((r) => secIds.has(r.studentId)),
      numeracyReports: schoolNumeracy.filter((n) => secIds.has(n.studentId)),
      readingTestSessions: schoolReadSessions.filter((rs) => secIds.has(rs.studentId)),
      numeracyTestSessions: schoolNumSessions.filter((ns) => secIds.has(ns.studentId)),
    });
  }

  return {
    schoolCode,
    classLeaderboards,
    classSections,
  };
}

export function sortLeaderboardEntriesForDomain(
  entries: GrowthLeaderboardEntry[],
  domain: GrowthLeaderboardDomain,
): GrowthLeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    const rankA =
      domain === 'reading' ? a.readingRank : domain === 'numeracy' ? a.numeracyRank : a.combinedRank;
    const rankB =
      domain === 'reading' ? b.readingRank : domain === 'numeracy' ? b.numeracyRank : b.combinedRank;
    if (rankA !== null && rankB !== null) {
      if (rankA !== rankB) return rankA - rankB;
    } else if (rankA !== null) {
      return -1;
    } else if (rankB !== null) {
      return 1;
    }
    return a.aliasLabel.localeCompare(b.aliasLabel);
  });
}
