import type {
  CognitiveAttemptRecord,
  ComputerSkillAttempt,
  ExamCategory,
  ExamMark,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  OlqGroup,
  OlqKey,
  PsychometricRecord,
  StudentRecord,
  StudentYearlyPlan,
  ThinkingAssessmentSession,
} from '../types';
import type { VcipAttemptRecord } from '../types/vcip';
import { OLQ_DEFINITIONS } from './evidenceEngine.ts';

export const EXAM_CATEGORIES: ExamCategory[] = ['Class Test', 'UT', 'Semester Exam'];

export const EXAM_PRESETS_BY_CATEGORY: Record<ExamCategory, { defaultMax: number; presets: string[] }> = {
  'Class Test': {
    defaultMax: 20,
    presets: ['Class Test 1', 'Class Test 2', 'Class Test 3', 'Weekly Revision Test'],
  },
  UT: {
    defaultMax: 40,
    presets: ['Unit Test 1 (UT-1)', 'Unit Test 2 (UT-2)', 'Unit Test 3 (UT-3)'],
  },
  'Semester Exam': {
    defaultMax: 80,
    presets: ['Semester 1 Exam', 'Half-Yearly Exam', 'Semester 2 Exam', 'Annual Exam'],
  },
};

export const EXAM_TERMS = ['Term 1', 'Term 2', 'Annual'] as const;

export interface GradeSummary {
  grade: string;
  remark: string;
  band: 'Distinction' | 'Proficient' | 'Developing' | 'Needs Support';
}

export function inferExamCategory(mark: Pick<ExamMark, 'examType' | 'examName'>): ExamCategory {
  if (
    mark.examType === 'Class Test' ||
    mark.examType === 'UT' ||
    mark.examType === 'Semester Exam'
  ) {
    return mark.examType;
  }
  const name = (mark.examName || '').toLowerCase();
  if (
    name.includes('class test') ||
    name.includes('weekly test') ||
    name.includes('quiz') ||
    name.includes('ct-') ||
    /\bct\s*\d/.test(name)
  ) {
    return 'Class Test';
  }
  if (
    name.includes('unit test') ||
    /\but[\s-]?\d/.test(name) ||
    name.includes('periodic test') ||
    /\bpt[\s-]?\d/.test(name)
  ) {
    return 'UT';
  }
  return 'Semester Exam';
}

export function computeGrade(pct: number): GradeSummary {
  const rounded = Math.round(pct);
  if (rounded >= 91) {
    return { grade: 'A1', remark: 'Outstanding Mastery', band: 'Distinction' };
  }
  if (rounded >= 81) {
    return { grade: 'A2', remark: 'Excellent Performance', band: 'Distinction' };
  }
  if (rounded >= 71) {
    return { grade: 'B1', remark: 'Very Good Command', band: 'Proficient' };
  }
  if (rounded >= 61) {
    return { grade: 'B2', remark: 'Good Steady Progress', band: 'Proficient' };
  }
  if (rounded >= 51) {
    return { grade: 'C1', remark: 'Satisfactory Progress', band: 'Developing' };
  }
  if (rounded >= 41) {
    return { grade: 'C2', remark: 'Developing Foundation', band: 'Developing' };
  }
  if (rounded >= 33) {
    return { grade: 'D', remark: 'Needs Targeted Practice', band: 'Needs Support' };
  }
  return { grade: 'E', remark: 'Immediate Remedial Support', band: 'Needs Support' };
}

export interface CategoryScoreCell {
  count: number;
  obtainedTotal: number;
  maxTotal: number;
  avgPct: number | null;
  latestExamName?: string;
}

export interface SubjectReportRow {
  subject: string;
  classTest: CategoryScoreCell;
  ut: CategoryScoreCell;
  semesterExam: CategoryScoreCell;
  overallObtained: number;
  overallMax: number;
  overallPct: number;
  grade: GradeSummary;
  remarks: string[];
  conceptualGaps: string[];
}

export interface AssessedSkillItem {
  id: string;
  domain: string;
  skillName: string;
  score: number | null;
  displayValue: string;
  status: 'Distinction' | 'Proficient' | 'Developing' | 'Needs Support' | 'Observed';
  detail: string;
}

export interface OlqGroupReport {
  group: OlqGroup;
  items: Array<{
    key: OlqKey;
    index: number;
    name: string;
    score: number | null;
    evidenceCount: number;
    band: 'Distinction' | 'Proficient' | 'Developing' | 'Needs Support' | 'Pending';
  }>;
}

