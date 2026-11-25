import type {
  VcipAttemptRecord,
  VcipClassTier,
  VcipDomainId,
  VcipDomainSummary,
} from '../types/vcip';

export type VcipChartDataMode = 'live' | 'sample';
export type VcipComparisonSeries = 'progress' | 'benchmark' | 'prior' | 'target' | 'none';
export type VcipBarMetric = 'score' | 'accuracy' | 'speed';

export interface VcipChartDomainPoint {
  domain: VcipDomainId;
  axisLabel: 'Fluid' | 'Memory' | 'Speed' | 'Verbal' | 'Quantitative' | 'Spatial';
  fullLabel: string;
  baseline: number;
  prior: number;
  current: number;
  classBenchmark: number;
  target: number;
  accuracyPct: number;
  avgTimeSec: number;
  deltaVsPrior: number | null;
  deltaVsBaseline: number;
  deltaVsBenchmark: number;
  band: string;
  attemptCount: number;
  isPlaceholder: boolean;
}

export interface VcipBenchmarkSummaryStats {
  referenceLabel: string;
  domainsAtOrAbove: number;
  totalDomains: number;
  meanVariance: number;
  topAdvantageDomain: string;
  largestGapDomain: string;
}

export interface VcipImprovementSummary {
  domainsImproved: number;
  totalDomains: number;
  averageGain: number;
  strongestGainDomain: string;
  strongestGainPts: number;
}

export const VCIP_DASHBOARD_AXIS_LABELS: Record<
  VcipDomainId,
  'Fluid' | 'Memory' | 'Speed' | 'Verbal' | 'Quantitative' | 'Spatial'
> = {
  fluid_reasoning: 'Fluid',
  working_memory: 'Memory',
  processing_speed: 'Speed',
  verbal_reasoning: 'Verbal',
  quantitative_reasoning: 'Quantitative',
  spatial_reasoning: 'Spatial',
};

export const VCIP_DOMAIN_ORDER: VcipDomainId[] = [
  'fluid_reasoning',
  'working_memory',
  'processing_speed',
  'verbal_reasoning',
  'quantitative_reasoning',
  'spatial_reasoning',
];

/**
 * Illustrative class-tier placeholder benchmarks (non-clinical, pending representative
 * school-cohort norming). Used strictly for visual developmental benchmarking in VCIP charts.
 */
export const CLASS_TIER_PLACEHOLDER_BENCHMARKS: Record<
  VcipClassTier,
  Record<VcipDomainId, number>
> = {
  foundation_5: {
    fluid_reasoning: 70,
    working_memory: 68,
    processing_speed: 66,
    verbal_reasoning: 72,
    quantitative_reasoning: 70,
    spatial_reasoning: 67,
  },
  middle_6_8: {
    fluid_reasoning: 74,
    working_memory: 72,
    processing_speed: 73,
    verbal_reasoning: 75,
    quantitative_reasoning: 76,
    spatial_reasoning: 71,
  },
  secondary_9_10: {
    fluid_reasoning: 77,
    working_memory: 75,
    processing_speed: 76,
    verbal_reasoning: 78,
    quantitative_reasoning: 79,
    spatial_reasoning: 74,
  },
  senior_11_12: {
    fluid_reasoning: 80,
    working_memory: 77,
    processing_speed: 78,
    verbal_reasoning: 81,
    quantitative_reasoning: 82,
    spatial_reasoning: 76,
  },
};

interface SampleDomainBlueprint {
  baseline: number;
  prior: number;
  current: number;
  accuracyPct: number;
  avgTimeSec: number;
  band: string;
}

/**
 * Deterministic illustrative 3-cycle placeholder profile (Baseline -> Mid-Term -> Latest)
 * for previewing the 6-domain VCIP radar & grouped bar improvement charts.
 */
const ILLUSTRATIVE_SAMPLE_BLUEPRINT: Record<VcipDomainId, SampleDomainBlueprint> = {
  fluid_reasoning: {
    baseline: 68,
    prior: 76,
    current: 84,
    accuracyPct: 86,
    avgTimeSec: 18.4,
    band: 'Strong Developmental Profile',
  },
  working_memory: {
    baseline: 65,
    prior: 72,
    current: 78,
    accuracyPct: 81,
    avgTimeSec: 11.2,
    band: 'Proficient & Growing',
  },
  processing_speed: {
    baseline: 62,
    prior: 69,
    current: 74,
    accuracyPct: 91,
    avgTimeSec: 2.1,
    band: 'Proficient & Growing',
  },
  verbal_reasoning: {
    baseline: 71,
    prior: 77,
    current: 82,
    accuracyPct: 85,
    avgTimeSec: 14.8,
    band: 'Strong Developmental Profile',
  },
  quantitative_reasoning: {
    baseline: 74,
    prior: 81,
    current: 88,
    accuracyPct: 90,
    avgTimeSec: 16.5,
    band: 'Strong Developmental Profile',
  },
  spatial_reasoning: {
    baseline: 59,
    prior: 65,
    current: 71,
    accuracyPct: 75,
    avgTimeSec: 19.6,
    band: 'Steady Developing',
  },
};

