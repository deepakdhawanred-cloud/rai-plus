import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCircle2, Mail, MessageSquare, Send } from 'lucide-react';
import type {
  DefaulterAlertChannel,
  DefaulterAlertTierScope,
  FeeDefaulterNotificationConfig,
  FeeDefaulterNotificationRecord,
  FeeMonthKey,
  NotificationGatewayStatus,
  StudentRecord,
  UserAccount,
} from '../types';
import type { RankedFeeDefaulter } from '../utils/financialDashboardEngine';
import {
  DEFAULT_DEFAULTER_ALERT_TEMPLATE,
  createDefaultDefaulterAlertConfig,
  renderDefaulterAlertMessage,
  selectEligibleDefaultersForAlert,
} from '../utils/defaulterNotificationEngine';
import { apiRequest } from '../utils/api';
import { pushToast } from './ToastProvider';

const INR = new Intl.NumberFormat('en-IN');

function formatInr(amount: number): string {
  return `₹${INR.format(Math.round(amount || 0))}`;
}

function formatDateTime(iso?: string): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusTextClass(status: FeeDefaulterNotificationRecord['status']): string {
  switch (status) {
    case 'Sent':
    case 'Acknowledged':
      return 'text-emerald-700';
    case 'Portal Queued':
      return 'text-blue-900';
    case 'Partial':
      return 'text-amber-700';
    default:
      return 'text-rose-700';
  }
}

interface DefaulterNotificationCenterProps {
  schoolId: string;
  schoolName: string;
  activeMonth: FeeMonthKey;
  classFilter: string;
  rankedDefaulters: RankedFeeDefaulter[];
  students: StudentRecord[];
  schoolUsers?: UserAccount[];
  config?: FeeDefaulterNotificationConfig;
  logs?: FeeDefaulterNotificationRecord[];
  gatewayStatus?: NotificationGatewayStatus;
  canDispatch: boolean;
  token: string;
  onRefresh: () => Promise<void>;
}

