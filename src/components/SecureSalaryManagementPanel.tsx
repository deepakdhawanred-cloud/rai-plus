import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  EyeOff,
  Lock,
  Printer,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type {
  SalaryModificationAuditRecord,
  StaffAttendanceRecord,
  StaffSalaryComputation,
} from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import { formatMonthLabel } from '../utils/campusAdminEngine';
import {
  escapeHtmlStrict,
  filterAuthorizedSalaryRows,
  formatMaskedInr,
  resolveSalaryRbacCapabilities,
  sanitizeCsvCell,
  type EffectiveSalaryScope,
} from '../utils/salarySecurityPolicy';
import { RAI_PLUS_LOGO_URL } from '../utils/transportEngine';
import { SalaryAuditLogPanel } from './SalaryAuditLogPanel';
import { pushToast } from './ToastProvider';

interface SecureSalaryManagementPanelProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  selectedMonth?: string;
  onMonthChange?: (monthKey: string) => void;
  compactHeader?: boolean;
  hideAuditLogTab?: boolean;
}

interface SalaryPreviewResponse {
  monthKey: string;
  monthLabel: string;
  accessScope: EffectiveSalaryScope;
  staffAttendance: StaffAttendanceRecord[];
  salarySummaries: StaffSalaryComputation[];
  salaryAuditLogs?: SalaryModificationAuditRecord[];
}

type SyncFilterMode = 'all' | 'pending' | 'synced' | 'has_lop';

