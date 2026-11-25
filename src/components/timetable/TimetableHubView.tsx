import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Layers,
  Plus,
  RefreshCw,
  Share2,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import type { TeacherLeaveRequest } from '../../types';
import {
  computePublishedTimelineBars,
  type TimetablePlanVersion,
} from '../../utils/smartTimetableMasterEngine';

interface TimetableHubViewProps {
  userName: string;
  userRoleLabel: string;
  schoolName: string;
  pendingLeaves: TeacherLeaveRequest[];
  myUpcomingLeaves: TeacherLeaveRequest[];
  staffCount: number;
  classCount: number;
  subjectCount: number;
  roomCount: number;
  plans: TimetablePlanVersion[];
  onOpenStaffDirectory: () => void;
  onOpenGridEditor: (planId: string) => void;
  onOpenLeaveApprovals: () => void;
  onOpenApplyLeave: () => void;
  onTogglePublishPlan: (planId: string) => void;
  onCreatePlan: (name: string) => void;
  onSharePlan: (plan: TimetablePlanVersion) => void;
}

export const TimetableHubView: React.FC<TimetableHubViewProps> = ({
  userName,
  userRoleLabel,
  schoolName,
  pendingLeaves,
  myUpcomingLeaves,
  staffCount,
  classCount,
  subjectCount,
  roomCount,
  plans,
  onOpenStaffDirectory,
  onOpenGridEditor,
  onOpenLeaveApprovals,
  onOpenApplyLeave,
  onTogglePublishPlan,
  onCreatePlan,
  onSharePlan,
}) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const todayIso = '2026-11-21';

  const { windowStartIso, windowEndIso, rangeLabel, monthLabels } = useMemo(() => {
    const baseYear = 2026;
    const baseMonth = 9 + monthOffset; // Oct = 9 (0-indexed)
    const startDate = new Date(Date.UTC(baseYear, baseMonth, 1));
    const endDate = new Date(Date.UTC(baseYear, baseMonth + 4, 0));
    const labels: string[] = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(Date.UTC(baseYear, baseMonth + i, 1));
      const mShort = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const yr = d.getUTCFullYear();
      labels.push(i === 3 || d.getUTCMonth() === 0 ? `${mShort} ${yr}` : mShort);
    }
    const startLbl = startDate.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const endLbl = endDate.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return {
      windowStartIso: startDate.toISOString().slice(0, 10),
      windowEndIso: endDate.toISOString().slice(0, 10),
      rangeLabel: `${startLbl} to ${endLbl}`,
      monthLabels: labels,
    };
  }, [monthOffset]);

  const timelineLayout = useMemo(
    () =>
      computePublishedTimelineBars({
        plans,
        windowStartIso,
        windowEndIso,
        todayIso,
      }),
    [plans, windowStartIso, windowEndIso],
  );

  const publishedPlans = plans.filter((p) => p.status === 'Published');
  const draftPlans = plans.filter((p) => p.status === 'Draft');

  const firstName = useMemo(() => {
    const tokens = userName
      .split('(')[0]
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const honorifics = new Set(['dr.', 'dr', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms', 'prof.', 'prof', 'shri', 'smt.']);
    const nonHonorific = tokens.find((t) => !honorifics.has(t.toLowerCase()));
    return nonHonorific || tokens[0] || userName;
  }, [userName]);

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    onCreatePlan(newPlanName.trim());
    setNewPlanName('');
    setShowNewModal(false);
  }

  return (
    <div className="space-y-5" data-testid="timetable-master-hub">
      {/* Greeting + Needs You + My Leave (Reference Screenshot 064916) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Good morning, {firstName}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {schoolName} · Saturday 21 November
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 self-start sm:self-center">
          <Shield className="h-3.5 w-3.5" />
          {userRoleLabel}
        </span>
      </div>

      {/* Needs You Action Card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-slate-900">Needs You</h3>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-50 border border-amber-200 px-2 text-xs font-bold text-amber-800 tabular-nums">
            {pendingLeaves.length}
          </span>
        </div>
        <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {pendingLeaves.length > 0 ? (
            <>
              <div className="flex items-start gap-2.5">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {pendingLeaves.length} leave request{pendingLeaves.length > 1 ? 's' : ''} to decide
                  </p>
                  <p className="text-xs text-slate-600">
                    {pendingLeaves
                      .slice(0, 2)
                      .map((l) => `${l.teacherName} (${l.startDate})`)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenLeaveApprovals}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 self-start sm:self-center"
              >
                Review
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-600">
              All leave requests are reviewed and substitute cover plans are up to date.
            </p>
          )}
        </div>
      </div>

      {/* My Leave Compact Strip */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span className="font-bold text-slate-900">My Leave</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            {myUpcomingLeaves.length > 0
              ? `${myUpcomingLeaves.length} upcoming request (${myUpcomingLeaves[0].startDate} · ${myUpcomingLeaves[0].status})`
              : 'No leave coming up'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenLeaveApprovals}
            className="text-xs font-semibold text-slate-700 hover:text-blue-900"
          >
            See All
          </button>
          <button
            type="button"
            onClick={onOpenApplyLeave}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Apply for Leave
          </button>
        </div>
      </div>

      {/* Timetables Header + New Timetable Button (Reference Screenshot 064613) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Timetables</h2>
          <p className="text-xs text-slate-600">Manage all timetables for your institution</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          New Timetable
        </button>
      </div>

      {/* Shared Organisation Data 4-Tile Strip */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-indigo-100">
          <p className="text-xs font-bold text-slate-900">
            Your organisation data is shared across all timetables
          </p>
          <p className="text-xs text-indigo-700 mt-0.5">
            Staff, classes, subjects and rooms are defined once and reused in every timetable.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-indigo-100 bg-white/70">
          <button
            type="button"
            onClick={onOpenStaffDirectory}
            className="flex items-center justify-between px-4 py-3.5 text-left hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Staff <span className="font-mono text-slate-500 ml-1">{staffCount}</span>
                </p>
                <p className="text-[11px] text-slate-500">Teachers and admin members</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => plans[0] && onOpenGridEditor(plans[0].id)}
            className="flex items-center justify-between px-4 py-3.5 text-left hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Classes <span className="font-mono text-slate-500 ml-1">{classCount}</span>
                </p>
                <p className="text-[11px] text-slate-500">Grades, divisions &amp; sections</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => plans[0] && onOpenGridEditor(plans[0].id)}
            className="flex items-center justify-between px-4 py-3.5 text-left hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-blue-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Subjects <span className="font-mono text-slate-500 ml-1">{subjectCount}</span>
                </p>
                <p className="text-[11px] text-slate-500">Subjects, courses &amp; activities</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => plans[0] && onOpenGridEditor(plans[0].id)}
            className="flex items-center justify-between px-4 py-3.5 text-left hover:bg-indigo-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Rooms <span className="font-mono text-slate-500 ml-1">{roomCount}</span>
                </p>
                <p className="text-[11px] text-slate-500">Classrooms, labs &amp; other spaces</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Published Timeline Horizontal Gantt (Reference Screenshot 064630) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="font-bold text-slate-900">Published Timeline</span>
            <span className="text-slate-500">
              {publishedPlans.length} running today · at most 1 at once
            </span>
          </div>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m - 1)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset(0)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setMonthOffset((m) => m + 1)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Forward
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm font-bold text-slate-900">{rangeLabel}</p>

        <div className="relative pt-7 pb-3">
          {/* Month Grid Columns */}
          <div className="grid grid-cols-4 border-b border-slate-200 pb-2 text-[11px] font-medium text-slate-500">
            {monthLabels.map((lbl) => (
              <div key={lbl} className="border-l border-slate-200 pl-2">
                {lbl}
              </div>
            ))}
          </div>

          {/* Today Red Vertical Indicator */}
          {timelineLayout.todayMarkerPct !== null && (
            <div
              className="absolute top-1 bottom-0 z-10 pointer-events-none"
              style={{ left: `${timelineLayout.todayMarkerPct}%` }}
            >
              <span className="-translate-x-1/2 inline-block rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Today
              </span>
              <div className="mx-auto w-0.5 h-12 bg-rose-500" />
            </div>
          )}

          {/* Published Plan Bars */}
          <div className="relative h-10 mt-2 rounded-lg bg-slate-50">
            {timelineLayout.bars
              .filter((b) => b.visible)
              .map((bar) => (
                <button
                  key={bar.plan.id}
                  type="button"
                  onClick={() => onOpenGridEditor(bar.plan.id)}
                  style={{ left: `${bar.leftPct}%`, width: `${bar.widthPct}%` }}
                  className="absolute top-1.5 h-7 rounded-md bg-indigo-600 hover:bg-indigo-700 px-3 text-left text-xs font-semibold text-white truncate transition-colors"
                  title={`${bar.plan.name} (${bar.plan.effectiveFrom} to ${bar.plan.effectiveTo})`}
                >
                  {bar.plan.name} · {bar.plan.versionLabel}
                </button>
              ))}
            {timelineLayout.bars.filter((b) => b.visible).length === 0 && (
              <p className="text-xs text-slate-400 px-3 py-2">
                No published timetable falls in this 4-month window.
              </p>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Point at a timetable to see its dates. Select a bar to open the grid editor.
          </p>
        </div>
      </div>

      {/* Published & Drafts Cards (Reference Screenshot 064630) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        {/* Published Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Globe className="h-3.5 w-3.5" />
            Published <span className="font-mono text-slate-500">{publishedPlans.length}</span>
          </div>
          {publishedPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition-colors"
            >
              <button
                type="button"
                onClick={() => onOpenGridEditor(plan.id)}
                className="text-left space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-slate-900 hover:text-indigo-700">
                    {plan.name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    Published
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Updated {plan.updatedAt} · Effective from {plan.effectiveFrom}
                </p>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTogglePublishPlan(plan.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Unpublish
                </button>
                <button
                  type="button"
                  onClick={() => onSharePlan(plan)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => onOpenGridEditor(plan.id)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open Grid
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Drafts Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Drafts <span className="font-mono">{draftPlans.length}</span>
          </div>
          {draftPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <button
                type="button"
                onClick={() => onOpenGridEditor(plan.id)}
                className="text-left space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-indigo-700 hover:underline">
                    {plan.name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    <Clock className="h-3 w-3" />
                    Draft
                  </span>
                </div>
                <p className="text-xs text-slate-500">Updated {plan.updatedAt}</p>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenGridEditor(plan.id)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Edit &amp; Generate
                </button>
                <button
                  type="button"
                  onClick={() => onTogglePublishPlan(plan.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Publish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Timetable Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create New Timetable"
        >
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="font-display text-lg font-bold text-slate-900">
              Create New Timetable Draft
            </h3>
            <div className="space-y-1.5">
              <label htmlFor="new-tt-name" className="text-xs font-semibold text-slate-700">
                Timetable Name
              </label>
              <input
                id="new-tt-name"
                type="text"
                required
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="e.g. Winter Schedule · Dec 2026"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Create Draft
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
