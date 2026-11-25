export type VcipDomainId =
  | 'fluid_reasoning'
  | 'working_memory'
  | 'processing_speed'
  | 'verbal_reasoning'
  | 'quantitative_reasoning'
  | 'spatial_reasoning';

export type VcipMode = 'practice' | 'timed';

export type VcipLanguage = 'en' | 'hi';

export type VcipClassTier = 'foundation_5' | 'middle_6_8' | 'secondary_9_10' | 'senior_11_12';

export type VcipMatrixShapeKind =
  | 'circle'
  | 'triangle'
  | 'square'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'plus'
  | 'ring';

export type VcipMatrixFillKind = 'solid' | 'outline' | 'striped' | 'dot';

export interface VcipMatrixCellSpec {
  shape: VcipMatrixShapeKind;
  count: number; // 1 to 4
  rotation: number; // degrees
  fill: VcipMatrixFillKind;
  color: string;
  scale?: number; // 0.65 to 1.0
  dotCorner?: number; // 0..3 corner marker
}

export interface VcipFluidQuestion {
  id: string;
  domain: 'fluid_reasoning';
  category:
    | 'shape_progression'
    | 'rotation'
    | 'reflection'
    | 'object_count'
    | 'shape_transformation'
    | 'spatial_relationship'
    | 'multi_rule';
  difficulty: 1 | 2 | 3;
  classTier: VcipClassTier;
  prompt: string;
  grid: Array<VcipMatrixCellSpec | null>; // 9 cells, index 8 is null (?)
  options: VcipMatrixCellSpec[]; // 6 original options
  correctIndex: number;
  explanation: string;
}

export type VcipMemorySubtask =
  | 'digit_forward'
  | 'digit_backward'
  | 'visual_tiles'
  | 'sequence_recall';

export interface VcipMemoryTrial {
  id: string;
  domain: 'working_memory';
  subtask: VcipMemorySubtask;
  difficulty: 1 | 2 | 3;
  classTier: VcipClassTier;
  instruction: string;
  sequence: string[]; // digits, chars, or tile indices ("0".."8")
  expectedAnswer: string[]; // exact expected sequence
  gridSize?: 3 | 4; // for visual_tiles
  ruleHint: string;
  displayMsPerItem: number;
}

export interface VcipSymbolKeyEntry {
  digit: number; // 1..9
  symbolId:
    | 'chevron'
    | 'hourglass'
    | 'diamond_dot'
    | 'crescent'
    | 'cross_bar'
    | 'trident'
    | 'arch'
    | 'parallel'
    | 'spiral_box';
  label: string;
}

export interface VcipProcessingSpeedItem {
  id: string;
  symbolId: VcipSymbolKeyEntry['symbolId'];
  correctDigit: number;
}

export interface VcipTextChoiceQuestion {
  id: string;
  domain: 'verbal_reasoning' | 'quantitative_reasoning';
  category: string;
  difficulty: 1 | 2 | 3;
  classTier: VcipClassTier;
  language: VcipLanguage;
  prompt: string;
  passage?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type VcipSpatialKind =
  | 'rotation_2d'
  | 'isometric_3d'
  | 'cube_net'
  | 'shape_assembly';

export interface VcipSpatialSpec {
  kind: VcipSpatialKind;
  cells?: Array<[number, number]>; // 2D polyomino coordinates
  rotationDeg?: number;
  mirrored?: boolean;
  blocks3d?: Array<[number, number, number]>; // isometric blocks
  netFaces?: string[]; // 6 face symbols for cube net
  targetPair?: [string, string]; // opposite or adjacent query
  pieceA?: Array<[number, number]>;
  pieceB?: Array<[number, number]>;
  accentColor: string;
}

export interface VcipSpatialQuestion {
  id: string;
  domain: 'spatial_reasoning';
  category: VcipSpatialKind;
  difficulty: 1 | 2 | 3;
  classTier: VcipClassTier;
  prompt: string;
  reference: VcipSpatialSpec;
  options: Array<{ label: string; spec: VcipSpatialSpec }>;
  correctIndex: number;
  explanation: string;
}

export interface VcipAttemptRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  classLevel: number;
  domain: VcipDomainId;
  mode: VcipMode;
  language: VcipLanguage;
  batterySessionId?: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  accuracyPct: number;
  avgResponseTimeMs: number;
  totalDurationSec: number;
  difficultyLevel: 1 | 2 | 3;
  rawScore: number;
  developmentalScore: number; // 0-100 internal developmental score (NOT IQ)
  speedAccuracyLabel?: string;
  completionStatus: 'completed' | 'partial';
  scoringRuleVersion: string;
  assessedAt: string;
  counsellorNote?: string;
  counsellorReviewedBy?: string;
  counsellorReviewedAt?: string;
}