export const VCIP_TARGET_BENCHMARK = 75;

/**
 * Resolves whether the dashboard should default to live or illustrative sample data
 * when the user has not explicitly overridden the mode.
 */
export function resolveDefaultChartMode(summaries: VcipDomainSummary[]): VcipChartDataMode {
  const hasAnyLiveScore = summaries.some((s) => s.latestScore !== null);
  return hasAnyLiveScore ? 'live' : 'sample';
}

/**
 * Extracts chronological Baseline (earliest), Prior (penultimate), and Latest scores
 * for a given domain from raw attempts.
 */
function extractDomainTimelineScores(
  attempts: VcipAttemptRecord[],
  domain: VcipDomainId,
  fallbackLatest: number,
  fallbackPrior: number,
): { baseline: number; prior: number; latest: number } {
  const domainAttempts = attempts
    .filter((a) => a.domain === domain)
    .sort((a, b) => a.assessedAt.localeCompare(b.assessedAt));

  if (domainAttempts.length === 0) {
    return {
      baseline: fallbackPrior || fallbackLatest,
      prior: fallbackPrior,
      latest: fallbackLatest,
    };
  }
  if (domainAttempts.length === 1) {
    const score = domainAttempts[0].developmentalScore;
    return { baseline: score, prior: score, latest: score };
  }
  const baseline = domainAttempts[0].developmentalScore;
  const latest = domainAttempts[domainAttempts.length - 1].developmentalScore;
  const prior = domainAttempts[domainAttempts.length - 2].developmentalScore;
  return { baseline, prior, latest };
}

/**
 * Builds normalized 6-domain data points for both the Radar and Grouped Bar charts
 * in canonical order: Fluid, Memory, Speed, Verbal, Quantitative, Spatial.
 */
export function buildVcipChartPoints(
  summaries: VcipDomainSummary[],
  mode: VcipChartDataMode,
  classTier: VcipClassTier = 'middle_6_8',
  attempts: VcipAttemptRecord[] = [],
): VcipChartDomainPoint[] {
  const byDomain = new Map<VcipDomainId, VcipDomainSummary>(
    summaries.map((s) => [s.domain, s]),
  );
  const tierBenchmarks =
    CLASS_TIER_PLACEHOLDER_BENCHMARKS[classTier] ||
    CLASS_TIER_PLACEHOLDER_BENCHMARKS.middle_6_8;

  return VCIP_DOMAIN_ORDER.map((domain) => {
    const summary = byDomain.get(domain);
    const sample = ILLUSTRATIVE_SAMPLE_BLUEPRINT[domain];
    const axisLabel = VCIP_DASHBOARD_AXIS_LABELS[domain];
    const fullLabel = summary?.label || axisLabel;
    const classBenchmark = tierBenchmarks[domain];

    if (mode === 'sample') {
      return {
        domain,
        axisLabel,
        fullLabel,
        baseline: sample.baseline,
        prior: sample.prior,
        current: sample.current,
        classBenchmark,
        target: VCIP_TARGET_BENCHMARK,
        accuracyPct: sample.accuracyPct,
        avgTimeSec: sample.avgTimeSec,
        deltaVsPrior: sample.current - sample.prior,
        deltaVsBaseline: sample.current - sample.baseline,
        deltaVsBenchmark: sample.current - classBenchmark,
        band: sample.band,
        attemptCount: 3,
        isPlaceholder: true,
      };
    }

    const latest = summary?.latestScore ?? 0;
    const priorFallback = summary?.previousScore ?? 0;
    const timeline = extractDomainTimelineScores(attempts, domain, latest, priorFallback);
    const avgTimeSec = summary?.avgResponseTimeMs
      ? Number((summary.avgResponseTimeMs / 1000).toFixed(1))
      : 0;

    return {
      domain,
      axisLabel,
      fullLabel,
      baseline: timeline.baseline,
      prior: timeline.prior,
      current: latest,
      classBenchmark,
      target: VCIP_TARGET_BENCHMARK,
      accuracyPct: summary?.accuracyPct ?? 0,
      avgTimeSec,
      deltaVsPrior: summary?.delta ?? null,
      deltaVsBaseline: latest - timeline.baseline,
      deltaVsBenchmark: latest - classBenchmark,
      band: summary?.bandLabel || 'Not Yet Assessed',
      attemptCount: summary?.attemptsCount ?? 0,
      isPlaceholder: summary?.latestScore === null || summary === undefined,
    };
  });
}

