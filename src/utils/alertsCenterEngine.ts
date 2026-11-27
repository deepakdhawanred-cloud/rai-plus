import type { WorkspaceData, WorkspaceTab } from '../types/workspace';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertCategory =
  | 'attendance'
  | 'finance'
  | 'academics'
  | 'campus_gate'
  | 'complaints'
  | 'staff_payroll';

export type AlertAcknowledgeSource =
  | 'attendance_notif'
  | 'notebook_notif'
  | 'absence_risk'
  | 'defaulter_log'
  | 'local';

export interface UnifiedWorkspaceAlert {
  id: string;
  title: string;
  summary: string;
  recommendedAction: string;
  category: AlertCategory;
  severity: AlertSeverity;
  timestamp: string;
  dateLabel: string;
  targetTab: WorkspaceTab;
  studentId?: string;
  entityLabel: string;
  actionLabel: string;
  isUnread: boolean;
  isResolved: boolean;
  acknowledgeSource: AlertAcknowledgeSource;
  nativeRecordId?: string;
  metaParts: string[];
}

export interface AlertCenterCounts {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
  byCategory: Record<AlertCategory, number>;
}

export interface AlertFilterOptions {
  query?: string;
  category?: AlertCategory | 'all';
  severity?: AlertSeverity | 'all';
  status?: 'active' | 'all' | 'resolved';
}

export const ALERT_CATEGORY_LABELS: Record<AlertCategory, string> = {
  attendance: 'Attendance & Risk',
  finance: 'Fees & Finance',
  academics: 'Academics & Notebooks',
  campus_gate: 'Campus & Gate',
  complaints: 'Complaints & Issues',
  staff_payroll: 'Staff & Payroll',
};

export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: 'Critical',
  warning: 'Action Needed',
  info: 'Info',
};

const SEVERITY_RANK: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

