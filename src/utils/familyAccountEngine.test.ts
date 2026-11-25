import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectPartialContactMatches,
  ensureFeeLedgerAccountsForStudents,
  normalizeVerifiedContactPhone,
  reconcileStudentFamilyAccounts,
} from './familyAccountEngine';
import { allocateFamilyPayment, emptyMonthlyPaidMap } from './financialDashboardEngine';
import type {
  DismissedPartialMatch,
  FamilyAccount,
  FeeLedgerAccount,
  FeePaymentReceipt,
  SiblingFamilyGroup,
  StudentRecord,
  UserAccount,
} from '../types';

function makeStudent(overrides: Partial<StudentRecord> & { id: string; name: string }): StudentRecord {
  return {
    schoolId: 'school-vis-jjr',
    admissionNo: `ADM-${overrides.id}`,
    rollNo: '01',
    classSection: '5-A',
    house: 'Arjuna House',
    guardianName: 'Guardian',
    guardianPhone: '+91 98120 11111',
    udiseStudentId: 'UD-1',
    haryanaMisId: 'HR-1',
    attendancePct: 95,
    feeBalanceInr: 20000,
    totalFeeAnnualInr: 36000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
    ...overrides,
  };
}

test('normalizeVerifiedContactPhone ignores empty and placeholder numbers to prevent false sibling merges', () => {
  assert.equal(normalizeVerifiedContactPhone('+91 98125 00000'), '');
  assert.equal(normalizeVerifiedContactPhone('0000000000'), '');
  assert.equal(normalizeVerifiedContactPhone('9999999999'), '');
  assert.equal(normalizeVerifiedContactPhone('+91 98120-44110'), '9812044110');
});

test('reconcileStudentFamilyAccounts detects siblings from student parent contacts and creates unified FamilyAccount with synced payment totals', () => {
  const s1 = makeStudent({
    id: 'stu-a',
    admissionNo: 'VIS9001',
    name: 'Aarav Sharma',
    classSection: '8-A',
    guardianName: 'Rakesh Sharma',
    guardianPhone: '+91 98120 77777',
    totalFeeAnnualInr: 40000,
    feeBalanceInr: 25000,
  });
  const s2 = makeStudent({
    id: 'stu-b',
    admissionNo: 'VIS9002',
    name: 'Ananya Sharma',
    classSection: '4-A',
    guardianName: 'Rakesh Sharma',
    guardianPhone: '9812077777',
    totalFeeAnnualInr: 32000,
    feeBalanceInr: 12000,
  });
  const s3UnrelatedDummyPhone = makeStudent({
    id: 'stu-c',
    admissionNo: 'VIS9003',
    name: 'Rohan Verma',
    classSection: '6-A',
    guardianName: 'Manoj Verma',
    guardianPhone: '+91 98125 00000',
    totalFeeAnnualInr: 30000,
    feeBalanceInr: 15000,
  });
  const s4UnrelatedDummyPhone = makeStudent({
    id: 'stu-d',
    admissionNo: 'VIS9004',
    name: 'Diya Gupta',
    classSection: '2-A',
    guardianName: 'Sandeep Gupta',
    guardianPhone: '+91 98125 00000',
    totalFeeAnnualInr: 30000,
    feeBalanceInr: 10000,
  });

  const result = reconcileStudentFamilyAccounts({
    schoolId: 'school-vis-jjr',
    students: [s1, s2, s3UnrelatedDummyPhone, s4UnrelatedDummyPhone],
    feeAccounts: [],
    siblingGroups: [],
    familyAccounts: [],
    feeReceipts: [],
    nowIso: '2026-11-16T08:00:00.000Z',
  });

  // 4 ledger accounts auto-provisioned 1-to-1
  assert.equal(result.feeAccounts.length, 4);

  // Only the two Sharma siblings are grouped; placeholder phones are never merged
  assert.equal(result.familyAccounts.length, 1);
  assert.equal(result.siblingGroups.length, 1);

  const fam = result.familyAccounts[0];
  assert.deepEqual(fam.memberStudentIds.sort(), ['stu-a', 'stu-b']);
  assert.equal(fam.primaryStudentId, 'stu-a'); // higher demand + balance
  assert.ok(fam.detectionSignals.includes('Shared Contact Phone'));
  assert.equal(fam.totalDemandInr, 72000);
  assert.equal(fam.totalPaidInr, 35000); // (40k-25k) + (32k-12k)
  assert.equal(fam.totalBalanceInr, 37000);
  assert.equal(s1.familyAccountId, fam.id);
  assert.equal(s2.familyAccountId, fam.id);
  assert.equal(s3UnrelatedDummyPhone.familyAccountId, undefined);

  // Simulate merging and collecting INR 30,000 across the unified family
  fam.status = 'Merged';
  result.siblingGroups[0].status = 'Merged';

  const memberAccs = result.feeAccounts.filter((a) => fam.memberAccountIds.includes(a.id));
  const alloc = allocateFamilyPayment(memberAccs, 30000, fam.primaryAccountId);
  assert.equal(alloc.valid, true);

  for (const part of alloc.allocations) {
    const acc = memberAccs.find((a) => a.id === part.accountId)!;
    if (!acc.monthlyPaidInr) acc.monthlyPaidInr = emptyMonthlyPaidMap();
    acc.monthlyPaidInr.November += part.allocatedInr;
    acc.paidAmountInr += part.allocatedInr;
    acc.balanceFeesInr -= part.allocatedInr;
    acc.lastPaidDate = '2026-11-16';
  }

  const receipt: FeePaymentReceipt = {
    id: 'frcp-test-1',
    receiptNo: 'RCP-VIS-9001',
    schoolId: 'school-vis-jjr',
    accountIds: alloc.allocations.map((a) => a.accountId),
    familyGroupId: fam.siblingGroupId,
    payerLabel: 'Rakesh Sharma Family',
    amountInr: 30000,
    paymentMode: 'UPI',
    monthKey: 'November',
    paidDate: '2026-11-16',
    recordedBy: 'Principal',
    allocations: alloc.allocations,
  };

  const afterPayment = reconcileStudentFamilyAccounts({
    schoolId: 'school-vis-jjr',
    students: [s1, s2, s3UnrelatedDummyPhone, s4UnrelatedDummyPhone],
    feeAccounts: result.feeAccounts,
    siblingGroups: result.siblingGroups,
    familyAccounts: result.familyAccounts,
    feeReceipts: [receipt],
    nowIso: '2026-11-16T08:05:00.000Z',
  });

  const updatedFam = afterPayment.familyAccounts[0];
  assert.equal(updatedFam.status, 'Merged');
  assert.equal(updatedFam.totalDemandInr, 72000);
  assert.equal(updatedFam.totalPaidInr, 65000);
  assert.equal(updatedFam.totalBalanceInr, 7000);
  assert.equal(updatedFam.monthlyPaidInr.November, 30000);
  assert.deepEqual(updatedFam.receiptIds, ['frcp-test-1']);
  assert.equal(updatedFam.lastPaymentDate, '2026-11-16');
});

