import type {
  AbsenceTargetRiskAlert,
  AttendanceRecord,
  LearnersScoreBreakdown,
  StudentRecord,
  StudentYearlyPlan,
  StudentYearlySkillTarget,
  YearlyTargetRiskStatus,
} from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function extractClassNumber(classSection: string): number {
  const m = classSection.match(/\d+/);
  return m ? Number(m[0]) : 6;
}

/**
 * Generates an achievable, personalized yearly skill plan calibrated to the student's
 * class grade, current holistic scores, and attendance discipline.
 */
export function buildDefaultYearlyPlanForStudent(
  student: StudentRecord,
  breakdown?: LearnersScoreBreakdown | null,
  schoolSession = '2026-27',
): StudentYearlyPlan {
  const classNum = extractClassNumber(student.classSection);
  const academicBase = breakdown?.components.academic.score ?? 74;
  const olqBase = breakdown?.components.olq.score ?? 76;
  const habitsBase = breakdown?.components.learningHabits.score ?? 75;
  const growthBase = breakdown?.components.personalGrowth.score ?? 72;

  // Calibrated achievable reading WPM & skill benchmarks by grade band
  const readingWpmBaseline = clamp(
    classNum <= 2 ? 42 : classNum <= 5 ? 74 : classNum <= 8 ? 102 : 124,
    35,
    140,
  );
  const readingWpmTarget = readingWpmBaseline + (classNum <= 5 ? 18 : 20);

  const numeracyCurrent = clamp(academicBase - 2, 52, 92);
  const numeracyTarget = clamp(numeracyCurrent + 12, 72, 96);

  const scienceCurrent = clamp(Math.round((academicBase + growthBase) / 2), 54, 92);
  const scienceTarget = clamp(scienceCurrent + 11, 74, 96);

  const olqCurrent = clamp(Math.round((olqBase + habitsBase) / 2), 58, 93);
  const olqTarget = clamp(olqCurrent + 10, 76, 95);

  const targets: StudentYearlySkillTarget[] = [
    {
      id: `tgt-${student.id}-reading`,
      domain: 'Reading Fluency',
      skillName:
        classNum <= 5
          ? 'Fluent Aloud Reading & Comprehension'
          : 'Structured Passage Reading & Inference',
      baselineScore: readingWpmBaseline - 6,
      currentScore: readingWpmBaseline,
      targetScore: readingWpmTarget,
      unitLabel: 'WPM',
      minAttendanceRequiredPct: 85,
      weeklyPracticePlan: '15 min aloud reading + 3 comprehension checks each week',
      quarterlyMilestones: {
        q1: { label: `Reach ${readingWpmBaseline + 4} WPM with 90% pronunciation accuracy`, completed: true },
        q2: { label: `Reach ${readingWpmBaseline + 10} WPM with 3-word phrase fluency`, completed: false },
        q3: { label: `Reach ${readingWpmBaseline + 15} WPM & independent summary writing`, completed: false },
        q4: { label: `Sustain ${readingWpmTarget} WPM across unseen grade texts`, completed: false },
      },
      riskStatus: 'On Track',
    },
    {
      id: `tgt-${student.id}-numeracy`,
      domain: 'Numeracy & Maths',
      skillName:
        classNum <= 5
          ? 'Tables Speed & Everyday Word Problems'
          : 'Core Concept Accuracy & Multi-Step Problem Solving',
      baselineScore: clamp(numeracyCurrent - 5, 45, 90),
      currentScore: numeracyCurrent,
      targetScore: numeracyTarget,
      unitLabel: '%',
      minAttendanceRequiredPct: 88,
      weeklyPracticePlan: '20 min daily worked examples + 1 weekly timed fluency drill',
      quarterlyMilestones: {
        q1: { label: 'Zero backlog in core chapter exercises & notebook checks', completed: true },
        q2: { label: `Achieve ${clamp(numeracyCurrent + 5, 65, 94)}% in periodic concept test`, completed: false },
        q3: { label: 'Master error-log revision before unit assessments', completed: false },
        q4: { label: `Achieve ${numeracyTarget}% cumulative numeracy mastery`, completed: false },
      },
      riskStatus: 'On Track',
    },
    {
      id: `tgt-${student.id}-science`,
      domain: 'Science Mastery',
      skillName:
        classNum <= 5
          ? 'Observation, Everyday Science & Diagrams'
          : 'Concept Application, Lab Tests & Chapter Mastery Quests',
      baselineScore: clamp(scienceCurrent - 4, 48, 90),
      currentScore: scienceCurrent,
      targetScore: scienceTarget,
      unitLabel: '%',
      minAttendanceRequiredPct: 86,
      weeklyPracticePlan: '1 Chapter Mastery visual lab + 2 labelled diagram practices weekly',
      quarterlyMilestones: {
        q1: { label: 'Complete pushed Chapter Mastery visual concept labs', completed: true },
        q2: { label: 'Explain real-life science tests & diagrams accurately', completed: false },
        q3: { label: `Reach ${clamp(scienceCurrent + 7, 70, 95)}% in application questions`, completed: false },
        q4: { label: `Achieve ${scienceTarget}% year-end mastery across syllabus`, completed: false },
      },
      riskStatus: 'On Track',
    },
    {
      id: `tgt-${student.id}-olq`,
      domain: 'OLQ & Habits',
      skillName: 'Self-Discipline, Notebook Consistency & Group Initiative',
      baselineScore: clamp(olqCurrent - 4, 50, 90),
      currentScore: olqCurrent,
      targetScore: olqTarget,
      unitLabel: '/100',
      minAttendanceRequiredPct: 85,
      weeklyPracticePlan: 'Complete daily homework on time & participate in 1 group/event activity',
      quarterlyMilestones: {
        q1: { label: 'Maintain Grade A/B notebook discipline every week', completed: true },
        q2: { label: 'Lead one classroom presentation or peer study round', completed: false },
        q3: { label: 'Participate in at least 1 school calendar event', completed: false },
        q4: { label: `Sustain ${olqTarget}/100 holistic habits & OLQ consistency`, completed: false },
      },
      riskStatus: 'On Track',
    },
  ];

  const plan: StudentYearlyPlan = {
    id: `yplan-${student.schoolId}-${student.id}`,
    schoolId: student.schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    academicSession: schoolSession,
    overallTargetSummary: `Achievable ${schoolSession} growth roadmap for ${student.name} (${student.classSection}): steady quarterly gains across reading, numeracy, science labs, and study habits contingent on >=85% attendance.`,
    attendanceThresholdPct: 85,
    weeklyHomeCommitment: '35–45 mins structured evening practice (Mon–Sat) + weekend recap',
    targets,
    overallRiskLevel: 'On Track',
    projectedAttainmentDropPct: 0,
    updatedBy: 'Academic Coordinator',
    updatedAt: new Date().toISOString(),
  };

  return applyAttendanceRiskToPlan(plan, student, []);
}

