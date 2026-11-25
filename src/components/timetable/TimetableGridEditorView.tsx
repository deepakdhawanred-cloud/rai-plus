import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lock,
  MinusCircle,
  MousePointer2,
  Pin,
  Plus,
  Search,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import type { TimetableSlot } from '../../types';
import {
  autoPlaceUnscheduledLessons,
  checkManualPlacementClash,
  computeTimetableWorkloadAnalysis,
  sameTimetableDay,
  TIMETABLE_DAYS,
  TIMETABLE_PERIOD_COLUMNS,
  type TimetableGridPerspective,
  type TimetableGridTool,
  type TimetableStaffMember,
  type UnscheduledLessonItem,
} from '../../utils/smartTimetableMasterEngine';

interface TimetableGridEditorViewProps {
  planName: string;
  schoolId: string;
  slots: TimetableSlot[];
  staffMembers: TimetableStaffMember[];
  unscheduledLessons: UnscheduledLessonItem[];
  pinnedSlotIds: string[];
  lockedSlotIds: string[];
  onUpdateSlots: (nextSlots: TimetableSlot[]) => void;
  onUpdateUnscheduled: (nextUnscheduled: UnscheduledLessonItem[]) => void;
  onTogglePin: (slotId: string) => void;
  onToggleLock: (slotId: string) => void;
  onBackToHub: () => void;
}

const SUBJECT_COLOR_MAP: Array<[RegExp, string]> = [
  [/science|bio|chem/i, 'bg-purple-600 text-white'],
  [/math/i, 'bg-indigo-600 text-white'],
  [/physic/i, 'bg-orange-500 text-white'],
  [/hindi/i, 'bg-pink-600 text-white'],
  [/english/i, 'bg-violet-600 text-white'],
  [/sanskrit|psych/i, 'bg-emerald-600 text-white'],
  [/social|sst|history|pol/i, 'bg-blue-600 text-white'],
  [/geo/i, 'bg-rose-600 text-white'],
  [/comp|it|code/i, 'bg-cyan-700 text-white'],
];

function subjectColorClass(subject: string): string {
  for (const [pattern, cls] of SUBJECT_COLOR_MAP) {
    if (pattern.test(subject)) return cls;
  }
  return 'bg-slate-700 text-white';
}