test('reconcileStudentFamilyAccounts pairs siblings sharing parent portal account email even with distinct phone formats', () => {
  const s1 = makeStudent({
    id: 'stu-p1',
    name: 'Kabir Malhotra',
    guardianName: 'Sanjeev Malhotra',
    guardianPhone: '+91 98130 61200',
    totalFeeAnnualInr: 42000,
    feeBalanceInr: 12000,
  });
  const s2 = makeStudent({
    id: 'stu-p2',
    name: 'Riya Malhotra',
    guardianName: 'Meera Malhotra',
    guardianPhone: '+91 98130 61999', // different phone number, same parent account
    totalFeeAnnualInr: 34000,
    feeBalanceInr: 18000,
  });

  const parentUser: UserAccount = {
    id: 'usr-parent-malhotra',
    name: 'Sanjeev Malhotra',
    email: 'malhotra.family@example.com',
    role: 'parent',
    schoolId: 'school-vis-jjr',
    designation: 'Parent Guardian',
    linkedStudentIds: ['stu-p1', 'stu-p2'],
  };

  const res = reconcileStudentFamilyAccounts({
    schoolId: 'school-vis-jjr',
    students: [s1, s2],
    feeAccounts: [],
    siblingGroups: [],
    familyAccounts: [],
    feeReceipts: [],
    users: [parentUser],
  });

  assert.equal(res.familyAccounts.length, 1);
  const fam = res.familyAccounts[0];
  assert.ok(fam.detectionSignals.includes('Shared Parent Contact Email'));
  assert.equal(fam.parentEmail, 'malhotra.family@example.com');
  assert.equal(fam.totalDemandInr, 76000);
  assert.equal(fam.totalPaidInr, 46000);
  assert.equal(fam.totalBalanceInr, 30000);
});

