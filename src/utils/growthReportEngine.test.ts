import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  DevelopmentEvidence,
  ExamMark,
  MonthlyAttendanceSummary,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  StudentRecord,
} from '../types';
import { calculateLearnersScore } from './evidenceEngine';
import {
  buildCohortLearnersScoreGrowthMatrix,
  buildCohortNumeracyGrowthMatrix,
  buildCohortReadingGrowthMatrix,
  buildCohortUtComparisonMatrix,
  buildStudentAttendanceGrowthSeries,
  buildStudentLearnersScoreGrowthSeries,
  buildStudentNumeracyGrowthSeries,
  buildStudentReadingGrowthSeries,
  buildStudentUtProgressionMatrix,
  shortExamLabel,
} from './growthReportEngine';

const sampleStudents = [
  {
    id: 'stu-1',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-101',
    rollNo: '1',
    name: 'Aarav Sharma',
    classSection: '6-A',
  },
  {
    id: 'stu-2',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-102',
    rollNo: '2',
    name: 'Diya Verma',
    classSection: '6-A',
  },
] as StudentRecord[];

const readingReports: MonthlyReadingReport[] = [
  {
    id: 'r-1-apr',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'April',
    year: 2026,
    wpm: 72,
    accuracyPct: 70,
    comprehensionPct: 68,
    overallPct: 69,
    readingBand: 'Developing',
    remarks: 'Steady baseline fluency',
    assessedBy: 'Anand',
    assessedAt: '2026-04-28',
  },
  {
    id: 'r-1-jul',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'July',
    year: 2026,
    wpm: 84,
    accuracyPct: 78,
    comprehensionPct: 76,
    overallPct: 77,
    readingBand: 'Proficient',
    remarks: 'Better phrasing',
    assessedBy: 'Anand',
    assessedAt: '2026-07-28',
  },
  {
    id: 'r-1-nov',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'November',
    year: 2026,
    wpm: 96,
    accuracyPct: 88,
    comprehensionPct: 86,
    overallPct: 87,
    readingBand: 'Fluent',
    remarks: 'Confident expression',
    assessedBy: 'Anand',
    assessedAt: '2026-11-15',
  },
  {
    id: 'r-2-apr',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-2',
    month: 'April',
    year: 2026,
    wpm: 60,
    accuracyPct: 62,
    comprehensionPct: 60,
    overallPct: 61,
    readingBand: 'Developing',
    remarks: 'Needs phoneme review',
    assessedBy: 'Anand',
    assessedAt: '2026-04-28',
  },
  {
    id: 'r-2-nov',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-2',
    month: 'November',
    year: 2026,
    wpm: 70,
    accuracyPct: 64,
    comprehensionPct: 62,
    overallPct: 63,
    readingBand: 'Developing',
    remarks: 'Gradual gain',
    assessedBy: 'Anand',
    assessedAt: '2026-11-15',
  },
];

const numeracyReports: MonthlyNumeracyReport[] = [
  {
    id: 'n-1-apr',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'April',
    year: 2026,
    tablesFluencyPct: 70,
    mentalMathPct: 68,
    problemSolvingPct: 64,
    overallPct: 68,
    conceptualGap: '13-17 tables recall',
    remarks: 'Practice drills started',
    assessedBy: 'Yatish',
    assessedAt: '2026-04-28',
  },
  {
    id: 'n-1-nov',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'November',
    year: 2026,
    tablesFluencyPct: 88,
    mentalMathPct: 86,
    problemSolvingPct: 80,
    overallPct: 85,
    remarks: 'Strong progress across units',
    assessedBy: 'Yatish',
    assessedAt: '2026-11-15',
  },
];

const monthlyAttendance: MonthlyAttendanceSummary[] = [
  {
    id: 'ma-1-apr',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'April',
    year: 2026,
    workingDays: 22,
    presentDays: 19,
    absentDays: 2,
    leaveDays: 1,
    attendancePct: 86.4,
  },
  {
    id: 'ma-1-nov',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    month: 'November',
    year: 2026,
    workingDays: 13,
    presentDays: 12,
    absentDays: 1,
    leaveDays: 0,
    attendancePct: 92.3,
  },
];

