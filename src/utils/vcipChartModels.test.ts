import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBenchmarkComparisonStats,
  buildVcipChartPoints,
  CLASS_TIER_PLACEHOLDER_BENCHMARKS,
  getBarMetricMeta,
  resolveDefaultChartMode,
  summarizeImprovementOverTime,
  VCIP_TARGET_BENCHMARK,
} from './vcipChartModels';
import { buildDomainSummaries } from './vcipScoringEngine';
import type { VcipAttemptRecord } from '../types/vcip';

function makeAttempt(overrides: Partial<VcipAttemptRecord>): VcipAttemptRecord {
  return {
    id: 'att-1',
    schoolId: 'school-1',
    studentId: 'stu-1',
    studentName: 'Abhiraj',
    classSection: '6-A',
    classLevel: 6,
    domain: 'fluid_reasoning',
    mode: 'timed',
    language: 'en',
    assessedAt: '2026-11-18T10:00:00.000Z',
    totalQuestions: 10,
    correctAnswers: 8,
    incorrectAnswers: 2,
    skippedQuestions: 0,
    accuracyPct: 80,
    avgResponseTimeMs: 12000,
    totalDurationSec: 120,
    difficultyLevel: 3,
    rawScore: 8,
    developmentalScore: 82,
    completionStatus: 'completed',
    scoringRuleVersion: 'vcip-dev-v1.0',
    ...overrides,
  };
}

test('buildVcipChartPoints outputs 6 domains with 3-cycle Baseline/Prior/Latest progression and benchmarks', () => {
  const emptySummaries = buildDomainSummaries([]);
  assert.equal(resolveDefaultChartMode(emptySummaries), 'sample');

  const samplePoints = buildVcipChartPoints(emptySummaries, 'sample', 'middle_6_8', []);
  assert.equal(samplePoints.length, 6);
  assert.deepEqual(
    samplePoints.map((p) => p.axisLabel),
    ['Fluid', 'Memory', 'Speed', 'Verbal', 'Quantitative', 'Spatial'],
  );
  for (const pt of samplePoints) {
    assert.equal(pt.isPlaceholder, true);
    assert.equal(pt.target, VCIP_TARGET_BENCHMARK);
    assert.equal(pt.classBenchmark, CLASS_TIER_PLACEHOLDER_BENCHMARKS.middle_6_8[pt.domain]);
    assert.equal(pt.deltaVsBenchmark, pt.current - pt.classBenchmark);
    assert.equal(pt.deltaVsBaseline, pt.current - pt.baseline);
    assert.ok(pt.baseline < pt.prior && pt.prior < pt.current);
  }

  const improvementSummary = summarizeImprovementOverTime(samplePoints);
  assert.equal(improvementSummary.domainsImproved, 6);
  assert.equal(improvementSummary.strongestGainDomain, 'Fluid');
  assert.equal(improvementSummary.strongestGainPts, 16);

  const benchmarkStats = buildBenchmarkComparisonStats(samplePoints, 'benchmark');
  assert.equal(benchmarkStats.totalDomains, 6);
  assert.equal(benchmarkStats.domainsAtOrAbove, 6);
});

test('buildVcipChartPoints maps multi-session live attempts into Baseline, Prior, and Latest accurately', () => {
  const attempts: VcipAttemptRecord[] = [
    makeAttempt({
      id: 'att-f0',
      domain: 'fluid_reasoning',
      assessedAt: '2026-09-15T10:00:00.000Z',
      developmentalScore: 64,
      accuracyPct: 65,
      avgResponseTimeMs: 17000,
    }),
    makeAttempt({
      id: 'att-f1',
      domain: 'fluid_reasoning',
      assessedAt: '2026-10-20T10:00:00.000Z',
      developmentalScore: 72,
      accuracyPct: 74,
      avgResponseTimeMs: 14500,
    }),
    makeAttempt({
      id: 'att-f2',
      domain: 'fluid_reasoning',
      assessedAt: '2026-11-19T10:00:00.000Z',
      developmentalScore: 86,
      accuracyPct: 88,
      avgResponseTimeMs: 11500,
    }),
    makeAttempt({
      id: 'att-sp1',
      domain: 'spatial_reasoning',
      assessedAt: '2026-11-19T11:00:00.000Z',
      developmentalScore: 79,
      accuracyPct: 80,
      avgResponseTimeMs: 17200,
    }),
  ];

  const summaries = buildDomainSummaries(attempts);
  assert.equal(resolveDefaultChartMode(summaries), 'live');

  const livePoints = buildVcipChartPoints(summaries, 'live', 'senior_11_12', attempts);
  const fluid = livePoints.find((p) => p.axisLabel === 'Fluid')!;
  const memory = livePoints.find((p) => p.axisLabel === 'Memory')!;
  const spatial = livePoints.find((p) => p.axisLabel === 'Spatial')!;

  assert.equal(fluid.baseline, 64);
  assert.equal(fluid.prior, 72);
  assert.equal(fluid.current, 86);
  assert.equal(fluid.deltaVsBaseline, 22);
  assert.equal(fluid.deltaVsPrior, 14);
  assert.equal(fluid.classBenchmark, 80);
  assert.equal(fluid.avgTimeSec, 11.5);
  assert.equal(fluid.isPlaceholder, false);

  assert.equal(memory.current, 0);
  assert.equal(memory.isPlaceholder, true);

  assert.equal(spatial.baseline, 79);
  assert.equal(spatial.current, 79);
  assert.equal(spatial.deltaVsBaseline, 0);

  const growth = summarizeImprovementOverTime(livePoints);
  assert.equal(growth.domainsImproved, 1);
  assert.equal(growth.strongestGainDomain, 'Fluid');
  assert.equal(growth.strongestGainPts, 22);

  assert.equal(getBarMetricMeta('score').dataKey, 'current');
  assert.equal(getBarMetricMeta('accuracy').dataKey, 'accuracyPct');
  assert.equal(getBarMetricMeta('speed').dataKey, 'avgTimeSec');
});
