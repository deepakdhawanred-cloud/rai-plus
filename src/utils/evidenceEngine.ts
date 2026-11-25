import type {
  DevelopmentEvidence,
  EvidenceContributionLine,
  HandwritingRating,
  LearnersComponentKey,
  LearnersScoreBreakdown,
  LearnersWeights,
  LearningIndicatorKey,
  NotebookEntry,
  OlqDefinition,
  OlqKey,
  TargetEvidenceTrace,
  WorkQualityRating,
} from '../types';

export const OLQ_DEFINITIONS: OlqDefinition[] = [
  {
    key: 'effective_intelligence',
    index: 1,
    name: 'Effective Intelligence',
    group: 'Planning and Organising',
    description: 'Applying practical understanding to solve everyday academic and classroom problems.',
  },
  {
    key: 'reasoning_ability',
    index: 2,
    name: 'Reasoning Ability',
    group: 'Planning and Organising',
    description: 'Analysing concepts logically and drawing sound conclusions from evidence.',
  },
  {
    key: 'organising_ability',
    index: 3,
    name: 'Organising Ability',
    group: 'Planning and Organising',
    description: 'Structuring notebooks, time, study materials, and group tasks systematically.',
  },
  {
    key: 'power_of_expression',
    index: 4,
    name: 'Power of Expression',
    group: 'Planning and Organising',
    description: 'Communicating ideas clearly in handwriting, written answers, and spoken discussion.',
  },
  {
    key: 'social_adaptability',
    index: 5,
    name: 'Social Adaptability',
    group: 'Social Adjustment',
    description: 'Adjusting constructively to peers, teachers, and varied classroom situations.',
  },
  {
    key: 'cooperation',
    index: 6,
    name: 'Cooperation',
    group: 'Social Adjustment',
    description: 'Working harmoniously in group activities, labs, and house responsibilities.',
  },
  {
    key: 'sense_of_responsibility',
    index: 7,
    name: 'Sense of Responsibility',
    group: 'Social Adjustment',
    description: 'Taking ownership of homework, assigned duties, and academic commitments.',
  },
  {
    key: 'initiative',
    index: 8,
    name: 'Initiative',
    group: 'Social Effectiveness',
    description: 'Stepping forward independently to attempt tasks, ask questions, or assist peers.',
  },
  {
    key: 'self_confidence',
    index: 9,
    name: 'Self-Confidence',
    group: 'Social Effectiveness',
    description: 'Demonstrating steady assurance during recitations, presentations, and new tasks.',
  },
  {
    key: 'speed_of_decision',
    index: 10,
    name: 'Speed of Decision',
    group: 'Social Effectiveness',
    description: 'Choosing practical approaches within classroom and assessment timeframes.',
  },
  {
    key: 'influence_group',
    index: 11,
    name: 'Ability to Influence the Group',
    group: 'Social Effectiveness',
    description: 'Encouraging peers toward shared academic or house goals constructively.',
  },
  {
    key: 'liveliness',
    index: 12,
    name: 'Liveliness',
    group: 'Social Effectiveness',
    description: 'Maintaining positive curiosity and constructive classroom energy.',
  },
  {
    key: 'determination',
    index: 13,
    name: 'Determination',
    group: 'Dynamic Qualities',
    description: 'Persisting through challenging concepts and correcting mistakes steadily.',
  },
  {
    key: 'courage',
    index: 14,
    name: 'Courage',
    group: 'Dynamic Qualities',
    description: 'Attempting unfamiliar problems honestly and speaking up respectfully.',
  },
  {
    key: 'stamina',
    index: 15,
    name: 'Stamina',
    group: 'Dynamic Qualities',
    description: 'Sustaining focus and effort across terms, projects, and sports activities.',
  },
];

export const DEFAULT_LEARNERS_WEIGHTS: LearnersWeights = {
  academic: 35,
  olq: 30,
  learningHabits: 15,
  participation: 10,
  personalGrowth: 10,
};

export const LEARNING_INDICATOR_LABELS: Record<LearningIndicatorKey, string> = {
  independentTaskCompletion: 'Independent Task Completion',
  classroomParticipation: 'Classroom Participation',
  curiosityAndQuestions: 'Question Asking & Curiosity',
  initiativeProblemSolving: 'Initiative & Problem-Solving',
  learningFromMistakes: 'Learning from Mistakes',
  groupContributions: 'Group Contributions',
  selfDirectedReadiness: 'Self-Directed Readiness',
  consistencyOwnership: 'Consistency & Task Ownership',
};

