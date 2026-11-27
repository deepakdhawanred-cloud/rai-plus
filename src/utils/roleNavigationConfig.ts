import type { UserRole } from '../types';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';

export interface RoleQuickDockItem {
  id: string;
  tab: WorkspaceTab;
  label: string;
  actionMode?: 'one_go_attendance' | 'study_games';
  count?: number;
}

export interface RoleWorkspaceIdentity {
  workspaceName: string;
  dailyFocusHint: string;
  primaryCtaLabel: string;
  primaryCtaTab: WorkspaceTab;
  primaryCtaMode?: 'one_go_attendance' | 'study_games';
}

export function getRoleWorkspaceIdentity(role: UserRole): RoleWorkspaceIdentity {
  switch (role) {
    case 'super_admin':
      return {
        workspaceName: 'Platform Control',
        dailyFocusHint: 'Manage school plans, attendance hardware modes, and custom pricing.',
        primaryCtaLabel: 'Plan Allotment',
        primaryCtaTab: 'feature_allotment',
      };
    case 'school_admin':
    case 'principal':
      return {
        workspaceName: 'Leadership Desk',
        dailyFocusHint: 'Track attendance, approve reports, run staff payroll, and oversee campus gates.',
        primaryCtaLabel: 'Staff & Salary',
        primaryCtaTab: 'staff_payroll',
      };
    case 'coordinator':
      return {
        workspaceName: 'Academic Coordinator',
        dailyFocusHint: 'Monitor class attendance, timetables, assessments, and gate passes.',
        primaryCtaLabel: 'Attendance',
        primaryCtaTab: 'attendance_heatmap',
      };
    case 'teacher':
      return {
        workspaceName: 'Teacher Desk',
        dailyFocusHint: 'Mark class attendance, enter exam marks, review notebooks, and share lessons.',
        primaryCtaLabel: 'One-Go Attendance',
        primaryCtaTab: 'today_workspace',
        primaryCtaMode: 'one_go_attendance',
      };
    case 'accountant':
      return {
        workspaceName: 'Finance & Payroll Desk',
        dailyFocusHint: 'Collect fees, review automated attendance-linked staff salaries, and reconcile books.',
        primaryCtaLabel: 'Staff Salary',
        primaryCtaTab: 'staff_payroll',
      };
    case 'parent':
      return {
        workspaceName: 'Family Portal',
        dailyFocusHint: 'Check your child’s daily attendance, report cards, fees, bus GPS, and gate passes.',
        primaryCtaLabel: 'Report Card',
        primaryCtaTab: 'marks_report_card',
      };
    case 'student':
      return {
        workspaceName: 'Student Hub',
        dailyFocusHint: 'Play quick-revise study games, review class lessons, and track your marks.',
        primaryCtaLabel: 'Study Games',
        primaryCtaTab: 'academics',
        primaryCtaMode: 'study_games',
      };
    case 'transport_incharge':
      return {
        workspaceName: 'Transport & Gate Desk',
        dailyFocusHint: 'Track live school buses, approve gate passes, and manage the visitors register.',
        primaryCtaLabel: 'Gate & Visitors',
        primaryCtaTab: 'campus_gate',
      };
    case 'counsellor':
      return {
        workspaceName: 'Student Guidance Desk',
        dailyFocusHint: 'Support student wellbeing, psychometric evaluations, and career pathways.',
        primaryCtaLabel: 'Students 360°',
        primaryCtaTab: 'students',
      };
    default:
      return {
        workspaceName: 'Clinical Care Desk',
        dailyFocusHint: 'Review student care plans, therapy observations, and developmental remedials.',
        primaryCtaLabel: 'Clinical Care',
        primaryCtaTab: 'clinical_care',
      };
  }
}

/**
 * Builds the 4–6 highest-frequency 1-click daily destinations for the signed-in role,
 * automatically filtering against the school's enabled tabs (`allowedTabIds`).
 */
