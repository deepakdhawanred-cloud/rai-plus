import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildVisStaffProfilesFromParsed,
  inferBankNameFromIfsc,
  normalizeIfscCode,
  parseVisExpenseSheetCsv,
  parseVisSalarySheetCsv,
} from './visSalaryExpenseParser.ts';
import {
  buildMonthlyExpenseBreakdown,
  formatCompactInr,
  formatShortMonthKey,
} from '../components/MonthlyExpenseBreakdownChart.tsx';
import type { AccountingEntry } from '../types';

test('parseVisSalarySheetCsv parses uploaded VIS salary sheet accurately', () => {
  const csvPath = path.resolve(
    process.cwd(),
    'public/assets/aistudio/SALARY_SHEET_2026-2027_7f354103',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const parsed = parseVisSalarySheetCsv(raw);

  assert.equal(parsed.staffRows.length, 36, 'Should deduplicate 37 rows into 36 unique staff');
  assert.equal(parsed.duplicatesRemoved.length, 1, 'Should remove duplicate GEETA row');
  assert.match(parsed.duplicatesRemoved[0].name.toLowerCase(), /geeta/);

  const sonal = parsed.staffRows.find((r) => r.name.toLowerCase() === 'sonal');
  assert.ok(sonal, 'Sonal should be present');
  assert.equal(sonal.bankAccountNumber, '');
  assert.equal(sonal.ifscCode, '');
  assert.ok(parsed.missingBankNames.some((n) => n.toLowerCase() === 'sonal'));

  const seema = parsed.staffRows.find((r) => r.name.toLowerCase() === 'seema');
  assert.ok(seema, 'Seema should be present');
  assert.equal(seema.ifscCode, 'UBIN0567370', 'Should auto-fix letter O to digit 0 in IFSC');
  assert.equal(seema.bankName, 'Union Bank of India');
  assert.ok(parsed.ifscWarnings.length >= 1);

  const profiles = buildVisStaffProfilesFromParsed(parsed, 'school-vis-jjr');
  assert.equal(profiles.length, 36);
  assert.ok(profiles.every((p) => p.schoolId === 'school-vis-jjr' && p.baseMonthlySalaryInr > 0));
});

test('normalizeIfscCode and inferBankNameFromIfsc handle standard Indian IFSC prefixes', () => {
  assert.equal(normalizeIfscCode('UBINO567370').code, 'UBIN0567370');
  assert.equal(inferBankNameFromIfsc('PUNB0HGB001'), 'Sarva Haryana Gramin Bank');
  assert.equal(inferBankNameFromIfsc('HDFC0004425'), 'HDFC Bank');
  assert.equal(inferBankNameFromIfsc('CNRB0002880'), 'Canara Bank');
});

test('parseVisExpenseSheetCsv reconciles all monthly VIS 2026-27 income and expense totals', () => {
  const csvPath = path.resolve(
    process.cwd(),
    'public/assets/aistudio/EXPENSE_2026-27_034069f4',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const parsed = parseVisExpenseSheetCsv(raw, 'school-vis-jjr', 'vis_expense_2026_27');

  assert.equal(parsed.entries.length, 114, 'Should parse 22 income + 92 expense entries');
  const incomeEntries = parsed.entries.filter((e) => e.direction === 'Income');
  const expenseEntries = parsed.entries.filter((e) => e.direction === 'Expense');
  assert.equal(incomeEntries.length, 22);
  assert.equal(expenseEntries.length, 92);
  assert.equal(parsed.totalIncomeInr, 6025200);
  assert.equal(parsed.totalExpenseInr, 9155467);

  // Verify every expense starts unlabeled so Gemini API performs genuine categorization
  assert.ok(expenseEntries.every((e) => e.expenseClassification === undefined));

  // Verify multi-line projector continuation merged cleanly
  const projectorEntry = parsed.entries.find((e) =>
    e.description.toLowerCase().includes('projector'),
  );
  assert.ok(projectorEntry, 'Projector transfer row should be merged');
  assert.equal(projectorEntry.amountInr, 100000);

  // Verify cheque number extracted from col 8 note
  const chqEntry = parsed.entries.find((e) => (e.chequeOrRefNo || '').includes('982453'));
  assert.ok(chqEntry, 'Cheque reference 982453 should be preserved');

  // Verify exact monthly debit/credit sums against sheet
  const expectedByMonth: Record<string, { debit: number; credit: number }> = {
    '2026-04': { debit: 1660470, credit: 847485 },
    '2026-05': { debit: 878513, credit: 596298 },
    '2026-06': { debit: 835483, credit: 209116 },
    '2026-07': { debit: 1398907, credit: 608916 },
    '2026-08': { debit: 1099730, credit: 925563 },
    '2026-09': { debit: 1539171, credit: 1407490 },
    '2026-10': { debit: 926864, credit: 923816 },
    '2026-11': { debit: 816329, credit: 506516 },
  };
  for (const [mKey, expected] of Object.entries(expectedByMonth)) {
    const summary = parsed.monthSummaries.find((m) => m.monthKey === mKey);
    assert.ok(summary, `Missing summary for ${mKey}`);
    assert.equal(summary.expenseInr, expected.debit, `Debit mismatch in ${mKey}`);
    assert.equal(summary.incomeInr, expected.credit, `Credit mismatch in ${mKey}`);
  }
});

test('buildMonthlyExpenseBreakdown aggregates stacked Operational, Administrative, Developmental, and Uncategorized totals chronologically', () => {
  const sample: AccountingEntry[] = [
    {
      id: 'e1',
      schoolId: 'school-vis-jjr',
      date: '2026-05-10',
      monthKey: '2026-05',
      category: 'Bus Fuel Expense',
      direction: 'Expense',
      vendorOrParty: 'HPCL Diesel',
      description: 'Bus fuel',
      amountInr: 45000,
      paymentMode: 'Bank Transfer',
      status: 'approved',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-05-10T00:00:00Z',
      expenseClassification: 'Operational',
    },
    {
      id: 'e2',
      schoolId: 'school-vis-jjr',
      date: '2026-04-05',
      monthKey: '2026-04',
      category: 'School Rent',
      direction: 'Expense',
      vendorOrParty: 'Campus Lease',
      description: 'Monthly rent',
      amountInr: 120000,
      paymentMode: 'Cheque',
      status: 'approved',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-04-05T00:00:00Z',
      expenseClassification: 'Administrative',
    },
    {
      id: 'e3',
      schoolId: 'school-vis-jjr',
      date: '2026-04-12',
      monthKey: '2026-04',
      category: 'Infrastructure & Assets',
      direction: 'Expense',
      vendorOrParty: 'Smart Board Projector',
      description: 'Classroom upgrade',
      amountInr: 100000,
      paymentMode: 'Bank Transfer',
      status: 'approved',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-04-12T00:00:00Z',
      expenseClassification: 'Developmental',
    },
    {
      id: 'e4',
      schoolId: 'school-vis-jjr',
      date: '2026-05-15',
      monthKey: '2026-05',
      category: 'Vendor Purchase',
      direction: 'Expense',
      vendorOrParty: 'Unlabeled Vendor',
      description: 'Pending AI classification',
      amountInr: 15000,
      paymentMode: 'UPI',
      status: 'submitted',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-05-15T00:00:00Z',
    },
    {
      id: 'e5',
      schoolId: 'school-vis-jjr',
      date: '2026-04-20',
      monthKey: '2026-04',
      category: 'Fee Collection',
      direction: 'Income',
      vendorOrParty: 'Fee Receipt',
      description: 'Ignored by expense chart',
      amountInr: 500000,
      paymentMode: 'Bank Transfer',
      status: 'approved',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-04-20T00:00:00Z',
    },
    {
      id: 'e6',
      schoolId: 'school-vis-jjr',
      date: '2026-05-22',
      monthKey: '2026-05',
      category: 'Maintenance Expense',
      direction: 'Expense',
      vendorOrParty: 'Rejected Duplicate',
      description: 'Ignored rejected row',
      amountInr: 99999,
      paymentMode: 'Cash',
      status: 'rejected',
      periodLocked: false,
      createdBy: 'Accountant',
      createdByRole: 'accountant',
      createdAt: '2026-05-22T00:00:00Z',
      expenseClassification: 'Operational',
    },
  ];

  const breakdown = buildMonthlyExpenseBreakdown(sample);
  assert.equal(breakdown.months.length, 2);
  assert.equal(breakdown.months[0].monthKey, '2026-04');
  assert.equal(breakdown.months[0].monthLabel, "Apr '26");
  assert.equal(breakdown.months[0].Administrative, 120000);
  assert.equal(breakdown.months[0].Developmental, 100000);
  assert.equal(breakdown.months[0].totalInr, 220000);

  assert.equal(breakdown.months[1].monthKey, '2026-05');
  assert.equal(breakdown.months[1].Operational, 45000);
  assert.equal(breakdown.months[1].Uncategorized, 15000);
  assert.equal(breakdown.months[1].totalInr, 60000);

  assert.equal(breakdown.totals.totalExpenseInr, 280000);
  assert.equal(breakdown.counts.Operational, 1);
  assert.equal(breakdown.counts.Administrative, 1);
  assert.equal(breakdown.counts.Developmental, 1);
  assert.equal(breakdown.counts.Uncategorized, 1);

  assert.equal(formatShortMonthKey('2026-11'), "Nov '26");
  assert.equal(formatCompactInr(1250000), '₹12.5L');
  assert.equal(formatCompactInr(45000), '₹45k');
});
