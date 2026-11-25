import React, { useEffect, useMemo, useState } from 'react';
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
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Calculator,
  Eye,
  EyeOff,
  TrendingUp,
} from 'lucide-react';
import type {
  GrowthLeaderboardDomain,
  GrowthLeaderboardEntry,
  SchoolGrowthLeaderboards,
} from '../types';
import { sortLeaderboardEntriesForDomain } from '../utils/growthLeaderboardEngine';

interface GrowthLeaderboardCardProps {
  leaderboards: SchoolGrowthLeaderboards;
  activeStudentId?: string | null;
  defaultClassSection?: string;
  isStaff?: boolean;
  onInspectStudent?: (studentId: string) => void;
  onLaunchReadingTest?: () => void;
  onLaunchNumeracyTest?: () => void;
  compactLimit?: number;
}

function SignedDelta({
  value,
  unit = '',
  invertColor = false,
}: {
  value: number | null;
  unit?: string;
  invertColor?: boolean;
}) {
  if (value === null) {
    return <span className="font-mono text-slate-400 tabular-nums">—</span>;
  }
  const positive = value > 0;
  const zero = Math.abs(value) < 0.05;
  if (zero) {
    return (
      <span className="font-mono text-slate-600 tabular-nums">
        0{unit}
      </span>
    );
  }
  const colorClass = positive
    ? invertColor
      ? 'text-amber-700'
      : 'text-emerald-700'
    : invertColor
      ? 'text-emerald-700'
      : 'text-amber-700';

  return (
    <span className={`inline-flex items-center gap-0.5 font-mono font-semibold tabular-nums ${colorClass}`}>
      {positive ? (
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
      )}
      {positive ? '+' : ''}
      {value}
      {unit}
    </span>
  );
}

function resolveEntryDomainMetrics(entry: GrowthLeaderboardEntry, domain: GrowthLeaderboardDomain) {
  if (domain === 'reading') {
    return {
      rank: entry.readingRank,
      fluencyStart: entry.readingWpmStart,
      fluencyNow: entry.readingWpmLatest,
      fluencyGrowth: entry.readingWpmGain,
      fluencyUnit: ' WPM',
      accuracyStart: entry.readingAccuracyStartPct,
      accuracyNow: entry.readingAccuracyLatestPct,
      accuracyGrowth: entry.readingAccuracyGrowthPts,
      compositeGrowth: entry.readingGrowthScore,
    };
  }
  if (domain === 'numeracy') {
    return {
      rank: entry.numeracyRank,
      fluencyStart: entry.tablesFluencyStartPct,
      fluencyNow: entry.tablesFluencyLatestPct,
      fluencyGrowth: entry.tablesFluencyGrowthPts,
      fluencyUnit: '%',
      accuracyStart: entry.numeracyAccuracyStartPct,
      accuracyNow: entry.numeracyAccuracyLatestPct,
      accuracyGrowth: entry.numeracyAccuracyGrowthPts,
      compositeGrowth: entry.numeracyGrowthScore,
    };
  }
  return {
    rank: entry.combinedRank,
    fluencyStart: entry.fluencyStartPct,
    fluencyNow: entry.fluencyLatestPct,
    fluencyGrowth: entry.fluencyGrowthPts,
    fluencyUnit: '%',
    accuracyStart: entry.accuracyStartPct,
    accuracyNow: entry.accuracyLatestPct,
    accuracyGrowth: entry.accuracyGrowthPts,
    compositeGrowth: entry.combinedGrowthScore,
  };
}

