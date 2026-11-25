import test from 'node:test';
import assert from 'node:assert/strict';
import type { UserAccount } from '../types';
import type { VcipProfileReleaseRecord } from '../types/vcip';
import {
  canRoleTransitionVcipStatus,
  canUserViewStudentVcipProfile,
  sanitizeVcipReleaseRecordForRole,
} from './vcipReleaseGovernanceEngine';

const STUDENT_USER: UserAccount = {
  id: 'u-stu',
  name: 'Abhiraj',
  email: 'abhiraj@vis.in',
  role: 'student',
  schoolId: 'sch-1',
  designation: 'Student',
  linkedStudentIds: ['stu-1'],
};

const PARENT_USER: UserAccount = {
  id: 'u-par',
  name: 'Parent',
  email: 'parent@vis.in',
  role: 'parent',
  schoolId: 'sch-1',
  designation: 'Parent',
  linkedStudentIds: ['stu-1'],
};

const TEACHER_USER: UserAccount = {
  id: 'u-tea',
  name: 'Teacher',
  email: 'teacher@vis.in',
  role: 'teacher',
  schoolId: 'sch-1',
  designation: 'Teacher',
};

const ACCOUNTANT_USER: UserAccount = {
  id: 'u-acc',
  name: 'Accountant',
  email: 'acc@vis.in',
  role: 'accountant',
  schoolId: 'sch-1',
  designation: 'School Accountant',
};

const PENDING_RECORD: VcipProfileReleaseRecord = {
  id: 'rel-1',
  schoolId: 'sch-1',
  studentId: 'stu-1',
  studentName: 'Abhiraj',
  classSection: '6-A',
  status: 'pending_approval',
  sharedCounsellorObservations: 'Strong visual reasoning.',
  internalCounsellorNote: 'PRIVATE INTERNAL NOTE — DO NOT EXPOSE TO FAMILY',
  recommendedExercises: ['Daily 5-min spatial rotation puzzles'],
  parentConsentGranted: true,
  updatedAt: '2026-11-18T10:00:00.000Z',
};

const PUBLISHED_RECORD: VcipProfileReleaseRecord = {
  ...PENDING_RECORD,
  status: 'published',
  approvedBy: 'Dr. Deepak Dhawan',
  approvedAt: '2026-11-19T10:00:00.000Z',
};

test('VCIP access control blocks students/parents until approved, enforces linked-child ownership, restricts teachers/accountants, and strips internal notes', () => {
  // Pending approval -> blocked for student and parent
  assert.equal(
    canUserViewStudentVcipProfile({
      user: STUDENT_USER,
      studentId: 'stu-1',
      releaseRecord: PENDING_RECORD,
    }).allowed,
    false,
  );
  assert.equal(
    canUserViewStudentVcipProfile({
      user: PARENT_USER,
      studentId: 'stu-1',
      releaseRecord: PENDING_RECORD,
    }).allowed,
    false,
  );

  // Published -> allowed for own student & linked parent, but internal notes NEVER included
  const stuCheck = canUserViewStudentVcipProfile({
    user: STUDENT_USER,
    studentId: 'stu-1',
    releaseRecord: PUBLISHED_RECORD,
  });
  assert.equal(stuCheck.allowed, true);
  assert.equal(stuCheck.includeInternalNotes, false);

  // Unlinked child -> strictly blocked even if published!
  assert.equal(
    canUserViewStudentVcipProfile({
      user: PARENT_USER,
      studentId: 'stu-999',
      releaseRecord: { ...PUBLISHED_RECORD, studentId: 'stu-999' },
    }).allowed,
    false,
  );

  // Teacher & Accountant do NOT get automatic complete cognitive profile access
  assert.equal(
    canUserViewStudentVcipProfile({
      user: TEACHER_USER,
      studentId: 'stu-1',
      releaseRecord: PUBLISHED_RECORD,
    }).allowed,
    false,
  );
  assert.equal(
    canUserViewStudentVcipProfile({
      user: ACCOUNTANT_USER,
      studentId: 'stu-1',
      releaseRecord: PUBLISHED_RECORD,
    }).allowed,
    false,
  );

  // Sanitization strips internalCounsellorNote for parent/student while keeping for counsellor/principal
  const parentSafe = sanitizeVcipReleaseRecordForRole(PUBLISHED_RECORD, 'parent');
  assert.equal(parentSafe.internalCounsellorNote, undefined);
  assert.equal(parentSafe.sharedCounsellorObservations, 'Strong visual reasoning.');

  const counsellorFull = sanitizeVcipReleaseRecordForRole(PUBLISHED_RECORD, 'counsellor');
  assert.equal(
    counsellorFull.internalCounsellorNote,
    'PRIVATE INTERNAL NOTE — DO NOT EXPOSE TO FAMILY',
  );

  // Workflow transitions: counsellor can submit, only management can publish/revoke
  assert.equal(
    canRoleTransitionVcipStatus({ role: 'counsellor', targetStatus: 'pending_approval' }).allowed,
    true,
  );
  assert.equal(
    canRoleTransitionVcipStatus({ role: 'counsellor', targetStatus: 'published' }).allowed,
    false,
  );
  assert.equal(
    canRoleTransitionVcipStatus({ role: 'principal', targetStatus: 'published' }).allowed,
    true,
  );
  assert.equal(
    canRoleTransitionVcipStatus({ role: 'principal', targetStatus: 'revoked' }).allowed,
    true,
  );
});
