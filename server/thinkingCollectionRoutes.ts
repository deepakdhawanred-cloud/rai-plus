import type { Express, NextFunction, Response } from 'express';
import { getDb, saveDb } from './store.ts';
import {
  getThinkingMigrationStatus,
  runThinkingAssessmentMigrations,
  syncSessionToThinkingCollections,
  THINKING_MIGRATION_MANIFEST,
  THINKING_OLQ_MAPPING_MATRIX,
} from './thinkingMigrations.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import type {
  OlqGroup,
  OlqKey,
  PpdtGroupDiscussionEvaluation,
  PpdtPerceptionDetails,
  TatStoryStructure,
  ThinkingQuestionItem,
  ThinkingTestType,
  UserAccount,
  UserRole,
} from '../src/types';
import {
  aggregateThinkingSession,
  createDefaultThinkingScoringConfig,
  evaluateSingleThinkingResponse,
} from '../src/utils/thinkingAssessmentEngine.ts';

interface ThinkingCollectionRouteDeps {
  requireAuth: (req: IntelligenceAuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (
    allowed: UserRole[],
  ) => (req: IntelligenceAuthedRequest, res: Response, next: NextFunction) => void;
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

function resolveScopedStudentFilter(
  user: UserAccount,
  requestedStudentId?: string,
): { allowedIds: Set<string> | null; effectiveStudentId?: string } {
  if (user.role === 'student' || user.role === 'parent') {
    const allowedIds = new Set(user.linkedStudentIds || []);
    const effective =
      requestedStudentId && allowedIds.has(requestedStudentId)
        ? requestedStudentId
        : undefined;
    return { allowedIds, effectiveStudentId: effective };
  }
  return { allowedIds: null, effectiveStudentId: requestedStudentId };
}

function createNormalizedFormatRecord(params: {
  req: IntelligenceAuthedRequest;
  testType: ThinkingTestType;
  body: {
    studentId?: string;
    questionId?: string;
    promptText?: string;
    title?: string;
    responseText?: string;
    storyText?: string;
    responseTimeMs?: number;
    timedMode?: boolean;
    timeLimitSec?: number;
    workflowMode?: 'Individual' | 'Group';
    tatStructure?: TatStoryStructure;
    storyStructure?: TatStoryStructure;
    ppdtPerception?: PpdtPerceptionDetails;
    perception?: PpdtPerceptionDetails;
    ppdtGroupEval?: PpdtGroupDiscussionEvaluation;
    groupDiscussion?: PpdtGroupDiscussionEvaluation;
  };
  appendAuditLog: ThinkingCollectionRouteDeps['appendAuditLog'];
}) {
  const { req, testType, body, appendAuditLog } = params;
  const db = getDb();
  const schoolId = req.activeSchoolId ?? db.schools[0].id;
  const user = req.user!;

  const targetStudentId =
    user.role === 'student' ? user.linkedStudentIds?.[0] || body.studentId : body.studentId;
  const student = db.students.find((s) => s.id === targetStudentId && s.schoolId === schoolId);
  if (!student) {
    return { status: 404 as const, payload: { error: 'Student not found in active school tenant.' } };
  }

  const responseText = (body.responseText || body.storyText || '').trim();
  if (responseText.length < 2) {
    return {
      status: 400 as const,
      payload: { error: 'A meaningful responseText (or storyText) of at least 2 characters is required.' },
    };
  }

  const resolvedTatStructure = body.tatStructure ?? body.storyStructure;
  const resolvedPpdtPerception = body.ppdtPerception ?? body.perception;
  const resolvedPpdtGroupEval = body.ppdtGroupEval ?? body.groupDiscussion;

  const scoreCfg =
    db.thinkingScoringConfigs[schoolId] || createDefaultThinkingScoringConfig(schoolId);
  const schoolQuestions = db.thinkingQuestionBank.filter((q) => q.schoolId === schoolId);
  const qMap = new Map(schoolQuestions.map((q) => [q.id, q]));

  const question: ThinkingQuestionItem =
    (body.questionId ? qMap.get(body.questionId) : undefined) || {
      id: body.questionId || `tq-inline-${testType.toLowerCase()}-${Date.now().toString(36)}`,
      schoolId,
      testType,
      title: body.title?.trim() || `${testType} Record`,
      prompt: body.promptText?.trim() || body.title?.trim() || `${testType} prompt`,
      ageBand: '11-17 yrs',
      classRange: student.classSection,
      difficulty: 'Intermediate',
      defaultTimeLimitSec: Math.max(15, Number(body.timeLimitSec) || 60),
      targetOlqs: ['effective_intelligence', 'reasoning_ability'],
      tags: [testType.toLowerCase()],
      active: true,
      createdBy: user.name,
      createdAt: new Date().toISOString().slice(0, 10),
    };

  if (!qMap.has(question.id)) {
    qMap.set(question.id, question);
  }

  const evaluated = evaluateSingleThinkingResponse({
    question,
    responseText,
    responseTimeMs: Math.max(500, Number(body.responseTimeMs) || 12000),
    config: scoreCfg,
    tatStructure: testType === 'TAT' ? resolvedTatStructure : undefined,
    ppdtPerception: testType === 'PPDT' ? resolvedPpdtPerception : undefined,
  });

  const nowIso = new Date().toISOString();
  const sessionId = `ts-${schoolId}-${testType.toLowerCase()}-${Date.now().toString(36)}`;
  const session = aggregateThinkingSession({
    id: sessionId,
    schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    testType,
    workflowMode: testType === 'PPDT' ? body.workflowMode || 'Individual' : 'Individual',
    timedMode: body.timedMode ?? true,
    timeLimitSec: Math.max(15, Number(body.timeLimitSec) || question.defaultTimeLimitSec),
    startedAt: nowIso,
    submittedAt: nowIso,
    responses: [evaluated],
    questionsById: qMap,
    ppdtGroupEval: testType === 'PPDT' ? resolvedPpdtGroupEval : undefined,
  });

  db.thinkingAssessments.unshift(session);
  const syncResult = syncSessionToThinkingCollections(db, session);

  const createdRecord =
    testType === 'SRT'
      ? db.srtRecords.find((r) => r.sessionId === session.id)
      : testType === 'WAT'
        ? db.watRecords.find((r) => r.sessionId === session.id)
        : testType === 'TAT'
          ? db.tatRecords.find((r) => r.sessionId === session.id)
          : db.ppdtRecords.find((r) => r.sessionId === session.id);

  const olqMappings = db.thinkingOlqMappings.filter((m) => m.sessionId === session.id);

  appendAuditLog({
    schoolId,
    actor: user,
    action: `CREATED_${testType}_COLLECTION_RECORD`,
    entityType: `${testType}Record`,
    entityId: createdRecord?.id || session.id,
    detail: `Stored normalized ${testType} record for ${student.name} (${student.classSection}) with ${olqMappings.length} OLQ signal mapping(s).`,
  });
  saveDb();

  return {
    status: 201 as const,
    payload: {
      record: createdRecord,
      session,
      olqMappings,
      syncResult,
    },
  };
}

export function registerThinkingCollectionRoutes(
  app: Express,
  deps: ThinkingCollectionRouteDeps,
): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // --------------------------------------------------------------------------
  // 1. SCHEMA MANIFEST & MIGRATION STATUS / RUNNER ENDPOINTS
  // --------------------------------------------------------------------------

  app.get('/api/thinking/collections/schema', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    res.json({
      collections: [
        {
          name: 'srtRecords',
          testType: 'SRT',
          description: 'Situation Reaction Test records with 10 SSB behavioural sub-dimensions',
        },
        {
          name: 'watRecords',
          testType: 'WAT',
          description: 'Word Association Test records with reaction latency, sentence construction & pattern tags',
        },
        {
          name: 'tatRecords',
          testType: 'TAT',
          description: 'Thematic Apperception Test records with structured narrative arc, 6 traits & story sequence',
        },
        {
          name: 'ppdtRecords',
          testType: 'PPDT',
          description: 'Picture Perception & Discussion Test records with character perception & GD rubric',
        },
        {
          name: 'thinkingOlqMappings',
          testType: 'ALL',
          description: 'Relational ledger mapping Thinking Assessment records onto existing 15 OLQ_DEFINITIONS & DevelopmentEvidence.sourceKey',
        },
      ],
      olqMappingMatrix: THINKING_OLQ_MAPPING_MATRIX,
      migrationManifest: THINKING_MIGRATION_MANIFEST,
      migrationStatus: getThinkingMigrationStatus(db, schoolId),
    });
  });

