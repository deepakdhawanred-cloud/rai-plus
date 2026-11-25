import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateThinkingSession,
  buildCorroboratedThinkingOlqEvidence,
  createDefaultThinkingScoringConfig,
  evaluateSingleThinkingResponse,
} from './thinkingAssessmentEngine';
import { calculateLearnersScore, DEFAULT_LEARNERS_WEIGHTS } from './evidenceEngine';
import type { ThinkingQuestionItem } from '../types';

const SAMPLE_SRT_Q: ThinkingQuestionItem = {
  id: 'tq-srt-1',
  schoolId: 'school-vis-jjr',
  testType: 'SRT',
  title: 'Sudden Class Assembly Disruption',
  prompt: 'Your classmate faints during morning assembly and the teacher is away. What do you do?',
  ageBand: '11-15 yrs',
  classRange: 'Classes 6-10',
  difficulty: 'Intermediate',
  defaultTimeLimitSec: 30,
  targetOlqs: ['speed_of_decision', 'sense_of_responsibility', 'initiative', 'cooperation'],
  tags: ['emergency', 'leadership'],
  active: true,
  createdBy: 'Counsellor',
  createdAt: '2026-11-19',
};

test('Fast thinking is kept separate from Better thinking (fast careless response scores high fast, low better)', () => {
  const cfg = createDefaultThinkingScoringConfig('school-vis-jjr');
  const fastCareless = evaluateSingleThinkingResponse({
    question: SAMPLE_SRT_Q,
    responseText: 'Run away and ignore them, not my problem.',
    responseTimeMs: 3000,
    config: cfg,
  });
  const thoughtfulPractical = evaluateSingleThinkingResponse({
    question: SAMPLE_SRT_Q,
    responseText:
      'Stay calm, give space and water, inform the medical teacher immediately, and coordinate with classmates to support safely.',
    responseTimeMs: 14000,
    config: cfg,
  });

  assert.ok(fastCareless.dimensionSnapshot.fastThinking > thoughtfulPractical.dimensionSnapshot.fastThinking);
  assert.ok(thoughtfulPractical.dimensionSnapshot.betterThinking > fastCareless.dimensionSnapshot.betterThinking + 25);
  assert.ok(fastCareless.dimensionSnapshot.selfCentredThinking > thoughtfulPractical.dimensionSnapshot.selfCentredThinking + 25);
});

test('Multi-response corroboration guard blocks single-response OLQ promotion and promotes at >=3 responses into Learners Score', () => {
  const cfg = createDefaultThinkingScoringConfig('school-vis-jjr');
  const qMap = new Map([[SAMPLE_SRT_Q.id, SAMPLE_SRT_Q]]);

  const r1 = evaluateSingleThinkingResponse({
    question: SAMPLE_SRT_Q,
    responseText: 'Stay calm, call medical help, organize classmates to assist safely.',
    responseTimeMs: 9500,
    config: cfg,
  });

  const singleSession = aggregateThinkingSession({
    id: 'ts-1',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    studentName: 'Aarav',
    classSection: '8-A',
    testType: 'SRT',
    workflowMode: 'Individual',
    timedMode: true,
    timeLimitSec: 30,
    startedAt: '2026-11-19T09:00:00Z',
    submittedAt: '2026-11-19T09:02:00Z',
    responses: [r1],
    questionsById: qMap,
  });

  const blocked = buildCorroboratedThinkingOlqEvidence({
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    sessions: [singleSession],
    config: cfg,
    reviewerName: 'Dr. Sunita Gill',
    reviewDateIso: '2026-11-19',
  });
  assert.equal(blocked.eligible, false);
  assert.equal(blocked.evidenceRecords.length, 0);

  // Now corroborate with 3 responses
  const corroboratedSession = aggregateThinkingSession({
    id: 'ts-2',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    studentName: 'Aarav',
    classSection: '8-A',
    testType: 'SRT',
    workflowMode: 'Individual',
    timedMode: true,
    timeLimitSec: 30,
    startedAt: '2026-11-19T09:10:00Z',
    submittedAt: '2026-11-19T09:15:00Z',
    responses: [r1, r1, r1],
    questionsById: qMap,
  });

  const promoted = buildCorroboratedThinkingOlqEvidence({
    schoolId: 'school-vis-jjr',
    studentId: 'stu-1',
    sessions: [corroboratedSession],
    config: cfg,
    reviewerName: 'Dr. Sunita Gill',
    reviewDateIso: '2026-11-19',
  });
  assert.equal(promoted.eligible, true);
  assert.equal(promoted.evidenceRecords.length, 1);
  assert.equal(promoted.evidenceRecords[0].sourceKey, 'thinking:school-vis-jjr:stu-1:corroborated');

  // Verify promoted evidence seamlessly feeds existing Learners Score engine
  const breakdown = calculateLearnersScore(promoted.evidenceRecords, DEFAULT_LEARNERS_WEIGHTS);
  assert.ok(breakdown.components.olq.score !== null && breakdown.components.olq.score > 50);
  assert.ok(breakdown.olqScores.initiative.score !== null);
});
