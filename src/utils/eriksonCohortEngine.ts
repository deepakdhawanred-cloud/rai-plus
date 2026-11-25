import type {
  ActivityRecord,
  CognitiveAttemptRecord,
  DevelopmentEvidence,
  DevelopmentalRemedialAssignment,
  EriksonAssessment,
  EriksonStageNumber,
  ExamMark,
  HomeworkAssignment,
  HomeworkSubmission,
  LearnersScoreBreakdown,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  NotebookEntry,
  NumeracyTestSession,
  ReadingTestSession,
  StudentRecord,
  VisParsedReportProfile,
} from '../types';
import { assessStudentEriksonDevelopment } from './eriksonDevelopmentEngine.ts';

export type EriksonDelayTier = 'delayed' | 'watch' | 'aligned' | 'pending';

export interface EriksonCohortStudentRow {
  student: StudentRecord;
  assessment: EriksonAssessment;
  delayTier: EriksonDelayTier;
  primaryDelayReason: string;
  activeAssignmentCount: number;
  completedAssignmentCount: number;
}

export interface EriksonStageCohortBucket {
  stageNumber: EriksonStageNumber;
  stageTitle: string;
  ageRangeLabel: string;
  classBandLabel: string;
  positivePole: string;
  negativePole: string;
  virtue: string;
  total: number;
  delayed: number;
  watch: number;
  aligned: number;
  pending: number;
}

export interface EriksonCohortDashboardSummary {
  totalStudents: number;
  flaggedDelayedCount: number;
  transitionalWatchCount: number;
  positiveAlignedCount: number;
  insufficientEvidenceCount: number;
  delayedPct: number;
  activeAssignmentsCount: number;
  completedAssignmentsCount: number;
  stageBuckets: EriksonStageCohortBucket[];
  classSections: string[];
  rows: EriksonCohortStudentRow[];
}

function groupByStudentId<T extends { studentId: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    let list = map.get(item.studentId);
    if (!list) {
      list = [];
      map.set(item.studentId, list);
    }
    list.push(item);
  }
  return map;
}

