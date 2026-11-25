import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Download,
  Flame,
  Layers,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  VcipAttemptRecord,
  VcipDomainId,
  VcipLanguage,
  VcipMode,
} from '../../types/vcip';
import {
  ALL_VCIP_DOMAINS,
  VCIP_DOMAIN_META,
  getClassTierFromClassNumber,
  getClassTierLabel,
} from '../../utils/vcipQuestionBank';
import {
  VCIP_DISCLAIMER_TEXT,
  VCIP_SCORING_RULE_VERSION,
  buildCareerExplorationIndicators,
  buildDomainSummaries,
  buildDownloadableCognitiveReportHtml,
  buildHistoricalProgressSeries,
  computeLanguagePerformanceSplit,
  extractStrengthsAndDevelopmentAreas,
} from '../../utils/vcipScoringEngine';
import { extractClassNumber } from '../../utils/thinkingMonthlyBank';
import { apiRequest } from '../../utils/api';
import { VcipTestRunner } from '../vcip/VcipTestRunner';
import { VcipDailyBrainGym } from '../vcip/VcipDailyBrainGym';
import { VcipAuthoringAdmin } from '../vcip/VcipAuthoringAdmin';
import { VcipPerformanceCharts } from '../vcip/VcipPerformanceCharts';
import { VcipApprovalGovernancePanel } from '../vcip/VcipApprovalGovernancePanel';
import { SkillMonthlyGrowthLeaderboard } from '../SkillMonthlyGrowthLeaderboard';
import { isVcipReleaseVisibleToFamily } from '../../utils/vcipReleaseGovernanceEngine';

export type VcipSubTab = 'dashboard' | 'assess' | 'brain_gym' | 'leaderboard' | 'admin';

interface CognitiveIntelligenceModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onNavigateCareer?: () => void;
  initialSubTab?: VcipSubTab;
  initialSubTabNonce?: number;
}

