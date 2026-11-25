import type {
  EffortActionStep,
  LearnersComponentKey,
  LearnersScoreBreakdown,
  LearnersWeights,
  RankedStudentEntry,
  SchoolRankingsSummary,
  StudentRecord,
  StudentTop3Standing,
  Top3TargetGap,
} from '../types';
import { DEFAULT_LEARNERS_WEIGHTS } from './evidenceEngine.ts';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

const COMPONENT_ACTION_HINTS: Record<LearnersComponentKey, string> = {
  academic: 'Raise periodic/unit assessment scores and resolve conceptual gaps.',
  learningHabits: 'Submit complete, independent homework with readable Work Quality A notebooks.',
  olq: 'Demonstrate consistent organising, responsibility, and initiative in class duties.',
  participation: 'Contribute actively in lab work, morning assemblies, and peer group discussions.',
  personalGrowth: 'Sustain co-curricular, sports, and self-improvement milestones across terms.',
};

const COMPONENT_KEYS: LearnersComponentKey[] = [
  'academic',
  'olq',
  'learningHabits',
  'participation',
  'personalGrowth',
];

function rankStudents(
  students: StudentRecord[],
  breakdowns: Record<string, LearnersScoreBreakdown>,
): RankedStudentEntry[] {
  const scored = students
    .map((st) => {
      const bd = breakdowns[st.id];
      if (!bd || typeof bd.overallScore !== 'number' || !Number.isFinite(bd.overallScore)) {
        return null;
      }
      return {
        studentId: st.id,
        studentName: st.name,
        classSection: st.classSection,
        overallScore: bd.overallScore,
        evidenceCoveragePct: bd.evidenceCoveragePct,
      };
    })
    .filter((entry): entry is Omit<RankedStudentEntry, 'rank'> => entry !== null);

  scored.sort((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
    if (b.evidenceCoveragePct !== a.evidenceCoveragePct) {
      return b.evidenceCoveragePct - a.evidenceCoveragePct;
    }
    return a.studentName.localeCompare(b.studentName);
  });

  const ranked: RankedStudentEntry[] = [];
  for (let i = 0; i < scored.length; i++) {
    const prev = ranked[i - 1];
    const rank =
      prev && prev.overallScore === scored[i].overallScore ? prev.rank : i + 1;
    ranked.push({ ...scored[i], rank });
  }
  return ranked;
}

