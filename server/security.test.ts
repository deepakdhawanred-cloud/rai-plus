import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { Request } from 'express';
import {
  extractSessionToken,
  extractTextFromPdfBufferFallback,
  hashPassword,
  isDemoLoginEnabled,
  parseCookieHeader,
  sanitizeUserForClient,
  verifyPassword,
} from './security.ts';
import type { UserAccount } from '../src/types';

test('scrypt password hashing produces unique salted hashes and constant-time verification', () => {
  const hashA = hashPassword('RaiPlus#2026Strong!');
  const hashB = hashPassword('RaiPlus#2026Strong!');
  assert.ok(hashA.startsWith('scrypt$'));
  assert.notEqual(hashA, hashB, 'Each password hash must use a unique random salt');
  assert.equal(verifyPassword('RaiPlus#2026Strong!', hashA), true);
  assert.equal(verifyPassword('WrongPassword123', hashA), false);
  assert.equal(verifyPassword('', hashA), false);
  assert.equal(verifyPassword('RaiPlus#2026Strong!', 'plaintext-hash'), false);
});

test('sanitizeUserForClient strips passwordHash without mutating original object', () => {
  const user: UserAccount = {
    id: 'u-sec-1',
    name: 'Dr. Test Principal',
    email: 'principal@school.edu.in',
    role: 'principal',
    schoolId: 'school-vis-jjr',
    designation: 'Principal',
    passwordHash: hashPassword('Secret123!'),
  };
  const sanitized = sanitizeUserForClient(user) as Record<string, unknown>;
  assert.equal('passwordHash' in sanitized, false, 'passwordHash must never be serialized to clients');
  assert.equal(sanitized.email, user.email);
  assert.ok(user.passwordHash, 'Original server user record remains intact');
});

test('isDemoLoginEnabled disables passwordless demo accounts by default in production', () => {
  assert.equal(isDemoLoginEnabled({ NODE_ENV: 'production' }), false);
  assert.equal(isDemoLoginEnabled({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'false' }), false);
  assert.equal(isDemoLoginEnabled({ NODE_ENV: 'production', ENABLE_DEMO_LOGIN: 'true' }), true);
  assert.equal(isDemoLoginEnabled({ NODE_ENV: 'development' }), true);
  assert.equal(isDemoLoginEnabled({ NODE_ENV: 'development', ENABLE_DEMO_LOGIN: 'false' }), false);
});

test('cookie parser and session token extractor prefer Authorization Bearer then HttpOnly cookie', () => {
  const parsed = parseCookieHeader('theme=navy; rai_session=tok_abc123; lang=hi');
  assert.equal(parsed.rai_session, 'tok_abc123');
  assert.equal(parsed.lang, 'hi');

  const reqWithCookie = {
    headers: { cookie: 'rai_session=cookie_tok_999' },
  } as unknown as Request;
  assert.equal(extractSessionToken(reqWithCookie), 'cookie_tok_999');

  const reqWithBearer = {
    headers: {
      authorization: 'Bearer bearer_tok_111',
      cookie: 'rai_session=cookie_tok_999',
    },
  } as unknown as Request;
  assert.equal(extractSessionToken(reqWithBearer), 'bearer_tok_111');
});

test('PII & sensitive school data guard: zero leaked CSVs, salary sheets, or DMIT PDFs exist in public/', () => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const walk = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return [];
    const results: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(full));
      } else {
        results.push(full);
      }
    }
    return results;
  };

  const publicFiles = walk(publicDir).map((p) => path.relative(publicDir, p).replace(/\\/g, '/'));
  assert.equal(
    publicFiles.some((f) => f.startsWith('assets/aistudio/')),
    false,
    'public/assets/aistudio/ must be completely removed before launch',
  );
  assert.equal(
    publicFiles.some((f) => /FEES|SALARY|EXPENSE|DMIT|Screenshot|Paste_/i.test(f)),
    false,
    `Sensitive or scratch files found in public/: ${publicFiles.join(', ')}`,
  );
  assert.equal(
    publicFiles.some((f) => f.endsWith('.csv') || f.endsWith('.pdf')),
    false,
    `Raw CSV or PDF files must not be served publicly: ${publicFiles.join(', ')}`,
  );
  assert.ok(publicFiles.includes('assets/brand/rai-plus-logo.png'), 'Clean brand logo must exist');
  assert.ok(publicFiles.includes('robots.txt'), 'robots.txt must exist for SEO');
  assert.ok(publicFiles.includes('sitemap.xml'), 'sitemap.xml must exist for SEO');
  assert.ok(publicFiles.includes('manifest.webmanifest'), 'PWA manifest must exist');
});

test('production image integrity: all FOOD_LAB_IMAGES exist in public/assets/images/', () => {
  const engineSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/utils/visualConceptLabEngine.ts'),
    'utf-8',
  );
  assert.equal(
    engineSrc.includes('/src/assets/images/'),
    false,
    'visualConceptLabEngine.ts must not reference dev-only /src/assets/images/ paths',
  );
  const matches = engineSrc.match(/\/assets\/images\/[a-z0-9_.-]+\.jpg/gi) || [];
  assert.ok(matches.length >= 6, 'Expected all 6 food lab images to point to /assets/images/');
  for (const rel of matches) {
    const abs = path.resolve(process.cwd(), 'public', rel.replace(/^\//, ''));
    assert.ok(fs.existsSync(abs), `Missing production image asset: ${abs}`);
  }
});

test('fallback PDF text extractor safely extracts literal text without spawning external binaries', () => {
  const samplePdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Length 44 >>\nstream\nBT (Visual Learner 42%) Tj (Auditory 33%) Tj ET\nendstream\nendobj\n%%EOF',
    'latin1',
  );
  const extracted = extractTextFromPdfBufferFallback(samplePdf);
  assert.match(extracted, /Visual Learner 42%/);
  assert.match(extracted, /Auditory 33%/);
});
