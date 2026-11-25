import type { ExamMark, StudentRecord } from '../types';
import type {
  AbacusSessionRecord,
  ChapterCoverageScore,
  ChapterLearningBlueprint,
  CoachOverrideRecord,
  DifficultyBand,
  ExperientialSimulationAsset,
  GameFormatType,
  InteractiveGameAsset,
  InteractiveLeaderboardRow,
  InteractiveLearningAttempt,
  LearningConceptNode,
  PersonalizedCoachPlan,
  StudentBadgeSummary,
} from '../types/interactiveLearning';

export const GAME_FORMAT_CATALOG: Record<
  GameFormatType,
  { label: string; mechanicFamily: 'classify' | 'match' | 'memory' | 'grid_word' | 'sequence' | 'label' | 'choice' | 'flashcard' | 'error_fix'; idealFor: string }
> = {
  drag_and_drop: { label: 'Drag & Drop Platter', mechanicFamily: 'classify', idealFor: 'Sorting examples, food groups, parts & properties' },
  matching: { label: 'Concept Matching', mechanicFamily: 'match', idealFor: 'Term-to-definition, formula-to-unit, event-to-year pairs' },
  memory: { label: 'Memory Flip Cards', mechanicFamily: 'memory', idealFor: 'Vocabulary, symbols, organelle-function recall' },
  crossword: { label: 'Interactive Crossword', mechanicFamily: 'grid_word', idealFor: 'Key chapter terminology and spelling reinforcement' },
  word_search: { label: 'Chapter Word Search', mechanicFamily: 'grid_word', idealFor: 'Early-grade vocabulary recognition and concept recall' },
  sequence_building: { label: 'Sequence Builder', mechanicFamily: 'sequence', idealFor: 'Biological processes, historical timelines, proof steps' },
  concept_classification: { label: 'Concept Classification', mechanicFamily: 'classify', idealFor: 'Categorizing mixtures, living organisms, angles, clauses' },
  diagram_labelling: { label: 'Diagram Labelling', mechanicFamily: 'label', idealFor: 'Anatomy, plant cells, circuits, maps, geometry figures' },
  interactive_quiz: { label: 'Interactive Concept Quiz', mechanicFamily: 'choice', idealFor: 'Checkpoints and multi-concept conceptual reasoning' },
  timed_challenge: { label: 'Timed Mastery Sprint', mechanicFamily: 'choice', idealFor: 'Fluency checks after conceptual accuracy is established' },
  puzzle_solving: { label: 'Logic Puzzle Solver', mechanicFamily: 'choice', idealFor: 'Deduction, equations, pattern rules' },
  mystery_solving: { label: 'Mystery Case Solver', mechanicFamily: 'choice', idealFor: 'Clue-based scientific & historical investigation' },
  virtual_treasure_hunt: { label: 'Virtual Treasure Hunt', mechanicFamily: 'choice', idealFor: 'Multi-stage geography & discovery quests' },
  scientific_detective: { label: 'Scientific Detective', mechanicFamily: 'choice', idealFor: 'Lab evidence analysis and hypothesis verification' },
  math_challenge: { label: 'Mathematical Challenge', mechanicFamily: 'choice', idealFor: 'Stepwise equations, fractions, ratio & geometry problems' },
  simulation_game: { label: 'Simulation Decision Game', mechanicFamily: 'choice', idealFor: 'Predicting system outcomes when variables change' },
  real_life_decision: { label: 'Real-Life Decision Lab', mechanicFamily: 'choice', idealFor: 'Civics, sustainability, nutrition & personal finance choices' },
  error_identification: { label: 'Spot & Fix the Error', mechanicFamily: 'error_fix', idealFor: 'Grammar correction, math bug hunting, misconception repair' },
  flashcard_challenge: { label: 'Active Recall Flashcards', mechanicFamily: 'flashcard', idealFor: 'Rapid self-tested revision of theorems, dates & definitions' },
  scenario_problem_solving: { label: 'Scenario Problem Solving', mechanicFamily: 'choice', idealFor: 'Applied word problems & real-world case analysis' },
};

export const ALL_20_GAME_FORMATS = Object.keys(GAME_FORMAT_CATALOG) as GameFormatType[];

