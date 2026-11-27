import type { Express, NextFunction, Request, Response } from 'express';
import type { StudentRecord, UserAccount, UserRole } from '../src/types';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';

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

export function registerLearningPortalRoutes(app: Express, deps: RouteDeps): void {
  const { requireAuth, appendAuditLog } = deps;

  // Authenticated portal identity + active school metadata
  app.get('/api/learning-portal/me', requireAuth, (req: AuthedRequest, res: Response) => {
    const db = getDb();
    const user = req.user!;
    const schoolId = req.activeSchoolId || user.schoolId || db.schools[0]?.id || 'school-vis-jjr';
    const school = db.schools.find((s) => s.id === schoolId) || db.schools[0];
    const linkedStudent = findLinkedStudentForUser(db, schoolId, user);
    const parsed = parseClassSection(linkedStudent?.classSection);

    res.json({
      id: user.id,
      name: linkedStudent && user.role === 'student' ? linkedStudent.name : user.name,
      role: mapRaiRoleToPortalRole(user.role),
      raiRole: user.role,
      schoolId,
      schoolName: school?.name || 'Rai Plus School',
      schoolBoard: school?.board || 'HBSE',
      schoolSession: school?.session || '2026-27',
      cls: linkedStudent ? parsed.cls : undefined,
      section: linkedStudent ? parsed.section : undefined,
      roll: linkedStudent?.rollNo || undefined,
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

    if (Object.prototype.hasOwnProperty.call(docs, docPath)) {
      const existing = docs[docPath];
      // Ensure config/school always includes all Classes 6–12 sections even if older doc only had 9–12
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

    // Dynamic defaults derived directly from Rai Plus school records
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
      res.status(403).json({ error: 'You do not have permission to modify this Learning Portal document.' });
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
    docs[docPath] = JSON.parse(serialized);

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
