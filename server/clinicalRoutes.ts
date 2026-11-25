import crypto from 'node:crypto';
import type { Express, RequestHandler } from 'express';
import type { UserRole } from '../src/types';
import type {
  ArticulationStageNumber,
  AudioPracticeRecord,
  ClinicalAccessLogEntry,
  ClinicalConsentRecord,
  ClinicalDomain,
  ClinicalReportRecord,
  ClinicalReportType,
  ConditionAssessmentRecord,
  ConditionPathwayType,
  DailyTherapySessionLog,
  DevelopmentalHistoryRecord,
  DevelopmentalScreeningCase,
  FluencyApproachType,
  FluencyProfileRecord,
  ParentHomePracticeLog,
  ParentQuestionnaireRecord,
  PersonalizedTherapyPlan,
  ScreeningWorkflowStatus,
  SpeechExerciseItem,
  SpeechSoundPosition,
  SpeechSoundTarget,
  TeacherObservationRecord,
} from '../src/types/clinical';
import { getDb, saveDb } from './store.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import {
  canApproveMultidisciplinaryPlan,
  canEnterClinicalDiagnosis,
  CLINICAL_SPECIALIST_ROLES,
  detectMedicalRedFlags,
  generateArticulationExerciseDraft,
  getEvidenceInformedFluencyActivities,
  MANAGEMENT_ROLES,
  synthesizeScreeningIndicators,
} from '../src/utils/clinicalCareEngine.ts';