  app.get(
    '/api/thinking/migrations/status',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      res.json(getThinkingMigrationStatus(db, schoolId));
    },
  );

  app.post(
    '/api/thinking/migrations/run',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const forceIntegrityResync = Boolean((req.body as { forceResync?: boolean })?.forceResync);
      const report = runThinkingAssessmentMigrations(db, { forceIntegrityResync });
      if (report.mutated) {
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'EXECUTED_THINKING_DB_MIGRATION',
          entityType: 'DatabaseMigration',
          entityId: report.appliedVersions[report.appliedVersions.length - 1] || 'resync',
          detail: `Executed Thinking Assessment migration runner (applied: ${report.appliedVersions.length}, warnings: ${report.integrityWarnings.length}).`,
        });
        saveDb();
      }
      res.json({
        report,
        status: getThinkingMigrationStatus(db, schoolId),
      });
    },
  );

  // --------------------------------------------------------------------------
  // 2. SRT COLLECTION ENDPOINTS (`srtRecords`)
  // --------------------------------------------------------------------------

  app.get('/api/thinking/collections/srt', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const { studentId, difficulty, classRange } = req.query as {
      studentId?: string;
      difficulty?: string;
      classRange?: string;
    };
    const scope = resolveScopedStudentFilter(req.user!, studentId);

    const records = (db.srtRecords || []).filter((r) => {
      if (r.schoolId !== schoolId) return false;
      if (scope.allowedIds && !scope.allowedIds.has(r.studentId)) return false;
      if (scope.effectiveStudentId && r.studentId !== scope.effectiveStudentId) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (classRange && !r.classRange.toLowerCase().includes(classRange.toLowerCase())) return false;
      return true;
    });

    res.json({ collection: 'srtRecords', count: records.length, records });
  });

  app.post('/api/thinking/collections/srt', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const result = createNormalizedFormatRecord({
      req,
      testType: 'SRT',
      body: req.body,
      appendAuditLog,
    });
    res.status(result.status).json(result.payload);
  });

  // --------------------------------------------------------------------------
  // 3. WAT COLLECTION ENDPOINTS (`watRecords`)
  // --------------------------------------------------------------------------

  app.get('/api/thinking/collections/wat', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const { studentId, pattern } = req.query as { studentId?: string; pattern?: string };
    const scope = resolveScopedStudentFilter(req.user!, studentId);

    const records = (db.watRecords || []).filter((r) => {
      if (r.schoolId !== schoolId) return false;
      if (scope.allowedIds && !scope.allowedIds.has(r.studentId)) return false;
      if (scope.effectiveStudentId && r.studentId !== scope.effectiveStudentId) return false;
      if (pattern && r.underlyingPattern !== pattern && !r.patternTags.includes(pattern as never)) {
        return false;
      }
      return true;
    });

    res.json({ collection: 'watRecords', count: records.length, records });
  });

  app.post('/api/thinking/collections/wat', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const result = createNormalizedFormatRecord({
      req,
      testType: 'WAT',
      body: req.body,
      appendAuditLog,
    });
    res.status(result.status).json(result.payload);
  });

  // --------------------------------------------------------------------------
  // 4. TAT COLLECTION ENDPOINTS (`tatRecords`)
  // --------------------------------------------------------------------------

  app.get('/api/thinking/collections/tat', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const { studentId, sceneCode } = req.query as { studentId?: string; sceneCode?: string };
    const scope = resolveScopedStudentFilter(req.user!, studentId);

    const records = (db.tatRecords || []).filter((r) => {
      if (r.schoolId !== schoolId) return false;
      if (scope.allowedIds && !scope.allowedIds.has(r.studentId)) return false;
      if (scope.effectiveStudentId && r.studentId !== scope.effectiveStudentId) return false;
      if (sceneCode && r.sceneCode !== sceneCode) return false;
      return true;
    });

    res.json({ collection: 'tatRecords', count: records.length, records });
  });

  app.post('/api/thinking/collections/tat', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const result = createNormalizedFormatRecord({
      req,
      testType: 'TAT',
      body: req.body,
      appendAuditLog,
    });
    res.status(result.status).json(result.payload);
  });

  // --------------------------------------------------------------------------
  // 5. PPDT COLLECTION ENDPOINTS (`ppdtRecords`)
  // --------------------------------------------------------------------------

  app.get('/api/thinking/collections/ppdt', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const { studentId, workflowMode } = req.query as {
      studentId?: string;
      workflowMode?: 'Individual' | 'Group';
    };
    const scope = resolveScopedStudentFilter(req.user!, studentId);

    const records = (db.ppdtRecords || []).filter((r) => {
      if (r.schoolId !== schoolId) return false;
      if (scope.allowedIds && !scope.allowedIds.has(r.studentId)) return false;
      if (scope.effectiveStudentId && r.studentId !== scope.effectiveStudentId) return false;
      if (workflowMode && r.workflowMode !== workflowMode) return false;
      return true;
    });

    res.json({ collection: 'ppdtRecords', count: records.length, records });
  });

  app.post('/api/thinking/collections/ppdt', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const result = createNormalizedFormatRecord({
      req,
      testType: 'PPDT',
      body: req.body,
      appendAuditLog,
    });
    res.status(result.status).json(result.payload);
  });

  // --------------------------------------------------------------------------
  // 6. OLQ FRAMEWORK MAPPING LEDGER (`thinkingOlqMappings`)
  // --------------------------------------------------------------------------

  app.get(
    '/api/thinking/collections/olq-mappings',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const { studentId, testType, olqKey, olqGroup } = req.query as {
        studentId?: string;
        testType?: ThinkingTestType;
        olqKey?: OlqKey;
        olqGroup?: OlqGroup;
      };
      const scope = resolveScopedStudentFilter(req.user!, studentId);

      const mappings = (db.thinkingOlqMappings || []).filter((m) => {
        if (m.schoolId !== schoolId) return false;
        if (scope.allowedIds && !scope.allowedIds.has(m.studentId)) return false;
        if (scope.effectiveStudentId && m.studentId !== scope.effectiveStudentId) return false;
        if (testType && m.testType !== testType) return false;
        if (olqKey && m.olqKey !== olqKey) return false;
        if (olqGroup && m.olqGroup !== olqGroup) return false;
        return true;
      });

      const byOlqGroup: Record<string, { count: number; avgSignalScore: number; promotedCount: number }> =
        {};
      for (const m of mappings) {
        if (!byOlqGroup[m.olqGroup]) {
          byOlqGroup[m.olqGroup] = { count: 0, avgSignalScore: 0, promotedCount: 0 };
        }
        byOlqGroup[m.olqGroup].count += 1;
        byOlqGroup[m.olqGroup].avgSignalScore += m.rawSignalScore;
        if (m.promotedToEvidence) byOlqGroup[m.olqGroup].promotedCount += 1;
      }
      for (const grp of Object.values(byOlqGroup)) {
        grp.avgSignalScore = grp.count > 0 ? Math.round(grp.avgSignalScore / grp.count) : 0;
      }

      res.json({
        collection: 'thinkingOlqMappings',
        count: mappings.length,
        summaryByOlqGroup: byOlqGroup,
        mappings,
      });
    },
  );
}
