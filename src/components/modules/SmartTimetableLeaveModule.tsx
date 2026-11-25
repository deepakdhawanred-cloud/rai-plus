import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Grid2x2,
  Lock,
  RefreshCw,
  Send,
  Settings,
  Sliders,
  Sparkles,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import type {
  BalanceWeight,
  CapabilityBandConfig,
  EnforcementMode,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TeacherCapabilityProfile,
  TeacherLeaveType,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { triggerCsvDownload } from '../../utils/csvExport';
import {
  buildTeachersWorkloadReport,
  createDefaultSubstituteRuleConfig,
  dateToTimetableDay,
  normalizeTeacherKey,
  normalizeTimetableDay,
  PERIOD_TIME_RANGES,
  rankSubstituteCandidates,
  SCORING_PRIORITY_TIERS,
  splitSlotTeachers,
} from '../../utils/smartTimetableEngine';
import {
  DEFAULT_STAFF_TYPES,
  type TimetablePlanVersion,
  type TimetableStaffMember,
  type TimetableStaffTypeRecord,
  type UnscheduledLessonItem,
} from '../../utils/smartTimetableMasterEngine';
import { TimetableHubView } from '../timetable/TimetableHubView';
import { TimetableGridEditorView } from '../timetable/TimetableGridEditorView';
import { TimetableStaffDirectoryView } from '../timetable/TimetableStaffDirectoryView';

interface SmartTimetableLeaveModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type SmartSubTab =
  | 'hub'
  | 'grid_editor'
  | 'staff_dir'
  | 'overview'
  | 'calendar'
  | 'settings'
  | 'leaves';

const SUBJECT_BLOCK_STYLES = [
  'bg-orange-50 border-orange-200 text-orange-950',
  'bg-sky-50 border-sky-200 text-sky-950',
  'bg-purple-50 border-purple-200 text-purple-950',
  'bg-rose-50 border-rose-200 text-rose-950',
  'bg-emerald-50 border-emerald-200 text-emerald-950',
  'bg-indigo-50 border-indigo-200 text-indigo-950',
];

function subjectColorClass(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i += 1) hash = (hash * 31 + subject.charCodeAt(i)) % 997;
  return SUBJECT_BLOCK_STYLES[hash % SUBJECT_BLOCK_STYLES.length];
}

