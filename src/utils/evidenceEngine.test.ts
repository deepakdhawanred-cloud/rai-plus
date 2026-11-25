import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLearnersEvidenceTrace,
  calculateLearnersScore,
  deduplicateEvidence,
  mapNotebookEntryToEvidence,
  validateLearnersWeights,
  DEFAULT_LEARNERS_WEIGHTS,
} from './evidenceEngine';
import type { DevelopmentEvidence, NotebookEntry } from '../types';

test('default Learners Score weights sum to exactly 100', () => {
  const result = validateLearnersWeights(DEFAULT_LEARNERS_WEIGHTS);
  assert.equal(result.valid, true);
  assert.equal(result.total, 100);
});

test('invalid Learners Score weights are rejected', () => {
  const result = validateLearnersWeights({
    academic: 40,
    olq: 30,
    learningHabits: 15,
    participation: 10,
    personalGrowth: 10,
  });
  assert.equal(result.valid, false);
  assert.equal(result.total, 105);
});

test('notebook check maps Readability + Work Quality A to Organising Ability, Power of Expression, and Reasoning Ability', () => {
  const entry: NotebookEntry = {
    id: 'nb-1',
    schoolId: 'school-1',
    studentId: 'stu-1',
    classSection: '9-A',
    subject: 'Mathematics',
    chapter: 'Linear Equations',
    date: '2026-11-10',
    checked: true,
    handwriting: 'Readability',
    workQuality: 'A',
    homeworkDone: true,
    remarks: 'Neat steps',
    teacherName: 'Kavita Sharma',
  };

  const ev = mapNotebookEntryToEvidence(entry);
  assert.ok((ev.olqContributions.organising_ability ?? 0) >= 80);
  assert.ok((ev.olqContributions.power_of_expression ?? 0) >= 80);
  assert.ok((ev.olqContributions.reasoning_ability ?? 0) >= 85);
  assert.equal(ev.reviewRequired, false);
});

test('notebook check Work Quality C flags reviewRequired without assigning permanent labels', () => {
  const entry: NotebookEntry = {
    id: 'nb-2',
    schoolId: 'school-1',
    studentId: 'stu-1',
    classSection: '9-A',
    subject: 'Science',
    chapter: 'Force & Motion',
    date: '2026-11-11',
    checked: true,
    handwriting: 'Non-Readability',
    workQuality: 'C',
    homeworkDone: false,
    remarks: 'Needs check',
    teacherName: 'Rajesh Verma',
  };

  const ev = mapNotebookEntryToEvidence(entry);
  assert.equal(ev.reviewRequired, true);
  assert.ok((ev.olqContributions.organising_ability ?? 100) < 65);
});

test('missing evidence is NEVER treated as zero in Learners Score calculation', () => {
  const onlyAcademic: DevelopmentEvidence[] = [
    {
      id: 'ev-1',
      schoolId: 'school-1',
      studentId: 'stu-1',
      sourceKey: 'exam:stu-1:unit1:math',
      sourceType: 'exam',
      date: '2026-11-01',
      summary: 'Unit Test Math 90/100',
      olqContributions: {},
      componentContributions: { academic: 90 },
      learningSignals: {},
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
  ];

  const breakdown = calculateLearnersScore(onlyAcademic);
  // Since only academic (weight 35) has evidence, normalized score must be 90, NOT 31.5!
  assert.equal(breakdown.overallScore, 90);
  assert.equal(breakdown.availableComponents, 1);
  assert.equal(breakdown.components.olq.score, null);
  assert.equal(breakdown.components.participation.score, null);
});

test('duplicate sourceKey entries are deduplicated to prevent double scoring', () => {
  const ev1: DevelopmentEvidence = {
    id: 'ev-1',
    schoolId: 'school-1',
    studentId: 'stu-1',
    sourceKey: 'nb:stu-1:2026-11-10:math:ch1',
    sourceType: 'notebook_check',
    date: '2026-11-10',
    summary: 'Initial entry',
    olqContributions: { reasoning_ability: 70 },
    componentContributions: { academic: 70 },
    learningSignals: {},
    enteredBy: 'Teacher',
    validated: true,
  };
  const ev2: DevelopmentEvidence = {
    ...ev1,
    id: 'ev-2',
    summary: 'Updated entry',
    olqContributions: { reasoning_ability: 90 },
    componentContributions: { academic: 90 },
  };

  const deduped = deduplicateEvidence([ev1, ev2]);
  assert.equal(deduped.length, 1);
  assert.equal(deduped[0].olqContributions.reasoning_ability, 90);
});

test('when homeworkDone is false, evidence explicitly marks Homework Not Complete and lowers responsibility & habits', () => {
  const incompleteEntry: NotebookEntry = {
    id: 'nb-inc',
    schoolId: 'school-1',
    studentId: 'stu-1',
    classSection: '9-A',
    subject: 'Mathematics',
    chapter: 'Ch. 4',
    date: '2026-11-14',
    checked: true,
    handwriting: 'Readability',
    workQuality: 'B',
    homeworkDone: false,
    remarks: 'Half exercises left',
    teacherName: 'Kavita Sharma',
  };

  const ev = mapNotebookEntryToEvidence(incompleteEntry);
  assert.ok(ev.summary.includes('Homework Not Complete'));
  assert.ok((ev.olqContributions.sense_of_responsibility ?? 100) <= 60);
  assert.ok((ev.componentContributions.learningHabits ?? 100) <= 55);
  assert.ok((ev.learningSignals.independentTaskCompletion ?? 100) <= 55);
});

test('buildLearnersEvidenceTrace returns contributing evidence records matching exact OLQ & component scores', () => {
  const sampleEv: DevelopmentEvidence[] = [
    {
      id: 'ev-t1',
      schoolId: 'school-1',
      studentId: 'stu-1',
      sourceKey: 'exam:1',
      sourceType: 'exam',
      date: '2026-11-01',
      subject: 'Mathematics',
      summary: 'Term 1 Mathematics 88/100',
      olqContributions: { reasoning_ability: 88 },
      componentContributions: { academic: 88 },
      learningSignals: {},
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
    {
      id: 'ev-t2',
      schoolId: 'school-1',
      studentId: 'stu-1',
      sourceKey: 'nb:1',
      sourceType: 'notebook_check',
      date: '2026-11-10',
      subject: 'Mathematics',
      summary: 'Notebook Check Ch. 3',
      olqContributions: { reasoning_ability: 92 },
      componentContributions: { academic: 92 },
      learningSignals: {},
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
  ];

  const olqTrace = buildLearnersEvidenceTrace(sampleEv, 'olq', 'reasoning_ability');
  assert.equal(olqTrace.score, 90);
  assert.equal(olqTrace.items.length, 2);

  const compTrace = buildLearnersEvidenceTrace(sampleEv, 'component', 'academic');
  assert.equal(compTrace.score, 90);
  assert.equal(compTrace.weightPct, 35);
});

