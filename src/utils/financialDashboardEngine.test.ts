import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  allocateFamilyPayment,
  computeFinancialDashboardMetrics,
  detectSiblingFamilyGroups,
  emptyMonthlyPaidMap,
  normalizeFeeClassName,
  parseInrCurrency,
  parseVisFeeCsv,
} from './financialDashboardEngine';
import type { FeeLedgerAccount, SiblingFamilyGroup } from '../types';

test('parseInrCurrency and normalizeFeeClassName handle real VIS formats', () => {
  assert.equal(parseInrCurrency(' ? 20,600.00 '), 20600);
  assert.equal(parseInrCurrency(' ? -   '), 0);
  assert.equal(parseInrCurrency('3050'), 3050);
  assert.equal(normalizeFeeClassName('NUR '), 'Nursery');
  assert.equal(normalizeFeeClassName('1st'), 'Class 1');
  assert.equal(normalizeFeeClassName('12th '), 'Class 12');
  assert.equal(normalizeFeeClassName('9-A'), '9-A');
});

test('parseVisFeeCsv parses full VIS 2026-27 fee CSV to exact ledger totals', () => {
  const csvPath = path.resolve(
    process.cwd(),
    'public/assets/aistudio/VIS_FEES_RECORD_2026-2027_-_Final__1___version_1__43ccf4a7.csv',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const accounts = parseVisFeeCsv(raw, 'school-vis-jjr');
  assert.ok(accounts.length > 500, `Expected > 500 rows, got ${accounts.length}`);

  const summary = computeFinancialDashboardMetrics({
    accounts,
    siblingGroups: detectSiblingFamilyGroups(accounts, [], 'school-vis-jjr'),
    activeMonth: 'November',
    todayIso: '2026-11-16',
  });

  // Check exact reconciliation with CSV footer totals
  assert.equal(summary.totalLastYearBalanceInr, 1953275);
  assert.equal(summary.totalYearlyDemandInr, 11833619);
  assert.equal(summary.totalCollectedYtdInr, 5732806);
  assert.equal(summary.totalOutstandingInr, 7965383);
  assert.ok(summary.siblingAlerts.length > 80, 'Expected automated sibling pairing alerts across VIS ledger');
  assert.ok(summary.classSummaries.length >= 13, 'Expected Nursery through Class 12 summaries');
  assert.equal(summary.classSummaries[0].className, 'Nursery');
  const sumClassExpectedMonth = summary.classSummaries.reduce(
    (sum, cls) => sum + cls.expectedThisMonthInr,
    0,
  );
  const sumClassCollectedMonth = summary.classSummaries.reduce(
    (sum, cls) => sum + cls.collectedThisMonthInr,
    0,
  );
  assert.equal(sumClassExpectedMonth, summary.scheduleExpectedMonthInr);
  assert.equal(sumClassCollectedMonth, summary.collectedThisMonthInr);
  for (const cls of summary.classSummaries) {
    assert.ok(cls.monthAttainmentPct >= 0, `Expected non-negative attainment for ${cls.className}`);
  }
});

test('detectSiblingFamilyGroups pairs shared phone, guardian+locality, and SEE WITH remarks while preserving Merged state', () => {
  const sampleAccounts: FeeLedgerAccount[] = [
    {
      id: 'acc-1',
      schoolId: 'school-vis-jjr',
      admissionType: 'NEW',
      admissionNo: 'VIS7697',
      studentName: 'KAIRA',
      fatherName: 'DEEPAK',
      className: 'Class 4',
      rawClass: '4TH',
      contactNo: '8178929309',
      address: 'JHAJJAR',
      remarks: 'KAIRA (4TH) + RUTVI (2ND)',
      lastYearBalanceInr: 0,
      yearlyDemandInr: 37400,
      perMonthInr: 3000,
      monthlyPaidInr: emptyMonthlyPaidMap(),
      paidAmountInr: 0,
      settleAmountInr: 0,
      balanceFeesInr: 37400,
      fineInr: 0,
      scheduleCadence: 'Monthly',
      expectedScheduleNote: 'MONTHLY',
    },
    {
      id: 'acc-2',
      schoolId: 'school-vis-jjr',
      admissionType: 'NEW',
      admissionNo: 'VIS7617',
      studentName: 'RUTVI',
      fatherName: 'DEEPAK DHAWAN',
      className: 'Class 2',
      rawClass: '2nd',
      contactNo: '8178929309',
      address: 'JAJJAR',
      remarks: 'SEE WITH KAIRA (4TH) + RUTVI (2ND)',
      lastYearBalanceInr: 0,
      yearlyDemandInr: 0,
      perMonthInr: 0,
      monthlyPaidInr: emptyMonthlyPaidMap(),
      paidAmountInr: 0,
      settleAmountInr: 0,
      balanceFeesInr: 0,
      fineInr: 0,
      scheduleCadence: 'Monthly',
      expectedScheduleNote: '',
    },
    {
      id: 'acc-3',
      schoolId: 'school-vis-jjr',
      admissionType: 'OLD',
      admissionNo: 'VIS9999',
      studentName: 'SOLO STUDENT',
      fatherName: 'RAMESH',
      className: 'Class 6',
      rawClass: '6th',
      contactNo: '9811111111',
      address: 'KAPRIWAS',
      remarks: '',
      lastYearBalanceInr: 0,
      yearlyDemandInr: 25000,
      perMonthInr: 2000,
      monthlyPaidInr: emptyMonthlyPaidMap(),
      paidAmountInr: 10000,
      settleAmountInr: 0,
      balanceFeesInr: 15000,
      fineInr: 0,
      scheduleCadence: 'Monthly',
      expectedScheduleNote: 'MONTHLY',
    },
  ];

  const groups = detectSiblingFamilyGroups(sampleAccounts, [], 'school-vis-jjr');
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].memberAccountIds, ['acc-1', 'acc-2']);
  assert.equal(groups[0].primaryAccountId, 'acc-1');
  assert.ok(groups[0].matchReasons.includes('Shared Contact Phone'));
  assert.ok(groups[0].matchReasons.includes('Sibling Remark Cross-Reference'));

  const persistedMerged: SiblingFamilyGroup[] = [{ ...groups[0], status: 'Merged' }];
  const reDetected = detectSiblingFamilyGroups(sampleAccounts, persistedMerged, 'school-vis-jjr');
  assert.equal(reDetected[0].status, 'Merged');
});

