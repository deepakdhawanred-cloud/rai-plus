import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase } from '../../server/seedData';
import type {
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  StudentRecord,
} from '../types';
import {
  computeClassGrowthLeaderboard,
  computeSchoolGrowthLeaderboards,
  sortLeaderboardEntriesForDomain,
} from './growthLeaderboardEngine';
import { filterClassGrowthLeaderboardsForRole } from './roleVisibilityAudit';

function makeStudent(id: string, name: string, classSection = '6-A'): StudentRecord {
  return {
    id,
    schoolId: 'school-vis-jjr',
    admissionNo: `VIS-${id}`,
    rollNo: '01',
    name,
    classSection,
    guardianName: 'Guardian',
    guardianPhone: '+91 98000 00001',
    udiseStudentId: `UDISE-${id}`,
    haryanaMisId: `MIS-${id}`,
    house: 'Shakti',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 45000,
    formulaVersion: 'v1.2',
    reportApprovalStatus: 'Approved',
    confidentialCounsellorNote: '',
    responsibilities: [],
    achievements: [],
    documents: [],
  };
}

test('computeClassGrowthLeaderboard ranks students by fluency + accuracy growth and computes exact class-average deltas', () => {
  const students = [
    makeStudent('s1', 'Aarav'),
    makeStudent('s2', 'Bhavna'),
    makeStudent('s3', 'Chirag'),
  ];

  // s2 (Bhavna) makes largest fluency + accuracy growth (+26 WPM, +20% reading accuracy, +20% tables, +18% mental math)
  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'r-s1-apr',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      month: 'April',
      year: 2026,
      wpm: 100,
      accuracyPct: 80,
      comprehensionPct: 80,
      overallPct: 82,
      readingBand: 'Proficient',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-04-20',
    },
    {
      id: 'r-s1-nov',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      month: 'November',
      year: 2026,
      wpm: 113, // +13 WPM -> +10.0 pts (Class 6 target 130)
      accuracyPct: 86, // +6%
      comprehensionPct: 88,
      overallPct: 87,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
    {
      id: 'r-s2-apr',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      month: 'April',
      year: 2026,
      wpm: 78,
      accuracyPct: 70,
      comprehensionPct: 72,
      overallPct: 71,
      readingBand: 'Proficient',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-04-20',
    },
    {
      id: 'r-s2-nov',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      month: 'November',
      year: 2026,
      wpm: 104, // +26 WPM -> +20.0 pts
      accuracyPct: 90, // +20%
      comprehensionPct: 88,
      overallPct: 89,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
  ];

  const numeracyReports: MonthlyNumeracyReport[] = [
    {
      id: 'n-s1-apr',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      month: 'April',
      year: 2026,
      tablesFluencyPct: 80,
      mentalMathPct: 80,
      problemSolvingPct: 80,
      overallPct: 80,
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-04-20',
    },
    {
      id: 'n-s1-nov',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 86,
      mentalMathPct: 86,
      problemSolvingPct: 86,
      overallPct: 86,
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
    {
      id: 'n-s2-apr',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      month: 'April',
      year: 2026,
      tablesFluencyPct: 68,
      mentalMathPct: 70,
      problemSolvingPct: 70,
      overallPct: 70,
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-04-20',
    },
    {
      id: 'n-s2-nov',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 88,
      mentalMathPct: 88,
      problemSolvingPct: 88,
      overallPct: 88,
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
    // s3 only has 1 numeracy report -> unranked baseline rather than penalized
    {
      id: 'n-s3-nov',
      schoolId: 'school-vis-jjr',
      studentId: 's3',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 75,
      mentalMathPct: 75,
      problemSolvingPct: 75,
      overallPct: 75,
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
  ];

  const board = computeClassGrowthLeaderboard({
    classSection: '6-A',
    classStudents: students,
    readingReports,
    numeracyReports,
  });

  assert.equal(board.benchmarks.totalStudents, 3);
  assert.equal(board.benchmarks.rankedStudents, 2);
  assert.equal(board.entries[0].studentId, 's2');
  assert.equal(board.entries[0].combinedRank, 1);
  assert.equal(board.entries[0].readingWpmGain, 26);
  assert.equal(board.entries[0].growthTier, 'Accelerated Climber');
  assert.equal(board.entries[1].studentId, 's1');
  assert.equal(board.entries[1].combinedRank, 2);

  // s3 has only 1 month so stays unranked (not 0/last penalized unfairly)
  assert.equal(board.entries[2].studentId, 's3');
  assert.equal(board.entries[2].combinedRank, null);
  assert.equal(board.entries[2].hasGrowthBaseline, false);

  // Signed delta vs class average
  assert.ok((board.entries[0].vsClassFluencyGrowthDelta ?? 0) > 0);
  assert.ok((board.entries[1].vsClassFluencyGrowthDelta ?? 0) < 0);
});

test('filterClassGrowthLeaderboardsForRole strictly anonymizes peers for students/parents and restricts classes for teachers', () => {
  const db = createInitialDatabase();
  const schoolId = 'school-vis-jjr';
  const visStudents = db.students.filter((s) => s.schoolId === schoolId);
  const full = computeSchoolGrowthLeaderboards({
    schoolCode: 'VIS-JJR-01',
    students: visStudents,
    readingReports: db.readingReports.filter((r) => r.schoolId === schoolId),
    numeracyReports: db.numeracyReports.filter((n) => n.schoolId === schoolId),
  });

  const studentFiltered = filterClassGrowthLeaderboardsForRole({
    role: 'student',
    fullLeaderboards: full,
    visibleStudentIds: new Set(['stu-vis-601']),
    visibleClassSections: new Set(['6-A']),
  });

  assert.deepEqual(studentFiltered.classSections, ['6-A']);
  const entries6A = studentFiltered.classLeaderboards['6-A'].entries;
  assert.ok(entries6A.length > 5);

  const selfEntry = entries6A.find((e) => e.isCurrentUser);
  assert.ok(selfEntry);
  assert.equal(selfEntry.studentId, 'stu-vis-601');

  const peerEntries = entries6A.filter((e) => !e.isCurrentUser);
  assert.ok(peerEntries.length > 0);
  for (const peer of peerEntries) {
    assert.equal(peer.realStudentName, undefined);
    assert.ok(peer.studentId.startsWith('anon-6-A-'));
    assert.ok(peer.displayName.startsWith('Class 6-A Learner'));
  }

  // Domain sorting preserves order cleanly
  const readingSorted = sortLeaderboardEntriesForDomain(entries6A, 'reading');
  assert.equal(readingSorted[0].readingRank, 1);

  // Counsellor gets empty object
  const counsellorFiltered = filterClassGrowthLeaderboardsForRole({
    role: 'counsellor',
    fullLeaderboards: full,
    visibleStudentIds: new Set(),
    visibleClassSections: new Set(),
  });
  assert.deepEqual(counsellorFiltered.classSections, []);
  assert.deepEqual(counsellorFiltered.classLeaderboards, {});
});
