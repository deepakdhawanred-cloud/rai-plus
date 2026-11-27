import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  canReadLearningPortalDoc,
  canWriteLearningPortalDoc,
  deriveDefaultSectionsForSchool,
  isValidLearningPortalDocPath,
  mapRaiRoleToPortalRole,
  parseClassSection,
} from './learningPortalRoutes.ts';
import type { StudentRecord } from '../src/types';

test('Learning Portal static asset bundle integrity: 99 chapters, 3D viewer, 310 visuals, and RaiPlusBridge', () => {
  const portalDir = path.resolve(process.cwd(), 'public', 'learning-portal');
  assert.ok(fs.existsSync(path.join(portalDir, 'index.html')), 'index.html must exist');
  assert.ok(fs.existsSync(path.join(portalDir, 'engine.js')), 'engine.js must exist');
  assert.ok(fs.existsSync(path.join(portalDir, 'plan.js')), 'plan.js must exist');
  assert.ok(fs.existsSync(path.join(portalDir, 'raiplus-bridge.js')), 'raiplus-bridge.js must exist');
  assert.ok(fs.existsSync(path.join(portalDir, 'lib', 'mol3d.js')), 'lib/mol3d.js must exist');
  assert.ok(fs.existsSync(path.join(portalDir, 'vis', 'index.js')), 'vis/index.js must exist');

  const html = fs.readFileSync(path.join(portalDir, 'index.html'), 'utf-8');
  const bridgeIdx = html.indexOf('src="raiplus-bridge.js"');
  const engineIdx = html.indexOf('src="engine.js"');
  assert.ok(bridgeIdx > 0, 'index.html must load raiplus-bridge.js');
  assert.ok(engineIdx > bridgeIdx, 'raiplus-bridge.js must load before engine.js');

  const contentFiles = fs
    .readdirSync(path.join(portalDir, 'content'))
    .filter((f) => f.endsWith('.js'));
  assert.equal(contentFiles.length, 99, 'All 99 interactive chapter packs must be present');

  const visDir = path.join(portalDir, 'vis');
  let visualHtmlCount = 0;
  for (const entry of fs.readdirSync(visDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subFiles = fs
        .readdirSync(path.join(visDir, entry.name))
        .filter((f) => f.endsWith('.html'));
      visualHtmlCount += subFiles.length;
    }
  }
  assert.equal(visualHtmlCount, 310, 'All 310 interactive visual HTML files must be present');
});

test('Learning Portal role mapping and path validation enforce strict boundaries', () => {
  assert.equal(mapRaiRoleToPortalRole('super_admin'), 'admin');
  assert.equal(mapRaiRoleToPortalRole('school_admin'), 'admin');
  assert.equal(mapRaiRoleToPortalRole('principal'), 'admin');
  assert.equal(mapRaiRoleToPortalRole('coordinator'), 'admin');
  assert.equal(mapRaiRoleToPortalRole('teacher'), 'teacher');
  assert.equal(mapRaiRoleToPortalRole('student'), 'student');
  assert.equal(mapRaiRoleToPortalRole('parent'), 'student');

  assert.equal(isValidLearningPortalDocPath('config/school'), true);
  assert.equal(isValidLearningPortalDocPath('coverage/10-A'), true);
  assert.equal(isValidLearningPortalDocPath('settings/10sci04'), true);
  assert.equal(isValidLearningPortalDocPath('profiles/u-stu-1'), true);
  assert.equal(isValidLearningPortalDocPath('progress/u-stu-1'), true);

  assert.equal(isValidLearningPortalDocPath('../etc/passwd'), false);
  assert.equal(isValidLearningPortalDocPath('config/other'), false);
  assert.equal(isValidLearningPortalDocPath('progress/u1/nested'), false);
  assert.equal(isValidLearningPortalDocPath('unknown/abc'), false);
});

test('Learning Portal RBAC isolates student progress, teacher syllabus controls, and admin school setup', () => {
  const admin = { id: 'u-admin', role: 'principal' as const };
  const teacher = { id: 'u-teach', role: 'teacher' as const };
  const studentA = { id: 'u-stu-a', role: 'student' as const };

  // School setup: admin write only; everyone can read
  assert.equal(canReadLearningPortalDoc(studentA, 'config/school'), true);
  assert.equal(canWriteLearningPortalDoc(admin, 'config/school'), true);
  assert.equal(canWriteLearningPortalDoc(teacher, 'config/school'), false);
  assert.equal(canWriteLearningPortalDoc(studentA, 'config/school'), false);

  // Syllabus coverage & lesson format settings: admin + teacher write; student read only
  assert.equal(canReadLearningPortalDoc(studentA, 'coverage/10-A'), true);
  assert.equal(canReadLearningPortalDoc(studentA, 'settings/10sci04'), true);
  assert.equal(canWriteLearningPortalDoc(teacher, 'coverage/10-A'), true);
  assert.equal(canWriteLearningPortalDoc(teacher, 'settings/10sci04'), true);
  assert.equal(canWriteLearningPortalDoc(studentA, 'coverage/10-A'), false);
  assert.equal(canWriteLearningPortalDoc(studentA, 'settings/10sci04'), false);

  // Student progress & profile: self read/write; blocked from peers; staff can read
  assert.equal(canReadLearningPortalDoc(studentA, 'progress/u-stu-a'), true);
  assert.equal(canWriteLearningPortalDoc(studentA, 'progress/u-stu-a'), true);
  assert.equal(canReadLearningPortalDoc(studentA, 'progress/u-stu-b'), false);
  assert.equal(canWriteLearningPortalDoc(studentA, 'progress/u-stu-b'), false);
  assert.equal(canReadLearningPortalDoc(teacher, 'progress/u-stu-b'), true);
  assert.equal(canWriteLearningPortalDoc(teacher, 'progress/u-stu-b'), false);
  assert.equal(canWriteLearningPortalDoc(admin, 'progress/u-stu-b'), true);
});

test('deriveDefaultSectionsForSchool populates all Classes 6–12 from school students', () => {
  assert.deepEqual(parseClassSection('Class 10-B'), { cls: '10', section: 'B' });
  assert.deepEqual(parseClassSection('7 A'), { cls: '7', section: 'A' });
  assert.deepEqual(parseClassSection('12-Sci'), { cls: '12', section: 'SCI' });

  const students = [
    { classSection: 'Class 6-A' },
    { classSection: 'Class 6-B' },
    { classSection: 'Class 10-C' },
  ] as StudentRecord[];

  const sections = deriveDefaultSectionsForSchool(students);
  assert.deepEqual(sections['6'], ['A', 'B']);
  assert.deepEqual(sections['7'], ['A']);
  assert.deepEqual(sections['8'], ['A']);
  assert.deepEqual(sections['9'], ['A']);
  assert.deepEqual(sections['10'], ['C']);
  assert.deepEqual(sections['11'], ['A']);
  assert.deepEqual(sections['12'], ['A']);
});
