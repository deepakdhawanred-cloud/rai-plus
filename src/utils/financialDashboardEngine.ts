import type {
  CanonicalFeePaymentPlan,
  FeeLedgerAccount,
  FeeMonthBreakdownItem,
  FeeMonthKey,
  FeeScheduleCadence,
  MonthlyFeeTargetConfig,
  SiblingFamilyGroup,
  UpcomingExpectedInstallment,
} from '../types';

export const CANONICAL_PAYMENT_PLANS: CanonicalFeePaymentPlan[] = [
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Yearly',
];

export function normalizePaymentPlan(
  cadence?: FeeScheduleCadence | string | null,
): CanonicalFeePaymentPlan {
  if (cadence === 'Monthly' || cadence === 'Quarterly' || cadence === 'Half-Yearly' || cadence === 'Yearly') {
    return cadence;
  }
  return 'Quarterly';
}

export const ACADEMIC_FEE_MONTHS: FeeMonthKey[] = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
];

export function emptyMonthlyPaidMap(): Record<FeeMonthKey, number> {
  return {
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
    January: 0,
    February: 0,
    March: 0,
  };
}

export function parseInrCurrency(raw: string | undefined | null): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹?,\s]/g, '').trim();
  if (!cleaned || cleaned === '-' || cleaned === '--') return 0;
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num) : 0;
}

