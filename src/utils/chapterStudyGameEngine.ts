import type {
  ChapterVisualStudyPack,
  FlowchartStage,
  MindmapBranch,
} from './chapterVisualStudyEngine';

export type StudyGameStageId =
  | 'concept_match'
  | 'sequence_builder'
  | 'trap_buster'
  | 'boss_blitz'
  | 'mistake_recovery'
  | 'victory';

export interface ConceptMatchPair {
  id: string;
  term: string;
  definition: string;
  cue: string;
}

export interface SequenceItem {
  id: string;
  stepNumber: number;
  title: string;
  headline: string;
  connectorLabel: string;
}

export interface TrapBusterCard {
  id: string;
  statement: string;
  isTrap: boolean; // true = common exam mistake/trap, false = true high-yield concept
  explanation: string;
  topicTag: string;
}

export interface BlitzQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  topicTag: string;
}

export interface ChapterStudyGameDeck {
  chapterId: string;
  chapterTitle: string;
  subject: string;
  classNumber: number;
  mnemonic: string;
  centralIdea: string;
  matchPairs: ConceptMatchPair[];
  sequenceCorrectOrder: SequenceItem[];
  sequenceScrambled: SequenceItem[];
  trapCards: TrapBusterCard[];
  blitzQuestions: BlitzQuestion[];
  totalChallengeCount: number;
}

export interface ChapterMasteryRecord {
  chapterId: string;
  chapterTitle?: string;
  subject?: string;
  classNumber?: number;
  bestMasteryPct: number;
  stars: 1 | 2 | 3;
  bestXp: number;
  bestStreak?: number;
  timedBestPct?: number;
  fastestTimedRatio?: number; // timeUsed / timeLimit (lower is faster)
  zeroTrapMistakeClears?: number;
  perfectRecoveryClears?: number;
  completedCount: number;
  lastPlayedIso: string;
}

export type ChapterBadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface ChapterMasteryBadgeDef {
  id: string;
  title: string;
  description: string;
  tier: ChapterBadgeTier;
  targetCount: number;
  unitLabel: string;
}

export interface ChapterMasteryBadgeProgress extends ChapterMasteryBadgeDef {
  unlocked: boolean;
  currentCount: number;
  progressPct: number;
}

export const TIMED_QUIZ_SECONDS_PER_QUESTION = 25;

export const CHAPTER_MASTERY_BADGES: ChapterMasteryBadgeDef[] = [
  {
    id: 'first_chapter',
    title: 'First Chapter Cleared',
    description: 'Complete your first full 4-stage Chapter Mastery revision quest.',
    tier: 'Bronze',
    targetCount: 1,
    unitLabel: 'chapter',
  },
  {
    id: 'timed_quiz_ace',
    title: 'Timed Quiz Ace',
    description: 'Score 85% or higher in Timed Chapter Quiz mode before the clock runs out.',
    tier: 'Gold',
    targetCount: 85,
    unitLabel: '% timed score',
  },
  {
    id: 'speed_scholar',
    title: 'Speed Scholar',
    description: 'Finish a Timed Chapter Quiz with at least 40% of the clock remaining.',
    tier: 'Silver',
    targetCount: 40,
    unitLabel: '% time left',
  },
  {
    id: 'combo_streaker',
    title: 'Combo Streaker',
    description: 'Build an unbroken streak of 5 or more correct recall answers.',
    tier: 'Silver',
    targetCount: 5,
    unitLabel: 'streak',
  },
  {
    id: 'trap_hunter',
    title: 'Exam Trap Hunter',
    description: 'Spot every exam trap in Stage 3 with zero errors.',
    tier: 'Gold',
    targetCount: 1,
    unitLabel: 'clean sweep',
  },
  {
    id: 'perfect_scholar',
    title: 'Perfect 3-Star Scholar',
    description: 'Earn 95%+ mastery and 3 stars on any chapter.',
    tier: 'Gold',
    targetCount: 95,
    unitLabel: '% mastery',
  },
  {
    id: 'recovery_hero',
    title: 'Spaced Recovery Hero',
    description: 'Turn missed concepts into 100% mastered answers during Mistake Recovery.',
    tier: 'Bronze',
    targetCount: 1,
    unitLabel: 'recovery',
  },
  {
    id: 'syllabus_champion',
    title: 'Syllabus Champion',
    description: 'Master 3 or more chapters across your school curriculum.',
    tier: 'Platinum',
    targetCount: 3,
    unitLabel: 'chapters',
  },
];