export interface VcipBrainGymLog {
  id: string;
  schoolId: string;
  studentId: string;
  dateKey: string; // YYYY-MM-DD
  completedChallenges: VcipDomainId[];
  correctCount: number;
  totalCount: number;
  durationSec: number;
  completedAt: string;
}

export type VcipQuestionApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'archived';

export interface VcipAuthoredQuestion {
  id: string;
  schoolId: string;
  domain: VcipDomainId;
  category: string;
  classTier: VcipClassTier;
  language: VcipLanguage;
  difficulty: 1 | 2 | 3;
  prompt: string;
  diagramUrl?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  timeLimitSec: number;
  sourceType: 'human_authored' | 'ai_assisted';
  approvalStatus: VcipQuestionApprovalStatus;
  version: number;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  updatedAt: string;
}

export interface VcipClassAssignment {
  id: string;
  schoolId: string;
  title: string;
  targetClass: string; // e.g., "Class 6", "Class 9-A", "Classes 6-12"
  domains: VcipDomainId[];
  mode: VcipMode;
  language: VcipLanguage;
  scheduledDate: string;
  dueDate: string;
  timeLimitMinutes: number;
  status: 'scheduled' | 'active' | 'completed';
  assignedBy: string;
  createdAt: string;
}

export interface VcipGovernanceConfig {
  schoolId: string;
  launchClassRange: 'classes_5_12' | 'classes_6_12';
  scoringRuleVersion: string;
  parentAccessEnabled: boolean;
  requireGuardianConsent: boolean;
  retentionMonths: number;
  accommodationsExtraTimePct: number;
  updatedBy: string;
  updatedAt: string;
}

export interface VcipDomainSummary {
  domain: VcipDomainId;
  label: string;
  shortLabel: string;
  latestScore: number | null;
  previousScore: number | null;
  delta: number | null;
  accuracyPct: number | null;
  avgResponseTimeMs: number | null;
  attemptsCount: number;
  lastAssessedAt: string | null;
  bandLabel: 'Emerging' | 'Developing' | 'Proficient' | 'Strong' | 'Not Yet Assessed';
}

export interface VcipCareerExplorationIndicator {
  field: string;
  relevantDomains: VcipDomainId[];
  demonstratedStrengths: string[];
  skillsToDevelop: string[];
  recommendedActivities: string[];
  exploratoryNote: string;
}

export type VcipProfileReleaseStatus =
  | 'draft'
  | 'under_review'
  | 'pending_approval'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'revoked';

export interface VcipProfileReleaseRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  status: VcipProfileReleaseStatus;
  sharedCounsellorObservations: string;
  internalCounsellorNote?: string; // Strictly stripped server-side for students and parents
  recommendedExercises: string[];
  parentConsentGranted: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  revokedBy?: string;
  revokedAt?: string;
  rejectionReason?: string;
  updatedAt: string;
}

export interface VcipAccessLogEntry {
  id: string;
  schoolId: string;
  studentId: string;
  accessorUserId: string;
  accessorName: string;
  accessorRole: string;
  action:
    | 'viewed_report'
    | 'submitted_for_approval'
    | 'approved'
    | 'published'
    | 'rejected'
    | 'revoked'
    | 'consent_updated';
  detail: string;
  timestamp: string;
}

