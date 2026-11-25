import type { Express, NextFunction, Request, Response } from 'express';
import type {
  DevelopmentEvidence,
  ExamCategory,
  ExamMark,
  UserAccount,
  UserRole,
} from '../src/types';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  canTeacherAccessSubjectResource,
  computeTeacherTeachingScope,
  filterStudentsForRole,
  sanitizeStudentForRole,
} from '../src/utils/roleVisibilityAudit.ts';
import { calculateLearnersScore } from '../src/utils/evidenceEngine.ts';
import {
  buildStudentReportCard,
  EXAM_CATEGORIES,
  inferExamCategory,
} from '../src/utils/marksReportCardEngine.ts';
import { isVcipReleaseVisibleToFamily } from '../src/utils/vcipReleaseGovernanceEngine.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface MarksRouteDeps {
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

const VALID_TERMS = new Set(['Term 1', 'Term 2', 'Annual']);

function isValidExamCategory(value: unknown): value is ExamCategory {
  return typeof value === 'string' && EXAM_CATEGORIES.includes(value as ExamCategory);
}

function sanitizeText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function syncExamEvidence(params: {
  db: DatabaseState;
  schoolId: string;
  mark: ExamMark;
  enteredBy: string;
}) {
  const { db, schoolId, mark, enteredBy } = params;
  const pct = Math.round((mark.obtainedMarks / mark.maxMarks) * 100);
  const category = inferExamCategory(mark);
  const sourceKey = `exam:${mark.studentId}:${category.toLowerCase()}:${mark.examName.toLowerCase()}:${mark.subject.toLowerCase()}`;
  const ev: DevelopmentEvidence = {
    id: `ev-${mark.id}`,
    schoolId,
    studentId: mark.studentId,
    sourceKey,
    sourceType: 'exam',
    subject: mark.subject,
    date: mark.date,
    summary: `${category} · ${mark.examName} (${mark.subject}): ${mark.obtainedMarks}/${mark.maxMarks} (${pct}%)`,
    olqContributions: {
      effective_intelligence: Math.max(55, Math.min(96, pct)),
      reasoning_ability: Math.max(55, Math.min(96, pct)),
    },
    componentContributions: { academic: pct },
    learningSignals: {},
    enteredBy,
    validated: true,
  };
  const existingEvIdx = db.evidence.findIndex(
    (e) => e.schoolId === schoolId && (e.id === `ev-${mark.id}` || e.sourceKey === sourceKey),
  );
  if (existingEvIdx >= 0) db.evidence[existingEvIdx] = ev;
  else db.evidence.unshift(ev);
}

/**
 * Idempotently enriches a school's exam marks so legacy marks have explicit examType/term
 * and flagship students have representative Class Test, UT, and Semester Exam marks if missing.
 */
export function ensureMarksCategoriesInitialized(db: DatabaseState, schoolId: string): boolean {
  let mutated = false;
  const schoolMarks = db.examMarks.filter((m) => m.schoolId === schoolId);
  for (const mark of schoolMarks) {
    if (!mark.examType) {
      mark.examType = inferExamCategory(mark);
      mutated = true;
    }
    if (!mark.term) {
      mark.term = mark.examType === 'Semester Exam' ? 'Term 1' : 'Term 1';
      mutated = true;
    }
  }

  const hasClassTest = schoolMarks.some((m) => m.examType === 'Class Test');
  const hasUt = schoolMarks.some((m) => m.examType === 'UT');
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);

  if ((!hasClassTest || !hasUt) && schoolStudents.length > 0) {
    // Seed realistic Class Test & UT marks for the first 12 students across classes
    const sampleStudents = schoolStudents.slice(0, 12);
    const baseSubjects = ['Mathematics', 'Science', 'English'];
    sampleStudents.forEach((stu, idx) => {
      const seedOffset = (idx * 7) % 15;
      baseSubjects.forEach((subject, subIdx) => {
        if (!hasClassTest) {
          const ctId = `mk-seed-ct1-${stu.id}-${subject.toLowerCase()}`;
          if (!db.examMarks.some((m) => m.id === ctId)) {
            const obtained = Math.min(20, Math.max(11, 15 + ((seedOffset + subIdx * 2) % 6)));
            db.examMarks.push({
              id: ctId,
              schoolId,
              studentId: stu.id,
              examName: 'Class Test 1',
              examType: 'Class Test',
              term: 'Term 1',
              subject,
              maxMarks: 20,
              obtainedMarks: obtained,
              date: '2026-11-04',
              remarks:
                obtained >= 18
                  ? 'Accurate step-by-step recall and neat presentation.'
                  : obtained >= 14
                    ? 'Good conceptual grasp; revise application questions.'
                    : 'Needs extra practice on core chapter concepts.',
              enteredBy: 'Subject Teacher',
            });
            mutated = true;
          }
        }
        if (!hasUt) {
          const utId = `mk-seed-ut1-${stu.id}-${subject.toLowerCase()}`;
          if (!db.examMarks.some((m) => m.id === utId)) {
            const obtained = Math.min(40, Math.max(23, 29 + ((seedOffset + subIdx * 3) % 11)));
            db.examMarks.push({
              id: utId,
              schoolId,
              studentId: stu.id,
              examName: 'Unit Test 1 (UT-1)',
              examType: 'UT',
              term: 'Term 1',
              subject,
              maxMarks: 40,
              obtainedMarks: obtained,
              date: '2026-10-18',
              remarks:
                obtained >= 35
                  ? 'Strong mastery across objective and analytical questions.'
                  : 'Steady progress; focus on structured long-answer writing.',
              enteredBy: 'Subject Teacher',
            });
            mutated = true;
          }
        }
      });
    });
  }

  return mutated;
}

