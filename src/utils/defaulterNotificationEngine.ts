import type {
  DefaulterAlertChannel,
  FeeDefaulterNotificationConfig,
  FeeDefaulterNotificationRecord,
  FeeMonthKey,
  StudentRecord,
  UserAccount,
} from '../types';
import {
  buildStudentPaymentTimeline,
  type RankedFeeDefaulter,
} from './financialDashboardEngine.ts';

const INR = new Intl.NumberFormat('en-IN');

export const DEFAULT_DEFAULTER_ALERT_TEMPLATE =
  'Dear {guardianName}, fee payment for {studentName} ({className}, Adm {admissionNo}) at {schoolName} is overdue through {activeMonth}. Overdue till {activeMonth}: {overdueAmount} | Total session balance: {balanceAmount} ({percentLeft}% pending). Kindly clear dues at the school accounts desk or via UPI. Ignore if already paid.';

export function createDefaultDefaulterAlertConfig(
  schoolId: string,
): FeeDefaulterNotificationConfig {
  return {
    schoolId,
    autoEnabled: true,
    tierScope: 'CriticalAndHigh',
    minPriorityScore: 65,
    minPercentLeft: 45,
    channel: 'Both',
    cooldownDays: 7,
    scheduleLabel: 'Monthly on 12th · 09:00 IST (Automated High-Priority Sweep)',
    messageTemplate: DEFAULT_DEFAULTER_ALERT_TEMPLATE,
  };
}

/**
 * Normalizes a guardian WhatsApp number into E.164 format (+91XXXXXXXXXX for 10-digit
 * Indian mobile numbers) while rejecting placeholders such as 0000000000.
 */
export function normalizeParentWhatsAppPhone(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const last10 = digits.slice(-10);
  if (/^(\d)\1{9}$/.test(last10)) return null; // Reject 0000000000, 9999999999, etc.
  if (digits.length === 10) {
    if (!/^[6-9]\d{9}$/.test(last10)) return null;
    return `+91${last10}`;
  }
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(last10)) {
    return `+${digits}`;
  }
  if (trimmed.startsWith('+') && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return null;
}

