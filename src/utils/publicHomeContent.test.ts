import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARCHITECTURE_PILLARS,
  HERO_VCIP_RADAR_PREVIEW,
  STAKEHOLDER_WORKSPACES,
  findDemoAccountForRole,
  validateCareerForm,
  validateEnquiryForm,
} from './publicHomeContent';
import type { PublicDemoAccount } from '../components/UnifiedLoginModal';

test('home page architecture pillars, stakeholder workspaces, and VCIP preview are structurally complete', () => {
  assert.equal(ARCHITECTURE_PILLARS.length, 5);
  assert.equal(STAKEHOLDER_WORKSPACES.length, 7);
  assert.equal(HERO_VCIP_RADAR_PREVIEW.length, 6);
  assert.deepEqual(
    HERO_VCIP_RADAR_PREVIEW.map((d) => d.domain),
    ['Fluid', 'Memory', 'Speed', 'Verbal', 'Quantitative', 'Spatial'],
  );
  for (const pillar of ARCHITECTURE_PILLARS) {
    assert.ok(pillar.title.length > 10);
    assert.equal(pillar.mechanismChain.length, 3);
    assert.ok(pillar.measurableOutcome.length > 10);
  }
});

test('validateCareerForm and validateEnquiryForm catch invalid inputs and accept valid submissions', () => {
  assert.ok(
    validateCareerForm({
      applicantName: '',
      email: 'bad',
      phone: '123',
      currentStage: '',
      goalSummary: '',
    }),
  );
  assert.match(
    validateCareerForm({
      applicantName: 'Ritika',
      email: 'not-an-email',
      phone: '+91 98120 12345',
      currentStage: 'Class 10',
      goalSummary: 'Stream selection',
    }) || '',
    /valid email/i,
  );
  assert.equal(
    validateCareerForm({
      applicantName: 'Ritika',
      email: 'ritika@example.in',
      phone: '+91 98120 12345',
      currentStage: 'Class 10 HBSE',
      goalSummary: 'Choosing between PCM and Commerce with Maths',
    }),
    null,
  );

  assert.match(
    validateEnquiryForm({
      contactName: 'Principal Sharma',
      email: 'principal@school.edu.in',
      phone: '1234',
      message: 'Requesting campus walkthrough',
    }) || '',
    /phone/i,
  );
  assert.equal(
    validateEnquiryForm({
      contactName: 'Principal Sharma',
      email: 'principal@school.edu.in',
      phone: '+91 98120 55555',
      message: 'Requesting campus walkthrough for 650 students',
    }),
    null,
  );
});

test('findDemoAccountForRole prefers primary VIS Jhajjar sandbox account when multiple exist', () => {
  const accounts: PublicDemoAccount[] = [
    {
      id: 't-other',
      name: 'Other Teacher',
      email: 'other@school.in',
      role: 'teacher',
      schoolId: 'school-other',
      designation: 'Teacher',
    },
    {
      id: 't-vis',
      name: 'VIS Teacher',
      email: 'vis@school.in',
      role: 'teacher',
      schoolId: 'school-vis-jjr',
      designation: 'Maths Teacher',
    },
    {
      id: 'c-global',
      name: 'Dr. Sunita Gill',
      email: 'counsellor@virat.in',
      role: 'counsellor',
      schoolId: null,
      designation: 'Lead Career Counsellor',
    },
  ];

  assert.equal(findDemoAccountForRole(accounts, 'teacher')?.id, 't-vis');
  assert.equal(findDemoAccountForRole(accounts, 'counsellor')?.id, 'c-global');
  assert.equal(findDemoAccountForRole(accounts, 'student'), null);
});
