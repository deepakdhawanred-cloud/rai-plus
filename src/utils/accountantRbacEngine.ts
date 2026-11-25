import type { AccountingEntry, PayrollRegisterEntry, UserRole } from '../types';

export type FinancePermissionAction =
  | 'view_finance_360'
  | 'create_accounting_entry'
  | 'upload_financial_document'
  | 'prepare_payroll'
  | 'record_fee_collection'
  | 'reconcile_bank'
  | 'generate_financial_reports'
  | 'approve_accounting_entry'
  | 'approve_payroll'
  | 'authorise_payment'
  | 'delete_posted_transaction'
  | 'modify_locked_period'
  | 'provision_accountant'
  | 'manage_school_permissions';

const MANAGEMENT_APPROVERS = new Set<UserRole>([
  'super_admin',
  'school_admin',
  'principal',
]);

const FINANCE_OPERATORS = new Set<UserRole>([
  'super_admin',
  'school_admin',
  'principal',
  'accountant',
]);

export function canPerformFinanceAction(
  role: UserRole,
  action: FinancePermissionAction,
): { allowed: boolean; reason: string } {
  switch (action) {
    case 'view_finance_360':
      if (FINANCE_OPERATORS.has(role) || role === 'coordinator') {
        return { allowed: true, reason: 'Authorized finance viewer.' };
      }
      return { allowed: false, reason: 'Finance 360° is restricted to Finance and Management roles.' };

    case 'create_accounting_entry':
    case 'upload_financial_document':
    case 'prepare_payroll':
    case 'record_fee_collection':
    case 'reconcile_bank':
    case 'generate_financial_reports':
      if (FINANCE_OPERATORS.has(role)) {
        return { allowed: true, reason: 'Authorized finance operational action.' };
      }
      return {
        allowed: false,
        reason: 'Only Accountant or School Management can perform operational accounting actions.',
      };

    case 'approve_accounting_entry':
    case 'approve_payroll':
    case 'authorise_payment':
      if (MANAGEMENT_APPROVERS.has(role)) {
        return { allowed: true, reason: 'Authorized management approval.' };
      }
      return {
        allowed: false,
        reason:
          'Segregation of duties: Accountants cannot approve their own entries, approve payroll, or authorise final payments. Principal or School Admin approval is required.',
      };

    case 'delete_posted_transaction':
      return {
        allowed: false,
        reason:
          'Audit integrity rule: Posted accounting transactions cannot be deleted. Submit a reversal entry for Principal approval instead.',
      };

    case 'modify_locked_period':
      if (role === 'super_admin') {
        return { allowed: true, reason: 'Super Admin override for locked period.' };
      }
      return {
        allowed: false,
        reason: 'Locked financial periods cannot be modified by Accountants or standard users.',
      };

    case 'provision_accountant':
    case 'manage_school_permissions':
      if (role === 'super_admin' || role === 'school_admin' || role === 'principal') {
        return { allowed: true, reason: 'Authorized institutional administrator.' };
      }
      return {
        allowed: false,
        reason: 'Only School Admin, Principal, or Super Admin may provision Accountant accounts or change permissions.',
      };
  }
}

export function validateAccountingEntryMutation(params: {
  role: UserRole;
  actorName: string;
  entry: AccountingEntry;
  mutation: 'edit' | 'delete' | 'approve' | 'reject';
}): { allowed: boolean; reason: string } {
  const { role, actorName, entry, mutation } = params;

  if (entry.periodLocked && role !== 'super_admin') {
    return {
      allowed: false,
      reason: `Financial period ${entry.monthKey} is locked and cannot be altered.`,
    };
  }

  if (mutation === 'delete') {
    if (entry.status === 'approved') {
      return {
        allowed: false,
        reason: 'Posted (approved) transactions cannot be deleted.',
      };
    }
    if (role === 'accountant' && entry.status !== 'draft') {
      return {
        allowed: false,
        reason: 'Accountants cannot delete submitted or posted transactions.',
      };
    }
    return { allowed: true, reason: 'Draft entry removal permitted.' };
  }

  if (mutation === 'approve' || mutation === 'reject') {
    if (role === 'accountant') {
      return {
        allowed: false,
        reason: 'Accountants are not permitted to approve or self-approve accounting entries.',
      };
    }
    if (!MANAGEMENT_APPROVERS.has(role)) {
      return {
        allowed: false,
        reason: 'Only Principal, School Admin, or Super Admin can approve entries.',
      };
    }
    if (entry.createdBy === actorName && role !== 'super_admin') {
      return {
        allowed: false,
        reason: 'Dual-control safeguard: creator cannot self-approve this entry.',
      };
    }
    return { allowed: true, reason: 'Management approval authorized.' };
  }

  // Edit
  if (entry.status === 'approved') {
    return {
      allowed: false,
      reason: 'Approved transactions are immutable.',
    };
  }
  return { allowed: true, reason: 'Draft/submitted edit permitted.' };
}

