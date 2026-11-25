import type { DatabaseState } from './seedData.ts';
import type {
  DatabaseMigrationEntry,
  OlqGroup,
  OlqKey,
  PpdtRecord,
  SrtRecord,
  TatRecord,
  TatTraitEvaluation,
  ThinkingAssessmentSession,
  ThinkingMigrationExecutionReport,
  ThinkingOlqMappingRecord,
  ThinkingOlqSignalWeight,
  ThinkingOlqWeightRule,
  ThinkingQuestionItem,
  ThinkingResponseEntry,
  ThinkingTestType,
  WatRecord,
  WatSentenceConstruction,
  WatUnderlyingPattern,
} from '../src/types';
import { OLQ_DEFINITIONS } from '../src/utils/evidenceEngine.ts';
import { createDefaultThinkingScoringConfig } from '../src/utils/thinkingAssessmentEngine.ts';

// ============================================================================
// CANONICAL OLQ FRAMEWORK MAPPING SPECIFICATION (SRT / WAT / TAT / PPDT -> 15 OLQs)
// ============================================================================

const OLQ_BY_KEY = new Map(OLQ_DEFINITIONS.map((def) => [def.key, def]));

function olqMeta(key: OlqKey): { olqName: string; olqGroup: OlqGroup } {
  const def = OLQ_BY_KEY.get(key);
  return {
    olqName: def?.name ?? key,
    olqGroup: def?.group ?? 'Planning and Organising',
  };
}

export const THINKING_OLQ_MAPPING_MATRIX: ThinkingOlqWeightRule[] = [
  // SRT -> Planning, Social Adjustment, Social Effectiveness & Dynamic Qualities
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'effective_intelligence',
    ...olqMeta('effective_intelligence'),
    weight: 0.22,
    derivationRule: 'Weighted blend of SRT practicalThinking (60%) and problemSolving (40%).',
  },
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'reasoning_ability',
    ...olqMeta('reasoning_ability'),
    weight: 0.18,
    derivationRule: 'Derived from SRT problemSolving (55%) and decisionMaking (45%).',
  },
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'speed_of_decision',
    ...olqMeta('speed_of_decision'),
    weight: 0.16,
    derivationRule:
      'Decision quality gated by response speed: decisionMaking (65%) + speedOfResponse (35%) — speed alone never inflates OLQ.',
  },
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'sense_of_responsibility',
    ...olqMeta('sense_of_responsibility'),
    weight: 0.16,
    derivationRule: 'Derived from SRT responsibility (65%) and selfAwareness (35%).',
  },
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'initiative',
    ...olqMeta('initiative'),
    weight: 0.14,
    derivationRule: 'Derived from SRT initiative (70%) and positiveAttitude (30%).',
  },
  {
    testType: 'SRT',
    sourceCollection: 'srtRecords',
    olqKey: 'cooperation',
    ...olqMeta('cooperation'),
    weight: 0.14,
    derivationRule: 'Derived from SRT teamOrientation (70%) and emotionalMaturity (30%).',
  },

  // WAT -> Spontaneous framing, expression, liveliness & social adaptability
  {
    testType: 'WAT',
    sourceCollection: 'watRecords',
    olqKey: 'power_of_expression',
    ...olqMeta('power_of_expression'),
    weight: 0.28,
    derivationRule:
      'Derived from sentenceConstruction completeness and Better Thinking clarity score.',
  },
  {
    testType: 'WAT',
    sourceCollection: 'watRecords',
    olqKey: 'liveliness',
    ...olqMeta('liveliness'),
    weight: 0.26,
    derivationRule: 'Derived from WAT positiveThinking score and constructive/positive framing.',
  },
  {
    testType: 'WAT',
    sourceCollection: 'watRecords',
    olqKey: 'social_adaptability',
    ...olqMeta('social_adaptability'),
    weight: 0.24,
    derivationRule: 'Derived from inverse selfCentredThinking (team/responsible word patterns).',
  },
  {
    testType: 'WAT',
    sourceCollection: 'watRecords',
    olqKey: 'self_confidence',
    ...olqMeta('self_confidence'),
    weight: 0.22,
    derivationRule: 'Derived from balanced positiveThinking (55%) and betterThinking (45%).',
  },

  // TAT -> Planning, Organising, Determination, Initiative, Empathy & Responsibility
  {
    testType: 'TAT',
    sourceCollection: 'tatRecords',
    olqKey: 'organising_ability',
    ...olqMeta('organising_ability'),
    weight: 0.22,
    derivationRule: 'Derived from TAT planning score and structured protagonist->actions->outcome arc.',
  },
  {
    testType: 'TAT',
    sourceCollection: 'tatRecords',
    olqKey: 'initiative',
    ...olqMeta('initiative'),
    weight: 0.20,
    derivationRule: 'Derived from TAT initiative score (proactive protagonist action steps).',
  },
  {
    testType: 'TAT',
    sourceCollection: 'tatRecords',
    olqKey: 'determination',
    ...olqMeta('determination'),
    weight: 0.20,
    derivationRule: 'Derived from TAT problemSolving (55%) and confidence (45%) facing challenges.',
  },
  {
    testType: 'TAT',
    sourceCollection: 'tatRecords',
    olqKey: 'sense_of_responsibility',
    ...olqMeta('sense_of_responsibility'),
    weight: 0.20,
    derivationRule: 'Derived from TAT responsibility (65%) and empathy (35%).',
  },
  {
    testType: 'TAT',
    sourceCollection: 'tatRecords',
    olqKey: 'courage',
    ...olqMeta('courage'),
    weight: 0.18,
    derivationRule: 'Derived from TAT confidence (60%) and constructive challenge resolution (40%).',
  },

  // PPDT -> Individual perception + Group Discussion leadership/communication/cooperation
  {
    testType: 'PPDT',
    sourceCollection: 'ppdtRecords',
    olqKey: 'power_of_expression',
    ...olqMeta('power_of_expression'),
    weight: 0.22,
    derivationRule: 'Derived from PPDT narration quality and GD communication rubric (1-10 scaled).',
  },
  {
    testType: 'PPDT',
    sourceCollection: 'ppdtRecords',
    olqKey: 'cooperation',
    ...olqMeta('cooperation'),
    weight: 0.22,
    derivationRule: 'Derived from GD cooperation (60%) and listening (40%), or inverse self-centred score.',
  },
  {
    testType: 'PPDT',
    sourceCollection: 'ppdtRecords',
    olqKey: 'influence_group',
    ...olqMeta('influence_group'),
    weight: 0.20,
    derivationRule: 'Derived from GD leadership (65%) and communication (35%).',
  },
  {
    testType: 'PPDT',
    sourceCollection: 'ppdtRecords',
    olqKey: 'initiative',
    ...olqMeta('initiative'),
    weight: 0.18,
    derivationRule: 'Derived from GD initiative rubric (or story betterThinking in individual mode).',
  },
  {
    testType: 'PPDT',
    sourceCollection: 'ppdtRecords',
    olqKey: 'effective_intelligence',
    ...olqMeta('effective_intelligence'),
    weight: 0.18,
    derivationRule: 'Derived from structured scene perception accuracy and realistic story outcome.',
  },
];

