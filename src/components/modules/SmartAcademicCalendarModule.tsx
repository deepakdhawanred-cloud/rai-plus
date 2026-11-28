import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CloudRain,
  History,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  AcademicCalendarEntryType,
  AcademicCalendarState,
  CalendarCreationMode,
  CalendarReschedulingMode,
  CurriculumChapterStatus,
} from '../../types/controlRoomCalendar';
import {
  VIS_BELL_SCHEDULE_40MIN,
  VIS_PERIOD_SHIFT_POLICY,
  VIS_SCHOOL_ID,
  VIS_SUBJECT_PLANNERS_2026,
} from '../../data/visAcademicPlanners2026';
import {
  computeWorkingDaysMetrics,
  createInitialAcademicCalendar,
} from '../../utils/smartAcademicCalendarEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface SmartAcademicCalendarModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type CalendarSubTab =
  | 'calendar'
  | 'vis_planners'
  | 'impact_approvals'
  | 'curriculum'
  | 'circulars_history';

function entryTypeBadge(type: AcademicCalendarEntryType): string {
  switch (type) {
    case 'Holiday':
    case 'Vacation':
      return 'bg-rose-100 text-rose-900 border-rose-200';
    case 'Board Exam':
      return 'bg-indigo-100 text-indigo-950 border-indigo-300';
    case 'Examination':
      return 'bg-amber-100 text-amber-950 border-amber-300';
    case 'PTM':
      return 'bg-teal-100 text-teal-900 border-teal-200';
    case 'Event':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export const SmartAcademicCalendarModule: React.FC<SmartAcademicCalendarModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isManagement = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const isStaff = isManagement || data.user.role === 'teacher';
  const isVisSchool = data.activeSchool.id === VIS_SCHOOL_ID;

  const [subTab, setSubTab] = useState<CalendarSubTab>('calendar');
  const [selectedPlannerId, setSelectedPlannerId] = useState<string>(
    VIS_SUBJECT_PLANNERS_2026[0]?.id || '',
  );
  const [calendarState, setCalendarState] = useState<AcademicCalendarState | null>(
    data.academicCalendar || null,
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // Mid-session modification form
  const [modTitle, setModTitle] = useState('');
  const [modType, setModType] = useState<AcademicCalendarEntryType>('Holiday');
  const [modDate, setModDate] = useState('2026-11-24');
  const [modEndDate, setModEndDate] = useState('2026-11-28');
  const [modReason, setModReason] = useState('');
  const [modMode, setModMode] = useState<CalendarReschedulingMode>('Semi-Automatic');

  // Per-item approval overrides for Semi-Automatic / Manual modes
  const [itemOverrides, setItemOverrides] = useState<
    Record<string, { approved?: boolean; customDate?: string }>
  >({});
  const [allowLockedOverride, setAllowLockedOverride] = useState(false);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await apiRequest<{ calendar: AcademicCalendarState }>(
        '/api/academic-calendar',
        {},
        token || undefined,
      );
      setCalendarState(res.calendar);
    } catch {
      // keep existing state
    }
  }, [token]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar, data.activeSchool.id]);

  const calendar: AcademicCalendarState = useMemo(() => {
    if (calendarState && calendarState.schoolId === data.activeSchool.id) return calendarState;
    if (data.academicCalendar && data.academicCalendar.schoolId === data.activeSchool.id) {
      return data.academicCalendar;
    }
    return createInitialAcademicCalendar({
      schoolId: data.activeSchool.id,
      board: data.activeSchool.board,
      session: data.activeSchool.session,
      mode: 'Hybrid',
    });
  }, [calendarState, data.academicCalendar, data.activeSchool]);

  const metrics = useMemo(() => computeWorkingDaysMetrics(calendar), [calendar]);
  const pendingDrafts = useMemo(
    () => calendar.pendingDrafts.filter((d) => d.status === 'Pending Approval'),
    [calendar.pendingDrafts],
  );
  const unackCirculars = useMemo(
    () => calendar.boardCirculars.filter((c) => !c.acknowledged).length,
    [calendar.boardCirculars],
  );

  async function handleGenerateMode(mode: CalendarCreationMode) {
    setBusyKey(`mode-${mode}`);
    try {
      const res = await apiRequest<{ calendar: AcademicCalendarState }>(
        '/api/academic-calendar/generate',
        {
          method: 'POST',
          body: JSON.stringify({ mode, board: calendar.board, session: calendar.session }),
        },
        token || undefined,
      );
      setCalendarState(res.calendar);
      pushToast(`Calendar switched to ${mode} (${calendar.board}) as v${res.calendar.currentVersion}.`, 'success');
      await onRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to switch calendar mode.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleAnalyzeImpactDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!modTitle.trim() || !modDate) return;
    setBusyKey('draft-impact');
    try {
      await apiRequest(
        '/api/academic-calendar/draft-impact',
        {
          method: 'POST',
          body: JSON.stringify({
            actionType: 'Add',
            reschedulingMode: modMode,
            reason: modReason.trim() || `Mid-session ${modType} update`,
            entry: {
              title: modTitle.trim(),
              type: modType,
              date: modDate,
              endDate: modEndDate >= modDate ? modEndDate : undefined,
              source: 'School Custom',
            },
          }),
        },
        token || undefined,
      );
      pushToast('Impact analysis complete! Review proposed rescheduling in the Approval Queue.', 'success');
      setModTitle('');
      setModReason('');
      await loadCalendar();
      setSubTab('impact_approvals');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Impact analysis failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  function applyFiveDayClosurePreset() {
    setModTitle('Unexpected Extreme Weather Closure (5 Days)');
    setModType('Holiday');
    setModDate('2026-11-24');
    setModEndDate('2026-11-28');
    setModMode('Semi-Automatic');
    setModReason('District severe weather & air-quality closure advisory (24–28 Nov)');
  }

  async function handleApproveDraft(draftId: string) {
    setBusyKey(`approve-${draftId}`);
    try {
      const res = await apiRequest<{ calendar: AcademicCalendarState }>(
        `/api/academic-calendar/drafts/${encodeURIComponent(draftId)}/approve`,
        {
          method: 'POST',
          body: JSON.stringify({ itemOverrides, allowLockedOverride }),
        },
        token || undefined,
      );
      setCalendarState(res.calendar);
      setItemOverrides({});
      setAllowLockedOverride(false);
      pushToast(
        `Calendar v${res.calendar.currentVersion} published! Teachers, coordinators & linked events synced.`,
        'success',
      );
      await onRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Approval failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRejectDraft(draftId: string) {
    setBusyKey(`reject-${draftId}`);
    try {
      await apiRequest(
        `/api/academic-calendar/drafts/${encodeURIComponent(draftId)}/reject`,
        { method: 'POST', body: JSON.stringify({}) },
        token || undefined,
      );
      pushToast('Draft rejected — published calendar unchanged.', 'info');
      await loadCalendar();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to reject draft.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpdateChapter(
    chapterId: string,
    completedPeriods: number,
    status?: CurriculumChapterStatus,
  ) {
    setBusyKey(`cur-${chapterId}`);
    try {
      await apiRequest(
        `/api/academic-calendar/curriculum/${encodeURIComponent(chapterId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ completedPeriods, status }),
        },
        token || undefined,
      );
      pushToast('Curriculum chapter teaching progress updated.', 'success');
      await loadCalendar();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Update failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRollback(version: number) {
    setBusyKey(`rb-${version}`);
    try {
      const res = await apiRequest<{ calendar: AcademicCalendarState }>(
        `/api/academic-calendar/versions/${version}/rollback`,
        {
          method: 'POST',
          body: JSON.stringify({ reason: `Administrative rollback to v${version}` }),
        },
        token || undefined,
      );
      setCalendarState(res.calendar);
      pushToast(`Restored calendar snapshot v${version} as v${res.calendar.currentVersion}.`, 'success');
      await onRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Rollback failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleAdoptCircular(circularId: string, createDraft: boolean) {
    setBusyKey(`circ-${circularId}`);
    try {
      await apiRequest(
        `/api/academic-calendar/circulars/${encodeURIComponent(circularId)}/acknowledge`,
        { method: 'POST', body: JSON.stringify({ createDraft }) },
        token || undefined,
      );
      pushToast(
        createDraft
          ? 'Circular converted into an impact-analyzed draft (approved calendar untouched until you confirm).'
          : 'Board circular marked acknowledged.',
        'success',
      );
      await loadCalendar();
      if (createDraft) setSubTab('impact_approvals');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Circular action failed.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="smart-academic-calendar-module">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#142B46]/15 bg-[#142B46] text-[#F3E6D8] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#D6B66D]/20 border border-[#D6B66D]/50 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#D6B66D]">
                {calendar.board} · Session {calendar.session} · v{calendar.currentVersion}
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#A9C5D8]">
                Mode: {calendar.creationMode}
              </span>
              {isVisSchool && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                  40-Min Periods (Shifted from 30m Planners · 7 Periods/Day)
                </span>
              )}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              Smart Academic Calendar &amp; Dynamic Curriculum Rescheduler
            </h1>
            <p className="text-xs text-[#A9C5D8]">
              Centralized scheduling engine synced across Timetable, Curriculum Recovery, Examinations, School Events &amp; Teacher Planners.
            </p>
          </div>

          {isManagement && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#0D1E33] p-1.5 border border-[#254264]">
              {(['Automatic', 'Hybrid', 'Manual'] as CalendarCreationMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={busyKey !== null}
                  onClick={() => void handleGenerateMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    calendar.creationMode === m
                      ? 'bg-[#D6B66D] text-[#142B46]'
                      : 'text-[#A9C5D8] hover:text-white'
                  }`}
                >
                  {m === 'Hybrid' ? 'Hybrid (Default)' : m === 'Automatic' ? `Auto (${calendar.board})` : 'Manual'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Working Days Calculator Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: 'Instructional Days', value: metrics.instructionalTeachingDays, accent: 'text-emerald-300' },
            { label: 'Holidays & Vacations', value: metrics.holidayAndVacationDays, accent: 'text-rose-300' },
            { label: 'Examination Days', value: metrics.examinationDays, accent: 'text-[#D6B66D]' },
            { label: 'Events & PTMs', value: metrics.eventAndPtmDays, accent: 'text-sky-300' },
            { label: 'Emergency Buffer Days', value: metrics.bufferDays, accent: 'text-amber-300' },
            { label: 'Total Session Days', value: metrics.totalSessionDays, accent: 'text-white' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg bg-[#0D1E33]/90 border border-[#254264] px-3 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A9C5D8]">
                {stat.label}
              </p>
              <p className={`font-mono text-xl font-bold tabular-nums mt-0.5 ${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'calendar', label: `Annual Schedule (${calendar.entries.length})`, icon: Calendar },
            ...(isVisSchool
              ? [
                  {
                    id: 'vis_planners' as const,
                    label: `40-Min Subject Planners (${VIS_SUBJECT_PLANNERS_2026.length})`,
                    icon: Clock,
                  },
                ]
              : []),
            ...(isManagement
              ? [
                  {
                    id: 'impact_approvals' as const,
                    label: `Impact Analysis & Approvals (${pendingDrafts.length})`,
                    icon: Sparkles,
                  },
                ]
              : []),
            { id: 'curriculum', label: `Curriculum Recovery (${calendar.curriculumPlans.length})`, icon: BookOpen },
            {
              id: 'circulars_history',
              label: `Board Circulars (${unackCirculars}) & History (v${calendar.currentVersion})`,
              icon: History,
            },
          ] as Array<{ id: CalendarSubTab; label: string; icon: React.ComponentType<{ className?: string }> }>
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#142B46] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1B: VIS 2026-27 40-MINUTE SHIFTED SUBJECT PLANNERS ==================== */}
      {subTab === 'vis_planners' && isVisSchool && (() => {
        const activePlanner =
          VIS_SUBJECT_PLANNERS_2026.find((p) => p.id === selectedPlannerId) ||
          VIS_SUBJECT_PLANNERS_2026[0];
        return (
          <div className="space-y-5" data-testid="vis-40min-planners-panel">
            {/* 30-Min -> 40-Min Period Conversion Banner & Bell Schedule */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    VIS Period Duration Upgrade: 30 Mins → 40 Mins (Factor × 0.75)
                  </p>
                  <p className="text-xs text-slate-700 mt-1">{VIS_PERIOD_SHIFT_POLICY.note}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 text-[11px]">
                  <span className="rounded-lg bg-white border border-amber-300 px-2.5 py-1 font-semibold text-amber-950">
                    Revision: {VIS_PERIOD_SHIFT_POLICY.revisionModel}
                  </span>
                  <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 font-semibold text-slate-800">
                    Syllabus Deadline: 31 Dec 2026
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {VIS_BELL_SCHEDULE_40MIN.map((slot) => (
                  <div
                    key={slot.id}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
                      slot.kind === 'period'
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-amber-100/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <span className="font-bold">{slot.label}</span>
                    <span className="font-mono text-slate-500 ml-1.5">
                      {slot.startTime}–{slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject Planner Selector Chips */}
            <div className="flex flex-wrap gap-2">
              {VIS_SUBJECT_PLANNERS_2026.map((planner) => {
                const selected = planner.id === activePlanner.id;
                return (
                  <button
                    key={planner.id}
                    type="button"
                    onClick={() => setSelectedPlannerId(planner.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left ${
                      selected
                        ? 'bg-[#142B46] text-white border-[#142B46] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>
                      {planner.classLabel} · {planner.subject}
                    </span>
                    <span
                      className={`ml-2 font-mono text-[10px] rounded px-1.5 py-0.5 ${
                        selected ? 'bg-[#D6B66D]/25 text-[#D6B66D]' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {planner.shiftedPeriodsPerWeek}/wk (40m)
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Planner Detail Card */}
            {activePlanner && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                        {activePlanner.boardAlignment} · Session {activePlanner.session}
                      </p>
                      <h2 className="font-display text-lg font-bold text-[#142B46]">
                        {activePlanner.classLabel} ({activePlanner.classSection}) — {activePlanner.subject}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-lg bg-slate-200/70 px-2.5 py-1 text-slate-600 line-through font-mono">
                        30m: {activePlanner.originalPeriodsPerWeek}/wk ({activePlanner.originalTotalPeriodsYear}/yr)
                      </span>
                      <span className="rounded-lg bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-emerald-900 font-bold font-mono">
                        40m Shifted: {activePlanner.shiftedPeriodsPerWeek}/wk ({activePlanner.shiftedTotalPeriodsYear}/yr)
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-2.5">Month</th>
                          <th className="px-4 py-2.5">Chapter / Topic</th>
                          <th className="px-4 py-2.5">Exam</th>
                          <th className="px-4 py-2.5 text-right">30m Orig</th>
                          <th className="px-4 py-2.5 text-right">40m Shifted</th>
                          <th className="px-4 py-2.5">Target Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activePlanner.chapters.map((ch) => (
                          <tr key={`${activePlanner.id}-${ch.chapterNo}`} className="hover:bg-slate-50/70">
                            <td className="px-4 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                              {ch.month}
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-semibold text-slate-900">{ch.title}</p>
                              <p className="text-[11px] text-slate-500">
                                {ch.theme}
                                {ch.revisionDays ? ` · Revision (1-4-7-15-30): ${ch.revisionDays}` : ''}
                              </p>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                                {ch.examTag}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-slate-400 line-through">
                              {ch.originalPeriods30Min}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-800">
                              {ch.shiftedPeriods40Min}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                              {ch.plannedCompletionDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <h3 className="font-display text-sm font-bold text-[#142B46]">
                      Examination Syllabus Breakdown
                    </h3>
                    <div className="space-y-2 text-xs">
                      {activePlanner.examSummary.map((ex) => (
                        <div
                          key={ex.exam}
                          className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5"
                        >
                          <p className="font-bold text-slate-900">{ex.exam}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{ex.syllabus}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
                    <h3 className="font-display text-sm font-bold text-[#142B46]">
                      NEP 2020 Pedagogy &amp; Enrichment
                    </h3>
                    <p className="text-[11px] text-slate-600">{VIS_PERIOD_SHIFT_POLICY.pedagogyModel}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activePlanner.enrichmentActivities.map((act) => (
                        <span
                          key={act}
                          className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold text-blue-900"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ==================== TAB 1: ANNUAL SCHEDULE + DYNAMIC MODIFIER ==================== */}
      {subTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dynamic Mid-Session Modification Builder */}
          {isManagement && (
            <form
              onSubmit={handleAnalyzeImpactDraft}
              className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-[#142B46]">
                    Modify Mid-Session Schedule
                  </h2>
                  <p className="text-xs text-slate-500">
                    Every change runs full impact analysis before you approve publication.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyFiveDayClosurePreset}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 shrink-0"
                >
                  <CloudRain className="h-3.5 w-3.5" />
                  5-Day Closure Demo
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event / Holiday / Closure Title
                  </label>
                  <input
                    type="text"
                    required
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="e.g. Extreme Weather Closure or Revised Unit Test"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                    <select
                      value={modType}
                      onChange={(e) => setModType(e.target.value as AcademicCalendarEntryType)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="Holiday">Holiday / Emergency Closure</option>
                      <option value="Vacation">Vacation</option>
                      <option value="Examination">Examination</option>
                      <option value="PTM">PTM</option>
                      <option value="Event">School Event / Competition</option>
                      <option value="Special Instructional Day">Extra Instructional Day</option>
                      <option value="Academic Deadline">Academic Deadline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rescheduling Mode
                    </label>
                    <select
                      value={modMode}
                      onChange={(e) => setModMode(e.target.value as CalendarReschedulingMode)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    >
                      <option value="Semi-Automatic">Semi-Automatic (Recommended)</option>
                      <option value="Automatic">Automatic Shift</option>
                      <option value="Manual">Manual Control</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={modDate}
                      onChange={(e) => setModDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={modEndDate}
                      onChange={(e) => setModEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Audit Trail
                  </label>
                  <textarea
                    rows={2}
                    value={modReason}
                    onChange={(e) => setModReason(e.target.value)}
                    placeholder="Document official notice or administrative decision..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busyKey === 'draft-impact'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#142B46] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1E3A5F] disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-[#D6B66D]" />
                {busyKey === 'draft-impact'
                  ? 'Analysing Timetable & Curriculum Impact...'
                  : 'Run Impact Analysis & Create Draft'}
              </button>
            </form>
          )}

          {/* Published Academic Calendar Timeline */}
          <div className={`${isManagement ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-xl border border-slate-200 bg-white p-5 space-y-3`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#142B46]">
                Published Academic Calendar ({calendar.entries.length} Milestones)
              </h2>
              <span className="text-[11px] text-slate-500">
                Working Days: {calendar.workingDays.join(', ')}
              </span>
            </div>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-[540px] overflow-y-auto">
              {calendar.entries.map((entry) => (
                <div key={entry.id} className="p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono font-bold text-[#142B46]">
                        {entry.date}
                        {entry.endDate && entry.endDate !== entry.date ? ` → ${entry.endDate}` : ''}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${entryTypeBadge(entry.type)}`}>
                        {entry.type}
                      </span>
                      {entry.isLockedOfficial && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                          <Lock className="h-2.5 w-2.5" /> Locked Official
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900">{entry.title}</p>
                    {entry.description && <p className="text-[11px] text-slate-500">{entry.description}</p>}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
                    {entry.source}
                  </span>
                </div>
              ))}
              {calendar.entries.length === 0 && (
                <p className="p-6 text-center text-xs text-slate-500">
                  Manual mode initialized cleanly. Use the form on the left to add your school’s holidays, examinations, and events.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: AI IMPACT ANALYSIS & APPROVAL QUEUE ==================== */}
      {subTab === 'impact_approvals' && isManagement && (
        <div className="space-y-4">
          {pendingDrafts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
              <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="font-display text-base font-bold text-[#142B46]">
                No Pending Calendar Modifications
              </h3>
              <p className="text-xs text-slate-600">
                Use <strong>Annual Schedule → Modify Mid-Session Schedule</strong> (or click the <strong>5-Day Closure Demo</strong>) to preview automatic timetable, exam, event, and curriculum impact analysis.
              </p>
            </div>
          ) : (
            pendingDrafts.map((draft) => (
              <div
                key={draft.id}
                className="rounded-xl border-2 border-[#D6B66D]/70 bg-white p-5 space-y-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                      Pending Mandatory Approval · {draft.reschedulingMode}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#142B46] mt-1">
                      {draft.proposedEntry.title} ({draft.proposedEntry.date}
                      {draft.proposedEntry.endDate ? ` → ${draft.proposedEntry.endDate}` : ''})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Proposed by {draft.createdBy} · {draft.impactReport.recoverySummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => void handleRejectDraft(draft.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Discard Draft
                    </button>
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => void handleApproveDraft(draft.id)}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                      {busyKey === `approve-${draft.id}`
                        ? 'Publishing...'
                        : 'Approve, Publish & Notify Stakeholders'}
                    </button>
                  </div>
                </div>

                {/* Conflicts & Locked Exam Safeguards */}
                {draft.impactReport.conflicts.length > 0 && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3.5 space-y-2 text-xs text-rose-950">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-rose-700" />
                      {draft.impactReport.conflicts.length} Schedule Conflict(s) Detected
                    </p>
                    {draft.impactReport.conflicts.map((c) => (
                      <p key={c.id}>• [{c.severity}] {c.message}</p>
                    ))}
                    {draft.impactReport.conflicts.some((c) => c.lockedOfficialConflict) && (
                      <label className="flex items-center gap-2 pt-1 font-semibold">
                        <input
                          type="checkbox"
                          checked={allowLockedOverride}
                          onChange={(e) => setAllowLockedOverride(e.target.checked)}
                        />
                        Authorized Principal Override: permit rescheduling locked official dates
                      </label>
                    )}
                  </div>
                )}

                {/* Affected Items & Rescheduling Proposals */}
                {draft.impactReport.affectedItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#142B46] uppercase tracking-wider">
                      Affected Activities, Exams &amp; Curriculum Chapters
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="px-3 py-2 text-left">Approve</th>
                            <th className="px-3 py-2 text-left">Activity / Chapter</th>
                            <th className="px-3 py-2 text-left">Original</th>
                            <th className="px-3 py-2 text-left">Proposed Revised Date</th>
                            <th className="px-3 py-2 text-left">Recovery Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {draft.impactReport.affectedItems.map((item) => {
                            const ov = itemOverrides[item.id];
                            const checked = ov?.approved ?? item.approved;
                            const customDate = ov?.customDate ?? item.proposedDate;
                            return (
                              <tr key={item.id}>
                                <td className="px-3 py-2">
                                  <input
                                    type="checkbox"
                                    disabled={item.isLockedOfficial && !allowLockedOverride}
                                    checked={checked}
                                    onChange={(e) =>
                                      setItemOverrides((prev) => ({
                                        ...prev,
                                        [item.id]: { ...prev[item.id], approved: e.target.checked },
                                      }))
                                    }
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <span className="font-bold text-slate-900">{item.title}</span>
                                  <span className="ml-1.5 text-[10px] text-slate-500">
                                    ({item.category}{item.classSection ? ` · ${item.classSection}` : ''})
                                  </span>
                                </td>
                                <td className="px-3 py-2 font-mono text-slate-600">{item.originalDate}</td>
                                <td className="px-3 py-2">
                                  <input
                                    type="date"
                                    disabled={item.isLockedOfficial && !allowLockedOverride}
                                    value={customDate}
                                    onChange={(e) =>
                                      setItemOverrides((prev) => ({
                                        ...prev,
                                        [item.id]: { ...prev[item.id], customDate: e.target.value },
                                      }))
                                    }
                                    className="rounded border border-slate-300 px-2 py-1 font-mono text-[11px]"
                                  />
                                </td>
                                <td className="px-3 py-2 text-slate-600">{item.recoveryAction}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Subject-Wise Period Deficits */}
                {draft.impactReport.affectedSubjectDeficits.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#142B46] uppercase tracking-wider">
                      Subject-Wise Period Deficits &amp; Recovery Plan
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {draft.impactReport.affectedSubjectDeficits.slice(0, 6).map((def) => (
                        <div
                          key={`${def.classSection}-${def.subject}`}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1"
                        >
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{def.classSection} · {def.subject}</span>
                            <span className="text-rose-700">-{def.periodsLost} periods</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{def.recoveryStrategy}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== TAB 3: CURRICULUM RECOVERY PLANNER ==================== */}
      {subTab === 'curriculum' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#142B46]">
              Actual Periods-Taught Curriculum Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Tracks real classroom periods completed (never assumes syllabus completion merely from calendar dates).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-3 py-2.5 text-left">Class &amp; Subject</th>
                  <th className="px-3 py-2.5 text-left">Chapter</th>
                  <th className="px-3 py-2.5 text-left">Progress (Actual Periods)</th>
                  <th className="px-3 py-2.5 text-left">Target / Revised</th>
                  <th className="px-3 py-2.5 text-left">Status</th>
                  {isStaff && <th className="px-3 py-2.5 text-right">Teacher Update</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {calendar.curriculumPlans.map((ch) => {
                  const pct = Math.round((ch.completedPeriods / Math.max(1, ch.plannedPeriods)) * 100);
                  return (
                    <tr key={ch.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-bold text-[#142B46]">
                        {ch.classSection} · {ch.subject}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-900">
                        Ch {ch.chapterNumber}: {ch.chapterTitle}
                      </td>
                      <td className="px-3 py-3 min-w-[160px]">
                        <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                          <span>{ch.completedPeriods}/{ch.plannedPeriods} periods</span>
                          <span className="font-bold">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              ch.status === 'At Risk'
                                ? 'bg-rose-500'
                                : ch.status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : 'bg-[#142B46]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px]">
                        <p className="text-slate-700">{ch.plannedCompletionDate}</p>
                        {ch.revisedCompletionDate && (
                          <p className="text-amber-700 font-bold">→ {ch.revisedCompletionDate}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ch.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-900'
                              : ch.status === 'At Risk'
                                ? 'bg-rose-100 text-rose-900'
                                : ch.status === 'Partially Completed'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </td>
                      {isStaff && (
                        <td className="px-3 py-3 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            disabled={ch.completedPeriods >= ch.plannedPeriods || busyKey === `cur-${ch.id}`}
                            onClick={() => void handleUpdateChapter(ch.id, ch.completedPeriods + 1)}
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold hover:bg-slate-100 disabled:opacity-40"
                          >
                            +1 Period
                          </button>
                          <button
                            type="button"
                            disabled={ch.status === 'Completed' || busyKey === `cur-${ch.id}`}
                            onClick={() => void handleUpdateChapter(ch.id, ch.plannedPeriods, 'Completed')}
                            className="rounded bg-emerald-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-40"
                          >
                            Complete ✓
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: BOARD CIRCULARS, NOTIFICATIONS & VERSION HISTORY ==================== */}
      {subTab === 'circulars_history' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CBSE / HBSE Circular Monitor */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-[#142B46] flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#937024]" />
              {calendar.board} Board Circular Monitoring
            </h3>
            <p className="text-xs text-slate-500">
              Circulars notify management for review and never overwrite your approved school calendar silently.
            </p>
            <div className="space-y-3">
              {calendar.boardCirculars.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-800">{c.circularNo}</span>
                    <span className="text-[10px] text-slate-500">{c.publishedDate}</span>
                  </div>
                  <p className="font-bold text-slate-900">{c.title}</p>
                  <p className="text-slate-600 leading-relaxed">{c.summary}</p>
                  <p className="font-mono text-[11px] text-[#142B46]">
                    Suggested Date: {c.suggestedDate}{c.suggestedEndDate ? ` → ${c.suggestedEndDate}` : ''} ({c.suggestedType})
                  </p>
                  {isManagement && !c.acknowledged && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => void handleAdoptCircular(c.id, true)}
                        className="rounded-md bg-[#142B46] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E3A5F]"
                      >
                        Create Reviewable Draft
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAdoptCircular(c.id, false)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Acknowledge Only
                      </button>
                    </div>
                  )}
                  {c.acknowledged && (
                    <p className="text-[11px] font-semibold text-emerald-700">
                      ✓ Acknowledged by {c.acknowledgedBy}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Version History & Rollback */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <h3 className="font-display text-base font-bold text-[#142B46] flex items-center gap-2">
              <History className="h-4 w-4 text-[#937024]" />
              Calendar Version Control &amp; Rollback
            </h3>
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto">
              {calendar.versions.map((v) => (
                <div
                  key={v.version}
                  className="rounded-lg border border-slate-200 p-3.5 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#142B46]">v{v.version}</span>
                      {v.version === calendar.currentVersion && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          ACTIVE
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        by {v.publishedBy} · {v.publishedAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{v.reason}</p>
                    <p className="text-[11px] text-slate-600">{v.summary}</p>
                  </div>
                  {isManagement && v.version !== calendar.currentVersion && (
                    <button
                      type="button"
                      disabled={busyKey !== null}
                      onClick={() => void handleRollback(v.version)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100 shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" /> Rollback
                    </button>
                  )}
                </div>
              ))}
            </div>

            {calendar.notifications.length > 0 && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <p className="text-xs font-bold text-[#142B46]">Recent Stakeholder Notifications</p>
                {calendar.notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 text-xs">
                    <p className="font-bold text-blue-950">{n.title}</p>
                    <p className="text-[11px] text-blue-900 mt-0.5">{n.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
