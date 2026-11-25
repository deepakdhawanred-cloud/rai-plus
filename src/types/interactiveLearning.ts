import type { BoardType, SchoolClassNumber } from '../types';

export type ApprovalStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';

export type GameFormatType =
  | 'drag_and_drop'
  | 'matching'
  | 'memory'
  | 'crossword'
  | 'word_search'
  | 'sequence_building'
  | 'concept_classification'
  | 'diagram_labelling'
  | 'interactive_quiz'
  | 'timed_challenge'
  | 'puzzle_solving'
  | 'mystery_solving'
  | 'virtual_treasure_hunt'
  | 'scientific_detective'
  | 'math_challenge'
  | 'simulation_game'
  | 'real_life_decision'
  | 'error_identification'
  | 'flashcard_challenge'
  | 'scenario_problem_solving';

export type ExperientialFormatType =
  | '2d_animation'
  | '3d_motion_graphic'
  | 'interactive_diagram'
  | 'process_animation'
  | 'virtual_experiment'
  | 'virtual_lab'
  | 'interactive_simulation'
  | 'virtual_field_trip'
  | 'historical_reconstruction'
  | 'interactive_map'
  | 'role_play'
  | 'real_life_scenario';

export type SimulatorEngineKey =
  | 'digestive_system'
  | 'photosynthesis_lab'
  | 'water_cycle'
  | 'electric_circuit'
  | 'geometry_fractions'
  | 'volcano_tectonics'
  | 'language_roleplay'
  | 'generic_process';

export type DifficultyBand = 'Foundation' | 'Intermediate' | 'Advanced';

export interface ChapterTopicNode {
  topicId: string;
  title: string;
  subtopics: string[];
}

export interface LearningConceptNode {
  conceptId: string;
  topicId: string;
  title: string;
  explanation: string;
  explanationApproved: boolean;
  prerequisites: string[];
  difficulty: DifficultyBand;
  isDifficult: boolean;
  diagramsAndProcesses: string[];
  practicalApplications: string[];
  learningObjectives: string[];
  recommendedFormats: Array<'explanation' | 'game' | 'visual' | 'experiential' | 'assessment' | 'abacus'>;
  suggestedGameFormat: GameFormatType;
  suggestedExperientialFormat?: ExperientialFormatType;
  eligibleComponents: {
    explanation: boolean;
    game: boolean;
    visual: boolean;
    experiential: boolean;
    assessment: boolean;
  };
  hasApprovedVisualExplanation: boolean;
  hasApprovedAssessment: boolean;
  sourceReference: string;
}

