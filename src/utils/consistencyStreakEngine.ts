import type {
  HomeworkAssignment,
  HomeworkSubmission,
  NotebookEntry,
} from '../types';

export type StreakBadgeId =
  | 'first_spark'
  | 'weekly_steady'
  | 'fortnight_scholar'
  | 'neatness_vanguard'
  | 'zero_gap_champion';

export interface StreakBadge {
  id: StreakBadgeId;
  title: string;
  subtitle: string;
  requirementLabel: string;
  pointsReward: number;
  unlocked: boolean;
  unlockedDate: string | null;
  progressCurrent: number;
  progressTarget: number;
  progressPct: number;
  accent: 'blue' | 'emerald' | 'amber' | 'indigo' | 'teal';
}

export interface StreakDayEntrySummary {
  id: string;
  subject: string;
  chapter: string;
  checked: boolean;
  homeworkDone: boolean;
  workQuality: string;
  handwriting: string;
  teacherName: string;
}

export interface StreakTimelineDay {
  date: string;
  weekdayShort: string;
  dayNumber: string;
  monthShort: string;
  status: 'complete' | 'incomplete' | 'no_check';
  entriesCount: number;
  pointsEarned: number;
  streakDayNumber: number;
  excellenceAwarded: boolean;
  entries: StreakDayEntrySummary[];
}

export interface ConsistencyPointsBreakdown {
  submissionBasePoints: number;
  streakMultiplierPoints: number;
  excellenceBonusPoints: number;
  badgeRewardPoints: number;
  totalPoints: number;
}

