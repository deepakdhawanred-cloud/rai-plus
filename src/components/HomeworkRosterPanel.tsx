import React, { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, ClipboardList, Plus } from 'lucide-react';
import type { HomeworkAssignment, HomeworkSubmissionStatus } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import { extractDefaultSubject, HOMEWORK_SUBMISSION_STATUSES } from '../utils/homeworkEngine';
import { resolveTodayIsoDate } from '../utils/visAcademicProgressEngine';

interface HomeworkRosterPanelProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent: (studentId: string) => void;
}

interface SubmissionDraft {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: HomeworkSubmissionStatus;
  feedback: string;
}

export const HomeworkRosterPanel: React.FC<HomeworkRosterPanelProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
}) => {
  const assignments = data.homeworkAssignments || [];
  const submissions = data.homeworkSubmissions || [];
  const availableClasses = Array.from(new Set(data.students.map((s) => s.classSection)));
  const todayIso = resolveTodayIsoDate();
  const defaultTeacherClass =
    data.user.classTeacherOf && availableClasses.includes(data.user.classTeacherOf)
      ? data.user.classTeacherOf
      : availableClasses[0] || '6-A';

  // Create Homework form state
  const [showCreator, setShowCreator] = useState(false);
  const [newClassSection, setNewClassSection] = useState(defaultTeacherClass);
  const [newSubject, setNewSubject] = useState(() => extractDefaultSubject(data.user.subjectSpecialty));
  const [newChapter, setNewChapter] = useState('Daily Classwork & Practice');
  const [newTitle, setNewTitle] = useState('');
  const [newAssignedDate, setNewAssignedDate] = useState(todayIso);
  const [newDueDate, setNewDueDate] = useState('2026-11-17');
  const [newInstructions, setNewInstructions] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected assignment + roster drafts
  const [statusFilter, setStatusFilter] = useState<'Active' | 'All' | 'Cancelled'>('Active');
  const filteredAssignments = useMemo(() => {
    const base = assignments.filter((a) =>
      statusFilter === 'All' ? true : a.status === statusFilter,
    );
    return [...base].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
      const aToday = a.assignedDate === todayIso ? 1 : 0;
      const bToday = b.assignedDate === todayIso ? 1 : 0;
      if (aToday !== bToday) return bToday - aToday;
      const dateCmp = b.assignedDate.localeCompare(a.assignedDate);
      if (dateCmp !== 0) return dateCmp;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });
  }, [assignments, statusFilter, todayIso]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    assignments[0]?.id || '',
  );

  useEffect(() => {
    if (!filteredAssignments.some((a) => a.id === selectedAssignmentId)) {
      setSelectedAssignmentId(filteredAssignments[0]?.id || '');
    }
  }, [filteredAssignments, selectedAssignmentId]);

  const activeAssignment: HomeworkAssignment | undefined =
    assignments.find((a) => a.id === selectedAssignmentId) || filteredAssignments[0];

  const [drafts, setDrafts] = useState<SubmissionDraft[]>([]);
  const [savingRoster, setSavingRoster] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeAssignment) {
      setDrafts([]);
      return;
    }
    const classStudents = data.students.filter(
      (s) => s.classSection === activeAssignment.classSection,
    );
    setDrafts(
      classStudents.map((st) => {
        const sub = submissions.find(
          (s) => s.assignmentId === activeAssignment.id && s.studentId === st.id,
        );
        return {
          studentId: st.id,
          studentName: st.name,
          rollNo: st.rollNo,
          status: sub?.status || 'Pending',
          feedback: sub?.feedback || '',
        };
      }),
    );
    setShowCancelBox(false);
    setCancelReason('');
  }, [activeAssignment, data.students, submissions]);

  async function handleCreateHomework(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFeedbackMsg(null);
    if (!newTitle.trim() || !newSubject.trim() || !newDueDate.trim()) {
      setErrorMsg('Subject, homework title, and due date are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await apiRequest<{ assignment: HomeworkAssignment }>(
        '/api/homework',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection: newClassSection,
            subject: newSubject,
            chapter: newChapter,
            title: newTitle,
            assignedDate: newAssignedDate || todayIso,
            dueDate: newDueDate,
            instructions: newInstructions,
          }),
        },
        token,
      );
      setNewTitle('');
      setNewInstructions('');
      setShowCreator(false);
      await onRefresh();
      setStatusFilter('Active');
      setSelectedAssignmentId(res.assignment.id);
      setFeedbackMsg(
        `Published daily homework "${res.assignment.title}" for Class ${res.assignment.classSection} (assigned ${res.assignment.assignedDate}). Visible immediately in every Class ${res.assignment.classSection} student profile.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to create homework assignment.');
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveRoster(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAssignment) return;
    setErrorMsg(null);
    setFeedbackMsg(null);
    setSavingRoster(true);
    try {
      await apiRequest(
        `/api/homework/${encodeURIComponent(activeAssignment.id)}/submissions`,
        {
          method: 'POST',
          body: JSON.stringify({
            rows: drafts.map((d) => ({
              studentId: d.studentId,
              status: d.status,
              feedback: d.feedback,
            })),
          }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(
        `Saved homework roster for "${activeAssignment.title}". Checked submissions synced to Learning Habits & OLQs (Pending rows stay unpenalized).`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save submission roster.');
    } finally {
      setSavingRoster(false);
    }
  }

  async function handleCancelAssignment() {
    if (!activeAssignment) return;
    setErrorMsg(null);
    setFeedbackMsg(null);
    setCancelling(true);
    try {
      await apiRequest(
        `/api/homework/${encodeURIComponent(activeAssignment.id)}/cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            reason: cancelReason.trim() || 'Cancelled by teacher; excluded from scoring.',
          }),
        },
        token,
      );
      setShowCancelBox(false);
      await onRefresh();
      setFeedbackMsg(
        `Cancelled "${activeAssignment.title}" and purged any linked homework evidence from student scores.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to cancel assignment.');
    } finally {
      setCancelling(false);
    }
  }

  function markAllPendingHandedIn() {
    setDrafts((prev) =>
      prev.map((d) => (d.status === 'Pending' ? { ...d, status: 'Handed In' } : d)),
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">
            Daily Class Homework &amp; Submission Roster
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Teachers post daily class homework once per section; every student&apos;s Student 360° profile
            displays the task, assigned teacher, and feedback immediately. Pending and Cancelled tasks
            never penalise Learning Habits or OLQs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreator((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 self-start md:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          {showCreator ? 'Close Daily Form' : 'Assign Daily Class Homework'}
        </button>
      </div>

      {/* Create Homework Form */}
      {showCreator && (
        <form
          onSubmit={handleCreateHomework}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h3 className="font-display text-sm font-bold text-slate-900">
            Publish Daily Class Homework Assignment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Class &amp; Section *</span>
              <select
                aria-label="Homework class section"
                value={newClassSection}
                onChange={(e) => setNewClassSection(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </label>
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Subject *</span>
              <input
                type="text"
                list="homework-subject-options"
                aria-label="Homework subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
              <datalist id="homework-subject-options">
                {data.user.subjectSpecialty && (
                  <option value={extractDefaultSubject(data.user.subjectSpecialty)} />
                )}
                <option value="Mathematics" />
                <option value="English" />
                <option value="Science" />
                <option value="Social Science" />
                <option value="Hindi" />
                <option value="Physics" />
                <option value="Chemistry" />
              </datalist>
            </label>
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Chapter / Topic</span>
              <input
                type="text"
                aria-label="Homework chapter"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Assigned Date *</span>
              <input
                type="date"
                aria-label="Homework assigned date"
                value={newAssignedDate}
                onChange={(e) => setNewAssignedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </label>
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Due Date *</span>
              <input
                type="date"
                aria-label="Homework due date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </label>
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Daily Task Title *</span>
              <input
                type="text"
                aria-label="Homework title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Ex. 4.3 Q1–Q6"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="block text-xs font-medium text-slate-700">
              Daily Instructions for Students &amp; Parents
            </span>
            <input
              type="text"
              aria-label="Homework instructions"
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              placeholder="Clear step-by-step instructions shown directly in Student 360° profiles & parent portal"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {creating ? 'Assigning...' : 'Publish Daily Homework'}
            </button>
          </div>
        </form>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMsg}
        </div>
      )}
      {feedbackMsg && (
        <div
          data-testid="homework-save-success"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Split Layout: Assignments List + Submission Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Daily Tasks ({filteredAssignments.length})
            </h3>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 text-[11px]">
              {(['Active', 'All', 'Cancelled'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md px-2 py-1 font-semibold transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
            {filteredAssignments.map((asg) => {
              const selected = activeAssignment?.id === asg.id;
              const asgSubs = submissions.filter((s) => s.assignmentId === asg.id);
              const handedCount = asgSubs.filter((s) => s.status === 'Handed In').length;
              const isToday = asg.assignedDate === todayIso && asg.status === 'Active';
              return (
                <button
                  key={asg.id}
                  type="button"
                  onClick={() => setSelectedAssignmentId(asg.id)}
                  className={`w-full text-left px-4 py-3 space-y-1 transition-colors ${
                    selected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-semibold text-blue-900">
                      Class {asg.classSection} · {asg.subject}
                    </span>
                    <span
                      className={`font-semibold font-mono tabular-nums ${
                        asg.status === 'Cancelled'
                          ? 'text-rose-700'
                          : isToday
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                      }`}
                    >
                      {asg.status === 'Cancelled'
                        ? 'Cancelled'
                        : isToday
                          ? `TODAY · Due ${asg.dueDate}`
                          : `Due ${asg.dueDate}`}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{asg.title}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    {handedCount}/{asgSubs.length} handed in · Assigned {asg.assignedDate} · {asg.createdBy}
                  </p>
                </button>
              );
            })}
            {filteredAssignments.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No homework assignments match this filter.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
          {activeAssignment ? (
            <form onSubmit={handleSaveRoster}>
              <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Class {activeAssignment.classSection} · {activeAssignment.subject} ·{' '}
                    {activeAssignment.chapter}
                  </p>
                  <h3 className="font-display text-base font-bold text-slate-900 mt-0.5">
                    {activeAssignment.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">{activeAssignment.instructions}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
                    Assigned {activeAssignment.assignedDate} · Due {activeAssignment.dueDate} · By{' '}
                    {activeAssignment.createdBy}
                  </p>
                  {activeAssignment.status === 'Cancelled' && (
                    <p className="text-xs font-semibold text-rose-700 mt-1">
                      Cancelled: {activeAssignment.cancellationReason}
                    </p>
                  )}
                </div>

                {activeAssignment.status === 'Active' && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={markAllPendingHandedIn}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      Mark Pending Handed In
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelBox((v) => !v)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 whitespace-nowrap"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Cancel Homework
                    </button>
                  </div>
                )}
              </div>

              {showCancelBox && activeAssignment.status === 'Active' && (
                <div className="border-b border-rose-200 bg-rose-50/70 px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    aria-label="Cancellation reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancelling (e.g. Chapter rescheduled after assembly)"
                    className="flex-1 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => void handleCancelAssignment()}
                    className="rounded-lg bg-rose-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 whitespace-nowrap"
                  >
                    {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Roll</th>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Submission Status</th>
                      <th className="px-4 py-3 font-semibold">Teacher Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drafts.map((row) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                          {row.rollNo}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onOpenStudent(row.studentId)}
                            className="font-semibold text-blue-900 hover:underline text-left"
                          >
                            {row.studentName}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            aria-label={`Homework status for ${row.studentName}`}
                            disabled={activeAssignment.status === 'Cancelled'}
                            value={row.status}
                            onChange={(e) => {
                              const next = e.target.value as HomeworkSubmissionStatus;
                              setDrafts((prev) =>
                                prev.map((d) =>
                                  d.studentId === row.studentId ? { ...d, status: next } : d,
                                ),
                              );
                            }}
                            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                              row.status === 'Handed In'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                : row.status === 'Missing'
                                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                                  : row.status === 'Late'
                                    ? 'border-blue-300 bg-blue-50 text-blue-900'
                                    : 'border-slate-300 bg-white text-slate-700'
                            }`}
                          >
                            {HOMEWORK_SUBMISSION_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st === 'Pending'
                                  ? 'Pending (Not Penalized)'
                                  : st === 'Missing'
                                    ? 'Missing (Not Complete)'
                                    : st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            aria-label={`Homework feedback for ${row.studentName}`}
                            disabled={activeAssignment.status === 'Cancelled'}
                            value={row.feedback}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDrafts((prev) =>
                                prev.map((d) =>
                                  d.studentId === row.studentId ? { ...d, feedback: val } : d,
                                ),
                              );
                            }}
                            placeholder="Constructive guidance visible to parents..."
                            className="w-full min-w-[200px] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs disabled:bg-slate-100"
                          />
                        </td>
                      </tr>
                    ))}
                    {drafts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                          No students enrolled in Class {activeAssignment.classSection} yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {activeAssignment.status === 'Active' && drafts.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-slate-600">
                    Only Handed In, Late, and Missing states write deterministic homework evidence.
                    Pending rows remain neutral.
                  </p>
                  <button
                    type="submit"
                    disabled={savingRoster}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {savingRoster ? 'Saving Roster...' : 'Save Submission Roster'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select or create a class homework assignment to mark student submissions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
