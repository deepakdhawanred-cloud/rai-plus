import type {
  CanonicalFeePaymentPlan,
  FeeLedgerAccount,
  School,
  SchoolFeeStructureRow,
} from '../types';
import {
  getClassSortOrder,
  normalizeFeeClassName,
  normalizePaymentPlan,
  parseCsvLine,
  parseInrCurrency,
} from './financialDashboardEngine.ts';

export interface FeeStructureInputRow {
  id?: string;
  className: string;
  admissionFeeInr?: number;
  annualChargesInr?: number;
  tuitionMonthlyInr?: number;
  labActivityMonthlyInr?: number;
  transportOptionalMonthlyInr?: number;
  defaultPaymentPlan?: CanonicalFeePaymentPlan | string;
  notes?: string;
}

export interface ParsedFeeStructureImport {
  rows: SchoolFeeStructureRow[];
  warnings: string[];
  skippedLines: number;
  detectedFormat: 'json' | 'tsv' | 'csv';
}

function sanitizeMoney(val: unknown): number {
  if (typeof val === 'number') {
    return Number.isFinite(val) && val > 0 ? Math.round(val) : 0;
  }
  if (typeof val === 'string') {
    const n = parseInrCurrency(val);
    return n > 0 ? Math.round(n) : 0;
  }
  return 0;
}

export function computeFeeStructureTotals(input: {
  admissionFeeInr?: number;
  annualChargesInr?: number;
  tuitionMonthlyInr?: number;
  labActivityMonthlyInr?: number;
  transportOptionalMonthlyInr?: number;
}): {
  admissionFeeInr: number;
  annualChargesInr: number;
  tuitionMonthlyInr: number;
  labActivityMonthlyInr: number;
  transportOptionalMonthlyInr: number;
  totalMonthlyInr: number;
  totalAnnualRecurringInr: number;
  quarterlyInstallmentInr: number;
  halfYearlyInstallmentInr: number;
} {
  const admissionFeeInr = sanitizeMoney(input.admissionFeeInr);
  const annualChargesInr = sanitizeMoney(input.annualChargesInr);
  const tuitionMonthlyInr = sanitizeMoney(input.tuitionMonthlyInr);
  const labActivityMonthlyInr = sanitizeMoney(input.labActivityMonthlyInr);
  const transportOptionalMonthlyInr = sanitizeMoney(input.transportOptionalMonthlyInr);

  const totalMonthlyInr = tuitionMonthlyInr + labActivityMonthlyInr;
  const totalAnnualRecurringInr = totalMonthlyInr * 12 + annualChargesInr;
  const quarterlyInstallmentInr = Math.round(totalAnnualRecurringInr / 4);
  const halfYearlyInstallmentInr = Math.round(totalAnnualRecurringInr / 2);

  return {
    admissionFeeInr,
    annualChargesInr,
    tuitionMonthlyInr,
    labActivityMonthlyInr,
    transportOptionalMonthlyInr,
    totalMonthlyInr,
    totalAnnualRecurringInr,
    quarterlyInstallmentInr,
    halfYearlyInstallmentInr,
  };
}

export function buildFeeStructureRow(
  input: FeeStructureInputRow,
  schoolId: string,
  session: string,
  updatedBy: string,
  updatedAt = new Date().toISOString(),
): SchoolFeeStructureRow {
  const className = normalizeFeeClassName(input.className);
  const totals = computeFeeStructureTotals(input);
  const slug = className.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'class';
  return {
    id: input.id && input.id.trim() ? input.id.trim() : `fs-${schoolId}-${slug}`,
    schoolId,
    session,
    className,
    ...totals,
    defaultPaymentPlan: normalizePaymentPlan(input.defaultPaymentPlan || 'Monthly'),
    notes: (input.notes || '').trim() || undefined,
    updatedBy,
    updatedAt,
  };
}

export function sortFeeStructureRows(rows: SchoolFeeStructureRow[]): SchoolFeeStructureRow[] {
  return [...rows].sort((a, b) => {
    const orderDiff = getClassSortOrder(a.className) - getClassSortOrder(b.className);
    if (orderDiff !== 0) return orderDiff;
    return a.className.localeCompare(b.className);
  });
}

