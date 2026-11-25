import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_VCIP_DOMAINS,
  VCIP_SYMBOL_KEY,
  generateFluidReasoningQuestions,
  generateProcessingSpeedStream,
  generateQuantitativeReasoningQuestions,
  generateSpatialReasoningQuestions,
  generateVerbalReasoningQuestions,
  generateWorkingMemoryTrials,
} from './vcipQuestionBank';
import {
  VCIP_DISCLAIMER_TEXT,
  buildCareerExplorationIndicators,
  buildDomainSummaries,
  buildDownloadableCognitiveReportHtml,
  computeBrainGymStreak,
  computeLanguagePerformanceSplit,
  computeVcipDomainScore,
} from './vcipScoringEngine';
import type { VcipAttemptRecord, VcipBrainGymLog } from '../types/vcip';

test('all 6 original VCIP generators produce valid items across class levels and EN/HI languages', () => {
  assert.equal(ALL_VCIP_DOMAINS.length, 6);

  for (const cls of [5, 6, 9, 12]) {
    const fluid = generateFluidReasoningQuestions(cls, 'test-seed');
    assert.equal(fluid.length, 6);
    for (const q of fluid) {
      assert.equal(q.grid.length, 9);
      assert.equal(q.grid[8], null);
      assert.equal(q.options.length, 6);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
    }

    const mem = generateWorkingMemoryTrials(cls, 'test-seed');
    assert.equal(mem.length, 6);
    assert.ok(mem.some((t) => t.subtask === 'digit_forward'));
    assert.ok(mem.some((t) => t.subtask === 'digit_backward'));
    assert.ok(mem.some((t) => t.subtask === 'visual_tiles'));
    assert.ok(mem.some((t) => t.subtask === 'sequence_recall'));

    const verbalEn = generateVerbalReasoningQuestions(cls, 'en');
    const verbalHi = generateVerbalReasoningQuestions(cls, 'hi');
    assert.equal(verbalEn.length, 6);
    assert.equal(verbalHi.length, 6);
    assert.ok(verbalEn.every((q) => q.language === 'en' && q.correctIndex >= 0 && q.correctIndex < q.options.length));
    assert.ok(verbalHi.every((q) => q.language === 'hi' && q.correctIndex >= 0 && q.correctIndex < q.options.length));

    const quant = generateQuantitativeReasoningQuestions(cls);
    assert.equal(quant.length, 6);
    assert.ok(quant.every((q) => q.correctIndex >= 0 && q.correctIndex < q.options.length));

    const spatial = generateSpatialReasoningQuestions(cls, 'test-seed');
    assert.equal(spatial.length, 6);
    assert.ok(spatial.some((q) => q.category === 'rotation_2d'));
    assert.ok(spatial.some((q) => q.category === 'isometric_3d'));
    assert.ok(spatial.some((q) => q.category === 'cube_net'));
    assert.ok(spatial.some((q) => q.category === 'shape_assembly'));
  }

  const speedStream = generateProcessingSpeedStream(30, 'test-seed');
  assert.equal(speedStream.length, 30);
  assert.equal(VCIP_SYMBOL_KEY.length, 9);
  for (const item of speedStream) {
    const key = VCIP_SYMBOL_KEY.find((k) => k.symbolId === item.symbolId);
    assert.ok(key);
    assert.equal(key.digit, item.correctDigit);
  }
});

test('scoring engine is deterministic, balances speed & accuracy, and never computes IQ', () => {
  const highAccSlow = computeVcipDomainScore({
    domain: 'processing_speed',
    mode: 'timed',
    totalQuestions: 20,
    correctAnswers: 14,
    incorrectAnswers: 1,
    skippedQuestions: 5,
    totalDurationSec: 45,
    avgResponseTimeMs: 3000,
    difficultyLevel: 2,
  });
  const fastLowAcc = computeVcipDomainScore({
    domain: 'processing_speed',
    mode: 'timed',
    totalQuestions: 25,
    correctAnswers: 12,
    incorrectAnswers: 13,
    skippedQuestions: 0,
    totalDurationSec: 45,
    avgResponseTimeMs: 1800,
    difficultyLevel: 2,
  });

  assert.ok(highAccSlow.accuracyPct > fastLowAcc.accuracyPct);
  assert.ok(highAccSlow.developmentalScore > fastLowAcc.developmentalScore);
  assert.ok(highAccSlow.developmentalScore <= 100 && highAccSlow.developmentalScore >= 0);
  assert.ok(!highAccSlow.speedAccuracyLabel.toLowerCase().includes('iq'));
});

