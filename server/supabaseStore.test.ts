import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createInitialDatabase } from './seedData.ts';
import {
  mapDatabaseToSupabaseTables,
  resolveSupabaseConfig,
} from './supabaseStore.ts';

test('resolveSupabaseConfig derives valid HTTPS Supabase URL from SUPABASE_PROJECT_ID and rejects unsafe URLs', () => {
  const fromProjectId = resolveSupabaseConfig({
    SUPABASE_PROJECT_ID: 'nsnzsjcqrpkleqifeffz',
    SUPABASE_PUBLISHABLE_KEY: 'test_pub_key_value',
  });
  assert.ok(fromProjectId);
  assert.equal(fromProjectId.url, 'https://nsnzsjcqrpkleqifeffz.supabase.co');
  assert.equal(fromProjectId.keyKind, 'publishable');
  assert.equal(fromProjectId.projectId, 'nsnzsjcqrpkleqifeffz');

  const prefersSecret = resolveSupabaseConfig({
    SUPABASE_URL: 'https://nsnzsjcqrpkleqifeffz.supabase.co',
    SUPABASE_SECRET_KEY: 'test_secret_key_value',
    SUPABASE_PUBLISHABLE_KEY: 'test_pub_key_value',
  });
  assert.ok(prefersSecret);
  assert.equal(prefersSecret.keyKind, 'secret');
  assert.equal(prefersSecret.apiKey, 'test_secret_key_value');

  // Block SSRF / non-Supabase hosts / insecure HTTP / invalid project IDs
  assert.equal(
    resolveSupabaseConfig({
      SUPABASE_URL: 'http://127.0.0.1:54321',
      SUPABASE_SECRET_KEY: 'k',
    }),
    null,
  );
  assert.equal(
    resolveSupabaseConfig({
      SUPABASE_URL: 'https://evil.example.com',
      SUPABASE_SECRET_KEY: 'k',
    }),
    null,
  );
  assert.equal(
    resolveSupabaseConfig({
      SUPABASE_PROJECT_ID: '../bad/id',
      SUPABASE_PUBLISHABLE_KEY: 'k',
    }),
    null,
  );
  assert.equal(resolveSupabaseConfig({ SUPABASE_PROJECT_ID: 'nsnzsjcqrpkleqifeffz' }), null);
});

test('mapDatabaseToSupabaseTables maps core Rai Plus entities to normalized relational schema rows', () => {
  const db = createInitialDatabase();
  const tables = mapDatabaseToSupabaseTables(db);

  assert.ok(tables.schools.length >= 2, 'Expected seeded schools');
  assert.ok(tables.users.length >= 5, 'Expected seeded users');
  assert.ok(tables.students.length >= 10, 'Expected seeded students');

  const schoolRow = tables.schools[0];
  assert.ok(typeof schoolRow.id === 'string' && typeof schoolRow.subscription_plan === 'string');

  const studentRow = tables.students[0];
  assert.ok(typeof studentRow.school_id === 'string' && typeof studentRow.admission_no === 'string');
});

test('Supabase integration files contain zero hardcoded API keys or secrets', () => {
  const filesToCheck = [
    'server/supabaseStore.ts',
    'server/store.ts',
    'supabase/schema.sql',
    '.env.example',
  ];
  for (const rel of filesToCheck) {
    const content = fs.readFileSync(path.resolve(process.cwd(), rel), 'utf8');
    assert.ok(!content.includes('sb_publishable_'), `${rel} must not hardcode publishable keys`);
    assert.ok(!content.includes('sb_secret_'), `${rel} must not hardcode secret keys`);
    assert.ok(!content.includes('eyJhbGci'), `${rel} must not hardcode JWT service keys`);
  }
});
