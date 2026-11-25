import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LineChart as LineChartIcon,
  Plus,
} from 'lucide-react';
import type { AcademicMonthKey } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import {
  buildCohortLearnersScoreGrowthMatrix,
  buildCohortNumeracyGrowthMatrix,
  buildCohortReadingGrowthMatrix,
  buildCohortUtComparisonMatrix,
  shortExamLabel,
} from '../utils/growthReportEngine';
import {
  ACTIVE_SESSION_MONTHS,
  compareClassSections,
  summarizeUtMarks,
  TODAY_VIS_DATE,
} from '../utils/visAcademicProgressEngine';
import {
  CohortLearnersGrowthSubtab,
  type CohortLearnersMetricKey,
} from './CohortLearnersGrowthSubtab';

interface AcademicProgressLedgerPanelProps {
  data: WorkspaceData;
  token: string;
  canEdit: boolean;
  onRefresh: () => Promise<void>;
}

type ProgressSubTab = 'learners' | 'ut' | 'reading' | 'numeracy';
type ReadingMetricKey = 'overallPct' | 'wpm' | 'accuracyPct' | 'comprehensionPct';
type NumeracyMetricKey = 'overallPct' | 'tablesFluencyPct' | 'mentalMathPct' | 'problemSolvingPct';

function DeltaCell({ value, suffix = '%' }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="font-mono text-slate-300 tabular-nums">—</span>;
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-emerald-700 tabular-nums">
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        +{value}
        {suffix}
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-amber-700 tabular-nums">
        <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
        {value}
        {suffix}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 font-mono text-slate-500 tabular-nums">
      <ArrowRight className="h-3 w-3 shrink-0" />
      0{suffix}
    </span>
  );
}

