import type {
  AcademicMonthKey,
  MonthlyReadingReport,
  PersonalBestReadingAttempt,
  PersonalBestSummary,
  ReadingTestSession,
  StudentRecord,
} from '../types';
import { resolveWpmFluencyTarget } from './growthLeaderboardEngine.ts';
import { ALL_ACADEMIC_MONTHS } from './visAcademicProgressEngine.ts';

const MONTH_ORDER = new Map<AcademicMonthKey, number>(
  ALL_ACADEMIC_MONTHS.map((m, idx) => [m, idx]),
);

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function compareChronologicalAsc(
  a: { date: string; month: AcademicMonthKey; sourceRank: number; id: string },
  b: { date: string; month: AcademicMonthKey; sourceRank: number; id: string },
): number {
  const dateDiff = a.date.localeCompare(b.date);
  if (dateDiff !== 0) return dateDiff;
  const mA = MONTH_ORDER.get(a.month) ?? 99;
  const mB = MONTH_ORDER.get(b.month) ?? 99;
  if (mA !== mB) return mA - mB;
  if (a.sourceRank !== b.sourceRank) return a.sourceRank - b.sourceRank;
  return a.id.localeCompare(b.id);
}

/**
 * Normalizes a student's live ReadingTestSessions and MonthlyReadingReports into a unified
 * chronological timeline, deduplicating synced monthly rows that mirror an identical live test.
 */
export function buildNormalizedReadingAttempts(params: {
  studentId: string;
  readingTestSessions: ReadingTestSession[];
  readingReports: MonthlyReadingReport[];
}): PersonalBestReadingAttempt[] {
  const { studentId, readingTestSessions, readingReports } = params;

  const liveSessions = readingTestSessions.filter((s) => s.studentId === studentId);
  const monthlyReports = readingReports.filter((r) => r.studentId === studentId);

  const syncedKeys = new Set(
    liveSessions.map(
      (s) => `${s.month}|${Math.round(s.wpm)}|${Math.round(s.accuracyPct)}`,
    ),
  );

  type RawEntry = PersonalBestReadingAttempt & { sourceRank: number };
  const timeline: RawEntry[] = [];

  for (const s of liveSessions) {
    timeline.push({
      id: s.id,
      source: 'live_test',
      title: s.passageTitle || 'Live Reading Test',
      date: s.assessedAt || '2026-11-16',
      month: s.month,
      wpm: round1(s.wpm),
      accuracyPct: round1(s.accuracyPct),
      pronunciationPct: round1(s.pronunciationPct),
      comprehensionPct: round1(s.comprehensionPct),
      overallPct: round1(s.overallPct),
      fluencyStyle: s.dominantFluencyStyle,
      isWpmRecord: false,
      isAccuracyRecord: false,
      sourceRank: 1,
    });
  }

  for (const r of monthlyReports) {
    const dedupeKey = `${r.month}|${Math.round(r.wpm)}|${Math.round(r.accuracyPct)}`;
    if (syncedKeys.has(dedupeKey)) continue;
    timeline.push({
      id: r.id,
      source: 'monthly_report',
      title: `${r.month} ${r.year} Monthly Reading`,
      date: r.assessedAt || `2026-04-01`,
      month: r.month,
      wpm: round1(r.wpm),
      accuracyPct: round1(r.accuracyPct),
      pronunciationPct: null,
      comprehensionPct: round1(r.comprehensionPct),
      overallPct: round1(r.overallPct),
      isWpmRecord: false,
      isAccuracyRecord: false,
      sourceRank: 0,
    });
  }

  timeline.sort(compareChronologicalAsc);

  if (timeline.length === 0) return [];

  const maxWpm = Math.max(...timeline.map((t) => t.wpm));
  const maxAcc = Math.max(...timeline.map((t) => t.accuracyPct));

  // Mark the primary record holder(s) — prefer newest occurrence if tied
  let markedWpm = false;
  let markedAcc = false;
  for (let i = timeline.length - 1; i >= 0; i--) {
    if (!markedWpm && timeline[i].wpm === maxWpm) {
      timeline[i].isWpmRecord = true;
      markedWpm = true;
    }
    if (!markedAcc && timeline[i].accuracyPct === maxAcc) {
      timeline[i].isAccuracyRecord = true;
      markedAcc = true;
    }
  }

  return timeline.map(({ sourceRank: _sr, ...rest }) => rest);
}

/**
 * Computes a student's Personal Best reading speed (WPM) and accuracy tracker
 * from recent reading tests and longitudinal monthly reading checks.
 */
