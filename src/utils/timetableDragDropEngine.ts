import type { TimetableSlot } from '../types';
import {
  normalizeTeacherKey,
  normalizeTimetableDay,
  PERIOD_TIME_RANGES,
  splitSlotTeachers,
} from './smartTimetableEngine.ts';

export interface PeriodDropRequest {
  slots: TimetableSlot[];
  sourceSlotId: string;
  targetDay: string;
  targetPeriod: number;
  targetSlotId?: string | null;
  lockedSlotIds?: string[];
}

export interface PeriodDropEvaluation {
  allowed: boolean;
  action: 'move' | 'swap' | 'noop';
  conflicts: string[];
  warnings: string[];
  summary: string;
  nextSlots: TimetableSlot[];
  sourceBefore?: TimetableSlot;
  targetBefore?: TimetableSlot | null;
}

export interface TeacherOptimizationSuggestion {
  id: string;
  severity: 'high' | 'medium';
  reason: string;
  sourceSlot: TimetableSlot;
  targetDay: string;
  targetPeriod: number;
  targetSlot: TimetableSlot | null;
  action: 'move' | 'swap';
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const DAY_KEY_TO_FULL: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};

function toFullDayName(day: string): string {
  const key = normalizeTimetableDay(day).slice(0, 3).toLowerCase();
  return DAY_KEY_TO_FULL[key] || day.trim();
}

function teachersOverlap(a: string, b: string): string | null {
  const listA = splitSlotTeachers(a);
  const listB = splitSlotTeachers(b);
  const keysA = new Set(listA.map(normalizeTeacherKey).filter(Boolean));
  for (const name of listB) {
    const key = normalizeTeacherKey(name);
    if (key && keysA.has(key)) return name;
  }
  return null;
}

function sameDay(a: string, b: string): boolean {
  return normalizeTimetableDay(a) === normalizeTimetableDay(b);
}

/**
 * Evaluates dragging a particular timetable period onto a target (day, period) cell.
 * Supports conflict-checked moves into empty cells and atomic swaps with an occupied cell.
 */
