import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCurriculumSubjectsForClass,
  resolveClassSubjectsForNotebook,
  resolveSuggestedChapterForSubject,
  sortClassSectionsNaturally,
} from './classSubjectsEngine';
import type { LessonPlan, TimetableSlot, UserAccount } from '../types';

const TEACHER_USER: UserAccount = {
  id: 'usr-t-1',
  name: 'Mrs. Priya Sharma',
  email: 'priya@school.edu.in',
  role: 'teacher',
  schoolId: 'school-1',
  designation: 'TGT Science',
  subjectSpecialty: 'Science & Biology',
  classTeacherOf: '9-A',
};

const PRINCIPAL_USER: UserAccount = {
  id: 'usr-p-1',
  name: 'Dr. Meenakshi Deswal',
  email: 'principal@school.edu.in',
  role: 'principal',
  schoolId: 'school-1',
  designation: 'Principal',
};

test('sortClassSectionsNaturally orders Nursery/LKG/UKG then numeric classes cleanly', () => {
  const sorted = sortClassSectionsNaturally([
    '10-A',
    '3-B',
    'UKG',
    '12-Commerce',
    'Nursery',
    '1-A',
    'LKG',
    '11-Arts',
  ]);
  assert.deepEqual(sorted, [
    'Nursery',
    'LKG',
    'UKG',
    '1-A',
    '3-B',
    '10-A',
    '11-Arts',
    '12-Commerce',
  ]);
});

test('getCurriculumSubjectsForClass returns stream-appropriate subjects per class level', () => {
  assert.ok(getCurriculumSubjectsForClass('11-Commerce').includes('Accountancy'));
  assert.ok(getCurriculumSubjectsForClass('11-Commerce').includes('Economics'));
  assert.ok(!getCurriculumSubjectsForClass('11-Commerce').includes('Physics'));

  assert.ok(getCurriculumSubjectsForClass('12-Arts').includes('Political Science'));
  assert.ok(getCurriculumSubjectsForClass('12-Arts').includes('Geography'));

  assert.ok(getCurriculumSubjectsForClass('11-Science').includes('Physics'));
  assert.ok(getCurriculumSubjectsForClass('11-Science').includes('Chemistry'));

  assert.ok(getCurriculumSubjectsForClass('3-B').includes('EVS'));
  assert.ok(getCurriculumSubjectsForClass('Nursery').includes('EVS & Oral'));
});

test('resolveClassSubjectsForNotebook auto-selects teacher timetable subject for that class', () => {
  const timetable: TimetableSlot[] = [
    {
      id: 'tt-1',
      schoolId: 'school-1',
      day: 'Monday',
      period: 1,
      timeRange: '08:30-09:15',
      classSection: '9-A',
      subject: 'Mathematics',
      teacherName: 'Mr. Yatish Kumar',
    },
    {
      id: 'tt-2',
      schoolId: 'school-1',
      day: 'Monday',
      period: 2,
      timeRange: '09:15-10:00',
      classSection: '9-A',
      subject: 'Science',
      teacherName: 'Mrs. Priya Sharma',
    },
  ];
  const lessonPlans: LessonPlan[] = [
    {
      id: 'lp-1',
      schoolId: 'school-1',
      level: 'Weekly',
      classSection: '9-A',
      subject: 'Science',
      topic: 'Ch. 8: Motion & Velocity Graphs',
      learningOutcome: 'Interpret distance-time graphs',
      status: 'In Progress',
      teacherName: 'Mrs. Priya Sharma',
      targetDate: '2026-11-20',
    },
  ];

  const resolved = resolveClassSubjectsForNotebook({
    classSection: '9-A',
    user: TEACHER_USER,
    timetable,
    lessonPlans,
  });

  assert.equal(resolved.autoSelectedSubject, 'Science');
  assert.match(resolved.autoSelectReason, /your Class 9-A timetable/i);
  assert.equal(resolved.suggestedChapter, 'Ch. 8: Motion & Velocity Graphs');
  assert.ok(resolved.subjects.includes('Mathematics'));
  assert.ok(resolved.subjects.includes('Science'));
});

test('resolveClassSubjectsForNotebook falls back to teacher specialty when no timetable slot exists', () => {
  const resolved = resolveClassSubjectsForNotebook({
    classSection: '10-A',
    user: TEACHER_USER,
    timetable: [],
  });
  assert.equal(resolved.autoSelectedSubject, 'Science');
  assert.match(resolved.autoSelectReason, /specialty/i);
});

test('resolveClassSubjectsForNotebook auto-selects class timetable subject for principal and updates chapter on subject switch', () => {
  const timetable: TimetableSlot[] = [
    {
      id: 'tt-11c',
      schoolId: 'school-1',
      day: 'Tuesday',
      period: 1,
      timeRange: '09:05-09:40',
      classSection: '11-Commerce',
      subject: 'Accounts',
      teacherName: 'Deepa',
    },
  ];
  const resolved = resolveClassSubjectsForNotebook({
    classSection: '11-Commerce',
    user: PRINCIPAL_USER,
    timetable,
  });
  assert.equal(resolved.autoSelectedSubject, 'Accountancy');
  assert.ok(resolved.subjects.includes('Business Studies'));

  const chapter = resolveSuggestedChapterForSubject({
    classSection: '11-Commerce',
    subject: 'Economics',
    lessonPlans: [],
  });
  assert.equal(chapter, 'Economics · Current Chapter Practice');
});