function formatShortDate(raw?: string | null): string {
  if (!raw) return 'Today';
  const trimmed = raw.trim();
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  return trimmed;
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function isOperationalStatusPending(status?: string): boolean {
  const s = (status || '').trim().toLowerCase();
  if (!s) return false;
  return (
    s.includes('pending') ||
    s.includes('open') ||
    s.includes('overdue') ||
    s.includes('delay') ||
    s.includes('urgent') ||
    s.includes('attention') ||
    s.includes('issue')
  );
}

/**
 * Pure, role-scoped alert aggregation engine that consolidates actionable alerts
 * across Attendance, Fees, Notebooks, Campus Gate, Complaints, Events, and Payroll.
 * Strictly respects RBAC and tenant/tab permissions so restricted alerts never leak.
 */
export function buildUnifiedWorkspaceAlerts(params: {
  data: WorkspaceData;
  allowedTabIds: Set<WorkspaceTab>;
  locallyAcknowledgedIds?: Set<string>;
  referenceDateIso?: string;
}): UnifiedWorkspaceAlert[] {
  const {
    data,
    allowedTabIds,
    locallyAcknowledgedIds = new Set<string>(),
    referenceDateIso = new Date().toISOString().slice(0, 10),
  } = params;

  const role = data.user.role;
  if (role === 'super_admin') return [];

  const isParent = role === 'parent';
  const isStudent = role === 'student';
  const isFamily = isParent || isStudent;
  const isAccountant = role === 'accountant';
  const isTransport = role === 'transport_incharge';
  const isLeadership = ['school_admin', 'principal', 'coordinator'].includes(role);
  const isTeacher = role === 'teacher';
  const isStaff = !isFamily;

  const visibleStudentIds = new Set(data.students.map((s) => s.id));
  const alerts: UnifiedWorkspaceAlert[] = [];

  const canSeeTab = (tab: WorkspaceTab): boolean => allowedTabIds.has(tab);

  const isLocallyAcked = (id: string): boolean => locallyAcknowledgedIds.has(id);

  // 1. Absence Target Risk Alerts (Yearly Skill Targets impacted by absences)
  if (!isAccountant && !isTransport) {
    for (const risk of data.absenceTargetRiskAlerts || []) {
      if (isFamily && !visibleStudentIds.has(risk.studentId)) continue;
      const acknowledged = isFamily
        ? risk.acknowledgedByParent || risk.status === 'Acknowledged'
        : risk.acknowledgedByManagement || risk.status === 'Acknowledged';
      const severity: AlertSeverity =
        risk.riskLevel === 'Critical Risk'
          ? 'critical'
          : risk.riskLevel === 'At Risk'
            ? 'warning'
            : 'info';
      const impactedCount = risk.impactedTargets?.length || 0;
      alerts.push({
        id: `absence-risk:${risk.id}`,
        title: `${risk.studentName} · ${risk.riskLevel} on Yearly Targets`,
        summary: isFamily ? risk.parentMessage : risk.managementMessage,
        recommendedAction: risk.catchUpAction || 'Review yearly plan and schedule catch-up support.',
        category: 'attendance',
        severity,
        timestamp: risk.triggeredAt || risk.absenceDate || referenceDateIso,
        dateLabel: formatShortDate(risk.absenceDate || risk.triggeredAt),
        targetTab: canSeeTab('students') ? 'students' : 'overview',
        studentId: risk.studentId,
        entityLabel: `${risk.studentName} · Class ${risk.classSection}`,
        actionLabel: canSeeTab('students') ? 'Open Yearly Plan' : 'View Overview',
        isUnread: !acknowledged,
        isResolved: acknowledged,
        acknowledgeSource: 'absence_risk',
        nativeRecordId: risk.id,
        metaParts: [
          `Attendance ${risk.attendancePct}%`,
          `${risk.absencesLast30Days} absences (30d)`,
          impactedCount > 0 ? `${impactedCount} targets affected` : 'Pace alert',
        ],
      });
    }
  }

  // 2. Parent / Student Daily Attendance Notifications
  if (isFamily) {
    for (const notif of data.attendanceNotifications || []) {
      if (!visibleStudentIds.has(notif.studentId)) continue;
      const acknowledged = Boolean(notif.acknowledgedByParent || notif.readByParent);
      // Skip already-read Present updates so the queue stays focused on meaningful alerts
      if (notif.attendanceStatus === 'Present' && acknowledged) continue;
      const severity: AlertSeverity =
        notif.attendanceStatus === 'Absent'
          ? 'warning'
          : notif.attendanceStatus === 'Leave'
            ? 'info'
            : 'info';
      alerts.push({
        id: `attendance-notif:${notif.id}`,
        title: notif.title || `${notif.attendanceStatus} marked for ${notif.studentName}`,
        summary: notif.messageEn,
        recommendedAction:
          notif.attendanceStatus === 'Absent'
            ? 'Acknowledge update and coordinate missed classwork with the class teacher.'
            : 'Acknowledge attendance confirmation.',
        category: 'attendance',
        severity,
        timestamp: notif.sentAt || notif.date || referenceDateIso,
        dateLabel: formatShortDate(notif.date || notif.sentAt),
        targetTab: canSeeTab('students') ? 'students' : 'overview',
        studentId: notif.studentId,
        entityLabel: `${notif.studentName} · Class ${notif.classSection}`,
        actionLabel: 'Open Attendance',
        isUnread: !acknowledged,
        isResolved: acknowledged,
        acknowledgeSource: 'attendance_notif',
        nativeRecordId: notif.id,
        metaParts: [notif.attendanceStatus, `Sent by ${notif.sentBy}`],
      });
    }
  }

  // 3. Notebook Incomplete / Chapter Backlog Notifications
  if (!isAccountant && !isTransport) {
    for (const nb of data.notebookNotifications || []) {
      if (isFamily && !visibleStudentIds.has(nb.studentId)) continue;
      const resolvedByStatus = nb.status === 'Resolved';
      const readForViewer = isStudent
        ? nb.readByStudent
        : isParent
          ? nb.readByParent
          : resolvedByStatus || isLocallyAcked(`notebook-notif:${nb.id}`);
      const isResolved = resolvedByStatus || readForViewer;
      const severity: AlertSeverity =
        (nb.chapterGap || 0) >= 2
          ? 'critical'
          : nb.notebookStatus === 'Incomplete'
            ? 'warning'
            : 'info';
      const canUseNativeAck = isFamily || isTeacher || isLeadership;
      alerts.push({
        id: `notebook-notif:${nb.id}`,
        title: nb.title || `${nb.subject} Notebook ${nb.notebookStatus} · ${nb.studentName}`,
        summary: isStudent ? nb.studentMessage || nb.messageEn : nb.messageEn,
        recommendedAction:
          nb.teacherRemarks ||
          `Complete ${nb.subject} Chapter ${nb.chapterNo || nb.chapter} and submit for verification.`,
        category: 'academics',
        severity,
        timestamp: nb.triggeredAt || nb.date || referenceDateIso,
        dateLabel: formatShortDate(nb.date || nb.triggeredAt),
        targetTab: canSeeTab('notebook')
          ? 'notebook'
          : canSeeTab('students')
            ? 'students'
            : 'overview',
        studentId: nb.studentId,
        entityLabel: `${nb.studentName} · Class ${nb.classSection}`,
        actionLabel: canSeeTab('notebook') ? 'Open Notebooks' : 'Open Student 360°',
        isUnread: !isResolved,
        isResolved,
        acknowledgeSource: canUseNativeAck && !resolvedByStatus ? 'notebook_notif' : 'local',
        nativeRecordId: nb.id,
        metaParts: [
          nb.subject,
          `Ch. ${nb.chapterNo || nb.chapter}`,
          nb.notebookStatus,
        ],
      });
    }
  }

  // 4. Development Reviews Pending (Staff Academics)
  if (isStaff && !isAccountant && !isTransport && (canSeeTab('remedials') || canSeeTab('students'))) {
    for (const rev of data.developmentReviews || []) {
      if (rev.status !== 'Pending') continue;
      const id = `dev-review:${rev.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `Development Review Pending · ${rev.studentName}`,
        summary: rev.summary,
        recommendedAction: 'Confirm or close this review with a teacher/coordinator decision note.',
        category: 'academics',
        severity: 'warning',
        timestamp: rev.createdAt || referenceDateIso,
        dateLabel: formatShortDate(rev.createdAt),
        targetTab: canSeeTab('remedials') ? 'remedials' : 'students',
        studentId: rev.studentId,
        entityLabel: `${rev.studentName} · Class ${rev.classSection}`,
        actionLabel: canSeeTab('remedials') ? 'Review in Remedials' : 'Open Student 360°',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [rev.subject, rev.chapter, `Opened by ${rev.openedBy}`],
      });
    }
  }

  // 5. Pending Report Card Approvals (Leadership only — grouped cleanly to prevent alert spam)
  if (isLeadership && canSeeTab('marks_report_card')) {
    const unapprovedStudents = data.students.filter(
      (s) => s.reportApprovalStatus && s.reportApprovalStatus !== 'Approved',
    );
    if (unapprovedStudents.length > 0) {
      const id = `report-approvals:${data.activeSchool.id}:${unapprovedStudents.length}`;
      const resolved = isLocallyAcked(id);
      const sampleNames = unapprovedStudents
        .slice(0, 3)
        .map((s) => s.name)
        .join(', ');
      alerts.push({
        id,
        title: `${unapprovedStudents.length} Student Report ${unapprovedStudents.length === 1 ? 'Card' : 'Cards'} Awaiting Approval`,
        summary: `Pending principal/admin sign-off for ${sampleNames}${unapprovedStudents.length > 3 ? ` and ${unapprovedStudents.length - 3} more` : ''}.`,
        recommendedAction: 'Review marks and release approved progress reports to parents.',
        category: 'academics',
        severity: 'info',
        timestamp: referenceDateIso,
        dateLabel: formatShortDate(referenceDateIso),
        targetTab: 'marks_report_card',
        entityLabel: `${data.activeSchool.code} · Report Cards`,
        actionLabel: 'Open Report Cards',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [`${unapprovedStudents.length} pending`, 'Sign-off queue'],
      });
    }
  }

  // 6. Fee Defaulter Notification Logs (Finance Staff + Parents for their own records)
  if (canSeeTab('finance') || isFamily) {
    for (const log of data.feeDefaulterAlertLogs || []) {
      if (isFamily && log.studentId && !visibleStudentIds.has(log.studentId)) continue;
      const acknowledged = log.status === 'Acknowledged' || Boolean(log.acknowledgedAt);
      const isResolved = isFamily ? acknowledged : acknowledged || isLocallyAcked(`defaulter-log:${log.id}`);
      const severity: AlertSeverity =
        log.riskTier === 'Critical'
          ? 'critical'
          : log.riskTier === 'High'
            ? 'warning'
            : 'info';
      alerts.push({
        id: `defaulter-log:${log.id}`,
        title: `${log.riskTier} Fee Alert · ${log.studentName}`,
        summary: `Balance due ${formatInr(log.balanceDueInr)} (Overdue till ${log.activeMonth}: ${formatInr(log.overdueTillMonthInr)}) · Status: ${log.status}.`,
        recommendedAction: isFamily
          ? 'Review fee ledger and confirm installment plan or payment with school accounts.'
          : 'Follow up on overdue installment or log payment receipt in Finance 360°.',
        category: 'finance',
        severity,
        timestamp: log.sentAt || referenceDateIso,
        dateLabel: formatShortDate(log.sentAt),
        targetTab: canSeeTab('finance') ? 'finance' : 'operations',
        studentId: log.studentId,
        entityLabel: `${log.studentName} · Class ${log.className}`,
        actionLabel: canSeeTab('finance') ? 'Open Finance 360°' : 'Open Fee Desk',
        isUnread: !isResolved,
        isResolved,
        acknowledgeSource: !acknowledged ? 'defaulter_log' : 'local',
        nativeRecordId: log.id,
        metaParts: [
          `Balance ${formatInr(log.balanceDueInr)}`,
          log.channel,
          log.status,
        ],
      });
    }
  }

  // 7. High-Priority Overdue Fee Accounts & Upcoming Reminders (Finance Staff only)
  if ((isLeadership || isAccountant) && canSeeTab('finance')) {
    const overdueHighAccounts = (data.feeAccounts || [])
      .filter((acc) => acc.balanceFeesInr > 0 && (acc.lastYearBalanceInr > 0 || acc.balanceFeesInr >= 18000))
      .sort((a, b) => b.balanceFeesInr - a.balanceFeesInr);

    if (overdueHighAccounts.length > 0) {
      const totalOverdueInr = overdueHighAccounts.reduce((sum, a) => sum + a.balanceFeesInr, 0);
      const topPreview = overdueHighAccounts
        .slice(0, 3)
        .map((a) => `${a.studentName} (${formatInr(a.balanceFeesInr)})`)
        .join(', ');
      const id = `finance-high-defaulters:${data.activeSchool.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `${overdueHighAccounts.length} High-Priority Fee Defaulter Accounts`,
        summary: `Combined outstanding ${formatInr(totalOverdueInr)} across priority ledgers including ${topPreview}.`,
        recommendedAction: 'Export defaulter PDF or review payment timelines in Finance 360°.',
        category: 'finance',
        severity: overdueHighAccounts.some((a) => a.lastYearBalanceInr > 0) ? 'critical' : 'warning',
        timestamp: referenceDateIso,
        dateLabel: formatShortDate(referenceDateIso),
        targetTab: 'finance',
        entityLabel: `${data.activeSchool.code} · Fee Ledger`,
        actionLabel: 'Open Defaulters',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [
          `${overdueHighAccounts.length} accounts`,
          `Outstanding ${formatInr(totalOverdueInr)}`,
        ],
      });
    }

    const dueReminders = (data.feeReminders || []).filter((r) => r.status !== 'Paid');
    for (const rem of dueReminders.slice(0, 6)) {
      const isOverdue = rem.dueDate < referenceDateIso;
      const id = `fee-reminder:${rem.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `${isOverdue ? 'Overdue' : 'Scheduled'} Fee Installment · ${rem.payerLabel}`,
        summary: `Expected ${formatInr(rem.expectedAmountInr)} due on ${rem.dueDate} (Total pending ${formatInr(rem.pendingBalanceInr)}).`,
        recommendedAction: 'Record receipt or send follow-up reminder from the Fee Calendar.',
        category: 'finance',
        severity: isOverdue ? 'warning' : 'info',
        timestamp: rem.dueDate || rem.createdAt || referenceDateIso,
        dateLabel: formatShortDate(rem.dueDate),
        targetTab: 'finance',
        entityLabel: `${rem.payerLabel}${rem.className ? ` · Class ${rem.className}` : ''}`,
        actionLabel: 'Open Fee Calendar',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [
          `Due ${formatInr(rem.expectedAmountInr)}`,
          rem.status,
          rem.installmentLabel || `Paid till ${rem.paidTillMonth}`,
        ],
      });
    }
  }

  // 8. Campus Gate Passes & Active Visitors
  if (canSeeTab('campus_gate')) {
    for (const pass of data.gatePasses || []) {
      if (pass.status !== 'Pending Approval') continue;
      if (isFamily && pass.studentId && !visibleStudentIds.has(pass.studentId)) continue;
      const id = `gate-pass:${pass.id}`;
      const resolved = isLocallyAcked(id);
      const subjectLabel =
        pass.subjectType === 'Student Early Exit'
          ? `${pass.studentName || 'Student'}${pass.classSection ? ` · Class ${pass.classSection}` : ''}`
          : `${pass.staffName || pass.requestedByName}`;
      alerts.push({
        id,
        title: `Gate Pass Pending Approval · ${pass.passCode}`,
        summary: `${pass.subjectType} requested by ${pass.requestedByName}: ${pass.reason}`,
        recommendedAction:
          isLeadership || isTransport
            ? 'Verify guardian/staff details and approve or reject in Campus Gate.'
            : 'Track approval status in Campus Gate.',
        category: 'campus_gate',
        severity: pass.subjectType === 'Student Early Exit' ? 'critical' : 'warning',
        timestamp: pass.createdAt || referenceDateIso,
        dateLabel: formatShortDate(pass.createdAt),
        targetTab: 'campus_gate',
        studentId: pass.studentId,
        entityLabel: subjectLabel,
        actionLabel: 'Open Gate Pass',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [pass.subjectType, `Exit ${pass.expectedExitTime}`],
      });
    }

    if (isLeadership || isTransport) {
      const onCampus = (data.visitorLogs || []).filter((v) => v.status === 'On Campus');
      if (onCampus.length > 0) {
        const id = `visitors-on-campus:${data.activeSchool.id}:${onCampus.length}`;
        const resolved = isLocallyAcked(id);
        alerts.push({
          id,
          title: `${onCampus.length} ${onCampus.length === 1 ? 'Visitor' : 'Visitors'} Currently On Campus`,
          summary: `Active campus badges: ${onCampus
            .slice(0, 3)
            .map((v) => `${v.visitorName} (${v.category})`)
            .join(', ')}${onCampus.length > 3 ? ` +${onCampus.length - 3} more` : ''}.`,
          recommendedAction: 'Ensure visitor check-out is logged upon exit at the main gate.',
          category: 'campus_gate',
          severity: 'info',
          timestamp: onCampus[0]?.checkInAt || referenceDateIso,
          dateLabel: formatShortDate(onCampus[0]?.checkInAt || referenceDateIso),
          targetTab: 'campus_gate',
          entityLabel: `${data.activeSchool.code} · Visitors Register`,
          actionLabel: 'Open Visitors Log',
          isUnread: !resolved,
          isResolved: resolved,
          acknowledgeSource: 'local',
          metaParts: [`${onCampus.length} on campus`, 'Live security desk'],
        });
      }
    }
  }

  // 9. Parent Complaints & Event Teacher Issues
  if (!isAccountant && (canSeeTab('operations') || isParent)) {
    for (const complaint of data.parentComplaints || []) {
      if (complaint.status === 'Resolved') continue;
      if (isFamily && !visibleStudentIds.has(complaint.studentId)) continue;
      const id = `complaint:${complaint.id}`;
      const resolved = isLocallyAcked(id);
      const severity: AlertSeverity =
        complaint.priority === 'Safeguarding Escalation' || complaint.priority === 'Urgent'
          ? 'critical'
          : 'warning';
      alerts.push({
        id,
        title: `${complaint.refNo} · ${complaint.title}`,
        summary: complaint.description,
        recommendedAction: isParent
          ? `Assigned to ${complaint.assignedCoordinator || 'School Coordinator'} · Track resolution updates.`
          : `Investigate and post resolution note (Assigned: ${complaint.assignedCoordinator || 'Unassigned'}).`,
        category: 'complaints',
        severity,
        timestamp: complaint.updatedAt || complaint.createdAt || referenceDateIso,
        dateLabel: formatShortDate(complaint.updatedAt || complaint.createdAt),
        targetTab: canSeeTab('operations') ? 'operations' : 'overview',
        studentId: complaint.studentId,
        entityLabel: `${complaint.studentName} · Class ${complaint.classSection}`,
        actionLabel: 'Open Complaint Desk',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [complaint.category, complaint.priority, complaint.status],
      });
    }
  }

  if (isStaff && !isAccountant && canSeeTab('events')) {
    for (const issue of data.eventTeacherIssues || []) {
      if (issue.status === 'Resolved') continue;
      const id = `event-issue:${issue.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `Event Escalation · ${issue.title}`,
        summary: issue.detail,
        recommendedAction: `Coordinate with ${issue.assignedCoordinatorName || 'Event Coordinator'} and mark resolved.`,
        category: 'complaints',
        severity: issue.severity === 'Urgent' ? 'critical' : 'warning',
        timestamp: issue.createdAt || referenceDateIso,
        dateLabel: formatShortDate(issue.createdAt),
        targetTab: 'events',
        entityLabel: `Raised by ${issue.teacherName}`,
        actionLabel: 'Open Events Desk',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [issue.entryType, issue.severity, issue.status],
      });
    }
  }

  if ((isLeadership || isTransport) && canSeeTab('operations')) {
    for (const op of data.operations || []) {
      if (!isOperationalStatusPending(op.status)) continue;
      const id = `operation:${op.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `${op.module} Operations · ${op.title}`,
        summary: op.detail,
        recommendedAction: `Follow up with ${op.ownerOrRoute || 'operations owner'} to close item.`,
        category: 'complaints',
        severity: op.status.toLowerCase().includes('urgent') ? 'critical' : 'info',
        timestamp: op.date || referenceDateIso,
        dateLabel: formatShortDate(op.date),
        targetTab: 'operations',
        entityLabel: `${op.module} · ${op.ownerOrRoute}`,
        actionLabel: 'Open Operations',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [op.module, op.status],
      });
    }
  }

  // 10. Staff Leave Requests & Payroll Sync Alerts
  if (isLeadership && canSeeTab('timetable_leave')) {
    for (const leave of data.teacherLeaveRequests || []) {
      if (leave.status !== 'Pending') continue;
      const id = `teacher-leave:${leave.id}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `Leave Approval Needed · ${leave.teacherName}`,
        summary: `${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) — ${leave.reason}`,
        recommendedAction: `Approve leave and publish ${leave.affectedSlotCount} substitute period cover${leave.affectedSlotCount === 1 ? '' : 's'}.`,
        category: 'staff_payroll',
        severity: leave.affectedSlotCount >= 4 ? 'critical' : 'warning',
        timestamp: leave.appliedAt || leave.startDate || referenceDateIso,
        dateLabel: formatShortDate(leave.startDate || leave.appliedAt),
        targetTab: 'timetable_leave',
        entityLabel: `${leave.teacherName} · ${leave.leaveType}`,
        actionLabel: 'Review Leave',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [`${leave.affectedSlotCount} periods affected`, 'Pending Approval'],
      });
    }
  }

  if (
    (isLeadership || isAccountant) &&
    canSeeTab('staff_payroll') &&
    data.staffSalaryAccessScope === 'full'
  ) {
    const pendingSync = (data.staffSalarySummaries || []).filter(
      (s) => s.payrollStatus === 'Pending Sync',
    );
    if (pendingSync.length > 0) {
      const totalNetPayable = pendingSync.reduce((sum, s) => sum + s.netPayableInr, 0);
      const monthLabel = pendingSync[0]?.monthLabel || 'Current Month';
      const id = `payroll-pending-sync:${data.activeSchool.id}:${pendingSync[0]?.monthKey || 'curr'}`;
      const resolved = isLocallyAcked(id);
      alerts.push({
        id,
        title: `${pendingSync.length} Staff Salaries Pending Payroll Sync`,
        summary: `${monthLabel} attendance-linked payroll totaling ${formatInr(totalNetPayable)} is ready for verification and sync.`,
        recommendedAction: 'Verify LOP deductions and sync payroll batch in Staff & Salary.',
        category: 'staff_payroll',
        severity: 'warning',
        timestamp: referenceDateIso,
        dateLabel: formatShortDate(referenceDateIso),
        targetTab: 'staff_payroll',
        entityLabel: `${data.activeSchool.code} · ${monthLabel} Payroll`,
        actionLabel: 'Open Salary Desk',
        isUnread: !resolved,
        isResolved: resolved,
        acknowledgeSource: 'local',
        metaParts: [`${pendingSync.length} staff`, `Net ${formatInr(totalNetPayable)}`],
      });
    }
  }

  // Deterministic sort: Active/Unread first → Critical > Warning > Info → Newest timestamp first
  alerts.sort((a, b) => {
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    if (SEVERITY_RANK[a.severity] !== SEVERITY_RANK[b.severity]) {
      return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    }
    return b.timestamp.localeCompare(a.timestamp);
  });

  return alerts;
}