export function validatePayrollApproval(params: {
  role: UserRole;
  entry: PayrollRegisterEntry;
}): { allowed: boolean; reason: string } {
  if (params.role === 'accountant') {
    return {
      allowed: false,
      reason: 'Segregation of duties: Accountants prepare payroll registers but cannot approve payroll.',
    };
  }
  if (!MANAGEMENT_APPROVERS.has(params.role)) {
    return {
      allowed: false,
      reason: 'Principal or School Admin approval is required for payroll.',
    };
  }
  return { allowed: true, reason: 'Payroll approval authorized.' };
}

/**
 * Deterministic financial document extractor for uploaded invoices, fuel bills,
 * salary sheets, or CSV/PDF metadata. Always flags extracted entries as `draft`
 * pending Accountant verification and Principal approval.
 */
export function extractAccountingDraftFromDocument(params: {
  fileName: string;
  rawText: string;
}): {
  category: AccountingEntry['category'];
  direction: AccountingEntry['direction'];
  vendorOrParty: string;
  busCode?: string;
  amountInr: number;
  description: string;
  confidenceLabel: string;
} {
  const combined = `${params.fileName} ${params.rawText}`.toLowerCase();

  let category: AccountingEntry['category'] = 'Vendor Purchase';
  let direction: AccountingEntry['direction'] = 'Expense';
  if (/diesel|petrol|fuel|bus\s*\d|hpcl|iocl|bharat petroleum/.test(combined)) {
    category = 'Bus Fuel Expense';
  } else if (/repair|tyre|service|maintenance|workshop/.test(combined)) {
    category = 'Maintenance Expense';
  } else if (/driver|conductor/.test(combined) && /salary|payroll|wages/.test(combined)) {
    category = 'Driver Payroll';
  } else if (/teacher|faculty|salary|payroll/.test(combined)) {
    category = 'Teacher Payroll';
  } else if (/fee|tuition|receipt/.test(combined)) {
    category = 'Fee Collection';
    direction = 'Income';
  } else if (/electricity|water|internet|utility/.test(combined)) {
    category = 'Utility & Operations';
  }

  const busMatch = combined.match(/bus[-\s#]*([a-z0-9]+)/i);
  const busCode = busMatch ? `BUS-${busMatch[1].toUpperCase()}` : undefined;

  const amountMatches = params.rawText.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i)
    || params.rawText.match(/\b([0-9]{3,7}(?:\.[0-9]{1,2})?)\b/);
  const parsedAmount = amountMatches
    ? Math.round(Number(amountMatches[1].replace(/,/g, '')))
    : 4850;
  const amountInr = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 4850;

  const vendorMatch = params.rawText.match(/(?:vendor|party|from|supplier|station)\s*[:=-]\s*([^\n,;]{3,45})/i);
  const vendorOrParty = vendorMatch
    ? vendorMatch[1].trim()
    : category === 'Bus Fuel Expense'
      ? 'Highway Fuel Station (Extracted)'
      : 'Institutional Vendor (Review)';

  return {
    category,
    direction,
    vendorOrParty,
    busCode,
    amountInr,
    description: `AI-extracted draft from ${params.fileName}${busCode ? ` (${busCode})` : ''} — verify before submitting.`,
    confidenceLabel: amountMatches ? 'High confidence (Verify & Submit)' : 'Estimated (Verify Amount)',
  };
}
