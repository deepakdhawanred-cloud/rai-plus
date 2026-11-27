import assert from 'node:assert/strict';
import test from 'node:test';
import { CAREER_PROFILES_CATALOG } from '../../server/careerCatalogSeed.ts';
import type {
  ComputerSkillAttempt,
  ExamMark,
  LearnersScoreBreakdown,
  OlqKey,
  StudentRecord,
  ThinkingAssessmentSession,
} from '../types';
import type { VcipAttemptRecord } from '../types/vcip';
import {
  buildStudentCareerIntelligenceMap,
  parseStudentClassNumber,
} from './careerRoadmapEngine.ts';

const PROFILES = CAREER_PROFILES_CATALOG;

function makeStudent(overrides: Partial<StudentRecord> = {}): StudentRecord {
  return {
    id: 'stu-test-1',
    schoolId: 'sch-1',
    admissionNo: 'ADM-100',
    rollNo: '12',
    name: 'Aarav Sharma',
    classSection: '10-A',
    stream: undefined,
    house: 'Shivalik',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '9876543210',
    udiseStudentId: 'UDISE-1',
    haryanaMisId: 'MIS-1',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 48000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
    ...overrides,
  };
}

function makeBreakdown(olqOverrides: Partial<Record<OlqKey, number>>, academicScore = 82): LearnersScoreBreakdown {
  const allKeys: OlqKey[] = [
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
  ];
  const olqScores = {} as LearnersScoreBreakdown['olqScores'];
  for (const key of allKeys) {
    const score = olqOverrides[key] ?? 62;
    olqScores[key] = { score, evidenceCount: 2 };
  }
  return {
    overallScore: academicScore,
    availableComponents: 5,
    evidenceCoveragePct: 80,
    components: {
      academic: { label: 'Academic', weight: 35, score: academicScore, evidenceCount: 4 },
      olq: { label: 'OLQ', weight: 30, score: 75, evidenceCount: 15 },
      learningHabits: { label: 'Learning Habits', weight: 15, score: 78, evidenceCount: 3 },
      participation: { label: 'Participation', weight: 10, score: 74, evidenceCount: 2 },
      personalGrowth: { label: 'Personal Growth', weight: 10, score: 76, evidenceCount: 2 },
    },
    olqScores,
    learningProfile: {
      indicators: {
        independentTaskCompletion: { label: 'Independent Task Completion', score: 78 },
        classroomParticipation: { label: 'Classroom Participation', score: 76 },
        curiosityAndQuestions: { label: 'Curiosity & Questions', score: 80 },
        initiativeProblemSolving: { label: 'Initiative & Problem Solving', score: 79 },
        learningFromMistakes: { label: 'Learning From Mistakes', score: 75 },
        groupContributions: { label: 'Group Contributions', score: 74 },
        selfDirectedReadiness: { label: 'Self-Directed Readiness', score: 78 },
        consistencyOwnership: { label: 'Consistency & Ownership', score: 80 },
      },
      strengths: ['Curiosity', 'Ownership'],
      supportAreas: [],
      advisoryNote: 'Test learning profile',
    },
  };
}

function makeVcipAttempt(
  studentId: string,
  domain: VcipAttemptRecord['domain'],
  score: number,
): VcipAttemptRecord {
  return {
    id: `vcip-${studentId}-${domain}`,
    schoolId: 'sch-1',
    studentId,
    studentName: 'Student',
    classSection: '10-A',
    classLevel: 10,
    domain,
    mode: 'timed',
    language: 'en',
    difficultyLevel: 2,
    totalQuestions: 10,
    correctAnswers: Math.round(score / 10),
    incorrectAnswers: 10 - Math.round(score / 10),
    skippedQuestions: 0,
    totalDurationSec: 120,
    avgResponseTimeMs: 11000,
    rawScore: Math.round(score / 10),
    accuracyPct: score,
    developmentalScore: score,
    speedAccuracyLabel: 'Clear & Confident',
    completionStatus: 'completed',
    scoringRuleVersion: 'vcip-dev-v1.0',
    assessedAt: '2026-08-15T10:00:00Z',
  };
}