export function buildEffortSteps(
  breakdown: LearnersScoreBreakdown | undefined,
  weights: LearnersWeights,
  pointsNeeded: number,
): EffortActionStep[] {
  if (!breakdown || breakdown.overallScore === null) {
    return [
      {
        componentKey: 'academic',
        componentLabel: 'Academic Development',
        weightPct: weights.academic,
        currentScore: null,
        targetScore: 80,
        estimatedOverallGain: 0,
        actionHint: 'Log initial exam/assessment marks to activate Learners Score ranking.',
      },
      {
        componentKey: 'learningHabits',
        componentLabel: 'Learning Habits',
        weightPct: weights.learningHabits,
        currentScore: null,
        targetScore: 85,
        estimatedOverallGain: 0,
        actionHint: 'Complete notebook checks with independent work to build habit evidence.',
      },
    ];
  }

  if (pointsNeeded <= 0) return [];

  let activeWeightSum = 0;
  let weightedSum = 0;
  for (const key of COMPONENT_KEYS) {
    const comp = breakdown.components[key];
    if (comp && comp.score !== null) {
      activeWeightSum += weights[key];
      weightedSum += comp.score * weights[key];
    }
  }
  if (activeWeightSum <= 0) return [];

  const currentOverall = breakdown.overallScore;

  // Score each component by realistic gain headroom up to 96/100
  const candidates = COMPONENT_KEYS.map((key) => {
    const comp = breakdown.components[key];
    const w = weights[key];
    if (w <= 0) return null;

    if (!comp || comp.score === null) {
      const targetScore = 88;
      const newOverall = (weightedSum + targetScore * w) / (activeWeightSum + w);
      const maxGain = round1(Math.max(0, newOverall - currentOverall));
      return {
        key,
        label: comp?.label ?? key,
        w,
        currentScore: null as number | null,
        maxTargetScore: targetScore,
        maxGain,
      };
    }

    const cap = 96;
    if (comp.score >= cap) return null;
    const maxGain = round1(((cap - comp.score) * w) / activeWeightSum);
    return {
      key,
      label: comp.label,
      w,
      currentScore: comp.score,
      maxTargetScore: cap,
      maxGain,
    };
  })
    .filter((c): c is NonNullable<typeof c> => c !== null && c.maxGain > 0)
    .sort((a, b) => b.maxGain - a.maxGain);

  const steps: EffortActionStep[] = [];
  let remainingGap = pointsNeeded;

  for (const cand of candidates) {
    if (remainingGap <= 0) break;

    if (cand.currentScore === null) {
      steps.push({
        componentKey: cand.key,
        componentLabel: cand.label,
        weightPct: cand.w,
        currentScore: null,
        targetScore: cand.maxTargetScore,
        estimatedOverallGain: cand.maxGain,
        actionHint: COMPONENT_ACTION_HINTS[cand.key],
      });
      remainingGap = round1(Math.max(0, remainingGap - cand.maxGain));
      continue;
    }

    // Exact component lift needed to cover remainingGap (capped at realistic 96)
    const exactNeededCompPoints = (remainingGap * activeWeightSum) / cand.w;
    const desiredCompScore = Math.min(
      cand.maxTargetScore,
      Math.ceil(cand.currentScore + exactNeededCompPoints),
    );
    const gain = round1(((desiredCompScore - cand.currentScore) * cand.w) / activeWeightSum);
    if (gain <= 0) continue;

    steps.push({
      componentKey: cand.key,
      componentLabel: cand.label,
      weightPct: cand.w,
      currentScore: cand.currentScore,
      targetScore: desiredCompScore,
      estimatedOverallGain: gain,
      actionHint: COMPONENT_ACTION_HINTS[cand.key],
    });
    remainingGap = round1(Math.max(0, remainingGap - gain));
  }

  return steps;
}

function buildTargetGap(params: {
  scope: 'class' | 'school';
  scopeLabel: string;
  studentId: string;
  breakdown: LearnersScoreBreakdown | undefined;
  rankedList: RankedStudentEntry[];
  totalStudents: number;
  weights: LearnersWeights;
}): Top3TargetGap {
  const { scope, scopeLabel, studentId, breakdown, rankedList, totalStudents, weights } = params;
  const entry = rankedList.find((r) => r.studentId === studentId);
  const third = rankedList.length >= 3 ? rankedList[2] : null;
  const fourth = rankedList.find((r) => r.rank > 3) ?? null;

  if (!entry || !breakdown || breakdown.overallScore === null) {
    return {
      scope,
      scopeLabel,
      rank: null,
      totalRanked: rankedList.length,
      totalStudents,
      inTop3: false,
      cutoffScore: third ? third.overallScore : null,
      cutoffStudentName: third ? third.studentName : null,
      pointsToEnterTop3: 0,
      pointsToTieTop3: 0,
      leadOverFourth: null,
      statusMessage: `Awaiting initial classroom or academic evidence to place in ${scopeLabel}.`,
      effortSteps: buildEffortSteps(breakdown, weights, 0),
    };
  }

  const inTop3 = entry.rank <= 3;

  if (inTop3) {
    const leadOverFourth = fourth ? round1(entry.overallScore - fourth.overallScore) : null;
    const statusMessage =
      rankedList.length <= 3
        ? `In ${scopeLabel} Top 3 (#${entry.rank} of ${rankedList.length} ranked).`
        : leadOverFourth !== null && leadOverFourth > 0
          ? `In ${scopeLabel} Top 3 (#${entry.rank} of ${rankedList.length}) · +${leadOverFourth} pts ahead of #4.`
          : `In ${scopeLabel} Top 3 (#${entry.rank} of ${rankedList.length}).`;

    return {
      scope,
      scopeLabel,
      rank: entry.rank,
      totalRanked: rankedList.length,
      totalStudents,
      inTop3: true,
      cutoffScore: third ? third.overallScore : rankedList[rankedList.length - 1]?.overallScore ?? null,
      cutoffStudentName: third ? third.studentName : null,
      pointsToEnterTop3: 0,
      pointsToTieTop3: 0,
      leadOverFourth,
      statusMessage,
      effortSteps: [],
    };
  }

  const cutoffScore = third ? third.overallScore : 0;
  const pointsToTieTop3 = Math.max(0, round1(cutoffScore - entry.overallScore));
  const pointsToEnterTop3 = round1(Math.max(0.1, cutoffScore - entry.overallScore + 0.1));
  const targetOverall = round1(Math.min(100, entry.overallScore + pointsToEnterTop3));

  const statusMessage = `Currently #${entry.rank} of ${rankedList.length} in ${scopeLabel}. Needs +${pointsToEnterTop3} Learners Score pts (to ${targetOverall}/100) to enter Top 3.`;

  return {
    scope,
    scopeLabel,
    rank: entry.rank,
    totalRanked: rankedList.length,
    totalStudents,
    inTop3: false,
    cutoffScore,
    cutoffStudentName: third ? third.studentName : null,
    pointsToEnterTop3,
    pointsToTieTop3,
    leadOverFourth: null,
    statusMessage,
    effortSteps: buildEffortSteps(breakdown, weights, pointsToEnterTop3),
  };
}