/**
 * Pedagogical game-selection logic: selects diverse, subject- and concept-appropriate
 * formats rather than repeating the same game for every concept.
 */
export function selectBestGameFormatForConcept(params: {
  conceptTitle: string;
  subject: string;
  classLevel: number;
  hasDiagramOrProcess?: boolean;
  indexInChapter?: number;
}): GameFormatType {
  const title = params.conceptTitle.toLowerCase();
  const sub = params.subject.toLowerCase();
  const idx = params.indexInChapter ?? 0;

  if (title.includes('diagram') || title.includes('structure') || title.includes('organ') || title.includes('part')) {
    return 'diagram_labelling';
  }
  if (title.includes('cycle') || title.includes('process') || title.includes('stage') || title.includes('timeline') || title.includes('step')) {
    return 'sequence_building';
  }
  if (title.includes('type') || title.includes('classif') || title.includes('group') || title.includes('nutrition') || title.includes('nutrient')) {
    return idx % 2 === 0 ? 'drag_and_drop' : 'concept_classification';
  }
  if (sub.includes('math')) {
    const mathPool: GameFormatType[] = ['math_challenge', 'error_identification', 'puzzle_solving', 'matching', 'scenario_problem_solving'];
    return mathPool[idx % mathPool.length];
  }
  if (sub.includes('science') || sub.includes('bio') || sub.includes('phys') || sub.includes('chem')) {
    if (params.hasDiagramOrProcess) return idx % 2 === 0 ? 'scientific_detective' : 'simulation_game';
    const sciPool: GameFormatType[] = ['scientific_detective', 'matching', 'mystery_solving', 'drag_and_drop', 'crossword'];
    return sciPool[idx % sciPool.length];
  }
  if (sub.includes('social') || sub.includes('hist') || sub.includes('geo') || sub.includes('civics')) {
    const socPool: GameFormatType[] = ['virtual_treasure_hunt', 'real_life_decision', 'sequence_building', 'matching', 'mystery_solving'];
    return socPool[idx % socPool.length];
  }
  if (sub.includes('english') || sub.includes('hindi') || sub.includes('lang')) {
    const langPool: GameFormatType[] = ['error_identification', 'word_search', 'memory', 'scenario_problem_solving', 'flashcard_challenge'];
    return langPool[idx % langPool.length];
  }
  const fallbackPool: GameFormatType[] = ['matching', 'interactive_quiz', 'flashcard_challenge', 'crossword', 'timed_challenge'];
  return fallbackPool[idx % fallbackPool.length];
}

/**
 * Calculates the official Chapter Coverage Score STRICTLY from approved assets
 * and eligible concepts (unapproved Draft / Pending Review / Rejected assets never inflate coverage).
 */
