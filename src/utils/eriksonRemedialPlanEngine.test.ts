import test from 'node:test';
import assert from 'node:assert/strict';
import type { EriksonAssessment } from '../types';
import { buildEriksonRemedialRoadmap } from './eriksonRemedialPlanEngine';

function makeAssessment(overrides: Partial<EriksonAssessment> = {}): EriksonAssessment {
  return {
    studentId: 'stu-test-1',
    studentName: 'Hardik',
    classSection: '6-A',
    estimatedAgeRange: '11–12 yrs',
    expectedStage: {
      stageNumber: 4,
      stageTitle: 'Stage 4 · Industry vs. Inferiority',
      ageRangeLabel: 'Ages 6–11',
      classBandLabel: 'Classes 1 – 6',
      positivePole: 'Industry',
      negativePole: 'Inferiority',
      virtue: 'Competence',
      coreDevelopmentalTask: 'Mastering foundational academic skills and peer collaboration',
    },
    presentStageHeadline: 'Inferiority friction in reading fluency',
    presentStageDetail: 'Reading WPM is below grade band.',
    presentPolarity: 'Negative',
    outcomeStatus: 'negative_stage_alert',
    readinessScorePct: 54,
    signalCoverageCount: 4,
    domainScores: {
      competencePct: 48,
      agencyPct: 68,
      belongingPct: 72,
      regulationPct: 61,
    },
    positiveSignals: [],
    negativeSignals: [
      {
        id: 'sig-read',
        domain: 'Reading & Fluency',
        polarity: 'negative',
        label: 'Reading Fluency below target WPM',
        scorePct: 52,
        evidenceSummary: 'Word-by-word reading at 55 WPM',
      },
    ],
    remedials: [],
    pathBackToPositiveChecklist: ['Daily 10-min reading'],
    recommendedOlqKeys: ['self_confidence', 'determination'],
    transitionGoalStatement: 'Build reading competence.',
    ...overrides,
  };
}

test('buildEriksonRemedialRoadmap generates 4 timed steps tailored to reading gap', () => {
  const roadmap = buildEriksonRemedialRoadmap(makeAssessment());
  assert.equal(roadmap.gapSeverity, 'Action Needed');
  assert.equal(roadmap.steps.length, 4);
  assert.equal(roadmap.steps[0].timelineLabel, 'Week 1 · Days 1–7');
  assert.equal(roadmap.steps[3].timelineLabel, 'Week 4 · Days 22–28');
  assert.match(roadmap.steps[1].classroomExercise, /Reading/i);
  assert.ok(roadmap.steps.every((s) => s.classroomExercise.length > 10 && s.homeExercise.length > 10));
});

test('buildEriksonRemedialRoadmap adapts step 2 to numeracy tables signals', () => {
  const roadmap = buildEriksonRemedialRoadmap(
    makeAssessment({
      negativeSignals: [
        {
          id: 'sig-num',
          domain: 'Academic & Numeracy',
          polarity: 'negative',
          label: 'Multiplication tables recall slow',
          scorePct: 52,
          evidenceSummary: 'Numeracy accuracy 52%',
        },
      ],
    }),
  );
  assert.match(roadmap.steps[1].classroomExercise, /Tables/i);
  assert.match(roadmap.steps[1].homeExercise, /Tables/i);
});

test('buildEriksonRemedialRoadmap returns On Track enrichment roadmap for aligned student', () => {
  const roadmap = buildEriksonRemedialRoadmap(
    makeAssessment({
      outcomeStatus: 'positive_aligned',
      presentPolarity: 'Positive',
      negativeSignals: [],
      domainScores: { competencePct: 86, agencyPct: 84, belongingPct: 88, regulationPct: 85 },
    }),
  );
  assert.equal(roadmap.gapSeverity, 'On Track');
  assert.equal(roadmap.steps.length, 4);
  assert.equal(roadmap.steps[0].targetDomain, 'Stage Enrichment');
});
