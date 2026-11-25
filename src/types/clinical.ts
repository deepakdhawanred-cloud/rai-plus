import type { UserRole } from '../types';

export type ClinicalDomain =
  | 'autism_spectrum_indicators'
  | 'adhd_indicators'
  | 'speech_language_delays'
  | 'intellectual_developmental_functioning'
  | 'down_syndrome_referral'
  | 'specific_learning_difficulties'
  | 'social_communication_difficulties'
  | 'behavioural_emotional_concerns'
  | 'adaptive_functioning'
  | 'motor_sensory_development'
  | 'hearing_communication_concerns'
  | 'other_developmental_concerns';

export type ScreeningWorkflowStatus =
  | 'No immediate concern identified'
  | 'Monitor development'
  | 'Further screening recommended'
  | 'Professional assessment recommended'
  | 'Urgent clinical referral recommended';

export type QuestionnaireResponseOption =
  | 'Yes'
  | 'No'
  | 'Sometimes'
  | 'Not sure'
  | 'Not observed';

export interface ClinicalConsentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  guardianName: string;
  guardianRelation: string;
  screeningConsent: boolean;
  assessmentConsent: boolean;
  therapyConsent: boolean;
  audioRecordingConsent: boolean;
  reportSharingWithTeachers: boolean;
  childAssentRecorded: boolean;
  childAssentMethod?: string;
  retentionPolicyMonths: number;
  consentDate: string;
  updatedBy: string;
  notes?: string;
}

export interface MilestoneEntry {
  key: string;
  label: string;
  ageAchievedMonths?: number | null;
  status: 'Achieved' | 'Emerging' | 'Not yet achieved' | 'Unknown / Not recalled';
  notes?: string;
}

export interface DevelopmentalHistoryRecord {
  id: string;
  schoolId: string;
  studentId: string;
  submittedByName: string;
  submittedByRole: UserRole;
  submittedAt: string;
  pregnancyAndBirthHistory: string;
  birthComplications: string;
  milestones: MilestoneEntry[];
  hearingHistory: string;
  medicalHistory: string;
  familyDevelopmentalHistory: string;
  previousAssessments: string;
  previousTherapies: string;
  regressionOrSkillLoss: boolean;
  regressionDetails?: string;
  seizuresOrMedicalRedFlags: boolean;
  medicalRedFlagDetails?: string;
  homeLanguage: string;
  languagesSpokenByChild: string[];
  socialInteractionSummary: string;
  playBehaviourSummary: string;
  dailyLivingSkillsSummary: string;
}

export interface ParentQuestionnaireItem {
  id: string;
  domain:
    | 'Communication'
    | 'Social Interaction'
    | 'Eye Gaze & Joint Attention'
    | 'Play'
    | 'Attention'
    | 'Activity Levels'
    | 'Impulsivity'
    | 'Memory'
    | 'Understanding Instructions'
    | 'Emotional Regulation'
    | 'Daily Living'
    | 'Sensory Responses'
    | 'Speech Intelligibility';
  question: string;
  response: QuestionnaireResponseOption;
  explanation?: string;
}

export interface ParentQuestionnaireRecord {
  id: string;
  schoolId: string;
  studentId: string;
  ageBand: '3-5 yrs' | '6-9 yrs' | '10-13 yrs' | '14-18 yrs';
  completedBy: string;
  completedAt: string;
  homeLanguageContext: string;
  items: ParentQuestionnaireItem[];
  parentTopStrengths: string;
  parentPrimaryQuestions: string;
}

export interface TeacherObservationRecord {
  id: string;
  schoolId: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  classSection: string;
  observedDate: string;
  classroomCommunication: string;
  followingInstructions: string;
  attentionDuringLessons: string;
  peerInteraction: string;
  participation: string;
  turnTaking: string;
  behaviouralObservations: string;
  speechIntelligibility: 'Clear to all' | 'Mostly clear' | 'Clear to familiar listeners' | 'Difficult to understand in class';
  readingWritingConcerns: string;
  learningProgress: string;
  classroomIndependence: string;
  socialParticipation: string;
  observableStrengths: string;
}