export interface ConsistencyStreakSummary {
  studentId: string;
  referenceDate: string;
  currentStreakDays: number;
  longestStreakDays: number;
  isStreakActive: boolean;
  streakStatusLabel: string;
  completeDaysCount: number;
  incompleteDaysCount: number;
  totalCheckedDaysCount: number;
  gradeAExcellenceDaysCount: number;
  timelyRatePct: number;
  onTimeHomeworkCount: number;
  points: ConsistencyPointsBreakdown;
  tierTitle: string;
  nextTierTitle: string | null;
  pointsToNextTier: number;
  tierProgressPct: number;
  badges: StreakBadge[];
  earnedBadgesCount: number;
  nextBadge: StreakBadge | null;
  recentTimeline: StreakTimelineDay[];
  encouragementMessage: string;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const TIER_LADDER: Array<{ minPoints: number; title: string }> = [
  { minPoints: 0, title: 'Starter' },
  { minPoints: 100, title: 'Steady Learner' },
  { minPoints: 250, title: 'Consistent Scholar' },
  { minPoints: 450, title: 'Streak Captain' },
  { minPoints: 700, title: 'Master of Discipline' },
];

function parseIsoUtc(isoDate: string): Date | null {
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(Date.UTC(year, month, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatIsoUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addUtcDays(d: Date, delta: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + delta);
  return next;
}

/**
 * Counts how many school days (Monday-Saturday; Sundays excluded) strictly fall
 * between two ISO dates. Returns 1 when dates are immediately consecutive school days
 * (e.g., Thu->Fri or Sat->Mon).
 */
export function schoolDaysBetween(earlierIso: string, laterIso: string): number {
  const start = parseIsoUtc(earlierIso);
  const end = parseIsoUtc(laterIso);
  if (!start || !end) return 999;
  if (end.getTime() <= start.getTime()) return 0;

  let count = 0;
  let cursor = addUtcDays(start, 1);
  let guard = 0;
  while (cursor.getTime() <= end.getTime() && guard < 400) {
    if (cursor.getUTCDay() !== 0) {
      count += 1;
    }
    cursor = addUtcDays(cursor, 1);
    guard += 1;
  }
  return count;
}

/**
 * Computes a student's complete Notebook Consistency Streak, points breakdown,
 * virtual badges, and 10-school-day visual timeline from logged notebook entries.
 */
export function computeStudentConsistencyStreak(params: {
  studentId: string;
  notebookEntries: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  referenceDate?: string;
}): ConsistencyStreakSummary {
  const {
    studentId,
    notebookEntries,
    homeworkAssignments = [],
    homeworkSubmissions = [],
    referenceDate = '2026-11-19',
  } = params;

  const studentEntries = notebookEntries
    .filter((nb) => nb.studentId === studentId && Boolean(parseIsoUtc(nb.date)))
    .sort((a, b) => a.date.localeCompare(b.date));

  const onTimeHomeworkCount = homeworkSubmissions.filter((sub) => {
    if (sub.studentId !== studentId || sub.status !== 'Handed In') return false;
    const hw = homeworkAssignments.find((a) => a.id === sub.assignmentId);
    if (!hw) return true;
    const markedIso = (sub.markedAt || '').slice(0, 10);
    return !markedIso || markedIso <= hw.dueDate;
  }).length;

  // Group entries by date
  const entriesByDate = new Map<string, NotebookEntry[]>();
  for (const nb of studentEntries) {
    const bucket = entriesByDate.get(nb.date) || [];
    bucket.push(nb);
    entriesByDate.set(nb.date, bucket);
  }

  const sortedDates = Array.from(entriesByDate.keys()).sort();

  let completeDaysCount = 0;
  let incompleteDaysCount = 0;
  let gradeAExcellenceDaysCount = 0;
  let submissionBasePoints = 0;
  let streakMultiplierPoints = 0;
  let excellenceBonusPoints = 0;

  let runningStreak = 0;
  let longestStreakDays = 0;
  let prevCompleteDate: string | null = null;
  let lastLoggedStatus: 'complete' | 'incomplete' | null = null;
  let lastCompleteDate: string | null = null;

  const badgeUnlockDate: Partial<Record<StreakBadgeId, string>> = {};
  const perDateStats = new Map<
    string,
    {
      status: 'complete' | 'incomplete';
      pointsEarned: number;
      streakDayNumber: number;
      excellenceAwarded: boolean;
    }
  >();

  for (const iso of sortedDates) {
    const dayEntries = entriesByDate.get(iso) || [];
    const allCompleteAndTimely =
      dayEntries.length > 0 && dayEntries.every((e) => e.checked && e.homeworkDone);

    if (allCompleteAndTimely) {
      completeDaysCount += 1;
      const isConsecutive =
        prevCompleteDate !== null && schoolDaysBetween(prevCompleteDate, iso) <= 1;

      runningStreak = isConsecutive ? runningStreak + 1 : 1;
      if (runningStreak > longestStreakDays) {
        longestStreakDays = runningStreak;
      }

      const basePts = 20;
      const streakBonus = Math.min(25, Math.max(0, (runningStreak - 1) * 5));
      const hasExcellence = dayEntries.every(
        (e) => e.workQuality === 'A' && e.handwriting === 'Readability',
      );
      const excPts = hasExcellence ? 10 : 0;

      if (hasExcellence) {
        gradeAExcellenceDaysCount += 1;
        if (gradeAExcellenceDaysCount === 3 && !badgeUnlockDate.neatness_vanguard) {
          badgeUnlockDate.neatness_vanguard = iso;
        }
      }

      submissionBasePoints += basePts;
      streakMultiplierPoints += streakBonus;
      excellenceBonusPoints += excPts;

      if (runningStreak >= 3 && !badgeUnlockDate.first_spark) {
        badgeUnlockDate.first_spark = iso;
      }
      if (runningStreak >= 5 && !badgeUnlockDate.weekly_steady) {
        badgeUnlockDate.weekly_steady = iso;
      }
      if (runningStreak >= 10 && !badgeUnlockDate.fortnight_scholar) {
        badgeUnlockDate.fortnight_scholar = iso;
      }

      perDateStats.set(iso, {
        status: 'complete',
        pointsEarned: basePts + streakBonus + excPts,
        streakDayNumber: runningStreak,
        excellenceAwarded: hasExcellence,
      });

      prevCompleteDate = iso;
      lastCompleteDate = iso;
      lastLoggedStatus = 'complete';
    } else {
      incompleteDaysCount += 1;
      runningStreak = 0;
      prevCompleteDate = null;
      lastLoggedStatus = 'incomplete';
      perDateStats.set(iso, {
        status: 'incomplete',
        pointsEarned: 0,
        streakDayNumber: 0,
        excellenceAwarded: false,
      });
    }
  }

  const totalCheckedDaysCount = completeDaysCount + incompleteDaysCount;
  const timelyRatePct =
    totalCheckedDaysCount > 0
      ? Math.round((completeDaysCount / totalCheckedDaysCount) * 100)
      : 0;

  // Determine whether the active streak is still live relative to referenceDate
  // Allow up to 1 school day gap from referenceDate (e.g., today's check hasn't been logged yet)
  const effectiveRefDate =
    sortedDates.length > 0 && sortedDates[sortedDates.length - 1] > referenceDate
      ? sortedDates[sortedDates.length - 1]
      : referenceDate;

  let currentStreakDays = 0;
  let isStreakActive = false;

  if (lastLoggedStatus === 'complete' && lastCompleteDate) {
    const gapFromToday = schoolDaysBetween(lastCompleteDate, effectiveRefDate);
    if (gapFromToday <= 1) {
      currentStreakDays = runningStreak;
      isStreakActive = true;
    }
  }

  // Zero-Gap Champion unlocks when student has >= 5 complete days and 0 incomplete days
  const zeroGapUnlocked = completeDaysCount >= 5 && incompleteDaysCount === 0;
  if (zeroGapUnlocked && lastCompleteDate) {
    badgeUnlockDate.zero_gap_champion = lastCompleteDate;
  }

  const bestForProgress = Math.max(currentStreakDays, longestStreakDays);

  const badges: StreakBadge[] = [
    {
      id: 'first_spark',
      title: 'First Spark',
      subtitle: '3-Day Consistency',
      requirementLabel: '3 consecutive complete days',
      pointsReward: 25,
      unlocked: longestStreakDays >= 3,
      unlockedDate: badgeUnlockDate.first_spark || null,
      progressCurrent: Math.min(bestForProgress, 3),
      progressTarget: 3,
      progressPct: Math.min(100, Math.round((Math.min(bestForProgress, 3) / 3) * 100)),
      accent: 'amber',
    },
    {
      id: 'weekly_steady',
      title: 'Weekly Steady',
      subtitle: '5-Day School Run',
      requirementLabel: '5 consecutive complete days',
      pointsReward: 50,
      unlocked: longestStreakDays >= 5,
      unlockedDate: badgeUnlockDate.weekly_steady || null,
      progressCurrent: Math.min(bestForProgress, 5),
      progressTarget: 5,
      progressPct: Math.min(100, Math.round((Math.min(bestForProgress, 5) / 5) * 100)),
      accent: 'blue',
    },
    {
      id: 'neatness_vanguard',
      title: 'Neatness Vanguard',
      subtitle: 'Grade A Presentation',
      requirementLabel: '3 complete days with Grade A & Readability',
      pointsReward: 75,
      unlocked: gradeAExcellenceDaysCount >= 3,
      unlockedDate: badgeUnlockDate.neatness_vanguard || null,
      progressCurrent: Math.min(gradeAExcellenceDaysCount, 3),
      progressTarget: 3,
      progressPct: Math.min(100, Math.round((Math.min(gradeAExcellenceDaysCount, 3) / 3) * 100)),
      accent: 'emerald',
    },
    {
      id: 'zero_gap_champion',
      title: 'Zero-Gap Champion',
      subtitle: '100% Timely Record',
      requirementLabel: '5+ complete days with zero incomplete entries',
      pointsReward: 100,
      unlocked: zeroGapUnlocked,
      unlockedDate: badgeUnlockDate.zero_gap_champion || null,
      progressCurrent: incompleteDaysCount > 0 ? 0 : Math.min(completeDaysCount, 5),
      progressTarget: 5,
      progressPct:
        incompleteDaysCount > 0
          ? 0
          : Math.min(100, Math.round((Math.min(completeDaysCount, 5) / 5) * 100)),
      accent: 'teal',
    },
    {
      id: 'fortnight_scholar',
      title: 'Fortnight Scholar',
      subtitle: '10-Day Mastery Run',
      requirementLabel: '10 consecutive complete days',
      pointsReward: 150,
      unlocked: longestStreakDays >= 10,
      unlockedDate: badgeUnlockDate.fortnight_scholar || null,
      progressCurrent: Math.min(bestForProgress, 10),
      progressTarget: 10,
      progressPct: Math.min(100, Math.round((Math.min(bestForProgress, 10) / 10) * 100)),
      accent: 'indigo',
    },
  ];

  const earnedBadgesCount = badges.filter((b) => b.unlocked).length;
  const badgeRewardPoints = badges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.pointsReward, 0);

  const totalPoints =
    submissionBasePoints + streakMultiplierPoints + excellenceBonusPoints + badgeRewardPoints;

  // Next locked badge closest to completion
  const lockedBadges = badges.filter((b) => !b.unlocked);
  const nextBadge =
    lockedBadges.length > 0
      ? [...lockedBadges].sort((a, b) => {
          const remA = a.progressTarget - a.progressCurrent;
          const remB = b.progressTarget - b.progressCurrent;
          if (remA !== remB) return remA - remB;
          return b.progressPct - a.progressPct;
        })[0]
      : null;

  // Compute tier rank
  let currentTierIdx = 0;
  for (let i = 0; i < TIER_LADDER.length; i += 1) {
    if (totalPoints >= TIER_LADDER[i].minPoints) {
      currentTierIdx = i;
    }
  }
  const currentTier = TIER_LADDER[currentTierIdx];
  const nextTier = TIER_LADDER[currentTierIdx + 1] || null;
  const pointsToNextTier = nextTier ? Math.max(0, nextTier.minPoints - totalPoints) : 0;
  const tierProgressPct = nextTier
    ? Math.min(
        100,
        Math.round(
          ((totalPoints - currentTier.minPoints) /
            Math.max(1, nextTier.minPoints - currentTier.minPoints)) *
            100,
        ),
      )
    : 100;

  // Build recent 10 school days (Mon-Sat) ending at effectiveRefDate
  const recentTimeline: StreakTimelineDay[] = [];
  const refUtc = parseIsoUtc(effectiveRefDate) || parseIsoUtc('2026-11-19')!;
  let cursor = refUtc;
  let safety = 0;
  while (recentTimeline.length < 10 && safety < 30) {
    if (cursor.getUTCDay() !== 0) {
      const iso = formatIsoUtc(cursor);
      const dayEntries = entriesByDate.get(iso) || [];
      const stat = perDateStats.get(iso);
      recentTimeline.unshift({
        date: iso,
        weekdayShort: WEEKDAY_SHORT[cursor.getUTCDay()],
        dayNumber: String(cursor.getUTCDate()).padStart(2, '0'),
        monthShort: MONTH_SHORT[cursor.getUTCMonth()],
        status: stat ? stat.status : 'no_check',
        entriesCount: dayEntries.length,
        pointsEarned: stat ? stat.pointsEarned : 0,
        streakDayNumber: stat ? stat.streakDayNumber : 0,
        excellenceAwarded: stat ? stat.excellenceAwarded : false,
        entries: dayEntries.map((e) => ({
          id: e.id,
          subject: e.subject,
          chapter: e.chapter,
          checked: e.checked,
          homeworkDone: e.homeworkDone,
          workQuality: e.workQuality,
          handwriting: e.handwriting,
          teacherName: e.teacherName,
        })),
      });
    }
    cursor = addUtcDays(cursor, -1);
    safety += 1;
  }

  // Clear human-readable status & motivation copy
  let streakStatusLabel = 'Ready to Start';
  let encouragementMessage =
    'Submit complete and neatly written notebooks on 3 consecutive school days to unlock your First Spark badge (+25 pts).';

  if (totalCheckedDaysCount > 0) {
    if (isStreakActive && currentStreakDays >= 5) {
      streakStatusLabel = 'On Fire · Active Streak';
      encouragementMessage = nextBadge
        ? `Strong momentum! Keep submitting complete notebooks for ${Math.max(1, nextBadge.progressTarget - nextBadge.progressCurrent)} more school ${nextBadge.progressTarget - nextBadge.progressCurrent === 1 ? 'day' : 'days'} to unlock ${nextBadge.title} (+${nextBadge.pointsReward} pts).`
        : 'Outstanding discipline! You have unlocked every Consistency Streak badge with a clean timely notebook record.';
    } else if (isStreakActive && currentStreakDays >= 1) {
      streakStatusLabel = 'Active Streak';
      encouragementMessage = nextBadge
        ? `You are on a ${currentStreakDays}-day streak! Complete ${Math.max(1, nextBadge.progressTarget - nextBadge.progressCurrent)} more consecutive school ${nextBadge.progressTarget - nextBadge.progressCurrent === 1 ? 'day' : 'days'} to earn ${nextBadge.title} (+${nextBadge.pointsReward} pts).`
        : `Great consistency! Keep your ${currentStreakDays}-day notebook streak going tomorrow.`;
    } else if (lastLoggedStatus === 'incomplete') {
      streakStatusLabel = 'Streak Paused · Incomplete Check';
      encouragementMessage =
        'Your last logged notebook check had pending work. Finish any incomplete chapter pages and submit on time tomorrow to start a fresh streak.';
    } else {
      streakStatusLabel = 'Check Due Today';
      encouragementMessage =
        'Submit your complete notebook at the next class check to restart your consecutive-day streak.';
    }
  }

  return {
    studentId,
    referenceDate: effectiveRefDate,
    currentStreakDays,
    longestStreakDays,
    isStreakActive,
    streakStatusLabel,
    completeDaysCount,
    incompleteDaysCount,
    totalCheckedDaysCount,
    gradeAExcellenceDaysCount,
    timelyRatePct,
    onTimeHomeworkCount,
    points: {
      submissionBasePoints,
      streakMultiplierPoints,
      excellenceBonusPoints,
      badgeRewardPoints,
      totalPoints,
    },
    tierTitle: currentTier.title,
    nextTierTitle: nextTier ? nextTier.title : null,
    pointsToNextTier,
    tierProgressPct,
    badges,
    earnedBadgesCount,
    nextBadge,
    recentTimeline,
    encouragementMessage,
  };
}
