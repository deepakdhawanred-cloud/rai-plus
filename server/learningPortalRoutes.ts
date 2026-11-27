import type { Express, NextFunction, Request, Response } from 'express';
import type { StudentRecord, TimetableSlot, UserAccount, UserRole } from '../src/types';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import { teacherMatchesSlot } from '../src/utils/academicOperationsEngine.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface RouteDeps {
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

export type LearningPortalRole = 'admin' | 'teacher' | 'student';

export interface LearningPortalRestrictions {
  raiRole: UserRole;
  portalRole: LearningPortalRole;
  displayRoleLabel: string;
  allowedClasses: string[];
  lockedClass: string | null;
  lockedSection: string | null;
  allowedSubjects: string[] | null;
  readOnly: boolean;
  canSwitchViewAs: boolean;
  allowedPreviewRoles: LearningPortalRole[];
  canAccessMonitor: boolean;
  canAccessSetup: boolean;
  canEditCoverage: boolean;
  canEditLessonFormats: boolean;
  profileLockedByErp: boolean;
  defaultHash: string;
  childName?: string;
}

const PORTAL_CLASSES = ['6', '7', '8', '9', '10', '11', '12'] as const;
const MAX_DOC_BYTES = 256 * 1024;
const ALLOWED_COLLECTIONS = new Set(['progress', 'coverage', 'profiles', 'settings']);
const VALID_DOC_PATH_RE =
  /^(config\/school|(?:profiles|progress|coverage|settings)\/[A-Za-z0-9._-]{1,96})$/;

export function mapRaiRoleToPortalRole(role: UserRole): LearningPortalRole {
  if (
    role === 'super_admin' ||
    role === 'school_admin' ||
    role === 'principal' ||
    role === 'coordinator'
  ) {
    return 'admin';
  }
  if (role === 'teacher') {
    return 'teacher';
  }
  return 'student';
}

export function isValidLearningPortalDocPath(docPath: string): boolean {
  if (typeof docPath !== 'string') return false;
  return VALID_DOC_PATH_RE.test(docPath);
}

export function parseClassSection(raw?: string): { cls: string; section: string } {
  if (!raw || typeof raw !== 'string') {
    return { cls: '10', section: 'A' };
  }
  const trimmed = raw.trim();
  const match = trimmed.match(/\b(1[0-2]|[6-9])\s*[-– ]*\s*([A-Za-z0-9]{1,3})?/);
  if (match) {
    return {
      cls: match[1],
      section: (match[2] || 'A').toUpperCase(),
    };
  }
  return { cls: '10', section: 'A' };
}

export function deriveDefaultSectionsForSchool(
  students: StudentRecord[],
): Record<string, string[]> {
  const map: Record<string, Set<string>> = {};
  for (const c of PORTAL_CLASSES) {
    map[c] = new Set<string>();
  }
  for (const student of students) {
    const { cls, section } = parseClassSection(student.classSection);
    if (map[cls] && section) {
      map[cls].add(section);
    }
  }
  const out: Record<string, string[]> = {};
  for (const c of PORTAL_CLASSES) {
    const sorted = Array.from(map[c]).sort();
    out[c] = sorted.length > 0 ? sorted : ['A'];
  }
  return out;
}

/**
 * Computes strict automatic role-based viewing & restriction policies for the Learning Portal.
 */
