import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Loader2, Sparkles } from 'lucide-react';
import type { AccountingEntry, ExpenseClassification } from '../types';

export interface MonthlyExpenseBucket {
  monthKey: string;
  monthLabel: string;
  Operational: number;
  Administrative: number;
  Developmental: number;
  Uncategorized: number;
  totalInr: number;
  entryCount: number;
}

export interface ExpenseBreakdownSummary {
  months: MonthlyExpenseBucket[];
  totals: {
    Operational: number;
    Administrative: number;
    Developmental: number;
    Uncategorized: number;
    totalExpenseInr: number;
  };
  counts: {
    Operational: number;
    Administrative: number;
    Developmental: number;
    Uncategorized: number;
    totalExpenseCount: number;
  };
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatShortMonthKey(monthKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey.trim());
  if (!match) return monthKey;
  const yr = match[1].slice(2);
  const mIdx = Number(match[2]) - 1;
  const label = SHORT_MONTHS[mIdx] || match[2];
  return `${label} '${yr}`;
}

export function formatCompactInr(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '₹0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}k`;
  return `${sign}₹${Math.round(abs)}`;
}

export function buildMonthlyExpenseBreakdown(
  entries: AccountingEntry[],
): ExpenseBreakdownSummary {
  const byMonth = new Map<string, MonthlyExpenseBucket>();
  const totals = {
    Operational: 0,
    Administrative: 0,
    Developmental: 0,
    Uncategorized: 0,
    totalExpenseInr: 0,
  };
  const counts = {
    Operational: 0,
    Administrative: 0,
    Developmental: 0,
    Uncategorized: 0,
    totalExpenseCount: 0,
  };

  for (const entry of entries) {
    if (entry.direction !== 'Expense' || entry.status === 'rejected') continue;
    const amt = Math.max(0, Math.round(Number(entry.amountInr) || 0));
    const mKey =
      entry.monthKey && /^\d{4}-\d{2}$/.test(entry.monthKey)
        ? entry.monthKey
        : entry.date.slice(0, 7);

    let bucket = byMonth.get(mKey);
    if (!bucket) {
      bucket = {
        monthKey: mKey,
        monthLabel: formatShortMonthKey(mKey),
        Operational: 0,
        Administrative: 0,
        Developmental: 0,
        Uncategorized: 0,
        totalInr: 0,
        entryCount: 0,
      };
      byMonth.set(mKey, bucket);
    }

    const cls: ExpenseClassification | 'Uncategorized' =
      entry.expenseClassification === 'Operational' ||
      entry.expenseClassification === 'Administrative' ||
      entry.expenseClassification === 'Developmental'
        ? entry.expenseClassification
        : 'Uncategorized';

    bucket[cls] += amt;
    bucket.totalInr += amt;
    bucket.entryCount += 1;

    totals[cls] += amt;
    totals.totalExpenseInr += amt;
    counts[cls] += 1;
    counts.totalExpenseCount += 1;
  }

  const months = Array.from(byMonth.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );

  return { months, totals, counts };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: MonthlyExpenseBucket;
  }>;
  label?: string;
}

const ExpenseTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const bucket = payload[0]?.payload;
  const total = bucket?.totalInr || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-md text-xs min-w-[210px]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 mb-1.5">
        <span className="font-bold text-slate-900">{label}</span>
        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
          {bucket?.entryCount || 0} vouchers
        </span>
      </div>
      <div className="space-y-1">
        {payload.map((item) => {
          const val = Number(item.value) || 0;
          const pct = total > 0 ? Math.round((val / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                ₹{val.toLocaleString('en-IN')}{' '}
                <span className="text-[10px] font-normal text-slate-500">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 font-bold text-slate-900">
        <span>Month Total</span>
        <span className="font-mono tabular-nums">₹{total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

interface MonthlyExpenseBreakdownChartProps {
  entries: AccountingEntry[];
  selectedMonthKey?: string;
  onSelectMonthKey?: (monthKey: string) => void;
  onCategorizeWithGemini?: () => void;
  categorizingAi?: boolean;
  onOpenLedger?: () => void;
}

export const MonthlyExpenseBreakdownChart: React.FC<MonthlyExpenseBreakdownChartProps> = ({
  entries,
  selectedMonthKey,
  onSelectMonthKey,
  onCategorizeWithGemini,
  categorizingAi = false,
  onOpenLedger,
}) => {
  const { months, totals, counts } = useMemo(
    () => buildMonthlyExpenseBreakdown(entries),
    [entries],
  );

  const hasUncategorized = counts.Uncategorized > 0;
  const labeledCount = counts.totalExpenseCount - counts.Uncategorized;

  const pctOfTotal = (val: number) =>
    totals.totalExpenseInr > 0 ? Math.round((val / totals.totalExpenseInr) * 100) : 0;

  return (
    <section
      data-testid="monthly-expense-breakdown-widget"
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      {/* Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#142B46]">
            <BarChart3 className="h-4 w-4 text-emerald-700" />
            Monthly Expense Breakdown
          </div>
          <h3 className="mt-1 font-display text-base font-bold text-slate-900">
            Operational, Administrative &amp; Developmental Spend by Month
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {labeledCount} of {counts.totalExpenseCount} expense vouchers categorized
            {onSelectMonthKey ? ' · Click any month bar to filter the ledger below' : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedMonthKey && selectedMonthKey !== 'ALL' && onSelectMonthKey && (
            <button
              type="button"
              onClick={() => onSelectMonthKey('ALL')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Show All Months
            </button>
          )}
          {onOpenLedger && (
            <button
              type="button"
              onClick={onOpenLedger}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              Open Expense Ledger
            </button>
          )}
          {onCategorizeWithGemini && (
            <button
              type="button"
              disabled={categorizingAi || counts.totalExpenseCount === 0}
              onClick={onCategorizeWithGemini}
              data-testid="chart-gemini-categorize-btn"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-50 whitespace-nowrap"
            >
              {categorizingAi ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-[#D6B66D]" />
              )}
              {categorizingAi
                ? 'Categorizing with Gemini…'
                : hasUncategorized
                  ? `Auto-Categorize ${counts.Uncategorized} Unlabeled`
                  : 'Re-Categorize with Gemini'}
            </button>
          )}
        </div>
      </div>

      {/* Unboxed Tabular Breakdown Strip */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-xl bg-slate-50/60">
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#142B46]" />
            Operational
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            ₹{totals.Operational.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {counts.Operational} rows · {pctOfTotal(totals.Operational)}%
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#D97706]" />
            Administrative
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            ₹{totals.Administrative.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {counts.Administrative} rows · {pctOfTotal(totals.Administrative)}%
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-xs bg-[#059669]" />
            Developmental
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            ₹{totals.Developmental.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {counts.Developmental} rows · {pctOfTotal(totals.Developmental)}%
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-xs ${
                hasUncategorized ? 'bg-slate-400' : 'bg-slate-900'
              }`}
            />
            {hasUncategorized ? 'Pending AI Label' : 'Total Outflow'}
          </div>
          <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            ₹
            {(hasUncategorized ? totals.Uncategorized : totals.totalExpenseInr).toLocaleString(
              'en-IN',
            )}
          </div>
          <div className="text-[11px] font-mono text-slate-500 tabular-nums">
            {hasUncategorized
              ? `${counts.Uncategorized} unlabeled · ${pctOfTotal(totals.Uncategorized)}%`
              : `${counts.totalExpenseCount} expenses across ${months.length} mo`}
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      {months.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center text-xs text-slate-500">
          No expense entries recorded yet. Add an expense voucher or import the monthly expense sheet CSV to view the stacked breakdown.
        </div>
      ) : (
        <div className="mt-4 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={months}
              margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
              onClick={(state) => {
                if (!onSelectMonthKey) return;
                const activePayload = (
                  state as { activePayload?: Array<{ payload?: MonthlyExpenseBucket }> } | null
                )?.activePayload;
                const clickedMonth = activePayload?.[0]?.payload?.monthKey;
                if (clickedMonth) {
                  onSelectMonthKey(selectedMonthKey === clickedMonth ? 'ALL' : clickedMonth);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCompactInr}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip content={<ExpenseTooltip />} cursor={{ fill: '#F1F5F9' }} />
              <Legend
                iconType="square"
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
              />
              <Bar
                dataKey="Operational"
                name="Operational"
                stackId="expenses"
                fill="#142B46"
                maxBarSize={48}
                className={onSelectMonthKey ? 'cursor-pointer' : undefined}
              />
              <Bar
                dataKey="Administrative"
                name="Administrative"
                stackId="expenses"
                fill="#D97706"
                maxBarSize={48}
                className={onSelectMonthKey ? 'cursor-pointer' : undefined}
              />
              <Bar
                dataKey="Developmental"
                name="Developmental"
                stackId="expenses"
                fill="#059669"
                radius={hasUncategorized ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                maxBarSize={48}
                className={onSelectMonthKey ? 'cursor-pointer' : undefined}
              />
              {hasUncategorized && (
                <Bar
                  dataKey="Uncategorized"
                  name="Pending AI Label"
                  stackId="expenses"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  className={onSelectMonthKey ? 'cursor-pointer' : undefined}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
