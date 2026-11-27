import fs from 'node:fs';
import path from 'node:path';
import type {
  FamilyAccount,
  FeeLedgerAccount,
  FeePaymentReceipt,
  FeeTransaction,
  MonthlyFeeTargetConfig,
  SiblingFamilyGroup,
  StudentRecord,
  UserAccount,
} from '../src/types';
import {
  emptyMonthlyPaidMap,
  normalizeFeeClassName,
  normalizePersonName,
  parseVisFeeCsv,
} from '../src/utils/financialDashboardEngine.ts';
import { reconcileStudentFamilyAccounts } from '../src/utils/familyAccountEngine.ts';
import { CURATED_ADM_TO_STUDENT_ID } from './visRosterBuilder.ts';

export const VIS_FEE_CSV_RELATIVE_PATH =
  'public/assets/aistudio/VIS_FEES_RECORD_2026-2027_-_Final__1__efc80f07';

export const VIS_FEE_LEDGER_VERSION = 'VIS_FEES_2026_2027_FINAL_EFC80F07';

const VIS_FEE_CSV_PATH = path.resolve(
  process.cwd(),
  VIS_FEE_CSV_RELATIVE_PATH,
);

function buildPartnerTenantLedgers(
  students: StudentRecord[],
  feeTransactions: FeeTransaction[],
): FeeLedgerAccount[] {
  const accounts: FeeLedgerAccount[] = [];
  const txByStudent = new Map<string, FeeTransaction>();
  for (const tx of feeTransactions) {
    txByStudent.set(tx.studentId, tx);
  }

  for (const st of students) {
    if (st.schoolId === 'school-vis-jjr') continue;
    const tx = txByStudent.get(st.id);
    const yearlyDemandInr = st.totalFeeAnnualInr || 38000;
    const balanceFeesInr = Math.max(0, st.feeBalanceInr ?? 0);
    const paidAmountInr = Math.max(0, yearlyDemandInr - balanceFeesInr);
    const perMonthInr = Math.round(yearlyDemandInr / 12);

    const monthlyPaidInr = emptyMonthlyPaidMap();
    if (paidAmountInr > 0) {
      // Spread YTD collected across Apr-Oct realistically
      const activeMonths = ['April', 'May', 'July', 'August', 'September', 'October'] as const;
      const chunk = Math.floor(paidAmountInr / activeMonths.length);
      let rem = paidAmountInr;
      for (let i = 0; i < activeMonths.length; i += 1) {
        const take = i === activeMonths.length - 1 ? rem : chunk;
        monthlyPaidInr[activeMonths[i]] = take;
        rem -= take;
      }
    }

    accounts.push({
      id: `fee-acc-${st.schoolId}-${st.id}`,
      schoolId: st.schoolId,
      studentId: st.id,
      admissionType: 'OLD',
      admissionNo: st.admissionNo,
      studentName: st.name,
      fatherName: st.guardianName,
      className: normalizeFeeClassName(st.classSection),
      rawClass: st.classSection,
      contactNo: st.guardianPhone,
      address: st.schoolId === 'school-svm-kk' ? 'Sector 7, Kurukshetra' : 'Model Town, Karnal',
      remarks: '',
      lastYearBalanceInr: 0,
      yearlyDemandInr,
      perMonthInr,
      monthlyPaidInr,
      paidAmountInr,
      settleAmountInr: 0,
      balanceFeesInr,
      fineInr: balanceFeesInr > 5000 ? 250 : 0,
      scheduleCadence: tx?.schedule === 'Monthly' ? 'Monthly' : 'Quarterly',
      expectedScheduleNote: tx?.schedule || 'Quarterly',
      lastPaidDate: tx?.paidDate && tx.paidDate !== '-' ? tx.paidDate : 'October 2026',
    });
  }

  // Add a sibling ledger pair in SVM Kurukshetra for Suresh Mehta household demonstration
  const hasMehta = accounts.some((a) => a.schoolId === 'school-svm-kk' && a.studentId === 'stu-svm-101');
  if (hasMehta) {
    const monthlyPaidSibling = emptyMonthlyPaidMap();
    monthlyPaidSibling.April = 6000;
    monthlyPaidSibling.July = 6000;
    monthlyPaidSibling.October = 6000;
    accounts.push({
      id: 'fee-acc-school-svm-kk-anvi-mehta',
      schoolId: 'school-svm-kk',
      admissionType: 'OLD',
      admissionNo: 'SVM-2025-0318',
      studentName: 'Anvi Mehta',
      fatherName: 'Suresh Mehta',
      className: 'Class 5',
      rawClass: '5-A',
      contactNo: '+91 98120 44110',
      address: 'Sector 7, Kurukshetra',
      remarks: 'SEE WITH AARAV (9-A)',
      lastYearBalanceInr: 0,
      yearlyDemandInr: 28000,
      perMonthInr: 2350,
      monthlyPaidInr: monthlyPaidSibling,
      paidAmountInr: 18000,
      settleAmountInr: 0,
      balanceFeesInr: 10000,
      fineInr: 0,
      scheduleCadence: 'Quarterly',
      expectedScheduleNote: 'Quarterly Sibling Plan',
      lastPaidDate: '2026-10-14',
    });
  }

  // Add a DPA Karnal sibling pair so every tenant has rich sibling & class defaulter telemetry
  if (accounts.some((a) => a.schoolId === 'school-dpa-knl')) {
    const monthlyPaidDpaSib = emptyMonthlyPaidMap();
    monthlyPaidDpaSib.April = 8000;
    monthlyPaidDpaSib.August = 8000;
    accounts.push({
      id: 'fee-acc-school-dpa-knl-riya-malhotra',
      schoolId: 'school-dpa-knl',
      admissionType: 'NEW',
      admissionNo: 'DPA-2026-0118',
      studentName: 'Riya Malhotra',
      fatherName: 'Sanjeev Malhotra',
      className: 'Class 8',
      rawClass: '8-A',
      contactNo: '+91 98130 61200',
      address: 'Model Town, Karnal',
      remarks: 'SEE WITH KABIR (11-Science)',
      lastYearBalanceInr: 0,
      yearlyDemandInr: 34000,
      perMonthInr: 2850,
      monthlyPaidInr: monthlyPaidDpaSib,
      paidAmountInr: 16000,
      settleAmountInr: 0,
      balanceFeesInr: 18000,
      fineInr: 200,
      scheduleCadence: 'Monthly',
      expectedScheduleNote: 'MONTHLY',
      lastPaidDate: '2026-08-19',
    });
  }

  return accounts;
}