function median(values: number[]): number {
  const valid = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (valid.length === 0) return 0;
  const mid = Math.floor(valid.length / 2);
  if (valid.length % 2 === 1) return Math.round(valid[mid]);
  return Math.round((valid[mid - 1] + valid[mid]) / 2);
}

const DEFAULT_FALLBACK_STRUCTURE: Array<{
  className: string;
  admissionFeeInr: number;
  annualChargesInr: number;
  tuitionMonthlyInr: number;
  labActivityMonthlyInr: number;
  transportOptionalMonthlyInr: number;
}> = [
  { className: 'Nursery', admissionFeeInr: 4500, annualChargesInr: 3000, tuitionMonthlyInr: 1800, labActivityMonthlyInr: 200, transportOptionalMonthlyInr: 900 },
  { className: 'LKG', admissionFeeInr: 4500, annualChargesInr: 3000, tuitionMonthlyInr: 1900, labActivityMonthlyInr: 200, transportOptionalMonthlyInr: 900 },
  { className: 'UKG', admissionFeeInr: 4500, annualChargesInr: 3200, tuitionMonthlyInr: 2000, labActivityMonthlyInr: 250, transportOptionalMonthlyInr: 900 },
  { className: 'Class 1', admissionFeeInr: 5000, annualChargesInr: 3500, tuitionMonthlyInr: 2200, labActivityMonthlyInr: 300, transportOptionalMonthlyInr: 950 },
  { className: 'Class 2', admissionFeeInr: 5000, annualChargesInr: 3500, tuitionMonthlyInr: 2250, labActivityMonthlyInr: 300, transportOptionalMonthlyInr: 950 },
  { className: 'Class 3', admissionFeeInr: 5500, annualChargesInr: 3800, tuitionMonthlyInr: 2350, labActivityMonthlyInr: 350, transportOptionalMonthlyInr: 950 },
  { className: 'Class 4', admissionFeeInr: 5500, annualChargesInr: 3800, tuitionMonthlyInr: 2450, labActivityMonthlyInr: 350, transportOptionalMonthlyInr: 950 },
  { className: 'Class 5', admissionFeeInr: 5500, annualChargesInr: 4000, tuitionMonthlyInr: 2550, labActivityMonthlyInr: 400, transportOptionalMonthlyInr: 1000 },
  { className: 'Class 6', admissionFeeInr: 6000, annualChargesInr: 4200, tuitionMonthlyInr: 2700, labActivityMonthlyInr: 450, transportOptionalMonthlyInr: 1000 },
  { className: 'Class 7', admissionFeeInr: 6000, annualChargesInr: 4200, tuitionMonthlyInr: 2800, labActivityMonthlyInr: 450, transportOptionalMonthlyInr: 1000 },
  { className: 'Class 8', admissionFeeInr: 6500, annualChargesInr: 4500, tuitionMonthlyInr: 2950, labActivityMonthlyInr: 500, transportOptionalMonthlyInr: 1050 },
  { className: 'Class 9', admissionFeeInr: 7000, annualChargesInr: 5000, tuitionMonthlyInr: 3200, labActivityMonthlyInr: 600, transportOptionalMonthlyInr: 1100 },
  { className: 'Class 10', admissionFeeInr: 7000, annualChargesInr: 5200, tuitionMonthlyInr: 3400, labActivityMonthlyInr: 600, transportOptionalMonthlyInr: 1100 },
  { className: 'Class 11', admissionFeeInr: 8000, annualChargesInr: 6000, tuitionMonthlyInr: 3800, labActivityMonthlyInr: 750, transportOptionalMonthlyInr: 1150 },
  { className: 'Class 12', admissionFeeInr: 8000, annualChargesInr: 6200, tuitionMonthlyInr: 4000, labActivityMonthlyInr: 750, transportOptionalMonthlyInr: 1150 },
];

