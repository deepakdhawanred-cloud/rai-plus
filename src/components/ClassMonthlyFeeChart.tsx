import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { FeeMonthKey } from '../types';
import type { ClassFeeSummary } from '../utils/financialDashboardEngine';

interface ClassMonthlyFeeChartProps {
  classSummaries: ClassFeeSummary[];
  activeMonth: FeeMonthKey;
  selectedClass: string;
  onSelectClass: (className: string) => void;
}

type ChartPerspective = 'monthly' | 'ytd';

const INR = new Intl.NumberFormat('en-IN');

function formatInrFull(val: number): string {
  return `₹${INR.format(Math.round(val || 0))}`;
}

function formatAxisInr(val: number): string {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
  return `₹${val}`;
}

function shortClassLabel(className: string): string {
  if (className === 'Nursery') return 'Nur';
  if (className.startsWith('Class ')) return `C${className.replace('Class ', '')}`;
  return className;
}

interface ChartDatum {
  className: string;
  shortLabel: string;
  expectedInr: number;
  collectedInr: number;
  gapInr: number;
  attainmentPct: number;
  studentCount: number;
  defaulterCount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
  activeMonth: FeeMonthKey;
  perspective: ChartPerspective;
}

const FeeChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  activeMonth,
  perspective,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  const isMonthly = perspective === 'monthly';

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-sm min-w-[210px]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1.5 mb-2">
        <span className="font-bold text-slate-900">{row.className}</span>
        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
          {row.studentCount} students
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="inline-block h-2 w-2 rounded-xs bg-blue-900" />
            {isMonthly ? `Expected (${activeMonth})` : 'Total Demand'}
          </span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {formatInrFull(row.expectedInr)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="inline-block h-2 w-2 rounded-xs bg-emerald-600" />
            {isMonthly ? `Collected (${activeMonth})` : 'Collected YTD'}
          </span>
          <span className="font-mono font-semibold text-emerald-700 tabular-nums">
            {formatInrFull(row.collectedInr)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-1 mt-1">
          <span className="text-slate-600">Remaining Gap</span>
          <span className="font-mono font-semibold text-amber-700 tabular-nums">
            {formatInrFull(row.gapInr)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">Realization</span>
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {row.attainmentPct}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const ClassMonthlyFeeChart: React.FC<ClassMonthlyFeeChartProps> = ({
  classSummaries,
  activeMonth,
  selectedClass,
  onSelectClass,
}) => {
  const [perspective, setPerspective] = useState<ChartPerspective>('monthly');

  const chartData = useMemo<ChartDatum[]>(() => {
    return classSummaries.map((cls) => {
      if (perspective === 'monthly') {
        return {
          className: cls.className,
          shortLabel: shortClassLabel(cls.className),
          expectedInr: cls.expectedThisMonthInr,
          collectedInr: cls.collectedThisMonthInr,
          gapInr: Math.max(0, cls.expectedThisMonthInr - cls.collectedThisMonthInr),
          attainmentPct: cls.monthAttainmentPct,
          studentCount: cls.studentCount,
          defaulterCount: cls.defaulterCount,
        };
      }
      return {
        className: cls.className,
        shortLabel: shortClassLabel(cls.className),
        expectedInr: cls.totalDemandInr,
        collectedInr: cls.collectedInr,
        gapInr: cls.outstandingInr,
        attainmentPct: cls.collectionPct,
        studentCount: cls.studentCount,
        defaulterCount: cls.defaulterCount,
      };
    });
  }, [classSummaries, perspective]);

  const insights = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalExpected: 0,
        totalCollected: 0,
        highestGapClass: null as ChartDatum | null,
        topRealizationClass: null as ChartDatum | null,
      };
    }
    const totalExpected = chartData.reduce((s, d) => s + d.expectedInr, 0);
    const totalCollected = chartData.reduce((s, d) => s + d.collectedInr, 0);
    const highestGapClass = [...chartData].sort((a, b) => b.gapInr - a.gapInr)[0] ?? null;
    const withActivity = chartData.filter((d) => d.collectedInr > 0 || d.expectedInr > 0);
    const topRealizationClass =
      [...withActivity].sort((a, b) => b.attainmentPct - a.attainmentPct)[0] ?? null;
    return { totalExpected, totalCollected, highestGapClass, topRealizationClass };
  }, [chartData]);

  return (
    <section
      data-testid="class-monthly-fee-chart"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-900" />
            {perspective === 'monthly'
              ? `${activeMonth} 2026 Expected vs Collected Fees by Class`
              : 'Session 2026–27 Total Demand vs Collected YTD by Class'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {perspective === 'monthly'
              ? `Schedule-computed ${activeMonth} expectation compared against actual ${activeMonth} collections per class. Click any class bar to filter the dashboard.`
              : 'Cumulative session gross demand compared against realized YTD receipts per class. Click any class bar to filter.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {selectedClass !== 'ALL' && (
            <button
              type="button"
              onClick={() => onSelectClass('ALL')}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Clear Filter ({selectedClass})
            </button>
          )}
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setPerspective('monthly')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                perspective === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {activeMonth} Expected vs Collected
            </button>
            <button
              type="button"
              onClick={() => setPerspective('ytd')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                perspective === 'ytd'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Session YTD
            </button>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="px-6 py-12 text-center text-xs text-slate-500">
          No class-level fee ledger accounts available to chart for the current selection.
        </div>
      ) : (
        <div className="p-6 space-y-5">
          {/* Quick Trend Insight Strip & Legend */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 text-xs">
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                <span>
                  {perspective === 'monthly' ? `Expected (${activeMonth})` : 'Total Demand'} ·{' '}
                  <strong className="font-mono text-slate-900 tabular-nums">
                    {formatInrFull(insights.totalExpected)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                <span>
                  {perspective === 'monthly' ? `Collected (${activeMonth})` : 'Collected YTD'} ·{' '}
                  <strong className="font-mono text-emerald-700 tabular-nums">
                    {formatInrFull(insights.totalCollected)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              {insights.highestGapClass && insights.highestGapClass.gapInr > 0 && (
                <span>
                  Largest Gap:{' '}
                  <strong className="text-amber-700 font-semibold">
                    {insights.highestGapClass.className}
                  </strong>{' '}
                  <span className="font-mono tabular-nums text-slate-900">
                    ({formatInrFull(insights.highestGapClass.gapInr)})
                  </span>
                </span>
              )}
              {insights.topRealizationClass && (
                <span>
                  Highest Attainment:{' '}
                  <strong className="text-emerald-700 font-semibold">
                    {insights.topRealizationClass.className}
                  </strong>{' '}
                  <span className="font-mono tabular-nums text-slate-900">
                    ({insights.topRealizationClass.attainmentPct}%)
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Recharts Grouped Bar Visualization */}
          <div className="h-[320px] w-full min-w-0 [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatAxisInr}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  content={
                    <FeeChartTooltip activeMonth={activeMonth} perspective={perspective} />
                  }
                />
                <Bar
                  dataKey="expectedInr"
                  name={perspective === 'monthly' ? `Expected (${activeMonth})` : 'Total Demand'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  cursor="pointer"
                  isAnimationActive={false}
                  onClick={(_barData, index) => {
                    const match = typeof index === 'number' ? chartData[index] : undefined;
                    if (match) {
                      onSelectClass(selectedClass === match.className ? 'ALL' : match.className);
                    }
                  }}
                >
                  {chartData.map((entry) => {
                    const dimmed = selectedClass !== 'ALL' && selectedClass !== entry.className;
                    return (
                      <Cell
                        key={`exp-${entry.className}`}
                        fill="#1e3a8a"
                        fillOpacity={dimmed ? 0.28 : 1}
                      />
                    );
                  })}
                </Bar>
                <Bar
                  dataKey="collectedInr"
                  name={perspective === 'monthly' ? `Collected (${activeMonth})` : 'Collected YTD'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                  cursor="pointer"
                  isAnimationActive={false}
                  onClick={(_barData, index) => {
                    const match = typeof index === 'number' ? chartData[index] : undefined;
                    if (match) {
                      onSelectClass(selectedClass === match.className ? 'ALL' : match.className);
                    }
                  }}
                >
                  {chartData.map((entry) => {
                    const dimmed = selectedClass !== 'ALL' && selectedClass !== entry.className;
                    return (
                      <Cell
                        key={`col-${entry.className}`}
                        fill="#059669"
                        fillOpacity={dimmed ? 0.28 : 1}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
};