const examMarks: ExamMark[] = [
  {
    id: 'ex-1',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    examName: 'Unit Test 1',
    subject: 'Mathematics',
    maxMarks: 50,
    obtainedMarks: 34,
    date: '2026-05-15',
    conceptualGap: 'Fraction simplification',
  },
  {
    id: 'ex-2',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    examName: 'Unit Test 2',
    subject: 'Mathematics',
    maxMarks: 50,
    obtainedMarks: 40,
    date: '2026-08-20',
  },
  {
    id: 'ex-3',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    examName: 'Unit Test 3',
    subject: 'Mathematics',
    maxMarks: 50,
    obtainedMarks: 45,
    date: '2026-11-12',
  },
  {
    id: 'ex-4',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-2',
    examName: 'Unit Test 1',
    subject: 'Mathematics',
    maxMarks: 50,
    obtainedMarks: 28,
    date: '2026-05-15',
  },
  {
    id: 'ex-5',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-2',
    examName: 'Unit Test 3',
    subject: 'Mathematics',
    maxMarks: 50,
    obtainedMarks: 36,
    date: '2026-11-12',
  },
];

const sampleEvidence: DevelopmentEvidence[] = [
  {
    id: 'ev-1-nov',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    sourceKey: 'nb:stu-1:nov',
    sourceType: 'notebook_check',
    subject: 'Mathematics',
    date: '2026-11-12',
    summary: 'Neat fractions work',
    olqContributions: { effective_intelligence: 90, reasoning_ability: 88 },
    componentContributions: {
      academic: 88,
      learningHabits: 90,
      participation: 85,
      personalGrowth: 87,
    },
    learningSignals: { independentTaskCompletion: 90 },
    enteredBy: 'Praveen',
    validated: true,
  },
  {
    id: 'ev-2-oct',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-2',
    sourceKey: 'exam:stu-2:oct',
    sourceType: 'exam',
    subject: 'Mathematics',
    date: '2026-10-26',
    summary: 'Unit Test 3',
    olqContributions: { effective_intelligence: 74 },
    componentContributions: { academic: 74 },
    learningSignals: {},
    enteredBy: 'Praveen',
    validated: true,
  },
];

