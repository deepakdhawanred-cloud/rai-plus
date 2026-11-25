import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStudentGameRecommendations } from './customRecommendationsEngine';
import type { ExamMark, NotebookEntry, StudentRecord } from '../types';

const baseStudent: StudentRecord = {
  id: 'stu-test-1',
  schoolId: 'school-svm-kk',
  admissionNo: 'SVM-2026-001',
  rollNo: '01',
  name: 'Kabir Sharma',
  classSection: '5-A',
  house: 'Shakti House',
  guardianName: 'Rajesh Sharma',
  guardianPhone: '+91 98120 00001',
  udiseStudentId: 'UD-001',
  haryanaMisId: 'HM-001',
  attendancePct: 94,
  feeBalanceInr: 0,
  totalFeeAnnualInr: 36000,
  reportApprovalStatus: 'Approved',
  formulaVersion: 'v1.2',
  documents: [],
  responsibilities: [],
  achievements: [],
  confidentialCounsellorNote: '',
};

test('below-average Reading report triggers Phonics game recommendations', () => {
  const examMarks: ExamMark[] = [
    {
      id: 'mk-read-1',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Oral Reading Fluency Check',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 48,
      date: '2026-11-10',
      conceptualGap: 'Needs phonics digraph & syllable decoding practice',
    },
  ];

  const recs = computeStudentGameRecommendations({
    student: baseStudent,
    examMarks,
    cognitiveAttempts: [],
  });

  const readingRec = recs.find((r) => r.needArea === 'Reading & Phonics');
  assert.ok(readingRec, 'Expected Reading & Phonics recommendation');
  assert.equal(readingRec.severity, 'priority');
  assert.equal(readingRec.reportScorePct, 48);
  const gameIds = readingRec.recommendedGames.map((g) => g.id);
  assert.ok(gameIds.includes('phonics-sound-match'));
  assert.ok(gameIds.includes('syllable-word-builder'));
});

test('below-average Tables report triggers Multiplication Tables game recommendations', () => {
  const examMarks: ExamMark[] = [
    {
      id: 'mk-tab-1',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Multiplication Tables Drill',
      subject: 'Mathematics Tables',
      maxMarks: 20,
      obtainedMarks: 10,
      date: '2026-11-11',
      conceptualGap: 'Tables 6 to 12 recall below class average',
    },
  ];

  const recs = computeStudentGameRecommendations({
    student: baseStudent,
    examMarks,
    cognitiveAttempts: [],
  });

  const tablesRec = recs.find((r) => r.needArea === 'Multiplication Tables');
  assert.ok(tablesRec, 'Expected Multiplication Tables recommendation');
  assert.equal(tablesRec.severity, 'priority');
  assert.equal(tablesRec.reportScorePct, 50);
  const gameIds = tablesRec.recommendedGames.map((g) => g.id);
  assert.ok(gameIds.includes('times-tables-sprint'));
  assert.ok(gameIds.includes('table-factor-grid'));
});

test('strong student reports produce balanced enrichment without false deficit alarms', () => {
  const examMarks: ExamMark[] = [
    {
      id: 'mk-ok-1',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Reading Fluency Check',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 88,
      date: '2026-11-10',
    },
    {
      id: 'mk-ok-2',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Multiplication Tables Drill',
      subject: 'Mathematics Tables',
      maxMarks: 20,
      obtainedMarks: 18,
      date: '2026-11-11',
    },
  ];
  const notebooks: NotebookEntry[] = [
    {
      id: 'nb-ok-1',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      classSection: baseStudent.classSection,
      date: '2026-11-11',
      subject: 'Mathematics',
      chapter: 'Ch 3',
      checked: true,
      homeworkDone: true,
      handwriting: 'Readability',
      workQuality: 'A',
      remarks: 'Neat and accurate work',
      teacherName: 'Kavita Sharma',
    },
  ];

  const recs = computeStudentGameRecommendations({
    student: baseStudent,
    examMarks,
    notebookEntries: notebooks,
    cognitiveAttempts: [],
  });

  assert.equal(recs.length, 1);
  assert.equal(recs[0].needArea, 'Balanced Enrichment');
  assert.equal(recs[0].severity, 'enrichment');
});

test('tables report mentioning factor fluency never overrides Reading & Phonics trigger', () => {
  const examMarks: ExamMark[] = [
    {
      id: 'mk-read-mix',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Reading & Phonics Screening',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 48,
      date: '2026-11-09',
      conceptualGap: 'Phonics digraphs & syllable decoding need reinforcement',
    },
    {
      id: 'mk-tab-mix',
      schoolId: 'school-svm-kk',
      studentId: baseStudent.id,
      examName: 'Multiplication Tables Timed Drill',
      subject: 'Mathematics Tables',
      maxMarks: 100,
      obtainedMarks: 44,
      date: '2026-11-11',
      conceptualGap: 'Multiplication tables 6 to 14 & factor fluency below benchmark',
    },
  ];

  const recs = computeStudentGameRecommendations({
    student: baseStudent,
    examMarks,
    cognitiveAttempts: [],
  });

  const readingRec = recs.find((r) => r.needArea === 'Reading & Phonics');
  const tablesRec = recs.find((r) => r.needArea === 'Multiplication Tables');
  assert.ok(readingRec);
  assert.ok(tablesRec);
  assert.equal(readingRec.reportScorePct, 48);
  assert.match(readingRec.triggerLabel, /English Reading/);
  assert.equal(tablesRec.reportScorePct, 44);
  assert.match(tablesRec.triggerLabel, /Mathematics Tables/);
});