export function deriveInitialFeeStructureFromAccounts(
  accounts: FeeLedgerAccount[],
  schoolId: string,
  session = '2026-27',
): SchoolFeeStructureRow[] {
  const schoolAccounts = accounts.filter((a) => a.schoolId === schoolId);
  const nowIso = new Date().toISOString();

  if (schoolAccounts.length === 0) {
    return sortFeeStructureRows(
      DEFAULT_FALLBACK_STRUCTURE.map((row) =>
        buildFeeStructureRow(
          {
            ...row,
            defaultPaymentPlan: 'Quarterly',
            notes: 'Standard Rai Plus session tariff',
          },
          schoolId,
          session,
          'System Baseline (Ready for Principal Review)',
          nowIso,
        ),
      ),
    );
  }

  const byClass = new Map<string, FeeLedgerAccount[]>();
  for (const acc of schoolAccounts) {
    const cls = normalizeFeeClassName(acc.className || acc.rawClass);
    if (!cls || cls === 'Unassigned') continue;
    const list = byClass.get(cls) || [];
    list.push(acc);
    byClass.set(cls, list);
  }

  const derived: SchoolFeeStructureRow[] = [];
  for (const [className, list] of byClass.entries()) {
    const medPerMonth = median(list.map((a) => a.perMonthInr));
    const medYearly = median(list.map((a) => a.yearlyDemandInr));
    const effectiveMonthly =
      medPerMonth > 0 ? medPerMonth : medYearly > 0 ? Math.round(medYearly / 12) : 2000;
    const annualExtra =
      medYearly > effectiveMonthly * 12 ? Math.round(medYearly - effectiveMonthly * 12) : 0;

    // Split monthly into tuition + lab/activity reference cleanly (keeping exact sum === effectiveMonthly)
    const labActivityMonthlyInr = effectiveMonthly >= 2500 ? 300 : effectiveMonthly >= 1800 ? 200 : 0;
    const tuitionMonthlyInr = Math.max(0, effectiveMonthly - labActivityMonthlyInr);

    // Pick most common payment plan in class
    const planCounts = new Map<CanonicalFeePaymentPlan, number>();
    for (const acc of list) {
      const p = normalizePaymentPlan(acc.scheduleCadence);
      planCounts.set(p, (planCounts.get(p) || 0) + 1);
    }
    let dominantPlan: CanonicalFeePaymentPlan = 'Quarterly';
    let bestCount = -1;
    for (const [plan, count] of planCounts.entries()) {
      if (count > bestCount) {
        bestCount = count;
        dominantPlan = plan;
      }
    }

    const sortOrd = getClassSortOrder(className);
    const defaultAdmission = sortOrd <= 2 ? 4500 : sortOrd <= 15 ? 5500 : 6500;

    derived.push(
      buildFeeStructureRow(
        {
          className,
          admissionFeeInr: defaultAdmission,
          annualChargesInr: annualExtra,
          tuitionMonthlyInr,
          labActivityMonthlyInr,
          transportOptionalMonthlyInr: 950,
          defaultPaymentPlan: dominantPlan,
          notes: `Auto-derived from ${list.length} active student ledger${list.length === 1 ? '' : 's'}`,
        },
        schoolId,
        session,
        'Auto-Derived Baseline',
        nowIso,
      ),
    );
  }

  return sortFeeStructureRows(derived);
}

type ColumnRole =
  | 'className'
  | 'admissionFeeInr'
  | 'annualChargesInr'
  | 'tuitionMonthlyInr'
  | 'labActivityMonthlyInr'
  | 'transportOptionalMonthlyInr'
  | 'totalMonthlyInr'
  | 'totalAnnualRecurringInr'
  | 'defaultPaymentPlan'
  | 'notes';

