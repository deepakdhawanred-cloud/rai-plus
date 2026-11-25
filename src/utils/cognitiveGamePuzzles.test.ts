import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildChessPuzzleBank,
  buildFactorGridChallenge,
  buildLogicEscapeStages,
  buildNumberDetectiveStages,
  buildStorySequenceSteps,
  buildSudokuPuzzle,
  buildTimesSprintBank,
  buildWordRecallBank,
  hasSudokuCellConflict,
  type DifficultyLevel,
} from './cognitiveGamePuzzles';

test('Sudoku generator scales 4x4 -> 6x6 -> 9x9 with zero row/col/box duplicates in solution', () => {
  for (const level of [1, 2, 3, 4, 5] as DifficultyLevel[]) {
    for (let variant = 0; variant < 2; variant++) {
      const cfg = buildSudokuPuzzle(level, variant);
      const expectedSize = level <= 2 ? 4 : level === 3 ? 6 : 9;
      assert.equal(cfg.size, expectedSize);
      assert.equal(cfg.solution.length, expectedSize);

      let clueCount = 0;
      for (let r = 0; r < cfg.size; r++) {
        for (let c = 0; c < cfg.size; c++) {
          if (cfg.fixedMask[r][c]) clueCount++;
          assert.equal(
            hasSudokuCellConflict(cfg.solution, r, c, cfg.boxRows, cfg.boxCols),
            false,
            `Duplicate detected in Sudoku L${level} v${variant} at (${r},${c})`,
          );
        }
      }
      if (level === 4) assert.equal(clueCount, 35);
      if (level === 5) assert.equal(clueCount, 26);
    }
  }
});

test('Logic Escape & Number Detective scale cleanly and every answer is a unique listed option', () => {
  for (const level of [1, 2, 3, 4, 5] as DifficultyLevel[]) {
    const logic = buildLogicEscapeStages(level);
    const num = buildNumberDetectiveStages(level);
    assert.ok(logic.length >= (level >= 4 ? 5 : 3));
    assert.ok(num.length >= (level >= 4 ? 5 : 4));

    for (const st of [...logic, ...num]) {
      assert.equal(new Set(st.options).size, st.options.length, `Duplicate options in: ${st.q}`);
      assert.ok(st.options.includes(st.ans), `Answer missing from options in: ${st.q}`);
    }
  }

  // Mathematical verification of Level 5 Logic Escape answers
  const l5Logic = buildLogicEscapeStages(5);
  assert.equal(l5Logic[4].ans, '53');
  const n = Number(l5Logic[4].ans);
  assert.equal(n % 5, 3);
  assert.equal(n % 7, 4);
  assert.equal(n % 3, 2);

  // Mathematical verification of Level 5 Number Detective answers
  const l5Num = buildNumberDetectiveStages(5);
  assert.equal(l5Num[0].ans, String(6 ** 3 - 6)); // 210
  assert.equal(l5Num[1].ans, '116'); // 2*55 + 6
  assert.equal(l5Num[2].ans, '47'); // 2*23 + 1
  assert.equal(l5Num[3].ans, String(8 * 9 - (8 + 9))); // 55
  assert.equal(l5Num[4].ans, String(11 * 13 + 5)); // 148
});

test('Chess Tactics provides forced 2-ply combinations at Levels 4 and 5 with valid start pieces', () => {
  for (const level of [1, 2, 3, 4, 5] as DifficultyLevel[]) {
    const bank = buildChessPuzzleBank(level);
    assert.ok(bank.length >= 2);
    for (const p of bank) {
      if (level >= 4) {
        assert.equal(p.steps.length, 2, `Expected 2-ply combination in ${p.id}`);
        assert.ok(p.steps[0].blackReply, `Missing forced black reply in ${p.id}`);
      }
      const firstFrom = p.pieces.find((pc) => pc.sq === p.steps[0].fromSq && pc.side === 'w');
      assert.ok(firstFrom, `Missing white piece at ${p.steps[0].fromSq} in ${p.id}`);
      if (p.steps[0].blackReply) {
        const blackFrom = p.pieces.find(
          (pc) => pc.sq === p.steps[0].blackReply!.fromSq && pc.side === 'b',
        );
        assert.ok(blackFrom, `Missing black reply piece in ${p.id}`);
      }
    }
  }
});

test('Word Recall, Story Sequence, Times Sprint & Factor Grid scale steeply to Level 5', () => {
  const l5Words = buildWordRecallBank(5);
  assert.equal(l5Words.targets.length, 12);
  assert.equal(l5Words.foils.length, 12);
  assert.equal(new Set([...l5Words.targets, ...l5Words.foils]).size, 24);

  assert.equal(buildStorySequenceSteps(5).length, 8);

  const l5Sprint = buildTimesSprintBank(5);
  assert.equal(l5Sprint.length, 12);
  for (const q of l5Sprint) {
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
  }

  const l5Grid = buildFactorGridChallenge(5);
  assert.equal(l5Grid.cols, 5);
  assert.equal(l5Grid.cells.length, 25);
  const matches = l5Grid.cells.filter((n) => l5Grid.isMatch(n));
  assert.equal(matches.length, 8);
});
