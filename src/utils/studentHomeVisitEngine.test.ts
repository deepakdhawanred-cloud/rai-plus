import assert from 'node:assert/strict';
import test from 'node:test';
import type { HomeVisitRecord, StudentRecord } from '../types';
import { computeAdmissionCrmSummary } from './admissionCrmEngine';
import {
  ANNUAL_ENROLLED_VISIT_TARGET,
  buildEnrolledStudentQuarterlyMatrix,
  splitHomeVisitsByType,
  validateEnrolledStudentVisitInput,
} from './studentHomeVisitEngine';

const STUDENTS: StudentRecord[] = [
  {
    id: 'stu-1',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-001',
    rollNo: '01',
    name: 'Abhiraj',
    classSection: '6-A',
    house: 'Arjuna',
    guardianName: 'Rajesh Kumar',
    guardianPhone: '9812560111',
    udiseStudentId: 'U1',
    haryanaMisId: 'M1',
    attendancePct: 95,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 34000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
  {
    id: 'stu-2',
    schoolId: 'school-vis-jjr',
    admissionNo: 'VIS-002',
    rollNo: '02',
    name: 'Hardik',
    classSection: '6-A',
    house: 'Arjuna',
    guardianName: 'Satish Kumar',
    guardianPhone: '9812560222',
    udiseStudentId: 'U2',
    haryanaMisId: 'M2',
    attendancePct: 92,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 34000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
];

const MIXED_VISITS: HomeVisitRecord[] = [
  {
    id: 'hv-crm-1',
    schoolId: 'school-vis-jjr',
    visitCategory: 'admission_crm',
    leadId: 'lead-1',
    studentName: 'Prospective Child',
    applyingClass: 'Class 9',
    parentName: 'Parent Lead',
    phone: '9812000001',
    visitDate: '2026-11-10',
    visitSlot: '10:00 AM',
    visitingStaff: 'Ms. Niharika Yadav',
    address: 'Sector 6',
    locality: 'Jhajjar',
    guardianMet: 'Parent Lead',
    homeEnvironmentSummary: 'Admission follow-up',
    learningSupportNotes: '',
    transportOrFeeNotes: '',
    status: 'Completed',
    outcome: 'Proceed to Admission',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-10',
  },
  {
    id: 'hv-stu-1',
    schoolId: 'school-vis-jjr',
    visitCategory: 'enrolled_student',
    leadId: '',
    studentId: 'stu-1',
    admissionNo: 'VIS-001',
    classSection: '6-A',
    academicQuarter: 'Q1',
    academicSession: '2026-27',
    enrolledVisitOutcome: 'Thriving & On Track',
    studentName: 'Abhiraj',
    applyingClass: '6-A',
    parentName: 'Rajesh Kumar',
    phone: '9812560111',
    visitDate: '2026-05-15',
    visitSlot: '04:00 PM',
    visitingStaff: 'Ms. Nirmla Yadav',
    address: 'Model Town',
    locality: 'Jhajjar',
    guardianMet: 'Rajesh Kumar',
    homeEnvironmentSummary: 'Q1 family meeting done',
    learningSupportNotes: '',
    transportOrFeeNotes: '',
    status: 'Completed',
    outcome: 'Proceed to Admission',
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15',
  },
  {
    id: 'hv-stu-2',
    schoolId: 'school-vis-jjr',
    visitCategory: 'enrolled_student',
    leadId: '',
    studentId: 'stu-1',
    admissionNo: 'VIS-001',
    classSection: '6-A',
    academicQuarter: 'Q2',
    academicSession: '2026-27',
    enrolledVisitOutcome: 'Thriving & On Track',
    studentName: 'Abhiraj',
    applyingClass: '6-A',
    parentName: 'Rajesh Kumar',
    phone: '9812560111',
    visitDate: '2026-08-20',
    visitSlot: '04:00 PM',
    visitingStaff: 'Dr. Deepak Dhawan',
    address: 'Model Town',
    locality: 'Jhajjar',
    guardianMet: 'Rajesh Kumar',
    homeEnvironmentSummary: 'Q2 family meeting done',
    learningSupportNotes: '',
    transportOrFeeNotes: '',
    status: 'Completed',
    outcome: 'Proceed to Admission',
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
];

test('splitHomeVisitsByType cleanly isolates Admission CRM visits from 4x/year Enrolled Student visits', () => {
  const { admissionCrmVisits, enrolledStudentVisits } = splitHomeVisitsByType(MIXED_VISITS);
  assert.equal(admissionCrmVisits.length, 1);
  assert.equal(admissionCrmVisits[0].id, 'hv-crm-1');
  assert.equal(enrolledStudentVisits.length, 2);

  // Admission CRM summary must strictly ignore enrolled_student visits
  const crmSummary = computeAdmissionCrmSummary([], MIXED_VISITS, '2026-11-20');
  assert.equal(crmSummary.totalHomeVisits, 1);
  assert.equal(crmSummary.completedHomeVisits, 1);
});

test('buildEnrolledStudentQuarterlyMatrix tracks 4 annual visits (Q1-Q4) per enrolled student', () => {
  assert.equal(ANNUAL_ENROLLED_VISIT_TARGET, 4);
  const matrix = buildEnrolledStudentQuarterlyMatrix(STUDENTS, MIXED_VISITS, '2026-27');
  assert.equal(matrix.totalStudents, 2);
  assert.equal(matrix.totalTargetVisits, 8);
  assert.equal(matrix.completedVisitsCount, 2);
  assert.equal(matrix.byQuarterCompleted.Q1, 1);
  assert.equal(matrix.byQuarterCompleted.Q2, 1);
  assert.equal(matrix.byQuarterCompleted.Q3, 0);

  const abhiraj = matrix.rows.find((r) => r.studentId === 'stu-1')!;
  assert.equal(abhiraj.completedCount, 2);
  assert.equal(abhiraj.nextDueQuarter, 'Q3');

  const hardik = matrix.rows.find((r) => r.studentId === 'stu-2')!;
  assert.equal(hardik.completedCount, 0);
  assert.equal(hardik.nextDueQuarter, 'Q1');
});

test('validateEnrolledStudentVisitInput requires student, quarter, date, staff, and guardian', () => {
  assert.equal(validateEnrolledStudentVisitInput({ studentId: '', academicQuarter: 'Q1' }).valid, false);
  assert.equal(
    validateEnrolledStudentVisitInput({
      studentId: 'stu-1',
      academicQuarter: 'Q3',
      visitDate: '2026-11-28',
      visitingStaff: 'Ms. Nirmla Yadav',
      guardianMet: 'Rajesh Kumar',
    }).valid,
    true,
  );
});
