import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_20_GAME_FORMATS,
  calculateChapterCoverageScore,
  computeBalancedXp,
  isAttemptMastered,
  selectBestGameFormatForConcept,
} from './interactiveLearningEngine.ts';
import type {
  ChapterLearningBlueprint,
  ExperientialSimulationAsset,
  InteractiveGameAsset,
} from '../types/interactiveLearning.ts';

function createSampleBlueprint(): ChapterLearningBlueprint {
  const now = new Date().toISOString();
  return {
    id: 'bp-test-1',
    schoolId: 'school-a',
    academicSession: '2026-27',
    board: 'CBSE',
    classLevel: 7,
    subject: 'Science',
    chapterNumber: 1,
    chapterTitle: 'Nutrition in Plants',
    teachingLanguage: 'English',
    ageGroup: '11-13 yrs',
    overview: 'Autotrophic and heterotrophic nutrition.',
    topics: [{ topicId: 't1', title: 'Photosynthesis', subtopics: ['Chlorophyll'] }],
    concepts: [
      {
        conceptId: 'c1',
        topicId: 't1',
        title: 'Photosynthesis Process',
        explanation: 'Leaves synthesize glucose using sunlight.',
        explanationApproved: true,
        prerequisites: [],
        difficulty: 'Foundation',
        isDifficult: false,
        diagramsAndProcesses: ['Leaf Cross-Section'],
        practicalApplications: ['Greenhouse farming'],
        learningObjectives: ['Explain photosynthesis'],
        recommendedFormats: ['explanation', 'game', 'visual', 'experiential', 'assessment'],
        suggestedGameFormat: 'drag_and_drop',
        eligibleComponents: {
          explanation: true,
          game: true,
          visual: true,
          experiential: true,
          assessment: true,
        },
        hasApprovedVisualExplanation: true,
        hasApprovedAssessment: true,
        sourceReference: 'CBSE Class 7 Science Ch.1',
      },
      {
        conceptId: 'c2',
        topicId: 't1',
        title: 'Heterotrophic Plants',
        explanation: 'Cuscuta and pitcher plants obtain nutrients differently.',
        explanationApproved: true,
        prerequisites: [],
        difficulty: 'Intermediate',
        isDifficult: true,
        diagramsAndProcesses: ['Pitcher trap'],
        practicalApplications: ['Bog ecosystems'],
        learningObjectives: ['Classify heterotrophic modes'],
        recommendedFormats: ['explanation', 'game', 'assessment'],
        suggestedGameFormat: 'concept_classification',
        eligibleComponents: {
          explanation: true,
          game: true,
          visual: false,
          experiential: false,
          assessment: true,
        },
        hasApprovedVisualExplanation: false,
        hasApprovedAssessment: true,
        sourceReference: 'CBSE Class 7 Science Ch.1',
      },
    ],
    suggestedGames: [],
    suggestedAnimations: [],
    suggestedSimulations: [],
    suggestedExperiments: [],
    assessmentRecommendations: [],
    revisionActivities: [],
    approvalStatus: 'Approved',
    version: 1,
    aiGenerated: false,
    createdBy: 'Teacher',
    createdAt: now,
    updatedAt: now,
  };
}