export const AcademicProgressLedgerPanel: React.FC<AcademicProgressLedgerPanelProps> = ({
  data,
  token,
  canEdit,
  onRefresh,
}) => {
  const isStaff = !['parent', 'student'].includes(data.user.role);
  const [subTab, setSubTab] = useState<ProgressSubTab>('learners');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [utViewMode, setUtViewMode] = useState<'comparison' | 'detailed'>('comparison');
  const [search, setSearch] = useState('');
  const [rowLimit, setRowLimit] = useState(50);

  // Growth comparison interactive state (all months always visible)
  const [learnersMetric, setLearnersMetric] = useState<CohortLearnersMetricKey>('overallScore');
  const [readingMetric, setReadingMetric] = useState<ReadingMetricKey>('overallPct');
  const [readingChartMode, setReadingChartMode] = useState<'line' | 'bar'>('line');
  const [showCohortReadingWpm, setShowCohortReadingWpm] = useState(true);
  const [numeracyMetric, setNumeracyMetric] = useState<NumeracyMetricKey>('overallPct');
  const [highlightMonth, setHighlightMonth] = useState<AcademicMonthKey>('November');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // Batch UT marks entry state
  const classOptions = useMemo(() => {
    const set = new Set<string>(data.students.map((s) => s.classSection));
    return Array.from(set).sort(compareClassSections);
  }, [data.students]);

  const [showUtBatchForm, setShowUtBatchForm] = useState(false);
  const [utBatchClass, setUtBatchClass] = useState<string>(
    () => data.user.classTeacherOf || classOptions[0] || '6-A',
  );
  const [utBatchExam, setUtBatchExam] = useState<string>('Unit Test 3');
  const [utBatchSubject, setUtBatchSubject] = useState<string>('Mathematics');
  const [utBatchMaxMarks, setUtBatchMaxMarks] = useState<string>('50');
  const [utBatchScores, setUtBatchScores] = useState<Record<string, string>>({});
  const [utBatchGaps, setUtBatchGaps] = useState<Record<string, string>>({});
  const [utSaving, setUtSaving] = useState(false);

  // Inline Reading & Numeracy quick entry state (segmented month buttons, no month dropdown)
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillStudentId, setSkillStudentId] = useState<string>(() => data.students[0]?.id || '');
  const [skillMonth, setSkillMonth] = useState<AcademicMonthKey>('November');
  const [readWpm, setReadWpm] = useState('92');
  const [readAcc, setReadAcc] = useState('84');
  const [readComp, setReadComp] = useState('80');
  const [readRemarks, setReadRemarks] = useState('');
  const [numTables, setNumTables] = useState('82');
  const [numMental, setNumMental] = useState('78');
  const [numProblem, setNumProblem] = useState('76');
  const [numGap, setNumGap] = useState('');
  const [numRemarks, setNumRemarks] = useState('');
  const [skillSaving, setSkillSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackErr, setFeedbackErr] = useState<string | null>(null);

  const searchFilteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.classSection.toLowerCase().includes(q),
    );
  }, [data.students, search]);

  const utSummary = useMemo(
    () =>
      summarizeUtMarks(searchFilteredStudents, data.examMarks || [], {
        classSection: selectedClass,
        examName: selectedExam,
        subject: selectedSubject,
      }),
    [searchFilteredStudents, data.examMarks, selectedClass, selectedExam, selectedSubject],
  );

  const utCohortMatrix = useMemo(
    () =>
      buildCohortUtComparisonMatrix(
        searchFilteredStudents,
        data.examMarks || [],
        selectedClass,
        selectedSubject,
      ),
    [searchFilteredStudents, data.examMarks, selectedClass, selectedSubject],
  );

  const learnersMatrix = useMemo(
    () =>
      buildCohortLearnersScoreGrowthMatrix({
        students: searchFilteredStudents,
        evidence: data.evidence || [],
        examMarks: data.examMarks || [],
        readingReports: data.readingReports || [],
        numeracyReports: data.numeracyReports || [],
        weights: data.weightsConfig.weights,
        classSectionFilter: selectedClass,
      }),
    [
      searchFilteredStudents,
      data.evidence,
      data.examMarks,
      data.readingReports,
      data.numeracyReports,
      data.weightsConfig.weights,
      selectedClass,
    ],
  );

  const readingMatrix = useMemo(
    () =>
      buildCohortReadingGrowthMatrix(
        searchFilteredStudents,
        data.readingReports || [],
        selectedClass,
      ),
    [searchFilteredStudents, data.readingReports, selectedClass],
  );

  const numeracyMatrix = useMemo(
    () =>
      buildCohortNumeracyGrowthMatrix(
        searchFilteredStudents,
        data.numeracyReports || [],
        selectedClass,
      ),
    [searchFilteredStudents, data.numeracyReports, selectedClass],
  );

  const highlightedReadingCohort =
    readingMatrix.monthlyCohortSeries.find((m) => m.month === highlightMonth) ||
    readingMatrix.monthlyCohortSeries[readingMatrix.monthlyCohortSeries.length - 1];

  const highlightedNumeracyCohort =
    numeracyMatrix.monthlyCohortSeries.find((m) => m.month === highlightMonth) ||
    numeracyMatrix.monthlyCohortSeries[numeracyMatrix.monthlyCohortSeries.length - 1];

  const utBatchStudents = useMemo(
    () =>
      data.students
        .filter((s) => s.classSection === utBatchClass)
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })),
    [data.students, utBatchClass],
  );

  async function handleSaveBatchUtMarks(e: React.FormEvent) {
    e.preventDefault();
    setFeedbackErr(null);
    setFeedbackMsg(null);
    const max = Math.max(1, Number(utBatchMaxMarks) || 50);
    const rows = utBatchStudents
      .map((st) => {
        const raw = utBatchScores[st.id];
        if (raw === undefined || raw.trim() === '') return null;
        return {
          studentId: st.id,
          obtainedMarks: Math.max(0, Math.min(max, Number(raw) || 0)),
          conceptualGap: utBatchGaps[st.id]?.trim() || undefined,
        };
      })
      .filter((r): r is NonNullable<typeof r> => Boolean(r));

    if (rows.length === 0) {
      setFeedbackErr('Enter marks for at least one student before saving.');
      return;
    }

    setUtSaving(true);
    try {
      await apiRequest(
        '/api/exams/marks/batch',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection: utBatchClass,
            examName: utBatchExam,
            subject: utBatchSubject,
            maxMarks: max,
            date: TODAY_VIS_DATE,
            rows,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(
        `Saved ${rows.length} ${utBatchExam} (${utBatchSubject}) marks for Class ${utBatchClass}.`,
      );
      setShowUtBatchForm(false);
    } catch (err) {
      setFeedbackErr(err instanceof Error ? err.message : 'Unable to save UT marks batch.');
    } finally {
      setUtSaving(false);
    }
  }

  async function handleSaveReadingReport(e: React.FormEvent) {
    e.preventDefault();
    if (!skillStudentId) return;
    setFeedbackErr(null);
    setFeedbackMsg(null);
    setSkillSaving(true);
    try {
      await apiRequest(
        '/api/reports/reading',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: skillStudentId,
            month: skillMonth,
            year: 2026,
            wpm: Number(readWpm) || 90,
            accuracyPct: Number(readAcc) || 80,
            comprehensionPct: Number(readComp) || 78,
            remarks: readRemarks.trim() || undefined,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(`Saved ${skillMonth} 2026 reading evaluation.`);
      setReadRemarks('');
      setShowSkillForm(false);
    } catch (err) {
      setFeedbackErr(err instanceof Error ? err.message : 'Unable to save reading report.');
    } finally {
      setSkillSaving(false);
    }
  }

  async function handleSaveNumeracyReport(e: React.FormEvent) {
    e.preventDefault();
    if (!skillStudentId) return;
    setFeedbackErr(null);
    setFeedbackMsg(null);
    setSkillSaving(true);
    try {
      await apiRequest(
        '/api/reports/numeracy',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: skillStudentId,
            month: skillMonth,
            year: 2026,
            tablesFluencyPct: Number(numTables) || 80,
            mentalMathPct: Number(numMental) || 78,
            problemSolvingPct: Number(numProblem) || 75,
            conceptualGap: numGap.trim() || undefined,
            remarks: numRemarks.trim() || undefined,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(`Saved ${skillMonth} 2026 numeracy evaluation.`);
      setNumGap('');
      setNumRemarks('');
      setShowSkillForm(false);
    } catch (err) {
      setFeedbackErr(err instanceof Error ? err.message : 'Unable to save numeracy report.');
    } finally {
      setSkillSaving(false);
    }
  }

  const resolvedSkillStudents = useMemo(() => {
    const filtered =
      selectedClass === 'All'
        ? data.students
        : data.students.filter((s) => s.classSection === selectedClass);
    return filtered.slice(0, 120);
  }, [data.students, selectedClass]);

  return (
    <div className="space-y-5">
      {/* Header & Sub-tab Switcher */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-slate-900">
              Learners Score, UT Marks, Reading &amp; Numeracy Growth Reports
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {isStaff
                ? 'Side-by-side longitudinal comparison across April–November 2026 and UT-1 to UT-3 cycles. All months stay visible simultaneously.'
                : 'Complete April–November 2026 Learners Score, reading, numeracy, and Unit Test growth comparison strictly for your linked student profile.'}
            </p>
          </div>

          <div className="inline-flex flex-nowrap gap-1 rounded-lg bg-slate-100 p-1 self-start xl:self-auto shrink-0 max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setSubTab('learners');
                setRowLimit(50);
                setExpandedStudentId(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subTab === 'learners' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              Learners Score (Apr–Nov)
            </button>
            <button
              type="button"
              onClick={() => {
                setSubTab('reading');
                setRowLimit(50);
                setExpandedStudentId(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subTab === 'reading' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Reading Growth (Apr–Nov)
            </button>
            <button
              type="button"
              onClick={() => {
                setSubTab('numeracy');
                setRowLimit(50);
                setExpandedStudentId(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subTab === 'numeracy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              Numeracy Growth (Apr–Nov)
            </button>
            <button
              type="button"
              onClick={() => {
                setSubTab('ut');
                setRowLimit(50);
                setExpandedStudentId(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                subTab === 'ut' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              UT Marks ({utSummary.summary.totalMarks})
            </button>
          </div>
        </div>

        {/* Context Toolbar — NO single-month dropdown hiding the year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {classOptions.length > 1 && (
            <div>
              <label htmlFor="prog-class-filter" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Class &amp; Section
              </label>
              <select
                id="prog-class-filter"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setRowLimit(50);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="All">All Visible Classes ({data.students.length})</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>
          )}

          {subTab === 'ut' ? (
            <>
              <div>
                <label htmlFor="prog-subject-filter" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Subject
                </label>
                <select
                  id="prog-subject-filter"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                >
                  <option value="All">All Subjects</option>
                  {utSummary.summary.subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
              {utViewMode === 'detailed' && (
                <div>
                  <label htmlFor="prog-exam-filter" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Exam Cycle
                  </label>
                  <select
                    id="prog-exam-filter"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="All">All Exams</option>
                    {utSummary.summary.examNames.map((ex) => (
                      <option key={ex} value={ex}>
                        {ex}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="sm:col-span-2">
              <p className="block text-[11px] font-semibold text-slate-600 mb-1">
                Metric Comparison View (All 8 Months Shown Side-by-Side)
              </p>
              {subTab === 'learners' ? (
                <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      ['overallScore', 'Overall'],
                      ['academic', 'Academic'],
                      ['olq', 'OLQ'],
                      ['learningHabits', 'Habits'],
                      ['participation', 'Participation'],
                      ['personalGrowth', 'Growth'],
                    ] as Array<[CohortLearnersMetricKey, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLearnersMetric(key)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                        learnersMetric === key
                          ? 'bg-white text-blue-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : subTab === 'reading' ? (
                <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      ['overallPct', 'Overall %'],
                      ['wpm', 'Speed (WPM)'],
                      ['accuracyPct', 'Accuracy %'],
                      ['comprehensionPct', 'Comprehension %'],
                    ] as Array<[ReadingMetricKey, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReadingMetric(key)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                        readingMetric === key
                          ? 'bg-white text-blue-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      ['overallPct', 'Overall %'],
                      ['tablesFluencyPct', 'Tables %'],
                      ['mentalMathPct', 'Mental Math %'],
                      ['problemSolvingPct', 'Problem Solving %'],
                    ] as Array<[NumeracyMetricKey, string]>
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNumeracyMetric(key)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                        numeracyMetric === key
                          ? 'bg-white text-blue-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.students.length > 1 && (
            <div>
              <label htmlFor="prog-search" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Search Student / Adm No
              </label>
              <input
                id="prog-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or VIS admission no..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
          )}
        </div>

        {feedbackErr && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            {feedbackErr}
          </div>
        )}
        {feedbackMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Sub-tab 0: All-Months Side-by-Side Learners Score Comparison */}
      {subTab === 'learners' && (
        <CohortLearnersGrowthSubtab
          matrix={learnersMatrix}
          weights={data.weightsConfig.weights}
          learnersMetric={learnersMetric}
          highlightMonth={highlightMonth}
          onSelectHighlightMonth={setHighlightMonth}
          rowLimit={rowLimit}
          onLoadMore={() => setRowLimit((n) => n + 100)}
        />
      )}

      {/* Sub-tab 1: UT Marks (Cycle Growth Comparison + Detailed Log) */}
      {subTab === 'ut' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">UT Mark Entries</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                {utSummary.summary.totalMarks}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Students Assessed</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                {utSummary.summary.studentCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Average Score</p>
              <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
                {utSummary.summary.averagePct}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Below 65% Support</p>
              <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
                {utSummary.summary.belowBenchmarkCount}
              </p>
            </div>
          </div>

          {/* UT Cycle Cohort Progression Chart + View Toggle */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  UT Cycle Cohort Progression ({utCohortMatrix.examNames.map(shortExamLabel).join(' → ') || 'Cycles'})
                </h3>
                <p className="text-xs text-slate-500">
                  Compare student averages across every Unit Test cycle side by side or inspect individual subject marks.
                </p>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUtViewMode('comparison')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                    utViewMode === 'comparison'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cycle Growth Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setUtViewMode('detailed')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                    utViewMode === 'detailed'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Subject Marks Log
                </button>
              </div>
            </div>

            {utCohortMatrix.cycleSeries.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">
                    Cycle Mean Score vs. 65% Benchmark Share
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                      Cohort Average %
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                      Scoring ≥ 65% Benchmark
                    </span>
                  </div>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utCohortMatrix.cycleSeries} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                      <Bar dataKey="avgPct" name="Cohort Average %" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={38} />
                      <Bar
                        dataKey="benchmarkRatePct"
                        name="≥ 65% Benchmark Share %"
                        fill="#059669"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={38}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Record Class UT Marks Batch</p>
                  <p className="text-[11px] text-slate-500">
                    Log Unit Test marks for an entire class section at once and sync Academic Development evidence.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUtBatchForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showUtBatchForm ? 'Close Entry Form' : 'Enter UT Marks Batch'}
                </button>
              </div>

              {showUtBatchForm && (
                <form onSubmit={handleSaveBatchUtMarks} className="p-5 space-y-4 bg-slate-50/70">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label htmlFor="ut-batch-class" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Class Section
                      </label>
                      <select
                        id="ut-batch-class"
                        value={utBatchClass}
                        onChange={(e) => setUtBatchClass(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      >
                        {classOptions.map((c) => (
                          <option key={c} value={c}>
                            Class {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ut-batch-exam" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Exam Cycle
                      </label>
                      <select
                        id="ut-batch-exam"
                        value={utBatchExam}
                        onChange={(e) => setUtBatchExam(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      >
                        <option value="Unit Test 1">Unit Test 1</option>
                        <option value="Unit Test 2">Unit Test 2</option>
                        <option value="Unit Test 3">Unit Test 3</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ut-batch-subject" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Subject
                      </label>
                      <input
                        id="ut-batch-subject"
                        type="text"
                        value={utBatchSubject}
                        onChange={(e) => setUtBatchSubject(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="ut-batch-max" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Max Marks
                      </label>
                      <input
                        id="ut-batch-max"
                        type="number"
                        min={5}
                        max={100}
                        value={utBatchMaxMarks}
                        onChange={(e) => setUtBatchMaxMarks(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                    {utBatchStudents.map((st) => (
                      <div key={st.id} className="px-3.5 py-2 grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-5 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            Roll {st.rollNo} · {st.name}
                          </p>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            min={0}
                            max={Number(utBatchMaxMarks) || 50}
                            aria-label={`Marks for ${st.name}`}
                            value={utBatchScores[st.id] ?? ''}
                            onChange={(e) =>
                              setUtBatchScores((prev) => ({ ...prev, [st.id]: e.target.value }))
                            }
                            placeholder={`Out of ${utBatchMaxMarks}`}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            aria-label={`Conceptual note for ${st.name}`}
                            value={utBatchGaps[st.id] ?? ''}
                            onChange={(e) =>
                              setUtBatchGaps((prev) => ({ ...prev, [st.id]: e.target.value }))
                            }
                            placeholder="Optional gap note..."
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={utSaving}
                      className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                    >
                      {utSaving ? 'Saving UT Marks...' : `Save ${utBatchExam} Marks`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {utViewMode === 'comparison' ? (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Class</th>
                      {utCohortMatrix.examNames.map((ex) => (
                        <th key={ex} className="px-4 py-3 font-semibold text-right whitespace-nowrap">
                          {shortExamLabel(ex)} Avg
                        </th>
                      ))}
                      <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">Cycle Δ</th>
                      <th className="px-5 py-3 font-semibold">Conceptual Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {utCohortMatrix.studentRows.slice(0, rowLimit).map((row) => {
                      const latestEx = utCohortMatrix.examNames[utCohortMatrix.examNames.length - 1];
                      const latestGaps = latestEx ? row.byExam[latestEx]?.gaps : [];
                      return (
                        <tr key={row.student.id} className="hover:bg-slate-50">
                          <td className="px-5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                            {row.student.name} ·{' '}
                            <span className="font-mono font-normal text-slate-500">{row.student.admissionNo}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{row.student.classSection}</td>
                          {utCohortMatrix.examNames.map((ex) => {
                            const cell = row.byExam[ex];
                            return (
                              <td
                                key={ex}
                                className={`px-4 py-2.5 font-mono text-right font-semibold tabular-nums whitespace-nowrap ${
                                  !cell
                                    ? 'text-slate-300'
                                    : cell.avgPct < 65
                                      ? 'text-amber-700'
                                      : 'text-slate-900'
                                }`}
                              >
                                {cell ? `${cell.avgPct}%` : '—'}
                              </td>
                            );
                          })}
                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <DeltaCell value={row.netDeltaPct} />
                          </td>
                          <td className="px-5 py-2.5 text-slate-600">
                            {latestGaps && latestGaps.length > 0 ? latestGaps.slice(0, 2).join('; ') : 'On track'}
                          </td>
                        </tr>
                      );
                    })}
                    {utCohortMatrix.studentRows.length === 0 && (
                      <tr>
                        <td colSpan={4 + utCohortMatrix.examNames.length} className="px-5 py-8 text-center text-slate-500">
                          No UT cycle records match the active filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {utCohortMatrix.studentRows.length > rowLimit && (
                <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing {rowLimit} of {utCohortMatrix.studentRows.length} students
                  </span>
                  <button
                    type="button"
                    onClick={() => setRowLimit((n) => n + 100)}
                    className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                  >
                    Load 100 more →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Class</th>
                      <th className="px-4 py-3 font-semibold">Exam Cycle</th>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold text-right">Marks</th>
                      <th className="px-4 py-3 font-semibold text-right">%</th>
                      <th className="px-5 py-3 font-semibold">Conceptual Gap / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {utSummary.rows.slice(0, rowLimit).map(({ mark, student, pct }) => (
                      <tr key={mark.id} className="hover:bg-slate-50">
                        <td className="px-5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                          {student.name} ·{' '}
                          <span className="font-mono font-normal text-slate-500">{student.admissionNo}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{student.classSection}</td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{mark.examName}</td>
                        <td className="px-4 py-2.5 text-slate-900 whitespace-nowrap">{mark.subject}</td>
                        <td className="px-4 py-2.5 font-mono text-right text-slate-900 tabular-nums whitespace-nowrap">
                          {mark.obtainedMarks}/{mark.maxMarks}
                        </td>
                        <td
                          className={`px-4 py-2.5 font-mono text-right font-semibold tabular-nums whitespace-nowrap ${
                            pct < 65 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {pct}%
                        </td>
                        <td className="px-5 py-2.5 text-slate-600">{mark.conceptualGap || 'On track'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {utSummary.rows.length > rowLimit && (
                <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing {rowLimit} of {utSummary.rows.length} UT entries
                  </span>
                  <button
                    type="button"
                    onClick={() => setRowLimit((n) => n + 100)}
                    className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                  >
                    Load 100 more →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: All-Months Side-by-Side Reading Growth Comparison */}
      {subTab === 'reading' && (
        <div className="space-y-4">
          {/* Cohort Reading Growth KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Students Tracked (Apr–Nov)</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                {readingMatrix.totalAssessedStudents}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {readingMatrix.improvedCount} showing net growth
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                Latest Cohort Mean ({readingMatrix.latestMonthLabel?.slice(0, 3) || 'Nov'})
              </p>
              <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
                {readingMatrix.latestAvgOverallPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                Mean speed: {readingMatrix.latestAvgWpm} WPM
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Apr → Nov Avg Growth</p>
              <div className="text-2xl mt-1">
                <DeltaCell value={readingMatrix.avgNetDeltaPct} />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Cohort session improvement</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Below 65% Support (Latest)</p>
              <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
                {readingMatrix.belowBenchmarkLatestCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                Fluent ({highlightMonth.slice(0, 3)}): {highlightedReadingCohort?.fluentCount ?? 0}
              </p>
            </div>
          </div>

          {/* Cohort All-Months Trajectory Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Cohort Reading Growth Trajectory — April to November 2026
                </h3>
                <p className="text-xs text-slate-500">
                  All 8 months plotted side-by-side. Switch between Multi-Series Line and Grouped Bar or click any month pill to inspect cohort stats.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                <button
                  type="button"
                  onClick={() => setShowCohortReadingWpm((v) => !v)}
                  aria-pressed={showCohortReadingWpm}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    showCohortReadingWpm
                      ? 'border-cyan-700 bg-cyan-50 text-cyan-900'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {showCohortReadingWpm ? 'WPM On' : '+ Overlay WPM'}
                </button>
                <div
                  role="group"
                  aria-label="Cohort reading chart type"
                  className="inline-flex rounded-lg bg-slate-100 p-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setReadingChartMode('line')}
                    aria-pressed={readingChartMode === 'line'}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      readingChartMode === 'line'
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                    Multi-Series Line
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingChartMode('bar')}
                    aria-pressed={readingChartMode === 'bar'}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      readingChartMode === 'bar'
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    Grouped Bar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                  Cohort Overall %
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                  Mean Accuracy %
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-600" />
                  Mean Comprehension %
                </span>
                {showCohortReadingWpm && (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-600" />
                    Mean Speed (WPM, right axis)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-0.5 self-start shrink-0">
                {ACTIVE_SESSION_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setHighlightMonth(m)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      highlightMonth === m ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-60 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                {readingChartMode === 'line' ? (
                  <LineChart
                    data={readingMatrix.monthlyCohortSeries}
                    margin={{ top: 10, right: showCohortReadingWpm ? 8 : 16, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis
                      yAxisId="pct"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      unit="%"
                    />
                    {showCohortReadingWpm && (
                      <YAxis
                        yAxisId="wpm"
                        orientation="right"
                        domain={[0, 'dataMax + 20']}
                        tick={{ fontSize: 11, fill: '#0891b2' }}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine yAxisId="pct" y={65} stroke="#d97706" strokeDasharray="4 4" />
                    <Line
                      yAxisId="pct"
                      type="monotone"
                      dataKey="avgOverallPct"
                      name="Cohort Overall %"
                      stroke="#1e3a8a"
                      strokeWidth={2.75}
                      dot={{ r: 3.5 }}
                    />
                    <Line
                      yAxisId="pct"
                      type="monotone"
                      dataKey="avgAccuracyPct"
                      name="Mean Accuracy %"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="pct"
                      type="monotone"
                      dataKey="avgComprehensionPct"
                      name="Mean Comprehension %"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    {showCohortReadingWpm && (
                      <Line
                        yAxisId="wpm"
                        type="monotone"
                        dataKey="avgWpm"
                        name="Mean Speed (WPM)"
                        stroke="#0891b2"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        dot={{ r: 3 }}
                      />
                    )}
                  </LineChart>
                ) : (
                  <BarChart
                    data={readingMatrix.monthlyCohortSeries}
                    margin={{ top: 10, right: showCohortReadingWpm ? 8 : 16, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis
                      yAxisId="pct"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#475569' }}
                      unit="%"
                    />
                    {showCohortReadingWpm && (
                      <YAxis
                        yAxisId="wpm"
                        orientation="right"
                        domain={[0, 'dataMax + 20']}
                        tick={{ fontSize: 11, fill: '#0891b2' }}
                      />
                    )}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine yAxisId="pct" y={65} stroke="#d97706" strokeDasharray="4 4" />
                    <Bar
                      yAxisId="pct"
                      dataKey="avgOverallPct"
                      name="Cohort Overall %"
                      fill="#1e3a8a"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={14}
                    />
                    <Bar
                      yAxisId="pct"
                      dataKey="avgAccuracyPct"
                      name="Mean Accuracy %"
                      fill="#059669"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={14}
                    />
                    <Bar
                      yAxisId="pct"
                      dataKey="avgComprehensionPct"
                      name="Mean Comprehension %"
                      fill="#d97706"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={14}
                    />
                    {showCohortReadingWpm && (
                      <Bar
                        yAxisId="wpm"
                        dataKey="avgWpm"
                        name="Mean Speed (WPM)"
                        fill="#0891b2"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={14}
                      />
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {highlightedReadingCohort && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-900">
                  {highlightedReadingCohort.month} 2026 Cohort Snapshot:
                </span>
                <div className="flex flex-wrap items-center gap-4 font-mono text-slate-700 tabular-nums">
                  <span>Assessed: {highlightedReadingCohort.assessedCount}</span>
                  <span>Overall: {highlightedReadingCohort.avgOverallPct}%</span>
                  <span>Speed: {highlightedReadingCohort.avgWpm} WPM</span>
                  <span>Accuracy: {highlightedReadingCohort.avgAccuracyPct}%</span>
                  <span>Comprehension: {highlightedReadingCohort.avgComprehensionPct}%</span>
                  <span className="text-amber-700">Support (&lt;65%): {highlightedReadingCohort.belowBenchmarkCount}</span>
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Record Monthly Reading Evaluation</p>
                  <p className="text-[11px] text-slate-500">
                    Log WPM fluency, decoding accuracy, and comprehension for any month (April–November).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSkillForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showSkillForm ? 'Close Form' : 'Log Reading Evaluation'}
                </button>
              </div>
              {showSkillForm && (
                <form onSubmit={handleSaveReadingReport} className="p-5 space-y-3 bg-slate-50/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">Select Assessment Month (2026):</span>
                    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-0.5">
                      {ACTIVE_SESSION_MONTHS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSkillMonth(m)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                            skillMonth === m ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                          }`}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="read-stu-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Student
                      </label>
                      <select
                        id="read-stu-select"
                        value={skillStudentId}
                        onChange={(e) => setSkillStudentId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      >
                        {resolvedSkillStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} (Class {st.classSection} · {st.admissionNo})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="read-wpm" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Speed (WPM)
                      </label>
                      <input
                        id="read-wpm"
                        type="number"
                        min={20}
                        max={220}
                        value={readWpm}
                        onChange={(e) => setReadWpm(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="read-acc" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Accuracy %
                      </label>
                      <input
                        id="read-acc"
                        type="number"
                        min={0}
                        max={100}
                        value={readAcc}
                        onChange={(e) => setReadAcc(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="read-comp" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Comprehension %
                      </label>
                      <input
                        id="read-comp"
                        type="number"
                        min={0}
                        max={100}
                        value={readComp}
                        onChange={(e) => setReadComp(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-3">
                      <label htmlFor="read-remarks" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Teacher Remarks
                      </label>
                      <input
                        id="read-remarks"
                        type="text"
                        value={readRemarks}
                        onChange={(e) => setReadRemarks(e.target.value)}
                        placeholder="Oral reading fluency, blend accuracy, expression..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={skillSaving}
                      className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                    >
                      {skillSaving ? 'Saving...' : `Save ${skillMonth.slice(0, 3)} Report`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* All-Months Comparative Student Reading Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900">
                All-Months Side-by-Side Reading Matrix ({readingMatrix.studentRows.length} students · Metric:{' '}
                {readingMetric === 'overallPct'
                  ? 'Overall %'
                  : readingMetric === 'wpm'
                    ? 'Speed (WPM)'
                    : readingMetric === 'accuracyPct'
                      ? 'Accuracy %'
                      : 'Comprehension %'}
                )
              </p>
              <span className="text-[11px] text-slate-500">Click any student row to inspect all 8 months &amp; remarks</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Student</th>
                    <th className="px-3 py-3 font-semibold whitespace-nowrap">Class</th>
                    {ACTIVE_SESSION_MONTHS.map((m) => (
                      <th
                        key={m}
                        className={`px-2.5 py-3 font-semibold text-right whitespace-nowrap ${
                          m === highlightMonth ? 'text-blue-900 bg-blue-50/70' : ''
                        }`}
                      >
                        {m.slice(0, 3)}
                      </th>
                    ))}
                    <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Apr→Nov Δ</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Latest Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readingMatrix.studentRows.slice(0, rowLimit).map((row) => {
                    const isExpanded = expandedStudentId === row.student.id;
                    return (
                      <React.Fragment key={row.student.id}>
                        <tr
                          className={`hover:bg-slate-50 ${isExpanded ? 'bg-blue-50/30' : ''}`}
                        >
                          <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStudentId((prev) =>
                                  prev === row.student.id ? null : row.student.id,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-left hover:text-blue-900"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              )}
                              <span>{row.student.name}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.student.classSection}</td>
                          {ACTIVE_SESSION_MONTHS.map((m) => {
                            const rep = row.byMonth[m];
                            const val = rep
                              ? readingMetric === 'wpm'
                                ? rep.wpm
                                : readingMetric === 'accuracyPct'
                                  ? rep.accuracyPct
                                  : readingMetric === 'comprehensionPct'
                                    ? rep.comprehensionPct
                                    : rep.overallPct
                              : null;
                            const suffix = readingMetric === 'wpm' ? '' : '%';
                            const lowScore = rep && readingMetric !== 'wpm' && (val ?? 0) < 65;
                            return (
                              <td
                                key={m}
                                className={`px-2.5 py-2.5 font-mono text-right tabular-nums whitespace-nowrap ${
                                  m === highlightMonth ? 'bg-blue-50/40 font-semibold' : ''
                                } ${
                                  val === null
                                    ? 'text-slate-300'
                                    : lowScore
                                      ? 'text-amber-700 font-semibold'
                                      : 'text-slate-800'
                                }`}
                              >
                                {val !== null ? `${val}${suffix}` : '—'}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <DeltaCell
                              value={readingMetric === 'wpm' ? row.netWpmDelta : row.netDeltaPct}
                              suffix={readingMetric === 'wpm' ? ' wpm' : '%'}
                            />
                          </td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                            {row.latestBand || '—'}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={12} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                                {ACTIVE_SESSION_MONTHS.map((m) => {
                                  const rep = row.byMonth[m];
                                  return (
                                    <div
                                      key={m}
                                      className="rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] space-y-1"
                                    >
                                      <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span>{m.slice(0, 3)}</span>
                                        <span className="font-mono text-blue-900 tabular-nums">
                                          {rep ? `${rep.overallPct}%` : '—'}
                                        </span>
                                      </div>
                                      {rep ? (
                                        <>
                                          <p className="font-mono text-slate-600 tabular-nums">
                                            {rep.wpm} WPM · {rep.accuracyPct}% Acc
                                          </p>
                                          <p className="font-mono text-slate-600 tabular-nums">
                                            {rep.comprehensionPct}% Comp · {rep.readingBand}
                                          </p>
                                          <p className="text-slate-500 leading-snug">{rep.remarks}</p>
                                        </>
                                      ) : (
                                        <p className="text-slate-400">Not logged</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {readingMatrix.studentRows.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-5 py-8 text-center text-slate-500">
                        No monthly reading reports match the active filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {readingMatrix.studentRows.length > rowLimit && (
              <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {rowLimit} of {readingMatrix.studentRows.length} students
                </span>
                <button
                  type="button"
                  onClick={() => setRowLimit((n) => n + 100)}
                  className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                >
                  Load 100 more →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: All-Months Side-by-Side Numeracy Growth Comparison */}
      {subTab === 'numeracy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Students Tracked (Apr–Nov)</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
                {numeracyMatrix.totalAssessedStudents}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {numeracyMatrix.improvedCount} showing net growth
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">
                Latest Cohort Mean ({numeracyMatrix.latestMonthLabel?.slice(0, 3) || 'Nov'})
              </p>
              <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
                {numeracyMatrix.latestAvgOverallPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                Tables mean: {numeracyMatrix.latestAvgTablesPct}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Apr → Nov Avg Growth</p>
              <div className="text-2xl mt-1">
                <DeltaCell value={numeracyMatrix.avgNetDeltaPct} />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Cohort session improvement</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Below 65% Support (Latest)</p>
              <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
                {numeracyMatrix.belowBenchmarkLatestCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {highlightMonth.slice(0, 3)} assessed: {highlightedNumeracyCohort?.assessedCount ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Cohort Numeracy Growth Trajectory — April to November 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Compare Tables Fluency, Mental Math, and Problem Solving together across every month of the academic session.
                </p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-0.5 self-start">
                {ACTIVE_SESSION_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setHighlightMonth(m)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      highlightMonth === m ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                Cohort Overall %
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                Mean Tables %
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-violet-600" />
                Mean Mental Math %
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-600" />
                Mean Problem Solving %
              </span>
            </div>

            <div className="h-56 w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={numeracyMatrix.monthlyCohortSeries} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                  <Bar dataKey="avgOverallPct" name="Cohort Overall %" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Line type="monotone" dataKey="avgTablesPct" name="Mean Tables %" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="avgMentalMathPct" name="Mean Mental Math %" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="avgProblemSolvingPct" name="Mean Problem Solving %" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {highlightedNumeracyCohort && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-900">
                  {highlightedNumeracyCohort.month} 2026 Cohort Snapshot:
                </span>
                <div className="flex flex-wrap items-center gap-4 font-mono text-slate-700 tabular-nums">
                  <span>Assessed: {highlightedNumeracyCohort.assessedCount}</span>
                  <span>Overall: {highlightedNumeracyCohort.avgOverallPct}%</span>
                  <span>Tables: {highlightedNumeracyCohort.avgTablesPct}%</span>
                  <span>Mental Math: {highlightedNumeracyCohort.avgMentalMathPct}%</span>
                  <span>Problem Solving: {highlightedNumeracyCohort.avgProblemSolvingPct}%</span>
                  <span className="text-amber-700">Support (&lt;65%): {highlightedNumeracyCohort.belowBenchmarkCount}</span>
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-900">Record Monthly Numeracy Evaluation</p>
                  <p className="text-[11px] text-slate-500">
                    Log tables fluency, mental math speed, and word-problem application for April–November.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSkillForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showSkillForm ? 'Close Form' : 'Log Numeracy Evaluation'}
                </button>
              </div>
              {showSkillForm && (
                <form onSubmit={handleSaveNumeracyReport} className="p-5 space-y-3 bg-slate-50/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-700">Select Assessment Month (2026):</span>
                    <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-0.5">
                      {ACTIVE_SESSION_MONTHS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSkillMonth(m)}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                            skillMonth === m ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-white'
                          }`}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="num-stu-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Student
                      </label>
                      <select
                        id="num-stu-select"
                        value={skillStudentId}
                        onChange={(e) => setSkillStudentId(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      >
                        {resolvedSkillStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} (Class {st.classSection} · {st.admissionNo})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="num-tables" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tables %
                      </label>
                      <input
                        id="num-tables"
                        type="number"
                        min={0}
                        max={100}
                        value={numTables}
                        onChange={(e) => setNumTables(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="num-mental" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Mental Math %
                      </label>
                      <input
                        id="num-mental"
                        type="number"
                        min={0}
                        max={100}
                        value={numMental}
                        onChange={(e) => setNumMental(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="num-problem" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Problem Solving %
                      </label>
                      <input
                        id="num-problem"
                        type="number"
                        min={0}
                        max={100}
                        value={numProblem}
                        onChange={(e) => setNumProblem(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label htmlFor="num-gap" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Conceptual Gap
                      </label>
                      <input
                        id="num-gap"
                        type="text"
                        value={numGap}
                        onChange={(e) => setNumGap(e.target.value)}
                        placeholder="e.g. 12–19 multiplication recall"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="num-remarks" className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Remarks
                      </label>
                      <input
                        id="num-remarks"
                        type="text"
                        value={numRemarks}
                        onChange={(e) => setNumRemarks(e.target.value)}
                        placeholder="Progress summary..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={skillSaving}
                      className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                    >
                      {skillSaving ? 'Saving...' : `Save ${skillMonth.slice(0, 3)} Report`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* All-Months Comparative Student Numeracy Matrix */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-900">
                All-Months Side-by-Side Numeracy Matrix ({numeracyMatrix.studentRows.length} students · Metric:{' '}
                {numeracyMetric === 'overallPct'
                  ? 'Overall %'
                  : numeracyMetric === 'tablesFluencyPct'
                    ? 'Tables %'
                    : numeracyMetric === 'mentalMathPct'
                      ? 'Mental Math %'
                      : 'Problem Solving %'}
                )
              </p>
              <span className="text-[11px] text-slate-500">Click any student row to inspect all 8 months &amp; conceptual gaps</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Student</th>
                    <th className="px-3 py-3 font-semibold whitespace-nowrap">Class</th>
                    {ACTIVE_SESSION_MONTHS.map((m) => (
                      <th
                        key={m}
                        className={`px-2.5 py-3 font-semibold text-right whitespace-nowrap ${
                          m === highlightMonth ? 'text-blue-900 bg-blue-50/70' : ''
                        }`}
                      >
                        {m.slice(0, 3)}
                      </th>
                    ))}
                    <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Apr→Nov Δ</th>
                    <th className="px-4 py-3 font-semibold">Latest Focus / Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {numeracyMatrix.studentRows.slice(0, rowLimit).map((row) => {
                    const isExpanded = expandedStudentId === row.student.id;
                    return (
                      <React.Fragment key={row.student.id}>
                        <tr className={`hover:bg-slate-50 ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedStudentId((prev) =>
                                  prev === row.student.id ? null : row.student.id,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-left hover:text-blue-900"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-blue-900 shrink-0" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              )}
                              <span>{row.student.name}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.student.classSection}</td>
                          {ACTIVE_SESSION_MONTHS.map((m) => {
                            const rep = row.byMonth[m];
                            const val = rep
                              ? numeracyMetric === 'tablesFluencyPct'
                                ? rep.tablesFluencyPct
                                : numeracyMetric === 'mentalMathPct'
                                  ? rep.mentalMathPct
                                  : numeracyMetric === 'problemSolvingPct'
                                    ? rep.problemSolvingPct
                                    : rep.overallPct
                              : null;
                            const lowScore = val !== null && val < 65;
                            return (
                              <td
                                key={m}
                                className={`px-2.5 py-2.5 font-mono text-right tabular-nums whitespace-nowrap ${
                                  m === highlightMonth ? 'bg-blue-50/40 font-semibold' : ''
                                } ${
                                  val === null
                                    ? 'text-slate-300'
                                    : lowScore
                                      ? 'text-amber-700 font-semibold'
                                      : 'text-slate-800'
                                }`}
                              >
                                {val !== null ? `${val}%` : '—'}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5 text-right whitespace-nowrap">
                            <DeltaCell value={row.netDeltaPct} />
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 max-w-[220px] truncate">
                            {row.latestGap || row.latestRemarks || 'On track'}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={12} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                                {ACTIVE_SESSION_MONTHS.map((m) => {
                                  const rep = row.byMonth[m];
                                  return (
                                    <div
                                      key={m}
                                      className="rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] space-y-1"
                                    >
                                      <div className="flex items-center justify-between font-bold text-slate-900">
                                        <span>{m.slice(0, 3)}</span>
                                        <span className="font-mono text-blue-900 tabular-nums">
                                          {rep ? `${rep.overallPct}%` : '—'}
                                        </span>
                                      </div>
                                      {rep ? (
                                        <>
                                          <p className="font-mono text-slate-600 tabular-nums">
                                            Tbl {rep.tablesFluencyPct}% · Mnt {rep.mentalMathPct}%
                                          </p>
                                          <p className="font-mono text-slate-600 tabular-nums">
                                            Prb {rep.problemSolvingPct}%
                                          </p>
                                          {rep.conceptualGap && (
                                            <p className="text-amber-800 font-medium">{rep.conceptualGap}</p>
                                          )}
                                          <p className="text-slate-500 leading-snug">{rep.remarks}</p>
                                        </>
                                      ) : (
                                        <p className="text-slate-400">Not logged</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {numeracyMatrix.studentRows.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-5 py-8 text-center text-slate-500">
                        No monthly numeracy reports match the active filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {numeracyMatrix.studentRows.length > rowLimit && (
              <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {rowLimit} of {numeracyMatrix.studentRows.length} students
                </span>
                <button
                  type="button"
                  onClick={() => setRowLimit((n) => n + 100)}
                  className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                >
                  Load 100 more →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