// ============================================================================
// VERSIONED MIGRATION PLAN MANIFEST (ORDERED, IDEMPOTENT)
// ============================================================================

export const THINKING_MIGRATION_MANIFEST: Array<{
  version: string;
  name: string;
  description: string;
}> = [
  {
    version: '2026_11_19_001',
    name: 'init_thinking_collections',
    description:
      'Initialize normalized Express collections (srtRecords, watRecords, tatRecords, ppdtRecords, thinkingOlqMappings, databaseMigrations) without altering existing ERP or OLQ data.',
  },
  {
    version: '2026_11_19_002',
    name: 'backfill_format_records_from_sessions',
    description:
      'Normalize and backfill existing unified thinkingAssessments sessions into strongly-typed SRT, WAT, TAT, and PPDT Express collections with deterministic IDs.',
  },
  {
    version: '2026_11_19_003',
    name: 'build_olq_framework_mapping_ledger',
    description:
      'Build the Thinking-to-15-OLQ relational mapping ledger linking SRT/WAT/TAT/PPDT records to existing OLQ_DEFINITIONS and DevelopmentEvidence.sourceKey.',
  },
  {
    version: '2026_11_19_004',
    name: 'verify_tenant_and_corroboration_integrity',
    description:
      'Audit tenant isolation (schoolId), student referential integrity, non-negative latency, and multi-response OLQ corroboration guard compliance.',
  },
];

// ============================================================================
// DETERMINISTIC NORMALIZATION HELPERS (SESSION -> SRT / WAT / TAT / PPDT)
// ============================================================================

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function classifyWatSentenceConstruction(text: string): {
  wordCount: number;
  sentenceConstruction: WatSentenceConstruction;
} {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount <= 1) return { wordCount, sentenceConstruction: 'one_word' };
  if (wordCount < 4) return { wordCount, sentenceConstruction: 'fragment' };
  return { wordCount, sentenceConstruction: 'coherent_complete' };
}

