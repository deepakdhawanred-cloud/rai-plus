import type { Express, RequestHandler } from 'express';
import type {
  PsychometricBatteryRecord,
  PsychometricIqRecord,
  PsychometricPersonalityRecord,
  PsychometricRecord,
  StudentRecord,
  UserRole,
} from '../src/types';
import { getDb, saveDb } from './store.ts';
import type { IntelligenceAuthedRequest } from './intelligenceRoutes.ts';
import {
  BAT_INDEX_ORDER,
  BAT_SUBS,
  BF_ITEMS,
  IQ_BANK,
  RIASEC_ITEMS,
  ageBand,
  evaluateBatteryValidity,
  formatClassLabel,
  inferAgeFromClassSection,
  scoreBattery,
  scoreIQ,
  scorePersonality,
} from '../src/utils/psychometricEngine.ts';

export interface PsychometricRouteDeps {
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

export function createPsychometricSeedRecords(params: {
  schoolIds: string[];
  students: StudentRecord[];
}): PsychometricRecord[] {
  const records: PsychometricRecord[] = [];
  const baseTs = new Date('2026-11-16T08:30:00Z').getTime();

  for (const schoolId of params.schoolIds) {
    const schoolStudents = params.students.filter((s) => s.schoolId === schoolId);
    const ageAppropriate = schoolStudents.filter((s) =>
      /(?:^|\D)([6-9]|1[0-2])(?:\D|$)/.test(s.classSection || ''),
    );
    const pool = ageAppropriate.length > 0 ? ageAppropriate : schoolStudents;
    const s1 = pool[0];
    const s2 = pool[1] || s1;

    if (s1) {
      // 1. Seeded Cognitive Profile Battery (Wechsler-style 10 subtests)
      const age1 = inferAgeFromClassSection(s1.classSection);
      const band1 = ageBand(age1);
      const raw1: PsychometricBatteryRecord['raw'] = {
        BD: 38,
        SI: 22,
        MR: 8,
        DS: 28,
        CD: 54,
        VC: 12,
        FW: 10,
        SR: 6,
        SP: 10,
        SS: 36,
      };
      const res1: PsychometricBatteryRecord['res'] = {
        BD: { raw: 38, items: [4, 4, 3, 3, 5, 5, 4, 4, 3, 3], times: [8, 10, 14, 15, 25, 28, 35, 40, 48, 52], disc: false },
        SI: { raw: 22, items: [2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0], choices: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2], times: Array(14).fill(9), disc: false },
        MR: { raw: 8, items: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0], choices: Array(10).fill(0), times: Array(10).fill(18), disc: false },
        DS: { raw: 28, F: 10, B: 9, S: 9, longest: { F: 7, B: 6, S: 6 }, trials: [] },
        CD: { raw: 54, errors: 2, attempted: 56 },
        VC: { raw: 12, items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], choices: Array(16).fill(0), times: Array(16).fill(7), disc: false },
        FW: { raw: 10, items: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], choices: Array(14).fill(0), times: Array(14).fill(16), disc: false },
        SR: { raw: 6, items: [1, 1, 1, 1, 1, 1, 0, 0], choices: Array(8).fill(0), times: Array(8).fill(15), disc: false },
        SP: { raw: 10, longest: 6, trials: [] },
        SS: { raw: 36, correct: 39, errors: 3, attempted: 42 },
      };
      const batDraft: PsychometricBatteryRecord = {
        id: `bt-seed-${schoolId}-1`,
        schoolId,
        studentId: s1.id,
        ts: baseTs - 86400_000 * 2,
        type: 'battery',
        p: {
          studentId: s1.id,
          name: s1.name,
          age: age1,
          band: band1,
          cls: formatClassLabel(s1.classSection),
          gender: 'Prefer not to say',
        },
        raw: raw1,
        res: res1,
        durationSec: 2740,
        validity: evaluateBatteryValidity(res1),
        snapshot: { FSIQ: 100, GAI: 100, CPI: 100, VCI: 100, VSI: 100, FRI: 100, WMI: 100, PSI: 100, local: false },
        administeredBy: 'Dr. Sunita Gill',
        version: '1.0',
      };
      const scored = scoreBattery(batDraft, []);
      batDraft.snapshot = {
        FSIQ: scored.FSIQ.score,
        GAI: scored.GAI.score,
        CPI: scored.CPI.score,
        VCI: scored.idx.VCI.score,
        VSI: scored.idx.VSI.score,
        FRI: scored.idx.FRI.score,
        WMI: scored.idx.WMI.score,
        PSI: scored.idx.PSI.score,
        local: scored.local,
      };
      records.push(batDraft);

      // 2. Seeded Personality (IPIP-50) & Career Interests (RIASEC)
      const bf = BF_ITEMS.map(([, trait, dir], idx) => {
        const high = trait === 'C' || trait === 'O' || trait === 'A';
        if (high) return dir > 0 ? (idx % 3 === 0 ? 4 : 5) : (idx % 3 === 0 ? 2 : 1);
        return dir > 0 ? 4 : 2;
      });
      const ri = RIASEC_ITEMS.map(([, k], idx) => {
        if (k === 'I') return idx % 2 === 0 ? 5 : 4;
        if (k === 'E') return 4;
        if (k === 'S') return 4;
        if (k === 'A') return 3;
        return 2;
      });
      const persScored = scorePersonality(bf, [1, 1], ri, Array(10).fill(54));
      const persRec: PsychometricPersonalityRecord = {
        id: `ps-seed-${schoolId}-1`,
        schoolId,
        studentId: s1.id,
        ts: baseTs - 86400_000,
        type: 'personality',
        p: {
          studentId: s1.id,
          name: s1.name,
          age: age1,
          band: band1,
          cls: formatClassLabel(s1.classSection),
          gender: 'Prefer not to say',
        },
        bf,
        ac: [1, 1],
        ri,
        durationSec: 540,
        ...persScored,
        administeredBy: 'Dr. Sunita Gill',
        version: '1.0',
      };
      records.push(persRec);
    }

    if (s2) {
      // 3. Seeded 40-item Reasoning Screen (3PL IRT)
      const age2 = inferAgeFromClassSection(s2.classSection);
      const choices = IQ_BANK.map((it, idx) => (idx < 27 || idx === 30 ? it.a : (it.a + 1) % it.k));
      const times = IQ_BANK.map((_, idx) => 14 + (idx % 12) * 2);
      const iqScored = scoreIQ(choices, times);
      const iqRec: PsychometricIqRecord = {
        id: `iq-seed-${schoolId}-1`,
        schoolId,
        studentId: s2.id,
        ts: baseTs,
        type: 'iq',
        p: {
          studentId: s2.id,
          name: s2.name,
          age: age2,
          band: ageBand(age2),
          cls: formatClassLabel(s2.classSection),
          gender: 'Prefer not to say',
        },
        choices,
        times,
        durationSec: 1120,
        ...iqScored,
        administeredBy: 'Dr. Sunita Gill',
        version: '1.0',
      };
      records.push(iqRec);
    }
  }

  return records;
}

