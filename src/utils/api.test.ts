import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, parseJsonResponse, TransientHtmlResponseError } from './api.ts';

test('apiRequest retries transient cold-start HTML response and succeeds when backend responds with JSON', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    if (calls === 1) {
      return new Response('<!doctype html><html><body>Starting server...</body></html>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ ok: true, schoolsCount: 3 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const result = await apiRequest<{ ok: boolean; schoolsCount: number }>(
      '/api/public/overview',
      {},
      null,
      [5, 5],
    );
    assert.equal(calls, 2);
    assert.equal(result.ok, true);
    assert.equal(result.schoolsCount, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('apiRequest does not retry non-transient 400 JSON errors', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    await assert.rejects(
      () => apiRequest('/api/auth/login', { method: 'POST', body: '{}' }, null, [5, 5]),
      /Invalid email address\./,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('parseJsonResponse throws TransientHtmlResponseError when response body is HTML', async () => {
  const htmlRes = new Response('<html><body>Not JSON</body></html>', {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });
  await assert.rejects(
    () => parseJsonResponse(htmlRes),
    (err: unknown) => err instanceof TransientHtmlResponseError,
  );
});
