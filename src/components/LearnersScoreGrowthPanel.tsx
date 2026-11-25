import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import type {
  AcademicMonthKey,
  DevelopmentEvidence,
  ExamMark,
  LearnersWeights,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
} from '../types';
import { buildStudentLearnersScoreGrowthSeries } from '../utils/growthReportEngine';

interface LearnersScoreGrowthPanelProps {
  studentId: string;
  studentName: string;
  evidence: DevelopmentEvidence[];
  examMarks: ExamMark[];
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  weights: LearnersWeights;
}

type ChartMode = 'line' | 'bar';

interface SeriesSpec {
  key: 'overallScore' | 'academic' | 'olq' | 'learningHabits' | 'participation' | 'personalGrowth';
  label: string;
  color: string;
  weightLabel?: string;
}

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="font-mono text-slate-400 tabular-nums">—</span>;
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-emerald-700 tabular-nums">
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        +{value}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-amber-700 tabular-nums">
        <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
        {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-slate-600 tabular-nums">
      <ArrowRight className="h-3 w-3 shrink-0" />
      0
    </span>
  );
}

export const LearnersScoreGrowthPanel: React.FC<LearnersScoreGrowthPanelProps> = ({
  studentId,
  studentName,
  evidence,
  examMarks,
  readingReports,
  numeracyReports,
  weights,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [seriesPresetOverride, setSeriesPresetOverride] = useState<'all' | 'core' | null>(null);
  const [focusedMonth, setFocusedMonth] = useState<AcademicMonthKey>('November');

  const series = useMemo(
    () =>
      buildStudentLearnersScoreGrowthSeries({
        studentId,
        evidence,
        examMarks,
        readingReports,
        numeracyReports,
        weights,
      }),
    [studentId, evidence, examMarks, readingReports, numeracyReports, weights],
  );

  const seriesSpecs: SeriesSpec[] = useMemo(
    () => [
      { key: 'overallScore', label: 'Overall Learners Score', color: '#1e3a8a' },
      { key: 'academic', label: 'Academic', color: '#2563eb', weightLabel: `${weights.academic}%` },
      { key: 'olq', label: 'OLQ', color: '#059669', weightLabel: `${weights.olq}%` },
      {
        key: 'learningHabits',
        label: 'Learning Habits',
        color: '#7c3aed',
        weightLabel: `${weights.learningHabits}%`,
      },
      {
        key: 'participation',
        label: 'Participation',
        color: '#d97706',
        weightLabel: `${weights.participation}%`,
      },
      {
        key: 'personalGrowth',
        label: 'Personal Growth',
        color: '#0d9488',
        weightLabel: `${weights.personalGrowth}%`,
      },
    ],
    [weights],
  );

  const multiMonthKeys = useMemo(() => {
    const counts: Record<SeriesSpec['key'], number> = {
      overallScore: 0,
      academic: 0,
      olq: 0,
      learningHabits: 0,
      participation: 0,
      personalGrowth: 0,
    };
    for (const pt of series.points) {
      if (pt.overallScore !== null) counts.overallScore += 1;
      if (pt.academic !== null) counts.academic += 1;
      if (pt.olq !== null) counts.olq += 1;
      if (pt.learningHabits !== null) counts.learningHabits += 1;
      if (pt.participation !== null) counts.participation += 1;
      if (pt.personalGrowth !== null) counts.personalGrowth += 1;
    }
    return counts;
  }, [series.points]);

  const hasFullMultiMonthCoverage =
    multiMonthKeys.olq >= 2 &&
    multiMonthKeys.learningHabits >= 2 &&
    multiMonthKeys.participation >= 2;

  const seriesPreset: 'all' | 'core' =
    seriesPresetOverride ?? (hasFullMultiMonthCoverage ? 'all' : 'core');

  const visibleSpecs = useMemo(() => {
    if (seriesPreset === 'all') return seriesSpecs;
    return seriesSpecs.filter(
      (s) =>
        s.key === 'overallScore' ||
        s.key === 'academic' ||
        s.key === 'personalGrowth' ||
        multiMonthKeys[s.key] >= 2,
    );
  }, [seriesPreset, seriesSpecs, multiMonthKeys]);

  const chartData = useMemo(
    () =>
      series.points.map((pt) => ({
        shortMonth: pt.shortMonth,
        month: pt.month,
        overallScore: pt.overallScore,
        academic: pt.academic,
        olq: pt.olq,
        learningHabits: pt.learningHabits,
        participation: pt.participation,
        personalGrowth: pt.personalGrowth,
      })),
    [series.points],
  );

  const focusedPoint =
    series.points.find((p) => p.month === focusedMonth) || series.points[series.points.length - 1];

  const computeRowDelta = (
    extractor: (p: (typeof series.points)[number]) => number | null,
  ): number | null => {
    const vals = series.points.map(extractor).filter((v): v is number => v !== null);
    if (vals.length === 0) return null;
    if (vals.length === 1) return 0;
    return Math.round((vals[vals.length - 1] - vals[0]) * 10) / 10;
  };

  if (series.recordedCount === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-600">
        No monthly Learners Score evidence, marks, or skill evaluations recorded for {studentName} yet.
      </div>
    );
  }

  return (
    <div
      data-testid="student-learners-growth-panel"
      className="border-t border-slate-200 pt-5 space-y-4"
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-slate-900">
            All-Months Learners Score Growth Comparison (Apr–Nov 2026)
          </h3>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 tabular-nums whitespace-nowrap">
            <span>
              {series.startMonth?.slice(0, 3) || 'Apr'} → {series.latestMonth?.slice(0, 3) || 'Nov'}:
            </span>
            <DeltaBadge value={series.netDelta} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            Side-by-side comparison across all 8 academic months. Unlogged domains are excluded cleanly via weight re-normalization.
          </p>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div
              role="group"
              aria-label="Learners score series filter"
              className="inline-flex rounded-lg bg-slate-100 p-0.5"
            >
              <button
                type="button"
                onClick={() => setSeriesPresetOverride('core')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                  seriesPreset === 'core' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Core Growth
              </button>
              <button
                type="button"
                onClick={() => setSeriesPresetOverride('all')}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                  seriesPreset === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All 6 Series
              </button>
            </div>

            <div
              role="group"
              aria-label="Learners score chart type"
              className="inline-flex rounded-lg bg-slate-100 p-0.5"
            >
              <button
                type="button"
                onClick={() => setChartMode('line')}
                aria-pressed={chartMode === 'line'}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                  chartMode === 'line' ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                <LineChartIcon className="h-3.5 w-3.5" />
                Multi-Series Line
              </button>
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                aria-pressed={chartMode === 'bar'}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                  chartMode === 'bar' ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Grouped Bar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Series All-Months Chart */}
      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-700">
            {visibleSpecs.map((spec) => (
              <span key={spec.key} className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: spec.color }}
                />
                {spec.label}
                {spec.weightLabel ? (
                  <span className="font-mono text-slate-400">({spec.weightLabel})</span>
                ) : null}
              </span>
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums whitespace-nowrap shrink-0">
            Peak: {series.peakMonth?.slice(0, 3) || '—'}{' '}
            {series.peakScore !== null ? `(${series.peakScore}/100)` : ''}
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                {visibleSpecs.map((spec) => (
                  <Line
                    key={spec.key}
                    type="monotone"
                    dataKey={spec.key}
                    name={spec.label}
                    stroke={spec.color}
                    strokeWidth={spec.key === 'overallScore' ? 3 : 1.75}
                    dot={{ r: spec.key === 'overallScore' ? 4 : 3 }}
                    connectNulls={spec.key === 'overallScore' || spec.key === 'academic'}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                {visibleSpecs.map((spec) => (
                  <Bar
                    key={spec.key}
                    dataKey={spec.key}
                    name={spec.label}
                    fill={spec.color}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal 8-Month Side-by-Side Matrix */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Learners Score Metric</th>
              {series.points.map((pt) => {
                const active = pt.month === focusedMonth;
                return (
                  <th key={pt.month} className="px-2.5 py-2.5 text-center font-semibold">
                    <button
                      type="button"
                      onClick={() => setFocusedMonth(pt.month)}
                      className={`rounded px-2 py-0.5 transition-colors whitespace-nowrap ${
                        active ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-slate-200/70'
                      }`}
                    >
                      {pt.shortMonth}
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Apr→Nov Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="bg-blue-50/30 font-semibold">
              <td className="px-4 py-2.5 text-slate-900 whitespace-nowrap">
                Overall Learners Score
              </td>
              {series.points.map((pt) => (
                <td
                  key={pt.month}
                  className={`px-2.5 py-2.5 text-center font-mono tabular-nums ${
                    pt.month === focusedMonth ? 'bg-blue-100/50' : ''
                  } ${
                    pt.overallScore === null
                      ? 'text-slate-300'
                      : pt.overallScore < 65
                        ? 'text-amber-700'
                        : 'text-blue-900'
                  }`}
                >
                  {pt.overallScore !== null ? pt.overallScore : '—'}
                </td>
              ))}
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                <DeltaBadge value={series.netDelta} />
              </td>
            </tr>

            {seriesSpecs.slice(1).map((spec) => {
              const rowDelta = computeRowDelta((p) => p[spec.key]);
              return (
                <tr key={spec.key}>
                  <td className="px-4 py-2 text-slate-700 whitespace-nowrap">
                    {spec.label}{' '}
                    {spec.weightLabel ? (
                      <span className="font-mono text-[10px] text-slate-400">
                        ({spec.weightLabel})
                      </span>
                    ) : null}
                  </td>
                  {series.points.map((pt) => {
                    const val = pt[spec.key];
                    return (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono tabular-nums ${
                          pt.month === focusedMonth ? 'bg-blue-50/40' : ''
                        } ${val === null ? 'text-slate-300' : 'text-slate-800'}`}
                      >
                        {val !== null ? val : '—'}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <DeltaBadge value={rowDelta} />
                  </td>
                </tr>
              );
            })}

            <tr>
              <td className="px-4 py-2 text-slate-600 whitespace-nowrap">Evidence Coverage %</td>
              {series.points.map((pt) => (
                <td
                  key={pt.month}
                  className={`px-2.5 py-2 text-center font-mono text-[11px] text-slate-500 tabular-nums ${
                    pt.month === focusedMonth ? 'bg-blue-50/40' : ''
                  }`}
                >
                  {pt.sourceMode === 'none' ? '—' : `${pt.evidenceCoveragePct}%`}
                </td>
              ))}
              <td className="px-4 py-2 text-right font-mono text-[11px] text-slate-500 tabular-nums">
                {series.recordedCount}/8 mo
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {focusedPoint && focusedPoint.sourceMode !== 'none' && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-900">
              {focusedPoint.month} 2026 Snapshot:
            </span>
            <span className="font-mono font-semibold text-blue-900 tabular-nums">
              Overall: {focusedPoint.overallScore}/100
            </span>
            <span className="text-slate-600">
              {focusedPoint.sourceMode === 'direct'
                ? `${focusedPoint.availableComponents}/5 domains backed by verified classroom/exam evidence`
                : 'Synthesized from UT exam marks & Reading/Numeracy checkpoints (unlogged OLQ/habits excluded cleanly)'}
            </span>
          </div>
          {focusedPoint.momDelta !== null && (
            <span className="font-mono text-slate-600 tabular-nums">
              MoM change: <DeltaBadge value={focusedPoint.momDelta} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
