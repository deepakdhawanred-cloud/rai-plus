import type {
  AcademicResource,
  ActivityRecord,
  AdmissionLead,
  AttendanceRecord,
  AuditLogEntry,
  BlogArticle,
  CareerCounsellingRequest,
  CognitiveAssignment,
  CognitiveAttemptRecord,
  DevelopmentEvidence,
  DevelopmentReviewItem,
  DevelopmentalRemedialAssignment,
  DismissedPartialMatch,
  ExamMark,
  FamilyAccount,
  FeeDefaulterNotificationConfig,
  FeeDefaulterNotificationRecord,
  FeeLedgerAccount,
  FeePaymentReceipt,
  FeeReminderCalendarEvent,
  FeeTransaction,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeVisitRecord,
  LearnersWeights,
  LessonPlan,
  MonthlyAttendanceSummary,
  MonthlyFeeTargetConfig,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  NotebookIncompleteNotification,
  NumeracyTestSession,
  OperationalItem,
  ParentAttendanceNotification,
  ParentComplaint,
  PublicEnquiry,
  ReadingTestSession,
  RegisterApprovalRecord,
  School,
  SchoolFeeStructureRow,
  SiblingFamilyGroup,
  StudentRecord,
  CapabilityBandConfig,
  CareerProfile,
  PresentationAuditRecord,
  RedesignedPresentationDeck,
  StudentCareerPlan,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TeacherCapabilityProfile,
  TeacherLeaveBalance,
  TeacherLeaveRequest,
  TeacherProductivityKpiConfig,
  ThinkingAssessmentSession,
  ThinkingQuestionItem,
  ThinkingScoringConfig,
  DatabaseMigrationEntry,
  PpdtRecord,
  SrtRecord,
  TatRecord,
  ThinkingOlqMappingRecord,
  TimetableMasterConfig,
  TimetableSlot,
  UserAccount,
  VisParsedReportProfile,
  WatRecord,
  PsychometricRecord,
  ThinkingMonthlySetUsage,
  SsbEnrollmentRecord,
  SsbDailyAssignment,
  ComputerSkillBenchmark,
  ComputerSkillAttempt,
  AttendanceSupportRecord,
  MindMapResourceItem,
  AccountingEntry,
  PayrollRegisterEntry,
  BankReconciliationItem,
  AccountingTaskItem,
  BusRoute,
  StudentTransportAllocation,
  TransportDailyAttendanceRecord,
  SchoolEvent,
  EventParticipationRequest,
  EventTeacherIssue,
  StudentYearlyPlan,
  SubscriptionPlanPricingOverride,
  AbsenceTargetRiskAlert,
} from '../src/types';
import { createIntelligenceSeedBundle } from './intelligenceSeedData.ts';
import { createPsychometricSeedRecords } from './psychometricRoutes.ts';
import {
  loadVisExpenseSheetEntries,
  loadVisSalarySheetProfiles,
} from './visFinanceSheetLoader.ts';
import {
  createInitialComputerSkillAttempts,
  createInitialComputerSkillBenchmarksAllSchools,
  createInitialSsbDailyAssignments,
  createInitialSsbEnrollments,
} from './ssbAndComputerSkillRoutes.ts';
import type {
  VcipAttemptRecord,
  VcipAuthoredQuestion,
  VcipBrainGymLog,
  VcipClassAssignment,
  VcipGovernanceConfig,
  VcipProfileReleaseRecord,
  VcipAccessLogEntry,
} from '../src/types/vcip';
import {
  createInitialVcipAttempts,
  createInitialVcipAuthoredQuestions,
  createInitialVcipBrainGymLogs,
  createInitialVcipClassAssignments,
  createInitialVcipGovernanceConfigs,
} from './vcipRoutes.ts';
import {
  createInitialAttendanceSupportRecords,
  createInitialMindMapResources,
  createInitialVcipReleaseRecords,
  createInitialAccountingBundle,
} from './continuationRoutes.ts';
import { createInitialClinicalBundle } from './clinicalSeedData.ts';
import type {
  AudioPracticeRecord,
  ClinicalAccessLogEntry,
  ClinicalConsentRecord,
  ClinicalReportRecord,
  ConditionAssessmentRecord,
  DailyTherapySessionLog,
  DevelopmentalHistoryRecord,
  DevelopmentalScreeningCase,
  FluencyProfileRecord,
  ParentHomePracticeLog,
  ParentQuestionnaireRecord,
  PersonalizedTherapyPlan,
  SpeechExerciseItem,
  SpeechSoundTarget,
  TeacherObservationRecord,
} from '../src/types/clinical';
import { runThinkingAssessmentMigrations } from './thinkingMigrations.ts';
import { loadInitialFinancialState } from './visFeeLoader.ts';
import { composeParentAttendanceMessage } from '../src/utils/attendanceNotificationEngine.ts';
import {
  composeNotebookIncompleteAlert,
  composePriorChapterBacklogAlert,
  shouldTriggerNotebookIncompleteAlert,
} from '../src/utils/notebookNotificationEngine.ts';
import { computePendingCheckingHighlights } from '../src/utils/pendingCheckingEngine.ts';
import { DEFAULT_LEARNERS_WEIGHTS, mapNotebookEntryToEvidence } from '../src/utils/evidenceEngine.ts';
import { mapHomeworkSubmissionToEvidence } from '../src/utils/homeworkEngine.ts';
import { mapActivityParticipationToEvidence } from '../src/utils/olqActivityEngine.ts';
import {
  ACTIVE_SESSION_MONTHS,
  computeReadingBand,
} from '../src/utils/visAcademicProgressEngine.ts';
import {
  buildVisAdditionalEvidence,
  buildVisResourcesFromDrivePacks,
  VIS_ACTIVITIES,
  VIS_ADMISSION_LEADS,
  VIS_ATTENDANCE,
  VIS_DEV_REVIEWS,
  VIS_EXAM_MARKS,
  VIS_FEES,
  VIS_HOMEWORK_ASSIGNMENTS,
  VIS_HOMEWORK_SUBMISSIONS,
  VIS_HOME_VISITS,
  VIS_LESSON_PLANS,
  VIS_MONTHLY_ATTENDANCE,
  VIS_NOTEBOOK_ENTRIES,
  VIS_NUMERACY_REPORTS,
  VIS_OPERATIONS,
  VIS_PARENT_COMPLAINTS,
  VIS_PARSED_REPORTS_SEED,
  VIS_READING_REPORTS,
  VIS_SCHOOL,
  VIS_STUDENTS,
  VIS_TIMETABLE,
  VIS_USERS,
} from './visSeedData.ts';

export interface DatabaseState {
  schools: School[];
  users: UserAccount[];
  planPricingCatalog?: Record<string, SubscriptionPlanPricingOverride>;
  schoolWeights: Record<string, { weights: LearnersWeights; version: string; approvedBy: string }>;
  students: StudentRecord[];
  notebookEntries: NotebookEntry[];
  notebookNotifications: NotebookIncompleteNotification[];
  homeworkAssignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  activityRecords: ActivityRecord[];
  evidence: DevelopmentEvidence[];
  developmentReviews: DevelopmentReviewItem[];
  examMarks: ExamMark[];
  attendance: AttendanceRecord[];
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  readingTestSessions: ReadingTestSession[];
  numeracyTestSessions: NumeracyTestSession[];
  monthlyAttendance: MonthlyAttendanceSummary[];
  attendanceNotifications: ParentAttendanceNotification[];
  resources: AcademicResource[];
  lessonPlans: LessonPlan[];
  timetable: TimetableSlot[];
  admissionLeads: AdmissionLead[];
  homeVisitRecords: HomeVisitRecord[];
  careerRequests: CareerCounsellingRequest[];
  feeTransactions: FeeTransaction[];
  operations: OperationalItem[];
  parentComplaints: ParentComplaint[];
  blogArticles: BlogArticle[];
  auditLogs: AuditLogEntry[];
  publicEnquiries: PublicEnquiry[];
  cognitiveAttempts: CognitiveAttemptRecord[];
  cognitiveAssignments: CognitiveAssignment[];
  remedialAssignments: DevelopmentalRemedialAssignment[];
  registerApprovals: Record<string, RegisterApprovalRecord>;
  visParsedReports: Record<string, VisParsedReportProfile>;
  feeAccounts: FeeLedgerAccount[];
  siblingGroups: SiblingFamilyGroup[];
  familyAccounts: FamilyAccount[];
  dismissedPartialMatches: DismissedPartialMatch[];
  financialTargets: Record<string, MonthlyFeeTargetConfig>;
  feeReceipts: FeePaymentReceipt[];
  feeReminders?: FeeReminderCalendarEvent[];
  feeStructure?: SchoolFeeStructureRow[];
  feeDefaulterAlertConfigs?: Record<string, FeeDefaulterNotificationConfig>;
  feeDefaulterAlertLogs?: FeeDefaulterNotificationRecord[];
  busRoutes?: BusRoute[];
  studentTransportAllocations?: StudentTransportAllocation[];
  transportAttendance?: TransportDailyAttendanceRecord[];
  schoolEvents?: SchoolEvent[];
  eventParticipationRequests?: EventParticipationRequest[];
  eventTeacherIssues?: EventTeacherIssue[];
  studentYearlyPlans?: StudentYearlyPlan[];
  absenceTargetRiskAlerts?: AbsenceTargetRiskAlert[];
  // School Control Room & Smart Academic Calendar
  schoolClassrooms?: import('../src/types/controlRoomCalendar').SchoolClassroom[];
  schoolBellSchedules?: Record<string, import('../src/types/controlRoomCalendar').BellPeriodSlot[]>;
  periodCheckIns?: import('../src/types/controlRoomCalendar').PeriodCheckInRecord[];
  teacherDuties?: import('../src/types/controlRoomCalendar').TeacherDutyRecord[];
  academicCalendars?: Record<string, import('../src/types/controlRoomCalendar').AcademicCalendarState>;
  // Rai Plus Learning Portal (Classes 6–12) multi-tenant document store
  learningPortalDocs?: Record<string, Record<string, unknown>>;
  // Rai Plus AI Inventory, Asset, Procurement & Resource Optimization System
  inventoryBySchool?: Record<string, import('../src/types/inventory').SchoolInventoryState>;
  // Additive Virat 360° Intelligence Collections
  thinkingQuestionBank: ThinkingQuestionItem[];
  thinkingScoringConfigs: Record<string, ThinkingScoringConfig>;
  thinkingAssessments: ThinkingAssessmentSession[];
  // Normalized Thinking Assessment Express Collections & Migration Ledger
  srtRecords: SrtRecord[];
  watRecords: WatRecord[];
  tatRecords: TatRecord[];
  ppdtRecords: PpdtRecord[];
  thinkingOlqMappings: ThinkingOlqMappingRecord[];
  databaseMigrations: DatabaseMigrationEntry[];
  timetableMasterConfigs: Record<string, TimetableMasterConfig>;
  substituteRuleConfigs: Record<string, SubstituteRuleConfig>;
  teacherCapabilityProfiles: TeacherCapabilityProfile[];
  capabilityBandConfigs: Record<string, CapabilityBandConfig>;
  substitutionAssignments: SubstitutionAssignmentRecord[];
  teacherLeaveRequests: TeacherLeaveRequest[];
  teacherLeaveBalances: TeacherLeaveBalance[];
  productivityKpiConfigs: Record<string, TeacherProductivityKpiConfig>;
  careerProfiles: CareerProfile[];
  studentCareerPlans: StudentCareerPlan[];
  presentationAudits: PresentationAuditRecord[];
  redesignedDecks: RedesignedPresentationDeck[];
  psychometricRecords: PsychometricRecord[];
  thinkingSetUsages: ThinkingMonthlySetUsage[];
  ssbEnrollments: SsbEnrollmentRecord[];
  ssbDailyAssignments: SsbDailyAssignment[];
  computerSkillBenchmarks: ComputerSkillBenchmark[];
  computerSkillAttempts: ComputerSkillAttempt[];
  vcipAttempts: VcipAttemptRecord[];
  vcipBrainGymLogs: VcipBrainGymLog[];
  vcipAuthoredQuestions: VcipAuthoredQuestion[];
  vcipClassAssignments: VcipClassAssignment[];
  vcipGovernanceConfigs: Record<string, VcipGovernanceConfig>;
  vcipReleaseRecords: VcipProfileReleaseRecord[];
  vcipAccessLogs: VcipAccessLogEntry[];
  attendanceSupportRecords: AttendanceSupportRecord[];
  mindMapResources: MindMapResourceItem[];
  accountingEntries: AccountingEntry[];
  payrollRegisters: PayrollRegisterEntry[];
  bankReconciliationItems: BankReconciliationItem[];
  accountingTasks: AccountingTaskItem[];
  clinicalConsents: ClinicalConsentRecord[];
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
  chapterMasteryAttempts?: import('../src/types').ChapterMasteryAttempt[];
  // Interactive Learning & Experiential Education Engine (Modules A–I)
  chapterBlueprints?: import('../src/types/interactiveLearning').ChapterLearningBlueprint[];
  interactiveGames?: import('../src/types/interactiveLearning').InteractiveGameAsset[];
  experientialSimulations?: import('../src/types/interactiveLearning').ExperientialSimulationAsset[];
  interactiveLearningAttempts?: import('../src/types/interactiveLearning').InteractiveLearningAttempt[];
  abacusSessions?: import('../src/types/interactiveLearning').AbacusSessionRecord[];
  coachOverrides?: import('../src/types/interactiveLearning').CoachOverrideRecord[];
  teacherApprovalPolicies?: Record<string, import('../src/types/interactiveLearning').TeacherApprovalPolicyConfig>;
  // Staff Attendance, Automated Salary, Digital Gate Pass & Visitors Register
  staffProfiles?: import('../src/types').StaffProfile[];
  staffAttendance?: import('../src/types').StaffAttendanceRecord[];
  salaryAuditLogs?: import('../src/types').SalaryModificationAuditRecord[];
  gatePasses?: import('../src/types').GatePassRecord[];
  visitorLogs?: import('../src/types').VisitorLogRecord[];
}

