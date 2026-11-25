import test from 'node:test';
import assert from 'node:assert/strict';
import type { StudentRecord } from '../types';
import { buildParentFamilyOverview } from './parentEasyReportEngine';

const CHILD_1: StudentRecord = {
  id: 'c1',
  schoolId: 'vis',
  admissionNo: 'VIS-1',
  rollNo: '01',
  name: 'Abhiraj',
  classSection: '6-A',
  house: 'Arjuna',
  guardianName: 'Rajesh Kumar',
  guardianPhone: '9812560111',
  udiseStudentId: 'U1',
  haryanaMisId: 'H1',
  attendancePct: 95,
  feeBalanceInr: 0,
  totalFeeAnnualInr: 34000,
  reportApprovalStatus: 'Approved',
  formulaVersion: 'v1.2',
  documents: [],
  responsibilities: ['Class Reading Lead'],
  achievements: ['Mental Maths Merit'],
  confidentialCounsellorNote: '',
};

const CHILD_2: StudentRecord = {
  ...CHILD_1,
  id: 'c2',
  admissionNo: 'VIS-2',
  rollNo: '04',
  name: 'Ananya',
  classSection: '4-A',
  attendancePct: 74,
  feeBalanceInr: 4500,
  responsibilities: [],
  achievements: [],
};

test('buildParentFamilyOverview produces plain-language English summary for two children', () => {
  const family = buildParentFamilyOverview({
    students: [CHILD_1, CHILD_2],
    lang: 'en',
  });

  assert.equal(family.childCount, 2);
  assert.equal(family.totalFeeDueInr, 4500);
  assert.match(family.familyHeadline, /All 2 Children/i);
  assert.equal(family.children[0].fees.isCleared, true);
  assert.equal(family.children[0].attendance.level, 'great');
  assert.equal(family.children[1].fees.isCleared, false);
  assert.equal(family.children[1].attendance.level, 'practice');
  // Ensure zero ERP jargon leaks into parent-facing plain-language summaries
  const visibleCopy = JSON.stringify(
    family.children.map((c) => ({
      overallHeadline: c.overallHeadline,
      overallSummarySentence: c.overallSummarySentence,
      attendance: c.attendance,
      homeworkAndNotebooks: c.homeworkAndNotebooks,
      skills: c.skills,
      characterStrengths: c.characterStrengths,
      fees: c.fees,
    })),
  );
  assert.equal(/UDISE|Formula v1|strict tenant/i.test(visibleCopy), false);
});

test('buildParentFamilyOverview switches cleanly to Hindi for parents', () => {
  const familyHi = buildParentFamilyOverview({
    students: [CHILD_1],
    lang: 'hi',
  });
  assert.equal(familyHi.childCount, 1);
  assert.match(familyHi.children[0].fees.statusLabel, /जमा/);
  assert.equal(familyHi.children[0].skills.length, 4);
});
