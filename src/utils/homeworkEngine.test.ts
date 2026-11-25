import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { HomeworkAssignment, HomeworkSubmission, StudentRecord, TimetableSlot } from '../types';
import {
  buildHomeworkSourceKey,
  buildTeacherClassTargets,
  extractDefaultSubject,
  filterHomeworkForStudents,
  isTeacherAuthorizedForHomeworkClass,
  mapHomeworkSubmissionToEvidence,
  sortStudentHomeworkRows,
  summarizeTeacherRecentHomework,
  validateHomeworkCreateInput,
  validateHomeworkModalDraft,
} from './homeworkEngine';
import { calculateLearnersScore } from './evidenceEngine';

const sampleAssignment: HomeworkAssignment = {
  id: 'hw-1',
  schoolId: 'school-vis-jjr',
  classSection: '6-A',
  subject: 'Mathematics',
  chapter: 'Ch. 7: Fractions',
  title: 'Equivalent Fractions Practice Sheet',
  instructions: 'Solve exercises 7.1 Q1–Q6 neatly in notebook.',
  assignedDate: '2026-11-12',
  dueDate: '2026-11-15',
  status: 'Active',
  createdBy: 'Praveen Kumar Kaushik',
  updatedAt: '2026-11-12',
};

describe('homeworkEngine', () => {
  it('validates required homework assignment fields', () => {
    assert.equal(validateHomeworkCreateInput({ classSection: '', subject: 'Math', title: 'X', dueDate: '2026-11-15' }).valid, false);
    assert.equal(validateHomeworkCreateInput({ classSection: '6-A', subject: 'Math', title: '', dueDate: '2026-11-15' }).valid, false);
    assert.equal(validateHomeworkCreateInput({ classSection: '6-A', subject: 'Math', title: 'Fractions', dueDate: '2026-11-15' }).valid, true);
  });

  it('Q4 rule: never penalizes Pending or Cancelled homework', () => {
    const pendingSub: HomeworkSubmission = {
      id: 'sub-1',
      schoolId: 'school-vis-jjr',
      assignmentId: 'hw-1',
      studentId: 'stu-vis-601',
      status: 'Pending',
      feedback: '',
      markedBy: 'Praveen Kumar Kaushik',
      markedAt: '2026-11-14',
    };
    assert.equal(mapHomeworkSubmissionToEvidence(sampleAssignment, pendingSub), null);

    const cancelledAsg: HomeworkAssignment = {
      ...sampleAssignment,
      status: 'Cancelled',
      cancellationReason: 'Holiday rescheduled',
    };
    const handedInSub: HomeworkSubmission = { ...pendingSub, status: 'Handed In' };
    assert.equal(mapHomeworkSubmissionToEvidence(cancelledAsg, handedInSub), null);
  });

  it('maps Handed In, Late, and Missing submissions to deterministic hw: sourceKey evidence', () => {
    const handedIn = mapHomeworkSubmissionToEvidence(sampleAssignment, {
      id: 'sub-1',
      schoolId: 'school-vis-jjr',
      assignmentId: 'hw-1',
      studentId: 'stu-vis-601',
      status: 'Handed In',
      feedback: 'All steps verified.',
      markedBy: 'Praveen Kumar Kaushik',
      markedAt: '2026-11-15',
    });
    assert.ok(handedIn);
    assert.equal(handedIn.sourceKey, buildHomeworkSourceKey('hw-1', 'stu-vis-601'));
    assert.equal(handedIn.componentContributions.learningHabits, 90);
    assert.equal(handedIn.olqContributions.sense_of_responsibility, 88);

    const missing = mapHomeworkSubmissionToEvidence(sampleAssignment, {
      id: 'sub-2',
      schoolId: 'school-vis-jjr',
      assignmentId: 'hw-1',
      studentId: 'stu-vis-602',
      status: 'Missing',
      feedback: 'Follow-up scheduled.',
      markedBy: 'Praveen Kumar Kaushik',
      markedAt: '2026-11-15',
    });
    assert.ok(missing);
    assert.equal(missing.componentContributions.learningHabits, 48);
    // Missing evidence score is constructive, never 0
    const score = calculateLearnersScore([missing]);
    assert.ok((score.components.learningHabits.score ?? 0) > 0);
  });

  it('filters homework visibility strictly to the linked child class section', () => {
    const students = [
      { id: 'stu-vis-601', schoolId: 'school-vis-jjr', classSection: '6-A', name: 'Abhiraj' },
    ] as StudentRecord[];
    const otherClassAsg: HomeworkAssignment = { ...sampleAssignment, id: 'hw-2', classSection: '9-A' };
    const visible = filterHomeworkForStudents([sampleAssignment, otherClassAsg], [], students);
    assert.equal(visible.length, 1);
    assert.equal(visible[0].assignment.id, 'hw-1');
  });

  it('enforces teacher class-section authorization for creating or updating homework', () => {
    const visible = new Set(['10-A', '9-A']);
    assert.equal(
      isTeacherAuthorizedForHomeworkClass({ role: 'teacher', classSection: '10-A', visibleClassSections: visible }),
      true,
    );
    assert.equal(
      isTeacherAuthorizedForHomeworkClass({ role: 'teacher', classSection: '10-a', visibleClassSections: visible }),
      true,
    );
    assert.equal(
      isTeacherAuthorizedForHomeworkClass({ role: 'teacher', classSection: '6-A', visibleClassSections: visible }),
      false,
    );
    assert.equal(
      isTeacherAuthorizedForHomeworkClass({ role: 'principal', classSection: '6-A', visibleClassSections: visible }),
      true,
    );
  });

  it('sorts daily homework with today active items first and cancelled last', () => {
    const todayAsg: HomeworkAssignment = {
      ...sampleAssignment,
      id: 'hw-today',
      assignedDate: '2026-11-16',
      dueDate: '2026-11-17',
      title: 'Today Daily Worksheet',
    };
    const cancelledAsg: HomeworkAssignment = {
      ...sampleAssignment,
      id: 'hw-cancel',
      assignedDate: '2026-11-16',
      dueDate: '2026-11-17',
      status: 'Cancelled',
    };
    const summary = sortStudentHomeworkRows({
      assignments: [sampleAssignment, cancelledAsg, todayAsg],
      submissions: [
        {
          id: 'sub-1',
          schoolId: 'school-vis-jjr',
          assignmentId: 'hw-1',
          studentId: 'stu-vis-601',
          status: 'Handed In',
          feedback: 'Good work',
          markedBy: 'Teacher',
          markedAt: '2026-11-15',
        },
      ],
      studentId: 'stu-vis-601',
      classSection: '6-A',
      todayIso: '2026-11-16',
    });

    assert.equal(summary.rows.length, 3);
    assert.equal(summary.rows[0].assignment.id, 'hw-today');
    assert.equal(summary.rows[2].assignment.id, 'hw-cancel');
    assert.equal(summary.activeCount, 2);
    assert.equal(summary.todayCount, 1);
    assert.equal(summary.pendingCount, 1);
    assert.equal(summary.handedInCount, 1);
  });

  it('extracts clean default subject from teacher specialty string', () => {
    assert.equal(
      extractDefaultSubject('Mathematics (3-A to 6-A), Sainik Batch (3-A to 5-A)'),
      'Mathematics',
    );
    assert.equal(extractDefaultSubject('Hindi (1-A to 5-A)'), 'Hindi');
    assert.equal(extractDefaultSubject(undefined), 'Mathematics');
  });

  it('builds sorted teacher class targets with homeroom priority and timetable subjects', () => {
    const baseStudent: StudentRecord = {
      id: 's-base',
      schoolId: 'school-vis-jjr',
      admissionNo: 'VIS-001',
      rollNo: '01',
      name: 'Base',
      classSection: '10-A',
      house: 'Arjuna House',
      guardianName: 'Guardian',
      guardianPhone: '+91 98000 00001',
      udiseStudentId: '2406150100001',
      haryanaMisId: 'HMIS-1',
      attendancePct: 95,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 36000,
      reportApprovalStatus: 'Approved',
      formulaVersion: 'v1.2',
      documents: [],
      responsibilities: [],
      achievements: [],
      confidentialCounsellorNote: '',
    };
    const sampleStudents: StudentRecord[] = [
      { ...baseStudent, id: 's-9a', name: 'Mohit', classSection: '9-A' },
      { ...baseStudent, id: 's-10a-2', name: 'Priya', classSection: '10-A' },
      { ...baseStudent, id: 's-10a-1', name: 'Ajay', classSection: '10-A' },
    ];
    const sampleTimetable: TimetableSlot[] = [
      {
        id: 'tt-1',
        schoolId: 'school-vis-jjr',
        classSection: '10-A',
        day: 'Monday',
        period: 1,
        timeRange: '08:00-08:40',
        subject: 'Chemistry',
        teacherName: 'Pooja Dhillon',
      },
      {
        id: 'tt-2',
        schoolId: 'school-vis-jjr',
        classSection: '9-A',
        day: 'Monday',
        period: 2,
        timeRange: '08:40-09:20',
        subject: 'Science',
        teacherName: 'Pooja Dhillon',
      },
    ];

    const targets = buildTeacherClassTargets({
      students: sampleStudents,
      timetable: sampleTimetable,
      userName: 'Pooja Dhillon',
      classTeacherOf: '10-A',
      defaultSubject: 'Science',
    });

    assert.equal(targets.length, 2);
    assert.equal(targets[0].classSection, '10-A');
    assert.equal(targets[0].isClassTeacher, true);
    assert.equal(targets[0].studentCount, 2);
    assert.deepEqual(targets[0].subjectsTaught, ['Chemistry']);
    assert.equal(targets[0].sampleStudentId, 's-10a-1');
    assert.equal(targets[1].classSection, '9-A');
    assert.equal(targets[1].isClassTeacher, false);
  });

  it('validates multi-class modal draft and summarizes active teacher tasks', () => {
    assert.equal(
      validateHomeworkModalDraft({
        selectedClasses: [],
        subject: 'Science',
        title: 'Lab Sheet',
        dueDate: '2026-11-19',
      }).valid,
      false,
    );
    assert.equal(
      validateHomeworkModalDraft({
        selectedClasses: ['10-A', '9-A'],
        subject: 'Science',
        title: 'Lab Sheet',
        dueDate: '2026-11-19',
      }).valid,
      true,
    );

    const summary = summarizeTeacherRecentHomework({
      assignments: [sampleAssignment],
      submissions: [
        {
          id: 'sub-1',
          schoolId: 'school-vis-jjr',
          assignmentId: 'hw-1',
          studentId: 'stu-vis-601',
          status: 'Pending',
          feedback: '',
          markedBy: 'Teacher',
          markedAt: '2026-11-12',
        },
        {
          id: 'sub-2',
          schoolId: 'school-vis-jjr',
          assignmentId: 'hw-1',
          studentId: 'stu-vis-602',
          status: 'Handed In',
          feedback: 'Neat',
          markedBy: 'Teacher',
          markedAt: '2026-11-12',
        },
      ],
      todayIso: '2026-11-12',
    });

    assert.equal(summary.length, 1);
    assert.equal(summary[0].totalStudents, 2);
    assert.equal(summary[0].pendingCount, 1);
    assert.equal(summary[0].handedInCount, 1);
    assert.equal(summary[0].isToday, true);
  });
});


