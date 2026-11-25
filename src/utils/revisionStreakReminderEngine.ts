import type { UserRole } from '../types';
import type { WorkspaceData } from '../types/workspace';

export type RevisionHabitState =
  | 'completed_today'
  | 'streak_at_risk'
  | 'inactive_return'
  | 'start_first_streak';

export type ReminderUrgency = 'high' | 'medium' | 'gentle';

export interface RevisionStreakPrefs {
  enabled: boolean;
  inactivityThresholdHours: number;
  snoozeUntilIso: string | null;
  dismissedDate: string | null;
}

export interface RevisionLoginGap {
  previousLoginIso: string | null;
  currentLoginIso: string;
  hoursSinceLastLogin: number | null;
}

export interface SuggestedRevisionTask {
  title: string;
  subtitle: string;
  targetTab: 'academics' | 'interactive_learning';
  estimatedMinutes: number;
}

export interface RevisionStreakStatus {
  currentStreakDays: number;
  completedToday: boolean;
  lastActivityIso: string | null;
  lastActivityDate: string | null;
  hoursSinceLastActivity: number | null;
  hoursSinceLastLogin: number | null;
  daysSinceLastActivity: number | null;
  habitState: RevisionHabitState;
  quickReviseXp: number;
  suggestedTask: SuggestedRevisionTask;
}

export interface RevisionStreakReminderEvaluation {
  shouldShow: boolean;
  reason:
    | 'role_not_eligible'
    | 'disabled_by_user'
    | 'completed_today'
    | 'snoozed'
    | 'dismissed_today'
    | 'below_inactivity_threshold'
    | 'prompt_due';
  urgency: ReminderUrgency;
  badge: string;
  title: string;
  message: string;
  ctaLabel: string;
  status: RevisionStreakStatus;
}

export const REVISION_STREAK_UPDATED_EVENT = 'raiplus:revision-streak-updated';

export const DEFAULT_REMINDER_PREFS: RevisionStreakPrefs = {
  enabled: true,
  inactivityThresholdHours: 18,
  snoozeUntilIso: null,
  dismissedDate: null,
};

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateKeyDaysAgo(now: Date, daysAgo: number): string {
  const copy = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  return toLocalDateKey(copy);
}