export function buildRoleQuickDockItems(params: {
  data: WorkspaceData;
  allowedTabIds: Set<WorkspaceTab>;
  unreadParentCount: number;
}): RoleQuickDockItem[] {
  const { data, allowedTabIds, unreadParentCount } = params;
  const role = data.user.role;

  const onCampusVisitors = (data.visitorLogs || []).filter((v) => v.status === 'On Campus').length;
  const pendingGatePasses = (data.gatePasses || []).filter(
    (g) => g.status === 'Pending Approval',
  ).length;
  const gateBadge = onCampusVisitors + pendingGatePasses;

  const pendingPayrollSync = (data.staffSalarySummaries || []).filter(
    (s) => s.payrollStatus === 'Pending Sync',
  ).length;

  const pendingReports = (data.students || []).filter(
    (s) => s.reportApprovalStatus !== 'Approved',
  ).length;

  let raw: RoleQuickDockItem[] = [];

  if (role === 'school_admin' || role === 'principal') {
    raw = [
      { id: 'dock-overview', tab: 'overview', label: 'Overview', count: pendingReports > 0 ? pendingReports : undefined },
      { id: 'dock-attendance', tab: 'attendance_heatmap', label: 'Attendance' },
      { id: 'dock-staff-salary', tab: 'staff_payroll', label: 'Staff & Salary', count: pendingPayrollSync > 0 ? pendingPayrollSync : undefined },
      { id: 'dock-finance', tab: 'finance', label: 'Finance & Fees' },
      { id: 'dock-gate', tab: 'campus_gate', label: 'Gate & Visitors', count: gateBadge > 0 ? gateBadge : undefined },
      { id: 'dock-marks', tab: 'marks_report_card', label: 'Marks & Reports' },
    ];
  } else if (role === 'coordinator') {
    raw = [
      { id: 'dock-overview', tab: 'overview', label: 'Overview' },
      { id: 'dock-attendance', tab: 'attendance_heatmap', label: 'Attendance' },
      { id: 'dock-timetable', tab: 'timetable_leave', label: 'Timetable & Leave' },
      { id: 'dock-marks', tab: 'marks_report_card', label: 'Marks & Reports' },
      { id: 'dock-gate', tab: 'campus_gate', label: 'Gate & Visitors', count: gateBadge > 0 ? gateBadge : undefined },
      { id: 'dock-payslip', tab: 'staff_payroll', label: 'My Payslip' },
    ];
  } else if (role === 'teacher') {
    raw = [
      { id: 'dock-today', tab: 'today_workspace', label: 'Today’s Desk' },
      { id: 'dock-onego', tab: 'today_workspace', label: 'Mark Attendance', actionMode: 'one_go_attendance' },
      { id: 'dock-marks', tab: 'marks_report_card', label: 'Enter Marks' },
      { id: 'dock-notebook', tab: 'notebook', label: 'Notebooks & Homework' },
      { id: 'dock-hub', tab: 'academics', label: 'Class Learning Hub' },
      { id: 'dock-payslip', tab: 'staff_payroll', label: 'My Payslip' },
    ];
  } else if (role === 'accountant') {
    raw = [
      { id: 'dock-acct-home', tab: 'overview', label: 'Accounts Overview' },
      { id: 'dock-finance', tab: 'finance', label: 'Finance & Fees' },
      { id: 'dock-staff-salary', tab: 'staff_payroll', label: 'Staff Attendance & Salary', count: pendingPayrollSync > 0 ? pendingPayrollSync : undefined },
      { id: 'dock-gate', tab: 'campus_gate', label: 'My Gate Pass' },
    ];
  } else if (role === 'parent') {
    raw = [
      { id: 'dock-home', tab: 'overview', label: 'Home', count: unreadParentCount > 0 ? unreadParentCount : undefined },
      { id: 'dock-marks', tab: 'marks_report_card', label: 'Marks & Report Card' },
      { id: 'dock-progress', tab: 'students', label: 'Child Progress' },
      { id: 'dock-hub', tab: 'academics', label: 'Study Games & Hub', actionMode: 'study_games' },
      { id: 'dock-fees', tab: 'operations', label: 'Fees & Messages' },
      { id: 'dock-gate', tab: 'campus_gate', label: 'Early Exit Pass' },
      { id: 'dock-bus', tab: 'transport', label: 'Bus Live GPS' },
    ];
  } else if (role === 'student') {
    raw = [
      { id: 'dock-home', tab: 'overview', label: 'Home', count: unreadParentCount > 0 ? unreadParentCount : undefined },
      { id: 'dock-games', tab: 'academics', label: 'Study Games & Hub', actionMode: 'study_games' },
      { id: 'dock-marks', tab: 'marks_report_card', label: 'My Marks' },
      { id: 'dock-brain', tab: 'cognitive_profile', label: 'Daily Brain Gym' },
      { id: 'dock-events', tab: 'events', label: 'Events' },
      { id: 'dock-profile', tab: 'students', label: 'My Profile' },
    ];
  } else if (role === 'transport_incharge') {
    raw = [
      { id: 'dock-bus', tab: 'transport', label: 'Transport & Live GPS' },
      { id: 'dock-gate', tab: 'campus_gate', label: 'Gate Pass & Visitors', count: gateBadge > 0 ? gateBadge : undefined },
      { id: 'dock-payslip', tab: 'staff_payroll', label: 'My Attendance & Payslip' },
    ];
  } else if (role === 'counsellor') {
    raw = [
      { id: 'dock-overview', tab: 'overview', label: 'Overview' },
      { id: 'dock-students', tab: 'students', label: 'Students 360°' },
      { id: 'dock-clinical', tab: 'clinical_care', label: 'Clinical Care' },
      { id: 'dock-career', tab: 'career', label: 'Career Intelligence' },
      { id: 'dock-payslip', tab: 'staff_payroll', label: 'My Payslip' },
    ];
  } else {
    raw = [
      { id: 'dock-clinical', tab: 'clinical_care', label: 'Clinical & Care 360°' },
      { id: 'dock-students', tab: 'students', label: 'Students 360°' },
      { id: 'dock-remedials', tab: 'remedials', label: 'Remedials' },
      { id: 'dock-payslip', tab: 'staff_payroll', label: 'My Payslip' },
    ];
  }

  return raw.filter((item) => allowedTabIds.has(item.tab));
}
