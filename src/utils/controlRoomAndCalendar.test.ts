import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  SchoolEvent,
  StaffAttendanceRecord,
  StaffProfile,
  SubstitutionAssignmentRecord,
  TeacherLeaveRequest,
  TimetableSlot,
} from '../types';
import type {
  PeriodCheckInRecord,
  SchoolClassroom,
  TeacherDutyRecord,
} from '../types/controlRoomCalendar';
import {
  DEFAULT_BELL_SCHEDULE,
  buildControlRoomHistoricalReports,
  buildLiveControlRoomSnapshot,
  evaluateBellContext,
  findVacantClassrooms,
} from './liveSchoolTimelineEngine.ts';
import {
  analyzeCalendarModificationImpact,
  applyApprovedCalendarDraft,
  computeWorkingDaysMetrics,
  createInitialAcademicCalendar,
  rollbackAcademicCalendarToVersion,
} from './smartAcademicCalendarEngine.ts';

const SAMPLE_TIMETABLE: TimetableSlot[] = [
  {
    id: 'tt-1',
    schoolId: 'school-a',
    day: 'Mon',
    period: 3,
    timeRange: '10:15 - 10:50',
    classSection: '7-A',
    subject: 'Science',
    teacherName: 'Amit Sharma',
    room: 'Room 101',
  },
  {
    id: 'tt-2',
    schoolId: 'school-a',
    day: 'Mon',
    period: 3,
    timeRange: '10:15 - 10:50',
    classSection: '8-A',
    subject: 'Maths',
    teacherName: 'Neha Verma',
    room: 'Room 102',
  },
  {
    id: 'tt-3',
    schoolId: 'school-a',
    day: 'Mon',
    period: 4,
    timeRange: '10:50 - 11:25',
    classSection: '7-A',
    subject: 'English',
    teacherName: 'Rajesh Singh',
    room: 'Room 101',
  },
  {
    id: 'tt-4',
    schoolId: 'school-a',
    day: 'Mon',
    period: 4,
    timeRange: '10:50 - 11:25',
    classSection: '8-A',
    subject: 'Science',
    teacherName: 'Amit Sharma',
    room: 'Room 102',
  },
  // Tenant B slot (must never leak into school-a)
  {
    id: 'tt-b-1',
    schoolId: 'school-b',
    day: 'Mon',
    period: 3,
    timeRange: '10:15 - 10:50',
    classSection: '9-B',
    subject: 'Physics',
    teacherName: 'Other Tenant Teacher',
    room: 'Room 901',
  },
];

const SAMPLE_PROFILES: StaffProfile[] = [
  {
    id: 'stf-1',
    schoolId: 'school-a',
    employeeCode: 'T01',
    name: 'Amit Sharma',
    designation: 'TGT Science',
    roleType: 'Teacher',
    department: 'Science',
    baseMonthlySalaryInr: 35000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 1000,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    bankAccountNumber: '1111',
    ifscCode: 'SBIN0000123',
    bankName: 'SBI',
    active: true,
  },
  {
    id: 'stf-2',
    schoolId: 'school-a',
    employeeCode: 'T02',
    name: 'Neha Verma',
    designation: 'TGT Maths',
    roleType: 'Teacher',
    department: 'Maths',
    baseMonthlySalaryInr: 36000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 1000,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    bankAccountNumber: '2222',
    ifscCode: 'SBIN0000123',
    bankName: 'SBI',
    active: true,
  },
  {
    id: 'stf-3',
    schoolId: 'school-a',
    employeeCode: 'T03',
    name: 'Rajesh Singh',
    designation: 'TGT English',
    roleType: 'Teacher',
    department: 'English',
    baseMonthlySalaryInr: 34000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 1000,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    bankAccountNumber: '3333',
    ifscCode: 'SBIN0000123',
    bankName: 'SBI',
    active: true,
  },
];