test('ensureFeeLedgerAccountsForStudents syncs existing accounts and creates accounts only for unlinked students', () => {
  const s1 = makeStudent({ id: 'stu-x1', admissionNo: 'VIS101', name: 'Aarav', guardianPhone: '+91 98120 55555' });
  const existingAcc: FeeLedgerAccount = {
    id: 'fee-existing-1',
    schoolId: 'school-vis-jjr',
    admissionType: 'OLD',
    admissionNo: 'VIS101',
    studentName: 'Aarav',
    fatherName: 'Guardian',
    className: 'Class 5',
    rawClass: '5-A',
    contactNo: '',
    address: 'Jhajjar',
    remarks: '',
    lastYearBalanceInr: 0,
    yearlyDemandInr: 36000,
    perMonthInr: 3000,
    monthlyPaidInr: emptyMonthlyPaidMap(),
    paidAmountInr: 16000,
    settleAmountInr: 0,
    balanceFeesInr: 20000,
    fineInr: 0,
    scheduleCadence: 'Quarterly',
    expectedScheduleNote: 'Quarterly',
  };

  const accounts = ensureFeeLedgerAccountsForStudents({
    schoolId: 'school-vis-jjr',
    students: [s1],
    feeAccounts: [existingAcc],
  });

  assert.equal(accounts.length, 1);
  assert.equal(accounts[0].studentId, 'stu-x1');
  assert.equal(accounts[0].contactNo, '9812055555');
});

test('reconcileStudentFamilyAccounts pairs students via direct guardianEmail and guardianName+address on StudentRecord', () => {
  const s1 = makeStudent({
    id: 'stu-dir-1',
    name: 'Devika Yadav',
    guardianName: 'Sandeep Yadav',
    guardianPhone: '',
    guardianEmail: 'yadav.home@example.com',
    address: 'Sector 6 Jhajjar',
    totalFeeAnnualInr: 40000,
    feeBalanceInr: 15000,
  });
  const s2 = makeStudent({
    id: 'stu-dir-2',
    name: 'Karan Yadav',
    guardianName: 'Sandeep Yadav',
    guardianPhone: '',
    guardianEmail: 'YADAV.HOME@example.com',
    address: 'Sector 6 Jhajjar',
    totalFeeAnnualInr: 30000,
    feeBalanceInr: 10000,
  });

  const res = reconcileStudentFamilyAccounts({
    schoolId: 'school-vis-jjr',
    students: [s1, s2],
    feeAccounts: [],
    siblingGroups: [],
    familyAccounts: [],
    feeReceipts: [],
  });

  assert.equal(res.familyAccounts.length, 1);
  const fam = res.familyAccounts[0];
  assert.ok(fam.detectionSignals.includes('Shared Parent Contact Email'));
  assert.ok(fam.detectionSignals.includes('Matched Guardian & Locality'));
  assert.equal(fam.totalDemandInr, 70000);
  assert.equal(fam.totalPaidInr, 45000);
  assert.equal(fam.totalBalanceInr, 25000);
});

test('detectPartialContactMatches surfaces phone digit typos and guardian+surname partial overlaps while excluding merged and dismissed pairs', () => {
  const s1 = makeStudent({
    id: 'stu-pm-1',
    admissionNo: 'VIS-PM1',
    name: 'Gourav Sharma',
    classSection: 'Class 8',
    guardianName: 'Krishan Sharma',
    guardianPhone: '+91 9306624537',
    address: 'Lokra',
    totalFeeAnnualInr: 40000,
    feeBalanceInr: 22000,
  });
  const s2 = makeStudent({
    id: 'stu-pm-2',
    admissionNo: 'VIS-PM2',
    name: 'Yash',
    classSection: 'Class 5',
    guardianName: 'Krishan',
    guardianPhone: '+91 9306629537',
    address: 'Lokra',
    totalFeeAnnualInr: 32000,
    feeBalanceInr: 16000,
  });
  const s3 = makeStudent({
    id: 'stu-pm-3',
    admissionNo: 'VIS-PM3',
    name: 'Anvy Chauhan',
    classSection: 'Nursery',
    guardianName: 'Yogendera Singh Chauhan',
    guardianPhone: '+91 7880559231',
    address: 'Sidhrawali',
    totalFeeAnnualInr: 25000,
    feeBalanceInr: 12000,
  });
  const s4 = makeStudent({
    id: 'stu-pm-4',
    admissionNo: 'VIS-PM4',
    name: 'Kavya',
    classSection: 'Class 2',
    guardianName: 'Yogendra Singh Chauhan',
    guardianPhone: '+91 788055923',
    address: 'Sidhrawali',
    totalFeeAnnualInr: 28000,
    feeBalanceInr: 10000,
  });

  const partials = detectPartialContactMatches({
    schoolId: 'school-vis-jjr',
    students: [s1, s2, s3, s4],
    feeAccounts: [],
    familyAccounts: [],
  });

  assert.equal(partials.length, 2);
  assert.equal(partials[0].matchTier, 'High');
  assert.ok(partials[0].confidencePct >= 90);
  assert.ok(partials.some((p) => p.members.some((m) => m.studentId === 'stu-pm-1') && p.members.some((m) => m.studentId === 'stu-pm-2')));
  assert.ok(partials.some((p) => p.members.some((m) => m.studentId === 'stu-pm-3') && p.members.some((m) => m.studentId === 'stu-pm-4')));

  // Dismissing the first candidate hides it from subsequent scans
  const dismissed: DismissedPartialMatch = {
    id: partials[0].id,
    schoolId: 'school-vis-jjr',
    memberKeys: partials[0].memberKeys,
    summaryLabel: 'Dismissed pair',
    partialSignals: partials[0].partialSignals,
    dismissedBy: 'Principal',
    dismissedAt: '2026-11-17',
  };
  const afterDismiss = detectPartialContactMatches({
    schoolId: 'school-vis-jjr',
    students: [s1, s2, s3, s4],
    feeAccounts: [],
    familyAccounts: [],
    dismissedPartialMatches: [dismissed],
  });
  assert.equal(afterDismiss.length, 1);
  assert.equal(afterDismiss[0].id, partials[1].id);
});

