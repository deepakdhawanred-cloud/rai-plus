import test from 'node:test';
import assert from 'node:assert/strict';
import type { AdmissionLead, HomeVisitRecord } from '../types.ts';
import {
  computeAdmissionCrmSummary,
  deriveLeadVisitSummary,
  filterAdmissionLeads,
  filterHomeVisits,
  normalizeClassSectionFromApplyingClass,
  validateHomeVisitInput,
  validateLeadInput,
} from './admissionCrmEngine.ts';

const SAMPLE_LEADS: AdmissionLead[] = [
  {
    id: 'adm-1',
    schoolId: 'school-svm-kk',
    studentName: 'Ishaan Sharma',
    applyingClass: 'Class 6',
    parentName: 'Manoj Sharma',
    phone: '+91 98124 90211',
    email: 'manoj.sharma@gmail.com',
    source: 'Website',
    stage: 'Campus Visit',
    assignedCounsellor: 'Anil Kumar Hooda',
    nextFollowUpDate: '2026-11-14',
    locality: 'Sector 7, Kurukshetra',
    notes: 'Interested in NCERT Olympiad track.',
  },
  {
    id: 'adm-2',
    schoolId: 'school-svm-kk',
    studentName: 'Diya Malik',
    applyingClass: 'Class 11 (Commerce)',
    parentName: 'Rakesh Malik',
    phone: '+91 94162 11904',
    email: 'rakesh.malik@yahoo.co.in',
    source: 'Career Portal',
    stage: 'Document Verification',
    assignedCounsellor: 'Dr. Sunita Gill',
    nextFollowUpDate: '2026-11-18',
    locality: 'Thanesar Urban Estate',
    notes: 'TC pending.',
  },
  {
    id: 'adm-3',
    schoolId: 'school-svm-kk',
    studentName: 'Arjun Kaushik',
    applyingClass: 'Class 9',
    parentName: 'Deepak Kaushik',
    phone: '+91 98965 20411',
    email: 'deepak.k@example.in',
    source: 'Referral',
    stage: 'Confirmed',
    assignedCounsellor: 'Dr. Meenakshi Deswal',
    nextFollowUpDate: '2026-11-10',
    locality: 'Sector 13, Kurukshetra',
    notes: 'Fee receipt issued.',
  },
];

const SAMPLE_VISITS: HomeVisitRecord[] = [
  {
    id: 'hv-1',
    schoolId: 'school-svm-kk',
    leadId: 'adm-1',
    studentName: 'Ishaan Sharma',
    applyingClass: 'Class 6',
    parentName: 'Manoj Sharma',
    phone: '+91 98124 90211',
    visitDate: '2026-11-13',
    visitSlot: '10:30 AM – 11:15 AM',
    visitingStaff: 'Kavita Sharma',
    address: 'House 214, Sector 7',
    locality: 'Sector 7, Kurukshetra',
    guardianMet: 'Manoj Sharma (Father)',
    homeEnvironmentSummary: 'Quiet study corner with proper lighting.',
    learningSupportNotes: 'Parents check homework every evening.',
    transportOrFeeNotes: 'Needs Sector 7 bus pickup.',
    status: 'Completed',
    outcome: 'Proceed to Admission',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-13',
  },
  {
    id: 'hv-2',
    schoolId: 'school-svm-kk',
    leadId: 'adm-2',
    studentName: 'Diya Malik',
    applyingClass: 'Class 11 (Commerce)',
    parentName: 'Rakesh Malik',
    phone: '+91 94162 11904',
    visitDate: '2026-11-16',
    visitSlot: '04:00 PM – 04:45 PM',
    visitingStaff: 'Dr. Sunita Gill',
    address: 'Plot 48, Urban Estate',
    locality: 'Thanesar Urban Estate',
    guardianMet: 'Rakesh Malik (Father)',
    homeEnvironmentSummary: 'Scheduled home interaction.',
    learningSupportNotes: 'Strong Accountancy aptitude.',
    transportOrFeeNotes: 'Sibling discount check.',
    status: 'Scheduled',
    outcome: 'Scholarship / Fee Review',
    createdAt: '2026-11-14',
    updatedAt: '2026-11-14',
  },
];