export interface StudentReportCardModel {
  student: StudentRecord;
  generatedAt: string;
  academicSummary: {
    totalAssessments: number;
    classTestCount: number;
    utCount: number;
    semesterExamCount: number;
    classTestAvgPct: number | null;
    utAvgPct: number | null;
    semesterExamAvgPct: number | null;
    overallObtained: number;
    overallMax: number;
    overallPct: number | null;
    overallGrade: GradeSummary | null;
  };
  subjectRows: SubjectReportRow[];
  chronologicalMarks: Array<
    ExamMark & {
      category: ExamCategory;
      pct: number;
      grade: GradeSummary;
    }
  >;
  skillsSummary: {
    totalSkillsAssessed: number;
    avgSkillScore: number | null;
    learnersOverallScore: number | null;
    learnersPillars: AssessedSkillItem[];
    foundationalSkills: AssessedSkillItem[];
    cognitiveAndThinkingSkills: AssessedSkillItem[];
    learningHabits: AssessedSkillItem[];
    olqGroups: OlqGroupReport[];
    yearlySkillTargets: Array<{
      id: string;
      skillName: string;
      domain: string;
      baselineScore: number;
      currentScore: number;
      targetScore: number;
      status: string;
      atRiskDueToAbsence?: boolean;
      targetDate: string;
    }>;
    strengths: string[];
    supportAreas: string[];
    advisoryNote: string;
  };
}

function scoreToBand(score: number | null): 'Distinction' | 'Proficient' | 'Developing' | 'Needs Support' | 'Observed' {
  if (score === null) return 'Observed';
  if (score >= 82) return 'Distinction';
  if (score >= 68) return 'Proficient';
  if (score >= 52) return 'Developing';
  return 'Needs Support';
}

function buildCategoryCell(marks: ExamMark[]): CategoryScoreCell {
  if (marks.length === 0) {
    return { count: 0, obtainedTotal: 0, maxTotal: 0, avgPct: null };
  }
  const obtainedTotal = marks.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const maxTotal = marks.reduce((sum, m) => sum + m.maxMarks, 0);
  const sorted = [...marks].sort((a, b) => b.date.localeCompare(a.date));
  return {
    count: marks.length,
    obtainedTotal,
    maxTotal,
    avgPct: maxTotal > 0 ? Math.round((obtainedTotal / maxTotal) * 100) : null,
    latestExamName: sorted[0]?.examName,
  };
}

