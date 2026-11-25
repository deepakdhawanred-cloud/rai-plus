import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase } from '../../server/seedData';
import { ensureSchoolSpecificResourcesSeeded } from '../../server/eventsAndPlansRoutes';
import { filterSchoolResourcesForRole } from './roleVisibilityAudit';
import {
  generateChapterVisualStudyPack,
  getChaptersForClassSubject,
} from './chapterVisualStudyEngine';
import { buildChapterStudyGameDeck } from './chapterStudyGameEngine';
import { buildVisualConceptLabForChapter } from './visualConceptLabEngine';
import {
  buildAbsenceTargetRiskAlert,
  buildDefaultYearlyPlanForStudent,
  evaluateTargetAttendanceRisk,
} from './yearlyPlanEngine';

test('students only see teacher-pushed resources for their dedicated class and different schools receive distinct resources', () => {
  const db = createInitialDatabase();
  ensureSchoolSpecificResourcesSeeded(db);

  const visResources = db.resources.filter((r) => r.schoolId === 'school-vis-jjr');
  const svmResources = db.resources.filter((r) => r.schoolId === 'school-svm-kk');
  const dpaResources = db.resources.filter((r) => r.schoolId === 'school-dpa-knl');

  // Distinct school-specific resources exist across schools
  assert.ok(visResources.some((r) => r.id === 'res-vis-c6-sci-food'));
  assert.ok(svmResources.some((r) => r.id === 'res-svm-c6-sci-food'));
  assert.ok(dpaResources.some((r) => r.id === 'res-dpa-c11-phy-laws'));
  assert.notEqual(
    visResources.find((r) => r.id === 'res-vis-c6-sci-food')?.title,
    svmResources.find((r) => r.id === 'res-svm-c6-sci-food')?.title,
  );

  // Class 6-A student at VIS only sees pushed Class 6 resources (never Class 10, never unpushed staff-only rubric)
  const visClass6StudentRes = filterSchoolResourcesForRole({
    role: 'student',
    userName: 'Abhiraj',
    resources: visResources,
    visibleClassSections: new Set(['6-A']),
  });

  assert.ok(visClass6StudentRes.length >= 2);
  assert.ok(visClass6StudentRes.every((r) => r.pushedToStudents === true && r.status === 'Approved'));
  assert.ok(visClass6StudentRes.some((r) => r.id === 'res-vis-c6-sci-food'));
  assert.equal(
    visClass6StudentRes.some((r) => r.id === 'res-vis-c6-eng-draft'),
    false,
    'Unpushed staff-only resource must not be visible to students',
  );
  assert.equal(
    visClass6StudentRes.some((r) => r.id === 'res-vis-c10-phy-light'),
    false,
    'Class 10 resource must not leak to a Class 6 student',
  );
});

test('Class 6 Science Ch 1 Components of Food launches illustrated 4-nutrient drag-and-drop platter lab and other chapters build universal visual concept trays', () => {
  const c6SciChapters = getChaptersForClassSubject(6, 'Science');
  const ch1 = c6SciChapters.find((c) => c.chapterNumber === 1);
  assert.ok(ch1, 'Class 6 Science Chapter 1 should exist');

  const pack = generateChapterVisualStudyPack(ch1, 'HBSE');
  const deck = buildChapterStudyGameDeck(pack);
  const lab = buildVisualConceptLabForChapter(pack, deck);

  assert.equal(lab.mode, 'food_nutrition_platter');
  assert.equal(lab.rounds.length, 4);
  assert.deepEqual(
    lab.rounds.map((r) => r.targetCategoryKey),
    ['carbohydrates', 'proteins', 'fats', 'vitamins'],
  );
  // Every round has generated image URL and exact matching target count
  for (const round of lab.rounds) {
    assert.ok(round.imageUrl && round.imageUrl.startsWith('/src/assets/images/'));
    const matching = round.items.filter((i) => i.categoryKey === round.targetCategoryKey);
    assert.equal(matching.length, round.targetCount);
  }

  // Non-food chapter (Class 10 Mathematics Ch. 1) produces universal visual concept tray
  const c10MathCh1 = getChaptersForClassSubject(10, 'Mathematics')[0];
  assert.ok(c10MathCh1);
  const mathPack = generateChapterVisualStudyPack(c10MathCh1, 'CBSE');
  const mathDeck = buildChapterStudyGameDeck(mathPack);
  const mathLab = buildVisualConceptLabForChapter(mathPack, mathDeck);
  assert.equal(mathLab.mode, 'universal_concept_tray');
  assert.ok(mathLab.rounds.length >= 2);
});

test('student yearly skill plan detects absence risk and emits dual parent and management alert', () => {
  const db = createInitialDatabase();
  const student = {
    ...db.students.find((s) => s.schoolId === 'school-vis-jjr')!,
    attendancePct: 78,
  };
  const plan = buildDefaultYearlyPlanForStudent(student, null, '2026-27');
  assert.equal(plan.targets.length, 4);
  assert.ok(plan.targets.every((t) => t.targetScore > t.currentScore));

  const recentAbsences = [
    {
      id: 'att-t1',
      schoolId: student.schoolId,
      studentId: student.id,
      date: '2026-11-22',
      status: 'Absent' as const,
    },
    {
      id: 'att-t2',
      schoolId: student.schoolId,
      studentId: student.id,
      date: '2026-11-21',
      status: 'Absent' as const,
    },
  ];

  const evalRes = evaluateTargetAttendanceRisk(plan, student, recentAbsences);
  assert.ok(evalRes.overallRiskLevel === 'At Risk' || evalRes.overallRiskLevel === 'Critical Risk');
  assert.equal(evalRes.consecutiveAbsences, 2);
  assert.ok(evalRes.impactedTargets.length > 0);
  assert.ok(evalRes.projectedAttainmentDropPct > 0);

  const alert = buildAbsenceTargetRiskAlert({
    schoolId: student.schoolId,
    schoolName: 'Virat International School',
    student,
    plan,
    absenceDate: '2026-11-22',
    attendanceRecords: recentAbsences,
    triggeredBy: 'Class Teacher',
  });

  assert.deepEqual(alert.recipients, ['parent', 'management']);
  assert.ok(alert.parentMessage.includes(student.name));
  assert.ok(alert.managementMessage.includes(student.name));
  assert.ok(alert.impactedTargets.length > 0);
});