export function calculateChapterCoverageScore(params: {
  blueprint: ChapterLearningBlueprint;
  games: InteractiveGameAsset[];
  experientialAssets: ExperientialSimulationAsset[];
}): ChapterCoverageScore {
  const { blueprint, games, experientialAssets } = params;
  const concepts = blueprint.concepts || [];

  const chapterGames = games.filter((g) => g.chapterId === blueprint.id);
  const approvedGames = chapterGames.filter((g) => g.approvalStatus === 'Approved');
  const chapterExp = experientialAssets.filter((e) => e.chapterId === blueprint.id);
  const approvedExp = chapterExp.filter((e) => e.approvalStatus === 'Approved');

  const eligibleExplanations = concepts.filter((c) => c.eligibleComponents.explanation);
  const approvedExplanations = eligibleExplanations.filter(
    (c) => c.explanationApproved && blueprint.approvalStatus === 'Approved',
  );

  const eligibleGames = concepts.filter((c) => c.eligibleComponents.game);
  const coveredGameConceptIds = new Set(approvedGames.map((g) => g.conceptId));
  const approvedGameConcepts = eligibleGames.filter((c) => coveredGameConceptIds.has(c.conceptId));

  const eligibleVisuals = concepts.filter((c) => c.eligibleComponents.visual);
  const coveredExpConceptIds = new Set(approvedExp.map((e) => e.conceptId));
  const approvedVisuals = eligibleVisuals.filter(
    (c) =>
      blueprint.approvalStatus === 'Approved' &&
      (c.hasApprovedVisualExplanation || coveredExpConceptIds.has(c.conceptId)),
  );

  const eligibleExperiential = concepts.filter((c) => c.eligibleComponents.experiential);
  const approvedExperiential = eligibleExperiential.filter((c) =>
    coveredExpConceptIds.has(c.conceptId),
  );

  const eligibleAssessments = concepts.filter((c) => c.eligibleComponents.assessment);
  const approvedAssessments = eligibleAssessments.filter(
    (c) =>
      (blueprint.approvalStatus === 'Approved' && c.hasApprovedAssessment) ||
      coveredGameConceptIds.has(c.conceptId),
  );

  const pct = (num: number, den: number) => (den <= 0 ? 100 : Math.min(100, Math.round((num / den) * 100)));

  const conceptExplanationsPct = pct(approvedExplanations.length, eligibleExplanations.length);
  const gamesPct = pct(approvedGameConcepts.length, eligibleGames.length);
  const visualExplanationsPct = pct(approvedVisuals.length, eligibleVisuals.length);
  const experientialActivitiesPct = pct(approvedExperiential.length, eligibleExperiential.length);
  const assessmentsPct = pct(approvedAssessments.length, eligibleAssessments.length);

  // Weighted overall coverage across the 5 components
  const overallCoveragePct = Math.round(
    conceptExplanationsPct * 0.25 +
      gamesPct * 0.2 +
      visualExplanationsPct * 0.2 +
      experientialActivitiesPct * 0.2 +
      assessmentsPct * 0.15,
  );

  const pendingReviewAssetsCount =
    (blueprint.approvalStatus === 'Pending Review' ? 1 : 0) +
    chapterGames.filter((g) => g.approvalStatus === 'Pending Review').length +
    chapterExp.filter((e) => e.approvalStatus === 'Pending Review').length;

  return {
    chapterId: blueprint.id,
    classLevel: blueprint.classLevel,
    subject: blueprint.subject,
    chapterTitle: blueprint.chapterTitle,
    overallCoveragePct,
    conceptExplanationsPct,
    gamesPct,
    visualExplanationsPct,
    experientialActivitiesPct,
    assessmentsPct,
    approvedConceptsCount: approvedExplanations.length,
    totalEligibleConcepts: concepts.length,
    pendingReviewAssetsCount,
  };
}

/**
 * Separates true concept mastery from passive time-spent or mere clicks:
 * a concept is only "Mastered" when completed with >= 75% verified accuracy.
 */
export function isAttemptMastered(attempt: Pick<InteractiveLearningAttempt, 'status' | 'accuracyPct'>): boolean {
  return attempt.status === 'completed' && attempt.accuracyPct >= 75;
}

/**
 * Balanced XP reward formula rewarding accuracy, effort, and improvement (never speed alone).
 */
export function computeBalancedXp(params: {
  accuracyPct: number;
  completed: boolean;
  previousBestAccuracyPct?: number | null;
  timeSpentSec: number;
}): number {
  const effortBase = params.completed ? 30 : 10;
  const accuracyPoints = Math.round((Math.max(0, Math.min(100, params.accuracyPct)) / 100) * 50);
  const improvementBonus =
    params.previousBestAccuracyPct !== undefined &&
    params.previousBestAccuracyPct !== null &&
    params.accuracyPct > params.previousBestAccuracyPct
      ? Math.min(25, Math.round((params.accuracyPct - params.previousBestAccuracyPct) * 1.2))
      : 0;
  const thoughtfulPaceBonus = params.timeSpentSec >= 15 ? 10 : 0;
  return effortBase + accuracyPoints + improvementBonus + thoughtfulPaceBonus;
}

