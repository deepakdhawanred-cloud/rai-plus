import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Lock,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Upload,
  UserCheck,
} from 'lucide-react';
import type {
  AttendanceMarkingMode,
  StaffAttendanceStatus,
  StaffProfile,
  StaffRoleCategory,
  StaffSalaryComputation,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  computeStaffMonthlySalary,
  formatMonthLabel,
} from '../../utils/campusAdminEngine';
import {
  ATTENDANCE_MODE_SPECS,
  getAllowedAttendanceModesForSchool,
} from '../../utils/subscriptionEntitlements';
import { RAI_PLUS_LOGO_URL } from '../../utils/transportEngine';
import { pushToast } from '../ToastProvider';
import { SalaryAuditLogPanel } from '../SalaryAuditLogPanel';
import { SecureSalaryManagementPanel } from '../SecureSalaryManagementPanel';

interface StaffAttendanceSalaryModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

const STATUS_OPTIONS: StaffAttendanceStatus[] = [
  'Present',
  'Half Day',
  'Paid Leave',
  'Unpaid Leave',
  'Absent',
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const StaffAttendanceSalaryModule: React.FC<StaffAttendanceSalaryModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const scope = data.staffSalaryAccessScope || 'none';
  const isFullManager = scope === 'full';

  const staffProfiles = useMemo(() => data.staffProfiles || [], [data.staffProfiles]);
  const staffAttendance = useMemo(() => data.staffAttendance || [], [data.staffAttendance]);
  const payrollRegisters = useMemo(() => data.payrollRegisters || [], [data.payrollRegisters]);

  const salaryAuditLogs = useMemo(() => data.salaryAuditLogs || [], [data.salaryAuditLogs]);

  const allowedModes = useMemo(
    () => getAllowedAttendanceModesForSchool(data.activeSchool),
    [data.activeSchool],
  );

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [subTab, setSubTab] = useState<'attendance' | 'salary' | 'profiles' | 'audit'>(
    isFullManager ? 'attendance' : 'salary',
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedMonth, setSelectedMonth] = useState<string>(todayIso.slice(0, 7));
  const [markingMode, setMarkingMode] = useState<AttendanceMarkingMode>(
    allowedModes[0] || 'manual',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [syncingPayroll, setSyncingPayroll] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [importingSheet, setImportingSheet] = useState(false);
  const salarySheetInputRef = useRef<HTMLInputElement | null>(null);

  // Draft attendance map keyed by staffId for selectedDate
  const [draftStatuses, setDraftStatuses] = useState<
    Record<
      string,
      {
        status: StaffAttendanceStatus;
        checkInTime: string;
        checkOutTime: string;
        remarks: string;
      }
    >
  >({});

  // Profile editor state
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesignation, setProfileDesignation] = useState('');
  const [profileDepartment, setProfileDepartment] = useState('Teaching Faculty');
  const [profileRoleType, setProfileRoleType] = useState<StaffRoleCategory>('Teacher');
  const [profileBankAccount, setProfileBankAccount] = useState('');
  const [profileIfsc, setProfileIfsc] = useState('');
  const [profileBankName, setProfileBankName] = useState('');
  const [profileBaseSalary, setProfileBaseSalary] = useState('38000');
  const [profileAllowance, setProfileAllowance] = useState('2500');
  const [profilePf, setProfilePf] = useState('1800');
  const [profileWorkingDays, setProfileWorkingDays] = useState('26');
  const [profilePaidLeaves, setProfilePaidLeaves] = useState('2');
  const [profileRevisionNote, setProfileRevisionNote] = useState('');

  useEffect(() => {
    const nextDraft: typeof draftStatuses = {};
    for (const profile of staffProfiles) {
      const existing = staffAttendance.find(
        (r) => r.staffId === profile.id && r.date === selectedDate,
      );
      nextDraft[profile.id] = {
        status: existing?.status || 'Present',
        checkInTime: existing?.checkInTime || '08:00',
        checkOutTime: existing?.checkOutTime || '14:30',
        remarks: existing?.remarks || '',
      };
    }
    setDraftStatuses(nextDraft);
  }, [staffProfiles, staffAttendance, selectedDate]);

  useEffect(() => {
    if (!allowedModes.includes(markingMode)) {
      setMarkingMode(allowedModes[0] || 'manual');
    }
  }, [allowedModes, markingMode]);

  const salarySummaries = useMemo<StaffSalaryComputation[]>(() => {
    return staffProfiles.map((profile) =>
      computeStaffMonthlySalary({
        profile,
        attendanceRecords: staffAttendance,
        monthKey: selectedMonth,
        payrollRegisters,
      }),
    );
  }, [staffProfiles, staffAttendance, selectedMonth, payrollRegisters]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return staffProfiles;
    return staffProfiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.designation.toLowerCase().includes(q) ||
        p.employeeCode.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.bankAccountNumber || '').toLowerCase().includes(q) ||
        (p.ifscCode || '').toLowerCase().includes(q) ||
        (p.bankName || '').toLowerCase().includes(q),
    );
  }, [staffProfiles, searchQuery]);

  const filteredSalaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return salarySummaries;
    return salarySummaries.filter(
      (s) =>
        s.staffName.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q),
    );
  }, [salarySummaries, searchQuery]);

  const totals = useMemo(() => {
    const presentToday = staffProfiles.filter(
      (p) => draftStatuses[p.id]?.status === 'Present',
    ).length;
    const totalGross = salarySummaries.reduce((acc, s) => acc + s.grossSalaryInr, 0);
    const totalLop = salarySummaries.reduce((acc, s) => acc + s.lopDeductionInr, 0);
    const totalNet = salarySummaries.reduce((acc, s) => acc + s.netPayableInr, 0);
    const syncedCount = salarySummaries.filter((s) => s.payrollStatus === 'Synced to Payroll').length;
    return { presentToday, totalGross, totalLop, totalNet, syncedCount };
  }, [staffProfiles, draftStatuses, salarySummaries]);

  if (scope === 'none') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <Lock className="h-6 w-6 mx-auto text-slate-400" />
        <h2 className="font-display text-lg font-bold text-slate-900">
          Restricted Institutional Module
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Staff attendance and automated salary sheets are visible strictly to authorized school
          administrators, finance officers, and individual staff members for their own records.
        </p>
      </section>
    );
  }

  async function handleSaveAttendance() {
    setSavingAttendance(true);
    try {
      const entries = staffProfiles.map((p) => ({
        staffId: p.id,
        status: draftStatuses[p.id]?.status || 'Present',
        checkInTime: draftStatuses[p.id]?.checkInTime || undefined,
        checkOutTime: draftStatuses[p.id]?.checkOutTime || undefined,
        remarks: draftStatuses[p.id]?.remarks || undefined,
      }));
      await apiRequest(
        '/api/staff-attendance/batch',
        {
          method: 'POST',
          body: JSON.stringify({
            date: selectedDate,
            markingMode,
            entries,
          }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        `Saved attendance for ${entries.length} staff (${selectedDate}) and updated salary calculations.`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to save staff attendance.',
        'error',
      );
    } finally {
      setSavingAttendance(false);
    }
  }

  async function handleSyncPayroll() {
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
          body: JSON.stringify({ monthKey: selectedMonth }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        `Synced ${res.syncedCount} staff salaries for ${res.monthLabel} (${formatInr(res.totalNetPayableInr)}) to Finance Payroll Register.`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to sync payroll register.',
        'error',
      );
    } finally {
      setSyncingPayroll(false);
    }
  }

  function openEditProfile(profile?: StaffProfile) {
    if (profile) {
      setEditingProfileId(profile.id);
      setProfileName(profile.name);
      setProfileDesignation(profile.designation);
      setProfileDepartment(profile.department);
      setProfileRoleType(profile.roleType);
      setProfileBankAccount(profile.bankAccountNumber || '');
      setProfileIfsc(profile.ifscCode || '');
      setProfileBankName(profile.bankName || '');
      setProfileBaseSalary(String(profile.baseMonthlySalaryInr));
      setProfileAllowance(String(profile.fixedAllowanceInr));
      setProfilePf(String(profile.pfOrDeductionInr));
      setProfileWorkingDays(String(profile.workingDaysPerMonth));
      setProfilePaidLeaves(String(profile.paidLeaveAllowance));
      setProfileRevisionNote('');
    } else {
      setEditingProfileId(null);
      setProfileName('');
      setProfileDesignation('');
      setProfileDepartment('Teaching Faculty');
      setProfileRoleType('Teacher');
      setProfileBankAccount('');
      setProfileIfsc('');
      setProfileBankName('');
      setProfileBaseSalary('38000');
      setProfileAllowance('2500');
      setProfilePf('1800');
      setProfileWorkingDays('26');
      setProfilePaidLeaves('2');
      setProfileRevisionNote('');
    }
    setProfileFormOpen(true);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiRequest(
        '/api/staff-profiles',
        {
          method: 'POST',
          body: JSON.stringify({
            id: editingProfileId || undefined,
            name: profileName,
            designation: profileDesignation,
            department: profileDepartment,
            roleType: profileRoleType,
            bankAccountNumber: profileBankAccount,
            ifscCode: profileIfsc,
            bankName: profileBankName,
            baseMonthlySalaryInr: Number(profileBaseSalary),
            fixedAllowanceInr: Number(profileAllowance),
            pfOrDeductionInr: Number(profilePf),
            workingDaysPerMonth: Number(profileWorkingDays),
            paidLeaveAllowance: Number(profilePaidLeaves),
            revisionNote: profileRevisionNote.trim() || undefined,
          }),
        },
        token,
      );
      setProfileFormOpen(false);
      setProfileRevisionNote('');
      await onRefresh();
      pushToast('Staff salary structure & bank details saved and logged to Audit Log.', 'success');
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to save staff salary profile.',
        'error',
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleImportSalarySheetCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportingSheet(true);
    try {
      const csvText = await file.text();
      const res = await apiRequest<{
        ok: boolean;
        createdCount: number;
        updatedCount: number;
        totalImported: number;
        duplicatesRemoved: string[];
        missingBankNames: string[];
      }>(
        '/api/staff-profiles/import-sheet',
        {
          method: 'POST',
          body: JSON.stringify({ csvText }),
        },
        token,
      );
      await onRefresh();
      const notes: string[] = [];
      if (res.duplicatesRemoved.length > 0) {
        notes.push(`${res.duplicatesRemoved.length} duplicate skipped`);
      }
      if (res.missingBankNames.length > 0) {
        notes.push(`${res.missingBankNames.length} pending bank info`);
      }
      pushToast(
        `Salary sheet synced: ${res.createdCount} added, ${res.updatedCount} updated${notes.length > 0 ? ` (${notes.join(', ')})` : ''}.`,
        'success',
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to import salary sheet CSV.',
        'error',
      );
    } finally {
      setImportingSheet(false);
    }
  }

  function handleDownloadPayslipHtml(row: StaffSalaryComputation) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Payslip - ${escapeHtml(row.staffName)} - ${escapeHtml(row.monthLabel)}</title>
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
        <img src="${RAI_PLUS_LOGO_URL}" alt="Rai Plus Logo" />
        <div>
          <h1>${escapeHtml(data.activeSchool.name)}</h1>
          <p class="sub">${escapeHtml(data.activeSchool.city)}, ${escapeHtml(data.activeSchool.state)} · Attendance-Linked Salary Slip</p>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;color:#142B46;">${escapeHtml(row.monthLabel)}</div>
        <div class="sub">Code: ${escapeHtml(row.employeeCode)}</div>
      </div>
    </div>
    <div class="meta">
      <div><strong>Employee:</strong> ${escapeHtml(row.staffName)}</div>
      <div><strong>Designation:</strong> ${escapeHtml(row.designation)}</div>
      <div><strong>Department:</strong> ${escapeHtml(row.department)}</div>
      <div><strong>Effective Paid Days:</strong> ${row.effectivePaidDays} / ${row.workingDaysPerMonth} (LOP: ${row.lossOfPayDays})</div>
      <div><strong>Bank Account:</strong> ${escapeHtml(row.bankAccountNumber || 'Pending')}</div>
      <div><strong>IFSC / Bank:</strong> ${escapeHtml([row.ifscCode, row.bankName].filter(Boolean).join(' · ') || 'Pending')}</div>
    </div>
    <table>
      <thead>
        <tr><th>Component</th><th class="num">Amount (INR)</th></tr>
      </thead>
      <tbody>
        <tr><td>Basic Monthly Salary</td><td class="num">${formatInr(row.baseMonthlySalaryInr)}</td></tr>
        <tr><td>Fixed Allowances (HRA / Transport)</td><td class="num">${formatInr(row.fixedAllowanceInr)}</td></tr>
        <tr><td><strong>Gross Earnings</strong></td><td class="num"><strong>${formatInr(row.grossSalaryInr)}</strong></td></tr>
        <tr><td>PF / Statutory Deductions</td><td class="num">- ${formatInr(row.standardDeductionsInr)}</td></tr>
        <tr><td>Attendance Loss of Pay (${row.lossOfPayDays} days × ${formatInr(row.perDayRateInr)}/day)</td><td class="num">- ${formatInr(row.lopDeductionInr)}</td></tr>
        <tr class="net"><td>Net Payable Salary</td><td class="num">${formatInr(row.netPayableInr)}</td></tr>
      </tbody>
    </table>
    <div class="foot">
      <span>Generated automatically from Staff Attendance Ledger</span>
      <span>Authorized Finance Signatory</span>
    </div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${row.employeeCode}_${row.monthKey}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleExportSalaryCsv() {
    const header = [
      'Employee Code',
      'Staff Name',
      'Designation',
      'Department',
      'Bank Account No.',
      'IFSC Code',
      'Bank Name',
      'Month',
      'Working Days',
      'Present',
      'Half Days',
      'Paid Leave',
      'LOP Days',
      'Gross INR',
      'PF/Std Deductions INR',
      'LOP Deduction INR',
      'Net Payable INR',
      'Payroll Status',
    ];
    const rows = filteredSalaries.map((s) => [
      s.employeeCode,
      s.staffName,
      s.designation,
      s.department,
      s.bankAccountNumber || '',
      s.ifscCode || '',
      s.bankName || '',
      s.monthLabel,
      s.workingDaysPerMonth,
      s.presentDays,
      s.halfDays,
      s.paidLeaveDays,
      s.lossOfPayDays,
      s.grossSalaryInr,
      s.standardDeductionsInr,
      s.lopDeductionInr,
      s.netPayableInr,
      s.payrollStatus,
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Staff_Salary_Sheet_${selectedMonth}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-6">
      {/* Header & Role Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {isFullManager
              ? 'Authorized Finance & Leadership Access · School Admin, Principal & Accountant Only'
              : 'Private Self-Service Record · Visible Only to You & School Finance Leadership'}
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
            {isFullManager
              ? 'Staff Attendance & Automated Salary'
              : 'My Attendance & Payslip'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select salary month"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800"
          />
          {isFullManager && (
            <button
              type="button"
              disabled={syncingPayroll}
              onClick={handleSyncPayroll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncingPayroll ? 'animate-spin' : ''}`} />
              {syncingPayroll ? 'Syncing Payroll...' : 'Auto-Sync to Payroll'}
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">
            {isFullManager ? 'Active Staff Roster' : 'My Working Days'}
          </p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {isFullManager
              ? staffProfiles.length
              : salarySummaries[0]?.effectivePaidDays ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isFullManager
              ? `${totals.presentToday} marked Present (${selectedDate})`
              : `of ${salarySummaries[0]?.workingDaysPerMonth ?? 26} working days`}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Monthly Gross Earnings</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">
            {formatInr(totals.totalGross)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{formatMonthLabel(selectedMonth)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Attendance LOP Deductions</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-amber-700 mt-1">
            {formatInr(totals.totalLop)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Auto-computed from Absent &amp; Half Days</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Automated Net Payable</p>
          <p className="font-mono tabular-nums text-2xl font-bold text-emerald-700 mt-1">
            {formatInr(totals.totalNet)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {totals.syncedCount} / {salarySummaries.length} synced to Finance Payroll
          </p>
        </div>
      </div>

      {/* Sub-Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {isFullManager && (
            <button
              type="button"
              onClick={() => setSubTab('attendance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                subTab === 'attendance'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Attendance
            </button>
          )}
          <button
            type="button"
            onClick={() => setSubTab('salary')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              subTab === 'salary'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isFullManager ? 'Automated Salary Sheet' : 'My Payslip & Attendance'}
          </button>
          {isFullManager && (
            <button
              type="button"
              onClick={() => setSubTab('profiles')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                subTab === 'profiles'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Salary Structures
            </button>
          )}
          {isFullManager && (
            <button
              type="button"
              onClick={() => setSubTab('audit')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                subTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Log ({salaryAuditLogs.length})
            </button>
          )}
        </div>

        {isFullManager && subTab !== 'audit' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, code, dept..."
                className="w-56 rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>
            {subTab === 'salary' && (
              <button
                type="button"
                onClick={handleExportSalaryCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            )}
            {subTab === 'profiles' && (
              <>
                <input
                  ref={salarySheetInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleImportSalarySheetCsv}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={importingSheet}
                  onClick={() => salarySheetInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {importingSheet ? 'Importing…' : 'Import Salary Sheet (CSV)'}
                </button>
                <button
                  type="button"
                  onClick={() => openEditProfile()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Staff Profile
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: DAILY STAFF ATTENDANCE (Managers Only) */}
      {subTab === 'attendance' && isFullManager && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value.length >= 7) {
                      setSelectedMonth(e.target.value.slice(0, 7));
                    }
                  }}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono text-slate-800"
                />
              </label>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {ATTENDANCE_MODE_SPECS.map((spec) => {
                  const enabled = allowedModes.includes(spec.mode);
                  return (
                    <button
                      key={spec.mode}
                      type="button"
                      disabled={!enabled}
                      onClick={() => setMarkingMode(spec.mode)}
                      title={enabled ? spec.description : `${spec.label} requires plan upgrade`}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        markingMode === spec.mode
                          ? 'bg-white text-slate-900 shadow-xs'
                          : enabled
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {spec.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = { ...draftStatuses };
                  for (const p of staffProfiles) {
                    next[p.id] = {
                      ...(next[p.id] || { checkInTime: '08:00', checkOutTime: '14:30', remarks: '' }),
                      status: 'Present',
                    };
                  }
                  setDraftStatuses(next);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                Mark All Present
              </button>
              <button
                type="button"
                disabled={savingAttendance}
                onClick={handleSaveAttendance}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60 whitespace-nowrap"
              >
                <UserCheck className="h-3.5 w-3.5" />
                {savingAttendance ? 'Saving...' : 'Save Daily Roll Call'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Status ({selectedDate})</th>
                  <th className="py-3 px-4">In / Out</th>
                  <th className="py-3 px-4 text-right">Per-Day Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProfiles.map((profile) => {
                  const entry = draftStatuses[profile.id] || {
                    status: 'Present' as StaffAttendanceStatus,
                    checkInTime: '08:00',
                    checkOutTime: '14:30',
                    remarks: '',
                  };
                  const perDay = Math.round(
                    profile.baseMonthlySalaryInr / Math.max(1, profile.workingDaysPerMonth),
                  );
                  return (
                    <tr key={profile.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{profile.name}</p>
                        <p className="text-slate-500 mt-0.5">
                          {profile.employeeCode} · {profile.designation} · {profile.department}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex flex-wrap gap-1">
                          {STATUS_OPTIONS.map((st) => {
                            const active = entry.status === st;
                            const activeTone =
                              st === 'Present'
                                ? 'bg-emerald-700 text-white'
                                : st === 'Half Day' || st === 'Paid Leave'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-700 text-white';
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  setDraftStatuses((prev) => ({
                                    ...prev,
                                    [profile.id]: { ...entry, status: st },
                                  }))
                                }
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                  active
                                    ? activeTone
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono">
                          <input
                            type="time"
                            value={entry.checkInTime}
                            disabled={entry.status === 'Absent' || entry.status === 'Paid Leave' || entry.status === 'Unpaid Leave'}
                            onChange={(e) =>
                              setDraftStatuses((prev) => ({
                                ...prev,
                                [profile.id]: { ...entry, checkInTime: e.target.value },
                              }))
                            }
                            className="rounded border border-slate-300 px-1.5 py-1 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <span className="text-slate-400">–</span>
                          <input
                            type="time"
                            value={entry.checkOutTime}
                            disabled={entry.status === 'Absent' || entry.status === 'Paid Leave' || entry.status === 'Unpaid Leave'}
                            onChange={(e) =>
                              setDraftStatuses((prev) => ({
                                ...prev,
                                [profile.id]: { ...entry, checkOutTime: e.target.value },
                              }))
                            }
                            className="rounded border border-slate-300 px-1.5 py-1 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatInr(perDay)}/day
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SECURE AUTOMATED SALARY MANAGEMENT (Full for Finance/Leadership, Self-Only for Staff) */}
      {subTab === 'salary' && (
        <SecureSalaryManagementPanel
          data={data}
          token={token}
          onRefresh={onRefresh}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          hideAuditLogTab
        />
      )}

      {/* TAB 3: SALARY STRUCTURES (Managers Only) */}
      {subTab === 'profiles' && isFullManager && (
        <div className="space-y-4">
          {profileFormOpen && (
            <form
              onSubmit={handleSaveProfile}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {editingProfileId ? 'Edit Staff Salary Structure' : 'Add Staff Salary Structure'}
                </h3>
                <button
                  type="button"
                  onClick={() => setProfileFormOpen(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Full Name</span>
                  <input
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Designation</span>
                  <input
                    required
                    value={profileDesignation}
                    onChange={(e) => setProfileDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Department</span>
                  <input
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Staff Category</span>
                  <select
                    value={profileRoleType}
                    onChange={(e) => setProfileRoleType(e.target.value as StaffRoleCategory)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Admin & Coordinator">Admin &amp; Coordinator</option>
                    <option value="Driver">Driver</option>
                    <option value="Support Staff">Support Staff</option>
                    <option value="Specialist">Specialist</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Basic Monthly Salary (₹)</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={profileBaseSalary}
                    onChange={(e) => setProfileBaseSalary(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Fixed Allowances (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={profileAllowance}
                    onChange={(e) => setProfileAllowance(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">PF / Standard Deduction (₹)</span>
                  <input
                    type="number"
                    min={0}
                    value={profilePf}
                    onChange={(e) => setProfilePf(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="font-medium text-slate-700">Work Days</span>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={profileWorkingDays}
                      onChange={(e) => setProfileWorkingDays(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-medium text-slate-700">Paid Leaves</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={profilePaidLeaves}
                      onChange={(e) => setProfilePaidLeaves(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-2 font-mono"
                    />
                  </label>
                </div>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">Bank Account No.</span>
                  <input
                    value={profileBankAccount}
                    onChange={(e) => setProfileBankAccount(e.target.value)}
                    placeholder="e.g., 50100759555966"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-medium text-slate-700">IFSC Code</span>
                  <input
                    value={profileIfsc}
                    onChange={(e) => setProfileIfsc(e.target.value.toUpperCase())}
                    placeholder="e.g., HDFC0004425"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className="font-medium text-slate-700">Bank Name (auto-inferred from IFSC if blank)</span>
                  <input
                    value={profileBankName}
                    onChange={(e) => setProfileBankName(e.target.value)}
                    placeholder="e.g., HDFC Bank / Sarva Haryana Gramin Bank"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 sm:col-span-2 lg:col-span-4">
                  <span className="font-medium text-slate-700">
                    Salary Revision Reason / Audit Note (optional)
                  </span>
                  <input
                    value={profileRevisionNote}
                    onChange={(e) => setProfileRevisionNote(e.target.value)}
                    placeholder="e.g., Annual 2026-27 increment, promotion adjustment, or allowance revision"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-60"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {savingProfile ? 'Saving...' : 'Save Salary Structure'}
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-3 px-4">Staff &amp; Role</th>
                    <th className="py-3 px-4">Bank Account &amp; IFSC</th>
                    <th className="py-3 px-4 text-right">Basic Salary</th>
                    <th className="py-3 px-4 text-right">Allowance</th>
                    <th className="py-3 px-4 text-right">PF / Deductions</th>
                    <th className="py-3 px-4 text-right">Paid Leave Quota</th>
                    <th className="py-3 px-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-slate-500 mt-0.5">
                          {p.employeeCode} · {p.designation} · {p.roleType}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {p.bankAccountNumber ? (
                          <>
                            <p className="font-mono tabular-nums font-semibold text-slate-800">
                              {p.bankAccountNumber}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono">{p.ifscCode || 'IFSC pending'}</span>
                              {p.bankName ? ` · ${p.bankName}` : ''}
                            </p>
                            {p.bankNote && (
                              <p className="text-[10px] text-amber-700 mt-0.5">{p.bankNote}</p>
                            )}
                          </>
                        ) : (
                          <p className="text-[11px] font-medium text-amber-700">
                            {p.bankNote || 'Bank account / IFSC pending'}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800">
                        {formatInr(p.baseMonthlySalaryInr)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatInr(p.fixedAllowanceInr)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {formatInr(p.pfOrDeductionInr)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {p.paidLeaveAllowance} days / {p.workingDaysPerMonth}d mo
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditProfile(p)}
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                        >
                          Edit Structure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SALARY MODIFICATION AUDIT LOG (Managers Only) */}
      {subTab === 'audit' && isFullManager && (
        <SalaryAuditLogPanel
          auditLogs={salaryAuditLogs}
          schoolName={data.activeSchool.name}
        />
      )}
    </div>
  );
};