export const SmartTimetableLeaveModule: React.FC<SmartTimetableLeaveModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isLeadership = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const masterCfg = data.timetableMasterConfig;
  const serverRuleCfg =
    data.substituteRuleConfig || createDefaultSubstituteRuleConfig(data.activeSchool.id);
  const serverBands = data.capabilityBandConfig;
  const serverProfiles = data.teacherCapabilityProfiles || [];
  const covers = data.substitutionAssignments || [];
  const leaveRequests = data.teacherLeaveRequests || [];
  const leaveBalances = data.teacherLeaveBalances || [];

  const [subTab, setSubTab] = useState<SmartSubTab>(isLeadership ? 'hub' : 'leaves');
  const [activeReport, setActiveReport] = useState<'none' | 'workload' | 'teachers_fb' | 'rooms_fb'>(
    'none',
  );

  // TimetableMaster Interactive Hub, Grid Editor & Staff Directory State
  const [masterPlans, setMasterPlans] = useState<TimetablePlanVersion[]>([
    {
      id: 'plan-nov-2026',
      name: 'November 2026',
      versionLabel: 'v3',
      status: masterCfg?.publishState === 'draft' ? 'Draft' : 'Published',
      effectiveFrom: '2026-11-02',
      effectiveTo: '2027-01-31',
      updatedAt: '2 Nov 2026',
    },
    {
      id: 'plan-jul-20',
      name: 'July 20th Schedule',
      versionLabel: 'Draft 1',
      status: 'Draft',
      effectiveFrom: '2026-07-20',
      effectiveTo: '2026-10-31',
      updatedAt: '25 Sept 2026',
    },
  ]);
  const [activePlanId, setActivePlanId] = useState<string>('plan-nov-2026');
  const [editableSlots, setEditableSlots] = useState(() => data.timetable);
  const [pinnedSlotIds, setPinnedSlotIds] = useState<string[]>([]);
  const [lockedSlotIds, setLockedSlotIds] = useState<string[]>([]);
  const [unscheduledLessons, setUnscheduledLessons] = useState<UnscheduledLessonItem[]>(() => [
    {
      id: 'unsched-init-1',
      classSection: data.timetable[0]?.classSection || '10-A',
      subject: 'Political Science',
      teacherName: 'Radha',
      room: 'Room 12-Arts',
      periodsRemaining: 1,
      reason: '1 lesson waiting in Unscheduled tray — click to place or run Auto Generate',
    },
  ]);
  const [staffTypes, setStaffTypes] = useState<TimetableStaffTypeRecord[]>(DEFAULT_STAFF_TYPES);
  const [staffDirectory, setStaffDirectory] = useState<TimetableStaffMember[]>(() => {
    const palette = ['#4f46e5', '#0f766e', '#1d4ed8', '#9333ea', '#c2410c', '#be185d'];
    const names = Array.from(
      new Set([
        data.user.name,
        ...serverProfiles.map((p) => p.teacherName),
        ...data.timetable.flatMap((slot) => splitSlotTeachers(slot.teacherName)),
      ]),
    );
    return names.map((name, idx) => {
      const prof = serverProfiles.find(
        (p) => normalizeTeacherKey(p.teacherName) === normalizeTeacherKey(name),
      );
      const isAnand = name.toLowerCase().includes('anand');
      return {
        id: `dir-staff-${idx + 1}`,
        name,
        subtitle:
          idx === 0
            ? data.user.designation
            : prof?.qualifiedSubjects?.slice(0, 2).join(' · ') || 'Subject Teacher',
        email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@viratinternational.edu.in`,
        staffTypeIds: idx === 0 ? [] : ['st-teacher'],
        role: idx === 0 ? 'Owner' : 'Member',
        status: idx % 7 === 6 ? 'Awaiting Sign-Up' : 'Joined',
        includeInCover: prof ? prof.canSubstitute : true,
        workingHoursMode: isAnand ? 'Set Hours' : 'Full Time',
        timeOffPeriodsPerWeek: isAnand ? 36 : 0,
        avatarColor: palette[idx % palette.length],
      };
    });
  });

  // Calendar State
  const [selectedDate, setSelectedDate] = useState('2026-11-19');
  const [calendarScale, setCalendarScale] = useState<'Month' | 'Day'>('Day');
  const [calendarEntity, setCalendarEntity] = useState<'Teachers' | 'Classes' | 'Rooms'>('Teachers');
  const [calendarSearch, setCalendarSearch] = useState('');
  const [selectedAbsentForQuickAuto, setSelectedAbsentForQuickAuto] = useState('');

  // Custom Assignment Modal / Drawer State
  const [customSlotId, setCustomSlotId] = useState<string | null>(null);
  const [customSubTeacher, setCustomSubTeacher] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [draggedTeacherName, setDraggedTeacherName] = useState<string | null>(null);

  // Substitute Settings Local Draft State
  const [ruleDraft, setRuleDraft] = useState<SubstituteRuleConfig>(serverRuleCfg);
  const [bandDraft, setBandDraft] = useState<CapabilityBandConfig | undefined>(serverBands);
  const [teacherConfigSearch, setTeacherConfigSearch] = useState('');

  // Leave Application State
  const [leaveTeacherName, setLeaveTeacherName] = useState(data.user.name);
  const [leaveType, setLeaveType] = useState<TeacherLeaveType>('Casual Leave');
  const [leaveStart, setLeaveStart] = useState('2026-11-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-11-20');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDocRef, setLeaveDocRef] = useState('');

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeDay = dateToTimetableDay(selectedDate) || 'Thu';

  const allFacultyNames = useMemo(() => {
    const s = new Set<string>();
    for (const slot of data.timetable) {
      for (const t of splitSlotTeachers(slot.teacherName)) s.add(t);
    }
    for (const p of serverProfiles) s.add(p.teacherName);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [data.timetable, serverProfiles]);

  const allClasses = useMemo(
    () => Array.from(new Set(data.timetable.map((t) => t.classSection))).sort(),
    [data.timetable],
  );
  const allRooms = useMemo(
    () =>
      Array.from(
        new Set(data.timetable.map((t) => t.room || `Room ${t.classSection}`)),
      ).sort(),
    [data.timetable],
  );

  const daySlots = useMemo(
    () => data.timetable.filter((s) => normalizeTimetableDay(s.day) === activeDay),
    [data.timetable, activeDay],
  );

  const coversForDate = useMemo(
    () => covers.filter((c) => c.date === selectedDate),
    [covers, selectedDate],
  );

  const pendingPublishCoversCount = coversForDate.filter(
    (c) => c.publishStatus !== 'published' && c.substituteTeacherName,
  ).length;

  const workloadReport = useMemo(
    () => buildTeachersWorkloadReport(data.timetable, covers),
    [data.timetable, covers],
  );

  const customSlot = useMemo(
    () => data.timetable.find((s) => s.id === customSlotId) || null,
    [data.timetable, customSlotId],
  );

  const customCandidates = useMemo(() => {
    if (!customSlot || !serverBands) return [];
    const absentSet = new Set<string>(
      leaveRequests
        .filter((l) => l.status === 'Approved' && selectedDate >= l.startDate && selectedDate <= l.endDate)
        .map((l) => l.teacherName),
    );
    absentSet.add(customSlot.teacherName);
    return rankSubstituteCandidates({
      slot: customSlot,
      date: selectedDate,
      timetable: data.timetable,
      ruleConfig: serverRuleCfg,
      capabilityBands: serverBands,
      teacherProfiles: serverProfiles,
      existingCovers: covers,
      absentTeachersOnDate: absentSet,
    });
  }, [customSlot, serverBands, leaveRequests, selectedDate, data.timetable, serverRuleCfg, serverProfiles, covers]);

  function shiftDate(deltaDays: number) {
    const d = new Date(`${selectedDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + deltaDays);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  async function handlePublishToggle(nextState: 'draft' | 'published') {
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/timetable/publish-toggle',
        { method: 'POST', body: JSON.stringify({ publishState: nextState }) },
        token,
      );
      await onRefresh();
      setFeedback(
        nextState === 'published'
          ? 'Timetable published and Capability Bands refreshed.'
          : 'Timetable unpublished for draft edits.',
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update publish status.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRunAutoAssign() {
    setBusy(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const res = await apiRequest<{
        generatedCovers: SubstitutionAssignmentRecord[];
        preservedManualLocks: number;
        unassignedCount: number;
      }>(
        '/api/timetable/auto-assign',
        {
          method: 'POST',
          body: JSON.stringify({
            date: selectedDate,
            absentTeachers: selectedAbsentForQuickAuto ? [selectedAbsentForQuickAuto] : [],
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback(
        `Auto-Assign queued ${res.generatedCovers.length} cover recommendation(s) in Pending Review (preserved ${res.preservedManualLocks} manual lock(s), ${res.unassignedCount} unassigned). Review and click "Publish Cover Plan" to activate.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Auto-Assign failed.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveCustomAssign(e?: React.FormEvent, overrideTeacher?: string, overrideSlotId?: string, overrideReason?: string) {
    if (e) e.preventDefault();
    const targetSlotId = overrideSlotId || customSlotId;
    const targetTeacher = (overrideTeacher || customSubTeacher).trim();
    const targetReason = (overrideReason || customReason).trim();
    if (!targetSlotId || !targetTeacher || !targetReason) {
      setErrorMsg('Substitute teacher and assignment reason are required for custom overrides.');
      return;
    }
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/timetable/custom-assign',
        {
          method: 'POST',
          body: JSON.stringify({
            date: selectedDate,
            slotId: targetSlotId,
            substituteTeacherName: targetTeacher,
            reason: targetReason,
          }),
        },
        token,
      );
      await onRefresh();
      setCustomSlotId(null);
      setCustomSubTeacher('');
      setCustomReason('');
      setFeedback(
        `Custom assignment locked for ${targetTeacher} (protected from automatic overwrite). Publish Cover Plan when ready to notify.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save custom assignment.');
    } finally {
      setBusy(false);
    }
  }

  async function handlePublishCovers() {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ publishedCount: number }>(
        '/api/timetable/publish-covers',
        { method: 'POST', body: JSON.stringify({ date: selectedDate }) },
        token,
      );
      await onRefresh();
      setFeedback(
        `Published ${res.publishedCount} daily substitute cover(s) for ${selectedDate} and dispatched notifications to assigned teachers.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to publish covers.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSubstituteSettings() {
    setBusy(true);
    setErrorMsg(null);
    try {
      await apiRequest(
        '/api/timetable/substitute-settings',
        {
          method: 'PUT',
          body: JSON.stringify({
            ruleConfig: ruleDraft,
            capabilityBands: bandDraft,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedback('Saved Substitute Scoring Priorities, Eligibility Rules, and Capability Bands.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save settings.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRecomputeBands(targetLevels: number) {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{ capabilityBands: CapabilityBandConfig }>(
        '/api/timetable/recompute-bands',
        { method: 'POST', body: JSON.stringify({ targetLevelCount: targetLevels }) },
        token,
      );
      setBandDraft(res.capabilityBands);
      await onRefresh();
      setFeedback(`Recomputed Capability Bands (${targetLevels} levels, separation score ${res.capabilityBands.separationScore}).`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to recompute bands.');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleTeacherProfile(profile: TeacherCapabilityProfile, patch: Partial<TeacherCapabilityProfile>) {
    setBusy(true);
    try {
      await apiRequest(
        '/api/timetable/substitute-settings',
        {
          method: 'PUT',
          body: JSON.stringify({ teacherProfile: { ...profile, ...patch } }),
        },
        token,
      );
      await onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleAddTeacherToSettings(teacherName: string) {
    if (!teacherName) return;
    const code = teacherName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
    const newProf: TeacherCapabilityProfile = {
      id: `tcp-${Date.now().toString(36)}`,
      schoolId: data.activeSchool.id,
      teacherName,
      teacherCode: code || 'TCH',
      canSubstitute: true,
      workingHoursLabel: 'Full time',
      availableFromPeriod: 1,
      availableToPeriod: 8,
      maxPeriodsPerDay: 8,
      maxConsecutivePeriods: null,
      maxSubstitutesPerDay: 3,
      maxSubstitutesPerWeek: 10,
      autoAssignAllowed: true,
      crossLevelEligible: false,
      qualifiedSubjects: [],
    };
    await handleToggleTeacherProfile(newProf, {});
    setTeacherConfigSearch('');
    setFeedback(`Added ${teacherName} to per-teacher substitution settings.`);
  }

  async function handleSubmitLeave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!leaveReason.trim()) {
      setErrorMsg('Please enter a leave reason.');
      return;
    }
    setBusy(true);
    try {
      await apiRequest(
        '/api/leaves',
        {
          method: 'POST',
          body: JSON.stringify({
            teacherName: isLeadership ? leaveTeacherName : data.user.name,
            leaveType,
            startDate: leaveStart,
            endDate: leaveEnd,
            reason: leaveReason,
            supportingDocRef: leaveDocRef,
          }),
        },
        token,
      );
      setLeaveReason('');
      setLeaveDocRef('');
      await onRefresh();
      setFeedback('Leave application submitted and awaiting Principal/Coordinator review.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to submit leave.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLeaveDecision(leaveId: string, status: 'Approved' | 'Rejected') {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await apiRequest<{
        leave: { teacherName: string; startDate: string };
        generatedCovers: SubstitutionAssignmentRecord[];
        preservedManualLocks: number;
      }>(
        `/api/leaves/${leaveId}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({
            status,
            reviewNote:
              status === 'Approved'
                ? 'Approved with automatic vacant-period recommendations queued for review.'
                : 'Leave could not be accommodated on requested date.',
          }),
        },
        token,
      );
      await onRefresh();
      if (status === 'Approved') {
        setSelectedDate(res.leave.startDate);
        setFeedback(
          `Approved ${res.leave.teacherName}’s leave. Detected affected periods and queued ${res.generatedCovers.length} draft cover(s) in Pending Review (not auto-published).`,
        );
      } else {
        setFeedback(`Marked ${res.leave.teacherName}’s leave request as Rejected.`);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update leave status.');
    } finally {
      setBusy(false);
    }
  }

  function handleExportTimetableCsv() {
    const headers = ['Date', 'Day', 'Period', 'Time', 'Class', 'Subject', 'Regular Teacher', 'Substitute', 'Status', 'Mode'];
    const rows = daySlots.map((slot) => {
      const cov = coversForDate.find((c) => c.slotId === slot.id);
      return [
        selectedDate,
        slot.day,
        String(slot.period),
        PERIOD_TIME_RANGES[slot.period] || '',
        slot.classSection,
        slot.subject,
        slot.teacherName,
        cov?.substituteTeacherName || slot.substitutionTeacher || '—',
        cov ? cov.publishStatus : 'regular',
        cov ? cov.assignmentMode : 'scheduled',
      ];
    });
    triggerCsvDownload(`virat-timetable-${selectedDate}.csv`, headers, rows);
  }

  const filteredCalendarRows = useMemo(() => {
    const q = calendarSearch.trim().toLowerCase();
    if (calendarEntity === 'Teachers') {
      return allFacultyNames.filter((n) => !q || n.toLowerCase().includes(q));
    }
    if (calendarEntity === 'Classes') {
      return allClasses.filter((c) => !q || c.toLowerCase().includes(q));
    }
    return allRooms.filter((r) => !q || r.toLowerCase().includes(q));
  }, [calendarEntity, calendarSearch, allFacultyNames, allClasses, allRooms]);

  const activeBands = bandDraft || serverBands;

  return (
    <div className="space-y-5">
      {/* Top Sub-Navigation Bar */}
      <div className="border-b border-slate-200 pb-4 space-y-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-900" />
            Smart Timetable, Auto-Substitution &amp; Teacher Leave
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {masterCfg?.title || 'Master Schedule'} · Vacant-period auto-assignment, manual lock overrides, capability bands &amp; leave-to-cover governance.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {isLeadership && (
            <>
              <button
                type="button"
                onClick={() => setSubTab('hub')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  subTab === 'hub' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timetables Hub
              </button>
              <button
                type="button"
                onClick={() => setSubTab('grid_editor')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  subTab === 'grid_editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid Editor &amp; Workload
              </button>
              <button
                type="button"
                onClick={() => setSubTab('staff_dir')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  subTab === 'staff_dir' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff &amp; Staff Types ({staffDirectory.length})
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setSubTab('calendar')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subTab === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calendar &amp; Covers
          </button>
          {isLeadership && (
            <button
              type="button"
              onClick={() => setSubTab('settings')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                subTab === 'settings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Substitute Settings
            </button>
          )}
          <button
            type="button"
            onClick={() => setSubTab('leaves')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subTab === 'leaves' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teacher Leave ({leaveRequests.filter((l) => l.status === 'Pending').length} pending)
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-900 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TIMETABLEMASTER HUB VIEW (Home/Needs You + Shared Org Data + Published Timeline + Drafts) */}
      {subTab === 'hub' && isLeadership && (
        <TimetableHubView
          userName={data.user.name}
          userRoleLabel={data.user.role === 'super_admin' || data.user.role === 'school_admin' ? 'Owner' : data.user.designation}
          schoolName={data.activeSchool.name}
          pendingLeaves={leaveRequests.filter((l) => l.status === 'Pending')}
          myUpcomingLeaves={leaveRequests.filter(
            (l) => normalizeTeacherKey(l.teacherName) === normalizeTeacherKey(data.user.name),
          )}
          staffCount={staffDirectory.length}
          classCount={allClasses.length}
          subjectCount={new Set(editableSlots.map((s) => s.subject)).size}
          roomCount={allRooms.length}
          plans={masterPlans}
          onOpenStaffDirectory={() => setSubTab('staff_dir')}
          onOpenGridEditor={(planId) => {
            setActivePlanId(planId);
            setSubTab('grid_editor');
          }}
          onOpenLeaveApprovals={() => setSubTab('leaves')}
          onOpenApplyLeave={() => setSubTab('leaves')}
          onTogglePublishPlan={(planId) => {
            setMasterPlans((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' }
                  : p,
              ),
            );
            setFeedback('Updated timetable publish status.');
          }}
          onCreatePlan={(name) => {
            const created: TimetablePlanVersion = {
              id: `plan-${Date.now().toString(36)}`,
              name,
              versionLabel: 'v1',
              status: 'Draft',
              effectiveFrom: '2026-12-01',
              effectiveTo: '2027-03-31',
              updatedAt: 'Today',
            };
            setMasterPlans((prev) => [...prev, created]);
            setActivePlanId(created.id);
            setFeedback(`Created draft timetable "${name}".`);
          }}
          onSharePlan={(plan) => {
            setFeedback(`Share link prepared for "${plan.name}" (${plan.status}) — faculty & classes notified.`);
          }}
        />
      )}

      {/* INTERACTIVE GRID EDITOR, AUTO-GENERATOR & DETAILED WORKLOAD ANALYSIS */}
      {subTab === 'grid_editor' && isLeadership && (
        <TimetableGridEditorView
          planName={masterPlans.find((p) => p.id === activePlanId)?.name || 'Master Timetable'}
          schoolId={data.activeSchool.id}
          slots={editableSlots}
          staffMembers={staffDirectory}
          unscheduledLessons={unscheduledLessons}
          pinnedSlotIds={pinnedSlotIds}
          lockedSlotIds={lockedSlotIds}
          onUpdateSlots={setEditableSlots}
          onUpdateUnscheduled={setUnscheduledLessons}
          onTogglePin={(id) =>
            setPinnedSlotIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onToggleLock={(id) =>
            setLockedSlotIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onBackToHub={() => setSubTab('hub')}
        />
      )}

      {/* STAFF DIRECTORY, STAFF TYPES & EDIT STAFF SLIDE-OVER DRAWER */}
      {subTab === 'staff_dir' && isLeadership && (
        <TimetableStaffDirectoryView
          staffMembers={staffDirectory}
          staffTypes={staffTypes}
          onSaveStaffMember={(updated) => {
            setStaffDirectory((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            );
            setFeedback(`Saved timetable & cover settings for ${updated.name}.`);
          }}
          onAddStaffMember={(created) => {
            setStaffDirectory((prev) => [...prev, created]);
            setFeedback(`Added ${created.name} to Staff Directory.`);
          }}
          onDeleteStaffMember={(id) => {
            setStaffDirectory((prev) => prev.filter((m) => m.id !== id));
            setFeedback('Removed staff member from timetable directory.');
          }}
          onAddStaffType={(st) => {
            setStaffTypes((prev) => [...prev, st]);
            setFeedback(`Added Staff Type "${st.name} (${st.shortCode})".`);
          }}
        />
      )}

      {/* ====================================================================
          TAB 1: TIMETABLE OVERVIEW (Matches Reference Screenshot)
      ==================================================================== */}
      {subTab === 'overview' && isLeadership && (
        <div className="space-y-5">
          {/* Published Lock Banner */}
          <div
            className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
              masterCfg?.publishState === 'published'
                ? 'border-amber-200 bg-amber-50/80 text-amber-950'
                : 'border-blue-200 bg-blue-50 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {masterCfg?.publishState === 'published' ? (
                <>
                  <Lock className="h-4 w-4 text-amber-700" />
                  <span>This timetable is published. Unpublish to make structural changes.</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-blue-900" />
                  <span>Draft mode active — review changes and click Publish Timetable when ready.</span>
                </>
              )}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void handlePublishToggle(
                  masterCfg?.publishState === 'published' ? 'draft' : 'published',
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
            >
              {masterCfg?.publishState === 'published' ? 'Unpublish Timetable' : 'Publish Timetable'}
            </button>
          </div>

          {/* Your Timetable Hero Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Your Timetable — {masterCfg?.title}</h2>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Auto Generated · {masterCfg?.publishedAt}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-slate-900">All Lessons Scheduled!</p>
                <span className="text-xs text-slate-500">
                  {masterCfg?.workingDays.join('–')} · {masterCfg?.schoolStartTime}–{masterCfg?.schoolEndTime} · {masterCfg?.periodDurationMins} min periods
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-3xl font-extrabold text-emerald-700 tabular-nums">
                      {data.timetable.length}
                    </p>
                    <p className="text-xs font-semibold text-slate-700">Lessons Scheduled</p>
                    <p className="text-[11px] text-slate-500">{data.timetable.length} periods across {allClasses.length} classes</p>
                  </div>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-3xl font-extrabold text-indigo-700 tabular-nums">100%</p>
                    <p className="text-xs font-semibold text-slate-700">All Lessons Scheduled</p>
                    <p className="text-[11px] text-slate-500">
                      Assembly {masterCfg?.assemblySlot} · Break {masterCfg?.breakSlot}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSubTab('calendar')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <Eye className="h-4 w-4" />
                  Open Timetable Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setSubTab('settings')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-blue-900" />
                  Configure Substitute Rules &amp; Bands
                </button>
              </div>
            </div>
          </div>

          {/* Reports Row */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Timetable Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'workload' as const,
                  title: 'Teachers Workload',
                  desc: 'What each teacher teaches — subject, class, regular periods & covers per week',
                },
                {
                  id: 'teachers_fb' as const,
                  title: 'Teachers Free & Busy',
                  desc: `When each teacher is teaching and when they are free on ${activeDay}`,
                },
                {
                  id: 'rooms_fb' as const,
                  title: 'Rooms Free & Busy',
                  desc: `When each room/lab is occupied and free across ${activeDay} periods 1–8`,
                },
              ].map((rep) => (
                <button
                  key={rep.id}
                  type="button"
                  onClick={() => setActiveReport(activeReport === rep.id ? 'none' : rep.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    activeReport === rep.id
                      ? 'border-blue-900 bg-blue-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{rep.title}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{rep.desc}</p>
                </button>
              ))}
            </div>

            {activeReport === 'workload' && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                      <th className="py-2">Teacher</th>
                      <th className="py-2 text-right">Weekly Periods</th>
                      <th className="py-2 text-right">Free Periods</th>
                      <th className="py-2 text-right">Subs Taken</th>
                      <th className="py-2">Busiest Day</th>
                      <th className="py-2">Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workloadReport.map((r) => (
                      <tr key={r.teacherName}>
                        <td className="py-2 font-semibold text-slate-900">{r.teacherName}</td>
                        <td className="py-2 text-right font-mono font-bold text-blue-900">{r.weeklyPeriods}</td>
                        <td className="py-2 text-right font-mono text-slate-600">{r.freePeriodsWeekly}</td>
                        <td className="py-2 text-right font-mono text-emerald-700">{r.substitutesTaken}</td>
                        <td className="py-2 text-slate-700">{r.busiestDay}</td>
                        <td className="py-2 text-slate-600">{r.subjects.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'teachers_fb' && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                      <th className="py-2">Teacher ({activeDay})</th>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                        <th key={p} className="py-2 text-center font-mono">P{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allFacultyNames.slice(0, 18).map((tName) => (
                      <tr key={tName}>
                        <td className="py-1.5 font-semibold text-slate-900 whitespace-nowrap pr-3">{tName}</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                          const s = daySlots.find(
                            (sl) => sl.period === p && splitSlotTeachers(sl.teacherName).includes(tName),
                          );
                          return (
                            <td key={p} className="py-1.5 px-1 text-center">
                              {s ? (
                                <span className="inline-block rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-900">
                                  {s.classSection}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-medium">Free</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeReport === 'rooms_fb' && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                      <th className="py-2">Room / Lab ({activeDay})</th>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                        <th key={p} className="py-2 text-center font-mono">P{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allRooms.slice(0, 18).map((rm) => (
                      <tr key={rm}>
                        <td className="py-1.5 font-semibold text-slate-900 whitespace-nowrap pr-3">{rm}</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                          const s = daySlots.find(
                            (sl) => sl.period === p && (sl.room || `Room ${sl.classSection}`) === rm,
                          );
                          return (
                            <td key={p} className="py-1.5 px-1 text-center">
                              {s ? (
                                <span className="inline-block rounded bg-slate-100 border border-slate-300 px-1.5 py-0.5 text-[10px] font-semibold text-slate-800">
                                  {s.classSection}
                                </span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-medium">Open</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: INTERACTIVE CALENDAR, AUTO-ASSIGN & CUSTOM OVERRIDE LOCK
      ==================================================================== */}
      {subTab === 'calendar' && (
        <div className="space-y-5">
          {/* Calendar Toolbar matching Reference Screenshot */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous day"
                  onClick={() => shiftDate(-1)}
                  className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  aria-label="Timetable date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono font-semibold text-slate-900"
                />
                <button
                  type="button"
                  aria-label="Next day"
                  onClick={() => shiftDate(1)}
                  className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-blue-900 ml-1">{activeDay}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  {(['Month', 'Day'] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => setCalendarScale(sc)}
                      className={`rounded-md px-3 py-1 font-semibold ${
                        calendarScale === sc ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  {(['Teachers', 'Classes', 'Rooms'] as const).map((ent) => (
                    <button
                      key={ent}
                      type="button"
                      onClick={() => setCalendarEntity(ent)}
                      className={`rounded-md px-3 py-1 font-semibold ${
                        calendarEntity === ent ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      {ent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <input
                type="text"
                aria-label="Search timetable entity"
                value={calendarSearch}
                onChange={(e) => setCalendarSearch(e.target.value)}
                placeholder={`Search ${calendarEntity.toLowerCase()}...`}
                className="w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />

              <div className="flex flex-wrap items-center gap-2">
                {isLeadership && (
                  <>
                    <select
                      aria-label="Optional absent teacher for auto-assign"
                      value={selectedAbsentForQuickAuto}
                      onChange={(e) => setSelectedAbsentForQuickAuto(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">Absent: Approved Leaves Only</option>
                      {allFacultyNames.map((fn) => (
                        <option key={fn} value={fn}>
                          + Mark Absent: {fn}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRunAutoAssign()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Auto-Assign
                    </button>
                    {pendingPublishCoversCount > 0 && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handlePublishCovers()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publish Cover Plan ({pendingPublishCoversCount})
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={handleExportTimetableCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Vacant Periods & Drag-and-Drop / Custom Override Panel */}
          {isLeadership && coversForDate.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Vacant Period Cover Queue — {selectedDate} ({coversForDate.length} period{coversForDate.length > 1 ? 's' : ''})
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Drag any free teacher chip below onto a vacant card for quick Custom Override, or click &quot;Custom Assign&quot; to inspect ranked Tier 1–6 candidates and conflict warnings. Manually locked covers are never overwritten by Auto-Assign.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-700">
                  Published: {coversForDate.filter((c) => c.publishStatus === 'published').length}/{coversForDate.length}
                </span>
              </div>

              {/* Draggable Available Faculty Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-600 mr-1">Drag to assign:</span>
                {allFacultyNames.slice(0, 12).map((fn) => (
                  <span
                    key={fn}
                    draggable
                    onDragStart={() => setDraggedTeacherName(fn)}
                    onDragEnd={() => setDraggedTeacherName(null)}
                    className="cursor-grab rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 hover:border-blue-900"
                  >
                    {fn}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {coversForDate.map((cov) => (
                  <div
                    key={cov.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedTeacherName) {
                        void handleSaveCustomAssign(
                          undefined,
                          draggedTeacherName,
                          cov.slotId,
                          `Coordinator drag-and-drop override (${selectedDate})`,
                        );
                        setDraggedTeacherName(null);
                      }
                    }}
                    className={`rounded-lg border bg-white p-3 space-y-2 ${
                      !cov.substituteTeacherName
                        ? 'border-rose-300'
                        : cov.manuallyApproved
                          ? 'border-blue-400'
                          : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        P{cov.period} · Class {cov.classSection} ({cov.subject})
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-slate-600">
                        {cov.publishStatus === 'published' ? 'Published' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Absent: <strong>{cov.absentTeacherName}</strong> → Cover:{' '}
                      <strong className={cov.substituteTeacherName ? 'text-blue-900' : 'text-rose-700'}>
                        {cov.substituteTeacherName || 'UNASSIGNED'}
                      </strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {cov.manuallyApproved ? '🔒 Manually Locked Override · ' : ''}
                      {cov.matchTier ? `Tier ${cov.matchTier}: ` : ''}
                      {cov.matchTierLabel}
                    </p>
                    {cov.ruleWarnings.length > 0 && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 rounded px-2 py-1">
                        ⚠ {cov.ruleWarnings[0]}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-500 truncate max-w-[160px]" title={cov.reason}>
                        {cov.reason}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSlotId(cov.slotId);
                          setCustomSubTeacher(cov.substituteTeacherName || '');
                          setCustomReason(cov.manuallyApproved ? cov.reason : '');
                        }}
                        className="text-[11px] font-semibold text-blue-900 hover:underline whitespace-nowrap"
                      >
                        Custom Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day Timeline Matrix OR Month Summary */}
          {calendarScale === 'Day' ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto relative">
              <table className="w-full min-w-[920px] text-xs border-collapse">
                <thead>
                  <tr className="bg-indigo-50/70 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-4 text-left font-bold w-48">{calendarEntity.slice(0, -1)}</th>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                      <th key={p} className="py-3 px-2 text-center font-mono text-[11px]">
                        <div>P{p}</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          {PERIOD_TIME_RANGES[p]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalendarRows.slice(0, 22).map((rowKey) => {
                    const rowSlots = daySlots.filter((s) => {
                      if (calendarEntity === 'Teachers') {
                        return splitSlotTeachers(s.teacherName).some(
                          (t) => normalizeTeacherKey(t) === normalizeTeacherKey(rowKey),
                        );
                      }
                      if (calendarEntity === 'Classes') return s.classSection === rowKey;
                      return (s.room || `Room ${s.classSection}`) === rowKey;
                    });

                    return (
                      <tr key={rowKey} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 align-top">
                          <p className="font-bold text-slate-900">{rowKey}</p>
                          <p className="text-[11px] text-slate-500">{rowSlots.length} periods</p>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                          const slot = rowSlots.find((s) => s.period === p);
                          const cover = slot
                            ? coversForDate.find((c) => c.slotId === slot.id)
                            : undefined;
                          return (
                            <td key={p} className="p-1.5 align-top">
                              {slot ? (
                                <button
                                  type="button"
                                  disabled={!isLeadership}
                                  onClick={() => {
                                    if (!isLeadership) return;
                                    setCustomSlotId(slot.id);
                                    setCustomSubTeacher(cover?.substituteTeacherName || '');
                                    setCustomReason(cover?.reason || '');
                                  }}
                                  className={`w-full text-left rounded-lg border p-2 transition-shadow hover:shadow-xs ${subjectColorClass(
                                    slot.subject,
                                  )}`}
                                >
                                  <p className="font-bold text-[11px] truncate">{slot.subject}</p>
                                  <p className="text-[10px] opacity-85 truncate">
                                    {calendarEntity === 'Classes' ? slot.teacherName : slot.classSection}
                                  </p>
                                  <p className="font-mono text-[9px] opacity-70 mt-0.5">
                                    {PERIOD_TIME_RANGES[p]}
                                  </p>
                                  {cover && (
                                    <p className="mt-1 rounded bg-white/90 px-1 py-0.5 text-[9px] font-bold text-blue-900 truncate">
                                      {cover.manuallyApproved ? '🔒 ' : 'Sub: '}
                                      {cover.substituteTeacherName || 'Vacant'}
                                    </p>
                                  )}
                                </button>
                              ) : (
                                <div className="h-14 rounded-lg border border-dashed border-slate-100" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Schedule &amp; Leave Overlay — November 2026
              </h3>
              <div className="grid grid-cols-7 gap-2 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center font-bold text-slate-500 py-1">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1;
                  const iso = `2026-11-${String(dayNum).padStart(2, '0')}`;
                  const dayCovers = covers.filter((c) => c.date === iso).length;
                  const dayLeaves = leaveRequests.filter(
                    (l) => l.status !== 'Rejected' && iso >= l.startDate && iso <= l.endDate,
                  ).length;
                  const isSel = iso === selectedDate;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => {
                        setSelectedDate(iso);
                        setCalendarScale('Day');
                      }}
                      className={`rounded-lg border p-2 text-left min-h-[68px] transition-colors ${
                        isSel
                          ? 'border-blue-900 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-mono font-bold text-slate-900">{dayNum}</p>
                      {dayLeaves > 0 && (
                        <p className="text-[10px] text-amber-800 font-semibold mt-1">
                          {dayLeaves} leave(s)
                        </p>
                      )}
                      {dayCovers > 0 && (
                        <p className="text-[10px] text-blue-900 font-semibold">
                          {dayCovers} cover(s)
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Override Modal */}
          {customSlot && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Custom substitute assignment"
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            >
              <form
                onSubmit={(e) => void handleSaveCustomAssign(e)}
                className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 space-y-4 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Custom Substitute Override — Class {customSlot.classSection} ({customSlot.subject})
                    </h3>
                    <p className="text-xs text-slate-600">
                      {selectedDate} · {customSlot.day} Period {customSlot.period} · Regular: {customSlot.teacherName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomSlotId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    Ranked Manual Suggestions (Matches First · Rule-Breakers Flagged)
                  </p>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                    {customCandidates.slice(0, 14).map((cand) => {
                      const selected =
                        normalizeTeacherKey(customSubTeacher) === normalizeTeacherKey(cand.teacherName);
                      return (
                        <button
                          key={cand.teacherName}
                          type="button"
                          onClick={() => setCustomSubTeacher(cand.teacherName)}
                          className={`w-full text-left px-3 py-2 flex items-start justify-between gap-2 text-xs ${
                            selected ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900">
                              {cand.teacherName}{' '}
                              <span className="font-mono text-[10px] text-blue-900">
                                Tier {cand.matchTier}
                              </span>
                            </p>
                            <p className="text-[11px] text-slate-600">{cand.matchTierLabel}</p>
                            {cand.ruleWarnings.length > 0 && (
                              <p className="text-[10px] text-amber-800 mt-0.5">
                                ⚠ {cand.ruleWarnings.join(' · ')}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            Day {cand.dailyPeriodsBefore}p · Sub {cand.dailySubsBefore}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="custom-reason-input" className="block text-xs font-semibold text-slate-800 mb-1">
                    Assignment Reason (Required — Logged in Audit Trail &amp; Locks Manual Override)
                  </label>
                  <input
                    id="custom-reason-input"
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="e.g., Coordinator assigned homeroom teacher for exam revision"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCustomSlotId(null)}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !customSubTeacher}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    Lock Custom Override
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3: SUBSTITUTE SETTINGS (Exact Parity with User's 4 Screenshots)
      ==================================================================== */}
      {subTab === 'settings' && isLeadership && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Substitute Settings</h2>
              <p className="text-xs text-slate-600">
                Configure auto-substitute rules, workload tie-breakers, teacher eligibility, working hours &amp; capability bands.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRuleDraft(createDefaultSubstituteRuleConfig(data.activeSchool.id))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSaveSubstituteSettings()}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* 1. Scoring Priorities & Tie-Breakers */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              Scoring Priorities
            </h3>
            <p className="text-xs text-slate-600">
              Suggestions are ranked by how well each teacher matches the lesson, best first:
            </p>
            <ol className="space-y-1.5 text-xs text-slate-800">
              {SCORING_PRIORITY_TIERS.map((t) => (
                <li key={t.tier} className="flex items-center gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[11px] font-bold inline-flex items-center justify-center">
                    {t.tier}
                  </span>
                  <span>{t.label}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-slate-500">
              This order is fixed. The balancing factors below only break ties between teachers at the same level of match.
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-900">Tie-breakers (how to spread the load)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(
                  [
                    ['dailyWorkloadBalance', 'Daily Workload Balance', 'Avoid overloading teachers on the same day'],
                    ['weeklyWorkloadBalance', 'Weekly Workload Balance', 'Distribute workload evenly across the week'],
                    ['dailySubstituteBalance', 'Daily Substitute Balance', 'Spread substitute duties across teachers each day'],
                    ['weeklySubstituteBalance', 'Weekly Substitute Balance', 'Balance substitute assignments over the week'],
                  ] as const
                ).map(([key, label, hint]) => (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{label}</span>
                      <span className="text-[11px] font-semibold capitalize text-indigo-700">
                        {ruleDraft.tieBreakers[key]}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['off', 'low', 'medium', 'high'] as BalanceWeight[]).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() =>
                            setRuleDraft((p) => ({
                              ...p,
                              tieBreakers: { ...p.tieBreakers, [key]: w },
                            }))
                          }
                          className={`rounded-lg border py-1.5 text-xs font-semibold capitalize transition-colors ${
                            ruleDraft.tieBreakers[key] === w
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">{hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Eligibility Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Eligibility Rules</h3>
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs text-blue-950">
              <strong>Auto-assign</strong> enforces these rules. <strong>Manual suggestions</strong> always show everyone, with matches first and rule-breakers flagged, so a <strong>Restrict</strong> rule excludes a teacher from auto-assign but still shows them (flagged) in suggestions.
            </div>
            <div className="divide-y divide-slate-100">
              {(
                [
                  ['maxConsecutivePeriods', 'Max consecutive periods', 'Back-to-back periods a substitute may be pushed into.'],
                  ['maxPeriodsPerDay', 'Max periods per day', 'Total teaching + substitute periods a teacher can have in a day.'],
                  ['maxSubstitutesPerDay', 'Max substitutes per day', 'Substitute assignments a teacher can take in a day.'],
                  ['maxSubstitutesPerWeek', 'Max substitutes per week', 'Substitute assignments a teacher can take in a week.'],
                ] as const
              ).map(([key, label, hint]) => {
                const rule = ruleDraft.eligibility[key];
                return (
                  <div key={key} className="py-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
                    <div className="md:col-span-5">
                      <p className="text-xs font-bold text-slate-900">{label}</p>
                      <p className="text-[11px] text-slate-500">{hint}</p>
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        placeholder="no limit"
                        value={rule.limit ?? ''}
                        onChange={(e) =>
                          setRuleDraft((p) => ({
                            ...p,
                            eligibility: {
                              ...p.eligibility,
                              [key]: {
                                ...rule,
                                limit: e.target.value ? Number(e.target.value) : null,
                              },
                            },
                          }))
                        }
                        className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="md:col-span-4 flex flex-col items-start md:items-end gap-1">
                      <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                        {(['off', 'prefer', 'restrict'] as EnforcementMode[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() =>
                              setRuleDraft((p) => ({
                                ...p,
                                eligibility: {
                                  ...p.eligibility,
                                  [key]: { ...rule, enforcement: mode },
                                },
                              }))
                            }
                            className={`px-3 py-1 font-semibold capitalize ${
                              rule.enforcement === mode
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {rule.enforcement === 'restrict'
                          ? 'Auto: Excluded · Suggestions: Flagged'
                          : rule.enforcement === 'prefer'
                            ? 'Auto: Ranked last · Suggestions: Flagged, ranked last'
                            : 'Rule ignored'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Working Hours & Teachers Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  Working Hours &amp; Teachers Settings ({serverProfiles.length} configured)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Teachers use the default limits above unless individually configured. Outside working hours they are never auto-assigned.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  aria-label="Add teacher to settings"
                  value={teacherConfigSearch}
                  onChange={(e) => {
                    setTeacherConfigSearch(e.target.value);
                    if (e.target.value) void handleAddTeacherToSettings(e.target.value);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                >
                  <option value="">Search teachers to configure...</option>
                  {allFacultyNames
                    .filter(
                      (fn) =>
                        !serverProfiles.some(
                          (p) => normalizeTeacherKey(p.teacherName) === normalizeTeacherKey(fn),
                        ),
                    )
                    .map((fn) => (
                      <option key={fn} value={fn}>
                        {fn}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                    <th className="py-2">TEACHERS</th>
                    <th className="py-2 text-center">CAN SUB</th>
                    <th className="py-2">WORKING HOURS</th>
                    <th className="py-2 text-center">PERIODS/DAY</th>
                    <th className="py-2 text-center">SUBS/DAY</th>
                    <th className="py-2 text-center">SUBS/WEEK</th>
                    <th className="py-2 text-center">AUTO-ASSIGN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serverProfiles.map((prof) => (
                    <tr key={prof.id}>
                      <td className="py-2.5">
                        <p className="font-bold text-slate-900">{prof.teacherName}</p>
                        <p className="font-mono text-[10px] text-slate-500">{prof.teacherCode}</p>
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            void handleToggleTeacherProfile(prof, { canSubstitute: !prof.canSubstitute })
                          }
                          aria-label={`Toggle can substitute for ${prof.teacherName}`}
                          className={`h-6 w-6 rounded-full font-bold text-xs inline-flex items-center justify-center ${
                            prof.canSubstitute
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {prof.canSubstitute ? '✓' : '×'}
                        </button>
                      </td>
                      <td className="py-2.5 text-slate-700">{prof.workingHoursLabel}</td>
                      <td className="py-2.5 text-center font-mono">{prof.maxPeriodsPerDay ?? '—'}</td>
                      <td className="py-2.5 text-center font-mono">{prof.maxSubstitutesPerDay ?? '—'}</td>
                      <td className="py-2.5 text-center font-mono">{prof.maxSubstitutesPerWeek ?? '—'}</td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            void handleToggleTeacherProfile(prof, {
                              autoAssignAllowed: !prof.autoAssignAllowed,
                            })
                          }
                          className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                            prof.autoAssignAllowed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {prof.autoAssignAllowed ? 'Allowed' : 'Paused'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Capability Bands */}
          {activeBands && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Grid2x2 className="h-4 w-4 text-indigo-600" />
                    Capability Bands
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Classes staffed by the same core teachers are grouped into levels, derived automatically from your timetable. Substitutes are preferred from the same level.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Levels:</span>
                  {[2, 3, 4, 5, 6].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRecomputeBands(cnt)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-mono font-bold ${
                        activeBands.targetLevelCount === cnt
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cnt === 5 ? `Auto (5) ★ ${activeBands.separationScore}` : cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeBands.bands.map((band) => (
                  <div key={band.level} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
                    <p className="text-xs font-bold text-slate-900">
                      {band.label} · <span className="font-normal text-slate-500">{band.classes.length} classes</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {band.classes.map((cls) => (
                        <span
                          key={cls}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Cross-level teachers <span className="font-normal text-slate-500">(usable across all levels)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeBands.crossLevelTeachers.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-950"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 4: TEACHER LEAVE MANAGEMENT & LEAVE-TO-AUTO-SUBSTITUTE CASCADE
      ==================================================================== */}
      {subTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Leave Application Form + Leave Balance */}
          <div className="lg:col-span-5 space-y-4">
            <form
              onSubmit={handleSubmitLeave}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-900" />
                Submit Teacher Leave Request
              </h2>
              {isLeadership && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teacher</label>
                  <select
                    aria-label="Leave applicant teacher"
                    value={leaveTeacherName}
                    onChange={(e) => setLeaveTeacherName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  >
                    {allFacultyNames.map((fn) => (
                      <option key={fn} value={fn}>
                        {fn}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Leave Type</label>
                  <select
                    aria-label="Leave type"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as TeacherLeaveType)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Medical Leave">Medical Leave</option>
                    <option value="Earned Leave">Earned Leave</option>
                    <option value="Official Duty">Official Duty</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Supporting Doc Ref (Optional)
                  </label>
                  <input
                    type="text"
                    value={leaveDocRef}
                    onChange={(e) => setLeaveDocRef(e.target.value)}
                    placeholder="e.g., Medical-Slip.pdf"
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows={2}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Provide reason for leave..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-blue-900 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Submit Leave Application
              </button>
            </form>

            {/* Leave Balances */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-900" />
                Leave Balances (Annual Entitlement)
              </h3>
              <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
                {leaveBalances.slice(0, 12).map((b) => (
                  <div key={b.teacherName} className="py-2 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{b.teacherName}</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      CL {b.casualTotal - b.casualUsed}/{b.casualTotal} · ML {b.medicalTotal - b.medicalUsed}/{b.medicalTotal} · EL {b.earnedTotal - b.earnedUsed}/{b.earnedTotal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leave Approval Queue & Auto-Substitution Cascade */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Leave Approval Queue &amp; Automatic Cover Cascade
                </h2>
                <p className="text-xs text-slate-600">
                  Approving leave automatically detects affected periods and drafts substitute recommendations in Pending Review (never auto-published).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {leaveRequests.map((lr) => (
                <div key={lr.id} className="rounded-xl border border-slate-200 p-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {lr.teacherName} · {lr.leaveType}
                      </p>
                      <p className="font-mono text-[11px] text-slate-600">
                        {lr.startDate} to {lr.endDate} · {lr.affectedSlotCount} timetable period(s) affected
                      </p>
                    </div>
                    <span
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${
                        lr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : lr.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {lr.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{lr.reason}</p>
                  {lr.supportingDocRef && (
                    <p className="text-[11px] text-slate-500">Attachment Ref: {lr.supportingDocRef}</p>
                  )}

                  {isLeadership && lr.status === 'Pending' && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleLeaveDecision(lr.id, 'Approved')}
                        className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve &amp; Queue Vacant-Period Covers
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleLeaveDecision(lr.id, 'Rejected')}
                        className="rounded-lg border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {lr.status === 'Approved' && lr.generatedCoverIds.length > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-blue-900 font-medium">
                        {lr.generatedCoverIds.length} cover recommendation(s) generated for coordinator review.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDate(lr.startDate);
                          setSubTab('calendar');
                        }}
                        className="font-semibold text-blue-900 hover:underline"
                      >
                        Review &amp; Publish on Calendar →
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {leaveRequests.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">No teacher leave requests logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
