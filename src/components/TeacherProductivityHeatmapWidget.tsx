import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  AlertTriangle,
  ArrowRight,
  Flame,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import {
  buildTeacherSemesterHeatmap,
  HEATMAP_CATEGORY_LABELS,
  type HeatmapCellCategory,
  type HeatmapMetricMode,
  type TeacherHeatmapCell,
} from '../utils/teacherProductivityHeatmapEngine';

interface TeacherProductivityHeatmapWidgetProps {
  data: WorkspaceData;
  compact?: boolean;
  onNavigate?: (tab: WorkspaceTab) => void;
}

type FacultyFilterMode = 'all' | 'burnout_watch' | 'high_efficiency';

const PATTERN_COLORS: Record<HeatmapCellCategory, string> = {
  high_efficiency: '#059669', // Deep Emerald — peak efficiency
  optimal: '#6EE7B7', // Soft Mint — balanced & steady
  moderate_leave: '#FCD34D', // Warm Amber — single leave / half-day
  leave_cluster: '#818CF8', // Muted Indigo — extended leave
  burnout_risk: '#DC2626', // Crimson — potential burnout strain
};

function getCellFill(
  cell: TeacherHeatmapCell,
  mode: HeatmapMetricMode,
  attendanceScale: d3.ScaleLinear<string, string>,
  leaveScale: d3.ScaleLinear<string, string>,
): string {
  if (mode === 'pattern') return PATTERN_COLORS[cell.category];
  if (mode === 'attendance') return attendanceScale(cell.attendancePct);
  const leaveTotal = cell.leaveDays + cell.absentDays + cell.halfDays * 0.5;
  return leaveScale(Math.min(3, leaveTotal));
}

export const TeacherProductivityHeatmapWidget: React.FC<
  TeacherProductivityHeatmapWidgetProps
