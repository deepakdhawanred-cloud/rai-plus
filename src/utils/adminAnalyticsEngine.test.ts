import assert from 'node:assert/strict';
import test from 'node:test';
import type { WorkspaceData } from '../types/workspace';
import { buildAdminAnalyticsBundle } from './adminAnalyticsEngine';

function createMockWorkspace(): WorkspaceData {
  return {
    user: {
      id: 'u-admin',
      schoolId: 'sch-1',
      name: 'School Admin',
      email: 'admin@school.edu',
      role: 'school_admin',
      designation: 'School Administrator',
    },
    activeSchool: {
      id: 'sch-1',
      name: 'Rai Plus Demo Academy',
      code: 'RPDA',
      city: 'Pune',
      state: 'Maharashtra',
      board: 'CBSE',
      session: '2026-27',
    } as unknown as WorkspaceData['activeSchool'],
    availableSchools: [],
    weightsConfig: {
      weights: {
        academic: 0.35,
        readingNumeracy: 0.2,
        cognitive: 0.15,
        notebookHomework: 0.15,
        olqAttendance: 0.15,
      } as unknown as WorkspaceData['weightsConfig']['weights'],
      version: 'v1',
      approvedBy: 'Principal',
    },
    students: [
      {
        id: 'stu-1',
        schoolId: 'sch-1',
        name: 'Aarav Patel',
        admissionNo: 'ADM-01',
        rollNo: '1',
        classSection: '6-A',
        reportApprovalStatus: 'Approved',
      } as unknown as WorkspaceData['students'][number],
      {
        id: 'stu-2',
        schoolId: 'sch-1',
        name: 'Ananya Joshi',
        admissionNo: 'ADM-02',
        rollNo: '2',
        classSection: '6-A',
        reportApprovalStatus: 'Approved',
      } as unknown as WorkspaceData['students'][number],
      {
        id: 'stu-3',
        schoolId: 'sch-1',
        name: 'Kabir Verma',
        admissionNo: 'ADM-03',
        rollNo: '1',
        classSection: '7-A',
        reportApprovalStatus: 'Pending',
      } as unknown as WorkspaceData['students'][number],
    ],
    studentBreakdowns: {},
    evidence: [],
    notebookEntries: [
      {
        id: 'nb-1',
        schoolId: 'sch-1',
        studentId: 'stu-1',
        classSection: '6-A',
        date: '2026-11-12',
        subject: 'Mathematics',
        chapter: 'Fractions',
        teacherName: 'Meera Nair',
        checked: true,
        homeworkDone: true,
        handwriting: 'Readability',
        workQuality: 'A',
        remarks: 'Neat work',
      },
    ],
    developmentReviews: [],
    examMarks: [
      { id: 'em-1', schoolId: 'sch-1', studentId: 'stu-1', subject: 'Maths', marksObtained: 88, maxMarks: 100 } as unknown as WorkspaceData['examMarks'][number],
      { id: 'em-2', schoolId: 'sch-1', studentId: 'stu-2', subject: 'Maths', marksObtained: 92, maxMarks: 100 } as unknown as WorkspaceData['examMarks'][number],
      { id: 'em-3', schoolId: 'sch-1', studentId: 'stu-3', subject: 'Maths', marksObtained: 76, maxMarks: 100 } as unknown as WorkspaceData['examMarks'][number],
    ],
    attendance: [],
    monthlyAttendance: [
      {
        id: 'ma-1',
        schoolId: 'sch-1',
        studentId: 'stu-1',
        month: 'October',
        year: 2026,
        workingDays: 20,
        presentDays: 19,
        absentDays: 1,
        leaveDays: 0,
        attendancePct: 95,
      } as unknown as NonNullable<WorkspaceData['monthlyAttendance']>[number],
      {
        id: 'ma-2',
        schoolId: 'sch-1',
        studentId: 'stu-2',
        month: 'October',
        year: 2026,
        workingDays: 20,
        presentDays: 17,
        absentDays: 2,
        leaveDays: 1,
        attendancePct: 85,
      } as unknown as NonNullable<WorkspaceData['monthlyAttendance']>[number],
      {
        id: 'ma-3',
        schoolId: 'sch-1',
        studentId: 'stu-1',
        month: 'November',
        year: 2026,
        workingDays: 10,
        presentDays: 10,
        absentDays: 0,
        leaveDays: 0,
        attendancePct: 100,
      } as unknown as NonNullable<WorkspaceData['monthlyAttendance']>[number],
      {
        id: 'ma-4',
        schoolId: 'sch-1',
        studentId: 'stu-2',
        month: 'November',
        year: 2026,
        workingDays: 10,
        presentDays: 9,
        absentDays: 1,
        leaveDays: 0,
        attendancePct: 90,
      } as unknown as NonNullable<WorkspaceData['monthlyAttendance']>[number],
    ],
    readingReports: [
      { id: 'rr-1', studentId: 'stu-1' } as unknown as NonNullable<WorkspaceData['readingReports']>[number],
      { id: 'rr-2', studentId: 'stu-2' } as unknown as NonNullable<WorkspaceData['readingReports']>[number],
    ],
    numeracyReports: [
      { id: 'nr-1', studentId: 'stu-1' } as unknown as NonNullable<WorkspaceData['numeracyReports']>[number],
    ],
    resources: [],
    lessonPlans: [
      {
        id: 'lp-1',
        schoolId: 'sch-1',
        teacherName: 'Meera Nair',
        subject: 'Mathematics',
        classSection: '6-A',
        status: 'Approved',
      } as unknown as WorkspaceData['lessonPlans'][number],
    ],
    timetable: [
      {
        id: 'tt-1',
        schoolId: 'sch-1',
        day: 'Monday',
        period: 1,
        classSection: '6-A',
        subject: 'Mathematics',
        teacherName: 'Meera Nair',
      } as unknown as WorkspaceData['timetable'][number],
      {
        id: 'tt-2',
        schoolId: 'sch-1',
        day: 'Tuesday',
        period: 2,
        classSection: '7-A',
        subject: 'Science',
        teacherName: 'Rohan Deshmukh',
      } as unknown as WorkspaceData['timetable'][number],
    ],
    admissionLeads: [],
    homeVisitRecords: [],
    careerRequests: [],
    feeTransactions: [],
    operations: [],
    parentComplaints: [],
    blogArticles: [],
    auditLogs: [],
    publicEnquiries: [],
    cognitiveAttempts: [],
    cognitiveAssignments: [],
  };
}

