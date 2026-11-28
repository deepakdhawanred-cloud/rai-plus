import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import { teacherMatchesSlot } from './academicOperationsEngine.ts';
import {
  computeOnboardingProgress,
  summarizeDocumentCompliance,
} from './studentOnboardingDocsEngine.ts';
import { resolveTodayIsoDate } from './visAcademicProgressEngine.ts';

export type TodoPriority = 'critical' | 'high' | 'normal';
export type TodoSortMode = 'smart' | 'quick_wins' | 'priority';

export interface RoleTodoItem {
  id: string;
  title: string;
  detail: string;
  priority: TodoPriority;
  estimatedMinutes: number;
  category: string;
  targetTab: WorkspaceTab;
  actionLabel: string;
  countBadge?: number;
  isCustom?: boolean;
}

export interface RoleTodoDailyState {
  dateIso: string;
  completedIds: string[];
  snoozedIds: string[];
  customItems: RoleTodoItem[];
}

const PRIORITY_WEIGHT: Record<TodoPriority, number> = {
  critical: 100,
  high: 65,
  normal: 30,
};

/**
 * Builds a live, data-backed daily to-do list tailored strictly to the signed-in user's role,
 * synced with Student Document Compliance, Day-1 Onboarding, Inventory AI, Control Room,
 * Smart Calendar, and the unified Class Learning Hub.
 */
