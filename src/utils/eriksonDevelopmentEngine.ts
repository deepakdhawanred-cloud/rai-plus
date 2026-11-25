import type {
  ActivityRecord,
  CognitiveAttemptRecord,
  DevelopmentEvidence,
  EriksonAssessment,
  EriksonOutcomeStatus,
  EriksonPolarity,
  EriksonRemedialAction,
  EriksonSignalItem,
  EriksonStageDescriptor,
  EriksonStageNumber,
  ExamMark,
  HomeworkAssignment,
  HomeworkSubmission,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  NumeracyTestSession,
  OlqKey,
  PersonalBestSummary,
  ReadingTestSession,
  StudentRecord,
  VisParsedReportProfile,
} from '../types';
import { computeStudentPersonalBest } from './personalBestEngine.ts';
import { resolveWpmFluencyTarget } from './growthLeaderboardEngine.ts';

function averageOrNull(values: Array<number | null | undefined>): number | null {
  const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((acc, v) => acc + v, 0) / valid.length);
}

/**
 * Maps a school class section (Nursery, LKG, UKG, 1-A .. 12-B) to the student's
 * expected chronological age band and corresponding Erikson Psychosocial Stage.
 */
export function resolveExpectedEriksonStage(classSection: string): {
  estimatedAgeRange: string;
  numericGrade: number;
  expectedStage: EriksonStageDescriptor;
} {
  const clean = (classSection || '').trim();
  const upper = clean.toUpperCase();

  if (upper.startsWith('NUR')) {
    return {
      estimatedAgeRange: '3–4 yrs',
      numericGrade: -2,
      expectedStage: {
        stageNumber: 3,
        stageTitle: 'Stage 3 · Initiative vs. Guilt',
        positivePole: 'Initiative',
        negativePole: 'Guilt',
        virtue: 'Purpose',
        ageRangeLabel: 'Ages 3–5 (Early Childhood)',
        classBandLabel: 'Nursery – UKG',
        coreDevelopmentalTask:
          'Initiating play, curiosity, storytelling, and small classroom tasks without fear of making mistakes.',
      },
    };
  }

  if (upper === 'LKG' || upper.startsWith('LKG')) {
    return {
      estimatedAgeRange: '4–5 yrs',
      numericGrade: -1,
      expectedStage: {
        stageNumber: 3,
        stageTitle: 'Stage 3 · Initiative vs. Guilt',
        positivePole: 'Initiative',
        negativePole: 'Guilt',
        virtue: 'Purpose',
        ageRangeLabel: 'Ages 3–5 (Early Childhood)',
        classBandLabel: 'Nursery – UKG',
        coreDevelopmentalTask:
          'Leading playful exploration, voicing questions, and completing small guided choices with confidence.',
      },
    };
  }

  if (upper === 'UKG' || upper.startsWith('UKG')) {
    return {
      estimatedAgeRange: '5–6 yrs',
      numericGrade: 0,
      expectedStage: {
        stageNumber: 3,
        stageTitle: 'Stage 3 · Initiative vs. Guilt',
        positivePole: 'Initiative',
        negativePole: 'Guilt',
        virtue: 'Purpose',
        ageRangeLabel: 'Ages 3–5 (Early Childhood)',
        classBandLabel: 'Nursery – UKG',
        coreDevelopmentalTask:
          'Exercising joyful initiative and readiness before transitioning into structured primary mastery.',
      },
    };
  }

  const match = clean.match(/\d+/);
  const grade = match ? Math.max(1, Math.min(12, Number(match[0]))) : 6;
  const minAge = grade + 5;
  const maxAge = grade + 6;
  const estimatedAgeRange = `${minAge}–${maxAge} yrs`;

  if (grade <= 6) {
    return {
      estimatedAgeRange,
      numericGrade: grade,
      expectedStage: {
        stageNumber: 4,
        stageTitle: 'Stage 4 · Industry vs. Inferiority',
        positivePole: 'Industry',
        negativePole: 'Inferiority',
        virtue: 'Competence',
        ageRangeLabel: 'Ages 6–11 (School Age)',
        classBandLabel: 'Classes 1–6',
        coreDevelopmentalTask:
          'Building academic & reading/numeracy mastery, steady work habits, and pride in effort alongside peers.',
      },
    };
  }

  return {
    estimatedAgeRange,
    numericGrade: grade,
    expectedStage: {
      stageNumber: 5,
      stageTitle: 'Stage 5 · Identity vs. Role Confusion',
      positivePole: 'Identity',
      negativePole: 'Role Confusion',
      virtue: 'Fidelity',
      ageRangeLabel: 'Ages 12–18 (Adolescence)',
      classBandLabel: 'Classes 7–12',
      coreDevelopmentalTask:
        'Integrating academic strengths, peer leadership, values, and future academic/career direction into a coherent identity.',
    },
  };
}

