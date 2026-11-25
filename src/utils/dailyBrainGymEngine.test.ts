import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_BRAIN_GYM_DOMAINS,
  buildDailyBrainGymSelection,
  getDailyBrainGymDomainList,
  summarizeDailyBrainGymProgress,
} from './dailyBrainGymEngine';
import type { VcipBrainGymLog } from '../types/vcip';

test('buildDailyBrainGymSelection returns 5 valid exercises covering all 5 core domains', () => {
  assert.equal(DAILY_BRAIN_GYM_DOMAINS.length, 5);
  assert.deepEqual(getDailyBrainGymDomainList(), [
    'fluid_reasoning',
    'working_memory',
    'quantitative_reasoning',
    'verbal_reasoning',
    'spatial_reasoning',
  ]);

  const day1 = buildDailyBrainGymSelection({
    classLevel: 6,
    studentId: 'stu-1',
    dateKey: '2026-11-20',
    language: 'en',
  });
  const day1Repeat = buildDailyBrainGymSelection({
    classLevel: 6,
    studentId: 'stu-1',
    dateKey: '2026-11-20',
    language: 'en',
  });
  const day2Hi = buildDailyBrainGymSelection({
    classLevel: 10,
    studentId: 'stu-1',
    dateKey: '2026-11-21',
    language: 'hi',
  });

  // Deterministic for same date
  assert.equal(day1.fluid.id, day1Repeat.fluid.id);
  assert.equal(day1.quantitative.id, day1Repeat.quantitative.id);
  assert.equal(day1.verbal.language, 'en');
  assert.equal(day2Hi.verbal.language, 'hi');

  // All 5 items structurally valid
  assert.equal(day1.fluid.grid.length, 9);
  assert.equal(day1.fluid.options.length, 6);
  assert.ok(day1.memory.sequence.length >= 3);
  assert.ok(day1.quantitative.options.length >= 4);
  assert.ok(day1.verbal.options.length >= 4);
  assert.ok(day1.spatial.options.length >= 4);
});

test('summarizeDailyBrainGymProgress computes today status, 7-day cadence, streak, and milestone cleanly', () => {
  const logs: VcipBrainGymLog[] = [
    {
      id: 'bg-3',
      schoolId: 'sch-1',
      studentId: 'stu-1',
      dateKey: '2026-11-20',
      completedChallenges: getDailyBrainGymDomainList(),
      correctCount: 5,
      totalCount: 5,
      durationSec: 280,
      completedAt: '2026-11-20T08:00:00.000Z',
    },
    {
      id: 'bg-2',
      schoolId: 'sch-1',
      studentId: 'stu-1',
      dateKey: '2026-11-19',
      completedChallenges: getDailyBrainGymDomainList(),
      correctCount: 4,
      totalCount: 5,
      durationSec: 310,
      completedAt: '2026-11-19T08:00:00.000Z',
    },
    {
      id: 'bg-1',
      schoolId: 'sch-1',
      studentId: 'stu-1',
      dateKey: '2026-11-18',
      completedChallenges: getDailyBrainGymDomainList(),
      correctCount: 4,
      totalCount: 5,
      durationSec: 300,
      completedAt: '2026-11-18T08:00:00.000Z',
    },
  ];

  const summary = summarizeDailyBrainGymProgress(logs, '2026-11-20');
  assert.equal(summary.completedToday, true);
  assert.equal(summary.currentStreak, 3);
  assert.equal(summary.daysLast7, 3);
  assert.equal(summary.totalPuzzlesSolved, 15);
  assert.equal(summary.practiceAccuracyPct, 87);
  assert.equal(summary.milestoneLabel, '3-Day Momentum');
});
