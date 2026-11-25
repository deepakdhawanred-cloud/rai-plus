import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  XCircle,
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import type { StudentRecord, UserAccount } from '../../types';
import type {
  VcipAccessLogEntry,
  VcipProfileReleaseRecord,
  VcipProfileReleaseStatus,
} from '../../types/vcip';
import {
  VCIP_RELEASE_STATUS_META,
  canRoleTransitionVcipStatus,
  isVcipReleaseVisibleToFamily,
} from '../../utils/vcipReleaseGovernanceEngine';

interface Props {
  student: StudentRecord;
  user: UserAccount;
  token: string;
  releaseRecord?: VcipProfileReleaseRecord;
  accessLogs: VcipAccessLogEntry[];
  onRefresh: () => Promise<void>;
}

export const VcipApprovalGovernancePanel: React.FC<Props> = ({
  student,
  user,
  token,
  releaseRecord,
  accessLogs,
  onRefresh,
}) => {
  const isManagement = ['super_admin', 'school_admin', 'principal'].includes(user.role);
  const isCounsellor = user.role === 'counsellor';
  const canWorkflow = isManagement || isCounsellor;
  const isParent = user.role === 'parent';
  const isStudent = user.role === 'student';

  const [sharedObs, setSharedObs] = useState(
    releaseRecord?.sharedCounsellorObservations || '',
  );
  const [internalNote, setInternalNote] = useState(
    releaseRecord?.internalCounsellorNote || '',
  );
  const [exercisesText, setExercisesText] = useState(
    (releaseRecord?.recommendedExercises || []).join('\n'),
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSharedObs(releaseRecord?.sharedCounsellorObservations || '');
    setInternalNote(releaseRecord?.internalCounsellorNote || '');
    setExercisesText((releaseRecord?.recommendedExercises || []).join('\n'));
    setFeedback(null);
  }, [student.id, releaseRecord?.updatedAt]);

  // Automatically log family/student report access when approved/published
  useEffect(() => {
    if ((isParent || isStudent) && isVcipReleaseVisibleToFamily(releaseRecord)) {
      apiRequest(
        `/api/vcip/profiles/${student.id}/access-log`,
        { method: 'POST' },
        token,
      ).catch(() => {
        // Silent background audit logging
      });
    }
  }, [isParent, isStudent, releaseRecord?.status, student.id, token]);

  const currentStatus: VcipProfileReleaseStatus = releaseRecord?.status || 'draft';
  const statusMeta = VCIP_RELEASE_STATUS_META[currentStatus];
  const studentLogs = accessLogs.filter((l) => l.studentId === student.id).slice(0, 10);

  const handleTransition = async (targetStatus: VcipProfileReleaseStatus) => {
    setSaving(true);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/vcip/profiles/${student.id}/workflow`,
        {
          method: 'POST',
          body: JSON.stringify({
            status: targetStatus,
            sharedCounsellorObservations: sharedObs,
            internalCounsellorNote: internalNote,
            recommendedExercises: exercisesText
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          }),
        },
        token,
      );
      setFeedback(
        `Cognitive Profile status updated to "${VCIP_RELEASE_STATUS_META[targetStatus].label}" and logged to access audit trail.`,
      );
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to update workflow status.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleConsent = async () => {
    if (!releaseRecord) return;
    setSaving(true);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/vcip/profiles/${student.id}/consent`,
        {
          method: 'POST',
          body: JSON.stringify({
            parentConsentGranted: !releaseRecord.parentConsentGranted,
          }),
        },
        token,
      );
      setFeedback('Parent cognitive report consent preference saved.');
      await onRefresh();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to update consent.');
    } finally {
      setSaving(false);
    }
  };

  // Student & Parent Approved View
  if (isStudent || isParent) {
    if (!isVcipReleaseVisibleToFamily(releaseRecord)) {
      return (
        <div
          data-testid="vcip-family-locked-banner"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Lock className="h-5 w-5 text-amber-700" />
            Cognitive Profile Pending Counsellor Review &amp; Principal Approval
          </div>
          <p className="text-xs leading-relaxed">
            For student privacy and developmental accuracy, Rai Plus Cognitive Intelligence Profiles
            become visible to Students and Parents only after Counsellor verification and
            Principal publication approval. Current status:{' '}
            <span className="font-bold">{statusMeta.label}</span>.
          </p>
        </div>
      );
    }

    return (
      <div
        data-testid="vcip-family-approved-panel"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Approved Developmental Cognitive Report — {student.name}
              </h3>
              <p className="text-[11px] text-emerald-800">
                Reviewed by {releaseRecord?.reviewedBy || 'School Counsellor'} · Approved by{' '}
                {releaseRecord?.approvedBy || 'Principal'}
              </p>
            </div>
          </div>
          {isParent && releaseRecord && (
            <button
              type="button"
              disabled={saving}
              onClick={handleToggleConsent}
              className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
            >
              Parent Consent: {releaseRecord.parentConsentGranted ? 'Granted ✓' : 'Withheld'}
            </button>
          )}
        </div>

        {releaseRecord?.sharedCounsellorObservations && (
          <div className="rounded-xl border border-emerald-200 bg-white p-4 text-xs text-slate-800">
            <div className="font-bold text-slate-900 mb-1">
              Approved Counsellor Observations &amp; Guidance
            </div>
            <p className="leading-relaxed">{releaseRecord.sharedCounsellorObservations}</p>
          </div>
        )}

        {releaseRecord && releaseRecord.recommendedExercises.length > 0 && (
          <div className="rounded-xl border border-indigo-200 bg-white p-4 text-xs">
            <div className="font-bold text-indigo-950 mb-1.5">
              Recommended Home &amp; Developmental Exercises
            </div>
            <ul className="space-y-1 text-slate-700">
              {releaseRecord.recommendedExercises.map((ex, i) => (
                <li key={i}>• {ex}</li>
              ))}
            </ul>
          </div>
        )}
        {feedback && <p className="text-xs font-semibold text-emerald-800">{feedback}</p>}
      </div>
    );
  }

  // Counsellor & Management Approval Governance Panel
  if (!canWorkflow) return null;

  return (
    <div
      data-testid="vcip-governance-workflow-panel"
      className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <ShieldCheck className="h-4 w-4" />
            Part 6 — Cognitive Profile Release &amp; Confidentiality Governance
          </div>
          <h3 className="mt-0.5 text-base font-bold text-slate-900">
            Approval Workflow for {student.name} ({student.classSection})
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${
            statusMeta.studentParentVisible
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-amber-100 text-amber-900'
          }`}
        >
          {statusMeta.studentParentVisible ? (
            <Unlock className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3.5 w-3.5" />
          )}
          {statusMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-800">
            Approved Observations (Shared With Student &amp; Parent Upon Publication)
          </label>
          <textarea
            rows={3}
            value={sharedObs}
            onChange={(e) => setSharedObs(e.target.value)}
            placeholder="Write constructive, parent-friendly developmental guidance..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-rose-800">
            <ShieldAlert className="h-3.5 w-3.5" />
            Internal Counsellor Note (Strictly Private — Stripped From Family API)
          </label>
          <textarea
            rows={3}
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Confidential clinical/counsellor note — never visible to student or parent..."
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 p-3 text-xs text-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-800">
          Recommended Exercises (one per line)
        </label>
        <textarea
          rows={2}
          value={exercisesText}
          onChange={(e) => setExercisesText(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800"
        />
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-900">
          {feedback}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleTransition('under_review')}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          Save Under Review
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleTransition('pending_approval')}
          className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700"
        >
          Submit for Principal Approval
        </button>
        {canRoleTransitionVcipStatus({ role: user.role, targetStatus: 'published' }).allowed && (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleTransition('published')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve &amp; Publish to Family
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleTransition('revoked')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              <XCircle className="h-4 w-4" />
              Revoke Access
            </button>
          </>
        )}
      </div>

      {/* Access Audit Log */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Eye className="h-3.5 w-3.5 text-indigo-600" />
          VCIP Profile Access &amp; Approval Audit Trail ({studentLogs.length})
        </h4>
        <div className="mt-2 space-y-1.5">
          {studentLogs.length === 0 ? (
            <p className="text-[11px] text-slate-500">No access events recorded yet.</p>
          ) : (
            studentLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 text-[11px]"
              >
                <span>
                  <span className="font-bold text-slate-900">
                    {log.accessorName} ({log.accessorRole})
                  </span>{' '}
                  — {log.detail}
                </span>
                <span className="font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