export function buildRoleOptimizedTodos(data: WorkspaceData): RoleTodoItem[] {
  const role = data.user.role;
  const todayIso = resolveTodayIsoDate();
  const items: RoleTodoItem[] = [];

  const students = data.students || [];
  const docSummary = summarizeDocumentCompliance(students, todayIso);
  const activeOnboardingStudents = students.filter(
    (s) => s.onboarding && computeOnboardingProgress(s.onboarding).derivedStatus !== 'Completed',
  );
  const day1PendingCount = activeOnboardingStudents.filter(
    (s) => s.onboarding && !computeOnboardingProgress(s.onboarding).day1Complete,
  ).length;

  const pendingReports = students.filter((s) => s.reportApprovalStatus !== 'Approved').length;
  const pendingLeaves = (data.teacherLeaveRequests || []).filter((l) => l.status === 'Pending').length;
  const pendingSubstitutions = (data.substitutionAssignments || []).filter(
    (c) => c.publishStatus === 'pending_review',
  ).length;
  const pendingGatePasses = (data.gatePasses || []).filter((g) => g.status === 'Pending Approval').length;
  const onCampusVisitors = (data.visitorLogs || []).filter((v) => v.status === 'On Campus').length;
  const pendingPayrollSync = (data.staffSalarySummaries || []).filter(
    (s) => s.payrollStatus === 'Pending Sync',
  ).length;
  const pendingComplaints = (data.parentComplaints || []).filter((c) => c.status !== 'Resolved').length;
  const openAdmissionLeads = (data.admissionLeads || []).filter((l) => !l.convertedStudentId).length;
  const todayAttendanceMarked = new Set(
    (data.attendance || []).filter((a) => a.date === todayIso).map((a) => a.studentId),
  ).size;
  const totalStudents = students.length;
  const unmarkedAttendance = Math.max(0, totalStudents - todayAttendanceMarked);

  if (role === 'principal' || role === 'school_admin') {
    if (pendingSubstitutions > 0 || pendingLeaves > 0) {
      items.push({
        id: 'lead-control-room-subs',
        title: 'Resolve live teacher absences & substitutions',
        detail: `${pendingLeaves} leave request(s) and ${pendingSubstitutions} substitution(s) need approval.`,
        priority: 'critical',
        estimatedMinutes: 4,
        category: 'Live Operations',
        targetTab: 'control_room',
        actionLabel: 'Open Control Room',
        countBadge: pendingLeaves + pendingSubstitutions,
      });
    } else {
      items.push({
        id: 'lead-control-room-pulse',
        title: 'Check School Control Room live timeline',
        detail: 'Verify current period occupancy, vacant rooms, and teacher check-ins.',
        priority: 'high',
        estimatedMinutes: 2,
        category: 'Live Operations',
        targetTab: 'control_room',
        actionLabel: 'View Live Pulse',
      });
    }

    if (docSummary.pendingStudentsCount > 0) {
      items.push({
        id: 'lead-student-documents',
        title:
          docSummary.overdueStudentsCount > 0
            ? 'Clear overdue student admission documents'
            : 'Follow up on pending student documents',
        detail: `${docSummary.pendingStudentsCount} student(s) have pending UDISE+/school docs (${docSummary.overdueStudentsCount} overdue · ${docSummary.overallCompletionPct}% complete).`,
        priority: docSummary.overdueStudentsCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 5,
        category: 'Document Compliance',
        targetTab: 'student_onboarding',
        actionLabel: 'Document Register',
        countBadge: docSummary.overdueStudentsCount > 0 ? docSummary.overdueStudentsCount : docSummary.pendingStudentsCount,
      });
    }

    if (activeOnboardingStudents.length > 0 || openAdmissionLeads > 0) {
      items.push({
        id: 'lead-day1-onboarding',
        title:
          activeOnboardingStudents.length > 0
            ? 'Monitor newly admitted students (Day-1 → Day-30)'
            : 'Onboard confirmed admissions from Day 1',
        detail:
          activeOnboardingStudents.length > 0
            ? `${activeOnboardingStudents.length} new student(s) in active onboarding (${day1PendingCount} pending Day-1 check).`
            : `${openAdmissionLeads} open admission lead(s) ready for Day-1 onboarding flow.`,
        priority: day1PendingCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 4,
        category: 'New Admissions',
        targetTab: 'student_onboarding',
        actionLabel: 'Day-1 Board',
        countBadge: activeOnboardingStudents.length > 0 ? activeOnboardingStudents.length : openAdmissionLeads,
      });
    }

    if (pendingReports > 0) {
      items.push({
        id: 'lead-approve-reports',
        title: 'Approve pending student report cards',
        detail: `${pendingReports} holistic report card(s) awaiting Principal sign-off.`,
        priority: 'high',
        estimatedMinutes: 6,
        category: 'Academics',
        targetTab: 'marks_report_card',
        actionLabel: 'Review Reports',
        countBadge: pendingReports,
      });
    }

    if (pendingPayrollSync > 0) {
      items.push({
        id: 'lead-payroll-sync',
        title: 'Review attendance-linked staff payroll',
        detail: `${pendingPayrollSync} staff salary computation(s) pending final sync.`,
        priority: 'high',
        estimatedMinutes: 5,
        category: 'Finance & HR',
        targetTab: 'staff_payroll',
        actionLabel: 'Open Payroll',
        countBadge: pendingPayrollSync,
      });
    }

    if (pendingGatePasses > 0 || onCampusVisitors > 0) {
      items.push({
        id: 'lead-gate-security',
        title: 'Monitor campus gate passes & visitors',
        detail: `${pendingGatePasses} pass approval(s) · ${onCampusVisitors} visitor(s) currently on campus.`,
        priority: pendingGatePasses > 0 ? 'critical' : 'normal',
        estimatedMinutes: 2,
        category: 'Campus Safety',
        targetTab: 'campus_gate',
        actionLabel: 'Gate Register',
        countBadge: pendingGatePasses + onCampusVisitors,
      });
    }

    items.push({
      id: 'lead-inventory-ai',
      title: 'Review AI Inventory, Procurement & Asset Alerts',
      detail: 'Check low-stock reorders, idle asset transfers, pending PRs & classroom readiness.',
      priority: 'high',
      estimatedMinutes: 4,
      category: 'Inventory & Assets',
      targetTab: 'inventory_assets',
      actionLabel: 'Inventory AI',
    });

    items.push({
      id: 'lead-syllabus-monitor',
      title: 'Audit Classes 6–12 Learning Portal in Class Learning Hub',
      detail: 'Check chapters behind BSEH schedule across sections in the unified Class Learning Hub.',
      priority: 'normal',
      estimatedMinutes: 5,
      category: 'Class Learning Hub',
      targetTab: 'academics',
      actionLabel: 'Open Learning Hub',
    });

    items.push({
      id: 'lead-timetable-optimize',
      title: 'Optimize teacher weekly timetable',
      detail: 'Drag-and-drop periods to balance back-to-back teacher workloads.',
      priority: 'normal',
      estimatedMinutes: 5,
      category: 'Timetable',
      targetTab: 'timetable_leave',
      actionLabel: 'Optimize Timetable',
    });
  } else if (role === 'coordinator') {
    items.push({
      id: 'coord-control-room',
      title: 'Monitor live classroom occupancy & substitutions',
      detail: 'Confirm all active periods have verified teachers and zero unallocated classes.',
      priority: 'critical',
      estimatedMinutes: 3,
      category: 'Live Operations',
      targetTab: 'control_room',
      actionLabel: 'Control Room',
      countBadge: pendingSubstitutions > 0 ? pendingSubstitutions : undefined,
    });
    if (activeOnboardingStudents.length > 0 || docSummary.pendingStudentsCount > 0) {
      items.push({
        id: 'coord-docs-onboarding',
        title: 'Verify pending student documents & Day-1 onboarding calls',
        detail: `${docSummary.pendingStudentsCount} student(s) with pending docs · ${activeOnboardingStudents.length} active Day-1→30 onboarding plan(s).`,
        priority: docSummary.overdueStudentsCount > 0 || day1PendingCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 5,
        category: 'Docs & Onboarding',
        targetTab: 'student_onboarding',
        actionLabel: 'Open Register',
        countBadge: docSummary.overdueStudentsCount + activeOnboardingStudents.length || docSummary.pendingStudentsCount,
      });
    }
    items.push({
      id: 'coord-timetable-drag',
      title: 'Balance faculty periods via Drag & Drop',
      detail: 'Eliminate consecutive period fatigue and cover gaps in the weekly timetable.',
      priority: 'high',
      estimatedMinutes: 5,
      category: 'Timetable',
      targetTab: 'timetable_leave',
      actionLabel: 'Timetable Grid',
    });
    items.push({
      id: 'coord-syllabus-progress',
      title: 'Track chapter progress in Class Learning Hub (6–12)',
      detail: 'Review behind-schedule subjects and teacher coverage updates in one unified hub.',
      priority: 'high',
      estimatedMinutes: 5,
      category: 'Class Learning Hub',
      targetTab: 'academics',
      actionLabel: 'Open Hub',
    });
    if (unmarkedAttendance > 0) {
      items.push({
        id: 'coord-attendance-check',
        title: 'Follow up on unmarked daily attendance',
        detail: `${unmarkedAttendance} student record(s) still unmarked for ${todayIso}.`,
        priority: 'high',
        estimatedMinutes: 3,
        category: 'Attendance',
        targetTab: 'attendance_heatmap',
        actionLabel: 'Heatmap',
        countBadge: unmarkedAttendance,
      });
    }
    items.push({
      id: 'coord-calendar-sync',
      title: 'Check Smart Academic Calendar milestones',
      detail: 'Confirm upcoming exams, assemblies, and dynamic curriculum pacing.',
      priority: 'normal',
      estimatedMinutes: 3,
      category: 'Calendar',
      targetTab: 'academic_calendar',
      actionLabel: 'Smart Calendar',
    });
  } else if (role === 'teacher') {
    const mySlots = (data.timetable || []).filter((s) =>
      teacherMatchesSlot(s.teacherName, data.user.name),
    );
    const pendingNotebooks = (data.notebookEntries || []).filter(
      (n) => n.workQuality === 'C',
    ).length;

    items.push({
      id: 'teach-roll-call',
      title: 'Complete One-Go daily class attendance',
      detail:
        unmarkedAttendance > 0
          ? `${unmarkedAttendance} student(s) pending roll call today.`
          : 'Verify today’s attendance ledger is finalized.',
      priority: unmarkedAttendance > 0 ? 'critical' : 'normal',
      estimatedMinutes: 2,
      category: 'Daily Roll Call',
      targetTab: 'today_workspace',
      actionLabel: 'Mark Attendance',
      countBadge: unmarkedAttendance > 0 ? unmarkedAttendance : undefined,
    });

    if (docSummary.pendingStudentsCount > 0) {
      items.push({
        id: 'teach-class-docs',
        title: 'Collect & verify pending documents in your classes',
        detail: `${docSummary.pendingStudentsCount} student(s) in your class scope still have pending docs (${docSummary.overdueStudentsCount} overdue).`,
        priority: docSummary.overdueStudentsCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 4,
        category: 'Class Documents',
        targetTab: 'student_onboarding',
        actionLabel: 'Check Docs',
        countBadge: docSummary.pendingStudentsCount,
      });
    }

    if (activeOnboardingStudents.length > 0) {
      items.push({
        id: 'teach-day1-monitoring',
        title: 'Log Day-1 / Week-1 settling checks for new students',
        detail: `${activeOnboardingStudents.length} newly admitted student(s) in your class require buddy, comfort & baseline checks.`,
        priority: day1PendingCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 3,
        category: 'Day-1 Onboarding',
        targetTab: 'student_onboarding',
        actionLabel: 'Day-1 Board',
        countBadge: activeOnboardingStudents.length,
      });
    }

    items.push({
      id: 'teach-learning-portal',
      title: 'Update chapter status & lesson formats in Class Learning Hub',
      detail: 'Mark completed chapters and configure Read/Watch/Lab modes for your students.',
      priority: 'high',
      estimatedMinutes: 4,
      category: 'Class Learning Hub',
      targetTab: 'academics',
      actionLabel: 'Open Hub',
    });

    items.push({
      id: 'teach-notebooks',
      title: 'Review student notebooks & homework submissions',
      detail:
        pendingNotebooks > 0
          ? `${pendingNotebooks} notebook check(s) flagged for follow-up.`
          : 'Log today’s notebook verification and push homework to families.',
      priority: pendingNotebooks > 0 ? 'high' : 'normal',
      estimatedMinutes: 6,
      category: 'Notebooks',
      targetTab: 'notebook',
      actionLabel: 'Notebook Desk',
      countBadge: pendingNotebooks > 0 ? pendingNotebooks : undefined,
    });

    items.push({
      id: 'teach-timetable-check',
      title: 'Check today’s periods & substitution alerts',
      detail: `${mySlots.length} weekly scheduled period(s) assigned to your timetable.`,
      priority: 'normal',
      estimatedMinutes: 2,
      category: 'Schedule',
      targetTab: 'control_room',
      actionLabel: 'My Live Periods',
    });

    items.push({
      id: 'teach-marks-entry',
      title: 'Update recent class test / UT marks',
      detail: 'Keep student report cards and skill progress dashboards current.',
      priority: 'normal',
      estimatedMinutes: 8,
      category: 'Assessments',
      targetTab: 'marks_report_card',
      actionLabel: 'Enter Marks',
    });
  } else if (role === 'student') {
    const linkedStudent = students[0];
    const pendingHw = (data.homeworkAssignments || []).length;

    items.push({
      id: 'stu-learning-portal-chapter',
      title: `Study today’s interactive chapter (${linkedStudent ? `Class ${linkedStudent.classSection}` : 'Class Learning Hub'})`,
      detail: 'Complete 1 concept check + interactive visual/3D model in your Class Learning Hub.',
      priority: 'critical',
      estimatedMinutes: 10,
      category: 'Class Learning Hub',
      targetTab: 'academics',
      actionLabel: 'Start Chapter',
    });

    items.push({
      id: 'stu-flashcards-streak',
      title: 'Clear due flashcards & keep study streak alive',
      detail: 'Spaced-repetition review inside Class Learning Hub boosts board exam recall.',
      priority: 'high',
      estimatedMinutes: 3,
      category: 'Revision Streak',
      targetTab: 'academics',
      actionLabel: 'Revise Now',
    });

    items.push({
      id: 'stu-brain-gym',
      title: 'Complete Daily Brain Gym challenge',
      detail: 'Sharpen reasoning, memory, and speed with today’s cognitive drill.',
      priority: 'normal',
      estimatedMinutes: 5,
      category: 'Brain Gym',
      targetTab: 'cognitive_profile',
      actionLabel: 'Play Brain Gym',
    });

    items.push({
      id: 'stu-marks-review',
      title: 'Review recent marks & upcoming exam calendar',
      detail:
        pendingHw > 0
          ? `${pendingHw} class assignment(s) active — check marks & skill targets.`
          : 'Check your holistic progress card and upcoming exam dates.',
      priority: 'normal',
      estimatedMinutes: 3,
      category: 'Progress',
      targetTab: 'marks_report_card',
      actionLabel: 'My Marks',
    });
  } else if (role === 'parent') {
    const unreadNotifs = (data.attendanceNotifications || []).filter(
      (n) => !n.acknowledgedAt,
    ).length;
    const child = students[0];

    if (unreadNotifs > 0) {
      items.push({
        id: 'par-ack-attendance',
        title: 'Acknowledge school attendance alerts',
        detail: `${unreadNotifs} unread attendance update(s) from the school.`,
        priority: 'critical',
        estimatedMinutes: 1,
        category: 'Attendance',
        targetTab: 'overview',
        actionLabel: 'Review Alert',
        countBadge: unreadNotifs,
      });
    }

    if (docSummary.pendingStudentsCount > 0) {
      items.push({
        id: 'par-pending-docs',
        title: `Submit pending school document(s) for ${child ? child.name.split(' ')[0] : 'your child'}`,
        detail: `Document profile is ${docSummary.overallCompletionPct}% complete — submit missing records at the school office.`,
        priority: docSummary.overdueStudentsCount > 0 ? 'critical' : 'high',
        estimatedMinutes: 3,
        category: 'Documents',
        targetTab: 'students',
        actionLabel: 'View Checklist',
      });
    }

    items.push({
      id: 'par-learning-progress',
      title: `Check ${child ? child.name.split(' ')[0] + '’s' : 'child’s'} Learning Hub mastery`,
      detail: 'View class syllabus progress, completed concepts, and quiz scores (read-only).',
      priority: 'high',
      estimatedMinutes: 3,
      category: 'Class Learning Hub',
      targetTab: 'academics',
      actionLabel: 'View Progress',
    });

    items.push({
      id: 'par-report-card',
      title: 'Review latest marks & skill report card',
      detail: 'Stay updated on subject performance and teacher recommendations.',
      priority: 'normal',
      estimatedMinutes: 3,
      category: 'Academics',
      targetTab: 'marks_report_card',
      actionLabel: 'Report Card',
    });

    items.push({
      id: 'par-fees-messages',
      title: 'Check fee receipts & Smart Academic Calendar',
      detail: 'Verify upcoming holidays, exams, and fee status in one click.',
      priority: 'normal',
      estimatedMinutes: 2,
      category: 'Family Desk',
      targetTab: 'academic_calendar',
      actionLabel: 'School Calendar',
    });
  } else if (role === 'accountant') {
    const overdueCount = (data.feeAccounts || []).filter((a) => a.balanceFeesInr > 0).length;
    items.push({
      id: 'acct-payroll-sync',
      title: 'Finalize attendance-linked staff salaries',
      detail: `${pendingPayrollSync} staff payroll record(s) awaiting reconciliation.`,
      priority: pendingPayrollSync > 0 ? 'critical' : 'high',
      estimatedMinutes: 8,
      category: 'Payroll',
      targetTab: 'staff_payroll',
      actionLabel: 'Staff Payroll',
      countBadge: pendingPayrollSync > 0 ? pendingPayrollSync : undefined,
    });
    items.push({
      id: 'acct-fee-followups',
      title: 'Review pending fee dues & send reminders',
      detail: `${overdueCount} family ledger account(s) carry an active balance.`,
      priority: 'high',
      estimatedMinutes: 6,
      category: 'Fee Collection',
      targetTab: 'finance',
      actionLabel: 'Finance 360°',
      countBadge: overdueCount > 0 ? overdueCount : undefined,
    });
    items.push({
      id: 'acct-inventory-procurement',
      title: 'Audit procurement POs & fixed asset valuations',
      detail: 'Approve vendor bills, consumable restock budgets, and depreciation schedules.',
      priority: 'high',
      estimatedMinutes: 5,
      category: 'Procurement & Assets',
      targetTab: 'inventory_assets',
      actionLabel: 'Inventory AI',
    });
    items.push({
      id: 'acct-daily-closing',
      title: 'Complete daily receipts & bank reconciliation',
      detail: 'Verify today’s cash/UPI/cheque receipts match ledger totals.',
      priority: 'normal',
      estimatedMinutes: 5,
      category: 'Accounting',
      targetTab: 'finance',
      actionLabel: 'Daily Closing',
    });
  } else if (role === 'transport_incharge') {
    items.push({
      id: 'trans-bus-rollcall',
      title: 'Complete morning/evening bus boarding roll call',
      detail: 'Verify live route capacity and student boarding status across all buses.',
      priority: 'critical',
      estimatedMinutes: 5,
      category: 'Transport',
      targetTab: 'transport',
      actionLabel: 'Bus Live GPS',
    });
    items.push({
      id: 'trans-gate-visitors',
      title: 'Process pending early-exit gate passes & visitors',
      detail: `${pendingGatePasses} pass(es) pending · ${onCampusVisitors} visitor(s) checked in.`,
      priority: pendingGatePasses > 0 ? 'critical' : 'high',
      estimatedMinutes: 3,
      category: 'Gate Security',
      targetTab: 'campus_gate',
      actionLabel: 'Gate & Visitors',
      countBadge: pendingGatePasses + onCampusVisitors,
    });
    items.push({
      id: 'trans-vehicle-inventory',
      title: 'Inspect transport spares, tyres & safety kits',
      detail: 'Verify first-aid boxes, fire extinguishers & vehicle spare stock levels.',
      priority: 'normal',
      estimatedMinutes: 4,
      category: 'Fleet Inventory',
      targetTab: 'inventory_assets',
      actionLabel: 'Inventory AI',
    });
  } else if (role === 'super_admin') {
    items.push({
      id: 'sa-flagship-cms',
      title: 'Review Flagship Products, SSB Bank & 2026–27 Pricing CMS',
      detail: 'Manage School Packages, SSB Academy status, Free Career Intelligence & enquiries.',
      priority: 'high',
      estimatedMinutes: 4,
      category: 'Flagship Products',
      targetTab: 'flagship_products',
      actionLabel: 'Products CMS',
    });
    items.push({
      id: 'sa-plan-allotment',
      title: 'Audit school subscription plans & feature entitlements',
      detail: `${(data.availableSchools || []).length} active school tenant(s) on the platform.`,
      priority: 'high',
      estimatedMinutes: 5,
      category: 'Platform Control',
      targetTab: 'feature_allotment',
      actionLabel: 'Plan Allotment',
    });
  } else {
    // Counsellor & Clinical Care specialists
    const pendingRemedials = (data.remedialAssignments || []).filter(
      (r) => r.status !== 'Completed',
    ).length;
    items.push({
      id: 'clin-active-cases',
      title: 'Review active student care & therapy sessions',
      detail: 'Update daily observations, speech/fluency targets, and parent practice notes.',
      priority: 'critical',
      estimatedMinutes: 8,
      category: 'Clinical Care',
      targetTab: 'clinical_care',
      actionLabel: 'Open Clinical Care',
    });
    items.push({
      id: 'clin-remedials',
      title: 'Track developmental remedial action plans',
      detail: `${pendingRemedials} active remedial assignment(s) across enrolled students.`,
      priority: 'high',
      estimatedMinutes: 5,
      category: 'Remedials',
      targetTab: 'remedials',
      actionLabel: 'Remedials',
      countBadge: pendingRemedials > 0 ? pendingRemedials : undefined,
    });
    items.push({
      id: 'clin-student-360',
      title: 'Follow up on newly onboarded & flagged Student 360° profiles',
      detail:
        activeOnboardingStudents.length > 0
          ? `${activeOnboardingStudents.length} newly admitted student(s) settling in · ${pendingComplaints} parent concern(s) open.`
          : pendingComplaints > 0
            ? `${pendingComplaints} parent concern(s) open — check holistic student notes.`
            : 'Review psychometric & career guidance follow-ups.',
      priority: activeOnboardingStudents.length > 0 ? 'high' : 'normal',
      estimatedMinutes: 5,
      category: 'Guidance',
      targetTab: 'students',
      actionLabel: 'Students 360°',
    });
  }

  return items;
}