export function buildStudentReportCard(params: {
  student: StudentRecord;
  examMarks: ExamMark[];
  breakdown?: LearnersScoreBreakdown | null;
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  computerSkillAttempts?: ComputerSkillAttempt[];
  cognitiveAttempts?: CognitiveAttemptRecord[];
  thinkingAssessments?: ThinkingAssessmentSession[];
  vcipAttempts?: VcipAttemptRecord[];
  psychometricRecords?: PsychometricRecord[];
  yearlyPlan?: StudentYearlyPlan | null;
}): StudentReportCardModel {
  const { student } = params;
  const studentMarks = (params.examMarks || [])
    .filter((m) => m.studentId === student.id && m.maxMarks > 0)
    .map((m) => {
      const category = inferExamCategory(m);
      const pct = Math.round((m.obtainedMarks / m.maxMarks) * 100);
      return {
        ...m,
        category,
        pct,
        grade: computeGrade(pct),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.subject.localeCompare(b.subject));

  const bySubject = new Map<string, typeof studentMarks>();
  for (const m of studentMarks) {
    const key = m.subject.trim() || 'General';
    const arr = bySubject.get(key) || [];
    arr.push(m);
    bySubject.set(key, arr);
  }

  const subjectRows: SubjectReportRow[] = Array.from(bySubject.entries())
    .map(([subject, list]) => {
      const classTest = buildCategoryCell(list.filter((m) => m.category === 'Class Test'));
      const ut = buildCategoryCell(list.filter((m) => m.category === 'UT'));
      const semesterExam = buildCategoryCell(list.filter((m) => m.category === 'Semester Exam'));
      const overallObtained = list.reduce((s, m) => s + m.obtainedMarks, 0);
      const overallMax = list.reduce((s, m) => s + m.maxMarks, 0);
      const overallPct = overallMax > 0 ? Math.round((overallObtained / overallMax) * 100) : 0;
      const remarks = Array.from(
        new Set(list.map((m) => m.remarks?.trim()).filter((v): v is string => Boolean(v))),
      );
      const conceptualGaps = Array.from(
        new Set(list.map((m) => m.conceptualGap?.trim()).filter((v): v is string => Boolean(v))),
      );
      return {
        subject,
        classTest,
        ut,
        semesterExam,
        overallObtained,
        overallMax,
        overallPct,
        grade: computeGrade(overallPct),
        remarks,
        conceptualGaps,
      };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const classTestAll = buildCategoryCell(studentMarks.filter((m) => m.category === 'Class Test'));
  const utAll = buildCategoryCell(studentMarks.filter((m) => m.category === 'UT'));
  const semAll = buildCategoryCell(studentMarks.filter((m) => m.category === 'Semester Exam'));
  const overallObtained = studentMarks.reduce((s, m) => s + m.obtainedMarks, 0);
  const overallMax = studentMarks.reduce((s, m) => s + m.maxMarks, 0);
  const overallPct = overallMax > 0 ? Math.round((overallObtained / overallMax) * 100) : null;

  // 1. Learners 360° Core Pillars
  const breakdown = params.breakdown || null;
  const learnersPillars: AssessedSkillItem[] = breakdown
    ? Object.entries(breakdown.components).map(([key, comp]) => ({
        id: `pillar-${key}`,
        domain: 'Learners 360° Core',
        skillName: comp.label,
        score: comp.score,
        displayValue: comp.score !== null ? `${Math.round(comp.score)}/100` : 'Pending',
        status: scoreToBand(comp.score),
        detail: `Weight ${comp.weight}% · ${comp.evidenceCount} verified evidence item${comp.evidenceCount === 1 ? '' : 's'}`,
      }))
    : [];

  // 2. Foundational Literacy, Numeracy & Computer Skills
  const foundationalSkills: AssessedSkillItem[] = [];
  const latestReading = [...(params.readingReports || [])]
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))[0];
  if (latestReading) {
    const readingComposite = Math.round(
      (latestReading.accuracyPct + latestReading.comprehensionPct) / 2,
    );
    foundationalSkills.push({
      id: `reading-${latestReading.id}`,
      domain: 'Foundational Literacy',
      skillName: 'Reading Fluency & Comprehension',
      score: readingComposite,
      displayValue: `${latestReading.wpm} WPM · ${readingComposite}%`,
      status: scoreToBand(readingComposite),
      detail: `Accuracy ${latestReading.accuracyPct}% · Comprehension ${latestReading.comprehensionPct}% (${latestReading.readingBand})`,
    });
  }

  const latestNumeracy = [...(params.numeracyReports || [])]
    .filter((n) => n.studentId === student.id)
    .sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))[0];
  if (latestNumeracy) {
    const numComposite = Math.round(latestNumeracy.overallPct);
    foundationalSkills.push({
      id: `numeracy-${latestNumeracy.id}`,
      domain: 'Foundational Numeracy',
      skillName: 'Mental Arithmetic & Tables Fluency',
      score: numComposite,
      displayValue: `${numComposite}% · Tables ${latestNumeracy.tablesFluencyPct}%`,
      status: scoreToBand(numComposite),
      detail: `Mental Math ${latestNumeracy.mentalMathPct}% · Problem Solving ${latestNumeracy.problemSolvingPct}%`,
    });
  }

  const studentCompAttempts = [...(params.computerSkillAttempts || [])]
    .filter((a) => a.studentId === student.id)
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  if (studentCompAttempts.length > 0) {
    const latestComp = studentCompAttempts[0];
    const compScore = Math.round(latestComp.overallScore ?? latestComp.accuracyPct ?? 0);
    foundationalSkills.push({
      id: `comp-${latestComp.id}`,
      domain: 'Digital Readiness',
      skillName: 'Computer & Keyboard Literacy',
      score: compScore,
      displayValue: `${compScore}/100 (${latestComp.netWpm ?? 0} WPM)`,
      status: scoreToBand(compScore),
      detail: `Accuracy ${Math.round(latestComp.accuracyPct ?? 0)}% · Practical ${Math.round(latestComp.practicalScore ?? 0)}% (${latestComp.grade})`,
    });
  }

  // 3. Cognitive, Thinking & Psychometric Skills
  const cognitiveAndThinkingSkills: AssessedSkillItem[] = [];
  const studentCog = (params.cognitiveAttempts || []).filter((a) => a.studentId === student.id);
  if (studentCog.length > 0) {
    const avgCog = Math.round(
      studentCog.reduce((sum, a) => sum + (a.accuracyPct ?? 0), 0) / studentCog.length,
    );
    cognitiveAndThinkingSkills.push({
      id: 'cognitive-games-summary',
      domain: 'Cognitive Intelligence',
      skillName: 'Executive Function & Brain Games',
      score: avgCog,
      displayValue: `${avgCog}% Avg`,
      status: scoreToBand(avgCog),
      detail: `${studentCog.length} completed cognitive session${studentCog.length === 1 ? '' : 's'} across memory, logic & focus`,
    });
  }

  const studentThinking = [...(params.thinkingAssessments || [])]
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
  if (studentThinking.length > 0) {
    const avgThinking = Math.round(
      studentThinking.reduce((sum, t) => {
        const d = t.dimensionScores;
        const avgDim = Math.round(
          ((d?.fastThinking ?? 0) +
            (d?.betterThinking ?? 0) +
            (d?.positiveThinking ?? 0) +
            (100 - (d?.selfCentredThinking ?? 50))) /
            4,
        );
        return sum + avgDim;
      }, 0) / studentThinking.length,
    );
    const latestThink = studentThinking[0];
    cognitiveAndThinkingSkills.push({
      id: `thinking-${latestThink.id}`,
      domain: 'Thinking Assessments',
      skillName: `Applied Reasoning (${latestThink.testType})`,
      score: avgThinking,
      displayValue: `${avgThinking}/100`,
      status: scoreToBand(avgThinking),
      detail: `${studentThinking.length} session${studentThinking.length === 1 ? '' : 's'} · Fast ${Math.round(latestThink.dimensionScores?.fastThinking ?? 0)} · Better ${Math.round(latestThink.dimensionScores?.betterThinking ?? 0)} · Positive ${Math.round(latestThink.dimensionScores?.positiveThinking ?? 0)}`,
    });
  }

  const studentVcip = [...(params.vcipAttempts || [])]
    .filter((v) => v.studentId === student.id)
    .sort((a, b) => (b.assessedAt || '').localeCompare(a.assessedAt || ''));
  if (studentVcip.length > 0) {
    const avgVcip = Math.round(
      studentVcip.reduce((sum, v) => sum + (v.developmentalScore ?? v.accuracyPct ?? 0), 0) /
        studentVcip.length,
    );
    const latestVcip = studentVcip[0];
    cognitiveAndThinkingSkills.push({
      id: `vcip-${latestVcip.id}`,
      domain: 'Cognitive Profile (VCIP)',
      skillName: 'Multi-Domain Cognitive Development',
      score: avgVcip,
      displayValue: `${avgVcip}/100`,
      status: scoreToBand(avgVcip),
      detail: `${studentVcip.length} verified domain assessment${studentVcip.length === 1 ? '' : 's'} · Accuracy ${Math.round(latestVcip.accuracyPct ?? 0)}%`,
    });
  }

  const studentPsych = [...(params.psychometricRecords || [])]
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.ts - a.ts);
  if (studentPsych.length > 0) {
    const latestPsych = studentPsych[0];
    let pScore: number | null = null;
    let label = 'Psychometric Evaluation';
    let detail = `${studentPsych.length} verified psychometric assessment${studentPsych.length === 1 ? '' : 's'} completed`;
    if (latestPsych.type === 'personality') {
      label = 'Big Five Personality & RIASEC';
      const vals = Object.values(latestPsych.traits || {}).map((t) => t.pomp);
      if (vals.length > 0) {
        pScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      }
      detail = `Personality & interest inventory completed (${new Date(latestPsych.ts).toISOString().slice(0, 10)})`;
    } else if (latestPsych.type === 'battery') {
      label = 'Comprehensive Cognitive Battery';
      const snap = latestPsych.snapshot;
      const idxVals = [snap.VCI, snap.VSI, snap.FRI, snap.WMI, snap.PSI].filter(
        (v) => typeof v === 'number' && Number.isFinite(v) && v > 0,
      );
      if (idxVals.length > 0) {
        const avgStandard = idxVals.reduce((a, b) => a + b, 0) / idxVals.length;
        // Map standard score (mean 100, SD 15) cleanly to a 0-100 developmental proficiency index
        pScore = Math.max(35, Math.min(100, Math.round(((avgStandard - 55) / 90) * 100)));
      }
      detail = `Multi-subtest aptitude battery · FSIQ ${snap.FSIQ} (${new Date(latestPsych.ts).toISOString().slice(0, 10)})`;
    } else if (latestPsych.type === 'iq') {
      label = 'Reasoning & Fluid Intelligence Profile';
      detail = `Verified reasoning evaluation (${new Date(latestPsych.ts).toISOString().slice(0, 10)})`;
    }
    cognitiveAndThinkingSkills.push({
      id: `psych-${latestPsych.id}`,
      domain: 'Psychometric Profile',
      skillName: label,
      score: pScore,
      displayValue: pScore !== null ? `${pScore}/100` : 'Assessed',
      status: scoreToBand(pScore),
      detail,
    });
  }

  // 4. Learning Habits & Classroom Skills (8 indicators)
  const learningHabits: AssessedSkillItem[] = breakdown
    ? Object.entries(breakdown.learningProfile.indicators).map(([key, ind]) => ({
        id: `habit-${key}`,
        domain: 'Learning Habits',
        skillName: ind.label,
        score: ind.score,
        displayValue: ind.score !== null ? `${Math.round(ind.score)}/100` : 'Not Yet Assessed',
        status: scoreToBand(ind.score),
        detail: ind.score !== null ? 'Derived from verified classroom & notebook evidence' : 'Awaiting teacher observations',
      }))
    : [];

  // 5. All 15 Officer-Like Qualities (OLQs) grouped cleanly
  const olqGroupOrder: OlqGroup[] = [
    'Planning and Organising',
    'Social Adjustment',
    'Social Effectiveness',
    'Dynamic Qualities',
  ];
  const olqGroups: OlqGroupReport[] = olqGroupOrder.map((group) => ({
    group,
    items: OLQ_DEFINITIONS.filter((d) => d.group === group).map((def) => {
      const entry = breakdown?.olqScores?.[def.key];
      const sc = entry?.score ?? null;
      return {
        key: def.key,
        index: def.index,
        name: def.name,
        score: sc !== null ? Math.round(sc) : null,
        evidenceCount: entry?.evidenceCount ?? 0,
        band:
          sc === null
            ? 'Pending'
            : sc >= 82
              ? 'Distinction'
              : sc >= 68
                ? 'Proficient'
                : sc >= 52
                  ? 'Developing'
                  : 'Needs Support',
      };
    }),
  }));

  // 6. Yearly Individual Skill Plan Targets
  const yearlySkillTargets = (params.yearlyPlan?.targets || []).map((t) => ({
    id: t.id,
    skillName: t.skillName,
    domain: t.domain,
    baselineScore: t.baselineScore,
    currentScore: t.currentScore,
    targetScore: t.targetScore,
    status: t.riskStatus,
    atRiskDueToAbsence: t.riskStatus === 'At Risk' || t.riskStatus === 'Needs Catch-Up',
    targetDate: params.yearlyPlan?.academicSession || 'Annual Session',
  }));

  // Aggregate total assessed skills count & average
  const scoredItems: number[] = [];
  for (const item of [
    ...learnersPillars,
    ...foundationalSkills,
    ...cognitiveAndThinkingSkills,
    ...learningHabits,
  ]) {
    if (item.score !== null) scoredItems.push(item.score);
  }
  for (const grp of olqGroups) {
    for (const item of grp.items) {
      if (item.score !== null) scoredItems.push(item.score);
    }
  }

  return {
    student,
    generatedAt: new Date().toISOString().slice(0, 10),
    academicSummary: {
      totalAssessments: studentMarks.length,
      classTestCount: classTestAll.count,
      utCount: utAll.count,
      semesterExamCount: semAll.count,
      classTestAvgPct: classTestAll.avgPct,
      utAvgPct: utAll.avgPct,
      semesterExamAvgPct: semAll.avgPct,
      overallObtained,
      overallMax,
      overallPct,
      overallGrade: overallPct !== null ? computeGrade(overallPct) : null,
    },
    subjectRows,
    chronologicalMarks: studentMarks,
    skillsSummary: {
      totalSkillsAssessed: scoredItems.length,
      avgSkillScore:
        scoredItems.length > 0
          ? Math.round(scoredItems.reduce((a, b) => a + b, 0) / scoredItems.length)
          : null,
      learnersOverallScore:
        breakdown && breakdown.overallScore !== null ? Math.round(breakdown.overallScore) : null,
      learnersPillars,
      foundationalSkills,
      cognitiveAndThinkingSkills,
      learningHabits,
      olqGroups,
      yearlySkillTargets,
      strengths: breakdown?.learningProfile.strengths || [],
      supportAreas: breakdown?.learningProfile.supportAreas || [],
      advisoryNote:
        breakdown?.learningProfile.advisoryNote ||
        'Continue consistent daily revision, classroom participation, and skill practice across subjects.',
    },
  };
}
