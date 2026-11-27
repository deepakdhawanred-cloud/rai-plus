import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  GatePassRecord,
  StaffAttendanceRecord,
  StaffProfile,
  UserAccount,
  VisitorLogRecord,
} from '../types';
import {
  buildRoleScopedCampusAdminPayload,
  computeStaffMonthlySalary,
  getStaffSalaryAccessScope,
  maskVisitorIdNumber,
} from './campusAdminEngine';

const sampleStaff: StaffProfile[] = [
  {
    id: 'stf-1',
    schoolId: 'sch-1',
    userId: 'u-teacher-1',
    employeeCode: 'EMP-101',
    name: 'Meera Nair',
    designation: 'Senior Mathematics Teacher',
    department: 'Academics',
    roleType: 'Teacher',
    baseMonthlySalaryInr: 52000,
    fixedAllowanceInr: 6000,
    pfOrDeductionInr: 3000,
    paidLeaveAllowance: 2,
    workingDaysPerMonth: 26,
    active: true,
  },
  {
    id: 'stf-2',
    schoolId: 'sch-1',
    userId: 'u-acct-1',
    employeeCode: 'EMP-102',
    name: 'Rohan Kulkarni',
    designation: 'School Accountant',
    department: 'Finance',
    roleType: 'Admin & Coordinator',
    baseMonthlySalaryInr: 48000,
    fixedAllowanceInr: 4000,
    pfOrDeductionInr: 2400,
    paidLeaveAllowance: 2,
    workingDaysPerMonth: 26,
    active: true,
  },
  {
    id: 'stf-other-school',
    schoolId: 'sch-2',
    userId: 'u-other-1',
    employeeCode: 'EMP-999',
    name: 'Other School Staff',
    designation: 'Teacher',
    department: 'Academics',
    roleType: 'Teacher',
    baseMonthlySalaryInr: 40000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 2000,
    paidLeaveAllowance: 2,
    workingDaysPerMonth: 26,
    active: true,
  },
];

const sampleAttendance: StaffAttendanceRecord[] = [
  // stf-1: 18 Present, 1 Half Day (0.5 LOP), 3 Paid Leave (allowance=2 -> 1 excess LOP), 1 Absent (1 LOP) => total LOP = 2.5 days
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `att-p-${i}`,
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: `2026-11-${String(i + 1).padStart(2, '0')}`,
    status: 'Present' as const,
    markingMode: 'biometric' as const,
    markedBy: 'Admin',
    updatedAt: '2026-11-25T09:00:00Z',
  })),
  {
    id: 'att-hd-1',
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: '2026-11-19',
    status: 'Half Day',
    markingMode: 'manual',
    markedBy: 'Admin',
    updatedAt: '2026-11-19T13:00:00Z',
  },
  {
    id: 'att-pl-1',
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: '2026-11-20',
    status: 'Paid Leave',
    markingMode: 'manual',
    markedBy: 'Admin',
    updatedAt: '2026-11-20T09:00:00Z',
  },
  {
    id: 'att-pl-2',
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: '2026-11-21',
    status: 'Paid Leave',
    markingMode: 'manual',
    markedBy: 'Admin',
    updatedAt: '2026-11-21T09:00:00Z',
  },
  {
    id: 'att-pl-3',
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: '2026-11-22',
    status: 'Paid Leave',
    markingMode: 'manual',
    markedBy: 'Admin',
    updatedAt: '2026-11-22T09:00:00Z',
  },
  {
    id: 'att-ab-1',
    schoolId: 'sch-1',
    staffId: 'stf-1',
    date: '2026-11-23',
    status: 'Absent',
    markingMode: 'manual',
    markedBy: 'Admin',
    updatedAt: '2026-11-23T09:00:00Z',
  },
];

