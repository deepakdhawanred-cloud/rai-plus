import type {
  DismissedPartialMatch,
  FamilyAccount,
  FamilyAccountMemberSummary,
  FeeLedgerAccount,
  FeeMonthKey,
  FeePaymentReceipt,
  FeeTransaction,
  PartialSiblingCandidate,
  PartialSiblingMemberInfo,
  SiblingClusterStatus,
  SiblingFamilyGroup,
  StudentRecord,
  UserAccount,
} from '../types';
import {
  ACADEMIC_FEE_MONTHS,
  emptyMonthlyPaidMap,
  extractRemarkSiblingTokens,
  normalizeFeeClassName,
  normalizeIndianPhone,
  normalizePersonName,
} from './financialDashboardEngine.ts';

const PLACEHOLDER_PHONE_DIGITS = new Set([
  '0000000000',
  '1111111111',
  '2222222222',
  '3333333333',
  '4444444444',
  '5555555555',
  '6666666666',
  '7777777777',
  '8888888888',
  '9999999999',
  '1234567890',
  '9812500000',
  '9876543210',
]);

const GENERIC_SURNAMES = new Set([
  'kumar',
  'kumari',
  'devi',
  'singh',
  'kaur',
  'sharma',
  'yadav',
  'verma',
  'gupta',
  'kr',
  'ram',
  'lal',
]);

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'rediffmail.com',
  'live.com',
]);

export function normalizeVerifiedContactPhone(raw: string | undefined | null): string {
  const digits = normalizeIndianPhone(raw);
  if (!digits || digits.length < 7) return '';
  if (PLACEHOLDER_PHONE_DIGITS.has(digits)) return '';
  if (/^(\d)\1+$/.test(digits)) return '';
  return digits;
}

function cleanPhoneDigitsOnly(raw: string | undefined | null): string {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 11) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length >= 10) {
    digits = digits.slice(1);
  }
  if (!digits || digits.length < 7) return '';
  if (digits.length > 10) digits = digits.slice(-10);
  if (PLACEHOLDER_PHONE_DIGITS.has(digits)) return '';
  if (/^(\d)\1+$/.test(digits)) return '';
  return digits;
}

function areSimilarGuardianNames(a: string, b: string): boolean {
  const na = normalizePersonName(a);
  const nb = normalizePersonName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wa = na.split(' ');
  const wb = nb.split(' ');
  if (wa[0] === wb[0] && wa[0].length >= 4) return true;
  if (
    Math.min(wa[0].length, wb[0].length) >= 4 &&
    (wa[0].startsWith(wb[0].slice(0, 4)) || wb[0].startsWith(wa[0].slice(0, 4)))
  ) {
    return true;
  }
  return false;
}

function areStronglySimilarGuardianNames(a: string, b: string): boolean {
  const na = normalizePersonName(a);
  const nb = normalizePersonName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wa = na.split(' ').filter(Boolean);
  const wb = nb.split(' ').filter(Boolean);
  if (wa.length === 0 || wb.length === 0) return false;

  // If both specify multi-word surnames that explicitly conflict (e.g. Verma vs Tanwar), do not match
  if (wa.length >= 2 && wb.length >= 2) {
    const lastA = wa[wa.length - 1];
    const lastB = wb[wb.length - 1];
    const compatibleLast =
      lastA === lastB ||
      lastA.startsWith(lastB) ||
      lastB.startsWith(lastA) ||
      (lastA === 'kr' && lastB === 'kumar') ||
      (lastB === 'kr' && lastA === 'kumar') ||
      diceBigramsSimilarity(lastA, lastB) >= 0.72;
    if (!compatibleLast) return false;
  }

  // Exact first name match (e.g. Krishan vs Krishan Sharma, Bijender vs Bijender Singh)
  if (wa[0] === wb[0] && wa[0].length >= 4) return true;
  // High bigram similarity on first name (>= 0.78 handles Sushil/Shushil, Kamlesh/Kamles, Yogendra/Yogendera)
  if (
    Math.min(wa[0].length, wb[0].length) >= 5 &&
    diceBigramsSimilarity(wa[0], wb[0]) >= 0.78
  ) {
    return true;
  }
  return false;
}

function extractDistinctiveSurname(fullName: string): string {
  const parts = normalizePersonName(fullName).split(' ').filter(Boolean);
  if (parts.length < 2) return '';
  const last = parts[parts.length - 1];
  if (last.length < 4 || GENERIC_SURNAMES.has(last)) return '';
  return last;
}

function diceBigramsSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const mapA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i += 1) {
    const bg = a.slice(i, i + 2);
    mapA.set(bg, (mapA.get(bg) || 0) + 1);
  }
  let hits = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const bg = b.slice(i, i + 2);
    const c = mapA.get(bg) || 0;
    if (c > 0) {
      hits += 1;
      mapA.set(bg, c - 1);
    }
  }
  return (2 * hits) / (a.length - 1 + (b.length - 1));
}

function areFuzzySimilarAddresses(a: string, b: string): boolean {
  const na = normalizePersonName(a);
  const nb = normalizePersonName(b);
  if (na.length < 4 || nb.length < 4) return false;
  if (na === nb) return true;
  if (na.length >= 6 && nb.length >= 6 && (na.includes(nb) || nb.includes(na))) return true;
  return diceBigramsSimilarity(na.replace(/\s+/g, ''), nb.replace(/\s+/g, '')) >= 0.78;
}