export function computeSchoolRankings(
  schoolStudents: StudentRecord[],
  breakdowns: Record<string, LearnersScoreBreakdown>,
  weights: LearnersWeights = DEFAULT_LEARNERS_WEIGHTS,
  schoolNameOrCode = 'School',
): SchoolRankingsSummary {
  const schoolRanked = rankStudents(schoolStudents, breakdowns);
  const schoolTop3 = schoolRanked.slice(0, 3);

  const byClass = new Map<string, StudentRecord[]>();
  for (const st of schoolStudents) {
    const list = byClass.get(st.classSection) ?? [];
    list.push(st);
    byClass.set(st.classSection, list);
  }

  const classTop3BySection: Record<string, RankedStudentEntry[]> = {};
  const classTotalsBySection: Record<string, { total: number; ranked: number }> = {};
  const classRankedMap = new Map<string, RankedStudentEntry[]>();

  for (const [section, members] of Array.from(byClass.entries()).sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )) {
    const rankedMembers = rankStudents(members, breakdowns);
    classRankedMap.set(section, rankedMembers);
    classTop3BySection[section] = rankedMembers.slice(0, 3);
    classTotalsBySection[section] = {
      total: members.length,
      ranked: rankedMembers.length,
    };
  }

  const studentStandings: Record<string, StudentTop3Standing> = {};

  for (const st of schoolStudents) {
    const bd = breakdowns[st.id];
    const classMembers = byClass.get(st.classSection) ?? [];
    const classRanked = classRankedMap.get(st.classSection) ?? [];

    studentStandings[st.id] = {
      studentId: st.id,
      studentName: st.name,
      classSection: st.classSection,
      overallScore: bd?.overallScore ?? null,
      evidenceCoveragePct: bd?.evidenceCoveragePct ?? 0,
      classTarget: buildTargetGap({
        scope: 'class',
        scopeLabel: `Class ${st.classSection}`,
        studentId: st.id,
        breakdown: bd,
        rankedList: classRanked,
        totalStudents: classMembers.length,
        weights,
      }),
      schoolTarget: buildTargetGap({
        scope: 'school',
        scopeLabel: schoolNameOrCode,
        studentId: st.id,
        breakdown: bd,
        rankedList: schoolRanked,
        totalStudents: schoolStudents.length,
        weights,
      }),
    };
  }

  return {
    schoolTop3,
    classTop3BySection,
    classTotalsBySection,
    schoolTotals: {
      total: schoolStudents.length,
      ranked: schoolRanked.length,
    },
    studentStandings,
  };
}
