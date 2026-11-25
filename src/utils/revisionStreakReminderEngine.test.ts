import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRevisionStreakStatus,
  DEFAULT_REMINDER_PREFS,
  evaluateRevisionStreakReminder,
  toLocalDateKey,
  dateKeyDaysAgo,
} from './revisionStreakReminderEngine.ts';

describe('Revision Streak Reminder Engine', () => {
  const fixedNow = new Date(2026, 10, 24, 16, 0, 0); // 2026-11-24 16:00 local
  const today = toLocalDateKey(fixedNow);
  const yesterday = dateKeyDaysAgo(fixedNow, 1);
  const twoDaysAgo = dateKeyDaysAgo(fixedNow, 2);
  const threeDaysAgo = dateKeyDaysAgo(fixedNow, 3);

  it('marks habit as completed_today and suppresses automatic reminder when student revised today', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [
        `${twoDaysAgo}T17:00:00`,
        `${yesterday}T18:00:00`,
        `${today}T10:30:00`,
      ],
      now: fixedNow,
    });

    assert.equal(status.completedToday, true);
    assert.equal(status.currentStreakDays, 3);
    assert.equal(status.habitState, 'completed_today');

    const evaluation = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: DEFAULT_REMINDER_PREFS,
      now: fixedNow,
    });

    assert.equal(evaluation.shouldShow, false);
    assert.equal(evaluation.reason, 'completed_today');
  });

  it('detects streak_at_risk when student studied yesterday but not today and prompts reminder', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [`${threeDaysAgo}T15:00:00`, `${twoDaysAgo}T16:00:00`, `${yesterday}T19:00:00`],
      hoursSinceLastLogin: 21,
      now: fixedNow,
    });

    assert.equal(status.completedToday, false);
    assert.equal(status.currentStreakDays, 3);
    assert.equal(status.habitState, 'streak_at_risk');

    const evaluation = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: DEFAULT_REMINDER_PREFS,
      now: fixedNow,
    });

    assert.equal(evaluation.shouldShow, true);
    assert.equal(evaluation.reason, 'prompt_due');
    assert.equal(evaluation.urgency, 'high');
    assert.match(evaluation.title, /3-Day Revision Streak/i);
  });

  it('detects inactive_return when student has not revised or logged in for multiple days', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [`${threeDaysAgo}T14:00:00`],
      hoursSinceLastLogin: 72,
      now: fixedNow,
    });

    assert.equal(status.completedToday, false);
    assert.equal(status.currentStreakDays, 0);
    assert.equal(status.daysSinceLastActivity, 3);
    assert.equal(status.habitState, 'inactive_return');

    const evaluation = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: DEFAULT_REMINDER_PREFS,
      now: fixedNow,
    });

    assert.equal(evaluation.shouldShow, true);
    assert.equal(evaluation.urgency, 'high');
    assert.match(evaluation.message, /3 days/i);
  });

  it('honors Quick Revise stored streak when lastDay is yesterday', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [],
      quickReviseStreak: 5,
      quickReviseLastDay: yesterday,
      quickReviseXp: 420,
      now: fixedNow,
    });

    assert.equal(status.currentStreakDays, 5);
    assert.equal(status.completedToday, false);
    assert.equal(status.habitState, 'streak_at_risk');
  });

  it('suppresses reminder for staff roles, snoozed state, dismissed today, and disabled preferences', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [`${yesterday}T18:00:00`],
      hoursSinceLastLogin: 24,
      now: fixedNow,
    });

    const teacherEval = evaluateRevisionStreakReminder({
      role: 'teacher',
      status,
      prefs: DEFAULT_REMINDER_PREFS,
      now: fixedNow,
    });
    assert.equal(teacherEval.shouldShow, false);
    assert.equal(teacherEval.reason, 'role_not_eligible');

    const disabledEval = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: { ...DEFAULT_REMINDER_PREFS, enabled: false },
      now: fixedNow,
    });
    assert.equal(disabledEval.shouldShow, false);
    assert.equal(disabledEval.reason, 'disabled_by_user');

    const snoozedEval = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: {
        ...DEFAULT_REMINDER_PREFS,
        snoozeUntilIso: new Date(fixedNow.getTime() + 2 * 3_600_000).toISOString(),
      },
      now: fixedNow,
    });
    assert.equal(snoozedEval.shouldShow, false);
    assert.equal(snoozedEval.reason, 'snoozed');

    const dismissedEval = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: { ...DEFAULT_REMINDER_PREFS, dismissedDate: today },
      now: fixedNow,
    });
    assert.equal(dismissedEval.shouldShow, false);
    assert.equal(dismissedEval.reason, 'dismissed_today');
  });

  it('allows on-demand preview toast even when already completed today or snoozed', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [`${today}T09:00:00`],
      now: fixedNow,
    });

    const previewEval = evaluateRevisionStreakReminder({
      role: 'student',
      status,
      prefs: { ...DEFAULT_REMINDER_PREFS, dismissedDate: today },
      now: fixedNow,
      forcePreview: true,
    });

    assert.equal(previewEval.shouldShow, true);
    assert.equal(previewEval.reason, 'prompt_due');
  });

  it('tailors gentle parent reminder copy using child learner name', () => {
    const status = computeRevisionStreakStatus({
      activityTimestamps: [`${yesterday}T18:00:00`],
      hoursSinceLastLogin: 22,
      now: fixedNow,
    });

    const parentEval = evaluateRevisionStreakReminder({
      role: 'parent',
      learnerName: 'Aarav Sharma',
      status,
      prefs: DEFAULT_REMINDER_PREFS,
      now: fixedNow,
    });

    assert.equal(parentEval.shouldShow, true);
    assert.match(parentEval.title, /Aarav Sharma/);
  });
});
