import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Clock,
  FileText,
  Layers,
} from 'lucide-react';
import type { PendingCheckingHighlightsSummary } from '../utils/pendingCheckingEngine';

interface PendingCheckingWatchlistPanelProps {
  summary: PendingCheckingHighlightsSummary;
  selectedStudentId?: string | null;
  onSelectStudent?: (studentId: string) => void;
  onOpenStudent?: (studentId: string) => void;
}

export const PendingCheckingWatchlistPanel: React.FC<PendingCheckingWatchlistPanelProps> = ({
  summary,
  selectedStudentId,
  onSelectStudent,
  onOpenStudent,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHAPTER_GAP' | 'HOMEWORK'>('ALL');

  const visibleStudents = useMemo(() => {
    return summary.rankedStudents.filter((rec) => {
      if (filterMode === 'CHAPTER_GAP') return rec.priorChapterGaps.length > 0;
      if (filterMode === 'HOMEWORK') return rec.pendingHomeworks.length > 0;
      return true;
    });
  }, [summary.rankedStudents, filterMode]);

  const hwStudentsCount = useMemo(
    () => summary.rankedStudents.filter((r) => r.pendingHomeworks.length > 0).length,
    [summary.rankedStudents],
  );

  return (
    <section
      data-testid="school-pending-checking-panel"
      className="rounded-xl border border-amber-200 bg-white overflow-hidden"
    >
      <div className="border-b border-amber-200 bg-amber-50/60 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Pending Notebook &amp; Homework Checking Watchlist</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Automatically highlights students with unchecked earlier chapters when a class moves
            ahead (e.g. Ch. 1 still Not Checked while teacher started Ch. 3) alongside pending
            homework checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-white border border-amber-200 p-1 w-fit shrink-0">
          {(
            [
              { id: 'ALL', label: `All Pending (${summary.studentsWithPendingCount})` },
              {
                id: 'CHAPTER_GAP',
                label: `Prior-Chapter Unchecked (${summary.priorChapterGapStudentsCount})`,
              },
              { id: 'HOMEWORK', label: `Pending Homework (${hwStudentsCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                filterMode === tab.id
                  ? 'bg-amber-700 text-white'
                  : 'text-slate-700 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compact 4-Metric Pending Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50 text-xs">
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Prior-Chapter Backlog Alerts</p>
          <p
            data-testid="pending-prior-chapter-count"
            className="font-mono text-lg font-bold text-rose-700 tabular-nums mt-0.5"
          >
            {summary.priorChapterGapCount}
          </p>
          <p className="text-[11px] text-slate-500">
            Across {summary.priorChapterGapStudentsCount}{' '}
            {summary.priorChapterGapStudentsCount === 1 ? 'student' : 'students'}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Pending / Incomplete Notebooks</p>
          <p className="font-mono text-lg font-bold text-amber-700 tabular-nums mt-0.5">
            {summary.pendingNotebookChecksCount}
          </p>
          <p className="text-[11px] text-slate-500">Unchecked or incomplete chapter entries</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Pending Homework Checks</p>
          <p
            data-testid="pending-homework-checks-count"
            className="font-mono text-lg font-bold text-blue-900 tabular-nums mt-0.5"
          >
            {summary.pendingHomeworkChecksCount}
          </p>
          <p className="text-[11px] text-slate-500">Active assignments still Pending / Missing</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Total Students Highlighted</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
            {summary.studentsWithPendingCount}
          </p>
          <p className="text-[11px] text-slate-500">Ranked by chapter backlog severity first</p>
        </div>
      </div>

      {visibleStudents.length === 0 ? (
        <div className="px-5 py-6 text-xs text-slate-500 text-center">
          No students have pending notebook or homework checking gaps in the current filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-2.5">Student &amp; Class</th>
                <th className="px-4 py-2.5">Prior-Chapter Unchecked Alert</th>
                <th className="px-4 py-2.5">Pending Notebook Checks</th>
                <th className="px-4 py-2.5">Pending Homework Checking</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.slice(0, 12).map((rec) => {
                const isSelected = selectedStudentId === rec.studentId;
                return (
                  <tr
                    key={rec.studentId}
                    className={`${
                      isSelected
                        ? 'bg-blue-50/70'
                        : rec.priorChapterGaps.length > 0
                          ? 'bg-rose-50/25 hover:bg-rose-50/45'
                          : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-4 py-3 align-top whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectStudent
                            ? onSelectStudent(rec.studentId)
                            : onOpenStudent?.(rec.studentId)
                        }
                        className="font-bold text-slate-900 hover:text-blue-900 hover:underline text-left"
                      >
                        {rec.studentName}
                      </button>
                      <p className="text-[11px] font-mono text-slate-500 tabular-nums">
                        Class {rec.classSection} · Roll {rec.rollNo}
                      </p>
                    </td>

                    <td className="px-4 py-3 align-top max-w-sm">
                      {rec.priorChapterGaps.length === 0 ? (
                        <span className="text-slate-400">No chapter-sequence gap</span>
                      ) : (
                        <div className="space-y-1.5">
                          {rec.priorChapterGaps.map((gap) => (
                            <div
                              key={`${gap.subject}-${gap.missingChapterNum}`}
                              className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-700" />
                                <span>
                                  {gap.subject}: {gap.missingChapterNo} Not Checked
                                </span>
                                <span className="font-mono text-[10px] text-rose-700">
                                  ({gap.chapterGap} ch behind)
                                </span>
                              </div>
                              <p className="text-slate-700 mt-0.5">
                                {gap.missingChapterName} still unchecked while class started{' '}
                                <strong className="text-slate-900">{gap.currentChapterLabel}</strong>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top max-w-xs">
                      {rec.pendingNotebookEntries.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <ul className="space-y-1 text-[11px]">
                          {rec.pendingNotebookEntries.slice(0, 3).map((nb) => (
                            <li key={nb.id} className="flex items-start gap-1.5 text-slate-700">
                              <Clock className="h-3.5 w-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-slate-900">
                                  {nb.subject} ({nb.chapterNo})
                                </strong>{' '}
                                · {nb.status}{' '}
                                <span className="font-mono text-slate-500">({nb.date})</span>
                              </span>
                            </li>
                          ))}
                          {rec.pendingNotebookEntries.length > 3 && (
                            <li className="text-[10px] font-mono text-slate-500">
                              +{rec.pendingNotebookEntries.length - 3} more pending notebook checks
                            </li>
                          )}
                        </ul>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top max-w-xs">
                      {rec.pendingHomeworks.length === 0 ? (
                        <span className="text-slate-400">All HW checked</span>
                      ) : (
                        <ul className="space-y-1 text-[11px]">
                          {rec.pendingHomeworks.slice(0, 3).map((hw) => (
                            <li
                              key={`${hw.assignmentId}-${hw.dueDate}`}
                              className="flex items-start gap-1.5 text-slate-700"
                            >
                              <BookOpenCheck
                                className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                                  hw.overdue ? 'text-rose-700' : 'text-blue-900'
                                }`}
                              />
                              <span>
                                <strong className="text-slate-900">{hw.subject}</strong>:{' '}
                                {hw.title}{' '}
                                <span
                                  className={`font-mono font-semibold ${
                                    hw.overdue ? 'text-rose-700' : 'text-amber-700'
                                  }`}
                                >
                                  ({hw.status}
                                  {hw.overdue ? ' · Overdue' : ` · Due ${hw.dueDate}`})
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectStudent
                            ? onSelectStudent(rec.studentId)
                            : onOpenStudent?.(rec.studentId)
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-900 hover:text-blue-900"
                      >
                        <FileText className="h-3 w-3" />
                        Brief Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
