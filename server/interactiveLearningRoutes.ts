import type { Express, NextFunction, Request, Response } from 'express';
import type {
  DevelopmentEvidence,
  SchoolClassNumber,
  UserAccount,
  UserRole,
} from '../src/types';
import type {
  AbacusOperation,
  AbacusSessionMode,
  AbacusSessionRecord,
  ApprovalStatus,
  CoachOverrideRecord,
  DifficultyBand,
  GameFormatType,
  InteractiveGameAsset,
  InteractiveLearningAttempt,
  InteractiveLearningOverviewPayload,
  TeacherApprovalPolicyConfig,
} from '../src/types/interactiveLearning';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  analyzeChapterBlueprintWithGemini,
  GeminiApiError,
  generateCoachNarrativeWithGemini,
  generateInteractiveGameWithGemini,
} from './gemini.ts';
import { buildSeedInteractiveLearningForSchool } from './interactiveLearningSeed.ts';
import {
  ALL_20_GAME_FORMATS,
  buildBlueprintFromAnalysisInput,
  buildInteractiveLeaderboard,
  buildPersonalizedCoachPlan,
  calculateChapterCoverageScore,
  computeBalancedXp,
  selectBestGameFormatForConcept,
} from '../src/utils/interactiveLearningEngine.ts';
import { analyzeAbacusSessionCoach } from '../src/utils/abacusEngine.ts';
import {
  computeTeacherTeachingScope,
  filterStudentsForRole,
} from '../src/utils/roleVisibilityAudit.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface InteractiveLearningRouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (
    roles: UserRole[],
  ) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const VALID_APPROVALS = new Set<ApprovalStatus>(['Draft', 'Pending Review', 'Approved', 'Rejected']);
const VALID_DIFFICULTIES = new Set<DifficultyBand>(['Foundation', 'Intermediate', 'Advanced']);

function sanitizeStr(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, maxLen);
}

export function ensureInteractiveLearningInitialized(db: DatabaseState, schoolId: string): boolean {
  let mutated = false;
  if (!Array.isArray(db.chapterBlueprints)) {
    db.chapterBlueprints = [];
    mutated = true;
  }
  if (!Array.isArray(db.interactiveGames)) {
    db.interactiveGames = [];
    mutated = true;
  }
  if (!Array.isArray(db.experientialSimulations)) {
    db.experientialSimulations = [];
    mutated = true;
  }
  if (!Array.isArray(db.interactiveLearningAttempts)) {
    db.interactiveLearningAttempts = [];
    mutated = true;
  }
  if (!Array.isArray(db.abacusSessions)) {
    db.abacusSessions = [];
    mutated = true;
  }
  if (!Array.isArray(db.coachOverrides)) {
    db.coachOverrides = [];
    mutated = true;
  }
  if (!db.teacherApprovalPolicies || typeof db.teacherApprovalPolicies !== 'object') {
    db.teacherApprovalPolicies = {};
    mutated = true;
  }

  const hasSchoolBlueprints = db.chapterBlueprints.some((b) => b.schoolId === schoolId);
  if (!hasSchoolBlueprints) {
    const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];
    const sampleStu = db.students.find((s) => s.schoolId === schoolId) || null;
    const seeded = buildSeedInteractiveLearningForSchool({
      schoolId,
      board: school?.board || 'CBSE',
      academicSession: school?.session || '2026-27',
      sampleStudent: sampleStu
        ? { id: sampleStu.id, name: sampleStu.name, classSection: sampleStu.classSection }
        : null,
    });
    db.chapterBlueprints.push(...seeded.blueprints);
    db.interactiveGames.push(...seeded.games);
    db.experientialSimulations.push(...seeded.experientialAssets);
    db.interactiveLearningAttempts.push(...seeded.attempts);
    db.abacusSessions.push(...seeded.abacusSessions);
    if (!db.teacherApprovalPolicies[schoolId]) {
      db.teacherApprovalPolicies[schoolId] = seeded.approvalPolicy;
    }
    mutated = true;
  } else if (!db.teacherApprovalPolicies[schoolId]) {
    db.teacherApprovalPolicies[schoolId] = {
      schoolId,
      requireTeacherApprovalForAi: true,
      autoPublishTeacherEdits: false,
      allowStudentsPracticeDrafts: false,
      updatedBy: 'School Admin',
      updatedAt: new Date().toISOString(),
    };
    mutated = true;
  }

  return mutated;
}

