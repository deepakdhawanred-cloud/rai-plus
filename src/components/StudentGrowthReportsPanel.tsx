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
  BarChart3,
  BookOpen,
  Calculator,
  CalendarDays,
  ClipboardList,
  LineChart as LineChartIcon,
} from 'lucide-react';
import type {
  AcademicMonthKey,
  AttendanceRecord,
  ExamMark,
  MonthlyAttendanceSummary,
  MonthlyNumeracyReport,
  MonthlyReadingReport,
  StudentRecord,
} from '../types';
import {
  buildStudentAttendanceGrowthSeries,
  buildStudentNumeracyGrowthSeries,
  buildStudentReadingGrowthSeries,
  buildStudentUtProgressionMatrix,
  shortExamLabel,
} from '../utils/growthReportEngine';
import { ACTIVE_SESSION_MONTHS } from '../utils/visAcademicProgressEngine';

interface StudentGrowthReportsPanelProps {
  student: StudentRecord;
  readingReports: MonthlyReadingReport[];
  numeracyReports: MonthlyNumeracyReport[];
  monthlyAttendance: MonthlyAttendanceSummary[];
  todayAttendanceRecord?: AttendanceRecord;
  todayIso: string;
  examMarks: ExamMark[];
  hideAttendance?: boolean;
  canEditAcademic: boolean;
  skillSaving: boolean;
  onSaveReading: (payload: {
    month: AcademicMonthKey;
    wpm: number;
    accuracyPct: number;
    comprehensionPct: number;
    remarks?: string;
  }) => Promise<void>;
  onSaveNumeracy: (payload: {
    month: AcademicMonthKey;
    tablesFluencyPct: number;
    mentalMathPct: number;
    problemSolvingPct: number;
    conceptualGap?: string;
    remarks?: string;
  }) => Promise<void>;
  onLaunchReadingTest?: () => void;
  onLaunchNumeracyTest?: () => void;
}

function DeltaReadout({ value, suffix = '%' }: { value: number | null; suffix?: string }) {
  if (value === null) return <span className="font-mono text-slate-400 tabular-nums">—</span>;
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
    <span className="inline-flex items-center gap-0.5 font-mono font-medium text-slate-600 tabular-nums">
      <ArrowRight className="h-3 w-3 shrink-0" />
      0{suffix}
    </span>
  );
}

