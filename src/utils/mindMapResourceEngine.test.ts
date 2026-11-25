import test from 'node:test';
import assert from 'node:assert/strict';
import type { MindMapResourceItem } from '../types';
import {
  buildAiSuggestedMindMapDraft,
  filterMindMapLibrary,
  inferMindMapFileFormat,
} from './mindMapResourceEngine';

const ITEMS: MindMapResourceItem[] = [
  {
    id: 'mm-1',
    schoolId: 'sch-1',
    academicSession: '2026-27',
    classSection: '10-A',
    subject: 'Science',
    chapter: 'Chapter 1: Chemical Reactions',
    topic: 'Types of Reactions',
    language: 'English',
    teacherId: 't-1',
    teacherName: 'Pooja Dhillon',
    resourceType: 'mind_map',
    title: 'Chemical Reactions Visual Mind Map',
    description: 'Complete visual guide to combination, decomposition, and redox.',
    fileFormat: 'PDF',
    fileName: 'ch1-reactions.pdf',
    keywords: ['Redox', 'Decomposition'],
    learningObjectives: ['Classify reactions accurately'],
    aiAssisted: true,
    aiDraftApprovedByTeacher: true,
    status: 'approved',
    approvedBy: 'Dr. Deepak Dhawan',
    approvedAt: '2026-11-10T10:00:00.000Z',
    version: 2,
    versionHistory: [],
    bookmarkedByUserIds: ['stu-1'],
    createdAt: '2026-11-08T10:00:00.000Z',
    updatedAt: '2026-11-10T10:00:00.000Z',
  },
  {
    id: 'mm-2',
    schoolId: 'sch-1',
    academicSession: '2026-27',
    classSection: '10-A',
    subject: 'Science',
    chapter: 'Chapter 2: Acids and Bases',
    topic: 'pH Scale',
    language: 'Bilingual',
    teacherId: 't-1',
    teacherName: 'Pooja Dhillon',
    resourceType: 'concept_map',
    title: 'Acids & Bases Draft Map',
    description: 'Pending coordinator review.',
    fileFormat: 'PNG',
    fileName: 'acids-bases.png',
    keywords: ['pH', 'Indicators'],
    learningObjectives: ['Interpret pH scale'],
    aiAssisted: true,
    aiDraftApprovedByTeacher: false,
    status: 'pending_review',
    version: 1,
    versionHistory: [],
    bookmarkedByUserIds: [],
    createdAt: '2026-11-15T10:00:00.000Z',
    updatedAt: '2026-11-15T10:00:00.000Z',
  },
];

test('filterMindMapLibrary ensures students and parents ONLY access approved mind maps while approvers see pending reviews', () => {
  const studentVisible = filterMindMapLibrary({
    items: ITEMS,
    role: 'student',
    userId: 'stu-1',
  });
  assert.equal(studentVisible.length, 1);
  assert.equal(studentVisible[0].id, 'mm-1');

  const parentVisible = filterMindMapLibrary({
    items: ITEMS,
    role: 'parent',
    userId: 'par-1',
  });
  assert.equal(parentVisible.length, 1);
  assert.equal(parentVisible[0].status, 'approved');

  const coordinatorVisible = filterMindMapLibrary({
    items: ITEMS,
    role: 'coordinator',
    userId: 'coord-1',
  });
  assert.equal(coordinatorVisible.length, 2);

  const teacherOwnDrafts = filterMindMapLibrary({
    items: ITEMS,
    role: 'teacher',
    userId: 't-1',
  });
  assert.equal(teacherOwnDrafts.length, 2);

  const otherTeacher = filterMindMapLibrary({
    items: ITEMS,
    role: 'teacher',
    userId: 't-2',
  });
  assert.equal(otherTeacher.length, 1);
});

test('buildAiSuggestedMindMapDraft builds structured editable branches, definitions, and flowchart steps', () => {
  const draft = buildAiSuggestedMindMapDraft({
    subject: 'Physics',
    classSection: '10-A',
    chapter: 'Chapter 10: Light Reflection',
    topic: 'Spherical Mirrors',
    sourceMaterialText:
      'Concave mirrors converge parallel light rays at principal focus. Convex mirrors always form virtual and erect diminished images. Mirror formula relates focal length, image distance, and object distance.',
    fileName: 'ncert-ch10.pdf',
  });

  assert.equal(inferMindMapFileFormat('slides.pptx'), 'PPTX');
  assert.equal(inferMindMapFileFormat('notes.docx'), 'DOCX');
  assert.equal(draft.structure.branches.length, 4);
  assert.ok(draft.structure.definitions.length >= 3);
  assert.ok(draft.structure.flowchartSteps.length >= 4);
  assert.ok(draft.suggestedTitle.includes('Spherical Mirrors'));
});
