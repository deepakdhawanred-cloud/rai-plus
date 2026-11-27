import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  GripVertical,
  Sparkles,
  Undo2,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  VIS_CLASS_ORDER,
  VIS_CLASS_TEACHERS,
  VIS_DAYS,
  VIS_FACULTY_USERS,
  VIS_TIMETABLE_PDF_PATH,
} from '../data/visTimetableNov2026';
import type { TimetableSlot, UserAccount } from '../types';
import {
  buildClassWeeklyMatrix,
  buildTeacherWeeklyMatrix,
  mapTimetableSlotToCurriculumKey,
  teacherMatchesSlot,
} from '../utils/academicOperationsEngine';
import { apiRequest } from '../utils/api';
import {
  computeTeacherScheduleOptimizationSuggestions,
  evaluatePeriodDrop,
} from '../utils/timetableDragDropEngine';

interface TimetableExplorerPanelProps {
  timetable: TimetableSlot[];
  user: UserAccount;
  schoolId: string;
  canEdit: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenClassSubjectResources?: (classKey: string, subjectKey: string) => void;
}

interface LastMoveRecord {
  sourceSlotId: string;
  originalDay: string;
  originalPeriod: number;
  targetSlotId?: string | null;
  summary: string;
}

export const TimetableExplorerPanel: React.FC<TimetableExplorerPanelProps> = ({
  timetable,
  user,
  schoolId,
  canEdit,
  token,
  onRefresh,
  onOpenClassSubjectResources,
}) => {
  const isVis = schoolId === 'school-vis-jjr';
  const isParentOrStudent = user.role === 'parent' || user.role === 'student';
  const isLeadership = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    user.role,
  );
  const canEditSubstitutions = isLeadership && canEdit;

  const availableClasses = useMemo(() => {
    const present = Array.from(new Set(timetable.map((t) => t.classSection)));
    if (!isVis) return present.sort();
    const orderIdx = new Map<string, number>(VIS_CLASS_ORDER.map((c, idx) => [c, idx]));
    return present.sort(
      (a, b) => (orderIdx.get(a) ?? 999) - (orderIdx.get(b) ?? 999) || a.localeCompare(b),
    );
  }, [timetable, isVis]);

  const facultyNames = useMemo(() => {
    const names = new Set<string>();
    if (isLeadership && isVis) {
      VIS_FACULTY_USERS.forEach((f) => names.add(f.name));
      names.add('Dr. Deepak Dhawan');
      names.add('Praveen Kumar Kaushik');
    }
    for (const slot of timetable) {
      slot.teacherName
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((n) => names.add(n));
    }
    return Array.from(names).sort();
  }, [timetable, isVis, isLeadership]);

  const matchedTeacherDefault = useMemo(() => {
    if (user.role === 'teacher' || user.role === 'principal') {
      const match = facultyNames.find((fn) => teacherMatchesSlot(fn, user.name));
      if (match) return match;
    }
    return facultyNames[0] || user.name;
  }, [facultyNames, user.name, user.role]);

  const [mode, setMode] = useState<'class' | 'teacher'>(
    user.role === 'teacher' && !isParentOrStudent ? 'teacher' : 'teacher',
  );
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (user.classTeacherOf && availableClasses.includes(user.classTeacherOf)) {
      return user.classTeacherOf;
    }
    return availableClasses[0] || '';
  });
  const [selectedTeacher, setSelectedTeacher] = useState<string>(matchedTeacherDefault);

  const effectiveMode: 'class' | 'teacher' = isParentOrStudent ? 'class' : mode;
  const effectiveClass = availableClasses.includes(selectedClass)
    ? selectedClass
    : availableClasses[0] || '';
  const effectiveTeacher =
    user.role === 'teacher' ? matchedTeacherDefault : selectedTeacher || matchedTeacherDefault;

  const [editingSubSlot, setEditingSubSlot] = useState<TimetableSlot | null>(null);
  const [subTeacherName, setSubTeacherName] = useState('');
  const [subSaving, setSubSaving] = useState(false);
  const [subFeedback, setSubFeedback] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  // Drag-and-drop & click-to-move period state
  const [draggingSlotId, setDraggingSlotId] = useState<string | null>(null);
  const [hoverCellKey, setHoverCellKey] = useState<string | null>(null);
  const [moveBusy, setMoveBusy] = useState<boolean>(false);
  const [lastMove, setLastMove] = useState<LastMoveRecord | null>(null);

  const classMatrix = useMemo(
    () => buildClassWeeklyMatrix(timetable, effectiveClass),
    [timetable, effectiveClass],
  );
  const teacherMatrix = useMemo(
    () => buildTeacherWeeklyMatrix(timetable, effectiveTeacher),
    [timetable, effectiveTeacher],
  );

  const teacherOptimization = useMemo(
    () =>
      effectiveMode === 'teacher'
        ? computeTeacherScheduleOptimizationSuggestions(timetable, effectiveTeacher, 3)
        : null,
    [effectiveMode, timetable, effectiveTeacher],
  );

  const activeDraggingSlot = useMemo(
    () => (draggingSlotId ? timetable.find((s) => s.id === draggingSlotId) || null : null),
    [draggingSlotId, timetable],
  );

  const classTeacherName = isVis ? VIS_CLASS_TEACHERS[effectiveClass] : undefined;

  async function executeMoveOrSwap(params: {
    sourceSlotId: string;
    targetDay: string;
    targetPeriod: number;
    targetSlotId?: string | null;
    isUndo?: boolean;
  }) {
    const evaluation = evaluatePeriodDrop({
      slots: timetable,
      sourceSlotId: params.sourceSlotId,
      targetDay: params.targetDay,
      targetPeriod: params.targetPeriod,
      targetSlotId: params.targetSlotId || null,
    });

    if (!evaluation.allowed) {
      setDropError(evaluation.conflicts[0] || evaluation.summary);
      setDraggingSlotId(null);
      setHoverCellKey(null);
      return;
    }

    setMoveBusy(true);
    setDropError(null);
    setSubFeedback(null);
    try {
      const res = await apiRequest<{
        ok: boolean;
        action: 'move' | 'swap';
        summary: string;
        warnings?: string[];
      }>(
        '/api/timetable/move-or-swap',
        {
          method: 'POST',
          body: JSON.stringify({
            sourceSlotId: params.sourceSlotId,
            targetDay: params.targetDay,
            targetPeriod: params.targetPeriod,
            targetSlotId: params.targetSlotId || null,
          }),
        },
        token,
      );
      await onRefresh();
      const warningNote =
        res.warnings && res.warnings.length > 0 ? ` (Note: ${res.warnings[0]})` : '';
      setSubFeedback(`${res.summary}${warningNote}`);
      if (params.isUndo) {
        setLastMove(null);
      } else if (evaluation.sourceBefore) {
        setLastMove({
          sourceSlotId: evaluation.sourceBefore.id,
          originalDay: evaluation.sourceBefore.day,
          originalPeriod: evaluation.sourceBefore.period,
          targetSlotId: evaluation.targetBefore?.id || null,
          summary: res.summary,
        });
      }
    } catch (err) {
      setDropError(err instanceof Error ? err.message : 'Unable to move period.');
    } finally {
      setMoveBusy(false);
      setDraggingSlotId(null);
      setHoverCellKey(null);
    }
  }

  async function handleSaveSubstitution(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSubSlot) return;
    setSubSaving(true);
    setSubFeedback(null);
    try {
      await apiRequest(
        '/api/timetable/substitution',
        {
          method: 'POST',
          body: JSON.stringify({
            slotId: editingSubSlot.id,
            substitutionTeacher: subTeacherName.trim(),
          }),
        },
        token,
      );
      await onRefresh();
      setSubFeedback(
        subTeacherName.trim()
          ? `Assigned substitution ${subTeacherName.trim()} for Class ${editingSubSlot.classSection} (${editingSubSlot.day} P${editingSubSlot.period}).`
          : `Cleared substitution on Class ${editingSubSlot.classSection} (${editingSubSlot.day} P${editingSubSlot.period}).`,
      );
      setEditingSubSlot(null);
      setSubTeacherName('');
    } finally {
      setSubSaving(false);
    }
  }

  return (
    <div className="space-y-5" data-testid="timetable-explorer-panel">
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-900" />
              {isParentOrStudent
                ? `Class Weekly Timetable${effectiveClass ? ` — Class ${effectiveClass}` : ''}`
                : user.role === 'teacher'
                  ? `My Assigned Weekly Timetable (${user.name})`
                  : isVis
                    ? 'Interactive Weekly Schedule, Drag-and-Drop Optimizer & Substitutions'
                    : 'Interactive Weekly Timetable & Faculty Substitutions'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isParentOrStudent
                ? 'Restricted strictly to your linked child’s class schedule (Mon–Sat · Periods 1–8 · Diary Check 14:00–14:10).'
                : user.role === 'teacher'
                  ? 'Scoped to your assigned teaching periods and homeroom class timetable.'
                  : 'Drag any period card onto an empty slot to move or onto another period to swap — live clash protection checks teacher & class conflicts automatically.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {lastMove && canEditSubstitutions && (
              <button
                type="button"
                disabled={moveBusy}
                onClick={() =>
                  executeMoveOrSwap({
                    sourceSlotId: lastMove.sourceSlotId,
                    targetDay: lastMove.originalDay,
                    targetPeriod: lastMove.originalPeriod,
                    targetSlotId: lastMove.targetSlotId,
                    isUndo: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo Last Move
              </button>
            )}
            {isVis && isLeadership && (
              <a
                href={VIS_TIMETABLE_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-900" />
                Official Nov 2026 PDF
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {!isParentOrStudent && (
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('teacher');
                    setDraggingSlotId(null);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    effectiveMode === 'teacher'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {user.role === 'teacher' ? 'My Periods' : `By Teacher (${facultyNames.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('class');
                    setDraggingSlotId(null);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    effectiveMode === 'class'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Class ({availableClasses.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {effectiveMode === 'class' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Class & Section:</span>
              {availableClasses.length > 1 ? (
                <select
                  id="tt-class-select"
                  aria-label="Class and section"
                  value={effectiveClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setDraggingSlotId(null);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                      {VIS_CLASS_TEACHERS[cls] ? ` (CT: ${VIS_CLASS_TEACHERS[cls]})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  data-testid="locked-timetable-class"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  Class {effectiveClass || '—'}
                </span>
              )}
              {classTeacherName && (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-900">
                  <UserCheck className="h-3.5 w-3.5" />
                  Class Teacher: {classTeacherName}
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {classMatrix.totalPeriods} scheduled weekly periods
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Faculty Teacher:</span>
              {isLeadership ? (
                <select
                  id="tt-teacher-select"
                  aria-label="Faculty teacher"
                  value={effectiveTeacher}
                  onChange={(e) => {
                    setSelectedTeacher(e.target.value);
                    setDraggingSlotId(null);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  {facultyNames.map((fn) => (
                    <option key={fn} value={fn}>
                      {fn}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900">
                  {effectiveTeacher}
                </span>
              )}
              {canEditSubstitutions && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800">
                  <GripVertical className="h-3 w-3" />
                  Drag or Click-Pick any period to Move / Swap
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="font-mono font-semibold text-blue-900 tabular-nums">
                {teacherMatrix.totalWeeklyPeriods} periods/week
              </span>
              <span>·</span>
              <span>
                Classes:{' '}
                <strong className="text-slate-800">
                  {teacherMatrix.classesTaught.join(', ') || 'None'}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* Active Drag / Pick Indicator Banner */}
        {activeDraggingSlot && canEditSubstitutions && (
          <div className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-indigo-700 shrink-0" />
              <span>
                Moving{' '}
                <strong>
                  {activeDraggingSlot.subject} (Class {activeDraggingSlot.classSection} ·{' '}
                  {activeDraggingSlot.day} P{activeDraggingSlot.period})
                </strong>{' '}
                — drop or click any <strong className="text-emerald-700">green</strong> cell to
                move/swap. <strong className="text-rose-700">Red</strong> cells have a teacher/class clash.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraggingSlotId(null);
                setHoverCellKey(null);
              }}
              className="rounded-md border border-indigo-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-900 hover:bg-indigo-100"
            >
              Cancel Pick
            </button>
          </div>
        )}

        {subFeedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {subFeedback}
          </div>
        )}

        {dropError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {dropError}
          </div>
        )}

        {/* Teacher Schedule Optimization Suggestions Strip */}
        {effectiveMode === 'teacher' &&
          canEditSubstitutions &&
          teacherOptimization &&
          teacherOptimization.suggestions.length > 0 && (
            <div
              data-testid="teacher-optimization-suggestions"
              className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                  Smart Teacher Schedule Optimization ({teacherOptimization.suggestions.length}{' '}
                  conflict-free move{teacherOptimization.suggestions.length > 1 ? 's' : ''})
                </div>
                <span className="text-[11px] text-emerald-800 font-mono">
                  Max back-to-back run: {teacherOptimization.maxConsecutiveRun} periods
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {teacherOptimization.suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className="rounded-lg border border-emerald-200/80 bg-white p-2.5 flex flex-col justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {sug.sourceSlot.subject} (Class {sug.sourceSlot.classSection})
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{sug.reason}</p>
                      <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                        Move: {sug.sourceSlot.day.slice(0, 3)} P{sug.sourceSlot.period} →{' '}
                        {sug.targetDay.slice(0, 3)} P{sug.targetPeriod}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={moveBusy}
                      onClick={() =>
                        executeMoveOrSwap({
                          sourceSlotId: sug.sourceSlot.id,
                          targetDay: sug.targetDay,
                          targetPeriod: sug.targetPeriod,
                        })
                      }
                      className="w-full rounded-md bg-emerald-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors"
                    >
                      {moveBusy ? 'Optimizing…' : 'Apply 1-Click Optimization'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Inline Substitution Editor */}
      {editingSubSlot && canEditSubstitutions && (
        <form
          onSubmit={handleSaveSubstitution}
          className="rounded-xl border border-amber-300 bg-amber-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div>
            <p className="font-bold text-slate-900">
              Substitution for Class {editingSubSlot.classSection} · {editingSubSlot.day} P
              {editingSubSlot.period} ({editingSubSlot.subject})
            </p>
            <p className="text-slate-600">
              Regular Faculty: {editingSubSlot.teacherName} · {editingSubSlot.timeRange}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              aria-label="Substitution teacher name"
              value={subTeacherName}
              onChange={(e) => setSubTeacherName(e.target.value)}
              placeholder="Enter substitute teacher (blank to clear)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs w-56"
            />
            <button
              type="submit"
              disabled={subSaving}
              className="rounded-lg bg-blue-900 px-3 py-1.5 font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
            >
              {subSaving ? 'Saving...' : 'Save Sub'}
            </button>
            <button
              type="button"
              onClick={() => setEditingSubSlot(null)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Weekly Mon-Sat Drag & Drop Grid */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200 w-20">
                Day
              </th>
              {classMatrix.periods.slice(0, 4).map((p) => (
                <th key={p.period} className="px-2.5 py-2 border-r border-slate-200 text-center">
                  <span className="block font-bold text-slate-800 whitespace-nowrap">{p.label}</span>
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {p.timeRange}
                  </span>
                </th>
              ))}
              <th className="px-2 py-2 border-r border-slate-200 bg-amber-50/80 text-center w-16">
                <span className="block font-bold text-amber-900">Break</span>
                <span className="font-mono text-[10px] text-amber-700">11:25</span>
              </th>
              {classMatrix.periods.slice(4, 8).map((p) => (
                <th key={p.period} className="px-2.5 py-2 border-r border-slate-200 text-center">
                  <span className="block font-bold text-slate-800 whitespace-nowrap">{p.label}</span>
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                    {p.timeRange}
                  </span>
                </th>
              ))}
              <th className="px-2 py-2 bg-amber-50/50 text-center w-16">
                <span className="block font-bold text-slate-800">Diary</span>
                <span className="font-mono text-[10px] text-slate-500">14:00</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {VIS_DAYS.map((day) => {
              const dayLoad = teacherOptimization?.dailyCounts[day];
              return (
                <tr key={day} className="hover:bg-slate-50/40">
                  <td className="px-3 py-3 font-bold text-blue-900 bg-slate-50/60 border-r border-slate-200 align-top">
                    <div>{day.slice(0, 3)}</div>
                    {effectiveMode === 'teacher' && typeof dayLoad === 'number' && (
                      <div
                        className={`mt-1 text-[10px] font-mono ${
                          dayLoad >= 6 ? 'text-amber-700 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {dayLoad}/8 P
                      </div>
                    )}
                  </td>
                  {[1, 2, 3, 4].map((pNum) =>
                    renderPeriodCell({
                      cellKey: `${day}-${pNum}`,
                      day,
                      period: pNum,
                      mode: effectiveMode,
                      slot: effectiveMode === 'class' ? classMatrix.grid[day]?.[pNum] : null,
                      teacherSlots:
                        effectiveMode === 'teacher' ? teacherMatrix.grid[day]?.[pNum] || [] : [],
                      allSlots: timetable,
                      canDragDrop: canEditSubstitutions && !moveBusy,
                      draggingSlotId,
                      hoverCellKey,
                      onStartDrag: (slotId) => {
                        setDropError(null);
                        setDraggingSlotId(slotId);
                      },
                      onEndDrag: () => {
                        setDraggingSlotId(null);
                        setHoverCellKey(null);
                      },
                      onHoverCell: setHoverCellKey,
                      onDropOnCell: (sourceId, targetDay, targetPeriod, targetSlotId) => {
                        void executeMoveOrSwap({
                          sourceSlotId: sourceId,
                          targetDay,
                          targetPeriod,
                          targetSlotId,
                        });
                      },
                      canEditSubstitutions,
                      onSub: (s) => {
                        setEditingSubSlot(s);
                        setSubTeacherName(s.substitutionTeacher || '');
                      },
                      onOpenResources: !isParentOrStudent ? onOpenClassSubjectResources : undefined,
                    }),
                  )}
                  <td className="px-2 py-2 border-r border-slate-200 bg-amber-50/40 text-center font-mono text-[10px] text-amber-800">
                    Break 1
                  </td>
                  {[5, 6, 7, 8].map((pNum) =>
                    renderPeriodCell({
                      cellKey: `${day}-${pNum}`,
                      day,
                      period: pNum,
                      mode: effectiveMode,
                      slot: effectiveMode === 'class' ? classMatrix.grid[day]?.[pNum] : null,
                      teacherSlots:
                        effectiveMode === 'teacher' ? teacherMatrix.grid[day]?.[pNum] || [] : [],
                      allSlots: timetable,
                      canDragDrop: canEditSubstitutions && !moveBusy,
                      draggingSlotId,
                      hoverCellKey,
                      onStartDrag: (slotId) => {
                        setDropError(null);
                        setDraggingSlotId(slotId);
                      },
                      onEndDrag: () => {
                        setDraggingSlotId(null);
                        setHoverCellKey(null);
                      },
                      onHoverCell: setHoverCellKey,
                      onDropOnCell: (sourceId, targetDay, targetPeriod, targetSlotId) => {
                        void executeMoveOrSwap({
                          sourceSlotId: sourceId,
                          targetDay,
                          targetPeriod,
                          targetSlotId,
                        });
                      },
                      canEditSubstitutions,
                      onSub: (s) => {
                        setEditingSubSlot(s);
                        setSubTeacherName(s.substitutionTeacher || '');
                      },
                      onOpenResources: !isParentOrStudent ? onOpenClassSubjectResources : undefined,
                    }),
                  )}
                  <td className="px-2 py-2 bg-amber-50/30 text-center font-mono text-[10px] text-slate-600">
                    Diary
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {effectiveMode === 'teacher' && (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="h-4 w-4 text-blue-900" />
            <span>
              <strong>{effectiveTeacher}</strong> teaches{' '}
              <strong>{teacherMatrix.subjectsTaught.join(', ') || 'No assigned subjects'}</strong>{' '}
              across <strong>{teacherMatrix.classesTaught.length}</strong> class section(s).
            </span>
          </div>
          <span className="font-mono text-slate-500">
            TimetableMaster · Live Drag-and-Drop Sync Enabled
          </span>
        </div>
      )}
    </div>
  );
};

function renderPeriodCell(params: {
  cellKey: string;
  day: string;
  period: number;
  mode: 'class' | 'teacher';
  slot: TimetableSlot | null;
  teacherSlots: TimetableSlot[];
  allSlots: TimetableSlot[];
  canDragDrop: boolean;
  draggingSlotId: string | null;
  hoverCellKey: string | null;
  onStartDrag: (slotId: string) => void;
  onEndDrag: () => void;
  onHoverCell: (cellKey: string | null) => void;
  onDropOnCell: (
    sourceId: string,
    targetDay: string,
    targetPeriod: number,
    targetSlotId?: string | null,
  ) => void;
  canEditSubstitutions: boolean;
  onSub: (slot: TimetableSlot) => void;
  onOpenResources?: (classKey: string, subjectKey: string) => void;
}) {
  const slots =
    params.mode === 'class' ? (params.slot ? [params.slot] : []) : params.teacherSlots;
  const primaryTargetSlot = slots[0] || null;
  const isSourceInCell = Boolean(
    params.draggingSlotId && slots.some((s) => s.id === params.draggingSlotId),
  );

  // Live conflict check while dragging/picking a period
  const dropPreview =
    params.canDragDrop && params.draggingSlotId && !isSourceInCell
      ? evaluatePeriodDrop({
          slots: params.allSlots,
          sourceSlotId: params.draggingSlotId,
          targetDay: params.day,
          targetPeriod: params.period,
          targetSlotId: primaryTargetSlot?.id || null,
        })
      : null;

  const isHovering = params.hoverCellKey === params.cellKey;
  const dropHighlightClass = dropPreview
    ? dropPreview.allowed
      ? isHovering
        ? 'bg-emerald-100/90 ring-2 ring-inset ring-emerald-500'
        : 'bg-emerald-50/45 ring-1 ring-inset ring-emerald-200/80'
      : isHovering
        ? 'bg-rose-100/90 ring-2 ring-inset ring-rose-500'
        : 'bg-rose-50/40'
    : '';

  const handleDragOver = (e: React.DragEvent) => {
    if (!params.canDragDrop || !params.draggingSlotId || isSourceInCell) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = dropPreview?.allowed ? 'move' : 'none';
    if (params.hoverCellKey !== params.cellKey) {
      params.onHoverCell(params.cellKey);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!params.canDragDrop) return;
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || params.draggingSlotId;
    if (!sourceId || isSourceInCell) return;
    params.onDropOnCell(sourceId, params.day, params.period, primaryTargetSlot?.id || null);
  };

  if (slots.length === 0) {
    return (
      <td
        key={params.cellKey}
        onDragOver={handleDragOver}
        onDragLeave={() => {
          if (params.hoverCellKey === params.cellKey) params.onHoverCell(null);
        }}
        onDrop={handleDrop}
        onClick={() => {
          if (params.canDragDrop && params.draggingSlotId && dropPreview?.allowed) {
            params.onDropOnCell(params.draggingSlotId, params.day, params.period, null);
          }
        }}
        title={
          dropPreview
            ? dropPreview.allowed
              ? `Drop to move here (${params.day} P${params.period})`
              : dropPreview.conflicts[0]
            : undefined
        }
        className={`px-2 py-2.5 border-r border-slate-200 text-center transition-colors ${dropHighlightClass} ${
          dropPreview?.allowed ? 'cursor-pointer' : ''
        }`}
      >
        {dropPreview ? (
          dropPreview.allowed ? (
            <span className="inline-block rounded border border-dashed border-emerald-400 bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Drop here
            </span>
          ) : (
            <span className="inline-block text-[10px] font-semibold text-rose-500">Clash</span>
          )
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
    );
  }

  return (
    <td
      key={params.cellKey}
      onDragOver={handleDragOver}
      onDragLeave={() => {
        if (params.hoverCellKey === params.cellKey) params.onHoverCell(null);
      }}
      onDrop={handleDrop}
      title={
        dropPreview
          ? dropPreview.allowed
            ? `Drop to swap with ${primaryTargetSlot?.subject}`
            : dropPreview.conflicts[0]
          : undefined
      }
      className={`px-2 py-2 border-r border-slate-200 align-top transition-colors ${dropHighlightClass}`}
    >
      <div className="space-y-1.5">
        {slots.map((s) => {
          const mapping = mapTimetableSlotToCurriculumKey(s.classSection, s.subject);
          const isBeingDragged = params.draggingSlotId === s.id;
          return (
            <div
              key={s.id}
              draggable={params.canDragDrop}
              onDragStart={(e) => {
                if (!params.canDragDrop) return;
                e.dataTransfer.setData('text/plain', s.id);
                e.dataTransfer.effectAllowed = 'move';
                params.onStartDrag(s.id);
              }}
              onDragEnd={() => params.onEndDrag()}
              onClick={() => {
                if (
                  params.canDragDrop &&
                  params.draggingSlotId &&
                  params.draggingSlotId !== s.id &&
                  dropPreview?.allowed
                ) {
                  params.onDropOnCell(params.draggingSlotId, params.day, params.period, s.id);
                }
              }}
              className={`rounded-md border p-1.5 space-y-1 transition-all ${
                isBeingDragged
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300 opacity-80'
                  : dropPreview?.allowed
                    ? 'border-emerald-400 bg-white cursor-pointer hover:bg-emerald-50/70'
                    : 'bg-slate-50 border-slate-200/80'
              } ${params.canDragDrop ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="font-bold text-slate-900 leading-tight">
                  {params.mode === 'teacher' ? `Class ${s.classSection} · ` : ''}
                  {s.subject}
                </p>
                {params.canDragDrop && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isBeingDragged) params.onEndDrag();
                      else params.onStartDrag(s.id);
                    }}
                    title="Drag or click to move/swap this period"
                    aria-label={`Move or swap ${s.subject} (${s.day} P${s.period})`}
                    className={`rounded p-0.5 shrink-0 transition-colors ${
                      isBeingDragged
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">{s.teacherName}</p>
              {s.substitutionTeacher && (
                <p className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 rounded px-1 py-0.5">
                  Sub: {s.substitutionTeacher}
                </p>
              )}
              {dropPreview?.allowed && (
                <p className="text-[10px] font-bold text-emerald-700">⇄ Click / Drop to Swap</p>
              )}
              {(params.onOpenResources || params.canEditSubstitutions) && !dropPreview && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                  {params.onOpenResources ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        params.onOpenResources?.(mapping.classKey, mapping.subjectKey);
                      }}
                      className="text-[10px] font-semibold text-blue-900 hover:underline whitespace-nowrap"
                    >
                      Resources →
                    </button>
                  ) : (
                    <span />
                  )}
                  {params.canEditSubstitutions && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        params.onSub(s);
                      }}
                      className="text-[10px] font-medium text-slate-500 hover:text-slate-900 whitespace-nowrap"
                    >
                      Sub
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </td>
  );
}
