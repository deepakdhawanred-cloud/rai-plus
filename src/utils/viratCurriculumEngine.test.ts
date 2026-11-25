import test from 'node:test';
import assert from 'node:assert/strict';
import type { ProductionRegisterRow } from '../types';
import {
  computeRegisterStats,
  filterRegisterRows,
  mapFolderCategoryToResourceCategory,
  resolveRegisterApprovalState,
} from './viratCurriculumEngine';

const SAMPLE_ROWS: ProductionRegisterRow[] = [
  {
    rowId: 'reg-6-mat-7',
    classLabel: '6',
    subject: 'Mathematics',
    book: 'Ganita Prakash',
    chapterNum: '7',
    chapterTitle: 'Fractions',
    deliverablesCompleted: 'Slides 8 | Guide 1 | Worksheets 8 | Key 1 | Assessments 4',
    sourceVerification: 'Verified',
    aiQaStatus: 'QA Passed (independent review + recheck, 31 Oct 2026)',
    teacherApproval: 'Awaiting Teacher Approval',
    notes: 'Dated (provisional)',
  },
  {
    rowId: 'reg-10-mat-rev',
    classLabel: '10',
    subject: 'Mathematics',
    book: 'HBSE Board Syllabus',
    chapterNum: 'All',
    chapterTitle: 'Board Revision Cycle 2026-27',
    deliverablesCompleted: 'Teacher Guide 1 | Monthly Plan 1',
    sourceVerification: 'Verified',
    aiQaStatus: 'Plan generated from official syllabus and timetable; practice sets: in production',
    teacherApproval: 'Awaiting Teacher Approval',
    notes: '',
  },
  {
    rowId: 'reg-6-eng-1',
    classLabel: '6',
    subject: 'English',
    book: 'Poorvi',
    chapterNum: '1',
    chapterTitle: 'A Bottle of Dew',
    deliverablesCompleted: '',
    sourceVerification: 'Verified',
    aiQaStatus: 'Not produced',
    teacherApproval: 'Not applicable',
    notes: '',
  },
];

test('AI QA Passed never resolves to Teacher Approved without explicit teacher confirmation', () => {
  assert.equal(
    resolveRegisterApprovalState(SAMPLE_ROWS[0], {}),
    'QA Passed · Awaiting Teacher Approval',
  );
  assert.equal(
    resolveRegisterApprovalState(SAMPLE_ROWS[1], {}),
    'In Production · Awaiting Teacher Approval',
  );
  assert.equal(resolveRegisterApprovalState(SAMPLE_ROWS[2], {}), 'Not Produced');

  const withApproval = resolveRegisterApprovalState(SAMPLE_ROWS[0], {
    'reg-6-mat-7': { approvedBy: 'Mrs. Sunita Yadav', approvedAt: '2026-11-15T10:00:00Z' },
  });
  assert.equal(withApproval, 'Teacher Approved');
});

test('computeRegisterStats and filterRegisterRows compute accurate governance metrics', () => {
  const stats = computeRegisterStats(SAMPLE_ROWS, {
    'reg-6-mat-7': { approvedBy: 'Principal', approvedAt: '2026-11-15T10:00:00Z' },
  });
  assert.equal(stats.totalChapters, 3);
  assert.equal(stats.producedOrActive, 2);
  assert.equal(stats.teacherApprovedCount, 1);
  assert.equal(stats.awaitingTeacherApprovalCount, 1);

  const activeOnly = filterRegisterRows(SAMPLE_ROWS, {}, { statusFilter: 'active' });
  assert.equal(activeOnly.length, 2);

  const qaPassedOnly = filterRegisterRows(SAMPLE_ROWS, {}, { statusFilter: 'qa_passed' });
  assert.equal(qaPassedOnly.length, 1);
  assert.equal(qaPassedOnly[0].chapterTitle, 'Fractions');
});

test('mapFolderCategoryToResourceCategory maps all 5 official Drive folders cleanly', () => {
  assert.equal(mapFolderCategoryToResourceCategory('01_Presentations'), 'Presentations');
  assert.equal(mapFolderCategoryToResourceCategory('02_Teacher_Guides'), 'Teacher Guides');
  assert.equal(mapFolderCategoryToResourceCategory('03_Worksheets'), 'Worksheets');
  assert.equal(mapFolderCategoryToResourceCategory('04_Answer_Keys'), 'Answer Keys');
  assert.equal(
    mapFolderCategoryToResourceCategory('05_Assessments_and_Rubrics'),
    'Assessments and Rubrics',
  );
});
