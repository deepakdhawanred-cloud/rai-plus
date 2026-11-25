import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import type {
  ConsistencyStreakSummary,
  StreakBadge,
  StreakBadgeId,
} from '../utils/consistencyStreakEngine';

interface ConsistencyStreakCardProps {
  studentName: string;
  summary: ConsistencyStreakSummary;
  compact?: boolean;
  onOpenNotebookReport?: () => void;
}

function renderBadgeIcon(badgeId: StreakBadgeId, unlocked: boolean) {
  const cls = unlocked ? 'h-4 w-4' : 'h-4 w-4 text-slate-400';
  switch (badgeId) {
    case 'first_spark':
      return <Flame className={unlocked ? 'h-4 w-4 text-amber-700' : cls} />;
    case 'weekly_steady':
      return <Star className={unlocked ? 'h-4 w-4 text-blue-900' : cls} />;
    case 'neatness_vanguard':
      return <Sparkles className={unlocked ? 'h-4 w-4 text-emerald-700' : cls} />;
    case 'zero_gap_champion':
      return <ShieldCheck className={unlocked ? 'h-4 w-4 text-teal-700' : cls} />;
    case 'fortnight_scholar':
      return <Crown className={unlocked ? 'h-4 w-4 text-indigo-800' : cls} />;
    default:
      return <Award className={cls} />;
  }
}

function badgeAccentRing(accent: StreakBadge['accent'], unlocked: boolean): string {
  if (!unlocked) return 'bg-slate-100 border-slate-200';
  switch (accent) {
    case 'amber':
      return 'bg-amber-50 border-amber-200';
    case 'blue':
      return 'bg-blue-50 border-blue-200';
    case 'emerald':
      return 'bg-emerald-50 border-emerald-200';
    case 'teal':
      return 'bg-teal-50 border-teal-200';
    case 'indigo':
      return 'bg-indigo-50 border-indigo-200';
  }
}

