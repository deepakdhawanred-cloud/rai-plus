import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Play } from 'lucide-react';
import type {
  VcipAttemptRecord,
  VcipClassTier,
  VcipDomainId,
  VcipDomainSummary,
} from '../../types/vcip';
import {
  buildBenchmarkComparisonStats,
  buildVcipChartPoints,
  getBarMetricMeta,
  resolveDefaultChartMode,
  summarizeImprovementOverTime,
  VCIP_TARGET_BENCHMARK,
  type VcipBarMetric,
  type VcipChartDataMode,
  type VcipChartDomainPoint,
  type VcipComparisonSeries,
} from '../../utils/vcipChartModels';

interface VcipPerformanceChartsProps {
  summaries: VcipDomainSummary[];
  attempts: VcipAttemptRecord[];
  studentName: string;
  classTier: VcipClassTier;
  classTierLabel: string;
  onLaunchDomain: (domain: VcipDomainId) => void;
  onLaunchFullBattery: () => void;
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  payload?: VcipChartDomainPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  metricUnit?: string;
}

const VcipChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  metricUnit = '/100',
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm text-xs space-y-1.5 min-w-[220px]">
      <div className="border-b border-slate-100 pb-1.5">
        <p className="font-bold text-slate-900">{point.fullLabel}</p>
        <p className="text-[11px] text-slate-500">
          {point.isPlaceholder ? 'Illustrative placeholder preview' : point.band}
        </p>
      </div>
      <div className="space-y-1 font-mono tabular-nums">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="font-sans text-slate-600">{entry.name}</span>
            <span className="font-semibold text-slate-900">
              {entry.value}
              {metricUnit}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
          <span className="font-sans text-slate-500">Net Change (vs Baseline)</span>
          <span
            className={`font-semibold ${
              point.deltaVsBaseline >= 0 ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {point.deltaVsBaseline >= 0 ? `+${point.deltaVsBaseline}` : point.deltaVsBaseline} pts
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-[11px]">
          <span className="font-sans text-slate-500">Accuracy · Avg Time</span>
          <span className="text-slate-700">
            {point.accuracyPct}% · {point.avgTimeSec}s
          </span>
        </div>
      </div>
    </div>
  );
};

export const VcipPerformanceCharts: React.FC<VcipPerformanceChartsProps> = ({
  summaries,
  attempts,
  studentName,
  classTier,
  classTierLabel,
  onLaunchDomain,
  onLaunchFullBattery,
}) => {
  const defaultMode = useMemo(() => resolveDefaultChartMode(summaries), [summaries]);
  const [userSelectedMode, setUserSelectedMode] = useState<VcipChartDataMode | null>(null);
  const [comparison, setComparison] = useState<VcipComparisonSeries>('progress');
  const [barMetric, setBarMetric] = useState<VcipBarMetric>('score');
  const [focusedDomain, setFocusedDomain] = useState<VcipDomainId | 'all'>('all');

  const assessedCount = useMemo(
    () => summaries.filter((s) => s.latestScore !== null).length,
    [summaries],
  );
  const activeMode: VcipChartDataMode = userSelectedMode ?? defaultMode;

  const points = useMemo(
    () => buildVcipChartPoints(summaries, activeMode, classTier, attempts),
    [summaries, activeMode, classTier, attempts],
  );

  const benchmarkStats = useMemo(
    () => buildBenchmarkComparisonStats(points, comparison),
    [points, comparison],
  );

  const improvementSummary = useMemo(
    () => summarizeImprovementOverTime(points),
    [points],
  );

  const metricMeta = useMemo(() => getBarMetricMeta(barMetric), [barMetric]);
  const focusedPoint = useMemo(
    () => (focusedDomain === 'all' ? null : points.find((p) => p.domain === focusedDomain) || null),
    [focusedDomain, points],
  );

  const radarRefKey =
    comparison === 'progress'
      ? 'baseline'
      : comparison === 'prior'
        ? 'prior'
        : comparison === 'target'
          ? 'target'
          : 'classBenchmark';

  const radarRefLabel =
    comparison === 'progress'
      ? 'Baseline Score'
      : comparison === 'prior'
        ? 'Prior Assessment'
        : comparison === 'target'
          ? `Target Band (${VCIP_TARGET_BENCHMARK})`
          : 'Class Benchmark';

  const getActiveRefValue = (pt: VcipChartDomainPoint): number => {
    if (comparison === 'progress') return pt.baseline;
    if (comparison === 'prior') return pt.prior;
    if (comparison === 'target') return pt.target;
    return pt.classBenchmark;
  };

  return (
    <section
      aria-label="Six-Domain Cognitive Radar and Performance Improvement Grouped Bar Charts"
      data-testid="vcip-performance-charts"
      className="space-y-4"
    >
      {/* Unified Visualization & Comparison Controls Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Chart data source"
            className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => setUserSelectedMode('live')}
              className={`rounded-md px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                activeMode === 'live'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Profile ({assessedCount}/6)
            </button>
            <button
              type="button"
              onClick={() => setUserSelectedMode('sample')}
              className={`rounded-md px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                activeMode === 'sample'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sample Placeholder
            </button>
          </div>

          <div
            role="group"
            aria-label="Comparison and improvement view"
            className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => setComparison('progress')}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                comparison === 'progress'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Progress Over Time
            </button>
            <button
              type="button"
              onClick={() => setComparison('benchmark')}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                comparison === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              vs Class Benchmark
            </button>
            <button
              type="button"
              onClick={() => setComparison('target')}
              className={`rounded-md px-2.5 py-1.5 font-medium transition-colors whitespace-nowrap ${
                comparison === 'target'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              vs Target ({VCIP_TARGET_BENCHMARK})
            </button>
          </div>
        </div>

        {/* Interactive 6-Domain Focus Filter */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFocusedDomain('all')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
              focusedDomain === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All 6
          </button>
          {points.map((pt) => (
            <button
              key={pt.domain}
              type="button"
              onClick={() =>
                setFocusedDomain((prev) => (prev === pt.domain ? 'all' : pt.domain))
              }
              className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                focusedDomain === pt.domain
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {pt.axisLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Explicit Placeholder Visualization Notice when in Sample mode */}
      {activeMode === 'sample' && (
        <div
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950"
        >
          <div className="flex-1 min-w-[260px]">
            <span className="font-semibold">Illustrative Placeholder Visualization: </span>
            Displaying sample 3-cycle progression (Baseline → Prior → Latest) &amp; {classTierLabel}{' '}
            benchmarks across all six cognitive domains.{' '}
            {assessedCount === 0
              ? `${studentName} has no logged VCIP assessments yet.`
              : `Switch back to Live Profile (${assessedCount}/6) to inspect ${studentName}’s recorded history.`}
          </div>
          <button
            type="button"
            onClick={onLaunchFullBattery}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Play className="h-3 w-3" /> Start Baseline Battery
          </button>
        </div>
      )}

      {/* Primary Two-Column Radar & Grouped Bar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Chart 1: 6-Domain Cognitive Radar Chart */}
        <div
          data-testid="vcip-radar-card"
          className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Six-Domain Cognitive Radar Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fluid · Memory · Speed · Verbal · Quantitative · Spatial ({classTierLabel})
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 shrink-0">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-blue-800" aria-hidden="true" />
                {activeMode === 'sample' ? 'Latest (Sample)' : 'Latest Score'}
              </span>
              {comparison !== 'none' && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-xs ${
                      comparison === 'progress' || comparison === 'prior'
                        ? 'bg-slate-400'
                        : 'bg-teal-600'
                    }`}
                    aria-hidden="true"
                  />
                  {radarRefLabel}
                </span>
              )}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={points} cx="50%" cy="50%" outerRadius="74%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="axisLabel"
                  tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                {comparison !== 'none' && (
                  <Radar
                    name={radarRefLabel}
                    dataKey={radarRefKey}
                    stroke={
                      comparison === 'progress' || comparison === 'prior'
                        ? '#64748b'
                        : '#0f766e'
                    }
                    strokeDasharray={
                      comparison === 'progress' || comparison === 'prior' ? undefined : '4 4'
                    }
                    fill={
                      comparison === 'progress' || comparison === 'prior'
                        ? '#cbd5e1'
                        : '#99f6e4'
                    }
                    fillOpacity={
                      comparison === 'progress' || comparison === 'prior' ? 0.3 : 0.18
                    }
                    strokeWidth={1.75}
                  />
                )}
                <Radar
                  name={activeMode === 'sample' ? 'Latest (Sample)' : 'Latest Score'}
                  dataKey="current"
                  stroke="#1e40af"
                  fill="#2563eb"
                  fillOpacity={0.28}
                  strokeWidth={2.25}
                />
                <Tooltip content={<VcipChartTooltip metricUnit="/100" />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Grouped Bar Chart Tracking Performance Improvements Over Time */}
        <div
          data-testid="vcip-bar-card"
          className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {comparison === 'progress' && barMetric === 'score'
                  ? 'Performance Improvements Over Time'
                  : 'Domain-Wise Performance vs Benchmark'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {comparison === 'progress' && barMetric === 'score'
                  ? 'Grouped Baseline, Prior, and Latest domain scores (0–100 developmental scale)'
                  : metricMeta.subtitle}
              </p>
            </div>

            <div
              role="group"
              aria-label="Bar chart metric"
              className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-[11px] shrink-0"
            >
              <button
                type="button"
                onClick={() => setBarMetric('score')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                  barMetric === 'score'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Score
              </button>
              <button
                type="button"
                onClick={() => setBarMetric('accuracy')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                  barMetric === 'accuracy'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Accuracy %
              </button>
              <button
                type="button"
                onClick={() => setBarMetric('speed')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                  barMetric === 'speed'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Avg Time (s)
              </button>
            </div>
          </div>

          {barMetric === 'score' && comparison === 'progress' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-slate-300" aria-hidden="true" />
                  Baseline
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-blue-400" aria-hidden="true" />
                  Prior
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-xs bg-blue-800" aria-hidden="true" />
                  Latest
                </span>
              </div>
              <span className="font-mono tabular-nums text-slate-500">
                {improvementSummary.domainsImproved}/{improvementSummary.totalDomains} improved ·
                Top growth: {improvementSummary.strongestGainDomain} (
                {improvementSummary.strongestGainPts >= 0
                  ? `+${improvementSummary.strongestGainPts}`
                  : improvementSummary.strongestGainPts}
                )
              </span>
            </div>
          )}

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={points}
                margin={{ top: 10, right: 12, left: -12, bottom: 6 }}
                barGap={3}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="axisLabel"
                  tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }}
                  interval={0}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={metricMeta.yDomain}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<VcipChartTooltip metricUnit={metricMeta.unit} />} />
                {barMetric === 'score' && comparison === 'target' && (
                  <ReferenceLine
                    y={VCIP_TARGET_BENCHMARK}
                    stroke="#0f766e"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target ${VCIP_TARGET_BENCHMARK}`,
                      position: 'insideTopRight',
                      fill: '#0f766e',
                      fontSize: 10,
                    }}
                  />
                )}
                {barMetric === 'score' && comparison === 'progress' && (
                  <>
                    <Bar
                      dataKey="baseline"
                      name="Baseline"
                      fill="#cbd5e1"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={16}
                    />
                    <Bar
                      dataKey="prior"
                      name="Prior"
                      fill="#60a5fa"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={16}
                    />
                  </>
                )}
                {barMetric === 'score' && comparison === 'benchmark' && (
                  <Bar
                    dataKey="classBenchmark"
                    name="Class Benchmark (Placeholder)"
                    fill="#99f6e4"
                    stroke="#0f766e"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                )}
                <Bar
                  dataKey={metricMeta.dataKey}
                  name={
                    barMetric === 'score'
                      ? activeMode === 'sample'
                        ? 'Latest (Sample)'
                        : 'Latest'
                      : metricMeta.label
                  }
                  fill={metricMeta.barColor}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={comparison === 'progress' && barMetric === 'score' ? 18 : 28}
                  onClick={(barData) => {
                    const dom = (barData as { domain?: VcipDomainId } | undefined)?.domain;
                    if (dom) {
                      setFocusedDomain((prev) => (prev === dom ? 'all' : dom));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {points.map((entry) => {
                    const isFocused = focusedDomain === 'all' || focusedDomain === entry.domain;
                    return (
                      <Cell
                        key={entry.domain}
                        fill={
                          focusedDomain === entry.domain
                            ? metricMeta.highlightColor
                            : metricMeta.barColor
                        }
                        fillOpacity={isFocused ? 1 : 0.3}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Six-Domain Improvement & Benchmark Variance Matrix */}
      {comparison !== 'none' && (
        <div
          data-testid="vcip-benchmark-variance-strip"
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                {comparison === 'progress' ? 'Domain Growth Summary' : 'Benchmarking Variance'}
              </span>
              <span aria-hidden="true"> · </span>
              <span>vs {benchmarkStats.referenceLabel}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums text-slate-800">
                {benchmarkStats.domainsAtOrAbove}/{benchmarkStats.totalDomains} domains at or above
                reference
              </span>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600">
              Mean change:{' '}
              <span
                className={`font-semibold ${
                  benchmarkStats.meanVariance >= 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {benchmarkStats.meanVariance >= 0
                  ? `+${benchmarkStats.meanVariance}`
                  : benchmarkStats.meanVariance}{' '}
                pts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {points.map((pt) => {
              const refVal = getActiveRefValue(pt);
              const variance = pt.current - refVal;
              const isSelected = focusedDomain === pt.domain;
              return (
                <button
                  key={pt.domain}
                  type="button"
                  onClick={() =>
                    setFocusedDomain((prev) => (prev === pt.domain ? 'all' : pt.domain))
                  }
                  className={`px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-semibold text-slate-900">{pt.axisLabel}</span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        variance >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {variance >= 0 ? `+${variance}` : variance}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs tabular-nums text-slate-600">
                    <span className="font-bold text-slate-900">{pt.current}</span> vs {refVal}{' '}
                    {comparison === 'progress' ? 'base' : 'ref'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Focused Domain Detail Strip */}
      {focusedPoint && (
        <div
          data-testid="vcip-focused-domain-strip"
          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="space-y-0.5">
            <p className="text-xs text-slate-500">
              Focused Domain ·{' '}
              {focusedPoint.isPlaceholder ? 'Illustrative Placeholder' : focusedPoint.band}
            </p>
            <h3 className="text-sm font-bold text-slate-900">{focusedPoint.fullLabel}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono tabular-nums text-slate-700">
            <div>
              <span className="block font-sans text-[11px] text-slate-500">Baseline → Latest</span>
              <span className="font-bold text-slate-900">
                {focusedPoint.baseline} → {focusedPoint.current}/100
              </span>
            </div>
            <div>
              <span className="block font-sans text-[11px] text-slate-500">Class Benchmark</span>
              <span className="font-semibold text-slate-800">{focusedPoint.classBenchmark}/100</span>
            </div>
            <div>
              <span className="block font-sans text-[11px] text-slate-500">Accuracy</span>
              <span className="font-semibold text-slate-800">{focusedPoint.accuracyPct}%</span>
            </div>
            <div>
              <span className="block font-sans text-[11px] text-slate-500">Avg Speed</span>
              <span className="font-semibold text-slate-800">{focusedPoint.avgTimeSec}s</span>
            </div>
            <button
              type="button"
              onClick={() => onLaunchDomain(focusedPoint.domain)}
              className="font-sans inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
            >
              <Play className="h-3 w-3" /> Assess {focusedPoint.axisLabel}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