export function evaluatePeriodDrop(req: PeriodDropRequest): PeriodDropEvaluation {
  const { slots, sourceSlotId, targetPeriod, lockedSlotIds = [] } = req;
  const targetDay = toFullDayName(req.targetDay);
  const source = slots.find((s) => s.id === sourceSlotId);

  if (!source) {
    return {
      allowed: false,
      action: 'noop',
      conflicts: ['Selected period slot was not found.'],
      warnings: [],
      summary: 'Period slot not found.',
      nextSlots: slots,
    };
  }

  if (targetPeriod < 1 || targetPeriod > 8) {
    return {
      allowed: false,
      action: 'noop',
      conflicts: ['Target period must be between Period 1 and Period 8.'],
      warnings: [],
      summary: 'Invalid period range.',
      nextSlots: slots,
    };
  }

  if (lockedSlotIds.includes(source.id)) {
    return {
      allowed: false,
      action: 'noop',
      conflicts: [`${source.subject} (${source.day} P${source.period}) is locked.`],
      warnings: [],
      summary: 'Source period is locked.',
      nextSlots: slots,
    };
  }

  if (sameDay(source.day, targetDay) && source.period === targetPeriod) {
    return {
      allowed: false,
      action: 'noop',
      conflicts: [],
      warnings: [],
      summary: 'Already in this period.',
      nextSlots: slots,
    };
  }

  const explicitTarget = req.targetSlotId
    ? slots.find((s) => s.id === req.targetSlotId && s.id !== source.id)
    : undefined;

  const target =
    explicitTarget ||
    slots.find(
      (s) =>
        s.id !== source.id &&
        sameDay(s.day, targetDay) &&
        s.period === targetPeriod &&
        (s.classSection === source.classSection ||
          Boolean(teachersOverlap(s.teacherName, source.teacherName))),
    ) ||
    null;

  if (target && lockedSlotIds.includes(target.id)) {
    return {
      allowed: false,
      action: 'swap',
      conflicts: [`Target period ${target.subject} (${target.day} P${target.period}) is locked.`],
      warnings: [],
      summary: 'Target period is locked.',
      nextSlots: slots,
    };
  }

  const targetTimeRange = PERIOD_TIME_RANGES[targetPeriod] || `Period ${targetPeriod}`;
  const sourceTimeRange = PERIOD_TIME_RANGES[source.period] || source.timeRange;

  const nextSlots = slots.map((slot) => {
    if (slot.id === source.id) {
      return {
        ...slot,
        day: targetDay,
        period: targetPeriod,
        timeRange: targetTimeRange,
      };
    }
    if (target && slot.id === target.id) {
      return {
        ...slot,
        day: toFullDayName(source.day),
        period: source.period,
        timeRange: sourceTimeRange,
      };
    }
    return slot;
  });

  const movedIds = new Set<string>([source.id, ...(target ? [target.id] : [])]);
  const conflicts: string[] = [];
  const warnings: string[] = [];

  for (const moved of nextSlots.filter((s) => movedIds.has(s.id))) {
    for (const other of nextSlots) {
      if (other.id === moved.id) continue;
      if (!sameDay(other.day, moved.day) || other.period !== moved.period) continue;

      if (other.classSection === moved.classSection) {
        conflicts.push(
          `Class ${moved.classSection} already has ${other.subject} (${other.teacherName}) on ${moved.day} P${moved.period}.`,
        );
      }

      const sharedTeacher = teachersOverlap(moved.teacherName, other.teacherName);
      if (sharedTeacher) {
        conflicts.push(
          `${sharedTeacher} is already teaching Class ${other.classSection} (${other.subject}) on ${moved.day} P${moved.period}.`,
        );
      }

      if (
        moved.room &&
        other.room &&
        moved.room.trim().toLowerCase() === other.room.trim().toLowerCase() &&
        moved.classSection !== other.classSection
      ) {
        warnings.push(
          `Room ${moved.room} is also assigned to Class ${other.classSection} on ${moved.day} P${moved.period}.`,
        );
      }
    }
  }

  const uniqueConflicts = Array.from(new Set(conflicts));
  const uniqueWarnings = Array.from(new Set(warnings));
  const action: 'move' | 'swap' = target ? 'swap' : 'move';

  const summary = target
    ? `Swapped ${source.subject} (Class ${source.classSection}, ${source.day} P${source.period}) ↔ ${target.subject} (Class ${target.classSection}, ${target.day} P${target.period}).`
    : `Moved ${source.subject} (Class ${source.classSection}) from ${source.day} P${source.period} → ${targetDay} P${targetPeriod}.`;

  return {
    allowed: uniqueConflicts.length === 0,
    action,
    conflicts: uniqueConflicts,
    warnings: uniqueWarnings,
    summary,
    nextSlots: uniqueConflicts.length === 0 ? nextSlots : slots,
    sourceBefore: source,
    targetBefore: target,
  };
}

/**
 * Analyzes a teacher's weekly timetable to detect heavy back-to-back period fatigue
 * or uneven daily loads and proposes conflict-free drag-and-drop optimizations.
 */
