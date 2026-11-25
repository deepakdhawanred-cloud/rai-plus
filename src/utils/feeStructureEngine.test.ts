import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildFeeStructureCsvTemplate,
  computeFeeStructureTotals,
  parseImportedFeeStructure,
} from './feeStructureEngine';

test('computes monthly, annual recurring, quarterly, and half-yearly totals accurately', () => {
  const totals = computeFeeStructureTotals({
    admissionFeeInr: 5000,
    annualChargesInr: 3600,
    tuitionMonthlyInr: 2500,
    labActivityMonthlyInr: 300,
    transportOptionalMonthlyInr: 950,
  });

  assert.equal(totals.totalMonthlyInr, 2800);
  assert.equal(totals.totalAnnualRecurringInr, 37200);
  assert.equal(totals.quarterlyInstallmentInr, 9300);
  assert.equal(totals.halfYearlyInstallmentInr, 18600);
});

test('parses Excel/Google Sheets TSV paste with flexible headers and currency symbols', () => {
  const tsv = [
    'Grade\tAdmission Fee\tAnnual Charges\tMonthly Tuition\tLab Fee\tBus\tPlan\tRemarks',
    'Nursery\t₹5,000\t₹3,000\t₹2,000\t₹250\t₹900\tMonthly\tPlay wing',
    '5th\t₹6,000\t₹4,000\t₹2,800\t₹400\t₹1,000\tQuarterly\tPrimary STEM',
  ].join('\n');

  const parsed = parseImportedFeeStructure(tsv, 'school-vis-jjr', '2026-27', 'Principal');
  assert.equal(parsed.detectedFormat, 'tsv');
  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].className, 'Nursery');
  assert.equal(parsed.rows[1].className, 'Class 5');
  assert.equal(parsed.rows[1].totalMonthlyInr, 3200);
  assert.equal(parsed.rows[1].totalAnnualRecurringInr, 42400);
  assert.equal(parsed.rows[1].quarterlyInstallmentInr, 10600);
});

test('round-trips CSV export template cleanly back through the importer', () => {
  const parsedInitial = parseImportedFeeStructure(
    JSON.stringify([
      {
        class: 'Class 8',
        admissionFee: 6500,
        annualCharges: 4200,
        tuitionMonthly: 3100,
        labActivityMonthly: 400,
        transportOptionalMonthly: 1050,
        defaultPaymentPlan: 'Half-Yearly',
        notes: 'Middle wing science & computer lab',
      },
    ]),
    'school-vis-jjr',
    '2026-27',
    'Principal',
  );
  assert.equal(parsedInitial.rows.length, 1);
  const csv = buildFeeStructureCsvTemplate(parsedInitial.rows);
  const reparsed = parseImportedFeeStructure(csv, 'school-vis-jjr', '2026-27', 'Principal');
  assert.equal(reparsed.rows.length, 1);
  assert.equal(reparsed.rows[0].className, 'Class 8');
  assert.equal(reparsed.rows[0].totalMonthlyInr, 3500);
  assert.equal(reparsed.rows[0].totalAnnualRecurringInr, 46200);
  assert.equal(reparsed.rows[0].defaultPaymentPlan, 'Half-Yearly');
});
