import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BellRing, CheckCircle2, ClipboardCheck, Download } from 'lucide-react';
import type {
  HandwritingRating,
  NotebookIncompleteNotification,
  WorkQualityRating,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { setWorkspaceDirtyState } from '../../utils/dirtyGuard';
import { pushToast } from '../ToastProvider';
import {
  resolveClassSubjectsForNotebook,
  resolveSuggestedChapterForSubject,
  sortClassSectionsNaturally,
} from '../../utils/classSubjectsEngine';
import { triggerCsvDownload } from '../../utils/csvExport';
import { computePendingCheckingHighlights } from '../../utils/pendingCheckingEngine';
import { HomeworkRosterPanel } from '../HomeworkRosterPanel';
import { SchoolNotebookDashboardPanel } from '../SchoolNotebookDashboardPanel';

interface NotebookCheckModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent: (studentId: string) => void;
  initialSubTab?: 'dashboard' | 'notebook' | 'homework';
  initialSubTabNonce?: number;
}

interface RowDraft {
  studentId: string;
  studentName: string;
  rollNo: string;
  checked: boolean;
  handwriting: HandwritingRating;
  workQuality: WorkQualityRating;
  homeworkDone: boolean;
  remarks: string;
}

export const NotebookCheckModule: React.FC<NotebookCheckModuleProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
  initialSubTab,
  initialSubTabNonce,
}) => {
  const isTopManagement = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const [subTab, setSubTab] = useState<'dashboard' | 'notebook' | 'homework'>(
    initialSubTabNonce && initialSubTabNonce > 0 && initialSubTab
      ? initialSubTab
      : isTopManagement
        ? 'dashboard'
        : 'notebook',
  );

  useEffect(() => {
    if (initialSubTabNonce && initialSubTabNonce > 0 && initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab, initialSubTabNonce]);
  const availableClasses = useMemo(
    () => sortClassSectionsNaturally(data.students.map((s) => s.classSection)),
    [data.students],
  );
  const defaultClass =
    data.user.classTeacherOf && availableClasses.includes(data.user.classTeacherOf)
      ? data.user.classTeacherOf
      : availableClasses[0] || '9-A';

  const [classSection, setClassSection] = useState(defaultClass);
  const subjectResolution = useMemo(
    () =>
      resolveClassSubjectsForNotebook({
        classSection,
        user: data.user,
        students: data.students,
        timetable: data.timetable,
        lessonPlans: data.lessonPlans,
        homeworkAssignments: data.homeworkAssignments,
        notebookEntries: data.notebookEntries,
        examMarks: data.examMarks,
      }),
    [
      classSection,
      data.user,
      data.students,
      data.timetable,
      data.lessonPlans,
      data.homeworkAssignments,
      data.notebookEntries,
      data.examMarks,
    ],
  );

  const [subject, setSubject] = useState(subjectResolution.autoSelectedSubject);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [chapter, setChapter] = useState(subjectResolution.suggestedChapter);
  const [date, setDate] = useState('2026-11-14');
  const [rows, setRows] = useState<RowDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [dispatchedAlerts, setDispatchedAlerts] = useState<NotebookIncompleteNotification[]>([]);
  const [dispatchedPriorChapterAlerts, setDispatchedPriorChapterAlerts] = useState<
    NotebookIncompleteNotification[]
  >([]);
  const [resolvedAlertsCount, setResolvedAlertsCount] = useState<number>(0);

  // Keep classSection valid when active school tenant switches
  useEffect(() => {
    if (availableClasses.length > 0 && !availableClasses.includes(classSection)) {
      const nextClass =
        data.user.classTeacherOf && availableClasses.includes(data.user.classTeacherOf)
          ? data.user.classTeacherOf
          : availableClasses[0];
      setClassSection(nextClass);
    }
  }, [availableClasses, classSection, data.user.classTeacherOf]);

  // Auto-select the subject and chapter whenever the selected class changes
  useEffect(() => {
    setIsCustomSubject(false);
    setCustomSubjectInput('');
    setSubject(subjectResolution.autoSelectedSubject);
    setChapter(subjectResolution.suggestedChapter);
  }, [classSection, subjectResolution.autoSelectedSubject, subjectResolution.suggestedChapter]);

  function handleSubjectSelectChange(nextValue: string) {
    if (nextValue === '__CUSTOM__') {
      setIsCustomSubject(true);
      setCustomSubjectInput('');
      return;
    }
    setIsCustomSubject(false);
    setSubject(nextValue);
    setChapter(
      resolveSuggestedChapterForSubject({
        classSection,
        subject: nextValue,
        lessonPlans: data.lessonPlans,
        homeworkAssignments: data.homeworkAssignments,
        notebookEntries: data.notebookEntries,
      }),
    );
  }

  const effectiveSubject = isCustomSubject ? customSubjectInput.trim() : subject.trim();

  useEffect(() => {
    const classStudents = data.students.filter((s) => s.classSection === classSection);
    setRows(
      classStudents.map((st) => ({
        studentId: st.id,
        studentName: st.name,
        rollNo: st.rollNo,
        checked: true,
        handwriting: 'Readability',
        workQuality: 'A',
        homeworkDone: true,
        remarks: '',
      })),
    );
    setWorkspaceDirtyState('notebook-roster', null);
    return () => setWorkspaceDirtyState('notebook-roster', null);
  }, [classSection, data.students]);

  function updateRow(studentId: string, patch: Partial<RowDraft>) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)));
    setWorkspaceDirtyState('notebook-roster', `Class ${classSection} Notebook Check`);
  }

  const pendingIncompleteAlertRows = useMemo(
    () => rows.filter((r) => !r.homeworkDone || !r.checked),
    [rows],
  );

  const livePendingSummary = useMemo(
    () =>
      computePendingCheckingHighlights({
        students: data.students,
        notebookEntries: data.notebookEntries || [],
        homeworkAssignments: data.homeworkAssignments || [],
        homeworkSubmissions: data.homeworkSubmissions || [],
        lessonPlans: data.lessonPlans || [],
        todayIso: date || '2026-11-19',
        classFilter: classSection,
        subjectFilter: effectiveSubject || 'ALL',
        liveContext: effectiveSubject
          ? {
              classSection,
              subject: effectiveSubject,
              chapter: chapter.trim(),
              date,
            }
          : undefined,
      }),
    [
      data.students,
      data.notebookEntries,
      data.homeworkAssignments,
      data.homeworkSubmissions,
      data.lessonPlans,
      classSection,
      effectiveSubject,
      chapter,
      date,
    ],
  );

  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number>(0);

  // Autosave draft to sessionStorage whenever rows change so fast classroom entry never loses progress
  useEffect(() => {
    if (rows.length === 0) return;
    try {
      const draftKey = `vs360_nb_draft_${data.activeSchool.id}_${classSection}_${effectiveSubject}_${chapter}_${date}`;
      sessionStorage.setItem(draftKey, JSON.stringify(rows));
      setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      // Ignore storage quota issues in private mode
    }
  }, [rows, data.activeSchool.id, classSection, effectiveSubject, chapter, date]);

  useEffect(() => {
    if (subTab !== 'notebook' || rows.length === 0) return;
    function handleNotebookKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedRowIdx((idx) => Math.min(idx + 1, rows.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedRowIdx((idx) => Math.max(idx - 1, 0));
      } else if (key === 'a' || key === 'b' || key === 'c') {
        const current = rows[selectedRowIdx];
        if (!current) return;
        e.preventDefault();
        const grade = key.toUpperCase() as WorkQualityRating;
        updateRow(current.studentId, {
          checked: true,
          homeworkDone: grade === 'A' ? true : current.homeworkDone,
          workQuality: grade,
        });
        setSelectedRowIdx((idx) => Math.min(idx + 1, rows.length - 1));
      } else if (key === 'h') {
        const current = rows[selectedRowIdx];
        if (!current) return;
        e.preventDefault();
        const nextDone = !current.homeworkDone;
        updateRow(current.studentId, {
          homeworkDone: nextDone,
          workQuality: !nextDone && current.workQuality === 'A' ? 'B' : current.workQuality,
        });
      }
    }
    window.addEventListener('keydown', handleNotebookKeyDown);
    return () => window.removeEventListener('keydown', handleNotebookKeyDown);
  }, [subTab, rows, selectedRowIdx]);

  function handleMarkAllChecked(checkedVal: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, checked: checkedVal })));
  }

  function handleBulkHomeworkDone(doneVal: boolean) {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        homeworkDone: doneVal,
        workQuality: !doneVal && r.workQuality === 'A' ? 'B' : r.workQuality,
      })),
    );
  }

  function handleBulkHandwriting(readable: boolean) {
    setRows((prev) =>
      prev.map((r) =>
        r.checked
          ? { ...r, handwriting: readable ? 'Readability' : 'Non-Readability' }
          : r,
      ),
    );
  }

  function handleBulkQuality(grade: WorkQualityRating) {
    setRows((prev) =>
      prev.map((r) =>
        r.checked
          ? {
              ...r,
              workQuality: grade === 'A' && !r.homeworkDone ? 'B' : grade,
            }
          : r,
      ),
    );
  }

  async function handleSaveBatch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedSuccess(null);
    setDispatchedAlerts([]);
    setDispatchedPriorChapterAlerts([]);
    setResolvedAlertsCount(0);

    if (!classSection.trim() || !effectiveSubject || !chapter.trim() || !date.trim()) {
      setError('Common class, subject, chapter, and date fields are required.');
      return;
    }
    if (rows.length === 0) {
      setError('No students found in the selected class section.');
      return;
    }

    setSaving(true);
    try {
      const response = await apiRequest<{
        triggeredAlerts?: NotebookIncompleteNotification[];
        priorChapterBacklogAlerts?: NotebookIncompleteNotification[];
        resolvedAlertsCount?: number;
      }>(
        '/api/notebooks/batch',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection,
            subject: effectiveSubject,
            chapter,
            date,
            rows: rows.map((r) => ({
              studentId: r.studentId,
              checked: r.checked,
              handwriting: r.handwriting,
              workQuality: r.workQuality,
              homeworkDone: r.homeworkDone,
              remarks: r.remarks,
            })),
          }),
        },
        token,
      );
      await onRefresh();
      setWorkspaceDirtyState('notebook-roster', null);
      pushToast(`Saved Class ${classSection} (${effectiveSubject}) notebook check & synced OLQs.`, 'success');
      const alertsSent = response.triggeredAlerts || [];
      const priorGapAlerts = response.priorChapterBacklogAlerts || [];
      const clearedCount = response.resolvedAlertsCount || 0;
      setDispatchedAlerts(alertsSent);
      setDispatchedPriorChapterAlerts(priorGapAlerts);
      setResolvedAlertsCount(clearedCount);
      setSavedSuccess(
        `Saved ${rows.length} notebook entries for ${classSection} ${effectiveSubject}. Organising Ability, Power of Expression, Reasoning Ability, Responsibility, and Learners Scores updated automatically.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save notebook batch.');
    } finally {
      setSaving(false);
    }
  }

  function handleExportNotebookCsv() {
    const rowsCsv = data.notebookEntries.map((nb) => {
      const st = data.students.find((s) => s.id === nb.studentId);
      return [
        nb.date,
        st?.name || nb.studentId,
        nb.classSection,
        nb.subject,
        nb.chapter,
        nb.checked ? 'Yes' : 'No',
        nb.checked ? nb.handwriting : 'Not Checked',
        nb.checked ? nb.workQuality : '',
        nb.homeworkDone ? 'Complete' : 'Not Complete',
        nb.remarks,
        nb.teacherName,
      ];
    });
    triggerCsvDownload(
      `${data.activeSchool.code.toLowerCase()}-notebook-checks.csv`,
      [
        'Date',
        'Student',
        'Class',
        'Subject',
        'Chapter',
        'Checked',
        'Handwriting',
        'Work Quality',
        'Homework Status',
        'Remarks',
        'Teacher',
      ],
      rowsCsv,
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Whole-Class Homework & Notebook Checking
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter notebook checks or manage class homework rosters once per section. Readability,
            Work Quality, and verified submissions sync automatically without duplicate teacher work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('dashboard')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            School Notebook Dashboard
          </button>
          <button
            type="button"
            onClick={() => setSubTab('notebook')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'notebook'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notebook Checking
          </button>
          <button
            type="button"
            onClick={() => setSubTab('homework')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'homework'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Class Homework ({data.homeworkAssignments?.length ?? 0})
          </button>
        </div>
      </div>

      {subTab === 'dashboard' ? (
        <SchoolNotebookDashboardPanel
          data={data}
          token={token}
          onRefresh={onRefresh}
          onOpenStudent={onOpenStudent}
        />
      ) : subTab === 'homework' ? (
        <HomeworkRosterPanel
          data={data}
          token={token}
          onRefresh={onRefresh}
          onOpenStudent={onOpenStudent}
        />
      ) : (
        <>
      <form onSubmit={handleSaveBatch} className="space-y-6">
        {/* Common Header Fields */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-3">
            <label htmlFor="nb-class" className="block text-xs font-semibold text-slate-700 mb-1">
              Class &amp; Section
            </label>
            <select
              id="nb-class"
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <label htmlFor="nb-subject" className="block text-xs font-semibold text-slate-700 truncate">
                Subject (Class {classSection})
              </label>
              <span className="text-[11px] font-medium text-blue-900 whitespace-nowrap shrink-0">
                {isCustomSubject ? 'Custom' : `${subjectResolution.subjects.length} subjects`}
              </span>
            </div>
            <select
              id="nb-subject"
              value={isCustomSubject ? '__CUSTOM__' : subject}
              onChange={(e) => handleSubjectSelectChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
            >
              {subjectResolution.subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="__CUSTOM__">Other / Custom Subject...</option>
            </select>
            {isCustomSubject ? (
              <input
                type="text"
                aria-label="Custom subject name"
                value={customSubjectInput}
                onChange={(e) => setCustomSubjectInput(e.target.value)}
                placeholder="Type subject name..."
                className="mt-1.5 w-full rounded-lg border border-blue-900 bg-white px-3 py-1.5 text-xs focus:outline-none"
              />
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 truncate" title={subjectResolution.autoSelectReason}>
                {subjectResolution.autoSelectReason}
              </p>
            )}
          </div>
          <div className="lg:col-span-4">
            <label htmlFor="nb-chapter" className="block text-xs font-semibold text-slate-700 mb-1">
              Chapter / Topic
            </label>
            <input
              id="nb-chapter"
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-900 focus:outline-none"
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="nb-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Checking Date
            </label>
            <input
              id="nb-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-mono focus:border-blue-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Live Pending Checking & Prior-Chapter Backlog Alert Strip */}
        {(livePendingSummary.priorChapterGapCount > 0 ||
          livePendingSummary.pendingHomeworkChecksCount > 0) && (
          <div
            data-testid="teacher-pending-checking-strip"
            className="rounded-xl border border-amber-300 bg-amber-50/80 px-5 py-3.5 text-xs text-amber-950 space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>
                  Pending Checking Alert — Class {classSection} ({effectiveSubject})
                </span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-amber-900 tabular-nums">
                {livePendingSummary.priorChapterGapStudentsCount} prior-chapter unchecked ·{' '}
                {livePendingSummary.pendingHomeworkChecksCount} pending HW check(s)
              </span>
            </div>
            {livePendingSummary.priorChapterGapCount > 0 && (
              <p className="text-amber-900 leading-relaxed">
                Earlier chapters are still <strong>Not Checked</strong> for highlighted students
                below even though the class has progressed to{' '}
                <strong>{chapter.trim() || 'a later chapter'}</strong>. Saving this batch will
                automatically push <strong>Prior-Chapter Backlog Alerts</strong> to Notebook Alerts
                for those students &amp; parents:{' '}
                <span className="font-semibold">
                  {livePendingSummary.rankedStudents
                    .filter((r) => r.priorChapterGaps.length > 0)
                    .slice(0, 4)
                    .map((r) => {
                      const uniqueChapters = Array.from(
                        new Set(r.priorChapterGaps.map((g) => g.missingChapterNo)),
                      );
                      return `${r.studentName} (${uniqueChapters.join(', ')} Not Checked)`;
                    })
                    .join(' · ')}
                  {livePendingSummary.priorChapterGapStudentsCount > 4
                    ? ` · +${livePendingSummary.priorChapterGapStudentsCount - 4} more`
                    : ''}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Whole-Class Entry Matrix — Fast Checkbox Input Mode (Part 5) */}
        <div
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              setSelectedRowIdx((idx) => Math.min(rows.length - 1, idx + 1));
            } else if (e.key === 'ArrowUp') {
              setSelectedRowIdx((idx) => Math.max(0, idx - 1));
            }
          }}
        >
          <div className="border-b border-slate-200 px-6 py-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-bold text-slate-900">
                  Class {classSection} Fast Checkbox Matrix ({rows.length} students)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A = Excellent (Independent &amp; correct) · B = Satisfactory (Attempt with minor mistakes) ·
                  C = Needs Improvement (Review required) · Use ↑/↓ keys to move between rows
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {draftSavedAt && (
                  <span
                    data-testid="notebook-autosave-indicator"
                    className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-semibold text-emerald-800 whitespace-nowrap"
                  >
                    Draft autosaved · {draftSavedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Bulk Quick-Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs">
              <span className="font-bold text-slate-700 mr-1">Bulk Quick Actions:</span>
              <button
                type="button"
                data-testid="bulk-mark-all-checked"
                onClick={() => handleMarkAllChecked(true)}
                className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-700"
              >
                ✓ Mark All Checked
              </button>
              <button
                type="button"
                onClick={() => handleMarkAllChecked(false)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Uncheck All
              </button>
              <button
                type="button"
                onClick={() => handleBulkHandwriting(true)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
              >
                All Readable
              </button>
              <button
                type="button"
                onClick={() => handleBulkHomeworkDone(true)}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                All HW Done
              </button>
              <div className="inline-flex items-center gap-1 ml-auto">
                <span className="text-[11px] font-semibold text-slate-600">Bulk Quality:</span>
                {(['A', 'B', 'C'] as WorkQualityRating[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleBulkQuality(g)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 font-bold text-slate-800 hover:bg-indigo-50 hover:border-indigo-400"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 font-semibold">Roll</th>
                  <th className="px-3 py-3 font-semibold">Student</th>
                  <th className="px-3 py-3 font-semibold text-center">Chapter Checked</th>
                  <th className="px-3 py-3 font-semibold text-center">Handwriting Readable</th>
                  <th className="px-3 py-3 font-semibold text-center">Work Quality (A / B / C)</th>
                  <th className="px-3 py-3 font-semibold text-center">Homework Done</th>
                  <th className="px-3 py-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, rowIndex) => {
                  const pendingRec = livePendingSummary.byStudentId[r.studentId];
                  const hasPriorGap = Boolean(pendingRec && pendingRec.priorChapterGaps.length > 0);
                  const hasPendingHw = Boolean(pendingRec && pendingRec.pendingHomeworks.length > 0);
                  const isFocused = rowIndex === selectedRowIdx;
                  return (
                  <tr
                    key={r.studentId}
                    onClick={() => setSelectedRowIdx(rowIndex)}
                    className={
                      isFocused
                        ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-300'
                        : hasPriorGap
                          ? 'bg-amber-50/55 hover:bg-amber-50'
                          : hasPendingHw
                            ? 'bg-blue-50/30 hover:bg-blue-50/50'
                            : 'hover:bg-slate-50/70'
                    }
                  >
                    <td className="px-3 py-3 font-mono text-slate-500 tabular-nums align-middle">{r.rollNo}</td>
                    <td className="px-3 py-3 align-middle min-w-[175px]">
                      <button
                        type="button"
                        onClick={() => onOpenStudent(r.studentId)}
                        className="font-semibold text-blue-900 hover:underline text-left"
                      >
                        {r.studentName}
                      </button>
                      {hasPriorGap && pendingRec && (
                        <p
                          data-testid={`row-prior-gap-${r.studentId}`}
                          className="text-[11px] font-semibold text-rose-700 mt-0.5 flex items-center gap-1 whitespace-nowrap"
                        >
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          <span>
                            {pendingRec.priorChapterGaps[0].missingChapterNo} Not Checked ·{' '}
                            {pendingRec.priorChapterGaps[0].chapterGap} ch behind
                          </span>
                        </p>
                      )}
                      {hasPendingHw && pendingRec && (
                        <p className="text-[11px] font-medium text-amber-800 mt-0.5 whitespace-nowrap">
                          {pendingRec.pendingHomeworks.length} HW pending check
                        </p>
                      )}
                    </td>
                    {/* 1. Chapter/Notebook Checked Checkbox */}
                    <td className="px-3 py-3 text-center align-middle">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 hover:border-indigo-400">
                        <input
                          type="checkbox"
                          aria-label={`Notebook checked for ${r.studentName}`}
                          checked={r.checked}
                          onChange={(e) => updateRow(r.studentId, { checked: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`font-semibold ${r.checked ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {r.checked ? 'Checked' : 'Unchecked'}
                        </span>
                      </label>
                    </td>
                    {/* 2. Handwriting Readable Checkbox */}
                    <td className="px-3 py-3 text-center align-middle">
                      <label
                        className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
                          !r.checked
                            ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                            : 'cursor-pointer border-slate-200 bg-white hover:border-indigo-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Handwriting readable for ${r.studentName}`}
                          disabled={!r.checked}
                          checked={r.handwriting === 'Readability'}
                          onChange={(e) =>
                            updateRow(r.studentId, {
                              handwriting: e.target.checked ? 'Readability' : 'Non-Readability',
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
                        />
                        <span className="font-semibold">
                          {r.handwriting === 'Readability' ? 'Readable' : 'Needs Neatness'}
                        </span>
                      </label>
                    </td>
                    {/* 3. Work Quality Mutually Exclusive Checkbox-Style A / B / C */}
                    <td className="px-3 py-3 text-center align-middle">
                      <div
                        role="radiogroup"
                        aria-label={`Work quality for ${r.studentName}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        {(
                          [
                            { grade: 'A' as WorkQualityRating, hint: 'A = Excellent', activeCls: 'border-emerald-600 bg-emerald-600 text-white' },
                            { grade: 'B' as WorkQualityRating, hint: 'B = Satisfactory', activeCls: 'border-sky-600 bg-sky-600 text-white' },
                            { grade: 'C' as WorkQualityRating, hint: 'C = Needs Improvement', activeCls: 'border-rose-600 bg-rose-600 text-white' },
                          ] as const
                        ).map((opt) => {
                          const selected = r.workQuality === opt.grade;
                          const disabledOpt = !r.checked || (opt.grade === 'A' && !r.homeworkDone);
                          return (
                            <button
                              key={opt.grade}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              title={
                                opt.grade === 'A' && !r.homeworkDone
                                  ? 'Grade A requires Homework Done'
                                  : opt.hint
                              }
                              disabled={disabledOpt}
                              onClick={() => updateRow(r.studentId, { workQuality: opt.grade })}
                              className={`inline-flex h-8 w-9 items-center justify-center rounded-lg border text-xs font-bold transition ${
                                selected && r.checked
                                  ? opt.activeCls
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                              } disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                              {selected && r.checked ? `✓${opt.grade}` : opt.grade}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    {/* 4. Homework Done Checkbox */}
                    <td className="px-3 py-3 text-center align-middle">
                      <label
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
                          r.homeworkDone
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                            : 'border-amber-400 bg-amber-50 text-amber-950'
                        }`}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Homework done for ${r.studentName}`}
                          checked={r.homeworkDone}
                          onChange={(e) => {
                            const isDone = e.target.checked;
                            updateRow(r.studentId, {
                              homeworkDone: isDone,
                              workQuality: !isDone && r.workQuality === 'A' ? 'B' : r.workQuality,
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">
                          {r.homeworkDone ? 'Done' : 'Incomplete'}
                        </span>
                      </label>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <input
                        type="text"
                        aria-label={`Remarks for ${r.studentName}`}
                        value={r.remarks}
                        onChange={(e) => updateRow(r.studentId, { remarks: e.target.value })}
                        placeholder="Optional note"
                        className="w-40 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            data-testid="notebook-sticky-save-bar"
            className="sticky bottom-2 z-20 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xs shadow-sm"
          >
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 tabular-nums">
                <span className="font-semibold text-slate-900">
                  {rows.filter((r) => r.checked).length}/{rows.length} Checked
                </span>
                <span className="hidden md:inline text-[11px] text-slate-500">
                  · Keys: A / B / C Grade · H Homework · ↑ ↓ Row
                </span>
              </div>
              {pendingIncompleteAlertRows.length > 0 ? (
                <p
                  data-testid="notebook-pending-alert-preview"
                  className="text-xs font-semibold text-rose-700 flex items-center gap-1.5"
                >
                  <BellRing className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Auto-Alert Armed: {pendingIncompleteAlertRows.length}{' '}
                    {pendingIncompleteAlertRows.length === 1 ? 'student' : 'students'} marked
                    Incomplete / Not Checked will automatically notify both Student &amp; Parent on
                    save.
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">
                  Deterministic source keys prevent duplicate scoring if this chapter check is updated.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="h-4 w-4" />
              {saving ? 'Syncing Evidence...' : 'Save Class Check & Sync OLQs'}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}
        {savedSuccess && (
          <div
            data-testid="notebook-save-success"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
        )}
        {dispatchedAlerts.length > 0 && (
          <div
            data-testid="notebook-alert-dispatch-banner"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900 space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold">
              <BellRing className="h-4 w-4 shrink-0 text-rose-700" />
              <span>
                System-Generated Incomplete Notebook Alert Dispatched to {dispatchedAlerts.length}{' '}
                {dispatchedAlerts.length === 1 ? 'Student & Parent' : 'Students & Parents'}
              </span>
            </div>
            <ul className="space-y-1 pl-6 list-disc text-rose-800">
              {dispatchedAlerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.studentName}</strong> &amp; Parent{' '}
                  <strong>{alert.guardianName}</strong> — {alert.subject} (
                  {alert.chapterNo !== '—'
                    ? `${alert.chapterNo}: ${alert.chapterName}`
                    : alert.chapterName}
                  , {alert.date}) marked <strong>{alert.notebookStatus}</strong>.
                </li>
              ))}
            </ul>
          </div>
        )}
        {dispatchedPriorChapterAlerts.length > 0 && (
          <div
            data-testid="prior-chapter-alert-dispatch-banner"
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950 space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
              <span>
                Prior-Chapter Unchecked Backlog Highlighted into Notebook Alerts (
                {dispatchedPriorChapterAlerts.length}{' '}
                {dispatchedPriorChapterAlerts.length === 1 ? 'Alert' : 'Alerts'})
              </span>
            </div>
            <ul className="space-y-1 pl-6 list-disc text-amber-900">
              {dispatchedPriorChapterAlerts.slice(0, 6).map((alert) => (
                <li key={alert.id}>
                  <strong>{alert.studentName}</strong> &amp; Parent{' '}
                  <strong>{alert.guardianName}</strong> —{' '}
                  <strong>
                    {alert.subject} {alert.chapterNo}: {alert.chapterName}
                  </strong>{' '}
                  still <strong>Not Checked</strong> while class started{' '}
                  <strong>{alert.currentClassChapter || chapter}</strong>
                  {alert.chapterGap ? ` (${alert.chapterGap} ch behind)` : ''}.
                </li>
              ))}
              {dispatchedPriorChapterAlerts.length > 6 && (
                <li className="font-mono text-[11px]">
                  +{dispatchedPriorChapterAlerts.length - 6} additional students highlighted in
                  Notebook Alerts.
                </li>
              )}
            </ul>
          </div>
        )}
        {resolvedAlertsCount > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-800" />
            <span>
              Automatically cleared {resolvedAlertsCount} previous incomplete-notebook{' '}
              {resolvedAlertsCount === 1 ? 'alert' : 'alerts'} now marked Complete.
            </span>
          </div>
        )}
      </form>

      {/* Recent Notebook History */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold text-slate-900">
            Recent Logged Notebook Checks
          </h2>
          <button
            type="button"
            onClick={handleExportNotebookCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 font-semibold">Student</th>
                <th className="px-5 py-2.5 font-semibold">Subject & Chapter</th>
                <th className="px-5 py-2.5 font-semibold">Handwriting</th>
                <th className="px-5 py-2.5 font-semibold">Quality</th>
                <th className="px-5 py-2.5 font-semibold">Homework</th>
                <th className="px-5 py-2.5 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.notebookEntries.slice(0, 8).map((nb) => {
                const st = data.students.find((s) => s.id === nb.studentId);
                return (
                  <tr key={nb.id} className="hover:bg-slate-50">
                    <td className="px-5 py-2.5 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {nb.date}
                    </td>
                    <td className="px-5 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                      {st?.name || nb.studentId}
                    </td>
                    <td className="px-5 py-2.5 text-slate-700">
                      {nb.subject} · {nb.chapter}
                    </td>
                    <td className="px-5 py-2.5 text-slate-700 whitespace-nowrap">
                      {nb.checked ? nb.handwriting : 'Not Checked'}
                    </td>
                    <td className="px-5 py-2.5 font-mono font-semibold text-blue-900 whitespace-nowrap">
                      {nb.checked ? `Grade ${nb.workQuality}` : '—'}
                    </td>
                    <td
                      className={`px-5 py-2.5 font-semibold whitespace-nowrap ${
                        nb.homeworkDone ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {nb.homeworkDone ? 'Complete' : 'Not Complete'}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">{nb.remarks || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
