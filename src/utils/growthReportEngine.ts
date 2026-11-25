import type {
  AcademicMonthKey,
  DevelopmentEvidence,
  ExamMark,
  LearnersWeights,
  MonthlyAttendanceSummary,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  ReadingBand,
  StudentRecord,
} from '../types';
import {
  calculateLearnersScore,
  deduplicateEvidence,
  DEFAULT_LEARNERS_WEIGHTS,
} from './evidenceEngine.ts';
import { ACTIVE_SESSION_MONTHS, compareClassSections } from './visAcademicProgressEngine.ts';

export interface StudentReadingMonthPoint {
  month: AcademicMonthKey;
  shortMonth: string;
  report: MonthlyReadingReport | null;
  wpm: number | null;
  accuracyPct: number | null;
  comprehensionPct: number | null;
  overallPct: number | null;
  momDeltaPct: number | null;
  wpmMomDelta: number | null;
  readingBand: ReadingBand | null;
  remarks: string;
}

export interface StudentReadingGrowthSeries {
  points: StudentReadingMonthPoint[];
  recordedCount: number;
  startMonth: AcademicMonthKey | null;
  latestMonth: AcademicMonthKey | null;
  startOverallPct: number | null;
  latestOverallPct: number | null;
  netOverallDelta: number | null;
  startWpm: number | null;
  latestWpm: number | null;
  netWpmDelta: number | null;
  peakMonth: AcademicMonthKey | null;
  peakScorePct: number | null;
  currentBand: ReadingBand | null;
  trendDirection: 'up' | 'down' | 'flat';
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}

