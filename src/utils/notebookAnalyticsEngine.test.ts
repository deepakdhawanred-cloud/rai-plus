import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStudentBriefNotebookReport,
  computeSchoolNotebookDashboard,
  parseChapterNumberAndName,
} from './notebookAnalyticsEngine';
import type { NotebookEntry, StudentRecord } from '../types';

function makeStudent(id: string, name: string, classSection: string, rollNo: string): StudentRecord {
  return {
    id,
    schoolId: 'school-1',
    admissionNo: `ADM-${id}`,
    rollNo,
    name,
    classSection,
    house: 'Arjuna',
    guardianName: 'Parent',
    guardianPhone: '9812000000',
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

test('parseChapterNumberAndName cleanly splits numbered and unnumbered chapter strings', () => {
  assert.deepEqual(parseChapterNumberAndName('Ch. 4: Structure of the Atom', 1), {
    chapterNo: 'Ch. 4',
    chapterName: 'Structure of the Atom',
  });
  assert.deepEqual(parseChapterNumberAndName('Chapter 7 - Fractions', 1), {
    chapterNo: 'Ch. 7',
    chapterName: 'Fractions',
  });
  assert.deepEqual(parseChapterNumberAndName('Unit 2 · Force and Laws', 1), {
    chapterNo: 'Unit 2',
    chapterName: 'Force and Laws',
  });
  assert.deepEqual(parseChapterNumberAndName('Multiplication Tables 6 to 12', 3), {
    chapterNo: '#3',
    chapterName: 'Multiplication Tables 6 to 12',
  });
});

test('computeSchoolNotebookDashboard ranks top defaulters by incomplete/unchecked counts and summarizes class & subject health', () => {
  const students = [
    makeStudent('s1', 'Aarav', '6-A', '01'),
    makeStudent('s2', 'Kush', '3-B', '02'),
    makeStudent('s3', 'Nitin', '6-A', '03'),
  ];

  const entries: NotebookEntry[] = [
    {
      id: 'n1',
      schoolId: 'school-1',
      studentId: 's1',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 7: Fractions',
      date: '2026-11-12',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'Neat work',
      teacherName: 'Teacher A',
    },
    {
      id: 'n2',
      schoolId: 'school-1',
      studentId: 's2',
      classSection: '3-B',
      subject: 'Mathematics',
      chapter: 'Ch. 5: Multiplication Tables',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      homeworkDone: false,
      remarks: 'Incomplete sums',
      teacherName: 'Teacher A',
    },
    {
      id: 'n3',
      schoolId: 'school-1',
      studentId: 's2',
      classSection: '3-B',
      subject: 'English',
      chapter: 'Ch. 3: Nouns & Pronouns',
      date: '2026-11-14',
      checked: false,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      homeworkDone: false,
      remarks: 'Notebook not brought',
      teacherName: 'Teacher B',
    },
    {
      id: 'n4',
      schoolId: 'school-1',
      studentId: 's3',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 7: Fractions',
      date: '2026-11-12',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'B',
      homeworkDone: false,
      remarks: 'Q6-Q8 pending',
      teacherName: 'Teacher A',
    },
  ];

  const dash = computeSchoolNotebookDashboard({ students, notebookEntries: entries });
  assert.equal(dash.totalChecks, 4);
  assert.equal(dash.completeChecks, 1);
  assert.equal(dash.incompleteChecks, 2);
  assert.equal(dash.notCheckedCount, 1);
  assert.equal(dash.totalDefaulterStudents, 2);
  assert.equal(dash.topDefaulters[0].studentId, 's2');
  assert.equal(dash.topDefaulters[0].totalDefaulterCount, 2);
  assert.equal(dash.topDefaulters[0].severity, 'High');
  assert.equal(dash.topDefaulters[0].latestIncompleteChapterNo, 'Ch. 3');
  assert.equal(dash.topDefaulters[0].latestIncompleteDate, '2026-11-14');
  assert.equal(dash.topDefaulters[1].studentId, 's3');
  assert.equal(dash.topDefaulters[1].severity, 'Medium');

  const brief = buildStudentBriefNotebookReport(students[1], entries);
  assert.equal(brief.totalChecks, 2);
  assert.equal(brief.totalDefaulterCount, 2);
  assert.equal(brief.rows[0].chapterNo, 'Ch. 3');
  assert.equal(brief.rows[0].chapterName, 'Nouns & Pronouns');
  assert.equal(brief.rows[0].date, '2026-11-14');
  assert.equal(brief.rows[0].status, 'Not Checked');
});
