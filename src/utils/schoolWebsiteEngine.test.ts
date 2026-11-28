import assert from 'node:assert/strict';
import test from 'node:test';
import type { School, UserAccount } from '../types';
import {
  SCHOOL_GALLERY_CATEGORIES,
  buildDefaultSchoolWebsiteProfile,
  filterSchoolGallery,
  resolveSchoolBySlugOrId,
  toSchoolWebsiteSlug,
  validateSchoolWebsiteAdmissionForm,
} from './schoolWebsiteEngine';

const SAMPLE_SCHOOLS: School[] = [
  {
    id: 'school-vis-jjr',
    name: 'Virat International School, Jhajjar',
    code: 'VIS-JJR-01',
    city: 'Jhajjar',
    state: 'Haryana',
    board: 'HBSE',
    udiseCode: '06150102408',
    haryanaMisCode: 'HR-JJR-1241',
    session: '2026-27',
    subscriptionPlan: 'Enterprise 360°',
    active: true,
    studentCount: 538,
    teacherCount: 28,
  },
  {
    id: 'school-svm-kk',
    name: 'Saraswati Vidya Mandir Senior Secondary',
    code: 'SVM-KKR-01',
    city: 'Kurukshetra',
    state: 'Haryana',
    board: 'HBSE',
    udiseCode: '06040201804',
    haryanaMisCode: 'HR-KKR-4419',
    session: '2026-27',
    subscriptionPlan: 'Premium Campus',
    active: true,
    studentCount: 1240,
    teacherCount: 58,
  },
  {
    id: 'school-custom-new',
    name: 'Modern Heritage Public School',
    code: 'MHPS-GGN-01',
    city: 'Gurugram',
    state: 'Haryana',
    board: 'CBSE',
    udiseCode: '06180109900',
    haryanaMisCode: 'HR-GGN-9900',
    session: '2026-27',
    subscriptionPlan: 'Growth',
    active: true,
    studentCount: 640,
    teacherCount: 32,
  },
];

test('toSchoolWebsiteSlug and resolveSchoolBySlugOrId resolve by slug, code, ID, or prefix', () => {
  assert.equal(toSchoolWebsiteSlug('VIS-JJR-01'), 'vis-jjr-01');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'vis-jjr-01')?.id, 'school-vis-jjr');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'SVM-KKR-01')?.id, 'school-svm-kk');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'school-custom-new')?.id, 'school-custom-new');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'nonexistent-campus'), null);
});

test('buildDefaultSchoolWebsiteProfile generates rich multi-tenant microsite data for any onboarded school', () => {
  const customUsers: UserAccount[] = [
    {
      id: 'u-p1',
      name: 'Dr. Kavita Rao',
      email: 'principal@mhps.edu.in',
      role: 'principal',
      schoolId: 'school-custom-new',
      designation: 'Principal',
    },
    {
      id: 'u-a1',
      name: 'Vikram Singh',
      email: 'director@mhps.edu.in',
      role: 'school_admin',
      schoolId: 'school-custom-new',
      designation: 'Director',
    },
  ];

  const profile = buildDefaultSchoolWebsiteProfile(SAMPLE_SCHOOLS[2], customUsers);
  assert.equal(profile.slug, 'mhps-ggn-01');
  assert.equal(profile.principalMessage.authorName, 'Dr. Kavita Rao');
  assert.ok(profile.salientFeatures.length >= 6);
  assert.ok(profile.managementTeam.some((m) => m.name === 'Vikram Singh'));
  assert.ok(profile.gallery.length >= 6);
  assert.equal(profile.admissionsOpen, true);

  // Gallery filtering works cleanly across all categories
  assert.equal(filterSchoolGallery(profile.gallery, 'All').length, profile.gallery.length);
  const labItems = filterSchoolGallery(profile.gallery, 'Labs & STEM');
  assert.ok(labItems.length >= 1);
  assert.ok(labItems.every((i) => i.category === 'Labs & STEM'));
  assert.ok(SCHOOL_GALLERY_CATEGORIES.includes('Campus'));
});

test('validateSchoolWebsiteAdmissionForm enforces required admission enquiry fields', () => {
  assert.ok(
    validateSchoolWebsiteAdmissionForm({
      studentName: '',
      applyingClass: 'Class 6',
      parentName: 'Rajesh',
      phone: '9812012345',
    }),
  );
  assert.ok(
    validateSchoolWebsiteAdmissionForm({
      studentName: 'Aarav',
      applyingClass: 'Class 6',
      parentName: 'Rajesh',
      phone: '12345',
    }),
  );
  assert.equal(
    validateSchoolWebsiteAdmissionForm({
      studentName: 'Aarav Sharma',
      applyingClass: 'Class 6',
      parentName: 'Rajesh Sharma',
      phone: '+91 98120 44108',
    }),
    null,
  );
});