function parseDateKey(value: string): string | null {
  if (!value || typeof value !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDateKey(parsed);
}

function diffCalendarDays(earlierDateKey: string, laterDateKey: string): number {
  const [ey, em, ed] = earlierDateKey.split('-').map(Number);
  const [ly, lm, ld] = laterDateKey.split('-').map(Number);
  const earlierUtc = Date.UTC(ey, em - 1, ed);
  const laterUtc = Date.UTC(ly, lm - 1, ld);
  return Math.max(0, Math.round((laterUtc - earlierUtc) / 86_400_000));
}

export interface ComputeStreakInput {
  activityTimestamps: string[];
  quickReviseStreak?: number;
  quickReviseLastDay?: string | null;
  quickReviseXp?: number;
  hoursSinceLastLogin?: number | null;
  suggestedTask?: SuggestedRevisionTask;
  now?: Date;
}

/**
 * Pure computation of a student's daily Revision Streak state across all study surfaces.
 */
export function computeRevisionStreakStatus(input: ComputeStreakInput): RevisionStreakStatus {
  const now = input.now ?? new Date();
  const todayKey = toLocalDateKey(now);
  const yesterdayKey = dateKeyDaysAgo(now, 1);

  const activeDateKeys = new Set<string>();
  let latestActivityMs: number | null = null;
  let latestActivityIso: string | null = null;

  for (const rawTs of input.activityTimestamps) {
    if (!rawTs) continue;
    const key = parseDateKey(rawTs);
    if (key) activeDateKeys.add(key);
    const ms = Date.parse(rawTs);
    if (!Number.isNaN(ms) && (latestActivityMs === null || ms > latestActivityMs)) {
      latestActivityMs = ms;
      latestActivityIso = new Date(ms).toISOString();
    }
  }

  const qrLastDay = input.quickReviseLastDay ? parseDateKey(input.quickReviseLastDay) : null;
  if (qrLastDay) {
    activeDateKeys.add(qrLastDay);
    if (latestActivityMs === null) {
      const approxMs = Date.parse(`${qrLastDay}T12:00:00`);
      if (!Number.isNaN(approxMs)) {
        latestActivityMs = approxMs;
        latestActivityIso = new Date(approxMs).toISOString();
      }
    }
  }

  const completedToday = activeDateKeys.has(todayKey);

  // Compute consecutive active calendar days ending today (if completed today) or yesterday (if streak still alive)
  let computedStreak = 0;
  if (completedToday || activeDateKeys.has(yesterdayKey)) {
    const startOffset = completedToday ? 0 : 1;
    let cursor = startOffset;
    while (activeDateKeys.has(dateKeyDaysAgo(now, cursor))) {
      computedStreak += 1;
      cursor += 1;
    }
  }

  // Honor Quick Revise stored consecutive streak when its lastDay is today or yesterday
  const qrStreakActive =
    qrLastDay === todayKey || qrLastDay === yesterdayKey ? Math.max(0, input.quickReviseStreak ?? 0) : 0;
  const currentStreakDays = Math.max(computedStreak, qrStreakActive);

  // Determine most recent calendar date key across all sources
  const sortedDates = Array.from(activeDateKeys).sort();
  const lastActivityDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;
  const daysSinceLastActivity = lastActivityDate ? diffCalendarDays(lastActivityDate, todayKey) : null;

  const hoursSinceLastActivity =
    latestActivityMs !== null ? Math.max(0, (now.getTime() - latestActivityMs) / 3_600_000) : null;

  const hoursSinceLastLogin =
    typeof input.hoursSinceLastLogin === 'number' && Number.isFinite(input.hoursSinceLastLogin)
      ? Math.max(0, input.hoursSinceLastLogin)
      : null;

  let habitState: RevisionHabitState;
  if (completedToday) {
    habitState = 'completed_today';
  } else if (currentStreakDays > 0 && daysSinceLastActivity === 1) {
    habitState = 'streak_at_risk';
  } else if (
    (daysSinceLastActivity !== null && daysSinceLastActivity >= 2) ||
    (hoursSinceLastLogin !== null && hoursSinceLastLogin >= 24)
  ) {
    habitState = 'inactive_return';
  } else {
    habitState = 'start_first_streak';
  }

  return {
    currentStreakDays,
    completedToday,
    lastActivityIso: latestActivityIso,
    lastActivityDate,
    hoursSinceLastActivity,
    hoursSinceLastLogin,
    daysSinceLastActivity,
    habitState,
    quickReviseXp: Math.max(0, input.quickReviseXp ?? 0),
    suggestedTask: input.suggestedTask ?? {
      title: '5-Min Quick Revise Study Game',
      subtitle: 'Complete one chapter or topic revision game to lock in today’s streak.',
      targetTab: 'academics',
      estimatedMinutes: 5,
    },
  };
}

export interface EvaluateReminderInput {
  role: UserRole;
  learnerName?: string;
  status: RevisionStreakStatus;
  prefs: RevisionStreakPrefs;
  now?: Date;
  forcePreview?: boolean;
}

/**
 * Pure decision function determining whether a Revision Streak reminder toast should trigger
 * and generating tailored, encouraging copy for students and parents.
 */
export function evaluateRevisionStreakReminder(
  input: EvaluateReminderInput,
): RevisionStreakReminderEvaluation {
  const now = input.now ?? new Date();
  const todayKey = toLocalDateKey(now);
  const { role, status, prefs, forcePreview = false } = input;
  const isParent = role === 'parent';
  const childLabel = input.learnerName?.trim() || 'your child';

  const makeCopy = (): {
    urgency: ReminderUrgency;
    badge: string;
    title: string;
    message: string;
    ctaLabel: string;
  } => {
    if (status.habitState === 'completed_today') {
      return {
        urgency: 'gentle',
        badge: `${Math.max(1, status.currentStreakDays)}-Day Streak Active`,
        title: isParent
          ? `${childLabel}'s Revision Streak is Complete Today`
          : `Today's Revision Streak Complete`,
        message: isParent
          ? `${childLabel} has already logged a ${Math.max(1, status.currentStreakDays)}-day streak. Great daily study consistency.`
          : `You're on a ${Math.max(1, status.currentStreakDays)}-day streak. Play another quick game anytime for bonus XP.`,
        ctaLabel: 'Practice More',
      };
    }

    if (status.habitState === 'streak_at_risk') {
      const days = status.currentStreakDays;
      return {
        urgency: 'high',
        badge: `${days}-Day Streak At Risk`,
        title: isParent
          ? `Protect ${childLabel}'s ${days}-Day Revision Streak`
          : `Keep Your ${days}-Day Revision Streak Alive`,
        message: isParent
          ? `${childLabel} revised yesterday. One ${status.suggestedTask.estimatedMinutes}-minute ${status.suggestedTask.title} today keeps the daily habit unbroken.`
          : `You revised yesterday — complete a ${status.suggestedTask.estimatedMinutes}-minute ${status.suggestedTask.title} today before midnight to reach Day ${days + 1}.`,
        ctaLabel: 'Start Revision Now',
      };
    }

    if (status.habitState === 'inactive_return') {
      const gapDays =
        status.daysSinceLastActivity !== null && status.daysSinceLastActivity >= 2
          ? status.daysSinceLastActivity
          : status.hoursSinceLastLogin !== null
            ? Math.max(1, Math.floor(status.hoursSinceLastLogin / 24))
            : 2;
      const gapText = gapDays === 1 ? 'over 24 hours' : `${gapDays} days`;
      return {
        urgency: 'high',
        badge: `Inactive ${gapDays}d`,
        title: isParent
          ? `Time to Restart ${childLabel}'s Revision Streak`
          : `Welcome Back — Restart Your Revision Streak`,
        message: isParent
          ? `It has been ${gapText} since ${childLabel}'s last revision session. Try "${status.suggestedTask.title}" (${status.suggestedTask.estimatedMinutes} min) to rebuild daily momentum.`
          : `It has been ${gapText} since your last revision. Complete "${status.suggestedTask.title}" (${status.suggestedTask.estimatedMinutes} min) to kick off a fresh streak today.`,
        ctaLabel: 'Resume Revision',
      };
    }

    return {
      urgency: 'medium',
      badge: 'Daily Habit',
      title: isParent
        ? `Start ${childLabel}'s Daily Revision Streak`
        : `Start Your Daily Revision Streak`,
      message: isParent
        ? `Encourage a steady study routine — "${status.suggestedTask.title}" takes just ${status.suggestedTask.estimatedMinutes} minutes to unlock Day 1.`
        : `Build a consistent study habit — complete "${status.suggestedTask.title}" (${status.suggestedTask.estimatedMinutes} min) today to unlock Day 1.`,
      ctaLabel: 'Start 5-Min Revision',
    };
  };

  const copy = makeCopy();

  if (forcePreview) {
    return {
      shouldShow: true,
      reason: 'prompt_due',
      ...copy,
      status,
    };
  }

  if (role !== 'student' && role !== 'parent') {
    return {
      shouldShow: false,
      reason: 'role_not_eligible',
      ...copy,
      status,
    };
  }

  if (!prefs.enabled) {
    return {
      shouldShow: false,
      reason: 'disabled_by_user',
      ...copy,
      status,
    };
  }

  if (status.completedToday) {
    return {
      shouldShow: false,
      reason: 'completed_today',
      ...copy,
      status,
    };
  }

  if (prefs.snoozeUntilIso) {
    const snoozeMs = Date.parse(prefs.snoozeUntilIso);
    if (!Number.isNaN(snoozeMs) && now.getTime() < snoozeMs) {
      return {
        shouldShow: false,
        reason: 'snoozed',
        ...copy,
        status,
      };
    }
  }

  if (prefs.dismissedDate === todayKey) {
    return {
      shouldShow: false,
      reason: 'dismissed_today',
      ...copy,
      status,
    };
  }

  // Trigger when streak is at risk, returning after inactivity, or starting a first daily habit after login gap / first visit
  const threshold = Math.max(1, prefs.inactivityThresholdHours || DEFAULT_REMINDER_PREFS.inactivityThresholdHours);
  const loginGapReached =
    status.hoursSinceLastLogin === null || status.hoursSinceLastLogin >= threshold;
  const activityGapReached =
    status.hoursSinceLastActivity === null || status.hoursSinceLastActivity >= threshold;

  const isDue =
    status.habitState === 'streak_at_risk' ||
    status.habitState === 'inactive_return' ||
    (status.habitState === 'start_first_streak' && (loginGapReached || activityGapReached));

  if (!isDue) {
    return {
      shouldShow: false,
      reason: 'below_inactivity_threshold',
      ...copy,
      status,
    };
  }

  return {
    shouldShow: true,
    reason: 'prompt_due',
    ...copy,
    status,
  };
}

// ============================================================================
// Browser Storage Helpers (Multi-Tenant Isolated by schoolId + userId)
// ============================================================================

function prefsKey(schoolId: string, userId: string): string {
  return `raiplus_streak_reminder_prefs_v1_${schoolId}_${userId}`;
}

function loginKey(schoolId: string, userId: string): string {
  return `raiplus_streak_last_login_v1_${schoolId}_${userId}`;
}

function quickReviseKey(userId: string): string {
  return `raiplus_quick_revise_v2_${userId}`;
}

export function loadReminderPrefs(schoolId: string, userId: string): RevisionStreakPrefs {
  try {
    const raw = localStorage.getItem(prefsKey(schoolId, userId));
    if (!raw) return { ...DEFAULT_REMINDER_PREFS };
    const parsed = JSON.parse(raw) as Partial<RevisionStreakPrefs>;
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      inactivityThresholdHours:
        typeof parsed.inactivityThresholdHours === 'number' && parsed.inactivityThresholdHours >= 1
          ? parsed.inactivityThresholdHours
          : DEFAULT_REMINDER_PREFS.inactivityThresholdHours,
      snoozeUntilIso: typeof parsed.snoozeUntilIso === 'string' ? parsed.snoozeUntilIso : null,
      dismissedDate: typeof parsed.dismissedDate === 'string' ? parsed.dismissedDate : null,
    };
  } catch {
    return { ...DEFAULT_REMINDER_PREFS };
  }
}