export const StudentGrowthReportsPanel: React.FC<StudentGrowthReportsPanelProps> = ({
  student,
  readingReports,
  numeracyReports,
  monthlyAttendance,
  todayAttendanceRecord,
  todayIso,
  examMarks,
  hideAttendance = false,
  canEditAcademic,
  skillSaving,
  onSaveReading,
  onSaveNumeracy,
  onLaunchReadingTest,
  onLaunchNumeracyTest,
}) => {
  const readingSeries = useMemo(
    () => buildStudentReadingGrowthSeries(readingReports, student.id),
    [readingReports, student.id],
  );
  const numeracySeries = useMemo(
    () => buildStudentNumeracyGrowthSeries(numeracyReports, student.id),
    [numeracyReports, student.id],
  );
  const attendanceSeries = useMemo(
    () => buildStudentAttendanceGrowthSeries(monthlyAttendance, student.id),
    [monthlyAttendance, student.id],
  );
  const utMatrix = useMemo(
    () => buildStudentUtProgressionMatrix(examMarks, student.id),
    [examMarks, student.id],
  );

  const [focusedReadingMonth, setFocusedReadingMonth] = useState<AcademicMonthKey>('November');
  const [readingChartMode, setReadingChartMode] = useState<'line' | 'bar'>('line');
  const [showReadingWpm, setShowReadingWpm] = useState(true);
  const [focusedNumeracyMonth, setFocusedNumeracyMonth] = useState<AcademicMonthKey>('November');
  const [utViewMode, setUtViewMode] = useState<'progression' | 'records'>('progression');
  const [utExamFilter, setUtExamFilter] = useState<string>('All');

  // Staff segmented entry state (replaces month <select> dropdowns)
  const [showReadingEditor, setShowReadingEditor] = useState(false);
  const [editReadMonth, setEditReadMonth] = useState<AcademicMonthKey>('November');
  const [readWpm, setReadWpm] = useState('94');
  const [readAcc, setReadAcc] = useState('84');
  const [readComp, setReadComp] = useState('82');
  const [readRemarks, setReadRemarks] = useState('');

  const [showNumeracyEditor, setShowNumeracyEditor] = useState(false);
  const [editNumMonth, setEditNumMonth] = useState<AcademicMonthKey>('November');
  const [numTables, setNumTables] = useState('84');
  const [numMental, setNumMental] = useState('80');
  const [numProblem, setNumProblem] = useState('78');
  const [numGap, setNumGap] = useState('');
  const [numRemarks, setNumRemarks] = useState('');

  const focusedReadingPoint =
    readingSeries.points.find((p) => p.month === focusedReadingMonth) ||
    readingSeries.points[readingSeries.points.length - 1];
  const focusedNumeracyPoint =
    numeracySeries.points.find((p) => p.month === focusedNumeracyMonth) ||
    numeracySeries.points[numeracySeries.points.length - 1];

  const readingChartData = readingSeries.points.map((p) => ({
    shortMonth: p.shortMonth,
    month: p.month,
    overallPct: p.overallPct,
    accuracyPct: p.accuracyPct,
    comprehensionPct: p.comprehensionPct,
    wpm: p.wpm,
  }));

  const numeracyChartData = numeracySeries.points.map((p) => ({
    shortMonth: p.shortMonth,
    month: p.month,
    overallPct: p.overallPct,
    tablesFluencyPct: p.tablesFluencyPct,
    mentalMathPct: p.mentalMathPct,
    problemSolvingPct: p.problemSolvingPct,
  }));

  const attendanceChartData = attendanceSeries.points.map((p) => ({
    shortMonth: p.shortMonth,
    month: p.month,
    attendancePct: p.attendancePct,
    presentDays: p.presentDays,
    workingDays: p.workingDays,
  }));

  const rawStudentMarks = useMemo(
    () =>
      examMarks
        .filter((m) => m.studentId === student.id)
        .filter((m) => utExamFilter === 'All' || m.examName === utExamFilter),
    [examMarks, student.id, utExamFilter],
  );

  function selectReadingMonthForEdit(month: AcademicMonthKey) {
    setFocusedReadingMonth(month);
    setEditReadMonth(month);
    const existing = readingSeries.points.find((p) => p.month === month)?.report;
    if (existing) {
      setReadWpm(String(existing.wpm));
      setReadAcc(String(existing.accuracyPct));
      setReadComp(String(existing.comprehensionPct));
      setReadRemarks(existing.remarks || '');
    }
  }

  function selectNumeracyMonthForEdit(month: AcademicMonthKey) {
    setFocusedNumeracyMonth(month);
    setEditNumMonth(month);
    const existing = numeracySeries.points.find((p) => p.month === month)?.report;
    if (existing) {
      setNumTables(String(existing.tablesFluencyPct));
      setNumMental(String(existing.mentalMathPct));
      setNumProblem(String(existing.problemSolvingPct));
      setNumGap(existing.conceptualGap || '');
      setNumRemarks(existing.remarks || '');
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. READING GROWTH COMPARISON (ALL 8 MONTHS VISIBLE AT ONCE) */}
      <section
        aria-label="Reading Growth Comparison"
        className="scroll-mt-20 rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-blue-900" />
              Reading Growth Comparison (Apr–Nov 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Side-by-side monthly trajectory of Overall %, Fluency Speed (WPM), Accuracy %, and Comprehension %.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {readingSeries.startMonth?.slice(0, 3) || 'Apr'} → {readingSeries.latestMonth?.slice(0, 3) || 'Nov'}:{' '}
              <DeltaReadout value={readingSeries.netOverallDelta} />
              <span className="mx-1.5 text-slate-300">|</span>
              <DeltaReadout value={readingSeries.netWpmDelta} suffix=" WPM" />
            </div>
            {onLaunchReadingTest && (
              <button
                type="button"
                onClick={onLaunchReadingTest}
                className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Launch Live Reading Test →
              </button>
            )}
            {canEditAcademic && (
              <button
                type="button"
                onClick={() => setShowReadingEditor((v) => !v)}
                className="rounded-lg border border-blue-900 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
              >
                {showReadingEditor ? 'Close Update' : 'Update Month Score'}
              </button>
            )}
          </div>
        </div>

        {/* Reading KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">
              Latest Overall ({readingSeries.latestMonth?.slice(0, 3) || '—'})
            </p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
              {readingSeries.latestOverallPct !== null ? `${readingSeries.latestOverallPct}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              Start ({readingSeries.startMonth?.slice(0, 3) || '—'}):{' '}
              {readingSeries.startOverallPct !== null ? `${readingSeries.startOverallPct}%` : '—'}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Session Net Growth</p>
            <div className="text-2xl mt-1">
              <DeltaReadout value={readingSeries.netOverallDelta} />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              Peak: {readingSeries.peakMonth?.slice(0, 3) || '—'}{' '}
              {readingSeries.peakScorePct !== null ? `(${readingSeries.peakScorePct}%)` : ''}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Fluency Speed (WPM)</p>
            <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
              {readingSeries.latestWpm !== null ? `${readingSeries.latestWpm} WPM` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              Change: <DeltaReadout value={readingSeries.netWpmDelta} suffix=" WPM" />
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Current Reading Band</p>
            <p className="font-display text-xl font-bold text-slate-900 mt-1">
              {readingSeries.currentBand || 'Pending'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              {readingSeries.recordedCount}/8 session months logged
            </p>
          </div>
        </div>

        {readingSeries.recordedCount === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No monthly reading reports recorded for {student.name} yet.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Multi-Metric All-Months Recharts Trajectory */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    April → November Multi-Series Comparison (Overall %, Accuracy %, Comprehension %{showReadingWpm ? ' & WPM' : ''})
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 mt-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                      Overall %
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                      Accuracy %
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-600" />
                      Comprehension %
                    </span>
                    {showReadingWpm && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-xs bg-cyan-600" />
                        Speed (WPM, right axis)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => setShowReadingWpm((v) => !v)}
                    aria-pressed={showReadingWpm}
                    className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      showReadingWpm
                        ? 'border-cyan-700 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {showReadingWpm ? 'WPM On' : '+ Overlay WPM'}
                  </button>
                  <div
                    role="group"
                    aria-label="Student reading chart type"
                    className="inline-flex rounded-lg bg-slate-200/70 p-0.5"
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

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {readingChartMode === 'line' ? (
                    <LineChart
                      data={readingChartData}
                      margin={{ top: 8, right: showReadingWpm ? 8 : 16, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis
                        yAxisId="pct"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#475569' }}
                        unit="%"
                      />
                      {showReadingWpm && (
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
                        dataKey="overallPct"
                        name="Overall %"
                        stroke="#1e3a8a"
                        strokeWidth={2.75}
                        dot={{ r: 3.5 }}
                        connectNulls
                      />
                      <Line
                        yAxisId="pct"
                        type="monotone"
                        dataKey="accuracyPct"
                        name="Accuracy %"
                        stroke="#059669"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                      <Line
                        yAxisId="pct"
                        type="monotone"
                        dataKey="comprehensionPct"
                        name="Comprehension %"
                        stroke="#d97706"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                      {showReadingWpm && (
                        <Line
                          yAxisId="wpm"
                          type="monotone"
                          dataKey="wpm"
                          name="Speed (WPM)"
                          stroke="#0891b2"
                          strokeWidth={2}
                          strokeDasharray="4 2"
                          dot={{ r: 3 }}
                          connectNulls
                        />
                      )}
                    </LineChart>
                  ) : (
                    <BarChart
                      data={readingChartData}
                      margin={{ top: 8, right: showReadingWpm ? 8 : 16, left: -12, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis
                        yAxisId="pct"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#475569' }}
                        unit="%"
                      />
                      {showReadingWpm && (
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
                        dataKey="overallPct"
                        name="Overall %"
                        fill="#1e3a8a"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={14}
                      />
                      <Bar
                        yAxisId="pct"
                        dataKey="accuracyPct"
                        name="Accuracy %"
                        fill="#059669"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={14}
                      />
                      <Bar
                        yAxisId="pct"
                        dataKey="comprehensionPct"
                        name="Comprehension %"
                        fill="#d97706"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={14}
                      />
                      {showReadingWpm && (
                        <Bar
                          yAxisId="wpm"
                          dataKey="wpm"
                          name="Speed (WPM)"
                          fill="#0891b2"
                          radius={[3, 3, 0, 0]}
                          maxBarSize={14}
                        />
                      )}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* 8-Month Horizontal Side-by-Side Comparison Matrix */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Reading Metric</th>
                    {readingSeries.points.map((pt) => {
                      const active = pt.month === focusedReadingMonth;
                      return (
                        <th key={pt.month} className="px-2.5 py-2.5 text-center font-semibold">
                          <button
                            type="button"
                            onClick={() => selectReadingMonthForEdit(pt.month)}
                            className={`rounded px-2 py-0.5 transition-colors whitespace-nowrap ${
                              active
                                ? 'bg-blue-900 text-white'
                                : 'text-slate-700 hover:bg-slate-200/70'
                            }`}
                          >
                            {pt.shortMonth}
                          </button>
                        </th>
                      );
                    })}
                    <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Apr→Nov Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">Overall Score</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2.5 text-center font-mono font-semibold tabular-nums ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        } ${
                          pt.overallPct === null
                            ? 'text-slate-300'
                            : pt.overallPct < 65
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }`}
                      >
                        {pt.overallPct !== null ? `${pt.overallPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <DeltaReadout value={readingSeries.netOverallDelta} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Speed (WPM)</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-800 tabular-nums ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.wpm !== null ? pt.wpm : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <DeltaReadout value={readingSeries.netWpmDelta} suffix="" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Accuracy %</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-700 tabular-nums ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.accuracyPct !== null ? `${pt.accuracyPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-mono text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Comprehension %</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-700 tabular-nums ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.comprehensionPct !== null ? `${pt.comprehensionPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-mono text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Month-over-Month Δ</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center text-[11px] ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <DeltaReadout value={pt.momDeltaPct} />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right text-[11px] text-slate-500">MoM</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Reading Band</td>
                    {readingSeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2 py-2 text-center text-[11px] font-semibold text-slate-700 whitespace-nowrap ${
                          pt.month === focusedReadingMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.readingBand || '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {readingSeries.currentBand || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Selected Month Inspector Bar (No dropdown needed — click any month above) */}
            {focusedReadingPoint && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{focusedReadingPoint.month} 2026 Note: </span>
                  <span className="text-slate-700">
                    {focusedReadingPoint.remarks || 'No monthly reading note logged for this month.'}
                  </span>
                </div>
                {focusedReadingPoint.report && (
                  <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                    Assessed {focusedReadingPoint.report.assessedAt} · {focusedReadingPoint.report.assessedBy}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Staff Segmented Month Entry (Zero <select> dropdown) */}
        {canEditAcademic && showReadingEditor && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onSaveReading({
                month: editReadMonth,
                wpm: Number(readWpm) || 90,
                accuracyPct: Number(readAcc) || 82,
                comprehensionPct: Number(readComp) || 80,
                remarks: readRemarks.trim() || undefined,
              });
              setShowReadingEditor(false);
            }}
            className="border-t border-slate-200 bg-slate-50/80 p-5 space-y-3 print:hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">
                Record / Update Reading Score ({student.name})
              </span>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-0.5">
                {ACTIVE_SESSION_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectReadingMonthForEdit(m)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      editReadMonth === m
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end text-xs">
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Speed (WPM)</span>
                <input
                  type="number"
                  aria-label="Reading WPM"
                  value={readWpm}
                  onChange={(e) => setReadWpm(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Accuracy %</span>
                <input
                  type="number"
                  aria-label="Reading accuracy %"
                  value={readAcc}
                  onChange={(e) => setReadAcc(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Comprehension %</span>
                <input
                  type="number"
                  aria-label="Reading comprehension %"
                  value={readComp}
                  onChange={(e) => setReadComp(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="col-span-2 space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Teacher Remark</span>
                <input
                  type="text"
                  aria-label="Reading remarks"
                  value={readRemarks}
                  onChange={(e) => setReadRemarks(e.target.value)}
                  placeholder="Oral expression & comprehension note..."
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                />
              </label>
              <button
                type="submit"
                disabled={skillSaving}
                className="rounded bg-blue-900 px-3 py-1.5 font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Save {editReadMonth.slice(0, 3)}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. NUMERACY GROWTH COMPARISON (ALL 8 MONTHS VISIBLE AT ONCE) */}
      <section
        aria-label="Numeracy Growth Comparison"
        className="scroll-mt-20 rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-900" />
              Numeracy Growth Comparison — All Months (Apr–Nov 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Month-by-month comparison across Tables Fluency, Mental Math speed, and Word-Problem Solving.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-xs text-slate-600 font-mono tabular-nums">
              {numeracySeries.startMonth?.slice(0, 3) || 'Apr'} → {numeracySeries.latestMonth?.slice(0, 3) || 'Nov'}:{' '}
              <DeltaReadout value={numeracySeries.netOverallDelta} />
            </div>
            {onLaunchNumeracyTest && (
              <button
                type="button"
                onClick={onLaunchNumeracyTest}
                className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Launch Timed Tables Test →
              </button>
            )}
            {canEditAcademic && (
              <button
                type="button"
                onClick={() => setShowNumeracyEditor((v) => !v)}
                className="rounded-lg border border-blue-900 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
              >
                {showNumeracyEditor ? 'Close Update' : 'Update Month Score'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">
              Latest Overall ({numeracySeries.latestMonth?.slice(0, 3) || '—'})
            </p>
            <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-1">
              {numeracySeries.latestOverallPct !== null ? `${numeracySeries.latestOverallPct}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              Start ({numeracySeries.startMonth?.slice(0, 3) || '—'}):{' '}
              {numeracySeries.startOverallPct !== null ? `${numeracySeries.startOverallPct}%` : '—'}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Session Net Growth</p>
            <div className="text-2xl mt-1">
              <DeltaReadout value={numeracySeries.netOverallDelta} />
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              Peak: {numeracySeries.peakMonth?.slice(0, 3) || '—'}{' '}
              {numeracySeries.peakScorePct !== null ? `(${numeracySeries.peakScorePct}%)` : ''}
            </p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Strongest Area</p>
            <p className="font-display text-lg font-bold text-emerald-700 mt-1">
              {numeracySeries.strongestArea || '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Highest recent numeracy strand</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-medium text-slate-500">Priority Practice Focus</p>
            <p className="font-display text-lg font-bold text-slate-900 mt-1">
              {numeracySeries.focusArea || '—'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
              {numeracySeries.recordedCount}/8 session months logged
            </p>
          </div>
        </div>

        {numeracySeries.recordedCount === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No monthly numeracy reports recorded for {student.name} yet.
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-xs font-semibold text-slate-800">
                  April → November Trajectory (Overall %, Tables %, Mental Math %, Problem Solving %)
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-xs bg-blue-900" />
                    Overall %
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-xs bg-emerald-600" />
                    Tables %
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-xs bg-violet-600" />
                    Mental Math %
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-xs bg-amber-600" />
                    Problem Solving %
                  </span>
                </div>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={numeracyChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
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
                    <Bar dataKey="overallPct" name="Overall %" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={26} />
                    <Line
                      type="monotone"
                      dataKey="tablesFluencyPct"
                      name="Tables %"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="mentalMathPct"
                      name="Mental Math %"
                      stroke="#7c3aed"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="problemSolvingPct"
                      name="Problem Solving %"
                      stroke="#d97706"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Numeracy Metric</th>
                    {numeracySeries.points.map((pt) => {
                      const active = pt.month === focusedNumeracyMonth;
                      return (
                        <th key={pt.month} className="px-2.5 py-2.5 text-center font-semibold">
                          <button
                            type="button"
                            onClick={() => selectNumeracyMonthForEdit(pt.month)}
                            className={`rounded px-2 py-0.5 transition-colors whitespace-nowrap ${
                              active
                                ? 'bg-blue-900 text-white'
                                : 'text-slate-700 hover:bg-slate-200/70'
                            }`}
                          >
                            {pt.shortMonth}
                          </button>
                        </th>
                      );
                    })}
                    <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Apr→Nov Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">Overall Score</td>
                    {numeracySeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2.5 text-center font-mono font-semibold tabular-nums ${
                          pt.month === focusedNumeracyMonth ? 'bg-blue-50/70' : ''
                        } ${
                          pt.overallPct === null
                            ? 'text-slate-300'
                            : pt.overallPct < 65
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }`}
                      >
                        {pt.overallPct !== null ? `${pt.overallPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <DeltaReadout value={numeracySeries.netOverallDelta} />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Tables Fluency %</td>
                    {numeracySeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-800 tabular-nums ${
                          pt.month === focusedNumeracyMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.tablesFluencyPct !== null ? `${pt.tablesFluencyPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-mono text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Mental Math %</td>
                    {numeracySeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-700 tabular-nums ${
                          pt.month === focusedNumeracyMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.mentalMathPct !== null ? `${pt.mentalMathPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-mono text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Problem Solving %</td>
                    {numeracySeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center font-mono text-slate-700 tabular-nums ${
                          pt.month === focusedNumeracyMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        {pt.problemSolvingPct !== null ? `${pt.problemSolvingPct}%` : '—'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-mono text-slate-500">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Month-over-Month Δ</td>
                    {numeracySeries.points.map((pt) => (
                      <td
                        key={pt.month}
                        className={`px-2.5 py-2 text-center text-[11px] ${
                          pt.month === focusedNumeracyMonth ? 'bg-blue-50/70' : ''
                        }`}
                      >
                        <DeltaReadout value={pt.momDeltaPct} />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right text-[11px] text-slate-500">MoM</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {focusedNumeracyPoint && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{focusedNumeracyPoint.month} 2026 Focus: </span>
                  <span className="text-slate-700">
                    {focusedNumeracyPoint.conceptualGap ? `${focusedNumeracyPoint.conceptualGap} · ` : ''}
                    {focusedNumeracyPoint.remarks || 'No monthly numeracy note logged for this month.'}
                  </span>
                </div>
                {focusedNumeracyPoint.report && (
                  <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                    Assessed {focusedNumeracyPoint.report.assessedAt} · {focusedNumeracyPoint.report.assessedBy}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {canEditAcademic && showNumeracyEditor && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await onSaveNumeracy({
                month: editNumMonth,
                tablesFluencyPct: Number(numTables) || 82,
                mentalMathPct: Number(numMental) || 78,
                problemSolvingPct: Number(numProblem) || 76,
                conceptualGap: numGap.trim() || undefined,
                remarks: numRemarks.trim() || undefined,
              });
              setShowNumeracyEditor(false);
            }}
            className="border-t border-slate-200 bg-slate-50/80 p-5 space-y-3 print:hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">
                Record / Update Numeracy Score ({student.name})
              </span>
              <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/70 p-0.5">
                {ACTIVE_SESSION_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectNumeracyMonthForEdit(m)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${
                      editNumMonth === m
                        ? 'bg-blue-900 text-white'
                        : 'text-slate-700 hover:bg-white/70'
                    }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end text-xs">
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Tables %</span>
                <input
                  type="number"
                  aria-label="Numeracy tables %"
                  value={numTables}
                  onChange={(e) => setNumTables(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Mental Math %</span>
                <input
                  type="number"
                  aria-label="Numeracy mental math %"
                  value={numMental}
                  onChange={(e) => setNumMental(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Problem %</span>
                <input
                  type="number"
                  aria-label="Numeracy problem solving %"
                  value={numProblem}
                  onChange={(e) => setNumProblem(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono tabular-nums"
                />
              </label>
              <label className="col-span-2 space-y-1">
                <span className="block text-[11px] font-medium text-slate-600">Conceptual Gap / Note</span>
                <input
                  type="text"
                  aria-label="Numeracy gap note"
                  value={numGap}
                  onChange={(e) => setNumGap(e.target.value)}
                  placeholder="Optional topic focus..."
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5"
                />
              </label>
              <button
                type="submit"
                disabled={skillSaving}
                className="rounded bg-blue-900 px-3 py-1.5 font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Save {editNumMonth.slice(0, 3)}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 3. UT EXAM CYCLE PROGRESSION (SIDE-BY-SIDE UT-1 -> UT-2 -> UT-3) */}
      <section
        aria-label="UT Exam Progression"
        className="scroll-mt-20 rounded-xl border border-slate-200 bg-white overflow-hidden"
      >
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-900" />
              Unit Test (UT) Cycle Progression &amp; Subject Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare every subject side-by-side across assessment cycles ({utMatrix.examNames.join(' → ') || 'No cycles yet'}).
            </p>
          </div>
          <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setUtViewMode('progression')}
              className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                utViewMode === 'progression'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cycle Growth Matrix
            </button>
            <button
              type="button"
              onClick={() => setUtViewMode('records')}
              className={`rounded-md px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                utViewMode === 'records'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Marks ({examMarks.filter((m) => m.studentId === student.id).length})
            </button>
          </div>
        </div>

        {utMatrix.subjectRows.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No Unit Test marks recorded for {student.name} yet.
          </div>
        ) : utViewMode === 'progression' ? (
          <div className="p-5 space-y-5">
            {utMatrix.cycleAverages.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-[11px] text-slate-500">Overall UT Mean</p>
                    <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {utMatrix.overallAvgPct ?? 0}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
                    <p className="text-[11px] text-slate-500">Cycle-to-Cycle Growth</p>
                    <div className="text-xl mt-0.5">
                      <DeltaReadout value={utMatrix.netCycleDeltaPct} />
                    </div>
                  </div>
                  {utMatrix.cycleAverages.map((c) => (
                    <div key={c.examName} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-[11px] font-semibold text-slate-600">{c.examName}</p>
                      <p className="font-mono text-base font-bold text-blue-900 tabular-nums mt-0.5">
                        {c.avgPct}% avg · {c.subjectCount} subj
                      </p>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={utMatrix.cycleAverages} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
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
                      <Line
                        type="monotone"
                        dataKey="avgPct"
                        name="Cycle Average %"
                        stroke="#1e3a8a"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Subject</th>
                    {utMatrix.examNames.map((ex) => (
                      <th key={ex} className="px-3 py-2.5 text-right font-semibold whitespace-nowrap">
                        {shortExamLabel(ex)}
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Cycle Δ</th>
                    <th className="px-4 py-2.5 font-semibold">Latest Conceptual Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {utMatrix.subjectRows.map((row) => (
                    <tr key={row.subject} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                        {row.subject}
                      </td>
                      {utMatrix.examNames.map((ex) => {
                        const cell = row.byExam[ex];
                        return (
                          <td key={ex} className="px-3 py-2.5 text-right font-mono tabular-nums whitespace-nowrap">
                            {cell ? (
                              <span className={cell.pct < 65 ? 'text-amber-700 font-semibold' : 'text-slate-900 font-semibold'}>
                                {cell.pct}%{' '}
                                <span className="text-[11px] font-normal text-slate-500">
                                  ({cell.mark.obtainedMarks}/{cell.mark.maxMarks})
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <DeltaReadout value={row.netDeltaPct} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{row.latestGap || 'On track'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {utMatrix.examNames.length > 1 && (
              <div className="border-b border-slate-100 px-5 py-2.5 flex flex-wrap gap-1.5 bg-slate-50/70">
                <button
                  type="button"
                  onClick={() => setUtExamFilter('All')}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                    utExamFilter === 'All' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  All Cycles
                </button>
                {utMatrix.examNames.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setUtExamFilter(ex)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
                      utExamFilter === ex ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-2.5 font-semibold">Exam</th>
                    <th className="px-4 py-2.5 font-semibold">Subject</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Marks</th>
                    <th className="px-4 py-2.5 font-semibold text-right">%</th>
                    <th className="px-6 py-2.5 font-semibold">Conceptual Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rawStudentMarks.map((mk) => {
                    const pct = mk.maxMarks > 0 ? Math.round((mk.obtainedMarks / mk.maxMarks) * 100) : 0;
                    return (
                      <tr key={mk.id} className="hover:bg-slate-50">
                        <td className="px-6 py-2.5 font-semibold text-slate-900 whitespace-nowrap">{mk.examName}</td>
                        <td className="px-4 py-2.5 text-slate-800 whitespace-nowrap">{mk.subject}</td>
                        <td className="px-4 py-2.5 font-mono text-right text-slate-900 tabular-nums">
                          {mk.obtainedMarks}/{mk.maxMarks}
                        </td>
                        <td
                          className={`px-4 py-2.5 font-mono text-right font-semibold tabular-nums ${
                            pct < 65 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {pct}%
                        </td>
                        <td className="px-6 py-2.5 text-slate-600">{mk.conceptualGap || 'On track'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 4. MONTHLY ATTENDANCE GROWTH & CONSISTENCY (APR-NOV 2026) */}
      {!hideAttendance && (
        <section
          aria-label="Monthly Attendance Growth Register"
          className="scroll-mt-20 rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-900" />
                Month-Wise Attendance Consistency — All Months (Apr–Nov 2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Today ({todayIso}):{' '}
                <strong
                  className={
                    todayAttendanceRecord?.status === 'Present'
                      ? 'text-emerald-700'
                      : todayAttendanceRecord?.status === 'Absent'
                        ? 'text-red-700'
                        : 'text-slate-800'
                  }
                >
                  {todayAttendanceRecord?.status || 'Not Marked'}
                </strong>{' '}
                · Overall YTD: {student.attendancePct}% · Present {attendanceSeries.totalPresentDays}/
                {attendanceSeries.totalWorkingDays} working days
              </p>
            </div>
            <span className="text-xs text-slate-500">Observational context · Never alters OLQs</span>
          </div>

          {attendanceSeries.recordedCount === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No monthly attendance records available for {student.name} yet.
            </div>
          ) : (
            <div className="p-5 space-y-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
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
                    <ReferenceLine y={75} stroke="#d97706" strokeDasharray="4 4" />
                    <Bar dataKey="attendancePct" name="Attendance %" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold whitespace-nowrap">Attendance Metric</th>
                      {attendanceSeries.points.map((pt) => (
                        <th key={pt.month} className="px-2.5 py-2.5 text-center font-semibold whitespace-nowrap">
                          {pt.shortMonth}
                        </th>
                      ))}
                      <th className="px-4 py-2.5 text-right font-semibold whitespace-nowrap">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">Monthly %</td>
                      {attendanceSeries.points.map((pt) => (
                        <td
                          key={pt.month}
                          className={`px-2.5 py-2.5 text-center font-mono font-semibold tabular-nums ${
                            pt.attendancePct === null
                              ? 'text-slate-300'
                              : pt.attendancePct < 75
                                ? 'text-amber-700'
                                : 'text-blue-900'
                          }`}
                        >
                          {pt.attendancePct !== null ? `${pt.attendancePct}%` : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        {attendanceSeries.ytdCalculatedPct ?? student.attendancePct}%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Present / Working</td>
                      {attendanceSeries.points.map((pt) => (
                        <td key={pt.month} className="px-2.5 py-2 text-center font-mono text-slate-700 tabular-nums whitespace-nowrap">
                          {pt.presentDays !== null && pt.workingDays !== null
                            ? `${pt.presentDays}/${pt.workingDays}`
                            : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                        {attendanceSeries.totalPresentDays}/{attendanceSeries.totalWorkingDays}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium text-slate-700 whitespace-nowrap">Absent / Leave</td>
                      {attendanceSeries.points.map((pt) => (
                        <td key={pt.month} className="px-2.5 py-2 text-center font-mono text-slate-500 tabular-nums whitespace-nowrap">
                          {pt.absentDays !== null ? `${pt.absentDays}A · ${pt.leaveDays ?? 0}L` : '—'}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {attendanceSeries.totalAbsentDays}A · {attendanceSeries.totalLeaveDays}L
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
