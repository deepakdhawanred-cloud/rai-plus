import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase } from '../../server/seedData';
import { CURATED_ADM_TO_STUDENT_ID } from '../../server/visRosterBuilder';
import { VIS_SCHOOL, VIS_STUDENTS } from '../../server/visSeedData';
import { calculateLearnersScore } from './evidenceEngine';
import { computeStudentGameRecommendations } from './customRecommendationsEngine';
import {
  ACTIVE_SESSION_MONTHS,
  reconcileMonthlyAttendanceAfterMark,
  summarizeDailyAttendanceDashboard,
  summarizeMonthlyAttendanceByMonth,
  summarizeMonthlyNumeracy,
  summarizeMonthlyReading,
  summarizeUtMarks,
  TODAY_VIS_DATE,
} from './visAcademicProgressEngine';

test('enrols all 538 active VIS students from CSV and preserves curated flagship IDs', () => {
  assert.equal(VIS_STUDENTS.length, 538);
  assert.equal(VIS_SCHOOL.studentCount, 538);

  const ids = new Set(VIS_STUDENTS.map((s) => s.id));
  assert.equal(ids.size, 538);

  for (const [admNo, stuId] of Object.entries(CURATED_ADM_TO_STUDENT_ID)) {
    const found = VIS_STUDENTS.find((s) => s.id === stuId);
    assert.ok(found, `Expected curated student ${stuId} (${admNo}) to exist`);
    assert.ok(found.admissionNo.length > 0);
  }

  const classes = new Set(VIS_STUDENTS.map((s) => s.classSection));
  for (const expectedClass of ['Nursery', 'LKG', 'UKG', '1-A', '3-B', '6-A', '9-A', '10-A', '11-Science', '12-Commerce']) {
    assert.ok(classes.has(expectedClass), `Expected class section ${expectedClass}`);
  }
});

test('seeds UT-1/2/3 marks, Apr-Nov reading & numeracy reports, monthly attendance & today roll call for all 538 VIS students', () => {
  const db = createInitialDatabase();
  const visStudents = db.students.filter((s) => s.schoolId === 'school-vis-jjr');
  assert.equal(visStudents.length, 538);

  // Fee ledger linkage backfilled across active VIS students
  const visFeeAccounts = (db.feeAccounts || []).filter((a) => a.schoolId === 'school-vis-jjr');
  assert.equal(visFeeAccounts.length, 538);
  assert.ok(visFeeAccounts.every((a) => Boolean(a.studentId)));

  // UT Marks across UT1, UT2, UT3
  const visMarks = db.examMarks.filter((m) => m.schoolId === 'school-vis-jjr');
  const utSummary = summarizeUtMarks(visStudents, visMarks);
  assert.ok(utSummary.summary.totalMarks >= 538 * 9);
  assert.equal(utSummary.summary.studentCount, 538);
  assert.ok(utSummary.summary.examNames.includes('Unit Test 1'));
  assert.ok(utSummary.summary.examNames.includes('Unit Test 2'));
  assert.ok(utSummary.summary.examNames.includes('Unit Test 3'));

  // Reading & Numeracy reports across all 8 active months (Apr-Nov)
  const visReading = (db.readingReports || []).filter((r) => r.schoolId === 'school-vis-jjr');
  const visNumeracy = (db.numeracyReports || []).filter((r) => r.schoolId === 'school-vis-jjr');
  assert.equal(visReading.length, 538 * ACTIVE_SESSION_MONTHS.length);
  assert.equal(visNumeracy.length, 538 * ACTIVE_SESSION_MONTHS.length);

  const novReading = summarizeMonthlyReading(visStudents, visReading, 'November', 'All');
  assert.equal(novReading.rows.length, 538);
  assert.ok(novReading.avgWpm > 60);

  const novNumeracy = summarizeMonthlyNumeracy(visStudents, visNumeracy, 'November', 'All');
  assert.equal(novNumeracy.rows.length, 538);
  assert.ok(novNumeracy.avgTablesPct > 50);

  // Today (2026-11-16) Present + Absent + Leave covers all 538 VIS students
  const visAttendance = db.attendance.filter((a) => a.schoolId === 'school-vis-jjr');
  const todaySummary = summarizeDailyAttendanceDashboard(visStudents, visAttendance, TODAY_VIS_DATE);
  assert.equal(todaySummary.totalStudents, 538);
  assert.equal(todaySummary.unmarkedCount, 0);
  assert.ok(todaySummary.presentCount > 400);
  assert.ok(todaySummary.absentCount > 15);
  assert.equal(
    todaySummary.presentCount + todaySummary.absentCount + todaySummary.leaveCount,
    538,
  );

  // Monthly Attendance summary across Apr-Nov
  const visMonthly = (db.monthlyAttendance || []).filter((m) => m.schoolId === 'school-vis-jjr');
  assert.equal(visMonthly.length, 538 * ACTIVE_SESSION_MONTHS.length);
  const monthlyAgg = summarizeMonthlyAttendanceByMonth(visMonthly);
  assert.equal(monthlyAgg.length, ACTIVE_SESSION_MONTHS.length);
  assert.ok(monthlyAgg.every((m) => m.studentCount === 538 && m.attendancePct > 75));
});

