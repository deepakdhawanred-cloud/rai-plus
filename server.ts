import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import zlib from 'node:zlib';
import {
  flushDbSync,
  getDb,
  getDbRevision,
  getSchoolRevision,
  hydrateDbFromSupabase,
  saveDb,
} from './server/store.ts';
import {
  SESSION_IDLE_TTL_MS,
  SESSION_MAX_TTL_MS,
  clearSessionCookie,
  corsMiddleware,
  createSlidingWindowRateLimiter,
  extractSessionToken,
  extractTextFromPdfBufferFallback,
  hashPassword,
  isDemoLoginEnabled,
  sanitizeUserForClient,
  securityHeadersMiddleware,
  setSessionCookie,
  verifyPassword,
} from './server/security.ts';
import type { DatabaseState } from './server/seedData.ts';
import productionRegisterRaw from './src/data/productionRegister.json' with { type: 'json' };
import viratAcademicResourcesRaw from './src/data/viratAcademicResources.json' with { type: 'json' };
import visReportsCatalogRaw from './src/data/visReportsCatalog.json' with { type: 'json' };
import { parseVisReportText } from './src/utils/visReportParser.ts';
import { registerIntelligenceRoutes } from './server/intelligenceRoutes.ts';
import { registerPsychometricRoutes } from './server/psychometricRoutes.ts';
import {
  ensureTodaySsbAssignmentsForSchool,
  registerSsbAndComputerSkillRoutes,
} from './server/ssbAndComputerSkillRoutes.ts';
import { registerVcipRoutes } from './server/vcipRoutes.ts';
import { registerContinuationRoutes } from './server/continuationRoutes.ts';
import { registerClinicalRoutes } from './server/clinicalRoutes.ts';
import {
  ensureSchoolTransportInitialized,
  registerTransportRoutes,
} from './server/transportRoutes.ts';
import {
  ensureEventsAndPlansInitialized,
  ensureSchoolSpecificResourcesSeeded,
  recordAbsenceRiskAlertOnAttendance,
  registerEventsAndPlansRoutes,
} from './server/eventsAndPlansRoutes.ts';
import {
  ensureMarksCategoriesInitialized,
  registerMarksRoutes,
} from './server/marksRoutes.ts';
import {
  buildInteractiveLearningOverviewForRole,
  ensureInteractiveLearningInitialized,
  registerInteractiveLearningRoutes,
} from './server/interactiveLearningRoutes.ts';
import {
  ensureCampusAdminInitialized,
  registerCampusAdminRoutes,
} from './server/campusAdminRoutes.ts';
import {
  getOrCreateDefaulterAlertConfig,
  registerDefaulterNotificationRoutes,
} from './server/defaulterNotificationRoutes.ts';
import {
  broadcastControlRoomEvent,
  ensureControlRoomAndCalendarInitialized,
  registerControlRoomAndCalendarRoutes,
} from './server/controlRoomAndCalendarRoutes.ts';
import { evaluatePeriodDrop } from './src/utils/timetableDragDropEngine.ts';
import { registerLearningPortalRoutes } from './server/learningPortalRoutes.ts';
import { registerInventoryRoutes } from './server/inventoryRoutes.ts';
import {
  ensureFlagshipProductsInitialized,
  registerFlagshipProductsRoutes,
} from './server/flagshipProductsRoutes.ts';
import { registerStudentOnboardingRoutes } from './server/studentOnboardingRoutes.ts';
import { createDay1OnboardingBlueprint } from './src/utils/studentOnboardingDocsEngine.ts';
import { getNotificationGatewayStatus } from './server/notificationGateway.ts';
import { buildRoleScopedCampusAdminPayload } from './src/utils/campusAdminEngine.ts';
import {
  buildTransportRoleBundle,
  recommendRouteForLocality,
} from './src/utils/transportEngine.ts';
import { sanitizeClinicalBundleForRole } from './src/utils/clinicalCareEngine.ts';
import {
  isVcipReleaseVisibleToFamily,
  sanitizeVcipReleaseRecordForRole,
} from './src/utils/vcipReleaseGovernanceEngine.ts';
import { filterMindMapLibrary } from './src/utils/mindMapResourceEngine.ts';
import {
  aggregateChapterMasteryLeaderboard,
  computeSubjectChampions,
} from './src/utils/chapterStudyGameEngine.ts';
import {
  SUBSCRIPTION_PLANS,
  getEffectivePlanPriceInr,
  getEnabledFeaturesForSchool,
  getPlanDefaultFeatures,
  hasGoogleMapsAccess,
  isAttendanceModeEnabledForSchool,
  isRaiPlusCoo,
  resolveSubscriptionPlans,
  sanitizeFeatureOverrides,
} from './src/utils/subscriptionEntitlements.ts';

const execFileAsync = promisify(execFile);
const gzipAsync = promisify(zlib.gzip);
const brotliAsync = promisify(zlib.brotliCompress);
const PRODUCTION_REGISTER = productionRegisterRaw as import('./src/types').ProductionRegisterRow[];
const VIRAT_RESOURCE_PACKS = viratAcademicResourcesRaw as import('./src/types').ViratResourcePack[];
const VIS_REPORTS_CATALOG = visReportsCatalogRaw as import('./src/types').VisReportCatalogItem[];
import {
  GeminiApiError,
  generateAcademicResourceDraft,
  generateCareerAdvisoryDraft,
  generateChapterKnowledgeVisual,
  generateEriksonRemedialPlan,
  generateStudentInsightDraft,
} from './server/gemini.ts';
import type {
  AcademicResource,
  ActivityKind,
  ActivityParticipationEntry,
  ActivityRecord,
  AdmissionLead,
  AttendanceMarkingMode,
  AttendanceRecord,
  AuditLogEntry,
  BlogArticle,
  CareerCounsellingRequest,
  ChapterMasteryAttempt,
  CognitiveAssignment,
  CognitiveAttemptRecord,
  DevelopmentEvidence,
  DevelopmentReviewItem,
  DevelopmentalRemedialAssignment,
  DevelopmentalRemedialCategory,
  DevelopmentalRemedialStatus,
  ExamMark,
  FamilyAccount,
  FeeMonthKey,
  FeePaymentMode,
  FeeScheduleCadence,
  FeePaymentReceipt,
  FeeReminderCalendarEvent,
  FeeTransaction,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeworkSubmissionStatus,
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
  ObservationContext,
  OlqKey,
  OperationalItem,
  ParentAttendanceNotification,
  ParentComplaint,
  PublicEnquiry,
  ReadingTestSession,
  School,
  SchoolFeeStructureRow,
  StudentRecord,
  UserAccount,
  UserRole,
} from './src/types';
import {
  calculateLearnersScore,
  mapNotebookEntryToEvidence,
  validateLearnersWeights,
} from './src/utils/evidenceEngine.ts';
import {
  buildNotebookNotificationId,
  buildPriorChapterBacklogAlertId,
  composeNotebookIncompleteAlert,
  composePriorChapterBacklogAlert,
  resolveNotebookIncompleteAlert,
  shouldTriggerNotebookIncompleteAlert,
  sortNotebookNotifications,
} from './src/utils/notebookNotificationEngine.ts';
import {
  detectPriorChapterBacklogsForClassSubject,
  extractNumericChapterIndex,
} from './src/utils/pendingCheckingEngine.ts';
import {
  buildHomeworkSourceKey,
  isTeacherAuthorizedForHomeworkClass,
  mapHomeworkSubmissionToEvidence,
  validateHomeworkCreateInput,
} from './src/utils/homeworkEngine.ts';
import {
  ACTIVITY_KINDS,
  buildIncidentEvidence,
  mapActivityParticipationToEvidence,
  type IncidentRatingInput,
  validateObservationIncidentInput,
} from './src/utils/olqActivityEngine.ts';
import { getCognitiveGameById } from './src/utils/cognitiveGamesCatalog.ts';
import { computeSchoolRankings } from './src/utils/learnersRankingEngine.ts';
import { assessStudentEriksonDevelopment } from './src/utils/eriksonDevelopmentEngine.ts';
import {
  normalizeClassSectionFromApplyingClass,
  validateHomeVisitInput,
  validateLeadInput,
} from './src/utils/admissionCrmEngine.ts';
import {
  buildComplaintRefNo,
  sanitizeComplaintForRole,
  validateNewComplaintInput,
} from './src/utils/complaintEngine.ts';
import {
  buildBatchAttendanceRecordId,
  computeUpdatedStudentAttendancePct,
  normalizeCurriculumClassKey,
  summarizeAttendanceEntries,
  teacherMatchesSlot,
  validateBatchAttendanceInput,
  type BatchAttendanceEntryInput,
} from './src/utils/academicOperationsEngine.ts';
import {
  ACADEMIC_FEE_MONTHS,
  allocateFamilyPayment,
  computeStudentFeeMonthAllocation,
  emptyMonthlyPaidMap,
  normalizeFeeClassName,
  normalizePaymentPlan,
} from './src/utils/financialDashboardEngine.ts';
import {
  buildFeeStructureRow,
  deriveInitialFeeStructureFromAccounts,
  sortFeeStructureRows,
  type FeeStructureInputRow,
} from './src/utils/feeStructureEngine.ts';
import {
  detectPartialContactMatches,
  ensureFeeLedgerAccountsForStudents,
  reconcileStudentFamilyAccounts,
} from './src/utils/familyAccountEngine.ts';
import {
  canTeacherAccessSubjectResource,
  computeTeacherTeachingScope,
  filterAuditLogsForRole,
  filterClassGrowthLeaderboardsForRole,
  filterDevelopmentReviewsForRole,
  filterLessonPlansForRole,
  filterProductionRegisterForRole,
  filterRankingsForRole,
  filterResourcePacksForRole,
  filterSchoolResourcesForRole,
  filterStudentsForRole,
  filterStudentTelemetryForRole,
  filterTimetableForRole,
  filterVisReportsCatalogForRole,
  sanitizeStudentForRole,
} from './src/utils/roleVisibilityAudit.ts';
import { computeSchoolGrowthLeaderboards } from './src/utils/growthLeaderboardEngine.ts';
import {
  ACTIVE_SESSION_MONTHS,
  computeReadingBand,
  reconcileMonthlyAttendanceAfterMark,
  resolveTodayIsoDate,
} from './src/utils/visAcademicProgressEngine.ts';
import {
  buildAttendanceNotificationId,
  composeParentAttendanceMessage,
  sortAttendanceNotifications,
} from './src/utils/attendanceNotificationEngine.ts';

const MAX_DRIVE_PDF_BYTES = 20 * 1024 * 1024; // 20 MB cap for Drive PDF extraction

interface SessionInfo {
  token: string;
  userId: string;
  activeSchoolId: string | null;
  createdAt: number;
  lastSeenAt: number;
  expiresAt: number;
}

const sessions = new Map<string, SessionInfo>();

// Periodically reap expired sessions so long-running processes never accumulate stale entries
const sessionReaper = setInterval(() => {
  const now = Date.now();
  for (const [tok, sess] of sessions) {
    if (now > sess.expiresAt || now - sess.createdAt > SESSION_MAX_TTL_MS) {
      sessions.delete(tok);
    }
  }
}, 10 * 60 * 1000);
sessionReaper.unref?.();

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
  sessionToken?: string;
}

function appendAuditLog(params: {
  schoolId: string | null;
  actor: UserAccount;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
}) {
  const db = getDb();
  const entry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    schoolId: params.schoolId,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    timestamp: new Date().toISOString(),
    detail: params.detail,
  };
  db.auditLogs.unshift(entry);
  saveDb(undefined, { schoolId: params.schoolId });
}

function syncSchoolFamilyAccounts(db: DatabaseState, schoolId: string) {
  const synced = reconcileStudentFamilyAccounts({
    schoolId,
    students: db.students,
    feeAccounts: db.feeAccounts || [],
    siblingGroups: db.siblingGroups || [],
    familyAccounts: db.familyAccounts || [],
    feeReceipts: db.feeReceipts || [],
    feeTransactions: db.feeTransactions || [],
    users: db.users,
  });
  db.feeAccounts = synced.feeAccounts;
  db.siblingGroups = synced.siblingGroups;
  db.familyAccounts = synced.familyAccounts;
  return synced;
}

function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = extractSessionToken(req);

  if (!token || !sessions.has(token)) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const session = sessions.get(token)!;
  const now = Date.now();
  if (now > session.expiresAt || now - session.createdAt > SESSION_MAX_TTL_MS) {
    sessions.delete(token);
    res.status(401).json({ error: 'Session expired. Please sign in again.' });
    return;
  }

  const db = getDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    sessions.delete(token);
    res.status(401).json({ error: 'Session user not found.' });
    return;
  }

  session.lastSeenAt = now;
  session.expiresAt = Math.min(now + SESSION_IDLE_TTL_MS, session.createdAt + SESSION_MAX_TTL_MS);

  req.user = user;
  req.sessionToken = token;
  req.activeSchoolId =
    user.role === 'super_admin' || user.role === 'counsellor'
      ? session.activeSchoolId ?? db.schools[0]?.id ?? null
      : user.schoolId;
  next();
}