function matchHeaderRole(headerRaw: string): ColumnRole | null {
  const h = headerRaw
    .toLowerCase()
    .replace(/[()₹.,\-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!h) return null;

  if (/(^|\b)(class|grade|standard|std|wing|section|course|level)(\b|$)/.test(h)) {
    return 'className';
  }
  if (/(admission|registration|enrollment|enrolment|one time|onetime)/.test(h)) {
    return 'admissionFeeInr';
  }
  if (/(annual charge|annual fee|development|exam|composite annual|session charge|building|misc annual)/.test(h)) {
    return 'annualChargesInr';
  }
  if (/(total annual|yearly|per year|annual demand|annual total|full year)/.test(h)) {
    return 'totalAnnualRecurringInr';
  }
  if (/(lab|smart class|activity|computer|library|sports|ict|co curricular)/.test(h)) {
    return 'labActivityMonthlyInr';
  }
  if (/(transport|bus|conveyance|van|cab)/.test(h)) {
    return 'transportOptionalMonthlyInr';
  }
  if (/(total monthly|monthly total|per month total)/.test(h)) {
    return 'totalMonthlyInr';
  }
  if (/(tuition|monthly|tution|composite monthly|fee per month|month fee)/.test(h)) {
    return 'tuitionMonthlyInr';
  }
  if (/(plan|cadence|cycle|frequency|schedule|installment mode|mode)/.test(h)) {
    return 'defaultPaymentPlan';
  }
  if (/(note|remark|comment|detail|info)/.test(h)) {
    return 'notes';
  }
  return null;
}

function splitDelimitedLine(line: string, delimiter: '\t' | ','): string[] {
  if (delimiter === '\t') {
    return line.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''));
  }
  return parseCsvLine(line);
}

function parsePlanText(raw?: string): CanonicalFeePaymentPlan {
  const s = (raw || '').toLowerCase();
  if (s.includes('half') || s.includes('semi') || s.includes('6')) return 'Half-Yearly';
  if (s.includes('year') || s.includes('annual') || s.includes('one')) return 'Yearly';
  if (s.includes('quart') || s.includes('3')) return 'Quarterly';
  if (s.includes('month')) return 'Monthly';
  return 'Quarterly';
}

