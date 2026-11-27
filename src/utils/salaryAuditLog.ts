import type {
  SalaryAuditActionType,
  SalaryModificationAuditRecord,
  StaffProfile,
  UserAccount,
  UserRole,
} from '../types';

export function buildSalaryModificationAuditRecord(params: {
  schoolId: string;
  actor: Pick<UserAccount, 'id' | 'name' | 'role'>;
  staffId?: string;
  employeeCode?: string;
  staffName: string;
  designation: string;
  actionType: SalaryAuditActionType;
  previousBaseSalaryInr: number | null;
  newBaseSalaryInr: number;
  previousAllowanceInr: number | null;
  newAllowanceInr: number;
  previousDeductionInr: number | null;
  newDeductionInr: number;
  sourceLabel: string;
  note?: string;
  timestamp?: string;
}): SalaryModificationAuditRecord {
  const prevGross =
    params.previousBaseSalaryInr !== null
      ? Math.round(params.previousBaseSalaryInr + (params.previousAllowanceInr ?? 0))
      : null;
  const newGross = Math.round(params.newBaseSalaryInr + params.newAllowanceInr);
  const deltaGrossInr = prevGross !== null ? newGross - prevGross : newGross;

  return {
    id: `salaud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    schoolId: params.schoolId,
    timestamp: params.timestamp || new Date().toISOString(),
    staffId: params.staffId,
    employeeCode: params.employeeCode,
    staffName: params.staffName.trim(),
    designation: params.designation.trim(),
    actionType: params.actionType,
    adminUserId: params.actor.id,
    adminUserName: params.actor.name,
    adminUserRole: params.actor.role,
    previousBaseSalaryInr:
      params.previousBaseSalaryInr !== null ? Math.round(params.previousBaseSalaryInr) : null,
    newBaseSalaryInr: Math.round(params.newBaseSalaryInr),
    previousAllowanceInr:
      params.previousAllowanceInr !== null ? Math.round(params.previousAllowanceInr) : null,
    newAllowanceInr: Math.round(params.newAllowanceInr),
    previousDeductionInr:
      params.previousDeductionInr !== null ? Math.round(params.previousDeductionInr) : null,
    newDeductionInr: Math.round(params.newDeductionInr),
    previousGrossSalaryInr: prevGross,
    newGrossSalaryInr: newGross,
    deltaGrossInr,
    sourceLabel: params.sourceLabel,
    note: params.note?.trim() || undefined,
  };
}

export function hasSalaryValuesChanged(prev: {
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  pfOrDeductionInr: number;
}, next: {
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  pfOrDeductionInr: number;
}): boolean {
  return (
    Math.round(prev.baseMonthlySalaryInr) !== Math.round(next.baseMonthlySalaryInr) ||
    Math.round(prev.fixedAllowanceInr) !== Math.round(next.fixedAllowanceInr) ||
    Math.round(prev.pfOrDeductionInr) !== Math.round(next.pfOrDeductionInr)
  );
}

/**
 * Generates realistic baseline salary revision audit entries for a school's initial
 * seeded staff roster so administrators immediately see structured modification history
 * alongside any new live edits.
 */
export function createSeedSalaryAuditLogsForSchool(params: {
  schoolId: string;
  staffProfiles: StaffProfile[];
  users: UserAccount[];
}): SalaryModificationAuditRecord[] {
  const { schoolId, staffProfiles, users } = params;
  const schoolStaff = staffProfiles.filter((p) => p.schoolId === schoolId);
  if (schoolStaff.length === 0) return [];

  const schoolAdmin =
    users.find((u) => u.schoolId === schoolId && u.role === 'school_admin') ||
    users.find((u) => u.schoolId === schoolId && u.role === 'principal') ||
    users.find((u) => u.role === 'super_admin') || {
      id: 'usr-admin-seed',
      name: 'School Administrator',
      role: 'school_admin' as UserRole,
    };

  const principal =
    users.find((u) => u.schoolId === schoolId && u.role === 'principal') || schoolAdmin;

  const accountant =
    users.find((u) => u.schoolId === schoolId && u.role === 'accountant') || schoolAdmin;

  const sampleStaff = schoolStaff.slice(0, 4);
  interface SeedAuditSpec {
    profile: StaffProfile;
    actor: Pick<UserAccount, 'id' | 'name' | 'role'>;
    actionType: SalaryAuditActionType;
    prevBaseDelta: number;
    prevAllowDelta: number;
    prevDedDelta: number;
    timestamp: string;
    sourceLabel: string;
    note: string;
  }

  const rawSeedSpecs: Array<SeedAuditSpec | null> = [
    sampleStaff[0]
      ? {
          profile: sampleStaff[0],
          actor: principal,
          actionType: 'SALARY_UPDATED',
          prevBaseDelta: -2500,
          prevAllowDelta: -500,
          prevDedDelta: 0,
          timestamp: '2026-11-18T10:24:15.000Z',
          sourceLabel: 'Salary Structure Editor',
          note: 'Annual academic session 2026-27 increment approved',
        }
      : null,
    sampleStaff[1]
      ? {
          profile: sampleStaff[1],
          actor: schoolAdmin,
          actionType: 'SALARY_UPDATED',
          prevBaseDelta: -1800,
          prevAllowDelta: 0,
          prevDedDelta: -200,
          timestamp: '2026-11-12T14:42:08.000Z',
          sourceLabel: 'Salary Structure Editor',
          note: 'Grade revision & PF statutory alignment',
        }
      : null,
    sampleStaff[2]
      ? {
          profile: sampleStaff[2],
          actor: accountant,
          actionType: 'BULK_PAYROLL_UPDATE',
          prevBaseDelta: -1000,
          prevAllowDelta: -500,
          prevDedDelta: 0,
          timestamp: '2026-11-04T09:15:30.000Z',
          sourceLabel: 'Bulk Payroll Sheet (November 2026)',
          note: 'Transport & fixed allowance adjustment',
        }
      : null,
    sampleStaff[3]
      ? {
          profile: sampleStaff[3],
          actor: schoolAdmin,
          actionType: 'CSV_SHEET_IMPORT',
          prevBaseDelta: 0,
          prevAllowDelta: 0,
          prevDedDelta: 0,
          timestamp: '2026-10-28T11:08:44.000Z',
          sourceLabel: '2026-27 Staff Salary Sheet Import',
          note: 'Onboarded into 2026-27 verified staff salary register',
        }
      : null,
  ];
  const seedSpecs = rawSeedSpecs.filter((item): item is SeedAuditSpec => item !== null);

  return seedSpecs.map((spec, idx) => {
    const isInitialImport = spec.actionType === 'CSV_SHEET_IMPORT';
    const prevBase = isInitialImport
      ? null
      : Math.max(0, spec.profile.baseMonthlySalaryInr + spec.prevBaseDelta);
    const prevAllow = isInitialImport
      ? null
      : Math.max(0, spec.profile.fixedAllowanceInr + spec.prevAllowDelta);
    const prevDed = isInitialImport
      ? null
      : Math.max(0, spec.profile.pfOrDeductionInr + spec.prevDedDelta);

    return {
      ...buildSalaryModificationAuditRecord({
        schoolId,
        actor: spec.actor,
        staffId: spec.profile.id,
        employeeCode: spec.profile.employeeCode,
        staffName: spec.profile.name,
        designation: spec.profile.designation,
        actionType: spec.actionType,
        previousBaseSalaryInr: prevBase,
        newBaseSalaryInr: spec.profile.baseMonthlySalaryInr,
        previousAllowanceInr: prevAllow,
        newAllowanceInr: spec.profile.fixedAllowanceInr,
        previousDeductionInr: prevDed,
        newDeductionInr: spec.profile.pfOrDeductionInr,
        sourceLabel: spec.sourceLabel,
        note: spec.note,
        timestamp: spec.timestamp,
      }),
      id: `salaud-seed-${schoolId}-${idx + 1}`,
    };
  });
}

export interface SalaryAuditSummary {
  totalChanges: number;
  netMonthlyDeltaInr: number;
  uniqueStaffCount: number;
  latestTimestamp: string | null;
  latestAdminName: string | null;
}

export function computeSalaryAuditSummary(
  records: SalaryModificationAuditRecord[],
): SalaryAuditSummary {
  const sorted = [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const uniqueStaff = new Set(
    sorted.map((r) => (r.staffId || r.staffName.trim().toLowerCase())),
  );
  // Sum net monthly payroll delta across modification events (excluding initial creation/onboarding from pure delta if desired, or sum revision deltas)
  const netMonthlyDeltaInr = sorted.reduce(
    (sum, r) => sum + (r.previousGrossSalaryInr !== null ? r.deltaGrossInr : 0),
    0,
  );
  return {
    totalChanges: sorted.length,
    netMonthlyDeltaInr,
    uniqueStaffCount: uniqueStaff.size,
    latestTimestamp: sorted[0]?.timestamp || null,
    latestAdminName: sorted[0]?.adminUserName || null,
  };
}

export function filterSalaryAuditLogs(
  records: SalaryModificationAuditRecord[],
  filters: {
    query?: string;
    actionType?: SalaryAuditActionType | 'ALL';
  },
): SalaryModificationAuditRecord[] {
  const q = (filters.query || '').trim().toLowerCase();
  const actionType = filters.actionType || 'ALL';

  return [...records]
    .filter((rec) => {
      if (actionType !== 'ALL' && rec.actionType !== actionType) return false;
      if (!q) return true;
      return (
        rec.staffName.toLowerCase().includes(q) ||
        (rec.employeeCode || '').toLowerCase().includes(q) ||
        rec.designation.toLowerCase().includes(q) ||
        rec.adminUserName.toLowerCase().includes(q) ||
        rec.sourceLabel.toLowerCase().includes(q) ||
        (rec.note || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function formatSalaryAuditActionLabel(actionType: SalaryAuditActionType): string {
  switch (actionType) {
    case 'SALARY_UPDATED':
      return 'Salary Revised';
    case 'PROFILE_CREATED':
      return 'Staff Added';
    case 'CSV_SHEET_IMPORT':
      return 'CSV Import';
    case 'BULK_PAYROLL_UPDATE':
      return 'Bulk Payroll Edit';
    default:
      return actionType;
  }
}

export function formatAdminRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'school_admin':
      return 'School Admin';
    case 'principal':
      return 'Principal';
    case 'accountant':
      return 'Accountant';
    default:
      return role;
  }
}