export function computeLearningPortalRestrictions(params: {
  user: UserAccount;
  linkedStudent?: StudentRecord;
  schoolTimetable?: TimetableSlot[];
}): LearningPortalRestrictions {
  const { user, linkedStudent, schoolTimetable = [] } = params;
  const portalRole = mapRaiRoleToPortalRole(user.role);

  if (portalRole === 'admin') {
    const label =
      user.role === 'principal'
        ? 'Principal (Admin)'
        : user.role === 'coordinator'
          ? 'Coordinator (Admin)'
          : 'School Admin';
    return {
      raiRole: user.role,
      portalRole: 'admin',
      displayRoleLabel: label,
      allowedClasses: [...PORTAL_CLASSES],
      lockedClass: null,
      lockedSection: null,
      allowedSubjects: null,
      readOnly: false,
      canSwitchViewAs: true,
      allowedPreviewRoles: ['admin', 'teacher', 'student'],
      canAccessMonitor: true,
      canAccessSetup: true,
      canEditCoverage: true,
      canEditLessonFormats: true,
      profileLockedByErp: false,
      defaultHash: '#home',
    };
  }

  if (portalRole === 'teacher') {
    const assignedSlots = schoolTimetable.filter((s) =>
      teacherMatchesSlot(s.teacherName, user.name),
    );
    const assignedClsSet = new Set<string>();
    const assignedSubSet = new Set<string>();

    if (user.classTeacherOf) {
      const parsed = parseClassSection(user.classTeacherOf);
      if ((PORTAL_CLASSES as readonly string[]).includes(parsed.cls)) {
        assignedClsSet.add(parsed.cls);
      }
    }
    for (const s of assignedSlots) {
      const parsed = parseClassSection(s.classSection);
      if ((PORTAL_CLASSES as readonly string[]).includes(parsed.cls)) {
        assignedClsSet.add(parsed.cls);
      }
      if (s.subject?.trim()) assignedSubSet.add(s.subject.trim());
    }

    const allowedClasses =
      assignedClsSet.size > 0
        ? PORTAL_CLASSES.filter((c) => assignedClsSet.has(c))
        : [...PORTAL_CLASSES];
    const allowedSubjects = assignedSubSet.size > 0 ? Array.from(assignedSubSet).sort() : null;

    return {
      raiRole: user.role,
      portalRole: 'teacher',
      displayRoleLabel: user.subjectSpecialty
        ? `Teacher · ${user.subjectSpecialty}`
        : 'Teacher',
      allowedClasses,
      lockedClass: null,
      lockedSection: null,
      allowedSubjects,
      readOnly: false,
      canSwitchViewAs: true,
      allowedPreviewRoles: ['teacher', 'student'],
      canAccessMonitor: true,
      canAccessSetup: false,
      canEditCoverage: true,
      canEditLessonFormats: true,
      profileLockedByErp: false,
      defaultHash: '#home',
    };
  }

  // Student or Parent (strictly locked to enrolled/child class & section)
  const parsed = parseClassSection(linkedStudent?.classSection || user.classTeacherOf);
  const isParent = user.role === 'parent';

  if (isParent) {
    const childFirst = linkedStudent?.name ? linkedStudent.name.split(' ')[0] : 'Child';
    return {
      raiRole: user.role,
      portalRole: 'student',
      displayRoleLabel: `Parent (Read-Only) · ${childFirst} · Class ${parsed.cls}-${parsed.section}`,
      allowedClasses: [parsed.cls],
      lockedClass: parsed.cls,
      lockedSection: parsed.section,
      allowedSubjects: null,
      readOnly: true,
      canSwitchViewAs: false,
      allowedPreviewRoles: [],
      canAccessMonitor: false,
      canAccessSetup: false,
      canEditCoverage: false,
      canEditLessonFormats: false,
      profileLockedByErp: true,
      defaultHash: '#me',
      childName: linkedStudent?.name,
    };
  }

  return {
    raiRole: user.role,
    portalRole: 'student',
    displayRoleLabel: `Student · Class ${parsed.cls}-${parsed.section}`,
    allowedClasses: [parsed.cls],
    lockedClass: parsed.cls,
    lockedSection: parsed.section,
    allowedSubjects: null,
    readOnly: false,
    canSwitchViewAs: false,
    allowedPreviewRoles: [],
    canAccessMonitor: false,
    canAccessSetup: false,
    canEditCoverage: false,
    canEditLessonFormats: false,
    profileLockedByErp: true,
    defaultHash: '#home',
  };
}

export function canReadLearningPortalDoc(
  user: Pick<UserAccount, 'id' | 'role'>,
  docPath: string,
): boolean {
  if (!isValidLearningPortalDocPath(docPath)) return false;
  const portalRole = mapRaiRoleToPortalRole(user.role);
  if (portalRole === 'admin' || portalRole === 'teacher') return true;
  if (
    docPath === 'config/school' ||
    docPath.startsWith('coverage/') ||
    docPath.startsWith('settings/')
  ) {
    return true;
  }
  return docPath === `profiles/${user.id}` || docPath === `progress/${user.id}`;
}

export function canWriteLearningPortalDoc(
  user: Pick<UserAccount, 'id' | 'role'>,
  docPath: string,
): boolean {
  if (!isValidLearningPortalDocPath(docPath)) return false;
  // Parents have strict read-only visibility into their child's portal
  if (user.role === 'parent') return false;
  const portalRole = mapRaiRoleToPortalRole(user.role);
  if (docPath === 'config/school') {
    return portalRole === 'admin';
  }
  if (docPath.startsWith('coverage/') || docPath.startsWith('settings/')) {
    return portalRole === 'admin' || portalRole === 'teacher';
  }
  if (docPath.startsWith('profiles/') || docPath.startsWith('progress/')) {
    const ownerId = docPath.slice(docPath.indexOf('/') + 1);
    return ownerId === user.id || portalRole === 'admin';
  }
  return false;
}

function getSchoolDocsMap(db: DatabaseState, schoolId: string): Record<string, unknown> {
  if (!db.learningPortalDocs || typeof db.learningPortalDocs !== 'object') {
    db.learningPortalDocs = {};
  }
  if (!db.learningPortalDocs[schoolId] || typeof db.learningPortalDocs[schoolId] !== 'object') {
    db.learningPortalDocs[schoolId] = {};
  }
  return db.learningPortalDocs[schoolId];
}

