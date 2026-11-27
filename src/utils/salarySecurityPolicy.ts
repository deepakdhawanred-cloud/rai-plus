import type { StaffSalaryComputation, UserRole } from '../types';
import { getStaffSalaryAccessScope } from './campusAdminEngine';

export type EffectiveSalaryScope = 'full' | 'self' | 'none';

export interface SalaryRbacCapabilities {
  scope: EffectiveSalaryScope;
  roleLabel: string;
  canViewFullRoster: boolean;
  canSyncPayroll: boolean;
  canAutoApprovePayroll: boolean;
  canExportBulkCsv: boolean;
  canViewAuditLog: boolean;
  canDownloadPayslip: boolean;
}

const SCOPE_RANK: Record<EffectiveSalaryScope, number> = {
  none: 0,
  self: 1,
  full: 2,
};

const APPROVER_ROLES: UserRole[] = ['super_admin', 'school_admin', 'principal'];

function formatRoleLabel(role: UserRole): string {
  return role
    .split('_')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

/**
 * Computes the strictest effective RBAC scope for salary management by intersecting
 * the authenticated user's role policy with the server-declared scope.
 */
export function resolveSalaryRbacCapabilities(
  userRole: UserRole,
  serverScope?: EffectiveSalaryScope,
): SalaryRbacCapabilities {
  const roleScope = getStaffSalaryAccessScope(userRole);
  let effective: EffectiveSalaryScope = roleScope;

  if (serverScope && SCOPE_RANK[serverScope] < SCOPE_RANK[roleScope]) {
    effective = serverScope;
  }

  const isFull = effective === 'full';
  const isSelf = effective === 'self';

  return {
    scope: effective,
    roleLabel: formatRoleLabel(userRole),
    canViewFullRoster: isFull,
    canSyncPayroll: isFull,
    canAutoApprovePayroll: isFull && APPROVER_ROLES.includes(userRole),
    canExportBulkCsv: isFull,
    canViewAuditLog: isFull,
    canDownloadPayslip: isFull || isSelf,
  };
}

/**
 * Prevents spreadsheet formula injection (DDE / Excel macro attacks) on exported CSV cells.
 */
export function sanitizeCsvCell(raw: string | number | null | undefined): string {
  const str = String(raw ?? '');
  const trimmedStart = str.replace(/^\s+/, '');
  const needsPrefix = /^[=+\-@\t\r]/.test(trimmedStart);
  const safe = needsPrefix ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function escapeHtmlStrict(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMaskedInr(amountInr: number, revealed: boolean): string {
  if (!revealed) return '₹ ••••••';
  return `₹${Math.round(amountInr).toLocaleString('en-IN')}`;
}

/**
 * Filters salary rows strictly to what the caller is authorized to see.
 * Even if an unexpected row were passed into the UI, 'none' returns [] and 'self'
 * returns at most the authenticated staff member's own row.
 */
export function filterAuthorizedSalaryRows(params: {
  rows: StaffSalaryComputation[];
  scope: EffectiveSalaryScope;
  authenticatedUserName: string;
  authenticatedStaffId?: string;
}): StaffSalaryComputation[] {
  const { rows, scope, authenticatedUserName, authenticatedStaffId } = params;
  if (scope === 'none') return [];
  if (scope === 'full') return rows;

  const normName = authenticatedUserName.trim().toLowerCase();
  const matched = rows.filter(
    (r) =>
      (authenticatedStaffId && r.staffId === authenticatedStaffId) ||
      r.staffName.trim().toLowerCase() === normName,
  );
  return matched.slice(0, 1);
}
