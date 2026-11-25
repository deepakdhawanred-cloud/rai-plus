import type {
  DevelopmentalRemedialAssignment,
  ExamMark,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeVisitRecord,
  LessonPlan,
  NotebookEntry,
  NotebookIncompleteNotification,
  ParentAttendanceNotification,
  SubstitutionAssignmentRecord,
  TeacherLeaveRequest,
  TeacherProductivityKpiConfig,
  TimetableSlot,
} from '../types';
import { normalizeTeacherKey, splitSlotTeachers } from './smartTimetableEngine.ts';

export function createDefaultProductivityKpiConfig(schoolId: string): TeacherProductivityKpiConfig {
  return {
    schoolId,
    weights: {
      teachingWorkload: 30,
      academicExecution: 45,
      operationalEngagement: 25,
    },
    targetWeeklyPeriods: 28,
    targetNotebookChecksMonthly: 12,
    targetLessonPlansMonthly: 2,
    updatedBy: 'Principal Office',
    updatedAt: '2026-11-19',
  };
}

export interface ContextualTeacherProductivityRow {
  teacherKey: string;
  teacherName: string;
  subjects: string[];
  classes: string[];
  // 1. Teaching Workload
  weeklyRegularPeriods: number;
  substitutePeriodsCovered: number;
  leaveDaysApproved: number;
  workloadUtilizationPct: number;
  // 2. Academic Execution (linked to live school records)
  lessonPlansCount: number;
  syllabusApprovedPlansCount: number;
  notebookEntriesLogged: number;
  notebookCompleteRatePct: number | null;
  homeworkAssignedCount: number;
  homeworkGradedRatePct: number | null;
  remedialsAssignedCount: number;
  examMarksRecordedCount: number;
  // 3. Operational Engagement
  parentNotificationsTriggered: number;
  homeVisitsConducted: number;
  // 4. Balanced Contextual Band (NEVER a punitive leaderboard rank)
  contextualSummaryIndex: number; // 0-100 informational index normalized by role workload
  supportContextNote: string;
}

