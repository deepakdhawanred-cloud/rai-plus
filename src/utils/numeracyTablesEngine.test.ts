import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateNumeracyTablesAttempt,
  generateJumbledTableQuestions,
  getNumeracyTierConfig,
} from './numeracyTablesEngine.ts';

describe('numeracyTablesEngine', () => {
  it('calibrates multiplication table difficulty ranges according to class section', () => {
    const c2 = getNumeracyTierConfig('2-A');
    assert.equal(c2.minTable, 2);
    assert.equal(c2.maxTable, 5);

    const c7 = getNumeracyTierConfig('7-A');
    assert.equal(c7.minTable, 6);
    assert.equal(c7.maxTable, 16);

    const c10 = getNumeracyTierConfig('10-A');
    assert.equal(c10.minTable, 11);
    assert.equal(c10.maxTable, 20);
  });

  it('generates anti-sequential jumbled questions without adjacent identical tables', () => {
    const qs = generateJumbledTableQuestions({
      minTable: 6,
      maxTable: 16,
      minMultiplier: 2,
      maxMultiplier: 12,
      count: 20,
      questionMode: 'standard',
      seed: 42,
    });
    assert.equal(qs.length, 20);

    const pairKeys = new Set(qs.map((q) => `${q.tableBase}x${q.multiplier}`));
    assert.equal(pairKeys.size, 20);

    for (let i = 1; i < qs.length; i++) {
      assert.notEqual(qs[i].tableBase, qs[i - 1].tableBase);
      assert.equal(qs[i].expectedAnswer, qs[i].tableBase * qs[i].multiplier);
    }
  });

  it('evaluates time-bound speed, accuracy, tablesFluencyPct, and weak tables', () => {
    const qs = generateJumbledTableQuestions({
      minTable: 12,
      maxTable: 15,
      minMultiplier: 2,
      maxMultiplier: 9,
      count: 8,
      seed: 7,
    });

    // Make one specific table wrong intentionally so weakTables detects it
    const badTable = qs[0].tableBase;
    const responses = qs.map((q) => ({
      questionIndex: q.index,
      userAnswer: q.tableBase === badTable ? q.expectedAnswer + 1 : q.expectedAnswer,
      responseTimeMs: q.tableBase === badTable ? 6000 : 1800,
    }));

    const result = evaluateNumeracyTablesAttempt({
      questions: qs,
      responses,
      timeLimitSeconds: 60,
      elapsedSeconds: 24,
      targetPaceMs: 3000,
    });

    assert.equal(result.totalQuestions, 8);
    assert.equal(result.attemptedCount, 8);
    assert.ok(result.correctCount < 8);
    assert.ok(result.accuracyPct < 100);
    assert.ok(result.speedScorePct > 70);
    assert.ok(result.tablesFluencyPct > 0);
    assert.ok(result.weakTables.includes(badTable));
    assert.ok(result.conceptualGap?.includes(`${badTable}×`));
  });
});
