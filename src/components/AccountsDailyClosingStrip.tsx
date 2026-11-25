import React, { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Copy, Download, IndianRupee, Printer } from 'lucide-react';
import type { WorkspaceData } from '../types/workspace';
import { triggerCsvDownload } from '../utils/csvExport';
import { resolveTodayIsoDate } from '../utils/visAcademicProgressEngine';

interface AccountsDailyClosingStripProps {
  data: WorkspaceData;
}

type AgingBucket = 'all' | '30' | '60' | '90';

export const AccountsDailyClosingStrip: React.FC<AccountsDailyClosingStripProps> = ({ data }) => {
  const todayIso = resolveTodayIsoDate();
  const [agingFilter, setAgingFilter] = useState<AgingBucket>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const receipts = data.feeReceipts || [];
  const entries = data.accountingEntries || [];
  const feeAccounts = data.feeAccounts || [];
  const openReminders = useMemo(
    () =>
      (data.feeReminders || [])
        .filter((r) => r.status !== 'Paid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [data.feeReminders],
  );

  // Daily Closing Tally across Cash / UPI / Bank (receipts + fee/misc income entries for today or latest active day)
  const closingSummary = useMemo(() => {
    const todayReceipts = receipts.filter((r) => (r.paidDate || '').slice(0, 10) === todayIso);
    const todayEntries = entries.filter((e) => e.date === todayIso);

    const activeReceipts = todayReceipts.length > 0 ? todayReceipts : receipts.slice(0, 25);
    const activeEntries = todayEntries.length > 0 ? todayEntries : entries;
    const isTodayScoped = todayReceipts.length > 0 || todayEntries.length > 0;

    let cashIn = 0;
    let upiIn = 0;
    let bankIn = 0;
    let expenseOut = 0;

    for (const r of activeReceipts) {
      const mode = (r.paymentMode || '').toLowerCase();
      if (mode.includes('cash')) cashIn += r.amountInr;
      else if (mode.includes('upi')) upiIn += r.amountInr;
      else bankIn += r.amountInr;
    }

    for (const e of activeEntries) {
      if (e.direction === 'Expense') {
        expenseOut += e.amountInr;
      } else if (e.direction === 'Income' && todayReceipts.length === 0) {
        const mode = (e.paymentMode || '').toLowerCase();
        if (mode.includes('cash')) cashIn += e.amountInr;
        else if (mode.includes('upi')) upiIn += e.amountInr;
        else bankIn += e.amountInr;
      }
    }

    const totalInflow = cashIn + upiIn + bankIn;
    return {
      isTodayScoped,
      cashIn,
      upiIn,
      bankIn,
      expenseOut,
      totalInflow,
      netClosing: totalInflow - expenseOut,
      receiptCount: activeReceipts.length,
    };
  }, [receipts, entries, todayIso]);

  // Overdue Fee Aging Queue (estimates aging days from unpaid proportion & monthly fee instalments)
  const overdueAccounts = useMemo(() => {
    const rows = feeAccounts
      .filter((acc) => acc.balanceFeesInr > 0)
      .map((acc) => {
        const totalDemand = Math.max(acc.yearlyDemandInr + acc.lastYearBalanceInr, acc.balanceFeesInr);
        const pctDue = totalDemand > 0 ? Math.round((acc.balanceFeesInr / totalDemand) * 100) : 0;
        const unpaidMonthsApprox =
          acc.perMonthInr > 0 ? Math.ceil(acc.balanceFeesInr / acc.perMonthInr) : 1;
        const estimatedDaysOverdue =
          unpaidMonthsApprox >= 3 || pctDue >= 60
            ? 90
            : unpaidMonthsApprox === 2 || pctDue >= 35
              ? 60
              : 30;
        return {
          ...acc,
          estimatedDaysOverdue,
          pctDue,
        };
      })
      .sort((a, b) => b.balanceFeesInr - a.balanceFeesInr);

    if (agingFilter === '30') return rows.filter((r) => r.estimatedDaysOverdue >= 30);
    if (agingFilter === '60') return rows.filter((r) => r.estimatedDaysOverdue >= 60);
    if (agingFilter === '90') return rows.filter((r) => r.estimatedDaysOverdue >= 90);
    return rows;
  }, [feeAccounts, agingFilter]);

  function handleExportClosingCsv() {
    const scopeLabel = closingSummary.isTodayScoped ? todayIso : 'Active Ledger';
    const headers = ['Metric', 'Amount (INR)', 'Scope'];
    const csvRows = [
      ['Cash Collections', closingSummary.cashIn, scopeLabel],
      ['UPI Collections', closingSummary.upiIn, scopeLabel],
      ['Bank / Cheque Collections', closingSummary.bankIn, scopeLabel],
      ['Total Inflow', closingSummary.totalInflow, scopeLabel],
      ['Expenses Recorded', closingSummary.expenseOut, scopeLabel],
      ['Net Closing Balance', closingSummary.netClosing, scopeLabel],
    ];
    triggerCsvDownload(`daily-closing-tally-${todayIso}.csv`, headers, csvRows);
  }

  function handleCopyReminder(acc: (typeof overdueAccounts)[number]) {
    const msg = `Dear ${acc.fatherName || 'Parent'}, this is a polite fee reminder from ${data.activeSchool.name} for ${acc.studentName} (Class ${acc.className}, Adm ${acc.admissionNo}). Outstanding balance: Rs. ${acc.balanceFeesInr.toLocaleString('en-IN')}. Please clear via UPI/Cash/Bank at the Accounts Office.`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(msg);
    }
    setCopiedId(acc.id);
    window.setTimeout(() => setCopiedId((curr) => (curr === acc.id ? null : curr)), 2200);
  }

  return (
    <section
      data-testid="accounts-daily-closing-strip"
      aria-label="Daily Closing Tally and Overdue Fee Aging"
      className="space-y-5"
    >
      {/* 1. Daily Closing Tally */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <IndianRupee className="h-4 w-4 text-blue-900 shrink-0" />
              Daily Closing Tally ({closingSummary.isTodayScoped ? todayIso : 'Active Period'})
            </h2>
            <p className="text-xs text-slate-500">
              Channel-wise Cash, UPI, and Bank closing summary for end-of-day principal handover.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <button
              type="button"
              onClick={handleExportClosingCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Closing Sheet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="p-4">
            <p className="text-xs font-medium text-slate-500">Cash Inflow</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
              ₹{closingSummary.cashIn.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-medium text-slate-500">UPI / QR Inflow</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
              ₹{closingSummary.upiIn.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-medium text-slate-500">Bank / Cheque</p>
            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
              ₹{closingSummary.bankIn.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4">
            <p className="text-xs font-medium text-slate-500">Expenses Out</p>
            <p className="mt-1 font-mono text-lg font-semibold text-rose-700 tabular-nums">
              ₹{closingSummary.expenseOut.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 col-span-2 lg:col-span-1 bg-slate-50/70">
            <p className="text-xs font-medium text-slate-600">Net Closing</p>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-700 tabular-nums">
              ₹{closingSummary.netClosing.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 1b. Upcoming Scheduled Fee Calendar Reminders */}
      {openReminders.length > 0 && (
        <div
          data-testid="overview-fee-calendar-reminders"
          className="rounded-xl border border-[#D6B66D] bg-[#FAF4EC]/60 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3.5 border-b border-[#D6B66D]/50">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#142B46]">
                <CalendarClock className="h-4 w-4 text-[#7B5D1C] shrink-0" />
                Upcoming Fee Calendar Reminders ({openReminders.length})
              </h3>
              <p className="text-xs text-slate-600">
                Auto-synced from Next Expected Fee dates printed on official Rai Plus fee receipts.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#7B5D1C] tabular-nums whitespace-nowrap">
              Expected: ₹
              {openReminders
                .reduce((sum, r) => sum + (r.expectedAmountInr || 0), 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
          <div className="divide-y divide-[#D6B66D]/30 bg-white/80">
            {openReminders.slice(0, 5).map((rem) => (
              <div
                key={rem.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-[#142B46]">{rem.payerLabel}</span>
                  <span className="text-slate-500 ml-2 tabular-nums">
                    · Paid till {rem.paidTillMonth} · Total pending ₹
                    {rem.pendingBalanceInr.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 tabular-nums">
                  <span className="font-mono font-semibold text-[#7B5D1C]">
                    Due {rem.dueDate}
                  </span>
                  <span className="font-mono font-bold text-[#142B46]">
                    ₹{rem.expectedAmountInr.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Overdue Fee Aging Queue (30 / 60 / 90+ Days) */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Overdue Fee Aging Follow-Up Queue
            </h3>
            <p className="text-xs text-slate-500 tabular-nums">
              {overdueAccounts.length} pending fee account{overdueAccounts.length === 1 ? '' : 's'} matching filter · copy polite reminder text in one click.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All Overdue' },
                { id: '30', label: '30+ Days' },
                { id: '60', label: '60+ Days' },
                { id: '90', label: '90+ Days' },
              ] as Array<{ id: AgingBucket; label: string }>
            ).map((bucket) => (
              <button
                key={bucket.id}
                type="button"
                onClick={() => setAgingFilter(bucket.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition ${
                  agingFilter === bucket.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bucket.label}
              </button>
            ))}
          </div>
        </div>

        {overdueAccounts.length === 0 ? (
          <div className="px-5 py-6 text-xs text-slate-500">
            No overdue fee accounts in this aging bracket.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overdueAccounts.slice(0, 8).map((acc) => (
              <div
                key={acc.id}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs hover:bg-slate-50/60"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="font-semibold text-slate-900">{acc.studentName}</span>
                    <span className="text-slate-500 tabular-nums">
                      · Class {acc.className} · Adm {acc.admissionNo}
                    </span>
                  </div>
                  <div className="mt-0.5 text-slate-500 tabular-nums">
                    Father / Guardian: {acc.fatherName || 'On file'} · {acc.estimatedDaysOverdue}+ days bracket ({acc.pctDue}% remaining)
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-sm font-semibold text-rose-700 tabular-nums">
                    ₹{acc.balanceFeesInr.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyReminder(acc)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    {copiedId === acc.id ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Reminder
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
