import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  DevelopmentEvidence,
  ExamMark,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  StudentRecord,
} from '../types';
import {
  assessStudentEriksonDevelopment,
  resolveExpectedEriksonStage,
} from './eriksonDevelopmentEngine';

function makeStudent(id: string, classSection: string, name = 'Test Learner'): StudentRecord {
  return {
    id,
    schoolId: 'school-vis-jjr',
    admissionNo: `VIS-${id}`,
    rollNo: '01',
    name,
    classSection,
    guardianName: 'Parent',
    guardianPhone: '+91 98000 00000',
    udiseStudentId: `U-${id}`,
    haryanaMisId: `M-${id}`,
    house: 'Shakti',
    attendancePct: 90,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 45000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    confidentialCounsellorNote: '',
    responsibilities: [],
    achievements: [],
    documents: [],
  };
}

function makeBreakdown(olqBase: number, componentBase: number): LearnersScoreBreakdown {
  const olqs = [
    'effective_intelligence',
    'reasoning_ability',
    'organising_ability',
    'power_of_expression',
    'social_adaptability',
    'cooperation',
    'sense_of_responsibility',
    'initiative',
    'self_confidence',
    'speed_of_decision',
    'influence_group',
    'liveliness',
    'determination',
    'courage',
    'stamina',
  ] as const;
  const olqScores = Object.fromEntries(
    olqs.map((k) => [k, { score: olqBase, evidenceCount: 2 }]),
  ) as LearnersScoreBreakdown['olqScores'];

  return {
    overallScore: componentBase,
    availableComponents: 5,
    evidenceCoveragePct: 100,
    components: {
      academic: { label: 'Academic Development', weight: 35, score: componentBase, evidenceCount: 2 },
      olq: { label: 'OLQ Development', weight: 30, score: olqBase, evidenceCount: 3 },
      learningHabits: { label: 'Learning Habits', weight: 15, score: componentBase, evidenceCount: 2 },
      participation: { label: 'Participation and Engagement', weight: 10, score: componentBase, evidenceCount: 1 },
      personalGrowth: { label: 'Personal Growth', weight: 10, score: componentBase, evidenceCount: 1 },
    },
    olqScores,
    learningProfile: {
      indicators: {
        independentTaskCompletion: { label: 'Independent Task Completion', score: componentBase },
        classroomParticipation: { label: 'Classroom Participation', score: componentBase },
        curiosityAndQuestions: { label: 'Question Asking & Curiosity', score: componentBase },
        initiativeProblemSolving: { label: 'Initiative & Problem-Solving', score: componentBase },
        learningFromMistakes: { label: 'Learning from Mistakes', score: componentBase },
        groupContributions: { label: 'Group Contributions', score: componentBase },
        selfDirectedReadiness: { label: 'Self-Directed Readiness', score: componentBase },
        consistencyOwnership: { label: 'Consistency & Task Ownership', score: componentBase },
      },
      strengths: [],
      supportAreas: [],
      advisoryNote: 'Test advisory',
    },
  };
}

test('resolveExpectedEriksonStage maps Nursery/LKG/UKG, Primary 1-6, and Secondary 7-12 to accurate Erikson stages and age bands', () => {
  const nursery = resolveExpectedEriksonStage('Nursery');
  assert.equal(nursery.expectedStage.stageNumber, 3);
  assert.equal(nursery.expectedStage.positivePole, 'Initiative');
  assert.equal(nursery.expectedStage.negativePole, 'Guilt');
  assert.equal(nursery.estimatedAgeRange, '3–4 yrs');

  const class4 = resolveExpectedEriksonStage('4-A');
  assert.equal(class4.expectedStage.stageNumber, 4);
  assert.equal(class4.expectedStage.positivePole, 'Industry');
  assert.equal(class4.expectedStage.negativePole, 'Inferiority');
  assert.equal(class4.estimatedAgeRange, '9–10 yrs');

  const class10 = resolveExpectedEriksonStage('10-A');
  assert.equal(class10.expectedStage.stageNumber, 5);
  assert.equal(class10.expectedStage.positivePole, 'Identity');
  assert.equal(class10.expectedStage.negativePole, 'Role Confusion');
  assert.equal(class10.estimatedAgeRange, '15–16 yrs');
});

