import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  History,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  ClassroomFacility,
  LiveClassroomOccupancyStatus,
  LiveTeacherStatus,
  PeriodCheckInStatus,
  TeacherDutyType,
} from '../../types/controlRoomCalendar';
import {
  DEFAULT_BELL_SCHEDULE,
  buildControlRoomHistoricalReports,
  buildLiveControlRoomSnapshot,
  findVacantClassrooms,
  formatHhmmTo12h,
  type ControlRoomHistoricalReports,
  type LiveClassroomRow,
  type LiveControlRoomSnapshot,
  type LiveTeacherRow,
  type VacantClassroomQuery,
} from '../../utils/liveSchoolTimelineEngine';
import { apiRequest } from '../../utils/api';
import { triggerCsvDownload } from '../../utils/csvExport';
import { pushToast } from '../ToastProvider';

interface SchoolControlRoomModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

type ControlRoomTab = 'timeline' | 'vacant_rooms' | 'teachers' | 'substitutes' | 'reports';

const FACILITIES_LIST: ClassroomFacility[] = [
  'Smart Board',
  'Projector',
  'Science Lab',
  'Computer Lab',
  'Audio System',
  'AC',
];

function getTodayIsoLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getNowHhmmLocal(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function occupancyBadgeClass(status: LiveClassroomOccupancyStatus): string {
  switch (status) {
    case 'Occupied (verified)':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Occupied (scheduled)':
      return 'bg-blue-100 text-blue-900 border-blue-200';
    case 'Vacant (verified)':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'Vacant (scheduled)':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'Reserved':
      return 'bg-amber-100 text-amber-900 border-amber-300';
    case 'Maintenance':
      return 'bg-rose-100 text-rose-900 border-rose-300';
  }
}

function teacherStatusBadgeClass(status: LiveTeacherStatus): string {
  switch (status) {
    case 'Teaching':
      return 'bg-blue-100 text-blue-900 border-blue-200';
    case 'Substitution':
      return 'bg-indigo-100 text-indigo-900 border-indigo-200';
    case 'Free':
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    case 'Not Yet Verified':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'Meeting':
    case 'Assigned Duty':
      return 'bg-purple-100 text-purple-900 border-purple-200';
    case 'On Leave':
    case 'Absent':
      return 'bg-rose-100 text-rose-900 border-rose-300';
  }
}

export const SchoolControlRoomModule: React.FC<SchoolControlRoomModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isManagement = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );

  const [activeTab, setActiveTab] = useState<ControlRoomTab>('timeline');
  const [clockMode, setClockMode] = useState<'live' | 'inspect'>('live');
  const [inspectDate, setInspectDate] = useState<string>(getTodayIsoLocal);
  const [inspectTime, setInspectTime] = useState<string>('10:25');
  const [liveNowTime, setLiveNowTime] = useState<string>(getNowHhmmLocal);
  const [liveSeconds, setLiveSeconds] = useState<number>(() => new Date().getSeconds());
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [remoteSnapshot, setRemoteSnapshot] = useState<LiveControlRoomSnapshot | null>(null);
  const [remoteReports, setRemoteReports] = useState<ControlRoomHistoricalReports | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // Timeline filters
  const [timelinePerspective, setTimelinePerspective] = useState<
    'all_rooms' | 'vacant_only' | 'current_period' | 'floor_group'
  >('all_rooms');
  const [floorFilter, setFloorFilter] = useState<string>('ALL');
  const [timelineSearch, setTimelineSearch] = useState<string>('');
  const activePeriodColRef = useRef<HTMLTableCellElement | null>(null);

  // Vacant classroom finder filters
  const [vacantMode, setVacantMode] = useState<VacantClassroomQuery['mode']>('now');
  const [vacantFacility, setVacantFacility] = useState<ClassroomFacility | 'ALL'>('ALL');
  const [vacantMinCap, setVacantMinCap] = useState<number>(20);
  const [vacantCustomStart, setVacantCustomStart] = useState<string>('10:15');
  const [vacantCustomEnd, setVacantCustomEnd] = useState<string>('11:25');
  const [vacantSearch, setVacantSearch] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<LiveClassroomRow | null>(null);

  // Teacher tracker filters & drawer
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<string>('ALL');
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<LiveTeacherRow | null>(null);
  const [dutyTitle, setDutyTitle] = useState<string>('');
  const [dutyType, setDutyType] = useState<TeacherDutyType>('Meeting');
  const [dutyStart, setDutyStart] = useState<string>('10:15');
  const [dutyEnd, setDutyEnd] = useState<string>('10:50');

  const effectiveDate = clockMode === 'live' ? getTodayIsoLocal() : inspectDate;
  const effectiveTime = clockMode === 'live' ? liveNowTime : inspectTime;

  // Live 1-second clock tick for real-time countdown & automatic period transitions
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setLiveSeconds(d.getSeconds());
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      setLiveNowTime((prev) => (prev === hhmm ? prev : hhmm));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSnapshotFromServer = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ date: effectiveDate, time: effectiveTime }).toString();
      const res = await apiRequest<{
        snapshot: LiveControlRoomSnapshot;
        reports: ControlRoomHistoricalReports | null;
      }>(`/api/control-room/snapshot?${qs}`, {}, token || undefined);
      setRemoteSnapshot(res.snapshot);
      setRemoteReports(res.reports);
    } catch {
      // Fallback seamlessly to local deterministic engine computation below
    }
  }, [effectiveDate, effectiveTime, token]);

  useEffect(() => {
    void fetchSnapshotFromServer();
  }, [fetchSnapshotFromServer, data.timetable, data.substitutionAssignments]);

  // Real-Time Server-Sent Events (SSE) subscription for zero-refresh updates across leadership screens
  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    const stream = new EventSource('/api/control-room/stream');
    stream.addEventListener('connected', () => setSseConnected(true));
    stream.addEventListener('control_room_update', () => {
      void fetchSnapshotFromServer();
    });
    stream.addEventListener('calendar_update', () => {
      void fetchSnapshotFromServer();
    });
    stream.onerror = () => setSseConnected(false);
    return () => {
      stream.close();
      setSseConnected(false);
    };
  }, [fetchSnapshotFromServer]);

  // Instant deterministic local fallback while remote refreshes
  const snapshot: LiveControlRoomSnapshot = useMemo(() => {
    if (
      remoteSnapshot &&
      remoteSnapshot.schoolId === data.activeSchool.id &&
      remoteSnapshot.date === effectiveDate &&
      remoteSnapshot.bell.currentTimeHhmm === effectiveTime
    ) {
      return remoteSnapshot;
    }
    return buildLiveControlRoomSnapshot({
      schoolId: data.activeSchool.id,
      date: effectiveDate,
      currentTimeHhmm: effectiveTime,
      timetable: data.timetable || [],
      classrooms: data.controlRoom?.classrooms || [],
      bellSchedule: data.controlRoom?.bellSchedule || DEFAULT_BELL_SCHEDULE,
      periodCheckIns: data.controlRoom?.periodCheckIns || [],
      teacherDuties: data.controlRoom?.teacherDuties || [],
      staffAttendance: data.staffAttendance || [],
      staffProfiles: data.staffProfiles || [],
      users: data.schoolUsers || [data.user],
      teacherLeaveRequests: data.teacherLeaveRequests || [],
      substitutionAssignments: data.substitutionAssignments || [],
      teacherCapabilityProfiles: data.teacherCapabilityProfiles || [],
      substituteRuleConfig: data.substituteRuleConfig,
      schoolEvents: data.schoolEvents || [],
    });
  }, [remoteSnapshot, data, effectiveDate, effectiveTime]);

  const reports = useMemo(
    () =>
      remoteReports ||
      buildControlRoomHistoricalReports(snapshot, data.substitutionAssignments || []),
    [remoteReports, snapshot, data.substitutionAssignments],
  );

  // Auto-scroll timeline to active period column when it changes
  useEffect(() => {
    if (activeTab === 'timeline' && activePeriodColRef.current) {
      activePeriodColRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab, snapshot.bell.activePeriodNumber]);

  const floors = useMemo(
    () => Array.from(new Set(snapshot.classrooms.map((r) => r.classroom.floor))).sort(),
    [snapshot.classrooms],
  );

  const filteredTimelineRooms = useMemo(() => {
    const q = timelineSearch.trim().toLowerCase();
    return snapshot.classrooms.filter((row) => {
      if (floorFilter !== 'ALL' && row.classroom.floor !== floorFilter) return false;
      if (
        timelinePerspective === 'vacant_only' &&
        row.currentStatus !== 'Vacant (verified)' &&
        row.currentStatus !== 'Vacant (scheduled)'
      ) {
        return false;
      }
      if (q) {
        const cur = row.currentPeriodCell;
        const hay = `${row.classroom.roomNumber} ${row.classroom.floor} ${cur?.classSection || ''} ${cur?.subject || ''} ${cur?.effectiveTeacher || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [snapshot.classrooms, floorFilter, timelinePerspective, timelineSearch]);

  const vacantRooms = useMemo(
    () =>
      findVacantClassrooms(snapshot, {
        mode: vacantMode,
        requiredFacility: vacantFacility,
        minCapacity: vacantMinCap,
        customStartTime: vacantCustomStart,
        customEndTime: vacantCustomEnd,
        floor: floorFilter,
        search: vacantSearch,
      }),
    [
      snapshot,
      vacantMode,
      vacantFacility,
      vacantMinCap,
      vacantCustomStart,
      vacantCustomEnd,
      floorFilter,
      vacantSearch,
    ],
  );

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    return snapshot.teachers.filter((t) => {
      if (teacherStatusFilter !== 'ALL') {
        if (teacherStatusFilter === 'FREE_VERIFIED' && !t.physicallyAvailableForCover) return false;
        else if (teacherStatusFilter !== 'FREE_VERIFIED' && t.currentStatus !== teacherStatusFilter)
          return false;
      }
      if (q) {
        const hay = `${t.teacherName} ${t.subjects.join(' ')} ${t.currentAssignment?.classSection || ''} ${t.currentAssignment?.subject || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [snapshot.teachers, teacherStatusFilter, teacherSearch]);

  async function handlePeriodCheckIn(params: {
    roomNumber: string;
    period: number;
    classSection?: string;
    subject?: string;
    teacherName?: string;
    status: PeriodCheckInStatus;
  }) {
    setBusyKey(`chk-${params.roomNumber}-${params.period}`);
    try {
      await apiRequest(
        '/api/control-room/check-in',
        {
          method: 'POST',
          body: JSON.stringify({
            date: effectiveDate,
            ...params,
          }),
        },
        token || undefined,
      );
      pushToast(
        `${params.roomNumber} (P${params.period}) marked ${params.status === 'verified_teaching' ? 'Occupied (Verified)' : 'Vacant (Verified)'}.`,
        'success',
      );
      await fetchSnapshotFromServer();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to record period check-in.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleApproveSubstitute(params: {
    period: number;
    classSection: string;
    subject: string;
    absentTeacherName: string;
    substituteTeacherName: string;
  }) {
    setBusyKey(`sub-${params.period}-${params.classSection}`);
    try {
      await apiRequest(
        '/api/control-room/substitute-approve',
        {
          method: 'POST',
          body: JSON.stringify({
            date: effectiveDate,
            ...params,
          }),
        },
        token || undefined,
      );
      pushToast(
        `Assigned ${params.substituteTeacherName} to ${params.classSection} (Period ${params.period}). Live timeline updated.`,
        'success',
      );
      await Promise.all([fetchSnapshotFromServer(), onRefresh()]);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Conflict prevented substitution.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpdateRoomStatus(
    roomNumber: string,
    maintenanceStatus: 'Active' | 'Reserved' | 'Maintenance',
  ) {
    setBusyKey(`rm-${roomNumber}`);
    try {
      await apiRequest(
        '/api/control-room/classroom-status',
        {
          method: 'POST',
          body: JSON.stringify({
            roomNumber,
            maintenanceStatus,
            reservedBy: maintenanceStatus === 'Reserved' ? data.user.name : '',
          }),
        },
        token || undefined,
      );
      pushToast(`${roomNumber} status updated to ${maintenanceStatus}.`, 'success');
      await fetchSnapshotFromServer();
      setSelectedRoom(null);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to update classroom status.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleAssignTeacherDuty(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeacher || !dutyTitle.trim()) return;
    setBusyKey(`duty-${selectedTeacher.teacherKey}`);
    try {
      await apiRequest(
        '/api/control-room/teacher-duty',
        {
          method: 'POST',
          body: JSON.stringify({
            date: effectiveDate,
            teacherName: selectedTeacher.teacherName,
            startTime: dutyStart,
            endTime: dutyEnd,
            dutyType,
            title: dutyTitle.trim(),
          }),
        },
        token || undefined,
      );
      pushToast(`Assigned ${dutyType} to ${selectedTeacher.teacherName}.`, 'success');
      setDutyTitle('');
      await fetchSnapshotFromServer();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to assign duty.', 'error');
    } finally {
      setBusyKey(null);
    }
  }

  const teachingPeriods = snapshot.classrooms[0]?.schedule || [];

  return (
    <div className="space-y-6" data-testid="school-control-room-module">
      {/* Control Room Executive Header */}
      <div className="rounded-2xl border border-[#142B46]/15 bg-[#142B46] text-[#F3E6D8] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {clockMode === 'live' ? 'LIVE SCHOOL CONTROL ROOM' : 'HISTORICAL / SIMULATED CLOCK'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-[#A9C5D8]">
                <Radio className={`h-3 w-3 ${sseConnected ? 'text-emerald-400' : 'text-amber-300'}`} />
                {sseConnected ? 'Real-Time Sync Connected' : 'Auto-Sync Active'}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
              {data.activeSchool.name} — Live Operations Timeline &amp; Classroom Tracker
            </h1>
            <p className="text-xs text-[#A9C5D8]">
              {snapshot.date} ({snapshot.dayLabel}) · Verified occupancy is shown separately from scheduled timetable entries.
            </p>
          </div>

          {/* Live Clock & Time-Travel Inspector Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg bg-[#0D1E33] p-1 border border-[#254264]">
              <button
                type="button"
                onClick={() => setClockMode('live')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  clockMode === 'live' ? 'bg-[#D6B66D] text-[#142B46]' : 'text-[#A9C5D8] hover:text-white'
                }`}
              >
                Live Clock
              </button>
              <button
                type="button"
                onClick={() => setClockMode('inspect')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  clockMode === 'inspect' ? 'bg-[#D6B66D] text-[#142B46]' : 'text-[#A9C5D8] hover:text-white'
                }`}
              >
                Inspect Date/Time
              </button>
            </div>
            {clockMode === 'inspect' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  aria-label="Inspect date"
                  value={inspectDate}
                  onChange={(e) => setInspectDate(e.target.value)}
                  className="rounded-lg border border-[#254264] bg-[#0D1E33] px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="time"
                  aria-label="Inspect time"
                  value={inspectTime}
                  onChange={(e) => setInspectTime(e.target.value)}
                  className="rounded-lg border border-[#254264] bg-[#0D1E33] px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => void fetchSnapshotFromServer()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#254264] bg-[#1E3A5F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#284D78]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync
            </button>
          </div>
        </div>

        {/* Live Period Progress Bar */}
        <div className="rounded-xl bg-[#0D1E33]/90 border border-[#254264] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-[#D6B66D]/15 border border-[#D6B66D]/40 flex items-center justify-center text-[#D6B66D] shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-white tabular-nums">
                {snapshot.bell.currentTime12h}
                {clockMode === 'live' && (
                  <span className="text-xs text-[#A9C5D8] ml-1">
                    :{String(liveSeconds).padStart(2, '0')}
                  </span>
                )}
              </p>
              <p className="text-xs text-[#D6B66D] font-semibold">
                {snapshot.bell.activeSlot
                  ? `${snapshot.bell.activeSlot.label} (${formatHhmmTo12h(snapshot.bell.activeSlot.startTime)} – ${formatHhmmTo12h(snapshot.bell.activeSlot.endTime)})`
                  : snapshot.bell.dayPhase === 'before_school'
                    ? `School starts at ${snapshot.bell.nextSlot ? formatHhmmTo12h(snapshot.bell.nextSlot.startTime) : '08:45 AM'}`
                    : 'School Day Completed · Switch to "Inspect Date/Time" (e.g. 10:25) to review any period'}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-[#A9C5D8]">
                {snapshot.bell.activeSlot ? 'In Progress' : 'Next Transition'}
              </span>
              <span className="font-mono text-[#D6B66D] tabular-nums">
                {snapshot.bell.activeSlot
                  ? `${snapshot.bell.periodElapsedPct}% elapsed · ${snapshot.bell.remainingMinutes} min remaining`
                  : snapshot.bell.nextSlot
                    ? `${snapshot.bell.nextSlot.label} in ${snapshot.bell.remainingMinutes} min`
                    : 'All periods completed'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#1E3A5F] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#D6B66D] to-emerald-400 transition-all duration-500"
                style={{
                  width: `${snapshot.bell.activeSlot ? snapshot.bell.periodElapsedPct : snapshot.bell.dayProgressPct}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Executive KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Classes Occupied</p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1 tabular-nums">
            {snapshot.summary.classesOccupiedTotal}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            <span className="text-emerald-700 font-semibold">{snapshot.summary.classesOccupiedVerified} verified</span> ·{' '}
            <span>{snapshot.summary.classesOccupiedScheduled} scheduled</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('vacant_rooms')}
          className="text-left rounded-xl border border-teal-200 bg-teal-50/40 p-4 hover:bg-teal-50 transition-colors"
        >
          <p className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">Vacant Classrooms</p>
          <p className="font-mono text-2xl font-bold text-teal-900 mt-1 tabular-nums">
            {snapshot.summary.vacantClassroomsNow}
          </p>
          <p className="text-[11px] text-teal-700 mt-1 font-medium">Find Vacant Room →</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setTeacherStatusFilter('FREE_VERIFIED');
            setActiveTab('teachers');
          }}
          className="text-left rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 hover:bg-emerald-50 transition-colors"
        >
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Free Teachers</p>
          <p className="font-mono text-2xl font-bold text-emerald-900 mt-1 tabular-nums">
            {snapshot.summary.freeTeachersVerified}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Verified present · {snapshot.summary.freeTeachersUnverified} unverified
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('substitutes')}
          className={`text-left rounded-xl border p-4 transition-colors ${
            snapshot.summary.substitutionsPending > 0
              ? 'border-rose-300 bg-rose-50/60 hover:bg-rose-50'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Substitutions Pending</p>
          <p
            className={`font-mono text-2xl font-bold mt-1 tabular-nums ${
              snapshot.summary.substitutionsPending > 0 ? 'text-rose-700' : 'text-[#142B46]'
            }`}
          >
            {snapshot.summary.substitutionsPending}
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {snapshot.summary.substitutionsCovered} covered · {snapshot.summary.teachersAbsentOrLeave} absent/leave
          </p>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Conflicts &amp; Duties</p>
          <p className="font-mono text-2xl font-bold text-[#142B46] mt-1 tabular-nums">
            {snapshot.conflicts.length}
            <span className="text-sm font-normal text-slate-500 ml-1">conflicts</span>
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            {snapshot.summary.activeDutiesCount} staff duties · {snapshot.summary.ongoingEventsCount} events today
          </p>
        </div>
      </div>

      {/* Conflict Alert Banner (if any double-bookings exist) */}
      {snapshot.conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-950">
            <p className="font-bold">Timetable Conflict Guard Detected {snapshot.conflicts.length} Overlap(s)</p>
            {snapshot.conflicts.slice(0, 3).map((c, idx) => (
              <p key={idx}>• {c.detail}</p>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'timeline', label: 'Live Timeline', icon: Activity },
            { id: 'vacant_rooms', label: `Vacant Classroom Finder (${snapshot.summary.vacantClassroomsNow})`, icon: Building2 },
            { id: 'teachers', label: `Live Teacher Tracker (${snapshot.teachers.length})`, icon: Users },
            ...(isManagement
              ? [
                  { id: 'substitutes' as const, label: `Substitutes (${snapshot.summary.substitutionsPending})`, icon: UserCheck },
                  { id: 'reports' as const, label: 'Historical Reports', icon: BarChart3 },
                ]
              : []),
          ] as Array<{ id: ControlRoomTab; label: string; icon: React.ComponentType<{ className?: string }> }>
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#142B46] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: LIVE TIMELINE ==================== */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'all_rooms', label: 'All Classrooms' },
                  { id: 'vacant_only', label: 'Vacant Now Only' },
                  { id: 'current_period', label: 'Current Period Focus' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTimelinePerspective(opt.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    timelinePerspective === opt.id
                      ? 'bg-[#142B46] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <select
                aria-label="Filter by floor"
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
              >
                <option value="ALL">All Floors</option>
                {floors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="search"
                value={timelineSearch}
                onChange={(e) => setTimelineSearch(e.target.value)}
                placeholder="Search room, class, teacher, subject..."
                className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
          </div>

          {/* Horizontal Multi-Period Live Matrix with Moving NOW Marker */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto shadow-2xs">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 border-r border-slate-200 min-w-[160px]">
                    Classroom / Floor
                  </th>
                  {teachingPeriods
                    .filter(
                      (p) =>
                        timelinePerspective !== 'current_period' ||
                        snapshot.bell.activePeriodNumber === null ||
                        p.periodNumber === snapshot.bell.activePeriodNumber,
                    )
                    .map((p) => {
                      const isActive = snapshot.bell.activePeriodNumber === p.periodNumber;
                      return (
                        <th
                          key={p.periodNumber}
                          ref={isActive ? activePeriodColRef : undefined}
                          className={`px-3 py-3 border-r border-slate-200 min-w-[175px] relative ${
                            isActive ? 'bg-amber-50/90 text-[#142B46]' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold">Period {p.periodNumber}</span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                                NOW · {snapshot.bell.currentTimeHhmm}
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                            {formatHhmmTo12h(p.startTime)} – {formatHhmmTo12h(p.endTime)}
                          </p>
                        </th>
                      );
                    })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredTimelineRooms.map((row) => (
                  <tr key={row.classroom.id} className="hover:bg-slate-50/60">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 border-r border-slate-200 align-top">
                      <button
                        type="button"
                        onClick={() => setSelectedRoom(row)}
                        className="text-left group"
                      >
                        <p className="font-bold text-[#142B46] group-hover:underline">
                          {row.classroom.roomNumber}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {row.classroom.floor} · Cap {row.classroom.capacity}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${occupancyBadgeClass(row.currentStatus)}`}
                        >
                          {row.currentStatus}
                        </span>
                      </button>
                    </td>

                    {row.schedule
                      .filter(
                        (cell) =>
                          timelinePerspective !== 'current_period' ||
                          snapshot.bell.activePeriodNumber === null ||
                          cell.periodNumber === snapshot.bell.activePeriodNumber,
                      )
                      .map((cell) => {
                        const isActive = snapshot.bell.activePeriodNumber === cell.periodNumber;
                        const cellKey = `chk-${row.classroom.roomNumber}-${cell.periodNumber}`;
                        return (
                          <td
                            key={cell.periodNumber}
                            className={`px-3 py-2.5 border-r border-slate-200 align-top relative ${
                              isActive ? 'bg-amber-50/40 ring-1 ring-inset ring-amber-300/60' : ''
                            }`}
                          >
                            {cell.classSection ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900">
                                    {cell.classSection} · {cell.subject}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 truncate">
                                  {cell.effectiveTeacher}
                                  {cell.isSubstituted && (
                                    <span className="ml-1 rounded bg-indigo-100 px-1 text-[10px] font-bold text-indigo-800">
                                      SUB
                                    </span>
                                  )}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                                  <span
                                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${occupancyBadgeClass(cell.occupancyStatus)}`}
                                  >
                                    {cell.needsSubstitute ? 'Sub Needed' : cell.occupancyStatus}
                                  </span>
                                  {cell.occupancyStatus !== 'Occupied (verified)' && (
                                    <button
                                      type="button"
                                      disabled={busyKey === cellKey}
                                      onClick={() =>
                                        void handlePeriodCheckIn({
                                          roomNumber: row.classroom.roomNumber,
                                          period: cell.periodNumber,
                                          classSection: cell.classSection,
                                          subject: cell.subject,
                                          teacherName: cell.effectiveTeacher,
                                          status: 'verified_teaching',
                                        })
                                      }
                                      className="rounded border border-emerald-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50"
                                    >
                                      {busyKey === cellKey ? '...' : 'Verify ✓'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span
                                  className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${occupancyBadgeClass(cell.occupancyStatus)}`}
                                >
                                  {cell.occupancyStatus}
                                </span>
                                <p className="text-[11px] text-slate-400">No scheduled class</p>
                              </div>
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: VACANT CLASSROOM FINDER ==================== */}
      {activeTab === 'vacant_rooms' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Availability Window
              </label>
              <select
                value={vacantMode}
                onChange={(e) => setVacantMode(e.target.value as VacantClassroomQuery['mode'])}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium"
              >
                <option value="now">Vacant Right Now</option>
                <option value="next_period">Vacant Next Period</option>
                <option value="min_30">Vacant for 30+ Minutes</option>
                <option value="min_60">Vacant for 60+ Minutes</option>
                <option value="custom_range">Custom Time Range</option>
              </select>
            </div>

            {vacantMode === 'custom_range' && (
              <div className="md:col-span-3 flex items-center gap-2">
                <input
                  type="time"
                  value={vacantCustomStart}
                  onChange={(e) => setVacantCustomStart(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  value={vacantCustomEnd}
                  onChange={(e) => setVacantCustomEnd(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facility</label>
              <select
                value={vacantFacility}
                onChange={(e) => setVacantFacility(e.target.value as ClassroomFacility | 'ALL')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="ALL">Any Facility</option>
                {FACILITIES_LIST.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Min Class Size ({vacantMinCap})
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={vacantMinCap}
                onChange={(e) => setVacantMinCap(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <input
                type="search"
                value={vacantSearch}
                onChange={(e) => setVacantSearch(e.target.value)}
                placeholder="Room / Lab..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vacantRooms.map((row) => (
              <div
                key={row.classroom.id}
                className="rounded-xl border border-teal-200 bg-white p-4 space-y-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-[#142B46] text-base">
                      {row.classroom.roomNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {row.classroom.floor} · {row.classroom.building} · {row.classroom.capacity} seats
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${occupancyBadgeClass(row.currentStatus)}`}
                  >
                    {row.currentStatus}
                  </span>
                </div>

                <div className="rounded-lg bg-teal-50/70 border border-teal-100 px-3 py-2 text-xs flex items-center justify-between">
                  <span className="text-teal-900 font-medium">Available Until</span>
                  <span className="font-mono font-bold text-teal-950">
                    {row.availableUntil || 'End of Day'} ({row.availableMinutesFromNow} min)
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {row.classroom.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                    >
                      {fac}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedRoom(row)}
                    className="flex-1 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3A5F]"
                  >
                    Full Day Schedule
                  </button>
                  {isManagement && (
                    <button
                      type="button"
                      onClick={() => void handleUpdateRoomStatus(row.classroom.roomNumber, 'Reserved')}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    >
                      Reserve
                    </button>
                  )}
                </div>
              </div>
            ))}
            {vacantRooms.length === 0 && (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                No classrooms match these vacancy &amp; facility filters right now. Try expanding the time window or lowering minimum capacity.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: LIVE TEACHER TRACKER ==================== */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'ALL', label: 'All Staff' },
                  { id: 'FREE_VERIFIED', label: 'Physically Free (Verified)' },
                  { id: 'Teaching', label: 'Teaching' },
                  { id: 'Substitution', label: 'Substitution' },
                  { id: 'Not Yet Verified', label: 'Not Yet Verified' },
                  { id: 'Meeting', label: 'Meeting' },
                  { id: 'Assigned Duty', label: 'Assigned Duty' },
                  { id: 'On Leave', label: 'On Leave' },
                  { id: 'Absent', label: 'Absent' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTeacherStatusFilter(f.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    teacherStatusFilter === f.id
                      ? 'bg-[#142B46] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teacher or subject..."
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs w-full sm:w-56"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Current Assignment</th>
                  <th className="px-4 py-3">Live Status</th>
                  <th className="px-4 py-3">Attendance / Presence</th>
                  <th className="px-4 py-3">Next Scheduled Class</th>
                  <th className="px-4 py-3">Free Periods Today</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTeachers.map((t) => (
                  <tr key={t.teacherKey} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{t.teacherName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {t.subjects.slice(0, 3).join(', ') || t.designation}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {t.currentAssignment ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {t.currentAssignment.classSection} — {t.currentAssignment.subject}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {t.currentAssignment.roomNumber} · {formatHhmmTo12h(t.currentAssignment.startTime)}–{formatHhmmTo12h(t.currentAssignment.endTime)}
                          </p>
                        </div>
                      ) : t.activeDuty ? (
                        <div>
                          <p className="font-semibold text-purple-900">{t.activeDuty.title}</p>
                          <p className="text-[11px] text-purple-700">{t.activeDuty.dutyType}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">No current period</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${teacherStatusBadgeClass(t.currentStatus)}`}
                      >
                        {t.currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          t.presenceVerified ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {t.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {t.nextAssignment
                        ? `P${t.nextAssignment.period}: ${t.nextAssignment.classSection} (${t.nextAssignment.subject})`
                        : 'Done for today'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                      {t.freePeriodsToday.length > 0
                        ? t.freePeriodsToday.map((p) => `P${p}`).join(', ')
                        : 'None'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTeacher(t)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#142B46] hover:bg-slate-100"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: SUBSTITUTE ALLOCATION ==================== */}
      {activeTab === 'substitutes' && isManagement && (
        <div className="space-y-4">
          {snapshot.pendingSubstitutions.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="font-display text-base font-bold text-emerald-950">
                All Scheduled Classes Are Covered Today
              </h3>
              <p className="text-xs text-emerald-800">
                Zero unallocated periods detected. Whenever a teacher is marked Absent or has an Approved Leave, conflict-checked substitute recommendations appear here automatically.
              </p>
            </div>
          ) : (
            snapshot.pendingSubstitutions.map((need) => (
              <div
                key={need.slotId}
                className="rounded-xl border border-rose-200 bg-white p-5 space-y-3 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <p className="text-xs font-bold text-rose-700 uppercase">
                      Period {need.period} ({need.timeRange}) · {need.roomNumber}
                    </p>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {need.classSection} — {need.subject}
                    </h3>
                    <p className="text-xs text-slate-600">
                      Absent Faculty: <strong>{need.absentTeacherName}</strong> ({need.reason})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {need.recommendations.map((rec) => {
                    const key = `sub-${need.period}-${need.classSection}`;
                    return (
                      <div
                        key={rec.teacherName}
                        className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-[#142B46]">{rec.teacherName}</p>
                            <span className="font-mono text-[10px] font-bold text-emerald-700">
                              Score {rec.score}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{rec.rationale}</p>
                        </div>
                        <button
                          type="button"
                          disabled={busyKey === key}
                          onClick={() =>
                            void handleApproveSubstitute({
                              period: need.period,
                              classSection: need.classSection,
                              subject: need.subject,
                              absentTeacherName: need.absentTeacherName,
                              substituteTeacherName: rec.teacherName,
                            })
                          }
                          className="w-full rounded-md bg-[#142B46] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1E3A5F] disabled:opacity-60"
                        >
                          {busyKey === key ? 'Approving...' : 'Approve & Update Live Timeline'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ==================== TAB 5: HISTORICAL REPORTS ==================== */}
      {activeTab === 'reports' && isManagement && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Timetable Adherence</p>
              <p className="font-mono text-2xl font-bold text-emerald-700 mt-1">
                {reports.timetableAdherence.adherencePct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {reports.timetableAdherence.verifiedTeachingCount} verified · {reports.timetableAdherence.coveredBySubstituteCount} substituted
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Scheduled Periods</p>
              <p className="font-mono text-2xl font-bold text-[#142B46] mt-1">
                {reports.timetableAdherence.totalScheduledPeriods}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Unallocated Periods</p>
              <p className="font-mono text-2xl font-bold text-rose-700 mt-1">
                {reports.timetableAdherence.unallocatedCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerCsvDownload(
                    `rai-plus-teacher-utilization-${effectiveDate}.csv`,
                    ['Teacher', 'Scheduled Periods', 'Substitutions', 'Free Periods', 'Utilization %', 'Attendance'],
                    reports.teacherUtilization.map((r) => [
                      r.teacherName,
                      String(r.scheduledPeriods),
                      String(r.substitutions),
                      String(r.freePeriods),
                      `${r.utilizationPct}%`,
                      r.attendanceStatus,
                    ]),
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E3A5F]"
              >
                <Download className="h-3.5 w-3.5" /> Export Teacher Utilization CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  triggerCsvDownload(
                    `rai-plus-classroom-utilization-${effectiveDate}.csv`,
                    ['Room', 'Floor', 'Capacity', 'Occupied', 'Verified', 'Vacant', 'Utilization %'],
                    reports.classroomUtilization.map((r) => [
                      r.roomNumber,
                      r.floor,
                      String(r.capacity),
                      String(r.occupiedPeriods),
                      String(r.verifiedPeriods),
                      String(r.vacantPeriods),
                      `${r.utilizationPct}%`,
                    ]),
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> Export Classroom CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="font-display text-sm font-bold text-[#142B46]">Teacher Utilization Report</h3>
              <div className="max-h-72 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Teacher</th>
                      <th className="px-3 py-2 text-right">Periods</th>
                      <th className="px-3 py-2 text-right">Free</th>
                      <th className="px-3 py-2 text-right">Util %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.teacherUtilization.map((r) => (
                      <tr key={r.teacherName}>
                        <td className="px-3 py-2 font-medium text-slate-900">{r.teacherName}</td>
                        <td className="px-3 py-2 text-right font-mono">{r.scheduledPeriods + r.substitutions}</td>
                        <td className="px-3 py-2 text-right font-mono">{r.freePeriods}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-[#142B46]">{r.utilizationPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h3 className="font-display text-sm font-bold text-[#142B46]">Classroom Utilization Report</h3>
              <div className="max-h-72 overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Room</th>
                      <th className="px-3 py-2 text-right">Occupied</th>
                      <th className="px-3 py-2 text-right">Verified</th>
                      <th className="px-3 py-2 text-right">Util %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.classroomUtilization.map((r) => (
                      <tr key={r.roomNumber}>
                        <td className="px-3 py-2 font-medium text-slate-900">{r.roomNumber}</td>
                        <td className="px-3 py-2 text-right font-mono">{r.occupiedPeriods}</td>
                        <td className="px-3 py-2 text-right font-mono text-emerald-700">{r.verifiedPeriods}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-[#142B46]">{r.utilizationPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Detail Schedule Modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#142B46]">
                  {selectedRoom.classroom.roomNumber} — Complete Day Schedule ({snapshot.date})
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRoom.classroom.floor} · {selectedRoom.classroom.building} · Capacity {selectedRoom.classroom.capacity} · {selectedRoom.classroom.facilities.join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isManagement && (
              <div className="flex flex-wrap items-center gap-2">
                {(['Active', 'Reserved', 'Maintenance'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => void handleUpdateRoomStatus(selectedRoom.classroom.roomNumber, st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${
                      selectedRoom.classroom.maintenanceStatus === st
                        ? 'bg-[#142B46] text-white border-[#142B46]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Mark {st}
                  </button>
                ))}
              </div>
            )}

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
              {selectedRoom.schedule.map((cell) => (
                <div key={cell.periodNumber} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">
                      Period {cell.periodNumber} · {formatHhmmTo12h(cell.startTime)} – {formatHhmmTo12h(cell.endTime)}
                    </p>
                    <p className="text-slate-600">
                      {cell.classSection
                        ? `${cell.classSection} · ${cell.subject} · ${cell.effectiveTeacher}`
                        : 'Vacant — Available for remedial, meeting, or club session'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${occupancyBadgeClass(cell.occupancyStatus)}`}
                  >
                    {cell.occupancyStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Detail & Duty Modal */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-5"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#142B46]">
                  {selectedTeacher.teacherName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTeacher.designation} · Attendance: <strong>{selectedTeacher.attendanceStatus}</strong> ·{' '}
                  {selectedTeacher.physicallyAvailableForCover ? 'Physically Available for Cover' : 'Not Available for Cover Now'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg text-xs">
              {selectedTeacher.daySchedule.map((p) => (
                <div key={p.period} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">Period {p.period}</span>
                    <span className="text-slate-500 ml-2 font-mono text-[11px]">
                      {formatHhmmTo12h(p.startTime)}–{formatHhmmTo12h(p.endTime)}
                    </span>
                    <span className="ml-3 text-slate-700">
                      {p.classSection
                        ? `${p.classSection} · ${p.subject} (${p.roomNumber})`
                        : p.dutyTitle || 'Free Period'}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${teacherStatusBadgeClass(p.status)}`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            {isManagement && (
              <form onSubmit={handleAssignTeacherDuty} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <p className="text-xs font-bold text-[#142B46]">Assign Meeting or Campus Duty</p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <select
                    value={dutyType}
                    onChange={(e) => setDutyType(e.target.value as TeacherDutyType)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Assigned Duty">Assigned Duty</option>
                    <option value="Exam Invigilation">Exam Invigilation</option>
                    <option value="Event Duty">Event Duty</option>
                  </select>
                  <input
                    type="text"
                    value={dutyTitle}
                    onChange={(e) => setDutyTitle(e.target.value)}
                    placeholder="Duty / meeting title"
                    className="sm:col-span-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    value={dutyStart}
                    onChange={(e) => setDutyStart(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                  <span className="text-xs text-slate-500">to</span>
                  <input
                    type="time"
                    value={dutyEnd}
                    onChange={(e) => setDutyEnd(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={!dutyTitle.trim() || busyKey !== null}
                    className="ml-auto rounded-lg bg-[#142B46] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3A5F] disabled:opacity-50"
                  >
                    Assign Duty
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
