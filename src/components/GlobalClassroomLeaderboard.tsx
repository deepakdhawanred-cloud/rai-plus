import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Crown,
  Globe2,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react';
import type { ChapterMasteryLeaderboardEntry } from '../types';
import { apiRequest } from '../utils/api';
import type { SubjectChampionSummary } from '../utils/chapterStudyGameEngine';
import { REVISION_STREAK_UPDATED_EVENT } from '../utils/revisionStreakReminderEngine';

interface GlobalClassroomLeaderboardProps {
  token: string;
  studentName: string;
  classSection: string;
  onOpenStudyGames: () => void;
}

interface LeaderboardApiResponse {
  leaderboard: ChapterMasteryLeaderboardEntry[];
  availableClasses: string[];
  availableSubjects?: string[];
  subjectChampions?: SubjectChampionSummary[];
  totalParticipants: number;
}

type ScopeMode = 'global' | 'my_class';

const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Science'];

function rankAccentText(rank: number): string {
  if (rank === 1) return 'text-[#9A6B13]';
  if (rank === 2) return 'text-slate-600';
  if (rank === 3) return 'text-[#8C4D28]';
  return 'text-slate-500';
}

export const GlobalClassroomLeaderboard: React.FC<GlobalClassroomLeaderboardProps> = ({
  token,
  studentName,
  classSection,
  onOpenStudyGames,
}) => {
  const [scope, setScope] = useState<ScopeMode>('global');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [rows, setRows] = useState<ChapterMasteryLeaderboardEntry[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [subjectChampions, setSubjectChampions] = useState<SubjectChampionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(
    async (nextScope = scope, nextSubject = selectedSubject) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({
          classFilter: nextScope === 'my_class' ? classSection : 'ALL',
          subjectFilter: nextSubject,
        });
        const res = await apiRequest<LeaderboardApiResponse>(
          `/api/chapter-mastery/leaderboard?${qs.toString()}`,
          { method: 'GET' },
          token,
        );
        setRows(Array.isArray(res.leaderboard) ? res.leaderboard : []);
        if (Array.isArray(res.availableSubjects) && res.availableSubjects.length > 0) {
          setAvailableSubjects(res.availableSubjects);
        }
        setSubjectChampions(Array.isArray(res.subjectChampions) ? res.subjectChampions : []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load the Global Classroom leaderboard right now.',
        );
      } finally {
        setLoading(false);
      }
    },
    [token, scope, selectedSubject, classSection],
  );

  useEffect(() => {
    void fetchBoard(scope, selectedSubject);
  }, [scope, selectedSubject, fetchBoard]);

  // Auto-refresh whenever the student finishes a Quick Revise game in this session
  useEffect(() => {
    const onUpdated = () => {
      void fetchBoard(scope, selectedSubject);
    };
    window.addEventListener(REVISION_STREAK_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(REVISION_STREAK_UPDATED_EVENT, onUpdated);
  }, [fetchBoard, scope, selectedSubject]);

  const topThree = useMemo(() => rows.slice(0, 3), [rows]);
  const leaderXp = rows[0]?.totalXp || 1;
  const myRow = useMemo(() => rows.find((r) => r.isCurrentUser) || null, [rows]);
  const aheadRow = useMemo(() => {
    if (!myRow || myRow.rank <= 1) return null;
    return rows.find((r) => r.rank === myRow.rank - 1) || null;
  }, [myRow, rows]);

  const activeSubjectLabel = selectedSubject === 'ALL' ? 'All Subjects' : selectedSubject;
  const activeScopeLabel = scope === 'global' ? 'Global Classroom' : `Class ${classSection}`;

  const tableRows = useMemo(() => {
    const base = rows.slice(0, 10);
    if (myRow && !base.some((r) => r.userId === myRow.userId)) {
      return [...base, myRow];
    }
    return base;
  }, [rows, myRow]);

  return (
    <section
      aria-label="Global Classroom Leaderboard"
      data-testid="global-classroom-leaderboard"
      className="rounded-xl border border-[#E5D7C3] bg-white overflow-hidden"
    >
      {/* Header Bar */}
      <div className="border-b border-[#E5D7C3] bg-[#FAF4EC]/75 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7B5D1C]">
            <Globe2 className="h-3.5 w-3.5 shrink-0" />
            <span>Global Classroom</span>
            <span aria-hidden="true">·</span>
            <span>Friendly Subject Competition</span>
          </div>
          <h2 className="font-display text-lg font-bold text-[#142B46] mt-0.5">
            Top XP Earners Across Subjects
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare study game XP across the school or inside Class {classSection} and climb the subject ranks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            className="inline-flex items-center rounded-lg border border-[#E5D7C3] bg-white p-0.5"
            role="tablist"
            aria-label="Leaderboard scope"
          >
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'global'}
              onClick={() => setScope('global')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scope === 'global'
                  ? 'bg-[#142B46] text-white'
                  : 'text-slate-600 hover:text-[#142B46]'
              }`}
            >
              Global Classroom
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={scope === 'my_class'}
              onClick={() => setScope('my_class')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                scope === 'my_class'
                  ? 'bg-[#142B46] text-white'
                  : 'text-slate-600 hover:text-[#142B46]'
              }`}
            >
              My Class ({classSection})
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => void fetchBoard(scope, selectedSubject)}
            aria-label="Refresh Global Classroom leaderboard"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5D7C3] bg-white text-[#142B46] hover:bg-[#FAF4EC] disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenStudyGames}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-[#D6B66D]" />
            Earn XP
          </button>
        </div>
      </div>

      {/* Interactive Subject Filter Bar */}
      <div className="border-b border-slate-200 px-5 py-3 flex items-center gap-1.5 overflow-x-auto bg-white">
        <button
          type="button"
          onClick={() => setSelectedSubject('ALL')}
          data-testid="global-classroom-subject-ALL"
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            selectedSubject === 'ALL'
              ? 'bg-[#142B46] text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#142B46]'
          }`}
        >
          All Subjects
        </button>
        {availableSubjects.map((sub) => {
          const active = selectedSubject === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              data-testid={`global-classroom-subject-${sub}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#142B46] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#142B46]'
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Subject Champions Quick-Switch Strip (Visible on All Subjects) */}
      {!loading && !error && selectedSubject === 'ALL' && subjectChampions.length > 0 && (
        <div className="border-b border-[#E5D7C3] bg-[#FAF4EC]/40">
          <div className="px-5 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Subject Leaders ({activeScopeLabel})</span>
            <span>Select a subject to filter rankings</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5D7C3]">
            {subjectChampions.slice(0, 4).map((champ) => (
              <button
                key={champ.subject}
                type="button"
                onClick={() => setSelectedSubject(champ.subject)}
                className="px-5 py-3 text-left hover:bg-[#FAF4EC] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#142B46] group-hover:underline truncate">
                    {champ.subject}
                  </span>
                  <span className="font-mono font-bold text-[#7B5D1C] tabular-nums shrink-0">
                    {champ.topXp.toLocaleString()} XP
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 truncate">
                  {champ.topStudentName}
                  {champ.isCurrentUser ? ' (You)' : ''}
                </p>
                <p className="text-[11px] text-slate-500 font-mono tabular-nums mt-0.5">
                  Class {champ.classSection} · {champ.averageMasteryPct}% avg ·{' '}
                  {champ.participantCount} learner{champ.participantCount === 1 ? '' : 's'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="p-5 space-y-3" aria-busy="true">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-24 rounded-lg border border-slate-200 bg-slate-50 animate-pulse"
              />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-10 rounded bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void fetchBoard(scope, selectedSubject)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#142B46] hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center space-y-2.5">
          <Trophy className="h-7 w-7 text-[#D6B66D] mx-auto" />
          <h3 className="font-display text-base font-bold text-[#142B46]">
            No XP recorded in {activeSubjectLabel} yet
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Be the first learner from Class {classSection} to claim #1 in {activeSubjectLabel} by
            completing a Quick Revise chapter game.
          </p>
          <button
            type="button"
            onClick={onOpenStudyGames}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] cursor-pointer"
          >
            Start First {selectedSubject === 'ALL' ? 'Study' : selectedSubject} Game
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Strip */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200 bg-white">
              {topThree.map((entry) => (
                <div
                  key={entry.userId}
                  className={`px-5 py-4 flex flex-col justify-between gap-2 ${
                    entry.isCurrentUser ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-bold tabular-nums ${rankAccentText(
                            entry.rank,
                          )}`}
                        >
                          {entry.rank === 1 ? (
                            <span className="inline-flex items-center gap-1">
                              <Crown className="h-3.5 w-3.5 text-[#C49A3D]" />
                              #1 Leader
                            </span>
                          ) : (
                            `#${entry.rank}`
                          )}
                        </span>
                        <span className="text-slate-300" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          Class {entry.classSection}
                        </span>
                      </div>
                      <p className="font-display text-sm font-bold text-[#142B46] mt-1 truncate">
                        {entry.studentName}
                        {entry.isCurrentUser && (
                          <span className="ml-1.5 text-xs font-semibold text-[#7B5D1C]">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-mono text-lg font-bold text-[#142B46] tabular-nums whitespace-nowrap shrink-0">
                      {entry.totalXp.toLocaleString()}{' '}
                      <span className="text-xs font-semibold text-slate-500">XP</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
                    <span className="text-emerald-700 font-semibold">
                      {entry.averageMasteryPct}% mastery
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {entry.chaptersMastered} ch{entry.chaptersMastered === 1 ? '' : 's'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.bestStreak} best streak</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* High-Density Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-5 w-16">Rank</th>
                  <th className="py-2.5 px-3">Learner</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3 text-right">Chapters</th>
                  <th className="py-2.5 px-3 text-right">Avg Mastery</th>
                  <th className="py-2.5 px-3 text-right">Best Streak</th>
                  <th className="py-2.5 px-5 text-right w-48">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => {
                  const xpSharePct = Math.max(
                    8,
                    Math.min(100, Math.round((row.totalXp / leaderXp) * 100)),
                  );
                  return (
                    <tr
                      key={row.userId}
                      className={
                        row.isCurrentUser
                          ? 'bg-amber-50/60 font-semibold'
                          : 'hover:bg-[#FAF4EC]/40 transition-colors'
                      }
                    >
                      <td
                        className={`py-2.5 px-5 font-mono font-bold tabular-nums whitespace-nowrap ${rankAccentText(
                          row.rank,
                        )}`}
                      >
                        #{row.rank}
                      </td>
                      <td className="py-2.5 px-3 text-[#142B46] whitespace-nowrap">
                        <span className="font-semibold">{row.studentName}</span>
                        {row.isCurrentUser && (
                          <span className="ml-1.5 text-[11px] font-bold text-[#7B5D1C]">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        Class {row.classSection}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {row.chaptersMastered}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                        {row.averageMasteryPct}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {row.bestStreak}
                      </td>
                      <td className="py-2.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2.5 w-full">
                          <div className="hidden sm:block h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            <div
                              className={`h-full ${
                                row.rank === 1
                                  ? 'bg-[#C49A3D]'
                                  : row.isCurrentUser
                                    ? 'bg-[#3D6349]'
                                    : 'bg-[#142B46]'
                              }`}
                              style={{ width: `${xpSharePct}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-[#142B46] tabular-nums min-w-[68px]">
                            {row.totalXp.toLocaleString()} XP
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Friendly Competition Personal Standing Footer */}
          <div className="border-t border-[#E5D7C3] bg-[#FAF4EC]/60 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <p className="text-slate-700">
              {myRow ? (
                myRow.rank === 1 ? (
                  <>
                    <strong className="text-[#142B46]">{studentName}</strong> leads{' '}
                    <strong className="text-[#142B46]">{activeSubjectLabel}</strong> in{' '}
                    {activeScopeLabel} with{' '}
                    <span className="font-mono font-bold tabular-nums text-[#142B46]">
                      {myRow.totalXp.toLocaleString()} XP
                    </span>
                    .
                  </>
                ) : (
                  <>
                    You are ranked{' '}
                    <strong className="font-mono tabular-nums text-[#142B46]">
                      #{myRow.rank}
                    </strong>{' '}
                    in {activeSubjectLabel} ({myRow.totalXp.toLocaleString()} XP)
                    {aheadRow ? (
                      <>
                        {' '}
                        —{' '}
                        <span className="font-mono font-bold tabular-nums text-[#7B5D1C]">
                          {Math.max(1, aheadRow.totalXp - myRow.totalXp + 1).toLocaleString()} XP
                        </span>{' '}
                        to overtake #{aheadRow.rank} ({aheadRow.studentName}).
                      </>
                    ) : (
                      '.'
                    )}
                  </>
                )
              ) : (
                <>
                  <strong className="text-[#142B46]">{studentName}</strong> hasn&apos;t entered{' '}
                  <strong className="text-[#142B46]">{activeSubjectLabel}</strong> yet — complete a
                  Quick Revise game to join {rows.length} ranked learners.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onOpenStudyGames}
              className="inline-flex items-center gap-1 font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Play Study Games
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
};
