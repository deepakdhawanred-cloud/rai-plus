import React, { useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowRight, BarChart3, Download, Filter } from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import {
  buildAdminAnalyticsBundle,
  type AssessmentCompletionStreamPoint,
  type AttendanceTrendPoint,
  type TeacherProductivityChartPoint,
} from '../utils/adminAnalyticsEngine';

interface AdminAnalyticsVisualizerProps {
  data: WorkspaceData;
  onNavigate?: (tab: WorkspaceTab) => void;
}

type AnalyticsFocusTab = 'all' | 'attendance' | 'productivity' | 'assessments';
type AttendanceChartMode = 'monthly' | 'by_class';

const NAVY = '#142B46';
const TEAL = '#0D9488';
const GOLD = '#B48A3E';
const SLATE_GRID = '#E2E8F0';
const SLATE_TICK = '#475569';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const CRIMSON = '#DC2626';

function getCompletionColor(pct: number): string {
  if (pct >= 80) return GREEN;
  if (pct >= 50) return GOLD;
  if (pct >= 25) return AMBER;
  return CRIMSON;
}

function downloadCsvFile(filename: string, rows: string[][]) {
  const escapeCell = (val: string) => {
    if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
    return val;
  };
  const csv = rows.map((r) => r.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface CustomTooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}

const AttendanceTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as unknown as AttendanceTrendPoint | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-sm">
      <p className="font-semibold text-slate-900">{row.monthKey}</p>
      <div className="mt-1.5 space-y-1 font-mono tabular-nums">
        <p className="flex items-center justify-between gap-4 text-slate-700">
          <span>Student Attendance</span>
          <span className="font-semibold text-[#142B46]">{row.studentAttendancePct}%</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-500">
          <span>Present / Absent / Leave</span>
          <span>
            {row.presentDays} / {row.absentDays} / {row.leaveDays}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-500">
          <span>Target Benchmark</span>
          <span>{row.targetPct}%</span>
        </p>
      </div>
    </div>
  );
};

const ProductivityTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as unknown as TeacherProductivityChartPoint | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-sm max-w-[260px]">
      <p className="font-semibold text-slate-900">{row.teacherName}</p>
      <p className="text-[11px] text-slate-500 truncate">{row.subjectsLabel}</p>
      <div className="mt-2 space-y-1 font-mono tabular-nums">
        <p className="flex items-center justify-between gap-4 text-slate-700">
          <span>Execution Index</span>
          <span className="font-semibold text-[#142B46]">{row.contextualIndex}%</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-700">
          <span>Workload Ratio</span>
          <span className="font-semibold text-[#0D9488]">{row.workloadUtilizationPct}%</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-500">
          <span>Weekly / Sub Periods</span>
          <span>
            {row.weeklyRegularPeriods} + {row.substitutePeriodsCovered}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-500">
          <span>Lesson Plans / Checks</span>
          <span>
            {row.lessonPlansCount} / {row.notebookEntriesLogged}
          </span>
        </p>
      </div>
    </div>
  );
};

const AssessmentTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload as unknown as AssessmentCompletionStreamPoint | undefined;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-sm">
      <p className="font-semibold text-slate-900">{row.stream}</p>
      <div className="mt-1.5 space-y-1 font-mono tabular-nums">
        <p className="flex items-center justify-between gap-4 text-slate-700">
          <span>Completion Rate</span>
          <span className="font-semibold text-[#142B46]">{row.completionRatePct}%</span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-600">
          <span>Completed</span>
          <span>
            {row.completedStudents} / {row.totalStudents} students
          </span>
        </p>
        <p className="flex items-center justify-between gap-4 text-slate-500">
          <span>Pending</span>
          <span>{row.pendingStudents} students</span>
        </p>
      </div>
    </div>
  );
};

