import type { Express, NextFunction, Request, Response } from 'express';
import type {
  DocumentChecklistItem,
  DocumentVerificationStatus,
  StudentRecord,
  UserAccount,
  UserRole,
} from '../src/types';
import { getDb, saveDb } from './store.ts';
import type { DatabaseState } from './seedData.ts';
import {
  STANDARD_SCHOOL_DOCUMENTS,
  computeOnboardingProgress,
  createDay1OnboardingBlueprint,
  normalizeStudentDocuments,
} from '../src/utils/studentOnboardingDocsEngine.ts';
import { computeTeacherTeachingScope, filterStudentsForRole } from '../src/utils/roleVisibilityAudit.ts';
import { normalizeClassSectionFromApplyingClass } from '../src/utils/admissionCrmEngine.ts';
import { ensureSchoolTransportInitialized } from './transportRoutes.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface StudentOnboardingRouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (allowed: UserRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
  syncSchoolFamilyAccounts: (db: DatabaseState, schoolId: string) => unknown;
}

function canUserAccessStudent(
  db: DatabaseState,
  user: UserAccount,
  schoolId: string,
  studentId: string,
): StudentRecord | null {
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
  const rawTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
  const teacherScope =
    user.role === 'teacher' ? computeTeacherTeachingScope(user, rawTimetable) : null;
  const visible = filterStudentsForRole({ user, schoolStudents, teacherScope });
  return visible.find((s) => s.id === studentId) || null;
}

