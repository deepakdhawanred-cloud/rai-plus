import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildComplaintRefNo,
  computeComplaintStats,
  filterComplaints,
  sanitizeComplaintForRole,
  validateNewComplaintInput,
} from './complaintEngine';
import type { ParentComplaint } from '../types';

const sampleComplaint: ParentComplaint = {
  id: 'cmp-1',
  refNo: 'CMP-2026-0101',
  schoolId: 'school-svm-kk',
  studentId: 'stu-svm-101',
  studentName: 'Aarav Mehta',
  classSection: '9-A',
  parentName: 'Suresh Mehta',
  category: 'Transport',
  title: 'Morning bus arrived 20 minutes late at Sector 7 stop',
  description: 'Route HR-65-B arrived at 7:52 AM instead of 7:30 AM without prior SMS alert.',
  priority: 'Urgent',
  status: 'Investigating',
  assignedCoordinator: 'Anil Kumar Hooda',
  internalStaffNote: 'Driver reported fog delay near Pipli Chowk; check GPS tracker battery.',
  resolutionNote: 'Transport coordinator spoke with route supervisor and enabled morning WhatsApp updates.',
  createdAt: '2026-11-12',
  updatedAt: '2026-11-13',
};

test('sanitizeComplaintForRole strictly hides internalStaffNote from parent and student roles', () => {
  const parentView = sanitizeComplaintForRole(sampleComplaint, 'parent');
  const studentView = sanitizeComplaintForRole(sampleComplaint, 'student');
  const principalView = sanitizeComplaintForRole(sampleComplaint, 'principal');

  assert.equal('internalStaffNote' in parentView, false);
  assert.equal('internalStaffNote' in studentView, false);
  assert.equal(parentView.resolutionNote, sampleComplaint.resolutionNote);
  assert.equal(principalView.internalStaffNote, sampleComplaint.internalStaffNote);
});

test('validateNewComplaintInput catches missing description and oversized photo payloads', () => {
  assert.equal(
    validateNewComplaintInput({
      studentId: 'stu-svm-101',
      category: 'Transport',
      title: 'Bus delay',
      description: 'Short',
    }).valid,
    false,
  );
  assert.equal(
    validateNewComplaintInput({
      studentId: 'stu-svm-101',
      category: 'Transport',
      title: 'Bus delay on Route 4',
      description: 'Bus arrived 20 minutes late without SMS update.',
      photoDataUrl: 'x'.repeat(800_000),
    }).valid,
    false,
  );
  assert.equal(
    validateNewComplaintInput({
      studentId: 'stu-svm-101',
      category: 'Transport',
      title: 'Bus delay on Route 4',
      description: 'Bus arrived 20 minutes late without SMS update.',
    }).valid,
    true,
  );
});

test('computeComplaintStats and filterComplaints summarize open and safeguarding counts accurately', () => {
  const resolved: ParentComplaint = {
    ...sampleComplaint,
    id: 'cmp-2',
    refNo: 'CMP-2026-0102',
    priority: 'Standard',
    status: 'Resolved',
  };
  const escalation: ParentComplaint = {
    ...sampleComplaint,
    id: 'cmp-3',
    refNo: 'CMP-2026-0103',
    priority: 'Safeguarding Escalation',
    status: 'New',
    assignedCoordinator: '',
  };

  const stats = computeComplaintStats([sampleComplaint, resolved, escalation]);
  assert.equal(stats.total, 3);
  assert.equal(stats.openCount, 2);
  assert.equal(stats.unassignedCount, 1);
  assert.equal(stats.safeguardingCount, 1);
  assert.equal(stats.resolvedCount, 1);

  assert.equal(filterComplaints([sampleComplaint, resolved, escalation], { status: 'New' }).length, 1);
  assert.equal(
    filterComplaints([sampleComplaint, resolved, escalation], { query: 'CMP-2026-0102' }).length,
    1,
  );
  assert.equal(buildComplaintRefNo(4, 2026), 'CMP-2026-0105');
});
