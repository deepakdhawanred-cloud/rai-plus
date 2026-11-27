import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  allocateFamilyPayment,
  buildStudentPaymentTimeline,
  computeFinancialDashboardMetrics,
  detectSiblingFamilyGroups,
  emptyMonthlyPaidMap,
  normalizeFeeClassName,
  parseInrCurrency,
  parseVisFeeCsv,
} from './financialDashboardEngine';
import {
  buildDefaultersListPdfDoc,
  buildStudentPaymentTimelinePdfDoc,
} from './financialPdfExporter';
import {
  createDefaultDefaulterAlertConfig,
  normalizeParentWhatsAppPhone,
  renderDefaulterAlertMessage,
  selectEligibleDefaultersForAlert,
} from './defaulterNotificationEngine';
import type {
  FeeDefaulterNotificationRecord,
  FeeLedgerAccount,
  FeeMonthKey,
  FeePaymentReceipt,
  SiblingFamilyGroup,
} from '../types';

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
    'public/assets/aistudio/VIS_FEES_RECORD_2026-2027_-_Final__1__efc80f07',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const accounts = parseVisFeeCsv(raw, 'school-vis-jjr');
  assert.equal(accounts.length, 538);

  const summary = computeFinancialDashboardMetrics({
    accounts,
    siblingGroups: detectSiblingFamilyGroups(accounts, [], 'school-vis-jjr'),
    activeMonth: 'November',
    todayIso: '2026-11-16',
  });

  // Check exact reconciliation with CSV footer totals
  assert.equal(summary.totalLastYearBalanceInr, 1940405);
  assert.equal(summary.totalYearlyDemandInr, 11817119);
  assert.equal(summary.totalCollectedYtdInr, 6582522);
  assert.equal(summary.totalOutstandingInr, 7070997);
  assert.equal(summary.totalFinesInr, 254450);
  assert.equal(summary.collectedThisMonthInr, 572116);
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

test('rankSchoolFeeDefaulters ranks by % left + paid YTD + balance left and excludes accounts already paid till current month across all schools', () => {
  const mkAcc = (
    id: string,
    schoolId: string,
    name: string,
    yearlyDemandInr: number,
    paidAmountInr: number,
    lastYearBalanceInr = 0,
  ): FeeLedgerAccount => ({
    id,
    schoolId,
    admissionType: 'OLD',
    admissionNo: id.toUpperCase(),
    studentName: name,
    fatherName: 'Guardian',
    className: 'Class 6',
    rawClass: '6th',
    contactNo: '9812000001',
    address: 'City',
    remarks: '',
    lastYearBalanceInr,
    yearlyDemandInr,
    perMonthInr: Math.round(yearlyDemandInr / 12),
    monthlyPaidInr: emptyMonthlyPaidMap(),
    paidAmountInr,
    settleAmountInr: 0,
    balanceFeesInr: Math.max(0, lastYearBalanceInr + yearlyDemandInr - paidAmountInr),
    fineInr: 0,
    scheduleCadence: 'Monthly',
    expectedScheduleNote: 'MONTHLY',
  });

  // Scenario in November (8 of 12 months elapsed = 66.7% due till Nov):
  // - Zero-payer (100% left, ₹0 paid, ₹25k bal) MUST outrank large partial payer (₹45k paid, ₹40k bal = 47.1% left)
  // - Student already paid ₹30k/₹40k (75% paid -> paid till Dec) MUST be excluded from current-month defaulters
  const accounts: FeeLedgerAccount[] = [
    mkAcc('s-paid-ahead', 'school-svm-kk', 'Paid Till Dec', 40000, 30000), // 75% paid -> covered through Nov!
    mkAcc('s-partial-big', 'school-svm-kk', 'Big Balance Partial Payer', 85000, 45000), // ₹40k left (47.1% left, ₹45k paid)
    mkAcc('s-zero-small', 'school-svm-kk', 'Zero Payer Smaller Fee', 25000, 0), // ₹25k left (100% left, ₹0 paid)
    mkAcc('s-zero-large', 'school-svm-kk', 'Zero Payer Larger Fee', 60000, 0), // ₹60k left (100% left, ₹0 paid)
    mkAcc('s-settled', 'school-svm-kk', 'Fully Settled', 36000, 36000), // ₹0 balance
  ];

  const metrics = computeFinancialDashboardMetrics({
    accounts,
    siblingGroups: [],
    activeMonth: 'November',
    todayIso: '2026-11-26',
  });

  assert.equal(metrics.defaulterAccountsCount, 3);
  assert.equal(metrics.paidTillCurrentMonthPendingCount, 1);
  assert.deepEqual(
    metrics.schoolTopDefaulters.map((d) => d.id),
    ['s-zero-large', 's-zero-small', 's-partial-big'],
  );
  assert.equal(metrics.schoolTopDefaulters[0].defaulterMetrics.percentLeft, 100);
  assert.equal(metrics.schoolTopDefaulters[1].defaulterMetrics.percentLeft, 100);
  assert.equal(metrics.schoolTopDefaulters[1].paidAmountInr, 0);
  assert.ok(
    metrics.schoolTopDefaulters[1].defaulterMetrics.defaulterPriorityScore >
      metrics.schoolTopDefaulters[2].defaulterMetrics.defaulterPriorityScore,
    'Zero-payer with 100% left must rank higher than partial payer who paid ₹45,000',
  );
  assert.ok(
    metrics.schoolTopDefaulters.every(
      (d) => !d.defaulterMetrics.hasPaidTillCurrentMonth && d.defaulterMetrics.overdueTillCurrentMonthInr > 0,
    ),
  );
});

