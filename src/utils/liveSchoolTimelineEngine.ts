import type {
  SchoolEvent,
  StaffAttendanceRecord,
  StaffProfile,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TeacherCapabilityProfile,
  TeacherLeaveRequest,
  TimetableSlot,
  UserAccount,
} from '../types';
import type {
  BellPeriodSlot,
  ClassroomFacility,
  LiveClassroomOccupancyStatus,
  LiveTeacherStatus,
  PeriodCheckInRecord,
  SchoolClassroom,
  TeacherDutyRecord,
} from '../types/controlRoomCalendar';
import {
  computeCapabilityBands,
  createDefaultSubstituteRuleConfig,
  dateToTimetableDay,
  normalizeTeacherKey,
  normalizeTimetableDay,
  rankSubstituteCandidates,
  splitSlotTeachers,
} from './smartTimetableEngine.ts';

export const DEFAULT_BELL_SCHEDULE: BellPeriodSlot[] = [
  { id: 'asm', label: 'Morning Assembly', kind: 'assembly', startTime: '08:45', endTime: '09:05' },
  { id: 'p1', label: 'Period 1', kind: 'period', periodNumber: 1, startTime: '09:05', endTime: '09:40' },
  { id: 'p2', label: 'Period 2', kind: 'period', periodNumber: 2, startTime: '09:40', endTime: '10:15' },
  { id: 'p3', label: 'Period 3', kind: 'period', periodNumber: 3, startTime: '10:15', endTime: '10:50' },
  { id: 'p4', label: 'Period 4', kind: 'period', periodNumber: 4, startTime: '10:50', endTime: '11:25' },
  { id: 'brk', label: 'Mid-Day Recess', kind: 'break', startTime: '11:25', endTime: '11:40' },
  { id: 'p5', label: 'Period 5', kind: 'period', periodNumber: 5, startTime: '11:40', endTime: '12:15' },
  { id: 'p6', label: 'Period 6', kind: 'period', periodNumber: 6, startTime: '12:15', endTime: '12:50' },
  { id: 'p7', label: 'Period 7', kind: 'period', periodNumber: 7, startTime: '12:50', endTime: '13:25' },
  { id: 'p8', label: 'Period 8', kind: 'period', periodNumber: 8, startTime: '13:25', endTime: '14:00' },
];

