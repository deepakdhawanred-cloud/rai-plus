import type { OlqGroup, OlqKey } from '../types';
import type {
  PpdtGroupDiscussionEvaluation,
  PpdtPerceptionDetails,
  SrtSubDimensions,
  TatStoryStructure,
  ThinkingDifficulty,
  ThinkingDimensionScores,
  ThinkingTestType,
} from './intelligence';

// ============================================================================
// NORMALIZED EXPRESS COLLECTION SCHEMAS — STUDENT THINKING ASSESSMENT MODULE
// Collections:
//   - srtRecords          (Situation Reaction Test records)
//   - watRecords          (Word Association Test records)
//   - tatRecords          (Thematic Apperception Test records)
//   - ppdtRecords         (Picture Perception & Discussion Test records)
//   - thinkingOlqMappings (Explicit relational ledger -> existing 15-OLQ framework)
//   - databaseMigrations  (Versioned, idempotent migration audit ledger)
// ============================================================================

export type ThinkingCollectionName =
  | 'srtRecords'
  | 'watRecords'
  | 'tatRecords'
  | 'ppdtRecords'
  | 'thinkingOlqMappings';

export type WatSentenceConstruction = 'coherent_complete' | 'fragment' | 'one_word';

export type WatUnderlyingPattern =
  | 'constructive'
  | 'positive'
  | 'practical'
  | 'responsible'
  | 'self_centred'
  | 'avoidant'
  | 'neutral';

export interface ThinkingOlqSignalWeight {
  olqKey: OlqKey;
  olqName: string;
  olqGroup: OlqGroup;
  weight: number; // 0..1 relative contribution weight
  derivedScore: number; // 0..100 raw signal score from this record
}

export interface ThinkingRecordBase {
  id: string;
  schoolId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  questionId: string;
  difficulty: ThinkingDifficulty;
  ageBand: string;
  classRange: string;
  timedMode: boolean;
  timeLimitSec: number;
  responseTimeMs: number;
  dimensionScores: ThinkingDimensionScores;
  autoPatternFlags: string[];
  olqSignals: ThinkingOlqSignalWeight[];
  reviewStatus: 'submitted' | 'counsellor_reviewed';
  reviewedBy?: string;
  reviewedAt?: string;
  teacherObservation?: string;
  counsellorRecommendation?: string;
  aiDraftObservation?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Express Collection: `srtRecords`
 * Captures individual Situation Reaction Test responses with all 10 SSB-aligned
 * behavioural evaluation dimensions and 4 independent Thinking Level dimensions.
 */
export interface SrtRecord extends ThinkingRecordBase {
  testType: 'SRT';
  situationTitle: string;
  situationPrompt: string;
  responseText: string;
  subDimensions: SrtSubDimensions;
}

/**
 * Express Collection: `watRecords`
 * Captures Word Association Test responses with cue word, exact reaction latency,
 * sentence construction classification, and non-diagnostic underlying pattern tags.
 */
export interface WatRecord extends ThinkingRecordBase {
  testType: 'WAT';
  cueWord: string;
  responseText: string;
  wordCount: number;
  sentenceConstruction: WatSentenceConstruction;
  underlyingPattern: WatUnderlyingPattern;
  patternTags: WatUnderlyingPattern[];
}

export interface TatTraitEvaluation {
  initiative: number; // 0-100
  planning: number; // 0-100
  confidence: number; // 0-100
  responsibility: number; // 0-100
  empathy: number; // 0-100
  problemSolving: number; // 0-100
}

/**
 * Express Collection: `tatRecords`
 * Captures image-based Thematic Apperception Test stories, structured narrative arc,
 * 6 developmental trait indicators, and historical story sequence number per student.
 */
export interface TatRecord extends ThinkingRecordBase {
  testType: 'TAT';
  sceneCode: string;
  sceneCaption: string;
  storyText: string;
  storyStructure: TatStoryStructure;
  traitEvaluation: TatTraitEvaluation;
  historicalSequenceNo: number;
}

/**
 * Express Collection: `ppdtRecords`
 * Captures ambiguous picture perception metadata, individual story narration,
 * and optional teacher/counsellor group discussion evaluation rubric.
 */
export interface PpdtRecord extends ThinkingRecordBase {
  testType: 'PPDT';
  sceneCode: string;
  sceneCaption: string;
  workflowMode: 'Individual' | 'Group';
  perception: PpdtPerceptionDetails;
  storyText: string;
  groupDiscussion?: PpdtGroupDiscussionEvaluation;
}

/**
 * Express Collection: `thinkingOlqMappings`
 * Explicit relational bridge linking SRT/WAT/TAT/PPDT records onto the existing
 * 15 Officer-Like Qualities (`OLQ_DEFINITIONS`) and `DevelopmentEvidence` table.
 * Enforces multi-response corroboration and deterministic `evidenceSourceKey`
 * so zero duplicate scoring occurs inside the existing Learners Score engine.
 */
export interface ThinkingOlqMappingRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  testType: ThinkingTestType;
  sourceCollection: 'srtRecords' | 'watRecords' | 'tatRecords' | 'ppdtRecords';
  recordId: string;
  sessionId: string;
  olqKey: OlqKey;
  olqName: string;
  olqGroup: OlqGroup;
  rawSignalScore: number; // 0-100
  mappingRationale: string;
  corroboratedResponseCount: number;
  minCorroborationRequired: number;
  corroborationSatisfied: boolean;
  promotedToEvidence: boolean;
  /** Matches `DevelopmentEvidence.sourceKey` (`thinking:${schoolId}:${studentId}:corroborated`) */
  evidenceSourceKey: string;
  reviewedBy?: string;
  reviewedAt?: string;
  updatedAt: string;
}

/**
 * Express Collection: `databaseMigrations`
 * Append-only versioned migration audit ledger stored inside the Express JSON store.
 */
export interface DatabaseMigrationEntry {
  id: string;
  version: string;
  module: 'thinking_assessment';
  name: string;
  description: string;
  status: 'applied' | 'skipped' | 'repaired';
  recordsCreated: number;
  recordsUpdated: number;
  integrityWarnings: string[];
  appliedAt: string;
}

export interface ThinkingMigrationExecutionReport {
  executedAt: string;
  appliedVersions: string[];
  alreadyAppliedVersions: string[];
  collectionCounts: {
    thinkingQuestionBank: number;
    thinkingAssessments: number;
    srtRecords: number;
    watRecords: number;
    tatRecords: number;
    ppdtRecords: number;
    thinkingOlqMappings: number;
  };
  integrityWarnings: string[];
  mutated: boolean;
}

export interface ThinkingOlqWeightRule {
  testType: ThinkingTestType;
  sourceCollection: 'srtRecords' | 'watRecords' | 'tatRecords' | 'ppdtRecords';
  olqKey: OlqKey;
  olqName: string;
  olqGroup: OlqGroup;
  weight: number;
  derivationRule: string;
}