export function isValidParentEmail(raw?: string | null): boolean {
  if (!raw) return false;
  const v = String(raw).trim();
  if (v.length < 5 || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function resolveParentContactsForAccount(params: {
  account: RankedFeeDefaulter;
  students?: StudentRecord[];
  users?: UserAccount[];
}): { phone: string | null; email: string | null } {
  const { account, students = [], users = [] } = params;
  const matchedStudent = students.find(
    (s) =>
      (account.studentId && s.id === account.studentId) ||
      s.admissionNo.trim().toUpperCase() === account.admissionNo.trim().toUpperCase(),
  );

  const phone =
    normalizeParentWhatsAppPhone(account.contactNo) ||
    normalizeParentWhatsAppPhone(matchedStudent?.guardianPhone);

  let email: string | null = null;
  if (matchedStudent?.guardianEmail && isValidParentEmail(matchedStudent.guardianEmail)) {
    email = matchedStudent.guardianEmail.trim().toLowerCase();
  } else if (matchedStudent) {
    const linkedParent = users.find(
      (u) =>
        u.role === 'parent' &&
        u.schoolId === account.schoolId &&
        Array.isArray(u.linkedStudentIds) &&
        u.linkedStudentIds.includes(matchedStudent.id) &&
        isValidParentEmail(u.email),
    );
    if (linkedParent) {
      email = linkedParent.email.trim().toLowerCase();
    }
  }

  return { phone, email };
}

export interface DefaulterAlertMessageVars {
  guardianName: string;
  studentName: string;
  admissionNo: string;
  className: string;
  schoolName: string;
  activeMonth: FeeMonthKey;
  overdueTillMonthInr: number;
  balanceDueInr: number;
  percentLeft: number;
  paymentNature: string;
}

/**
 * Safely renders a plain-text parent notification using fixed placeholder tokens.
 */
export function renderDefaulterAlertMessage(
  template: string,
  vars: DefaulterAlertMessageVars,
): string {
  const safeTemplate = (template || DEFAULT_DEFAULTER_ALERT_TEMPLATE).trim().slice(0, 1000);
  const replacements: Record<string, string> = {
    '{guardianName}': vars.guardianName || 'Parent',
    '{studentName}': vars.studentName,
    '{admissionNo}': vars.admissionNo,
    '{className}': vars.className,
    '{schoolName}': vars.schoolName,
    '{activeMonth}': vars.activeMonth,
    '{overdueAmount}': `Rs. ${INR.format(Math.round(vars.overdueTillMonthInr))}`,
    '{balanceAmount}': `Rs. ${INR.format(Math.round(vars.balanceDueInr))}`,
    '{percentLeft}': String(vars.percentLeft),
    '{paymentNature}': vars.paymentNature,
  };

  let output = safeTemplate;
  for (const [token, val] of Object.entries(replacements)) {
    output = output.split(token).join(val);
  }
  return output;
}

export interface EligibleDefaulterAlertCandidate {
  account: RankedFeeDefaulter;
  phone: string | null;
  email: string | null;
  paymentNature: string;
  hasReachableChannel: boolean;
  inCooldown: boolean;
  cooldownDaysRemaining: number;
  lastAlertSentAt?: string;
}

export interface DefaulterAlertSelectionSummary {
  eligibleReady: EligibleDefaulterAlertCandidate[];
  skippedCooldown: EligibleDefaulterAlertCandidate[];
  missingContactCount: number;
  totalMatchingCriteria: number;
}

/**
 * Selects high-priority defaulters eligible for automated WhatsApp & Email parent alerts
 * based on risk tier, composite score, % fee left, contact reachability, and cooldown.
 */
export function selectEligibleDefaultersForAlert(params: {
  rankedDefaulters: RankedFeeDefaulter[];
  config: FeeDefaulterNotificationConfig;
  activeMonth: FeeMonthKey;
  existingLogs: FeeDefaulterNotificationRecord[];
  students?: StudentRecord[];
  users?: UserAccount[];
  classScope?: string;
  nowMs?: number;
  channelOverride?: DefaulterAlertChannel;
}): DefaulterAlertSelectionSummary {
  const {
    rankedDefaulters,
    config,
    activeMonth,
    existingLogs,
    students = [],
    users = [],
    classScope = 'ALL',
    nowMs = Date.now(),
    channelOverride,
  } = params;

  const effectiveChannel = channelOverride ?? config.channel;
  const cooldownMs = Math.max(1, config.cooldownDays) * 24 * 60 * 60 * 1000;

  // Map latest alert timestamp per accountId
  const latestAlertByAccount = new Map<string, string>();
  for (const log of existingLogs) {
    if (log.schoolId !== config.schoolId) continue;
    const prev = latestAlertByAccount.get(log.accountId);
    if (!prev || log.sentAt > prev) {
      latestAlertByAccount.set(log.accountId, log.sentAt);
    }
  }

  const eligibleReady: EligibleDefaulterAlertCandidate[] = [];
  const skippedCooldown: EligibleDefaulterAlertCandidate[] = [];
  let missingContactCount = 0;

  for (const acc of rankedDefaulters) {
    if (classScope !== 'ALL' && acc.className !== classScope) continue;

    const dm = acc.defaulterMetrics;
    const tierMatches =
      config.tierScope === 'Critical'
        ? dm.riskTier === 'Critical'
        : dm.riskTier === 'Critical' || dm.riskTier === 'High';

    if (!tierMatches) continue;
    if (dm.defaulterPriorityScore < config.minPriorityScore) continue;
    if (dm.percentLeft < config.minPercentLeft) continue;

    const { phone, email } = resolveParentContactsForAccount({
      account: acc,
      students,
      users,
    });

    const hasReachableChannel =
      effectiveChannel === 'WhatsApp'
        ? Boolean(phone)
        : effectiveChannel === 'Email'
          ? Boolean(email)
          : Boolean(phone || email);

    if (!hasReachableChannel) {
      missingContactCount += 1;
    }

    const tl = buildStudentPaymentTimeline({
      account: acc,
      activeMonth,
    });

    const lastSentAt = latestAlertByAccount.get(acc.id);
    let inCooldown = false;
    let cooldownDaysRemaining = 0;
    if (lastSentAt) {
      const elapsed = nowMs - Date.parse(lastSentAt);
      if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < cooldownMs) {
        inCooldown = true;
        cooldownDaysRemaining = Math.max(
          1,
          Math.ceil((cooldownMs - elapsed) / (24 * 60 * 60 * 1000)),
        );
      }
    }

    const candidate: EligibleDefaulterAlertCandidate = {
      account: acc,
      phone,
      email,
      paymentNature: tl.paymentNature,
      hasReachableChannel,
      inCooldown,
      cooldownDaysRemaining,
      lastAlertSentAt: lastSentAt,
    };

    if (inCooldown) {
      skippedCooldown.push(candidate);
    } else {
      eligibleReady.push(candidate);
    }
  }

  return {
    eligibleReady,
    skippedCooldown,
    missingContactCount,
    totalMatchingCriteria: eligibleReady.length + skippedCooldown.length,
  };
}
