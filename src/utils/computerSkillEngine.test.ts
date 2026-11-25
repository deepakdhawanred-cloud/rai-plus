import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTaskChecklistSpec,
  computeChecklistCompletionPct,
  computeComputerSkillGrade,
  createDefaultComputerSkillBenchmarks,
  evaluateMiniSheetFormula,
  evaluateTypingPerformance,
  getGradeCompetencyChecklist,
} from './computerSkillEngine.ts';

test('Computer Skill Test Engine (Classes 1 to 12)', async (t) => {
  await t.test('defines progressively calibrated benchmarks for every class from Class 1 to Class 12', () => {
    const benchmarks = createDefaultComputerSkillBenchmarks('school-1');
    assert.equal(benchmarks.length, 12);
    for (let i = 0; i < 12; i++) {
      assert.equal(benchmarks[i].classLevel, i + 1);
      assert.equal(benchmarks[i].tasks.length, 3);
      if (i > 0) {
        assert.ok(benchmarks[i].targetWpm > benchmarks[i - 1].targetWpm);
        assert.ok(benchmarks[i].targetAccuracyPct >= benchmarks[i - 1].targetAccuracyPct);
      }
    }
  });

  await t.test('evaluates typing Net WPM, Gross WPM, Accuracy, and benchmark pass cleanly', () => {
    const passage = 'Digital literacy begins with touch typing and clean file management.';
    const fastAccurate = evaluateTypingPerformance({
      passage,
      typedText: passage,
      elapsedSec: 20, // 68 chars = 13.6 words in 1/3 min -> ~41 WPM
      targetWpm: 30,
      targetAccuracyPct: 90,
    });
    assert.equal(fastAccurate.accuracyPct, 100);
    assert.ok(fastAccurate.netWpm >= 40);
    assert.equal(fastAccurate.benchmarkMet, true);

    const slowTypos = evaluateTypingPerformance({
      passage,
      typedText: 'Dxxxxxx lxxxxxxx bxxxxx',
      elapsedSec: 60,
      targetWpm: 26,
      targetAccuracyPct: 90,
    });
    assert.equal(slowTypos.benchmarkMet, false);
    assert.ok(slowTypos.accuracyPct < 50);
  });

  await t.test('evaluates spreadsheet formulas safely without eval()', () => {
    assert.equal(evaluateMiniSheetFormula('=SUM(B1:B4)', [84, 90, 78, 92]).result, 344);
    assert.equal(evaluateMiniSheetFormula('=AVERAGE(B1:B4)', [76, 84, 88, 92]).result, 85);
    assert.equal(evaluateMiniSheetFormula('=MAX(B1:B5)', [81, 94, 87, 91, 79]).result, 94);
    assert.equal(evaluateMiniSheetFormula('=COUNTIF(B1:B5, ">=85")', [88, 74, 92, 85, 79]).result, 3);
    assert.equal(evaluateMiniSheetFormula('SUM(B1:B4)', [1, 2, 3, 4]).valid, false);
  });

  await t.test('computes composite grade Distinction when typing benchmark and all practical tasks pass', () => {
    const res = computeComputerSkillGrade({
      typingScore: 96,
      typingBenchmarkMet: true,
      practicalResults: [
        { taskId: 't1', kind: 'copy_paste', title: 'Copy', passed: true, score: 30, maxScore: 30, detail: 'OK' },
        { taskId: 't2', kind: 'folder_management', title: 'Folder', passed: true, score: 35, maxScore: 35, detail: 'OK' },
        { taskId: 't3', kind: 'spreadsheet_formula', title: 'Sheet', passed: true, score: 35, maxScore: 35, detail: 'OK' },
      ],
    });
    assert.equal(res.practicalScore, 100);
    assert.equal(res.grade, 'Distinction');
    assert.equal(res.benchmarkPassed, true);
  });

  await t.test('generates tailored simulated practical task checklists and competency rubrics for Grades 1 to 12', () => {
    const benchmarks = createDefaultComputerSkillBenchmarks('school-1');
    for (const bench of benchmarks) {
      const comp = getGradeCompetencyChecklist(bench.classLevel);
      assert.equal(comp.length, 4);
      for (const task of bench.tasks) {
        const steps = buildTaskChecklistSpec(task);
        assert.ok(steps.length >= 1, `Class ${bench.classLevel} task ${task.id} should have checklist steps`);
      }
    }
    const c1Comp = getGradeCompetencyChecklist(1);
    const c12Comp = getGradeCompetencyChecklist(12);
    assert.notEqual(c1Comp[0].label, c12Comp[0].label);
    assert.equal(computeChecklistCompletionPct([{ completed: true }, { completed: true }, { completed: false }, { completed: true }]), 75);
  });
});