function computePhonePartialSignal(
  rawA: string,
  rawB: string,
): { kind: 'near-1' | 'near-2' | 'subseq' | 'suffix-5'; label: string } | null {
  const a = cleanPhoneDigitsOnly(rawA);
  const b = cleanPhoneDigitsOnly(rawB);
  if (!a || !b || a === b) return null;

  if (a.length === 10 && b.length === 10) {
    let diff = 0;
    for (let i = 0; i < 10; i += 1) {
      if (a[i] !== b[i]) diff += 1;
    }
    if (diff === 1) {
      return { kind: 'near-1', label: `Near-Match Phone (9/10 digits: ${a} / ${b})` };
    }
    if (diff === 2) {
      return { kind: 'near-2', label: `Near-Match Phone (8/10 digits: ${a} / ${b})` };
    }
  }

  // Missing-digit typo check (e.g. 981715810 vs 9817215810)
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length >= 8 && longer.length === shorter.length + 1) {
    let i = 0;
    let j = 0;
    let skipped = 0;
    while (i < shorter.length && j < longer.length) {
      if (shorter[i] === longer[j]) {
        i += 1;
        j += 1;
      } else {
        skipped += 1;
        j += 1;
        if (skipped > 1) break;
      }
    }
    if (skipped <= 1 && i === shorter.length) {
      return { kind: 'subseq', label: `Phone Digit Omission (${a} / ${b})` };
    }
  }

  if (a.length >= 6 && b.length >= 6 && a.slice(-5) === b.slice(-5)) {
    return { kind: 'suffix-5', label: `Shared Phone Suffix (•••${a.slice(-5)})` };
  }

  return null;
}

/**
 * Ensures every StudentRecord in `schoolId` has a linked FeeLedgerAccount so newly enrolled
 * students (via Student API, Admission CRM, or DMIT Vault) immediately participate in
 * unified family billing and payment synchronization.
 */
export function ensureFeeLedgerAccountsForStudents(params: {
  schoolId: string;
  students: StudentRecord[];
  feeAccounts: FeeLedgerAccount[];
  feeTransactions?: FeeTransaction[];
}): FeeLedgerAccount[] {
  const { schoolId, students, feeAccounts, feeTransactions = [] } = params;
  const nextAccounts = [...feeAccounts];

  const schoolStudents = students.filter((s) => s.schoolId === schoolId);
  const schoolAccounts = nextAccounts.filter((a) => a.schoolId === schoolId);

  const accByStudentId = new Map<string, FeeLedgerAccount>();
  const claimedAccIds = new Set<string>();
  for (const acc of schoolAccounts) {
    if (acc.studentId) {
      accByStudentId.set(acc.studentId, acc);
      claimedAccIds.add(acc.id);
    }
  }

  const txByStudentId = new Map<string, FeeTransaction>();
  for (const tx of feeTransactions) {
    if (tx.schoolId === schoolId) txByStudentId.set(tx.studentId, tx);
  }

  for (const st of schoolStudents) {
    let matched = accByStudentId.get(st.id);

    if (!matched) {
      const admKey = st.admissionNo.trim().toUpperCase();
      const nameNorm = normalizePersonName(st.name);
      matched =
        schoolAccounts.find(
          (a) =>
            !claimedAccIds.has(a.id) &&
            a.admissionNo.trim().toUpperCase() === admKey &&
            normalizePersonName(a.studentName) === nameNorm,
        ) ??
        schoolAccounts.find(
          (a) => !claimedAccIds.has(a.id) && a.admissionNo.trim().toUpperCase() === admKey,
        );

      if (matched) {
        matched.studentId = st.id;
        claimedAccIds.add(matched.id);
        accByStudentId.set(st.id, matched);
      }
    }

    if (matched) {
      const stPhone = normalizeVerifiedContactPhone(st.guardianPhone);
      const accPhone = normalizeVerifiedContactPhone(matched.contactNo);
      if (stPhone && !accPhone) {
        matched.contactNo = stPhone;
      }
      if (st.guardianName && !matched.fatherName) {
        matched.fatherName = st.guardianName;
      }
      if (st.address && !matched.address) {
        matched.address = st.address;
      }
      continue;
    }

    const tx = txByStudentId.get(st.id);
    const yearlyDemandInr = Math.max(0, Math.round(st.totalFeeAnnualInr || 36000));
    const balanceFeesInr = Math.max(0, Math.round(st.feeBalanceInr ?? yearlyDemandInr));
    const paidAmountInr = Math.max(0, yearlyDemandInr - balanceFeesInr);
    const monthlyPaidInr = emptyMonthlyPaidMap();
    if (paidAmountInr > 0) {
      monthlyPaidInr.April = paidAmountInr;
    }

    const created: FeeLedgerAccount = {
      id: `fee-acc-${st.schoolId}-${st.id}`,
      schoolId: st.schoolId,
      studentId: st.id,
      admissionType: 'NEW',
      admissionNo: st.admissionNo,
      studentName: st.name,
      fatherName: st.guardianName,
      className: normalizeFeeClassName(st.classSection),
      rawClass: st.classSection,
      contactNo: normalizeVerifiedContactPhone(st.guardianPhone) || st.guardianPhone || '',
      address: st.address || '',
      remarks: '',
      lastYearBalanceInr: 0,
      yearlyDemandInr,
      perMonthInr: Math.round(yearlyDemandInr / 12),
      monthlyPaidInr,
      paidAmountInr,
      settleAmountInr: 0,
      balanceFeesInr,
      fineInr: 0,
      scheduleCadence: tx?.schedule === 'Monthly' ? 'Monthly' : 'Quarterly',
      expectedScheduleNote: tx?.schedule || 'Quarterly',
      lastPaidDate: tx?.paidDate && tx.paidDate !== '-' ? tx.paidDate : undefined,
    };

    nextAccounts.push(created);
    schoolAccounts.push(created);
    claimedAccIds.add(created.id);
    accByStudentId.set(st.id, created);
  }

  return nextAccounts;
}

interface SiblingClusterNode {
  key: string;
  schoolId: string;
  student?: StudentRecord;
  feeAccount?: FeeLedgerAccount;
  admissionNo: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  guardianPhone: string;
  normalizedPhone: string;
  parentEmail?: string;
  address: string;
  remarks: string;
  totalDemandInr: number;
  paidAmountInr: number;
  balanceFeesInr: number;
}