export function saveReminderPrefs(
  schoolId: string,
  userId: string,
  prefs: RevisionStreakPrefs,
): void {
  try {
    localStorage.setItem(prefsKey(schoolId, userId), JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

export function snoozeStreakReminder(
  schoolId: string,
  userId: string,
  hours: number,
  now: Date = new Date(),
): RevisionStreakPrefs {
  const current = loadReminderPrefs(schoolId, userId);
  const next: RevisionStreakPrefs = {
    ...current,
    snoozeUntilIso: new Date(now.getTime() + hours * 3_600_000).toISOString(),
  };
  saveReminderPrefs(schoolId, userId, next);
  return next;
}

export function dismissStreakReminderForToday(
  schoolId: string,
  userId: string,
  now: Date = new Date(),
): RevisionStreakPrefs {
  const current = loadReminderPrefs(schoolId, userId);
  const next: RevisionStreakPrefs = {
    ...current,
    dismissedDate: toLocalDateKey(now),
  };
  saveReminderPrefs(schoolId, userId, next);
  return next;
}

export function clearStreakReminderSnooze(
  schoolId: string,
  userId: string,
): RevisionStreakPrefs {
  const current = loadReminderPrefs(schoolId, userId);
  const next: RevisionStreakPrefs = {
    ...current,
    snoozeUntilIso: null,
    dismissedDate: null,
  };
  saveReminderPrefs(schoolId, userId, next);
  return next;
}

/**
 * Records the user's current visit timestamp and returns how many hours elapsed since
 * their previous recorded visit (or null on their very first visit).
 */
export function recordLoginVisitAndGetGap(
  schoolId: string,
  userId: string,
  now: Date = new Date(),
): RevisionLoginGap {
  const nowIso = now.toISOString();
  let previousLoginIso: string | null = null;
  let hoursSinceLastLogin: number | null = null;

  try {
    const raw = localStorage.getItem(loginKey(schoolId, userId));
    if (raw) {
      const prevMs = Date.parse(raw);
      if (!Number.isNaN(prevMs)) {
        previousLoginIso = raw;
        hoursSinceLastLogin = Math.max(0, (now.getTime() - prevMs) / 3_600_000);
      }
    }
    localStorage.setItem(loginKey(schoolId, userId), nowIso);
  } catch {
    // Ignore storage errors
  }

  return {
    previousLoginIso,
    currentLoginIso: nowIso,
    hoursSinceLastLogin,
  };
}

export function readQuickReviseLocalProgress(userId: string): {
  streak: number;
  lastDay: string | null;
  xp: number;
} {
  try {
    const raw = localStorage.getItem(quickReviseKey(userId));
    if (!raw) return { streak: 0, lastDay: null, xp: 0 };
    const parsed = JSON.parse(raw) as { streak?: number; lastDay?: string; xp?: number };
    return {
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastDay: typeof parsed.lastDay === 'string' && parsed.lastDay.length > 0 ? parsed.lastDay : null,
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
    };
  } catch {
    return { streak: 0, lastDay: null, xp: 0 };
  }
}

/**
 * Builds a unified RevisionStreakStatus directly from WorkspaceData + local Quick Revise progress.
 */
export function buildWorkspaceRevisionStreakStatus(
  data: WorkspaceData,
  hoursSinceLastLogin: number | null,
  now: Date = new Date(),
): RevisionStreakStatus {
  const linkedStudent = data.students[0];
  const studentId = linkedStudent?.id || data.user.linkedStudentIds?.[0] || data.user.id;
  const timestamps: string[] = [];

  // 1. Interactive Learning Lab attempts & Abacus sessions
  const il = data.interactiveLearning;
  if (il) {
    for (const attempt of il.attempts || []) {
      if (attempt.studentId === studentId && attempt.completedAt) {
        timestamps.push(attempt.completedAt);
      }
    }
    for (const session of il.abacusSessions || []) {
      if (session.studentId === studentId && session.completedAt) {
        timestamps.push(session.completedAt);
      }
    }
  }

  // 2. VCIP Daily Brain Gym logs
  for (const log of data.vcipBrainGymLogs || []) {
    if (log.studentId === studentId && log.completedAt) {
      timestamps.push(log.completedAt);
    }
  }

  // 3. Local Quick Revise Study Game progress
  const qr = readQuickReviseLocalProgress(data.user.id);

  // Pick a relevant daily suggested task
  const classLabel = linkedStudent?.classSection || data.user.classTeacherOf || 'Your Class';
  const blueprints = il?.blueprints || [];
  const preferredBlueprint = blueprints[0];

  const suggestedTask: SuggestedRevisionTask =
    qr.xp === 0 || !preferredBlueprint
      ? {
          title: `Quick Revise Study Game (${classLabel})`,
          subtitle: 'Play 1 interactive chapter or topic challenge to earn XP and extend your streak.',
          targetTab: 'academics',
          estimatedMinutes: 5,
        }
      : {
          title: `${preferredBlueprint.subject}: ${preferredBlueprint.chapterTitle}`,
          subtitle: 'Complete a concept game, simulation, or quick revision round in the Learning Lab.',
          targetTab: 'interactive_learning',
          estimatedMinutes: 5,
        };

  return computeRevisionStreakStatus({
    activityTimestamps: timestamps,
    quickReviseStreak: qr.streak,
    quickReviseLastDay: qr.lastDay,
    quickReviseXp: qr.xp,
    hoursSinceLastLogin,
    suggestedTask,
    now,
  });
}

export function emitRevisionStreakUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REVISION_STREAK_UPDATED_EVENT));
  }
}

export function formatRelativeGap(hours: number | null, days: number | null): string {
  if (days !== null && days >= 2) {
    return `${days} days ago`;
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (hours === null) {
    return 'No revision logged yet';
  }
  if (hours < 1) {
    return 'Just now';
  }
  if (hours < 24) {
    const h = Math.round(hours);
    return `${h} hr${h === 1 ? '' : 's'} ago`;
  }
  const d = Math.floor(hours / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}
