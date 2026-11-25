import test from 'node:test';
import assert from 'node:assert/strict';
import type { NotebookEntry, StudentRecord } from '../types';
import {
  buildNotebookNotificationId,
  composeNotebookIncompleteAlert,
  resolveNotebookIncompleteAlert,
  shouldTriggerNotebookIncompleteAlert,
  sortNotebookNotifications,
  summarizeNotebookNotifications,
} from './notebookNotificationEngine';

const sampleStudent: Pick<
  StudentRecord,
  'id' | 'name' | 'classSection' | 'guardianName' | 'guardianPhone'
> = {
  id: 'stu-vis-601',
  name: 'Abhiraj',
  classSection: '6-A',
  guardianName: 'Rajesh Kumar',
  guardianPhone: '+91-98110-12345',
};

function makeEntry(overrides: Partial<NotebookEntry> = {}): NotebookEntry {
  return {
    id: 'nb-test-1',
    schoolId: 'school-vis-jjr',
    studentId: 'stu-vis-601',
    classSection: '6-A',
    subject: 'Mathematics',
    chapter: 'Ch. 7 Fractions',
    date: '2026-11-19',
    checked: true,
    handwriting: 'Readability',
    workQuality: 'B',
    homeworkDone: false,
    remarks: 'Complete exercise 7.2 sums',
    teacherName: 'Praveen Kaushik',
    ...overrides,
  };
}

test('triggers automated alerts only for incomplete or unchecked notebook entries', () => {
  assert.equal(shouldTriggerNotebookIncompleteAlert(makeEntry({ checked: true, homeworkDone: false })), true);
  assert.equal(shouldTriggerNotebookIncompleteAlert(makeEntry({ checked: false, homeworkDone: false })), true);
  assert.equal(shouldTriggerNotebookIncompleteAlert(makeEntry({ checked: false, homeworkDone: true })), true);
  assert.equal(shouldTriggerNotebookIncompleteAlert(makeEntry({ checked: true, homeworkDone: true })), false);
});

test('composes bilingual parent and student alerts with chapter no., name, date, and teacher remarks', () => {
  const entry = makeEntry();
  const alert = composeNotebookIncompleteAlert({
    schoolId: 'school-vis-jjr',
    schoolName: 'Virat International School, Jhajjar',
    student: sampleStudent,
    entry,
    triggeredBy: 'Praveen Kaushik',
    triggeredByRole: 'teacher',
    triggeredAt: '2026-11-19T04:30:00.000Z',
  });

  assert.equal(
    alert.id,
    buildNotebookNotificationId('school-vis-jjr', 'stu-vis-601', '2026-11-19', 'Mathematics', 'Ch. 7 Fractions'),
  );
  assert.equal(alert.notebookStatus, 'Incomplete');
  assert.equal(alert.chapterNo, 'Ch. 7');
  assert.equal(alert.chapterName, 'Fractions');
  assert.deepEqual(alert.recipients, ['student', 'parent']);
  assert.equal(alert.status, 'Active');
  assert.equal(alert.readByStudent, false);
  assert.equal(alert.readByParent, false);
  assert.match(alert.messageEn, /Rajesh Kumar/);
  assert.match(alert.messageEn, /Ch\. 7: Fractions/);
  assert.match(alert.messageEn, /2026-11-19/);
  assert.match(alert.messageEn, /Complete exercise 7\.2 sums/);
  assert.match(alert.messageHi, /अपूर्ण \(Incomplete\)/);
  assert.match(alert.studentMessage, /Hi Abhiraj/);
  assert.match(alert.studentMessage, /Complete exercise 7\.2 sums/);
});

test('preserves acknowledgement on identical re-save and auto-resolves when later marked Complete', () => {
  const entry = makeEntry();
  const first = composeNotebookIncompleteAlert({
    schoolId: 'school-vis-jjr',
    schoolName: 'Virat International School, Jhajjar',
    student: sampleStudent,
    entry,
    triggeredBy: 'Praveen Kaushik',
    triggeredByRole: 'teacher',
    triggeredAt: '2026-11-19T04:30:00.000Z',
  });

  const acked = {
    ...first,
    readByParent: true,
    acknowledgedByParent: true,
    acknowledgedByParentAt: '2026-11-19T05:00:00.000Z',
  };

  const resaved = composeNotebookIncompleteAlert({
    schoolId: 'school-vis-jjr',
    schoolName: 'Virat International School, Jhajjar',
    student: sampleStudent,
    entry,
    triggeredBy: 'Praveen Kaushik',
    triggeredByRole: 'teacher',
    triggeredAt: '2026-11-19T06:00:00.000Z',
    existing: acked,
  });

  assert.equal(resaved.acknowledgedByParent, true);
  assert.equal(resaved.triggeredAt, '2026-11-19T04:30:00.000Z');

  const resolved = resolveNotebookIncompleteAlert(
    resaved,
    'Praveen Kaushik',
    '2026-11-20T04:00:00.000Z',
  );
  assert.equal(resolved.status, 'Resolved');
  assert.equal(resolved.resolvedBy, 'Praveen Kaushik');
  assert.equal(resolved.resolvedAt, '2026-11-20T04:00:00.000Z');
});

test('sorts active alerts ahead of resolved alerts and summarizes unread counts per role', () => {
  const activeAlert = composeNotebookIncompleteAlert({
    schoolId: 'school-vis-jjr',
    schoolName: 'VIS Jhajjar',
    student: sampleStudent,
    entry: makeEntry({ date: '2026-11-18' }),
    triggeredBy: 'Praveen Kaushik',
    triggeredByRole: 'teacher',
    triggeredAt: '2026-11-18T05:00:00.000Z',
  });
  activeAlert.readByStudent = true;
  activeAlert.acknowledgedByStudent = true;

  const resolvedNewer = resolveNotebookIncompleteAlert(
    composeNotebookIncompleteAlert({
      schoolId: 'school-vis-jjr',
      schoolName: 'VIS Jhajjar',
      student: sampleStudent,
      entry: makeEntry({ date: '2026-11-19', chapter: 'Ch. 8 Decimals' }),
      triggeredBy: 'Praveen Kaushik',
      triggeredByRole: 'teacher',
      triggeredAt: '2026-11-19T05:00:00.000Z',
    }),
    'Praveen Kaushik',
  );

  const sorted = sortNotebookNotifications([resolvedNewer, activeAlert]);
  assert.equal(sorted[0].id, activeAlert.id);
  assert.equal(sorted[1].id, resolvedNewer.id);

  const parentSummary = summarizeNotebookNotifications(sorted, 'parent');
  assert.equal(parentSummary.activeAlerts, 1);
  assert.equal(parentSummary.resolvedAlerts, 1);
  assert.equal(parentSummary.unreadForViewer, 1);

  const studentSummary = summarizeNotebookNotifications(sorted, 'student');
  assert.equal(studentSummary.unreadForViewer, 0);
  assert.equal(studentSummary.acknowledgedByStudent, 1);
});
