export type UserRole =
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'coordinator'
  | 'teacher'
  | 'parent'
  | 'student'
  | 'counsellor'
  | 'accountant'
  | 'transport_incharge'
  | 'clinical_psychologist'
  | 'slp'
  | 'audiologist'
  | 'special_educator'
  | 'ssb_student'
  | 'career_user'
  | 'ssb_admin'
  | 'career_admin';

export type BoardType = 'HBSE' | 'CBSE' | 'NCERT/SCERT';

export type SubscriptionPaymentStatus = 'Paid' | 'Trial' | 'Pending' | 'Custom Enterprise';
export type SubscriptionBillingCycle = 'Monthly' | 'Quarterly' | 'Annual';
export type AttendanceMarkingMode = 'manual' | 'biometric' | 'rfid';

export interface SubscriptionPlanPricingOverride {
  priceMonthlyInr: number;
  annualDiscountPct?: number;
  updatedAt: string;
  updatedBy: string;
  note?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  board: BoardType;
  udiseCode: string;
  haryanaMisCode: string;
  session: string;
  subscriptionPlan: string;
  active: boolean;
  studentCount: number;
  teacherCount: number;
  paymentStatus?: SubscriptionPaymentStatus;
  paidAmountInr?: number;
  billingCycle?: SubscriptionBillingCycle;
  validUntil?: string;
  /** Per-school custom feature overrides set by Super Admin (true = add-on enabled, false = explicitly disabled) */
  customFeatureOverrides?: Record<string, boolean>;
  /** Resolved list of currently enabled platform feature keys for this school */
  enabledFeatures?: string[];
  allotmentUpdatedAt?: string;
  allotmentUpdatedBy?: string;
  allotmentNotes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string | null; // null for platform super_admin or independent public counsellor
  designation: string;
  linkedStudentIds?: string[]; // for parent or student role
  subjectSpecialty?: string;
  classTeacherOf?: string;
  professionalRegistrationNo?: string; // e.g., RCI CRR Number in India
  registrationCouncil?: string; // e.g., Rehabilitation Council of India (RCI)
  scopeOfPractice?: string;
  credentialVerified?: boolean;
  /** True exclusively for the COO of Rai Plus authorized to customize global plan pricing */
  isPlatformCoo?: boolean;
  /** Server-only salted scrypt password hash (stripped before API responses) */
  passwordHash?: string;
  /** Independent product DPDP privacy & minor safeguards */
  isMinor?: boolean;
  guardianConsentName?: string;
  consentAcceptedAt?: string;
  productEntitlements?: Array<'ssb_academy' | 'career_intelligence'>;
}

export type OlqGroup =
  | 'Planning and Organising'
  | 'Social Adjustment'
  | 'Social Effectiveness'
  | 'Dynamic Qualities';

export type OlqKey =
  | 'effective_intelligence'
  | 'reasoning_ability'
  | 'organising_ability'
  | 'power_of_expression'
  | 'social_adaptability'
  | 'cooperation'
  | 'sense_of_responsibility'
  | 'initiative'
  | 'self_confidence'
  | 'speed_of_decision'
  | 'influence_group'
  | 'liveliness'
  | 'determination'
  | 'courage'
  | 'stamina';

export interface OlqDefinition {
  key: OlqKey;
  index: number;
  name: string;
  group: OlqGroup;
  description: string;
}

export type EvidenceSourceType =
  | 'notebook_check'
  | 'homework'
  | 'exam'
  | 'participation'
  | 'responsibility'
  | 'sports_activity'
  | 'teacher_observation'
  | 'thinking_assessment';

export type LearnersComponentKey =
  | 'academic'
  | 'olq'
  | 'learningHabits'
  | 'participation'
  | 'personalGrowth';

export interface LearnersWeights {
  academic: number; // default 35
  olq: number; // default 30
  learningHabits: number; // default 15
  participation: number; // default 10
  personalGrowth: number; // default 10
}

export interface DevelopmentEvidence {
  id: string;
  schoolId: string;
  studentId: string;
  sourceKey: string; // deterministic key to prevent duplicate scoring
  sourceType: EvidenceSourceType;
  subject?: string;
  chapter?: string;
  date: string;
  summary: string;
  olqContributions: Partial<Record<OlqKey, number>>; // 0-100 evidence rating for mapped OLQs
  componentContributions: Partial<Record<LearnersComponentKey, number>>;
  learningSignals: Partial<Record<LearningIndicatorKey, number>>;
  observationContext?: ObservationContext;
  incidentId?: string;
  reviewRequired?: boolean;
  enteredBy: string;
  validated: boolean;
}

export type ObservationContext =
  | 'Classroom'
  | 'Group Activity'
  | 'Project'
  | 'Presentation'
  | 'Practical / Lab'
  | 'Sports / Field'
  | 'House / Assembly Duty'
  | 'Cultural';

export type HomeworkSubmissionStatus = 'Pending' | 'Handed In' | 'Late' | 'Missing';

export interface HomeworkAssignment {
  id: string;
  schoolId: string;
  classSection: string;
  subject: string;
  chapter: string;
  title: string;
  instructions: string;
  assignedDate: string;
  dueDate: string;
  status: 'Active' | 'Cancelled';
  cancellationReason?: string;
  createdBy: string;
  updatedAt: string;
}

export interface HomeworkSubmission {
  id: string;
  schoolId: string;
  assignmentId: string;
  studentId: string;
  status: HomeworkSubmissionStatus;
  feedback: string;
  markedBy: string;
  markedAt: string;
}

export type ActivityKind =
  | 'class'
  | 'group'
  | 'project'
  | 'presentation'
  | 'practical'
  | 'sport'
  | 'house'
  | 'cultural'
  | 'duty';

export type ActivityContributionLevel = 1 | 2 | 3 | 4;

export interface ActivityParticipationEntry {
  studentId: string;
  tookPart: boolean;
  contributionLevel?: ActivityContributionLevel;
  note?: string;
}

export interface ActivityRecord {
  id: string;
  schoolId: string;
  classSection: string;
  kind: ActivityKind;
  title: string;
  date: string;
  recordedBy: string;
  entries: ActivityParticipationEntry[];
}

export type LearningIndicatorKey =
  | 'independentTaskCompletion'
  | 'classroomParticipation'
  | 'curiosityAndQuestions'
  | 'initiativeProblemSolving'
  | 'learningFromMistakes'
  | 'groupContributions'
  | 'selfDirectedReadiness'
  | 'consistencyOwnership';

export type HandwritingRating = 'Readability' | 'Non-Readability';
export type WorkQualityRating = 'A' | 'B' | 'C';

export interface NotebookEntry {
  id: string;
  schoolId: string;
  studentId: string;
  classSection: string;
  subject: string;
  chapter: string;
  date: string;
  checked: boolean;
  handwriting: HandwritingRating;
  workQuality: WorkQualityRating;
  homeworkDone: boolean;
  remarks: string;
  teacherName: string;
}

export type ExamCategory = 'Class Test' | 'UT' | 'Semester Exam';

export interface ExamMark {
  id: string;
  schoolId: string;
  studentId: string;
  examName: string;
  examType?: ExamCategory;
  term?: string;
  subject: string;
  maxMarks: number;
  obtainedMarks: number;
  date: string;
  conceptualGap?: string;
  remarks?: string;
  enteredBy?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Late';

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  correctedBy?: string;
  markedBy?: string;
  contextNote?: string;
  note?: string;
  markingMode?: AttendanceMarkingMode;
  deviceId?: string;
  cardOrBiometricRef?: string;
  verifiedAt?: string;
}

export interface DocumentChecklistItem {
  name: string;
  verified: boolean;
  referenceNo?: string;
}

export interface StudentRecord {
  id: string;
  schoolId: string;
  admissionNo: string;
  rollNo: string;
  name: string;
  classSection: string;
  stream?: string;
  house: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address?: string;
  udiseStudentId: string;
  haryanaMisId: string;
  attendancePct: number;
  feeBalanceInr: number;
  totalFeeAnnualInr: number;
  reportApprovalStatus: 'Draft' | 'Pending Approval' | 'Approved';
  formulaVersion: string;
  documents: DocumentChecklistItem[];
  responsibilities: string[];
  achievements: string[];
  confidentialCounsellorNote: string; // hidden from parents/students
  visReportFileId?: string;
  familyAccountId?: string;
}