export function parseTimeToMinutes(hhmm: string): number {
  const m = (hhmm || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatMinutesTo12h(totalMins: number): string {
  const clamped = ((totalMins % 1440) + 1440) % 1440;
  const h24 = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

export function formatHhmmTo12h(hhmm: string): string {
  return formatMinutesTo12h(parseTimeToMinutes(hhmm));
}

export function deriveSchoolClassrooms(
  schoolId: string,
  timetable: TimetableSlot[],
  existing: SchoolClassroom[] = [],
): SchoolClassroom[] {
  const byRoom = new Map<string, SchoolClassroom>();
  for (const room of existing) {
    if (room.schoolId === schoolId) {
      byRoom.set(room.roomNumber.trim().toLowerCase(), room);
    }
  }

  const discoveredRooms = Array.from(
    new Set(
      timetable
        .filter((s) => s.schoolId === schoolId && Boolean(s.room?.trim()))
        .map((s) => (s.room || '').trim()),
    ),
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Ensure standard spare/activity/lab rooms always exist for vacant room discovery
  const baselineSpareRooms = [
    'Room 103',
    'Room 105',
    'Room 204',
    'Science Lab 1',
    'Computer Lab 1',
    'Smart Seminar Room',
  ];
  const allRoomNames = Array.from(new Set([...discoveredRooms, ...baselineSpareRooms]));

  allRoomNames.forEach((rawName, idx) => {
    const key = rawName.toLowerCase();
    if (byRoom.has(key)) return;
    const isLab = /lab/i.test(rawName);
    const isComp = /comp|it/i.test(rawName);
    const isSmart = /smart|seminar|10|11|12|20/i.test(rawName);
    const numMatch = rawName.match(/\b(\d)(\d{2})\b/);
    const floor = numMatch
      ? numMatch[1] === '1'
        ? 'Ground Floor'
        : numMatch[1] === '2'
          ? 'First Floor'
          : 'Second Floor'
      : idx % 3 === 0
        ? 'Ground Floor'
        : idx % 3 === 1
          ? 'First Floor'
          : 'Second Floor';

    const facilities: ClassroomFacility[] = [];
    if (isSmart || idx % 2 === 0) facilities.push('Smart Board');
    if (isSmart || isLab || idx % 3 === 0) facilities.push('Projector');
    if (isLab && !isComp) facilities.push('Science Lab');
    if (isComp) facilities.push('Computer Lab');
    if (isSmart || isLab) facilities.push('AC');
    if (facilities.length === 0) facilities.push('Audio System');

    byRoom.set(key, {
      id: `rm-${schoolId}-${rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      schoolId,
      roomNumber: rawName,
      name: isLab || /room|hall/i.test(rawName) ? rawName : `Classroom ${rawName}`,
      floor,
      building: isLab ? 'STEM Wing' : 'Main Academic Block',
      capacity: isLab ? 32 : /seminar|hall/i.test(rawName) ? 60 : 40,
      facilities,
      maintenanceStatus: 'Active',
    });
  });

  return Array.from(byRoom.values()).sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
  );
}

export interface LiveBellContext {
  currentTimeHhmm: string;
  currentTime12h: string;
  currentMinutes: number;
  schoolStartMinutes: number;
  schoolEndMinutes: number;
  dayProgressPct: number;
  activeSlot: BellPeriodSlot | null;
  nextSlot: BellPeriodSlot | null;
  activePeriodNumber: number | null;
  nextPeriodNumber: number | null;
  periodElapsedPct: number;
  remainingMinutes: number;
  dayPhase: 'before_school' | 'in_session' | 'after_school';
}

export function evaluateBellContext(
  currentTimeHhmm: string,
  bellSchedule: BellPeriodSlot[] = DEFAULT_BELL_SCHEDULE,
): LiveBellContext {
  const schedule = bellSchedule.length > 0 ? bellSchedule : DEFAULT_BELL_SCHEDULE;
  const currentMinutes = parseTimeToMinutes(currentTimeHhmm);
  const schoolStartMinutes = parseTimeToMinutes(schedule[0].startTime);
  const schoolEndMinutes = parseTimeToMinutes(schedule[schedule.length - 1].endTime);
  const totalDaySpan = Math.max(1, schoolEndMinutes - schoolStartMinutes);
  const dayProgressPct = Math.max(
    0,
    Math.min(100, Math.round(((currentMinutes - schoolStartMinutes) / totalDaySpan) * 100)),
  );

  let activeSlot: BellPeriodSlot | null = null;
  let nextSlot: BellPeriodSlot | null = null;
  for (let i = 0; i < schedule.length; i += 1) {
    const slot = schedule[i];
    const sMin = parseTimeToMinutes(slot.startTime);
    const eMin = parseTimeToMinutes(slot.endTime);
    if (currentMinutes >= sMin && currentMinutes < eMin) {
      activeSlot = slot;
      nextSlot = schedule[i + 1] ?? null;
      break;
    }
    if (currentMinutes < sMin) {
      nextSlot = slot;
      break;
    }
  }

  const nextTeachingSlot =
    schedule.find(
      (s) => s.kind === 'period' && parseTimeToMinutes(s.startTime) > currentMinutes,
    ) ?? null;

  let periodElapsedPct = 0;
  let remainingMinutes = 0;
  if (activeSlot) {
    const sMin = parseTimeToMinutes(activeSlot.startTime);
    const eMin = parseTimeToMinutes(activeSlot.endTime);
    const dur = Math.max(1, eMin - sMin);
    periodElapsedPct = Math.max(0, Math.min(100, Math.round(((currentMinutes - sMin) / dur) * 100)));
    remainingMinutes = Math.max(0, eMin - currentMinutes);
  } else if (nextSlot) {
    remainingMinutes = Math.max(0, parseTimeToMinutes(nextSlot.startTime) - currentMinutes);
  }

  const dayPhase: LiveBellContext['dayPhase'] =
    currentMinutes < schoolStartMinutes
      ? 'before_school'
      : currentMinutes >= schoolEndMinutes
        ? 'after_school'
        : 'in_session';

  return {
    currentTimeHhmm,
    currentTime12h: formatMinutesTo12h(currentMinutes),
    currentMinutes,
    schoolStartMinutes,
    schoolEndMinutes,
    dayProgressPct,
    activeSlot,
    nextSlot,
    activePeriodNumber: activeSlot?.periodNumber ?? null,
    nextPeriodNumber: nextTeachingSlot?.periodNumber ?? null,
    periodElapsedPct,
    remainingMinutes,
    dayPhase,
  };
}

export interface LiveClassroomPeriodCell {
  periodNumber: number;
  startTime: string;
  endTime: string;
  slotId?: string;
  classSection?: string;
  subject?: string;
  assignedTeacher?: string;
  effectiveTeacher?: string;
  isSubstituted: boolean;
  needsSubstitute: boolean;
  occupancyStatus: LiveClassroomOccupancyStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  checkInNote?: string;
}

export interface LiveClassroomRow {
  classroom: SchoolClassroom;
  currentStatus: LiveClassroomOccupancyStatus;
  currentPeriodCell: LiveClassroomPeriodCell | null;
  availableUntil: string | null; // 12h formatted or 'End of Day'
  availableMinutesFromNow: number;
  nextOccupiedAt: string | null;
  schedule: LiveClassroomPeriodCell[];
}

export interface LiveTeacherRow {
  teacherKey: string;
  teacherName: string;
  teacherId: string;
  designation: string;
  subjects: string[];
  attendanceStatus: 'Present' | 'Absent' | 'On Leave' | 'Half Day' | 'Not Marked';
  presenceVerified: boolean;
  leaveApproved: boolean;
  currentStatus: LiveTeacherStatus;
  currentAssignment: {
    period: number;
    classSection: string;
    subject: string;
    roomNumber: string;
    startTime: string;
    endTime: string;
    isSubstitution: boolean;
  } | null;
  activeDuty: TeacherDutyRecord | null;
  nextAssignment: {
    period: number;
    classSection: string;
    subject: string;
    roomNumber: string;
    startTime: string;
    endTime: string;
  } | null;
  freePeriodsToday: number[];
  scheduledPeriodsToday: number;
  substitutionsToday: number;
  physicallyAvailableForCover: boolean;
  dutiesToday: TeacherDutyRecord[];
  daySchedule: Array<{
    period: number;
    startTime: string;
    endTime: string;
    status: LiveTeacherStatus;
    classSection?: string;
    subject?: string;
    roomNumber?: string;
    dutyTitle?: string;
  }>;
}

export interface PendingSubstitutionNeed {
  slotId: string;
  date: string;
  day: string;
  period: number;
  timeRange: string;
  classSection: string;
  subject: string;
  roomNumber: string;
  absentTeacherName: string;
  reason: string;
  recommendations: Array<{
    teacherName: string;
    tier: number;
    tierLabel: string;
    score: number;
    periodsToday: number;
    presenceVerified: boolean;
    rationale: string;
  }>;
}

export interface LiveControlRoomSnapshot {
  schoolId: string;
  date: string;
  dayLabel: string;
  bell: LiveBellContext;
  summary: {
    classesOccupiedTotal: number;
    classesOccupiedVerified: number;
    classesOccupiedScheduled: number;
    vacantClassroomsNow: number;
    freeTeachersVerified: number;
    freeTeachersUnverified: number;
    teachersAbsentOrLeave: number;
    substitutionsPending: number;
    substitutionsCovered: number;
    activeDutiesCount: number;
    ongoingEventsCount: number;
  };
  classrooms: LiveClassroomRow[];
  teachers: LiveTeacherRow[];
  pendingSubstitutions: PendingSubstitutionNeed[];
  ongoingEvents: SchoolEvent[];
  conflicts: Array<{
    type: 'teacher_double_booking' | 'room_double_booking';
    period: number;
    entity: string;
    detail: string;
  }>;
}

export interface LiveSnapshotInput {
  schoolId: string;
  date: string; // YYYY-MM-DD
  currentTimeHhmm: string; // HH:mm
  timetable: TimetableSlot[];
  classrooms?: SchoolClassroom[];
  bellSchedule?: BellPeriodSlot[];
  periodCheckIns?: PeriodCheckInRecord[];
  teacherDuties?: TeacherDutyRecord[];
  staffAttendance?: StaffAttendanceRecord[];
  staffProfiles?: StaffProfile[];
  users?: UserAccount[];
  teacherLeaveRequests?: TeacherLeaveRequest[];
  substitutionAssignments?: SubstitutionAssignmentRecord[];
  teacherCapabilityProfiles?: TeacherCapabilityProfile[];
  substituteRuleConfig?: SubstituteRuleConfig;
  schoolEvents?: SchoolEvent[];
}

export function buildLiveControlRoomSnapshot(input: LiveSnapshotInput): LiveControlRoomSnapshot {
  const { schoolId, date, currentTimeHhmm } = input;
  const bellSchedule = input.bellSchedule?.length ? input.bellSchedule : DEFAULT_BELL_SCHEDULE;
  const bell = evaluateBellContext(currentTimeHhmm, bellSchedule);
  const teachingPeriods = bellSchedule.filter((b) => b.kind === 'period' && b.periodNumber);
  const dayCode = dateToTimetableDay(date) || 'Mon';
  const schoolSlots = input.timetable.filter((s) => s.schoolId === schoolId);
  const daySlots = schoolSlots.filter((s) => normalizeTimetableDay(s.day) === dayCode);

  const classrooms = deriveSchoolClassrooms(schoolId, schoolSlots, input.classrooms || []);
  const checkIns = (input.periodCheckIns || []).filter(
    (c) => c.schoolId === schoolId && c.date === date,
  );
  const dutiesToday = (input.teacherDuties || []).filter(
    (d) => d.schoolId === schoolId && d.date === date,
  );
  const coversToday = (input.substitutionAssignments || []).filter(
    (c) => c.schoolId === schoolId && c.date === date && Boolean(c.substituteTeacherName),
  );
  const approvedLeavesToday = (input.teacherLeaveRequests || []).filter(
    (l) =>
      l.schoolId === schoolId &&
      l.status === 'Approved' &&
      l.startDate <= date &&
      l.endDate >= date,
  );
  const staffAttToday = (input.staffAttendance || []).filter(
    (a) => a.schoolId === schoolId && a.date === date,
  );
  const staffProfiles = (input.staffProfiles || []).filter((p) => p.schoolId === schoolId);
  const teacherUsers = (input.users || []).filter(
    (u) => u.schoolId === schoolId && ['teacher', 'coordinator', 'principal'].includes(u.role),
  );

  // Build lookup maps for attendance & approved leaves by normalized teacher key
  const profileById = new Map(staffProfiles.map((p) => [p.id, p]));
  const attendanceByTeacherKey = new Map<string, StaffAttendanceRecord>();
  for (const att of staffAttToday) {
    const prof = profileById.get(att.staffId);
    if (prof) {
      attendanceByTeacherKey.set(normalizeTeacherKey(prof.name), att);
    }
  }
  const leaveByTeacherKey = new Map<string, TeacherLeaveRequest>();
  for (const lv of approvedLeavesToday) {
    leaveByTeacherKey.set(normalizeTeacherKey(lv.teacherName), lv);
  }

  // Collect all unique teachers across timetable + users
  const teacherMetaMap = new Map<
    string,
    { name: string; id: string; designation: string; subjects: Set<string> }
  >();
  for (const u of teacherUsers) {
    const key = normalizeTeacherKey(u.name);
    if (!key) continue;
    teacherMetaMap.set(key, {
      name: u.name,
      id: u.id,
      designation: u.designation || 'Faculty',
      subjects: new Set(u.subjectSpecialty ? [u.subjectSpecialty] : []),
    });
  }
  for (const slot of schoolSlots) {
    for (const rawName of splitSlotTeachers(slot.teacherName)) {
      const key = normalizeTeacherKey(rawName);
      if (!key) continue;
      const existing = teacherMetaMap.get(key);
      if (existing) {
        existing.subjects.add(slot.subject);
      } else {
        teacherMetaMap.set(key, {
          name: rawName,
          id: `tchr-${key.replace(/[^a-z0-9]+/g, '-')}`,
          designation: 'Subject Teacher',
          subjects: new Set([slot.subject]),
        });
      }
    }
  }

  // Detect timetable conflicts (double-booked teacher or double-booked room in same period)
  const conflicts: LiveControlRoomSnapshot['conflicts'] = [];
  const roomPeriodSlots = new Map<string, TimetableSlot[]>();
  const teacherPeriodSlots = new Map<string, TimetableSlot[]>();
  for (const slot of daySlots) {
    const slotRoom = (slot.room || 'Unassigned Room').trim();
    const rKey = `${slotRoom.toLowerCase()}::${slot.period}`;
    const rList = roomPeriodSlots.get(rKey) || [];
    rList.push(slot);
    roomPeriodSlots.set(rKey, rList);

    for (const tName of splitSlotTeachers(slot.teacherName)) {
      const tKey = `${normalizeTeacherKey(tName)}::${slot.period}`;
      const tList = teacherPeriodSlots.get(tKey) || [];
      tList.push(slot);
      teacherPeriodSlots.set(tKey, tList);
    }
  }
  for (const [, list] of roomPeriodSlots.entries()) {
    if (list.length > 1) {
      const uniqueClasses = Array.from(new Set(list.map((s) => s.classSection)));
      const rmName = list[0].room || 'Unassigned Room';
      if (uniqueClasses.length > 1) {
        conflicts.push({
          type: 'room_double_booking',
          period: list[0].period,
          entity: rmName,
          detail: `${rmName} scheduled simultaneously for ${uniqueClasses.join(' & ')} in Period ${list[0].period}.`,
        });
      }
    }
  }
  for (const [, list] of teacherPeriodSlots.entries()) {
    if (list.length > 1) {
      const uniqueClasses = Array.from(new Set(list.map((s) => s.classSection)));
      if (uniqueClasses.length > 1) {
        conflicts.push({
          type: 'teacher_double_booking',
          period: list[0].period,
          entity: list[0].teacherName,
          detail: `${list[0].teacherName} double-booked across ${uniqueClasses.join(' & ')} in Period ${list[0].period}.`,
        });
      }
    }
  }

  const isTeacherAbsentOrOnLeave = (teacherName: string): { absent: boolean; onLeave: boolean; reason: string } => {
    const key = normalizeTeacherKey(teacherName);
    const lv = leaveByTeacherKey.get(key);
    if (lv) return { absent: true, onLeave: true, reason: `Approved ${lv.leaveType}` };
    const att = attendanceByTeacherKey.get(key);
    if (att?.status === 'Absent') return { absent: true, onLeave: false, reason: 'Marked Absent' };
    if (att?.status === 'Paid Leave' || att?.status === 'Unpaid Leave') {
      return { absent: true, onLeave: true, reason: att.status };
    }
    return { absent: false, onLeave: false, reason: '' };
  };

  // Build Classroom Occupancy Rows
  const classroomRows: LiveClassroomRow[] = classrooms.map((classroom) => {
    const roomLower = classroom.roomNumber.trim().toLowerCase();
    const schedule: LiveClassroomPeriodCell[] = teachingPeriods.map((bp) => {
      const periodNumber = bp.periodNumber!;
      const slot = daySlots.find(
        (s) => s.period === periodNumber && (s.room || '').trim().toLowerCase() === roomLower,
      );
      const checkIn = checkIns.find(
        (c) => c.period === periodNumber && c.roomNumber.trim().toLowerCase() === roomLower,
      );
      const cover = slot
        ? coversToday.find(
            (c) => c.period === periodNumber && c.classSection === slot.classSection,
          )
        : undefined;

      if (classroom.maintenanceStatus === 'Maintenance') {
        return {
          periodNumber,
          startTime: bp.startTime,
          endTime: bp.endTime,
          isSubstituted: false,
          needsSubstitute: false,
          occupancyStatus: 'Maintenance',
        };
      }
      if (classroom.maintenanceStatus === 'Reserved' && !slot) {
        return {
          periodNumber,
          startTime: bp.startTime,
          endTime: bp.endTime,
          isSubstituted: false,
          needsSubstitute: false,
          occupancyStatus: 'Reserved',
        };
      }

      if (!slot) {
        return {
          periodNumber,
          startTime: bp.startTime,
          endTime: bp.endTime,
          isSubstituted: false,
          needsSubstitute: false,
          occupancyStatus:
            checkIn?.status === 'verified_vacant'
              ? 'Vacant (verified)'
              : checkIn?.status === 'verified_teaching' || checkIn?.status === 'admin_override'
                ? 'Occupied (verified)'
                : 'Vacant (scheduled)',
          classSection: checkIn?.classSection,
          subject: checkIn?.subject,
          effectiveTeacher: checkIn?.teacherName,
          verifiedBy: checkIn?.verifiedBy,
          verifiedAt: checkIn?.verifiedAt,
          checkInNote: checkIn?.note,
        };
      }

      const primaryTeacher = splitSlotTeachers(slot.teacherName)[0] || slot.teacherName;
      const absenceInfo = isTeacherAbsentOrOnLeave(primaryTeacher);
      const effectiveTeacher = cover?.substituteTeacherName || slot.teacherName;
      const needsSubstitute = absenceInfo.absent && !cover;

      let occupancyStatus: LiveClassroomOccupancyStatus = 'Occupied (scheduled)';
      if (checkIn?.status === 'verified_teaching' || checkIn?.status === 'admin_override') {
        occupancyStatus = 'Occupied (verified)';
      } else if (checkIn?.status === 'verified_vacant') {
        occupancyStatus = 'Vacant (verified)';
      } else if (needsSubstitute) {
        occupancyStatus = 'Vacant (scheduled)';
      }

      return {
        periodNumber,
        startTime: bp.startTime,
        endTime: bp.endTime,
        slotId: slot.id,
        classSection: slot.classSection,
        subject: slot.subject,
        assignedTeacher: slot.teacherName,
        effectiveTeacher,
        isSubstituted: Boolean(cover),
        needsSubstitute,
        occupancyStatus,
        verifiedBy: checkIn?.verifiedBy,
        verifiedAt: checkIn?.verifiedAt,
        checkInNote: checkIn?.note,
      };
    });

    const currentPeriodCell =
      bell.activePeriodNumber !== null
        ? schedule.find((c) => c.periodNumber === bell.activePeriodNumber) ?? null
        : null;

    let currentStatus: LiveClassroomOccupancyStatus;
    if (classroom.maintenanceStatus === 'Maintenance') {
      currentStatus = 'Maintenance';
    } else if (classroom.maintenanceStatus === 'Reserved' && !currentPeriodCell?.slotId) {
      currentStatus = 'Reserved';
    } else if (currentPeriodCell) {
      currentStatus = currentPeriodCell.occupancyStatus;
    } else {
      currentStatus = 'Vacant (scheduled)';
    }

    // Calculate continuous availability window from current time forward
    const isVacantNow =
      currentStatus === 'Vacant (verified)' || currentStatus === 'Vacant (scheduled)';
    let availableUntil: string | null = null;
    let availableMinutesFromNow = 0;
    let nextOccupiedAt: string | null = null;

    for (const cell of schedule) {
      const sMin = parseTimeToMinutes(cell.startTime);
      const eMin = parseTimeToMinutes(cell.endTime);
      const cellOccupied =
        cell.occupancyStatus === 'Occupied (verified)' ||
        cell.occupancyStatus === 'Occupied (scheduled)' ||
        cell.occupancyStatus === 'Reserved' ||
        cell.occupancyStatus === 'Maintenance';
      if (eMin <= bell.currentMinutes) continue;
      if (cellOccupied && sMin > bell.currentMinutes) {
        nextOccupiedAt = formatHhmmTo12h(cell.startTime);
        if (isVacantNow) {
          availableUntil = formatHhmmTo12h(cell.startTime);
          availableMinutesFromNow = Math.max(0, sMin - bell.currentMinutes);
        }
        break;
      }
    }
    if (isVacantNow && !availableUntil) {
      availableUntil = formatMinutesTo12h(bell.schoolEndMinutes);
      availableMinutesFromNow = Math.max(0, bell.schoolEndMinutes - bell.currentMinutes);
    }

    return {
      classroom,
      currentStatus,
      currentPeriodCell,
      availableUntil,
      availableMinutesFromNow,
      nextOccupiedAt,
      schedule,
    };
  });

  // Build Live Teacher Rows (strictly distinguishing scheduled free vs verified presence & duties)
  const teacherRows: LiveTeacherRow[] = Array.from(teacherMetaMap.entries())
    .map(([teacherKey, meta]) => {
      const att = attendanceByTeacherKey.get(teacherKey);
      const lv = leaveByTeacherKey.get(teacherKey);
      const teacherDuties = dutiesToday.filter(
        (d) => normalizeTeacherKey(d.teacherName) === teacherKey,
      );

      let attendanceStatus: LiveTeacherRow['attendanceStatus'] = 'Not Marked';
      if (lv) {
        attendanceStatus = 'On Leave';
      } else if (att) {
        if (att.status === 'Present') attendanceStatus = 'Present';
        else if (att.status === 'Half Day') attendanceStatus = 'Half Day';
        else if (att.status === 'Absent') attendanceStatus = 'Absent';
        else attendanceStatus = 'On Leave';
      }
      const presenceVerified = attendanceStatus === 'Present' || attendanceStatus === 'Half Day';
      const leaveApproved = Boolean(lv) || attendanceStatus === 'On Leave';

      let scheduledPeriodsToday = 0;
      let substitutionsToday = 0;
      const freePeriodsToday: number[] = [];

      const daySchedule = teachingPeriods.map((bp) => {
        const pNum = bp.periodNumber!;
        const pStart = parseTimeToMinutes(bp.startTime);
        const pEnd = parseTimeToMinutes(bp.endTime);

        const dutyMatch = teacherDuties.find(
          (d) =>
            d.period === pNum ||
            (parseTimeToMinutes(d.startTime) < pEnd && parseTimeToMinutes(d.endTime) > pStart),
        );
        const coverOut = coversToday.find(
          (c) =>
            c.period === pNum &&
            Boolean(c.substituteTeacherName) &&
            normalizeTeacherKey(c.substituteTeacherName || '') === teacherKey,
        );
        const regSlot = daySlots.find(
          (s) =>
            s.period === pNum &&
            splitSlotTeachers(s.teacherName).some((t) => normalizeTeacherKey(t) === teacherKey),
        );

        if (regSlot) scheduledPeriodsToday += 1;
        if (coverOut) substitutionsToday += 1;

        if (leaveApproved) {
          return {
            period: pNum,
            startTime: bp.startTime,
            endTime: bp.endTime,
            status: 'On Leave' as LiveTeacherStatus,
          };
        }
        if (attendanceStatus === 'Absent') {
          return {
            period: pNum,
            startTime: bp.startTime,
            endTime: bp.endTime,
            status: 'Absent' as LiveTeacherStatus,
          };
        }
        if (coverOut) {
          return {
            period: pNum,
            startTime: bp.startTime,
            endTime: bp.endTime,
            status: 'Substitution' as LiveTeacherStatus,
            classSection: coverOut.classSection,
            subject: coverOut.subject,
            roomNumber: regSlot?.room || 'Assigned Room',
          };
        }
        if (regSlot) {
          return {
            period: pNum,
            startTime: bp.startTime,
            endTime: bp.endTime,
            status: 'Teaching' as LiveTeacherStatus,
            classSection: regSlot.classSection,
            subject: regSlot.subject,
            roomNumber: regSlot.room,
          };
        }
        if (dutyMatch) {
          return {
            period: pNum,
            startTime: bp.startTime,
            endTime: bp.endTime,
            status: (dutyMatch.dutyType === 'Meeting' ? 'Meeting' : 'Assigned Duty') as LiveTeacherStatus,
            dutyTitle: dutyMatch.title,
          };
        }

        freePeriodsToday.push(pNum);
        return {
          period: pNum,
          startTime: bp.startTime,
          endTime: bp.endTime,
          status: (presenceVerified ? 'Free' : 'Not Yet Verified') as LiveTeacherStatus,
        };
      });

      const activeDuty =
        teacherDuties.find(
          (d) =>
            parseTimeToMinutes(d.startTime) <= bell.currentMinutes &&
            parseTimeToMinutes(d.endTime) > bell.currentMinutes,
        ) ?? null;

      const currentSlotEntry =
        bell.activePeriodNumber !== null
          ? daySchedule.find((d) => d.period === bell.activePeriodNumber) ?? null
          : null;

      let currentStatus: LiveTeacherStatus;
      if (leaveApproved) currentStatus = 'On Leave';
      else if (attendanceStatus === 'Absent') currentStatus = 'Absent';
      else if (activeDuty) {
        currentStatus = activeDuty.dutyType === 'Meeting' ? 'Meeting' : 'Assigned Duty';
      } else if (currentSlotEntry) {
        currentStatus = currentSlotEntry.status;
      } else {
        currentStatus = presenceVerified ? 'Free' : 'Not Yet Verified';
      }

      const currentAssignment =
        currentSlotEntry && (currentSlotEntry.status === 'Teaching' || currentSlotEntry.status === 'Substitution')
          ? {
              period: currentSlotEntry.period,
              classSection: currentSlotEntry.classSection || '',
              subject: currentSlotEntry.subject || '',
              roomNumber: currentSlotEntry.roomNumber || 'Campus',
              startTime: currentSlotEntry.startTime,
              endTime: currentSlotEntry.endTime,
              isSubstitution: currentSlotEntry.status === 'Substitution',
            }
          : null;

      const nextSlotEntry =
        daySchedule.find(
          (d) =>
            parseTimeToMinutes(d.startTime) > bell.currentMinutes &&
            (d.status === 'Teaching' || d.status === 'Substitution'),
        ) ?? null;

      const nextAssignment = nextSlotEntry
        ? {
            period: nextSlotEntry.period,
            classSection: nextSlotEntry.classSection || '',
            subject: nextSlotEntry.subject || '',
            roomNumber: nextSlotEntry.roomNumber || 'Campus',
            startTime: nextSlotEntry.startTime,
            endTime: nextSlotEntry.endTime,
          }
        : null;

      const physicallyAvailableForCover =
        presenceVerified && !leaveApproved && currentStatus === 'Free' && !activeDuty;

      return {
        teacherKey,
        teacherName: meta.name,
        teacherId: meta.id,
        designation: meta.designation,
        subjects: Array.from(meta.subjects),
        attendanceStatus,
        presenceVerified,
        leaveApproved,
        currentStatus,
        currentAssignment,
        activeDuty,
        nextAssignment,
        freePeriodsToday,
        scheduledPeriodsToday,
        substitutionsToday,
        physicallyAvailableForCover,
        dutiesToday: teacherDuties,
        daySchedule,
      };
    })
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName));

  // Detect uncovered periods requiring substitutes & rank candidates
  const ruleConfig = input.substituteRuleConfig || createDefaultSubstituteRuleConfig(schoolId);
  const capabilityBands = computeCapabilityBands({ schoolId, timetable: schoolSlots });
  const absentTeachersOnDate = new Set<string>(
    teacherRows
      .filter((t) => t.attendanceStatus === 'Absent' || t.leaveApproved)
      .map((t) => t.teacherName),
  );
  const teacherRowByKey = new Map(teacherRows.map((t) => [t.teacherKey, t]));
  const pendingSubstitutions: PendingSubstitutionNeed[] = [];

  for (const slot of daySlots) {
    const primaryTeacher = splitSlotTeachers(slot.teacherName)[0] || slot.teacherName;
    const absenceInfo = isTeacherAbsentOrOnLeave(primaryTeacher);
    if (!absenceInfo.absent) continue;

    const alreadyCovered = coversToday.some(
      (c) => c.period === slot.period && c.classSection === slot.classSection,
    );
    if (alreadyCovered) continue;

    const bp = teachingPeriods.find((p) => p.periodNumber === slot.period);
    const ranked = rankSubstituteCandidates({
      slot,
      date,
      timetable: schoolSlots,
      ruleConfig,
      capabilityBands,
      teacherProfiles: input.teacherCapabilityProfiles || [],
      existingCovers: coversToday,
      absentTeachersOnDate,
    });

    // Cross-filter ranked candidates against active teaching/substitution, duties & verified attendance
    const recommendations = ranked
      .filter((cand) => {
        if (!cand.eligibleForAutoAssign) return false;
        const tRow = teacherRowByKey.get(normalizeTeacherKey(cand.teacherName));
        if (!tRow) return true;
        if (tRow.attendanceStatus === 'Absent' || tRow.leaveApproved) return false;
        const slotEntry = tRow.daySchedule.find((d) => d.period === slot.period);
        if (
          slotEntry &&
          (slotEntry.status === 'Teaching' ||
            slotEntry.status === 'Substitution' ||
            slotEntry.status === 'Meeting' ||
            slotEntry.status === 'Assigned Duty')
        ) {
          return false;
        }
        return true;
      })
      .slice(0, 5)
      .map((cand) => {
        const tRow = teacherRowByKey.get(normalizeTeacherKey(cand.teacherName));
        return {
          teacherName: cand.teacherName,
          tier: cand.matchTier,
          tierLabel: cand.matchTierLabel,
          score: cand.scorePoints,
          periodsToday: cand.dailyPeriodsBefore,
          presenceVerified: Boolean(tRow?.presenceVerified),
          rationale: `${cand.matchTierLabel} · ${cand.dailyPeriodsBefore} periods today${tRow?.presenceVerified ? ' · Verified Present' : ' · Attendance Unverified'}`,
        };
      });

    pendingSubstitutions.push({
      slotId: slot.id,
      date,
      day: dayCode,
      period: slot.period,
      timeRange: bp ? `${formatHhmmTo12h(bp.startTime)} – ${formatHhmmTo12h(bp.endTime)}` : `Period ${slot.period}`,
      classSection: slot.classSection,
      subject: slot.subject,
      roomNumber: slot.room || 'Assigned Room',
      absentTeacherName: primaryTeacher,
      reason: absenceInfo.reason,
      recommendations,
    });
  }

  pendingSubstitutions.sort((a, b) => a.period - b.period || a.classSection.localeCompare(b.classSection));

  const ongoingEvents = (input.schoolEvents || []).filter(
    (ev) => ev.schoolId === schoolId && ev.eventDate === date && ev.status !== 'Completed',
  );

  const classesOccupiedVerified = classroomRows.filter(
    (r) => r.currentStatus === 'Occupied (verified)',
  ).length;
  const classesOccupiedScheduled = classroomRows.filter(
    (r) => r.currentStatus === 'Occupied (scheduled)',
  ).length;
  const vacantClassroomsNow = classroomRows.filter(
    (r) => r.currentStatus === 'Vacant (verified)' || r.currentStatus === 'Vacant (scheduled)',
  ).length;
  const freeTeachersVerified = teacherRows.filter((t) => t.currentStatus === 'Free').length;
  const freeTeachersUnverified = teacherRows.filter(
    (t) => t.currentStatus === 'Not Yet Verified',
  ).length;
  const teachersAbsentOrLeave = teacherRows.filter(
    (t) => t.currentStatus === 'Absent' || t.currentStatus === 'On Leave',
  ).length;

  return {
    schoolId,
    date,
    dayLabel: dayCode,
    bell,
    summary: {
      classesOccupiedTotal: classesOccupiedVerified + classesOccupiedScheduled,
      classesOccupiedVerified,
      classesOccupiedScheduled,
      vacantClassroomsNow,
      freeTeachersVerified,
      freeTeachersUnverified,
      teachersAbsentOrLeave,
      substitutionsPending: pendingSubstitutions.length,
      substitutionsCovered: coversToday.length,
      activeDutiesCount: dutiesToday.length,
      ongoingEventsCount: ongoingEvents.length,
    },
    classrooms: classroomRows,
    teachers: teacherRows,
    pendingSubstitutions,
    ongoingEvents,
    conflicts,
  };
}

export interface VacantClassroomQuery {
  mode: 'now' | 'next_period' | 'min_30' | 'min_60' | 'custom_range';
  customStartTime?: string;
  customEndTime?: string;
  requiredFacility?: ClassroomFacility | 'ALL';
  minCapacity?: number;
  floor?: string;
  search?: string;
}

export function findVacantClassrooms(
  snapshot: LiveControlRoomSnapshot,
  query: VacantClassroomQuery,
): LiveClassroomRow[] {
  const q = (query.search || '').trim().toLowerCase();
  const customStart = query.customStartTime ? parseTimeToMinutes(query.customStartTime) : null;
  const customEnd = query.customEndTime ? parseTimeToMinutes(query.customEndTime) : null;

  return snapshot.classrooms.filter((row) => {
    const rm = row.classroom;
    if (rm.maintenanceStatus === 'Maintenance' || rm.maintenanceStatus === 'Reserved') return false;
    if (query.minCapacity && rm.capacity < query.minCapacity) return false;
    if (query.requiredFacility && query.requiredFacility !== 'ALL') {
      if (!rm.facilities.includes(query.requiredFacility)) return false;
    }
    if (query.floor && query.floor !== 'ALL' && rm.floor !== query.floor) return false;
    if (q) {
      const hay = `${rm.roomNumber} ${rm.name} ${rm.floor} ${rm.facilities.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    const isVacantStatus = (st: LiveClassroomOccupancyStatus) =>
      st === 'Vacant (verified)' || st === 'Vacant (scheduled)';

    if (query.mode === 'now') {
      return isVacantStatus(row.currentStatus);
    }
    if (query.mode === 'min_30') {
      return isVacantStatus(row.currentStatus) && row.availableMinutesFromNow >= 30;
    }
    if (query.mode === 'min_60') {
      return isVacantStatus(row.currentStatus) && row.availableMinutesFromNow >= 60;
    }
    if (query.mode === 'next_period') {
      const nextP = snapshot.bell.nextPeriodNumber;
      if (nextP === null) return isVacantStatus(row.currentStatus);
      const cell = row.schedule.find((c) => c.periodNumber === nextP);
      return cell ? isVacantStatus(cell.occupancyStatus) : true;
    }
    if (query.mode === 'custom_range' && customStart !== null && customEnd !== null && customEnd > customStart) {
      const overlapping = row.schedule.filter((c) => {
        const sMin = parseTimeToMinutes(c.startTime);
        const eMin = parseTimeToMinutes(c.endTime);
        return sMin < customEnd && eMin > customStart;
      });
      return overlapping.every((c) => isVacantStatus(c.occupancyStatus));
    }
    return true;
  });
}

export interface ControlRoomHistoricalReports {
  teacherUtilization: Array<{
    teacherName: string;
    scheduledPeriods: number;
    substitutions: number;
    freePeriods: number;
    utilizationPct: number;
    attendanceStatus: string;
  }>;
  classroomUtilization: Array<{
    roomNumber: string;
    floor: string;
    capacity: number;
    occupiedPeriods: number;
    verifiedPeriods: number;
    vacantPeriods: number;
    utilizationPct: number;
  }>;
  freePeriodsReport: Array<{
    teacherName: string;
    freePeriods: string;
    verifiedPresent: boolean;
    dutiesCount: number;
  }>;
  substitutionReport: Array<{
    period: number;
    classSection: string;
    subject: string;
    absentTeacher: string;
    substituteTeacher: string;
    status: string;
  }>;
  timetableAdherence: {
    totalScheduledPeriods: number;
    verifiedTeachingCount: number;
    coveredBySubstituteCount: number;
    unallocatedCount: number;
    adherencePct: number;
  };
  unallocatedPeriods: Array<{
    period: number;
    timeRange: string;
    classSection: string;
    subject: string;
    roomNumber: string;
    absentTeacherName: string;
    reason: string;
  }>;
}

export function buildControlRoomHistoricalReports(
  snapshot: LiveControlRoomSnapshot,
  coversToday: SubstitutionAssignmentRecord[] = [],
): ControlRoomHistoricalReports {
  const totalTeachingPeriods = Math.max(1, snapshot.classrooms[0]?.schedule.length || 8);

  const teacherUtilization = snapshot.teachers.map((t) => {
    const busy = t.scheduledPeriodsToday + t.substitutionsToday;
    return {
      teacherName: t.teacherName,
      scheduledPeriods: t.scheduledPeriodsToday,
      substitutions: t.substitutionsToday,
      freePeriods: t.freePeriodsToday.length,
      utilizationPct: Math.min(100, Math.round((busy / totalTeachingPeriods) * 100)),
      attendanceStatus: t.attendanceStatus,
    };
  });

  const classroomUtilization = snapshot.classrooms.map((c) => {
    const occupied = c.schedule.filter(
      (s) => s.occupancyStatus === 'Occupied (verified)' || s.occupancyStatus === 'Occupied (scheduled)',
    ).length;
    const verified = c.schedule.filter((s) => s.occupancyStatus === 'Occupied (verified)').length;
    return {
      roomNumber: c.classroom.roomNumber,
      floor: c.classroom.floor,
      capacity: c.classroom.capacity,
      occupiedPeriods: occupied,
      verifiedPeriods: verified,
      vacantPeriods: Math.max(0, c.schedule.length - occupied),
      utilizationPct: Math.round((occupied / Math.max(1, c.schedule.length)) * 100),
    };
  });

  const freePeriodsReport = snapshot.teachers
    .filter((t) => t.freePeriodsToday.length > 0 && t.attendanceStatus !== 'Absent' && !t.leaveApproved)
    .map((t) => ({
      teacherName: t.teacherName,
      freePeriods: t.freePeriodsToday.map((p) => `P${p}`).join(', '),
      verifiedPresent: t.presenceVerified,
      dutiesCount: t.dutiesToday.length,
    }));

  const substitutionReport = coversToday
    .filter((c) => c.schoolId === snapshot.schoolId && c.date === snapshot.date)
    .map((c) => ({
      period: c.period,
      classSection: c.classSection,
      subject: c.subject,
      absentTeacher: c.absentTeacherName,
      substituteTeacher: c.substituteTeacherName || 'Pending',
      status: c.publishStatus === 'published' ? 'Published' : 'Pending Review',
    }));

  let totalScheduledPeriods = 0;
  let verifiedTeachingCount = 0;
  let coveredBySubstituteCount = 0;
  for (const row of snapshot.classrooms) {
    for (const cell of row.schedule) {
      if (cell.slotId) {
        totalScheduledPeriods += 1;
        if (cell.occupancyStatus === 'Occupied (verified)') verifiedTeachingCount += 1;
        if (cell.isSubstituted) coveredBySubstituteCount += 1;
      }
    }
  }
  const unallocatedCount = snapshot.pendingSubstitutions.length;
  const coveredOrActive = Math.max(0, totalScheduledPeriods - unallocatedCount);
  const adherencePct =
    totalScheduledPeriods > 0 ? Math.round((coveredOrActive / totalScheduledPeriods) * 100) : 100;

  return {
    teacherUtilization,
    classroomUtilization,
    freePeriodsReport,
    substitutionReport,
    timetableAdherence: {
      totalScheduledPeriods,
      verifiedTeachingCount,
      coveredBySubstituteCount,
      unallocatedCount,
      adherencePct,
    },
    unallocatedPeriods: snapshot.pendingSubstitutions.map((p) => ({
      period: p.period,
      timeRange: p.timeRange,
      classSection: p.classSection,
      subject: p.subject,
      roomNumber: p.roomNumber,
      absentTeacherName: p.absentTeacherName,
      reason: p.reason,
    })),
  };
}