test('buildStudentPaymentTimeline classifies payment nature accurately across the 12-month session', () => {
  const makeAccount = (
    id: string,
    monthlyDeposits: Partial<Record<FeeMonthKey, number>>,
    yearlyDemandInr = 36000,
    lastYearBalanceInr = 0,
  ): FeeLedgerAccount => {
    const monthlyPaidInr = emptyMonthlyPaidMap();
    let paidAmountInr = 0;
    for (const [m, amt] of Object.entries(monthlyDeposits)) {
      monthlyPaidInr[m as FeeMonthKey] = amt ?? 0;
      paidAmountInr += amt ?? 0;
    }
    return {
      id,
      schoolId: 'school-vis-jjr',
      admissionType: 'OLD',
      admissionNo: id.toUpperCase(),
      studentName: id,
      fatherName: 'Guardian',
      className: 'Class 5',
      rawClass: '5th',
      contactNo: '9812000099',
      address: 'Jhajjar',
      remarks: '',
      lastYearBalanceInr,
      yearlyDemandInr,
      perMonthInr: Math.round(yearlyDemandInr / 12),
      monthlyPaidInr,
      paidAmountInr,
      settleAmountInr: 0,
      balanceFeesInr: Math.max(0, lastYearBalanceInr + yearlyDemandInr - paidAmountInr),
      fineInr: 0,
      scheduleCadence: 'Monthly',
      expectedScheduleNote: 'MONTHLY',
    };
  };

  // 1. Zero Payment Yet (Apr–Nov = 8 elapsed months)
  const zeroTl = buildStudentPaymentTimeline({
    account: makeAccount('zero-payer', {}),
    activeMonth: 'November',
  });
  assert.equal(zeroTl.paymentNature, 'Zero Payment Yet');
  assert.equal(zeroTl.months.length, 12);
  assert.equal(zeroTl.consecutiveUnpaidMonths, 8);
  assert.equal(zeroTl.lastPaymentMonth, null);

  // 2. Regular Monthly Payer (paid ₹3,000 every month Apr–Nov)
  const regularTl = buildStudentPaymentTimeline({
    account: makeAccount('regular-payer', {
      April: 3000,
      May: 3000,
      June: 3000,
      July: 3000,
      August: 3000,
      September: 3000,
      October: 3000,
      November: 3000,
    }),
    activeMonth: 'November',
  });
  assert.equal(regularTl.paymentNature, 'Regular Monthly Payer');
  assert.equal(regularTl.activePaymentMonthsCount, 8);
  assert.equal(regularTl.consecutiveUnpaidMonths, 0);
  assert.equal(regularTl.lastPaymentMonth, 'November');
  assert.equal(regularTl.months[11].cumulativePaidInr, 24000);
  assert.equal(regularTl.months[11].cumulativeExpectedInr, 36000);

  // 3. Stalled Payer (paid Apr–Jul, then stopped Aug–Nov -> 4 consecutive unpaid months)
  const stalledTl = buildStudentPaymentTimeline({
    account: makeAccount('stalled-payer', {
      April: 3000,
      May: 3000,
      June: 3000,
      July: 3000,
    }),
    activeMonth: 'November',
  });
  assert.equal(stalledTl.paymentNature, 'Stalled Payer');
  assert.equal(stalledTl.consecutiveUnpaidMonths, 4);
  assert.equal(stalledTl.lastPaymentMonth, 'July');

  // 4. Advance / Lump-Sum Payer (paid ₹30,000 in April covering through January)
  const advanceTl = buildStudentPaymentTimeline({
    account: makeAccount('advance-payer', {
      April: 30000,
    }),
    activeMonth: 'November',
  });
  assert.equal(advanceTl.paymentNature, 'Advance / Lump-Sum Payer');
  assert.equal(advanceTl.activePaymentMonthsCount, 1);
  assert.equal(advanceTl.months[1].status, 'Covered Ahead');
  assert.equal(advanceTl.months[7].status, 'Covered Ahead');

  // 5. Quarterly / Periodic Payer (bulk chunks in April & July covering 6 months, small gap in Oct-Nov)
  const periodicTl = buildStudentPaymentTimeline({
    account: makeAccount('periodic-payer', {
      April: 9000,
      July: 9000,
      October: 3000,
    }),
    activeMonth: 'November',
  });
  assert.equal(periodicTl.paymentNature, 'Quarterly / Periodic Payer');
  assert.equal(periodicTl.largestPaymentInr, 9000);
});