export const COMPONENT_LABELS: Record<LearnersComponentKey, string> = {
  academic: 'Academic Development',
  olq: 'OLQ Development',
  learningHabits: 'Learning Habits',
  participation: 'Participation and Engagement',
  personalGrowth: 'Personal Growth',
};

export function validateLearnersWeights(weights: LearnersWeights): {
  valid: boolean;
  total: number;
  error?: string;
} {
  const values = [
    weights.academic,
    weights.olq,
    weights.learningHabits,
    weights.participation,
    weights.personalGrowth,
  ];
  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
    return { valid: false, total: 0, error: 'Each weight must be between 0 and 100.' };
  }
  const total = values.reduce((acc, v) => acc + v, 0);
  if (Math.abs(total - 100) > 0.01) {
    return {
      valid: false,
      total,
      error: `Component weights must total 100% (currently ${total}%).`,
    };
  }
  return { valid: true, total };
}

export function buildNotebookSourceKey(
  studentId: string,
  date: string,
  subject: string,
  chapter: string,
): string {
  return `nb:${studentId}:${date}:${subject.trim().toLowerCase()}:${chapter.trim().toLowerCase()}`;
}

export function mapNotebookEntryToEvidence(entry: NotebookEntry): DevelopmentEvidence {
  const sourceKey = buildNotebookSourceKey(
    entry.studentId,
    entry.date,
    entry.subject,
    entry.chapter,
  );

  const olqContributions: Partial<Record<OlqKey, number>> = {};
  const componentContributions: Partial<Record<LearnersComponentKey, number>> = {};
  const learningSignals: Partial<Record<LearningIndicatorKey, number>> = {};

  if (!entry.checked) {
    // Missing/unchecked notebook does NOT assign zero to OLQ; records habit follow-up only
    componentContributions.learningHabits = 50;
    learningSignals.consistencyOwnership = 50;
    return {
      id: `ev-${sourceKey}`,
      schoolId: entry.schoolId,
      studentId: entry.studentId,
      sourceKey,
      sourceType: 'notebook_check',
      subject: entry.subject,
      chapter: entry.chapter,
      date: entry.date,
      summary: `${entry.subject} (${entry.chapter}): Notebook pending check`,
      olqContributions,
      componentContributions,
      learningSignals,
      reviewRequired: false,
      enteredBy: entry.teacherName,
      validated: true,
    };
  }

  // Handwriting connects directly to Organising Ability and Power of Expression
  const hwScore = entry.handwriting === 'Readability' ? 86 : 56;
  olqContributions.organising_ability = hwScore;
  olqContributions.power_of_expression = entry.handwriting === 'Readability' ? 84 : 58;

  let qualityLabel = '';
  let reviewRequired = false;

  if (!entry.homeworkDone) {
    // Homework Done = No means the assignment is Not Complete
    qualityLabel =
      entry.workQuality === 'C'
        ? 'Homework Not Complete · Work Quality C (Requires review)'
        : 'Homework Not Complete (Partial attempt inspected)';
    reviewRequired = entry.workQuality === 'C';
    olqContributions.effective_intelligence = entry.workQuality === 'C' ? undefined : 68;
    olqContributions.reasoning_ability = entry.workQuality === 'C' ? undefined : 66;
    olqContributions.sense_of_responsibility = entry.workQuality === 'C' ? 48 : 55;
    olqContributions.determination = entry.workQuality === 'B' ? 66 : 56;
    componentContributions.academic = entry.workQuality === 'C' ? undefined : 62;
    componentContributions.learningHabits = 52;
    learningSignals.independentTaskCompletion = 50;
    learningSignals.consistencyOwnership = 50;
    learningSignals.selfDirectedReadiness = 54;
  } else if (entry.workQuality === 'A') {
    qualityLabel = 'Work Quality A (Independent & correct · Homework Complete)';
    olqContributions.effective_intelligence = 88;
    olqContributions.reasoning_ability = 90;
    olqContributions.sense_of_responsibility = 90;
    olqContributions.determination = 86;
    componentContributions.academic = 88;
    componentContributions.learningHabits = 92;
    learningSignals.independentTaskCompletion = 92;
    learningSignals.initiativeProblemSolving = 86;
    learningSignals.consistencyOwnership = 90;
    learningSignals.selfDirectedReadiness = 88;
  } else if (entry.workQuality === 'B') {
    // Independent attempt with mistakes still demonstrates genuine effort & determination
    qualityLabel = 'Work Quality B (Independent attempt with mistakes · Homework Complete)';
    olqContributions.effective_intelligence = 74;
    olqContributions.reasoning_ability = 72;
    olqContributions.sense_of_responsibility = 82;
    olqContributions.determination = 82;
    olqContributions.courage = 78;
    componentContributions.academic = 72;
    componentContributions.learningHabits = 82;
    learningSignals.independentTaskCompletion = 82;
    learningSignals.learningFromMistakes = 84;
    learningSignals.consistencyOwnership = 80;
    learningSignals.selfDirectedReadiness = 78;
  } else {
    // Work Quality C: Possible copied or non-independent work requiring review
    qualityLabel = 'Work Quality C (Requires teacher review for independent understanding)';
    reviewRequired = true;
    olqContributions.sense_of_responsibility = 54;
    componentContributions.learningHabits = 52;
    learningSignals.independentTaskCompletion = 48;
    learningSignals.selfDirectedReadiness = 50;
  }

  return {
    id: `ev-${sourceKey}`,
    schoolId: entry.schoolId,
    studentId: entry.studentId,
    sourceKey,
    sourceType: 'notebook_check',
    subject: entry.subject,
    chapter: entry.chapter,
    date: entry.date,
    summary: `${entry.subject} (${entry.chapter}): ${entry.handwriting} handwriting · ${qualityLabel}`,
    olqContributions,
    componentContributions,
    learningSignals,
    reviewRequired,
    enteredBy: entry.teacherName,
    validated: true,
  };
}