export function classifyWatPatterns(
  entry: ThinkingResponseEntry,
): { primary: WatUnderlyingPattern; tags: WatUnderlyingPattern[] } {
  const tags: WatUnderlyingPattern[] = [];
  const d = entry.dimensionSnapshot;
  if (d.selfCentredThinking >= 45 || entry.autoPatternFlags.some((f) => /self-centred/i.test(f))) {
    tags.push('self_centred');
  }
  if (entry.autoPatternFlags.some((f) => /avoidance/i.test(f))) {
    tags.push('avoidant');
  }
  if (d.positiveThinking >= 62) tags.push('positive');
  if (d.betterThinking >= 62) tags.push('practical');
  if (entry.autoPatternFlags.some((f) => /team|responsible|cooperative/i.test(f))) {
    tags.push('responsible');
  }
  if (d.betterThinking >= 55 && d.positiveThinking >= 55 && d.selfCentredThinking < 35) {
    tags.push('constructive');
  }
  if (tags.length === 0) tags.push('neutral');

  const primary: WatUnderlyingPattern = tags.includes('self_centred')
    ? 'self_centred'
    : tags.includes('avoidant')
      ? 'avoidant'
      : tags.includes('constructive')
        ? 'constructive'
        : tags[0];

  return { primary, tags: Array.from(new Set(tags)) };
}

export function computeTatTraits(entry: ThinkingResponseEntry): TatTraitEvaluation {
  const d = entry.dimensionSnapshot;
  const s = entry.tatStructure;
  const hasObjective = Boolean(s?.objective && s.objective.trim().length >= 5);
  const hasActions = Boolean(s?.actions && s.actions.trim().length >= 8);
  const hasOutcome = Boolean(s?.outcome && s.outcome.trim().length >= 5);
  const hasChallenges = Boolean(s?.challenges && s.challenges.trim().length >= 5);
  const coopSignal = 100 - d.selfCentredThinking;

  return {
    initiative: clamp(d.betterThinking * 0.65 + (hasActions ? 25 : 10) + d.positiveThinking * 0.1),
    planning: clamp(
      d.betterThinking * 0.55 + (hasObjective ? 15 : 5) + (hasActions ? 15 : 5) + (hasOutcome ? 15 : 5),
    ),
    confidence: clamp(d.positiveThinking * 0.55 + d.betterThinking * 0.35 + (hasOutcome ? 10 : 0)),
    responsibility: clamp(coopSignal * 0.5 + d.betterThinking * 0.5),
    empathy: clamp(coopSignal * 0.6 + d.positiveThinking * 0.4),
    problemSolving: clamp(d.betterThinking * 0.7 + (hasChallenges && hasActions ? 22 : 8)),
  };
}

function deriveOlqSignalsForRecord(params: {
  testType: ThinkingTestType;
  entry: ThinkingResponseEntry;
  tatTraits?: TatTraitEvaluation;
  ppdtGroupEval?: PpdtRecord['groupDiscussion'];
}): ThinkingOlqSignalWeight[] {
  const { testType, entry, tatTraits, ppdtGroupEval } = params;
  const d = entry.dimensionSnapshot;
  const rules = THINKING_OLQ_MAPPING_MATRIX.filter((r) => r.testType === testType);

  return rules.map((rule) => {
    let derivedScore = d.betterThinking;

    if (testType === 'SRT' && entry.srtSubScores) {
      const sub = entry.srtSubScores;
      switch (rule.olqKey) {
        case 'effective_intelligence':
          derivedScore = sub.practicalThinking * 0.6 + sub.problemSolving * 0.4;
          break;
        case 'reasoning_ability':
          derivedScore = sub.problemSolving * 0.55 + sub.decisionMaking * 0.45;
          break;
        case 'speed_of_decision':
          derivedScore = sub.decisionMaking * 0.65 + sub.speedOfResponse * 0.35;
          break;
        case 'sense_of_responsibility':
          derivedScore = sub.responsibility * 0.65 + sub.selfAwareness * 0.35;
          break;
        case 'initiative':
          derivedScore = sub.initiative * 0.7 + sub.positiveAttitude * 0.3;
          break;
        case 'cooperation':
          derivedScore = sub.teamOrientation * 0.7 + sub.emotionalMaturity * 0.3;
          break;
        default:
          derivedScore = d.betterThinking;
      }
    } else if (testType === 'WAT') {
      const { sentenceConstruction } = classifyWatSentenceConstruction(entry.responseText);
      const structureBonus =
        sentenceConstruction === 'coherent_complete'
          ? 12
          : sentenceConstruction === 'fragment'
            ? 0
            : -10;
      switch (rule.olqKey) {
        case 'power_of_expression':
          derivedScore = d.betterThinking + structureBonus;
          break;
        case 'liveliness':
          derivedScore = d.positiveThinking;
          break;
        case 'social_adaptability':
          derivedScore = 100 - d.selfCentredThinking;
          break;
        case 'self_confidence':
          derivedScore = d.positiveThinking * 0.55 + d.betterThinking * 0.45;
          break;
        default:
          derivedScore = d.betterThinking;
      }
    } else if (testType === 'TAT' && tatTraits) {
      switch (rule.olqKey) {
        case 'organising_ability':
          derivedScore = tatTraits.planning;
          break;
        case 'initiative':
          derivedScore = tatTraits.initiative;
          break;
        case 'determination':
          derivedScore = tatTraits.problemSolving * 0.55 + tatTraits.confidence * 0.45;
          break;
        case 'sense_of_responsibility':
          derivedScore = tatTraits.responsibility * 0.65 + tatTraits.empathy * 0.35;
          break;
        case 'courage':
          derivedScore = tatTraits.confidence * 0.6 + tatTraits.problemSolving * 0.4;
          break;
        default:
          derivedScore = d.betterThinking;
      }
    } else if (testType === 'PPDT') {
      const gd = ppdtGroupEval;
      switch (rule.olqKey) {
        case 'power_of_expression':
          derivedScore = gd ? gd.communication * 10 : d.betterThinking;
          break;
        case 'cooperation':
          derivedScore = gd ? (gd.cooperation * 0.6 + gd.listening * 0.4) * 10 : 100 - d.selfCentredThinking;
          break;
        case 'influence_group':
          derivedScore = gd ? (gd.leadership * 0.65 + gd.communication * 0.35) * 10 : d.betterThinking;
          break;
        case 'initiative':
          derivedScore = gd ? gd.initiative * 10 : d.betterThinking;
          break;
        case 'effective_intelligence':
          derivedScore = d.betterThinking * 0.7 + d.positiveThinking * 0.3;
          break;
        default:
          derivedScore = d.betterThinking;
      }
    }

    return {
      olqKey: rule.olqKey,
      olqName: rule.olqName,
      olqGroup: rule.olqGroup,
      weight: rule.weight,
      derivedScore: clamp(derivedScore),
    };
  });
}

