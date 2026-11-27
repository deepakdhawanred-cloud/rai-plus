import type { Express, NextFunction, Request, Response } from 'express';
import { getDb, saveDb } from './store.ts';
import { generateThinkingDraftObservation } from './gemini.ts';
import { syncSessionToThinkingCollections } from './thinkingMigrations.ts';
import { registerThinkingCollectionRoutes } from './thinkingCollectionRoutes.ts';
import type {
  CapabilityBandConfig,
  PpdtGroupDiscussionEvaluation,
  PpdtPerceptionDetails,
  PresentationLanguageMode,
  RedesignedPresentationDeck,
  StudentCareerPlan,
  SubstituteRuleConfig,
  SubstitutionAssignmentRecord,
  TatStoryStructure,
  TeacherCapabilityProfile,
  TeacherLeaveRequest,
  TeacherProductivityKpiConfig,
  ThinkingQuestionItem,
  ThinkingTestType,
  UserAccount,
  UserRole,
  VisualSlideItem,
} from '../src/types';
import {
  aggregateThinkingSession,
  buildCorroboratedThinkingOlqEvidence,
  createDefaultThinkingScoringConfig,
  evaluateSingleThinkingResponse,
} from '../src/utils/thinkingAssessmentEngine.ts';
import {
  extractClassNumber,
  findMonthlySetUsage,
  getCurrentDateKey,
  getCurrentMonthKey,
} from '../src/utils/thinkingMonthlyBank.ts';
import { teacherMatchesSlot } from '../src/utils/academicOperationsEngine.ts';
import {
  computeCapabilityBands,
  createDefaultSubstituteRuleConfig,
  dateToTimetableDay,
  enumerateDatesInRange,
  getApprovedAbsentTeachersForDate,
  normalizeTeacherKey,
  normalizeTimetableDay,
  PERIOD_TIME_RANGES,
  rankSubstituteCandidates,
  runAutoSubstituteEngineForDate,
} from '../src/utils/smartTimetableEngine.ts';
import { createDefaultProductivityKpiConfig } from '../src/utils/teacherProductivityEngine.ts';
import {
  auditExistingPresentation,
  buildDefaultRedesignedDeckFromAudit,
  enforcePresentationLanguagePolicy,
  parseNotebookLmStoryboardJson,
} from '../src/utils/presentationStudioEngine.ts';

