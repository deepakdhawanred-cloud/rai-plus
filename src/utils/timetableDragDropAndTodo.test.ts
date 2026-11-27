import assert from 'node:assert/strict';
import test from 'node:test';
import type { TimetableSlot, UserRole } from '../types';
import type { WorkspaceData } from '../types/workspace';
import {
  computeTeacherScheduleOptimizationSuggestions,
  evaluatePeriodDrop,
} from './timetableDragDropEngine';
import { buildRoleOptimizedTodos, optimizeTodoOrder } from './roleTodoEngine';

const SAMPLE_SLOTS: TimetableSlot[] = [
  {
    id: 's1',
    schoolId: 'sch-1',
    classSection: '10-A',
    day: 'Monday',
    period: 1,
    timeRange: '08:40–09:20',
    subject: 'Mathematics',
    teacherName: 'Amit Sharma',
    room: 'Room 101',
  },
  {
    id: 's2',
    schoolId: 'sch-1',
    classSection: '10-A',
    day: 'Monday',
    period: 2,
    timeRange: '09:20–10:00',
    subject: 'Science',
    teacherName: 'Neha Verma',
    room: 'Room 101',
  },
  {
    id: 's3',
    schoolId: 'sch-1',
    classSection: '9-A',
    day: 'Monday',
    period: 2,
    timeRange: '09:20–10:00',
    subject: 'Mathematics',
    teacherName: 'Amit Sharma',
    room: 'Room 102',
  },
  {
    id: 's4',
    schoolId: 'sch-1',
    classSection: '8-A',
    day: 'Monday',
    period: 3,
    timeRange: '10:00–10:40',
    subject: 'Mathematics',
    teacherName: 'Amit Sharma',
    room: 'Room 103',
  },
  {
    id: 's5',
    schoolId: 'sch-1',
    classSection: '7-A',
    day: 'Monday',
    period: 4,
    timeRange: '10:40–11:20',
    subject: 'Mathematics',
    teacherName: 'Amit Sharma',
    room: 'Room 104',
  },
];

test('evaluatePeriodDrop allows conflict-free move to an empty slot', () => {
  const res = evaluatePeriodDrop({
    slots: SAMPLE_SLOTS,
    sourceSlotId: 's1',
    targetDay: 'Tuesday',
    targetPeriod: 3,
  });
  assert.equal(res.allowed, true);
  assert.equal(res.action, 'move');
  assert.equal(res.conflicts.length, 0);
  const moved = res.nextSlots.find((s) => s.id === 's1')!;
  assert.equal(moved.day, 'Tuesday');
  assert.equal(moved.period, 3);
});

test('evaluatePeriodDrop detects teacher double-booking conflict and blocks drop', () => {
  // Moving s2 (Neha Verma, 10-A Mon P2) to Mon P1 would swap with s1 (Amit Sharma, 10-A Mon P1),
  // which puts Amit Sharma into Mon P2 where Amit Sharma ALREADY teaches 9-A (s3)!
  const res = evaluatePeriodDrop({
    slots: SAMPLE_SLOTS,
    sourceSlotId: 's2',
    targetDay: 'Monday',
    targetPeriod: 1,
    targetSlotId: 's1',
  });
  assert.equal(res.allowed, false);
  assert.ok(res.conflicts.some((c) => c.includes('Amit Sharma')));
});

test('evaluatePeriodDrop allows valid conflict-free swap and respects locked slots', () => {
  const swapRes = evaluatePeriodDrop({
    slots: SAMPLE_SLOTS,
    sourceSlotId: 's2',
    targetDay: 'Monday',
    targetPeriod: 3,
    targetSlotId: 's4',
  });
  // s2 (10-A Neha) -> Mon P3, s4 (8-A Amit) -> Mon P2: Amit is already in 9-A at Mon P2, so blocked!
  assert.equal(swapRes.allowed, false);

  // Swap s4 (8-A Amit, Mon P3) with a clean slot on Wednesday P3
  const extended: TimetableSlot[] = [
    ...SAMPLE_SLOTS,
    {
      id: 's6',
      schoolId: 'sch-1',
      classSection: '8-A',
      day: 'Wednesday',
      period: 3,
      timeRange: '10:00–10:40',
      subject: 'English',
      teacherName: 'Pooja Rao',
      room: 'Room 103',
    },
  ];
  const validSwap = evaluatePeriodDrop({
    slots: extended,
    sourceSlotId: 's4',
    targetDay: 'Wednesday',
    targetPeriod: 3,
    targetSlotId: 's6',
  });
  assert.equal(validSwap.allowed, true);
  assert.equal(validSwap.action, 'swap');
  assert.equal(validSwap.nextSlots.find((s) => s.id === 's4')?.day, 'Wednesday');
  assert.equal(validSwap.nextSlots.find((s) => s.id === 's6')?.day, 'Monday');

  const lockedRes = evaluatePeriodDrop({
    slots: extended,
    sourceSlotId: 's4',
    targetDay: 'Wednesday',
    targetPeriod: 3,
    targetSlotId: 's6',
    lockedSlotIds: ['s6'],
  });
  assert.equal(lockedRes.allowed, false);
  assert.ok(lockedRes.conflicts[0]?.toLowerCase().includes('locked'));
});

