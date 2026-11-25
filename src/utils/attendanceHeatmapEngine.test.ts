import test from 'node:test';
import assert from 'node:assert/strict';
import type { AttendanceRecord, MonthlyAttendanceSummary, StudentRecord } from '../types';
import {
  ATTENDANCE_NON_DIAGNOSTIC_DISCLAIMER,
  buildAttendanceHeatmapCsv,
  buildClassAttendanceHeatmap,
  buildIndividualAttendanceHeatmapProfile,
  buildSchoolAttendanceManagementReport,
  detectAttendanceSupportPatterns,
  type DailyHeatmapCell,
} from './attendanceHeatmapEngine';

const SAMPLE_STUDENTS: StudentRecord[] = [
  {
    id: 'stu-1',
    schoolId: 'sch-1',
    admissionNo: 'ADM-101',
    rollNo: '01',
    name: 'Aarav Sharma',
    classSection: '6-A',
    house: 'Arjuna',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '9812000001',
    udiseStudentId: 'U101',
    haryanaMisId: 'H101',
    attendancePct: 72,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
  {
    id: 'stu-2',
    schoolId: 'sch-1',
    admissionNo: 'ADM-102',
    rollNo: '02',
    name: 'Diya Verma',
    classSection: '6-A',
    house: 'Kalpana',
    guardianName: 'Sunita Verma',
    guardianPhone: '9812000002',
    udiseStudentId: 'U102',
    haryanaMisId: 'H102',
    attendancePct: 96,
    feeBalanceInr: 0,
    totalFeeAnnualInr: 30000,
    reportApprovalStatus: 'Approved',
    formulaVersion: 'v1.2',
    documents: [],
    responsibilities: [],
    achievements: [],
    confidentialCounsellorNote: '',
  },
];

test('detectAttendanceSupportPatterns identifies consecutive absences, Mon/Fri pattern, sudden drop, and threshold watch without diagnostic labels', () => {
  const cells: DailyHeatmapCell[] = [
    { dateIso: '2026-11-02', dayOfMonth: 2, weekdayIndex: 1, weekdayShort: 'Mon', status: 'Absent' },
    { dateIso: '2026-11-03', dayOfMonth: 3, weekdayIndex: 2, weekdayShort: 'Tue', status: 'Absent' },
    { dateIso: '2026-11-04', dayOfMonth: 4, weekdayIndex: 3, weekdayShort: 'Wed', status: 'Absent' },
    { dateIso: '2026-11-05', dayOfMonth: 5, weekdayIndex: 4, weekdayShort: 'Thu', status: 'Present' },
    { dateIso: '2026-11-06', dayOfMonth: 6, weekdayIndex: 5, weekdayShort: 'Fri', status: 'Absent' },
    { dateIso: '2026-11-09', dayOfMonth: 9, weekdayIndex: 1, weekdayShort: 'Mon', status: 'Absent' },
    { dateIso: '2026-11-10', dayOfMonth: 10, weekdayIndex: 2, weekdayShort: 'Tue', status: 'Present' },
  ];

  const detected = detectAttendanceSupportPatterns({
    dailyCells: cells,
    monthlySeries: [
      { month: 'October', attendancePct: 92 },
      { month: 'November', attendancePct: 74 },
    ],
    overallPct: 74,
    thresholdPct: 80,
  });

  assert.ok(detected.patternTypes.includes('consecutive_absences'));
  assert.ok(detected.patternTypes.includes('monday_friday_pattern'));
  assert.ok(detected.patternTypes.includes('sudden_decline'));
  assert.ok(detected.patternTypes.includes('threshold_watch'));
  assert.equal(detected.maxConsecutiveAbsences, 3);
  assert.equal(detected.mondayFridayAbsences, 3);
  assert.equal(detected.suddenDropDeltaPct, -18);

  // Verify non-diagnostic language safeguard
  const combined = detected.indicatorDescriptions.join(' ').toLowerCase();
  assert.equal(/depressed|disturbed|careless|weak/.test(combined), false);
});

test('buildClassAttendanceHeatmap, individual profile, management report, and CSV export reconcile real attendance accurately', () => {
  const attendanceRecords: AttendanceRecord[] = [
    { id: 'a1', schoolId: 'sch-1', studentId: 'stu-1', date: '2026-11-02', status: 'Absent', markedBy: 'Teacher' },
    { id: 'a2', schoolId: 'sch-1', studentId: 'stu-1', date: '2026-11-03', status: 'Absent', markedBy: 'Teacher' },
    { id: 'a3', schoolId: 'sch-1', studentId: 'stu-1', date: '2026-11-04', status: 'Absent', markedBy: 'Teacher' },
    { id: 'a4', schoolId: 'sch-1', studentId: 'stu-2', date: '2026-11-02', status: 'Present', markedBy: 'Teacher' },
  ];

  const monthlyAttendance: MonthlyAttendanceSummary[] = [
    { id: 'm1', schoolId: 'sch-1', studentId: 'stu-1', month: 'October', year: 2026, workingDays: 24, presentDays: 22, absentDays: 2, leaveDays: 0, lateDays: 0, attendancePct: 91.7 },
    { id: 'm2', schoolId: 'sch-1', studentId: 'stu-1', month: 'November', year: 2026, workingDays: 16, presentDays: 11, absentDays: 5, leaveDays: 0, lateDays: 0, attendancePct: 68.8 },
    { id: 'm3', schoolId: 'sch-1', studentId: 'stu-2', month: 'October', year: 2026, workingDays: 24, presentDays: 23, absentDays: 1, leaveDays: 0, lateDays: 0, attendancePct: 95.8 },
    { id: 'm4', schoolId: 'sch-1', studentId: 'stu-2', month: 'November', year: 2026, workingDays: 16, presentDays: 16, absentDays: 0, leaveDays: 0, lateDays: 0, attendancePct: 100 },
  ];

  const rows = buildClassAttendanceHeatmap({
    students: SAMPLE_STUDENTS,
    attendanceRecords,
    monthlyAttendance,
    classSection: '6-A',
    monthKey: 'November',
  });
  assert.equal(rows.length, 2);
  assert.ok(rows[0].patternTypes.includes('consecutive_absences'));
  assert.equal(rows[1].absentDays, 0);

  const profile = buildIndividualAttendanceHeatmapProfile({
    student: SAMPLE_STUDENTS[0],
    attendanceRecords,
    monthlyAttendance,
  });
  assert.equal(profile.disclaimer, ATTENDANCE_NON_DIAGNOSTIC_DISCLAIMER);
  assert.ok(profile.maxConsecutiveAbsences >= 3);
  assert.ok(profile.totalWorkingDays > 0);

  const mgmt = buildSchoolAttendanceManagementReport({
    students: SAMPLE_STUDENTS,
    attendanceRecords,
    monthlyAttendance,
    activeMonth: 'November',
  });
  assert.equal(mgmt.totalStudents, 2);
  assert.equal(mgmt.classSummaries.length, 1);
  assert.ok(mgmt.totalStudentsNeedingFollowUp >= 1);

  const csv = buildAttendanceHeatmapCsv(rows, 'November');
  assert.ok(csv.includes('Aarav Sharma'));
  assert.ok(csv.includes('ADM-101'));
});