/**
 * Sorts and optimizes a role's to-do items based on urgency, quick-win impact, snooze, and completion.
 */
export function optimizeTodoOrder(params: {
  items: RoleTodoItem[];
  completedIds: Set<string>;
  snoozedIds: Set<string>;
  mode: TodoSortMode;
}): RoleTodoItem[] {
  const { items, completedIds, snoozedIds, mode } = params;

  const scoreItem = (item: RoleTodoItem): number => {
    if (completedIds.has(item.id)) return -1000;
    if (snoozedIds.has(item.id)) return -100;
    const base = PRIORITY_WEIGHT[item.priority];
    if (mode === 'quick_wins') {
      return 500 - item.estimatedMinutes * 20 + base * 0.25;
    }
    if (mode === 'priority') {
      return base * 10 + (item.countBadge ? Math.min(20, item.countBadge) : 0) - item.estimatedMinutes;
    }
    const quickWinBonus = item.estimatedMinutes <= 4 ? 22 : item.estimatedMinutes <= 6 ? 10 : 0;
    const badgeBonus = item.countBadge ? Math.min(18, item.countBadge * 2) : 0;
    return base + quickWinBonus + badgeBonus;
  };

  return [...items].sort((a, b) => scoreItem(b) - scoreItem(a));
}

export function getRoleTodoStorageKey(schoolId: string, userId: string): string {
  return `rai_plus_role_todo_v1:${schoolId}:${userId}`;
}

