import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase } from '../../server/seedData';
import { calculateLearnersScore } from './evidenceEngine';
import { computeSchoolRankings } from './learnersRankingEngine';
import {
  computeManagementAlerts,
  computeSchoolSetupChecklist,
  computeTeacherTodayDigest,
} from './managementIntelligenceEngine';
import type { WorkspaceData } from '../types/workspace';

function makeMockWorkspace(role: WorkspaceData['user']['role'] = 'principal'): WorkspaceData {
  const db = createInitialDatabase();
  const school = db.schools[0];
  const user = db.users.find((u) => u.role === role && (u.schoolId === school.id || u.schoolId === null)) ?? db.users[1];
  const students = db.students.filter((s) => s.schoolId === school.id);
  const weightsConfig = db.schoolWeights[school.id];
  const breakdowns: WorkspaceData['studentBreakdowns'] = {};
  for (const st of students) {
    breakdowns[st.id] = calculateLearnersScore(
      db.evidence.filter((e) => e.schoolId === school.id && e.studentId === st.id),
      weightsConfig.weights,
    );
  }
  return {
    user,
    activeSchool: school,
    availableSchools: [school],
    weightsConfig,
    students,
    studentBreakdowns: breakdowns,
    rankings: computeSchoolRankings(students, breakdowns, weightsConfig.weights, school.code),
    evidence: db.evidence.filter((e) => e.schoolId === school.id),
    notebookEntries: db.notebookEntries.filter((n) => n.schoolId === school.id),
    developmentReviews: (db.developmentReviews || []).filter((d) => d.schoolId === school.id),
    examMarks: db.examMarks.filter((m) => m.schoolId === school.id),
    attendance: db.attendance.filter((a) => a.schoolId === school.id),
    resources: db.resources.filter((r) => r.schoolId === school.id),
    lessonPlans: db.lessonPlans.filter((l) => l.schoolId === school.id),
    timetable: db.timetable.filter((t) => t.schoolId === school.id),
    admissionLeads: db.admissionLeads.filter((a) => a.schoolId === school.id),
    homeVisitRecords: db.homeVisitRecords.filter((v) => v.schoolId === school.id),
    careerRequests: db.careerRequests,
    feeTransactions: db.feeTransactions.filter((f) => f.schoolId === school.id),
    operations: db.operations.filter((o) => o.schoolId === school.id),
    parentComplaints: (db.parentComplaints || []).filter((c) => c.schoolId === school.id),
    blogArticles: db.blogArticles,
    auditLogs: db.auditLogs.filter((a) => a.schoolId === school.id),
    publicEnquiries: db.publicEnquiries,
    cognitiveAttempts: db.cognitiveAttempts.filter((c) => c.schoolId === school.id),
    cognitiveAssignments: db.cognitiveAssignments.filter((c) => c.schoolId === school.id),
  };
}

test('computeTeacherTodayDigest finds matching teacher periods and support students', () => {
  const ws = makeMockWorkspace('teacher');
  const digest = computeTeacherTodayDigest(ws, 'Monday');
  assert.ok(digest.teacherSlots.length > 0);
  assert.ok(digest.studentsNeedingSupport.length > 0);
});

test('computeManagementAlerts emits transparent rule-based alerts with why & recommendedAction', () => {
  const ws = makeMockWorkspace('principal');
  const alerts = computeManagementAlerts(ws, '2026-11-15');
  assert.ok(alerts.length > 0);
  for (const al of alerts) {
    assert.ok(al.why.length > 10);
    assert.ok(al.recommendedAction.length > 10);
  }
});

test('computeSchoolSetupChecklist computes 100% readiness for fully seeded tenant', () => {
  const ws = makeMockWorkspace('school_admin');
  const checklist = computeSchoolSetupChecklist(ws);
  assert.equal(checklist.totalCount, 6);
  assert.ok(checklist.completedCount >= 5);
});
