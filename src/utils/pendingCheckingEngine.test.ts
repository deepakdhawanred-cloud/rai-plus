import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  HomeworkAssignment,
  HomeworkSubmission,
  NotebookEntry,
  StudentRecord,
} from '../types';
import {
  computePendingCheckingHighlights,
  detectPriorChapterBacklogsForClassSubject,
  extractNumericChapterIndex,
} from './pendingCheckingEngine';
import { composePriorChapterBacklogAlert } from './notebookNotificationEngine';

function makeStudent(id: string, name: string, classSection = '6-A', rollNo = '01'): StudentRecord {
  return {
    id,
    schoolId: 'school-vis-jjr',
    admissionNo: `ADM-${id}`,
    rollNo,
    name,
    classSection,
    house: 'Shakti',
    guardianName: `Parent of ${name}`,
    guardianPhone: '+91-98110-00000',
    udiseStudentId: 'U1',
    haryanaMisId: 'M1',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: '1.0',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  };
}

test('extractNumericChapterIndex parses Ch., Chapter, Lesson, Unit, and leading numbered chapters', () => {
  assert.equal(extractNumericChapterIndex('Ch. 1: Knowing Our Numbers'), 1);
  assert.equal(extractNumericChapterIndex('Chapter 3 - Playing With Numbers'), 3);
  assert.equal(extractNumericChapterIndex('Unit 4: Reading'), 4);
  assert.equal(extractNumericChapterIndex('2. Whole Numbers'), 2);
  assert.equal(extractNumericChapterIndex('Board Revision Cycle 2026-27'), null);
});

test('flags student whose Ch. 1 is still Not Checked when teacher starts Ch. 3', () => {
  const students = [
    makeStudent('s1', 'Abhiraj', '6-A', '01'),
    makeStudent('s2', 'Hardik', '6-A', '02'),
    makeStudent('s3', 'Rohan', '6-A', '03'),
  ];

  const notebooks: NotebookEntry[] = [
    // Abhiraj completed Ch. 1
    {
      id: 'nb-1',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 1: Knowing Our Numbers',
      date: '2026-10-04',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'Neat work',
      teacherName: 'Praveen Kumar Kaushik',
    },
    // Hardik explicitly Not Checked for Ch. 1
    {
      id: 'nb-2',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 1: Knowing Our Numbers',
      date: '2026-10-04',
      checked: false,
      handwriting: 'Readability',
      workQuality: 'B',
      homeworkDone: false,
      remarks: 'Notebook not submitted',
      teacherName: 'Praveen Kumar Kaushik',
    },
    // Teacher now starts Ch. 3 and checks Abhiraj + Rohan (Rohan never had Ch. 1 checked!)
    {
      id: 'nb-3',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Playing With Numbers',
      date: '2026-11-19',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: '',
      teacherName: 'Praveen Kumar Kaushik',
    },
    {
      id: 'nb-4',
      schoolId: 'school-vis-jjr',
      studentId: 's3',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Playing With Numbers',
      date: '2026-11-19',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: '',
      teacherName: 'Praveen Kumar Kaushik',
    },
  ];

  const gaps = detectPriorChapterBacklogsForClassSubject({
    classSection: '6-A',
    subject: 'Mathematics',
    students,
    notebookEntries: notebooks,
  });

  // Abhiraj is clear; Hardik (explicit Not Checked) and Rohan (never checked Ch. 1) are flagged!
  assert.equal(gaps.length, 2);
  assert.deepEqual(
    gaps.map((g) => g.studentName),
    ['Hardik', 'Rohan'],
  );
  assert.equal(gaps[0].missingChapterNum, 1);
  assert.equal(gaps[0].currentChapterNum, 3);
  assert.equal(gaps[0].chapterGap, 2);
  assert.equal(gaps[0].severity, 'Critical');

  // Verify system-generated notebook alert composition for prior-chapter backlog
  const alert = composePriorChapterBacklogAlert({
    schoolId: 'school-vis-jjr',
    schoolName: 'VIS Jhajjar',
    student: students[1],
    gap: gaps[0],
    triggeredBy: 'Praveen Kumar Kaushik',
    triggeredByRole: 'teacher',
  });
  assert.equal(alert.alertType, 'prior_chapter_backlog');
  assert.equal(alert.chapterGap, 2);
  assert.match(alert.title, /Ch\. 1.*Not Checked.*Ch\. 3/i);
  assert.match(alert.messageEn, /Ch\. 3: Playing With Numbers/);
  assert.match(alert.messageEn, /Ch\. 1: Knowing Our Numbers/);
  assert.match(alert.studentMessage, /2 chapters behind/i);
});

test('computePendingCheckingHighlights combines prior-chapter notebook gaps with pending homework checks', () => {
  const students = [
    makeStudent('s1', 'Abhiraj', '6-A', '01'),
    makeStudent('s2', 'Hardik', '6-A', '02'),
  ];

  const notebooks: NotebookEntry[] = [
    {
      id: 'nb-1',
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 1: Knowing Our Numbers',
      date: '2026-10-04',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: '',
      teacherName: 'Praveen',
    },
    {
      id: 'nb-2',
      schoolId: 'school-vis-jjr',
      studentId: 's2',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 1: Knowing Our Numbers',
      date: '2026-10-04',
      checked: false,
      handwriting: 'Readability',
      workQuality: 'B',
      homeworkDone: false,
      remarks: 'Absent on checking day',
      teacherName: 'Praveen',
    },
  ];

  const assignments: HomeworkAssignment[] = [
    {
      id: 'hw-1',
      schoolId: 'school-vis-jjr',
      classSection: '6-A',
      subject: 'English',
      chapter: 'Unit 4: Reading',
      title: 'Summary Sheet',
      instructions: 'Write 5 lines',
      assignedDate: '2026-11-14',
      dueDate: '2026-11-18',
      status: 'Active',
      createdBy: 'Sunita',
      updatedAt: '2026-11-14',
    },
  ];

  const submissions: HomeworkSubmission[] = [
    {
      id: 'sub-1',
      schoolId: 'school-vis-jjr',
      assignmentId: 'hw-1',
      studentId: 's1',
      status: 'Pending',
      feedback: '',
      markedBy: 'Sunita',
      markedAt: '2026-11-14',
    },
    {
      id: 'sub-2',
      schoolId: 'school-vis-jjr',
      assignmentId: 'hw-1',
      studentId: 's2',
      status: 'Pending',
      feedback: '',
      markedBy: 'Sunita',
      markedAt: '2026-11-14',
    },
  ];

  // Teacher types Ch. 3 in live checking form for Class 6-A Mathematics
  const highlights = computePendingCheckingHighlights({
    students,
    notebookEntries: notebooks,
    homeworkAssignments: assignments,
    homeworkSubmissions: submissions,
    todayIso: '2026-11-19',
    liveContext: {
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Playing With Numbers',
      date: '2026-11-19',
    },
  });

  assert.equal(highlights.priorChapterGapStudentsCount, 1);
  assert.equal(highlights.pendingHomeworkChecksCount, 2);
  assert.equal(highlights.rankedStudents[0].studentName, 'Hardik');
  assert.equal(highlights.rankedStudents[0].priority, 'Critical');
  assert.equal(highlights.byStudentId['s2'].priorChapterGaps.length, 1);
  assert.equal(highlights.byStudentId['s1'].pendingHomeworks.length, 1);
  assert.equal(highlights.byStudentId['s1'].pendingHomeworks[0].overdue, true);
});
