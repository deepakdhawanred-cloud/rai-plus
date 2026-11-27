import test from 'node:test';
import assert from 'node:assert/strict';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace.ts';
import {
  buildUnifiedWorkspaceAlerts,
  computeAlertCenterCounts,
  filterUnifiedAlerts,
} from './alertsCenterEngine.ts';

function createMockWorkspace(role: WorkspaceData['user']['role']): WorkspaceData {
  return {
    user: {
      id: `user-${role}`,
      schoolId: 'school-vis',
      name: `Test ${role}`,
      email: `${role}@vis.edu.in`,
      role,
      designation: 'Staff Member',
    },
    activeSchool: {
      id: 'school-vis',
      code: 'VIS-01',
      name: 'Virat International School',
      city: 'Rewari',
      state: 'Haryana',
      board: 'CBSE',
      udiseCode: '061701001',
      haryanaMisCode: 'HR-VIS-01',
      session: '2026-27',
      subscriptionPlan: 'Enterprise 360°',
      active: true,
      studentCount: 250,
      teacherCount: 24,
    },
    availableSchools: [],
    weightsConfig: {
      weights: {
        academic: 30,
        learningHabits: 20,
        participation: 15,
        personalGrowth: 15,
        olq: 20,
      },
      version: '1.0',
      approvedBy: 'Principal',
    },
    students: [
      {
        id: 'stu-1',
        schoolId: 'school-vis',
        admissionNo: 'VIS-101',
        rollNo: '1',
        name: 'Aarav Sharma',
        classSection: '6-A',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '9876543210',
        reportApprovalStatus: 'Draft',
      } as WorkspaceData['students'][number],
    ],
    studentBreakdowns: {},
    evidence: [],
    notebookEntries: [],
    developmentReviews: [
      {
        id: 'rev-1',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        sourceType: 'notebook_work_quality_c',
        sourceId: 'nb-1',
        subject: 'Mathematics',
        chapter: 'Fractions',
        summary: 'Needs guided revision on fraction word problems',
        status: 'Pending',
        decisionNote: '',
        openedBy: 'Mrs. Verma',
        createdAt: '2026-11-24T09:00:00Z',
      },
    ],
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
    parentComplaints: [
      {
        id: 'cmp-1',
        refNo: 'CMP-2026-01',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        parentName: 'Rajesh Sharma',
        category: 'Safety',
        title: 'Bus Stop Lighting Concern',
        description: 'Evening drop-off point needs staff supervision.',
        priority: 'Urgent',
        status: 'New',
        assignedCoordinator: 'Coordinator A',
        resolutionNote: '',
        createdAt: '2026-11-25T10:00:00Z',
        updatedAt: '2026-11-25T10:00:00Z',
      },
      {
        id: 'cmp-other',
        refNo: 'CMP-2026-02',
        schoolId: 'school-vis',
        studentId: 'stu-999',
        studentName: 'Other Student',
        classSection: '8-B',
        parentName: 'Other Parent',
        category: 'Transport',
        title: 'Other Student Issue',
        description: 'Should never be visible to stu-1 parent.',
        priority: 'Urgent',
        status: 'New',
        assignedCoordinator: 'Coordinator A',
        resolutionNote: '',
        createdAt: '2026-11-25T11:00:00Z',
        updatedAt: '2026-11-25T11:00:00Z',
      },
    ],
    blogArticles: [],
    auditLogs: [],
    publicEnquiries: [],
    cognitiveAttempts: [],
    cognitiveAssignments: [],
    absenceTargetRiskAlerts: [
      {
        id: 'risk-1',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '9876543210',
        absenceDate: '2026-11-25',
        attendancePct: 72,
        consecutiveAbsences: 3,
        absencesLast30Days: 6,
        riskLevel: 'Critical Risk',
        impactedTargets: [],
        parentMessage: 'Aarav missed 3 consecutive days.',
        managementMessage: 'Attendance dropped below 75% target pace.',
        catchUpAction: 'Schedule parent call and maths catch-up sheet.',
        recipients: ['parent', 'management'],
        status: 'Active',
        acknowledgedByParent: false,
        acknowledgedByManagement: false,
        triggeredBy: 'System',
        triggeredAt: '2026-11-25T08:00:00Z',
      },
    ],
    attendanceNotifications: [
      {
        id: 'att-n1',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '9876543210',
        date: '2026-11-25',
        attendanceStatus: 'Absent',
        title: 'Absent marked today',
        messageEn: 'Aarav was marked absent in morning roll call.',
        messageHi: 'Aarav anupasthit.',
        sentBy: 'Mrs. Verma',
        sentByRole: 'teacher',
        sentAt: '2026-11-25T08:15:00Z',
        deliveryChannel: 'In-App Parent Portal',
        readByParent: false,
        acknowledgedByParent: false,
      },
    ],
    notebookNotifications: [
      {
        id: 'nb-n1',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '9876543210',
        notebookEntryId: 'nbe-1',
        subject: 'Science',
        chapter: 'Ch 4',
        chapterNo: '4',
        chapterName: 'Light',
        chapterGap: 2,
        date: '2026-11-24',
        notebookStatus: 'Incomplete',
        title: 'Science Notebook Backlog',
        messageEn: 'Science notebook is 2 chapters behind.',
        messageHi: 'Vigyan copy adhuri hai.',
        studentMessage: 'Finish Ch 4 Science notebook.',
        recipients: ['student', 'parent'],
        deliveryChannel: 'In-App Student & Parent Portal',
        triggeredBy: 'Mrs. Verma',
        triggeredByRole: 'teacher',
        triggeredAt: '2026-11-24T12:00:00Z',
        status: 'Active',
        readByStudent: false,
        readByParent: false,
        acknowledgedByStudent: false,
        acknowledgedByParent: false,
      },
    ],
    feeAccounts: [
      {
        id: 'fee-1',
        schoolId: 'school-vis',
        studentId: 'stu-1',
        admissionType: 'OLD',
        admissionNo: 'VIS-101',
        studentName: 'Aarav Sharma',
        fatherName: 'Rajesh Sharma',
        className: '6-A',
        rawClass: '6-A',
        contactNo: '9876543210',
        address: 'Rewari',
        remarks: '',
        lastYearBalanceInr: 8500,
        yearlyDemandInr: 42000,
        perMonthInr: 3500,
        monthlyPaidInr: {} as NonNullable<WorkspaceData['feeAccounts']>[number]['monthlyPaidInr'],
        paidAmountInr: 14000,
        settleAmountInr: 0,
        balanceFeesInr: 28000,
        fineInr: 0,
        scheduleCadence: 'Monthly',
        expectedScheduleNote: 'Monthly',
      },
    ],
    gatePasses: [
      {
        id: 'gp-1',
        schoolId: 'school-vis',
        passCode: 'GP-2026-101',
        subjectType: 'Student Early Exit',
        studentId: 'stu-1',
        studentName: 'Aarav Sharma',
        classSection: '6-A',
        requestedByName: 'Rajesh Sharma',
        requestedByRole: 'parent',
        reason: 'Medical appointment',
        expectedExitTime: '12:30',
        status: 'Pending Approval',
        createdAt: '2026-11-26T09:00:00Z',
        updatedAt: '2026-11-26T09:00:00Z',
      },
    ],
    teacherLeaveRequests: [
      {
        id: 'lv-1',
        schoolId: 'school-vis',
        teacherName: 'Mrs. Verma',
        leaveType: 'Medical Leave',
        startDate: '2026-11-27',
        endDate: '2026-11-27',
        reason: 'Dental procedure',
        status: 'Pending',
        appliedAt: '2026-11-25T16:00:00Z',
        affectedSlotCount: 5,
        generatedCoverIds: [],
        auditTrail: [],
      },
    ],
    staffSalaryAccessScope: 'full',
    staffSalarySummaries: [
      {
        staffId: 'stf-1',
        employeeCode: 'EMP-01',
        staffName: 'Mrs. Verma',
        designation: 'TGT Maths',
        department: 'Academics',
        roleType: 'Teacher',
        monthKey: '2026-11',
        monthLabel: 'November 2026',
        workingDaysPerMonth: 26,
        presentDays: 24,
        halfDays: 0,
        paidLeaveDays: 1,
        unpaidLeaveDays: 0,
        absentDays: 1,
        markedDays: 26,
        effectivePaidDays: 25,
        lossOfPayDays: 1,
        attendancePct: 92,
        perDayRateInr: 1200,
        baseMonthlySalaryInr: 30000,
        fixedAllowanceInr: 1200,
        grossSalaryInr: 31200,
        standardDeductionsInr: 1200,
        lopDeductionInr: 1200,
        totalDeductionsInr: 2400,
        netPayableInr: 28800,
        payrollStatus: 'Pending Sync',
      },
    ],
  };
}