/**
 * Deduplicates evidence by `sourceKey` so duplicate scoring is strictly prevented.
 */
export function deduplicateEvidence(evidenceList: DevelopmentEvidence[]): DevelopmentEvidence[] {
  const byKey = new Map<string, DevelopmentEvidence>();
  for (const item of evidenceList) {
    byKey.set(item.sourceKey, item);
  }
  return Array.from(byKey.values());
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round((sum / nums.length) * 10) / 10;
}

/**
 * Calculates the 0-100 Learners Score and 15 OLQ breakdown.
 * Crucial invariant: Missing evidence is NEVER treated as zero; weights of
 * available components are re-normalized transparently.
 */
export function calculateLearnersScore(
  rawEvidence: DevelopmentEvidence[],
  weights: LearnersWeights = DEFAULT_LEARNERS_WEIGHTS,
): LearnersScoreBreakdown {
  const evidence = deduplicateEvidence(rawEvidence).filter((e) => e.validated);

  // 1. Compute each of the 15 OLQs
  const olqBuckets: Record<OlqKey, number[]> = {
    effective_intelligence: [],
    reasoning_ability: [],
    organising_ability: [],
    power_of_expression: [],
    social_adaptability: [],
    cooperation: [],
    sense_of_responsibility: [],
    initiative: [],
    self_confidence: [],
    speed_of_decision: [],
    influence_group: [],
    liveliness: [],
    determination: [],
    courage: [],
    stamina: [],
  };

  const componentBuckets: Record<LearnersComponentKey, number[]> = {
    academic: [],
    olq: [],
    learningHabits: [],
    participation: [],
    personalGrowth: [],
  };

  const learningBuckets: Record<LearningIndicatorKey, number[]> = {
    independentTaskCompletion: [],
    classroomParticipation: [],
    curiosityAndQuestions: [],
    initiativeProblemSolving: [],
    learningFromMistakes: [],
    groupContributions: [],
    selfDirectedReadiness: [],
    consistencyOwnership: [],
  };

  for (const ev of evidence) {
    for (const [key, val] of Object.entries(ev.olqContributions) as [OlqKey, number][]) {
      if (typeof val === 'number' && Number.isFinite(val)) {
        olqBuckets[key].push(val);
      }
    }
    for (const [key, val] of Object.entries(ev.componentContributions) as [
      LearnersComponentKey,
      number,
    ][]) {
      if (typeof val === 'number' && Number.isFinite(val)) {
        componentBuckets[key].push(val);
      }
    }
    for (const [key, val] of Object.entries(ev.learningSignals) as [
      LearningIndicatorKey,
      number,
    ][]) {
      if (typeof val === 'number' && Number.isFinite(val)) {
        learningBuckets[key].push(val);
      }
    }
  }

  const olqScores = {} as Record<OlqKey, { score: number | null; evidenceCount: number }>;
  const activeOlqAverages: number[] = [];

  for (const def of OLQ_DEFINITIONS) {
    const vals = olqBuckets[def.key];
    const avg = average(vals);
    olqScores[def.key] = { score: avg, evidenceCount: vals.length };
    if (avg !== null) {
      activeOlqAverages.push(avg);
    }
  }

  // OLQ component score derives from all observed OLQ evidence
  const olqComponentScore = average(activeOlqAverages);
  if (olqComponentScore !== null) {
    componentBuckets.olq = [olqComponentScore];
  }

  const componentKeys: LearnersComponentKey[] = [
    'academic',
    'olq',
    'learningHabits',
    'participation',
    'personalGrowth',
  ];

  const components = {} as LearnersScoreBreakdown['components'];
  let weightedSum = 0;
  let activeWeightSum = 0;
  let availableComponents = 0;

  for (const key of componentKeys) {
    const score = key === 'olq' ? olqComponentScore : average(componentBuckets[key]);
    const evidenceCount =
      key === 'olq' ? activeOlqAverages.length : componentBuckets[key].length;

    components[key] = {
      label: COMPONENT_LABELS[key],
      weight: weights[key],
      score,
      evidenceCount,
    };

    if (score !== null) {
      weightedSum += score * weights[key];
      activeWeightSum += weights[key];
      availableComponents += 1;
    }
  }

  const overallScore =
    activeWeightSum > 0 ? Math.round((weightedSum / activeWeightSum) * 10) / 10 : null;

  const observedOlqCount = activeOlqAverages.length;
  const evidenceCoveragePct = Math.round(
    ((availableComponents / 5) * 0.5 + (observedOlqCount / 15) * 0.5) * 100,
  );

  // Build constructive Active & Independent Learning Profile (never uses Active/Passive labels)
  const indicators = {} as Record<
    LearningIndicatorKey,
    { label: string; score: number | null }
  >;
  const scoredIndicators: { key: LearningIndicatorKey; label: string; score: number }[] = [];

  for (const key of Object.keys(LEARNING_INDICATOR_LABELS) as LearningIndicatorKey[]) {
    const score = average(learningBuckets[key]);
    indicators[key] = {
      label: LEARNING_INDICATOR_LABELS[key],
      score,
    };
    if (score !== null) {
      scoredIndicators.push({ key, label: LEARNING_INDICATOR_LABELS[key], score });
    }
  }

  const sortedDesc = [...scoredIndicators].sort((a, b) => b.score - a.score);
  const strengths = sortedDesc
    .filter((i) => i.score >= 75)
    .slice(0, 3)
    .map((i) => `${i.label} (${i.score}/100)`);

  const supportAreas = sortedDesc
    .filter((i) => i.score < 72)
    .slice(-3)
    .map((i) => `Guided scaffolding for ${i.label.toLowerCase()}`);

  const reviewCount = evidence.filter((e) => e.reviewRequired).length;
  if (reviewCount > 0) {
    supportAreas.unshift(
      `${reviewCount} notebook check(s) flagged for gentle one-on-one concept verification`,
    );
  }

  const advisoryNote =
    scoredIndicators.length === 0
      ? 'Insufficient classroom evidence collected yet. Teachers should log notebook checks and classroom observations before interpreting learning habits.'
      : 'This profile reflects observed classroom tasks and habits. Quietness, varied expression styles, or limited participation opportunities never indicate lower learning ability.';

  return {
    overallScore,
    availableComponents,
    evidenceCoveragePct,
    components,
    olqScores,
    learningProfile: {
      indicators,
      strengths:
        strengths.length > 0
          ? strengths
          : ['Steady baseline engagement recorded across initial observations'],
      supportAreas:
        supportAreas.length > 0
          ? supportAreas
          : ['Continue encouraging self-directed inquiry and peer collaboration'],
      advisoryNote,
    },
  };
}