export interface AssessEriksonInput {
  student: StudentRecord;
  breakdown?: LearnersScoreBreakdown;
  evidence?: DevelopmentEvidence[];
  examMarks?: ExamMark[];
  notebookEntries?: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  readingReports?: MonthlyReadingReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyReports?: MonthlyNumeracyReport[];
  numeracyTestSessions?: NumeracyTestSession[];
  activityRecords?: ActivityRecord[];
  cognitiveAttempts?: CognitiveAttemptRecord[];
  personalBest?: PersonalBestSummary;
  visProfile?: VisParsedReportProfile | null;
}

const STAGE_PRIORITY_OLQS: Record<EriksonStageNumber, OlqKey[]> = {
  3: ['initiative', 'liveliness', 'courage', 'cooperation', 'social_adaptability'],
  4: [
    'determination',
    'sense_of_responsibility',
    'organising_ability',
    'effective_intelligence',
    'power_of_expression',
    'self_confidence',
  ],
  5: [
    'self_confidence',
    'reasoning_ability',
    'speed_of_decision',
    'influence_group',
    'initiative',
    'determination',
  ],
};

function buildRemedialsForStage(params: {
  expectedStage: EriksonStageDescriptor;
  outcomeStatus: EriksonOutcomeStatus;
  negativeSignals: EriksonSignalItem[];
  bestWpm: number | null;
  targetWpm: number;
  hasWeakReading: boolean;
  hasWeakNumeracy: boolean;
  hasHabitStrain: boolean;
  hasConfidenceStrain: boolean;
}): {
  remedials: EriksonRemedialAction[];
  checklist: string[];
  recommendedOlqKeys: OlqKey[];
} {
  const {
    expectedStage,
    outcomeStatus,
    negativeSignals,
    bestWpm,
    targetWpm,
    hasWeakReading,
    hasWeakNumeracy,
    hasHabitStrain,
    hasConfidenceStrain,
  } = params;

  const stageNum = expectedStage.stageNumber;
  const remedials: EriksonRemedialAction[] = [];
  const checklist: string[] = [];
  const recommendedOlqs = new Set<OlqKey>();

  if (outcomeStatus === 'positive_aligned') {
    if (stageNum === 3) {
      remedials.push({
        id: 'rem-s3-pos-1',
        track: 'Classroom Mentoring',
        title: 'Encourage Guided Choice & Storytelling Roles',
        description:
          'Rotate small classroom helper responsibilities and let the child narrate picture prompts aloud to nurture Purpose.',
        targetOutcome: 'Sustains joyful Initiative without fear of mistakes',
        actionType: 'none',
      });
      recommendedOlqs.add('initiative');
      recommendedOlqs.add('liveliness');
    } else if (stageNum === 4) {
      remedials.push({
        id: 'rem-s4-pos-1',
        track: 'In-App Skill Practice',
        title: 'Stretch Personal Best Fluency & Challenge Sprints',
        description:
          'Invite the learner to challenge their own Personal Best WPM and Level 3+ times tables sprints to deepen Competence.',
        targetOutcome: `Build steadily toward ${Math.max(targetWpm + 10, (bestWpm ?? targetWpm) + 5)} WPM`,
        actionType: 'reading_test',
        actionLabel: 'Challenge Personal Best',
      });
      recommendedOlqs.add('determination');
      recommendedOlqs.add('sense_of_responsibility');
    } else {
      remedials.push({
        id: 'rem-s5-pos-1',
        track: 'Classroom Mentoring',
        title: 'Deepen Peer Mentoring & Future Pathway Alignment',
        description:
          'Pair house/club leadership duties with academic stream exploration so confidence translates into authentic Fidelity.',
        targetOutcome: 'Consolidates independent academic identity and leadership',
        actionType: 'intelligence_game',
        actionLabel: 'Explore Strategy & Reasoning Games',
        recommendedGameTitle: 'Chess Tactics',
      });
      recommendedOlqs.add('self_confidence');
      recommendedOlqs.add('influence_group');
    }

    checklist.push(
      `Maintain ${expectedStage.positivePole} momentum with 1 weekly Personal Best reading sprint`,
      'Celebrate effortful attempts and mistake recovery across notebooks & activities',
    );

    return {
      remedials,
      checklist,
      recommendedOlqKeys: Array.from(recommendedOlqs).slice(0, 3),
    };
  }

  // Transitional or Negative Stage Remedials
  if (stageNum === 3) {
    remedials.push({
      id: 'rem-s3-mentor',
      track: 'Classroom Mentoring',
      title: 'Mistake-Safe Choice & Micro-Initiative Scaffolding',
      description:
        'Offer two structured classroom choices at a time (e.g., distributing notebooks or leading a rhyme) and praise curiosity immediately to dissolve Guilt or hesitation.',
      targetOutcome: 'Shifts child from hesitation (Guilt) back to confident Initiative',
      actionType: 'none',
    });
    remedials.push({
      id: 'rem-s3-home',
      track: 'Home & Parent Support',
      title: 'Effort-First Evening Play & Picture Read-Aloud',
      description:
        'Spend 10 gentle minutes letting the child pick a story page and ask "why" questions without correcting every word mid-sentence.',
      targetOutcome: 'Restores emotional safety and joyful Purpose at home',
      actionType: 'none',
    });
    checklist.push(
      'Log 2 positive Initiative/Liveliness classroom observations over the next 2 weeks',
      'Provide zero-criticism mistake recovery after any creative or verbal attempt',
    );
    recommendedOlqs.add('initiative');
    recommendedOlqs.add('courage');
    recommendedOlqs.add('liveliness');
  } else if (stageNum === 4) {
    remedials.push({
      id: 'rem-s4-mentor',
      track: 'Classroom Mentoring',
      title: 'Mastery-Ladder Chunking to Counteract Inferiority',
      description:
        'Break multi-step tasks into 5-minute winnable checkpoints and celebrate each completed step privately before whole-class sharing.',
      targetOutcome: 'Rebuilds sense of Competence and pride in daily schoolwork',
      actionType: 'none',
    });
    checklist.push(
      'Complete 2 guided Reading Fluency sessions targeting steady phrase chunking',
      'Clear any flagged Work Quality C / Incomplete homework items with gentle teacher support',
      'Record 2 Determination or Self-Confidence evidence entries honoring persistence',
    );
    recommendedOlqs.add('determination');
    recommendedOlqs.add('self_confidence');
    recommendedOlqs.add('sense_of_responsibility');
  } else {
    remedials.push({
      id: 'rem-s5-mentor',
      track: 'Classroom Mentoring',
      title: 'Strength-Anchored Identity & Role Ownership Check-In',
      description:
        'Conduct a 15-minute mentor conversation connecting personal strengths (labs, debate, coding, sports, or writing) to a concrete class/house role to resolve Role Confusion.',
      targetOutcome: 'Restores direction, self-worth, and authentic Fidelity',
      actionType: 'none',
    });
    checklist.push(
      'Assign 1 visible team or subject-peer role aligned to the student’s strongest OLQ',
      'Complete 2 self-paced fluency or reasoning drills to rebuild measurable momentum',
      'Schedule parent-mentor check-in highlighting progress vs personal baseline rather than peer comparison',
    );
    recommendedOlqs.add('self_confidence');
    recommendedOlqs.add('initiative');
    recommendedOlqs.add('speed_of_decision');
  }

  if (hasWeakReading || stageNum >= 4) {
    remedials.push({
      id: 'rem-skill-reading',
      track: 'In-App Skill Practice',
      title: 'Self-Paced Personal Best Reading Fluency Ladder',
      description:
        hasWeakReading
          ? `Reading accuracy or speed (${bestWpm ?? 'baseline'} vs ${targetWpm} WPM goal) is creating self-doubt. Practise calm 3-word phrase reading in Interactive Pacer mode.`
          : 'Use Live Reading Tests against own Personal Best rather than peer comparison to strengthen Competence and Power of Expression.',
      targetOutcome: 'Builds visible mastery through self-referenced WPM & accuracy wins',
      actionType: 'reading_test',
      actionLabel: 'Launch Live Reading Test',
    });
    recommendedOlqs.add('power_of_expression');
  }

  if (hasWeakNumeracy) {
    remedials.push({
      id: 'rem-skill-numeracy',
      track: 'In-App Skill Practice',
      title: 'Timed Jumbled Tables Confidence Rebuild',
      description:
        'Numeracy or tables fluency dips undermine classroom confidence. Run short untimed-to-timed table sprints focused only on missed table bases.',
      targetOutcome: 'Automates core tables without timed test anxiety',
      actionType: 'numeracy_test',
      actionLabel: 'Launch Timed Tables Test',
    });
  }

  if (hasHabitStrain || hasConfidenceStrain || negativeSignals.length >= 2) {
    remedials.push({
      id: 'rem-skill-games',
      track: 'In-App Skill Practice',
      title:
        stageNum === 3
          ? 'Playful Phonics & Focus Sequencing'
          : 'Non-Scoring Adaptive Intelligence Games (Step-by-Step Wins)',
      description:
        'Low-stakes cognitive drills (Tower of Hanoi, Phonics Sound Match, or Go/No-Go Focus) give immediate mastery feedback without academic marks pressure.',
      targetOutcome: 'Rebuilds Planning, Determination, and emotional self-regulation',
      actionType: 'intelligence_game',
      actionLabel: 'Open Intelligence Games',
      recommendedGameTitle: hasWeakReading ? 'Phonics Sound Match' : 'Tower of Hanoi',
    });
  }

  if (stageNum >= 4) {
    remedials.push({
      id: 'rem-home-support',
      track: 'Home & Parent Support',
      title: 'Compare Against Yesterday, Never Against Peers',
      description:
        stageNum === 4
          ? 'At home, ask "What new step felt easier today than last week?" and pair a 15-minute distraction-free reading/tables block with immediate praise for persistence.'
          : 'Support adolescent autonomy at home: listen without lecturing when grades dip, co-create a simple study schedule, and validate real effort over perfection.',
      targetOutcome: `Counters ${expectedStage.negativePole} triggers and reinforces ${expectedStage.positivePole}`,
      actionType: 'none',
    });
  }

  return {
    remedials,
    checklist,
    recommendedOlqKeys: Array.from(recommendedOlqs).slice(0, 3),
  };
}

