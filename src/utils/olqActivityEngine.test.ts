import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { StudentRecord } from '../types';
import { calculateLearnersScore } from './evidenceEngine';
import {
  buildIncidentEvidence,
  computeSectionCoverageMatrix,
  mapActivityParticipationToEvidence,
  validateObservationIncidentInput,
} from './olqActivityEngine';

describe('olqActivityEngine', () => {
  it('enforces 1-3 distinct OLQs and required context on incidents', () => {
    const emptyCtx = validateObservationIncidentInput({
      studentId: 's1',
      context: '',
      summary: 'Led lab prep',
      date: '2026-11-15',
      ratings: [{ olqKey: 'cooperation', score: 85 }],
    });
    assert.equal(emptyCtx.valid, false);

    const dupOlq = validateObservationIncidentInput({
      studentId: 's1',
      context: 'Practical / Lab',
      summary: 'Led lab prep',
      date: '2026-11-15',
      ratings: [
        { olqKey: 'cooperation', score: 85 },
        { olqKey: 'cooperation', score: 90 },
      ],
    });
    assert.equal(dupOlq.valid, false);

    const tooMany = validateObservationIncidentInput({
      studentId: 's1',
      context: 'Practical / Lab',
      summary: 'Led lab prep',
      date: '2026-11-15',
      ratings: [
        { olqKey: 'cooperation', score: 85 },
        { olqKey: 'initiative', score: 88 },
        { olqKey: 'organising_ability', score: 82 },
        { olqKey: 'determination', score: 84 },
      ],
    });
    assert.equal(tooMany.valid, false);

    const valid = validateObservationIncidentInput({
      studentId: 's1',
      context: 'Practical / Lab',
      summary: 'Led lab titration setup and guided peers safely',
      date: '2026-11-15',
      ratings: [
        { olqKey: 'organising_ability', score: 88 },
        { olqKey: 'cooperation', score: 86 },
        { olqKey: 'sense_of_responsibility', score: 90 },
      ],
    });
    assert.equal(valid.valid, true);

    const ev = buildIncidentEvidence({
      schoolId: 'school-vis-jjr',
      studentId: 's1',
      context: 'Practical / Lab',
      summary: 'Led lab titration setup',
      date: '2026-11-15',
      ratings: [
        { olqKey: 'organising_ability', score: 88 },
        { olqKey: 'cooperation', score: 86 },
      ],
      enteredBy: 'Praveen Kumar Kaushik',
    });
    assert.equal(ev.olqContributions.organising_ability, 88);
    assert.equal(ev.olqContributions.cooperation, 86);
    assert.equal(ev.observationContext, 'Practical / Lab');
    assert.match(ev.summary, /^\[Practical \/ Lab\]/);
  });

  it('never records 0 or fabricates scores when tookPart is false in Activity Register', () => {
    const absentEv = mapActivityParticipationToEvidence(
      {
        id: 'act-1',
        schoolId: 'school-vis-jjr',
        kind: 'house',
        title: 'Arjuna House Morning Assembly',
        date: '2026-11-15',
        recordedBy: 'Sunita Devi Ahlawat',
      },
      { studentId: 'stu-vis-602', tookPart: false },
    );
    assert.equal(absentEv, null);

    const presentEv = mapActivityParticipationToEvidence(
      {
        id: 'act-1',
        schoolId: 'school-vis-jjr',
        kind: 'house',
        title: 'Arjuna House Morning Assembly',
        date: '2026-11-15',
        recordedBy: 'Sunita Devi Ahlawat',
      },
      { studentId: 'stu-vis-601', tookPart: true, contributionLevel: 4, note: 'Anchored assembly cleanly' },
    );
    assert.ok(presentEv);
    assert.equal(presentEv.sourceKey, 'act:act-1:stu-vis-601');
    assert.equal(presentEv.olqContributions.sense_of_responsibility, 93);
    assert.equal(presentEv.componentContributions.participation, 93);
  });

  it('computes section evidence coverage matrix and sorts thin-evidence students alphabetically', () => {
    const students = [
      { id: 's-z', name: 'Zoya', classSection: '6-A' },
      { id: 's-a', name: 'Aadarsh', classSection: '6-A' },
    ] as StudentRecord[];

    const emptyBd = calculateLearnersScore([]);
    const richEv = buildIncidentEvidence({
      schoolId: 'school-vis-jjr',
      studentId: 's-z',
      context: 'Classroom',
      summary: 'Active class contributor',
      date: '2026-11-15',
      ratings: [
        { olqKey: 'cooperation', score: 85 },
        { olqKey: 'initiative', score: 84 },
      ],
      enteredBy: 'Teacher',
    });
    const matrix = computeSectionCoverageMatrix(students, {
      's-z': calculateLearnersScore([richEv]),
      's-a': emptyBd,
    });
    assert.equal(matrix.length, 1);
    assert.equal(matrix[0].classSection, '6-A');
    assert.equal(matrix[0].studentCount, 2);
    assert.equal(matrix[0].olqCoveredCounts.cooperation, 1);
    // Thin-evidence list should be alphabetical: Aadarsh before Zoya
    assert.deepEqual(
      matrix[0].thinEvidenceStudents.map((t) => t.name),
      ['Aadarsh', 'Zoya'],
    );
  });
});