function buildClusterNodes(params: {
  schoolId: string;
  students: StudentRecord[];
  feeAccounts: FeeLedgerAccount[];
  users?: UserAccount[];
}): SiblingClusterNode[] {
  const { schoolId, students, feeAccounts, users = [] } = params;
  const schoolStudents = students.filter((s) => s.schoolId === schoolId);
  const schoolAccounts = feeAccounts.filter((a) => a.schoolId === schoolId);
  const accountByStudentId = new Map<string, FeeLedgerAccount>();
  const attachedAccountIds = new Set<string>();

  for (const acc of schoolAccounts) {
    if (acc.studentId) {
      accountByStudentId.set(acc.studentId, acc);
    }
  }

  const parentUsers = users.filter(
    (u) => u.role === 'parent' && (u.schoolId === schoolId || u.schoolId === null),
  );
  const parentEmailByStudentId = new Map<string, string>();
  for (const pu of parentUsers) {
    if (!pu.email) continue;
    for (const sid of pu.linkedStudentIds || []) {
      parentEmailByStudentId.set(sid, pu.email.trim().toLowerCase());
    }
  }

  const nodes: SiblingClusterNode[] = [];
  for (const st of schoolStudents) {
    const acc = accountByStudentId.get(st.id);
    if (acc) attachedAccountIds.add(acc.id);

    const guardianPhone = st.guardianPhone || acc?.contactNo || '';
    const normalizedPhone =
      normalizeVerifiedContactPhone(st.guardianPhone) ||
      normalizeVerifiedContactPhone(acc?.contactNo);
    const totalDemandInr = acc
      ? Math.max(0, acc.lastYearBalanceInr + acc.yearlyDemandInr - acc.settleAmountInr)
      : Math.max(0, st.totalFeeAnnualInr || 0);
    const paidAmountInr = acc
      ? Math.max(0, acc.paidAmountInr)
      : Math.max(0, (st.totalFeeAnnualInr || 0) - (st.feeBalanceInr || 0));
    const balanceFeesInr = acc ? Math.max(0, acc.balanceFeesInr) : Math.max(0, st.feeBalanceInr || 0);

    nodes.push({
      key: `stu:${st.id}`,
      schoolId,
      student: st,
      feeAccount: acc,
      admissionNo: st.admissionNo || acc?.admissionNo || st.id,
      studentName: st.name,
      classSection: st.classSection || acc?.className || '',
      guardianName: (st.guardianName || acc?.fatherName || '').trim(),
      guardianPhone,
      normalizedPhone,
      parentEmail: st.guardianEmail?.trim().toLowerCase() || parentEmailByStudentId.get(st.id),
      address: st.address || acc?.address || '',
      remarks: acc?.remarks || '',
      totalDemandInr,
      paidAmountInr,
      balanceFeesInr,
    });
  }

  for (const acc of schoolAccounts) {
    if (attachedAccountIds.has(acc.id)) continue;
    const totalDemandInr = Math.max(
      0,
      acc.lastYearBalanceInr + acc.yearlyDemandInr - acc.settleAmountInr,
    );
    nodes.push({
      key: `acc:${acc.id}`,
      schoolId,
      feeAccount: acc,
      admissionNo: acc.admissionNo,
      studentName: acc.studentName,
      classSection: acc.rawClass || acc.className,
      guardianName: acc.fatherName.trim(),
      guardianPhone: acc.contactNo,
      normalizedPhone: normalizeVerifiedContactPhone(acc.contactNo),
      address: acc.address || '',
      remarks: acc.remarks || '',
      totalDemandInr,
      paidAmountInr: Math.max(0, acc.paidAmountInr),
      balanceFeesInr: Math.max(0, acc.balanceFeesInr),
    });
  }

  return nodes;
}

export interface ReconcileFamilyAccountsResult {
  feeAccounts: FeeLedgerAccount[];
  siblingGroups: SiblingFamilyGroup[];
  familyAccounts: FamilyAccount[];
  newlyDetectedCount: number;
}

/**
 * Automatically detects sibling clusters across `StudentRecord` entries in the student database
 * (enriched with parent portal accounts and ledger records) based on:
 *   1. Shared Parent Contact Phone (`guardianPhone` / `contactNo`)
 *   2. Shared Parent Account / Guardian Email (`users` linkedStudentIds / email)
 *   3. Matched Guardian Name & Locality/Address
 *   4. Sibling Remark Cross-Reference (`SEE WITH` / `+`)
 *   5. Persisted Manual Admin Merges (`isManualMerge === true`)
 *
 * Synthesizes unified `FamilyAccount` objects and keeps `SiblingFamilyGroup`, `StudentRecord`,
 * `FeeLedgerAccount`, and `FeePaymentReceipt` payment totals synchronized.
 */