export function computeStudentBadges(params: {
  attempts: InteractiveLearningAttempt[];
  abacusSessions: AbacusSessionRecord[];
  blueprints: ChapterLearningBlueprint[];
}): StudentBadgeSummary[] {
  const completedAttempts = params.attempts.filter((a) => a.status === 'completed');
  const masteredAttempts = completedAttempts.filter(isAttemptMastered);
  const sciMastered = masteredAttempts.filter((a) => a.subject.toLowerCase().includes('science')).length;
  const mathMastered = masteredAttempts.filter((a) => a.subject.toLowerCase().includes('math')).length;
  const avgAcc =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((s, a) => s + a.accuracyPct, 0) / completedAttempts.length)
      : 0;
  const abacusAccurate = params.abacusSessions.filter((s) => s.accuracyPct >= 80).length;
  const uniqueDays = new Set([
    ...params.attempts.map((a) => a.updatedAt.slice(0, 10)),
    ...params.abacusSessions.map((s) => s.completedAt.slice(0, 10)),
  ]).size;

  return [
    {
      id: 'badge-chapter-medal',
      title: 'Chapter Completion Medal',
      category: 'chapter',
      description: 'Master at least 3 interactive chapter activities with 75%+ accuracy.',
      earned: masteredAttempts.length >= 3,
      progressPct: Math.min(100, Math.round((masteredAttempts.length / 3) * 100)),
    },
    {
      id: 'badge-science-explorer',
      title: 'Science Explorer',
      category: 'science',
      description: 'Complete 2 Science experiential labs or detective games with mastery.',
      earned: sciMastered >= 2,
      progressPct: Math.min(100, Math.round((sciMastered / 2) * 100)),
    },
    {
      id: 'badge-math-master',
      title: 'Mathematics Master',
      category: 'math',
      description: 'Achieve mastery in 2 Mathematics challenges or geometry labs.',
      earned: mathMastered >= 2,
      progressPct: Math.min(100, Math.round((mathMastered / 2) * 100)),
    },
    {
      id: 'badge-abacus-champion',
      title: 'Abacus Champion',
      category: 'abacus',
      description: 'Complete 2 Soroban or Mental Maths sessions at 80%+ accuracy.',
      earned: abacusAccurate >= 2,
      progressPct: Math.min(100, Math.round((abacusAccurate / 2) * 100)),
    },
    {
      id: 'badge-accuracy-star',
      title: 'Precision & Accuracy Star',
      category: 'accuracy',
      description: 'Maintain an average accuracy of 85%+ across completed activities.',
      earned: completedAttempts.length >= 2 && avgAcc >= 85,
      progressPct: completedAttempts.length === 0 ? 0 : Math.min(100, Math.round((avgAcc / 85) * 100)),
    },
    {
      id: 'badge-consistency',
      title: 'Steady Learner Streak',
      category: 'consistency',
      description: 'Practice across 3 distinct study days with consistent effort.',
      earned: uniqueDays >= 3,
      progressPct: Math.min(100, Math.round((uniqueDays / 3) * 100)),
    },
  ];
}

export function buildInteractiveLeaderboard(params: {
  students: StudentRecord[];
  attempts: InteractiveLearningAttempt[];
  abacusSessions: AbacusSessionRecord[];
}): InteractiveLeaderboardRow[] {
  const rows: InteractiveLeaderboardRow[] = [];

  for (const stu of params.students) {
    const stuAtt = params.attempts.filter((a) => a.studentId === stu.id);
    const stuAb = params.abacusSessions.filter((s) => s.studentId === stu.id);
    if (stuAtt.length === 0 && stuAb.length === 0) continue;

    const totalXp =
      stuAtt.reduce((s, a) => s + a.xpEarned, 0) + stuAb.reduce((s, a) => s + a.xpEarned, 0);
    const completed = stuAtt.filter((a) => a.status === 'completed');
    const accuracySamples = [
      ...completed.map((a) => a.accuracyPct),
      ...stuAb.map((s) => s.accuracyPct),
    ];
    const avgAccuracyPct =
      accuracySamples.length > 0
        ? Math.round(accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length)
        : 0;
    const masteredConcepts = new Set(completed.filter(isAttemptMastered).map((a) => a.conceptId));
    const uniqueDays = new Set([
      ...stuAtt.map((a) => a.updatedAt.slice(0, 10)),
      ...stuAb.map((s) => s.completedAt.slice(0, 10)),
    ]).size;

    // Healthy composite score weighting accuracy + mastery + consistency + XP (not speed alone)
    const improvementBonus = Math.min(30, uniqueDays * 5 + masteredConcepts.size * 4);
    const compositeRankScore = Math.round(
      avgAccuracyPct * 0.45 + masteredConcepts.size * 12 + uniqueDays * 6 + totalXp * 0.08,
    );

    rows.push({
      studentId: stu.id,
      studentName: stu.name,
      classSection: stu.classSection,
      totalXp,
      level: Math.max(1, Math.floor(totalXp / 180) + 1),
      avgAccuracyPct,
      masteredConceptsCount: masteredConcepts.size,
      streakDays: Math.max(1, uniqueDays),
      improvementBonus,
      compositeRankScore,
    });
  }

  return rows.sort((a, b) => b.compositeRankScore - a.compositeRankScore).slice(0, 25);
}