function buildRecordBase(params: {
  id: string;
  session: ThinkingAssessmentSession;
  entry: ThinkingResponseEntry;
  question?: ThinkingQuestionItem;
  olqSignals: ThinkingOlqSignalWeight[];
}) {
  const { id, session, entry, question, olqSignals } = params;
  return {
    id,
    schoolId: session.schoolId,
    sessionId: session.id,
    studentId: session.studentId,
    studentName: session.studentName,
    classSection: session.classSection,
    questionId: entry.questionId,
    difficulty: question?.difficulty ?? 'Intermediate',
    ageBand: question?.ageBand ?? '11-17 yrs',
    classRange: question?.classRange ?? session.classSection,
    timedMode: session.timedMode,
    timeLimitSec: session.timeLimitSec,
    responseTimeMs: Math.max(0, Number(entry.responseTimeMs) || 0),
    dimensionScores: { ...entry.dimensionSnapshot },
    autoPatternFlags: [...entry.autoPatternFlags],
    olqSignals,
    reviewStatus: (session.status === 'counsellor_reviewed' ? 'counsellor_reviewed' : 'submitted') as
      | 'submitted'
      | 'counsellor_reviewed',
    reviewedBy: session.reviewedBy,
    reviewedAt: session.reviewedAt,
    teacherObservation: session.teacherObservation,
    counsellorRecommendation: session.counsellorRecommendation,
    aiDraftObservation: session.aiDraftObservation,
    createdAt: session.submittedAt,
    updatedAt: session.reviewedAt || session.submittedAt,
  };
}

export function normalizeSrtRecord(
  session: ThinkingAssessmentSession,
  entry: ThinkingResponseEntry,
  index: number,
  question?: ThinkingQuestionItem,
): SrtRecord {
  const olqSignals = deriveOlqSignalsForRecord({ testType: 'SRT', entry });
  const fallbackSub = {
    speedOfResponse: entry.dimensionSnapshot.fastThinking,
    practicalThinking: entry.dimensionSnapshot.betterThinking,
    decisionMaking: entry.dimensionSnapshot.betterThinking,
    responsibility: clamp(100 - entry.dimensionSnapshot.selfCentredThinking),
    initiative: entry.dimensionSnapshot.betterThinking,
    positiveAttitude: entry.dimensionSnapshot.positiveThinking,
    problemSolving: entry.dimensionSnapshot.betterThinking,
    emotionalMaturity: clamp((entry.dimensionSnapshot.positiveThinking + (100 - entry.dimensionSnapshot.selfCentredThinking)) / 2),
    teamOrientation: clamp(100 - entry.dimensionSnapshot.selfCentredThinking),
    selfAwareness: clamp((entry.dimensionSnapshot.betterThinking + (100 - entry.dimensionSnapshot.selfCentredThinking)) / 2),
  };

  return {
    ...buildRecordBase({
      id: `srt-rec-${session.id}-${index + 1}`,
      session,
      entry,
      question,
      olqSignals,
    }),
    testType: 'SRT',
    situationTitle: question?.title || `SRT Situation #${index + 1}`,
    situationPrompt: question?.prompt || entry.promptSnapshot,
    responseText: entry.responseText,
    subDimensions: entry.srtSubScores ? { ...entry.srtSubScores } : fallbackSub,
  };
}