export function reconcileStudentFamilyAccounts(params: {
  schoolId: string;
  students: StudentRecord[];
  feeAccounts: FeeLedgerAccount[];
  siblingGroups: SiblingFamilyGroup[];
  familyAccounts: FamilyAccount[];
  feeReceipts: FeePaymentReceipt[];
  feeTransactions?: FeeTransaction[];
  users?: UserAccount[];
  nowIso?: string;
}): ReconcileFamilyAccountsResult {
  const {
    schoolId,
    students,
    feeAccounts,
    siblingGroups,
    familyAccounts,
    feeReceipts,
    feeTransactions = [],
    users = [],
    nowIso = new Date().toISOString(),
  } = params;

  const syncedAccounts = ensureFeeLedgerAccountsForStudents({
    schoolId,
    students,
    feeAccounts,
    feeTransactions,
  });

  const nodes = buildClusterNodes({
    schoolId,
    students,
    feeAccounts: syncedAccounts,
    users,
  });

  const n = nodes.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function find(x: number): number {
    let curr = x;
    while (parent[curr] !== curr) {
      parent[curr] = parent[parent[curr]];
      curr = parent[curr];
    }
    return curr;
  }

  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  }

  // Signal 1: Shared Parent Contact Phone (from student.guardianPhone or linked feeAccount.contactNo)
  const byPhone = new Map<string, number[]>();
  for (let i = 0; i < n; i += 1) {
    const p = nodes[i].normalizedPhone;
    if (!p) continue;
    if (!byPhone.has(p)) byPhone.set(p, []);
    byPhone.get(p)!.push(i);
  }
  for (const idxs of byPhone.values()) {
    if (idxs.length < 2) continue;
    for (let k = 1; k < idxs.length; k += 1) union(idxs[0], idxs[k]);
  }

  // Signal 2: Shared Parent Account / Guardian Email
  const byEmail = new Map<string, number[]>();
  for (let i = 0; i < n; i += 1) {
    const em = nodes[i].parentEmail;
    if (!em) continue;
    if (!byEmail.has(em)) byEmail.set(em, []);
    byEmail.get(em)!.push(i);
  }
  for (const idxs of byEmail.values()) {
    if (idxs.length < 2) continue;
    for (let k = 1; k < idxs.length; k += 1) union(idxs[0], idxs[k]);
  }

  // Signal 3: Matched Guardian Name + Address / Locality
  const byGuardianAddr = new Map<string, number[]>();
  for (let i = 0; i < n; i += 1) {
    const g = normalizePersonName(nodes[i].guardianName);
    const addr = normalizePersonName(nodes[i].address);
    if (g.length < 4 || addr.length < 3) continue;
    const key = `${g}::${addr}`;
    if (!byGuardianAddr.has(key)) byGuardianAddr.set(key, []);
    byGuardianAddr.get(key)!.push(i);
  }
  for (const idxs of byGuardianAddr.values()) {
    if (idxs.length < 2) continue;
    for (let k = 1; k < idxs.length; k += 1) union(idxs[0], idxs[k]);
  }

  // Signal 4: Sibling Remark Cross-Reference (SEE WITH / +)
  for (let i = 0; i < n; i += 1) {
    const tokens = extractRemarkSiblingTokens(nodes[i].remarks);
    if (tokens.length === 0) continue;
    const fI = normalizePersonName(nodes[i].guardianName);
    const pI = nodes[i].normalizedPhone;

    for (let j = 0; j < n; j += 1) {
      if (i === j) continue;
      const stuJ = normalizePersonName(nodes[j].studentName);
      const stuJFirst = stuJ.split(' ')[0] || '';
      const fJ = normalizePersonName(nodes[j].guardianName);
      const pJ = nodes[j].normalizedPhone;

      const fatherCompatible =
        (fI && fJ && areSimilarGuardianNames(fI, fJ)) || (pI && pJ && pI === pJ);
      if (!fatherCompatible) continue;

      const normalizedClassJ = normalizeFeeClassName(nodes[j].classSection);
      const tokenMatchesJ = tokens.some(
        (t) =>
          t.firstName.length >= 3 &&
          (stuJFirst === t.firstName ||
            stuJFirst.startsWith(t.firstName.slice(0, 4)) ||
            t.firstName.startsWith(stuJFirst.slice(0, 4))) &&
          (!t.classHint ||
            t.classHint === normalizedClassJ ||
            nodes[j].remarks.toLowerCase().includes(nodes[i].studentName.toLowerCase().split(' ')[0])),
      );

      if (tokenMatchesJ) union(i, j);
    }
  }

  const existingSchoolGroups = siblingGroups.filter((g) => g.schoolId === schoolId);
  const existingSchoolFamilies = familyAccounts.filter((f) => f.schoolId === schoolId);
  const schoolReceipts = feeReceipts.filter((r) => r.schoolId === schoolId);

  // Signal 5: Persisted Manual Admin Merges (preserves manually merged partial-match families)
  const indexByStudentId = new Map<string, number>();
  const indexByAccountId = new Map<string, number>();
  for (let i = 0; i < n; i += 1) {
    const sid = nodes[i].student?.id;
    const aid = nodes[i].feeAccount?.id;
    if (sid) indexByStudentId.set(sid, i);
    if (aid) indexByAccountId.set(aid, i);
  }

  for (const prevFam of existingSchoolFamilies) {
    if (!prevFam.isManualMerge || prevFam.status === 'Dismissed') continue;
    const memberIndices = new Set<number>();
    for (const sid of prevFam.memberStudentIds || []) {
      const idx = indexByStudentId.get(sid);
      if (idx !== undefined) memberIndices.add(idx);
    }
    for (const aid of prevFam.memberAccountIds || []) {
      const idx = indexByAccountId.get(aid);
      if (idx !== undefined) memberIndices.add(idx);
    }
    const list = Array.from(memberIndices);
    for (let k = 1; k < list.length; k += 1) {
      union(list[0], list[k]);
    }
  }

  const clusters = new Map<number, SiblingClusterNode[]>();
  for (let i = 0; i < n; i += 1) {
    const root = find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(nodes[i]);
  }

  const nextSchoolGroups: SiblingFamilyGroup[] = [];
  const nextSchoolFamilies: FamilyAccount[] = [];
  let newlyDetectedCount = 0;

  for (const members of clusters.values()) {
    if (members.length < 2) continue;

    const clusterStuIds = new Set(
      members.map((m) => m.student?.id).filter((id): id is string => Boolean(id)),
    );
    const clusterAccIds = new Set(
      members.map((m) => m.feeAccount?.id).filter((id): id is string => Boolean(id)),
    );

    const matchingPrevFamilies = existingSchoolFamilies.filter(
      (f) =>
        f.memberStudentIds.some((id) => clusterStuIds.has(id)) ||
        f.memberAccountIds.some((id) => clusterAccIds.has(id)),
    );
    const prevFamily =
      matchingPrevFamilies.find((f) => f.isManualMerge && f.status === 'Merged') ??
      matchingPrevFamilies.find((f) => f.status === 'Merged') ??
      matchingPrevFamilies[0];

    const matchingPrevGroups = existingSchoolGroups.filter((g) =>
      g.memberAccountIds.some((id) => clusterAccIds.has(id)),
    );
    const prevGroup =
      matchingPrevGroups.find((g) => g.isManualMerge && g.status === 'Merged') ??
      matchingPrevGroups.find((g) => g.status === 'Merged') ??
      matchingPrevGroups[0];

    const preferredPrimaryAccountId =
      prevFamily?.primaryAccountId || prevGroup?.primaryAccountId;
    const preferredPrimaryStudentId = prevFamily?.primaryStudentId;

    // Sort primary billing member first (explicitly chosen primary overrides balance sort)
    members.sort((a, b) => {
      const aIsChosen =
        (preferredPrimaryAccountId && a.feeAccount?.id === preferredPrimaryAccountId) ||
        (preferredPrimaryStudentId && a.student?.id === preferredPrimaryStudentId);
      const bIsChosen =
        (preferredPrimaryAccountId && b.feeAccount?.id === preferredPrimaryAccountId) ||
        (preferredPrimaryStudentId && b.student?.id === preferredPrimaryStudentId);
      if (aIsChosen && !bIsChosen) return -1;
      if (bIsChosen && !aIsChosen) return 1;
      const scoreA = a.totalDemandInr + a.balanceFeesInr;
      const scoreB = b.totalDemandInr + b.balanceFeesInr;
      return scoreB - scoreA;
    });

    const primary = members[0];
    const memberStudentIds = members
      .map((m) => m.student?.id)
      .filter((id): id is string => Boolean(id));
    const memberAccountIds = members
      .map((m) => m.feeAccount?.id)
      .filter((id): id is string => Boolean(id));

    const accIdSet = new Set(memberAccountIds);

    // Collect detection signals
    const signals = new Set<string>();
    const isManualMerge = Boolean(
      (prevFamily?.isManualMerge || prevGroup?.isManualMerge) &&
        (prevFamily?.status ?? prevGroup?.status) !== 'Dismissed',
    );
    if (isManualMerge) {
      signals.add('Manual Admin Review & Merge');
    }
    for (let x = 0; x < members.length; x += 1) {
      if (extractRemarkSiblingTokens(members[x].remarks).length > 0) {
        signals.add('Sibling Remark Cross-Reference');
      }
      for (let y = x + 1; y < members.length; y += 1) {
        const a = members[x];
        const b = members[y];
        if (a.normalizedPhone && a.normalizedPhone === b.normalizedPhone) {
          signals.add('Shared Contact Phone');
        }
        if (a.parentEmail && a.parentEmail === b.parentEmail) {
          signals.add('Shared Parent Contact Email');
        }
        if (
          areSimilarGuardianNames(a.guardianName, b.guardianName) &&
          normalizePersonName(a.address).length >= 3 &&
          normalizePersonName(a.address) === normalizePersonName(b.address)
        ) {
          signals.add('Matched Guardian & Locality');
        }
      }
    }
    if (signals.size === 0) signals.add('Parent Contact Match');

    if (!prevGroup && !prevFamily) {
      newlyDetectedCount += 1;
    }

    const admSlug = primary.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '') || 'fam';
    const groupId = prevGroup?.id || `fam-${schoolId}-${admSlug}-${members.length}`;
    const familyId = prevFamily?.id || `family-acct-${schoolId}-${admSlug}-${members.length}`;
    const resolvedStatus: SiblingClusterStatus =
      prevFamily?.status ?? prevGroup?.status ?? 'Alert';

    const useManualCanonical = Boolean(isManualMerge || prevFamily?.reviewedBy);
    const guardianName =
      (useManualCanonical ? prevFamily?.guardianName : undefined) ||
      primary.guardianName ||
      members.find((m) => m.guardianName)?.guardianName ||
      'Parent / Guardian';
    const guardianPhone =
      (useManualCanonical ? prevFamily?.guardianPhone : undefined) ||
      primary.guardianPhone ||
      members.find((m) => m.guardianPhone)?.guardianPhone ||
      '';
    const normalizedPhone =
      normalizeVerifiedContactPhone(guardianPhone) ||
      primary.normalizedPhone ||
      members.find((m) => m.normalizedPhone)?.normalizedPhone ||
      '';
    const address =
      (useManualCanonical ? prevFamily?.address : undefined) ??
      (primary.address || members.find((m) => m.address)?.address || '');
    const parentEmail =
      (useManualCanonical ? prevFamily?.parentEmail : undefined) ??
      (primary.parentEmail || members.find((m) => m.parentEmail)?.parentEmail);

    const signalList = Array.from(signals);

    const group: SiblingFamilyGroup = {
      id: groupId,
      schoolId,
      guardianName,
      contactNo: guardianPhone || normalizedPhone,
      address,
      memberAccountIds,
      primaryAccountId: primary.feeAccount?.id || memberAccountIds[0] || '',
      matchReasons: signalList,
      status: resolvedStatus,
      ...(isManualMerge ? { isManualMerge: true } : {}),
      updatedBy: prevGroup?.updatedBy || prevFamily?.reviewedBy,
      updatedAt: prevGroup?.updatedAt || prevFamily?.reviewedAt,
    };
    nextSchoolGroups.push(group);

    // Aggregate unified fee payment totals across all sibling members
    const monthlyPaidInr = emptyMonthlyPaidMap();
    let totalDemandInr = 0;
    let totalPaidInr = 0;
    let totalBalanceInr = 0;
    let lastPaymentDate: string | undefined;

    const memberSummaries: FamilyAccountMemberSummary[] = members.map((m, idx) => {
      totalDemandInr += m.totalDemandInr;
      totalPaidInr += m.paidAmountInr;
      totalBalanceInr += m.balanceFeesInr;

      if (m.feeAccount?.monthlyPaidInr) {
        for (const mk of ACADEMIC_FEE_MONTHS) {
          monthlyPaidInr[mk] = (monthlyPaidInr[mk] || 0) + (m.feeAccount.monthlyPaidInr[mk] || 0);
        }
      }
      const paidDate = m.feeAccount?.lastPaidDate;
      if (paidDate && /^\d{4}-\d{2}-\d{2}$/.test(paidDate)) {
        if (!lastPaymentDate || paidDate > lastPaymentDate) {
          lastPaymentDate = paidDate;
        }
      }

      return {
        studentId: m.student?.id,
        feeAccountId: m.feeAccount?.id,
        admissionNo: m.admissionNo,
        studentName: m.studentName,
        classSection: m.classSection,
        totalDemandInr: m.totalDemandInr,
        paidAmountInr: m.paidAmountInr,
        balanceFeesInr: m.balanceFeesInr,
        isPrimaryBilling: idx === 0,
      };
    });

    const matchingReceipts = schoolReceipts.filter(
      (r) =>
        r.familyGroupId === groupId ||
        r.accountIds.some((id) => accIdSet.has(id)),
    );
    for (const rcp of matchingReceipts) {
      if (rcp.paidDate && (!lastPaymentDate || rcp.paidDate > lastPaymentDate)) {
        lastPaymentDate = rcp.paidDate;
      }
    }

    const collectionRatePct =
      totalDemandInr > 0
        ? Math.round((totalPaidInr / totalDemandInr) * 1000) / 10
        : totalBalanceInr === 0
          ? 100
          : 0;

    const schoolPrefix = (schoolId.split('-')[1] || 'SCH').toUpperCase();
    const familyAccount: FamilyAccount = {
      id: familyId,
      schoolId,
      siblingGroupId: groupId,
      familyCode: prevFamily?.familyCode || `FAM-${schoolPrefix}-${admSlug.toUpperCase()}`,
      guardianName,
      guardianPhone,
      normalizedPhone,
      parentEmail,
      address: address || undefined,
      memberStudentIds,
      memberAccountIds,
      primaryStudentId: primary.student?.id,
      primaryAccountId: primary.feeAccount?.id,
      detectionSignals: signalList,
      status: resolvedStatus,
      ...(isManualMerge ? { isManualMerge: true } : {}),
      ...(prevFamily?.manualNotes ? { manualNotes: prevFamily.manualNotes } : {}),
      ...(prevFamily?.reviewedBy ? { reviewedBy: prevFamily.reviewedBy } : {}),
      ...(prevFamily?.reviewedAt ? { reviewedAt: prevFamily.reviewedAt } : {}),
      totalDemandInr,
      totalPaidInr,
      totalBalanceInr,
      collectionRatePct,
      monthlyPaidInr,
      members: memberSummaries,
      receiptIds: matchingReceipts.map((r) => r.id),
      lastPaymentDate,
      lastSyncedAt: nowIso,
    };
    nextSchoolFamilies.push(familyAccount);

    // Sync bi-directional family links onto StudentRecord & FeeLedgerAccount
    for (const m of members) {
      if (m.student) {
        m.student.familyAccountId = resolvedStatus === 'Dismissed' ? undefined : familyId;
      }
      if (m.feeAccount) {
        m.feeAccount.familyAccountId = resolvedStatus === 'Dismissed' ? undefined : familyId;
        m.feeAccount.familyGroupId = resolvedStatus === 'Merged' ? groupId : undefined;
      }
    }
  }

  // Clear stale links on students/accounts in this school no longer part of an active cluster
  const activeFamilyIds = new Set(nextSchoolFamilies.map((f) => f.id));
  const activeGroupIds = new Set(nextSchoolGroups.filter((g) => g.status === 'Merged').map((g) => g.id));
  for (const st of students) {
    if (st.schoolId === schoolId && st.familyAccountId && !activeFamilyIds.has(st.familyAccountId)) {
      st.familyAccountId = undefined;
    }
  }
  for (const acc of syncedAccounts) {
    if (acc.schoolId !== schoolId) continue;
    if (acc.familyAccountId && !activeFamilyIds.has(acc.familyAccountId)) {
      acc.familyAccountId = undefined;
    }
    if (acc.familyGroupId && !activeGroupIds.has(acc.familyGroupId)) {
      acc.familyGroupId = undefined;
    }
  }

  nextSchoolGroups.sort((a, b) => {
    const famA = nextSchoolFamilies.find((f) => f.siblingGroupId === a.id);
    const famB = nextSchoolFamilies.find((f) => f.siblingGroupId === b.id);
    return (famB?.totalBalanceInr ?? 0) - (famA?.totalBalanceInr ?? 0);
  });
  nextSchoolFamilies.sort((a, b) => b.totalBalanceInr - a.totalBalanceInr);

  const mergedGroups = [
    ...siblingGroups.filter((g) => g.schoolId !== schoolId),
    ...nextSchoolGroups,
  ];
  const mergedFamilies = [
    ...familyAccounts.filter((f) => f.schoolId !== schoolId),
    ...nextSchoolFamilies,
  ];

  return {
    feeAccounts: syncedAccounts,
    siblingGroups: mergedGroups,
    familyAccounts: mergedFamilies,
    newlyDetectedCount,
  };
}