export interface ClinicalRouteDeps {
  requireAuth: RequestHandler;
  requireRoles: (roles: UserRole[]) => RequestHandler;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: NonNullable<IntelligenceAuthedRequest['user']>;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const VALID_WORKFLOW_STATUSES: ScreeningWorkflowStatus[] = [
  'No immediate concern identified',
  'Monitor development',
  'Further screening recommended',
  'Professional assessment recommended',
  'Urgent clinical referral recommended',
];

const VALID_PATHWAYS: ConditionPathwayType[] = [
  'autism_spectrum',
  'adhd',
  'speech_language',
  'down_syndrome_referral',
  'other_developmental',
];

const VALID_REPORT_TYPES: ClinicalReportType[] = [
  'developmental_screening',
  'speech_assessment',
  'therapy_progress',
  'professional_clinical',
];

function cleanStr(val: unknown, maxLen = 2000): string {
  return typeof val === 'string' ? val.trim().slice(0, maxLen) : '';
}

function appendClinicalAccess(params: {
  schoolId: string;
  actor: NonNullable<IntelligenceAuthedRequest['user']>;
  action: ClinicalAccessLogEntry['action'];
  entityType: string;
  entityId: string;
  studentId: string;
  detail: string;
}) {
  const db = getDb();
  if (!Array.isArray(db.clinicalAccessLogs)) db.clinicalAccessLogs = [];
  db.clinicalAccessLogs.unshift({
    id: `cal-${crypto.randomUUID().slice(0, 10)}`,
    schoolId: params.schoolId,
    timestamp: new Date().toISOString(),
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    studentId: params.studentId,
    detail: params.detail,
  });
}

function canAccessStudentInSchool(
  user: NonNullable<IntelligenceAuthedRequest['user']>,
  studentId: string,
  schoolId: string,
): boolean {
  const db = getDb();
  const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
  if (!student) return false;
  if (user.role === 'parent' || user.role === 'student') {
    return (user.linkedStudentIds || []).includes(studentId);
  }
  return true;
}

export function registerClinicalRoutes(app: Express, deps: ClinicalRouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;
  const specialistAndMgmtRoles: UserRole[] = [...CLINICAL_SPECIALIST_ROLES, ...MANAGEMENT_ROLES];

  // ---------------- PART 12: CONSENT & ASSENT ----------------
  app.post(
    '/api/clinical/consent',
    requireAuth,
    requireRoles([...specialistAndMgmtRoles, 'parent']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);

      if (!studentId || !canAccessStudentInSchool(user, studentId, schoolId)) {
        res.status(403).json({ error: 'Student not found or outside authorised scope.' });
        return;
      }

      if (!Array.isArray(db.clinicalConsents)) db.clinicalConsents = [];
      const existing = db.clinicalConsents.find(
        (c) => c.schoolId === schoolId && c.studentId === studentId,
      );

      const record: ClinicalConsentRecord = {
        id: existing?.id || `cc-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        guardianName: cleanStr(req.body?.guardianName, 120) || user.name,
        guardianRelation: cleanStr(req.body?.guardianRelation, 60) || 'Parent / Guardian',
        screeningConsent: Boolean(req.body?.screeningConsent),
        assessmentConsent: Boolean(req.body?.assessmentConsent),
        therapyConsent: Boolean(req.body?.therapyConsent),
        audioRecordingConsent: Boolean(req.body?.audioRecordingConsent),
        reportSharingWithTeachers: Boolean(req.body?.reportSharingWithTeachers),
        childAssentRecorded: Boolean(req.body?.childAssentRecorded),
        childAssentMethod: cleanStr(req.body?.childAssentMethod, 200) || undefined,
        retentionPolicyMonths: Math.min(
          120,
          Math.max(12, Number(req.body?.retentionPolicyMonths) || 36),
        ),
        consentDate: new Date().toISOString().slice(0, 10),
        updatedBy: user.name,
        notes: cleanStr(req.body?.notes, 500) || undefined,
      };

      if (existing) {
        Object.assign(existing, record);
      } else {
        db.clinicalConsents.unshift(record);
      }

      appendClinicalAccess({
        schoolId,
        actor: user,
        action: 'updated_consent',
        entityType: 'clinical_consent',
        entityId: record.id,
        studentId,
        detail: `Consent updated (screening=${record.screeningConsent}, therapy=${record.therapyConsent}, audio=${record.audioRecordingConsent}, assent=${record.childAssentRecorded}).`,
      });
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'CLINICAL_CONSENT_UPDATED',
        entityType: 'clinical_consent',
        entityId: record.id,
        detail: `Updated clinical consent & child assent for student ${studentId}.`,
      });
      saveDb();
      res.status(200).json({ consent: record });
    },
  );

  // ---------------- PART 1A: DEVELOPMENTAL HISTORY ----------------
  app.post(
    '/api/clinical/developmental-history',
    requireAuth,
    requireRoles([...CLINICAL_SPECIALIST_ROLES, 'parent']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);

      if (!studentId || !canAccessStudentInSchool(user, studentId, schoolId)) {
        res.status(403).json({ error: 'Student not found or outside authorised scope.' });
        return;
      }

      const rawMilestones = Array.isArray(req.body?.milestones) ? req.body.milestones : [];
      const milestones = rawMilestones.slice(0, 20).map((m: Record<string, unknown>, idx: number) => ({
        key: cleanStr(m?.key, 40) || `ms-${idx + 1}`,
        label: cleanStr(m?.label, 120) || 'Developmental Milestone',
        ageAchievedMonths:
          m?.ageAchievedMonths === null || m?.ageAchievedMonths === undefined || m?.ageAchievedMonths === ''
            ? null
            : Math.max(0, Math.min(216, Number(m.ageAchievedMonths))),
        status: (['Achieved', 'Emerging', 'Not yet achieved', 'Unknown / Not recalled'].includes(
          String(m?.status),
        )
          ? String(m.status)
          : 'Unknown / Not recalled') as DevelopmentalHistoryRecord['milestones'][number]['status'],
        notes: cleanStr(m?.notes, 250) || undefined,
      }));

      const languagesRaw = Array.isArray(req.body?.languagesSpokenByChild)
        ? req.body.languagesSpokenByChild
        : String(req.body?.languagesSpokenByChild || 'Hindi, English').split(',');

      const record: DevelopmentalHistoryRecord = {
        id: `dh-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        submittedByName: user.name,
        submittedByRole: user.role,
        submittedAt: new Date().toISOString().slice(0, 10),
        pregnancyAndBirthHistory: cleanStr(req.body?.pregnancyAndBirthHistory, 1000) || 'Not specified',
        birthComplications: cleanStr(req.body?.birthComplications, 600) || 'None reported',
        milestones,
        hearingHistory: cleanStr(req.body?.hearingHistory, 600) || 'Not reported',
        medicalHistory: cleanStr(req.body?.medicalHistory, 800) || 'Not reported',
        familyDevelopmentalHistory: cleanStr(req.body?.familyDevelopmentalHistory, 600) || 'Not reported',
        previousAssessments: cleanStr(req.body?.previousAssessments, 600) || 'None reported',
        previousTherapies: cleanStr(req.body?.previousTherapies, 600) || 'None reported',
        regressionOrSkillLoss: Boolean(req.body?.regressionOrSkillLoss),
        regressionDetails: cleanStr(req.body?.regressionDetails, 600) || undefined,
        seizuresOrMedicalRedFlags: Boolean(req.body?.seizuresOrMedicalRedFlags),
        medicalRedFlagDetails: cleanStr(req.body?.medicalRedFlagDetails, 600) || undefined,
        homeLanguage: cleanStr(req.body?.homeLanguage, 100) || 'Hindi',
        languagesSpokenByChild: languagesRaw
          .map((l: unknown) => cleanStr(l, 50))
          .filter(Boolean)
          .slice(0, 8),
        socialInteractionSummary: cleanStr(req.body?.socialInteractionSummary, 800),
        playBehaviourSummary: cleanStr(req.body?.playBehaviourSummary, 800),
        dailyLivingSkillsSummary: cleanStr(req.body?.dailyLivingSkillsSummary, 800),
      };

      if (!Array.isArray(db.developmentalHistories)) db.developmentalHistories = [];
      db.developmentalHistories.unshift(record);

      // Clinical Safety Red-Flag Automation (Part 12): Flag timely medical assessment immediately if regression/seizures reported
      const redFlags = detectMedicalRedFlags(record);
      if (redFlags.urgentMedicalFlag) {
        if (!Array.isArray(db.screeningCases)) db.screeningCases = [];
        const existingCase = db.screeningCases.find(
          (c) => c.schoolId === schoolId && c.studentId === studentId,
        );
        if (existingCase) {
          existingCase.urgentMedicalFlag = true;
          existingCase.urgentMedicalReason = redFlags.reasons.join(' ');
          existingCase.workflowStatus = 'Urgent clinical referral recommended';
          existingCase.recommendedSpecialistReferral =
            'Timely medical assessment by Developmental Paediatrician / Paediatric Neurologist recommended.';
          existingCase.updatedAt = new Date().toISOString().slice(0, 10);
        }
        appendClinicalAccess({
          schoolId,
          actor: user,
          action: 'flagged_medical_review',
          entityType: 'developmental_history',
          entityId: record.id,
          studentId,
          detail: `Medical safety flag raised for timely evaluation: ${redFlags.reasons.join(' ')}`,
        });
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'CLINICAL_HISTORY_RECORDED',
        entityType: 'developmental_history',
        entityId: record.id,
        detail: `Recorded developmental history for student ${studentId}.`,
      });
      saveDb();
      res.status(201).json({ history: record, redFlags });
    },
  );

  // ---------------- PART 1B: PARENT QUESTIONNAIRE ----------------
  app.post(
    '/api/clinical/parent-questionnaire',
    requireAuth,
    requireRoles([...CLINICAL_SPECIALIST_ROLES, 'parent']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);

      if (!studentId || !canAccessStudentInSchool(user, studentId, schoolId)) {
        res.status(403).json({ error: 'Student not found or outside authorised scope.' });
        return;
      }

      const validOpts = ['Yes', 'No', 'Sometimes', 'Not sure', 'Not observed'];
      const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
      if (rawItems.length === 0) {
        res.status(400).json({ error: 'Please answer at least one questionnaire item.' });
        return;
      }

      const items = rawItems.slice(0, 25).map((item: Record<string, unknown>, i: number) => ({
        id: cleanStr(item?.id, 40) || `q-${i + 1}`,
        domain: (cleanStr(item?.domain, 60) || 'Communication') as ParentQuestionnaireRecord['items'][number]['domain'],
        question: cleanStr(item?.question, 300),
        response: (validOpts.includes(String(item?.response))
          ? String(item.response)
          : 'Not sure') as ParentQuestionnaireRecord['items'][number]['response'],
        explanation: cleanStr(item?.explanation, 400) || undefined,
      }));

      const ageBand = (['3-5 yrs', '6-9 yrs', '10-13 yrs', '14-18 yrs'].includes(String(req.body?.ageBand))
        ? String(req.body.ageBand)
        : '6-9 yrs') as ParentQuestionnaireRecord['ageBand'];

      const record: ParentQuestionnaireRecord = {
        id: `pq-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        ageBand,
        completedBy: user.name,
        completedAt: new Date().toISOString().slice(0, 10),
        homeLanguageContext: cleanStr(req.body?.homeLanguageContext, 200) || 'Hindi / English',
        items,
        parentTopStrengths: cleanStr(req.body?.parentTopStrengths, 600),
        parentPrimaryQuestions: cleanStr(req.body?.parentPrimaryQuestions, 600),
      };

      if (!Array.isArray(db.parentQuestionnaires)) db.parentQuestionnaires = [];
      db.parentQuestionnaires.unshift(record);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'PARENT_QUESTIONNAIRE_SUBMITTED',
        entityType: 'parent_questionnaire',
        entityId: record.id,
        detail: `Parent questionnaire submitted for student ${studentId} (${items.length} items).`,
      });
      saveDb();
      res.status(201).json({ questionnaire: record });
    },
  );

  // ---------------- PART 1C: TEACHER OBSERVATION FORM ----------------
  app.post(
    '/api/clinical/teacher-observation',
    requireAuth,
    requireRoles(['teacher', 'special_educator', ...MANAGEMENT_ROLES, ...CLINICAL_SPECIALIST_ROLES]),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const validIntelligibility = [
        'Clear to all',
        'Mostly clear',
        'Clear to familiar listeners',
        'Difficult to understand in class',
      ];
      const record: TeacherObservationRecord = {
        id: `to-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        teacherId: user.id,
        teacherName: user.name,
        classSection: student.classSection,
        observedDate: new Date().toISOString().slice(0, 10),
        classroomCommunication: cleanStr(req.body?.classroomCommunication, 500),
        followingInstructions: cleanStr(req.body?.followingInstructions, 500),
        attentionDuringLessons: cleanStr(req.body?.attentionDuringLessons, 500),
        peerInteraction: cleanStr(req.body?.peerInteraction, 500),
        participation: cleanStr(req.body?.participation, 500),
        turnTaking: cleanStr(req.body?.turnTaking, 500),
        behaviouralObservations: cleanStr(req.body?.behaviouralObservations, 500),
        speechIntelligibility: (validIntelligibility.includes(String(req.body?.speechIntelligibility))
          ? String(req.body.speechIntelligibility)
          : 'Mostly clear') as TeacherObservationRecord['speechIntelligibility'],
        readingWritingConcerns: cleanStr(req.body?.readingWritingConcerns, 500),
        learningProgress: cleanStr(req.body?.learningProgress, 500),
        classroomIndependence: cleanStr(req.body?.classroomIndependence, 500),
        socialParticipation: cleanStr(req.body?.socialParticipation, 500),
        observableStrengths: cleanStr(req.body?.observableStrengths, 500),
      };

      if (!Array.isArray(db.teacherObservations)) db.teacherObservations = [];
      db.teacherObservations.unshift(record);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'TEACHER_OBSERVATION_RECORDED',
        entityType: 'teacher_observation',
        entityId: record.id,
        detail: `Recorded classroom observable behaviour note for ${student.name}.`,
      });
      saveDb();
      res.status(201).json({ observation: record });
    },
  );

  // ---------------- PART 1D: INITIATE / UPDATE SCREENING CASE ----------------
  app.post(
    '/api/clinical/screenings',
    requireAuth,
    requireRoles(specialistAndMgmtRoles),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const domains = (Array.isArray(req.body?.domains) ? req.body.domains : ['speech_language_delays'])
        .map((d: unknown) => cleanStr(d, 60))
        .filter(Boolean) as ClinicalDomain[];

      const latestHistory = (db.developmentalHistories || []).find(
        (h) => h.schoolId === schoolId && h.studentId === studentId,
      );
      const latestParentQ = (db.parentQuestionnaires || []).find(
        (p) => p.schoolId === schoolId && p.studentId === studentId,
      );
      const latestTeacherObs = (db.teacherObservations || []).find(
        (t) => t.schoolId === schoolId && t.studentId === studentId,
      );

      const synthesis = synthesizeScreeningIndicators({
        history: latestHistory,
        parentQ: latestParentQ,
        teacherObs: latestTeacherObs,
        domains,
      });

      const requestedStatus = cleanStr(req.body?.workflowStatus, 80) as ScreeningWorkflowStatus;
      const workflowStatus = VALID_WORKFLOW_STATUSES.includes(requestedStatus)
        ? requestedStatus
        : synthesis.suggestedWorkflowStatus;

      const screening: DevelopmentalScreeningCase = {
        id: `sc-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        classSection: student.classSection,
        initiatedBy: user.name,
        initiatedByRole: user.role,
        initiatedAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        domains,
        workflowStatus,
        completionStatus: (['Intake Open', 'Questionnaires Pending', 'Under Specialist Review', 'Completed'].includes(
          String(req.body?.completionStatus),
        )
          ? String(req.body.completionStatus)
          : 'Under Specialist Review') as DevelopmentalScreeningCase['completionStatus'],
        areasOfStrength: Array.isArray(req.body?.areasOfStrength) && req.body.areasOfStrength.length > 0
          ? req.body.areasOfStrength.map((s: unknown) => cleanStr(s, 300)).filter(Boolean)
          : synthesis.areasOfStrength,
        areasRequiringFurtherAssessment:
          Array.isArray(req.body?.areasRequiringFurtherAssessment) && req.body.areasRequiringFurtherAssessment.length > 0
            ? req.body.areasRequiringFurtherAssessment.map((s: unknown) => cleanStr(s, 300)).filter(Boolean)
            : synthesis.areasRequiringFurtherAssessment,
        recommendedSpecialistReferral:
          cleanStr(req.body?.recommendedSpecialistReferral, 400) || synthesis.recommendedSpecialistReferral,
        referralSpecialistType: cleanStr(req.body?.referralSpecialistType, 80) as DevelopmentalScreeningCase['referralSpecialistType'],
        urgentMedicalFlag: Boolean(req.body?.urgentMedicalFlag) || synthesis.urgentMedicalFlag,
        urgentMedicalReason:
          cleanStr(req.body?.urgentMedicalReason, 500) || synthesis.urgentMedicalReason || undefined,
        multilingualContextNote: cleanStr(req.body?.multilingualContextNote, 400) || undefined,
        confidentialNotes: CLINICAL_SPECIALIST_ROLES.includes(user.role)
          ? cleanStr(req.body?.confidentialNotes, 1000) || undefined
          : undefined,
        authorizedClassroomSummary: cleanStr(req.body?.authorizedClassroomSummary, 600) || undefined,
      };

      if (!Array.isArray(db.screeningCases)) db.screeningCases = [];
      db.screeningCases.unshift(screening);
      appendClinicalAccess({
        schoolId,
        actor: user,
        action: screening.urgentMedicalFlag ? 'flagged_medical_review' : 'logged_clinical_record',
        entityType: 'developmental_screening',
        entityId: screening.id,
        studentId,
        detail: `Initiated non-diagnostic screening workflow (${workflowStatus}) across ${domains.length} domain(s).`,
      });
      saveDb();
      res.status(201).json({ screening });
    },
  );

  // ---------------- PART 2: CONDITION-SPECIFIC PROFESSIONAL ASSESSMENTS ----------------
  app.post(
    '/api/clinical/assessments',
    requireAuth,
    requireRoles(CLINICAL_SPECIALIST_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const pathway = cleanStr(req.body?.pathway, 50) as ConditionPathwayType;

      if (!VALID_PATHWAYS.includes(pathway)) {
        res.status(400).json({ error: 'Invalid condition assessment pathway.' });
        return;
      }

      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      // Hard ethical guard for Down Syndrome referral pathway (Part 2D / Part 12)
      if (pathway === 'down_syndrome_referral' && req.body?.photoDataUrl) {
        res.status(400).json({
          error:
            'Clinical ethics guard: Photographs or facial image analysis are prohibited in the Down syndrome medical referral workflow.',
        });
        return;
      }

      const rawFindings =
        req.body?.structuredFindings && typeof req.body.structuredFindings === 'object'
          ? (req.body.structuredFindings as Record<string, unknown>)
          : {};
      const structuredFindings: Record<string, string> = {};
      for (const [k, v] of Object.entries(rawFindings).slice(0, 20)) {
        const cleanK = cleanStr(k, 80);
        const cleanV = cleanStr(v, 800);
        if (cleanK && cleanV) structuredFindings[cleanK] = cleanV;
      }

      const record: ConditionAssessmentRecord = {
        id: `ca-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        classSection: student.classSection,
        pathway,
        subCategory: cleanStr(req.body?.subCategory, 120) || undefined,
        assessorId: user.id,
        assessorName: user.name,
        assessorRole: user.role,
        assessorCredentials: [user.designation, user.professionalRegistrationNo]
          .filter(Boolean)
          .join(' · '),
        assessmentDate: new Date().toISOString().slice(0, 10),
        status: (['In Progress', 'Awaiting Cross-Setting Input', 'Completed', 'Referred to External Specialist'].includes(
          String(req.body?.status),
        )
          ? String(req.body.status)
          : 'In Progress') as ConditionAssessmentRecord['status'],
        licensedInstrumentsUsed: (Array.isArray(req.body?.licensedInstrumentsUsed)
          ? req.body.licensedInstrumentsUsed
          : String(req.body?.licensedInstrumentsUsed || '').split(',')
        )
          .map((s: unknown) => cleanStr(s, 140))
          .filter(Boolean)
          .slice(0, 10),
        structuredFindings,
        crossSettingNotes: req.body?.crossSettingNotes
          ? {
              homeFunctioning: cleanStr(req.body.crossSettingNotes.homeFunctioning, 600) || undefined,
              classroomFunctioning: cleanStr(req.body.crossSettingNotes.classroomFunctioning, 600) || undefined,
              peerRelationships: cleanStr(req.body.crossSettingNotes.peerRelationships, 600) || undefined,
              sleepAndContributingFactors:
                cleanStr(req.body.crossSettingNotes.sleepAndContributingFactors, 600) || undefined,
              durationAndOnset: cleanStr(req.body.crossSettingNotes.durationAndOnset, 400) || undefined,
              alternativeExplanationsReviewed:
                cleanStr(req.body.crossSettingNotes.alternativeExplanationsReviewed, 600) || undefined,
            }
          : undefined,
        multilingualProfile: req.body?.multilingualProfile
          ? {
              primaryHomeLanguage: cleanStr(req.body.multilingualProfile.primaryHomeLanguage, 100) || 'Hindi',
              languagesAssessed: (Array.isArray(req.body.multilingualProfile.languagesAssessed)
                ? req.body.multilingualProfile.languagesAssessed
                : String(req.body.multilingualProfile.languagesAssessed || 'Hindi, English').split(',')
              )
                .map((l: unknown) => cleanStr(l, 50))
                .filter(Boolean),
              accentOrSecondLanguageNote: cleanStr(
                req.body.multilingualProfile.accentOrSecondLanguageNote,
                500,
              ),
            }
          : undefined,
        medicalReferralData:
          pathway === 'down_syndrome_referral' && req.body?.medicalReferralData
            ? {
                existingMedicalDiagnosisDocumented: Boolean(
                  req.body.medicalReferralData.existingMedicalDiagnosisDocumented,
                ),
                existingMedicalDiagnosisDetails:
                  cleanStr(req.body.medicalReferralData.existingMedicalDiagnosisDetails, 500) || undefined,
                hearingAssessmentStatus:
                  cleanStr(req.body.medicalReferralData.hearingAssessmentStatus, 300) || undefined,
                visionAssessmentStatus:
                  cleanStr(req.body.medicalReferralData.visionAssessmentStatus, 300) || undefined,
                cardiacAssessmentStatus:
                  cleanStr(req.body.medicalReferralData.cardiacAssessmentStatus, 300) || undefined,
                geneticTestingStatus:
                  cleanStr(req.body.medicalReferralData.geneticTestingStatus, 300) || undefined,
                existingTherapyRecords:
                  cleanStr(req.body.medicalReferralData.existingTherapyRecords, 500) || undefined,
                specialistReportsSummary:
                  cleanStr(req.body.medicalReferralData.specialistReportsSummary, 600) || undefined,
              }
            : undefined,
        professionalObservation: cleanStr(req.body?.professionalObservation, 1200),
        functionalImpactSummary: cleanStr(req.body?.functionalImpactSummary, 800),
        referralRecommendation: cleanStr(req.body?.referralRecommendation, 800),
        confidentialClinicalNotes: cleanStr(req.body?.confidentialClinicalNotes, 1200) || undefined,
        authorizedClassroomGuidance: cleanStr(req.body?.authorizedClassroomGuidance, 800) || undefined,
      };

      if (!Array.isArray(db.conditionAssessments)) db.conditionAssessments = [];
      db.conditionAssessments.unshift(record);
      appendClinicalAccess({
        schoolId,
        actor: user,
        action: 'logged_clinical_record',
        entityType: 'condition_assessment',
        entityId: record.id,
        studentId,
        detail: `Recorded ${pathway} professional assessment workflow by ${user.name}.`,
      });
      saveDb();
      res.status(201).json({ assessment: record });
    },
  );

  // ---------------- PART 3: SPEECH SOUND TARGETS & ARTICULATION EXERCISES ----------------
  app.post(
    '/api/clinical/speech-targets',
    requireAuth,
    requireRoles(['slp', 'audiologist', 'clinical_psychologist']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const targetSound = cleanStr(req.body?.targetSound, 60);
      if (!targetSound) {
        res.status(400).json({ error: 'Target speech sound is required.' });
        return;
      }

      const stageNum = Math.min(8, Math.max(1, Number(req.body?.currentStage) || 1)) as ArticulationStageNumber;
      const affectedPositions = (
        Array.isArray(req.body?.affectedPositions) ? req.body.affectedPositions : ['initial', 'medial']
      )
        .map((p: unknown) => cleanStr(p, 40))
        .filter(Boolean) as SpeechSoundPosition[];

      const target: SpeechSoundTarget = {
        id: `sst-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        targetSound,
        soundGroup: cleanStr(req.body?.soundGroup, 80) || targetSound,
        language: (['English', 'Hindi', 'Bilingual (English + Hindi)', 'Regional / Multilingual'].includes(
          String(req.body?.language),
        )
          ? String(req.body.language)
          : 'English') as SpeechSoundTarget['language'],
        errorType: (['Substitution', 'Omission', 'Distortion', 'Addition', 'Phonological Process'].includes(
          String(req.body?.errorType),
        )
          ? String(req.body.errorType)
          : 'Substitution') as SpeechSoundTarget['errorType'],
        substitutionDetail: cleanStr(req.body?.substitutionDetail, 200) || undefined,
        affectedPositions,
        positionAccuracy:
          req.body?.positionAccuracy && typeof req.body.positionAccuracy === 'object'
            ? (req.body.positionAccuracy as Partial<Record<SpeechSoundPosition, number>>)
            : {},
        accuracyWordLevelPct:
          req.body?.accuracyWordLevelPct === null || req.body?.accuracyWordLevelPct === ''
            ? null
            : Math.min(100, Math.max(0, Number(req.body?.accuracyWordLevelPct ?? 0))),
        accuracyConversationPct:
          req.body?.accuracyConversationPct === null || req.body?.accuracyConversationPct === ''
            ? null
            : Math.min(100, Math.max(0, Number(req.body?.accuracyConversationPct ?? 0))),
        stimulability: (['Stimulable with cue', 'Partially stimulable', 'Not yet stimulable', 'To be assessed'].includes(
          String(req.body?.stimulability),
        )
          ? String(req.body.stimulability)
          : 'To be assessed') as SpeechSoundTarget['stimulability'],
        functionalImpact: cleanStr(req.body?.functionalImpact, 400) || 'Recorded by SLP',
        treatmentPriority: (['High', 'Medium', 'Maintenance', 'Monitor'].includes(
          String(req.body?.treatmentPriority),
        )
          ? String(req.body.treatmentPriority)
          : 'Medium') as SpeechSoundTarget['treatmentPriority'],
        currentStage: stageNum,
        slpApproved: user.role === 'slp',
        slpName: user.name,
        slpRegistrationNo: user.professionalRegistrationNo,
        accentDifferenceRuledOut: Boolean(req.body?.accentDifferenceRuledOut ?? true),
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      if (!Array.isArray(db.speechSoundTargets)) db.speechSoundTargets = [];
      db.speechSoundTargets.unshift(target);
      saveDb();
      res.status(201).json({ target });
    },
  );

  app.post(
    '/api/clinical/speech-exercises/generate',
    requireAuth,
    requireRoles(['slp', 'special_educator']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const targetId = cleanStr(req.body?.targetId, 80);
      const target = (db.speechSoundTargets || []).find(
        (t) => t.id === targetId && t.schoolId === schoolId,
      );
      if (!target) {
        res.status(404).json({ error: 'Speech sound target not found.' });
        return;
      }

      const stage = Math.min(
        8,
        Math.max(1, Number(req.body?.stage) || target.currentStage),
      ) as ArticulationStageNumber;
      const draft: SpeechExerciseItem = generateArticulationExerciseDraft({
        schoolId,
        target,
        stage,
      });

      if (!Array.isArray(db.speechExercises)) db.speechExercises = [];
      db.speechExercises.unshift(draft);
      saveDb();
      res.status(201).json({ exercise: draft });
    },
  );

  app.patch(
    '/api/clinical/speech-exercises/:id/approve',
    requireAuth,
    requireRoles(['slp']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const ex = (db.speechExercises || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!ex) {
        res.status(404).json({ error: 'Speech exercise not found.' });
        return;
      }

      ex.reviewStatus = 'Approved by SLP';
      ex.approvedBy = `${user.name}${user.professionalRegistrationNo ? ` (${user.professionalRegistrationNo})` : ''}`;
      ex.approvedAt = new Date().toISOString().slice(0, 10);
      ex.assignedToHomePractice = Boolean(req.body?.assignedToHomePractice ?? true);
      if (typeof req.body?.therapistFeedback === 'string') {
        ex.therapistFeedback = cleanStr(req.body.therapistFeedback, 600);
      }
      saveDb();
      res.status(200).json({ exercise: ex });
    },
  );

  // ---------------- PART 4: SEPARATE FLUENCY & STAMMERING MODULE ----------------
  app.post(
    '/api/clinical/fluency-profiles',
    requireAuth,
    requireRoles(['slp', 'clinical_psychologist']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const selectedApproaches = (
        Array.isArray(req.body?.selectedApproaches) && req.body.selectedApproaches.length > 0
          ? req.body.selectedApproaches
          : ['Parent-Child Interaction Approach', 'Communication Participation & Confidence']
      ) as FluencyApproachType[];

      const rating = (v: unknown): 1 | 2 | 3 | 4 | 5 =>
        Math.min(5, Math.max(1, Math.round(Number(v) || 3))) as 1 | 2 | 3 | 4 | 5;

      const sev = (v: unknown): 'Not observed' | 'Mild' | 'Moderate' | 'Frequent' =>
        (['Not observed', 'Mild', 'Moderate', 'Frequent'].includes(String(v))
          ? String(v)
          : 'Not observed') as 'Not observed' | 'Mild' | 'Moderate' | 'Frequent';

      const profile: FluencyProfileRecord = {
        id: `fl-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        classSection: student.classSection,
        slpName: user.name,
        slpRegistrationNo: user.professionalRegistrationNo,
        assessedDate: new Date().toISOString().slice(0, 10),
        ageOfOnsetYears: req.body?.ageOfOnsetYears ? Number(req.body.ageOfOnsetYears) : undefined,
        durationMonths: req.body?.durationMonths ? Number(req.body.durationMonths) : undefined,
        familyHistory: cleanStr(req.body?.familyHistory, 400) || 'Not reported',
        observedPatterns: {
          soundRepetitions: sev(req.body?.observedPatterns?.soundRepetitions),
          syllableRepetitions: sev(req.body?.observedPatterns?.syllableRepetitions),
          wordRepetitions: sev(req.body?.observedPatterns?.wordRepetitions),
          prolongations: sev(req.body?.observedPatterns?.prolongations),
          blocks: sev(req.body?.observedPatterns?.blocks),
          physicalTension: cleanStr(req.body?.observedPatterns?.physicalTension, 300) || 'None observed',
          secondaryBehaviours: cleanStr(req.body?.observedPatterns?.secondaryBehaviours, 300) || 'None observed',
          speakingAvoidance: cleanStr(req.body?.observedPatterns?.speakingAvoidance, 300) || 'None observed',
        },
        sampleContextsCollected: Array.isArray(req.body?.sampleContextsCollected)
          ? req.body.sampleContextsCollected
          : ['Conversation', 'Storytelling'],
        situationsIncreasingStammering: cleanStr(req.body?.situationsIncreasingStammering, 500),
        situationsDecreasingStammering: cleanStr(req.body?.situationsDecreasingStammering, 500),
        studentFeelingsAndExperience: cleanStr(req.body?.studentFeelingsAndExperience, 600),
        communicationConfidenceRating: rating(req.body?.communicationConfidenceRating),
        communicationParticipationRating: rating(req.body?.communicationParticipationRating),
        functionalImpactSummary: cleanStr(req.body?.functionalImpactSummary, 600),
        previousIntervention: cleanStr(req.body?.previousIntervention, 400) || 'None',
        selectedApproaches,
        approvedPracticeActivities: getEvidenceInformedFluencyActivities(selectedApproaches),
        classroomSupportGuidance:
          cleanStr(req.body?.classroomSupportGuidance, 600) ||
          'Allow relaxed wait time, listen warmly to ideas, avoid finishing sentences, and never ask the student to repeat words until fluent.',
        familyGuidance:
          cleanStr(req.body?.familyGuidance, 600) ||
          'Enjoy calm 1-on-1 conversation time focused on the child’s ideas and comfort rather than fluency counting.',
        slpApproved: user.role === 'slp',
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      if (!Array.isArray(db.fluencyProfiles)) db.fluencyProfiles = [];
      db.fluencyProfiles.unshift(profile);
      appendClinicalAccess({
        schoolId,
        actor: user,
        action: 'logged_clinical_record',
        entityType: 'fluency_profile',
        entityId: profile.id,
        studentId,
        detail: `Recorded separate Fluency / Stammering profile (${selectedApproaches.join(', ')}).`,
      });
      saveDb();
      res.status(201).json({ profile });
    },
  );

  // ---------------- PART 5: PERSONALIZED THERAPY PLAN GENERATOR & APPROVAL ----------------
  app.post(
    '/api/clinical/therapy-plans',
    requireAuth,
    requireRoles(CLINICAL_SPECIALIST_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      // Hard Clinical Boundary: Only qualified clinical psychologist may enter a confirmed clinical diagnosis
      const rawDiagnosis = cleanStr(req.body?.confirmedClinicalDiagnosis, 400);
      if (rawDiagnosis && !canEnterClinicalDiagnosis(user.role)) {
        res.status(403).json({
          error:
            'Only an authorised Clinical Psychologist may enter a confirmed clinical diagnosis field.',
        });
        return;
      }

      const rawGoals = Array.isArray(req.body?.therapyGoals) ? req.body.therapyGoals : [];
      const therapyGoals = rawGoals
        .slice(0, 10)
        .map((g: Record<string, unknown>, idx: number) => ({
          id: `goal-${crypto.randomUUID().slice(0, 8)}-${idx}`,
          domain: cleanStr(g?.domain, 100) || 'Communication & Participation',
          goalStatement: cleanStr(g?.goalStatement, 400),
          baselineNote: cleanStr(g?.baselineNote, 300) || 'Baseline recorded during assessment',
          progressIndicator: cleanStr(g?.progressIndicator, 300) || 'Session progress & functional participation',
          status: 'Active' as const,
        }))
        .filter((g: { goalStatement: string }) => g.goalStatement.length > 0);

      if (therapyGoals.length === 0) {
        res.status(400).json({ error: 'At least one individualised therapy goal is required.' });
        return;
      }

      // Plans ALWAYS start as Draft pending explicit professional sign-off (Part 12: never auto-assign therapy)
      const plan: PersonalizedTherapyPlan = {
        id: `tp-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        classSection: student.classSection,
        planType: ([
          'Speech & Articulation',
          'Fluency & Communication',
          'Multidisciplinary Developmental Support',
          'Special Education Support',
        ].includes(String(req.body?.planType))
          ? String(req.body.planType)
          : 'Speech & Articulation') as PersonalizedTherapyPlan['planType'],
        assessmentSummary: cleanStr(req.body?.assessmentSummary, 1000) || 'Individualised assessment completed.',
        confirmedClinicalDiagnosis: rawDiagnosis || undefined,
        diagnosisEnteredBy: rawDiagnosis ? user.name : undefined,
        diagnosisCredentials: rawDiagnosis ? user.professionalRegistrationNo || user.designation : undefined,
        functionalDifficulties: (Array.isArray(req.body?.functionalDifficulties)
          ? req.body.functionalDifficulties
          : String(req.body?.functionalDifficulties || '').split('\n')
        )
          .map((s: unknown) => cleanStr(s, 250))
          .filter(Boolean)
          .slice(0, 8),
        therapyGoals,
        selectedIntervention: cleanStr(req.body?.selectedIntervention, 400) || 'Specialist-selected individualised intervention',
        recommendedExerciseIds: Array.isArray(req.body?.recommendedExerciseIds)
          ? req.body.recommendedExerciseIds.map((id: unknown) => cleanStr(id, 80)).filter(Boolean)
          : [],
        sessionsPerWeek: Math.min(7, Math.max(1, Number(req.body?.sessionsPerWeek) || 2)),
        sessionDurationMin: Math.min(90, Math.max(15, Number(req.body?.sessionDurationMin) || 30)),
        dailyHomePracticeMin: Math.min(30, Math.max(5, Number(req.body?.dailyHomePracticeMin) || 10)),
        therapyCycleLabel:
          cleanStr(req.body?.therapyCycleLabel, 140) || 'Clinician-configured review cycle (editable)',
        reviewFrequencyLabel: cleanStr(req.body?.reviewFrequencyLabel, 140) || 'Every 4 weeks',
        reassessmentDate: cleanStr(req.body?.reassessmentDate, 20) || '2026-12-28',
        homePracticeRecommendations: cleanStr(req.body?.homePracticeRecommendations, 600),
        parentGuidance: cleanStr(req.body?.parentGuidance, 600),
        teacherClassroomGuidance: cleanStr(req.body?.teacherClassroomGuidance, 600),
        progressIndicators: (Array.isArray(req.body?.progressIndicators)
          ? req.body.progressIndicators
          : String(req.body?.progressIndicators || '').split('\n')
        )
          .map((s: unknown) => cleanStr(s, 200))
          .filter(Boolean),
        approvalStatus: 'Draft — Pending Professional Approval',
        createdBy: user.name,
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      if (!Array.isArray(db.therapyPlans)) db.therapyPlans = [];
      db.therapyPlans.unshift(plan);
      saveDb();
      res.status(201).json({ plan });
    },
  );

  app.patch(
    '/api/clinical/therapy-plans/:id/approve',
    requireAuth,
    requireRoles(CLINICAL_SPECIALIST_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      if (!canApproveMultidisciplinaryPlan(user.role)) {
        res.status(403).json({ error: 'Only credentialed clinical specialists may approve therapy plans.' });
        return;
      }

      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const plan = (db.therapyPlans || []).find(
        (p) => p.id === req.params.id && p.schoolId === schoolId,
      );
      if (!plan) {
        res.status(404).json({ error: 'Therapy plan not found.' });
        return;
      }

      plan.approvalStatus = 'Approved & Active';
      plan.approvedByName = user.name;
      plan.approvedByRole = user.role;
      plan.approvedByRegistrationNo = user.professionalRegistrationNo;
      plan.approvedAt = new Date().toISOString().slice(0, 10);
      plan.updatedAt = plan.approvedAt;

      appendClinicalAccess({
        schoolId,
        actor: user,
        action: 'approved_plan',
        entityType: 'therapy_plan',
        entityId: plan.id,
        studentId: plan.studentId,
        detail: `Approved & activated ${plan.planType} therapy plan (${user.professionalRegistrationNo || user.designation}).`,
      });
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'THERAPY_PLAN_APPROVED',
        entityType: 'therapy_plan',
        entityId: plan.id,
        detail: `Approved therapy plan for ${plan.studentName}.`,
      });
      saveDb();
      res.status(200).json({ plan });
    },
  );

  // ---------------- PART 6: DAILY THERAPY SESSION LOG ----------------
  app.post(
    '/api/clinical/therapy-sessions',
    requireAuth,
    requireRoles(CLINICAL_SPECIALIST_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const planId = cleanStr(req.body?.planId, 80);
      const plan = (db.therapyPlans || []).find(
        (p) => p.id === planId && p.schoolId === schoolId,
      );
      if (!plan) {
        res.status(404).json({ error: 'Approved therapy plan not found.' });
        return;
      }

      const log: DailyTherapySessionLog = {
        id: `tsl-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId: plan.studentId,
        planId: plan.id,
        sessionDate: cleanStr(req.body?.sessionDate, 20) || new Date().toISOString().slice(0, 10),
        therapistName: user.name,
        therapistRole: user.role,
        attendanceStatus: (['Completed', 'Missed', 'Rescheduled'].includes(String(req.body?.attendanceStatus))
          ? String(req.body.attendanceStatus)
          : 'Completed') as DailyTherapySessionLog['attendanceStatus'],
        exerciseTitle: cleanStr(req.body?.exerciseTitle, 200) || 'Individualised Session Activity',
        targetFocus: cleanStr(req.body?.targetFocus, 200) || plan.planType,
        accuracyPct:
          req.body?.accuracyPct === null || req.body?.accuracyPct === '' || req.body?.accuracyPct === undefined
            ? null
            : Math.min(100, Math.max(0, Number(req.body.accuracyPct))),
        attemptsCount: Math.max(0, Math.min(200, Number(req.body?.attemptsCount) || 10)),
        assistanceLevel: ([
          'Independent',
          'Minimal Verbal/Visual Cue',
          'Moderate Guided Cue',
          'Full Modelling',
        ].includes(String(req.body?.assistanceLevel))
          ? String(req.body.assistanceLevel)
          : 'Minimal Verbal/Visual Cue') as DailyTherapySessionLog['assistanceLevel'],
        studentEngagement: (['High', 'Steady', 'Variable', 'Needed Encouragement'].includes(
          String(req.body?.studentEngagement),
        )
          ? String(req.body.studentEngagement)
          : 'Steady') as DailyTherapySessionLog['studentEngagement'],
        communicationComfortRating: req.body?.communicationComfortRating
          ? (Math.min(5, Math.max(1, Number(req.body.communicationComfortRating))) as 1 | 2 | 3 | 4 | 5)
          : undefined,
        observedDifficulties: cleanStr(req.body?.observedDifficulties, 600),
        therapistNotes: cleanStr(req.body?.therapistNotes, 1000),
        nextRecommendedActivity: cleanStr(req.body?.nextRecommendedActivity, 400),
        nextSessionDate: cleanStr(req.body?.nextSessionDate, 20) || undefined,
      };

      if (!Array.isArray(db.therapySessionLogs)) db.therapySessionLogs = [];
      db.therapySessionLogs.unshift(log);
      saveDb();
      res.status(201).json({ sessionLog: log });
    },
  );

  // ---------------- PART 7: CONSENT-GATED LOCAL AUDIO ANNOTATION ----------------
  app.post(
    '/api/clinical/audio-records',
    requireAuth,
    requireRoles(['slp', 'audiologist']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);

      const consent = (db.clinicalConsents || []).find(
        (c) => c.schoolId === schoolId && c.studentId === studentId,
      );
      if (!consent?.audioRecordingConsent) {
        res.status(403).json({
          error:
            'Parent/guardian audio recording consent is required before saving an audio practice annotation.',
        });
        return;
      }

      const record: AudioPracticeRecord = {
        id: `aud-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        recordedAt: new Date().toISOString().slice(0, 10),
        recordedBy: user.name,
        languageContext: cleanStr(req.body?.languageContext, 160) || 'English / Hindi multilingual',
        accentAndDialectNote:
          cleanStr(req.body?.accentAndDialectNote, 400) ||
          'Indian English / regional accent features respected and excluded from articulation errors.',
        targetWords: (Array.isArray(req.body?.targetWords)
          ? req.body.targetWords
          : String(req.body?.targetWords || '').split(',')
        )
          .map((w: unknown) => cleanStr(w, 60))
          .filter(Boolean)
          .slice(0, 20),
        localDurationSec: Math.max(1, Math.min(600, Number(req.body?.localDurationSec) || 15)),
        consentVerified: true,
        externalAiUploadAllowed: false, // Enforced privacy boundary: never upload child audio to external AI
        therapistTranscript: cleanStr(req.body?.therapistTranscript, 1000),
        therapistAnnotation: cleanStr(req.body?.therapistAnnotation, 1000),
        comparisonNote: cleanStr(req.body?.comparisonNote, 400) || undefined,
      };

      if (!Array.isArray(db.audioPracticeRecords)) db.audioPracticeRecords = [];
      db.audioPracticeRecords.unshift(record);
      saveDb();
      res.status(201).json({ audioRecord: record });
    },
  );

  // ---------------- PART 8: PARENT HOME PRACTICE COMPLETION ----------------
  app.post(
    '/api/clinical/home-practice',
    requireAuth,
    requireRoles(['parent', 'student', 'slp']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const planId = cleanStr(req.body?.planId, 80);
      const plan = (db.therapyPlans || []).find(
        (p) =>
          p.id === planId &&
          p.schoolId === schoolId &&
          p.approvalStatus === 'Approved & Active',
      );
      if (!plan || !canAccessStudentInSchool(user, plan.studentId, schoolId)) {
        res.status(403).json({ error: 'Approved therapy plan not accessible for this account.' });
        return;
      }

      const log: ParentHomePracticeLog = {
        id: `phpl-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId: plan.studentId,
        planId: plan.id,
        exerciseId: cleanStr(req.body?.exerciseId, 80) || undefined,
        exerciseTitle: cleanStr(req.body?.exerciseTitle, 200) || 'Approved Home Practice Activity',
        completedDate: new Date().toISOString().slice(0, 10),
        durationMin: Math.max(1, Math.min(45, Number(req.body?.durationMin) || 10)),
        childComfort: (['Enjoyed / Comfortable', 'Steady', 'Tired — Stopped Early'].includes(
          String(req.body?.childComfort),
        )
          ? String(req.body.childComfort)
          : 'Enjoyed / Comfortable') as ParentHomePracticeLog['childComfort'],
        parentObservation: cleanStr(req.body?.parentObservation, 600),
        loggedByParentName: user.name,
      };

      if (!Array.isArray(db.parentHomePracticeLogs)) db.parentHomePracticeLogs = [];
      db.parentHomePracticeLogs.unshift(log);
      saveDb();
      res.status(201).json({ homePracticeLog: log });
    },
  );

  // ---------------- PART 10: CLINICAL REPORTING & ACCESS LOGGING ----------------
  app.post(
    '/api/clinical/reports',
    requireAuth,
    requireRoles(CLINICAL_SPECIALIST_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const studentId = cleanStr(req.body?.studentId, 80);
      const reportType = cleanStr(req.body?.reportType, 50) as ClinicalReportType;

      if (!VALID_REPORT_TYPES.includes(reportType)) {
        res.status(400).json({ error: 'Invalid clinical report type.' });
        return;
      }

      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const professionalDiagnosis = cleanStr(req.body?.professionalDiagnosis, 500);
      if (professionalDiagnosis && !canEnterClinicalDiagnosis(user.role)) {
        res.status(403).json({
          error:
            'Clinical diagnosis section can only be entered and signed by a credentialed Clinical Psychologist.',
        });
        return;
      }

      const report: ClinicalReportRecord = {
        id: `rep-${crypto.randomUUID().slice(0, 10)}`,
        schoolId,
        studentId,
        studentName: student.name,
        classSection: student.classSection,
        reportType,
        title: cleanStr(req.body?.title, 200) || `${reportType.replace(/_/g, ' ')} — ${student.name}`,
        reportDate: new Date().toISOString().slice(0, 10),
        authorName: user.name,
        authorRole: user.role,
        authorCredentials: user.designation,
        authorRegistrationNo: user.professionalRegistrationNo,
        screeningFindings: cleanStr(req.body?.screeningFindings, 1500) || undefined,
        clinicalAssessmentFindings: cleanStr(req.body?.clinicalAssessmentFindings, 1500) || undefined,
        professionalDiagnosis: professionalDiagnosis || undefined,
        languageAndSpeechProfile: cleanStr(req.body?.languageAndSpeechProfile, 1200) || undefined,
        baselineAndProgressSummary: cleanStr(req.body?.baselineAndProgressSummary, 1200) || undefined,
        recommendations: (Array.isArray(req.body?.recommendations)
          ? req.body.recommendations
          : String(req.body?.recommendations || '').split('\n')
        )
          .map((r: unknown) => cleanStr(r, 300))
          .filter(Boolean)
          .slice(0, 10),
        parentFriendlySummary: cleanStr(req.body?.parentFriendlySummary, 1000) || 'Support summary prepared by specialist.',
        teacherAuthorizedSummary: cleanStr(req.body?.teacherAuthorizedSummary, 800) || undefined,
        status: req.body?.signImmediately ? 'Signed & Approved' : 'Draft',
        sharedWithParent: Boolean(req.body?.sharedWithParent),
        sharedWithManagement: Boolean(req.body?.sharedWithManagement),
        sharedClassroomSummaryWithTeacher: Boolean(req.body?.sharedClassroomSummaryWithTeacher),
        signedAt: req.body?.signImmediately ? new Date().toISOString().slice(0, 10) : undefined,
      };

      if (!Array.isArray(db.clinicalReports)) db.clinicalReports = [];
      db.clinicalReports.unshift(report);
      appendClinicalAccess({
        schoolId,
        actor: user,
        action: 'logged_clinical_record',
        entityType: 'clinical_report',
        entityId: report.id,
        studentId,
        detail: `Issued ${reportType} report (${report.status}) by ${user.name}.`,
      });
      saveDb();
      res.status(201).json({ report });
    },
  );

  app.post(
    '/api/clinical/reports/:id/log-access',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const report = (db.clinicalReports || []).find(
        (r) => r.id === req.params.id && r.schoolId === schoolId,
      );
      if (!report) {
        res.status(404).json({ error: 'Report not found.' });
        return;
      }

      // Enforce sharing authorisation before logging read/export
      if (user.role === 'parent' && (!report.sharedWithParent || !canAccessStudentInSchool(user, report.studentId, schoolId))) {
        res.status(403).json({ error: 'This clinical report has not been released to parent accounts.' });
        return;
      }
      if (user.role === 'teacher' && !report.sharedClassroomSummaryWithTeacher) {
        res.status(403).json({ error: 'Confidential clinical report not authorised for teacher access.' });
        return;
      }
      if (MANAGEMENT_ROLES.includes(user.role) && !report.sharedWithManagement) {
        res.status(403).json({ error: 'Confidential clinical report not authorised for management viewing.' });
        return;
      }

      const mode = req.body?.mode === 'export' ? 'exported_report' : 'viewed_report';
      appendClinicalAccess({
        schoolId,
        actor: user,
        action: mode,
        entityType: 'clinical_report',
        entityId: report.id,
        studentId: report.studentId,
        detail: `${user.name} (${user.role}) ${mode === 'exported_report' ? 'exported/printed' : 'viewed'} "${report.title}".`,
      });
      saveDb();
      res.status(200).json({ logged: true });
    },
  );
}
