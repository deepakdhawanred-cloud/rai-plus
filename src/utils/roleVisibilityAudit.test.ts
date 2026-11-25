import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase } from '../../server/seedData';
import { calculateLearnersScore } from './evidenceEngine';
import { computeSchoolRankings } from './learnersRankingEngine';
import {
  canTeacherAccessSubjectResource,
  computeTeacherTeachingScope,
  filterAuditLogsForRole,
  filterLessonPlansForRole,
  filterProductionRegisterForRole,
  filterRankingsForRole,
  filterResourcePacksForRole,
  filterSchoolResourcesForRole,
  filterStudentsForRole,
  filterStudentTelemetryForRole,
  filterTimetableForRole,
  sanitizeStudentForRole,
} from './roleVisibilityAudit';
import type { ProductionRegisterRow, ViratResourcePack } from '../types';
import viratPacksRaw from '../data/viratAcademicResources.json';
import productionRegisterRaw from '../data/productionRegister.json';

const PACKS = viratPacksRaw as ViratResourcePack[];
const REGISTER = productionRegisterRaw as ProductionRegisterRow[];

test('parent and student timetable visibility is strictly restricted to their own linked child class', () => {
  const db = createInitialDatabase();
  const visTimetable = db.timetable.filter((t) => t.schoolId === 'school-vis-jjr');
  const abhirajParent = db.users.find((u) => u.id === 'usr-parent-vis')!;
  const abhirajStudent = db.users.find((u) => u.id === 'usr-student-vis')!;

  const visibleClassSections = new Set(['6-A']);

  const parentSlots = filterTimetableForRole({
    user: abhirajParent,
    schoolTimetable: visTimetable,
    visibleClassSections,
  });
  assert.ok(parentSlots.length > 0);
  assert.ok(parentSlots.every((s) => s.classSection === '6-A'));

  const studentSlots = filterTimetableForRole({
    user: abhirajStudent,
    schoolTimetable: visTimetable,
    visibleClassSections,
  });
  assert.ok(studentSlots.length > 0);
  assert.ok(studentSlots.every((s) => s.classSection === '6-A'));
  // Ensure 10-A, 11-Science, LKG, etc. never leak
  assert.equal(parentSlots.some((s) => s.classSection !== '6-A'), false);
});

test('teacher academic resource access is strictly scoped to assigned classes & subjects', () => {
  const db = createInitialDatabase();
  const visTimetable = db.timetable.filter((t) => t.schoolId === 'school-vis-jjr');

  // Anand is Class Teacher 11-Science and teaches Physics (8-A, 9-A, 10-A, 11-Science)
  const anand = db.users.find((u) => u.id === 'usr-vis-t-anand')!;
  const anandScope = computeTeacherTeachingScope(anand, visTimetable);

  assert.equal(canTeacherAccessSubjectResource(anandScope, 'Class 11', 'Physics'), true);
  assert.equal(canTeacherAccessSubjectResource(anandScope, 'Class 9', 'Science'), true);
  assert.equal(canTeacherAccessSubjectResource(anandScope, 'Class 11', 'English'), false);
  assert.equal(canTeacherAccessSubjectResource(anandScope, 'Class 12', 'Accountancy'), false);
  assert.equal(canTeacherAccessSubjectResource(anandScope, 'Class 3', 'Hindi'), false);

  const anandPacks = filterResourcePacksForRole('teacher', PACKS, anandScope);
  assert.ok(anandPacks.length > 0);
  assert.ok(
    anandPacks.every(
      (p) =>
        p.subject === 'Physics' ||
        p.subject === 'Science' ||
        p.subject === 'All Subjects',
    ),
  );
  assert.equal(anandPacks.some((p) => p.subject === 'English'), false);
  assert.equal(anandPacks.some((p) => p.subject === 'Hindi'), false);

  const anandRegister = filterProductionRegisterForRole('teacher', REGISTER, anandScope);
  assert.ok(anandRegister.length > 0);
  assert.equal(anandRegister.some((r) => r.subject === 'Sanskrit'), false);
  assert.equal(anandRegister.some((r) => r.subject === 'Accountancy'), false);

  // Nirmala teaches Hindi (9-A to 12th); must NOT see Physics or Accountancy
  const nirmala = db.users.find((u) => u.id === 'usr-vis-t-nirmala')!;
  const nirmalaScope = computeTeacherTeachingScope(nirmala, visTimetable);
  assert.equal(canTeacherAccessSubjectResource(nirmalaScope, 'Class 10', 'Hindi'), true);
  assert.equal(canTeacherAccessSubjectResource(nirmalaScope, 'Class 10', 'Mathematics'), false);
  const nirmalaPacks = filterResourcePacksForRole('teacher', PACKS, nirmalaScope);
  assert.equal(nirmalaPacks.some((p) => p.subject === 'Physics'), false);
});