export function buildInteractiveLearningOverviewForRole(params: {
  db: DatabaseState;
  schoolId: string;
  user: UserAccount;
}): InteractiveLearningOverviewPayload {
  const { db, schoolId, user } = params;
  ensureInteractiveLearningInitialized(db, schoolId);

  const policy: TeacherApprovalPolicyConfig = db.teacherApprovalPolicies![schoolId];
  const isFamily = user.role === 'parent' || user.role === 'student';

  const rawTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
  const teacherScope =
    user.role === 'teacher' ? computeTeacherTeachingScope(user, rawTimetable) : null;
  const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
  const visibleStudents = filterStudentsForRole({
    user,
    schoolStudents: allSchoolStudents,
    teacherScope,
  });
  const visibleStudentIds = new Set(visibleStudents.map((s) => s.id));

  const schoolBlueprints = (db.chapterBlueprints || []).filter((b) => b.schoolId === schoolId);
  const schoolGames = (db.interactiveGames || []).filter((g) => g.schoolId === schoolId);
  const schoolExp = (db.experientialSimulations || []).filter((e) => e.schoolId === schoolId);
  const schoolAttempts = (db.interactiveLearningAttempts || []).filter(
    (a) => a.schoolId === schoolId,
  );
  const schoolAbacus = (db.abacusSessions || []).filter((s) => s.schoolId === schoolId);
  const schoolOverrides = (db.coachOverrides || []).filter((o) => o.schoolId === schoolId);

  const coverageScores = schoolBlueprints.map((bp) =>
    calculateChapterCoverageScore({
      blueprint: bp,
      games: schoolGames,
      experientialAssets: schoolExp,
    }),
  );

  const allowUnapproved = !isFamily || policy.allowStudentsPracticeDrafts;

  const blueprints = allowUnapproved
    ? schoolBlueprints
    : schoolBlueprints.filter((b) => b.approvalStatus === 'Approved');
  const games = allowUnapproved
    ? schoolGames
    : schoolGames.filter((g) => g.approvalStatus === 'Approved');
  const experientialAssets = allowUnapproved
    ? schoolExp
    : schoolExp.filter((e) => e.approvalStatus === 'Approved');

  const attempts = isFamily
    ? schoolAttempts.filter((a) => visibleStudentIds.has(a.studentId))
    : schoolAttempts.filter((a) => visibleStudentIds.has(a.studentId));
  const abacusSessions = schoolAbacus.filter((s) => visibleStudentIds.has(s.studentId));
  const coachOverrides = schoolOverrides.filter((o) => visibleStudentIds.has(o.studentId));

  const leaderboard = buildInteractiveLeaderboard({
    students: allSchoolStudents,
    attempts: schoolAttempts,
    abacusSessions: schoolAbacus,
  });

  return {
    blueprints,
    coverageScores,
    games,
    experientialAssets,
    attempts,
    abacusSessions,
    coachOverrides,
    approvalPolicy: policy,
    leaderboard,
  };
}

