import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Search,
} from 'lucide-react';
import type { WorkspaceData } from '../types/workspace';
import { triggerCsvDownload } from '../utils/csvExport';
import { computeSchoolNotebookDashboard } from '../utils/notebookAnalyticsEngine';
import { computePendingCheckingHighlights } from '../utils/pendingCheckingEngine';
import { NotebookIncompleteAlertsPanel } from './NotebookIncompleteAlertsPanel';
import { PendingCheckingWatchlistPanel } from './PendingCheckingWatchlistPanel';
import { StudentBriefNotebookReport } from './StudentBriefNotebookReport';

interface SchoolNotebookDashboardPanelProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent: (studentId: string) => void;
}

export const SchoolNotebookDashboardPanel: React.FC<SchoolNotebookDashboardPanelProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
}) => {
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [listMode, setListMode] = useState<'defaulters' | 'all'>('defaulters');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const dashboard = useMemo(
    () =>
      computeSchoolNotebookDashboard({
        students: data.students,
        notebookEntries: data.notebookEntries || [],
        classFilter,
        subjectFilter,
        searchQuery,
      }),
    [data.students, data.notebookEntries, classFilter, subjectFilter, searchQuery],
  );

  const pendingSummary = useMemo(
    () =>
      computePendingCheckingHighlights({
        students: data.students,
        notebookEntries: data.notebookEntries || [],
        homeworkAssignments: data.homeworkAssignments || [],
        homeworkSubmissions: data.homeworkSubmissions || [],
        lessonPlans: data.lessonPlans || [],
        classFilter,
        subjectFilter,
        searchQuery,
      }),
    [
      data.students,
      data.notebookEntries,
      data.homeworkAssignments,
      data.homeworkSubmissions,
      data.lessonPlans,
      classFilter,
      subjectFilter,
      searchQuery,
    ],
  );

  const displayedRows =
    listMode === 'defaulters' ? dashboard.topDefaulters : dashboard.allStudentRows;

  const activeStudent = useMemo(() => {
    const targetId =
      selectedStudentId &&
      data.students.some((s) => s.id === selectedStudentId)
        ? selectedStudentId
        : displayedRows[0]?.studentId || null;
    return targetId ? data.students.find((s) => s.id === targetId) || null : null;
  }, [selectedStudentId, data.students, displayedRows]);

  function handleExportDefaultersCsv() {
    triggerCsvDownload(
      `${data.activeSchool.code.toLowerCase()}-notebook-defaulters.csv`,
      [
        'Rank',
        'Student Name',
        'Class',
        'Roll No',
        'Incomplete / Unchecked Count',
        'Complete Count',
        'Total Checks',
        'Completion %',
        'Incomplete Subjects',
        'Latest Incomplete Ch. No.',
        'Latest Incomplete Chapter',
        'Latest Incomplete Date',
      ],
      dashboard.topDefaulters.map((d) => [
        String(d.rank),
        d.studentName,
        d.classSection,
        d.rollNo,
        String(d.totalDefaulterCount),
        String(d.completeCount),
        String(d.totalChecks),
        `${d.completionPct}%`,
        d.incompleteSubjects.join('; '),
        d.latestIncompleteChapterNo || '',
        d.latestIncompleteChapterName || '',
        d.latestIncompleteDate || '',
      ]),
    );
  }

  return (
    <div className="space-y-6" data-testid="school-notebook-dashboard">
      {/* Executive Filter & Export Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, class, subject, chapter..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter school notebook dashboard by class"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Classes ({dashboard.availableClasses.length})</option>
            {dashboard.availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter school notebook dashboard by subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Subjects ({dashboard.availableSubjects.length})</option>
            {dashboard.availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleExportDefaultersCsv}
          disabled={dashboard.topDefaulters.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Export Defaulters CSV
        </button>
      </div>

      {/* 4-Column School Executive KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Top Defaulters Flagged</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span
              data-testid="school-nb-defaulters-count"
              className="font-mono text-2xl font-bold text-rose-700 tabular-nums"
            >
              {dashboard.totalDefaulterStudents}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              of {dashboard.studentsEvaluatedCount} checked
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Students with one or more incomplete or unsubmitted notebooks.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Incomplete / Unchecked</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
              {dashboard.totalIncompleteOrUnchecked}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {dashboard.incompleteChecks} inc · {dashboard.notCheckedCount} unchecked
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Chapter notebook checks requiring follow-up completion.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">School Completion Rate</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                dashboard.schoolCompletionPct < 75
                  ? 'text-rose-700'
                  : dashboard.schoolCompletionPct < 90
                    ? 'text-amber-700'
                    : 'text-emerald-700'
              }`}
            >
              {dashboard.totalChecks > 0 ? `${dashboard.schoolCompletionPct}%` : '—'}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {dashboard.completeChecks}/{dashboard.totalChecks} checks
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Share of checked chapter notebooks marked fully complete.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">School Coverage &amp; Readability</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold text-blue-900 tabular-nums">
              {dashboard.classesCheckedCount}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              classes · {dashboard.readablePct}% readable
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Across {dashboard.subjectsCheckedCount} subjects logged by faculty.
          </p>
        </div>
      </div>

      {/* Pending Notebook & Homework Checking Watchlist (Prior-Chapter Unchecked + Pending HW) */}
      <PendingCheckingWatchlistPanel
        summary={pendingSummary}
        selectedStudentId={activeStudent?.id ?? null}
        onSelectStudent={(sid) => setSelectedStudentId(sid)}
        onOpenStudent={onOpenStudent}
      />

      {/* Top Defaulters Ranked Table */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              {listMode === 'defaulters'
                ? `Top Notebook Defaulters — Incomplete Notebooks (${dashboard.topDefaulters.length})`
                : `All Evaluated Students (${dashboard.allStudentRows.length})`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by highest incomplete / unchecked chapters first. Select any student to view
              their chapter-by-chapter Brief Notebook Report below.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit shrink-0">
            <button
              type="button"
              onClick={() => setListMode('defaulters')}
              className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                listMode === 'defaulters'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top Defaulters ({dashboard.topDefaulters.length})
            </button>
            <button
              type="button"
              onClick={() => setListMode('all')}
              className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                listMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Checked ({dashboard.allStudentRows.length})
            </button>
          </div>
        </div>

        {displayedRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {listMode === 'defaulters'
              ? 'Zero notebook defaulters in the current filter. All checked notebooks are complete.'
              : 'No notebook checks found for the selected filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 whitespace-nowrap">Rank</th>
                  <th className="px-4 py-2.5">Student &amp; Class</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Incomplete</th>
                  <th className="px-4 py-2.5 whitespace-nowrap">Completion</th>
                  <th className="px-4 py-2.5">Latest Incomplete Chapter &amp; Date</th>
                  <th className="px-4 py-2.5 whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRows.map((row) => {
                  const isSelected = activeStudent?.id === row.studentId;
                  return (
                    <tr
                      key={row.studentId}
                      data-testid={`defaulter-row-${row.studentId}`}
                      onClick={() => setSelectedStudentId(row.studentId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-500 tabular-nums whitespace-nowrap">
                        #{row.rank}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{row.studentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Class {row.classSection} · Roll {row.rollNo}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.totalDefaulterCount > 0 ? (
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-bold tabular-nums ${
                              row.severity === 'High' ? 'text-rose-700' : 'text-amber-700'
                            }`}
                          >
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {row.totalDefaulterCount} / {row.totalChecks}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-700 tabular-nums">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            0 / {row.totalChecks}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.completionPct < 60
                                  ? 'bg-rose-600'
                                  : row.completionPct < 90
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-600'
                              }`}
                              style={{ width: `${row.completionPct}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-slate-800 tabular-nums">
                            {row.completionPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {row.latestIncompleteChapterName ? (
                          <div>
                            <p className="font-semibold text-slate-900">
                              <span className="font-mono text-blue-900">
                                {row.latestIncompleteChapterNo}
                              </span>{' '}
                              · {row.latestIncompleteChapterName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {row.latestIncompleteSubject} · Checked {row.latestIncompleteDate}
                            </p>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-medium">
                            All logged chapters complete
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(row.studentId);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-900 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
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

      {/* Selected Student's Brief Chapter-by-Chapter Notebook Report */}
      {activeStudent && (
        <StudentBriefNotebookReport
          student={activeStudent}
          notebookEntries={data.notebookEntries || []}
          viewerLabel="Top Management & Teacher Inspector"
          onOpenFullProfile={onOpenStudent}
        />
      )}

      {/* Class-Wise & Subject-Wise Notebook Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Class-Wise Notebook Compliance ({dashboard.classBreakdown.length})
            </h3>
          </div>
          {dashboard.classBreakdown.length === 0 ? (
            <p className="p-5 text-xs text-slate-500">No class data in current filter.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard.classBreakdown.map((cls) => (
                <div key={cls.classSection} className="px-5 py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      Class {cls.classSection}{' '}
                      <span className="font-normal text-slate-500">
                        ({cls.totalChecks} checks)
                      </span>
                    </span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      {cls.defaulterStudents > 0 && (
                        <span className="text-rose-700 font-bold">
                          {cls.defaulterStudents} defaulter{cls.defaulterStudents > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className="font-bold text-slate-900">{cls.completionPct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cls.completionPct < 70
                          ? 'bg-rose-600'
                          : cls.completionPct < 90
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                      }`}
                      style={{ width: `${cls.completionPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3.5">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Subject-Wise Incomplete Hotspots ({dashboard.subjectBreakdown.length})
            </h3>
          </div>
          {dashboard.subjectBreakdown.length === 0 ? (
            <p className="p-5 text-xs text-slate-500">No subject data in current filter.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {dashboard.subjectBreakdown.map((sub) => (
                <div key={sub.subject} className="px-5 py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {sub.subject}{' '}
                      <span className="font-normal text-slate-500">
                        ({sub.totalChecks} checks)
                      </span>
                    </span>
                    <div className="flex items-center gap-3 font-mono tabular-nums">
                      {sub.defaulterInstances > 0 && (
                        <span className="text-rose-700 font-bold">
                          {sub.defaulterInstances} incomplete
                        </span>
                      )}
                      <span className="font-bold text-slate-900">{sub.completionPct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.completionPct < 70
                          ? 'bg-rose-600'
                          : sub.completionPct < 90
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                      }`}
                      style={{ width: `${sub.completionPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Automated Incomplete Notebook Alerts Dispatch & Acknowledgement Log */}
      <NotebookIncompleteAlertsPanel
        notifications={(data.notebookNotifications || []).filter((n) => {
          if (classFilter !== 'ALL' && n.classSection !== classFilter) return false;
          if (subjectFilter !== 'ALL' && n.subject !== subjectFilter) return false;
          const q = searchQuery.trim().toLowerCase();
          if (q) {
            const hay = `${n.studentName} ${n.classSection} ${n.subject} ${n.chapter} ${n.guardianName}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })}
        viewerRole={data.user.role}
        token={token}
        onRefresh={onRefresh}
        onOpenStudent={onOpenStudent}
        maxItems={10}
      />
    </div>
  );
};