export function loadInitialFinancialState(
  students: StudentRecord[],
  feeTransactions: FeeTransaction[],
  existingGroups: SiblingFamilyGroup[] = [],
  users: UserAccount[] = [],
): {
  feeAccounts: FeeLedgerAccount[];
  siblingGroups: SiblingFamilyGroup[];
  familyAccounts: FamilyAccount[];
  financialTargets: Record<string, MonthlyFeeTargetConfig>;
  feeReceipts: FeePaymentReceipt[];
} {
  let visAccounts: FeeLedgerAccount[] = [];
  try {
    if (fs.existsSync(VIS_FEE_CSV_PATH)) {
      const csvRaw = fs.readFileSync(VIS_FEE_CSV_PATH, 'utf-8');
      visAccounts = parseVisFeeCsv(csvRaw, 'school-vis-jjr');
    }
  } catch (err) {
    console.warn('Could not read VIS fee CSV ledger:', err);
  }

  // Link VIS ledger accounts 1-to-1 to matching StudentRecord entries via admissionNo+name first, then admissionNo, then name
  const visStudents = students.filter((s) => s.schoolId === 'school-vis-jjr');
  const claimedStudentIds = new Set<string>();
  const visStudentById = new Map(visStudents.map((s) => [s.id, s]));

  for (const acc of visAccounts) {
    const admKey = acc.admissionNo.trim().toUpperCase();
    const accNorm = normalizePersonName(acc.studentName);

    const curatedId = CURATED_ADM_TO_STUDENT_ID[admKey];
    if (curatedId && visStudentById.has(curatedId) && !claimedStudentIds.has(curatedId)) {
      claimedStudentIds.add(curatedId);
      acc.studentId = curatedId;
      continue;
    }

    const exactAdmAndName = visStudents.find(
      (st) =>
        !claimedStudentIds.has(st.id) &&
        st.admissionNo.trim().toUpperCase() === admKey &&
        normalizePersonName(st.name) === accNorm,
    );
    if (exactAdmAndName) {
      claimedStudentIds.add(exactAdmAndName.id);
      acc.studentId = exactAdmAndName.id;
      continue;
    }

    const admMatch = visStudents.find(
      (st) => !claimedStudentIds.has(st.id) && st.admissionNo.trim().toUpperCase() === admKey,
    );
    if (admMatch) {
      claimedStudentIds.add(admMatch.id);
      acc.studentId = admMatch.id;
      continue;
    }

    const nameMatch = visStudents.find(
      (st) => !claimedStudentIds.has(st.id) && normalizePersonName(st.name) === accNorm,
    );
    if (nameMatch) {
      claimedStudentIds.add(nameMatch.id);
      acc.studentId = nameMatch.id;
    }
  }

  const partnerAccounts = buildPartnerTenantLedgers(students, feeTransactions);
  let feeAccounts = [...visAccounts, ...partnerAccounts];
  let siblingGroups: SiblingFamilyGroup[] = [];
  let familyAccounts: FamilyAccount[] = [];
  const feeReceipts: FeePaymentReceipt[] = [];

  for (const sid of ['school-vis-jjr', 'school-svm-kk', 'school-dpa-knl'] as const) {
    const synced = reconcileStudentFamilyAccounts({
      schoolId: sid,
      students,
      feeAccounts,
      siblingGroups,
      familyAccounts,
      feeReceipts,
      feeTransactions,
      users,
    });
    feeAccounts = synced.feeAccounts;
    siblingGroups = synced.siblingGroups;
    familyAccounts = synced.familyAccounts;
  }

  // Respect any pre-existing group statuses passed into loader
  if (existingGroups.length > 0) {
    const existingById = new Map(existingGroups.map((g) => [g.id, g]));
    for (const g of siblingGroups) {
      const prev = existingById.get(g.id);
      if (prev) {
        g.status = prev.status;
        g.updatedBy = prev.updatedBy;
        g.updatedAt = prev.updatedAt;
      }
    }
    for (const fam of familyAccounts) {
      if (fam.siblingGroupId && existingById.has(fam.siblingGroupId)) {
        fam.status = existingById.get(fam.siblingGroupId)!.status;
      }
    }
  }

  const financialTargets: Record<string, MonthlyFeeTargetConfig> = {
    'school-vis-jjr': {
      schoolId: 'school-vis-jjr',
      monthKey: 'November',
      year: 2026,
      overrideTargetInr: null,
    },
    'school-svm-kk': {
      schoolId: 'school-svm-kk',
      monthKey: 'November',
      year: 2026,
      overrideTargetInr: null,
    },
    'school-dpa-knl': {
      schoolId: 'school-dpa-knl',
      monthKey: 'November',
      year: 2026,
      overrideTargetInr: null,
    },
  };

  return {
    feeAccounts,
    siblingGroups,
    familyAccounts,
    financialTargets,
    feeReceipts,
  };
}
