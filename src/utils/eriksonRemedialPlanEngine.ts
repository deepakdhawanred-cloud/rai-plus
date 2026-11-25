import type {
  DevelopmentalRemedialCategory,
  EriksonAssessment,
  EriksonStageNumber,
  OlqKey,
} from '../types';

export interface EriksonRemedialStep {
  id: string;
  stepNumber: 1 | 2 | 3 | 4;
  timelineLabel: string;
  durationLabel: string;
  phaseTitle: string;
  targetDomain: 'Competence' | 'Agency' | 'Belonging' | 'Regulation' | 'Stage Enrichment';
  targetSignal: string;
  specificActionPoint: string;
  classroomExercise: string;
  homeExercise: string;
  successCheckpoint: string;
  category: DevelopmentalRemedialCategory;
  targetOlqs: OlqKey[];
}

export interface EriksonRemedialRoadmap {
  studentId: string;
  studentName: string;
  expectedStageNumber: EriksonStageNumber;
  expectedStageLabel: string;
  presentAssessedLabel: string;
  gapSeverity: 'Action Needed' | 'Transitional Watch' | 'On Track' | 'Evidence Needed';
  gapSummary: string;
  totalDurationLabel: string;
  reviewDateOffsetDays: number;
  steps: EriksonRemedialStep[];
}

interface StageExerciseTemplate {
  foundationAction: string;
  foundationClassroom: string;
  foundationHome: string;
  foundationCheckpoint: string;
  skillAction: string;
  skillClassroom: string;
  skillHome: string;
  skillCheckpoint: string;
  agencyAction: string;
  agencyClassroom: string;
  agencyHome: string;
  agencyCheckpoint: string;
  consolidationAction: string;
  consolidationClassroom: string;
  consolidationHome: string;
  consolidationCheckpoint: string;
}

