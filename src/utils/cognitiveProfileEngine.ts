import type {
  AgeBand,
  CognitiveAttemptRecord,
  CognitiveCategory,
  CognitiveGameDefinition,
  OlqKey,
} from '../types';
import { getCognitiveGameById, getCognitiveGamesCatalog } from './cognitiveGamesCatalog.ts';

export interface CognitiveCategorySummary {
  category: CognitiveCategory;
  attempts: number;
  accuracyPct: number | null;
  avgReactionMs: number | null;
  highestLevel: number;
  improvementDeltaPct: number | null;
  learningIndicator: string;
  potentialOlqKeys: OlqKey[];
}

export interface CognitiveBadge {
  id: string;
  title: string;
  criteria: string;
}

export interface StudentCognitiveProfile {
  studentId: string;
  totalAttempts: number;
  gamesExploredCount: number;
  overallAccuracyPct: number | null;
  avgCompletionTimeSec: number | null;
  avgReactionTimeMs: number | null;
  totalErrors: number;
  highestLevelCompleted: number;
  improvementDeltaPct: number | null;
  practiceConsistencyDays: number;
  dailyChallengeCompleted: boolean;
  weeklyMemoryCompleted: boolean;
  earnedBadges: CognitiveBadge[];
  categorySummaries: CognitiveCategorySummary[];
  strengths: string[];
  practiceRecommendations: string[];
  advisoryNotice: string;
}

/**
 * Extracts numeric class grade (1-12) from strings like "9-A", "10-B", "4-C".
 */
export function parseClassGrade(classSection: string): number {
  const match = classSection.match(/\d+/);
  const grade = match ? Number(match[0]) : 6;
  return Math.max(1, Math.min(12, grade));
}

export function getAgeBandForClass(classSection: string): AgeBand {
  const grade = parseClassGrade(classSection);
  if (grade <= 2) return 'Classes 1–2';
  if (grade <= 5) return 'Classes 3–5';
  if (grade <= 8) return 'Classes 6–8';
  if (grade <= 10) return 'Classes 9–10';
  return 'Classes 11–12';
}

export function getBaselineLevelForClass(classSection: string): 1 | 2 | 3 | 4 | 5 {
  const grade = parseClassGrade(classSection);
  if (grade <= 2) return 1;
  if (grade <= 5) return 2;
  if (grade <= 8) return 3;
  if (grade <= 10) return 4;
  return 5;
}

/**
 * Computes the adaptive difficulty level (1-5) for a specific student + game.
 * Starts from the age/class baseline, then adapts based on the student's recent attempts.
 */
export function computeAdaptiveLevel(
  classSection: string,
  studentAttempts: CognitiveAttemptRecord[],
  gameId: string,
): 1 | 2 | 3 | 4 | 5 {
  const baseline = getBaselineLevelForClass(classSection);
  const gameAttempts = studentAttempts
    .filter((a) => a.gameId === gameId)
    .sort((a, b) => a.playedAt.localeCompare(b.playedAt));

  if (gameAttempts.length === 0) return baseline;

  const latest = gameAttempts[gameAttempts.length - 1];
  let level: number = latest.difficultyLevel;

  // Step up if latest accuracy >= 85% and completed cleanly
  if (latest.completed && latest.accuracyPct >= 85 && latest.errorCount <= 2) {
    level = Math.min(5, latest.difficultyLevel + 1);
  } else if (!latest.completed || latest.accuracyPct < 55) {
    // Gentle step-down if student struggled on the latest round
    level = Math.max(1, latest.difficultyLevel - 1);
  }

  return level as 1 | 2 | 3 | 4 | 5;
}

export function getDailyChallengeGame(dateIso = '2026-11-14'): CognitiveGameDefinition {
  const catalog = getCognitiveGamesCatalog();
  const phase1 = catalog.filter((g) => g.phase === 'Phase 1 · Core');
  const pool = phase1.length > 0 ? phase1 : catalog;
  const daySeed = dateIso.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return pool[daySeed % pool.length];
}

export function getWeeklyMemoryGame(dateIso = '2026-11-14'): CognitiveGameDefinition {
  const catalog = getCognitiveGamesCatalog();
  const memoryGames = catalog.filter((g) => g.category === 'Memory Training');
  const pool = memoryGames.length > 0 ? memoryGames : catalog;
  const weekSeed = Number(dateIso.slice(8, 10) || 14);
  return pool[weekSeed % pool.length];
}

