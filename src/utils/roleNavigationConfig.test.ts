import assert from 'node:assert/strict';
import test from 'node:test';
import type { UserRole } from '../types';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import { buildRoleQuickDockItems, getRoleWorkspaceIdentity } from './roleNavigationConfig';

function makeWorkspaceForRole(role: UserRole): WorkspaceData {
  return {
    user: {
      id: `u-${role}`,
      schoolId: 'sch-1',
      name: `Demo ${role}`,
      email: `${role}@school.edu`,
      role,
      designation: role,
    },
    activeSchool: {
      id: 'sch-1',
      name: 'Demo School',
      code: 'DS01',
    } as unknown as WorkspaceData['activeSchool'],
    availableSchools: [],
    weightsConfig: { weights: {} as unknown as WorkspaceData['weightsConfig']['weights'], version: '1', approvedBy: 'Admin' },
    students: [
      { id: 's1', reportApprovalStatus: 'Pending' } as unknown as WorkspaceData['students'][number],
    ],
    studentBreakdowns: {},
    evidence: [],
    notebookEntries: [],
    developmentReviews: [],
    examMarks: [],
    attendance: [],
    resources: [],
    lessonPlans: [],
    timetable: [],
    admissionLeads: [],
    homeVisitRecords: [],
    careerRequests: [],
    feeTransactions: [],
    operations: [],
    parentComplaints: [],
    blogArticles: [],
    auditLogs: [],
    publicEnquiries: [],
    cognitiveAttempts: [],
    cognitiveAssignments: [],
    visitorLogs: [{ id: 'v1', status: 'On Campus' } as unknown as NonNullable<WorkspaceData['visitorLogs']>[number]],
    gatePasses: [{ id: 'g1', status: 'Pending Approval' } as unknown as NonNullable<WorkspaceData['gatePasses']>[number]],
    staffSalarySummaries: [
      { staffId: 'stf-1', payrollStatus: 'Pending Sync' } as unknown as NonNullable<WorkspaceData['staffSalarySummaries']>[number],
    ],
  };
}

test('buildRoleQuickDockItems returns tailored daily shortcuts and live counts per role without leaking restricted modules', () => {
  const allTabs = new Set<WorkspaceTab>([
    'overview',
    'today_workspace',
    'attendance_heatmap',
    'staff_payroll',
    'finance',
    'campus_gate',
    'marks_report_card',
    'notebook',
    'academics',
    'students',
    'operations',
    'transport',
    'cognitive_profile',
    'events',
  ]);

  // School Admin sees Overview, Class Learning Hub (academics), Attendance, Staff & Salary, Finance & Fees, Gate & Visitors, Marks & Reports
  const adminDock = buildRoleQuickDockItems({
    data: makeWorkspaceForRole('school_admin'),
    allowedTabIds: allTabs,
    unreadParentCount: 0,
  });
  assert.deepEqual(
    adminDock.map((i) => i.tab),
    ['overview', 'academics', 'attendance_heatmap', 'staff_payroll', 'finance', 'campus_gate', 'marks_report_card'],
  );
  assert.equal(adminDock.find((i) => i.tab === 'campus_gate')?.count, 2);
  assert.equal(adminDock.find((i) => i.tab === 'staff_payroll')?.count, 1);

  // Accountant sees Overview, Finance & Fees, Staff Attendance & Salary, My Gate Pass
  const acctDock = buildRoleQuickDockItems({
    data: makeWorkspaceForRole('accountant'),
    allowedTabIds: allTabs,
    unreadParentCount: 0,
  });
  assert.deepEqual(
    acctDock.map((i) => i.tab),
    ['overview', 'finance', 'staff_payroll', 'campus_gate'],
  );

  // Parent NEVER gets staff_payroll; gets Home, Marks, Child Progress, Study Games, Fees, Early Exit Pass, Bus GPS
  const parentDock = buildRoleQuickDockItems({
    data: makeWorkspaceForRole('parent'),
    allowedTabIds: allTabs,
    unreadParentCount: 3,
  });
  assert.equal(parentDock.some((i) => i.tab === 'staff_payroll'), false);
  assert.equal(parentDock.find((i) => i.tab === 'overview')?.count, 3);
  assert.ok(parentDock.some((i) => i.tab === 'campus_gate' && i.label === 'Early Exit Pass'));

  // Student NEVER gets staff_payroll or campus_gate
  const studentDock = buildRoleQuickDockItems({
    data: makeWorkspaceForRole('student'),
    allowedTabIds: allTabs,
    unreadParentCount: 0,
  });
  assert.equal(studentDock.some((i) => i.tab === 'staff_payroll' || i.tab === 'campus_gate'), false);
  assert.ok(studentDock.some((i) => i.actionMode === 'study_games'));

  // Role identity labels are human-friendly
  assert.equal(getRoleWorkspaceIdentity('parent').workspaceName, 'Family Portal');
  assert.equal(getRoleWorkspaceIdentity('teacher').workspaceName, 'Teacher Desk');
  assert.equal(getRoleWorkspaceIdentity('accountant').workspaceName, 'Finance & Payroll Desk');

  // Learning Portal is consolidated inside Class Learning Hub ('academics') — never duplicated as 'learning_portal'
  const extendedTabs = new Set<WorkspaceTab>([
    ...allTabs,
    'learning_portal',
    'student_onboarding',
    'inventory_assets',
  ]);
  for (const role of ['school_admin', 'principal', 'coordinator', 'teacher', 'parent', 'student', 'accountant'] as UserRole[]) {
    const dock = buildRoleQuickDockItems({
      data: makeWorkspaceForRole(role),
      allowedTabIds: extendedTabs,
      unreadParentCount: 0,
    });
    assert.equal(
      dock.some((i) => i.tab === 'learning_portal'),
      false,
      `Role ${role} quick dock must not duplicate standalone learning_portal`,
    );
  }
  const principalDockWithOnboarding = buildRoleQuickDockItems({
    data: makeWorkspaceForRole('principal'),
    allowedTabIds: extendedTabs,
    unreadParentCount: 0,
  });
  assert.ok(
    principalDockWithOnboarding.some((i) => i.tab === 'student_onboarding'),
    'Principal quick dock should surface Docs & Day-1 Onboarding when enabled',
  );
});