test('1. Aggregates multi-source alerts for school_admin sorted by severity (critical first)', () => {
  const data = createMockWorkspace('school_admin');
  const allowedTabs = new Set<WorkspaceTab>([
    'overview',
    'alerts',
    'students',
    'notebook',
    'remedials',
    'marks_report_card',
    'finance',
    'campus_gate',
    'operations',
    'timetable_leave',
    'staff_payroll',
  ]);

  const alerts = buildUnifiedWorkspaceAlerts({
    data,
    allowedTabIds: allowedTabs,
    referenceDateIso: '2026-11-26',
  });

  const counts = computeAlertCenterCounts(alerts);
  assert.ok(counts.active >= 7, 'Expected all major categories to aggregate');
  assert.ok(counts.critical >= 4, 'Expected critical alerts from risk, finance, gate, complaint, leave');
  assert.equal(alerts[0].severity, 'critical', 'Critical alerts must sort ahead of warning/info');

  const firstWarningIdx = alerts.findIndex((a) => a.severity === 'warning');
  const lastCriticalIdx = alerts.map((a) => a.severity).lastIndexOf('critical');
  assert.ok(lastCriticalIdx < firstWarningIdx, 'All active critical alerts must precede warning alerts');
});

test('2. Strictly enforces RBAC scoping for parent role (no payroll, no staff leave, no other student records)', () => {
  const data = createMockWorkspace('parent');
  const parentTabs = new Set<WorkspaceTab>(['overview', 'alerts', 'students', 'operations']);

  const alerts = buildUnifiedWorkspaceAlerts({
    data,
    allowedTabIds: parentTabs,
    referenceDateIso: '2026-11-26',
  });

  assert.equal(
    alerts.some((a) => a.category === 'staff_payroll'),
    false,
    'Parent must never see staff/payroll alerts',
  );
  assert.equal(
    alerts.some((a) => a.id.includes('finance-high-defaulters')),
    false,
    'Parent must never see school-wide defaulter summary',
  );
  assert.equal(
    alerts.some((a) => a.id === 'complaint:cmp-other'),
    false,
    'Parent must never see complaints belonging to another student',
  );
  assert.equal(
    alerts.some((a) => a.id === 'attendance-notif:att-n1'),
    true,
    'Parent should see unread attendance notification for their child',
  );
  assert.equal(
    alerts.some((a) => a.id === 'complaint:cmp-1'),
    true,
    'Parent should see their own student complaint',
  );
});

