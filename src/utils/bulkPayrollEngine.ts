import type { PayrollRegisterEntry } from '../types';

export interface EditablePayrollRow {
  rowKey: string;
  id?: string;
  monthLabel: string;
  staffName: string;
  staffRoleType: 'Teacher' | 'Driver' | 'Support Staff';
  designation: string;
  daysWorked: number;
  grossSalaryInr: number;
  deductionsInr: number;
  netPayableInr: number;
  status: PayrollRegisterEntry['status'] | 'new';
  preparedBy?: string;
  approvedBy?: string;
  dirty?: boolean;
}

export type BulkAdjustmentMode =
  | 'percent_gross'
  | 'flat_gross'
  | 'set_deductions'
  | 'set_days';

export type StaffCategoryFilter = 'All' | 'Teacher' | 'Driver' | 'Support Staff';

export function computeNetPayable(grossSalaryInr: number, deductionsInr: number): number {
  const gross = Math.max(0, Math.round(Number(grossSalaryInr) || 0));
  const ded = Math.max(0, Math.round(Number(deductionsInr) || 0));
  return Math.max(0, gross - ded);
}

export function normalizeStaffCategory(raw?: string): 'Teacher' | 'Driver' | 'Support Staff' {
  const s = (raw || '').toLowerCase();
  if (s.includes('driver') || s.includes('bus') || s.includes('conductor')) return 'Driver';
  if (
    s.includes('support') ||
    s.includes('attendant') ||
    s.includes('helper') ||
    s.includes('clerk') ||
    s.includes('account') ||
    s.includes('transport') ||
    s.includes('admin') ||
    s.includes('guard') ||
    s.includes('peon')
  ) {
    return 'Support Staff';
  }
  return 'Teacher';
}

export function applyBulkSalaryAdjustment(
  rows: EditablePayrollRow[],
  params: {
    category: StaffCategoryFilter;
    mode: BulkAdjustmentMode;
    value: number;
    includeApproved?: boolean;
  },
): EditablePayrollRow[] {
  const { category, mode, value, includeApproved = false } = params;
  if (!Number.isFinite(value)) return rows;

  return rows.map((row) => {
    if (category !== 'All' && row.staffRoleType !== category) return row;
    if (row.status === 'approved' && !includeApproved) return row;

    let nextGross = row.grossSalaryInr;
    let nextDeductions = row.deductionsInr;
    let nextDays = row.daysWorked;

    if (mode === 'percent_gross') {
      nextGross = Math.max(0, Math.round(row.grossSalaryInr * (1 + value / 100)));
    } else if (mode === 'flat_gross') {
      nextGross = Math.max(0, Math.round(row.grossSalaryInr + value));
    } else if (mode === 'set_deductions') {
      nextDeductions = Math.max(0, Math.round(value));
    } else if (mode === 'set_days') {
      nextDays = Math.min(31, Math.max(0, Math.round(value)));
    }

    return {
      ...row,
      daysWorked: nextDays,
      grossSalaryInr: nextGross,
      deductionsInr: nextDeductions,
      netPayableInr: computeNetPayable(nextGross, nextDeductions),
      dirty: true,
    };
  });
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
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
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseMoney(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹,\s]/g, '').replace(/^rs\.?/i, '');
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

/**
 * Parses pasted Excel / Google Sheets (TSV) or CSV rows into EditablePayrollRow[].
 * Columns supported (with or without headers):
 * Staff Name | Category | Designation | Days Worked | Gross Salary | Deductions
 */
