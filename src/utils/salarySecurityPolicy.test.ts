import assert from 'node:assert/strict';
import test from 'node:test';
import type { StaffSalaryComputation } from '../types';
import {
  escapeHtmlStrict,
  filterAuthorizedSalaryRows,
  formatMaskedInr,
  resolveSalaryRbacCapabilities,
  sanitizeCsvCell,
} from './salarySecurityPolicy';

const mockRows: StaffSalaryComputation[] = [
  {
    staffId: 'stf-1',
    employeeCode: 'EMP-101',
    staffName: 'Meera Nair',
    designation: 'Mathematics Teacher',
    department: 'Academics',
    roleType: 'Teacher',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    workingDaysPerMonth: 26,
    presentDays: 24,
    halfDays: 1,
    paidLeaveDays: 1,
    unpaidLeaveDays: 0,
    absentDays: 0,
    markedDays: 26,
    effectivePaidDays: 25.5,
    lossOfPayDays: 0.5,
    attendancePct: 98,
    perDayRateInr: 2000,
    baseMonthlySalaryInr: 52000,
    fixedAllowanceInr: 4000,
    grossSalaryInr: 56000,
    standardDeductionsInr: 3000,
    lopDeductionInr: 1000,
    totalDeductionsInr: 4000,
    netPayableInr: 52000,
    payrollStatus: 'Pending Sync',
  },
  {
    staffId: 'stf-2',
    employeeCode: 'EMP-102',
    staffName: 'Rohan Kulkarni',
    designation: 'Accountant',
    department: 'Finance',
    roleType: 'Admin & Coordinator',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    workingDaysPerMonth: 26,
    presentDays: 26,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    absentDays: 0,
    markedDays: 26,
    effectivePaidDays: 26,
    lossOfPayDays: 0,
    attendancePct: 100,
    perDayRateInr: 1800,
    baseMonthlySalaryInr: 46800,
    fixedAllowanceInr: 3200,
    grossSalaryInr: 50000,
    standardDeductionsInr: 2500,
    lopDeductionInr: 0,
    totalDeductionsInr: 2500,
    netPayableInr: 47500,
    payrollStatus: 'Synced to Payroll',
  },
];

test('resolveSalaryRbacCapabilities enforces strict least-privilege intersection between role and server scope', () => {
  const admin = resolveSalaryRbacCapabilities('school_admin', 'full');
  assert.equal(admin.scope, 'full');
  assert.equal(admin.canViewFullRoster, true);
  assert.equal(admin.canSyncPayroll, true);
  assert.equal(admin.canAutoApprovePayroll, true);
  assert.equal(admin.canExportBulkCsv, true);

  const accountant = resolveSalaryRbacCapabilities('accountant', 'full');
  assert.equal(accountant.scope, 'full');
  assert.equal(accountant.canSyncPayroll, true);
  assert.equal(accountant.canAutoApprovePayroll, false); // Accountant submits for Principal approval

  const teacher = resolveSalaryRbacCapabilities('teacher', 'full'); // Even if serverScope were mistakenly 'full', role caps at 'self'
  assert.equal(teacher.scope, 'self');
  assert.equal(teacher.canViewFullRoster, false);
  assert.equal(teacher.canSyncPayroll, false);
  assert.equal(teacher.canExportBulkCsv, false);
  assert.equal(teacher.canDownloadPayslip, true);

  const parent = resolveSalaryRbacCapabilities('parent', 'full'); // Always 'none'
  assert.equal(parent.scope, 'none');
  assert.equal(parent.canDownloadPayslip, false);

  const student = resolveSalaryRbacCapabilities('student', 'self'); // Always 'none'
  assert.equal(student.scope, 'none');

  // If server restricts scope to 'none', even school_admin respects server denial
  const serverDenied = resolveSalaryRbacCapabilities('school_admin', 'none');
  assert.equal(serverDenied.scope, 'none');
  assert.equal(serverDenied.canViewFullRoster, false);
});

test('filterAuthorizedSalaryRows prevents cross-employee data exposure for self and none scopes', () => {
  const noneRows = filterAuthorizedSalaryRows({
    rows: mockRows,
    scope: 'none',
    authenticatedUserName: 'Parent User',
  });
  assert.equal(noneRows.length, 0);

  const selfRows = filterAuthorizedSalaryRows({
    rows: mockRows,
    scope: 'self',
    authenticatedUserName: 'Meera Nair',
    authenticatedStaffId: 'stf-1',
  });
  assert.equal(selfRows.length, 1);
  assert.equal(selfRows[0].staffId, 'stf-1');

  const fullRows = filterAuthorizedSalaryRows({
    rows: mockRows,
    scope: 'full',
    authenticatedUserName: 'Principal',
  });
  assert.equal(fullRows.length, 2);
});

test('sanitizeCsvCell neutralizes formula injection and escapeHtmlStrict escapes XSS characters', () => {
  assert.equal(sanitizeCsvCell('=CMD|"/C calc"!A0'), `"'=CMD|""/C calc""!A0"`);
  assert.equal(sanitizeCsvCell('+SUM(A1:A5)'), `"'` + `+SUM(A1:A5)"`);
  assert.equal(sanitizeCsvCell('Meera Nair'), `"Meera Nair"`);

  assert.equal(
    escapeHtmlStrict('<script>alert("x")</script>'),
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
  );
  assert.equal(formatMaskedInr(52000, false), '₹ ••••••');
  assert.equal(formatMaskedInr(52000, true), '₹52,000');
});
