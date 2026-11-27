import type { WorkspaceData } from '../types/workspace';
import {
  computeTeacherProductivityReport,
  createDefaultProductivityKpiConfig,
} from './teacherProductivityEngine';
import {
  compareClassSections,
  summarizeMonthlyAttendanceByMonth,
} from './visAcademicProgressEngine';

export interface AttendanceTrendPoint {
  label: string;
  monthKey: string;
  studentAttendancePct: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  workingDays: number;
  targetPct: number;
}

export interface ClassAttendancePoint {
  classSection: string;
  studentCount: number;
  attendancePct: number;
  absentPct: number;
  leavePct: number;
}

export interface TeacherProductivityChartPoint {
  teacherName: string;
  shortName: string;
  subjectsLabel: string;
  workloadUtilizationPct: number;
  contextualIndex: number;
  notebookCompletePct: number;
  homeworkGradedPct: number;
  weeklyRegularPeriods: number;
  substitutePeriodsCovered: number;
  lessonPlansCount: number;
  notebookEntriesLogged: number;
}

export interface AssessmentCompletionStreamPoint {
  id: string;
  stream: string;
  shortLabel: string;
  completedStudents: number;
  pendingStudents: number;
  totalStudents: number;
  completionRatePct: number;
  targetTab: 'assessments' | 'marks_report_card' | 'thinking' | 'cognitive_profile' | 'computer_skills' | 'notebook';
}

export interface ClassAssessmentCompletionPoint {
  classSection: string;
  studentCount: number;
  avgCompletionPct: number;
  readingPct: number;
  numeracyPct: number;
  examMarksPct: number;
}

