import type { Express, RequestHandler } from 'express';
import type {
  ComputerSkillAttempt,
  ComputerSkillBenchmark,
  ComputerSkillChecklistItem,
  ComputerSkillTaskResult,
  SchoolClassNumber,
  SsbDailyAssignment,
  SsbEnrollmentRecord,
  StudentRecord,
  ThinkingMonthlySetUsage,
  ThinkingTestType,
  UserRole,
} from '../src/types';
import { getDb, saveDb } from './store.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import {
  buildDailySsbAssignmentsForStudent,
  extractClassNumber,
  findMonthlySetUsage,
  generateMonthlyThinkingSet,
  getCurrentDateKey,
  getCurrentMonthKey,
} from '../src/utils/thinkingMonthlyBank.ts';
import {
  computeChecklistCompletionPct,
  computeComputerSkillGrade,
  createDefaultComputerSkillBenchmarks,
  evaluateTypingPerformance,
} from '../src/utils/computerSkillEngine.ts';

export interface SsbAndComputerSkillDeps {
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
// SEED HELPERS
// ============================================================================

export function createInitialSsbEnrollments(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): SsbEnrollmentRecord[] {
  const out: SsbEnrollmentRecord[] = [];
  const now = new Date().toISOString();

  for (const schoolId of params.schoolIds) {
    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    const eligible = schoolStudents.filter((s) =>
      /(?:^|\D)([6-9]|1[0-2])(?:\D|$)/.test(s.classSection || ''),
    );
    const picked = (eligible.length > 0 ? eligible : schoolStudents).slice(0, 3);
    for (const st of picked) {
      out.push({
        id: `ssb-enr-${schoolId}-${st.id}`,
        schoolId,
        studentId: st.id,
        studentName: st.name,
        classSection: st.classSection,
        enrolled: true,
        batchName: 'SSB Foundation & OLQ Daily Batch',
        enrolledBy: 'School Counsellor',
        enrolledAt: now,
        updatedAt: now,
      });
    }
  }
  return out;
}

export function createInitialSsbDailyAssignments(params: {
  enrollments: SsbEnrollmentRecord[];
}): SsbDailyAssignment[] {
  const today = getCurrentDateKey();
  const out: SsbDailyAssignment[] = [];
  for (const enr of params.enrollments) {
    if (!enr.enrolled) continue;
    const generated = buildDailySsbAssignmentsForStudent({
      schoolId: enr.schoolId,
      studentId: enr.studentId,
      studentName: enr.studentName,
      classSection: enr.classSection,
      dateKey: today,
      existing: out,
    });
    out.push(...generated);
  }
  return out;
}

export function createInitialComputerSkillBenchmarksAllSchools(
  schoolIds: string[],
): ComputerSkillBenchmark[] {
  return schoolIds.flatMap((schoolId) => createDefaultComputerSkillBenchmarks(schoolId));
}

export function createInitialComputerSkillAttempts(params: {
  schoolIds: string[];
  students: StudentRecord[];
  benchmarks: ComputerSkillBenchmark[];
}): ComputerSkillAttempt[] {
  const out: ComputerSkillAttempt[] = [];
  const now = new Date();
  for (const schoolId of params.schoolIds) {
    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    const eligible = schoolStudents.filter((s) =>
      /(?:^|\D)([6-9]|1[0-2])(?:\D|$)/.test(s.classSection || ''),
    );
    const picked = (eligible.length > 0 ? eligible : schoolStudents).slice(0, 2);

    picked.forEach((st, idx) => {
      const cls = extractClassNumber(st.classSection);
      const bench =
        params.benchmarks.find((b) => b.schoolId === schoolId && b.classLevel === cls) ||
        createDefaultComputerSkillBenchmarks(schoolId)[cls - 1];

      const netWpm = bench.targetWpm + (idx === 0 ? 5 : -2);
      const grossWpm = netWpm + 2;
      const accuracyPct = idx === 0 ? Math.min(99, bench.targetAccuracyPct + 4) : bench.targetAccuracyPct - 3;
      const typingBenchmarkMet = netWpm >= bench.targetWpm && accuracyPct >= bench.targetAccuracyPct;
      const typingScore = typingBenchmarkMet ? 94 : 74;

      const practicalResults: ComputerSkillTaskResult[] = bench.tasks.map((task, tIdx) => {
        const passed = idx === 0 || tIdx < 2;
        return {
          taskId: task.id,
          kind: task.kind,
          title: task.title,
          passed,
          score: passed ? task.points : Math.round(task.points * 0.4),
          maxScore: task.points,
          detail: passed ? 'Completed accurately according to class benchmark.' : 'Partial completion — needs practice.',
        };
      });

      const graded = computeComputerSkillGrade({
        typingScore,
        typingBenchmarkMet,
        practicalResults,
      });

      out.push({
        id: `cs-att-seed-${schoolId}-${idx + 1}`,
        schoolId,
        studentId: st.id,
        studentName: st.name,
        classSection: st.classSection,
        classLevel: cls,
        submittedAt: new Date(now.getTime() - (idx + 1) * 86_400_000).toISOString(),
        targetWpm: bench.targetWpm,
        targetAccuracyPct: bench.targetAccuracyPct,
        grossWpm,
        netWpm,
        accuracyPct,
        errorCount: idx === 0 ? 2 : 7,
        typingElapsedSec: bench.typingDurationSec,
        typingBenchmarkMet,
        typingScore,
        practicalResults,
        ...graded,
      });
    });
  }
  return out;
}

// Helper to ensure every enrolled SSB student in a school has today's 4 daily sets
export function ensureTodaySsbAssignmentsForSchool(schoolId: string): SsbDailyAssignment[] {
  const db = getDb();
  if (!Array.isArray(db.ssbEnrollments)) db.ssbEnrollments = [];
  if (!Array.isArray(db.ssbDailyAssignments)) db.ssbDailyAssignments = [];

  const today = getCurrentDateKey();
  const enrolled = db.ssbEnrollments.filter((e) => e.schoolId === schoolId && e.enrolled);
  let mutated = false;

  for (const enr of enrolled) {
    const added = buildDailySsbAssignmentsForStudent({
      schoolId,
      studentId: enr.studentId,
      studentName: enr.studentName,
      classSection: enr.classSection,
      dateKey: today,
      existing: db.ssbDailyAssignments,
    });
    if (added.length > 0) {
      db.ssbDailyAssignments.unshift(...added);
      mutated = true;
    }
  }

  if (mutated) saveDb();
  return db.ssbDailyAssignments.filter((a) => a.schoolId === schoolId);
}

// ============================================================================
// EXPRESS ROUTE REGISTRATION
// ============================================================================

export function registerSsbAndComputerSkillRoutes(
  app: Express,
  deps: SsbAndComputerSkillDeps,
): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // 1. GET monthly class-aligned thinking set (WAT 60, SRT 60@30s, TAT 11, PPDT 1/mo)
  app.get('/api/thinking/monthly-set', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    const { testType, classLevel, monthKey } = req.query as {
      testType?: ThinkingTestType;
      classLevel?: string;
      monthKey?: string;
    };

    if (!testType || !['SRT', 'WAT', 'TAT', 'PPDT'].includes(testType)) {
      res.status(400).json({ error: 'Valid testType (SRT | WAT | TAT | PPDT) is required.' });
      return;
    }

    const cls = extractClassNumber(classLevel || '6');
    const month = monthKey && /^\d{4}-\d{2}$/.test(monthKey) ? monthKey : getCurrentMonthKey();

    if (!Array.isArray(db.thinkingSetUsages)) db.thinkingSetUsages = [];
    const usage = findMonthlySetUsage(db.thinkingSetUsages, schoolId, cls, month, testType);
    const setVersion = usage?.setVersion ?? 1;
    const usedInMonth = Boolean(usage && usage.usedCount > 0);

    const set = generateMonthlyThinkingSet({
      schoolId,
      classLevel: cls,
      monthKey: month,
      testType,
      setVersion,
      usedInMonth,
    });

    res.json({ set, usage: usage || null });
  });

  // 2. POST regenerate a fresh monthly set once used in the current month
  app.post(
    '/api/thinking/monthly-set/regenerate',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const user = req.user!;
      const body = req.body as {
        testType?: ThinkingTestType;
        classLevel?: number | string;
        monthKey?: string;
      };

      if (!body.testType || !['SRT', 'WAT', 'TAT', 'PPDT'].includes(body.testType)) {
        res.status(400).json({ error: 'Valid testType (SRT | WAT | TAT | PPDT) is required.' });
        return;
      }

      const cls = extractClassNumber(body.classLevel ?? 6);
      const month =
        body.monthKey && /^\d{4}-\d{2}$/.test(body.monthKey)
          ? body.monthKey
          : getCurrentMonthKey();

      if (!Array.isArray(db.thinkingSetUsages)) db.thinkingSetUsages = [];
      let usage = findMonthlySetUsage(db.thinkingSetUsages, schoolId, cls, month, body.testType);

      const isStaff = [
        'super_admin',
        'school_admin',
        'principal',
        'coordinator',
        'counsellor',
        'teacher',
      ].includes(user.role);

      if (!isStaff && (!usage || usage.usedCount === 0)) {
        res.status(400).json({
          error:
            'Complete or use this month’s current set at least once before regenerating a new set.',
        });
        return;
      }

      const nowIso = new Date().toISOString();
      if (!usage) {
        usage = {
          id: `tmu-${schoolId}-c${cls}-${month}-${body.testType.toLowerCase()}`,
          schoolId,
          classLevel: cls,
          monthKey: month,
          testType: body.testType,
          setVersion: 2,
          usedCount: 0,
          usedByStudentIds: [],
          regeneratedAt: nowIso,
          regeneratedBy: user.name,
        };
        db.thinkingSetUsages.unshift(usage);
      } else {
        usage.setVersion += 1;
        usage.usedCount = 0;
        usage.usedByStudentIds = [];
        usage.regeneratedAt = nowIso;
        usage.regeneratedBy = user.name;
      }

      saveDb();
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'REGENERATED_MONTHLY_THINKING_SET',
        entityType: 'ThinkingMonthlySetUsage',
        entityId: usage.id,
        detail: `Regenerated ${body.testType} Set #${usage.setVersion} for Class ${cls} (${month}).`,
      });

      const set = generateMonthlyThinkingSet({
        schoolId,
        classLevel: cls,
        monthKey: month,
        testType: body.testType,
        setVersion: usage.setVersion,
        usedInMonth: false,
      });

      res.json({ set, usage });
    },
  );

  // 3. GET today's SSB daily assignments (auto-generates today's 4 sets for enrolled students)
  app.get('/api/thinking/ssb-daily', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    const user = req.user!;
    const all = ensureTodaySsbAssignmentsForSchool(schoolId);
    const today = getCurrentDateKey();

    const isStudentOrParent = user.role === 'student' || user.role === 'parent';
    const linked = new Set(user.linkedStudentIds || []);

    const assignments = all.filter((a) => {
      if (a.dateKey !== today) return false;
      if (isStudentOrParent && !linked.has(a.studentId)) return false;
      return true;
    });

    const enrollments = (db.ssbEnrollments || []).filter((e) => {
      if (e.schoolId !== schoolId) return false;
      if (isStudentOrParent && !linked.has(e.studentId)) return false;
      return true;
    });

    res.json({ dateKey: today, enrollments, assignments });
  });

  // 4. POST toggle SSB Class enrollment for a student (immediately assigns today's 4 tests if enrolled)
  app.post(
    '/api/thinking/ssb-enrollment',
    requireAuth,
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const user = req.user!;
      const body = req.body as {
        studentId?: string;
        enrolled?: boolean;
        batchName?: string;
      };

      const targetStudentId =
        user.role === 'student' ? user.linkedStudentIds?.[0] || body.studentId : body.studentId;
      const student = db.students.find(
        (s) => s.id === targetStudentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      if (!Array.isArray(db.ssbEnrollments)) db.ssbEnrollments = [];
      if (!Array.isArray(db.ssbDailyAssignments)) db.ssbDailyAssignments = [];

      const nowIso = new Date().toISOString();
      const nextEnrolled = body.enrolled !== undefined ? Boolean(body.enrolled) : true;
      let record = db.ssbEnrollments.find(
        (e) => e.schoolId === schoolId && e.studentId === student.id,
      );

      if (!record) {
        record = {
          id: `ssb-enr-${schoolId}-${student.id}`,
          schoolId,
          studentId: student.id,
          studentName: student.name,
          classSection: student.classSection,
          enrolled: nextEnrolled,
          batchName: body.batchName?.trim() || 'SSB Foundation & OLQ Daily Batch',
          enrolledBy: user.name,
          enrolledAt: nowIso,
          updatedAt: nowIso,
        };
        db.ssbEnrollments.unshift(record);
      } else {
        record.enrolled = nextEnrolled;
        if (body.batchName?.trim()) record.batchName = body.batchName.trim();
        record.updatedAt = nowIso;
      }

      let todayAssignments: SsbDailyAssignment[] = [];
      if (record.enrolled) {
        const today = getCurrentDateKey();
        const created = buildDailySsbAssignmentsForStudent({
          schoolId,
          studentId: student.id,
          studentName: student.name,
          classSection: student.classSection,
          dateKey: today,
          existing: db.ssbDailyAssignments,
        });
        if (created.length > 0) {
          db.ssbDailyAssignments.unshift(...created);
        }
        todayAssignments = db.ssbDailyAssignments.filter(
          (a) => a.schoolId === schoolId && a.studentId === student.id && a.dateKey === today,
        );
      }

      saveDb();
      appendAuditLog({
        schoolId,
        actor: user,
        action: record.enrolled ? 'ENROLLED_SSB_DAILY_CLASSES' : 'UNENROLLED_SSB_DAILY_CLASSES',
        entityType: 'SsbEnrollmentRecord',
        entityId: record.id,
        detail: `${student.name} (${student.classSection}) ${
          record.enrolled ? 'enrolled in' : 'removed from'
        } ${record.batchName}.`,
      });

      res.json({ enrollment: record, todayAssignments });
    },
  );

  // 5. PUT update Class 1-12 Computer Skill Benchmark (WPM, accuracy %, duration, passage)
  app.put(
    '/api/computer-skills/benchmarks',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const body = req.body as {
        classLevel?: number;
        targetWpm?: number;
        targetAccuracyPct?: number;
        typingDurationSec?: number;
        typingPassage?: string;
      };

      const cls = extractClassNumber(body.classLevel ?? 6) as SchoolClassNumber;
      if (!Array.isArray(db.computerSkillBenchmarks)) {
        db.computerSkillBenchmarks = createDefaultComputerSkillBenchmarks(schoolId);
      }

      let bench = db.computerSkillBenchmarks.find(
        (b) => b.schoolId === schoolId && b.classLevel === cls,
      );
      if (!bench) {
        const defaults = createDefaultComputerSkillBenchmarks(schoolId);
        db.computerSkillBenchmarks.push(...defaults);
        bench = defaults.find((b) => b.classLevel === cls)!;
      }

      if (body.targetWpm !== undefined) {
        bench.targetWpm = Math.max(5, Math.min(100, Math.round(Number(body.targetWpm) || bench.targetWpm)));
      }
      if (body.targetAccuracyPct !== undefined) {
        bench.targetAccuracyPct = Math.max(
          60,
          Math.min(100, Math.round(Number(body.targetAccuracyPct) || bench.targetAccuracyPct)),
        );
      }
      if (body.typingDurationSec !== undefined) {
        bench.typingDurationSec = Math.max(
          30,
          Math.min(300, Math.round(Number(body.typingDurationSec) || bench.typingDurationSec)),
        );
      }
      if (body.typingPassage && body.typingPassage.trim().length >= 20) {
        bench.typingPassage = body.typingPassage.trim();
      }
      bench.updatedBy = req.user!.name;
      bench.updatedAt = new Date().toISOString().slice(0, 10);

      saveDb();
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_COMPUTER_SKILL_BENCHMARK',
        entityType: 'ComputerSkillBenchmark',
        entityId: bench.id,
        detail: `Updated Class ${cls} benchmark to ${bench.targetWpm} WPM / ${bench.targetAccuracyPct}% accuracy.`,
      });

      res.json({ benchmark: bench });
    },
  );

  // 6. POST submit a Computer Skill Test attempt (Typing + Practical Skills)
  app.post('/api/computer-skills/attempts', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    const user = req.user!;
    const body = req.body as {
      studentId?: string;
      classLevel?: number;
      typedText?: string;
      typingElapsedSec?: number;
      practicalResults?: ComputerSkillTaskResult[];
      competencyChecklist?: ComputerSkillChecklistItem[];
    };

    const resolvedStudentId =
      user.role === 'student' ? user.linkedStudentIds?.[0] || body.studentId : body.studentId;
    const student = db.students.find((s) => s.id === resolvedStudentId && s.schoolId === schoolId);
    if (!student) {
      res.status(404).json({ error: 'Student not found in active school.' });
      return;
    }

    const cls = extractClassNumber(body.classLevel ?? student.classSection);
    if (!Array.isArray(db.computerSkillBenchmarks)) {
      db.computerSkillBenchmarks = createDefaultComputerSkillBenchmarks(schoolId);
    }
    const bench =
      db.computerSkillBenchmarks.find((b) => b.schoolId === schoolId && b.classLevel === cls) ||
      createDefaultComputerSkillBenchmarks(schoolId)[cls - 1];

    const typingEval = evaluateTypingPerformance({
      passage: bench.typingPassage,
      typedText: String(body.typedText || ''),
      elapsedSec: Math.max(5, Number(body.typingElapsedSec) || bench.typingDurationSec),
      targetWpm: bench.targetWpm,
      targetAccuracyPct: bench.targetAccuracyPct,
    });

    const practicalResults: ComputerSkillTaskResult[] = Array.isArray(body.practicalResults)
      ? body.practicalResults.map((r) => ({
          taskId: String(r.taskId),
          kind: r.kind,
          title: String(r.title),
          passed: Boolean(r.passed),
          score: Math.max(0, Math.min(Number(r.maxScore) || 35, Number(r.score) || 0)),
          maxScore: Math.max(1, Number(r.maxScore) || 35),
          detail: String(r.detail || ''),
          checklistItems: Array.isArray(r.checklistItems)
            ? r.checklistItems.map((ci) => ({
                id: String(ci.id),
                label: String(ci.label),
                completed: Boolean(ci.completed),
                autoVerified: Boolean(ci.autoVerified),
                category: ci.category === 'competency_check' ? 'competency_check' : 'sandbox_step',
              }))
            : undefined,
        }))
      : [];

    const competencyChecklist: ComputerSkillChecklistItem[] | undefined = Array.isArray(
      body.competencyChecklist,
    )
      ? body.competencyChecklist.map((ci) => ({
          id: String(ci.id),
          label: String(ci.label),
          completed: Boolean(ci.completed),
          autoVerified: false,
          category: 'competency_check',
        }))
      : undefined;

    const allChecklistItems = [
      ...practicalResults.flatMap((r) => r.checklistItems || []),
      ...(competencyChecklist || []),
    ];
    const checklistCompletionPct =
      allChecklistItems.length > 0 ? computeChecklistCompletionPct(allChecklistItems) : undefined;

    const graded = computeComputerSkillGrade({
      typingScore: typingEval.typingScore,
      typingBenchmarkMet: typingEval.benchmarkMet,
      practicalResults,
    });

    const attempt: ComputerSkillAttempt = {
      id: `cs-att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      classLevel: cls,
      submittedAt: new Date().toISOString(),
      targetWpm: bench.targetWpm,
      targetAccuracyPct: bench.targetAccuracyPct,
      grossWpm: typingEval.grossWpm,
      netWpm: typingEval.netWpm,
      accuracyPct: typingEval.accuracyPct,
      errorCount: typingEval.errorCount,
      typingElapsedSec: Math.round(Number(body.typingElapsedSec) || bench.typingDurationSec),
      typingBenchmarkMet: typingEval.benchmarkMet,
      typingScore: typingEval.typingScore,
      practicalResults,
      competencyChecklist,
      checklistCompletionPct,
      ...graded,
    };

    if (!Array.isArray(db.computerSkillAttempts)) db.computerSkillAttempts = [];
    db.computerSkillAttempts.unshift(attempt);
    saveDb();

    appendAuditLog({
      schoolId,
      actor: user,
      action: 'SUBMITTED_COMPUTER_SKILL_TEST',
      entityType: 'ComputerSkillAttempt',
      entityId: attempt.id,
      detail: `${student.name} (Class ${cls}) scored ${attempt.netWpm} WPM (${attempt.accuracyPct}% acc), practical ${attempt.practicalScore}%, grade ${attempt.grade}.`,
    });

    res.status(201).json({ attempt });
  });
}