export function parseImportedFeeStructure(
  rawText: string,
  schoolId: string,
  session: string,
  updatedBy: string,
): ParsedFeeStructureImport {
  const trimmed = (rawText || '').trim();
  const warnings: string[] = [];
  if (!trimmed) {
    return {
      rows: [],
      warnings: ['Paste rows from Excel/Google Sheets or upload a CSV/JSON fee structure file.'],
      skippedLines: 0,
      detectedFormat: 'csv',
    };
  }

  // 1. JSON format detection
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      const arr = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { rows?: unknown[] }).rows)
          ? (parsed as { rows: unknown[] }).rows
          : parsed && typeof parsed === 'object' && Array.isArray((parsed as { feeStructure?: unknown[] }).feeStructure)
            ? (parsed as { feeStructure: unknown[] }).feeStructure
            : null;
      if (!arr) {
        return {
          rows: [],
          warnings: ['JSON file must be an array of class rows or an object with a "rows" / "feeStructure" array.'],
          skippedLines: 0,
          detectedFormat: 'json',
        };
      }
      const deduped = new Map<string, SchoolFeeStructureRow>();
      let skipped = 0;
      for (const item of arr) {
        if (!item || typeof item !== 'object') {
          skipped += 1;
          continue;
        }
        const rec = item as Record<string, unknown>;
        const rawClass = String(rec.className ?? rec.class ?? rec.grade ?? rec.standard ?? '').trim();
        if (!rawClass) {
          skipped += 1;
          continue;
        }
        let tuitionMonthly = sanitizeMoney(rec.tuitionMonthlyInr ?? rec.tuitionMonthly ?? rec.tuition ?? rec.monthlyFee ?? rec.perMonthInr);
        const labActivity = sanitizeMoney(rec.labActivityMonthlyInr ?? rec.labActivityMonthly ?? rec.labFee ?? rec.activityFee);
        const annualCharges = sanitizeMoney(rec.annualChargesInr ?? rec.annualCharges ?? rec.annualFee ?? rec.developmentFee);
        const totalAnnualProvided = sanitizeMoney(rec.totalAnnualRecurringInr ?? rec.yearlyDemandInr ?? rec.totalAnnual);
        if (tuitionMonthly === 0 && labActivity === 0 && totalAnnualProvided > 0) {
          tuitionMonthly = Math.max(0, Math.round((totalAnnualProvided - annualCharges) / 12));
        }

        const row = buildFeeStructureRow(
          {
            className: rawClass,
            admissionFeeInr: sanitizeMoney(rec.admissionFeeInr ?? rec.admissionFee ?? rec.registrationFee),
            annualChargesInr: annualCharges,
            tuitionMonthlyInr: tuitionMonthly,
            labActivityMonthlyInr: labActivity,
            transportOptionalMonthlyInr: sanitizeMoney(rec.transportOptionalMonthlyInr ?? rec.transportFee ?? rec.busFee),
            defaultPaymentPlan: parsePlanText(String(rec.defaultPaymentPlan ?? rec.paymentPlan ?? rec.plan ?? 'Quarterly')),
            notes: typeof rec.notes === 'string' ? rec.notes : typeof rec.remarks === 'string' ? rec.remarks : '',
          },
          schoolId,
          session,
          updatedBy,
        );
        deduped.set(row.className.toLowerCase(), row);
      }

      if (deduped.size === 0) {
        warnings.push('No valid class fee rows found in JSON payload.');
      }
      return {
        rows: sortFeeStructureRows(Array.from(deduped.values())),
        warnings,
        skippedLines: skipped,
        detectedFormat: 'json',
      };
    } catch {
      return {
        rows: [],
        warnings: ['Invalid JSON syntax. Please check commas/brackets or use CSV / Excel paste.'],
        skippedLines: 0,
        detectedFormat: 'json',
      };
    }
  }

  // 2. Delimited text (TSV from Excel/Google Sheets or CSV)
  const rawLines = trimmed
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^[,;\t\s]+$/.test(l));

  const tabCount = rawLines.slice(0, 5).reduce((acc, l) => acc + (l.match(/\t/g)?.length || 0), 0);
  const commaCount = rawLines.slice(0, 5).reduce((acc, l) => acc + (l.match(/,/g)?.length || 0), 0);
  const delimiter: '\t' | ',' = tabCount > 0 && tabCount >= commaCount ? '\t' : ',';
  const detectedFormat: 'tsv' | 'csv' = delimiter === '\t' ? 'tsv' : 'csv';

  // Find header row in first 4 lines
  let headerRowIndex = -1;
  let columnMap: Map<number, ColumnRole> = new Map();

  for (let i = 0; i < Math.min(4, rawLines.length); i += 1) {
    const cols = splitDelimitedLine(rawLines[i], delimiter);
    const candidateMap = new Map<number, ColumnRole>();
    cols.forEach((col, idx) => {
      const role = matchHeaderRole(col);
      if (role && !Array.from(candidateMap.values()).includes(role)) {
        candidateMap.set(idx, role);
      }
    });
    if (candidateMap.size >= 2 && Array.from(candidateMap.values()).includes('className')) {
      headerRowIndex = i;
      columnMap = candidateMap;
      break;
    }
  }

  // Positional fallback if user pasted headerless rows (Class, Admission, Annual, Monthly Tuition, Lab/Activity, Transport, Plan, Notes)
  if (headerRowIndex === -1) {
    warnings.push(
      'No header row detected — mapped columns positionally as: Class, Admission Fee, Annual Charges, Monthly Tuition, Lab/Activity, Transport, Plan, Notes.',
    );
    columnMap = new Map<number, ColumnRole>([
      [0, 'className'],
      [1, 'admissionFeeInr'],
      [2, 'annualChargesInr'],
      [3, 'tuitionMonthlyInr'],
      [4, 'labActivityMonthlyInr'],
      [5, 'transportOptionalMonthlyInr'],
      [6, 'defaultPaymentPlan'],
      [7, 'notes'],
    ]);
  }

  const deduped = new Map<string, SchoolFeeStructureRow>();
  let skippedLines = 0;

  for (let i = headerRowIndex + 1; i < rawLines.length; i += 1) {
    const cols = splitDelimitedLine(rawLines[i], delimiter);
    const getCol = (role: ColumnRole): string => {
      for (const [idx, r] of columnMap.entries()) {
        if (r === role) return (cols[idx] || '').trim();
      }
      return '';
    };

    const rawClass = getCol('className');
    if (!rawClass || /^(total|grand total|summary|class|grade|sr\.?\s*no\.?)$/i.test(rawClass)) {
      skippedLines += 1;
      continue;
    }

    const admissionFeeInr = sanitizeMoney(getCol('admissionFeeInr'));
    const annualChargesInr = sanitizeMoney(getCol('annualChargesInr'));
    let tuitionMonthlyInr = sanitizeMoney(getCol('tuitionMonthlyInr'));
    const labActivityMonthlyInr = sanitizeMoney(getCol('labActivityMonthlyInr'));
    const transportOptionalMonthlyInr = sanitizeMoney(getCol('transportOptionalMonthlyInr'));
    const totalMonthlyProvided = sanitizeMoney(getCol('totalMonthlyInr'));
    const totalAnnualProvided = sanitizeMoney(getCol('totalAnnualRecurringInr'));

    if (tuitionMonthlyInr === 0 && totalMonthlyProvided > 0) {
      tuitionMonthlyInr = Math.max(0, totalMonthlyProvided - labActivityMonthlyInr);
    } else if (tuitionMonthlyInr === 0 && labActivityMonthlyInr === 0 && totalAnnualProvided > 0) {
      tuitionMonthlyInr = Math.max(0, Math.round((totalAnnualProvided - annualChargesInr) / 12));
    }

    const planRaw = getCol('defaultPaymentPlan');
    const notesRaw = getCol('notes');

    const row = buildFeeStructureRow(
      {
        className: rawClass,
        admissionFeeInr,
        annualChargesInr,
        tuitionMonthlyInr,
        labActivityMonthlyInr,
        transportOptionalMonthlyInr,
        defaultPaymentPlan: planRaw ? parsePlanText(planRaw) : 'Quarterly',
        notes: notesRaw,
      },
      schoolId,
      session,
      updatedBy,
    );

    if (row.totalAnnualRecurringInr === 0 && row.admissionFeeInr === 0) {
      warnings.push(`Row "${row.className}" has ₹0 recurring and admission fee — verify numbers before publishing.`);
    }

    const key = row.className.toLowerCase();
    if (deduped.has(key)) {
      warnings.push(`Duplicate class "${row.className}" found in import; keeping the latest row.`);
    }
    deduped.set(key, row);
  }

  if (deduped.size === 0) {
    warnings.push('No valid class fee rows could be parsed. Check your column headers or download the Rai Plus template.');
  }

  return {
    rows: sortFeeStructureRows(Array.from(deduped.values())),
    warnings,
    skippedLines,
    detectedFormat,
  };
}

