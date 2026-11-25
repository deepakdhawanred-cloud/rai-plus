import type {
  DevelopmentEvidence,
  OlqKey,
  PpdtGroupDiscussionEvaluation,
  PpdtPerceptionDetails,
  SrtSubDimensions,
  TatStoryStructure,
  ThinkingAssessmentSession,
  ThinkingDimensionScores,
  ThinkingQuestionItem,
  ThinkingResponseEntry,
  ThinkingScoringConfig,
  ThinkingTestType,
} from '../types';

export function createDefaultThinkingScoringConfig(schoolId: string): ThinkingScoringConfig {
  return {
    schoolId,
    minCorroborationCount: 3,
    fastResponseThresholdMs: 12000,
    moderateResponseThresholdMs: 28000,
    positiveMarkers: [
      'help',
      'support',
      'encourage',
      'improve',
      'learn',
      'solve',
      'calm',
      'positive',
      'hope',
      'confident',
      'achieve',
      'motivate',
      'courage',
      'unity',
      'respect',
      'care',
      'succeed',
      'overcome',
      'guide',
    ],
    practicalActionMarkers: [
      'plan',
      'check',
      'inform',
      'organise',
      'organize',
      'prepare',
      'schedule',
      'step',
      'first aid',
      'call',
      'verify',
      'discuss',
      'review',
      'coordinate',
      'divide',
      'practice',
      'analyse',
      'analyze',
      'resolve',
      'solution',
      'action',
    ],
    teamResponsibilityMarkers: [
      'team',
      'together',
      'group',
      'classmates',
      'friend',
      'friends',
      'family',
      'community',
      'teacher',
      'we',
      'our',
      'share',
      'cooperate',
      'responsible',
      'duty',
      'assist',
      'everyone',
      'others',
    ],
    selfCentredMarkers: [
      'only me',
      'only myself',
      'not my problem',
      'ignore others',
      'ignore them',
      'leave them',
      'my own benefit',
      'let them fail',
      'dont care',
      "don't care",
      'only i',
      'just myself',
      'alone',
      'refuse to share',
      'blame',
      'selfish',
      'nobody else',
      'my profit',
    ],
    avoidanceMarkers: [
      'run away',
      'give up',
      'quit',
      'impossible',
      'nothing can be done',
      'hide',
      'panic',
      'cannot do',
      "can't do",
      'skip',
      'escape',
    ],
    updatedBy: 'System Default Framework',
    updatedAt: '2026-11-19',
  };
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function countMarkerHits(text: string, markers: string[]): number {
  const lower = ` ${text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ')} `;
  let hits = 0;
  for (const m of markers) {
    const clean = m.toLowerCase().trim();
    if (!clean) continue;
    if (lower.includes(` ${clean} `) || (clean.includes(' ') && lower.includes(clean))) {
      hits += 1;
    }
  }
  return hits;
}

export function evaluateSingleThinkingResponse(params: {
  question: ThinkingQuestionItem;
  responseText: string;
  responseTimeMs: number;
  config: ThinkingScoringConfig;
  tatStructure?: TatStoryStructure;
  ppdtPerception?: PpdtPerceptionDetails;
}): ThinkingResponseEntry {
  const { question, responseTimeMs, config, tatStructure, ppdtPerception } = params;
  const combinedText = [
    params.responseText,
    tatStructure?.objective,
    tatStructure?.challenges,
    tatStructure?.actions,
    tatStructure?.outcome,
    ppdtPerception?.centralSituation,
    ppdtPerception?.narrationSummary,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const words = combinedText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const positiveHits = countMarkerHits(combinedText, config.positiveMarkers);
  const practicalHits = countMarkerHits(combinedText, config.practicalActionMarkers);
  const teamHits = countMarkerHits(combinedText, config.teamResponsibilityMarkers);
  const selfHits = countMarkerHits(combinedText, config.selfCentredMarkers);
  const avoidanceHits = countMarkerHits(combinedText, config.avoidanceMarkers);

  // 1. FAST THINKING: strictly reflects response latency relative to configured thresholds.
  // Never automatically treated as good/better thinking!
  let fastThinking = 50;
  if (responseTimeMs <= 0) {
    fastThinking = 55;
  } else if (responseTimeMs <= config.fastResponseThresholdMs) {
    fastThinking = clamp(82 + ((config.fastResponseThresholdMs - responseTimeMs) / config.fastResponseThresholdMs) * 16);
  } else if (responseTimeMs <= config.moderateResponseThresholdMs) {
    const ratio =
      (responseTimeMs - config.fastResponseThresholdMs) /
      Math.max(1, config.moderateResponseThresholdMs - config.fastResponseThresholdMs);
    fastThinking = clamp(80 - ratio * 28);
  } else {
    const extraSec = (responseTimeMs - config.moderateResponseThresholdMs) / 1000;
    fastThinking = clamp(50 - Math.min(35, extraSec * 1.1));
  }

  // 2. BETTER THINKING: quality, practicality, structured decision-making, non-avoidant clarity.
  const lengthQuality =
    question.testType === 'WAT'
      ? wordCount >= 4 && wordCount <= 18
        ? 22
        : wordCount >= 2
          ? 12
          : 2
      : question.testType === 'SRT'
        ? wordCount >= 8
          ? 24
          : wordCount >= 4
            ? 14
            : 4
        : wordCount >= 25
          ? 26
          : wordCount >= 12
            ? 16
            : 5;

  const structureBonus =
    (tatStructure &&
    tatStructure.protagonist.trim() &&
    tatStructure.actions.trim() &&
    tatStructure.outcome.trim()
      ? 16
      : 0) +
    (ppdtPerception && ppdtPerception.centralSituation.trim() && ppdtPerception.charactersCount > 0
      ? 14
      : 0);

  const betterThinking = clamp(
    28 +
      lengthQuality +
      structureBonus +
      Math.min(28, practicalHits * 10) +
      Math.min(12, teamHits * 5) -
      avoidanceHits * 14 -
      selfHits * 8,
  );

  // 3. POSITIVE THINKING: constructive, optimistic, solution-oriented approach.
  const moodBonus =
    ppdtPerception?.mood === 'Positive' ? 10 : ppdtPerception?.mood === 'Negative' ? -8 : 0;
  const positiveThinking = clamp(
    36 +
      moodBonus +
      Math.min(34, positiveHits * 12) +
      Math.min(16, practicalHits * 6) +
      Math.min(10, teamHits * 4) -
      avoidanceHits * 16 -
      selfHits * 10,
  );

  // 4. SELF-CENTRED THINKING (separate non-diagnostic observation dimension; higher = stronger self-focused pattern)
  const firstPersonCount = (combinedText.toLowerCase().match(/\b(i|me|my|mine|myself)\b/g) || []).length;
  const firstPersonRatio = wordCount > 0 ? firstPersonCount / wordCount : 0;
  const excessIndividualism = firstPersonRatio > 0.28 && teamHits === 0 ? 18 : 0;
  const selfCentredThinking = clamp(
    18 + selfHits * 26 + avoidanceHits * 10 + excessIndividualism - Math.min(18, teamHits * 8),
  );

  const autoPatternFlags: string[] = [];
  if (practicalHits > 0) autoPatternFlags.push('Practical action orientation');
  if (positiveHits > 0) autoPatternFlags.push('Constructive & solution-focused tone');
  if (teamHits > 0) autoPatternFlags.push('Team & responsibility awareness');
  if (fastThinking >= 78 && betterThinking < 50) {
    autoPatternFlags.push('Rapid response — encourage pausing to deepen practicality');
  }
  if (selfCentredThinking >= 55) {
    autoPatternFlags.push('Elevated self-focused phrasing — explore collaborative perspectives');
  }
  if (avoidanceHits > 0) {
    autoPatternFlags.push('Avoidance cue observed — coach step-by-step problem breakdown');
  }
  if (autoPatternFlags.length === 0) {
    autoPatternFlags.push('Baseline reflective response recorded');
  }

  let srtSubScores: SrtSubDimensions | undefined;
  if (question.testType === 'SRT') {
    srtSubScores = {
      speedOfResponse: fastThinking,
      practicalThinking: clamp(betterThinking + (practicalHits > 0 ? 5 : -4)),
      decisionMaking: clamp((betterThinking * 0.7 + fastThinking * 0.3) - avoidanceHits * 10),
      responsibility: clamp(46 + teamHits * 12 + practicalHits * 8 - selfHits * 14),
      initiative: clamp(44 + practicalHits * 12 + positiveHits * 6 - avoidanceHits * 15),
      positiveAttitude: positiveThinking,
      problemSolving: clamp(betterThinking + (practicalHits >= 2 ? 6 : 0)),
      emotionalMaturity: clamp(54 + positiveHits * 8 - avoidanceHits * 12 - selfHits * 10),
      teamOrientation: clamp(45 + teamHits * 15 - selfHits * 16),
      selfAwareness: clamp(48 + Math.min(20, wordCount) + (selfCentredThinking < 45 ? 10 : -8)),
    };
  }

  return {
    questionId: question.id,
    promptSnapshot: question.prompt,
    responseText: params.responseText.trim(),
    responseTimeMs,
    tatStructure,
    ppdtPerception,
    autoPatternFlags,
    dimensionSnapshot: {
      fastThinking,
      betterThinking,
      positiveThinking,
      selfCentredThinking,
    },
    srtSubScores,
  };
}

export function aggregateThinkingSession(params: {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  testType: ThinkingTestType;
  workflowMode: 'Individual' | 'Group';
  timedMode: boolean;
  timeLimitSec: number;
  startedAt: string;
  submittedAt: string;
  responses: ThinkingResponseEntry[];
  questionsById: Map<string, ThinkingQuestionItem>;
  ppdtGroupEval?: PpdtGroupDiscussionEvaluation;
}): ThinkingAssessmentSession {
  const { responses, questionsById, ppdtGroupEval } = params;
  const count = Math.max(1, responses.length);

  const avg = (fn: (r: ThinkingResponseEntry) => number) =>
    clamp(responses.reduce((sum, r) => sum + fn(r), 0) / count);

  const dimensionScores: ThinkingDimensionScores = {
    fastThinking: avg((r) => r.dimensionSnapshot.fastThinking),
    betterThinking: avg((r) => r.dimensionSnapshot.betterThinking),
    positiveThinking: avg((r) => r.dimensionSnapshot.positiveThinking),
    selfCentredThinking: avg((r) => r.dimensionSnapshot.selfCentredThinking),
  };

  let srtAverageSubScores: SrtSubDimensions | undefined;
  const srtEntries = responses.map((r) => r.srtSubScores).filter((s): s is SrtSubDimensions => Boolean(s));
  if (srtEntries.length > 0) {
    const srtAvg = (key: keyof SrtSubDimensions) =>
      clamp(srtEntries.reduce((s, item) => s + item[key], 0) / srtEntries.length);
    srtAverageSubScores = {
      speedOfResponse: srtAvg('speedOfResponse'),
      practicalThinking: srtAvg('practicalThinking'),
      decisionMaking: srtAvg('decisionMaking'),
      responsibility: srtAvg('responsibility'),
      initiative: srtAvg('initiative'),
      positiveAttitude: srtAvg('positiveAttitude'),
      problemSolving: srtAvg('problemSolving'),
      emotionalMaturity: srtAvg('emotionalMaturity'),
      teamOrientation: srtAvg('teamOrientation'),
      selfAwareness: srtAvg('selfAwareness'),
    };
  }

  // Compute candidate OLQ evidence signals from responses + PPDT group evaluation
  const olqAccumulator = new Map<OlqKey, number[]>();
  const pushOlq = (key: OlqKey, val: number) => {
    const arr = olqAccumulator.get(key) || [];
    arr.push(clamp(val));
    olqAccumulator.set(key, arr);
  };

  for (const r of responses) {
    const q = questionsById.get(r.questionId);
    const qualityScore = clamp(
      r.dimensionSnapshot.betterThinking * 0.55 +
        r.dimensionSnapshot.positiveThinking * 0.35 +
        (100 - r.dimensionSnapshot.selfCentredThinking) * 0.1,
    );
    const targets = q?.targetOlqs && q.targetOlqs.length > 0 ? q.targetOlqs : (['effective_intelligence', 'reasoning_ability'] as OlqKey[]);
    for (const olq of targets) {
      if (olq === 'speed_of_decision') {
        // Speed of decision balances quickness with practical soundness — never pure speed alone
        pushOlq(olq, clamp(r.dimensionSnapshot.fastThinking * 0.45 + r.dimensionSnapshot.betterThinking * 0.55));
      } else if (olq === 'cooperation' || olq === 'social_adaptability') {
        pushOlq(olq, clamp(100 - r.dimensionSnapshot.selfCentredThinking * 0.65 + r.dimensionSnapshot.positiveThinking * 0.25));
      } else {
        pushOlq(olq, qualityScore);
      }
    }
  }

  if (ppdtGroupEval) {
    pushOlq('power_of_expression', ppdtGroupEval.communication * 10);
    pushOlq('cooperation', ppdtGroupEval.cooperation * 10);
    pushOlq('initiative', ppdtGroupEval.initiative * 10);
    pushOlq('social_adaptability', ppdtGroupEval.listening * 10);
    pushOlq('influence_group', ppdtGroupEval.leadership * 10);
  }

  const candidateOlqSignals: Partial<Record<OlqKey, number>> = {};
  for (const [k, vals] of olqAccumulator.entries()) {
    candidateOlqSignals[k] = clamp(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  // Strengths, Development Areas & Constructive Non-Diagnostic Exercises
  const strengths: string[] = [];
  const developmentAreas: string[] = [];
  const suggestedExercises: string[] = [];

  if (dimensionScores.betterThinking >= 68) {
    strengths.push('Demonstrates practical, step-by-step decision framing in response scenarios.');
  } else {
    developmentAreas.push('Strengthen structured action planning (identify problem → 2 concrete steps → outcome).');
    suggestedExercises.push('Practice 3 daily "Action-First" SRT cards listing who to inform, what to do first, and how to verify closure.');
  }

  if (dimensionScores.positiveThinking >= 68) {
    strengths.push('Maintains a constructive, solution-oriented mindset under situational pressure.');
  } else {
    developmentAreas.push('Build optimistic reframing when encountering unexpected obstacles.');
    suggestedExercises.push('WAT Reframing Drill: Convert 5 challenging cue words (e.g., "Delay", "Mistake") into constructive action sentences.');
  }

  if (dimensionScores.fastThinking >= 72 && dimensionScores.betterThinking >= 65) {
    strengths.push('Balances quick comprehension with practical, thoughtful action.');
  } else if (dimensionScores.fastThinking >= 72 && dimensionScores.betterThinking < 55) {
    developmentAreas.push('Fast initial reaction outpaces solution depth — practice a 3-second clarity pause before acting.');
    suggestedExercises.push('Pause-Plan-Respond Exercise: Read scenario, count 3 seconds to spot stakeholders, then write a practical action.');
  } else if (dimensionScores.fastThinking < 55) {
    developmentAreas.push('Gradually build response fluency under light time boundaries.');
    suggestedExercises.push('Untimed-to-Timed WAT Ladder: Start with 25-second word cues and gently step down to 15 seconds over 2 weeks.');
  }

  if (dimensionScores.selfCentredThinking >= 55) {
    developmentAreas.push('Responses frequently focus on individual outcomes — cultivate shared team & community perspective (developmental observation, not a diagnosis).');
    suggestedExercises.push('PPDT Perspective-Swap Discussion: Narrate the same picture from two different characters’ viewpoints before group consensus.');
  } else {
    strengths.push('Shows healthy awareness of peers, shared duties, and collective outcomes.');
  }

  if (strengths.length === 0) {
    strengths.push('Completed assessment earnestly with a clear baseline for guided thinking development.');
  }

  return {
    id: params.id,
    schoolId: params.schoolId,
    studentId: params.studentId,
    studentName: params.studentName,
    classSection: params.classSection,
    testType: params.testType,
    workflowMode: params.workflowMode,
    timedMode: params.timedMode,
    timeLimitSec: params.timeLimitSec,
    status: 'submitted',
    startedAt: params.startedAt,
    submittedAt: params.submittedAt,
    responses,
    dimensionScores,
    srtAverageSubScores,
    ppdtGroupEval,
    strengths,
    developmentAreas,
    suggestedExercises,
    candidateOlqSignals,
    promotedToOlq: false,
    promotedEvidenceKeys: [],
  };
}

export interface CorroboratedOlqPromotionResult {
  eligible: boolean;
  totalCorroboratedResponses: number;
  minRequired: number;
  reason: string;
  evidenceRecords: DevelopmentEvidence[];
}

/**
 * Enforces the critical architectural rule:
 * NEVER score or overwrite a student's 15-OLQ profile from a single response.
 * Requires >= config.minCorroborationCount total responses across reviewed/submitted sessions
 * and emits deterministic sourceKey DevelopmentEvidence records.
 */
export function buildCorroboratedThinkingOlqEvidence(params: {
  schoolId: string;
  studentId: string;
  sessions: ThinkingAssessmentSession[];
  config: ThinkingScoringConfig;
  reviewerName: string;
  reviewDateIso: string;
}): CorroboratedOlqPromotionResult {
  const { schoolId, studentId, sessions, config, reviewerName, reviewDateIso } = params;
  const studentSessions = sessions.filter(
    (s) => s.schoolId === schoolId && s.studentId === studentId && s.responses.length > 0,
  );
  const totalResponses = studentSessions.reduce((sum, s) => sum + s.responses.length, 0);
  const minRequired = Math.max(2, config.minCorroborationCount);

  if (totalResponses < minRequired) {
    return {
      eligible: false,
      totalCorroboratedResponses: totalResponses,
      minRequired,
      reason: `Multi-response corroboration guard: at least ${minRequired} responses are required before updating 15-OLQ scores (currently ${totalResponses}).`,
      evidenceRecords: [],
    };
  }

  // Aggregate corroborated OLQ scores across all valid sessions
  const olqBuckets = new Map<OlqKey, number[]>();
  for (const sess of studentSessions) {
    for (const [key, val] of Object.entries(sess.candidateOlqSignals) as Array<[OlqKey, number]>) {
      if (typeof val !== 'number') continue;
      const arr = olqBuckets.get(key) || [];
      arr.push(val);
      olqBuckets.set(key, arr);
    }
  }

  const olqContributions: Partial<Record<OlqKey, number>> = {};
  for (const [k, vals] of olqBuckets.entries()) {
    olqContributions[k] = clamp(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  const avgBetter = clamp(
    studentSessions.reduce((s, item) => s + item.dimensionScores.betterThinking, 0) /
      studentSessions.length,
  );
  const avgPositive = clamp(
    studentSessions.reduce((s, item) => s + item.dimensionScores.positiveThinking, 0) /
      studentSessions.length,
  );
  const avgCooperative = clamp(
    100 -
      studentSessions.reduce((s, item) => s + item.dimensionScores.selfCentredThinking, 0) /
        studentSessions.length,
  );

  const testTypesUsed = Array.from(new Set(studentSessions.map((s) => s.testType))).sort().join('+');
  const sourceKey = `thinking:${schoolId}:${studentId}:corroborated`;

  const record: DevelopmentEvidence = {
    id: `ev-think-${studentId}`,
    schoolId,
    studentId,
    sourceKey,
    sourceType: 'thinking_assessment',
    subject: 'Thinking & OLQ Lab',
    chapter: `${testTypesUsed} (${totalResponses} corroborated responses)`,
    date: reviewDateIso,
    summary: `Corroborated Thinking Assessment evidence across ${studentSessions.length} session(s) [${testTypesUsed}, ${totalResponses} responses] reviewed by ${reviewerName}. Better Thinking ${avgBetter}/100, Positive Thinking ${avgPositive}/100.`,
    olqContributions,
    componentContributions: {
      olq: clamp(
        Object.values(olqContributions).reduce((a, b) => a + b, 0) /
          Math.max(1, Object.values(olqContributions).length),
      ),
      personalGrowth: clamp(avgBetter * 0.5 + avgPositive * 0.35 + avgCooperative * 0.15),
    },
    learningSignals: {
      initiativeProblemSolving: avgBetter,
      learningFromMistakes: avgPositive,
      groupContributions: avgCooperative,
    },
    observationContext: 'Classroom',
    enteredBy: reviewerName,
    validated: true,
  };

  return {
    eligible: true,
    totalCorroboratedResponses: totalResponses,
    minRequired,
    reason: `Promoted ${Object.keys(olqContributions).length} corroborated OLQ dimensions from ${totalResponses} responses across ${testTypesUsed}.`,
    evidenceRecords: [record],
  };
}

export interface StudentThinkingCompositeProfile {
  studentId: string;
  sessionCount: number;
  totalResponses: number;
  dimensions: ThinkingDimensionScores;
  byTestType: Record<ThinkingTestType, { count: number; dimensions: ThinkingDimensionScores | null }>;
  trendPoints: Array<{
    date: string;
    label: string;
    testType: ThinkingTestType;
    fastThinking: number;
    betterThinking: number;
    positiveThinking: number;
    selfCentredThinking: number;
  }>;
  latestStrengths: string[];
  latestDevelopmentAreas: string[];
  latestExercises: string[];
}

export function computeStudentThinkingComposite(
  studentId: string,
  sessions: ThinkingAssessmentSession[],
): StudentThinkingCompositeProfile {
  const mine = sessions
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  const avgDims = (list: ThinkingAssessmentSession[]): ThinkingDimensionScores => {
    if (list.length === 0) {
      return { fastThinking: 0, betterThinking: 0, positiveThinking: 0, selfCentredThinking: 0 };
    }
    return {
      fastThinking: clamp(list.reduce((s, x) => s + x.dimensionScores.fastThinking, 0) / list.length),
      betterThinking: clamp(list.reduce((s, x) => s + x.dimensionScores.betterThinking, 0) / list.length),
      positiveThinking: clamp(list.reduce((s, x) => s + x.dimensionScores.positiveThinking, 0) / list.length),
      selfCentredThinking: clamp(
        list.reduce((s, x) => s + x.dimensionScores.selfCentredThinking, 0) / list.length,
      ),
    };
  };

  const types: ThinkingTestType[] = ['SRT', 'WAT', 'TAT', 'PPDT'];
  const byTestType = {} as StudentThinkingCompositeProfile['byTestType'];
  for (const t of types) {
    const subset = mine.filter((s) => s.testType === t);
    byTestType[t] = {
      count: subset.length,
      dimensions: subset.length > 0 ? avgDims(subset) : null,
    };
  }

  const latest = mine[mine.length - 1];
  return {
    studentId,
    sessionCount: mine.length,
    totalResponses: mine.reduce((s, x) => s + x.responses.length, 0),
    dimensions: avgDims(mine),
    byTestType,
    trendPoints: mine.map((s, idx) => ({
      date: s.submittedAt.slice(0, 10),
      label: `${s.testType} #${idx + 1}`,
      testType: s.testType,
      fastThinking: s.dimensionScores.fastThinking,
      betterThinking: s.dimensionScores.betterThinking,
      positiveThinking: s.dimensionScores.positiveThinking,
      selfCentredThinking: s.dimensionScores.selfCentredThinking,
    })),
    latestStrengths: latest?.strengths ?? [],
    latestDevelopmentAreas: latest?.developmentAreas ?? [],
    latestExercises: latest?.suggestedExercises ?? [],
  };
}