const STAGE_TEMPLATES: Record<EriksonStageNumber, StageExerciseTemplate> = {
  3: {
    foundationAction: 'Channel curiosity into structured, guilt-free mini leadership roles so initiative feels safe.',
    foundationClassroom: 'Daily "First-Step Starter" Role — child leads 2-minute morning rhyme or calendar date.',
    foundationHome: 'Evening "Show & Tell" where child explains one drawing or game rule (8 min).',
    foundationCheckpoint: 'Voluntarily speaks or demonstrates in front of small group twice in Week 1.',
    skillAction: 'Strengthen phonics, picture reading, and counting confidence in joyful micro-sprints.',
    skillClassroom: '10-Min Phonics Sound-Card & Counting Beads Station (Mon–Fri, first period).',
    skillHome: '10-Min Picture Book Read-Aloud — child predicts what happens on the next page.',
    skillCheckpoint: 'Reads/identifies 80%+ target letter sounds or numbers without hesitation.',
    agencyAction: 'Turn mistakes into curiosity ("Let’s test another way!") to dissolve fear of guilt.',
    agencyClassroom: 'Story-Builder Picture Sequence (4 cards) in pairs (15 min, Tue & Thu).',
    agencyHome: 'Build a simple paper or block model together where child decides step 2.',
    agencyCheckpoint: 'Tries a second attempt calmly after a mistake without withdrawing.',
    consolidationAction: 'Conduct Week-4 Initiative & Purpose showcase and update Erikson readiness.',
    consolidationClassroom: '2-Minute "My Favourite Discovery" circle presentation + teacher praise note.',
    consolidationHome: 'Parent signs Purpose Progress card highlighting 2 new things child tried.',
    consolidationCheckpoint: 'Sustains initiative across classroom tasks with zero withdrawal episodes.',
  },
  4: {
    foundationAction: 'Break overwhelming syllabus tasks into visible 10-minute wins to reverse feelings of inferiority.',
    foundationClassroom: '3-Step Mini-Checklist on desk (Start → 3 Questions → Teacher Tick) in Maths & English.',
    foundationHome: '15-Min Fixed Study Corner with 2 small wins checked off before playtime.',
    foundationCheckpoint: 'Completes classwork on time with Work Quality B or A on 4/5 days in Week 1.',
    skillAction: 'Run targeted daily foundational drills in weak literacy/numeracy areas to build real competence.',
    skillClassroom: '10-Min Timed Jumbled Tables (2×–15×) + 8-Min Paired Fluency Reading (Mon–Fri).',
    skillHome: '10-Min Evening Read-Aloud (1 page) + 5-Min Oral Tables Recall with parent.',
    skillCheckpoint: 'Reading WPM increases by +8 words/min OR Tables accuracy improves by +10%.',
    agencyAction: 'Assign a concrete classroom responsibility paired with a supportive buddy to boost belonging.',
    agencyClassroom: 'Row Notebook Captain or Reading Partner Role (15 min, 3×/week) + Peer Praise Slip.',
    agencyHome: 'Child teaches parent 1 concept learned in school that day ("Reverse Teacher", 10 min).',
    agencyCheckpoint: 'Actively raises hand or helps a peer at least 3 times during Week 3.',
    consolidationAction: 'Run Week-4 Live Diagnostic re-test and celebrate measurable mastery growth.',
    consolidationClassroom: 'Re-take Live Reading / Numeracy Check + display Before vs After progress bar.',
    consolidationHome: 'Parent & student review 4-week growth card and pick next month’s 1 skill goal.',
    consolidationCheckpoint: 'Competence & Regulation indicators move above 70% with steady notebook completion.',
  },
  5: {
    foundationAction: 'Replace vague pressure with a clear strengths mirror and 1-on-1 mentoring conversation to reduce role confusion.',
    foundationClassroom: '15-Min 1-on-1 Strengths & Goal Mapping Session (Counsellor/Class Teacher, Day 2).',
    foundationHome: '15-Min Pressure-Free Career & Interest Chat with parent (listening without comparing).',
    foundationCheckpoint: 'Student writes 2 personal strengths and 1 concrete 30-day academic/skill goal.',
    skillAction: 'Connect daily study discipline and thinking drills directly to real-world capability & self-identity.',
    skillClassroom: '15-Min Weekly SRT/WAT Thinking Prompt + Structured 25-Min Pomodoro Study Block (3×/wk).',
    skillHome: 'Daily 30-Min Distraction-Free Self-Study Block logged in personal habit tracker.',
    skillCheckpoint: 'Completes 5/6 planned study blocks and submits homework with zero late flags.',
    agencyAction: 'Give authentic leadership ownership in club, debate, lab, or peer-mentoring to anchor identity.',
    agencyClassroom: 'Lead a 5-Min Concept Recap or Junior-Class Reading Mentorship Session (Tue/Thu).',
    agencyHome: 'Plan and manage one family weekend task independently (budgeting, itinerary, or project).',
    agencyCheckpoint: 'Demonstrates reliable follow-through and constructive peer communication.',
    consolidationAction: 'Review VCIP cognitive strengths, OLQ growth, and academic milestones for Identity alignment.',
    consolidationClassroom: 'Week-4 Mentor Review + VCIP / Thinking Re-Assessment & Portfolio Reflection.',
    consolidationHome: 'Family Reflection Check-in celebrating consistency and refining next-month goals.',
    consolidationCheckpoint: 'Demonstrates clear personal routine, stable attendance, and upward skill trajectory.',
  },
};

function detectWeakestDomain(
  assessment: EriksonAssessment,
): 'Competence' | 'Agency' | 'Belonging' | 'Regulation' {
  const entries: Array<['Competence' | 'Agency' | 'Belonging' | 'Regulation', number]> = [
    ['Competence', assessment.domainScores.competencePct ?? 50],
    ['Agency', assessment.domainScores.agencyPct ?? 50],
    ['Belonging', assessment.domainScores.belongingPct ?? 50],
    ['Regulation', assessment.domainScores.regulationPct ?? 50],
  ];
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}

function buildDomainSpecificSkillStep(
  assessment: EriksonAssessment,
  weakest: 'Competence' | 'Agency' | 'Belonging' | 'Regulation',
  tpl: StageExerciseTemplate,
): Pick<
  EriksonRemedialStep,
  'targetDomain' | 'targetSignal' | 'specificActionPoint' | 'classroomExercise' | 'homeExercise' | 'successCheckpoint' | 'category'