describe('growthReportEngine', () => {
  it('builds full 8-month reading growth series with MoM and Apr->Nov net deltas', () => {
    const res = buildStudentReadingGrowthSeries(readingReports, 'stu-1');
    assert.equal(res.points.length, 8);
    assert.equal(res.recordedCount, 3);
    assert.equal(res.startMonth, 'April');
    assert.equal(res.latestMonth, 'November');
    assert.equal(res.netOverallDelta, 18); // 87 - 69
    assert.equal(res.netWpmDelta, 24); // 96 - 72
    assert.equal(res.currentBand, 'Fluent');
    assert.equal(res.trendDirection, 'up');

    const julyPoint = res.points.find((p) => p.month === 'July');
    assert.equal(julyPoint?.momDeltaPct, 8); // 77 - 69 across sparse months
    const novPoint = res.points.find((p) => p.month === 'November');
    assert.equal(novPoint?.momDeltaPct, 10); // 87 - 77
  });

  it('builds 8-month numeracy growth series with strongest and focus areas', () => {
    const res = buildStudentNumeracyGrowthSeries(numeracyReports, 'stu-1');
    assert.equal(res.points.length, 8);
    assert.equal(res.netOverallDelta, 17); // 85 - 68
    assert.equal(res.strongestArea, 'Tables Fluency');
    assert.equal(res.focusArea, 'Problem Solving');
    assert.equal(res.trendDirection, 'up');
  });

  it('builds 8-month attendance growth series and YTD calculation', () => {
    const res = buildStudentAttendanceGrowthSeries(monthlyAttendance, 'stu-1');
    assert.equal(res.points.length, 8);
    assert.equal(res.totalWorkingDays, 35);
    assert.equal(res.totalPresentDays, 31);
    assert.equal(res.netAttendanceDeltaPct, 5.9);
    assert.equal(res.lowestMonth, 'April');
  });

  it('builds student UT progression matrix across UT-1 -> UT-2 -> UT-3', () => {
    const matrix = buildStudentUtProgressionMatrix(examMarks, 'stu-1');
    assert.deepEqual(matrix.examNames, ['Unit Test 1', 'Unit Test 2', 'Unit Test 3']);
    assert.equal(matrix.subjectRows.length, 1);
    assert.equal(matrix.subjectRows[0].firstPct, 68);
    assert.equal(matrix.subjectRows[0].latestPct, 90);
    assert.equal(matrix.subjectRows[0].netDeltaPct, 22);
  });

  it('builds cohort reading & numeracy multi-month matrices showing all months simultaneously', () => {
    const readingCohort = buildCohortReadingGrowthMatrix(sampleStudents, readingReports, '6-A');
    assert.equal(readingCohort.monthlyCohortSeries.length, 8);
    assert.equal(readingCohort.studentRows.length, 2);
    assert.equal(readingCohort.improvedCount, 2);
    assert.equal(readingCohort.avgNetDeltaPct, 10); // (18 + 2) / 2
    assert.equal(readingCohort.belowBenchmarkLatestCount, 1); // stu-2 at 63%

    const numCohort = buildCohortNumeracyGrowthMatrix(sampleStudents, numeracyReports, '6-A');
    assert.equal(numCohort.monthlyCohortSeries.length, 8);
    assert.equal(numCohort.totalAssessedStudents, 1);
    assert.equal(numCohort.avgNetDeltaPct, 17);
  });

  it('builds cohort UT comparison matrix across exam cycles', () => {
    const utCohort = buildCohortUtComparisonMatrix(sampleStudents, examMarks, '6-A', 'Mathematics');
    assert.deepEqual(utCohort.examNames, ['Unit Test 1', 'Unit Test 2', 'Unit Test 3']);
    assert.equal(utCohort.studentRows.length, 2);
    assert.equal(utCohort.studentRows[0].netDeltaPct, 22);
    assert.equal(utCohort.studentRows[1].netDeltaPct, 16);
    assert.equal(utCohort.cycleSeries[0].benchmarkRatePct, 50);
    assert.equal(shortExamLabel('Term-1 HBSE Assessment'), 'Term-1 HBSE');
    assert.equal(shortExamLabel('Unit Test 2'), 'UT-2');
  });

  it('builds 8-month Learners Score growth series matching November calculateLearnersScore parity', () => {
    const expectedNov = calculateLearnersScore(
      sampleEvidence.filter((e) => e.studentId === 'stu-1'),
    );
    const series = buildStudentLearnersScoreGrowthSeries({
      studentId: 'stu-1',
      evidence: sampleEvidence,
      examMarks,
      readingReports,
      numeracyReports,
    });
    assert.equal(series.points.length, 8);
    assert.equal(series.recordedCount, 8);
    assert.equal(series.startMonth, 'April');
    assert.equal(series.latestMonth, 'November');
    assert.equal(series.latestScore, expectedNov.overallScore);
    assert.equal(series.points[7].sourceMode, 'direct');
    assert.equal(series.points[0].olq, null); // missing OLQ in April is never scored as 0
    assert.ok((series.netDelta ?? 0) > 0);
  });

  it('excludes missing evidence from Learners Score months rather than scoring zero', () => {
    const emptySeries = buildStudentLearnersScoreGrowthSeries({
      studentId: 'stu-unknown',
      evidence: sampleEvidence,
      examMarks,
      readingReports,
      numeracyReports,
    });
    assert.equal(emptySeries.recordedCount, 0);
    assert.equal(emptySeries.latestScore, null);
    assert.ok(emptySeries.points.every((p) => p.overallScore === null));
  });

  it('builds cohort Learners Score Apr-Nov multi-month comparison matrix', () => {
    const cohort = buildCohortLearnersScoreGrowthMatrix({
      students: sampleStudents,
      evidence: sampleEvidence,
      examMarks,
      readingReports,
      numeracyReports,
      classSectionFilter: '6-A',
    });
    assert.equal(cohort.monthlyCohortSeries.length, 8);
    assert.equal(cohort.studentRows.length, 2);
    assert.equal(cohort.totalTrackedStudents, 2);
    assert.equal(cohort.latestMonthLabel, 'November');
    assert.ok(cohort.latestAvgOverallScore > 75);
  });
});