function computeDirection(delta: number | null): 'up' | 'down' | 'flat' {
  if (delta === null || Math.abs(delta) < 0.5) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

export function buildStudentReadingGrowthSeries(
  reports: MonthlyReadingReport[],
  studentId: string,
): StudentReadingGrowthSeries {
  const byMonth = new Map<AcademicMonthKey, MonthlyReadingReport>();
  for (const r of reports) {
    if (r.studentId === studentId) {
      byMonth.set(r.month, r);
    }
  }

  let prevOverall: number | null = null;
  let prevWpm: number | null = null;
  let firstPoint: StudentReadingMonthPoint | null = null;
  let latestPoint: StudentReadingMonthPoint | null = null;
  let peakMonth: AcademicMonthKey | null = null;
  let peakScorePct: number | null = null;
  let recordedCount = 0;

  const points: StudentReadingMonthPoint[] = [];
  for (const month of ACTIVE_SESSION_MONTHS) {
    const report = byMonth.get(month) || null;
    if (!report) {
      points.push({
        month,
        shortMonth: month.slice(0, 3),
        report: null,
        wpm: null,
        accuracyPct: null,
        comprehensionPct: null,
        overallPct: null,
        momDeltaPct: null,
        wpmMomDelta: null,
        readingBand: null,
        remarks: '',
      });
      continue;
    }

    recordedCount += 1;
    const momDeltaPct = prevOverall !== null ? round1(report.overallPct - prevOverall) : null;
    const wpmMomDelta = prevWpm !== null ? report.wpm - prevWpm : null;
    prevOverall = report.overallPct;
    prevWpm = report.wpm;

    const pt: StudentReadingMonthPoint = {
      month,
      shortMonth: month.slice(0, 3),
      report,
      wpm: report.wpm,
      accuracyPct: report.accuracyPct,
      comprehensionPct: report.comprehensionPct,
      overallPct: report.overallPct,
      momDeltaPct,
      wpmMomDelta,
      readingBand: report.readingBand,
      remarks: report.remarks,
    };

    if (!firstPoint) firstPoint = pt;
    latestPoint = pt;
    if (peakScorePct === null || report.overallPct >= peakScorePct) {
      peakScorePct = report.overallPct;
      peakMonth = month;
    }
    points.push(pt);
  }

  const netOverallDelta =
    firstPoint && latestPoint && firstPoint.month !== latestPoint.month
      ? round1((latestPoint.overallPct ?? 0) - (firstPoint.overallPct ?? 0))
      : recordedCount >= 1
        ? 0
        : null;
  const netWpmDelta =
    firstPoint && latestPoint && firstPoint.month !== latestPoint.month
      ? (latestPoint.wpm ?? 0) - (firstPoint.wpm ?? 0)
      : recordedCount >= 1
        ? 0
        : null;

  return {
    points,
    recordedCount,
    startMonth: firstPoint?.month ?? null,
    latestMonth: latestPoint?.month ?? null,
    startOverallPct: firstPoint?.overallPct ?? null,
    latestOverallPct: latestPoint?.overallPct ?? null,
    netOverallDelta,
    startWpm: firstPoint?.wpm ?? null,
    latestWpm: latestPoint?.wpm ?? null,
    netWpmDelta,
    peakMonth,
    peakScorePct,
    currentBand: latestPoint?.readingBand ?? null,
    trendDirection: computeDirection(netOverallDelta),
  };
}

export interface StudentNumeracyMonthPoint {
  month: AcademicMonthKey;
  shortMonth: string;
  report: MonthlyNumeracyReport | null;
  tablesFluencyPct: number | null;
  mentalMathPct: number | null;
  problemSolvingPct: number | null;
  overallPct: number | null;
  momDeltaPct: number | null;
  conceptualGap: string;
  remarks: string;
}

export interface StudentNumeracyGrowthSeries {
  points: StudentNumeracyMonthPoint[];
  recordedCount: number;
  startMonth: AcademicMonthKey | null;
  latestMonth: AcademicMonthKey | null;
  startOverallPct: number | null;
  latestOverallPct: number | null;
  netOverallDelta: number | null;
  peakMonth: AcademicMonthKey | null;
  peakScorePct: number | null;
  strongestArea: string | null;
  focusArea: string | null;
  trendDirection: 'up' | 'down' | 'flat';
}

export function buildStudentNumeracyGrowthSeries(
  reports: MonthlyNumeracyReport[],
  studentId: string,
): StudentNumeracyGrowthSeries {
  const byMonth = new Map<AcademicMonthKey, MonthlyNumeracyReport>();
  for (const r of reports) {
    if (r.studentId === studentId) {
      byMonth.set(r.month, r);
    }
  }

  let prevOverall: number | null = null;
  let firstPoint: StudentNumeracyMonthPoint | null = null;
  let latestPoint: StudentNumeracyMonthPoint | null = null;
  let peakMonth: AcademicMonthKey | null = null;
  let peakScorePct: number | null = null;
  let recordedCount = 0;

  const points: StudentNumeracyMonthPoint[] = [];
  for (const month of ACTIVE_SESSION_MONTHS) {
    const report = byMonth.get(month) || null;
    if (!report) {
      points.push({
        month,
        shortMonth: month.slice(0, 3),
        report: null,
        tablesFluencyPct: null,
        mentalMathPct: null,
        problemSolvingPct: null,
        overallPct: null,
        momDeltaPct: null,
        conceptualGap: '',
        remarks: '',
      });
      continue;
    }

    recordedCount += 1;
    const momDeltaPct = prevOverall !== null ? round1(report.overallPct - prevOverall) : null;
    prevOverall = report.overallPct;

    const pt: StudentNumeracyMonthPoint = {
      month,
      shortMonth: month.slice(0, 3),
      report,
      tablesFluencyPct: report.tablesFluencyPct,
      mentalMathPct: report.mentalMathPct,
      problemSolvingPct: report.problemSolvingPct,
      overallPct: report.overallPct,
      momDeltaPct,
      conceptualGap: report.conceptualGap || '',
      remarks: report.remarks,
    };

    if (!firstPoint) firstPoint = pt;
    latestPoint = pt;
    if (peakScorePct === null || report.overallPct >= peakScorePct) {
      peakScorePct = report.overallPct;
      peakMonth = month;
    }
    points.push(pt);
  }

  const netOverallDelta =
    firstPoint && latestPoint && firstPoint.month !== latestPoint.month
      ? round1((latestPoint.overallPct ?? 0) - (firstPoint.overallPct ?? 0))
      : recordedCount >= 1
        ? 0
        : null;

  let strongestArea: string | null = null;
  let focusArea: string | null = null;
  if (latestPoint?.report) {
    const dims = [
      { label: 'Tables Fluency', val: latestPoint.report.tablesFluencyPct },
      { label: 'Mental Math', val: latestPoint.report.mentalMathPct },
      { label: 'Problem Solving', val: latestPoint.report.problemSolvingPct },
    ].sort((a, b) => b.val - a.val);
    strongestArea = dims[0].label;
    focusArea = dims[dims.length - 1].label;
  }

  return {
    points,
    recordedCount,
    startMonth: firstPoint?.month ?? null,
    latestMonth: latestPoint?.month ?? null,
    startOverallPct: firstPoint?.overallPct ?? null,
    latestOverallPct: latestPoint?.overallPct ?? null,
    netOverallDelta,
    peakMonth,
    peakScorePct,
    strongestArea,
    focusArea,
    trendDirection: computeDirection(netOverallDelta),
  };
}

export interface StudentAttendanceMonthPoint {
  month: AcademicMonthKey;
  shortMonth: string;
  summary: MonthlyAttendanceSummary | null;
  attendancePct: number | null;
  workingDays: number | null;
  presentDays: number | null;
  absentDays: number | null;
  leaveDays: number | null;
  momDeltaPct: number | null;
}

export interface StudentAttendanceGrowthSeries {
  points: StudentAttendanceMonthPoint[];
  recordedCount: number;
  totalWorkingDays: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLeaveDays: number;
  ytdCalculatedPct: number | null;
  netAttendanceDeltaPct: number | null;
  lowestMonth: AcademicMonthKey | null;
}

export function buildStudentAttendanceGrowthSeries(
  monthlyAttendance: MonthlyAttendanceSummary[],
  studentId: string,
): StudentAttendanceGrowthSeries {
  const byMonth = new Map<AcademicMonthKey, MonthlyAttendanceSummary>();
  for (const row of monthlyAttendance) {
    if (row.studentId === studentId) {
      byMonth.set(row.month, row);
    }
  }

  let prevPct: number | null = null;
  let firstPct: number | null = null;
  let latestPct: number | null = null;
  let recordedCount = 0;
  let totalWorkingDays = 0;
  let totalPresentDays = 0;
  let totalAbsentDays = 0;
  let totalLeaveDays = 0;
  let lowestMonth: AcademicMonthKey | null = null;
  let lowestPct: number | null = null;

  const points: StudentAttendanceMonthPoint[] = ACTIVE_SESSION_MONTHS.map((month) => {
    const summary = byMonth.get(month) || null;
    if (!summary) {
      return {
        month,
        shortMonth: month.slice(0, 3),
        summary: null,
        attendancePct: null,
        workingDays: null,
        presentDays: null,
        absentDays: null,
        leaveDays: null,
        momDeltaPct: null,
      };
    }

    recordedCount += 1;
    totalWorkingDays += summary.workingDays;
    totalPresentDays += summary.presentDays;
    totalAbsentDays += summary.absentDays;
    totalLeaveDays += summary.leaveDays;

    const momDeltaPct = prevPct !== null ? round1(summary.attendancePct - prevPct) : null;
    prevPct = summary.attendancePct;
    if (firstPct === null) firstPct = summary.attendancePct;
    latestPct = summary.attendancePct;

    if (lowestPct === null || summary.attendancePct < lowestPct) {
      lowestPct = summary.attendancePct;
      lowestMonth = month;
    }

    return {
      month,
      shortMonth: month.slice(0, 3),
      summary,
      attendancePct: summary.attendancePct,
      workingDays: summary.workingDays,
      presentDays: summary.presentDays,
      absentDays: summary.absentDays,
      leaveDays: summary.leaveDays,
      momDeltaPct,
    };
  });

  const ytdCalculatedPct =
    totalWorkingDays > 0 ? round1((totalPresentDays / totalWorkingDays) * 100) : null;
  const netAttendanceDeltaPct =
    firstPct !== null && latestPct !== null && recordedCount > 1
      ? round1(latestPct - firstPct)
      : recordedCount === 1
        ? 0
        : null;

  return {
    points,
    recordedCount,
    totalWorkingDays,
    totalPresentDays,
    totalAbsentDays,
    totalLeaveDays,
    ytdCalculatedPct,
    netAttendanceDeltaPct,
    lowestMonth,
  };
}

export function sortExamCycleNames(examNames: Iterable<string>): string[] {
  return Array.from(new Set(examNames)).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );
}