export const AdminAnalyticsVisualizer: React.FC<AdminAnalyticsVisualizerProps> = ({
  data,
  onNavigate,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [focusTab, setFocusTab] = useState<AnalyticsFocusTab>('all');
  const [attendanceMode, setAttendanceMode] = useState<AttendanceChartMode>('monthly');
  const [showAllTeachers, setShowAllTeachers] = useState<boolean>(false);

  const bundle = useMemo(
    () => buildAdminAnalyticsBundle(data, selectedClass),
    [data, selectedClass],
  );

  const visibleTeachers = useMemo(() => {
    const limit = showAllTeachers || focusTab === 'productivity' ? 14 : 7;
    return bundle.teacherProductivitySeries.slice(0, limit);
  }, [bundle.teacherProductivitySeries, showAllTeachers, focusTab]);

  function handleExportCsv() {
    const rows: string[][] = [
      ['Section', 'Label', 'Primary Metric', 'Secondary Metric', 'Details'],
      ...bundle.monthlyAttendanceSeries.map((m) => [
        'Attendance Trend',
        m.monthKey,
        `${m.studentAttendancePct}%`,
        `Target ${m.targetPct}%`,
        `Present ${m.presentDays} / Absent ${m.absentDays} / Leave ${m.leaveDays}`,
      ]),
      ...bundle.teacherProductivitySeries.map((t) => [
        'Teacher Productivity',
        t.teacherName,
        `Index ${t.contextualIndex}%`,
        `Workload ${t.workloadUtilizationPct}%`,
        `${t.weeklyRegularPeriods} periods + ${t.substitutePeriodsCovered} subs`,
      ]),
      ...bundle.assessmentCompletionSeries.map((a) => [
        'Assessment Completion',
        a.stream,
        `${a.completionRatePct}%`,
        `${a.completedStudents}/${a.totalStudents} completed`,
        `${a.pendingStudents} pending`,
      ]),
    ];
    const scopeSlug = bundle.selectedClass === 'ALL' ? 'all-classes' : bundle.selectedClass;
    downloadCsvFile(`rai-plus-admin-analytics-${scopeSlug}.csv`, rows);
  }

  return (
    <section
      aria-label="School Performance & Analytics Visualizer"
      data-testid="admin-analytics-visualizer"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Top Header & Interactive Controls */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BarChart3 className="h-3.5 w-3.5 text-[#142B46] shrink-0" />
            <span>{data.activeSchool.name}</span>
            <span aria-hidden="true">·</span>
            <span>Session {data.activeSchool.session}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {bundle.scopedStudentCount} students
            </span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 mt-0.5">
            Institutional Performance &amp; Analytics
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Focus View Segmented Control */}
          <div
            role="tablist"
            aria-label="Analytics metric focus"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs"
          >
            {(
              [
                { id: 'all', label: 'All Metrics' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'productivity', label: 'Teacher Ratios' },
                { id: 'assessments', label: 'Assessments' },
              ] as Array<{ id: AnalyticsFocusTab; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={focusTab === tab.id}
                onClick={() => setFocusTab(tab.id)}
                className={`rounded-md px-3 py-1.5 font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  focusTab === tab.id
                    ? 'bg-[#142B46] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Class Scope Filter */}
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="sr-only">Filter by class section</span>
            <select
              aria-label="Filter analytics by class"
              value={bundle.selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none pr-1"
            >
              <option value="ALL">All Classes ({data.students.length})</option>
              {bundle.availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </label>

          {/* Export CSV Action */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-[#142B46]" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Headline Ratio Summary Strip (Hairline Dividers, Zero Nested Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/50">
        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Mean Student Attendance</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {bundle.avgSchoolAttendancePct}%
            </span>
            {bundle.attendanceDeltaPct !== null && (
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  bundle.attendanceDeltaPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {bundle.attendanceDeltaPct >= 0 ? '+' : ''}
                {bundle.attendanceDeltaPct}% MoM
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Latest: {bundle.latestMonthLabel} ({bundle.latestMonthAttendancePct}%)
            {bundle.staffAttendancePct !== null ? ` · Staff ${bundle.staffAttendancePct}%` : ''}
          </p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Faculty Execution Ratio</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {bundle.avgTeacherProductivityIndex}%
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {bundle.trackedTeacherCount} faculty
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Avg workload {bundle.avgTeacherWorkloadPct}% · {bundle.totalSubstitutionsCovered} covers
          </p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Assessment Completion Rate</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {bundle.overallAssessmentCompletionPct}%
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              7 streams
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            {bundle.completedAssessmentsCount} completed records across cohort
          </p>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-slate-500">Attendance Target Status</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span
              className={`font-mono text-2xl font-bold tabular-nums ${
                bundle.avgSchoolAttendancePct >= 90
                  ? 'text-emerald-700'
                  : bundle.avgSchoolAttendancePct >= 82
                    ? 'text-amber-700'
                    : 'text-rose-700'
              }`}
            >
              {bundle.avgSchoolAttendancePct >= 90
                ? 'On Target'
                : bundle.avgSchoolAttendancePct >= 82
                  ? 'Watchlist'
                  : 'Below Goal'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
            Institutional benchmark: 90.0% minimum
          </p>
        </div>
      </div>

      {/* Charts Canvas */}
      <div className="p-6 space-y-8">
        {/* 1. School Attendance Trends */}
        {(focusTab === 'all' || focusTab === 'attendance') && (
          <div data-testid="chart-school-attendance-trends">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. School Attendance Trends
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {attendanceMode === 'monthly'
                    ? 'Monthly student attendance percentage compared against the 90% school benchmark.'
                    : 'Attendance, absence, and approved leave distribution across every class section.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('monthly')}
                    className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                      attendanceMode === 'monthly'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceMode('by_class')}
                    className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                      attendanceMode === 'by_class'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    By Class
                  </button>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance_heatmap')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
                  >
                    Heatmap
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {attendanceMode === 'monthly' ? (
              bundle.monthlyAttendanceSeries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[260px] border border-dashed border-slate-200 rounded-lg text-center px-4">
                  <p className="text-sm font-semibold text-slate-700">
                    No monthly attendance data logged yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Mark daily attendance to populate monthly school trend curves.
                  </p>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('attendance_heatmap')}
                      className="mt-3 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C]"
                    >
                      Open Attendance Register
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={bundle.monthlyAttendanceSeries}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="raiAttendanceFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={NAVY} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={NAVY} stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={SLATE_GRID} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: SLATE_TICK }}
                        axisLine={{ stroke: SLATE_GRID }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[50, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: SLATE_TICK }}
                        axisLine={false}
                        tickLine={false}
                        width={42}
                      />
                      <Tooltip content={<AttendanceTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        iconType="plainline"
                      />
                      <ReferenceLine
                        y={90}
                        stroke={GOLD}
                        strokeDasharray="4 4"
                        label={{
                          value: '90% Target',
                          position: 'insideTopRight',
                          fill: GOLD,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="studentAttendancePct"
                        name="Student Attendance %"
                        stroke={NAVY}
                        strokeWidth={2.5}
                        fill="url(#raiAttendanceFill)"
                        activeDot={{ r: 5, fill: NAVY, stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="targetPct"
                        name="Institutional Goal (90%)"
                        stroke={GOLD}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bundle.classAttendanceSeries}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={SLATE_GRID} vertical={false} />
                    <XAxis
                      dataKey="classSection"
                      tick={{ fontSize: 11, fill: SLATE_TICK }}
                      axisLine={{ stroke: SLATE_GRID }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: SLATE_TICK }}
                      axisLine={false}
                      tickLine={false}
                      width={42}
                    />
                    <Tooltip
                      formatter={(val: unknown, name: unknown) => [
                        `${Number(val ?? 0).toFixed(1)}%`,
                        String(name ?? ''),
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <ReferenceLine y={90} stroke={GOLD} strokeDasharray="4 4" />
                    <Bar
                      dataKey="attendancePct"
                      name="Present %"
                      fill={NAVY}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={34}
                    />
                    <Bar
                      dataKey="absentPct"
                      name="Absent %"
                      fill={CRIMSON}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={34}
                    />
                    <Bar
                      dataKey="leavePct"
                      name="Leave %"
                      fill={GOLD}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={34}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Divider when showing All Metrics */}
        {focusTab === 'all' && <hr className="border-slate-200" />}

        {/* 2 & 3. Two-Column Balanced Grid: Teacher Productivity Ratios + Student Assessment Completion Rates */}
        {(focusTab === 'all' ||
          focusTab === 'productivity' ||
          focusTab === 'assessments') && (
          <div
            className={`grid grid-cols-1 gap-8 items-stretch ${
              focusTab === 'all' ? 'xl:grid-cols-2' : ''
            }`}
          >
            {/* 2. Teacher Productivity Ratios */}
            {(focusTab === 'all' || focusTab === 'productivity') && (
              <div
                data-testid="chart-teacher-productivity-ratios"
                className="flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      2. Teacher Productivity Ratios
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Workload utilization vs. contextual academic execution index (alphabetical, non-punitive).
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {bundle.teacherProductivitySeries.length > 7 && focusTab === 'all' && (
                      <button
                        type="button"
                        onClick={() => setShowAllTeachers((prev) => !prev)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                      >
                        {showAllTeachers
                          ? 'Show 7'
                          : `Show all (${bundle.teacherProductivitySeries.length})`}
                      </button>
                    )}
                    {onNavigate && (
                      <button
                        type="button"
                        onClick={() => onNavigate('productivity')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap"
                      >
                        Full Report
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {visibleTeachers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-slate-200 rounded-lg text-center px-4">
                    <p className="text-sm font-semibold text-slate-700">
                      No faculty timetable or workload entries found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Assign classes in Smart Timetable to calculate faculty productivity ratios.
                    </p>
                  </div>
                ) : (
                  <div
                    className="w-full"
                    style={{ height: Math.max(300, visibleTeachers.length * 42) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={visibleTeachers}
                        layout="vertical"
                        margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
                        barGap={3}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={SLATE_GRID}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 11, fill: SLATE_TICK }}
                          axisLine={{ stroke: SLATE_GRID }}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="shortName"
                          tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          width={96}
                        />
                        <Tooltip content={<ProductivityTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                        <ReferenceLine x={75} stroke={GOLD} strokeDasharray="3 3" />
                        <Bar
                          dataKey="contextualIndex"
                          name="Execution Index %"
                          fill={NAVY}
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        />
                        <Bar
                          dataKey="workloadUtilizationPct"
                          name="Workload Ratio %"
                          fill={TEAL}
                          radius={[0, 4, 4, 0]}
                          barSize={12}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* 3. Student Assessment Completion Rates */}
            {(focusTab === 'all' || focusTab === 'assessments') && (
              <div
                data-testid="chart-assessment-completion-rates"
                className="flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      3. Student Assessment Completion Rates
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Percentage of enrolled students with logged evaluations across all 7 academic &amp; skill streams.
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('assessments')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
                    >
                      Assessment Labs
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {bundle.scopedStudentCount === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-slate-200 rounded-lg text-center px-4">
                    <p className="text-sm font-semibold text-slate-700">
                      No students in the selected scope
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Select another class section to view assessment completion rates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={bundle.assessmentCompletionSeries}
                          layout="vertical"
                          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={SLATE_GRID}
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                            tick={{ fontSize: 11, fill: SLATE_TICK }}
                            axisLine={{ stroke: SLATE_GRID }}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="shortLabel"
                            tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            width={84}
                          />
                          <Tooltip content={<AssessmentTooltip />} />
                          <ReferenceLine x={80} stroke={GREEN} strokeDasharray="3 3" />
                          <Bar
                            dataKey="completionRatePct"
                            name="Completion Rate %"
                            radius={[0, 4, 4, 0]}
                            barSize={18}
                          >
                            {bundle.assessmentCompletionSeries.map((entry) => (
                              <Cell
                                key={entry.id}
                                fill={getCompletionColor(entry.completionRatePct)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Compact Tabular Legend & Direct Stream Jump */}
                    <div className="border-t border-slate-100 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                      {bundle.assessmentCompletionSeries.map((stream) => (
                        <div
                          key={stream.id}
                          className="flex items-center justify-between gap-2 text-slate-600"
                        >
                          <span className="truncate">{stream.shortLabel}</span>
                          <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                            {stream.completedStudents}/{stream.totalStudents} ({stream.completionRatePct}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expanded Per-Class Assessment Coverage Matrix when Focused on Assessments */}
        {focusTab === 'assessments' && bundle.classAssessmentSeries.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-bold text-slate-900">
              Class-Wise Core Assessment Coverage (Reading, Numeracy &amp; Term Exams)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Side-by-side completion ratio for each class section to spot pending lab evaluations quickly.
            </p>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bundle.classAssessmentSeries}
                  margin={{ top: 8, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={SLATE_GRID} vertical={false} />
                  <XAxis
                    dataKey="classSection"
                    tick={{ fontSize: 11, fill: SLATE_TICK }}
                    axisLine={{ stroke: SLATE_GRID }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: SLATE_TICK }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />
                  <Tooltip
                    formatter={(val: unknown, name: unknown) => [
                      `${Number(val ?? 0).toFixed(1)}%`,
                      String(name ?? ''),
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="examMarksPct"
                    name="Term Exams %"
                    fill={NAVY}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="readingPct"
                    name="Reading Lab %"
                    fill={TEAL}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="numeracyPct"
                    name="Numeracy Lab %"
                    fill={GOLD}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