export interface AdminAnalyticsBundle {
  availableClasses: string[];
  selectedClass: string;
  scopedStudentCount: number;
  // KPI summaries
  avgSchoolAttendancePct: number;
  latestMonthLabel: string;
  latestMonthAttendancePct: number;
  attendanceDeltaPct: number | null;
  staffAttendancePct: number | null;
  avgTeacherProductivityIndex: number;
  avgTeacherWorkloadPct: number;
  trackedTeacherCount: number;
  totalSubstitutionsCovered: number;
  overallAssessmentCompletionPct: number;
  completedAssessmentsCount: number;
  // Series data
  monthlyAttendanceSeries: AttendanceTrendPoint[];
  classAttendanceSeries: ClassAttendancePoint[];
  teacherProductivitySeries: TeacherProductivityChartPoint[];
  assessmentCompletionSeries: AssessmentCompletionStreamPoint[];
  classAssessmentSeries: ClassAssessmentCompletionPoint[];
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function shortenTeacherName(fullName: string): string {
  const clean = fullName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return clean.slice(0, 14);
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || '';
  return `${first} ${lastInitial}.`;
}

export function buildAdminAnalyticsBundle(
  data: WorkspaceData,
  selectedClass: string = 'ALL',
): AdminAnalyticsBundle {
  const allStudents = data.students || [];
  const availableClasses = Array.from(
    new Set(allStudents.map((s) => s.classSection).filter(Boolean)),
  ).sort(compareClassSections);

  const effectiveClass =
    selectedClass !== 'ALL' && availableClasses.includes(selectedClass)
      ? selectedClass
      : 'ALL';

  const scopedStudents =
    effectiveClass === 'ALL'
      ? allStudents
      : allStudents.filter((s) => s.classSection === effectiveClass);
  const scopedStudentIds = new Set(scopedStudents.map((s) => s.id));
  const scopedStudentCount = scopedStudents.length;

  // 1. School Attendance Trends (Monthly + Per-Class)
  const monthlyAgg = summarizeMonthlyAttendanceByMonth(
    data.monthlyAttendance || [],
    effectiveClass === 'ALL' ? undefined : scopedStudentIds,
  );

  const monthlyAttendanceSeries: AttendanceTrendPoint[] = monthlyAgg.map((m) => ({
    label: m.month.slice(0, 3),
    monthKey: `${m.month} ${m.year}`,
    studentAttendancePct: m.attendancePct,
    presentDays: m.totalPresentDays,
    absentDays: m.totalAbsentDays,
    leaveDays: m.totalLeaveDays,
    workingDays: m.workingDays,
    targetPct: 90,
  }));

  // Fallback to daily attendance records grouped by date if monthlyAttendance is empty
  if (monthlyAttendanceSeries.length === 0 && (data.attendance || []).length > 0) {
    const byDate = new Map<string, { present: number; absent: number; leave: number; total: number }>();
    for (const rec of data.attendance || []) {
      if (effectiveClass !== 'ALL' && !scopedStudentIds.has(rec.studentId)) continue;
      const cur = byDate.get(rec.date) || { present: 0, absent: 0, leave: 0, total: 0 };
      cur.total += 1;
      if (rec.status === 'Present') cur.present += 1;
      else if (rec.status === 'Absent') cur.absent += 1;
      else cur.leave += 1;
      byDate.set(rec.date, cur);
    }
    const sortedDates = Array.from(byDate.keys()).sort().slice(-10);
    for (const d of sortedDates) {
      const stat = byDate.get(d)!;
      monthlyAttendanceSeries.push({
        label: d.slice(5),
        monthKey: d,
        studentAttendancePct: stat.total > 0 ? round1((stat.present / stat.total) * 100) : 0,
        presentDays: stat.present,
        absentDays: stat.absent,
        leaveDays: stat.leave,
        workingDays: 1,
        targetPct: 90,
      });
    }
  }

  const avgSchoolAttendancePct =
    monthlyAttendanceSeries.length > 0
      ? round1(
          monthlyAttendanceSeries.reduce((s, p) => s + p.studentAttendancePct, 0) /
            monthlyAttendanceSeries.length,
        )
      : 0;

  const latestPoint = monthlyAttendanceSeries[monthlyAttendanceSeries.length - 1] || null;
  const prevPoint =
    monthlyAttendanceSeries.length >= 2
      ? monthlyAttendanceSeries[monthlyAttendanceSeries.length - 2]
      : null;

  const latestMonthLabel = latestPoint ? latestPoint.monthKey : 'No Data';
  const latestMonthAttendancePct = latestPoint ? latestPoint.studentAttendancePct : 0;
  const attendanceDeltaPct =
    latestPoint && prevPoint
      ? round1(latestPoint.studentAttendancePct - prevPoint.studentAttendancePct)
      : null;

  // Staff attendance percentage (when available to leadership)
  const staffSalaryRows = data.staffSalarySummaries || [];
  const staffAttendancePct =
    staffSalaryRows.length > 0
      ? round1(
          staffSalaryRows.reduce((s, r) => s + r.attendancePct, 0) / staffSalaryRows.length,
        )
      : null;

  // Class-by-class attendance comparison
  const classAttendanceSeries: ClassAttendancePoint[] = availableClasses.map((cls) => {
    const clsStudents = allStudents.filter((s) => s.classSection === cls);
    const clsIds = new Set(clsStudents.map((s) => s.id));
    const clsMonthly = (data.monthlyAttendance || []).filter((m) => clsIds.has(m.studentId));
    const totalWorking = clsMonthly.reduce((s, m) => s + m.workingDays, 0);
    const totalPresent = clsMonthly.reduce((s, m) => s + m.presentDays, 0);
    const totalAbsent = clsMonthly.reduce((s, m) => s + m.absentDays, 0);
    const totalLeave = clsMonthly.reduce((s, m) => s + m.leaveDays, 0);

    if (totalWorking > 0) {
      return {
        classSection: cls,
        studentCount: clsStudents.length,
        attendancePct: round1((totalPresent / totalWorking) * 100),
        absentPct: round1((totalAbsent / totalWorking) * 100),
        leavePct: round1((totalLeave / totalWorking) * 100),
      };
    }

    const clsDaily = (data.attendance || []).filter((a) => clsIds.has(a.studentId));
    const dailyTotal = clsDaily.length;
    const dPresent = clsDaily.filter((a) => a.status === 'Present').length;
    const dAbsent = clsDaily.filter((a) => a.status === 'Absent').length;
    const dLeave = clsDaily.filter((a) => a.status === 'Leave').length;
    return {
      classSection: cls,
      studentCount: clsStudents.length,
      attendancePct: dailyTotal > 0 ? round1((dPresent / dailyTotal) * 100) : 0,
      absentPct: dailyTotal > 0 ? round1((dAbsent / dailyTotal) * 100) : 0,
      leavePct: dailyTotal > 0 ? round1((dLeave / dailyTotal) * 100) : 0,
    };
  });

  // 2. Teacher Productivity Ratios (using live teacherProductivityEngine)
  const additionalTeacherNames = [
    ...(data.teacherLeaveBalances || []).map((b) => b.teacherName),
    ...(data.teacherCapabilityProfiles || []).map((c) => c.teacherName),
  ];

  const prodReport = computeTeacherProductivityReport({
    timetable: data.timetable || [],
    substitutions: data.substitutionAssignments || [],
    leaveRequests: data.teacherLeaveRequests || [],
    lessonPlans: data.lessonPlans || [],
    notebookEntries: data.notebookEntries || [],
    homeworkAssignments: data.homeworkAssignments || [],
    homeworkSubmissions: data.homeworkSubmissions || [],
    remedialAssignments: data.remedialAssignments || [],
    examMarks: data.examMarks || [],
    attendanceNotifications: data.attendanceNotifications || [],
    notebookNotifications: data.notebookNotifications || [],
    homeVisits: data.homeVisitRecords || [],
    config:
      data.productivityKpiConfig ||
      createDefaultProductivityKpiConfig(data.activeSchool.id),
    additionalTeacherNames,
  });

  const filteredProdRows =
    effectiveClass === 'ALL'
      ? prodReport.rows
      : prodReport.rows.filter(
          (r) => r.classes.length === 0 || r.classes.includes(effectiveClass),
        );

  const teacherProductivitySeries: TeacherProductivityChartPoint[] = filteredProdRows.map((row) => ({
    teacherName: row.teacherName,
    shortName: shortenTeacherName(row.teacherName),
    subjectsLabel: row.subjects.slice(0, 2).join(', ') || 'General Faculty',
    workloadUtilizationPct: row.workloadUtilizationPct,
    contextualIndex: row.contextualSummaryIndex,
    notebookCompletePct: row.notebookCompleteRatePct ?? 0,
    homeworkGradedPct: row.homeworkGradedRatePct ?? 0,
    weeklyRegularPeriods: row.weeklyRegularPeriods,
    substitutePeriodsCovered: row.substitutePeriodsCovered,
    lessonPlansCount: row.lessonPlansCount,
    notebookEntriesLogged: row.notebookEntriesLogged,
  }));

  const trackedTeacherCount = teacherProductivitySeries.length;
  const avgTeacherProductivityIndex =
    trackedTeacherCount > 0
      ? round1(
          teacherProductivitySeries.reduce((s, t) => s + t.contextualIndex, 0) /
            trackedTeacherCount,
        )
      : 0;
  const avgTeacherWorkloadPct =
    trackedTeacherCount > 0
      ? round1(
          teacherProductivitySeries.reduce((s, t) => s + t.workloadUtilizationPct, 0) /
            trackedTeacherCount,
        )
      : 0;
  const totalSubstitutionsCovered = teacherProductivitySeries.reduce(
    (s, t) => s + t.substitutePeriodsCovered,
    0,
  );

  // 3. Student Assessment Completion Rates (across 6 live academic & skill streams)
  const countDistinctScoped = (ids: Array<string | undefined>): number => {
    const matched = new Set<string>();
    for (const id of ids) {
      if (id && scopedStudentIds.has(id)) matched.add(id);
    }
    return matched.size;
  };

  const readingCompleted = countDistinctScoped([
    ...(data.readingReports || []).map((r) => r.studentId),
    ...(data.readingTestSessions || []).map((r) => r.studentId),
  ]);
  const numeracyCompleted = countDistinctScoped([
    ...(data.numeracyReports || []).map((r) => r.studentId),
    ...(data.numeracyTestSessions || []).map((r) => r.studentId),
  ]);
  const examCompleted = countDistinctScoped((data.examMarks || []).map((m) => m.studentId));
  const thinkingCompleted = countDistinctScoped(
    (data.thinkingAssessments || [])
      .filter((t) => t.status === 'submitted' || t.status === 'counsellor_reviewed')
      .map((t) => t.studentId),
  );
  const cognitiveCompleted = countDistinctScoped([
    ...(data.vcipAttempts || []).map((v) => v.studentId),
    ...(data.cognitiveAttempts || []).map((c) => c.studentId),
  ]);
  const computerCompleted = countDistinctScoped(
    (data.computerSkillAttempts || []).map((c) => c.studentId),
  );
  const notebookCompleted = countDistinctScoped(
    (data.notebookEntries || [])
      .filter((n) => n.checked)
      .map((n) => n.studentId),
  );

  const makeStream = (
    id: string,
    stream: string,
    shortLabel: string,
    completed: number,
    targetTab: AssessmentCompletionStreamPoint['targetTab'],
  ): AssessmentCompletionStreamPoint => {
    const safeCompleted = Math.min(scopedStudentCount, completed);
    const pending = Math.max(0, scopedStudentCount - safeCompleted);
    const pct = scopedStudentCount > 0 ? round1((safeCompleted / scopedStudentCount) * 100) : 0;
    return {
      id,
      stream,
      shortLabel,
      completedStudents: safeCompleted,
      pendingStudents: pending,
      totalStudents: scopedStudentCount,
      completionRatePct: pct,
      targetTab,
    };
  };

  const assessmentCompletionSeries: AssessmentCompletionStreamPoint[] = [
    makeStream('exam', 'Term Exam Marks', 'Exams', examCompleted, 'marks_report_card'),
    makeStream('reading', 'Reading Fluency Lab', 'Reading', readingCompleted, 'assessments'),
    makeStream('numeracy', 'Numeracy Lab', 'Numeracy', numeracyCompleted, 'assessments'),
    makeStream('notebook', 'Notebook Submissions', 'Notebooks', notebookCompleted, 'notebook'),
    makeStream('cognitive', 'Cognitive Profile (VCIP)', 'Cognitive', cognitiveCompleted, 'cognitive_profile'),
    makeStream('thinking', 'Thinking & OLQ Tests', 'Thinking', thinkingCompleted, 'thinking'),
    makeStream('computer', 'Computer Skills Test', 'IT Skills', computerCompleted, 'computer_skills'),
  ];

  const overallAssessmentCompletionPct =
    assessmentCompletionSeries.length > 0
      ? round1(
          assessmentCompletionSeries.reduce((s, a) => s + a.completionRatePct, 0) /
            assessmentCompletionSeries.length,
        )
      : 0;

  const completedAssessmentsCount = assessmentCompletionSeries.reduce(
    (s, a) => s + a.completedStudents,
    0,
  );

  // Per-class assessment completion breakdown
  const classAssessmentSeries: ClassAssessmentCompletionPoint[] = availableClasses.map((cls) => {
    const clsStudents = allStudents.filter((s) => s.classSection === cls);
    const clsIds = new Set(clsStudents.map((s) => s.id));
    const countCls = (ids: Array<string | undefined>) => {
      const set = new Set<string>();
      for (const id of ids) {
        if (id && clsIds.has(id)) set.add(id);
      }
      return set.size;
    };
    const total = clsStudents.length;
    const rPct =
      total > 0
        ? round1(
            (countCls([
              ...(data.readingReports || []).map((r) => r.studentId),
              ...(data.readingTestSessions || []).map((r) => r.studentId),
            ]) /
              total) *
              100,
          )
        : 0;
    const nPct =
      total > 0
        ? round1(
            (countCls([
              ...(data.numeracyReports || []).map((r) => r.studentId),
              ...(data.numeracyTestSessions || []).map((r) => r.studentId),
            ]) /
              total) *
              100,
          )
        : 0;
    const ePct =
      total > 0
        ? round1((countCls((data.examMarks || []).map((m) => m.studentId)) / total) * 100)
        : 0;
    return {
      classSection: cls,
      studentCount: total,
      readingPct: rPct,
      numeracyPct: nPct,
      examMarksPct: ePct,
      avgCompletionPct: round1((rPct + nPct + ePct) / 3),
    };
  });

  return {
    availableClasses,
    selectedClass: effectiveClass,
    scopedStudentCount,
    avgSchoolAttendancePct,
    latestMonthLabel,
    latestMonthAttendancePct,
    attendanceDeltaPct,
    staffAttendancePct,
    avgTeacherProductivityIndex,
    avgTeacherWorkloadPct,
    trackedTeacherCount,
    totalSubstitutionsCovered,
    overallAssessmentCompletionPct,
    completedAssessmentsCount,
    monthlyAttendanceSeries,
    classAttendanceSeries,
    teacherProductivitySeries,
    assessmentCompletionSeries,
    classAssessmentSeries,
  };
}
