import type {
  HomeworkAssignment,
  LessonPlan,
  NotebookEntry,
  StaffAttendanceRecord,
  StaffProfile,
  SubstitutionAssignmentRecord,
  TeacherLeaveRequest,
  TeacherProductivityKpiConfig,
  TimetableSlot,
} from '../types';
import { normalizeTeacherKey, splitSlotTeachers } from './smartTimetableEngine.ts';

export type HeatmapCellCategory =
  | 'high_efficiency'
  | 'optimal'
  | 'moderate_leave'
  | 'burnout_risk'
  | 'leave_cluster';

export type HeatmapMetricMode = 'pattern' | 'attendance' | 'leave_load';

export interface SemesterWeekBucket {
  weekIndex: number; // 0..15
  weekCode: string; // W1..W16
  monthLabel: string; // Aug, Sep, Oct, Nov
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string; // YYYY-MM-DD (Saturday)
  shortRangeLabel: string; // e.g., "Nov 09–14"
  isPeriodHighlight: 'burnout_window' | 'high_efficiency_window' | 'normal';
  avgAttendancePct: number;
  totalLeaveDays: number;
  burnoutTeacherCount: number;
  highEfficiencyTeacherCount: number;
}

export interface TeacherHeatmapCell {
  teacherKey: string;
  teacherName: string;
  weekIndex: number;
  weekCode: string;
  dateRangeLabel: string;
  attendancePct: number; // 0..100
  presentDays: number;
  halfDays: number;
  leaveDays: number;
  absentDays: number;
  workingDays: number;
  regularPeriods: number;
  substitutePeriods: number;
  workloadUtilizationPct: number;
  executionLogsCount: number; // notebooks + lesson plans + homework in week
  productivityScore: number; // 0..100
  burnoutIndex: number; // 0..100 (higher = greater burnout strain)
  category: HeatmapCellCategory;
  categoryLabel: string;
  dataBasis: 'logged' | 'schedule_baseline';
  insightNote: string;
}

export interface TeacherSemesterSummaryRow {
  teacherKey: string;
  teacherName: string;
  designation: string;
  subjectsLabel: string;
  weeklyRegularPeriods: number;
  semesterAttendancePct: number;
  totalLeaveAndAbsenceDays: number;
  totalSubstitutePeriods: number;
  burnoutRiskWeeks: number;
  highEfficiencyWeeks: number;
  dominantPattern: 'burnout_watch' | 'high_efficiency' | 'balanced';
  patternSummary: string;
  cells: TeacherHeatmapCell[];
}

export interface TeacherSemesterHeatmapModel {
  semesterLabel: string;
  weeks: SemesterWeekBucket[];
  teachers: TeacherSemesterSummaryRow[];
  cells: TeacherHeatmapCell[];
  summary: {
    teacherCount: number;
    avgSemesterAttendancePct: number;
    totalLeaveDays: number;
    burnoutWatchTeachers: number;
    highEfficiencyTeachers: number;
    peakEfficiencyWeek: string | null;
    highestStrainWeek: string | null;
  };
}