function sortClassSectionsNaturally(sections: string[]): string[] {
  const rank = (cls: string): number => {
    const upper = cls.trim().toUpperCase();
    if (upper.startsWith('NUR')) return -3;
    if (upper.startsWith('LKG')) return -2;
    if (upper.startsWith('UKG')) return -1;
    const m = upper.match(/\d+/);
    return m ? Number(m[0]) : 99;
  };
  return [...sections].sort((a, b) => {
    const diff = rank(a) - rank(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

function outcomeToDelayTier(status: EriksonAssessment['outcomeStatus']): EriksonDelayTier {
  if (status === 'negative_stage_alert') return 'delayed';
  if (status === 'transitional_support') return 'watch';
  if (status === 'positive_aligned') return 'aligned';
  return 'pending';
}

const SEVERITY_ORDER: Record<EriksonDelayTier, number> = {
  delayed: 0,
  watch: 1,
  pending: 2,
  aligned: 3,
};

/**
 * Evaluates an entire school or teacher-scoped student cohort against Erikson's
 * Psychosocial Development stages in O(N + M) time using pre-indexed maps,
 * flagging students whose present stage lags behind age/class expectations.
 */
export function assessCohortEriksonDevelopment(params: {
  students: StudentRecord[];
  studentBreakdowns?: Record<string, LearnersScoreBreakdown>;
  evidence?: DevelopmentEvidence[];
  examMarks?: ExamMark[];
  notebookEntries?: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  activityRecords?: ActivityRecord[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  readingTestSessions?: ReadingTestSession[];
  numeracyTestSessions?: NumeracyTestSession[];
  cognitiveAttempts?: CognitiveAttemptRecord[];
  visParsedReports?: Record<string, VisParsedReportProfile>;
  remedialAssignments?: DevelopmentalRemedialAssignment[];
}): EriksonCohortDashboardSummary {
  const {
    students,
    studentBreakdowns = {},
    evidence = [],
    examMarks = [],
    notebookEntries = [],
    homeworkAssignments = [],
    homeworkSubmissions = [],
    activityRecords = [],
    readingReports = [],
    numeracyReports = [],
    readingTestSessions = [],
    numeracyTestSessions = [],
    cognitiveAttempts = [],
    visParsedReports = {},
    remedialAssignments = [],
  } = params;

  // Pre-index all arrays once by studentId so 535+ student assessment runs in O(N + M)
  const evidenceByStudent = groupByStudentId(evidence);
  const marksByStudent = groupByStudentId(examMarks);
  const notebooksByStudent = groupByStudentId(notebookEntries);
  const hwSubsByStudent = groupByStudentId(homeworkSubmissions);
  const readingByStudent = groupByStudentId(readingReports);
  const numeracyByStudent = groupByStudentId(numeracyReports);
  const readingSessionsByStudent = groupByStudentId(readingTestSessions);
  const numeracySessionsByStudent = groupByStudentId(numeracyTestSessions);
  const cogByStudent = groupByStudentId(cognitiveAttempts);
  const assignmentsByStudent = groupByStudentId(remedialAssignments);

  const hwByClass = new Map<string, HomeworkAssignment[]>();
  for (const hw of homeworkAssignments) {
    let list = hwByClass.get(hw.classSection);
    if (!list) {
      list = [];
      hwByClass.set(hw.classSection, list);
    }
    list.push(hw);
  }

  const activitiesByStudent = new Map<string, ActivityRecord[]>();
  for (const act of activityRecords) {
    for (const entry of act.entries) {
      if (!entry.tookPart) continue;
      let list = activitiesByStudent.get(entry.studentId);
      if (!list) {
        list = [];
        activitiesByStudent.set(entry.studentId, list);
      }
      list.push(act);
    }
  }

  const stageBucketMap = new Map<EriksonStageNumber, EriksonStageCohortBucket>([
    [
      3,
      {
        stageNumber: 3,
        stageTitle: 'Stage 3 · Initiative vs. Guilt',
        ageRangeLabel: 'Ages 3–5',
        classBandLabel: 'Nursery – UKG',
        positivePole: 'Initiative',
        negativePole: 'Guilt',
        virtue: 'Purpose',
        total: 0,
        delayed: 0,
        watch: 0,
        aligned: 0,
        pending: 0,
      },
    ],
    [
      4,
      {
        stageNumber: 4,
        stageTitle: 'Stage 4 · Industry vs. Inferiority',
        ageRangeLabel: 'Ages 6–11',
        classBandLabel: 'Classes 1–6',
        positivePole: 'Industry',
        negativePole: 'Inferiority',
        virtue: 'Competence',
        total: 0,
        delayed: 0,
        watch: 0,
        aligned: 0,
        pending: 0,
      },
    ],
    [
      5,
      {
        stageNumber: 5,
        stageTitle: 'Stage 5 · Identity vs. Role Confusion',
        ageRangeLabel: 'Ages 12–18',
        classBandLabel: 'Classes 7–12',
        positivePole: 'Identity',
        negativePole: 'Role Confusion',
        virtue: 'Fidelity',
        total: 0,
        delayed: 0,
        watch: 0,
        aligned: 0,
        pending: 0,
      },
    ],
  ]);

  const classSectionSet = new Set<string>();
  const rows: EriksonCohortStudentRow[] = [];
  let flaggedDelayedCount = 0;
  let transitionalWatchCount = 0;
  let positiveAlignedCount = 0;
  let insufficientEvidenceCount = 0;

  for (const student of students) {
    classSectionSet.add(student.classSection);
    const visProfile = student.visReportFileId ? visParsedReports[student.visReportFileId] : null;

    const assessment = assessStudentEriksonDevelopment({
      student,
      breakdown: studentBreakdowns[student.id],
      evidence: evidenceByStudent.get(student.id) ?? [],
      examMarks: marksByStudent.get(student.id) ?? [],
      notebookEntries: notebooksByStudent.get(student.id) ?? [],
      homeworkAssignments: hwByClass.get(student.classSection) ?? [],
      homeworkSubmissions: hwSubsByStudent.get(student.id) ?? [],
      activityRecords: activitiesByStudent.get(student.id) ?? [],
      readingReports: readingByStudent.get(student.id) ?? [],
      numeracyReports: numeracyByStudent.get(student.id) ?? [],
      readingTestSessions: readingSessionsByStudent.get(student.id) ?? [],
      numeracyTestSessions: numeracySessionsByStudent.get(student.id) ?? [],
      cognitiveAttempts: cogByStudent.get(student.id) ?? [],
      visProfile,
    });

    const delayTier = outcomeToDelayTier(assessment.outcomeStatus);
    if (delayTier === 'delayed') flaggedDelayedCount += 1;
    else if (delayTier === 'watch') transitionalWatchCount += 1;
    else if (delayTier === 'aligned') positiveAlignedCount += 1;
    else insufficientEvidenceCount += 1;

    const bucket = stageBucketMap.get(assessment.expectedStage.stageNumber);
    if (bucket) {
      bucket.total += 1;
      bucket[delayTier] += 1;
    }

    const stuAssignments = assignmentsByStudent.get(student.id) ?? [];
    const activeAssignmentCount = stuAssignments.filter((a) => a.status !== 'Completed').length;
    const completedAssignmentCount = stuAssignments.filter((a) => a.status === 'Completed').length;

    const primaryDelayReason =
      assessment.negativeSignals.length > 0
        ? assessment.negativeSignals.map((s) => s.label).slice(0, 2).join(' · ')
        : delayTier === 'watch'
          ? `Readiness ${assessment.readinessScorePct ?? '—'}/100 — needs consistent scaffolding`
          : delayTier === 'pending'
            ? 'Insufficient multi-source observations yet'
            : `Aligned with Stage ${assessment.expectedStage.stageNumber} ${assessment.expectedStage.positivePole}`;

    rows.push({
      student,
      assessment,
      delayTier,
      primaryDelayReason,
      activeAssignmentCount,
      completedAssignmentCount,
    });
  }

  rows.sort((a, b) => {
    const sevDiff = SEVERITY_ORDER[a.delayTier] - SEVERITY_ORDER[b.delayTier];
    if (sevDiff !== 0) return sevDiff;
    const negDiff = b.assessment.negativeSignals.length - a.assessment.negativeSignals.length;
    if (negDiff !== 0) return negDiff;
    const scoreA = a.assessment.readinessScorePct ?? 999;
    const scoreB = b.assessment.readinessScorePct ?? 999;
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.student.name.localeCompare(b.student.name);
  });

  const activeAssignmentsCount = remedialAssignments.filter((a) => a.status !== 'Completed').length;
  const completedAssignmentsCount = remedialAssignments.filter((a) => a.status === 'Completed').length;

  return {
    totalStudents: students.length,
    flaggedDelayedCount,
    transitionalWatchCount,
    positiveAlignedCount,
    insufficientEvidenceCount,
    delayedPct:
      students.length > 0 ? Math.round((flaggedDelayedCount / students.length) * 100) : 0,
    activeAssignmentsCount,
    completedAssignmentsCount,
    stageBuckets: Array.from(stageBucketMap.values()),
    classSections: sortClassSectionsNaturally(Array.from(classSectionSet)),
    rows,
  };
}