export function registerStudentOnboardingRoutes(
  app: Express,
  deps: StudentOnboardingRouteDeps,
): void {
  const { requireAuth, requireRoles, appendAuditLog, syncSchoolFamilyAccounts } = deps;

  const docsStaffRoles: UserRole[] = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'teacher',
  ];
  const admissionAdminRoles: UserRole[] = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
  ];

  // 1. Update / Verify a Student's Document Checklist (Admin or Related Faculty for their class)
  app.patch(
    '/api/students/:studentId/documents',
    requireAuth,
    requireRoles(docsStaffRoles),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const student = canUserAccessStudent(db, user, schoolId, req.params.studentId);
      if (!student) {
        res.status(404).json({
          error: 'Student not found or outside your authorised class/faculty scope.',
        });
        return;
      }

      const body = (req.body || {}) as {
        updates?: Array<{
          key: string;
          status?: DocumentVerificationStatus;
          referenceNo?: string;
          dueDate?: string;
          remarks?: string;
        }>;
      };

      if (!Array.isArray(body.updates) || body.updates.length === 0) {
        res.status(400).json({ error: 'At least one document update is required.' });
        return;
      }

      const todayIso = new Date().toISOString().slice(0, 10);
      const normalized = normalizeStudentDocuments(student, todayIso);
      const nextDocs: DocumentChecklistItem[] = normalized.items.map((item) => {
        const patch = body.updates!.find((u) => u.key === item.key || u.key === item.name);
        if (!patch) return item;
        const nextStatus: DocumentVerificationStatus =
          patch.status && ['Completed', 'Pending', 'Submitted', 'Not Applicable'].includes(patch.status)
            ? patch.status
            : item.status || 'Pending';
        const isCompleted = nextStatus === 'Completed';
        return {
          ...item,
          status: nextStatus,
          verified: isCompleted,
          referenceNo:
            patch.referenceNo !== undefined ? patch.referenceNo.trim() || undefined : item.referenceNo,
          dueDate:
            isCompleted || nextStatus === 'Not Applicable'
              ? undefined
              : patch.dueDate !== undefined
                ? patch.dueDate.trim() || undefined
                : item.dueDate,
          remarks: patch.remarks !== undefined ? patch.remarks.trim() || undefined : item.remarks,
          verifiedBy: isCompleted ? user.name : undefined,
          verifiedAt: isCompleted ? todayIso : undefined,
        };
      });

      student.documents = nextDocs;

      // Auto-complete Day-15 document checkpoint if student is in onboarding and all docs are complete
      const postNorm = normalizeStudentDocuments(student, todayIso);
      if (student.onboarding && postNorm.pendingCount === 0) {
        const docChk = student.onboarding.checkpoints.find((c) => c.id === 'chk-d15-docs');
        if (docChk && !docChk.completed) {
          docChk.completed = true;
          docChk.completedBy = user.name;
          docChk.completedAt = todayIso;
          docChk.notes = 'Auto-completed: 100% of applicable student documents verified.';
          student.onboarding.day1Status = computeOnboardingProgress(student.onboarding).derivedStatus;
        }
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'STUDENT_DOCUMENTS_UPDATED',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Updated ${body.updates.length} document status item(s) for ${student.name} (${student.classSection}) — ${postNorm.completedCount}/${postNorm.applicableCount} complete.`,
      });
      saveDb(undefined, { schoolId });

      res.json({
        ok: true,
        student,
        compliance: postNorm,
      });
    },
  );

  // 2. Admit New Student & Initialize Day-1 → Day-30 Onboarding Flow
  app.post(
    '/api/students/onboard-admission',
    requireAuth,
    requireRoles(admissionAdminRoles),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const body = (req.body || {}) as {
        leadId?: string;
        name?: string;
        classSection?: string;
        stream?: string;
        house?: string;
        guardianName?: string;
        guardianPhone?: string;
        guardianEmail?: string;
        address?: string;
        totalFeeAnnualInr?: number;
        initialFeePaidInr?: number;
        transportMode?: 'Bus' | 'Walker' | 'Parent Drop';
        busRouteId?: string;
        assignedClassTeacher?: string;
        peerBuddyName?: string;
        documentDueDate?: string;
        collectedDocumentKeys?: string[];
        notApplicableDocumentKeys?: string[];
        parentWelcomeSent?: boolean;
        notes?: string;
      };

      if (!body.name?.trim() || !body.classSection?.trim() || !body.guardianName?.trim() || !body.guardianPhone?.trim()) {
        res.status(400).json({
          error: 'Student name, class/section, guardian name, and guardian phone are required.',
        });
        return;
      }

      const school = db.schools.find((s) => s.id === schoolId);
      const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      const classSection = normalizeClassSectionFromApplyingClass(body.classSection);
      const nextRoll = String(
        schoolStudents.filter((s) => s.classSection === classSection).length + 1,
      ).padStart(2, '0');
      const codePrefix = school?.code?.split('-')[0] || 'SCH';
      const todayIso = new Date().toISOString().slice(0, 10);
      const defaultDue =
        body.documentDueDate?.trim() ||
        new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);

      // Find assigned class teacher from school users if not explicitly passed
      const matchedTeacher =
        body.assignedClassTeacher?.trim() ||
        db.users.find(
          (u) =>
            u.schoolId === schoolId &&
            u.role === 'teacher' &&
            u.classTeacherOf?.toLowerCase() === classSection.toLowerCase(),
        )?.name ||
        db.users.find((u) => u.schoolId === schoolId && u.role === 'teacher')?.name ||
        user.name;

      const collectedSet = new Set(body.collectedDocumentKeys || []);
      const naSet = new Set(body.notApplicableDocumentKeys || []);
      const isEarlyYears = /^(nursery|lkg|ukg|kg|pre-nursery|balvatika)\b/i.test(classSection);

      const documents: DocumentChecklistItem[] = STANDARD_SCHOOL_DOCUMENTS.map((spec) => {
        if (naSet.has(spec.key) || (isEarlyYears && spec.skipForEarlyYears && !collectedSet.has(spec.key))) {
          return {
            key: spec.key,
            name: spec.name,
            mandatory: false,
            verified: false,
            status: 'Not Applicable',
          };
        }
        const collected = collectedSet.has(spec.key);
        return {
          key: spec.key,
          name: spec.name,
          mandatory: spec.mandatory,
          verified: collected,
          status: collected ? 'Completed' : 'Pending',
          dueDate: collected ? undefined : defaultDue,
          verifiedBy: collected ? user.name : undefined,
          verifiedAt: collected ? todayIso : undefined,
        };
      });

      const totalFeeAnnualInr = Math.max(0, Number(body.totalFeeAnnualInr ?? 38000));
      const initialPaid = Math.max(0, Math.min(totalFeeAnnualInr, Number(body.initialFeePaidInr ?? 0)));
      const feeBalanceInr = Math.max(0, totalFeeAnnualInr - initialPaid);
      const transportMode =
        body.transportMode === 'Bus' || body.transportMode === 'Walker' || body.transportMode === 'Parent Drop'
          ? body.transportMode
          : 'Parent Drop';

      const onboarding = createDay1OnboardingBlueprint({
        admissionDate: todayIso,
        assignedClassTeacher: matchedTeacher,
        peerBuddyName: body.peerBuddyName,
        transportMode,
        documentDueDate: defaultDue,
        parentWelcomeSent: body.parentWelcomeSent,
        notes: body.notes,
      });

      const student: StudentRecord = {
        id: `stu-onb-${Date.now()}`,
        schoolId,
        admissionNo: `${codePrefix}-2026-${String(schoolStudents.length + 101).padStart(4, '0')}`,
        rollNo: nextRoll,
        name: body.name.trim(),
        classSection,
        ...(body.stream?.trim() ? { stream: body.stream.trim() } : {}),
        house: body.house?.trim() || 'Tagore House',
        guardianName: body.guardianName.trim(),
        guardianPhone: body.guardianPhone.trim(),
        ...(body.guardianEmail?.trim() ? { guardianEmail: body.guardianEmail.trim() } : {}),
        ...(body.address?.trim() ? { address: body.address.trim() } : {}),
        udiseStudentId: `UD-${Date.now().toString().slice(-6)}`,
        haryanaMisId: `HR-${Date.now().toString().slice(-6)}`,
        attendancePct: 100,
        feeBalanceInr,
        totalFeeAnnualInr,
        reportApprovalStatus: 'Draft',
        formulaVersion: 'v1.2',
        documents,
        responsibilities: [],
        achievements: [],
        confidentialCounsellorNote: `New Student Onboarded on ${todayIso}. Class Teacher: ${matchedTeacher}. ${body.notes?.trim() || ''}`.trim(),
        onboarding,
      };

      db.students.unshift(student);

      // Link admission lead if admitted from an enquiry lead
      if (body.leadId) {
        const lead = db.admissionLeads.find(
          (l) => l.id === body.leadId && l.schoolId === schoolId,
        );
        if (lead) {
          lead.stage = 'Confirmed';
          lead.convertedStudentId = student.id;
          lead.updatedAt = todayIso;
        }
      }

      // Create Transport allocation
      const { routes: trRoutes } = ensureSchoolTransportInitialized(db, schoolId);
      const nowIso = new Date().toISOString();
      if (transportMode === 'Bus') {
        const chosenRoute =
          (body.busRouteId && trRoutes.find((r) => r.id === body.busRouteId)) || trRoutes[0];
        if (chosenRoute) {
          const stop = chosenRoute.stops.find((s) => s.area !== 'School Campus') || chosenRoute.stops[0];
          db.studentTransportAllocations!.push({
            studentId: student.id,
            schoolId,
            mode: 'Bus',
            routeId: chosenRoute.id,
            stopId: stop?.id,
            stopName: stop?.name,
            areaLocality: body.address?.trim() || stop?.area || 'Campus Area',
            pickupTime: stop?.morningPickupTime,
            dropTime: stop?.eveningDropTime,
            assignedBy: user.name,
            assignedAt: nowIso,
            notes: `Assigned during Day-1 Admission Onboarding (${chosenRoute.routeCode})`,
          });
        }
      } else {
        db.studentTransportAllocations!.push({
          studentId: student.id,
          schoolId,
          mode: 'Walker',
          areaLocality: body.address?.trim() || 'Campus Enclave',
          assignedBy: user.name,
          assignedAt: nowIso,
          notes: `${transportMode} — set during Day-1 Admission Onboarding`,
        });
      }

      syncSchoolFamilyAccounts(db, schoolId);

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'NEW_STUDENT_ONBOARDED',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Admitted & started Day-1 onboarding for ${student.name} (${student.classSection}, ${student.admissionNo}) under ${matchedTeacher}.`,
      });
      saveDb(undefined, { schoolId });

      res.status(201).json({
        ok: true,
        student,
        compliance: normalizeStudentDocuments(student, todayIso),
        onboardingProgress: computeOnboardingProgress(onboarding),
      });
    },
  );

  // 3. Toggle / Update a Day-1 → Day-30 Onboarding Checkpoint (Admin, Coordinator, or Assigned Teacher)
  app.patch(
    '/api/students/:studentId/onboarding/checkpoints/:checkpointId',
    requireAuth,
    requireRoles(docsStaffRoles),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const student = canUserAccessStudent(db, user, schoolId, req.params.studentId);
      if (!student) {
        res.status(404).json({ error: 'Student not found or outside your class scope.' });
        return;
      }
      if (!student.onboarding) {
        res.status(400).json({ error: 'Student does not have an active Day-1 onboarding plan yet.' });
        return;
      }

      const checkpoint = student.onboarding.checkpoints.find((c) => c.id === req.params.checkpointId);
      if (!checkpoint) {
        res.status(404).json({ error: 'Onboarding checkpoint not found.' });
        return;
      }

      const { completed, notes } = (req.body || {}) as { completed?: boolean; notes?: string };
      const todayIso = new Date().toISOString().slice(0, 10);
      if (typeof completed === 'boolean') {
        checkpoint.completed = completed;
        checkpoint.completedBy = completed ? user.name : undefined;
        checkpoint.completedAt = completed ? todayIso : undefined;
      }
      if (typeof notes === 'string') {
        checkpoint.notes = notes.trim() || undefined;
      }

      const progress = computeOnboardingProgress(student.onboarding);
      student.onboarding.day1Status = progress.derivedStatus;

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ONBOARDING_CHECKPOINT_UPDATED',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `${checkpoint.completed ? 'Completed' : 'Reopened'} Day-${checkpoint.dayTarget} checkpoint "${checkpoint.title}" for ${student.name}.`,
      });
      saveDb(undefined, { schoolId });

      res.json({
        ok: true,
        student,
        onboardingProgress: progress,
      });
    },
  );

  // 4. Attach Day-1 Onboarding Monitoring to any existing recently admitted student
  app.post(
    '/api/students/:studentId/onboarding/initialize',
    requireAuth,
    requireRoles(docsStaffRoles),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const user = req.user!;
      const student = canUserAccessStudent(db, user, schoolId, req.params.studentId);
      if (!student) {
        res.status(404).json({ error: 'Student not found or outside your class scope.' });
        return;
      }
      if (student.onboarding) {
        res.json({
          ok: true,
          student,
          onboardingProgress: computeOnboardingProgress(student.onboarding),
        });
        return;
      }

      const body = (req.body || {}) as {
        peerBuddyName?: string;
        transportMode?: 'Bus' | 'Walker' | 'Parent Drop';
        documentDueDate?: string;
        notes?: string;
      };
      const todayIso = new Date().toISOString().slice(0, 10);
      const matchedTeacher =
        db.users.find(
          (u) =>
            u.schoolId === schoolId &&
            u.role === 'teacher' &&
            u.classTeacherOf?.toLowerCase() === student.classSection.toLowerCase(),
        )?.name || user.name;

      student.onboarding = createDay1OnboardingBlueprint({
        admissionDate: todayIso,
        assignedClassTeacher: matchedTeacher,
        peerBuddyName: body.peerBuddyName,
        transportMode: body.transportMode || 'Parent Drop',
        documentDueDate:
          body.documentDueDate?.trim() ||
          new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        notes: body.notes,
      });

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ONBOARDING_MONITORING_STARTED',
        entityType: 'StudentRecord',
        entityId: student.id,
        detail: `Started Day-1 to Day-30 monitoring plan for ${student.name} (${student.classSection}).`,
      });
      saveDb(undefined, { schoolId });

      res.status(201).json({
        ok: true,
        student,
        onboardingProgress: computeOnboardingProgress(student.onboarding),
      });
    },
  );
}
