import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ClipboardPaste,
  Copy,
  Download,
  FileSpreadsheet,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import type { PayrollRegisterEntry, UserAccount } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  applyBulkSalaryAdjustment,
  computeNetPayable,
  parseBulkPayrollPaste,
  summarizePayrollSheet,
  type BulkAdjustmentMode,
  type EditablePayrollRow,
  type StaffCategoryFilter,
} from '../utils/bulkPayrollEngine';

interface BulkPayrollSheetPanelProps {
  data: WorkspaceData;
  user: UserAccount;
  token: string;
  isManagementApprover: boolean;
  onRefresh: () => Promise<void>;
}

interface StaffRosterResponseItem {
  staffName: string;
  staffRoleType: 'Teacher' | 'Driver' | 'Support Staff';
  designation: string;
  daysWorked: number;
  grossSalaryInr: number;
  deductionsInr: number;
  source: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function computeNextMonthLabel(currentLabel: string): string {
  const parts = currentLabel.trim().split(/\s+/);
  const mIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === (parts[0] || '').toLowerCase());
  const yr = Number(parts[1]) || 2026;
  if (mIdx < 0) return 'December 2026';
  const nextIdx = (mIdx + 1) % 12;
  const nextYr = mIdx === 11 ? yr + 1 : yr;
  return `${MONTH_NAMES[nextIdx]} ${nextYr}`;
}

function toEditableRows(entries: PayrollRegisterEntry[], monthLabel: string): EditablePayrollRow[] {
  return entries
    .filter((p) => p.monthLabel.trim().toLowerCase() === monthLabel.trim().toLowerCase())
    .map((p) => ({
      rowKey: p.id,
      id: p.id,
      monthLabel: p.monthLabel,
      staffName: p.staffName,
      staffRoleType: p.staffRoleType,
      designation: p.designation,
      daysWorked: p.daysWorked,
      grossSalaryInr: p.grossSalaryInr,
      deductionsInr: p.deductionsInr,
      netPayableInr: computeNetPayable(p.grossSalaryInr, p.deductionsInr),
      status: p.status,
      preparedBy: p.preparedBy,
      approvedBy: p.approvedBy,
      dirty: false,
    }));
}

