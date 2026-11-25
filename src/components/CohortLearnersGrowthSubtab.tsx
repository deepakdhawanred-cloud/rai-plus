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
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LineChart as LineChartIcon,
} from 'lucide-react';
import type { AcademicMonthKey, LearnersWeights } from '../types';
import type { CohortLearnersGrowthMatrix } from '../utils/growthReportEngine';
import { ACTIVE_SESSION_MONTHS } from '../utils/visAcademicProgressEngine';

export type CohortLearnersMetricKey =
  | 'overallScore'
  | 'academic'
  | 'olq'
  | 'learningHabits'
  | 'participation'
  | 'personalGrowth';

interface CohortLearnersGrowthSubtabProps {
  matrix: CohortLearnersGrowthMatrix;
  weights: LearnersWeights;
  learnersMetric: CohortLearnersMetricKey;
  highlightMonth: AcademicMonthKey;
  onSelectHighlightMonth: (month: AcademicMonthKey) => void;
  rowLimit: number;
  onLoadMore: () => void;
}

function DeltaPill({ value }: { value: number | null }) {
  if (value === null) return <span className="font-mono text-slate-300 tabular-nums">—</span>;
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
    <span className="inline-flex items-center gap-0.5 font-mono text-slate-500 tabular-nums">
      <ArrowRight className="h-3 w-3 shrink-0" />
      0
    </span>
  );
}