const sampleGatePasses: GatePassRecord[] = [
  {
    id: 'gp-stu-1',
    schoolId: 'sch-1',
    passCode: 'GP-2026-101',
    subjectType: 'Student Early Exit',
    studentId: 'stu-child-1',
    studentName: 'Aarav Sharma',
    classSection: 'Grade 6-A',
    reason: 'Dental appointment',
    authorizedPickupName: 'Vikram Sharma',
    pickupRelation: 'Father',
    pickupPhone: '+91 98111 22334',
    pickupIdMasked: 'XXXX-XXXX-4521',
    requestedByUserId: 'u-parent-1',
    requestedByName: 'Vikram Sharma',
    requestedByRole: 'parent',
    expectedExitTime: '12:30',
    status: 'Approved',
    createdAt: '2026-11-25T10:15:00Z',
    updatedAt: '2026-11-25T10:20:00Z',
  },
  {
    id: 'gp-stu-2',
    schoolId: 'sch-1',
    passCode: 'GP-2026-102',
    subjectType: 'Student Early Exit',
    studentId: 'stu-other-child',
    studentName: 'Diya Verma',
    classSection: 'Grade 7-B',
    reason: 'Family travel',
    requestedByUserId: 'u-parent-2',
    requestedByName: 'Neha Verma',
    requestedByRole: 'parent',
    expectedExitTime: '13:00',
    status: 'Pending Approval',
    createdAt: '2026-11-25T10:30:00Z',
    updatedAt: '2026-11-25T10:30:00Z',
  },
  {
    id: 'gp-stf-1',
    schoolId: 'sch-1',
    passCode: 'GP-2026-103',
    subjectType: 'Staff Out-Pass',
    staffId: 'stf-1',
    staffUserId: 'u-teacher-1',
    staffName: 'Meera Nair',
    staffDesignation: 'Senior Mathematics Teacher',
    reason: 'CBSE workshop',
    requestedByUserId: 'u-teacher-1',
    requestedByName: 'Meera Nair',
    requestedByRole: 'teacher',
    expectedExitTime: '14:00',
    expectedReturnTime: '16:30',
    status: 'Approved',
    createdAt: '2026-11-25T11:00:00Z',
    updatedAt: '2026-11-25T11:05:00Z',
  },
];

const sampleVisitors: VisitorLogRecord[] = [
  {
    id: 'vis-1',
    schoolId: 'sch-1',
    badgeCode: 'VIS-4821',
    visitorName: 'Suresh Iyer',
    phone: '+91 98200 11223',
    category: 'Vendor / Delivery',
    purpose: 'Lab microscope calibration',
    personToMeet: 'Principal Desk',
    department: 'Administration',
    idProofType: 'Aadhaar Card',
    idProofMasked: 'XXXX-XXXX-9012',
    checkInAt: '2026-11-25T09:30:00Z',
    status: 'On Campus',
    loggedByName: 'Gate Desk',
  },
];

function makeUser(overrides: Partial<UserAccount>): UserAccount {
  return {
    id: 'u-default',
    schoolId: 'sch-1',
    name: 'Test User',
    email: 'test@raiplus.edu',
    role: 'school_admin',
    designation: 'Staff',
    ...overrides,
  };
}

test('computeStaffMonthlySalary calculates LOP for half day, absent, and paid-leave overflow accurately', () => {
  const result = computeStaffMonthlySalary({
    profile: sampleStaff[0],
    attendanceRecords: sampleAttendance,
    monthKey: '2026-11',
    payrollRegisters: [],
  });

  // Base 52,000 / 26 working days = 2,000 per day
  // LOP days = 1 Absent + 0.5 Half Day + (3 - 2) excess Paid Leave = 2.5 days
  // LOP deduction = 2.5 * 2,000 = 5,000
  // Gross = 52,000 + 6,000 = 58,000; Standard Deductions = 3,000
  // Total Deductions = 8,000; Net Payable = 50,000
  assert.equal(result.perDayRateInr, 2000);
  assert.equal(result.lossOfPayDays, 2.5);
  assert.equal(result.effectivePaidDays, 23.5);
  assert.equal(result.lopDeductionInr, 5000);
  assert.equal(result.grossSalaryInr, 58000);
  assert.equal(result.totalDeductionsInr, 8000);
  assert.equal(result.netPayableInr, 50000);
  assert.equal(result.payrollStatus, 'Pending Sync');
});

test('maskVisitorIdNumber masks government IDs while keeping only the last 4 characters', () => {
  assert.equal(maskVisitorIdNumber('4512 9823 7741'), 'XXXX-XXXX-7741');
  assert.equal(maskVisitorIdNumber('ab12'), 'XXXX-AB12');
  assert.equal(maskVisitorIdNumber('   '), 'Verified at Gate');
});