/**
 * Surfaces partial parent-contact matches across students and ledger accounts that did not
 * satisfy strict automated auto-clustering criteria (e.g., 1-digit phone entry typos,
 * missing phone digit, shared multi-word guardian name + surname across separate phones,
 * or similar guardian + fuzzy locality spellings) so school administrators can manually
 * review side-by-side contact details and merge them safely.
 */
export function detectPartialContactMatches(params: {
  schoolId: string;
  students: StudentRecord[];
  feeAccounts: FeeLedgerAccount[];
  familyAccounts: FamilyAccount[];
  dismissedPartialMatches?: DismissedPartialMatch[];
  users?: UserAccount[];
}): PartialSiblingCandidate[] {
  const {
    schoolId,
    students,
    feeAccounts,
    familyAccounts,
    dismissedPartialMatches = [],
    users = [],
  } = params;

  const schoolAccounts = ensureFeeLedgerAccountsForStudents({
    schoolId,
    students,
    feeAccounts,
  });

  const nodes = buildClusterNodes({
    schoolId,
    students,
    feeAccounts: schoolAccounts,
    users,
  });

  const schoolFamilies = familyAccounts.filter((f) => f.schoolId === schoolId);
  const familyByStudentId = new Map<string, FamilyAccount>();
  const familyByAccountId = new Map<string, FamilyAccount>();
  for (const fam of schoolFamilies) {
    for (const sid of fam.memberStudentIds) familyByStudentId.set(sid, fam);
    for (const aid of fam.memberAccountIds) familyByAccountId.set(aid, fam);
  }

  function getActiveFamily(node: SiblingClusterNode): FamilyAccount | undefined {
    const f =
      (node.student?.id ? familyByStudentId.get(node.student.id) : undefined) ??
      (node.feeAccount?.id ? familyByAccountId.get(node.feeAccount.id) : undefined);
    return f && f.status !== 'Dismissed' ? f : undefined;
  }

  const schoolDismissed = dismissedPartialMatches.filter((d) => d.schoolId === schoolId);
  const dismissedPairSignatures = new Set<string>();
  const dismissedCandidateIds = new Set<string>();
  for (const d of schoolDismissed) {
    dismissedCandidateIds.add(d.id);
    const keys = [...d.memberKeys].sort();
    for (let x = 0; x < keys.length; x += 1) {
      for (let y = x + 1; y < keys.length; y += 1) {
        dismissedPairSignatures.add(`${keys[x]}|${keys[y]}`);
      }
    }
  }

  interface EdgeMatch {
    i: number;
    j: number;
    score: number;
    signals: string[];
  }

  const edges: EdgeMatch[] = [];
  const n = nodes.length;

  for (let i = 0; i < n; i += 1) {
    const a = nodes[i];
    const famA = getActiveFamily(a);
    const gA = normalizePersonName(a.guardianName);
    const gWordsA = gA.split(' ').filter(Boolean);
    const surnameA = extractDistinctiveSurname(a.studentName);
    const emailLocalA = a.parentEmail ? a.parentEmail.split('@')[0] : '';
    const emailDomainA = a.parentEmail ? a.parentEmail.split('@')[1] || '' : '';

    for (let j = i + 1; j < n; j += 1) {
      const b = nodes[j];
      const famB = getActiveFamily(b);

      // Already part of the exact same active FamilyAccount cluster
      if (famA && famB && famA.id === famB.id) continue;

      const pairSig = [a.key, b.key].sort().join('|');
      if (dismissedPairSignatures.has(pairSig)) continue;

      const gB = normalizePersonName(b.guardianName);
      const gWordsB = gB.split(' ').filter(Boolean);
      const surnameB = extractDistinctiveSurname(b.studentName);

      const exactGuardian = gA.length >= 4 && gA === gB;
      const similarGuardian = !exactGuardian && areStronglySimilarGuardianNames(gA, gB);
      const multiWordExactGuardian = exactGuardian && gWordsA.length >= 2 && gWordsB.length >= 2;

      const sameDistinctiveSurname = Boolean(surnameA && surnameB && surnameA === surnameB);
      const fuzzyLocality = areFuzzySimilarAddresses(a.address, b.address);
      const exactLocality =
        normalizePersonName(a.address).length >= 4 &&
        normalizePersonName(a.address) === normalizePersonName(b.address);

      const phoneSig = computePhonePartialSignal(a.guardianPhone, b.guardianPhone);

      const emailLocalB = b.parentEmail ? b.parentEmail.split('@')[0] : '';
      const emailDomainB = b.parentEmail ? b.parentEmail.split('@')[1] || '' : '';
      const sharedCustomDomain =
        Boolean(
          emailDomainA &&
            emailDomainB &&
            emailDomainA === emailDomainB &&
            !FREE_EMAIL_DOMAINS.has(emailDomainA),
        );
      const sharedEmailPrefix =
        Boolean(
          emailLocalA.length >= 5 &&
            emailLocalB.length >= 5 &&
            (emailLocalA === emailLocalB ||
              emailLocalA.startsWith(emailLocalB.slice(0, 5)) ||
              emailLocalB.startsWith(emailLocalA.slice(0, 5))),
        );

      let score = 0;
      const signals: string[] = [];

      if (phoneSig) {
        if (phoneSig.kind === 'near-1' || phoneSig.kind === 'subseq') {
          score += exactGuardian || similarGuardian ? 88 : exactLocality || fuzzyLocality ? 74 : 58;
          signals.push(phoneSig.label);
        } else if (phoneSig.kind === 'near-2') {
          if (exactGuardian || similarGuardian || sameDistinctiveSurname || exactLocality || fuzzyLocality) {
            score += 68;
            signals.push(phoneSig.label);
          }
        } else if (phoneSig.kind === 'suffix-5') {
          if (exactGuardian || similarGuardian || exactLocality || fuzzyLocality) {
            score += 64;
            signals.push(phoneSig.label);
          }
        }
      }

      if (multiWordExactGuardian) {
        if (sameDistinctiveSurname || exactLocality || fuzzyLocality || phoneSig) {
          score += 65;
        } else {
          score += 52;
        }
        signals.push(`Exact Multi-Word Guardian (${a.guardianName})`);
      } else if (exactGuardian) {
        if (fuzzyLocality && !exactLocality) {
          score += 72;
          signals.push(`Same Guardian (${a.guardianName})`);
        } else if (sameDistinctiveSurname) {
          score += 60;
          signals.push(`Same Guardian (${a.guardianName})`);
        } else if (phoneSig) {
          signals.push(`Same Guardian (${a.guardianName})`);
        }
      } else if (similarGuardian) {
        if (phoneSig || fuzzyLocality || sameDistinctiveSurname) {
          score += phoneSig ? 10 : 54;
          signals.push(`Similar Guardian (${a.guardianName} vs ${b.guardianName})`);
        }
      }

      if (sameDistinctiveSurname && (exactGuardian || similarGuardian || fuzzyLocality || phoneSig)) {
        score += 12;
        signals.push(`Shared Family Surname (${surnameA.toUpperCase()})`);
      }

      if (fuzzyLocality && !exactLocality && (exactGuardian || similarGuardian || sameDistinctiveSurname || phoneSig)) {
        score += 14;
        signals.push(`Similar Locality (${a.address} vs ${b.address})`);
      } else if (exactLocality && (phoneSig || sameDistinctiveSurname)) {
        score += 12;
        signals.push(`Shared Locality (${a.address})`);
      }

      if (sharedCustomDomain || sharedEmailPrefix) {
        score += 56;
        signals.push(
          sharedCustomDomain
            ? `Shared Household Email Domain (@${emailDomainA})`
            : `Similar Parent Email (${a.parentEmail} / ${b.parentEmail})`,
        );
      }

      if (score >= 52 && signals.length > 0) {
        edges.push({
          i,
          j,
          score: Math.min(96, score),
          signals: Array.from(new Set(signals)),
        });
      }
    }
  }

  // Group connected partial edges (keeping components compact, max 6 members)
  const parent = Array.from({ length: n }, (_, idx) => idx);
  const find = (x: number): number => {
    let curr = x;
    while (parent[curr] !== curr) {
      parent[curr] = parent[parent[curr]];
      curr = parent[curr];
    }
    return curr;
  };
  const compSize = new Array<number>(n).fill(1);
  edges.sort((a, b) => b.score - a.score);

  const acceptedEdges: EdgeMatch[] = [];
  for (const e of edges) {
    const ri = find(e.i);
    const rj = find(e.j);
    if (ri === rj) {
      acceptedEdges.push(e);
      continue;
    }
    if (compSize[ri] + compSize[rj] <= 5) {
      parent[rj] = ri;
      compSize[ri] += compSize[rj];
      acceptedEdges.push(e);
    }
  }

  const edgesByRoot = new Map<number, EdgeMatch[]>();
  const membersByRoot = new Map<number, Set<number>>();
  for (const e of acceptedEdges) {
    const r = find(e.i);
    if (!edgesByRoot.has(r)) edgesByRoot.set(r, []);
    if (!membersByRoot.has(r)) membersByRoot.set(r, new Set());
    edgesByRoot.get(r)!.push(e);
    membersByRoot.get(r)!.add(e.i);
    membersByRoot.get(r)!.add(e.j);
  }

  const candidates: PartialSiblingCandidate[] = [];
  for (const [root, idxSet] of membersByRoot.entries()) {
    const memberNodes = Array.from(idxSet).map((idx) => nodes[idx]);
    if (memberNodes.length < 2) continue;

    // Sort highest demand+balance first
    memberNodes.sort(
      (a, b) => b.totalDemandInr + b.balanceFeesInr - (a.totalDemandInr + a.balanceFeesInr),
    );

    const memberKeys = memberNodes.map((m) => m.key).sort();
    const candidateId = `partial-${schoolId}-${memberKeys
      .map((k) => k.replace(/[^a-zA-Z0-9]/g, ''))
      .join('__')
      .slice(0, 72)}`;

    if (dismissedCandidateIds.has(candidateId)) continue;

    const compEdges = edgesByRoot.get(root) || [];
    const maxScore = Math.max(...compEdges.map((e) => e.score));
    const signalSet = new Set<string>();
    for (const e of compEdges) {
      for (const s of e.signals) signalSet.add(s);
    }

    const memberInfos: PartialSiblingMemberInfo[] = memberNodes.map((m) => {
      const fam = getActiveFamily(m);
      return {
        nodeKey: m.key,
        studentId: m.student?.id,
        feeAccountId: m.feeAccount?.id,
        admissionNo: m.admissionNo,
        studentName: m.studentName,
        classSection: m.classSection,
        guardianName: m.guardianName,
        contactNo: m.guardianPhone,
        normalizedPhone: m.normalizedPhone,
        parentEmail: m.parentEmail,
        address: m.address,
        remarks: m.remarks,
        existingFamilyId: fam?.id,
        existingFamilyCode: fam?.familyCode,
        existingFamilyStatus: fam?.status,
        totalDemandInr: m.totalDemandInr,
        paidAmountInr: m.paidAmountInr,
        balanceFeesInr: m.balanceFeesInr,
      };
    });

    const combinedDemandInr = memberInfos.reduce((s, m) => s + m.totalDemandInr, 0);
    const combinedPaidInr = memberInfos.reduce((s, m) => s + m.paidAmountInr, 0);
    const combinedBalanceInr = memberInfos.reduce((s, m) => s + m.balanceFeesInr, 0);

    const lead = memberInfos[0];
    const suggestedGuardianName =
      memberInfos
        .map((m) => m.guardianName)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] || lead.guardianName;
    const suggestedPhone =
      memberInfos.find((m) => cleanPhoneDigitsOnly(m.contactNo).length === 10)?.contactNo ||
      lead.contactNo;
    const suggestedAddress =
      memberInfos
        .map((m) => m.address)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)[0] || '';
    const suggestedEmail = memberInfos.find((m) => m.parentEmail)?.parentEmail;

    candidates.push({
      id: candidateId,
      schoolId,
      confidencePct: maxScore,
      matchTier: maxScore >= 75 ? 'High' : 'Medium',
      partialSignals: Array.from(signalSet).slice(0, 4),
      suggestedGuardianName,
      suggestedPhone,
      suggestedAddress,
      suggestedEmail,
      memberKeys,
      members: memberInfos,
      combinedDemandInr,
      combinedPaidInr,
      combinedBalanceInr,
    });
  }

  candidates.sort((a, b) => {
    if (b.confidencePct !== a.confidencePct) return b.confidencePct - a.confidencePct;
    return b.combinedBalanceInr - a.combinedBalanceInr;
  });

  return candidates;
}

