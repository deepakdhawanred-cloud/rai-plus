import test from 'node:test';
import assert from 'node:assert/strict';
import type { AccountingEntry, PayrollRegisterEntry } from '../types';
import {
  canPerformFinanceAction,
  extractAccountingDraftFromDocument,
  validateAccountingEntryMutation,
  validatePayrollApproval,
} from './accountantRbacEngine';

const SUBMITTED_ENTRY: AccountingEntry = {
  id: 'acc-1',
  schoolId: 'sch-1',
  date: '2026-11-20',
  monthKey: '2026-11',
  category: 'Bus Fuel Expense',
  direction: 'Expense',
  vendorOrParty: 'Jhajjar Fuel Depot',
  busCode: 'BUS-03',
  description: 'Diesel refill for route 3',
  amountInr: 6400,
  paymentMode: 'UPI',
  status: 'submitted',
  periodLocked: false,
  createdBy: 'Suresh Kumar',
  createdByRole: 'accountant',
  createdAt: '2026-11-20T09:00:00.000Z',
};

const APPROVED_LOCKED_ENTRY: AccountingEntry = {
  ...SUBMITTED_ENTRY,
  id: 'acc-2',
  monthKey: '2026-10',
  status: 'approved',
  periodLocked: true,
  approvedBy: 'Dr. Deepak Dhawan',
};

const PAYROLL_ROW: PayrollRegisterEntry = {
  id: 'pay-1',
  schoolId: 'sch-1',
  monthLabel: 'November 2026',
  staffName: 'Ramesh Driver',
  staffRoleType: 'Driver',
  designation: 'Bus Driver (Route 3)',
  daysWorked: 26,
  grossSalaryInr: 18500,
  deductionsInr: 500,
  netPayableInr: 18000,
  status: 'submitted',
  preparedBy: 'Suresh Kumar',
};

test('accountantRbacEngine enforces strict segregation of duties for accountant vs principal', () => {
  // Accountant CAN perform operational finance tasks
  assert.equal(canPerformFinanceAction('accountant', 'view_finance_360').allowed, true);
  assert.equal(canPerformFinanceAction('accountant', 'create_accounting_entry').allowed, true);
  assert.equal(canPerformFinanceAction('accountant', 'prepare_payroll').allowed, true);
  assert.equal(canPerformFinanceAction('accountant', 'reconcile_bank').allowed, true);
  assert.equal(canPerformFinanceAction('accountant', 'upload_financial_document').allowed, true);

  // Accountant CANNOT approve own entries, approve payroll, authorise payments, delete posted txns, modify locked periods, or change school permissions
  assert.equal(canPerformFinanceAction('accountant', 'approve_accounting_entry').allowed, false);
  assert.equal(canPerformFinanceAction('accountant', 'approve_payroll').allowed, false);
  assert.equal(canPerformFinanceAction('accountant', 'authorise_payment').allowed, false);
  assert.equal(canPerformFinanceAction('accountant', 'delete_posted_transaction').allowed, false);
  assert.equal(canPerformFinanceAction('accountant', 'modify_locked_period').allowed, false);
  assert.equal(canPerformFinanceAction('accountant', 'manage_school_permissions').allowed, false);

  // Entry-level guards
  assert.equal(
    validateAccountingEntryMutation({
      role: 'accountant',
      actorName: 'Suresh Kumar',
      entry: SUBMITTED_ENTRY,
      mutation: 'approve',
    }).allowed,
    false,
  );
  assert.equal(
    validateAccountingEntryMutation({
      role: 'principal',
      actorName: 'Dr. Deepak Dhawan',
      entry: SUBMITTED_ENTRY,
      mutation: 'approve',
    }).allowed,
    true,
  );
  assert.equal(
    validateAccountingEntryMutation({
      role: 'accountant',
      actorName: 'Suresh Kumar',
      entry: APPROVED_LOCKED_ENTRY,
      mutation: 'delete',
    }).allowed,
    false,
  );
  assert.equal(
    validateAccountingEntryMutation({
      role: 'principal',
      actorName: 'Dr. Deepak Dhawan',
      entry: APPROVED_LOCKED_ENTRY,
      mutation: 'delete',
    }).allowed,
    false,
  );

  // Payroll guard
  assert.equal(validatePayrollApproval({ role: 'accountant', entry: PAYROLL_ROW }).allowed, false);
  assert.equal(validatePayrollApproval({ role: 'principal', entry: PAYROLL_ROW }).allowed, true);
});

test('extractAccountingDraftFromDocument parses fuel bills cleanly into draft entries', () => {
  const draft = extractAccountingDraftFromDocument({
    fileName: 'diesel-bus-04-nov.pdf',
    rawText: 'Vendor: Haryana HPCL Fuel Station\nBus 04 diesel refill Rs. 7,250 paid via UPI',
  });
  assert.equal(draft.category, 'Bus Fuel Expense');
  assert.equal(draft.direction, 'Expense');
  assert.equal(draft.busCode, 'BUS-04');
  assert.equal(draft.amountInr, 7250);
  assert.ok(draft.vendorOrParty.includes('HPCL'));
});