export interface SchoolProductivityReport {
  generatedAt: string;
  schoolTeacherCount: number;
  totalRegularPeriods: number;
  totalSubstitutionsCovered: number;
  totalNotebookChecks: number;
  totalLessonPlans: number;
  totalRemedialsAssigned: number;
  rows: ContextualTeacherProductivityRow[];
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function computeTeacherProductivityReport(params: {
  timetable: TimetableSlot[];
  substitutions: SubstitutionAssignmentRecord[];
  leaveRequests: TeacherLeaveRequest[];
  lessonPlans: LessonPlan[];
  notebookEntries: NotebookEntry[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  remedialAssignments: DevelopmentalRemedialAssignment[];
  examMarks: ExamMark[];
  attendanceNotifications: ParentAttendanceNotification[];
  notebookNotifications: NotebookIncompleteNotification[];
  homeVisits: HomeVisitRecord[];
  config: TeacherProductivityKpiConfig;
  additionalTeacherNames?: string[];
}): SchoolProductivityReport {
  const teacherMap = new Map<
    string,
    {
      displayName: string;
      subjects: Set<string>;
      classes: Set<string>;
      weeklyPeriods: number;
    }
  >();

  const ensureTeacher = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return null;
    const key = normalizeTeacherKey(clean);
    if (!key) return null;
    let entry = teacherMap.get(key);
    if (!entry) {
      entry = { displayName: clean, subjects: new Set(), classes: new Set(), weeklyPeriods: 0 };
      teacherMap.set(key, entry);
    }
    return { key, entry };
  };

  for (const slot of params.timetable) {
    for (const raw of splitSlotTeachers(slot.teacherName)) {
      const ref = ensureTeacher(raw);
      if (!ref) continue;
      ref.entry.weeklyPeriods += 1;
      ref.entry.subjects.add(slot.subject);
      ref.entry.classes.add(slot.classSection);
    }
  }

  for (const name of params.additionalTeacherNames || []) {
    ensureTeacher(name);
  }

  const matchesTeacher = (field: string | undefined, key: string): boolean => {
    if (!field) return false;
    const norm = normalizeTeacherKey(field);
    return norm === key || norm.includes(key) || key.includes(norm);
  };

  const rows: ContextualTeacherProductivityRow[] = [];
  const totalWeight =
    Math.max(
      1,
      params.config.weights.teachingWorkload +
        params.config.weights.academicExecution +
        params.config.weights.operationalEngagement,
    );

  for (const [tKey, meta] of teacherMap.entries()) {
    const subsCovered = params.substitutions.filter(
      (s) => s.substituteTeacherName && matchesTeacher(s.substituteTeacherName, tKey),
    ).length;

    const approvedLeaves = params.leaveRequests.filter(
      (l) => l.status === 'Approved' && matchesTeacher(l.teacherName, tKey),
    );
    const leaveDaysApproved = approvedLeaves.reduce((sum, l) => {
      const start = new Date(`${l.startDate}T12:00:00Z`).getTime();
      const end = new Date(`${l.endDate}T12:00:00Z`).getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return sum + 1;
      const days = Math.max(1, Math.round((end - start) / 86400000) + 1);
      return sum + (l.leaveType === 'Half Day' ? 0.5 : days);
    }, 0);

    const myLessonPlans = params.lessonPlans.filter((lp) => matchesTeacher(lp.teacherName, tKey));
    const approvedPlans = myLessonPlans.filter(
      (lp) => lp.status === 'Completed' || !lp.approvalRequired,
    ).length;

    const myNotebooks = params.notebookEntries.filter((nb) => matchesTeacher(nb.teacherName, tKey));
    const nbCompleteCount = myNotebooks.filter((nb) => nb.checked && nb.homeworkDone).length;
    const notebookCompleteRatePct =
      myNotebooks.length > 0 ? Math.round((nbCompleteCount / myNotebooks.length) * 100) : null;

    const myHw = params.homeworkAssignments.filter((hw) => matchesTeacher(hw.createdBy, tKey));
    const myHwIds = new Set(myHw.map((h) => h.id));
    const myHwSubs = params.homeworkSubmissions.filter((s) => myHwIds.has(s.assignmentId));
    const gradedHw = myHwSubs.filter((s) => s.status !== 'Pending').length;
    const homeworkGradedRatePct =
      myHwSubs.length > 0 ? Math.round((gradedHw / myHwSubs.length) * 100) : null;

    const remedialsAssignedCount = params.remedialAssignments.filter((r) =>
      matchesTeacher(r.assignedBy, tKey),
    ).length;

    // Count exam marks in the subjects/classes taught by this teacher
    const subjLower = new Set(Array.from(meta.subjects).map((s) => s.toLowerCase()));
    const examMarksRecordedCount = params.examMarks.filter((m) =>
      subjLower.has(m.subject.toLowerCase()),
    ).length;

    const parentNotificationsTriggered =
      params.attendanceNotifications.filter((n) => matchesTeacher(n.sentBy, tKey)).length +
      params.notebookNotifications.filter((n) => matchesTeacher(n.triggeredBy, tKey)).length;

    const homeVisitsConducted = params.homeVisits.filter((v) =>
      matchesTeacher(v.visitingStaff, tKey),
    ).length;

    const workloadUtilizationPct = clamp(
      ((meta.weeklyPeriods + subsCovered) / Math.max(1, params.config.targetWeeklyPeriods)) * 100,
    );

    const nbSignal = clamp(
      (myNotebooks.length / Math.max(1, params.config.targetNotebookChecksMonthly)) * 100,
    );
    const lpSignal = clamp(
      (myLessonPlans.length / Math.max(1, params.config.targetLessonPlansMonthly)) * 100,
    );
    const academicExecScore = clamp(
      nbSignal * 0.45 +
        lpSignal * 0.3 +
        Math.min(100, (myHw.length * 25 + remedialsAssignedCount * 25 + (examMarksRecordedCount > 0 ? 50 : 0))) *
          0.25,
    );

    const operationalScore = clamp(
      Math.min(100, 45 + subsCovered * 15 + parentNotificationsTriggered * 10 + homeVisitsConducted * 15),
    );

    const contextualSummaryIndex = clamp(
      (workloadUtilizationPct * params.config.weights.teachingWorkload +
        academicExecScore * params.config.weights.academicExecution +
        operationalScore * params.config.weights.operationalEngagement) /
        totalWeight,
    );

    // Constructive, non-punitive contextual note
    let supportContextNote = 'Balanced teaching load and active documentation across assigned classes.';
    if (workloadUtilizationPct >= 100 && subsCovered >= 2) {
      supportContextNote =
        'Carrying high regular + substitute teaching load; prioritize workload balance before adding extra covers.';
    } else if (myNotebooks.length === 0 && meta.weeklyPeriods > 0) {
      supportContextNote =
        'Regular classes active; encourage logging monthly notebook checks and syllabus milestones in ERP.';
    } else if (remedialsAssignedCount > 0 && myLessonPlans.length > 0) {
      supportContextNote =
        'Strong academic execution combining structured lesson planning with proactive student remedials.';
    } else if (leaveDaysApproved >= 3) {
      supportContextNote =
        'Recent approved leave recorded — interpret monthly documentation counts in light of days present.';
    }

    rows.push({
      teacherKey: tKey,
      teacherName: meta.displayName,
      subjects: Array.from(meta.subjects).sort(),
      classes: Array.from(meta.classes).sort(),
      weeklyRegularPeriods: meta.weeklyPeriods,
      substitutePeriodsCovered: subsCovered,
      leaveDaysApproved,
      workloadUtilizationPct,
      lessonPlansCount: myLessonPlans.length,
      syllabusApprovedPlansCount: approvedPlans,
      notebookEntriesLogged: myNotebooks.length,
      notebookCompleteRatePct,
      homeworkAssignedCount: myHw.length,
      homeworkGradedRatePct,
      remedialsAssignedCount,
      examMarksRecordedCount,
      parentNotificationsTriggered,
      homeVisitsConducted,
      contextualSummaryIndex,
      supportContextNote,
    });
  }

  // Sort alphabetically by teacherName (explicitly avoiding unfair ranking leaderboards)
  rows.sort((a, b) => a.teacherName.localeCompare(b.teacherName));

  return {
    generatedAt: new Date().toISOString(),
    schoolTeacherCount: rows.length,
    totalRegularPeriods: rows.reduce((s, r) => s + r.weeklyRegularPeriods, 0),
    totalSubstitutionsCovered: rows.reduce((s, r) => s + r.substitutePeriodsCovered, 0),
    totalNotebookChecks: rows.reduce((s, r) => s + r.notebookEntriesLogged, 0),
    totalLessonPlans: rows.reduce((s, r) => s + r.lessonPlansCount, 0),
    totalRemedialsAssigned: rows.reduce((s, r) => s + r.remedialsAssignedCount, 0),
    rows,
  };
}