test('computeTeacherScheduleOptimizationSuggestions detects 4-in-a-row fatigue and proposes safe moves', () => {
  const analysis = computeTeacherScheduleOptimizationSuggestions(SAMPLE_SLOTS, 'Amit Sharma', 3);
  assert.equal(analysis.maxConsecutiveRun, 4);
  assert.ok(analysis.suggestions.length >= 1, 'Should suggest at least one conflict-free optimization');
  const first = analysis.suggestions[0]!;
  const verified = evaluatePeriodDrop({
    slots: SAMPLE_SLOTS,
    sourceSlotId: first.sourceSlot.id,
    targetDay: first.targetDay,
    targetPeriod: first.targetPeriod,
  });
  assert.equal(verified.allowed, true, 'Every suggested move must be verified conflict-free');
});

function makeMinimalWorkspace(role: UserRole): WorkspaceData {
  return {
    user: {
      id: `u-${role}`,
      schoolId: 'sch-1',
      name: `Test ${role}`,
      email: `${role}@school.edu`,
      role,
      designation: role,
    },
    activeSchool: { id: 'sch-1', name: 'Test School', code: 'TS1', board: 'HBSE', session: '2026-27' } as WorkspaceData['activeSchool'],
    availableSchools: [{ id: 'sch-1', name: 'Test School' } as WorkspaceData['activeSchool']],
    weightsConfig: { weights: {} as WorkspaceData['weightsConfig']['weights'], version: '1', approvedBy: 'Admin' },
    students: [
      { id: 'stu-1', name: 'Aarav Sharma', classSection: '9-A', rollNo: '12', reportApprovalStatus: 'Pending' } as unknown as WorkspaceData['students'][number],
    ],
    studentBreakdowns: {},
    evidence: [],
    notebookEntries: [],
    developmentReviews: [],
    examMarks: [],
    attendance: [],
    resources: [],
    lessonPlans: [],
    timetable: SAMPLE_SLOTS,
    admissionLeads: [],
    homeVisitRecords: [],
    careerRequests: [],
    feeTransactions: [],
    operations: [],
    parentComplaints: [],
    blogArticles: [],
    auditLogs: [],
    publicEnquiries: [],
    cognitiveAttempts: [],
    cognitiveAssignments: [],
    teacherLeaveRequests: [{ id: 'lr-1', status: 'Pending' } as NonNullable<WorkspaceData['teacherLeaveRequests']>[number]],
    gatePasses: [{ id: 'gp-1', status: 'Pending Approval' } as NonNullable<WorkspaceData['gatePasses']>[number]],
    staffSalarySummaries: [{ staffId: 'st-1', payrollStatus: 'Pending Sync' } as NonNullable<WorkspaceData['staffSalarySummaries']>[number]],
    attendanceNotifications: [{ id: 'an-1', acknowledgedAt: undefined } as unknown as NonNullable<WorkspaceData['attendanceNotifications']>[number]],
  };
}

test('buildRoleOptimizedTodos generates tailored actionable tasks for every Rai Plus role and optimizeTodoOrder ranks cleanly', () => {
  const roles: UserRole[] = [
    'super_admin',
    'principal',
    'coordinator',
    'teacher',
    'student',
    'parent',
    'accountant',
    'transport_incharge',
    'counsellor',
  ];

  for (const role of roles) {
    const todos = buildRoleOptimizedTodos(makeMinimalWorkspace(role));
    assert.ok(todos.length >= 2, `Role ${role} should have at least 2 optimized daily tasks`);
    const orderedSmart = optimizeTodoOrder({
      items: todos,
      completedIds: new Set([todos[0]!.id]),
      snoozedIds: new Set(),
      mode: 'smart',
    });
    assert.equal(
      orderedSmart[orderedSmart.length - 1]?.id,
      todos[0]!.id,
      'Completed tasks must always sink to the bottom',
    );
  }

  // Verify quick_wins sorts shortest pending tasks first
  const principalTodos = buildRoleOptimizedTodos(makeMinimalWorkspace('principal'));
  const quickWins = optimizeTodoOrder({
    items: principalTodos,
    completedIds: new Set(),
    snoozedIds: new Set(),
    mode: 'quick_wins',
  });
  assert.ok(
    quickWins[0]!.estimatedMinutes <= quickWins[quickWins.length - 1]!.estimatedMinutes,
    'Quick Wins mode should float shortest tasks ahead of longest tasks',
  );
});