export function buildPersonalizedCoachPlan(params: {
  studentId: string;
  blueprints: ChapterLearningBlueprint[];
  games: InteractiveGameAsset[];
  experientialAssets: ExperientialSimulationAsset[];
  attempts: InteractiveLearningAttempt[];
  abacusSessions: AbacusSessionRecord[];
  examMarks?: ExamMark[];
  teacherOverride?: CoachOverrideRecord | null;
}): PersonalizedCoachPlan {
  const stuAttempts = params.attempts.filter((a) => a.studentId === params.studentId);
  const conceptLookup = new Map<string, { title: string; subject: string }>();
  for (const bp of params.blueprints) {
    for (const c of bp.concepts) {
      conceptLookup.set(c.conceptId, { title: c.title, subject: bp.subject });
    }
  }

  const byConcept = new Map<string, { scores: number[]; mistakes: string[]; subject: string; title: string }>();
  for (const a of stuAttempts) {
    const meta = conceptLookup.get(a.conceptId) || { title: a.assetTitle, subject: a.subject };
    const entry = byConcept.get(a.conceptId) || {
      scores: [],
      mistakes: [],
      subject: meta.subject,
      title: meta.title,
    };
    entry.scores.push(a.accuracyPct);
    entry.mistakes.push(...(a.mistakes || []));
    byConcept.set(a.conceptId, entry);
  }

  const weakConcepts: PersonalizedCoachPlan['weakConcepts'] = [];
  const strongConcepts: PersonalizedCoachPlan['strongConcepts'] = [];
  const mistakeFrequency = new Map<string, number>();

  for (const [conceptId, info] of byConcept.entries()) {
    const avg = Math.round(info.scores.reduce((x, y) => x + y, 0) / info.scores.length);
    for (const m of info.mistakes) {
      mistakeFrequency.set(m, (mistakeFrequency.get(m) || 0) + 1);
    }
    if (avg < 75) {
      weakConcepts.push({
        conceptId,
        title: info.title,
        subject: info.subject,
        accuracyPct: avg,
        mistakes: Array.from(new Set(info.mistakes)).slice(0, 3),
      });
    } else {
      strongConcepts.push({
        conceptId,
        title: info.title,
        subject: info.subject,
        accuracyPct: avg,
      });
    }
  }

  const repeatedMistakes = Array.from(mistakeFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text, count]) => (count > 1 ? `${text} (${count}×)` : text));

  const overallAvg =
    stuAttempts.length > 0
      ? Math.round(stuAttempts.reduce((s, a) => s + a.accuracyPct, 0) / stuAttempts.length)
      : 72;

  const autoDifficulty: DifficultyBand =
    overallAvg >= 86 ? 'Advanced' : overallAvg >= 68 ? 'Intermediate' : 'Foundation';
  const recommendedDifficulty = params.teacherOverride?.recommendedDifficulty || autoDifficulty;

  const recommendedActivities: PersonalizedCoachPlan['recommendedActivities'] = [];
  const approvedGames = params.games.filter((g) => g.approvalStatus === 'Approved');
  const approvedExp = params.experientialAssets.filter((e) => e.approvalStatus === 'Approved');

  // Prioritize experiential visualizations & games for weak concepts first
  for (const weak of weakConcepts.slice(0, 2)) {
    const expMatch = approvedExp.find((e) => e.conceptId === weak.conceptId);
    if (expMatch) {
      recommendedActivities.push({
        assetId: expMatch.id,
        assetType: 'experiential',
        title: expMatch.title,
        reason: `Visual re-teaching for ${weak.title} (${weak.accuracyPct}% current accuracy).`,
      });
    }
    const gameMatch = approvedGames.find((g) => g.conceptId === weak.conceptId);
    if (gameMatch) {
      recommendedActivities.push({
        assetId: gameMatch.id,
        assetType: 'game',
        title: gameMatch.title,
        reason: `Targeted practice to strengthen ${weak.title}.`,
      });
    }
  }

  // Recommend unattempted approved experiential labs and games
  const attemptedAssetIds = new Set(stuAttempts.map((a) => a.assetId));
  for (const exp of approvedExp) {
    if (recommendedActivities.length >= 4) break;
    if (!attemptedAssetIds.has(exp.id) && !recommendedActivities.some((r) => r.assetId === exp.id)) {
      recommendedActivities.push({
        assetId: exp.id,
        assetType: 'experiential',
        title: exp.title,
        reason: `Interactive ${exp.subject} simulation recommended for active concept mastery.`,
      });
    }
  }
  for (const g of approvedGames) {
    if (recommendedActivities.length >= 5) break;
    if (!attemptedAssetIds.has(g.id) && !recommendedActivities.some((r) => r.assetId === g.id)) {
      recommendedActivities.push({
        assetId: g.id,
        assetType: 'game',
        title: g.title,
        reason: `${GAME_FORMAT_CATALOG[g.gameFormat]?.label || 'Interactive game'} aligned to ${recommendedDifficulty} level.`,
      });
    }
  }

  const stuAbacus = params.abacusSessions.filter((s) => s.studentId === params.studentId);
  const nextAbacusLevel =
    stuAbacus.length > 0 ? Math.max(...stuAbacus.map((s) => s.recommendedNextLevel)) : 1;
  recommendedActivities.push({
    assetId: `abacus-level-${nextAbacusLevel}`,
    assetType: 'abacus',
    title: `Soroban Abacus Level ${nextAbacusLevel}`,
    reason: '10-minute daily mental numeracy and place-value fluency workout.',
  });

  const revisionSchedule = [
    {
      dayLabel: 'Today',
      focus: weakConcepts[0]
        ? `Revisit ${weakConcepts[0].title} via interactive simulation + checkpoint`
        : `Explore ${approvedExp[0]?.title || 'Human Digestive System'} experiential lab`,
      durationMin: 15,
    },
    {
      dayLabel: 'Tomorrow',
      focus: `Abacus Level ${nextAbacusLevel} bead accuracy & mental flash numbers`,
      durationMin: 12,
    },
    {
      dayLabel: 'Day 3',
      focus: approvedGames[0]
        ? `Play ${approvedGames[0].title} targeting 85%+ mastery`
        : 'Complete 2 chapter concept games',
      durationMin: 15,
    },
  ];

  const reTeachingNote = params.teacherOverride?.teacherNote
    ? `Teacher Guidance: ${params.teacherOverride.teacherNote}`
    : weakConcepts.length > 0
      ? `Focus first on ${weakConcepts[0].title} (${weakConcepts[0].subject}). Walk through the visual process step-by-step before retrying the interactive challenge at ${recommendedDifficulty} difficulty.`
      : `Great momentum! Your recent activities show steady conceptual understanding (${overallAvg}% average accuracy). Advance to ${recommendedDifficulty} challenges and keep your daily revision streak alive.`;

  return {
    studentId: params.studentId,
    weakConcepts,
    strongConcepts,
    repeatedMistakes,
    recommendedDifficulty,
    recommendedActivities,
    revisionSchedule,
    reTeachingNote,
    teacherOverride: params.teacherOverride || null,
  };
}

