import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ExternalLink, FileSpreadsheet, UserCheck, Users } from 'lucide-react';
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

interface TimetableExplorerPanelProps {
  timetable: TimetableSlot[];
  user: UserAccount;
  schoolId: string;
  canEdit: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenClassSubjectResources?: (classKey: string, subjectKey: string) => void;
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
    user.role === 'teacher' && !isParentOrStudent ? 'teacher' : 'class',
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

  const classMatrix = useMemo(
    () => buildClassWeeklyMatrix(timetable, effectiveClass),
    [timetable, effectiveClass],
  );
  const teacherMatrix = useMemo(
    () => buildTeacherWeeklyMatrix(timetable, effectiveTeacher),
    [timetable, effectiveTeacher],
  );

  const classTeacherName = isVis ? VIS_CLASS_TEACHERS[effectiveClass] : undefined;

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
    <div className="space-y-5">
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
                    ? 'November 2026 Default Schedule & Substitutions (All 18 Classes)'
                    : 'Weekly Timetable & Faculty Substitutions'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isParentOrStudent
                ? 'Restricted strictly to your linked child’s class schedule (Mon–Sat · Periods 1–8 · Diary Check 14:00–14:10).'
                : user.role === 'teacher'
                  ? 'Scoped to your assigned teaching periods and homeroom class timetable.'
                  : 'Mon–Sat · Periods 1–8 · Break 11:25–11:40 · Diary Check 14:00–14:10. Click any subject cell to jump to Class Resources or set Substitution.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isVis && isLeadership && (
              <a
                href={VIS_TIMETABLE_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-900" />
                Official Nov 2026 PDF (18 Pages)
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {!isParentOrStudent && (
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMode('class')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    effectiveMode === 'class'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Class ({availableClasses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMode('teacher')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                    effectiveMode === 'teacher'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {user.role === 'teacher' ? 'My Periods' : `By Teacher (${facultyNames.length})`}
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
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  onChange={(e) => setSelectedTeacher(e.target.value)}
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

        {subFeedback && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {subFeedback}
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

      {/* Weekly Mon-Sat Grid */}
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
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">{p.timeRange}</span>
                </th>
              ))}
              <th className="px-2 py-2 border-r border-slate-200 bg-amber-50/80 text-center w-16">
                <span className="block font-bold text-amber-900">Break</span>
                <span className="font-mono text-[10px] text-amber-700">11:25</span>
              </th>
              {classMatrix.periods.slice(4, 8).map((p) => (
                <th key={p.period} className="px-2.5 py-2 border-r border-slate-200 text-center">
                  <span className="block font-bold text-slate-800 whitespace-nowrap">{p.label}</span>
                  <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">{p.timeRange}</span>
                </th>
              ))}
              <th className="px-2 py-2 bg-amber-50/50 text-center w-16">
                <span className="block font-bold text-slate-800">Diary</span>
                <span className="font-mono text-[10px] text-slate-500">14:00</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {VIS_DAYS.map((day) => (
              <tr key={day} className="hover:bg-slate-50/40">
                <td className="px-3 py-3 font-bold text-blue-900 bg-slate-50/60 border-r border-slate-200 align-top">
                  {day.slice(0, 3)}
                </td>
                {[1, 2, 3, 4].map((pNum) =>
                  renderPeriodCell({
                    cellKey: `${day}-${pNum}`,
                    mode: effectiveMode,
                    slot: effectiveMode === 'class' ? classMatrix.grid[day]?.[pNum] : null,
                    teacherSlots:
                      effectiveMode === 'teacher' ? teacherMatrix.grid[day]?.[pNum] || [] : [],
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
                    mode: effectiveMode,
                    slot: effectiveMode === 'class' ? classMatrix.grid[day]?.[pNum] : null,
                    teacherSlots:
                      effectiveMode === 'teacher' ? teacherMatrix.grid[day]?.[pNum] || [] : [],
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
            ))}
          </tbody>
        </table>
      </div>

      {effectiveMode === 'teacher' && (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Users className="h-4 w-4 text-blue-900" />
            <span>
              <strong>{effectiveTeacher}</strong> teaches{' '}
              <strong>{teacherMatrix.subjectsTaught.join(', ') || 'No assigned subjects'}</strong> across{' '}
              <strong>{teacherMatrix.classesTaught.length}</strong> class section(s).
            </span>
          </div>
          <span className="font-mono text-slate-500">TimetableMaster · Nov 2026 Default Schedule</span>
        </div>
      )}
    </div>
  );
};

function renderPeriodCell(params: {
  cellKey: string;
  mode: 'class' | 'teacher';
  slot: TimetableSlot | null;
  teacherSlots: TimetableSlot[];
  canEditSubstitutions: boolean;
  onSub: (slot: TimetableSlot) => void;
  onOpenResources?: (classKey: string, subjectKey: string) => void;
}) {
  const slots =
    params.mode === 'class' ? (params.slot ? [params.slot] : []) : params.teacherSlots;

  if (slots.length === 0) {
    return (
      <td
        key={params.cellKey}
        className="px-2.5 py-2.5 border-r border-slate-200 text-center text-slate-300"
      >
        —
      </td>
    );
  }

  return (
    <td key={params.cellKey} className="px-2 py-2 border-r border-slate-200 align-top">
      <div className="space-y-1.5">
        {slots.map((s) => {
          const mapping = mapTimetableSlotToCurriculumKey(s.classSection, s.subject);
          return (
            <div
              key={s.id}
              className="rounded-md bg-slate-50 border border-slate-200/80 p-1.5 space-y-1"
            >
              <p className="font-bold text-slate-900 leading-tight">
                {params.mode === 'teacher' ? `Class ${s.classSection} · ` : ''}
                {s.subject}
              </p>
              <p className="text-[11px] text-slate-600 leading-tight">{s.teacherName}</p>
              {s.substitutionTeacher && (
                <p className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 rounded px-1 py-0.5">
                  Sub: {s.substitutionTeacher}
                </p>
              )}
              {(params.onOpenResources || params.canEditSubstitutions) && (
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
                  {params.onOpenResources ? (
                    <button
                      type="button"
                      onClick={() =>
                        params.onOpenResources?.(mapping.classKey, mapping.subjectKey)
                      }
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
                      onClick={() => params.onSub(s)}
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
