import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Compass,
  Play,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type {
  AiEriksonInterventionItem,
  AiEriksonRemedialPlan,
  DevelopmentalRemedialAssignment,
  DevelopmentalRemedialCategory,
  DevelopmentalRemedialStatus,
  EriksonStageNumber,
  OlqKey,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  assessCohortEriksonDevelopment,
  type EriksonCohortStudentRow,
} from '../../utils/eriksonCohortEngine';
import { buildEriksonRemedialRoadmap } from '../../utils/eriksonRemedialPlanEngine';
import type { AssessmentLabMode } from './ReadingNumeracyLabModule';

interface DevelopmentalRemedialDashboardModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenStudent: (studentId: string) => void;
  onOpenAssessmentLab: (mode: AssessmentLabMode, studentId?: string | null) => void;
}

type QueueFilter = 'delayed' | 'watch' | 'flagged' | 'aligned' | 'all';

const OLQ_LABELS: Record<OlqKey, string> = {
  effective_intelligence: 'Effective Intelligence',
  reasoning_ability: 'Reasoning Ability',
  organising_ability: 'Organising Ability',
  power_of_expression: 'Power of Expression',
  social_adaptability: 'Social Adaptability',
  cooperation: 'Cooperation',
  sense_of_responsibility: 'Sense of Responsibility',
  initiative: 'Initiative',
  self_confidence: 'Self-Confidence',
  speed_of_decision: 'Speed of Decision',
  influence_group: 'Group Influence',
  liveliness: 'Liveliness',
  determination: 'Determination',
  courage: 'Courage',
  stamina: 'Stamina',
};

const REMEDIAL_CATEGORIES: DevelopmentalRemedialCategory[] = [
  'Classroom Activity',
  'Behavioral Intervention',
  'Skill Practice',
  'Parent & Home Coordination',
];

function getDefaultDueDateIso(daysAhead = 10): string {
  return new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
}

function StatusText({ tier }: { tier: EriksonCohortStudentRow['delayTier'] }) {
  if (tier === 'delayed') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 whitespace-nowrap">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Delay Flagged
      </span>
    );
  }
  if (tier === 'watch') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 whitespace-nowrap">
        <TrendingUp className="h-3.5 w-3.5 shrink-0" />
        Transitional Watch
      </span>
    );
  }
  if (tier === 'aligned') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        Positive Aligned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 whitespace-nowrap">
      <Compass className="h-3.5 w-3.5 shrink-0" />
      Baseline Pending
    </span>
  );
}

export const DevelopmentalRemedialDashboardModule: React.FC<
  DevelopmentalRemedialDashboardModuleProps