function requireRoles(allowed: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      res.status(403).json({ error: 'Access restricted for your institutional role.' });
      return;
    }
    next();
  };
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '4mb' }));

  const loginRateLimiter = createSlidingWindowRateLimiter({
    maxRequests: 40,
    windowMs: 5 * 60 * 1000,
    message: 'Too many sign-in attempts from this network. Please wait a few minutes and try again.',
  });
  const publicFormRateLimiter = createSlidingWindowRateLimiter({
    maxRequests: 25,
    windowMs: 5 * 60 * 1000,
    message: 'Too many public form submissions in a short window. Please try again shortly.',
  });
  const aiAndQuotaRateLimiter = createSlidingWindowRateLimiter({
    maxRequests: 25,
    windowMs: 5 * 60 * 1000,
    message: 'AI/Maps quota rate limit reached for this session. Please retry in a few moments.',
    keyGenerator: (req) => {
      const authed = req as AuthedRequest;
      return authed.user?.id ? `user:${authed.user.id}` : `ip:${req.ip || 'unknown'}`;
    },
  });

  // Never allow browsers or upstream proxies to cache /api JSON responses (or cold-start HTML)
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Honeypot bot guard + burst rate limiting on public lead forms
  app.post(
    [
      '/api/public/enquiry',
      '/api/public/admission-enquiry',
      '/api/public/career-counselling',
      '/api/public/product-enquiry',
      '/api/auth/register-ssb',
      '/api/auth/register-career',
    ],
    publicFormRateLimiter,
    (req, res, next) => {
      const body = req.body as { website?: unknown; _hp?: unknown } | undefined;
      if (
        (typeof body?.website === 'string' && body.website.trim().length > 0) ||
        (typeof body?._hp === 'string' && body._hp.trim().length > 0)
      ) {
        res.status(202).json({ ok: true, accepted: true });
        return;
      }
      next();
    },
  );

  // Protect expensive Gemini AI & Google Maps geocoding routes against billing drain
  app.use('/api', (req, res, next) => {
    if (
      req.method === 'POST' &&
      (req.path.includes('ai-') ||
        req.path.includes('/ai/') ||
        req.path.includes('categorize-expenses') ||
        req.path.includes('extract-document') ||
        req.path.includes('geocode-address') ||
        req.path.includes('chapter-visual'))
    ) {
      aiAndQuotaRateLimiter(req, res, next);
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'rai-plus',
      uptimeSec: Math.round(process.uptime()),
      demoLoginEnabled: isDemoLoginEnabled(),
    });
  });

  // ---------------- PUBLIC ENDPOINTS ----------------
  app.get('/api/public/overview', (_req, res) => {
    const db = getDb();
    ensureFlagshipProductsInitialized(db);
    const demoEnabled = isDemoLoginEnabled();
    res.json({
      schoolsCount: db.schools.length,
      demoLoginEnabled: demoEnabled,
      schools: db.schools.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        city: s.city,
        state: s.state,
        board: s.board,
      })),
      demoAccounts: demoEnabled
        ? db.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            schoolId: u.schoolId,
            designation: u.designation,
            subjectSpecialty: u.subjectSpecialty,
            classTeacherOf: u.classTeacherOf,
          }))
        : [],
      publishedBlogs: db.blogArticles.filter((b) => b.status === 'Published'),
    });
  });

  app.post('/api/public/enquiry', (req, res) => {
    const {
      type,
      schoolOrOrgName,
      contactName,
      email,
      phone,
      cityState,
      board,
      message,
    } = req.body as Partial<PublicEnquiry>;

    if (!contactName?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Contact name, email, phone, and message are required.' });
      return;
    }

    const db = getDb();
    const enquiry: PublicEnquiry = {
      id: `enq-${Date.now()}`,
      type: type === 'School Demo & Onboarding' ? 'School Demo & Onboarding' : 'General Contact',
      schoolOrOrgName: schoolOrOrgName?.trim() || 'Independent Visitor',
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cityState: cityState?.trim() || 'Haryana, India',
      board: board?.trim() || 'HBSE',
      message: message.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.publicEnquiries.unshift(enquiry);

    // Automatically route school/admission enquiries into the Admission CRM workflow of the primary tenant if applicable
    if (enquiry.type === 'School Demo & Onboarding') {
      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        schoolId: null,
        actorName: enquiry.contactName,
        actorRole: 'super_admin',
        action: 'PUBLIC_SCHOOL_DEMO_REQUEST',
        entityType: 'PublicEnquiry',
        entityId: enquiry.id,
        timestamp: new Date().toISOString(),
        detail: `${enquiry.schoolOrOrgName} (${enquiry.cityState}) submitted a platform onboarding enquiry.`,
      });
    } else {
      const targetSchool = db.schools[0];
      if (targetSchool) {
        const lead: AdmissionLead = {
          id: `adm-${Date.now()}`,
          schoolId: targetSchool.id,
          studentName: enquiry.schoolOrOrgName,
          applyingClass: 'Enquiry Follow-up',
          parentName: enquiry.contactName,
          phone: enquiry.phone,
          email: enquiry.email,
          source: 'Website',
          stage: 'New Enquiry',
          assignedCounsellor: 'Anil Kumar Hooda',
          nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
          notes: enquiry.message,
        };
        db.admissionLeads.unshift(lead);
      }
    }

    saveDb();
    res.status(201).json({ enquiry });
  });

  app.post('/api/public/admission-enquiry', (req, res) => {
    const {
      schoolId,
      studentName,
      applyingClass,
      parentName,
      phone,
      email,
      preferredVisitDate,
      locality,
      residentialLat,
      residentialLng,
      notes,
    } = req.body as {
      schoolId?: string;
      studentName?: string;
      applyingClass?: string;
      parentName?: string;
      phone?: string;
      email?: string;
      preferredVisitDate?: string;
      locality?: string;
      residentialLat?: number;
      residentialLng?: number;
      notes?: string;
    };

    if (!studentName?.trim() || !applyingClass?.trim() || !parentName?.trim() || !phone?.trim()) {
      res.status(400).json({
        error: 'Student name, applying class, parent name, and mobile number are required.',
      });
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      res.status(400).json({ error: 'Please enter a valid mobile or WhatsApp number.' });
      return;
    }

    const db = getDb();
    const targetSchool = db.schools.find((s) => s.id === schoolId) || db.schools[0];
    if (!targetSchool) {
      res.status(500).json({ error: 'No active school tenant configured.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.slice(0, 10);
    const cleanVisitDate = preferredVisitDate?.trim() || todayDate;
    const validGeo =
      Number.isFinite(Number(residentialLat)) && Number.isFinite(Number(residentialLng))
        ? { lat: Number(residentialLat), lng: Number(residentialLng) }
        : null;

    const lead: AdmissionLead = {
      id: `adm-web-${Date.now()}`,
      schoolId: targetSchool.id,
      studentName: studentName.trim(),
      applyingClass: applyingClass.trim(),
      parentName: parentName.trim(),
      phone: phone.trim(),
      email: email?.trim() || '',
      source: 'Website',
      stage: preferredVisitDate?.trim() ? 'Campus Visit' : 'New Enquiry',
      assignedCounsellor: 'Admissions Desk',
      nextFollowUpDate: cleanVisitDate,
      locality: locality?.trim() || targetSchool.city,
      ...(validGeo ? { residentialLat: validGeo.lat, residentialLng: validGeo.lng } : {}),
      notes: [
        preferredVisitDate?.trim() ? `Requested campus visit: ${preferredVisitDate.trim()}` : null,
        notes?.trim() || 'Submitted via public website admission enquiry form.',
      ]
        .filter(Boolean)
        .join(' · '),
    };

    const { routes: schoolBusRoutes, allocations: schoolBusAllocs } =
      ensureSchoolTransportInitialized(db, targetSchool.id);
    const recommendedRoute = recommendRouteForLocality(
      lead.locality,
      lead.notes,
      schoolBusRoutes,
      schoolBusAllocs,
      validGeo,
    );
    if (recommendedRoute) {
      lead.recommendedRouteId = recommendedRoute.routeId;
      lead.recommendedRouteCode = recommendedRoute.routeCode;
      lead.recommendedRouteName = recommendedRoute.routeName;
      lead.recommendedStopName = recommendedRoute.stopName;
      lead.recommendedPickupTime = recommendedRoute.pickupTime;
      lead.recommendedRouteConfidence = recommendedRoute.confidence;
      lead.recommendedRouteReason = recommendedRoute.reason;
      lead.recommendedEfficiencyScore = recommendedRoute.efficiencyScore;
      lead.recommendedDistanceKm = recommendedRoute.distanceToStopKm;
      lead.recommendedDetourKm = recommendedRoute.marginalDetourKm;
      lead.transportPreference = 'Bus';
    }

    db.admissionLeads.unshift(lead);
    db.publicEnquiries.unshift({
      id: `enq-adm-${Date.now()}`,
      type: 'Parent Admission & Campus Visit',
      schoolOrOrgName: targetSchool.name,
      contactName: parentName.trim(),
      email: email?.trim() || 'not-provided@parent.local',
      phone: phone.trim(),
      cityState: locality?.trim() || `${targetSchool.city}, ${targetSchool.state}`,
      board: targetSchool.board,
      studentName: studentName.trim(),
      applyingClass: applyingClass.trim(),
      preferredVisitDate: preferredVisitDate?.trim() || undefined,
      message: lead.notes,
      createdAt: todayDate,
    });
    db.auditLogs.unshift({
      id: `aud-adm-${Date.now()}`,
      schoolId: targetSchool.id,
      actorName: parentName.trim(),
      actorRole: 'parent',
      action: 'PUBLIC_PARENT_ADMISSION_ENQUIRY',
      entityType: 'AdmissionLead',
      entityId: lead.id,
      timestamp: nowIso,
      detail: `Public admission enquiry for ${lead.studentName} (${lead.applyingClass}) logged for ${targetSchool.name}${recommendedRoute ? ` · Recommended Route: ${recommendedRoute.routeCode} (${recommendedRoute.stopName})` : ''}.`,
    });

    saveDb();
    res.status(201).json({ ok: true, lead, schoolName: targetSchool.name, recommendedRoute });
  });

  app.post('/api/public/career-counselling', async (req, res) => {
    try {
      const {
        applicantName,
        category,
        email,
        phone,
        currentStage,
        interests,
        strengths,
        goalSummary,
        preferredSlot,
      } = req.body as Partial<CareerCounsellingRequest>;

      if (
        !applicantName?.trim() ||
        !email?.trim() ||
        !phone?.trim() ||
        !currentStage?.trim() ||
        !goalSummary?.trim()
      ) {
        res.status(400).json({
          error: 'Applicant name, email, phone, current educational/career stage, and goal summary are required.',
        });
        return;
      }

      const interestArr = Array.isArray(interests) && interests.length > 0 ? interests : ['General Career Exploration'];
      const aiResult = await generateCareerAdvisoryDraft({
        applicantName: applicantName.trim(),
        category: category || 'School Student',
        currentStage: currentStage.trim(),
        interests: interestArr,
        strengths: strengths?.trim() || 'Analytical curiosity and dedication',
        goalSummary: goalSummary.trim(),
      });

      const db = getDb();
      const requestRecord: CareerCounsellingRequest = {
        id: `cc-${Date.now()}`,
        schoolId: null,
        applicantName: applicantName.trim(),
        category: category || 'School Student',
        email: email.trim(),
        phone: phone.trim(),
        currentStage: currentStage.trim(),
        interests: interestArr,
        strengths: strengths?.trim() || 'Consistent effort',
        goalSummary: goalSummary.trim(),
        preferredSlot: preferredSlot?.trim() || 'Next Available Weekday 16:00 IST',
        assignedCounsellor: 'Dr. Sunita Gill',
        status: 'Counsellor Assigned',
        aiAdvisoryReport: aiResult.report,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      db.careerRequests.unshift(requestRecord);
      saveDb();
      res.status(201).json({ request: requestRecord, aiGenerated: aiResult.aiGenerated });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Unable to generate career guidance right now.',
      });
    }
  });

  // ---------------- AUTHENTICATION ----------------
  app.post('/api/auth/login', loginRateLimiter, (req, res) => {
    const { userId, email, password, schoolId } = req.body as {
      userId?: string;
      email?: string;
      password?: string;
      schoolId?: string;
    };
    const db = getDb();
    const demoEnabled = isDemoLoginEnabled();
    let user: UserAccount | undefined;

    if (userId) {
      if (!demoEnabled && !password) {
        res.status(401).json({
          error: 'Demo quick-login is disabled in production. Sign in with your institutional email and password.',
        });
        return;
      }
      user = db.users.find((u) => u.id === userId);
    } else if (email) {
      user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials or pathway selected.' });
      return;
    }

    // Enforce password verification whenever a user has set a password OR when demo login is disabled
    if (user.passwordHash) {
      if (!password || !verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }
    } else if (!demoEnabled) {
      const bootstrapPass = process.env.PROD_BOOTSTRAP_PASSWORD?.trim();
      if (!bootstrapPass || !password || password !== bootstrapPass) {
        res.status(401).json({
          error: 'Password required in production mode. Contact your school administrator to activate your credentials.',
        });
        return;
      }
    }

    const token = crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const resolvedSchoolId =
      user.role === 'super_admin' || user.role === 'counsellor'
        ? schoolId ?? db.schools[0]?.id ?? null
        : user.schoolId;

    sessions.set(token, {
      token,
      userId: user.id,
      activeSchoolId: resolvedSchoolId,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: now + SESSION_IDLE_TTL_MS,
    });

    setSessionCookie(res, token, req);

    appendAuditLog({
      schoolId: resolvedSchoolId,
      actor: user,
      action: 'PORTAL_LOGIN',
      entityType: 'Session',
      entityId: user.id,
      detail: `${user.name} signed into ${user.designation} workspace.`,
    });

    res.json({
      token,
      user: sanitizeUserForClient(user),
      activeSchoolId: resolvedSchoolId,
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthedRequest, res) => {
    res.json({
      user: sanitizeUserForClient(req.user!),
      activeSchoolId: req.activeSchoolId ?? null,
    });
  });

  app.post('/api/auth/change-password', requireAuth, (req: AuthedRequest, res) => {
    const { currentPassword, newPassword } = (req.body || {}) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!newPassword || newPassword.length < 8 || newPassword.length > 128) {
      res.status(400).json({ error: 'New password must be between 8 and 128 characters.' });
      return;
    }
    const db = getDb();
    const targetUser = db.users.find((u) => u.id === req.user!.id);
    if (!targetUser) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }
    if (targetUser.passwordHash && (!currentPassword || !verifyPassword(currentPassword, targetUser.passwordHash))) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }
    targetUser.passwordHash = hashPassword(newPassword);
    appendAuditLog({
      schoolId: req.activeSchoolId ?? targetUser.schoolId,
      actor: targetUser,
      action: 'PASSWORD_UPDATED',
      entityType: 'UserAccount',
      entityId: targetUser.id,
      detail: `${targetUser.name} updated their account password.`,
    });
    saveDb(undefined, { schoolId: req.activeSchoolId ?? targetUser.schoolId });
    res.json({ ok: true });
  });

  // Protected private campus documents (never exposed under public/)
  app.get('/api/files/vis-timetable-nov2026', requireAuth, (req: AuthedRequest, res) => {
    if (req.activeSchoolId !== 'school-vis-jjr' && req.user?.role !== 'super_admin') {
      res.status(403).json({ error: 'Access restricted to authorized school members.' });
      return;
    }
    const pdfPath = path.resolve(process.cwd(), 'server/private_seeds/vis_timetable_nov2026.pdf');
    if (!fs.existsSync(pdfPath)) {
      res.status(404).json({ error: 'Timetable document not found.' });
      return;
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="VIS-Timetable-Nov2026.pdf"');
    res.sendFile(pdfPath);
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthedRequest, res) => {
    if (req.sessionToken) {
      sessions.delete(req.sessionToken);
    }
    clearSessionCookie(res, req);
    if (req.user) {
      appendAuditLog({
        schoolId: req.activeSchoolId ?? req.user.schoolId,
        actor: req.user,
        action: 'PORTAL_LOGOUT',
        entityType: 'Session',
        entityId: req.user.id,
        detail: `${req.user.name} signed out and revoked active session token.`,
      });
    }
    res.json({ ok: true });
  });

  app.post('/api/auth/switch-school', requireAuth, (req: AuthedRequest, res) => {
    if (req.user!.role !== 'super_admin' && req.user!.role !== 'counsellor') {
      res.status(403).json({
        error: 'Tenant isolation enforced: only Platform Super Admin or cross-school Counsellors can switch institutions.',
      });
      return;
    }
    const { schoolId } = req.body as { schoolId: string };
    const db = getDb();
    const exists = db.schools.some((s) => s.id === schoolId);
    if (!exists) {
      res.status(404).json({ error: 'School tenant not found.' });
      return;
    }

    const session = req.sessionToken ? sessions.get(req.sessionToken) : undefined;
    if (session) {
      session.activeSchoolId = schoolId;
    }
    res.json({ activeSchoolId: schoolId });
  });

  // Revision-stamped, strictly tenant+user scoped workspace response cache (raw + gzip + brotli)
  // Automatically invalidated per-school whenever saveDb() increments schoolRevision.
  // Single-flight deduplication prevents thundering-herd CPU spikes after a mutation.
  type CachedWorkspaceEntry = {
    revision: number;
    rawBuffer: Buffer;
    gzipBuffer: Buffer;
    brBuffer: Buffer;
  };
  const workspaceResponseCache = new Map<string, CachedWorkspaceEntry>();
  const workspaceInFlightBuilds = new Map<string, Promise<CachedWorkspaceEntry>>();

  const sendCachedWorkspaceBuffer = (
    req: Request,
    res: Response,
    entry: { rawBuffer: Buffer; gzipBuffer: Buffer; brBuffer: Buffer },
  ) => {
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    const acceptsBr = /\bbr\b/i.test(acceptEncoding);
    const acceptsGzip = /\bgzip\b/i.test(acceptEncoding);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Vary', 'Accept-Encoding');
    // Use res.end() directly on pre-compressed no-store buffers to bypass Express's per-request ETag hashing
    if (acceptsBr) {
      res.setHeader('Content-Encoding', 'br');
      res.setHeader('Content-Length', String(entry.brBuffer.byteLength));
      res.end(entry.brBuffer);
    } else if (acceptsGzip) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', String(entry.gzipBuffer.byteLength));
      res.end(entry.gzipBuffer);
    } else {
      res.setHeader('Content-Length', String(entry.rawBuffer.byteLength));
      res.end(entry.rawBuffer);
    }
  };

  // ---------------- WORKSPACE BOOTSTRAP (TENANT ISOLATED) ----------------
  app.get('/api/workspace', requireAuth, async (req: AuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    if (
      user.role === 'ssb_student' ||
      user.role === 'career_user' ||
      user.role === 'ssb_admin' ||
      user.role === 'career_admin'
    ) {
      res.status(403).json({
        error:
          'Standalone product account isolation enforced: School ERP workspace is not accessible from SSB Academy or Career Intelligence logins.',
      });
      return;
    }
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const activeSchool = db.schools.find((s) => s.id === schoolId) ?? db.schools[0];

    const cacheKey = `${schoolId}::${user.id}::${user.role}`;
    const currentRev = getSchoolRevision(schoolId);
    const cachedWorkspace = workspaceResponseCache.get(cacheKey);
    if (cachedWorkspace && cachedWorkspace.revision === currentRev) {
      sendCachedWorkspaceBuffer(req, res, cachedWorkspace);
      return;
    }

    const flightKey = `${cacheKey}::${currentRev}`;
    const existingFlight = workspaceInFlightBuilds.get(flightKey);
    if (existingFlight) {
      const entry = await existingFlight;
      sendCachedWorkspaceBuffer(req, res, entry);
      return;
    }

    const buildPromise = (async (): Promise<CachedWorkspaceEntry> => {

    const isParentOrStudent = user.role === 'parent' || user.role === 'student';
    const isCounsellor = user.role === 'counsellor';
    const isAccountant = user.role === 'accountant';
    const isLeadership = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
      user.role,
    );
    const isFinanceOperator = isLeadership || isAccountant;

    const rawSchoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
    const teacherScope =
      user.role === 'teacher' ? computeTeacherTeachingScope(user, rawSchoolTimetable) : null;

    const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
    const schoolStudents = filterStudentsForRole({
      user,
      schoolStudents: allSchoolStudents,
      teacherScope,
    }).map((s) => sanitizeStudentForRole(s, user.role));

    const visibleStudentIds = new Set(schoolStudents.map((s) => s.id));
    const visibleClassSections = new Set(schoolStudents.map((s) => s.classSection));
    const weightsConfig = db.schoolWeights[schoolId] ?? db.schoolWeights['school-svm-kk'];

    const evidenceByStudent = new Map<string, DevelopmentEvidence[]>();
    for (const ev of db.evidence) {
      if (ev.schoolId !== schoolId) continue;
      let list = evidenceByStudent.get(ev.studentId);
      if (!list) {
        list = [];
        evidenceByStudent.set(ev.studentId, list);
      }
      list.push(ev);
    }

    const allSchoolBreakdowns: Record<string, ReturnType<typeof calculateLearnersScore>> = {};
    for (const st of allSchoolStudents) {
      const stuEv = evidenceByStudent.get(st.id) || [];
      allSchoolBreakdowns[st.id] = calculateLearnersScore(stuEv, weightsConfig.weights);
    }

    const studentBreakdowns: Record<string, ReturnType<typeof calculateLearnersScore>> = {};
    for (const st of schoolStudents) {
      studentBreakdowns[st.id] = allSchoolBreakdowns[st.id];
    }

    const fullRankings = computeSchoolRankings(
      allSchoolStudents,
      allSchoolBreakdowns,
      weightsConfig.weights,
      activeSchool.code,
    );

    const rankings = filterRankingsForRole({
      role: user.role,
      fullRankings,
      visibleStudentIds,
      visibleClassSections,
    });

    const fullGrowthLeaderboards = computeSchoolGrowthLeaderboards({
      schoolCode: activeSchool.code,
      students: allSchoolStudents,
      readingReports: (db.readingReports || []).filter((r) => r.schoolId === schoolId),
      numeracyReports: (db.numeracyReports || []).filter((n) => n.schoolId === schoolId),
      readingTestSessions: (db.readingTestSessions || []).filter((rs) => rs.schoolId === schoolId),
      numeracyTestSessions: (db.numeracyTestSessions || []).filter((ns) => ns.schoolId === schoolId),
    });

    const growthLeaderboards = filterClassGrowthLeaderboardsForRole({
      role: user.role,
      fullLeaderboards: fullGrowthLeaderboards,
      visibleStudentIds,
      visibleClassSections,
    });

    const schoolEvidence = db.evidence.filter(
      (e) => e.schoolId === schoolId && visibleStudentIds.has(e.studentId),
    );
    const schoolNotebooks = isCounsellor
      ? []
      : db.notebookEntries.filter(
          (n) => n.schoolId === schoolId && visibleStudentIds.has(n.studentId),
        );
    const schoolHomeworkAssignments = isCounsellor
      ? []
      : (db.homeworkAssignments || []).filter((hw) => {
          if (hw.schoolId !== schoolId) return false;
          if (isParentOrStudent || user.role === 'teacher') {
            return visibleClassSections.has(hw.classSection);
          }
          return true;
        });
    const visibleHwIds = new Set(schoolHomeworkAssignments.map((h) => h.id));
    const schoolHomeworkSubmissions = isCounsellor
      ? []
      : (db.homeworkSubmissions || []).filter(
          (sub) =>
            sub.schoolId === schoolId &&
            visibleHwIds.has(sub.assignmentId) &&
            visibleStudentIds.has(sub.studentId),
        );
    const schoolActivities = isCounsellor
      ? []
      : (db.activityRecords || [])
          .filter((act) => {
            if (act.schoolId !== schoolId) return false;
            if (!isParentOrStudent && user.role !== 'teacher') return true;
            return (
              visibleClassSections.has(act.classSection) ||
              act.entries.some((e) => visibleStudentIds.has(e.studentId))
            );
          })
          .map((act) =>
            isParentOrStudent || user.role === 'teacher'
              ? {
                  ...act,
                  entries: act.entries.filter((e) => visibleStudentIds.has(e.studentId)),
                }
              : act,
          );
    const schoolMarks = db.examMarks.filter(
      (m) => m.schoolId === schoolId && visibleStudentIds.has(m.studentId),
    );
    const schoolAttendance = isCounsellor
      ? []
      : db.attendance.filter(
          (a) => a.schoolId === schoolId && visibleStudentIds.has(a.studentId),
        );
    const schoolReadingReports = filterStudentTelemetryForRole(
      user.role,
      db.readingReports || [],
      schoolId,
      visibleStudentIds,
    );
    const schoolNumeracyReports = filterStudentTelemetryForRole(
      user.role,
      db.numeracyReports || [],
      schoolId,
      visibleStudentIds,
    );
    const schoolReadingSessions = filterStudentTelemetryForRole(
      user.role,
      db.readingTestSessions || [],
      schoolId,
      visibleStudentIds,
    );
    const schoolNumeracySessions = filterStudentTelemetryForRole(
      user.role,
      db.numeracyTestSessions || [],
      schoolId,
      visibleStudentIds,
    );
    const schoolMonthlyAttendance = filterStudentTelemetryForRole(
      user.role,
      db.monthlyAttendance || [],
      schoolId,
      visibleStudentIds,
      { hideFromCounsellor: true },
    );
    const schoolAttendanceNotifications = sortAttendanceNotifications(
      filterStudentTelemetryForRole(
        user.role,
        db.attendanceNotifications || [],
        schoolId,
        visibleStudentIds,
        { hideFromCounsellor: true },
      ),
    );
    const schoolNotebookNotifications = sortNotebookNotifications(
      filterStudentTelemetryForRole(
        user.role,
        db.notebookNotifications || [],
        schoolId,
        visibleStudentIds,
        { hideFromCounsellor: true },
      ),
    );

    const canViewFees = ['super_admin', 'school_admin', 'principal', 'parent'].includes(user.role);
    const schoolFees = canViewFees
      ? db.feeTransactions.filter(
          (f) => f.schoolId === schoolId && visibleStudentIds.has(f.studentId),
        )
      : [];

    const visibleTimetable = filterTimetableForRole({
      user,
      schoolTimetable: rawSchoolTimetable,
      visibleClassSections,
    });

    const seededResMutated = ensureSchoolSpecificResourcesSeeded(db);
    const seededEvPlansMutated = ensureEventsAndPlansInitialized(db, schoolId);
    const seededMarksMutated = ensureMarksCategoriesInitialized(db, schoolId);
    if (seededResMutated || seededEvPlansMutated || seededMarksMutated) {
      saveDb();
    }

    const visibleResources = filterSchoolResourcesForRole({
      role: user.role,
      userName: user.name,
      resources: db.resources.filter((r) => r.schoolId === schoolId),
      visibleClassSections,
      teacherScope,
    });

    const visibleLessonPlans = filterLessonPlansForRole({
      role: user.role,
      userName: user.name,
      lessonPlans: db.lessonPlans.filter((l) => l.schoolId === schoolId),
      teacherScope,
    });

    const visibleProductionRegister =
      schoolId === 'school-vis-jjr'
        ? filterProductionRegisterForRole(user.role, PRODUCTION_REGISTER, teacherScope)
        : [];
    const visiblePacks =
      schoolId === 'school-vis-jjr'
        ? filterResourcePacksForRole(user.role, VIRAT_RESOURCE_PACKS, teacherScope)
        : [];
    const visibleVisCatalog =
      schoolId === 'school-vis-jjr'
        ? filterVisReportsCatalogForRole({
            role: user.role,
            catalog: VIS_REPORTS_CATALOG,
            visibleStudents: schoolStudents,
            teacherScope,
          })
        : [];
    const visibleCatalogFileIds = new Set(visibleVisCatalog.map((c) => c.fileId));

    const canViewComplaints = isLeadership || user.role === 'parent';

    const normalizeSchoolEntitlements = (s: School): School => {
      const planSpec = SUBSCRIPTION_PLANS.find((p) => p.id === s.subscriptionPlan);
      return {
        ...s,
        paymentStatus: s.paymentStatus || 'Paid',
        billingCycle: s.billingCycle || 'Annual',
        paidAmountInr: typeof s.paidAmountInr === 'number' ? s.paidAmountInr : planSpec?.priceMonthlyInr ?? 8999,
        validUntil: s.validUntil || '2027-03-31',
        customFeatureOverrides: s.customFeatureOverrides || {},
        enabledFeatures: getEnabledFeaturesForSchool(s),
      };
    };

    const normalizedActiveSchool = normalizeSchoolEntitlements(activeSchool);
    const normalizedAvailableSchools =
      user.role === 'super_admin' || user.role === 'counsellor'
        ? db.schools.map(normalizeSchoolEntitlements)
        : [normalizedActiveSchool];

    const workspacePayload = {
      user: sanitizeUserForClient(user),
      activeSchool: normalizedActiveSchool,
      availableSchools: normalizedAvailableSchools,
      planPricingCatalog: db.planPricingCatalog || {},
      weightsConfig,
      students: schoolStudents,
      studentBreakdowns: isAccountant ? {} : studentBreakdowns,
      rankings: isAccountant ? undefined : rankings,
      growthLeaderboards: isAccountant ? undefined : growthLeaderboards,
      evidence: isAccountant ? [] : schoolEvidence,
      notebookEntries: isAccountant ? [] : schoolNotebooks,
      notebookNotifications: isAccountant ? [] : schoolNotebookNotifications,
      homeworkAssignments: isAccountant ? [] : schoolHomeworkAssignments,
      homeworkSubmissions: isAccountant ? [] : schoolHomeworkSubmissions,
      activityRecords: isAccountant ? [] : schoolActivities,
      developmentReviews: isAccountant
        ? []
        : filterDevelopmentReviewsForRole(
            user.role,
            db.developmentReviews.filter((r) => r.schoolId === schoolId),
            visibleStudentIds,
          ),
      examMarks: isAccountant ? [] : schoolMarks,
      attendance: isAccountant ? [] : schoolAttendance,
      readingReports: isAccountant ? [] : schoolReadingReports,
      numeracyReports: isAccountant ? [] : schoolNumeracyReports,
      readingTestSessions: isAccountant ? [] : schoolReadingSessions,
      numeracyTestSessions: isAccountant ? [] : schoolNumeracySessions,
      monthlyAttendance: isAccountant ? [] : schoolMonthlyAttendance,
      attendanceNotifications: isAccountant ? [] : schoolAttendanceNotifications,
      resources: isAccountant ? [] : visibleResources,
      lessonPlans: isAccountant ? [] : visibleLessonPlans,
      timetable: isAccountant ? [] : visibleTimetable,
      admissionLeads:
        isLeadership || isCounsellor || user.role === 'teacher' || user.role === 'transport_incharge'
          ? (() => {
              const { routes: trRoutes, allocations: trAllocs } = ensureSchoolTransportInitialized(
                db,
                schoolId,
              );
              return db.admissionLeads
                .filter((a) => a.schoolId === schoolId)
                .map((lead) => {
                  if (lead.recommendedRouteId) return lead;
                  const rec = recommendRouteForLocality(
                    lead.locality,
                    lead.address || lead.notes,
                    trRoutes,
                    trAllocs,
                  );
                  if (!rec) return lead;
                  return {
                    ...lead,
                    recommendedRouteId: rec.routeId,
                    recommendedRouteCode: rec.routeCode,
                    recommendedRouteName: rec.routeName,
                    recommendedStopName: rec.stopName,
                    recommendedPickupTime: rec.pickupTime,
                    recommendedRouteConfidence: rec.confidence,
                    recommendedRouteReason: rec.reason,
                  };
                });
            })()
          : [],
      homeVisitRecords:
        isLeadership || isCounsellor || user.role === 'teacher'
          ? db.homeVisitRecords.filter((v) => v.schoolId === schoolId)
          : [],
      careerRequests:
        isCounsellor || user.role === 'super_admin'
          ? db.careerRequests
          : user.role === 'principal' || user.role === 'coordinator'
            ? db.careerRequests.filter((c) => c.schoolId === schoolId || c.schoolId === null)
            : [],
      feeTransactions: schoolFees,
      operations:
        isLeadership || user.role === 'teacher'
          ? db.operations.filter((o) => o.schoolId === schoolId)
          : [],
      parentComplaints: canViewComplaints
        ? db.parentComplaints
            .filter((c) => c.schoolId === schoolId && visibleStudentIds.has(c.studentId))
            .map((c) => sanitizeComplaintForRole(c, user.role))
        : [],
      blogArticles: isAccountant ? [] : db.blogArticles,
      auditLogs: filterAuditLogsForRole(user.role, db.auditLogs, schoolId),
      publicEnquiries:
        user.role === 'super_admin' || user.role === 'school_admin' || user.role === 'principal'
          ? db.publicEnquiries
          : [],
      cognitiveAttempts: isAccountant
        ? []
        : db.cognitiveAttempts.filter(
            (a) => a.schoolId === schoolId && visibleStudentIds.has(a.studentId),
          ),
      cognitiveAssignments: isAccountant
        ? []
        : db.cognitiveAssignments.filter((asg) => {
            if (asg.schoolId !== schoolId) return false;
            if (!isParentOrStudent && user.role !== 'teacher') return true;
            return schoolStudents.some(
              (st) =>
                st.classSection === asg.targetClassSection &&
                (!asg.studentId || asg.studentId === st.id),
            );
          }),
      remedialAssignments: isAccountant
        ? []
        : (db.remedialAssignments || []).filter(
        (asg) => asg.schoolId === schoolId && visibleStudentIds.has(asg.studentId),
      ),
      visReportsCatalog: visibleVisCatalog,
      visParsedReports:
        isParentOrStudent || user.role === 'teacher'
          ? Object.fromEntries(
              Object.entries(db.visParsedReports || {}).filter(
                ([fid]) =>
                  visibleCatalogFileIds.has(fid) ||
                  schoolStudents.some((st) => st.visReportFileId === fid),
              ),
            )
          : schoolId === 'school-vis-jjr'
            ? db.visParsedReports || {}
            : {},
      productionRegister: visibleProductionRegister,
      registerApprovals:
        isParentOrStudent || isCounsellor
          ? {}
          : Object.fromEntries(
              Object.entries(db.registerApprovals || {}).filter(([rowId]) =>
                visibleProductionRegister.some((r) => r.rowId === rowId),
              ),
            ),
      viratResourcePacks: visiblePacks,
      // Additive Virat 360° Intelligence Collections (strictly tenant & role scoped)
      thinkingQuestionBank: (db.thinkingQuestionBank || []).filter(
        (q) => q.schoolId === schoolId && q.active,
      ),
      thinkingScoringConfig: db.thinkingScoringConfigs?.[schoolId],
      thinkingAssessments: (db.thinkingAssessments || []).filter(
        (s) => s.schoolId === schoolId && visibleStudentIds.has(s.studentId),
      ),
      psychometricRecords: (db.psychometricRecords || [])
        .filter((r) => {
          if (r.schoolId !== schoolId) return false;
          if (isParentOrStudent) {
            return Boolean(r.studentId && visibleStudentIds.has(r.studentId));
          }
          return true;
        })
        .sort((a, b) => b.ts - a.ts),
      thinkingSetUsages: (db.thinkingSetUsages || []).filter((u) => u.schoolId === schoolId),
      ssbEnrollments: (db.ssbEnrollments || []).filter((e) => {
        if (e.schoolId !== schoolId) return false;
        if (isParentOrStudent) return visibleStudentIds.has(e.studentId);
        return true;
      }),
      ssbDailyAssignments: ensureTodaySsbAssignmentsForSchool(schoolId).filter((a) => {
        if (isParentOrStudent) return visibleStudentIds.has(a.studentId);
        return true;
      }),
      computerSkillBenchmarks: (db.computerSkillBenchmarks || [])
        .filter((b) => b.schoolId === schoolId)
        .sort((a, b) => a.classLevel - b.classLevel),
      computerSkillAttempts: (db.computerSkillAttempts || [])
        .filter((a) => {
          if (a.schoolId !== schoolId) return false;
          if (isParentOrStudent) return visibleStudentIds.has(a.studentId);
          return true;
        })
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
      vcipAttempts: (db.vcipAttempts || [])
        .filter((a) => {
          if (a.schoolId !== schoolId) return false;
          if (isAccountant || user.role === 'teacher') return false;
          if (isParentOrStudent) {
            if (user.role === 'parent' && db.vcipGovernanceConfigs?.[schoolId]?.parentAccessEnabled === false) {
              return false;
            }
            if (!visibleStudentIds.has(a.studentId)) return false;
            const releaseRec = (db.vcipReleaseRecords || []).find(
              (r) => r.schoolId === schoolId && r.studentId === a.studentId,
            );
            return isVcipReleaseVisibleToFamily(releaseRec);
          }
          return true;
        })
        .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt)),
      vcipBrainGymLogs: (db.vcipBrainGymLogs || [])
        .filter((g) => {
          if (g.schoolId !== schoolId) return false;
          if (isAccountant) return false;
          if (isParentOrStudent) return visibleStudentIds.has(g.studentId);
          return true;
        })
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
      vcipAuthoredQuestions: (db.vcipAuthoredQuestions || []).filter((q) => {
        if (q.schoolId !== schoolId) return false;
        if (isAccountant) return false;
        if (isParentOrStudent || user.role === 'teacher') {
          return q.approvalStatus === 'approved';
        }
        return true;
      }),
      vcipClassAssignments: isAccountant
        ? []
        : (db.vcipClassAssignments || []).filter((a) => a.schoolId === schoolId),
      vcipGovernanceConfig: db.vcipGovernanceConfigs?.[schoolId],
      vcipReleaseRecords:
        isAccountant || user.role === 'teacher'
          ? []
          : (db.vcipReleaseRecords || [])
              .filter((r) => {
                if (r.schoolId !== schoolId) return false;
                if (isParentOrStudent) {
                  if (
                    user.role === 'parent' &&
                    db.vcipGovernanceConfigs?.[schoolId]?.parentAccessEnabled === false
                  ) {
                    return false;
                  }
                  return visibleStudentIds.has(r.studentId) && isVcipReleaseVisibleToFamily(r);
                }
                return true;
              })
              .map((r) => sanitizeVcipReleaseRecordForRole(r, user.role)),
      vcipAccessLogs:
        isLeadership || isCounsellor
          ? (db.vcipAccessLogs || []).filter((l) => l.schoolId === schoolId).slice(0, 120)
          : [],
      attendanceSupportRecords:
        isParentOrStudent || isAccountant
          ? []
          : (db.attendanceSupportRecords || []).filter(
              (r) => r.schoolId === schoolId && (isLeadership || isCounsellor || visibleStudentIds.has(r.studentId)),
            ),
      mindMapResources: isAccountant
        ? []
        : filterMindMapLibrary({
            items: (db.mindMapResources || []).filter((m) => m.schoolId === schoolId),
            role: user.role,
            userId: user.id,
          }),
      accountingEntries: isFinanceOperator
        ? (db.accountingEntries || []).filter((e) => e.schoolId === schoolId)
        : [],
      payrollRegisters: isFinanceOperator
        ? (db.payrollRegisters || []).filter((p) => p.schoolId === schoolId)
        : [],
      bankReconciliationItems: isFinanceOperator
        ? (db.bankReconciliationItems || []).filter((b) => b.schoolId === schoolId)
        : [],
      accountingTasks: isFinanceOperator
        ? (db.accountingTasks || []).filter((t) => t.schoolId === schoolId)
        : [],
      schoolUsers:
        user.role === 'super_admin' || user.role === 'school_admin' || user.role === 'principal'
          ? db.users
              .filter((u) => u.schoolId === schoolId || u.schoolId === null)
              .map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                schoolId: u.schoolId,
                designation: u.designation,
                classTeacherOf: u.classTeacherOf,
                subjectSpecialty: u.subjectSpecialty,
              }))
          : [],
      clinicalCare: sanitizeClinicalBundleForRole({
        role: user.role,
        visibleStudentIds,
        userId: user.id,
        bundle: {
          consents: (db.clinicalConsents || []).filter((c) => c.schoolId === schoolId),
          developmentalHistories: (db.developmentalHistories || []).filter((d) => d.schoolId === schoolId),
          parentQuestionnaires: (db.parentQuestionnaires || []).filter((p) => p.schoolId === schoolId),
          teacherObservations: (db.teacherObservations || []).filter((t) => t.schoolId === schoolId),
          screeningCases: (db.screeningCases || []).filter((s) => s.schoolId === schoolId),
          conditionAssessments: (db.conditionAssessments || []).filter((a) => a.schoolId === schoolId),
          speechSoundTargets: (db.speechSoundTargets || []).filter((t) => t.schoolId === schoolId),
          speechExercises: (db.speechExercises || []).filter((e) => e.schoolId === schoolId),
          fluencyProfiles: (db.fluencyProfiles || []).filter((f) => f.schoolId === schoolId),
          therapyPlans: (db.therapyPlans || []).filter((p) => p.schoolId === schoolId),
          therapySessionLogs: (db.therapySessionLogs || []).filter((l) => l.schoolId === schoolId),
          audioPracticeRecords: (db.audioPracticeRecords || []).filter((a) => a.schoolId === schoolId),
          parentHomePracticeLogs: (db.parentHomePracticeLogs || []).filter((h) => h.schoolId === schoolId),
          clinicalReports: (db.clinicalReports || []).filter((r) => r.schoolId === schoolId),
          clinicalAccessLogs: (db.clinicalAccessLogs || []).filter((l) => l.schoolId === schoolId).slice(0, 120),
          specialists: db.users
            .filter(
              (u) =>
                (u.schoolId === schoolId || u.schoolId === null) &&
                ['clinical_psychologist', 'slp', 'audiologist', 'special_educator', 'counsellor'].includes(u.role),
            )
            .map((u) => ({
              userId: u.id,
              name: u.name,
              role: u.role,
              designation: u.designation,
              registrationCouncil: u.registrationCouncil || 'Rehabilitation Council of India (RCI)',
              registrationNo: u.professionalRegistrationNo || 'Institutional Verification Pending',
              scopeOfPractice: u.scopeOfPractice || u.designation,
              verified: Boolean(u.credentialVerified),
              schoolId: u.schoolId,
            })),
        },
      }),
      timetableMasterConfig: db.timetableMasterConfigs?.[schoolId],
      substituteRuleConfig: isLeadership ? db.substituteRuleConfigs?.[schoolId] : undefined,
      teacherCapabilityProfiles: isLeadership
        ? (db.teacherCapabilityProfiles || []).filter((p) => p.schoolId === schoolId)
        : [],
      capabilityBandConfig: isLeadership ? db.capabilityBandConfigs?.[schoolId] : undefined,
      substitutionAssignments:
        isLeadership || user.role === 'teacher'
          ? (db.substitutionAssignments || []).filter((c) => {
              if (c.schoolId !== schoolId) return false;
              if (user.role === 'teacher') {
                if (!c.substituteTeacherName) return false;
                return (
                  teacherMatchesSlot(c.substituteTeacherName, user.name) ||
                  teacherMatchesSlot(c.absentTeacherName, user.name)
                );
              }
              return true;
            })
          : [],
      teacherLeaveRequests:
        isLeadership
          ? (db.teacherLeaveRequests || []).filter((l) => l.schoolId === schoolId)
          : user.role === 'teacher'
            ? (db.teacherLeaveRequests || []).filter(
                (l) =>
                  l.schoolId === schoolId &&
                  (l.teacherUserId === user.id ||
                    l.teacherName.toLowerCase().includes(user.name.toLowerCase())),
              )
            : [],
      teacherLeaveBalances:
        isLeadership
          ? (db.teacherLeaveBalances || []).filter((b) => b.schoolId === schoolId)
          : user.role === 'teacher'
            ? (db.teacherLeaveBalances || []).filter(
                (b) =>
                  b.schoolId === schoolId &&
                  b.teacherName.toLowerCase().includes(user.name.toLowerCase()),
              )
            : [],
      productivityKpiConfig:
        isLeadership || user.role === 'teacher'
          ? db.productivityKpiConfigs?.[schoolId]
          : undefined,
      careerProfiles: db.careerProfiles || [],
      studentCareerPlans: (db.studentCareerPlans || []).filter(
        (p) =>
          p.schoolId === schoolId &&
          visibleStudentIds.has(p.studentId) &&
          (user.role !== 'parent' || p.sharedWithParent),
      ),
      presentationAudits:
        isParentOrStudent
          ? []
          : (db.presentationAudits || []).filter((a) => a.schoolId === schoolId),
      redesignedDecks: (db.redesignedDecks || []).filter((d) => {
        if (d.schoolId !== schoolId) return false;
        if (isParentOrStudent) {
          return d.approvalStatus === 'principal_approved' || d.approvalStatus === 'teacher_approved';
        }
        return true;
      }),
      ...(isFinanceOperator
        ? {
            feeAccounts: (db.feeAccounts || []).filter((a) => a.schoolId === schoolId),
            siblingGroups: (db.siblingGroups || []).filter((g) => g.schoolId === schoolId),
            familyAccounts: (db.familyAccounts || []).filter((f) => f.schoolId === schoolId),
            dismissedPartialMatches: (db.dismissedPartialMatches || []).filter(
              (d) => d.schoolId === schoolId,
            ),
            financialTarget: db.financialTargets?.[schoolId] ?? {
              schoolId,
              monthKey: 'November',
              year: 2026,
              overrideTargetInr: null,
            },
            feeReceipts: (db.feeReceipts || []).filter((r) => r.schoolId === schoolId),
            feeReminders: (db.feeReminders || []).filter((r) => r.schoolId === schoolId),
            feeDefaulterAlertConfig: getOrCreateDefaulterAlertConfig(schoolId),
            feeDefaulterAlertLogs: (db.feeDefaulterAlertLogs || [])
              .filter((n) => n.schoolId === schoolId)
              .slice(0, 150),
            notificationGatewayStatus: getNotificationGatewayStatus(),
            feeStructure: (() => {
              const saved = (db.feeStructure || []).filter((r) => r.schoolId === schoolId);
              if (saved.length > 0) return sortFeeStructureRows(saved);
              const session = db.schools.find((s) => s.id === schoolId)?.session || '2026-27';
              return deriveInitialFeeStructureFromAccounts(db.feeAccounts || [], schoolId, session);
            })(),
          }
        : isParentOrStudent
          ? {
              familyAccounts: (db.familyAccounts || []).filter(
                (f) =>
                  f.schoolId === schoolId &&
                  f.status === 'Merged' &&
                  f.memberStudentIds.some((id) => visibleStudentIds.has(id)),
              ),
              feeReceipts: (db.feeReceipts || []).filter((r) => {
                if (r.schoolId !== schoolId) return false;
                const linkedAccounts = (db.feeAccounts || []).filter(
                  (a) => a.schoolId === schoolId && a.studentId && visibleStudentIds.has(a.studentId),
                );
                const linkedAccIds = new Set(linkedAccounts.map((a) => a.id));
                return r.accountIds.some((id) => linkedAccIds.has(id));
              }),
              feeReminders: (db.feeReminders || []).filter(
                (r) =>
                  r.schoolId === schoolId &&
                  (r.studentIds || []).some((sid) => visibleStudentIds.has(sid)),
              ),
              feeDefaulterAlertLogs: (db.feeDefaulterAlertLogs || []).filter(
                (n) =>
                  n.schoolId === schoolId &&
                  Boolean(n.studentId && visibleStudentIds.has(n.studentId)),
              ),
            }
          : {}),
      transport: (() => {
        const { routes: trRoutes, allocations: trAllocs, attendanceToday: trAtt } =
          ensureSchoolTransportInitialized(db, schoolId);
        return buildTransportRoleBundle({
          role: user.role,
          schoolId,
          routes: trRoutes,
          allocations: trAllocs,
          attendanceToday: trAtt,
          visibleStudentIds,
        });
      })(),
      schoolEvents: isAccountant
        ? []
        : (db.schoolEvents || [])
            .filter((e) => e.schoolId === schoolId)
            .sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
      eventParticipationRequests: isAccountant
        ? []
        : (db.eventParticipationRequests || []).filter((r) => {
            if (r.schoolId !== schoolId) return false;
            if (isParentOrStudent) return visibleStudentIds.has(r.studentId);
            return true;
          }),
      eventTeacherIssues:
        isAccountant || isParentOrStudent
          ? []
          : (db.eventTeacherIssues || []).filter((i) => i.schoolId === schoolId),
      studentYearlyPlans: isAccountant
        ? []
        : (db.studentYearlyPlans || []).filter((p) => {
            if (p.schoolId !== schoolId) return false;
            if (isParentOrStudent || user.role === 'teacher') {
              return visibleStudentIds.has(p.studentId);
            }
            return true;
          }),
      absenceTargetRiskAlerts: isAccountant
        ? []
        : (db.absenceTargetRiskAlerts || []).filter((a) => {
            if (a.schoolId !== schoolId) return false;
            if (isParentOrStudent || user.role === 'teacher') {
              return visibleStudentIds.has(a.studentId);
            }
            return true;
          }),
      interactiveLearning: isAccountant
        ? undefined
        : (() => {
            const mutated = ensureInteractiveLearningInitialized(db, schoolId);
            if (mutated) saveDb();
            return buildInteractiveLearningOverviewForRole({ db, schoolId, user });
          })(),
      ...(() => {
        const campusMutated = ensureCampusAdminInitialized(db, schoolId);
        if (campusMutated) saveDb();
        return buildRoleScopedCampusAdminPayload({
          user,
          schoolId,
          visibleStudentIds,
          staffProfiles: db.staffProfiles || [],
          staffAttendance: db.staffAttendance || [],
          gatePasses: db.gatePasses || [],
          visitorLogs: db.visitorLogs || [],
          payrollRegisters: db.payrollRegisters || [],
          salaryAuditLogs: db.salaryAuditLogs || [],
          monthKey: new Date().toISOString().slice(0, 7),
        });
      })(),
      ...(() => {
        const crMutated = ensureControlRoomAndCalendarInitialized(db, schoolId);
        if (crMutated) saveDb(undefined, { schoolId });
        const cal = db.academicCalendars?.[schoolId];
        return {
          controlRoom:
            isLeadership || user.role === 'teacher'
              ? {
                  classrooms: (db.schoolClassrooms || []).filter((r) => r.schoolId === schoolId),
                  bellSchedule: db.schoolBellSchedules?.[schoolId] || [],
                  periodCheckIns: (db.periodCheckIns || []).filter((c) => c.schoolId === schoolId),
                  teacherDuties: (db.teacherDuties || []).filter((d) => d.schoolId === schoolId),
                }
              : undefined,
          academicCalendar: cal
            ? isLeadership
              ? cal
              : { ...cal, pendingDrafts: [] }
            : undefined,
        };
      })(),
    };

    const rawBuffer = Buffer.from(JSON.stringify(workspacePayload), 'utf-8');
    const [gzipBuffer, brBuffer] = await Promise.all([
      gzipAsync(rawBuffer, { level: 6 }),
      brotliAsync(rawBuffer, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
          [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },
      }),
    ]);
    const postRev = getSchoolRevision(schoolId);
    if (workspaceResponseCache.size >= 80) {
      const oldestKey = workspaceResponseCache.keys().next().value;
      if (oldestKey) workspaceResponseCache.delete(oldestKey);
    }
    const cacheEntry: CachedWorkspaceEntry = { revision: postRev, rawBuffer, gzipBuffer, brBuffer };
    workspaceResponseCache.set(cacheKey, cacheEntry);
    return cacheEntry;
    })();

    workspaceInFlightBuilds.set(flightKey, buildPromise);
    try {
      const cacheEntry = await buildPromise;
      sendCachedWorkspaceBuffer(req, res, cacheEntry);
    } finally {
      workspaceInFlightBuilds.delete(flightKey);
    }
  });

  // ---------------- NOTEBOOK CHECKING -> SINGLE-ENTRY EVIDENCE ENGINE ----------------
  app.post(
    '/api/notebooks/batch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { classSection, subject, chapter, date, rows } = req.body as {
        classSection: string;
        subject: string;
        chapter: string;
        date: string;
        rows: Array<{
          studentId: string;
          checked: boolean;
          handwriting: 'Readability' | 'Non-Readability';
          workQuality: 'A' | 'B' | 'C';
          homeworkDone: boolean;
          remarks?: string;
        }>;
      };

      if (!classSection?.trim() || !subject?.trim() || !chapter?.trim() || !date?.trim()) {
        res.status(400).json({ error: 'Class, subject, chapter, and date are required.' });
        return;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ error: 'At least one student notebook entry is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const activeSchool = db.schools.find((s) => s.id === schoolId);
      const schoolName = activeSchool?.name || 'School';
      if (!Array.isArray(db.notebookNotifications)) {
        db.notebookNotifications = [];
      }
      const savedEntries: NotebookEntry[] = [];
      const savedEvidence: DevelopmentEvidence[] = [];
      const triggeredAlerts: NotebookIncompleteNotification[] = [];
      const priorChapterBacklogAlerts: NotebookIncompleteNotification[] = [];
      let resolvedAlertsCount = 0;
      const savedChapterNum = extractNumericChapterIndex(chapter.trim());
      const batchStudentIds = new Set<string>();

      for (const row of rows) {
        const student = db.students.find(
          (s) => s.id === row.studentId && s.schoolId === schoolId,
        );
        if (!student) continue;
        batchStudentIds.add(student.id);

        const homeworkDone = Boolean(row.homeworkDone);
        const workQuality =
          row.workQuality === 'B' || row.workQuality === 'C'
            ? row.workQuality
            : homeworkDone
              ? 'A'
              : 'B';

        const entry: NotebookEntry = {
          id: `nb-${student.id}-${date}-${Date.now()}`,
          schoolId,
          studentId: student.id,
          classSection: classSection.trim(),
          subject: subject.trim(),
          chapter: chapter.trim(),
          date: date.trim(),
          checked: Boolean(row.checked),
          handwriting: row.handwriting === 'Non-Readability' ? 'Non-Readability' : 'Readability',
          workQuality,
          homeworkDone,
          remarks: row.remarks?.trim() || '',
          teacherName: req.user!.name,
        };

        const ev = mapNotebookEntryToEvidence(entry);
        // Upsert by deterministic sourceKey to prevent duplicate scoring
        const existingNbIdx = db.notebookEntries.findIndex(
          (n) =>
            n.schoolId === schoolId &&
            n.studentId === entry.studentId &&
            n.date === entry.date &&
            n.subject.toLowerCase() === entry.subject.toLowerCase() &&
            n.chapter.toLowerCase() === entry.chapter.toLowerCase(),
        );
        if (existingNbIdx >= 0) {
          db.notebookEntries[existingNbIdx] = entry;
        } else {
          db.notebookEntries.unshift(entry);
        }

        const existingEvIdx = db.evidence.findIndex(
          (e) => e.schoolId === schoolId && e.sourceKey === ev.sourceKey,
        );
        if (existingEvIdx >= 0) {
          db.evidence[existingEvIdx] = ev;
        } else {
          db.evidence.unshift(ev);
        }

        // Automated Student & Parent Alert when notebook is marked Incomplete / Not Checked
        const alertId = buildNotebookNotificationId(
          schoolId,
          student.id,
          entry.date,
          entry.subject,
          entry.chapter,
        );
        const existingAlertIdx = db.notebookNotifications.findIndex(
          (n) => n.id === alertId && n.schoolId === schoolId,
        );

        if (shouldTriggerNotebookIncompleteAlert(entry)) {
          const alert = composeNotebookIncompleteAlert({
            schoolId,
            schoolName,
            student,
            entry,
            triggeredBy: req.user!.name,
            triggeredByRole: req.user!.role,
            existing: existingAlertIdx >= 0 ? db.notebookNotifications[existingAlertIdx] : null,
          });
          if (existingAlertIdx >= 0) {
            db.notebookNotifications[existingAlertIdx] = alert;
          } else {
            db.notebookNotifications.unshift(alert);
          }
          triggeredAlerts.push(alert);
        } else if (
          existingAlertIdx >= 0 &&
          db.notebookNotifications[existingAlertIdx].status === 'Active'
        ) {
          db.notebookNotifications[existingAlertIdx] = resolveNotebookIncompleteAlert(
            db.notebookNotifications[existingAlertIdx],
            req.user!.name,
          );
          resolvedAlertsCount += 1;
        }

        // If the teacher just checked an earlier chapter (e.g. Ch. 1), auto-resolve its prior-chapter backlog alert
        if (entry.checked && savedChapterNum) {
          const gapAlertId = buildPriorChapterBacklogAlertId(
            schoolId,
            student.id,
            entry.subject,
            savedChapterNum,
          );
          const existingGapIdx = db.notebookNotifications.findIndex(
            (n) => n.id === gapAlertId && n.schoolId === schoolId && n.status === 'Active',
          );
          if (existingGapIdx >= 0) {
            db.notebookNotifications[existingGapIdx] = resolveNotebookIncompleteAlert(
              db.notebookNotifications[existingGapIdx],
              req.user!.name,
            );
            resolvedAlertsCount += 1;
          }
        }

        // Sync Work Quality C gentle review queue item automatically
        const existingRevIdx = db.developmentReviews.findIndex(
          (r) => r.schoolId === schoolId && r.sourceKey === ev.sourceKey,
        );
        if (entry.checked && entry.workQuality === 'C') {
          const revItem: DevelopmentReviewItem = {
            id: existingRevIdx >= 0 ? db.developmentReviews[existingRevIdx].id : `devrev-${Date.now()}-${student.id}`,
            schoolId,
            studentId: student.id,
            studentName: student.name,
            classSection: student.classSection,
            sourceType: 'notebook_work_quality_c',
            sourceId: entry.id,
            sourceKey: ev.sourceKey,
            subject: entry.subject,
            chapter: entry.chapter,
            summary:
              entry.remarks ||
              'Work Quality C flagged during notebook check for gentle one-on-one concept verification.',
            status: 'Pending',
            decisionNote: '',
            openedBy: req.user!.name,
            createdAt: entry.date,
          };
          if (existingRevIdx >= 0) {
            db.developmentReviews[existingRevIdx] = revItem;
          } else {
            db.developmentReviews.unshift(revItem);
          }
        } else if (existingRevIdx >= 0 && db.developmentReviews[existingRevIdx].status === 'Pending') {
          db.developmentReviews[existingRevIdx] = {
            ...db.developmentReviews[existingRevIdx],
            status: 'Withdrawn',
            decisionNote: `Updated notebook work quality to ${entry.workQuality}; pending review withdrawn.`,
            decidedBy: req.user!.name,
            decidedAt: entry.date,
          };
        }

        savedEntries.push(entry);
        savedEvidence.push(ev);
      }

      // Auto-detect Prior-Chapter Backlog Alerts (e.g., Teacher started Ch. 3 while student's Ch. 1 is still Not Checked)
      const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const schoolNotebooks = db.notebookEntries.filter((n) => n.schoolId === schoolId);
      const schoolHomeworks = (db.homeworkAssignments || []).filter((h) => h.schoolId === schoolId);
      const schoolLessons = (db.lessonPlans || []).filter((l) => l.schoolId === schoolId);
      const detectedGaps = detectPriorChapterBacklogsForClassSubject({
        classSection: classSection.trim(),
        subject: subject.trim(),
        students: schoolStudents,
        notebookEntries: schoolNotebooks,
        homeworkAssignments: schoolHomeworks,
        lessonPlans: schoolLessons,
        liveChapter: chapter.trim(),
        liveDate: date.trim(),
        targetStudentIds: batchStudentIds,
      });

      for (const gap of detectedGaps) {
        const student = schoolStudents.find((s) => s.id === gap.studentId);
        if (!student) continue;
        const gapAlertId = buildPriorChapterBacklogAlertId(
          schoolId,
          student.id,
          gap.subject,
          gap.missingChapterNum,
        );
        const existingGapIdx = db.notebookNotifications.findIndex(
          (n) => n.id === gapAlertId && n.schoolId === schoolId,
        );
        const gapAlert = composePriorChapterBacklogAlert({
          schoolId,
          schoolName,
          student,
          gap,
          triggeredBy: req.user!.name,
          triggeredByRole: req.user!.role,
          existing: existingGapIdx >= 0 ? db.notebookNotifications[existingGapIdx] : null,
        });
        if (existingGapIdx >= 0) {
          db.notebookNotifications[existingGapIdx] = gapAlert;
        } else {
          db.notebookNotifications.unshift(gapAlert);
        }
        priorChapterBacklogAlerts.push(gapAlert);
      }

      const alertParts: string[] = [];
      if (triggeredAlerts.length > 0) {
        alertParts.push(
          `Auto-dispatched ${triggeredAlerts.length} incomplete-notebook alert(s) to student(s) & parent(s).`,
        );
      }
      if (priorChapterBacklogAlerts.length > 0) {
        alertParts.push(
          `Highlighted ${priorChapterBacklogAlerts.length} prior-chapter unchecked backlog alert(s) for earlier unchecked chapter(s).`,
        );
      }
      if (resolvedAlertsCount > 0) {
        alertParts.push(
          `Auto-resolved ${resolvedAlertsCount} previous notebook alert(s).`,
        );
      }
      const alertDetail = alertParts.length > 0 ? ` ${alertParts.join(' ')}` : '';

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_NOTEBOOK_BATCH',
        entityType: 'NotebookEntry',
        entityId: `${classSection}-${subject}-${date}`,
        detail: `Recorded ${savedEntries.length} notebook checks for ${classSection} ${subject} (${chapter}); OLQ & Learners Score evidence synced automatically.${alertDetail}`,
      });

      saveDb();
      res.status(201).json({
        entries: savedEntries,
        evidence: savedEvidence,
        triggeredAlerts,
        priorChapterBacklogAlerts,
        resolvedAlertsCount,
      });
    },
  );

  // ---------------- STUDENT / PARENT ACKNOWLEDGE INCOMPLETE NOTEBOOK ALERT ----------------
  app.post(
    '/api/notebooks/notifications/:id/acknowledge',
    requireAuth,
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      if (!Array.isArray(db.notebookNotifications)) {
        res.status(404).json({ error: 'Notebook alert not found.' });
        return;
      }
      const alert = db.notebookNotifications.find(
        (n) => n.id === req.params.id && n.schoolId === schoolId,
      );
      if (!alert) {
        res.status(404).json({ error: 'Notebook incomplete alert not found.' });
        return;
      }
      if (
        (user.role === 'parent' || user.role === 'student') &&
        !(user.linkedStudentIds || []).includes(alert.studentId)
      ) {
        res.status(403).json({
          error: 'Students and parents can only acknowledge their own linked notebook alerts.',
        });
        return;
      }

      const nowIso = new Date().toISOString();
      if (user.role === 'student') {
        alert.readByStudent = true;
        alert.readByStudentAt = alert.readByStudentAt || nowIso;
        alert.acknowledgedByStudent = true;
        alert.acknowledgedByStudentAt = nowIso;
      } else {
        alert.readByParent = true;
        alert.readByParentAt = alert.readByParentAt || nowIso;
        alert.acknowledgedByParent = true;
        alert.acknowledgedByParentAt = nowIso;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ACKNOWLEDGED_NOTEBOOK_INCOMPLETE_ALERT',
        entityType: 'NotebookIncompleteNotification',
        entityId: alert.id,
        detail: `${user.name} (${user.role}) acknowledged incomplete notebook alert for ${alert.studentName} (${alert.subject} · ${alert.chapter}, ${alert.date}).`,
      });

      saveDb();
      res.json({ notification: alert });
    },
  );

  // ---------------- STUDENT DEVELOPMENT EVIDENCE & SCORING ----------------
  app.post(
    '/api/evidence',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { studentId, sourceType, summary, date, olqContributions, componentContributions } =
        req.body as Partial<DevelopmentEvidence>;

      if (!studentId || !summary?.trim() || !date) {
        res.status(400).json({ error: 'Student, date, and observation summary are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school tenant.' });
        return;
      }

      const ev: DevelopmentEvidence = {
        id: `ev-${Date.now()}`,
        schoolId,
        studentId,
        sourceKey: `obs:${studentId}:${date}:${Date.now()}`,
        sourceType: sourceType || 'teacher_observation',
        date,
        summary: summary.trim(),
        olqContributions: olqContributions || {},
        componentContributions: componentContributions || {},
        learningSignals: { classroomParticipation: 82, groupContributions: 80 },
        enteredBy: req.user!.name,
        validated: true,
      };
      db.evidence.unshift(ev);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ADDED_DEVELOPMENT_EVIDENCE',
        entityType: 'DevelopmentEvidence',
        entityId: ev.id,
        detail: `Logged ${ev.sourceType} evidence for ${student.name}: ${ev.summary}`,
      });

      saveDb();
      res.status(201).json({ evidence: ev });
    },
  );

  // ---------------- HOMEWORK ASSIGNMENTS & ROSTER (Q4 INVARIANT) ----------------
  app.post(
    '/api/homework',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const body = req.body as Partial<HomeworkAssignment>;
      const check = validateHomeworkCreateInput(body);
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const targetClassSection = body.classSection!.trim();

      if (req.user!.role === 'teacher') {
        const schoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
        const teacherScope = computeTeacherTeachingScope(req.user!, schoolTimetable);
        const visibleStudents = filterStudentsForRole({
          user: req.user!,
          schoolStudents: db.students.filter((s) => s.schoolId === schoolId),
          teacherScope,
        });
        const visibleClasses = new Set<string>([
          ...teacherScope.authorizedClassSections,
          ...visibleStudents.map((s) => s.classSection),
        ]);
        if (
          !isTeacherAuthorizedForHomeworkClass({
            role: req.user!.role,
            classSection: targetClassSection,
            visibleClassSections: visibleClasses,
          })
        ) {
          res.status(403).json({
            error: `Teachers may only assign daily homework to their scheduled/assigned classes (Class ${targetClassSection} is outside your teaching allocation).`,
          });
          return;
        }
      }

      const today = resolveTodayIsoDate();
      const assignment: HomeworkAssignment = {
        id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        schoolId,
        classSection: targetClassSection,
        subject: body.subject!.trim(),
        chapter: body.chapter?.trim() || 'Daily Practice',
        title: body.title!.trim(),
        instructions: body.instructions?.trim() || 'Complete neatly in subject notebook.',
        assignedDate: body.assignedDate?.trim() || today,
        dueDate: body.dueDate!.trim(),
        status: 'Active',
        createdBy: req.user!.name,
        updatedAt: today,
      };

      if (!Array.isArray(db.homeworkAssignments)) db.homeworkAssignments = [];
      if (!Array.isArray(db.homeworkSubmissions)) db.homeworkSubmissions = [];

      db.homeworkAssignments.unshift(assignment);

      const classStudents = db.students.filter(
        (s) => s.schoolId === schoolId && s.classSection === assignment.classSection,
      );
      const createdSubmissions: HomeworkSubmission[] = classStudents.map((st) => ({
        id: `hwsub-${assignment.id}-${st.id}`,
        schoolId,
        assignmentId: assignment.id,
        studentId: st.id,
        status: 'Pending',
        feedback: '',
        markedBy: req.user!.name,
        markedAt: today,
      }));
      db.homeworkSubmissions.unshift(...createdSubmissions);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CREATED_HOMEWORK_ASSIGNMENT',
        entityType: 'HomeworkAssignment',
        entityId: assignment.id,
        detail: `Assigned "${assignment.title}" (${assignment.subject}) to Class ${assignment.classSection} due ${assignment.dueDate}. Initialized ${createdSubmissions.length} Pending submissions (unpenalized until checked).`,
      });

      saveDb();
      res.status(201).json({ assignment, submissions: createdSubmissions });
    },
  );

  app.post(
    '/api/homework/:id/submissions',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const assignment = (db.homeworkAssignments || []).find(
        (h) => h.id === req.params.id && h.schoolId === schoolId,
      );
      if (!assignment) {
        res.status(404).json({ error: 'Homework assignment not found in active school.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const schoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
        const teacherScope = computeTeacherTeachingScope(req.user!, schoolTimetable);
        const visibleClasses = new Set<string>(teacherScope.authorizedClassSections);
        if (
          !isTeacherAuthorizedForHomeworkClass({
            role: req.user!.role,
            classSection: assignment.classSection,
            visibleClassSections: visibleClasses,
          })
        ) {
          res.status(403).json({
            error: 'Teachers may only update homework rosters for their assigned classes.',
          });
          return;
        }
      }

      const { rows } = req.body as {
        rows: Array<{
          studentId: string;
          status: HomeworkSubmissionStatus;
          feedback?: string;
        }>;
      };
      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ error: 'At least one student submission row is required.' });
        return;
      }

      if (!Array.isArray(db.homeworkSubmissions)) db.homeworkSubmissions = [];
      const today = resolveTodayIsoDate();
      const updatedSubmissions: HomeworkSubmission[] = [];

      for (const row of rows) {
        const student = db.students.find(
          (s) => s.id === row.studentId && s.schoolId === schoolId,
        );
        if (!student) continue;

        const status: HomeworkSubmissionStatus =
          row.status === 'Handed In' || row.status === 'Late' || row.status === 'Missing'
            ? row.status
            : 'Pending';

        const existingIdx = db.homeworkSubmissions.findIndex(
          (s) => s.assignmentId === assignment.id && s.studentId === student.id,
        );
        const sub: HomeworkSubmission = {
          id: existingIdx >= 0 ? db.homeworkSubmissions[existingIdx].id : `hwsub-${assignment.id}-${student.id}`,
          schoolId,
          assignmentId: assignment.id,
          studentId: student.id,
          status,
          feedback: row.feedback?.trim() || '',
          markedBy: req.user!.name,
          markedAt: today,
        };
        if (existingIdx >= 0) {
          db.homeworkSubmissions[existingIdx] = sub;
        } else {
          db.homeworkSubmissions.unshift(sub);
        }
        updatedSubmissions.push(sub);

        const sourceKey = buildHomeworkSourceKey(assignment.id, student.id);
        const ev = mapHomeworkSubmissionToEvidence(assignment, sub);
        const evIdx = db.evidence.findIndex(
          (e) => e.schoolId === schoolId && e.sourceKey === sourceKey,
        );
        if (ev) {
          if (evIdx >= 0) db.evidence[evIdx] = ev;
          else db.evidence.unshift(ev);
        } else if (evIdx >= 0) {
          // Pending/Cancelled homework must never hold penalty evidence
          db.evidence.splice(evIdx, 1);
        }
      }

      assignment.updatedAt = today;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_HOMEWORK_ROSTER',
        entityType: 'HomeworkAssignment',
        entityId: assignment.id,
        detail: `Updated ${updatedSubmissions.length} submission(s) for "${assignment.title}" (${assignment.classSection}).`,
      });

      saveDb();
      res.json({ assignment, submissions: updatedSubmissions });
    },
  );

  app.patch(
    '/api/homework/:id/cancel',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const assignment = (db.homeworkAssignments || []).find(
        (h) => h.id === req.params.id && h.schoolId === schoolId,
      );
      if (!assignment) {
        res.status(404).json({ error: 'Homework assignment not found.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const schoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
        const teacherScope = computeTeacherTeachingScope(req.user!, schoolTimetable);
        const visibleClasses = new Set<string>(teacherScope.authorizedClassSections);
        if (
          !isTeacherAuthorizedForHomeworkClass({
            role: req.user!.role,
            classSection: assignment.classSection,
            visibleClassSections: visibleClasses,
          })
        ) {
          res.status(403).json({
            error: 'Teachers may only cancel homework for their assigned classes.',
          });
          return;
        }
      }

      const { reason } = (req.body || {}) as { reason?: string };
      assignment.status = 'Cancelled';
      assignment.cancellationReason =
        reason?.trim() || 'Cancelled by teacher; excluded from scoring.';
      assignment.updatedAt = resolveTodayIsoDate();

      // Remove any linked hw:<assignmentId>:* evidence so cancelled homework never affects scores
      const prefix = `hw:${assignment.id}:`;
      db.evidence = db.evidence.filter(
        (e) => !(e.schoolId === schoolId && e.sourceKey.startsWith(prefix)),
      );

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CANCELLED_HOMEWORK_ASSIGNMENT',
        entityType: 'HomeworkAssignment',
        entityId: assignment.id,
        detail: `Cancelled homework "${assignment.title}" (${assignment.cancellationReason}); linked evidence purged.`,
      });

      saveDb();
      res.json({ assignment });
    },
  );

  // ---------------- MULTI-OLQ INCIDENT OBSERVATION (P4-1) & ACTIVITY ROSTER (P4-2) ----------------
  app.post(
    '/api/evidence/incident',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { studentId, context, summary, date, ratings } = req.body as {
        studentId?: string;
        context?: ObservationContext;
        summary?: string;
        date?: string;
        ratings?: IncidentRatingInput[];
      };

      const check = validateObservationIncidentInput({ studentId, context, summary, date, ratings });
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school tenant.' });
        return;
      }

      const ev = buildIncidentEvidence({
        schoolId,
        studentId: student.id,
        context: context!,
        summary: summary!,
        date: date!,
        ratings: ratings!,
        enteredBy: req.user!.name,
      });

      db.evidence.unshift(ev);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'LOGGED_MULTI_OLQ_INCIDENT',
        entityType: 'DevelopmentEvidence',
        entityId: ev.id,
        detail: `Logged [${context}] observation across ${ratings!.length} OLQ(s) for ${student.name}: ${summary!.trim()}`,
      });

      saveDb();
      res.status(201).json({ evidence: ev });
    },
  );

  app.post(
    '/api/activities/roster',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { classSection, kind, title, date, entries } = req.body as {
        classSection?: string;
        kind?: ActivityKind;
        title?: string;
        date?: string;
        entries?: ActivityParticipationEntry[];
      };

      if (!classSection?.trim() || !title?.trim() || !date?.trim()) {
        res.status(400).json({ error: 'Class section, activity title, and date are required.' });
        return;
      }
      if (!kind || !ACTIVITY_KINDS.some((k) => k.value === kind)) {
        res.status(400).json({ error: 'Valid activity kind is required.' });
        return;
      }
      if (!Array.isArray(entries) || entries.length === 0) {
        res.status(400).json({ error: 'At least one student participation row is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      if (!Array.isArray(db.activityRecords)) db.activityRecords = [];

      const validStudentIds = new Set(
        db.students.filter((s) => s.schoolId === schoolId).map((s) => s.id),
      );
      const cleanEntries: ActivityParticipationEntry[] = entries
        .filter((e) => validStudentIds.has(e.studentId))
        .map((e) => ({
          studentId: e.studentId,
          tookPart: Boolean(e.tookPart),
          contributionLevel: e.tookPart ? e.contributionLevel || 3 : undefined,
          note: e.note?.trim() || undefined,
        }));

      const record: ActivityRecord = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        schoolId,
        classSection: classSection.trim(),
        kind,
        title: title.trim(),
        date: date.trim(),
        recordedBy: req.user!.name,
        entries: cleanEntries,
      };
      db.activityRecords.unshift(record);

      let syncedEvidenceCount = 0;
      for (const entry of cleanEntries) {
        const ev = mapActivityParticipationToEvidence(record, entry);
        if (ev) {
          db.evidence.unshift(ev);
          syncedEvidenceCount += 1;
        }
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'LOGGED_ACTIVITY_ROSTER',
        entityType: 'ActivityRecord',
        entityId: record.id,
        detail: `Recorded ${kind} activity "${record.title}" (${record.classSection}) with ${syncedEvidenceCount} participating student evidence records.`,
      });

      saveDb();
      res.status(201).json({ activity: record, syncedEvidenceCount });
    },
  );

  app.post(
    '/api/scoring/weights',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { weights, version } = req.body as {
        weights: LearnersWeights;
        version?: string;
      };
      const check = validateLearnersWeights(weights);
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const nextVersion = version?.trim() || `v1.${db.auditLogs.length + 1}`;
      db.schoolWeights[schoolId] = {
        weights,
        version: nextVersion,
        approvedBy: `${req.user!.name} (${req.user!.designation})`,
      };

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_LEARNERS_FORMULA',
        entityType: 'LearnersWeights',
        entityId: nextVersion,
        detail: `Updated Learners Score weights to ${nextVersion}: Academic ${weights.academic}%, OLQ ${weights.olq}%, Habits ${weights.learningHabits}%, Participation ${weights.participation}%, Growth ${weights.personalGrowth}%.`,
      });

      saveDb();
      res.json({ weightsConfig: db.schoolWeights[schoolId] });
    },
  );

  app.post(
    '/api/students/:studentId/approve-report',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find(
        (s) => s.id === req.params.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const nextStatus =
        req.body.status === 'Pending Approval' || req.body.status === 'Draft'
          ? req.body.status
          : 'Approved';
      student.reportApprovalStatus = nextStatus;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'REPORT_APPROVAL_CHANGED',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Set ${student.name} Student 360° report status to ${nextStatus}.`,
      });

      saveDb();
      res.json({ student });
    },
  );

  app.post(
    '/api/students/:studentId/erikson-remedial-checkin',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find(
        (s) => s.id === req.params.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowed = filterStudentsForRole({
          user: req.user!,
          schoolStudents: [student],
          teacherScope,
        });
        if (allowed.length === 0) {
          res.status(403).json({
            error: 'Teachers may only record Erikson remedial check-ins for students in their assigned classes.',
          });
          return;
        }
      }

      const stageLabel = String(req.body.stageLabel || 'Stage 4 · Industry vs. Inferiority').trim();
      const remedialTitle = String(req.body.remedialTitle || '').trim();
      const observedProgressNote = String(req.body.observedProgressNote || '').trim();
      if (!remedialTitle || observedProgressNote.length < 6) {
        res.status(400).json({
          error: 'Provide both the remedial strategy title and an observed progress note (at least 6 characters).',
        });
        return;
      }

      const rating = Math.max(60, Math.min(98, Math.round(Number(req.body.rating) || 78)));
      const rawOlqs: unknown[] = Array.isArray(req.body.targetOlqs)
        ? req.body.targetOlqs
        : ['self_confidence', 'determination'];
      const validOlqKeys = new Set<OlqKey>([
        'effective_intelligence',
        'reasoning_ability',
        'organising_ability',
        'power_of_expression',
        'social_adaptability',
        'cooperation',
        'sense_of_responsibility',
        'initiative',
        'self_confidence',
        'speed_of_decision',
        'influence_group',
        'liveliness',
        'determination',
        'courage',
        'stamina',
      ]);
      const chosenOlqs: OlqKey[] = rawOlqs
        .filter((k): k is OlqKey => typeof k === 'string' && validOlqKeys.has(k as OlqKey))
        .slice(0, 3);
      if (chosenOlqs.length === 0) chosenOlqs.push('self_confidence', 'determination');

      const olqContributions: Partial<Record<OlqKey, number>> = {};
      for (const k of chosenOlqs) {
        olqContributions[k] = rating;
      }

      const newEvidence: DevelopmentEvidence = {
        id: `ev-erikson-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: student.id,
        sourceKey: `erikson-remedial:${student.id}:${Date.now()}`,
        date: resolveTodayIsoDate(),
        sourceType: 'teacher_observation',
        summary: `Erikson Remedial Check-In (${stageLabel}) · ${remedialTitle}: ${observedProgressNote}`,
        enteredBy: `${req.user!.name} (${req.user!.role})`,
        olqContributions,
        componentContributions: {
          olq: rating,
          personalGrowth: rating,
        },
        learningSignals: {
          selfDirectedReadiness: rating,
          consistencyOwnership: rating,
        },
        observationContext: 'Classroom',
        reviewRequired: false,
        validated: true,
      };

      db.evidence.unshift(newEvidence);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ERIKSON_REMEDIAL_CHECKIN',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `${student.name} Erikson remedial progress logged (${remedialTitle}, rating ${rating}/100).`,
      });

      saveDb();
      res.status(201).json({ evidence: newEvidence });
    },
  );

  // ---------------- DEVELOPMENTAL REMEDIAL DASHBOARD (ERIKSON + AI INTERVENTIONS) ----------------
  const VALID_ERIKSON_OLQ_KEYS = new Set<OlqKey>([
    'effective_intelligence',
    'reasoning_ability',
    'organising_ability',
    'power_of_expression',
    'social_adaptability',
    'cooperation',
    'sense_of_responsibility',
    'initiative',
    'self_confidence',
    'speed_of_decision',
    'influence_group',
    'liveliness',
    'determination',
    'courage',
    'stamina',
  ]);
  const VALID_REMEDIAL_CATS = new Set<DevelopmentalRemedialCategory>([
    'Classroom Activity',
    'Behavioral Intervention',
    'Skill Practice',
    'Parent & Home Coordination',
  ]);

  function checkTeacherStudentAccess(
    req: AuthedRequest,
    db: DatabaseState,
    schoolId: string,
    student: StudentRecord,
  ): boolean {
    if (req.user!.role !== 'teacher') return true;
    const teacherScope = computeTeacherTeachingScope(
      req.user!,
      db.timetable.filter((t) => t.schoolId === schoolId),
    );
    const allowed = filterStudentsForRole({
      user: req.user!,
      schoolStudents: [student],
      teacherScope,
    });
    return allowed.length > 0;
  }

  app.post(
    '/api/remedials/erikson/generate',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    async (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const studentId = String(req.body.studentId || '').trim();
      const focusNote = String(req.body.focusNote || '').trim().slice(0, 400);

      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (!checkTeacherStudentAccess(req, db, schoolId, student)) {
        res.status(403).json({
          error: 'Teachers may only generate developmental remedial plans for students in their assigned classes.',
        });
        return;
      }

      const studentEvidence = db.evidence.filter(
        (e) => e.schoolId === schoolId && e.studentId === student.id,
      );
      const weights = db.schoolWeights[schoolId]?.weights;
      const breakdown = calculateLearnersScore(studentEvidence, weights);
      const visProfile = student.visReportFileId
        ? db.visParsedReports?.[student.visReportFileId] || null
        : null;

      const assessment = assessStudentEriksonDevelopment({
        student,
        breakdown,
        evidence: studentEvidence,
        examMarks: db.examMarks.filter((m) => m.schoolId === schoolId && m.studentId === student.id),
        notebookEntries: db.notebookEntries.filter(
          (n) => n.schoolId === schoolId && n.studentId === student.id,
        ),
        homeworkAssignments: db.homeworkAssignments.filter(
          (h) => h.schoolId === schoolId && h.classSection === student.classSection,
        ),
        homeworkSubmissions: db.homeworkSubmissions.filter(
          (s) => s.schoolId === schoolId && s.studentId === student.id,
        ),
        readingReports: db.readingReports.filter(
          (r) => r.schoolId === schoolId && r.studentId === student.id,
        ),
        readingTestSessions: (db.readingTestSessions || []).filter(
          (r) => r.schoolId === schoolId && r.studentId === student.id,
        ),
        numeracyReports: db.numeracyReports.filter(
          (r) => r.schoolId === schoolId && r.studentId === student.id,
        ),
        numeracyTestSessions: (db.numeracyTestSessions || []).filter(
          (r) => r.schoolId === schoolId && r.studentId === student.id,
        ),
        activityRecords: db.activityRecords.filter((a) => a.schoolId === schoolId),
        cognitiveAttempts: db.cognitiveAttempts.filter(
          (c) => c.schoolId === schoolId && c.studentId === student.id,
        ),
        visProfile,
      });

      try {
        const plan = await generateEriksonRemedialPlan({ assessment, focusNote });
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'ERIKSON_AI_REMEDIAL_GENERATED',
          entityType: 'StudentRecord',
          entityId: student.id,
          detail: `Generated AI Erikson remedial plan (${plan.interventions.length} interventions) for ${student.name} (${assessment.expectedStage.stageTitle}).`,
        });
        saveDb();
        res.json({ plan });
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(502).json({
          error:
            err instanceof Error
              ? err.message
              : 'Unable to generate AI Erikson remedial plan at this time.',
        });
      }
    },
  );

  app.post(
    '/api/remedials/erikson/assign',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const studentId = String(req.body.studentId || '').trim();
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (!checkTeacherStudentAccess(req, db, schoolId, student)) {
        res.status(403).json({
          error: 'Teachers may only assign developmental remedials to students in their assigned classes.',
        });
        return;
      }

      const title = String(req.body.title || '').trim();
      const description = String(req.body.description || '').trim();
      if (title.length < 3 || description.length < 6) {
        res.status(400).json({
          error: 'Intervention title (3+ chars) and description (6+ chars) are required.',
        });
        return;
      }

      const rawCategory = String(req.body.category || 'Classroom Activity') as DevelopmentalRemedialCategory;
      const category: DevelopmentalRemedialCategory = VALID_REMEDIAL_CATS.has(rawCategory)
        ? rawCategory
        : 'Classroom Activity';

      const steps = Array.isArray(req.body.steps)
        ? req.body.steps.map((s: unknown) => String(s || '').trim()).filter(Boolean).slice(0, 5)
        : [];
      const expectedOutcome = String(
        req.body.expectedOutcome || 'Observable positive progress within 2 weeks.',
      ).trim();
      const durationLabel = String(req.body.durationLabel || '15 mins · 3x/week').trim();
      const defaultDue = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
      const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.body.dueDate || ''))
        ? String(req.body.dueDate)
        : defaultDue;

      const rawSource = String(req.body.source || 'erikson_engine');
      const source: DevelopmentalRemedialAssignment['source'] =
        rawSource === 'ai_gemini' || rawSource === 'teacher_custom' || rawSource === 'erikson_engine'
          ? rawSource
          : 'erikson_engine';

      const rawStageNum = Number(req.body.stageNumber);
      const stageNumber: 3 | 4 | 5 =
        rawStageNum === 3 || rawStageNum === 4 || rawStageNum === 5 ? rawStageNum : 4;

      const rawOlqs: unknown[] = Array.isArray(req.body.targetOlqs)
        ? req.body.targetOlqs
        : ['self_confidence', 'determination'];
      const targetOlqs: OlqKey[] = rawOlqs
        .filter((k): k is OlqKey => typeof k === 'string' && VALID_ERIKSON_OLQ_KEYS.has(k as OlqKey))
        .slice(0, 3);
      if (targetOlqs.length === 0) targetOlqs.push('self_confidence', 'determination');

      const assignment: DevelopmentalRemedialAssignment = {
        id: `rem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: student.id,
        studentName: student.name,
        classSection: student.classSection,
        stageNumber,
        expectedStageTitle: String(
          req.body.expectedStageTitle ||
            (stageNumber === 3
              ? 'Stage 3 · Initiative vs. Guilt'
              : stageNumber === 5
                ? 'Stage 5 · Identity vs. Role Confusion'
                : 'Stage 4 · Industry vs. Inferiority'),
        ).trim(),
        negativePole: String(
          req.body.negativePole ||
            (stageNumber === 3 ? 'Guilt' : stageNumber === 5 ? 'Role Confusion' : 'Inferiority'),
        ).trim(),
        positivePole: String(
          req.body.positivePole ||
            (stageNumber === 3 ? 'Initiative' : stageNumber === 5 ? 'Identity' : 'Industry'),
        ).trim(),
        title,
        category,
        description,
        steps: steps.length > 0 ? steps : [description],
        expectedOutcome,
        durationLabel,
        targetOlqs,
        source,
        assignedBy: req.user!.name,
        assignedByRole: req.user!.designation || req.user!.role,
        assignedAt: new Date().toISOString(),
        dueDate,
        status: 'Assigned',
      };

      if (!Array.isArray(db.remedialAssignments)) db.remedialAssignments = [];
      db.remedialAssignments.unshift(assignment);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ERIKSON_REMEDIAL_ASSIGNED',
        entityType: 'DevelopmentalRemedialAssignment',
        entityId: assignment.id,
        detail: `Assigned ${source === 'ai_gemini' ? 'AI-generated' : source === 'teacher_custom' ? 'custom' : 'evidence-mapped'} intervention "${title}" (${category}) to ${student.name} (${student.classSection}), due ${dueDate}.`,
      });

      saveDb();
      res.status(201).json({ assignment });
    },
  );

  app.patch(
    '/api/remedials/erikson/assignments/:assignmentId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const assignment = (db.remedialAssignments || []).find(
        (a) => a.id === req.params.assignmentId && a.schoolId === schoolId,
      );
      if (!assignment) {
        res.status(404).json({ error: 'Developmental remedial assignment not found.' });
        return;
      }

      const student = db.students.find(
        (s) => s.id === assignment.studentId && s.schoolId === schoolId,
      );
      if (student && !checkTeacherStudentAccess(req, db, schoolId, student)) {
        res.status(403).json({
          error: 'Teachers may only update developmental remedials for students in their assigned classes.',
        });
        return;
      }

      const nextStatus = String(req.body.status || '') as DevelopmentalRemedialStatus;
      if (!['Assigned', 'In Progress', 'Completed'].includes(nextStatus)) {
        res.status(400).json({ error: 'Status must be Assigned, In Progress, or Completed.' });
        return;
      }

      const wasCompleted = assignment.status === 'Completed';
      assignment.status = nextStatus;
      const completionNote =
        typeof req.body.completionNote === 'string' && req.body.completionNote.trim()
          ? req.body.completionNote.trim()
          : undefined;
      if (completionNote) {
        assignment.completionNote = completionNote;
      }

      let createdEvidence: DevelopmentEvidence | undefined;
      if (nextStatus === 'Completed' && !wasCompleted) {
        assignment.completedAt = new Date().toISOString();
        const rating = Math.max(70, Math.min(96, Math.round(Number(req.body.rating) || 82)));
        const olqContributions: Partial<Record<OlqKey, number>> = {};
        for (const k of assignment.targetOlqs) {
          olqContributions[k] = rating;
        }
        createdEvidence = {
          id: `ev-rem-done-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          schoolId,
          studentId: assignment.studentId,
          sourceKey: `erikson-assignment-completed:${assignment.id}`,
          date: resolveTodayIsoDate(),
          sourceType: 'teacher_observation',
          summary: `Completed Erikson Remedial (${assignment.expectedStageTitle}) · ${assignment.title}${completionNote ? `: ${completionNote}` : ''}`,
          enteredBy: `${req.user!.name} (${req.user!.role})`,
          olqContributions,
          componentContributions: {
            olq: rating,
            personalGrowth: rating,
          },
          learningSignals: {
            selfDirectedReadiness: rating,
            consistencyOwnership: rating,
          },
          observationContext: 'Classroom',
          reviewRequired: false,
          validated: true,
        };
        db.evidence.unshift(createdEvidence);

        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'ERIKSON_REMEDIAL_COMPLETED',
          entityType: 'DevelopmentalRemedialAssignment',
          entityId: assignment.id,
          detail: `Marked "${assignment.title}" completed for ${assignment.studentName} and credited OLQ evidence (${rating}/100).`,
        });
      } else {
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'ERIKSON_REMEDIAL_UPDATED',
          entityType: 'DevelopmentalRemedialAssignment',
          entityId: assignment.id,
          detail: `Updated "${assignment.title}" for ${assignment.studentName} to ${nextStatus}.`,
        });
      }

      saveDb();
      res.json({ assignment, evidence: createdEvidence });
    },
  );

  // ---------------- INTELLIGENCE & COGNITIVE GAMES (PRACTICE PROFILE ONLY) ----------------
  app.post('/api/cognitive/attempts', requireAuth, (req: AuthedRequest, res) => {
    const {
      studentId,
      gameId,
      difficultyLevel,
      accuracyPct,
      completionTimeSec,
      reactionTimeMs,
      errorCount,
      scorePoints,
      completed,
      challengeTag,
    } = req.body as Partial<CognitiveAttemptRecord>;

    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId!;

    const game = gameId ? getCognitiveGameById(gameId) : undefined;
    if (!game) {
      res.status(400).json({ error: 'Unknown cognitive game ID.' });
      return;
    }

    // Determine target student cleanly with explicit 403 isolation for forged IDs
    let resolvedStudentId = studentId;
    if (user.role === 'student' || user.role === 'parent') {
      const allowed = new Set(user.linkedStudentIds ?? []);
      if (resolvedStudentId && !allowed.has(resolvedStudentId)) {
        res.status(403).json({
          error: 'Access restricted: parents and students may only log attempts for linked students.',
        });
        return;
      }
      if (!resolvedStudentId) {
        resolvedStudentId = user.linkedStudentIds?.[0];
      }
    }
    const student = db.students.find(
      (s) => s.id === resolvedStudentId && s.schoolId === schoolId,
    );
    if (!student) {
      res.status(404).json({ error: 'Student record not found in active school.' });
      return;
    }

    const levelNum = Math.max(1, Math.min(5, Math.round(Number(difficultyLevel) || 1))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    const accNum = Math.max(0, Math.min(100, Number(accuracyPct ?? 0)));
    const timeSec = Math.max(1, Math.round(Number(completionTimeSec) || 1));

    const record: CognitiveAttemptRecord = {
      id: `cog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId,
      studentId: student.id,
      gameId: game.id,
      category: game.category,
      difficultyLevel: levelNum,
      accuracyPct: Number(accNum.toFixed(1)),
      completionTimeSec: timeSec,
      reactionTimeMs:
        typeof reactionTimeMs === 'number' && Number.isFinite(reactionTimeMs) && reactionTimeMs > 0
          ? Math.round(reactionTimeMs)
          : null,
      errorCount: Math.max(0, Math.round(Number(errorCount) || 0)),
      scorePoints: Math.max(0, Math.round(Number(scorePoints) || accNum)),
      completed: completed !== false,
      challengeTag:
        challengeTag === 'daily' || challengeTag === 'weekly' || challengeTag === 'assigned'
          ? challengeTag
          : 'practice',
      playedAt: new Date().toISOString(),
    };

    db.cognitiveAttempts.unshift(record);

    appendAuditLog({
      schoolId,
      actor: user,
      action: 'RECORDED_COGNITIVE_PRACTICE',
      entityType: 'CognitiveAttempt',
      entityId: record.id,
      detail: `Recorded ${game.title} (Level ${levelNum}, ${record.accuracyPct}% accuracy) for ${student.name}. Advisory practice indicator only (OLQ/Learners Score unchanged).`,
    });

    saveDb();
    res.status(201).json({ attempt: record });
  });

  app.post(
    '/api/cognitive/assignments',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { gameId, targetClassSection, studentId, recommendedLevel, dueDate, note } =
        req.body as Partial<CognitiveAssignment>;

      const game = gameId ? getCognitiveGameById(gameId) : undefined;
      if (!game) {
        res.status(400).json({ error: 'Valid cognitive game selection is required.' });
        return;
      }
      if (!targetClassSection?.trim()) {
        res.status(400).json({ error: 'Target class & section is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const levelNum = Math.max(1, Math.min(5, Math.round(Number(recommendedLevel) || 3))) as
        | 1
        | 2
        | 3
        | 4
        | 5;

      const assignment: CognitiveAssignment = {
        id: `cassign-${Date.now()}`,
        schoolId,
        gameId: game.id,
        targetClassSection: targetClassSection.trim(),
        studentId: studentId?.trim() || undefined,
        recommendedLevel: levelNum,
        teacherName: req.user!.name,
        dueDate: dueDate?.trim() || '2026-11-24',
        note: note?.trim() || `${game.category} guided cognitive practice.`,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      db.cognitiveAssignments.unshift(assignment);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ASSIGNED_COGNITIVE_GAME',
        entityType: 'CognitiveAssignment',
        entityId: assignment.id,
        detail: `Assigned ${game.title} (Level ${levelNum}) to Class ${assignment.targetClassSection}.`,
      });

      saveDb();
      res.status(201).json({ assignment });
    },
  );

  // ---------------- EXAMS & ATTENDANCE ----------------
  app.post(
    '/api/exams/marks',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { studentId, examName, subject, maxMarks, obtainedMarks, conceptualGap } =
        req.body as Partial<ExamMark>;

      if (!studentId || !examName?.trim() || !subject?.trim()) {
        res.status(400).json({ error: 'Student, exam name, and subject are required.' });
        return;
      }
      const max = Number(maxMarks) || 100;
      const obtained = Number(obtainedMarks);
      if (!Number.isFinite(obtained) || obtained < 0 || obtained > max) {
        res.status(400).json({ error: `Obtained marks must be between 0 and ${max}.` });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const date = new Date().toISOString().slice(0, 10);
      const mark: ExamMark = {
        id: `mk-${Date.now()}`,
        schoolId,
        studentId,
        examName: examName.trim(),
        subject: subject.trim(),
        maxMarks: max,
        obtainedMarks: obtained,
        date,
        conceptualGap: conceptualGap?.trim() || undefined,
      };
      db.examMarks.unshift(mark);

      const pct = Math.round((obtained / max) * 100);
      const ev: DevelopmentEvidence = {
        id: `ev-exam-${Date.now()}`,
        schoolId,
        studentId,
        sourceKey: `exam:${studentId}:${examName.trim().toLowerCase()}:${subject.trim().toLowerCase()}`,
        sourceType: 'exam',
        subject: subject.trim(),
        date,
        summary: `${examName.trim()} (${subject.trim()}): ${obtained}/${max} (${pct}%)`,
        olqContributions: {
          effective_intelligence: Math.max(55, Math.min(96, pct)),
          reasoning_ability: Math.max(55, Math.min(96, pct)),
        },
        componentContributions: { academic: pct },
        learningSignals: {},
        enteredBy: req.user!.name,
        validated: true,
      };
      const idx = db.evidence.findIndex(
        (e) => e.schoolId === schoolId && e.sourceKey === ev.sourceKey,
      );
      if (idx >= 0) db.evidence[idx] = ev;
      else db.evidence.unshift(ev);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_EXAM_MARKS',
        entityType: 'ExamMark',
        entityId: mark.id,
        detail: `Recorded ${obtained}/${max} in ${subject} (${examName}) for ${student.name}.`,
      });

      saveDb();
      res.status(201).json({ mark, evidence: ev });
    },
  );

  app.post(
    '/api/exams/marks/batch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { classSection, examName, subject, maxMarks, date, rows } = req.body as {
        classSection?: string;
        examName?: string;
        subject?: string;
        maxMarks?: number;
        date?: string;
        rows?: Array<{
          studentId: string;
          obtainedMarks: number;
          conceptualGap?: string;
        }>;
      };

      if (!classSection?.trim() || !examName?.trim() || !subject?.trim()) {
        res.status(400).json({ error: 'Class section, exam name, and subject are required.' });
        return;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ error: 'At least one student UT mark row is required.' });
        return;
      }

      const max = Math.max(1, Number(maxMarks) || 50);
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const cleanClass = classSection.trim();
      const cleanExam = examName.trim();
      const cleanSubject = subject.trim();
      const cleanDate = date?.trim() || '2026-11-16';

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        if (!canTeacherAccessSubjectResource(teacherScope, cleanClass, cleanSubject)) {
          res.status(403).json({
            error:
              'UT marks entry restricted: teachers may only record marks for their assigned classes and subjects.',
          });
          return;
        }
      }

      const savedMarks: ExamMark[] = [];
      for (const row of rows) {
        const student = db.students.find(
          (s) => s.id === row.studentId && s.schoolId === schoolId && s.classSection === cleanClass,
        );
        if (!student) continue;
        const obtained = Number(row.obtainedMarks);
        if (!Number.isFinite(obtained) || obtained < 0 || obtained > max) continue;

        const existingIdx = db.examMarks.findIndex(
          (m) =>
            m.schoolId === schoolId &&
            m.studentId === student.id &&
            m.examName.toLowerCase() === cleanExam.toLowerCase() &&
            m.subject.toLowerCase() === cleanSubject.toLowerCase(),
        );
        const mark: ExamMark = {
          id:
            existingIdx >= 0
              ? db.examMarks[existingIdx].id
              : `mk-${student.id}-${cleanExam.replace(/\s+/g, '').toLowerCase()}-${cleanSubject.replace(/\s+/g, '').toLowerCase()}`,
          schoolId,
          studentId: student.id,
          examName: cleanExam,
          subject: cleanSubject,
          maxMarks: max,
          obtainedMarks: obtained,
          date: cleanDate,
          conceptualGap: row.conceptualGap?.trim() || undefined,
        };
        if (existingIdx >= 0) db.examMarks[existingIdx] = mark;
        else db.examMarks.unshift(mark);
        savedMarks.push(mark);

        const pct = Math.round((obtained / max) * 100);
        const sourceKey = `exam:${student.id}:${cleanExam.toLowerCase()}:${cleanSubject.toLowerCase()}`;
        const ev: DevelopmentEvidence = {
          id: `ev-${mark.id}`,
          schoolId,
          studentId: student.id,
          sourceKey,
          sourceType: 'exam',
          subject: cleanSubject,
          date: cleanDate,
          summary: `${cleanExam} (${cleanSubject}): ${obtained}/${max} (${pct}%)`,
          olqContributions: {
            effective_intelligence: Math.max(55, Math.min(96, pct)),
            reasoning_ability: Math.max(55, Math.min(96, pct)),
          },
          componentContributions: { academic: pct },
          learningSignals: {},
          enteredBy: req.user!.name,
          validated: true,
        };
        const evIdx = db.evidence.findIndex(
          (e) => e.schoolId === schoolId && e.sourceKey === sourceKey,
        );
        if (evIdx >= 0) db.evidence[evIdx] = ev;
        else db.evidence.unshift(ev);
      }

      if (savedMarks.length === 0) {
        res.status(400).json({ error: 'No valid student marks rows matched the selected class.' });
        return;
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_UT_MARKS_BATCH',
        entityType: 'ExamMark',
        entityId: `${cleanClass}-${cleanExam}-${cleanSubject}`,
        detail: `Recorded ${savedMarks.length} ${cleanExam} (${cleanSubject}) marks for Class ${cleanClass}.`,
      });

      saveDb();
      res.status(201).json({ marks: savedMarks });
    },
  );

  app.post(
    '/api/reports/reading',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { studentId, month, year, wpm, accuracyPct, comprehensionPct, remarks } = req.body as {
        studentId?: string;
        month?: string;
        year?: number;
        wpm?: number;
        accuracyPct?: number;
        comprehensionPct?: number;
        remarks?: string;
      };

      if (!studentId || !month || !ACTIVE_SESSION_MONTHS.includes(month as (typeof ACTIVE_SESSION_MONTHS)[number])) {
        res.status(400).json({ error: 'Valid studentId and academic month (April–November) are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowedStudents = filterStudentsForRole({
          user: req.user!,
          schoolStudents: [student],
          teacherScope,
        });
        if (allowedStudents.length === 0) {
          res.status(403).json({
            error: 'Reading evaluation restricted: teachers may only log reports for students in their assigned classes.',
          });
          return;
        }
      }

      const cleanWpm = Math.max(20, Math.min(240, Math.round(Number(wpm) || 85)));
      const cleanAcc = Math.max(0, Math.min(100, Math.round(Number(accuracyPct) || 75)));
      const cleanComp = Math.max(0, Math.min(100, Math.round(Number(comprehensionPct) || 75)));
      const overallPct = Math.round(cleanAcc * 0.5 + cleanComp * 0.5);
      const resolvedMonth = month as (typeof ACTIVE_SESSION_MONTHS)[number];
      const resolvedYear = Number(year) || 2026;
      const readingBand = computeReadingBand(overallPct);

      if (!Array.isArray(db.readingReports)) db.readingReports = [];
      const existingIdx = db.readingReports.findIndex(
        (r) =>
          r.schoolId === schoolId &&
          r.studentId === student.id &&
          r.month === resolvedMonth &&
          r.year === resolvedYear,
      );

      const report: MonthlyReadingReport = {
        id:
          existingIdx >= 0
            ? db.readingReports[existingIdx].id
            : `read-${schoolId}-${student.id}-${resolvedMonth.toLowerCase()}`,
        schoolId,
        studentId: student.id,
        month: resolvedMonth,
        year: resolvedYear,
        wpm: cleanWpm,
        accuracyPct: cleanAcc,
        comprehensionPct: cleanComp,
        overallPct,
        readingBand,
        remarks:
          remarks?.trim() ||
          `${readingBand} reading progress (${cleanWpm} WPM, ${overallPct}% overall).`,
        assessedBy: req.user!.name,
        assessedAt: new Date().toISOString().slice(0, 10),
      };

      if (existingIdx >= 0) db.readingReports[existingIdx] = report;
      else db.readingReports.unshift(report);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_MONTHLY_READING_REPORT',
        entityType: 'MonthlyReadingReport',
        entityId: report.id,
        detail: `Logged ${resolvedMonth} ${resolvedYear} reading report for ${student.name}: ${overallPct}% (${readingBand}, ${cleanWpm} WPM).`,
      });

      saveDb();
      res.status(201).json({ report });
    },
  );

  app.post(
    '/api/reports/numeracy',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const {
        studentId,
        month,
        year,
        tablesFluencyPct,
        mentalMathPct,
        problemSolvingPct,
        conceptualGap,
        remarks,
      } = req.body as {
        studentId?: string;
        month?: string;
        year?: number;
        tablesFluencyPct?: number;
        mentalMathPct?: number;
        problemSolvingPct?: number;
        conceptualGap?: string;
        remarks?: string;
      };

      if (!studentId || !month || !ACTIVE_SESSION_MONTHS.includes(month as (typeof ACTIVE_SESSION_MONTHS)[number])) {
        res.status(400).json({ error: 'Valid studentId and academic month (April–November) are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowedStudents = filterStudentsForRole({
          user: req.user!,
          schoolStudents: [student],
          teacherScope,
        });
        if (allowedStudents.length === 0) {
          res.status(403).json({
            error: 'Numeracy evaluation restricted: teachers may only log reports for students in their assigned classes.',
          });
          return;
        }
      }

      const cleanTables = Math.max(0, Math.min(100, Math.round(Number(tablesFluencyPct) || 75)));
      const cleanMental = Math.max(0, Math.min(100, Math.round(Number(mentalMathPct) || 75)));
      const cleanProblem = Math.max(0, Math.min(100, Math.round(Number(problemSolvingPct) || 75)));
      const overallPct = Math.round(cleanTables * 0.35 + cleanMental * 0.35 + cleanProblem * 0.3);
      const resolvedMonth = month as (typeof ACTIVE_SESSION_MONTHS)[number];
      const resolvedYear = Number(year) || 2026;

      if (!Array.isArray(db.numeracyReports)) db.numeracyReports = [];
      const existingIdx = db.numeracyReports.findIndex(
        (r) =>
          r.schoolId === schoolId &&
          r.studentId === student.id &&
          r.month === resolvedMonth &&
          r.year === resolvedYear,
      );

      const report: MonthlyNumeracyReport = {
        id:
          existingIdx >= 0
            ? db.numeracyReports[existingIdx].id
            : `num-${schoolId}-${student.id}-${resolvedMonth.toLowerCase()}`,
        schoolId,
        studentId: student.id,
        month: resolvedMonth,
        year: resolvedYear,
        tablesFluencyPct: cleanTables,
        mentalMathPct: cleanMental,
        problemSolvingPct: cleanProblem,
        overallPct,
        conceptualGap: conceptualGap?.trim() || undefined,
        remarks:
          remarks?.trim() ||
          `Numeracy overall ${overallPct}% (Tables ${cleanTables}%, Mental Math ${cleanMental}%).`,
        assessedBy: req.user!.name,
        assessedAt: new Date().toISOString().slice(0, 10),
      };

      if (existingIdx >= 0) db.numeracyReports[existingIdx] = report;
      else db.numeracyReports.unshift(report);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_MONTHLY_NUMERACY_REPORT',
        entityType: 'MonthlyNumeracyReport',
        entityId: report.id,
        detail: `Logged ${resolvedMonth} ${resolvedYear} numeracy report for ${student.name}: ${overallPct}% overall.`,
      });

      saveDb();
      res.status(201).json({ report });
    },
  );

  app.post(
    '/api/assessments/reading',
    requireAuth,
    requireRoles([
      'super_admin',
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
    ]),
    (req: AuthedRequest, res) => {
      const body = req.body as Partial<ReadingTestSession> & { syncMonthlyReport?: boolean };
      const studentId = body.studentId;
      if (!studentId) {
        res.status(400).json({ error: 'studentId is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (req.user!.role === 'parent' || req.user!.role === 'student') {
        const linked = req.user!.linkedStudentIds || [];
        if (!linked.includes(student.id)) {
          res.status(403).json({
            error: 'Reading diagnostic restricted to your own linked student profile.',
          });
          return;
        }
      } else if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowedStudents = filterStudentsForRole({
          user: req.user!,
          schoolStudents: [student],
          teacherScope,
        });
        if (allowedStudents.length === 0) {
          res.status(403).json({
            error: 'Teachers may only record reading diagnostics for students in their assigned classes.',
          });
          return;
        }
      }

      const resolvedMonth = ACTIVE_SESSION_MONTHS.includes(
        body.month as (typeof ACTIVE_SESSION_MONTHS)[number],
      )
        ? (body.month as (typeof ACTIVE_SESSION_MONTHS)[number])
        : 'November';
      const resolvedYear = Number(body.year) || 2026;
      const cleanWpm = Math.max(10, Math.min(240, Math.round(Number(body.wpm) || 60)));
      const cleanPron = Math.max(0, Math.min(100, Math.round(Number(body.pronunciationPct) || 75)));
      const cleanAcc = Math.max(0, Math.min(100, Math.round(Number(body.accuracyPct) || cleanPron)));
      const cleanComp = Math.max(0, Math.min(100, Math.round(Number(body.comprehensionPct) || 75)));
      const cleanTrans = Math.max(0, Math.min(100, Math.round(Number(body.translationPct) || 75)));
      const cleanOverall = Math.max(
        0,
        Math.min(100, Math.round(Number(body.overallPct) || Math.round((cleanAcc + cleanComp + cleanTrans) / 3))),
      );
      const readingBand = computeReadingBand(cleanOverall);

      const session: ReadingTestSession = {
        id: `rts-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: student.id,
        month: resolvedMonth,
        year: resolvedYear,
        passageId: body.passageId || 'custom-passage',
        passageTitle: body.passageTitle || 'Live Reading Assessment',
        classTier: body.classTier || 'class_6_8',
        captureMode: body.captureMode === 'microphone' ? 'microphone' : 'assisted_pacer',
        wordsRead: Math.max(0, Math.round(Number(body.wordsRead) || 0)),
        totalPassageWords: Math.max(1, Math.round(Number(body.totalPassageWords) || 40)),
        elapsedSeconds: Math.max(1, Math.round(Number(body.elapsedSeconds) || 30)),
        wpm: cleanWpm,
        pronunciationPct: cleanPron,
        accuracyPct: cleanAcc,
        avgBurstWords: Math.max(0, Number(Number(body.avgBurstWords || 1).toFixed(1))),
        maxBurstWords: Math.max(0, Math.round(Number(body.maxBurstWords) || 1)),
        burstOneWordPct: Math.max(0, Math.min(100, Math.round(Number(body.burstOneWordPct) || 0))),
        burstTwoWordsPct: Math.max(0, Math.min(100, Math.round(Number(body.burstTwoWordsPct) || 0))),
        burstThreePlusPct: Math.max(0, Math.min(100, Math.round(Number(body.burstThreePlusPct) || 0))),
        burstWholeSentencePct: Math.max(
          0,
          Math.min(100, Math.round(Number(body.burstWholeSentencePct) || 0)),
        ),
        dominantFluencyStyle: body.dominantFluencyStyle || 'Phrase Reader (3+ words/go)',
        comprehensionPct: cleanComp,
        translationPct: cleanTrans,
        overallPct: cleanOverall,
        readingBand,
        mispronouncedWords: Array.isArray(body.mispronouncedWords)
          ? body.mispronouncedWords.slice(0, 20)
          : [],
        translationPrompt: String(body.translationPrompt || ''),
        studentTranslation: String(body.studentTranslation || ''),
        assessedBy: `${req.user!.name} (${req.user!.role})`,
        assessedAt: new Date().toISOString().slice(0, 10),
      };

      if (!Array.isArray(db.readingTestSessions)) db.readingTestSessions = [];
      db.readingTestSessions.unshift(session);

      let syncedReport: MonthlyReadingReport | null = null;
      if (body.syncMonthlyReport !== false) {
        if (!Array.isArray(db.readingReports)) db.readingReports = [];
        const existingIdx = db.readingReports.findIndex(
          (r) =>
            r.schoolId === schoolId &&
            r.studentId === student.id &&
            r.month === resolvedMonth &&
            r.year === resolvedYear,
        );
        syncedReport = {
          id:
            existingIdx >= 0
              ? db.readingReports[existingIdx].id
              : `read-${schoolId}-${student.id}-${resolvedMonth.toLowerCase()}`,
          schoolId,
          studentId: student.id,
          month: resolvedMonth,
          year: resolvedYear,
          wpm: cleanWpm,
          accuracyPct: cleanAcc,
          comprehensionPct: Math.round((cleanComp + cleanTrans) / 2),
          overallPct: cleanOverall,
          readingBand,
          remarks: `Live diagnostic (${session.dominantFluencyStyle}, ${cleanWpm} WPM, Pronunciation ${cleanPron}%, Comprehension ${cleanComp}%, Translation ${cleanTrans}%).`,
          assessedBy: req.user!.name,
          assessedAt: session.assessedAt,
        };
        if (existingIdx >= 0) db.readingReports[existingIdx] = syncedReport;
        else db.readingReports.unshift(syncedReport);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'COMPLETED_LIVE_READING_TEST',
        entityType: 'ReadingTestSession',
        entityId: session.id,
        detail: `${student.name} completed live reading test "${session.passageTitle}" (${cleanWpm} WPM, ${session.dominantFluencyStyle}, Comp ${cleanComp}%, Trans ${cleanTrans}%).`,
      });

      saveDb();
      res.status(201).json({ session, report: syncedReport });
    },
  );

  app.post(
    '/api/assessments/numeracy',
    requireAuth,
    requireRoles([
      'super_admin',
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
      'parent',
      'student',
    ]),
    (req: AuthedRequest, res) => {
      const body = req.body as Partial<NumeracyTestSession> & { syncMonthlyReport?: boolean };
      const studentId = body.studentId;
      if (!studentId) {
        res.status(400).json({ error: 'studentId is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (req.user!.role === 'parent' || req.user!.role === 'student') {
        const linked = req.user!.linkedStudentIds || [];
        if (!linked.includes(student.id)) {
          res.status(403).json({
            error: 'Numeracy diagnostic restricted to your own linked student profile.',
          });
          return;
        }
      } else if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowedStudents = filterStudentsForRole({
          user: req.user!,
          schoolStudents: [student],
          teacherScope,
        });
        if (allowedStudents.length === 0) {
          res.status(403).json({
            error: 'Teachers may only record numeracy diagnostics for students in their assigned classes.',
          });
          return;
        }
      }

      const resolvedMonth = ACTIVE_SESSION_MONTHS.includes(
        body.month as (typeof ACTIVE_SESSION_MONTHS)[number],
      )
        ? (body.month as (typeof ACTIVE_SESSION_MONTHS)[number])
        : 'November';
      const resolvedYear = Number(body.year) || 2026;
      const cleanAcc = Math.max(0, Math.min(100, Math.round(Number(body.accuracyPct) || 0)));
      const cleanSpeed = Math.max(0, Math.min(100, Math.round(Number(body.speedScorePct) || 0)));
      const cleanTablesFluency = Math.max(
        0,
        Math.min(100, Math.round(Number(body.tablesFluencyPct) || Math.round(cleanAcc * 0.65 + cleanSpeed * 0.35))),
      );

      const session: NumeracyTestSession = {
        id: `nts-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: student.id,
        month: resolvedMonth,
        year: resolvedYear,
        classTier: body.classTier || 'class_6_8',
        tableRangeLabel: body.tableRangeLabel || 'Tables 6 to 16',
        questionMode:
          body.questionMode === 'mixed_missing_factor' ? 'mixed_missing_factor' : 'standard',
        timeLimitSeconds: Math.max(15, Math.round(Number(body.timeLimitSeconds) || 60)),
        elapsedSeconds: Math.max(1, Math.round(Number(body.elapsedSeconds) || 30)),
        totalQuestions: Math.max(1, Math.round(Number(body.totalQuestions) || 15)),
        attemptedCount: Math.max(0, Math.round(Number(body.attemptedCount) || 0)),
        correctCount: Math.max(0, Math.round(Number(body.correctCount) || 0)),
        accuracyPct: cleanAcc,
        avgResponseMs: Math.max(0, Math.round(Number(body.avgResponseMs) || 0)),
        questionsPerMinute: Math.max(0, Number(Number(body.questionsPerMinute || 0).toFixed(1))),
        speedScorePct: cleanSpeed,
        tablesFluencyPct: cleanTablesFluency,
        weakTables: Array.isArray(body.weakTables) ? body.weakTables.slice(0, 15) : [],
        tableBreakdown: Array.isArray(body.tableBreakdown) ? body.tableBreakdown.slice(0, 20) : [],
        timedOut: Boolean(body.timedOut),
        conceptualGap: body.conceptualGap?.trim() || undefined,
        assessedBy: `${req.user!.name} (${req.user!.role})`,
        assessedAt: new Date().toISOString().slice(0, 10),
      };

      if (!Array.isArray(db.numeracyTestSessions)) db.numeracyTestSessions = [];
      db.numeracyTestSessions.unshift(session);

      let syncedReport: MonthlyNumeracyReport | null = null;
      if (body.syncMonthlyReport !== false) {
        if (!Array.isArray(db.numeracyReports)) db.numeracyReports = [];
        const existingIdx = db.numeracyReports.findIndex(
          (r) =>
            r.schoolId === schoolId &&
            r.studentId === student.id &&
            r.month === resolvedMonth &&
            r.year === resolvedYear,
        );
        const existing = existingIdx >= 0 ? db.numeracyReports[existingIdx] : undefined;
        const mentalMathPct = existing
          ? Math.round((existing.mentalMathPct + cleanSpeed) / 2)
          : cleanSpeed;
        const problemSolvingPct = existing ? existing.problemSolvingPct : cleanAcc;
        const overallPct = Math.round(
          cleanTablesFluency * 0.35 + mentalMathPct * 0.35 + problemSolvingPct * 0.3,
        );

        syncedReport = {
          id: existing ? existing.id : `num-${schoolId}-${student.id}-${resolvedMonth.toLowerCase()}`,
          schoolId,
          studentId: student.id,
          month: resolvedMonth,
          year: resolvedYear,
          tablesFluencyPct: cleanTablesFluency,
          mentalMathPct,
          problemSolvingPct,
          overallPct,
          conceptualGap: session.conceptualGap,
          remarks: `Timed Jumbled Tables (${session.tableRangeLabel}): ${session.correctCount}/${session.totalQuestions} correct (${cleanAcc}%), ${session.questionsPerMinute} QPM (${cleanSpeed}% speed).`,
          assessedBy: req.user!.name,
          assessedAt: session.assessedAt,
        };
        if (existingIdx >= 0) db.numeracyReports[existingIdx] = syncedReport;
        else db.numeracyReports.unshift(syncedReport);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'COMPLETED_TIMED_TABLES_TEST',
        entityType: 'NumeracyTestSession',
        entityId: session.id,
        detail: `${student.name} completed timed jumbled tables (${session.tableRangeLabel}): ${session.correctCount}/${session.totalQuestions} (${cleanAcc}% accuracy, ${session.questionsPerMinute} QPM).`,
      });

      saveDb();
      res.status(201).json({ session, report: syncedReport });
    },
  );

  function upsertParentAttendanceNotification(params: {
    db: DatabaseState;
    schoolId: string;
    schoolName: string;
    student: StudentRecord;
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
    contextNote?: string;
    customMessage?: string;
    actor: UserAccount;
  }): ParentAttendanceNotification {
    if (!Array.isArray(params.db.attendanceNotifications)) {
      params.db.attendanceNotifications = [];
    }
    const notifId = buildAttendanceNotificationId(params.schoolId, params.date, params.student.id);
    const existingIdx = params.db.attendanceNotifications.findIndex(
      (n) =>
        n.id === notifId ||
        (n.schoolId === params.schoolId &&
          n.studentId === params.student.id &&
          n.date === params.date),
    );
    const existing = existingIdx >= 0 ? params.db.attendanceNotifications[existingIdx] : null;
    const msg = composeParentAttendanceMessage({
      schoolId: params.schoolId,
      schoolName: params.schoolName,
      student: params.student,
      date: params.date,
      status: params.status,
      contextNote: params.contextNote,
      customMessage: params.customMessage,
      sentBy: params.actor.name,
      sentByRole: params.actor.role,
      existing,
    });
    if (existingIdx >= 0) {
      params.db.attendanceNotifications[existingIdx] = msg;
    } else {
      params.db.attendanceNotifications.unshift(msg);
    }
    return msg;
  }

  app.post(
    '/api/attendance',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const {
        studentId,
        date,
        status,
        contextNote,
        notifyParent = true,
        customNotificationMessage,
      } = req.body as Partial<AttendanceRecord> & {
        notifyParent?: boolean;
        customNotificationMessage?: string;
      };
      if (!studentId || !date || !status) {
        res.status(400).json({ error: 'Student, date, and attendance status are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const school = db.schools.find((s) => s.id === schoolId);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const cleanDate = date.trim();
      const recId = buildBatchAttendanceRecordId(schoolId, cleanDate, student.id);
      const existingIdx = db.attendance.findIndex(
        (a) =>
          a.id === recId ||
          (a.schoolId === schoolId && a.studentId === student.id && a.date === cleanDate),
      );
      const prevStatus = existingIdx >= 0 ? db.attendance[existingIdx].status : null;

      const rec: AttendanceRecord = {
        id: existingIdx >= 0 ? db.attendance[existingIdx].id : recId,
        schoolId,
        studentId,
        date: cleanDate,
        status,
        correctedBy: req.user!.name,
        contextNote: contextNote?.trim() || undefined,
      };
      if (existingIdx >= 0) {
        db.attendance[existingIdx] = rec;
      } else {
        db.attendance.unshift(rec);
      }

      if (!Array.isArray(db.monthlyAttendance)) db.monthlyAttendance = [];
      reconcileMonthlyAttendanceAfterMark({
        monthlyAttendance: db.monthlyAttendance,
        schoolId,
        studentId: student.id,
        date: cleanDate,
        prevStatus,
        nextStatus: status,
      });

      const studentRecords = db.attendance.filter(
        (a) => a.schoolId === schoolId && a.studentId === student.id,
      );
      student.attendancePct = computeUpdatedStudentAttendancePct(
        studentRecords,
        student.id,
        student.attendancePct,
      );

      let dispatchedNotification: ParentAttendanceNotification | null = null;
      if (notifyParent !== false) {
        dispatchedNotification = upsertParentAttendanceNotification({
          db,
          schoolId,
          schoolName: school?.name || 'School Campus',
          student,
          date: cleanDate,
          status,
          contextNote: rec.contextNote,
          customMessage: customNotificationMessage,
          actor: req.user!,
        });
      }

      const absenceRiskAlert = recordAbsenceRiskAlertOnAttendance(db, {
        schoolId,
        schoolName: school?.name || 'School Campus',
        student,
        date: cleanDate,
        status,
        actorName: req.user!.name,
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_ATTENDANCE',
        entityType: 'AttendanceRecord',
        entityId: rec.id,
        detail: `Marked ${student.name} as ${status} on ${cleanDate}.${dispatchedNotification ? ' Parent notified via app.' : ''}${absenceRiskAlert ? ` Yearly-target risk alert (${absenceRiskAlert.riskLevel}) dispatched to parent & management.` : ''} (Note: Attendance never automatically determines OLQ scores.)`,
      });

      saveDb();
      res.status(201).json({
        attendance: rec,
        notification: dispatchedNotification,
        absenceRiskAlert,
        notificationsSent: dispatchedNotification ? 1 : 0,
      });
    },
  );

  // ---------------- ONE-GO WHOLE-CLASS ATTENDANCE ROSTER ----------------
  app.post(
    '/api/attendance/roster',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const {
        classSection,
        date,
        entries,
        defaultContextNote,
        notifyParents = true,
        notificationMessage,
        markingMode = 'manual',
        deviceId,
      } = req.body as {
        classSection?: string;
        date?: string;
        entries?: BatchAttendanceEntryInput[];
        defaultContextNote?: string;
        notifyParents?: boolean;
        notificationMessage?: string;
        markingMode?: AttendanceMarkingMode;
        deviceId?: string;
      };

      const allowedModes: AttendanceMarkingMode[] = ['manual', 'biometric', 'rfid'];
      if (!allowedModes.includes(markingMode)) {
        res.status(400).json({ error: 'Invalid attendance mode. Allowed modes: manual, rfid, biometric.' });
        return;
      }

      const check = validateBatchAttendanceInput({ classSection, date, entries });
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const school = db.schools.find((s) => s.id === schoolId);
      if (school && !isAttendanceModeEnabledForSchool(school, markingMode)) {
        const modeLabel =
          markingMode === 'biometric'
            ? 'Biometric'
            : markingMode === 'rfid'
              ? 'RFID Smart Card'
              : 'Manual';
        res.status(403).json({
          error: `${modeLabel} attendance is not allotted in ${school.name}’s current plan (${school.subscriptionPlan}). Ask Platform Admin to enable it.`,
        });
        return;
      }

      const cleanDate = date!.trim();
      const cleanDeviceId =
        typeof deviceId === 'string' && deviceId.trim()
          ? deviceId.trim().slice(0, 64)
          : undefined;
      const verifiedAt = new Date().toISOString();
      const savedRecords: AttendanceRecord[] = [];
      const updatedStudents: StudentRecord[] = [];
      const dispatchedNotifications: ParentAttendanceNotification[] = [];
      if (!Array.isArray(db.monthlyAttendance)) db.monthlyAttendance = [];

      for (const row of entries!) {
        const student = db.students.find(
          (s) => s.id === row.studentId && s.schoolId === schoolId,
        );
        if (!student) continue;

        const recId = buildBatchAttendanceRecordId(schoolId, cleanDate, student.id);
        const existingIdx = db.attendance.findIndex(
          (a) =>
            a.id === recId ||
            (a.schoolId === schoolId && a.studentId === student.id && a.date === cleanDate),
        );
        const prevStatus = existingIdx >= 0 ? db.attendance[existingIdx].status : null;
        const cardOrBiometricRef =
          markingMode === 'rfid'
            ? `RFID-${student.admissionNo}`
            : markingMode === 'biometric'
              ? `BIO-${student.admissionNo}`
              : undefined;

        const rec: AttendanceRecord = {
          id: existingIdx >= 0 ? db.attendance[existingIdx].id : recId,
          schoolId,
          studentId: student.id,
          date: cleanDate,
          status: row.status,
          correctedBy: req.user!.name,
          contextNote: row.contextNote?.trim() || defaultContextNote?.trim() || undefined,
          markingMode,
          deviceId: cleanDeviceId,
          cardOrBiometricRef,
          verifiedAt,
        };

        if (existingIdx >= 0) {
          db.attendance[existingIdx] = rec;
        } else {
          db.attendance.unshift(rec);
        }
        savedRecords.push(rec);

        reconcileMonthlyAttendanceAfterMark({
          monthlyAttendance: db.monthlyAttendance,
          schoolId,
          studentId: student.id,
          date: cleanDate,
          prevStatus,
          nextStatus: row.status,
        });

        // Update observational attendancePct cleanly — NEVER alters OLQ scores or evidence
        const studentRecords = db.attendance.filter(
          (a) => a.schoolId === schoolId && a.studentId === student.id,
        );
        student.attendancePct = computeUpdatedStudentAttendancePct(
          studentRecords,
          student.id,
          student.attendancePct,
        );
        updatedStudents.push(student);

        if (notifyParents !== false) {
          const notif = upsertParentAttendanceNotification({
            db,
            schoolId,
            schoolName: school?.name || 'School Campus',
            student,
            date: cleanDate,
            status: row.status,
            contextNote: rec.contextNote,
            customMessage: notificationMessage,
            actor: req.user!,
          });
          dispatchedNotifications.push(notif);
        }

        recordAbsenceRiskAlertOnAttendance(db, {
          schoolId,
          schoolName: school?.name || 'School Campus',
          student,
          date: cleanDate,
          status: row.status,
          actorName: req.user!.name,
        });
      }

      if (savedRecords.length === 0) {
        res.status(404).json({ error: 'No matching enrolled students found for the selected class.' });
        return;
      }

      const summary = summarizeAttendanceEntries(savedRecords);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_CLASS_ATTENDANCE_BATCH',
        entityType: 'AttendanceRecord',
        entityId: `${classSection!.trim()}-${cleanDate}`,
        detail: `Marked Class ${classSection!.trim()} attendance via ${markingMode.toUpperCase()}${cleanDeviceId ? ` (${cleanDeviceId})` : ''} for ${cleanDate}: ${summary.present} Present, ${summary.absent} Absent, ${summary.leave} Leave. Dispatched ${dispatchedNotifications.length} daily in-app parent notification(s). (OLQ/Learners Scores strictly unaffected.)`,
      });

      saveDb();
      res.status(201).json({
        attendance: savedRecords,
        summary,
        updatedStudents,
        markingMode,
        notificationsSent: dispatchedNotifications.length,
        notifications: dispatchedNotifications,
      });
    },
  );

  // ---------------- LIVE RFID CARD / BIOMETRIC TERMINAL ATTENDANCE SCAN ----------------
  app.post(
    '/api/attendance/scan',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const {
        mode,
        date,
        identifier,
        classSection,
        deviceId,
        notifyParents = true,
      } = (req.body || {}) as {
        mode?: 'rfid' | 'biometric';
        date?: string;
        identifier?: string;
        classSection?: string;
        deviceId?: string;
        notifyParents?: boolean;
      };

      if (mode !== 'rfid' && mode !== 'biometric') {
        res.status(400).json({ error: 'Scan mode must be either rfid or biometric.' });
        return;
      }
      const cleanDate = typeof date === 'string' ? date.trim() : '';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        res.status(400).json({ error: 'Valid YYYY-MM-DD attendance date is required.' });
        return;
      }
      const cleanIdentifier = typeof identifier === 'string' ? identifier.trim().slice(0, 80) : '';
      if (!cleanIdentifier) {
        res.status(400).json({ error: 'Enter or scan a student RFID card ID, Biometric ID, or Admission No.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const school = db.schools.find((s) => s.id === schoolId);
      if (school && !isAttendanceModeEnabledForSchool(school, mode)) {
        const modeLabel = mode === 'biometric' ? 'Biometric' : 'RFID Smart Card';
        res.status(403).json({
          error: `${modeLabel} attendance is not allotted in ${school.name}’s current plan (${school.subscriptionPlan}). Ask Platform Admin to enable it.`,
        });
        return;
      }

      const norm = cleanIdentifier.toLowerCase();
      const stripped = norm.replace(/^(rfid-|bio-|card-|fp-)/i, '');
      const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const matched =
        schoolStudents.find(
          (s) =>
            s.id.toLowerCase() === norm ||
            s.admissionNo.toLowerCase() === norm ||
            s.admissionNo.toLowerCase() === stripped ||
            `rfid-${s.admissionNo}`.toLowerCase() === norm ||
            `bio-${s.admissionNo}`.toLowerCase() === norm,
        ) ||
        (classSection
          ? schoolStudents.find(
              (s) =>
                s.classSection === classSection &&
                (s.rollNo.toLowerCase() === norm || s.rollNo.toLowerCase() === stripped),
            )
          : undefined);

      if (!matched) {
        res.status(404).json({
          error: `No enrolled student matched "${cleanIdentifier}" in this school.`,
        });
        return;
      }

      if (!Array.isArray(db.monthlyAttendance)) db.monthlyAttendance = [];
      const recId = buildBatchAttendanceRecordId(schoolId, cleanDate, matched.id);
      const existingIdx = db.attendance.findIndex(
        (a) =>
          a.id === recId ||
          (a.schoolId === schoolId && a.studentId === matched.id && a.date === cleanDate),
      );
      const prevStatus = existingIdx >= 0 ? db.attendance[existingIdx].status : null;
      const cleanDeviceId =
        typeof deviceId === 'string' && deviceId.trim()
          ? deviceId.trim().slice(0, 64)
          : mode === 'rfid'
            ? 'RFID-GATE-01'
            : 'BIO-TERM-01';
      const refCode =
        mode === 'rfid' ? `RFID-${matched.admissionNo}` : `BIO-${matched.admissionNo}`;
      const verifiedAt = new Date().toISOString();

      const rec: AttendanceRecord = {
        id: existingIdx >= 0 ? db.attendance[existingIdx].id : recId,
        schoolId,
        studentId: matched.id,
        date: cleanDate,
        status: 'Present',
        correctedBy: req.user!.name,
        contextNote: `${mode === 'rfid' ? 'RFID Smart Card Tap' : 'Biometric Terminal Verification'} · ${cleanDeviceId}`,
        markingMode: mode,
        deviceId: cleanDeviceId,
        cardOrBiometricRef: refCode,
        verifiedAt,
      };

      if (existingIdx >= 0) {
        db.attendance[existingIdx] = rec;
      } else {
        db.attendance.unshift(rec);
      }

      reconcileMonthlyAttendanceAfterMark({
        monthlyAttendance: db.monthlyAttendance,
        schoolId,
        studentId: matched.id,
        date: cleanDate,
        prevStatus,
        nextStatus: 'Present',
      });

      const studentRecords = db.attendance.filter(
        (a) => a.schoolId === schoolId && a.studentId === matched.id,
      );
      matched.attendancePct = computeUpdatedStudentAttendancePct(
        studentRecords,
        matched.id,
        matched.attendancePct,
      );

      let notificationsSent = 0;
      if (notifyParents !== false) {
        upsertParentAttendanceNotification({
          db,
          schoolId,
          schoolName: school?.name || 'School Campus',
          student: matched,
          date: cleanDate,
          status: 'Present',
          contextNote: rec.contextNote,
          actor: req.user!,
        });
        notificationsSent = 1;
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_ATTENDANCE_SCAN',
        entityType: 'AttendanceRecord',
        entityId: rec.id,
        detail: `Verified ${matched.name} (${matched.classSection}) Present via ${mode.toUpperCase()} (${refCode} @ ${cleanDeviceId}) on ${cleanDate}.`,
      });

      saveDb();
      res.status(201).json({
        attendance: rec,
        student: matched,
        notificationsSent,
      });
    },
  );

  // ---------------- MANUAL SEND / RESEND DAILY PARENT ATTENDANCE MESSAGE ----------------
  app.post(
    '/api/attendance/notifications/send',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { studentId, classSection, date, customMessage } = req.body as {
        studentId?: string;
        classSection?: string;
        date?: string;
        customMessage?: string;
      };
      const cleanDate = date?.trim() || resolveTodayIsoDate();
      if (!studentId && !classSection?.trim()) {
        res.status(400).json({ error: 'Provide either studentId or classSection to notify parents.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const school = db.schools.find((s) => s.id === schoolId);
      const targetStudents = studentId
        ? db.students.filter((s) => s.id === studentId && s.schoolId === schoolId)
        : db.students.filter((s) => s.schoolId === schoolId && s.classSection === classSection?.trim());

      if (targetStudents.length === 0) {
        res.status(404).json({ error: 'No matching students found to notify.' });
        return;
      }

      const sent: ParentAttendanceNotification[] = [];
      for (const st of targetStudents) {
        const recId = buildBatchAttendanceRecordId(schoolId, cleanDate, st.id);
        const existingRec = db.attendance.find(
          (a) => a.id === recId || (a.schoolId === schoolId && a.studentId === st.id && a.date === cleanDate),
        );
        const status = existingRec?.status || 'Present';
        const msg = upsertParentAttendanceNotification({
          db,
          schoolId,
          schoolName: school?.name || 'School Campus',
          student: st,
          date: cleanDate,
          status,
          contextNote: existingRec?.contextNote,
          customMessage,
          actor: req.user!,
        });
        // Force unread on manual resend so parent sees updated alert
        msg.readByParent = false;
        msg.readAt = undefined;
        msg.acknowledgedByParent = false;
        msg.acknowledgedAt = undefined;
        sent.push(msg);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DISPATCHED_ATTENDANCE_NOTIFICATION',
        entityType: 'ParentAttendanceNotification',
        entityId: sent[0]?.id || cleanDate,
        detail: `Sent daily in-app attendance message to ${sent.length} parent(s) for ${cleanDate}.`,
      });

      saveDb();
      res.status(201).json({
        notificationsSent: sent.length,
        notifications: sent,
      });
    },
  );

  // ---------------- PARENT / STUDENT ACKNOWLEDGE DAILY ATTENDANCE NOTIFICATION ----------------
  app.post(
    '/api/attendance/notifications/:id/acknowledge',
    requireAuth,
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      if (!Array.isArray(db.attendanceNotifications)) {
        res.status(404).json({ error: 'Notification not found.' });
        return;
      }
      const notif = db.attendanceNotifications.find(
        (n) => n.id === req.params.id && n.schoolId === schoolId,
      );
      if (!notif) {
        res.status(404).json({ error: 'Daily attendance notification not found.' });
        return;
      }
      if (
        (user.role === 'parent' || user.role === 'student') &&
        !(user.linkedStudentIds || []).includes(notif.studentId)
      ) {
        res.status(403).json({ error: 'Parents and students can only acknowledge their own linked student messages.' });
        return;
      }

      const nowIso = new Date().toISOString();
      notif.readByParent = true;
      notif.readAt = notif.readAt || nowIso;
      notif.acknowledgedByParent = true;
      notif.acknowledgedAt = nowIso;

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ACKNOWLEDGED_ATTENDANCE_NOTIFICATION',
        entityType: 'ParentAttendanceNotification',
        entityId: notif.id,
        detail: `${user.name} acknowledged daily attendance notification for ${notif.studentName} (${notif.date}).`,
      });

      saveDb();
      res.json({ notification: notif });
    },
  );

  // ---------------- TIMETABLE SUBSTITUTION ----------------
  app.post(
    '/api/timetable/substitution',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { slotId, substitutionTeacher } = req.body as {
        slotId?: string;
        substitutionTeacher?: string;
      };
      if (!slotId?.trim()) {
        res.status(400).json({ error: 'Timetable slot ID is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const slot = db.timetable.find((t) => t.id === slotId && t.schoolId === schoolId);
      if (!slot) {
        res.status(404).json({ error: 'Timetable slot not found in active school.' });
        return;
      }

      const cleanSub = substitutionTeacher?.trim() || '';
      slot.substitutionTeacher = cleanSub || undefined;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_TIMETABLE_SUBSTITUTION',
        entityType: 'TimetableSlot',
        entityId: slot.id,
        detail: cleanSub
          ? `Assigned substitution faculty ${cleanSub} for Class ${slot.classSection} ${slot.day} P${slot.period} (${slot.subject}).`
          : `Cleared substitution on Class ${slot.classSection} ${slot.day} P${slot.period} (${slot.subject}).`,
      });

      saveDb();
      res.json({ slot });
    },
  );

  // ---------------- TIMETABLE DRAG & DROP MOVE / SWAP ----------------
  app.post(
    '/api/timetable/move-or-swap',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { sourceSlotId, targetDay, targetPeriod, targetSlotId } = (req.body || {}) as {
        sourceSlotId?: string;
        targetDay?: string;
        targetPeriod?: number;
        targetSlotId?: string | null;
      };
      if (!sourceSlotId?.trim() || !targetDay?.trim() || typeof targetPeriod !== 'number') {
        res.status(400).json({ error: 'sourceSlotId, targetDay, and numeric targetPeriod are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const schoolSlots = db.timetable.filter((t) => t.schoolId === schoolId);
      const otherSlots = db.timetable.filter((t) => t.schoolId !== schoolId);

      const evaluation = evaluatePeriodDrop({
        slots: schoolSlots,
        sourceSlotId: sourceSlotId.trim(),
        targetDay: targetDay.trim(),
        targetPeriod: Math.round(targetPeriod),
        targetSlotId: targetSlotId ? targetSlotId.trim() : null,
      });

      if (!evaluation.allowed) {
        res.status(409).json({
          error: evaluation.conflicts[0] || evaluation.summary || 'Unable to move period due to a conflict.',
          conflicts: evaluation.conflicts,
          warnings: evaluation.warnings,
        });
        return;
      }

      db.timetable = [...otherSlots, ...evaluation.nextSlots];

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: evaluation.action === 'swap' ? 'SWAPPED_TIMETABLE_PERIODS' : 'MOVED_TIMETABLE_PERIOD',
        entityType: 'TimetableSlot',
        entityId: sourceSlotId.trim(),
        detail: evaluation.summary,
      });

      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'timetable_updated', {
        action: evaluation.action,
        summary: evaluation.summary,
      });

      res.json({
        ok: true,
        action: evaluation.action,
        summary: evaluation.summary,
        warnings: evaluation.warnings,
        sourceBefore: evaluation.sourceBefore,
        targetBefore: evaluation.targetBefore,
      });
    },
  );

  // ---------------- ACADEMIC RESOURCES & LESSON PLANS ----------------
  app.post(
    '/api/resources',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { title, classSection, subject, chapter, category, contentSummary, aiAssisted, pushedToStudents } =
        req.body as Partial<AcademicResource>;

      if (!title?.trim() || !subject?.trim() || !chapter?.trim() || !category) {
        res.status(400).json({ error: 'Title, subject, chapter, and category are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const school = db.schools.find((s) => s.id === schoolId)!;

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        if (
          !canTeacherAccessSubjectResource(
            teacherScope,
            classSection?.trim() || '9-A',
            subject.trim(),
          )
        ) {
          res.status(403).json({
            error:
              'Resource creation restricted: teachers may only publish resources for their assigned classes and subjects.',
          });
          return;
        }
      }

      // Preserve existing approved resources without duplication
      const duplicate = db.resources.find(
        (r) =>
          r.schoolId === schoolId &&
          r.status === 'Approved' &&
          r.category === category &&
          r.subject.toLowerCase() === subject.trim().toLowerCase() &&
          r.chapter.toLowerCase() === chapter.trim().toLowerCase() &&
          r.title.toLowerCase() === title.trim().toLowerCase(),
      );
      if (duplicate) {
        res.status(409).json({
          error: 'An identical approved resource already exists and is preserved without duplication.',
        });
        return;
      }

      const shouldPushNow = Boolean(pushedToStudents);
      const todayIso = new Date().toISOString().slice(0, 10);
      const resource: AcademicResource = {
        id: `res-${Date.now()}`,
        schoolId,
        title: title.trim(),
        classSection: classSection?.trim() || '9-A',
        subject: subject.trim(),
        chapter: chapter.trim(),
        session: school.session,
        board: school.board,
        category,
        status: shouldPushNow || req.user!.role !== 'teacher' ? 'Approved' : 'Draft',
        pushedToStudents: shouldPushNow,
        pushedBy: shouldPushNow ? req.user!.name : undefined,
        pushedAt: shouldPushNow ? todayIso : undefined,
        contentSummary: contentSummary?.trim() || 'Aligned classroom academic resource.',
        createdBy: req.user!.name,
        aiAssisted: Boolean(aiAssisted),
        updatedAt: todayIso,
      };

      db.resources.unshift(resource);
      saveDb();
      res.status(201).json({ resource });
    },
  );

  app.post(
    '/api/resources/:id/approve',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const resource = db.resources.find(
        (r) => r.id === req.params.id && r.schoolId === req.activeSchoolId,
      );
      if (!resource) {
        res.status(404).json({ error: 'Resource not found.' });
        return;
      }
      resource.status = 'Approved';
      resource.updatedAt = new Date().toISOString().slice(0, 10);
      saveDb();
      res.json({ resource });
    },
  );

  app.post(
    '/api/lesson-plans/:id/approve-change',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const plan = db.lessonPlans.find(
        (p) => p.id === req.params.id && p.schoolId === req.activeSchoolId,
      );
      if (!plan) {
        res.status(404).json({ error: 'Lesson plan not found.' });
        return;
      }
      plan.status = 'In Progress';
      plan.approvalRequired = false;
      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'APPROVED_CALENDAR_CHANGE',
        entityType: 'LessonPlan',
        entityId: plan.id,
        detail: `Approved calendar update for ${plan.subject} (${plan.topic}).`,
      });
      saveDb();
      res.json({ plan });
    },
  );

  // ---------------- ADMISSION CRM, HOME VISITS, CAREER COUNSELLING, FEES ----------------
  app.post(
    '/api/admissions',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher']),
    (req: AuthedRequest, res) => {
      const body = req.body as Partial<AdmissionLead>;
      const check = validateLeadInput(body);
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const db = getDb();
      const { routes: trRoutes, allocations: trAllocs } = ensureSchoolTransportInitialized(
        db,
        req.activeSchoolId!,
      );
      const validGeo =
        body.residentialLat !== undefined &&
        body.residentialLng !== undefined &&
        Number.isFinite(Number(body.residentialLat)) &&
        Number.isFinite(Number(body.residentialLng))
          ? { lat: Number(body.residentialLat), lng: Number(body.residentialLng) }
          : null;
      const recommendedRoute = recommendRouteForLocality(
        body.locality,
        body.address,
        trRoutes,
        trAllocs,
        validGeo,
      );
      const lead: AdmissionLead = {
        id: `adm-${Date.now()}`,
        schoolId: req.activeSchoolId!,
        studentName: body.studentName!.trim(),
        applyingClass: body.applyingClass!.trim(),
        parentName: body.parentName!.trim(),
        phone: body.phone!.trim(),
        email: body.email?.trim() || '',
        source: body.source || 'Walk-in',
        stage: body.stage || 'New Enquiry',
        assignedCounsellor: body.assignedCounsellor?.trim() || req.user!.name,
        nextFollowUpDate:
          body.nextFollowUpDate?.trim() ||
          new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        address: body.address?.trim() || '',
        locality: body.locality?.trim() || '',
        ...(validGeo ? { residentialLat: validGeo.lat, residentialLng: validGeo.lng } : {}),
        previousSchool: body.previousSchool?.trim() || '',
        notes: body.notes?.trim() || '',
        transportPreference: body.transportPreference || (recommendedRoute ? 'Bus' : 'Undecided'),
        ...(recommendedRoute
          ? {
              recommendedRouteId: body.recommendedRouteId || recommendedRoute.routeId,
              recommendedRouteCode: recommendedRoute.routeCode,
              recommendedRouteName: recommendedRoute.routeName,
              recommendedStopName: recommendedRoute.stopName,
              recommendedPickupTime: recommendedRoute.pickupTime,
              recommendedRouteConfidence: recommendedRoute.confidence,
              recommendedRouteReason: recommendedRoute.reason,
              recommendedEfficiencyScore: recommendedRoute.efficiencyScore,
              recommendedDistanceKm: recommendedRoute.distanceToStopKm,
              recommendedDetourKm: recommendedRoute.marginalDetourKm,
            }
          : {}),
        createdAt: today,
        updatedAt: today,
      };
      db.admissionLeads.unshift(lead);
      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'CREATED_ADMISSION_LEAD',
        entityType: 'AdmissionLead',
        entityId: lead.id,
        detail: `Added admission lead for ${lead.studentName} (${lead.applyingClass}, ${lead.source})${lead.recommendedRouteCode ? ` · Recommended Route ${lead.recommendedRouteCode}` : ''}.`,
      });
      saveDb();
      res.status(201).json({ lead, recommendedRoute });
    },
  );

  app.patch(
    '/api/admissions/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const lead = db.admissionLeads.find(
        (l) => l.id === req.params.id && l.schoolId === req.activeSchoolId,
      );
      if (!lead) {
        res.status(404).json({ error: 'Admission lead not found.' });
        return;
      }
      const body = req.body as Partial<AdmissionLead>;
      if (body.studentName?.trim()) lead.studentName = body.studentName.trim();
      if (body.applyingClass?.trim()) lead.applyingClass = body.applyingClass.trim();
      if (body.parentName?.trim()) lead.parentName = body.parentName.trim();
      if (body.phone?.trim()) lead.phone = body.phone.trim();
      if (body.email !== undefined) lead.email = body.email.trim();
      if (body.source) lead.source = body.source;
      if (body.stage) lead.stage = body.stage;
      if (body.assignedCounsellor !== undefined) {
        lead.assignedCounsellor = body.assignedCounsellor.trim() || lead.assignedCounsellor;
      }
      if (body.nextFollowUpDate !== undefined) {
        lead.nextFollowUpDate = body.nextFollowUpDate.trim() || lead.nextFollowUpDate;
      }
      if (body.address !== undefined) lead.address = body.address.trim();
      if (body.locality !== undefined) lead.locality = body.locality.trim();
      if (body.residentialLat !== undefined) {
        lead.residentialLat =
          body.residentialLat !== null && Number.isFinite(Number(body.residentialLat))
            ? Number(body.residentialLat)
            : undefined;
      }
      if (body.residentialLng !== undefined) {
        lead.residentialLng =
          body.residentialLng !== null && Number.isFinite(Number(body.residentialLng))
            ? Number(body.residentialLng)
            : undefined;
      }
      if (body.previousSchool !== undefined) lead.previousSchool = body.previousSchool.trim();
      if (body.notes !== undefined) lead.notes = body.notes.trim();
      if (body.transportPreference) lead.transportPreference = body.transportPreference;

      if (
        body.locality !== undefined ||
        body.address !== undefined ||
        body.residentialLat !== undefined ||
        body.residentialLng !== undefined
      ) {
        const { routes: trRoutes, allocations: trAllocs } = ensureSchoolTransportInitialized(
          db,
          req.activeSchoolId!,
        );
        const leadGeo =
          Number.isFinite(lead.residentialLat) && Number.isFinite(lead.residentialLng)
            ? { lat: lead.residentialLat!, lng: lead.residentialLng! }
            : null;
        const rec = recommendRouteForLocality(
          lead.locality,
          lead.address,
          trRoutes,
          trAllocs,
          leadGeo,
        );
        if (rec) {
          lead.recommendedRouteId = rec.routeId;
          lead.recommendedRouteCode = rec.routeCode;
          lead.recommendedRouteName = rec.routeName;
          lead.recommendedStopName = rec.stopName;
          lead.recommendedPickupTime = rec.pickupTime;
          lead.recommendedRouteConfidence = rec.confidence;
          lead.recommendedRouteReason = rec.reason;
          lead.recommendedEfficiencyScore = rec.efficiencyScore;
          lead.recommendedDistanceKm = rec.distanceToStopKm;
          lead.recommendedDetourKm = rec.marginalDetourKm;
        }
      }
      lead.updatedAt = new Date().toISOString().slice(0, 10);

      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'UPDATED_ADMISSION_LEAD',
        entityType: 'AdmissionLead',
        entityId: lead.id,
        detail: `Updated lead ${lead.studentName} (Stage: ${lead.stage}, Follow-up: ${lead.nextFollowUpDate}).`,
      });
      saveDb();
      res.json({ lead });
    },
  );

  app.post(
    '/api/admissions/:id/convert',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const lead = db.admissionLeads.find(
        (l) => l.id === req.params.id && l.schoolId === req.activeSchoolId,
      );
      if (!lead) {
        res.status(404).json({ error: 'Admission lead not found.' });
        return;
      }
      if (lead.convertedStudentId) {
        const existingStudent = db.students.find((s) => s.id === lead.convertedStudentId);
        res.json({ lead, student: existingStudent ?? null });
        return;
      }

      const school = db.schools.find((s) => s.id === req.activeSchoolId!);
      const schoolStudents = db.students.filter((s) => s.schoolId === req.activeSchoolId!);
      const classSection = normalizeClassSectionFromApplyingClass(lead.applyingClass);
      const nextRoll = String(
        schoolStudents.filter((s) => s.classSection === classSection).length + 1,
      ).padStart(2, '0');
      const codePrefix = school?.code?.split('-')[0] || 'SCH';
      const student: StudentRecord = {
        id: `stu-adm-${Date.now()}`,
        schoolId: req.activeSchoolId!,
        admissionNo: `${codePrefix}-2026-${String(schoolStudents.length + 101).padStart(4, '0')}`,
        rollNo: nextRoll,
        name: lead.studentName,
        classSection,
        house: 'Tagore House',
        guardianName: lead.parentName,
        guardianPhone: lead.phone,
        ...(lead.email?.trim() ? { guardianEmail: lead.email.trim() } : {}),
        ...(lead.address?.trim() ? { address: lead.address.trim() } : {}),
        udiseStudentId: `UD-${Date.now().toString().slice(-6)}`,
        haryanaMisId: `HR-${Date.now().toString().slice(-6)}`,
        attendancePct: 100,
        feeBalanceInr: 9500,
        totalFeeAnnualInr: 38000,
        reportApprovalStatus: 'Draft',
        formulaVersion: 'v1.2',
        documents: [
          { name: 'Birth Certificate', verified: true },
          { name: 'Transfer Certificate (TC)', verified: lead.stage === 'Confirmed' },
          { name: 'Aadhaar / Parivar Pehchan Patra', verified: true },
        ],
        responsibilities: [],
        achievements: [],
        confidentialCounsellorNote: `Enrolled from Admission CRM (${lead.source}). ${lead.notes || ''}`.trim(),
        onboarding: createDay1OnboardingBlueprint({
          admissionDate: new Date().toISOString().slice(0, 10),
          assignedClassTeacher:
            db.users.find(
              (u) =>
                u.schoolId === req.activeSchoolId! &&
                u.role === 'teacher' &&
                u.classTeacherOf?.toLowerCase() === classSection.toLowerCase(),
            )?.name || req.user!.name,
          transportMode: lead.transportPreference === 'Walker' ? 'Walker' : 'Bus',
          documentDueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
          notes: lead.notes || undefined,
        }),
      };
      lead.stage = 'Confirmed';
      lead.convertedStudentId = student.id;
      lead.updatedAt = new Date().toISOString().slice(0, 10);
      db.students.push(student);

      // Auto-allot transport mode based on Admission Enquiry recommendation / preference
      const { routes: trRoutes, allocations: trAllocs } = ensureSchoolTransportInitialized(
        db,
        req.activeSchoolId!,
      );
      const nowIso = new Date().toISOString();
      if (lead.transportPreference === 'Walker') {
        db.studentTransportAllocations!.push({
          studentId: student.id,
          schoolId: req.activeSchoolId!,
          mode: 'Walker',
          areaLocality: lead.locality || lead.address || 'Campus Enclave',
          assignedBy: req.user!.name,
          assignedAt: nowIso,
          notes: 'Auto-set as Walker from Admission Enquiry',
        });
      } else {
        const leadGeo =
          Number.isFinite(lead.residentialLat) && Number.isFinite(lead.residentialLng)
            ? { lat: lead.residentialLat!, lng: lead.residentialLng! }
            : null;
        const freshRec = recommendRouteForLocality(
          lead.locality,
          lead.address,
          trRoutes,
          trAllocs,
          leadGeo,
        );
        const matchedRoute =
          (freshRec && trRoutes.find((r) => r.id === freshRec.routeId)) ||
          (lead.recommendedRouteId && trRoutes.find((r) => r.id === lead.recommendedRouteId)) ||
          trRoutes[0];
        if (matchedRoute) {
          const stop =
            matchedRoute.stops.find((s) => s.name === lead.recommendedStopName) ||
            matchedRoute.stops.find((s) => s.area !== 'School Campus') ||
            matchedRoute.stops[0];
          db.studentTransportAllocations!.push({
            studentId: student.id,
            schoolId: req.activeSchoolId!,
            mode: 'Bus',
            routeId: matchedRoute.id,
            stopId: stop?.id,
            stopName: stop?.name,
            areaLocality: lead.locality || stop?.area || matchedRoute.areasCovered[0] || 'Jhajjar',
            pickupTime: stop?.morningPickupTime,
            dropTime: stop?.eveningDropTime,
            assignedBy: req.user!.name,
            assignedAt: nowIso,
            notes: `Auto-allotted from Admission Enquiry recommendation (${matchedRoute.routeCode})`,
          });
        }
      }

      const syncedFamilies = syncSchoolFamilyAccounts(db, req.activeSchoolId!);
      const linkedFamilyAccount = student.familyAccountId
        ? syncedFamilies.familyAccounts.find((f) => f.id === student.familyAccountId) ?? null
        : null;

      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'ENROLLED_ADMISSION_STUDENT',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Confirmed & enrolled ${student.name} into Class ${student.classSection} (${student.admissionNo}).`,
      });
      saveDb();
      res.status(201).json({ lead, student, familyAccount: linkedFamilyAccount });
    },
  );

  app.post(
    '/api/admissions/:id/home-visits',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const lead = db.admissionLeads.find(
        (l) => l.id === req.params.id && l.schoolId === req.activeSchoolId,
      );
      if (!lead) {
        res.status(404).json({ error: 'Admission lead not found.' });
        return;
      }

      const body = req.body as Partial<HomeVisitRecord>;
      const check = validateHomeVisitInput({
        ...body,
        leadId: lead.id,
      });
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const visit: HomeVisitRecord = {
        id: `hv-${Date.now()}`,
        schoolId: req.activeSchoolId!,
        leadId: lead.id,
        studentName: lead.studentName,
        applyingClass: lead.applyingClass,
        parentName: lead.parentName,
        phone: lead.phone,
        visitDate: body.visitDate!.trim(),
        visitSlot: body.visitSlot?.trim() || '10:30 AM – 11:15 AM',
        visitingStaff: body.visitingStaff!.trim(),
        address: body.address?.trim() || lead.address || '',
        locality: body.locality?.trim() || lead.locality || '',
        guardianMet: body.guardianMet!.trim(),
        homeEnvironmentSummary: body.homeEnvironmentSummary?.trim() || '',
        learningSupportNotes: body.learningSupportNotes?.trim() || '',
        transportOrFeeNotes: body.transportOrFeeNotes?.trim() || '',
        status: body.status || 'Scheduled',
        outcome: body.outcome || 'Proceed to Admission',
        createdAt: today,
        updatedAt: today,
      };

      db.homeVisitRecords.unshift(visit);
      if (!lead.address && visit.address) lead.address = visit.address;
      if (!lead.locality && visit.locality) lead.locality = visit.locality;
      lead.updatedAt = today;

      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'LOGGED_HOME_VISIT',
        entityType: 'HomeVisitRecord',
        entityId: visit.id,
        detail: `${visit.status} home visit for ${lead.studentName} on ${visit.visitDate} by ${visit.visitingStaff} (${visit.outcome}).`,
      });
      saveDb();
      res.status(201).json({ visit, lead });
    },
  );

  app.patch(
    '/api/home-visits/:visitId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const visit = db.homeVisitRecords.find(
        (v) => v.id === req.params.visitId && v.schoolId === req.activeSchoolId,
      );
      if (!visit) {
        res.status(404).json({ error: 'Home visit record not found.' });
        return;
      }

      const body = req.body as Partial<HomeVisitRecord>;
      if (body.visitDate?.trim()) visit.visitDate = body.visitDate.trim();
      if (body.visitSlot?.trim()) visit.visitSlot = body.visitSlot.trim();
      if (body.visitingStaff?.trim()) visit.visitingStaff = body.visitingStaff.trim();
      if (body.address !== undefined) visit.address = body.address.trim();
      if (body.locality !== undefined) visit.locality = body.locality.trim();
      if (body.guardianMet?.trim()) visit.guardianMet = body.guardianMet.trim();
      if (body.homeEnvironmentSummary !== undefined) {
        visit.homeEnvironmentSummary = body.homeEnvironmentSummary.trim();
      }
      if (body.learningSupportNotes !== undefined) {
        visit.learningSupportNotes = body.learningSupportNotes.trim();
      }
      if (body.transportOrFeeNotes !== undefined) {
        visit.transportOrFeeNotes = body.transportOrFeeNotes.trim();
      }
      if (body.status) visit.status = body.status;
      if (body.outcome) visit.outcome = body.outcome;
      visit.updatedAt = new Date().toISOString().slice(0, 10);

      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'UPDATED_HOME_VISIT',
        entityType: 'HomeVisitRecord',
        entityId: visit.id,
        detail: `Updated home visit for ${visit.studentName} to ${visit.status} (${visit.outcome}).`,
      });
      saveDb();
      res.json({ visit });
    },
  );

  app.patch(
    '/api/career-counselling/:id',
    requireAuth,
    requireRoles(['super_admin', 'counsellor', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const item = db.careerRequests.find((c) => c.id === req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Counselling request not found.' });
        return;
      }
      if (req.body.status) item.status = req.body.status;
      if (req.body.counsellorReviewNote !== undefined) {
        item.counsellorReviewNote = req.body.counsellorReviewNote;
      }
      appendAuditLog({
        schoolId: item.schoolId,
        actor: req.user!,
        action: 'REVIEWED_CAREER_COUNSELLING',
        entityType: 'CareerCounsellingRequest',
        entityId: item.id,
        detail: `Updated counselling status for ${item.applicantName} to ${item.status}.`,
      });
      saveDb();
      res.json({ request: item });
    },
  );

  app.post(
    '/api/fees/collect',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: AuthedRequest, res) => {
      const { transactionId, paymentAmountInr } = req.body as {
        transactionId: string;
        paymentAmountInr: number;
      };
      const db = getDb();
      const tx = db.feeTransactions.find(
        (t) => t.id === transactionId && t.schoolId === req.activeSchoolId,
      );
      if (!tx) {
        res.status(404).json({ error: 'Fee transaction not found.' });
        return;
      }
      const amt = Number(paymentAmountInr);
      if (!Number.isFinite(amt) || amt <= 0) {
        res.status(400).json({ error: 'Enter a valid payment amount greater than zero.' });
        return;
      }

      tx.amountPaidInr += amt;
      const netDue = tx.amountDueInr - tx.concessionInr;
      tx.status = tx.amountPaidInr >= netDue ? 'Paid' : 'Partial';
      tx.paidDate = new Date().toISOString().slice(0, 10);
      if (tx.receiptNo === 'PENDING') {
        tx.receiptNo = `RCP-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === tx.studentId);
      if (student) {
        student.feeBalanceInr = Math.max(0, student.feeBalanceInr - amt);
      }

      const activeMonth: FeeMonthKey = db.financialTargets?.[schoolId]?.monthKey ?? 'November';
      let ledgerAcc = (db.feeAccounts || []).find(
        (a) => a.schoolId === schoolId && a.studentId === tx.studentId,
      );
      if (!ledgerAcc) {
        syncSchoolFamilyAccounts(db, schoolId);
        ledgerAcc = (db.feeAccounts || []).find(
          (a) => a.schoolId === schoolId && a.studentId === tx.studentId,
        );
      }
      if (ledgerAcc) {
        if (!ledgerAcc.monthlyPaidInr) ledgerAcc.monthlyPaidInr = emptyMonthlyPaidMap();
        ledgerAcc.monthlyPaidInr[activeMonth] = (ledgerAcc.monthlyPaidInr[activeMonth] || 0) + amt;
        ledgerAcc.paidAmountInr += amt;
        ledgerAcc.balanceFeesInr = Math.max(0, ledgerAcc.balanceFeesInr - amt);
        ledgerAcc.lastPaidDate = tx.paidDate;
        if (student) {
          student.feeBalanceInr = ledgerAcc.balanceFeesInr;
        }
        if (!Array.isArray(db.feeReceipts)) db.feeReceipts = [];
        db.feeReceipts.unshift({
          id: `frcp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          receiptNo: tx.receiptNo,
          schoolId,
          accountIds: [ledgerAcc.id],
          familyGroupId: ledgerAcc.familyGroupId,
          payerLabel: `${ledgerAcc.studentName} (${ledgerAcc.className})`,
          amountInr: amt,
          paymentMode: 'Cash',
          monthKey: activeMonth,
          paidDate: tx.paidDate,
          recordedBy: req.user!.name,
          allocations: [
            {
              accountId: ledgerAcc.id,
              studentName: ledgerAcc.studentName,
              className: ledgerAcc.className,
              allocatedInr: amt,
            },
          ],
        });
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const updatedFamilyAccount = student?.familyAccountId
        ? synced.familyAccounts.find((f) => f.id === student.familyAccountId) ?? null
        : null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_FEE_PAYMENT',
        entityType: 'FeeTransaction',
        entityId: tx.id,
        detail: `Collected INR ${amt} for ${tx.studentName} (${tx.receiptNo}).`,
      });

      saveDb();
      res.json({ transaction: tx, familyAccount: updatedFamilyAccount });
    },
  );

  app.post(
    '/api/operations',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { module, title, detail, ownerOrRoute, imageUrl } =
        req.body as Partial<OperationalItem>;
      if (!module || !title?.trim() || !detail?.trim()) {
        res.status(400).json({ error: 'Module, title, and details are required.' });
        return;
      }
      const db = getDb();
      const item: OperationalItem = {
        id: `op-${Date.now()}`,
        schoolId: req.activeSchoolId!,
        module,
        title: title.trim(),
        detail: detail.trim(),
        ownerOrRoute: ownerOrRoute?.trim() || req.user!.name,
        status: module === 'Complaints' ? 'Open' : 'Active',
        date: new Date().toISOString().slice(0, 10),
        imageUrl: imageUrl?.trim() || undefined,
      };
      db.operations.unshift(item);
      saveDb();
      res.status(201).json({ item });
    },
  );

  // ---------------- DEVELOPMENT REVIEW QUEUE (P4-3) ----------------
  app.patch(
    '/api/development-reviews/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { status, decisionNote } = req.body as {
        status?: 'Confirmed' | 'Withdrawn';
        decisionNote?: string;
      };
      if (status !== 'Confirmed' && status !== 'Withdrawn') {
        res.status(400).json({ error: 'Decision status must be Confirmed or Withdrawn.' });
        return;
      }
      if (!decisionNote?.trim()) {
        res.status(400).json({ error: 'Please include a brief review note for the audit trail.' });
        return;
      }

      const db = getDb();
      const review = db.developmentReviews.find(
        (r) => r.id === req.params.id && r.schoolId === req.activeSchoolId,
      );
      if (!review) {
        res.status(404).json({ error: 'Development review item not found.' });
        return;
      }

      review.status = status;
      review.decisionNote = decisionNote.trim();
      review.decidedBy = req.user!.name;
      review.decidedAt = new Date().toISOString().slice(0, 10);

      // If withdrawn, clear reviewRequired flag on matching evidence item
      if (status === 'Withdrawn' && review.sourceKey) {
        const ev = db.evidence.find(
          (e) => e.schoolId === req.activeSchoolId && e.sourceKey === review.sourceKey,
        );
        if (ev) {
          ev.reviewRequired = false;
        }
      }

      appendAuditLog({
        schoolId: req.activeSchoolId!,
        actor: req.user!,
        action: 'DECIDED_DEVELOPMENT_REVIEW',
        entityType: 'DevelopmentReviewItem',
        entityId: review.id,
        detail: `${status} review for ${review.studentName} (${review.subject}): ${review.decisionNote}`,
      });

      saveDb();
      res.json({ review });
    },
  );

  // ---------------- PARENT COMPLAINT MANAGEMENT ----------------
  app.post(
    '/api/complaints',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'parent']),
    (req: AuthedRequest, res) => {
      const body = req.body as Partial<ParentComplaint>;
      const check = validateNewComplaintInput(body);
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      if (user.role === 'parent') {
        const allowed = new Set(user.linkedStudentIds ?? []);
        if (!allowed.has(body.studentId!)) {
          res.status(403).json({ error: 'Parents can only submit concerns for linked children.' });
          return;
        }
      }

      const student = db.students.find(
        (s) => s.id === body.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const complaint: ParentComplaint = {
        id: `cmp-${Date.now()}`,
        refNo: buildComplaintRefNo(db.parentComplaints.length, 2026),
        schoolId,
        studentId: student.id,
        studentName: student.name,
        classSection: student.classSection,
        parentName: user.role === 'parent' ? user.name : body.parentName?.trim() || student.guardianName,
        category: body.category || 'Other',
        title: body.title!.trim(),
        description: body.description!.trim(),
        photoDataUrl: body.photoDataUrl?.trim() || undefined,
        priority: body.priority || 'Standard',
        status: 'New',
        assignedCoordinator: '',
        internalStaffNote: '',
        resolutionNote: '',
        createdAt: today,
        updatedAt: today,
      };

      db.parentComplaints.unshift(complaint);

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'SUBMITTED_PARENT_COMPLAINT',
        entityType: 'ParentComplaint',
        entityId: complaint.refNo,
        detail: `${complaint.refNo} (${complaint.category} · ${complaint.priority}) logged for ${student.name}: ${complaint.title}`,
      });

      saveDb();
      res.status(201).json({ complaint: sanitizeComplaintForRole(complaint, user.role) });
    },
  );

  app.patch(
    '/api/complaints/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'parent']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const complaint = db.parentComplaints.find(
        (c) => c.id === req.params.id && c.schoolId === schoolId,
      );
      if (!complaint) {
        res.status(404).json({ error: 'Complaint record not found.' });
        return;
      }

      const body = req.body as Partial<ParentComplaint> & { reopen?: boolean };
      const today = new Date().toISOString().slice(0, 10);

      if (user.role === 'parent') {
        const allowed = new Set(user.linkedStudentIds ?? []);
        if (!allowed.has(complaint.studentId)) {
          res.status(403).json({ error: 'Access denied to another family complaint.' });
          return;
        }
        if (body.parentFeedback !== undefined) {
          complaint.parentFeedback = body.parentFeedback.trim();
        }
        if (body.reopen) {
          complaint.status = 'Reopened';
        }
        complaint.updatedAt = today;
      } else {
        if (body.assignedCoordinator !== undefined) {
          complaint.assignedCoordinator = body.assignedCoordinator.trim();
          if (complaint.status === 'New' && complaint.assignedCoordinator) {
            complaint.status = 'Assigned';
          }
        }
        if (body.priority) complaint.priority = body.priority;
        if (body.status) complaint.status = body.status;
        if (body.internalStaffNote !== undefined) {
          complaint.internalStaffNote = body.internalStaffNote.trim();
        }
        if (body.resolutionNote !== undefined) {
          complaint.resolutionNote = body.resolutionNote.trim();
        }
        complaint.updatedAt = today;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'UPDATED_PARENT_COMPLAINT',
        entityType: 'ParentComplaint',
        entityId: complaint.refNo,
        detail: `Updated ${complaint.refNo} status to ${complaint.status}${
          complaint.assignedCoordinator ? ` (Owner: ${complaint.assignedCoordinator})` : ''
        }.`,
      });

      saveDb();
      res.json({ complaint: sanitizeComplaintForRole(complaint, user.role) });
    },
  );

  app.post(
    '/api/blogs',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor']),
    (req: AuthedRequest, res) => {
      const { title, category, excerpt, body, status } = req.body as Partial<BlogArticle>;
      if (!title?.trim() || !excerpt?.trim() || !body?.trim()) {
        res.status(400).json({ error: 'Title, excerpt, and article body are required.' });
        return;
      }
      const db = getDb();
      const article: BlogArticle = {
        id: `blog-${Date.now()}`,
        title: title.trim(),
        slug: title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
        category: category || 'Student Development' as BlogArticle['category'],
        author: req.user!.name,
        readTime: `${Math.max(2, Math.ceil(body.split(/\s+/).length / 180))} min read`,
        status: status === 'Draft' || status === 'Scheduled' ? status : 'Published',
        publishedDate: new Date().toISOString().slice(0, 10),
        excerpt: excerpt.trim(),
        body: body.trim(),
      };
      db.blogArticles.unshift(article);
      saveDb();
      res.status(201).json({ article });
    },
  );

  app.post(
    '/api/schools',
    requireAuth,
    requireRoles(['super_admin']),
    (req: AuthedRequest, res) => {
      const { name, code, city, state, board, udiseCode, haryanaMisCode, subscriptionPlan } =
        req.body as Partial<School>;
      if (!name?.trim() || !code?.trim() || !city?.trim()) {
        res.status(400).json({ error: 'School name, institution code, and city are required.' });
        return;
      }
      const allowedPlanNames = SUBSCRIPTION_PLANS.map((p) => p.id);
      const chosenPlan =
        subscriptionPlan && allowedPlanNames.includes(subscriptionPlan as (typeof allowedPlanNames)[number])
          ? subscriptionPlan
          : 'Growth ERP';
      const db = getDb();
      const effectivePlanPrice = getEffectivePlanPriceInr(chosenPlan, db.planPricingCatalog);
      const school: School = {
        id: `school-${Date.now()}`,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        city: city.trim(),
        state: state?.trim() || 'Haryana',
        board: board || 'HBSE',
        udiseCode: udiseCode?.trim() || '06000000000',
        haryanaMisCode: haryanaMisCode?.trim() || 'HR-NEW-001',
        session: '2026-27',
        subscriptionPlan: chosenPlan,
        active: true,
        studentCount: 0,
        teacherCount: 0,
        paymentStatus: 'Paid',
        paidAmountInr: effectivePlanPrice,
        billingCycle: 'Annual',
        validUntil: '2027-03-31',
        customFeatureOverrides: {},
        enabledFeatures: getPlanDefaultFeatures(chosenPlan),
        allotmentUpdatedAt: new Date().toISOString(),
        allotmentUpdatedBy: req.user!.name,
      };
      db.schools.push(school);
      db.schoolWeights[school.id] = {
        weights: { academic: 35, olq: 30, learningHabits: 15, participation: 10, personalGrowth: 10 },
        version: 'v1.0',
        approvedBy: req.user!.name,
      };
      appendAuditLog({
        schoolId: school.id,
        actor: req.user!,
        action: 'PROVISIONED_SCHOOL_TENANT',
        entityType: 'School',
        entityId: school.id,
        detail: `Onboarded new SaaS tenant ${school.name} (${school.code}) on ${chosenPlan}.`,
      });
      saveDb();
      res.status(201).json({ school });
    },
  );

  // Strictly Super Admin Only: Allot paid subscription plan & customize per-school feature entitlements
  const handleUpdateSchoolEntitlements = (req: AuthedRequest, res: Response) => {
    const targetId = req.params.id;
    const body = (req.body || {}) as {
      subscriptionPlan?: string;
      customFeatureOverrides?: Record<string, unknown>;
      resetOverrides?: boolean;
      paymentStatus?: School['paymentStatus'];
      paidAmountInr?: number;
      billingCycle?: School['billingCycle'];
      validUntil?: string;
      allotmentNotes?: string;
      active?: boolean;
    };

    const db = getDb();
    const school = db.schools.find((s) => s.id === targetId);
    if (!school) {
      res.status(404).json({ error: 'School tenant not found.' });
      return;
    }

    const prevPlan = school.subscriptionPlan;
    if (body.subscriptionPlan !== undefined) {
      const validPlan = SUBSCRIPTION_PLANS.find((p) => p.id === body.subscriptionPlan);
      if (!validPlan) {
        res.status(400).json({
          error: `Invalid subscription plan. Allowed plans: ${SUBSCRIPTION_PLANS.map((p) => p.id).join(', ')}`,
        });
        return;
      }
      school.subscriptionPlan = validPlan.id;
    }

    const planDefaults = getPlanDefaultFeatures(school.subscriptionPlan);
    if (body.resetOverrides) {
      school.customFeatureOverrides = {};
    } else if (body.customFeatureOverrides !== undefined) {
      school.customFeatureOverrides = sanitizeFeatureOverrides(
        body.customFeatureOverrides,
        planDefaults,
      );
    } else if (school.customFeatureOverrides) {
      school.customFeatureOverrides = sanitizeFeatureOverrides(
        school.customFeatureOverrides,
        planDefaults,
      );
    }

    const allowedPaymentStatuses: Array<NonNullable<School['paymentStatus']>> = [
      'Paid',
      'Trial',
      'Pending',
      'Custom Enterprise',
    ];
    if (body.paymentStatus && allowedPaymentStatuses.includes(body.paymentStatus)) {
      school.paymentStatus = body.paymentStatus;
    }

    const allowedBillingCycles: Array<NonNullable<School['billingCycle']>> = [
      'Monthly',
      'Quarterly',
      'Annual',
    ];
    if (body.billingCycle && allowedBillingCycles.includes(body.billingCycle)) {
      school.billingCycle = body.billingCycle;
    }

    if (
      typeof body.paidAmountInr === 'number' &&
      Number.isFinite(body.paidAmountInr) &&
      body.paidAmountInr >= 0 &&
      body.paidAmountInr <= 10_000_000
    ) {
      school.paidAmountInr = Math.round(body.paidAmountInr);
    }

    if (typeof body.validUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.validUntil.trim())) {
      school.validUntil = body.validUntil.trim();
    }

    if (typeof body.allotmentNotes === 'string') {
      school.allotmentNotes = body.allotmentNotes.trim().slice(0, 400);
    }

    if (typeof body.active === 'boolean') {
      school.active = body.active;
    }

    school.enabledFeatures = getEnabledFeaturesForSchool(school);
    school.allotmentUpdatedAt = new Date().toISOString();
    school.allotmentUpdatedBy = req.user!.name;

    const overrideCount = Object.keys(school.customFeatureOverrides || {}).length;
    appendAuditLog({
      schoolId: school.id,
      actor: req.user!,
      action: 'UPDATED_SUBSCRIPTION_PLAN',
      entityType: 'School',
      entityId: school.id,
      detail: `Allotted plan ${school.subscriptionPlan} (was ${prevPlan}) for ${school.name} with ${school.enabledFeatures.length} active features (${overrideCount} custom overrides; Google Maps ${hasGoogleMapsAccess(school) ? 'Enabled' : 'Locked'}).`,
    });
    saveDb();
    res.json({
      school,
      googleMapsEnabled: hasGoogleMapsAccess(school),
      enabledFeatures: school.enabledFeatures,
    });
  };

  app.patch(
    '/api/schools/:id/subscription',
    requireAuth,
    requireRoles(['super_admin']),
    handleUpdateSchoolEntitlements,
  );

  app.patch(
    '/api/schools/:id/entitlements',
    requireAuth,
    requireRoles(['super_admin']),
    handleUpdateSchoolEntitlements,
  );

  // Strictly COO of Rai Plus Only: Customize global subscription plan catalog prices
  app.patch(
    '/api/platform/plan-pricing',
    requireAuth,
    requireRoles(['super_admin']),
    (req: AuthedRequest, res) => {
      if (!isRaiPlusCoo(req.user)) {
        res.status(403).json({
          error: 'Only the COO of Rai Plus is authorized to customize subscription plan prices.',
        });
        return;
      }

      const body = (req.body || {}) as {
        resetToDefaults?: boolean;
        prices?: Record<
          string,
          { priceMonthlyInr?: number; annualDiscountPct?: number; note?: string }
        >;
      };

      const db = getDb();
      const now = new Date().toISOString();

      if (body.resetToDefaults === true) {
        db.planPricingCatalog = {};
        appendAuditLog({
          schoolId: db.schools[0]?.id || 'platform',
          actor: req.user!,
          action: 'UPDATED_PLATFORM_PLAN_PRICING',
          entityType: 'PlanPricingCatalog',
          entityId: 'rai-plus-plans',
          detail: `COO reset all Rai Plus subscription plan prices to default catalog rates.`,
        });
        saveDb();
        res.json({
          planPricingCatalog: db.planPricingCatalog,
          plans: resolveSubscriptionPlans(db.planPricingCatalog),
        });
        return;
      }

      if (!body.prices || typeof body.prices !== 'object') {
        res.status(400).json({ error: 'Provide plan pricing map under "prices".' });
        return;
      }

      const nextCatalog = { ...(db.planPricingCatalog || {}) };
      const updatedSummary: string[] = [];

      for (const plan of SUBSCRIPTION_PLANS) {
        const incoming = body.prices[plan.id];
        if (!incoming || typeof incoming !== 'object') continue;
        const priceVal = Number(incoming.priceMonthlyInr);
        if (!Number.isFinite(priceVal) || priceVal < 0 || priceVal > 10_000_000) {
          res.status(400).json({
            error: `Invalid monthly price for ${plan.id}. Must be between ₹0 and ₹1,00,00,000.`,
          });
          return;
        }
        const roundedPrice = Math.round(priceVal);
        const discountRaw =
          incoming.annualDiscountPct !== undefined ? Number(incoming.annualDiscountPct) : 10;
        const discountPct = Number.isFinite(discountRaw)
          ? Math.min(50, Math.max(0, Math.round(discountRaw)))
          : 10;
        const cleanNote =
          typeof incoming.note === 'string' && incoming.note.trim()
            ? incoming.note.trim().slice(0, 240)
            : undefined;

        nextCatalog[plan.id] = {
          priceMonthlyInr: roundedPrice,
          annualDiscountPct: discountPct,
          updatedAt: now,
          updatedBy: req.user!.name,
          note: cleanNote,
        };
        updatedSummary.push(`${plan.id}: ₹${roundedPrice.toLocaleString('en-IN')}/mo`);
      }

      if (updatedSummary.length === 0) {
        res.status(400).json({ error: 'No valid Rai Plus subscription plan prices were provided.' });
        return;
      }

      db.planPricingCatalog = nextCatalog;
      appendAuditLog({
        schoolId: db.schools[0]?.id || 'platform',
        actor: req.user!,
        action: 'UPDATED_PLATFORM_PLAN_PRICING',
        entityType: 'PlanPricingCatalog',
        entityId: 'rai-plus-plans',
        detail: `COO customized Rai Plus plan pricing — ${updatedSummary.join(' · ')}.`,
      });
      saveDb();

      res.json({
        planPricingCatalog: db.planPricingCatalog,
        plans: resolveSubscriptionPlans(db.planPricingCatalog),
      });
    },
  );

  // ---------------- CHAPTER MASTERY GAMIFICATION & LEADERBOARD ----------------
  function ensureChapterMasteryBaselineForSchool(
    db: DatabaseState,
    schoolId: string,
  ): ChapterMasteryAttempt[] {
    if (!Array.isArray(db.chapterMasteryAttempts)) {
      db.chapterMasteryAttempts = [];
    }
    const existingForSchool = db.chapterMasteryAttempts.filter((a) => a.schoolId === schoolId);
    if (existingForSchool.length > 0) {
      return existingForSchool;
    }

    // Seed realistic classmate attempts from real enrolled students in this school
    const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
    const subjects = ['Mathematics', 'Science', 'English', 'Social Science'];
    const sampleChapters: Array<{ subject: string; id: string; title: string }> = [
      { subject: 'Mathematics', id: 'seed-ch-math-1', title: 'Number Systems & Real Numbers' },
      { subject: 'Science', id: 'seed-ch-sci-1', title: 'Chemical Reactions & Matter' },
      { subject: 'English', id: 'seed-ch-eng-1', title: 'Reading Comprehension & Grammar' },
      { subject: 'Social Science', id: 'seed-ch-sst-1', title: 'Democratic Governance & Resources' },
    ];

    // Pick up to 18 representative students spread across classes
    const picked: typeof schoolStudents = [];
    const perClassCount: Record<string, number> = {};
    for (const st of schoolStudents) {
      const clsKey = st.classSection || '10-A';
      if ((perClassCount[clsKey] || 0) >= 4) continue;
      perClassCount[clsKey] = (perClassCount[clsKey] || 0) + 1;
      picked.push(st);
      if (picked.length >= 18) break;
    }

    const seeded: ChapterMasteryAttempt[] = [];
    const nowMs = Date.now();
    picked.forEach((st, idx) => {
      const classMatch = /(\d{1,2})/.exec(st.classSection || '10');
      const classNum = classMatch ? Number(classMatch[1]) : 10;
      const chaptersDone = 1 + (idx % 3);
      for (let c = 0; c < chaptersDone; c += 1) {
        const ch = sampleChapters[(idx + c) % sampleChapters.length];
        const masteryPct = Math.min(99, 76 + ((idx * 7 + c * 5) % 23));
        const timedMode = (idx + c) % 4 !== 0;
        const timeLimitSec = 150;
        const timeUsedSec = timedMode ? 62 + ((idx * 13 + c * 11) % 68) : 0;
        const bestStreak = 4 + ((idx + c * 2) % 6);
        const xpEarned = Math.round(masteryPct * 3.4 + (timedMode ? 75 : 20) + bestStreak * 12);
        const badges = ['first_chapter'];
        if (timedMode && masteryPct >= 85) badges.push('timed_quiz_ace');
        if (timedMode && timeLimitSec - timeUsedSec >= timeLimitSec * 0.4) badges.push('speed_scholar');
        if (bestStreak >= 5) badges.push('combo_streaker');
        if (masteryPct >= 95) badges.push('perfect_scholar');
        if (chaptersDone >= 3) badges.push('syllabus_champion');

        seeded.push({
          id: `cm-seed-${schoolId}-${st.id}-${c}`,
          schoolId,
          userId: `stu-user-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          classSection: st.classSection,
          classNumber: classNum,
          subject: subjects[(idx + c) % subjects.length],
          chapterId: `${ch.id}-c${classNum}`,
          chapterTitle: ch.title,
          xpEarned,
          masteryPct,
          accuracyPct: Math.max(70, masteryPct - 4),
          stars: masteryPct >= 88 ? 3 : masteryPct >= 68 ? 2 : 1,
          bestStreak,
          timedMode,
          timeUsedSec,
          timeLimitSec,
          mistakesCount: masteryPct >= 92 ? 0 : 1,
          mistakesRecovered: masteryPct >= 92 ? 0 : 1,
          badgesEarned: badges,
          completedAt: new Date(nowMs - (idx * 6 + c * 3) * 3600000).toISOString(),
        });
      }
    });

    if (seeded.length > 0) {
      db.chapterMasteryAttempts.push(...seeded);
      saveDb();
    }
    return seeded;
  }

  app.get('/api/chapter-mastery/leaderboard', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId || db.schools[0]?.id || 'school-vis-jjr';
    const classFilter = typeof req.query.classFilter === 'string' ? req.query.classFilter : 'ALL';
    const subjectFilter =
      typeof req.query.subjectFilter === 'string' ? req.query.subjectFilter : 'ALL';

    const schoolAttempts = ensureChapterMasteryBaselineForSchool(db, schoolId);
    const currentStudentId = req.user!.linkedStudentIds?.[0];
    const leaderboard = aggregateChapterMasteryLeaderboard({
      attempts: schoolAttempts,
      currentUserId: req.user!.id,
      currentStudentId,
      classFilter,
      subjectFilter,
    });

    const { availableSubjects, champions: subjectChampions } = computeSubjectChampions({
      attempts: schoolAttempts,
      currentUserId: req.user!.id,
      currentStudentId,
      classFilter,
    });

    const userAttempts = schoolAttempts.filter(
      (a) => a.userId === req.user!.id || (currentStudentId && a.studentId === currentStudentId),
    );
    const availableClasses = Array.from(
      new Set(schoolAttempts.map((a) => a.classSection).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    res.json({
      leaderboard,
      availableClasses,
      availableSubjects,
      subjectChampions,
      myAttempts: userAttempts,
      totalParticipants: leaderboard.length,
    });
  });

  app.post('/api/chapter-mastery/attempt', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId || db.schools[0]?.id || 'school-vis-jjr';
    ensureChapterMasteryBaselineForSchool(db, schoolId);

    const body = (req.body || {}) as Partial<ChapterMasteryAttempt>;
    if (!body.chapterId || !body.chapterTitle || !body.subject) {
      res.status(400).json({ error: 'chapterId, chapterTitle, and subject are required.' });
      return;
    }

    const user = req.user!;
    const linkedStudent =
      user.linkedStudentIds && user.linkedStudentIds.length > 0
        ? db.students.find((s) => s.id === user.linkedStudentIds![0])
        : undefined;

    const studentName =
      linkedStudent?.name || body.studentName?.trim() || user.name || 'Student Learner';
    const classSection =
      linkedStudent?.classSection ||
      body.classSection?.trim() ||
      (body.classNumber ? `${body.classNumber}-A` : user.classTeacherOf || '10-A');

    const attempt: ChapterMasteryAttempt = {
      id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      schoolId,
      userId: user.id,
      studentId: linkedStudent?.id,
      studentName,
      classSection,
      classNumber: Number(body.classNumber) || 10,
      subject: String(body.subject),
      chapterId: String(body.chapterId),
      chapterTitle: String(body.chapterTitle),
      xpEarned: Math.max(0, Math.round(Number(body.xpEarned) || 0)),
      masteryPct: Math.min(100, Math.max(0, Math.round(Number(body.masteryPct) || 0))),
      accuracyPct: Math.min(100, Math.max(0, Math.round(Number(body.accuracyPct) || 0))),
      stars: body.stars === 3 || body.stars === 2 || body.stars === 1 ? body.stars : 1,
      bestStreak: Math.max(0, Math.round(Number(body.bestStreak) || 0)),
      timedMode: Boolean(body.timedMode),
      timeUsedSec: Math.max(0, Math.round(Number(body.timeUsedSec) || 0)),
      timeLimitSec: Math.max(0, Math.round(Number(body.timeLimitSec) || 0)),
      mistakesCount: Math.max(0, Math.round(Number(body.mistakesCount) || 0)),
      mistakesRecovered: Math.max(0, Math.round(Number(body.mistakesRecovered) || 0)),
      badgesEarned: Array.isArray(body.badgesEarned)
        ? body.badgesEarned.map(String).slice(0, 20)
        : [],
      completedAt: new Date().toISOString(),
    };

    db.chapterMasteryAttempts = db.chapterMasteryAttempts || [];
    db.chapterMasteryAttempts.push(attempt);
    saveDb();

    const schoolAttempts = db.chapterMasteryAttempts.filter((a) => a.schoolId === schoolId);
    const leaderboard = aggregateChapterMasteryLeaderboard({
      attempts: schoolAttempts,
      currentUserId: user.id,
      currentStudentId: linkedStudent?.id,
    });

    res.status(201).json({
      attempt,
      leaderboard,
    });
  });

  // ---------------- SERVER-SIDE GEMINI AI ENDPOINTS ----------------
  app.post(
    '/api/ai/generate-resource',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    async (req: AuthedRequest, res) => {
      try {
        const { board, classSection, subject, chapter, category } = req.body as {
          board: string;
          classSection: string;
          subject: string;
          chapter: string;
          category: string;
        };
        if (!subject?.trim() || !chapter?.trim() || !category) {
          res.status(400).json({ error: 'Subject, chapter, and category are required.' });
          return;
        }
        if (req.user!.role === 'teacher') {
          const db = getDb();
          const schoolId = req.activeSchoolId!;
          const teacherScope = computeTeacherTeachingScope(
            req.user!,
            db.timetable.filter((t) => t.schoolId === schoolId),
          );
          if (
            !canTeacherAccessSubjectResource(
              teacherScope,
              classSection || '9-A',
              subject.trim(),
            )
          ) {
            res.status(403).json({
              error:
                'Resource drafting restricted: teachers may only generate packs for their assigned classes and subjects.',
            });
            return;
          }
        }
        const draft = await generateAcademicResourceDraft({
          board: board || 'HBSE',
          classSection: classSection || '9-A',
          subject: subject.trim(),
          chapter: chapter.trim(),
          category,
        });
        res.json(draft);
      } catch (err) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'AI resource generation failed.',
        });
      }
    },
  );

  app.post(
    '/api/ai/student-insight',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher', 'counsellor']),
    async (req: AuthedRequest, res) => {
      try {
        const { studentId } = req.body as { studentId: string };
        const db = getDb();
        const schoolId = req.activeSchoolId!;
        const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
        if (!student) {
          res.status(404).json({ error: 'Student not found in active school.' });
          return;
        }
        const weights = db.schoolWeights[schoolId]?.weights;
        const breakdown = calculateLearnersScore(
          db.evidence.filter((e) => e.schoolId === schoolId && e.studentId === studentId),
          weights,
        );
        const missingComponents = Object.values(breakdown.components)
          .filter((c) => c.score === null)
          .map((c) => c.label);

        const result = await generateStudentInsightDraft({
          studentName: student.name,
          classSection: student.classSection,
          overallScore: breakdown.overallScore,
          missingComponents,
          strengths: breakdown.learningProfile.strengths,
          supportAreas: breakdown.learningProfile.supportAreas,
        });
        res.json(result);
      } catch (err) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'AI student insight generation failed.',
        });
      }
    },
  );

  app.post(
    '/api/ai/chapter-knowledge-map',
    requireAuth,
    async (req: AuthedRequest, res) => {
      try {
        const {
          board,
          classNumber,
          subject,
          chapterTitle,
          keyTopics,
          realLifeAnchor,
          focusPrompt,
        } = req.body as {
          board?: string;
          classNumber?: number;
          subject?: string;
          chapterTitle?: string;
          keyTopics?: string[];
          realLifeAnchor?: string;
          focusPrompt?: string;
        };

        if (!subject?.trim() || !chapterTitle?.trim()) {
          res.status(400).json({ error: 'Subject and chapterTitle are required.' });
          return;
        }

        const safeClass = Math.min(12, Math.max(1, Math.round(Number(classNumber) || 10)));
        const visual = await generateChapterKnowledgeVisual({
          board: (board || 'NCERT / HBSE').trim(),
          classNumber: safeClass,
          subject: subject.trim(),
          chapterTitle: chapterTitle.trim(),
          keyTopics: Array.isArray(keyTopics) ? keyTopics.map(String).slice(0, 8) : [],
          realLifeAnchor: (realLifeAnchor || `Everyday applications of ${chapterTitle.trim()}`).trim(),
          focusPrompt: typeof focusPrompt === 'string' ? focusPrompt.trim().slice(0, 240) : undefined,
        });

        res.json(visual);
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'AI knowledge map generation failed.',
        });
      }
    },
  );

  // ---------------- LIVE VIS DRIVE PDF EXTRACTION & PRODUCTION REGISTER APPROVAL ----------------
  app.post(
    '/api/vis-reports/:fileId/extract',
    requireAuth,
    async (req: AuthedRequest, res) => {
      const { fileId } = req.params;
      const catalogItem = VIS_REPORTS_CATALOG.find((item) => item.fileId === fileId);
      if (!catalogItem) {
        res.status(404).json({ error: 'Student report PDF not found in VIS Drive catalog.' });
        return;
      }

      const db = getDb();
      const user = req.user!;
      if (user.role === 'parent' || user.role === 'student') {
        const linked = new Set(user.linkedStudentIds || []);
        const ownsReport = db.students.some(
          (st) => linked.has(st.id) && st.visReportFileId === fileId,
        );
        if (!ownsReport) {
          res.status(403).json({ error: 'Access restricted: parents and students may only inspect their own linked report.' });
          return;
        }
      } else if (user.role === 'teacher') {
        const schoolId = req.activeSchoolId ?? 'school-vis-jjr';
        const teacherScope = computeTeacherTeachingScope(
          user,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        if (
          !teacherScope.authorizedClassKeys.has(
            normalizeCurriculumClassKey(catalogItem.normalizedClass),
          )
        ) {
          res.status(403).json({
            error: 'Access restricted: teachers may only view DMIT reports for classes they teach.',
          });
          return;
        }
      }

      const force = Boolean((req.body as { force?: boolean } | undefined)?.force);
      if (!force && db.visParsedReports?.[fileId]) {
        res.json({ profile: db.visParsedReports[fileId], cached: true });
        return;
      }

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vis-extract-'));
      const pdfPath = path.join(tmpDir, `${fileId}.pdf`);
      const txtPath = path.join(tmpDir, `${fileId}.txt`);

      try {
        const urls = [
          `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`,
          `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`,
        ];
        let pdfBuffer: Buffer | null = null;
        for (const url of urls) {
          const resp = await fetch(url, {
            redirect: 'follow',
            headers: { 'User-Agent': 'Mozilla/5.0' },
          });
          if (!resp.ok) continue;
          const contentLength = Number(resp.headers.get('content-length') || 0);
          if (contentLength > MAX_DRIVE_PDF_BYTES) {
            res.status(413).json({
              error: 'PDF report exceeds maximum supported size (20 MB) for automated extraction.',
            });
            return;
          }
          const arr = Buffer.from(await resp.arrayBuffer());
          if (arr.byteLength > MAX_DRIVE_PDF_BYTES) {
            res.status(413).json({
              error: 'PDF report exceeds maximum supported size (20 MB) for automated extraction.',
            });
            return;
          }
          if (arr.slice(0, 4).toString('utf8') === '%PDF') {
            pdfBuffer = arr;
            break;
          }
        }
        if (!pdfBuffer) {
          res.status(502).json({
            error: 'Could not download PDF binary from Google Drive right now. Please try Open Original Drive PDF.',
          });
          return;
        }

        let rawText = '';
        if (fs.existsSync('/usr/bin/gs')) {
          fs.writeFileSync(pdfPath, pdfBuffer);
          await execFileAsync(
            '/usr/bin/gs',
            [
              '-q',
              '-dSAFER',
              '-dNOPAUSE',
              '-dBATCH',
              '-sDEVICE=txtwrite',
              `-sOutputFile=${txtPath}`,
              pdfPath,
            ],
            { timeout: 20_000, maxBuffer: 4 * 1024 * 1024 },
          );
          rawText = fs.readFileSync(txtPath, 'utf8');
        } else {
          // Cross-platform fallback for Windows or shared hosts without Ghostscript
          rawText = extractTextFromPdfBufferFallback(pdfBuffer);
        }
        const profile = parseVisReportText(rawText, {
          fileId,
          extractedAt: new Date().toISOString(),
          extractionSource: 'live_drive_pdf',
          fallbackName: `${catalogItem.normalizedClass} ${catalogItem.studentName}`,
        });

        if (!db.visParsedReports) db.visParsedReports = {};
        db.visParsedReports[fileId] = profile;

        appendAuditLog({
          schoolId: req.activeSchoolId ?? 'school-vis-jjr',
          actor: user,
          action: 'EXTRACTED_VIS_DRIVE_REPORT',
          entityType: 'VisReport',
          entityId: fileId,
          detail: `Live-extracted DMIT/Learning Style telemetry from Drive PDF ${catalogItem.fileName} (${profile.vak.dominantStyle || 'N/A'} learner).`,
        });

        saveDb();
        res.json({ profile, cached: false });
      } catch (err) {
        res.status(500).json({
          error: err instanceof Error ? err.message : 'PDF extraction failed.',
        });
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    },
  );

  // Enrol or link any of the 424 VIS Drive Catalog students into VIS Jhajjar's live Student 360° directory
  app.post(
    '/api/vis-reports/:fileId/enrol',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { fileId } = req.params;
      const item = VIS_REPORTS_CATALOG.find((r) => r.fileId === fileId);
      if (!item) {
        res.status(404).json({ error: 'Student report PDF not found in VIS Drive catalog.' });
        return;
      }

      const db = getDb();
      const targetSchoolId = 'school-vis-jjr';
      if (req.activeSchoolId !== targetSchoolId && req.user!.role !== 'super_admin') {
        res.status(403).json({ error: 'VIS Report enrolment applies to VIS Jhajjar tenant only.' });
        return;
      }

      const existing = db.students.find(
        (s) => s.schoolId === targetSchoolId && s.visReportFileId === fileId,
      );
      if (existing) {
        res.json({ student: existing, created: false });
        return;
      }

      const classBase = item.normalizedClass
        .replace(/^Class\s+/i, '')
        .replace(/\s+Class$/i, '')
        .trim();
      const secPart =
        item.section && item.section !== 'General' ? item.section.trim() : 'A';
      const classSection = classBase.includes('-') ? classBase : `${classBase}-${secPart}`;
      const visStudents = db.students.filter((s) => s.schoolId === targetSchoolId);
      const nextRoll = String(
        visStudents.filter((s) => s.classSection === classSection).length + 1,
      ).padStart(2, '0');
      const seqNum = String(visStudents.length + 101).padStart(4, '0');

      const student: StudentRecord = {
        id: `stu-vis-${fileId.slice(0, 8).toLowerCase()}`,
        schoolId: targetSchoolId,
        admissionNo: `VIS-2026-${seqNum}`,
        rollNo: nextRoll,
        name: item.studentName,
        classSection,
        house: visStudents.length % 2 === 0 ? 'Arjuna House' : 'Kalpana House',
        guardianName: `Parent / Guardian of ${item.studentName}`,
        guardianPhone: '+91 98125 00000',
        udiseStudentId: `2406150102408${seqNum}`,
        haryanaMisId: `HMIS-JJR-${seqNum}`,
        attendancePct: 93.0,
        feeBalanceInr: 0,
        totalFeeAnnualInr: 36000,
        reportApprovalStatus: 'Pending Approval',
        formulaVersion: 'v1.2',
        documents: [
          { name: 'VIS Drive DMIT Report Linked', verified: true, referenceNo: item.fileId.slice(0, 12) },
        ],
        responsibilities: [],
        achievements: ['VIS Drive DMIT Profile Linked'],
        confidentialCounsellorNote: `Linked from VIS Drive Reports Vault (${item.fileName}).`,
        visReportFileId: item.fileId,
      };

      db.students.push(student);
      syncSchoolFamilyAccounts(db, targetSchoolId);

      appendAuditLog({
        schoolId: targetSchoolId,
        actor: req.user!,
        action: 'LINKED_VIS_DRIVE_STUDENT',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Added ${student.name} (Class ${student.classSection}) from VIS Reports Vault into active Student 360° directory.`,
      });

      saveDb();
      res.status(201).json({ student, created: true });
    },
  );

  app.post(
    '/api/production-register/:rowId/approve',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const { rowId } = req.params;
      const { note } = (req.body || {}) as { note?: string };
      const regRow = PRODUCTION_REGISTER.find((r) => r.rowId === rowId);
      if (!regRow) {
        res.status(404).json({ error: 'Production register chapter row not found.' });
        return;
      }

      const db = getDb();
      if (req.user!.role === 'teacher') {
        const schoolId = req.activeSchoolId ?? 'school-vis-jjr';
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        if (
          !canTeacherAccessSubjectResource(
            teacherScope,
            regRow.classLabel,
            regRow.subject,
          )
        ) {
          res.status(403).json({
            error:
              'Approval restricted: only the subject teacher for this class (or Academic Coordinator/Principal) may approve this chapter.',
          });
          return;
        }
      }
      if (!db.registerApprovals) db.registerApprovals = {};
      const approval = {
        approvedBy: `${req.user!.name} (${req.user!.designation})`,
        approvedAt: new Date().toISOString(),
        note: note?.trim() || 'Reviewed curriculum pack and verified classroom readiness.',
      };
      db.registerApprovals[rowId] = approval;

      // Sync any matching AcademicResource rows in school-vis-jjr to Approved
      for (const r of db.resources) {
        if (
          r.schoolId === 'school-vis-jjr' &&
          r.subject.toLowerCase().includes(regRow.subject.toLowerCase()) &&
          r.chapter.toLowerCase().includes(regRow.chapterTitle.toLowerCase().slice(0, 12))
        ) {
          r.status = 'Approved';
          r.updatedAt = new Date().toISOString().slice(0, 10);
        }
      }

      appendAuditLog({
        schoolId: req.activeSchoolId ?? 'school-vis-jjr',
        actor: req.user!,
        action: 'CONFIRMED_TEACHER_APPROVAL',
        entityType: 'ProductionRegister',
        entityId: rowId,
        detail: `Confirmed Teacher Approval for Class ${regRow.classLabel} ${regRow.subject} — ${regRow.chapterTitle}.`,
      });

      saveDb();
      res.json({ approval, registerApprovals: db.registerApprovals });
    },
  );

  // ---------------- FINANCIAL DASHBOARD & SIBLING PAIRING ----------------
  app.post(
    '/api/finance/target',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: AuthedRequest, res) => {
      const { overrideTargetInr, monthKey } = (req.body || {}) as {
        overrideTargetInr: number | null;
        monthKey?: FeeMonthKey;
      };

      if (
        overrideTargetInr !== null &&
        (!Number.isFinite(Number(overrideTargetInr)) || Number(overrideTargetInr) <= 0)
      ) {
        res.status(400).json({ error: 'Monthly target override must be a positive INR amount or null.' });
        return;
      }

      const resolvedMonth: FeeMonthKey =
        monthKey && ACADEMIC_FEE_MONTHS.includes(monthKey) ? monthKey : 'November';

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      if (!db.financialTargets) db.financialTargets = {};

      const nextConfig: MonthlyFeeTargetConfig = {
        schoolId,
        monthKey: resolvedMonth,
        year: ['January', 'February', 'March'].includes(resolvedMonth) ? 2027 : 2026,
        overrideTargetInr:
          overrideTargetInr === null ? null : Math.round(Number(overrideTargetInr)),
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      db.financialTargets[schoolId] = nextConfig;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action:
          nextConfig.overrideTargetInr === null
            ? 'RESET_MONTHLY_FEE_TARGET'
            : 'UPDATED_MONTHLY_FEE_TARGET',
        entityType: 'MonthlyFeeTarget',
        entityId: `${schoolId}:${resolvedMonth}`,
        detail:
          nextConfig.overrideTargetInr === null
            ? `Reset ${resolvedMonth} fee collection target to schedule-computed expectation.`
            : `Set ${resolvedMonth} fee collection target override to INR ${nextConfig.overrideTargetInr.toLocaleString('en-IN')}.`,
      });

      saveDb();
      res.json({ financialTarget: nextConfig });
    },
  );

  app.post(
    '/api/finance/sibling-groups/:groupId/merge',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { groupId } = req.params;
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const group = (db.siblingGroups || []).find(
        (g) => g.id === groupId && g.schoolId === schoolId,
      );
      if (!group) {
        res.status(404).json({ error: 'Sibling pairing alert not found in active school.' });
        return;
      }

      group.status = 'Merged';
      group.updatedBy = req.user!.name;
      group.updatedAt = new Date().toISOString().slice(0, 10);

      const memberSet = new Set(group.memberAccountIds);
      for (const acc of db.feeAccounts || []) {
        if (acc.schoolId === schoolId && memberSet.has(acc.id)) {
          acc.familyGroupId = group.id;
        }
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const familyAccount =
        synced.familyAccounts.find((f) => f.siblingGroupId === group.id) ?? null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'MERGED_SIBLING_FAMILY_LEDGER',
        entityType: 'SiblingFamilyGroup',
        entityId: group.id,
        detail: `Confirmed & auto-merged ${group.memberAccountIds.length} sibling accounts under ${group.guardianName} (${group.contactNo || 'household link'}).`,
      });

      saveDb();
      res.json({ siblingGroup: group, familyAccount });
    },
  );

  app.post(
    '/api/finance/sibling-groups/:groupId/dismiss',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { groupId } = req.params;
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const group = (db.siblingGroups || []).find(
        (g) => g.id === groupId && g.schoolId === schoolId,
      );
      if (!group) {
        res.status(404).json({ error: 'Sibling pairing alert not found in active school.' });
        return;
      }

      group.status = 'Dismissed';
      group.updatedBy = req.user!.name;
      group.updatedAt = new Date().toISOString().slice(0, 10);

      for (const acc of db.feeAccounts || []) {
        if (acc.schoolId === schoolId && acc.familyGroupId === group.id) {
          acc.familyGroupId = undefined;
        }
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const familyAccount =
        synced.familyAccounts.find((f) => f.siblingGroupId === group.id) ?? null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DISMISSED_SIBLING_ALERT',
        entityType: 'SiblingFamilyGroup',
        entityId: group.id,
        detail: `Dismissed sibling pairing alert for ${group.guardianName}.`,
      });

      saveDb();
      res.json({ siblingGroup: group, familyAccount });
    },
  );

  // ---------------- STUDENT ENROLMENT & UNIFIED FAMILY ACCOUNTS ----------------
  app.post(
    '/api/students',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const {
        name,
        classSection,
        guardianName,
        guardianPhone,
        guardianEmail,
        admissionNo,
        rollNo,
        house,
        totalFeeAnnualInr,
        feeBalanceInr,
        address,
      } = (req.body || {}) as {
        name?: string;
        classSection?: string;
        guardianName?: string;
        guardianPhone?: string;
        guardianEmail?: string;
        admissionNo?: string;
        rollNo?: string;
        house?: string;
        totalFeeAnnualInr?: number;
        feeBalanceInr?: number;
        address?: string;
      };

      if (
        !name?.trim() ||
        !classSection?.trim() ||
        !guardianName?.trim() ||
        (!guardianPhone?.trim() && !guardianEmail?.trim())
      ) {
        res.status(400).json({
          error:
            'Student name, classSection, guardianName, and guardianPhone or guardianEmail are required.',
        });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const school = db.schools.find((s) => s.id === schoolId);
      const codePrefix = school?.code.split('-')[0] || 'VIS';
      const nextAdmNo =
        admissionNo?.trim() ||
        `${codePrefix}-2026-${String(schoolStudents.length + 101).padStart(4, '0')}`;
      const nextRoll =
        rollNo?.trim() ||
        String(
          schoolStudents.filter((s) => s.classSection === classSection.trim()).length + 1,
        ).padStart(2, '0');

      const annualDemand = Number.isFinite(Number(totalFeeAnnualInr)) && Number(totalFeeAnnualInr) > 0
        ? Math.round(Number(totalFeeAnnualInr))
        : 36000;
      const pendingBalance = Number.isFinite(Number(feeBalanceInr)) && Number(feeBalanceInr) >= 0
        ? Math.round(Number(feeBalanceInr))
        : annualDemand;

      const student: StudentRecord = {
        id: `stu-${schoolId.split('-')[1] || 'sch'}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        schoolId,
        admissionNo: nextAdmNo,
        rollNo: nextRoll,
        name: name.trim(),
        classSection: classSection.trim(),
        house: house?.trim() || 'Arjuna House',
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone?.trim() || '',
        ...(guardianEmail?.trim() ? { guardianEmail: guardianEmail.trim() } : {}),
        ...(address?.trim() ? { address: address.trim() } : {}),
        udiseStudentId: `UD-${Date.now().toString().slice(-6)}`,
        haryanaMisId: `HR-${Date.now().toString().slice(-6)}`,
        attendancePct: 100,
        feeBalanceInr: pendingBalance,
        totalFeeAnnualInr: annualDemand,
        reportApprovalStatus: 'Draft',
        formulaVersion: 'v1.2',
        documents: [{ name: 'Birth Certificate', verified: true }],
        responsibilities: [],
        achievements: [],
        confidentialCounsellorNote: '',
      };

      db.students.push(student);

      // Seed matching ledger row with address if provided before reconciling families
      if (address?.trim()) {
        const feeAcc: import('./src/types').FeeLedgerAccount = {
          id: `fee-acc-${schoolId}-${student.id}`,
          schoolId,
          studentId: student.id,
          admissionType: 'NEW',
          admissionNo: student.admissionNo,
          studentName: student.name,
          fatherName: student.guardianName,
          className: student.classSection,
          rawClass: student.classSection,
          contactNo: student.guardianPhone,
          address: address.trim(),
          remarks: '',
          lastYearBalanceInr: 0,
          yearlyDemandInr: annualDemand,
          perMonthInr: Math.round(annualDemand / 12),
          monthlyPaidInr: emptyMonthlyPaidMap(),
          paidAmountInr: Math.max(0, annualDemand - pendingBalance),
          settleAmountInr: 0,
          balanceFeesInr: pendingBalance,
          fineInr: 0,
          scheduleCadence: 'Quarterly',
          expectedScheduleNote: 'Quarterly',
        };
        if (!Array.isArray(db.feeAccounts)) db.feeAccounts = [];
        db.feeAccounts.push(feeAcc);
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const familyAccount = student.familyAccountId
        ? synced.familyAccounts.find((f) => f.id === student.familyAccountId) ?? null
        : null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ENROLLED_STUDENT_RECORD',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Created ${student.name} (${student.classSection}) under guardian ${student.guardianName}${familyAccount ? `; linked to Family Account ${familyAccount.familyCode}` : ''}.`,
      });

      saveDb();
      res.status(201).json({ student, familyAccount });
    },
  );

  app.patch(
    '/api/students/:studentId/contact',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { studentId } = req.params;
      const { guardianName, guardianPhone, guardianEmail, address } = (req.body || {}) as {
        guardianName?: string;
        guardianPhone?: string;
        guardianEmail?: string;
        address?: string;
      };
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (guardianName?.trim()) student.guardianName = guardianName.trim();
      if (guardianPhone?.trim()) student.guardianPhone = guardianPhone.trim();
      if (guardianEmail !== undefined) student.guardianEmail = guardianEmail.trim() || undefined;
      if (address !== undefined) student.address = address.trim() || undefined;

      const ledgerAcc = (db.feeAccounts || []).find(
        (a) => a.schoolId === schoolId && a.studentId === student.id,
      );
      if (ledgerAcc) {
        if (guardianName?.trim()) ledgerAcc.fatherName = guardianName.trim();
        if (guardianPhone?.trim()) ledgerAcc.contactNo = guardianPhone.trim();
        if (address !== undefined) ledgerAcc.address = address.trim();
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const familyAccount = student.familyAccountId
        ? synced.familyAccounts.find((f) => f.id === student.familyAccountId) ?? null
        : null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_PARENT_CONTACT',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Updated parent contact for ${student.name} and synced Family Account associations.`,
      });

      saveDb();
      res.json({ student, familyAccount });
    },
  );

  app.get(
    '/api/finance/family-accounts',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'parent', 'student']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const allFamilies = (db.familyAccounts || []).filter((f) => f.schoolId === schoolId);

      if (user.role === 'parent' || user.role === 'student') {
        const linkedSet = new Set(user.linkedStudentIds || []);
        const scoped = allFamilies.filter(
          (f) => f.status === 'Merged' && f.memberStudentIds.some((id) => linkedSet.has(id)),
        );
        res.json({ familyAccounts: scoped });
        return;
      }

      const statusFilter = req.query.status as string | undefined;
      const filtered = statusFilter
        ? allFamilies.filter((f) => f.status === statusFilter)
        : allFamilies;
      res.json({ familyAccounts: filtered });
    },
  );

  app.get(
    '/api/finance/family-accounts/partial-matches',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const partialMatches = detectPartialContactMatches({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        familyAccounts: db.familyAccounts || [],
        dismissedPartialMatches: db.dismissedPartialMatches || [],
        users: db.users || [],
      });
      res.json({
        partialMatches,
        dismissedPartialMatches: (db.dismissedPartialMatches || []).filter(
          (d) => d.schoolId === schoolId,
        ),
      });
    },
  );

  app.get(
    '/api/finance/family-accounts/:familyId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'parent', 'student']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const fam = (db.familyAccounts || []).find(
        (f) =>
          f.schoolId === schoolId &&
          (f.id === req.params.familyId || f.siblingGroupId === req.params.familyId),
      );
      if (!fam) {
        res.status(404).json({ error: 'Family Account not found in active school.' });
        return;
      }

      if (user.role === 'parent' || user.role === 'student') {
        const linkedSet = new Set(user.linkedStudentIds || []);
        if (fam.status !== 'Merged' || !fam.memberStudentIds.some((id) => linkedSet.has(id))) {
          res.status(403).json({ error: 'Access restricted to your own merged family account.' });
          return;
        }
      }

      res.json({ familyAccount: fam });
    },
  );

  app.post(
    '/api/finance/family-accounts/detect',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const schoolFamilies = synced.familyAccounts.filter((f) => f.schoolId === schoolId);
      const schoolGroups = synced.siblingGroups.filter((g) => g.schoolId === schoolId);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DETECTED_SIBLING_FAMILY_ACCOUNTS',
        entityType: 'FamilyAccount',
        entityId: schoolId,
        detail: `Scanned student database & fee ledger for sibling contacts: ${schoolFamilies.length} unified family account(s) synced (${synced.newlyDetectedCount} newly detected).`,
      });

      saveDb();
      res.json({
        familyAccounts: schoolFamilies,
        siblingGroups: schoolGroups,
        newlyDetectedCount: synced.newlyDetectedCount,
      });
    },
  );

  app.post(
    '/api/finance/family-accounts/partial-matches/dismiss',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { candidateId, memberKeys = [], summaryLabel = '', partialSignals = [] } = (req.body ||
        {}) as {
        candidateId?: string;
        memberKeys?: string[];
        summaryLabel?: string;
        partialSignals?: string[];
      };

      if (!candidateId || !Array.isArray(memberKeys) || memberKeys.length < 2) {
        res.status(400).json({ error: 'candidateId and at least 2 memberKeys are required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      if (!Array.isArray(db.dismissedPartialMatches)) db.dismissedPartialMatches = [];

      const exists = db.dismissedPartialMatches.some(
        (d) => d.schoolId === schoolId && d.id === candidateId,
      );
      if (!exists) {
        db.dismissedPartialMatches.push({
          id: candidateId,
          schoolId,
          memberKeys: [...memberKeys].sort(),
          summaryLabel: summaryLabel.trim() || memberKeys.join(' + '),
          partialSignals,
          dismissedBy: req.user!.name,
          dismissedAt: new Date().toISOString().slice(0, 10),
        });
      }

      const partialMatches = detectPartialContactMatches({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        familyAccounts: db.familyAccounts || [],
        dismissedPartialMatches: db.dismissedPartialMatches || [],
        users: db.users || [],
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DISMISSED_PARTIAL_SIBLING_MATCH',
        entityType: 'FamilyAccount',
        entityId: candidateId,
        detail: `Dismissed partial contact sibling candidate (${summaryLabel || candidateId}).`,
      });

      saveDb();
      res.json({
        dismissedPartialMatches: db.dismissedPartialMatches.filter((d) => d.schoolId === schoolId),
        partialMatches,
      });
    },
  );

  app.post(
    '/api/finance/family-accounts/partial-matches/restore',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { candidateId } = (req.body || {}) as { candidateId?: string };
      if (!candidateId) {
        res.status(400).json({ error: 'candidateId is required.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      db.dismissedPartialMatches = (db.dismissedPartialMatches || []).filter(
        (d) => !(d.schoolId === schoolId && d.id === candidateId),
      );

      const partialMatches = detectPartialContactMatches({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        familyAccounts: db.familyAccounts || [],
        dismissedPartialMatches: db.dismissedPartialMatches || [],
        users: db.users || [],
      });

      saveDb();
      res.json({
        dismissedPartialMatches: db.dismissedPartialMatches.filter((d) => d.schoolId === schoolId),
        partialMatches,
      });
    },
  );

  app.post(
    '/api/finance/family-accounts/:familyId/merge',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { familyId } = req.params;
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const fam = (db.familyAccounts || []).find(
        (f) => f.schoolId === schoolId && (f.id === familyId || f.siblingGroupId === familyId),
      );
      if (!fam) {
        res.status(404).json({ error: 'Family Account not found in active school.' });
        return;
      }

      fam.status = 'Merged';
      const group = (db.siblingGroups || []).find(
        (g) => g.schoolId === schoolId && g.id === fam.siblingGroupId,
      );
      if (group) {
        group.status = 'Merged';
        group.updatedBy = req.user!.name;
        group.updatedAt = new Date().toISOString().slice(0, 10);
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const updatedFamily = synced.familyAccounts.find((f) => f.id === fam.id) ?? fam;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'MERGED_FAMILY_ACCOUNT',
        entityType: 'FamilyAccount',
        entityId: updatedFamily.id,
        detail: `Merged unified Family Account ${updatedFamily.familyCode} (${updatedFamily.memberStudentIds.length} siblings, combined balance INR ${updatedFamily.totalBalanceInr.toLocaleString('en-IN')}).`,
      });

      saveDb();
      res.json({ familyAccount: updatedFamily, siblingGroup: group ?? null });
    },
  );

  app.post(
    '/api/finance/family-accounts/:familyId/dismiss',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { familyId } = req.params;
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const fam = (db.familyAccounts || []).find(
        (f) => f.schoolId === schoolId && (f.id === familyId || f.siblingGroupId === familyId),
      );
      if (!fam) {
        res.status(404).json({ error: 'Family Account not found in active school.' });
        return;
      }

      fam.status = 'Dismissed';
      const group = (db.siblingGroups || []).find(
        (g) => g.schoolId === schoolId && g.id === fam.siblingGroupId,
      );
      if (group) {
        group.status = 'Dismissed';
        group.updatedBy = req.user!.name;
        group.updatedAt = new Date().toISOString().slice(0, 10);
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const updatedFamily = synced.familyAccounts.find((f) => f.id === fam.id) ?? fam;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DISMISSED_FAMILY_ACCOUNT',
        entityType: 'FamilyAccount',
        entityId: updatedFamily.id,
        detail: `Dismissed sibling pairing for ${updatedFamily.guardianName}.`,
      });

      saveDb();
      res.json({ familyAccount: updatedFamily, siblingGroup: group ?? null });
    },
  );

  app.post(
    '/api/finance/family-accounts/manual-merge',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const {
        studentIds = [],
        accountIds = [],
        targetFamilyId,
        primaryStudentId,
        primaryAccountId,
        guardianName,
        guardianPhone,
        parentEmail,
        address,
        manualNotes,
        partialCandidateId,
      } = (req.body || {}) as {
        studentIds?: string[];
        accountIds?: string[];
        targetFamilyId?: string;
        primaryStudentId?: string;
        primaryAccountId?: string;
        guardianName?: string;
        guardianPhone?: string;
        parentEmail?: string;
        address?: string;
        manualNotes?: string;
        partialCandidateId?: string;
      };

      const db = getDb();
      const schoolId = req.activeSchoolId!;

      // Ensure fee accounts exist for all students in this school first
      db.feeAccounts = ensureFeeLedgerAccountsForStudents({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        feeTransactions: db.feeTransactions || [],
      });

      const schoolStudents = (db.students || []).filter((s) => s.schoolId === schoolId);
      const schoolAccounts = (db.feeAccounts || []).filter((a) => a.schoolId === schoolId);
      const studentSet = new Set(studentIds);
      const accountSet = new Set(accountIds);

      if (targetFamilyId) {
        const existingTarget = (db.familyAccounts || []).find(
          (f) => f.schoolId === schoolId && (f.id === targetFamilyId || f.siblingGroupId === targetFamilyId),
        );
        if (!existingTarget) {
          res.status(404).json({ error: 'Target family account not found in active school.' });
          return;
        }
        for (const sid of existingTarget.memberStudentIds) studentSet.add(sid);
        for (const aid of existingTarget.memberAccountIds) accountSet.add(aid);
      }

      // Resolve bi-directional links between StudentRecord and FeeLedgerAccount
      for (const acc of schoolAccounts) {
        if (accountSet.has(acc.id) && acc.studentId) studentSet.add(acc.studentId);
        if (acc.studentId && studentSet.has(acc.studentId)) accountSet.add(acc.id);
      }

      const memberStudents = schoolStudents.filter((s) => studentSet.has(s.id));
      const memberAccounts = schoolAccounts.filter((a) => accountSet.has(a.id));

      const uniqueNodeKeys = new Set<string>();
      for (const s of memberStudents) uniqueNodeKeys.add(`stu:${s.id}`);
      for (const a of memberAccounts) {
        if (!a.studentId) uniqueNodeKeys.add(`acc:${a.id}`);
      }

      if (uniqueNodeKeys.size < 2) {
        res.status(400).json({
          error: 'Select at least 2 distinct sibling students or fee accounts to merge into a Family Account.',
        });
        return;
      }

      const nowDate = new Date().toISOString().slice(0, 10);
      const memberStuIds = memberStudents.map((s) => s.id);
      const memberAccIds = memberAccounts.map((a) => a.id);

      // Clean up any overlapping existing manual family references so the merged set replaces them
      db.familyAccounts = (db.familyAccounts || []).filter((f) => {
        if (f.schoolId !== schoolId) return true;
        if (targetFamilyId && (f.id === targetFamilyId || f.siblingGroupId === targetFamilyId)) return false;
        const overlaps =
          f.memberStudentIds.some((id) => studentSet.has(id)) ||
          f.memberAccountIds.some((id) => accountSet.has(id));
        return !overlaps;
      });

      const resolvedPrimaryAccId =
        (primaryAccountId && accountSet.has(primaryAccountId) ? primaryAccountId : undefined) ||
        (primaryStudentId
          ? memberAccounts.find((a) => a.studentId === primaryStudentId)?.id
          : undefined) ||
        memberAccounts[0]?.id;

      const resolvedPrimaryStuId =
        (primaryStudentId && studentSet.has(primaryStudentId) ? primaryStudentId : undefined) ||
        (resolvedPrimaryAccId
          ? memberAccounts.find((a) => a.id === resolvedPrimaryAccId)?.studentId
          : undefined) ||
        memberStudents[0]?.id;

      const leadAcc = memberAccounts.find((a) => a.id === resolvedPrimaryAccId) || memberAccounts[0];
      const leadStu = memberStudents.find((s) => s.id === resolvedPrimaryStuId) || memberStudents[0];
      const resolvedGuardianName =
        guardianName?.trim() ||
        leadStu?.guardianName ||
        leadAcc?.fatherName ||
        'Parent / Guardian';
      const resolvedPhone =
        guardianPhone?.trim() ||
        leadStu?.guardianPhone ||
        leadAcc?.contactNo ||
        '';
      const resolvedAddress =
        address?.trim() ||
        leadStu?.address ||
        leadAcc?.address ||
        '';
      const resolvedEmail = parentEmail?.trim() || leadStu?.guardianEmail;

      const syntheticId =
        targetFamilyId ||
        `family-manual-${schoolId.split('-')[1] || 'sch'}-${Date.now().toString(36)}`;
      const syntheticGroupId = `fam-manual-${schoolId.split('-')[1] || 'sch'}-${Date.now().toString(36)}`;

      const seedFamily: FamilyAccount = {
        id: syntheticId,
        schoolId,
        siblingGroupId: syntheticGroupId,
        familyCode: `FAM-${(schoolId.split('-')[1] || 'SCH').toUpperCase()}-${(leadAcc?.admissionNo || leadStu?.admissionNo || 'MAN').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
        guardianName: resolvedGuardianName,
        guardianPhone: resolvedPhone,
        normalizedPhone: resolvedPhone.replace(/\D/g, '').slice(-10),
        ...(resolvedEmail ? { parentEmail: resolvedEmail } : {}),
        ...(resolvedAddress ? { address: resolvedAddress } : {}),
        memberStudentIds: memberStuIds,
        memberAccountIds: memberAccIds,
        primaryStudentId: resolvedPrimaryStuId,
        primaryAccountId: resolvedPrimaryAccId,
        detectionSignals: ['Manual Admin Review & Merge'],
        status: 'Merged',
        isManualMerge: true,
        ...(manualNotes?.trim() ? { manualNotes: manualNotes.trim() } : {}),
        reviewedBy: req.user!.name,
        reviewedAt: nowDate,
        totalDemandInr: 0,
        totalPaidInr: 0,
        totalBalanceInr: 0,
        collectionRatePct: 0,
        monthlyPaidInr: emptyMonthlyPaidMap(),
        members: [],
        receiptIds: [],
        lastSyncedAt: new Date().toISOString(),
      };

      db.familyAccounts.push(seedFamily);
      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const mergedFamily =
        synced.familyAccounts.find(
          (f) =>
            f.schoolId === schoolId &&
            (f.memberStudentIds.some((id) => studentSet.has(id)) ||
              f.memberAccountIds.some((id) => accountSet.has(id))),
        ) ?? seedFamily;

      // Clear any matching dismissed partial match if admin subsequently merged it
      if (partialCandidateId && Array.isArray(db.dismissedPartialMatches)) {
        db.dismissedPartialMatches = db.dismissedPartialMatches.filter(
          (d) => !(d.schoolId === schoolId && d.id === partialCandidateId),
        );
      }

      const partialMatches = detectPartialContactMatches({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        familyAccounts: db.familyAccounts || [],
        dismissedPartialMatches: db.dismissedPartialMatches || [],
        users: db.users || [],
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'MANUAL_MERGED_FAMILY_ACCOUNT',
        entityType: 'FamilyAccount',
        entityId: mergedFamily.id,
        detail: `Manually reviewed and merged ${uniqueNodeKeys.size} sibling accounts under ${mergedFamily.guardianName} (${mergedFamily.familyCode}, combined balance INR ${mergedFamily.totalBalanceInr.toLocaleString('en-IN')}).`,
      });

      saveDb();
      res.status(201).json({
        familyAccount: mergedFamily,
        familyAccounts: synced.familyAccounts.filter((f) => f.schoolId === schoolId),
        siblingGroups: synced.siblingGroups.filter((g) => g.schoolId === schoolId),
        partialMatches,
      });
    },
  );

  app.patch(
    '/api/finance/family-accounts/:familyId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { familyId } = req.params;
      const {
        guardianName,
        guardianPhone,
        parentEmail,
        address,
        primaryAccountId,
        primaryStudentId,
        manualNotes,
        syncContactToMembers,
      } = (req.body || {}) as {
        guardianName?: string;
        guardianPhone?: string;
        parentEmail?: string;
        address?: string;
        primaryAccountId?: string;
        primaryStudentId?: string;
        manualNotes?: string;
        syncContactToMembers?: boolean;
      };

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const fam = (db.familyAccounts || []).find(
        (f) => f.schoolId === schoolId && (f.id === familyId || f.siblingGroupId === familyId),
      );
      if (!fam) {
        res.status(404).json({ error: 'Family Account not found in active school.' });
        return;
      }

      if (guardianName?.trim()) fam.guardianName = guardianName.trim();
      if (guardianPhone !== undefined) fam.guardianPhone = guardianPhone.trim();
      if (parentEmail !== undefined) fam.parentEmail = parentEmail.trim() || undefined;
      if (address !== undefined) fam.address = address.trim() || undefined;
      if (manualNotes !== undefined) fam.manualNotes = manualNotes.trim() || undefined;

      if (primaryAccountId && fam.memberAccountIds.includes(primaryAccountId)) {
        fam.primaryAccountId = primaryAccountId;
        const acc = (db.feeAccounts || []).find(
          (a) => a.schoolId === schoolId && a.id === primaryAccountId,
        );
        if (acc?.studentId) fam.primaryStudentId = acc.studentId;
      }
      if (primaryStudentId && fam.memberStudentIds.includes(primaryStudentId)) {
        fam.primaryStudentId = primaryStudentId;
        const acc = (db.feeAccounts || []).find(
          (a) => a.schoolId === schoolId && a.studentId === primaryStudentId,
        );
        if (acc) fam.primaryAccountId = acc.id;
      }

      fam.reviewedBy = req.user!.name;
      fam.reviewedAt = new Date().toISOString().slice(0, 10);

      if (syncContactToMembers) {
        const stuSet = new Set(fam.memberStudentIds);
        const accSet = new Set(fam.memberAccountIds);
        for (const st of db.students || []) {
          if (st.schoolId === schoolId && stuSet.has(st.id)) {
            if (guardianName?.trim()) st.guardianName = guardianName.trim();
            if (guardianPhone?.trim()) st.guardianPhone = guardianPhone.trim();
            if (parentEmail !== undefined) st.guardianEmail = parentEmail.trim() || undefined;
            if (address !== undefined) st.address = address.trim() || undefined;
          }
        }
        for (const acc of db.feeAccounts || []) {
          if (acc.schoolId === schoolId && accSet.has(acc.id)) {
            if (guardianName?.trim()) acc.fatherName = guardianName.trim();
            if (guardianPhone?.trim()) acc.contactNo = guardianPhone.trim();
            if (address !== undefined) acc.address = address.trim();
          }
        }
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const updatedFamily = synced.familyAccounts.find((f) => f.id === fam.id) ?? fam;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_FAMILY_ACCOUNT',
        entityType: 'FamilyAccount',
        entityId: updatedFamily.id,
        detail: `Updated Family Account ${updatedFamily.familyCode} contact details & primary billing selection.`,
      });

      saveDb();
      res.json({
        familyAccount: updatedFamily,
        familyAccounts: synced.familyAccounts.filter((f) => f.schoolId === schoolId),
      });
    },
  );

  app.post(
    '/api/finance/family-accounts/:familyId/unmerge',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const { familyId } = req.params;
      const { removeStudentId, removeAccountId } = (req.body || {}) as {
        removeStudentId?: string;
        removeAccountId?: string;
      };

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const fam = (db.familyAccounts || []).find(
        (f) => f.schoolId === schoolId && (f.id === familyId || f.siblingGroupId === familyId),
      );
      if (!fam) {
        res.status(404).json({ error: 'Family Account not found in active school.' });
        return;
      }

      if (removeStudentId || removeAccountId) {
        const remainingStuIds = fam.memberStudentIds.filter((id) => id !== removeStudentId);
        const remainingAccIds = fam.memberAccountIds.filter((id) => id !== removeAccountId);
        if (removeAccountId) {
          const acc = (db.feeAccounts || []).find(
            (a) => a.schoolId === schoolId && a.id === removeAccountId,
          );
          if (acc?.studentId) {
            const idx = remainingStuIds.indexOf(acc.studentId);
            if (idx >= 0) remainingStuIds.splice(idx, 1);
          }
        }
        if (removeStudentId) {
          const acc = (db.feeAccounts || []).find(
            (a) => a.schoolId === schoolId && a.studentId === removeStudentId,
          );
          if (acc) {
            const idx = remainingAccIds.indexOf(acc.id);
            if (idx >= 0) remainingAccIds.splice(idx, 1);
          }
        }

        const remainingUnique = Math.max(remainingStuIds.length, remainingAccIds.length);
        if (remainingUnique >= 2 && fam.isManualMerge) {
          fam.memberStudentIds = remainingStuIds;
          fam.memberAccountIds = remainingAccIds;
          if (fam.primaryStudentId === removeStudentId) {
            fam.primaryStudentId = remainingStuIds[0];
          }
          if (fam.primaryAccountId === removeAccountId) {
            fam.primaryAccountId = remainingAccIds[0];
          }
          const synced = syncSchoolFamilyAccounts(db, schoolId);
          appendAuditLog({
            schoolId,
            actor: req.user!,
            action: 'REMOVED_FAMILY_MEMBER',
            entityType: 'FamilyAccount',
            entityId: fam.id,
            detail: `Removed sibling from manual Family Account ${fam.familyCode}.`,
          });
          saveDb();
          res.json({
            familyAccounts: synced.familyAccounts.filter((f) => f.schoolId === schoolId),
            siblingGroups: synced.siblingGroups.filter((g) => g.schoolId === schoolId),
          });
          return;
        }
      }

      // Full unmerge: if manual merge, drop the manual link cleanly; if auto-detected, mark Dismissed
      if (fam.isManualMerge) {
        db.familyAccounts = (db.familyAccounts || []).filter((f) => f.id !== fam.id);
        db.siblingGroups = (db.siblingGroups || []).filter((g) => g.id !== fam.siblingGroupId);
      } else {
        fam.status = 'Dismissed';
        const grp = (db.siblingGroups || []).find(
          (g) => g.schoolId === schoolId && g.id === fam.siblingGroupId,
        );
        if (grp) {
          grp.status = 'Dismissed';
          grp.updatedBy = req.user!.name;
          grp.updatedAt = new Date().toISOString().slice(0, 10);
        }
      }

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const partialMatches = detectPartialContactMatches({
        schoolId,
        students: db.students || [],
        feeAccounts: db.feeAccounts || [],
        familyAccounts: db.familyAccounts || [],
        dismissedPartialMatches: db.dismissedPartialMatches || [],
        users: db.users || [],
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UNMERGED_FAMILY_ACCOUNT',
        entityType: 'FamilyAccount',
        entityId: fam.id,
        detail: `Unmerged Family Account ${fam.familyCode} (${fam.guardianName}) back to individual student accounts.`,
      });

      saveDb();
      res.json({
        familyAccounts: synced.familyAccounts.filter((f) => f.schoolId === schoolId),
        siblingGroups: synced.siblingGroups.filter((g) => g.schoolId === schoolId),
        partialMatches,
      });
    },
  );


  app.post(
    '/api/finance/collect',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const {
        accountId,
        familyGroupId,
        familyAccountId,
        paymentAmountInr,
        paymentMode,
        monthKey,
        scheduleCadence,
        paidTillMonth,
        paidDate: requestedPaidDate,
        nextExpectedFeeDate,
        nextExpectedFeeAmountInr,
        nextExpectedFeeMonth,
        remarks,
      } = (req.body || {}) as {
        accountId?: string;
        familyGroupId?: string;
        familyAccountId?: string;
        paymentAmountInr: number;
        paymentMode?: FeePaymentMode;
        monthKey?: FeeMonthKey;
        scheduleCadence?: FeeScheduleCadence;
        paidTillMonth?: FeeMonthKey;
        paidDate?: string;
        nextExpectedFeeDate?: string;
        nextExpectedFeeAmountInr?: number;
        nextExpectedFeeMonth?: FeeMonthKey;
        remarks?: string;
      };

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const allAccounts = (db.feeAccounts || []).filter((a) => a.schoolId === schoolId);

      let targetAccounts = [] as typeof allAccounts;
      let primaryId: string | undefined;
      let resolvedFamilyGroupId: string | undefined;
      let resolvedFamilyAccountId: string | undefined;
      let payerLabel = '';

      if (familyAccountId || familyGroupId) {
        const fam = familyAccountId
          ? (db.familyAccounts || []).find(
              (f) => f.id === familyAccountId && f.schoolId === schoolId,
            )
          : (db.familyAccounts || []).find(
              (f) => f.siblingGroupId === familyGroupId && f.schoolId === schoolId,
            );
        const group = (db.siblingGroups || []).find(
          (g) =>
            g.schoolId === schoolId &&
            (g.id === (familyGroupId || fam?.siblingGroupId)),
        );
        if (!group && !fam) {
          res.status(404).json({ error: 'Family group not found in active school.' });
          return;
        }
        const memberSet = new Set(fam?.memberAccountIds ?? group?.memberAccountIds ?? []);
        targetAccounts = allAccounts.filter((a) => memberSet.has(a.id));
        primaryId = fam?.primaryAccountId ?? group?.primaryAccountId;
        resolvedFamilyGroupId = group?.id ?? fam?.siblingGroupId;
        resolvedFamilyAccountId = fam?.id;
        const guardianName = fam?.guardianName ?? group?.guardianName ?? 'Family';
        payerLabel = `${guardianName} Family (${targetAccounts.length} siblings)`;
      } else if (accountId) {
        const acc = allAccounts.find((a) => a.id === accountId);
        if (!acc) {
          res.status(404).json({ error: 'Student fee account not found in active school.' });
          return;
        }
        targetAccounts = [acc];
        primaryId = acc.id;
        resolvedFamilyAccountId = acc.familyAccountId;
        payerLabel = `${acc.studentName} (${acc.className})`;
      } else {
        res.status(400).json({ error: 'Select a student ledger or merged family group to collect fees.' });
        return;
      }

      const check = allocateFamilyPayment(targetAccounts, paymentAmountInr, primaryId);
      if (!check.valid) {
        res.status(400).json({ error: check.error });
        return;
      }

      const primaryAcc = targetAccounts.find((a) => a.id === primaryId) || targetAccounts[0];
      const resolvedPlan = normalizePaymentPlan(scheduleCadence ?? primaryAcc?.scheduleCadence);
      const paidDate =
        requestedPaidDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedPaidDate.trim())
          ? requestedPaidDate.trim()
          : new Date().toISOString().slice(0, 10);
      const totalPaidNow = check.allocations.reduce((s, a) => s + a.allocatedInr, 0);

      // Compute deterministic auto-month coverage, lump-sum partial adjustment, and plan-aware schedule
      const combinedPlanAlloc = computeStudentFeeMonthAllocation({
        accounts: targetAccounts,
        paymentNowInr: totalPaidNow,
        scheduleCadence: resolvedPlan,
        paymentDateIso: paidDate,
      });

      const activeMonth: FeeMonthKey =
        monthKey && ACADEMIC_FEE_MONTHS.includes(monthKey)
          ? monthKey
          : combinedPlanAlloc.coveredMonths[combinedPlanAlloc.coveredMonths.length - 1] ??
            combinedPlanAlloc.partialAdjustment?.month ??
            db.financialTargets?.[schoolId]?.monthKey ??
            'November';
      const resolvedPaidTillMonth: FeeMonthKey =
        paidTillMonth && ACADEMIC_FEE_MONTHS.includes(paidTillMonth)
          ? paidTillMonth
          : combinedPlanAlloc.paidTillMonth;
      const resolvedNextMonth: FeeMonthKey | undefined =
        nextExpectedFeeMonth && ACADEMIC_FEE_MONTHS.includes(nextExpectedFeeMonth)
          ? nextExpectedFeeMonth
          : combinedPlanAlloc.nextExpectedInstallment?.months[0];
      const resolvedMode: FeePaymentMode =
        paymentMode === 'Cash' ||
        paymentMode === 'Bank Transfer' ||
        paymentMode === 'Cheque'
          ? paymentMode
          : 'UPI';
      const receiptNo = `RCP-${schoolId.split('-')[1]?.toUpperCase() || 'VIS'}-${String((db.feeReceipts?.length || 0) + 2701)}`;

      const previousPendingBalanceInr = targetAccounts.reduce(
        (sum, acc) => sum + Math.max(0, acc.balanceFeesInr),
        0,
      );

      for (const alloc of check.allocations) {
        const acc = allAccounts.find((a) => a.id === alloc.accountId);
        if (!acc) continue;
        const accPlanAlloc = computeStudentFeeMonthAllocation({
          accounts: [acc],
          paymentNowInr: alloc.allocatedInr,
          scheduleCadence: resolvedPlan,
          paymentDateIso: paidDate,
        });

        if (!acc.monthlyPaidInr) acc.monthlyPaidInr = emptyMonthlyPaidMap();
        let distributedIntoMonths = 0;
        for (const mItem of accPlanAlloc.months) {
          if (mItem.paidNowInr > 0) {
            acc.monthlyPaidInr[mItem.month] =
              (acc.monthlyPaidInr[mItem.month] || 0) + mItem.paidNowInr;
            distributedIntoMonths += mItem.paidNowInr;
          }
        }
        // If payment went strictly to LYB arrears, also credit the ledger's active month cashflow
        const lybPortion = Math.max(0, alloc.allocatedInr - distributedIntoMonths);
        if (lybPortion > 0) {
          acc.monthlyPaidInr[activeMonth] = (acc.monthlyPaidInr[activeMonth] || 0) + lybPortion;
        }

        acc.scheduleCadence = resolvedPlan;
        acc.paymentPlanConfirmed = true;
        acc.paidAmountInr += alloc.allocatedInr;
        acc.balanceFeesInr = Math.max(0, acc.balanceFeesInr - alloc.allocatedInr);
        acc.lastPaidDate = paidDate;
        acc.paidTillMonth =
          targetAccounts.length === 1 ? resolvedPaidTillMonth : accPlanAlloc.paidTillMonth;
        acc.partialAdjustedMonth = accPlanAlloc.postPaymentPartial?.month;
        acc.partialAdjustedAmountInr = accPlanAlloc.postPaymentPartial?.totalPaidInr;
        acc.partialRemainingInr = accPlanAlloc.postPaymentPartial?.remainingInr;

        if (acc.studentId) {
          const st = db.students.find((s) => s.id === acc.studentId && s.schoolId === schoolId);
          if (st) {
            st.feeBalanceInr = acc.balanceFeesInr;
          }
          const existingFeeTx = db.feeTransactions.find(
            (f) => f.schoolId === schoolId && f.studentId === acc.studentId,
          );
          if (existingFeeTx) {
            existingFeeTx.amountPaidInr += alloc.allocatedInr;
            existingFeeTx.receiptNo = receiptNo;
            existingFeeTx.paidDate = paidDate;
            existingFeeTx.status = acc.balanceFeesInr === 0 ? 'Paid' : 'Partial';
          }
        }
      }

      const totalPendingBalanceInr = targetAccounts.reduce(
        (sum, acc) => sum + Math.max(0, acc.balanceFeesInr),
        0,
      );

      const cleanNextDate =
        nextExpectedFeeDate && /^\d{4}-\d{2}-\d{2}$/.test(nextExpectedFeeDate.trim())
          ? nextExpectedFeeDate.trim()
          : totalPendingBalanceInr > 0
            ? combinedPlanAlloc.nextExpectedInstallment?.dueDate
            : undefined;
      const parsedNextAmount = Number(nextExpectedFeeAmountInr);
      const resolvedNextAmount =
        totalPendingBalanceInr <= 0
          ? undefined
          : Number.isFinite(parsedNextAmount) && parsedNextAmount > 0
            ? Math.round(parsedNextAmount)
            : combinedPlanAlloc.nextExpectedInstallment?.expectedAmountInr ??
              totalPendingBalanceInr;

      for (const acc of targetAccounts) {
        acc.scheduleCadence = resolvedPlan;
        acc.paymentPlanConfirmed = true;
        if (cleanNextDate && acc.balanceFeesInr > 0) {
          acc.nextExpectedFeeDate = cleanNextDate;
          acc.nextExpectedFeeAmountInr =
            targetAccounts.length === 1
              ? resolvedNextAmount
              : computeStudentFeeMonthAllocation({
                  accounts: [acc],
                  paymentNowInr: 0,
                  scheduleCadence: resolvedPlan,
                  paymentDateIso: paidDate,
                }).nextExpectedInstallment?.expectedAmountInr ?? acc.balanceFeesInr;
        } else if (acc.balanceFeesInr === 0) {
          acc.nextExpectedFeeDate = undefined;
          acc.nextExpectedFeeAmountInr = 0;
          acc.partialAdjustedMonth = undefined;
          acc.partialAdjustedAmountInr = undefined;
          acc.partialRemainingInr = undefined;
        }
      }

      const receiptId = `frcp-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

      let createdReminder: FeeReminderCalendarEvent | null = null;
      if (!Array.isArray(db.feeReminders)) db.feeReminders = [];
      const paidAccountIdSet = new Set(check.allocations.map((a) => a.accountId));
      // Mark prior open reminders for these accounts as Paid / superseded
      for (const existingRem of db.feeReminders) {
        if (
          existingRem.schoolId === schoolId &&
          existingRem.status !== 'Paid' &&
          existingRem.accountIds.some((id) => paidAccountIdSet.has(id))
        ) {
          existingRem.status = 'Paid';
        }
      }

      const installmentLabel =
        combinedPlanAlloc.nextExpectedInstallment?.label ??
        (resolvedNextMonth ? `${resolvedNextMonth} (${resolvedPlan})` : resolvedPlan);

      if (cleanNextDate && (totalPendingBalanceInr > 0 || (resolvedNextAmount && resolvedNextAmount > 0))) {
        createdReminder = {
          id: `frem-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          schoolId,
          receiptId,
          receiptNo,
          accountIds: targetAccounts.map((a) => a.id),
          studentIds: targetAccounts
            .map((a) => a.studentId)
            .filter((sid): sid is string => Boolean(sid)),
          familyGroupId: resolvedFamilyGroupId,
          payerLabel,
          className:
            targetAccounts.length === 1
              ? primaryAcc?.className
              : Array.from(new Set(targetAccounts.map((a) => a.className))).join(', '),
          contactNo: primaryAcc?.contactNo,
          dueDate: cleanNextDate,
          expectedAmountInr: resolvedNextAmount ?? totalPendingBalanceInr,
          pendingBalanceInr: totalPendingBalanceInr,
          paidTillMonth: resolvedPaidTillMonth,
          scheduleCadence: resolvedPlan,
          installmentLabel,
          status: 'Scheduled',
          createdBy: req.user!.name,
          createdAt: new Date().toISOString(),
          notes:
            remarks?.trim() ||
            `${resolvedPlan} plan · ${installmentLabel} reminder from Receipt ${receiptNo} (Paid till ${resolvedPaidTillMonth}${combinedPlanAlloc.postPaymentPartial ? ` + ₹${combinedPlanAlloc.postPaymentPartial.totalPaidInr.toLocaleString('en-IN')} partial in ${combinedPlanAlloc.postPaymentPartial.month}` : ''}).`,
        };
        db.feeReminders.unshift(createdReminder);

        if (!Array.isArray(db.accountingTasks)) db.accountingTasks = [];
        db.accountingTasks.unshift({
          id: `atask-rem-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
          schoolId,
          title: `Fee Due Reminder (${resolvedPlan}): ${payerLabel} — ₹${(resolvedNextAmount ?? totalPendingBalanceInr).toLocaleString('en-IN')} (${installmentLabel})`,
          category: 'Fee Follow-Up Reminder',
          dueDate: cleanNextDate,
          assignedBy: req.user!.name,
          assignedTo: 'Accounts Office',
          status: 'Open',
          notes: `Auto-scheduled from Receipt ${receiptNo}. Plan: ${resolvedPlan}. Paid till ${resolvedPaidTillMonth}. Pending balance ₹${totalPendingBalanceInr.toLocaleString('en-IN')}.`,
          updatedAt: new Date().toISOString(),
        });
      }

      // Sync first upcoming installment with accountant's confirmed nextExpectedFeeDate & amount
      const persistedUpcoming = combinedPlanAlloc.upcomingInstallments.map((inst, idx) =>
        idx === 0 && cleanNextDate
          ? {
              ...inst,
              dueDate: cleanNextDate,
              expectedAmountInr: resolvedNextAmount ?? inst.expectedAmountInr,
            }
          : inst,
      );

      const receipt: FeePaymentReceipt = {
        id: receiptId,
        receiptNo,
        schoolId,
        accountIds: check.allocations.map((a) => a.accountId),
        familyGroupId: resolvedFamilyGroupId,
        payerLabel,
        admissionNo:
          targetAccounts.length === 1
            ? primaryAcc?.admissionNo
            : targetAccounts.map((a) => a.admissionNo).join(', '),
        fatherName: primaryAcc?.fatherName,
        contactNo: primaryAcc?.contactNo,
        className:
          targetAccounts.length === 1
            ? primaryAcc?.className
            : Array.from(new Set(targetAccounts.map((a) => a.className))).join(', '),
        amountInr: totalPaidNow,
        paymentMode: resolvedMode,
        monthKey: activeMonth,
        scheduleCadence: resolvedPlan,
        paidTillMonth: resolvedPaidTillMonth,
        coveredMonths: combinedPlanAlloc.coveredMonths,
        partialAdjustedMonth: combinedPlanAlloc.postPaymentPartial?.month,
        partialAdjustedAmountInr: combinedPlanAlloc.partialAdjustment?.paidNowInr,
        partialMonthTotalPaidInr: combinedPlanAlloc.postPaymentPartial?.totalPaidInr,
        partialMonthRemainingInr: combinedPlanAlloc.postPaymentPartial?.remainingInr,
        lybAdjustedInr: combinedPlanAlloc.lybAdjustedNowInr > 0 ? combinedPlanAlloc.lybAdjustedNowInr : undefined,
        upcomingInstallments: persistedUpcoming,
        previousPendingBalanceInr,
        totalPendingBalanceInr,
        nextExpectedFeeAmountInr: resolvedNextAmount,
        nextExpectedFeeDate: cleanNextDate,
        nextExpectedFeeMonth: resolvedNextMonth,
        remarks: remarks?.trim() || undefined,
        reminderId: createdReminder?.id,
        paidDate,
        recordedBy: req.user!.name,
        allocations: check.allocations,
      };

      if (!Array.isArray(db.feeReceipts)) db.feeReceipts = [];
      db.feeReceipts.unshift(receipt);

      if (!Array.isArray(db.accountingEntries)) db.accountingEntries = [];
      db.accountingEntries.unshift({
        id: `acc-rcp-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
        schoolId,
        date: paidDate,
        monthKey: paidDate.slice(0, 7),
        category: 'Fee Collection',
        direction: 'Income',
        vendorOrParty: payerLabel,
        description: `Receipt ${receiptNo} (${resolvedPlan}) · Covered: ${combinedPlanAlloc.coveredMonths.join(', ') || resolvedPaidTillMonth}${combinedPlanAlloc.postPaymentPartial ? ` + ₹${combinedPlanAlloc.postPaymentPartial.totalPaidInr.toLocaleString('en-IN')} partial ${combinedPlanAlloc.postPaymentPartial.month}` : ''} · Balance ₹${totalPendingBalanceInr.toLocaleString('en-IN')}${cleanNextDate ? ` · Next due ${cleanNextDate}` : ''}`,
        amountInr: totalPaidNow,
        paymentMode: resolvedMode,
        status: 'approved',
        periodLocked: false,
        createdBy: req.user!.name,
        createdByRole: req.user!.role,
        createdAt: new Date().toISOString(),
        approvedBy: req.user!.name,
        approvedAt: new Date().toISOString(),
      });

      const synced = syncSchoolFamilyAccounts(db, schoolId);
      const updatedFamilyAccount = resolvedFamilyAccountId
        ? synced.familyAccounts.find((f) => f.id === resolvedFamilyAccountId) ?? null
        : resolvedFamilyGroupId
          ? synced.familyAccounts.find((f) => f.siblingGroupId === resolvedFamilyGroupId) ?? null
          : null;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: resolvedFamilyGroupId ? 'COLLECTED_FAMILY_FEE' : 'COLLECTED_STUDENT_FEE',
        entityType: 'FeePaymentReceipt',
        entityId: receipt.receiptNo,
        detail: `Collected INR ${totalPaidNow.toLocaleString('en-IN')} (${resolvedMode}, ${resolvedPlan} plan) for ${payerLabel}, covered [${combinedPlanAlloc.coveredMonths.join(', ') || resolvedPaidTillMonth}]${combinedPlanAlloc.postPaymentPartial ? `, partial ₹${combinedPlanAlloc.postPaymentPartial.totalPaidInr} in ${combinedPlanAlloc.postPaymentPartial.month}` : ''}, pending INR ${totalPendingBalanceInr.toLocaleString('en-IN')}${cleanNextDate ? `, next reminder ${cleanNextDate}` : ''}; receipt ${receiptNo}.`,
      });

      saveDb();
      res.status(201).json({
        receipt,
        reminder: createdReminder,
        familyAccount: updatedFamilyAccount,
        allocation: combinedPlanAlloc,
      });
    },
  );

  app.patch(
    '/api/finance/accounts/:id/schedule',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const { id } = req.params;
      const { scheduleCadence } = (req.body || {}) as {
        scheduleCadence?: FeeScheduleCadence;
      };
      if (
        !scheduleCadence ||
        !['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'].includes(scheduleCadence)
      ) {
        res.status(400).json({
          error: 'Choose a valid payment plan: Monthly, Quarterly, Half-Yearly, or Yearly.',
        });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const acc = (db.feeAccounts || []).find(
        (a) => a.id === id && a.schoolId === schoolId,
      );
      if (!acc) {
        res.status(404).json({ error: 'Student fee account not found in active school.' });
        return;
      }

      const plan = normalizePaymentPlan(scheduleCadence);
      acc.scheduleCadence = plan;
      acc.paymentPlanConfirmed = true;
      acc.expectedScheduleNote = `${plan} Plan`;

      const todayIso = new Date().toISOString().slice(0, 10);
      const alloc = computeStudentFeeMonthAllocation({
        accounts: [acc],
        paymentNowInr: 0,
        scheduleCadence: plan,
        paymentDateIso: todayIso,
      });

      acc.paidTillMonth = alloc.previousPaidTillMonth ?? acc.paidTillMonth;
      acc.partialAdjustedMonth = alloc.postPaymentPartial?.month;
      acc.partialAdjustedAmountInr = alloc.postPaymentPartial?.totalPaidInr;
      acc.partialRemainingInr = alloc.postPaymentPartial?.remainingInr;

      if (alloc.nextExpectedInstallment && acc.balanceFeesInr > 0) {
        acc.nextExpectedFeeDate = alloc.nextExpectedInstallment.dueDate;
        acc.nextExpectedFeeAmountInr = alloc.nextExpectedInstallment.expectedAmountInr;

        // Keep any open reminder for this single account in sync with the updated payment plan
        for (const rem of db.feeReminders || []) {
          if (
            rem.schoolId === schoolId &&
            rem.status !== 'Paid' &&
            rem.accountIds.length === 1 &&
            rem.accountIds[0] === acc.id
          ) {
            rem.scheduleCadence = plan;
            rem.installmentLabel = alloc.nextExpectedInstallment.label;
            rem.dueDate = alloc.nextExpectedInstallment.dueDate;
            rem.expectedAmountInr = alloc.nextExpectedInstallment.expectedAmountInr;
          }
        }
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_STUDENT_PAYMENT_PLAN',
        entityType: 'FeeLedgerAccount',
        entityId: acc.id,
        detail: `Updated ${acc.studentName} (${acc.className}) payment plan to ${plan}. Next expected: ${alloc.nextExpectedInstallment ? `INR ${alloc.nextExpectedInstallment.expectedAmountInr.toLocaleString('en-IN')} on ${alloc.nextExpectedInstallment.dueDate}` : 'Settled'}.`,
      });

      saveDb();
      res.json({ account: acc, allocation: alloc });
    },
  );

  app.patch(
    '/api/finance/reminders/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'accountant']),
    (req: AuthedRequest, res) => {
      const { id } = req.params;
      const { status, dueDate, expectedAmountInr, notes } = (req.body || {}) as {
        status?: 'Scheduled' | 'Reminded' | 'Paid';
        dueDate?: string;
        expectedAmountInr?: number;
        notes?: string;
      };
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const reminder = (db.feeReminders || []).find(
        (r) => r.id === id && r.schoolId === schoolId,
      );
      if (!reminder) {
        res.status(404).json({ error: 'Fee reminder not found in active school.' });
        return;
      }
      if (status && ['Scheduled', 'Reminded', 'Paid'].includes(status)) {
        reminder.status = status;
      }
      if (dueDate && /^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
        reminder.dueDate = dueDate.trim();
      }
      if (expectedAmountInr !== undefined && Number.isFinite(Number(expectedAmountInr)) && Number(expectedAmountInr) >= 0) {
        reminder.expectedAmountInr = Math.round(Number(expectedAmountInr));
      }
      if (typeof notes === 'string') {
        reminder.notes = notes.trim();
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_FEE_REMINDER',
        entityType: 'FeeReminderCalendarEvent',
        entityId: reminder.id,
        detail: `Updated fee reminder ${reminder.receiptNo} (${reminder.payerLabel}) -> ${reminder.status}, due ${reminder.dueDate}.`,
      });

      saveDb();
      res.json({ ok: true, reminder });
    },
  );

  // ---------------- PRINCIPAL SCHOOL FEE STRUCTURE (MANUAL UPDATE & IMPORT) ----------------
  app.put(
    '/api/finance/fee-structure',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: AuthedRequest, res) => {
      const {
        rows: rawRows,
        mode = 'replace',
        source = 'manual',
        syncStudentLedgers = false,
      } = (req.body || {}) as {
        rows?: FeeStructureInputRow[];
        mode?: 'replace' | 'merge';
        source?: 'manual' | 'import';
        syncStudentLedgers?: boolean;
      };

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        res.status(400).json({ error: 'Provide at least one class fee structure row to publish.' });
        return;
      }
      if (rawRows.length > 60) {
        res.status(400).json({ error: 'Maximum 60 class rows can be saved in a single fee structure.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const schoolSession = db.schools.find((s) => s.id === schoolId)?.session || '2026-27';
      const nowIso = new Date().toISOString();
      const actorName = req.user!.name;

      const normalizedIncoming = new Map<string, SchoolFeeStructureRow>();
      for (const item of rawRows) {
        if (!item || typeof item !== 'object') continue;
        const cleanClass = String(item.className || '').trim();
        if (!cleanClass) continue;
        const built = buildFeeStructureRow(item, schoolId, schoolSession, actorName, nowIso);
        normalizedIncoming.set(built.className.toLowerCase(), built);
      }

      if (normalizedIncoming.size === 0) {
        res.status(400).json({ error: 'No valid class rows found. Each row requires a Class name.' });
        return;
      }

      const existingSaved = (db.feeStructure || []).filter((r) => r.schoolId === schoolId);
      const baselineForMerge =
        existingSaved.length > 0
          ? existingSaved
          : deriveInitialFeeStructureFromAccounts(db.feeAccounts || [], schoolId, schoolSession);

      let finalSchoolRows: SchoolFeeStructureRow[];
      if (mode === 'merge') {
        const mergedMap = new Map<string, SchoolFeeStructureRow>();
        for (const r of baselineForMerge) {
          mergedMap.set(r.className.toLowerCase(), r);
        }
        for (const [key, r] of normalizedIncoming.entries()) {
          mergedMap.set(key, r);
        }
        finalSchoolRows = sortFeeStructureRows(Array.from(mergedMap.values()));
      } else {
        finalSchoolRows = sortFeeStructureRows(Array.from(normalizedIncoming.values()));
      }

      if (!Array.isArray(db.feeStructure)) db.feeStructure = [];
      db.feeStructure = [
        ...db.feeStructure.filter((r) => r.schoolId !== schoolId),
        ...finalSchoolRows,
      ];

      let syncedAccountsCount = 0;
      if (syncStudentLedgers) {
        const byClassKey = new Map<string, SchoolFeeStructureRow>();
        for (const row of finalSchoolRows) {
          byClassKey.set(normalizeFeeClassName(row.className).toLowerCase(), row);
        }
        const todayIso = nowIso.slice(0, 10);
        for (const acc of db.feeAccounts || []) {
          if (acc.schoolId !== schoolId) continue;
          const accClassKey = normalizeFeeClassName(acc.className || acc.rawClass).toLowerCase();
          const matchedRow = byClassKey.get(accClassKey);
          if (!matchedRow) continue;

          acc.perMonthInr = matchedRow.totalMonthlyInr;
          acc.yearlyDemandInr = matchedRow.totalAnnualRecurringInr;
          acc.balanceFeesInr = Math.max(
            0,
            (acc.lastYearBalanceInr || 0) +
              acc.yearlyDemandInr -
              (acc.settleAmountInr || 0) -
              (acc.paidAmountInr || 0),
          );
          if (!acc.paymentPlanConfirmed) {
            acc.scheduleCadence = matchedRow.defaultPaymentPlan;
            acc.expectedScheduleNote = `${matchedRow.defaultPaymentPlan} Plan`;
          }

          const alloc = computeStudentFeeMonthAllocation({
            accounts: [acc],
            paymentNowInr: 0,
            scheduleCadence: normalizePaymentPlan(acc.scheduleCadence),
            paymentDateIso: todayIso,
          });
          acc.paidTillMonth = alloc.previousPaidTillMonth ?? acc.paidTillMonth;
          acc.partialAdjustedMonth = alloc.postPaymentPartial?.month;
          acc.partialAdjustedAmountInr = alloc.postPaymentPartial?.totalPaidInr;
          acc.partialRemainingInr = alloc.postPaymentPartial?.remainingInr;
          if (alloc.nextExpectedInstallment && acc.balanceFeesInr > 0) {
            acc.nextExpectedFeeDate = alloc.nextExpectedInstallment.dueDate;
            acc.nextExpectedFeeAmountInr = alloc.nextExpectedInstallment.expectedAmountInr;
          } else if (acc.balanceFeesInr === 0) {
            acc.nextExpectedFeeDate = undefined;
            acc.nextExpectedFeeAmountInr = 0;
          }

          if (acc.studentId) {
            const st = db.students.find((s) => s.id === acc.studentId && s.schoolId === schoolId);
            if (st) {
              st.feeBalanceInr = acc.balanceFeesInr;
            }
          }
          syncedAccountsCount += 1;
        }
        syncSchoolFamilyAccounts(db, schoolId);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: source === 'import' ? 'IMPORTED_SCHOOL_FEE_STRUCTURE' : 'UPDATED_SCHOOL_FEE_STRUCTURE',
        entityType: 'SchoolFeeStructure',
        entityId: `${schoolId}-${schoolSession}`,
        detail: `${source === 'import' ? 'Imported' : 'Manually updated'} official fee structure (${finalSchoolRows.length} classes, mode: ${mode})${syncStudentLedgers ? ` and synced ${syncedAccountsCount} student ledger accounts` : ''}.`,
      });

      saveDb();
      res.json({
        feeStructure: finalSchoolRows,
        syncedAccountsCount,
      });
    },
  );

  registerIntelligenceRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerPsychometricRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerSsbAndComputerSkillRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerVcipRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerContinuationRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerClinicalRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerTransportRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerEventsAndPlansRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerMarksRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerInteractiveLearningRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerCampusAdminRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerDefaulterNotificationRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerControlRoomAndCalendarRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerLearningPortalRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerInventoryRoutes(app, { requireAuth, requireRoles, appendAuditLog });
  registerStudentOnboardingRoutes(app, {
    requireAuth,
    requireRoles,
    appendAuditLog,
    syncSchoolFamilyAccounts,
  });
  registerFlagshipProductsRoutes(app, {
    requireAuth,
    requireRoles,
    appendAuditLog,
    createSessionForUser: (user, res, req) => {
      const token = crypto.randomBytes(24).toString('hex');
      const now = Date.now();
      sessions.set(token, {
        token,
        userId: user.id,
        activeSchoolId: null,
        createdAt: now,
        lastSeenAt: now,
        expiresAt: now + SESSION_IDLE_TTL_MS,
      });
      setSessionCookie(res, token, req);
      return token;
    },
  });

  // Ensure unmatched API routes always return JSON instead of falling through to SPA HTML
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // ---------------- VITE MIDDLEWARE OR PRODUCTION STATIC ----------------
  const distDir = path.resolve(process.cwd(), 'dist');
  const hasDistBuild = fs.existsSync(path.join(distDir, 'index.html'));
  const isDevMode = process.env.NODE_ENV === 'development';
  const useViteMiddleware = isDevMode || !hasDistBuild;
  if (useViteMiddleware) {
    // Start Vite middleware asynchronously so port 3000 binds immediately for health checks.
    const vitePromise = import('vite')
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: {
            middlewareMode: true,
            hmr: isDevMode,
            watch: isDevMode ? undefined : null,
          },
          appType: 'spa',
        }),
      )
      .catch((err) => {
        console.error('Failed to initialize Vite middleware:', err);
        throw err;
      });

    app.use((req, res, next) => {
      vitePromise
        .then((vite) => vite.middlewares(req, res, next))
        .catch(next);
    });
  } else {
    app.use(
      express.static(distDir, {
        etag: true,
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
          }
        },
      }),
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  // Global JSON error handler so API requests never emit Express HTML error pages
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
        ? (err as { status: number }).status
        : 500;
    const message = err instanceof Error ? err.message : 'Unexpected server error.';
    if (req.path.startsWith('/api') || req.headers.accept?.includes('application/json')) {
      res.status(status).json({ error: message });
      return;
    }
    res.status(status).send(message);
  });

  const portArgIdx = process.argv.indexOf('--port');
  const cliPort =
    portArgIdx >= 0 && process.argv[portArgIdx + 1]
      ? Number(process.argv[portArgIdx + 1])
      : NaN;
  const rawEnvPort = process.env.PORT?.trim();
  const listenTarget: number | string =
    Number.isFinite(cliPort) && cliPort > 0
      ? cliPort
      : rawEnvPort
        ? /^\d+$/.test(rawEnvPort)
          ? Number(rawEnvPort)
          : rawEnvPort
        : 3000;

  const onServerListening = () => {
    const boundLabel =
      typeof listenTarget === 'string' ? listenTarget : `http://0.0.0.0:${listenTarget}`;
    console.log(`Rai Plus server listening on ${boundLabel}`);
    // Warm persisted database right after port binding so startup probes succeed immediately.
    setImmediate(() => {
      try {
        getDb();
        void hydrateDbFromSupabase().catch((err) => {
          console.warn('Supabase hydration warning:', err instanceof Error ? err.message : err);
        });
      } catch (err) {
        console.error('Background DB warmup failed:', err);
      }
    });
  };

  const server =
    typeof listenTarget === 'string'
      ? app.listen(listenTarget, onServerListening)
      : app.listen(listenTarget, '0.0.0.0', onServerListening);

  const handleShutdown = (signal: string) => {
    console.log(`Received ${signal}; flushing pending database writes and closing server...`);
    try {
      flushDbSync();
    } catch (err) {
      console.error('Shutdown DB flush error:', err);
    }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref?.();
  };
  process.once('SIGTERM', () => handleShutdown('SIGTERM'));
  process.once('SIGINT', () => handleShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