export function validateNotebookBatchInput(input: {
  classSection: string;
  subject: string;
  chapter: string;
  date: string;
  handwriting: HandwritingRating;
  workQuality: WorkQualityRating;
}): string | null {
  if (!input.classSection.trim()) return 'Class & Section is required.';
  if (!input.subject.trim()) return 'Subject is required.';
  if (!input.chapter.trim()) return 'Chapter name is required.';
  if (!input.date.trim()) return 'Date is required.';
  return null;
}

/**
 * Pure P1-1 Evidence Trace ("Why is this score what it is?") for any OLQ trait
 * or Learners Score component. Uses identical deduplication & validation rules as scoring.
 */
export function buildLearnersEvidenceTrace(
  rawEvidence: DevelopmentEvidence[],
  targetType: 'component' | 'olq',
  targetKey: string,
  weights: LearnersWeights = DEFAULT_LEARNERS_WEIGHTS,
): TargetEvidenceTrace {
  const evidence = deduplicateEvidence(rawEvidence).filter((e) => e.validated);
  const breakdown = calculateLearnersScore(evidence, weights);

  if (targetType === 'olq') {
    const olqKey = targetKey as OlqKey;
    const def = OLQ_DEFINITIONS.find((d) => d.key === olqKey);
    const items: EvidenceContributionLine[] = [];
    for (const ev of evidence) {
      const val = ev.olqContributions[olqKey];
      if (typeof val === 'number' && Number.isFinite(val)) {
        items.push({
          evidenceId: ev.id,
          sourceType: ev.sourceType,
          date: ev.date,
          subject: ev.subject,
          summary: ev.summary,
          score: val,
          enteredBy: ev.enteredBy,
          reviewRequired: ev.reviewRequired,
        });
      }
    }
    items.sort((a, b) => b.date.localeCompare(a.date));
    const olqScore = breakdown.olqScores[olqKey]?.score ?? null;
    return {
      targetType: 'olq',
      targetKey,
      targetLabel: def ? `${def.index}. ${def.name} (${def.group})` : targetKey,
      score: olqScore,
      formulaNote:
        items.length === 0
          ? 'No verified evidence logged for this OLQ yet. Missing evidence is excluded rather than scored as zero.'
          : `Arithmetic mean of ${items.length} deduplicated verified evidence record(s).`,
      items,
    };
  }

  const compKey = targetKey as LearnersComponentKey;
  const comp = breakdown.components[compKey];
  if (compKey === 'olq') {
    const activeOlqs = OLQ_DEFINITIONS.map((d) => ({
      def: d,
      stat: breakdown.olqScores[d.key],
    })).filter((entry) => entry.stat.score !== null);

    const items: EvidenceContributionLine[] = activeOlqs.map((entry) => ({
      evidenceId: `olq-avg-${entry.def.key}`,
      sourceType: 'teacher_observation',
      date: 'Active Term',
      subject: entry.def.group,
      summary: `${entry.def.index}. ${entry.def.name} (${entry.stat.evidenceCount} evidence items)`,
      score: entry.stat.score as number,
      enteredBy: 'Verified OLQ Rollup',
    }));

    return {
      targetType: 'component',
      targetKey,
      targetLabel: comp?.label ?? 'OLQ Development',
      score: comp?.score ?? null,
      weightPct: comp?.weight,
      formulaNote:
        items.length === 0
          ? 'No OLQ evidence collected yet; excluded from denominator without zero penalty.'
          : `Mean across ${items.length} observed OLQ qualities (weight ${comp?.weight ?? 30}%).`,
      items,
    };
  }

  const items: EvidenceContributionLine[] = [];
  for (const ev of evidence) {
    const val = ev.componentContributions[compKey];
    if (typeof val === 'number' && Number.isFinite(val)) {
      items.push({
        evidenceId: ev.id,
        sourceType: ev.sourceType,
        date: ev.date,
        subject: ev.subject,
        summary: ev.summary,
        score: val,
        enteredBy: ev.enteredBy,
        reviewRequired: ev.reviewRequired,
      });
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date));

  return {
    targetType: 'component',
    targetKey,
    targetLabel: comp?.label ?? targetKey,
    score: comp?.score ?? null,
    weightPct: comp?.weight,
    formulaNote:
      items.length === 0
        ? 'No verified evidence for this component yet; weights re-normalize across available components.'
        : `Mean of ${items.length} deduplicated evidence record(s) contributing to ${comp?.label ?? targetKey} (weight ${comp?.weight ?? 0}%).`,
    items,
  };
}

