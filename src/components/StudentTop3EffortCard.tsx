import React from 'react';
import { Award, CheckCircle2, TrendingUp } from 'lucide-react';
import type { StudentTop3Standing, Top3TargetGap } from '../types';

interface StudentTop3EffortCardProps {
  standing: StudentTop3Standing;
}

function TargetGapColumn({ gap }: { gap: Top3TargetGap }) {
  const isRanked = gap.rank !== null;
  const cardBorder = gap.inTop3
    ? 'border-emerald-200 bg-emerald-50/50'
    : 'border-amber-200 bg-amber-50/40';

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${cardBorder}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-500">
            {gap.scope === 'class' ? 'Class Top 3 Target' : 'School Top 3 Target'}
          </p>
          <h3 className="font-display text-sm font-bold text-slate-900 mt-0.5">
            {gap.scopeLabel}
          </h3>
        </div>
        <span
          className={`rounded-md px-2 py-1 font-mono text-xs font-bold tabular-nums shrink-0 ${
            gap.inTop3
              ? 'bg-emerald-700 text-white'
              : isRanked
                ? 'bg-slate-900 text-white'
                : 'bg-slate-200 text-slate-700'
          }`}
        >
          {isRanked ? `Rank #${gap.rank} / ${gap.totalRanked}` : 'Unranked'}
        </span>
      </div>

      {gap.inTop3 ? (
        <div className="flex items-start gap-2 text-xs text-emerald-950">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{gap.statusMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-500">
                {isRanked
                  ? `Effort needed to enter ${gap.scopeLabel} Top 3`
                  : 'Initial evidence required'}
              </p>
              <p className="text-xs font-medium text-slate-800 mt-0.5">
                {gap.cutoffScore !== null && gap.cutoffStudentName
                  ? `#3 benchmark: ${gap.cutoffScore}/100 (${gap.cutoffStudentName})`
                  : gap.statusMessage}
              </p>
            </div>
            {isRanked && (
              <div className="text-right shrink-0">
                <p className="font-mono text-lg font-bold text-blue-900 tabular-nums">
                  +{gap.pointsToEnterTop3} pts
                </p>
                {gap.pointsToTieTop3 > 0 && (
                  <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                    +{gap.pointsToTieTop3} to tie #3
                  </p>
                )}
              </div>
            )}
          </div>

          {gap.effortSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-900" />
                Recommended Effort Breakdown
              </p>
              <div className="space-y-2">
                {gap.effortSteps.map((step) => (
                  <div
                    key={step.componentKey}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {step.componentLabel}{' '}
                        <span className="font-normal text-slate-500">
                          ({step.weightPct}% weight)
                        </span>
                      </span>
                      <span className="font-mono font-bold text-blue-900 tabular-nums shrink-0">
                        {step.currentScore !== null
                          ? `${step.currentScore} → ${step.targetScore}`
                          : `Add → ${step.targetScore}`}
                        {step.estimatedOverallGain > 0
                          ? ` (+${step.estimatedOverallGain} pts)`
                          : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{step.actionHint}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const StudentTop3EffortCard: React.FC<StudentTop3EffortCardProps> = ({ standing }) => {
  return (
    <section
      aria-label="Class and School Top 3 Standing"
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            Class &amp; School Top 3 Standing &amp; Effort Needed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Shows {standing.studentName}&apos;s position in Class {standing.classSection} and overall school, plus exact Learners Score points needed to enter Top 3.
          </p>
        </div>
        <div className="font-mono text-xs font-semibold text-slate-700 tabular-nums shrink-0">
          Current Score: {standing.overallScore !== null ? `${standing.overallScore} / 100` : 'Pending'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TargetGapColumn gap={standing.classTarget} />
        <TargetGapColumn gap={standing.schoolTarget} />
      </div>
    </section>
  );
};