test('computeAdmissionCrmSummary counts pipeline stages, due follow-ups, conversion, and home visits', () => {
  const summary = computeAdmissionCrmSummary(SAMPLE_LEADS, SAMPLE_VISITS, '2026-11-15');
  assert.equal(summary.totalLeads, 3);
  assert.equal(summary.activePipelineCount, 2);
  assert.equal(summary.confirmedCount, 1);
  assert.equal(summary.conversionRatePct, 33.3);
  // adm-1 follow-up 2026-11-14 <= 2026-11-15 (active); adm-3 is Confirmed so excluded
  assert.equal(summary.followUpsDueCount, 1);
  assert.equal(summary.totalHomeVisits, 2);
  assert.equal(summary.completedHomeVisits, 1);
  assert.equal(summary.scheduledHomeVisits, 1);
  assert.equal(summary.leadsWithHomeVisitCount, 2);
});

test('filterAdmissionLeads supports query, stage, and home visit coverage filters', () => {
  const byQuery = filterAdmissionLeads(SAMPLE_LEADS, SAMPLE_VISITS, { query: 'Urban Estate' });
  assert.deepEqual(
    byQuery.map((l) => l.id),
    ['adm-2'],
  );

  const completedVisitLeads = filterAdmissionLeads(SAMPLE_LEADS, SAMPLE_VISITS, {
    homeVisitFilter: 'COMPLETED_VISIT',
  });
  assert.deepEqual(
    completedVisitLeads.map((l) => l.id),
    ['adm-1'],
  );

  const needsVisitLeads = filterAdmissionLeads(SAMPLE_LEADS, SAMPLE_VISITS, {
    homeVisitFilter: 'NEEDS_VISIT',
  });
  assert.deepEqual(
    needsVisitLeads.map((l) => l.id),
    ['adm-3'],
  );
});

test('filterHomeVisits sorts descending by visitDate and filters by status and search text', () => {
  const allSorted = filterHomeVisits(SAMPLE_VISITS);
  assert.deepEqual(
    allSorted.map((v) => v.id),
    ['hv-2', 'hv-1'],
  );

  const completed = filterHomeVisits(SAMPLE_VISITS, { status: 'Completed', query: 'Kavita' });
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, 'hv-1');
});

test('deriveLeadVisitSummary reports visit status flags accurately', () => {
  const s1 = deriveLeadVisitSummary('adm-1', SAMPLE_VISITS);
  assert.equal(s1.totalVisits, 1);
  assert.equal(s1.hasCompletedVisit, true);
  assert.equal(s1.hasActiveSchedule, false);

  const s3 = deriveLeadVisitSummary('adm-3', SAMPLE_VISITS);
  assert.equal(s3.totalVisits, 0);
  assert.equal(s3.latestVisit, null);
});

test('validateLeadInput, validateHomeVisitInput, and class normalization behave deterministically', () => {
  assert.equal(validateLeadInput({ studentName: 'A', applyingClass: 'Class 6' }).valid, false);
  assert.equal(
    validateLeadInput({
      studentName: 'Kabir',
      applyingClass: 'Class 6',
      parentName: 'Suresh',
      phone: '9812000000',
    }).valid,
    true,
  );

  assert.equal(validateHomeVisitInput({ leadId: 'adm-1', visitDate: '2026-11-20' }).valid, false);
  assert.equal(
    validateHomeVisitInput({
      leadId: 'adm-1',
      visitDate: '2026-11-20',
      visitingStaff: 'Kavita Sharma',
      locality: 'Sector 7',
      guardianMet: 'Manoj Sharma',
    }).valid,
    true,
  );

  assert.equal(normalizeClassSectionFromApplyingClass('Class 11 (Commerce)'), '11-Commerce');
  assert.equal(normalizeClassSectionFromApplyingClass('Class 6'), '6-A');
});