export interface DevelopmentalScreeningCase {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  initiatedBy: string;
  initiatedByRole: UserRole;
  initiatedAt: string;
  updatedAt: string;
  domains: ClinicalDomain[];
  workflowStatus: ScreeningWorkflowStatus;
  completionStatus: 'Intake Open' | 'Questionnaires Pending' | 'Under Specialist Review' | 'Completed';
  areasOfStrength: string[];
  areasRequiringFurtherAssessment: string[];
  recommendedSpecialistReferral: string;
  referralSpecialistType?:
    | 'Developmental Paediatrician'
    | 'Clinical Psychologist'
    | 'Child Psychiatrist'
    | 'Speech-Language Pathologist'
    | 'Audiologist'
    | 'Occupational Therapist'
    | 'Medical Geneticist'
    | 'Special Educator'
    | 'None Required';
  urgentMedicalFlag: boolean;
  urgentMedicalReason?: string;
  multilingualContextNote?: string;
  confidentialNotes?: string;
  authorizedClassroomSummary?: string;
}

export type ConditionPathwayType =
  | 'autism_spectrum'
  | 'adhd'
  | 'speech_language'
  | 'down_syndrome_referral'
  | 'other_developmental';

export interface ConditionAssessmentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  pathway: ConditionPathwayType;
  subCategory?: string; // e.g., Specific Learning Disorder, Developmental Language Disorder, CAS, Sensory, Anxiety
  assessorId: string;
  assessorName: string;
  assessorRole: UserRole;
  assessorCredentials: string;
  assessmentDate: string;
  status: 'In Progress' | 'Awaiting Cross-Setting Input' | 'Completed' | 'Referred to External Specialist';
  licensedInstrumentsUsed: string[]; // References licensed tools used by qualified clinician (never copied copyrighted items)
  structuredFindings: Record<string, string>;
  crossSettingNotes?: {
    homeFunctioning?: string;
    classroomFunctioning?: string;
    peerRelationships?: string;
    sleepAndContributingFactors?: string;
    durationAndOnset?: string;
    alternativeExplanationsReviewed?: string;
  };
  multilingualProfile?: {
    primaryHomeLanguage: string;
    languagesAssessed: string[];
    accentOrSecondLanguageNote: string;
  };
  medicalReferralData?: {
    existingMedicalDiagnosisDocumented: boolean;
    existingMedicalDiagnosisDetails?: string;
    hearingAssessmentStatus?: string;
    visionAssessmentStatus?: string;
    cardiacAssessmentStatus?: string;
    geneticTestingStatus?: string;
    existingTherapyRecords?: string;
    specialistReportsSummary?: string;
  };
  professionalObservation: string;
  functionalImpactSummary: string;
  referralRecommendation: string;
  confidentialClinicalNotes?: string;
  authorizedClassroomGuidance?: string;
}

export type SpeechSoundPosition =
  | 'initial'
  | 'medial'
  | 'final'
  | 'syllables'
  | 'single_words'
  | 'phrases'
  | 'sentences'
  | 'reading_aloud'
  | 'spontaneous_conversation';

export type ArticulationStageNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SpeechSoundTarget {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  targetSound: string; // e.g., '/r/', '/s/', '/l/', 'र (Hindi retroflex/tap)', 'श (Hindi)'
  soundGroup: string;
  language: 'English' | 'Hindi' | 'Bilingual (English + Hindi)' | 'Regional / Multilingual';
  errorType: 'Substitution' | 'Omission' | 'Distortion' | 'Addition' | 'Phonological Process';
  substitutionDetail?: string; // e.g., '/w/ for /r/'
  affectedPositions: SpeechSoundPosition[];
  positionAccuracy: Partial<Record<SpeechSoundPosition, number>>; // SLP-recorded 0-100
  accuracyWordLevelPct: number | null;
  accuracyConversationPct: number | null;
  stimulability: 'Stimulable with cue' | 'Partially stimulable' | 'Not yet stimulable' | 'To be assessed';
  functionalImpact: string;
  treatmentPriority: 'High' | 'Medium' | 'Maintenance' | 'Monitor';
  currentStage: ArticulationStageNumber;
  slpApproved: boolean;
  slpName: string;
  slpRegistrationNo?: string;
  accentDifferenceRuledOut: boolean;
  updatedAt: string;
}

