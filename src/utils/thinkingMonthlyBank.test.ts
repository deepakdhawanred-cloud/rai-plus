import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailySsbAssignmentsForStudent,
  generateMonthlyThinkingSet,
  PPDT_12_MONTHLY_SCENES,
  TAT_11_SCENES,
} from './thinkingMonthlyBank.ts';

test('Monthly Class-Aligned Thinking Bank & SSB Daily Engine', async (t) => {
  await t.test('generates 60 unique WAT words per month, identical for same class, different across months & regenerations', () => {
    const novA = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 8,
      monthKey: '2026-11',
      testType: 'WAT',
      setVersion: 1,
    });
    const novB = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 8,
      monthKey: '2026-11',
      testType: 'WAT',
      setVersion: 1,
    });
    const dec = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 8,
      monthKey: '2026-12',
      testType: 'WAT',
      setVersion: 1,
    });
    const novRegen = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 8,
      monthKey: '2026-11',
      testType: 'WAT',
      setVersion: 2,
      usedInMonth: true,
    });

    assert.equal(novA.questions.length, 60);
    assert.equal(new Set(novA.questions.map((q) => q.prompt)).size, 60);
    // Same class & month => identical word order
    assert.deepEqual(
      novA.questions.map((q) => q.prompt),
      novB.questions.map((q) => q.prompt),
    );
    // Different month => distinct sequence
    assert.notDeepEqual(
      novA.questions.map((q) => q.prompt),
      dec.questions.map((q) => q.prompt),
    );
    // Regenerated set => distinct sequence
    assert.notDeepEqual(
      novA.questions.map((q) => q.prompt),
      novRegen.questions.map((q) => q.prompt),
    );
  });

  await t.test('generates 60 unique SRT situations at 30 seconds each, distinct across months and classes', () => {
    const c6Nov = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 6,
      monthKey: '2026-11',
      testType: 'SRT',
      setVersion: 1,
    });
    const c6Dec = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 6,
      monthKey: '2026-12',
      testType: 'SRT',
      setVersion: 1,
    });
    const c11Nov = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 11,
      monthKey: '2026-11',
      testType: 'SRT',
      setVersion: 1,
    });

    assert.equal(c6Nov.questions.length, 60);
    assert.equal(c6Nov.defaultTimeLimitSec, 30);
    assert.ok(c6Nov.questions.every((q) => q.defaultTimeLimitSec === 30));
    assert.equal(new Set(c6Nov.questions.map((q) => q.prompt)).size, 60);
    assert.notDeepEqual(
      c6Nov.questions.map((q) => q.prompt),
      c6Dec.questions.map((q) => q.prompt),
    );
    assert.notDeepEqual(
      c6Nov.questions.map((q) => q.prompt),
      c11Nov.questions.map((q) => q.prompt),
    );
  });

  await t.test('generates exactly 11 distinct TAT pictures and 12 distinct monthly PPDT pictures', () => {
    assert.equal(TAT_11_SCENES.length, 11);
    assert.equal(PPDT_12_MONTHLY_SCENES.length, 12);

    const tat = generateMonthlyThinkingSet({
      schoolId: 'school-1',
      classLevel: 10,
      monthKey: '2026-11',
      testType: 'TAT',
    });
    assert.equal(tat.questions.length, 11);
    assert.equal(new Set(tat.questions.map((q) => q.sceneCode)).size, 11);

    const ppdtCodes = new Set<string>();
    for (let m = 1; m <= 12; m++) {
      const monthKey = `2026-${String(m).padStart(2, '0')}`;
      const ppdt = generateMonthlyThinkingSet({
        schoolId: 'school-1',
        classLevel: 10,
        monthKey,
        testType: 'PPDT',
      });
      assert.equal(ppdt.questions.length, 1);
      ppdtCodes.add(ppdt.questions[0].sceneCode || '');
    }
    assert.equal(ppdtCodes.size, 12);
  });

  await t.test('auto-generates 1 daily set of all 4 tests (SRT, WAT, TAT, PPDT) for SSB-enrolled students idempotently', () => {
    const first = buildDailySsbAssignmentsForStudent({
      schoolId: 'school-1',
      studentId: 'stu-1',
      studentName: 'Abhiraj',
      classSection: '6-A',
      dateKey: '2026-11-20',
      existing: [],
    });
    assert.equal(first.length, 4);
    assert.deepEqual(
      first.map((a) => [a.testType, a.itemCount]),
      [
        ['SRT', 60],
        ['WAT', 60],
        ['TAT', 11],
        ['PPDT', 1],
      ],
    );

    const second = buildDailySsbAssignmentsForStudent({
      schoolId: 'school-1',
      studentId: 'stu-1',
      studentName: 'Abhiraj',
      classSection: '6-A',
      dateKey: '2026-11-20',
      existing: first,
    });
    assert.equal(second.length, 0);
  });
});
