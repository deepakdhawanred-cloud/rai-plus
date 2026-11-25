import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeTeacherProductivityReport,
  createDefaultProductivityKpiConfig,
} from './teacherProductivityEngine';

test('Teacher Productivity aggregates multi-source evidence without punitive ranking', () => {
  const cfg = createDefaultProductivityKpiConfig('sch-1');
  const report = computeTeacherProductivityReport({
    timetable: [
      { id: 't1', schoolId: 'sch-1', day: 'Mon', period: 1, timeRange: '09:05 - 09:40', classSection: '8-A', subject: 'Science', teacherName: 'Meenu', room: 'R1' },
      { id: 't2', schoolId: 'sch-1', day: 'Tue', period: 2, timeRange: '09:40 - 10:15', classSection: '8-A', subject: 'Science', teacherName: 'Meenu', room: 'R1' },
    ],
    substitutions: [
      {
        id: 'sub-1',
        schoolId: 'sch-1',
        date: '2026-11-19',
        day: 'Thu',
        period: 3,
        timeRange: '10:15 - 10:50',
        slotId: 'x',
        classSection: '9-A',
        subject: 'Science',
        room: 'R2',
        absentTeacherName: 'Anand',
        substituteTeacherName: 'Meenu',
        assignmentMode: 'auto_assigned',
        manuallyApproved: false,
        matchTier: 2,
        matchTierLabel: 'Same level',
        scorePoints: 5000,
        ruleWarnings: [],
        reason: 'Cover',
        publishStatus: 'published',
        notifiedTeacher: true,
        assignedBy: 'Principal',
        assignedAt: '2026-11-19',
        auditHistory: [],
      },
    ],
    leaveRequests: [],
    lessonPlans: [
      {
        id: 'lp-1',
        schoolId: 'sch-1',
        level: 'Weekly',
        classSection: '8-A',
        subject: 'Science',
        topic: 'Force',
        learningOutcome: 'Understand balanced and unbalanced forces with classroom experiments',
        teacherName: 'Meenu',
        targetDate: '2026-11-18',
        status: 'Completed',
        approvalRequired: false,
      },
    ],
    notebookEntries: [
      {
        id: 'nb-1',
        schoolId: 'sch-1',
        studentId: 'stu-1',
        classSection: '8-A',
        subject: 'Science',
        chapter: 'Ch 1',
        date: '2026-11-18',
        checked: true,
        handwriting: 'Readability',
        workQuality: 'A',
        homeworkDone: true,
        remarks: 'Good',
        teacherName: 'Meenu',
      },
    ],
    homeworkAssignments: [],
    homeworkSubmissions: [],
    remedialAssignments: [],
    examMarks: [],
    attendanceNotifications: [],
    notebookNotifications: [],
    homeVisits: [],
    config: cfg,
  });

  assert.equal(report.schoolTeacherCount, 1);
  assert.equal(report.rows[0].teacherName, 'Meenu');
  assert.equal(report.rows[0].weeklyRegularPeriods, 2);
  assert.equal(report.rows[0].substitutePeriodsCovered, 1);
  assert.equal(report.rows[0].notebookEntriesLogged, 1);
  assert.equal(report.rows[0].lessonPlansCount, 1);
  assert.equal('rank' in report.rows[0], false);
});