test('3. Strictly enforces RBAC scoping for accountant role (finance, payroll, gate only)', () => {
  const data = createMockWorkspace('accountant');
  const acctTabs = new Set<WorkspaceTab>(['overview', 'alerts', 'finance', 'staff_payroll', 'campus_gate']);

  const alerts = buildUnifiedWorkspaceAlerts({
    data,
    allowedTabIds: acctTabs,
    referenceDateIso: '2026-11-26',
  });

  const categories = new Set(alerts.map((a) => a.category));
  assert.equal(categories.has('finance'), true);
  assert.equal(categories.has('staff_payroll'), true);
  assert.equal(categories.has('campus_gate'), true);
  assert.equal(categories.has('attendance'), false, 'Accountant should not see academic/attendance risk alerts');
  assert.equal(categories.has('academics'), false, 'Accountant should not see notebook/academic alerts');
  assert.equal(categories.has('complaints'), false, 'Accountant should not see parent complaints');
});

test('4. Supports local acknowledgement, status filtering, category filtering, and search', () => {
  const data = createMockWorkspace('school_admin');
  const allowedTabs = new Set<WorkspaceTab>([
    'overview',
    'alerts',
    'students',
    'finance',
    'campus_gate',
    'operations',
    'staff_payroll',
  ]);

  const acknowledged = new Set<string>(['gate-pass:gp-1']);
  const alerts = buildUnifiedWorkspaceAlerts({
    data,
    allowedTabIds: allowedTabs,
    locallyAcknowledgedIds: acknowledged,
    referenceDateIso: '2026-11-26',
  });

  const activeOnly = filterUnifiedAlerts(alerts, { status: 'active' });
  assert.equal(
    activeOnly.some((a) => a.id === 'gate-pass:gp-1'),
    false,
    'Locally acknowledged alert should leave the active queue',
  );

  const resolvedOnly = filterUnifiedAlerts(alerts, { status: 'resolved' });
  assert.equal(resolvedOnly.length, 1);
  assert.equal(resolvedOnly[0].id, 'gate-pass:gp-1');

  const searchMatches = filterUnifiedAlerts(alerts, {
    status: 'all',
    query: 'GP-2026-101',
  });
  assert.equal(searchMatches.length, 1);
  assert.equal(searchMatches[0].category, 'campus_gate');
});
