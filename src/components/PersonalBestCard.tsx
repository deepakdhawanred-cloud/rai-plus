import React from 'react';
import { ArrowUpRight, Award, BookOpenCheck, Flame, Target } from 'lucide-react';
import type { PersonalBestSummary } from '../types';

interface PersonalBestCardProps {
  studentName: string;
  summary: PersonalBestSummary;
  onLaunchReadingTest?: () => void;
}

export const PersonalBestCard: React.FC<PersonalBestCardProps> = ({
  studentName,
  summary,
  onLaunchReadingTest,
}) => {
  return (
    <section
      aria-label="Reading Personal Best Tracker"
      data-testid="personal-best-tracker"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-900 shrink-0" />
            Reading Personal Best Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Highest WPM and pronunciation accuracy for {studentName} across recent reading tests · Class benchmark {summary.classTargetWpm} WPM
          </p>
        </div>

        {onLaunchReadingTest && (
          <button
            type="button"
            onClick={onLaunchReadingTest}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 self-start sm:self-auto print:hidden"
          >
            <BookOpenCheck className="h-3.5 w-3.5" />
            {summary.totalAttempts === 0 ? 'Take Baseline Reading Test' : 'Beat Personal Best'}
          </button>
        )}
      </div>

      {summary.totalAttempts === 0 ? (
        <div className="p-6 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">No Reading Tests Logged Yet</p>
          <p>{summary.encouragementMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {/* Top Personal Best KPI Split + Trajectory */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/40">
            <div className="p-5 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span className="font-semibold">Personal Best Speed</span>
                {summary.latestSetNewWpmBest && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Latest is Best
                  </span>
                )}
              </div>
              <p
                data-testid="personal-best-wpm"
                className="font-mono text-3xl font-bold text-blue-900 tabular-nums"
              >
                {summary.bestWpm}{' '}
                <span className="text-sm font-semibold text-slate-600">WPM</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Set on {summary.bestWpmDate} · {summary.bestWpmLabel}
              </p>
              <p className="font-mono text-[11px] text-slate-700 tabular-nums pt-0.5">
                Latest: {summary.latestWpm} WPM
                {summary.wpmGapToBest !== null && summary.wpmGapToBest < 0
                  ? ` (${summary.wpmGapToBest} vs peak)`
                  : ' · Holding record'}
              </p>
            </div>

            <div className="p-5 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span className="font-semibold">Personal Best Accuracy</span>
                {summary.latestSetNewAccuracyBest && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Latest is Best
                  </span>
                )}
              </div>
              <p
                data-testid="personal-best-accuracy"
                className="font-mono text-3xl font-bold text-emerald-700 tabular-nums"
              >
                {summary.bestAccuracyPct}
                <span className="text-sm font-semibold text-slate-600">%</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Set on {summary.bestAccuracyDate} · {summary.bestAccuracyLabel}
              </p>
              <p className="font-mono text-[11px] text-slate-700 tabular-nums pt-0.5">
                Latest: {summary.latestAccuracyPct}%
                {summary.accuracyGapToBest !== null && summary.accuracyGapToBest < 0
                  ? ` (${summary.accuracyGapToBest}% vs peak)`
                  : ' · Holding record'}
              </p>
            </div>

            <div className="p-5 flex flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-blue-900" />
                    Next Fluency Milestone
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {summary.nextMilestoneWpm} WPM
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700 inline-flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-amber-600" />
                    Climbing Streak
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {summary.streakImprovingCount}{' '}
                    {summary.streakImprovingCount === 1 ? 'climb' : 'climbs'} in a row
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-2.5">
                {summary.encouragementMessage}
              </p>
            </div>
          </div>

          {/* Recent Reading Tests Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-2.5 font-semibold">Recent Reading Test / Assessment</th>
                  <th className="px-4 py-2.5 font-semibold">Source</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Speed (WPM)</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Accuracy</th>
                  <th className="px-5 py-2.5 font-semibold">Fluency Style / Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.recentAttempts.map((attempt) => (
                  <tr
                    key={attempt.id}
                    className={
                      attempt.isWpmRecord || attempt.isAccuracyRecord
                        ? 'bg-blue-50/35 hover:bg-blue-50/55'
                        : 'hover:bg-slate-50/70'
                    }
                  >
                    <td className="px-6 py-2.5 font-medium text-slate-900">
                      {attempt.title}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                      {attempt.source === 'live_test' ? 'Live Reading Test' : 'Monthly Check'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {attempt.date}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {attempt.wpm} WPM
                      {attempt.isWpmRecord && (
                        <span className="ml-1.5 font-sans text-[11px] font-semibold text-blue-900">
                          · Best WPM
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      {attempt.accuracyPct}%
                      {attempt.isAccuracyRecord && (
                        <span className="ml-1.5 font-sans text-[11px] font-semibold text-emerald-700">
                          · Best Acc
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-slate-600 whitespace-nowrap">
                      {attempt.fluencyStyle || `Overall ${attempt.overallPct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
