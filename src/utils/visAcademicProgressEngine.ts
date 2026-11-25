import type {
  AcademicMonthKey,
  AttendanceRecord,
  ExamMark,
  MonthlyAttendanceSummary,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  ReadingBand,
  StudentRecord,
} from '../types';

export const ALL_ACADEMIC_MONTHS: readonly AcademicMonthKey[] = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
];

export const ACTIVE_SESSION_MONTHS: readonly AcademicMonthKey[] = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
];

export const MONTH_WORKING_DAYS_2026: Record<AcademicMonthKey, number> = {
  April: 22,
  May: 23,
  June: 8,
  July: 24,
  August: 22,
  September: 23,
  October: 21,
  November: 13,
  December: 21,
  January: 18,
  February: 21,
  March: 18,
};

export const TODAY_VIS_DATE = '2026-11-16';

export function resolveTodayIsoDate(): string {
  const iso = new Date().toISOString().slice(0, 10);
  // Keep deterministic local session window in November 2026
  return iso >= '2026-11-01' && iso <= '2026-11-30' ? iso : TODAY_VIS_DATE;
}

const MONTH_NUMBER_MAP: Record<number, AcademicMonthKey> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

export function dateToAcademicMonth(dateStr: string): { month: AcademicMonthKey; year: number } {
  const parts = dateStr.split('-');
  const year = Number(parts[0]) || 2026;
  const mNum = Number(parts[1]) || 11;
  return {
    month: MONTH_NUMBER_MAP[mNum] || 'November',
    year,
  };
}

export function classSectionSortKey(classSection: string): number {
  const clean = classSection.trim().toLowerCase();
  if (clean.startsWith('nur')) return 0;
  if (clean === 'lkg') return 1;
  if (clean === 'ukg') return 2;
  const m = clean.match(/^(\d{1,2})\s*[-–]?\s*(.*)$/);
  if (m) {
    const num = Number(m[1]) * 10;
    const sec = m[2] || '';
    const offset = sec.startsWith('a')
      ? 1
      : sec.startsWith('b') || sec.startsWith('c')
        ? sec.startsWith('b')
          ? 2
          : 3
        : sec.startsWith('s')
          ? 4
          : 5;
    return num + offset;
  }
  return 999;
}

export function compareClassSections(a: string, b: string): number {
  const ka = classSectionSortKey(a);
  const kb = classSectionSortKey(b);
  if (ka !== kb) return ka - kb;
  return a.localeCompare(b, undefined, { numeric: true });
}

export function computeReadingBand(overallPct: number): ReadingBand {
  if (overallPct >= 85) return 'Fluent';
  if (overallPct >= 70) return 'Proficient';
  if (overallPct >= 55) return 'Developing';
  return 'Emergent';
}

export interface DailyAttendanceStudentEntry {
  student: StudentRecord;
  record: AttendanceRecord | null;
  status: 'Present' | 'Absent' | 'Leave' | 'Unmarked';
}

export interface ClassDailyAttendanceBreakdown {
  classSection: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  unmarkedCount: number;
  presentRatePct: number;
}

export interface DailyAttendanceDashboardSummary {
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  unmarkedCount: number;
  markedCount: number;
  presentRatePct: number;
  presentStudents: DailyAttendanceStudentEntry[];
  absentStudents: DailyAttendanceStudentEntry[];
  leaveStudents: DailyAttendanceStudentEntry[];
  unmarkedStudents: StudentRecord[];
  classBreakdown: ClassDailyAttendanceBreakdown[];
}