test('buildAdminAnalyticsBundle aggregates attendance trends, teacher productivity, and assessment completion accurately', () => {
  const ws = createMockWorkspace();
  const bundle = buildAdminAnalyticsBundle(ws, 'ALL');

  assert.deepEqual(bundle.availableClasses, ['6-A', '7-A']);
  assert.equal(bundle.scopedStudentCount, 3);

  // Attendance trend: Oct (36/40 = 90.0%), Nov (19/20 = 95.0%) -> MoM delta = +5.0%
  assert.equal(bundle.monthlyAttendanceSeries.length, 2);
  assert.equal(bundle.monthlyAttendanceSeries[0].studentAttendancePct, 90);
  assert.equal(bundle.monthlyAttendanceSeries[1].studentAttendancePct, 95);
  assert.equal(bundle.attendanceDeltaPct, 5);
  assert.equal(bundle.avgSchoolAttendancePct, 92.5);

  // Teacher productivity: 2 distinct faculty members tracked from timetable
  assert.equal(bundle.trackedTeacherCount, 2);
  assert.ok(bundle.teacherProductivitySeries.some((t) => t.teacherName === 'Meera Nair'));
  assert.ok(bundle.teacherProductivitySeries.some((t) => t.teacherName === 'Rohan Deshmukh'));

  // Assessment completion: Exam Marks 3/3 (100%), Reading 2/3 (66.7%), Numeracy 1/3 (33.3%)
  const examStream = bundle.assessmentCompletionSeries.find((s) => s.id === 'exam');
  const readingStream = bundle.assessmentCompletionSeries.find((s) => s.id === 'reading');
  const numeracyStream = bundle.assessmentCompletionSeries.find((s) => s.id === 'numeracy');
  assert.equal(examStream?.completionRatePct, 100);
  assert.equal(readingStream?.completionRatePct, 66.7);
  assert.equal(numeracyStream?.completionRatePct, 33.3);
});

test('buildAdminAnalyticsBundle filters metrics cleanly by selected class section', () => {
  const ws = createMockWorkspace();
  const class6Bundle = buildAdminAnalyticsBundle(ws, '6-A');

  assert.equal(class6Bundle.selectedClass, '6-A');
  assert.equal(class6Bundle.scopedStudentCount, 2);
  // Both 6-A students have reading reports -> 100% completion
  const readingStream = class6Bundle.assessmentCompletionSeries.find((s) => s.id === 'reading');
  assert.equal(readingStream?.completionRatePct, 100);
  // Only Meera Nair teaches 6-A
  assert.equal(class6Bundle.trackedTeacherCount, 1);
  assert.equal(class6Bundle.teacherProductivitySeries[0].teacherName, 'Meera Nair');
});