export const CognitiveIntelligenceModule: React.FC<CognitiveIntelligenceModuleProps> = ({
  data,
  token,
  onRefresh,
  onNavigateCareer,
  initialSubTab,
  initialSubTabNonce,
}) => {
  const canAuthorOrReview = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'counsellor',
  ].includes(data.user.role);
  const canViewClassLeaderboard = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'teacher',
  ].includes(data.user.role);

  const [subTab, setSubTab] = useState<VcipSubTab>(initialSubTab || 'dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => data.students[0]?.id || '',
  );

  useEffect(() => {
    if (initialSubTab && initialSubTabNonce && initialSubTabNonce > 0) {
      setSubTab(initialSubTab);
      setActiveDomain(null);
    }
  }, [initialSubTab, initialSubTabNonce]);
  const [assessmentMode, setAssessmentMode] = useState<VcipMode>('timed');
  const [assessmentLang, setAssessmentLang] = useState<VcipLanguage>('en');

  // Active live test state
  const [activeDomain, setActiveDomain] = useState<VcipDomainId | null>(null);
  const [batteryQueue, setBatteryQueue] = useState<VcipDomainId[]>([]);
  const [batterySessionId, setBatterySessionId] = useState<string | undefined>(undefined);

  // Counsellor observation editor
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteFeedback, setNoteFeedback] = useState<string | null>(null);

  const activeStudent =
    data.students.find((s) => s.id === selectedStudentId) || data.students[0] || null;
  const studentClassLevel = activeStudent ? extractClassNumber(activeStudent.classSection) : 6;
  const classTier = getClassTierFromClassNumber(studentClassLevel);

  const isTeacherRole = data.user.role === 'teacher';
  const isFamilyRole = data.user.role === 'student' || data.user.role === 'parent';

  const activeReleaseRecord = useMemo(
    () =>
      activeStudent
        ? (data.vcipReleaseRecords || []).find((r) => r.studentId === activeStudent.id)
        : undefined,
    [data.vcipReleaseRecords, activeStudent],
  );

  const familyCanViewActiveProfile =
    !isFamilyRole || isVcipReleaseVisibleToFamily(activeReleaseRecord);

  const studentAttempts = useMemo(
    () =>
      (data.vcipAttempts || []).filter(
        (a) => !activeStudent || a.studentId === activeStudent.id,
      ),
    [data.vcipAttempts, activeStudent],
  );

  const studentBrainGymLogs = useMemo(
    () =>
      (data.vcipBrainGymLogs || []).filter(
        (g) => !activeStudent || g.studentId === activeStudent.id,
      ),
    [data.vcipBrainGymLogs, activeStudent],
  );

  const summaries = useMemo(() => buildDomainSummaries(studentAttempts), [studentAttempts]);
  const langSplit = useMemo(
    () => computeLanguagePerformanceSplit(studentAttempts),
    [studentAttempts],
  );
  const { strengths, developmentAreas } = useMemo(
    () => extractStrengthsAndDevelopmentAreas(summaries),
    [summaries],
  );
  const careerIndicators = useMemo(
    () => buildCareerExplorationIndicators(summaries),
    [summaries],
  );
  const historicalSeries = useMemo(
    () => buildHistoricalProgressSeries(studentAttempts),
    [studentAttempts],
  );

  // Separate Layer 2 / Layer 3 counts for unified 4-layer architecture card (never conflating scores)
  const thinkingCount = useMemo(
    () =>
      (data.thinkingAssessments || []).filter(
        (t) => activeStudent && t.studentId === activeStudent.id,
      ).length,
    [data.thinkingAssessments, activeStudent],
  );
  const studentOlqBreakdown = activeStudent ? data.studentBreakdowns[activeStudent.id] : undefined;

  const SHORT_AXIS_LABELS: Record<VcipDomainId, string> = {
    fluid_reasoning: 'Fluid',
    working_memory: 'Memory',
    processing_speed: 'Speed',
    verbal_reasoning: 'Verbal',
    quantitative_reasoning: 'Quantitative',
    spatial_reasoning: 'Spatial',
  };

  const accuracyTimeData = useMemo(
    () =>
      summaries.map((s) => ({
        domain: SHORT_AXIS_LABELS[s.domain],
        accuracy: s.accuracyPct ?? 0,
        avgSec: s.avgResponseTimeMs ? Number((s.avgResponseTimeMs / 1000).toFixed(1)) : 0,
      })),
    [summaries],
  );

  const counsellorNotes = useMemo(
    () =>
      studentAttempts
        .filter((a) => a.counsellorNote)
        .map((a) => ({
          id: a.id,
          domain: VCIP_DOMAIN_META[a.domain].shortLabel,
          note: a.counsellorNote!,
          by: a.counsellorReviewedBy || 'School Counsellor',
          at: (a.counsellorReviewedAt || a.assessedAt).slice(0, 10),
        })),
    [studentAttempts],
  );

  const assessedDomainCount = summaries.filter((s) => s.latestScore !== null).length;
  const avgInternalScore = useMemo(() => {
    const valid = summaries.filter((s) => s.latestScore !== null);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((acc, s) => acc + (s.latestScore ?? 0), 0) / valid.length);
  }, [summaries]);

  function launchSingleDomain(domain: VcipDomainId) {
    setBatteryQueue([]);
    setBatterySessionId(undefined);
    setActiveDomain(domain);
  }

  function launchCompleteBattery() {
    const sid = `vcip-bat-${Date.now()}`;
    setBatterySessionId(sid);
    setBatteryQueue(ALL_VCIP_DOMAINS.slice(1));
    setActiveDomain(ALL_VCIP_DOMAINS[0]);
  }

  async function handleAttemptCompleted(_saved: VcipAttemptRecord) {
    await onRefresh();
  }

  function handleExitRunner() {
    if (batteryQueue.length > 0) {
      const [next, ...rest] = batteryQueue;
      setBatteryQueue(rest);
      setActiveDomain(next);
      return;
    }
    setActiveDomain(null);
    setBatterySessionId(undefined);
    setSubTab('dashboard');
  }

  async function handleSaveCounsellorNote(e: React.FormEvent) {
    e.preventDefault();
    const targetAttempt = studentAttempts[0];
    if (!targetAttempt || !noteDraft.trim()) return;
    setSavingNote(true);
    setNoteFeedback(null);
    try {
      await apiRequest(
        `/api/vcip/attempts/${encodeURIComponent(targetAttempt.id)}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify({ counsellorNote: noteDraft.trim() }),
        },
        token,
      );
      setNoteDraft('');
      setNoteFeedback('Counsellor observation recorded and attached to the student VCIP profile.');
      await onRefresh();
    } catch (err) {
      setNoteFeedback(err instanceof Error ? err.message : 'Unable to save observation.');
    } finally {
      setSavingNote(false);
    }
  }

  function handleDownloadReport() {
    if (!activeStudent) return;
    const html = buildDownloadableCognitiveReportHtml({
      studentName: activeStudent.name,
      classSection: activeStudent.classSection,
      schoolName: data.activeSchool.name,
      summaries,
      attempts: studentAttempts,
      careerIndicators,
      counsellorObservations: counsellorNotes.map(
        (n) => `${n.domain} (${n.at} · ${n.by}): ${n.note}`,
      ),
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VCIP-Cognitive-Report-${activeStudent.name.replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // If currently inside a live assessment domain runner
  if (activeDomain && activeStudent) {
    const batteryStepLabel = batterySessionId
      ? `Complete Battery · Step ${ALL_VCIP_DOMAINS.length - batteryQueue.length} of ${ALL_VCIP_DOMAINS.length}`
      : undefined;

    return (
      <div className="space-y-4">
        <VcipTestRunner
          token={token}
          studentId={activeStudent.id}
          studentName={activeStudent.name}
          classSection={activeStudent.classSection}
          classLevel={studentClassLevel}
          domain={activeDomain}
          mode={assessmentMode}
          language={assessmentLang}
          batterySessionId={batterySessionId}
          batteryStepLabel={batteryStepLabel}
          onCompleted={handleAttemptCompleted}
          onExit={handleExitRunner}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1 max-w-3xl">
          <p className="text-xs font-medium text-slate-500">
            Rai Plus Education Intelligence System · Pillar 4 · Layer 1 Cognitive Intelligence
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Rai Plus Cognitive Intelligence Profile (VCIP)
          </h1>
          <p className="text-sm text-slate-600">
            Discover How You Think, Learn, Reason and Solve Problems — original 6-domain developmental
            cognitive assessments kept strictly separate from OLQs and personality observations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {data.students.length > 1 && (
            <select
              aria-label="Select student for VCIP profile"
              value={activeStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {data.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.classSection})
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={!activeStudent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
          <button
            type="button"
            onClick={() => setSubTab('assess')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900 whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5" /> Start Assessment
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubTab('dashboard')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="h-3.5 w-3.5" /> Cognitive Profile Dashboard
          </button>
          <button
            type="button"
            onClick={() => setSubTab('assess')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'assess'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> 6-Domain Assessment Suite
          </button>
          <button
            type="button"
            onClick={() => setSubTab('brain_gym')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              subTab === 'brain_gym'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="h-3.5 w-3.5" /> Daily Brain Gym
          </button>
          {canViewClassLeaderboard && (
            <button
              type="button"
              onClick={() => setSubTab('leaderboard')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'leaderboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" /> Monthly Class Growth
            </button>
          )}
          {canAuthorOrReview && (
            <button
              type="button"
              onClick={() => setSubTab('admin')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> Authoring & Governance
            </button>
          )}
        </div>

        {activeStudent && (
          <div className="text-xs text-slate-500">
            <span>{activeStudent.name}</span>
            <span aria-hidden="true"> · </span>
            <span>Class {activeStudent.classSection}</span>
            <span aria-hidden="true"> · </span>
            <span>{getClassTierLabel(classTier)}</span>
            <span aria-hidden="true"> · </span>
            <span>Rule {VCIP_SCORING_RULE_VERSION}</span>
          </div>
        )}
      </div>

      {/* Explicit Educational Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Internal Developmental Scores Only (Non-Clinical): </span>
          {VCIP_DISCLAIMER_TEXT}
        </div>
      </div>

      {/* ==================== TAB 1: COGNITIVE PROFILE DASHBOARD ==================== */}
      {subTab === 'leaderboard' && canViewClassLeaderboard && (
        <SkillMonthlyGrowthLeaderboard
          data={data}
          skillKey="vcip"
          defaultClassSection={activeStudent?.classSection}
          onInspectStudent={(sid) => {
            setSelectedStudentId(sid);
            setSubTab('dashboard');
          }}
        />
      )}

      {subTab === 'dashboard' && activeStudent && isTeacherRole && (
        <div
          data-testid="vcip-teacher-confidentiality-notice"
          className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 text-indigo-950 space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="h-5 w-5 text-indigo-700" />
            Confidential Cognitive Profile Access Policy
          </div>
          <p className="text-xs leading-relaxed">
            Individual student Cognitive Intelligence Profiles (VCIP) are strictly confidential
            and accessible only to School Counsellors, authorised School Management, and approved
            Students/Parents. Teachers can use <strong>Monthly Class Growth</strong> (aggregated
            anonymised trends), <strong>Daily Brain Gym</strong>, and{' '}
            <strong>Developmental Remedials</strong> for classroom support.
          </p>
        </div>
      )}

      {subTab === 'dashboard' && activeStudent && !isTeacherRole && (
        <div className="space-y-6">
          <VcipApprovalGovernancePanel
            student={activeStudent}
            user={data.user}
            token={token}
            releaseRecord={activeReleaseRecord}
            accessLogs={data.vcipAccessLogs || []}
            onRefresh={onRefresh}
          />

          {familyCanViewActiveProfile && (
            <>
          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Internal Developmental Average</p>
              <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {avgInternalScore !== null ? `${avgInternalScore}/100` : 'Not Assessed'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {assessedDomainCount} of 6 cognitive domains measured
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Latest Assessment Date</p>
              <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
                {studentAttempts[0]?.assessedAt.slice(0, 10) || '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {studentAttempts.length} logged cognitive sessions
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Verbal Language Split (EN / HI)</p>
              <p className="mt-1 text-lg font-bold font-mono tabular-nums text-slate-900">
                EN {langSplit.english.avgScore !== null ? `${langSplit.english.avgScore}` : '—'} · HI{' '}
                {langSplit.hindi.avgScore !== null ? `${langSplit.hindi.avgScore}` : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracked separately from general reasoning
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Primary Strength & Focus</p>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {strengths[0]?.shortLabel || 'Take baseline modules'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Focus: {developmentAreas[0]?.shortLabel || 'Balanced across domains'}
              </p>
            </div>
          </div>

          {/* Charts Row 1: 6-Domain Cognitive Radar & Performance Improvement Grouped Bar Chart */}
          <VcipPerformanceCharts
            summaries={summaries}
            attempts={studentAttempts}
            studentName={activeStudent.name}
            classTier={classTier}
            classTierLabel={getClassTierLabel(classTier)}
            onLaunchDomain={launchSingleDomain}
            onLaunchFullBattery={launchCompleteBattery}
          />

          {/* Charts Row 2: Accuracy & Response-Time + Historical Improvement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Accuracy (%) & Response Time (s)</h2>
                <span className="text-xs text-slate-500">Speed never overrides accuracy</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyTimeData} margin={{ top: 10, right: 12, left: -12, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="domain" tick={{ fill: '#334155', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="accuracy" name="Accuracy %" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgSec" name="Avg Time (sec)" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-700" /> Historical Longitudinal Progress
                </h2>
                <span className="text-xs text-slate-500">Average internal score & accuracy by date</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalSeries} margin={{ top: 10, right: 16, left: -12, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dateLabel" tick={{ fill: '#334155', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      name="Avg Internal Score"
                      stroke="#1d4ed8"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracyPct"
                      name="Accuracy %"
                      stroke="#0f766e"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 6-Domain Detailed Breakdown Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Domain-by-Domain Performance & Quick Retest
              </h2>
              <span className="text-xs text-slate-500">
                Click any domain to retest or practice independently
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4 font-semibold">Cognitive Domain</th>
                    <th className="py-2.5 px-3 font-semibold">Internal Score</th>
                    <th className="py-2.5 px-3 font-semibold">Accuracy</th>
                    <th className="py-2.5 px-3 font-semibold">Avg Time</th>
                    <th className="py-2.5 px-3 font-semibold">Change vs Prior</th>
                    <th className="py-2.5 px-3 font-semibold">Band</th>
                    <th className="py-2.5 pl-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaries.map((row) => (
                    <tr key={row.domain} className="hover:bg-slate-50/70">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900">{row.label}</p>
                        <p className="text-[11px] text-slate-500">
                          {row.attemptsCount} attempt{row.attemptsCount === 1 ? '' : 's'}
                          {row.lastAssessedAt ? ` · Last ${row.lastAssessedAt.slice(0, 10)}` : ''}
                        </p>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold tabular-nums text-slate-900">
                        {row.latestScore !== null ? `${row.latestScore}/100` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                        {row.accuracyPct !== null ? `${row.accuracyPct}%` : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                        {row.avgResponseTimeMs !== null
                          ? `${(row.avgResponseTimeMs / 1000).toFixed(1)}s`
                          : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums">
                        {row.delta !== null ? (
                          <span className={row.delta >= 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                            {row.delta >= 0 ? `+${row.delta}` : row.delta}
                          </span>
                        ) : (
                          <span className="text-slate-400">Baseline</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{row.bandLabel}</td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => launchSingleDomain(row.domain)}
                          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                        >
                          Take Module
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4-Layer Virat Student Intelligence System Architecture Integration */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-700" />
                <h2 className="text-sm font-bold text-slate-900">
                  Unified Four-Layer Rai Plus Education Intelligence Architecture
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Distinct scoring models · Cognitive scores never auto-infer personality or OLQs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-1.5">
                <p className="font-semibold text-blue-900">Layer 1 · Cognitive Intelligence (VCIP)</p>
                <p className="text-slate-700">
                  Task-specific reasoning & memory across 6 domains ({assessedDomainCount}/6 assessed, avg{' '}
                  {avgInternalScore ?? '—'}/100).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="font-semibold text-slate-900">Layer 2 · Thinking & Response</p>
                <p className="text-slate-700">
                  SRT · WAT · TAT · PPDT situational responses ({thinkingCount} logged sessions — scored
                  independently).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="font-semibold text-slate-900">Layer 3 · Personality & OLQs</p>
                <p className="text-slate-700">
                  15 Officer-Like Qualities & EQ/AQ/CQ evidence (Learners Index{' '}
                  {studentOlqBreakdown?.overallScore !== null && studentOlqBreakdown?.overallScore !== undefined
                    ? `${Math.round(studentOlqBreakdown.overallScore)}/100`
                    : 'In Progress'}
                  ).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="font-semibold text-slate-900">Layer 4 · Career Intelligence</p>
                <p className="text-slate-700">
                  Non-exclusionary exploration linking cognitive strengths to skill roadmaps.
                </p>
                {onNavigateCareer && (
                  <button
                    type="button"
                    onClick={onNavigateCareer}
                    className="mt-1 text-blue-700 font-semibold hover:underline"
                  >
                    Open Career Intelligence →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Non-Exclusionary Career Exploration + Counsellor Observations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Exploratory Career Skill Relationships (Non-Exclusionary)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shows which cognitive skills are useful in each field and how to grow them — never restricts
                  or disqualifies any career path.
                </p>
              </div>
              <div className="divide-y divide-slate-200">
                {careerIndicators.map((ind) => (
                  <div key={ind.field} className="py-3 space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-900">{ind.field}</p>
                    <p className="text-slate-600">{ind.exploratoryNote}</p>
                    {ind.demonstratedStrengths.length > 0 && (
                      <p className="text-emerald-800">
                        <span className="font-semibold">Demonstrated:</span>{' '}
                        {ind.demonstratedStrengths.join(' · ')}
                      </p>
                    )}
                    {ind.skillsToDevelop.length > 0 && (
                      <p className="text-slate-700">
                        <span className="font-semibold">Can develop further:</span>{' '}
                        {ind.skillsToDevelop.join(' · ')}
                      </p>
                    )}
                    <p className="text-slate-500">
                      <span className="font-semibold text-slate-700">Suggested activity:</span>{' '}
                      {ind.recommendedActivities[0]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Counsellor Observations & Review</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Human counsellor guidance combining cognitive evidence with academic & personal context.
                </p>
              </div>

              {counsellorNotes.length === 0 ? (
                <p className="text-xs text-slate-500 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  No counsellor observations saved yet for {activeStudent.name}.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {counsellorNotes.slice(0, 4).map((n) => (
                    <div key={n.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                      <p className="text-slate-500">
                        {n.domain} · {n.by} · {n.at}
                      </p>
                      <p className="mt-1 text-slate-800 leading-relaxed">{n.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {canAuthorOrReview && studentAttempts.length > 0 && (
                <form onSubmit={handleSaveCounsellorNote} className="space-y-2.5 border-t border-slate-200 pt-3">
                  <label htmlFor="vcip-counsellor-note" className="block text-xs font-semibold text-slate-700">
                    Record New Counsellor Observation
                  </label>
                  <textarea
                    id="vcip-counsellor-note"
                    rows={3}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add constructive developmental guidance and recommended learning strategies..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                  {noteFeedback && <p className="text-xs text-blue-800">{noteFeedback}</p>}
                  <button
                    type="submit"
                    disabled={savingNote || !noteDraft.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Save Observation
                  </button>
                </form>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* ==================== TAB 2: 6-DOMAIN ASSESSMENT SUITE ==================== */}
      {subTab === 'assess' && activeStudent && (
        <div className="space-y-6">
          {/* Mode & Language Controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">Assessment Mode</p>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setAssessmentMode('timed')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      assessmentMode === 'timed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Timed Assessment
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssessmentMode('practice')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      assessmentMode === 'practice'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Practice Mode (Untimed)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700">Verbal Language Track</p>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setAssessmentLang('en')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      assessmentLang === 'en'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssessmentLang('hi')}
                    className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                      assessmentLang === 'hi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={launchCompleteBattery}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-900 whitespace-nowrap"
            >
              <Play className="h-4 w-4" /> Launch Complete 6-Module VCIP (30–40 min)
            </button>
          </div>

          {/* 6 Independent Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ALL_VCIP_DOMAINS.map((domainId, index) => {
              const meta = VCIP_DOMAIN_META[domainId];
              const summary = summaries.find((s) => s.domain === domainId);
              return (
                <div
                  key={domainId}
                  className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      Module {index + 1} · {meta.estimatedMinutes} ·{' '}
                      {summary?.latestScore !== null && summary?.latestScore !== undefined
                        ? `Last ${summary.latestScore}/100`
                        : 'Baseline Ready'}
                    </p>
                    <h3 className="text-base font-bold text-slate-900">{meta.label}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{meta.tagline}</p>
                    <ul className="pt-1 space-y-1 text-xs text-slate-600">
                      {meta.measures.map((m) => (
                        <li key={m}>· {m}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchSingleDomain(domainId)}
                    className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Start {meta.shortLabel} ({assessmentMode === 'timed' ? 'Timed' : 'Practice'})
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: DAILY BRAIN GYM ==================== */}
      {subTab === 'brain_gym' && activeStudent && (
        <VcipDailyBrainGym
          token={token}
          studentId={activeStudent.id}
          studentName={activeStudent.name}
          classLevel={studentClassLevel}
          language={assessmentLang}
          logs={studentBrainGymLogs}
          summaries={summaries}
          onRefresh={onRefresh}
        />
      )}

      {/* ==================== TAB 4: AUTHORING & GOVERNANCE ==================== */}
      {subTab === 'admin' && canAuthorOrReview && (
        <VcipAuthoringAdmin
          token={token}
          questions={data.vcipAuthoredQuestions || []}
          assignments={data.vcipClassAssignments || []}
          governance={data.vcipGovernanceConfig}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