test('parseStudentClassNumber parses numeric and Roman class labels accurately', () => {
  assert.equal(parseStudentClassNumber('10-A'), 10);
  assert.equal(parseStudentClassNumber('Class 6 B'), 6);
  assert.equal(parseStudentClassNumber('XII Science'), 12);
  assert.equal(parseStudentClassNumber('XI-C'), 11);
  assert.equal(parseStudentClassNumber('IX-A'), 9);
  assert.equal(parseStudentClassNumber('Unknown'), 9);
});

test('STEM & Digital-strong student ranks Science (PCM) and Software & Applied AI highest', () => {
  const student = makeStudent({ id: 'stu-stem', name: 'Kabir Verma', classSection: '10-A' });
  const examMarks: ExamMark[] = [
    { id: 'm1', schoolId: 'sch-1', studentId: 'stu-stem', examName: 'UT-1', subject: 'Mathematics', maxMarks: 100, obtainedMarks: 95, date: '2026-07-01' },
    { id: 'm2', schoolId: 'sch-1', studentId: 'stu-stem', examName: 'UT-1', subject: 'Physics', maxMarks: 100, obtainedMarks: 92, date: '2026-07-02' },
    { id: 'm3', schoolId: 'sch-1', studentId: 'stu-stem', examName: 'UT-1', subject: 'Computer Science', maxMarks: 100, obtainedMarks: 96, date: '2026-07-03' },
    { id: 'm4', schoolId: 'sch-1', studentId: 'stu-stem', examName: 'UT-1', subject: 'History', maxMarks: 100, obtainedMarks: 60, date: '2026-07-04' },
  ];
  const vcipAttempts: VcipAttemptRecord[] = [
    makeVcipAttempt('stu-stem', 'fluid_reasoning', 92),
    makeVcipAttempt('stu-stem', 'quantitative_reasoning', 94),
    makeVcipAttempt('stu-stem', 'working_memory', 88),
    makeVcipAttempt('stu-stem', 'verbal_reasoning', 62),
  ];
  const compAttempt: ComputerSkillAttempt = {
    id: 'cs-1',
    schoolId: 'sch-1',
    studentId: 'stu-stem',
    studentName: 'Kabir Verma',
    classSection: '10-A',
    classLevel: 10,
    submittedAt: '2026-08-01T10:00:00Z',
    targetWpm: 35,
    targetAccuracyPct: 90,
    grossWpm: 48,
    netWpm: 46,
    accuracyPct: 96,
    errorCount: 2,
    typingElapsedSec: 60,
    typingBenchmarkMet: true,
    typingScore: 95,
    practicalResults: [],
    practicalScore: 94,
    overallScore: 95,
    grade: 'Distinction',
    benchmarkPassed: true,
  };

  const result = buildStudentCareerIntelligenceMap({
    student,
    examMarks,
    breakdown: makeBreakdown({
      reasoning_ability: 92,
      effective_intelligence: 90,
      initiative: 88,
      determination: 86,
    }, 90),
    vcipAttempts,
    computerSkillAttempts: [compAttempt],
    profiles: PROFILES,
    declaredInterests: ['Coding', 'Mathematics', 'AI'],
  });

  assert.equal(result.streamRecommendations[0].id, 'science_pcm');
  assert.equal(result.careerMatches[0].career.id, 'car-software-ai');
  assert.ok(result.careerMatches[0].overallFitScore >= 85);
  assert.equal(result.snapshot.radarMetrics.length, 6);
  assert.ok(result.careerMatches[0].backupBranches.length > 0);
});

