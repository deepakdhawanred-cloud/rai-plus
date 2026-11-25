import test from 'node:test';
import assert from 'node:assert/strict';
import type { TimetableSlot } from '../types';
import {
  autoPlaceUnscheduledLessons,
  checkManualPlacementClash,
  computePublishedTimelineBars,
  computeStaffTypeCounts,
  computeTimetableWorkloadAnalysis,
  DEFAULT_STAFF_TYPES,
  filterTimetableStaff,
  sameTimetableDay,
  type TimetablePlanVersion,
  type TimetableStaffMember,
} from './smartTimetableMasterEngine';

const SAMPLE_SLOTS: TimetableSlot[] = [
  {
    id: 'sl-1',
    schoolId: 'vis',
    classSection: '10th',
    day: 'Mon',
    period: 1,
    timeRange: '08:35–09:10',
    subject: 'Science',
    teacherName: 'Pooja Dhillon',
    room: 'R-10',
  },
  {
    id: 'sl-2',
    schoolId: 'vis',
    classSection: '10th',
    day: 'Mon',
    period: 2,
    timeRange: '09:10–09:45',
    subject: 'Physics',
    teacherName: 'Anand',
    room: 'R-10',
  },
];

const SAMPLE_STAFF: TimetableStaffMember[] = [
  {
    id: 'st-1',
    name: 'Anand',
    subtitle: 'Physics Teacher',
    email: 'anand@vis.edu',
    staffTypeIds: ['st-teacher'],
    role: 'Member',
    status: 'Joined',
    includeInCover: true,
    workingHoursMode: 'Set Hours',
    timeOffPeriodsPerWeek: 36,
    avatarColor: '#2563eb',
  },
  {
    id: 'st-2',
    name: 'Pooja Dhillon',
    subtitle: 'Science Teacher',
    email: 'pooja@vis.edu',
    staffTypeIds: ['st-teacher'],
    role: 'Member',
    status: 'Awaiting Sign-Up',
    includeInCover: true,
    workingHoursMode: 'Full Time',
    timeOffPeriodsPerWeek: 0,
    avatarColor: '#7c3aed',
  },
];

test('computeTimetableWorkloadAnalysis respects teacher time-off periods and capacity', () => {
  const report = computeTimetableWorkloadAnalysis({
    slots: Array.from({ length: 18 }, (_, i) => ({
      ...SAMPLE_SLOTS[1],
      id: `a-${i}`,
      day: (['Monday', 'Tuesday', 'Wednesday'] as const)[Math.floor(i / 6)],
      period: (i % 6) + 1,
    })),
    staffMembers: SAMPLE_STAFF,
  });

  const anand = report.teachers.find((t) => t.label === 'Anand');
  assert.ok(anand);
  assert.equal(anand.usedPeriods, 18);
  assert.equal(anand.availablePeriods, 18); // 54 - 36 time off
  assert.equal(anand.utilizationPct, 100);
  assert.equal(anand.status, 'full');
});

test('filterTimetableStaff & computeStaffTypeCounts filter accurately by query and status', () => {
  const joinedOnly = filterTimetableStaff(SAMPLE_STAFF, DEFAULT_STAFF_TYPES, '', 'Joined');
  assert.equal(joinedOnly.length, 1);
  assert.equal(joinedOnly[0].name, 'Anand');

  const searchRes = filterTimetableStaff(SAMPLE_STAFF, DEFAULT_STAFF_TYPES, 'pooja', 'All');
  assert.equal(searchRes.length, 1);

  const counts = computeStaffTypeCounts(SAMPLE_STAFF, DEFAULT_STAFF_TYPES);
  assert.equal(counts['st-teacher'], 2);
  assert.equal(counts['st-lab'], 0);
});

test('autoPlaceUnscheduledLessons avoids teacher and class double-booking clashes', () => {
  const clash = checkManualPlacementClash(
    SAMPLE_SLOTS,
    {
      id: 'u1',
      classSection: '9th',
      subject: 'Science',
      teacherName: 'Pooja Dhillon',
      room: 'R-9',
      periodsRemaining: 1,
    },
    'Monday',
    1,
  );
  assert.ok(clash && clash.includes('Pooja Dhillon'));

  const result = autoPlaceUnscheduledLessons({
    existingSlots: SAMPLE_SLOTS,
    unscheduled: [
      {
        id: 'u1',
        classSection: '9th',
        subject: 'Science',
        teacherName: 'Pooja Dhillon',
        room: 'R-9',
        periodsRemaining: 2,
      },
    ],
    schoolId: 'vis',
  });
  assert.equal(result.newlyPlacedCount, 2);
  assert.equal(result.remainingUnscheduled.length, 0);
  // Ensure Pooja Dhillon was NOT double-booked on Monday Period 1
  const monP1Pooja = result.placedSlots.filter(
    (s) => sameTimetableDay(s.day, 'Monday') && s.period === 1 && s.teacherName === 'Pooja Dhillon',
  );
  assert.equal(monP1Pooja.length, 1);
});

test('computePublishedTimelineBars positions published plans and Today marker cleanly', () => {
  const plans: TimetablePlanVersion[] = [
    {
      id: 'p1',
      name: 'November 2026',
      versionLabel: 'v3',
      status: 'Published',
      effectiveFrom: '2026-11-02',
      effectiveTo: '2027-01-31',
      updatedAt: '2026-11-02',
    },
  ];
  const layout = computePublishedTimelineBars({
    plans,
    windowStartIso: '2026-10-01',
    windowEndIso: '2027-01-31',
    todayIso: '2026-11-21',
  });
  assert.equal(layout.bars.length, 1);
  assert.equal(layout.bars[0].visible, true);
  assert.ok(layout.todayMarkerPct !== null && layout.todayMarkerPct > 30 && layout.todayMarkerPct < 55);
});