test('computeFinancialDashboardMetrics handles target override and allocateFamilyPayment splits across siblings', () => {
  const m1 = emptyMonthlyPaidMap();
  m1.November = 2500;
  const accA: FeeLedgerAccount = {
    id: 'a1',
    schoolId: 'school-svm-kk',
    admissionType: 'OLD',
    admissionNo: 'SVM-1',
    studentName: 'Sibling One',
    fatherName: 'Suresh',
    className: 'Class 9',
    rawClass: '9-A',
    contactNo: '9812044110',
    address: 'Sector 7',
    remarks: 'SIBLING ONE + SIBLING TWO',
    lastYearBalanceInr: 0,
    yearlyDemandInr: 38000,
    perMonthInr: 3200,
    monthlyPaidInr: m1,
    paidAmountInr: 30000,
    settleAmountInr: 0,
    balanceFeesInr: 8000,
    fineInr: 0,
    scheduleCadence: 'Monthly',
    expectedScheduleNote: 'MONTHLY',
  };
  const accB: FeeLedgerAccount = {
    id: 'a2',
    schoolId: 'school-svm-kk',
    admissionType: 'NEW',
    admissionNo: 'SVM-2',
    studentName: 'Sibling Two',
    fatherName: 'Suresh',
    className: 'Class 5',
    rawClass: '5-A',
    contactNo: '9812044110',
    address: 'Sector 7',
    remarks: 'SEE WITH SIBLING ONE',
    lastYearBalanceInr: 0,
    yearlyDemandInr: 24000,
    perMonthInr: 2000,
    monthlyPaidInr: emptyMonthlyPaidMap(),
    paidAmountInr: 18000,
    settleAmountInr: 0,
    balanceFeesInr: 6000,
    fineInr: 0,
    scheduleCadence: 'Monthly',
    expectedScheduleNote: 'MONTHLY',
  };

  const metrics = computeFinancialDashboardMetrics({
    accounts: [accA, accB],
    siblingGroups: detectSiblingFamilyGroups([accA, accB], [], 'school-svm-kk'),
    targetConfig: {
      schoolId: 'school-svm-kk',
      monthKey: 'November',
      year: 2026,
      overrideTargetInr: 10000,
    },
    activeMonth: 'November',
    todayIso: '2026-11-16',
  });

  assert.equal(metrics.scheduleExpectedMonthInr, 5200);
  assert.equal(metrics.effectiveMonthTargetInr, 10000);
  assert.equal(metrics.isCustomTargetOverride, true);
  assert.equal(metrics.collectedThisMonthInr, 2500);
  assert.equal(metrics.mtdAttainmentPct, 25);

  const alloc = allocateFamilyPayment([accA, accB], 11000, 'a1');
  assert.equal(alloc.valid, true);
  assert.deepEqual(
    alloc.allocations.map((x) => ({ id: x.accountId, amt: x.allocatedInr })),
    [
      { id: 'a1', amt: 8000 },
      { id: 'a2', amt: 3000 },
    ],
  );

  const invalidAlloc = allocateFamilyPayment([accA, accB], 20000, 'a1');
  assert.equal(invalidAlloc.valid, false);
});