test('Humanities & Verbal-strong student ranks Humanities and Law/UPSC among top paths', () => {
  const student = makeStudent({ id: 'stu-hum', name: 'Ananya Deshmukh', classSection: '11-C', stream: 'Humanities' });
  const examMarks: ExamMark[] = [
    { id: 'h1', schoolId: 'sch-1', studentId: 'stu-hum', examName: 'Midterm', subject: 'Political Science', maxMarks: 100, obtainedMarks: 94, date: '2026-07-01' },
    { id: 'h2', schoolId: 'sch-1', studentId: 'stu-hum', examName: 'Midterm', subject: 'English', maxMarks: 100, obtainedMarks: 93, date: '2026-07-02' },
    { id: 'h3', schoolId: 'sch-1', studentId: 'stu-hum', examName: 'Midterm', subject: 'History', maxMarks: 100, obtainedMarks: 91, date: '2026-07-03' },
  ];
  const vcipAttempts: VcipAttemptRecord[] = [
    makeVcipAttempt('stu-hum', 'verbal_reasoning', 93),
    makeVcipAttempt('stu-hum', 'fluid_reasoning', 86),
    makeVcipAttempt('stu-hum', 'working_memory', 84),
  ];

  const result = buildStudentCareerIntelligenceMap({
    student,
    examMarks,
    breakdown: makeBreakdown({
      power_of_expression: 94,
      reasoning_ability: 88,
      self_confidence: 90,
      sense_of_responsibility: 90,
    }, 92),
    vcipAttempts,
    profiles: PROFILES,
    declaredInterests: ['Debate', 'Law', 'Public Policy'],
  });

  assert.equal(result.streamRecommendations[0].id, 'humanities');
  const topThreeIds = result.careerMatches.slice(0, 3).map((m) => m.career.id);
  assert.ok(
    topThreeIds.includes('car-law-corporate-litigation') ||
      topThreeIds.includes('car-upsc-civil-services'),
  );
});

test('Roadmap stage statuses accurately reflect student class level (Class 7 vs Class 10 vs Class 12)', () => {
  const class7 = buildStudentCareerIntelligenceMap({
    student: makeStudent({ classSection: '7-B' }),
    examMarks: [],
    profiles: PROFILES,
  });
  const class10 = buildStudentCareerIntelligenceMap({
    student: makeStudent({ classSection: '10-A' }),
    examMarks: [],
    profiles: PROFILES,
  });
  const class12 = buildStudentCareerIntelligenceMap({
    student: makeStudent({ classSection: '12-A' }),
    examMarks: [],
    profiles: PROFILES,
  });

  const nodes7 = class7.careerMatches[0].roadmapNodes;
  assert.equal(nodes7[0].status, 'current');
  assert.equal(nodes7[1].status, 'upcoming');
  assert.equal(nodes7[5].status, 'destination');

  const nodes10 = class10.careerMatches[0].roadmapNodes;
  assert.equal(nodes10[0].status, 'completed');
  assert.equal(nodes10[1].status, 'current');
  assert.equal(nodes10[2].status, 'upcoming');

  const nodes12 = class12.careerMatches[0].roadmapNodes;
  assert.equal(nodes12[0].status, 'completed');
  assert.equal(nodes12[1].status, 'completed');
  assert.equal(nodes12[2].status, 'current');
  assert.equal(nodes12[3].status, 'upcoming');
});

test('Unrecorded assessments remain null without fabricating scores', () => {
  const emptyThinking: ThinkingAssessmentSession[] = [];
  const result = buildStudentCareerIntelligenceMap({
    student: makeStudent({ id: 'stu-fresh', classSection: '9-B' }),
    examMarks: [],
    vcipAttempts: [],
    thinkingSessions: emptyThinking,
    computerSkillAttempts: [],
    profiles: PROFILES,
  });

  assert.equal(result.snapshot.overallExamAvgPct, null);
  assert.equal(result.snapshot.vcipAvgScore, null);
  assert.equal(result.snapshot.thinkingBetterScore, null);
  assert.equal(result.snapshot.computerSkillScore, null);
  assert.equal(result.snapshot.activeSignalCount, 0);
  assert.equal(result.totalCareersMapped, PROFILES.length);
  // Deterministic non-empty milestone keys
  const firstNode = result.careerMatches[0].roadmapNodes[1];
  assert.ok(firstNode.milestones.length > 0);
  assert.ok(firstNode.milestones[0].key.startsWith(`${result.careerMatches[0].career.id}::`));
});