export interface LearnersScoreBreakdown {
  overallScore: number | null;
  availableComponents: number;
  evidenceCoveragePct: number;
  components: Record<
    LearnersComponentKey,
    {
      label: string;
      weight: number;
      score: number | null;
      evidenceCount: number;
    }
  >;
  olqScores: Record<OlqKey, { score: number | null; evidenceCount: number }>;
  learningProfile: {
    indicators: Record<LearningIndicatorKey, { label: string; score: number | null }>;
    strengths: string[];
    supportAreas: string[];
    advisoryNote: string;
  };
}

export type ResourceCategory =
  | 'Presentations'
  | 'Teacher Guides'
  | 'Worksheets'
  | 'Answer Keys'
  | 'Assessments and Rubrics';

export interface AcademicResource {
  id: string;
  schoolId: string;
  title: string;
  classSection: string;
  subject: string;
  chapter: string;
  session: string;
  board: BoardType;
  category: ResourceCategory;
  status: 'Draft' | 'Approved';
  pushedToStudents?: boolean;
  pushedBy?: string;
  pushedAt?: string;
  contentSummary: string;
  createdBy: string;
  aiAssisted: boolean;
  updatedAt: string;
}

export interface LessonPlan {
  id: string;
  schoolId: string;
  level: 'Yearly' | 'Monthly' | 'Weekly' | 'Daily';
  classSection: string;
  subject: string;
  topic: string;
  learningOutcome: string;
  status: 'Completed' | 'In Progress' | 'Pending Revision' | 'Calendar Change Requested';
  teacherName: string;
  targetDate: string;
  approvalRequired?: boolean;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  day: string;
  period: number;
  timeRange: string;
  classSection: string;
  subject: string;
  teacherName: string;
  room?: string;
  substitutionTeacher?: string;
}

export type HomeVisitStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

export type HomeVisitOutcome =
  | 'Proceed to Admission'
  | 'Scholarship / Fee Review'
  | 'Follow-up Visit Needed'
  | 'Not Proceeding';