export const BulkPayrollSheetPanel: React.FC<BulkPayrollSheetPanelProps> = ({
  data,
  token,
  isManagementApprover,
  onRefresh,
}) => {
  const payrolls = data.payrollRegisters || [];

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const p of payrolls) {
      if (p.monthLabel?.trim()) set.add(p.monthLabel.trim());
    }
    if (set.size === 0) set.add('November 2026');
    return Array.from(set);
  }, [payrolls]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || 'November 2026');
  const [customMonthDraft, setCustomMonthDraft] = useState<string>('');
  const [showNewMonthInput, setShowNewMonthInput] = useState<boolean>(false);

  const [rows, setRows] = useState<EditablePayrollRow[]>(() =>
    toEditableRows(payrolls, availableMonths[0] || 'November 2026'),
  );
  const [categoryFilter, setCategoryFilter] = useState<StaffCategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mass adjustment toolbar
  const [adjCategory, setAdjCategory] = useState<StaffCategoryFilter>('All');
  const [adjMode, setAdjMode] = useState<BulkAdjustmentMode>('percent_gross');
  const [adjValue, setAdjValue] = useState<string>('5');

  // Paste / CSV import drawer
  const [showImportDrawer, setShowImportDrawer] = useState<boolean>(false);
  const [pasteText, setPasteText] = useState<string>('');
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Action feedback
  const [busy, setBusy] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync grid when server payrolls or selectedMonth change
  useEffect(() => {
    setRows(toEditableRows(payrolls, selectedMonth));
  }, [payrolls, selectedMonth]);

  const clearAlerts = () => {
    setFeedback(null);
    setErrorMsg(null);
  };

  const summary = useMemo(() => summarizePayrollSheet(rows), [rows]);

  const visibleRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (categoryFilter !== 'All' && r.staffRoleType !== categoryFilter) return false;
      if (q) {
        const hay = `${r.staffName} ${r.designation} ${r.staffRoleType}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, categoryFilter, searchQuery]);

  const updateRowField = (
    rowKey: string,
    patch: Partial<
      Pick<
        EditablePayrollRow,
        'staffName' | 'staffRoleType' | 'designation' | 'daysWorked' | 'grossSalaryInr' | 'deductionsInr'
      >
    >,
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.rowKey !== rowKey) return row;
        if (row.status === 'approved' && !isManagementApprover) return row;
        const nextGross =
          patch.grossSalaryInr !== undefined ? Math.max(0, Math.round(patch.grossSalaryInr)) : row.grossSalaryInr;
        const nextDed =
          patch.deductionsInr !== undefined ? Math.max(0, Math.round(patch.deductionsInr)) : row.deductionsInr;
        const nextDays =
          patch.daysWorked !== undefined ? Math.min(31, Math.max(0, Math.round(patch.daysWorked))) : row.daysWorked;
        return {
          ...row,
          ...patch,
          daysWorked: nextDays,
          grossSalaryInr: nextGross,
          deductionsInr: nextDed,
          netPayableInr: computeNetPayable(nextGross, nextDed),
          dirty: true,
        };
      }),
    );
  };

  const handleAddEmptyRow = () => {
    clearAlerts();
    const newRow: EditablePayrollRow = {
      rowKey: `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      monthLabel: selectedMonth,
      staffName: '',
      staffRoleType: categoryFilter === 'All' ? 'Teacher' : categoryFilter,
      designation: categoryFilter === 'Driver' ? 'Bus Driver' : 'Teaching Faculty',
      daysWorked: 26,
      grossSalaryInr: categoryFilter === 'Driver' ? 18500 : 30000,
      deductionsInr: 0,
      netPayableInr: categoryFilter === 'Driver' ? 18500 : 30000,
      status: 'new',
      dirty: true,
    };
    setRows((prev) => [newRow, ...prev]);
  };

  const handleRemoveUnsavedRow = (rowKey: string) => {
    setRows((prev) => prev.filter((r) => r.rowKey !== rowKey));
  };

  const handleLoadFullSchoolRoster = async () => {
    clearAlerts();
    setBusy(true);
    try {
      const res = await apiRequest<{ roster: StaffRosterResponseItem[] }>(
        '/api/accounting/staff-roster',
        { method: 'GET' },
        token,
      );
      const roster = res.roster || [];
      let addedCount = 0;

      setRows((prev) => {
        const existingNames = new Set(prev.map((r) => r.staffName.trim().toLowerCase()));
        const additions: EditablePayrollRow[] = [];
        for (const item of roster) {
          const key = item.staffName.trim().toLowerCase();
          if (existingNames.has(key)) continue;
          existingNames.add(key);
          addedCount += 1;
          additions.push({
            rowKey: `roster-${key.replace(/\s+/g, '-')}-${Date.now()}`,
            monthLabel: selectedMonth,
            staffName: item.staffName,
            staffRoleType: item.staffRoleType,
            designation: item.designation,
            daysWorked: item.daysWorked,
            grossSalaryInr: item.grossSalaryInr,
            deductionsInr: item.deductionsInr,
            netPayableInr: computeNetPayable(item.grossSalaryInr, item.deductionsInr),
            status: 'new',
            dirty: true,
          });
        }
        return [...prev, ...additions];
      });

      if (addedCount > 0) {
        setFeedback(
          `Loaded ${addedCount} additional staff member(s) (Teachers, Bus Drivers & Support Staff) into ${selectedMonth}. Review and click "Save All Salaries" once.`,
        );
      } else {
        setFeedback(`All ${roster.length} school staff members are already present in ${selectedMonth}.`);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load school staff roster.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyPreviousMonth = () => {
    clearAlerts();
    const targetMonth = computeNextMonthLabel(selectedMonth);
    const sourceRows = rows.length > 0 ? rows : toEditableRows(payrolls, availableMonths[0] || selectedMonth);
    if (sourceRows.length === 0) {
      setErrorMsg('Load the school staff roster first before copying to the next month.');
      return;
    }

    const cloned: EditablePayrollRow[] = sourceRows.map((r, idx) => ({
      ...r,
      id: undefined,
      rowKey: `clone-${targetMonth}-${idx}-${r.staffName.toLowerCase().replace(/\s+/g, '-')}`,
      monthLabel: targetMonth,
      status: 'new',
      approvedBy: undefined,
      dirty: true,
    }));

    setSelectedMonth(targetMonth);
    // Defer setting cloned rows slightly after month effect sync
    setTimeout(() => {
      setRows((currentInTarget) => {
        const existingNames = new Set(currentInTarget.map((c) => c.staffName.trim().toLowerCase()));
        const merged = [
          ...currentInTarget,
          ...cloned.filter((c) => !existingNames.has(c.staffName.trim().toLowerCase())),
        ];
        return merged;
      });
    }, 0);
    setFeedback(
      `Copied ${sourceRows.length} staff salary lines to ${targetMonth}. Adjust any numbers inline and click "Save All Salaries".`,
    );
  };

  const handleApplyMassAdjustment = () => {
    clearAlerts();
    const val = Number(adjValue);
    if (!Number.isFinite(val)) {
      setErrorMsg('Enter a valid number for mass salary adjustment.');
      return;
    }
    let affected = 0;
    const updated = applyBulkSalaryAdjustment(rows, {
      category: adjCategory,
      mode: adjMode,
      value: val,
      includeApproved: isManagementApprover,
    });
    for (let i = 0; i < rows.length; i += 1) {
      if (
        updated[i].grossSalaryInr !== rows[i].grossSalaryInr ||
        updated[i].deductionsInr !== rows[i].deductionsInr ||
        updated[i].daysWorked !== rows[i].daysWorked
      ) {
        affected += 1;
      }
    }
    setRows(updated);
    if (affected === 0) {
      setErrorMsg('No editable staff rows matched this filter (approved rows require Principal access).');
    } else {
      const modeDesc =
        adjMode === 'percent_gross'
          ? `${val >= 0 ? '+' : ''}${val}% gross salary`
          : adjMode === 'flat_gross'
            ? `${val >= 0 ? '+' : '-'}₹${Math.abs(val).toLocaleString('en-IN')} gross`
            : adjMode === 'set_deductions'
              ? `deductions = ₹${val.toLocaleString('en-IN')}`
              : `days worked = ${val}`;
      setFeedback(
        `Applied ${modeDesc} across ${affected} ${adjCategory === 'All' ? 'staff' : adjCategory.toLowerCase()} row(s). Click "Save All Salaries" to commit.`,
      );
    }
  };

  const handleApplyImport = () => {
    clearAlerts();
    const parsed = parseBulkPayrollPaste(pasteText, selectedMonth);
    setImportWarnings(parsed.warnings);
    if (parsed.rows.length === 0) {
      setErrorMsg('No valid staff salary rows could be parsed from the pasted text.');
      return;
    }

    let updatedExisting = 0;
    let addedNew = 0;

    setRows((prev) => {
      const byName = new Map(prev.map((r) => [r.staffName.trim().toLowerCase(), { ...r }]));
      for (const incoming of parsed.rows) {
        const key = incoming.staffName.trim().toLowerCase();
        const existing = byName.get(key);
        if (existing) {
          if (existing.status === 'approved' && !isManagementApprover) continue;
          byName.set(key, {
            ...existing,
            staffRoleType: incoming.staffRoleType,
            designation: incoming.designation || existing.designation,
            daysWorked: incoming.daysWorked,
            grossSalaryInr: incoming.grossSalaryInr,
            deductionsInr: incoming.deductionsInr,
            netPayableInr: computeNetPayable(incoming.grossSalaryInr, incoming.deductionsInr),
            dirty: true,
          });
          updatedExisting += 1;
        } else {
          byName.set(key, incoming);
          addedNew += 1;
        }
      }
      return Array.from(byName.values());
    });

    setShowImportDrawer(false);
    setPasteText('');
    setFeedback(
      `Imported ${parsed.rows.length} row(s) (${updatedExisting} updated, ${addedNew} new). Click "Save All Salaries" to persist.`,
    );
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setPasteText(content);
      setShowImportDrawer(true);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCsv = () => {
    const headers = [
      'Staff Name',
      'Category',
      'Designation',
      'Days Worked',
      'Gross Salary (INR)',
      'Deductions (INR)',
      'Net Payable (INR)',
      'Status',
    ];
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `"${r.staffName.replace(/"/g, '""')}"`,
          `"${r.staffRoleType}"`,
          `"${r.designation.replace(/"/g, '""')}"`,
          r.daysWorked,
          r.grossSalaryInr,
          r.deductionsInr,
          r.netPayableInr,
          r.status,
        ].join(','),
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rai-plus-payroll-${selectedMonth.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveAllSalaries = async (autoApprove = false) => {
    clearAlerts();
    const validRows = rows.filter((r) => r.staffName.trim() && r.grossSalaryInr > 0);
    if (validRows.length === 0) {
      setErrorMsg('Add or load at least one staff member with a valid Gross Salary before saving.');
      return;
    }

    setBusy(true);
    try {
      const res = await apiRequest<{
        createdCount: number;
        updatedCount: number;
        skippedApprovedCount: number;
      }>(
        '/api/accounting/payroll/bulk',
        {
          method: 'POST',
          body: JSON.stringify({
            monthLabel: selectedMonth,
            submitForApproval: true,
            autoApprove: autoApprove && isManagementApprover,
            rows: validRows.map((r) => ({
              id: r.id,
              staffName: r.staffName.trim(),
              staffRoleType: r.staffRoleType,
              designation: r.designation.trim() || r.staffRoleType,
              daysWorked: r.daysWorked,
              grossSalaryInr: r.grossSalaryInr,
              deductionsInr: r.deductionsInr,
            })),
          }),
        },
        token,
      );

      await onRefresh();
      const parts = [];
      if (res.createdCount > 0) parts.push(`${res.createdCount} added`);
      if (res.updatedCount > 0) parts.push(`${res.updatedCount} updated`);
      if (res.skippedApprovedCount > 0) {
        parts.push(`${res.skippedApprovedCount} already-approved row(s) preserved`);
      }
      setFeedback(
        `Whole-staff payroll saved for ${selectedMonth}: ${parts.join(', ')}.${
          autoApprove && isManagementApprover
            ? ' All salaries approved!'
            : !isManagementApprover
              ? ' Submitted for Principal bulk approval.'
              : ''
        }`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save bulk payroll sheet.');
    } finally {
      setBusy(false);
    }
  };

  const handleApproveAllPending = async () => {
    clearAlerts();
    setBusy(true);
    try {
      const res = await apiRequest<{ approvedCount: number }>(
        '/api/accounting/payroll/approve-all',
        {
          method: 'POST',
          body: JSON.stringify({ monthLabel: selectedMonth }),
        },
        token,
      );
      await onRefresh();
      setFeedback(
        res.approvedCount > 0
          ? `Approved all ${res.approvedCount} pending staff salaries for ${selectedMonth} in one click.`
          : `All saved payroll lines for ${selectedMonth} are already approved.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to approve pending payroll.');
    } finally {
      setBusy(false);
    }
  };

  const handleApproveSingle = async (id: string) => {
    clearAlerts();
    setBusy(true);
    try {
      await apiRequest(`/api/accounting/payroll/${id}/approve`, { method: 'POST' }, token);
      await onRefresh();
      setFeedback('Staff payroll line approved.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Payroll approval blocked.');
    } finally {
      setBusy(false);
    }
  };

  const monthOptions = useMemo(() => {
    const set = new Set(availableMonths);
    set.add(selectedMonth);
    return Array.from(set);
  }, [availableMonths, selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Header & Quick Roster Actions */}
      <div className="rounded-2xl border border-[#142B46]/15 bg-[#FAF4EC] p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#142B46]">
              <FileSpreadsheet className="h-4 w-4 text-[#D6B66D]" />
              Whole-Staff Bulk Salary Sheet
            </div>
            <h3 className="mt-1 font-display text-lg font-bold text-[#142B46]">
              Update All Teachers, Drivers &amp; Staff Salaries Together
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Edit days worked, gross pay, and deductions inline across the entire school, apply
              one-click percentage increments, or paste straight from Excel/CSV.
            </p>
          </div>

          {/* Month Selector & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Salary Month"
              value={selectedMonth}
              onChange={(e) => {
                clearAlerts();
                setSelectedMonth(e.target.value);
              }}
              className="rounded-xl border border-[#142B46]/20 bg-white px-3 py-2 text-xs font-bold text-[#142B46]"
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {showNewMonthInput ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customMonthDraft}
                  onChange={(e) => setCustomMonthDraft(e.target.value)}
                  placeholder="e.g., January 2027"
                  className="w-36 rounded-xl border border-[#142B46]/25 bg-white px-2.5 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customMonthDraft.trim()) {
                      setSelectedMonth(customMonthDraft.trim());
                      setCustomMonthDraft('');
                      setShowNewMonthInput(false);
                    }
                  }}
                  className="rounded-xl bg-[#142B46] px-2.5 py-2 text-xs font-bold text-white"
                >
                  Open
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewMonthInput(true)}
                className="rounded-xl border border-[#142B46]/20 bg-white px-3 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#F3E6D8]"
              >
                + New Month
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={handleLoadFullSchoolRoster}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1e3d63] disabled:opacity-60"
            >
              <Users className="h-3.5 w-3.5 text-[#D6B66D]" />
              Load Full School Staff
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={handleCopyPreviousMonth}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#142B46]/20 bg-white px-3 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#F3E6D8]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy to Next Month
            </button>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#142B46]/10 bg-white px-3.5 py-2.5">
            <div className="text-[11px] font-medium text-slate-500">Staff in Sheet</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-[#142B46]">
              {summary.totalStaff}
              {summary.dirtyCount > 0 && (
                <span className="ml-2 text-[11px] font-semibold text-amber-700">
                  ({summary.dirtyCount} unsaved)
                </span>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[#142B46]/10 bg-white px-3.5 py-2.5">
            <div className="text-[11px] font-medium text-slate-500">Total Gross Salary</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-[#142B46]">
              ₹{summary.totalGrossInr.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-xl border border-[#142B46]/10 bg-white px-3.5 py-2.5">
            <div className="text-[11px] font-medium text-slate-500">Total Deductions</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-rose-700">
              −₹{summary.totalDeductionsInr.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-xl border border-[#6E987A]/30 bg-[#6E987A]/10 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-[#142B46]">Total Net Payable</div>
            <div className="mt-0.5 font-mono text-lg font-bold text-[#142B46]">
              ₹{summary.totalNetInr.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback / Error Banner */}
      {feedback && (
        <div className="flex items-center gap-2 rounded-xl border border-[#6E987A]/40 bg-[#6E987A]/10 px-4 py-2.5 text-xs font-semibold text-[#142B46]">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6E987A]" />
          <span>{feedback}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* 1-Click Mass Adjustment Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B46]">
              <Sparkles className="h-3.5 w-3.5 text-[#D6B66D]" />
              Bulk Adjust:
            </span>
            <select
              aria-label="Mass Adjustment Scope"
              value={adjCategory}
              onChange={(e) => setAdjCategory(e.target.value as StaffCategoryFilter)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="All">All Staff</option>
              <option value="Teacher">Teachers Only</option>
              <option value="Driver">Bus Drivers Only</option>
              <option value="Support Staff">Support Staff Only</option>
            </select>
            <select
              aria-label="Mass Adjustment Mode"
              value={adjMode}
              onChange={(e) => setAdjMode(e.target.value as BulkAdjustmentMode)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800"
            >
              <option value="percent_gross">% Increment / Decrement Gross</option>
              <option value="flat_gross">Flat + / − Gross (₹)</option>
              <option value="set_deductions">Set Uniform Deductions (₹)</option>
              <option value="set_days">Set Uniform Days Worked</option>
            </select>
            <input
              type="number"
              aria-label="Mass Adjustment Value"
              value={adjValue}
              onChange={(e) => setAdjValue(e.target.value)}
              className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs font-bold text-[#142B46]"
            />
            <button
              type="button"
              onClick={handleApplyMassAdjustment}
              className="rounded-lg bg-[#D6B66D] px-3 py-1.5 text-xs font-bold text-[#142B46] hover:bg-[#c8a65a]"
            >
              Apply to Selected Group
            </button>
          </div>

          {/* Import / Export / Add Row Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImportDrawer((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste Excel / CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleCsvFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleAddEmptyRow}
              className="inline-flex items-center gap-1 rounded-lg border border-[#142B46]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#142B46] hover:bg-[#FAF4EC]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </button>
          </div>
        </div>

        {/* Collapsible Excel / CSV Paste Import Box */}
        {showImportDrawer && (
          <div className="mt-4 rounded-xl border border-[#142B46]/20 bg-[#FAF4EC]/70 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-[#142B46]">
                Paste from Excel / Google Sheets or CSV
              </div>
              <div className="text-[11px] text-slate-600">
                Columns: Staff Name, Category (Teacher/Driver/Support Staff), Designation, Days Worked, Gross Salary, Deductions
              </div>
            </div>
            <textarea
              rows={5}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Sunita Sharma, Teacher, PGT Mathematics, 26, 36000, 1800\nSuresh Yadav, Driver, Bus Driver (BUS-02), 26, 19000, 500\nRamesh Kumar, Support Staff, Lab Assistant, 26, 16000, 400`}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800"
            />
            {importWarnings.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
                {importWarnings.join(' · ')}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyImport}
                className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e3d63]"
              >
                Merge Rows into Salary Sheet
              </button>
              <button
                type="button"
                onClick={() => setShowImportDrawer(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet Grid Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Teacher', 'Driver', 'Support Staff'] as StaffCategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#142B46] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-[#FAF4EC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff or designation..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs"
            />
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-[#142B46] text-[11px] font-bold uppercase tracking-wider text-[#FAF4EC]">
              <tr>
                <th className="px-3 py-3">Staff Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Designation / Bus</th>
                <th className="px-3 py-3 w-24 text-center">Days</th>
                <th className="px-3 py-3 w-32 text-right">Gross (₹)</th>
                <th className="px-3 py-3 w-28 text-right">Deductions (₹)</th>
                <th className="px-3 py-3 w-32 text-right">Net Payable</th>
                <th className="px-3 py-3 text-center">Status</th>
                <th className="px-3 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                    No staff rows for <span className="font-bold text-[#142B46]">{selectedMonth}</span> yet.
                    Click <span className="font-bold text-[#142B46]">&ldquo;Load Full School Staff&rdquo;</span> above to populate all teachers, drivers, and staff at once.
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const lockedForUser = row.status === 'approved' && !isManagementApprover;
                  return (
                    <tr
                      key={row.rowKey}
                      className={
                        row.dirty
                          ? 'bg-[#FAF4EC]/75'
                          : row.status === 'approved'
                            ? 'bg-emerald-50/20'
                            : 'hover:bg-slate-50/70'
                      }
                    >
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          disabled={lockedForUser}
                          value={row.staffName}
                          onChange={(e) => updateRowField(row.rowKey, { staffName: e.target.value })}
                          placeholder="Staff full name"
                          className="w-full min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#142B46] disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          disabled={lockedForUser}
                          value={row.staffRoleType}
                          onChange={(e) =>
                            updateRowField(row.rowKey, {
                              staffRoleType: e.target.value as 'Teacher' | 'Driver' | 'Support Staff',
                            })
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 disabled:bg-slate-100"
                        >
                          <option value="Teacher">Teacher</option>
                          <option value="Driver">Driver</option>
                          <option value="Support Staff">Support Staff</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          disabled={lockedForUser}
                          value={row.designation}
                          onChange={(e) => updateRowField(row.rowKey, { designation: e.target.value })}
                          placeholder="Designation / Bus"
                          className="w-full min-w-[130px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 disabled:bg-slate-100"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={31}
                          disabled={lockedForUser}
                          value={row.daysWorked}
                          onChange={(e) =>
                            updateRowField(row.rowKey, { daysWorked: Number(e.target.value) })
                          }
                          className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center font-mono text-xs font-semibold text-slate-900 disabled:bg-slate-100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step={500}
                          disabled={lockedForUser}
                          value={row.grossSalaryInr}
                          onChange={(e) =>
                            updateRowField(row.rowKey, { grossSalaryInr: Number(e.target.value) })
                          }
                          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right font-mono text-xs font-bold text-[#142B46] disabled:bg-slate-100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          disabled={lockedForUser}
                          value={row.deductionsInr}
                          onChange={(e) =>
                            updateRowField(row.rowKey, { deductionsInr: Number(e.target.value) })
                          }
                          className="w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right font-mono text-xs text-rose-700 disabled:bg-slate-100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#142B46] whitespace-nowrap">
                        ₹{row.netPayableInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {row.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#6E987A]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#142B46]">
                            {lockedForUser && <Lock className="h-2.5 w-2.5" />}
                            Approved
                          </span>
                        ) : row.status === 'new' || row.dirty ? (
                          <span className="rounded-md bg-[#D6B66D]/30 px-2 py-0.5 text-[10px] font-bold uppercase text-[#142B46]">
                            Unsaved
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                            {row.status}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {row.status === 'new' ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveUnsavedRow(row.rowKey)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                            title="Remove unsaved row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : row.status === 'approved' ? (
                          <span className="text-[11px] font-semibold text-[#6E987A]">
                            {row.approvedBy || 'Approved'}
                          </span>
                        ) : isManagementApprover && row.id && !row.dirty ? (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleApproveSingle(row.id!)}
                            className="rounded-lg bg-[#6E987A] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#5b8266]"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {row.dirty ? 'Save to commit' : 'Awaiting Principal'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Bulk Save & Bulk Approve Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#FAF4EC] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-700">
            <span className="font-bold text-[#142B46]">{selectedMonth}</span> ·{' '}
            {summary.totalStaff} staff · Net Payroll{' '}
            <span className="font-mono font-bold text-[#142B46]">
              ₹{summary.totalNetInr.toLocaleString('en-IN')}
            </span>
            {!isManagementApprover && (
              <span className="ml-2 text-[11px] text-slate-500">
                (Dual-control: Accountant saves &amp; submits; Principal approves in 1 click)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setRows(toEditableRows(payrolls, selectedMonth))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Edits
            </button>

            <button
              type="button"
              disabled={busy || rows.length === 0}
              onClick={() => handleSaveAllSalaries(false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#142B46] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e3d63] disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
              Save All Changes ({rows.length} Staff)
            </button>

            {isManagementApprover && (
              <>
                {summary.dirtyCount > 0 ? (
                  <button
                    type="button"
                    disabled={busy || rows.length === 0}
                    onClick={() => handleSaveAllSalaries(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E987A] px-4 py-2 text-xs font-bold text-white hover:bg-[#5c8467] disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Save &amp; Approve All ({rows.length})
                  </button>
                ) : (
                  summary.pendingApprovalCount > 0 && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleApproveAllPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#6E987A] px-4 py-2 text-xs font-bold text-white hover:bg-[#5c8467] disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve All Pending ({summary.pendingApprovalCount})
                    </button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
