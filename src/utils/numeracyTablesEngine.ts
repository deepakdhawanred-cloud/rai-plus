import type { ClassAssessmentTier, NumeracyTableBreakdownItem } from '../types';
import { resolveClassTierFromSection } from './readingAssessmentEngine.ts';

export interface NumeracyTierConfig {
  tier: ClassAssessmentTier;
  label: string;
  minTable: number;
  maxTable: number;
  minMultiplier: number;
  maxMultiplier: number;
  defaultQuestionCount: number;
  defaultTimeLimitSeconds: number;
  targetPaceMs: number;
}

export interface JumbledTableQuestion {
  index: number;
  tableBase: number;
  multiplier: number;
  product: number;
  promptKind: 'product' | 'missing_factor';
  promptText: string;
  expectedAnswer: number;
}

export interface JumbledTableResponse {
  questionIndex: number;
  userAnswer: number | null;
  responseTimeMs: number;
}

export interface NumeracyTablesEvaluation {
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  accuracyPct: number;
  avgResponseMs: number;
  questionsPerMinute: number;
  speedScorePct: number;
  tablesFluencyPct: number;
  weakTables: number[];
  tableBreakdown: NumeracyTableBreakdownItem[];
  conceptualGap?: string;
}

export const NUMERACY_TIER_CONFIGS: Record<ClassAssessmentTier, NumeracyTierConfig> = {
  class_1_2: {
    tier: 'class_1_2',
    label: 'Classes 1–2 · Tables 2 to 5',
    minTable: 2,
    maxTable: 5,
    minMultiplier: 1,
    maxMultiplier: 10,
    defaultQuestionCount: 12,
    defaultTimeLimitSeconds: 75,
    targetPaceMs: 5000,
  },
  class_3_5: {
    tier: 'class_3_5',
    label: 'Classes 3–5 · Tables 2 to 12',
    minTable: 2,
    maxTable: 12,
    minMultiplier: 2,
    maxMultiplier: 10,
    defaultQuestionCount: 15,
    defaultTimeLimitSeconds: 60,
    targetPaceMs: 3800,
  },
  class_6_8: {
    tier: 'class_6_8',
    label: 'Classes 6–8 · Tables 6 to 16',
    minTable: 6,
    maxTable: 16,
    minMultiplier: 2,
    maxMultiplier: 12,
    defaultQuestionCount: 20,
    defaultTimeLimitSeconds: 60,
    targetPaceMs: 3000,
  },
  class_9_10: {
    tier: 'class_9_10',
    label: 'Classes 9–10 · Tables 11 to 20',
    minTable: 11,
    maxTable: 20,
    minMultiplier: 3,
    maxMultiplier: 12,
    defaultQuestionCount: 20,
    defaultTimeLimitSeconds: 60,
    targetPaceMs: 2800,
  },
  class_11_12: {
    tier: 'class_11_12',
    label: 'Classes 11–12 · Tables 12 to 25',
    minTable: 12,
    maxTable: 25,
    minMultiplier: 3,
    maxMultiplier: 12,
    defaultQuestionCount: 24,
    defaultTimeLimitSeconds: 60,
    targetPaceMs: 2500,
  },
};

export function getNumeracyTierConfig(classSection?: string): NumeracyTierConfig {
  const tier = resolveClassTierFromSection(classSection);
  return NUMERACY_TIER_CONFIGS[tier];
}