export function loadRoleTodoDailyState(
  schoolId: string,
  userId: string,
  todayIso: string = resolveTodayIsoDate(),
): RoleTodoDailyState {
  const fallback: RoleTodoDailyState = {
    dateIso: todayIso,
    completedIds: [],
    snoozedIds: [],
    customItems: [],
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(getRoleTodoStorageKey(schoolId, userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<RoleTodoDailyState>;
    if (parsed.dateIso !== todayIso) {
      const prevDone = new Set(Array.isArray(parsed.completedIds) ? parsed.completedIds : []);
      const carriedCustom = Array.isArray(parsed.customItems)
        ? parsed.customItems.filter((c) => !prevDone.has(c.id))
        : [];
      return {
        dateIso: todayIso,
        completedIds: [],
        snoozedIds: [],
        customItems: carriedCustom,
      };
    }
    return {
      dateIso: todayIso,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
      snoozedIds: Array.isArray(parsed.snoozedIds) ? parsed.snoozedIds : [],
      customItems: Array.isArray(parsed.customItems) ? parsed.customItems : [],
    };
  } catch {
    return fallback;
  }
}

export function saveRoleTodoDailyState(
  schoolId: string,
  userId: string,
  state: RoleTodoDailyState,
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getRoleTodoStorageKey(schoolId, userId), JSON.stringify(state));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
