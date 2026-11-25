import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import { apiRequest } from '../utils/api';

interface LeadershipDecisionInboxProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onNavigate: (tab: WorkspaceTab) => void;
  onApproveStudentReport: (studentId: string) => Promise<void>;
}

interface DecisionRow {
  id: string;
  title: string;
  detail: string;
  countLabel: string;
  urgency: 'high' | 'medium';
  primaryLabel: string;
  onPrimary: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export const LeadershipDecisionInbox: React.FC<LeadershipDecisionInboxProps> = ({
  data,
  token,
  onRefresh,
  onNavigate,
  onApproveStudentReport,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingLeaves = useMemo(
    () => (data.teacherLeaveRequests || []).filter((l) => l.status === 'Pending'),
    [data.teacherLeaveRequests],
  );
  const unpublishedCovers = useMemo(
    () =>
      (data.substitutionAssignments || []).filter(
        (c) => c.publishStatus !== 'published' && Boolean(c.substituteTeacherName),
      ),
    [data.substitutionAssignments],
  );
  const pendingReports = useMemo(
    () => data.students.filter((s) => s.reportApprovalStatus !== 'Approved'),
    [data.students],
  );
  const pendingFinanceApprovals = useMemo(() => {
    const entries = (data.accountingEntries || []).filter((e) => e.status === 'submitted');
    const payrolls = (data.payrollRegisters || []).filter((p) => p.status === 'submitted');
    return entries.length + payrolls.length;
  }, [data.accountingEntries, data.payrollRegisters]);
  const pendingClinicalReports = useMemo(
    () =>
      (data.clinicalCare?.clinicalReports || []).filter(
        (r) => r.status === 'Draft',
      ),
    [data.clinicalCare?.clinicalReports],
  );
  const unreviewedSiblingAlerts = useMemo(
    () => (data.siblingGroups || []).filter((g) => g.status === 'Alert'),
    [data.siblingGroups],
  );

  async function handlePublishAllCovers() {
    setBusyId('publish-covers');
    setError(null);
    setNotice(null);
    try {
      await apiRequest('/api/timetable/publish-covers', { method: 'POST', body: '{}' }, token);
      await onRefresh();
      setNotice('Published all assigned substitute covers and notified substitute teachers.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to publish covers.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleQuickApproveFirstReport() {
    const next = pendingReports[0];
    if (!next) return;
    setBusyId('approve-report');
    setError(null);
    setNotice(null);
    try {
      await onApproveStudentReport(next.id);
      setNotice(`Approved 360° report for ${next.name} (Class ${next.classSection}).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to approve student report.');
    } finally {
      setBusyId(null);
    }
  }

  const rows: DecisionRow[] = [];

  if (pendingLeaves.length > 0) {
    const first = pendingLeaves[0];
    rows.push({
      id: 'leaves',
      title: `${pendingLeaves.length} teacher leave request${pendingLeaves.length === 1 ? '' : 's'} to decide`,
      detail: `${first.teacherName} (${first.leaveType} · ${first.startDate})${
        pendingLeaves.length > 1 ? ` + ${pendingLeaves.length - 1} more` : ''
      }`,
      countLabel: `${pendingLeaves.length} pending`,
      urgency: 'high',
      primaryLabel: 'Review Leaves',
      onPrimary: () => onNavigate('timetable_leave'),
    });
  }

  if (unpublishedCovers.length > 0) {
    rows.push({
      id: 'publish-covers',
      title: `${unpublishedCovers.length} adjusted substitute cover${
        unpublishedCovers.length === 1 ? '' : 's'
      } awaiting publish`,
      detail: unpublishedCovers
        .slice(0, 2)
        .map((c) => `P${c.period} ${c.classSection} → ${c.substituteTeacherName}`)
        .join(' · '),
      countLabel: `${unpublishedCovers.length} draft`,
      urgency: 'high',
      primaryLabel: busyId === 'publish-covers' ? 'Publishing...' : 'Publish All Now',
      onPrimary: handlePublishAllCovers,
      secondaryLabel: 'Inspect',
      onSecondary: () => onNavigate('timetable_leave'),
    });
  }

  if (pendingFinanceApprovals > 0) {
    rows.push({
      id: 'finance-approvals',
      title: `${pendingFinanceApprovals} accounting or payroll item${
        pendingFinanceApprovals === 1 ? '' : 's'
      } awaiting approval`,
      detail: 'Submitted by Accounts Department under segregation-of-duties control',
      countLabel: `${pendingFinanceApprovals} pending`,
      urgency: 'high',
      primaryLabel: 'Open Finance 360°',
      onPrimary: () => onNavigate('finance'),
    });
  }

  if (pendingClinicalReports.length > 0) {
    rows.push({
      id: 'clinical-reports',
      title: `${pendingClinicalReports.length} clinical care report${
        pendingClinicalReports.length === 1 ? '' : 's'
      } pending review`,
      detail: 'Requires qualified professional / institutional governance sign-off',
      countLabel: `${pendingClinicalReports.length} review`,
      urgency: 'medium',
      primaryLabel: 'Open Clinical Care',
      onPrimary: () => onNavigate('clinical_care'),
    });
  }

  if (pendingReports.length > 0) {
    const first = pendingReports[0];
    rows.push({
      id: 'approve-report',
      title: `${pendingReports.length} Student 360° report${
        pendingReports.length === 1 ? '' : 's'
      } pending sign-off`,
      detail: `Next in queue: ${first.name} (Class ${first.classSection})`,
      countLabel: `${pendingReports.length} draft`,
      urgency: 'medium',
      primaryLabel: busyId === 'approve-report' ? 'Approving...' : 'Approve Next',
      onPrimary: handleQuickApproveFirstReport,
      secondaryLabel: 'Open Directory',
      onSecondary: () => onNavigate('students'),
    });
  }

  if (unreviewedSiblingAlerts.length > 0) {
    rows.push({
      id: 'sibling-alerts',
      title: `${unreviewedSiblingAlerts.length} unreviewed sibling fee group alert${
        unreviewedSiblingAlerts.length === 1 ? '' : 's'
      }`,
      detail: 'Confirm linked family fee accounts and concession alignment',
      countLabel: `${unreviewedSiblingAlerts.length} alert`,
      urgency: 'medium',
      primaryLabel: 'Review Families',
      onPrimary: () => onNavigate('families'),
    });
  }

  return (
    <section
      data-testid="leadership-decision-inbox"
      aria-label="Needs Your Decision"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-col gap-1 px-5 py-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardCheck className="h-4 w-4 text-blue-900 shrink-0" />
            Needs Your Decision
          </h2>
          <p className="text-xs text-slate-500">
            Consolidated morning approval queue across leaves, covers, finance, reports, and clinical governance.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums whitespace-nowrap shrink-0">
          {rows.length} queue{rows.length === 1 ? '' : 's'} active
        </span>
      </div>

      {notice && (
        <div className="mx-5 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="mx-5 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-800">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="px-5 py-4 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          All morning approvals are up to date for {data.activeSchool.name}.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/70 transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      row.urgency === 'high' ? 'bg-amber-500' : 'bg-blue-900'
                    }`}
                  />
                  <span className="text-sm font-semibold text-slate-900">{row.title}</span>
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    · {row.countLabel}
                  </span>
                </div>
                <p className="mt-0.5 pl-4 text-xs text-slate-600 truncate">{row.detail}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
                {row.secondaryLabel && row.onSecondary && (
                  <button
                    type="button"
                    onClick={row.onSecondary}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    {row.secondaryLabel}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void row.onPrimary()}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {row.primaryLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
