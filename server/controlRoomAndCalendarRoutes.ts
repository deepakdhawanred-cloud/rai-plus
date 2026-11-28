import type { Express, NextFunction, Request, Response } from 'express';
import type {
  SubstitutionAssignmentRecord,
  UserAccount,
  UserRole,
} from '../src/types';
import type {
  AcademicCalendarEntry,
  AcademicCalendarState,
  CalendarCreationMode,
  CalendarModificationDraft,
  CalendarReschedulingMode,
  ClassroomFacility,
  ClassroomMaintenanceStatus,
  CurriculumChapterStatus,
  PeriodCheckInRecord,
  PeriodCheckInStatus,
  TeacherDutyRecord,
  TeacherDutyType,
} from '../src/types/controlRoomCalendar';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  DEFAULT_BELL_SCHEDULE,
  buildControlRoomHistoricalReports,
  buildLiveControlRoomSnapshot,
  deriveSchoolClassrooms,
  getDefaultBellScheduleForSchool,
} from '../src/utils/liveSchoolTimelineEngine.ts';
import {
  analyzeCalendarModificationImpact,
  applyApprovedCalendarDraft,
  computeWorkingDaysMetrics,
  createInitialAcademicCalendar,
  rollbackAcademicCalendarToVersion,
} from '../src/utils/smartAcademicCalendarEngine.ts';
import {
  dateToTimetableDay,
  normalizeTeacherKey,
  normalizeTimetableDay,
  splitSlotTeachers,
} from '../src/utils/smartTimetableEngine.ts';

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

const LEADERSHIP_ROLES: UserRole[] = ['super_admin', 'school_admin', 'principal', 'coordinator'];
const STAFF_ROLES: UserRole[] = [...LEADERSHIP_ROLES, 'teacher'];

// Multi-tenant isolated Server-Sent Events (SSE) subscriber registry
const sseClientsBySchool = new Map<string, Set<Response>>();

export function broadcastControlRoomEvent(
  schoolId: string,
  eventType: string,
  payload: Record<string, unknown>,
): void {
  const clients = sseClientsBySchool.get(schoolId);
  if (!clients || clients.size === 0) return;
  const frame = `event: ${eventType}\ndata: ${JSON.stringify({
    schoolId,
    type: eventType,
    timestamp: new Date().toISOString(),
    ...payload,
  })}\n\n`;
  for (const res of clients) {
    try {
      res.write(frame);
    } catch {
      clients.delete(res);
    }
  }
}

