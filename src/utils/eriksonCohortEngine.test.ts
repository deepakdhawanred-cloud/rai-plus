import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  DevelopmentalRemedialAssignment,
  ExamMark,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  StudentRecord,
} from '../types';
import { assessCohortEriksonDevelopment } from './eriksonCohortEngine.ts';

function makeStudent(id: string, classSection: string, name: string): StudentRecord {
  return {
    id,
    schoolId: 'school-vis-jjr',
    admissionNo: `VIS-${id}`,
    rollNo: '01',
    name,
    classSection,
    guardianName: 'Guardian',
    guardianPhone: '+91 98111 00000',
    udiseStudentId: `U-${id}`,
    haryanaMisId: `M-${id}`,
    house: 'Shakti',
    attendancePct: 88,
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

function makeBreakdown(score: number): LearnersScoreBreakdown {
  const keys = [
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
  return {
    overallScore: score,
    availableComponents: 5,
    evidenceCoveragePct: 100,
    components: {
      academic: { label: 'Academic', weight: 35, score, evidenceCount: 2 },
      olq: { label: 'OLQ', weight: 30, score, evidenceCount: 2 },
      learningHabits: { label: 'Habits', weight: 15, score, evidenceCount: 2 },
      participation: { label: 'Participation', weight: 10, score, evidenceCount: 1 },
      personalGrowth: { label: 'Growth', weight: 10, score, evidenceCount: 1 },
    },
    olqScores: Object.fromEntries(keys.map((k) => [k, { score, evidenceCount: 2 }])) as LearnersScoreBreakdown['olqScores'],
    learningProfile: {
      indicators: {
        independentTaskCompletion: { label: 'Independent', score },
        classroomParticipation: { label: 'Participation', score },
        curiosityAndQuestions: { label: 'Curiosity', score },
        initiativeProblemSolving: { label: 'Initiative', score },
        learningFromMistakes: { label: 'Mistakes', score },
        groupContributions: { label: 'Group', score },
        selfDirectedReadiness: { label: 'Self-Directed', score },
        consistencyOwnership: { label: 'Consistency', score },
      },
      strengths: [],
      supportAreas: [],
      advisoryNote: 'Test',
    },
  };
}

test('assessCohortEriksonDevelopment flags delayed students first, summarizes stage buckets, and counts assigned interventions', () => {
  const sDelayed = makeStudent('stu-d1', '3-B', 'Kush');
  const sAligned = makeStudent('stu-a1', '9-A', 'Ananya');
  const sNursery = makeStudent('stu-n1', 'Nursery', 'Vihaan');

  const readingReports: MonthlyReadingReport[] = [
    {
      id: 'rr-d1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-d1',
      month: 'November',
      year: 2026,
      wpm: 45,
      accuracyPct: 58,
      comprehensionPct: 55,
      overallPct: 56,
      readingBand: 'Emergent',
      remarks: 'Needs support',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
    {
      id: 'rr-a1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-a1',
      month: 'November',
      year: 2026,
      wpm: 145,
      accuracyPct: 95,
      comprehensionPct: 92,
      overallPct: 93,
      readingBand: 'Fluent',
      remarks: 'Excellent',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
    {
      id: 'rr-n1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-n1',
      month: 'November',
      year: 2026,
      wpm: 34,
      accuracyPct: 82,
      comprehensionPct: 80,
      overallPct: 81,
      readingBand: 'Proficient',
      remarks: 'Good early phonics',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
  ];

  const numeracyReports: MonthlyNumeracyReport[] = [
    {
      id: 'nr-d1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-d1',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 52,
      mentalMathPct: 55,
      problemSolvingPct: 50,
      overallPct: 52,
      remarks: 'Low tables speed',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
    {
      id: 'nr-a1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-a1',
      month: 'November',
      year: 2026,
      tablesFluencyPct: 91,
      mentalMathPct: 90,
      problemSolvingPct: 89,
      overallPct: 90,
      remarks: 'Strong',
      assessedBy: 'Teacher',
      assessedAt: '2026-11-10',
    },
  ];

  const notebooks: NotebookEntry[] = [
    {
      id: 'nb-d1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-d1',
      classSection: '3-B',
      subject: 'English',
      chapter: 'Ch 4',
      date: '2026-11-12',
      checked: true,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      homeworkDone: false,
      remarks: 'Incomplete',
      teacherName: 'Teacher',
    },
  ];

  const examMarks: ExamMark[] = [
    {
      id: 'em-d1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-d1',
      examName: 'UT-2',
      subject: 'Maths',
      maxMarks: 100,
      obtainedMarks: 46,
      date: '2026-11-01',
    },
  ];

  const assignments: DevelopmentalRemedialAssignment[] = [
    {
      id: 'rem-asg-1',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-d1',
      studentName: 'Kush',
      classSection: '3-B',
      stageNumber: 4,
      expectedStageTitle: 'Stage 4 · Industry vs. Inferiority',
      negativePole: 'Inferiority',
      positivePole: 'Industry',
      title: '5-Minute Mastery Checkpoints',
      category: 'Behavioral Intervention',
      description: 'Break classwork into small winnable chunks.',
      steps: ['Give 3 problems first', 'Praise effort privately'],
      expectedOutcome: 'Rebuilds competence',
      durationLabel: '10 mins daily',
      dueDate: '2026-11-28',
      status: 'Assigned',
      source: 'ai_gemini',
      targetOlqs: ['self_confidence', 'determination'],
      assignedBy: 'Ms. Pooja',
      assignedByRole: 'teacher',
      assignedAt: '2026-11-18',
    },
  ];

  const cohort = assessCohortEriksonDevelopment({
    students: [sAligned, sNursery, sDelayed],
    studentBreakdowns: {
      'stu-d1': makeBreakdown(54),
      'stu-a1': makeBreakdown(88),
      'stu-n1': makeBreakdown(84),
    },
    readingReports,
    numeracyReports,
    notebookEntries: notebooks,
    examMarks,
    remedialAssignments: assignments,
  });

  assert.equal(cohort.totalStudents, 3);
  assert.equal(cohort.flaggedDelayedCount, 1);
  assert.equal(cohort.positiveAlignedCount, 2);
  assert.equal(cohort.rows[0].student.id, 'stu-d1');
  assert.equal(cohort.rows[0].delayTier, 'delayed');
  assert.equal(cohort.rows[0].activeAssignmentCount, 1);
  assert.equal(cohort.activeAssignmentsCount, 1);
  assert.deepEqual(cohort.classSections, ['Nursery', '3-B', '9-A']);
  const stage4 = cohort.stageBuckets.find((b) => b.stageNumber === 4);
  assert.equal(stage4?.delayed, 1);
});