export function registerPsychometricRoutes(app: Express, deps: PsychometricRouteDeps) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // Repair any legacy seed records that were mapped to Nursery students before the Grade 6-12 filter
  const bootDb = getDb();
  if (Array.isArray(bootDb.psychometricRecords)) {
    const hasLegacyNurserySeed = bootDb.psychometricRecords.some(
      (r) =>
        /^(bt|ps|iq)-seed-/.test(r.id) &&
        /(nursery|lkg|ukg|kg)/i.test(r.p?.cls || ''),
    );
    if (hasLegacyNurserySeed) {
      const nonSeed = bootDb.psychometricRecords.filter((r) => !/^(bt|ps|iq)-seed-/.test(r.id));
      const freshSeeds = createPsychometricSeedRecords({
        schoolIds: bootDb.schools.map((s) => s.id),
        students: bootDb.students,
      });
      bootDb.psychometricRecords = [...nonSeed, ...freshSeeds];
      saveDb();
    }
  }

  app.get('/api/psychometric/records', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    const user = req.user!;
    const { type, studentId } = req.query as { type?: string; studentId?: string };

    const isStudentOrParent = user.role === 'student' || user.role === 'parent';
    const linkedIds = new Set(user.linkedStudentIds || []);

    const records = (db.psychometricRecords || [])
      .filter((r) => {
        if (r.schoolId !== schoolId) return false;
        if (isStudentOrParent && (!r.studentId || !linkedIds.has(r.studentId))) return false;
        if (type && type !== 'all' && r.type !== type) return false;
        if (studentId && r.studentId !== studentId) return false;
        return true;
      })
      .sort((a, b) => b.ts - a.ts);

    res.json({ count: records.length, records });
  });

  app.post('/api/psychometric/records', requireAuth, (req: IntelligenceAuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
    const user = req.user!;
    const body = req.body as Partial<PsychometricRecord> & {
      type?: 'battery' | 'iq' | 'personality';
      studentId?: string;
      p?: {
        studentId?: string;
        name?: string;
        age?: number;
        cls?: string;
        gender?: string;
      };
      durationSec?: number;
      // iq
      choices?: number[];
      times?: number[];
      // personality
      bf?: number[];
      ac?: number[];
      ri?: number[];
      pageTimes?: number[];
      // battery
      res?: PsychometricBatteryRecord['res'];
    };

    if (!body.type || !['battery', 'iq', 'personality'].includes(body.type)) {
      res.status(400).json({ error: 'Valid test type (battery | iq | personality) is required.' });
      return;
    }

    // Bind studentId cleanly: student role always binds to own studentId
    let resolvedStudentId = body.studentId || body.p?.studentId;
    if (user.role === 'student') {
      resolvedStudentId = user.linkedStudentIds?.[0] || resolvedStudentId;
    } else if (user.role === 'parent') {
      const allowed = new Set(user.linkedStudentIds || []);
      if (resolvedStudentId && !allowed.has(resolvedStudentId)) {
        res.status(403).json({ error: 'Parents can only submit assessments for their linked students.' });
        return;
      }
      if (!resolvedStudentId) resolvedStudentId = user.linkedStudentIds?.[0];
    }

    const student = resolvedStudentId
      ? db.students.find((s) => s.id === resolvedStudentId && s.schoolId === schoolId)
      : undefined;

    const participantName = (body.p?.name || student?.name || '').trim();
    const participantAge = Number(body.p?.age || (student ? inferAgeFromClassSection(student.classSection) : 14));
    if (!participantName) {
      res.status(400).json({ error: 'Participant name or student selection is required.' });
      return;
    }
    if (!Number.isFinite(participantAge) || participantAge < 10 || participantAge > 80) {
      res.status(400).json({ error: 'Participant age must be between 10 and 80.' });
      return;
    }

    const participant = {
      studentId: student?.id || resolvedStudentId,
      name: participantName,
      age: participantAge,
      band: ageBand(participantAge),
      cls: body.p?.cls || (student ? formatClassLabel(student.classSection) : 'Class 9'),
      gender: body.p?.gender || 'Prefer not to say',
    };

    const ts = Date.now();
    const durationSec = Math.max(1, Math.round(Number(body.durationSec) || 60));
    if (!Array.isArray(db.psychometricRecords)) db.psychometricRecords = [];

    let record: PsychometricRecord;

    if (body.type === 'iq') {
      if (!Array.isArray(body.choices) || body.choices.length !== IQ_BANK.length) {
        res.status(400).json({ error: `Reasoning test requires ${IQ_BANK.length} item choices.` });
        return;
      }
      const times = Array.isArray(body.times)
        ? body.times.map((t) => +Math.max(0, Number(t) || 0).toFixed(1))
        : Array(IQ_BANK.length).fill(0);
      const scored = scoreIQ(body.choices, times);
      record = {
        id: `iq-${ts.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: participant.studentId,
        ts,
        type: 'iq',
        p: participant,
        choices: body.choices,
        times,
        durationSec,
        ...scored,
        administeredBy: user.name,
        version: '1.0',
      };
    } else if (body.type === 'personality') {
      if (
        !Array.isArray(body.bf) ||
        body.bf.length !== BF_ITEMS.length ||
        !Array.isArray(body.ri) ||
        body.ri.length !== RIASEC_ITEMS.length
      ) {
        res.status(400).json({
          error: `Personality test requires ${BF_ITEMS.length} Big Five responses and ${RIASEC_ITEMS.length} RIASEC responses.`,
        });
        return;
      }
      const ac = Array.isArray(body.ac) && body.ac.length === 2 ? body.ac : [1, 1];
      const scored = scorePersonality(body.bf, ac, body.ri, body.pageTimes);
      record = {
        id: `ps-${ts.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: participant.studentId,
        ts,
        type: 'personality',
        p: participant,
        bf: body.bf,
        ac,
        ri: body.ri,
        durationSec,
        ...scored,
        administeredBy: user.name,
        version: '1.0',
      };
    } else {
      if (!body.res || typeof body.res !== 'object') {
        res.status(400).json({ error: 'Cognitive battery requires subtest results map (res).' });
        return;
      }
      const raw = {} as PsychometricBatteryRecord['raw'];
      for (const s of BAT_SUBS) {
        if (!body.res[s.key]) {
          res.status(400).json({ error: `Missing subtest result: ${s.key}` });
          return;
        }
        raw[s.key] = Number(body.res[s.key].raw) || 0;
      }
      const validity = evaluateBatteryValidity(body.res);
      const validPool = db.psychometricRecords.filter(
        (r): r is PsychometricBatteryRecord =>
          r.schoolId === schoolId && r.type === 'battery' && Boolean(r.validity?.valid),
      );
      const draft: PsychometricBatteryRecord = {
        id: `bt-${ts.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        schoolId,
        studentId: participant.studentId,
        ts,
        type: 'battery',
        p: participant,
        raw,
        res: body.res,
        durationSec,
        validity,
        snapshot: { FSIQ: 100, GAI: 100, CPI: 100, VCI: 100, VSI: 100, FRI: 100, WMI: 100, PSI: 100, local: false },
        administeredBy: user.name,
        version: '1.0',
      };
      const scored = scoreBattery(draft, validPool);
      draft.snapshot = {
        FSIQ: scored.FSIQ.score,
        GAI: scored.GAI.score,
        CPI: scored.CPI.score,
        ...(Object.fromEntries(BAT_INDEX_ORDER.map((k) => [k, scored.idx[k].score])) as Record<
          'VCI' | 'VSI' | 'FRI' | 'WMI' | 'PSI',
          number
        >),
        local: scored.local,
      };
      record = draft;
    }

    db.psychometricRecords.unshift(record);
    saveDb();

    appendAuditLog({
      schoolId,
      actor: user,
      action: `SUBMITTED_PSYCHOMETRIC_${record.type.toUpperCase()}`,
      entityType: 'PsychometricRecord',
      entityId: record.id,
      detail: `${participant.name} completed ${record.type} assessment (${participant.cls}, age ${participant.age}).`,
    });

    res.status(201).json({ record });
  });

  app.delete(
    '/api/psychometric/records/:id',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'counsellor']),
    (req: IntelligenceAuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId ?? db.schools[0]?.id;
      const idx = (db.psychometricRecords || []).findIndex(
        (r) => r.id === req.params.id && r.schoolId === schoolId,
      );
      if (idx < 0) {
        res.status(404).json({ error: 'Psychometric record not found in active school.' });
        return;
      }
      const [removed] = db.psychometricRecords.splice(idx, 1);
      saveDb();
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'DELETED_PSYCHOMETRIC_RECORD',
        entityType: 'PsychometricRecord',
        entityId: removed.id,
        detail: `Removed ${removed.type} psychometric record for ${removed.p.name}.`,
      });
      res.json({ deleted: true, id: removed.id });
    },
  );
}
