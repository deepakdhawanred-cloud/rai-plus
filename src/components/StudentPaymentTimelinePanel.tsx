import React, { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarClock, FileDown, Printer, Receipt, X } from 'lucide-react';
import type { FeeLedgerAccount, FeeMonthKey, FeePaymentReceipt } from '../types';
import {
  buildStudentPaymentTimeline,
  type StudentPaymentTimelineAnalysis,
} from '../utils/financialDashboardEngine';
import { exportStudentPaymentTimelinePdf } from '../utils/financialPdfExporter';
import { pushToast } from './ToastProvider';

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

function getNatureToneClass(tone: StudentPaymentTimelineAnalysis['paymentNatureTone']): string {
  switch (tone) {
    case 'positive':
      return 'text-emerald-700';
    case 'warning':
      return 'text-amber-700';
    case 'critical':
      return 'text-rose-700';
    default:
      return 'text-slate-700';
  }
}

interface StudentPaymentMiniTimelineProps {
  account: FeeLedgerAccount;
  activeMonth: FeeMonthKey;
  onOpenTimeline?: (account: FeeLedgerAccount) => void;
  onExportPdf?: (account: FeeLedgerAccount) => void;
}

/**
 * Compact 12-month payment rhythm strip rendered directly inside table rows
 * so principals & accountants can read a student's payment nature at a glance.
 */