export const CohortLearnersGrowthSubtab: React.FC<CohortLearnersGrowthSubtabProps> = ({
  matrix,
  weights,
  learnersMetric,
  highlightMonth,
  onSelectHighlightMonth,
  rowLimit,
  onLoadMore,
}) => {
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');
  const [seriesPresetOverride, setSeriesPresetOverride] = useState<'all' | 'core' | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const seriesSpecs = useMemo(
    () => [
      { key: 'avgOverallScore' as const, label: 'Cohort Overall Score', color: '#1e3a8a' },
      {
        key: 'avgAcademic' as const,
        label: `Academic (${weights.academic}%)`,
        color: '#2563eb',
      },
      { key: 'avgOlq' as const, label: `OLQ (${weights.olq}%)`, color: '#059669' },
      {
        key: 'avgLearningHabits' as const,
        label: `Learning Habits (${weights.learningHabits}%)`,
        color: '#7c3aed',
      },
      {
        key: 'avgParticipation' as const,
        label: `Participation (${weights.participation}%)`,
        color: '#d97706',
      },
      {
        key: 'avgPersonalGrowth' as const,
        label: `Personal Growth (${weights.personalGrowth}%)`,
        color: '#0d9488',
      },
    ],
    [weights],
  );

  const monthCounts = useMemo(() => {
    const counts = {
      avgOverallScore: 0,
      avgAcademic: 0,
      avgOlq: 0,
      avgLearningHabits: 0,
      avgParticipation: 0,
      avgPersonalGrowth: 0,
    };
    for (const pt of matrix.monthlyCohortSeries) {
      if (pt.avgOverallScore !== null) counts.avgOverallScore += 1;
      if (pt.avgAcademic !== null) counts.avgAcademic += 1;
      if (pt.avgOlq !== null) counts.avgOlq += 1;
      if (pt.avgLearningHabits !== null) counts.avgLearningHabits += 1;
      if (pt.avgParticipation !== null) counts.avgParticipation += 1;
      if (pt.avgPersonalGrowth !== null) counts.avgPersonalGrowth += 1;
    }
    return counts;
  }, [matrix.monthlyCohortSeries]);

  const hasFullMultiMonthCoverage =
    monthCounts.avgOlq >= 2 &&
    monthCounts.avgLearningHabits >= 2 &&
    monthCounts.avgParticipation >= 2;

  const seriesPreset: 'all' | 'core' =
    seriesPresetOverride ?? (hasFullMultiMonthCoverage ? 'all' : 'core');

  const visibleSpecs = useMemo(() => {
    if (seriesPreset === 'all') return seriesSpecs;
    return seriesSpecs.filter(
      (s) =>
        s.key === 'avgOverallScore' ||
        s.key === 'avgAcademic' ||
        s.key === 'avgPersonalGrowth' ||
        monthCounts[s.key] >= 2,
    );
  }, [seriesPreset, seriesSpecs, monthCounts]);

  const highlightedCohort =
    matrix.monthlyCohortSeries.find((m) => m.month === highlightMonth) ||
    matrix.monthlyCohortSeries[matrix.monthlyCohortSeries.length - 1];

  const metricLabel: Record<CohortLearnersMetricKey, string> = {
    overallScore: 'Overall Learners Score',
    academic: 'Academic Score',
    olq: 'OLQ Score',
    learningHabits: 'Learning Habits',
    participation: 'Participation',
    personalGrowth: 'Personal Growth',
  };

  return (
    <div data-testid="cohort-learners-growth-subtab" className="space-y-4">
      {/* Cohort KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Students Tracked (Apr–Nov)</p>
          <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
            {matrix.totalTrackedStudents}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {matrix.improvedCount} showing net growth
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">
            Latest Cohort Mean ({matrix.latestMonthLabel?.slice(0, 3) || 'Nov'})
          </p>
          <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
            {matrix.latestAvgOverallScore}/100
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            Academic mean: {matrix.latestAvgAcademic !== null ? `${matrix.latestAvgAcademic}/100` : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Apr → Nov Avg Growth</p>
          <div className="text-2xl mt-1">
            <DeltaPill value={matrix.avgNetDelta} />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Cohort session improvement</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Below 65 Support (Latest)</p>
          <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
            {matrix.belowBenchmarkLatestCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {highlightMonth.slice(0, 3)} assessed: {highlightedCohort?.assessedCount ?? 0}
          </p>
        </div>
      </div>

      {/* Multi-Series All-Months Trajectory Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              Cohort Learners Score Growth Trajectory — April to November 2026
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side multi-series comparison across all 8 academic months. Toggle between Multi-Series Line and Grouped Bar or click any month pill to inspect its snapshot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
            <div
              role="group"
              aria-label="Cohort learners series preset"
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
              aria-label="Cohort learners chart type"
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

        {/* Inline Color Legend + Month Highlight Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700">
            {visibleSpecs.map((spec) => (
              <span key={spec.key} className="inline-flex items-center gap-1.5 font-medium">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: spec.color }}
                />
                {spec.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-0.5 self-start shrink-0">
            {ACTIVE_SESSION_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onSelectHighlightMonth(m)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                  highlightMonth === m ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'line' ? (
              <LineChart
                data={matrix.monthlyCohortSeries}
                margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
              >
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
                    strokeWidth={spec.key === 'avgOverallScore' ? 3 : 1.75}
                    dot={{ r: spec.key === 'avgOverallScore' ? 4 : 3 }}
                    connectNulls={spec.key === 'avgOverallScore' || spec.key === 'avgAcademic'}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={matrix.monthlyCohortSeries}
                margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
              >
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

        {highlightedCohort && (
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-900">
              {highlightedCohort.month} 2026 Cohort Snapshot:
            </span>
            <div className="flex flex-wrap items-center gap-4 font-mono text-slate-700 tabular-nums">
              <span>Assessed: {highlightedCohort.assessedCount}</span>
              <span>
                Overall:{' '}
                {highlightedCohort.avgOverallScore !== null
                  ? `${highlightedCohort.avgOverallScore}/100`
                  : '—'}
              </span>
              <span>
                Academic:{' '}
                {highlightedCohort.avgAcademic !== null ? `${highlightedCohort.avgAcademic}` : '—'}
              </span>
              <span>
                OLQ: {highlightedCohort.avgOlq !== null ? `${highlightedCohort.avgOlq}` : '—'}
              </span>
              <span>
                Habits:{' '}
                {highlightedCohort.avgLearningHabits !== null
                  ? `${highlightedCohort.avgLearningHabits}`
                  : '—'}
              </span>
              <span className="text-amber-700">
                Support (&lt;65): {highlightedCohort.belowBenchmarkCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal 8-Month Student Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              All-Months Learners Score Matrix — {metricLabel[learnersMetric]}
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing April to November 2026 side by side for every student. Click any student name to expand full component history.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            Showing {Math.min(rowLimit, matrix.studentRows.length)} of {matrix.studentRows.length}{' '}
            students
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Student</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Class</th>
                {ACTIVE_SESSION_MONTHS.map((m) => (
                  <th
                    key={m}
                    className={`px-2.5 py-3 font-semibold text-right whitespace-nowrap ${
                      m === highlightMonth ? 'bg-blue-50 text-blue-900' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectHighlightMonth(m)}
                      className="hover:underline"
                    >
                      {m.slice(0, 3)}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Apr→Nov Δ</th>
                <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.studentRows.slice(0, rowLimit).map((row) => {
                const isExpanded = expandedStudentId === row.student.id;
                return (
                  <React.Fragment key={row.student.id}>
                    <tr className={`hover:bg-slate-50 ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStudentId((prev) =>
                              prev === row.student.id ? null : row.student.id,
                            )
                          }
                          className="inline-flex items-center gap-1.5 text-left hover:text-blue-900"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <span>{row.student.name}</span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                        {row.student.classSection}
                      </td>
                      {ACTIVE_SESSION_MONTHS.map((m) => {
                        const pt = row.byMonth[m];
                        const val = pt ? pt[learnersMetric] : null;
                        const lowScore = val !== null && val < 65;
                        return (
                          <td
                            key={m}
                            className={`px-2.5 py-2.5 font-mono text-right tabular-nums whitespace-nowrap ${
                              m === highlightMonth ? 'bg-blue-50/40 font-semibold' : ''
                            } ${
                              val === null
                                ? 'text-slate-300'
                                : lowScore
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-slate-800'
                            }`}
                          >
                            {val !== null ? val : '—'}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <DeltaPill value={row.netDelta} />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-slate-600 tabular-nums whitespace-nowrap">
                        {row.latestCoveragePct}%
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={12} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                            {ACTIVE_SESSION_MONTHS.map((m) => {
                              const pt = row.byMonth[m];
                              return (
                                <div
                                  key={m}
                                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] space-y-1"
                                >
                                  <div className="flex items-center justify-between font-bold text-slate-900">
                                    <span>{m.slice(0, 3)}</span>
                                    <span className="font-mono text-blue-900 tabular-nums">
                                      {pt?.overallScore !== null && pt?.overallScore !== undefined
                                        ? pt.overallScore
                                        : '—'}
                                    </span>
                                  </div>
                                  {pt && pt.sourceMode !== 'none' ? (
                                    <>
                                      <p className="font-mono text-slate-600 tabular-nums">
                                        Acad: {pt.academic ?? '—'} · OLQ: {pt.olq ?? '—'}
                                      </p>
                                      <p className="font-mono text-slate-600 tabular-nums">
                                        Hab: {pt.learningHabits ?? '—'} · Part:{' '}
                                        {pt.participation ?? '—'}
                                      </p>
                                      <p className="font-mono text-slate-500 tabular-nums">
                                        PG: {pt.personalGrowth ?? '—'} · Cov {pt.evidenceCoveragePct}%
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-slate-400">No evidence</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {matrix.studentRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-8 text-center text-slate-500">
                    No student Learners Score records match the active filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {matrix.studentRows.length > rowLimit && (
          <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {rowLimit} of {matrix.studentRows.length} students
            </span>
            <button
              type="button"
              onClick={onLoadMore}
              className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
            >
              Load 100 more →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
