import type { TimetableSlot } from '../types';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import { teacherMatchesSlot } from './academicOperationsEngine.ts';
import { computeAdmissionCrmSummary } from './admissionCrmEngine.ts';
import { computeComplaintStats } from './complaintEngine.ts';

export interface ManagementAlert {
  id: string;
  severity: 'High' | 'Attention' | 'Info';
  title: string;
  why: string;
  recommendedAction: string;
  targetTab: WorkspaceTab;
}

export interface TeacherTodayDigest {
  dayLabel: string;
  teacherSlots: TimetableSlot[];
  pendingDevelopmentReviews: number;
  notebookCountTodayOrTotal: number;
  studentsNeedingSupport: Array<{
    studentId: string;
    studentName: string;
    classSection: string;
    reason: string;
  }>;
}

export interface SchoolSetupStep {
  id: string;
  label: string;
  completed: boolean;
  detail: string;
  targetTab: WorkspaceTab;
}

export interface SchoolSetupChecklist {
  completedCount: number;
  totalCount: number;
  completionPct: number;
  steps: SchoolSetupStep[];
}

/**
 * Pure Teacher "Today" digest summarizing timetable periods, Work Quality C reviews,
 * and students needing follow-up. Never modifies OLQ/Learners Score calculations.
 */
export function computeTeacherTodayDigest(
  data: WorkspaceData,
  dayLabel = 'Monday',
): TeacherTodayDigest {
  const matchingSlots = data.timetable.filter(
    (slot) =>
      slot.day.toLowerCase() === dayLabel.toLowerCase() &&
      (teacherMatchesSlot(slot.teacherName, data.user.name) ||
        (slot.substitutionTeacher
          ? teacherMatchesSlot(slot.substitutionTeacher, data.user.name)
          : false)),
  );

  const teacherSlots =
    matchingSlots.length > 0
      ? matchingSlots.sort((a, b) => a.period - b.period)
      : data.timetable
          .filter((slot) => slot.day.toLowerCase() === dayLabel.toLowerCase())
          .sort((a, b) => a.period - b.period)
          .slice(0, 4);

  const pendingReviews = (data.developmentReviews || []).filter((r) => r.status === 'Pending');
  const pendingByStudent = new Set(pendingReviews.map((r) => r.studentId));

  const studentsNeedingSupport: TeacherTodayDigest['studentsNeedingSupport'] = [];
  for (const st of data.students) {
    const reasons: string[] = [];
    if (pendingByStudent.has(st.id)) {
      reasons.push('Work Quality C review pending');
    }
    const lowExam = data.examMarks.find(
      (m) => m.studentId === st.id && m.maxMarks > 0 && (m.obtainedMarks / m.maxMarks) * 100 < 60,
    );
    if (lowExam) {
      reasons.push(`${lowExam.subject} (${Math.round((lowExam.obtainedMarks / lowExam.maxMarks) * 100)}%)`);
    }
    if (st.attendancePct < 85) {
      reasons.push(`Attendance ${st.attendancePct}%`);
    }
    if (reasons.length > 0) {
      studentsNeedingSupport.push({
        studentId: st.id,
        studentName: st.name,
        classSection: st.classSection,
        reason: reasons.slice(0, 2).join(' · '),
      });
    }
  }

  return {
    dayLabel,
    teacherSlots,
    pendingDevelopmentReviews: pendingReviews.length,
    notebookCountTodayOrTotal: data.notebookEntries.length,
    studentsNeedingSupport: studentsNeedingSupport.slice(0, 4),
  };
}

/**
 * Transparent rule-based Management Intelligence & Family Engagement alerts.
 * Every alert states explicitly WHY it appeared and WHAT action staff should take.
 */