export function summarizeDailyAttendanceDashboard(
  students: StudentRecord[],
  attendanceRecords: AttendanceRecord[],
  targetDate: string = TODAY_VIS_DATE,
): DailyAttendanceDashboardSummary {
  const recordByStudent = new Map<string, AttendanceRecord>();
  for (const rec of attendanceRecords) {
    if (rec.date !== targetDate) continue;
    // attendanceRecords is ordered newest-first; keep first seen per student
    if (!recordByStudent.has(rec.studentId)) {
      recordByStudent.set(rec.studentId, rec);
    }
  }

  const presentStudents: DailyAttendanceStudentEntry[] = [];
  const absentStudents: DailyAttendanceStudentEntry[] = [];
  const leaveStudents: DailyAttendanceStudentEntry[] = [];
  const unmarkedStudents: StudentRecord[] = [];
  const classMap = new Map<string, ClassDailyAttendanceBreakdown>();

  const sortedStudents = [...students].sort((a, b) => {
    const cmp = compareClassSections(a.classSection, b.classSection);
    if (cmp !== 0) return cmp;
    return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
  });

  for (const st of sortedStudents) {
    if (!classMap.has(st.classSection)) {
      classMap.set(st.classSection, {
        classSection: st.classSection,
        totalStudents: 0,
        presentCount: 0,
        absentCount: 0,
        leaveCount: 0,
        unmarkedCount: 0,
        presentRatePct: 0,
      });
    }
    const cls = classMap.get(st.classSection)!;
    cls.totalStudents += 1;

    const rec = recordByStudent.get(st.id) || null;
    if (!rec) {
      unmarkedStudents.push(st);
      cls.unmarkedCount += 1;
    } else if (rec.status === 'Present') {
      presentStudents.push({ student: st, record: rec, status: 'Present' });
      cls.presentCount += 1;
    } else if (rec.status === 'Absent') {
      absentStudents.push({ student: st, record: rec, status: 'Absent' });
      cls.absentCount += 1;
    } else {
      leaveStudents.push({ student: st, record: rec, status: 'Leave' });
      cls.leaveCount += 1;
    }
  }

  const classBreakdown = Array.from(classMap.values())
    .map((c) => {
      const marked = c.presentCount + c.absentCount + c.leaveCount;
      return {
        ...c,
        presentRatePct: marked > 0 ? Math.round((c.presentCount / marked) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => compareClassSections(a.classSection, b.classSection));

  const markedCount = presentStudents.length + absentStudents.length + leaveStudents.length;
  const presentRatePct =
    markedCount > 0 ? Math.round((presentStudents.length / markedCount) * 1000) / 10 : 0;

  return {
    date: targetDate,
    totalStudents: sortedStudents.length,
    presentCount: presentStudents.length,
    absentCount: absentStudents.length,
    leaveCount: leaveStudents.length,
    unmarkedCount: unmarkedStudents.length,
    markedCount,
    presentRatePct,
    presentStudents,
    absentStudents,
    leaveStudents,
    unmarkedStudents,
    classBreakdown,
  };
}

export interface MonthlySchoolAttendanceAggregate {
  month: AcademicMonthKey;
  year: number;
  studentCount: number;
  workingDays: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  attendancePct: number;
}

export function summarizeMonthlyAttendanceByMonth(
  monthlyRows: MonthlyAttendanceSummary[],
  allowedStudentIds?: Set<string>,
): MonthlySchoolAttendanceAggregate[] {
  const byMonth = new Map<AcademicMonthKey, MonthlyAttendanceSummary[]>();
  for (const row of monthlyRows) {
    if (allowedStudentIds && !allowedStudentIds.has(row.studentId)) continue;
    if (!byMonth.has(row.month)) byMonth.set(row.month, []);
    byMonth.get(row.month)!.push(row);
  }

  const out: MonthlySchoolAttendanceAggregate[] = [];
  for (const month of ACTIVE_SESSION_MONTHS) {
    const rows = byMonth.get(month) || [];
    if (rows.length === 0) continue;
    const totalPresentDays = rows.reduce((s, r) => s + r.presentDays, 0);
    const totalAbsentDays = rows.reduce((s, r) => s + r.absentDays, 0);
    const totalLeaveDays = rows.reduce((s, r) => s + r.leaveDays, 0);
    const totalWorking = rows.reduce((s, r) => s + r.workingDays, 0);
    const avgWorking = Math.round(totalWorking / rows.length);
    const attendancePct =
      totalWorking > 0 ? Math.round((totalPresentDays / totalWorking) * 1000) / 10 : 0;
    out.push({
      month,
      year: rows[0].year,
      studentCount: rows.length,
      workingDays: avgWorking,
      totalPresentDays,
      totalAbsentDays,
      totalLeaveDays,
      attendancePct,
    });
  }
  return out;
}

/**
 * Reconciles a student's MonthlyAttendanceSummary in place when an AttendanceRecord is added
 * or updated for a specific date. Never adjusts OLQ scores.
 */
export function reconcileMonthlyAttendanceAfterMark(params: {
  monthlyAttendance: MonthlyAttendanceSummary[];
  schoolId: string;
  studentId: string;
  date: string;
  prevStatus: 'Present' | 'Absent' | 'Leave' | null;
  nextStatus: 'Present' | 'Absent' | 'Leave';
}): MonthlyAttendanceSummary {
  const { monthlyAttendance, schoolId, studentId, date, prevStatus, nextStatus } = params;
  const { month, year } = dateToAcademicMonth(date);
  let row = monthlyAttendance.find(
    (m) => m.schoolId === schoolId && m.studentId === studentId && m.month === month,
  );
  if (!row) {
    const defaultWorking = MONTH_WORKING_DAYS_2026[month] || 20;
    row = {
      id: `matt-${schoolId}-${studentId}-${month.toLowerCase()}`,
      schoolId,
      studentId,
      month,
      year,
      workingDays: defaultWorking,
      presentDays: defaultWorking - 1,
      absentDays: 0,
      leaveDays: 0,
      attendancePct: 95,
    };
    monthlyAttendance.push(row);
  }

  if (prevStatus === null) {
    // New day recorded beyond initial baseline if not already counted
    if (row.presentDays + row.absentDays + row.leaveDays < row.workingDays) {
      if (nextStatus === 'Present') row.presentDays += 1;
      else if (nextStatus === 'Absent') row.absentDays += 1;
      else row.leaveDays += 1;
    } else {
      row.workingDays += 1;
      if (nextStatus === 'Present') row.presentDays += 1;
      else if (nextStatus === 'Absent') row.absentDays += 1;
      else row.leaveDays += 1;
    }
  } else if (prevStatus !== nextStatus) {
    if (prevStatus === 'Present' && row.presentDays > 0) row.presentDays -= 1;
    else if (prevStatus === 'Absent' && row.absentDays > 0) row.absentDays -= 1;
    else if (prevStatus === 'Leave' && row.leaveDays > 0) row.leaveDays -= 1;

    if (nextStatus === 'Present') row.presentDays += 1;
    else if (nextStatus === 'Absent') row.absentDays += 1;
    else row.leaveDays += 1;
  }

  row.attendancePct =
    row.workingDays > 0
      ? Math.round((row.presentDays / row.workingDays) * 1000) / 10
      : 0;
  return row;
}

export interface UtCycleSummary {
  totalMarks: number;
  studentCount: number;
  averagePct: number;
  passRatePct: number;
  belowBenchmarkCount: number;
  examNames: string[];
  subjects: string[];
}

export function summarizeUtMarks(
  students: StudentRecord[],
  examMarks: ExamMark[],
  filters?: {
    classSection?: string;
    examName?: string;
    subject?: string;
  },
): {
  summary: UtCycleSummary;
  rows: Array<{
    mark: ExamMark;
    student: StudentRecord;
    pct: number;
  }>;
} {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const examNamesSet = new Set<string>();
  const subjectsSet = new Set<string>();

  for (const m of examMarks) {
    const st = studentMap.get(m.studentId);
    if (!st) continue;
    if (
      filters?.classSection &&
      filters.classSection !== 'All' &&
      st.classSection !== filters.classSection
    ) {
      continue;
    }
    examNamesSet.add(m.examName);
    subjectsSet.add(m.subject);
  }

  const rows: Array<{ mark: ExamMark; student: StudentRecord; pct: number }> = [];
  for (const m of examMarks) {
    const st = studentMap.get(m.studentId);
    if (!st) continue;
    if (
      filters?.classSection &&
      filters.classSection !== 'All' &&
      st.classSection !== filters.classSection
    ) {
      continue;
    }
    if (filters?.examName && filters.examName !== 'All' && m.examName !== filters.examName) {
      continue;
    }
    if (filters?.subject && filters.subject !== 'All' && m.subject !== filters.subject) {
      continue;
    }
    const pct = m.maxMarks > 0 ? Math.round((m.obtainedMarks / m.maxMarks) * 1000) / 10 : 0;
    rows.push({ mark: m, student: st, pct });
  }

  rows.sort((a, b) => {
    const clsCmp = compareClassSections(a.student.classSection, b.student.classSection);
    if (clsCmp !== 0) return clsCmp;
    const rollCmp = a.student.rollNo.localeCompare(b.student.rollNo, undefined, { numeric: true });
    if (rollCmp !== 0) return rollCmp;
    return b.mark.date.localeCompare(a.mark.date);
  });

  const uniqueStudents = new Set(rows.map((r) => r.student.id));
  const avgPct =
    rows.length > 0
      ? Math.round((rows.reduce((s, r) => s + r.pct, 0) / rows.length) * 10) / 10
      : 0;
  const passed = rows.filter((r) => r.pct >= 33).length;
  const belowBenchmarkCount = rows.filter((r) => r.pct < 65).length;

  return {
    summary: {
      totalMarks: rows.length,
      studentCount: uniqueStudents.size,
      averagePct: avgPct,
      passRatePct: rows.length > 0 ? Math.round((passed / rows.length) * 1000) / 10 : 0,
      belowBenchmarkCount,
      examNames: Array.from(examNamesSet).sort(),
      subjects: Array.from(subjectsSet).sort(),
    },
    rows,
  };
}

export function summarizeMonthlyReading(
  students: StudentRecord[],
  reports: MonthlyReadingReport[],
  monthFilter: AcademicMonthKey | 'All' = 'November',
  classSectionFilter: string = 'All',
): {
  avgWpm: number;
  avgOverallPct: number;
  belowBenchmarkCount: number;
  bandCounts: Record<ReadingBand, number>;
  rows: Array<{ student: StudentRecord; report: MonthlyReadingReport }>;
} {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const bandCounts: Record<ReadingBand, number> = {
    Emergent: 0,
    Developing: 0,
    Proficient: 0,
    Fluent: 0,
  };
  const rows: Array<{ student: StudentRecord; report: MonthlyReadingReport }> = [];

  for (const r of reports) {
    const st = studentMap.get(r.studentId);
    if (!st) continue;
    if (classSectionFilter !== 'All' && st.classSection !== classSectionFilter) continue;
    if (monthFilter !== 'All' && r.month !== monthFilter) continue;
    rows.push({ student: st, report: r });
    bandCounts[r.readingBand] += 1;
  }

  rows.sort((a, b) => {
    const cmp = compareClassSections(a.student.classSection, b.student.classSection);
    if (cmp !== 0) return cmp;
    return a.student.rollNo.localeCompare(b.student.rollNo, undefined, { numeric: true });
  });

  const avgWpm =
    rows.length > 0 ? Math.round(rows.reduce((s, x) => s + x.report.wpm, 0) / rows.length) : 0;
  const avgOverallPct =
    rows.length > 0
      ? Math.round((rows.reduce((s, x) => s + x.report.overallPct, 0) / rows.length) * 10) / 10
      : 0;
  const belowBenchmarkCount = rows.filter((x) => x.report.overallPct < 65).length;

  return { avgWpm, avgOverallPct, belowBenchmarkCount, bandCounts, rows };
}

export function summarizeMonthlyNumeracy(
  students: StudentRecord[],
  reports: MonthlyNumeracyReport[],
  monthFilter: AcademicMonthKey | 'All' = 'November',
  classSectionFilter: string = 'All',
): {
  avgTablesPct: number;
  avgMentalMathPct: number;
  avgOverallPct: number;
  belowBenchmarkCount: number;
  rows: Array<{ student: StudentRecord; report: MonthlyNumeracyReport }>;
} {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const rows: Array<{ student: StudentRecord; report: MonthlyNumeracyReport }> = [];

  for (const r of reports) {
    const st = studentMap.get(r.studentId);
    if (!st) continue;
    if (classSectionFilter !== 'All' && st.classSection !== classSectionFilter) continue;
    if (monthFilter !== 'All' && r.month !== monthFilter) continue;
    rows.push({ student: st, report: r });
  }

  rows.sort((a, b) => {
    const cmp = compareClassSections(a.student.classSection, b.student.classSection);
    if (cmp !== 0) return cmp;
    return a.student.rollNo.localeCompare(b.student.rollNo, undefined, { numeric: true });
  });

  const avgTablesPct =
    rows.length > 0
      ? Math.round((rows.reduce((s, x) => s + x.report.tablesFluencyPct, 0) / rows.length) * 10) / 10
      : 0;
  const avgMentalMathPct =
    rows.length > 0
      ? Math.round((rows.reduce((s, x) => s + x.report.mentalMathPct, 0) / rows.length) * 10) / 10
      : 0;
  const avgOverallPct =
    rows.length > 0
      ? Math.round((rows.reduce((s, x) => s + x.report.overallPct, 0) / rows.length) * 10) / 10
      : 0;
  const belowBenchmarkCount = rows.filter((x) => x.report.overallPct < 65).length;

  return { avgTablesPct, avgMentalMathPct, avgOverallPct, belowBenchmarkCount, rows };
}
