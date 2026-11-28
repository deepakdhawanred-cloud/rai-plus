import type {
  AbsenceTargetRiskAlert,
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
  EventParticipationRequest,
  EventTeacherIssue,
  ExamMark,
  FamilyAccount,
  FeeDefaulterNotificationConfig,
  FeeDefaulterNotificationRecord,
  FeeLedgerAccount,
  FeePaymentReceipt,
  FeeReminderCalendarEvent,
  FeeTransaction,
  NotificationGatewayStatus,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeVisitRecord,
  LearnersScoreBreakdown,
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
  ProductionRegisterRow,
  PublicEnquiry,
  ReadingTestSession,
  RegisterApprovalRecord,
  School,
  SchoolEvent,
  SchoolFeeStructureRow,
  SchoolGrowthLeaderboards,
  SchoolRankingsSummary,
  SiblingFamilyGroup,
  StudentRecord,
  StudentYearlyPlan,
  SubscriptionPlanPricingOverride,
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
  TimetableMasterConfig,
  TimetableSlot,
  GatePassRecord,
  SalaryModificationAuditRecord,
  StaffAttendanceRecord,
  StaffProfile,
  StaffSalaryComputation,
  TransportWorkspaceBundle,
  UserAccount,
  VisitorLogRecord,
  ViratResourcePack,
  VisParsedReportProfile,
  VisReportCatalogItem,
} from '../types';