export function buildBlueprintFromAnalysisInput(params: {
  schoolId: string;
  academicSession: string;
  board: ChapterLearningBlueprint['board'];
  classLevel: ChapterLearningBlueprint['classLevel'];
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  teachingLanguage: string;
  ageGroup: string;
  createdBy: string;
  aiData: {
    overview: string;
    topics: Array<{ title: string; subtopics: string[] }>;
    concepts: Array<{
      title: string;
      topicTitle: string;
      explanation: string;
      prerequisites: string[];
      difficulty: DifficultyBand;
      isDifficult: boolean;
      diagramsAndProcesses: string[];
      practicalApplications: string[];
      learningObjectives: string[];
      suitableForAnimation: boolean;
      suitableForSimulation: boolean;
      suitableForAbacusOrMathVis: boolean;
    }>;
    suggestedGames: string[];
    suggestedAnimations: string[];
    suggestedSimulations: string[];
    suggestedExperiments: string[];
    assessmentRecommendations: string[];
    revisionActivities: string[];
  };
  aiGenerated: boolean;
}): ChapterLearningBlueprint {
  const nowIso = new Date().toISOString();
  const slug = `${params.classLevel}-${params.subject}-${params.chapterTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 42);
  const id = `bp-${params.schoolId.slice(-6)}-${slug}-${Date.now().toString(36).slice(-4)}`;

  const topics = params.aiData.topics.map((t, idx) => ({
    topicId: `${id}-t${idx + 1}`,
    title: t.title,
    subtopics: t.subtopics || [],
  }));

  const concepts: LearningConceptNode[] = params.aiData.concepts.map((c, idx) => {
    const matchedTopic =
      topics.find((t) => t.title.toLowerCase() === (c.topicTitle || '').toLowerCase()) ||
      topics[idx % Math.max(1, topics.length)] || { topicId: `${id}-t1`, title: params.chapterTitle };
    const recommendedFormats: LearningConceptNode['recommendedFormats'] = ['explanation', 'game', 'assessment'];
    if (c.suitableForAnimation || c.diagramsAndProcesses.length > 0) recommendedFormats.push('visual');
    if (c.suitableForSimulation) recommendedFormats.push('experiential');
    if (c.suitableForAbacusOrMathVis) recommendedFormats.push('abacus');

    const suggestedGameFormat = selectBestGameFormatForConcept({
      conceptTitle: c.title,
      subject: params.subject,
      classLevel: params.classLevel,
      hasDiagramOrProcess: c.diagramsAndProcesses.length > 0 || c.suitableForSimulation,
      indexInChapter: idx,
    });

    return {
      conceptId: `${id}-c${idx + 1}`,
      topicId: matchedTopic.topicId,
      title: c.title,
      explanation: c.explanation,
      explanationApproved: false,
      prerequisites: c.prerequisites || [],
      difficulty: c.difficulty || 'Intermediate',
      isDifficult: Boolean(c.isDifficult),
      diagramsAndProcesses: c.diagramsAndProcesses || [],
      practicalApplications: c.practicalApplications || [],
      learningObjectives: c.learningObjectives || [],
      recommendedFormats,
      suggestedGameFormat,
      suggestedExperientialFormat: c.suitableForSimulation
        ? 'interactive_simulation'
        : c.suitableForAnimation
          ? 'process_animation'
          : undefined,
      eligibleComponents: {
        explanation: true,
        game: true,
        visual: Boolean(c.suitableForAnimation || c.diagramsAndProcesses.length > 0),
        experiential: Boolean(c.suitableForSimulation || c.suitableForAnimation),
        assessment: true,
      },
      hasApprovedVisualExplanation: false,
      hasApprovedAssessment: false,
      sourceReference: `${params.board} Class ${params.classLevel} ${params.subject} · Ch. ${params.chapterNumber}: ${params.chapterTitle}`,
    };
  });

  return {
    id,
    schoolId: params.schoolId,
    academicSession: params.academicSession,
    board: params.board,
    classLevel: params.classLevel,
    subject: params.subject,
    chapterNumber: params.chapterNumber,
    chapterTitle: params.chapterTitle,
    teachingLanguage: params.teachingLanguage,
    ageGroup: params.ageGroup,
    overview: params.aiData.overview,
    topics,
    concepts,
    suggestedGames: params.aiData.suggestedGames,
    suggestedAnimations: params.aiData.suggestedAnimations,
    suggestedSimulations: params.aiData.suggestedSimulations,
    suggestedExperiments: params.aiData.suggestedExperiments,
    assessmentRecommendations: params.aiData.assessmentRecommendations,
    revisionActivities: params.aiData.revisionActivities,
    approvalStatus: 'Pending Review',
    version: 1,
    aiGenerated: params.aiGenerated,
    createdBy: params.createdBy,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}
