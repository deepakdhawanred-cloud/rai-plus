import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  ComputerSkillAttempt,
  MonthlyReadingReport,
  StudentRecord,
  ThinkingAssessmentSession,
} from '../types';
import {
  applyLeaderboardPrivacyView,
  computeRelativeImprovementPct,
  computeSkillMonthlyGrowthLeaderboard,
  maskStudentName,
  PRIVACY_PRESETS,
  resolveDefaultPrivacyForRole,
} from './skillGrowthLeaderboardEngine';

const STUDENTS: StudentRecord[] = [
  {
    id: 's1',
    schoolId: 'sch1',
    admissionNo: 'ADM-01',
    rollNo: '01',
    name: 'Aarav Sharma',
    classSection: '6-A',
    house: 'Arjuna',
    guardianName: 'Rajesh',
    guardianPhone: '9999999991',
    udiseStudentId: 'U1',
    haryanaMisId: 'H1',
    attendancePct: 95,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
  {
    id: 's2',
    schoolId: 'sch1',
    admissionNo: 'ADM-02',
    rollNo: '02',
    name: 'Diya Verma',
    classSection: '6-A',
    house: 'Kalpana',
    guardianName: 'Sunita',
    guardianPhone: '9999999992',
    udiseStudentId: 'U2',
    haryanaMisId: 'H2',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
  {
    id: 's3',
    schoolId: 'sch1',
    admissionNo: 'ADM-03',
    rollNo: '03',
    name: 'Kabir Hooda',
    classSection: '6-A',
    house: 'Vikramaditya',
    guardianName: 'Manoj',
    guardianPhone: '9999999993',
    udiseStudentId: 'U3',
    haryanaMisId: 'H3',
    attendancePct: 89,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
];

test('computeSkillMonthlyGrowthLeaderboard ranks class by relative monthly improvement %', () => {
  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'r1',
      schoolId: 'sch1',
      studentId: 's1',
      month: 'October',
      year: 2026,
      wpm: 90,
      accuracyPct: 70,
      comprehensionPct: 70,
      overallPct: 70,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-15',
    },
    {
      id: 'r2',
      schoolId: 'sch1',
      studentId: 's1',
      month: 'November',
      year: 2026,
      wpm: 105,
      accuracyPct: 86,
      comprehensionPct: 86,
      overallPct: 86,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-15',
    },
    {
      id: 'r3',
      schoolId: 'sch1',
      studentId: 's2',
      month: 'October',
      year: 2026,
      wpm: 100,
      accuracyPct: 82,
      comprehensionPct: 82,
      overallPct: 82,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-15',
    },
    {
      id: 'r4',
      schoolId: 'sch1',
      studentId: 's2',
      month: 'November',
      year: 2026,
      wpm: 103,
      accuracyPct: 85,
      comprehensionPct: 85,
      overallPct: 85,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-15',
    },
    {
      id: 'r5',
      schoolId: 'sch1',
      studentId: 's3',
      month: 'October',
      year: 2026,
      wpm: 80,
      accuracyPct: 74,
      comprehensionPct: 74,
      overallPct: 74,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-15',
    },
    {
      id: 'r6',
      schoolId: 'sch1',
      studentId: 's3',
      month: 'November',
      year: 2026,
      wpm: 76,
      accuracyPct: 70,
      comprehensionPct: 70,
      overallPct: 70,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-15',
    },
  ];

  const board = computeSkillMonthlyGrowthLeaderboard({
    skillKey: 'reading',
    students: STUDENTS,
    classSection: '6-A',
    selectedMonth: 'November',
    readingReports,
  });

  assert.equal(board.totalStudentsInClass, 3);
  assert.equal(board.assessedInSelectedMonth, 3);
  assert.equal(board.improvingCount, 2);
  assert.equal(board.positiveGrowthSharePct, 66.7);
  assert.equal(board.rows[0].studentName, 'Aarav Sharma');
  assert.equal(board.rows[0].momDelta, 16);
  assert.equal(board.rows[0].relativeMomPct, 22.9);
  assert.equal(board.rows[0].growthTier, 'breakthrough');
  assert.equal(board.rows[1].studentName, 'Diya Verma');
  assert.equal(board.rows[1].relativeMomPct, 3.7);
  assert.equal(board.rows[2].studentName, 'Kabir Hooda');
  assert.equal(board.rows[2].growthTier, 'support');
  assert.equal(board.topImprover?.studentId, 's1');
});

test('applyLeaderboardPrivacyView enforces masking, raw score hiding, and positive-growth spotlight', () => {
  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'r1',
      schoolId: 'sch1',
      studentId: 's1',
      month: 'October',
      year: 2026,
      wpm: 90,
      accuracyPct: 60,
      comprehensionPct: 60,
      overallPct: 60,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-15',
    },
    {
      id: 'r2',
      schoolId: 'sch1',
      studentId: 's1',
      month: 'November',
      year: 2026,
      wpm: 105,
      accuracyPct: 78,
      comprehensionPct: 78,
      overallPct: 78,
      readingBand: 'Fluent',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-15',
    },
    {
      id: 'r3',
      schoolId: 'sch1',
      studentId: 's3',
      month: 'October',
      year: 2026,
      wpm: 80,
      accuracyPct: 75,
      comprehensionPct: 75,
      overallPct: 75,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-10-15',
    },
    {
      id: 'r4',
      schoolId: 'sch1',
      studentId: 's3',
      month: 'November',
      year: 2026,
      wpm: 75,
      accuracyPct: 70,
      comprehensionPct: 70,
      overallPct: 70,
      readingBand: 'Developing',
      remarks: '',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-15',
    },
  ];

  const board = computeSkillMonthlyGrowthLeaderboard({
    skillKey: 'reading',
    students: STUDENTS,
    classSection: '6-A',
    selectedMonth: 'November',
    readingReports,
  });

  // 1. Classroom Projector Safe mode: anonymizes names, hides raw scores, hides negative/untested rows
  const projector = applyLeaderboardPrivacyView({
    summary: board,
    settings: PRIVACY_PRESETS.classroom_projector.settings,
    allowInspect: true,
  });
  assert.equal(projector.activePreset, 'classroom_projector');
  assert.equal(projector.rows.length, 1);
  assert.equal(projector.hiddenForPrivacyCount, 2);
  assert.match(projector.rows[0].displayName, /^Learner #\d+$/);
  assert.equal(projector.rows[0].selectedMonthScore, null);
  assert.equal(projector.rows[0].baselineScore, null);
  assert.equal(projector.rows[0].scoresHidden, true);
  assert.equal(projector.rows[0].relativeMomPct, 30);
  assert.equal(projector.rows[0].canInspect, false);

  // 2. Initials mode masks names cleanly
  assert.equal(maskStudentName('Aarav Sharma', 'initials', 1), 'A. S.');

  // 3. Student/Parent role defaults are privacy-locked
  const studentDefaults = resolveDefaultPrivacyForRole('student');
  assert.equal(studentDefaults.lockedByRole, true);
  assert.equal(studentDefaults.identityMode, 'anonymous');
  assert.equal(studentDefaults.hideRawScores, true);

  const selfView = applyLeaderboardPrivacyView({
    summary: board,
    settings: studentDefaults,
    selfStudentIds: ['s3'],
  });
  const ownRow = selfView.rows.find((r) => r.studentId === 's3')!;
  const peerRow = selfView.rows.find((r) => r.studentId === 's1')!;
  assert.equal(ownRow.displayName, 'Kabir Hooda (You)');
  assert.equal(ownRow.scoresHidden, false);
  assert.match(peerRow.displayName, /^Learner #\d+$/);
  assert.equal(peerRow.selectedMonthScore, null);
});

test('computeSkillMonthlyGrowthLeaderboard tracks computer skills & thinking tests by month', () => {
  assert.equal(computeRelativeImprovementPct(85, 69), 23.2);

  const attempts: ComputerSkillAttempt[] = [
    {
      id: 'c1',
      schoolId: 'sch1',
      studentId: 's2',
      studentName: 'Diya Verma',
      classSection: '6-A',
      classLevel: 6,
      submittedAt: '2026-10-10T10:00:00.000Z',
      targetWpm: 25,
      targetAccuracyPct: 90,
      grossWpm: 24,
      netWpm: 22,
      accuracyPct: 88,
      errorCount: 3,
      typingElapsedSec: 60,
      typingBenchmarkMet: false,
      typingScore: 70,
      practicalResults: [],
      practicalScore: 68,
      overallScore: 69,
      grade: 'Developing',
      benchmarkPassed: false,
    },
    {
      id: 'c2',
      schoolId: 'sch1',
      studentId: 's2',
      studentName: 'Diya Verma',
      classSection: '6-A',
      classLevel: 6,
      submittedAt: '2026-11-12T10:00:00.000Z',
      targetWpm: 25,
      targetAccuracyPct: 90,
      grossWpm: 32,
      netWpm: 30,
      accuracyPct: 95,
      errorCount: 1,
      typingElapsedSec: 60,
      typingBenchmarkMet: true,
      typingScore: 86,
      practicalResults: [],
      practicalScore: 84,
      overallScore: 85,
      grade: 'Distinction',
      benchmarkPassed: true,
    },
  ];

  const compBoard = computeSkillMonthlyGrowthLeaderboard({
    skillKey: 'computer_skills',
    students: STUDENTS,
    classSection: '6-A',
    selectedMonth: 'November',
    computerSkillAttempts: attempts,
  });

  assert.equal(compBoard.rows[0].studentId, 's2');
  assert.equal(compBoard.rows[0].selectedMonthScore, 85);
  assert.equal(compBoard.rows[0].momDelta, 16);
  assert.equal(compBoard.rows[0].relativeMomPct, 23.2);
  assert.equal(compBoard.rows[1].selectedMonthScore, null);

  const thinking: ThinkingAssessmentSession[] = [
    {
      id: 't1',
      schoolId: 'sch1',
      studentId: 's1',
      studentName: 'Aarav Sharma',
      classSection: '6-A',
      testType: 'SRT',
      workflowMode: 'Individual',
      timedMode: true,
      timeLimitSec: 300,
      status: 'submitted',
      startedAt: '2026-11-14T09:50:00.000Z',
      submittedAt: '2026-11-14T10:00:00.000Z',
      responses: [],
      dimensionScores: {
        fastThinking: 80,
        betterThinking: 86,
        positiveThinking: 82,
        selfCentredThinking: 14,
      },
      strengths: [],
      developmentAreas: [],
      suggestedExercises: [],
      candidateOlqSignals: {},
      promotedToOlq: false,
      promotedEvidenceKeys: [],
    },
  ];

  const thinkBoard = computeSkillMonthlyGrowthLeaderboard({
    skillKey: 'thinking',
    students: STUDENTS,
    classSection: '6-A',
    selectedMonth: 'November',
    thinkingAssessments: thinking,
  });

  assert.equal(thinkBoard.assessedInSelectedMonth, 1);
  assert.equal(thinkBoard.rows[0].selectedMonthScore, 84);
});
