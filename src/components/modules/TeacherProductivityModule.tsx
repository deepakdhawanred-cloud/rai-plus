import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  FileDown,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import type { TeacherProductivityKpiConfig } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { triggerCsvDownload } from '../../utils/csvExport';
import {
  computeTeacherProductivityReport,
  createDefaultProductivityKpiConfig,
} from '../../utils/teacherProductivityEngine';

interface TeacherProductivityModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

export const TeacherProductivityModule: React.FC<TeacherProductivityModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const isLeadership = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );
  const serverCfg =
    data.productivityKpiConfig || createDefaultProductivityKpiConfig(data.activeSchool.id);

  const [kpiDraft, setKpiDraft] = useState<TeacherProductivityKpiConfig>(serverCfg);
  const [searchQuery, setSearchQuery] = useState('');
  const [showKpiPanel, setShowKpiPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const report = useMemo(
    () =>
      computeTeacherProductivityReport({
        timetable: data.timetable,
        substitutions: data.substitutionAssignments || [],
        leaveRequests: data.teacherLeaveRequests || [],
        lessonPlans: data.lessonPlans,
        notebookEntries: data.notebookEntries,
        homeworkAssignments: data.homeworkAssignments || [],
        homeworkSubmissions: data.homeworkSubmissions || [],
        remedialAssignments: data.remedialAssignments || [],
        examMarks: data.examMarks,
        attendanceNotifications: data.attendanceNotifications || [],
        notebookNotifications: data.notebookNotifications || [],
        homeVisits: data.homeVisitRecords,
        config: kpiDraft,
      }),
    [data, kpiDraft],
  );

  const visibleRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return report.rows.filter((r) => {
      if (
        data.user.role === 'teacher' &&
        !r.teacherName.toLowerCase().includes(data.user.name.toLowerCase()) &&
        !data.user.name.toLowerCase().includes(r.teacherName.toLowerCase())
      ) {
        return false;
      }
      if (!q) return true;
      return (
        r.teacherName.toLowerCase().includes(q) ||
        r.subjects.some((s) => s.toLowerCase().includes(q)) ||
        r.classes.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [report.rows, searchQuery, data.user.role, data.user.name]);

  async function handleSaveKpiConfig(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await apiRequest(
        '/api/productivity/kpi-config',
        { method: 'PUT', body: JSON.stringify(kpiDraft) },
        token,
      );
      await onRefresh();
      setFeedback('Updated contextual Teacher Productivity KPI weights and monthly benchmarks.');
      setShowKpiPanel(false);
    } finally {
      setSaving(false);
    }
  }

  function handleExportCsv() {
    const headers = [
      'Teacher Name',
      'Subjects',
      'Weekly Periods',
      'Substitutes Covered',
      'Approved Leave Days',
      'Workload Utilization %',
      'Lesson Plans',
      'Notebook Checks',
      'Homework Assigned',
      'Remedials Assigned',
      'Parent Notifications',
      'Contextual Summary Index',
      'Support Context Note',
    ];
    const rows = visibleRows.map((r) => [
      r.teacherName,
      r.subjects.join('; '),
      String(r.weeklyRegularPeriods),
      String(r.substitutePeriodsCovered),
      String(r.leaveDaysApproved),
      `${r.workloadUtilizationPct}%`,
      String(r.lessonPlansCount),
      String(r.notebookEntriesLogged),
      String(r.homeworkAssignedCount),
      String(r.remedialsAssignedCount),
      String(r.parentNotificationsTriggered),
      String(r.contextualSummaryIndex),
      r.supportContextNote,
    ]);
    triggerCsvDownload(`virat-teacher-productivity-${data.activeSchool.code}.csv`, headers, rows);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-900" />
            Teacher Productivity &amp; Academic Execution Intelligence
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Contextual, auditable workload and academic execution reports connected to real timetable, substitution, syllabus, notebook, homework, and remedial records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {isLeadership && (
            <button
              type="button"
              onClick={() => setShowKpiPanel((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-900" />
              Configure KPI Weights
            </button>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-emerald-700" />
            Export Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
          >
            <FileDown className="h-3.5 w-3.5" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Fairness & Non-Ranking Governance Notice */}
      <div className="rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-2.5 flex items-start gap-2.5 text-xs text-blue-950">
        <Info className="h-4 w-4 text-blue-900 shrink-0 mt-0.5" />
        <p>
          <strong>Contextual Support Reporting (No Unfair Teacher Ranking):</strong> Faculty records are ordered alphabetically and interpreted alongside teaching load, substitute duties, and approved leaves so principals can balance workloads and support academic execution constructively — never via punitive leaderboards.
        </p>
      </div>

      {feedback && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Weight Config Drawer */}
      {showKpiPanel && isLeadership && (
        <form
          onSubmit={handleSaveKpiConfig}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 print:hidden"
        >
          <h2 className="text-sm font-bold text-slate-900">Configurable School KPI Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workload Weight (%)</label>
              <input
                type="number"
                min={5}
                max={80}
                value={kpiDraft.weights.teachingWorkload}
                onChange={(e) =>
                  setKpiDraft((p) => ({
                    ...p,
                    weights: { ...p.weights, teachingWorkload: Number(e.target.value) || 30 },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Weight (%)</label>
              <input
                type="number"
                min={5}
                max={80}
                value={kpiDraft.weights.academicExecution}
                onChange={(e) =>
                  setKpiDraft((p) => ({
                    ...p,
                    weights: { ...p.weights, academicExecution: Number(e.target.value) || 45 },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Weight (%)</label>
              <input
                type="number"
                min={5}
                max={80}
                value={kpiDraft.weights.operationalEngagement}
                onChange={(e) =>
                  setKpiDraft((p) => ({
                    ...p,
                    weights: { ...p.weights, operationalEngagement: Number(e.target.value) || 25 },
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Periods/Wk</label>
              <input
                type="number"
                min={10}
                max={45}
                value={kpiDraft.targetWeeklyPeriods}
                onChange={(e) =>
                  setKpiDraft((p) => ({ ...p, targetWeeklyPeriods: Number(e.target.value) || 28 }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Notebooks/Mo</label>
              <input
                type="number"
                min={2}
                max={100}
                value={kpiDraft.targetNotebookChecksMonthly}
                onChange={(e) =>
                  setKpiDraft((p) => ({
                    ...p,
                    targetNotebookChecksMonthly: Number(e.target.value) || 12,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Lesson Plans</label>
              <input
                type="number"
                min={1}
                max={20}
                value={kpiDraft.targetLessonPlansMonthly}
                onChange={(e) =>
                  setKpiDraft((p) => ({
                    ...p,
                    targetLessonPlansMonthly: Number(e.target.value) || 2,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowKpiPanel(false)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Save School KPI Config
            </button>
          </div>
        </form>
      )}

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Active Teaching Faculty', value: report.schoolTeacherCount, sub: 'Mapped from live timetable' },
          { label: 'Regular Weekly Periods', value: report.totalRegularPeriods, sub: 'Scheduled instructional load' },
          { label: 'Substitutes Covered', value: report.totalSubstitutionsCovered, sub: 'Vacant period coverage' },
          { label: 'Notebook Checks Logged', value: report.totalNotebookChecks, sub: 'Verified notebook entries' },
          { label: 'Lesson Plans & Remedials', value: `${report.totalLessonPlans} / ${report.totalRemedialsAssigned}`, sub: 'Plans · Developmental remedials' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-semibold text-slate-500">{card.label}</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Detailed Contextual Faculty Ledger */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-900" />
            Faculty Contextual Evidence Matrix ({visibleRows.length} faculty)
          </h2>
          {isLeadership && (
            <input
              type="text"
              aria-label="Filter teachers by name, subject, or class"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter teacher, subject, or class..."
              className="w-64 rounded-lg border border-slate-300 px-3 py-1.5 text-xs print:hidden"
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[11px] text-slate-500">
                <th className="py-2 pr-3">Faculty (Alphabetical)</th>
                <th className="py-2 text-right">Reg / Sub</th>
                <th className="py-2 text-right">Load %</th>
                <th className="py-2 text-right">Leaves</th>
                <th className="py-2 text-right">Plans</th>
                <th className="py-2 text-right">Notebooks</th>
                <th className="py-2 text-right">HW / Rem</th>
                <th className="py-2 text-right">Comms</th>
                <th className="py-2 pl-4">Contextual Support Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRows.map((row) => (
                <tr key={row.teacherKey} className="hover:bg-slate-50/60">
                  <td className="py-2.5 pr-3">
                    <p className="font-bold text-slate-900">{row.teacherName}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {row.subjects.join(', ') || 'General'} ({row.classes.length} classes)
                    </p>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    <strong>{row.weeklyRegularPeriods}</strong>
                    <span className="text-slate-400"> / </span>
                    <span className="text-emerald-700 font-semibold">{row.substitutePeriodsCovered}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    <span
                      className={
                        row.workloadUtilizationPct >= 100
                          ? 'font-bold text-amber-700'
                          : 'font-semibold text-slate-800'
                      }
                    >
                      {row.workloadUtilizationPct}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">
                    {row.leaveDaysApproved}d
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">{row.lessonPlansCount}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    {row.notebookEntriesLogged}
                    {row.notebookCompleteRatePct !== null && (
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({row.notebookCompleteRatePct}%)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    {row.homeworkAssignedCount} / {row.remedialsAssignedCount}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    {row.parentNotificationsTriggered + row.homeVisitsConducted}
                  </td>
                  <td className="py-2.5 pl-4 text-slate-700 max-w-xs">{row.supportContextNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