export function normalizeWatRecord(
  session: ThinkingAssessmentSession,
  entry: ThinkingResponseEntry,
  index: number,
  question?: ThinkingQuestionItem,
): WatRecord {
  const { wordCount, sentenceConstruction } = classifyWatSentenceConstruction(entry.responseText);
  const { primary, tags } = classifyWatPatterns(entry);
  const olqSignals = deriveOlqSignalsForRecord({ testType: 'WAT', entry });

  return {
    ...buildRecordBase({
      id: `wat-rec-${session.id}-${index + 1}`,
      session,
      entry,
      question,
      olqSignals,
    }),
    testType: 'WAT',
    cueWord: question?.prompt || entry.promptSnapshot,
    responseText: entry.responseText,
    wordCount,
    sentenceConstruction,
    underlyingPattern: primary,
    patternTags: tags,
  };
}

export function normalizeTatRecord(
  session: ThinkingAssessmentSession,
  entry: ThinkingResponseEntry,
  index: number,
  historicalSequenceNo: number,
  question?: ThinkingQuestionItem,
): TatRecord {
  const traitEvaluation = computeTatTraits(entry);
  const olqSignals = deriveOlqSignalsForRecord({
    testType: 'TAT',
    entry,
    tatTraits: traitEvaluation,
  });

  return {
    ...buildRecordBase({
      id: `tat-rec-${session.id}-${index + 1}`,
      session,
      entry,
      question,
      olqSignals,
    }),
    testType: 'TAT',
    sceneCode: question?.sceneCode || 'TAT-SCENE-GENERIC',
    sceneCaption: question?.sceneCaption || question?.title || entry.promptSnapshot,
    storyText: entry.responseText,
    storyStructure: entry.tatStructure ?? {
      protagonist: 'Student learner',
      objective: 'Resolve the depicted situation constructively',
      challenges: 'Context-specific constraints observed in story',
      actions: entry.responseText.slice(0, 140),
      outcome: 'Constructive resolution recorded in narrative',
    },
    traitEvaluation,
    historicalSequenceNo,
  };
}

export function normalizePpdtRecord(
  session: ThinkingAssessmentSession,
  entry: ThinkingResponseEntry,
  index: number,
  question?: ThinkingQuestionItem,
): PpdtRecord {
  const olqSignals = deriveOlqSignalsForRecord({
    testType: 'PPDT',
    entry,
    ppdtGroupEval: session.ppdtGroupEval,
  });

  return {
    ...buildRecordBase({
      id: `ppdt-rec-${session.id}-${index + 1}`,
      session,
      entry,
      question,
      olqSignals,
    }),
    testType: 'PPDT',
    sceneCode: question?.sceneCode || 'PPDT-SCENE-GENERIC',
    sceneCaption: question?.sceneCaption || question?.title || entry.promptSnapshot,
    workflowMode: session.workflowMode,
    perception: entry.ppdtPerception ?? {
      charactersCount: 2,
      approximateAges: '14-16 yrs',
      mood: 'Positive',
      centralSituation: question?.title || 'Ambiguous group situation',
      narrationSummary: entry.responseText.slice(0, 160),
    },
    storyText: entry.responseText,
    groupDiscussion: session.ppdtGroupEval ? { ...session.ppdtGroupEval } : undefined,
  };
}

function upsertById<T extends { id: string }>(collection: T[], record: T): 'created' | 'updated' {
  const idx = collection.findIndex((item) => item.id === record.id);
  if (idx >= 0) {
    collection[idx] = record;
    return 'updated';
  }
  collection.unshift(record);
  return 'created';
}

/**
 * Synchronizes a single `ThinkingAssessmentSession` (on create or counsellor review)
 * into the normalized Express collections (`srtRecords`, `watRecords`, `tatRecords`,
 * `ppdtRecords`) AND updates the `thinkingOlqMappings` relational bridge ledger.
 */