test('1. Bell Schedule Engine accurately identifies active period, elapsed %, countdown, and transitions', () => {
  const duringP3 = evaluateBellContext('10:25', DEFAULT_BELL_SCHEDULE);
  assert.equal(duringP3.dayPhase, 'in_session');
  assert.equal(duringP3.activePeriodNumber, 3);
  assert.equal(duringP3.nextPeriodNumber, 4);
  assert.equal(duringP3.remainingMinutes, 25); // 10:50 - 10:25
  assert.ok(duringP3.periodElapsedPct >= 25 && duringP3.periodElapsedPct <= 35);

  const duringBreak = evaluateBellContext('11:30', DEFAULT_BELL_SCHEDULE);
  assert.equal(duringBreak.activeSlot?.kind, 'break');
  assert.equal(duringBreak.activePeriodNumber, null);
  assert.equal(duringBreak.nextPeriodNumber, 5);

  const afterSchool = evaluateBellContext('15:00', DEFAULT_BELL_SCHEDULE);
  assert.equal(afterSchool.dayPhase, 'after_school');
});

test('2. Live School Control Room distinguishes verified vs scheduled occupancy, verified free vs unverified teachers, duties, and substitutes', () => {
  const date = '2026-11-23'; // Monday
  const staffAtt: StaffAttendanceRecord[] = [
    {
      id: 'att-1',
      schoolId: 'school-a',
      staffId: 'stf-1',
      date,
      status: 'Present',
      markingMode: 'manual',
      markedBy: 'Admin Office',
      updatedAt: `${date}T08:00:00Z`,
    },
    {
      id: 'att-3',
      schoolId: 'school-a',
      staffId: 'stf-3',
      date,
      status: 'Present',
      markingMode: 'manual',
      markedBy: 'Admin Office',
      updatedAt: `${date}T08:00:00Z`,
    },
  ];
  const leaves: TeacherLeaveRequest[] = [
    {
      id: 'lv-1',
      schoolId: 'school-a',
      teacherName: 'Neha Verma',
      leaveType: 'Medical Leave',
      startDate: date,
      endDate: date,
      reason: 'Fever',
      status: 'Approved',
      appliedAt: `${date}T07:00:00Z`,
      affectedSlotCount: 1,
      generatedCoverIds: [],
      auditTrail: [],
    },
  ];
  const checkIns: PeriodCheckInRecord[] = [
    {
      id: 'chk-1',
      schoolId: 'school-a',
      date,
      period: 3,
      classSection: '7-A',
      roomNumber: 'Room 101',
      teacherName: 'Amit Sharma',
      subject: 'Science',
      status: 'verified_teaching',
      verifiedBy: 'Amit Sharma',
      verifiedAt: `${date}T10:17:00Z`,
    },
  ];
  const duties: TeacherDutyRecord[] = [
    {
      id: 'duty-1',
      schoolId: 'school-a',
      date,
      teacherName: 'Rajesh Singh',
      startTime: '11:40',
      endTime: '12:15',
      period: 5,
      dutyType: 'Meeting',
      title: 'Parent Coordination Meeting',
      createdBy: 'Principal',
      createdAt: `${date}T09:00:00Z`,
    },
  ];

  const snap = buildLiveControlRoomSnapshot({
    schoolId: 'school-a',
    date,
    currentTimeHhmm: '10:25', // Period 3
    timetable: SAMPLE_TIMETABLE,
    staffAttendance: staffAtt,
    staffProfiles: SAMPLE_PROFILES,
    teacherLeaveRequests: leaves,
    periodCheckIns: checkIns,
    teacherDuties: duties,
  });

  // Multi-tenant check: School B room must never appear in School A
  assert.equal(
    snap.classrooms.some((r) => r.classroom.roomNumber === 'Room 901'),
    false,
  );

  // Room 101 is verified occupied; Room 102 needs substitute because Neha Verma is on Approved Leave
  const r101 = snap.classrooms.find((r) => r.classroom.roomNumber === 'Room 101')!;
  const r102 = snap.classrooms.find((r) => r.classroom.roomNumber === 'Room 102')!;
  assert.equal(r101.currentStatus, 'Occupied (verified)');
  assert.equal(r102.currentPeriodCell?.needsSubstitute, true);
  assert.equal(snap.summary.substitutionsPending, 1);

  // Rajesh Singh is verified present and free in Period 3, and in a Meeting in Period 5
  const rajesh = snap.teachers.find((t) => t.teacherName === 'Rajesh Singh')!;
  assert.equal(rajesh.currentStatus, 'Free');
  assert.equal(rajesh.physicallyAvailableForCover, true);
  assert.equal(rajesh.daySchedule.find((d) => d.period === 5)?.status, 'Meeting');

  // Substitute recommendation must suggest Rajesh Singh (not Amit who is teaching P3, nor Neha who is on leave)
  const pending = snap.pendingSubstitutions[0];
  assert.equal(pending.classSection, '8-A');
  assert.ok(pending.recommendations.some((r) => r.teacherName === 'Rajesh Singh'));
  assert.equal(
    pending.recommendations.some((r) => r.teacherName === 'Amit Sharma'),
    false,
  );

  // Vacant Classroom Finder supports duration & facility filters
  const vacantNow = findVacantClassrooms(snap, { mode: 'now', minCapacity: 30 });
  assert.ok(vacantNow.some((r) => r.classroom.roomNumber === 'Room 103'));
  const smartVacant60 = findVacantClassrooms(snap, {
    mode: 'min_60',
    requiredFacility: 'Smart Board',
    minCapacity: 30,
  });
  assert.ok(smartVacant60.length >= 1);

  // Historical reports reconcile accurately
  const reports = buildControlRoomHistoricalReports(snap, []);
  assert.equal(reports.unallocatedPeriods.length, 1);
  assert.ok(reports.teacherUtilization.length >= 3);
  assert.ok(reports.classroomUtilization.length >= 4);
});