/**
 * Assesses a student's Erikson Psychosocial Stage (Expected Stage by Age & Class vs
 * Present Stage synthesized across OLQs, Personal Best Reading, Numeracy, Marks,
 * Notebooks, Homework, Activities, and Cognitive Practice) and generates remedials
 * whenever negative-pole drift or transitional strain appears.
 */
export function assessStudentEriksonDevelopment(
  input: AssessEriksonInput,
): EriksonAssessment {
  const {
    student,
    breakdown,
    evidence = [],
    examMarks = [],
    notebookEntries = [],
    homeworkAssignments = [],
    homeworkSubmissions = [],
    readingReports = [],
    readingTestSessions = [],
    numeracyReports = [],
    numeracyTestSessions = [],
    activityRecords = [],
    cognitiveAttempts = [],
    visProfile,
  } = input;

  const { estimatedAgeRange, expectedStage } = resolveExpectedEriksonStage(
    student.classSection,
  );

  const personalBest =
    input.personalBest ||
    computeStudentPersonalBest({
      student,
      readingTestSessions,
      readingReports,
    });

  const stageNum = expectedStage.stageNumber;
  const eriksonWpmTarget = stageNum === 3 ? 32 : resolveWpmFluencyTarget(student.classSection);
  const minAccThreshold = stageNum === 3 ? 58 : 65;
  const minSpeedThreshold = stageNum === 3 ? 60 : 65;
  const positiveSignals: EriksonSignalItem[] = [];
  const negativeSignals: EriksonSignalItem[] = [];

  // 1. Reading & Personal Best Fluency/Accuracy Signal
  let readingSignalPct: number | null = null;
  let hasWeakReading = false;
  if (personalBest.bestWpm !== null && personalBest.bestAccuracyPct !== null) {
    const latestWpm = personalBest.latestWpm ?? personalBest.bestWpm;
    const latestAcc = personalBest.latestAccuracyPct ?? personalBest.bestAccuracyPct;
    const speedRatioPct = Math.min(105, Math.round((latestWpm / eriksonWpmTarget) * 100));
    readingSignalPct = Math.round(speedRatioPct * 0.45 + latestAcc * 0.55);

    if (latestAcc < minAccThreshold || speedRatioPct < minSpeedThreshold) {
      hasWeakReading = true;
      negativeSignals.push({
        id: 'sig-reading-strain',
        domain: 'Reading & Fluency',
        label: 'Reading Fluency / Accuracy Strain',
        scorePct: Math.min(readingSignalPct, latestAcc < minAccThreshold ? latestAcc : speedRatioPct),
        polarity: 'negative',
        evidenceSummary: `Latest reading ${latestWpm} WPM (${latestAcc}% accuracy) vs ${eriksonWpmTarget} WPM class goal (Personal Best: ${personalBest.bestWpm} WPM).`,
      });
    } else if (readingSignalPct >= 75) {
      positiveSignals.push({
        id: 'sig-reading-strong',
        domain: 'Reading & Fluency',
        label: 'Reading Fluency & Personal Best Momentum',
        scorePct: readingSignalPct,
        polarity: 'positive',
        evidenceSummary: `Personal Best ${personalBest.bestWpm} WPM · ${personalBest.bestAccuracyPct}% accuracy (${personalBest.totalAttempts} assessments).`,
      });
    }
  }

  // 2. Numeracy & Exam Marks Mastery (Competence Pillar)
  const studentMarks = examMarks.filter((m) => m.studentId === student.id && m.maxMarks > 0);
  const marksPcts = studentMarks.map((m) => Math.round((m.obtainedMarks / m.maxMarks) * 100));
  const examAvgPct = averageOrNull(marksPcts);
  const lowExamCount = marksPcts.filter((p) => p < 55).length;

  const studentNumReports = numeracyReports.filter((r) => r.studentId === student.id);
  const studentNumSessions = numeracyTestSessions.filter((s) => s.studentId === student.id);
  const latestNumPct =
    studentNumSessions.length > 0
      ? Math.round(
          studentNumSessions[0].tablesFluencyPct * 0.5 + studentNumSessions[0].accuracyPct * 0.5,
        )
      : studentNumReports.length > 0
        ? Math.round(studentNumReports[studentNumReports.length - 1].overallPct)
        : null;
  const latestTablesPct =
    studentNumSessions.length > 0
      ? studentNumSessions[0].tablesFluencyPct
      : studentNumReports.length > 0
        ? studentNumReports[studentNumReports.length - 1].tablesFluencyPct
        : null;

  let hasWeakNumeracy = false;
  if (latestTablesPct !== null && latestTablesPct < 62) {
    hasWeakNumeracy = true;
    negativeSignals.push({
      id: 'sig-numeracy-strain',
      domain: 'Academic & Numeracy',
      label: 'Tables & Quantitative Fluency Dip',
      scorePct: latestNumPct,
      polarity: 'negative',
      evidenceSummary: `Tables fluency at ${latestTablesPct}% (below 65% comfort band), risking classroom confidence.`,
    });
  } else if (latestNumPct !== null && latestNumPct >= 75) {
    positiveSignals.push({
      id: 'sig-numeracy-strong',
      domain: 'Academic & Numeracy',
      label: 'Numeracy & Tables Competence',
      scorePct: latestNumPct,
      polarity: 'positive',
      evidenceSummary: `Numeracy proficiency at ${latestNumPct}% (Tables ${latestTablesPct ?? latestNumPct}%).`,
    });
  }

  if (examAvgPct !== null && (examAvgPct < 60 || lowExamCount >= 2)) {
    negativeSignals.push({
      id: 'sig-exam-dip',
      domain: 'Academic & Numeracy',
      label: 'Examination Confidence Dip',
      scorePct: examAvgPct,
      polarity: 'negative',
      evidenceSummary: `Exam average ${examAvgPct}% across ${studentMarks.length} records (${lowExamCount} assessment${lowExamCount === 1 ? '' : 's'} below 55%).`,
    });
  } else if (examAvgPct !== null && examAvgPct >= 75) {
    positiveSignals.push({
      id: 'sig-exam-strong',
      domain: 'Academic & Numeracy',
      label: 'Academic Examination Mastery',
      scorePct: examAvgPct,
      polarity: 'positive',
      evidenceSummary: `Consistent ${examAvgPct}% exam average across ${studentMarks.length} assessments.`,
    });
  }

  // 3. OLQ & Agency Signals (Stage-specific OLQs)
  const priorityOlqs = STAGE_PRIORITY_OLQS[expectedStage.stageNumber];
  const olqValues = breakdown
    ? priorityOlqs
        .map((k) => breakdown.olqScores[k]?.score)
        .filter((v): v is number => v !== null && v !== undefined)
    : [];
  const stageOlqAvg = averageOrNull(olqValues);
  const weakOlqNames: string[] = [];
  if (breakdown) {
    for (const k of priorityOlqs) {
      const val = breakdown.olqScores[k]?.score;
      if (val !== null && val !== undefined && val < 64) {
        weakOlqNames.push(`${k.replace(/_/g, ' ')} (${val})`);
      }
    }
  }

  let hasConfidenceStrain = false;
  if (weakOlqNames.length > 0 || (stageOlqAvg !== null && stageOlqAvg < 64)) {
    hasConfidenceStrain = true;
    negativeSignals.push({
      id: 'sig-olq-strain',
      domain: 'OLQ & Agency',
      label: `${expectedStage.negativePole} Risk Indicators in OLQ Evidence`,
      scorePct: stageOlqAvg,
      polarity: 'negative',
      evidenceSummary:
        weakOlqNames.length > 0
          ? `Lower observed evidence in ${weakOlqNames.slice(0, 3).join(', ')}.`
          : `Stage-aligned OLQ cluster averaging ${stageOlqAvg}%.`,
    });
  } else if (stageOlqAvg !== null && stageOlqAvg >= 72) {
    positiveSignals.push({
      id: 'sig-olq-strong',
      domain: 'OLQ & Agency',
      label: `${expectedStage.positivePole} Virtue Strengths (OLQs)`,
      scorePct: stageOlqAvg,
      polarity: 'positive',
      evidenceSummary: `Stage-critical OLQs average ${stageOlqAvg}/100 across recorded observations.`,
    });
  }

  // 4. Notebooks & Homework Persistence (Pending & Cancelled NEVER penalised)
  const stuNotebooks = notebookEntries.filter((n) => n.studentId === student.id && n.checked);
  const workQualityCSteps = stuNotebooks.filter((n) => n.workQuality === 'C').length;
  const independentAttempts = stuNotebooks.filter(
    (n) => (n.homeworkDone || n.workQuality === 'A') && n.workQuality !== 'C',
  ).length;
  const classHwIds = new Set(
    homeworkAssignments
      .filter((h) => h.classSection === student.classSection && h.status === 'Active')
      .map((h) => h.id),
  );
  const stuHwSubs = homeworkSubmissions.filter(
    (s) => s.studentId === student.id && classHwIds.has(s.assignmentId),
  );
  const missingHwCount = stuHwSubs.filter((s) => s.status === 'Missing').length;
  const handedInHwCount = stuHwSubs.filter((s) => s.status === 'Handed In').length;

  let habitScorePct: number | null = breakdown?.components.learningHabits.score ?? null;
  if (habitScorePct === null && (stuNotebooks.length > 0 || stuHwSubs.length > 0)) {
    const nbBase =
      stuNotebooks.length > 0
        ? Math.round(
            (stuNotebooks.filter((n) => n.workQuality === 'A' || n.workQuality === 'B').length /
              stuNotebooks.length) *
              100,
          )
        : 75;
    habitScorePct = Math.max(40, nbBase - missingHwCount * 8);
  }

  let hasHabitStrain = false;
  const nonReadableCount = stuNotebooks.filter((n) => n.handwriting === 'Non-Readability').length;
  if (
    workQualityCSteps >= 2 ||
    (workQualityCSteps >= 1 && (nonReadableCount >= 1 || missingHwCount >= 1)) ||
    missingHwCount >= 2 ||
    (habitScorePct !== null && habitScorePct < 64)
  ) {
    hasHabitStrain = true;
    negativeSignals.push({
      id: 'sig-habit-strain',
      domain: 'Habits & Persistence',
      label: 'Task Completion & Notebook Routine Strain',
      scorePct: habitScorePct,
      polarity: 'negative',
      evidenceSummary: `${workQualityCSteps} Work Quality C check(s) and ${missingHwCount} missing homework submission(s) — needs chunked scaffolding without punishment.`,
    });
  } else if (independentAttempts > 0 || handedInHwCount > 0 || (habitScorePct !== null && habitScorePct >= 75)) {
    positiveSignals.push({
      id: 'sig-habit-strong',
      domain: 'Habits & Persistence',
      label: 'Consistent Work Ownership & Independent Effort',
      scorePct: habitScorePct ?? 82,
      polarity: 'positive',
      evidenceSummary: `${handedInHwCount} handed-in homework task(s) & ${independentAttempts} positive notebook effort record(s).`,
    });
  }

  // 5. Co-Curricular Activities, Responsibilities & Cognitive Practice (Belonging Pillar)
  const stuActivities = activityRecords.filter((a) =>
    a.entries.some((e) => e.studentId === student.id && e.tookPart),
  );
  const participationComponent = breakdown?.components.participation.score ?? null;
  const responsibilityScore =
    student.responsibilities.length + student.achievements.length > 0
      ? Math.min(95, 72 + (student.responsibilities.length + student.achievements.length) * 6)
      : null;

  const stuCog = cognitiveAttempts.filter((c) => c.studentId === student.id);
  const cogAvgPct =
    stuCog.length > 0 ? averageOrNull(stuCog.map((c) => c.accuracyPct)) : null;

  const belongingBase = averageOrNull([
    participationComponent,
    responsibilityScore,
    breakdown?.olqScores.cooperation.score,
    breakdown?.olqScores.social_adaptability.score,
    stuActivities.length > 0 ? Math.min(96, 74 + stuActivities.length * 6) : null,
  ]);

  if (belongingBase !== null && belongingBase >= 74) {
    positiveSignals.push({
      id: 'sig-belonging-strong',
      domain: 'Social & Co-Curricular',
      label: 'Peer Belonging & Active Participation',
      scorePct: belongingBase,
      polarity: 'positive',
      evidenceSummary: `${stuActivities.length} active duty/activity role(s), ${student.responsibilities.length} responsibility badge(s).`,
    });
  } else if (belongingBase !== null && belongingBase < 60) {
    negativeSignals.push({
      id: 'sig-belonging-strain',
      domain: 'Social & Co-Curricular',
      label: 'Social Withdrawal / Low Group Participation',
      scorePct: belongingBase,
      polarity: 'negative',
      evidenceSummary: `Cooperation/Participation cluster at ${belongingBase}%; gentle partner-pair roles recommended.`,
    });
  }

  // Also check explicit emotional/behavioral incident warnings in DevelopmentEvidence
  const stuEvidence = evidence.filter((e) => e.studentId === student.id);
  const recentNegativeIncident = stuEvidence.find(
    (e) =>
      e.reviewRequired &&
      /(inferior|guilt|confused|withdraw|anxi|discourag|hesit|gave up|incomplete|avoid)/i.test(
        e.summary,
      ),
  );
  if (recentNegativeIncident && !negativeSignals.some((s) => s.id === 'sig-olq-strain')) {
    hasConfidenceStrain = true;
    negativeSignals.push({
      id: 'sig-incident-alert',
      domain: 'OLQ & Agency',
      label: 'Observed Classroom Self-Doubt / Hesitation Cue',
      scorePct: 54,
      polarity: 'negative',
      evidenceSummary: recentNegativeIncident.summary,
    });
  }

  // Domain Pillar Consolidation
  const competencePct = averageOrNull([
    breakdown?.components.academic.score,
    examAvgPct,
    readingSignalPct,
    latestNumPct,
  ]);
  const agencyPct = averageOrNull([
    stageOlqAvg,
    cogAvgPct,
    breakdown?.olqScores.initiative.score,
    breakdown?.olqScores.determination.score,
    breakdown?.olqScores.self_confidence.score,
  ]);
  const belongingPct = belongingBase;
  const regulationPct = averageOrNull([
    habitScorePct,
    breakdown?.olqScores.organising_ability.score,
    breakdown?.olqScores.stamina.score,
    student.attendancePct > 0 ? Math.min(95, student.attendancePct) : null,
  ]);

  const domainScores = {
    competencePct,
    agencyPct,
    belongingPct,
    regulationPct,
  };

  const validPillars = [competencePct, agencyPct, belongingPct, regulationPct].filter(
    (v): v is number => v !== null,
  );

  // Count distinct data sources contributing real evidence
  const signalCoverageCount = [
    readingSignalPct !== null,
    examAvgPct !== null || latestNumPct !== null,
    stageOlqAvg !== null,
    habitScorePct !== null,
    belongingPct !== null,
  ].filter(Boolean).length;

  const rawReadinessPct = averageOrNull(validPillars);
  const readinessScorePct =
    rawReadinessPct === null
      ? null
      : negativeSignals.length >= 2
        ? Math.min(rawReadinessPct, Math.max(42, 64 - (negativeSignals.length - 2) * 7))
        : negativeSignals.length === 1
          ? Math.min(rawReadinessPct, 69)
          : rawReadinessPct;

  let outcomeStatus: EriksonOutcomeStatus;
  let presentPolarity: EriksonPolarity;
  let presentStageHeadline: string;
  let presentStageDetail: string;
  let transitionGoalStatement: string;

  if (signalCoverageCount < 2 || readinessScorePct === null) {
    outcomeStatus = 'insufficient_evidence';
    presentPolarity = 'Pending';
    presentStageHeadline = `Awaiting Multi-Source Evidence (Expected: Stage ${expectedStage.stageNumber} · ${expectedStage.positivePole})`;
    presentStageDetail =
      'Too few classroom, reading, numeracy, or OLQ observations have been logged yet to determine the present Erikson stage accurately. Complete at least 2 observations or diagnostics rather than assuming negative drift.';
    transitionGoalStatement = `Collect a baseline Live Reading Test and 1 classroom OLQ observation to calibrate ${student.name}'s ${expectedStage.positivePole} profile.`;
  } else if (
    readinessScorePct < 58 ||
    negativeSignals.length >= 2 ||
    (hasConfidenceStrain && (hasWeakReading || hasWeakNumeracy || hasHabitStrain))
  ) {
    outcomeStatus = 'negative_stage_alert';
    presentPolarity = 'Negative';
    presentStageHeadline = `Negative Stage Drift: Stage ${expectedStage.stageNumber} ${expectedStage.negativePole} Risk`;
    presentStageDetail = `${student.name} (Class ${student.classSection}, ~${estimatedAgeRange}) is showing ${negativeSignals.length} negative-pole indicator${negativeSignals.length === 1 ? '' : 's'} linked to Erikson's "${expectedStage.negativePole}" pole rather than the expected "${expectedStage.positivePole}" (${expectedStage.virtue}) stage.`;
    transitionGoalStatement = `Targeted 2–3 week remedial cycle to overcome ${expectedStage.negativePole} strain and restore healthy Stage ${expectedStage.stageNumber} ${expectedStage.positivePole} (${expectedStage.virtue}).`;
  } else if (readinessScorePct < 70 || negativeSignals.length === 1) {
    outcomeStatus = 'transitional_support';
    presentPolarity = 'Transitional';
    presentStageHeadline = `Transitional Stage: Emerging ${expectedStage.positivePole} with Episodic ${expectedStage.negativePole} Strain`;
    presentStageDetail = `${student.name} demonstrates developing ${expectedStage.positivePole} strengths (${readinessScorePct}/100 overall readiness), with ${negativeSignals.length === 1 ? `1 support trigger (${negativeSignals[0].label})` : 'moderate consistency'} needing proactive scaffolding before negative habits set in.`;
    transitionGoalStatement = `Reinforce daily small wins to anchor solid Stage ${expectedStage.stageNumber} ${expectedStage.positivePole} (${expectedStage.virtue}).`;
  } else {
    outcomeStatus = 'positive_aligned';
    presentPolarity = 'Positive';
    const visBrainLabel =
      visProfile?.brainDominance.leftPct != null && visProfile?.brainDominance.rightPct != null
        ? visProfile.brainDominance.leftPct >= visProfile.brainDominance.rightPct
          ? 'Left-Brain Analytical'
          : 'Right-Brain Holistic'
        : visProfile?.vak.dominantStyle
          ? `${visProfile.vak.dominantStyle} Learner`
          : null;
    const visSuffix = visBrainLabel ? ` Aligned with ${visBrainLabel} VIS learning profile.` : '';
    presentStageHeadline = `Positive Stage Active: Stage ${expectedStage.stageNumber} ${expectedStage.positivePole} (${expectedStage.virtue})`;
    presentStageDetail = `${student.name} (Class ${student.classSection}, ~${estimatedAgeRange}) is thriving in the expected positive Erikson stage (${readinessScorePct}/100 readiness across Competence, Agency, Belonging & Regulation).${visSuffix}`;
    transitionGoalStatement = `Expected stage achieved — sustain ${expectedStage.virtue} via stretch Personal Best goals and peer mentoring.`;
  }

  const { remedials, checklist, recommendedOlqKeys } = buildRemedialsForStage({
    expectedStage,
    outcomeStatus,
    negativeSignals,
    bestWpm: personalBest.bestWpm,
    targetWpm: eriksonWpmTarget,
    hasWeakReading,
    hasWeakNumeracy,
    hasHabitStrain,
    hasConfidenceStrain,
  });

  return {
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    estimatedAgeRange,
    expectedStage,
    presentStageHeadline,
    presentStageDetail,
    presentPolarity,
    outcomeStatus,
    readinessScorePct,
    signalCoverageCount,
    domainScores,
    positiveSignals,
    negativeSignals,
    remedials,
    pathBackToPositiveChecklist: checklist,
    recommendedOlqKeys,
    transitionGoalStatement,
  };
}