function createPrng(seed?: number): () => number {
  if (seed === undefined) return () => Math.random();
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Generates an anti-sequential jumbled multiplication table quiz:
 * - Never emits two consecutive questions from the same base table (unless only 1 table requested)
 * - Avoids duplicate (table, multiplier) pairs inside the set
 * - Optionally restricts or focuses on weak tables for targeted drill
 */
export function generateJumbledTableQuestions(params: {
  minTable: number;
  maxTable: number;
  minMultiplier?: number;
  maxMultiplier?: number;
  count: number;
  questionMode?: 'standard' | 'mixed_missing_factor';
  focusTables?: number[];
  seed?: number;
}): JumbledTableQuestion[] {
  const {
    minTable,
    maxTable,
    minMultiplier = 2,
    maxMultiplier = 10,
    count,
    questionMode = 'standard',
    focusTables,
    seed,
  } = params;

  const rand = createPrng(seed);
  const candidateTables =
    focusTables && focusTables.length > 0
      ? focusTables.filter((t) => t >= 2 && t <= 30)
      : Array.from({ length: Math.max(1, maxTable - minTable + 1) }, (_, idx) => minTable + idx);

  const pool: Array<{ tableBase: number; multiplier: number }> = [];
  for (const t of candidateTables) {
    for (let m = minMultiplier; m <= maxMultiplier; m++) {
      pool.push({ tableBase: t, multiplier: m });
    }
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Reorder to enforce anti-sequential rule: no adjacent items share tableBase when possible
  const selected: Array<{ tableBase: number; multiplier: number }> = [];
  const remaining = [...pool];

  while (selected.length < count && remaining.length > 0) {
    const lastTable = selected.length > 0 ? selected[selected.length - 1].tableBase : -1;
    let pickIdx = remaining.findIndex((item) => item.tableBase !== lastTable);
    if (pickIdx === -1) pickIdx = 0;
    selected.push(remaining.splice(pickIdx, 1)[0]);
  }

  // If count exceeds unique pool size, wrap cleanly while preserving anti-sequential gap
  while (selected.length < count && pool.length > 0) {
    const lastTable = selected[selected.length - 1].tableBase;
    const alt = pool.find((item) => item.tableBase !== lastTable) || pool[0];
    selected.push(alt);
  }

  return selected.map((pair, index) => {
    const product = pair.tableBase * pair.multiplier;
    const useMissingFactor = questionMode === 'mixed_missing_factor' && index % 3 === 2;
    return {
      index,
      tableBase: pair.tableBase,
      multiplier: pair.multiplier,
      product,
      promptKind: useMissingFactor ? 'missing_factor' : 'product',
      promptText: useMissingFactor
        ? `${pair.tableBase} × ? = ${product}`
        : `${pair.tableBase} × ${pair.multiplier} = ?`,
      expectedAnswer: useMissingFactor ? pair.multiplier : product,
    };
  });
}

export function evaluateNumeracyTablesAttempt(params: {
  questions: JumbledTableQuestion[];
  responses: JumbledTableResponse[];
  timeLimitSeconds: number;
  elapsedSeconds: number;
  targetPaceMs: number;
}): NumeracyTablesEvaluation {
  const { questions, responses, elapsedSeconds, targetPaceMs } = params;
  const responseMap = new Map<number, JumbledTableResponse>();
  for (const r of responses) {
    responseMap.set(r.questionIndex, r);
  }

  let attemptedCount = 0;
  let correctCount = 0;
  let totalResponseMs = 0;

  const perTableMap = new Map<
    number,
    { attempted: number; correct: number; totalMs: number }
  >();

  for (const q of questions) {
    const resp = responseMap.get(q.index);
    const entry = perTableMap.get(q.tableBase) || {
      attempted: 0,
      correct: 0,
      totalMs: 0,
    };

    if (resp && resp.userAnswer !== null && !Number.isNaN(resp.userAnswer)) {
      attemptedCount += 1;
      entry.attempted += 1;
      entry.totalMs += Math.max(200, resp.responseTimeMs);
      totalResponseMs += Math.max(200, resp.responseTimeMs);
      if (resp.userAnswer === q.expectedAnswer) {
        correctCount += 1;
        entry.correct += 1;
      }
    }
    perTableMap.set(q.tableBase, entry);
  }

  const totalQuestions = questions.length;
  const accuracyPct =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgResponseMs =
    attemptedCount > 0 ? Math.round(totalResponseMs / attemptedCount) : 0;
  const effectiveElapsedSec = Math.max(1, elapsedSeconds);
  const questionsPerMinute = Number(
    ((correctCount / effectiveElapsedSec) * 60).toFixed(1),
  );

  let speedScorePct = 0;
  if (attemptedCount > 0 && avgResponseMs > 0) {
    const rawPaceRatio = targetPaceMs / Math.max(avgResponseMs, targetPaceMs * 0.5);
    const completionRatio = Math.min(1, attemptedCount / Math.max(1, totalQuestions));
    speedScorePct = Math.max(
      15,
      Math.min(100, Math.round(Math.min(1, rawPaceRatio) * 85 * completionRatio + 15 * completionRatio)),
    );
  }

  const tablesFluencyPct = Math.max(
    0,
    Math.min(100, Math.round(accuracyPct * 0.65 + speedScorePct * 0.35)),
  );

  const tableBreakdown: NumeracyTableBreakdownItem[] = Array.from(perTableMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tableBase, stats]) => ({
      tableBase,
      attempted: stats.attempted,
      correct: stats.correct,
      accuracyPct:
        stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
      avgResponseMs:
        stats.attempted > 0 ? Math.round(stats.totalMs / stats.attempted) : 0,
    }));

  const weakTables = tableBreakdown
    .filter(
      (item) =>
        item.attempted > 0 &&
        (item.accuracyPct < 80 || item.avgResponseMs > targetPaceMs * 1.45),
    )
    .map((item) => item.tableBase);

  let conceptualGap: string | undefined;
  if (weakTables.length > 0) {
    conceptualGap = `Needs speed/accuracy drill on tables: ${weakTables.map((t) => `${t}×`).join(', ')}`;
  } else if (attemptedCount < totalQuestions) {
    conceptualGap = `Timed sprint incomplete (${attemptedCount}/${totalQuestions} answered within time bound)`;
  }

  return {
    totalQuestions,
    attemptedCount,
    correctCount,
    accuracyPct,
    avgResponseMs,
    questionsPerMinute,
    speedScorePct,
    tablesFluencyPct,
    weakTables,
    tableBreakdown,
    conceptualGap,
  };
}