export function syncSessionToThinkingCollections(
  db: DatabaseState,
  session: ThinkingAssessmentSession,
): { recordsUpserted: number; olqMappingsUpserted: number } {
  if (!Array.isArray(db.srtRecords)) db.srtRecords = [];
  if (!Array.isArray(db.watRecords)) db.watRecords = [];
  if (!Array.isArray(db.tatRecords)) db.tatRecords = [];
  if (!Array.isArray(db.ppdtRecords)) db.ppdtRecords = [];
  if (!Array.isArray(db.thinkingOlqMappings)) db.thinkingOlqMappings = [];

  const qById = new Map(
    (db.thinkingQuestionBank || [])
      .filter((q) => q.schoolId === session.schoolId)
      .map((q) => [q.id, q]),
  );

  const studentSessions = (db.thinkingAssessments || []).filter(
    (s) => s.schoolId === session.schoolId && s.studentId === session.studentId,
  );
  const corroboratedResponseCount = studentSessions.reduce((acc, s) => acc + s.responses.length, 0);
  const scoringCfg =
    db.thinkingScoringConfigs?.[session.schoolId] ||
    createDefaultThinkingScoringConfig(session.schoolId);
  const minRequired = Math.max(2, scoringCfg.minCorroborationCount || 3);
  const evidenceSourceKey = `thinking:${session.schoolId}:${session.studentId}:corroborated`;
  const evidenceExists = (db.evidence || []).some((e) => e.sourceKey === evidenceSourceKey);

  let recordsUpserted = 0;
  let olqMappingsUpserted = 0;

  const existingTatCountForStudent = db.tatRecords.filter(
    (r) => r.schoolId === session.schoolId && r.studentId === session.studentId && r.sessionId !== session.id,
  ).length;

  session.responses.forEach((entry, idx) => {
    const q = qById.get(entry.questionId);
    let recordId = '';
    let sourceCollection: ThinkingOlqMappingRecord['sourceCollection'] = 'srtRecords';
    let olqSignals: ThinkingOlqSignalWeight[] = [];

    if (session.testType === 'SRT') {
      const rec = normalizeSrtRecord(session, entry, idx, q);
      upsertById(db.srtRecords, rec);
      recordId = rec.id;
      sourceCollection = 'srtRecords';
      olqSignals = rec.olqSignals;
    } else if (session.testType === 'WAT') {
      const rec = normalizeWatRecord(session, entry, idx, q);
      upsertById(db.watRecords, rec);
      recordId = rec.id;
      sourceCollection = 'watRecords';
      olqSignals = rec.olqSignals;
    } else if (session.testType === 'TAT') {
      const rec = normalizeTatRecord(session, entry, idx, existingTatCountForStudent + idx + 1, q);
      upsertById(db.tatRecords, rec);
      recordId = rec.id;
      sourceCollection = 'tatRecords';
      olqSignals = rec.olqSignals;
    } else {
      const rec = normalizePpdtRecord(session, entry, idx, q);
      upsertById(db.ppdtRecords, rec);
      recordId = rec.id;
      sourceCollection = 'ppdtRecords';
      olqSignals = rec.olqSignals;
    }
    recordsUpserted += 1;

    const promotedToEvidence = Boolean(
      corroboratedResponseCount >= minRequired &&
        (session.promotedToOlq || (evidenceExists && session.status === 'counsellor_reviewed')),
    );

    for (const sig of olqSignals) {
      const rule = THINKING_OLQ_MAPPING_MATRIX.find(
        (r) => r.testType === session.testType && r.olqKey === sig.olqKey,
      );
      const mapping: ThinkingOlqMappingRecord = {
        id: `tom-${recordId}-${sig.olqKey}`,
        schoolId: session.schoolId,
        studentId: session.studentId,
        studentName: session.studentName,
        classSection: session.classSection,
        testType: session.testType,
        sourceCollection,
        recordId,
        sessionId: session.id,
        olqKey: sig.olqKey,
        olqName: sig.olqName,
        olqGroup: sig.olqGroup,
        rawSignalScore: sig.derivedScore,
        mappingRationale: rule?.derivationRule || `Mapped from ${session.testType} assessment response.`,
        corroboratedResponseCount,
        minCorroborationRequired: minRequired,
        corroborationSatisfied: corroboratedResponseCount >= minRequired,
        promotedToEvidence,
        evidenceSourceKey,
        reviewedBy: session.reviewedBy,
        reviewedAt: session.reviewedAt,
        updatedAt: session.reviewedAt || session.submittedAt,
      };
      upsertById(db.thinkingOlqMappings, mapping);
      olqMappingsUpserted += 1;
    }
  });

  // Re-synchronize corroboratedResponseCount across all mappings for this student
  for (const m of db.thinkingOlqMappings) {
    if (m.schoolId === session.schoolId && m.studentId === session.studentId) {
      m.corroboratedResponseCount = corroboratedResponseCount;
      m.corroborationSatisfied = corroboratedResponseCount >= minRequired;
      if (evidenceExists && session.promotedToOlq && corroboratedResponseCount >= minRequired) {
        m.promotedToEvidence = true;
      }
    }
  }

  return { recordsUpserted, olqMappingsUpserted };
}