export interface AttendanceRiskEvaluation {
  overallRiskLevel: 'On Track' | 'Watch' | 'At Risk' | 'Critical Risk';
  consecutiveAbsences: number;
  absencesLast30Days: number;
  projectedAttainmentDropPct: number;
  impactedTargets: StudentYearlySkillTarget[];
  evaluatedTargets: StudentYearlySkillTarget[];
}

export function evaluateTargetAttendanceRisk(
  plan: StudentYearlyPlan,
  student: StudentRecord,
  attendanceRecords: AttendanceRecord[],
): AttendanceRiskEvaluation {
  const studentAttendance = attendanceRecords
    .filter((r) => r.studentId === student.id && r.schoolId === student.schoolId)
    .sort((a, b) => b.date.localeCompare(a.date));

  let consecutiveAbsences = 0;
  for (const rec of studentAttendance) {
    if (rec.status === 'Absent') {
      consecutiveAbsences += 1;
    } else {
      break;
    }
  }

  const latestDateStr = studentAttendance[0]?.date ?? new Date().toISOString().slice(0, 10);
  const latestMs = new Date(`${latestDateStr}T00:00:00Z`).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const absencesLast30Days = studentAttendance.filter((r) => {
    if (r.status !== 'Absent') return false;
    const ms = new Date(`${r.date}T00:00:00Z`).getTime();
    return Number.isFinite(ms) ? latestMs - ms <= thirtyDaysMs : true;
  }).length;

  const attPct = Number.isFinite(student.attendancePct) ? student.attendancePct : 90;
  const threshold = plan.attendanceThresholdPct || 85;

  let overallRiskLevel: AttendanceRiskEvaluation['overallRiskLevel'] = 'On Track';
  if (attPct < 75 || consecutiveAbsences >= 3 || absencesLast30Days >= 5) {
    overallRiskLevel = 'Critical Risk';
  } else if (attPct < threshold || consecutiveAbsences >= 2 || absencesLast30Days >= 3) {
    overallRiskLevel = 'At Risk';
  } else if (consecutiveAbsences >= 1 || absencesLast30Days >= 1 || attPct < threshold + 3) {
    overallRiskLevel = 'Watch';
  }

  const deficitPts = Math.max(0, threshold - attPct);
  const projectedAttainmentDropPct =
    overallRiskLevel === 'On Track'
      ? 0
      : clamp(deficitPts * 1.1 + consecutiveAbsences * 4 + absencesLast30Days * 2, 3, 28);

  const evaluatedTargets: StudentYearlySkillTarget[] = plan.targets.map((target) => {
    const gapToTarget = Math.max(0, target.targetScore - target.currentScore);
    const reqAtt = target.minAttendanceRequiredPct || threshold;

    let riskStatus: YearlyTargetRiskStatus = 'On Track';
    let riskReason: string | undefined;

    if (
      overallRiskLevel === 'Critical Risk' ||
      (attPct < reqAtt - 5 && gapToTarget >= 6) ||
      consecutiveAbsences >= 3
    ) {
      riskStatus = 'At Risk';
      riskReason = `${attPct}% attendance (${consecutiveAbsences} consecutive absence${consecutiveAbsences === 1 ? '' : 's'}) threatens the ${target.targetScore}${target.unitLabel} yearly target.`;
    } else if (
      overallRiskLevel === 'At Risk' ||
      attPct < reqAtt ||
      consecutiveAbsences >= 1 ||
      absencesLast30Days >= 2
    ) {
      riskStatus = gapToTarget >= 10 && attPct < reqAtt ? 'At Risk' : 'Needs Catch-Up';
      riskReason = `Missed classroom instruction makes reaching ${target.targetScore}${target.unitLabel} harder without catch-up this week.`;
    }

    return {
      ...target,
      riskStatus,
      riskReason,
    };
  });

  const impactedTargets = evaluatedTargets.filter((t) => t.riskStatus !== 'On Track');

  return {
    overallRiskLevel,
    consecutiveAbsences,
    absencesLast30Days,
    projectedAttainmentDropPct,
    impactedTargets,
    evaluatedTargets,
  };
}

