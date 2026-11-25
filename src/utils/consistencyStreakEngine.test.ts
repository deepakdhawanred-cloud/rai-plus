import test from 'node:test';
import assert from 'node:assert/strict';
import type { NotebookEntry } from '../types';
import {
  computeStudentConsistencyStreak,
  schoolDaysBetween,
} from './consistencyStreakEngine';

function makeNb(
  id: string,
  date: string,
  opts?: Partial<NotebookEntry>,
): NotebookEntry {
  return {
    id,
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    classSection: '6-A',
    subject: 'Mathematics',
    chapter: 'Ch. 1: Numbers',
    date,
    checked: true,
    handwriting: 'Readability',
    workQuality: 'A',
    homeworkDone: true,
    remarks: 'Complete and neat.',
    teacherName: 'Praveen Kumar Kaushik',
    ...opts,
  };
}

test('schoolDaysBetween skips Sunday so Saturday to Monday counts as 1 consecutive school day', () => {
  // 2026-11-14 is Saturday, 2026-11-15 is Sunday, 2026-11-16 is Monday
  assert.equal(schoolDaysBetween('2026-11-14', '2026-11-16'), 1);
  assert.equal(schoolDaysBetween('2026-11-16', '2026-11-17'), 1);
  assert.equal(schoolDaysBetween('2026-11-16', '2026-11-18'), 2);
});

test('computes multi-day consecutive streak across Sunday, awards points & unlocks virtual badges', () => {
  const entries: NotebookEntry[] = [
    makeNb('n1', '2026-11-12', { subject: 'Mathematics' }), // Thu
    makeNb('n2', '2026-11-13', { subject: 'Hindi' }),       // Fri
    makeNb('n3', '2026-11-14', { subject: 'Social Science' }), // Sat
    // Sun 2026-11-15 skipped automatically
    makeNb('n4', '2026-11-16', { subject: 'Science' }),     // Mon
    makeNb('n5', '2026-11-17', { subject: 'English' }),     // Tue
    makeNb('n6', '2026-11-18', { subject: 'Mathematics' }), // Wed
    makeNb('n7', '2026-11-19', { subject: 'Computer' }),    // Thu
  ];

  const summary = computeStudentConsistencyStreak({
    studentId: 'stu-1',
    notebookEntries: entries,
    referenceDate: '2026-11-19',
  });

  assert.equal(summary.currentStreakDays, 7);
  assert.equal(summary.longestStreakDays, 7);
  assert.equal(summary.isStreakActive, true);
  assert.equal(summary.timelyRatePct, 100);
  assert.equal(summary.completeDaysCount, 7);
  assert.equal(summary.incompleteDaysCount, 0);

  // Badges unlocked: First Spark (3d), Weekly Steady (5d), Neatness Vanguard (3+ Grade A), Zero-Gap Champion (5+ complete, 0 incomplete)
  const unlockedIds = summary.badges.filter((b) => b.unlocked).map((b) => b.id);
  assert.deepEqual(unlockedIds, [
    'first_spark',
    'weekly_steady',
    'neatness_vanguard',
    'zero_gap_champion',
  ]);
  assert.equal(summary.nextBadge?.id, 'fortnight_scholar');
  assert.equal(summary.nextBadge?.progressCurrent, 7);
  assert.equal(summary.nextBadge?.progressTarget, 10);

  // Points check:
  // Base: 7 * 20 = 140
  // Streak bonus: 0 + 5 + 10 + 15 + 20 + 25 + 25 = 100
  // Excellence bonus: 7 * 10 = 70
  // Badge bonus: 25 + 50 + 75 + 100 = 250
  assert.equal(summary.points.submissionBasePoints, 140);
  assert.equal(summary.points.streakMultiplierPoints, 100);
  assert.equal(summary.points.excellenceBonusPoints, 70);
  assert.equal(summary.points.badgeRewardPoints, 250);
  assert.equal(summary.points.totalPoints, 560);
  assert.equal(summary.recentTimeline.length, 10);
});

test('incomplete or unchecked notebook breaks active streak while preserving longest streak', () => {
  const entries: NotebookEntry[] = [
    makeNb('n1', '2026-11-12'),
    makeNb('n2', '2026-11-13'),
    makeNb('n3', '2026-11-14'),
    makeNb('n4', '2026-11-16', { homeworkDone: false, workQuality: 'B' }),
  ];

  const summary = computeStudentConsistencyStreak({
    studentId: 'stu-1',
    notebookEntries: entries,
    referenceDate: '2026-11-16',
  });

  assert.equal(summary.currentStreakDays, 0);
  assert.equal(summary.longestStreakDays, 3);
  assert.equal(summary.isStreakActive, false);
  assert.equal(summary.incompleteDaysCount, 1);
  assert.equal(summary.timelyRatePct, 75);
  assert.equal(summary.badges.find((b) => b.id === 'first_spark')?.unlocked, true);
  assert.equal(summary.badges.find((b) => b.id === 'zero_gap_champion')?.unlocked, false);
});

test('empty notebook history returns clean zero state with First Spark as next target', () => {
  const summary = computeStudentConsistencyStreak({
    studentId: 'stu-empty',
    notebookEntries: [],
    referenceDate: '2026-11-19',
  });

  assert.equal(summary.currentStreakDays, 0);
  assert.equal(summary.longestStreakDays, 0);
  assert.equal(summary.points.totalPoints, 0);
  assert.equal(summary.earnedBadgesCount, 0);
  assert.equal(summary.nextBadge?.id, 'first_spark');
  assert.equal(summary.recentTimeline.length, 10);
});
