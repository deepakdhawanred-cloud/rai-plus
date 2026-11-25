import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildAttendanceNotificationId,
  composeParentAttendanceMessage,
  sortAttendanceNotifications,
  summarizeParentAttendanceNotifications,
} from './attendanceNotificationEngine.ts';

describe('attendanceNotificationEngine', () => {
  const sampleStudent = {
    id: 'stu-vis-601',
    name: 'Abhiraj',
    classSection: '6-A',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98120 11223',
  };

  it('composes bilingual English & Hindi notifications tailored to Present, Absent, and Leave statuses', () => {
    const presentMsg = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Present',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
      sentAt: '2026-11-18T03:00:00.000Z',
    });

    assert.equal(presentMsg.id, buildAttendanceNotificationId('school-vis-jjr', '2026-11-18', 'stu-vis-601'));
    assert.match(presentMsg.title, /Marked Present/);
    assert.match(presentMsg.messageEn, /Abhiraj \(Class 6-A\) has arrived safely and is marked Present/);
    assert.match(presentMsg.messageHi, /प्रिय Rajesh Sharma.*उपस्थित \(Present\)/);
    assert.equal(presentMsg.readByParent, false);
    assert.equal(presentMsg.acknowledgedByParent, false);

    const absentMsg = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Absent',
      contextNote: 'Missed morning assembly',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
    });
    assert.match(absentMsg.title, /Attendance Alert: Abhiraj Marked Absent/);
    assert.match(absentMsg.messageEn, /Missed morning assembly/);
    assert.match(absentMsg.messageHi, /अनुपस्थित \(Absent\).*शिक्षक टिप्पणी: Missed morning assembly/);

    const leaveMsg = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Leave',
      customMessage: 'District athletics duty',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
    });
    assert.match(leaveMsg.title, /Approved Leave/);
    assert.match(leaveMsg.messageEn, /District athletics duty/);
  });

  it('preserves acknowledgement on identical re-saves but resets read status when attendance status changes', () => {
    const initial = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Absent',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
    });
    const acked = {
      ...initial,
      readByParent: true,
      readAt: '2026-11-18T04:00:00.000Z',
      acknowledgedByParent: true,
      acknowledgedAt: '2026-11-18T04:00:00.000Z',
    };

    const reSavedSame = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Absent',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
      existing: acked,
    });
    assert.equal(reSavedSame.acknowledgedByParent, true);
    assert.equal(reSavedSame.readByParent, true);

    const correctedToPresent = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Present',
      contextNote: 'Arrived with parent at 9:15 AM',
      sentBy: 'Sunita Devi Ahlawat',
      sentByRole: 'teacher',
      existing: acked,
    });
    assert.equal(correctedToPresent.acknowledgedByParent, false);
    assert.equal(correctedToPresent.readByParent, false);
    assert.match(correctedToPresent.messageEn, /Arrived with parent at 9:15 AM/);
  });

  it('sorts newest first and computes unread/status summary metrics accurately', () => {
    const n1 = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-16',
      status: 'Present',
      sentBy: 'Teacher',
      sentByRole: 'teacher',
      sentAt: '2026-11-16T03:00:00.000Z',
    });
    n1.readByParent = true;
    n1.acknowledgedByParent = true;

    const n2 = composeParentAttendanceMessage({
      schoolId: 'school-vis-jjr',
      schoolName: 'Virat International School',
      student: sampleStudent,
      date: '2026-11-18',
      status: 'Absent',
      sentBy: 'Teacher',
      sentByRole: 'teacher',
      sentAt: '2026-11-18T03:05:00.000Z',
    });

    const sorted = sortAttendanceNotifications([n1, n2]);
    assert.equal(sorted[0].date, '2026-11-18');

    const summary = summarizeParentAttendanceNotifications(sorted, '2026-11-18');
    assert.equal(summary.totalSent, 2);
    assert.equal(summary.unreadCount, 1);
    assert.equal(summary.acknowledgedCount, 1);
    assert.equal(summary.todayCount, 1);
    assert.equal(summary.absentSentCount, 1);
    assert.equal(summary.presentSentCount, 1);
  });
});