export interface SpeechExerciseItem {
  id: string;
  schoolId: string;
  studentId: string;
  targetId: string;
  title: string;
  targetSound: string;
  targetLanguage: string;
  stage: ArticulationStageNumber;
  stageLabel: string;
  learningObjective: string;
  therapistInstructions: string;
  studentInstructions: string;
  requiredMaterials: string[];
  practiceItems: string[];
  difficultyLevel: 'Foundational' | 'Guided' | 'Intermediate' | 'Generalisation';
  suggestedDurationMin: number;
  targetAttempts: number;
  reviewStatus: 'Pending SLP Review' | 'Approved by SLP' | 'Archived';
  approvedBy?: string;
  approvedAt?: string;
  assignedToHomePractice: boolean;
  therapistFeedback?: string;
}

export type FluencyApproachType =
  | 'Parent-Child Interaction Approach'
  | 'Preschool Stuttering Intervention'
  | 'Stuttering Modification Approach'
  | 'Fluency Shaping Approach'
  | 'Communication Participation & Confidence'
  | 'Cognitive & Emotional Communication Support'
  | 'Family Counselling & Classroom Support';

export interface FluencyProfileRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  slpName: string;
  slpRegistrationNo?: string;
  assessedDate: string;
  ageOfOnsetYears?: number;
  durationMonths?: number;
  familyHistory: string;
  observedPatterns: {
    soundRepetitions: 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';
    syllableRepetitions: 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';
    wordRepetitions: 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';
    prolongations: 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';
    blocks: 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';
    physicalTension: string;
    secondaryBehaviours: string;
    speakingAvoidance: string;
  };
  sampleContextsCollected: Array<
    | 'Conversation'
    | 'Storytelling'
    | 'Reading'
    | 'Classroom Communication'
    | 'Parent-Child Interaction'
    | 'Other'
  >;
  situationsIncreasingStammering: string;
  situationsDecreasingStammering: string;
  studentFeelingsAndExperience: string;
  communicationConfidenceRating: 1 | 2 | 3 | 4 | 5;
  communicationParticipationRating: 1 | 2 | 3 | 4 | 5;
  functionalImpactSummary: string;
  previousIntervention: string;
  selectedApproaches: FluencyApproachType[];
  approvedPracticeActivities: Array<{
    id: string;
    title: string;
    category: string;
    description: string;
    homeFriendly: boolean;
  }>;
  classroomSupportGuidance: string;
  familyGuidance: string;
  slpApproved: boolean;
  updatedAt: string;
}

export interface TherapyGoalItem {
  id: string;
  domain: string;
  goalStatement: string;
  baselineNote: string;
  progressIndicator: string;
  status: 'Active' | 'Progressing' | 'Achieved' | 'Under Review';
}

export interface PersonalizedTherapyPlan {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  planType: 'Speech & Articulation' | 'Fluency & Communication' | 'Multidisciplinary Developmental Support' | 'Special Education Support';
  assessmentSummary: string;
  confirmedClinicalDiagnosis?: string; // Strictly entered by qualified clinician only; never AI-generated
  diagnosisEnteredBy?: string;
  diagnosisCredentials?: string;
  functionalDifficulties: string[];
  therapyGoals: TherapyGoalItem[];
  selectedIntervention: string;
  recommendedExerciseIds: string[];
  sessionsPerWeek: number;
  sessionDurationMin: number;
  dailyHomePracticeMin: number;
  therapyCycleLabel: string; // e.g., "8-week review cycle (SLP editable)"
  reviewFrequencyLabel: string;
  reassessmentDate: string;
  homePracticeRecommendations: string;
  parentGuidance: string;
  teacherClassroomGuidance: string; // Authorized non-confidential guidance visible to assigned teachers
  progressIndicators: string[];
  approvalStatus: 'Draft — Pending Professional Approval' | 'Approved & Active' | 'Review Due' | 'Completed';
  approvedByName?: string;
  approvedByRole?: UserRole;
  approvedByRegistrationNo?: string;
  approvedAt?: string;
  createdBy: string;
  updatedAt: string;
}

