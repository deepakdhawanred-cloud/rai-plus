import type { TimetableSlot } from '../types';

export type TimetableGridTool = 'select' | 'unschedule' | 'pin' | 'lock';
export type TimetableGridPerspective = 'class' | 'teacher' | 'room';

export type StaffAccessStatus =
  | 'Joined'
  | 'Awaiting Sign-Up'
  | 'No Sign-In'
  | 'No Access';

export interface TimetableStaffTypeRecord {
  id: string;
  name: string;
  shortCode: string;
  teaches: boolean;
  supervisesAlone: boolean;
}

export interface TimetableStaffMember {
  id: string;
  name: string;
  subtitle: string;
  email: string;
  staffTypeIds: string[];
  role: 'Owner' | 'Admin' | 'Member';
  status: StaffAccessStatus;
  includeInCover: boolean;
  workingHoursMode: 'Full Time' | 'Set Hours';
  customHoursNote?: string;
  timeOffPeriodsPerWeek: number;
  avatarColor: string;
}

export interface TimetablePlanVersion {
  id: string;
  name: string;
  versionLabel: string;
  status: 'Published' | 'Draft';
  effectiveFrom: string; // ISO YYYY-MM-DD
  effectiveTo: string; // ISO YYYY-MM-DD
  updatedAt: string;
  sessionName?: string;
}

export interface UnscheduledLessonItem {
  id: string;
  classSection: string;
  subject: string;
  teacherName: string;
  room: string;
  periodsRemaining: number;
  reason?: string;
}

export interface WorkloadItem {
  id: string;
  label: string;
  usedPeriods: number;
  availablePeriods: number;
  timeOffPeriods: number;
  utilizationPct: number;
  status: 'normal' | 'full' | 'over_capacity';
}

export interface TimetableWorkloadReport {
  totalClasses: number;
  totalTeachers: number;
  totalPeriodsScheduled: number;
  totalPeriodsUnscheduled: number;
  overCapacityCount: number;
  classes: WorkloadItem[];
  teachers: WorkloadItem[];
}

export const TIMETABLE_PERIOD_COLUMNS: Array<{
  id: string;
  label: string;
  timeRange: string;
  periodNumber?: number;
  isBreak?: boolean;
  isDiary?: boolean;
}> = [
  { id: 'p1', label: 'Period 1', timeRange: '08:35–09:10', periodNumber: 1 },
  { id: 'p2', label: 'Period 2', timeRange: '09:10–09:45', periodNumber: 2 },
  { id: 'p3', label: 'Period 3', timeRange: '09:45–10:20', periodNumber: 3 },
  { id: 'p4', label: 'Period 4', timeRange: '10:20–10:55', periodNumber: 4 },
  { id: 'b1', label: 'Break 1', timeRange: '10:55–11:10', isBreak: true },
  { id: 'p5', label: 'Period 5', timeRange: '11:10–11:45', periodNumber: 5 },
  { id: 'p6', label: 'Period 6', timeRange: '11:45–12:20', periodNumber: 6 },
  { id: 'p7', label: 'Period 7', timeRange: '12:20–12:55', periodNumber: 7 },
  { id: 'p8', label: 'Period 8', timeRange: '12:55–13:30', periodNumber: 8 },
  { id: 'diary', label: 'Diary', timeRange: '13:30–13:35', isDiary: true },
  { id: 'p9', label: 'Period 9', timeRange: '13:35–14:10', periodNumber: 9 },
];

export const TIMETABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DEFAULT_STAFF_TYPES: TimetableStaffTypeRecord[] = [
  { id: 'st-teacher', name: 'Teacher', shortCode: 'T', teaches: true, supervisesAlone: true },
  { id: 'st-lab', name: 'Lab Technician', shortCode: 'Lab', teaches: false, supervisesAlone: false },
  { id: 'st-support', name: 'Support Staff', shortCode: 'Sup', teaches: false, supervisesAlone: true },
];

const TOTAL_WEEKLY_SLOTS = 54; // 6 days × 9 periods

/**
 * Computes TimetableMaster-style Classes & Teachers workload breakdown,
 * sorted busiest-first with over-capacity (>100%) and full (100%) detection.
 */