const CATEGORY_LEARNING_LABELS: Record<CognitiveCategory, { indicator: string; olqs: OlqKey[] }> = {
  'Visual Attention': {
    indicator: 'Focus and concentration',
    olqs: ['determination', 'stamina'],
  },
  'Memory Training': {
    indicator: 'Recall and working memory',
    olqs: ['effective_intelligence'],
  },
  'Perception Training': {
    indicator: 'Observation and visual discrimination',
    olqs: ['effective_intelligence', 'reasoning_ability'],
  },
  'Response Control': {
    indicator: 'Impulse control and rule following',
    olqs: ['sense_of_responsibility', 'speed_of_decision'],
  },
  'Logical Thinking': {
    indicator: 'Analysis and problem-solving',
    olqs: ['reasoning_ability', 'effective_intelligence'],
  },
  'Cognitive Flexibility': {
    indicator: 'Sequencing, adaptability and strategy',
    olqs: ['organising_ability', 'speed_of_decision'],
  },
};

/**
 * Computes self-referenced Cognitive Practice Profile for a student.
 * Strictly compares the student with their own earlier baseline — NO public rankings.
 * Never directly modifies OLQ scores or Learners Score.
 */
export function computeStudentCognitiveProfile(
  studentId: string,
  attempts: CognitiveAttemptRecord[],
  todayIso = '2026-11-14',
): StudentCognitiveProfile {
  const studentAttempts = attempts
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => a.playedAt.localeCompare(b.playedAt));

  const totalAttempts = studentAttempts.length;
  const gamesExploredCount = new Set(studentAttempts.map((a) => a.gameId)).size;

  const overallAccuracyPct =
    totalAttempts > 0
      ? Number(
          (
            studentAttempts.reduce((acc, a) => acc + a.accuracyPct, 0) / totalAttempts
          ).toFixed(1),
        )
      : null;

  const avgCompletionTimeSec =
    totalAttempts > 0
      ? Math.round(
          studentAttempts.reduce((acc, a) => acc + a.completionTimeSec, 0) / totalAttempts,
        )
      : null;

  const rtAttempts = studentAttempts.filter(
    (a): a is CognitiveAttemptRecord & { reactionTimeMs: number } =>
      typeof a.reactionTimeMs === 'number' && a.reactionTimeMs > 0,
  );
  const avgReactionTimeMs =
    rtAttempts.length > 0
      ? Math.round(
          rtAttempts.reduce((acc, a) => acc + a.reactionTimeMs, 0) / rtAttempts.length,
        )
      : null;

  const totalErrors = studentAttempts.reduce((acc, a) => acc + a.errorCount, 0);
  const highestLevelCompleted = studentAttempts.reduce(
    (max, a) => (a.completed ? Math.max(max, a.difficultyLevel) : max),
    0,
  );

  let improvementDeltaPct: number | null = null;
  if (studentAttempts.length >= 2) {
    const mid = Math.floor(studentAttempts.length / 2);
    const earlyAvg =
      studentAttempts.slice(0, mid).reduce((s, a) => s + a.accuracyPct, 0) / mid;
    const recentSlice = studentAttempts.slice(mid);
    const recentAvg =
      recentSlice.reduce((s, a) => s + a.accuracyPct, 0) / recentSlice.length;
    improvementDeltaPct = Number((recentAvg - earlyAvg).toFixed(1));
  }

  const practiceDays = new Set(studentAttempts.map((a) => a.playedAt.slice(0, 10)));
  const practiceConsistencyDays = practiceDays.size;

  const dailyGame = getDailyChallengeGame(todayIso);
  const weeklyMemory = getWeeklyMemoryGame(todayIso);
  const dailyChallengeCompleted = studentAttempts.some(
    (a) =>
      a.completed &&
      a.playedAt.slice(0, 10) === todayIso &&
      (a.challengeTag === 'daily' || a.gameId === dailyGame.id),
  );
  const weeklyMemoryCompleted = studentAttempts.some(
    (a) =>
      a.completed &&
      (a.challengeTag === 'weekly' || a.gameId === weeklyMemory.id),
  );

  const categories = Object.keys(CATEGORY_LEARNING_LABELS) as CognitiveCategory[];
  const categorySummaries: CognitiveCategorySummary[] = categories.map((cat) => {
    const catAttempts = studentAttempts.filter((a) => a.category === cat);
    const count = catAttempts.length;
    const acc =
      count > 0
        ? Number((catAttempts.reduce((s, a) => s + a.accuracyPct, 0) / count).toFixed(1))
        : null;
    const catRt = catAttempts.filter(
      (a): a is CognitiveAttemptRecord & { reactionTimeMs: number } =>
        typeof a.reactionTimeMs === 'number' && a.reactionTimeMs > 0,
    );
    const avgRt =
      catRt.length > 0
        ? Math.round(catRt.reduce((s, a) => s + a.reactionTimeMs, 0) / catRt.length)
        : null;
    const highest = catAttempts.reduce(
      (m, a) => (a.completed ? Math.max(m, a.difficultyLevel) : m),
      0,
    );
    let delta: number | null = null;
    if (catAttempts.length >= 2) {
      delta = Number(
        (catAttempts[catAttempts.length - 1].accuracyPct - catAttempts[0].accuracyPct).toFixed(1),
      );
    }

    return {
      category: cat,
      attempts: count,
      accuracyPct: acc,
      avgReactionMs: avgRt,
      highestLevel: highest,
      improvementDeltaPct: delta,
      learningIndicator: CATEGORY_LEARNING_LABELS[cat].indicator,
      potentialOlqKeys: CATEGORY_LEARNING_LABELS[cat].olqs,
    };
  });

  // Derive achievement badges from real attempts
  const earnedBadges: CognitiveBadge[] = [];
  if (totalAttempts >= 1) {
    earnedBadges.push({
      id: 'first-practice',
      title: 'First Focus Step',
      criteria: 'Completed initial cognitive practice session',
    });
  }
  if (practiceConsistencyDays >= 3) {
    earnedBadges.push({
      id: 'steady-habit',
      title: 'Steady Practice Habit',
      criteria: `Practised across ${practiceConsistencyDays} distinct days`,
    });
  }
  if (gamesExploredCount >= 4) {
    earnedBadges.push({
      id: 'multi-domain-explorer',
      title: 'Multi-Domain Explorer',
      criteria: `Practised ${gamesExploredCount} distinct cognitive games`,
    });
  }
  if (studentAttempts.some((a) => a.completed && a.accuracyPct >= 90)) {
    earnedBadges.push({
      id: 'high-precision',
      title: 'Precision Focus',
      criteria: 'Achieved 90%+ accuracy in a completed round',
    });
  }
  if (improvementDeltaPct !== null && improvementDeltaPct > 0) {
    earnedBadges.push({
      id: 'personal-growth',
      title: 'Self-Improvement Streak',
      criteria: `+${improvementDeltaPct}% accuracy gain vs earlier practice baseline`,
    });
  }

  // Strengths & non-stigmatising recommendations
  const practicedCategories = categorySummaries
    .filter((c) => c.attempts > 0 && c.accuracyPct !== null)
    .sort((a, b) => (b.accuracyPct ?? 0) - (a.accuracyPct ?? 0));

  const strengths = practicedCategories
    .filter((c) => (c.accuracyPct ?? 0) >= 75)
    .slice(0, 3)
    .map((c) => `${c.category} (${c.accuracyPct}% avg accuracy · ${c.learningIndicator})`);

  const practiceRecommendations: string[] = [];
  const unpractised = categorySummaries.filter((c) => c.attempts === 0);
  if (unpractised.length > 0) {
    const suggestedGames = getCognitiveGamesCatalog()
      .filter((g) => g.category === unpractised[0].category)
      .slice(0, 2)
      .map((g) => g.title);
    practiceRecommendations.push(
      `Explore ${unpractised[0].category} (${suggestedGames.join(' or ')}) for balanced practice`,
    );
  }
  const lowerAvg = practicedCategories.find((c) => (c.accuracyPct ?? 100) < 75);
  if (lowerAvg) {
    const sample = getCognitiveGamesCatalog().find((g) => g.category === lowerAvg.category);
    practiceRecommendations.push(
      `Gentle practice in ${lowerAvg.category}${sample ? ` (${sample.title})` : ''} at a comfortable pace`,
    );
  }
  if (practiceRecommendations.length === 0) {
    practiceRecommendations.push(
      'Continue balanced 10-minute sessions across Daily Cognitive Challenge and Memory Training',
    );
  }

  return {
    studentId,
    totalAttempts,
    gamesExploredCount,
    overallAccuracyPct,
    avgCompletionTimeSec,
    avgReactionTimeMs,
    totalErrors,
    highestLevelCompleted,
    improvementDeltaPct,
    practiceConsistencyDays,
    dailyChallengeCompleted,
    weeklyMemoryCompleted,
    earnedBadges,
    categorySummaries,
    strengths,
    practiceRecommendations,
    advisoryNotice:
      'Practice-performance indicators only — cognitive game scores never directly alter OLQ scores or Learners Score.',
  };
}

export function formatGameTitle(gameId: string): string {
  return getCognitiveGameById(gameId)?.title ?? gameId;
}