export const GrowthLeaderboardCard: React.FC<GrowthLeaderboardCardProps> = ({
  leaderboards,
  activeStudentId,
  defaultClassSection,
  isStaff = false,
  onInspectStudent,
  onLaunchReadingTest,
  onLaunchNumeracyTest,
  compactLimit,
}) => {
  const classSections = leaderboards.classSections;

  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (defaultClassSection && classSections.includes(defaultClassSection)) {
      return defaultClassSection;
    }
    return classSections[0] || '';
  });
  const [domain, setDomain] = useState<GrowthLeaderboardDomain>('combined');
  // Students & parents always receive anonymized peer payloads from the server;
  // staff can preview the anonymized student experience or toggle roster names.
  const [anonymizedPreview, setAnonymizedPreview] = useState<boolean>(true);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  useEffect(() => {
    if (defaultClassSection && classSections.includes(defaultClassSection)) {
      setSelectedClass(defaultClassSection);
    } else if (!classSections.includes(selectedClass) && classSections.length > 0) {
      setSelectedClass(classSections[0]);
    }
  }, [defaultClassSection, classSections, selectedClass]);

  const activeBoard = leaderboards.classLeaderboards[selectedClass] || null;

  const sortedEntries = useMemo(() => {
    if (!activeBoard) return [];
    return sortLeaderboardEntriesForDomain(activeBoard.entries, domain);
  }, [activeBoard, domain]);

  const focusEntry = useMemo(() => {
    if (sortedEntries.length === 0) return null;
    if (activeStudentId) {
      const match = sortedEntries.find(
        (e) => e.studentId === activeStudentId || e.isCurrentUser,
      );
      if (match) return match;
    }
    return sortedEntries.find((e) => e.isCurrentUser) || sortedEntries[0] || null;
  }, [sortedEntries, activeStudentId]);

  const classBenchmarksForDomain = useMemo(() => {
    if (!activeBoard) return null;
    const b = activeBoard.benchmarks;
    if (domain === 'reading') {
      return {
        avgFluency: b.classAvgReadingWpm,
        fluencyUnit: ' WPM',
        avgFluencyGrowth: b.classAvgReadingWpmGain,
        avgAccuracy: b.classAvgReadingAccuracyPct,
        avgAccuracyGrowth: b.classAvgReadingAccuracyGrowthPts,
        fluencyLabel: 'Class Avg Reading Fluency',
        accuracyLabel: 'Class Avg Reading Accuracy',
      };
    }
    if (domain === 'numeracy') {
      return {
        avgFluency: b.classAvgTablesFluencyPct,
        fluencyUnit: '%',
        avgFluencyGrowth: b.classAvgTablesFluencyGrowthPts,
        avgAccuracy: b.classAvgNumeracyAccuracyPct,
        avgAccuracyGrowth: b.classAvgNumeracyAccuracyGrowthPts,
        fluencyLabel: 'Class Avg Tables Fluency',
        accuracyLabel: 'Class Avg Calc Accuracy',
      };
    }
    return {
      avgFluency: b.classAvgFluencyPct,
      fluencyUnit: '%',
      avgFluencyGrowth: b.classAvgFluencyGrowthPts,
      avgAccuracy: b.classAvgAccuracyPct,
      avgAccuracyGrowth: b.classAvgAccuracyGrowthPts,
      fluencyLabel: 'Class Avg Fluency Index',
      accuracyLabel: 'Class Avg Accuracy',
    };
  }, [activeBoard, domain]);

  const comparisonChartData = useMemo(() => {
    if (!focusEntry || !classBenchmarksForDomain) return [];
    const m = resolveEntryDomainMetrics(focusEntry, domain);
    const subjectLabel = !isStaff || focusEntry.isCurrentUser ? 'You' : focusEntry.displayName;
    if (domain === 'reading') {
      return [
        {
          metric: 'Reading WPM',
          [subjectLabel]: m.fluencyNow ?? 0,
          'Class Avg': classBenchmarksForDomain.avgFluency ?? 0,
        },
        {
          metric: 'Accuracy %',
          [subjectLabel]: m.accuracyNow ?? 0,
          'Class Avg': classBenchmarksForDomain.avgAccuracy ?? 0,
        },
        {
          metric: 'WPM Gain',
          [subjectLabel]: Math.max(0, m.fluencyGrowth ?? 0),
          'Class Avg': Math.max(0, classBenchmarksForDomain.avgFluencyGrowth ?? 0),
        },
      ];
    }
    return [
      {
        metric: 'Fluency (%)',
        [subjectLabel]: m.fluencyNow ?? 0,
        'Class Avg': classBenchmarksForDomain.avgFluency ?? 0,
      },
      {
        metric: 'Accuracy (%)',
        [subjectLabel]: m.accuracyNow ?? 0,
        'Class Avg': classBenchmarksForDomain.avgAccuracy ?? 0,
      },
      {
        metric: 'Fluency Growth',
        [subjectLabel]: Math.max(0, m.fluencyGrowth ?? 0),
        'Class Avg': Math.max(0, classBenchmarksForDomain.avgFluencyGrowth ?? 0),
      },
      {
        metric: 'Accuracy Growth',
        [subjectLabel]: Math.max(0, m.accuracyGrowth ?? 0),
        'Class Avg': Math.max(0, classBenchmarksForDomain.avgAccuracyGrowth ?? 0),
      },
    ];
  }, [focusEntry, classBenchmarksForDomain, domain, isStaff]);

  if (!activeBoard || classSections.length === 0) {
    return (
      <section
        aria-label="Class Growth Leaderboard"
        data-testid="class-growth-leaderboard"
        className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-600"
      >
        <h2 className="font-display text-base font-bold text-slate-900">
          Class Growth Leaderboard — Fluency &amp; Accuracy
        </h2>
        <p className="mt-1">
          No reading or numeracy benchmark records are visible for your current role scope yet.
        </p>
      </section>
    );
  }

  const rowCap = showAllRows ? sortedEntries.length : compactLimit ?? 12;
  const visibleRows = sortedEntries.slice(0, rowCap);
  const focusMetrics = focusEntry ? resolveEntryDomainMetrics(focusEntry, domain) : null;
  const chartSubjectKey =
    focusEntry && (!isStaff || focusEntry.isCurrentUser)
      ? 'You'
      : focusEntry?.displayName || 'Learner';

  const focusFluencyDeltaVsClass =
    focusMetrics?.fluencyGrowth !== null &&
    focusMetrics?.fluencyGrowth !== undefined &&
    classBenchmarksForDomain?.avgFluencyGrowth !== null &&
    classBenchmarksForDomain?.avgFluencyGrowth !== undefined
      ? Math.round((focusMetrics.fluencyGrowth - classBenchmarksForDomain.avgFluencyGrowth) * 10) /
        10
      : null;

  const focusAccuracyDeltaVsClass =
    focusMetrics?.accuracyGrowth !== null &&
    focusMetrics?.accuracyGrowth !== undefined &&
    classBenchmarksForDomain?.avgAccuracyGrowth !== null &&
    classBenchmarksForDomain?.avgAccuracyGrowth !== undefined
      ? Math.round((focusMetrics.accuracyGrowth - classBenchmarksForDomain.avgAccuracyGrowth) * 10) /
        10
      : null;

  return (
    <section
      aria-label="Class-Level Anonymized Growth Leaderboard"
      data-testid="class-growth-leaderboard"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="border-b border-slate-200 px-6 py-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-900 shrink-0" />
              {isStaff && !anonymizedPreview
                ? `Class ${activeBoard.classSection} Growth Leaderboard (Staff Roster)`
                : `Class ${activeBoard.classSection} Anonymized Growth Leaderboard`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isStaff && !anonymizedPreview
                ? 'Fluency & accuracy growth relative to class averages (Apr–Nov 2026) · Showing student roster names for faculty review.'
                : 'Fluency & accuracy growth relative to class averages (Apr–Nov 2026) · Peers stay anonymized for healthy competition.'}
            </p>
          </div>

          {(classSections.length > 1 || isStaff) && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {classSections.length > 1 && (
                <select
                  aria-label="Select class for growth leaderboard"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setShowAllRows(false);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  {classSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Class {sec} ({leaderboards.classLeaderboards[sec]?.benchmarks.totalStudents || 0})
                    </option>
                  ))}
                </select>
              )}

              {isStaff && (
                <button
                  type="button"
                  onClick={() => setAnonymizedPreview((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  {anonymizedPreview ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-blue-900" />
                      Show Roster Names
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-600" />
                      Anonymized View
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div
          role="group"
          aria-label="Growth Leaderboard metric focus"
          className="inline-flex flex-wrap sm:flex-nowrap gap-1 rounded-lg bg-slate-100 p-1"
        >
          <button
            type="button"
            onClick={() => setDomain('combined')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              domain === 'combined'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overall Growth
          </button>
          <button
            type="button"
            onClick={() => setDomain('reading')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              domain === 'reading'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Reading Fluency &amp; Accuracy
          </button>
          <button
            type="button"
            onClick={() => setDomain('numeracy')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              domain === 'numeracy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            Tables &amp; Numeracy
          </button>
        </div>
      </div>

      {/* Relative to Class Averages: Personal/Lead Benchmark + Grouped Comparison Chart */}
      {focusEntry && focusMetrics && classBenchmarksForDomain && (
        <div className="border-b border-slate-200 bg-slate-50/50 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="lg:col-span-5 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900">
                {focusEntry.isCurrentUser
                  ? 'Your Growth Relative to Class Average'
                  : isStaff && !anonymizedPreview
                    ? `Benchmark Focus: ${focusEntry.realStudentName || focusEntry.displayName}`
                    : `Benchmark Focus: ${focusEntry.aliasLabel}`}
              </p>
              <div className="flex flex-wrap items-baseline gap-2">
                <p
                  data-testid="growth-leaderboard-rank"
                  className="font-mono text-2xl font-bold text-slate-900 tabular-nums"
                >
                  {focusMetrics.rank !== null
                    ? `#${focusMetrics.rank} of ${activeBoard.benchmarks.rankedStudents}`
                    : 'Awaiting 2nd Month'}
                </p>
                <span className="text-xs text-slate-600">
                  in Class {activeBoard.classSection} · {focusEntry.growthTier}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-200 border-t border-slate-200 text-xs">
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Fluency Progress</p>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {classBenchmarksForDomain.fluencyLabel}:{' '}
                    {classBenchmarksForDomain.avgFluency ?? '—'}
                    {classBenchmarksForDomain.avgFluency !== null
                      ? classBenchmarksForDomain.fluencyUnit
                      : ''}{' '}
                    (Avg growth {classBenchmarksForDomain.avgFluencyGrowth !== null ? `+${classBenchmarksForDomain.avgFluencyGrowth}` : '—'})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900 tabular-nums">
                    {focusMetrics.fluencyNow ?? '—'}
                    {focusMetrics.fluencyNow !== null ? focusMetrics.fluencyUnit : ''}{' '}
                    <span className="text-slate-400 font-normal">
                      (<SignedDelta value={focusMetrics.fluencyGrowth} unit={focusMetrics.fluencyUnit === ' WPM' ? ' WPM' : ' pts'} />)
                    </span>
                  </p>
                  <p className="text-[11px] tabular-nums">
                    vs Class Avg Growth:{' '}
                    <SignedDelta
                      value={focusFluencyDeltaVsClass}
                      unit={focusMetrics.fluencyUnit === ' WPM' ? ' WPM' : ' pts'}
                    />
                  </p>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">Accuracy Progress</p>
                  <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {classBenchmarksForDomain.accuracyLabel}:{' '}
                    {classBenchmarksForDomain.avgAccuracy ?? '—'}% (Avg growth{' '}
                    {classBenchmarksForDomain.avgAccuracyGrowth !== null
                      ? `+${classBenchmarksForDomain.avgAccuracyGrowth}%`
                      : '—'}
                    )
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-900 tabular-nums">
                    {focusMetrics.accuracyNow ?? '—'}%{' '}
                    <span className="text-slate-400 font-normal">
                      (<SignedDelta value={focusMetrics.accuracyGrowth} unit="%" />)
                    </span>
                  </p>
                  <p className="text-[11px] tabular-nums">
                    vs Class Avg Growth:{' '}
                    <SignedDelta value={focusAccuracyDeltaVsClass} unit="%" />
                  </p>
                </div>
              </div>
            </div>

            {(onLaunchReadingTest || onLaunchNumeracyTest) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onLaunchReadingTest && (
                  <button
                    type="button"
                    onClick={onLaunchReadingTest}
                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                  >
                    Boost Reading Fluency
                  </button>
                )}
                {onLaunchNumeracyTest && (
                  <button
                    type="button"
                    onClick={onLaunchNumeracyTest}
                    className="rounded-lg border border-blue-900 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                  >
                    Sprint Timed Tables
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 p-5 flex flex-col justify-between gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-800">
                {chartSubjectKey} vs Class {activeBoard.classSection} Average
              </span>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {activeBoard.benchmarks.topQuartileGrowthCutoff !== null
                  ? `Top 25% growth cutoff: +${activeBoard.benchmarks.topQuartileGrowthCutoff} pts`
                  : `${activeBoard.benchmarks.rankedStudents} active learners ranked`}
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonChartData}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar
                    dataKey={chartSubjectKey}
                    fill="#1e3a8a"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="Class Avg"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Anonymized Class Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 font-semibold">Rank</th>
              <th className="px-4 py-3 font-semibold">
                {isStaff && !anonymizedPreview ? 'Learner (Staff Roster)' : 'Learner (Anonymized)'}
              </th>
              <th className="px-4 py-3 font-semibold text-right">
                {domain === 'reading' ? 'WPM (Apr → Now)' : 'Fluency (Apr → Now)'}
              </th>
              <th className="px-4 py-3 font-semibold text-right">Fluency Growth</th>
              <th className="px-4 py-3 font-semibold text-right">Accuracy (Apr → Now)</th>
              <th className="px-4 py-3 font-semibold text-right">Accuracy Growth</th>
              <th className="px-4 py-3 font-semibold text-right">vs Class Avg Growth</th>
              <th className="px-5 py-3 font-semibold text-right">Growth Momentum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleRows.map((entry) => {
              const m = resolveEntryDomainMetrics(entry, domain);
              const showRealName =
                entry.isCurrentUser || (isStaff && !anonymizedPreview && entry.realStudentName);
              const rowLabel = entry.isCurrentUser
                ? `${entry.displayName} (You)`
                : showRealName
                  ? entry.realStudentName!
                  : entry.aliasLabel;

              const avgGrowthBaseline =
                domain === 'reading'
                  ? classBenchmarksForDomain?.avgFluencyGrowth
                  : domain === 'numeracy'
                    ? classBenchmarksForDomain?.avgFluencyGrowth
                    : activeBoard.benchmarks.classAvgCombinedGrowthScore;
              const entryGrowthVal =
                domain === 'reading'
                  ? m.fluencyGrowth
                  : domain === 'numeracy'
                    ? m.fluencyGrowth
                    : entry.combinedGrowthScore;
              const vsAvgDiff =
                entryGrowthVal !== null &&
                avgGrowthBaseline !== null &&
                avgGrowthBaseline !== undefined
                  ? Math.round((entryGrowthVal - avgGrowthBaseline) * 10) / 10
                  : null;

              return (
                <tr
                  key={entry.studentId}
                  data-testid={entry.isCurrentUser ? 'growth-leaderboard-self-row' : 'growth-leaderboard-peer-row'}
                  className={
                    entry.isCurrentUser
                      ? 'bg-blue-50/70 font-medium'
                      : 'hover:bg-slate-50/80'
                  }
                >
                  <td className="px-5 py-2.5 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {m.rank !== null ? (
                      <span className="inline-flex items-center gap-1">
                        {m.rank <= 3 && <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                        #{m.rank}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {isStaff && !anonymizedPreview && onInspectStudent ? (
                      <button
                        type="button"
                        onClick={() => onInspectStudent(entry.studentId)}
                        className="font-semibold text-blue-900 hover:underline text-left"
                      >
                        {rowLabel}
                      </button>
                    ) : (
                      <span
                        className={
                          entry.isCurrentUser
                            ? 'font-bold text-blue-950'
                            : 'text-slate-700 font-medium'
                        }
                      >
                        {rowLabel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-right text-slate-700 tabular-nums whitespace-nowrap">
                    {m.fluencyStart !== null && m.fluencyNow !== null
                      ? `${m.fluencyStart} → ${m.fluencyNow}${m.fluencyUnit}`
                      : 'Pending'}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <SignedDelta
                      value={m.fluencyGrowth}
                      unit={m.fluencyUnit === ' WPM' ? ' WPM' : ' pts'}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-right text-slate-700 tabular-nums whitespace-nowrap">
                    {m.accuracyStart !== null && m.accuracyNow !== null
                      ? `${m.accuracyStart}% → ${m.accuracyNow}%`
                      : 'Pending'}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <SignedDelta value={m.accuracyGrowth} unit="%" />
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <SignedDelta
                      value={vsAvgDiff}
                      unit={domain === 'reading' ? ' WPM' : ' pts'}
                    />
                  </td>
                  <td className="px-5 py-2.5 text-right whitespace-nowrap text-slate-600">
                    {entry.hasGrowthBaseline ? entry.growthTier : 'Baseline Pending'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedEntries.length > rowCap && (
        <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50/60">
          <span className="font-mono tabular-nums">
            Showing {visibleRows.length} of {sortedEntries.length} class learners
          </span>
          <button
            type="button"
            onClick={() => setShowAllRows(true)}
            className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
          >
            Show All {sortedEntries.length} Classmates →
          </button>
        </div>
      )}
    </section>
  );
};
