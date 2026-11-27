import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseState } from './seedData.ts';

export interface SupabaseRuntimeConfig {
  url: string;
  apiKey: string;
  keyKind: 'secret' | 'publishable';
  projectId: string | null;
}

const PROJECT_ID_PATTERN = /^[a-z0-9]{10,40}$/;

/**
 * Validates and resolves Supabase configuration strictly from server-side
 * environment variables (never hardcoded in source code).
 */
export function resolveSupabaseConfig(
  env: Record<string, string | undefined> = process.env,
): SupabaseRuntimeConfig | null {
  const rawProjectId = env.SUPABASE_PROJECT_ID?.trim().toLowerCase() || '';
  const rawUrl = env.SUPABASE_URL?.trim() || '';
  const secretKey =
    env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  const publishableKey =
    env.SUPABASE_PUBLISHABLE_KEY?.trim() || env.SUPABASE_ANON_KEY?.trim() || '';

  const apiKey = secretKey || publishableKey;
  if (!apiKey) return null;

  let resolvedUrl = '';
  let resolvedProjectId: string | null = null;

  if (rawUrl) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return null;
    }
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) {
      return null;
    }
    const sub = parsed.hostname.slice(0, -'.supabase.co'.length);
    if (!PROJECT_ID_PATTERN.test(sub)) {
      return null;
    }
    resolvedUrl = `https://${sub}.supabase.co`;
    resolvedProjectId = sub;
  } else if (rawProjectId) {
    if (!PROJECT_ID_PATTERN.test(rawProjectId)) {
      return null;
    }
    resolvedUrl = `https://${rawProjectId}.supabase.co`;
    resolvedProjectId = rawProjectId;
  } else {
    return null;
  }

  return {
    url: resolvedUrl,
    apiKey,
    keyKind: secretKey ? 'secret' : 'publishable',
    projectId: resolvedProjectId,
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey: string | null = null;

function getSupabaseClient(): SupabaseClient | null {
  const cfg = resolveSupabaseConfig();
  if (!cfg) return null;
  const keyFingerprint = `${cfg.url}::${cfg.keyKind}::${cfg.apiKey.length}`;
  if (cachedClient && cachedConfigKey === keyFingerprint) {
    return cachedClient;
  }
  cachedClient = createClient(cfg.url, cfg.apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedConfigKey = keyFingerprint;
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return resolveSupabaseConfig() !== null;
}

export interface NormalizedSupabaseRows {
  schools: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  students: Array<Record<string, unknown>>;
  attendance: Array<Record<string, unknown>>;
  examMarks: Array<Record<string, unknown>>;
  feeTransactions: Array<Record<string, unknown>>;
  publicEnquiries: Array<Record<string, unknown>>;
  auditLogs: Array<Record<string, unknown>>;
  staffAttendance: Array<Record<string, unknown>>;
  gatePasses: Array<Record<string, unknown>>;
  visitors: Array<Record<string, unknown>>;
}

/**
 * Projects core domain collections from the authoritative DatabaseState into
 * normalized rows matching `supabase/schema.sql`.
 */
export function mapDatabaseToSupabaseTables(db: DatabaseState): NormalizedSupabaseRows {
  const nowIso = new Date().toISOString();

  const schools = (db.schools || []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    city: s.city,
    state: s.state,
    board: s.board,
    session: s.session,
    subscription_plan: s.subscriptionPlan,
    payment_status: s.paymentStatus || 'Paid',
    student_count: s.studentCount ?? 0,
    enabled_features: s.enabledFeatures || [],
    updated_at: nowIso,
  }));

  const users = (db.users || []).map((u) => ({
    id: u.id,
    school_id: u.schoolId ?? null,
    name: u.name,
    email: u.email,
    role: u.role,
    designation: u.designation,
    class_teacher_of: u.classTeacherOf ?? null,
    subject_specialty: u.subjectSpecialty ?? null,
    updated_at: nowIso,
  }));

  const students = (db.students || []).map((st) => ({
    id: st.id,
    school_id: st.schoolId,
    admission_no: st.admissionNo,
    name: st.name,
    class_section: st.classSection,
    house: st.house ?? null,
    guardian_name: st.guardianName ?? null,
    guardian_phone: st.guardianPhone ?? null,
    attendance_pct: Number.isFinite(st.attendancePct) ? st.attendancePct : 0,
    updated_at: nowIso,
  }));

  const MAX_RELATIONAL_SYNC_ROWS = Number(process.env.SUPABASE_SYNC_MAX_ROWS) || 25000;
  const capRows = <T>(items: T[] | undefined, label: string): T[] => {
    const arr = items || [];
    if (arr.length > MAX_RELATIONAL_SYNC_ROWS) {
      console.warn(
        `Supabase sync: ${label} has ${arr.length} rows exceeding SUPABASE_SYNC_MAX_ROWS (${MAX_RELATIONAL_SYNC_ROWS}); syncing most recent ${MAX_RELATIONAL_SYNC_ROWS}.`,
      );
      return arr.slice(0, MAX_RELATIONAL_SYNC_ROWS);
    }
    return arr;
  };

  const attendance = capRows(db.attendance, 'attendance').map((a) => ({
    id: a.id,
    school_id: a.schoolId,
    student_id: a.studentId,
    attendance_date: a.date,
    status: a.status,
    mode: a.markingMode || 'manual',
    marked_by: a.markedBy || a.correctedBy || null,
    remarks: a.note || a.contextNote || null,
    updated_at: nowIso,
  }));

  const examMarks = capRows(db.examMarks, 'examMarks').map((m) => ({
    id: m.id,
    school_id: m.schoolId,
    student_id: m.studentId,
    exam_name: m.examName,
    subject: m.subject,
    marks_obtained: Number.isFinite(m.obtainedMarks) ? m.obtainedMarks : 0,
    max_marks: Number.isFinite(m.maxMarks) ? m.maxMarks : 100,
    exam_date: m.date ?? null,
    updated_at: nowIso,
  }));

  const feeTransactions = capRows(db.feeTransactions, 'feeTransactions').map((f) => ({
    id: f.id,
    school_id: f.schoolId,
    student_id: f.studentId,
    amount_inr: Number.isFinite(f.amountPaidInr) ? f.amountPaidInr : 0,
    status: f.status,
    payment_mode: f.schedule ?? null,
    paid_on: f.paidDate ?? null,
    receipt_no: f.receiptNo ?? null,
    updated_at: nowIso,
  }));

  const publicEnquiries = capRows(db.publicEnquiries, 'publicEnquiries').map((e) => ({
    id: e.id,
    enquiry_type: e.type,
    school_or_org_name: e.schoolOrOrgName ?? null,
    contact_name: e.contactName,
    email: e.email,
    phone: e.phone,
    city_state: e.cityState ?? null,
    message: e.message ?? null,
    created_date: e.createdAt ?? null,
    updated_at: nowIso,
  }));

  const auditLogs = capRows(db.auditLogs, 'auditLogs').map((l) => ({
    id: l.id,
    school_id: l.schoolId ?? null,
    actor_name: l.actorName,
    actor_role: l.actorRole,
    action: l.action,
    entity_type: l.entityType,
    entity_id: l.entityId,
    detail: l.detail,
    logged_at: l.timestamp,
  }));

  const staffAttendance = capRows(db.staffAttendance, 'staffAttendance').map((a) => ({
    id: a.id,
    school_id: a.schoolId,
    staff_id: a.staffId,
    attendance_date: a.date,
    status: a.status,
    marking_mode: a.markingMode || 'manual',
    check_in_time: a.checkInTime ?? null,
    check_out_time: a.checkOutTime ?? null,
    marked_by: a.markedBy ?? null,
    updated_at: a.updatedAt || nowIso,
  }));

  const gatePasses = capRows(db.gatePasses, 'gatePasses').map((g) => ({
    id: g.id,
    school_id: g.schoolId,
    pass_code: g.passCode,
    subject_type: g.subjectType,
    person_name: g.studentName || g.staffName || 'Unknown',
    reason: g.reason,
    expected_exit_time: g.expectedExitTime,
    status: g.status,
    approved_by: g.approvedByName ?? null,
    updated_at: g.updatedAt || nowIso,
  }));

  const visitors = capRows(db.visitorLogs, 'visitorLogs').map((v) => ({
    id: v.id,
    school_id: v.schoolId,
    badge_code: v.badgeCode,
    visitor_name: v.visitorName,
    phone: v.phone,
    category: v.category,
    purpose: v.purpose,
    person_to_meet: v.personToMeet,
    id_proof_masked: v.idProofMasked,
    status: v.status,
    check_in_at: v.checkInAt,
    check_out_at: v.checkOutAt ?? null,
    duration_minutes: v.durationMinutes ?? null,
    updated_at: nowIso,
  }));

  return {
    schools,
    users,
    students,
    attendance,
    examMarks,
    feeTransactions,
    publicEnquiries,
    auditLogs,
    staffAttendance,
    gatePasses,
    visitors,
  };
}