function findLinkedStudentForUser(
  db: DatabaseState,
  schoolId: string,
  user: UserAccount,
): StudentRecord | undefined {
  const linkedIds = Array.isArray(user.linkedStudentIds) ? user.linkedStudentIds : [];
  if (linkedIds.length > 0) {
    const direct = db.students.find(
      (s) => s.schoolId === schoolId && linkedIds.includes(s.id),
    );
    if (direct) return direct;
  }
  if (user.role === 'student') {
    const lowerName = user.name.trim().toLowerCase();
    return db.students.find(
      (s) => s.schoolId === schoolId && s.name.trim().toLowerCase() === lowerName,
    );
  }
  return undefined;
}

function findLinkedStudentUserIdForParent(
  db: DatabaseState,
  schoolId: string,
  linkedStudent?: StudentRecord,
): string | null {
  if (!linkedStudent) return null;
  const stuUser = db.users.find(
    (u) =>
      u.schoolId === schoolId &&
      u.role === 'student' &&
      (u.linkedStudentIds?.includes(linkedStudent.id) ||
        u.name.trim().toLowerCase() === linkedStudent.name.trim().toLowerCase()),
  );
  return stuUser?.id || null;
}

export function registerLearningPortalRoutes(app: Express, deps: RouteDeps): void {
  const { requireAuth, appendAuditLog } = deps;

  // Authenticated portal identity + active school metadata + automatic role restrictions
  app.get('/api/learning-portal/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];
    const linkedStudent = findLinkedStudentForUser(db, schoolId, user);
    const schoolTimetable = db.timetable.filter((t) => t.schoolId === schoolId);
    const restrictions = computeLearningPortalRestrictions({
      user,
      linkedStudent,
      schoolTimetable,
    });
    const parsed = parseClassSection(linkedStudent?.classSection);

    res.json({
      id: user.id,
      name: linkedStudent && user.role === 'student' ? linkedStudent.name : user.name,
      role: restrictions.portalRole,
      raiRole: user.role,
      schoolId,
      schoolName: school?.name || 'Rai Plus School',
      schoolBoard: school?.board || 'HBSE',
      schoolSession: school?.session || '2026-27',
      cls: linkedStudent ? parsed.cls : restrictions.allowedClasses[0],
      section: linkedStudent ? parsed.section : undefined,
      roll: linkedStudent?.rollNo || undefined,
      restrictions,
    });
  });

  // Read single document within the active school's isolated namespace
  app.get('/api/learning-portal/doc', requireAuth, (req: AuthedRequest, res: Response) => {
    const docPath = typeof req.query.path === 'string' ? req.query.path.trim() : '';
    if (!isValidLearningPortalDocPath(docPath)) {
      res.status(400).json({ error: 'Invalid Learning Portal document path.' });
      return;
    }
    const user = req.user!;
    if (!canReadLearningPortalDoc(user, docPath)) {
      res.status(403).json({ error: 'You do not have permission to read this Learning Portal document.' });
      return;
    }

    const db = getDb();
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const docs = getSchoolDocsMap(db, schoolId);

    // If a parent reads progress/<parentId>, transparently serve their linked child's live progress
    if (user.role === 'parent' && docPath === `progress/${user.id}`) {
      const linkedStudent = findLinkedStudentForUser(db, schoolId, user);
      const childUserId = findLinkedStudentUserIdForParent(db, schoolId, linkedStudent);
      if (childUserId && Object.prototype.hasOwnProperty.call(docs, `progress/${childUserId}`)) {
        res.json({ exists: true, data: docs[`progress/${childUserId}`] });
        return;
      }
    }

    if (Object.prototype.hasOwnProperty.call(docs, docPath)) {
      const existing = docs[docPath];
      if (docPath === 'config/school' && existing && typeof existing === 'object') {
        const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
        const defaults = deriveDefaultSectionsForSchool(schoolStudents);
        const existingObj = existing as { sections?: Record<string, string[]> };
        res.json({
          exists: true,
          data: {
            ...existingObj,
            sections: { ...defaults, ...(existingObj.sections || {}) },
          },
        });
        return;
      }
      res.json({ exists: true, data: existing });
      return;
    }

    if (docPath === 'config/school') {
      const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
      res.json({
        exists: true,
        data: {
          sections: deriveDefaultSectionsForSchool(schoolStudents),
        },
      });
      return;
    }

    if (docPath === `profiles/${user.id}`) {
      const linkedStudent = findLinkedStudentForUser(db, schoolId, user);
      if (linkedStudent) {
        const { cls, section } = parseClassSection(linkedStudent.classSection);
        res.json({
          exists: true,
          data: {
            cls,
            section,
            roll: String(linkedStudent.rollNo || '').replace(/\D/g, ''),
            t: Date.now(),
          },
        });
        return;
      }
    }

    res.json({ exists: false, data: null });
  });

  // Upsert single document with strict multi-tenant & role guards
  app.put('/api/learning-portal/doc', requireAuth, (req: AuthedRequest, res: Response) => {
    const body = (req.body || {}) as { path?: unknown; data?: unknown };
    const docPath = typeof body.path === 'string' ? body.path.trim() : '';
    if (!isValidLearningPortalDocPath(docPath)) {
      res.status(400).json({ error: 'Invalid Learning Portal document path.' });
      return;
    }
    const user = req.user!;
    if (!canWriteLearningPortalDoc(user, docPath)) {
      res.status(403).json({
        error:
          user.role === 'parent'
            ? 'Parent view is read-only and cannot modify student or school records.'
            : 'You do not have permission to modify this Learning Portal document.',
      });
      return;
    }
    if (body.data === undefined || body.data === null || typeof body.data !== 'object') {
      res.status(400).json({ error: 'Document payload must be a JSON object.' });
      return;
    }
    const serialized = JSON.stringify(body.data);
    if (Buffer.byteLength(serialized, 'utf-8') > MAX_DOC_BYTES) {
      res.status(413).json({ error: 'Learning Portal document exceeds 256 KB limit.' });
      return;
    }

    const db = getDb();
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const docs = getSchoolDocsMap(db, schoolId);
    const parsedPayload = JSON.parse(serialized) as Record<string, unknown>;

    // Enforce ERP-locked class & section on student self-writes so students cannot spoof grades
    if (user.role === 'student' && (docPath === `profiles/${user.id}` || docPath === `progress/${user.id}`)) {
      const linkedStudent = findLinkedStudentForUser(db, schoolId, user);
      if (linkedStudent) {
        const enrolled = parseClassSection(linkedStudent.classSection);
        parsedPayload.cls = enrolled.cls;
        parsedPayload.section = enrolled.section;
      }
    }

    docs[docPath] = parsedPayload;

    if (
      docPath === 'config/school' ||
      docPath.startsWith('coverage/') ||
      docPath.startsWith('settings/')
    ) {
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'LEARNING_PORTAL_UPDATE',
        entityType: 'learning_portal',
        entityId: docPath,
        detail: `Updated Learning Portal document ${docPath}`,
      });
    }

    saveDb(undefined, { schoolId });
    res.json({ ok: true, path: docPath });
  });

  // Collection query (used by Syllabus Monitor to aggregate class mastery)
  app.get('/api/learning-portal/collection', requireAuth, (req: AuthedRequest, res: Response) => {
    const coll = typeof req.query.name === 'string' ? req.query.name.trim() : '';
    if (!ALLOWED_COLLECTIONS.has(coll)) {
      res.status(400).json({ error: 'Unsupported Learning Portal collection.' });
      return;
    }
    const user = req.user!;
    const portalRole = mapRaiRoleToPortalRole(user.role);
    if ((coll === 'progress' || coll === 'profiles') && portalRole === 'student') {
      res.status(403).json({ error: 'Only teachers and school leadership can view class-wide student progress.' });
      return;
    }

    const db = getDb();
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const docs = getSchoolDocsMap(db, schoolId);
    const prefix = `${coll}/`;
    const out: Array<Record<string, unknown>> = [];
    for (const [key, val] of Object.entries(docs)) {
      if (key.startsWith(prefix) && val && typeof val === 'object') {
        const id = key.slice(prefix.length);
        out.push({ id, ...(val as Record<string, unknown>) });
      }
    }
    res.json({ docs: out });
  });

  // Display name lookup scoped strictly to the active school
  app.post('/api/learning-portal/names', requireAuth, (req: AuthedRequest, res: Response) => {
    const body = (req.body || {}) as { ids?: unknown };
    const rawIds = Array.isArray(body.ids)
      ? body.ids.filter((x): x is string => typeof x === 'string').slice(0, 200)
      : [];
    const user = req.user!;
    const portalRole = mapRaiRoleToPortalRole(user.role);
    const db = getDb();
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';

    const names: Record<string, string> = {};
    for (const id of rawIds) {
      if (portalRole === 'student' && id !== user.id) continue;
      const foundUser = db.users.find(
        (u) => u.id === id && (u.schoolId === schoolId || u.schoolId === null),
      );
      if (foundUser) {
        const linked = findLinkedStudentForUser(db, schoolId, foundUser);
        names[id] = linked && foundUser.role === 'student' ? linked.name : foundUser.name;
      }
    }
    res.json({ names });
  });
}