export function computeTimetableWorkloadAnalysis(params: {
  slots: TimetableSlot[];
  unscheduledLessons?: UnscheduledLessonItem[];
  staffMembers?: TimetableStaffMember[];
  classTimeOffMap?: Record<string, number>;
}): TimetableWorkloadReport {
  const {
    slots,
    unscheduledLessons = [],
    staffMembers = [],
    classTimeOffMap = {},
  } = params;

  const classCounts = new Map<string, number>();
  const teacherCounts = new Map<string, number>();

  for (const slot of slots) {
    classCounts.set(slot.classSection, (classCounts.get(slot.classSection) || 0) + 1);
    if (slot.teacherName && slot.teacherName.trim()) {
      teacherCounts.set(slot.teacherName, (teacherCounts.get(slot.teacherName) || 0) + 1);
    }
  }

  // Include unscheduled demand so workload reflects total periods needed before generation
  for (const u of unscheduledLessons) {
    classCounts.set(
      u.classSection,
      (classCounts.get(u.classSection) || 0) + u.periodsRemaining,
    );
    if (u.teacherName && u.teacherName.trim()) {
      teacherCounts.set(
        u.teacherName,
        (teacherCounts.get(u.teacherName) || 0) + u.periodsRemaining,
      );
    }
  }

  const staffTimeOffByLower = new Map<string, number>();
  for (const sm of staffMembers) {
    staffTimeOffByLower.set(sm.name.trim().toLowerCase(), sm.timeOffPeriodsPerWeek || 0);
  }

  const buildItem = (
    label: string,
    used: number,
    timeOff: number,
  ): WorkloadItem => {
    const available = Math.max(6, TOTAL_WEEKLY_SLOTS - timeOff);
    const pct = Math.round((used / available) * 100);
    const status: WorkloadItem['status'] =
      pct > 100 ? 'over_capacity' : pct === 100 ? 'full' : 'normal';
    return {
      id: label,
      label,
      usedPeriods: used,
      availablePeriods: available,
      timeOffPeriods: timeOff,
      utilizationPct: pct,
      status,
    };
  };

  const classes: WorkloadItem[] = Array.from(classCounts.entries())
    .map(([cls, used]) => buildItem(cls, used, classTimeOffMap[cls] || 0))
    .sort((a, b) => b.utilizationPct - a.utilizationPct || b.usedPeriods - a.usedPeriods);

  const teachers: WorkloadItem[] = Array.from(teacherCounts.entries())
    .map(([tName, used]) => {
      const timeOff = staffTimeOffByLower.get(tName.trim().toLowerCase()) || 0;
      return buildItem(tName, used, timeOff);
    })
    .sort((a, b) => b.utilizationPct - a.utilizationPct || b.usedPeriods - a.usedPeriods);

  const totalPeriodsUnscheduled = unscheduledLessons.reduce(
    (sum, item) => sum + item.periodsRemaining,
    0,
  );

  const overCapacityCount =
    classes.filter((c) => c.status === 'over_capacity').length +
    teachers.filter((t) => t.status === 'over_capacity').length;

  return {
    totalClasses: classes.length,
    totalTeachers: teachers.length,
    totalPeriodsScheduled: slots.length,
    totalPeriodsUnscheduled,
    overCapacityCount,
    classes,
    teachers,
  };
}

/**
 * Filters staff directory entries by query (name, email, subtitle, staff type)
 * and exact status filter (`All` or one of the 4 TimetableMaster statuses).
 */
export function filterTimetableStaff(
  staff: TimetableStaffMember[],
  staffTypes: TimetableStaffTypeRecord[],
  query: string,
  statusFilter: 'All' | StaffAccessStatus,
): TimetableStaffMember[] {
  const q = query.trim().toLowerCase();
  const typeNameById = new Map(staffTypes.map((st) => [st.id, `${st.name} ${st.shortCode}`.toLowerCase()]));

  return staff.filter((member) => {
    if (statusFilter !== 'All' && member.status !== statusFilter) return false;
    if (!q) return true;
    const typeText = member.staffTypeIds.map((id) => typeNameById.get(id) || '').join(' ');
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      member.subtitle.toLowerCase().includes(q) ||
      typeText.includes(q)
    );
  });
}

export function computeStaffTypeCounts(
  staff: TimetableStaffMember[],
  staffTypes: TimetableStaffTypeRecord[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const st of staffTypes) counts[st.id] = 0;
  for (const member of staff) {
    for (const id of member.staffTypeIds) {
      counts[id] = (counts[id] || 0) + 1;
    }
  }
  return counts;
}

export interface AutoPlaceResult {
  placedSlots: TimetableSlot[];
  remainingUnscheduled: UnscheduledLessonItem[];
  newlyPlacedCount: number;
  totalTargetPeriods: number;
  diagnostics: string[];
}

export function sameTimetableDay(a: string, b: string): boolean {
  return a.trim().slice(0, 3).toLowerCase() === b.trim().slice(0, 3).toLowerCase();
}

/**
 * Deterministic clash-free auto-generator that places unscheduled lessons into
 * open Day × Period slots where neither the class nor the teacher is busy.
 */