export function computeAlertCenterCounts(alerts: UnifiedWorkspaceAlert[]): AlertCenterCounts {
  const byCategory: Record<AlertCategory, number> = {
    attendance: 0,
    finance: 0,
    academics: 0,
    campus_gate: 0,
    complaints: 0,
    staff_payroll: 0,
  };

  let active = 0;
  let resolved = 0;
  let critical = 0;
  let warning = 0;
  let info = 0;

  for (const item of alerts) {
    if (item.isResolved) {
      resolved += 1;
      continue;
    }
    active += 1;
    byCategory[item.category] += 1;
    if (item.severity === 'critical') critical += 1;
    else if (item.severity === 'warning') warning += 1;
    else info += 1;
  }

  return {
    total: alerts.length,
    active,
    resolved,
    critical,
    warning,
    info,
    byCategory,
  };
}

export function filterUnifiedAlerts(
  alerts: UnifiedWorkspaceAlert[],
  filters: AlertFilterOptions,
): UnifiedWorkspaceAlert[] {
  const status = filters.status || 'active';
  const category = filters.category || 'all';
  const severity = filters.severity || 'all';
  const query = (filters.query || '').trim().toLowerCase();

  return alerts.filter((alert) => {
    if (status === 'active' && alert.isResolved) return false;
    if (status === 'resolved' && !alert.isResolved) return false;
    if (category !== 'all' && alert.category !== category) return false;
    if (severity !== 'all' && alert.severity !== severity) return false;
    if (query) {
      const hay = [
        alert.title,
        alert.summary,
        alert.recommendedAction,
        alert.entityLabel,
        ALERT_CATEGORY_LABELS[alert.category],
        ...alert.metaParts,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function ackStorageKey(schoolId: string, userId: string): string {
  return `rai_plus_alerts_ack_v1:${schoolId}:${userId}`;
}

export function loadLocallyAcknowledgedAlertIds(schoolId: string, userId: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(ackStorageKey(schoolId, userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === 'string'));
  } catch {
    return new Set();
  }
}

export function saveLocallyAcknowledgedAlertIds(
  schoolId: string,
  userId: string,
  ids: Set<string>,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ackStorageKey(schoolId, userId), JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage quota errors safely
  }
}
