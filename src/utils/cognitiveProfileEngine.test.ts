import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCognitiveGamesCatalog,
  registerCognitiveGame,
} from './cognitiveGamesCatalog';
import {
  computeAdaptiveLevel,
  computeStudentCognitiveProfile,
  getAgeBandForClass,
  getBaselineLevelForClass,
  getDailyChallengeGame,
  getWeeklyMemoryGame,
} from './cognitiveProfileEngine';
import { calculateLearnersScore, DEFAULT_LEARNERS_WEIGHTS } from './evidenceEngine';
import type { CognitiveAttemptRecord, DevelopmentEvidence } from '../types';

test('proposed catalogue contains all 29 named games across the 6 cognitive categories', () => {
  const catalog = getCognitiveGamesCatalog();
  assert.equal(catalog.length, 29);
  const numbers = catalog.map((g) => g.catalogNumber);
  for (let i = 1; i <= 29; i++) {
    assert.ok(numbers.includes(i), `Missing game #${i}`);
  }
  const categories = new Set(catalog.map((g) => g.category));
  assert.equal(categories.size, 6);
});

test('age-wise difficulty mapping assigns appropriate baseline levels by class band', () => {
  assert.equal(getBaselineLevelForClass('2-A'), 1);
  assert.equal(getAgeBandForClass('2-A'), 'Classes 1–2');
  assert.equal(getBaselineLevelForClass('4-B'), 2);
  assert.equal(getBaselineLevelForClass('7-A'), 3);
  assert.equal(getBaselineLevelForClass('9-A'), 4);
  assert.equal(getAgeBandForClass('9-A'), 'Classes 9–10');
  assert.equal(getBaselineLevelForClass('12-Science'), 5);
});

test('adaptive difficulty steps up on >=85% clean performance and steps down gently on <55%', () => {
  const baseAttempts: CognitiveAttemptRecord[] = [
    {
      id: 'att-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-1',
      gameId: 'memory-match',
      category: 'Memory Training',
      difficultyLevel: 3,
      accuracyPct: 92,
      completionTimeSec: 28,
      reactionTimeMs: null,
      errorCount: 1,
      scorePoints: 92,
      completed: true,
      playedAt: '2026-11-12T10:00:00Z',
    },
  ];
  assert.equal(computeAdaptiveLevel('7-A', baseAttempts, 'memory-match'), 4);

  const struggled: CognitiveAttemptRecord[] = [
    {
      ...baseAttempts[0],
      id: 'att-2',
      difficultyLevel: 4,
      accuracyPct: 45,
      errorCount: 5,
      playedAt: '2026-11-13T10:00:00Z',
    },
  ];
  assert.equal(computeAdaptiveLevel('9-A', struggled, 'memory-match'), 3);
});

test('student cognitive profile tracks self-referenced improvement and badges without public rankings', () => {
  const attempts: CognitiveAttemptRecord[] = [
    {
      id: 'c1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-9',
      gameId: 'target-finder',
      category: 'Visual Attention',
      difficultyLevel: 3,
      accuracyPct: 72,
      completionTimeSec: 40,
      reactionTimeMs: 720,
      errorCount: 3,
      scorePoints: 72,
      completed: true,
      playedAt: '2026-11-10T09:00:00Z',
    },
    {
      id: 'c2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-9',
      gameId: 'colour-conflict',
      category: 'Response Control',
      difficultyLevel: 4,
      accuracyPct: 94,
      completionTimeSec: 25,
      reactionTimeMs: 540,
      errorCount: 1,
      scorePoints: 94,
      completed: true,
      playedAt: '2026-11-12T09:00:00Z',
    },
    {
      id: 'c3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-9',
      gameId: getDailyChallengeGame('2026-11-14').id,
      category: getDailyChallengeGame('2026-11-14').category,
      difficultyLevel: 4,
      accuracyPct: 90,
      completionTimeSec: 30,
      reactionTimeMs: 600,
      errorCount: 1,
      scorePoints: 90,
      completed: true,
      challengeTag: 'daily',
      playedAt: '2026-11-14T10:00:00Z',
    },
  ];

  const profile = computeStudentCognitiveProfile('stu-9', attempts, '2026-11-14');
  assert.equal(profile.totalAttempts, 3);
  assert.equal(profile.highestLevelCompleted, 4);
  assert.equal(profile.practiceConsistencyDays, 3);
  assert.equal(profile.dailyChallengeCompleted, true);
  assert.ok(profile.improvementDeltaPct !== null && profile.improvementDeltaPct > 0);
  assert.ok(profile.earnedBadges.some((b) => b.id === 'steady-habit'));
  assert.ok(profile.earnedBadges.some((b) => b.id === 'personal-growth'));
  assert.ok(profile.advisoryNotice.includes('never directly alter OLQ scores'));
});