export interface WorkspaceData {
  user: UserAccount;
  activeSchool: School;
  availableSchools: School[];
  planPricingCatalog?: Record<string, SubscriptionPlanPricingOverride>;
  weightsConfig: {
    weights: LearnersWeights;
    version: string;
    approvedBy: string;
  };
  students: StudentRecord[];
  studentBreakdowns: Record<string, LearnersScoreBreakdown>;
  rankings?: SchoolRankingsSummary;
  growthLeaderboards?: SchoolGrowthLeaderboards;
  evidence: DevelopmentEvidence[];
  notebookEntries: NotebookEntry[];
  notebookNotifications?: NotebookIncompleteNotification[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  activityRecords?: ActivityRecord[];
  developmentReviews: DevelopmentReviewItem[];
  examMarks: ExamMark[];
  attendance: AttendanceRecord[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyTestSessions?: NumeracyTestSession[];
  monthlyAttendance?: MonthlyAttendanceSummary[];
  attendanceNotifications?: ParentAttendanceNotification[];
  resources: AcademicResource[];
  lessonPlans: LessonPlan[];
  timetable: TimetableSlot[];
  admissionLeads: AdmissionLead[];
  homeVisitRecords: HomeVisitRecord[];
  careerRequests: CareerCounsellingRequest[];
  feeTransactions: FeeTransaction[];
  feeAccounts?: FeeLedgerAccount[];
  siblingGroups?: SiblingFamilyGroup[];
  familyAccounts?: FamilyAccount[];
  dismissedPartialMatches?: DismissedPartialMatch[];
  financialTarget?: MonthlyFeeTargetConfig;
  feeReceipts?: FeePaymentReceipt[];
  feeReminders?: FeeReminderCalendarEvent[];
  feeStructure?: SchoolFeeStructureRow[];
  feeDefaulterAlertConfig?: FeeDefaulterNotificationConfig;
  feeDefaulterAlertLogs?: FeeDefaulterNotificationRecord[];
  notificationGatewayStatus?: NotificationGatewayStatus;
  operations: OperationalItem[];
  parentComplaints: ParentComplaint[];
  blogArticles: BlogArticle[];
  auditLogs: AuditLogEntry[];
  publicEnquiries: PublicEnquiry[];
  cognitiveAttempts: CognitiveAttemptRecord[];
  cognitiveAssignments: CognitiveAssignment[];
  remedialAssignments?: DevelopmentalRemedialAssignment[];
  visReportsCatalog?: VisReportCatalogItem[];
  visParsedReports?: Record<string, VisParsedReportProfile>;
  productionRegister?: ProductionRegisterRow[];
  registerApprovals?: Record<string, RegisterApprovalRecord>;
  viratResourcePacks?: ViratResourcePack[];
  // Additive Virat 360° Intelligence Collections
  thinkingQuestionBank?: ThinkingQuestionItem[];
  thinkingScoringConfig?: ThinkingScoringConfig;
  thinkingAssessments?: ThinkingAssessmentSession[];
  timetableMasterConfig?: TimetableMasterConfig;
  substituteRuleConfig?: SubstituteRuleConfig;
  teacherCapabilityProfiles?: TeacherCapabilityProfile[];
  capabilityBandConfig?: CapabilityBandConfig;
  substitutionAssignments?: SubstitutionAssignmentRecord[];
  teacherLeaveRequests?: TeacherLeaveRequest[];
  teacherLeaveBalances?: TeacherLeaveBalance[];
  productivityKpiConfig?: TeacherProductivityKpiConfig;
  careerProfiles?: CareerProfile[];
  studentCareerPlans?: StudentCareerPlan[];
  presentationAudits?: PresentationAuditRecord[];
  redesignedDecks?: RedesignedPresentationDeck[];
  psychometricRecords?: import('../types').PsychometricRecord[];
  thinkingSetUsages?: import('../types').ThinkingMonthlySetUsage[];
  ssbEnrollments?: import('../types').SsbEnrollmentRecord[];
  ssbDailyAssignments?: import('../types').SsbDailyAssignment[];
  computerSkillBenchmarks?: import('../types').ComputerSkillBenchmark[];
  computerSkillAttempts?: import('../types').ComputerSkillAttempt[];
  vcipAttempts?: import('./vcip').VcipAttemptRecord[];
  vcipBrainGymLogs?: import('./vcip').VcipBrainGymLog[];
  vcipAuthoredQuestions?: import('./vcip').VcipAuthoredQuestion[];
  vcipClassAssignments?: import('./vcip').VcipClassAssignment[];
  vcipGovernanceConfig?: import('./vcip').VcipGovernanceConfig;
  vcipReleaseRecords?: import('./vcip').VcipProfileReleaseRecord[];
  vcipAccessLogs?: import('./vcip').VcipAccessLogEntry[];
  attendanceSupportRecords?: import('../types').AttendanceSupportRecord[];
  mindMapResources?: import('../types').MindMapResourceItem[];
  accountingEntries?: import('../types').AccountingEntry[];
  payrollRegisters?: import('../types').PayrollRegisterEntry[];
  bankReconciliationItems?: import('../types').BankReconciliationItem[];
  accountingTasks?: import('../types').AccountingTaskItem[];
  schoolUsers?: UserAccount[];
  clinicalCare?: import('./clinical').ClinicalWorkspaceBundle;
  transport?: TransportWorkspaceBundle;
  schoolEvents?: SchoolEvent[];
  eventParticipationRequests?: EventParticipationRequest[];
  eventTeacherIssues?: EventTeacherIssue[];
  studentYearlyPlans?: StudentYearlyPlan[];
  absenceTargetRiskAlerts?: AbsenceTargetRiskAlert[];
  interactiveLearning?: import('./interactiveLearning').InteractiveLearningOverviewPayload;
  // Role-scoped Staff Attendance & Automated Salary (strictly filtered server-side)
  staffProfiles?: StaffProfile[];
  staffAttendance?: StaffAttendanceRecord[];
  staffSalarySummaries?: StaffSalaryComputation[];
  staffSalaryAccessScope?: 'full' | 'self' | 'none';
  salaryAuditLogs?: SalaryModificationAuditRecord[];
  // Digital Gate Pass & Digital Visitors Register
  gatePasses?: GatePassRecord[];
  visitorLogs?: VisitorLogRecord[];
  // School Control Room & Smart Academic Calendar
  controlRoom?: import('./controlRoomCalendar').ControlRoomWorkspaceBundle;
  academicCalendar?: import('./controlRoomCalendar').AcademicCalendarState;
}

export type WorkspaceTab =
  | 'feature_allotment'
  | 'flagship_products'
  | 'overview'
  | 'control_room'
  | 'academic_calendar'
  | 'learning_portal'
  | 'inventory_assets'
  | 'alerts'
  | 'today_workspace'
  | 'interactive_learning'
  | 'events'
  | 'clinical_care'
  | 'attendance_heatmap'
  | 'staff_payroll'
  | 'campus_gate'
  | 'cognitive_profile'
  | 'thinking'
  | 'psychometric'
  | 'computer_skills'
  | 'timetable_leave'
  | 'productivity'
  | 'career'
  | 'finance'
  | 'families'
  | 'notebook'
  | 'students'
  | 'marks_report_card'
  | 'remedials'
  | 'games'
  | 'assessments'
  | 'academic_resources'
  | 'academics'
  | 'admissions'
  | 'transport'
  | 'operations';



