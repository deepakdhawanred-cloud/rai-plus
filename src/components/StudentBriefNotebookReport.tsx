import React, { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Clock, Download, X } from 'lucide-react';
import type { NotebookEntry, StudentRecord } from '../types';
import { triggerCsvDownload } from '../utils/csvExport';
import { buildStudentBriefNotebookReport } from '../utils/notebookAnalyticsEngine';

interface StudentBriefNotebookReportProps {
  student: StudentRecord;
  notebookEntries: NotebookEntry[];
  viewerLabel?: string;
  onClose?: () => void;
  onOpenFullProfile?: (studentId: string) => void;
}

export const StudentBriefNotebookReport: React.FC<StudentBriefNotebookReportProps> = ({
  student,
  notebookEntries,
  viewerLabel,
  onClose,
  onOpenFullProfile,
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'INCOMPLETE' | 'COMPLETE'>('ALL');

  const report = useMemo(
    () => buildStudentBriefNotebookReport(student, notebookEntries),
    [student, notebookEntries],
  );

  const visibleRows = useMemo(() => {
    return report.rows.filter((row) => {
      if (subjectFilter !== 'ALL' && row.subject !== subjectFilter) return false;
      if (statusFilter === 'INCOMPLETE' && row.status === 'Complete') return false;
      if (statusFilter === 'COMPLETE' && row.status !== 'Complete') return false;
      return true;
    });
  }, [report.rows, subjectFilter, statusFilter]);

  function handleExportCsv() {
    triggerCsvDownload(
      `${student.name.toLowerCase().replace(/\s+/g, '-')}-notebook-report.csv`,
      [
        'Chapter No',
        'Chapter Name',
        'Subject',
        'Date Checked On',
        'Status',
        'Handwriting',
        'Work Quality',
        'Checked By',
        'Remarks',
      ],
      visibleRows.map((r) => [
        r.chapterNo,
        r.chapterName,
        r.subject,
        r.date,
        r.status,
        r.checked ? r.handwriting : 'Not Checked',
        r.checked ? `Grade ${r.workQuality}` : '—',
        r.teacherName,
        r.remarks,
      ]),
    );
  }

  return (
    <section
      data-testid="student-brief-notebook-report"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
            <BookOpen className="h-3.5 w-3.5 shrink-0" />
            <span>
              Brief Notebook Checking Report
              {viewerLabel ? ` · ${viewerLabel}` : ' · Student & Teacher Record'}
            </span>
          </div>
          <h2 className="font-display text-base font-bold text-slate-900 mt-0.5">
            {report.studentName}{' '}
            <span className="text-xs font-normal font-mono text-slate-500">
              · Class {report.classSection} · Roll {report.rollNo}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chapter-by-chapter notebook status with Chapter No., Chapter Name, Subject, and Date
            Checked On.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 print:hidden">
          {onOpenFullProfile && (
            <button
              type="button"
              onClick={() => onOpenFullProfile(student.id)}
              className="rounded-lg border border-blue-900 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
            >
              Open Student 360°
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={visibleRows.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
          {onClose && (
            <button
              type="button"
              aria-label="Close brief notebook report"
              onClick={onClose}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Compact Summary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/60">
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Chapters Logged</p>
          <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
            {report.totalChecks}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Complete</p>
          <p className="font-mono text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
            {report.completeCount}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Incomplete / Unchecked</p>
          <p
            className={`font-mono text-lg font-bold tabular-nums mt-0.5 ${
              report.totalDefaulterCount > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {report.totalDefaulterCount}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-slate-500">Completion Rate</p>
          <p
            className={`font-mono text-lg font-bold tabular-nums mt-0.5 ${
              report.completionPct < 70
                ? 'text-rose-700'
                : report.completionPct < 90
                  ? 'text-amber-700'
                  : 'text-emerald-700'
            }`}
          >
            {report.totalChecks > 0 ? `${report.completionPct}%` : '—'}
          </p>
        </div>
        <div className="px-4 py-3 col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-slate-500">Work Grades</p>
          <p className="font-mono text-xs font-semibold text-slate-800 tabular-nums mt-1.5">
            A:{report.gradeCounts.A} · B:{report.gradeCounts.B} · C:{report.gradeCounts.C}
          </p>
        </div>
      </div>

      {/* Filters */}
      {report.totalChecks > 0 && (
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'ALL', label: `All (${report.totalChecks})` },
                { id: 'INCOMPLETE', label: `Incomplete / Pending (${report.totalDefaulterCount})` },
                { id: 'COMPLETE', label: `Complete (${report.completeCount})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter student notebook report by subject"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
          >
            <option value="ALL">All Subjects ({report.subjectsCovered.length})</option>
            {report.subjectsCovered.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Chapter-by-Chapter Table */}
      {visibleRows.length === 0 ? (
        <div className="p-6 text-xs text-slate-500 text-center">
          {report.totalChecks === 0
            ? `No notebook checks have been logged yet for ${report.studentName}.`
            : 'No chapters match the selected subject/status filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-2.5 whitespace-nowrap">Ch. No.</th>
                <th className="px-4 py-2.5">Chapter Name</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Subject</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Date Checked On</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Notebook Status</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Quality &amp; Handwriting</th>
                <th className="px-4 py-2.5">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-mono font-bold text-blue-900 whitespace-nowrap tabular-nums">
                    {row.chapterNo}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    {row.chapterName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{row.subject}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                    {row.date}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {row.status === 'Complete' ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Complete
                      </span>
                    ) : row.status === 'Incomplete' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Incomplete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        Not Checked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">
                    {row.checked ? (
                      <span>
                        <strong className="font-mono text-slate-900">Grade {row.workQuality}</strong>{' '}
                        · {row.handwriting}
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Submitted</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 max-w-xs">
                    <span>{row.remarks || '—'}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Checked by {row.teacherName}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
