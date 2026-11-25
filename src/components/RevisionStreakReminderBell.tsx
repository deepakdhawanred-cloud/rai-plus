import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Clock,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  formatRelativeGap,
  type RevisionStreakPrefs,
  type RevisionStreakStatus,
} from '../utils/revisionStreakReminderEngine';

interface RevisionStreakReminderBellProps {
  role: 'student' | 'parent';
  learnerName?: string;
  status: RevisionStreakStatus;
  prefs: RevisionStreakPrefs;
  onStartRevision: (targetTab: 'academics' | 'interactive_learning') => void;
  onSnoozeHours: (hours: number) => void;
  onDismissToday: () => void;
  onResumeReminders: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onChangeThresholdHours: (hours: number) => void;
  onPreviewToast: () => void;
}

export const RevisionStreakReminderBell: React.FC<RevisionStreakReminderBellProps> = ({
  role,
  learnerName,
  status,
  prefs,
  onStartRevision,
  onSnoozeHours,
  onDismissToday,
  onResumeReminders,
  onToggleEnabled,
  onChangeThresholdHours,
  onPreviewToast,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const isSnoozed = Boolean(
    prefs.snoozeUntilIso && !Number.isNaN(Date.parse(prefs.snoozeUntilIso)) && Date.now() < Date.parse(prefs.snoozeUntilIso),
  );
  const isActionNeeded = !status.completedToday;
  const isParent = role === 'parent';

  const statusHeadline = status.completedToday
    ? 'Today’s Revision Done'
    : status.habitState === 'streak_at_risk'
      ? `${status.currentStreakDays}-Day Streak At Risk`
      : status.habitState === 'inactive_return'
        ? 'Revision Overdue'
        : 'Daily Habit Pending';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        data-testid="revision-streak-bell-button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Revision streak: ${status.currentStreakDays} days. ${statusHeadline}`}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
          status.completedToday
            ? 'border-[#3D6349]/35 bg-[#3D6349]/10 text-[#2C4A35] hover:bg-[#3D6349]/15'
            : 'border-[#D6B66D] bg-[#FAF4EC] text-[#142B46] hover:bg-[#F3E6D8]'
        }`}
      >
        <Flame
          className={`h-3.5 w-3.5 shrink-0 ${
            status.completedToday ? 'text-[#3D6349]' : 'text-[#B87A1E]'
          }`}
        />
        <span className="font-mono font-bold tabular-nums">{status.currentStreakDays}d</span>
        {status.completedToday ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-[#3D6349] shrink-0" />
        ) : (
          <span className="hidden sm:inline text-[11px] font-bold text-[#8E5D12]">
            Due
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Revision Streak Reminder Center"
          data-testid="revision-streak-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E5D7C3] bg-white shadow-xl z-50 overflow-hidden"
        >
          {/* Header Strip */}
          <div className="bg-[#142B46] px-4 py-3 text-[#FAF4EC] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D6B66D]/20 text-[#D6B66D]">
                <Flame className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold leading-tight truncate">
                  {isParent && learnerName
                    ? `${learnerName} · Revision Streak`
                    : 'Daily Revision Streak'}
                </p>
                <p className="text-[11px] text-[#A9C5D8] mt-0.5">{statusHeadline}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-lg font-extrabold text-[#D6B66D] leading-none tabular-nums">
                {status.currentStreakDays}d
              </p>
              <p className="text-[10px] text-[#A9C5D8] mt-0.5 uppercase tracking-wide">
                Streak
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3.5 text-xs text-slate-700">
            {/* Activity Timing Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-lg border border-slate-200 bg-[#FAF4EC]/60 px-3 py-2">
                <p className="text-[11px] text-slate-500">Last Revision</p>
                <p className="font-semibold text-[#142B46] mt-0.5 truncate">
                  {status.completedToday
                    ? 'Completed today'
                    : formatRelativeGap(status.hoursSinceLastActivity, status.daysSinceLastActivity)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-[#FAF4EC]/60 px-3 py-2">
                <p className="text-[11px] text-slate-500">Today’s Goal</p>
                <p
                  className={`font-semibold mt-0.5 ${
                    status.completedToday ? 'text-[#3D6349]' : 'text-[#8E5D12]'
                  }`}
                >
                  {status.completedToday ? '1 / 1 Task Done' : '0 / 1 Task Done'}
                </p>
              </div>
            </div>

            {/* Recommended Quick Daily Task */}
            <div className="rounded-lg border border-[#D6B66D]/60 bg-[#FAF4EC] p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#7B5D1C] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    Recommended Daily Task
                  </p>
                  <p className="font-semibold text-[#142B46] mt-1 leading-snug">
                    {status.suggestedTask.title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {status.suggestedTask.subtitle}
                  </p>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#142B46] whitespace-nowrap shrink-0">
                  ~{status.suggestedTask.estimatedMinutes}m
                </span>
              </div>

              <button
                type="button"
                data-testid="streak-popover-start-cta"
                onClick={() => {
                  setOpen(false);
                  onStartRevision(status.suggestedTask.targetTab);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-2 text-xs font-bold text-[#FAF4EC] hover:bg-[#1E3B5C] transition-colors whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5 text-[#D6B66D]" />
                {status.completedToday ? 'Play Bonus Revision Round' : 'Start Revision Now'}
              </button>
            </div>

            {/* Snooze & Reminder Controls */}
            <div className="border-t border-slate-200 pt-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  {prefs.enabled ? (
                    <Bell className="h-3.5 w-3.5 text-[#142B46]" />
                  ) : (
                    <BellOff className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span>Inactivity Toast Reminders</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.enabled}
                  data-testid="streak-reminder-toggle"
                  onClick={() => onToggleEnabled(!prefs.enabled)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap ${
                    prefs.enabled
                      ? 'bg-[#3D6349] text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {prefs.enabled ? 'On' : 'Paused'}
                </button>
              </div>

              {prefs.enabled && (
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                  <label htmlFor="streak-threshold-select" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Remind after absence of</span>
                  </label>
                  <select
                    id="streak-threshold-select"
                    value={prefs.inactivityThresholdHours}
                    onChange={(e) => onChangeThresholdHours(Number(e.target.value))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-[#142B46] focus:border-[#142B46] focus:outline-none"
                  >
                    <option value={12}>12 hours</option>
                    <option value={18}>18 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                  </select>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {isActionNeeded && !isSnoozed ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onSnoozeHours(4);
                        setOpen(false);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      Snooze 4h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDismissToday();
                        setOpen(false);
                      }}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      Remind Tomorrow
                    </button>
                  </div>
                ) : isSnoozed ? (
                  <button
                    type="button"
                    onClick={onResumeReminders}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#142B46] hover:bg-slate-50 whitespace-nowrap"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Resume Reminders
                  </button>
                ) : (
                  <span className="text-[11px] text-[#3D6349] font-medium">
                    Next check-in tomorrow
                  </span>
                )}

                <button
                  type="button"
                  data-testid="streak-preview-toast-button"
                  onClick={() => {
                    setOpen(false);
                    onPreviewToast();
                  }}
                  className="text-[11px] font-semibold text-[#142B46] underline decoration-[#D6B66D] underline-offset-2 hover:text-[#7B5D1C] whitespace-nowrap"
                >
                  Preview Reminder Toast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