/**
 * Summarizes longitudinal score improvements from Baseline to Latest across the 6 domains.
 */
export function summarizeImprovementOverTime(
  points: VcipChartDomainPoint[],
): VcipImprovementSummary {
  const assessed = points.filter((p) => p.current > 0 || p.baseline > 0);
  const diffs = assessed.map((p) => ({
    label: p.axisLabel,
    gain: p.deltaVsBaseline,
  }));
  const domainsImproved = diffs.filter((d) => d.gain > 0).length;
  const averageGain =
    diffs.length > 0
      ? Math.round(diffs.reduce((acc, d) => acc + d.gain, 0) / diffs.length)
      : 0;
  const best = [...diffs].sort((a, b) => b.gain - a.gain)[0];

  return {
    domainsImproved,
    totalDomains: points.length,
    averageGain,
    strongestGainDomain: best?.label || 'Fluid',
    strongestGainPts: best?.gain ?? 0,
  };
}

/**
 * Computes summary variance metrics across the 6 cognitive domains against the active reference series.
 */
export function buildBenchmarkComparisonStats(
  points: VcipChartDomainPoint[],
  comparison: VcipComparisonSeries,
): VcipBenchmarkSummaryStats {
  const refValue = (pt: VcipChartDomainPoint): number => {
    if (comparison === 'progress') return pt.baseline;
    if (comparison === 'prior') return pt.prior;
    if (comparison === 'target') return pt.target;
    return pt.classBenchmark;
  };

  const referenceLabel =
    comparison === 'progress'
      ? 'Baseline Assessment'
      : comparison === 'prior'
        ? 'Prior Assessment'
        : comparison === 'target'
          ? `Target Band (${VCIP_TARGET_BENCHMARK})`
          : 'Class-Tier Placeholder Benchmark';

  const variances = points.map((pt) => ({
    label: pt.axisLabel,
    diff: pt.current - refValue(pt),
  }));

  const domainsAtOrAbove = variances.filter((v) => v.diff >= 0).length;
  const meanVariance =
    variances.length > 0
      ? Math.round(variances.reduce((acc, v) => acc + v.diff, 0) / variances.length)
      : 0;

  const sortedDesc = [...variances].sort((a, b) => b.diff - a.diff);
  const topAdvantageDomain = sortedDesc[0]?.label || 'Fluid';
  const largestGapDomain = sortedDesc[sortedDesc.length - 1]?.label || 'Spatial';

  return {
    referenceLabel,
    domainsAtOrAbove,
    totalDomains: points.length,
    meanVariance,
    topAdvantageDomain,
    largestGapDomain,
  };
}

/**
 * Returns bar-chart series configuration for the selected metric tab.
 */
export function getBarMetricMeta(metric: VcipBarMetric): {
  dataKey: 'current' | 'accuracyPct' | 'avgTimeSec';
  label: string;
  unit: string;
  yDomain: [number, number | 'auto'];
  barColor: string;
  highlightColor: string;
  subtitle: string;
} {
  if (metric === 'accuracy') {
    return {
      dataKey: 'accuracyPct',
      label: 'Accuracy',
      unit: '%',
      yDomain: [0, 100],
      barColor: '#0f766e',
      highlightColor: '#115e59',
      subtitle: 'Percentage of accurate answers per domain (independent of speed)',
    };
  }
  if (metric === 'speed') {
    return {
      dataKey: 'avgTimeSec',
      label: 'Avg Response Time',
      unit: 's',
      yDomain: [0, 'auto'],
      barColor: '#d97706',
      highlightColor: '#b45309',
      subtitle: 'Mean seconds per item — tracked separately so speed never overrides accuracy',
    };
  }
  return {
    dataKey: 'current',
    label: 'Latest Score',
    unit: '/100',
    yDomain: [0, 100],
    barColor: '#1e40af',
    highlightColor: '#1d4ed8',
    subtitle: 'Grouped multi-cycle comparison across all six cognitive domains (0–100 scale)',
  };
}