export interface DailyTherapySessionLog {
  id: string;
  schoolId: string;
  studentId: string;
  planId: string;
  sessionDate: string;
  therapistName: string;
  therapistRole: UserRole;
  attendanceStatus: 'Completed' | 'Missed' | 'Rescheduled';
  exerciseTitle: string;
  targetFocus: string;
  accuracyPct?: number | null; // Optional: fluency sessions emphasize participation/comfort too
  attemptsCount: number;
  assistanceLevel: 'Independent' | 'Minimal Verbal/Visual Cue' | 'Moderate Guided Cue' | 'Full Modelling';
  studentEngagement: 'High' | 'Steady' | 'Variable' | 'Needed Encouragement';
  communicationComfortRating?: 1 | 2 | 3 | 4 | 5;
  observedDifficulties: string;
  therapistNotes: string;
  nextRecommendedActivity: string;
  nextSessionDate?: string;
}

export interface AudioPracticeRecord {
  id: string;
  schoolId: string;
  studentId: string;
  sessionId?: string;
  recordedAt: string;
  recordedBy: string;
  languageContext: string;
  accentAndDialectNote: string;
  targetWords: string[];
  localDurationSec: number;
  consentVerified: boolean;
  externalAiUploadAllowed: boolean; // Always false unless explicit verified institutional DPA + consent
  therapistTranscript: string;
  therapistAnnotation: string;
  comparisonNote?: string;
}

export interface ParentHomePracticeLog {
  id: string;
  schoolId: string;
  studentId: string;
  planId: string;
  exerciseId?: string;
  exerciseTitle: string;
  completedDate: string;
  durationMin: number;
  childComfort: 'Enjoyed / Comfortable' | 'Steady' | 'Tired — Stopped Early';
  parentObservation: string;
  loggedByParentName: string;
  therapistReply?: string;
}

export type ClinicalReportType =
  | 'developmental_screening'
  | 'speech_assessment'
  | 'therapy_progress'
  | 'professional_clinical';

export interface ClinicalReportRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  reportType: ClinicalReportType;
  title: string;
  reportDate: string;
  authorName: string;
  authorRole: UserRole;
  authorCredentials: string;
  authorRegistrationNo?: string;
  screeningFindings?: string;
  clinicalAssessmentFindings?: string;
  professionalDiagnosis?: string; // Strictly clinician-entered, never auto-populated
  languageAndSpeechProfile?: string;
  baselineAndProgressSummary?: string;
  recommendations: string[];
  parentFriendlySummary: string;
  teacherAuthorizedSummary?: string;
  status: 'Draft' | 'Signed & Approved';
  sharedWithParent: boolean;
  sharedWithManagement: boolean;
  sharedClassroomSummaryWithTeacher: boolean;
  signedAt?: string;
}

export interface ClinicalAccessLogEntry {
  id: string;
  schoolId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'viewed_report' | 'exported_report' | 'approved_plan' | 'updated_consent' | 'logged_clinical_record' | 'flagged_medical_review';
  entityType: string;
  entityId: string;
  studentId: string;
  detail: string;
}

export interface ClinicalSpecialistCredential {
  userId: string;
  name: string;
  role: UserRole;
  designation: string;
  registrationCouncil: string;
  registrationNo: string;
  scopeOfPractice: string;
  verified: boolean;
  schoolId: string | null;
}

export interface ClinicalWorkspaceBundle {
  consents: ClinicalConsentRecord[];
  developmentalHistories: DevelopmentalHistoryRecord[];
  parentQuestionnaires: ParentQuestionnaireRecord[];
  teacherObservations: TeacherObservationRecord[];
  screeningCases: DevelopmentalScreeningCase[];
  conditionAssessments: ConditionAssessmentRecord[];
  speechSoundTargets: SpeechSoundTarget[];
  speechExercises: SpeechExerciseItem[];
  fluencyProfiles: FluencyProfileRecord[];
  therapyPlans: PersonalizedTherapyPlan[];
  therapySessionLogs: DailyTherapySessionLog[];
  audioPracticeRecords: AudioPracticeRecord[];
  parentHomePracticeLogs: ParentHomePracticeLog[];
  clinicalReports: ClinicalReportRecord[];
  clinicalAccessLogs: ClinicalAccessLogEntry[];
  specialists: ClinicalSpecialistCredential[];
}
