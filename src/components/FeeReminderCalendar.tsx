import React, { useMemo, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  IndianRupee,
  Printer,
} from 'lucide-react';
import type { FeePaymentReceipt, FeeReminderCalendarEvent } from '../types';
import { apiRequest } from '../utils/api';
import { pushToast } from './ToastProvider';

interface FeeReminderCalendarProps {
  reminders: FeeReminderCalendarEvent[];
  receipts: FeePaymentReceipt[];
  schoolName: string;
  token: string;
  canManage: boolean;
  onRefresh: () => Promise<void>;
  onPrintReceipt?: (receipt: FeePaymentReceipt) => void;
  onCollectFromReminder?: (reminder: FeeReminderCalendarEvent) => void;
}

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function getDefaultCalendarMonth(reminders: FeeReminderCalendarEvent[]): {
  year: number;
  month: number;
} {
  const open = reminders
    .filter((r) => r.status !== 'Paid' && /^\d{4}-\d{2}-\d{2}$/.test(r.dueDate))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (open.length > 0) {
    const [y, m] = open[0].dueDate.split('-').map(Number);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      return { year: y, month: m - 1 };
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export const FeeReminderCalendar: React.FC<FeeReminderCalendarProps> = ({
  reminders,
  receipts,
  schoolName,
  token,
  canManage,
  onRefresh,
  onPrintReceipt,
  onCollectFromReminder,
}) => {
  const initialMonth = useMemo(() => getDefaultCalendarMonth(reminders), [reminders]);
  const [viewYear, setViewYear] = useState<number>(initialMonth.year);
  const [viewMonth, setViewMonth] = useState<number>(initialMonth.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const receiptsById = useMemo(() => {
    const map = new Map<string, FeePaymentReceipt>();
    for (const r of receipts) {
      map.set(r.id, r);
      map.set(r.receiptNo, r);
    }
    return map;
  }, [receipts]);

  const remindersByDate = useMemo(() => {
    const map = new Map<string, FeeReminderCalendarEvent[]>();
    for (const rem of reminders) {
      if (!rem.dueDate) continue;
      const list = map.get(rem.dueDate) || [];
      list.push(rem);
      map.set(rem.dueDate, list);
    }
    return map;
  }, [reminders]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ iso: string | null; day: number | null }> = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ iso: null, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        iso: `${viewYear}-${pad2(viewMonth + 1)}-${pad2(d)}`,
        day: d,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ iso: null, day: null });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const activeMonthPrefix = `${viewYear}-${pad2(viewMonth + 1)}`;
  const monthReminders = useMemo(
    () =>
      reminders
        .filter((r) => r.dueDate.startsWith(activeMonthPrefix))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [reminders, activeMonthPrefix],
  );

  const visibleList = useMemo(() => {
    if (selectedDate) {
      return remindersByDate.get(selectedDate) || [];
    }
    const openAll = reminders
      .filter((r) => r.status !== 'Paid')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return openAll.length > 0 ? openAll : monthReminders;
  }, [selectedDate, remindersByDate, reminders, monthReminders]);

  const monthExpectedTotal = monthReminders
    .filter((r) => r.status !== 'Paid')
    .reduce((sum, r) => sum + (r.expectedAmountInr || 0), 0);

  function goPrevMonth() {
    setSelectedDate(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    setSelectedDate(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  async function handleStatusUpdate(rem: FeeReminderCalendarEvent, status: 'Reminded' | 'Paid') {
    setBusyId(rem.id);
    try {
      await apiRequest(
        `/api/finance/reminders/${rem.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        status === 'Reminded'
          ? `Marked ${rem.payerLabel} (${rem.dueDate}) as Reminded.`
          : `Marked ${rem.payerLabel} fee reminder as Paid.`,
        'success',
      );
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to update fee reminder.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  function handleCopyReminderMessage(rem: FeeReminderCalendarEvent) {
    const planText = rem.scheduleCadence ? ` (${rem.scheduleCadence} Plan${rem.installmentLabel ? ` · ${rem.installmentLabel}` : ''})` : '';
    const msg = `Dear Parent, reminder from ${schoolName} (Rai Plus Accounts): Next expected fee of Rs. ${rem.expectedAmountInr.toLocaleString('en-IN')}${planText} for ${rem.payerLabel} (Fee paid till ${rem.paidTillMonth}, total pending balance Rs. ${rem.pendingBalanceInr.toLocaleString('en-IN')}) is scheduled for ${rem.dueDate}. Ref Receipt: ${rem.receiptNo}.`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(msg);
    }
    setCopiedId(rem.id);
    pushToast('Fee reminder message copied to clipboard.', 'info');
    window.setTimeout(() => setCopiedId((curr) => (curr === rem.id ? null : curr)), 2200);
  }

  return (
    <section
      data-testid="fee-reminder-calendar-section"
      aria-label="Next Expected Fee Reminder Calendar"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header Bar */}
      <div className="border-b border-slate-200 bg-[#FAF4EC]/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-[#142B46] flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#7B5D1C] shrink-0" />
            Next Expected Fee Reminder Calendar
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Every next expected fee date added on a receipt automatically updates this calendar for follow-up reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[11px] text-slate-500">
              {MONTH_NAMES[viewMonth]} {viewYear} Expected
            </p>
            <p className="font-mono text-sm font-bold text-[#142B46] tabular-nums">
              {formatInr(monthExpectedTotal)}
            </p>
          </div>
          <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous calendar month"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-l-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-[#142B46] whitespace-nowrap">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next calendar month"
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-r-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Calendar Grid + Selected Date / Upcoming Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left: Monthly Calendar Grid */}
        <div className="lg:col-span-7 p-5">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell.iso || cell.day === null) {
                return <div key={`empty-${idx}`} className="h-16 rounded-lg bg-slate-50/40" />;
              }
              const dayReminders = remindersByDate.get(cell.iso) || [];
              const openDayReminders = dayReminders.filter((r) => r.status !== 'Paid');
              const isSelected = selectedDate === cell.iso;
              const dayTotal = openDayReminders.reduce((s, r) => s + (r.expectedAmountInr || 0), 0);

              return (
                <button
                  key={cell.iso}
                  type="button"
                  data-testid={`calendar-day-${cell.iso}`}
                  onClick={() => setSelectedDate((prev) => (prev === cell.iso ? null : cell.iso))}
                  className={`h-16 rounded-lg border p-1.5 text-left flex flex-col justify-between transition-colors ${
                    isSelected
                      ? 'border-[#142B46] bg-[#142B46] text-[#F3E6D8]'
                      : openDayReminders.length > 0
                        ? 'border-[#D6B66D] bg-[#FCF7EE] hover:bg-[#F3E6D8]/80 text-[#142B46]'
                        : dayReminders.length > 0
                          ? 'border-emerald-200 bg-emerald-50/50 text-slate-700'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-semibold tabular-nums">{cell.day}</span>
                    {openDayReminders.length > 0 && (
                      <span
                        className={`font-mono text-[10px] font-bold px-1 rounded tabular-nums ${
                          isSelected
                            ? 'bg-[#D6B66D] text-[#142B46]'
                            : 'bg-[#142B46] text-[#D6B66D]'
                        }`}
                      >
                        {openDayReminders.length}
                      </span>
                    )}
                  </div>
                  {openDayReminders.length > 0 ? (
                    <span
                      className={`font-mono text-[10px] font-semibold truncate tabular-nums ${
                        isSelected ? 'text-[#D6B66D]' : 'text-[#7B5D1C]'
                      }`}
                    >
                      {formatInr(dayTotal)}
                    </span>
                  ) : dayReminders.length > 0 ? (
                    <span className="text-[10px] font-medium text-emerald-700 truncate">Paid</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date / All Upcoming Reminders */}
        <div className="lg:col-span-5 p-5 flex flex-col">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#142B46]">
                {selectedDate ? `Reminders on ${selectedDate}` : 'Scheduled Fee Reminders'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {visibleList.length} reminder{visibleList.length === 1 ? '' : 's'} shown
              </p>
            </div>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap"
              >
                Show All Upcoming
              </button>
            )}
          </div>

          {visibleList.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 space-y-1">
              <BellRing className="h-5 w-5 text-slate-400 mx-auto" />
              <p>
                {selectedDate
                  ? `No fee reminders scheduled for ${selectedDate}.`
                  : 'No fee reminders scheduled yet. Enter a Next Expected Fee Date when issuing a receipt to populate this calendar automatically.'}
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {visibleList.map((rem) => {
                const linkedReceipt = receiptsById.get(rem.receiptId) || receiptsById.get(rem.receiptNo);
                return (
                  <div
                    key={rem.id}
                    data-testid={`fee-reminder-item-${rem.receiptNo}`}
                    className="rounded-xl border border-slate-200 bg-[#FAF4EC]/55 p-3.5 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#142B46] truncate">
                          {rem.payerLabel}
                          {rem.scheduleCadence && (
                            <span className="ml-1.5 text-[10px] font-semibold text-[#7B5D1C]">
                              · {rem.scheduleCadence}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 tabular-nums">
                          Due <strong className="font-mono text-[#7B5D1C]">{rem.dueDate}</strong>
                          {rem.installmentLabel ? ` · ${rem.installmentLabel}` : ''} · Paid till{' '}
                          <strong>{rem.paidTillMonth}</strong> · Ref {rem.receiptNo}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                          rem.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rem.status === 'Reminded'
                              ? 'bg-blue-100 text-[#142B46]'
                              : 'bg-[#F3E6D8] text-[#7B5D1C]'
                        }`}
                      >
                        {rem.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] border-t border-slate-200/80 pt-2">
                      <span className="text-slate-600 tabular-nums">
                        Next Expected:{' '}
                        <strong className="font-mono text-[#142B46]">
                          {formatInr(rem.expectedAmountInr)}
                        </strong>
                      </span>
                      <span className="text-slate-600 tabular-nums">
                        Total Pending:{' '}
                        <strong className="font-mono text-[#7B5D1C]">
                          {formatInr(rem.pendingBalanceInr)}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {canManage && rem.status !== 'Paid' && onCollectFromReminder && (
                        <button
                          type="button"
                          onClick={() => onCollectFromReminder(rem)}
                          className="inline-flex items-center gap-1 rounded-md bg-[#142B46] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap"
                        >
                          <IndianRupee className="h-3 w-3 text-[#D6B66D]" />
                          Collect Fee
                        </button>
                      )}
                      {canManage && rem.status === 'Scheduled' && (
                        <button
                          type="button"
                          disabled={busyId === rem.id}
                          onClick={() => void handleStatusUpdate(rem, 'Reminded')}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
                        >
                          <BellRing className="h-3 w-3" />
                          Mark Reminded
                        </button>
                      )}
                      {linkedReceipt && onPrintReceipt && (
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(linkedReceipt)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                        >
                          <Printer className="h-3 w-3" />
                          Receipt
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyReminderMessage(rem)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                      >
                        {copiedId === rem.id ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy SMS
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
