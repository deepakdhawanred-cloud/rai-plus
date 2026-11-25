import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MapPin,
  MessageSquarePlus,
  Plus,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react';
import type {
  EventParticipationStatus,
  EventTeacherIssueSeverity,
  EventTeacherIssueType,
  SchoolEvent,
  SchoolEventCategory,
  SchoolEventStatus,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';

interface SchoolEventsModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

const EVENT_CATEGORIES: SchoolEventCategory[] = [
  'Science & Innovation',
  'Academic',
  'Sports',
  'Cultural',
  'Competition',
  'Parent-School',
];

const EVENT_STATUSES: SchoolEventStatus[] = [
  'Scheduled',
  'In Preparation',
  'Ready',
  'Completed',
];

export const SchoolEventsModule: React.FC<SchoolEventsModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const events = useMemo(() => data.schoolEvents || [], [data.schoolEvents]);
  const requests = useMemo(
    () => data.eventParticipationRequests || [],
    [data.eventParticipationRequests],
  );
  const issues = useMemo(() => data.eventTeacherIssues || [], [data.eventTeacherIssues]);

  const role = data.user.role;
  const isParentOrStudent = role === 'parent' || role === 'student';
  const isManagementOrCoordinator = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
  ].includes(role);
  const isStaff = isManagementOrCoordinator || role === 'teacher';

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const activeEvent: SchoolEvent | undefined =
    events.find((e) => e.id === selectedEventId) || events[0];

  // Parent/Student Participation Request Form State
  const [reqStudentId, setReqStudentId] = useState<string>(data.students[0]?.id || '');
  const [reqNote, setReqNote] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Teacher Input / Issue Form State
  const [issueType, setIssueType] = useState<EventTeacherIssueType>('Issue / Blocker');
  const [issueSeverity, setIssueSeverity] = useState<EventTeacherIssueSeverity>('Normal');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDetail, setIssueDetail] = useState('');

  // Coordinator Issue Resolution Note Map
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  // Progress Report Editor State
  const [progressDraft, setProgressDraft] = useState<string>('');
  const [progressEditingEventId, setProgressEditingEventId] = useState<string | null>(null);

  // Create New Event Modal / Drawer
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SchoolEventCategory>('Science & Innovation');
  const [newDate, setNewDate] = useState('2026-12-28');
  const [newTimeSlot, setNewTimeSlot] = useState('09:30 AM – 01:00 PM');
  const [newVenue, setNewVenue] = useState('Main School Auditorium');
  const [newCoordinator, setNewCoordinator] = useState(data.user.name);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherDuty, setNewTeacherDuty] = useState('Student rehearsal & stage setup');
  const [newDescription, setNewDescription] = useState('');

  const activeEventRequests = useMemo(
    () => (activeEvent ? requests.filter((r) => r.eventId === activeEvent.id) : []),
    [activeEvent, requests],
  );
  const activeEventIssues = useMemo(
    () => (activeEvent ? issues.filter((i) => i.eventId === activeEvent.id) : []),
    [activeEvent, issues],
  );

  const openIssuesCount = issues.filter((i) => i.status !== 'Resolved').length;
  const pendingReqCount = requests.filter((r) => r.status === 'Requested').length;

  async function handleSubmitParticipationRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!activeEvent) return;
    const studentId = reqStudentId || data.students[0]?.id;
    if (!studentId) return;
    setBusyKey('submit-req');
    setFeedback(null);
    try {
      await apiRequest(
        `/api/events/${activeEvent.id}/participation-request`,
        {
          method: 'POST',
          body: JSON.stringify({ studentId, parentNote: reqNote }),
        },
        token,
      );
      setReqNote('');
      await onRefresh();
      setFeedback({
        ok: true,
        text: `Participation request pushed for "${activeEvent.title}". Assigned coordinator & teachers have been notified.`,
      });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to submit participation request.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReviewParticipation(reqId: string, status: EventParticipationStatus) {
    setBusyKey(`req-${reqId}`);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/events/participation-requests/${reqId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ ok: true, text: `Participation request marked as ${status}.` });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to update participation request.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleMilestone(event: SchoolEvent, milestoneId: string) {
    if (!isStaff) return;
    setBusyKey(`ms-${milestoneId}`);
    setFeedback(null);
    try {
      const updatedMilestones = event.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m,
      );
      const done = updatedMilestones.filter((m) => m.completed).length;
      const readinessPct =
        updatedMilestones.length > 0 ? Math.round((done / updatedMilestones.length) * 100) : event.readinessPct;
      await apiRequest(
        `/api/events/${event.id}/progress`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            milestones: updatedMilestones,
            readinessPct,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback({ ok: true, text: `Event progress report updated (${readinessPct}% ready).` });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Could not update milestone.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpdateEventStatusOrSummary(
    event: SchoolEvent,
    patch: { status?: SchoolEventStatus; progressSummary?: string },
  ) {
    setBusyKey(`prog-${event.id}`);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/events/${event.id}/progress`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
        token,
      );
      setProgressEditingEventId(null);
      await onRefresh();
      setFeedback({ ok: true, text: 'Event progress report saved.' });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Could not update event progress.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSubmitTeacherIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!activeEvent || !issueTitle.trim() || !issueDetail.trim()) return;
    setBusyKey('submit-issue');
    setFeedback(null);
    try {
      await apiRequest(
        `/api/events/${activeEvent.id}/teacher-inputs`,
        {
          method: 'POST',
          body: JSON.stringify({
            entryType: issueType,
            severity: issueSeverity,
            title: issueTitle,
            detail: issueDetail,
          }),
        },
        token,
      );
      setIssueTitle('');
      setIssueDetail('');
      await onRefresh();
      setFeedback({
        ok: true,
        text: `Input logged and routed to Dedicated Coordinator (${activeEvent.dedicatedCoordinatorName}).`,
      });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Could not submit teacher input.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleResolveIssue(issueId: string) {
    const note = (resolutionNotes[issueId] || '').trim();
    if (!note) {
      setFeedback({
        ok: false,
        text: 'Please enter a coordinator resolution note before resolving this issue.',
      });
      return;
    }
    setBusyKey(`resolve-${issueId}`);
    setFeedback(null);
    try {
      await apiRequest(
        `/api/events/teacher-inputs/${issueId}/resolve`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Resolved', resolutionNote: note }),
        },
        token,
      );
      setResolutionNotes((prev) => ({ ...prev, [issueId]: '' }));
      await onRefresh();
      setFeedback({ ok: true, text: 'Issue resolved and recorded in event audit trail.' });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to resolve issue.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    setBusyKey('create-event');
    setFeedback(null);
    try {
      const res = await apiRequest<{ event: SchoolEvent }>(
        '/api/events',
        {
          method: 'POST',
          body: JSON.stringify({
            title: newTitle,
            category: newCategory,
            eventDate: newDate,
            timeSlot: newTimeSlot,
            venue: newVenue,
            dedicatedCoordinatorName: newCoordinator,
            assignedTeachers: newTeacherName.trim()
              ? [{ teacherName: newTeacherName.trim(), responsibility: newTeacherDuty.trim() }]
              : [],
            description: newDescription,
          }),
        },
        token,
      );
      setNewTitle('');
      setNewDescription('');
      setNewTeacherName('');
      setShowCreateForm(false);
      await onRefresh();
      if (res.event?.id) setSelectedEventId(res.event.id);
      setFeedback({ ok: true, text: `Event "${res.event.title}" published to school calendar.` });
    } catch (err) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'Unable to schedule event.',
      });
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="school-events-module">
      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#7B5D1C]">
            {data.activeSchool.name} · {data.activeSchool.board} · Event Calendar &amp; Live Progress
          </p>
          <h1 className="font-display text-2xl font-bold text-[#142B46] mt-0.5">
            School Events Calendar, Participation &amp; Coordination Desk
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {isParentOrStudent
              ? 'View upcoming school events, check live preparation progress, and push participation requests for your child.'
              : 'Track event readiness reports, approve parent participation requests, and resolve teacher-logged field issues through dedicated coordinators.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs font-mono tabular-nums text-slate-600">
            <strong className="text-[#142B46]">{events.length}</strong> Upcoming
            {!isParentOrStudent && (
              <>
                {' · '}
                <strong className="text-amber-700">{pendingReqCount}</strong> Requests
                {' · '}
                <strong className="text-rose-700">{openIssuesCount}</strong> Open Issues
              </>
            )}
          </div>
          {isManagementOrCoordinator && (
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              data-testid="toggle-create-event-btn"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5 text-[#D6B66D]" />
              {showCreateForm ? 'Close Form' : 'Schedule Event'}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-center gap-2 ${
            feedback.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-700" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Create Event Drawer (Management & Coordinators) */}
      {showCreateForm && isManagementOrCoordinator && (
        <form
          onSubmit={handleCreateEvent}
          className="rounded-xl border border-[#D9C9B6] bg-[#FAF4EC]/60 p-5 space-y-4"
        >
          <h2 className="font-display text-sm font-bold text-[#142B46]">
            Publish New Event to {data.activeSchool.name} Calendar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event Title (e.g. Winter Mathematics Olympiad)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:col-span-2"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as SchoolEventCategory)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newTimeSlot}
              onChange={(e) => setNewTimeSlot(e.target.value)}
              placeholder="Time Slot"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              placeholder="Venue"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newCoordinator}
              onChange={(e) => setNewCoordinator(e.target.value)}
              placeholder="Dedicated Coordinator Name"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Assigned Lead Teacher (Optional)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={newTeacherDuty}
              onChange={(e) => setNewTeacherDuty(e.target.value)}
              placeholder="Teacher Responsibility"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
            />
          </div>
          <textarea
            rows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Event brief visible to parents, students, and staff..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={busyKey === 'create-event'}
            className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3d63]"
          >
            {busyKey === 'create-event' ? 'Publishing...' : 'Publish to Event Calendar'}
          </button>
        </form>
      )}

      {/* Main Two-Column Calendar & Event Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Event Calendar List */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Upcoming School Calendar ({events.length})
          </p>
          {events.map((evt) => {
            const active = activeEvent?.id === evt.id;
            const evtReqCount = requests.filter((r) => r.eventId === evt.id).length;
            const evtOpenIssues = issues.filter(
              (i) => i.eventId === evt.id && i.status !== 'Resolved',
            ).length;
            return (
              <button
                key={evt.id}
                type="button"
                data-testid={`event-card-${evt.id}`}
                onClick={() => setSelectedEventId(evt.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all space-y-2.5 ${
                  active
                    ? 'border-[#142B46] bg-[#142B46] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-[#142B46]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                  <span className={active ? 'text-[#D6B66D] font-bold' : 'text-[#7B5D1C] font-bold'}>
                    {evt.eventDate}
                  </span>
                  <span className={active ? 'text-[#A9C5D8]' : 'text-slate-500'}>
                    {evt.category}
                  </span>
                </div>
                <p className="font-display text-sm font-bold leading-snug">{evt.title}</p>
                <p className={`text-xs truncate ${active ? 'text-[#A9C5D8]' : 'text-slate-500'}`}>
                  {evt.venue} · Coord: {evt.dedicatedCoordinatorName}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                    <span className={active ? 'text-[#FAF4EC]' : 'text-slate-600'}>
                      Progress: {evt.status}
                    </span>
                    <span className="font-bold">{evt.readinessPct}%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${active ? 'bg-white/20' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full rounded-full ${active ? 'bg-[#D6B66D]' : 'bg-[#6E987A]'}`}
                      style={{ width: `${evt.readinessPct}%` }}
                    />
                  </div>
                </div>
                <div className={`text-[11px] font-mono tabular-nums ${active ? 'text-[#A9C5D8]' : 'text-slate-500'}`}>
                  {evtReqCount} participation req{evtReqCount === 1 ? '' : 's'}
                  {!isParentOrStudent && ` · ${evtOpenIssues} open issue${evtOpenIssues === 1 ? '' : 's'}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Event Inspector */}
        {activeEvent && (
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Event Overview & Live Progress Report */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#7B5D1C]">
                    {activeEvent.category} · {activeEvent.targetClasses.join(', ')}
                  </p>
                  <h2 className="font-display text-xl font-bold text-[#142B46] mt-0.5">
                    {activeEvent.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-[#142B46]" />
                      {activeEvent.eventDate}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#142B46]" />
                      {activeEvent.timeSlot}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#142B46]" />
                      {activeEvent.venue}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[11px] text-slate-500">Event Progress Report</p>
                  <p className="font-mono text-2xl font-bold text-[#142B46] tabular-nums">
                    {activeEvent.readinessPct}%
                  </p>
                  {isStaff ? (
                    <select
                      aria-label="Update event preparation status"
                      value={activeEvent.status}
                      onChange={(e) =>
                        void handleUpdateEventStatusOrSummary(activeEvent, {
                          status: e.target.value as SchoolEventStatus,
                        })
                      }
                      className="mt-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#142B46]"
                    >
                      {EVENT_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs font-semibold text-[#3D6349]">{activeEvent.status}</p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{activeEvent.description}</p>

              {/* Progress Report Summary & Milestones */}
              <div className="rounded-xl border border-[#E5D7C3] bg-[#FAF4EC]/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#142B46] flex items-center gap-1.5">
                    <ClipboardCheck className="h-4 w-4 text-[#7B5D1C]" />
                    Live Event Preparation &amp; Progress Report
                  </h3>
                  {isStaff && progressEditingEventId !== activeEvent.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setProgressEditingEventId(activeEvent.id);
                        setProgressDraft(activeEvent.progressSummary);
                      }}
                      className="text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap"
                    >
                      Edit Progress Update
                    </button>
                  )}
                </div>

                {progressEditingEventId === activeEvent.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={progressDraft}
                      onChange={(e) => setProgressDraft(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void handleUpdateEventStatusOrSummary(activeEvent, {
                            progressSummary: progressDraft,
                          })
                        }
                        className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3d63]"
                      >
                        Save Report
                      </button>
                      <button
                        type="button"
                        onClick={() => setProgressEditingEventId(null)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeEvent.progressSummary}
                  </p>
                )}

                <div className="space-y-2 pt-1">
                  {activeEvent.milestones.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer min-w-0">
                        <input
                          type="checkbox"
                          checked={m.completed}
                          disabled={!isStaff || busyKey === `ms-${m.id}`}
                          onChange={() => void handleToggleMilestone(activeEvent, m.id)}
                          className="rounded accent-[#142B46]"
                        />
                        <span
                          className={
                            m.completed
                              ? 'line-through text-slate-400 truncate'
                              : 'font-medium text-slate-800 truncate'
                          }
                        >
                          {m.title}
                        </span>
                      </label>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                        {m.ownerName} · Due {m.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assigned Teachers & Dedicated Coordinator */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-slate-200 p-3.5 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#142B46]" />
                    Dedicated Event Coordinator
                  </p>
                  <p className="text-sm font-bold text-[#142B46]">
                    {activeEvent.dedicatedCoordinatorName}
                  </p>
                  <p className="text-xs text-slate-600">
                    Reviews participation rosters &amp; resolves all teacher-raised issues.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-[#142B46]" />
                    Assigned Teachers ({activeEvent.assignedTeachers.length})
                  </p>
                  {activeEvent.assignedTeachers.length === 0 ? (
                    <p className="text-xs text-slate-500">Teachers being assigned by coordinator.</p>
                  ) : (
                    <ul className="space-y-1 text-xs">
                      {activeEvent.assignedTeachers.map((t, i) => (
                        <li key={i} className="text-slate-700">
                          <span className="font-bold text-[#142B46]">{t.teacherName}</span> —{' '}
                          {t.responsibility}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Participation Requests (Parent/Student Push + Coordinator Approval) */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#142B46] flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-[#6E987A]" />
                    Student Participation Requests ({activeEventRequests.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Registration deadline: {activeEvent.registrationDeadline} · Capacity:{' '}
                    {activeEvent.maxParticipants} students
                  </p>
                </div>
              </div>

              {/* Push Participation Form for Parents & Students */}
              {isParentOrStudent && data.students.length > 0 && (
                <form
                  onSubmit={handleSubmitParticipationRequest}
                  data-testid="parent-participation-form"
                  className="rounded-xl border border-[#D9C9B6] bg-[#FAF4EC]/60 p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[#142B46]">
                    {role === 'parent'
                      ? 'Push Participation Request for Your Child'
                      : 'Request Your Participation in This Event'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      aria-label="Select student for event participation"
                      value={reqStudentId || data.students[0]?.id}
                      onChange={(e) => setReqStudentId(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#142B46]"
                    >
                      {data.students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} (Class {st.classSection})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={reqNote}
                      onChange={(e) => setReqNote(e.target.value)}
                      placeholder="Optional note (e.g. model topic, relay event, instrument)..."
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:col-span-2"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busyKey === 'submit-req'}
                    data-testid="push-participation-request-btn"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5 text-[#D6B66D]" />
                    {busyKey === 'submit-req'
                      ? 'Submitting Request...'
                      : 'Push Participation Request'}
                  </button>
                </form>
              )}

              {activeEventRequests.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No participation requests submitted for this event yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeEventRequests.map((reqItem) => (
                    <div
                      key={reqItem.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-bold text-[#142B46]">
                          {reqItem.studentName} · Class {reqItem.classSection}
                        </p>
                        <p className="text-slate-600">{reqItem.parentNote}</p>
                        <p className="text-[11px] text-slate-400">
                          Requested by {reqItem.requestedByName} ({reqItem.createdAt})
                          {reqItem.reviewedBy ? ` · Reviewed by ${reqItem.reviewedBy}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span
                          className={`font-semibold ${
                            reqItem.status === 'Approved'
                              ? 'text-emerald-700'
                              : reqItem.status === 'Declined'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                          }`}
                        >
                          {reqItem.status}
                        </span>
                        {isStaff && reqItem.status !== 'Approved' && (
                          <button
                            type="button"
                            disabled={busyKey === `req-${reqItem.id}`}
                            onClick={() => void handleReviewParticipation(reqItem.id, 'Approved')}
                            className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                          >
                            Approve
                          </button>
                        )}
                        {isStaff && reqItem.status === 'Requested' && (
                          <button
                            type="button"
                            disabled={busyKey === `req-${reqItem.id}`}
                            onClick={() => void handleReviewParticipation(reqItem.id, 'Waitlisted')}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          >
                            Waitlist
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Teacher Inputs / Field Issues & Dedicated Coordinator Resolution (Staff Only) */}
            {isStaff && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display text-sm font-bold text-[#142B46] flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-[#7B5D1C]" />
                    Assigned Teacher Inputs, Issues &amp; Coordinator Resolution (
                    {activeEventIssues.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Teachers log on-ground inputs, resource gaps, or blockers here. Dedicated
                    Coordinator ({activeEvent.dedicatedCoordinatorName}) resolves and closes them.
                  </p>
                </div>

                {/* Add Teacher Input / Issue Form */}
                <form
                  onSubmit={handleSubmitTeacherIssue}
                  data-testid="teacher-event-issue-form"
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[#142B46] flex items-center gap-1.5">
                    <MessageSquarePlus className="h-3.5 w-3.5 text-[#142B46]" />
                    Log Teacher Input or Preparation Issue
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <select
                      aria-label="Teacher input type"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value as EventTeacherIssueType)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    >
                      <option value="Issue / Blocker">Issue / Blocker</option>
                      <option value="Resource Need">Resource Need</option>
                      <option value="Input / Suggestion">Input / Suggestion</option>
                    </select>
                    <select
                      aria-label="Issue urgency"
                      value={issueSeverity}
                      onChange={(e) => setIssueSeverity(e.target.value as EventTeacherIssueSeverity)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="Urgent">Urgent Blocker</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      placeholder="Short issue or input headline"
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={issueDetail}
                    onChange={(e) => setIssueDetail(e.target.value)}
                    placeholder="Describe the requirement or blocker for the dedicated coordinator..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={busyKey === 'submit-issue'}
                    data-testid="submit-teacher-issue-btn"
                    className="rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3d63]"
                  >
                    {busyKey === 'submit-issue' ? 'Submitting...' : 'Send to Dedicated Coordinator'}
                  </button>
                </form>

                {/* Issues List + Coordinator Resolution Controls */}
                <div className="space-y-3">
                  {activeEventIssues.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No open issues or inputs logged for this event.
                    </p>
                  ) : (
                    activeEventIssues.map((iss) => (
                      <div
                        key={iss.id}
                        className={`rounded-xl border p-4 space-y-2 text-xs ${
                          iss.status === 'Resolved'
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : iss.severity === 'Urgent'
                              ? 'border-rose-200 bg-rose-50/40'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-[#142B46]">
                            {iss.entryType} · {iss.title}
                          </p>
                          <span
                            className={`font-semibold ${
                              iss.status === 'Resolved'
                                ? 'text-emerald-700'
                                : iss.severity === 'Urgent'
                                  ? 'text-rose-700'
                                  : 'text-amber-700'
                            }`}
                          >
                            {iss.status}
                            {iss.severity === 'Urgent' && iss.status !== 'Resolved'
                              ? ' · Urgent'
                              : ''}
                          </span>
                        </div>
                        <p className="text-slate-700">{iss.detail}</p>
                        <p className="text-[11px] text-slate-500">
                          Raised by {iss.teacherName} ({iss.createdAt}) · Coordinator:{' '}
                          {iss.assignedCoordinatorName}
                        </p>

                        {iss.status === 'Resolved' && iss.resolutionNote && (
                          <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-emerald-900">
                            <span className="font-bold">
                              Resolved by {iss.resolvedBy} ({iss.resolvedAt}):
                            </span>{' '}
                            {iss.resolutionNote}
                          </div>
                        )}

                        {iss.status !== 'Resolved' && isManagementOrCoordinator && (
                          <div className="flex flex-col sm:flex-row gap-2 pt-1">
                            <input
                              type="text"
                              value={resolutionNotes[iss.id] || ''}
                              onChange={(e) =>
                                setResolutionNotes((prev) => ({
                                  ...prev,
                                  [iss.id]: e.target.value,
                                }))
                              }
                              placeholder="Enter coordinator resolution action taken..."
                              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                            />
                            <button
                              type="button"
                              disabled={busyKey === `resolve-${iss.id}`}
                              onClick={() => void handleResolveIssue(iss.id)}
                              className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap shrink-0"
                            >
                              {busyKey === `resolve-${iss.id}`
                                ? 'Resolving...'
                                : 'Resolve Issue'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
