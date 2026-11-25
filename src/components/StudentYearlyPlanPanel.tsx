import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Save,
  ShieldAlert,
  Target,
} from 'lucide-react';
import type {
  AbsenceTargetRiskAlert,
  StudentRecord,
  StudentYearlyPlan,
  StudentYearlySkillTarget,
  UserRole,
  YearlySkillDomain,
} from '../types';
import { apiRequest } from '../utils/api';

interface StudentYearlyPlanPanelProps {
  student: StudentRecord;
  plan?: StudentYearlyPlan;
  alerts: AbsenceTargetRiskAlert[];
  userRole: UserRole;
  token: string;
  onRefresh: () => Promise<void>;
}

const SKILL_DOMAINS: YearlySkillDomain[] = [
  'Reading Fluency',
  'Numeracy & Maths',
  'Science Mastery',
  'Writing & Expression',
  'OLQ & Habits',
  'Digital & Thinking',
];

export const StudentYearlyPlanPanel: React.FC<StudentYearlyPlanPanelProps> = ({
  student,
  plan,
  alerts,
  userRole,
  token,
  onRefresh,
}) => {
  const canEdit = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    userRole,
  );
  const isParent = userRole === 'parent';

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState<YearlySkillDomain>('Writing & Expression');
  const [newSkillName, setNewSkillName] = useState('');
  const [newCurrent, setNewCurrent] = useState('70');
  const [newTarget, setNewTarget] = useState('85');
  const [newUnit, setNewUnit] = useState('%');
  const [newPractice, setNewPractice] = useState('15 mins structured practice 4x per week');
  const [saving, setSaving] = useState(false);
  const [ackId, setAckId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  if (!plan) {
    return null;
  }

  const studentAlerts = alerts.filter((a) => a.studentId === student.id);

  async function saveUpdatedTargets(nextTargets: StudentYearlySkillTarget[]) {
    setSaving(true);
    setMsg(null);
    try {
      await apiRequest(
        `/api/yearly-plans/${student.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ targets: nextTargets }),
        },
        token,
      );
      await onRefresh();
      setMsg('Yearly skill plan updated and attendance-risk status recalculated.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleMilestone(
    targetId: string,
    quarter: 'q1' | 'q2' | 'q3' | 'q4',
  ) {
    if (!canEdit || !plan) return;
    const nextTargets = plan.targets.map((t) => {
      if (t.id !== targetId) return t;
      return {
        ...t,
        quarterlyMilestones: {
          ...t.quarterlyMilestones,
          [quarter]: {
            ...t.quarterlyMilestones[quarter],
            completed: !t.quarterlyMilestones[quarter].completed,
          },
        },
      };
    });
    await saveUpdatedTargets(nextTargets);
  }

  async function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!plan || !newSkillName.trim()) return;
    const cur = Math.max(0, Number(newCurrent) || 65);
    const tgt = Math.max(cur + 5, Number(newTarget) || 85);
    const created: StudentYearlySkillTarget = {
      id: `tgt-${student.id}-${Date.now()}`,
      domain: newDomain,
      skillName: newSkillName.trim(),
      baselineScore: Math.max(0, cur - 5),
      currentScore: cur,
      targetScore: tgt,
      unitLabel: newUnit.trim() || '%',
      minAttendanceRequiredPct: 85,
      weeklyPracticePlan: newPractice.trim() || '20 mins weekly guided practice',
      quarterlyMilestones: {
        q1: { label: 'Baseline check & foundational habit setup', completed: true },
        q2: { label: `Reach midpoint ${Math.round((cur + tgt) / 2)}${newUnit}`, completed: false },
        q3: { label: 'Independent class demonstration without prompts', completed: false },
        q4: { label: `Achieve yearly target ${tgt}${newUnit}`, completed: false },
      },
      riskStatus: 'On Track',
    };
    await saveUpdatedTargets([...plan.targets, created]);
    setNewSkillName('');
    setShowAddForm(false);
  }

  async function handleAcknowledgeAlert(alertId: string) {
    setAckId(alertId);
    try {
      await apiRequest(
        `/api/yearly-plans/alerts/${alertId}/acknowledge`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
    } finally {
      setAckId(null);
    }
  }

  const riskTone =
    plan.overallRiskLevel === 'Critical Risk'
      ? 'text-rose-800 bg-rose-50 border-rose-200'
      : plan.overallRiskLevel === 'At Risk'
        ? 'text-amber-900 bg-amber-50 border-amber-200'
        : plan.overallRiskLevel === 'Watch'
          ? 'text-amber-800 bg-[#FAF4EC] border-[#D6B66D]'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200';

  return (
    <div
      data-testid="student-yearly-plan-panel"
      className="rounded-xl border border-[#D9C9B6] bg-white p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold text-[#7B5D1C]">
            Individual Yearly Skill Roadmap · Session {plan.academicSession}
          </p>
          <h2 className="font-display text-lg font-bold text-[#142B46] mt-0.5 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#142B46]" />
            Achievable Yearly Targets for {student.name}
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {plan.overallTargetSummary}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
          <div className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${riskTone}`}>
            Target Pace: {plan.overallRiskLevel}
          </div>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums">
            Attendance: {student.attendancePct}% (Min required: {plan.attendanceThresholdPct}%)
          </p>
          {plan.projectedAttainmentDropPct > 0 && (
            <p className="text-[11px] font-semibold text-rose-700 font-mono tabular-nums">
              Absence risk impact: -{plan.projectedAttainmentDropPct}% projected target pace
            </p>
          )}
        </div>
      </div>

      {/* Absence Risk Alerts Banner (Visible to Parents & Management) */}
      {studentAlerts.length > 0 && (
        <div className="space-y-2.5" data-testid="student-absence-risk-alerts">
          {studentAlerts.slice(0, 2).map((alert) => {
            const alreadyAck = isParent
              ? alert.acknowledgedByParent
              : alert.acknowledgedByManagement;
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 space-y-2 text-xs ${
                  alert.riskLevel === 'Critical Risk'
                    ? 'border-rose-300 bg-rose-50 text-rose-950'
                    : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    Absence Risk to Yearly Targets · {alert.riskLevel} (Absent on {alert.absenceDate})
                  </p>
                  <span className="font-mono text-[11px] tabular-nums">
                    Attendance {alert.attendancePct}% · {alert.absencesLast30Days} absence(s) in 30d
                  </span>
                </div>
                <p className="leading-relaxed">
                  {isParent ? alert.parentMessage : alert.managementMessage}
                </p>
                <p className="font-semibold">Catch-up action: {alert.catchUpAction}</p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] opacity-80">
                    Parent Ack: {alert.acknowledgedByParent ? 'Confirmed' : 'Pending'} · Management
                    Ack: {alert.acknowledgedByManagement ? 'Confirmed' : 'Pending'}
                  </span>
                  {(isParent || canEdit) && !alreadyAck && (
                    <button
                      type="button"
                      disabled={ackId === alert.id}
                      onClick={() => void handleAcknowledgeAlert(alert.id)}
                      className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap"
                    >
                      {ackId === alert.id
                        ? 'Recording...'
                        : isParent
                          ? 'Acknowledge & Follow Catch-Up'
                          : 'Acknowledge (Management)'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          {msg}
        </div>
      )}

      {/* Skill Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.targets.map((target) => {
          const pct = Math.min(
            100,
            Math.max(
              8,
              Math.round((target.currentScore / Math.max(1, target.targetScore)) * 100),
            ),
          );
          const isRisky = target.riskStatus !== 'On Track';
          return (
            <div
              key={target.id}
              className={`rounded-xl border p-4 space-y-3 ${
                target.riskStatus === 'At Risk'
                  ? 'border-rose-200 bg-rose-50/30'
                  : target.riskStatus === 'Needs Catch-Up'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#7B5D1C]">
                    {target.domain}
                  </p>
                  <h3 className="text-sm font-bold text-[#142B46] mt-0.5">{target.skillName}</h3>
                </div>
                <span
                  className={`text-[11px] font-bold shrink-0 ${
                    target.riskStatus === 'At Risk'
                      ? 'text-rose-700'
                      : target.riskStatus === 'Needs Catch-Up'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }`}
                >
                  {target.riskStatus}
                </span>
              </div>

              {/* Baseline -> Current -> Yearly Target Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600">
                  <span>
                    Base {target.baselineScore}
                    {target.unitLabel} → Now{' '}
                    <strong className="text-[#142B46]">
                      {target.currentScore}
                      {target.unitLabel}
                    </strong>
                  </span>
                  <span className="font-bold text-[#3D6349]">
                    Yearly Goal: {target.targetScore}
                    {target.unitLabel}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      target.riskStatus === 'At Risk'
                        ? 'bg-rose-600'
                        : target.riskStatus === 'Needs Catch-Up'
                          ? 'bg-amber-500'
                          : 'bg-[#6E987A]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Weekly routine:</span>{' '}
                {target.weeklyPracticePlan}
              </p>

              {isRisky && target.riskReason && (
                <p className="text-[11px] font-medium text-amber-900 flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700 mt-0.5" />
                  {target.riskReason}
                </p>
              )}

              {/* Quarterly Milestones Q1-Q4 */}
              <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-slate-200/70">
                {(['q1', 'q2', 'q3', 'q4'] as const).map((q) => {
                  const m = target.quarterlyMilestones[q];
                  return (
                    <label
                      key={q}
                      className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        disabled={!canEdit || saving}
                        onChange={() => void handleToggleMilestone(target.id, q)}
                        className="rounded accent-[#142B46]"
                      />
                      <span className="font-mono font-bold uppercase text-slate-500">{q}:</span>
                      <span className={m.completed ? 'line-through text-slate-400' : ''}>
                        {m.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Home Routine Footer + Staff Add Target Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <p className="text-slate-600">
          <span className="font-semibold text-[#142B46]">Home Commitment:</span>{' '}
          {plan.weeklyHomeCommitment}
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap shrink-0 self-start"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? 'Cancel' : 'Add Custom Skill Target'}
          </button>
        )}
      </div>

      {showAddForm && canEdit && (
        <form
          onSubmit={handleAddTarget}
          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
        >
          <p className="text-xs font-bold text-[#142B46]">
            Add Achievable Yearly Target for {student.name}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <select
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value as YearlySkillDomain)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
            >
              {SKILL_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Specific Skill Target"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs sm:col-span-2"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={newCurrent}
                onChange={(e) => setNewCurrent(e.target.value)}
                placeholder="Now"
                className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              />
              <span className="text-xs text-slate-400">→</span>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="Goal"
                className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-12 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
              />
            </div>
          </div>
          <input
            type="text"
            value={newPractice}
            onChange={(e) => setNewPractice(e.target.value)}
            placeholder="Weekly achievable practice plan..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3d63]"
          >
            <Save className="h-3.5 w-3.5 text-[#D6B66D]" />
            {saving ? 'Saving...' : 'Save Skill Target'}
          </button>
        </form>
      )}
    </div>
  );
};