> {
  const signalText =
    assessment.negativeSignals[0]?.label ||
    `${weakest} domain below expected stage benchmark`;

  const joinedSignals = assessment.negativeSignals
    .map((s) => `${s.label} ${s.evidenceSummary}`.toLowerCase())
    .join(' ');

  if (joinedSignals.includes('reading') || joinedSignals.includes('wpm') || joinedSignals.includes('pronunciation')) {
    return {
      targetDomain: 'Competence',
      targetSignal: signalText,
      specificActionPoint: `Target reading fluency gap directly using chunk-reading sprints to shift from ${assessment.expectedStage.negativePole} toward ${assessment.expectedStage.positivePole}.`,
      classroomExercise: '10-Min Guided Chunk Reading + 3-Question Oral Comprehension Check (Mon–Fri, Reading Lab).',
      homeExercise: '10-Min Aloud Reading of 1 textbook page with parent tracking tricky words (daily).',
      successCheckpoint: 'Reading speed improves by +8 WPM and pronunciation accuracy crosses 80% by Day 14.',
      category: 'Skill Practice',
    };
  }

  if (joinedSignals.includes('numeracy') || joinedSignals.includes('table') || joinedSignals.includes('math')) {
    return {
      targetDomain: 'Competence',
      targetSignal: signalText,
      specificActionPoint: 'Close numeracy speed & recall gaps with short, stress-free timed recall drills.',
      classroomExercise: '5-Min Timed Jumbled Tables Warmup (2×–15×) + 3 Step-by-Step Worked Examples (Mon–Fri).',
      homeExercise: '5-Min Rapid-Fire Oral Tables Game with parent after dinner (focus on 2 weak tables/week).',
      successCheckpoint: 'Timed Tables accuracy improves by +12% with response time under 4.5s/question.',
      category: 'Skill Practice',
    };
  }

  if (joinedSignals.includes('notebook') || joinedSignals.includes('homework') || weakest === 'Regulation') {
    return {
      targetDomain: 'Regulation',
      targetSignal: signalText,
      specificActionPoint: 'Rebuild daily work discipline and completion habits through micro-deadlines and positive check-ins.',
      classroomExercise: 'Daily 3-Point Notebook Quality Check (Heading, Complete Answers, Neatness) before bell.',
      homeExercise: 'Fixed 20-Min Evening Homework Slot + Parent Diary Sign-Off every night at 7:00 PM.',
      successCheckpoint: 'Zero "Work Quality C" flags and 5/5 homework submissions across Week 2.',
      category: 'Behavioral Intervention',
    };
  }

  if (weakest === 'Belonging') {
    return {
      targetDomain: 'Belonging',
      targetSignal: signalText,
      specificActionPoint: 'Strengthen peer connection and safe classroom participation through structured partner tasks.',
      classroomExercise: 'Think-Pair-Share Buddy Activity (10 min, Mon/Wed/Fri) with rotating encouraging partner.',
      homeExercise: '5-Min "High & Low of School Day" family conversation without judgement.',
      successCheckpoint: 'Contributes willingly in partner task and initiates 2+ positive peer interactions.',
      category: 'Classroom Activity',
    };
  }

  return {
    targetDomain: weakest,
    targetSignal: signalText,
    specificActionPoint: tpl.skillAction,
    classroomExercise: tpl.skillClassroom,
    homeExercise: tpl.skillHome,
    successCheckpoint: tpl.skillCheckpoint,
    category: 'Skill Practice',
  };
}

/**
 * Generates a concrete, timeline-bound 4-week Remedial Action Plan directly
 * linking Expected Stage vs Present Assessed Stage to specific classroom & home
 * exercises and measurable weekly checkpoints.
 */