export interface IntelligenceAuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface IntelligenceRouteDeps {
  requireAuth: (req: IntelligenceAuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (allowed: UserRole[]) => (req: IntelligenceAuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const LEADERSHIP_ROLES: UserRole[] = ['super_admin', 'school_admin', 'principal', 'coordinator'];
const STAFF_ROLES: UserRole[] = [
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'teacher',
  'counsellor',
];

export function registerIntelligenceRoutes(app: Express, deps: IntelligenceRouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Mount dedicated normalized Thinking Assessment Express collection & migration endpoints
  registerThinkingCollectionRoutes(app, deps);

  // ==========================================================================
  // PART 1 & 2 — THINKING TESTS (SRT, WAT, TAT, PPDT) & 15-OLQ CORROBORATION
  // ==========================================================================

  app.post(
    '/api/thinking/questions',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as Partial<ThinkingQuestionItem>;
      if (!body.testType || !body.title?.trim() || !body.prompt?.trim()) {
        res.status(400).json({ error: 'Test type, title, and prompt text are required.' });
        return;
      }
      const item: ThinkingQuestionItem = {
        id: `tq-${schoolId}-${Date.now().toString(36)}`,
        schoolId,
        testType: body.testType as ThinkingTestType,
        title: body.title.trim(),
        prompt: body.prompt.trim(),
        sceneCode: body.sceneCode?.trim() || undefined,
        sceneCaption: body.sceneCaption?.trim() || undefined,
        ageBand: body.ageBand?.trim() || '11-16 yrs',
        classRange: body.classRange?.trim() || 'Classes 6-12',
        difficulty: body.difficulty || 'Intermediate',
        defaultTimeLimitSec: Math.max(10, Number(body.defaultTimeLimitSec) || 30),
        targetOlqs: Array.isArray(body.targetOlqs) && body.targetOlqs.length > 0
          ? body.targetOlqs
          : ['effective_intelligence', 'reasoning_ability'],
        tags: Array.isArray(body.tags) ? body.tags : [],
        active: true,
        createdBy: req.user!.name,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      db.thinkingQuestionBank.unshift(item);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ADDED_THINKING_QUESTION',
        entityType: 'ThinkingQuestionItem',
        entityId: item.id,
        detail: `Added ${item.testType} prompt "${item.title}" (${item.classRange}, ${item.difficulty}).`,
      });
      saveDb();
      res.status(201).json({ question: item });
    },
  );

  app.put(
    '/api/thinking/scoring-config',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const current = db.thinkingScoringConfigs[schoolId] || createDefaultThinkingScoringConfig(schoolId);
      const body = req.body as Partial<typeof current>;
      const updated = {
        ...current,
        minCorroborationCount: Math.max(2, Math.min(10, Number(body.minCorroborationCount) || current.minCorroborationCount)),
        fastResponseThresholdMs: Math.max(3000, Number(body.fastResponseThresholdMs) || current.fastResponseThresholdMs),
        moderateResponseThresholdMs: Math.max(10000, Number(body.moderateResponseThresholdMs) || current.moderateResponseThresholdMs),
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      db.thinkingScoringConfigs[schoolId] = updated;
      saveDb();
      res.json({ config: updated });
    },
  );

  app.post('/api/thinking/sessions', requireAuth, async (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const body = req.body as {
      studentId?: string;
      testType?: ThinkingTestType;
      workflowMode?: 'Individual' | 'Group';
      timedMode?: boolean;
      timeLimitSec?: number;
      requestAiDraft?: boolean;
      responses?: Array<{
        questionId: string;
        responseText: string;
        responseTimeMs: number;
        tatStructure?: TatStoryStructure;
        ppdtPerception?: PpdtPerceptionDetails;
      }>;
      ppdtGroupEval?: PpdtGroupDiscussionEvaluation;
      classLevel?: number;
      monthKey?: string;
      setVersion?: number;
      dailyAssignmentId?: string;
    };

    const user = req.user!;
    const resolvedStudentId =
      user.role === 'student' ? user.linkedStudentIds?.[0] || body.studentId : body.studentId;
    const student = db.students.find((s) => s.id === resolvedStudentId && s.schoolId === schoolId);
    if (!student) {
      res.status(404).json({ error: 'Student not found in active school tenant.' });
      return;
    }
    if (!body.testType || !Array.isArray(body.responses) || body.responses.length === 0) {
      res.status(400).json({ error: 'Test type and at least one student response are required.' });
      return;
    }

    const validResponses = body.responses.filter((r) => r.responseText && r.responseText.trim().length >= 2);
    if (validResponses.length === 0) {
      res.status(400).json({ error: 'Please write at least one meaningful response before submitting.' });
      return;
    }

    const scoreCfg = db.thinkingScoringConfigs[schoolId] || createDefaultThinkingScoringConfig(schoolId);
    const schoolQuestions = db.thinkingQuestionBank.filter((q) => q.schoolId === schoolId);
    const qMap = new Map(schoolQuestions.map((q) => [q.id, q]));

    const evaluated = validResponses.map((r) => {
      const q =
        qMap.get(r.questionId) ||
        ({
          id: r.questionId,
          schoolId,
          testType: body.testType!,
          title: `${body.testType} Prompt`,
          prompt: r.questionId,
          ageBand: '11-17 yrs',
          classRange: student.classSection,
          difficulty: 'Intermediate',
          defaultTimeLimitSec: 30,
          targetOlqs: ['effective_intelligence', 'reasoning_ability'],
          tags: [],
          active: true,
          createdBy: user.name,
          createdAt: new Date().toISOString().slice(0, 10),
        } as ThinkingQuestionItem);
      return evaluateSingleThinkingResponse({
        question: q,
        responseText: r.responseText,
        responseTimeMs: Math.max(500, Number(r.responseTimeMs) || 12000),
        config: scoreCfg,
        tatStructure: r.tatStructure,
        ppdtPerception: r.ppdtPerception,
      });
    });

    const nowIso = new Date().toISOString();
    const session = aggregateThinkingSession({
      id: `ts-${schoolId}-${Date.now().toString(36)}`,
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      testType: body.testType,
      workflowMode: body.workflowMode || 'Individual',
      timedMode: Boolean(body.timedMode),
      timeLimitSec: Number(body.timeLimitSec) || 60,
      startedAt: nowIso,
      submittedAt: nowIso,
      responses: evaluated,
      questionsById: qMap,
      ppdtGroupEval: body.ppdtGroupEval,
    });

    if (body.requestAiDraft) {
      const draft = await generateThinkingDraftObservation({
        studentName: student.name,
        classSection: student.classSection,
        testType: session.testType,
        dimensions: session.dimensionScores,
        responseSnippets: evaluated.map((e) => e.responseText),
      });
      session.aiDraftObservation = draft.observation;
      session.aiDraftGeneratedAt = new Date().toISOString();
    }

    db.thinkingAssessments.unshift(session);
    const collectionSync = syncSessionToThinkingCollections(db, session);

    // Track monthly set usage (unlocking regeneration once used in this month)
    if (!Array.isArray(db.thinkingSetUsages)) db.thinkingSetUsages = [];
    const clsNum = extractClassNumber(body.classLevel ?? student.classSection);
    const monthKey =
      body.monthKey && /^\d{4}-\d{2}$/.test(body.monthKey)
        ? body.monthKey
        : getCurrentMonthKey();
    let usage = findMonthlySetUsage(db.thinkingSetUsages, schoolId, clsNum, monthKey, session.testType);
    if (!usage) {
      usage = {
        id: `tmu-${schoolId}-c${clsNum}-${monthKey}-${session.testType.toLowerCase()}`,
        schoolId,
        classLevel: clsNum,
        monthKey,
        testType: session.testType,
        setVersion: Math.max(1, Number(body.setVersion) || 1),
        usedCount: 1,
        usedByStudentIds: [student.id],
        lastUsedAt: nowIso,
      };
      db.thinkingSetUsages.unshift(usage);
    } else {
      usage.usedCount += 1;
      if (!usage.usedByStudentIds.includes(student.id)) {
        usage.usedByStudentIds.push(student.id);
      }
      usage.lastUsedAt = nowIso;
    }

    // Mark today's SSB daily assignment completed if enrolled/assigned
    if (Array.isArray(db.ssbDailyAssignments)) {
      const todayKey = getCurrentDateKey();
      const targetDaily = db.ssbDailyAssignments.find(
        (a) =>
          a.schoolId === schoolId &&
          a.studentId === student.id &&
          ((body.dailyAssignmentId && a.id === body.dailyAssignmentId) ||
            (a.dateKey === todayKey && a.testType === session.testType && a.status === 'pending')),
      );
      if (targetDaily) {
        targetDaily.status = 'completed';
        targetDaily.sessionId = session.id;
        targetDaily.completedAt = nowIso;
      }
    }

    appendAuditLog({
      schoolId,
      actor: user,
      action: 'SUBMITTED_THINKING_ASSESSMENT',
      entityType: 'ThinkingAssessmentSession',
      entityId: session.id,
      detail: `${student.name} (${student.classSection}) completed ${session.testType} (${evaluated.length} response(s), synced ${collectionSync.recordsUpserted} record(s) & ${collectionSync.olqMappingsUpserted} OLQ mapping(s)).`,
    });
    saveDb();
    res.status(201).json({ session, collectionSync, monthlyUsage: usage });
  });

  app.post(
    '/api/thinking/sessions/:id/review',
    requireAuth,
    requireRoles(STAFF_ROLES),
    async (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const session = db.thinkingAssessments.find(
        (s) => s.id === req.params.id && s.schoolId === schoolId,
      );
      if (!session) {
        res.status(404).json({ error: 'Thinking assessment session not found.' });
        return;
      }

      const body = req.body as {
        teacherObservation?: string;
        counsellorRecommendation?: string;
        ppdtGroupEval?: PpdtGroupDiscussionEvaluation;
        generateAiDraft?: boolean;
        promoteToOlq?: boolean;
      };

      if (body.teacherObservation !== undefined) {
        session.teacherObservation = body.teacherObservation.trim();
      }
      if (body.counsellorRecommendation !== undefined) {
        session.counsellorRecommendation = body.counsellorRecommendation.trim();
      }
      if (body.ppdtGroupEval) {
        session.ppdtGroupEval = {
          ...body.ppdtGroupEval,
          evaluatorName: req.user!.name,
          evaluatedAt: new Date().toISOString().slice(0, 10),
        };
      }
      if (body.generateAiDraft) {
        const draft = await generateThinkingDraftObservation({
          studentName: session.studentName,
          classSection: session.classSection,
          testType: session.testType,
          dimensions: session.dimensionScores,
          responseSnippets: session.responses.map((r) => r.responseText),
        });
        session.aiDraftObservation = draft.observation;
        session.aiDraftGeneratedAt = new Date().toISOString();
      }

      session.status = 'counsellor_reviewed';
      session.reviewedBy = req.user!.name;
      session.reviewedAt = new Date().toISOString().slice(0, 10);

      let promotionResult = null;
      if (body.promoteToOlq) {
        const scoreCfg =
          db.thinkingScoringConfigs[schoolId] || createDefaultThinkingScoringConfig(schoolId);
        const studentSessions = db.thinkingAssessments.filter(
          (s) => s.schoolId === schoolId && s.studentId === session.studentId,
        );
        promotionResult = buildCorroboratedThinkingOlqEvidence({
          schoolId,
          studentId: session.studentId,
          sessions: studentSessions,
          config: scoreCfg,
          reviewerName: req.user!.name,
          reviewDateIso: new Date().toISOString().slice(0, 10),
        });

        if (promotionResult.eligible) {
          for (const ev of promotionResult.evidenceRecords) {
            const idx = db.evidence.findIndex((e) => e.sourceKey === ev.sourceKey);
            if (idx >= 0) db.evidence[idx] = ev;
            else db.evidence.unshift(ev);
          }
          session.promotedToOlq = true;
          session.promotedEvidenceKeys = promotionResult.evidenceRecords.map((e) => e.sourceKey);
        }
      }

      const collectionSync = syncSessionToThinkingCollections(db, session);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: body.promoteToOlq ? 'REVIEWED_AND_PROMOTED_THINKING_OLQ' : 'REVIEWED_THINKING_SESSION',
        entityType: 'ThinkingAssessmentSession',
        entityId: session.id,
        detail: `${req.user!.name} reviewed ${session.studentName}'s ${session.testType}. ${promotionResult?.reason || ''}`.trim(),
      });
      saveDb();
      res.json({ session, promotionResult, collectionSync });
    },
  );

  // ==========================================================================
  // PART 3 A–D — SMART TIMETABLE, AUTO-SUBSTITUTE, CUSTOM LOCK & TEACHER LEAVE
  // ==========================================================================

  app.post(
    '/api/timetable/publish-toggle',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const cfg = db.timetableMasterConfigs[schoolId];
      if (!cfg) {
        res.status(404).json({ error: 'Timetable master config not found.' });
        return;
      }
      const nextState = req.body?.publishState === 'draft' ? 'draft' : 'published';
      cfg.publishState = nextState;
      if (nextState === 'published') {
        cfg.publishedAt = new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        cfg.publishedBy = req.user!.name;
        cfg.version += 1;
        // Refresh capability bands automatically on publish
        db.capabilityBandConfigs[schoolId] = computeCapabilityBands({
          schoolId,
          timetable: db.timetable.filter((t) => t.schoolId === schoolId),
          targetLevelCount: db.capabilityBandConfigs[schoolId]?.targetLevelCount || 5,
        });
      }
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: nextState === 'published' ? 'PUBLISHED_TIMETABLE' : 'UNPUBLISHED_TIMETABLE',
        entityType: 'TimetableMasterConfig',
        entityId: schoolId,
        detail: `Timetable "${cfg.title}" set to ${nextState} (v${cfg.version}).`,
      });
      saveDb();
      res.json({ config: cfg, capabilityBands: db.capabilityBandConfigs[schoolId] });
    },
  );

  app.put(
    '/api/timetable/substitute-settings',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as {
        ruleConfig?: SubstituteRuleConfig;
        capabilityBands?: CapabilityBandConfig;
        teacherProfile?: TeacherCapabilityProfile;
      };
      if (body.ruleConfig) {
        db.substituteRuleConfigs[schoolId] = {
          ...body.ruleConfig,
          schoolId,
          updatedBy: req.user!.name,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }
      if (body.capabilityBands) {
        db.capabilityBandConfigs[schoolId] = {
          ...body.capabilityBands,
          schoolId,
          computedAt: new Date().toISOString().slice(0, 10),
        };
      }
      if (body.teacherProfile) {
        const prof = { ...body.teacherProfile, schoolId };
        const idx = db.teacherCapabilityProfiles.findIndex(
          (p) =>
            p.schoolId === schoolId &&
            (p.id === prof.id ||
              normalizeTeacherKey(p.teacherName) === normalizeTeacherKey(prof.teacherName)),
        );
        if (idx >= 0) db.teacherCapabilityProfiles[idx] = prof;
        else db.teacherCapabilityProfiles.push(prof);
      }
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_SUBSTITUTE_SETTINGS',
        entityType: 'SubstituteRuleConfig',
        entityId: schoolId,
        detail: 'Updated substitute scoring tie-breakers, eligibility rules, or teacher settings.',
      });
      saveDb();
      res.json({
        ruleConfig: db.substituteRuleConfigs[schoolId],
        capabilityBands: db.capabilityBandConfigs[schoolId],
        teacherProfiles: db.teacherCapabilityProfiles.filter((p) => p.schoolId === schoolId),
      });
    },
  );

  app.post(
    '/api/timetable/recompute-bands',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const targetLevelCount = Math.max(2, Math.min(6, Number(req.body?.targetLevelCount) || 5));
      const computed = computeCapabilityBands({
        schoolId,
        timetable: db.timetable.filter((t) => t.schoolId === schoolId),
        targetLevelCount,
      });
      db.capabilityBandConfigs[schoolId] = computed;
      saveDb();
      res.json({ capabilityBands: computed });
    },
  );

  app.post(
    '/api/timetable/auto-assign',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const date = String(req.body?.date || new Date().toISOString().slice(0, 10));
      const explicitAbsent: string[] = Array.isArray(req.body?.absentTeachers)
        ? req.body.absentTeachers.map((x: unknown) => String(x).trim()).filter(Boolean)
        : [];

      const approvedForDate = getApprovedAbsentTeachersForDate(db.teacherLeaveRequests, schoolId, date);
      const absentTeachers = Array.from(new Set([...approvedForDate.teachers, ...explicitAbsent]));

      if (absentTeachers.length === 0) {
        res.status(400).json({
          error:
            'No absent teachers on approved leave for this date. Approve a teacher leave or select an absent teacher to auto-assign vacant periods.',
        });
        return;
      }

      const ruleConfig =
        db.substituteRuleConfigs[schoolId] || createDefaultSubstituteRuleConfig(schoolId);
      const capabilityBands =
        db.capabilityBandConfigs[schoolId] ||
        computeCapabilityBands({
          schoolId,
          timetable: db.timetable.filter((t) => t.schoolId === schoolId),
        });
      const teacherProfiles = db.teacherCapabilityProfiles.filter((p) => p.schoolId === schoolId);

      const plan = runAutoSubstituteEngineForDate({
        schoolId,
        date,
        absentTeachers,
        leaveRequestIdByTeacher: approvedForDate.leaveIdByTeacher,
        timetable: db.timetable,
        ruleConfig,
        capabilityBands,
        teacherProfiles,
        existingCovers: db.substitutionAssignments.filter((c) => c.schoolId === schoolId),
        actorName: req.user!.name,
        actorRole: req.user!.role,
      });

      for (const cover of plan.generatedCovers) {
        const idx = db.substitutionAssignments.findIndex((c) => c.id === cover.id);
        if (idx >= 0) db.substitutionAssignments[idx] = cover;
        else db.substitutionAssignments.unshift(cover);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RAN_AUTO_SUBSTITUTE_ASSIGNMENT',
        entityType: 'SubstitutionAssignmentRecord',
        entityId: `${schoolId}-${date}`,
        detail: `Generated ${plan.generatedCovers.length} cover recommendation(s) for ${date}; preserved ${plan.preservedManualLocks} manually approved lock(s); ${plan.unassignedCount} unassigned.`,
      });
      saveDb();
      res.json(plan);
    },
  );

  app.post(
    '/api/timetable/custom-assign',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as {
        date?: string;
        slotId?: string;
        absentTeacherName?: string;
        substituteTeacherName?: string;
        reason?: string;
      };
      if (!body.date || !body.slotId || !body.substituteTeacherName?.trim() || !body.reason?.trim()) {
        res.status(400).json({
          error: 'Date, timetable slot, substitute teacher, and assignment reason are required.',
        });
        return;
      }

      const slot = db.timetable.find((t) => t.id === body.slotId && t.schoolId === schoolId);
      if (!slot) {
        res.status(404).json({ error: 'Timetable slot not found.' });
        return;
      }

      const ruleConfig =
        db.substituteRuleConfigs[schoolId] || createDefaultSubstituteRuleConfig(schoolId);
      const capabilityBands =
        db.capabilityBandConfigs[schoolId] ||
        computeCapabilityBands({
          schoolId,
          timetable: db.timetable.filter((t) => t.schoolId === schoolId),
        });
      const teacherProfiles = db.teacherCapabilityProfiles.filter((p) => p.schoolId === schoolId);
      const schoolCovers = db.substitutionAssignments.filter((c) => c.schoolId === schoolId);

      const candidates = rankSubstituteCandidates({
        slot,
        date: body.date,
        timetable: db.timetable.filter((t) => t.schoolId === schoolId),
        ruleConfig,
        capabilityBands,
        teacherProfiles,
        existingCovers: schoolCovers,
        absentTeachersOnDate: new Set([body.absentTeacherName || slot.teacherName]),
      });
      const matched = candidates.find(
        (c) => normalizeTeacherKey(c.teacherName) === normalizeTeacherKey(body.substituteTeacherName!),
      );

      const nowIso = new Date().toISOString();
      const existingIdx = db.substitutionAssignments.findIndex(
        (c) => c.schoolId === schoolId && c.date === body.date && c.slotId === slot.id,
      );
      const prev = existingIdx >= 0 ? db.substitutionAssignments[existingIdx] : null;

      const rawDay = dateToTimetableDay(body.date) || normalizeTimetableDay(slot.day);
      const safeDay = (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(rawDay)
        ? rawDay
        : 'Mon') as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
      const record: SubstitutionAssignmentRecord = {
        id: prev?.id || `sub-${body.date}-${slot.id}`,
        schoolId,
        date: body.date,
        day: safeDay,
        period: slot.period,
        timeRange: PERIOD_TIME_RANGES[slot.period] || `Period ${slot.period}`,
        slotId: slot.id,
        classSection: slot.classSection,
        subject: slot.subject,
        room: slot.room || `Room ${slot.classSection}`,
        absentTeacherName: body.absentTeacherName?.trim() || prev?.absentTeacherName || slot.teacherName,
        substituteTeacherName: body.substituteTeacherName.trim(),
        leaveRequestId: prev?.leaveRequestId,
        assignmentMode: 'custom_manual',
        manuallyApproved: true, // Protected from silent auto-assign overwrite!
        matchTier: matched?.matchTier ?? 6,
        matchTierLabel: matched?.matchTierLabel ?? 'Custom Coordinator Assignment',
        scorePoints: matched?.scorePoints ?? 0,
        ruleWarnings: matched?.ruleWarnings ?? [],
        reason: body.reason.trim(),
        publishStatus: 'pending_review',
        notifiedTeacher: false,
        assignedBy: req.user!.name,
        assignedAt: nowIso,
        auditHistory: [
          ...(prev?.auditHistory || []),
          {
            at: nowIso,
            actorName: req.user!.name,
            actorRole: req.user!.role,
            action: 'CUSTOM_MANUAL_ASSIGNMENT_LOCKED',
            detail: `Manually assigned ${body.substituteTeacherName.trim()} to ${slot.classSection} ${slot.subject} P${slot.period} (Reason: ${body.reason.trim()}). Locked against auto-overwrite.`,
          },
        ],
      };

      if (existingIdx >= 0) db.substitutionAssignments[existingIdx] = record;
      else db.substitutionAssignments.unshift(record);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CUSTOM_SUBSTITUTE_ASSIGNED',
        entityType: 'SubstitutionAssignmentRecord',
        entityId: record.id,
        detail: `Custom-assigned ${record.substituteTeacherName} to ${record.classSection} P${record.period} on ${record.date} (Reason: ${record.reason}).`,
      });
      saveDb();
      res.json({ assignment: record });
    },
  );

  app.post(
    '/api/timetable/publish-covers',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const date = String(req.body?.date || '');
      const nowIso = new Date().toISOString();
      let publishedCount = 0;

      for (const c of db.substitutionAssignments) {
        if (c.schoolId !== schoolId) continue;
        if (date && c.date !== date) continue;
        if (!c.substituteTeacherName) continue;
        if (c.publishStatus !== 'published') {
          c.publishStatus = 'published';
          c.notifiedTeacher = true;
          c.publishedBy = req.user!.name;
          c.publishedAt = nowIso;
          c.auditHistory.push({
            at: nowIso,
            actorName: req.user!.name,
            actorRole: req.user!.role,
            action: 'PUBLISHED_COVER_AND_NOTIFIED',
            detail: `Published substitution cover for ${c.classSection} P${c.period} and dispatched notification to ${c.substituteTeacherName}.`,
          });
          // Also reflect active cover on master slot metadata for live daily visibility
          const slot = db.timetable.find((s) => s.id === c.slotId && s.schoolId === schoolId);
          if (slot) slot.substitutionTeacher = c.substituteTeacherName;
          publishedCount += 1;
        }
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'PUBLISHED_DAILY_COVERS',
        entityType: 'SubstitutionAssignmentRecord',
        entityId: `${schoolId}-${date || 'all'}`,
        detail: `Explicitly published ${publishedCount} substitute cover(s) and notified assigned teachers.`,
      });
      saveDb();
      res.json({ publishedCount });
    },
  );

  app.post(
    '/api/timetable/substitutions/:id/acknowledge',
    requireAuth,
    requireRoles([...LEADERSHIP_ROLES, 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const cover = db.substitutionAssignments.find(
        (c) => c.id === req.params.id && c.schoolId === schoolId,
      );
      if (!cover) {
        res.status(404).json({ error: 'Substitute cover record not found.' });
        return;
      }
      if (!cover.substituteTeacherName) {
        res.status(400).json({ error: 'No substitute teacher is assigned to this period yet.' });
        return;
      }
      if (
        req.user!.role === 'teacher' &&
        !teacherMatchesSlot(cover.substituteTeacherName, req.user!.name)
      ) {
        res.status(403).json({
          error: 'Only the assigned substitute teacher or school leadership can acknowledge this cover.',
        });
        return;
      }

      const nowIso = new Date().toISOString();
      cover.acknowledgedBySubstitute = true;
      cover.acknowledgedAt = nowIso;
      cover.acknowledgedByName = req.user!.name;
      cover.auditHistory.push({
        at: nowIso,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: 'SUBSTITUTE_ACKNOWLEDGED_COVER',
        detail: `${req.user!.name} acknowledged substitute cover for Class ${cover.classSection} ${cover.subject} (P${cover.period} on ${cover.date}).`,
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'SUBSTITUTE_ACKNOWLEDGED_COVER',
        entityType: 'SubstitutionAssignmentRecord',
        entityId: cover.id,
        detail: `Acknowledged substitute duty for Class ${cover.classSection} P${cover.period} (${cover.subject}).`,
      });
      saveDb();
      res.json({ assignment: cover });
    },
  );

  // ---------------- TEACHER LEAVE MANAGEMENT ----------------
  app.post(
    '/api/leaves',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as Partial<TeacherLeaveRequest>;
      const teacherName =
        LEADERSHIP_ROLES.includes(req.user!.role) && body.teacherName?.trim()
          ? body.teacherName.trim()
          : req.user!.name;

      if (!body.leaveType || !body.startDate || !body.endDate || !body.reason?.trim()) {
        res.status(400).json({ error: 'Leave type, start date, end date, and reason are required.' });
        return;
      }
      if (body.endDate < body.startDate) {
        res.status(400).json({ error: 'End date cannot be earlier than start date.' });
        return;
      }

      const dates = enumerateDatesInRange(body.startDate, body.endDate);
      const schoolSlots = db.timetable.filter((t) => t.schoolId === schoolId);
      let affectedSlotCount = 0;
      for (const d of dates) {
        const day = dateToTimetableDay(d);
        if (!day) continue;
        affectedSlotCount += schoolSlots.filter(
          (s) =>
            normalizeTimetableDay(s.day) === day &&
            s.teacherName
              .split(',')
              .some((n) => normalizeTeacherKey(n) === normalizeTeacherKey(teacherName)),
        ).length;
      }

      const nowIso = new Date().toISOString();
      const leave: TeacherLeaveRequest = {
        id: `lr-${schoolId}-${Date.now().toString(36)}`,
        schoolId,
        teacherName,
        teacherUserId: req.user!.id,
        leaveType: body.leaveType,
        startDate: body.startDate,
        endDate: body.endDate,
        halfDaySession: body.halfDaySession,
        reason: body.reason.trim(),
        supportingDocRef: body.supportingDocRef?.trim() || undefined,
        status: 'Pending',
        appliedAt: nowIso,
        affectedSlotCount,
        generatedCoverIds: [],
        auditTrail: [
          {
            at: nowIso,
            actorName: req.user!.name,
            actorRole: req.user!.role,
            action: 'LEAVE_APPLIED',
            detail: `Applied for ${body.leaveType} (${body.startDate} to ${body.endDate}) — ${affectedSlotCount} scheduled periods potentially affected.`,
          },
        ],
      };

      db.teacherLeaveRequests.unshift(leave);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'APPLIED_TEACHER_LEAVE',
        entityType: 'TeacherLeaveRequest',
        entityId: leave.id,
        detail: `${leave.teacherName} applied for ${leave.leaveType} (${leave.startDate}–${leave.endDate}).`,
      });
      saveDb();
      res.status(201).json({ leave });
    },
  );

  app.post(
    '/api/leaves/:id/decision',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const leave = db.teacherLeaveRequests.find(
        (l) => l.id === req.params.id && l.schoolId === schoolId,
      );
      if (!leave) {
        res.status(404).json({ error: 'Leave request not found.' });
        return;
      }

      const decision = req.body?.status as 'Approved' | 'Rejected' | 'Cancelled';
      if (!['Approved', 'Rejected', 'Cancelled'].includes(decision)) {
        res.status(400).json({ error: 'Decision must be Approved, Rejected, or Cancelled.' });
        return;
      }

      const nowIso = new Date().toISOString();
      leave.status = decision;
      leave.reviewedBy = req.user!.name;
      leave.reviewedAt = nowIso;
      leave.reviewNote = String(req.body?.reviewNote || '').trim();

      let generatedCovers: SubstitutionAssignmentRecord[] = [];
      let preservedManualLocks = 0;

      if (decision === 'Approved') {
        // Deduct leave balance cleanly
        const dates = enumerateDatesInRange(leave.startDate, leave.endDate);
        const daysCount = leave.leaveType === 'Half Day' ? 0.5 : Math.max(1, dates.length);
        const bal = db.teacherLeaveBalances.find(
          (b) =>
            b.schoolId === schoolId &&
            normalizeTeacherKey(b.teacherName) === normalizeTeacherKey(leave.teacherName),
        );
        if (bal) {
          if (leave.leaveType === 'Medical Leave') bal.medicalUsed += daysCount;
          else if (leave.leaveType === 'Earned Leave') bal.earnedUsed += daysCount;
          else bal.casualUsed += daysCount;
        }

        // AUTOMATIC CASCADE: Scan affected dates -> Run Vacant-Period Engine -> Draft pending_review covers
        // NEVER auto-publishes without explicit Publish Cover Plan action!
        const ruleConfig =
          db.substituteRuleConfigs[schoolId] || createDefaultSubstituteRuleConfig(schoolId);
        const capabilityBands =
          db.capabilityBandConfigs[schoolId] ||
          computeCapabilityBands({
            schoolId,
            timetable: db.timetable.filter((t) => t.schoolId === schoolId),
          });
        const teacherProfiles = db.teacherCapabilityProfiles.filter((p) => p.schoolId === schoolId);

        for (const d of dates) {
          const plan = runAutoSubstituteEngineForDate({
            schoolId,
            date: d,
            absentTeachers: [leave.teacherName],
            leaveRequestIdByTeacher: new Map([[normalizeTeacherKey(leave.teacherName), leave.id]]),
            timetable: db.timetable,
            ruleConfig,
            capabilityBands,
            teacherProfiles,
            existingCovers: db.substitutionAssignments.filter((c) => c.schoolId === schoolId),
            actorName: req.user!.name,
            actorRole: req.user!.role,
          });
          preservedManualLocks += plan.preservedManualLocks;
          for (const cover of plan.generatedCovers) {
            const idx = db.substitutionAssignments.findIndex((c) => c.id === cover.id);
            if (idx >= 0) db.substitutionAssignments[idx] = cover;
            else db.substitutionAssignments.unshift(cover);
            generatedCovers.push(cover);
          }
        }
        leave.affectedSlotCount = generatedCovers.length + preservedManualLocks;
        leave.generatedCoverIds = generatedCovers.map((c) => c.id);
      }

      leave.auditTrail.push({
        at: nowIso,
        actorName: req.user!.name,
        actorRole: req.user!.role,
        action: `LEAVE_${decision.toUpperCase()}`,
        detail:
          decision === 'Approved'
            ? `Approved by ${req.user!.name}. Queued ${generatedCovers.length} draft cover(s) in pending_review (preserved ${preservedManualLocks} manual lock(s)).`
            : `${decision} by ${req.user!.name}. ${leave.reviewNote}`,
      });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: `TEACHER_LEAVE_${decision.toUpperCase()}`,
        entityType: 'TeacherLeaveRequest',
        entityId: leave.id,
        detail: `${leave.teacherName} (${leave.startDate}–${leave.endDate}) marked ${decision}. Draft covers queued: ${generatedCovers.length}.`,
      });
      saveDb();
      res.json({ leave, generatedCovers, preservedManualLocks });
    },
  );

  // ==========================================================================
  // PART 3 E — TEACHER PRODUCTIVITY KPI CONFIGURATION
  // ==========================================================================
  app.put(
    '/api/productivity/kpi-config',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const current = db.productivityKpiConfigs[schoolId] || createDefaultProductivityKpiConfig(schoolId);
      const body = req.body as Partial<TeacherProductivityKpiConfig>;
      const updated: TeacherProductivityKpiConfig = {
        ...current,
        weights: body.weights
          ? {
              teachingWorkload: Math.max(5, Number(body.weights.teachingWorkload) || 30),
              academicExecution: Math.max(5, Number(body.weights.academicExecution) || 45),
              operationalEngagement: Math.max(5, Number(body.weights.operationalEngagement) || 25),
            }
          : current.weights,
        targetWeeklyPeriods: Math.max(10, Number(body.targetWeeklyPeriods) || current.targetWeeklyPeriods),
        targetNotebookChecksMonthly: Math.max(
          2,
          Number(body.targetNotebookChecksMonthly) || current.targetNotebookChecksMonthly,
        ),
        targetLessonPlansMonthly: Math.max(
          1,
          Number(body.targetLessonPlansMonthly) || current.targetLessonPlansMonthly,
        ),
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      db.productivityKpiConfigs[schoolId] = updated;
      saveDb();
      res.json({ config: updated });
    },
  );

  // ==========================================================================
  // PART 4 — CAREER INTELLIGENCE & STUDENT COUNSELLING PLANS
  // ==========================================================================
  app.post(
    '/api/career/student-plans',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'student']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as {
        studentId?: string;
        shortlistedCareerIds?: string[];
        completedMilestoneKeys?: string[];
        selectedStreamPreference?: string;
        customGoalNote?: string;
        counsellorNotes?: string;
        sharedWithParent?: boolean;
        newSessionLog?: {
          summary: string;
          studentReflections: string;
          nextSteps: string[];
        };
      };

      const resolvedStudentId =
        req.user!.role === 'student' ? req.user!.linkedStudentIds?.[0] || body.studentId : body.studentId;
      const student = db.students.find((s) => s.id === resolvedStudentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const existingIdx = db.studentCareerPlans.findIndex(
        (p) => p.schoolId === schoolId && p.studentId === student.id,
      );
      const existing = existingIdx >= 0 ? db.studentCareerPlans[existingIdx] : null;
      const nowDate = new Date().toISOString().slice(0, 10);

      const sessionLogs = [...(existing?.sessionLogs || [])];
      if (body.newSessionLog?.summary?.trim()) {
        sessionLogs.unshift({
          id: `slog-${Date.now().toString(36)}`,
          date: nowDate,
          counsellorName: req.user!.name,
          summary: body.newSessionLog.summary.trim(),
          studentReflections: (body.newSessionLog.studentReflections || '').trim(),
          nextSteps: Array.isArray(body.newSessionLog.nextSteps)
            ? body.newSessionLog.nextSteps.map((s) => s.trim()).filter(Boolean)
            : [],
        });
      }

      const sanitizedShortlist = Array.isArray(body.shortlistedCareerIds)
        ? Array.from(
            new Set(
              body.shortlistedCareerIds
                .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
                .map((id) => id.trim()),
            ),
          )
        : existing?.shortlistedCareerIds || [];

      const sanitizedMilestones = Array.isArray(body.completedMilestoneKeys)
        ? Array.from(
            new Set(
              body.completedMilestoneKeys
                .filter((k): k is string => typeof k === 'string' && k.trim().length > 0)
                .map((k) => k.trim()),
            ),
          )
        : existing?.completedMilestoneKeys || [];

      const sanitizedStreamPreference =
        body.selectedStreamPreference !== undefined
          ? String(body.selectedStreamPreference).trim()
          : existing?.selectedStreamPreference || '';

      const updated: StudentCareerPlan = {
        id: existing?.id || `scp-${schoolId}-${student.id}`,
        schoolId,
        studentId: student.id,
        studentName: student.name,
        classSection: student.classSection,
        shortlistedCareerIds: sanitizedShortlist,
        completedMilestoneKeys: sanitizedMilestones,
        selectedStreamPreference: sanitizedStreamPreference || undefined,
        customGoalNote:
          body.customGoalNote !== undefined ? body.customGoalNote.trim() : existing?.customGoalNote || '',
        counsellorNotes:
          body.counsellorNotes !== undefined ? body.counsellorNotes.trim() : existing?.counsellorNotes || '',
        sharedWithParent:
          body.sharedWithParent !== undefined
            ? Boolean(body.sharedWithParent)
            : existing?.sharedWithParent ?? false,
        sessionLogs,
        updatedBy: req.user!.name,
        updatedAt: nowDate,
      };

      if (existingIdx >= 0) db.studentCareerPlans[existingIdx] = updated;
      else db.studentCareerPlans.unshift(updated);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_STUDENT_CAREER_PLAN',
        entityType: 'StudentCareerPlan',
        entityId: updated.id,
        detail: `Updated Career Intelligence plan for ${student.name} (${updated.shortlistedCareerIds.length} shortlisted career(s), ${sanitizedMilestones.length} milestone(s) completed).`,
      });
      saveDb();
      res.json({ plan: updated });
    },
  );

  // ==========================================================================
  // PART 5 — PRESENTATION AUDIT, NOTEBOOKLM IMPORT, VISUAL STUDIO & DUAL APPROVAL
  // ==========================================================================
  app.post(
    '/api/presentations/audit',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as {
        resourceId?: string;
        originalSlideCount?: number;
        avgWordsPerSlide?: number;
        visualCoveragePct?: number;
        hasInteractiveChecks?: boolean;
        hasVisualSummary?: boolean;
        requestedLanguageMode?: PresentationLanguageMode;
        learningObjectives?: string[];
        difficulty?: 'Foundation' | 'Standard' | 'Enrichment';
      };
      const resource = db.resources.find(
        (r) => r.id === body.resourceId && r.schoolId === schoolId,
      );
      if (!resource) {
        res.status(404).json({ error: 'Original presentation resource not found.' });
        return;
      }

      const audit = auditExistingPresentation({
        resource,
        originalSlideCount: Math.max(4, Number(body.originalSlideCount) || 12),
        avgWordsPerSlide: Math.max(10, Number(body.avgWordsPerSlide) || 72),
        visualCoveragePct: Math.max(0, Math.min(100, Number(body.visualCoveragePct) || 30)),
        hasInteractiveChecks: Boolean(body.hasInteractiveChecks),
        hasVisualSummary: Boolean(body.hasVisualSummary),
        requestedLanguageMode: body.requestedLanguageMode || 'bilingual_en_hi',
        learningObjectives: Array.isArray(body.learningObjectives) ? body.learningObjectives : [],
        difficulty: body.difficulty || 'Standard',
      });

      const idx = db.presentationAudits.findIndex((a) => a.id === audit.id);
      if (idx >= 0) db.presentationAudits[idx] = audit;
      else db.presentationAudits.unshift(audit);

      saveDb();
      res.json({ audit });
    },
  );

  app.post(
    '/api/presentations/redesigned',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const body = req.body as {
        originalResourceId?: string;
        redesignedTitle?: string;
        languageMode?: PresentationLanguageMode;
        workflowSource?: RedesignedPresentationDeck['workflowSource'];
        changeNote?: string;
        slides?: VisualSlideItem[];
        notebookLmJson?: string;
      };

      const resource = db.resources.find(
        (r) => r.id === body.originalResourceId && r.schoolId === schoolId,
      );
      if (!resource) {
        res.status(404).json({ error: 'Original presentation not found (originals are never deleted).' });
        return;
      }

      const langPolicy = enforcePresentationLanguagePolicy(
        resource.subject,
        body.languageMode || 'bilingual_en_hi',
      );

      let finalSlides: VisualSlideItem[] = [];
      let derivedTitle = body.redesignedTitle?.trim();

      if (body.notebookLmJson) {
        const parsed = parseNotebookLmStoryboardJson({
          rawJson: body.notebookLmJson,
          subject: resource.subject,
          requestedLanguageMode: langPolicy.effectiveMode,
        });
        if (!parsed.ok) {
          res.status(400).json({ error: parsed.error });
          return;
        }
        finalSlides = parsed.slides;
        if (!derivedTitle && parsed.redesignedTitle) derivedTitle = parsed.redesignedTitle;
      } else if (Array.isArray(body.slides) && body.slides.length > 0) {
        // Strip Hindi text strictly if Mathematics
        const allowHindi = langPolicy.effectiveMode === 'bilingual_en_hi';
        finalSlides = body.slides.map((s, idx) => ({
          ...s,
          slideNumber: idx + 1,
          hindiTitle: allowHindi ? s.hindiTitle : undefined,
          hindiTakeaway: allowHindi ? s.hindiTakeaway : undefined,
        }));
      } else {
        const existingAudit =
          db.presentationAudits.find(
            (a) => a.resourceId === resource.id && a.schoolId === schoolId,
          ) ||
          auditExistingPresentation({
            resource,
            originalSlideCount: 12,
            avgWordsPerSlide: 70,
            visualCoveragePct: 30,
            hasInteractiveChecks: false,
            hasVisualSummary: false,
            requestedLanguageMode: langPolicy.effectiveMode,
            learningObjectives: [],
          });
        const scaffold = buildDefaultRedesignedDeckFromAudit({
          audit: existingAudit,
          actorName: req.user!.name,
        });
        finalSlides = scaffold.slides;
      }

      const nowDate = new Date().toISOString().slice(0, 10);
      const existingIdx = db.redesignedDecks.findIndex(
        (d) => d.schoolId === schoolId && d.originalResourceId === resource.id,
      );
      const prev = existingIdx >= 0 ? db.redesignedDecks[existingIdx] : null;
      const nextVersion = prev ? prev.versionNumber + 1 : 1;

      const deck: RedesignedPresentationDeck = {
        id: prev?.id || `rdeck-${resource.id}`,
        schoolId,
        originalResourceId: resource.id,
        originalTitle: resource.title,
        redesignedTitle: derivedTitle || prev?.redesignedTitle || `${resource.chapter} — Visual Edition`,
        classSection: resource.classSection,
        subject: resource.subject,
        chapter: resource.chapter,
        languageMode: langPolicy.effectiveMode,
        workflowSource: body.notebookLmJson
          ? 'notebooklm_import'
          : body.workflowSource || prev?.workflowSource || 'visual_studio',
        versionNumber: nextVersion,
        approvalStatus: 'draft',
        slides: finalSlides,
        versionHistory: [
          {
            versionNumber: nextVersion,
            savedAt: nowDate,
            savedBy: req.user!.name,
            changeNote:
              body.changeNote?.trim() ||
              (body.notebookLmJson
                ? 'Imported visual storyboard from NotebookLM export.'
                : 'Updated visual slides in Visual Infographic Studio.'),
            slideCount: finalSlides.length,
          },
          ...(prev?.versionHistory || []),
        ],
        updatedBy: req.user!.name,
        updatedAt: nowDate,
      };

      if (existingIdx >= 0) db.redesignedDecks[existingIdx] = deck;
      else db.redesignedDecks.unshift(deck);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'SAVED_REDESIGNED_PRESENTATION',
        entityType: 'RedesignedPresentationDeck',
        entityId: deck.id,
        detail: `Saved v${deck.versionNumber} of "${deck.redesignedTitle}" (${deck.slides.length} visual slides, ${deck.languageMode}). Original preserved.`,
      });
      saveDb();
      res.json({ deck, policyNote: langPolicy.enforcedReason });
    },
  );

  app.post(
    '/api/presentations/redesigned/:id/approve',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const deck = db.redesignedDecks.find(
        (d) => d.id === req.params.id && d.schoolId === schoolId,
      );
      if (!deck) {
        res.status(404).json({ error: 'Redesigned deck not found.' });
        return;
      }

      const stage = req.body?.stage as 'teacher' | 'principal' | 'changes_requested';
      const comment = String(req.body?.comment || '').trim();
      const nowDate = new Date().toISOString().slice(0, 10);

      if (stage === 'principal') {
        if (!['super_admin', 'school_admin', 'principal'].includes(req.user!.role)) {
          res.status(403).json({ error: 'Principal or School Admin role required for final Principal Approval.' });
          return;
        }
        deck.approvalStatus = 'principal_approved';
        deck.principalApprovedBy = req.user!.name;
        deck.principalApprovedAt = nowDate;
      } else if (stage === 'changes_requested') {
        deck.approvalStatus = 'changes_requested';
      } else {
        deck.approvalStatus = 'teacher_approved';
        deck.teacherApprovedBy = req.user!.name;
        deck.teacherApprovedAt = nowDate;
      }
      if (comment) deck.reviewComment = comment;
      deck.updatedBy = req.user!.name;
      deck.updatedAt = nowDate;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: `PRESENTATION_${deck.approvalStatus.toUpperCase()}`,
        entityType: 'RedesignedPresentationDeck',
        entityId: deck.id,
        detail: `${req.user!.name} updated "${deck.redesignedTitle}" to ${deck.approvalStatus}.`,
      });
      saveDb();
      res.json({ deck });
    },
  );
}