export function computeTimedQuizBonusXp(params: {
  timedMode: boolean;
  timeRemainingSec: number;
  timeLimitSec: number;
  correctCount: number;
}): number {
  const { timedMode, timeRemainingSec, timeLimitSec, correctCount } = params;
  if (!timedMode || timeLimitSec <= 0 || correctCount <= 0) return 0;
  const remainingRatio = Math.max(0, Math.min(1, timeRemainingSec / timeLimitSec));
  return Math.round(remainingRatio * 120 + correctCount * 10);
}

export function evaluateChapterMasteryBadges(
  records: ChapterMasteryRecord[],
  latestSession?: {
    masteryPct: number;
    bestStreak: number;
    timedMode: boolean;
    timeUsedSec: number;
    timeLimitSec: number;
    zeroTrapMistakes?: boolean;
    perfectRecovery?: boolean;
  },
): ChapterMasteryBadgeProgress[] {
  const totalChaptersCleared = records.length;
  const bestMastery = Math.max(
    0,
    ...records.map((r) => r.bestMasteryPct),
    latestSession?.masteryPct ?? 0,
  );
  const bestStreak = Math.max(
    0,
    ...records.map((r) => r.bestStreak ?? 0),
    latestSession?.bestStreak ?? 0,
  );
  const bestTimedPct = Math.max(
    0,
    ...records.map((r) => r.timedBestPct ?? 0),
    latestSession?.timedMode ? latestSession.masteryPct : 0,
  );

  let bestTimeLeftPct = 0;
  for (const r of records) {
    if (typeof r.fastestTimedRatio === 'number') {
      bestTimeLeftPct = Math.max(bestTimeLeftPct, Math.round((1 - r.fastestTimedRatio) * 100));
    }
  }
  if (latestSession?.timedMode && latestSession.timeLimitSec > 0) {
    const ratioLeft = Math.max(
      0,
      Math.min(1, (latestSession.timeLimitSec - latestSession.timeUsedSec) / latestSession.timeLimitSec),
    );
    bestTimeLeftPct = Math.max(bestTimeLeftPct, Math.round(ratioLeft * 100));
  }

  const trapClears =
    records.reduce((s, r) => s + (r.zeroTrapMistakeClears ?? 0), 0) +
    (latestSession?.zeroTrapMistakes ? 1 : 0);
  const recoveryClears =
    records.reduce((s, r) => s + (r.perfectRecoveryClears ?? 0), 0) +
    (latestSession?.perfectRecovery ? 1 : 0);

  return CHAPTER_MASTERY_BADGES.map((def) => {
    let currentCount = 0;
    switch (def.id) {
      case 'first_chapter':
        currentCount = Math.min(def.targetCount, totalChaptersCleared);
        break;
      case 'timed_quiz_ace':
        currentCount = Math.min(def.targetCount, bestTimedPct);
        break;
      case 'speed_scholar':
        currentCount = Math.min(def.targetCount, bestTimeLeftPct);
        break;
      case 'combo_streaker':
        currentCount = Math.min(def.targetCount, bestStreak);
        break;
      case 'trap_hunter':
        currentCount = Math.min(def.targetCount, trapClears);
        break;
      case 'perfect_scholar':
        currentCount = Math.min(def.targetCount, bestMastery);
        break;
      case 'recovery_hero':
        currentCount = Math.min(def.targetCount, recoveryClears);
        break;
      case 'syllabus_champion':
        currentCount = Math.min(def.targetCount, totalChaptersCleared);
        break;
      default:
        currentCount = 0;
    }
    const unlocked = currentCount >= def.targetCount;
    const progressPct = Math.min(
      100,
      Math.round((currentCount / Math.max(1, def.targetCount)) * 100),
    );
    return {
      ...def,
      unlocked,
      currentCount,
      progressPct,
    };
  });
}

function deterministicHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function deterministicShuffle<T>(items: T[], seedKey: string): T[] {
  const arr = [...items];
  let seed = deterministicHash(seedKey) || 17;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Ensure scrambled order is not identical to original when length > 1
  if (arr.length > 1 && arr.every((item, idx) => item === items[idx])) {
    const first = arr.shift()!;
    arr.push(first);
  }
  return arr;
}

function shorten(text: string, maxLen = 115): string {
  const clean = (text || '').trim().replace(/\s+/g, ' ');
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trim()}…`;
}

function buildMatchPairs(pack: ChapterVisualStudyPack): ConceptMatchPair[] {
  const pairs: ConceptMatchPair[] = [];
  const seenTerms = new Set<string>();

  for (const item of pack.quickRevision.keyItems) {
    const term = item.term.trim();
    if (!term || seenTerms.has(term.toLowerCase())) continue;
    seenTerms.add(term.toLowerCase());
    pairs.push({
      id: `pair-key-${pairs.length + 1}`,
      term,
      definition: shorten(item.definitionOrFormula, 120),
      cue: item.memoryCue,
    });
    if (pairs.length >= 5) break;
  }

  for (const branch of pack.mindmap.branches as MindmapBranch[]) {
    if (pairs.length >= 5) break;
    const term = branch.title.trim();
    if (!term || seenTerms.has(term.toLowerCase())) continue;
    seenTerms.add(term.toLowerCase());
    pairs.push({
      id: `pair-br-${pairs.length + 1}`,
      term,
      definition: shorten(branch.summary || branch.subNodes.join(' · '), 120),
      cue: branch.subNodes[0] || pack.chapter.realLifeAnchor,
    });
  }

  return pairs;
}

function buildSequenceItems(pack: ChapterVisualStudyPack): {
  correct: SequenceItem[];
  scrambled: SequenceItem[];
} {
  const sortedStages = [...pack.flowchart]
    .sort((a: FlowchartStage, b: FlowchartStage) => a.stepNumber - b.stepNumber)
    .slice(0, 5);

  const correct: SequenceItem[] = sortedStages.map((st, idx) => ({
    id: st.id || `seq-${idx + 1}`,
    stepNumber: idx + 1,
    title: st.title,
    headline: shorten(st.headline, 105),
    connectorLabel: st.connectorLabel || `Step ${idx + 1}`,
  }));

  return {
    correct,
    scrambled: deterministicShuffle(correct, `${pack.chapter.id}-sequence`),
  };
}

function buildTrapCards(pack: ChapterVisualStudyPack): TrapBusterCard[] {
  const cards: TrapBusterCard[] = [];

  pack.quickRevision.highYieldBullets.slice(0, 3).forEach((bullet, idx) => {
    cards.push({
      id: `trap-true-${idx + 1}`,
      statement: bullet,
      isTrap: false,
      explanation: `Solid Concept! Remembering this core point directly builds accuracy in "${pack.chapter.title}".`,
      topicTag: pack.chapter.keyTopics[idx % Math.max(1, pack.chapter.keyTopics.length)] || pack.chapter.subject,
    });
  });

  pack.quickRevision.commonMistakes.slice(0, 3).forEach((mistake, idx) => {
    cards.push({
      id: `trap-false-${idx + 1}`,
      statement: mistake,
      isTrap: true,
      explanation: `Exam Trap Spotted! Avoid this pitfall in "${pack.chapter.title}" — check definitions, units, and step order carefully.`,
      topicTag: 'Common Exam Trap',
    });
  });

  return deterministicShuffle(cards, `${pack.chapter.id}-traps`);
}

function buildBlitzQuestions(pack: ChapterVisualStudyPack): BlitzQuestion[] {
  const questions: BlitzQuestion[] = [];

  // Pool of distractor answers drawn strictly from other concepts in this same chapter
  const answerPool = Array.from(
    new Set([
      ...pack.flashcards.map((f) => shorten(f.answer, 110)),
      ...pack.quickRevision.keyItems.map((k) => shorten(k.definitionOrFormula, 110)),
      ...pack.flowchart.map((st) => shorten(st.quickAnswer, 110)),
      ...pack.mindmap.branches.map((b) => shorten(b.summary, 110)),
    ].filter((x) => x.length >= 12)),
  );

  const fallbackDistractors = [
    `Skips the foundational rule of ${pack.chapter.title} without checking intermediate steps.`,
    `Applies an unrelated chapter formula without verifying ${pack.chapter.subject} conditions.`,
    `Ignores real-life verification (${pack.chapter.realLifeAnchor}) and guesses the final answer.`,
  ];

  const makeOptions = (correctAns: string, seedKey: string): { options: string[]; correctIndex: number } => {
    const cleanCorrect = shorten(correctAns, 115);
    const distractors = deterministicShuffle(
      answerPool.filter((a) => a.toLowerCase() !== cleanCorrect.toLowerCase()),
      `${seedKey}-dist`,
    ).slice(0, 3);

    let fIdx = 0;
    while (distractors.length < 3 && fIdx < fallbackDistractors.length) {
      const candidate = fallbackDistractors[fIdx];
      if (candidate.toLowerCase() !== cleanCorrect.toLowerCase()) {
        distractors.push(candidate);
      }
      fIdx += 1;
    }

    const mixed = deterministicShuffle([cleanCorrect, ...distractors], `${seedKey}-opts`);
    return {
      options: mixed,
      correctIndex: mixed.indexOf(cleanCorrect),
    };
  };

  // Questions from Flashcards (covers core active recall)
  pack.flashcards.slice(0, 4).forEach((card, idx) => {
    const { options, correctIndex } = makeOptions(card.answer, `${pack.chapter.id}-fc-${idx}`);
    questions.push({
      id: `blitz-fc-${card.id}`,
      prompt: card.prompt,
      options,
      correctIndex,
      explanation: card.answer,
      hint: card.hint,
      topicTag: card.tag || 'Key Recall',
    });
  });

  // Questions from Flowchart Checkpoints (covers procedural understanding)
  pack.flowchart.slice(0, 2).forEach((stage, idx) => {
    if (!stage.keyQuestion || !stage.quickAnswer) return;
    const { options, correctIndex } = makeOptions(stage.quickAnswer, `${pack.chapter.id}-fl-${idx}`);
    questions.push({
      id: `blitz-fl-${stage.id}`,
      prompt: stage.keyQuestion,
      options,
      correctIndex,
      explanation: stage.quickAnswer,
      hint: `Think about Stage ${stage.stepNumber}: ${stage.title}`,
      topicTag: stage.title,
    });
  });

  // Question from Real-Life Application / Central Idea
  if (pack.notebookLm.briefingFaq[0]) {
    const faq = pack.notebookLm.briefingFaq[0];
    const { options, correctIndex } = makeOptions(faq.answer, `${pack.chapter.id}-faq-0`);
    questions.push({
      id: `blitz-faq-0`,
      prompt: faq.question,
      options,
      correctIndex,
      explanation: faq.answer,
      hint: `Connect "${pack.chapter.title}" to: ${pack.chapter.realLifeAnchor}`,
      topicTag: 'Application Boss',
    });
  }

  return questions.slice(0, 6);
}

/**
 * Generates a complete, 4-stage interactive study game covering an entire chapter
 * (Concept Match + Sequence Builder + Trap Buster + Boss Recall Blitz).
 */
export function buildChapterStudyGameDeck(pack: ChapterVisualStudyPack): ChapterStudyGameDeck {
  const matchPairs = buildMatchPairs(pack);
  const { correct, scrambled } = buildSequenceItems(pack);
  const trapCards = buildTrapCards(pack);
  const blitzQuestions = buildBlitzQuestions(pack);

  const totalChallengeCount =
    matchPairs.length + correct.length + trapCards.length + blitzQuestions.length;

  return {
    chapterId: pack.chapter.id,
    chapterTitle: pack.chapter.title,
    subject: pack.chapter.subject,
    classNumber: pack.chapter.classNumber,
    mnemonic: pack.quickRevision.mnemonic,
    centralIdea: pack.centralIdea,
    matchPairs,
    sequenceCorrectOrder: correct,
    sequenceScrambled: scrambled,
    trapCards,
    blitzQuestions,
    totalChallengeCount,
  };
}

export function computeChapterGameMastery(params: {
  correctActions: number;
  totalAttempts: number;
  mistakesRecovered: number;
  totalMistakes: number;
}): { masteryPct: number; stars: 1 | 2 | 3; badgeLabel: string } {
  const { correctActions, totalAttempts, mistakesRecovered, totalMistakes } = params;
  const rawAccuracy = totalAttempts > 0 ? (correctActions / totalAttempts) * 100 : 100;
  const recoveryBonus =
    totalMistakes > 0 ? Math.round((mistakesRecovered / totalMistakes) * 12) : 6;
  const masteryPct = Math.min(100, Math.max(0, Math.round(rawAccuracy + recoveryBonus)));

  if (masteryPct >= 88) {
    return { masteryPct, stars: 3, badgeLabel: 'Chapter Master · Exam Ready' };
  }
  if (masteryPct >= 68) {
    return { masteryPct, stars: 2, badgeLabel: 'Strong Grasp · Quick Polish Recommended' };
  }
  return { masteryPct, stars: 1, badgeLabel: 'Foundation Built · Replay for 3 Stars' };
}

export interface ChapterMasteryAttemptInput {
  userId: string;
  studentId?: string;
  studentName: string;
  classSection: string;
  classNumber: number;
  subject: string;
  chapterId: string;
  xpEarned: number;
  masteryPct: number;
  accuracyPct: number;
  bestStreak: number;
  timedMode: boolean;
  badgesEarned: string[];
  completedAt: string;
}

export interface AggregatedLeaderboardRow {
  rank: number;
  userId: string;
  studentName: string;
  classSection: string;
  totalXp: number;
  chaptersMastered: number;
  averageMasteryPct: number;
  timedQuizAvgPct: number;
  bestStreak: number;
  badgeCount: number;
  earnedBadgeIds: string[];
  lastPlayedIso: string;
  isCurrentUser: boolean;
}

export interface SubjectChampionSummary {
  subject: string;
  topStudentName: string;
  classSection: string;
  topXp: number;
  averageMasteryPct: number;
  participantCount: number;
  isCurrentUser: boolean;
}

export function normalizeLeaderboardSubject(subject: string): string {
  const clean = (subject || '').trim();
  const lower = clean.toLowerCase();
  if (lower === 'maths' || lower === 'math' || lower === 'mathematics') {
    return 'Mathematics';
  }
  return clean || 'General';
}

export function aggregateChapterMasteryLeaderboard(params: {
  attempts: ChapterMasteryAttemptInput[];
  currentUserId?: string;
  currentStudentId?: string;
  classFilter?: string;
  subjectFilter?: string;
}): AggregatedLeaderboardRow[] {
  const { attempts, currentUserId, currentStudentId, classFilter, subjectFilter } = params;
  const normalizedSubjectFilter =
    subjectFilter && subjectFilter !== 'ALL'
      ? normalizeLeaderboardSubject(subjectFilter).toLowerCase()
      : null;

  const filtered = attempts.filter((a) => {
    if (classFilter && classFilter !== 'ALL') {
      const normalizedFilter = classFilter.replace(/^Class\s+/i, '').trim().toLowerCase();
      const normalizedSec = a.classSection.replace(/^Class\s+/i, '').trim().toLowerCase();
      if (
        normalizedSec !== normalizedFilter &&
        String(a.classNumber) !== normalizedFilter &&
        !normalizedSec.startsWith(`${normalizedFilter}-`)
      ) {
        return false;
      }
    }
    if (normalizedSubjectFilter) {
      if (normalizeLeaderboardSubject(a.subject).toLowerCase() !== normalizedSubjectFilter) {
        return false;
      }
    }
    return true;
  });

  const byUser = new Map<
    string,
    {
      userId: string;
      studentId?: string;
      studentName: string;
      classSection: string;
      bestXpByChapter: Map<string, number>;
      bestMasteryByChapter: Map<string, number>;
      timedScores: number[];
      bestStreak: number;
      badges: Set<string>;
      lastPlayedIso: string;
    }
  >();

  for (const att of filtered) {
    const identityKey = att.studentId ? `stu:${att.studentId}` : `usr:${att.userId}`;
    let bucket = byUser.get(identityKey);
    if (!bucket) {
      bucket = {
        userId: att.userId,
        studentId: att.studentId,
        studentName: att.studentName,
        classSection: att.classSection,
        bestXpByChapter: new Map(),
        bestMasteryByChapter: new Map(),
        timedScores: [],
        bestStreak: 0,
        badges: new Set(),
        lastPlayedIso: att.completedAt,
      };
      byUser.set(identityKey, bucket);
    } else if (currentUserId && att.userId === currentUserId) {
      bucket.userId = currentUserId;
    }

    const prevXp = bucket.bestXpByChapter.get(att.chapterId) ?? 0;
    if (att.xpEarned > prevXp) bucket.bestXpByChapter.set(att.chapterId, att.xpEarned);

    const prevMastery = bucket.bestMasteryByChapter.get(att.chapterId) ?? 0;
    if (att.masteryPct > prevMastery) bucket.bestMasteryByChapter.set(att.chapterId, att.masteryPct);

    if (att.timedMode) bucket.timedScores.push(att.masteryPct);
    if (att.bestStreak > bucket.bestStreak) bucket.bestStreak = att.bestStreak;
    for (const b of att.badgesEarned || []) bucket.badges.add(b);
    if (att.completedAt > bucket.lastPlayedIso) bucket.lastPlayedIso = att.completedAt;
  }

  const rows: AggregatedLeaderboardRow[] = [];
  for (const bucket of byUser.values()) {
    const xpValues = Array.from(bucket.bestXpByChapter.values());
    const masteryValues = Array.from(bucket.bestMasteryByChapter.values());
    const totalXp = xpValues.reduce((s, v) => s + v, 0);
    const chaptersMastered = masteryValues.filter((m) => m >= 70).length;
    const averageMasteryPct =
      masteryValues.length > 0
        ? Math.round(masteryValues.reduce((s, v) => s + v, 0) / masteryValues.length)
        : 0;
    const timedQuizAvgPct =
      bucket.timedScores.length > 0
        ? Math.round(
            bucket.timedScores.reduce((s, v) => s + v, 0) / bucket.timedScores.length,
          )
        : averageMasteryPct;

    rows.push({
      rank: 0,
      userId: bucket.userId,
      studentName: bucket.studentName,
      classSection: bucket.classSection,
      totalXp,
      chaptersMastered,
      averageMasteryPct,
      timedQuizAvgPct,
      bestStreak: bucket.bestStreak,
      badgeCount: bucket.badges.size,
      earnedBadgeIds: Array.from(bucket.badges),
      lastPlayedIso: bucket.lastPlayedIso,
      isCurrentUser: Boolean(
        (currentUserId && bucket.userId === currentUserId) ||
          (currentStudentId && bucket.studentId === currentStudentId),
      ),
    });
  }

  rows.sort((a, b) => {
    if (b.totalXp !== a.totalXp) return b.totalXp - a.totalXp;
    if (b.chaptersMastered !== a.chaptersMastered) return b.chaptersMastered - a.chaptersMastered;
    if (b.timedQuizAvgPct !== a.timedQuizAvgPct) return b.timedQuizAvgPct - a.timedQuizAvgPct;
    return a.studentName.localeCompare(b.studentName);
  });

  return rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
}

export function computeSubjectChampions(params: {
  attempts: ChapterMasteryAttemptInput[];
  currentUserId?: string;
  currentStudentId?: string;
  classFilter?: string;
}): { availableSubjects: string[]; champions: SubjectChampionSummary[] } {
  const { attempts, currentUserId, currentStudentId, classFilter } = params;
  const subjectSet = new Set<string>();
  for (const att of attempts) {
    if (att.subject?.trim()) {
      subjectSet.add(normalizeLeaderboardSubject(att.subject));
    }
  }
  const availableSubjects = Array.from(subjectSet).sort((a, b) => a.localeCompare(b));

  const champions: SubjectChampionSummary[] = [];
  for (const subject of availableSubjects) {
    const board = aggregateChapterMasteryLeaderboard({
      attempts,
      currentUserId,
      currentStudentId,
      classFilter,
      subjectFilter: subject,
    });
    if (board.length === 0) continue;
    const top = board[0];
    champions.push({
      subject,
      topStudentName: top.studentName,
      classSection: top.classSection,
      topXp: top.totalXp,
      averageMasteryPct: top.averageMasteryPct,
      participantCount: board.length,
      isCurrentUser: top.isCurrentUser,
    });
  }

  champions.sort((a, b) => b.topXp - a.topXp || a.subject.localeCompare(b.subject));
  return { availableSubjects, champions };
}

