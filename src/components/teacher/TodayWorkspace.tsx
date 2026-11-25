import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileSpreadsheet,
  NotebookPen,
  Plus,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { HomeworkAssignment, LessonPlan } from '../../types';
import type { WorkspaceData, WorkspaceTab } from '../../types/workspace';
import type { TeacherTodayDigest } from '../../utils/managementIntelligenceEngine';
import { teacherMatchesSlot } from '../../utils/academicOperationsEngine';
import { apiRequest } from '../../utils/api';
import { resolveTodayIsoDate } from '../../utils/visAcademicProgressEngine';
import { BatchAttendanceRosterPanel } from '../BatchAttendanceRosterPanel';
import { pushToast } from '../ToastProvider';

export interface TeacherRecentHomeworkRow {
  assignment: HomeworkAssignment;
  totalStudents: number;
  pendingCount: number;
  handedInCount: number;
  isToday: boolean;
}

export interface TeacherClassTargetRow {
  classSection: string;
  sampleStudentId?: string | null;
}

export type TodayFocusMode = 'all' | 'attendance' | 'schedule_tasks' | 'lesson_plans';

export interface TodayWorkspaceProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onNavigate: (tab: WorkspaceTab) => void;
  onOpenStudent?: (studentId: string) => void;
  onAssignHomework?: (prefill?: { classSection?: string; subject?: string }) => void;
  onOpenDailyHomework?: () => void;
  teacherDigest?: TeacherTodayDigest | null;
  teacherRecentHomework?: TeacherRecentHomeworkRow[];
  teacherClassTargets?: TeacherClassTargetRow[];
  initialFocusMode?: TodayFocusMode;
  focusModeNonce?: number;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const JS_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function normalizeDayPrefix(day: string): string {
  return day.trim().slice(0, 3).toLowerCase();
}

function getNextLessonStatus(current: LessonPlan['status']): LessonPlan['status'] {
  if (current === 'In Progress') return 'Completed';
  if (current === 'Completed') return 'Pending Revision';
  return 'In Progress';
}