export function shortExamLabel(examName: string): string {
  const m = examName.match(/unit\s*test\s*(\d+)/i);
  if (m) return `UT-${m[1]}`;
  const m2 = examName.match(/unit\s*assessment\s*(I+|V|\d+)/i);
  if (m2) return `UA-${m2[1]}`;
  if (/term[- ]?1\s*hbse/i.test(examName)) return 'Term-1 HBSE';
  if (/term[- ]?2\s*hbse/i.test(examName)) return 'Term-2 HBSE';
  return examName.length > 14 ? `${examName.slice(0, 12)}…` : examName;
}

export interface StudentUtSubjectRow {
  subject: string;
  byExam: Record<string, { mark: ExamMark; pct: number }>;
  firstPct: number | null;
  latestPct: number | null;
  netDeltaPct: number | null;
  latestGap: string;
}

export interface StudentUtProgressionMatrix {
  examNames: string[];
  cycleAverages: Array<{ examName: string; shortName: string; avgPct: number; subjectCount: number }>;
  subjectRows: StudentUtSubjectRow[];
  overallAvgPct: number | null;
  netCycleDeltaPct: number | null;
}

export function buildStudentUtProgressionMatrix(
  examMarks: ExamMark[],
  studentId: string,
): StudentUtProgressionMatrix {
  const mine = examMarks.filter((m) => m.studentId === studentId);
  const examNames = sortExamCycleNames(mine.map((m) => m.examName));
  const subjects = Array.from(new Set(mine.map((m) => m.subject))).sort((a, b) =>
    a.localeCompare(b),
  );

  const subjectRows: StudentUtSubjectRow[] = subjects.map((subject) => {
    const byExam: Record<string, { mark: ExamMark; pct: number }> = {};
    const orderedPcts: number[] = [];
    let latestGap = '';

    for (const ex of examNames) {
      const mark = mine.find((m) => m.subject === subject && m.examName === ex);
      if (!mark) continue;
      const pct = mark.maxMarks > 0 ? round1((mark.obtainedMarks / mark.maxMarks) * 100) : 0;
      byExam[ex] = { mark, pct };
      orderedPcts.push(pct);
      if (mark.conceptualGap) latestGap = mark.conceptualGap;
    }

    const firstPct = orderedPcts.length > 0 ? orderedPcts[0] : null;
    const latestPct = orderedPcts.length > 0 ? orderedPcts[orderedPcts.length - 1] : null;
    const netDeltaPct =
      firstPct !== null && latestPct !== null && orderedPcts.length > 1
        ? round1(latestPct - firstPct)
        : orderedPcts.length === 1
          ? 0
          : null;

    return {
      subject,
      byExam,
      firstPct,
      latestPct,
      netDeltaPct,
      latestGap,
    };
  });

  const cycleAverages = examNames.map((examName) => {
    const marksForCycle = mine.filter((m) => m.examName === examName);
    const avgPct =
      marksForCycle.length > 0
        ? round1(
            marksForCycle.reduce(
              (s, m) => s + (m.maxMarks > 0 ? (m.obtainedMarks / m.maxMarks) * 100 : 0),
              0,
            ) / marksForCycle.length,
          )
        : 0;
    return {
      examName,
      shortName: shortExamLabel(examName),
      avgPct,
      subjectCount: marksForCycle.length,
    };
  });

  const overallAvgPct =
    mine.length > 0
      ? round1(
          mine.reduce(
            (s, m) => s + (m.maxMarks > 0 ? (m.obtainedMarks / m.maxMarks) * 100 : 0),
            0,
          ) / mine.length,
        )
      : null;

  const netCycleDeltaPct =
    cycleAverages.length > 1
      ? round1(cycleAverages[cycleAverages.length - 1].avgPct - cycleAverages[0].avgPct)
      : cycleAverages.length === 1
        ? 0
        : null;

  return {
    examNames,
    cycleAverages,
    subjectRows,
    overallAvgPct,
    netCycleDeltaPct,
  };
}

export interface CohortReadingMonthAggregate {
  month: AcademicMonthKey;
  shortMonth: string;
  assessedCount: number;
  avgOverallPct: number;
  avgWpm: number;
  avgAccuracyPct: number;
  avgComprehensionPct: number;
  belowBenchmarkCount: number;
  fluentCount: number;
}

export interface CohortReadingStudentGrowthRow {
  student: StudentRecord;
  byMonth: Partial<Record<AcademicMonthKey, MonthlyReadingReport>>;
  firstPct: number | null;
  latestPct: number | null;
  netDeltaPct: number | null;
  startWpm: number | null;
  latestWpm: number | null;
  netWpmDelta: number | null;
  latestBand: ReadingBand | null;
  latestRemarks: string;
}

export interface CohortReadingGrowthMatrix {
  monthlyCohortSeries: CohortReadingMonthAggregate[];
  studentRows: CohortReadingStudentGrowthRow[];
  totalAssessedStudents: number;
  latestMonthLabel: AcademicMonthKey | null;
  latestAvgOverallPct: number;
  latestAvgWpm: number;
  avgNetDeltaPct: number;
  improvedCount: number;
  belowBenchmarkLatestCount: number;
}

