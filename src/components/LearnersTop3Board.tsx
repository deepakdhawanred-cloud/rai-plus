import React, { useEffect, useMemo, useState } from 'react';
import { Award, Medal, TrendingUp } from 'lucide-react';
import type { RankedStudentEntry, SchoolRankingsSummary } from '../types';

interface LearnersTop3BoardProps {
  rankings: SchoolRankingsSummary;
  schoolName: string;
  schoolCode: string;
  activeStudentId?: string | null;
  defaultClassSection?: string;
  canInspectStudents?: boolean;
  onInspectStudent?: (studentId: string) => void;
}

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : rank === 2
        ? 'bg-slate-200 text-slate-900 border-slate-300'
        : 'bg-orange-100 text-orange-900 border-orange-200';
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs font-bold tabular-nums shrink-0 ${tone}`}
    >
      #{rank}
    </span>
  );
}

function LeaderboardRows({
  entries,
  activeStudentId,
  showClass,
  canInspect,
  onInspect,
}: {
  entries: RankedStudentEntry[];
  activeStudentId?: string | null;
  showClass: boolean;
  canInspect?: boolean;
  onInspect?: (studentId: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="px-5 py-6 text-xs text-slate-500">
        No ranked Learners Scores yet for this cohort.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {entries.map((entry) => {
        const isSelf = activeStudentId === entry.studentId;
        return (
          <div
            key={entry.studentId}
            className={`px-5 py-3 flex items-center justify-between gap-3 ${
              isSelf ? 'bg-blue-50/70' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <RankBadge rank={entry.rank} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {canInspect && onInspect ? (
                    <button
                      type="button"
                      onClick={() => onInspect(entry.studentId)}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-900 hover:underline truncate text-left"
                    >
                      {entry.studentName}
                    </button>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {entry.studentName}
                    </p>
                  )}
                  {isSelf && (
                    <span className="rounded bg-blue-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shrink-0">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {showClass ? `Class ${entry.classSection} · ` : ''}
                  Evidence coverage {entry.evidenceCoveragePct}%
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                {entry.overallScore}
                <span className="text-[11px] font-normal text-slate-500"> / 100</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const LearnersTop3Board: React.FC<LearnersTop3BoardProps> = ({
  rankings,
  schoolName,
  schoolCode,
  activeStudentId,
  defaultClassSection,
  canInspectStudents = false,
  onInspectStudent,
}) => {
  const classSections = useMemo(
    () =>
      Object.keys(rankings.classTop3BySection).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
    [rankings.classTop3BySection],
  );

  const [selectedClass, setSelectedClass] = useState<string>(
    defaultClassSection && classSections.includes(defaultClassSection)
      ? defaultClassSection
      : classSections[0] ?? '',
  );

  useEffect(() => {
    if (defaultClassSection && classSections.includes(defaultClassSection)) {
      setSelectedClass(defaultClassSection);
    } else if (!classSections.includes(selectedClass) && classSections.length > 0) {
      setSelectedClass(classSections[0]);
    }
  }, [defaultClassSection, classSections, selectedClass]);

  const classTop3 = rankings.classTop3BySection[selectedClass] ?? [];
  const classCounts = rankings.classTotalsBySection[selectedClass] ?? { total: 0, ranked: 0 };
  const standing = activeStudentId ? rankings.studentStandings[activeStudentId] : undefined;

  return (
    <section
      aria-label="Learners Score Top 3 Leaderboards"
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Learners Score Top 3 Ranks — Class &amp; School
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked strictly by weighted 0–100 Learners Score · Students awaiting evidence are excluded rather than scored zero.
          </p>
        </div>
        <p className="font-mono text-xs text-slate-500 tabular-nums">
          {schoolCode} · {rankings.schoolTotals.ranked}/{rankings.schoolTotals.total} ranked
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 3 in Class */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4 text-blue-900" />
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Class {selectedClass || '—'} Top 3
                </h3>
                <p className="text-[11px] text-slate-500">
                  {classCounts.ranked} of {classCounts.total} students ranked
                </p>
              </div>
            </div>

            {classSections.length > 1 && (
              <select
                aria-label="Select class for top 3 leaderboard"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
              >
                {classSections.map((sec) => (
                  <option key={sec} value={sec}>
                    Class {sec}
                  </option>
                ))}
              </select>
            )}
          </div>

          <LeaderboardRows
            entries={classTop3}
            activeStudentId={activeStudentId}
            showClass={false}
            canInspect={canInspectStudents}
            onInspect={onInspectStudent}
          />
        </div>

        {/* Top 3 in School */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between gap-2 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" />
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  School Top 3 ({schoolCode})
                </h3>
                <p className="text-[11px] text-slate-500 truncate max-w-[260px]">
                  {schoolName}
                </p>
              </div>
            </div>
            <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
              {activeStudentId ? 'Anonymized Benchmark' : 'All Classes'}
            </span>
          </div>

          <LeaderboardRows
            entries={rankings.schoolTop3}
            activeStudentId={activeStudentId}
            showClass
            canInspect={canInspectStudents}
            onInspect={onInspectStudent}
          />
        </div>
      </div>

      {/* Individual Student Quick Standing Summary (for Student / Parent views) */}
      {standing && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5">
            <TrendingUp className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">
                {standing.studentName} · Class {standing.classSection} Standing
              </p>
              <p className="text-slate-700">{standing.classTarget.statusMessage}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <TrendingUp className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-slate-900">
                {standing.studentName} · School Standing ({schoolCode})
              </p>
              <p className="text-slate-700">{standing.schoolTarget.statusMessage}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
