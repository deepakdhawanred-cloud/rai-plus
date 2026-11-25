import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FileImage, Lock, MessageSquareWarning, Send } from 'lucide-react';
import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  ParentComplaint,
} from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
  computeComplaintStats,
  filterComplaints,
} from '../utils/complaintEngine';
import { PARENT_TRANSLATIONS, type ParentLang } from '../utils/parentTranslations';

interface ComplaintManagementPanelProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  parentLang?: ParentLang;
}

export const ComplaintManagementPanel: React.FC<ComplaintManagementPanelProps> = ({
  data,
  token,
  onRefresh,
  parentLang = 'en',
}) => {
  const userRole = data.user.role;
  const isParent = userRole === 'parent';
  const canTriage = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(userRole);
  const t = PARENT_TRANSLATIONS[isParent ? parentLang : 'en'];

  const complaints = data.parentComplaints || [];
  const stats = computeComplaintStats(complaints);

  // Submission state
  const [studentId, setStudentId] = useState<string>(data.students[0]?.id ?? '');
  const [category, setCategory] = useState<ComplaintCategory>('Transport');
  const [priority, setPriority] = useState<ComplaintPriority>('Standard');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoName, setPhotoName] = useState<string>('');
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');

  // Active staff triage or parent feedback draft per complaint
  const [expandedId, setExpandedId] = useState<string | null>(complaints[0]?.id ?? null);
  const [draftOwner, setDraftOwner] = useState('');
  const [draftStatus, setDraftStatus] = useState<ComplaintStatus>('Assigned');
  const [draftPriority, setDraftPriority] = useState<ComplaintPriority>('Standard');
  const [draftInternalNote, setDraftInternalNote] = useState('');
  const [draftResolutionNote, setDraftResolutionNote] = useState('');
  const [draftParentFeedback, setDraftParentFeedback] = useState('');
  const [triageSaving, setTriageSaving] = useState(false);

  const visibleComplaints = filterComplaints(complaints, { query, status: statusFilter });

  function selectComplaintForEdit(cmp: ParentComplaint) {
    if (expandedId === cmp.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(cmp.id);
    setDraftOwner(cmp.assignedCoordinator || 'Anil Kumar Hooda');
    setDraftStatus(cmp.status);
    setDraftPriority(cmp.priority);
    setDraftInternalNote(cmp.internalStaffNote || '');
    setDraftResolutionNote(cmp.resolutionNote || '');
    setDraftParentFeedback(cmp.parentFeedback || '');
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSubmitErr(null);
    if (!file) {
      setPhotoDataUrl('');
      setPhotoName('');
      return;
    }
    if (file.size > 500 * 1024) {
      setSubmitErr('Photo must be 500 KB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        setPhotoName(file.name);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmitComplaint(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr(null);
    setSubmitOk(null);
    setSubmitting(true);
    try {
      const res = await apiRequest<{ complaint: ParentComplaint }>(
        '/api/complaints',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: studentId || data.students[0]?.id,
            category,
            priority,
            title,
            description,
            photoDataUrl: photoDataUrl || undefined,
          }),
        },
        token,
      );
      setTitle('');
      setDescription('');
      setPhotoDataUrl('');
      setPhotoName('');
      setSubmitOk(`Concern logged under reference ${res.complaint.refNo}.`);
      setExpandedId(res.complaint.id);
      await onRefresh();
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : 'Unable to submit concern.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveTriage(cmp: ParentComplaint) {
    setTriageSaving(true);
    try {
      await apiRequest(
        `/api/complaints/${cmp.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            assignedCoordinator: draftOwner,
            status: draftStatus,
            priority: draftPriority,
            internalStaffNote: draftInternalNote,
            resolutionNote: draftResolutionNote,
          }),
        },
        token,
      );
      await onRefresh();
    } finally {
      setTriageSaving(false);
    }
  }

  async function handleParentFollowUp(cmp: ParentComplaint, reopen: boolean) {
    setTriageSaving(true);
    try {
      await apiRequest(
        `/api/complaints/${cmp.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            parentFeedback: draftParentFeedback,
            reopen,
          }),
        },
        token,
      );
      await onRefresh();
    } finally {
      setTriageSaving(false);
    }
  }

  return (
    <section
      aria-label="Structured Parent Complaint Management"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-blue-900 shrink-0" />
            {isParent ? t.complaintDeskTitle : 'Parent Complaint Desk & Resolution Queue'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isParent
              ? t.complaintDeskSubtitle
              : 'Categorised parent concerns with coordinator assignment, optional photo proof, and strict staff-note separation.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-700 shrink-0">
          <span>Open: {stats.openCount}</span>
          <span>Unassigned: {stats.unassignedCount}</span>
          {stats.safeguardingCount > 0 && (
            <span className="text-red-700 font-semibold">
              Safeguarding: {stats.safeguardingCount}
            </span>
          )}
          <span className="text-emerald-700">Resolved: {stats.resolvedCount}</span>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-xs text-slate-600 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span>
          {isParent
            ? t.privacyNotice
            : 'Internal Staff Investigation Notes are stored separately and stripped by the API before returning records to parents or students.'}
        </span>
      </div>

      {/* Submit Structured Concern Form */}
      <form
        onSubmit={handleSubmitComplaint}
        className="border-b border-slate-200 p-6 bg-slate-50/40 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {isParent ? t.submitConcernBtn : 'Log Parent Concern on Behalf of Family'}
          </h3>
          {submitOk && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {submitOk}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label htmlFor="cmp-student" className="block text-xs font-medium text-slate-600 mb-1">
              Student
            </label>
            <select
              id="cmp-student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              {data.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Class {st.classSection})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cmp-category" className="block text-xs font-medium text-slate-600 mb-1">
              Category
            </label>
            <select
              id="cmp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cmp-priority" className="block text-xs font-medium text-slate-600 mb-1">
              Priority
            </label>
            <select
              id="cmp-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              {COMPLAINT_PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cmp-photo" className="block text-xs font-medium text-slate-600 mb-1">
              Attach Photo Proof (optional)
            </label>
            <label
              htmlFor="cmp-photo"
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 truncate"
            >
              <FileImage className="h-3.5 w-3.5 text-blue-900 shrink-0" />
              <span className="truncate">{photoName || 'Choose image (<= 500 KB)'}</span>
              <input
                id="cmp-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label htmlFor="cmp-title" className="block text-xs font-medium text-slate-600 mb-1">
              Concern Subject
            </label>
            <input
              id="cmp-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Route 3 bus delay or classroom seating"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="cmp-desc" className="block text-xs font-medium text-slate-600 mb-1">
              Concern Details
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="cmp-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include date, route/location, and requested support..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Submitting...' : t.submitConcernBtn}
              </button>
            </div>
          </div>
        </div>

        {submitErr && (
          <p className="text-xs text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {submitErr}
          </p>
        )}
      </form>

      {/* Filter Toolbar */}
      <div className="border-b border-slate-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="search"
          aria-label="Search complaints by reference, student, or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ref (CMP-...), student, or category..."
          className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
        />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label htmlFor="cmp-filter-status" className="text-slate-500">
            Status:
          </label>
          <select
            id="cmp-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'All')}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs"
          >
            <option value="All">All Statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {visibleComplaints.length === 0 ? (
        <div className="px-6 py-8 text-xs text-slate-500">
          No concerns match the current filter.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {visibleComplaints.map((cmp) => {
            const isExpanded = expandedId === cmp.id;
            const priorityTone =
              cmp.priority === 'Safeguarding Escalation'
                ? 'text-red-700 font-semibold'
                : cmp.priority === 'Urgent'
                  ? 'text-amber-700 font-semibold'
                  : 'text-slate-600';
            const statusTone =
              cmp.status === 'Resolved'
                ? 'text-emerald-700'
                : cmp.status === 'Reopened'
                  ? 'text-red-700'
                  : 'text-blue-900';

            return (
              <div key={cmp.id} className="px-6 py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-slate-500 font-mono tabular-nums">
                      {cmp.refNo} · {cmp.category} ·{' '}
                      <span className={priorityTone}>{cmp.priority}</span> · Created {cmp.createdAt}
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">{cmp.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{cmp.description}</p>
                    <p className="text-xs text-slate-500">
                      Student: {cmp.studentName} ({cmp.classSection}) · Guardian: {cmp.parentName} ·{' '}
                      Owner:{' '}
                      <span className="font-medium text-slate-800">
                        {cmp.assignedCoordinator || 'Pending Coordinator Assignment'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono text-xs font-semibold ${statusTone}`}>
                      {cmp.status}
                    </span>
                    {(canTriage || isParent) && (
                      <button
                        type="button"
                        onClick={() => selectComplaintForEdit(cmp)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                      >
                        {isExpanded
                          ? 'Close'
                          : canTriage
                            ? 'Triage / Update'
                            : 'Feedback / Details'}
                      </button>
                    )}
                  </div>
                </div>

                {cmp.photoDataUrl && (
                  <div className="pt-1">
                    <img
                      src={cmp.photoDataUrl}
                      alt={`Attachment for ${cmp.refNo}`}
                      className="max-h-36 rounded-lg border border-slate-200 object-contain"
                    />
                  </div>
                )}

                {cmp.resolutionNote && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-xs text-slate-800">
                    <span className="font-semibold text-emerald-900">School Resolution Update: </span>
                    {cmp.resolutionNote}
                  </div>
                )}

                {canTriage && cmp.internalStaffNote && !isExpanded && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-2 text-xs text-slate-800">
                    <span className="font-semibold text-amber-900">
                      Staff-Only Internal Note (Hidden from Parent):{' '}
                    </span>
                    {cmp.internalStaffNote}
                  </div>
                )}

                {cmp.parentFeedback && (
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Parent Feedback: </span>
                    {cmp.parentFeedback}
                  </p>
                )}

                {isExpanded && canTriage && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor={`owner-${cmp.id}`}
                          className="block font-medium text-slate-600 mb-1"
                        >
                          Assigned Coordinator
                        </label>
                        <input
                          id={`owner-${cmp.id}`}
                          type="text"
                          value={draftOwner}
                          onChange={(e) => setDraftOwner(e.target.value)}
                          placeholder="e.g. Anil Kumar Hooda"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`status-${cmp.id}`}
                          className="block font-medium text-slate-600 mb-1"
                        >
                          Complaint Status
                        </label>
                        <select
                          id={`status-${cmp.id}`}
                          value={draftStatus}
                          onChange={(e) => setDraftStatus(e.target.value as ComplaintStatus)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                        >
                          {COMPLAINT_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor={`priority-${cmp.id}`}
                          className="block font-medium text-slate-600 mb-1"
                        >
                          Priority Level
                        </label>
                        <select
                          id={`priority-${cmp.id}`}
                          value={draftPriority}
                          onChange={(e) => setDraftPriority(e.target.value as ComplaintPriority)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                        >
                          {COMPLAINT_PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={`internal-${cmp.id}`}
                          className="block font-medium text-amber-900 mb-1"
                        >
                          Staff-Only Internal Note (Strictly Hidden from Parents)
                        </label>
                        <textarea
                          id={`internal-${cmp.id}`}
                          rows={2}
                          value={draftInternalNote}
                          onChange={(e) => setDraftInternalNote(e.target.value)}
                          placeholder="Internal verification steps, staff follow-up..."
                          className="w-full rounded-lg border border-amber-300 bg-white px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`resolution-${cmp.id}`}
                          className="block font-medium text-emerald-900 mb-1"
                        >
                          Parent-Visible Resolution Update
                        </label>
                        <textarea
                          id={`resolution-${cmp.id}`}
                          rows={2}
                          value={draftResolutionNote}
                          onChange={(e) => setDraftResolutionNote(e.target.value)}
                          placeholder="Clear update shared with the family..."
                          className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-1.5"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={triageSaving}
                        onClick={() => void handleSaveTriage(cmp)}
                        className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        {triageSaving ? 'Saving...' : `Save Triage Update (${cmp.refNo})`}
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && isParent && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                    <label
                      htmlFor={`pfeed-${cmp.id}`}
                      className="block font-medium text-slate-700"
                    >
                      Share Family Follow-up or Feedback
                    </label>
                    <input
                      id={`pfeed-${cmp.id}`}
                      type="text"
                      value={draftParentFeedback}
                      onChange={(e) => setDraftParentFeedback(e.target.value)}
                      placeholder="Confirm whether the issue was resolved satisfactorily..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={triageSaving}
                        onClick={() => void handleParentFollowUp(cmp, false)}
                        className="rounded-lg bg-blue-900 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-800"
                      >
                        Save Feedback
                      </button>
                      {cmp.status === 'Resolved' && (
                        <button
                          type="button"
                          disabled={triageSaving}
                          onClick={() => void handleParentFollowUp(cmp, true)}
                          className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 font-semibold text-red-700 hover:bg-red-50"
                        >
                          Reopen Concern
                        </button>
                      )}
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