export interface ChapterLearningBlueprint {
  id: string;
  schoolId: string;
  academicSession: string;
  board: BoardType;
  classLevel: SchoolClassNumber;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  teachingLanguage: string;
  ageGroup: string;
  overview: string;
  topics: ChapterTopicNode[];
  concepts: LearningConceptNode[];
  suggestedGames: string[];
  suggestedAnimations: string[];
  suggestedSimulations: string[];
  suggestedExperiments: string[];
  assessmentRecommendations: string[];
  revisionActivities: string[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  aiGenerated: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InteractiveGameQuestion {
  id: string;
  prompt: string;
  hint?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  category?: string;
  pairLeft?: string;
  pairRight?: string;
  orderIndex?: number;
  xPct?: number;
  yPct?: number;
  clue?: string;
  errorText?: string;
  correctedText?: string;
}

export interface InteractiveGameAsset {
  id: string;
  schoolId: string;
  academicSession: string;
  classLevel: SchoolClassNumber;
  subject: string;
  chapterId: string;
  chapterTitle: string;
  topicId: string;
  conceptId: string;
  conceptTitle: string;
  learningObjective: string;
  assetType: 'game';
  gameFormat: GameFormatType;
  difficulty: DifficultyBand;
  language: string;
  title: string;
  instructions: string;
  timeLimitSec?: number;
  categories?: string[];
  items: InteractiveGameQuestion[];
  answerKeySummary: string;
  scoringLogic: {
    pointsPerCorrect: number;
    streakBonus: number;
    masteryThresholdPct: number;
  };
  sourceReference: string;
  version: number;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  assignedClassSections?: string[];
  assignedDeadline?: string;
  aiGenerated: boolean;
  updatedAt: string;
}

export interface ExperientialStage {
  stageNumber: number;
  title: string;
  shortLabel: string;
  narration: string;
  explanation: string;
  labels: string[];
  visualCue: string;
  checkpointQuestion: string;
  checkpointOptions: string[];
  checkpointCorrectIndex: number;
  checkpointExplanation: string;
}

export interface ExperientialSimulationAsset {
  id: string;
  schoolId: string;
  academicSession: string;
  classLevel: SchoolClassNumber;
  subject: string;
  chapterId: string;
  chapterTitle: string;
  topicId: string;
  conceptId: string;
  learningObjective: string;
  assetType: 'experiential';
  format: ExperientialFormatType;
  simulatorKey: SimulatorEngineKey;
  difficulty: DifficultyBand;
  language: string;
  title: string;
  subtitle: string;
  instructions: string;
  stages: ExperientialStage[];
  sourceReference: string;
  version: number;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  assignedClassSections?: string[];
  assignedDeadline?: string;
  updatedAt: string;
}

export type AbacusOperation =
  | 'represent'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'decimal';

export type AbacusSessionMode = 'soroban_practice' | 'mental_flash' | 'speed_drill';

export interface AbacusSessionRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  level: number; // 1..12
  mode: AbacusSessionMode;
  operation: AbacusOperation;
  digits: number;
  questionsAttempted: number;
  correctCount: number;
  accuracyPct: number;
  avgResponseSec: number;
  bestStreak: number;
  mistakePatterns: string[];
  coachFeedback: string;
  recommendedNextLevel: number;
  xpEarned: number;
  completedAt: string;
}

export interface InteractiveLearningAttempt {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  subject: string;
  chapterId: string;
  conceptId: string;
  assetId: string;
  assetTitle: string;
  assetType: 'game' | 'experiential' | 'explanation' | 'assessment' | 'abacus';
  status: 'in_progress' | 'completed';
  progressPct: number;
  scorePct: number;
  accuracyPct: number;
  timeSpentSec: number;
  attemptsCount: number;
  mistakes: string[];
  xpEarned: number;
  updatedAt: string;
  completedAt?: string;
}

export interface CoachOverrideRecord {
  id: string;
  schoolId: string;
  studentId: string;
  recommendedDifficulty?: DifficultyBand;
  focusConcepts: string[];
  teacherNote: string;
  updatedBy: string;
  updatedAt: string;
}

export interface TeacherApprovalPolicyConfig {
  schoolId: string;
  requireTeacherApprovalForAi: boolean;
  autoPublishTeacherEdits: boolean;
  allowStudentsPracticeDrafts: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface ChapterCoverageScore {
  chapterId: string;
  classLevel: SchoolClassNumber;
  subject: string;
  chapterTitle: string;
  overallCoveragePct: number;
  conceptExplanationsPct: number;
  gamesPct: number;
  visualExplanationsPct: number;
  experientialActivitiesPct: number;
  assessmentsPct: number;
  approvedConceptsCount: number;
  totalEligibleConcepts: number;
  pendingReviewAssetsCount: number;
}

export interface StudentBadgeSummary {
  id: string;
  title: string;
  category: 'chapter' | 'subject' | 'abacus' | 'science' | 'math' | 'consistency' | 'accuracy';
  description: string;
  earned: boolean;
  progressPct: number;
}

export interface InteractiveLeaderboardRow {
  studentId: string;
  studentName: string;
  classSection: string;
  totalXp: number;
  level: number;
  avgAccuracyPct: number;
  masteredConceptsCount: number;
  streakDays: number;
  improvementBonus: number;
  compositeRankScore: number;
}

export interface PersonalizedCoachPlan {
  studentId: string;
  weakConcepts: Array<{ conceptId: string; title: string; subject: string; accuracyPct: number; mistakes: string[] }>;
  strongConcepts: Array<{ conceptId: string; title: string; subject: string; accuracyPct: number }>;
  repeatedMistakes: string[];
  recommendedDifficulty: DifficultyBand;
  recommendedActivities: Array<{
    assetId: string;
    assetType: 'game' | 'experiential' | 'abacus';
    title: string;
    reason: string;
  }>;
  revisionSchedule: Array<{ dayLabel: string; focus: string; durationMin: number }>;
  reTeachingNote: string;
  teacherOverride?: CoachOverrideRecord | null;
}

export interface InteractiveLearningOverviewPayload {
  blueprints: ChapterLearningBlueprint[];
  coverageScores: ChapterCoverageScore[];
  games: InteractiveGameAsset[];
  experientialAssets: ExperientialSimulationAsset[];
  attempts: InteractiveLearningAttempt[];
  abacusSessions: AbacusSessionRecord[];
  coachOverrides: CoachOverrideRecord[];
  approvalPolicy: TeacherApprovalPolicyConfig;
  leaderboard: InteractiveLeaderboardRow[];
}