export const ConsistencyStreakCard: React.FC<ConsistencyStreakCardProps> = ({
  studentName,
  summary,
  compact = false,
  onOpenNotebookReport,
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'points'>('overview');

  // Default selected day: most recent day with notebook activity, else latest day
  const defaultSelectedDate = useMemo(() => {
    const withEntries = [...summary.recentTimeline]
      .reverse()
      .find((d) => d.entriesCount > 0);
    return (
      withEntries?.date ||
      summary.recentTimeline[summary.recentTimeline.length - 1]?.date ||
      ''
    );
  }, [summary.recentTimeline]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultSelectedDate);

  useEffect(() => {
    setSelectedDate(defaultSelectedDate);
  }, [summary.studentId, defaultSelectedDate]);

  const activeDay = useMemo(() => {
    return (
      summary.recentTimeline.find((d) => d.date === selectedDate) ||
      summary.recentTimeline.find((d) => d.date === defaultSelectedDate) ||
      summary.recentTimeline[summary.recentTimeline.length - 1] ||
      null
    );
  }, [summary.recentTimeline, selectedDate, defaultSelectedDate]);

  return (
    <section
      aria-label="Notebook Consistency Streak"
      data-testid="consistency-streak-card"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Notebook Consistency Streak</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {studentName} · Tier: <strong className="text-slate-800">{summary.tierTitle}</strong> ·{' '}
            {summary.earnedBadgesCount}/{summary.badges.length} badges unlocked ·{' '}
            <span
              className={
                summary.isStreakActive
                  ? 'font-semibold text-emerald-700'
                  : 'font-semibold text-amber-700'
              }
            >
              {summary.streakStatusLabel}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Streak &amp; Badges
            </button>
            <button
              type="button"
              onClick={() => setViewMode('points')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                viewMode === 'points'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Points Ledger ({summary.points.totalPoints} pts)
            </button>
          </div>

          {onOpenNotebookReport && (
            <button
              type="button"
              onClick={onOpenNotebookReport}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-900 hover:text-blue-900 transition-colors whitespace-nowrap"
            >
              Notebook Report →
            </button>
          )}
        </div>
      </div>

      {/* Top 3-Column KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/40">
        <div className="p-5 space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-semibold">Active Consistency Streak</span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
              Best: {summary.longestStreakDays} {summary.longestStreakDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p
            data-testid="consistency-streak-days"
            className="font-mono text-3xl font-bold text-amber-700 tabular-nums"
          >
            {summary.currentStreakDays}{' '}
            <span className="text-sm font-semibold text-slate-600">
              {summary.currentStreakDays === 1 ? 'Day' : 'Days'}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            Consecutive Mon–Sat school days · Sundays excluded automatically
          </p>
        </div>

        <div className="p-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
            <span className="font-semibold">Consistency Points</span>
            <span className="font-mono text-[11px] font-semibold text-blue-900 tabular-nums">
              {summary.tierTitle}
            </span>
          </div>
          <p
            data-testid="consistency-streak-points"
            className="font-mono text-3xl font-bold text-blue-900 tabular-nums"
          >
            {summary.points.totalPoints}{' '}
            <span className="text-sm font-semibold text-slate-600">pts</span>
          </p>
          <div className="space-y-1 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-900 transition-all duration-300"
                style={{ width: `${summary.tierProgressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 tabular-nums">
              {summary.nextTierTitle
                ? `${summary.pointsToNextTier} pts to reach ${summary.nextTierTitle}`
                : 'Highest institutional consistency tier reached'}
            </p>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
              <span className="font-semibold">Timely &amp; Complete Rate</span>
              <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                {summary.completeDaysCount}/{summary.totalCheckedDaysCount} days
              </span>
            </div>
            <p
              data-testid="consistency-timely-rate"
              className="font-mono text-3xl font-bold text-emerald-700 tabular-nums"
            >
              {summary.timelyRatePct}
              <span className="text-sm font-semibold text-slate-600">%</span>
            </p>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {summary.encouragementMessage}
          </p>
        </div>
      </div>

      {viewMode === 'points' ? (
        /* Points Ledger Breakdown View */
        <div data-testid="consistency-points-ledger" className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                How Your Consistency Points Are Calculated
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every verified, complete notebook day adds base points, consecutive streak bonuses,
                and presentation rewards automatically.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-blue-900 tabular-nums shrink-0">
              Total: {summary.points.totalPoints} pts
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Reward Category</th>
                  <th className="px-4 py-2.5 font-semibold">Rule</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Earned</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    Complete Notebook Days
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    +20 pts per school day with all checked notebooks complete
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    {summary.completeDaysCount} days
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    +{summary.points.submissionBasePoints}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    Consecutive Streak Bonus
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    +5 pts per consecutive day step (up to +25 bonus/day)
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    Peak {summary.longestStreakDays}d
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-amber-700 tabular-nums">
                    +{summary.points.streakMultiplierPoints}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    Grade A &amp; Readability Excellence
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    +10 bonus pts when all notebooks on a day earn Grade A + Readability
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    {summary.gradeAExcellenceDaysCount} days
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    +{summary.points.excellenceBonusPoints}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    Virtual Badge Milestones
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    One-time milestone rewards for unlocked consistency badges
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    {summary.earnedBadgesCount} / {summary.badges.length}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-900 tabular-nums">
                    +{summary.points.badgeRewardPoints}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {/* 10-School-Day Interactive Streak Calendar Strip */}
          <div className={compact ? 'p-5 space-y-3' : 'p-6 space-y-4'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Recent 10 School-Day Submission Strip (Mon–Sat)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select any day below to inspect checked subjects, chapters, and points earned.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-rose-700">
                  <AlertCircle className="h-3.5 w-3.5" /> Incomplete
                </span>
                <span className="text-slate-400">— No Check</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {summary.recentTimeline.map((day) => {
                const isSelected = activeDay?.date === day.date;
                const statusStyle =
                  day.status === 'complete'
                    ? isSelected
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-700'
                      : 'border-emerald-200 bg-emerald-50/60 text-emerald-900 hover:border-emerald-400'
                    : day.status === 'incomplete'
                      ? isSelected
                        ? 'border-rose-700 bg-rose-50 text-rose-950 ring-1 ring-rose-700'
                        : 'border-rose-200 bg-rose-50/60 text-rose-900 hover:border-rose-400'
                      : isSelected
                        ? 'border-blue-900 bg-slate-100 text-slate-900 ring-1 ring-blue-900'
                        : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:border-slate-300';

                return (
                  <button
                    key={day.date}
                    type="button"
                    data-testid={`streak-day-${day.date}`}
                    aria-pressed={isSelected}
                    aria-label={`${day.weekdayShort} ${day.dayNumber} ${day.monthShort}: ${day.status === 'complete' ? `Complete, ${day.pointsEarned} points` : day.status === 'incomplete' ? 'Incomplete notebook check' : 'No notebook check logged'}`}
                    onClick={() => setSelectedDate(day.date)}
                    className={`rounded-lg border px-2 py-2.5 text-center transition-colors flex flex-col items-center justify-between gap-1 ${statusStyle}`}
                  >
                    <span className="text-[10px] font-semibold opacity-80">
                      {day.weekdayShort}
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums">
                      {day.dayNumber}
                    </span>
                    <span className="h-4 flex items-center justify-center">
                      {day.status === 'complete' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                      ) : day.status === 'incomplete' ? (
                        <AlertCircle className="h-3.5 w-3.5 text-rose-700" />
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">—</span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] font-semibold tabular-nums">
                      {day.status === 'complete'
                        ? `+${day.pointsEarned}`
                        : day.status === 'incomplete'
                          ? '0 pt'
                          : day.monthShort}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Inspector */}
            {activeDay && (
              <div
                data-testid="streak-day-inspector"
                className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {activeDay.weekdayShort}, {activeDay.dayNumber} {activeDay.monthShort} ({activeDay.date})
                    </span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`font-semibold ${
                        activeDay.status === 'complete'
                          ? 'text-emerald-700'
                          : activeDay.status === 'incomplete'
                            ? 'text-rose-700'
                            : 'text-slate-500'
                      }`}
                    >
                      {activeDay.status === 'complete'
                        ? `Complete & Timely · Day ${activeDay.streakDayNumber} of streak`
                        : activeDay.status === 'incomplete'
                          ? 'Incomplete / Unchecked · Streak paused'
                          : 'No notebook check logged on this day'}
                    </span>
                  </div>
                  {activeDay.entries.length > 0 ? (
                    <p className="text-slate-600">
                      {activeDay.entries
                        .map(
                          (e) =>
                            `${e.subject} (${e.chapter}) — ${e.checked ? `Grade ${e.workQuality}, ${e.homeworkDone ? 'Complete' : 'Incomplete'}` : 'Not Checked'}`,
                        )
                        .join(' · ')}
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      Teachers did not log a notebook check for this date.
                    </p>
                  )}
                </div>
                <div className="font-mono text-xs font-bold text-blue-900 tabular-nums whitespace-nowrap shrink-0">
                  {activeDay.pointsEarned > 0
                    ? `+${activeDay.pointsEarned} pts${activeDay.excellenceAwarded ? ' · Grade A Bonus' : ''}`
                    : '0 pts'}
                </div>
              </div>
            )}
          </div>

          {/* Virtual Badges Showcase */}
          <div className={compact ? 'p-5 space-y-3' : 'p-6 space-y-4'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-900 shrink-0" />
                <h3 className="text-xs font-bold text-slate-900">
                  Virtual Consistency Badges ({summary.earnedBadgesCount} of {summary.badges.length}{' '}
                  Earned)
                </h3>
              </div>
              {summary.nextBadge && (
                <p className="text-[11px] text-slate-600 tabular-nums">
                  Next target: <strong className="text-slate-900">{summary.nextBadge.title}</strong>{' '}
                  ({summary.nextBadge.progressCurrent}/{summary.nextBadge.progressTarget} · +
                  {summary.nextBadge.pointsReward} pts)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {summary.badges.map((badge) => (
                <div
                  key={badge.id}
                  data-testid={`streak-badge-${badge.id}`}
                  data-unlocked={badge.unlocked ? 'true' : 'false'}
                  className={`rounded-lg border p-3.5 flex flex-col justify-between gap-3 transition-colors ${
                    badge.unlocked
                      ? 'border-slate-200 bg-white'
                      : 'border-dashed border-slate-200 bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`h-9 w-9 rounded-full border flex items-center justify-center shrink-0 ${badgeAccentRing(
                          badge.accent,
                          badge.unlocked,
                        )}`}
                      >
                        {renderBadgeIcon(badge.id, badge.unlocked)}
                      </div>
                      <span
                        className={`font-mono text-[11px] font-bold tabular-nums ${
                          badge.unlocked ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        +{badge.pointsReward} pts
                      </span>
                    </div>

                    <div>
                      <p
                        className={`text-xs font-bold ${
                          badge.unlocked ? 'text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        {badge.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{badge.requirementLabel}</p>
                    </div>
                  </div>

                  {badge.unlocked ? (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-emerald-700">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        Unlocked
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {badge.unlockedDate}
                      </span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Lock className="h-3 w-3 shrink-0" />
                          Locked
                        </span>
                        <span className="font-mono font-semibold text-slate-700 tabular-nums">
                          {badge.progressCurrent}/{badge.progressTarget}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500"
                          style={{ width: `${badge.progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
