import type {
  AccountingEntry,
  AccountingEntryCategory,
  StaffProfile,
  StaffRoleCategory,
} from '../types';

export interface ParsedVisSalaryStaffRow {
  srNo: number;
  name: string;
  normalizedKey: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  bankNote?: string;
  designation: string;
  department: string;
  roleType: StaffRoleCategory;
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  pfOrDeductionInr: number;
}

export interface ParsedVisSalarySheetResult {
  staffRows: ParsedVisSalaryStaffRow[];
  duplicatesRemoved: Array<{ srNo: number; name: string; bankAccountNumber: string }>;
  missingBankNames: string[];
  ifscWarnings: Array<{ name: string; rawIfsc: string; normalizedIfsc: string }>;
}

export interface ParsedVisExpenseMonthSummary {
  monthName: string;
  monthKey: string; // e.g., '2026-04'
  entryCount: number;
  incomeInr: number;
  expenseInr: number;
  netBalanceInr: number;
  sheetDebitTotalInr?: number;
  sheetCreditTotalInr?: number;
}

export interface ParsedVisExpenseSheetResult {
  entries: AccountingEntry[];
  monthSummaries: ParsedVisExpenseMonthSummary[];
  totalIncomeInr: number;
  totalExpenseInr: number;
}

export function parseCsvLine(line: string): string[] {
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

export function parseSheetAmount(raw?: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹,\s"]/g, '').replace(/^rs\.?/i, '');
  if (!cleaned || cleaned === '-') return 0;
  const val = Number(cleaned);
  return Number.isFinite(val) ? Math.round(val) : 0;
}

export function toTitleCaseName(raw: string): string {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  if (!collapsed) return '';
  return collapsed
    .split(' ')
    .map((word) => {
      // Preserve parenthetical class hints like (LKG), (UKG)
      if (/^\([A-Za-z0-9-]+\)$/.test(word)) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function inferBankNameFromIfsc(rawIfsc?: string): string {
  const code = (rawIfsc || '').trim().toUpperCase();
  if (!code) return 'Bank Details Pending';
  if (code.startsWith('PUNB0HGB') || code.startsWith('PUNBOHGB')) {
    return 'Sarva Haryana Gramin Bank';
  }
  if (code.startsWith('PUNB')) return 'Punjab National Bank';
  if (code.startsWith('HDFC')) return 'HDFC Bank';
  if (code.startsWith('UBIN')) return 'Union Bank of India';
  if (code.startsWith('CNRB')) return 'Canara Bank';
  if (code.startsWith('IDIB')) return 'Indian Bank';
  if (code.startsWith('SBIN')) return 'State Bank of India';
  if (code.startsWith('ICIC')) return 'ICICI Bank';
  if (code.startsWith('AXIS')) return 'Axis Bank';
  if (code.startsWith('BARB')) return 'Bank of Baroda';
  return `Bank (${code.slice(0, 4)})`;
}

export function normalizeIfscCode(rawIfsc?: string): {
  code: string;
  warning?: string;
} {
  const cleaned = (rawIfsc || '').trim().replace(/\s+/g, '').toUpperCase();
  if (!cleaned) return { code: '' };
  // Standard Indian IFSC has '0' (zero) as the 5th character; spreadsheets often have letter 'O'
  if (cleaned.length === 11 && cleaned[4] === 'O') {
    const fixed = `${cleaned.slice(0, 4)}0${cleaned.slice(5)}`;
    return {
      code: fixed,
      warning: `IFSC auto-corrected from ${cleaned} to ${fixed} (5th character 0)`,
    };
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleaned)) {
    return {
      code: cleaned,
      warning: `Verify IFSC format (${cleaned})`,
    };
  }
  return { code: cleaned };
}

function inferVisStaffRoleAndDefaults(name: string, index: number): {
  designation: string;
  department: string;
  roleType: StaffRoleCategory;
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  pfOrDeductionInr: number;
} {
  const upper = name.toUpperCase();
  if (upper.includes('(LKG)') || upper.includes('LKG')) {
    return {
      designation: 'Pre-Primary Teacher (LKG)',
      department: 'Foundational Wing',
      roleType: 'Teacher',
      baseMonthlySalaryInr: 7500,
      fixedAllowanceInr: 500,
      pfOrDeductionInr: 0,
    };
  }
  if (upper === 'YATISH KUMAR') {
    return {
      designation: 'Senior Faculty & Academic Lead',
      department: 'Senior Wing',
      roleType: 'Teacher',
      baseMonthlySalaryInr: 14000,
      fixedAllowanceInr: 1000,
      pfOrDeductionInr: 0,
    };
  }
  if (upper === 'RAKESH RATHI') {
    return {
      designation: 'Senior Mathematics & Science Teacher',
      department: 'Senior Wing',
      roleType: 'Teacher',
      baseMonthlySalaryInr: 12000,
      fixedAllowanceInr: 1000,
      pfOrDeductionInr: 0,
    };
  }
  if (upper === 'VIVEK') {
    return {
      designation: 'Computer & Operations Faculty',
      department: 'Middle Wing',
      roleType: 'Teacher',
      baseMonthlySalaryInr: 10000,
      fixedAllowanceInr: 500,
      pfOrDeductionInr: 0,
    };
  }
  if (upper === 'JYOTSANA') {
    return {
      designation: 'Primary & Middle Faculty',
      department: 'Primary Wing',
      roleType: 'Teacher',
      baseMonthlySalaryInr: 9000,
      fixedAllowanceInr: 0,
      pfOrDeductionInr: 0,
    };
  }
  const base = index < 10 ? 8500 : index < 24 ? 7000 : 6500;
  return {
    designation: 'Teaching Faculty',
    department: index < 15 ? 'Primary & Middle Wing' : 'Foundational & Primary Wing',
    roleType: 'Teacher',
    baseMonthlySalaryInr: base,
    fixedAllowanceInr: 500,
    pfOrDeductionInr: 0,
  };
}

/**
 * Parses Virat International School staff bank account & salary CSV sheets.
 * Supports both the official 4-column VIS bank sheet (`Sr.No., NAME, ACCOUNT NO., IFSC CODE`)
 * and extended CSV sheets that also include Designation, Department, Basic Salary, Allowance, Deductions.
 */
export function parseVisSalarySheetCsv(csvRaw: string): ParsedVisSalarySheetResult {
  const lines = (csvRaw || '')
    .split(/\r\n|\r|\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0);

  let headerIdx = -1;
  let colName = 1;
  let colSr = 0;
  let colAcc = 2;
  let colIfsc = 3;
  let colDesignation = -1;
  let colDepartment = -1;
  let colBaseSalary = -1;
  let colAllowance = -1;
  let colDeduction = -1;

  for (let i = 0; i < Math.min(lines.length, 20); i += 1) {
    const cells = parseCsvLine(lines[i]).map((c) => c.toLowerCase());
    const nameIdx = cells.findIndex((c) => c === 'name' || c === 'staff name' || c === 'employee name');
    if (nameIdx >= 0) {
      headerIdx = i;
      colName = nameIdx;
      colSr = cells.findIndex((c) => c.includes('sr') || c === 's.no' || c === 'sno');
      colAcc = cells.findIndex((c) => c.includes('account') || c.includes('a/c'));
      colIfsc = cells.findIndex((c) => c.includes('ifsc'));
      colDesignation = cells.findIndex((c) => c.includes('designation') || c.includes('role'));
      colDepartment = cells.findIndex((c) => c.includes('department') || c.includes('dept'));
      colBaseSalary = cells.findIndex(
        (c) => c.includes('basic') || c.includes('salary') || c.includes('gross'),
      );
      colAllowance = cells.findIndex((c) => c.includes('allowance'));
      colDeduction = cells.findIndex((c) => c.includes('deduction') || c.includes('pf'));
      break;
    }
  }

  const startIdx = headerIdx >= 0 ? headerIdx + 1 : 0;
  const staffRows: ParsedVisSalaryStaffRow[] = [];
  const duplicatesRemoved: Array<{ srNo: number; name: string; bankAccountNumber: string }> = [];
  const missingBankNames: string[] = [];
  const ifscWarnings: Array<{ name: string; rawIfsc: string; normalizedIfsc: string }> = [];
  const seenKeys = new Set<string>();

  let runningSr = 1;

  for (let i = startIdx; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    const rawName = (cells[colName] || '').trim();
    if (!rawName) continue;
    if (/^(virat international|kapriwas|ph\.|accounts details|sr\.?no)/i.test(rawName)) {
      continue;
    }

    const displayName = toTitleCaseName(rawName);
    const parsedSr = colSr >= 0 ? Number(cells[colSr]) : NaN;
    const srNo = Number.isFinite(parsedSr) && parsedSr > 0 ? Math.round(parsedSr) : runningSr;
    runningSr = Math.max(runningSr + 1, srNo + 1);

    const rawAcc = colAcc >= 0 ? (cells[colAcc] || '').replace(/\s+/g, '') : '';
    const rawIfsc = colIfsc >= 0 ? (cells[colIfsc] || '').trim() : '';
    const ifscCheck = normalizeIfscCode(rawIfsc);
    const bankName = inferBankNameFromIfsc(ifscCheck.code);

    const dedupeKey = `${displayName.toLowerCase()}::${rawAcc}`;
    if (seenKeys.has(dedupeKey)) {
      duplicatesRemoved.push({ srNo, name: displayName, bankAccountNumber: rawAcc });
      continue;
    }
    seenKeys.add(dedupeKey);

    if (!rawAcc || !ifscCheck.code) {
      missingBankNames.push(displayName);
    } else if (ifscCheck.warning) {
      ifscWarnings.push({
        name: displayName,
        rawIfsc,
        normalizedIfsc: ifscCheck.code,
      });
    }

    const defaults = inferVisStaffRoleAndDefaults(displayName, staffRows.length);
    const parsedBase = colBaseSalary >= 0 ? parseSheetAmount(cells[colBaseSalary]) : 0;
    const parsedAllowance = colAllowance >= 0 ? parseSheetAmount(cells[colAllowance]) : -1;
    const parsedDeduction = colDeduction >= 0 ? parseSheetAmount(cells[colDeduction]) : -1;

    staffRows.push({
      srNo,
      name: displayName,
      normalizedKey: displayName.toLowerCase(),
      bankAccountNumber: rawAcc,
      ifscCode: ifscCheck.code,
      bankName,
      bankNote: !rawAcc || !ifscCheck.code ? 'Bank account / IFSC pending' : ifscCheck.warning,
      designation:
        (colDesignation >= 0 && cells[colDesignation]?.trim()) || defaults.designation,
      department: (colDepartment >= 0 && cells[colDepartment]?.trim()) || defaults.department,
      roleType: defaults.roleType,
      baseMonthlySalaryInr: parsedBase > 0 ? parsedBase : defaults.baseMonthlySalaryInr,
      fixedAllowanceInr: parsedAllowance >= 0 ? parsedAllowance : defaults.fixedAllowanceInr,
      pfOrDeductionInr: parsedDeduction >= 0 ? parsedDeduction : defaults.pfOrDeductionInr,
    });
  }

  return {
    staffRows,
    duplicatesRemoved,
    missingBankNames,
    ifscWarnings,
  };
}

export function buildVisStaffProfilesFromParsed(
  parsed: ParsedVisSalarySheetResult,
  schoolId = 'school-vis-jjr',
): StaffProfile[] {
  return parsed.staffRows.map((row, idx) => ({
    id: `stf-${schoolId}-vis-${String(idx + 1).padStart(2, '0')}`,
    schoolId,
    srNo: row.srNo,
    employeeCode: `VIS-STF-${String(idx + 1).padStart(3, '0')}`,
    name: row.name,
    roleType: row.roleType,
    designation: row.designation,
    department: row.department,
    bankAccountNumber: row.bankAccountNumber || undefined,
    ifscCode: row.ifscCode || undefined,
    bankName: row.bankName,
    bankNote: row.bankNote,
    sheetSource: 'vis_salary_2026_27',
    baseMonthlySalaryInr: row.baseMonthlySalaryInr,
    fixedAllowanceInr: row.fixedAllowanceInr,
    pfOrDeductionInr: row.pfOrDeductionInr,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    active: true,
  }));
}

const SESSION_2026_27_MONTHS: Record<string, { monthKey: string; label: string }> = {
  APRIL: { monthKey: '2026-04', label: 'April 2026' },
  MAY: { monthKey: '2026-05', label: 'May 2026' },
  JUNE: { monthKey: '2026-06', label: 'June 2026' },
  JULY: { monthKey: '2026-07', label: 'July 2026' },
  AUGUST: { monthKey: '2026-08', label: 'August 2026' },
  SEPTEMBER: { monthKey: '2026-09', label: 'September 2026' },
  OCTOBER: { monthKey: '2026-10', label: 'October 2026' },
  NOVEMBER: { monthKey: '2026-11', label: 'November 2026' },
  DECEMBER: { monthKey: '2026-12', label: 'December 2026' },
  JANUARY: { monthKey: '2027-01', label: 'January 2027' },
  FEBRUARY: { monthKey: '2027-02', label: 'February 2027' },
  MARCH: { monthKey: '2027-03', label: 'March 2027' },
};

function classifyExpenseLedgerMeta(rawText: string, direction: 'Income' | 'Expense'): {
  category: AccountingEntryCategory;
  paymentMode: AccountingEntry['paymentMode'];
  vendorOrParty: string;
} {
  const upper = rawText.toUpperCase();

  if (direction === 'Income') {
    if (upper.includes('TRIP')) {
      return {
        category: 'Misc Receipt',
        paymentMode: 'Bank Transfer',
        vendorOrParty: 'Student Trip Fee Collection (Bank A/C)',
      };
    }
    return {
      category: 'Fee Collection',
      paymentMode: 'Bank Transfer',
      vendorOrParty: 'VIS Student Fee Collection',
    };
  }

  let paymentMode: AccountingEntry['paymentMode'] = 'Bank Transfer';
  if (/CHEQUE|CHAQUE|CHQ/i.test(upper)) {
    paymentMode = 'Cheque';
  } else if (upper === 'EXPENSE' || upper.startsWith('DAILY CAMPUS EXPENSE') || upper.includes('INCLUDE DRIVER SALARY')) {
    paymentMode = 'Cash';
  }

  if (upper.includes('STAFF SALARY') || upper.includes('HOLD SALARY')) {
    return {
      category: 'Teacher Payroll',
      paymentMode: 'Bank Transfer',
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (upper.includes('DRIVER SALARY')) {
    return {
      category: 'Driver Payroll',
      paymentMode: 'Cash',
      vendorOrParty: 'Driver & Campus Cash Expense',
    };
  }
  if (upper.includes('FUEL')) {
    return {
      category: 'Bus Fuel Expense',
      paymentMode: upper.includes('A/C') ? 'Bank Transfer' : 'Bank Transfer',
      vendorOrParty: 'OM Fuel Station',
    };
  }
  if (upper.includes('KIST') || upper.includes('INSTALLMENT')) {
    return {
      category: 'Bus EMI / Kist',
      paymentMode: /CHEQUE|CHQ/i.test(upper) ? 'Cheque' : 'Bank Transfer',
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (upper.includes('NEW BUS ADVANCE') || upper.includes('PROJECTOR') || upper.includes('URBAN PAINTS')) {
    return {
      category: 'Infrastructure & Assets',
      paymentMode,
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (upper.includes('BUS SERVICE') || upper.includes('TIRUPATI MOTORS') || upper.includes('ACM PAYMENT')) {
    return {
      category: 'Maintenance Expense',
      paymentMode,
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (upper.includes('INSURANCE') || upper.includes('INS.') || upper.includes('CBSE BOARD')) {
    return {
      category: 'Insurance & Compliance',
      paymentMode,
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (upper.includes('RENT')) {
    return {
      category: 'School Rent',
      paymentMode: 'Bank Transfer',
      vendorOrParty: 'School Campus Rent',
    };
  }
  if (upper.includes('UOLO') || upper.includes('SOFTWARE')) {
    return {
      category: 'Software & IT',
      paymentMode: /CHEQUE|CHAQUE/i.test(upper) ? 'Cheque' : 'Bank Transfer',
      vendorOrParty: 'UOLO EdTech Software',
    };
  }
  if (upper.includes('ELECTRICITY')) {
    return {
      category: 'Utility & Operations',
      paymentMode: 'Bank Transfer',
      vendorOrParty: 'Electricity Board Bill',
    };
  }
  if (
    upper.includes('FLEX') ||
    upper.includes('PUBLICATION') ||
    upper.includes('REPORT CARD')
  ) {
    return {
      category: 'Vendor Purchase',
      paymentMode,
      vendorOrParty: toTitleCaseName(rawText),
    };
  }
  if (
    upper.includes('TRANSFER') ||
    upper.includes('TRNSFER') ||
    upper.includes('SIR A/C') ||
    upper.includes('SIR A\\C') ||
    upper.includes('MAM A/C') ||
    upper.includes('DEEPAK SIR') ||
    upper.includes('FEES IN INDIAN BANK')
  ) {
    return {
      category: 'Bank Transfer & Advances',
      paymentMode: 'Bank Transfer',
      vendorOrParty: toTitleCaseName(rawText.replace(/A\\C/gi, 'A/C')),
    };
  }

  return {
    category: 'Utility & Operations',
    paymentMode,
    vendorOrParty: toTitleCaseName(rawText),
  };
}

function resolveDayForRow(dateRangeText: string, ordinalInMonth: number): string {
  const clean = dateRangeText.trim().toUpperCase();
  if (clean === '1 TO 10') return '10';
  if (clean === '11 TO 20') return '20';
  if (clean === '21 TO 30') return '28';
  const exactDay = /^(\d{1,2})$/.exec(clean);
  if (exactDay) {
    const d = Math.min(28, Math.max(1, Number(exactDay[1])));
    return String(d).padStart(2, '0');
  }
  const d = Math.min(28, Math.max(2, 2 + ordinalInMonth));
  return String(d).padStart(2, '0');
}

/**
 * Parses Virat International School's 2026-27 Monthly Income & Expense Sheet CSV
 * (`MONTH,DATE,DESCRIPTION,PIAD BY CHEQUE,DEBIT,CREDIT,BALANCE,[REMARKS]`).
 * Accurately merges continuation lines, excludes monthly subtotal rows from double-counting,
 * and maps every debit & credit line to an AccountingEntry.
 */
export function parseVisExpenseSheetCsv(
  csvRaw: string,
  schoolId = 'school-vis-jjr',
  sheetSource: AccountingEntry['sheetSource'] = 'vis_expense_2026_27',
): ParsedVisExpenseSheetResult {
  const lines = (csvRaw || '').split(/\r\n|\r|\n/);

  const entries: AccountingEntry[] = [];
  const monthSummaryMap = new Map<string, ParsedVisExpenseMonthSummary>();

  let currentMonthName = '';
  let currentMonthKey = '';
  let monthRowCounter = 0;
  let pendingContinuationLabel = '';
  let generalExpenseSeq = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
    if (!rawLine || !rawLine.trim()) continue;
    const cols = parseCsvLine(rawLine);

    const cMonth = (cols[0] || '').trim().toUpperCase();
    const cDate = (cols[1] || '').trim();
    const cDesc = (cols[2] || '').trim();
    const cChequeLabel = (cols[3] || '').trim();
    const cDebitRaw = (cols[4] || '').trim();
    const cCreditRaw = (cols[5] || '').trim();
    const cBalanceRaw = (cols[6] || '').trim();
    const cNote = (cols[7] || '').trim();

    // Skip repeated column header lines
    if (cMonth === 'MONTH' && cDesc.toUpperCase() === 'DESCRIPTION') {
      pendingContinuationLabel = '';
      continue;
    }

    // Detect start of a new month section
    if (cMonth && SESSION_2026_27_MONTHS[cMonth]) {
      const mInfo = SESSION_2026_27_MONTHS[cMonth];
      currentMonthName = mInfo.label;
      currentMonthKey = mInfo.monthKey;
      monthRowCounter = 0;
      pendingContinuationLabel = '';
      generalExpenseSeq = 0;
      if (!monthSummaryMap.has(currentMonthKey)) {
        monthSummaryMap.set(currentMonthKey, {
          monthName: mInfo.label,
          monthKey: currentMonthKey,
          entryCount: 0,
          incomeInr: 0,
          expenseInr: 0,
          netBalanceInr: 0,
        });
      }
    }

    if (!currentMonthKey) continue;

    const debitAmt = parseSheetAmount(cDebitRaw);
    const creditAmt = parseSheetAmount(cCreditRaw);
    const hasBalanceCol = Boolean(cBalanceRaw && parseSheetAmount(cBalanceRaw) !== 0);

    // Detect monthly summary total row (empty date/description/label, both debit & credit or balance populated)
    if (!cDate && !cDesc && !cChequeLabel && ((debitAmt > 0 && creditAmt > 0) || hasBalanceCol)) {
      const mSum = monthSummaryMap.get(currentMonthKey);
      if (mSum) {
        mSum.sheetDebitTotalInr = debitAmt;
        mSum.sheetCreditTotalInr = creditAmt;
      }
      pendingContinuationLabel = '';
      continue;
    }

    // Handle multi-line continuation descriptions where label is on one row and amount on the next
    // e.g. line 16: `,,,TRANSFER SOURAV SIR A/C ,,,,` followed by line 17: `,,,(PROJECTOR ),"  100,000.00 ",,,`
    if (debitAmt === 0 && creditAmt === 0) {
      if (cChequeLabel) {
        pendingContinuationLabel = pendingContinuationLabel
          ? `${pendingContinuationLabel} ${cChequeLabel}`
          : cChequeLabel;
      }
      continue;
    }

    const direction: 'Income' | 'Expense' = creditAmt > 0 && debitAmt === 0 ? 'Income' : 'Expense';
    const amountInr = direction === 'Income' ? creditAmt : debitAmt;
    if (amountInr <= 0) continue;

    monthRowCounter += 1;
    let labelText = '';
    if (pendingContinuationLabel) {
      labelText = [pendingContinuationLabel, cChequeLabel || cDesc].filter(Boolean).join(' ').trim();
      pendingContinuationLabel = '';
    } else if (cChequeLabel && cDesc) {
      labelText = `${cDesc} — ${cChequeLabel}`;
    } else if (cChequeLabel) {
      labelText = cChequeLabel;
    } else if (cDesc) {
      if (cDesc.toUpperCase() === 'FEES' && cDate) {
        labelText = `Fees Collection (${cDate})`;
      } else if (cDesc.toUpperCase() === 'EXPENSE') {
        generalExpenseSeq += 1;
        labelText = `Daily Campus Expense (Batch ${generalExpenseSeq})`;
      } else {
        labelText = cDesc;
      }
    } else {
      generalExpenseSeq += 1;
      labelText = `Daily Campus Cash Expense (Batch ${generalExpenseSeq})`;
    }

    const meta = classifyExpenseLedgerMeta(labelText, direction);
    const dayStr = resolveDayForRow(cDate, monthRowCounter);
    const isoDate = `${currentMonthKey}-${dayStr}`;

    const chqMatch = /CHQ\s*NO[:\-\s]*([A-Z0-9]+)/i.exec(cNote);
    const chequeOrRefNo = chqMatch ? `CHQ-${chqMatch[1]}` : undefined;
    const descriptionParts = [
      `${currentMonthName}: ${labelText.replace(/A\\C/gi, 'A/C')}`,
      cDate ? `Period: ${cDate}` : '',
      cNote ? `Note: ${cNote}` : '',
    ].filter(Boolean);

    const isHistoricalClosed = currentMonthKey < '2026-11';

    const entry: AccountingEntry = {
      id: `vis-exp-${currentMonthKey}-${String(monthRowCounter).padStart(2, '0')}`,
      schoolId,
      date: isoDate,
      monthKey: currentMonthKey,
      category: meta.category,
      direction,
      vendorOrParty: meta.vendorOrParty,
      description: descriptionParts.join(' · '),
      amountInr,
      paymentMode: meta.paymentMode,
      chequeOrRefNo,
      supportingDocName: 'EXPENSE_2026-27_VIS.csv',
      sheetSource,
      status: isHistoricalClosed ? 'approved' : 'submitted',
      periodLocked: false,
      createdBy: 'VIS Accounts Office',
      createdByRole: 'accountant',
      createdAt: `${isoDate}T10:00:00.000Z`,
      ...(isHistoricalClosed
        ? {
            approvedBy: 'Dr. Deepak Dhawan',
            approvedAt: `${isoDate}T16:00:00.000Z`,
          }
        : {}),
    };

    entries.push(entry);

    const mSum = monthSummaryMap.get(currentMonthKey);
    if (mSum) {
      mSum.entryCount += 1;
      if (direction === 'Income') mSum.incomeInr += amountInr;
      else mSum.expenseInr += amountInr;
      mSum.netBalanceInr = mSum.incomeInr - mSum.expenseInr;
    }
  }

  // Sort newest month first so active November 2026 appears at top of ledger
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const monthSummaries = Array.from(monthSummaryMap.values());
  const totalIncomeInr = monthSummaries.reduce((sum, m) => sum + m.incomeInr, 0);
  const totalExpenseInr = monthSummaries.reduce((sum, m) => sum + m.expenseInr, 0);

  return {
    entries,
    monthSummaries,
    totalIncomeInr,
    totalExpenseInr,
  };
}