export interface HomeVisitRecord {
  id: string;
  schoolId: string;
  leadId: string;
  studentName: string;
  applyingClass: string;
  parentName: string;
  phone: string;
  visitDate: string;
  visitSlot: string;
  visitingStaff: string;
  address: string;
  locality: string;
  guardianMet: string;
  homeEnvironmentSummary: string;
  learningSupportNotes: string;
  transportOrFeeNotes: string;
  status: HomeVisitStatus;
  outcome: HomeVisitOutcome;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionLead {
  id: string;
  schoolId: string;
  studentName: string;
  applyingClass: string;
  parentName: string;
  phone: string;
  email: string;
  source: 'Website' | 'Walk-in' | 'Referral' | 'Career Portal';
  stage: 'New Enquiry' | 'Follow-up Scheduled' | 'Campus Visit' | 'Document Verification' | 'Confirmed';
  assignedCounsellor: string;
  nextFollowUpDate: string;
  notes: string;
  address?: string;
  locality?: string;
  residentialLat?: number;
  residentialLng?: number;
  previousSchool?: string;
  convertedStudentId?: string;
  transportPreference?: 'Bus' | 'Walker' | 'Undecided';
  recommendedRouteId?: string;
  recommendedRouteCode?: string;
  recommendedRouteName?: string;
  recommendedStopName?: string;
  recommendedPickupTime?: string;
  recommendedRouteConfidence?:
    | 'Geolocation Optimal'
    | 'Exact Area Match'
    | 'Nearby Corridor'
    | 'Nearest Available';
  recommendedRouteReason?: string;
  recommendedEfficiencyScore?: number;
  recommendedDistanceKm?: number;
  recommendedDetourKm?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerCounsellingRequest {
  id: string;
  schoolId: string | null; // null if external public visitor
  applicantName: string;
  category: 'School Student' | 'College Student' | 'Graduate' | 'Working Professional';
  email: string;
  phone: string;
  currentStage: string;
  interests: string[];
  strengths: string;
  goalSummary: string;
  preferredSlot: string;
  assignedCounsellor: string;
  status: 'Requested' | 'Counsellor Assigned' | 'Session Scheduled' | 'Report Reviewed';
  aiAdvisoryReport?: string;
  counsellorReviewNote?: string;
  createdAt: string;
}

export interface FeeTransaction {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  schedule: 'Monthly' | 'Quarterly';
  amountDueInr: number;
  concessionInr: number;
  amountPaidInr: number;
  receiptNo: string;
  status: 'Paid' | 'Pending' | 'Partial';
  paidDate: string;
}

export interface OperationalItem {
  id: string;
  schoolId: string;
  module: 'Transport' | 'Library' | 'Inventory' | 'Sports' | 'Competitions' | 'Complaints';
  title: string;
  detail: string;
  ownerOrRoute: string;
  status: string;
  date: string;
  imageUrl?: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category:
    | 'Educational Psychology'
    | 'Parenting'
    | 'Career Guidance'
    | 'OLQs & Student Development'
    | 'School Management'
    | 'Competitive Examinations';
  author: string;
  readTime: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  publishedDate: string;
  excerpt: string;
  body: string;
}

export interface AuditLogEntry {
  id: string;
  schoolId: string | null;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  detail: string;
}

export interface PublicEnquiry {
  id: string;
  type: 'School Demo & Onboarding' | 'Parent Admission & Campus Visit' | 'General Contact';
  schoolOrOrgName: string;
  contactName: string;
  email: string;
  phone: string;
  cityState: string;
  board?: string;
  studentName?: string;
  applyingClass?: string;
  preferredVisitDate?: string;
  message: string;
  createdAt: string;
}

export type CognitiveCategory =
  | 'Visual Attention'
  | 'Memory Training'
  | 'Perception Training'
  | 'Response Control'
  | 'Logical Thinking'
  | 'Cognitive Flexibility';

export type CognitiveGamePhase = 'Phase 1 · Core' | 'Phase 2 · Advanced' | 'Phase 3 · Adaptive';

export type AgeBand =
  | 'Classes 1–2'
  | 'Classes 3–5'
  | 'Classes 6–8'
  | 'Classes 9–10'
  | 'Classes 11–12';

export interface CognitiveGameDefinition {
  id: string;
  catalogNumber: number;
  title: string;
  titleHi: string;
  category: CognitiveCategory;
  phase: CognitiveGamePhase;
  skillFocus?: 'reading' | 'tables' | 'writing' | 'focus' | 'general';
  shortDesc: string;
  instructionsEn: string;
  instructionsHi: string;
  develops: string[];
  measurements: string[];
  learningIndicators: string[];
  potentialOlqRelevance: OlqKey[];
  supportedLevels: [1, 2, 3, 4, 5];
}

export interface CognitiveAttemptRecord {
  id: string;
  schoolId: string;
  studentId: string;
  gameId: string;
  category: CognitiveCategory;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  accuracyPct: number;
  completionTimeSec: number;
  reactionTimeMs: number | null;
  errorCount: number;
  scorePoints: number;
  completed: boolean;
  challengeTag?: 'daily' | 'weekly' | 'assigned' | 'practice';
  playedAt: string;
}

export interface CognitiveAssignment {
  id: string;
  schoolId: string;
  gameId: string;
  targetClassSection: string;
  studentId?: string;
  recommendedLevel: 1 | 2 | 3 | 4 | 5;
  teacherName: string;
  dueDate: string;
  note: string;
  createdAt: string;
}

export interface RankedStudentEntry {
  studentId: string;
  studentName: string;
  classSection: string;
  rank: number;
  overallScore: number;
  evidenceCoveragePct: number;
}

export interface EffortActionStep {
  componentKey: LearnersComponentKey;
  componentLabel: string;
  weightPct: number;
  currentScore: number | null;
  targetScore: number;
  estimatedOverallGain: number;
  actionHint: string;
}

export interface Top3TargetGap {
  scope: 'class' | 'school';
  scopeLabel: string;
  rank: number | null;
  totalRanked: number;
  totalStudents: number;
  inTop3: boolean;
  cutoffScore: number | null;
  cutoffStudentName: string | null;
  pointsToEnterTop3: number;
  pointsToTieTop3: number;
  leadOverFourth: number | null;
  statusMessage: string;
  effortSteps: EffortActionStep[];
}

export interface StudentTop3Standing {
  studentId: string;
  studentName: string;
  classSection: string;
  overallScore: number | null;
  evidenceCoveragePct: number;
  classTarget: Top3TargetGap;
  schoolTarget: Top3TargetGap;
}

export interface SchoolRankingsSummary {
  schoolTop3: RankedStudentEntry[];
  classTop3BySection: Record<string, RankedStudentEntry[]>;
  classTotalsBySection: Record<string, { total: number; ranked: number }>;
  schoolTotals: { total: number; ranked: number };
  studentStandings: Record<string, StudentTop3Standing>;
}

export type DevelopmentReviewStatus = 'Pending' | 'Confirmed' | 'Withdrawn';

export interface DevelopmentReviewItem {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  sourceType: 'notebook_work_quality_c' | 'observation_conflict' | 'accommodation_check';
  sourceId: string;
  sourceKey?: string;
  subject: string;
  chapter: string;
  summary: string;
  status: DevelopmentReviewStatus;
  decisionNote: string;
  openedBy: string;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Academic'
  | 'Teacher'
  | 'Transport'
  | 'Behaviour / Bullying'
  | 'Infrastructure'
  | 'Safety'
  | 'Fee'
  | 'Other';

export type ComplaintPriority = 'Standard' | 'Urgent' | 'Safeguarding Escalation';

export type ComplaintStatus = 'New' | 'Assigned' | 'Investigating' | 'Resolved' | 'Reopened';

export interface ParentComplaint {
  id: string;
  refNo: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  parentName: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  photoDataUrl?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedCoordinator: string;
  internalStaffNote?: string;
  resolutionNote: string;
  parentFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceContributionLine {
  evidenceId: string;
  sourceType: EvidenceSourceType;
  date: string;
  subject?: string;
  summary: string;
  score: number;
  enteredBy: string;
  reviewRequired?: boolean;
}

export interface TargetEvidenceTrace {
  targetType: 'component' | 'olq';
  targetKey: string;
  targetLabel: string;
  score: number | null;
  weightPct?: number;
  formulaNote: string;
  items: EvidenceContributionLine[];
}

export type DiscTrait =
  | 'CAUTIOUS'
  | 'ADAPTIVE'
  | 'DECISIVE'
  | 'EXPRESSIVE'
  | 'DOMINANT'
  | 'INFLUENTIAL'
  | 'STEADY';

export type DiscBird = 'Owl' | 'Dove' | 'Eagle' | 'Peacock';

export interface VisMultipleIntelligences {
  interpersonal: number | null;
  visualSpatial: number | null;
  bodilyKinesthetic: number | null;
  musical: number | null;
  intrapersonal: number | null;
  logicalMathematical: number | null;
  verbalLinguistic: number | null;
  naturalist: number | null;
}

export interface VisBrainLobes {
  action: number | null;
  thinking: number | null;
  tactile: number | null;
  auditory: number | null;
  visual: number | null;
}

export interface VisParsedReportProfile {
  fileId: string;
  reportSubjectName: string;
  brainDominance: {
    leftPct: number | null;
    rightPct: number | null;
  };
  vak: {
    visualPct: number | null;
    auditoryPct: number | null;
    kinestheticPct: number | null;
    dominantStyle: 'Visual' | 'Auditory' | 'Kinesthetic' | null;
  };
  quotients: {
    iq: number | null;
    eq: number | null;
    aq: number | null;
    cq: number | null;
  };
  multipleIntelligences: VisMultipleIntelligences;
  topIntelligences: Array<{ key: keyof VisMultipleIntelligences; label: string; score: number }>;
  brainLobes: VisBrainLobes;
  personality: {
    primaryTrait: DiscTrait | null;
    secondaryTrait: DiscTrait | null;
    primaryBird: DiscBird | null;
    secondaryBird: DiscBird | null;
  };
  motiveThought: {
    motivePct: number | null;
    thoughtPct: number | null;
  };
  leadership: {
    taskOrientedPct: number | null;
    relationshipOrientedPct: number | null;
  };
  advisorySummary: {
    studyTips: string[];
    classroomSupport: string[];
    suggestedCognitiveCategories: CognitiveCategory[];
    governanceNotice: string;
  };
  extractedAt: string;
  extractionSource: 'preparsed_bundle' | 'live_drive_pdf';
}

export interface VisReportCatalogItem {
  fileId: string;
  fileName: string;
  studentName: string;
  rawClassFolder: string;
  normalizedClass: string;
  section: string;
  driveUrl: string;
  downloadUrl: string;
}

export interface ProductionRegisterRow {
  rowId: string;
  classLabel: string;
  subject: string;
  book: string;
  chapterNum: string;
  chapterTitle: string;
  deliverablesCompleted: string;
  sourceVerification: string;
  aiQaStatus: string;
  teacherApproval: string;
  notes: string;
}

export interface RegisterApprovalRecord {
  approvedBy: string;
  approvedAt: string;
  note?: string;
}

export interface ViratDriveFileItem {
  id: string;
  title: string;
  href: string;
  downloadUrl: string;
  extension: string;
  category: ResourceCategory;
  extractedPreview?: string;
}

export interface ViratResourcePack {
  id: string;
  className: string;
  subject: string;
  chapterTitle: string;
  folderHref: string;
  totalFiles: number;
  filesByCategory: Record<ResourceCategory, ViratDriveFileItem[]>;
}

export type FeeMonthKey =
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December'
  | 'January'
  | 'February'
  | 'March';

export type FeeScheduleCadence =
  | 'Monthly'
  | 'Quarterly'
  | 'Half-Yearly'
  | 'Yearly'
  | 'Periodic';

export type CanonicalFeePaymentPlan = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';

export interface FeeMonthBreakdownItem {
  month: FeeMonthKey;
  dueInr: number;
  previouslyPaidInr: number;
  paidNowInr: number;
  totalPaidInr: number;
  remainingInr: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  coveredNow: boolean;
  partialNow: boolean;
}

export interface UpcomingExpectedInstallment {
  label: string;
  months: FeeMonthKey[];
  dueDate: string; // YYYY-MM-DD
  expectedAmountInr: number;
  includesPartialAdjustment?: boolean;
}

export interface FeeLedgerAccount {
  id: string;
  schoolId: string;
  studentId?: string;
  admissionType: 'NEW' | 'OLD';
  admissionNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  rawClass: string;
  contactNo: string;
  dob?: string;
  address: string;
  remarks: string;
  lastYearBalanceInr: number;
  yearlyDemandInr: number;
  perMonthInr: number;
  monthlyPaidInr: Record<FeeMonthKey, number>;
  paidAmountInr: number;
  settleAmountInr: number;
  balanceFeesInr: number;
  fineInr: number;
  scheduleCadence: FeeScheduleCadence;
  paymentPlanConfirmed?: boolean;
  expectedScheduleNote: string;
  lastPaidDate?: string;
  paidTillMonth?: FeeMonthKey;
  partialAdjustedMonth?: FeeMonthKey;
  partialAdjustedAmountInr?: number;
  partialRemainingInr?: number;
  nextExpectedFeeDate?: string;
  nextExpectedFeeAmountInr?: number;
  familyGroupId?: string;
  familyAccountId?: string;
}

export type SiblingClusterStatus = 'Alert' | 'Merged' | 'Dismissed';

export interface SiblingFamilyGroup {
  id: string;
  schoolId: string;
  guardianName: string;
  contactNo: string;
  address: string;
  memberAccountIds: string[];
  primaryAccountId: string;
  matchReasons: string[];
  status: SiblingClusterStatus;
  isManualMerge?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MonthlyFeeTargetConfig {
  schoolId: string;
  monthKey: FeeMonthKey;
  year: number;
  overrideTargetInr: number | null;
  updatedBy?: string;
  updatedAt?: string;
}

export type FeePaymentMode = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';

export interface FeePaymentReceipt {
  id: string;
  receiptNo: string;
  schoolId: string;
  accountIds: string[];
  familyGroupId?: string;
  payerLabel: string;
  admissionNo?: string;
  fatherName?: string;
  contactNo?: string;
  className?: string;
  amountInr: number;
  paymentMode: FeePaymentMode;
  monthKey: FeeMonthKey;
  scheduleCadence?: FeeScheduleCadence;
  paidTillMonth?: FeeMonthKey;
  coveredMonths?: FeeMonthKey[];
  partialAdjustedMonth?: FeeMonthKey;
  partialAdjustedAmountInr?: number;
  partialMonthTotalPaidInr?: number;
  partialMonthRemainingInr?: number;
  lybAdjustedInr?: number;
  upcomingInstallments?: UpcomingExpectedInstallment[];
  previousPendingBalanceInr?: number;
  totalPendingBalanceInr?: number;
  nextExpectedFeeAmountInr?: number;
  nextExpectedFeeDate?: string;
  nextExpectedFeeMonth?: FeeMonthKey;
  remarks?: string;
  reminderId?: string;
  paidDate: string;
  recordedBy: string;
  allocations: Array<{
    accountId: string;
    studentName: string;
    className: string;
    allocatedInr: number;
  }>;
}

export interface FeeReminderCalendarEvent {
  id: string;
  schoolId: string;
  receiptId: string;
  receiptNo: string;
  accountIds: string[];
  studentIds?: string[];
  familyGroupId?: string;
  payerLabel: string;
  className?: string;
  contactNo?: string;
  dueDate: string; // YYYY-MM-DD
  expectedAmountInr: number;
  pendingBalanceInr: number;
  paidTillMonth: FeeMonthKey;
  scheduleCadence?: FeeScheduleCadence;
  installmentLabel?: string;
  status: 'Scheduled' | 'Reminded' | 'Paid';
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export type DefaulterAlertChannel = 'WhatsApp' | 'Email' | 'Both';
export type DefaulterAlertTierScope = 'Critical' | 'CriticalAndHigh';
export type DefaulterAlertDeliveryStatus =
  | 'Sent'
  | 'Portal Queued'
  | 'Partial'
  | 'Failed'
  | 'Acknowledged';

export interface DefaulterAlertChannelResult {
  channel: 'WhatsApp' | 'Email';
  recipient: string;
  status:
    | 'Sent'
    | 'Queued (Gateway Unconfigured)'
    | 'Skipped (Missing Contact)'
    | 'Failed';
  providerRef?: string;
  detail?: string;
}

export interface FeeDefaulterNotificationConfig {
  schoolId: string;
  autoEnabled: boolean;
  tierScope: DefaulterAlertTierScope;
  minPriorityScore: number;
  minPercentLeft: number;
  channel: DefaulterAlertChannel;
  cooldownDays: number;
  scheduleLabel: string;
  messageTemplate: string;
  lastAutoRunAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface FeeDefaulterNotificationRecord {
  id: string;
  schoolId: string;
  accountId: string;
  studentId?: string;
  admissionNo: string;
  studentName: string;
  className: string;
  guardianName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  channel: DefaulterAlertChannel;
  deliveryChannels: DefaulterAlertChannelResult[];
  status: DefaulterAlertDeliveryStatus;
  triggerType: 'Automated Batch' | 'Manual Single';
  activeMonth: FeeMonthKey;
  riskTier: 'Critical' | 'High' | 'Moderate';
  defaulterPriorityScore: number;
  percentLeft: number;
  overdueTillMonthInr: number;
  balanceDueInr: number;
  paymentNature: string;
  messageBody: string;
  triggeredBy: string;
  sentAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface NotificationGatewayStatus {
  emailConfigured: boolean;
  whatsappConfigured: boolean;
  emailProvider: string;
  whatsappProvider: string;
}

export interface SchoolFeeStructureRow {
  id: string;
  schoolId: string;
  session: string;
  className: string;
  admissionFeeInr: number;
  annualChargesInr: number;
  tuitionMonthlyInr: number;
  labActivityMonthlyInr: number;
  transportOptionalMonthlyInr: number;
  totalMonthlyInr: number;
  totalAnnualRecurringInr: number;
  quarterlyInstallmentInr: number;
  halfYearlyInstallmentInr: number;
  defaultPaymentPlan: CanonicalFeePaymentPlan;
  notes?: string;
  updatedBy: string;
  updatedAt: string;
}

export interface BusRouteStop {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  morningPickupTime: string; // HH:mm
  eveningDropTime: string;   // HH:mm
  sequence: number;
}

export interface BusRoute {
  id: string;
  schoolId: string;
  routeCode: string; // e.g., R-01
  routeName: string; // e.g., Bahadurgarh Road – Sector 6 Express
  busNumber: string; // e.g., HR-14-S-2041
  capacity: number;
  driverName: string;
  driverPhone: string;
  driverLicenseNo: string;
  driverExperienceYears: number;
  attendantName: string;
  attendantPhone: string;
  gpsEnabled: boolean;
  gpsDeviceId?: string;
  gpsStatus: 'Live' | 'Parked' | 'Offline' | 'No GPS';
  currentLat: number;
  currentLng: number;
  currentSpeedKmph: number;
  headingDeg: number;
  currentStopIndex: number;
  activeShift: 'Morning' | 'Evening' | 'Idle';
  lastGpsPingAt: string;
  monthlyFeeInr: number;
  areasCovered: string[];
  stops: BusRouteStop[];
  routeColor: string;
  active: boolean;
}

export type StudentTransportMode = 'Bus' | 'Walker';

export interface StudentTransportAllocation {
  studentId: string;
  schoolId: string;
  mode: StudentTransportMode;
  routeId?: string;
  stopId?: string;
  stopName?: string;
  areaLocality: string;
  pickupTime?: string;
  dropTime?: string;
  assignedBy: string;
  assignedAt: string;
  notes?: string;
}

export type TransportAttendanceShift = 'Morning' | 'Evening';
export type TransportAttendanceStatus = 'Boarded' | 'Dropped' | 'Absent' | 'Walker';

export interface TransportDailyAttendanceRecord {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  shift: TransportAttendanceShift;
  routeId: string;
  studentId: string;
  status: TransportAttendanceStatus;
  boardingStopName?: string;
  markedAt: string;
  markedBy: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface RouteEfficiencyBreakdown {
  proximityScore: number; // 0-100 (weight 45%)
  detourScore: number; // 0-100 (weight 25%)
  capacityScore: number; // 0-100 (weight 25%)
  readinessScore: number; // 0-100 (weight 5%)
}

export interface RouteRecommendationResult {
  routeId: string;
  routeCode: string;
  routeName: string;
  busNumber: string;
  stopId: string;
  stopName: string;
  stopLat?: number;
  stopLng?: number;
  areaMatched: string;
  pickupTime: string;
  dropTime: string;
  monthlyFeeInr: number;
  driverName: string;
  driverPhone: string;
  gpsEnabled: boolean;
  capacity: number;
  assignedCount: number;
  availableSeats: number;
  utilizationPct?: number;
  postAdmissionUtilizationPct?: number;
  capacityStatus?: 'Open' | 'Filling Fast' | 'Near Full' | 'Full';
  efficiencyScore?: number; // 0-100 weighted composite
  distanceToStopKm?: number; // Great-circle distance from home to nearest stop
  corridorDistanceKm?: number; // Minimum distance to route polyline segment
  marginalDetourKm?: number; // Extra bus distance required if detouring via home
  estimatedDetourMinutes?: number; // Extra bus travel time in minutes
  boardingRecommendation?: 'Existing Stop' | 'Proposed Feeder Stop' | 'Full Capacity — Overflow';
  scoreBreakdown?: RouteEfficiencyBreakdown;
  rank?: number;
  confidence:
    | 'Geolocation Optimal'
    | 'Exact Area Match'
    | 'Nearby Corridor'
    | 'Nearest Available';
  reason: string;
}

export interface GeoRouteOptimizationResult {
  bestRoute: RouteRecommendationResult | null;
  rankedCandidates: RouteRecommendationResult[];
  studentLocation: GeoPoint | null;
  distanceToCampusKm: number | null;
  walkableCampusZone: boolean;
  capacityOverflowTriggered: boolean;
  overflowedClosestRouteCode?: string;
  algorithmMode: 'geolocation_and_capacity' | 'hybrid_text_and_capacity';
  summaryExplanation: string;
}

export interface TransportWorkspaceBundle {
  routes: BusRoute[];
  allocations: StudentTransportAllocation[];
  attendanceToday: TransportDailyAttendanceRecord[];
  schoolLocation: { lat: number; lng: number; label: string };
  gpsScope: 'all_buses' | 'assigned_bus_only';
  canManageRoutes: boolean;
  canMarkAttendance: boolean;
  transportHelpline: string;
}

export type AcademicMonthKey = FeeMonthKey;

export type ReadingBand = 'Emergent' | 'Developing' | 'Proficient' | 'Fluent';

export interface MonthlyReadingReport {
  id: string;
  schoolId: string;
  studentId: string;
  month: AcademicMonthKey;
  year: number;
  wpm: number;
  accuracyPct: number;
  comprehensionPct: number;
  overallPct: number;
  readingBand: ReadingBand;
  remarks: string;
  assessedBy: string;
  assessedAt: string;
}

export interface MonthlyNumeracyReport {
  id: string;
  schoolId: string;
  studentId: string;
  month: AcademicMonthKey;
  year: number;
  tablesFluencyPct: number;
  mentalMathPct: number;
  problemSolvingPct: number;
  overallPct: number;
  conceptualGap?: string;
  remarks: string;
  assessedBy: string;
  assessedAt: string;
}

export interface MonthlyAttendanceSummary {
  id: string;
  schoolId: string;
  studentId: string;
  month: AcademicMonthKey;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays?: number;
  attendancePct: number;
}

export interface FamilyAccountMemberSummary {
  studentId?: string;
  feeAccountId?: string;
  admissionNo: string;
  studentName: string;
  classSection: string;
  totalDemandInr: number;
  paidAmountInr: number;
  balanceFeesInr: number;
  isPrimaryBilling: boolean;
}

export interface FamilyAccount {
  id: string;
  schoolId: string;
  siblingGroupId?: string;
  familyCode: string;
  guardianName: string;
  guardianPhone: string;
  normalizedPhone: string;
  parentEmail?: string;
  address?: string;
  memberStudentIds: string[];
  memberAccountIds: string[];
  primaryStudentId?: string;
  primaryAccountId?: string;
  detectionSignals: string[];
  status: SiblingClusterStatus;
  isManualMerge?: boolean;
  manualNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  totalDemandInr: number;
  totalPaidInr: number;
  totalBalanceInr: number;
  collectionRatePct: number;
  monthlyPaidInr: Record<FeeMonthKey, number>;
  members: FamilyAccountMemberSummary[];
  receiptIds: string[];
  lastPaymentDate?: string;
  lastSyncedAt: string;
}

export interface PartialSiblingMemberInfo {
  nodeKey: string;
  studentId?: string;
  feeAccountId?: string;
  admissionNo: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  contactNo: string;
  normalizedPhone: string;
  parentEmail?: string;
  address: string;
  remarks: string;
  existingFamilyId?: string;
  existingFamilyCode?: string;
  existingFamilyStatus?: SiblingClusterStatus;
  totalDemandInr: number;
  paidAmountInr: number;
  balanceFeesInr: number;
}

export interface PartialSiblingCandidate {
  id: string;
  schoolId: string;
  confidencePct: number;
  matchTier: 'High' | 'Medium';
  partialSignals: string[];
  suggestedGuardianName: string;
  suggestedPhone: string;
  suggestedAddress: string;
  suggestedEmail?: string;
  memberKeys: string[];
  members: PartialSiblingMemberInfo[];
  combinedDemandInr: number;
  combinedPaidInr: number;
  combinedBalanceInr: number;
}

export interface DismissedPartialMatch {
  id: string;
  schoolId: string;
  memberKeys: string[];
  summaryLabel: string;
  partialSignals: string[];
  dismissedBy: string;
  dismissedAt: string;
}

export type ClassAssessmentTier =
  | 'class_1_2'
  | 'class_3_5'
  | 'class_6_8'
  | 'class_9_10'
  | 'class_11_12';

export type FluencyBurstStyle =
  | 'Word-by-Word (1 word/go)'
  | 'Two-Word Chunks (2 words/go)'
  | 'Phrase Reader (3+ words/go)'
  | 'Whole-Sentence Fluent';

export interface MispronouncedWordDiagnostic {
  expectedWord: string;
  spokenAs: string;
  difficultyTier: 'core' | 'moderate' | 'challenge';
  phoneticHint: string;
}

export interface ReadingTestSession {
  id: string;
  schoolId: string;
  studentId: string;
  month: AcademicMonthKey;
  year: number;
  passageId: string;
  passageTitle: string;
  classTier: ClassAssessmentTier;
  captureMode: 'microphone' | 'assisted_pacer';
  wordsRead: number;
  totalPassageWords: number;
  elapsedSeconds: number;
  wpm: number;
  pronunciationPct: number;
  accuracyPct: number;
  avgBurstWords: number;
  maxBurstWords: number;
  burstOneWordPct: number;
  burstTwoWordsPct: number;
  burstThreePlusPct: number;
  burstWholeSentencePct: number;
  dominantFluencyStyle: FluencyBurstStyle;
  comprehensionPct: number;
  translationPct: number;
  overallPct: number;
  readingBand: ReadingBand;
  mispronouncedWords: MispronouncedWordDiagnostic[];
  translationPrompt: string;
  studentTranslation: string;
  assessedBy: string;
  assessedAt: string;
}

export interface NumeracyTableBreakdownItem {
  tableBase: number;
  attempted: number;
  correct: number;
  accuracyPct: number;
  avgResponseMs: number;
}

export interface NumeracyTestSession {
  id: string;
  schoolId: string;
  studentId: string;
  month: AcademicMonthKey;
  year: number;
  classTier: ClassAssessmentTier;
  tableRangeLabel: string;
  questionMode: 'standard' | 'mixed_missing_factor';
  timeLimitSeconds: number;
  elapsedSeconds: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  accuracyPct: number;
  avgResponseMs: number;
  questionsPerMinute: number;
  speedScorePct: number;
  tablesFluencyPct: number;
  weakTables: number[];
  tableBreakdown: NumeracyTableBreakdownItem[];
  timedOut: boolean;
  conceptualGap?: string;
  assessedBy: string;
  assessedAt: string;
}

export interface ParentAttendanceNotification {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  guardianPhone: string;
  date: string;
  attendanceStatus: 'Present' | 'Absent' | 'Leave';
  title: string;
  messageEn: string;
  messageHi: string;
  contextNote?: string;
  sentBy: string;
  sentByRole: string;
  sentAt: string;
  deliveryChannel: 'In-App Parent Portal';
  readByParent: boolean;
  readAt?: string;
  acknowledgedByParent: boolean;
  acknowledgedAt?: string;
}

export interface NotebookIncompleteNotification {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  guardianPhone: string;
  notebookEntryId: string;
  alertType?:
    | 'incomplete_notebook'
    | 'unchecked_notebook'
    | 'prior_chapter_backlog'
    | 'pending_homework_check';
  subject: string;
  chapter: string;
  chapterNo: string;
  chapterName: string;
  currentClassChapter?: string;
  chapterGap?: number;
  date: string;
  notebookStatus: 'Incomplete' | 'Not Checked';
  workQuality?: WorkQualityRating;
  handwriting?: HandwritingRating;
  teacherRemarks?: string;
  title: string;
  messageEn: string;
  messageHi: string;
  studentMessage: string;
  recipients: Array<'student' | 'parent'>;
  deliveryChannel: 'In-App Student & Parent Portal';
  triggeredBy: string;
  triggeredByRole: string;
  triggeredAt: string;
  status: 'Active' | 'Resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  readByStudent: boolean;
  readByStudentAt?: string;
  acknowledgedByStudent: boolean;
  acknowledgedByStudentAt?: string;
  readByParent: boolean;
  readByParentAt?: string;
  acknowledgedByParent: boolean;
  acknowledgedByParentAt?: string;
}

export type GrowthLeaderboardDomain = 'combined' | 'reading' | 'numeracy';

export type GrowthTierLabel =
  | 'Accelerated Climber'
  | 'Steady Riser'
  | 'Consistent Achiever'
  | 'Building Momentum';

export interface GrowthLeaderboardEntry {
  studentId: string;
  aliasLabel: string;
  displayName: string;
  realStudentName?: string;
  classSection: string;
  isCurrentUser: boolean;
  hasGrowthBaseline: boolean;
  monthsTracked: number;
  combinedRank: number | null;
  readingRank: number | null;
  numeracyRank: number | null;
  // Unified fluency & accuracy (%)
  fluencyStartPct: number | null;
  fluencyLatestPct: number | null;
  fluencyGrowthPts: number | null;
  accuracyStartPct: number | null;
  accuracyLatestPct: number | null;
  accuracyGrowthPts: number | null;
  combinedGrowthScore: number | null;
  // Reading-specific fluency (WPM + normalized) & accuracy
  readingWpmStart: number | null;
  readingWpmLatest: number | null;
  readingWpmGain: number | null;
  readingAccuracyStartPct: number | null;
  readingAccuracyLatestPct: number | null;
  readingAccuracyGrowthPts: number | null;
  readingGrowthScore: number | null;
  // Numeracy-specific tables fluency & accuracy
  tablesFluencyStartPct: number | null;
  tablesFluencyLatestPct: number | null;
  tablesFluencyGrowthPts: number | null;
  numeracyAccuracyStartPct: number | null;
  numeracyAccuracyLatestPct: number | null;
  numeracyAccuracyGrowthPts: number | null;
  numeracyGrowthScore: number | null;
  // Deltas vs class average
  vsClassFluencyDelta: number | null;
  vsClassAccuracyDelta: number | null;
  vsClassFluencyGrowthDelta: number | null;
  vsClassAccuracyGrowthDelta: number | null;
  growthTier: GrowthTierLabel;
}

export interface ClassGrowthBenchmarks {
  classSection: string;
  totalStudents: number;
  rankedStudents: number;
  classAvgFluencyPct: number | null;
  classAvgAccuracyPct: number | null;
  classAvgFluencyGrowthPts: number | null;
  classAvgAccuracyGrowthPts: number | null;
  classAvgCombinedGrowthScore: number | null;
  classAvgReadingWpm: number | null;
  classAvgReadingWpmGain: number | null;
  classAvgReadingAccuracyPct: number | null;
  classAvgReadingAccuracyGrowthPts: number | null;
  classAvgTablesFluencyPct: number | null;
  classAvgTablesFluencyGrowthPts: number | null;
  classAvgNumeracyAccuracyPct: number | null;
  classAvgNumeracyAccuracyGrowthPts: number | null;
  topQuartileGrowthCutoff: number | null;
}

export interface ClassGrowthLeaderboard {
  classSection: string;
  benchmarks: ClassGrowthBenchmarks;
  entries: GrowthLeaderboardEntry[];
}

export interface SchoolGrowthLeaderboards {
  schoolCode: string;
  classLeaderboards: Record<string, ClassGrowthLeaderboard>;
  classSections: string[];
}

export type PersonalBestAttemptSource = 'live_test' | 'monthly_report';

export interface PersonalBestReadingAttempt {
  id: string;
  source: PersonalBestAttemptSource;
  title: string;
  date: string;
  month: AcademicMonthKey;
  wpm: number;
  accuracyPct: number;
  pronunciationPct: number | null;
  comprehensionPct: number | null;
  overallPct: number;
  fluencyStyle?: FluencyBurstStyle;
  isWpmRecord: boolean;
  isAccuracyRecord: boolean;
}

export interface PersonalBestSummary {
  studentId: string;
  classTargetWpm: number;
  totalAttempts: number;
  liveTestCount: number;
  bestWpm: number | null;
  bestWpmDate: string | null;
  bestWpmLabel: string | null;
  bestWpmSource: PersonalBestAttemptSource | null;
  bestAccuracyPct: number | null;
  bestAccuracyDate: string | null;
  bestAccuracyLabel: string | null;
  bestAccuracySource: PersonalBestAttemptSource | null;
  latestWpm: number | null;
  latestAccuracyPct: number | null;
  wpmGapToBest: number | null;
  accuracyGapToBest: number | null;
  latestSetNewWpmBest: boolean;
  latestSetNewAccuracyBest: boolean;
  streakImprovingCount: number;
  nextMilestoneWpm: number | null;
  encouragementMessage: string;
  recentAttempts: PersonalBestReadingAttempt[];
}

export type EriksonStageNumber = 3 | 4 | 5;

export type EriksonPolarity = 'Positive' | 'Transitional' | 'Negative' | 'Pending';

export type EriksonOutcomeStatus =
  | 'positive_aligned'
  | 'transitional_support'
  | 'negative_stage_alert'
  | 'insufficient_evidence';

export interface EriksonStageDescriptor {
  stageNumber: EriksonStageNumber;
  stageTitle: string;
  positivePole: string;
  negativePole: string;
  virtue: string;
  ageRangeLabel: string;
  classBandLabel: string;
  coreDevelopmentalTask: string;
}

export interface EriksonSignalItem {
  id: string;
  domain:
    | 'OLQ & Agency'
    | 'Reading & Fluency'
    | 'Academic & Numeracy'
    | 'Habits & Persistence'
    | 'Social & Co-Curricular';
  label: string;
  scorePct: number | null;
  polarity: 'positive' | 'mixed' | 'negative';
  evidenceSummary: string;
}

export interface EriksonRemedialAction {
  id: string;
  track: 'Classroom Mentoring' | 'In-App Skill Practice' | 'Home & Parent Support';
  title: string;
  description: string;
  targetOutcome: string;
  actionType: 'reading_test' | 'numeracy_test' | 'intelligence_game' | 'none';
  actionLabel?: string;
  recommendedGameTitle?: string;
}

export interface EriksonAssessment {
  studentId: string;
  studentName: string;
  classSection: string;
  estimatedAgeRange: string;
  expectedStage: EriksonStageDescriptor;
  presentStageHeadline: string;
  presentStageDetail: string;
  presentPolarity: EriksonPolarity;
  outcomeStatus: EriksonOutcomeStatus;
  readinessScorePct: number | null;
  signalCoverageCount: number;
  domainScores: {
    competencePct: number | null;
    agencyPct: number | null;
    belongingPct: number | null;
    regulationPct: number | null;
  };
  positiveSignals: EriksonSignalItem[];
  negativeSignals: EriksonSignalItem[];
  remedials: EriksonRemedialAction[];
  pathBackToPositiveChecklist: string[];
  recommendedOlqKeys: OlqKey[];
  transitionGoalStatement: string;
}

export type DevelopmentalRemedialStatus = 'Assigned' | 'In Progress' | 'Completed';

export type DevelopmentalRemedialCategory =
  | 'Classroom Activity'
  | 'Behavioral Intervention'
  | 'Skill Practice'
  | 'Parent & Home Coordination';

export interface AiEriksonInterventionItem {
  id: string;
  title: string;
  category: DevelopmentalRemedialCategory;
  durationLabel: string;
  eriksonTarget: string;
  description: string;
  steps: string[];
  expectedBehavioralOutcome: string;
  targetOlqs: OlqKey[];
}

export interface AiEriksonRemedialPlan {
  studentId: string;
  studentName: string;
  classSection: string;
  expectedStageTitle: string;
  presentStageHeadline: string;
  stageContextSummary: string;
  generatedAt: string;
  model: string;
  interventions: AiEriksonInterventionItem[];
}

export interface DevelopmentalRemedialAssignment {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  stageNumber: EriksonStageNumber;
  expectedStageTitle: string;
  negativePole: string;
  positivePole: string;
  title: string;
  category: DevelopmentalRemedialCategory;
  description: string;
  steps: string[];
  expectedOutcome: string;
  durationLabel: string;
  dueDate: string;
  status: DevelopmentalRemedialStatus;
  source: 'ai_gemini' | 'erikson_engine' | 'teacher_custom';
  targetOlqs: OlqKey[];
  assignedBy: string;
  assignedByRole: string;
  assignedAt: string;
  completedAt?: string;
  completionNote?: string;
}

// ============================================================================
// PART 1: ATTENDANCE HEATMAP EARLY SUPPORT & FOLLOW-UP RECORDS
// ============================================================================

export type AttendanceSupportPatternType =
  | 'sudden_decline'
  | 'consecutive_absences'
  | 'monday_friday_pattern'
  | 'irregular_attendance'
  | 'threshold_watch';

export type AttendanceSupportStatus =
  | 'Open Alert'
  | 'Teacher Observing'
  | 'Referred to Counsellor'
  | 'Parent Contacted'
  | 'Follow-Up Scheduled'
  | 'Resolved';

export interface AttendanceSupportHistoryItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actionType:
    | 'alert_opened'
    | 'teacher_observation'
    | 'counsellor_referral'
    | 'parent_communication'
    | 'follow_up_action'
    | 'status_updated';
  note: string;
}

export interface AttendanceSupportRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  patternTypes: AttendanceSupportPatternType[];
  indicatorSummary: string;
  status: AttendanceSupportStatus;
  referredToCounsellor: boolean;
  parentCommunicationNote?: string;
  followUpAction?: string;
  nextCheckInDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: AttendanceSupportHistoryItem[];
}

// ============================================================================
// PART 2: ACADEMIC RESOURCES — MIND MAPS LIBRARY & HUMAN APPROVAL WORKFLOW
// ============================================================================

export type MindMapResourceType =
  | 'mind_map'
  | 'chapter_summary'
  | 'diagram'
  | 'concept_map'
  | 'supplementary';

export type MindMapApprovalStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected';

export interface MindMapStructureBranch {
  id: string;
  title: string;
  subtopics: string[];
  relationLabel?: string;
}

export interface MindMapStructure {
  centralConcept: string;
  branches: MindMapStructureBranch[];
  definitions: Array<{ term: string; meaning: string }>;
  flowchartSteps: string[];
  revisionSummary: string[];
}

export interface MindMapVersionEntry {
  version: number;
  updatedAt: string;
  updatedBy: string;
  status: MindMapApprovalStatus;
  changeNote: string;
}

export interface MindMapResourceItem {
  id: string;
  schoolId: string;
  academicSession: string;
  classSection: string;
  subject: string;
  chapter: string;
  topic: string;
  language: 'English' | 'Hindi' | 'Bilingual';
  teacherId: string;
  teacherName: string;
  resourceType: MindMapResourceType;
  title: string;
  description: string;
  fileName?: string;
  fileFormat: 'PDF' | 'PNG' | 'JPG' | 'JPEG' | 'PPTX' | 'DOCX' | 'INTERACTIVE';
  fileDataUrl?: string;
  keywords: string[];
  learningObjectives: string[];
  aiAssisted: boolean;
  aiDraftApprovedByTeacher: boolean;
  structure?: MindMapStructure;
  status: MindMapApprovalStatus;
  reviewNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  versionHistory: MindMapVersionEntry[];
  bookmarkedByUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PART 7: ACCOUNTANT ROLE & FINANCE 360° ACCOUNTING ENTITIES
// ============================================================================

export type AccountingEntryCategory =
  | 'Fee Collection'
  | 'Teacher Payroll'
  | 'Driver Payroll'
  | 'Bus Fuel Expense'
  | 'Bus EMI / Kist'
  | 'Maintenance Expense'
  | 'Vendor Purchase'
  | 'Utility & Operations'
  | 'School Rent'
  | 'Insurance & Compliance'
  | 'Software & IT'
  | 'Infrastructure & Assets'
  | 'Bank Transfer & Advances'
  | 'Misc Receipt';

export type ExpenseClassification = 'Operational' | 'Administrative' | 'Developmental';

export type AccountingEntryDirection = 'Income' | 'Expense';

export type AccountingApprovalStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected';

export interface AccountingEntry {
  id: string;
  schoolId: string;
  date: string;
  monthKey: string; // e.g., '2026-11'
  category: AccountingEntryCategory;
  direction: AccountingEntryDirection;
  vendorOrParty: string;
  busCode?: string;
  description: string;
  amountInr: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  chequeOrRefNo?: string;
  supportingDocName?: string;
  extractedByAi?: boolean;
  expenseClassification?: ExpenseClassification;
  expenseClassificationReason?: string;
  expenseClassifiedBy?: 'gemini' | 'manual';
  expenseClassifiedAt?: string;
  sheetSource?: 'vis_expense_2026_27' | 'csv_import' | 'manual';
  status: AccountingApprovalStatus;
  periodLocked: boolean;
  createdBy: string;
  createdByRole: UserRole;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface PayrollRegisterEntry {
  id: string;
  schoolId: string;
  monthLabel: string; // e.g., 'November 2026'
  staffName: string;
  staffRoleType: 'Teacher' | 'Driver' | 'Support Staff';
  designation: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  daysWorked: number;
  grossSalaryInr: number;
  deductionsInr: number;
  netPayableInr: number;
  status: AccountingApprovalStatus;
  preparedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BankReconciliationItem {
  id: string;
  schoolId: string;
  txnDate: string;
  bankRef: string;
  narration: string;
  direction: 'Credit' | 'Debit';
  amountInr: number;
  matchStatus: 'Matched' | 'Unmatched';
  matchedEntryId?: string;
  reconciledBy?: string;
  reconciledAt?: string;
}

export interface AccountingTaskItem {
  id: string;
  schoolId: string;
  title: string;
  category: string;
  dueDate: string;
  assignedBy: string;
  assignedTo: string;
  status: 'Open' | 'In Progress' | 'Completed';
  notes?: string;
  updatedAt: string;
}

export interface ChapterMasteryAttempt {
  id: string;
  schoolId: string;
  userId: string;
  studentId?: string;
  studentName: string;
  classSection: string;
  classNumber: number;
  subject: string;
  chapterId: string;
  chapterTitle: string;
  xpEarned: number;
  masteryPct: number;
  accuracyPct: number;
  stars: 1 | 2 | 3;
  bestStreak: number;
  timedMode: boolean;
  timeUsedSec: number;
  timeLimitSec: number;
  mistakesCount: number;
  mistakesRecovered: number;
  badgesEarned: string[];
  completedAt: string;
}

export interface ChapterMasteryLeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  classSection: string;
  totalXp: number;
  chaptersMastered: number;
  averageMasteryPct: number;
  timedQuizAvgPct: number;
  bestStreak: number;
  badgeCount: number;
  earnedBadgeIds: string[];
  lastPlayedIso: string;
  isCurrentUser?: boolean;
}

export type SchoolEventCategory =
  | 'Academic'
  | 'Science & Innovation'
  | 'Sports'
  | 'Cultural'
  | 'Parent-School'
  | 'Competition';

export type SchoolEventStatus =
  | 'Scheduled'
  | 'In Preparation'
  | 'Ready'
  | 'Completed';

export interface SchoolEventAssignedTeacher {
  teacherUserId?: string;
  teacherName: string;
  responsibility: string;
}

export interface SchoolEventMilestone {
  id: string;
  title: string;
  dueDate: string;
  ownerName: string;
  completed: boolean;
  completedAt?: string;
}

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  category: SchoolEventCategory;
  eventDate: string; // YYYY-MM-DD
  timeSlot: string;
  venue: string;
  targetClasses: string[]; // e.g. ['All Classes'] or ['Class 6', 'Class 7']
  description: string;
  dedicatedCoordinatorId?: string;
  dedicatedCoordinatorName: string;
  assignedTeachers: SchoolEventAssignedTeacher[];
  registrationDeadline: string; // YYYY-MM-DD
  maxParticipants: number;
  status: SchoolEventStatus;
  readinessPct: number; // 0-100
  progressSummary: string;
  milestones: SchoolEventMilestone[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type EventParticipationStatus = 'Requested' | 'Approved' | 'Waitlisted' | 'Declined';

export interface EventParticipationRequest {
  id: string;
  schoolId: string;
  eventId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  requestedByUserId: string;
  requestedByName: string;
  requestedByRole: UserRole;
  parentNote: string;
  status: EventParticipationStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export type EventTeacherIssueType = 'Input / Suggestion' | 'Resource Need' | 'Issue / Blocker';
export type EventTeacherIssueSeverity = 'Normal' | 'Urgent';
export type EventTeacherIssueStatus = 'Open' | 'In Review' | 'Resolved';

export interface EventTeacherIssue {
  id: string;
  schoolId: string;
  eventId: string;
  teacherUserId: string;
  teacherName: string;
  entryType: EventTeacherIssueType;
  severity: EventTeacherIssueSeverity;
  title: string;
  detail: string;
  status: EventTeacherIssueStatus;
  assignedCoordinatorName: string;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type YearlySkillDomain =
  | 'Reading Fluency'
  | 'Numeracy & Maths'
  | 'Science Mastery'
  | 'Writing & Expression'
  | 'OLQ & Habits'
  | 'Digital & Thinking';

export type YearlyTargetRiskStatus = 'On Track' | 'Needs Catch-Up' | 'At Risk';

export interface StudentYearlySkillTarget {
  id: string;
  domain: YearlySkillDomain;
  skillName: string;
  baselineScore: number;
  currentScore: number;
  targetScore: number;
  unitLabel: string; // '%', 'WPM', '/100'
  minAttendanceRequiredPct: number; // e.g. 85
  weeklyPracticePlan: string;
  quarterlyMilestones: {
    q1: { label: string; completed: boolean };
    q2: { label: string; completed: boolean };
    q3: { label: string; completed: boolean };
    q4: { label: string; completed: boolean };
  };
  riskStatus: YearlyTargetRiskStatus;
  riskReason?: string;
}

export interface StudentYearlyPlan {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  academicSession: string;
  overallTargetSummary: string;
  attendanceThresholdPct: number;
  weeklyHomeCommitment: string;
  targets: StudentYearlySkillTarget[];
  overallRiskLevel: 'On Track' | 'Watch' | 'At Risk' | 'Critical Risk';
  projectedAttainmentDropPct: number;
  updatedBy: string;
  updatedAt: string;
}

export interface AbsenceTargetRiskAlert {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  guardianPhone: string;
  absenceDate: string;
  attendancePct: number;
  consecutiveAbsences: number;
  absencesLast30Days: number;
  riskLevel: 'Watch' | 'At Risk' | 'Critical Risk';
  impactedTargets: Array<{
    targetId: string;
    domain: YearlySkillDomain;
    skillName: string;
    currentScore: number;
    targetScore: number;
    unitLabel: string;
  }>;
  parentMessage: string;
  managementMessage: string;
  catchUpAction: string;
  recipients: Array<'parent' | 'management'>;
  status: 'Active' | 'Acknowledged';
  acknowledgedByParent: boolean;
  acknowledgedByParentAt?: string;
  acknowledgedByManagement: boolean;
  acknowledgedByManagementAt?: string;
  acknowledgedByManagementName?: string;
  triggeredBy: string;
  triggeredAt: string;
}

export type StaffRoleCategory =
  | 'Teacher'
  | 'Admin & Coordinator'
  | 'Driver'
  | 'Support Staff'
  | 'Specialist';

export type StaffAttendanceStatus =
  | 'Present'
  | 'Half Day'
  | 'Absent'
  | 'Paid Leave'
  | 'Unpaid Leave';

export interface StaffProfile {
  id: string;
  schoolId: string;
  userId?: string;
  srNo?: number;
  employeeCode: string;
  name: string;
  roleType: StaffRoleCategory;
  designation: string;
  department: string;
  phone?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  bankNote?: string;
  sheetSource?: 'vis_salary_2026_27' | 'csv_import' | 'manual';
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  pfOrDeductionInr: number;
  workingDaysPerMonth: number;
  paidLeaveAllowance: number;
  active: boolean;
}

export interface StaffAttendanceRecord {
  id: string;
  schoolId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: StaffAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  markingMode: AttendanceMarkingMode;
  markedBy: string;
  remarks?: string;
  updatedAt: string;
}

export interface StaffSalaryComputation {
  staffId: string;
  employeeCode: string;
  staffName: string;
  designation: string;
  department: string;
  roleType: StaffRoleCategory;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  bankNote?: string;
  monthKey: string; // YYYY-MM
  monthLabel: string; // e.g., November 2026
  workingDaysPerMonth: number;
  presentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  markedDays: number;
  effectivePaidDays: number;
  lossOfPayDays: number;
  attendancePct: number;
  perDayRateInr: number;
  baseMonthlySalaryInr: number;
  fixedAllowanceInr: number;
  grossSalaryInr: number;
  standardDeductionsInr: number;
  lopDeductionInr: number;
  totalDeductionsInr: number;
  netPayableInr: number;
  payrollStatus: 'Synced to Payroll' | 'Pending Sync';
  lastSyncedAt?: string;
}

export type SalaryAuditActionType =
  | 'PROFILE_CREATED'
  | 'SALARY_UPDATED'
  | 'CSV_SHEET_IMPORT'
  | 'BULK_PAYROLL_UPDATE';

export interface SalaryModificationAuditRecord {
  id: string;
  schoolId: string;
  timestamp: string; // ISO-8601 timestamp
  staffId?: string;
  employeeCode?: string;
  staffName: string;
  designation: string;
  actionType: SalaryAuditActionType;
  adminUserId: string;
  adminUserName: string;
  adminUserRole: UserRole;
  previousBaseSalaryInr: number | null;
  newBaseSalaryInr: number;
  previousAllowanceInr: number | null;
  newAllowanceInr: number;
  previousDeductionInr: number | null;
  newDeductionInr: number;
  previousGrossSalaryInr: number | null;
  newGrossSalaryInr: number;
  deltaGrossInr: number;
  sourceLabel: string;
  note?: string;
}

export type GatePassSubjectType = 'Student Early Exit' | 'Staff Out-Pass';
export type GatePassStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Exited Campus'
  | 'Returned'
  | 'Rejected';

export interface GatePassRecord {
  id: string;
  schoolId: string;
  passCode: string; // e.g., GP-2026-1042
  subjectType: GatePassSubjectType;
  studentId?: string;
  studentName?: string;
  classSection?: string;
  staffId?: string;
  staffUserId?: string;
  staffName?: string;
  staffDesignation?: string;
  requestedByUserId?: string;
  requestedByName: string;
  requestedByRole: UserRole;
  reason: string;
  authorizedPickupName?: string;
  pickupRelation?: string;
  pickupPhone?: string;
  pickupIdMasked?: string;
  expectedExitTime: string;
  expectedReturnTime?: string;
  actualExitAt?: string;
  actualReturnAt?: string;
  status: GatePassStatus;
  approvedByName?: string;
  approvedAt?: string;
  gateOfficerNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type VisitorCategory =
  | 'Parent / Guardian'
  | 'Official / Inspector'
  | 'Vendor / Delivery'
  | 'Interview / Guest'
  | 'Alumni'
  | 'Maintenance';

export type VisitorIdProofType =
  | 'Aadhaar Card'
  | 'Driving License'
  | 'PAN Card'
  | 'Voter ID'
  | 'Official / Company ID';

export type VisitorStatus = 'On Campus' | 'Checked Out';

export interface VisitorLogRecord {
  id: string;
  schoolId: string;
  badgeCode: string; // e.g., VIS-8412
  visitorName: string;
  phone: string;
  category: VisitorCategory;
  purpose: string;
  personToMeet: string;
  department?: string;
  idProofType: VisitorIdProofType;
  idProofMasked: string;
  vehicleNumber?: string;
  belongingsNote?: string;
  checkInAt: string;
  checkOutAt?: string;
  durationMinutes?: number;
  status: VisitorStatus;
  loggedByName: string;
  checkedOutByName?: string;
}

export * from './types/intelligence';
export * from './types/psychometric';