async function upsertInChunks(
  client: SupabaseClient,
  table: string,
  rows: Array<Record<string, unknown>>,
  chunkSize = 250,
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    const { error } = await client.from(table).upsert(slice, { onConflict: 'id' });
    if (error) {
      throw new Error(`Supabase sync error on ${table}: ${error.message}`);
    }
  }
}

/**
 * Loads the persisted Rai Plus DatabaseState snapshot from Supabase `rai_app_state`
 * if configured and already populated.
 */
export async function loadStateFromSupabase(): Promise<DatabaseState | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('rai_app_state')
      .select('payload')
      .eq('id', 'primary')
      .maybeSingle();
    if (error) {
      console.warn(`Supabase startup hydration skipped: ${error.message}`);
      return null;
    }
    const payload = data?.payload as DatabaseState | undefined;
    if (payload && Array.isArray(payload.schools) && Array.isArray(payload.users)) {
      return payload;
    }
    return null;
  } catch (err) {
    console.warn(
      'Supabase startup hydration skipped:',
      err instanceof Error ? err.message : 'connection unavailable',
    );
    return null;
  }
}

/**
 * Persists the authoritative state snapshot and normalized core tables to Supabase.
 */
export async function persistStateToSupabase(
  db: DatabaseState,
  schemaVersion: number,
  revision: number,
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error: stateErr } = await client.from('rai_app_state').upsert(
      {
        id: 'primary',
        schema_version: schemaVersion,
        revision,
        payload: db,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (stateErr) {
      console.warn(`Supabase rai_app_state sync skipped: ${stateErr.message}`);
      return false;
    }

    const tables = mapDatabaseToSupabaseTables(db);
    // Parent master table first, then parallel child table upserts for fast non-blocking sync
    await upsertInChunks(client, 'rai_schools', tables.schools);
    await Promise.all([
      upsertInChunks(client, 'rai_users', tables.users),
      upsertInChunks(client, 'rai_students', tables.students),
      upsertInChunks(client, 'rai_attendance', tables.attendance),
      upsertInChunks(client, 'rai_exam_marks', tables.examMarks),
      upsertInChunks(client, 'rai_fee_transactions', tables.feeTransactions),
      upsertInChunks(client, 'rai_public_enquiries', tables.publicEnquiries),
      upsertInChunks(client, 'rai_audit_logs', tables.auditLogs),
      upsertInChunks(client, 'rai_staff_attendance', tables.staffAttendance),
      upsertInChunks(client, 'rai_gate_passes', tables.gatePasses),
      upsertInChunks(client, 'rai_visitors', tables.visitors),
    ]);
    return true;
  } catch (err) {
    console.warn(
      'Supabase background sync skipped:',
      err instanceof Error ? err.message : 'sync failed',
    );
    return false;
  }
}

let pendingSyncTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;
let latestQueuedSync: { db: DatabaseState; schemaVersion: number; revision: number } | null = null;

/**
 * Non-blocking coalesced sync triggered automatically whenever `saveDb()` writes data.
 * Rapid consecutive mutations collapse into a single Supabase write without blocking API calls.
 */
export function scheduleSupabaseSync(
  db: DatabaseState,
  schemaVersion: number,
  revision: number,
): void {
  if (!isSupabaseConfigured()) return;
  latestQueuedSync = { db, schemaVersion, revision };

  if (pendingSyncTimer) return;
  pendingSyncTimer = setTimeout(() => {
    pendingSyncTimer = null;
    void flushSupabaseSyncQueue();
  }, 250);
}

async function flushSupabaseSyncQueue(): Promise<void> {
  if (syncInFlight || !latestQueuedSync) return;
  syncInFlight = true;
  const job = latestQueuedSync;
  latestQueuedSync = null;
  try {
    await persistStateToSupabase(job.db, job.schemaVersion, job.revision);
  } finally {
    syncInFlight = false;
    if (latestQueuedSync) {
      void flushSupabaseSyncQueue();
    }
  }
}
