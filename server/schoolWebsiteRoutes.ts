import type { Express, Request, Response, NextFunction } from 'express';
import type { UserAccount, UserRole } from '../src/types';
import type {
  PublicSchoolDirectoryCard,
  PublicSchoolWebsitePayload,
  SchoolWebsiteProfile,
} from '../src/types/schoolWebsite';
import {
  buildDefaultSchoolWebsiteProfile,
  resolveSchoolBySlugOrId,
  toSchoolWebsiteSlug,
} from '../src/utils/schoolWebsiteEngine.ts';
import { getDb, saveDb } from './store.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface RouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (roles: UserRole[]) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

function getOrBuildSchoolProfile(schoolId: string): SchoolWebsiteProfile | null {
  const db = getDb();
  const school = db.schools.find((s) => s.id === schoolId);
  if (!school) return null;
  if (!db.schoolWebsitesBySchool) {
    db.schoolWebsitesBySchool = {};
  }
  const existing = db.schoolWebsitesBySchool[school.id];
  if (existing) {
    return existing;
  }
  const schoolUsers = db.users.filter((u) => u.schoolId === school.id);
  const generated = buildDefaultSchoolWebsiteProfile(school, schoolUsers);
  db.schoolWebsitesBySchool[school.id] = generated;
  return generated;
}

function buildDirectoryCards(): PublicSchoolDirectoryCard[] {
  const db = getDb();
  return db.schools
    .filter((s) => s.active !== false)
    .map((s) => {
      const profile = getOrBuildSchoolProfile(s.id)!;
      return {
        id: s.id,
        name: s.name,
        code: s.code,
        slug: profile.slug || toSchoolWebsiteSlug(s.code || s.name),
        city: s.city,
        state: s.state,
        board: s.board,
        session: s.session,
        studentCount: s.studentCount,
        teacherCount: s.teacherCount,
        tagline: profile.tagline,
        heroImageUrl: profile.heroImageUrl,
        admissionsOpen: profile.admissionsOpen,
        gradesOffered: profile.gradesOffered,
      };
    });
}

