import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialDatabase, type DatabaseState } from './seedData.ts';
import {
  THINKING_MIGRATION_MANIFEST,
  THINKING_OLQ_MAPPING_MATRIX,
  classifyWatPatterns,
  classifyWatSentenceConstruction,
  computeTatTraits,
  getThinkingMigrationStatus,
  runThinkingAssessmentMigrations,
  syncSessionToThinkingCollections,
} from './thinkingMigrations.ts';
import { OLQ_DEFINITIONS } from '../src/utils/evidenceEngine.ts';
import {
  aggregateThinkingSession,
  evaluateSingleThinkingResponse,
} from '../src/utils/thinkingAssessmentEngine.ts';

const VALID_OLQ_KEYS = new Set(OLQ_DEFINITIONS.map((d) => d.key));
const OLQ_GROUP_BY_KEY = new Map(OLQ_DEFINITIONS.map((d) => [d.key, d.group]));

describe('Student Thinking Assessment Database Migrations & Express Collections', () => {
  it('migrates a legacy DatabaseState missing normalized collections cleanly (001 -> 004)', () => {
    const db = createInitialDatabase();

    // Simulate a legacy pre-migration JSON snapshot without the new collections
    const legacyDb = {
      ...db,
      srtRecords: undefined,
      watRecords: undefined,
      tatRecords: undefined,
      ppdtRecords: undefined,
      thinkingOlqMappings: undefined,
      databaseMigrations: undefined,
    } as unknown as DatabaseState;

    const report = runThinkingAssessmentMigrations(legacyDb);

    assert.equal(report.mutated, true);
    assert.deepEqual(
      report.appliedVersions,
      THINKING_MIGRATION_MANIFEST.map((m) => m.version),
    );
    assert.equal(report.alreadyAppliedVersions.length, 0);
    assert.equal(report.integrityWarnings.length, 0);

    // Verify all 4 normalized collections and OLQ mapping ledger were backfilled
    assert.ok(legacyDb.srtRecords.length > 0, 'Expected SRT records backfilled');
    assert.ok(legacyDb.watRecords.length > 0, 'Expected WAT records backfilled');
    assert.ok(legacyDb.tatRecords.length > 0, 'Expected TAT records backfilled');
    assert.ok(legacyDb.ppdtRecords.length > 0, 'Expected PPDT records backfilled');
    assert.ok(legacyDb.thinkingOlqMappings.length > 0, 'Expected OLQ mappings backfilled');

    const totalBackfilledResponses =
      legacyDb.srtRecords.length +
      legacyDb.watRecords.length +
      legacyDb.tatRecords.length +
      legacyDb.ppdtRecords.length;
    const totalSessionResponses = legacyDb.thinkingAssessments.reduce(
      (sum, s) => sum + s.responses.length,
      0,
    );
    assert.equal(totalBackfilledResponses, totalSessionResponses);

    const status = getThinkingMigrationStatus(legacyDb);
    assert.equal(status.upToDate, true);
    assert.equal(status.pendingMigrations.length, 0);
    assert.equal(status.currentVersion, '2026_11_19_004');
  });

  it('is strictly idempotent on repeated execution with zero duplicate records', () => {
    const db = createInitialDatabase();
    const beforeCounts = {
      srt: db.srtRecords.length,
      wat: db.watRecords.length,
      tat: db.tatRecords.length,
      ppdt: db.ppdtRecords.length,
      olq: db.thinkingOlqMappings.length,
      migs: db.databaseMigrations.length,
    };

    const secondRun = runThinkingAssessmentMigrations(db);
    assert.equal(secondRun.mutated, false);
    assert.equal(secondRun.appliedVersions.length, 0);
    assert.deepEqual(
      secondRun.alreadyAppliedVersions,
      THINKING_MIGRATION_MANIFEST.map((m) => m.version),
    );

    assert.equal(db.srtRecords.length, beforeCounts.srt);
    assert.equal(db.watRecords.length, beforeCounts.wat);
    assert.equal(db.tatRecords.length, beforeCounts.tat);
    assert.equal(db.ppdtRecords.length, beforeCounts.ppdt);
    assert.equal(db.thinkingOlqMappings.length, beforeCounts.olq);
    assert.equal(db.databaseMigrations.length, beforeCounts.migs);

    // Ensure unique deterministic IDs across every collection
    const uniqueSrtIds = new Set(db.srtRecords.map((r) => r.id));
    const uniqueMappingIds = new Set(db.thinkingOlqMappings.map((m) => m.id));
    assert.equal(uniqueSrtIds.size, db.srtRecords.length);
    assert.equal(uniqueMappingIds.size, db.thinkingOlqMappings.length);
  });

  it('maps every SRT, WAT, TAT, and PPDT rule to canonical OLQ_DEFINITIONS and 4 OlqGroups', () => {
    const db = createInitialDatabase();

    // Every rule in the mapping matrix must reference an existing OLQ key & matching OlqGroup
    for (const rule of THINKING_OLQ_MAPPING_MATRIX) {
      assert.ok(VALID_OLQ_KEYS.has(rule.olqKey), `Invalid OLQ key in matrix: ${rule.olqKey}`);
      assert.equal(
        rule.olqGroup,
        OLQ_GROUP_BY_KEY.get(rule.olqKey),
        `Mismatched OlqGroup for ${rule.olqKey}`,
      );
      assert.ok(rule.weight > 0 && rule.weight <= 1);
    }

    // Weight sums per test format should normalize to 1.00
    for (const fmt of ['SRT', 'WAT', 'TAT', 'PPDT'] as const) {
      const sum = THINKING_OLQ_MAPPING_MATRIX.filter((r) => r.testType === fmt).reduce(
        (acc, r) => acc + r.weight,
        0,
      );
      assert.ok(Math.abs(sum - 1) < 0.001, `Expected weight sum 1.0 for ${fmt}, got ${sum}`);
    }

    // Every persisted ThinkingOlqMappingRecord must use canonical evidenceSourceKey and valid OLQ
    for (const m of db.thinkingOlqMappings) {
      assert.ok(VALID_OLQ_KEYS.has(m.olqKey));
      assert.equal(m.olqGroup, OLQ_GROUP_BY_KEY.get(m.olqKey));
      assert.equal(m.evidenceSourceKey, `thinking:${m.schoolId}:${m.studentId}:corroborated`);
      assert.ok(m.rawSignalScore >= 0 && m.rawSignalScore <= 100);
    }
  });

  it('normalizes SRT (10 sub-dimensions), WAT (syntax/patterns), TAT (arc+6 traits), and PPDT (perception+GD)', () => {
    const db = createInitialDatabase();
    const schoolId = 'school-vis-jjr';
    const student = db.students.find((s) => s.schoolId === schoolId)!;
    const config = db.thinkingScoringConfigs[schoolId];
    const qMap = new Map(
      db.thinkingQuestionBank.filter((q) => q.schoolId === schoolId).map((q) => [q.id, q]),
    );
    const nowIso = '2026-11-19T12:00:00.000Z';

    // 1. WAT sentence construction & pattern classifier
    assert.deepEqual(classifyWatSentenceConstruction('Focus'), {
      wordCount: 1,
      sentenceConstruction: 'one_word',
    });
    assert.deepEqual(classifyWatSentenceConstruction('Helps every teammate'), {
      wordCount: 3,
      sentenceConstruction: 'fragment',
    });
    assert.deepEqual(
      classifyWatSentenceConstruction('Consistent daily preparation builds quiet confidence in teams.'),
      { wordCount: 8, sentenceConstruction: 'coherent_complete' },
    );

    // 2. SRT record with 10 sub-dimensions
    const srtQ = db.thinkingQuestionBank.find((q) => q.schoolId === schoolId && q.testType === 'SRT')!;
    const srtEntry = evaluateSingleThinkingResponse({
      question: srtQ,
      responseText:
        'I would calmly inform the lab teacher, divide the experiment steps with my teammate, and ensure everyone submits safely on time.',
      responseTimeMs: 14500,
      config,
    });
    const srtSession = aggregateThinkingSession({
      id: 'sess-unit-srt-1',
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      testType: 'SRT',
      workflowMode: 'Individual',
      timedMode: true,
      timeLimitSec: 45,
      startedAt: nowIso,
      submittedAt: nowIso,
      responses: [srtEntry],
      questionsById: qMap,
    });
    db.thinkingAssessments.unshift(srtSession);
    syncSessionToThinkingCollections(db, srtSession);

    const srtRec = db.srtRecords.find((r) => r.sessionId === 'sess-unit-srt-1');
    assert.ok(srtRec);
    assert.equal(srtRec.testType, 'SRT');
    assert.equal(Object.keys(srtRec.subDimensions).length, 10);
    assert.equal(srtRec.olqSignals.length, 6);

    // 3. TAT record with story structure, 6 traits, and monotonic historicalSequenceNo
    const tatQ = db.thinkingQuestionBank.find((q) => q.schoolId === schoolId && q.testType === 'TAT')!;
    const priorTatCount = db.tatRecords.filter(
      (r) => r.schoolId === schoolId && r.studentId === student.id,
    ).length;
    const tatEntry = evaluateSingleThinkingResponse({
      question: tatQ,
      responseText:
        'Riya notices her classmates struggling before the science exhibition. She organizes a clear checklist, assigns roles, and guides everyone to complete the working solar model.',
      responseTimeMs: 92000,
      config,
      tatStructure: {
        protagonist: 'Riya, Class 9 team lead',
        objective: 'Finish the solar model cleanly before judging',
        challenges: 'Missing wiring diagram and tight deadline',
        actions: 'Drafted checklist, sourced spare wire from lab, rehearsed pitch together',
        outcome: 'Team delivered a confident demonstration and learned collaborative planning',
      },
    });
    const tatSession = aggregateThinkingSession({
      id: 'sess-unit-tat-1',
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      testType: 'TAT',
      workflowMode: 'Individual',
      timedMode: true,
      timeLimitSec: 240,
      startedAt: nowIso,
      submittedAt: nowIso,
      responses: [tatEntry],
      questionsById: qMap,
    });
    db.thinkingAssessments.unshift(tatSession);
    syncSessionToThinkingCollections(db, tatSession);

    const tatRec = db.tatRecords.find((r) => r.sessionId === 'sess-unit-tat-1');
    assert.ok(tatRec);
    assert.equal(tatRec.historicalSequenceNo, priorTatCount + 1);
    const traits = computeTatTraits(tatSession.responses[0]);
    assert.equal(tatRec.traitEvaluation.planning, traits.planning);
    assert.equal(Object.keys(tatRec.traitEvaluation).length, 6);
    assert.equal(tatRec.olqSignals.length, 5);

    // 4. PPDT record with perception + group discussion rubric mapping into influence_group & cooperation
    const ppdtQ = db.thinkingQuestionBank.find((q) => q.schoolId === schoolId && q.testType === 'PPDT')!;
    const ppdtEntry = evaluateSingleThinkingResponse({
      question: ppdtQ,
      responseText:
        'Three students inspect a damaged rainwater pipe near the playground and coordinate with the school caretaker to divert water safely.',
      responseTimeMs: 65000,
      config,
      ppdtPerception: {
        charactersCount: 3,
        approximateAges: '14-15 yrs',
        mood: 'Positive',
        centralSituation: 'Playground rainwater drainage repair',
        narrationSummary: 'Calm, structured 60-second narration with clear team roles.',
      },
    });
    const ppdtSession = aggregateThinkingSession({
      id: 'sess-unit-ppdt-1',
      schoolId,
      studentId: student.id,
      studentName: student.name,
      classSection: student.classSection,
      testType: 'PPDT',
      workflowMode: 'Group',
      timedMode: true,
      timeLimitSec: 180,
      startedAt: nowIso,
      submittedAt: nowIso,
      responses: [ppdtEntry],
      questionsById: qMap,
      ppdtGroupEval: {
        groupId: 'gd-unit-1',
        groupTitle: 'Class 9 PPDT Group A',
        communication: 8,
        cooperation: 9,
        initiative: 8,
        listening: 9,
        leadership: 8,
        evaluatorName: 'Counsellor Sunita',
        evaluatorNotes: 'Summarized common story cleanly while encouraging quieter peers.',
        evaluatedAt: nowIso,
      },
    });
    db.thinkingAssessments.unshift(ppdtSession);
    syncSessionToThinkingCollections(db, ppdtSession);

    const ppdtRec = db.ppdtRecords.find((r) => r.sessionId === 'sess-unit-ppdt-1');
    assert.ok(ppdtRec);
    assert.equal(ppdtRec.workflowMode, 'Group');
    assert.equal(ppdtRec.perception.charactersCount, 3);
    assert.equal(ppdtRec.groupDiscussion?.cooperation, 9);
    const coopSig = ppdtRec.olqSignals.find((s) => s.olqKey === 'cooperation');
    assert.equal(coopSig?.derivedScore, 90);

    // 5. WAT pattern classification helper check
    const watRes = classifyWatPatterns({
      ...srtSession.responses[0],
      dimensionSnapshot: {
        fastThinking: 80,
        betterThinking: 48,
        positiveThinking: 42,
        selfCentredThinking: 64,
      },
      autoPatternFlags: ['Self-centred / competitive phrasing observed'],
    });
    assert.equal(watRes.primary, 'self_centred');
    assert.ok(watRes.tags.includes('self_centred'));
  });

  it('enforces multi-response corroboration guard in Migration 004 and repairs premature OLQ promotion', () => {
    const db = createInitialDatabase();
    const targetMapping = db.thinkingOlqMappings[0];
    assert.ok(targetMapping);

    // Inject a corrupted uncorroborated promotion record and roll back only Migration 004
    targetMapping.corroboratedResponseCount = 1;
    targetMapping.corroborationSatisfied = false;
    targetMapping.promotedToEvidence = true;
    targetMapping.reviewedBy = undefined;
    db.databaseMigrations = db.databaseMigrations.filter((m) => m.version !== '2026_11_19_004');

    const report = runThinkingAssessmentMigrations(db);
    assert.equal(report.mutated, true);
    assert.deepEqual(report.appliedVersions, ['2026_11_19_004']);
    assert.equal(targetMapping.promotedToEvidence, false);
    assert.ok(
      report.integrityWarnings.some((w) => w.includes('Repaired uncorroborated promotion flag')),
    );

    const mig4 = db.databaseMigrations.find((m) => m.version === '2026_11_19_004');
    assert.equal(mig4?.status, 'repaired');
    assert.equal(mig4?.recordsUpdated, 1);
  });
});
