import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ABACUS_LEVELS,
  analyzeAbacusSessionCoach,
  clickEarthBead,
  createEmptySoroban,
  decodeSorobanValue,
  encodeNumberToSoroban,
  generateAbacusStepByStepMoves,
  toggleHeavenBead,
} from './abacusEngine.ts';

describe('Soroban Abacus & Mental Mathematics Engine', () => {
  it('encodes and decodes whole numbers accurately from 0 to 99,999', () => {
    const samples = [0, 5, 9, 47, 308, 1954, 48291, 99999];
    for (const val of samples) {
      const cols = encodeNumberToSoroban(val, 0);
      assert.equal(decodeSorobanValue(cols, 0), val, `Expected exact Soroban value for ${val}`);
    }
  });

  it('encodes and decodes decimals (.1 and .01) with zero floating-point drift', () => {
    const samples1 = [0.4, 2.7, 15.8, 94.5];
    for (const val of samples1) {
      const cols = encodeNumberToSoroban(val, 1);
      assert.equal(decodeSorobanValue(cols, 1), val);
    }

    const samples2 = [0.09, 3.45, 27.86, 104.55];
    for (const val of samples2) {
      const cols = encodeNumberToSoroban(val, 2);
      assert.equal(decodeSorobanValue(cols, 2), val);
    }
  });

  it('toggles Heaven (5) and Earth (1..4) beads accurately on Units and Tens rods', () => {
    let cols = createEmptySoroban(0);
    const unitsIdx = cols.findIndex((c) => c.shortLabel === 'U');
    const tensIdx = cols.findIndex((c) => c.shortLabel === 'T');

    // Push Heaven bead (5) + 3 Earth beads on Units => 8
    cols = toggleHeavenBead(cols, unitsIdx);
    cols = clickEarthBead(cols, unitsIdx, 2); // indices 0,1,2 active => 3
    assert.equal(decodeSorobanValue(cols, 0), 8);

    // Push 2 Earth beads on Tens => 28
    cols = clickEarthBead(cols, tensIdx, 1);
    assert.equal(decodeSorobanValue(cols, 0), 28);

    // Click Earth bead 1 on Units (already active) => drops count to 1 => 26
    cols = clickEarthBead(cols, unitsIdx, 1);
    assert.equal(decodeSorobanValue(cols, 0), 26);
  });

  it('provides 12 progressive curriculum levels and step-by-step complement rules', () => {
    assert.equal(ABACUS_LEVELS.length, 12);
    const smallFriendSteps = generateAbacusStepByStepMoves(3, 4, 'add', 0);
    assert.ok(smallFriendSteps.some((s) => s.ruleUsed.includes('Small Friend')));

    const bigFriendSteps = generateAbacusStepByStepMoves(7, 6, 'add', 0);
    assert.ok(bigFriendSteps.some((s) => s.ruleUsed.includes('Big Friend')));
  });

  it('detects Heaven bead and place-value error patterns in AI Abacus Coach', () => {
    const coach = analyzeAbacusSessionCoach({
      level: 4,
      operation: 'add',
      accuracyPct: 60,
      avgResponseSec: 9.2,
      mistakes: [
        { expected: 12, actual: 7, prompt: '5 + 7' }, // off by 5 => heaven bead slip
        { expected: 34, actual: 24, prompt: '19 + 15' }, // off by 10 => carry/borrow alignment
      ],
    });
    assert.ok(coach.mistakePatterns.some((p) => p.includes('Heaven bead')));
    assert.ok(coach.mistakePatterns.some((p) => p.includes('carry or borrow')));
    assert.equal(coach.recommendedNextLevel, 4);

    const advanceCoach = analyzeAbacusSessionCoach({
      level: 4,
      operation: 'add',
      accuracyPct: 100,
      avgResponseSec: 6.1,
      mistakes: [],
    });
    assert.equal(advanceCoach.recommendedNextLevel, 5);
  });
});