test('assessStudentEriksonDevelopment identifies Positive Stage alignment for thriving student', () => {
  const student = makeStudent('stu-pos', '6-A', 'Aarav');
  student.responsibilities = ['Library Monitor'];

  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'rr-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-pos',
      month: 'November',
      year: 2026,
      wpm: 122,
      accuracyPct: 93,
      comprehensionPct: 88,
      overallPct: 91,
      readingBand: 'Fluent',
      remarks: 'Strong fluent reader',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
  ];

  const numeracyReports: MonthlyNumeracyReport[] = [
    {
      id: 'nr-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-pos',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 88,
      mentalMathPct: 86,
      problemSolvingPct: 84,
      overallPct: 86,
      remarks: 'Strong',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-12',
    },
  ];

  const result = assessStudentEriksonDevelopment({
    student,
    breakdown: makeBreakdown(84, 85),
    readingReports,
    numeracyReports,
  });

  assert.equal(result.expectedStage.stageNumber, 4);
  assert.equal(result.outcomeStatus, 'positive_aligned');
  assert.equal(result.presentPolarity, 'Positive');
  assert.ok(result.readinessScorePct !== null && result.readinessScorePct >= 75);
  assert.equal(result.negativeSignals.length, 0);
  assert.ok(result.remedials.length >= 1);
});

test('assessStudentEriksonDevelopment detects Negative Stage drift and recommends targeted remedials to restore positive stage', () => {
  const student = makeStudent('stu-neg', '5-A', 'Kabir');

  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'rr-neg',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      month: 'November',
      year: 2026,
      wpm: 50,
      accuracyPct: 58,
      comprehensionPct: 55,
      overallPct: 56,
      readingBand: 'Emergent',
      remarks: 'Struggles with multi-syllable decoding',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
  ];

  const numeracyReports: MonthlyNumeracyReport[] = [
    {
      id: 'nr-neg',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 52,
      mentalMathPct: 54,
      problemSolvingPct: 50,
      overallPct: 52,
      conceptualGap: 'Multiplication tables 6–12 hesitation',
      remarks: 'Needs guided drills',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
  ];

  const notebookEntries: NotebookEntry[] = [
    {
      id: 'nb-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      classSection: '5-A',
      chapter: 'Reading Fluency Ch-3',
      date: '2026-11-10',
      subject: 'English',
      checked: true,
      homeworkDone: false,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      remarks: 'Incomplete notebook exercises',
      teacherName: 'Teacher',
    },
    {
      id: 'nb-2',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      classSection: '5-A',
      chapter: 'Tables Ch-4',
      date: '2026-11-12',
      subject: 'Maths',
      checked: true,
      homeworkDone: false,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      remarks: 'Needs step-by-step practice',
      teacherName: 'Teacher',
    },
  ];

  const examMarks: ExamMark[] = [
    {
      id: 'em-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      examName: 'UT-2',
      subject: 'English',
      obtainedMarks: 42,
      maxMarks: 100,
      date: '2026-10-20',
    },
  ];

  const evidence: DevelopmentEvidence[] = [
    {
      id: 'ev-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-neg',
      sourceKey: 'obs-neg-1',
      date: '2026-11-12',
      sourceType: 'teacher_observation',
      summary: 'Student hesitated and felt discouraged during group board work.',
      enteredBy: 'Teacher',
      olqContributions: { self_confidence: 52 },
      componentContributions: { olq: 54 },
      learningSignals: { selfDirectedReadiness: 52 },
      reviewRequired: true,
      validated: true,
    },
  ];

  const result = assessStudentEriksonDevelopment({
    student,
    breakdown: makeBreakdown(55, 54),
    evidence,
    examMarks,
    notebookEntries,
    readingReports,
    numeracyReports,
  });

  assert.equal(result.expectedStage.stageNumber, 4);
  assert.equal(result.outcomeStatus, 'negative_stage_alert');
  assert.equal(result.presentPolarity, 'Negative');
  assert.ok(result.presentStageHeadline.includes('Inferiority'));
  assert.ok(result.negativeSignals.length >= 3);
  assert.ok(result.remedials.some((r) => r.actionType === 'reading_test'));
  assert.ok(result.remedials.some((r) => r.actionType === 'numeracy_test'));
  assert.ok(result.remedials.some((r) => r.actionType === 'intelligence_game'));
  assert.ok(result.pathBackToPositiveChecklist.length >= 2);
});

test('assessStudentEriksonDevelopment guards insufficient evidence without falsely diagnosing negative stage', () => {
  const emptyStudent = makeStudent('stu-new', '8-A', 'New Admission');
  const result = assessStudentEriksonDevelopment({
    student: emptyStudent,
  });

  assert.equal(result.outcomeStatus, 'insufficient_evidence');
  assert.equal(result.presentPolarity, 'Pending');
  assert.equal(result.expectedStage.stageNumber, 5);
});
