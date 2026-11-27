import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  StaffAttendanceRecord,
  StaffProfile,
  SubstitutionAssignmentRecord,
  TeacherLeaveRequest,
  TimetableSlot,
} from '../types';
import { buildTeacherSemesterHeatmap } from './teacherProductivityHeatmapEngine.ts';

const MOCK_STAFF: StaffProfile[] = [
  {
    id: 'stf-anita',
    schoolId: 'school-1',
    employeeCode: 'T-01',
    name: 'Anita Sharma',
    roleType: 'Teacher',
    designation: 'PGT Mathematics',
    department: 'Mathematics',
    baseMonthlySalaryInr: 42000,
    fixedAllowanceInr: 3000,
    pfOrDeductionInr: 1800,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    active: true,
  },
  {
    id: 'stf-rajesh',
    schoolId: 'school-1',
    employeeCode: 'T-02',
    name: 'Rajesh Verma',
    roleType: 'Teacher',
    designation: 'TGT Science',
    department: 'Science',
    baseMonthlySalaryInr: 36000,
    fixedAllowanceInr: 2000,
    pfOrDeductionInr: 1500,
    workingDaysPerMonth: 26,
    paidLeaveAllowance: 2,
    active: true,
  },
];

function createTimetable(teacherName: string, count: number, subject: string): TimetableSlot[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `tt-${teacherName}-${idx}`,
    schoolId: 'school-1',
    classSection: '8-A',
    day: 'Mon',
    period: (idx % 7) + 1,
    timeRange: '08:30-09:10',
    subject,
    teacherName,
  }));
}

test('1. Detects burnout risk when high regular workload combines with substitute spikes and absences', () => {
  const timetable = [
    ...createTimetable('Anita Sharma', 30, 'Mathematics'), // >100% of 28 target
    ...createTimetable('Rajesh Verma', 24, 'Science'), // 86% sustainable load
  ];

  const substitutions: SubstitutionAssignmentRecord[] = [
    {
      id: 'sub-1',
      schoolId: 'school-1',
      date: '2026-11-23',
      day: 'Mon',
      period: 3,
      timeRange: '10:00-10:40',
      slotId: 'slot-1',
      classSection: '7-B',
      subject: 'Mathematics',
      room: 'R-201',
      absentTeacherName: 'Other Teacher',
      substituteTeacherName: 'Anita Sharma',
      assignmentMode: 'auto_assigned',
      manuallyApproved: true,
      matchTier: 1,
      matchTierLabel: 'Same Subject',
      scorePoints: 95,
      ruleWarnings: [],
      reason: 'Cover assigned',
      publishStatus: 'published',
      notifiedTeacher: true,
      assignedBy: 'Principal',
      assignedAt: '2026-11-23T07:30:00Z',
      auditHistory: [],
    },
    {
      id: 'sub-2',
      schoolId: 'school-1',
      date: '2026-11-24',
      day: 'Tue',
      period: 4,
      timeRange: '10:40-11:20',
      slotId: 'slot-2',
      classSection: '9-A',
      subject: 'Mathematics',
      room: 'R-204',
      absentTeacherName: 'Other Teacher',
      substituteTeacherName: 'Anita Sharma',
      assignmentMode: 'auto_assigned',
      manuallyApproved: true,
      matchTier: 1,
      matchTierLabel: 'Same Subject',
      scorePoints: 90,
      ruleWarnings: [],
      reason: 'Cover assigned',
      publishStatus: 'published',
      notifiedTeacher: true,
      assignedBy: 'Principal',
      assignedAt: '2026-11-24T07:30:00Z',
      auditHistory: [],
    },
  ];

  const staffAttendance: StaffAttendanceRecord[] = [
    {
      id: 'att-1',
      schoolId: 'school-1',
      staffId: 'stf-anita',
      date: '2026-11-25',
      status: 'Absent',
      markingMode: 'manual',
      markedBy: 'Admin',
      updatedAt: '2026-11-25T08:00:00Z',
    },
    {
      id: 'att-2',
      schoolId: 'school-1',
      staffId: 'stf-rajesh',
      date: '2026-11-23',
      status: 'Present',
      markingMode: 'manual',
      markedBy: 'Admin',
      updatedAt: '2026-11-23T08:00:00Z',
    },
    {
      id: 'att-3',
      schoolId: 'school-1',
      staffId: 'stf-rajesh',
      date: '2026-11-24',
      status: 'Present',
      markingMode: 'manual',
      markedBy: 'Admin',
      updatedAt: '2026-11-24T08:00:00Z',
    },
  ];

  const model = buildTeacherSemesterHeatmap({
    staffProfiles: MOCK_STAFF,
    staffAttendance,
    timetable,
    substitutions,
    referenceDateIso: '2026-11-25',
    weekCount: 12,
  });

  assert.equal(model.weeks.length, 12);
  assert.equal(model.teachers.length, 2);

  const anitaRow = model.teachers.find((t) => t.teacherName === 'Anita Sharma');
  const rajeshRow = model.teachers.find((t) => t.teacherName === 'Rajesh Verma');
  assert.ok(anitaRow && rajeshRow);

  const anitaLatestCell = anitaRow.cells[anitaRow.cells.length - 1];
  assert.equal(anitaLatestCell.category, 'burnout_risk');
  assert.equal(anitaLatestCell.dataBasis, 'logged');
  assert.equal(anitaLatestCell.substitutePeriods, 2);
  assert.equal(anitaLatestCell.absentDays, 1);

  const rajeshLatestCell = rajeshRow.cells[rajeshRow.cells.length - 1];
  assert.equal(rajeshLatestCell.category, 'high_efficiency');
  assert.equal(rajeshLatestCell.attendancePct, 100);
});

test('2. Accurately maps multi-day approved teacher leave requests into leave_cluster cells', () => {
  const timetable = createTimetable('Rajesh Verma', 22, 'Science');
  const leaveRequests: TeacherLeaveRequest[] = [
    {
      id: 'lv-1',
      schoolId: 'school-1',
      teacherName: 'Rajesh Verma',
      leaveType: 'Medical Leave',
      startDate: '2026-11-16',
      endDate: '2026-11-18',
      reason: 'Recovery',
      status: 'Approved',
      appliedAt: '2026-11-15T10:00:00Z',
      affectedSlotCount: 12,
      generatedCoverIds: [],
      auditTrail: [],
    },
  ];

  const model = buildTeacherSemesterHeatmap({
    staffProfiles: MOCK_STAFF,
    timetable,
    leaveRequests,
    referenceDateIso: '2026-11-25',
    weekCount: 12,
    restrictToTeacherName: 'Rajesh Verma',
  });

  assert.equal(model.teachers.length, 1, 'restrictToTeacherName must isolate single teacher');
  const weekWithLeave = model.teachers[0].cells.find((c) => c.leaveDays >= 3);
  assert.ok(weekWithLeave, 'Expected 3-day leave request to populate target semester week');
  assert.equal(weekWithLeave.category, 'leave_cluster');
  assert.equal(weekWithLeave.attendancePct, 50);
});