export function buildCohortReadingGrowthMatrix(
  students: StudentRecord[],
  reports: MonthlyReadingReport[],
  classSectionFilter: string = 'All',
): CohortReadingGrowthMatrix {
  const scopedStudents = students
    .filter((s) => classSectionFilter === 'All' || s.classSection === classSectionFilter)
    .sort((a, b) => {
      const cmp = compareClassSections(a.classSection, b.classSection);
      if (cmp !== 0) return cmp;
      return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
    });

  const scopedIdSet = new Set(scopedStudents.map((s) => s.id));
  const byStudent = new Map<string, Partial<Record<AcademicMonthKey, MonthlyReadingReport>>>();
  const byMonth = new Map<AcademicMonthKey, MonthlyReadingReport[]>();

  for (const r of reports) {
    if (!scopedIdSet.has(r.studentId)) continue;
    if (!byStudent.has(r.studentId)) byStudent.set(r.studentId, {});
    byStudent.get(r.studentId)![r.month] = r;
    if (!byMonth.has(r.month)) byMonth.set(r.month, []);
    byMonth.get(r.month)!.push(r);
  }

  const monthlyCohortSeries: CohortReadingMonthAggregate[] = ACTIVE_SESSION_MONTHS.map((month) => {
    const list = byMonth.get(month) || [];
    if (list.length === 0) {
      return {
        month,
        shortMonth: month.slice(0, 3),
        assessedCount: 0,
        avgOverallPct: 0,
        avgWpm: 0,
        avgAccuracyPct: 0,
        avgComprehensionPct: 0,
        belowBenchmarkCount: 0,
        fluentCount: 0,
      };
    }
    return {
      month,
      shortMonth: month.slice(0, 3),
      assessedCount: list.length,
      avgOverallPct: round1(list.reduce((s, r) => s + r.overallPct, 0) / list.length),
      avgWpm: Math.round(list.reduce((s, r) => s + r.wpm, 0) / list.length),
      avgAccuracyPct: round1(list.reduce((s, r) => s + r.accuracyPct, 0) / list.length),
      avgComprehensionPct: round1(list.reduce((s, r) => s + r.comprehensionPct, 0) / list.length),
      belowBenchmarkCount: list.filter((r) => r.overallPct < 65).length,
      fluentCount: list.filter((r) => r.readingBand === 'Fluent').length,
    };
  });

  const studentRows: CohortReadingStudentGrowthRow[] = [];
  for (const student of scopedStudents) {
    const map = byStudent.get(student.id) || {};
    const ordered = ACTIVE_SESSION_MONTHS.map((m) => map[m]).filter(
      (r): r is MonthlyReadingReport => Boolean(r),
    );
    if (ordered.length === 0 && classSectionFilter === 'All') continue;

    const first = ordered[0] || null;
    const latest = ordered[ordered.length - 1] || null;
    const netDeltaPct =
      first && latest && ordered.length > 1
        ? round1(latest.overallPct - first.overallPct)
        : first
          ? 0
          : null;
    const netWpmDelta =
      first && latest && ordered.length > 1
        ? latest.wpm - first.wpm
        : first
          ? 0
          : null;

    studentRows.push({
      student,
      byMonth: map,
      firstPct: first?.overallPct ?? null,
      latestPct: latest?.overallPct ?? null,
      netDeltaPct,
      startWpm: first?.wpm ?? null,
      latestWpm: latest?.wpm ?? null,
      netWpmDelta,
      latestBand: latest?.readingBand ?? null,
      latestRemarks: latest?.remarks ?? '',
    });
  }

  const activeMonths = monthlyCohortSeries.filter((m) => m.assessedCount > 0);
  const latestAgg = activeMonths[activeMonths.length - 1] || null;
  const deltas = studentRows
    .map((r) => r.netDeltaPct)
    .filter((d): d is number => d !== null);
  const avgNetDeltaPct =
    deltas.length > 0 ? round1(deltas.reduce((s, d) => s + d, 0) / deltas.length) : 0;
  const improvedCount = deltas.filter((d) => d > 0).length;

  return {
    monthlyCohortSeries,
    studentRows,
    totalAssessedStudents: studentRows.filter((r) => r.latestPct !== null).length,
    latestMonthLabel: latestAgg?.month ?? null,
    latestAvgOverallPct: latestAgg?.avgOverallPct ?? 0,
    latestAvgWpm: latestAgg?.avgWpm ?? 0,
    avgNetDeltaPct,
    improvedCount,
    belowBenchmarkLatestCount: latestAgg?.belowBenchmarkCount ?? 0,
  };
}

export interface CohortNumeracyMonthAggregate {
  month: AcademicMonthKey;
  shortMonth: string;
  assessedCount: number;
  avgOverallPct: number;
  avgTablesPct: number;
  avgMentalMathPct: number;
  avgProblemSolvingPct: number;
  belowBenchmarkCount: number;
}

export interface CohortNumeracyStudentGrowthRow {
  student: StudentRecord;
  byMonth: Partial<Record<AcademicMonthKey, MonthlyNumeracyReport>>;
  firstPct: number | null;
  latestPct: number | null;
  netDeltaPct: number | null;
  latestTablesPct: number | null;
  latestMentalMathPct: number | null;
  latestProblemSolvingPct: number | null;
  latestGap: string;
  latestRemarks: string;
}

export interface CohortNumeracyGrowthMatrix {
  monthlyCohortSeries: CohortNumeracyMonthAggregate[];
  studentRows: CohortNumeracyStudentGrowthRow[];
  totalAssessedStudents: number;
  latestMonthLabel: AcademicMonthKey | null;
  latestAvgOverallPct: number;
  latestAvgTablesPct: number;
  avgNetDeltaPct: number;
  improvedCount: number;
  belowBenchmarkLatestCount: number;
}