test('cognitive game attempts never alter OLQ scores or Learners Score calculation', () => {
  const classroomEvidence: DevelopmentEvidence[] = [
    {
      id: 'ev-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-1',
      sourceKey: 'nb-1',
      sourceType: 'notebook_check',
      date: '2026-11-10',
      summary: 'Classwork checked',
      olqContributions: { organising_ability: 86, reasoning_ability: 88 },
      componentContributions: { academic: 85, learningHabits: 88 },
      learningSignals: { independentTaskCompletion: 88 },
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
  ];

  const before = calculateLearnersScore(classroomEvidence, DEFAULT_LEARNERS_WEIGHTS);
  // Compute cognitive profile independently
  const profile = computeStudentCognitiveProfile('stu-1', [
    {
      id: 'cg-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-1',
      gameId: 'sudoku-challenge',
      category: 'Logical Thinking',
      difficultyLevel: 4,
      accuracyPct: 100,
      completionTimeSec: 35,
      reactionTimeMs: null,
      errorCount: 0,
      scorePoints: 100,
      completed: true,
      playedAt: '2026-11-14T11:00:00Z',
    },
  ]);
  const after = calculateLearnersScore(classroomEvidence, DEFAULT_LEARNERS_WEIGHTS);

  assert.equal(profile.overallAccuracyPct, 100);
  assert.equal(before.overallScore, after.overallScore);
  assert.equal(before.olqScores.reasoning_ability.score, after.olqScores.reasoning_ability.score);
});

test('extensible registry supports registering new cognitive games without breaking profile math', () => {
  const weekly = getWeeklyMemoryGame('2026-11-14');
  assert.equal(weekly.category, 'Memory Training');

  const updated = registerCognitiveGame({
    id: 'ext-mental-abacus',
    catalogNumber: 30,
    title: 'Mental Abacus Sprint',
    titleHi: 'मानसिक अबेकस',
    category: 'Logical Thinking',
    phase: 'Phase 3 · Adaptive',
    shortDesc: 'Custom registered extension game for mental calculation fluency.',
    instructionsEn: 'Solve mental addition sequences.',
    instructionsHi: 'मानसिक जोड़ श्रृंखला हल करें।',
    develops: ['Numerical fluency'],
    measurements: ['Accuracy'],
    learningIndicators: ['Analysis and problem-solving'],
    potentialOlqRelevance: ['reasoning_ability'],
    supportedLevels: [1, 2, 3, 4, 5],
  });
  assert.equal(updated.length, 30);

  const profile = computeStudentCognitiveProfile('stu-ext', [
    {
      id: 'ext-a1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-ext',
      gameId: 'ext-mental-abacus',
      category: 'Logical Thinking',
      difficultyLevel: 2,
      accuracyPct: 88,
      completionTimeSec: 22,
      reactionTimeMs: null,
      errorCount: 1,
      scorePoints: 88,
      completed: true,
      playedAt: '2026-11-14T12:00:00Z',
    },
  ]);
  assert.equal(profile.totalAttempts, 1);
  assert.equal(profile.overallAccuracyPct, 88);
});