export function registerMarksRoutes(app: Express, deps: MarksRouteDeps) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Bulk save/update Class Test, UT, or Semester Exam marks for a class
  app.post(
    '/api/marks/batch',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const { classSection, examType, examName, subject, term, maxMarks, date, rows } =
        req.body as {
          classSection?: string;
          examType?: ExamCategory;
          examName?: string;
          subject?: string;
          term?: string;
          maxMarks?: number;
          date?: string;
          rows?: Array<{
            studentId: string;
            obtainedMarks: number;
            conceptualGap?: string;
            remarks?: string;
          }>;
        };

      const cleanClass = sanitizeText(classSection, 40);
      const cleanExamName = sanitizeText(examName, 80);
      const cleanSubject = sanitizeText(subject, 60);
      const cleanTerm = VALID_TERMS.has(String(term)) ? String(term) : 'Term 1';
      const cleanDate =
        typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
          ? date.trim()
          : new Date().toISOString().slice(0, 10);

      if (!cleanClass || !cleanExamName || !cleanSubject) {
        res.status(400).json({ error: 'Class section, exam name, and subject are required.' });
        return;
      }
      if (!isValidExamCategory(examType)) {
        res
          .status(400)
          .json({ error: 'Valid exam type (Class Test, UT, or Semester Exam) is required.' });
        return;
      }
      const max = Number(maxMarks);
      if (!Number.isFinite(max) || max < 1 || max > 500) {
        res.status(400).json({ error: 'Maximum marks must be a number between 1 and 500.' });
        return;
      }
      if (!Array.isArray(rows) || rows.length === 0 || rows.length > 200) {
        res.status(400).json({ error: 'Provide between 1 and 200 student mark rows.' });
        return;
      }

      const db = getDb();
      const schoolId = req.activeSchoolId!;

      // Enforce teacher class/subject scope
      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const isClassTeacher =
          req.user!.classTeacherOf?.toLowerCase() === cleanClass.toLowerCase();
        if (
          !isClassTeacher &&
          !canTeacherAccessSubjectResource(teacherScope, cleanClass, cleanSubject)
        ) {
          res.status(403).json({
            error:
              'Teachers may only enter marks for their assigned classes or subjects. Contact your coordinator if a class assignment is missing.',
          });
          return;
        }
      }

      const savedMarks: ExamMark[] = [];
      const nowIso = new Date().toISOString();

      for (const row of rows) {
        if (!row || typeof row.studentId !== 'string') continue;
        const student = db.students.find(
          (s) => s.id === row.studentId && s.schoolId === schoolId && s.classSection === cleanClass,
        );
        if (!student) continue;

        const obtained = Number(row.obtainedMarks);
        if (!Number.isFinite(obtained) || obtained < 0 || obtained > max) continue;
        const roundedObtained = Math.round(obtained * 10) / 10;

        const existingIdx = db.examMarks.findIndex(
          (m) =>
            m.schoolId === schoolId &&
            m.studentId === student.id &&
            inferExamCategory(m) === examType &&
            m.examName.toLowerCase() === cleanExamName.toLowerCase() &&
            m.subject.toLowerCase() === cleanSubject.toLowerCase(),
        );

        const mark: ExamMark = {
          id:
            existingIdx >= 0
              ? db.examMarks[existingIdx].id
              : `mk-${student.id}-${examType.replace(/\s+/g, '').toLowerCase()}-${cleanExamName.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 18)}-${cleanSubject.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 14)}-${Date.now().toString(36).slice(-4)}`,
          schoolId,
          studentId: student.id,
          examName: cleanExamName,
          examType,
          term: cleanTerm,
          subject: cleanSubject,
          maxMarks: max,
          obtainedMarks: roundedObtained,
          date: cleanDate,
          conceptualGap: sanitizeText(row.conceptualGap, 180) || undefined,
          remarks: sanitizeText(row.remarks, 240) || undefined,
          enteredBy: req.user!.name,
          updatedAt: nowIso,
        };

        if (existingIdx >= 0) db.examMarks[existingIdx] = mark;
        else db.examMarks.unshift(mark);

        syncExamEvidence({ db, schoolId, mark, enteredBy: req.user!.name });
        savedMarks.push(mark);
      }

      if (savedMarks.length === 0) {
        res.status(400).json({
          error:
            'No valid student mark rows were saved. Verify marks are between 0 and max marks for students in the selected class.',
        });
        return;
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RECORDED_MARKS_DASHBOARD_BATCH',
        entityType: 'ExamMark',
        entityId: `${cleanClass}-${examType}-${cleanExamName}-${cleanSubject}`,
        detail: `Recorded ${savedMarks.length} ${examType} marks (${cleanExamName} · ${cleanSubject}, Max ${max}) for Class ${cleanClass}.`,
      });

      saveDb();
      res.status(201).json({ marks: savedMarks });
    },
  );

  // Edit a single exam mark
  app.put(
    '/api/marks/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const markId = req.params.id;
      const db = getDb();
      const schoolId = req.activeSchoolId!;

      const existingIdx = db.examMarks.findIndex(
        (m) => m.id === markId && m.schoolId === schoolId,
      );
      if (existingIdx < 0) {
        res.status(404).json({ error: 'Exam mark record not found in active school.' });
        return;
      }

      const existing = db.examMarks[existingIdx];
      const student = db.students.find(
        (s) => s.id === existing.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Associated student record not found.' });
        return;
      }

      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const isClassTeacher =
          req.user!.classTeacherOf?.toLowerCase() === student.classSection.toLowerCase();
        if (
          !isClassTeacher &&
          !canTeacherAccessSubjectResource(teacherScope, student.classSection, existing.subject)
        ) {
          res.status(403).json({ error: 'You can only edit marks for your assigned classes/subjects.' });
          return;
        }
      }

      const { examName, examType, term, subject, maxMarks, obtainedMarks, date, remarks, conceptualGap } =
        req.body as Partial<ExamMark>;

      const nextMax = maxMarks !== undefined ? Number(maxMarks) : existing.maxMarks;
      const nextObtained =
        obtainedMarks !== undefined ? Number(obtainedMarks) : existing.obtainedMarks;

      if (!Number.isFinite(nextMax) || nextMax < 1 || nextMax > 500) {
        res.status(400).json({ error: 'Maximum marks must be between 1 and 500.' });
        return;
      }
      if (!Number.isFinite(nextObtained) || nextObtained < 0 || nextObtained > nextMax) {
        res.status(400).json({ error: `Obtained marks must be between 0 and ${nextMax}.` });
        return;
      }

      const nextType =
        examType !== undefined
          ? isValidExamCategory(examType)
            ? examType
            : inferExamCategory(existing)
          : inferExamCategory(existing);

      const updated: ExamMark = {
        ...existing,
        examName: sanitizeText(examName, 80) || existing.examName,
        examType: nextType,
        term: term && VALID_TERMS.has(term) ? term : existing.term || 'Term 1',
        subject: sanitizeText(subject, 60) || existing.subject,
        maxMarks: nextMax,
        obtainedMarks: Math.round(nextObtained * 10) / 10,
        date:
          typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
            ? date.trim()
            : existing.date,
        remarks:
          remarks !== undefined ? sanitizeText(remarks, 240) || undefined : existing.remarks,
        conceptualGap:
          conceptualGap !== undefined
            ? sanitizeText(conceptualGap, 180) || undefined
            : existing.conceptualGap,
        enteredBy: req.user!.name,
        updatedAt: new Date().toISOString(),
      };

      db.examMarks[existingIdx] = updated;
      syncExamEvidence({ db, schoolId, mark: updated, enteredBy: req.user!.name });

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_EXAM_MARK',
        entityType: 'ExamMark',
        entityId: updated.id,
        detail: `Updated ${updated.examType} (${updated.examName} · ${updated.subject}) for ${student.name}: ${updated.obtainedMarks}/${updated.maxMarks}.`,
      });

      saveDb();
      res.json({ mark: updated });
    },
  );

  // Delete a single exam mark
  app.delete(
    '/api/marks/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res: Response) => {
      const markId = req.params.id;
      const db = getDb();
      const schoolId = req.activeSchoolId!;

      const existingIdx = db.examMarks.findIndex(
        (m) => m.id === markId && m.schoolId === schoolId,
      );
      if (existingIdx < 0) {
        res.status(404).json({ error: 'Exam mark record not found.' });
        return;
      }

      const target = db.examMarks[existingIdx];
      const student = db.students.find((s) => s.id === target.studentId && s.schoolId === schoolId);

      if (req.user!.role === 'teacher' && student) {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const isClassTeacher =
          req.user!.classTeacherOf?.toLowerCase() === student.classSection.toLowerCase();
        if (
          !isClassTeacher &&
          !canTeacherAccessSubjectResource(teacherScope, student.classSection, target.subject)
        ) {
          res
            .status(403)
            .json({ error: 'You can only remove marks for your assigned classes/subjects.' });
          return;
        }
      }

      db.examMarks.splice(existingIdx, 1);
      db.evidence = db.evidence.filter(
        (e) => !(e.schoolId === schoolId && e.id === `ev-${target.id}`),
      );

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DELETED_EXAM_MARK',
        entityType: 'ExamMark',
        entityId: target.id,
        detail: `Removed ${target.examName} (${target.subject}) mark for ${student?.name || target.studentId}.`,
      });

      saveDb();
      res.json({ ok: true, deletedId: target.id });
    },
  );

  // Authorized comprehensive Student Report Card (Marks + All Skills Assessed)
  app.get('/api/report-card/:studentId', requireAuth, (req: AuthedRequest, res: Response) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId!;

    if (user.role === 'accountant' || user.role === 'transport_incharge') {
      res.status(403).json({ error: 'Report cards are restricted from this institutional role.' });
      return;
    }

    const rawSchoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
    const teacherScope =
      user.role === 'teacher' ? computeTeacherTeachingScope(user, rawSchoolTimetable) : null;
    const allSchoolStudents = db.students.filter((s) => s.schoolId === schoolId);
    const allowedStudents = filterStudentsForRole({
      user,
      schoolStudents: allSchoolStudents,
      teacherScope,
    });

    const targetRaw = allowedStudents.find((s) => s.id === req.params.studentId);
    if (!targetRaw) {
      res.status(403).json({ error: 'Student report card not found or outside your authorized scope.' });
      return;
    }

    const student = sanitizeStudentForRole(targetRaw, user.role);
    const weightsConfig = db.schoolWeights[schoolId] ?? db.schoolWeights['school-svm-kk'];
    const stuEvidence = db.evidence.filter(
      (e) => e.schoolId === schoolId && e.studentId === student.id,
    );
    const breakdown = calculateLearnersScore(stuEvidence, weightsConfig.weights);

    const isParentOrStudent = user.role === 'parent' || user.role === 'student';
    const vcipRelease = (db.vcipReleaseRecords || []).find(
      (r) => r.schoolId === schoolId && r.studentId === student.id,
    );
    const allowVcip =
      user.role !== 'teacher' &&
      (!isParentOrStudent ||
        (db.vcipGovernanceConfigs?.[schoolId]?.parentAccessEnabled !== false &&
          isVcipReleaseVisibleToFamily(vcipRelease)));

    const reportCard = buildStudentReportCard({
      student,
      examMarks: db.examMarks.filter((m) => m.schoolId === schoolId && m.studentId === student.id),
      breakdown,
      readingReports: (db.readingReports || []).filter(
        (r) => r.schoolId === schoolId && r.studentId === student.id,
      ),
      numeracyReports: (db.numeracyReports || []).filter(
        (n) => n.schoolId === schoolId && n.studentId === student.id,
      ),
      computerSkillAttempts: (db.computerSkillAttempts || []).filter(
        (a) => a.schoolId === schoolId && a.studentId === student.id,
      ),
      cognitiveAttempts: (db.cognitiveAttempts || []).filter(
        (a) => a.schoolId === schoolId && a.studentId === student.id,
      ),
      thinkingAssessments: (db.thinkingAssessments || []).filter(
        (t) => t.schoolId === schoolId && t.studentId === student.id,
      ),
      vcipAttempts: allowVcip
        ? (db.vcipAttempts || []).filter(
            (v) => v.schoolId === schoolId && v.studentId === student.id,
          )
        : [],
      psychometricRecords: (db.psychometricRecords || []).filter(
        (p) => p.schoolId === schoolId && p.studentId === student.id,
      ),
      yearlyPlan:
        (db.studentYearlyPlans || []).find(
          (p) => p.schoolId === schoolId && p.studentId === student.id,
        ) || null,
    });

    res.json({ reportCard });
  });
}
