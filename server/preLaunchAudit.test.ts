import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const BASE_URL = process.env.RAI_AUDIT_URL || 'http://127.0.0.1:3000';
const NEW_LOGO_PATH = '/assets/aistudio/Beige_and_Orange_Minimal_Design_Studio_Logo_846b232a.png';
const OLD_LOGO_TOKEN = 'Beige_and_Orange_Minimal_Design_Studio_Logo__5__01d71997.png';

interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string | null;
  designation: string;
}

interface OverviewResponse {
  schoolsCount: number;
  schools: Array<{ id: string; name: string; code: string; city: string; state: string; board: string }>;
  demoAccounts: DemoAccount[];
  publishedBlogs: unknown[];
}

async function jsonFetch(
  route: string,
  options: RequestInit & { token?: string; forwardedIp?: string } = {},
) {
  const { token, forwardedIp, headers, ...rest } = options;
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (token) reqHeaders.Authorization = `Bearer ${token}`;
  if (forwardedIp) reqHeaders['X-Forwarded-For'] = forwardedIp;
  if (rest.body && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  const resp = await fetch(`${BASE_URL}${route}`, { ...rest, headers: reqHeaders });
  const text = await resp.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: resp.status, headers: resp.headers, data, raw: text };
}

async function loginAs(account: { userId?: string; email?: string; schoolId?: string }, forwardedIp?: string) {
  const res = await jsonFetch('/api/auth/login', {
    method: 'POST',
    forwardedIp,
    body: JSON.stringify(account),
  });
  assert.equal(res.status, 200, `Expected 200 login for ${account.email || account.userId}, got ${res.status}`);
  const payload = res.data as { token: string; user: DemoAccount; activeSchoolId: string | null };
  assert.ok(payload.token && payload.token.length >= 32, 'Expected strong random session token');
  return payload;
}

async function logout(token: string) {
  await jsonFetch('/api/auth/logout', { method: 'POST', token });
}