test('rankings, auditLogs, resources, student fee data, and counsellor scope enforce strict role privacy', () => {
  const db = createInitialDatabase();
  const schoolId = 'school-vis-jjr';
  const students = db.students.filter((s) => s.schoolId === schoolId);
  const weights = db.schoolWeights[schoolId].weights;
  const breakdowns = Object.fromEntries(
    students.map((s) => [
      s.id,
      calculateLearnersScore(
        db.evidence.filter((e) => e.schoolId === schoolId && e.studentId === s.id),
        weights,
      ),
    ]),
  );
  const fullRankings = computeSchoolRankings(students, breakdowns, weights, 'VIS-JJR-01');

  const visibleStudentIds = new Set(['stu-vis-601']);
  const visibleClassSections = new Set(['6-A']);

  const parentRankings = filterRankingsForRole({
    role: 'parent',
    fullRankings,
    visibleStudentIds,
    visibleClassSections,
  });

  // Only 6-A class rankings included, never 9-A, 10-A, 12-Commerce
  assert.deepEqual(Object.keys(parentRankings.classTop3BySection), ['6-A']);
  assert.deepEqual(Object.keys(parentRankings.classTotalsBySection), ['6-A']);
  // Other peers anonymized
  const otherPeer = parentRankings.classTop3BySection['6-A'].find((e) => e.studentId !== 'stu-vis-601');
  if (otherPeer) {
    assert.ok(otherPeer.studentName.startsWith('Class 6-A Peer #'));
  }

  // Resources for parent strictly filtered to child class & Approved only
  const visResources = db.resources.filter((r) => r.schoolId === schoolId);
  const parentResources = filterSchoolResourcesForRole({
    role: 'parent',
    userName: 'Rajesh Kumar',
    resources: visResources,
    visibleClassSections,
  });
  assert.equal(parentResources.some((r) => r.status !== 'Approved'), false);
  assert.equal(parentResources.some((r) => r.classSection === '10-A'), false);

  // Audit logs stripped for parent, student, teacher, counsellor
  assert.equal(filterAuditLogsForRole('parent', db.auditLogs, 'school-svm-kk').length, 0);
  assert.equal(filterAuditLogsForRole('student', db.auditLogs, 'school-svm-kk').length, 0);
  assert.equal(filterAuditLogsForRole('teacher', db.auditLogs, 'school-svm-kk').length, 0);
  assert.equal(filterAuditLogsForRole('counsellor', db.auditLogs, 'school-svm-kk').length, 0);
  assert.ok(filterAuditLogsForRole('principal', db.auditLogs, 'school-svm-kk').length > 0);

  // StudentRecord fee balance hidden from student, teacher, counsellor
  const s602 = students.find((s) => s.id === 'stu-vis-602')!;
  assert.equal(sanitizeStudentForRole(s602, 'student').feeBalanceInr, 0);
  assert.equal(sanitizeStudentForRole(s602, 'teacher').feeBalanceInr, 0);
  assert.equal(sanitizeStudentForRole(s602, 'counsellor').feeBalanceInr, 0);
  assert.equal(sanitizeStudentForRole(s602, 'parent').feeBalanceInr, 3500);
  assert.equal(sanitizeStudentForRole(s602, 'parent').confidentialCounsellorNote, '');

  // Counsellor gets zero lesson plans or timetable
  const counsellor = db.users.find((u) => u.id === 'usr-counsellor-1')!;
  assert.equal(
    filterTimetableForRole({
      user: counsellor,
      schoolTimetable: db.timetable,
      visibleClassSections: new Set(),
    }).length,
    0,
  );
  assert.equal(
    filterLessonPlansForRole({
      role: 'counsellor',
      userName: counsellor.name,
      lessonPlans: db.lessonPlans,
    }).length,
    0,
  );
});

test('teacher student directory scoping limits students to sections taught or homeroom classTeacherOf', () => {
  const db = createInitialDatabase();
  const schoolId = 'school-vis-jjr';
  const visStudents = db.students.filter((s) => s.schoolId === schoolId);
  const visTimetable = db.timetable.filter((t) => t.schoolId === schoolId);

  const pooja = db.users.find((u) => u.id === 'usr-vis-t-pooja')!;
  const poojaScope = computeTeacherTeachingScope(pooja, visTimetable);
  const visibleStudents = filterStudentsForRole({
    user: pooja,
    schoolStudents: visStudents,
    teacherScope: poojaScope,
  });

  // Pooja teaches 7-A, 8-A, 9-A, 10-A, 11-Science -> sees 9-A, 10-A, 11-Science, NOT 1-A or 3-B or 12-Commerce
  assert.equal(visibleStudents.some((s) => s.classSection === '10-A'), true);
  assert.equal(visibleStudents.some((s) => s.classSection === '9-A'), true);
  assert.equal(visibleStudents.some((s) => s.classSection === '1-A'), false);
  assert.equal(visibleStudents.some((s) => s.classSection === '3-B'), false);
  assert.equal(visibleStudents.some((s) => s.classSection === '12-Commerce'), false);

  // Student-level telemetry strictly scoped for teacher, parent, and counsellor
  const poojaIds = new Set(visibleStudents.map((s) => s.id));
  const poojaMonthlyAtt = filterStudentTelemetryForRole(
    'teacher',
    db.monthlyAttendance || [],
    schoolId,
    poojaIds,
    { hideFromCounsellor: true },
  );
  assert.ok(poojaMonthlyAtt.length > 0);
  assert.ok(poojaMonthlyAtt.every((r) => poojaIds.has(r.studentId)));

  const parentIds = new Set(['stu-vis-601']);
  const parentReading = filterStudentTelemetryForRole(
    'parent',
    db.readingReports || [],
    schoolId,
    parentIds,
  );
  assert.equal(parentReading.length, 8);
  assert.ok(parentReading.every((r) => r.studentId === 'stu-vis-601'));

  const counsellorMonthlyAtt = filterStudentTelemetryForRole(
    'counsellor',
    db.monthlyAttendance || [],
    schoolId,
    new Set(visStudents.map((s) => s.id)),
    { hideFromCounsellor: true },
  );
  assert.equal(counsellorMonthlyAtt.length, 0);
});