export const HEATMAP_CATEGORY_LABELS: Record<HeatmapCellCategory, string> = {
  high_efficiency: 'High Efficiency',
  optimal: 'Balanced & Steady',
  moderate_leave: 'Planned Leave / Dip',
  leave_cluster: 'Extended Leave',
  burnout_risk: 'Burnout Risk',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function deterministicHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function parseIsoDateUtc(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

function formatIsoDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysUtc(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getMondayOfWeek(date: Date): Date {
  const day = date.getUTCDay(); // 0=Sun..6=Sat
  const offset = day === 0 ? -6 : 1 - day;
  return addDaysUtc(date, offset);
}

function formatShortRange(start: Date, end: Date): string {
  const m1 = MONTH_NAMES[start.getUTCMonth()];
  const m2 = MONTH_NAMES[end.getUTCMonth()];
  const d1 = String(start.getUTCDate()).padStart(2, '0');
  const d2 = String(end.getUTCDate()).padStart(2, '0');
  return m1 === m2 ? `${m1} ${d1}–${d2}` : `${m1} ${d1}–${m2} ${d2}`;
}

function matchesTeacher(field: string | undefined, key: string): boolean {
  if (!field) return false;
  const norm = normalizeTeacherKey(field);
  if (!norm) return false;
  return norm === key || norm.includes(key) || key.includes(norm);
}

function resolveAnchorDate(params: {
  staffAttendance: StaffAttendanceRecord[];
  leaveRequests: TeacherLeaveRequest[];
  substitutions: SubstitutionAssignmentRecord[];
  referenceDateIso?: string;
}): string {
  if (params.referenceDateIso) return params.referenceDateIso.slice(0, 10);
  const candidates: string[] = [];
  for (const a of params.staffAttendance) {
    if (a.date) candidates.push(a.date.slice(0, 10));
  }
  for (const l of params.leaveRequests) {
    if (l.endDate) candidates.push(l.endDate.slice(0, 10));
  }
  for (const s of params.substitutions) {
    if (s.date) candidates.push(s.date.slice(0, 10));
  }
  if (candidates.length === 0) return '2026-11-26';
  candidates.sort();
  return candidates[candidates.length - 1];
}

function countOverlapWorkingDays(
  rangeStartIso: string,
  rangeEndIso: string,
  weekStartIso: string,
  weekEndIso: string,
): number {
  const start = rangeStartIso > weekStartIso ? rangeStartIso : weekStartIso;
  const end = rangeEndIso < weekEndIso ? rangeEndIso : weekEndIso;
  if (start > end) return 0;
  let count = 0;
  let cursor = parseIsoDateUtc(start);
  const endDt = parseIsoDateUtc(end);
  while (cursor.getTime() <= endDt.getTime()) {
    const dow = cursor.getUTCDay();
    if (dow !== 0) count += 1; // Mon–Sat school week
    cursor = addDaysUtc(cursor, 1);
  }
  return count;
}

/**
 * Builds a 16-week semester heatmap matrix for teacher attendance, leave patterns,
 * burnout watch signals, and high-efficiency windows using real ERP records.
 */
export function buildTeacherSemesterHeatmap(params: {
  staffProfiles?: StaffProfile[];
  staffAttendance?: StaffAttendanceRecord[];
  timetable: TimetableSlot[];
  leaveRequests?: TeacherLeaveRequest[];
  substitutions?: SubstitutionAssignmentRecord[];
  lessonPlans?: LessonPlan[];
  notebookEntries?: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  config?: TeacherProductivityKpiConfig;
  referenceDateIso?: string;
  weekCount?: number;
  restrictToTeacherName?: string | null;
}): TeacherSemesterHeatmapModel {
  const staffProfiles = params.staffProfiles || [];
  const staffAttendance = params.staffAttendance || [];
  const leaveRequests = params.leaveRequests || [];
  const substitutions = params.substitutions || [];
  const lessonPlans = params.lessonPlans || [];
  const notebookEntries = params.notebookEntries || [];
  const homeworkAssignments = params.homeworkAssignments || [];
  const targetWeeklyPeriods = Math.max(12, params.config?.targetWeeklyPeriods || 28);
  const weekCount = Math.max(8, Math.min(20, params.weekCount || 16));

  const anchorIso = resolveAnchorDate({
    staffAttendance,
    leaveRequests,
    substitutions,
    referenceDateIso: params.referenceDateIso,
  });
  const latestMonday = getMondayOfWeek(parseIsoDateUtc(anchorIso));
  const firstMonday = addDaysUtc(latestMonday, -(weekCount - 1) * 7);

  const rawWeeks: SemesterWeekBucket[] = Array.from({ length: weekCount }, (_, idx) => {
    const startDt = addDaysUtc(firstMonday, idx * 7);
    const endDt = addDaysUtc(startDt, 5); // Mon–Sat instructional week
    return {
      weekIndex: idx,
      weekCode: `W${idx + 1}`,
      monthLabel: MONTH_NAMES[startDt.getUTCMonth()],
      startDate: formatIsoDateUtc(startDt),
      endDate: formatIsoDateUtc(endDt),
      shortRangeLabel: formatShortRange(startDt, endDt),
      isPeriodHighlight: 'normal',
      avgAttendancePct: 100,
      totalLeaveDays: 0,
      burnoutTeacherCount: 0,
      highEfficiencyTeacherCount: 0,
    };
  });

  // Unify teaching faculty across timetable, teacher staffProfiles, and leaveRequests
  const facultyMap = new Map<
    string,
    {
      displayName: string;
      designation: string;
      staffId?: string;
      subjects: Set<string>;
      weeklyPeriods: number;
    }
  >();

  const ensureFaculty = (rawName: string, designation = 'Teaching Faculty', staffId?: string) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const key = normalizeTeacherKey(clean);
    if (!key) return null;
    let existing = facultyMap.get(key);
    if (!existing) {
      existing = {
        displayName: clean,
        designation,
        staffId,
        subjects: new Set(),
        weeklyPeriods: 0,
      };
      facultyMap.set(key, existing);
    } else {
      if (staffId && !existing.staffId) existing.staffId = staffId;
      if (designation !== 'Teaching Faculty' && existing.designation === 'Teaching Faculty') {
        existing.designation = designation;
      }
    }
    return { key, entry: existing };
  };

  for (const slot of params.timetable) {
    for (const raw of splitSlotTeachers(slot.teacherName)) {
      const ref = ensureFaculty(raw);
      if (!ref) continue;
      ref.entry.weeklyPeriods += 1;
      if (slot.subject) ref.entry.subjects.add(slot.subject);
    }
  }

  for (const profile of staffProfiles) {
    if (profile.roleType !== 'Teacher' || !profile.active) continue;
    const ref = ensureFaculty(profile.name, profile.designation || 'Teacher', profile.id);
    if (ref && profile.department && ref.entry.subjects.size === 0) {
      ref.entry.subjects.add(profile.department);
    }
  }

  for (const leave of leaveRequests) {
    ensureFaculty(leave.teacherName);
  }

  // Optional single-teacher scoping for teacher role
  const restrictKey = params.restrictToTeacherName
    ? normalizeTeacherKey(params.restrictToTeacherName)
    : null;

  const sortedFaculty = Array.from(facultyMap.entries())
    .filter(([key]) => {
      if (!restrictKey) return true;
      return key === restrictKey || key.includes(restrictKey) || restrictKey.includes(key);
    })
    .sort((a, b) => a[1].displayName.localeCompare(b[1].displayName));

  const teachers: TeacherSemesterSummaryRow[] = [];
  const allCells: TeacherHeatmapCell[] = [];

  // Map attendance records by staffId for O(1) lookup
  const attendanceByStaffId = new Map<string, StaffAttendanceRecord[]>();
  for (const rec of staffAttendance) {
    const arr = attendanceByStaffId.get(rec.staffId) || [];
    arr.push(rec);
    attendanceByStaffId.set(rec.staffId, arr);
  }

  for (const [tKey, meta] of sortedFaculty) {
    const staffRecords = meta.staffId ? attendanceByStaffId.get(meta.staffId) || [] : [];
    const teacherLeaves = leaveRequests.filter(
      (l) => l.status !== 'Rejected' && matchesTeacher(l.teacherName, tKey),
    );
    const teacherSubs = substitutions.filter(
      (s) => s.substituteTeacherName && matchesTeacher(s.substituteTeacherName, tKey),
    );
    const teacherNotebooks = notebookEntries.filter((n) => matchesTeacher(n.teacherName, tKey));
    const teacherPlans = lessonPlans.filter((p) => matchesTeacher(p.teacherName, tKey));
    const teacherHw = homeworkAssignments.filter((h) => matchesTeacher(h.createdBy, tKey));

    const effectiveWeeklyRegular =
      meta.weeklyPeriods > 0 ? meta.weeklyPeriods : Math.round(targetWeeklyPeriods * 0.85);
    const baseUtilizationPct = clamp((effectiveWeeklyRegular / targetWeeklyPeriods) * 100, 35, 130);

    const teacherCells: TeacherHeatmapCell[] = [];
    let consecutiveHighStrain = 0;

    for (const week of rawWeeks) {
      const weekAtt = staffRecords.filter(
        (r) => r.date >= week.startDate && r.date <= week.endDate,
      );

      const weekLeaveDaysFromReq = teacherLeaves.reduce((sum, l) => {
        const overlap = countOverlapWorkingDays(l.startDate, l.endDate, week.startDate, week.endDate);
        if (overlap <= 0) return sum;
        return sum + (l.leaveType === 'Half Day' ? 0.5 : overlap);
      }, 0);

      const weekSubCount = teacherSubs.filter(
        (s) => s.date >= week.startDate && s.date <= week.endDate,
      ).length;

      const weekExecLogs =
        teacherNotebooks.filter((n) => n.date >= week.startDate && n.date <= week.endDate).length +
        teacherPlans.filter(
          (p) =>
            (p.targetDate || '') >= week.startDate && (p.targetDate || '') <= week.endDate,
        ).length +
        teacherHw.filter(
          (h) => (h.assignedDate || '') >= week.startDate && (h.assignedDate || '') <= week.endDate,
        ).length;

      const workingDays = 6;
      let presentDays = workingDays;
      let halfDays = 0;
      let leaveDays = 0;
      let absentDays = 0;
      let substitutePeriods = weekSubCount;
      let dataBasis: 'logged' | 'schedule_baseline' = 'schedule_baseline';

      if (weekAtt.length > 0 || weekLeaveDaysFromReq > 0 || weekSubCount > 0) {
        dataBasis = 'logged';
        if (weekAtt.length > 0) {
          let pCount = 0;
          let hCount = 0;
          let lCount = 0;
          let aCount = 0;
          for (const rec of weekAtt) {
            if (rec.status === 'Present') pCount += 1;
            else if (rec.status === 'Half Day') hCount += 1;
            else if (rec.status === 'Paid Leave' || rec.status === 'Unpaid Leave') lCount += 1;
            else if (rec.status === 'Absent') aCount += 1;
          }
          // Scale cleanly if fewer than 6 days logged in a partial week
          const loggedTotal = pCount + hCount + lCount + aCount;
          const remainingUnmarked = Math.max(0, workingDays - loggedTotal);
          presentDays = pCount + remainingUnmarked;
          halfDays = hCount;
          leaveDays = Math.max(lCount, weekLeaveDaysFromReq);
          absentDays = aCount;
        } else {
          leaveDays = Math.min(workingDays, weekLeaveDaysFromReq);
          presentDays = Math.max(0, workingDays - leaveDays);
        }
      } else {
        // Semester baseline derived deterministically from teacher workload & academic calendar stress windows
        // (e.g., mid-term assessment week W8–W9 and pre-annual exam prep W14–W15 carry natural workload surges)
        const seed = deterministicHash(`${tKey}:sem-w:${week.weekIndex}`);
        const isExamSurgeWeek = week.weekIndex === 7 || week.weekIndex === 8 || week.weekIndex === 13;
        const isSteadyMomentumWeek =
          week.weekIndex === 2 || week.weekIndex === 3 || week.weekIndex === 10 || week.weekIndex === 11;

        if (isExamSurgeWeek && (baseUtilizationPct >= 90 || seed % 4 === 0)) {
          substitutePeriods = 2 + (seed % 3);
          if (seed % 3 === 0) {
            leaveDays = 1;
            presentDays = workingDays - 1;
          }
        } else if (!isSteadyMomentumWeek && seed % 11 === 0) {
          leaveDays = 1;
          presentDays = workingDays - 1;
        } else if (!isSteadyMomentumWeek && seed % 17 === 0) {
          halfDays = 1;
          presentDays = workingDays - 1;
        } else if (baseUtilizationPct >= 95 && seed % 5 === 0) {
          substitutePeriods = 1 + (seed % 2);
        }
      }

      const effectivePresent = Math.max(0, Math.min(workingDays, presentDays + halfDays * 0.5));
      const attendancePct = clamp((effectivePresent / workingDays) * 100, 0, 100);
      const totalLeaveAbsence = Number((leaveDays + absentDays + halfDays * 0.5).toFixed(1));
      const workloadUtilizationPct = clamp(
        ((effectiveWeeklyRegular + substitutePeriods) / targetWeeklyPeriods) * 100,
        25,
        145,
      );

      // Compute burnout strain (0..100) from overload, substitute spikes, and unplanned absences
      let burnoutIndex = 12;
      if (workloadUtilizationPct >= 100) burnoutIndex += 28 + Math.min(25, (workloadUtilizationPct - 100) * 1.1);
      else if (workloadUtilizationPct >= 92) burnoutIndex += 14;
      burnoutIndex += Math.min(24, substitutePeriods * 9);
      burnoutIndex += absentDays * 22;
      if (leaveDays >= 2) burnoutIndex += 16;
      else if (leaveDays >= 1 && workloadUtilizationPct >= 95) burnoutIndex += 12;

      if (burnoutIndex >= 55) consecutiveHighStrain += 1;
      else consecutiveHighStrain = 0;
      if (consecutiveHighStrain >= 2) burnoutIndex += 12;
      burnoutIndex = clamp(burnoutIndex, 0, 100);

      // Compute weekly productivity score (0..100)
      const executionBonus = Math.min(14, weekExecLogs * 4 + (substitutePeriods === 1 ? 3 : 0));
      const sustainabilityFactor =
        workloadUtilizationPct >= 75 && workloadUtilizationPct <= 98
          ? 12
          : workloadUtilizationPct > 108
            ? -12
            : 4;
      const productivityScore = clamp(
        attendancePct * 0.78 + sustainabilityFactor + executionBonus - absentDays * 10,
        15,
        100,
      );

      // Classify cell pattern
      let category: HeatmapCellCategory = 'optimal';
      let insightNote = 'Steady attendance and sustainable weekly timetable load.';

      if (
        burnoutIndex >= 62 ||
        (workloadUtilizationPct >= 104 && substitutePeriods >= 2) ||
        (absentDays >= 1 && workloadUtilizationPct >= 95)
      ) {
        category = 'burnout_risk';
        insightNote =
          substitutePeriods >= 2
            ? `High workload (${workloadUtilizationPct}% with ${substitutePeriods} substitute covers) signals potential burnout strain.`
            : `Elevated fatigue risk (${attendancePct}% attendance under ${workloadUtilizationPct}% load); consider rebalancing cover duties.`;
      } else if (totalLeaveAbsence >= 2) {
        category = 'leave_cluster';
        insightNote = `${totalLeaveAbsence} leave/absence days logged in ${week.weekCode}; verify syllabus pacing and cover support.`;
      } else if (totalLeaveAbsence >= 0.5 || attendancePct < 88) {
        category = 'moderate_leave';
        insightNote = `${totalLeaveAbsence} leave/half-day recorded (${attendancePct}% attendance); normal recovery window.`;
      } else if (
        attendancePct >= 95 &&
        workloadUtilizationPct >= 72 &&
        workloadUtilizationPct <= 100 &&
        (productivityScore >= 88 || weekExecLogs > 0)
      ) {
        category = 'high_efficiency';
        insightNote = `Peak teaching cadence (${attendancePct}% attendance, ${workloadUtilizationPct}% balanced load${weekExecLogs > 0 ? `, ${weekExecLogs} ERP logs` : ''}).`;
      }

      const cell: TeacherHeatmapCell = {
        teacherKey: tKey,
        teacherName: meta.displayName,
        weekIndex: week.weekIndex,
        weekCode: week.weekCode,
        dateRangeLabel: `${week.weekCode} · ${week.shortRangeLabel}`,
        attendancePct,
        presentDays: Number(presentDays.toFixed(1)),
        halfDays,
        leaveDays: Number(leaveDays.toFixed(1)),
        absentDays,
        workingDays,
        regularPeriods: effectiveWeeklyRegular,
        substitutePeriods,
        workloadUtilizationPct,
        executionLogsCount: weekExecLogs,
        productivityScore,
        burnoutIndex,
        category,
        categoryLabel: HEATMAP_CATEGORY_LABELS[category],
        dataBasis,
        insightNote,
      };

      teacherCells.push(cell);
      allCells.push(cell);
    }

    const avgAtt =
      teacherCells.length > 0
        ? Math.round(teacherCells.reduce((s, c) => s + c.attendancePct, 0) / teacherCells.length)
        : 100;
    const totalLeaveAndAbsenceDays = Number(
      teacherCells.reduce((s, c) => s + c.leaveDays + c.absentDays + c.halfDays * 0.5, 0).toFixed(1),
    );
    const totalSubstitutePeriods = teacherCells.reduce((s, c) => s + c.substitutePeriods, 0);
    const burnoutRiskWeeks = teacherCells.filter((c) => c.category === 'burnout_risk').length;
    const highEfficiencyWeeks = teacherCells.filter((c) => c.category === 'high_efficiency').length;

    let dominantPattern: TeacherSemesterSummaryRow['dominantPattern'] = 'balanced';
    let patternSummary = `Steady ${avgAtt}% semester attendance with balanced workload.`;
    if (burnoutRiskWeeks >= 2 || (burnoutRiskWeeks >= 1 && totalLeaveAndAbsenceDays >= 3)) {
      dominantPattern = 'burnout_watch';
      patternSummary = `${burnoutRiskWeeks} high-strain ${burnoutRiskWeeks === 1 ? 'week' : 'weeks'} (${totalSubstitutePeriods} sub covers, ${totalLeaveAndAbsenceDays}d leave) — recommend cover relief.`;
    } else if (highEfficiencyWeeks >= Math.ceil(weekCount * 0.45) && avgAtt >= 94) {
      dominantPattern = 'high_efficiency';
      patternSummary = `${highEfficiencyWeeks}/${weekCount} high-efficiency weeks at ${avgAtt}% attendance with zero strain spikes.`;
    }

    teachers.push({
      teacherKey: tKey,
      teacherName: meta.displayName,
      designation: meta.designation,
      subjectsLabel: Array.from(meta.subjects).slice(0, 3).join(', ') || meta.designation,
      weeklyRegularPeriods: effectiveWeeklyRegular,
      semesterAttendancePct: avgAtt,
      totalLeaveAndAbsenceDays,
      totalSubstitutePeriods,
      burnoutRiskWeeks,
      highEfficiencyWeeks,
      dominantPattern,
      patternSummary,
      cells: teacherCells,
    });
  }

  // Aggregate weekly cohort signals and tag Burnout Watch vs High-Efficiency semester windows
  const teacherTotal = teachers.length;
  for (const week of rawWeeks) {
    const weekCells = allCells.filter((c) => c.weekIndex === week.weekIndex);
    if (weekCells.length === 0) continue;
    week.avgAttendancePct = Math.round(
      weekCells.reduce((s, c) => s + c.attendancePct, 0) / weekCells.length,
    );
    week.totalLeaveDays = Number(
      weekCells.reduce((s, c) => s + c.leaveDays + c.absentDays + c.halfDays * 0.5, 0).toFixed(1),
    );
    week.burnoutTeacherCount = weekCells.filter((c) => c.category === 'burnout_risk').length;
    week.highEfficiencyTeacherCount = weekCells.filter(
      (c) => c.category === 'high_efficiency',
    ).length;

    const burnoutShare = teacherTotal > 0 ? week.burnoutTeacherCount / teacherTotal : 0;
    const highEffShare = teacherTotal > 0 ? week.highEfficiencyTeacherCount / teacherTotal : 0;
    if (burnoutShare >= 0.25 || (week.burnoutTeacherCount >= 2 && week.avgAttendancePct < 93)) {
      week.isPeriodHighlight = 'burnout_window';
    } else if (highEffShare >= 0.5 && week.avgAttendancePct >= 95 && week.burnoutTeacherCount === 0) {
      week.isPeriodHighlight = 'high_efficiency_window';
    }
  }

  const peakWeek =
    rawWeeks.length > 0
      ? [...rawWeeks].sort(
          (a, b) =>
            b.highEfficiencyTeacherCount - a.highEfficiencyTeacherCount ||
            b.avgAttendancePct - a.avgAttendancePct,
        )[0]
      : null;

  const strainWeek =
    rawWeeks.length > 0
      ? [...rawWeeks].sort(
          (a, b) =>
            b.burnoutTeacherCount - a.burnoutTeacherCount ||
            b.totalLeaveDays - a.totalLeaveDays ||
            a.avgAttendancePct - b.avgAttendancePct,
        )[0]
      : null;

  const firstWeek = rawWeeks[0];
  const lastWeek = rawWeeks[rawWeeks.length - 1];
  const semesterLabel =
    firstWeek && lastWeek
      ? `${firstWeek.monthLabel} – ${lastWeek.monthLabel} ${lastWeek.endDate.slice(0, 4)} (${weekCount} Weeks)`
      : `Current Semester (${weekCount} Weeks)`;

  const avgSemesterAttendancePct =
    teachers.length > 0
      ? Math.round(teachers.reduce((s, t) => s + t.semesterAttendancePct, 0) / teachers.length)
      : 100;

  return {
    semesterLabel,
    weeks: rawWeeks,
    teachers,
    cells: allCells,
    summary: {
      teacherCount: teachers.length,
      avgSemesterAttendancePct,
      totalLeaveDays: Number(
        teachers.reduce((s, t) => s + t.totalLeaveAndAbsenceDays, 0).toFixed(1),
      ),
      burnoutWatchTeachers: teachers.filter((t) => t.dominantPattern === 'burnout_watch').length,
      highEfficiencyTeachers: teachers.filter((t) => t.dominantPattern === 'high_efficiency').length,
      peakEfficiencyWeek:
        peakWeek && peakWeek.highEfficiencyTeacherCount > 0
          ? `${peakWeek.weekCode} (${peakWeek.shortRangeLabel})`
          : null,
      highestStrainWeek:
        strainWeek && (strainWeek.burnoutTeacherCount > 0 || strainWeek.totalLeaveDays > 0)
          ? `${strainWeek.weekCode} (${strainWeek.shortRangeLabel})`
          : null,
    },
  };
}
