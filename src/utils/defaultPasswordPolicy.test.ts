import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getDefaultDesignationPassword,
  matchesDefaultDesignationPassword,
} from './defaultPasswordPolicy';

test('getDefaultDesignationPassword maps every role/designation cleanly to <designation>123', () => {
  assert.equal(getDefaultDesignationPassword({ role: 'school_admin', designation: 'Deputy Director (VIS Jhajjar)' }), 'deputydirector123');
  assert.equal(getDefaultDesignationPassword({ role: 'principal', designation: 'Principal (VIS Jhajjar)' }), 'principal123');
  assert.equal(getDefaultDesignationPassword({ role: 'principal', designation: 'Vice Principal (VIS Jhajjar)' }), 'viceprincipal123');
  assert.equal(getDefaultDesignationPassword({ role: 'school_admin', designation: 'School Administrator' }), 'admin123');
  assert.equal(getDefaultDesignationPassword({ role: 'super_admin', designation: 'COO', isPlatformCoo: true }), 'coo123');
  assert.equal(getDefaultDesignationPassword({ role: 'super_admin', designation: 'Platform Super Admin' }), 'superadmin123');
  assert.equal(getDefaultDesignationPassword({ role: 'coordinator', designation: 'Academic Coordinator' }), 'coordinator123');
  assert.equal(getDefaultDesignationPassword({ role: 'teacher', designation: 'Senior Mathematics Teacher' }), 'teacher123');
  assert.equal(getDefaultDesignationPassword({ role: 'accountant', designation: 'School Accountant' }), 'accountant123');
  assert.equal(getDefaultDesignationPassword({ role: 'transport_incharge', designation: 'Transport Incharge' }), 'transport123');
  assert.equal(getDefaultDesignationPassword({ role: 'parent', designation: 'Parent Guardian' }), 'parent123');
  assert.equal(getDefaultDesignationPassword({ role: 'student', designation: 'Class 6-A Student' }), 'student123');
  assert.equal(getDefaultDesignationPassword({ role: 'ssb_student', designation: 'SSB Aspirant' }), 'ssbstudent123');
  assert.equal(getDefaultDesignationPassword({ role: 'career_user', designation: 'Career Explorer' }), 'career123');
});

test('matchesDefaultDesignationPassword supports case-insensitive matching and designation aliases while rejecting wrong passwords', () => {
  const adminUser = { role: 'school_admin' as const, designation: 'School Administrator (VIS Jhajjar)' };
  assert.equal(matchesDefaultDesignationPassword(adminUser, 'admin123'), true);
  assert.equal(matchesDefaultDesignationPassword(adminUser, 'Admin123'), true);
  assert.equal(matchesDefaultDesignationPassword(adminUser, 'schooladmin123'), true);
  assert.equal(matchesDefaultDesignationPassword(adminUser, 'schooladministrator123'), true);
  assert.equal(matchesDefaultDesignationPassword(adminUser, 'wrongpass123'), false);
  assert.equal(matchesDefaultDesignationPassword(adminUser, ''), false);

  const principalUser = { role: 'principal' as const, designation: 'Principal (VIS Jhajjar)' };
  assert.equal(matchesDefaultDesignationPassword(principalUser, 'principal123'), true);
  assert.equal(matchesDefaultDesignationPassword(principalUser, 'PRINCIPAL123'), true);
  assert.equal(matchesDefaultDesignationPassword(principalUser, 'teacher123'), false);
});
