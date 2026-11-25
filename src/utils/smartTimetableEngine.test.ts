import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCapabilityBands,
  createDefaultSubstituteRuleConfig,
  rankSubstituteCandidates,
  runAutoSubstituteEngineForDate,
} from './smartTimetableEngine';
import type { SubstitutionAssignmentRecord, TeacherCapabilityProfile, TimetableSlot } from '../types';

const SAMPLE_SLOTS: TimetableSlot[] = [
  { id: 's1', schoolId: 'sch-1', day: 'Thu', period: 1, timeRange: '09:05 - 09:40', classSection: '10th', subject: 'Physics', teacherName: 'Anand', room: 'R-10' },
  { id: 's2', schoolId: 'sch-1', day: 'Thu', period: 2, timeRange: '09:40 - 10:15', classSection: '10th', subject: 'Physics', teacherName: 'Meenu', room: 'R-10' },
  { id: 's3', schoolId: 'sch-1', day: 'Thu', period: 1, timeRange: '09:05 - 09:40', classSection: '9th', subject: 'English', teacherName: 'Jagriti', room: 'R-9' },
  { id: 's4', schoolId: 'sch-1', day: 'Thu', period: 3, timeRange: '10:15 - 10:50', classSection: '10th', subject: 'English', teacherName: 'Radha', room: 'R-10' },
  { id: 's5', schoolId: 'sch-1', day: 'Thu', period: 2, timeRange: '09:40 - 10:15', classSection: '11th Science', subject: 'Physics', teacherName: 'Yatish', room: 'Lab-1' },
];

test('6-tier scoring ranks same-subject same-class teacher above same-level and available teachers, respecting busy conflicts', () => {
  const rules = createDefaultSubstituteRuleConfig('sch-1');
  const bands = computeCapabilityBands({ schoolId: 'sch-1', timetable: SAMPLE_SLOTS, targetLevelCount: 5 });

  // Slot s1 (Thu P1 10th Physics taught by Anand):
  // - Meenu teaches 10th Physics (Tier 1) and is free P1!
  // - Yatish teaches 11th Science Physics (same level Tier 2) and is free P1!
  // - Radha teaches 10th English (Tier 3) and is free P1!
  // - Jagriti is busy in P1 -> must NOT be eligible for auto-assign!
  const ranked = rankSubstituteCandidates({
    slot: SAMPLE_SLOTS[0],
    date: '2026-11-19',
    timetable: SAMPLE_SLOTS,
    ruleConfig: rules,
    capabilityBands: bands,
    teacherProfiles: [],
    existingCovers: [],
    absentTeachersOnDate: new Set(['Anand']),
  });

  assert.equal(ranked[0].teacherName, 'Meenu');
  assert.equal(ranked[0].matchTier, 1);
  assert.equal(ranked[0].eligibleForAutoAssign, true);

  const jagriti = ranked.find((r) => r.teacherName === 'Jagriti');
  assert.ok(jagriti);
  assert.equal(jagriti.eligibleForAutoAssign, false);
  assert.ok(jagriti.ruleWarnings.some((w) => w.includes('Conflict')));
});

test('Auto-assign NEVER silently overrides a manuallyApproved custom cover and always outputs pending_review', () => {
  const rules = createDefaultSubstituteRuleConfig('sch-1');
  const bands = computeCapabilityBands({ schoolId: 'sch-1', timetable: SAMPLE_SLOTS, targetLevelCount: 5 });
  const profiles: TeacherCapabilityProfile[] = [];

  const manualCover: SubstitutionAssignmentRecord = {
    id: 'sub-2026-11-19-s1',
    schoolId: 'sch-1',
    date: '2026-11-19',
    day: 'Thu',
    period: 1,
    timeRange: '09:05 - 09:40',
    slotId: 's1',
    classSection: '10th',
    subject: 'Physics',
    room: 'R-10',
    absentTeacherName: 'Anand',
    substituteTeacherName: 'Radha',
    assignmentMode: 'custom_manual',
    manuallyApproved: true,
    matchTier: 3,
    matchTierLabel: 'Teaches this class (a different subject)',
    scorePoints: 4000,
    ruleWarnings: [],
    reason: 'Principal requested homeroom revision',
    publishStatus: 'published',
    notifiedTeacher: true,
    assignedBy: 'Principal',
    assignedAt: '2026-11-19T08:00:00Z',
    auditHistory: [],
  };

  const res = runAutoSubstituteEngineForDate({
    schoolId: 'sch-1',
    date: '2026-11-19',
    absentTeachers: ['Anand'],
    timetable: SAMPLE_SLOTS,
    ruleConfig: rules,
    capabilityBands: bands,
    teacherProfiles: profiles,
    existingCovers: [manualCover],
    actorName: 'Coordinator',
    actorRole: 'coordinator',
  });

  assert.equal(res.preservedManualLocks, 1);
  assert.equal(res.generatedCovers.length, 0);

  // Without manual lock, auto-assign recommends Meenu with publishStatus = pending_review
  const freshRes = runAutoSubstituteEngineForDate({
    schoolId: 'sch-1',
    date: '2026-11-19',
    absentTeachers: ['Anand'],
    timetable: SAMPLE_SLOTS,
    ruleConfig: rules,
    capabilityBands: bands,
    teacherProfiles: profiles,
    existingCovers: [],
    actorName: 'Coordinator',
    actorRole: 'coordinator',
  });
  assert.equal(freshRes.generatedCovers.length, 1);
  assert.equal(freshRes.generatedCovers[0].substituteTeacherName, 'Meenu');
  assert.equal(freshRes.generatedCovers[0].publishStatus, 'pending_review');
});

test('Full weekday names (Thursday) normalize cleanly to match ISO date (2026-11-19 -> Thu)', () => {
  const fullDaySlots: TimetableSlot[] = SAMPLE_SLOTS.map((s) => ({
    ...s,
    day: 'Thursday',
  }));
  const rules = createDefaultSubstituteRuleConfig('sch-1');
  const bands = computeCapabilityBands({ schoolId: 'sch-1', timetable: fullDaySlots, targetLevelCount: 5 });
  const res = runAutoSubstituteEngineForDate({
    schoolId: 'sch-1',
    date: '2026-11-19',
    absentTeachers: ['Anand'],
    timetable: fullDaySlots,
    ruleConfig: rules,
    capabilityBands: bands,
    teacherProfiles: [],
    existingCovers: [],
    actorName: 'Principal',
    actorRole: 'principal',
  });
  assert.equal(res.generatedCovers.length, 1);
  assert.equal(res.generatedCovers[0].day, 'Thu');
  assert.equal(res.generatedCovers[0].substituteTeacherName, 'Meenu');
});
