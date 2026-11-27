import React, { useMemo, useState } from 'react';
import {
  Download,
  Eye,
  EyeOff,
  History,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type {
  SalaryAuditActionType,
  SalaryModificationAuditRecord,
} from '../types';
import {
  computeSalaryAuditSummary,
  filterSalaryAuditLogs,
  formatAdminRoleLabel,
  formatSalaryAuditActionLabel,
} from '../utils/salaryAuditLog';
import { formatMaskedInr, sanitizeCsvCell } from '../utils/salarySecurityPolicy';

interface SalaryAuditLogPanelProps {
  auditLogs: SalaryModificationAuditRecord[];
  schoolName?: string;
  embedded?: boolean;
}

const ACTION_FILTER_OPTIONS: Array<{ value: SalaryAuditActionType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Changes' },
  { value: 'SALARY_UPDATED', label: 'Salary Revised' },
  { value: 'PROFILE_CREATED', label: 'Staff Added' },
  { value: 'CSV_SHEET_IMPORT', label: 'CSV Import' },
  { value: 'BULK_PAYROLL_UPDATE', label: 'Bulk Payroll' },
];

function formatAuditTimestamp(iso: string): { date: string; time: string } {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return { date: iso.slice(0, 10), time: iso.slice(11, 19) || '00:00:00' };
  }
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  const hh = String(parsed.getHours()).padStart(2, '0');
  const min = String(parsed.getMinutes()).padStart(2, '0');
  const sec = String(parsed.getSeconds()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}:${sec}` };
}

function formatSignedDelta(delta: number, revealed: boolean): string {
  if (!revealed) return '₹••••';
  if (delta === 0) return '₹0';
  const sign = delta > 0 ? '+' : '−';
  return `${sign}₹${Math.abs(Math.round(delta)).toLocaleString('en-IN')}`;
}

export const SalaryAuditLogPanel: React.FC<SalaryAuditLogPanelProps> = ({
  auditLogs,
  schoolName,
  embedded = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<SalaryAuditActionType | 'ALL'>('ALL');
  const [amountsRevealed, setAmountsRevealed] = useState(true);

  const summary = useMemo(() => computeSalaryAuditSummary(auditLogs), [auditLogs]);

  const filteredLogs = useMemo(
    () => filterSalaryAuditLogs(auditLogs, { query: searchQuery, actionType: actionFilter }),
    [auditLogs, searchQuery, actionFilter],
  );

  function handleExportCsv() {
    const headers = [
      'Timestamp (ISO)',
      'Staff Name',
      'Employee Code',
      'Designation',
      'Admin User',
      'Admin Role',
      'Action Type',
      'Source',
      'Previous Basic (INR)',
      'New Basic (INR)',
      'Previous Allowance (INR)',
      'New Allowance (INR)',
      'Previous Deduction (INR)',
      'New Deduction (INR)',
      'Previous Gross (INR)',
      'New Gross (INR)',
      'Gross Delta (INR)',
      'Revision Note',
    ];
    const rows = filteredLogs.map((rec) => [
      rec.timestamp,
      rec.staffName,
      rec.employeeCode || '',
      rec.designation,
      rec.adminUserName,
      formatAdminRoleLabel(rec.adminUserRole),
      formatSalaryAuditActionLabel(rec.actionType),
      rec.sourceLabel,
      rec.previousBaseSalaryInr ?? '',
      rec.newBaseSalaryInr,
      rec.previousAllowanceInr ?? '',
      rec.newAllowanceInr,
      rec.previousDeductionInr ?? '',
      rec.newDeductionInr,
      rec.previousGrossSalaryInr ?? '',
      rec.newGrossSalaryInr,
      rec.deltaGrossInr,
      rec.note || '',
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => sanitizeCsvCell(cell)).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const latestFormatted = summary.latestTimestamp
    ? formatAuditTimestamp(summary.latestTimestamp)
    : null;

  return (
    <section
      aria-label="Salary Modification Audit Log"
      className={
        embedded
          ? 'bg-white overflow-hidden'
          : 'rounded-xl border border-slate-200 bg-white overflow-hidden'
      }
    >
      {/* Header & Controls */}
      <div className="px-5 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-[#142B46] shrink-0" />
            <span>Immutable Salary Governance Trail</span>
            {schoolName && (
              <>
                <span aria-hidden="true">·</span>
                <span>{schoolName}</span>
              </>
            )}
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
            Salary Modification Audit Log
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAmountsRevealed((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {amountsRevealed ? (
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

          <button
            type="button"
            disabled={filteredLogs.length === 0}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-[#142B46]" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* 4-Column Hairline-Divided Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/40">
        <div className="p-4">
          <p className="text-xs text-slate-500">Logged Modifications</p>
          <p className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900">
            {summary.totalChanges}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Showing {filteredLogs.length} matching record{filteredLogs.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500">Net Monthly Revision Delta</p>
          <p
            className={`mt-1 font-mono tabular-nums text-xl font-bold ${
              summary.netMonthlyDeltaInr > 0
                ? 'text-emerald-700'
                : summary.netMonthlyDeltaInr < 0
                  ? 'text-rose-700'
                  : 'text-slate-900'
            }`}
          >
            {formatSignedDelta(summary.netMonthlyDeltaInr, amountsRevealed)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Cumulative gross salary revisions</p>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500">Staff Records Affected</p>
          <p className="mt-1 font-mono tabular-nums text-xl font-bold text-slate-900">
            {summary.uniqueStaffCount}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Distinct staff members with history</p>
        </div>

        <div className="p-4">
          <p className="text-xs text-slate-500">Latest Modification</p>
          <p className="mt-1 font-mono tabular-nums text-base font-bold text-slate-900">
            {latestFormatted ? `${latestFormatted.date} · ${latestFormatted.time}` : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            {summary.latestAdminName ? `By ${summary.latestAdminName}` : 'No changes logged yet'}
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {ACTION_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActionFilter(opt.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                actionFilter === opt.value
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, admin, or note..."
            aria-label="Search salary audit log"
            className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#142B46]"
          />
        </div>
      </div>

      {/* High-Density Audit Log Table */}
      {filteredLogs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Staff Member</th>
                <th className="py-3 px-4 whitespace-nowrap">Admin User</th>
                <th className="py-3 px-4 whitespace-nowrap">Modification</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Previous Salary</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">New Salary</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Change (Δ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((rec) => {
                const ts = formatAuditTimestamp(rec.timestamp);
                const isNew = rec.previousGrossSalaryInr === null;
                const pctChange =
                  !isNew && rec.previousGrossSalaryInr && rec.previousGrossSalaryInr > 0
                    ? Math.round((rec.deltaGrossInr / rec.previousGrossSalaryInr) * 1000) / 10
                    : null;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 align-top">
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{ts.date}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ts.time}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{rec.staffName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {[rec.employeeCode, rec.designation].filter(Boolean).join(' · ')}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{rec.adminUserName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formatAdminRoleLabel(rec.adminUserRole)}
                      </p>
                    </td>

                    <td className="py-3 px-4 max-w-[240px]">
                      <p className="font-semibold text-[#142B46]">
                        {formatSalaryAuditActionLabel(rec.actionType)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{rec.sourceLabel}</p>
                      {rec.note && (
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{rec.note}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      {isNew ? (
                        <span className="text-slate-400">— (New Staff)</span>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-700">
                            {formatMaskedInr(rec.previousGrossSalaryInr!, amountsRevealed)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Base {formatMaskedInr(rec.previousBaseSalaryInr ?? 0, amountsRevealed)} ·
                            Allow {formatMaskedInr(rec.previousAllowanceInr ?? 0, amountsRevealed)} ·
                            Ded {formatMaskedInr(rec.previousDeductionInr ?? 0, amountsRevealed)}
                          </p>
                        </>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <p className="font-bold text-slate-900">
                        {formatMaskedInr(rec.newGrossSalaryInr, amountsRevealed)}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Base {formatMaskedInr(rec.newBaseSalaryInr, amountsRevealed)} · Allow{' '}
                        {formatMaskedInr(rec.newAllowanceInr, amountsRevealed)} · Ded{' '}
                        {formatMaskedInr(rec.newDeductionInr, amountsRevealed)}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      {isNew ? (
                        <p className="font-semibold text-[#142B46]">Initial Entry</p>
                      ) : (
                        <>
                          <p
                            className={`font-bold ${
                              rec.deltaGrossInr > 0
                                ? 'text-emerald-700'
                                : rec.deltaGrossInr < 0
                                  ? 'text-rose-700'
                                  : 'text-slate-600'
                            }`}
                          >
                            {formatSignedDelta(rec.deltaGrossInr, amountsRevealed)}
                          </p>
                          {pctChange !== null && amountsRevealed && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {pctChange > 0 ? `+${pctChange}%` : `${pctChange}%`}
                            </p>
                          )}
                          {rec.deltaGrossInr === 0 &&
                            rec.previousDeductionInr !== null &&
                            rec.previousDeductionInr !== rec.newDeductionInr && (
                              <p className="text-[11px] text-amber-700 mt-0.5">
                                Ded {formatSignedDelta(rec.newDeductionInr - rec.previousDeductionInr, amountsRevealed)}
                              </p>
                            )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center space-y-2">
          <History className="h-6 w-6 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">
            {auditLogs.length === 0
              ? 'No salary modifications recorded yet'
              : 'No audit entries match your current filter'}
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {auditLogs.length === 0
              ? 'Every update made via Salary Structures, CSV imports, or Bulk Payroll sheets is automatically logged here with timestamp, admin user, and previous/new salary values.'
              : 'Try clearing the search term or switching back to All Changes.'}
          </p>
          {auditLogs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActionFilter('ALL');
              }}
              className="mt-2 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </section>
  );
};