export const TimetableGridEditorView: React.FC<TimetableGridEditorViewProps> = ({
  planName,
  schoolId,
  slots,
  staffMembers,
  unscheduledLessons,
  pinnedSlotIds,
  lockedSlotIds,
  onUpdateSlots,
  onUpdateUnscheduled,
  onTogglePin,
  onToggleLock,
  onBackToHub,
}) => {
  const [subView, setSubView] = useState<'grid' | 'generate' | 'workload'>('grid');
  const [perspective, setPerspective] = useState<TimetableGridPerspective>('class');
  const [activeTool, setActiveTool] = useState<TimetableGridTool>('select');
  const [entitySearch, setEntitySearch] = useState('');
  const [selectedUnscheduledId, setSelectedUnscheduledId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [clashWarning, setClashWarning] = useState<string | null>(null);
  const [lastDiagnostics, setLastDiagnostics] = useState<string[]>([]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonClass, setNewLessonClass] = useState('10-A');
  const [newLessonSubject, setNewLessonSubject] = useState('Political Science');
  const [newLessonTeacher, setNewLessonTeacher] = useState(
    staffMembers[0]?.name || 'Radha',
  );

  const { entityList, busiestEntity } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of slots) {
      const key =
        perspective === 'class'
          ? s.classSection
          : perspective === 'teacher'
            ? s.teacherName
            : s.room || `Room ${s.classSection}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const compareEntity = (a: string, b: string) => {
      if (perspective === 'class') {
        const na = parseInt(a, 10);
        const nb = parseInt(b, 10);
        if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
      }
      return a.localeCompare(b);
    };
    const allSorted = Array.from(counts.keys()).sort(compareEntity);
    let busiest = allSorted[0] || '';
    let maxSlots = -1;
    for (const ent of allSorted) {
      const c = counts.get(ent) || 0;
      if (c > maxSlots) {
        maxSlots = c;
        busiest = ent;
      }
    }
    const q = entitySearch.trim().toLowerCase();
    const filtered = q ? allSorted.filter((item) => item.toLowerCase().includes(q)) : allSorted;
    return { entityList: filtered, busiestEntity: busiest };
  }, [slots, perspective, entitySearch]);

  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const effectiveEntity =
    entityList.includes(selectedEntity)
      ? selectedEntity
      : entityList.includes(busiestEntity)
        ? busiestEntity
        : entityList[0] || '';

  const workload = useMemo(
    () =>
      computeTimetableWorkloadAnalysis({
        slots,
        unscheduledLessons,
        staffMembers,
      }),
    [slots, unscheduledLessons, staffMembers],
  );

  const totalPeriodsToPlace =
    workload.totalPeriodsScheduled + workload.totalPeriodsUnscheduled;
  const placedPct =
    totalPeriodsToPlace > 0
      ? Math.round((workload.totalPeriodsScheduled / totalPeriodsToPlace) * 100)
      : 100;

  function findSlotForCell(day: string, period: number): TimetableSlot | undefined {
    return slots.find((s) => {
      if (!sameTimetableDay(s.day, day) || s.period !== period) return false;
      if (perspective === 'class') return s.classSection === effectiveEntity;
      if (perspective === 'teacher') return s.teacherName === effectiveEntity;
      return (s.room || `Room ${s.classSection}`) === effectiveEntity;
    });
  }

  function handleSlotClick(slot: TimetableSlot) {
    setClashWarning(null);
    if (activeTool === 'pin') {
      onTogglePin(slot.id);
      setStatusNotice(`Toggled Pin on ${slot.subject} (${slot.day} P${slot.period}).`);
      return;
    }
    if (activeTool === 'lock') {
      onToggleLock(slot.id);
      setStatusNotice(`Toggled Lock on ${slot.subject} (${slot.day} P${slot.period}).`);
      return;
    }
    if (activeTool === 'unschedule') {
      if (lockedSlotIds.includes(slot.id)) {
        setClashWarning(
          `${slot.subject} (${slot.day} P${slot.period}) is Locked. Unlock it before unscheduling.`,
        );
        return;
      }
      onUpdateSlots(slots.filter((s) => s.id !== slot.id));
      onUpdateUnscheduled([
        ...unscheduledLessons,
        {
          id: `unsched-${Date.now().toString(36)}`,
          classSection: slot.classSection,
          subject: slot.subject,
          teacherName: slot.teacherName,
          room: slot.room || `Room ${slot.classSection}`,
          periodsRemaining: 1,
          reason: 'Manually moved to Unscheduled tray',
        },
      ]);
      setStatusNotice(
        `Moved ${slot.subject} (${slot.classSection} · ${slot.teacherName}) to Unscheduled Lessons tray.`,
      );
      return;
    }
    setStatusNotice(
      `Selected: ${slot.subject} · ${slot.teacherName} · Class ${slot.classSection} (${slot.day}, Period ${slot.period}).`,
    );
  }

  function handleEmptyCellClick(day: string, period: number) {
    setClashWarning(null);
    if (!selectedUnscheduledId) return;
    const lesson = unscheduledLessons.find((u) => u.id === selectedUnscheduledId);
    if (!lesson) return;

    const targetLesson: UnscheduledLessonItem =
      perspective === 'class' && effectiveEntity
        ? { ...lesson, classSection: effectiveEntity }
        : lesson;

    const clash = checkManualPlacementClash(slots, targetLesson, day, period);
    if (clash) {
      setClashWarning(clash);
      return;
    }

    const periodMeta = TIMETABLE_PERIOD_COLUMNS.find((c) => c.periodNumber === period);
    const created: TimetableSlot = {
      id: `tt-man-${Date.now().toString(36)}`,
      schoolId,
      classSection: targetLesson.classSection,
      day,
      period,
      timeRange: periodMeta?.timeRange || `Period ${period}`,
      subject: targetLesson.subject,
      teacherName: targetLesson.teacherName,
      room: targetLesson.room || `Room ${targetLesson.classSection}`,
    };

    onUpdateSlots([...slots, created]);
    const remaining = unscheduledLessons
      .map((u) =>
        u.id === lesson.id
          ? { ...u, periodsRemaining: u.periodsRemaining - 1 }
          : u,
      )
      .filter((u) => u.periodsRemaining > 0);
    onUpdateUnscheduled(remaining);
    setSelectedUnscheduledId(null);
    setStatusNotice(
      `Placed ${created.subject} (${created.teacherName}) into ${day} Period ${period}.`,
    );
  }

  function handleAutoGenerate() {
    setClashWarning(null);
    const res = autoPlaceUnscheduledLessons({
      existingSlots: slots,
      unscheduled: unscheduledLessons,
      schoolId,
    });
    onUpdateSlots(res.placedSlots);
    onUpdateUnscheduled(res.remainingUnscheduled);
    setLastDiagnostics(res.diagnostics);
    setStatusNotice(
      res.newlyPlacedCount > 0
        ? `Auto Generator placed ${res.newlyPlacedCount} period(s) with zero teacher clashes.`
        : 'All schedulable periods are already placed.',
    );
    setSubView('generate');
  }

  function handleAddUnscheduledLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!newLessonSubject.trim() || !newLessonTeacher.trim()) return;
    onUpdateUnscheduled([
      ...unscheduledLessons,
      {
        id: `unsched-add-${Date.now().toString(36)}`,
        classSection: newLessonClass,
        subject: newLessonSubject.trim(),
        teacherName: newLessonTeacher.trim(),
        room: `Room ${newLessonClass}`,
        periodsRemaining: 1,
        reason: 'Added manually — click to place or run Auto Generate',
      },
    ]);
    setShowAddLesson(false);
    setStatusNotice(`Added ${newLessonSubject} (${newLessonClass}) to Unscheduled Lessons.`);
  }

  return (
    <div className="space-y-4" data-testid="timetable-grid-editor">
      {/* Top Toolbar (Reference Screenshot 065054) */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onBackToHub}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            ← Timetables
          </button>
          <span className="font-display text-sm font-bold text-slate-900 px-1">
            {planName}
          </span>

          {/* Perspective Switcher: Class | Teacher | Room */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(
              [
                ['class', 'Class', GraduationCap],
                ['teacher', 'Teacher', Users],
                ['room', 'Room', Building2],
              ] as const
            ).map(([key, lbl, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPerspective(key);
                  setSubView('grid');
                }}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  perspective === key && subView === 'grid'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Tools + Workload + Auto Generate */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(
              [
                ['select', 'Select', MousePointer2],
                ['unschedule', 'Unschedule', MinusCircle],
                ['pin', 'Pin', Pin],
                ['lock', 'Lock', Lock],
              ] as const
            ).map(([toolKey, lbl, Icon]) => (
              <button
                key={toolKey}
                type="button"
                onClick={() => {
                  setActiveTool(toolKey);
                  setSubView('grid');
                }}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  activeTool === toolKey
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {lbl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSubView(subView === 'workload' ? 'grid' : 'workload')}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
              subView === 'workload'
                ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Workload Analysis
          </button>

          <button
            type="button"
            onClick={handleAutoGenerate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Zap className="h-3.5 w-3.5" />
            Auto Generate
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-900">
          {statusNotice}
        </div>
      )}
      {clashWarning && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{clashWarning}</span>
        </div>
      )}

      {/* SUBVIEW A: Ready to Generate Status (Reference Screenshot 065033) */}
      {subView === 'generate' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5" data-testid="ready-to-generate-panel">
          <div>
            <h3 className="font-display text-2xl font-bold text-slate-900">Ready to Generate</h3>
            <p className="text-xs text-slate-600 mt-0.5">Everything is set up.</p>
            <p className="text-xs font-medium text-slate-700 mt-2 tabular-nums">
              {workload.totalClasses} classes · {totalPeriodsToPlace} periods to place · {workload.totalTeachers} teachers
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {workload.overCapacityCount === 0
                ? 'No problems found.'
                : `${workload.overCapacityCount} workload capacity warning(s) found.`}
            </div>
            <button
              type="button"
              onClick={() => setSubView('workload')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline"
            >
              View Detailed Analysis
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900">How It Runs</span>
              <span className="text-slate-600 ml-3">
                Rooms picked before scheduling · Clash-free constraint solver
              </span>
            </div>
            <span className="font-semibold text-indigo-700">Active</span>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-bold text-slate-900">Your Timetable</p>
              <div className="flex items-center gap-3">
                <div className="h-2.5 flex-1 max-w-xs rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${placedPct}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
                  {workload.totalPeriodsScheduled} of {totalPeriodsToPlace} periods placed
                </span>
              </div>
              <p className="text-xs text-amber-700">
                {workload.totalPeriodsUnscheduled > 0
                  ? `${workload.totalPeriodsUnscheduled} still to place. Still a draft until you publish it.`
                  : '100% of periods placed cleanly with zero conflicts.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSubView('grid')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Open Timetable
              </button>
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Generate Again
              </button>
            </div>
          </div>

          {(unscheduledLessons.length > 0 || lastDiagnostics.length > 0) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
              <h4 className="font-display text-sm font-bold text-slate-900">Lessons Not Placed</h4>
              <p className="text-xs text-slate-600">
                These wait in Unscheduled. Change what stands in their way and generate again, or place them by hand in the Grid Editor.
              </p>
              <ul className="space-y-1 text-xs text-slate-800 list-disc pl-4">
                {unscheduledLessons.map((u) => (
                  <li key={u.id}>
                    <strong>{u.subject}</strong> ({u.classSection} · {u.teacherName}) — {u.periodsRemaining} lesson:{' '}
                    {u.reason || 'Waiting for open slot'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW B: Detailed Workload Analysis (Reference Screenshot 065002) */}
      {subView === 'workload' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5" data-testid="detailed-workload-analysis">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-bold text-slate-900">Detailed Analysis</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Who has more lessons than free periods, before you generate. Busiest first; amber at 100% and red over capacity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubView('grid')}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Back to Grid Editor
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classes Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Classes ({workload.classes.length})
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4 max-h-[520px] overflow-y-auto">
                {workload.classes.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">Class {item.label}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          item.status === 'over_capacity'
                            ? 'text-rose-700'
                            : item.status === 'full'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                        }`}
                      >
                        {item.utilizationPct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'over_capacity'
                            ? 'bg-rose-600'
                            : item.status === 'full'
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, item.utilizationPct)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {item.usedPeriods} of {item.availablePeriods} periods used
                      {item.timeOffPeriods > 0 ? ` · ${item.timeOffPeriods} periods of time off` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teachers Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-4 w-4 text-indigo-600" />
                Teachers ({workload.teachers.length})
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-4 max-h-[520px] overflow-y-auto">
                {workload.teachers.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900">{item.label}</span>
                      <span
                        className={`font-mono tabular-nums ${
                          item.status === 'over_capacity'
                            ? 'text-rose-700'
                            : item.status === 'full'
                              ? 'text-amber-700'
                              : 'text-slate-700'
                        }`}
                      >
                        {item.utilizationPct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === 'over_capacity'
                            ? 'bg-rose-600'
                            : item.status === 'full'
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, item.utilizationPct)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 tabular-nums">
                      {item.usedPeriods} of {item.availablePeriods} periods used
                      {item.timeOffPeriods > 0 ? ` · ${item.timeOffPeriods} periods of time off` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW C: Interactive Timetable Grid + Unscheduled Lessons Tray (Screenshot 065054) */}
      {subView === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Left Entity Selector Rail */}
            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="capitalize">
                  {perspective} ({entityList.length})
                </span>
              </div>
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={entitySearch}
                  onChange={(e) => setEntitySearch(e.target.value)}
                  placeholder={`Search ${perspective}...`}
                  aria-label={`Search ${perspective}`}
                  className="w-full rounded-lg border border-slate-200 pl-8 pr-2 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div className="flex xl:flex-col gap-1 overflow-x-auto xl:overflow-y-auto xl:max-h-[430px] pb-1">
                {entityList.map((entity) => (
                  <button
                    key={entity}
                    type="button"
                    onClick={() => setSelectedEntity(entity)}
                    className={`rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold whitespace-nowrap transition-colors ${
                      effectiveEntity === entity
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {perspective === 'class' ? `Class ${entity}` : entity}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Mon–Sat Period Grid */}
            <div className="xl:col-span-10 rounded-xl border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full border-collapse min-w-[920px] text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-2.5 px-3 text-left font-bold text-slate-700 w-24">Day</th>
                    {TIMETABLE_PERIOD_COLUMNS.map((col) => (
                      <th
                        key={col.id}
                        className={`py-2 px-2 text-center border-l border-slate-200 ${
                          col.isBreak || col.isDiary
                            ? 'bg-amber-50/70 text-amber-800 w-16'
                            : 'text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{col.label}</div>
                        <div className="text-[10px] font-mono text-slate-500">{col.timeRange}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {TIMETABLE_DAYS.map((day) => (
                    <tr key={day}>
                      <td className="py-3 px-3 font-semibold text-slate-800 bg-slate-50/40">
                        {day}
                      </td>
                      {TIMETABLE_PERIOD_COLUMNS.map((col) => {
                        if (col.isBreak || col.isDiary) {
                          return (
                            <td
                              key={`${day}-${col.id}`}
                              className="border-l border-slate-200 bg-amber-50/60 text-center text-[10px] font-semibold text-amber-800 px-1"
                            >
                              {col.label}
                            </td>
                          );
                        }
                        const periodNum = col.periodNumber!;
                        const slot = findSlotForCell(day, periodNum);
                        const isPinned = slot ? pinnedSlotIds.includes(slot.id) : false;
                        const isLocked = slot ? lockedSlotIds.includes(slot.id) : false;

                        return (
                          <td
                            key={`${day}-${col.id}`}
                            className="border-l border-slate-200 p-1 align-top h-16"
                          >
                            {slot ? (
                              <button
                                type="button"
                                onClick={() => handleSlotClick(slot)}
                                className={`w-full h-full rounded-md px-2 py-1.5 text-left transition-opacity hover:opacity-90 flex flex-col justify-between ${subjectColorClass(slot.subject)}`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-bold text-[11px] leading-tight line-clamp-1">
                                    {slot.subject}
                                  </span>
                                  <span className="flex items-center gap-0.5 shrink-0">
                                    {isPinned && <Pin className="h-2.5 w-2.5" />}
                                    {isLocked && <Lock className="h-2.5 w-2.5" />}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-90 truncate">
                                  {perspective === 'teacher'
                                    ? `Class ${slot.classSection}`
                                    : slot.teacherName}
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEmptyCellClick(day, periodNum)}
                                className={`w-full h-full rounded-md border border-dashed text-[10px] flex items-center justify-center transition-colors ${
                                  selectedUnscheduledId
                                    ? 'border-indigo-400 bg-indigo-50/60 text-indigo-700 font-semibold hover:bg-indigo-100'
                                    : 'border-slate-200 bg-slate-50/40 text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                {selectedUnscheduledId ? 'Place Here' : `P${periodNum}`}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Unscheduled Lessons Tray (Reference Screenshot 065054) */}
          <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Unscheduled Lessons ({unscheduledLessons.length})
                </h3>
                {selectedUnscheduledId && (
                  <span className="text-xs font-semibold text-indigo-700">
                    Click any open period cell above to place this lesson
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowAddLesson((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Lesson
              </button>
            </div>

            {showAddLesson && (
              <form
                onSubmit={handleAddUnscheduledLesson}
                className="rounded-lg border border-slate-200 bg-white p-3 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
              >
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    value={newLessonClass}
                    onChange={(e) => setNewLessonClass(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newLessonSubject}
                    onChange={(e) => setNewLessonSubject(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Teacher
                  </label>
                  <input
                    type="text"
                    value={newLessonTeacher}
                    onChange={(e) => setNewLessonTeacher(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Add to Tray
                </button>
              </form>
            )}

            {unscheduledLessons.length === 0 ? (
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                All lessons are scheduled! Use the Unschedule tool above to move a period back here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {unscheduledLessons.map((item) => {
                  const isSelected = selectedUnscheduledId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setSelectedUnscheduledId(isSelected ? null : item.id)
                      }
                      className={`rounded-lg px-3 py-2 text-left min-w-[140px] transition-all ${subjectColorClass(item.subject)} ${
                        isSelected ? 'ring-2 ring-offset-2 ring-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">{item.subject}</span>
                        <span className="rounded bg-white/25 px-1.5 py-0.5 text-[10px] font-mono font-bold">
                          {item.periodsRemaining}P
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 mt-0.5">{item.teacherName}</p>
                      <p className="text-[10px] opacity-80">Class {item.classSection}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