export function createInitialDatabase(): DatabaseState {
  const schools: School[] = [
    VIS_SCHOOL,
    {
      id: 'school-svm-kk',
      name: 'Saraswati Vidya Mandir Senior Secondary',
      code: 'SVM-KKR-01',
      city: 'Kurukshetra',
      state: 'Haryana',
      board: 'HBSE',
      udiseCode: '06040201804',
      haryanaMisCode: 'HR-KKR-4419',
      session: '2026-27',
      subscriptionPlan: 'Premium Campus',
      active: true,
      studentCount: 1240,
      teacherCount: 58,
    },
    {
      id: 'school-dpa-knl',
      name: 'Doaba Public Academy',
      code: 'DPA-KNL-02',
      city: 'Karnal',
      state: 'Haryana',
      board: 'NCERT/SCERT',
      udiseCode: '06060104211',
      haryanaMisCode: 'HR-KNL-7820',
      session: '2026-27',
      subscriptionPlan: 'Growth ERP',
      active: true,
      studentCount: 860,
      teacherCount: 41,
    },
  ];

  const users: UserAccount[] = [
    {
      id: 'usr-coo-raiplus',
      name: 'COO — Rai Plus',
      email: 'coo@raiplus.in',
      role: 'super_admin',
      schoolId: null,
      designation: 'Chief Operating Officer (COO) · Rai Plus',
      isPlatformCoo: true,
    },
    {
      id: 'usr-super-1',
      name: 'Vikramaditya Rao',
      email: 'platform@viratstudent360.in',
      role: 'super_admin',
      schoolId: null,
      designation: 'Platform Super Admin',
    },
    {
      id: 'usr-admin-svm',
      name: 'Rajinder Pal Singh',
      email: 'admin@svm-kurukshetra.edu.in',
      role: 'school_admin',
      schoolId: 'school-svm-kk',
      designation: 'School Administrator',
    },
    {
      id: 'usr-principal-svm',
      name: 'Dr. Meenakshi Deswal',
      email: 'principal@svm-kurukshetra.edu.in',
      role: 'principal',
      schoolId: 'school-svm-kk',
      designation: 'Principal',
    },
    {
      id: 'usr-coord-svm',
      name: 'Anil Kumar Hooda',
      email: 'coordinator@svm-kurukshetra.edu.in',
      role: 'coordinator',
      schoolId: 'school-svm-kk',
      designation: 'Academic Coordinator',
    },
    {
      id: 'usr-teacher-svm',
      name: 'Kavita Sharma',
      email: 'kavita.sharma@svm-kurukshetra.edu.in',
      role: 'teacher',
      schoolId: 'school-svm-kk',
      designation: 'Senior Mathematics Teacher',
      subjectSpecialty: 'Mathematics · Class 9 & 10',
    },
    {
      id: 'usr-parent-svm',
      name: 'Suresh Mehta',
      email: 'suresh.mehta@parent.in',
      role: 'parent',
      schoolId: 'school-svm-kk',
      designation: 'Parent Guardian',
      linkedStudentIds: ['stu-svm-101'],
    },
    {
      id: 'usr-student-svm',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@svm-kurukshetra.edu.in',
      role: 'student',
      schoolId: 'school-svm-kk',
      designation: 'Class 9-A Student',
      linkedStudentIds: ['stu-svm-101'],
    },
    {
      id: 'usr-counsellor-1',
      name: 'Dr. Sunita Gill',
      email: 'sunita.gill@viratstudent360.in',
      role: 'counsellor',
      schoolId: null,
      designation: 'Lead Career Counsellor',
    },
    {
      id: 'usr-principal-dpa',
      name: 'Harpreet Kaur Sandhu',
      email: 'principal@doabapublic.edu.in',
      role: 'principal',
      schoolId: 'school-dpa-knl',
      designation: 'Principal (Doaba Public Academy)',
    },
  ];

  const students: StudentRecord[] = [
    {
      id: 'stu-svm-101',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2024-0101',
      rollNo: '01',
      name: 'Aarav Mehta',
      classSection: '9-A',
      house: 'Shakti House',
      guardianName: 'Suresh Mehta',
      guardianPhone: '+91 98120 44110',
      udiseStudentId: '2406040201804001',
      haryanaMisId: 'HMIS-992041',
      attendancePct: 93.4,
      feeBalanceInr: 4500,
      totalFeeAnnualInr: 38000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-1192' },
        { name: 'Previous Transfer Certificate', verified: true, referenceNo: 'TC-2024-081' },
        { name: 'Aadhaar / Parivar Pehchan Patra', verified: true, referenceNo: 'PPP-HR-8841' },
        { name: 'UDISE+ Enrolment Sync', verified: true, referenceNo: 'UD-060402' },
      ],
      responsibilities: ['Class Mathematics Peer Mentor', 'Shakti House Morning Assembly Lead'],
      achievements: ['District Science Exhibition 2nd Place (2026)', 'Inter-House Debate Semi-Finalist'],
      confidentialCounsellorNote:
        'Aarav performs strongly in analytical tasks but shows mild exam-hall anxiety before timed papers. Recommended calm mock practice with Dr. Gill.',
    },
    {
      id: 'stu-svm-102',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2024-0102',
      rollNo: '02',
      name: 'Ananya Verma',
      classSection: '9-A',
      house: 'Pragati House',
      guardianName: 'Deepak Verma',
      guardianPhone: '+91 98121 77234',
      udiseStudentId: '2406040201804002',
      haryanaMisId: 'HMIS-992042',
      attendancePct: 96.2,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 38000,
      reportApprovalStatus: 'Pending Approval',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-1199' },
        { name: 'Previous Transfer Certificate', verified: true, referenceNo: 'TC-2024-094' },
        { name: 'Aadhaar / Parivar Pehchan Patra', verified: true, referenceNo: 'PPP-HR-5502' },
        { name: 'UDISE+ Enrolment Sync', verified: false },
      ],
      responsibilities: ['Eco-Club Garden Coordinator'],
      achievements: ['State-Level Hindi Essay Merit Certificate'],
      confidentialCounsellorNote:
        'Quiet in large groups yet consistently thoughtful in written reflections. Needs structured small-group speaking roles rather than cold calling.',
    },
    {
      id: 'stu-svm-103',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2024-0103',
      rollNo: '03',
      name: 'Rohan Chauhan',
      classSection: '9-A',
      house: 'Tejas House',
      guardianName: 'Balwinder Chauhan',
      guardianPhone: '+91 94160 88219',
      udiseStudentId: '2406040201804003',
      haryanaMisId: 'HMIS-992043',
      attendancePct: 88.5,
      feeBalanceInr: 9500,
      totalFeeAnnualInr: 38000,
      reportApprovalStatus: 'Pending Approval',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-1210' },
        { name: 'Previous Transfer Certificate', verified: true, referenceNo: 'TC-2024-112' },
        { name: 'Aadhaar / Parivar Pehchan Patra', verified: false },
      ],
      responsibilities: ['School Kho-Kho Vice Captain'],
      achievements: ['Kurukshetra District Kho-Kho Runners-Up'],
      confidentialCounsellorNote:
        'Strong physical stamina and team spirit. Needs consistent guidance on independent notebook practice rather than copying peers.',
    },
    {
      id: 'stu-svm-104',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2023-0211',
      rollNo: '04',
      name: 'Simranjeet Kaur',
      classSection: '10-B',
      house: 'Pragati House',
      guardianName: 'Gurpreet Singh',
      guardianPhone: '+91 98960 33108',
      udiseStudentId: '2306040201804019',
      haryanaMisId: 'HMIS-881204',
      attendancePct: 95.0,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 42000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-0922' },
        { name: 'Previous Transfer Certificate', verified: true, referenceNo: 'TC-2023-041' },
        { name: 'Aadhaar / Parivar Pehchan Patra', verified: true, referenceNo: 'PPP-HR-2109' },
        { name: 'UDISE+ Enrolment Sync', verified: true, referenceNo: 'UD-060409' },
      ],
      responsibilities: ['Library Student Volunteer'],
      achievements: ['HBSE Pre-Board Top 5% Merit'],
      confidentialCounsellorNote:
        'Considering Humanities with Economics and Legal Studies after Class 10. Career follow-up scheduled with family.',
    },
    {
      id: 'stu-dpa-201',
      schoolId: 'school-dpa-knl',
      admissionNo: 'DPA-2025-0041',
      rollNo: '01',
      name: 'Kabir Malhotra',
      classSection: '11-Science',
      stream: 'Non-Medical (PCM)',
      house: 'Sutlej House',
      guardianName: 'Sanjeev Malhotra',
      guardianPhone: '+91 98130 61200',
      udiseStudentId: '2506060104211001',
      haryanaMisId: 'HMIS-774011',
      attendancePct: 91.8,
      feeBalanceInr: 6000,
      totalFeeAnnualInr: 46000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KNL-401' },
        { name: 'UDISE+ Enrolment Sync', verified: true, referenceNo: 'UD-060601' },
      ],
      responsibilities: ['Physics Lab Equipment Prefect'],
      achievements: ['Regional Robotics Workshop Finalist'],
      confidentialCounsellorNote: 'Interested in Aerospace & Mechanical Engineering pathways.',
    },
    {
      id: 'stu-svm-105',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2024-0105',
      rollNo: '05',
      name: 'Ishita Garg',
      classSection: '9-A',
      house: 'Shakti House',
      guardianName: 'Rajiv Garg',
      guardianPhone: '+91 98124 55109',
      udiseStudentId: '2406040201804005',
      haryanaMisId: 'HMIS-992045',
      attendancePct: 94.8,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 38000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-1228' },
        { name: 'UDISE+ Enrolment Sync', verified: true, referenceNo: 'UD-060405' },
      ],
      responsibilities: ['Class Science Lab Coordinator'],
      achievements: ['Regional Mathematics Quiz Finalist'],
      confidentialCounsellorNote: 'Consistent organizer; benefits from deeper challenge problems.',
    },
    {
      id: 'stu-svm-106',
      schoolId: 'school-svm-kk',
      admissionNo: 'SVM-2024-0106',
      rollNo: '06',
      name: 'Devansh Yadav',
      classSection: '9-A',
      house: 'Tejas House',
      guardianName: 'Satyavir Yadav',
      guardianPhone: '+91 94162 11904',
      udiseStudentId: '2406040201804006',
      haryanaMisId: 'HMIS-992046',
      attendancePct: 86.2,
      feeBalanceInr: 4500,
      totalFeeAnnualInr: 38000,
      reportApprovalStatus: 'Pending Approval',
      formulaVersion: 'v1.2',
      documents: [
        { name: 'Birth Certificate', verified: true, referenceNo: 'BC-KKR-1231' },
      ],
      responsibilities: ['Sports Equipment Helper'],
      achievements: ['Inter-House 400m Track Participant'],
      confidentialCounsellorNote: 'Shows strong verbal enthusiasm; needs structured revision routine.',
    },
    {
      id: 'stu-dpa-202',
      schoolId: 'school-dpa-knl',
      admissionNo: 'DPA-2025-0042',
      rollNo: '02',
      name: 'Mehak Sandhu',
      classSection: '11-Science',
      stream: 'Medical (PCB)',
      house: 'Beas House',
      guardianName: 'Kulwinder Sandhu',
      guardianPhone: '+91 98131 44012',
      udiseStudentId: '2506060104211002',
      haryanaMisId: 'HMIS-774012',
      attendancePct: 96.0,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 46000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [{ name: 'Birth Certificate', verified: true, referenceNo: 'BC-KNL-402' }],
      responsibilities: ['Biology Specimen Curator'],
      achievements: ['District Science Olympiad Merit'],
      confidentialCounsellorNote: 'Preparing systematically for NEET foundation.',
    },
    {
      id: 'stu-dpa-203',
      schoolId: 'school-dpa-knl',
      admissionNo: 'DPA-2025-0043',
      rollNo: '03',
      name: 'Arjun Gill',
      classSection: '11-Science',
      stream: 'Non-Medical (PCM)',
      house: 'Ravi House',
      guardianName: 'Paramjit Gill',
      guardianPhone: '+91 98132 77019',
      udiseStudentId: '2506060104211003',
      haryanaMisId: 'HMIS-774013',
      attendancePct: 90.4,
      feeBalanceInr: 3000,
      totalFeeAnnualInr: 46000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [{ name: 'Birth Certificate', verified: true, referenceNo: 'BC-KNL-403' }],
      responsibilities: ['Computer Club Assistant'],
      achievements: ['State Coding Challenge Participant'],
      confidentialCounsellorNote: 'Strong practical logic; improving written derivation clarity.',
    },
    {
      id: 'stu-dpa-204',
      schoolId: 'school-dpa-knl',
      admissionNo: 'DPA-2025-0044',
      rollNo: '04',
      name: 'Niharika Bansal',
      classSection: '11-Science',
      stream: 'Non-Medical (PCM)',
      house: 'Sutlej House',
      guardianName: 'Vikas Bansal',
      guardianPhone: '+91 98133 88041',
      udiseStudentId: '2506060104211004',
      haryanaMisId: 'HMIS-774014',
      attendancePct: 89.0,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 46000,
      reportApprovalStatus: 'Pending Approval',
      formulaVersion: 'v1.2',
      documents: [{ name: 'Birth Certificate', verified: true, referenceNo: 'BC-KNL-404' }],
      responsibilities: ['Morning Bulletin Reader'],
      achievements: ['Debate Club Commendation'],
      confidentialCounsellorNote: 'Working on numerical speed under timed conditions.',
    },
  ];

  const notebookEntries: NotebookEntry[] = [
    {
      id: 'nb-seed-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'All steps plotted cleanly with labelled axes.',
      teacherName: 'Kavita Sharma',
    },
    {
      id: 'nb-seed-2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'B',
      homeworkDone: true,
      remarks: 'Good independent attempt; minor sign slip in Quadrant III.',
      teacherName: 'Kavita Sharma',
    },
    {
      id: 'nb-seed-3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Non-Readability',
      workQuality: 'C',
      homeworkDone: false,
      remarks: 'Answers closely match peer notebook; gentle one-on-one revision planned.',
      teacherName: 'Kavita Sharma',
    },
    {
      id: 'nb-seed-4',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      classSection: '11-Science',
      subject: 'Physics',
      chapter: 'Ch. 5: Laws of Motion',
      date: '2026-11-09',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'Clear free-body diagrams.',
      teacherName: 'Harpreet Kaur Sandhu',
    },
    {
      id: 'nb-seed-5',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-104',
      classSection: '10-B',
      subject: 'Social Science',
      chapter: 'Ch. 2: Nationalism in India',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'Well-structured timeline & source citations.',
      teacherName: 'Anil Kumar Hooda',
    },
    {
      id: 'nb-seed-6',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-105',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'A',
      homeworkDone: true,
      remarks: 'Neat plotting with independent verification.',
      teacherName: 'Kavita Sharma',
    },
    {
      id: 'nb-seed-7',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-106',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      date: '2026-11-10',
      checked: true,
      handwriting: 'Readability',
      workQuality: 'B',
      homeworkDone: false,
      remarks: 'Partial attempt; last 2 exercises incomplete.',
      teacherName: 'Kavita Sharma',
    },
  ];

  const extraEvidence: DevelopmentEvidence[] = [
    {
      id: 'ev-exam-101',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      sourceKey: 'exam:stu-svm-101:half-yearly:math',
      sourceType: 'exam',
      subject: 'Mathematics',
      date: '2026-10-24',
      summary: 'Half-Yearly Mathematics Assessment: 89/100',
      olqContributions: {
        effective_intelligence: 88,
        reasoning_ability: 90,
        speed_of_decision: 82,
      },
      componentContributions: { academic: 89 },
      learningSignals: { initiativeProblemSolving: 88 },
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
    {
      id: 'ev-part-101',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      sourceKey: 'resp:stu-svm-101:assembly-lead',
      sourceType: 'responsibility',
      date: '2026-11-02',
      summary: 'Shakti House Morning Assembly Lead & Science Exhibition Prep',
      olqContributions: {
        social_adaptability: 84,
        cooperation: 86,
        initiative: 85,
        self_confidence: 80,
        influence_group: 82,
        liveliness: 84,
        stamina: 82,
      },
      componentContributions: { participation: 86, personalGrowth: 85 },
      learningSignals: {
        classroomParticipation: 85,
        curiosityAndQuestions: 88,
        groupContributions: 86,
      },
      enteredBy: 'Anil Kumar Hooda',
      validated: true,
    },
    {
      id: 'ev-exam-102',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      sourceKey: 'exam:stu-svm-102:half-yearly:hindi',
      sourceType: 'exam',
      subject: 'Hindi & Social Science',
      date: '2026-10-25',
      summary: 'Half-Yearly Languages & Social Science: 84/100',
      olqContributions: {
        power_of_expression: 88,
        social_adaptability: 82,
        cooperation: 85,
      },
      componentContributions: { academic: 84, personalGrowth: 83 },
      learningSignals: {
        curiosityAndQuestions: 80,
        groupContributions: 82,
        learningFromMistakes: 86,
      },
      enteredBy: 'Anil Kumar Hooda',
      validated: true,
    },
    {
      id: 'ev-sport-103',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      sourceKey: 'sport:stu-svm-103:khokho-district',
      sourceType: 'sports_activity',
      date: '2026-11-04',
      summary: 'District Kho-Kho Tournament Vice Captain',
      olqContributions: {
        cooperation: 88,
        speed_of_decision: 85,
        influence_group: 84,
        courage: 86,
        stamina: 91,
        liveliness: 87,
      },
      componentContributions: { participation: 90, personalGrowth: 84 },
      learningSignals: {
        groupContributions: 88,
        classroomParticipation: 76,
      },
      enteredBy: 'Physical Education Dept',
      validated: true,
    },
    {
      id: 'ev-exam-201',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      sourceKey: 'exam:stu-dpa-201:unit1:physics',
      sourceType: 'exam',
      subject: 'Physics',
      date: '2026-10-28',
      summary: 'Unit Test Physics: 91/100',
      olqContributions: {
        effective_intelligence: 90,
        reasoning_ability: 92,
        determination: 88,
      },
      componentContributions: { academic: 91, participation: 84, personalGrowth: 86 },
      learningSignals: {
        independentTaskCompletion: 90,
        initiativeProblemSolving: 89,
      },
      enteredBy: 'Harpreet Kaur Sandhu',
      validated: true,
    },
    {
      id: 'ev-exam-104',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-104',
      sourceKey: 'exam:stu-svm-104:preboard:humanities',
      sourceType: 'exam',
      subject: 'Economics & Social Science',
      date: '2026-10-29',
      summary: 'Pre-Board Merit Review: 93/100',
      olqContributions: {
        effective_intelligence: 92,
        reasoning_ability: 91,
        power_of_expression: 92,
        sense_of_responsibility: 91,
      },
      componentContributions: { academic: 93, participation: 88, personalGrowth: 90 },
      learningSignals: {
        independentTaskCompletion: 92,
        curiosityAndQuestions: 90,
      },
      enteredBy: 'Anil Kumar Hooda',
      validated: true,
    },
    {
      id: 'ev-exam-105',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-105',
      sourceKey: 'exam:stu-svm-105:half-yearly:math',
      sourceType: 'exam',
      subject: 'Mathematics',
      date: '2026-10-24',
      summary: 'Half-Yearly Mathematics Assessment: 83/100',
      olqContributions: {
        effective_intelligence: 82,
        organising_ability: 84,
        cooperation: 83,
      },
      componentContributions: { academic: 83, participation: 81, personalGrowth: 82 },
      learningSignals: {
        independentTaskCompletion: 84,
        groupContributions: 82,
      },
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
    {
      id: 'ev-exam-106',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-106',
      sourceKey: 'exam:stu-svm-106:half-yearly:math',
      sourceType: 'exam',
      subject: 'Mathematics',
      date: '2026-10-24',
      summary: 'Half-Yearly Mathematics Assessment: 68/100',
      olqContributions: {
        cooperation: 74,
        liveliness: 76,
      },
      componentContributions: { academic: 68, participation: 72, personalGrowth: 70 },
      learningSignals: {
        classroomParticipation: 74,
      },
      enteredBy: 'Kavita Sharma',
      validated: true,
    },
    {
      id: 'ev-exam-202',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-202',
      sourceKey: 'exam:stu-dpa-202:unit1:bio',
      sourceType: 'exam',
      subject: 'Biology',
      date: '2026-10-28',
      summary: 'Unit Test Biology: 87/100',
      olqContributions: { effective_intelligence: 86, organising_ability: 88, determination: 85 },
      componentContributions: { academic: 87, learningHabits: 88, participation: 84, personalGrowth: 85 },
      learningSignals: { independentTaskCompletion: 87 },
      enteredBy: 'Harpreet Kaur Sandhu',
      validated: true,
    },
    {
      id: 'ev-exam-203',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-203',
      sourceKey: 'exam:stu-dpa-203:unit1:cs',
      sourceType: 'exam',
      subject: 'Computer Science',
      date: '2026-10-28',
      summary: 'Unit Test Computer Science: 82/100',
      olqContributions: { reasoning_ability: 84, initiative: 82 },
      componentContributions: { academic: 82, learningHabits: 80, participation: 83, personalGrowth: 81 },
      learningSignals: { initiativeProblemSolving: 83 },
      enteredBy: 'Harpreet Kaur Sandhu',
      validated: true,
    },
    {
      id: 'ev-exam-204',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-204',
      sourceKey: 'exam:stu-dpa-204:unit1:physics',
      sourceType: 'exam',
      subject: 'Physics',
      date: '2026-10-28',
      summary: 'Unit Test Physics: 74/100',
      olqContributions: { power_of_expression: 78, sense_of_responsibility: 74 },
      componentContributions: { academic: 74, learningHabits: 72, participation: 76, personalGrowth: 75 },
      learningSignals: { classroomParticipation: 76 },
      enteredBy: 'Harpreet Kaur Sandhu',
      validated: true,
    },
  ];

  const evidence: DevelopmentEvidence[] = [
    ...notebookEntries.map(mapNotebookEntryToEvidence),
    ...extraEvidence,
  ];

  const examMarks: ExamMark[] = [
    {
      id: 'mk-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      examName: 'Half-Yearly Assessment',
      subject: 'Mathematics',
      maxMarks: 100,
      obtainedMarks: 89,
      date: '2026-10-24',
      conceptualGap: 'Minor speed loss on multi-step linear word problems',
    },
    {
      id: 'mk-2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      examName: 'Half-Yearly Assessment',
      subject: 'Science',
      maxMarks: 100,
      obtainedMarks: 86,
      date: '2026-10-26',
    },
    {
      id: 'mk-3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      examName: 'Half-Yearly Assessment',
      subject: 'Mathematics',
      maxMarks: 100,
      obtainedMarks: 76,
      date: '2026-10-24',
      conceptualGap: 'Coordinate sign conventions in Quadrants II & III',
    },
    {
      id: 'mk-4',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      examName: 'Half-Yearly Assessment',
      subject: 'Mathematics',
      maxMarks: 100,
      obtainedMarks: 62,
      date: '2026-10-24',
      conceptualGap: 'Needs step-by-step algebraic transposition practice',
    },
    {
      id: 'mk-5',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      examName: 'Term 1 Assessment',
      subject: 'Physics',
      maxMarks: 100,
      obtainedMarks: 91,
      date: '2026-10-28',
    },
    {
      id: 'mk-read-101',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      examName: 'Reading & Phonics Screening',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 54,
      date: '2026-11-09',
      conceptualGap: 'Complex phonics blends & silent-letter word decoding need practice',
    },
    {
      id: 'mk-tab-101',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      examName: 'Multiplication Tables Timed Drill',
      subject: 'Mathematics Tables',
      maxMarks: 20,
      obtainedMarks: 11,
      date: '2026-11-11',
      conceptualGap: 'Tables 12 to 19 & missing-factor recall below class average',
    },
    {
      id: 'mk-read-102',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      examName: 'Reading Fluency Check',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 58,
      date: '2026-11-09',
      conceptualGap: 'Multi-syllable word pronunciation & reading pacing',
    },
    {
      id: 'mk-read-103',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      examName: 'Reading & Phonics Screening',
      subject: 'English Reading',
      maxMarks: 100,
      obtainedMarks: 48,
      date: '2026-11-09',
      conceptualGap: 'Phonics digraphs & syllable decoding need daily reinforcement',
    },
    {
      id: 'mk-tab-103',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      examName: 'Multiplication Tables Timed Drill',
      subject: 'Mathematics Tables',
      maxMarks: 100,
      obtainedMarks: 44,
      date: '2026-11-11',
      conceptualGap: 'Multiplication tables 6 to 14 & factor fluency below benchmark',
    },
  ];

  const attendance: AttendanceRecord[] = [
    {
      id: 'att-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      date: '2026-11-12',
      status: 'Present',
    },
    {
      id: 'att-2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      date: '2026-11-12',
      status: 'Present',
    },
    {
      id: 'att-3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      date: '2026-11-12',
      status: 'Leave',
      contextNote: 'Represented school at District Kho-Kho Meet',
    },
  ];

  const resources: AcademicResource[] = [
    {
      id: 'res-1',
      schoolId: 'school-svm-kk',
      title: 'HBSE Class 9 Linear Equations in Two Variables — Slide Deck',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations',
      session: '2026-27',
      board: 'HBSE',
      category: 'Presentations',
      status: 'Approved',
      contentSummary: '18-slide visual walkthrough with real Haryana agricultural & transport word problems.',
      createdBy: 'Kavita Sharma',
      aiAssisted: false,
      updatedAt: '2026-11-05',
    },
    {
      id: 'res-2',
      schoolId: 'school-svm-kk',
      title: 'NCERT Ch. 4 Facilitator Guide & Differentiation Tips',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations',
      session: '2026-27',
      board: 'NCERT/SCERT',
      category: 'Teacher Guides',
      status: 'Approved',
      pushedToStudents: false,
      contentSummary: 'Pacing guide, common sign-error interventions, and peer-pair tasks.',
      createdBy: 'Anil Kumar Hooda',
      aiAssisted: false,
      updatedAt: '2026-11-06',
    },
    {
      id: 'res-3',
      schoolId: 'school-svm-kk',
      title: 'Practice Worksheet: Graphical Solutions (Set A & B)',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Kavita Sharma',
      pushedAt: '2026-11-08',
      contentSummary: '12 graded questions from foundational plotting to application.',
      createdBy: 'Kavita Sharma',
      aiAssisted: true,
      updatedAt: '2026-11-08',
    },
    {
      id: 'res-4',
      schoolId: 'school-svm-kk',
      title: 'Marking Scheme & Step-Wise Solutions (Set A & B)',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations',
      session: '2026-27',
      board: 'HBSE',
      category: 'Answer Keys',
      status: 'Approved',
      pushedToStudents: false,
      contentSummary: 'Step-wise HBSE board marking allocation and verification checks.',
      createdBy: 'Kavita Sharma',
      aiAssisted: false,
      updatedAt: '2026-11-08',
    },
    {
      id: 'res-5',
      schoolId: 'school-svm-kk',
      title: 'Competency Rubric: Algebraic Reasoning & Presentation',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations',
      session: '2026-27',
      board: 'NCERT/SCERT',
      category: 'Assessments and Rubrics',
      status: 'Draft',
      pushedToStudents: false,
      contentSummary: '4-level rubric mapping problem setup, logical steps, and neatness to OLQ evidence.',
      createdBy: 'Kavita Sharma',
      aiAssisted: true,
      updatedAt: '2026-11-11',
    },
  ];

  const lessonPlans: LessonPlan[] = [
    {
      id: 'lp-1',
      schoolId: 'school-svm-kk',
      level: 'Yearly',
      classSection: '9-A',
      subject: 'Mathematics',
      topic: 'HBSE Annual Curriculum Map (Units I–VII)',
      learningOutcome: 'Complete NCERT/HBSE Class 9 competencies before Feb pre-boards.',
      status: 'In Progress',
      teacherName: 'Kavita Sharma',
      targetDate: '2027-02-15',
    },
    {
      id: 'lp-2',
      schoolId: 'school-svm-kk',
      level: 'Monthly',
      classSection: '9-A',
      subject: 'Mathematics',
      topic: 'November Plan: Linear Equations & Lines and Angles',
      learningOutcome: 'Students construct & interpret 2-variable graphs independently.',
      status: 'In Progress',
      teacherName: 'Kavita Sharma',
      targetDate: '2026-11-30',
    },
    {
      id: 'lp-3',
      schoolId: 'school-svm-kk',
      level: 'Weekly',
      classSection: '9-A',
      subject: 'Mathematics',
      topic: 'Week 46: Graph Plotting & Solution Verification',
      learningOutcome: 'Eliminate sign errors when transposing y = mx + c.',
      status: 'Pending Revision',
      teacherName: 'Kavita Sharma',
      targetDate: '2026-11-16',
    },
    {
      id: 'lp-4',
      schoolId: 'school-svm-kk',
      level: 'Daily',
      classSection: '9-A',
      subject: 'Mathematics',
      topic: 'Period 2: Word Problem Modelling + Notebook Check',
      learningOutcome: 'Translate 3 real-world situations into linear equations.',
      status: 'Calendar Change Requested',
      teacherName: 'Kavita Sharma',
      targetDate: '2026-11-18',
      approvalRequired: true,
    },
  ];

  const timetable: TimetableSlot[] = [
    {
      id: 'tt-1',
      schoolId: 'school-svm-kk',
      day: 'Monday',
      period: 1,
      timeRange: '08:15 – 08:55',
      classSection: '9-A',
      subject: 'Mathematics',
      teacherName: 'Kavita Sharma',
    },
    {
      id: 'tt-2',
      schoolId: 'school-svm-kk',
      day: 'Monday',
      period: 2,
      timeRange: '08:55 – 09:35',
      classSection: '9-A',
      subject: 'Science',
      teacherName: 'Rajesh Verma',
      substitutionTeacher: 'Pooja Rani (Lab Support)',
    },
    {
      id: 'tt-3',
      schoolId: 'school-svm-kk',
      day: 'Monday',
      period: 3,
      timeRange: '09:35 – 10:15',
      classSection: '9-A',
      subject: 'English',
      teacherName: 'Neha Bhatia',
    },
    {
      id: 'tt-4',
      schoolId: 'school-svm-kk',
      day: 'Monday',
      period: 4,
      timeRange: '10:35 – 11:15',
      classSection: '10-B',
      subject: 'Mathematics',
      teacherName: 'Kavita Sharma',
    },
  ];

  const admissionLeads: AdmissionLead[] = [
    {
      id: 'adm-1',
      schoolId: 'school-svm-kk',
      studentName: 'Ishaan Sharma',
      applyingClass: 'Class 6',
      parentName: 'Manoj Sharma',
      phone: '+91 98124 90211',
      email: 'manoj.sharma@gmail.com',
      source: 'Website',
      stage: 'Campus Visit',
      assignedCounsellor: 'Anil Kumar Hooda',
      nextFollowUpDate: '2026-11-16',
      address: 'House 214, Sector 7',
      locality: 'Sector 7, Kurukshetra',
      previousSchool: 'Bal Bharati Public School, Kurukshetra',
      notes: 'Family visited Sector 7 campus; requested HBSE/NCERT syllabus overview.',
      createdAt: '2026-11-10',
      updatedAt: '2026-11-13',
    },
    {
      id: 'adm-2',
      schoolId: 'school-svm-kk',
      studentName: 'Diya Malik',
      applyingClass: 'Class 11 (Commerce)',
      parentName: 'Rakesh Malik',
      phone: '+91 94162 11904',
      email: 'rakesh.malik@yahoo.co.in',
      source: 'Career Portal',
      stage: 'Document Verification',
      assignedCounsellor: 'Dr. Sunita Gill',
      nextFollowUpDate: '2026-11-15',
      address: 'Plot 48, Urban Estate',
      locality: 'Thanesar Urban Estate, Kurukshetra',
      previousSchool: 'D.A.V. Public School, Thanesar',
      notes: 'Submitted Class 10 pre-board marksheet; awaiting TC from previous school.',
      createdAt: '2026-11-08',
      updatedAt: '2026-11-14',
    },
    {
      id: 'adm-4',
      schoolId: 'school-svm-kk',
      studentName: 'Kavya Jindal',
      applyingClass: 'Class 4',
      parentName: 'Neha Jindal',
      phone: '+91 98121 44509',
      email: 'neha.jindal@example.in',
      source: 'Referral',
      stage: 'Follow-up Scheduled',
      assignedCounsellor: 'Kavita Sharma',
      nextFollowUpDate: '2026-11-15',
      address: 'Kothi 19, Pipli Road',
      locality: 'Pipli Road, Kurukshetra',
      previousSchool: 'Little Angels Academy, Pipli',
      notes: 'Referred by Aarav Mehta family; interested in foundational reading and transport.',
      createdAt: '2026-11-11',
      updatedAt: '2026-11-14',
    },
    {
      id: 'adm-5',
      schoolId: 'school-svm-kk',
      studentName: 'Arjun Kaushik',
      applyingClass: 'Class 9',
      parentName: 'Deepak Kaushik',
      phone: '+91 98965 20411',
      email: 'deepak.kaushik@example.in',
      source: 'Walk-in',
      stage: 'Confirmed',
      assignedCounsellor: 'Dr. Meenakshi Deswal',
      nextFollowUpDate: '2026-11-20',
      address: 'House 84, Sector 13',
      locality: 'Sector 13, Kurukshetra',
      previousSchool: 'Geeta Niketan Vidya Mandir',
      notes: 'Admission fee verified and seat confirmed in Section 9-A.',
      createdAt: '2026-11-05',
      updatedAt: '2026-11-12',
    },
    {
      id: 'adm-3',
      schoolId: 'school-dpa-knl',
      studentName: 'Pranav Goel',
      applyingClass: 'Class 8',
      parentName: 'Vikas Goel',
      phone: '+91 98963 70412',
      email: 'vikas.goel@example.in',
      source: 'Walk-in',
      stage: 'New Enquiry',
      assignedCounsellor: 'Harpreet Kaur Sandhu',
      nextFollowUpDate: '2026-11-17',
      address: 'House 302, Model Town',
      locality: 'Model Town, Karnal',
      previousSchool: 'Tagore Bal Niketan, Karnal',
      notes: 'Enquired about Karnal Model Town transport route.',
      createdAt: '2026-11-13',
      updatedAt: '2026-11-13',
    },
    {
      id: 'adm-6',
      schoolId: 'school-dpa-knl',
      studentName: 'Meera Sharma',
      applyingClass: 'Class 6',
      parentName: 'Sandeep Sharma',
      phone: '+91 94168 55210',
      email: 'sandeep.sharma@example.in',
      source: 'Website',
      stage: 'Campus Visit',
      assignedCounsellor: 'Harpreet Kaur Sandhu',
      nextFollowUpDate: '2026-11-16',
      address: 'Sector 12, Part 2',
      locality: 'Sector 12, Karnal',
      previousSchool: 'St. Theresa Convent, Karnal',
      notes: 'Scheduled science lab walkthrough and scholarship briefing.',
      createdAt: '2026-11-12',
      updatedAt: '2026-11-14',
    },
  ];

  const homeVisitRecords: HomeVisitRecord[] = [
    {
      id: 'hv-1',
      schoolId: 'school-svm-kk',
      leadId: 'adm-1',
      studentName: 'Ishaan Sharma',
      applyingClass: 'Class 6',
      parentName: 'Manoj Sharma',
      phone: '+91 98124 90211',
      visitDate: '2026-11-13',
      visitSlot: '10:30 AM – 11:15 AM',
      visitingStaff: 'Anil Kumar Hooda & Kavita Sharma',
      address: 'House 214, Sector 7',
      locality: 'Sector 7, Kurukshetra',
      guardianMet: 'Manoj Sharma (Father) & Sunita Sharma (Mother)',
      homeEnvironmentSummary:
        'Quiet dedicated study desk with natural light; family maintains regular evening reading routine.',
      learningSupportNotes:
        'Mother supervises homework for 45 mins daily; student enjoys science puzzles and Olympiad drills.',
      transportOrFeeNotes:
        'Requires Sector 7 morning bus pickup; family comfortable with standard quarterly fee cycle.',
      status: 'Completed',
      outcome: 'Proceed to Admission',
      createdAt: '2026-11-12',
      updatedAt: '2026-11-13',
    },
    {
      id: 'hv-2',
      schoolId: 'school-svm-kk',
      leadId: 'adm-2',
      studentName: 'Diya Malik',
      applyingClass: 'Class 11 (Commerce)',
      parentName: 'Rakesh Malik',
      phone: '+91 94162 11904',
      visitDate: '2026-11-16',
      visitSlot: '04:00 PM – 04:45 PM',
      visitingStaff: 'Dr. Sunita Gill',
      address: 'Plot 48, Urban Estate',
      locality: 'Thanesar Urban Estate, Kurukshetra',
      guardianMet: 'Rakesh Malik (Father)',
      homeEnvironmentSummary:
        'Scheduled pre-admission home interaction to align Class 11 Commerce + Applied Maths expectations.',
      learningSupportNotes:
        'Strong Accountancy and economics interest flagged during Career Portal briefing.',
      transportOrFeeNotes: 'Parent asked about merit concession for 90%+ Class 10 board score.',
      status: 'Scheduled',
      outcome: 'Scholarship / Fee Review',
      createdAt: '2026-11-14',
      updatedAt: '2026-11-14',
    },
    {
      id: 'hv-3',
      schoolId: 'school-svm-kk',
      leadId: 'adm-4',
      studentName: 'Kavya Jindal',
      applyingClass: 'Class 4',
      parentName: 'Neha Jindal',
      phone: '+91 98121 44509',
      visitDate: '2026-11-17',
      visitSlot: '11:00 AM – 11:45 AM',
      visitingStaff: 'Kavita Sharma',
      address: 'Kothi 19, Pipli Road',
      locality: 'Pipli Road, Kurukshetra',
      guardianMet: 'Neha Jindal (Mother)',
      homeEnvironmentSummary:
        'Rescheduled by parent from Friday due to out-of-station travel; morning slot confirmed.',
      learningSupportNotes:
        'Mother requested guided English phonics & reading fluency readiness interaction.',
      transportOrFeeNotes: 'Verify Pipli Road Bus Route R-02 stop timing.',
      status: 'Rescheduled',
      outcome: 'Follow-up Visit Needed',
      createdAt: '2026-11-12',
      updatedAt: '2026-11-14',
    },
    {
      id: 'hv-4',
      schoolId: 'school-dpa-knl',
      leadId: 'adm-3',
      studentName: 'Pranav Goel',
      applyingClass: 'Class 8',
      parentName: 'Vikas Goel',
      phone: '+91 98963 70412',
      visitDate: '2026-11-18',
      visitSlot: '03:30 PM – 04:15 PM',
      visitingStaff: 'Harpreet Kaur Sandhu',
      address: 'House 302, Model Town',
      locality: 'Model Town, Karnal',
      guardianMet: 'Vikas Goel (Father)',
      homeEnvironmentSummary:
        'Initial home outreach visit scheduled to review study routine and daily commute logistics.',
      learningSupportNotes: 'Assess Class 8 Mathematics transition readiness during home check-in.',
      transportOrFeeNotes: 'Model Town bus stop proximity confirmation.',
      status: 'Scheduled',
      outcome: 'Proceed to Admission',
      createdAt: '2026-11-14',
      updatedAt: '2026-11-14',
    },
  ];

  const careerRequests: CareerCounsellingRequest[] = [
    {
      id: 'cc-1',
      schoolId: null,
      applicantName: 'Riya Deshmukh',
      category: 'School Student',
      email: 'riya.d@example.in',
      phone: '+91 98129 33019',
      currentStage: 'Class 10 (HBSE) · Choosing Class 11 Stream',
      interests: ['Economics', 'Applied Mathematics', 'Public Policy'],
      strengths: 'Strong essay writing, data interpretation, and school debate participation',
      goalSummary: 'Deciding between Commerce with Applied Maths vs Humanities with Economics for CUET & Civil Services foundation.',
      preferredSlot: '2026-11-18 16:00 IST',
      assignedCounsellor: 'Dr. Sunita Gill',
      status: 'Report Reviewed',
      aiAdvisoryReport:
        'Advisory Summary: Both Commerce with Applied Mathematics and Humanities with Economics keep Delhi University (CUET), Economics Honours, and Public Policy degrees open. Taking Applied Mathematics keeps B.A. (Hons) Economics eligibility intact across central universities. Recommended next step: 1-on-1 stream mapping session with Dr. Sunita Gill.',
      counsellorReviewNote: 'Reviewed & approved by Dr. Sunita Gill — discussed CUET subject mapping with parents.',
      createdAt: '2026-11-10',
    },
    {
      id: 'cc-2',
      schoolId: 'school-svm-kk',
      applicantName: 'Simranjeet Kaur',
      category: 'School Student',
      email: 'simran.kaur@svm-kurukshetra.edu.in',
      phone: '+91 98960 33108',
      currentStage: 'Class 10-B · Legal Studies & Economics Exploration',
      interests: ['Law (CLAT)', 'Economics', 'Journalism'],
      strengths: 'Consistent reading comprehension and top 5% academic consistency',
      goalSummary: 'Exploring 5-year integrated BA LLB (NLUs) vs Honours degrees.',
      preferredSlot: '2026-11-19 15:30 IST',
      assignedCounsellor: 'Dr. Sunita Gill',
      status: 'Session Scheduled',
      createdAt: '2026-11-12',
    },
  ];

  const feeTransactions: FeeTransaction[] = [
    {
      id: 'fee-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      studentName: 'Aarav Mehta',
      classSection: '9-A',
      schedule: 'Quarterly',
      amountDueInr: 9500,
      concessionInr: 0,
      amountPaidInr: 5000,
      receiptNo: 'RCP-SVM-2611',
      status: 'Partial',
      paidDate: '2026-10-15',
    },
    {
      id: 'fee-2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      studentName: 'Ananya Verma',
      classSection: '9-A',
      schedule: 'Quarterly',
      amountDueInr: 9500,
      concessionInr: 1000,
      amountPaidInr: 8500,
      receiptNo: 'RCP-SVM-2614',
      status: 'Paid',
      paidDate: '2026-10-12',
    },
    {
      id: 'fee-3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      studentName: 'Rohan Chauhan',
      classSection: '9-A',
      schedule: 'Quarterly',
      amountDueInr: 9500,
      concessionInr: 0,
      amountPaidInr: 0,
      receiptNo: 'PENDING',
      status: 'Pending',
      paidDate: '-',
    },
    {
      id: 'fee-4',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      studentName: 'Kabir Malhotra',
      classSection: '11-Science',
      schedule: 'Quarterly',
      amountDueInr: 11500,
      concessionInr: 0,
      amountPaidInr: 5500,
      receiptNo: 'RCP-DPA-1102',
      status: 'Partial',
      paidDate: '2026-10-18',
    },
  ];

  const operations: OperationalItem[] = [
    {
      id: 'op-1',
      schoolId: 'school-svm-kk',
      module: 'Transport',
      title: 'Route 04 — Pipli · Sector 7 · Campus',
      detail: 'Bus HR-07-PA-4112 · 38/42 seats allotted · GPS verified',
      ownerOrRoute: 'Driver: Mahender Singh',
      status: 'Active',
      date: '2026-11-14',
    },
    {
      id: 'op-2',
      schoolId: 'school-svm-kk',
      module: 'Library',
      title: 'NCERT Exemplar & Reference Section Stock',
      detail: '3,420 catalogued volumes · 46 active student issues this week',
      ownerOrRoute: 'Librarian: Asha Rani',
      status: 'Catalogued',
      date: '2026-11-12',
    },
    {
      id: 'op-3',
      schoolId: 'school-svm-kk',
      module: 'Inventory',
      title: 'Physics Optical Bench & Titration Kits',
      detail: '24/24 sets verified for Class 9–12 practicals',
      ownerOrRoute: 'Lab Storekeeper: Vinod Kumar',
      status: 'Verified',
      date: '2026-11-10',
    },
    {
      id: 'op-4',
      schoolId: 'school-svm-kk',
      module: 'Sports',
      title: 'Annual Inter-House Athletics & Kho-Kho League',
      detail: 'Shakti, Pragati, and Tejas Houses · 142 student participants',
      ownerOrRoute: 'Coach: Satpal Malik',
      status: 'In Progress',
      date: '2026-11-20',
    },
    {
      id: 'op-5',
      schoolId: 'school-svm-kk',
      module: 'Complaints',
      title: 'Water Cooler Filter Servicing — Wing B Corridor',
      detail: 'Reported by Class 9-A floor monitor; maintenance ticket assigned.',
      ownerOrRoute: 'Estate Manager: Ramesh Kumar',
      status: 'Open',
      date: '2026-11-13',
    },
  ];

  const blogArticles: BlogArticle[] = [
    {
      id: 'blog-1',
      title: 'Why Notebook Handwriting and Independent Attempts Tell Us More Than Marks Alone',
      slug: 'notebook-evidence-beyond-marks',
      category: 'OLQs & Student Development',
      author: 'Dr. Meenakshi Deswal',
      readTime: '5 min read',
      status: 'Published',
      publishedDate: '2026-11-08',
      excerpt:
        'How a single 30-second whole-class notebook check generates structured evidence for Organising Ability, Power of Expression, and Determination without extra teacher paperwork.',
      body:
        'In Indian classrooms, teachers already inspect dozens of notebooks every afternoon. Yet those observations usually stay inked on paper and are forgotten before parent-teacher meetings. In Virat Student 360°, recording Readability and Work Quality (A: independent and correct, B: independent attempt with mistakes, C: requires review) links everyday classroom effort directly to Planning, Organising, and Dynamic Qualities—while ensuring an honest mistake in an independent attempt is valued as Determination rather than penalised.',
    },
    {
      id: 'blog-2',
      title: 'Choosing Class 11 Streams in Haryana & North India: Avoiding Peer-Pressure Decisions',
      slug: 'choosing-class-11-streams-north-india',
      category: 'Career Guidance',
      author: 'Dr. Sunita Gill',
      readTime: '6 min read',
      status: 'Published',
      publishedDate: '2026-11-03',
      excerpt:
        'A practical framework combining CUET subject eligibility, student interest consistency, and counsellor review for Class 10 students and parents.',
      body:
        'Every April, thousands of Class 10 students select Science, Commerce, or Humanities based on hearsay rather than aptitude and university eligibility. Our advisory framework pairs evidence of sustained reasoning and curiosity with current CUET, JEE, NEET, CLAT, and NDA pathways—always reviewed by a human career counsellor before finalising recommendations.',
    },
    {
      id: 'blog-3',
      title: 'Fair Assessment Without Labels: Moving Beyond "Active vs Passive" Student Tags',
      slug: 'fair-assessment-without-labels',
      category: 'Educational Psychology',
      author: 'Anil Kumar Hooda',
      readTime: '4 min read',
      status: 'Published',
      publishedDate: '2026-10-27',
      excerpt:
        'Why quiet, reflective learners thrive when schools evaluate written curiosity, mistake recovery, and missing-evidence safeguards fairly.',
      body:
        'Labelling a quiet student as "passive" can follow them across academic years and undermine confidence. Virat Student 360° prohibits permanent labels, never treats missing evidence as zero, and separates attendance context from personality indicators.',
    },
  ];

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      schoolId: 'school-svm-kk',
      actorName: 'Dr. Meenakshi Deswal',
      actorRole: 'principal',
      action: 'APPROVED_LEARNERS_FORMULA',
      entityType: 'LearnersWeights',
      entityId: 'v1.2',
      timestamp: '2026-11-01T10:15:00Z',
      detail: 'Validated formula v1.2 (Academic 35%, OLQ 30%, Learning Habits 15%, Participation 10%, Personal Growth 10%).',
    },
    {
      id: 'aud-2',
      schoolId: 'school-svm-kk',
      actorName: 'Kavita Sharma',
      actorRole: 'teacher',
      action: 'RECORDED_NOTEBOOK_BATCH',
      entityType: 'NotebookEntry',
      entityId: '9-A-Math-Ch3',
      timestamp: '2026-11-10T14:20:00Z',
      detail: 'Logged Class 9-A Mathematics Ch. 3 notebook check (3 students) and synced OLQ evidence.',
    },
  ];

  const publicEnquiries: PublicEnquiry[] = [
    {
      id: 'enq-1',
      type: 'School Demo & Onboarding',
      schoolOrOrgName: 'Guru Nanak Khalsa Senior Secondary, Yamunanagar',
      contactName: 'Principal Kuldeep Singh',
      email: 'principal@gnk-ynr.edu.in',
      phone: '+91 98125 00192',
      cityState: 'Yamunanagar, Haryana',
      board: 'HBSE',
      message: 'Interested in piloting Student 360° OLQ assessment and Haryana MIS document tracking for 900 students.',
      createdAt: '2026-11-11',
    },
  ];

  const cognitiveAttempts: CognitiveAttemptRecord[] = [
    {
      id: 'cog-seed-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      gameId: 'target-finder',
      category: 'Visual Attention',
      difficultyLevel: 3,
      accuracyPct: 78,
      completionTimeSec: 34,
      reactionTimeMs: 740,
      errorCount: 2,
      scorePoints: 78,
      completed: true,
      challengeTag: 'practice',
      playedAt: '2026-11-10T15:10:00Z',
    },
    {
      id: 'cog-seed-2',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      gameId: 'memory-match',
      category: 'Memory Training',
      difficultyLevel: 4,
      accuracyPct: 88,
      completionTimeSec: 29,
      reactionTimeMs: null,
      errorCount: 1,
      scorePoints: 88,
      completed: true,
      challengeTag: 'weekly',
      playedAt: '2026-11-12T16:00:00Z',
    },
    {
      id: 'cog-seed-3',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      gameId: 'number-detective',
      category: 'Logical Thinking',
      difficultyLevel: 4,
      accuracyPct: 92,
      completionTimeSec: 26,
      reactionTimeMs: null,
      errorCount: 1,
      scorePoints: 92,
      completed: true,
      challengeTag: 'assigned',
      playedAt: '2026-11-13T17:15:00Z',
    },
    {
      id: 'cog-seed-4',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-102',
      gameId: 'pattern-detective',
      category: 'Perception Training',
      difficultyLevel: 4,
      accuracyPct: 95,
      completionTimeSec: 24,
      reactionTimeMs: null,
      errorCount: 0,
      scorePoints: 95,
      completed: true,
      challengeTag: 'practice',
      playedAt: '2026-11-12T14:20:00Z',
    },
    {
      id: 'cog-seed-5',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      gameId: 'go-no-go',
      category: 'Response Control',
      difficultyLevel: 3,
      accuracyPct: 82,
      completionTimeSec: 22,
      reactionTimeMs: 495,
      errorCount: 2,
      scorePoints: 82,
      completed: true,
      challengeTag: 'assigned',
      playedAt: '2026-11-13T11:30:00Z',
    },
    {
      id: 'cog-seed-6',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      gameId: 'sudoku-challenge',
      category: 'Logical Thinking',
      difficultyLevel: 4,
      accuracyPct: 90,
      completionTimeSec: 52,
      reactionTimeMs: null,
      errorCount: 1,
      scorePoints: 90,
      completed: true,
      challengeTag: 'practice',
      playedAt: '2026-11-12T16:45:00Z',
    },
  ];

  const cognitiveAssignments: CognitiveAssignment[] = [
    {
      id: 'cassign-1',
      schoolId: 'school-svm-kk',
      gameId: 'colour-conflict',
      targetClassSection: '9-A',
      recommendedLevel: 4,
      teacherName: 'Kavita Sharma',
      dueDate: '2026-11-20',
      note: 'Recommended 5-minute impulse & selective attention warm-up before Mathematics tests.',
      createdAt: '2026-11-13',
    },
    {
      id: 'cassign-2',
      schoolId: 'school-svm-kk',
      gameId: 'sequence-recall',
      targetClassSection: '9-A',
      recommendedLevel: 4,
      teacherName: 'Anil Kumar Hooda',
      dueDate: '2026-11-22',
      note: 'Working memory practice for multi-step geometry proofs.',
      createdAt: '2026-11-14',
    },
    {
      id: 'cassign-3',
      schoolId: 'school-dpa-knl',
      gameId: 'pattern-detective',
      targetClassSection: '10-A',
      recommendedLevel: 4,
      teacherName: 'Harpreet Kaur Sandhu',
      dueDate: '2026-11-21',
      note: 'Visual reasoning practice for NCERT Science & Maths analytical items.',
      createdAt: '2026-11-14',
    },
  ];

  const developmentReviews: DevelopmentReviewItem[] = [
    {
      id: 'devrev-seed-1',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      studentName: 'Rohan Chauhan',
      classSection: '9-A',
      sourceType: 'notebook_work_quality_c',
      sourceId: 'nb-seed-3',
      sourceKey: 'nb:stu-svm-103:2026-11-10:mathematics:ch. 3: coordinate geometry',
      subject: 'Mathematics',
      chapter: 'Ch. 3: Coordinate Geometry',
      summary:
        'Work Quality C & Homework Not Complete flagged for gentle one-on-one concept verification (non-labelling review).',
      status: 'Pending',
      decisionNote: '',
      openedBy: 'Kavita Sharma',
      createdAt: '2026-11-10',
    },
    {
      id: 'devrev-seed-2',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      studentName: 'Kabir Gill',
      classSection: '11-Science',
      sourceType: 'observation_conflict',
      sourceId: 'ev-dpa-201',
      subject: 'Physics',
      chapter: 'Ch. 5: Laws of Motion',
      summary: 'Strong written test performance vs. hesitation in oral lab Viva—verify comfort in small groups.',
      status: 'Confirmed',
      decisionNote: 'Confirmed supportive small-group lab briefing; no penalty applied.',
      openedBy: 'Harpreet Kaur Sandhu',
      decidedBy: 'Harpreet Kaur Sandhu',
      decidedAt: '2026-11-11',
      createdAt: '2026-11-10',
    },
  ];

  const parentComplaints: ParentComplaint[] = [
    {
      id: 'cmp-seed-1',
      refNo: 'CMP-2026-0101',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      studentName: 'Aarav Mehta',
      classSection: '9-A',
      parentName: 'Suresh Mehta',
      category: 'Transport',
      title: 'Evening bus arrival 15 mins delayed at Sector 7 drop point',
      description:
        'Bus Route #3 (Pipli–Sector 7) dropped students at 2:40 PM on 11 Nov instead of 2:25 PM without prior SMS intimation.',
      priority: 'Urgent',
      status: 'Investigating',
      assignedCoordinator: 'Anil Kumar Hooda',
      internalStaffNote:
        'Checked GPS log with driver Rajesh: traffic diversion near railway crossing; adding live alert trigger.',
      resolutionNote:
        'Transport Coordinator has reviewed the Sector 7 route timing and activated automated 10-minute delay alerts.',
      createdAt: '2026-11-11',
      updatedAt: '2026-11-13',
    },
    {
      id: 'cmp-seed-2',
      refNo: 'CMP-2026-0102',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      studentName: 'Rohan Chauhan',
      classSection: '9-A',
      parentName: 'Balwinder Chauhan',
      category: 'Academic',
      title: 'Request extra guided Mathematics practice after Kho-Kho tournament leave',
      description:
        'Rohan missed two Coordinate Geometry periods for the district tournament and needs revision sheet support.',
      priority: 'Standard',
      status: 'New',
      assignedCoordinator: '',
      internalStaffNote: 'Coordinate with Kavita Sharma for after-assembly remedial sheet.',
      resolutionNote: '',
      createdAt: '2026-11-14',
      updatedAt: '2026-11-14',
    },
    {
      id: 'cmp-seed-3',
      refNo: 'CMP-2026-0103',
      schoolId: 'school-dpa-knl',
      studentId: 'stu-dpa-201',
      studentName: 'Kabir Gill',
      classSection: '11-Science',
      parentName: 'Maninder Gill',
      category: 'Infrastructure',
      title: 'Physics lab voltmeter calibration notice',
      description: 'Two bench meters in Lab B gave inconsistent readings during Ohm’s law practical.',
      priority: 'Standard',
      status: 'Resolved',
      assignedCoordinator: 'Harpreet Kaur Sandhu',
      internalStaffNote: 'Replaced two analogue meters from spare inventory.',
      resolutionNote: 'Both lab bench voltmeters calibrated and replaced on 12 Nov.',
      parentFeedback: 'Verified with Kabir—working properly now. Thank you.',
      createdAt: '2026-11-10',
      updatedAt: '2026-11-12',
    },
  ];

  const homeworkAssignments: HomeworkAssignment[] = [
    ...VIS_HOMEWORK_ASSIGNMENTS,
    {
      id: 'hw-svm-1',
      schoolId: 'school-svm-kk',
      classSection: '9-A',
      subject: 'Mathematics',
      chapter: 'Ch. 4: Linear Equations in Two Variables',
      title: 'Graphical Solutions Set A (Ex. 4.3)',
      instructions: 'Plot any 3 linear equations cleanly on graph paper with scale & intercepts.',
      assignedDate: '2026-11-12',
      dueDate: '2026-11-16',
      status: 'Active',
      createdBy: 'Kavita Sharma',
      updatedAt: '2026-11-14',
    },
  ];

  const svmSubmissions: HomeworkSubmission[] = [
    {
      id: 'hwsub-svm-1',
      schoolId: 'school-svm-kk',
      assignmentId: 'hw-svm-1',
      studentId: 'stu-svm-101',
      status: 'Handed In',
      feedback: 'Accurate plotting & scale labels.',
      markedBy: 'Kavita Sharma',
      markedAt: '2026-11-14',
    },
    {
      id: 'hwsub-svm-2',
      schoolId: 'school-svm-kk',
      assignmentId: 'hw-svm-1',
      studentId: 'stu-svm-102',
      status: 'Pending',
      feedback: '',
      markedBy: 'Kavita Sharma',
      markedAt: '2026-11-14',
    },
    {
      id: 'hwsub-svm-3',
      schoolId: 'school-svm-kk',
      assignmentId: 'hw-svm-1',
      studentId: 'stu-svm-103',
      status: 'Pending',
      feedback: '',
      markedBy: 'Kavita Sharma',
      markedAt: '2026-11-14',
    },
  ];

  const homeworkSubmissions: HomeworkSubmission[] = [...VIS_HOMEWORK_SUBMISSIONS, ...svmSubmissions];

  const svmActivities: ActivityRecord[] = [
    {
      id: 'act-svm-1',
      schoolId: 'school-svm-kk',
      classSection: '9-A',
      kind: 'group',
      title: 'Coordinate Geometry Graph Board Relay',
      date: '2026-11-13',
      recordedBy: 'Kavita Sharma',
      entries: [
        { studentId: 'stu-svm-101', tookPart: true, contributionLevel: 4, note: 'Guided quadrant checks for team.' },
        { studentId: 'stu-svm-102', tookPart: true, contributionLevel: 3, note: 'Plotted coordinates accurately.' },
        { studentId: 'stu-svm-103', tookPart: false, note: 'Away on District Kho-Kho Meet leave.' },
      ],
    },
  ];
  const activityRecords: ActivityRecord[] = [...VIS_ACTIVITIES, ...svmActivities];

  const svmDerivedEvidence: DevelopmentEvidence[] = [];
  for (const sub of svmSubmissions) {
    const asg = homeworkAssignments.find((a) => a.id === sub.assignmentId);
    if (!asg) continue;
    const ev = mapHomeworkSubmissionToEvidence(asg, sub);
    if (ev) svmDerivedEvidence.push(ev);
  }
  for (const act of svmActivities) {
    for (const entry of act.entries) {
      const ev = mapActivityParticipationToEvidence(act, entry);
      if (ev) svmDerivedEvidence.push(ev);
    }
  }

  const allUsers = [...VIS_USERS, ...users];
  const allStudents = [...VIS_STUDENTS, ...students];
  const allFeeTransactions = [...VIS_FEES, ...feeTransactions];
  const initialFinance = loadInitialFinancialState(allStudents, allFeeTransactions, [], allUsers);

  const allAttendance = [...VIS_ATTENDANCE, ...attendance];
  const schoolById = new Map(schools.map((s) => [s.id, s]));
  const studentById = new Map(allStudents.map((s) => [s.id, s]));
  const seedTargetStudentIds = new Set([
    'stu-vis-601',
    'stu-vis-602',
    'stu-vis-901',
    'stu-vis-1001',
    'stu-svm-101',
    'stu-svm-102',
    'stu-svm-103',
  ]);
  const initialNotifications: ParentAttendanceNotification[] = [];
  const seenNotifIds = new Set<string>();
  for (const att of allAttendance) {
    if (!seedTargetStudentIds.has(att.studentId) && att.status === 'Present') continue;
    const st = studentById.get(att.studentId);
    const sc = schoolById.get(att.schoolId);
    if (!st || !sc) continue;
    const msg = composeParentAttendanceMessage({
      schoolId: sc.id,
      schoolName: sc.name,
      student: st,
      date: att.date,
      status: att.status,
      contextNote: att.contextNote,
      sentBy: att.correctedBy || 'Class Teacher',
      sentByRole: 'teacher',
      sentAt: `${att.date}T03:15:00.000Z`,
    });
    if (!seenNotifIds.has(msg.id)) {
      seenNotifIds.add(msg.id);
      if (att.date === '2026-11-12') {
        msg.readByParent = true;
        msg.readAt = `${att.date}T05:10:00.000Z`;
        msg.acknowledgedByParent = true;
        msg.acknowledgedAt = `${att.date}T05:10:00.000Z`;
      }
      initialNotifications.push(msg);
    }
  }

  const allNotebookEntries: NotebookEntry[] = [...VIS_NOTEBOOK_ENTRIES, ...notebookEntries];
  const initialNotebookNotifications: NotebookIncompleteNotification[] = [];
  const seenNbAlertIds = new Set<string>();
  for (const nb of allNotebookEntries) {
    if (!shouldTriggerNotebookIncompleteAlert(nb)) continue;
    const st = studentById.get(nb.studentId);
    const sc = schoolById.get(nb.schoolId);
    if (!st || !sc) continue;
    const alert = composeNotebookIncompleteAlert({
      schoolId: sc.id,
      schoolName: sc.name,
      student: st,
      entry: nb,
      triggeredBy: nb.teacherName || 'Subject Teacher',
      triggeredByRole: 'teacher',
      triggeredAt: `${nb.date}T06:45:00.000Z`,
    });
    if (!seenNbAlertIds.has(alert.id)) {
      seenNbAlertIds.add(alert.id);
      initialNotebookNotifications.push(alert);
    }
  }

  // Auto-seed Prior-Chapter Backlog alerts (e.g., Teacher started Ch. 3+ while Ch. 1 still Not Checked)
  for (const sc of schools) {
    const scStudents = allStudents.filter((s) => s.schoolId === sc.id);
    const scNotebooks = allNotebookEntries.filter((n) => n.schoolId === sc.id);
    const scHw = homeworkAssignments.filter((h) => h.schoolId === sc.id);
    const scLp = [...VIS_LESSON_PLANS, ...lessonPlans].filter((l) => l.schoolId === sc.id);
    const pendingHighlights = computePendingCheckingHighlights({
      students: scStudents,
      notebookEntries: scNotebooks,
      homeworkAssignments: scHw,
      lessonPlans: scLp,
    });
    for (const rec of pendingHighlights.rankedStudents) {
      const st = studentById.get(rec.studentId);
      if (!st) continue;
      for (const gap of rec.priorChapterGaps) {
        const gapAlert = composePriorChapterBacklogAlert({
          schoolId: sc.id,
          schoolName: sc.name,
          student: st,
          gap,
          triggeredBy: 'Academic Checking Monitor',
          triggeredByRole: 'system',
          triggeredAt: `${gap.referenceDate}T07:15:00.000Z`,
        });
        if (!seenNbAlertIds.has(gapAlert.id)) {
          seenNbAlertIds.add(gapAlert.id);
          initialNotebookNotifications.push(gapAlert);
        }
      }
    }
  }

  const partnerStudents = allStudents.filter((s) => s.schoolId !== 'school-vis-jjr');
  const partnerReadingReports: MonthlyReadingReport[] = [];
  const partnerNumeracyReports: MonthlyNumeracyReport[] = [];

  partnerStudents.forEach((st, idx) => {
    const classTargetWpm = st.classSection.startsWith('11') ? 132 : st.classSection.startsWith('10') ? 124 : 114;
    const baseWpm = classTargetWpm - 26 + ((idx * 7) % 14);
    const wpmStep = 2 + (idx % 3); // distinct growth trajectories across peers
    const baseReadAcc = 72 + ((idx * 5) % 12);
    const accStep = 1.4 + (idx % 4) * 0.6;
    const baseTables = 68 + ((idx * 6) % 14);
    const tablesStep = 1.8 + ((idx + 1) % 3) * 0.8;
    const baseMental = 70 + ((idx * 4) % 12);
    const mentalStep = 1.5 + (idx % 3) * 0.7;

    ACTIVE_SESSION_MONTHS.forEach((month, mIdx) => {
      const wpm = Math.round(baseWpm + wpmStep * mIdx);
      const accuracyPct = Math.min(98, Math.round((baseReadAcc + accStep * mIdx) * 10) / 10);
      const comprehensionPct = Math.min(96, Math.round((baseReadAcc + 2 + accStep * 0.9 * mIdx) * 10) / 10);
      const readingOverall = Math.min(
        98,
        Math.round((Math.min(100, (wpm / classTargetWpm) * 100) * 0.35 + accuracyPct * 0.35 + comprehensionPct * 0.3) * 10) / 10,
      );
      partnerReadingReports.push({
        id: `read-partner-${st.id}-${month.toLowerCase()}`,
        schoolId: st.schoolId,
        studentId: st.id,
        month,
        year: 2026,
        wpm,
        accuracyPct,
        comprehensionPct,
        overallPct: readingOverall,
        readingBand: computeReadingBand(readingOverall),
        remarks: mIdx >= 6 ? 'Steady fluency & accuracy progression across monthly reads.' : 'Building pacing and phrasing fluency.',
        assessedBy: 'Class Language Mentor',
        assessedAt: `2026-${String(mIdx + 4).padStart(2, '0')}-18`,
      });

      const tablesFluencyPct = Math.min(98, Math.round((baseTables + tablesStep * mIdx) * 10) / 10);
      const mentalMathPct = Math.min(97, Math.round((baseMental + mentalStep * mIdx) * 10) / 10);
      const problemSolvingPct = Math.min(95, Math.round((baseMental + 1 + mentalStep * 0.85 * mIdx) * 10) / 10);
      const numeracyOverall = Math.round(
        (tablesFluencyPct * 0.4 + mentalMathPct * 0.3 + problemSolvingPct * 0.3) * 10,
      ) / 10;
      partnerNumeracyReports.push({
        id: `num-partner-${st.id}-${month.toLowerCase()}`,
        schoolId: st.schoolId,
        studentId: st.id,
        month,
        year: 2026,
        tablesFluencyPct,
        mentalMathPct,
        problemSolvingPct,
        overallPct: numeracyOverall,
        conceptualGap: tablesFluencyPct < 75 ? 'Timed multi-step recall speed' : undefined,
        remarks: mIdx >= 6 ? 'Consistent tables speed & calculation accuracy gain.' : 'Timed tables practice active.',
        assessedBy: 'Mathematics Faculty',
        assessedAt: `2026-${String(mIdx + 4).padStart(2, '0')}-19`,
      });
    });
  });

  const initialReadingTestSessions: ReadingTestSession[] = [
    {
      id: 'rts-seed-vis-601-oct',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-vis-601',
      month: 'October',
      year: 2026,
      passageId: 'middle-water-conservation',
      passageTitle: 'Rainwater Harvesting in Haryana',
      classTier: 'class_6_8',
      captureMode: 'microphone',
      wordsRead: 64,
      totalPassageWords: 66,
      elapsedSeconds: 34,
      wpm: 113,
      pronunciationPct: 89,
      accuracyPct: 89,
      avgBurstWords: 4.8,
      maxBurstWords: 11,
      burstOneWordPct: 8,
      burstTwoWordsPct: 14,
      burstThreePlusPct: 48,
      burstWholeSentencePct: 30,
      dominantFluencyStyle: 'Phrase Reader (3+ words/go)',
      comprehensionPct: 86,
      translationPct: 84,
      overallPct: 88,
      readingBand: 'Fluent',
      mispronouncedWords: [
        {
          expectedWord: 'aquifers',
          spokenAs: 'aquifirs',
          difficultyTier: 'challenge',
          phoneticHint: 'ak-wih-furz',
        },
      ],
      translationPrompt: 'Clean groundwater recharges community wells across Jhajjar.',
      studentTranslation: 'स्वच्छ भूजल झज्जर के सामुदायिक कुओं को पुनः भरता है।',
      assessedBy: 'Pooja Dhillon (teacher)',
      assessedAt: '2026-10-21',
    },
    {
      id: 'rts-seed-vis-601-nov',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-vis-601',
      month: 'November',
      year: 2026,
      passageId: 'middle-solar-microgrids',
      passageTitle: 'Community Solar Microgrids',
      classTier: 'class_6_8',
      captureMode: 'microphone',
      wordsRead: 72,
      totalPassageWords: 72,
      elapsedSeconds: 34,
      wpm: 127,
      pronunciationPct: 93,
      accuracyPct: 93,
      avgBurstWords: 6.4,
      maxBurstWords: 14,
      burstOneWordPct: 4,
      burstTwoWordsPct: 8,
      burstThreePlusPct: 42,
      burstWholeSentencePct: 46,
      dominantFluencyStyle: 'Whole-Sentence Fluent',
      comprehensionPct: 92,
      translationPct: 90,
      overallPct: 92,
      readingBand: 'Fluent',
      mispronouncedWords: [],
      translationPrompt: 'Solar panels power village science labs cleanly.',
      studentTranslation: 'सौर पैनल गाँव की विज्ञान प्रयोगशालाओं को स्वच्छ ऊर्जा देते हैं।',
      assessedBy: 'Abhiraj (student)',
      assessedAt: '2026-11-12',
    },
    {
      id: 'rts-seed-vis-301-nov',
      schoolId: 'school-vis-jjr',
      studentId: 'stu-vis-301',
      month: 'November',
      year: 2026,
      passageId: 'primary-banyan-ecosystem',
      passageTitle: 'Life Under the Banyan Tree',
      classTier: 'class_3_5',
      captureMode: 'assisted_pacer',
      wordsRead: 42,
      totalPassageWords: 48,
      elapsedSeconds: 34,
      wpm: 74,
      pronunciationPct: 62,
      accuracyPct: 61,
      avgBurstWords: 1.7,
      maxBurstWords: 4,
      burstOneWordPct: 54,
      burstTwoWordsPct: 30,
      burstThreePlusPct: 16,
      burstWholeSentencePct: 0,
      dominantFluencyStyle: 'Word-by-Word (1 word/go)',
      comprehensionPct: 65,
      translationPct: 60,
      overallPct: 62,
      readingBand: 'Developing',
      mispronouncedWords: [
        {
          expectedWord: 'sheltered',
          spokenAs: 'sheltard',
          difficultyTier: 'moderate',
          phoneticHint: 'shel-terd',
        },
        {
          expectedWord: 'pollinators',
          spokenAs: 'polinaters',
          difficultyTier: 'challenge',
          phoneticHint: 'pol-uh-nay-terz',
        },
      ],
      translationPrompt: 'Birds build nests inside the wide banyan branches.',
      studentTranslation: 'पक्षी बरगद की चौड़ी डालियों में घोंसले बनाते हैं।',
      assessedBy: 'Class 3 Mentor (teacher)',
      assessedAt: '2026-11-11',
    },
    {
      id: 'rts-seed-svm-101-oct',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      month: 'October',
      year: 2026,
      passageId: 'secondary-isro-telemetry',
      passageTitle: 'ISRO Orbital Navigation Systems',
      classTier: 'class_9_10',
      captureMode: 'microphone',
      wordsRead: 82,
      totalPassageWords: 84,
      elapsedSeconds: 37,
      wpm: 133,
      pronunciationPct: 90,
      accuracyPct: 90,
      avgBurstWords: 6.1,
      maxBurstWords: 15,
      burstOneWordPct: 5,
      burstTwoWordsPct: 10,
      burstThreePlusPct: 45,
      burstWholeSentencePct: 40,
      dominantFluencyStyle: 'Phrase Reader (3+ words/go)',
      comprehensionPct: 88,
      translationPct: 86,
      overallPct: 89,
      readingBand: 'Fluent',
      mispronouncedWords: [],
      translationPrompt: 'Accurate orbital trajectories save satellite fuel.',
      studentTranslation: 'सटीक कक्षीय पथ उपग्रह ईंधन की बचत करते हैं।',
      assessedBy: 'Kavita Sharma (teacher)',
      assessedAt: '2026-10-20',
    },
    {
      id: 'rts-seed-svm-101-nov',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-101',
      month: 'November',
      year: 2026,
      passageId: 'secondary-constitutional-ethics',
      passageTitle: 'Civic Responsibility in Modern India',
      classTier: 'class_9_10',
      captureMode: 'microphone',
      wordsRead: 88,
      totalPassageWords: 88,
      elapsedSeconds: 36,
      wpm: 147,
      pronunciationPct: 95,
      accuracyPct: 95,
      avgBurstWords: 8.2,
      maxBurstWords: 16,
      burstOneWordPct: 0,
      burstTwoWordsPct: 8,
      burstThreePlusPct: 37,
      burstWholeSentencePct: 55,
      dominantFluencyStyle: 'Whole-Sentence Fluent',
      comprehensionPct: 94,
      translationPct: 92,
      overallPct: 94,
      readingBand: 'Fluent',
      mispronouncedWords: [],
      translationPrompt: 'Informed citizens strengthen local school governance.',
      studentTranslation: 'जागरूक नागरिक स्थानीय विद्यालय प्रशासन को सुदृढ़ करते हैं।',
      assessedBy: 'Aarav Mehta (student)',
      assessedAt: '2026-11-14',
    },
    {
      id: 'rts-seed-svm-103-nov',
      schoolId: 'school-svm-kk',
      studentId: 'stu-svm-103',
      month: 'November',
      year: 2026,
      passageId: 'secondary-isro-telemetry',
      passageTitle: 'ISRO Orbital Navigation Systems',
      classTier: 'class_9_10',
      captureMode: 'assisted_pacer',
      wordsRead: 58,
      totalPassageWords: 84,
      elapsedSeconds: 38,
      wpm: 92,
      pronunciationPct: 68,
      accuracyPct: 64,
      avgBurstWords: 2.3,
      maxBurstWords: 5,
      burstOneWordPct: 36,
      burstTwoWordsPct: 44,
      burstThreePlusPct: 20,
      burstWholeSentencePct: 0,
      dominantFluencyStyle: 'Two-Word Chunks (2 words/go)',
      comprehensionPct: 68,
      translationPct: 64,
      overallPct: 67,
      readingBand: 'Developing',
      mispronouncedWords: [
        {
          expectedWord: 'trajectories',
          spokenAs: 'trajektories',
          difficultyTier: 'challenge',
          phoneticHint: 'truh-jek-tuh-reez',
        },
      ],
      translationPrompt: 'Accurate orbital trajectories save satellite fuel.',
      studentTranslation: 'सटीक रास्ते उपग्रह का ईंधन बचाते हैं।',
      assessedBy: 'Kavita Sharma (teacher)',
      assessedAt: '2026-11-11',
    },
  ];

  const initialDb: DatabaseState = {
    schools,
    users: allUsers,
    schoolWeights: {
      'school-vis-jjr': {
        weights: { ...DEFAULT_LEARNERS_WEIGHTS },
        version: 'v1.2',
        approvedBy: 'Dr. Deepak Dhawan (Principal, VIS Jhajjar)',
      },
      'school-svm-kk': {
        weights: { ...DEFAULT_LEARNERS_WEIGHTS },
        version: 'v1.2',
        approvedBy: 'Dr. Meenakshi Deswal (Principal)',
      },
      'school-dpa-knl': {
        weights: { ...DEFAULT_LEARNERS_WEIGHTS },
        version: 'v1.2',
        approvedBy: 'Harpreet Kaur Sandhu (Principal)',
      },
    },
    students: allStudents,
    notebookEntries: allNotebookEntries,
    notebookNotifications: initialNotebookNotifications,
    homeworkAssignments,
    homeworkSubmissions,
    activityRecords,
    evidence: [...buildVisAdditionalEvidence(), ...svmDerivedEvidence, ...evidence],
    developmentReviews: [...VIS_DEV_REVIEWS, ...developmentReviews],
    examMarks: [...VIS_EXAM_MARKS, ...examMarks],
    attendance: allAttendance,
    readingReports: [...VIS_READING_REPORTS, ...partnerReadingReports],
    numeracyReports: [...VIS_NUMERACY_REPORTS, ...partnerNumeracyReports],
    readingTestSessions: initialReadingTestSessions,
    numeracyTestSessions: [],
    monthlyAttendance: [...VIS_MONTHLY_ATTENDANCE],
    attendanceNotifications: initialNotifications,
    resources: [...buildVisResourcesFromDrivePacks(), ...resources],
    lessonPlans: [...VIS_LESSON_PLANS, ...lessonPlans],
    timetable: [...VIS_TIMETABLE, ...timetable],
    admissionLeads: [...VIS_ADMISSION_LEADS, ...admissionLeads],
    homeVisitRecords: [...VIS_HOME_VISITS, ...homeVisitRecords],
    careerRequests,
    feeTransactions: allFeeTransactions,
    operations: [...VIS_OPERATIONS, ...operations],
    parentComplaints: [...VIS_PARENT_COMPLAINTS, ...parentComplaints],
    blogArticles,
    auditLogs,
    publicEnquiries,
    cognitiveAttempts,
    cognitiveAssignments,
    remedialAssignments: [
      {
        id: 'rem-seed-vis-301-1',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-301',
        studentName: 'Kush',
        classSection: '3-B',
        stageNumber: 4,
        expectedStageTitle: 'Stage 4 · Industry vs. Inferiority',
        negativePole: 'Inferiority',
        positivePole: 'Industry',
        title: '5-Minute Winnable Reading Phrase Ladder',
        category: 'Skill Practice',
        description:
          'Scaffold 3-word phrase reading in calm 5-minute blocks using Interactive Pacer before full-class turn-taking so Kush experiences immediate mastery.',
        steps: [
          'Start with 1 familiar paragraph in Interactive Pacer mode (no peer audience).',
          'Celebrate beating yesterday’s WPM or pronunciation slip count by +2.',
          'Invite Kush to read 1 pre-practised sentence aloud to his desk partner.',
        ],
        expectedOutcome: 'Shifts self-doubt into measurable Stage 4 Industry & Competence within 2 weeks.',
        durationLabel: '10 mins · 4x/week',
        dueDate: '2026-11-30',
        status: 'In Progress',
        source: 'erikson_engine',
        targetOlqs: ['self_confidence', 'determination', 'power_of_expression'],
        assignedBy: 'Dr. Deepak Dhawan',
        assignedByRole: 'principal',
        assignedAt: '2026-11-16',
      },
      {
        id: 'rem-seed-svm-103-1',
        schoolId: 'school-svm-kk',
        studentId: 'stu-svm-103',
        studentName: 'Rohan Chauhan',
        classSection: '10-A',
        stageNumber: 5,
        expectedStageTitle: 'Stage 5 · Identity vs. Role Confusion',
        negativePole: 'Role Confusion',
        positivePole: 'Identity',
        title: 'Weekly Self-Chosen Mastery Goal & Study Contract',
        category: 'Behavioral Intervention',
        description:
          'Co-create one self-selected subject micro-goal per week so Rohan rebuilds personal agency and clear academic identity without fear of comparison.',
        steps: [
          'Hold a 5-minute Monday goal check letting Rohan pick 1 priority topic.',
          'Break notebook practice into 2 verifiable checkpoints with immediate feedback.',
          'Review Friday completion privately and record effort in Student 360°.',
        ],
        expectedOutcome: 'Restores task ownership and counters Stage 5 Role Confusion.',
        durationLabel: '15 mins · Weekly',
        dueDate: '2026-11-29',
        status: 'Assigned',
        source: 'erikson_engine',
        targetOlqs: ['initiative', 'sense_of_responsibility', 'determination'],
        assignedBy: 'Dr. Meenakshi Deswal',
        assignedByRole: 'principal',
        assignedAt: '2026-11-17',
      },
    ],
    registerApprovals: {},
    visParsedReports: { ...VIS_PARSED_REPORTS_SEED },
    feeAccounts: initialFinance.feeAccounts,
    siblingGroups: initialFinance.siblingGroups,
    familyAccounts: initialFinance.familyAccounts,
    dismissedPartialMatches: [],
    financialTargets: initialFinance.financialTargets,
    feeReceipts: initialFinance.feeReceipts,
    ...createIntelligenceSeedBundle({
      schoolIds: schools.map((s) => s.id),
      students: allStudents,
      timetable: [...VIS_TIMETABLE, ...timetable],
      resources: [...buildVisResourcesFromDrivePacks(), ...resources],
    }),
    srtRecords: [],
    watRecords: [],
    tatRecords: [],
    ppdtRecords: [],
    thinkingOlqMappings: [],
    databaseMigrations: [],
    psychometricRecords: createPsychometricSeedRecords({
      schoolIds: schools.map((s) => s.id),
      students: allStudents,
    }),
    thinkingSetUsages: [],
    ssbEnrollments: [],
    ssbDailyAssignments: [],
    computerSkillBenchmarks: [],
    computerSkillAttempts: [],
    vcipAttempts: [],
    vcipBrainGymLogs: [],
    vcipAuthoredQuestions: [],
    vcipClassAssignments: [],
    vcipGovernanceConfigs: {},
    vcipReleaseRecords: [],
    vcipAccessLogs: [],
    attendanceSupportRecords: [],
    mindMapResources: [],
    accountingEntries: [],
    payrollRegisters: [],
    bankReconciliationItems: [],
    accountingTasks: [],
    clinicalConsents: [],
    developmentalHistories: [],
    parentQuestionnaires: [],
    teacherObservations: [],
    screeningCases: [],
    conditionAssessments: [],
    speechSoundTargets: [],
    speechExercises: [],
    fluencyProfiles: [],
    therapyPlans: [],
    therapySessionLogs: [],
    audioPracticeRecords: [],
    parentHomePracticeLogs: [],
    clinicalReports: [],
    clinicalAccessLogs: [],
  };

  const schoolIdsList = schools.map((s) => s.id);
  initialDb.ssbEnrollments = createInitialSsbEnrollments({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.ssbDailyAssignments = createInitialSsbDailyAssignments({
    enrollments: initialDb.ssbEnrollments,
  });
  initialDb.computerSkillBenchmarks = createInitialComputerSkillBenchmarksAllSchools(schoolIdsList);
  initialDb.computerSkillAttempts = createInitialComputerSkillAttempts({
    schoolIds: schoolIdsList,
    students: allStudents,
    benchmarks: initialDb.computerSkillBenchmarks,
  });
  initialDb.vcipAttempts = createInitialVcipAttempts({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.vcipBrainGymLogs = createInitialVcipBrainGymLogs({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.vcipAuthoredQuestions = createInitialVcipAuthoredQuestions(schoolIdsList);
  initialDb.vcipClassAssignments = createInitialVcipClassAssignments(schoolIdsList);
  initialDb.vcipGovernanceConfigs = createInitialVcipGovernanceConfigs(schoolIdsList);

  const initialVcipReleases = createInitialVcipReleaseRecords({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.vcipReleaseRecords = initialVcipReleases.releaseRecords;
  initialDb.vcipAccessLogs = initialVcipReleases.accessLogs;
  initialDb.attendanceSupportRecords = createInitialAttendanceSupportRecords({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.mindMapResources = createInitialMindMapResources(schoolIdsList);

  const initialAccounting = createInitialAccountingBundle(schoolIdsList);
  const visExpenseEntries = loadVisExpenseSheetEntries('school-vis-jjr');
  const visSalaryBundle = loadVisSalarySheetProfiles(initialDb.users, 'school-vis-jjr');

  initialDb.accountingEntries =
    visExpenseEntries.length > 0
      ? [
          ...visExpenseEntries,
          ...initialAccounting.accountingEntries.filter((e) => e.schoolId !== 'school-vis-jjr'),
        ]
      : initialAccounting.accountingEntries;
  initialDb.payrollRegisters =
    visSalaryBundle.payrollRegisters.length > 0
      ? [
          ...visSalaryBundle.payrollRegisters,
          ...initialAccounting.payrollRegisters.filter((p) => p.schoolId !== 'school-vis-jjr'),
        ]
      : initialAccounting.payrollRegisters;
  if (visSalaryBundle.staffProfiles.length > 0) {
    initialDb.staffProfiles = visSalaryBundle.staffProfiles;
    initialDb.staffAttendance = visSalaryBundle.staffAttendance;
  }
  initialDb.bankReconciliationItems = initialAccounting.bankReconciliationItems;
  initialDb.accountingTasks = initialAccounting.accountingTasks;

  const initialClinical = createInitialClinicalBundle({
    schoolIds: schoolIdsList,
    students: allStudents,
  });
  initialDb.clinicalConsents = initialClinical.clinicalConsents;
  initialDb.developmentalHistories = initialClinical.developmentalHistories;
  initialDb.parentQuestionnaires = initialClinical.parentQuestionnaires;
  initialDb.teacherObservations = initialClinical.teacherObservations;
  initialDb.screeningCases = initialClinical.screeningCases;
  initialDb.conditionAssessments = initialClinical.conditionAssessments;
  initialDb.speechSoundTargets = initialClinical.speechSoundTargets;
  initialDb.speechExercises = initialClinical.speechExercises;
  initialDb.fluencyProfiles = initialClinical.fluencyProfiles;
  initialDb.therapyPlans = initialClinical.therapyPlans;
  initialDb.therapySessionLogs = initialClinical.therapySessionLogs;
  initialDb.audioPracticeRecords = initialClinical.audioPracticeRecords;
  initialDb.parentHomePracticeLogs = initialClinical.parentHomePracticeLogs;
  initialDb.clinicalReports = initialClinical.clinicalReports;
  initialDb.clinicalAccessLogs = initialClinical.clinicalAccessLogs;

  runThinkingAssessmentMigrations(initialDb);
  return initialDb;
}
