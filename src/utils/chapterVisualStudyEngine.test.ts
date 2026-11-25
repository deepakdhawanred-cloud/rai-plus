import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_CLASS_NUMBERS,
  STUDY_FORMAT_OPTIONS,
  computeFlashcardMasteryPercent,
  extractClassNumFromLabel,
  generateChapterVisualStudyPack,
  getChaptersForClassSubject,
  getRecommendedFormatForChapter,
  getSubjectsForClass,
} from './chapterVisualStudyEngine';
import type { AcademicResource, ProductionRegisterRow } from '../types';

test('covers every class from Class 1 to Class 12 with subjects and chapters', () => {
  assert.deepEqual(ALL_CLASS_NUMBERS, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  for (const cls of ALL_CLASS_NUMBERS) {
    const subjects = getSubjectsForClass(cls);
    assert.ok(subjects.length >= 4, `Class ${cls} should have at least 4 subjects`);

    for (const subject of subjects) {
      const chapters = getChaptersForClassSubject(cls, subject);
      assert.ok(
        chapters.length >= 4,
        `Class ${cls} ${subject} should have at least 4 chapters, got ${chapters.length}`,
      );

      for (const chapter of chapters) {
        const pack = generateChapterVisualStudyPack(chapter);
        assert.equal(pack.mindmap.branches.length, 5);
        assert.equal(pack.flowchart.length, 5);
        assert.ok(pack.quickRevision.highYieldBullets.length >= 4);
        assert.ok(pack.quickRevision.keyItems.length >= 2);
        assert.ok(pack.notebookLm.sourceBriefMarkdown.includes(chapter.title));
        assert.ok(pack.notebookLm.audioOverviewPrompt.includes(`Class ${cls}`));
        assert.ok(pack.flashcards.length >= 5);
        assert.ok(pack.recommendedResources.length >= 3);
      }
    }
  }
});

test('merges school production register and uploaded academic resource chapters without duplicates', () => {
  const registerRows: ProductionRegisterRow[] = [
    {
      rowId: 'reg-1',
      classLabel: 'Class 10',
      subject: 'Science',
      book: 'NCERT Science',
      chapterNum: '1',
      chapterTitle: 'Chemical Reactions and Equations', // already in NCERT core -> should not duplicate
      deliverablesCompleted: 'All',
      sourceVerification: 'Verified',
      aiQaStatus: 'Pass',
      teacherApproval: 'Approved',
      notes: '',
    },
    {
      rowId: 'reg-2',
      classLabel: 'Class 10',
      subject: 'Science',
      book: 'HBSE Practical Manual',
      chapterNum: '14',
      chapterTitle: 'HBSE Special Lab Practicals & Viva', // new -> should be appended
      deliverablesCompleted: 'All',
      sourceVerification: 'Verified',
      aiQaStatus: 'Pass',
      teacherApproval: 'Approved',
      notes: '',
    },
  ];
  const resources: AcademicResource[] = [
    {
      id: 'res-1',
      schoolId: 'school-1',
      title: 'Extra Revision Sheet',
      classSection: '10-A',
      subject: 'Science',
      chapter: 'Ch. 15: Board Case-Study Mastery',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      contentSummary: 'Case study drills',
      aiAssisted: false,
      createdBy: 'teacher-1',
      updatedAt: '2026-11-01',
    },
  ];

  const chapters = getChaptersForClassSubject(10, 'Science', registerRows, resources);
  const titles = chapters.map((c) => c.title);

  assert.equal(
    titles.filter((t) => t === 'Chemical Reactions and Equations').length,
    1,
    'Existing core chapter must not be duplicated',
  );
  assert.ok(titles.includes('HBSE Special Lab Practicals & Viva'));
  assert.ok(titles.includes('Board Case-Study Mastery'));
});

test('recommends optimal primary resource format by chapter pedagogy kind', () => {
  const scienceChapters = getChaptersForClassSubject(10, 'Science');
  const lifeProcesses = scienceChapters.find((c) => c.title === 'Life Processes');
  assert.ok(lifeProcesses);
  assert.equal(getRecommendedFormatForChapter(lifeProcesses).format, 'flowchart');

  const mathChapters = getChaptersForClassSubject(10, 'Mathematics');
  const quadratic = mathChapters.find((c) => c.title === 'Quadratic Equations');
  assert.ok(quadratic);
  assert.equal(getRecommendedFormatForChapter(quadratic).format, 'quick_revision');

  const historyChapters = getChaptersForClassSubject(10, 'Social Science');
  const nationalism = historyChapters.find((c) => c.title === 'Nationalism in India');
  assert.ok(nationalism);
  assert.equal(getRecommendedFormatForChapter(nationalism).format, 'mindmap');
});

test('extracts class numbers and calculates flashcard mastery accurately', () => {
  assert.equal(extractClassNumFromLabel('10-A'), 10);
  assert.equal(extractClassNumFromLabel('Class 12 Science'), 12);
  assert.equal(extractClassNumFromLabel('Class 1'), 1);
  assert.equal(extractClassNumFromLabel(undefined), 9);

  assert.equal(STUDY_FORMAT_OPTIONS.length, 6);
  assert.equal(computeFlashcardMasteryPercent(5, []), 0);
  assert.equal(computeFlashcardMasteryPercent(5, ['a', 'b', 'c']), 60);
  assert.equal(computeFlashcardMasteryPercent(5, ['a', 'b', 'c', 'd', 'e', 'extra']), 100);
});
