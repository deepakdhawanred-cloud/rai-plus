import React, { useEffect, useMemo, useState } from 'react';
import { BookOpenCheck, Check, ClipboardList, X } from 'lucide-react';
import type { HomeworkAssignment } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  buildTeacherClassTargets,
  extractDefaultSubject,
  validateHomeworkModalDraft,
} from '../utils/homeworkEngine';
import { resolveTodayIsoDate } from '../utils/visAcademicProgressEngine';

interface AssignHomeworkModalProps {
  open: boolean;
  onClose: () => void;
  data: WorkspaceData;
  token: string;
  initialClassSection?: string;
  initialSubject?: string;
  onRefresh: () => Promise<void>;
  onPublished?: (result: {
    assignments: HomeworkAssignment[];
    totalStudents: number;
    sampleStudentId: string | null;
  }) => void;
}

function nextCalendarDayIso(iso: string): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return iso;
  dt.setUTCDate(dt.getUTCDate() + 1);
  return dt.toISOString().slice(0, 10);
}

export const AssignHomeworkModal: React.FC<AssignHomeworkModalProps> = ({
  open,
  onClose,
  data,
  token,
  initialClassSection,
  initialSubject,
  onRefresh,
  onPublished,
}) => {
  const todayIso = resolveTodayIsoDate();
  const defaultDueIso = nextCalendarDayIso(todayIso);

  const classTargets = useMemo(
    () =>
      buildTeacherClassTargets({
        students: data.students,
        timetable: data.timetable,
        userName: data.user.name,
        classTeacherOf: data.user.classTeacherOf,
        defaultSubject: extractDefaultSubject(data.user.subjectSpecialty),
      }),
    [data.students, data.timetable, data.user.name, data.user.classTeacherOf, data.user.subjectSpecialty],
  );

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [subject, setSubject] = useState(() =>
    extractDefaultSubject(data.user.subjectSpecialty),
  );
  const [chapter, setChapter] = useState('Daily Classwork & Practice');
  const [title, setTitle] = useState('');
  const [assignedDate, setAssignedDate] = useState(todayIso);
  const [dueDate, setDueDate] = useState(defaultDueIso);
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const matchedTarget = initialClassSection
      ? classTargets.find(
          (t) => t.classSection.toLowerCase() === initialClassSection.trim().toLowerCase(),
        )
      : undefined;
    const defaultTarget = matchedTarget || classTargets[0];
    setSelectedClasses(defaultTarget ? [defaultTarget.classSection] : []);
    setSubject(
      initialSubject?.trim() ||
        defaultTarget?.subjectsTaught[0] ||
        extractDefaultSubject(data.user.subjectSpecialty),
    );
    setChapter('Daily Classwork & Practice');
    setTitle('');
    setAssignedDate(todayIso);
    setDueDate(defaultDueIso);
    setInstructions('');
    setErrorMsg(null);
  }, [
    open,
    initialClassSection,
    initialSubject,
    classTargets,
    data.user.subjectSpecialty,
    todayIso,
    defaultDueIso,
  ]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  const subjectSuggestions = useMemo(() => {
    const set = new Set<string>();
    if (initialSubject?.trim()) set.add(initialSubject.trim());
    if (data.user.subjectSpecialty) set.add(extractDefaultSubject(data.user.subjectSpecialty));
    for (const cls of selectedClasses) {
      const target = classTargets.find((t) => t.classSection === cls);
      for (const s of target?.subjectsTaught || []) set.add(s);
    }
    for (const core of [
      'Mathematics',
      'English',
      'Science',
      'Social Science',
      'Hindi',
      'Physics',
      'Chemistry',
      'Computer Science',
    ]) {
      set.add(core);
    }
    return Array.from(set);
  }, [initialSubject, data.user.subjectSpecialty, selectedClasses, classTargets]);

  const totalTargetedStudents = useMemo(
    () =>
      classTargets
        .filter((t) => selectedClasses.includes(t.classSection))
        .reduce((acc, t) => acc + t.studentCount, 0),
    [classTargets, selectedClasses],
  );

  if (!open) return null;

  function toggleClassSection(classSection: string) {
    setSelectedClasses((prev) =>
      prev.includes(classSection)
        ? prev.filter((c) => c !== classSection)
        : [...prev, classSection],
    );
    setErrorMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const check = validateHomeworkModalDraft({
      selectedClasses,
      subject,
      title,
      dueDate,
    });
    if (!check.valid) {
      setErrorMsg(check.error || 'Please complete all required homework fields.');
      return;
    }

    setSubmitting(true);
    try {
      const createdAssignments: HomeworkAssignment[] = [];
      let totalStudents = 0;

      for (const classSection of selectedClasses) {
        const res = await apiRequest<{
          assignment: HomeworkAssignment;
          submissions: Array<{ studentId: string }>;
        }>(
          '/api/homework',
          {
            method: 'POST',
            body: JSON.stringify({
              classSection,
              subject: subject.trim(),
              chapter: chapter.trim() || 'Daily Practice',
              title: title.trim(),
              assignedDate: assignedDate || todayIso,
              dueDate: dueDate.trim(),
              instructions:
                instructions.trim() || 'Complete neatly in subject notebook and bring for review.',
            }),
          },
          token,
        );
        createdAssignments.push(res.assignment);
        totalStudents += res.submissions?.length ?? 0;
      }

      const firstTarget = classTargets.find((t) => t.classSection === selectedClasses[0]);
      await onRefresh();
      onPublished?.({
        assignments: createdAssignments,
        totalStudents,
        sampleStudentId: firstTarget?.sampleStudentId ?? null,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to push homework task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-homework-modal-title"
        data-testid="assign-homework-modal"
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2
              id="assign-homework-modal-title"
              className="font-display text-base font-bold text-slate-900 flex items-center gap-2"
            >
              <BookOpenCheck className="h-4 w-4 text-blue-900 shrink-0" />
              Assign Daily Homework to Class Profiles
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Posted by {data.user.name} · Syncs immediately to each selected class&apos;s Student 360° &amp; Parent Portal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close Assign Homework modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Target Class Profiles Selector */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800">
                1. Select Specific Class Profile(s) *
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-600 tabular-nums">
                  {selectedClasses.length} selected · {totalTargetedStudents} student profiles
                </span>
                {classTargets.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedClasses(
                        selectedClasses.length === classTargets.length
                          ? [classTargets[0].classSection]
                          : classTargets.map((t) => t.classSection),
                      )
                    }
                    className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                  >
                    {selectedClasses.length === classTargets.length ? 'Reset to First' : 'Select All'}
                  </button>
                )}
              </div>
            </div>

            {classTargets.length === 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
                No active class sections are assigned to your faculty profile yet.
              </div>
            ) : (
              <div
                role="group"
                aria-label="Target class profiles"
                className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1"
              >
                {classTargets.map((target) => {
                  const selected = selectedClasses.includes(target.classSection);
                  return (
                    <button
                      key={target.classSection}
                      type="button"
                      onClick={() => toggleClassSection(target.classSection)}
                      aria-pressed={selected}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
                        selected
                          ? 'border-blue-900 bg-blue-900 text-white font-semibold'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                      <span>Class {target.classSection}</span>
                      <span
                        className={`font-mono text-[11px] tabular-nums ${
                          selected ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {target.studentCount} stu
                        {target.isClassTeacher ? ' · Homeroom' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Daily Task Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Subject *</span>
              <input
                type="text"
                list="modal-homework-subjects"
                aria-label="Modal homework subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
              />
              <datalist id="modal-homework-subjects">
                {subjectSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Chapter / Topic</span>
              <input
                type="text"
                aria-label="Modal homework chapter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Ch. 4: Carbon & Its Compounds"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
              />
            </label>

            <label className="sm:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Daily Task Title *</span>
              <input
                type="text"
                aria-label="Modal homework title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solve Ex. 4.2 Q1–Q5 & Balance 4 Equations"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Assigned Date *</span>
              <input
                type="date"
                aria-label="Modal homework assigned date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 tabular-nums focus:border-blue-900 focus:outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Due Date *</span>
              <input
                type="date"
                aria-label="Modal homework due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 tabular-nums focus:border-blue-900 focus:outline-none"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="block text-xs font-medium text-slate-700">
              Instructions Shown Inside Student &amp; Parent Profiles
            </span>
            <textarea
              rows={3}
              aria-label="Modal homework instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Write clear steps, page numbers, or practice problems that students and parents see inside their daily class profile..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none resize-none"
            />
          </label>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500">
              Pending submissions never penalise Learning Habits or OLQs until checked.
            </p>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || classTargets.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                {submitting
                  ? 'Pushing Task...'
                  : `Push to ${selectedClasses.length || 0} Class Profile${selectedClasses.length === 1 ? '' : 's'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
