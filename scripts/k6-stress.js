/**
 * Rai Plus — Production k6 Load & Spike Test (500–1,000 VUs)
 *
 * Run against staging/production:
 *   k6 run -e BASE_URL=https://staging.raiplus.in scripts/k6-stress.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export const options = {
  scenarios: {
    morning_bell_spike: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 150 },
        { duration: '1m', target: 500 },
        { duration: '2m', target: 500 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.001'], // < 0.1% failure rate
    http_req_duration: ['p(95)<350', 'p(99)<800'],
  },
};

export function setup() {
  const overviewRes = http.get(`${BASE_URL}/api/public/overview`);
  const overview = overviewRes.json();
  const teacher = (overview.demoAccounts || []).find((a) => a.role === 'teacher');
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ userId: teacher ? teacher.id : '' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  return { token: loginRes.json('token') || '' };
}

export default function (data) {
  const health = http.get(`${BASE_URL}/api/health`);
  check(health, { 'health 200': (r) => r.status === 200 });

  if (data.token) {
    const ws = http.get(`${BASE_URL}/api/workspace`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        'Accept-Encoding': 'gzip',
      },
    });
    check(ws, {
      'workspace 200': (r) => r.status === 200,
      'workspace gzip': (r) => r.headers['Content-Encoding'] === 'gzip',
    });
  }

  sleep(0.5);
}