test('summaries, EN/HI verbal split, non-exclusionary career indicators, and report export work cleanly', () => {
  const baseAttempt = (overrides: Partial<VcipAttemptRecord>): VcipAttemptRecord => ({
    id: 'att-1',
    schoolId: 'school-1',
    studentId: 'st-1',
    studentName: 'Abhiraj',
    classSection: '6-A',
    classLevel: 6,
    domain: 'fluid_reasoning',
    mode: 'timed',
    language: 'en',
    totalQuestions: 6,
    correctAnswers: 5,
    incorrectAnswers: 1,
    skippedQuestions: 0,
    accuracyPct: 83,
    avgResponseTimeMs: 9200,
    totalDurationSec: 55,
    difficultyLevel: 2,
    rawScore: 5,
    developmentalScore: 82,
    completionStatus: 'completed',
    scoringRuleVersion: 'vcip-dev-v1.0',
    assessedAt: '2026-11-18T10:00:00.000Z',
    ...overrides,
  });

  const attempts: VcipAttemptRecord[] = [
    baseAttempt({ id: 'a1', domain: 'fluid_reasoning', developmentalScore: 70, assessedAt: '2026-10-10T10:00:00.000Z' }),
    baseAttempt({ id: 'a2', domain: 'fluid_reasoning', developmentalScore: 84, assessedAt: '2026-11-15T10:00:00.000Z' }),
    baseAttempt({ id: 'a3', domain: 'verbal_reasoning', language: 'en', developmentalScore: 78, accuracyPct: 80 }),
    baseAttempt({ id: 'a4', domain: 'verbal_reasoning', language: 'hi', developmentalScore: 86, accuracyPct: 88 }),
    baseAttempt({ id: 'a5', domain: 'quantitative_reasoning', developmentalScore: 62, accuracyPct: 67 }),
  ];

  const summaries = buildDomainSummaries(attempts);
  const fluidSummary = summaries.find((s) => s.domain === 'fluid_reasoning')!;
  assert.equal(fluidSummary.latestScore, 84);
  assert.equal(fluidSummary.previousScore, 70);
  assert.equal(fluidSummary.delta, 14);

  const langSplit = computeLanguagePerformanceSplit(attempts);
  assert.equal(langSplit.english.avgScore, 78);
  assert.equal(langSplit.hindi.avgScore, 86);

  const careerIndicators = buildCareerExplorationIndicators(summaries);
  assert.equal(careerIndicators.length, 5);
  assert.ok(careerIndicators.every((c) => c.exploratoryNote.includes('never an eligibility restriction')));

  const html = buildDownloadableCognitiveReportHtml({
    studentName: 'Abhiraj',
    classSection: '6-A',
    schoolName: 'Virat International School',
    summaries,
    attempts,
    careerIndicators,
    counsellorObservations: ['Strong non-verbal visual pattern accuracy; keep practising mental rotation.'],
  });
  assert.ok(html.includes(VCIP_DISCLAIMER_TEXT));
  assert.ok(html.includes('Abhiraj'));
  assert.ok(!html.includes('IQ Score'));
});

test('Daily Brain Gym streak calculates consecutive practice days accurately', () => {
  const logs: VcipBrainGymLog[] = [
    {
      id: 'g1',
      schoolId: 's1',
      studentId: 'st1',
      dateKey: '2026-11-20',
      completedChallenges: ['fluid_reasoning', 'working_memory', 'quantitative_reasoning', 'verbal_reasoning', 'spatial_reasoning'],
      correctCount: 4,
      totalCount: 5,
      durationSec: 340,
      completedAt: '2026-11-20T07:00:00.000Z',
    },
    {
      id: 'g2',
      schoolId: 's1',
      studentId: 'st1',
      dateKey: '2026-11-19',
      completedChallenges: ['fluid_reasoning', 'working_memory', 'quantitative_reasoning', 'verbal_reasoning', 'spatial_reasoning'],
      correctCount: 5,
      totalCount: 5,
      durationSec: 310,
      completedAt: '2026-11-19T07:00:00.000Z',
    },
  ];
  const stats = computeBrainGymStreak(logs);
  assert.equal(stats.totalDays, 2);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.totalPuzzlesSolved, 10);
  assert.equal(stats.accuracyPct, 90);
});