export function registerSchoolWebsiteRoutes(app: Express, deps: RouteDeps) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Public directory of all onboarded partner schools with microsite slugs
  app.get('/api/public/schools', (_req, res) => {
    res.json({ schools: buildDirectoryCards() });
  });

  // Public standalone website payload for any onboarded school (by slug, code, or id)
  app.get('/api/public/school-website/:slugOrId', (req, res) => {
    const db = getDb();
    const activeSchools = db.schools.filter((s) => s.active !== false);
    const school = resolveSchoolBySlugOrId(activeSchools, String(req.params.slugOrId || ''));
    if (!school) {
      res.status(404).json({ error: 'Onboarded school website not found.' });
      return;
    }

    const profile = getOrBuildSchoolProfile(school.id)!;
    const schoolEvents = (db.schoolEvents || [])
      .filter((ev) => ev.schoolId === school.id)
      .slice(0, 4)
      .map((ev) => ({
        id: ev.id,
        title: ev.title,
        date: ev.eventDate,
        category: ev.category,
        venue: ev.venue || `${school.name} Campus`,
      }));

    const transportCoverage = (db.busRoutes || [])
      .filter((r) => r.schoolId === school.id)
      .slice(0, 6)
      .map((r) => ({
        id: r.id,
        routeName: r.routeName,
        busNumber: r.busNumber,
        stopsPreview: Array.isArray(r.stops)
          ? r.stops
              .slice(0, 4)
              .map((st) => st.name)
              .join(' · ')
          : school.city,
      }));

    const payload: PublicSchoolWebsitePayload = {
      school: {
        id: school.id,
        name: school.name,
        code: school.code,
        slug: profile.slug,
        city: school.city,
        state: school.state,
        board: school.board,
        udiseCode: school.udiseCode,
        haryanaMisCode: school.haryanaMisCode,
        session: school.session,
        studentCount: school.studentCount,
        teacherCount: school.teacherCount,
        active: school.active,
      },
      profile,
      upcomingEvents: schoolEvents,
      transportCoverage,
      allOnboardedSchools: buildDirectoryCards(),
    };

    res.json(payload);
  });

  // Authenticated: Get current tenant's website profile for School Admin / Principal CMS
  app.get(
    '/api/school-website/me',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const targetSchoolId = req.activeSchoolId || req.user?.schoolId || db.schools[0]?.id;
      if (!targetSchoolId) {
        res.status(404).json({ error: 'No active school tenant found.' });
        return;
      }
      const profile = getOrBuildSchoolProfile(targetSchoolId);
      if (!profile) {
        res.status(404).json({ error: 'School website profile not found.' });
        return;
      }
      res.json({ profile });
    },
  );

  // Authenticated: Update school's own website (tagline, motto, principal message, features, management, gallery, contact)
  app.patch(
    '/api/school-website/me',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const targetSchoolId = req.activeSchoolId || req.user?.schoolId || db.schools[0]?.id;
      if (!targetSchoolId) {
        res.status(404).json({ error: 'No active school tenant found.' });
        return;
      }
      const existing = getOrBuildSchoolProfile(targetSchoolId);
      if (!existing) {
        res.status(404).json({ error: 'School website profile not found.' });
        return;
      }

      const patch = req.body as Partial<SchoolWebsiteProfile>;
      const updated: SchoolWebsiteProfile = {
        ...existing,
        tagline: typeof patch.tagline === 'string' && patch.tagline.trim() ? patch.tagline.trim() : existing.tagline,
        motto: typeof patch.motto === 'string' && patch.motto.trim() ? patch.motto.trim() : existing.motto,
        establishedYear:
          typeof patch.establishedYear === 'string' && patch.establishedYear.trim()
            ? patch.establishedYear.trim()
            : existing.establishedYear,
        gradesOffered:
          typeof patch.gradesOffered === 'string' && patch.gradesOffered.trim()
            ? patch.gradesOffered.trim()
            : existing.gradesOffered,
        admissionsOpen:
          typeof patch.admissionsOpen === 'boolean' ? patch.admissionsOpen : existing.admissionsOpen,
        admissionsHeadline:
          typeof patch.admissionsHeadline === 'string' && patch.admissionsHeadline.trim()
            ? patch.admissionsHeadline.trim()
            : existing.admissionsHeadline,
        accentTheme:
          patch.accentTheme === 'royal_navy' ||
          patch.accentTheme === 'emerald_heritage' ||
          patch.accentTheme === 'crimson_scholar'
            ? patch.accentTheme
            : existing.accentTheme,
        principalMessage: patch.principalMessage
          ? {
              authorName: patch.principalMessage.authorName?.trim() || existing.principalMessage.authorName,
              roleTitle: patch.principalMessage.roleTitle?.trim() || existing.principalMessage.roleTitle,
              quote: patch.principalMessage.quote?.trim() || existing.principalMessage.quote,
              fullMessage: patch.principalMessage.fullMessage?.trim() || existing.principalMessage.fullMessage,
            }
          : existing.principalMessage,
        salientFeatures: Array.isArray(patch.salientFeatures) && patch.salientFeatures.length > 0
          ? patch.salientFeatures.slice(0, 12)
          : existing.salientFeatures,
        managementTeam: Array.isArray(patch.managementTeam) && patch.managementTeam.length > 0
          ? patch.managementTeam.slice(0, 12)
          : existing.managementTeam,
        gallery: Array.isArray(patch.gallery) && patch.gallery.length > 0
          ? patch.gallery.slice(0, 24)
          : existing.gallery,
        contact: patch.contact
          ? {
              ...existing.contact,
              ...patch.contact,
            }
          : existing.contact,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.name || 'School Admin',
      };

      if (!db.schoolWebsitesBySchool) db.schoolWebsitesBySchool = {};
      db.schoolWebsitesBySchool[targetSchoolId] = updated;
      if (req.user) {
        appendAuditLog({
          schoolId: targetSchoolId,
          actor: req.user,
          action: 'UPDATE_SCHOOL_WEBSITE',
          entityType: 'SchoolWebsiteProfile',
          entityId: targetSchoolId,
          detail: `Updated public school website (/school/${updated.slug}).`,
        });
      }
      saveDb();
      res.json({ profile: updated });
    },
  );
}