test('financialPdfExporter generates valid PDFs for defaulter lists and student payment timelines', () => {
  const csvPath = path.resolve(
    process.cwd(),
    'public/assets/aistudio/VIS_FEES_RECORD_2026-2027_-_Final__1__efc80f07',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const accounts = parseVisFeeCsv(raw, 'school-vis-jjr');
  const metrics = computeFinancialDashboardMetrics({
    accounts,
    siblingGroups: [],
    activeMonth: 'November',
    todayIso: '2026-11-26',
  });

  // 1. Defaulters List PDF (multi-page landscape A4)
  const defaultersResult = buildDefaultersListPdfDoc({
    schoolName: 'Virat International School',
    schoolCode: 'VIS-JJR',
    session: '2026-2027',
    activeMonth: 'November',
    classScope: 'ALL',
    defaulters: metrics.schoolTopDefaulters.slice(0, 40),
    paidTillCurrentMonthExcludedCount: metrics.paidTillCurrentMonthPendingCount,
    generatedBy: 'Principal Admin',
    generatedAtIso: '2026-11-26',
  });
  const defaultersRaw = defaultersResult.doc.output();
  assert.ok(defaultersRaw.startsWith('%PDF-1.'), 'Expected valid PDF header for defaulters export');
  assert.ok(defaultersResult.doc.getNumberOfPages() >= 2, 'Expected multi-page pagination for 40 defaulters');
  assert.equal(defaultersResult.filename, 'vis-jjr-fee-defaulters-november-all-classes.pdf');

  // 2. Individual Student Payment Timeline PDF (portrait A4 with receipts)
  const sampleStudent = metrics.schoolTopDefaulters[0];
  const sampleReceipt: FeePaymentReceipt = {
    id: 'rcp-test-1',
    schoolId: 'school-vis-jjr',
    accountIds: [sampleStudent.id],
    receiptNo: 'VIS-2026-0001',
    paidDate: '2026-11-15',
    recordedBy: 'Accounts Desk',
    payerLabel: sampleStudent.studentName,
    amountInr: 4500,
    paymentMode: 'UPI',
    monthKey: 'November',
    coveredMonths: ['October', 'November'],
    allocations: [
      {
        accountId: sampleStudent.id,
        studentName: sampleStudent.studentName,
        className: sampleStudent.className,
        allocatedInr: 4500,
      },
    ],
  };

  const timelineResult = buildStudentPaymentTimelinePdfDoc({
    account: sampleStudent,
    schoolName: 'Virat International School',
    schoolCode: 'VIS-JJR',
    session: '2026-2027',
    activeMonth: 'November',
    receipts: [sampleReceipt],
    generatedBy: 'Accounts Officer',
    generatedAtIso: '2026-11-26',
  });
  const timelineRaw = timelineResult.doc.output();
  assert.ok(timelineRaw.startsWith('%PDF-1.'), 'Expected valid PDF header for timeline export');
  assert.ok(timelineResult.doc.getNumberOfPages() >= 1);
  assert.ok(timelineResult.filename.endsWith('.pdf'));
});

test('defaulterNotificationEngine filters high-priority defaulters, enforces cooldown, normalizes WhatsApp phones, and renders messages', () => {
  assert.equal(normalizeParentWhatsAppPhone('9812044110'), '+919812044110');
  assert.equal(normalizeParentWhatsAppPhone('0000000000'), null);
  assert.equal(normalizeParentWhatsAppPhone('12345'), null);

  const mkAcc = (
    id: string,
    yearlyDemandInr: number,
    paidAmountInr: number,
    contactNo: string,
  ): FeeLedgerAccount => ({
    id,
    schoolId: 'school-vis-jjr',
    admissionType: 'OLD',
    admissionNo: id.toUpperCase(),
    studentName: `Student ${id}`,
    fatherName: `Guardian ${id}`,
    className: 'Class 6',
    rawClass: '6th',
    contactNo,
    address: 'Jhajjar',
    remarks: '',
    lastYearBalanceInr: 0,
    yearlyDemandInr,
    perMonthInr: Math.round(yearlyDemandInr / 12),
    monthlyPaidInr: emptyMonthlyPaidMap(),
    paidAmountInr,
    settleAmountInr: 0,
    balanceFeesInr: Math.max(0, yearlyDemandInr - paidAmountInr),
    fineInr: 0,
    scheduleCadence: 'Monthly',
    expectedScheduleNote: 'MONTHLY',
  });

  const accounts = [
    mkAcc('crit-1', 40000, 0, '9812044110'), // Critical (100% left)
    mkAcc('crit-2', 36000, 0, '9812044111'), // Critical (100% left, will be in cooldown)
    mkAcc('watch-1', 36000, 21000, '9812044112'), // Low overdue (41.7% left -> below 45% threshold)
  ];

  const metrics = computeFinancialDashboardMetrics({
    accounts,
    siblingGroups: [],
    activeMonth: 'November',
    todayIso: '2026-11-26',
  });

  const config = createDefaultDefaulterAlertConfig('school-vis-jjr');
  const nowMs = Date.parse('2026-11-26T09:00:00Z');
  const recentLog: FeeDefaulterNotificationRecord = {
    id: 'fda-prev-1',
    schoolId: 'school-vis-jjr',
    accountId: 'crit-2',
    admissionNo: 'CRIT-2',
    studentName: 'Student crit-2',
    className: 'Class 6',
    guardianName: 'Guardian crit-2',
    channel: 'Both',
    deliveryChannels: [],
    status: 'Sent',
    triggerType: 'Automated Batch',
    activeMonth: 'November',
    riskTier: 'Critical',
    defaulterPriorityScore: 95,
    percentLeft: 100,
    overdueTillMonthInr: 24000,
    balanceDueInr: 36000,
    paymentNature: 'Zero Payment Yet',
    messageBody: 'Reminder',
    triggeredBy: 'Principal',
    sentAt: '2026-11-24T09:00:00Z', // 2 days ago -> inside 7-day cooldown
  };

  const selection = selectEligibleDefaultersForAlert({
    rankedDefaulters: metrics.schoolTopDefaulters,
    config,
    activeMonth: 'November',
    existingLogs: [recentLog],
    nowMs,
  });

  assert.deepEqual(
    selection.eligibleReady.map((c) => c.account.id),
    ['crit-1'],
  );
  assert.deepEqual(
    selection.skippedCooldown.map((c) => c.account.id),
    ['crit-2'],
  );
  assert.equal(selection.eligibleReady[0].phone, '+919812044110');

  const rendered = renderDefaulterAlertMessage(config.messageTemplate, {
    guardianName: 'Rajesh',
    studentName: 'Aarav',
    admissionNo: 'VIS1001',
    className: 'Class 6',
    schoolName: 'Virat International School',
    activeMonth: 'November',
    overdueTillMonthInr: 26667,
    balanceDueInr: 40000,
    percentLeft: 100,
    paymentNature: 'Zero Payment Yet',
  });
  assert.ok(rendered.includes('Dear Rajesh'));
  assert.ok(rendered.includes('Aarav'));
  assert.ok(rendered.includes('Rs. 26,667'));
  assert.ok(rendered.includes('100%'));
});