export function parseBulkPayrollPaste(
  rawText: string,
  monthLabel: string,
): { rows: EditablePayrollRow[]; warnings: string[] } {
  const trimmed = (rawText || '').trim();
  if (!trimmed) {
    return {
      rows: [],
      warnings: ['Paste staff salary rows from Excel/Google Sheets or upload a CSV file.'],
    };
  }

  const lines = trimmed
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const tabCount = lines.slice(0, 5).reduce((s, l) => s + (l.match(/\t/g)?.length || 0), 0);
  const commaCount = lines.slice(0, 5).reduce((s, l) => s + (l.match(/,/g)?.length || 0), 0);
  const useTabs = tabCount > 0 && tabCount >= commaCount;

  const splitRow = (line: string) =>
    useTabs
      ? line.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''))
      : parseCsvLine(line);

  let startIdx = 0;
  const firstCols = splitRow(lines[0]).map((c) => c.toLowerCase());
  const looksLikeHeader = firstCols.some((c) =>
    /staff|name|employee|gross|salary|designation|days/.test(c),
  );
  if (looksLikeHeader) startIdx = 1;

  const warnings: string[] = [];
  const rows: EditablePayrollRow[] = [];

  for (let i = startIdx; i < lines.length; i += 1) {
    const cols = splitRow(lines[i]);
    if (cols.length < 2) {
      warnings.push(`Line ${i + 1} skipped (expected at least Staff Name and Gross Salary).`);
      continue;
    }

    const staffName = (cols[0] || '').trim();
    if (!staffName) continue;

    // Support both 2-column quick format (Name, Gross) and full 6-column format
    let staffRoleType: 'Teacher' | 'Driver' | 'Support Staff' = 'Teacher';
    let designation = 'Teaching Faculty';
    let daysWorked = 26;
    let grossSalaryInr = 0;
    let deductionsInr = 0;

    if (cols.length === 2) {
      grossSalaryInr = parseMoney(cols[1]);
    } else if (cols.length === 3) {
      designation = cols[1] || 'Staff';
      staffRoleType = normalizeStaffCategory(cols[1]);
      grossSalaryInr = parseMoney(cols[2]);
    } else if (cols.length === 4) {
      staffRoleType = normalizeStaffCategory(cols[1]);
      designation = cols[2] || staffRoleType;
      grossSalaryInr = parseMoney(cols[3]);
    } else {
      staffRoleType = normalizeStaffCategory(cols[1]);
      designation = cols[2] || staffRoleType;
      daysWorked = Math.min(31, Math.max(0, Math.round(Number(cols[3]) || 26)));
      grossSalaryInr = parseMoney(cols[4]);
      deductionsInr = parseMoney(cols[5]);
    }

    if (grossSalaryInr <= 0) {
      warnings.push(`Line ${i + 1} (${staffName}) skipped — invalid or zero gross salary.`);
      continue;
    }

    rows.push({
      rowKey: `import-${i}-${staffName.toLowerCase().replace(/\s+/g, '-')}`,
      monthLabel,
      staffName,
      staffRoleType,
      designation,
      daysWorked,
      grossSalaryInr,
      deductionsInr,
      netPayableInr: computeNetPayable(grossSalaryInr, deductionsInr),
      status: 'new',
      dirty: true,
    });
  }

  return { rows, warnings };
}

export function summarizePayrollSheet(rows: EditablePayrollRow[]): {
  totalStaff: number;
  totalGrossInr: number;
  totalDeductionsInr: number;
  totalNetInr: number;
  pendingApprovalCount: number;
  approvedCount: number;
  dirtyCount: number;
} {
  let totalGrossInr = 0;
  let totalDeductionsInr = 0;
  let totalNetInr = 0;
  let pendingApprovalCount = 0;
  let approvedCount = 0;
  let dirtyCount = 0;

  for (const r of rows) {
    totalGrossInr += r.grossSalaryInr;
    totalDeductionsInr += r.deductionsInr;
    totalNetInr += r.netPayableInr;
    if (r.status === 'approved') approvedCount += 1;
    else if (r.status === 'submitted') pendingApprovalCount += 1;
    if (r.dirty || r.status === 'new') dirtyCount += 1;
  }

  return {
    totalStaff: rows.length,
    totalGrossInr,
    totalDeductionsInr,
    totalNetInr,
    pendingApprovalCount,
    approvedCount,
    dirtyCount,
  };
}