export function buildCohortNumeracyGrowthMatrix(
  students: StudentRecord[],
  reports: MonthlyNumeracyReport[],
  classSectionFilter: string = 'All',
): CohortNumeracyGrowthMatrix {
  const scopedStudents = students
    .filter((s) => classSectionFilter === 'All' || s.classSection === classSectionFilter)
    .sort((a, b) => {
      const cmp = compareClassSections(a.classSection, b.classSection);
      if (cmp !== 0) return cmp;
      return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
    });

  const scopedIdSet = new Set(scopedStudents.map((s) => s.id));
  const byStudent = new Map<string, Partial<Record<AcademicMonthKey, MonthlyNumeracyReport>>>();
  const byMonth = new Map<AcademicMonthKey, MonthlyNumeracyReport[]>();

  for (const r of reports) {
    if (!scopedIdSet.has(r.studentId)) continue;
    if (!byStudent.has(r.studentId)) byStudent.set(r.studentId, {});
    byStudent.get(r.studentId)![r.month] = r;
    if (!byMonth.has(r.month)) byMonth.set(r.month, []);
    byMonth.get(r.month)!.push(r);
  }

  const monthlyCohortSeries: CohortNumeracyMonthAggregate[] = ACTIVE_SESSION_MONTHS.map((month) => {
    const list = byMonth.get(month) || [];
    if (list.length === 0) {
      return {
        month,
        shortMonth: month.slice(0, 3),
        assessedCount: 0,
        avgOverallPct: 0,
        avgTablesPct: 0,
        avgMentalMathPct: 0,
        avgProblemSolvingPct: 0,
        belowBenchmarkCount: 0,
      };
    }
    return {
      month,
      shortMonth: month.slice(0, 3),
      assessedCount: list.length,
      avgOverallPct: round1(list.reduce((s, r) => s + r.overallPct, 0) / list.length),
      avgTablesPct: round1(list.reduce((s, r) => s + r.tablesFluencyPct, 0) / list.length),
      avgMentalMathPct: round1(list.reduce((s, r) => s + r.mentalMathPct, 0) / list.length),
      avgProblemSolvingPct: round1(
        list.reduce((s, r) => s + r.problemSolvingPct, 0) / list.length,
      ),
      belowBenchmarkCount: list.filter((r) => r.overallPct < 65).length,
    };
  });

  const studentRows: CohortNumeracyStudentGrowthRow[] = [];
  for (const student of scopedStudents) {
    const map = byStudent.get(student.id) || {};
    const ordered = ACTIVE_SESSION_MONTHS.map((m) => map[m]).filter(
      (r): r is MonthlyNumeracyReport => Boolean(r),
    );
    if (ordered.length === 0 && classSectionFilter === 'All') continue;

    const first = ordered[0] || null;
    const latest = ordered[ordered.length - 1] || null;
    const netDeltaPct =
      first && latest && ordered.length > 1
        ? round1(latest.overallPct - first.overallPct)
        : first
          ? 0
          : null;

    studentRows.push({
      student,
      byMonth: map,
      firstPct: first?.overallPct ?? null,
      latestPct: latest?.overallPct ?? null,
      netDeltaPct,
      latestTablesPct: latest?.tablesFluencyPct ?? null,
      latestMentalMathPct: latest?.mentalMathPct ?? null,
      latestProblemSolvingPct: latest?.problemSolvingPct ?? null,
      latestGap: latest?.conceptualGap || '',
      latestRemarks: latest?.remarks || '',
    });
  }

  const activeMonths = monthlyCohortSeries.filter((m) => m.assessedCount > 0);
  const latestAgg = activeMonths[activeMonths.length - 1] || null;
  const deltas = studentRows
    .map((r) => r.netDeltaPct)
    .filter((d): d is number => d !== null);
  const avgNetDeltaPct =
    deltas.length > 0 ? round1(deltas.reduce((s, d) => s + d, 0) / deltas.length) : 0;
  const improvedCount = deltas.filter((d) => d > 0).length;

  return {
    monthlyCohortSeries,
    studentRows,
    totalAssessedStudents: studentRows.filter((r) => r.latestPct !== null).length,
    latestMonthLabel: latestAgg?.month ?? null,
    latestAvgOverallPct: latestAgg?.avgOverallPct ?? 0,
    latestAvgTablesPct: latestAgg?.avgTablesPct ?? 0,
    avgNetDeltaPct,
    improvedCount,
    belowBenchmarkLatestCount: latestAgg?.belowBenchmarkCount ?? 0,
  };
}

export interface CohortUtStudentCycleRow {
  student: StudentRecord;
  byExam: Record<string, { avgPct: number; count: number; gaps: string[] }>;
  firstPct: number | null;
  latestPct: number | null;
  netDeltaPct: number | null;
}

export interface CohortUtComparisonMatrix {
  examNames: string[];
  cycleSeries: Array<{
    examName: string;
    shortName: string;
    avgPct: number;
    benchmarkRatePct: number;
    passRatePct: number;
    studentCount: number;
  }>;
  studentRows: CohortUtStudentCycleRow[];
}

export function buildCohortUtComparisonMatrix(
  students: StudentRecord[],
  examMarks: ExamMark[],
  classSectionFilter: string = 'All',
  subjectFilter: string = 'All',
): CohortUtComparisonMatrix {
  const scopedStudents = students
    .filter((s) => classSectionFilter === 'All' || s.classSection === classSectionFilter)
    .sort((a, b) => {
      const cmp = compareClassSections(a.classSection, b.classSection);
      if (cmp !== 0) return cmp;
      return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
    });

  const scopedIds = new Set(scopedStudents.map((s) => s.id));
  const filteredMarks = examMarks.filter(
    (m) =>
      scopedIds.has(m.studentId) &&
      (subjectFilter === 'All' || m.subject === subjectFilter),
  );

  const examNames = sortExamCycleNames(filteredMarks.map((m) => m.examName));

  const cycleSeries = examNames.map((examName) => {
    const marks = filteredMarks.filter((m) => m.examName === examName);
    const pcts = marks.map((m) => (m.maxMarks > 0 ? (m.obtainedMarks / m.maxMarks) * 100 : 0));
    const avgPct = pcts.length > 0 ? round1(pcts.reduce((s, p) => s + p, 0) / pcts.length) : 0;
    const atBenchmark = pcts.filter((p) => p >= 65).length;
    const benchmarkRatePct = pcts.length > 0 ? round1((atBenchmark / pcts.length) * 100) : 0;
    const passed = pcts.filter((p) => p >= 33).length;
    const passRatePct = pcts.length > 0 ? round1((passed / pcts.length) * 100) : 0;
    const studentCount = new Set(marks.map((m) => m.studentId)).size;
    return {
      examName,
      shortName: shortExamLabel(examName),
      avgPct,
      benchmarkRatePct,
      passRatePct,
      studentCount,
    };
  });

  const marksByStudent = new Map<string, ExamMark[]>();
  for (const m of filteredMarks) {
    if (!marksByStudent.has(m.studentId)) marksByStudent.set(m.studentId, []);
    marksByStudent.get(m.studentId)!.push(m);
  }

  const studentRows: CohortUtStudentCycleRow[] = [];
  for (const student of scopedStudents) {
    const stuMarks = marksByStudent.get(student.id) || [];
    if (stuMarks.length === 0) continue;

    const byExam: Record<string, { avgPct: number; count: number; gaps: string[] }> = {};
    const orderedPcts: number[] = [];

    for (const ex of examNames) {
      const exMarks = stuMarks.filter((m) => m.examName === ex);
      if (exMarks.length === 0) continue;
      const avgPct = round1(
        exMarks.reduce(
          (s, m) => s + (m.maxMarks > 0 ? (m.obtainedMarks / m.maxMarks) * 100 : 0),
          0,
        ) / exMarks.length,
      );
      const gaps = exMarks
        .map((m) => m.conceptualGap?.trim())
        .filter((g): g is string => Boolean(g));
      byExam[ex] = { avgPct, count: exMarks.length, gaps };
      orderedPcts.push(avgPct);
    }

    const firstPct = orderedPcts[0] ?? null;
    const latestPct = orderedPcts[orderedPcts.length - 1] ?? null;
    const netDeltaPct =
      firstPct !== null && latestPct !== null && orderedPcts.length > 1
        ? round1(latestPct - firstPct)
        : firstPct !== null
          ? 0
          : null;

    studentRows.push({
      student,
      byExam,
      firstPct,
      latestPct,
      netDeltaPct,
    });
  }

  return {
    examNames,
    cycleSeries,
    studentRows,
  };
}

