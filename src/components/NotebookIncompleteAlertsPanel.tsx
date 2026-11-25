import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import type { NotebookIncompleteNotification, UserRole } from '../types';
import { apiRequest } from '../utils/api';
import {
  sortNotebookNotifications,
  summarizeNotebookNotifications,
} from '../utils/notebookNotificationEngine';
import type { ParentLang } from '../utils/parentTranslations';

interface NotebookIncompleteAlertsPanelProps {
  notifications: NotebookIncompleteNotification[];
  viewerRole: UserRole;
  token: string;
  onRefresh: () => Promise<void>;
  parentLang?: ParentLang;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  onOpenStudent?: (studentId: string) => void;
  showWhenEmpty?: boolean;
  compact?: boolean;
}

export const NotebookIncompleteAlertsPanel: React.FC<NotebookIncompleteAlertsPanelProps> = ({
  notifications,
  viewerRole,
  token,
  onRefresh,
  parentLang = 'en',
  title,
  subtitle,
  maxItems = 8,
  onOpenStudent,
  showWhenEmpty = true,
  compact = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PRIOR_CHAPTER' | 'RESOLVED'>('ALL');
  const [ackBusyId, setAckBusyId] = useState<string | null>(null);
  const [ackError, setAckError] = useState<string | null>(null);

  const isStudent = viewerRole === 'student';
  const isParent = viewerRole === 'parent';
  const isStaff = !isStudent && !isParent;

  const sorted = useMemo(
    () => sortNotebookNotifications(notifications),
    [notifications],
  );

  const summary = useMemo(
    () => summarizeNotebookNotifications(sorted, viewerRole),
    [sorted, viewerRole],
  );

  const priorChapterCount = useMemo(
    () =>
      sorted.filter((n) => n.status === 'Active' && n.alertType === 'prior_chapter_backlog')
        .length,
    [sorted],
  );

  const filtered = useMemo(() => {
    const base = sorted.filter((n) => {
      if (statusFilter === 'ACTIVE') return n.status === 'Active';
      if (statusFilter === 'PRIOR_CHAPTER') {
        return n.status === 'Active' && n.alertType === 'prior_chapter_backlog';
      }
      if (statusFilter === 'RESOLVED') return n.status === 'Resolved';
      return true;
    });
    return base.slice(0, maxItems);
  }, [sorted, statusFilter, maxItems]);

  if (!showWhenEmpty && sorted.length === 0) {
    return null;
  }

  async function handleAcknowledge(alertId: string) {
    setAckError(null);
    setAckBusyId(alertId);
    try {
      await apiRequest(
        `/api/notebooks/notifications/${encodeURIComponent(alertId)}/acknowledge`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
    } catch (err) {
      setAckError(
        err instanceof Error ? err.message : 'Unable to acknowledge notebook alert.',
      );
    } finally {
      setAckBusyId(null);
    }
  }

  const defaultTitle = isStudent
    ? 'Incomplete Notebook Alerts'
    : isParent
      ? parentLang === 'hi'
        ? 'अपूर्ण कॉपी अलर्ट (स्वचालित सूचना)'
        : 'Automated Incomplete Notebook Alerts'
      : 'Automated Student & Parent Notebook Alerts';

  const defaultSubtitle = isStudent
    ? 'System-generated alerts triggered automatically whenever a teacher marks your notebook incomplete or unchecked.'
    : isParent
      ? parentLang === 'hi'
        ? 'शिक्षक द्वारा कॉपी अपूर्ण दर्ज करते ही छात्र व अभिभावक को स्वतः भेजी गई सूचनाएँ।'
        : 'Automatically sent to both student and parent whenever a teacher marks a notebook entry incomplete.'
      : 'Automatically dispatched to both Student and Parent portals whenever a notebook check is saved as Incomplete or Not Checked.';

  return (
    <section
      aria-label="Automated Incomplete Notebook Alerts"
      data-testid="notebook-incomplete-alerts-panel"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <BellRing
              className={`h-4 w-4 shrink-0 ${
                summary.activeAlerts > 0 ? 'text-rose-700' : 'text-blue-900'
              }`}
            />
            <span>{title || defaultTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle || defaultSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isStaff && summary.unreadForViewer > 0 && (
            <span
              data-testid="notebook-alerts-unread-count"
              className="font-mono text-xs font-bold text-rose-700 tabular-nums"
            >
              {summary.unreadForViewer} unread
            </span>
          )}
          {isStaff && (
            <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
              {summary.activeAlerts} active · {summary.acknowledgedByParent} parent ack ·{' '}
              {summary.acknowledgedByStudent} student ack
            </span>
          )}
          {sorted.length > 0 && !compact && (
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
              {(
                [
                  { id: 'ALL', label: `All (${summary.totalAlerts})` },
                  { id: 'ACTIVE', label: `Active (${summary.activeAlerts})` },
                  ...(priorChapterCount > 0
                    ? [{ id: 'PRIOR_CHAPTER' as const, label: `Chapter Gaps (${priorChapterCount})` }]
                    : []),
                  { id: 'RESOLVED', label: `Cleared (${summary.resolvedAlerts})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {ackError && (
        <div className="mx-5 mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs text-red-700">
          {ackError}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="px-5 py-5 text-xs text-slate-500">
          {sorted.length === 0
            ? isStudent
              ? 'No incomplete notebook alerts right now. Great job keeping your notebooks complete!'
              : isParent
                ? parentLang === 'hi'
                  ? 'वर्तमान में कोई अपूर्ण कॉपी अलर्ट नहीं है।'
                  : 'No incomplete notebook alerts have been triggered for your child.'
                : 'No automated incomplete notebook alerts logged yet.'
            : 'No notebook alerts match the selected filter.'}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((alert) => {
            const isResolved = alert.status === 'Resolved';
            const viewerAcked = isStudent
              ? alert.acknowledgedByStudent
              : isParent
                ? alert.acknowledgedByParent
                : false;
            const viewerUnread =
              !isResolved &&
              ((isStudent && !alert.readByStudent) || (isParent && !alert.readByParent));

            const bodyText = isStudent
              ? alert.studentMessage
              : isParent && parentLang === 'hi'
                ? alert.messageHi
                : alert.messageEn;

            const isPriorChapterGap = alert.alertType === 'prior_chapter_backlog';

            return (
              <div
                key={alert.id}
                data-testid={`notebook-alert-item-${alert.id}`}
                className={`px-5 py-4 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs ${
                  isPriorChapterGap && !isResolved
                    ? 'bg-amber-50/70'
                    : viewerUnread
                      ? 'bg-rose-50/40'
                      : ''
                }`}
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        Cleared
                      </span>
                    ) : isPriorChapterGap ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                        Prior Chapter Unchecked
                      </span>
                    ) : alert.notebookStatus === 'Not Checked' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        Not Checked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Incomplete Notebook
                      </span>
                    )}

                    <span className="text-slate-300">·</span>

                    {isStaff && onOpenStudent ? (
                      <button
                        type="button"
                        onClick={() => onOpenStudent(alert.studentId)}
                        className="font-semibold text-blue-900 hover:underline"
                      >
                        {alert.studentName} ({alert.classSection})
                      </button>
                    ) : (
                      <span className="font-semibold text-slate-900">
                        {alert.studentName} ({alert.classSection})
                      </span>
                    )}

                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-slate-800">{alert.subject}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono font-semibold text-blue-900">
                      {alert.chapterNo !== '—'
                        ? `${alert.chapterNo} ${alert.chapterName}`
                        : alert.chapterName}
                    </span>
                    {isPriorChapterGap && alert.currentClassChapter && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-semibold text-rose-700">
                          Class started {alert.currentClassChapter.split(':')[0]}
                          {alert.chapterGap ? ` (${alert.chapterGap} ch behind)` : ''}
                        </span>
                      </>
                    )}
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500 tabular-nums">{alert.date}</span>

                    {viewerUnread && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-bold text-rose-700">New Alert</span>
                      </>
                    )}
                  </div>

                  <p className="text-slate-700 leading-relaxed">{bodyText}</p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="font-mono tabular-nums">
                      Auto-triggered by {alert.triggeredBy} ·{' '}
                      {alert.triggeredAt.slice(0, 16).replace('T', ' ')}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <UserCheck className="h-3 w-3 shrink-0" />
                      Student:{' '}
                      <strong
                        className={
                          alert.acknowledgedByStudent ? 'text-emerald-700' : 'text-amber-700'
                        }
                      >
                        {alert.acknowledgedByStudent ? 'Acknowledged' : 'Sent'}
                      </strong>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      Parent ({alert.guardianName}):{' '}
                      <strong
                        className={
                          alert.acknowledgedByParent ? 'text-emerald-700' : 'text-amber-700'
                        }
                      >
                        {alert.acknowledgedByParent ? 'Acknowledged' : 'Sent'}
                      </strong>
                    </span>
                  </div>
                </div>

                {!isStaff && (
                  <div className="shrink-0 self-start md:self-center">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 whitespace-nowrap">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolved by Teacher
                      </span>
                    ) : viewerAcked ? (
                      <span
                        data-testid={`notebook-alert-acked-${alert.id}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isStudent ? 'Acknowledged by Student' : 'Acknowledged by Parent'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={ackBusyId === alert.id}
                        onClick={() => void handleAcknowledge(alert.id)}
                        className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
                      >
                        {ackBusyId === alert.id
                          ? 'Confirming...'
                          : isParent && parentLang === 'hi'
                            ? 'अलर्ट स्वीकार करें'
                            : 'Acknowledge Alert'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
