import type {
  CognitiveAttemptRecord,
  CognitiveGameDefinition,
  DevelopmentEvidence,
  ExamMark,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  StudentRecord,
} from '../types';
import { getCognitiveGameById } from './cognitiveGamesCatalog.ts';
import { computeAdaptiveLevel } from './cognitiveProfileEngine.ts';

export const BELOW_AVERAGE_REPORT_PCT = 65;

export type RecommendationNeedArea =
  | 'Reading & Phonics'
  | 'Multiplication Tables'
  | 'Mathematical Reasoning'
  | 'Writing & Sequencing'
  | 'Focus & Response Accuracy'
  | 'Balanced Enrichment';

export interface CustomGameRecommendation {
  id: string;
  needArea: RecommendationNeedArea;
  severity: 'priority' | 'support' | 'enrichment';
  triggerLabel: string;
  reportScorePct: number | null;
  rationale: string;
  recommendedGames: CognitiveGameDefinition[];
  suggestedLevel: 1 | 2 | 3 | 4 | 5;
}

export interface StudentRecommendationInput {
  student: StudentRecord;
  examMarks: ExamMark[];
  notebookEntries?: NotebookEntry[];
  evidence?: DevelopmentEvidence[];
  breakdown?: LearnersScoreBreakdown;
  cognitiveAttempts: CognitiveAttemptRecord[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
}

function toPct(mark: ExamMark): number {
  if (!mark.maxMarks || mark.maxMarks <= 0) return 0;
  return Math.round((mark.obtainedMarks / mark.maxMarks) * 100);
}

function pickGames(ids: string[]): CognitiveGameDefinition[] {
  return ids
    .map((id) => getCognitiveGameById(id))
    .filter((g): g is CognitiveGameDefinition => Boolean(g));
}

export function computeStudentGameRecommendations(
  input: StudentRecommendationInput,
): CustomGameRecommendation[] {
  const {
    student,
    examMarks,
    notebookEntries = [],
    evidence = [],
    breakdown,
    cognitiveAttempts,
    readingReports = [],
    numeracyReports = [],
  } = input;

  const studentMarks = examMarks.filter((m) => m.studentId === student.id);
  const studentNotebooks = notebookEntries.filter((n) => n.studentId === student.id);
  const studentEvidence = evidence.filter((e) => e.studentId === student.id);
  const studentAttempts = cognitiveAttempts.filter((a) => a.studentId === student.id);
  const studentReading = readingReports.filter((r) => r.studentId === student.id);
  const studentNumeracy = numeracyReports.filter((r) => r.studentId === student.id);
  const latestLowReading = studentReading
    .filter((r) => r.overallPct < BELOW_AVERAGE_REPORT_PCT)
    .sort((a, b) => a.overallPct - b.overallPct)[0];
  const latestLowNumeracy = studentNumeracy
    .filter((r) => r.tablesFluencyPct < BELOW_AVERAGE_REPORT_PCT || r.overallPct < BELOW_AVERAGE_REPORT_PCT)
    .sort((a, b) => a.overallPct - b.overallPct)[0];

  const recommendations: CustomGameRecommendation[] = [];

  // 1. Reading & Phonics report check
  const readingMarks = studentMarks.filter((m) => {
    const subjExam = `${m.subject} ${m.examName}`.toLowerCase();
    if (/(table|tables|multiplication|times table|arithmetic)/.test(subjExam)) {
      return false;
    }
    const text = `${subjExam} ${m.conceptualGap ?? ''}`.toLowerCase();
    return /(reading|phonics|literacy|reading fluency|word fluency|decoding|syllable|spelling|pronunciation|comprehension|english reading|hindi reading|vocabulary)/.test(
      text,
    );
  });

  const lowReadingMark = readingMarks
    .map((m) => ({ mark: m, pct: toPct(m) }))
    .sort((a, b) => a.pct - b.pct)
    .find(
      ({ mark, pct }) =>
        pct < BELOW_AVERAGE_REPORT_PCT ||
        /(phonics|reading|decoding|syllable|spelling|pronunciation)/i.test(
          mark.conceptualGap ?? '',
        ),
    );

  const readingEvidenceGap = studentEvidence.find(
    (e) =>
      /(reading|phonics|decoding|fluency)/i.test(e.summary) &&
      (e.reviewRequired || (e.componentContributions.academic ?? 100) < BELOW_AVERAGE_REPORT_PCT),
  );

  const readingNeedActive =
    Boolean(lowReadingMark) ||
    Boolean(latestLowReading) ||
    Boolean(readingEvidenceGap) ||
    (breakdown?.olqScores.power_of_expression.score !== null &&
      breakdown?.olqScores.power_of_expression.score !== undefined &&
      breakdown.olqScores.power_of_expression.score < BELOW_AVERAGE_REPORT_PCT);

  if (readingNeedActive) {
    const pct = lowReadingMark
      ? lowReadingMark.pct
      : latestLowReading
        ? latestLowReading.overallPct
        : null;
    const triggerLabel = lowReadingMark
      ? `${lowReadingMark.mark.subject} (${lowReadingMark.mark.examName}): ${pct}% — Below ${BELOW_AVERAGE_REPORT_PCT}% target`
      : latestLowReading
        ? `Reading Report (${latestLowReading.month}): ${latestLowReading.overallPct}% (${latestLowReading.readingBand})`
        : readingEvidenceGap
          ? `Classroom Reading Evidence: ${readingEvidenceGap.summary}`
          : `Power of Expression Indicator: ${breakdown?.olqScores.power_of_expression.score}%`;

    recommendations.push({
      id: `rec-reading-${student.id}`,
      needArea: 'Reading & Phonics',
      severity: pct !== null && pct < 55 ? 'priority' : 'support',
      triggerLabel,
      reportScorePct: pct,
      rationale: lowReadingMark?.mark.conceptualGap
        ? `${lowReadingMark.mark.conceptualGap}. Practising sound-letter blends, syllable chunking, and vocabulary recall strengthens reading fluency.`
        : latestLowReading
          ? `${latestLowReading.remarks}. Phonics sound matching and syllable word building reinforce decoding fluency.`
          : 'Reading report is below class benchmark. Phonics sound matching and syllable word building reinforce decoding accuracy without test pressure.',
      recommendedGames: pickGames([
        'phonics-sound-match',
        'syllable-word-builder',
        'word-recall',
      ]),
      suggestedLevel: computeAdaptiveLevel(
        student.classSection,
        studentAttempts,
        'phonics-sound-match',
      ),
    });
  }

  // 2. Multiplication Tables & Arithmetic Fluency report check
  const tableMarks = studentMarks.filter((m) => {
    const text = `${m.subject} ${m.examName} ${m.conceptualGap ?? ''}`.toLowerCase();
    return /(table|tables|multiplication|times table|factor|factors|arithmetic drill)/.test(text);
  });

  const lowTableMark = tableMarks
    .map((m) => ({ mark: m, pct: toPct(m) }))
    .sort((a, b) => a.pct - b.pct)
    .find(
      ({ mark, pct }) =>
        pct < BELOW_AVERAGE_REPORT_PCT ||
        /(table|tables|multiplication|factor)/i.test(mark.conceptualGap ?? ''),
    );

  const tableEvidenceGap = studentEvidence.find(
    (e) =>
      /(table|tables|multiplication)/i.test(e.summary) &&
      (e.reviewRequired || (e.componentContributions.academic ?? 100) < BELOW_AVERAGE_REPORT_PCT),
  );

  if (lowTableMark || latestLowNumeracy || tableEvidenceGap) {
    const pct = lowTableMark
      ? lowTableMark.pct
      : latestLowNumeracy
        ? latestLowNumeracy.tablesFluencyPct
        : null;
    const triggerLabel = lowTableMark
      ? `${lowTableMark.mark.subject} (${lowTableMark.mark.examName}): ${pct}% — Below ${BELOW_AVERAGE_REPORT_PCT}% target`
      : latestLowNumeracy
        ? `Numeracy Report (${latestLowNumeracy.month}): Tables ${latestLowNumeracy.tablesFluencyPct}% · Overall ${latestLowNumeracy.overallPct}%`
        : `Classroom Tables Observation: ${tableEvidenceGap?.summary}`;

    recommendations.push({
      id: `rec-tables-${student.id}`,
      needArea: 'Multiplication Tables',
      severity: pct !== null && pct < 55 ? 'priority' : 'support',
      triggerLabel,
      reportScorePct: pct,
      rationale: lowTableMark?.mark.conceptualGap
        ? `${lowTableMark.mark.conceptualGap}. Rapid times-table recall and factor-grid scanning turn memorised tables into fluent problem solving.`
        : latestLowNumeracy
          ? `${latestLowNumeracy.conceptualGap || latestLowNumeracy.remarks}. Timed table sprints and factor-grid drills help automate 2× to 20× facts.`
          : 'Multiplication tables report is below average. Timed table sprints and multiple-grid games help automate 2× to 20× facts.',
      recommendedGames: pickGames([
        'times-tables-sprint',
        'table-factor-grid',
        'number-detective',
      ]),
      suggestedLevel: computeAdaptiveLevel(
        student.classSection,
        studentAttempts,
        'times-tables-sprint',
      ),
    });
  }

  // 3. General Mathematics / Reasoning mark below average (excluding already-captured table drills)
  const lowGeneralMath = studentMarks
    .filter((m) => !tableMarks.some((tm) => tm.id === m.id))
    .map((m) => ({ mark: m, pct: toPct(m) }))
    .filter(
      ({ mark, pct }) =>
        /(math|mathematics|reasoning|algebra|geometry|science|physics)/i.test(mark.subject) &&
        pct < BELOW_AVERAGE_REPORT_PCT,
    )
    .sort((a, b) => a.pct - b.pct)[0];

  if (lowGeneralMath) {
    recommendations.push({
      id: `rec-math-reasoning-${student.id}`,
      needArea: 'Mathematical Reasoning',
      severity: lowGeneralMath.pct < 55 ? 'priority' : 'support',
      triggerLabel: `${lowGeneralMath.mark.subject} (${lowGeneralMath.mark.examName}): ${lowGeneralMath.pct}% — Below ${BELOW_AVERAGE_REPORT_PCT}% target`,
      reportScorePct: lowGeneralMath.pct,
      rationale: lowGeneralMath.mark.conceptualGap
        ? `${lowGeneralMath.mark.conceptualGap}. Pattern deduction, Sudoku grids, and step-by-step logic puzzles reinforce structured reasoning.`
        : 'Subject assessment indicates extra support needed on multi-step reasoning and numerical patterns.',
      recommendedGames: pickGames(['number-detective', 'sudoku-challenge', 'logic-escape']),
      suggestedLevel: computeAdaptiveLevel(
        student.classSection,
        studentAttempts,
        'number-detective',
      ),
    });
  }

  // 4. Writing neatness / sequential organisation support from notebook checks
  const handwritingNeedsAttention = studentNotebooks.some(
    (n) => n.checked && n.handwriting === 'Non-Readability',
  );
  const incompleteNotebook = studentNotebooks.some(
    (n) => n.checked && (!n.homeworkDone || n.workQuality === 'C'),
  );
  if (handwritingNeedsAttention || incompleteNotebook) {
    recommendations.push({
      id: `rec-writing-seq-${student.id}`,
      needArea: 'Writing & Sequencing',
      severity: 'support',
      triggerLabel: handwritingNeedsAttention
        ? 'Notebook Check: Handwriting readability needs structured pacing'
        : 'Notebook Check: Incomplete homework / step organisation flagged',
      reportScorePct: null,
      rationale:
        'Visual sequencing and step-planning games build careful visual-motor pacing and structured task completion.',
      recommendedGames: pickGames(['focus-trail', 'sequence-recall', 'tower-of-hanoi']),
      suggestedLevel: computeAdaptiveLevel(student.classSection, studentAttempts, 'focus-trail'),
    });
  }

  // 5. Focus & response accuracy from exam anxiety / speed notes or low cognitive practice accuracy
  const focusGapMark = studentMarks.find((m) =>
    /(speed|careless|attention|anxiety|timed|focus)/i.test(m.conceptualGap ?? ''),
  );
  const lowFocusAttempts = studentAttempts.filter(
    (a) =>
      (a.category === 'Visual Attention' || a.category === 'Response Control') &&
      a.accuracyPct < BELOW_AVERAGE_REPORT_PCT,
  );
  if (focusGapMark || lowFocusAttempts.length > 0) {
    recommendations.push({
      id: `rec-focus-${student.id}`,
      needArea: 'Focus & Response Accuracy',
      severity: 'support',
      triggerLabel: focusGapMark
        ? `Assessment Note (${focusGapMark.subject}): ${focusGapMark.conceptualGap}`
        : `Practice Trend: Attention/Response accuracy below ${BELOW_AVERAGE_REPORT_PCT}%`,
      reportScorePct: focusGapMark ? toPct(focusGapMark) : null,
      rationale:
        'Calm selective-attention and impulse-control drills improve accuracy under timed classroom conditions.',
      recommendedGames: pickGames(['go-no-go', 'target-finder', 'colour-conflict']),
      suggestedLevel: computeAdaptiveLevel(student.classSection, studentAttempts, 'go-no-go'),
    });
  }

  // 6. On-track enrichment fallback if no report deficits exist
  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-enrichment-${student.id}`,
      needArea: 'Balanced Enrichment',
      severity: 'enrichment',
      triggerLabel: `All academic & skill reports >= ${BELOW_AVERAGE_REPORT_PCT}% benchmark`,
      reportScorePct: null,
      rationale:
        'All recorded reports are on track. Stretch strategic reasoning and working memory with higher-level cognitive challenges.',
      recommendedGames: pickGames(['chess-tactics', 'logic-escape', 'pattern-detective']),
      suggestedLevel: computeAdaptiveLevel(student.classSection, studentAttempts, 'chess-tactics'),
    });
  }

  const severityOrder = { priority: 0, support: 1, enrichment: 2 };
  return recommendations.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
