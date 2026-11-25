import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSchoolRankings } from './learnersRankingEngine';
import { DEFAULT_LEARNERS_WEIGHTS } from './evidenceEngine';
import type { LearnersScoreBreakdown, StudentRecord } from '../types';

function makeStudent(id: string, name: string, classSection: string): StudentRecord {
  return {
    id,
    schoolId: 'school-test',
    admissionNo: `ADM-${id}`,
    rollNo: id,
    name,
    classSection,
    house: 'Shakti House',
    guardianName: 'Parent',
    guardianPhone: '+91 98120 00000',
    udiseStudentId: `UD-${id}`,
    haryanaMisId: `HM-${id}`,
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 36000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  };
}

function makeBreakdown(scores: {
  academic: number | null;
  olq: number | null;
  learningHabits: number | null;
  participation: number | null;
  personalGrowth: number | null;
}): LearnersScoreBreakdown {
  const entries = [
    ['academic', 'Academic Development', 35, scores.academic],
    ['olq', 'OLQ Development', 30, scores.olq],
    ['learningHabits', 'Learning Habits', 15, scores.learningHabits],
    ['participation', 'Participation and Engagement', 10, scores.participation],
    ['personalGrowth', 'Personal Growth', 10, scores.personalGrowth],
  ] as const;

  let wSum = 0;
  let wTotal = 0;
  let avail = 0;
  const components = {} as LearnersScoreBreakdown['components'];

  for (const [k, label, weight, val] of entries) {
    components[k] = {
      label,
      weight,
      score: val,
      evidenceCount: val !== null ? 1 : 0,
    };
    if (val !== null) {
      wSum += val * weight;
      wTotal += weight;
      avail += 1;
    }
  }

  return {
    overallScore: wTotal > 0 ? Math.round((wSum / wTotal) * 10) / 10 : null,
    availableComponents: avail,
    evidenceCoveragePct: Math.round((avail / 5) * 100),
    components,
    olqScores: {} as LearnersScoreBreakdown['olqScores'],
    learningProfile: {
      indicators: {} as LearnersScoreBreakdown['learningProfile']['indicators'],
      strengths: [],
      supportAreas: [],
      advisoryNote: '',
    },
  };
}