export const SecureSalaryManagementPanel: React.FC<SecureSalaryManagementPanelProps> = ({
  data,
  token,
  onRefresh,
  selectedMonth: controlledMonth,
  onMonthChange,
  compactHeader = false,
  hideAuditLogTab = false,
}) => {
  const defaultMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [internalMonth, setInternalMonth] = useState<string>(defaultMonth);
  const activeMonth = controlledMonth || internalMonth;
  const [panelView, setPanelView] = useState<'sheet' | 'audit'>('sheet');

  const [serverScope, setServerScope] = useState<EffectiveSalaryScope | undefined>(
    data.staffSalaryAccessScope,
  );
  const [serverRows, setServerRows] = useState<StaffSalaryComputation[] | null>(null);
  const [serverAttendance, setServerAttendance] = useState<StaffAttendanceRecord[] | null>(null);
  const [serverAuditLogs, setServerAuditLogs] = useState<SalaryModificationAuditRecord[] | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Privacy & filtering controls
  const [figuresRevealed, setFiguresRevealed] = useState<boolean>(false);
  const [revealedRowIds, setRevealedRowIds] = useState<Record<string, boolean>>({});
  const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [syncFilter, setSyncFilter] = useState<SyncFilterMode>('all');

  // Confirmed Payroll Sync controls
  const [confirmSyncOpen, setConfirmSyncOpen] = useState<boolean>(false);
  const [syncingPayroll, setSyncingPayroll] = useState<boolean>(false);

  const rbac = useMemo(
    () => resolveSalaryRbacCapabilities(data.user.role, serverScope ?? data.staffSalaryAccessScope),
    [data.user.role, serverScope, data.staffSalaryAccessScope],
  );

  const loadServerSalaryPreview = useCallback(
    async (monthKey: string) => {
      if (rbac.scope === 'none') {
        setServerRows([]);
        setAccessDeniedMessage(
          'Salary management is restricted strictly to authorized finance leadership and individual employees viewing their own payslip.',
        );
        return;
      }

      setLoadingPreview(true);
      setLoadError(null);
      setAccessDeniedMessage(null);
      try {
        const res = await apiRequest<SalaryPreviewResponse>(
          `/api/staff-attendance/salary-preview?month=${encodeURIComponent(monthKey)}`,
          { method: 'GET' },
          token,
        );
        setServerScope(res.accessScope);
        setServerRows(Array.isArray(res.salarySummaries) ? res.salarySummaries : []);
        setServerAttendance(Array.isArray(res.staffAttendance) ? res.staffAttendance : []);
        if (Array.isArray(res.salaryAuditLogs)) {
          setServerAuditLogs(res.salaryAuditLogs);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to load verified payroll data.';
        if (msg.toLowerCase().includes('access denied') || msg.includes('403')) {
          setServerScope('none');
          setServerRows([]);
          setAccessDeniedMessage(msg);
        } else {
          setLoadError(msg);
        }
      } finally {
        setLoadingPreview(false);
      }
    },
    [rbac.scope, token],
  );

  useEffect(() => {
    void loadServerSalaryPreview(activeMonth);
  }, [activeMonth, loadServerSalaryPreview, data.staffAttendance?.length, data.payrollRegisters?.length]);

  function handleMonthSelect(next: string) {
    if (!/^\d{4}-\d{2}$/.test(next)) return;
    if (onMonthChange) {
      onMonthChange(next);
    } else {
      setInternalMonth(next);
    }
    setConfirmSyncOpen(false);
  }

  // Strictly scope visible rows client-side as defense-in-depth on top of server enforcement
  const ownProfileId = useMemo(
    () =>
      (data.staffProfiles || []).find(
        (p) =>
          p.userId === data.user.id ||
          p.name.trim().toLowerCase() === data.user.name.trim().toLowerCase(),
      )?.id,
    [data.staffProfiles, data.user.id, data.user.name],
  );

  const authorizedRows = useMemo(() => {
    const base = serverRows ?? data.staffSalarySummaries ?? [];
    return filterAuthorizedSalaryRows({
      rows: base,
      scope: rbac.scope,
      authenticatedUserName: data.user.name,
      authenticatedStaffId: ownProfileId,
    });
  }, [serverRows, data.staffSalarySummaries, rbac.scope, data.user.name, ownProfileId]);

  const departments = useMemo(() => {
    return Array.from(new Set(authorizedRows.map((r) => r.department).filter(Boolean))).sort();
  }, [authorizedRows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return authorizedRows.filter((row) => {
      if (departmentFilter !== 'ALL' && row.department !== departmentFilter) return false;
      if (syncFilter === 'pending' && row.payrollStatus !== 'Pending Sync') return false;
      if (syncFilter === 'synced' && row.payrollStatus !== 'Synced to Payroll') return false;
      if (syncFilter === 'has_lop' && row.lossOfPayDays <= 0) return false;
      if (!q) return true;
      return (
        row.staffName.toLowerCase().includes(q) ||
        row.employeeCode.toLowerCase().includes(q) ||
        row.designation.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q)
      );
    });
  }, [authorizedRows, departmentFilter, syncFilter, searchQuery]);

  const summaryTotals = useMemo(() => {
    const totalGross = authorizedRows.reduce((s, r) => s + r.grossSalaryInr, 0);
    const totalLop = authorizedRows.reduce((s, r) => s + r.lopDeductionInr, 0);
    const totalStdDed = authorizedRows.reduce((s, r) => s + r.standardDeductionsInr, 0);
    const totalNet = authorizedRows.reduce((s, r) => s + r.netPayableInr, 0);
    const syncedCount = authorizedRows.filter((r) => r.payrollStatus === 'Synced to Payroll').length;
    const lopAffectedCount = authorizedRows.filter((r) => r.lossOfPayDays > 0).length;
    return { totalGross, totalLop, totalStdDed, totalNet, syncedCount, lopAffectedCount };
  }, [authorizedRows]);

  const payrollAuditEntries = useMemo(() => {
    if (!rbac.canViewAuditLog) return [];
    return (data.auditLogs || [])
      .filter((log) =>
        [
          'AUTO_SYNCED_ATTENDANCE_TO_PAYROLL',
          'UPDATED_STAFF_SALARY_PROFILE',
          'MARKED_STAFF_ATTENDANCE',
        ].includes(log.action),
      )
      .slice(0, 5);
  }, [data.auditLogs, rbac.canViewAuditLog]);

  function isRowRevealed(staffId: string): boolean {
    return figuresRevealed || Boolean(revealedRowIds[staffId]);
  }

  function toggleRowReveal(staffId: string) {
    setRevealedRowIds((prev) => ({ ...prev, [staffId]: !prev[staffId] }));
  }

  async function handleConfirmSyncPayroll() {
    if (!rbac.canSyncPayroll) return;
    setSyncingPayroll(true);
    try {
      const res = await apiRequest<{
        syncedCount: number;
        totalNetPayableInr: number;
        monthLabel: string;
      }>(
        '/api/staff-attendance/sync-payroll',
        {
          method: 'POST',
          body: JSON.stringify({ monthKey: activeMonth }),
        },
        token,
      );
      setConfirmSyncOpen(false);
      await Promise.all([onRefresh(), loadServerSalaryPreview(activeMonth)]);
      pushToast(
        `Automated payroll synced for ${res.syncedCount} staff (${res.monthLabel}).`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to sync automated payroll.',
        'error',
      );
    } finally {
      setSyncingPayroll(false);
    }
  }

  function handleExportFormulaSafeCsv() {
    if (!rbac.canExportBulkCsv) return;
    const headers = [
      'Employee Code',
      'Staff Name',
      'Designation',
      'Department',
      'Bank Account No.',
      'IFSC Code',
      'Bank Name',
      'Billing Month',
      'Working Days',
      'Present',
      'Half Day',
      'Paid Leave',
      'Unpaid/Absent',
      'Effective Paid Days',
      'LOP Days',
      'Gross INR',
      'PF / Standard Deduction INR',
      'LOP Deduction INR',
      'Net Payable INR',
      'Payroll Status',
    ];
    const body = filteredRows.map((r) => [
      r.employeeCode,
      r.staffName,
      r.designation,
      r.department,
      r.bankAccountNumber || '',
      r.ifscCode || '',
      r.bankName || '',
      r.monthLabel,
      r.workingDaysPerMonth,
      r.presentDays,
      r.halfDays,
      r.paidLeaveDays,
      r.absentDays + r.unpaidLeaveDays,
      r.effectivePaidDays,
      r.lossOfPayDays,
      r.grossSalaryInr,
      r.standardDeductionsInr,
      r.lopDeductionInr,
      r.netPayableInr,
      r.payrollStatus,
    ]);
    const csv = [headers, ...body]
      .map((line) => line.map((cell) => sanitizeCsvCell(cell)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Automated_Payroll_${activeMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleDownloadSafePayslip(row: StaffSalaryComputation) {
    if (!rbac.canDownloadPayslip) return;
    const safeLogo = RAI_PLUS_LOGO_URL.startsWith('/') ? RAI_PLUS_LOGO_URL : '';
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Payslip - ${escapeHtmlStrict(row.staffName)} - ${escapeHtmlStrict(row.monthLabel)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; background: #f8fafc; padding: 28px; }
    .sheet { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 28px; }
    .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #142B46; padding-bottom: 14px; margin-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #d6b66d; }
    h1 { margin: 0; font-size: 18px; color: #142B46; }
    .sub { margin: 2px 0 0; font-size: 12px; color: #475569; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 20px; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px; }
    th, td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-family: ui-monospace, SFMono-Regular, monospace; }
    .net { background: #f1f5f9; font-weight: 700; font-size: 15px; }
    .foot { display: flex; justify-content: space-between; margin-top: 26px; font-size: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="head">
      <div class="brand">
        ${safeLogo ? `<img src="${escapeHtmlStrict(safeLogo)}" alt="School Logo" />` : ''}
        <div>
          <h1>${escapeHtmlStrict(data.activeSchool.name)}</h1>
          <p class="sub">${escapeHtmlStrict(data.activeSchool.city)}, ${escapeHtmlStrict(data.activeSchool.state)} · Attendance-Linked Salary Slip</p>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;color:#142B46;">${escapeHtmlStrict(row.monthLabel)}</div>
        <div class="sub">Employee Code: ${escapeHtmlStrict(row.employeeCode)}</div>
      </div>
    </div>
    <div class="meta">
      <div><strong>Employee:</strong> ${escapeHtmlStrict(row.staffName)}</div>
      <div><strong>Designation:</strong> ${escapeHtmlStrict(row.designation)}</div>
      <div><strong>Department:</strong> ${escapeHtmlStrict(row.department)}</div>
      <div><strong>Effective Paid Days:</strong> ${row.effectivePaidDays} / ${row.workingDaysPerMonth} (LOP: ${row.lossOfPayDays}d)</div>
      <div><strong>Bank Account:</strong> ${escapeHtmlStrict(row.bankAccountNumber || 'Pending')}</div>
      <div><strong>IFSC / Bank:</strong> ${escapeHtmlStrict([row.ifscCode, row.bankName].filter(Boolean).join(' · ') || 'Pending')}</div>
    </div>
    <table>
      <thead>
        <tr><th>Salary Component</th><th class="num">Amount (INR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Monthly Salary</td><td class="num">${formatMaskedInr(row.baseMonthlySalaryInr, true)}</td></tr>
        <tr><td>Fixed Allowances</td><td class="num">${formatMaskedInr(row.fixedAllowanceInr, true)}</td></tr>
        <tr><td><strong>Gross Earnings</strong></td><td class="num"><strong>${formatMaskedInr(row.grossSalaryInr, true)}</strong></td></tr>
        <tr><td>PF &amp; Statutory Deductions</td><td class="num">- ${formatMaskedInr(row.standardDeductionsInr, true)}</td></tr>
        <tr><td>Attendance Loss of Pay (${row.lossOfPayDays} days × ${formatMaskedInr(row.perDayRateInr, true)}/day)</td><td class="num">- ${formatMaskedInr(row.lopDeductionInr, true)}</td></tr>
        <tr class="net"><td>Net Payable Salary</td><td class="num">${formatMaskedInr(row.netPayableInr, true)}</td></tr>
      </tbody>
    </table>
    <div class="foot">
      <span>Confidential · Verified Attendance-Linked Payroll Statement</span>
      <span>Authorized Finance Signatory</span>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Confidential_Payslip_${row.employeeCode}_${row.monthKey}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // HARD RBAC DENY VIEW: Unauthorized roles (parent, student, or server-denied) see zero payroll data
  if (rbac.scope === 'none' || accessDeniedMessage) {
    return (
      <section
        data-testid="salary-access-denied"
        aria-label="Restricted Salary Management"
        className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3"
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="font-display text-base font-bold text-slate-900">
          Salary Management Access Restricted
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          {accessDeniedMessage ||
            'Automated staff payroll records are visible exclusively to authorized Finance and School Leadership personnel (School Admin, Principal, and Accountant) and to staff members viewing their own private payslip.'}
        </p>
        <p className="text-xs font-mono text-slate-500">
          Signed-in role: {rbac.roleLabel} · Payroll scope: Denied
        </p>
      </section>
    );
  }

  const attendanceForMonth = (serverAttendance ?? data.staffAttendance ?? []).filter((r) =>
    r.date.startsWith(`${activeMonth}-`),
  );

  return (
    <section
      data-testid="secure-salary-management-panel"
      aria-label="Secure Automated Salary Management"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Top Security & Action Toolbar */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-[#142B46] shrink-0" />
            <span>
              {rbac.canViewFullRoster
                ? 'Authorized Finance & Leadership Console'
                : 'Private Employee Self-Service View'}
            </span>
            <span aria-hidden="true">·</span>
            <span>Role: {rbac.roleLabel}</span>
            <span aria-hidden="true">·</span>
            <span>
              {rbac.canViewFullRoster
                ? rbac.canAutoApprovePayroll
                  ? 'Full Payroll & Auto-Approval'
                  : 'Full Payroll & Submission'
                : 'Self-Only Record'}
            </span>
          </div>
          {!compactHeader && (
            <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
              {rbac.canViewFullRoster
                ? `Automated Staff Payroll — ${formatMonthLabel(activeMonth)}`
                : `My Attendance-Linked Payslip — ${formatMonthLabel(activeMonth)}`}
            </h3>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {rbac.canViewAuditLog && !hideAuditLogTab && (
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setPanelView('sheet')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  panelView === 'sheet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Salary Sheet
              </button>
              <button
                type="button"
                onClick={() => setPanelView('audit')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  panelView === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audit Log ({(serverAuditLogs ?? data.salaryAuditLogs ?? []).length})
              </button>
            </div>
          )}

          {/* Month Selector */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700">
            <span className="text-slate-500">Month</span>
            <input
              type="month"
              aria-label="Select payroll month"
              value={activeMonth}
              onChange={(e) => handleMonthSelect(e.target.value)}
              className="bg-transparent font-mono font-semibold text-slate-900 focus:outline-none"
            />
          </label>

          {/* Privacy Mask / Reveal Toggle (Prevents Shoulder-Surfing) */}
          <button
            type="button"
            data-testid="toggle-salary-privacy-mask"
            onClick={() => {
              setFiguresRevealed((prev) => !prev);
              setRevealedRowIds({});
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {figuresRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-[#142B46]" />
                Mask Amounts
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-[#142B46]" />
                Reveal Amounts
              </>
            )}
          </button>

          {rbac.canExportBulkCsv && (
            <button
              type="button"
              onClick={handleExportFormulaSafeCsv}
              disabled={filteredRows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-[#142B46]" />
              Export CSV
            </button>
          )}

          {rbac.canSyncPayroll && (
            <button
              type="button"
              data-testid="open-sync-payroll-confirm"
              onClick={() => setConfirmSyncOpen((prev) => !prev)}
              disabled={syncingPayroll || authorizedRows.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingPayroll ? 'animate-spin' : ''}`} />
              Sync to Payroll
            </button>
          )}
        </div>
      </div>

      {panelView === 'audit' && rbac.canViewAuditLog && !hideAuditLogTab ? (
        <SalaryAuditLogPanel
          auditLogs={serverAuditLogs ?? data.salaryAuditLogs ?? []}
          schoolName={data.activeSchool.name}
          embedded
        />
      ) : (
        <>
          {/* Explicit Confirmation Bar Before Mutating Payroll Register */}
          {confirmSyncOpen && rbac.canSyncPayroll && (
        <div
          data-testid="payroll-sync-confirm-bar"
          className="border-b border-amber-200 bg-amber-50/70 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-start gap-2.5 text-amber-950">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Confirm Payroll Sync for {formatMonthLabel(activeMonth)} ({authorizedRows.length} staff)
              </p>
              <p className="text-amber-900/90 mt-0.5">
                {rbac.canAutoApprovePayroll
                  ? 'Entries will be written to the Finance Payroll Register with Approved status and recorded in the audit trail.'
                  : 'Entries will be submitted to the Finance Payroll Register for Principal approval and recorded in the audit trail.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmSyncOpen(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              data-testid="confirm-sync-payroll-btn"
              disabled={syncingPayroll}
              onClick={handleConfirmSyncPayroll}
              className="rounded-lg bg-[#142B46] px-3.5 py-1.5 font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-50 whitespace-nowrap"
            >
              {syncingPayroll ? 'Syncing…' : 'Confirm & Write Payroll'}
            </button>
          </div>
        </div>
      )}

      {/* Summary Financial Strip (Tabular Numerals, Privacy-Masked by Default) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50">
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">
            {rbac.canViewFullRoster ? 'Total Gross Payroll' : 'Monthly Gross Earnings'}
          </p>
          <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-1">
            {formatMaskedInr(summaryTotals.totalGross, figuresRevealed)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {authorizedRows.length} {authorizedRows.length === 1 ? 'employee' : 'employees'} ·{' '}
            {formatMonthLabel(activeMonth)}
          </p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Attendance LOP Deductions</p>
          <p className="font-mono text-xl font-bold text-amber-700 tabular-nums mt-1">
            {summaryTotals.totalLop > 0
              ? `- ${formatMaskedInr(summaryTotals.totalLop, figuresRevealed)}`
              : formatMaskedInr(0, figuresRevealed)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {summaryTotals.lopAffectedCount} with attendance LOP adjustments
          </p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Statutory / PF Deductions</p>
          <p className="font-mono text-xl font-bold text-slate-800 tabular-nums mt-1">
            - {formatMaskedInr(summaryTotals.totalStdDed, figuresRevealed)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Standard payroll deductions</p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">
            {rbac.canViewFullRoster ? 'Net Payable Disbursal' : 'My Net Payable'}
          </p>
          <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums mt-1">
            {formatMaskedInr(summaryTotals.totalNet, figuresRevealed)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono tabular-nums">
            {summaryTotals.syncedCount}/{authorizedRows.length} synced to ledger
          </p>
        </div>
      </div>

      {/* Filter Toolbar (Full Roster Managers Only) */}
      {rbac.canViewFullRoster && (
        <div className="border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee, code, or role…"
                className="w-60 rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#142B46] focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter by department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#142B46] focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div
            role="tablist"
            aria-label="Payroll status filter"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs"
          >
            {(
              [
                { id: 'all', label: `All (${authorizedRows.length})` },
                { id: 'pending', label: 'Pending Sync' },
                { id: 'synced', label: 'Synced' },
                { id: 'has_lop', label: 'With LOP' },
              ] as Array<{ id: SyncFilterMode; label: string }>
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={syncFilter === item.id}
                onClick={() => setSyncFilter(item.id)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                  syncFilter === item.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="px-6 py-4 border-b border-rose-200 bg-rose-50 text-xs text-rose-800 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => void loadServerSalaryPreview(activeMonth)}
            className="font-semibold underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loadingPreview && serverRows === null ? (
        <div className="p-6 space-y-3" aria-busy="true">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-10 rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No attendance-linked payroll records match the current selection for{' '}
          {formatMonthLabel(activeMonth)}.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-right">Attendance (P · H · PL · A)</th>
                <th className="py-3 px-4 text-right">Paid / LOP Days</th>
                <th className="py-3 px-4 text-right">Gross</th>
                <th className="py-3 px-4 text-right">LOP Cut</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRows.map((row) => {
                const rowRevealed = isRowRevealed(row.staffId);
                const isExpanded = expandedStaffId === row.staffId;
                return (
                  <React.Fragment key={row.staffId}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{row.staffName}</p>
                        <p className="text-slate-500 mt-0.5">
                          <span className="font-mono tabular-nums">{row.employeeCode}</span>
                          {' · '}
                          {row.designation}
                          {' · '}
                          <span
                            className={
                              row.payrollStatus === 'Synced to Payroll'
                                ? 'text-emerald-700 font-medium'
                                : 'text-amber-700 font-medium'
                            }
                          >
                            {row.payrollStatus}
                          </span>
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {row.presentDays}P · {row.halfDays}H · {row.paidLeaveDays}PL ·{' '}
                        {row.absentDays + row.unpaidLeaveDays}A
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className="font-semibold text-slate-900">
                          {row.effectivePaidDays}/{row.workingDaysPerMonth}
                        </span>
                        {row.lossOfPayDays > 0 && (
                          <span className="text-rose-700 ml-1.5">(-{row.lossOfPayDays}d)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatMaskedInr(row.grossSalaryInr, rowRevealed)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-amber-700">
                        {row.lopDeductionInr > 0
                          ? `-${formatMaskedInr(row.lopDeductionInr, rowRevealed)}`
                          : formatMaskedInr(0, rowRevealed)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {formatMaskedInr(row.netPayableInr, rowRevealed)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {!figuresRevealed && (
                            <button
                              type="button"
                              aria-label={rowRevealed ? 'Hide row amounts' : 'Reveal row amounts'}
                              onClick={() => toggleRowReveal(row.staffId)}
                              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                              title={rowRevealed ? 'Hide amounts' : 'Reveal amounts'}
                            >
                              {rowRevealed ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() =>
                              setExpandedStaffId(isExpanded ? null : row.staffId)
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          >
                            Breakdown
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSafePayslip(row)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Payslip
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Transparent Attendance-to-Payroll Calculation Breakdown Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-900">
                                Earnings Breakdown
                              </p>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600">
                                <span>Basic Monthly Salary</span>
                                <span>{formatMaskedInr(row.baseMonthlySalaryInr, rowRevealed)}</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600">
                                <span>Fixed Allowances</span>
                                <span>{formatMaskedInr(row.fixedAllowanceInr, rowRevealed)}</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums font-semibold text-slate-900 border-t border-slate-200 pt-1">
                                <span>Gross Salary</span>
                                <span>{formatMaskedInr(row.grossSalaryInr, rowRevealed)}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-900">
                                Attendance &amp; LOP Calculation
                              </p>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600">
                                <span>Per-Day Base Rate</span>
                                <span>{formatMaskedInr(row.perDayRateInr, rowRevealed)}/day</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600">
                                <span>Marked Attendance Rate</span>
                                <span>{row.attendancePct}% ({row.markedDays} days logged)</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums text-amber-800 border-t border-slate-200 pt-1">
                                <span>LOP Cut ({row.lossOfPayDays}d)</span>
                                <span>- {formatMaskedInr(row.lopDeductionInr, rowRevealed)}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-900">
                                Net Disbursement &amp; Bank Details
                              </p>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600">
                                <span>PF / Standard Deductions</span>
                                <span>- {formatMaskedInr(row.standardDeductionsInr, rowRevealed)}</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums font-bold text-emerald-700 border-t border-slate-200 pt-1">
                                <span>Net Payable</span>
                                <span>{formatMaskedInr(row.netPayableInr, rowRevealed)}</span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums text-slate-600 pt-1">
                                <span>Bank A/C</span>
                                <span>
                                  {row.bankAccountNumber
                                    ? rowRevealed
                                      ? row.bankAccountNumber
                                      : `••••${row.bankAccountNumber.slice(-4)}`
                                    : 'Pending'}
                                </span>
                              </div>
                              <div className="flex justify-between font-mono tabular-nums text-slate-500">
                                <span>IFSC / Bank</span>
                                <span className="truncate max-w-[180px]" title={row.bankName || ''}>
                                  {[row.ifscCode, row.bankName].filter(Boolean).join(' · ') || 'Pending'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 pt-0.5">
                                {row.lastSyncedAt
                                  ? `Last synced ${row.lastSyncedAt.slice(0, 10)}`
                                  : 'Pending sync to Finance Payroll Register'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Self-Service Personal Attendance Log (Strictly Own Entries for Non-Finance Staff) */}
      {!rbac.canViewFullRoster && attendanceForMonth.length > 0 && (
        <div className="border-t border-slate-200">
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900">
              My Attendance Ledger ({formatMonthLabel(activeMonth)})
            </h4>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {attendanceForMonth.length} logged days
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-500 font-semibold">
                  <th className="py-2.5 px-6">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Check-In / Check-Out</th>
                  <th className="py-2.5 px-4">Capture Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceForMonth
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 px-6 font-mono tabular-nums text-slate-900">
                        {r.date}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{r.status}</td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                        {r.checkInTime ? `${r.checkInTime} – ${r.checkOutTime || '—'}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 capitalize">{r.markingMode}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll Audit Trail Strip (Authorized Finance & Leadership Only) */}
      {rbac.canViewAuditLog && payrollAuditEntries.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/40 px-6 py-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              Recent Payroll &amp; Attendance Activity Log
            </p>
            <span className="text-[11px] text-slate-500">
              Formula: Net = (Basic + Allowances) − Statutory − (LOP Days × Basic ÷ Working Days)
            </span>
          </div>
          <div className="divide-y divide-slate-200/70 text-xs">
            {payrollAuditEntries.map((entry) => (
              <div
                key={entry.id}
                className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600"
              >
                <span className="truncate">{entry.detail}</span>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                  {entry.actorName} · {entry.timestamp.slice(0, 16).replace('T', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </section>
  );
};
