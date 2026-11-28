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
    name: 'Virat International School',
    code: 'VIS',
    city: 'Kapriwas, Rewari',
    state: 'Haryana',
    board: 'HBSE',
    udiseCode: '06170506608',
    haryanaMisCode: '15390',
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
    board: 'HBSE',
    udiseCode: '06180109900',
    haryanaMisCode: 'HR-GGN-9900',
    session: '2026-27',
    subscriptionPlan: 'Growth',
    active: true,
    studentCount: 640,
    teacherCount: 32,
  },
];

test('toSchoolWebsiteSlug and resolveSchoolBySlugOrId resolve VIS legacy & canonical slugs accurately', () => {
  assert.equal(toSchoolWebsiteSlug('VIS'), 'vis');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'vis')?.id, 'school-vis-jjr');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'vis-jjr-01')?.id, 'school-vis-jjr');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'vis-15390')?.id, 'school-vis-jjr');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'SVM-KKR-01')?.id, 'school-svm-kk');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'school-custom-new')?.id, 'school-custom-new');
  assert.equal(resolveSchoolBySlugOrId(SAMPLE_SCHOOLS, 'nonexistent-campus'), null);
});

test('buildDefaultSchoolWebsiteProfile generates complete authentic Virat International School profile without CBSE claims', () => {
  const visProfile = buildDefaultSchoolWebsiteProfile(SAMPLE_SCHOOLS[0]);

  // 1. Official school identity & branding
  assert.equal(visProfile.shortName, 'VIS');
  assert.equal(visProfile.tagline, 'READ | LEAD | SUCCEED');
  assert.equal(visProfile.logoUrl, '/assets/schools/vis/vis-logo.png');
  assert.equal(visProfile.hbseSchoolCode, '15390');
  assert.equal(visProfile.contact.phone, '+91 9992023224');
  assert.equal(visProfile.contact.email, 'viratintschool@gmail.com');
  assert.equal(visProfile.contact.websiteDomainLabel, 'www.viratschool.com');
  assert.match(visProfile.contact.address, /Kapriwas to Pataudi Road, 1 KM from NH-8, Kapriwas, Rewari, Haryana/i);

  // Must NEVER falsely claim CBSE affiliation
  const serialized = JSON.stringify(visProfile);
  assert.equal(/\bCBSE\b/i.test(serialized), false, 'VIS profile must not claim CBSE affiliation');
  assert.match(visProfile.affiliationNote, /HBSE/);
  assert.match(visProfile.affiliationNote, /06170506608/);
  assert.match(visProfile.affiliationNote, /15390/);

  // 2. All 5 individual leadership profiles with authentic portraits
  assert.equal(visProfile.managementTeam.length, 5);
  assert.deepEqual(
    visProfile.managementTeam.map((m) => m.roleTitle),
    ['Chairman', 'Director', 'Deputy Director', 'Principal', 'Vice Principal'],
  );
  assert.ok(visProfile.managementTeam.every((m) => Boolean(m.photoUrl && m.photoUrl.startsWith('/assets/schools/vis/'))));

  // 3. All 16 official VIS USPs with category, displayOrder, active toggle & authentic photo
  assert.equal(visProfile.salientFeatures.length, 16);
  assert.ok(visProfile.salientFeatures.some((f) => f.title === 'VR Classes'));
  assert.ok(visProfile.salientFeatures.some((f) => f.title === 'Mind Mapping Teaching'));
  assert.ok(visProfile.salientFeatures.some((f) => f.title === 'Brain Testing Sitting Plan'));
  assert.ok(visProfile.salientFeatures.some((f) => f.title === 'Four Annual Home Counselling Visits'));
  assert.ok(visProfile.salientFeatures.every((f) => f.active === true && typeof f.displayOrder === 'number'));

  // 4. Philosophy pillars (READ, LEAD, SUCCEED) + 4 values + 2 institutional statements
  assert.equal(visProfile.philosophy?.pillars.length, 3);
  assert.equal(visProfile.philosophy?.coreValues.length, 4);
  assert.equal(visProfile.philosophy?.statements.length, 2);

  // 5. All 12 separate facility categories + 5 parent engagement highlights + pending admin verification flags
  assert.equal(visProfile.facilityCategories?.length, 12);
  assert.equal(visProfile.parentEngagementHighlights?.length, 5);
  assert.ok((visProfile.pendingAdminVerification?.length ?? 0) >= 4);

  // 6. Multi-tenant isolation: SVM profile does NOT inherit VIS branding or logo
  const svmProfile = buildDefaultSchoolWebsiteProfile(SAMPLE_SCHOOLS[1]);
  assert.notEqual(svmProfile.tagline, visProfile.tagline);
  assert.equal(svmProfile.logoUrl, undefined);
});

test('buildDefaultSchoolWebsiteProfile supports custom newly onboarded schools and gallery filtering', () => {
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
  assert.ok(profile.managementTeam.some((m) => m.name === 'Vikram Singh'));
  assert.equal(filterSchoolGallery(profile.gallery, 'All').length, profile.gallery.length);
  const labItems = filterSchoolGallery(profile.gallery, 'Labs & STEM');
  assert.ok(labItems.length >= 1);
  assert.ok(SCHOOL_GALLERY_CATEGORIES.includes('Campus'));
});

test('validateSchoolWebsiteAdmissionForm enforces required admission enquiry fields', () => {
  assert.ok(
    validateSchoolWebsiteAdmissionForm({
      studentName: '',
      applyingClass: 'Class 6',
      parentName: 'Rajesh',
      phone: '9992023224',
    }),
  );
  assert.equal(
    validateSchoolWebsiteAdmissionForm({
      studentName: 'Aditya Yadav',
      applyingClass: 'Class 6',
      parentName: 'Rajesh Yadav',
      phone: '+91 9992023224',
    }),
    null,
  );
});