test('reconcileMonthlyAttendanceAfterMark updates November counts deterministically without altering OLQs', () => {
  const db = createInitialDatabase();
  const targetStudent = db.students.find((s) => s.id === 'stu-vis-601')!;
  const weights = db.schoolWeights['school-vis-jjr'].weights;
  const studentEv = db.evidence.filter((e) => e.studentId === targetStudent.id);
  const olqBefore = calculateLearnersScore(studentEv, weights);

  const novRow = (db.monthlyAttendance || []).find(
    (m) => m.studentId === targetStudent.id && m.month === 'November',
  )!;
  const prevPresent = novRow.presentDays;
  const prevAbsent = novRow.absentDays;

  reconcileMonthlyAttendanceAfterMark({
    monthlyAttendance: db.monthlyAttendance || [],
    schoolId: 'school-vis-jjr',
    studentId: targetStudent.id,
    date: TODAY_VIS_DATE,
    prevStatus: 'Present',
    nextStatus: 'Absent',
  });

  assert.equal(novRow.presentDays, prevPresent - 1);
  assert.equal(novRow.absentDays, prevAbsent + 1);

  const olqAfter = calculateLearnersScore(studentEv, weights);
  assert.deepEqual(olqAfter, olqBefore);
});

test('customRecommendationsEngine uses low monthly reading & numeracy reports when exam marks lack explicit reading tags', () => {
  const recommendations = computeStudentGameRecommendations({
    student: VIS_STUDENTS[0],
    examMarks: [],
    cognitiveAttempts: [],
    readingReports: [
      {
        id: 'r-test',
        schoolId: 'school-vis-jjr',
        studentId: VIS_STUDENTS[0].id,
        month: 'November',
        year: 2026,
        wpm: 58,
        accuracyPct: 58,
        comprehensionPct: 54,
        overallPct: 56,
        readingBand: 'Developing',
        remarks: 'Needs blend fluency practice',
        assessedBy: 'Faculty',
        assessedAt: TODAY_VIS_DATE,
      },
    ],
    numeracyReports: [
      {
        id: 'n-test',
        schoolId: 'school-vis-jjr',
        studentId: VIS_STUDENTS[0].id,
        month: 'November',
        year: 2026,
        tablesFluencyPct: 54,
        mentalMathPct: 60,
        problemSolvingPct: 62,
        overallPct: 58,
        conceptualGap: '13-19 tables recall',
        remarks: 'Practice rapid table sprints',
        assessedBy: 'Faculty',
        assessedAt: TODAY_VIS_DATE,
      },
    ],
  });

  assert.ok(recommendations.some((r) => r.needArea === 'Reading & Phonics'));
  assert.ok(recommendations.some((r) => r.needArea === 'Multiplication Tables'));
});