const SESSION_MONTH_END_ISO: Partial<Record<AcademicMonthKey, string>> = {
  April: '2026-04-31',
  May: '2026-05-31',
  June: '2026-06-31',
  July: '2026-07-31',
  August: '2026-08-31',
  September: '2026-09-31',
  October: '2026-10-31',
  November: '2026-11-31',
};

export interface StudentLearnersMonthPoint {
  month: AcademicMonthKey;
  shortMonth: string;
  overallScore: number | null;
  academic: number | null;
  olq: number | null;
  learningHabits: number | null;
  participation: number | null;
  personalGrowth: number | null;
  evidenceCoveragePct: number;
  availableComponents: number;
  momDelta: number | null;
  sourceMode: 'direct' | 'synthesized' | 'none';
}

export interface StudentLearnersScoreGrowthSeries {
  points: StudentLearnersMonthPoint[];
  recordedCount: number;
  startMonth: AcademicMonthKey | null;
  latestMonth: AcademicMonthKey | null;
  startScore: number | null;
  latestScore: number | null;
  netDelta: number | null;
  peakMonth: AcademicMonthKey | null;
  peakScore: number | null;
  trendDirection: 'up' | 'down' | 'flat';
}

export interface BuildStudentLearnersScoreInput {
  studentId: string;
  evidence: DevelopmentEvidence[];
  examMarks?: ExamMark[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  weights?: LearnersWeights;
}

/**
 * Computes deterministic month-by-month (April–November 2026) Learners Score & 5 component
 * trajectories for an individual student.
 * Preserves core invariants:
 * 1. Direct validated DevelopmentEvidence dated <= monthEnd always takes precedence per component.
 * 2. When earlier academic months precede direct classroom/OLQ evidence logging, dated UT exam
 *    marks & Reading/Numeracy reports synthesize cumulative Academic / Personal Growth baselines
 *    while leaving unobserved OLQ / Habits / Participation as null (re-normalizing weights cleanly).
 * 3. Missing months with zero evidence, marks, or skill reports return null (never scored as 0).
 */
export function buildStudentLearnersScoreGrowthSeries({
  studentId,
  evidence,
  examMarks = [],
  readingReports = [],
  numeracyReports = [],
  weights = DEFAULT_LEARNERS_WEIGHTS,
}: BuildStudentLearnersScoreInput): StudentLearnersScoreGrowthSeries {
  const mineEvidence = deduplicateEvidence(
    evidence.filter((e) => e.studentId === studentId && e.validated),
  );
  const mineMarks = examMarks.filter((m) => m.studentId === studentId);
  const readingByMonth = new Map<AcademicMonthKey, MonthlyReadingReport>();
  for (const r of readingReports) {
    if (r.studentId === studentId) readingByMonth.set(r.month, r);
  }
  const numeracyByMonth = new Map<AcademicMonthKey, MonthlyNumeracyReport>();
  for (const n of numeracyReports) {
    if (n.studentId === studentId) numeracyByMonth.set(n.month, n);
  }

  let prevOverall: number | null = null;
  let firstPoint: StudentLearnersMonthPoint | null = null;
  let latestPoint: StudentLearnersMonthPoint | null = null;
  let peakMonth: AcademicMonthKey | null = null;
  let peakScore: number | null = null;
  let recordedCount = 0;

  const points: StudentLearnersMonthPoint[] = [];

  for (let mIdx = 0; mIdx < ACTIVE_SESSION_MONTHS.length; mIdx += 1) {
    const month = ACTIVE_SESSION_MONTHS[mIdx];
    const cutoffIso = SESSION_MONTH_END_ISO[month] ?? '2026-11-31';
    const isFinalSessionMonth = mIdx === ACTIVE_SESSION_MONTHS.length - 1;

    const directThroughM = isFinalSessionMonth
      ? mineEvidence
      : mineEvidence.filter((e) => !e.date || e.date <= cutoffIso);
    const directBreakdown = calculateLearnersScore(directThroughM, weights);

    // Use direct evidence alone in the final month (exact parity with studentBreakdowns),
    // or whenever earlier months already have direct Academic DevelopmentEvidence logged.
    if (
      directBreakdown.overallScore !== null &&
      (isFinalSessionMonth || directBreakdown.components.academic.score !== null)
    ) {
      recordedCount += 1;
      const momDelta =
        prevOverall !== null ? round1(directBreakdown.overallScore - prevOverall) : null;
      prevOverall = directBreakdown.overallScore;

      const pt: StudentLearnersMonthPoint = {
        month,
        shortMonth: month.slice(0, 3),
        overallScore: directBreakdown.overallScore,
        academic: directBreakdown.components.academic.score,
        olq: directBreakdown.components.olq.score,
        learningHabits: directBreakdown.components.learningHabits.score,
        participation: directBreakdown.components.participation.score,
        personalGrowth: directBreakdown.components.personalGrowth.score,
        evidenceCoveragePct: directBreakdown.evidenceCoveragePct,
        availableComponents: directBreakdown.availableComponents,
        momDelta,
        sourceMode: 'direct',
      };

      if (!firstPoint) firstPoint = pt;
      latestPoint = pt;
      if (peakScore === null || directBreakdown.overallScore >= peakScore) {
        peakScore = directBreakdown.overallScore;
        peakMonth = month;
      }
      points.push(pt);
      continue;
    }

    // Earlier session months (Apr–Sep/Oct before direct Academic DevelopmentEvidence entries):
    // synthesize baseline Academic & Personal Growth from dated ExamMarks + Reading + Numeracy
    const marksThroughM = mineMarks.filter((mk) => !mk.date || mk.date <= cutoffIso);
    const readingUpToM = ACTIVE_SESSION_MONTHS.slice(0, mIdx + 1)
      .map((m) => readingByMonth.get(m))
      .filter((r): r is MonthlyReadingReport => Boolean(r));
    const numeracyUpToM = ACTIVE_SESSION_MONTHS.slice(0, mIdx + 1)
      .map((m) => numeracyByMonth.get(m))
      .filter((n): n is MonthlyNumeracyReport => Boolean(n));

    const curReading = readingByMonth.get(month) || null;
    const curNumeracy = numeracyByMonth.get(month) || null;

    if (
      directThroughM.length === 0 &&
      marksThroughM.length === 0 &&
      readingUpToM.length === 0 &&
      numeracyUpToM.length === 0
    ) {
      points.push({
        month,
        shortMonth: month.slice(0, 3),
        overallScore: null,
        academic: null,
        olq: null,
        learningHabits: null,
        participation: null,
        personalGrowth: null,
        evidenceCoveragePct: 0,
        availableComponents: 0,
        momDelta: null,
        sourceMode: 'none',
      });
      continue;
    }

    const academicInputs: number[] = [];
    if (marksThroughM.length > 0) {
      const marksAvg =
        marksThroughM.reduce(
          (s, mk) => s + (mk.maxMarks > 0 ? (mk.obtainedMarks / mk.maxMarks) * 100 : 0),
          0,
        ) / marksThroughM.length;
      academicInputs.push(marksAvg, marksAvg);
    }
    const skillPointReading = curReading ?? readingUpToM[readingUpToM.length - 1];
    const skillPointNumeracy = curNumeracy ?? numeracyUpToM[numeracyUpToM.length - 1];
    if (skillPointReading) academicInputs.push(skillPointReading.overallPct);
    if (skillPointNumeracy) academicInputs.push(skillPointNumeracy.overallPct);

    const synthesizedAcademic =
      academicInputs.length > 0
        ? round1(academicInputs.reduce((a, b) => a + b, 0) / academicInputs.length)
        : null;

    const growthInputs: number[] = [];
    if (skillPointReading) {
      growthInputs.push((skillPointReading.accuracyPct + skillPointReading.comprehensionPct) / 2);
    }
    if (skillPointNumeracy) {
      growthInputs.push((skillPointNumeracy.mentalMathPct + skillPointNumeracy.problemSolvingPct) / 2);
    }
    const synthesizedPersonalGrowth =
      growthInputs.length > 0
        ? round1(growthInputs.reduce((a, b) => a + b, 0) / growthInputs.length)
        : null;

    const combinedEvidence: DevelopmentEvidence[] = [...directThroughM];
    if (synthesizedAcademic !== null || (synthesizedPersonalGrowth !== null && directBreakdown.components.personalGrowth.score === null)) {
      combinedEvidence.push({
        id: `synth-month-${studentId}-${month}`,
        schoolId: mineEvidence[0]?.schoolId || 'synth',
        studentId,
        sourceKey: `synth:baseline:${studentId}:${month}`,
        sourceType: 'exam',
        date: cutoffIso,
        summary: `${month} longitudinal academic & skill synthesis`,
        olqContributions: {},
        componentContributions: {
          ...(synthesizedAcademic !== null ? { academic: synthesizedAcademic } : {}),
          ...(synthesizedPersonalGrowth !== null &&
          directBreakdown.components.personalGrowth.score === null
            ? { personalGrowth: synthesizedPersonalGrowth }
            : {}),
        },
        learningSignals: {},
        enteredBy: 'Longitudinal Baseline',
        validated: true,
      });
    }

    const blendedBreakdown = calculateLearnersScore(combinedEvidence, weights);
    const overallScore = blendedBreakdown.overallScore;
    if (overallScore === null) {
      points.push({
        month,
        shortMonth: month.slice(0, 3),
        overallScore: null,
        academic: null,
        olq: null,
        learningHabits: null,
        participation: null,
        personalGrowth: null,
        evidenceCoveragePct: 0,
        availableComponents: 0,
        momDelta: null,
        sourceMode: 'none',
      });
      continue;
    }

    recordedCount += 1;
    const momDelta = prevOverall !== null ? round1(overallScore - prevOverall) : null;
    prevOverall = overallScore;

    const pt: StudentLearnersMonthPoint = {
      month,
      shortMonth: month.slice(0, 3),
      overallScore,
      academic: blendedBreakdown.components.academic.score,
      olq: blendedBreakdown.components.olq.score,
      learningHabits: blendedBreakdown.components.learningHabits.score,
      participation: blendedBreakdown.components.participation.score,
      personalGrowth: blendedBreakdown.components.personalGrowth.score,
      evidenceCoveragePct: blendedBreakdown.evidenceCoveragePct,
      availableComponents: blendedBreakdown.availableComponents,
      momDelta,
      sourceMode: directThroughM.length > 0 ? 'direct' : 'synthesized',
    };

    if (!firstPoint) firstPoint = pt;
    latestPoint = pt;
    if (peakScore === null || overallScore >= peakScore) {
      peakScore = overallScore;
      peakMonth = month;
    }
    points.push(pt);
  }

  const netDelta =
    firstPoint &&
    latestPoint &&
    firstPoint.month !== latestPoint.month &&
    firstPoint.overallScore !== null &&
    latestPoint.overallScore !== null
      ? round1(latestPoint.overallScore - firstPoint.overallScore)
      : recordedCount >= 1
        ? 0
        : null;

  return {
    points,
    recordedCount,
    startMonth: firstPoint?.month ?? null,
    latestMonth: latestPoint?.month ?? null,
    startScore: firstPoint?.overallScore ?? null,
    latestScore: latestPoint?.overallScore ?? null,
    netDelta,
    peakMonth,
    peakScore,
    trendDirection: computeDirection(netDelta),
  };
}

export interface CohortLearnersMonthAggregate {
  month: AcademicMonthKey;
  shortMonth: string;
  assessedCount: number;
  avgOverallScore: number | null;
  avgAcademic: number | null;
  avgOlq: number | null;
  avgLearningHabits: number | null;
  avgParticipation: number | null;
  avgPersonalGrowth: number | null;
  belowBenchmarkCount: number;
}

export interface CohortLearnersStudentRow {
  student: StudentRecord;
  byMonth: Partial<Record<AcademicMonthKey, StudentLearnersMonthPoint>>;
  firstScore: number | null;
  latestScore: number | null;
  netDelta: number | null;
  latestCoveragePct: number;
  latestComponents: {
    academic: number | null;
    olq: number | null;
    learningHabits: number | null;
    participation: number | null;
    personalGrowth: number | null;
  };
}

export interface CohortLearnersGrowthMatrix {
  monthlyCohortSeries: CohortLearnersMonthAggregate[];
  studentRows: CohortLearnersStudentRow[];
  totalTrackedStudents: number;
  latestMonthLabel: AcademicMonthKey | null;
  latestAvgOverallScore: number;
  latestAvgAcademic: number | null;
  avgNetDelta: number;
  improvedCount: number;
  belowBenchmarkLatestCount: number;
}

export function buildCohortLearnersScoreGrowthMatrix({
  students,
  evidence,
  examMarks = [],
  readingReports = [],
  numeracyReports = [],
  weights = DEFAULT_LEARNERS_WEIGHTS,
  classSectionFilter = 'All',
}: {
  students: StudentRecord[];
  evidence: DevelopmentEvidence[];
  examMarks?: ExamMark[];
  readingReports?: MonthlyReadingReport[];
  numeracyReports?: MonthlyNumeracyReport[];
  weights?: LearnersWeights;
  classSectionFilter?: string;
}): CohortLearnersGrowthMatrix {
  const scopedStudents = students
    .filter((s) => classSectionFilter === 'All' || s.classSection === classSectionFilter)
    .sort((a, b) => {
      const cmp = compareClassSections(a.classSection, b.classSection);
      if (cmp !== 0) return cmp;
      return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
    });

  const scopedIdSet = new Set(scopedStudents.map((s) => s.id));
  const evByStu = new Map<string, DevelopmentEvidence[]>();
  const marksByStu = new Map<string, ExamMark[]>();
  const readByStu = new Map<string, MonthlyReadingReport[]>();
  const numByStu = new Map<string, MonthlyNumeracyReport[]>();

  for (const e of evidence) {
    if (!scopedIdSet.has(e.studentId)) continue;
    const arr = evByStu.get(e.studentId) || [];
    arr.push(e);
    evByStu.set(e.studentId, arr);
  }
  for (const m of examMarks) {
    if (!scopedIdSet.has(m.studentId)) continue;
    const arr = marksByStu.get(m.studentId) || [];
    arr.push(m);
    marksByStu.set(m.studentId, arr);
  }
  for (const r of readingReports) {
    if (!scopedIdSet.has(r.studentId)) continue;
    const arr = readByStu.get(r.studentId) || [];
    arr.push(r);
    readByStu.set(r.studentId, arr);
  }
  for (const n of numeracyReports) {
    if (!scopedIdSet.has(n.studentId)) continue;
    const arr = numByStu.get(n.studentId) || [];
    arr.push(n);
    numByStu.set(n.studentId, arr);
  }

  const monthPointBuckets: Partial<Record<AcademicMonthKey, StudentLearnersMonthPoint[]>> = {
    April: [],
    May: [],
    June: [],
    July: [],
    August: [],
    September: [],
    October: [],
    November: [],
  };

  const studentRows: CohortLearnersStudentRow[] = [];

  for (const student of scopedStudents) {
    const series = buildStudentLearnersScoreGrowthSeries({
      studentId: student.id,
      evidence: evByStu.get(student.id) || [],
      examMarks: marksByStu.get(student.id) || [],
      readingReports: readByStu.get(student.id) || [],
      numeracyReports: numByStu.get(student.id) || [],
      weights,
    });

    if (series.recordedCount === 0 && classSectionFilter === 'All') continue;

    const byMonth: Partial<Record<AcademicMonthKey, StudentLearnersMonthPoint>> = {};
    let latestPt: StudentLearnersMonthPoint | null = null;
    for (const pt of series.points) {
      byMonth[pt.month] = pt;
      if (pt.overallScore !== null) {
        const bucket = monthPointBuckets[pt.month] ?? [];
        bucket.push(pt);
        monthPointBuckets[pt.month] = bucket;
        latestPt = pt;
      }
    }

    studentRows.push({
      student,
      byMonth,
      firstScore: series.startScore,
      latestScore: series.latestScore,
      netDelta: series.netDelta,
      latestCoveragePct: latestPt?.evidenceCoveragePct ?? 0,
      latestComponents: {
        academic: latestPt?.academic ?? null,
        olq: latestPt?.olq ?? null,
        learningHabits: latestPt?.learningHabits ?? null,
        participation: latestPt?.participation ?? null,
        personalGrowth: latestPt?.personalGrowth ?? null,
      },
    });
  }

  const avgNullable = (vals: Array<number | null>): number | null => {
    const nums = vals.filter((v): v is number => v !== null);
    if (nums.length === 0) return null;
    return round1(nums.reduce((a, b) => a + b, 0) / nums.length);
  };

  const monthlyCohortSeries: CohortLearnersMonthAggregate[] = ACTIVE_SESSION_MONTHS.map((month) => {
    const pts = monthPointBuckets[month] ?? [];
    if (pts.length === 0) {
      return {
        month,
        shortMonth: month.slice(0, 3),
        assessedCount: 0,
        avgOverallScore: null,
        avgAcademic: null,
        avgOlq: null,
        avgLearningHabits: null,
        avgParticipation: null,
        avgPersonalGrowth: null,
        belowBenchmarkCount: 0,
      };
    }
    return {
      month,
      shortMonth: month.slice(0, 3),
      assessedCount: pts.length,
      avgOverallScore: avgNullable(pts.map((p) => p.overallScore)),
      avgAcademic: avgNullable(pts.map((p) => p.academic)),
      avgOlq: avgNullable(pts.map((p) => p.olq)),
      avgLearningHabits: avgNullable(pts.map((p) => p.learningHabits)),
      avgParticipation: avgNullable(pts.map((p) => p.participation)),
      avgPersonalGrowth: avgNullable(pts.map((p) => p.personalGrowth)),
      belowBenchmarkCount: pts.filter((p) => (p.overallScore ?? 100) < 65).length,
    };
  });

  const activeMonths = monthlyCohortSeries.filter((m) => m.assessedCount > 0);
  const latestAgg = activeMonths[activeMonths.length - 1] || null;
  const deltas = studentRows.map((r) => r.netDelta).filter((d): d is number => d !== null);
  const avgNetDelta =
    deltas.length > 0 ? round1(deltas.reduce((s, d) => s + d, 0) / deltas.length) : 0;
  const improvedCount = deltas.filter((d) => d > 0).length;

  return {
    monthlyCohortSeries,
    studentRows,
    totalTrackedStudents: studentRows.filter((r) => r.latestScore !== null).length,
    latestMonthLabel: latestAgg?.month ?? null,
    latestAvgOverallScore: latestAgg?.avgOverallScore ?? 0,
    latestAvgAcademic: latestAgg?.avgAcademic ?? null,
    avgNetDelta,
    improvedCount,
    belowBenchmarkLatestCount: latestAgg?.belowBenchmarkCount ?? 0,
  };
}