export const StudentPaymentMiniTimeline: React.FC<StudentPaymentMiniTimelineProps> = ({
  account,
  activeMonth,
  onOpenTimeline,
  onExportPdf,
}) => {
  const timeline = useMemo(
    () => buildStudentPaymentTimeline({ account, activeMonth }),
    [account, activeMonth],
  );

  const maxMonthly = useMemo(
    () => Math.max(1, ...timeline.months.map((m) => m.paidInr)),
    [timeline.months],
  );

  return (
    <div className="min-w-[190px] space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-semibold leading-tight ${getNatureToneClass(timeline.paymentNatureTone)}`}
        >
          {timeline.paymentNature}
        </span>
        <span className="font-mono text-[10px] text-slate-500 tabular-nums whitespace-nowrap">
          {timeline.activePaymentMonthsCount}/{timeline.monthsElapsed}m paid
        </span>
      </div>

      {/* 12-month Apr–Mar visual rhythm strip */}
      <div
        className="grid grid-cols-12 gap-0.5 items-end h-5"
        aria-label={`April to March payment timeline for ${account.studentName}`}
      >
        {timeline.months.map((m) => {
          const barHeightPct =
            m.paidInr > 0 ? Math.max(38, Math.round((m.paidInr / maxMonthly) * 100)) : 28;
          const colorClass =
            m.status === 'Paid'
              ? 'bg-emerald-600'
              : m.status === 'Covered Ahead'
                ? 'bg-emerald-200'
                : m.status === 'Missed'
                  ? 'bg-rose-300'
                  : 'bg-slate-200';

          return (
            <div
              key={m.monthKey}
              title={`${m.monthKey}: ${m.paidInr > 0 ? formatInr(m.paidInr) : '₹0'} (${m.status})`}
              className="flex flex-col items-center justify-end h-full"
            >
              <div
                className={`w-full rounded-[1px] ${colorClass} ${
                  m.isCurrentMonth ? 'ring-1 ring-slate-900' : ''
                }`}
                style={{ height: `${barHeightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
        <span className="font-mono tabular-nums truncate">
          {timeline.lastPaymentMonth
            ? `Last: ${timeline.lastPaymentMonth.slice(0, 3)} (${formatInr(timeline.lastPaymentAmountInr)})`
            : 'No payment yet'}
        </span>
        {(onOpenTimeline || onExportPdf) && (
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            {onOpenTimeline && (
              <button
                type="button"
                onClick={() => onOpenTimeline(account)}
                className="font-semibold text-blue-900 hover:underline"
              >
                Timeline
              </button>
            )}
            {onOpenTimeline && onExportPdf && (
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
            )}
            {onExportPdf && (
              <button
                type="button"
                onClick={() => onExportPdf(account)}
                title={`Download ${account.studentName} payment timeline PDF`}
                className="font-semibold text-slate-600 hover:text-slate-900 hover:underline"
              >
                PDF
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface StudentPaymentTimelineContentProps {
  account: FeeLedgerAccount;
  activeMonth: FeeMonthKey;
  receipts?: FeePaymentReceipt[];
  onRecordPayment?: (account: FeeLedgerAccount) => void;
  onPrintReceipt?: (receipt: FeePaymentReceipt) => void;
}

/**
 * Full year-long payment timeline view with behavioral payment-nature summary,
 * Recharts monthly vs cumulative expected chart, 12-month ledger grid, and receipts.
 */
export const StudentPaymentTimelineContent: React.FC<StudentPaymentTimelineContentProps> = ({
  account,
  activeMonth,
  receipts = [],
  onRecordPayment,
  onPrintReceipt,
}) => {
  const timeline = useMemo(
    () => buildStudentPaymentTimeline({ account, activeMonth, receipts }),
    [account, activeMonth, receipts],
  );

  const chartData = useMemo(
    () =>
      timeline.months.map((m) => ({
        month: m.shortLabel,
        fullMonth: m.monthKey,
        paidInr: m.paidInr,
        cumulativePaidInr: m.cumulativePaidInr,
        cumulativeExpectedInr: m.cumulativeExpectedInr,
        status: m.status,
      })),
    [timeline.months],
  );

  const matchingReceipts = useMemo(
    () =>
      receipts.filter((rcp) =>
        rcp.allocations?.some((al) => al.accountId === account.id),
      ),
    [receipts, account.id],
  );

  const dm = timeline.defaulterMetrics;

  return (
    <div className="space-y-6" data-testid="student-payment-timeline-panel">
      {/* Payment Nature Summary */}
      <div className="border-b border-slate-200 pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Payment Nature Assessment</span>
              <span aria-hidden="true">·</span>
              <span>Plan: {account.scheduleCadence}</span>
              <span aria-hidden="true">·</span>
              <span>Session Apr–Mar (Active: {activeMonth})</span>
            </div>
            <h4
              className={`font-display text-lg font-bold ${getNatureToneClass(timeline.paymentNatureTone)}`}
            >
              {timeline.paymentNature}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {timeline.paymentNatureSummary}
            </p>
          </div>

          {onRecordPayment && account.balanceFeesInr > 0 && (
            <button
              type="button"
              onClick={() => onRecordPayment(account)}
              className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap shrink-0"
            >
              Record Payment
            </button>
          )}
        </div>

        {/* 4 Clean Aligned Tabular KPI Metrics (single surface, subtle dividers) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50/50">
          <div className="p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Paid YTD / Total Fee</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums">
              {formatInr(account.paidAmountInr)}{' '}
              <span className="font-normal text-slate-500">/ {formatInr(dm.grossFeeInr)}</span>
            </p>
            <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
              {dm.percentPaid}% paid · {dm.percentLeft}% left
            </p>
          </div>

          <div className="p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Paying Frequency</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums">
              {timeline.activePaymentMonthsCount} of {timeline.monthsElapsed} months
            </p>
            <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
              Avg {formatInr(timeline.averageInstallmentInr)} / payment
            </p>
          </div>

          <div className="p-3.5">
            <p className="text-[11px] font-medium text-slate-500">Last Payment Recorded</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums">
              {timeline.lastPaymentMonth
                ? `${timeline.lastPaymentMonth} · ${formatInr(timeline.lastPaymentAmountInr)}`
                : 'None Yet'}
            </p>
            <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
              {timeline.largestPaymentMonth
                ? `Peak: ${formatInr(timeline.largestPaymentInr)} (${timeline.largestPaymentMonth.slice(0, 3)})`
                : '0 installments logged'}
            </p>
          </div>

          <div className="p-3.5">
            <p className="text-[11px] font-medium text-slate-500">
              Status Through {activeMonth}
            </p>
            <p
              className={`mt-1 font-mono text-sm font-bold tabular-nums ${
                dm.hasPaidTillCurrentMonth ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {dm.hasPaidTillCurrentMonth
                ? `Paid Till ${dm.paidTillMonthLabel}`
                : `${formatInr(dm.overdueTillCurrentMonthInr)} Overdue`}
            </p>
            <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
              {timeline.consecutiveUnpaidMonths > 0
                ? `${timeline.consecutiveUnpaidMonths}m unpaid streak · max gap ${timeline.longestUnpaidGapMonths}m`
                : `Longest gap: ${timeline.longestUnpaidGapMonths}m`}
            </p>
          </div>
        </div>
      </div>

      {/* Recharts Year-Long Payment Timeline: Monthly Bars + Cumulative Paid vs Expected Line */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-bold text-slate-900">
              Year-Long Payment Trajectory (April – March)
            </h5>
            <p className="text-[11px] text-slate-500">
              Monthly payment deposits compared against cumulative paid and expected fee curve.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-600 inline-block" />
              Monthly Paid
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-blue-900 inline-block" />
              Cumulative Paid
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-amber-600 inline-block" />
              Expected Due
            </span>
          </div>
        </div>

        <div className="h-56 w-full rounded-lg border border-slate-200 bg-white p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#475569' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
                }
                width={54}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: unknown, name: unknown) => {
                  const num = typeof value === 'number' ? value : Number(value) || 0;
                  const label =
                    name === 'paidInr'
                      ? 'Paid This Month'
                      : name === 'cumulativePaidInr'
                        ? 'Cumulative Paid'
                        : 'Cumulative Expected';
                  return [formatInr(num), label];
                }}
                labelFormatter={(label: unknown) => `Month: ${String(label)}`}
              />
              <Bar
                dataKey="paidInr"
                fill="#059669"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
              <Line
                type="monotone"
                dataKey="cumulativePaidInr"
                stroke="#1E3A8A"
                strokeWidth={2}
                dot={{ r: 3, fill: '#1E3A8A' }}
              />
              <Line
                type="monotone"
                dataKey="cumulativeExpectedInr"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-Month Breakdown Table (Explicit Text Status — Never Hue-Only) */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-slate-900">
          Month-by-Month Payment Log (April – March)
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {timeline.months.map((m) => {
            const statusTextClass =
              m.status === 'Paid'
                ? 'text-emerald-700'
                : m.status === 'Covered Ahead'
                  ? 'text-blue-900'
                  : m.status === 'Missed'
                    ? 'text-rose-700'
                    : 'text-slate-400';

            return (
              <div
                key={m.monthKey}
                className={`rounded-lg border p-2.5 ${
                  m.isCurrentMonth
                    ? 'border-blue-900 bg-blue-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-slate-800">{m.shortLabel}</span>
                  <span className={`font-medium ${statusTextClass}`}>
                    {m.status === 'Covered Ahead' ? 'Covered' : m.status}
                  </span>
                </div>
                <p
                  className={`mt-1.5 font-mono text-xs font-bold tabular-nums ${
                    m.paidInr > 0 ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {formatInr(m.paidInr)}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500 tabular-nums truncate">
                  Cum: {formatInr(m.cumulativePaidInr)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Receipts Chronology (when live receipts exist) */}
      {matchingReceipts.length > 0 && (
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-emerald-700" />
              Recorded Official Receipts ({matchingReceipts.length})
            </h5>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-2 font-semibold">Date &amp; Receipt</th>
                  <th className="px-3.5 py-2 font-semibold">Month / Coverage</th>
                  <th className="px-3.5 py-2 font-semibold">Mode</th>
                  <th className="px-3.5 py-2 font-semibold text-right">Amount</th>
                  {onPrintReceipt && <th className="px-3.5 py-2 font-semibold text-right">Receipt</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchingReceipts.map((rcp) => {
                  const allocForStudent = rcp.allocations.find((al) => al.accountId === account.id);
                  return (
                    <tr key={rcp.id} className="hover:bg-slate-50">
                      <td className="px-3.5 py-2 font-mono tabular-nums whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{rcp.paidDate}</span>
                        <span className="text-slate-500 ml-1.5">{rcp.receiptNo}</span>
                      </td>
                      <td className="px-3.5 py-2 text-slate-700">
                        {rcp.coveredMonths && rcp.coveredMonths.length > 0
                          ? rcp.coveredMonths.join(', ')
                          : rcp.monthKey}
                      </td>
                      <td className="px-3.5 py-2 text-slate-600 whitespace-nowrap">
                        {rcp.paymentMode}
                      </td>
                      <td className="px-3.5 py-2 font-mono font-semibold text-emerald-700 text-right tabular-nums whitespace-nowrap">
                        {formatInr(allocForStudent?.allocatedInr ?? rcp.amountInr)}
                      </td>
                      {onPrintReceipt && (
                        <td className="px-3.5 py-2 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onPrintReceipt(rcp)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-900 hover:underline"
                          >
                            <Printer className="h-3 w-3" />
                            Print
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {account.expectedScheduleNote && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
          <CalendarClock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>
            Ledger Schedule Note: <strong className="text-slate-700">{account.expectedScheduleNote}</strong>
            {account.remarks ? ` · ${account.remarks}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

interface StudentPaymentTimelineModalProps {
  account: FeeLedgerAccount;
  schoolName: string;
  schoolCode?: string;
  session?: string;
  generatedBy?: string;
  activeMonth: FeeMonthKey;
  receipts?: FeePaymentReceipt[];
  onClose: () => void;
  onRecordPayment?: (account: FeeLedgerAccount) => void;
  onPrintReceipt?: (receipt: FeePaymentReceipt) => void;
}

export const StudentPaymentTimelineModal: React.FC<StudentPaymentTimelineModalProps> = ({
  account,
  schoolName,
  schoolCode,
  session,
  generatedBy,
  activeMonth,
  receipts = [],
  onClose,
  onRecordPayment,
  onPrintReceipt,
}) => {
  const handleDownloadPdf = () => {
    const filename = exportStudentPaymentTimelinePdf({
      account,
      schoolName,
      schoolCode,
      session,
      activeMonth,
      receipts,
      generatedBy,
    });
    pushToast(`Saved ${filename} for ${account.studentName}.`, 'success', {
      title: 'Payment Timeline PDF Downloaded',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-payment-timeline-title"
      data-testid="student-payment-timeline-modal"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{schoolName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{account.admissionNo}</span>
              <span aria-hidden="true">·</span>
              <span>{account.className}</span>
            </div>
            <h3
              id="student-payment-timeline-title"
              className="font-display text-lg font-bold text-slate-900 mt-0.5 truncate"
            >
              {account.studentName} — Annual Fee Payment Timeline
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Guardian: {account.fatherName}
              {account.contactNo ? ` · ${account.contactNo}` : ''}
              {account.address ? ` · ${account.address}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="download-student-timeline-pdf-btn"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46] bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50 whitespace-nowrap"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close payment timeline dialog"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <StudentPaymentTimelineContent
            account={account}
            activeMonth={activeMonth}
            receipts={receipts}
            onRecordPayment={onRecordPayment}
            onPrintReceipt={onPrintReceipt}
          />
        </div>
      </div>
    </div>
  );
};