test('role scoping grants full staff salary + visitors to school_admin/accountant, self-only to teacher, and none to parent/student', () => {
  assert.equal(getStaffSalaryAccessScope('school_admin'), 'full');
  assert.equal(getStaffSalaryAccessScope('principal'), 'full');
  assert.equal(getStaffSalaryAccessScope('accountant'), 'full');
  assert.equal(getStaffSalaryAccessScope('teacher'), 'self');
  assert.equal(getStaffSalaryAccessScope('parent'), 'none');
  assert.equal(getStaffSalaryAccessScope('student'), 'none');

  // 1. School Admin sees all sch-1 staff (not sch-2), all gate passes, all visitors
  const adminPayload = buildRoleScopedCampusAdminPayload({
    user: makeUser({ id: 'u-admin', role: 'school_admin' }),
    schoolId: 'sch-1',
    visibleStudentIds: new Set(['stu-child-1', 'stu-other-child']),
    staffProfiles: sampleStaff,
    staffAttendance: sampleAttendance,
    gatePasses: sampleGatePasses,
    visitorLogs: sampleVisitors,
    payrollRegisters: [],
    monthKey: '2026-11',
  });
  assert.equal(adminPayload.staffSalaryAccessScope, 'full');
  assert.equal(adminPayload.staffProfiles.length, 2);
  assert.equal(adminPayload.staffSalarySummaries.length, 2);
  assert.equal(adminPayload.gatePasses.length, 3);
  assert.equal(adminPayload.visitorLogs.length, 1);

  // 2. Teacher sees ONLY their own profile & salary, ONLY their own staff gate pass, and ZERO visitor logs
  const teacherPayload = buildRoleScopedCampusAdminPayload({
    user: makeUser({ id: 'u-teacher-1', name: 'Meera Nair', role: 'teacher' }),
    schoolId: 'sch-1',
    visibleStudentIds: new Set(['stu-child-1']),
    staffProfiles: sampleStaff,
    staffAttendance: sampleAttendance,
    gatePasses: sampleGatePasses,
    visitorLogs: sampleVisitors,
    payrollRegisters: [],
    monthKey: '2026-11',
  });
  assert.equal(teacherPayload.staffSalaryAccessScope, 'self');
  assert.equal(teacherPayload.staffProfiles.length, 1);
  assert.equal(teacherPayload.staffProfiles[0].id, 'stf-1');
  assert.equal(teacherPayload.staffSalarySummaries.length, 1);
  assert.equal(teacherPayload.staffSalarySummaries[0].staffId, 'stf-1');
  assert.equal(teacherPayload.visitorLogs.length, 0);
  assert.equal(teacherPayload.gatePasses.length, 1);
  assert.equal(teacherPayload.gatePasses[0].id, 'gp-stf-1');

  // 3. Parent sees ZERO staff profiles, ZERO staff attendance, ZERO salaries, ZERO visitors, and ONLY linked child's gate pass
  const parentPayload = buildRoleScopedCampusAdminPayload({
    user: makeUser({ id: 'u-parent-1', role: 'parent', linkedStudentIds: ['stu-child-1'] }),
    schoolId: 'sch-1',
    visibleStudentIds: new Set(['stu-child-1']),
    staffProfiles: sampleStaff,
    staffAttendance: sampleAttendance,
    gatePasses: sampleGatePasses,
    visitorLogs: sampleVisitors,
    payrollRegisters: [],
    monthKey: '2026-11',
  });
  assert.equal(parentPayload.staffSalaryAccessScope, 'none');
  assert.equal(parentPayload.staffProfiles.length, 0);
  assert.equal(parentPayload.staffAttendance.length, 0);
  assert.equal(parentPayload.staffSalarySummaries.length, 0);
  assert.equal(parentPayload.visitorLogs.length, 0);
  assert.equal(parentPayload.gatePasses.length, 1);
  assert.equal(parentPayload.gatePasses[0].studentId, 'stu-child-1');

  // 4. Student sees ZERO staff, ZERO salary, ZERO visitors, ZERO gate passes
  const studentPayload = buildRoleScopedCampusAdminPayload({
    user: makeUser({ id: 'u-student-1', role: 'student', linkedStudentIds: ['stu-child-1'] }),
    schoolId: 'sch-1',
    visibleStudentIds: new Set(['stu-child-1']),
    staffProfiles: sampleStaff,
    staffAttendance: sampleAttendance,
    gatePasses: sampleGatePasses,
    visitorLogs: sampleVisitors,
    payrollRegisters: [],
    monthKey: '2026-11',
  });
  assert.equal(studentPayload.staffSalaryAccessScope, 'none');
  assert.equal(studentPayload.staffProfiles.length, 0);
  assert.equal(studentPayload.staffSalarySummaries.length, 0);
  assert.equal(studentPayload.visitorLogs.length, 0);
  assert.equal(studentPayload.gatePasses.length, 0);
});