export function normalizeFeeClassName(rawClass: string | undefined | null): string {
  const clean = (rawClass || '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'Unassigned';
  const lower = clean.toLowerCase();
  if (lower.startsWith('nur')) return 'Nursery';
  if (lower === 'lkg' || lower.startsWith('l.k.g')) return 'LKG';
  if (lower === 'ukg' || lower.startsWith('u.k.g')) return 'UKG';
  // Preserve section format if already e.g. 9-A, 11-Science
  if (/^\d+\s*-\s*[a-z]/i.test(clean)) {
    return clean.replace(/\s*-\s*/, '-');
  }
  const numMatch = clean.match(/^(\d+)(?:st|nd|rd|th)?$/i);
  if (numMatch) {
    return `Class ${Number(numMatch[1])}`;
  }
  if (/^ist$/i.test(clean)) return 'Class 1';
  const classPrefixMatch = clean.match(/^class\s+(\d+)/i);
  if (classPrefixMatch) return `Class ${Number(classPrefixMatch[1])}`;
  return clean;
}

export function getClassSortOrder(className: string): number {
  const lower = className.toLowerCase();
  if (lower === 'nursery' || lower === 'nur') return 0;
  if (lower === 'lkg') return 1;
  if (lower === 'ukg') return 2;
  const num = className.match(/\d+/);
  if (num) return 10 + Number(num[0]);
  return 999;
}

export function inferScheduleCadence(
  expectedDateRaw: string | undefined | null,
  perMonthInr: number,
): FeeScheduleCadence {
  const raw = (expectedDateRaw || '').trim().toUpperCase();
  if (raw.includes('HALF') || raw.includes('SEMI') || raw.includes('6 MONTH')) {
    return 'Half-Yearly';
  }
  if (raw.includes('MONTH')) return 'Monthly';
  if (raw.includes('QUART') || raw.includes('3 MONTH') || raw.includes('TILL DEC')) {
    return 'Quarterly';
  }
  if (raw.includes('ONE TIME') || raw.includes('FULL') || raw.includes('YEAR')) return 'Yearly';
  if (raw.includes('TIME') || raw.includes('/') || raw.includes(',')) return 'Quarterly';
  return perMonthInr > 0 ? 'Monthly' : 'Quarterly';
}

export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

export function parseVisFeeCsv(
  csvText: string,
  schoolId = 'school-vis-jjr',
): FeeLedgerAccount[] {
  const lines = csvText
    .split(/\r\n|\r|\n/)
    .filter((l) => l.replace(/,/g, '').trim().length > 0);

  const accounts: FeeLedgerAccount[] = [];

  for (let i = 2; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const admissionTypeRaw = (cols[0] || '').toUpperCase();
    const admissionNo = (cols[1] || '').trim();
    const studentName = (cols[2] || '').trim();
    const fatherName = (cols[3] || '').trim();
    const rawClass = (cols[4] || '').trim();
    const contactNo = (cols[5] || '').trim();
    const dob = (cols[6] || '').trim();
    const address = (cols[7] || '').trim();
    const remarks = (cols[8] || '').trim();

    // Skip footer summary totals row (no student name and no admission number)
    if (!studentName && !admissionNo) continue;

    const lastYearBalanceInr = parseInrCurrency(cols[9]);
    const yearlyDemandInr = parseInrCurrency(cols[11]);
    const perMonthInr = parseInrCurrency(cols[12]);

    const monthlyPaidInr = emptyMonthlyPaidMap();
    for (let m = 0; m < ACADEMIC_FEE_MONTHS.length; m += 1) {
      const month = ACADEMIC_FEE_MONTHS[m];
      monthlyPaidInr[month] = parseInrCurrency(cols[13 + m]);
    }

    const paidAmountInr = parseInrCurrency(cols[25]);
    const expectedScheduleNote = (cols[26] || '').trim();
    const settleAmountInr = parseInrCurrency(cols[27]);
    const balanceFeesInr = parseInrCurrency(cols[28]);
    const fineInr = parseInrCurrency(cols[29]);

    const className = normalizeFeeClassName(rawClass);
    const scheduleCadence = inferScheduleCadence(expectedScheduleNote, perMonthInr);

    // Find latest paid month for UX display
    let lastPaidDate: string | undefined;
    for (let m = ACADEMIC_FEE_MONTHS.length - 1; m >= 0; m -= 1) {
      if (monthlyPaidInr[ACADEMIC_FEE_MONTHS[m]] > 0) {
        lastPaidDate = `${ACADEMIC_FEE_MONTHS[m]} 2026`;
        break;
      }
    }

    accounts.push({
      id: `fee-acc-${schoolId}-${i - 1}-${(admissionNo || studentName).toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      schoolId,
      admissionType: admissionTypeRaw === 'NEW' ? 'NEW' : 'OLD',
      admissionNo: admissionNo || `VIS-ROW-${i - 1}`,
      studentName: studentName || 'Unnamed Student',
      fatherName: fatherName || 'Parent / Guardian',
      className,
      rawClass,
      contactNo,
      dob,
      address,
      remarks,
      lastYearBalanceInr,
      yearlyDemandInr,
      perMonthInr,
      monthlyPaidInr,
      paidAmountInr,
      settleAmountInr,
      balanceFeesInr,
      fineInr,
      scheduleCadence,
      expectedScheduleNote,
      lastPaidDate,
    });
  }

  return accounts;
}

export function normalizeIndianPhone(phone: string | undefined | null): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 8) return '';
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizePersonName(name: string | undefined | null): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|shri|smt|late|dr|kr|kumar|ku)\.?\b/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RemarkSiblingToken {
  firstName: string;
  fullName: string;
  classHint: string;
}

export function extractRemarkSiblingTokens(remarks: string | undefined | null): RemarkSiblingToken[] {
  const clean = (remarks || '').trim();
  if (!clean) return [];
  const upper = clean.toUpperCase();
  if (upper === 'NEW' || upper === 'OLD') return [];
  if (!upper.includes('SEE WITH') && !upper.includes('+')) return [];

  const body = clean.replace(/^se[ew]\s+with\s+/i, '').trim();
  const parts = body.split('+').map((p) => p.trim()).filter(Boolean);
  const tokens: RemarkSiblingToken[] = [];

  for (const part of parts) {
    const classMatch = part.match(/\(([^)]+)\)/);
    const classHint = classMatch ? normalizeFeeClassName(classMatch[1]) : '';
    const withoutClass = part.replace(/\([^)]*\)/g, '').trim();
    // Handle "YASH & TANNU" or "AMAN & KRISHNA" or "DEVANSHU & SUNANDI"
    const subNames = withoutClass.split(/[&,]/).map((s) => s.trim()).filter(Boolean);
    for (const sub of subNames) {
      const norm = normalizePersonName(sub);
      if (norm.length >= 2) {
        const words = norm.split(' ');
        tokens.push({
          firstName: words[0],
          fullName: norm,
          classHint,
        });
      }
    }
  }
  return tokens;
}

function areSimilarNames(a: string, b: string): boolean {
  const na = normalizePersonName(a);
  const nb = normalizePersonName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wa = na.split(' ');
  const wb = nb.split(' ');
  // First name exact match or strong prefix match when paired with same phone/address
  if (wa[0] === wb[0] && wa[0].length >= 4) return true;
  if (
    Math.min(wa[0].length, wb[0].length) >= 4 &&
    (wa[0].startsWith(wb[0].slice(0, 4)) || wb[0].startsWith(wa[0].slice(0, 4)))
  ) {
    return true;
  }
  return false;
}

export function detectSiblingFamilyGroups(
  accounts: FeeLedgerAccount[],
  existingGroups: SiblingFamilyGroup[] = [],
  schoolId?: string,
): SiblingFamilyGroup[] {
  const scoped = schoolId ? accounts.filter((a) => a.schoolId === schoolId) : accounts;
  if (scoped.length === 0) return [];

  const n = scoped.length;
  const parent = Array.from({ length: n }, (_, idx) => idx);
  const pairReasons = new Map<string, Set<string>>();

  function find(x: number): number {
    let curr = x;
    while (parent[curr] !== curr) {
      parent[curr] = parent[parent[curr]];
      curr = parent[curr];
    }
    return curr;
  }

  function union(a: number, b: number, reason: string) {
    const ra = find(a);
    const rb = find(b);
    const key = ra < rb ? `${ra}|${rb}` : `${rb}|${ra}`;
    if (!pairReasons.has(key)) pairReasons.set(key, new Set());
    pairReasons.get(key)!.add(reason);
    if (ra !== rb) {
      parent[rb] = ra;
    }
  }

  // Signal 1: Shared normalized phone number
  const byPhone = new Map<string, number[]>();
  for (let i = 0; i < n; i += 1) {
    const p = normalizeIndianPhone(scoped[i].contactNo);
    if (!p) continue;
    if (!byPhone.has(p)) byPhone.set(p, []);
    byPhone.get(p)!.push(i);
  }
  for (const indices of byPhone.values()) {
    if (indices.length < 2) continue;
    for (let k = 1; k < indices.length; k += 1) {
      union(indices[0], indices[k], 'Shared Contact Phone');
    }
  }

  // Signal 2: Normalized Father Name + Address match
  const byFatherAddr = new Map<string, number[]>();
  for (let i = 0; i < n; i += 1) {
    const f = normalizePersonName(scoped[i].fatherName);
    const addr = normalizePersonName(scoped[i].address);
    if (f.length < 4 || addr.length < 3) continue;
    const key = `${f}::${addr}`;
    if (!byFatherAddr.has(key)) byFatherAddr.set(key, []);
    byFatherAddr.get(key)!.push(i);
  }
  for (const indices of byFatherAddr.values()) {
    if (indices.length < 2) continue;
    for (let k = 1; k < indices.length; k += 1) {
      union(indices[0], indices[k], 'Matched Guardian & Locality');
    }
  }

  // Signal 3: Explicit sibling cross-reference remarks (SEE WITH / +)
  // Match remarks tokens against same father first name or shared address/class hint
  for (let i = 0; i < n; i += 1) {
    const tokens = extractRemarkSiblingTokens(scoped[i].remarks);
    if (tokens.length === 0) continue;
    const fI = normalizePersonName(scoped[i].fatherName);
    const phoneI = normalizeIndianPhone(scoped[i].contactNo);

    for (let j = 0; j < n; j += 1) {
      if (i === j) continue;
      const stuJ = normalizePersonName(scoped[j].studentName);
      const stuJFirst = stuJ.split(' ')[0] || '';
      const fJ = normalizePersonName(scoped[j].fatherName);
      const phoneJ = normalizeIndianPhone(scoped[j].contactNo);
      const remarkJ = scoped[j].remarks || '';

      const fatherCompatible =
        (fI && fJ && areSimilarNames(fI, fJ)) || (phoneI && phoneJ && phoneI === phoneJ);
      if (!fatherCompatible) continue;

      const tokenMatchesJ = tokens.some(
        (t) =>
          (t.firstName.length >= 3 &&
            (stuJFirst === t.firstName ||
              stuJFirst.startsWith(t.firstName.slice(0, 4)) ||
              t.firstName.startsWith(stuJFirst.slice(0, 4)))) &&
          (!t.classHint ||
            t.classHint === scoped[j].className ||
            remarkJ.toLowerCase().includes(scoped[i].studentName.toLowerCase().split(' ')[0])),
      );

      if (tokenMatchesJ) {
        union(i, j, 'Sibling Remark Cross-Reference');
      }
    }
  }

  // Build clusters
  const clusterMap = new Map<number, number[]>();
  for (let i = 0; i < n; i += 1) {
    const r = find(i);
    if (!clusterMap.has(r)) clusterMap.set(r, []);
    clusterMap.get(r)!.push(i);
  }

  // Map existing groups by overlapping account IDs so persisted Merged / Dismissed state sticks
  const groups: SiblingFamilyGroup[] = [];
  for (const memberIndices of clusterMap.values()) {
    if (memberIndices.length < 2) continue;

    const members = memberIndices.map((idx) => scoped[idx]);
    // Sort members: highest total receivable/balance first so primary billing account leads
    members.sort((a, b) => {
      const scoreA = a.yearlyDemandInr + a.lastYearBalanceInr + a.balanceFeesInr;
      const scoreB = b.yearlyDemandInr + b.lastYearBalanceInr + b.balanceFeesInr;
      return scoreB - scoreA;
    });

    const primary = members[0];
    const memberIds = members.map((m) => m.id);
    const memberSet = new Set(memberIds);

    const reasons = new Set<string>();
    for (let x = 0; x < memberIndices.length; x += 1) {
      if (extractRemarkSiblingTokens(scoped[memberIndices[x]].remarks).length > 0) {
        reasons.add('Sibling Remark Cross-Reference');
      }
      for (let y = x + 1; y < memberIndices.length; y += 1) {
        const a = memberIndices[x];
        const b = memberIndices[y];
        if (
          normalizeIndianPhone(scoped[a].contactNo) &&
          normalizeIndianPhone(scoped[a].contactNo) === normalizeIndianPhone(scoped[b].contactNo)
        ) {
          reasons.add('Shared Contact Phone');
        }
        if (
          areSimilarNames(scoped[a].fatherName, scoped[b].fatherName) &&
          normalizePersonName(scoped[a].address) === normalizePersonName(scoped[b].address)
        ) {
          reasons.add('Matched Guardian & Locality');
        }
      }
    }
    if (reasons.size === 0) reasons.add('Household Ledger Link');

    const prevMatch = existingGroups.find(
      (g) =>
        g.schoolId === primary.schoolId &&
        g.memberAccountIds.some((id) => memberSet.has(id)),
    );

    const deterministicId =
      prevMatch?.id ||
      `fam-${primary.schoolId}-${primary.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '')}-${members.length}`;

    groups.push({
      id: deterministicId,
      schoolId: primary.schoolId,
      guardianName: primary.fatherName,
      contactNo: primary.contactNo || members.find((m) => m.contactNo)?.contactNo || '',
      address: primary.address || members.find((m) => m.address)?.address || '',
      memberAccountIds: memberIds,
      primaryAccountId: primary.id,
      matchReasons: Array.from(reasons),
      status: prevMatch?.status ?? 'Alert',
      updatedBy: prevMatch?.updatedBy,
      updatedAt: prevMatch?.updatedAt,
    });
  }

  return groups.sort((a, b) => {
    const balA = a.memberAccountIds.reduce(
      (s, id) => s + (scoped.find((m) => m.id === id)?.balanceFeesInr ?? 0),
      0,
    );
    const balB = b.memberAccountIds.reduce(
      (s, id) => s + (scoped.find((m) => m.id === id)?.balanceFeesInr ?? 0),
      0,
    );
    return balB - balA;
  });
}

export interface ClassFeeSummary {
  className: string;
  sortOrder: number;
  studentCount: number;
  defaulterCount: number;
  totalDemandInr: number;
  collectedInr: number;
  outstandingInr: number;
  collectionPct: number;
  expectedThisMonthInr: number;
  collectedThisMonthInr: number;
  monthAttainmentPct: number;
  topDefaulters: FeeLedgerAccount[];
}

export interface MonthlyCollectionPoint {
  monthKey: FeeMonthKey;
  collectedInr: number;
  payerCount: number;
}

export interface SiblingAlertCardView {
  group: SiblingFamilyGroup;
  members: FeeLedgerAccount[];
  primaryAccount: FeeLedgerAccount;
  combinedDemandInr: number;
  combinedPaidInr: number;
  combinedBalanceInr: number;
  hasZeroBalanceSiblingLink: boolean;
}

export interface FinancialDashboardSummary {
  totalLastYearBalanceInr: number;
  totalYearlyDemandInr: number;
  totalGrossReceivableInr: number;
  totalCollectedYtdInr: number;
  totalOutstandingInr: number;
  totalFinesInr: number;
  collectionRatePct: number;
  accountsTotal: number;
  defaulterAccountsCount: number;
  settledAccountsCount: number;
  activeMonth: FeeMonthKey;
  scheduleExpectedMonthInr: number;
  effectiveMonthTargetInr: number;
  isCustomTargetOverride: boolean;
  collectedThisMonthInr: number;
  mtdAttainmentPct: number;
  remainingMonthGapInr: number;
  expectedTodayInr: number;
  expectedThisWeekInr: number;
  dailyRequiredRunRateInr: number;
  monthlySeries: MonthlyCollectionPoint[];
  classSummaries: ClassFeeSummary[];
  schoolTopDefaulters: FeeLedgerAccount[];
  siblingAlerts: SiblingAlertCardView[];
  mergedFamilies: SiblingAlertCardView[];
  dismissedFamilies: SiblingAlertCardView[];
}

export function computeExpectedMonthlyDemandForAccount(
  acc: FeeLedgerAccount,
  activeMonth: FeeMonthKey = 'November',
): number {
  if (acc.balanceFeesInr <= 0) return 0;
  const idx = ACADEMIC_FEE_MONTHS.indexOf(activeMonth);
  const remainingMonths = idx >= 0 ? Math.max(1, ACADEMIC_FEE_MONTHS.length - idx) : 5;

  if (acc.scheduleCadence === 'Monthly') {
    const monthlyInstallment =
      acc.perMonthInr > 0 ? acc.perMonthInr : Math.round(acc.balanceFeesInr / remainingMonths);
    return Math.min(acc.balanceFeesInr, Math.max(0, monthlyInstallment));
  }
  if (acc.scheduleCadence === 'Quarterly') {
    return Math.min(
      acc.balanceFeesInr,
      Math.round(acc.balanceFeesInr / Math.max(1, Math.ceil(remainingMonths / 3))),
    );
  }
  if (acc.scheduleCadence === 'Half-Yearly') {
    return Math.min(
      acc.balanceFeesInr,
      Math.round(acc.balanceFeesInr / Math.max(1, Math.ceil(remainingMonths / 6))),
    );
  }
  if (acc.scheduleCadence === 'Yearly') {
    return acc.balanceFeesInr;
  }
  return Math.min(
    acc.balanceFeesInr,
    Math.round(acc.balanceFeesInr / Math.max(1, Math.ceil(remainingMonths / 1.5))),
  );
}

export function computeFinancialDashboardMetrics(params: {
  accounts: FeeLedgerAccount[];
  siblingGroups: SiblingFamilyGroup[];
  targetConfig?: MonthlyFeeTargetConfig;
  activeMonth?: FeeMonthKey;
  todayIso?: string;
  classFilter?: string;
  topDefaultersPerClassLimit?: number;
}): FinancialDashboardSummary {
  const activeMonth = params.activeMonth ?? params.targetConfig?.monthKey ?? 'November';
  const classFilter = params.classFilter || 'ALL';
  const perClassLimit = params.topDefaultersPerClassLimit ?? 5;

  const visibleAccounts =
    classFilter === 'ALL'
      ? params.accounts
      : params.accounts.filter((a) => a.className === classFilter);

  let totalLastYearBalanceInr = 0;
  let totalYearlyDemandInr = 0;
  let totalCollectedYtdInr = 0;
  let totalOutstandingInr = 0;
  let totalFinesInr = 0;
  let totalSettleInr = 0;
  let defaulterAccountsCount = 0;
  let settledAccountsCount = 0;
  let scheduleExpectedMonthInr = 0;
  let collectedThisMonthInr = 0;

  const monthlyTotals = new Map<FeeMonthKey, { collectedInr: number; payerCount: number }>();
  for (const m of ACADEMIC_FEE_MONTHS) {
    monthlyTotals.set(m, { collectedInr: 0, payerCount: 0 });
  }

  for (const acc of visibleAccounts) {
    totalLastYearBalanceInr += acc.lastYearBalanceInr;
    totalYearlyDemandInr += acc.yearlyDemandInr;
    totalCollectedYtdInr += acc.paidAmountInr;
    totalOutstandingInr += acc.balanceFeesInr;
    totalFinesInr += acc.fineInr;
    totalSettleInr += acc.settleAmountInr;

    if (acc.balanceFeesInr > 0) defaulterAccountsCount += 1;
    else settledAccountsCount += 1;

    scheduleExpectedMonthInr += computeExpectedMonthlyDemandForAccount(acc, activeMonth);
    collectedThisMonthInr += acc.monthlyPaidInr?.[activeMonth] ?? 0;

    for (const m of ACADEMIC_FEE_MONTHS) {
      const val = acc.monthlyPaidInr?.[m] ?? 0;
      if (val > 0) {
        const pt = monthlyTotals.get(m)!;
        pt.collectedInr += val;
        pt.payerCount += 1;
      }
    }
  }

  const totalGrossReceivableInr = Math.max(
    0,
    totalLastYearBalanceInr + totalYearlyDemandInr - totalSettleInr,
  );
  const collectionRatePct =
    totalGrossReceivableInr > 0
      ? Math.round((totalCollectedYtdInr / totalGrossReceivableInr) * 1000) / 10
      : 0;

  const isCustomTargetOverride =
    classFilter === 'ALL' &&
    params.targetConfig?.overrideTargetInr !== null &&
    params.targetConfig?.overrideTargetInr !== undefined &&
    params.targetConfig.overrideTargetInr > 0;

  const effectiveMonthTargetInr = isCustomTargetOverride
    ? params.targetConfig!.overrideTargetInr!
    : scheduleExpectedMonthInr;

  const mtdAttainmentPct =
    effectiveMonthTargetInr > 0
      ? Math.round((collectedThisMonthInr / effectiveMonthTargetInr) * 1000) / 10
      : 0;

  const remainingMonthGapInr = Math.max(0, effectiveMonthTargetInr - collectedThisMonthInr);

  // Compute remaining working days in current month from todayIso (defaults to Nov 16 -> 12 working days left)
  const dayOfMonth = params.todayIso ? Number(params.todayIso.slice(8, 10)) || 16 : 16;
  const remainingDaysInMonth = Math.max(1, 30 - dayOfMonth + 1);
  const remainingWorkingDays = Math.max(1, Math.round(remainingDaysInMonth * 0.8));

  const dailyRequiredRunRateInr = Math.round(remainingMonthGapInr / remainingWorkingDays);
  const expectedTodayInr =
    remainingMonthGapInr > 0
      ? dailyRequiredRunRateInr
      : Math.round(effectiveMonthTargetInr / 22);
  const expectedThisWeekInr = Math.min(
    remainingMonthGapInr > 0 ? remainingMonthGapInr : effectiveMonthTargetInr,
    expectedTodayInr * Math.min(6, remainingWorkingDays),
  );

  const monthlySeries: MonthlyCollectionPoint[] = ACADEMIC_FEE_MONTHS.map((m) => ({
    monthKey: m,
    collectedInr: monthlyTotals.get(m)!.collectedInr,
    payerCount: monthlyTotals.get(m)!.payerCount,
  }));

  // Group by class from full accounts (or filtered) so class-wise defaulters stay consistent
  const classBuckets = new Map<string, FeeLedgerAccount[]>();
  for (const acc of visibleAccounts) {
    if (!classBuckets.has(acc.className)) classBuckets.set(acc.className, []);
    classBuckets.get(acc.className)!.push(acc);
  }

  const classSummaries: ClassFeeSummary[] = Array.from(classBuckets.entries())
    .map(([className, list]) => {
      const totalDemandInr = list.reduce(
        (s, a) => s + Math.max(0, a.lastYearBalanceInr + a.yearlyDemandInr - a.settleAmountInr),
        0,
      );
      const collectedInr = list.reduce((s, a) => s + a.paidAmountInr, 0);
      const outstandingInr = list.reduce((s, a) => s + a.balanceFeesInr, 0);
      const expectedThisMonthInr = list.reduce(
        (s, a) => s + computeExpectedMonthlyDemandForAccount(a, activeMonth),
        0,
      );
      const collectedThisMonthInr = list.reduce(
        (s, a) => s + (a.monthlyPaidInr?.[activeMonth] ?? 0),
        0,
      );
      const monthAttainmentPct =
        expectedThisMonthInr > 0
          ? Math.round((collectedThisMonthInr / expectedThisMonthInr) * 1000) / 10
          : collectedThisMonthInr > 0
            ? 100
            : 0;
      const defaulterCount = list.filter((a) => a.balanceFeesInr > 0).length;
      const topDefaulters = [...list]
        .filter((a) => a.balanceFeesInr > 0)
        .sort((a, b) => b.balanceFeesInr - a.balanceFeesInr)
        .slice(0, perClassLimit);

      return {
        className,
        sortOrder: getClassSortOrder(className),
        studentCount: list.length,
        defaulterCount,
        totalDemandInr,
        collectedInr,
        outstandingInr,
        collectionPct:
          totalDemandInr > 0 ? Math.round((collectedInr / totalDemandInr) * 1000) / 10 : 0,
        expectedThisMonthInr,
        collectedThisMonthInr,
        monthAttainmentPct,
        topDefaulters,
      };
    })
    .sort((a, b) =>
      a.sortOrder !== b.sortOrder ? a.sortOrder - b.sortOrder : a.className.localeCompare(b.className),
    );

  const schoolTopDefaulters = [...visibleAccounts]
    .filter((a) => a.balanceFeesInr > 0)
    .sort((a, b) => b.balanceFeesInr - a.balanceFeesInr);

  // Build sibling card views
  const accountById = new Map(params.accounts.map((a) => [a.id, a]));
  const visibleIdSet = new Set(visibleAccounts.map((a) => a.id));

  const siblingCards: SiblingAlertCardView[] = [];
  for (const group of params.siblingGroups) {
    const members = group.memberAccountIds
      .map((id) => accountById.get(id))
      .filter((a): a is FeeLedgerAccount => Boolean(a));
    if (members.length < 2) continue;
    if (classFilter !== 'ALL' && !members.some((m) => visibleIdSet.has(m.id))) continue;

    const primaryAccount =
      accountById.get(group.primaryAccountId) ?? members[0];
    const combinedDemandInr = members.reduce(
      (s, m) => s + Math.max(0, m.lastYearBalanceInr + m.yearlyDemandInr - m.settleAmountInr),
      0,
    );
    const combinedPaidInr = members.reduce((s, m) => s + m.paidAmountInr, 0);
    const combinedBalanceInr = members.reduce((s, m) => s + m.balanceFeesInr, 0);
    const hasZeroBalanceSiblingLink =
      combinedBalanceInr > 0 && members.some((m) => m.balanceFeesInr === 0);

    siblingCards.push({
      group,
      members,
      primaryAccount,
      combinedDemandInr,
      combinedPaidInr,
      combinedBalanceInr,
      hasZeroBalanceSiblingLink,
    });
  }

  return {
    totalLastYearBalanceInr,
    totalYearlyDemandInr,
    totalGrossReceivableInr,
    totalCollectedYtdInr,
    totalOutstandingInr,
    totalFinesInr,
    collectionRatePct,
    accountsTotal: visibleAccounts.length,
    defaulterAccountsCount,
    settledAccountsCount,
    activeMonth,
    scheduleExpectedMonthInr,
    effectiveMonthTargetInr,
    isCustomTargetOverride,
    collectedThisMonthInr,
    mtdAttainmentPct,
    remainingMonthGapInr,
    expectedTodayInr,
    expectedThisWeekInr,
    dailyRequiredRunRateInr,
    monthlySeries,
    classSummaries,
    schoolTopDefaulters,
    siblingAlerts: siblingCards.filter((c) => c.group.status === 'Alert'),
    mergedFamilies: siblingCards.filter((c) => c.group.status === 'Merged'),
    dismissedFamilies: siblingCards.filter((c) => c.group.status === 'Dismissed'),
  };
}

export function allocateFamilyPayment(
  accounts: FeeLedgerAccount[],
  paymentAmountInr: number,
  primaryAccountId?: string,
): {
  valid: boolean;
  error?: string;
  allocations: Array<{
    accountId: string;
    studentName: string;
    className: string;
    allocatedInr: number;
  }>;
} {
  const amt = Math.round(Number(paymentAmountInr));
  if (!Number.isFinite(amt) || amt <= 0) {
    return { valid: false, error: 'Payment amount must be greater than ₹0.', allocations: [] };
  }

  const payable = accounts.filter((a) => a.balanceFeesInr > 0);
  if (payable.length === 0) {
    return { valid: false, error: 'All selected accounts have ₹0 pending balance.', allocations: [] };
  }

  const totalPending = payable.reduce((s, a) => s + a.balanceFeesInr, 0);
  if (amt > totalPending) {
    return {
      valid: false,
      error: `Payment ₹${amt.toLocaleString('en-IN')} exceeds combined pending balance ₹${totalPending.toLocaleString('en-IN')}.`,
      allocations: [],
    };
  }

  // Order primary account first, then descending by pending balance
  const ordered = [...payable].sort((a, b) => {
    if (primaryAccountId && a.id === primaryAccountId) return -1;
    if (primaryAccountId && b.id === primaryAccountId) return 1;
    return b.balanceFeesInr - a.balanceFeesInr;
  });

  let remaining = amt;
  const allocations: Array<{
    accountId: string;
    studentName: string;
    className: string;
    allocatedInr: number;
  }> = [];

  for (const acc of ordered) {
    if (remaining <= 0) break;
    const take = Math.min(acc.balanceFeesInr, remaining);
    if (take > 0) {
      allocations.push({
        accountId: acc.id,
        studentName: acc.studentName,
        className: acc.className,
        allocatedInr: take,
      });
      remaining -= take;
    }
  }

  return { valid: true, allocations };
}

export interface FeeMonthPartialInfo {
  month: FeeMonthKey;
  paidNowInr: number;
  totalPaidInr: number;
  dueInr: number;
  remainingInr: number;
}

export interface StudentFeeMonthAllocationResult {
  scheduleCadence: CanonicalFeePaymentPlan;
  monthlyRateInr: number;
  totalGrossBeforeInr: number;
  alreadyPaidBeforeInr: number;
  totalPendingBeforeInr: number;
  paymentAppliedInr: number;
  remainingPendingAfterInr: number;
  lybDueInr: number;
  lybPaidBeforeInr: number;
  lybAdjustedNowInr: number;
  lybRemainingAfterInr: number;
  previousPaidTillMonth?: FeeMonthKey;
  previousPartialMonth?: FeeMonthKey;
  previousPartialPaidInr: number;
  previousPartialRemainingInr: number;
  months: FeeMonthBreakdownItem[];
  coveredMonths: FeeMonthKey[];
  paidTillMonth: FeeMonthKey;
  partialAdjustment: FeeMonthPartialInfo | null;
  postPaymentPartial: FeeMonthPartialInfo | null;
  recommendedInstallmentAmountInr: number;
  recommendedInstallmentLabel: string;
  upcomingInstallments: UpcomingExpectedInstallment[];
  nextExpectedInstallment: UpcomingExpectedInstallment | null;
}

function pad2Num(n: number): string {
  return String(n).padStart(2, '0');
}

function getAcademicMonthDueDate(month: FeeMonthKey, sessionStartYear = 2026): string {
  const monthCalendarMap: Record<FeeMonthKey, { yearOffset: number; calMonth: number }> = {
    April: { yearOffset: 0, calMonth: 4 },
    May: { yearOffset: 0, calMonth: 5 },
    June: { yearOffset: 0, calMonth: 6 },
    July: { yearOffset: 0, calMonth: 7 },
    August: { yearOffset: 0, calMonth: 8 },
    September: { yearOffset: 0, calMonth: 9 },
    October: { yearOffset: 0, calMonth: 10 },
    November: { yearOffset: 0, calMonth: 11 },
    December: { yearOffset: 0, calMonth: 12 },
    January: { yearOffset: 1, calMonth: 1 },
    February: { yearOffset: 1, calMonth: 2 },
    March: { yearOffset: 1, calMonth: 3 },
  };
  const info = monthCalendarMap[month];
  return `${sessionStartYear + info.yearOffset}-${pad2Num(info.calMonth)}-10`;
}

function addMonthsOnTenth(baseIso: string, addMonths: number): string {
  const parts = baseIso.split('-').map(Number);
  const year = parts.length === 3 && Number.isFinite(parts[0]) ? parts[0] : 2026;
  const monthIdx = parts.length === 3 && Number.isFinite(parts[1]) ? parts[1] - 1 : 10;
  const dt = new Date(year, monthIdx + addMonths, 10);
  return `${dt.getFullYear()}-${pad2Num(dt.getMonth() + 1)}-${pad2Num(dt.getDate())}`;
}

interface PlanBucketDef {
  label: string;
  months: FeeMonthKey[];
  dueDate: string;
}

function buildPlanBuckets(
  plan: CanonicalFeePaymentPlan,
  sessionStartYear = 2026,
): PlanBucketDef[] {
  if (plan === 'Monthly') {
    return ACADEMIC_FEE_MONTHS.map((m) => ({
      label: m,
      months: [m],
      dueDate: getAcademicMonthDueDate(m, sessionStartYear),
    }));
  }
  if (plan === 'Quarterly') {
    return [
      {
        label: 'Q1 (Apr–Jun)',
        months: ['April', 'May', 'June'],
        dueDate: `${sessionStartYear}-04-10`,
      },
      {
        label: 'Q2 (Jul–Sep)',
        months: ['July', 'August', 'September'],
        dueDate: `${sessionStartYear}-07-10`,
      },
      {
        label: 'Q3 (Oct–Dec)',
        months: ['October', 'November', 'December'],
        dueDate: `${sessionStartYear}-10-10`,
      },
      {
        label: 'Q4 (Jan–Mar)',
        months: ['January', 'February', 'March'],
        dueDate: `${sessionStartYear + 1}-01-10`,
      },
    ];
  }
  if (plan === 'Half-Yearly') {
    return [
      {
        label: 'H1 (Apr–Sep)',
        months: ['April', 'May', 'June', 'July', 'August', 'September'],
        dueDate: `${sessionStartYear}-04-10`,
      },
      {
        label: 'H2 (Oct–Mar)',
        months: ['October', 'November', 'December', 'January', 'February', 'March'],
        dueDate: `${sessionStartYear}-10-10`,
      },
    ];
  }
  return [
    {
      label: 'Annual Full Session (Apr–Mar)',
      months: [...ACADEMIC_FEE_MONTHS],
      dueDate: `${sessionStartYear}-04-10`,
    },
  ];
}

/**
 * Deterministic auto-month coverage, lump-sum partial month adjustment, and
 * payment-plan (Monthly / Quarterly / Half-Yearly / Yearly) expected installment calculator.
 * Used identically on both frontend (live modal preview) and backend (POST /api/finance/collect).
 */
export function computeStudentFeeMonthAllocation(params: {
  accounts: FeeLedgerAccount[];
  paymentNowInr?: number;
  scheduleCadence?: FeeScheduleCadence;
  paymentDateIso?: string;
  sessionStartYear?: number;
}): StudentFeeMonthAllocationResult {
  const { accounts, sessionStartYear = 2026 } = params;
  const primary = accounts[0];
  const scheduleCadence = normalizePaymentPlan(
    params.scheduleCadence ?? primary?.scheduleCadence,
  );
  const paymentDateIso =
    params.paymentDateIso && /^\d{4}-\d{2}-\d{2}$/.test(params.paymentDateIso)
      ? params.paymentDateIso
      : `${sessionStartYear}-11-16`;

  const alreadyPaidBeforeInr = accounts.reduce((s, a) => s + Math.max(0, Math.round(a.paidAmountInr || 0)), 0);
  const totalPendingBeforeInr = accounts.reduce((s, a) => s + Math.max(0, Math.round(a.balanceFeesInr || 0)), 0);
  const totalGrossBeforeInr = alreadyPaidBeforeInr + totalPendingBeforeInr;

  const rawLybSum = accounts.reduce((s, a) => s + Math.max(0, Math.round(a.lastYearBalanceInr || 0)), 0);
  const lybDueInr = Math.min(totalGrossBeforeInr, rawLybSum);
  const session12MonthTotal = Math.max(0, totalGrossBeforeInr - lybDueInr);

  // Derive 12-month due schedule that sums strictly to session12MonthTotal
  const rawPerMonthSum = accounts.reduce((s, a) => s + Math.max(0, Math.round(a.perMonthInr || 0)), 0);
  const useDeclaredPerMonth =
    rawPerMonthSum > 0 &&
    rawPerMonthSum * 11 <= session12MonthTotal &&
    rawPerMonthSum * 13 >= session12MonthTotal;
  const baseMonthDue = useDeclaredPerMonth
    ? rawPerMonthSum
    : Math.floor(session12MonthTotal / 12);

  const monthDues: Record<FeeMonthKey, number> = emptyMonthlyPaidMap();
  let allocatedDue = 0;
  for (let i = 0; i < ACADEMIC_FEE_MONTHS.length; i += 1) {
    const m = ACADEMIC_FEE_MONTHS[i];
    if (i === ACADEMIC_FEE_MONTHS.length - 1) {
      monthDues[m] = Math.max(0, session12MonthTotal - allocatedDue);
    } else {
      const share = Math.min(baseMonthDue, Math.max(0, session12MonthTotal - allocatedDue));
      monthDues[m] = share;
      allocatedDue += share;
    }
  }
  const monthlyRateInr = baseMonthDue > 0 ? baseMonthDue : Math.round(session12MonthTotal / 12);

  // Step 1: Replay prior payments sequentially (LYB first, then April -> March)
  let priorPool = alreadyPaidBeforeInr;
  const lybPaidBeforeInr = Math.min(lybDueInr, priorPool);
  priorPool -= lybPaidBeforeInr;
  const lybRemainingBeforeInr = Math.max(0, lybDueInr - lybPaidBeforeInr);

  const prevMonthPaid: Record<FeeMonthKey, number> = emptyMonthlyPaidMap();
  let previousPaidTillMonth: FeeMonthKey | undefined;
  let previousPartialMonth: FeeMonthKey | undefined;
  let previousPartialPaidInr = 0;
  let previousPartialRemainingInr = 0;

  for (const m of ACADEMIC_FEE_MONTHS) {
    const due = monthDues[m];
    const paid = Math.min(due, priorPool);
    prevMonthPaid[m] = paid;
    priorPool -= paid;
    if (due > 0 && paid >= due) {
      previousPaidTillMonth = m;
    } else if (due > 0 && paid > 0 && paid < due && !previousPartialMonth) {
      previousPartialMonth = m;
      previousPartialPaidInr = paid;
      previousPartialRemainingInr = due - paid;
    }
  }

  // Step 2: Recommended installment amount BEFORE current payment based on student's payment plan
  const buckets = buildPlanBuckets(scheduleCadence, sessionStartYear);
  let recommendedInstallmentAmountInr = totalPendingBeforeInr;
  let recommendedInstallmentLabel =
    scheduleCadence === 'Yearly' ? 'Full Session Balance' : scheduleCadence;

  if (totalPendingBeforeInr > 0) {
    for (const bucket of buckets) {
      const bucketRemBefore = bucket.months.reduce(
        (sum, m) => sum + Math.max(0, monthDues[m] - prevMonthPaid[m]),
        0,
      );
      if (bucketRemBefore > 0) {
        recommendedInstallmentAmountInr = Math.min(
          totalPendingBeforeInr,
          bucketRemBefore + lybRemainingBeforeInr,
        );
        const hasPrevPartial = bucket.months.some(
          (m) => prevMonthPaid[m] > 0 && prevMonthPaid[m] < monthDues[m],
        );
        recommendedInstallmentLabel = hasPrevPartial
          ? `${bucket.label} (Bal.)`
          : bucket.label;
        break;
      }
    }
  } else {
    recommendedInstallmentAmountInr = 0;
    recommendedInstallmentLabel = 'Settled';
  }

  // Step 3: Apply current payment (single month OR lump-sum) sequentially
  const rawPay = Math.round(Number(params.paymentNowInr) || 0);
  const paymentAppliedInr = Math.max(0, Math.min(totalPendingBeforeInr, rawPay));
  let nowPool = paymentAppliedInr;

  const lybAdjustedNowInr = Math.min(lybRemainingBeforeInr, nowPool);
  nowPool -= lybAdjustedNowInr;
  const lybRemainingAfterInr = Math.max(0, lybRemainingBeforeInr - lybAdjustedNowInr);

  const months: FeeMonthBreakdownItem[] = [];
  const coveredMonths: FeeMonthKey[] = [];
  let partialAdjustment: FeeMonthPartialInfo | null = null;
  let postPaymentPartial: FeeMonthPartialInfo | null = null;
  let lastFullyPaidMonth: FeeMonthKey | undefined;

  for (const m of ACADEMIC_FEE_MONTHS) {
    const due = monthDues[m];
    const prev = prevMonthPaid[m];
    const remBefore = Math.max(0, due - prev);
    const paidNow = Math.min(remBefore, nowPool);
    nowPool -= paidNow;

    const totalPaid = prev + paidNow;
    const remaining = Math.max(0, due - totalPaid);
    const status: 'Paid' | 'Partial' | 'Unpaid' =
      due === 0 || remaining === 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';
    const coveredNow = paidNow > 0 && remaining === 0;
    const partialNow = paidNow > 0 && remaining > 0;

    if (coveredNow) coveredMonths.push(m);
    if (due > 0 && status === 'Paid') lastFullyPaidMonth = m;
    if (partialNow) {
      partialAdjustment = {
        month: m,
        paidNowInr: paidNow,
        totalPaidInr: totalPaid,
        dueInr: due,
        remainingInr: remaining,
      };
    }
    if (status === 'Partial' && !postPaymentPartial) {
      postPaymentPartial = {
        month: m,
        paidNowInr: paidNow,
        totalPaidInr: totalPaid,
        dueInr: due,
        remainingInr: remaining,
      };
    }

    months.push({
      month: m,
      dueInr: due,
      previouslyPaidInr: prev,
      paidNowInr: paidNow,
      totalPaidInr: totalPaid,
      remainingInr: remaining,
      status,
      coveredNow,
      partialNow,
    });
  }

  const remainingPendingAfterInr = Math.max(0, totalPendingBeforeInr - paymentAppliedInr);
  const paidTillMonth: FeeMonthKey =
    lastFullyPaidMonth ??
    partialAdjustment?.month ??
    postPaymentPartial?.month ??
    'April';

  // Step 4: Build coming expected payments strictly according to the student's payment plan
  const monthRemainingMap = new Map<FeeMonthKey, FeeMonthBreakdownItem>(
    months.map((item) => [item.month, item]),
  );

  const upcomingInstallments: UpcomingExpectedInstallment[] = [];
  let lybCarry = lybRemainingAfterInr;
  let lastAssignedDueDate = paymentDateIso;
  const cadenceMonthStep =
    scheduleCadence === 'Monthly'
      ? 1
      : scheduleCadence === 'Quarterly'
        ? 3
        : scheduleCadence === 'Half-Yearly'
          ? 6
          : 12;

  if (remainingPendingAfterInr > 0) {
    for (const bucket of buckets) {
      const unpaidMonthsInBucket = bucket.months.filter(
        (m) => (monthRemainingMap.get(m)?.remainingInr ?? 0) > 0,
      );
      const bucketRemaining =
        bucket.months.reduce(
          (sum, m) => sum + (monthRemainingMap.get(m)?.remainingInr ?? 0),
          0,
        ) + lybCarry;

      if (bucketRemaining <= 0) continue;
      lybCarry = 0;

      const hasPartialInBucket = bucket.months.some(
        (m) => monthRemainingMap.get(m)?.status === 'Partial',
      );

      let dueDate = bucket.dueDate;
      if (dueDate <= lastAssignedDueDate) {
        dueDate = addMonthsOnTenth(
          lastAssignedDueDate,
          upcomingInstallments.length === 0 ? 1 : cadenceMonthStep,
        );
      }
      lastAssignedDueDate = dueDate;

      upcomingInstallments.push({
        label: hasPartialInBucket ? `${bucket.label} (Partial Bal.)` : bucket.label,
        months: unpaidMonthsInBucket.length > 0 ? unpaidMonthsInBucket : bucket.months,
        dueDate,
        expectedAmountInr: bucketRemaining,
        includesPartialAdjustment: hasPartialInBucket,
      });
    }
  }

  return {
    scheduleCadence,
    monthlyRateInr,
    totalGrossBeforeInr,
    alreadyPaidBeforeInr,
    totalPendingBeforeInr,
    paymentAppliedInr,
    remainingPendingAfterInr,
    lybDueInr,
    lybPaidBeforeInr,
    lybAdjustedNowInr,
    lybRemainingAfterInr,
    previousPaidTillMonth,
    previousPartialMonth,
    previousPartialPaidInr,
    previousPartialRemainingInr,
    months,
    coveredMonths,
    paidTillMonth,
    partialAdjustment,
    postPaymentPartial,
    recommendedInstallmentAmountInr,
    recommendedInstallmentLabel,
    upcomingInstallments,
    nextExpectedInstallment: upcomingInstallments[0] ?? null,
  };
}
