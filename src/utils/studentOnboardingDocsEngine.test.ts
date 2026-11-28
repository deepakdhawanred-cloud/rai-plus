import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { StudentRecord } from '../types';
import {
  STANDARD_SCHOOL_DOCUMENTS,
  composePendingDocsParentMessage,
  computeOnboardingProgress,
  createDay1OnboardingBlueprint,
  normalizeStudentDocuments,
  summarizeDocumentCompliance,
} from './studentOnboardingDocsEngine.ts';

function makeStudent(overrides: Partial<StudentRecord> = {}): StudentRecord {
  return {
    id: 'stu-test-1',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-2026-0999',
    rollNo: '12',
    name: 'Kabir Sharma',
    classSection: '6-A',
    house: 'Tagore House',
    guardianName: 'Suresh Sharma',
    guardianPhone: '+91 98120 55443',
    udiseStudentId: 'UD-111111',
    haryanaMisId: 'HR-111111',
    attendancePct: 100,
    feeBalanceInr: 12000,
    totalFeeAnnualInr: 38000,
    reportApprovalStatus: 'Draft',
    formulaVersion: 'v1.2',
    documents: [
      { key: 'birth_certificate', name: 'Birth Certificate', verified: true, status: 'Completed' },
      { key: 'student_aadhaar', name: 'Student Aadhaar Card', verified: true, status: 'Completed' },
      {
        key: 'transfer_certificate',
        name: 'Transfer Certificate (TC / SLC)',
        verified: false,
        status: 'Pending',
        dueDate: '2026-11-10',
      },
    ],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
    ...overrides,
  };
}

describe('Student Document Compliance & Day-1 Onboarding Engine', () => {
  it('normalizes documents to the 8-document matrix and flags overdue pending documents accurately', () => {
    const stu = makeStudent();
    const res = normalizeStudentDocuments(stu, '2026-11-28');
    assert.equal(res.items.length, STANDARD_SCHOOL_DOCUMENTS.length);
    assert.equal(res.applicableCount, 8);
    assert.ok(res.overdueCount >= 1);
    assert.equal(res.complianceState, 'Overdue');
    assert.ok(res.missingDocNames.includes('Transfer Certificate (TC / SLC)'));
  });

  it('automatically marks TC & Previous Report Card as Not Applicable for Nursery / KG fresh entrants', () => {
    const nurseryStu = makeStudent({
      id: 'stu-nursery-1',
      classSection: 'Nursery-A',
      documents: STANDARD_SCHOOL_DOCUMENTS.filter((d) => !d.skipForEarlyYears).map((d) => ({
        key: d.key,
        name: d.name,
        verified: true,
        status: 'Completed' as const,
      })),
    });
    const res = normalizeStudentDocuments(nurseryStu, '2026-11-28');
    assert.equal(res.applicableCount, 6);
    assert.equal(res.completedCount, 6);
    assert.equal(res.complianceState, 'Completed');
    assert.equal(res.completionPct, 100);
  });

  it('summarizes school-wide compliance and generates polite parent reminders for pending documents', () => {
    const completedStu = makeStudent({
      id: 'stu-done',
      documents: STANDARD_SCHOOL_DOCUMENTS.map((d) => ({
        key: d.key,
        name: d.name,
        verified: true,
        status: 'Completed' as const,
      })),
    });
    const pendingStu = makeStudent({ id: 'stu-pend' });
    const summary = summarizeDocumentCompliance([completedStu, pendingStu], '2026-11-28');
    assert.equal(summary.totalStudents, 2);
    assert.equal(summary.fullyCompletedCount, 1);
    assert.equal(summary.pendingStudentsCount, 1);
    assert.equal(summary.overdueStudentsCount, 1);

    const msg = composePendingDocsParentMessage({
      studentName: 'Kabir Sharma',
      classSection: '6-A',
      guardianName: 'Suresh Sharma',
      schoolName: 'Virat International School',
      missingDocNames: ['Transfer Certificate (TC / SLC)', 'PPP / Family ID (State ID)'],
      dueDate: '2026-12-10',
    });
    assert.ok(msg.includes('Kabir Sharma'));
    assert.ok(msg.includes('Transfer Certificate (TC / SLC)'));
    assert.ok(msg.includes('2026-12-10'));
  });

  it('builds a 10-checkpoint Day-1 to Day-30 onboarding blueprint and advances status cleanly as checkpoints complete', () => {
    const blueprint = createDay1OnboardingBlueprint({
      admissionDate: '2026-11-28',
      assignedClassTeacher: 'Sunita Devi',
      peerBuddyName: 'Aarav',
      transportMode: 'Bus',
      documentDueDate: '2026-12-13',
      parentWelcomeSent: false,
    });
    assert.equal(blueprint.checkpoints.length, 10);
    assert.equal(blueprint.day1Status, 'Ready for Day 1');

    // Complete all Day-1 checkpoints -> status advances to 'Week-1 Active'
    blueprint.checkpoints
      .filter((c) => c.dayTarget === 1)
      .forEach((c) => {
        c.completed = true;
      });
    const prog1 = computeOnboardingProgress(blueprint);
    assert.equal(prog1.day1Complete, true);
    assert.equal(prog1.derivedStatus, 'Week-1 Active');

    // Complete all remaining checkpoints -> 'Completed'
    blueprint.checkpoints.forEach((c) => {
      c.completed = true;
    });
    const progAll = computeOnboardingProgress(blueprint);
    assert.equal(progAll.pct, 100);
    assert.equal(progAll.derivedStatus, 'Completed');
    assert.equal(progAll.nextCheckpoint, null);
  });
});