// ============================================================================
// IDEMPOTENT VERSIONED MIGRATION RUNNER
// ============================================================================

export function runThinkingAssessmentMigrations(
  db: DatabaseState,
  options?: { forceIntegrityResync?: boolean },
): ThinkingMigrationExecutionReport {
  const executedAt = new Date().toISOString();
  const forceResync = Boolean(options?.forceIntegrityResync);
  let mutated = false;

  if (!Array.isArray(db.databaseMigrations)) {
    db.databaseMigrations = [];
    mutated = true;
  }

  const appliedSet = new Set(db.databaseMigrations.map((m) => m.version));
  const appliedVersions: string[] = [];
  const alreadyAppliedVersions: string[] = [];
  const integrityWarnings: string[] = [];

  // Migration 001: Initialize normalized collections
  const m1 = THINKING_MIGRATION_MANIFEST[0];
  const needsInit =
    !Array.isArray(db.srtRecords) ||
    !Array.isArray(db.watRecords) ||
    !Array.isArray(db.tatRecords) ||
    !Array.isArray(db.ppdtRecords) ||
    !Array.isArray(db.thinkingOlqMappings);

  if (!appliedSet.has(m1.version) || needsInit) {
    if (!Array.isArray(db.srtRecords)) db.srtRecords = [];
    if (!Array.isArray(db.watRecords)) db.watRecords = [];
    if (!Array.isArray(db.tatRecords)) db.tatRecords = [];
    if (!Array.isArray(db.ppdtRecords)) db.ppdtRecords = [];
    if (!Array.isArray(db.thinkingOlqMappings)) db.thinkingOlqMappings = [];
    if (!appliedSet.has(m1.version)) {
      db.databaseMigrations.push({
        id: `mig-${m1.version}`,
        version: m1.version,
        module: 'thinking_assessment',
        name: m1.name,
        description: m1.description,
        status: 'applied',
        recordsCreated: 0,
        recordsUpdated: 0,
        integrityWarnings: [],
        appliedAt: executedAt,
      });
      appliedSet.add(m1.version);
      appliedVersions.push(m1.version);
    }
    mutated = true;
  } else {
    alreadyAppliedVersions.push(m1.version);
  }

  // Migration 002 & 003: Backfill SRT/WAT/TAT/PPDT records + OLQ mapping ledger
  const m2 = THINKING_MIGRATION_MANIFEST[1];
  const m3 = THINKING_MIGRATION_MANIFEST[2];
  const totalFormatRecords =
    db.srtRecords.length + db.watRecords.length + db.tatRecords.length + db.ppdtRecords.length;
  const needsBackfill =
    !appliedSet.has(m2.version) ||
    !appliedSet.has(m3.version) ||
    forceResync ||
    ((db.thinkingAssessments || []).length > 0 && totalFormatRecords === 0);

  if (needsBackfill) {
    let totalRecs = 0;
    let totalMappings = 0;
    // Process chronologically so TAT historicalSequenceNo is deterministic
    const sortedSessions = [...(db.thinkingAssessments || [])].sort((a, b) =>
      a.submittedAt.localeCompare(b.submittedAt),
    );
    for (const sess of sortedSessions) {
      const res = syncSessionToThinkingCollections(db, sess);
      totalRecs += res.recordsUpserted;
      totalMappings += res.olqMappingsUpserted;
    }

    if (!appliedSet.has(m2.version)) {
      db.databaseMigrations.push({
        id: `mig-${m2.version}`,
        version: m2.version,
        module: 'thinking_assessment',
        name: m2.name,
        description: m2.description,
        status: 'applied',
        recordsCreated: totalRecs,
        recordsUpdated: 0,
        integrityWarnings: [],
        appliedAt: executedAt,
      });
      appliedSet.add(m2.version);
      appliedVersions.push(m2.version);
    }
    if (!appliedSet.has(m3.version)) {
      db.databaseMigrations.push({
        id: `mig-${m3.version}`,
        version: m3.version,
        module: 'thinking_assessment',
        name: m3.name,
        description: m3.description,
        status: 'applied',
        recordsCreated: totalMappings,
        recordsUpdated: 0,
        integrityWarnings: [],
        appliedAt: executedAt,
      });
      appliedSet.add(m3.version);
      appliedVersions.push(m3.version);
    }
    mutated = true;
  } else {
    alreadyAppliedVersions.push(m2.version, m3.version);
  }

  // Migration 004: Verify tenant isolation & corroboration integrity
  const m4 = THINKING_MIGRATION_MANIFEST[3];
  if (!appliedSet.has(m4.version) || forceResync) {
    const validSchoolIds = new Set((db.schools || []).map((s) => s.id));
    const validStudentKeys = new Set((db.students || []).map((st) => `${st.schoolId}:${st.id}`));
    let repairedCount = 0;

    for (const m of db.thinkingOlqMappings) {
      if (!validSchoolIds.has(m.schoolId)) {
        integrityWarnings.push(`Mapping ${m.id} references unknown schoolId "${m.schoolId}".`);
      }
      if (!validStudentKeys.has(`${m.schoolId}:${m.studentId}`)) {
        integrityWarnings.push(
          `Mapping ${m.id} references student "${m.studentId}" outside school "${m.schoolId}".`,
        );
      }
      // Hard guard: never mark promotedToEvidence if below corroboration minimum or unreviewed
      if (m.promotedToEvidence && (!m.corroborationSatisfied || !m.reviewedBy)) {
        m.promotedToEvidence = false;
        repairedCount += 1;
        integrityWarnings.push(
          `Repaired uncorroborated promotion flag on ${m.id} (${m.corroboratedResponseCount}/${m.minCorroborationRequired}).`,
        );
      }
    }

    const entry: DatabaseMigrationEntry = {
      id: `mig-${m4.version}`,
      version: m4.version,
      module: 'thinking_assessment',
      name: m4.name,
      description: m4.description,
      status: repairedCount > 0 ? 'repaired' : 'applied',
      recordsCreated: 0,
      recordsUpdated: repairedCount,
      integrityWarnings: [...integrityWarnings],
      appliedAt: executedAt,
    };

    if (!appliedSet.has(m4.version)) {
      db.databaseMigrations.push(entry);
      appliedSet.add(m4.version);
      appliedVersions.push(m4.version);
      mutated = true;
    } else if (forceResync) {
      const idx = db.databaseMigrations.findIndex((x) => x.version === m4.version);
      if (idx >= 0) db.databaseMigrations[idx] = entry;
      mutated = true;
    }
  } else {
    alreadyAppliedVersions.push(m4.version);
  }

  return {
    executedAt,
    appliedVersions,
    alreadyAppliedVersions,
    collectionCounts: {
      thinkingQuestionBank: (db.thinkingQuestionBank || []).length,
      thinkingAssessments: (db.thinkingAssessments || []).length,
      srtRecords: db.srtRecords.length,
      watRecords: db.watRecords.length,
      tatRecords: db.tatRecords.length,
      ppdtRecords: db.ppdtRecords.length,
      thinkingOlqMappings: db.thinkingOlqMappings.length,
    },
    integrityWarnings,
    mutated,
  };
}