export function registerInteractiveLearningRoutes(
  app: Express,
  deps: InteractiveLearningRouteDeps,
) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // 1. Overview (strictly tenant-isolated & role-scoped)
  app.get('/api/interactive-learning/overview', requireAuth, (req: AuthedRequest, res: Response) => {
    const db = getDb();
    const schoolId = req.activeSchoolId!;
    const mutated = ensureInteractiveLearningInitialized(db, schoolId);
    if (mutated) saveDb();

    const payload = buildInteractiveLearningOverviewForRole({
      db,
      schoolId,
      user: req.user!,
    });
    res.json(payload);
  });

  // 2. Module A — AI Chapter Intelligence Analyzer
  app.post(
    '/api/interactive-learning/blueprints/analyze',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    async (req: AuthedRequest, res: Response) => {
      try {
        const db = getDb();
        const schoolId = req.activeSchoolId!;
        ensureInteractiveLearningInitialized(db, schoolId);
        const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];

        const {
          classLevel,
          subject,
          chapterNumber,
          chapterTitle,
          textbookContent,
          pdfBase64,
          learningObjectives,
          teachingLanguage,
        } = req.body as {
          classLevel?: number;
          subject?: string;
          chapterNumber?: number;
          chapterTitle?: string;
          textbookContent?: string;
          pdfBase64?: string;
          learningObjectives?: string;
          teachingLanguage?: string;
        };

        const cls = Math.max(1, Math.min(12, Math.round(Number(classLevel) || 7))) as SchoolClassNumber;
        const cleanSubject = sanitizeStr(subject, 60);
        const cleanTitle = sanitizeStr(chapterTitle, 120);
        const cleanContent = sanitizeStr(textbookContent, 8000);
        const cleanPdf =
          typeof pdfBase64 === 'string' && pdfBase64.length > 100 && pdfBase64.length <= 8_000_000
            ? pdfBase64.replace(/^data:application\/pdf;base64,/, '')
            : undefined;
        const cleanLang = sanitizeStr(teachingLanguage, 40) || 'English';
        const chapNum = Math.max(1, Math.min(40, Math.round(Number(chapterNumber) || 1)));

        if (!cleanSubject || !cleanTitle || (!cleanPdf && cleanContent.length < 20)) {
          res.status(400).json({
            error:
              'Subject, chapter title, and either a textbook PDF or chapter notes (at least 20 characters) are required.',
          });
          return;
        }

        const ageGroup = cls <= 5 ? `${cls + 5}-${cls + 6} yrs` : `${cls + 4}-${cls + 6} yrs`;
        const aiData = await analyzeChapterBlueprintWithGemini({
          board: school.board,
          classLevel: cls,
          subject: cleanSubject,
          chapterNumber: chapNum,
          chapterTitle: cleanTitle,
          textbookContent: cleanContent,
          pdfBase64: cleanPdf,
          learningObjectives: sanitizeStr(learningObjectives, 600),
          teachingLanguage: cleanLang,
          ageGroup,
        });

        const blueprint = buildBlueprintFromAnalysisInput({
          schoolId,
          academicSession: school.session,
          board: school.board,
          classLevel: cls,
          subject: cleanSubject,
          chapterNumber: chapNum,
          chapterTitle: cleanTitle,
          teachingLanguage: cleanLang,
          ageGroup,
          createdBy: req.user!.name,
          aiData,
          aiGenerated: true,
        });

        const policy = db.teacherApprovalPolicies![schoolId];
        if (policy && !policy.requireTeacherApprovalForAi) {
          blueprint.approvalStatus = 'Approved';
          blueprint.approvedBy = req.user!.name;
          blueprint.approvedAt = new Date().toISOString();
          blueprint.concepts.forEach((c) => {
            c.explanationApproved = true;
          });
        }

        db.chapterBlueprints!.unshift(blueprint);
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'AI_ANALYZED_CHAPTER_BLUEPRINT',
          entityType: 'ChapterLearningBlueprint',
          entityId: blueprint.id,
          detail: `Analyzed Class ${cls} ${cleanSubject} Ch. ${chapNum}: ${cleanTitle} (${blueprint.concepts.length} concepts extracted, status: ${blueprint.approvalStatus}).`,
        });
        saveDb();

        const coverage = calculateChapterCoverageScore({
          blueprint,
          games: (db.interactiveGames || []).filter((g) => g.schoolId === schoolId),
          experientialAssets: (db.experientialSimulations || []).filter(
            (e) => e.schoolId === schoolId,
          ),
        });

        res.status(201).json({ blueprint, coverage });
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Unable to analyze chapter blueprint.',
        });
      }
    },
  );

  // 3. Module B — AI Interactive Game Generator (reusable chapter-level asset)
  app.post(
    '/api/interactive-learning/games/generate',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    async (req: AuthedRequest, res: Response) => {
      try {
        const db = getDb();
        const schoolId = req.activeSchoolId!;
        ensureInteractiveLearningInitialized(db, schoolId);

        const { chapterId, blueprintId, conceptId, gameFormat, difficulty, language } = req.body as {
          chapterId?: string;
          blueprintId?: string;
          conceptId?: string;
          gameFormat?: GameFormatType;
          difficulty?: DifficultyBand;
          language?: string;
        };

        const resolvedChapterId = chapterId || blueprintId;
        const blueprint = (db.chapterBlueprints || []).find(
          (b) => b.id === resolvedChapterId && b.schoolId === schoolId,
        );
        if (!blueprint) {
          res.status(404).json({ error: 'Chapter blueprint not found in active school.' });
          return;
        }
        const concept =
          blueprint.concepts.find((c) => c.conceptId === conceptId) || blueprint.concepts[0];
        if (!concept) {
          res.status(400).json({ error: 'Blueprint has no concepts to generate a game for.' });
          return;
        }

        const resolvedFormat: GameFormatType =
          gameFormat && ALL_20_GAME_FORMATS.includes(gameFormat)
            ? gameFormat
            : selectBestGameFormatForConcept({
                conceptTitle: concept.title,
                subject: blueprint.subject,
                classLevel: blueprint.classLevel,
                hasDiagramOrProcess: concept.diagramsAndProcesses.length > 0,
              });
        const resolvedDiff: DifficultyBand =
          difficulty && VALID_DIFFICULTIES.has(difficulty) ? difficulty : concept.difficulty;
        const resolvedLang = sanitizeStr(language, 40) || blueprint.teachingLanguage || 'English';

        const aiGame = await generateInteractiveGameWithGemini({
          board: blueprint.board,
          classLevel: blueprint.classLevel,
          subject: blueprint.subject,
          chapterTitle: blueprint.chapterTitle,
          conceptTitle: concept.title,
          learningObjective:
            concept.learningObjectives[0] || `Master ${concept.title} accurately.`,
          gameFormat: resolvedFormat,
          difficulty: resolvedDiff,
          language: resolvedLang,
        });

        const policy = db.teacherApprovalPolicies![schoolId];
        const autoApprove = Boolean(policy && !policy.requireTeacherApprovalForAi);
        const nowIso = new Date().toISOString();

        const gameAsset: InteractiveGameAsset = {
          id: `gm-${schoolId.slice(-6)}-${Date.now().toString(36)}`,
          schoolId,
          academicSession: blueprint.academicSession,
          classLevel: blueprint.classLevel,
          subject: blueprint.subject,
          chapterId: blueprint.id,
          chapterTitle: blueprint.chapterTitle,
          topicId: concept.topicId,
          conceptId: concept.conceptId,
          conceptTitle: concept.title,
          learningObjective:
            concept.learningObjectives[0] || `Master ${concept.title} accurately.`,
          assetType: 'game',
          gameFormat: resolvedFormat,
          difficulty: resolvedDiff,
          language: resolvedLang,
          title: aiGame.title,
          instructions: aiGame.instructions,
          timeLimitSec: resolvedFormat === 'timed_challenge' ? 90 : undefined,
          categories: aiGame.categories,
          items: aiGame.items,
          answerKeySummary: aiGame.answerKeySummary,
          scoringLogic: { pointsPerCorrect: 25, streakBonus: 5, masteryThresholdPct: 75 },
          sourceReference: concept.sourceReference,
          version: 1,
          approvalStatus: autoApprove ? 'Approved' : 'Pending Review',
          approvedBy: autoApprove ? req.user!.name : undefined,
          approvedAt: autoApprove ? nowIso : undefined,
          aiGenerated: true,
          updatedAt: nowIso,
        };

        db.interactiveGames!.unshift(gameAsset);
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'GENERATED_INTERACTIVE_GAME_ASSET',
          entityType: 'InteractiveGameAsset',
          entityId: gameAsset.id,
          detail: `Generated ${resolvedFormat} game "${gameAsset.title}" for Class ${blueprint.classLevel} ${blueprint.subject} (${gameAsset.approvalStatus}).`,
        });
        saveDb();

        res.status(201).json({ game: gameAsset });
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Unable to generate interactive game.',
        });
      }
    },
  );

  // 4. Module G — Teacher Review, Edit, Assign & Approve/Reject Assets
  app.patch(
    '/api/interactive-learning/assets/:kind/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureInteractiveLearningInitialized(db, schoolId);
      const { kind, id } = req.params;
      const {
        approvalStatus,
        difficulty,
        title,
        instructions,
        assignedDeadline,
        assignedClassSections,
        conceptExplanations,
      } = req.body as {
        approvalStatus?: ApprovalStatus;
        difficulty?: DifficultyBand;
        title?: string;
        instructions?: string;
        assignedDeadline?: string;
        assignedClassSections?: string[];
        conceptExplanations?: Record<string, string>;
      };

      const nowIso = new Date().toISOString();

      if (kind === 'blueprint') {
        const bp = (db.chapterBlueprints || []).find((b) => b.id === id && b.schoolId === schoolId);
        if (!bp) {
          res.status(404).json({ error: 'Chapter blueprint not found.' });
          return;
        }
        if (conceptExplanations && typeof conceptExplanations === 'object') {
          for (const c of bp.concepts) {
            if (typeof conceptExplanations[c.conceptId] === 'string') {
              c.explanation = sanitizeStr(conceptExplanations[c.conceptId], 800) || c.explanation;
            }
          }
        }
        if (approvalStatus && VALID_APPROVALS.has(approvalStatus)) {
          bp.approvalStatus = approvalStatus;
          if (approvalStatus === 'Approved') {
            bp.approvedBy = req.user!.name;
            bp.approvedAt = nowIso;
            bp.concepts.forEach((c) => {
              c.explanationApproved = true;
              if (c.eligibleComponents.assessment) c.hasApprovedAssessment = true;
              if (c.eligibleComponents.visual) c.hasApprovedVisualExplanation = true;
            });
          }
        }
        bp.version += 1;
        bp.updatedAt = nowIso;

        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'REVIEWED_CHAPTER_BLUEPRINT',
          entityType: 'ChapterLearningBlueprint',
          entityId: bp.id,
          detail: `Updated blueprint "${bp.chapterTitle}" -> status: ${bp.approvalStatus} (v${bp.version}).`,
        });
        saveDb();
        res.json({ blueprint: bp });
        return;
      }

      if (kind === 'game') {
        const game = (db.interactiveGames || []).find((g) => g.id === id && g.schoolId === schoolId);
        if (!game) {
          res.status(404).json({ error: 'Interactive game asset not found.' });
          return;
        }
        if (title) game.title = sanitizeStr(title, 120) || game.title;
        if (instructions) game.instructions = sanitizeStr(instructions, 400) || game.instructions;
        if (difficulty && VALID_DIFFICULTIES.has(difficulty)) game.difficulty = difficulty;
        if (assignedDeadline !== undefined) {
          game.assignedDeadline = sanitizeStr(assignedDeadline, 20) || undefined;
        }
        if (Array.isArray(assignedClassSections)) {
          game.assignedClassSections = assignedClassSections
            .map((s) => sanitizeStr(s, 20))
            .filter(Boolean);
        }
        if (approvalStatus && VALID_APPROVALS.has(approvalStatus)) {
          game.approvalStatus = approvalStatus;
          if (approvalStatus === 'Approved') {
            game.approvedBy = req.user!.name;
            game.approvedAt = nowIso;
          }
        }
        game.version += 1;
        game.updatedAt = nowIso;

        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'REVIEWED_INTERACTIVE_GAME',
          entityType: 'InteractiveGameAsset',
          entityId: game.id,
          detail: `Updated game "${game.title}" -> status: ${game.approvalStatus} (v${game.version}).`,
        });
        saveDb();
        res.json({ game });
        return;
      }

      if (kind === 'experiential') {
        const sim = (db.experientialSimulations || []).find(
          (e) => e.id === id && e.schoolId === schoolId,
        );
        if (!sim) {
          res.status(404).json({ error: 'Experiential asset not found.' });
          return;
        }
        if (title) sim.title = sanitizeStr(title, 120) || sim.title;
        if (instructions) sim.instructions = sanitizeStr(instructions, 400) || sim.instructions;
        if (difficulty && VALID_DIFFICULTIES.has(difficulty)) sim.difficulty = difficulty;
        if (assignedDeadline !== undefined) {
          sim.assignedDeadline = sanitizeStr(assignedDeadline, 20) || undefined;
        }
        if (Array.isArray(assignedClassSections)) {
          sim.assignedClassSections = assignedClassSections
            .map((s) => sanitizeStr(s, 20))
            .filter(Boolean);
        }
        if (approvalStatus && VALID_APPROVALS.has(approvalStatus)) {
          sim.approvalStatus = approvalStatus;
          if (approvalStatus === 'Approved') {
            sim.approvedBy = req.user!.name;
            sim.approvedAt = nowIso;
          }
        }
        sim.version += 1;
        sim.updatedAt = nowIso;
        appendAuditLog({
          schoolId,
          actor: req.user!,
          action: 'REVIEWED_EXPERIENTIAL_LAB',
          entityType: 'ExperientialSimulationAsset',
          entityId: sim.id,
          detail: `Updated experiential lab "${sim.title}" -> status: ${sim.approvalStatus} (v${sim.version}).`,
        });
        saveDb();
        res.json({ experiential: sim });
        return;
      }

      res.status(400).json({ error: 'Unknown asset kind.' });
    },
  );

  // 5. School Admin Approval Policy Config
  app.patch(
    '/api/interactive-learning/policy',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res: Response) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureInteractiveLearningInitialized(db, schoolId);
      const current = db.teacherApprovalPolicies![schoolId];
      const { requireTeacherApprovalForAi, autoPublishTeacherEdits, allowStudentsPracticeDrafts } =
        req.body as Partial<TeacherApprovalPolicyConfig>;

      const updated: TeacherApprovalPolicyConfig = {
        ...current,
        requireTeacherApprovalForAi:
          typeof requireTeacherApprovalForAi === 'boolean'
            ? requireTeacherApprovalForAi
            : current.requireTeacherApprovalForAi,
        autoPublishTeacherEdits:
          typeof autoPublishTeacherEdits === 'boolean'
            ? autoPublishTeacherEdits
            : current.autoPublishTeacherEdits,
        allowStudentsPracticeDrafts:
          typeof allowStudentsPracticeDrafts === 'boolean'
            ? allowStudentsPracticeDrafts
            : current.allowStudentsPracticeDrafts,
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString(),
      };
      db.teacherApprovalPolicies![schoolId] = updated;
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_AI_APPROVAL_POLICY',
        entityType: 'TeacherApprovalPolicyConfig',
        entityId: schoolId,
        detail: `AI approval required: ${updated.requireTeacherApprovalForAi}, Draft practice: ${updated.allowStudentsPracticeDrafts}.`,
      });
      saveDb();
      res.json({ policy: updated });
    },
  );

  // 6. Module H & I — Auto-Save & Complete Student Attempt + Evidence Integration
  app.post(
    '/api/interactive-learning/attempts',
    requireAuth,
    (req: AuthedRequest, res: Response) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureInteractiveLearningInitialized(db, schoolId);

      const {
        studentId,
        subject,
        chapterId,
        conceptId,
        assetId,
        assetTitle,
        assetType,
        status,
        progressPct,
        scorePct,
        accuracyPct,
        timeSpentSec,
        mistakes,
      } = req.body as Partial<InteractiveLearningAttempt>;

      // Resolve authorized student
      const user = req.user!;
      const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const linkedIds = user.linkedStudentIds || [];
      const targetStudent =
        user.role === 'student'
          ? allSchoolStudents.find((s) => linkedIds.includes(s.id)) ||
            allSchoolStudents.find((s) => s.name.toLowerCase() === user.name.toLowerCase()) ||
            allSchoolStudents[0]
          : user.role === 'parent'
            ? allSchoolStudents.find(
                (s) => s.id === studentId && linkedIds.includes(s.id),
              ) || allSchoolStudents.find((s) => linkedIds.includes(s.id))
            : allSchoolStudents.find((s) => s.id === studentId) || allSchoolStudents[0];

      if (!targetStudent) {
        res.status(404).json({ error: 'Authorized student record not found.' });
        return;
      }

      const cleanAssetId = sanitizeStr(assetId, 80);
      const cleanAssetTitle = sanitizeStr(assetTitle, 140) || 'Interactive Learning Activity';
      if (!cleanAssetId) {
        res.status(400).json({ error: 'assetId is required.' });
        return;
      }

      const boundedProgress = Math.max(0, Math.min(100, Math.round(Number(progressPct) || 0)));
      const boundedAccuracy = Math.max(0, Math.min(100, Math.round(Number(accuracyPct) || 0)));
      const boundedScore = Math.max(0, Math.min(100, Math.round(Number(scorePct) || boundedAccuracy)));
      const boundedTime = Math.max(1, Math.min(7200, Math.round(Number(timeSpentSec) || 15)));
      const cleanStatus: 'in_progress' | 'completed' =
        status === 'completed' || boundedProgress >= 100 ? 'completed' : 'in_progress';
      const cleanMistakes = Array.isArray(mistakes)
        ? mistakes.map((m) => sanitizeStr(m, 160)).filter(Boolean).slice(0, 12)
        : [];

      const existingIdx = db.interactiveLearningAttempts!.findIndex(
        (a) =>
          a.schoolId === schoolId &&
          a.studentId === targetStudent.id &&
          a.assetId === cleanAssetId,
      );
      const prev = existingIdx >= 0 ? db.interactiveLearningAttempts![existingIdx] : null;
      const xpEarned = computeBalancedXp({
        accuracyPct: boundedAccuracy,
        completed: cleanStatus === 'completed',
        previousBestAccuracyPct: prev ? prev.accuracyPct : null,
        timeSpentSec: boundedTime,
      });

      const nowIso = new Date().toISOString();
      const record: InteractiveLearningAttempt = {
        id: prev?.id || `ila-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        schoolId,
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        classSection: targetStudent.classSection,
        subject: sanitizeStr(subject, 60) || 'General',
        chapterId: sanitizeStr(chapterId, 80) || 'general',
        conceptId: sanitizeStr(conceptId, 80) || cleanAssetId,
        assetId: cleanAssetId,
        assetTitle: cleanAssetTitle,
        assetType:
          assetType === 'experiential' ||
          assetType === 'explanation' ||
          assetType === 'assessment' ||
          assetType === 'abacus'
            ? assetType
            : 'game',
        status: cleanStatus,
        progressPct: cleanStatus === 'completed' ? 100 : boundedProgress,
        scorePct: Math.max(prev?.scorePct || 0, boundedScore),
        accuracyPct: boundedAccuracy,
        timeSpentSec: (prev?.timeSpentSec || 0) + boundedTime,
        attemptsCount: (prev?.attemptsCount || 0) + 1,
        mistakes: cleanMistakes,
        xpEarned: Math.max(prev?.xpEarned || 0, xpEarned),
        updatedAt: nowIso,
        completedAt: cleanStatus === 'completed' ? nowIso : prev?.completedAt,
      };

      if (existingIdx >= 0) db.interactiveLearningAttempts![existingIdx] = record;
      else db.interactiveLearningAttempts!.unshift(record);

      // Bridge completed verified mastery directly into Rai Plus DevelopmentEvidence (Learners 360°)
      if (cleanStatus === 'completed') {
        const sourceKey = `interactive:${targetStudent.id}:${cleanAssetId}`;
        const ev: DevelopmentEvidence = {
          id: `ev-${record.id}`,
          schoolId,
          studentId: targetStudent.id,
          sourceKey,
          sourceType: 'participation',
          subject: record.subject,
          date: nowIso.slice(0, 10),
          summary: `Interactive Learning (${record.assetTitle}): ${record.accuracyPct}% accuracy · ${record.xpEarned} XP`,
          olqContributions: {
            effective_intelligence: Math.max(55, Math.min(96, record.accuracyPct)),
            initiative: Math.max(65, Math.min(96, record.accuracyPct + 5)),
          },
          componentContributions: {
            academic: record.accuracyPct,
            learningHabits: Math.max(65, Math.min(96, record.accuracyPct + 4)),
          },
          learningSignals: {
            curiosityAndQuestions: Math.max(65, Math.min(96, record.accuracyPct + 5)),
            selfDirectedReadiness: Math.max(65, Math.min(96, record.accuracyPct + 4)),
          },
          enteredBy: user.name,
          validated: true,
        };
        const evIdx = db.evidence.findIndex(
          (e) => e.schoolId === schoolId && e.sourceKey === sourceKey,
        );
        if (evIdx >= 0) db.evidence[evIdx] = ev;
        else db.evidence.unshift(ev);
      }

      saveDb();
      res.status(201).json({ attempt: record });
    },
  );

  // 7. Module C — Abacus & Mental Maths Session Persistence + Coach Analysis
  app.post(
    '/api/interactive-learning/abacus/sessions',
    requireAuth,
    (req: AuthedRequest, res: Response) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureInteractiveLearningInitialized(db, schoolId);

      const {
        studentId,
        level,
        mode,
        operation,
        digits,
        questionsAttempted,
        correctCount,
        avgResponseSec,
        bestStreak,
        mistakes,
      } = req.body as {
        studentId?: string;
        level?: number;
        mode?: AbacusSessionMode;
        operation?: AbacusOperation;
        digits?: number;
        questionsAttempted?: number;
        correctCount?: number;
        avgResponseSec?: number;
        bestStreak?: number;
        mistakes?: Array<{ expected: number; actual: number; prompt: string }>;
      };

      const user = req.user!;
      const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const linkedIds = user.linkedStudentIds || [];
      const targetStudent =
        user.role === 'student'
          ? allSchoolStudents.find((s) => linkedIds.includes(s.id)) || allSchoolStudents[0]
          : user.role === 'parent'
            ? allSchoolStudents.find((s) => s.id === studentId && linkedIds.includes(s.id)) ||
              allSchoolStudents.find((s) => linkedIds.includes(s.id))
            : allSchoolStudents.find((s) => s.id === studentId) || allSchoolStudents[0];
      if (!targetStudent) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }

      const cleanLevel = Math.max(1, Math.min(12, Math.round(Number(level) || 1)));
      const attempted = Math.max(1, Math.min(100, Math.round(Number(questionsAttempted) || 1)));
      const correct = Math.max(0, Math.min(attempted, Math.round(Number(correctCount) || 0)));
      const accuracyPct = Math.round((correct / attempted) * 100);
      const avgSec = Math.max(0.5, Math.min(120, Math.round((Number(avgResponseSec) || 5) * 10) / 10));
      const cleanOp: AbacusOperation =
        operation && ['represent', 'add', 'subtract', 'multiply', 'divide', 'decimal'].includes(operation)
          ? operation
          : 'add';
      const cleanMode: AbacusSessionMode =
        mode && ['soroban_practice', 'mental_flash', 'speed_drill'].includes(mode)
          ? mode
          : 'soroban_practice';

      const coach = analyzeAbacusSessionCoach({
        level: cleanLevel,
        operation: cleanOp,
        accuracyPct,
        avgResponseSec: avgSec,
        mistakes: Array.isArray(mistakes) ? mistakes.slice(0, 20) : [],
      });

      const xpEarned = computeBalancedXp({
        accuracyPct,
        completed: true,
        timeSpentSec: Math.round(avgSec * attempted),
      });

      const session: AbacusSessionRecord = {
        id: `ab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
        schoolId,
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        classSection: targetStudent.classSection,
        level: cleanLevel,
        mode: cleanMode,
        operation: cleanOp,
        digits: Math.max(1, Math.min(5, Math.round(Number(digits) || 1))),
        questionsAttempted: attempted,
        correctCount: correct,
        accuracyPct,
        avgResponseSec: avgSec,
        bestStreak: Math.max(0, Math.min(attempted, Math.round(Number(bestStreak) || 0))),
        mistakePatterns: coach.mistakePatterns,
        coachFeedback: coach.coachFeedback,
        recommendedNextLevel: coach.recommendedNextLevel,
        xpEarned,
        completedAt: new Date().toISOString(),
      };

      db.abacusSessions!.unshift(session);
      saveDb();
      res.status(201).json({ session });
    },
  );

  // 8. Module E — AI Personalized Learning Coach (with optional live Gemini narrative + Teacher Override)
  app.post(
    '/api/interactive-learning/coach/recommend',
    requireAuth,
    async (req: AuthedRequest, res: Response) => {
      try {
        const db = getDb();
        const schoolId = req.activeSchoolId!;
        ensureInteractiveLearningInitialized(db, schoolId);

        const { studentId, useAiNarrative } = req.body as {
          studentId?: string;
          useAiNarrative?: boolean;
        };

        const user = req.user!;
        const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
        const linkedIds = user.linkedStudentIds || [];
        const targetStudent =
          user.role === 'student'
            ? allSchoolStudents.find((s) => linkedIds.includes(s.id)) || allSchoolStudents[0]
            : user.role === 'parent'
              ? allSchoolStudents.find((s) => s.id === studentId && linkedIds.includes(s.id)) ||
                allSchoolStudents.find((s) => linkedIds.includes(s.id))
              : allSchoolStudents.find((s) => s.id === studentId) || allSchoolStudents[0];

        if (!targetStudent) {
          res.status(404).json({ error: 'Student not found.' });
          return;
        }

        const override =
          (db.coachOverrides || []).find(
            (o) => o.schoolId === schoolId && o.studentId === targetStudent.id,
          ) || null;

        const plan = buildPersonalizedCoachPlan({
          studentId: targetStudent.id,
          blueprints: (db.chapterBlueprints || []).filter((b) => b.schoolId === schoolId),
          games: (db.interactiveGames || []).filter((g) => g.schoolId === schoolId),
          experientialAssets: (db.experientialSimulations || []).filter(
            (e) => e.schoolId === schoolId,
          ),
          attempts: (db.interactiveLearningAttempts || []).filter((a) => a.schoolId === schoolId),
          abacusSessions: (db.abacusSessions || []).filter((s) => s.schoolId === schoolId),
          examMarks: db.examMarks.filter((m) => m.schoolId === schoolId),
          teacherOverride: override,
        });

        let aiNarrative: { guidance: string; reTeachingTip: string } | null = null;
        if (useAiNarrative) {
          const stuAbacus = (db.abacusSessions || []).filter(
            (s) => s.schoolId === schoolId && s.studentId === targetStudent.id,
          );
          aiNarrative = await generateCoachNarrativeWithGemini({
            studentName: targetStudent.name,
            classSection: targetStudent.classSection,
            weakConcepts: plan.weakConcepts.map((w) => `${w.title} (${w.accuracyPct}%)`),
            strongConcepts: plan.strongConcepts.map((s) => `${s.title} (${s.accuracyPct}%)`),
            repeatedMistakes: plan.repeatedMistakes,
            abacusSummary:
              stuAbacus.length > 0
                ? `Level ${stuAbacus[0].level}, ${stuAbacus[0].accuracyPct}% accuracy`
                : 'Not yet started',
          });
        }

        res.json({ plan, aiNarrative });
      } catch (err) {
        if (err instanceof GeminiApiError) {
          res.status(err.statusCode).json({ error: err.message });
          return;
        }
        res.status(500).json({
          error: err instanceof Error ? err.message : 'Unable to generate coach recommendation.',
        });
      }
    },
  );

  // Teacher override of AI Coach recommendations
  app.put(
    '/api/interactive-learning/coach/override',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureInteractiveLearningInitialized(db, schoolId);

      const { studentId, recommendedDifficulty, focusConcepts, teacherNote } = req.body as {
        studentId?: string;
        recommendedDifficulty?: DifficultyBand;
        focusConcepts?: string[];
        teacherNote?: string;
      };

      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const record: CoachOverrideRecord = {
        id: `cov-${student.id}`,
        schoolId,
        studentId: student.id,
        recommendedDifficulty:
          recommendedDifficulty && VALID_DIFFICULTIES.has(recommendedDifficulty)
            ? recommendedDifficulty
            : undefined,
        focusConcepts: Array.isArray(focusConcepts)
          ? focusConcepts.map((c) => sanitizeStr(c, 80)).filter(Boolean).slice(0, 8)
          : [],
        teacherNote: sanitizeStr(teacherNote, 400),
        updatedBy: req.user!.name,
        updatedAt: new Date().toISOString(),
      };

      const idx = db.coachOverrides!.findIndex(
        (o) => o.schoolId === schoolId && o.studentId === student.id,
      );
      if (idx >= 0) db.coachOverrides![idx] = record;
      else db.coachOverrides!.unshift(record);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'OVERRIDDEN_AI_COACH_PLAN',
        entityType: 'CoachOverrideRecord',
        entityId: record.id,
        detail: `Teacher override saved for ${student.name} (difficulty: ${record.recommendedDifficulty || 'Auto'}).`,
      });
      saveDb();
      res.json({ override: record });
    },
  );
}