test('computes top 3 ranks per class and across school, excluding missing-evidence students from scoring 0', () => {
  const students = [
    makeStudent('s1', 'Aarav', '9-A'),
    makeStudent('s2', 'Ishita', '9-A'),
    makeStudent('s3', 'Ananya', '9-A'),
    makeStudent('s4', 'Rohan', '9-A'),
    makeStudent('s5', 'Simranjeet', '10-B'),
    makeStudent('s6', 'NoEvidence', '9-A'),
  ];

  const breakdowns: Record<string, LearnersScoreBreakdown> = {
    s1: makeBreakdown({ academic: 88, olq: 88, learningHabits: 88, participation: 88, personalGrowth: 88 }), // 88
    s2: makeBreakdown({ academic: 84, olq: 84, learningHabits: 84, participation: 84, personalGrowth: 84 }), // 84
    s3: makeBreakdown({ academic: 80, olq: 80, learningHabits: 80, participation: 80, personalGrowth: 80 }), // 80
    s4: makeBreakdown({ academic: 72, olq: 76, learningHabits: 64, participation: 80, personalGrowth: 78 }), // 73.4
    s5: makeBreakdown({ academic: 92, olq: 92, learningHabits: 92, participation: 92, personalGrowth: 92 }), // 92
    s6: makeBreakdown({ academic: null, olq: null, learningHabits: null, participation: null, personalGrowth: null }),
  };

  const rankings = computeSchoolRankings(students, breakdowns, DEFAULT_LEARNERS_WEIGHTS, 'SVM-KKR');

  // School Top 3: Simranjeet (92), Aarav (88), Ishita (84)
  assert.deepEqual(
    rankings.schoolTop3.map((r) => [r.rank, r.studentName, r.overallScore]),
    [
      [1, 'Simranjeet', 92],
      [2, 'Aarav', 88],
      [3, 'Ishita', 84],
    ],
  );

  // Class 9-A Top 3: Aarav (88), Ishita (84), Ananya (80)
  assert.deepEqual(
    rankings.classTop3BySection['9-A'].map((r) => [r.rank, r.studentName, r.overallScore]),
    [
      [1, 'Aarav', 88],
      [2, 'Ishita', 84],
      [3, 'Ananya', 80],
    ],
  );
  assert.equal(rankings.classTotalsBySection['9-A'].total, 5);
  assert.equal(rankings.classTotalsBySection['9-A'].ranked, 4);

  // Ananya is in Class 9-A Top 3 (#3), yet #4 in School needing +4.1 pts to beat Ishita (84.0)
  const ananya = rankings.studentStandings['s3'];
  assert.equal(ananya.classTarget.inTop3, true);
  assert.equal(ananya.classTarget.rank, 3);
  assert.equal(ananya.schoolTarget.inTop3, false);
  assert.equal(ananya.schoolTarget.rank, 4);
  assert.equal(ananya.schoolTarget.pointsToTieTop3, 4);
  assert.equal(ananya.schoolTarget.pointsToEnterTop3, 4.1);
  assert.ok(ananya.schoolTarget.effortSteps.length > 0);
  const ananyaGainSum =
    Math.round(ananya.schoolTarget.effortSteps.reduce((acc, s) => acc + s.estimatedOverallGain, 0) * 10) / 10;
  assert.ok(
    ananyaGainSum >= ananya.schoolTarget.pointsToEnterTop3,
    `Expected effort steps gain (${ananyaGainSum}) >= needed (${ananya.schoolTarget.pointsToEnterTop3})`,
  );

  // Rohan is #4 in Class 9-A (score 73.4 vs Ananya 80.0 -> needs +6.7 pts) and #5 in School (vs Ishita 84.0 -> needs +10.7 pts)
  const rohan = rankings.studentStandings['s4'];
  assert.equal(rohan.classTarget.inTop3, false);
  assert.equal(rohan.classTarget.rank, 4);
  assert.equal(rohan.classTarget.pointsToEnterTop3, 6.7);
  assert.equal(rohan.schoolTarget.inTop3, false);
  assert.equal(rohan.schoolTarget.rank, 5);
  assert.equal(rohan.schoolTarget.pointsToEnterTop3, 10.7);
  assert.ok(rohan.classTarget.effortSteps.length > 0);

  // Missing-evidence student is unranked and gets initial guidance instead of 0
  const unranked = rankings.studentStandings['s6'];
  assert.equal(unranked.overallScore, null);
  assert.equal(unranked.classTarget.rank, null);
  assert.equal(unranked.classTarget.inTop3, false);
});

test('handles tied scores cleanly and reports exact margin above #4 for Top 3 leaders', () => {
  const students = [
    makeStudent('t1', 'First', '10-A'),
    makeStudent('t2', 'SecondA', '10-A'),
    makeStudent('t3', 'SecondB', '10-A'),
    makeStudent('t4', 'Fourth', '10-A'),
  ];

  const breakdowns: Record<string, LearnersScoreBreakdown> = {
    t1: makeBreakdown({ academic: 90, olq: 90, learningHabits: 90, participation: 90, personalGrowth: 90 }),
    t2: makeBreakdown({ academic: 85, olq: 85, learningHabits: 85, participation: 85, personalGrowth: 85 }),
    t3: makeBreakdown({ academic: 85, olq: 85, learningHabits: 85, participation: 85, personalGrowth: 85 }),
    t4: makeBreakdown({ academic: 80, olq: 80, learningHabits: 80, participation: 80, personalGrowth: 80 }),
  };

  const rankings = computeSchoolRankings(students, breakdowns, DEFAULT_LEARNERS_WEIGHTS, 'SVM-KKR');
  assert.deepEqual(
    rankings.classTop3BySection['10-A'].map((r) => r.rank),
    [1, 2, 2],
  );
  assert.equal(rankings.studentStandings['t1'].classTarget.leadOverFourth, 10);
  assert.equal(rankings.studentStandings['t4'].classTarget.pointsToEnterTop3, 5.1);
});