export function applyAttendanceRiskToPlan(
  plan: StudentYearlyPlan,
  student: StudentRecord,
  attendanceRecords: AttendanceRecord[],
): StudentYearlyPlan {
  const evalResult = evaluateTargetAttendanceRisk(plan, student, attendanceRecords);
  return {
    ...plan,
    studentName: student.name,
    classSection: student.classSection,
    targets: evalResult.evaluatedTargets,
    overallRiskLevel: evalResult.overallRiskLevel,
    projectedAttainmentDropPct: evalResult.projectedAttainmentDropPct,
  };
}

export function buildAbsenceTargetRiskAlert(params: {
  schoolId: string;
  schoolName: string;
  student: StudentRecord;
  plan: StudentYearlyPlan;
  absenceDate: string;
  attendanceRecords: AttendanceRecord[];
  triggeredBy: string;
}): AbsenceTargetRiskAlert {
  const { schoolId, schoolName, student, plan, absenceDate, attendanceRecords, triggeredBy } = params;
  const evalResult = evaluateTargetAttendanceRisk(plan, student, attendanceRecords);

  const riskLevel: 'Watch' | 'At Risk' | 'Critical Risk' =
    evalResult.overallRiskLevel === 'On Track' ? 'Watch' : evalResult.overallRiskLevel;

  const impacted = (
    evalResult.impactedTargets.length > 0 ? evalResult.impactedTargets : evalResult.evaluatedTargets.slice(0, 2)
  ).slice(0, 3);

  const skillList = impacted.map((t) => `${t.domain} (${t.currentScore} -> ${t.targetScore}${t.unitLabel})`).join(', ');

  const parentMessage =
    riskLevel === 'Critical Risk'
      ? `Urgent Yearly Target Alert (${schoolName}): ${student.name} (${student.classSection}) was marked Absent on ${absenceDate}. Attendance is now ${student.attendancePct}% (${evalResult.consecutiveAbsences} consecutive absence${evalResult.consecutiveAbsences === 1 ? '' : 's'}), putting yearly skill targets at high risk: ${skillList}. Please ensure regular attendance and complete the catch-up plan.`
      : riskLevel === 'At Risk'
        ? `Yearly Target Risk Alert (${schoolName}): ${student.name} (${student.classSection}) was absent on ${absenceDate} (Attendance: ${student.attendancePct}%). Continued absence makes achieving yearly targets harder in ${skillList}.`
        : `Attendance Watch (${schoolName}): ${student.name} (${student.classSection}) missed school on ${absenceDate}. To stay on track for yearly targets in ${skillList}, please complete today's pushed class recap at home.`;

  const managementMessage = `${student.name} (${student.classSection}) absent on ${absenceDate} · Attendance ${student.attendancePct}% · ${evalResult.absencesLast30Days} absence(s) in 30 days · Risk: ${riskLevel}. Impacted yearly plan targets: ${skillList}. Coordinator & class teacher catch-up advised.`;

  const catchUpAction =
    impacted[0]
      ? `Assign 15-min bridge recap for ${impacted[0].domain} (${impacted[0].weeklyPracticePlan}) and review notebook completion on return.`
      : `Review missed class notes and complete pushed Chapter Mastery practice on return.`;

  return {
    id: `risk-alert-${schoolId}-${student.id}-${absenceDate}`,
    schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    absenceDate,
    attendancePct: student.attendancePct,
    consecutiveAbsences: Math.max(1, evalResult.consecutiveAbsences),
    absencesLast30Days: Math.max(1, evalResult.absencesLast30Days),
    riskLevel,
    impactedTargets: impacted.map((t) => ({
      targetId: t.id,
      domain: t.domain,
      skillName: t.skillName,
      currentScore: t.currentScore,
      targetScore: t.targetScore,
      unitLabel: t.unitLabel,
    })),
    parentMessage,
    managementMessage,
    catchUpAction,
    recipients: ['parent', 'management'],
    status: 'Active',
    acknowledgedByParent: false,
    acknowledgedByManagement: false,
    triggeredBy,
    triggeredAt: new Date().toISOString(),
  };
}
