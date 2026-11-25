import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BAT_MAX,
  BAT_SUBS,
  BD_ITEMS,
  BF_ITEMS,
  IQ_BANK,
  MATRIX_DEFS,
  NORM_MIN,
  RIASEC_ITEMS,
  ROT_DEFS,
  SIM_ITEMS,
  VOC_ITEMS,
  FW_ITEMS,
  ageBand,
  bdScore,
  cronbach,
  dsExpected,
  exportPsychometricCsv,
  fullPersonalityAndRiasecPages,
  isChiral,
  itemAnalysis,
  personalitySequence,
  scoreBattery,
  scoreIQ,
  scorePersonality,
} from './psychometricEngine';
import type { PsychometricBatteryRecord } from '../types';

describe('Psychometric Assessment Suite Engine', () => {
  it('validates all 12 item banks, chiral spatial shapes, and easy->hard IRT ordering', () => {
    assert.equal(BF_ITEMS.length, 50);
    assert.equal(RIASEC_ITEMS.length, 36);
    assert.equal(personalitySequence().length, 52); // 50 IPIP + 2 Curran attention checks
    const pages = fullPersonalityAndRiasecPages();
    assert.equal(
      pages.reduce((sum, p) => sum + p.length, 0),
      88,
    );

    assert.equal(IQ_BANK.length, 40);
    assert.equal(MATRIX_DEFS.length, 10);
    assert.equal(ROT_DEFS.length, 8);
    for (const r of ROT_DEFS) {
      assert.equal(isChiral(r.cells), true, 'Every spatial rotation shape must be chiral');
    }
    for (let i = 1; i < IQ_BANK.length; i++) {
      assert.ok(IQ_BANK[i].b >= IQ_BANK[i - 1].b, 'IQ_BANK must be ordered easy to hard');
    }

    assert.equal(BAT_SUBS.length, 10);
    assert.equal(SIM_ITEMS.length, 14);
    assert.equal(VOC_ITEMS.length, 16);
    assert.equal(FW_ITEMS.length, 14);
    assert.equal(BD_ITEMS.length, 10);
    assert.equal(BAT_MAX.BD, 4 * 4 + 6 * 7);
  });

  it('scores 3PL IRT Reasoning Test monotonically with CI bounds and validity checks', () => {
    const perfectChoices = IQ_BANK.map((it) => it.a);
    const halfChoices = IQ_BANK.map((it, i) => (i < 20 ? it.a : (it.a + 1) % it.k));
    const wrongChoices = IQ_BANK.map((it) => (it.a + 1) % it.k);

    const sPerfect = scoreIQ(perfectChoices, Array(40).fill(15));
    const sHalf = scoreIQ(halfChoices, Array(40).fill(15));
    const sWrong = scoreIQ(wrongChoices, Array(40).fill(15));

    assert.equal(sPerfect.raw, 40);
    assert.equal(sHalf.raw, 20);
    assert.equal(sWrong.raw, 0);
    assert.ok(sPerfect.iq > sHalf.iq && sHalf.iq > sWrong.iq);
    assert.ok(sHalf.iq >= 90 && sHalf.iq <= 115, `20/40 should map near 100, got ${sHalf.iq}`);
    assert.equal(sPerfect.validity.valid, true);
    assert.ok(sPerfect.ci > 0 && sPerfect.ci < 25);

    // Fast careless answering + low completion should trigger validity flags
    const rushed = scoreIQ(
      IQ_BANK.map((it, i) => (i < 15 ? it.a : -1)),
      Array(40).fill(1.2),
    );
    assert.equal(rushed.validity.valid, false);
    assert.ok(rushed.validity.flags.length >= 2);
  });

  it('scores IPIP-50 Big Five (reverse keyed) + RIASEC Holland Code + Curran attention checks', () => {
    // High conscientiousness & intellect, strong Investigative + Artistic + Social interests
    const bf = BF_ITEMS.map(([, trait, dir]) => {
      if (trait === 'C' || trait === 'O') return dir > 0 ? 5 : 1;
      return dir > 0 ? 3 : 3;
    });
    const ri = RIASEC_ITEMS.map(([, k]) => (k === 'I' ? 5 : k === 'A' ? 4 : k === 'S' ? 4 : 2));
    const res = scorePersonality(bf, [1, 1], ri, Array(10).fill(35));

    assert.equal(res.traits.C.pomp, 100);
    assert.equal(res.traits.O.pomp, 100);
    assert.equal(res.traits.E.pomp, 50);
    assert.equal(res.code, 'IAS');
    assert.equal(res.validity.valid, true);

    // Missed attention check + straight-lining triggers invalid flag
    const straight = scorePersonality(Array(50).fill(4), [4, 4], Array(36).fill(4), Array(10).fill(5));
    assert.equal(straight.validity.valid, false);
    assert.equal(straight.validity.acFail, 2);
    assert.ok((straight.validity.longest ?? 0) >= 86);
  });

  it('scores Wechsler-style Cognitive Battery (FSIQ, GAI, CPI, 5 indices) and switches to local norms at n >= 30', () => {
    assert.equal(bdScore(BD_ITEMS[0], 5), 3); // 2x2 fast
    assert.equal(bdScore(BD_ITEMS[0], 0), 4); // 2x2 max bonus
    assert.equal(bdScore(BD_ITEMS[0], 65), 0); // timed out
    assert.equal(dsExpected('F', [3, 8, 6]), '386');
    assert.equal(dsExpected('B', [3, 8, 6]), '683');
    assert.equal(dsExpected('S', [7, 2, 5]), '257');
    assert.equal(ageBand(14), '13–14');

    const baseRec: Pick<PsychometricBatteryRecord, 'p' | 'raw'> = {
      p: { name: 'Aarav', age: 14, band: '13–14', cls: 'Class 9', gender: 'Male' },
      raw: { SI: 22, VC: 12, BD: 38, SR: 6, MR: 8, FW: 10, DS: 28, SP: 10, CD: 55, SS: 36 },
    };

    const prov = scoreBattery(baseRec, []);
    assert.equal(prov.local, false);
    assert.ok(prov.FSIQ.score >= 100 && prov.FSIQ.score <= 150);
    assert.ok(prov.GAI.score >= 100 && prov.CPI.score >= 100);
    assert.equal(Object.keys(prov.idx).length, 5);
    assert.equal(Object.keys(prov.ss).length, 10);

    // Build a local norm pool of NORM_MIN (30) valid batteries in age band 13-14
    const pool: PsychometricBatteryRecord[] = Array.from({ length: NORM_MIN }, (_, i) => ({
      id: `bt-norm-${i}`,
      schoolId: 'school-vis-jjr',
      ts: Date.now() - i * 1000,
      type: 'battery',
      p: { name: `Stu ${i}`, age: 14, band: '13–14', cls: 'Class 9', gender: 'Prefer not to say' },
      raw: {
        SI: 16 + (i % 7),
        VC: 8 + (i % 5),
        BD: 28 + (i % 12),
        SR: 3 + (i % 4),
        MR: 5 + (i % 4),
        FW: 6 + (i % 5),
        DS: 22 + (i % 8),
        SP: 7 + (i % 5),
        CD: 42 + (i % 15),
        SS: 26 + (i % 12),
      },
      res: {} as PsychometricBatteryRecord['res'],
      durationSec: 2600,
      validity: { flags: [], valid: true },
      snapshot: { FSIQ: 100, GAI: 100, CPI: 100, VCI: 100, VSI: 100, FRI: 100, WMI: 100, PSI: 100, local: false },
      version: '1.0',
    }));

    const localScored = scoreBattery(baseRec, pool);
    assert.equal(localScored.local, true);
    assert.equal(localScored.normN, NORM_MIN);
  });

  it('computes Cronbach alpha, item analysis, and CSV export cleanly', () => {
    const matrix = [
      [1, 1, 1, 1],
      [1, 1, 1, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const alpha = cronbach(matrix);
    assert.ok(alpha != null && alpha > 0.7);
    const ia = itemAnalysis(matrix);
    assert.equal(ia.length, 4);
    assert.ok(ia[0].p === 0.8 && ia[3].p === 0.2);

    const csv = exportPsychometricCsv([]);
    assert.ok(csv.includes('FSIQ') && csv.includes('holland_code') && csv.includes('bat_raw_BD'));
  });
});