function escapeCsvCell(value: string | number | undefined): string {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildFeeStructureCsvTemplate(rows: SchoolFeeStructureRow[]): string {
  const headers = [
    'Class',
    'Admission Fee (INR)',
    'Annual Charges (INR)',
    'Monthly Tuition (INR)',
    'Monthly Lab/Activity (INR)',
    'Optional Transport (INR)',
    'Total Monthly (INR)',
    'Total Annual Recurring (INR)',
    'Default Payment Plan',
    'Notes',
  ];

  const source =
    rows.length > 0
      ? sortFeeStructureRows(rows)
      : DEFAULT_FALLBACK_STRUCTURE.map((r) =>
          buildFeeStructureRow(
            { ...r, defaultPaymentPlan: 'Quarterly', notes: '' },
            'template',
            '2026-27',
            'Principal',
          ),
        );

  const body = source.map((row) =>
    [
      row.className,
      row.admissionFeeInr,
      row.annualChargesInr,
      row.tuitionMonthlyInr,
      row.labActivityMonthlyInr,
      row.transportOptionalMonthlyInr,
      row.totalMonthlyInr,
      row.totalAnnualRecurringInr,
      row.defaultPaymentPlan,
      row.notes || '',
    ]
      .map(escapeCsvCell)
      .join(','),
  );

  return [headers.map(escapeCsvCell).join(','), ...body].join('\n');
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INR_FMT = new Intl.NumberFormat('en-IN');

function fmtInr(n: number): string {
  return `&#8377;${INR_FMT.format(Math.round(n || 0))}`;
}

export function buildPrintableFeeStructureHtml(
  rows: SchoolFeeStructureRow[],
  school: School,
): string {
  const sorted = sortFeeStructureRows(rows);
  const lastUpdated = sorted[0]?.updatedAt ? sorted[0].updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const approvedBy = sorted[0]?.updatedBy || 'Principal Office';

  const tableRowsHtml = sorted
    .map(
      (r) => `
      <tr>
        <td class="cls">${escapeHtml(r.className)}</td>
        <td class="num">${fmtInr(r.admissionFeeInr)}</td>
        <td class="num">${fmtInr(r.annualChargesInr)}</td>
        <td class="num">${fmtInr(r.tuitionMonthlyInr)}</td>
        <td class="num">${fmtInr(r.labActivityMonthlyInr)}</td>
        <td class="num bold">${fmtInr(r.totalMonthlyInr)}</td>
        <td class="num bold accent">${fmtInr(r.totalAnnualRecurringInr)}</td>
        <td class="num">${fmtInr(r.quarterlyInstallmentInr)}</td>
        <td class="num">${fmtInr(r.transportOptionalMonthlyInr)}</td>
        <td>${escapeHtml(r.defaultPaymentPlan)}</td>
      </tr>
    `,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Official School Fee Structure - ${escapeHtml(school.name)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #142B46;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .sheet {
      border: 2px solid #142B46;
      border-radius: 10px;
      overflow: hidden;
    }
    .banner {
      background: #142B46;
      color: #FAF4EC;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #D6B66D;
    }
    .banner h1 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0.02em;
    }
    .banner p {
      margin: 4px 0 0;
      font-size: 12px;
      color: #F3E6D8;
    }
    .badge {
      background: #D6B66D;
      color: #142B46;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 6px 12px;
      border-radius: 6px;
    }
    .meta {
      background: #FAF4EC;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #334155;
      border-bottom: 1px solid #E5D7C3;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    th {
      background: #F3E6D8;
      color: #142B46;
      text-align: left;
      padding: 9px 10px;
      font-weight: 700;
      border-bottom: 2px solid #142B46;
      white-space: nowrap;
    }
    th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2E8F0;
    }
    tr:nth-child(even) td { background: #FDFBF7; }
    td.cls { font-weight: 700; color: #142B46; }
    td.bold { font-weight: 700; }
    td.accent { color: #142B46; background: #FAF4EC; }
    .footer {
      padding: 16px 24px 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #475569;
    }
    .notes {
      max-width: 65%;
      line-height: 1.5;
    }
    .sign {
      text-align: right;
    }
    .sign-line {
      width: 180px;
      border-top: 1.5px solid #142B46;
      margin-bottom: 4px;
      margin-left: auto;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="banner">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="/assets/aistudio/Beige_and_Orange_Minimal_Design_Studio_Logo_846b232a.png" alt="Rai Plus Logo" style="width:46px;height:46px;border-radius:8px;border:1.5px solid #D6B66D;object-fit:cover;background:#F3E6D8;" />
        <div>
          <h1>${escapeHtml(school.name)}</h1>
          <p>${escapeHtml(school.city)} &middot; ${escapeHtml(school.board)} &middot; Official Fee Structure (Session ${escapeHtml(school.session)})</p>
        </div>
      </div>
      <div class="badge">Rai Plus Official Tariff</div>
    </div>
    <div class="meta">
      <div><strong>Published By:</strong> ${escapeHtml(approvedBy)}</div>
      <div><strong>Effective Date:</strong> ${escapeHtml(lastUpdated)}</div>
      <div><strong>Classes Covered:</strong> ${sorted.length}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Class</th>
          <th class="num">Admission (One-Time)</th>
          <th class="num">Annual Charges</th>
          <th class="num">Monthly Tuition</th>
          <th class="num">Lab / Activity (Mo.)</th>
          <th class="num">Total Monthly</th>
          <th class="num">Annual Recurring</th>
          <th class="num">Quarterly Plan</th>
          <th class="num">Transport (Opt./Mo.)</th>
          <th>Default Plan</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>
    <div class="footer">
      <div class="notes">
        <strong>Payment Terms:</strong> Annual Recurring = (Total Monthly &times; 12) + Annual Charges. One-time Admission Fee applies to new admissions only. Optional Transport Fee is billed separately by route. Families may opt for Monthly, Quarterly, Half-Yearly, or Yearly payment schedules with automated receipt &amp; reminder tracking on Rai Plus.
      </div>
      <div class="sign">
        <div class="sign-line"></div>
        <strong>Principal / Authorised Signatory</strong><br/>
        ${escapeHtml(school.name)}
      </div>
    </div>
  </div>
</body>
</html>`;
}