> = ({ data, token, onRefresh, onOpenStudent, onOpenAssessmentLab }) => {
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | EriksonStageNumber>('ALL');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('flagged');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // AI remedial generation state (cached per student during session)
  const [focusNote, setFocusNote] = useState('');
  const [aiPlansByStudent, setAiPlansByStudent] = useState<
    Record<string, AiEriksonRemedialPlan>
  >({});
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Assignment & lifecycle mutation state
  const [dueDate, setDueDate] = useState<string>(() => getDefaultDueDateIso(10));
  const [assigningKey, setAssigningKey] = useState<string | null>(null);
  const [updatingAssignmentId, setUpdatingAssignmentId] = useState<string | null>(null);
  const [completingAssignmentId, setCompletingAssignmentId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Custom intervention composer
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] =
    useState<DevelopmentalRemedialCategory>('Behavioral Intervention');
  const [customDuration, setCustomDuration] = useState('15 mins · 3x/week');
  const [customDescription, setCustomDescription] = useState('');
  const [customStepsText, setCustomStepsText] = useState('');
  const [customOutcome, setCustomOutcome] = useState('');

  const allAssignments = data.remedialAssignments || [];

  const cohortSummary = useMemo(
    () =>
      assessCohortEriksonDevelopment({
        students: data.students,
        studentBreakdowns: data.studentBreakdowns,
        evidence: data.evidence,
        examMarks: data.examMarks,
        notebookEntries: data.notebookEntries,
        homeworkAssignments: data.homeworkAssignments,
        homeworkSubmissions: data.homeworkSubmissions,
        activityRecords: data.activityRecords,
        readingReports: data.readingReports,
        numeracyReports: data.numeracyReports,
        readingTestSessions: data.readingTestSessions,
        numeracyTestSessions: data.numeracyTestSessions,
        cognitiveAttempts: data.cognitiveAttempts,
        visParsedReports: data.visParsedReports,
        remedialAssignments: allAssignments,
      }),
    [
      data.students,
      data.studentBreakdowns,
      data.evidence,
      data.examMarks,
      data.notebookEntries,
      data.homeworkAssignments,
      data.homeworkSubmissions,
      data.activityRecords,
      data.readingReports,
      data.numeracyReports,
      data.readingTestSessions,
      data.numeracyTestSessions,
      data.cognitiveAttempts,
      data.visParsedReports,
      allAssignments,
    ],
  );

  // Rows filtered by Class + Erikson Stage
  const scopedRows = useMemo(() => {
    return cohortSummary.rows.filter((row) => {
      if (classFilter !== 'ALL' && row.student.classSection !== classFilter) return false;
      if (stageFilter !== 'ALL' && row.assessment.expectedStage.stageNumber !== stageFilter) {
        return false;
      }
      return true;
    });
  }, [cohortSummary.rows, classFilter, stageFilter]);

  const scopedCounts = useMemo(() => {
    let delayed = 0;
    let watch = 0;
    let aligned = 0;
    let pending = 0;
    for (const row of scopedRows) {
      if (row.delayTier === 'delayed') delayed += 1;
      else if (row.delayTier === 'watch') watch += 1;
      else if (row.delayTier === 'aligned') aligned += 1;
      else pending += 1;
    }
    return {
      total: scopedRows.length,
      delayed,
      watch,
      flagged: delayed + watch,
      aligned,
      pending,
    };
  }, [scopedRows]);

  const queueRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedRows.filter((row) => {
      if (queueFilter === 'delayed' && row.delayTier !== 'delayed') return false;
      if (queueFilter === 'watch' && row.delayTier !== 'watch') return false;
      if (
        queueFilter === 'flagged' &&
        row.delayTier !== 'delayed' &&
        row.delayTier !== 'watch'
      ) {
        return false;
      }
      if (queueFilter === 'aligned' && row.delayTier !== 'aligned') return false;
      if (q) {
        const hay = `${row.student.name} ${row.student.admissionNo} ${row.student.classSection} ${row.assessment.expectedStage.stageTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [scopedRows, queueFilter, searchQuery]);

  // Keep a valid student selected
  useEffect(() => {
    if (selectedStudentId && queueRows.some((r) => r.student.id === selectedStudentId)) {
      return;
    }
    if (queueRows.length > 0) {
      setSelectedStudentId(queueRows[0].student.id);
    } else if (scopedRows.length > 0) {
      setSelectedStudentId(scopedRows[0].student.id);
    } else {
      setSelectedStudentId(null);
    }
  }, [queueRows, scopedRows, selectedStudentId]);

  const activeRow =
    cohortSummary.rows.find((r) => r.student.id === selectedStudentId) ||
    queueRows[0] ||
    scopedRows[0] ||
    null;

  const activeAiPlan = activeRow ? aiPlansByStudent[activeRow.student.id] || null : null;

  const activeStudentAssignments = useMemo(() => {
    if (!activeRow) return [];
    return allAssignments.filter((a) => a.studentId === activeRow.student.id);
  }, [allAssignments, activeRow]);

  const scopedStudentIdSet = useMemo(
    () => new Set(scopedRows.map((r) => r.student.id)),
    [scopedRows],
  );

  const scopedAssignments = useMemo(
    () => allAssignments.filter((a) => scopedStudentIdSet.has(a.studentId)),
    [allAssignments, scopedStudentIdSet],
  );

  const assignedTitleSetForActive = useMemo(
    () =>
      new Set(
        activeStudentAssignments.map((a) => a.title.trim().toLowerCase()),
      ),
    [activeStudentAssignments],
  );

  async function handleGenerateAiPlan() {
    if (!activeRow) return;
    setGeneratingAi(true);
    setAiError(null);
    setActionFeedback(null);
    try {
      const res = await apiRequest<{ plan: AiEriksonRemedialPlan }>(
        '/api/remedials/erikson/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeRow.student.id,
            focusNote: focusNote.trim() || undefined,
          }),
        },
        token,
      );
      setAiPlansByStudent((prev) => ({
        ...prev,
        [activeRow.student.id]: res.plan,
      }));
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Unable to generate AI remedial activities right now.',
      );
    } finally {
      setGeneratingAi(false);
    }
  }

  async function handleAssignIntervention(payload: {
    key: string;
    title: string;
    category: DevelopmentalRemedialCategory;
    description: string;
    steps: string[];
    expectedOutcome: string;
    durationLabel: string;
    targetOlqs: OlqKey[];
    source: DevelopmentalRemedialAssignment['source'];
  }) {
    if (!activeRow) return;
    setAssigningKey(payload.key);
    setActionError(null);
    setActionFeedback(null);
    try {
      const res = await apiRequest<{ assignment: DevelopmentalRemedialAssignment }>(
        '/api/remedials/erikson/assign',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeRow.student.id,
            stageNumber: activeRow.assessment.expectedStage.stageNumber,
            expectedStageTitle: activeRow.assessment.expectedStage.stageTitle,
            negativePole: activeRow.assessment.expectedStage.negativePole,
            positivePole: activeRow.assessment.expectedStage.positivePole,
            title: payload.title,
            category: payload.category,
            description: payload.description,
            steps: payload.steps,
            expectedOutcome: payload.expectedOutcome,
            durationLabel: payload.durationLabel,
            targetOlqs: payload.targetOlqs,
            source: payload.source,
            dueDate,
            teacherNote: focusNote.trim() || undefined,
          }),
        },
        token,
      );
      await onRefresh();
      setActionFeedback(
        `Assigned "${res.assignment.title}" to ${activeRow.student.name} (due ${res.assignment.dueDate}). It is now visible in Student 360° & Parent View.`,
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to assign developmental intervention.',
      );
    } finally {
      setAssigningKey(null);
    }
  }

  async function handleAssignAiItem(item: AiEriksonInterventionItem) {
    await handleAssignIntervention({
      key: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      steps: item.steps,
      expectedOutcome: item.expectedBehavioralOutcome,
      durationLabel: item.durationLabel,
      targetOlqs: item.targetOlqs,
      source: 'ai_gemini',
    });
  }

  async function handleSubmitCustomIntervention(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRow) return;
    if (customTitle.trim().length < 3 || customDescription.trim().length < 6) {
      setActionError('Enter a clear intervention title (3+ chars) and rationale (6+ chars).');
      return;
    }
    const parsedSteps = customStepsText
      .split('\n')
      .map((line) => line.replace(/^[-·*\d.)\s]+/, '').trim())
      .filter(Boolean);

    await handleAssignIntervention({
      key: 'custom-form',
      title: customTitle.trim(),
      category: customCategory,
      description: customDescription.trim(),
      steps: parsedSteps.length > 0 ? parsedSteps : [customDescription.trim()],
      expectedOutcome:
        customOutcome.trim() ||
        `Move ${activeRow.student.name} toward healthy ${activeRow.assessment.expectedStage.positivePole}.`,
      durationLabel: customDuration.trim() || '15 mins · 3x/week',
      targetOlqs: activeRow.assessment.recommendedOlqKeys,
      source: 'teacher_custom',
    });

    setCustomTitle('');
    setCustomDescription('');
    setCustomStepsText('');
    setCustomOutcome('');
    setShowCustomForm(false);
  }

  async function handleUpdateAssignmentStatus(
    assignment: DevelopmentalRemedialAssignment,
    status: DevelopmentalRemedialStatus,
    note?: string,
  ) {
    setUpdatingAssignmentId(assignment.id);
    setActionError(null);
    setActionFeedback(null);
    try {
      await apiRequest(
        `/api/remedials/erikson/assignments/${assignment.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            completionNote: note?.trim() || undefined,
          }),
        },
        token,
      );
      setCompletingAssignmentId(null);
      setCompletionNote('');
      await onRefresh();
      setActionFeedback(
        status === 'Completed'
          ? `Marked "${assignment.title}" completed for ${assignment.studentName} and credited validated OLQ growth evidence.`
          : `Updated "${assignment.title}" for ${assignment.studentName} to ${status}.`,
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to update intervention status.',
      );
    } finally {
      setUpdatingAssignmentId(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="developmental-remedial-dashboard">
      {/* Header & Cohort Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-blue-900">
            Erikson Psychosocial Development · Cohort Triage &amp; Intervention Engine
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
            Developmental Remedial Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Flags students whose present developmental stage lags behind age/class Erikson
            benchmarks and equips teachers with AI-generated remedial activities and behavioral
            interventions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter cohort by class section"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap"
          >
            <option value="ALL">All Classes ({cohortSummary.totalStudents})</option>
            {cohortSummary.classSections.map((cls) => (
              <option key={cls} value={cls}>
                Class {cls}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter cohort by Erikson developmental stage"
            value={stageFilter}
            onChange={(e) =>
              setStageFilter(
                e.target.value === 'ALL'
                  ? 'ALL'
                  : (Number(e.target.value) as EriksonStageNumber),
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 whitespace-nowrap"
          >
            <option value="ALL">All Erikson Stages</option>
            <option value={3}>Stage 3 · Initiative vs. Guilt (Nur–UKG)</option>
            <option value={4}>Stage 4 · Industry vs. Inferiority (Cls 1–6)</option>
            <option value={5}>Stage 5 · Identity vs. Role Confusion (Cls 7–12)</option>
          </select>
        </div>
      </div>

      {/* 4-Column Flat KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Flagged Developmental Delay</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span
              data-testid="kpi-delayed-count"
              className="font-mono text-2xl font-bold text-rose-700 tabular-nums"
            >
              {scopedCounts.delayed}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {scopedCounts.total > 0
                ? `${Math.round((scopedCounts.delayed / scopedCounts.total) * 100)}% of scope`
                : '0%'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Present stage showing negative-pole strain below age/class benchmark.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Transitional Stage Watch</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold text-amber-700 tabular-nums">
              {scopedCounts.watch}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {scopedCounts.total > 0
                ? `${Math.round((scopedCounts.watch / scopedCounts.total) * 100)}% of scope`
                : '0%'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Early wobble signals where proactive scaffolding prevents drift.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Positive Stage Aligned</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-700 tabular-nums">
              {scopedCounts.aligned}
            </span>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {scopedCounts.total > 0
                ? `${Math.round((scopedCounts.aligned / scopedCounts.total) * 100)}% of scope`
                : '0%'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Consistently demonstrating expected age-band Erikson virtue.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">Assigned Interventions</p>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span
              data-testid="kpi-active-assignments"
              className="font-mono text-2xl font-bold text-blue-900 tabular-nums"
            >
              {scopedAssignments.filter((a) => a.status !== 'Completed').length}
            </span>
            <span className="font-mono text-xs text-emerald-700 font-semibold tabular-nums">
              {scopedAssignments.filter((a) => a.status === 'Completed').length} completed
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Active teacher-assigned remedials tracked with OLQ completion credit.
          </p>
        </div>
      </div>

      {/* 3-Column Erikson Stage Cohort Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cohortSummary.stageBuckets.map((bucket) => {
          const isSelectedStage = stageFilter === bucket.stageNumber;
          const total = bucket.total || 1;
          const delayedWidth = (bucket.delayed / total) * 100;
          const watchWidth = (bucket.watch / total) * 100;
          const alignedWidth = (bucket.aligned / total) * 100;

          return (
            <button
              key={bucket.stageNumber}
              type="button"
              onClick={() =>
                setStageFilter((prev) =>
                  prev === bucket.stageNumber ? 'ALL' : bucket.stageNumber,
                )
              }
              className={`text-left rounded-xl border p-4 transition-colors ${
                isSelectedStage
                  ? 'border-blue-900 bg-blue-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">{bucket.stageTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {bucket.classBandLabel} · {bucket.ageRangeLabel} · Virtue: {bucket.virtue}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 tabular-nums shrink-0">
                  {bucket.total}
                </span>
              </div>

              {/* Proportional Progress Strip */}
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {bucket.delayed > 0 && (
                  <div
                    className="h-full bg-rose-600"
                    style={{ width: `${delayedWidth}%` }}
                  />
                )}
                {bucket.watch > 0 && (
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${watchWidth}%` }}
                  />
                )}
                {bucket.aligned > 0 && (
                  <div
                    className="h-full bg-emerald-600"
                    style={{ width: `${alignedWidth}%` }}
                  />
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono tabular-nums">
                <span className="text-rose-700 font-semibold">
                  {bucket.delayed} delayed
                </span>
                <span className="text-amber-700 font-semibold">
                  {bucket.watch} watch
                </span>
                <span className="text-emerald-700 font-semibold">
                  {bucket.aligned} aligned
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback / Error Banners */}
      {actionFeedback && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900"
        >
          {actionFeedback}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800"
        >
          {actionError}
        </div>
      )}

      {/* Main Master-Detail Triage & Action Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 5 Cols: Flagged Student Triage Queue */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-slate-900">
                Developmental Triage Queue
              </h2>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {queueRows.length} shown
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, admission no, or class..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
              />
            </div>

            {/* Segmented Filter Tabs */}
            <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2.5">
              {(
                [
                  { id: 'flagged', label: `All Flagged (${scopedCounts.flagged})` },
                  { id: 'delayed', label: `Delayed (${scopedCounts.delayed})` },
                  { id: 'watch', label: `Watch (${scopedCounts.watch})` },
                  { id: 'aligned', label: `Aligned (${scopedCounts.aligned})` },
                  { id: 'all', label: `All (${scopedCounts.total})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQueueFilter(tab.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    queueFilter === tab.id
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[760px] overflow-y-auto divide-y divide-slate-200">
            {queueRows.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No students match the current developmental filter. Try switching to{' '}
                <button
                  type="button"
                  onClick={() => setQueueFilter('all')}
                  className="font-semibold text-blue-900 underline"
                >
                  All Students
                </button>
                .
              </div>
            ) : (
              queueRows.map((row) => {
                const isSelected = activeRow?.student.id === row.student.id;
                return (
                  <button
                    key={row.student.id}
                    type="button"
                    data-testid={`triage-student-${row.student.id}`}
                    onClick={() => {
                      setSelectedStudentId(row.student.id);
                      setAiError(null);
                      setActionFeedback(null);
                      setActionError(null);
                      setShowCustomForm(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 transition-colors space-y-1.5 ${
                      isSelected ? 'bg-blue-50/70' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {row.student.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Class {row.student.classSection} · Age {row.assessment.estimatedAgeRange} ·{' '}
                          {row.assessment.expectedStage.stageTitle}
                        </p>
                      </div>
                      <StatusText tier={row.delayTier} />
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {row.primaryDelayReason}
                    </p>

                    <div className="flex items-center justify-between pt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                      <span>
                        Readiness:{' '}
                        <strong
                          className={
                            row.delayTier === 'delayed'
                              ? 'text-rose-700'
                              : row.delayTier === 'watch'
                                ? 'text-amber-700'
                                : 'text-emerald-700'
                          }
                        >
                          {row.assessment.readinessScorePct !== null
                            ? `${row.assessment.readinessScorePct}/100`
                            : 'Pending'}
                        </strong>
                      </span>
                      <span>
                        {row.activeAssignmentCount > 0
                          ? `${row.activeAssignmentCount} active plan${row.activeAssignmentCount > 1 ? 's' : ''}`
                          : row.completedAssignmentCount > 0
                            ? `${row.completedAssignmentCount} completed`
                            : 'No plan assigned'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right 7 Cols: Selected Student Action Studio */}
        <section className="lg:col-span-7 space-y-5">
          {!activeRow ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Select a student from the Developmental Triage Queue to review Erikson stage alignment
              and assign remedial interventions.
            </div>
          ) : (
            <>
              {/* Student Erikson Diagnostic Header Card */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        {activeRow.student.name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500">
                        Class {activeRow.student.classSection} · {activeRow.student.admissionNo}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <StatusText tier={activeRow.delayTier} />
                      <span className="text-xs text-slate-500">
                        Approx. Age {activeRow.assessment.estimatedAgeRange}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenAssessmentLab('reading', activeRow.student.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <BookOpenCheck className="h-3.5 w-3.5 text-blue-900" />
                      Reading Test
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenAssessmentLab('numeracy', activeRow.student.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <Calculator className="h-3.5 w-3.5 text-blue-900" />
                      Timed Tables
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenStudent(activeRow.student.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-900 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap shrink-0"
                    >
                      Student 360°
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expected vs Present Stage Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
                  <div className="p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Expected Stage (Age &amp; Class)
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {activeRow.assessment.expectedStage.stageTitle}
                    </p>
                    <p className="text-xs text-slate-600">
                      Core Virtue: <strong>{activeRow.assessment.expectedStage.virtue}</strong> ·{' '}
                      {activeRow.assessment.expectedStage.coreDevelopmentalTask}
                    </p>
                  </div>

                  <div className="p-4 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      Present Assessed Stage
                    </p>
                    <p
                      className={`text-sm font-bold ${
                        activeRow.delayTier === 'delayed'
                          ? 'text-rose-700'
                          : activeRow.delayTier === 'watch'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                      }`}
                    >
                      {activeRow.assessment.presentStageHeadline}
                    </p>
                    <p className="text-xs text-slate-600">
                      {activeRow.assessment.presentStageDetail}
                    </p>
                  </div>
                </div>

                {/* Specific Remedial Step Points with Timelines & Exercises */}
                {(() => {
                  const roadmap = buildEriksonRemedialRoadmap(activeRow.assessment);
                  return (
                    <div
                      className="p-4 border-b border-slate-200 bg-slate-50/60 space-y-3"
                      data-testid="expected-vs-present-remedial-roadmap"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                            Specific Remedial Step Points, Timelines &amp; Exercises
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{roadmap.gapSummary}</p>
                        </div>
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-900 shrink-0">
                          {roadmap.totalDurationLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roadmap.steps.map((step) => {
                          const stepKey = `roadmap-${step.id}`;
                          const alreadyAssigned = activeStudentAssignments.some(
                            (a) => a.title === `${step.timelineLabel}: ${step.phaseTitle}`,
                          );
                          return (
                            <div
                              key={step.id}
                              className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col justify-between gap-2.5"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="inline-block rounded bg-blue-900 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                                      Step {step.stepNumber} · {step.timelineLabel}
                                    </span>
                                    <h4 className="font-display text-sm font-bold text-slate-900 mt-1">
                                      {step.phaseTitle}
                                    </h4>
                                  </div>
                                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shrink-0">
                                    {step.targetDomain}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                                  {step.specificActionPoint}
                                </p>

                                <div className="space-y-1.5 text-[11px] bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                                  <p className="text-slate-800">
                                    <strong className="text-blue-900">Classroom Exercise:</strong>{' '}
                                    {step.classroomExercise}
                                  </p>
                                  <p className="text-slate-800">
                                    <strong className="text-emerald-800">Home Exercise:</strong>{' '}
                                    {step.homeExercise}
                                  </p>
                                  <p className="text-slate-700">
                                    <strong className="text-amber-800">Checkpoint:</strong>{' '}
                                    {step.successCheckpoint}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                <span className="text-[11px] text-slate-500">
                                  Duration: <strong className="text-slate-700">{step.durationLabel}</strong>
                                </span>
                                <button
                                  type="button"
                                  disabled={assigningKey === stepKey || alreadyAssigned}
                                  onClick={() =>
                                    handleAssignIntervention({
                                      key: stepKey,
                                      title: `${step.timelineLabel}: ${step.phaseTitle}`,
                                      category: step.category,
                                      description: step.specificActionPoint,
                                      steps: [
                                        `Classroom Exercise: ${step.classroomExercise}`,
                                        `Home Exercise: ${step.homeExercise}`,
                                        `Weekly Checkpoint: ${step.successCheckpoint}`,
                                      ],
                                      expectedOutcome: step.successCheckpoint,
                                      durationLabel: step.durationLabel,
                                      targetOlqs: step.targetOlqs,
                                      source: 'erikson_engine',
                                    })
                                  }
                                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                    alreadyAssigned
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                                      : 'bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50'
                                  }`}
                                >
                                  {alreadyAssigned
                                    ? 'Assigned ✓'
                                    : assigningKey === stepKey
                                      ? 'Assigning...'
                                      : 'Assign Step'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 4 Erikson Readiness Pillars */}
                <div className="p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      {
                        label: 'Competence',
                        val: activeRow.assessment.domainScores.competencePct,
                      },
                      {
                        label: 'Agency',
                        val: activeRow.assessment.domainScores.agencyPct,
                      },
                      {
                        label: 'Belonging',
                        val: activeRow.assessment.domainScores.belongingPct,
                      },
                      {
                        label: 'Regulation',
                        val: activeRow.assessment.domainScores.regulationPct,
                      },
                    ] as const
                  ).map((pillar) => (
                    <div key={pillar.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{pillar.label}</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {pillar.val !== null ? `${pillar.val}%` : '—'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pillar.val === null
                              ? 'bg-slate-300'
                              : pillar.val < 62
                                ? 'bg-rose-600'
                                : pillar.val < 74
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                          }`}
                          style={{ width: `${pillar.val ?? 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Triggering Negative-Pole Delay Signals */}
                <div className="p-4 space-y-2 bg-slate-50/70">
                  <p className="text-xs font-bold text-slate-800">
                    {activeRow.assessment.expectedStage.negativePole} Delay Signals (
                    {activeRow.assessment.negativeSignals.length})
                  </p>
                  {activeRow.assessment.negativeSignals.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      No negative-pole delay indicators currently triggered. You can still generate
                      preventive enrichment activities below.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeRow.assessment.negativeSignals.map((sig) => (
                        <div
                          key={sig.id}
                          className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              {sig.label}{' '}
                              <span className="font-normal text-slate-500">· {sig.domain}</span>
                            </span>
                            {sig.scorePct !== null && (
                              <span className="font-mono font-bold text-rose-700 tabular-nums shrink-0">
                                {sig.scorePct}%
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600">{sig.evidenceSummary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI-Generated Remedial Activities & Behavioral Interventions Panel */}
              <div
                data-testid="ai-remedial-generator-panel"
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="border-b border-slate-200 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>AI-Generated Erikson Remedial &amp; Behavioral Interventions</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Synthesizes {activeRow.student.name}&apos;s live OLQs, reading fluency,
                        numeracy, and Erikson stage signals into 4 teacher-assignable activities.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                        Due:
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="ml-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono text-slate-800"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={focusNote}
                      onChange={(e) => setFocusNote(e.target.value)}
                      placeholder="Optional teacher context (e.g., hesitates reading aloud, needs structured partner role)..."
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      data-testid="generate-ai-remedials-btn"
                      disabled={generatingAi}
                      onClick={() => void handleGenerateAiPlan()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {generatingAi
                        ? 'Generating Plan...'
                        : activeAiPlan
                          ? 'Regenerate AI Plan'
                          : 'Generate AI Remedial Plan'}
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {generatingAi && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-pulse">
                      {[1, 2, 3, 4].map((idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 p-4 space-y-2.5"
                        >
                          <div className="h-3 w-28 rounded bg-slate-200" />
                          <div className="h-4 w-3/4 rounded bg-slate-200" />
                          <div className="h-3 w-full rounded bg-slate-100" />
                          <div className="h-3 w-5/6 rounded bg-slate-100" />
                        </div>
                      ))}
                    </div>
                  )}

                  {aiError && !generatingAi && (
                    <div
                      role="alert"
                      data-testid="ai-remedial-error"
                      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1"
                    >
                      <p className="font-bold">AI Remedial Generation Unavailable</p>
                      <p className="leading-relaxed">{aiError}</p>
                    </div>
                  )}

                  {activeAiPlan && !generatingAi && (
                    <div className="space-y-4" data-testid="ai-remedial-results">
                      <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3.5 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-blue-950">
                            Erikson Stage Translation · {activeAiPlan.expectedStageTitle}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            Model: {activeAiPlan.model}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {activeAiPlan.stageContextSummary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {activeAiPlan.interventions.map((item) => {
                          const alreadyAssigned = assignedTitleSetForActive.has(
                            item.title.trim().toLowerCase(),
                          );
                          const isSavingThis = assigningKey === item.id;
                          return (
                            <div
                              key={item.id}
                              className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 text-xs"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="font-bold text-blue-900">{item.category}</span>
                                  <span className="font-mono text-slate-500 whitespace-nowrap">
                                    {item.durationLabel}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-900 text-sm leading-snug">
                                  {item.title}
                                </p>
                                <p className="text-[11px] font-semibold text-amber-800">
                                  {item.eriksonTarget}
                                </p>
                                <p className="text-slate-600 leading-relaxed">
                                  {item.description}
                                </p>
                                <ol className="space-y-1 text-slate-700 list-decimal pl-4">
                                  {item.steps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                                <p className="text-[11px] text-emerald-800 pt-1">
                                  <strong>Expected Shift:</strong> {item.expectedBehavioralOutcome}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Target OLQs:{' '}
                                  {item.targetOlqs.map((k) => OLQ_LABELS[k] || k).join(', ')}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={isSavingThis || alreadyAssigned}
                                onClick={() => void handleAssignAiItem(item)}
                                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap ${
                                  alreadyAssigned
                                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                                    : 'bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-60'
                                }`}
                              >
                                {alreadyAssigned ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Assigned to {activeRow.student.name}
                                  </>
                                ) : isSavingThis ? (
                                  'Assigning...'
                                ) : (
                                  <>
                                    <Plus className="h-3.5 w-3.5" />
                                    Assign to Student
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!activeAiPlan && !generatingAi && !aiError && (
                    <p className="text-xs text-slate-500">
                      Click <strong>Generate AI Remedial Plan</strong> above to create 4 tailored
                      classroom, behavioral, skill-practice, and parent-home interventions specific
                      to {activeRow.student.name}&apos;s developmental signals, or assign directly
                      from the evidence-mapped Erikson remedials below.
                    </p>
                  )}
                </div>
              </div>

              {/* Evidence-Mapped Erikson Remedials & Custom Composer */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      Evidence-Mapped Erikson Remedials (Immediate Assignment)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeRow.assessment.transitionGoalStatement}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-testid="toggle-custom-remedial-btn"
                    onClick={() => setShowCustomForm((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {showCustomForm ? 'Close Custom Form' : 'Custom Intervention'}
                  </button>
                </div>

                {showCustomForm && (
                  <form
                    onSubmit={(e) => void handleSubmitCustomIntervention(e)}
                    className="border-b border-slate-200 bg-slate-50 p-5 space-y-3"
                  >
                    <p className="text-xs font-bold text-slate-900">
                      Assign Custom Behavioral or Remedial Activity to {activeRow.student.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Activity Title
                        </label>
                        <input
                          type="text"
                          required
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="e.g., Peer Reading Anchor & Confidence Log"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Category
                        </label>
                        <select
                          value={customCategory}
                          onChange={(e) =>
                            setCustomCategory(e.target.value as DevelopmentalRemedialCategory)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                        >
                          {REMEDIAL_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Rationale &amp; Classroom Framing
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          placeholder="Explain how this builds the positive Erikson virtue without labelling..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Cadence / Duration
                        </label>
                        <input
                          type="text"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                          placeholder="15 mins · 3x/week"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Action Steps (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={customStepsText}
                          onChange={(e) => setCustomStepsText(e.target.value)}
                          placeholder={'Pair with a supportive partner\nPractice 3 sentences aloud\nRecord one personal win'}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Expected Behavioral Outcome
                        </label>
                        <textarea
                          rows={3}
                          value={customOutcome}
                          onChange={(e) => setCustomOutcome(e.target.value)}
                          placeholder="Voluntarily reads aloud in small group within 2 weeks."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={assigningKey === 'custom-form'}
                        className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap"
                      >
                        {assigningKey === 'custom-form'
                          ? 'Saving...'
                          : `Assign to ${activeRow.student.name}`}
                      </button>
                    </div>
                  </form>
                )}

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {activeRow.assessment.remedials.map((rem) => {
                    const alreadyAssigned = assignedTitleSetForActive.has(
                      rem.title.trim().toLowerCase(),
                    );
                    const isSavingThis = assigningKey === rem.id;
                    const mappedCategory: DevelopmentalRemedialCategory =
                      rem.track === 'Home & Parent Support'
                        ? 'Parent & Home Coordination'
                        : rem.track === 'In-App Skill Practice'
                          ? 'Skill Practice'
                          : 'Classroom Activity';

                    return (
                      <div
                        key={rem.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-blue-900">
                            {rem.track} · {mappedCategory}
                          </p>
                          <p className="font-bold text-slate-900">{rem.title}</p>
                          <p className="text-slate-600 leading-relaxed">{rem.description}</p>
                          <p className="text-[11px] text-emerald-800 pt-1">
                            Goal: {rem.targetOutcome}
                          </p>
                        </div>

                        <button
                          type="button"
                          data-testid={`assign-mapped-${rem.id}`}
                          disabled={isSavingThis || alreadyAssigned}
                          onClick={() =>
                            void handleAssignIntervention({
                              key: rem.id,
                              title: rem.title,
                              category: mappedCategory,
                              description: rem.description,
                              steps: [rem.description, `Verify milestone: ${rem.targetOutcome}`],
                              expectedOutcome: rem.targetOutcome,
                              durationLabel: '15 mins · 3x/week',
                              targetOlqs: activeRow.assessment.recommendedOlqKeys,
                              source: 'erikson_engine',
                            })
                          }
                          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap self-start ${
                            alreadyAssigned
                              ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                              : 'border border-blue-900 bg-white text-blue-900 hover:bg-blue-50 disabled:opacity-60'
                          }`}
                        >
                          {alreadyAssigned ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Assigned
                            </>
                          ) : isSavingThis ? (
                            'Assigning...'
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Assign to Student
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Student Assigned Interventions Tracker */}
              <div
                data-testid="student-assigned-interventions"
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-900 shrink-0" />
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      Assigned Interventions for {activeRow.student.name} (
                      {activeStudentAssignments.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Completing credits OLQ evidence automatically
                  </span>
                </div>

                {activeStudentAssignments.length === 0 ? (
                  <div className="p-5 text-xs text-slate-500">
                    No developmental remedial interventions assigned to {activeRow.student.name}{' '}
                    yet. Generate an AI plan or assign an evidence-mapped remedial above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {activeStudentAssignments.map((asg) => {
                      const isUpdating = updatingAssignmentId === asg.id;
                      const isCompleting = completingAssignmentId === asg.id;

                      return (
                        <div key={asg.id} className="p-4 space-y-2.5 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                <span className="font-bold text-blue-900">{asg.category}</span>
                                <span className="text-slate-400">·</span>
                                <span className="font-semibold text-slate-600">
                                  {asg.source === 'ai_gemini'
                                    ? 'AI-Generated'
                                    : asg.source === 'teacher_custom'
                                      ? 'Teacher Custom'
                                      : 'Evidence-Mapped'}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="font-mono text-slate-500">
                                  Due {asg.dueDate}
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-900">{asg.title}</p>
                              <p className="text-slate-600">{asg.description}</p>
                            </div>

                            <span
                              className={`text-xs font-bold whitespace-nowrap shrink-0 ${
                                asg.status === 'Completed'
                                  ? 'text-emerald-700'
                                  : asg.status === 'In Progress'
                                    ? 'text-blue-900'
                                    : 'text-amber-700'
                              }`}
                            >
                              {asg.status}
                            </span>
                          </div>

                          {asg.steps.length > 0 && (
                            <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                              {asg.steps.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                            <span>
                              Assigned by {asg.assignedBy} ({asg.assignedByRole}) ·{' '}
                              {asg.durationLabel}
                            </span>
                            {asg.status !== 'Completed' && (
                              <div className="flex flex-wrap items-center gap-2">
                                {asg.status === 'Assigned' && (
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                      void handleUpdateAssignmentStatus(asg, 'In Progress')
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                                  >
                                    <Play className="h-3 w-3" />
                                    Start Progress
                                  </button>
                                )}
                                <button
                                  type="button"
                                  data-testid={`complete-assignment-${asg.id}`}
                                  disabled={isUpdating}
                                  onClick={() => {
                                    setCompletingAssignmentId(isCompleting ? null : asg.id);
                                    setCompletionNote('');
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Mark Completed &amp; Credit OLQ
                                </button>
                              </div>
                            )}
                          </div>

                          {isCompleting && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={completionNote}
                                onChange={(e) => setCompletionNote(e.target.value)}
                                placeholder="Observed positive shift (e.g., completed 3 sessions independently with stronger confidence)..."
                                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                              />
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  void handleUpdateAssignmentStatus(
                                    asg,
                                    'Completed',
                                    completionNote,
                                  )
                                }
                                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 whitespace-nowrap shrink-0"
                              >
                                {isUpdating ? 'Saving...' : 'Confirm Completion'}
                              </button>
                            </div>
                          )}

                          {asg.status === 'Completed' && asg.completionNote && (
                            <p className="text-[11px] text-emerald-800 bg-emerald-50/60 border border-emerald-200 rounded-md px-2.5 py-1.5">
                              <strong>Completion Observation:</strong> {asg.completionNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Cohort-Wide Assigned Interventions Register */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-sm font-bold text-slate-900">
              Cohort Assigned Interventions Register ({scopedAssignments.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              All developmental remedial activities assigned across the active class/stage filter.
            </p>
          </div>
        </div>

        {scopedAssignments.length === 0 ? (
          <div className="p-6 text-xs text-slate-500">
            No remedial interventions have been assigned in this filter yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Erikson Stage</th>
                  <th className="px-4 py-2.5">Intervention</th>
                  <th className="px-4 py-2.5">Category / Source</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {scopedAssignments.map((asg) => (
                  <tr
                    key={asg.id}
                    onClick={() => setSelectedStudentId(asg.studentId)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {asg.studentName}{' '}
                      <span className="font-normal text-slate-500">· {asg.classSection}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {asg.expectedStageTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium max-w-xs truncate">
                      {asg.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {asg.category} ·{' '}
                      {asg.source === 'ai_gemini'
                        ? 'AI'
                        : asg.source === 'teacher_custom'
                          ? 'Custom'
                          : 'Mapped'}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {asg.dueDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          asg.status === 'Completed'
                            ? 'text-emerald-700'
                            : asg.status === 'In Progress'
                              ? 'text-blue-900'
                              : 'text-amber-700'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