export const TodayWorkspace: React.FC<TodayWorkspaceProps> = ({
  data,
  token,
  onRefresh,
  onNavigate,
  onOpenStudent,
  onAssignHomework,
  onOpenDailyHomework,
  teacherDigest,
  teacherRecentHomework = [],
  teacherClassTargets = [],
  initialFocusMode = 'all',
  focusModeNonce = 0,
}) => {
  const todayIso = resolveTodayIsoDate();
  const rawTodayName = JS_DAY_NAMES[new Date().getDay()] || 'Monday';
  const defaultTeachingDay = rawTodayName === 'Sunday' ? 'Monday' : rawTodayName;

  const [focusMode, setFocusMode] = useState<TodayFocusMode>(initialFocusMode);
  const [selectedDay, setSelectedDay] = useState<string>(defaultTeachingDay);
  const [requestedAttendanceClass, setRequestedAttendanceClass] = useState<string | null>(
    () => data.user.classTeacherOf || null,
  );
  const [attendanceJumpSeq, setAttendanceJumpSeq] = useState<number>(0);

  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [lessonBusyId, setLessonBusyId] = useState<string | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [ackCoverBusyId, setAckCoverBusyId] = useState<string | null>(null);
  const [ackCoverError, setAckCoverError] = useState<string | null>(null);

  const attendanceSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusModeNonce > 0) {
      setFocusMode(initialFocusMode);
      if (initialFocusMode === 'attendance') {
        requestAnimationFrame(() => {
          attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }, [focusModeNonce, initialFocusMode]);

  const assignedClasses = useMemo(() => {
    const set = new Set<string>();
    if (data.user.classTeacherOf) set.add(data.user.classTeacherOf);
    for (const slot of data.timetable) set.add(slot.classSection);
    for (const s of data.students) set.add(s.classSection);
    for (const target of teacherClassTargets) set.add(target.classSection);
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [data.user.classTeacherOf, data.timetable, data.students, teacherClassTargets]);

  const [newLessonClass, setNewLessonClass] = useState<string>(
    () => data.user.classTeacherOf || assignedClasses[0] || '6-A',
  );
  const [newLessonSubject, setNewLessonSubject] = useState<string>(
    () => (data.user.subjectSpecialty || 'Mathematics').split(/[·,&]/)[0].trim() || 'Mathematics',
  );
  const [newLessonLevel, setNewLessonLevel] = useState<LessonPlan['level']>('Daily');
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [newLessonOutcome, setNewLessonOutcome] = useState('');
  const [newLessonDate, setNewLessonDate] = useState(todayIso);

  // Per-class One-Go Attendance live summary for today
  const classAttendanceEntryPoints = useMemo(() => {
    const studentsByClass = new Map<string, string[]>();
    for (const st of data.students) {
      const list = studentsByClass.get(st.classSection) || [];
      list.push(st.id);
      studentsByClass.set(st.classSection, list);
    }

    const todayMarkedStudentIds = new Set<string>();
    const todayAbsentStudentIds = new Set<string>();
    for (const rec of data.attendance) {
      if (rec.date === todayIso) {
        todayMarkedStudentIds.add(rec.studentId);
        if (rec.status === 'Absent') todayAbsentStudentIds.add(rec.studentId);
      }
    }

    return Array.from(studentsByClass.entries())
      .map(([classSection, studentIds]) => {
        let markedCount = 0;
        let absentCount = 0;
        for (const id of studentIds) {
          if (todayMarkedStudentIds.has(id)) markedCount += 1;
          if (todayAbsentStudentIds.has(id)) absentCount += 1;
        }
        const total = studentIds.length;
        const isComplete = total > 0 && markedCount >= total;
        const isClassTeacher = data.user.classTeacherOf === classSection;
        return {
          classSection,
          total,
          markedCount,
          absentCount,
          isComplete,
          isClassTeacher,
        };
      })
      .sort((a, b) => {
        if (a.isClassTeacher !== b.isClassTeacher) return a.isClassTeacher ? -1 : 1;
        return a.classSection.localeCompare(b.classSection, undefined, { numeric: true });
      });
  }, [data.students, data.attendance, data.user.classTeacherOf, todayIso]);

  const todaysAttendanceMarkedCount = useMemo(
    () => data.attendance.filter((a) => a.date === todayIso).length,
    [data.attendance, todayIso],
  );

  const pendingAttendanceClassesCount = useMemo(
    () => classAttendanceEntryPoints.filter((c) => !c.isComplete).length,
    [classAttendanceEntryPoints],
  );

  const todaysTimetable = useMemo(() => {
    const targetPrefix = normalizeDayPrefix(selectedDay);
    const exactDay = data.timetable.filter(
      (slot) => normalizeDayPrefix(slot.day) === targetPrefix,
    );
    if (exactDay.length > 0) {
      return [...exactDay].sort((a, b) => a.period - b.period);
    }
    if (teacherDigest && teacherDigest.teacherSlots.length > 0) {
      return [...teacherDigest.teacherSlots].sort((a, b) => a.period - b.period);
    }
    return [];
  }, [data.timetable, selectedDay, teacherDigest]);

  const activeHomeworkCount = useMemo(() => {
    if (teacherRecentHomework.length > 0) return teacherRecentHomework.length;
    return (data.homeworkAssignments || []).filter((hw) => hw.dueDate >= todayIso).length;
  }, [data.homeworkAssignments, teacherRecentHomework, todayIso]);

  const pendingNotebookFollowUps = useMemo(() => {
    const uncheckedOrC = data.notebookEntries.filter(
      (n) => n.workQuality === 'C' || !n.checked,
    ).length;
    return Math.max(uncheckedOrC, teacherDigest?.pendingDevelopmentReviews || 0);
  }, [data.notebookEntries, teacherDigest]);

  const supportAlerts = useMemo(
    () => (data.attendanceSupportRecords || []).filter((r) => r.status !== 'Resolved'),
    [data.attendanceSupportRecords],
  );

  const guidedFollowUpStudents = teacherDigest?.studentsNeedingSupport || [];

  const lessonPlans = useMemo(() => {
    return [...(data.lessonPlans || [])].sort((a, b) => {
      const rank = (s: LessonPlan['status']) =>
        s === 'In Progress'
          ? 0
          : s === 'Pending Revision'
            ? 1
            : s === 'Calendar Change Requested'
              ? 2
              : 3;
      return rank(a.status) - rank(b.status) || b.targetDate.localeCompare(a.targetDate);
    });
  }, [data.lessonPlans]);

  const completedLessonPlansCount = useMemo(
    () => lessonPlans.filter((l) => l.status === 'Completed').length,
    [lessonPlans],
  );

  const adjustedSubstitutePeriods = useMemo(() => {
    const items: Array<{
      id: string;
      slotId?: string;
      date: string;
      day: string;
      period: number;
      timeRange: string;
      classSection: string;
      subject: string;
      room?: string;
      absentTeacherName: string;
      substituteTeacherName: string;
      isAssignedToCurrentTeacher: boolean;
      publishStatus: 'published' | 'pending_review';
      acknowledgedBySubstitute?: boolean;
      acknowledgedAt?: string;
      reason?: string;
    }> = [];
    const seenKeys = new Set<string>();

    for (const cover of data.substitutionAssignments || []) {
      if (!cover.substituteTeacherName) continue;
      const key = `${cover.slotId || ''}|${cover.date}|${cover.period}|${cover.classSection}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      items.push({
        id: cover.id,
        slotId: cover.slotId,
        date: cover.date,
        day: cover.day,
        period: cover.period,
        timeRange: cover.timeRange,
        classSection: cover.classSection,
        subject: cover.subject,
        room: cover.room,
        absentTeacherName: cover.absentTeacherName,
        substituteTeacherName: cover.substituteTeacherName,
        isAssignedToCurrentTeacher: teacherMatchesSlot(cover.substituteTeacherName, data.user.name),
        publishStatus: cover.publishStatus,
        acknowledgedBySubstitute: Boolean(cover.acknowledgedBySubstitute),
        acknowledgedAt: cover.acknowledgedAt,
        reason: cover.reason,
      });
    }

    for (const slot of data.timetable || []) {
      if (!slot.substitutionTeacher) continue;
      const alreadyCovered = items.some(
        (it) =>
          it.slotId === slot.id ||
          (it.period === slot.period &&
            it.classSection === slot.classSection &&
            normalizeDayPrefix(it.day) === normalizeDayPrefix(slot.day)),
      );
      if (alreadyCovered) continue;
      items.push({
        id: `slot-sub-${slot.id}`,
        slotId: slot.id,
        date: todayIso,
        day: slot.day,
        period: slot.period,
        timeRange: slot.timeRange,
        classSection: slot.classSection,
        subject: slot.subject,
        room: slot.room,
        absentTeacherName: slot.teacherName,
        substituteTeacherName: slot.substitutionTeacher,
        isAssignedToCurrentTeacher: teacherMatchesSlot(slot.substitutionTeacher, data.user.name),
        publishStatus: 'published',
        reason: 'Timetable substitute adjustment',
      });
    }

    return items.sort((a, b) => {
      if (a.isAssignedToCurrentTeacher !== b.isAssignedToCurrentTeacher) {
        return a.isAssignedToCurrentTeacher ? -1 : 1;
      }
      return b.date.localeCompare(a.date) || a.period - b.period;
    });
  }, [data.substitutionAssignments, data.timetable, data.user.name, todayIso]);

  const upcomingSubstitutions = useMemo(
    () => adjustedSubstitutePeriods.slice(0, 4),
    [adjustedSubstitutePeriods],
  );

  const substituteBySlotId = useMemo(() => {
    const map = new Map<string, (typeof adjustedSubstitutePeriods)[number]>();
    for (const item of adjustedSubstitutePeriods) {
      if (item.slotId) map.set(item.slotId, item);
    }
    return map;
  }, [adjustedSubstitutePeriods]);

  const announcements = useMemo(
    () => (data.operations || []).filter((item) => item.status !== 'Resolved').slice(0, 4),
    [data.operations],
  );

  const classroomSupportPlans = useMemo(
    () =>
      (data.clinicalCare?.therapyPlans || [])
        .filter((p) => Boolean(p.teacherClassroomGuidance))
        .slice(0, 4),
    [data.clinicalCare?.therapyPlans],
  );

  function openOneGoAttendanceForClass(classSection?: string | null) {
    if (classSection) {
      setRequestedAttendanceClass(classSection);
      setAttendanceJumpSeq((n) => n + 1);
    }
    if (focusMode !== 'all' && focusMode !== 'attendance') {
      setFocusMode('attendance');
    }
    requestAnimationFrame(() => {
      attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const pendingAcademicTasks = useMemo(() => {
    const tasks: Array<{
      id: string;
      title: string;
      detail: string;
      statusLabel: 'Action needed' | 'In progress' | 'Synced';
      priority: 'high' | 'medium' | 'done';
      actionLabel: string;
      onAction: () => void;
    }> = [];

    const primaryClass =
      classAttendanceEntryPoints.find((c) => !c.isComplete)?.classSection ||
      data.user.classTeacherOf ||
      classAttendanceEntryPoints[0]?.classSection ||
      null;

    tasks.push({
      id: 'task-one-go-attendance',
      title:
        pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0
          ? `One-Go Attendance complete (${todaysAttendanceMarkedCount} records)`
          : `Mark One-Go Attendance (${pendingAttendanceClassesCount} class${
              pendingAttendanceClassesCount === 1 ? '' : 'es'
            } remaining)`,
      detail:
        pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0
          ? `Synced to daily attendance register for ${todayIso}`
          : primaryClass
            ? `Next class ready: ${primaryClass} · whole-class roll call with parent sync`
            : 'Open inline roster to mark attendance for today',
      statusLabel:
        pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0
          ? 'Synced'
          : 'Action needed',
      priority:
        pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0 ? 'done' : 'high',
      actionLabel:
        pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0
          ? 'Review Roster'
          : 'Mark Now',
      onAction: () => openOneGoAttendanceForClass(primaryClass),
    });

    if (pendingNotebookFollowUps > 0) {
      tasks.push({
        id: 'task-notebooks',
        title: `Review ${pendingNotebookFollowUps} Notebook Grade C or unchecked entries`,
        detail: 'Updates notebook register, OLQ progress, and parent visibility',
        statusLabel: 'Action needed',
        priority: 'high',
        actionLabel: 'Open Notebooks',
        onAction: () => onNavigate('notebook'),
      });
    }

    if (upcomingSubstitutions.length > 0) {
      const sub = upcomingSubstitutions[0];
      tasks.push({
        id: 'task-cover',
        title: `Cover duty · Class ${sub.classSection} ${sub.subject} (P${sub.period})`,
        detail: `Scheduled substitute period on ${sub.date}`,
        statusLabel: 'Action needed',
        priority: 'high',
        actionLabel: 'View Schedule',
        onAction: () => onNavigate('timetable_leave'),
      });
    }

    const pendingHwSubmissions = teacherRecentHomework.reduce((sum, hw) => sum + hw.pendingCount, 0);
    tasks.push({
      id: 'task-homework',
      title:
        activeHomeworkCount > 0
          ? `${activeHomeworkCount} active homework task${activeHomeworkCount === 1 ? '' : 's'} (${pendingHwSubmissions} pending)`
          : 'Publish daily class homework',
      detail: 'Synced to student and parent portals for assigned sections',
      statusLabel: pendingHwSubmissions > 0 ? 'In progress' : 'Synced',
      priority: pendingHwSubmissions > 0 ? 'medium' : 'done',
      actionLabel: activeHomeworkCount > 0 ? 'Track Roster' : 'Assign HW',
      onAction: () => {
        if (activeHomeworkCount > 0) {
          if (onOpenDailyHomework) onOpenDailyHomework();
          else onNavigate('notebook');
        } else if (onAssignHomework) {
          onAssignHomework();
        } else {
          onNavigate('notebook');
        }
      },
    });

    const openLessons = lessonPlans.filter((l) => l.status !== 'Completed').length;
    if (openLessons > 0) {
      tasks.push({
        id: 'task-lessons',
        title: `${openLessons} lesson plan${openLessons === 1 ? '' : 's'} open or pending revision`,
        detail: 'Mark completion right after teaching each period',
        statusLabel: 'In progress',
        priority: 'medium',
        actionLabel: 'Update Plans',
        onAction: () => setFocusMode('lesson_plans'),
      });
    }

    if (supportAlerts.length > 0) {
      tasks.push({
        id: 'task-support',
        title: `${supportAlerts.length} attendance check-in alert${supportAlerts.length === 1 ? '' : 's'}`,
        detail: 'Non-diagnostic pattern indicator for teacher observation or family call',
        statusLabel: 'In progress',
        priority: 'medium',
        actionLabel: 'Open Heatmap',
        onAction: () => onNavigate('attendance_heatmap'),
      });
    }

    return tasks;
  }, [
    classAttendanceEntryPoints,
    data.user.classTeacherOf,
    pendingAttendanceClassesCount,
    todaysAttendanceMarkedCount,
    todayIso,
    pendingNotebookFollowUps,
    upcomingSubstitutions,
    teacherRecentHomework,
    activeHomeworkCount,
    lessonPlans,
    supportAlerts.length,
    onNavigate,
    onOpenDailyHomework,
    onAssignHomework,
  ]);

  const openTaskCount = pendingAcademicTasks.filter((t) => t.priority !== 'done').length;

  async function handleAcknowledgeCover(coverId: string) {
    setAckCoverError(null);
    setAckCoverBusyId(coverId);
    try {
      await apiRequest(
        `/api/timetable/substitutions/${coverId}/acknowledge`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
      pushToast('Substitute cover acknowledged and synced to Principal dashboard.', 'success');
    } catch (e) {
      setAckCoverError(e instanceof Error ? e.message : 'Unable to acknowledge substitute cover.');
    } finally {
      setAckCoverBusyId(null);
    }
  }

  async function handleToggleLessonStatus(plan: LessonPlan) {
    setLessonError(null);
    setLessonBusyId(plan.id);
    try {
      const nextStatus = getNextLessonStatus(plan.status);
      await apiRequest(
        `/api/lesson-plans/${plan.id}`,
        { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) },
        token,
      );
      await onRefresh();
    } catch (e) {
      setLessonError(e instanceof Error ? e.message : 'Unable to update lesson plan status.');
    } finally {
      setLessonBusyId(null);
    }
  }

  async function handleCreateLessonPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!newLessonTopic.trim()) return;
    setLessonError(null);
    setLessonBusyId('creating');
    try {
      await apiRequest(
        '/api/lesson-plans',
        {
          method: 'POST',
          body: JSON.stringify({
            level: newLessonLevel,
            classSection: newLessonClass,
            subject: newLessonSubject,
            topic: newLessonTopic.trim(),
            learningOutcome: newLessonOutcome.trim(),
            targetDate: newLessonDate,
          }),
        },
        token,
      );
      setNewLessonTopic('');
      setNewLessonOutcome('');
      setShowAddLessonForm(false);
      await onRefresh();
    } catch (err) {
      setLessonError(err instanceof Error ? err.message : 'Unable to save lesson plan.');
    } finally {
      setLessonBusyId(null);
    }
  }

  const showAttendanceEntryBar = focusMode === 'all' || focusMode === 'attendance';
  const showScheduleAndTasks = focusMode === 'all' || focusMode === 'schedule_tasks';
  const showLessonPlansFocused = focusMode === 'lesson_plans';
  const showInlineRoster = focusMode === 'all' || focusMode === 'attendance';

  return (
    <section
      data-testid="teacher-today-workspace"
      aria-label="Teacher Today Workspace"
      className="space-y-5"
    >
      {/* Top Operational Header & Segmented View Switcher */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 tabular-nums">
              <span className="font-medium text-slate-700">{rawTodayName}</span>
              <span aria-hidden="true">·</span>
              <span>{todayIso}</span>
              {data.user.classTeacherOf && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Class Teacher {data.user.classTeacherOf}</span>
                </>
              )}
              {data.user.subjectSpecialty && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{data.user.subjectSpecialty}</span>
                </>
              )}
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-slate-900">
              Today Workspace
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Daily teaching timetable, One-Go class attendance, lesson plans, and pending academic actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openOneGoAttendanceForClass(data.user.classTeacherOf || assignedClasses[0] || null)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 transition"
            >
              <UserCheck className="h-3.5 w-3.5" />
              One-Go Attendance
            </button>
            {onAssignHomework && (
              <button
                type="button"
                onClick={() => onAssignHomework()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 transition"
              >
                <BookOpenCheck className="h-3.5 w-3.5 text-slate-600" />
                Assign Homework
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('marks_report_card')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-blue-900" />
              Marks Dashboard
            </button>
            <button
              type="button"
              onClick={() => onNavigate('notebook')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 transition cursor-pointer"
            >
              <NotebookPen className="h-3.5 w-3.5 text-slate-600" />
              Notebook Checking
            </button>
          </div>
        </div>

        {/* Single-Elevation 4-Column Operational Summary Bar (No Active Student Records / No Mean Score) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">{selectedDay} Periods</div>
            <div className="mt-1.5 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {todaysTimetable.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
              {assignedClasses.length} assigned class{assignedClasses.length === 1 ? '' : 'es'}
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">One-Go Attendance</div>
            <div className="mt-1.5 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {todaysAttendanceMarkedCount > 0 ? todaysAttendanceMarkedCount : 0}
              <span className="ml-1.5 text-xs font-sans font-medium text-slate-500">marked</span>
            </div>
            <div className="mt-0.5 text-xs tabular-nums">
              {pendingAttendanceClassesCount === 0 && todaysAttendanceMarkedCount > 0 ? (
                <span className="font-medium text-emerald-700">All assigned classes synced</span>
              ) : (
                <span className="font-medium text-amber-700">
                  {pendingAttendanceClassesCount} class{pendingAttendanceClassesCount === 1 ? '' : 'es'} pending today
                </span>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">Pending Academic Tasks</div>
            <div className="mt-1.5 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {openTaskCount}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
              {pendingNotebookFollowUps} notebook · {activeHomeworkCount} active HW
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs font-medium text-slate-500">Lesson Plans</div>
            <div className="mt-1.5 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {completedLessonPlansCount}/{lessonPlans.length}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Completed · click status to update
            </div>
          </div>
        </div>

        {/* Clean Segmented Focus Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/70 rounded-b-xl">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {(
              [
                { id: 'all', label: 'All Today' },
                { id: 'attendance', label: 'One-Go Attendance' },
                { id: 'schedule_tasks', label: 'Timetable & Tasks' },
                { id: 'lesson_plans', label: `Lesson Plans (${lessonPlans.length})` },
              ] as Array<{ id: TodayFocusMode; label: string }>
            ).map((tab) => {
              const active = focusMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFocusMode(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('attendance_heatmap')}
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-900 whitespace-nowrap shrink-0"
            >
              Attendance Heatmap
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('academic_resources')}
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-blue-900 whitespace-nowrap shrink-0"
            >
              Academic Resources
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Adjusted Substitute Periods Strip (Shown directly to the Substitute Teacher & Class Owner) */}
      <div
        data-testid="today-adjusted-substitutes"
        className="rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="flex flex-col gap-2 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ArrowLeftRight className="h-4 w-4 text-blue-900 shrink-0" />
              Adjusted Substitute Periods
              <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                ({adjustedSubstitutePeriods.length})
              </span>
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Periods where a substitute has been adjusted, showing the assigned substitute teacher and quick class actions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('timetable_leave')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            Smart Timetable &amp; Cover Schedule
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {ackCoverError && (
          <div className="mx-5 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">
            {ackCoverError}
          </div>
        )}

        {adjustedSubstitutePeriods.length === 0 ? (
          <div className="px-5 py-3.5 text-xs text-slate-500">
            No substitute periods are currently adjusted for your timetable. Any period assigned to you as a substitute teacher will appear here automatically.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adjustedSubstitutePeriods.map((item) => {
              const canAcknowledge =
                item.isAssignedToCurrentTeacher && !item.id.startsWith('slot-sub-');
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 shrink-0 text-center">
                      <div className="font-mono text-xs font-semibold text-blue-900 tabular-nums">
                        P{item.period}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                        {item.day}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                        <span className="font-semibold text-slate-900">
                          Class {item.classSection} · {item.subject}
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums">
                          · {item.date} · {item.timeRange}
                        </span>
                        {item.room && (
                          <span className="text-xs text-slate-500">· Room {item.room}</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="font-semibold text-blue-900">
                          Substitute Teacher: {item.substituteTeacherName}
                          {item.isAssignedToCurrentTeacher ? ' (You)' : ''}
                        </span>
                        <span className="text-slate-500">
                          Covering for {item.absentTeacherName}
                        </span>
                        <span
                          className={`font-medium ${
                            item.publishStatus === 'published'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {item.publishStatus === 'published'
                            ? 'Published Cover'
                            : 'Adjusted · Pending Publish'}
                        </span>
                        {item.acknowledgedBySubstitute && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 sm:pl-3">
                    {canAcknowledge && !item.acknowledgedBySubstitute && (
                      <button
                        type="button"
                        data-testid={`ack-cover-${item.id}`}
                        disabled={ackCoverBusyId === item.id}
                        onClick={() => void handleAcknowledgeCover(item.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {ackCoverBusyId === item.id ? 'Confirming...' : 'Acknowledge Cover'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openOneGoAttendanceForClass(item.classSection)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      Roll Call
                    </button>
                    {onAssignHomework && (
                      <button
                        type="button"
                        onClick={() =>
                          onAssignHomework({
                            classSection: item.classSection,
                            subject: item.subject,
                          })
                        }
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
                      >
                        Assign HW
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* One-Go Attendance Entry Points Strip */}
      {showAttendanceEntryBar && classAttendanceEntryPoints.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                One-Go Attendance Entry Points
              </h3>
              <p className="text-xs text-slate-500">
                Select any assigned class to jump straight to its whole-class roll call roster for {todayIso}.
              </p>
            </div>
            <span className="text-xs text-slate-500 tabular-nums">
              {classAttendanceEntryPoints.filter((c) => c.isComplete).length} of{' '}
              {classAttendanceEntryPoints.length} classes synced
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {classAttendanceEntryPoints.map((entry) => {
              const isSelected = requestedAttendanceClass === entry.classSection;
              return (
                <button
                  key={entry.classSection}
                  type="button"
                  onClick={() => openOneGoAttendanceForClass(entry.classSection)}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/40'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        Class {entry.classSection}
                      </span>
                      {entry.isClassTeacher && (
                        <span className="text-[11px] font-medium text-blue-900">· Class Teacher</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                      {entry.markedCount}/{entry.total} marked
                      {entry.absentCount > 0 ? ` · ${entry.absentCount} absent` : ''}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0 ${
                      entry.isComplete ? 'text-emerald-700' : 'text-blue-900'
                    }`}
                  >
                    {entry.isComplete ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Synced
                      </>
                    ) : (
                      <>
                        Mark Roll
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Operational Grid: Daily Timetable + Pending Academic Tasks */}
      {showScheduleAndTasks && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* Left 7 Columns: Daily Timetable & Lesson Plans */}
          <div className="lg:col-span-7 space-y-5">
            {/* Daily Timetable Panel */}
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col gap-3 p-5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <CalendarClock className="h-4 w-4 text-slate-500" />
                    Daily Timetable
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedDay} schedule with direct roll-call, homework, and notebook actions.
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 self-start sm:self-auto">
                  {WEEKDAYS.map((day) => {
                    const active = selectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition ${
                          active
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {todaysTimetable.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No periods scheduled for {selectedDay}.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Switch weekdays above or open Smart Timetable &amp; Leave to view full weekly duties.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {todaysTimetable.map((slot) => {
                    const matchedSub =
                      substituteBySlotId.get(slot.id) ||
                      adjustedSubstitutePeriods.find(
                        (s) =>
                          s.period === slot.period &&
                          s.classSection === slot.classSection &&
                          normalizeDayPrefix(s.day) === normalizeDayPrefix(slot.day),
                      );
                    const activeSubTeacher =
                      matchedSub?.substituteTeacherName || slot.substitutionTeacher || null;
                    return (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-12 shrink-0 text-center">
                          <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                            P{slot.period}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                            {slot.timeRange.split(/[–-]/)[0]?.trim() || slot.timeRange}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-sm font-semibold text-slate-900">
                              {slot.subject}
                            </span>
                            <span className="text-xs font-medium text-slate-600 tabular-nums">
                              · Class {slot.classSection}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 tabular-nums">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {slot.timeRange}
                            </span>
                            {slot.room && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Room {slot.room}</span>
                              </>
                            )}
                          </div>
                          {activeSubTeacher && (
                            <div className="mt-1 text-xs font-medium text-blue-900">
                              Substitute Teacher: {activeSubTeacher}
                              {teacherMatchesSlot(activeSubTeacher, data.user.name) ? ' (You)' : ''}
                              {matchedSub?.absentTeacherName
                                ? ` · Covering for ${matchedSub.absentTeacherName}`
                                : ''}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 sm:pl-3">
                        <button
                          type="button"
                          onClick={() => openOneGoAttendanceForClass(slot.classSection)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Roll Call
                        </button>
                        {onAssignHomework && (
                          <button
                            type="button"
                            onClick={() =>
                              onAssignHomework({
                                classSection: slot.classSection,
                                subject: slot.subject,
                              })
                            }
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            Assign HW
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onNavigate('notebook')}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Notebooks
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-xs">
                <span className="text-slate-500 tabular-nums">
                  Showing {todaysTimetable.length} period{todaysTimetable.length === 1 ? '' : 's'} for{' '}
                  {selectedDay}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('timetable_leave')}
                  className="font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
                >
                  Open full timetable &amp; cover schedule
                </button>
              </div>
            </div>

            {/* Compact Lesson Plans Overview */}
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-200">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <BookOpen className="h-4 w-4 text-slate-500" />
                    Lesson Plans
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                    {completedLessonPlansCount} of {lessonPlans.length} completed · click status to progress
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddLessonForm((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {showAddLessonForm ? 'Close' : 'Add Plan'}
                  </button>
                </div>
              </div>

              {lessonError && (
                <div className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  {lessonError}
                </div>
              )}

              {showAddLessonForm && (
                <form
                  onSubmit={handleCreateLessonPlan}
                  className="border-b border-slate-200 bg-slate-50/60 p-5 space-y-3"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Class</label>
                      <select
                        value={newLessonClass}
                        onChange={(e) => setNewLessonClass(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      >
                        {(assignedClasses.length > 0 ? assignedClasses : ['6-A']).map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={newLessonSubject}
                        onChange={(e) => setNewLessonSubject(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Plan Cadence</label>
                      <select
                        value={newLessonLevel}
                        onChange={(e) => setNewLessonLevel(e.target.value as LessonPlan['level'])}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Date</label>
                      <input
                        type="date"
                        value={newLessonDate}
                        onChange={(e) => setNewLessonDate(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Lesson Topic</label>
                      <input
                        type="text"
                        value={newLessonTopic}
                        onChange={(e) => setNewLessonTopic(e.target.value)}
                        placeholder="e.g., Linear Equations — Word Problem Practice"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Learning Outcome
                      </label>
                      <input
                        type="text"
                        value={newLessonOutcome}
                        onChange={(e) => setNewLessonOutcome(e.target.value)}
                        placeholder="e.g., Solve two-step equations independently"
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLessonForm(false)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={lessonBusyId === 'creating' || !newLessonTopic.trim()}
                      className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      {lessonBusyId === 'creating' ? 'Saving...' : 'Save Lesson Plan'}
                    </button>
                  </div>
                </form>
              )}

              {lessonPlans.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No lesson plans logged yet. Click &ldquo;Add Plan&rdquo; above to add today&apos;s delivery plan.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lessonPlans.slice(0, 5).map((plan) => {
                    const isCompleted = plan.status === 'Completed';
                    const isPendingRevision = plan.status === 'Pending Revision';
                    return (
                      <div
                        key={plan.id}
                        className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900">{plan.topic}</div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 tabular-nums">
                            <span>Class {plan.classSection}</span>
                            <span aria-hidden="true">·</span>
                            <span>{plan.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span>{plan.level}</span>
                            <span aria-hidden="true">·</span>
                            <span>{plan.targetDate}</span>
                          </div>
                          {plan.learningOutcome && (
                            <p className="mt-1 text-xs text-slate-600">{plan.learningOutcome}</p>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={lessonBusyId === plan.id}
                          onClick={() => handleToggleLessonStatus(plan)}
                          className={`self-start sm:self-center rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition disabled:opacity-50 ${
                            isCompleted
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : isPendingRevision
                                ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {lessonBusyId === plan.id ? 'Updating...' : plan.status}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {lessonPlans.length > 5 && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex justify-end">
                  <button
                    type="button"
                    onClick={() => setFocusMode('lesson_plans')}
                    className="text-xs font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
                  >
                    View all {lessonPlans.length} lesson plans
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Pending Academic Tasks, Homework Tracking & Classroom Support */}
          <div className="lg:col-span-5 space-y-5">
            {/* Pending Academic Tasks Queue */}
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-2 p-5 border-b border-slate-200">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ClipboardCheck className="h-4 w-4 text-slate-500" />
                    Pending Academic Tasks
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Prioritized daily actions across attendance, notebooks, homework, and cover duties.
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap shrink-0">
                  {openTaskCount} open
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {pendingAcademicTasks.map((task) => {
                  const statusColor =
                    task.priority === 'high'
                      ? 'text-rose-700'
                      : task.priority === 'medium'
                        ? 'text-amber-700'
                        : 'text-emerald-700';
                  const dotColor =
                    task.priority === 'high'
                      ? 'bg-rose-600'
                      : task.priority === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600';

                  return (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <span className={statusColor}>{task.statusLabel}</span>
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-900 leading-snug">
                          {task.title}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                          {task.detail}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={task.onAction}
                        className={`mt-1 rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                          task.priority === 'high'
                            ? 'bg-blue-900 text-white hover:bg-blue-800'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {task.actionLabel}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Homework & Student Check-Ins */}
            {(teacherRecentHomework.length > 0 || guidedFollowUpStudents.length > 0) && (
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2 p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Homework &amp; Student Check-Ins
                  </h3>
                  {onOpenDailyHomework && (
                    <button
                      type="button"
                      onClick={onOpenDailyHomework}
                      className="text-xs font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
                    >
                      Daily HW Roster
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {teacherRecentHomework.slice(0, 3).map((row) => (
                    <div
                      key={row.assignment.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {row.assignment.title}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                          Class {row.assignment.classSection} · {row.assignment.subject} · Due{' '}
                          {row.assignment.dueDate}
                        </div>
                      </div>
                      <div className="text-right shrink-0 tabular-nums">
                        <div className="text-xs font-semibold text-slate-900">
                          {row.handedInCount}/{row.totalStudents}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.pendingCount} pending
                        </div>
                      </div>
                    </div>
                  ))}

                  {guidedFollowUpStudents.slice(0, 3).map((st) => (
                    <div
                      key={st.studentId}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">
                          {st.studentName} · Class {st.classSection}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 truncate">
                          {st.reason}
                        </div>
                      </div>
                      {onOpenStudent && (
                        <button
                          type="button"
                          onClick={() => onOpenStudent(st.studentId)}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Open 360°
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Authorised Classroom Support Recommendations (Non-Confidential, Assigned Students Only) */}
            {classroomSupportPlans.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2 p-5 border-b border-slate-200">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ShieldCheck className="h-4 w-4 text-slate-500" />
                      Authorised Classroom Support
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Specialist-approved accommodations only (clinical notes remain private).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('clinical_care')}
                    className="text-xs font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
                  >
                    Record Observation
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {classroomSupportPlans.map((plan) => (
                    <div key={plan.id} className="px-5 py-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {plan.studentName} · Class {plan.classSection}
                        </span>
                        <span className="text-slate-500">{plan.planType}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {plan.teacherClassroomGuidance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* School Notices & Attendance Check-Ins */}
            {(announcements.length > 0 || supportAlerts.length > 0) && (
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2 p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notices &amp; Attendance Check-Ins
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance_heatmap')}
                    className="text-xs font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0"
                  >
                    View Heatmap
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {supportAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="px-5 py-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {alert.studentName} · Class {alert.classSection}
                        </span>
                        <span className="font-medium text-amber-700">{alert.status}</span>
                      </div>
                      <p className="mt-0.5 text-slate-600">{alert.indicatorSummary}</p>
                    </div>
                  ))}
                  {announcements.slice(0, 3).map((item) => (
                    <div key={item.id} className="px-5 py-3 text-xs">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="mt-0.5 text-slate-500 tabular-nums">
                        {item.module} · {item.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focused Lesson Plans Full View */}
      {showLessonPlansFocused && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 p-5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">All Lesson Plans</h3>
              <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                {completedLessonPlansCount} of {lessonPlans.length} completed · click any status button to update delivery progress
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddLessonForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {showAddLessonForm ? 'Close Form' : 'New Lesson Plan'}
            </button>
          </div>

          {lessonError && (
            <div className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
              {lessonError}
            </div>
          )}

          {showAddLessonForm && (
            <form
              onSubmit={handleCreateLessonPlan}
              className="border-b border-slate-200 bg-slate-50/60 p-5 space-y-3"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Class</label>
                  <select
                    value={newLessonClass}
                    onChange={(e) => setNewLessonClass(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    {(assignedClasses.length > 0 ? assignedClasses : ['6-A']).map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newLessonSubject}
                    onChange={(e) => setNewLessonSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Plan Cadence</label>
                  <select
                    value={newLessonLevel}
                    onChange={(e) => setNewLessonLevel(e.target.value as LessonPlan['level'])}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newLessonDate}
                    onChange={(e) => setNewLessonDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Lesson Topic</label>
                  <input
                    type="text"
                    value={newLessonTopic}
                    onChange={(e) => setNewLessonTopic(e.target.value)}
                    placeholder="e.g., Fractions & Decimals — Guided Application"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Learning Outcome
                  </label>
                  <input
                    type="text"
                    value={newLessonOutcome}
                    onChange={(e) => setNewLessonOutcome(e.target.value)}
                    placeholder="e.g., Students convert decimals to fractions accurately"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={lessonBusyId === 'creating' || !newLessonTopic.trim()}
                  className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {lessonBusyId === 'creating' ? 'Saving...' : 'Save Lesson Plan'}
                </button>
              </div>
            </form>
          )}

          {lessonPlans.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No lesson plans found. Create your first daily or weekly plan above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lessonPlans.map((plan) => {
                const isCompleted = plan.status === 'Completed';
                const isPendingRevision = plan.status === 'Pending Revision';
                return (
                  <div
                    key={plan.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{plan.topic}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 tabular-nums">
                        <span>Class {plan.classSection}</span>
                        <span aria-hidden="true">·</span>
                        <span>{plan.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span>{plan.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>Target {plan.targetDate}</span>
                      </div>
                      {plan.learningOutcome && (
                        <p className="mt-1 text-xs text-slate-600">{plan.learningOutcome}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={lessonBusyId === plan.id}
                      onClick={() => handleToggleLessonStatus(plan)}
                      className={`self-start sm:self-center rounded-md border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition disabled:opacity-50 ${
                        isCompleted
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : isPendingRevision
                            ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {lessonBusyId === plan.id ? 'Updating...' : plan.status}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Integrated One-Go Class Attendance Roster */}
      {showInlineRoster && (
        <div
          ref={attendanceSectionRef}
          id="today-one-go-attendance"
          className="rounded-xl border border-slate-200 bg-white p-5 scroll-mt-4"
        >
          <BatchAttendanceRosterPanel
            students={data.students}
            attendance={data.attendance}
            monthlyAttendance={data.monthlyAttendance || []}
            attendanceNotifications={data.attendanceNotifications || []}
            user={data.user}
            schoolId={data.activeSchool.id}
            school={data.activeSchool}
            canEdit={true}
            token={token}
            onRefresh={onRefresh}
            requestedClassSection={requestedAttendanceClass}
            requestSeq={attendanceJumpSeq}
          />
        </div>
      )}
    </section>
  );
};
