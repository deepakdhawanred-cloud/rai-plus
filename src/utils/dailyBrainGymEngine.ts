import type {
  VcipBrainGymLog,
  VcipDomainId,
  VcipFluidQuestion,
  VcipLanguage,
  VcipMemoryTrial,
  VcipSpatialQuestion,
  VcipTextChoiceQuestion,
} from '../types/vcip';
import {
  createSeededRng,
  generateFluidReasoningQuestions,
  generateQuantitativeReasoningQuestions,
  generateSpatialReasoningQuestions,
  generateVerbalReasoningQuestions,
  generateWorkingMemoryTrials,
} from './vcipQuestionBank.ts';
import { computeBrainGymStreak } from './vcipScoringEngine.ts';

export type DailyBrainGymDomainId =
  | 'fluid_reasoning'
  | 'working_memory'
  | 'quantitative_reasoning'
  | 'verbal_reasoning'
  | 'spatial_reasoning';

export interface DailyBrainGymExerciseMeta {
  index: number;
  domain: DailyBrainGymDomainId;
  shortTitle: string;
  domainLabel: string;
  estimatedSec: number;
}

export const DAILY_BRAIN_GYM_DOMAINS: DailyBrainGymExerciseMeta[] = [
  {
    index: 0,
    domain: 'fluid_reasoning',
    shortTitle: 'Visual Pattern',
    domainLabel: 'Fluid Reasoning',
    estimatedSec: 60,
  },
  {
    index: 1,
    domain: 'working_memory',
    shortTitle: 'Memory Recall',
    domainLabel: 'Working Memory',
    estimatedSec: 60,
  },
  {
    index: 2,
    domain: 'quantitative_reasoning',
    shortTitle: 'Number Logic',
    domainLabel: 'Quantitative',
    estimatedSec: 75,
  },
  {
    index: 3,
    domain: 'verbal_reasoning',
    shortTitle: 'Verbal Logic',
    domainLabel: 'Verbal Thinking',
    estimatedSec: 60,
  },
  {
    index: 4,
    domain: 'spatial_reasoning',
    shortTitle: 'Mental Rotation',
    domainLabel: 'Spatial Reasoning',
    estimatedSec: 75,
  },
];

export interface DailyBrainGymSelection {
  dateKey: string;
  classLevel: number;
  language: VcipLanguage;
  fluid: VcipFluidQuestion;
  memory: VcipMemoryTrial;
  quantitative: VcipTextChoiceQuestion;
  verbal: VcipTextChoiceQuestion;
  spatial: VcipSpatialQuestion;
}

/**
 * Generates a deterministic daily selection of exactly 5 quick exercises—
 * one per core Daily Brain Gym domain—rotating cleanly by dateKey.
 */
export function buildDailyBrainGymSelection(params: {
  classLevel: number;
  studentId: string;
  dateKey: string;
  language?: VcipLanguage;
  variantNonce?: string;
}): DailyBrainGymSelection {
  const lang: VcipLanguage = params.language === 'hi' ? 'hi' : 'en';
  const seed = `daily-gym-${params.dateKey}-${params.studentId}-${params.variantNonce || 'base'}`;
  const rng = createSeededRng(seed);

  const fluidPool = generateFluidReasoningQuestions(params.classLevel, seed);
  const memPool = generateWorkingMemoryTrials(params.classLevel, seed).filter(
    (t) => t.subtask === 'digit_forward' || t.subtask === 'digit_backward' || t.subtask === 'sequence_recall',
  );
  const quantPool = generateQuantitativeReasoningQuestions(params.classLevel);
  const verbalPool = generateVerbalReasoningQuestions(params.classLevel, lang);
  const spatialPool = generateSpatialReasoningQuestions(params.classLevel, seed);

  const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)] ?? arr[0];

  return {
    dateKey: params.dateKey,
    classLevel: params.classLevel,
    language: lang,
    fluid: pick(fluidPool),
    memory: pick(memPool),
    quantitative: pick(quantPool),
    verbal: pick(verbalPool),
    spatial: pick(spatialPool),
  };
}

export interface DailyBrainGymProgressSummary {
  completedToday: boolean;
  todayLog: VcipBrainGymLog | null;
  currentStreak: number;
  daysLast7: number;
  totalDays: number;
  totalPuzzlesSolved: number;
  practiceAccuracyPct: number;
  milestoneLabel: string;
}

export function summarizeDailyBrainGymProgress(
  logs: VcipBrainGymLog[],
  todayDateKey: string,
): DailyBrainGymProgressSummary {
  const streak = computeBrainGymStreak(logs);
  const todayLog = logs.find((l) => l.dateKey === todayDateKey) || null;

  const todayMs = new Date(`${todayDateKey}T00:00:00Z`).getTime();
  const uniqueRecent = new Set(
    logs
      .filter((l) => {
        const ms = new Date(`${l.dateKey}T00:00:00Z`).getTime();
        const diff = Math.round((todayMs - ms) / (24 * 60 * 60 * 1000));
        return diff >= 0 && diff < 7;
      })
      .map((l) => l.dateKey),
  );

  let milestoneLabel = 'Starter Circuit';
  if (streak.currentStreak >= 14) {
    milestoneLabel = '14-Day Focus Habit';
  } else if (streak.currentStreak >= 7) {
    milestoneLabel = '7-Day Weekly Streak';
  } else if (streak.currentStreak >= 3) {
    milestoneLabel = '3-Day Momentum';
  } else if (streak.totalDays >= 1) {
    milestoneLabel = 'Building Daily Rhythm';
  }

  return {
    completedToday: Boolean(todayLog),
    todayLog,
    currentStreak: streak.currentStreak,
    daysLast7: uniqueRecent.size,
    totalDays: streak.totalDays,
    totalPuzzlesSolved: streak.totalPuzzlesSolved,
    practiceAccuracyPct: streak.accuracyPct,
    milestoneLabel,
  };
}

export function getDailyBrainGymDomainList(): VcipDomainId[] {
  return DAILY_BRAIN_GYM_DOMAINS.map((d) => d.domain);
}