export function buildEriksonRemedialRoadmap(
  assessment: EriksonAssessment,
): EriksonRemedialRoadmap {
  const stageNum = assessment.expectedStage.stageNumber;
  const tpl = STAGE_TEMPLATES[stageNum] || STAGE_TEMPLATES[4];
  const weakest = detectWeakestDomain(assessment);
  const olqs: OlqKey[] =
    assessment.recommendedOlqKeys.length > 0
      ? assessment.recommendedOlqKeys.slice(0, 3)
      : ['self_confidence', 'determination', 'sense_of_responsibility'];

  const isAligned = assessment.outcomeStatus === 'positive_aligned';
  const isPending = assessment.outcomeStatus === 'insufficient_evidence';

  const gapSeverity: EriksonRemedialRoadmap['gapSeverity'] =
    assessment.outcomeStatus === 'negative_stage_alert'
      ? 'Action Needed'
      : assessment.outcomeStatus === 'transitional_support'
        ? 'Transitional Watch'
        : isAligned
          ? 'On Track'
          : 'Evidence Needed';

  const gapSummary = isAligned
    ? `${assessment.studentName} is aligned with ${assessment.expectedStage.stageTitle} (${assessment.expectedStage.positivePole}). Follow this 4-week enrichment track to deepen ${assessment.expectedStage.virtue} and mentor peers.`
    : isPending
      ? `Baseline evidence is incomplete for ${assessment.studentName}. Follow Week 1–2 diagnostic capture first, then apply the stage reinforcement exercises.`
      : `${assessment.studentName} shows ${assessment.expectedStage.negativePole} friction against the expected ${assessment.expectedStage.stageTitle} milestone (weakest pillar: ${weakest}). Execute these 4 timed weekly steps to move cleanly into ${assessment.expectedStage.positivePole}.`;

  const step2Detail = buildDomainSpecificSkillStep(assessment, weakest, tpl);

  const steps: EriksonRemedialStep[] = [
    {
      id: `${assessment.studentId}-step-1`,
      stepNumber: 1,
      timelineLabel: 'Week 1 · Days 1–7',
      durationLabel: '7 Days',
      phaseTitle: isPending ? 'Diagnostic Capture & Rapport' : 'Safety Reset & Micro-Wins',
      targetDomain: isAligned ? 'Stage Enrichment' : 'Regulation',
      targetSignal:
        assessment.negativeSignals[0]?.label ||
        `Stage ${stageNum} baseline alignment (${assessment.expectedStage.positivePole})`,
      specificActionPoint: tpl.foundationAction,
      classroomExercise: tpl.foundationClassroom,
      homeExercise: tpl.foundationHome,
      successCheckpoint: tpl.foundationCheckpoint,
      category: 'Behavioral Intervention',
      targetOlqs: olqs.slice(0, 2),
    },
    {
      id: `${assessment.studentId}-step-2`,
      stepNumber: 2,
      timelineLabel: 'Week 2 · Days 8–14',
      durationLabel: '7 Days',
      phaseTitle: isAligned ? 'Stretch Mastery Sprint' : `Targeted ${step2Detail.targetDomain} Drill`,
      targetDomain: isAligned ? 'Stage Enrichment' : step2Detail.targetDomain,
      targetSignal: step2Detail.targetSignal,
      specificActionPoint: step2Detail.specificActionPoint,
      classroomExercise: step2Detail.classroomExercise,
      homeExercise: step2Detail.homeExercise,
      successCheckpoint: step2Detail.successCheckpoint,
      category: step2Detail.category,
      targetOlqs: olqs,
    },
    {
      id: `${assessment.studentId}-step-3`,
      stepNumber: 3,
      timelineLabel: 'Week 3 · Days 15–21',
      durationLabel: '7 Days',
      phaseTitle: 'Guided Ownership & Peer Confidence',
      targetDomain: isAligned ? 'Stage Enrichment' : 'Agency',
      targetSignal:
        assessment.negativeSignals[1]?.label ||
        `Building ${assessment.expectedStage.virtue} through structured responsibility`,
      specificActionPoint: tpl.agencyAction,
      classroomExercise: tpl.agencyClassroom,
      homeExercise: tpl.agencyHome,
      successCheckpoint: tpl.agencyCheckpoint,
      category: 'Classroom Activity',
      targetOlqs: olqs,
    },
    {
      id: `${assessment.studentId}-step-4`,
      stepNumber: 4,
      timelineLabel: 'Week 4 · Days 22–28',
      durationLabel: '7 Days',
      phaseTitle: 'Stage Re-Assessment & Parent Sync',
      targetDomain: isAligned ? 'Stage Enrichment' : 'Belonging',
      targetSignal: `Verify transition into ${assessment.expectedStage.positivePole} (${assessment.expectedStage.virtue})`,
      specificActionPoint: tpl.consolidationAction,
      classroomExercise: tpl.consolidationClassroom,
      homeExercise: tpl.consolidationHome,
      successCheckpoint: tpl.consolidationCheckpoint,
      category: 'Parent & Home Coordination',
      targetOlqs: olqs,
    },
  ];

  return {
    studentId: assessment.studentId,
    studentName: assessment.studentName,
    expectedStageNumber: stageNum,
    expectedStageLabel: `${assessment.expectedStage.stageTitle} (${assessment.expectedStage.classBandLabel})`,
    presentAssessedLabel: assessment.presentStageHeadline,
    gapSeverity,
    gapSummary,
    totalDurationLabel: '4-Week Phased Plan (28 Days)',
    reviewDateOffsetDays: 28,
    steps,
  };
}