export function autoPlaceUnscheduledLessons(params: {
  existingSlots: TimetableSlot[];
  unscheduled: UnscheduledLessonItem[];
  schoolId: string;
}): AutoPlaceResult {
  const { existingSlots, unscheduled, schoolId } = params;
  const placedSlots = [...existingSlots];
  const remainingUnscheduled: UnscheduledLessonItem[] = [];
  const diagnostics: string[] = [];
  let newlyPlacedCount = 0;

  const isSlotTakenForClass = (cls: string, day: string, period: number) =>
    placedSlots.some(
      (s) => s.classSection === cls && sameTimetableDay(s.day, day) && s.period === period,
    );

  const isTeacherBusy = (teacher: string, day: string, period: number) =>
    placedSlots.some(
      (s) =>
        s.teacherName.trim().toLowerCase() === teacher.trim().toLowerCase() &&
        sameTimetableDay(s.day, day) &&
        s.period === period,
    );

  for (const item of unscheduled) {
    let left = item.periodsRemaining;
    for (const day of TIMETABLE_DAYS) {
      if (left <= 0) break;
      for (let period = 1; period <= 9; period++) {
        if (left <= 0) break;
        if (
          !isSlotTakenForClass(item.classSection, day, period) &&
          !isTeacherBusy(item.teacherName, day, period)
        ) {
          const periodMeta = TIMETABLE_PERIOD_COLUMNS.find((c) => c.periodNumber === period);
          placedSlots.push({
            id: `tt-auto-${Date.now().toString(36)}-${placedSlots.length}`,
            schoolId,
            classSection: item.classSection,
            day,
            period,
            timeRange: periodMeta?.timeRange || `Period ${period}`,
            subject: item.subject,
            teacherName: item.teacherName,
            room: item.room || `Room ${item.classSection}`,
          });
          left -= 1;
          newlyPlacedCount += 1;
        }
      }
    }

    if (left > 0) {
      remainingUnscheduled.push({
        ...item,
        periodsRemaining: left,
        reason: `${left} lesson(s): teacher or class had conflicting periods in all open slots`,
      });
      diagnostics.push(
        `${item.subject} (${item.classSection} · ${item.teacherName}): ${left} lesson could not be placed due to teacher/class slot conflict.`,
      );
    }
  }

  const totalTargetPeriods =
    placedSlots.length +
    remainingUnscheduled.reduce((sum, u) => sum + u.periodsRemaining, 0);

  return {
    placedSlots,
    remainingUnscheduled,
    newlyPlacedCount,
    totalTargetPeriods,
    diagnostics,
  };
}

/**
 * Checks if manually placing an unscheduled lesson into a specific class/day/period
 * causes a teacher double-booking clash.
 */
export function checkManualPlacementClash(
  slots: TimetableSlot[],
  lesson: UnscheduledLessonItem,
  day: string,
  period: number,
): string | null {
  const classBusy = slots.find(
    (s) =>
      s.classSection === lesson.classSection &&
      sameTimetableDay(s.day, day) &&
      s.period === period,
  );
  if (classBusy) {
    return `Class ${lesson.classSection} already has ${classBusy.subject} in ${day} Period ${period}.`;
  }
  const teacherBusy = slots.find(
    (s) =>
      s.teacherName.trim().toLowerCase() === lesson.teacherName.trim().toLowerCase() &&
      sameTimetableDay(s.day, day) &&
      s.period === period,
  );
  if (teacherBusy) {
    return `${lesson.teacherName} is already scheduled in Class ${teacherBusy.classSection} (${teacherBusy.subject}) during ${day} Period ${period}.`;
  }
  return null;
}

export interface TimelineBarLayout {
  plan: TimetablePlanVersion;
  leftPct: number;
  widthPct: number;
  visible: boolean;
}

/**
 * Computes horizontal Gantt bar positions for the Published Timeline view
 * across a 4-month window starting at windowStartIso.
 */
export function computePublishedTimelineBars(params: {
  plans: TimetablePlanVersion[];
  windowStartIso: string;
  windowEndIso: string;
  todayIso: string;
}): {
  bars: TimelineBarLayout[];
  todayMarkerPct: number | null;
} {
  const startMs = new Date(params.windowStartIso).getTime();
  const endMs = new Date(params.windowEndIso).getTime();
  const span = Math.max(1, endMs - startMs);

  const todayMs = new Date(params.todayIso).getTime();
  const todayMarkerPct =
    todayMs >= startMs && todayMs <= endMs
      ? Math.round(((todayMs - startMs) / span) * 1000) / 10
      : null;

  const bars: TimelineBarLayout[] = params.plans
    .filter((p) => p.status === 'Published')
    .map((plan) => {
      const pStart = new Date(plan.effectiveFrom).getTime();
      const pEnd = new Date(plan.effectiveTo).getTime();
      if (pEnd < startMs || pStart > endMs) {
        return { plan, leftPct: 0, widthPct: 0, visible: false };
      }
      const clampedStart = Math.max(startMs, pStart);
      const clampedEnd = Math.min(endMs, pEnd);
      const leftPct = Math.round(((clampedStart - startMs) / span) * 1000) / 10;
      const widthPct = Math.max(
        6,
        Math.round(((clampedEnd - clampedStart) / span) * 1000) / 10,
      );
      return { plan, leftPct, widthPct, visible: true };
    });

  return { bars, todayMarkerPct };
}
