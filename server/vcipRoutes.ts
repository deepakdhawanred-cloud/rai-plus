import type { Express, RequestHandler } from 'express';
import type { StudentRecord, UserRole } from '../src/types';
import type {
  VcipAttemptRecord,
  VcipAuthoredQuestion,
  VcipBrainGymLog,
  VcipClassAssignment,
  VcipDomainId,
  VcipGovernanceConfig,
  VcipLanguage,
  VcipMode,
  VcipQuestionApprovalStatus,
} from '../src/types/vcip';
import { getDb, saveDb } from './store.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import { extractClassNumber } from '../src/utils/thinkingMonthlyBank.ts';
import {
  VCIP_SCORING_RULE_VERSION,
  computeVcipDomainScore,
} from '../src/utils/vcipScoringEngine.ts';
import { ALL_VCIP_DOMAINS } from '../src/utils/vcipQuestionBank.ts';

export interface VcipRouteDeps {
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

// ============================================================================
// SEED HELPERS (Multi-tenant, Realistic Longitudinal Developmental Baselines)
// ============================================================================

export function createInitialVcipAttempts(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): VcipAttemptRecord[] {
  const out: VcipAttemptRecord[] = [];
  const sampleBaseScores: Record<VcipDomainId, [number, number]> = {
    fluid_reasoning: [70, 82],
    working_memory: [64, 76],
    processing_speed: [68, 79],
    verbal_reasoning: [72, 81],
    quantitative_reasoning: [66, 78],
    spatial_reasoning: [62, 75],
  };

  for (const schoolId of params.schoolIds) {
    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    // Prioritize Class 5-12 students and ensure demo student accounts (e.g. Abhiraj) are always seeded
    const prioritized = [
      ...schoolStudents.filter((s) => /abhiraj|aarav|ananya|rohan|meera/i.test(s.name)),
      ...schoolStudents.filter((s) => extractClassNumber(s.classSection) >= 5),
      ...schoolStudents,
    ];
    const uniqueStudents = Array.from(new Map(prioritized.map((s) => [s.id, s])).values()).slice(0, 24);
    uniqueStudents.forEach((student, idx) => {
      const clsNum = extractClassNumber(student.classSection);
      const offset = ((idx % 5) - 2) * 4;

      // Two longitudinal assessment dates per domain for realistic historical comparison
      const dates = ['2026-09-18T09:30:00.000Z', '2026-11-12T10:15:00.000Z'];
      dates.forEach((iso, roundIdx) => {
        for (const domain of ALL_VCIP_DOMAINS) {
          const score = Math.min(96, Math.max(48, sampleBaseScores[domain][roundIdx] + offset));
          const totalQ = domain === 'processing_speed' ? 24 : 6;
          const correct =
            domain === 'processing_speed'
              ? Math.min(totalQ, Math.max(10, Math.round((score / 100) * 22)))
              : Math.min(6, Math.max(3, Math.round((score / 100) * 6)));
          const incorrect = Math.max(
            0,
            Math.min(totalQ - correct, domain === 'processing_speed' ? 2 : 6 - correct),
          );
          const acc = Math.round((correct / Math.max(1, correct + incorrect)) * 100);
          out.push({
            id: `vcip-seed-${schoolId}-${student.id}-${domain}-${roundIdx}`,
            schoolId,
            studentId: student.id,
            studentName: student.name,
            classSection: student.classSection,
            classLevel: clsNum,
            domain,
            mode: 'timed',
            language: domain === 'verbal_reasoning' && roundIdx === 0 ? 'hi' : 'en',
            totalQuestions: totalQ,
            correctAnswers: correct,
            incorrectAnswers: incorrect,
            skippedQuestions: Math.max(0, totalQ - correct - incorrect),
            accuracyPct: acc,
            avgResponseTimeMs:
              domain === 'processing_speed' ? 1950 - roundIdx * 120 : 10800 - roundIdx * 900,
            totalDurationSec: domain === 'processing_speed' ? 45 : 72 - roundIdx * 6,
            difficultyLevel: clsNum >= 9 ? 3 : 2,
            rawScore: correct,
            developmentalScore: score,
            speedAccuracyLabel: acc >= 80 ? 'Accurate & Methodical' : 'Developing Strategy',
            completionStatus: 'completed',
            scoringRuleVersion: VCIP_SCORING_RULE_VERSION,
            assessedAt: iso,
            counsellorNote:
              roundIdx === 1 && domain === 'fluid_reasoning'
                ? 'Demonstrates steady growth in visual rule synthesis; encourage 3D cube-net practice in Daily Brain Gym.'
                : undefined,
            counsellorReviewedBy:
              roundIdx === 1 && domain === 'fluid_reasoning' ? 'School Counsellor' : undefined,
            counsellorReviewedAt:
              roundIdx === 1 && domain === 'fluid_reasoning' ? '2026-11-14T11:00:00.000Z' : undefined,
          });
        }
      });
    });
  }

  return out;
}

export function createInitialVcipBrainGymLogs(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): VcipBrainGymLog[] {
  const out: VcipBrainGymLog[] = [];
  for (const schoolId of params.schoolIds) {
    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    const prioritized = [
      ...schoolStudents.filter((s) => /abhiraj|aarav|ananya|rohan|meera/i.test(s.name)),
      ...schoolStudents.filter((s) => extractClassNumber(s.classSection) >= 5),
      ...schoolStudents,
    ];
    const uniqueStudents = Array.from(new Map(prioritized.map((s) => [s.id, s])).values()).slice(0, 16);
    for (const student of uniqueStudents) {
      ['2026-11-18', '2026-11-19'].forEach((day, i) => {
        out.push({
          id: `bg-seed-${schoolId}-${student.id}-${day}`,
          schoolId,
          studentId: student.id,
          dateKey: day,
          completedChallenges: [
            'fluid_reasoning',
            'working_memory',
            'quantitative_reasoning',
            'verbal_reasoning',
            'spatial_reasoning',
          ],
          correctCount: 4 + (i % 2),
          totalCount: 5,
          durationSec: 325 - i * 20,
          completedAt: `${day}T08:20:00.000Z`,
        });
      });
    }
  }
  return out;
}

export function createInitialVcipAuthoredQuestions(schoolIds: string[]): VcipAuthoredQuestion[] {
  const now = '2026-11-10T09:00:00.000Z';
  const out: VcipAuthoredQuestion[] = [];
  for (const schoolId of schoolIds) {
    out.push(
      {
        id: `vcip-q-${schoolId}-1`,
        schoolId,
        domain: 'verbal_reasoning',
        category: 'Word Analogy',
        classTier: 'middle_6_8',
        language: 'en',
        difficulty: 2,
        prompt: 'Blueprint is to Architect as Score is to ____.',
        options: ['Composer', 'Mechanic', 'Botanist', 'Sculptor'],
        correctIndex: 0,
        explanation: 'An architect authors a blueprint to guide construction; a composer authors a musical score.',
        timeLimitSec: 45,
        sourceType: 'human_authored',
        approvalStatus: 'approved',
        version: 1,
        createdBy: 'School Counsellor',
        createdAt: now,
        approvedBy: 'Principal',
        approvedAt: now,
        updatedAt: now,
      },
      {
        id: `vcip-q-${schoolId}-2`,
        schoolId,
        domain: 'quantitative_reasoning',
        category: 'Number Series',
        classTier: 'secondary_9_10',
        language: 'en',
        difficulty: 2,
        prompt: 'Find the missing value in the sequence: 5, 11, 23, 47, ___',
        options: ['91', '94', '95', '96'],
        correctIndex: 2,
        explanation: 'Each term doubles the previous value and adds 1: 47 × 2 + 1 = 95.',
        timeLimitSec: 60,
        sourceType: 'ai_assisted',
        approvalStatus: 'pending_review',
        version: 1,
        createdBy: 'Academic Coordinator',
        createdAt: now,
        updatedAt: now,
      },
    );
  }
  return out;
}

export function createInitialVcipClassAssignments(schoolIds: string[]): VcipClassAssignment[] {
  const now = '2026-11-15T08:00:00.000Z';
  const out: VcipClassAssignment[] = [];
  for (const schoolId of schoolIds) {
    out.push(
      {
        id: `vcip-asg-${schoolId}-1`,
        schoolId,
        title: 'Term-2 Complete Cognitive Profile Baseline (Classes 6–12)',
        targetClass: 'Classes 6–12',
        domains: [...ALL_VCIP_DOMAINS],
        mode: 'timed',
        language: 'en',
        scheduledDate: '2026-11-18',
        dueDate: '2026-11-30',
        timeLimitMinutes: 35,
        status: 'active',
        assignedBy: 'School Counsellor',
        createdAt: now,
      },
      {
        id: `vcip-asg-${schoolId}-2`,
        schoolId,
        title: 'Bilingual Verbal & Spatial Practice Sprint (Class 5–8)',
        targetClass: 'Classes 5–8',
        domains: ['verbal_reasoning', 'spatial_reasoning'],
        mode: 'practice',
        language: 'hi',
        scheduledDate: '2026-11-20',
        dueDate: '2026-12-05',
        timeLimitMinutes: 15,
        status: 'scheduled',
        assignedBy: 'Academic Coordinator',
        createdAt: now,
      },
    );
  }
  return out;
}

export function createInitialVcipGovernanceConfigs(
  schoolIds: string[],
): Record<string, VcipGovernanceConfig> {
  const now = '2026-11-01T08:00:00.000Z';
  const out: Record<string, VcipGovernanceConfig> = {};
  for (const schoolId of schoolIds) {
    out[schoolId] = {
      schoolId,
      launchClassRange: 'classes_6_12',
      scoringRuleVersion: VCIP_SCORING_RULE_VERSION,
      parentAccessEnabled: true,
      requireGuardianConsent: true,
      retentionMonths: 36,
      accommodationsExtraTimePct: 25,
      updatedBy: 'Principal',
      updatedAt: now,
    };
  }
  return out;
}

// ============================================================================
// EXPRESS ROUTE REGISTRATION
// ============================================================================

const ADMIN_AUTHOR_ROLES: UserRole[] = [
  'super_admin',
  'school_admin',
  'principal',
  'coordinator',
  'counsellor',
];

export function registerVcipRoutes(app: Express, deps: VcipRouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // 1. Submit a VCIP Cognitive Domain Assessment Attempt
  app.post('/api/vcip/attempts', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId!;
    const body = req.body as {
      studentId?: string;
      domain?: VcipDomainId;
      mode?: VcipMode;
      language?: VcipLanguage;
      batterySessionId?: string;
      totalQuestions?: number;
      correctAnswers?: number;
      incorrectAnswers?: number;
      skippedQuestions?: number;
      totalDurationSec?: number;
      avgResponseTimeMs?: number;
      difficultyLevel?: 1 | 2 | 3;
      completionStatus?: 'completed' | 'partial';
    };

    if (!body.domain || !ALL_VCIP_DOMAINS.includes(body.domain)) {
      res.status(400).json({ error: 'Valid VCIP domain is required.' });
      return;
    }

    let targetStudentId = body.studentId;
    if (user.role === 'student' || user.role === 'parent') {
      const linked = user.linkedStudentIds || [];
      if (!targetStudentId || !linked.includes(targetStudentId)) {
        targetStudentId = linked[0];
      }
    }

    const student = db.students.find((s) => s.id === targetStudentId && s.schoolId === schoolId);
    if (!student) {
      res.status(404).json({ error: 'Target student not found in active school.' });
      return;
    }

    const totalQuestions = Math.max(1, Math.round(Number(body.totalQuestions) || 6));
    const correctAnswers = Math.min(totalQuestions, Math.max(0, Math.round(Number(body.correctAnswers) || 0)));
    const incorrectAnswers = Math.min(
      totalQuestions - correctAnswers,
      Math.max(0, Math.round(Number(body.incorrectAnswers) || 0)),
    );
    const skippedQuestions = Math.max(0, totalQuestions - correctAnswers - incorrectAnswers);
    const totalDurationSec = Math.max(1, Math.round(Number(body.totalDurationSec) || 30));
    const avgResponseTimeMs = Math.max(250, Math.round(Number(body.avgResponseTimeMs) || 4000));
    const difficultyLevel: 1 | 2 | 3 =
      body.difficultyLevel === 1 || body.difficultyLevel === 3 ? body.difficultyLevel : 2;
    const mode: VcipMode = body.mode === 'practice' ? 'practice' : 'timed';
    const language: VcipLanguage = body.language === 'hi' ? 'hi' : 'en';

    const computed = computeVcipDomainScore({
      domain: body.domain,
      mode,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      totalDurationSec,
      avgResponseTimeMs,
      difficultyLevel,
    });

    const record: VcipAttemptRecord = {
      id: `vcip-att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      classLevel: extractClassNumber(student.classSection),
      domain: body.domain,
      mode,
      language,
      batterySessionId: body.batterySessionId,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      accuracyPct: computed.accuracyPct,
      avgResponseTimeMs,
      totalDurationSec,
      difficultyLevel,
      rawScore: computed.rawScore,
      developmentalScore: computed.developmentalScore,
      speedAccuracyLabel: computed.speedAccuracyLabel,
      completionStatus: body.completionStatus === 'partial' ? 'partial' : 'completed',
      scoringRuleVersion: VCIP_SCORING_RULE_VERSION,
      assessedAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.vcipAttempts)) db.vcipAttempts = [];
    db.vcipAttempts.unshift(record);
    appendAuditLog({
      schoolId,
      actor: user,
      action: 'VCIP_ATTEMPT_RECORDED',
      entityType: 'vcip_attempt',
      entityId: record.id,
      detail: `${student.name} (${student.classSection}) completed ${body.domain} [${mode}/${language}] — internal developmental score ${record.developmentalScore}/100 (${record.accuracyPct}% accuracy).`,
    });
    saveDb();
    res.status(201).json(record);
  });

  // 2. Counsellor / Leadership Review & Observation on a VCIP Attempt
  app.patch(
    '/api/vcip/attempts/:attemptId/review',
    requireAuth,
    requireRoles(ADMIN_AUTHOR_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const { attemptId } = req.params;
      const { counsellorNote } = req.body as { counsellorNote?: string };

      if (!counsellorNote?.trim()) {
        res.status(400).json({ error: 'Counsellor observation note is required.' });
        return;
      }

      const target = (db.vcipAttempts || []).find(
        (a) => a.id === attemptId && a.schoolId === schoolId,
      );
      if (!target) {
        res.status(404).json({ error: 'VCIP assessment attempt not found in active school.' });
        return;
      }

      target.counsellorNote = counsellorNote.trim();
      target.counsellorReviewedBy = user.name;
      target.counsellorReviewedAt = new Date().toISOString();

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VCIP_COUNSELLOR_REVIEW_SAVED',
        entityType: 'vcip_attempt',
        entityId: target.id,
        detail: `Saved counsellor observation for ${target.studentName} (${target.domain}).`,
      });
      saveDb();
      res.json(target);
    },
  );

  // 3. Log Daily Brain Gym Session (Strictly separate from formal VCIP scores)
  app.post('/api/vcip/brain-gym', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId!;
    const body = req.body as {
      studentId?: string;
      dateKey?: string;
      completedChallenges?: VcipDomainId[];
      correctCount?: number;
      totalCount?: number;
      durationSec?: number;
    };

    let targetStudentId = body.studentId;
    if (user.role === 'student' || user.role === 'parent') {
      const linked = user.linkedStudentIds || [];
      if (!targetStudentId || !linked.includes(targetStudentId)) {
        targetStudentId = linked[0];
      }
    }
    const student = db.students.find((s) => s.id === targetStudentId && s.schoolId === schoolId);
    if (!student) {
      res.status(404).json({ error: 'Student not found in active school.' });
      return;
    }

    const log: VcipBrainGymLog = {
      id: `bg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      schoolId,
      studentId: student.id,
      dateKey: body.dateKey || new Date().toISOString().slice(0, 10),
      completedChallenges: Array.isArray(body.completedChallenges) ? body.completedChallenges : [],
      correctCount: Math.max(0, Math.round(Number(body.correctCount) || 0)),
      totalCount: Math.max(1, Math.round(Number(body.totalCount) || 5)),
      durationSec: Math.max(5, Math.round(Number(body.durationSec) || 60)),
      completedAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.vcipBrainGymLogs)) db.vcipBrainGymLogs = [];
    db.vcipBrainGymLogs.unshift(log);
    saveDb();
    res.status(201).json(log);
  });

  // 4. Authoring Studio: Create Original Question
  app.post(
    '/api/vcip/questions',
    requireAuth,
    requireRoles(ADMIN_AUTHOR_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const body = req.body as Partial<VcipAuthoredQuestion>;

      if (
        !body.domain ||
        !ALL_VCIP_DOMAINS.includes(body.domain) ||
        !body.prompt?.trim() ||
        !Array.isArray(body.options) ||
        body.options.filter((o) => o.trim()).length < 2
      ) {
        res.status(400).json({ error: 'Domain, prompt, and at least 2 answer options are required.' });
        return;
      }

      const cleanedOptions = body.options.map((o) => o.trim()).filter(Boolean);
      const correctIndex = Math.min(
        cleanedOptions.length - 1,
        Math.max(0, Math.round(Number(body.correctIndex) || 0)),
      );
      const sourceType = body.sourceType === 'ai_assisted' ? 'ai_assisted' : 'human_authored';
      // AI-generated/assisted questions MUST pass review before live use
      const approvalStatus: VcipQuestionApprovalStatus =
        sourceType === 'ai_assisted' ? 'pending_review' : 'draft';
      const now = new Date().toISOString();

      const item: VcipAuthoredQuestion = {
        id: `vcip-q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        domain: body.domain,
        category: (body.category || 'Original Item').trim(),
        classTier: body.classTier || 'middle_6_8',
        language: body.language === 'hi' ? 'hi' : 'en',
        difficulty: body.difficulty === 1 || body.difficulty === 3 ? body.difficulty : 2,
        prompt: body.prompt.trim(),
        diagramUrl: body.diagramUrl?.trim() || undefined,
        options: cleanedOptions,
        correctIndex,
        explanation: (body.explanation || 'Original authored reasoning solution.').trim(),
        timeLimitSec: Math.max(15, Math.min(300, Math.round(Number(body.timeLimitSec) || 60))),
        sourceType,
        approvalStatus,
        version: 1,
        createdBy: user.name,
        createdAt: now,
        updatedAt: now,
      };

      if (!Array.isArray(db.vcipAuthoredQuestions)) db.vcipAuthoredQuestions = [];
      db.vcipAuthoredQuestions.unshift(item);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VCIP_QUESTION_AUTHORED',
        entityType: 'vcip_question',
        entityId: item.id,
        detail: `Authored ${item.domain} v${item.version} (${item.sourceType}, status: ${item.approvalStatus}).`,
      });
      saveDb();
      res.status(201).json(item);
    },
  );

  // 5. Authoring Studio: Approve / Archive / Update Status
  app.patch(
    '/api/vcip/questions/:questionId/status',
    requireAuth,
    requireRoles(ADMIN_AUTHOR_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const { questionId } = req.params;
      const { approvalStatus } = req.body as { approvalStatus?: VcipQuestionApprovalStatus };

      if (!approvalStatus || !['draft', 'pending_review', 'approved', 'archived'].includes(approvalStatus)) {
        res.status(400).json({ error: 'Valid approvalStatus is required.' });
        return;
      }

      const item = (db.vcipAuthoredQuestions || []).find(
        (q) => q.id === questionId && q.schoolId === schoolId,
      );
      if (!item) {
        res.status(404).json({ error: 'Question not found in active school question bank.' });
        return;
      }

      item.approvalStatus = approvalStatus;
      item.version += 1;
      item.updatedAt = new Date().toISOString();
      if (approvalStatus === 'approved') {
        item.approvedBy = user.name;
        item.approvedAt = item.updatedAt;
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VCIP_QUESTION_STATUS_UPDATED',
        entityType: 'vcip_question',
        entityId: item.id,
        detail: `Updated question ${item.id} to ${approvalStatus} (v${item.version}).`,
      });
      saveDb();
      res.json(item);
    },
  );

  // 6. Schedule Class VCIP Assessment Assignment
  app.post(
    '/api/vcip/assignments',
    requireAuth,
    requireRoles(ADMIN_AUTHOR_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const body = req.body as Partial<VcipClassAssignment>;

      if (!body.title?.trim() || !body.targetClass?.trim()) {
        res.status(400).json({ error: 'Assignment title and targetClass are required.' });
        return;
      }
      const domains =
        Array.isArray(body.domains) && body.domains.length > 0
          ? body.domains.filter((d): d is VcipDomainId => ALL_VCIP_DOMAINS.includes(d))
          : [...ALL_VCIP_DOMAINS];

      const assignment: VcipClassAssignment = {
        id: `vcip-asg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        title: body.title.trim(),
        targetClass: body.targetClass.trim(),
        domains,
        mode: body.mode === 'practice' ? 'practice' : 'timed',
        language: body.language === 'hi' ? 'hi' : 'en',
        scheduledDate: body.scheduledDate || new Date().toISOString().slice(0, 10),
        dueDate: body.dueDate || new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10),
        timeLimitMinutes: Math.max(5, Math.min(90, Math.round(Number(body.timeLimitMinutes) || 35))),
        status: 'scheduled',
        assignedBy: user.name,
        createdAt: new Date().toISOString(),
      };

      if (!Array.isArray(db.vcipClassAssignments)) db.vcipClassAssignments = [];
      db.vcipClassAssignments.unshift(assignment);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VCIP_CLASS_ASSIGNMENT_SCHEDULED',
        entityType: 'vcip_assignment',
        entityId: assignment.id,
        detail: `Scheduled "${assignment.title}" for ${assignment.targetClass} (${domains.length} domains).`,
      });
      saveDb();
      res.status(201).json(assignment);
    },
  );

  // 7. Governance, Privacy & Consent Policy Config
  app.patch(
    '/api/vcip/governance',
    requireAuth,
    requireRoles(ADMIN_AUTHOR_ROLES),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const user = req.user!;
      const schoolId = req.activeSchoolId!;
      const body = req.body as Partial<VcipGovernanceConfig>;

      if (!db.vcipGovernanceConfigs) db.vcipGovernanceConfigs = {};
      const current = db.vcipGovernanceConfigs[schoolId] || {
        schoolId,
        launchClassRange: 'classes_6_12',
        scoringRuleVersion: VCIP_SCORING_RULE_VERSION,
        parentAccessEnabled: true,
        requireGuardianConsent: true,
        retentionMonths: 36,
        accommodationsExtraTimePct: 25,
        updatedBy: user.name,
        updatedAt: new Date().toISOString(),
      };

      const next: VcipGovernanceConfig = {
        ...current,
        launchClassRange:
          body.launchClassRange === 'classes_5_12' ? 'classes_5_12' : body.launchClassRange === 'classes_6_12' ? 'classes_6_12' : current.launchClassRange,
        parentAccessEnabled:
          typeof body.parentAccessEnabled === 'boolean'
            ? body.parentAccessEnabled
            : current.parentAccessEnabled,
        requireGuardianConsent:
          typeof body.requireGuardianConsent === 'boolean'
            ? body.requireGuardianConsent
            : current.requireGuardianConsent,
        retentionMonths:
          typeof body.retentionMonths === 'number'
            ? Math.max(6, Math.min(120, Math.round(body.retentionMonths)))
            : current.retentionMonths,
        accommodationsExtraTimePct:
          typeof body.accommodationsExtraTimePct === 'number'
            ? Math.max(0, Math.min(100, Math.round(body.accommodationsExtraTimePct)))
            : current.accommodationsExtraTimePct,
        updatedBy: user.name,
        updatedAt: new Date().toISOString(),
      };

      db.vcipGovernanceConfigs[schoolId] = next;
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'VCIP_GOVERNANCE_UPDATED',
        entityType: 'vcip_governance',
        entityId: schoolId,
        detail: `Updated VCIP launch range (${next.launchClassRange}), parentAccess=${next.parentAccessEnabled}, consent=${next.requireGuardianConsent}, retention=${next.retentionMonths}mo.`,
      });
      saveDb();
      res.json(next);
    },
  );
}