describe('Interactive Learning Engine — Coverage Score, 20 Formats & Mastery Separation', () => {
  it('supports all 20 distinct game formats and selects diverse formats by subject/concept', () => {
    assert.equal(ALL_20_GAME_FORMATS.length, 20);
    const f1 = selectBestGameFormatForConcept({
      conceptTitle: 'Leaf Cell Structure Diagram',
      subject: 'Science',
      classLevel: 7,
    });
    const f2 = selectBestGameFormatForConcept({
      conceptTitle: 'Water Cycle Process Stages',
      subject: 'Science',
      classLevel: 6,
    });
    const f3 = selectBestGameFormatForConcept({
      conceptTitle: 'Linear Equations Practice',
      subject: 'Mathematics',
      classLevel: 8,
    });
    assert.equal(f1, 'diagram_labelling');
    assert.equal(f2, 'sequence_building');
    assert.notEqual(f1, f3);
  });

  it('calculates Chapter Coverage Score strictly from approved assets (pending/draft never inflate score)', () => {
    const bp = createSampleBlueprint();
    const baseGame: InteractiveGameAsset = {
      id: 'g1',
      schoolId: 'school-a',
      academicSession: '2026-27',
      classLevel: 7,
      subject: 'Science',
      chapterId: 'bp-test-1',
      chapterTitle: 'Nutrition in Plants',
      topicId: 't1',
      conceptId: 'c1',
      conceptTitle: 'Photosynthesis Process',
      learningObjective: 'Explain photosynthesis',
      assetType: 'game',
      gameFormat: 'drag_and_drop',
      difficulty: 'Foundation',
      language: 'English',
      title: 'Photosynthesis Platter',
      instructions: 'Sort inputs and outputs',
      items: [],
      answerKeySummary: 'Summary',
      scoringLogic: { pointsPerCorrect: 10, streakBonus: 5, masteryThresholdPct: 75 },
      sourceReference: 'Ch 1',
      version: 1,
      approvalStatus: 'Approved',
      aiGenerated: false,
      updatedAt: new Date().toISOString(),
    };
    const pendingGame: InteractiveGameAsset = {
      ...baseGame,
      id: 'g2',
      conceptId: 'c2',
      approvalStatus: 'Pending Review',
    };
    const approvedSim: ExperientialSimulationAsset = {
      id: 'exp-1',
      schoolId: 'school-a',
      academicSession: '2026-27',
      classLevel: 7,
      subject: 'Science',
      chapterId: 'bp-test-1',
      chapterTitle: 'Nutrition in Plants',
      topicId: 't1',
      conceptId: 'c1',
      learningObjective: 'Simulate photosynthesis',
      assetType: 'experiential',
      format: 'virtual_lab',
      simulatorKey: 'photosynthesis_lab',
      difficulty: 'Foundation',
      language: 'English',
      title: 'Photosynthesis Lab',
      subtitle: 'Virtual lab',
      instructions: 'Adjust sunlight',
      stages: [],
      sourceReference: 'Ch 1',
      version: 1,
      approvalStatus: 'Approved',
      updatedAt: new Date().toISOString(),
    };

    const beforeApproval = calculateChapterCoverageScore({
      blueprint: bp,
      games: [baseGame, pendingGame],
      experientialAssets: [approvedSim],
    });
    assert.equal(beforeApproval.gamesPct, 50, 'Pending Review game must NOT count toward gamesPct');
    assert.equal(beforeApproval.pendingReviewAssetsCount, 1);

    const afterApproval = calculateChapterCoverageScore({
      blueprint: bp,
      games: [baseGame, { ...pendingGame, approvalStatus: 'Approved' }],
      experientialAssets: [approvedSim],
    });
    assert.equal(afterApproval.gamesPct, 100);
    assert.equal(afterApproval.pendingReviewAssetsCount, 0);
    assert.ok(afterApproval.overallCoveragePct > beforeApproval.overallCoveragePct);
  });

  it('distinguishes verified concept mastery from passive completion / time spent', () => {
    assert.equal(isAttemptMastered({ status: 'completed', accuracyPct: 55 }), false);
    assert.equal(isAttemptMastered({ status: 'in_progress', accuracyPct: 95 }), false);
    assert.equal(isAttemptMastered({ status: 'completed', accuracyPct: 80 }), true);

    const xpLowAcc = computeBalancedXp({ accuracyPct: 40, completed: true, timeSpentSec: 60 });
    const xpImproved = computeBalancedXp({
      accuracyPct: 88,
      completed: true,
      previousBestAccuracyPct: 65,
      timeSpentSec: 60,
    });
    assert.ok(xpImproved > xpLowAcc);
  });
});
