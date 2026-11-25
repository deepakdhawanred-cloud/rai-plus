import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import type { DevelopmentReviewItem } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';

interface DevelopmentReviewQueuePanelProps {
  data: WorkspaceData;
  token: string;
  activeStudentId?: string;
  onRefresh: () => Promise<void>;
}

export const DevelopmentReviewQueuePanel: React.FC<DevelopmentReviewQueuePanelProps> = ({
  data,
  token,
  activeStudentId,
  onRefresh,
}) => {
  const canDecide = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const [scopeStudentOnly, setScopeStudentOnly] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const allReviews = data.developmentReviews || [];
  const filteredReviews =
    scopeStudentOnly && activeStudentId
      ? allReviews.filter((r) => r.studentId === activeStudentId)
      : allReviews;

  const pendingCount = allReviews.filter((r) => r.status === 'Pending').length;

  async function handleDecide(
    item: DevelopmentReviewItem,
    status: 'Confirmed' | 'Withdrawn',
  ) {
    const decisionNote = (noteById[item.id] ?? '').trim();
    if (!decisionNote) {
      setErrorMsg('Please enter a brief review note before confirming or withdrawing.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    try {
      await apiRequest(
        `/api/development-reviews/${item.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, decisionNote }),
        },
        token,
      );
      setDecidingId(null);
      await onRefresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save review decision.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="Development Review Queue"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-amber-700 shrink-0" />
            Development Review Queue (Work Quality C & Verification)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Opened automatically for Work Quality C notebook entries so teachers verify understanding gently instead of applying permanent labels.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeStudentId && (
            <button
              type="button"
              onClick={() => setScopeStudentOnly((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              {scopeStudentOnly ? 'Show All School Queue' : 'Filter to Selected Student'}
            </button>
          )}
          <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-2.5 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {filteredReviews.length === 0 ? (
        <div className="px-6 py-6 text-xs text-slate-500">
          No Work Quality C or observation review items in this scope.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredReviews.map((item) => {
            const isOpen = decidingId === item.id;
            const statusTone =
              item.status === 'Pending'
                ? 'text-amber-700'
                : item.status === 'Confirmed'
                  ? 'text-blue-900'
                  : 'text-emerald-700';

            return (
              <div key={item.id} className="px-6 py-4 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.studentName} · Class {item.classSection} · {item.subject} ({item.chapter})
                    </p>
                    <p className="text-slate-600 mt-0.5">{item.summary}</p>
                    <p className="text-slate-400 mt-0.5">
                      Opened by {item.openedBy} on {item.createdAt}
                      {item.decidedBy ? ` · Decided by ${item.decidedBy} (${item.decidedAt})` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono font-semibold ${statusTone}`}>{item.status}</span>
                    {canDecide && item.status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => setDecidingId(isOpen ? null : item.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        {isOpen ? 'Cancel' : 'Review & Decide'}
                      </button>
                    )}
                  </div>
                </div>

                {item.decisionNote && (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    <span className="font-semibold text-slate-900">Review Decision Note: </span>
                    {item.decisionNote}
                  </p>
                )}

                {isOpen && canDecide && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                    <label
                      htmlFor={`rev-note-${item.id}`}
                      className="block font-medium text-slate-700"
                    >
                      One-on-One Verification Note (Audit-Logged)
                    </label>
                    <input
                      id={`rev-note-${item.id}`}
                      type="text"
                      value={noteById[item.id] ?? ''}
                      onChange={(e) =>
                        setNoteById((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="e.g. Verified student solved 2 board problems independently; cleared for support plan"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleDecide(item, 'Confirmed')}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 font-semibold text-white hover:bg-blue-800"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirm Support Plan
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleDecide(item, 'Withdrawn')}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-700 bg-white px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Withdraw Flag (Solved Independently)
                      </button>
                    </div>
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