test('3. Conflict detection catches double-booked teacher and double-booked classroom simultaneously', () => {
  const conflictedSlots: TimetableSlot[] = [
    ...SAMPLE_TIMETABLE,
    {
      id: 'tt-conflict-1',
      schoolId: 'school-a',
      day: 'Mon',
      period: 3,
      timeRange: '10:15 - 10:50',
      classSection: '9-A',
      subject: 'Physics',
      teacherName: 'Amit Sharma', // Same teacher & room as tt-1!
      room: 'Room 101',
    },
  ];
  const snap = buildLiveControlRoomSnapshot({
    schoolId: 'school-a',
    date: '2026-11-23',
    currentTimeHhmm: '10:25',
    timetable: conflictedSlots,
  });
  assert.ok(snap.conflicts.some((c) => c.type === 'teacher_double_booking'));
  assert.ok(snap.conflicts.some((c) => c.type === 'room_double_booking'));
});

test('4. Smart Academic Calendar supports Automatic/Manual/Hybrid modes, 5-day closure impact analysis, locked exam protection, approval & rollback', () => {
  const hybridCal = createInitialAcademicCalendar({
    schoolId: 'school-a',
    board: 'HBSE',
    mode: 'Hybrid',
  });
  const manualCal = createInitialAcademicCalendar({
    schoolId: 'school-b',
    board: 'CBSE',
    mode: 'Manual',
  });
  assert.ok(hybridCal.entries.length >= 10, 'Hybrid mode imports board baseline entries');
  assert.equal(manualCal.entries.length, 0, 'Manual mode starts clean for custom entry');

  const baseMetrics = computeWorkingDaysMetrics(hybridCal);
  assert.ok(baseMetrics.instructionalTeachingDays > 180);

  // Mid-session 5-day extreme weather closure (24–28 Nov 2026)
  const schoolEvents: SchoolEvent[] = [
    {
      id: 'ev-1',
      schoolId: 'school-a',
      title: 'Annual Science Fair',
      category: 'Science & Innovation',
      eventDate: '2026-11-26',
      timeSlot: '10:00 AM',
      venue: 'Auditorium',
      targetClasses: ['All'],
      dedicatedCoordinatorName: 'Dr. Sharma',
      assignedTeachers: [],
      registrationDeadline: '2026-11-20',
      maxParticipants: 200,
      status: 'Scheduled',
      readinessPct: 80,
      description: 'Campus showcase',
      progressSummary: '',
      milestones: [],
      createdBy: 'Principal',
      createdAt: '2026-11-01',
      updatedAt: '2026-11-01',
    },
  ];

  const impact = analyzeCalendarModificationImpact({
    calendar: hybridCal,
    proposedEntry: {
      id: 'cal-weather-closure',
      date: '2026-11-24',
      endDate: '2026-11-28',
      title: 'Extreme Weather 5-Day Closure',
      type: 'Holiday',
      source: 'School Custom',
    },
    actionType: 'Add',
    timetable: SAMPLE_TIMETABLE,
    schoolEvents,
  });

  assert.equal(impact.instructionalDaysDelta, -5, '5 working days (Tue–Sat) lost');
  assert.ok(impact.affectedItems.some((i) => i.category === 'Examination'));
  assert.ok(impact.affectedItems.some((i) => i.category === 'PTM'));
  assert.ok(impact.affectedItems.some((i) => i.category === 'Curriculum Chapter'));
  assert.ok(impact.affectedItems.some((i) => i.title === 'Annual Science Fair'));

  // Locked official board exam protection check
  const boardEntry = hybridCal.entries.find((e) => e.type === 'Board Exam')!;
  const lockedImpact = analyzeCalendarModificationImpact({
    calendar: hybridCal,
    proposedEntry: {
      id: 'cal-overlap-board',
      date: boardEntry.date,
      title: 'Attempted Holiday on Board Exam',
      type: 'Holiday',
      source: 'School Custom',
    },
    actionType: 'Add',
    timetable: SAMPLE_TIMETABLE,
  });
  assert.ok(
    lockedImpact.conflicts.some((c) => c.lockedOfficialConflict === true),
    'Collision with locked Board Exam must trigger High-severity locked conflict',
  );
  const lockedAff = lockedImpact.affectedItems.find((i) => i.isLockedOfficial);
  assert.ok(lockedAff);
  assert.equal(lockedAff.originalDate, lockedAff.proposedDate, 'Locked Board Exam must NEVER be auto-moved');
  assert.equal(lockedAff.approved, false);

  // Approve 5-day closure draft -> publishes v2, updates events & notifies stakeholders
  const draft = {
    id: 'draft-1',
    schoolId: 'school-a',
    createdAt: new Date().toISOString(),
    createdBy: 'Principal',
    reason: 'District weather advisory',
    reschedulingMode: 'Semi-Automatic' as const,
    actionType: 'Add' as const,
    proposedEntry: {
      id: 'cal-weather-closure',
      date: '2026-11-24',
      endDate: '2026-11-28',
      title: 'Extreme Weather 5-Day Closure',
      type: 'Holiday' as const,
      source: 'School Custom' as const,
    },
    impactReport: impact,
    status: 'Pending Approval' as const,
  };
  hybridCal.pendingDrafts.push(draft);

  const { updatedCalendar, eventDateUpdates, notification } = applyApprovedCalendarDraft({
    calendar: hybridCal,
    draft,
    approvedBy: 'Principal',
  });
  assert.equal(updatedCalendar.currentVersion, 2);
  assert.ok(updatedCalendar.entries.some((e) => e.id === 'cal-weather-closure'));
  assert.ok(eventDateUpdates.some((u) => u.eventTitle === 'Annual Science Fair'));
  assert.ok(notification.changedItems.length >= 2);

  // 1-Click Rollback back to v1 -> publishes v3 with exact original v1 entries restored
  const rolledBack = rollbackAcademicCalendarToVersion({
    calendar: updatedCalendar,
    targetVersion: 1,
    rolledBackBy: 'Principal',
    reason: 'Weather advisory lifted',
  });
  assert.ok(rolledBack);
  assert.equal(rolledBack.currentVersion, 3);
  assert.equal(
    rolledBack.entries.some((e) => e.id === 'cal-weather-closure'),
    false,
    'Rollback to v1 must cleanly remove the v2 closure entry',
  );
});
