import type { OlqKey, UserRole } from '../types';
export * from './thinkingCollections';

// ============================================================================
// PART 1 & 2 — STUDENT THINKING TESTS (SRT, WAT, TAT, PPDT) & 15-OLQ BRIDGE
// ============================================================================

export type ThinkingTestType = 'SRT' | 'WAT' | 'TAT' | 'PPDT';
export type ThinkingDifficulty = 'Foundation' | 'Intermediate' | 'Advanced';

export type ThinkingDimensionKey =
  | 'fastThinking'
  | 'betterThinking'
  | 'positiveThinking'
  | 'selfCentredThinking';

export interface ThinkingQuestionItem {
  id: string;
  schoolId: string;
  testType: ThinkingTestType;
  title: string;
  prompt: string;
  /** Optional visual scene metadata for TAT / PPDT (rendered via clean vector scene or image path) */
  sceneCode?: string;
  sceneCaption?: string;
  ageBand: string; // e.g. '10-12 yrs', '13-15 yrs', '16-18 yrs'
  classRange: string; // e.g. 'Classes 6-8', 'Classes 9-12'
  difficulty: ThinkingDifficulty;
  defaultTimeLimitSec: number;
  targetOlqs: OlqKey[];
  tags: string[];
  active: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ThinkingScoringConfig {
  schoolId: string;
  /** Minimum corroborated responses across prompts/tests before promoting an OLQ score */
  minCorroborationCount: number;
  fastResponseThresholdMs: number;
  moderateResponseThresholdMs: number;
  positiveMarkers: string[];
  practicalActionMarkers: string[];
  teamResponsibilityMarkers: string[];
  selfCentredMarkers: string[];
  avoidanceMarkers: string[];
  updatedBy: string;
  updatedAt: string;
}

export interface SrtSubDimensions {
  speedOfResponse: number;
  practicalThinking: number;
  decisionMaking: number;
  responsibility: number;
  initiative: number;
  positiveAttitude: number;
  problemSolving: number;
  emotionalMaturity: number;
  teamOrientation: number;
  selfAwareness: number;
}

export interface TatStoryStructure {
  protagonist: string;
  objective: string;
  challenges: string;
  actions: string;
  outcome: string;
}

export interface PpdtPerceptionDetails {
  charactersCount: number;
  approximateAges: string;
  mood: 'Positive' | 'Neutral' | 'Negative';
  centralSituation: string;
  narrationSummary: string;
}

export interface PpdtGroupDiscussionEvaluation {
  groupId: string;
  groupTitle: string;
  communication: number; // 1-10
  cooperation: number; // 1-10
  initiative: number; // 1-10
  listening: number; // 1-10
  leadership: number; // 1-10
  evaluatorName: string;
  evaluatorNotes: string;
  evaluatedAt: string;
}

export interface ThinkingResponseEntry {
  questionId: string;
  promptSnapshot: string;
  responseText: string;
  responseTimeMs: number;
  tatStructure?: TatStoryStructure;
  ppdtPerception?: PpdtPerceptionDetails;
  autoPatternFlags: string[];
  dimensionSnapshot: Record<ThinkingDimensionKey, number>;
  srtSubScores?: SrtSubDimensions;
}

export interface ThinkingDimensionScores {
  fastThinking: number; // 0-100 (speed of comprehension/response; NOT auto-equated with quality)
  betterThinking: number; // 0-100 (practicality, decision effectiveness, structured problem-solving)
  positiveThinking: number; // 0-100 (constructive, optimistic, solution-oriented framing)
  selfCentredThinking: number; // 0-100 (degree of self-focused / non-cooperative response pattern — non-diagnostic)
}

export interface ThinkingAssessmentSession {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  testType: ThinkingTestType;
  workflowMode: 'Individual' | 'Group';
  timedMode: boolean;
  timeLimitSec: number;
  status: 'in_progress' | 'submitted' | 'counsellor_reviewed';
  startedAt: string;
  submittedAt: string;
  responses: ThinkingResponseEntry[];
  dimensionScores: ThinkingDimensionScores;
  srtAverageSubScores?: SrtSubDimensions;
  ppdtGroupEval?: PpdtGroupDiscussionEvaluation;
  strengths: string[];
  developmentAreas: string[];
  suggestedExercises: string[];
  candidateOlqSignals: Partial<Record<OlqKey, number>>;
  aiDraftObservation?: string;
  aiDraftGeneratedAt?: string;
  teacherObservation?: string;
  counsellorRecommendation?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  promotedToOlq: boolean;
  promotedEvidenceKeys: string[];
}

// ============================================================================
// PART 3 — SMART TIMETABLE, AUTO-ASSIGNMENT, CUSTOM LOCK & TEACHER LEAVE
// ============================================================================

export type EnforcementMode = 'off' | 'prefer' | 'restrict';
export type BalanceWeight = 'off' | 'low' | 'medium' | 'high';

export interface EligibilityRuleItem {
  limit: number | null; // null = no limit
  enforcement: EnforcementMode;
}

export interface SubstituteRuleConfig {
  schoolId: string;
  tieBreakers: {
    dailyWorkloadBalance: BalanceWeight;
    weeklyWorkloadBalance: BalanceWeight;
    dailySubstituteBalance: BalanceWeight;
    weeklySubstituteBalance: BalanceWeight;
  };
  eligibility: {
    maxConsecutivePeriods: EligibilityRuleItem;
    maxPeriodsPerDay: EligibilityRuleItem;
    maxSubstitutesPerDay: EligibilityRuleItem;
    maxSubstitutesPerWeek: EligibilityRuleItem;
  };
  updatedBy: string;
  updatedAt: string;
}

export interface TeacherCapabilityProfile {
  id: string;
  schoolId: string;
  teacherName: string;
  teacherCode: string;
  canSubstitute: boolean;
  workingHoursLabel: string; // e.g. 'Full time', '09:05 - 12:50'
  availableFromPeriod: number; // 1..8
  availableToPeriod: number; // 1..8
  maxPeriodsPerDay: number | null;
  maxConsecutivePeriods: number | null;
  maxSubstitutesPerDay: number | null;
  maxSubstitutesPerWeek: number | null;
  autoAssignAllowed: boolean;
  crossLevelEligible: boolean;
  qualifiedSubjects: string[];
}

export interface CapabilityBandItem {
  level: number;
  label: string;
  classes: string[];
}

export interface CapabilityBandConfig {
  schoolId: string;
  mode: 'auto' | 'manual';
  targetLevelCount: number;
  separationScore: number; // 0..1
  bands: CapabilityBandItem[];
  crossLevelTeachers: string[];
  computedAt: string;
}

export interface TimetableMasterConfig {
  schoolId: string;
  title: string; // e.g. 'November 2026'
  workingDays: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>;
  schoolStartTime: string; // '09:05'
  schoolEndTime: string; // '14:10'
  periodDurationMins: number; // 35
  assemblySlot: string; // '08:40 - 09:05'
  breakSlot: string; // '11:25 - 11:40'
  diarySlot: string; // '14:00 - 14:10'
  rooms: string[];
  fixedSlotIds: string[];
  publishState: 'draft' | 'published';
  publishedAt: string;
  publishedBy: string;
  version: number;
}

export interface SubstitutionAuditEntry {
  at: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  detail: string;
}

export interface SubstitutionAssignmentRecord {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  period: number;
  timeRange: string;
  slotId: string;
  classSection: string;
  subject: string;
  room: string;
  absentTeacherName: string;
  substituteTeacherName: string | null;
  leaveRequestId?: string;
  assignmentMode: 'auto_recommended' | 'auto_assigned' | 'custom_manual';
  /** When true, auto-assignment will NEVER silently override this cover */
  manuallyApproved: boolean;
  matchTier: 1 | 2 | 3 | 4 | 5 | 6 | null;
  matchTierLabel: string;
  scorePoints: number;
  ruleWarnings: string[];
  reason: string;
  publishStatus: 'pending_review' | 'published';
  notifiedTeacher: boolean;
  assignedBy: string;
  assignedAt: string;
  publishedBy?: string;
  publishedAt?: string;
  acknowledgedBySubstitute?: boolean;
  acknowledgedAt?: string;
  acknowledgedByName?: string;
  auditHistory: SubstitutionAuditEntry[];
}

export type TeacherLeaveType = 'Casual Leave' | 'Medical Leave' | 'Earned Leave' | 'Official Duty' | 'Half Day';
export type TeacherLeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface TeacherLeaveBalance {
  schoolId: string;
  teacherName: string;
  casualTotal: number;
  casualUsed: number;
  medicalTotal: number;
  medicalUsed: number;
  earnedTotal: number;
  earnedUsed: number;
}

export interface TeacherLeaveRequest {
  id: string;
  schoolId: string;
  teacherName: string;
  teacherUserId?: string;
  leaveType: TeacherLeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  halfDaySession?: 'Morning' | 'Afternoon';
  reason: string;
  supportingDocRef?: string;
  status: TeacherLeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  affectedSlotCount: number;
  generatedCoverIds: string[];
  auditTrail: SubstitutionAuditEntry[];
}

export interface TeacherProductivityKpiConfig {
  schoolId: string;
  weights: {
    teachingWorkload: number; // default 30
    academicExecution: number; // default 45
    operationalEngagement: number; // default 25
  };
  targetWeeklyPeriods: number;
  targetNotebookChecksMonthly: number;
  targetLessonPlansMonthly: number;
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// PART 4 — CAREER COUNSELLING & CAREER INTELLIGENCE PLATFORM
// ============================================================================

export type CareerEntryStage =
  | 'After Class 10'
  | 'After Class 12 — Science'
  | 'After Class 12 — Commerce'
  | 'After Class 12 — Humanities'
  | 'Interdisciplinary & Vocational';

export type BudgetTier = 'Budget (Under ₹3L)' | 'Moderate (₹3L – ₹12L)' | 'Premium (₹12L+)';

export interface CareerFinancialTier {
  tierLabel: 'Government / Public' | 'Private Moderate' | 'Private Premium';
  estimatedTotalInr: string;
  annualFeeRangeInr: string;
  scholarshipNotes: string;
  verificationStatus: 'verified_official' | 'estimated';
  sourceNote: string;
  lastUpdated: string; // YYYY-MM
}

export interface CareerRoadmapStep {
  stage: string;
  timeline: string;
  milestones: string[];
  keyExamsOrCredentials: string[];
}

export interface CareerAptitudeProfile {
  iqFocus: string;
  eqFocus: string;
  aqFocus: string;
  cqFocus: string;
  qualitativeNote: string;
}

export interface CareerSkillsMatrix {
  cognitiveAnalytical: string[];
  technicalDomain: string[];
  communication: string[];
  leadershipCollaboration: string[];
  digitalAiLiteracy: string[];
  emotionalResilience: string[];
  executionSelfManagement: string[];
  ethicsCivicAwareness: string[];
}

export interface CareerActionStage {
  stage: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'Graduation' | 'Pre-Job';
  actions: string[];
}

export interface CareerProfile {
  id: string;
  title: string;
  entryStage: CareerEntryStage;
  streams: string[];
  qualifications: string[];
  interestTags: string[];
  skillTags: string[];
  budgetTier: BudgetTier;
  locationScope: 'India Nationwide' | 'India & Global' | 'Regional & National';
  alignedOlqs: OlqKey[];
  // 9 Mandatory Sections
  overview: {
    summary: string;
    corePurpose: string;
    typicalRoles: string[];
    emergingDirections: string[];
  };
  educationalRoadmap: CareerRoadmapStep[];
  aptitudeProfile: CareerAptitudeProfile;
  workingLife: {
    dailyResponsibilities: string[];
    workEnvironment: string;
    workHoursAndPace: string;
    challengesAndRewards: string;
  };
  financialRoadmap: {
    tiers: CareerFinancialTier[];
    additionalCostsNote: string;
    disclaimer: string;
  };
  marketStudy: {
    demandOutlook: string;
    industryDrivers: string[];
    geographicHubs: string[];
    credibleSources: Array<{ name: string; year: string; note: string }>;
    dataIntegrityNote: string;
  };
  competitionAnalysis: {
    keyEntranceExams: string[];
    competitionDrivers: string[];
    preparationReality: string;
    parallelBackupTracks: string[];
  };
  skillsRequired: CareerSkillsMatrix;
  actionPlan: {
    stages: CareerActionStage[];
    recommendedBooks: string[];
    starterProjects: string[];
    internshipsAndExposure: string[];
  };
}

export interface StudentCareerSessionLog {
  id: string;
  date: string;
  counsellorName: string;
  summary: string;
  studentReflections: string;
  nextSteps: string[];
}

export interface StudentCareerPlan {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  shortlistedCareerIds: string[];
  completedMilestoneKeys?: string[];
  selectedStreamPreference?: string;
  customGoalNote: string;
  counsellorNotes: string;
  sharedWithParent: boolean;
  sessionLogs: StudentCareerSessionLog[];
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// PART 5 — PRESENTATION REDESIGN & VISUAL LEARNING LIBRARY
// ============================================================================

export type SlideVisualTemplate =
  | 'infographic_grid'
  | 'process_flowchart'
  | 'concept_mind_map'
  | 'comparison_matrix'
  | 'chronological_timeline'
  | 'labelled_diagram'
  | 'real_life_application'
  | 'interactive_question'
  | 'visual_summary';

export type PresentationLanguageMode = 'english_only_math' | 'english' | 'bilingual_en_hi';

export interface PresentationAuditIssue {
  code:
    | 'TEXT_HEAVY'
    | 'MISSING_DIAGRAM'
    | 'NO_INTERACTIVE_CHECK'
    | 'WEAK_SUMMARY'
    | 'LANGUAGE_POLICY_MISMATCH';
  severity: 'High' | 'Medium';
  message: string;
  recommendation: string;
}

export interface PresentationAuditRecord {
  id: string;
  schoolId: string;
  resourceId: string;
  title: string;
  classSection: string;
  subject: string;
  chapter: string;
  topic: string;
  learningObjectives: string[];
  difficulty: 'Foundation' | 'Standard' | 'Enrichment';
  languageMode: PresentationLanguageMode;
  teacherName: string;
  originalSlideCount: number;
  avgWordsPerSlide: number;
  visualCoveragePct: number;
  auditScore: number; // 0-100
  issues: PresentationAuditIssue[];
  auditedAt: string;
}

export interface VisualSlideItem {
  id: string;
  slideNumber: number;
  title: string;
  hindiTitle?: string;
  template: SlideVisualTemplate;
  keyTakeaway: string;
  hindiTakeaway?: string;
  visualNodes: Array<{
    label: string;
    detail: string;
    tag?: string;
  }>;
  realLifeExample?: string;
  interactivePrompt?: {
    question: string;
    options?: string[];
    expectedInsight: string;
  };
  speakerNotes: string;
}

export interface PresentationVersionSnapshot {
  versionNumber: number;
  savedAt: string;
  savedBy: string;
  changeNote: string;
  slideCount: number;
}

export interface RedesignedPresentationDeck {
  id: string;
  schoolId: string;
  originalResourceId: string;
  originalTitle: string;
  redesignedTitle: string;
  classSection: string;
  subject: string;
  chapter: string;
  languageMode: PresentationLanguageMode;
  workflowSource: 'visual_studio' | 'notebooklm_import' | 'hybrid';
  versionNumber: number;
  approvalStatus: 'draft' | 'teacher_approved' | 'principal_approved' | 'changes_requested';
  teacherApprovedBy?: string;
  teacherApprovedAt?: string;
  principalApprovedBy?: string;
  principalApprovedAt?: string;
  reviewComment?: string;
  slides: VisualSlideItem[];
  versionHistory: PresentationVersionSnapshot[];
  updatedBy: string;
  updatedAt: string;
}

// ============================================================================
// PART 6 — MONTHLY CLASS-ALIGNED THINKING SETS, SSB DAILY QUEUE & COMPUTER SKILLS
// ============================================================================

export type SchoolClassNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ThinkingMonthlySetUsage {
  id: string;
  schoolId: string;
  classLevel: SchoolClassNumber;
  monthKey: string; // 'YYYY-MM'
  testType: ThinkingTestType;
  setVersion: number; // starts at 1, increments on regeneration
  usedCount: number;
  usedByStudentIds: string[];
  lastUsedAt?: string;
  regeneratedAt?: string;
  regeneratedBy?: string;
}

export interface GeneratedMonthlyThinkingSet {
  setId: string;
  schoolId: string;
  classLevel: SchoolClassNumber;
  classLabel: string;
  monthKey: string;
  monthLabel: string;
  testType: ThinkingTestType;
  setVersion: number;
  defaultTimeLimitSec: number;
  questions: ThinkingQuestionItem[];
  usedInMonth: boolean;
  canRegenerate: boolean;
}

export interface SsbEnrollmentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  enrolled: boolean;
  batchName: string;
  enrolledBy: string;
  enrolledAt: string;
  updatedAt: string;
}

export interface SsbDailyAssignment {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classLevel: SchoolClassNumber;
  dateKey: string; // 'YYYY-MM-DD'
  testType: ThinkingTestType;
  setVersion: number;
  itemCount: number;
  timeLimitSec: number;
  status: 'pending' | 'completed';
  sessionId?: string;
  completedAt?: string;
  assignedAt: string;
}

export type ComputerSkillTaskKind =
  | 'copy_paste'
  | 'folder_management'
  | 'text_format_save'
  | 'find_replace_list'
  | 'spreadsheet_formula'
  | 'data_validation';

export interface ComputerSkillPracticalTaskSpec {
  id: string;
  kind: ComputerSkillTaskKind;
  title: string;
  instruction: string;
  points: number;
  // copy_paste
  sourceText?: string;
  targetPrompt?: string;
  // folder_management
  initialFolders?: string[];
  initialFiles?: Array<{ id: string; name: string; folder: string }>;
  requiredNewFolder?: string;
  requiredMoveFileId?: string;
  requiredDestinationFolder?: string;
  requiredRenameFileId?: string;
  requiredNewFileName?: string;
  // text_format_save
  sampleDocument?: string;
  requiredFormat?: 'bold' | 'underline' | 'both';
  requiredFileName?: string;
  // find_replace_list
  draftParagraph?: string;
  findWord?: string;
  replaceWord?: string;
  // spreadsheet_formula / data_validation
  sheetHeaders?: string[];
  sheetRows?: Array<{ label: string; values: number[] }>;
  formulaPrompt?: string;
  expectedNumericResult?: number;
  requiredFormulaKeyword?: string;
}

export interface ComputerSkillBenchmark {
  id: string;
  schoolId: string;
  classLevel: SchoolClassNumber;
  classLabel: string;
  tierLabel: string;
  targetWpm: number;
  targetAccuracyPct: number;
  typingDurationSec: number;
  typingPassage: string;
  practicalFocus: string;
  tasks: ComputerSkillPracticalTaskSpec[];
  updatedBy: string;
  updatedAt: string;
}

export interface ComputerSkillChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  autoVerified: boolean;
  category: 'sandbox_step' | 'competency_check';
}

export interface ComputerSkillTaskResult {
  taskId: string;
  kind: ComputerSkillTaskKind;
  title: string;
  passed: boolean;
  score: number;
  maxScore: number;
  detail: string;
  checklistItems?: ComputerSkillChecklistItem[];
}

export interface ComputerSkillAttempt {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  classLevel: SchoolClassNumber;
  submittedAt: string;
  targetWpm: number;
  targetAccuracyPct: number;
  grossWpm: number;
  netWpm: number;
  accuracyPct: number;
  errorCount: number;
  typingElapsedSec: number;
  typingBenchmarkMet: boolean;
  typingScore: number; // 0-100
  practicalResults: ComputerSkillTaskResult[];
  competencyChecklist?: ComputerSkillChecklistItem[];
  checklistCompletionPct?: number; // 0-100
  practicalScore: number; // 0-100
  overallScore: number; // 0-100
  grade: 'Distinction' | 'Proficient' | 'Developing' | 'Needs Practice';
  benchmarkPassed: boolean;
}