export function computeStudentPersonalBest(params: {
  student: StudentRecord;
  readingTestSessions?: ReadingTestSession[];
  readingReports?: MonthlyReadingReport[];
  recentLimit?: number;
}): PersonalBestSummary {
  const {
    student,
    readingTestSessions = [],
    readingReports = [],
    recentLimit = 6,
  } = params;

  const classTargetWpm = resolveWpmFluencyTarget(student.classSection);
  const chronological = buildNormalizedReadingAttempts({
    studentId: student.id,
    readingTestSessions,
    readingReports,
  });

  if (chronological.length === 0) {
    return {
      studentId: student.id,
      classTargetWpm,
      totalAttempts: 0,
      liveTestCount: 0,
      bestWpm: null,
      bestWpmDate: null,
      bestWpmLabel: null,
      bestWpmSource: null,
      bestAccuracyPct: null,
      bestAccuracyDate: null,
      bestAccuracyLabel: null,
      bestAccuracySource: null,
      latestWpm: null,
      latestAccuracyPct: null,
      wpmGapToBest: null,
      accuracyGapToBest: null,
      latestSetNewWpmBest: false,
      latestSetNewAccuracyBest: false,
      streakImprovingCount: 0,
      nextMilestoneWpm: classTargetWpm,
      encouragementMessage:
        'Complete your first Live Reading Test to establish your baseline WPM and Accuracy Personal Best.',
      recentAttempts: [],
    };
  }

  const bestWpmAttempt =
    chronological.find((a) => a.isWpmRecord) || chronological[chronological.length - 1];
  const bestAccAttempt =
    chronological.find((a) => a.isAccuracyRecord) || chronological[chronological.length - 1];
  const latest = chronological[chronological.length - 1];

  const priorAttempts = chronological.slice(0, -1);
  const priorMaxWpm =
    priorAttempts.length > 0 ? Math.max(...priorAttempts.map((a) => a.wpm)) : null;
  const priorMaxAcc =
    priorAttempts.length > 0 ? Math.max(...priorAttempts.map((a) => a.accuracyPct)) : null;

  const latestSetNewWpmBest =
    priorMaxWpm === null ? chronological.length === 1 : latest.wpm > priorMaxWpm;
  const latestSetNewAccuracyBest =
    priorMaxAcc === null ? chronological.length === 1 : latest.accuracyPct > priorMaxAcc;

  // Count consecutive recent sessions showing WPM or Accuracy progression
  let streakImprovingCount = 0;
  for (let i = chronological.length - 1; i >= 1; i--) {
    const curr = chronological[i];
    const prev = chronological[i - 1];
    if (curr.wpm > prev.wpm || curr.accuracyPct > prev.accuracyPct) {
      streakImprovingCount++;
    } else {
      break;
    }
  }

  const wpmGapToBest = round1(latest.wpm - bestWpmAttempt.wpm);
  const accuracyGapToBest = round1(latest.accuracyPct - bestAccAttempt.accuracyPct);
  const rawNextMilestone = Math.max(classTargetWpm, Math.ceil((bestWpmAttempt.wpm + 5) / 5) * 5);
  const nextMilestoneWpm = Math.min(220, rawNextMilestone);

  let encouragementMessage: string;
  if (latestSetNewWpmBest && latestSetNewAccuracyBest && chronological.length > 1) {
    encouragementMessage = `Double Personal Best achieved (${latest.wpm} WPM & ${latest.accuracyPct}% accuracy). Aim for ${nextMilestoneWpm} WPM next while preserving clear pronunciation.`;
  } else if (latestSetNewWpmBest && chronological.length > 1) {
    encouragementMessage = `New fluency Personal Best at ${latest.wpm} WPM! Push calmly toward ${nextMilestoneWpm} WPM next.`;
  } else if (latestSetNewAccuracyBest && chronological.length > 1) {
    encouragementMessage = `New pronunciation accuracy Personal Best (${latest.accuracyPct}%). Consistent chunk reading is locking in crisp expression.`;
  } else if (wpmGapToBest === 0 && accuracyGapToBest === 0) {
    encouragementMessage = `Holding peak form at ${bestWpmAttempt.wpm} WPM and ${bestAccAttempt.accuracyPct}% accuracy. Try a fresh passage to set ${nextMilestoneWpm} WPM.`;
  } else if (wpmGapToBest >= -6 && accuracyGapToBest >= -3) {
    encouragementMessage = `Right within striking distance of your Personal Best (${Math.abs(wpmGapToBest)} WPM away from ${bestWpmAttempt.wpm} WPM). One focused whole-sentence read can set a new high.`;
  } else {
    encouragementMessage = `Your Personal Best stands at ${bestWpmAttempt.wpm} WPM and ${bestAccAttempt.accuracyPct}% accuracy. Practise phrase chunking (3+ words at a go) to climb past your recent ${latest.wpm} WPM run.`;
  }

  const recentAttempts = [...chronological].reverse().slice(0, Math.max(1, recentLimit));

  return {
    studentId: student.id,
    classTargetWpm,
    totalAttempts: chronological.length,
    liveTestCount: chronological.filter((a) => a.source === 'live_test').length,
    bestWpm: bestWpmAttempt.wpm,
    bestWpmDate: bestWpmAttempt.date,
    bestWpmLabel: bestWpmAttempt.title,
    bestWpmSource: bestWpmAttempt.source,
    bestAccuracyPct: bestAccAttempt.accuracyPct,
    bestAccuracyDate: bestAccAttempt.date,
    bestAccuracyLabel: bestAccAttempt.title,
    bestAccuracySource: bestAccAttempt.source,
    latestWpm: latest.wpm,
    latestAccuracyPct: latest.accuracyPct,
    wpmGapToBest,
    accuracyGapToBest,
    latestSetNewWpmBest,
    latestSetNewAccuracyBest,
    streakImprovingCount,
    nextMilestoneWpm,
    encouragementMessage,
    recentAttempts,
  };
}

/**
 * Checks whether a newly completed reading session beats prior Personal Best records.
 */
export function evaluateNewPersonalBestStatus(params: {
  student: StudentRecord;
  existingSessions: ReadingTestSession[];
  existingReports: MonthlyReadingReport[];
  candidateWpm: number;
  candidateAccuracyPct: number;
}): {
  beatWpm: boolean;
  beatAccuracy: boolean;
  priorBestWpm: number | null;
  priorBestAccuracy: number | null;
} {
  const prior = computeStudentPersonalBest({
    student: params.student,
    readingTestSessions: params.existingSessions,
    readingReports: params.existingReports,
  });

  return {
    beatWpm: prior.bestWpm === null || params.candidateWpm > prior.bestWpm,
    beatAccuracy:
      prior.bestAccuracyPct === null || params.candidateAccuracyPct > prior.bestAccuracyPct,
    priorBestWpm: prior.bestWpm,
    priorBestAccuracy: prior.bestAccuracyPct,
  };
}