function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentHhmm(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function ensureControlRoomAndCalendarInitialized(
  db: DatabaseState,
  schoolId: string,
): boolean {
  let mutated = false;
  if (!Array.isArray(db.schoolClassrooms)) {
    db.schoolClassrooms = [];
    mutated = true;
  }
  if (!db.schoolBellSchedules || typeof db.schoolBellSchedules !== 'object') {
    db.schoolBellSchedules = {};
    mutated = true;
  }
  if (!Array.isArray(db.periodCheckIns)) {
    db.periodCheckIns = [];
    mutated = true;
  }
  if (!Array.isArray(db.teacherDuties)) {
    db.teacherDuties = [];
    mutated = true;
  }
  if (!db.academicCalendars || typeof db.academicCalendars !== 'object') {
    db.academicCalendars = {};
    mutated = true;
  }

  const hasSchoolRooms = db.schoolClassrooms.some((r) => r.schoolId === schoolId);
  if (!hasSchoolRooms) {
    const derived = deriveSchoolClassrooms(schoolId, db.timetable || [], []);
    db.schoolClassrooms.push(...derived);
    mutated = true;
  }

  if (!db.schoolBellSchedules[schoolId]) {
    db.schoolBellSchedules[schoolId] = getDefaultBellScheduleForSchool(schoolId);
    mutated = true;
  }

  if (!db.academicCalendars[schoolId]) {
    const school = db.schools.find((s) => s.id === schoolId);
    db.academicCalendars[schoolId] = createInitialAcademicCalendar({
      schoolId,
      board: school?.board || 'HBSE',
      session: school?.session || '2026-27',
      mode: 'Hybrid',
      createdBy: 'Academic Coordinator',
    });
    mutated = true;
  }

  return mutated;
}

export function registerControlRoomAndCalendarRoutes(app: Express, deps: RouteDeps): void {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // ============================================================================
  // REAL-TIME SSE STREAM (MULTI-TENANT ISOLATED LIVE TIMELINE UPDATES)
  // ============================================================================
  app.get('/api/control-room/stream', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    if (!schoolId) {
      res.status(400).json({ error: 'No active school context.' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let bucket = sseClientsBySchool.get(schoolId);
    if (!bucket) {
      bucket = new Set<Response>();
      sseClientsBySchool.set(schoolId, bucket);
    }
    bucket.add(res);

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        ok: true,
        schoolId,
        connectedAt: new Date().toISOString(),
      })}\n\n`,
    );

    const heartbeat = setInterval(() => {
      try {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
      } catch {
        clearInterval(heartbeat);
        bucket?.delete(res);
      }
    }, 25_000);
    heartbeat.unref?.();

    req.on('close', () => {
      clearInterval(heartbeat);
      bucket?.delete(res);
      if (bucket && bucket.size === 0) {
        sseClientsBySchool.delete(schoolId);
      }
    });
  });

  // ============================================================================
  // LIVE SCHOOL CONTROL ROOM SNAPSHOT + HISTORICAL REPORTS
  // ============================================================================
  app.get(
    '/api/control-room/snapshot',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      const mutated = ensureControlRoomAndCalendarInitialized(db, schoolId);
      if (mutated) saveDb(undefined, { schoolId });

      const rawDate = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
        ? req.query.date
        : getTodayIso();
      const rawTime = typeof req.query.time === 'string' && /^\d{1,2}:\d{2}$/.test(req.query.time)
        ? req.query.time
        : getCurrentHhmm();

      const fullSnapshot = buildLiveControlRoomSnapshot({
        schoolId,
        date: rawDate,
        currentTimeHhmm: rawTime,
        timetable: db.timetable || [],
        classrooms: db.schoolClassrooms || [],
        bellSchedule: db.schoolBellSchedules?.[schoolId] || DEFAULT_BELL_SCHEDULE,
        periodCheckIns: db.periodCheckIns || [],
        teacherDuties: db.teacherDuties || [],
        staffAttendance: db.staffAttendance || [],
        staffProfiles: db.staffProfiles || [],
        users: db.users || [],
        teacherLeaveRequests: db.teacherLeaveRequests || [],
        substitutionAssignments: db.substitutionAssignments || [],
        teacherCapabilityProfiles: db.teacherCapabilityProfiles || [],
        substituteRuleConfig: db.substituteRuleConfigs?.[schoolId],
        schoolEvents: db.schoolEvents || [],
      });

      const isManagement = LEADERSHIP_ROLES.includes(req.user!.role);
      if (!isManagement) {
        // Permission boundary: Teachers see only their own live schedule & assigned substitutions
        const myKey = normalizeTeacherKey(req.user!.name);
        const myTeachers = fullSnapshot.teachers.filter(
          (t) =>
            t.teacherKey === myKey ||
            t.teacherKey.includes(myKey) ||
            myKey.includes(t.teacherKey),
        );
        const myClassrooms = fullSnapshot.classrooms.filter((row) =>
          row.schedule.some(
            (cell) =>
              cell.effectiveTeacher &&
              splitSlotTeachers(cell.effectiveTeacher).some(
                (t) => normalizeTeacherKey(t) === myKey || normalizeTeacherKey(t).includes(myKey),
              ),
          ),
        );
        res.json({
          scope: 'teacher_self',
          snapshot: {
            ...fullSnapshot,
            teachers: myTeachers,
            classrooms: myClassrooms,
            pendingSubstitutions: [],
          },
          reports: null,
        });
        return;
      }

      const reports = buildControlRoomHistoricalReports(
        fullSnapshot,
        db.substitutionAssignments || [],
      );
      res.json({
        scope: 'full_management',
        snapshot: fullSnapshot,
        reports,
      });
    },
  );

  // Period Check-In / Verified Occupancy Override
  app.post(
    '/api/control-room/check-in',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);

      const {
        date,
        period,
        classSection,
        roomNumber,
        teacherName,
        subject,
        status,
        note,
      } = (req.body || {}) as {
        date?: string;
        period?: number;
        classSection?: string;
        roomNumber?: string;
        teacherName?: string;
        subject?: string;
        status?: PeriodCheckInStatus;
        note?: string;
      };

      const cleanDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayIso();
      const periodNum = Number(period);
      if (!Number.isInteger(periodNum) || periodNum < 1 || periodNum > 12 || !roomNumber?.trim()) {
        res.status(400).json({ error: 'Valid period (1-12) and roomNumber are required.' });
        return;
      }

      const validStatus: PeriodCheckInStatus =
        status === 'verified_vacant' || status === 'admin_override'
          ? status
          : 'verified_teaching';

      const isManagement = LEADERSHIP_ROLES.includes(req.user!.role);
      const effectiveTeacher = (teacherName || req.user!.name).trim();
      if (!isManagement) {
        const myKey = normalizeTeacherKey(req.user!.name);
        const targetKey = normalizeTeacherKey(effectiveTeacher);
        if (myKey !== targetKey && !targetKey.includes(myKey) && !myKey.includes(targetKey)) {
          res.status(403).json({
            error: 'Teachers can only check in for their own assigned periods.',
          });
          return;
        }
      }

      // Enforce hard business rule: never verify two different classes in the same room simultaneously
      if (validStatus === 'verified_teaching' && classSection?.trim()) {
        const roomConflict = (db.periodCheckIns || []).find(
          (c) =>
            c.schoolId === schoolId &&
            c.date === cleanDate &&
            c.period === periodNum &&
            c.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase() &&
            c.status === 'verified_teaching' &&
            c.classSection &&
            c.classSection !== classSection.trim(),
        );
        if (roomConflict) {
          res.status(409).json({
            error: `Room conflict: ${roomNumber.trim()} is already verified as occupied by ${roomConflict.classSection} in Period ${periodNum}.`,
          });
          return;
        }
      }

      const existingIdx = db.periodCheckIns!.findIndex(
        (c) =>
          c.schoolId === schoolId &&
          c.date === cleanDate &&
          c.period === periodNum &&
          c.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase(),
      );

      const record: PeriodCheckInRecord = {
        id:
          existingIdx >= 0
            ? db.periodCheckIns![existingIdx].id
            : `chk-${schoolId}-${cleanDate}-p${periodNum}-${roomNumber.trim().replace(/\s+/g, '')}`,
        schoolId,
        date: cleanDate,
        period: periodNum,
        classSection: (classSection || '').trim(),
        roomNumber: roomNumber.trim(),
        teacherName: effectiveTeacher,
        subject: (subject || '').trim(),
        status: validStatus,
        verifiedBy: req.user!.name,
        verifiedAt: new Date().toISOString(),
        note: note?.trim() || undefined,
      };

      if (existingIdx >= 0) db.periodCheckIns![existingIdx] = record;
      else db.periodCheckIns!.unshift(record);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'PERIOD_OCCUPANCY_VERIFIED',
        entityType: 'PeriodCheckIn',
        entityId: record.id,
        detail: `${record.roomNumber} Period ${record.period} (${cleanDate}) marked ${record.status} by ${req.user!.name}${record.classSection ? ` for ${record.classSection}` : ''}.`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'control_room_update', {
        reason: 'period_check_in',
        roomNumber: record.roomNumber,
        period: record.period,
        status: record.status,
      });

      res.status(201).json({ ok: true, checkIn: record });
    },
  );

  // Conflict-Checked Substitute Approval (Instant Push to Live Timeline)
  app.post(
    '/api/control-room/substitute-approve',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);

      const {
        date,
        period,
        classSection,
        subject,
        absentTeacherName,
        substituteTeacherName,
        reason,
      } = (req.body || {}) as {
        date?: string;
        period?: number;
        classSection?: string;
        subject?: string;
        absentTeacherName?: string;
        substituteTeacherName?: string;
        reason?: string;
      };

      const cleanDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayIso();
      const periodNum = Number(period);
      if (
        !Number.isInteger(periodNum) ||
        !classSection?.trim() ||
        !absentTeacherName?.trim() ||
        !substituteTeacherName?.trim()
      ) {
        res.status(400).json({
          error: 'date, period, classSection, absentTeacherName, and substituteTeacherName are required.',
        });
        return;
      }

      const dayCode = dateToTimetableDay(cleanDate) || 'Mon';
      const subKey = normalizeTeacherKey(substituteTeacherName);

      // Hard conflict guard 1: Substitute cannot already be teaching another class in this period
      const regularBusy = (db.timetable || []).find(
        (s) =>
          s.schoolId === schoolId &&
          normalizeTimetableDay(s.day) === dayCode &&
          s.period === periodNum &&
          s.classSection !== classSection.trim() &&
          splitSlotTeachers(s.teacherName).some((t) => normalizeTeacherKey(t) === subKey),
      );
      if (regularBusy) {
        res.status(409).json({
          error: `Double-booking blocked: ${substituteTeacherName} is already teaching ${regularBusy.classSection} (${regularBusy.subject}) during Period ${periodNum}.`,
        });
        return;
      }

      // Hard conflict guard 2: Substitute cannot already cover another class in this period
      const subBusy = (db.substitutionAssignments || []).find(
        (c) =>
          c.schoolId === schoolId &&
          c.date === cleanDate &&
          c.period === periodNum &&
          Boolean(c.substituteTeacherName) &&
          c.classSection !== classSection.trim() &&
          normalizeTeacherKey(c.substituteTeacherName || '') === subKey,
      );
      if (subBusy) {
        res.status(409).json({
          error: `Double-booking blocked: ${substituteTeacherName} is already covering ${subBusy.classSection} in Period ${periodNum}.`,
        });
        return;
      }

      // Hard conflict guard 3: Substitute cannot be on approved leave
      const onLeave = (db.teacherLeaveRequests || []).find(
        (l) =>
          l.schoolId === schoolId &&
          l.status === 'Approved' &&
          l.startDate <= cleanDate &&
          l.endDate >= cleanDate &&
          normalizeTeacherKey(l.teacherName) === subKey,
      );
      if (onLeave) {
        res.status(409).json({
          error: `Leave conflict: ${substituteTeacherName} has approved ${onLeave.leaveType} on ${cleanDate}.`,
        });
        return;
      }

      const matchingSlot = (db.timetable || []).find(
        (s) =>
          s.schoolId === schoolId &&
          normalizeTimetableDay(s.day) === dayCode &&
          s.period === periodNum &&
          s.classSection === classSection.trim(),
      );
      const nowIso = new Date().toISOString();

      const record: SubstitutionAssignmentRecord = {
        id: `sub-cr-${schoolId}-${cleanDate}-p${periodNum}-${Date.now().toString(36)}`,
        schoolId,
        date: cleanDate,
        day: dayCode,
        period: periodNum,
        timeRange: matchingSlot?.timeRange || `Period ${periodNum}`,
        slotId: matchingSlot?.id || `slot-cr-${periodNum}`,
        classSection: classSection.trim(),
        subject: (subject || matchingSlot?.subject || 'General Cover').trim(),
        room: matchingSlot?.room || 'Assigned Room',
        absentTeacherName: absentTeacherName.trim(),
        substituteTeacherName: substituteTeacherName.trim(),
        assignmentMode: 'custom_manual',
        manuallyApproved: true,
        matchTier: 1,
        matchTierLabel: 'Control Room Approved Substitution',
        scorePoints: 95,
        ruleWarnings: [],
        reason: reason?.trim() || 'Approved live via School Control Room.',
        publishStatus: 'published',
        notifiedTeacher: true,
        assignedBy: req.user!.name,
        assignedAt: nowIso,
        auditHistory: [
          {
            at: nowIso,
            actorName: req.user!.name,
            actorRole: req.user!.role,
            action: 'APPROVED_LIVE_CONTROL_ROOM_SUBSTITUTE',
            detail: `Assigned ${substituteTeacherName.trim()} to cover ${classSection.trim()} P${periodNum}.`,
          },
        ],
      };

      if (!Array.isArray(db.substitutionAssignments)) db.substitutionAssignments = [];
      db.substitutionAssignments = db.substitutionAssignments.filter(
        (c) =>
          !(
            c.schoolId === schoolId &&
            c.date === cleanDate &&
            c.period === periodNum &&
            c.classSection === classSection.trim()
          ),
      );
      db.substitutionAssignments.unshift(record);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CONTROL_ROOM_SUBSTITUTE_APPROVED',
        entityType: 'SubstitutionAssignment',
        entityId: record.id,
        detail: `Assigned ${record.substituteTeacherName} to cover ${record.classSection} (${record.subject}) Period ${record.period} on ${cleanDate} for ${record.absentTeacherName}.`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'control_room_update', {
        reason: 'substitute_approved',
        classSection: record.classSection,
        period: record.period,
        substituteTeacherName: record.substituteTeacherName,
      });

      res.status(201).json({ ok: true, substitution: record });
    },
  );

  // Classroom Maintenance / Reservation / Facility Management
  app.post(
    '/api/control-room/classroom-status',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);

      const {
        roomNumber,
        maintenanceStatus,
        maintenanceNote,
        reservedBy,
        reservedUntil,
        capacity,
        facilities,
      } = (req.body || {}) as {
        roomNumber?: string;
        maintenanceStatus?: ClassroomMaintenanceStatus;
        maintenanceNote?: string;
        reservedBy?: string;
        reservedUntil?: string;
        capacity?: number;
        facilities?: ClassroomFacility[];
      };

      if (!roomNumber?.trim()) {
        res.status(400).json({ error: 'roomNumber is required.' });
        return;
      }

      const room = db.schoolClassrooms!.find(
        (r) =>
          r.schoolId === schoolId &&
          r.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase(),
      );
      if (!room) {
        res.status(404).json({ error: 'Classroom not found in active school.' });
        return;
      }

      if (maintenanceStatus && ['Active', 'Maintenance', 'Reserved'].includes(maintenanceStatus)) {
        room.maintenanceStatus = maintenanceStatus;
      }
      if (typeof maintenanceNote === 'string') room.maintenanceNote = maintenanceNote.trim() || undefined;
      if (typeof reservedBy === 'string') room.reservedBy = reservedBy.trim() || undefined;
      if (typeof reservedUntil === 'string') room.reservedUntil = reservedUntil.trim() || undefined;
      if (Number.isFinite(Number(capacity)) && Number(capacity) >= 10 && Number(capacity) <= 300) {
        room.capacity = Math.round(Number(capacity));
      }
      if (Array.isArray(facilities)) {
        room.facilities = facilities;
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CLASSROOM_STATUS_UPDATED',
        entityType: 'SchoolClassroom',
        entityId: room.id,
        detail: `Updated ${room.roomNumber} status to ${room.maintenanceStatus}${room.maintenanceNote ? ` (${room.maintenanceNote})` : ''}.`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'control_room_update', {
        reason: 'classroom_status',
        roomNumber: room.roomNumber,
        maintenanceStatus: room.maintenanceStatus,
      });

      res.json({ ok: true, classroom: room });
    },
  );

  // Assign Teacher Duty / Meeting (Prevents Treating Engaged Teachers as Free)
  app.post(
    '/api/control-room/teacher-duty',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);

      const { date, teacherName, startTime, endTime, period, dutyType, title, location } =
        (req.body || {}) as {
          date?: string;
          teacherName?: string;
          startTime?: string;
          endTime?: string;
          period?: number;
          dutyType?: TeacherDutyType;
          title?: string;
          location?: string;
        };

      if (!teacherName?.trim() || !title?.trim() || !startTime?.trim() || !endTime?.trim()) {
        res.status(400).json({ error: 'teacherName, title, startTime, and endTime are required.' });
        return;
      }
      const cleanDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getTodayIso();
      const duty: TeacherDutyRecord = {
        id: `duty-${schoolId}-${Date.now().toString(36)}`,
        schoolId,
        date: cleanDate,
        teacherName: teacherName.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        period: period ? Number(period) : undefined,
        dutyType: dutyType || 'Assigned Duty',
        title: title.trim(),
        location: location?.trim() || undefined,
        createdBy: req.user!.name,
        createdAt: new Date().toISOString(),
      };

      db.teacherDuties!.unshift(duty);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ASSIGNED_TEACHER_DUTY',
        entityType: 'TeacherDuty',
        entityId: duty.id,
        detail: `Assigned ${duty.dutyType} "${duty.title}" to ${duty.teacherName} (${duty.startTime}–${duty.endTime} on ${cleanDate}).`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'control_room_update', {
        reason: 'teacher_duty',
        teacherName: duty.teacherName,
        dutyType: duty.dutyType,
      });

      res.status(201).json({ ok: true, duty });
    },
  );

  // ============================================================================
  // SMART ACADEMIC CALENDAR & DYNAMIC CURRICULUM RESCHEDULING ENGINE
  // ============================================================================
  app.get('/api/academic-calendar', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0].id;
    const mutated = ensureControlRoomAndCalendarInitialized(db, schoolId);
    if (mutated) saveDb(undefined, { schoolId });

    const cal = db.academicCalendars![schoolId];
    const metrics = computeWorkingDaysMetrics(cal);
    const isManagement = LEADERSHIP_ROLES.includes(req.user!.role);

    res.json({
      calendar: isManagement
        ? cal
        : {
            ...cal,
            pendingDrafts: [],
          },
      metrics,
    });
  });

  // Switch/Generate Calendar Mode (Automatic CBSE/HBSE, Manual, Hybrid)
  app.post(
    '/api/academic-calendar/generate',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);

      const { mode, board, session, workingDays, bufferDays } = (req.body || {}) as {
        mode?: CalendarCreationMode;
        board?: 'CBSE' | 'HBSE' | 'NCERT/SCERT';
        session?: string;
        workingDays?: AcademicCalendarState['workingDays'];
        bufferDays?: number;
      };

      const existing = db.academicCalendars![schoolId];
      const nextMode: CalendarCreationMode =
        mode === 'Automatic' || mode === 'Manual' || mode === 'Hybrid' ? mode : 'Hybrid';
      const nextBoard = board || existing.board;
      const fresh = createInitialAcademicCalendar({
        schoolId,
        board: nextBoard,
        session: session || existing.session,
        mode: nextMode,
        createdBy: req.user!.name,
      });

      if (Array.isArray(workingDays) && workingDays.length >= 5) {
        fresh.workingDays = workingDays;
      }
      if (Number.isFinite(Number(bufferDays)) && Number(bufferDays) >= 0) {
        fresh.bufferDays = Math.min(30, Math.round(Number(bufferDays)));
      }

      // Preserve existing curriculum progress & version lineage
      const nextVersion = existing.currentVersion + 1;
      fresh.curriculumPlans =
        existing.curriculumPlans.length > 0 ? existing.curriculumPlans : fresh.curriculumPlans;
      fresh.currentVersion = nextVersion;
      fresh.versions = [
        {
          version: nextVersion,
          publishedAt: new Date().toISOString(),
          publishedBy: req.user!.name,
          reason: `Switched calendar creation mode to ${nextMode} (${nextBoard})`,
          mode: nextMode,
          summary: `${fresh.entries.length} scheduled entries · ${nextBoard} ${nextMode} baseline`,
          entriesSnapshot: JSON.parse(JSON.stringify(fresh.entries)),
          curriculumSnapshot: JSON.parse(JSON.stringify(fresh.curriculumPlans)),
        },
        ...existing.versions,
      ].slice(0, 25);

      db.academicCalendars![schoolId] = fresh;
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'GENERATED_ACADEMIC_CALENDAR',
        entityType: 'AcademicCalendar',
        entityId: `${schoolId}-v${nextVersion}`,
        detail: `Generated ${nextMode} academic calendar (${nextBoard}, Session ${fresh.session}) as v${nextVersion}.`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'calendar_update', {
        version: nextVersion,
        mode: nextMode,
      });

      res.json({ ok: true, calendar: fresh, metrics: computeWorkingDaysMetrics(fresh) });
    },
  );

  // Create Mid-Session Calendar Modification Draft & Run Full Impact Analysis
  app.post(
    '/api/academic-calendar/draft-impact',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const {
        actionType = 'Add',
        reschedulingMode = 'Semi-Automatic',
        reason,
        entry,
      } = (req.body || {}) as {
        actionType?: 'Add' | 'Update' | 'Remove';
        reschedulingMode?: CalendarReschedulingMode;
        reason?: string;
        entry?: Partial<AcademicCalendarEntry>;
      };

      if (!entry?.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !entry?.title?.trim()) {
        res.status(400).json({ error: 'Valid entry date (YYYY-MM-DD) and title are required.' });
        return;
      }

      const proposedEntry: AcademicCalendarEntry = {
        id: entry.id || `cal-${schoolId}-${Date.now().toString(36)}`,
        date: entry.date,
        endDate: entry.endDate && entry.endDate >= entry.date ? entry.endDate : undefined,
        title: entry.title.trim(),
        type: entry.type || 'Holiday',
        source: entry.source || 'School Custom',
        isLockedOfficial: Boolean(entry.isLockedOfficial),
        affectedClasses: entry.affectedClasses,
        timeRange: entry.timeRange,
        description: entry.description?.trim(),
      };

      const impactReport = analyzeCalendarModificationImpact({
        calendar: cal,
        proposedEntry,
        actionType,
        timetable: db.timetable || [],
        schoolEvents: db.schoolEvents || [],
        lessonPlans: db.lessonPlans || [],
      });

      const draft: CalendarModificationDraft = {
        id: `cal-draft-${Date.now().toString(36)}`,
        schoolId,
        createdAt: new Date().toISOString(),
        createdBy: req.user!.name,
        reason: reason?.trim() || `Mid-session ${proposedEntry.type.toLowerCase()} adjustment`,
        reschedulingMode,
        actionType,
        proposedEntry,
        impactReport,
        status: 'Pending Approval',
      };

      cal.pendingDrafts.unshift(draft);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CREATED_CALENDAR_IMPACT_DRAFT',
        entityType: 'CalendarModificationDraft',
        entityId: draft.id,
        detail: `Analyzed impact of "${proposedEntry.title}" (${proposedEntry.date}${proposedEntry.endDate ? ` to ${proposedEntry.endDate}` : ''}): ${impactReport.instructionalDaysDelta} instructional days, ${impactReport.affectedItems.length} affected items.`,
      });
      saveDb(undefined, { schoolId });

      res.status(201).json({ ok: true, draft });
    },
  );

  // Mandatory Approval Gate: Approve & Publish Calendar Draft + Sync Linked Events
  app.post(
    '/api/academic-calendar/drafts/:draftId/approve',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const draft = cal.pendingDrafts.find((d) => d.id === req.params.draftId);
      if (!draft) {
        res.status(404).json({ error: 'Calendar draft not found for active school.' });
        return;
      }
      if (draft.status !== 'Pending Approval') {
        res.status(409).json({ error: `Draft is already ${draft.status}.` });
        return;
      }

      const { itemOverrides, allowLockedOverride } = (req.body || {}) as {
        itemOverrides?: Record<string, { approved?: boolean; customDate?: string }>;
        allowLockedOverride?: boolean;
      };

      const { updatedCalendar, eventDateUpdates, notification } = applyApprovedCalendarDraft({
        calendar: cal,
        draft,
        approvedBy: req.user!.name,
        itemOverrides,
        allowLockedOverride: Boolean(allowLockedOverride),
      });

      db.academicCalendars![schoolId] = updatedCalendar;

      // Sync rescheduled dates back into existing db.schoolEvents so Events module never conflicts!
      for (const upd of eventDateUpdates) {
        const match = (db.schoolEvents || []).find(
          (e) => e.schoolId === schoolId && e.title === upd.eventTitle && e.eventDate === upd.originalDate,
        );
        if (match) {
          match.eventDate = upd.newDate;
        }
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'PUBLISHED_ACADEMIC_CALENDAR',
        entityType: 'AcademicCalendar',
        entityId: `${schoolId}-v${updatedCalendar.currentVersion}`,
        detail: `Approved & published Calendar v${updatedCalendar.currentVersion} ("${draft.proposedEntry.title}"); synced ${eventDateUpdates.length} school event(s) and notified stakeholders.`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'calendar_update', {
        version: updatedCalendar.currentVersion,
        notificationTitle: notification.title,
      });

      res.json({
        ok: true,
        calendar: updatedCalendar,
        metrics: computeWorkingDaysMetrics(updatedCalendar),
        notification,
      });
    },
  );

  app.post(
    '/api/academic-calendar/drafts/:draftId/reject',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const draft = cal.pendingDrafts.find((d) => d.id === req.params.draftId);
      if (!draft) {
        res.status(404).json({ error: 'Calendar draft not found.' });
        return;
      }
      draft.status = 'Rejected';
      draft.reviewedBy = req.user!.name;
      draft.reviewedAt = new Date().toISOString();
      saveDb(undefined, { schoolId });
      res.json({ ok: true, draft });
    },
  );

  // Teacher / Admin Chapter Progress Update (Tracks Real Periods Taught)
  app.patch(
    '/api/academic-calendar/curriculum/:chapterId',
    requireAuth,
    requireRoles(STAFF_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const chapter = cal.curriculumPlans.find((c) => c.id === req.params.chapterId);
      if (!chapter) {
        res.status(404).json({ error: 'Curriculum chapter not found in active school.' });
        return;
      }

      const { completedPeriods, status, revisedCompletionDate } = (req.body || {}) as {
        completedPeriods?: number;
        status?: CurriculumChapterStatus;
        revisedCompletionDate?: string;
      };

      if (Number.isFinite(Number(completedPeriods))) {
        chapter.completedPeriods = Math.max(
          0,
          Math.min(chapter.plannedPeriods, Math.round(Number(completedPeriods))),
        );
      }
      if (
        status &&
        ['Completed', 'In Progress', 'Partially Completed', 'Planned', 'At Risk'].includes(status)
      ) {
        chapter.status = status;
        if (status === 'Completed') chapter.completedPeriods = chapter.plannedPeriods;
      } else if (chapter.completedPeriods >= chapter.plannedPeriods) {
        chapter.status = 'Completed';
      } else if (chapter.completedPeriods > 0) {
        chapter.status = 'In Progress';
      }

      if (revisedCompletionDate && /^\d{4}-\d{2}-\d{2}$/.test(revisedCompletionDate)) {
        chapter.revisedCompletionDate = revisedCompletionDate;
      }
      chapter.lastUpdatedAt = new Date().toISOString();
      chapter.lastUpdatedBy = req.user!.name;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_CURRICULUM_PROGRESS',
        entityType: 'CurriculumChapter',
        entityId: chapter.id,
        detail: `${chapter.classSection} ${chapter.subject} Ch.${chapter.chapterNumber} (${chapter.chapterTitle}) -> ${chapter.completedPeriods}/${chapter.plannedPeriods} periods (${chapter.status}).`,
      });
      saveDb(undefined, { schoolId });
      res.json({ ok: true, chapter });
    },
  );

  // Version Control 1-Click Rollback
  app.post(
    '/api/academic-calendar/versions/:version/rollback',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const targetVersion = Number(req.params.version);
      const { reason } = (req.body || {}) as { reason?: string };
      const restored = rollbackAcademicCalendarToVersion({
        calendar: cal,
        targetVersion,
        rolledBackBy: req.user!.name,
        reason,
      });
      if (!restored) {
        res.status(404).json({ error: `Calendar version v${targetVersion} not found.` });
        return;
      }

      db.academicCalendars![schoolId] = restored;
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'ROLLED_BACK_ACADEMIC_CALENDAR',
        entityType: 'AcademicCalendar',
        entityId: `${schoolId}-v${restored.currentVersion}`,
        detail: `Rolled back academic calendar to snapshot v${targetVersion} (published as v${restored.currentVersion}).`,
      });
      saveDb(undefined, { schoolId });
      broadcastControlRoomEvent(schoolId, 'calendar_update', {
        version: restored.currentVersion,
        rolledBackFrom: targetVersion,
      });

      res.json({ ok: true, calendar: restored, metrics: computeWorkingDaysMetrics(restored) });
    },
  );

  // Acknowledge CBSE/HBSE Board Circular (Optionally Launch Reviewable Draft — Never Auto-Overwrites)
  app.post(
    '/api/academic-calendar/circulars/:circularId/acknowledge',
    requireAuth,
    requireRoles(LEADERSHIP_ROLES),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0].id;
      ensureControlRoomAndCalendarInitialized(db, schoolId);
      const cal = db.academicCalendars![schoolId];

      const circular = cal.boardCirculars.find((c) => c.id === req.params.circularId);
      if (!circular) {
        res.status(404).json({ error: 'Board circular not found.' });
        return;
      }

      const { createDraft } = (req.body || {}) as { createDraft?: boolean };
      circular.acknowledged = true;
      circular.acknowledgedBy = req.user!.name;
      circular.acknowledgedAt = new Date().toISOString();

      let createdDraft: CalendarModificationDraft | null = null;
      if (createDraft) {
        const proposedEntry: AcademicCalendarEntry = {
          id: `cal-circ-${circular.id}`,
          date: circular.suggestedDate,
          endDate: circular.suggestedEndDate,
          title: circular.title,
          type: circular.suggestedType,
          source: circular.board === 'HBSE' ? 'HBSE Official' : 'CBSE Official',
          isLockedOfficial: circular.suggestedType === 'Board Exam',
          description: `${circular.circularNo}: ${circular.summary}`,
        };
        const impactReport = analyzeCalendarModificationImpact({
          calendar: cal,
          proposedEntry,
          actionType: 'Add',
          timetable: db.timetable || [],
          schoolEvents: db.schoolEvents || [],
          lessonPlans: db.lessonPlans || [],
        });
        createdDraft = {
          id: `cal-draft-circ-${Date.now().toString(36)}`,
          schoolId,
          createdAt: new Date().toISOString(),
          createdBy: req.user!.name,
          reason: `Adopted from ${circular.circularNo} for review`,
          reschedulingMode: 'Semi-Automatic',
          actionType: 'Add',
          proposedEntry,
          impactReport,
          status: 'Pending Approval',
        };
        cal.pendingDrafts.unshift(createdDraft);
      }

      saveDb(undefined, { schoolId });
      res.json({ ok: true, circular, draft: createdDraft });
    },
  );
}
