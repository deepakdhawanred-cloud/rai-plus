import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Layers } from 'lucide-react';
import type { ActivityContributionLevel, ActivityKind, LearnersComponentKey } from '../types';
import type { WorkspaceData } from '../types/workspace';
import { apiRequest } from '../utils/api';
import { COMPONENT_LABELS, OLQ_DEFINITIONS } from '../utils/evidenceEngine';
import {
  ACTIVITY_KINDS,
  computeSectionCoverageMatrix,
} from '../utils/olqActivityEngine';

interface ActivityDutyRegisterPanelProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent: (studentId: string) => void;
}

interface ActivityDraftRow {
  studentId: string;
  studentName: string;
  rollNo: string;
  tookPart: boolean;
  contributionLevel: ActivityContributionLevel;
  note: string;
}

export const ActivityDutyRegisterPanel: React.FC<ActivityDutyRegisterPanelProps> = ({
  data,
  token,
  onRefresh,
  onOpenStudent,
}) => {
  const availableClasses = Array.from(new Set(data.students.map((s) => s.classSection)));
  const [classSection, setClassSection] = useState(availableClasses[0] || '6-A');
  const [kind, setKind] = useState<ActivityKind>('group');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-15');
  const [rows, setRows] = useState<ActivityDraftRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const classStudents = data.students.filter((s) => s.classSection === classSection);
    setRows(
      classStudents.map((st) => ({
        studentId: st.id,
        studentName: st.name,
        rollNo: st.rollNo,
        tookPart: true,
        contributionLevel: 3,
        note: '',
      })),
    );
  }, [classSection, data.students]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!title.trim() || !date.trim()) {
      setErrorMsg('Activity title and date are required.');
      return;
    }
    if (rows.length === 0) {
      setErrorMsg('No students available in selected class section.');
      return;
    }

    setSaving(true);
    try {
      const res = await apiRequest<{ syncedEvidenceCount: number }>(
        '/api/activities/roster',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection,
            kind,
            title: title.trim(),
            date,
            entries: rows.map((r) => ({
              studentId: r.studentId,
              tookPart: r.tookPart,
              contributionLevel: r.tookPart ? r.contributionLevel : undefined,
              note: r.note,
            })),
          }),
        },
        token,
      );
      setTitle('');
      await onRefresh();
      setSuccessMsg(
        `Saved activity register for Class ${classSection} and synced ${res.syncedEvidenceCount} participation record(s). Non-participating rows did not record any zero penalty.`,
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save activity roster.');
    } finally {
      setSaving(false);
    }
  }

  const recentActivities = data.activityRecords || [];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display text-base font-bold text-slate-900">
              Whole-Class Activity & Duty Participation Register
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Log group work, labs, assemblies, house duties, or sports once for the whole class.
              Students who did not take part never receive a synthetic zero.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Class & Section</span>
              <select
                aria-label="Activity class section"
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </label>

            <label className="lg:col-span-3 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Activity Category</span>
              <select
                aria-label="Activity category"
                value={kind}
                onChange={(e) => setKind(e.target.value as ActivityKind)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {ACTIVITY_KINDS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="lg:col-span-5 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Activity / Duty Title *</span>
              <input
                type="text"
                aria-label="Activity title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arjuna House Morning Assembly & Reading Circle"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>

            <label className="lg:col-span-2 space-y-1">
              <span className="block text-xs font-medium text-slate-700">Date</span>
              <input
                type="date"
                aria-label="Activity date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
              />
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Roll</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Participated</th>
                  <th className="px-4 py-3 font-semibold">Contribution Level</th>
                  <th className="px-4 py-3 font-semibold">Observation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">{r.rollNo}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onOpenStudent(r.studentId)}
                        className="font-semibold text-blue-900 hover:underline text-left"
                      >
                        {r.studentName}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Participated for ${r.studentName}`}
                        value={r.tookPart ? 'Yes' : 'No'}
                        onChange={(e) => {
                          const tookPart = e.target.value === 'Yes';
                          setRows((prev) =>
                            prev.map((item) =>
                              item.studentId === r.studentId ? { ...item, tookPart } : item,
                            ),
                          );
                        }}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      >
                        <option value="Yes">Yes (Took Part)</option>
                        <option value="No">No (Absent / Not Involved)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Contribution level for ${r.studentName}`}
                        disabled={!r.tookPart}
                        value={r.contributionLevel}
                        onChange={(e) => {
                          const lvl = Number(e.target.value) as ActivityContributionLevel;
                          setRows((prev) =>
                            prev.map((item) =>
                              item.studentId === r.studentId
                                ? { ...item, contributionLevel: lvl }
                                : item,
                            ),
                          );
                        }}
                        className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value={1}>1 · Observed Participation</option>
                        <option value={2}>2 · Steady Contributor</option>
                        <option value={3}>3 · Strong Teamwork & Initiative</option>
                        <option value={4}>4 · Leadership & Exemplary Ownership</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        aria-label={`Activity note for ${r.studentName}`}
                        value={r.note}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) =>
                            prev.map((item) =>
                              item.studentId === r.studentId ? { ...item, note: val } : item,
                            ),
                          );
                        }}
                        placeholder={r.tookPart ? 'Specific role or observation...' : 'Optional context (never penalized)'}
                        className="w-full min-w-[200px] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              Syncs automatically to Participation, Personal Growth, and category-mapped OLQs.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              {saving ? 'Saving Activity...' : 'Save Activity Roster & Sync OLQs'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            data-testid="activity-save-success"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </form>

      {/* Recent Activity History */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-display text-sm font-bold text-slate-900">
            Recent Class Activity & Duty Logs ({recentActivities.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivities.slice(0, 8).map((act) => {
            const tookPartCount = act.entries.filter((e) => e.tookPart).length;
            const kindLabel =
              ACTIVITY_KINDS.find((k) => k.value === act.kind)?.label ?? act.kind;
            return (
              <div
                key={act.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {act.title}{' '}
                    <span className="font-normal text-blue-900">
                      · Class {act.classSection} ({kindLabel})
                    </span>
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    {act.date} · Recorded by {act.recordedBy}
                  </p>
                </div>
                <span className="font-mono font-semibold text-slate-700 tabular-nums shrink-0">
                  {tookPartCount}/{act.entries.length} participated
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface SectionEvidenceCoveragePanelProps {
  data: WorkspaceData;
  onOpenStudent: (studentId: string) => void;
}

export const SectionEvidenceCoveragePanel: React.FC<SectionEvidenceCoveragePanelProps> = ({
  data,
  onOpenStudent,
}) => {
  const matrix = useMemo(
    () => computeSectionCoverageMatrix(data.students, data.studentBreakdowns),
    [data.students, data.studentBreakdowns],
  );
  const componentKeys = Object.keys(COMPONENT_LABELS) as LearnersComponentKey[];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-900" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Section Evidence Coverage Matrix (Staff Governance)
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Shows how many students per class section have sufficient evidence across all 5 Learners
          Score components and 15 OLQ qualities. Students needing additional observation are listed
          alphabetically — never ranked by score.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Section</th>
                <th className="px-4 py-3 font-semibold">Students</th>
                <th className="px-4 py-3 font-semibold">Avg Coverage</th>
                {componentKeys.map((ck) => (
                  <th key={ck} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {COMPONENT_LABELS[ck].split(' ')[0]}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Thin-Evidence Students (Alphabetical)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((row) => (
                <tr key={row.classSection} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-blue-900 whitespace-nowrap">
                    Class {row.classSection}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{row.studentCount}</td>
                  <td className="px-4 py-3 font-mono font-semibold tabular-nums">
                    {row.avgCoveragePct}%
                  </td>
                  {componentKeys.map((ck) => {
                    const count = row.componentCoveredCounts[ck];
                    return (
                      <td
                        key={ck}
                        className={`px-4 py-3 font-mono tabular-nums ${
                          count < row.studentCount ? 'text-amber-700 font-semibold' : 'text-emerald-700'
                        }`}
                      >
                        {count}/{row.studentCount}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    {row.thinEvidenceStudents.length === 0 ? (
                      <span className="text-emerald-700 font-medium">
                        Balanced evidence across section
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {row.thinEvidenceStudents.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => onOpenStudent(st.id)}
                            className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
                          >
                            {st.name} ({st.coveragePct}%)
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 15-OLQ Coverage Breakdown per Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <h3 className="font-display text-sm font-bold text-slate-900">
          15 OLQ Evidence Density by Section
        </h3>
        <div className="space-y-4">
          {matrix.map((row) => (
            <div key={row.classSection} className="rounded-lg border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Class {row.classSection}</span>
                <span className="text-slate-500 font-mono tabular-nums">
                  {row.studentCount} student(s)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11px]">
                {OLQ_DEFINITIONS.map((def) => {
                  const cov = row.olqCoveredCounts[def.key];
                  return (
                    <div
                      key={def.key}
                      className={`rounded-md border px-2.5 py-1.5 flex items-center justify-between gap-2 ${
                        cov === 0
                          ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{def.index}. {def.name}</span>
                      <span className="font-mono font-semibold tabular-nums shrink-0">
                        {cov}/{row.studentCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
