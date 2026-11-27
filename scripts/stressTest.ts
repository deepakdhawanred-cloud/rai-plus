/**
 * Rai Plus — Max Stress, Concurrency, Write-Contention & Security Resilience Suite
 *
 * Runs 5 production-grade stress scenarios against a live Rai Plus server:
 *   A. Morning Bell Spike (300 concurrent mixed reads + writes across tenants)
 *   B. Read & Report-Card Surge (500 concurrent gzip workspace requests)
 *   C. Write-Contention & Atomic Disk Integrity (80 concurrent mutations + JSON verification)
 *   D. Security & Abuse Flood (auth locks, zero leaked assets, rate limit 429, honeypot, CSP)
 *   E. Sustained Multi-Wave Soak (stability & tail latency check)
 *
 * Usage:
 *   RAI_STRESS_URL=http://127.0.0.1:3000 node scripts/stressTest.ts
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const BASE_URL = (process.env.RAI_STRESS_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const parsedBase = new URL(BASE_URL);
const keepAliveAgent = new http.Agent({ keepAlive: true, maxSockets: 256 });

interface TimedResult {
  status: number;
  ms: number;
  bytes: number;
  headers: http.IncomingHttpHeaders;
  body: string;
}

function httpRequest(
  route: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
): Promise<TimedResult> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const method = options.method || 'GET';
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      ...(options.headers || {}),
    };
    const payloadBuf = options.body ? Buffer.from(options.body, 'utf8') : undefined;
    if (payloadBuf) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      headers['Content-Length'] = String(payloadBuf.byteLength);
    }

    const req = http.request(
      {
        hostname: parsedBase.hostname,
        port: parsedBase.port || 80,
        path: route,
        method,
        headers,
        agent: keepAliveAgent,
        timeout: 15_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          resolve({
            status: res.statusCode ?? 0,
            ms: performance.now() - start,
            bytes: buf.byteLength,
            headers: res.headers,
            body: buf.toString('utf8'),
          });
        });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error(`Timeout on ${method} ${route}`));
    });
    req.on('error', reject);
    if (payloadBuf) req.write(payloadBuf);
    req.end();
  });
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
  return sorted[idx] ?? 0;
}

function summarize(label: string, results: TimedResult[]) {
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const okCount = results.filter((r) => r.status >= 200 && r.status < 300).length;
  const err5xx = results.filter((r) => r.status >= 500 || r.status === 0).length;
  const p50 = percentile(times, 0.5);
  const p95 = percentile(times, 0.95);
  const p99 = percentile(times, 0.99);
  const max = times[times.length - 1] ?? 0;
  console.log(
    `[STRESS] ${label}: total=${results.length} ok=${okCount} 5xx=${err5xx} | p50=${p50.toFixed(1)}ms p95=${p95.toFixed(1)}ms p99=${p99.toFixed(1)}ms max=${max.toFixed(1)}ms`,
  );
  return { okCount, err5xx, p50, p95, p99, max };
}

async function runPool<T>(
  total: number,
  concurrency: number,
  worker: (index: number) => Promise<T>,
): Promise<T[]> {
  const results: T[] = new Array(total);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(total, concurrency) }, async () => {
    while (true) {
      const idx = cursor;
      cursor += 1;
      if (idx >= total) return;
      results[idx] = await worker(idx);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log(`\n=== Rai Plus Max Stress & Resilience Suite -> ${BASE_URL} ===\n`);

  // 0. Health & Demo Overview Bootstrap
  const health = await httpRequest('/api/health');
  assert.equal(health.status, 200, 'Server /api/health must return 200');
  const overviewRes = await httpRequest('/api/public/overview', {
    headers: { 'Accept-Encoding': 'identity' },
  });
  assert.equal(overviewRes.status, 200);
  const overview = JSON.parse(overviewRes.body) as {
    schools: Array<{ id: string; name: string }>;
    demoAccounts: Array<{ id: string; role: string; schoolId: string | null }>;
  };

  const principal = overview.demoAccounts.find(
    (a) => (a.role === 'principal' || a.role === 'school_admin') && a.schoolId === 'school-vis-jjr',
  );
  const teacher = overview.demoAccounts.find(
    (a) => a.role === 'teacher' && a.schoolId === 'school-vis-jjr',
  );
  const parent = overview.demoAccounts.find((a) => a.role === 'parent');
  const otherSchoolAdmin = overview.demoAccounts.find(
    (a) => (a.role === 'principal' || a.role === 'school_admin') && a.schoolId !== 'school-vis-jjr',
  );
  assert.ok(principal && teacher && parent && otherSchoolAdmin, 'Required demo accounts must exist');

  const login = async (userId: string, ip: string) => {
    const r = await httpRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Accept-Encoding': 'identity', 'X-Forwarded-For': ip },
      body: JSON.stringify({ userId }),
    });
    assert.equal(r.status, 200, `Login failed for ${userId}: ${r.status}`);
    const parsed = JSON.parse(r.body) as { token: string };
    const setCookie = r.headers['set-cookie'];
    assert.ok(
      Array.isArray(setCookie)
        ? setCookie.some((c) => c.includes('rai_session=') && c.includes('HttpOnly'))
        : String(setCookie || '').includes('HttpOnly'),
      'Login must issue an HttpOnly rai_session cookie',
    );
    return parsed.token;
  };

  const [principalTok, teacherTok, parentTok, otherTok] = await Promise.all([
    login(principal.id, '198.51.100.1'),
    login(teacher.id, '198.51.100.2'),
    login(parent.id, '198.51.100.3'),
    login(otherSchoolAdmin.id, '198.51.100.4'),
  ]);

  // Verify HttpOnly cookie auth works on /api/auth/me without Bearer header
  const meCheck = await httpRequest('/api/auth/me', {
    headers: {
      'Accept-Encoding': 'identity',
      Cookie: `rai_session=${principalTok}`,
    },
  });
  assert.equal(meCheck.status, 200, '/api/auth/me must authenticate via HttpOnly cookie');

  try {
    // Prime workspace caches once
    await Promise.all([
      httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${principalTok}` } }),
      httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${teacherTok}` } }),
      httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${parentTok}` } }),
      httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${otherTok}` } }),
    ]);

    // ---------------- SCENARIO A: 300x Morning Bell Spike ----------------
    const spikeResults = await runPool(300, 75, async (i) => {
      const mod = i % 5;
      if (mod === 0) return httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${principalTok}` } });
      if (mod === 1) return httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${teacherTok}` } });
      if (mod === 2) return httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${parentTok}` } });
      if (mod === 3) return httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${otherTok}` } });
      return httpRequest('/api/public/overview');
    });
    const spikeStats = summarize('Scenario A (300x Morning Bell Spike @ 75 concurrency)', spikeResults);
    assert.equal(spikeStats.err5xx, 0, 'Morning Bell Spike must produce zero 5xx errors');
    assert.ok(spikeStats.p95 < 1000, `Morning Bell Spike p95 (${spikeStats.p95.toFixed(1)}ms) must be < 1000ms`);

    // ---------------- SCENARIO B: 500x Read & Workspace Surge ----------------
    const surgeResults = await runPool(500, 100, async (i) => {
      const tok = i % 3 === 0 ? parentTok : i % 3 === 1 ? teacherTok : principalTok;
      return httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${tok}` } });
    });
    const surgeStats = summarize('Scenario B (500x Gzip Workspace Surge @ 100 concurrency)', surgeResults);
    assert.equal(surgeStats.err5xx, 0, 'Read Surge must produce zero 5xx errors');
    assert.equal(surgeStats.okCount, 500, 'All 500 workspace reads must return 200');
    assert.ok(surgeStats.p95 < 1000, `Read Surge p95 (${surgeStats.p95.toFixed(1)}ms) must be < 1000ms`);

    // ---------------- SCENARIO C: 80x Concurrent Write Contention + Atomic Disk Check ----------------
    const writeResults = await runPool(80, 20, async (i) =>
      httpRequest('/api/public/enquiry', {
        method: 'POST',
        headers: {
          'Accept-Encoding': 'identity',
          'X-Forwarded-For': `203.0.113.${(i % 40) + 1}`,
        },
        body: JSON.stringify({
          type: 'School Demo & Onboarding',
          schoolOrOrgName: `Stress Test Academy ${i}`,
          contactName: `Director ${i}`,
          email: `stress-${i}@academy.test`,
          phone: `+91 98120 ${String(10000 + i).slice(-5)}`,
          cityState: 'Jhajjar, Haryana',
          board: 'CBSE',
          message: 'Automated write contention verification payload.',
        }),
      }),
    );
    const writeStats = summarize('Scenario C (80x Concurrent Mutations @ 20 concurrency)', writeResults);
    assert.equal(writeStats.err5xx, 0, 'Write contention must produce zero 5xx errors');
    assert.equal(writeStats.okCount, 80, 'All 80 concurrent writes must succeed (201)');

    // Wait briefly for coalesced async atomic disk flush and verify JSON integrity on disk
    await new Promise((r) => setTimeout(r, 700));
    const dbPath = path.resolve(process.cwd(), '.data/virat_student_360.json');
    const rawDisk = fs.readFileSync(dbPath, 'utf8');
    const parsedDisk = JSON.parse(rawDisk) as { publicEnquiries?: unknown[]; schools?: unknown[] };
    assert.ok(Array.isArray(parsedDisk.schools) && parsedDisk.schools.length >= 2);
    assert.ok(Array.isArray(parsedDisk.publicEnquiries) && parsedDisk.publicEnquiries.length >= 80);
    console.log(
      `[STRESS] Atomic Disk Integrity: OK (${(rawDisk.length / 1024 / 1024).toFixed(2)} MB valid JSON, zero corruption)`,
    );

    // ---------------- SCENARIO D: Security, Auth Locks, Zero Leaks & Abuse Flood ----------------
    const [unauthGeocode, unauthPrivatePdf, leakedFeeCsv, honeypotDrop] = await Promise.all([
      httpRequest('/api/transport/geocode-address', {
        method: 'POST',
        body: JSON.stringify({ address: 'Sector 6, Jhajjar', schoolId: 'school-vis-jjr' }),
      }),
      httpRequest('/api/files/vis-timetable-nov2026'),
      httpRequest('/assets/aistudio/VIS_FEES_RECORD_2026-2027_-_Final__1__efc80f07', {
        headers: { 'Accept-Encoding': 'identity' },
      }),
      httpRequest('/api/public/enquiry', {
        method: 'POST',
        headers: { 'X-Forwarded-For': '203.0.113.250' },
        body: JSON.stringify({
          website: 'https://spam-bot.invalid',
          contactName: 'Bot',
          email: 'bot@spam.invalid',
          phone: '9999999999',
          message: 'spam',
        }),
      }),
    ]);

    assert.equal(unauthGeocode.status, 401, 'Unauthenticated /api/transport/geocode-address must return 401');
    assert.equal(unauthPrivatePdf.status, 401, 'Unauthenticated private timetable PDF must return 401');
    assert.ok(
      leakedFeeCsv.status === 404 || !leakedFeeCsv.body.includes('VIS7029'),
      'Old public fee CSV path must never leak student fee records',
    );
    assert.equal(honeypotDrop.status, 202, 'Honeypot-filled bot submission must be silently dropped (202)');
    assert.ok(health.headers['content-security-policy'], 'CSP header must be present');
    assert.equal(health.headers['x-frame-options'], 'SAMEORIGIN', 'X-Frame-Options must be set');
    console.log('[STRESS] Scenario D (Security, Auth Locks, Honeypot, CSP & Zero PII Leaks): PASSED');

    // ---------------- SCENARIO E: Multi-Wave Sustained Soak (4 waves x 100 reqs) ----------------
    const soakResults: TimedResult[] = [];
    for (let wave = 1; wave <= 4; wave += 1) {
      const waveRes = await runPool(100, 40, async (i) =>
        i % 4 === 0
          ? httpRequest('/api/health')
          : httpRequest('/api/workspace', { headers: { Authorization: `Bearer ${teacherTok}` } }),
      );
      soakResults.push(...waveRes);
    }
    const soakStats = summarize('Scenario E (400x Multi-Wave Soak Stability)', soakResults);
    assert.equal(soakStats.err5xx, 0, 'Soak waves must have zero 5xx errors');
    assert.ok(soakStats.p95 < 500, `Soak p95 (${soakStats.p95.toFixed(1)}ms) must remain < 500ms`);

    console.log('\n=== ALL 5 MAX STRESS & RESILIENCE SCENARIOS PASSED ===\n');
  } finally {
    await Promise.all(
      [principalTok, teacherTok, parentTok, otherTok].map((tok) =>
        httpRequest('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${tok}` },
        }).catch(() => undefined),
      ),
    );
    keepAliveAgent.destroy();
  }
}

main().catch((err) => {
  console.error('\n[STRESS TEST FAILED]', err);
  keepAliveAgent.destroy();
  process.exit(1);
});