test('1. Branding & Asset Delivery: Updated Rai Plus logo is served cleanly and old references are removed', async () => {
  const resp = await fetch(`${BASE_URL}${NEW_LOGO_PATH}`);
  assert.equal(resp.status, 200, 'New logo asset must return HTTP 200');
  const contentType = resp.headers.get('content-type') || '';
  assert.match(contentType, /image\/png/i, `Expected image/png content type, got ${contentType}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  assert.ok(buf.byteLength > 1000, 'Logo PNG must be non-empty');
  assert.equal(buf[0], 0x89);
  assert.equal(buf[1], 0x50);
  assert.equal(buf[2], 0x4e);
  assert.equal(buf[3], 0x47);

  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  assert.ok(indexHtml.includes(NEW_LOGO_PATH), 'index.html must reference new Rai Plus logo');
  assert.ok(!indexHtml.includes(OLD_LOGO_TOKEN), 'index.html must not contain old logo reference');

  const transportSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/transportEngine.ts'), 'utf8');
  assert.ok(transportSrc.includes(NEW_LOGO_PATH), 'RAI_PLUS_LOGO_URL must reference new logo');
  assert.ok(!transportSrc.includes(OLD_LOGO_TOKEN), 'transportEngine.ts must not contain old logo');

  const feeSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/utils/feeStructureEngine.ts'), 'utf8');
  assert.ok(feeSrc.includes(NEW_LOGO_PATH), 'feeStructureEngine.ts printable header must reference new logo');
  assert.ok(!feeSrc.includes(OLD_LOGO_TOKEN), 'feeStructureEngine.ts must not contain old logo');
});

test('2. Security Headers & API Error Hardening: Strict headers, no stack traces, strict JSON errors', async () => {
  const health = await jsonFetch('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.headers.get('x-powered-by'), null, 'X-Powered-By header must be suppressed');
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(health.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.ok(health.headers.get('permissions-policy'), 'Permissions-Policy header must be present');
  assert.equal(health.headers.get('x-dns-prefetch-control'), 'off');
  assert.match(health.headers.get('cache-control') || '', /no-store/i);

  const notFound = await jsonFetch('/api/nonexistent-audit-probe-404');
  assert.equal(notFound.status, 404);
  assert.equal(typeof notFound.data, 'object', 'Unknown API route must return JSON, not HTML');

  const malformed = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: '{"broken_json":',
  });
  assert.equal(malformed.status, 400, 'Malformed JSON must return 400');
  const malformedBody = (await malformed.json()) as { error?: string };
  assert.ok(malformedBody.error, 'Malformed JSON response must be structured JSON');
  assert.ok(!malformedBody.error.includes('at JSON.parse'), 'Error response must not expose stack traces');
});

test('3. Authentication, Session Revocation & Client Token Storage Audit', async () => {
  const unauth = await jsonFetch('/api/workspace');
  assert.equal(unauth.status, 401, 'Unauthenticated /api/workspace must return 401');

  const forged = await jsonFetch('/api/workspace', { token: 'forged-invalid-token-000000000000' });
  assert.equal(forged.status, 401, 'Forged bearer token must return 401');

  const badLogin = await jsonFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent-user@raiplus.invalid' }),
  });
  assert.equal(badLogin.status, 401, 'Invalid user login must return 401');

  const overview = (await jsonFetch('/api/public/overview')).data as OverviewResponse;
  const teacher = overview.demoAccounts.find((a) => a.role === 'teacher');
  assert.ok(teacher, 'Seeded teacher account must exist');

  const session = await loginAs({ userId: teacher.id });
  const authedWs = await jsonFetch('/api/workspace', { token: session.token });
  assert.equal(authedWs.status, 200, 'Valid session token must load workspace');

  const logoutRes = await jsonFetch('/api/auth/logout', { method: 'POST', token: session.token });
  assert.equal(logoutRes.status, 200, 'Logout endpoint must succeed');

  const reused = await jsonFetch('/api/workspace', { token: session.token });
  assert.equal(reused.status, 401, 'Revoked session token must immediately be rejected with 401');

  // Verify client App.tsx does not store bearer tokens in browser storage
  const appSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
  assert.ok(
    !appSrc.includes("sessionStorage.setItem('vs360_token'"),
    'App.tsx must not persist session tokens to sessionStorage',
  );
  assert.ok(
    !appSrc.includes("localStorage.setItem('vs360_token'"),
    'App.tsx must not persist session tokens to localStorage',
  );
  assert.ok(appSrc.includes('/api/auth/logout'), 'App.tsx must revoke server session on logout');
});

test('4. Multi-School Tenant Isolation: Cross-school read/write and tenant switching are blocked', async () => {
  const overview = (await jsonFetch('/api/public/overview')).data as OverviewResponse;
  assert.ok(overview.schools.length >= 2, 'At least two school tenants are required for isolation tests');

  const [schoolA, schoolB] = overview.schools;
  const schoolAAdmin = overview.demoAccounts.find(
    (a) => a.schoolId === schoolA.id && (a.role === 'school_admin' || a.role === 'principal'),
  );
  const schoolBAdmin = overview.demoAccounts.find(
    (a) => a.schoolId === schoolB.id && (a.role === 'school_admin' || a.role === 'principal'),
  );
  assert.ok(schoolAAdmin && schoolBAdmin, 'Both schools must have admin/principal accounts');

  const sessionA = await loginAs({ userId: schoolAAdmin.id });
  const sessionB = await loginAs({ userId: schoolBAdmin.id });

  try {
    const wsA = (await jsonFetch('/api/workspace', { token: sessionA.token })).data as {
      activeSchool: { id: string };
      students: Array<{ id: string; schoolId: string; admissionNo: string }>;
    };
    const wsB = (await jsonFetch('/api/workspace', { token: sessionB.token })).data as {
      activeSchool: { id: string };
      students: Array<{ id: string; schoolId: string; admissionNo: string }>;
    };

    assert.equal(wsA.activeSchool.id, schoolA.id);
    assert.equal(wsB.activeSchool.id, schoolB.id);
    assert.ok(wsA.students.length > 0 && wsB.students.length > 0, 'Both schools must contain students');
    assert.ok(
      wsA.students.every((s) => s.schoolId === schoolA.id),
      'School A workspace must contain zero students from other schools',
    );
    assert.ok(
      wsB.students.every((s) => s.schoolId === schoolB.id),
      'School B workspace must contain zero students from other schools',
    );

    // Attempt forbidden tenant switch by School A admin into School B
    const switchAttempt = await jsonFetch('/api/auth/switch-school', {
      method: 'POST',
      token: sessionA.token,
      body: JSON.stringify({ schoolId: schoolB.id }),
    });
    assert.equal(switchAttempt.status, 403, 'School-scoped admin must not switch tenants');

    // Attempt cross-tenant report card access for a School B student using School A token
    const targetStudentB = wsB.students[0];
    const crossReport = await jsonFetch(`/api/report-card/${encodeURIComponent(targetStudentB.id)}`, {
      token: sessionA.token,
    });
    assert.ok(
      crossReport.status === 403 || crossReport.status === 404,
      `Cross-tenant report card access must be denied (403/404), got ${crossReport.status}`,
    );

    // Attempt cross-tenant attendance scan for a School B student using School A token
    const crossScan = await jsonFetch('/api/attendance/scan', {
      method: 'POST',
      token: sessionA.token,
      body: JSON.stringify({
        identifier: targetStudentB.admissionNo,
        date: new Date().toISOString().slice(0, 10),
        mode: 'manual',
      }),
    });
    assert.ok(
      crossScan.status === 400 || crossScan.status === 403 || crossScan.status === 404,
      `Cross-tenant attendance scan must be denied, got ${crossScan.status}`,
    );
  } finally {
    await logout(sessionA.token);
    await logout(sessionB.token);
  }
});

test('5. RBAC, COO Pricing Governance & Attendance Plan Entitlements', async () => {
  const overview = (await jsonFetch('/api/public/overview')).data as OverviewResponse;
  const parent = overview.demoAccounts.find((a) => a.role === 'parent');
  const teacher = overview.demoAccounts.find((a) => a.role === 'teacher');
  const superAdmin = overview.demoAccounts.find(
    (a) => a.role === 'super_admin' && a.email.toLowerCase() !== 'coo@raiplus.in',
  );
  const coo = overview.demoAccounts.find((a) => a.email.toLowerCase() === 'coo@raiplus.in');
  const schoolA = overview.schools[0];

  assert.ok(parent && teacher && coo, 'Parent, Teacher, and COO accounts must exist');

  const parentSession = await loginAs({ userId: parent.id });
  const teacherSession = await loginAs({ userId: teacher.id });
  const cooSession = await loginAs({ userId: coo.id });
  const saSession = superAdmin ? await loginAs({ userId: superAdmin.id }) : null;

  try {
    // Parent data scope: only linked children, no admin or financial mutations
    const parentWs = (await jsonFetch('/api/workspace', { token: parentSession.token })).data as {
      students: Array<{ id: string }>;
    };
    assert.ok(
      parentWs.students.length <= 4,
      `Parent must only see linked children, got ${parentWs.students.length} students`,
    );

    for (const [label, route, method] of [
      ['Parent -> create school', '/api/schools', 'POST'],
      ['Parent -> plan pricing', '/api/platform/plan-pricing', 'PATCH'],
      ['Parent -> attendance roster', '/api/attendance/roster', 'POST'],
      ['Parent -> fee collection', '/api/fees/collect', 'POST'],
      ['Parent -> batch marks', '/api/marks/batch', 'POST'],
    ] as const) {
      const r = await jsonFetch(route, {
        method,
        token: parentSession.token,
        body: JSON.stringify({}),
      });
      assert.equal(r.status, 403, `${label} must return 403, got ${r.status}`);
    }

    // Teacher privilege boundary
    for (const [label, route, method] of [
      ['Teacher -> plan pricing', '/api/platform/plan-pricing', 'PATCH'],
      ['Teacher -> create school', '/api/schools', 'POST'],
      ['Teacher -> school entitlements', `/api/schools/${schoolA.id}/entitlements`, 'PATCH'],
      ['Teacher -> fee collection', '/api/fees/collect', 'POST'],
    ] as const) {
      const r = await jsonFetch(route, {
        method,
        token: teacherSession.token,
        body: JSON.stringify({}),
      });
      assert.equal(r.status, 403, `${label} must return 403, got ${r.status}`);
    }

    // Non-COO Super Admin cannot alter platform plan pricing
    if (saSession) {
      const saPricing = await jsonFetch('/api/platform/plan-pricing', {
        method: 'PATCH',
        token: saSession.token,
        body: JSON.stringify({ pricing: {} }),
      });
      assert.equal(saPricing.status, 403, 'Non-COO Super Admin must be denied on plan pricing updates');
    }

    // COO is authorized on /api/platform/plan-pricing (sending empty payload checks auth passes -> 400 validation, not 403)
    const cooPricingProbe = await jsonFetch('/api/platform/plan-pricing', {
      method: 'PATCH',
      token: cooSession.token,
      body: JSON.stringify({ pricing: {} }),
    });
    assert.notEqual(cooPricingProbe.status, 401);
    assert.notEqual(cooPricingProbe.status, 403, 'COO of Rai Plus must be authorized for plan pricing');
  } finally {
    await logout(parentSession.token);
    await logout(teacherSession.token);
    await logout(cooSession.token);
    if (saSession) await logout(saSession.token);
  }
});

test('6. Input Sanitization & PDF Subprocess Sandbox Verification', () => {
  const psySrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/psychometric/PsychometricReportsAndAnalytics.tsx'),
    'utf8',
  );
  assert.ok(
    psySrc.includes('escapeHtml(record.p.name)'),
    'Psychometric HTML export must escape student names before title interpolation',
  );

  const serverSrc = fs.readFileSync(path.resolve(process.cwd(), 'server.ts'), 'utf8');
  assert.ok(serverSrc.includes("'-dSAFER'"), 'Ghostscript PDF extraction must enforce -dSAFER');
  assert.ok(serverSrc.includes('MAX_DRIVE_PDF_BYTES'), 'Drive PDF extraction must enforce size ceiling');
  assert.ok(serverSrc.includes('timeout: 20_000'), 'Ghostscript execution must enforce a timeout');
});

test('7. Database Persistence & Referential Integrity Check', () => {
  const dbPath = path.resolve(process.cwd(), '.data/virat_student_360.json');
  assert.ok(fs.existsSync(dbPath), 'Persisted JSON database file must exist');
  const raw = fs.readFileSync(dbPath, 'utf8');
  const parsed = JSON.parse(raw) as {
    _schemaVersion?: number;
    schools?: Array<{ id: string }>;
    users?: Array<{ id: string; schoolId: string | null }>;
    students?: Array<{ id: string; schoolId: string }>;
  };

  assert.ok(typeof parsed._schemaVersion === 'number' && parsed._schemaVersion >= 1);
  assert.ok(Array.isArray(parsed.schools) && parsed.schools.length >= 2);
  assert.ok(Array.isArray(parsed.users) && parsed.users.length >= 5);
  assert.ok(Array.isArray(parsed.students) && parsed.students.length >= 10);

  const schoolIds = new Set(parsed.schools.map((s) => s.id));
  const orphanedStudents = parsed.students.filter((st) => !schoolIds.has(st.schoolId));
  assert.equal(orphanedStudents.length, 0, 'Every student record must reference an existing school');
});

test('8. Performance & Concurrency Load Test: 50x health + 25x authenticated workspace', async () => {
  const healthStart = performance.now();
  const healthTimings: number[] = [];
  const healthResults = await Promise.all(
    Array.from({ length: 50 }, async () => {
      const t0 = performance.now();
      const res = await jsonFetch('/api/health');
      healthTimings.push(performance.now() - t0);
      return res.status;
    }),
  );
  const healthTotalMs = performance.now() - healthStart;
  assert.ok(healthResults.every((s) => s === 200), 'All 50 concurrent /api/health calls must return 200');
  healthTimings.sort((a, b) => a - b);
  const healthP95 = healthTimings[Math.floor(healthTimings.length * 0.95)] ?? 0;
  assert.ok(healthP95 < 500, `Health p95 latency (${healthP95.toFixed(1)}ms) must be < 500ms`);

  const overview = (await jsonFetch('/api/public/overview')).data as OverviewResponse;
  const admin = overview.demoAccounts.find((a) => a.role === 'school_admin' || a.role === 'principal')!;
  const session = await loginAs({ userId: admin.id });

  try {
    // Prime once to verify valid JSON structure + gzip compression
    const primeResp = await fetch(`${BASE_URL}/api/workspace`, {
      headers: { Authorization: `Bearer ${session.token}`, 'Accept-Encoding': 'gzip' },
    });
    assert.equal(primeResp.status, 200);
    assert.equal(primeResp.headers.get('content-encoding'), 'gzip', 'Workspace response must use gzip compression');
    const primeJson = (await primeResp.json()) as { activeSchool?: { id: string } };
    assert.ok(primeJson.activeSchool?.id, 'Workspace payload must parse cleanly');

    const rawHttpGet = (route: string, token: string) =>
      new Promise<{ status: number; bytes: number; encoding: string | undefined }>((resolve, reject) => {
        const req = http.get(
          `${BASE_URL}${route}`,
          { headers: { Authorization: `Bearer ${token}`, 'Accept-Encoding': 'gzip' } },
          (res) => {
            let bytes = 0;
            res.on('data', (chunk: Buffer) => {
              bytes += chunk.byteLength;
            });
            res.on('end', () => {
              resolve({
                status: res.statusCode ?? 0,
                bytes,
                encoding: res.headers['content-encoding'],
              });
            });
          },
        );
        req.on('error', reject);
      });

    const wsTimings: number[] = [];
    let wireBytes = 0;
    const wsResults = await Promise.all(
      Array.from({ length: 25 }, async () => {
        const t0 = performance.now();
        const r = await rawHttpGet('/api/workspace', session.token);
        wsTimings.push(performance.now() - t0);
        wireBytes = r.bytes;
        assert.equal(r.encoding, 'gzip');
        return r.status;
      }),
    );
    assert.ok(wsResults.every((s) => s === 200), 'All 25 concurrent /api/workspace calls must return 200');
    wsTimings.sort((a, b) => a - b);
    const wsP50 = wsTimings[Math.floor(wsTimings.length * 0.5)] ?? 0;
    const wsP95 = wsTimings[Math.floor(wsTimings.length * 0.95)] ?? 0;
    assert.ok(wsP95 < 1000, `Workspace p95 latency (${wsP95.toFixed(1)}ms) must be < 1000ms`);
    console.log(
      `[Perf Benchmark] 50x /api/health total=${healthTotalMs.toFixed(1)}ms p95=${healthP95.toFixed(1)}ms | 25x /api/workspace (gzip ${(wireBytes / 1024).toFixed(0)} KB) p50=${wsP50.toFixed(1)}ms p95=${wsP95.toFixed(1)}ms`,
    );
  } finally {
    await logout(session.token);
  }
});

test('9. Brute-Force Rate Limiting: Login endpoint returns 429 + Retry-After under burst flood', async () => {
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  let sawRateLimit = false;
  let retryAfterHeader: string | null = null;

  for (let i = 0; i < 45; i++) {
    const res = await jsonFetch('/api/auth/login', {
      method: 'POST',
      forwardedIp: testIp,
      body: JSON.stringify({ email: `brute-force-${i}@invalid.local` }),
    });
    if (res.status === 429) {
      sawRateLimit = true;
      retryAfterHeader = res.headers.get('retry-after');
      break;
    }
    assert.equal(res.status, 401, `Expected 401 before rate limit threshold, got ${res.status}`);
  }

  assert.equal(sawRateLimit, true, 'Login rate limiter must enforce HTTP 429 under burst attacks');
  assert.ok(
    retryAfterHeader && Number(retryAfterHeader) >= 1,
    `Expected valid Retry-After header on 429, got ${retryAfterHeader}`,
  );
});
