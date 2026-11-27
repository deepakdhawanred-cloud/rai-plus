import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Info,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import {
  ALERT_CATEGORY_LABELS,
  ALERT_SEVERITY_LABELS,
  type AlertCategory,
  type AlertCenterCounts,
  type AlertSeverity,
  type UnifiedWorkspaceAlert,
  filterUnifiedAlerts,
} from '../utils/alertsCenterEngine';
import { apiRequest } from '../utils/api';
import { pushToast } from './ToastProvider';

interface AlertsCenterPanelProps {
  data: WorkspaceData;
  token: string;
  alerts: UnifiedWorkspaceAlert[];
  counts: AlertCenterCounts;
  onRefresh: () => Promise<void>;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenStudent: (studentId: string) => void;
  onLocalAcknowledge: (alertIds: string[]) => void;
  onLocalReopen: (alertId: string) => void;
}

const ORDERED_CATEGORIES: AlertCategory[] = [
  'attendance',
  'finance',
  'academics',
  'campus_gate',
  'complaints',
  'staff_payroll',
];

export const AlertsCenterPanel: React.FC<AlertsCenterPanelProps> = ({
  data,
  token,
  alerts,
  counts,
  onRefresh,
  onNavigateTab,
  onOpenStudent,
  onLocalAcknowledge,
  onLocalReopen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'all' | 'resolved'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const visibleCategories = useMemo(() => {
    const presentInAlerts = new Set(alerts.map((a) => a.category));
    return ORDERED_CATEGORIES.filter((cat) => presentInAlerts.has(cat));
  }, [alerts]);

  const filteredAlerts = useMemo(
    () =>
      filterUnifiedAlerts(alerts, {
        query: searchQuery,
        category: selectedCategory,
        severity: selectedSeverity,
        status: statusFilter,
      }),
    [alerts, searchQuery, selectedCategory, selectedSeverity, statusFilter],
  );

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSeverity !== 'all' ||
    statusFilter !== 'active' ||
    searchQuery.trim().length > 0;

  function resetFilters() {
    setSelectedCategory('all');
    setSelectedSeverity('all');
    setStatusFilter('active');
    setSearchQuery('');
  }

  async function acknowledgeSingleBackend(alert: UnifiedWorkspaceAlert): Promise<boolean> {
    if (!alert.nativeRecordId) return false;
    const encodedId = encodeURIComponent(alert.nativeRecordId);
    if (alert.acknowledgeSource === 'attendance_notif') {
      await apiRequest(`/api/attendance/notifications/${encodedId}/acknowledge`, { method: 'POST' }, token);
      return true;
    }
    if (alert.acknowledgeSource === 'notebook_notif') {
      await apiRequest(`/api/notebooks/notifications/${encodedId}/acknowledge`, { method: 'POST' }, token);
      return true;
    }
    if (alert.acknowledgeSource === 'absence_risk') {
      await apiRequest(`/api/yearly-plans/alerts/${encodedId}/acknowledge`, { method: 'POST' }, token);
      return true;
    }
    if (alert.acknowledgeSource === 'defaulter_log') {
      await apiRequest(
        `/api/finance/defaulter-notifications/${encodedId}/acknowledge`,
        { method: 'POST' },
        token,
      );
      return true;
    }
    return false;
  }

  async function handleAcknowledge(alert: UnifiedWorkspaceAlert) {
    setBusyId(alert.id);
    try {
      if (alert.acknowledgeSource !== 'local' && alert.nativeRecordId) {
        try {
          await acknowledgeSingleBackend(alert);
          await onRefresh();
          pushToast('Alert acknowledged and synced.', 'success');
          return;
        } catch {
          // If role cannot call the native endpoint (e.g. observer role), persist locally cleanly
        }
      }
      onLocalAcknowledge([alert.id]);
      pushToast('Alert marked as acknowledged.', 'success');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAcknowledgeAllVisible() {
    const activeVisible = filteredAlerts.filter((a) => !a.isResolved);
    if (activeVisible.length === 0) return;
    setBulkBusy(true);
    try {
      const localIds: string[] = [];
      let syncedCount = 0;
      for (const alert of activeVisible) {
        if (alert.acknowledgeSource !== 'local' && alert.nativeRecordId) {
          try {
            await acknowledgeSingleBackend(alert);
            syncedCount += 1;
            continue;
          } catch {
            // Fall back to local acknowledgement
          }
        }
        localIds.push(alert.id);
      }
      if (localIds.length > 0) {
        onLocalAcknowledge(localIds);
      }
      if (syncedCount > 0) {
        await onRefresh();
      }
      pushToast(
        `Acknowledged ${activeVisible.length} alert${activeVisible.length === 1 ? '' : 's'}.`,
        'success',
      );
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleManualSync() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  function handleOpenAlertTarget(alert: UnifiedWorkspaceAlert) {
    if (alert.targetTab === 'students' && alert.studentId) {
      onOpenStudent(alert.studentId);
      return;
    }
    onNavigateTab(alert.targetTab);
  }

  const activeVisibleCount = filteredAlerts.filter((a) => !a.isResolved).length;

  return (
    <div className="space-y-6" data-testid="alerts-center-panel">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Alerts Center
          </h1>
          <p className="text-sm text-slate-600">
            Unified, role-scoped triage queue across {data.activeSchool.name} ·{' '}
            <span className="font-mono tabular-nums text-slate-700">
              {counts.active} active
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleManualSync()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {activeVisibleCount > 0 && (
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void handleAcknowledgeAllVisible()}
              data-testid="alerts-acknowledge-all-btn"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[#D6B66D]" />
              {bulkBusy
                ? 'Updating...'
                : `Acknowledge Visible (${activeVisibleCount})`}
            </button>
          )}
        </div>
      </div>

      {/* 4-Column KPI Summary Strip (Single Elevation, Hairline Dividers) */}
      <section
        aria-label="Alerts summary metrics"
        className="rounded-xl border border-slate-200 bg-white grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden"
      >
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">Active Queue</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {counts.active}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Needs review or action</p>
        </div>

        <div className="px-5 py-4 border-l border-slate-200 lg:border-l-0">
          <p className="text-xs font-medium text-slate-500">Critical &amp; Urgent</p>
          <p
            className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
              counts.critical > 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {counts.critical}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Immediate attention</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-medium text-slate-500">Action Needed</p>
          <p
            className={`mt-1 font-mono text-2xl font-bold tabular-nums ${
              counts.warning > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {counts.warning}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Follow-ups &amp; approvals</p>
        </div>

        <div className="px-5 py-4 border-l border-slate-200 lg:border-l-0">
          <p className="text-xs font-medium text-slate-500">Acknowledged</p>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
            {counts.resolved}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">Cleared in this scope</p>
        </div>
      </section>

      {/* Main Unified Alerts Surface */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Category Underline Navigation Bar */}
        <div className="border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'border-[#142B46] text-[#142B46]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>All Categories</span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
              ({counts.active})
            </span>
          </button>

          {visibleCategories.map((category) => {
            const catActiveCount = counts.byCategory[category];
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#142B46] text-[#142B46]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>{ALERT_CATEGORY_LABELS[category]}</span>
                {catActiveCount > 0 && (
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      isActive ? 'text-[#937024] font-bold' : 'text-slate-400'
                    }`}
                  >
                    ({catActiveCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Controls Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="search"
              aria-label="Search alerts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, class, fee ledger, complaint, or keyword..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#142B46] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear alert search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by severity"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity | 'all')}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-[#142B46] focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Action Needed</option>
              <option value="info">Informational</option>
            </select>

            <div
              role="group"
              aria-label="Alert status filter"
              className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs"
            >
              {(
                [
                  { id: 'active', label: 'Active' },
                  { id: 'all', label: 'All' },
                  { id: 'resolved', label: 'Acknowledged' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                    statusFilter === opt.id
                      ? 'bg-[#142B46] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Alert Rows or Empty State */}
        {filteredAlerts.length === 0 ? (
          <div className="px-6 py-14 text-center space-y-2.5">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
              {counts.active === 0 && !hasActiveFilters ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              ) : (
                <Bell className="h-5 w-5 text-slate-400" />
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {counts.active === 0 && !hasActiveFilters
                ? 'All clear — zero pending alerts'
                : 'No alerts match the current filters'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {counts.active === 0 && !hasActiveFilters
                ? 'Attendance risks, fee reminders, notebook notifications, and operational escalations will appear here as soon as they require attention.'
                : 'Try switching status to All or clearing your category and search filters.'}
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map((alert) => {
              const severityTextClass =
                alert.severity === 'critical'
                  ? 'text-red-700'
                  : alert.severity === 'warning'
                    ? 'text-amber-800'
                    : 'text-[#142B46]';
              const SeverityIcon =
                alert.severity === 'critical'
                  ? ShieldAlert
                  : alert.severity === 'warning'
                    ? AlertTriangle
                    : Info;

              return (
                <article
                  key={alert.id}
                  data-testid={`alert-row-${alert.id}`}
                  className={`px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-start justify-between gap-4 transition-colors ${
                    alert.isResolved ? 'bg-slate-50/50 opacity-80' : 'bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Crisp Unboxed Metadata Row (Zero Static Pills) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${severityTextClass}`}
                      >
                        <SeverityIcon className="h-3.5 w-3.5 shrink-0" />
                        {ALERT_SEVERITY_LABELS[alert.severity]}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="font-medium text-slate-700">
                        {ALERT_CATEGORY_LABELS[alert.category]}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="text-slate-600 truncate">{alert.entityLabel}</span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {alert.dateLabel}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                      {alert.title}
                    </h2>

                    <p className="text-xs text-slate-600 leading-relaxed">{alert.summary}</p>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span>
                        <span className="font-semibold text-slate-700">Next step:</span>{' '}
                        {alert.recommendedAction}
                      </span>
                      {alert.metaParts.length > 0 && (
                        <>
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                            {alert.metaParts.join(' · ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenAlertTarget(alert)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {alert.isResolved ? (
                      <div className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          <Check className="h-3.5 w-3.5" />
                          Acknowledged
                        </span>
                        {alert.acknowledgeSource === 'local' && (
                          <button
                            type="button"
                            onClick={() => onLocalReopen(alert.id)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-900 underline underline-offset-2 whitespace-nowrap"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === alert.id}
                        onClick={() => void handleAcknowledge(alert)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5 text-[#D6B66D]" />
                        {busyId === alert.id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