test('reconcileStudentFamilyAccounts preserves manual admin merges and primary billing selection across differing phone numbers', () => {
  const s1 = makeStudent({
    id: 'stu-man-1',
    admissionNo: 'VIS-M1',
    name: 'Prachi Jatav',
    classSection: 'Class 1',
    guardianName: 'Harish Jatav',
    guardianPhone: '+91 8368194347',
    address: 'Mamta Medical',
    totalFeeAnnualInr: 30000,
    feeBalanceInr: 15000,
  });
  const s2 = makeStudent({
    id: 'stu-man-2',
    admissionNo: 'VIS-M2',
    name: 'Srishti Jatav',
    classSection: 'Nursery',
    guardianName: 'Harish Jatav',
    guardianPhone: '+91 9871708396',
    address: 'Kapriwas',
    totalFeeAnnualInr: 25000,
    feeBalanceInr: 10000,
  });

  const seededAccounts = ensureFeeLedgerAccountsForStudents({
    schoolId: 'school-vis-jjr',
    students: [s1, s2],
    feeAccounts: [],
  });

  const manualFamily: FamilyAccount = {
    id: 'family-manual-test-1',
    schoolId: 'school-vis-jjr',
    siblingGroupId: 'fam-manual-test-1',
    familyCode: 'FAM-VIS-M2',
    guardianName: 'Harish Jatav (Verified)',
    guardianPhone: '+91 9871708396',
    normalizedPhone: '9871708396',
    address: 'Kapriwas',
    memberStudentIds: ['stu-man-1', 'stu-man-2'],
    memberAccountIds: seededAccounts.map((a) => a.id),
    primaryStudentId: 'stu-man-2',
    primaryAccountId: seededAccounts[1].id,
    detectionSignals: ['Manual Admin Review & Merge'],
    status: 'Merged',
    isManualMerge: true,
    manualNotes: 'Verified father & mother separate numbers',
    reviewedBy: 'Dr. Deepak Dhawan',
    reviewedAt: '2026-11-17',
    totalDemandInr: 0,
    totalPaidInr: 0,
    totalBalanceInr: 0,
    collectionRatePct: 0,
    monthlyPaidInr: emptyMonthlyPaidMap(),
    members: [],
    receiptIds: [],
    lastSyncedAt: '2026-11-17T00:00:00.000Z',
  };

  const reconciled = reconcileStudentFamilyAccounts({
    schoolId: 'school-vis-jjr',
    students: [s1, s2],
    feeAccounts: seededAccounts,
    siblingGroups: [],
    familyAccounts: [manualFamily],
    feeReceipts: [],
  });

  assert.equal(reconciled.familyAccounts.length, 1);
  const fam = reconciled.familyAccounts[0];
  assert.equal(fam.status, 'Merged');
  assert.equal(fam.isManualMerge, true);
  assert.equal(fam.guardianName, 'Harish Jatav (Verified)');
  assert.equal(fam.primaryStudentId, 'stu-man-2');
  assert.equal(fam.members[0].studentId, 'stu-man-2');
  assert.equal(fam.members[0].isPrimaryBilling, true);
  assert.equal(fam.totalDemandInr, 55000);
  assert.equal(fam.totalBalanceInr, 25000);
  assert.ok(fam.detectionSignals.includes('Manual Admin Review & Merge'));

  // Once merged, partial contact detector should no longer suggest them
  const remainingPartials = detectPartialContactMatches({
    schoolId: 'school-vis-jjr',
    students: [s1, s2],
    feeAccounts: reconciled.feeAccounts,
    familyAccounts: reconciled.familyAccounts,
  });
  assert.equal(remainingPartials.length, 0);
});