> = ({ data, compact = false, onNavigate }) => {
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('pattern');
  const [facultyFilter, setFacultyFilter] = useState<FacultyFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{
    cell: TeacherHeatmapCell;
    x: number;
    y: number;
  } | null>(null);
  const [selectedCell, setSelectedCell] = useState<TeacherHeatmapCell | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(920);

  const isSingleTeacherRole = data.user.role === 'teacher';

  const model = useMemo(
    () =>
      buildTeacherSemesterHeatmap({
        staffProfiles: data.staffProfiles || [],
        staffAttendance: data.staffAttendance || [],
        timetable: data.timetable || [],
        leaveRequests: data.teacherLeaveRequests || [],
        substitutions: data.substitutionAssignments || [],
        lessonPlans: data.lessonPlans || [],
        notebookEntries: data.notebookEntries || [],
        homeworkAssignments: data.homeworkAssignments || [],
        config: data.productivityKpiConfig,
        weekCount: 16,
        restrictToTeacherName: isSingleTeacherRole ? data.user.name : null,
      }),
    [
      data.staffProfiles,
      data.staffAttendance,
      data.timetable,
      data.teacherLeaveRequests,
      data.substitutionAssignments,
      data.lessonPlans,
      data.notebookEntries,
      data.homeworkAssignments,
      data.productivityKpiConfig,
      isSingleTeacherRole,
      data.user.name,
    ],
  );

  const visibleTeachers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = model.teachers.filter((row) => {
      if (facultyFilter !== 'all' && row.dominantPattern !== facultyFilter) return false;
      if (q) {
        const hay = `${row.teacherName} ${row.designation} ${row.subjectsLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (!compact || filtered.length <= 8) return filtered;

    // In compact Overview mode, prioritize faculty with burnout watch or high efficiency so key patterns surface immediately
    const priorityOrder = { burnout_watch: 0, high_efficiency: 1, balanced: 2 } as const;
    return [...filtered]
      .sort(
        (a, b) =>
          priorityOrder[a.dominantPattern] - priorityOrder[b.dominantPattern] ||
          a.teacherName.localeCompare(b.teacherName),
      )
      .slice(0, 8);
  }, [model.teachers, facultyFilter, searchQuery, compact]);

  const visibleCells = useMemo(() => {
    const keySet = new Set(visibleTeachers.map((t) => t.teacherKey));
    return model.cells.filter((c) => keySet.has(c.teacherKey));
  }, [model.cells, visibleTeachers]);

  // Measure container width responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const next = Math.max(680, Math.floor(el.getBoundingClientRect().width));
      setContainerWidth(next);
    };
    updateWidth();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Render D3 SVG heatmap whenever layout, data, metric mode, or selected cell changes
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl || visibleTeachers.length === 0 || model.weeks.length === 0) return;

    const margin = { top: 54, right: 64, bottom: 18, left: 172 };
    const rowHeight = compact ? 30 : 34;
    const innerWidth = Math.max(460, containerWidth - margin.left - margin.right);
    const innerHeight = visibleTeachers.length * rowHeight;
    const totalHeight = innerHeight + margin.top + margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg
      .attr('width', containerWidth)
      .attr('height', totalHeight)
      .attr('viewBox', `0 0 ${containerWidth} ${totalHeight}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand<string>()
      .domain(model.weeks.map((w) => w.weekCode))
      .range([0, innerWidth])
      .padding(0.14);

    const yScale = d3
      .scaleBand<string>()
      .domain(visibleTeachers.map((t) => t.teacherKey))
      .range([0, innerHeight])
      .padding(0.18);

    const attendanceScale = d3
      .scaleLinear<string>()
      .domain([50, 78, 92, 100])
      .range(['#DC2626', '#F59E0B', '#6EE7B7', '#059669'])
      .clamp(true);

    const leaveScale = d3
      .scaleLinear<string>()
      .domain([0, 0.5, 1.5, 3])
      .range(['#ECFDF5', '#FDE68A', '#F59E0B', '#DC2626'])
      .clamp(true);

    // Column highlight bands for semester-wide Burnout Watch & High-Efficiency windows
    const bandGroup = g.append('g').attr('class', 'period-bands');
    for (const wk of model.weeks) {
      const bx = xScale(wk.weekCode);
      if (bx === undefined) continue;
      const bw = xScale.bandwidth();

      if (wk.isPeriodHighlight === 'burnout_window') {
        bandGroup
          .append('rect')
          .attr('x', bx - 2)
          .attr('y', -18)
          .attr('width', bw + 4)
          .attr('height', innerHeight + 22)
          .attr('rx', 6)
          .attr('fill', '#FEF2F2')
          .attr('stroke', '#FECACA')
          .attr('stroke-width', 1);

        bandGroup
          .append('text')
          .attr('x', bx + bw / 2)
          .attr('y', -36)
          .attr('text-anchor', 'middle')
          .attr('fill', '#B91C1C')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .text('STRAIN');
      } else if (wk.isPeriodHighlight === 'high_efficiency_window') {
        bandGroup
          .append('rect')
          .attr('x', bx - 2)
          .attr('y', -18)
          .attr('width', bw + 4)
          .attr('height', innerHeight + 22)
          .attr('rx', 6)
          .attr('fill', '#ECFDF5')
          .attr('stroke', '#A7F3D0')
          .attr('stroke-width', 1);

        bandGroup
          .append('text')
          .attr('x', bx + bw / 2)
          .attr('y', -36)
          .attr('text-anchor', 'middle')
          .attr('fill', '#047857')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .text('PEAK');
      }
    }

    // X-Axis Week & Month Labels via D3
    const xAxisGroup = g.append('g').attr('class', 'x-axis');
    const seenMonths = new Set<string>();
    for (const wk of model.weeks) {
      const bx = xScale(wk.weekCode);
      if (bx === undefined) continue;
      const cx = bx + xScale.bandwidth() / 2;

      if (!seenMonths.has(wk.monthLabel)) {
        seenMonths.add(wk.monthLabel);
        xAxisGroup
          .append('text')
          .attr('x', cx)
          .attr('y', -22)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748B')
          .attr('font-size', '10px')
          .attr('font-weight', '600')
          .text(wk.monthLabel);
      }

      xAxisGroup
        .append('text')
        .attr('x', cx)
        .attr('y', -6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .attr('font-weight', '600')
        .text(wk.weekCode);
    }

    // Y-Axis Teacher Names + Right-Side Attendance Rate Column
    const yAxisGroup = g.append('g').attr('class', 'y-axis');
    const rightColHeader = g
      .append('text')
      .attr('x', innerWidth + 12)
      .attr('y', -6)
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('Att.');
    void rightColHeader;

    for (const teacher of visibleTeachers) {
      const by = yScale(teacher.teacherKey);
      if (by === undefined) continue;
      const cy = by + yScale.bandwidth() / 2;
      const shortName =
        teacher.teacherName.length > 20
          ? `${teacher.teacherName.slice(0, 19)}…`
          : teacher.teacherName;

      yAxisGroup
        .append('text')
        .attr('x', -10)
        .attr('y', cy + 1)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#0F172A')
        .attr('font-size', '11px')
        .attr('font-weight', teacher.dominantPattern === 'burnout_watch' ? '700' : '600')
        .text(shortName);

      // Right-aligned tabular attendance %
      yAxisGroup
        .append('text')
        .attr('x', innerWidth + 12)
        .attr('y', cy + 1)
        .attr('dominant-baseline', 'middle')
        .attr('fill', teacher.dominantPattern === 'burnout_watch' ? '#B91C1C' : '#334155')
        .attr('font-size', '11px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .attr('font-weight', '600')
        .text(`${teacher.semesterAttendancePct}%`);
    }

    // Heatmap Cells rendered via D3 data join
    const cellWidth = xScale.bandwidth();
    const cellHeight = yScale.bandwidth();

    const cellsSelection = g
      .append('g')
      .attr('class', 'heatmap-cells')
      .selectAll<SVGRectElement, TeacherHeatmapCell>('rect')
      .data(visibleCells, (d) => `${d.teacherKey}-${d.weekCode}`)
      .join('rect')
      .attr('x', (d) => xScale(d.weekCode) ?? 0)
      .attr('y', (d) => yScale(d.teacherKey) ?? 0)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', (d) => getCellFill(d, metricMode, attendanceScale, leaveScale))
      .attr('stroke', (d) =>
        selectedCell &&
        selectedCell.teacherKey === d.teacherKey &&
        selectedCell.weekCode === d.weekCode
          ? '#0F172A'
          : '#FFFFFF',
      )
      .attr('stroke-width', (d) =>
        selectedCell &&
        selectedCell.teacherKey === d.teacherKey &&
        selectedCell.weekCode === d.weekCode
          ? 2
          : 1,
      )
      .style('cursor', 'pointer')
      .on('mouseenter', function (_event, d) {
        d3.select(this).attr('stroke', '#142B46').attr('stroke-width', 2);
        const cx = (xScale(d.weekCode) ?? 0) + margin.left + cellWidth / 2;
        const cy = (yScale(d.teacherKey) ?? 0) + margin.top;
        setHoveredCell({ cell: d, x: cx, y: cy });
      })
      .on('mouseleave', function (_event, d) {
        const isSelected =
          selectedCell &&
          selectedCell.teacherKey === d.teacherKey &&
          selectedCell.weekCode === d.weekCode;
        d3.select(this)
          .attr('stroke', isSelected ? '#0F172A' : '#FFFFFF')
          .attr('stroke-width', isSelected ? 2 : 1);
        setHoveredCell(null);
      })
      .on('click', (_event, d) => {
        setSelectedCell((prev) =>
          prev && prev.teacherKey === d.teacherKey && prev.weekCode === d.weekCode ? null : d,
        );
      });

    // Subtle crisp letter cue inside burnout/leave cells so state is never conveyed by hue alone
    if (cellWidth >= 22 && cellHeight >= 18) {
      g.append('g')
        .attr('class', 'cell-markers')
        .style('pointer-events', 'none')
        .selectAll<SVGTextElement, TeacherHeatmapCell>('text')
        .data(
          visibleCells.filter(
            (d) =>
              metricMode === 'pattern' &&
              (d.category === 'burnout_risk' || d.category === 'leave_cluster'),
          ),
        )
        .join('text')
        .attr('x', (d) => (xScale(d.weekCode) ?? 0) + cellWidth / 2)
        .attr('y', (d) => (yScale(d.teacherKey) ?? 0) + cellHeight / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#FFFFFF')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, monospace')
        .text((d) => (d.category === 'burnout_risk' ? '!' : 'L'));
    }

    cellsSelection
      .append('title')
      .text(
        (d) =>
          `${d.teacherName} · ${d.dateRangeLabel}: ${d.categoryLabel} (${d.attendancePct}% att, ${d.leaveDays + d.absentDays}d leave/abs, ${d.workloadUtilizationPct}% load)`,
      );
  }, [model.weeks, visibleTeachers, visibleCells, containerWidth, compact, metricMode, selectedCell]);

  const hasFilters = facultyFilter !== 'all' || searchQuery.trim().length > 0;

  return (
    <section
      aria-label="Teacher Productivity Semester Heatmap"
      data-testid="teacher-productivity-d3-heatmap"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header Bar */}
      <div className="border-b border-slate-200 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <h2 className="font-display text-base font-bold text-slate-900">
            Teacher Productivity · Semester Attendance &amp; Leave Heatmap
          </h2>
          <p className="text-xs text-slate-500">
            {model.semesterLabel} · Highlights high-efficiency windows and early burnout strain from
            attendance, leave, and substitute cover load.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Metric Mode Segmented Control */}
          <div
            role="group"
            aria-label="Heatmap metric mode"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs"
          >
            {(
              [
                { id: 'pattern', label: 'Burnout & Efficiency' },
                { id: 'attendance', label: 'Attendance %' },
                { id: 'leave_load', label: 'Leave Load' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMetricMode(opt.id)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  metricMode === opt.id
                    ? 'bg-[#142B46] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {compact && onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('productivity')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Full Productivity Report</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Semester Summary KPI Strip */}
      <div className="border-b border-slate-200 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">Mean Semester Attendance</p>
          <p className="mt-0.5 font-mono text-xl font-bold text-slate-900 tabular-nums">
            {model.summary.avgSemesterAttendancePct}%
          </p>
          <p className="text-[11px] text-slate-500 font-mono tabular-nums">
            {model.summary.teacherCount} faculty · {model.summary.totalLeaveDays}d leave/abs
          </p>
        </div>

        <div className="px-5 py-3.5 border-l border-slate-200 lg:border-l-0">
          <p className="text-[11px] font-medium text-slate-500">Burnout Watch Faculty</p>
          <p
            className={`mt-0.5 font-mono text-xl font-bold tabular-nums ${
              model.summary.burnoutWatchTeachers > 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {model.summary.burnoutWatchTeachers}
          </p>
          <p className="text-[11px] text-slate-500">Sustained load &amp; cover spikes</p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-[11px] font-medium text-slate-500">High-Efficiency Faculty</p>
          <p className="mt-0.5 font-mono text-xl font-bold text-emerald-700 tabular-nums">
            {model.summary.highEfficiencyTeachers}
          </p>
          <p className="text-[11px] text-slate-500">Steady ≥94% cadence</p>
        </div>

        <div className="px-5 py-3.5 border-l border-slate-200 lg:border-l-0">
          <p className="text-[11px] font-medium text-slate-500">Peak vs. Strain Window</p>
          <p className="mt-0.5 text-xs font-semibold text-emerald-700 font-mono tabular-nums truncate">
            Peak: {model.summary.peakEfficiencyWeek || 'Balanced'}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-red-700 font-mono tabular-nums truncate">
            Strain: {model.summary.highestStrainWeek || 'None detected'}
          </p>
        </div>
      </div>

      {/* Filter & Legend Strip */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isSingleTeacherRole && (
            <div
              role="group"
              aria-label="Filter faculty pattern"
              className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-xs"
            >
              {(
                [
                  { id: 'all', label: `All (${model.teachers.length})` },
                  {
                    id: 'burnout_watch',
                    label: `Burnout Watch (${model.summary.burnoutWatchTeachers})`,
                  },
                  {
                    id: 'high_efficiency',
                    label: `High Efficiency (${model.summary.highEfficiencyTeachers})`,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFacultyFilter(item.id)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    facultyFilter === item.id
                      ? 'bg-[#142B46] text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {!compact && !isSingleTeacherRole && (
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search teacher in heatmap"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter teacher or subject..."
                className="w-52 rounded-lg border border-slate-300 bg-white pl-8 pr-7 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#142B46] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear heatmap search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setFacultyFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Semantic Legend (Color + Explicit Text Label) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
          {metricMode === 'pattern' ? (
            <>
              {(
                [
                  ['high_efficiency', 'High Efficiency'],
                  ['optimal', 'Balanced'],
                  ['moderate_leave', 'Leave / Dip'],
                  ['leave_cluster', 'Extended (L)'],
                  ['burnout_risk', 'Burnout Risk (!)'],
                ] as const
              ).map(([key, label]) => (
                <span key={key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-[3px] shrink-0"
                    style={{ backgroundColor: PATTERN_COLORS[key] }}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </span>
              ))}
            </>
          ) : metricMode === 'attendance' ? (
            <span className="inline-flex items-center gap-2 font-mono tabular-nums">
              <span>50%</span>
              <span
                className="inline-block h-2.5 w-28 rounded-sm"
                style={{
                  background: 'linear-gradient(to right, #DC2626, #F59E0B, #6EE7B7, #059669)',
                }}
                aria-hidden="true"
              />
              <span>100% Attendance</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono tabular-nums">
              <span>0d</span>
              <span
                className="inline-block h-2.5 w-28 rounded-sm"
                style={{
                  background: 'linear-gradient(to right, #ECFDF5, #FDE68A, #F59E0B, #DC2626)',
                }}
                aria-hidden="true"
              />
              <span>3+ Leave / Abs Days</span>
            </span>
          )}
        </div>
      </div>

      {/* D3 Heatmap Viewport */}
      {visibleTeachers.length === 0 ? (
        <div className="px-6 py-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            No faculty match the selected productivity filter
          </p>
          <p className="text-xs text-slate-500">
            Reset the filter to view the full 16-week semester attendance and leave matrix.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setFacultyFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="relative overflow-x-auto px-3 py-4" ref={containerRef}>
          <svg
            ref={svgRef}
            role="img"
            aria-label="D3 teacher productivity semester attendance and leave heatmap"
            className="block select-none"
          />

          {/* Interactive Hover Tooltip */}
          {hoveredCell && (
            <div
              className="pointer-events-none absolute z-20 w-64 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-lg"
              style={{
                left: `${Math.min(
                  Math.max(12, hoveredCell.x - 128),
                  Math.max(12, containerWidth - 270),
                )}px`,
                top: `${Math.max(8, hoveredCell.y - 108)}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 truncate">
                  {hoveredCell.cell.teacherName}
                </p>
                <span
                  className={`font-semibold whitespace-nowrap ${
                    hoveredCell.cell.category === 'burnout_risk'
                      ? 'text-red-700'
                      : hoveredCell.cell.category === 'high_efficiency'
                        ? 'text-emerald-700'
                        : 'text-amber-800'
                  }`}
                >
                  {hoveredCell.cell.categoryLabel}
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-0.5">
                {hoveredCell.cell.dateRangeLabel}
              </p>

              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 font-mono text-[11px] tabular-nums">
                <p className="flex justify-between gap-3 text-slate-700">
                  <span>Attendance</span>
                  <span className="font-semibold text-slate-900">
                    {hoveredCell.cell.attendancePct}% ({hoveredCell.cell.presentDays}/
                    {hoveredCell.cell.workingDays}d)
                  </span>
                </p>
                <p className="flex justify-between gap-3 text-slate-700">
                  <span>Leave / Absent / Half</span>
                  <span>
                    {hoveredCell.cell.leaveDays} / {hoveredCell.cell.absentDays} /{' '}
                    {hoveredCell.cell.halfDays}
                  </span>
                </p>
                <p className="flex justify-between gap-3 text-slate-700">
                  <span>Load (Reg + Sub)</span>
                  <span>
                    {hoveredCell.cell.regularPeriods} + {hoveredCell.cell.substitutePeriods} (
                    {hoveredCell.cell.workloadUtilizationPct}%)
                  </span>
                </p>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                {hoveredCell.cell.insightNote}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Basis:{' '}
                {hoveredCell.cell.dataBasis === 'logged'
                  ? 'Direct ERP attendance / leave logs'
                  : 'Timetable & semester schedule baseline'}{' '}
                · Click cell to pin
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pinned Cell Diagnostic Bar OR Burnout / High-Efficiency Pattern Highlights */}
      <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3.5">
        {selectedCell ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-semibold text-slate-900">{selectedCell.teacherName}</span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className="font-mono text-slate-600 tabular-nums">
                  {selectedCell.dateRangeLabel}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span
                  className={`font-semibold ${
                    selectedCell.category === 'burnout_risk'
                      ? 'text-red-700'
                      : selectedCell.category === 'high_efficiency'
                        ? 'text-emerald-700'
                        : 'text-amber-800'
                  }`}
                >
                  {HEATMAP_CATEGORY_LABELS[selectedCell.category]}
                </span>
              </div>
              <p className="text-slate-600">{selectedCell.insightNote}</p>
              <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                Attendance {selectedCell.attendancePct}% · Leave {selectedCell.leaveDays}d · Absent{' '}
                {selectedCell.absentDays}d · Load {selectedCell.workloadUtilizationPct}% (
                {selectedCell.regularPeriods} reg + {selectedCell.substitutePeriods} sub) · Burnout
                Strain {selectedCell.burnoutIndex}/100
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 self-start md:self-center"
            >
              <X className="h-3.5 w-3.5" />
              Close Inspection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              {model.summary.burnoutWatchTeachers > 0 ? (
                <Flame className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 min-w-0">
                <p className="font-semibold text-slate-900">Burnout Watch Signals</p>
                {model.teachers.filter((t) => t.dominantPattern === 'burnout_watch').length > 0 ? (
                  <p className="text-slate-600 leading-relaxed">
                    {model.teachers
                      .filter((t) => t.dominantPattern === 'burnout_watch')
                      .slice(0, 2)
                      .map((t) => `${t.teacherName} (${t.burnoutRiskWeeks} strain wks)`)
                      .join(' · ')}{' '}
                    — click any red cell to inspect cover load and rebalance duties.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    No sustained burnout clusters detected across current faculty loads.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="font-semibold text-slate-900">High-Efficiency Cadence</p>
                {model.teachers.filter((t) => t.dominantPattern === 'high_efficiency').length >
                0 ? (
                  <p className="text-slate-600 leading-relaxed">
                    {model.teachers
                      .filter((t) => t.dominantPattern === 'high_efficiency')
                      .slice(0, 3)
                      .map((t) => `${t.teacherName} (${t.semesterAttendancePct}%)`)
                      .join(' · ')}{' '}
                    sustained peak attendance and balanced instructional delivery.
                  </p>
                ) : (
                  <p className="text-slate-500">
                    Click any semester week cell to inspect attendance, leave, and cover metrics.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