export function computeManagementAlerts(
  data: WorkspaceData,
  referenceDate = '2026-11-15',
): ManagementAlert[] {
  const alerts: ManagementAlert[] = [];

  const complaintStats = computeComplaintStats(data.parentComplaints || []);
  if (complaintStats.safeguardingCount > 0) {
    alerts.push({
      id: 'alert-safeguarding-complaints',
      severity: 'High',
      title: `${complaintStats.safeguardingCount} Safeguarding / Urgent Parent Escalation Open`,
      why: 'Safety or bullying-related parent complaints require immediate Coordinator or Principal review.',
      recommendedAction: 'Assign coordinator, log investigation progress, and share parent resolution.',
      targetTab: 'operations',
    });
  } else if (complaintStats.unassignedCount > 0) {
    alerts.push({
      id: 'alert-unassigned-complaints',
      severity: 'Attention',
      title: `${complaintStats.unassignedCount} Unassigned Parent Complaint(s)`,
      why: 'Submitted family concerns have not yet been assigned an investigating coordinator.',
      recommendedAction: 'Open Parent Complaint Desk and assign an owner.',
      targetTab: 'operations',
    });
  }

  const pendingReviews = (data.developmentReviews || []).filter((r) => r.status === 'Pending');
  if (pendingReviews.length > 0) {
    alerts.push({
      id: 'alert-dev-reviews',
      severity: 'Attention',
      title: `${pendingReviews.length} Notebook Work Quality C Review(s) Pending`,
      why: 'Flagged notebook checks require gentle one-on-one verification before drawing conclusions.',
      recommendedAction: 'Verify independent understanding and confirm or withdraw in Student 360°.',
      targetTab: 'students',
    });
  }

  const admissionStats = computeAdmissionCrmSummary(
    data.admissionLeads || [],
    data.homeVisitRecords || [],
    referenceDate,
  );
  if (admissionStats.followUpsDueCount > 0 || admissionStats.scheduledHomeVisits > 0) {
    alerts.push({
      id: 'alert-admissions-visits',
      severity: admissionStats.followUpsDueCount > 0 ? 'High' : 'Attention',
      title: `${admissionStats.followUpsDueCount} Overdue Follow-ups · ${admissionStats.scheduledHomeVisits} Scheduled Home Visits`,
      why: 'Pending admission follow-ups and home visits directly impact parent trust and conversion.',
      recommendedAction: 'Review Admission CRM follow-up queue and update visit outcomes.',
      targetTab: 'admissions',
    });
  }

  const pendingApprovals = data.students.filter((s) => s.reportApprovalStatus !== 'Approved');
  if (pendingApprovals.length > 0) {
    alerts.push({
      id: 'alert-report-approvals',
      severity: 'Info',
      title: `${pendingApprovals.length} Student 360° Report(s) Awaiting Approval`,
      why: 'Academic Coordinator or Principal approval is required before releasing full reports.',
      recommendedAction: 'Review evidence coverage and approve pending 360° reports below.',
      targetTab: 'overview',
    });
  }

  const lowAttendance = data.students.filter((s) => s.attendancePct < 85);
  if (lowAttendance.length > 0) {
    alerts.push({
      id: 'alert-attendance-context',
      severity: 'Attention',
      title: `${lowAttendance.length} Student(s) Below 85% Attendance Context`,
      why: 'Consistent absence may signal transport, health, or family support needs (never penalises OLQs).',
      recommendedAction: 'Coordinate a supportive guardian call via Student 360°.',
      targetTab: 'students',
    });
  }

  return alerts;
}

/**
 * Multi-tenant school setup readiness checklist for School Admin / Principal onboarding.
 */
export function computeSchoolSetupChecklist(data: WorkspaceData): SchoolSetupChecklist {
  const s = data.activeSchool;
  const steps: SchoolSetupStep[] = [
    {
      id: 'setup-profile',
      label: 'Institution Profile, UDISE+ & Haryana MIS Linked',
      completed: Boolean(s.udiseCode?.trim() && s.haryanaMisCode?.trim()),
      detail: `${s.board} · UDISE ${s.udiseCode}`,
      targetTab: 'overview',
    },
    {
      id: 'setup-weights',
      label: 'Learners Score Formula Approved (100% Weight Audit)',
      completed: Boolean(data.weightsConfig?.version && data.weightsConfig?.approvedBy),
      detail: `${data.weightsConfig.version} approved by ${data.weightsConfig.approvedBy}`,
      targetTab: 'operations',
    },
    {
      id: 'setup-timetable',
      label: 'Classes, Timetable & Lesson Plans Configured',
      completed: data.timetable.length > 0 && data.lessonPlans.length > 0,
      detail: `${data.timetable.length} timetable periods · ${data.lessonPlans.length} plans`,
      targetTab: 'academics',
    },
    {
      id: 'setup-resources',
      label: 'Approved Academic Resource Bank Published',
      completed: data.resources.some((r) => r.status === 'Approved'),
      detail: `${data.resources.filter((r) => r.status === 'Approved').length} approved resources`,
      targetTab: 'academics',
    },
    {
      id: 'setup-admissions',
      label: 'Admission CRM & Home Visit Tracking Active',
      completed: data.admissionLeads.length > 0 && data.homeVisitRecords.length > 0,
      detail: `${data.admissionLeads.length} leads · ${data.homeVisitRecords.length} visits`,
      targetTab: 'admissions',
    },
    {
      id: 'setup-fees',
      label: 'Fee Structure & Complaint Desk Operational',
      completed: data.feeTransactions.length > 0 && (data.parentComplaints?.length ?? 0) > 0,
      detail: `${data.feeTransactions.length} fee ledgers · ${(data.parentComplaints || []).length} complaint records`,
      targetTab: 'operations',
    },
  ];

  const completedCount = steps.filter((st) => st.completed).length;
  const totalCount = steps.length;
  return {
    completedCount,
    totalCount,
    completionPct: Math.round((completedCount / totalCount) * 100),
    steps,
  };
}