export function getThinkingMigrationStatus(db: DatabaseState, schoolId?: string | null) {
  const filterBySchool = <T extends { schoolId: string }>(arr: T[] | undefined) =>
    schoolId ? (arr || []).filter((r) => r.schoolId === schoolId) : arr || [];

  const applied = (db.databaseMigrations || []).filter((m) => m.module === 'thinking_assessment');
  const appliedVersions = new Set(applied.map((m) => m.version));
  const pending = THINKING_MIGRATION_MANIFEST.filter((m) => !appliedVersions.has(m.version));

  return {
    module: 'thinking_assessment',
    currentVersion: applied[applied.length - 1]?.version ?? null,
    latestManifestVersion:
      THINKING_MIGRATION_MANIFEST[THINKING_MIGRATION_MANIFEST.length - 1].version,
    upToDate: pending.length === 0,
    appliedMigrations: applied,
    pendingMigrations: pending,
    scopedSchoolId: schoolId ?? 'ALL',
    collectionCounts: {
      thinkingQuestionBank: filterBySchool(db.thinkingQuestionBank).length,
      thinkingAssessments: filterBySchool(db.thinkingAssessments).length,
      srtRecords: filterBySchool(db.srtRecords).length,
      watRecords: filterBySchool(db.watRecords).length,
      tatRecords: filterBySchool(db.tatRecords).length,
      ppdtRecords: filterBySchool(db.ppdtRecords).length,
      thinkingOlqMappings: filterBySchool(db.thinkingOlqMappings).length,
      promotedOlqEvidenceRecords: (db.evidence || []).filter(
        (e) =>
          e.sourceType === 'thinking_assessment' && (!schoolId || e.schoolId === schoolId),
      ).length,
    },
  };
}
