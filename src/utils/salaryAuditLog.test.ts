import assert from 'node:assert/strict';
import test from 'node:test';
import type { StaffProfile, UserAccount } from '../types';
import { buildRoleScopedCampusAdminPayload } from './campusAdminEngine.ts';
import {
  buildSalaryModificationAuditRecord,
  computeSalaryAuditSummary,
  createSeedSalaryAuditLogsForSchool,
  filterSalaryAuditLogs,
  hasSalaryValuesChanged,
} from './salaryAuditLog.ts';

const ADMIN_USER: UserAccount = {
  id: 'usr-admin-1',
  name: 'Dr. Kavita Mehta',
  email: 'admin@vis.edu.in',
  role: 'school_admin',
  schoolId: 'sch-1',
  designation: 'School Administrator',
};

const TEACHER_USER: UserAccount = {
  id: 'usr-teacher-1',
  name: 'Ramesh Yadav',
  email: 'ramesh@vis.edu.in',
  role: 'teacher',
  schoolId: 'sch-1',
  designation: 'PGT Physics',
};

const PARENT_USER: UserAccount = {
  id: 'usr-parent-1',
  name: 'Suresh Verma',
  email: 'parent@vis.edu.in',
  role: 'parent',
  schoolId: 'sch-1',
  designation: 'Parent',
  linkedStudentIds: ['stu-1'],
};

const SAMPLE_STAFF: StaffProfile[] = [
  {
    id: 'stf-1',
    schoolId: 'sch-1',
    userId: 'usr-teacher-1',
    employeeCode: 'VIS-001',
    name: 'Ramesh Yadav',
    roleType: 'Teacher',
    designation: 'PGT Physics',
    department: 'Science',
    baseMonthlySalaryInr: 42000,
    fixedAllowanceInr: 3000,
    pfOrDeductionInr: 1800,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    active: true,
  },
  {
    id: 'stf-2',
    schoolId: 'sch-1',
    employeeCode: 'VIS-002',
    name: 'Sunita Devi',
    roleType: 'Teacher',
    designation: 'TGT Maths',
    department: 'Mathematics',
    baseMonthlySalaryInr: 35000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 1500,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    active: true,
  },
];

test('buildSalaryModificationAuditRecord accurately calculates previous, new, and delta salary values', () => {
  const entry = buildSalaryModificationAuditRecord({
    schoolId: 'sch-1',
    actor: ADMIN_USER,
    staffId: 'stf-1',
    employeeCode: 'VIS-001',
    staffName: 'Ramesh Yadav',
    designation: 'PGT Physics',
    actionType: 'SALARY_UPDATED',
    previousBaseSalaryInr: 38000,
    newBaseSalaryInr: 42000,
    previousAllowanceInr: 2500,
    newAllowanceInr: 3000,
    previousDeductionInr: 1800,
    newDeductionInr: 1800,
    sourceLabel: 'Salary Structure Editor',
    note: 'Annual increment',
    timestamp: '2026-11-26T10:00:00.000Z',
  });

  assert.equal(entry.previousGrossSalaryInr, 40500);
  assert.equal(entry.newGrossSalaryInr, 45000);
  assert.equal(entry.deltaGrossInr, 4500);
  assert.equal(entry.adminUserName, 'Dr. Kavita Mehta');
  assert.equal(entry.adminUserRole, 'school_admin');
  assert.equal(entry.timestamp, '2026-11-26T10:00:00.000Z');
});

test('hasSalaryValuesChanged detects base, allowance, or deduction edits and ignores identical values', () => {
  const same = { baseMonthlySalaryInr: 38000, fixedAllowanceInr: 2500, pfOrDeductionInr: 1800 };
  assert.equal(hasSalaryValuesChanged(same, { ...same }), false);
  assert.equal(hasSalaryValuesChanged(same, { ...same, baseMonthlySalaryInr: 39000 }), true);
  assert.equal(hasSalaryValuesChanged(same, { ...same, fixedAllowanceInr: 3000 }), true);
  assert.equal(hasSalaryValuesChanged(same, { ...same, pfOrDeductionInr: 2000 }), true);
});

test('filterSalaryAuditLogs and computeSalaryAuditSummary sort newest-first and filter accurately', () => {
  const seeded = createSeedSalaryAuditLogsForSchool({
    schoolId: 'sch-1',
    staffProfiles: SAMPLE_STAFF,
    users: [ADMIN_USER, TEACHER_USER],
  });
  assert.equal(seeded.length, 2);

  const summary = computeSalaryAuditSummary(seeded);
  assert.equal(summary.totalChanges, 2);
  assert.equal(summary.uniqueStaffCount, 2);
  assert.equal(summary.latestAdminName, 'Dr. Kavita Mehta');

  const onlyRamesh = filterSalaryAuditLogs(seeded, { query: 'Ramesh' });
  assert.equal(onlyRamesh.length, 1);
  assert.equal(onlyRamesh[0].staffName, 'Ramesh Yadav');

  const onlyBulk = filterSalaryAuditLogs(seeded, { actionType: 'BULK_PAYROLL_UPDATE' });
  assert.equal(onlyBulk.length, 0);
});

test('buildRoleScopedCampusAdminPayload exposes salaryAuditLogs strictly to authorized salary managers', () => {
  const logs = createSeedSalaryAuditLogsForSchool({
    schoolId: 'sch-1',
    staffProfiles: SAMPLE_STAFF,
    users: [ADMIN_USER, TEACHER_USER],
  });

  const adminPayload = buildRoleScopedCampusAdminPayload({
    user: ADMIN_USER,
    schoolId: 'sch-1',
    visibleStudentIds: new Set(),
    staffProfiles: SAMPLE_STAFF,
    staffAttendance: [],
    gatePasses: [],
    visitorLogs: [],
    payrollRegisters: [],
    salaryAuditLogs: logs,
    monthKey: '2026-11',
  });
  assert.equal(adminPayload.salaryAuditLogs.length, 2);

  const teacherPayload = buildRoleScopedCampusAdminPayload({
    user: TEACHER_USER,
    schoolId: 'sch-1',
    visibleStudentIds: new Set(),
    staffProfiles: SAMPLE_STAFF,
    staffAttendance: [],
    gatePasses: [],
    visitorLogs: [],
    payrollRegisters: [],
    salaryAuditLogs: logs,
    monthKey: '2026-11',
  });
  assert.equal(teacherPayload.salaryAuditLogs.length, 0);

  const parentPayload = buildRoleScopedCampusAdminPayload({
    user: PARENT_USER,
    schoolId: 'sch-1',
    visibleStudentIds: new Set(['stu-1']),
    staffProfiles: SAMPLE_STAFF,
    staffAttendance: [],
    gatePasses: [],
    visitorLogs: [],
    payrollRegisters: [],
    salaryAuditLogs: logs,
    monthKey: '2026-11',
  });
  assert.equal(parentPayload.salaryAuditLogs.length, 0);
});
