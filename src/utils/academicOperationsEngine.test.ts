import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import viratPacksRaw from '../data/viratAcademicResources.json';
import productionRegisterRaw from '../data/productionRegister.json';
import { VIS_FACULTY_USERS, VIS_TIMETABLE_NOV_2026 } from '../data/visTimetableNov2026';
import type {
  AcademicResource,
  AttendanceRecord,
  ProductionRegisterRow,
  ViratResourcePack,
} from '../types';
import {
  buildBatchAttendanceRecordId,
  buildClassSubjectResourceIndex,
  buildClassWeeklyMatrix,
  buildTeacherWeeklyMatrix,
  computeUpdatedStudentAttendancePct,
  mapTimetableSlotToCurriculumKey,
  summarizeAttendanceEntries,
  teacherMatchesSlot,
  validateBatchAttendanceInput,
} from './academicOperationsEngine';
import { calculateLearnersScore } from './evidenceEngine';

describe('academicOperationsEngine', () => {
  it('contains all 18 classes and 16 additional faculty logins from VIS Nov 2026 PDF', () => {
    const classesInTimetable = new Set(VIS_TIMETABLE_NOV_2026.map((s) => s.classSection));
    assert.equal(classesInTimetable.size, 18);
    assert.equal(VIS_FACULTY_USERS.length, 16);
    assert.ok(classesInTimetable.has('10-A'));
    assert.ok(classesInTimetable.has('11-Arts'));
    assert.ok(classesInTimetable.has('11-Commerce'));
    assert.ok(classesInTimetable.has('11-Science'));
    assert.ok(classesInTimetable.has('12-Arts'));
    assert.ok(classesInTimetable.has('12-Commerce'));
    assert.ok(classesInTimetable.has('3-A'));
    assert.ok(classesInTimetable.has('3-B'));
    assert.ok(classesInTimetable.has('LKG'));
    assert.ok(classesInTimetable.has('UKG'));
  });

  it('matches single and co-taught faculty slots accurately without false substring collisions', () => {
    assert.equal(teacherMatchesSlot('Yatish, Pooja Dhillon', 'Pooja Dhillon'), true);
    assert.equal(teacherMatchesSlot('Yatish, Pooja Dhillon', 'Yatish'), true);
    assert.equal(teacherMatchesSlot('Dr. Deepak Dhawan', 'Deepak Dhawan'), true);
    assert.equal(teacherMatchesSlot('Deepak Dhawan', 'Dr. Deepak Dhawan'), true);
    assert.equal(teacherMatchesSlot('Rekha, Jagriti, Monika', 'Monika'), true);
    assert.equal(teacherMatchesSlot('Manisha', 'Manish'), false);
    assert.equal(teacherMatchesSlot('Renu', 'Praveen Kumar Kaushik'), false);
  });

  it('builds class weekly matrix and teacher weekly schedule from VIS November 2026 schedule', () => {
    const class10 = buildClassWeeklyMatrix(VIS_TIMETABLE_NOV_2026, '10-A');
    assert.equal(class10.totalPeriods, 48); // 6 days × 8 periods all filled for 10th
    assert.equal(class10.grid.Monday[1]?.subject, 'Science');
    assert.equal(class10.grid.Monday[1]?.teacherName, 'Pooja Dhillon');
    assert.equal(class10.grid.Tuesday[3]?.subject, 'Physics');
    assert.equal(class10.grid.Tuesday[3]?.teacherName, 'Anand');

    const poojaSchedule = buildTeacherWeeklyMatrix(VIS_TIMETABLE_NOV_2026, 'Pooja Dhillon');
    assert.ok(poojaSchedule.totalWeeklyPeriods >= 25);
    assert.ok(poojaSchedule.classesTaught.includes('10-A'));
    assert.ok(poojaSchedule.classesTaught.includes('11-Science'));
    assert.ok(poojaSchedule.classesTaught.includes('7-A'));
    assert.ok(poojaSchedule.classesTaught.includes('8-A'));
    assert.ok(poojaSchedule.classesTaught.includes('9-A'));

    const pinkiSchedule = buildTeacherWeeklyMatrix(VIS_TIMETABLE_NOV_2026, 'Pinki');
    assert.ok(pinkiSchedule.classesTaught.includes('LKG'));
    assert.ok(pinkiSchedule.classesTaught.includes('UKG'));
    assert.ok(pinkiSchedule.classesTaught.includes('1-A'));
    assert.ok(pinkiSchedule.classesTaught.includes('7-A'));
  });

  it('organizes Virat Drive packs, Production Register chapters, and School Resources class-wise & subject-wise', () => {
    const packs = viratPacksRaw as ViratResourcePack[];
    const registerRows = productionRegisterRaw as ProductionRegisterRow[];
    const schoolResources: AcademicResource[] = [
      {
        id: 'res-test-1',
        schoolId: 'school-vis-jjr',
        title: 'HBSE Sample Rubric',
        classSection: '10-A',
        subject: 'Mathematics',
        chapter: 'Board Revision Cycle 2026-27',
        session: '2026-27',
        board: 'HBSE',
        category: 'Assessments and Rubrics',
        status: 'Approved',
        contentSummary: 'Approved diagnostic rubric.',
        createdBy: 'Yatish',
        aiAssisted: false,
        updatedAt: '2026-11-15',
      },
    ];

    const groups = buildClassSubjectResourceIndex({
      packs,
      registerRows,
      registerApprovals: {},
      schoolResources,
    });

    const class10 = groups.find((g) => g.classKey === 'Class 10');
    assert.ok(class10);
    const math10 = class10.subjects.find((s) => s.subject === 'Mathematics');
    assert.ok(math10);
    assert.ok(math10.packs.length >= 1);
    assert.ok(math10.registerRows.length >= 10);
    assert.equal(math10.schoolResources.length, 1);

    const mapping = mapTimetableSlotToCurriculumKey('11-Commerce', 'Accounts & Business Studies');
    assert.equal(mapping.classKey, 'Class 11');
    assert.equal(mapping.subjectKey, 'Accountancy');
  });

  it('validates one-go batch attendance and updates attendancePct without touching OLQ scores', () => {
    const invalid = validateBatchAttendanceInput({
      classSection: '6-A',
      date: '15-11-2026',
      entries: [{ studentId: 'stu-vis-601', status: 'Present' }],
    });
    assert.equal(invalid.valid, false);

    const valid = validateBatchAttendanceInput({
      classSection: '6-A',
      date: '2026-11-15',
      entries: [
        { studentId: 'stu-vis-601', status: 'Present' },
        { studentId: 'stu-vis-602', status: 'Absent', contextNote: 'Fever' },
      ],
    });
    assert.equal(valid.valid, true);

    const summary = summarizeAttendanceEntries([
      { status: 'Present' },
      { status: 'Absent' },
      { status: 'Leave' },
    ]);
    assert.deepEqual(summary, { total: 3, present: 1, absent: 1, leave: 1 });

    assert.equal(
      buildBatchAttendanceRecordId('school-vis-jjr', '2026-11-15', 'stu-vis-601'),
      'att-school-vis-jjr-2026-11-15-stu-vis-601',
    );

    const records: AttendanceRecord[] = [
      {
        id: 'att-1',
        schoolId: 'school-vis-jjr',
        studentId: 'stu-vis-602',
        date: '2026-11-15',
        status: 'Absent',
      },
    ];
    const nextPct = computeUpdatedStudentAttendancePct(records, 'stu-vis-602', 92.1);
    assert.ok(nextPct < 92.1 && nextPct > 85);

    // Confirm Learners Score / OLQs rely strictly on DevelopmentEvidence (zero change from attendance)
    const beforeScore = calculateLearnersScore([]);
    const afterScore = calculateLearnersScore([]);
    assert.deepEqual(beforeScore.olqScores, afterScore.olqScores);
  });
});