export const DefaulterNotificationCenter: React.FC<DefaulterNotificationCenterProps> = ({
  schoolId,
  schoolName,
  activeMonth,
  classFilter,
  rankedDefaulters,
  students,
  schoolUsers = [],
  config,
  logs = [],
  gatewayStatus,
  canDispatch,
  token,
  onRefresh,
}) => {
  const effectiveServerConfig = useMemo(
    () => config ?? createDefaultDefaulterAlertConfig(schoolId),
    [config, schoolId],
  );

  const [autoEnabled, setAutoEnabled] = useState(effectiveServerConfig.autoEnabled);
  const [tierScope, setTierScope] = useState<DefaulterAlertTierScope>(
    effectiveServerConfig.tierScope,
  );
  const [channel, setChannel] = useState<DefaulterAlertChannel>(effectiveServerConfig.channel);
  const [minPriorityScore, setMinPriorityScore] = useState<number>(
    effectiveServerConfig.minPriorityScore,
  );
  const [minPercentLeft, setMinPercentLeft] = useState<number>(
    effectiveServerConfig.minPercentLeft,
  );
  const [cooldownDays, setCooldownDays] = useState<number>(effectiveServerConfig.cooldownDays);
  const [scheduleLabel, setScheduleLabel] = useState<string>(effectiveServerConfig.scheduleLabel);
  const [messageTemplate, setMessageTemplate] = useState<string>(
    effectiveServerConfig.messageTemplate || DEFAULT_DEFAULTER_ALERT_TEMPLATE,
  );
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [dispatchingBatch, setDispatchingBatch] = useState(false);
  const [ackBusyId, setAckBusyId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'Sent' | 'Portal Queued' | 'Acknowledged'>(
    'ALL',
  );

  useEffect(() => {
    setAutoEnabled(effectiveServerConfig.autoEnabled);
    setTierScope(effectiveServerConfig.tierScope);
    setChannel(effectiveServerConfig.channel);
    setMinPriorityScore(effectiveServerConfig.minPriorityScore);
    setMinPercentLeft(effectiveServerConfig.minPercentLeft);
    setCooldownDays(effectiveServerConfig.cooldownDays);
    setScheduleLabel(effectiveServerConfig.scheduleLabel);
    setMessageTemplate(effectiveServerConfig.messageTemplate || DEFAULT_DEFAULTER_ALERT_TEMPLATE);
  }, [effectiveServerConfig]);

  const draftConfig = useMemo<FeeDefaulterNotificationConfig>(
    () => ({
      ...effectiveServerConfig,
      autoEnabled,
      tierScope,
      channel,
      minPriorityScore,
      minPercentLeft,
      cooldownDays,
      scheduleLabel,
      messageTemplate,
    }),
    [
      effectiveServerConfig,
      autoEnabled,
      tierScope,
      channel,
      minPriorityScore,
      minPercentLeft,
      cooldownDays,
      scheduleLabel,
      messageTemplate,
    ],
  );

  const selectionPreview = useMemo(
    () =>
      selectEligibleDefaultersForAlert({
        rankedDefaulters,
        config: draftConfig,
        activeMonth,
        existingLogs: logs,
        students,
        users: schoolUsers,
        classScope: classFilter,
      }),
    [rankedDefaulters, draftConfig, activeMonth, logs, students, schoolUsers, classFilter],
  );

  const sampleCandidate =
    selectionPreview.eligibleReady[0] || selectionPreview.skippedCooldown[0] || null;

  const liveMessagePreview = useMemo(() => {
    if (!sampleCandidate) {
      return renderDefaulterAlertMessage(messageTemplate, {
        guardianName: 'Rajesh Sharma',
        studentName: 'Aarav Sharma',
        admissionNo: 'VIS7001',
        className: 'Class 6',
        schoolName,
        activeMonth,
        overdueTillMonthInr: 14500,
        balanceDueInr: 26500,
        percentLeft: 78,
        paymentNature: 'Stalled Payer',
      });
    }
    const acc = sampleCandidate.account;
    return renderDefaulterAlertMessage(messageTemplate, {
      guardianName: acc.fatherName,
      studentName: acc.studentName,
      admissionNo: acc.admissionNo,
      className: acc.className,
      schoolName,
      activeMonth,
      overdueTillMonthInr: acc.defaulterMetrics.overdueTillCurrentMonthInr,
      balanceDueInr: acc.balanceFeesInr,
      percentLeft: acc.defaulterMetrics.percentLeft,
      paymentNature: sampleCandidate.paymentNature,
    });
  }, [sampleCandidate, messageTemplate, schoolName, activeMonth]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return logs;
    return logs.filter((l) => l.status === logFilter);
  }, [logs, logFilter]);

  const acknowledgedCount = useMemo(
    () => logs.filter((l) => l.status === 'Acknowledged').length,
    [logs],
  );

  async function handleSavePolicy() {
    setSavingPolicy(true);
    try {
      await apiRequest(
        '/api/finance/defaulter-notifications/config',
        {
          method: 'PUT',
          body: JSON.stringify({
            autoEnabled,
            tierScope,
            channel,
            minPriorityScore,
            minPercentLeft,
            cooldownDays,
            scheduleLabel,
            messageTemplate,
          }),
        },
        token,
      );
      await onRefresh();
      pushToast(
        `Automated alert rule saved (${autoEnabled ? 'Active' : 'Paused'} · ${channel} · ${tierScope === 'Critical' ? 'Critical Only' : 'Critical & High'}).`,
        'success',
        { title: 'Defaulter Alert Policy Updated' },
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to save alert policy.',
        'error',
        { title: 'Policy Save Failed' },
      );
    } finally {
      setSavingPolicy(false);
    }
  }

  async function handleRunAutomatedBatch() {
    if (selectionPreview.eligibleReady.length === 0) {
      pushToast(
        `No high-priority defaulters outside the ${cooldownDays}-day cooldown window for this filter.`,
        'info',
        { title: 'All Eligible Parents Recently Notified' },
      );
      return;
    }
    setDispatchingBatch(true);
    try {
      // Save policy changes first if user adjusted controls before running
      await apiRequest(
        '/api/finance/defaulter-notifications/config',
        {
          method: 'PUT',
          body: JSON.stringify({
            autoEnabled,
            tierScope,
            channel,
            minPriorityScore,
            minPercentLeft,
            cooldownDays,
            scheduleLabel,
            messageTemplate,
          }),
        },
        token,
      );

      const res = await apiRequest<{
        dispatchedCount: number;
        skippedCooldownCount: number;
      }>(
        '/api/finance/defaulter-notifications/dispatch',
        {
          method: 'POST',
          body: JSON.stringify({
            mode: 'batch',
            classScope: classFilter,
            channel,
          }),
        },
        token,
      );

      await onRefresh();
      pushToast(
        `Dispatched ${res.dispatchedCount} high-priority parent ${channel} alerts (${res.skippedCooldownCount} skipped in cooldown).`,
        'success',
        { title: 'Automated Defaulter Alerts Dispatched' },
      );
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to dispatch defaulter alerts.',
        'error',
        { title: 'Alert Dispatch Failed' },
      );
    } finally {
      setDispatchingBatch(false);
    }
  }

  async function handleAcknowledgeLog(recordId: string) {
    setAckBusyId(recordId);
    try {
      await apiRequest(
        `/api/finance/defaulter-notifications/${recordId}/acknowledge`,
        { method: 'PATCH' },
        token,
      );
      await onRefresh();
      pushToast('Fee alert marked as acknowledged.', 'success', {
        title: 'Alert Acknowledged',
      });
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to acknowledge alert.',
        'error',
      );
    } finally {
      setAckBusyId(null);
    }
  }

  return (
    <section
      data-testid="defaulter-notification-center"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className={autoEnabled ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>
              {autoEnabled ? 'Automated Alerts Active' : 'Automation Paused'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{scheduleLabel}</span>
            {effectiveServerConfig.lastAutoRunAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Last run: {formatDateTime(effectiveServerConfig.lastAutoRunAt)}
                </span>
              </>
            )}
          </div>
          <h2 className="font-display text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-[#142B46]" />
            Automated Parent Fee Defaulter Alerts (WhatsApp &amp; Email)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically targets high-priority defaulters unpaid through {activeMonth}, applies cooldown deduplication, dispatches WhatsApp/Email alerts, and posts notices directly to the Parent Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1">
            <Mail className="h-3.5 w-3.5 text-slate-500" />
            Email:{' '}
            <strong
              className={
                gatewayStatus?.emailConfigured ? 'text-emerald-700' : 'text-slate-800'
              }
            >
              {gatewayStatus?.emailProvider || 'Parent Portal + Dispatch Queue'}
            </strong>
          </span>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            WhatsApp:{' '}
            <strong
              className={
                gatewayStatus?.whatsappConfigured ? 'text-emerald-700' : 'text-slate-800'
              }
            >
              {gatewayStatus?.whatsappProvider || 'Parent Portal + Dispatch Queue'}
            </strong>
          </span>
        </div>
      </div>

      {/* 4-Metric Eligibility Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50/50">
        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">
            Ready to Notify ({classFilter === 'ALL' ? 'All Classes' : classFilter})
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-rose-700 tabular-nums">
            {selectionPreview.eligibleReady.length}
          </p>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums">
            {selectionPreview.totalMatchingCriteria} total matching rule
          </p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">Skipped (Cooldown Active)</p>
          <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
            {selectionPreview.skippedCooldown.length}
          </p>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums">
            Protected by {cooldownDays}-day gap
          </p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">Alerts Dispatched (Session)</p>
          <p className="mt-1 font-mono text-lg font-bold text-[#142B46] tabular-nums">
            {logs.length}
          </p>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums">
            Audited &amp; synced to Parent Portal
          </p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">Parent Acknowledgements</p>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-700 tabular-nums">
            {acknowledgedCount}
          </p>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums">
            {logs.length > 0
              ? `${Math.round((acknowledgedCount / logs.length) * 100)}% response rate`
              : 'Awaiting responses'}
          </p>
        </div>
      </div>

      {/* Automation Rule Controls */}
      {canDispatch && (
        <div className="border-b border-slate-200 px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Automation Status
              </label>
              <select
                aria-label="Automation status"
                value={autoEnabled ? 'enabled' : 'paused'}
                onChange={(e) => setAutoEnabled(e.target.value === 'enabled')}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
              >
                <option value="enabled">Active (Automated)</option>
                <option value="paused">Paused (Manual Only)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Priority Tier Scope
              </label>
              <select
                aria-label="Priority tier scope"
                value={tierScope}
                onChange={(e) => setTierScope(e.target.value as DefaulterAlertTierScope)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
              >
                <option value="CriticalAndHigh">Critical &amp; High Priority</option>
                <option value="Critical">Critical Risk Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Delivery Channel
              </label>
              <select
                aria-label="Alert delivery channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as DefaulterAlertChannel)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900"
              >
                <option value="Both">WhatsApp + Email (Both)</option>
                <option value="WhatsApp">WhatsApp Only</option>
                <option value="Email">Email Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Min Priority Score
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={minPriorityScore}
                onChange={(e) =>
                  setMinPriorityScore(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Min % Fee Left
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={minPercentLeft}
                onChange={(e) =>
                  setMinPercentLeft(Math.min(100, Math.max(0, Number(e.target.value) || 0)))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Cooldown (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={cooldownDays}
                onChange={(e) =>
                  setCooldownDays(Math.min(90, Math.max(1, Number(e.target.value) || 1)))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label
                  htmlFor="defaulter-alert-template"
                  className="text-[11px] font-semibold text-slate-700"
                >
                  Parent Alert Message Template
                </label>
                <span className="font-mono text-[10px] text-slate-400">
                  Tokens: {'{guardianName}'} {'{studentName}'} {'{overdueAmount}'} {'{balanceAmount}'} {'{percentLeft}'}
                </span>
              </div>
              <textarea
                id="defaulter-alert-template"
                rows={3}
                maxLength={1000}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 leading-relaxed"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">
                  Live Message Preview{' '}
                  {sampleCandidate ? `(${sampleCandidate.account.studentName})` : '(Sample)'}
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {liveMessagePreview.length} chars
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{liveMessagePreview}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              {!gatewayStatus?.emailConfigured && !gatewayStatus?.whatsappConfigured
                ? 'Live WhatsApp & Email delivery uses server environment secrets (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID or TWILIO_WHATSAPP_FROM, plus RESEND_API_KEY). Until configured, every alert is recorded in the school dispatch ledger and delivered immediately to the Parent Portal.'
                : 'Connected live WhatsApp / Email gateways will transmit messages immediately alongside Parent Portal delivery.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={savingPolicy}
                onClick={() => void handleSavePolicy()}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap"
              >
                {savingPolicy ? 'Saving Policy...' : 'Save Alert Policy'}
              </button>
              <button
                type="button"
                data-testid="dispatch-defaulter-alerts-batch-btn"
                disabled={dispatchingBatch || selectionPreview.eligibleReady.length === 0}
                onClick={() => void handleRunAutomatedBatch()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="h-3.5 w-3.5 text-[#D6B66D]" />
                {dispatchingBatch
                  ? 'Dispatching Alerts...'
                  : `Send Automated Batch (${selectionPreview.eligibleReady.length} Parents)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispatched Alerts Log */}
      <div>
        <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/40">
          <h3 className="text-xs font-bold text-slate-800">
            Recent Parent Alert Dispatch Log ({filteredLogs.length})
          </h3>
          <div className="flex items-center gap-2 text-xs">
            {(['ALL', 'Sent', 'Portal Queued', 'Acknowledged'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLogFilter(tab)}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  logFilter === tab
                    ? 'bg-[#142B46] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="px-6 py-6 text-xs text-slate-500">
            No high-priority defaulter alerts dispatched for this filter yet. Click “Send Automated Batch” above or “Send Alert” on any defaulter row.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Sent &amp; Trigger</th>
                  <th className="px-4 py-2.5 font-semibold">Student &amp; Guardian</th>
                  <th className="px-4 py-2.5 font-semibold">Recipient Contacts</th>
                  <th className="px-4 py-2.5 font-semibold">Channel &amp; Status</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Due / Risk</th>
                  <th className="px-5 py-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.slice(0, 20).map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50">
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <p className="font-mono text-slate-900 font-semibold tabular-nums">
                            {formatDateTime(log.sentAt)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {log.triggerType} · {log.triggeredBy}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-slate-900">
                            {log.studentName}{' '}
                            <span className="font-normal text-slate-500">
                              ({log.className} · {log.admissionNo})
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Guardian: {log.guardianName} · {log.paymentNature}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600 tabular-nums">
                          <p>{log.recipientPhone || 'No WhatsApp mobile'}</p>
                          <p className="text-slate-500 truncate max-w-[190px]">
                            {log.recipientEmail || 'No parent email'}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <p className={`font-semibold ${getStatusTextClass(log.status)}`}>
                            {log.status}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {log.deliveryChannels
                              .map((dc) => `${dc.channel}: ${dc.status}`)
                              .join(' · ')}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <p className="font-mono font-semibold text-rose-700 tabular-nums">
                            {formatInr(log.overdueTillMonthInr)} due
                          </p>
                          <p className="font-mono text-[10px] text-slate-500 tabular-nums">
                            {log.percentLeft}% left · {log.riskTier} ({log.defaulterPriorityScore})
                          </p>
                        </td>
                        <td className="px-5 py-2.5 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className="text-[11px] font-semibold text-blue-900 hover:underline"
                          >
                            {isExpanded ? 'Hide Text' : 'Message'}
                          </button>
                          {log.status !== 'Acknowledged' ? (
                            <button
                              type="button"
                              disabled={ackBusyId === log.id}
                              onClick={() => void handleAcknowledgeLog(log.id)}
                              className="text-[11px] font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                            >
                              {ackBusyId === log.id ? 'Saving...' : 'Mark Ack'}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Ack
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={6} className="px-5 py-2.5 text-xs text-slate-700">
                            <p className="font-semibold text-slate-900 mb-0.5">
                              Dispatched Message ({log.activeMonth} Alert):
                            </p>
                            <p className="leading-relaxed">{log.messageBody}</p>
                            {log.acknowledgedAt && (
                              <p className="mt-1 text-[11px] text-emerald-700">
                                Acknowledged by {log.acknowledgedBy} on{' '}
                                {formatDateTime(log.acknowledgedAt)}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