export function computeTeacherScheduleOptimizationSuggestions(
  allSlots: TimetableSlot[],
  teacherName: string,
  maxSuggestions = 3,
): {
  dailyCounts: Record<string, number>;
  maxConsecutiveRun: number;
  heavyDays: string[];
  suggestions: TeacherOptimizationSuggestion[];
} {
  const tKey = normalizeTeacherKey(teacherName);
  const dailyCounts: Record<string, number> = {};
  const byDay = new Map<string, TimetableSlot[]>();
  for (const day of WEEKDAYS) {
    dailyCounts[day] = 0;
    byDay.set(day, []);
  }

  for (const s of allSlots) {
    const matched = splitSlotTeachers(s.teacherName).some((n) => normalizeTeacherKey(n) === tKey);
    if (!matched) continue;
    const d = toFullDayName(s.day);
    if (!byDay.has(d)) continue;
    byDay.get(d)!.push(s);
    dailyCounts[d] = (dailyCounts[d] || 0) + 1;
  }

  let maxConsecutiveRun = 0;
  const heavyDays: string[] = [];
  const candidateSources: Array<{ slot: TimetableSlot; reason: string; severity: 'high' | 'medium' }> = [];

  for (const day of WEEKDAYS) {
    const daySlots = (byDay.get(day) || []).sort((a, b) => a.period - b.period);
    if (daySlots.length >= 6) heavyDays.push(day);

    // Check consecutive periods without break (note: break is between P4 and P5)
    let run = 0;
    let prevPeriod = -10;
    for (const s of daySlots) {
      if (s.period === prevPeriod + 1 && s.period !== 5) {
        run += 1;
      } else {
        run = 1;
      }
      prevPeriod = s.period;
      if (run > maxConsecutiveRun) maxConsecutiveRun = run;
      if (run >= 4) {
        candidateSources.push({
          slot: s,
          reason: `${day} has ${run} consecutive periods without a break (P${s.period - run + 1}–P${s.period}).`,
          severity: 'high',
        });
      }
    }
  }

  // Also flag imbalanced heavy days (>2 periods higher than lightest teaching day)
  const counts = WEEKDAYS.map((d) => ({ day: d, count: dailyCounts[d] || 0 }));
  const sortedAsc = [...counts].sort((a, b) => a.count - b.count);
  const sortedDesc = [...counts].sort((a, b) => b.count - a.count);
  const lightestDays = sortedAsc.filter((d) => d.count <= (sortedDesc[0]?.count ?? 0) - 2).map((d) => d.day);

  if (sortedDesc[0] && sortedAsc[0] && sortedDesc[0].count - sortedAsc[0].count >= 2) {
    const heavyDaySlots = byDay.get(sortedDesc[0].day) || [];
    for (const s of heavyDaySlots.slice(-2)) {
      candidateSources.push({
        slot: s,
        reason: `${sortedDesc[0].day} has ${sortedDesc[0].count} periods vs ${sortedAsc[0].day} (${sortedAsc[0].count}).`,
        severity: 'medium',
      });
    }
  }

  const suggestions: TeacherOptimizationSuggestion[] = [];
  const usedSourceIds = new Set<string>();

  for (const cand of candidateSources) {
    if (suggestions.length >= maxSuggestions) break;
    if (usedSourceIds.has(cand.slot.id)) continue;

    const targetDayCandidates =
      lightestDays.length > 0
        ? lightestDays
        : sortedAsc.map((d) => d.day).filter((d) => d !== toFullDayName(cand.slot.day));

    outer: for (const tDay of targetDayCandidates) {
      for (let p = 1; p <= 8; p += 1) {
        if (sameDay(cand.slot.day, tDay) && cand.slot.period === p) continue;
        // Prefer empty cell for the teacher on that lighter day
        const evalRes = evaluatePeriodDrop({
          slots: allSlots,
          sourceSlotId: cand.slot.id,
          targetDay: tDay,
          targetPeriod: p,
        });
        if (evalRes.allowed && evalRes.action === 'move') {
          suggestions.push({
            id: `opt-${cand.slot.id}-${tDay}-${p}`,
            severity: cand.severity,
            reason: cand.reason,
            sourceSlot: cand.slot,
            targetDay: tDay,
            targetPeriod: p,
            targetSlot: null,
            action: 'move',
          });
          usedSourceIds.add(cand.slot.id);
          break outer;
        }
      }
    }
  }

  return {
    dailyCounts,
    maxConsecutiveRun,
    heavyDays,
    suggestions,
  };
}
