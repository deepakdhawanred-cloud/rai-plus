import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Brain,
  Calculator,
  CheckCircle2,
  Compass,
  Plus,
  TrendingUp,
} from 'lucide-react';
import type { DevelopmentalRemedialAssignment, EriksonAssessment } from '../types';
import { apiRequest } from '../utils/api';

interface EriksonDevelopmentCardProps {
  assessment: EriksonAssessment;
  assignedRemedials?: DevelopmentalRemedialAssignment[];
  isStaff: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  onLaunchReadingTest?: () => void;
  onLaunchNumeracyTest?: () => void;
  onOpenGames?: () => void;
}

function PolarityIndicator({ status }: { status: EriksonAssessment['outcomeStatus'] }) {
  if (status === 'positive_aligned') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Positive Stage Aligned
      </span>
    );
  }
  if (status === 'transitional_support') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
        <TrendingUp className="h-4 w-4 shrink-0" />
        Transitional Stage · Proactive Support
      </span>
    );
  }
  if (status === 'negative_stage_alert') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Negative Stage Drift · Remedials Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <Compass className="h-4 w-4 shrink-0" />
      Awaiting Multi-Source Evidence
    </span>
  );
}

export const EriksonDevelopmentCard: React.FC<EriksonDevelopmentCardProps> = ({
  assessment,
  assignedRemedials = [],
  isStaff,
  token,
  onRefresh,
  onLaunchReadingTest,
  onLaunchNumeracyTest,
  onOpenGames,
}) => {
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [remedialTitle, setRemedialTitle] = useState(
    assessment.remedials[0]?.title || 'Guided Mastery Check-In',
  );
  const [observedNote, setObservedNote] = useState('');
  const [checkInRating, setCheckInRating] = useState('80');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isNegativeOrTransitional =
    assessment.outcomeStatus === 'negative_stage_alert' ||
    assessment.outcomeStatus === 'transitional_support';

  async function handleSaveRemedialCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);
    if (!remedialTitle.trim() || observedNote.trim().length < 6) {
      setErrorMsg('Enter both a remedial focus and a brief observed progress note (6+ chars).');
      return;
    }
    setSaving(true);
    try {
      await apiRequest(
        `/api/students/${assessment.studentId}/erikson-remedial-checkin`,
        {
          method: 'POST',
          body: JSON.stringify({
            stageLabel: assessment.expectedStage.stageTitle,
            remedialTitle: remedialTitle.trim(),
            observedProgressNote: observedNote.trim(),
            rating: Number(checkInRating) || 80,
            targetOlqs: assessment.recommendedOlqKeys,
          }),
        },
        token,
      );
      setObservedNote('');
      setShowCheckInForm(false);
      await onRefresh();
      setFeedback(
        `Logged remedial milestone for ${assessment.studentName}. OLQ scores and Erikson stage readiness refreshed.`,
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to save remedial milestone check-in.',
      );
    } finally {
      setSaving(false);
    }
  }

  const domainPillars = [
    { label: 'Competence', value: assessment.domainScores.competencePct },
    { label: 'Agency', value: assessment.domainScores.agencyPct },
    { label: 'Belonging', value: assessment.domainScores.belongingPct },
    { label: 'Regulation', value: assessment.domainScores.regulationPct },
  ];

  return (
    <section
      aria-label="Erikson Psychosocial Development Assessment"
      data-testid="erikson-development-card"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="h-4 w-4 text-blue-900 shrink-0" />
            Erikson Psychosocial Development Assessment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Class {assessment.classSection} · Age Band ~{assessment.estimatedAgeRange} · Core Virtue:{' '}
            {assessment.expectedStage.virtue} · Integrated from OLQs, Reading Personal Best, Numeracy, Homework &amp; Activities
          </p>
        </div>

        {isStaff && (
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setShowCheckInForm((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap shrink-0 self-start sm:self-auto print:hidden"
          >
            <Plus className="h-3.5 w-3.5" />
            {showCheckInForm ? 'Close Check-In' : 'Log Remedial Check-In'}
          </button>
        )}
      </div>

      {/* Expected Stage vs Present Stage Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-slate-50/40 border-b border-slate-200">
        <div className="lg:col-span-5 p-5 space-y-2">
          <p className="text-xs font-semibold text-slate-500">
            Expected Stage (By Age &amp; Class)
          </p>
          <p
            data-testid="erikson-expected-stage"
            className="font-display text-lg font-bold text-slate-900"
          >
            {assessment.expectedStage.stageTitle}
          </p>
          <p className="text-xs text-slate-600">
            Positive Pole:{' '}
            <strong className="text-emerald-700">{assessment.expectedStage.positivePole}</strong>
            {' · '}
            Negative Pole:{' '}
            <strong className="text-rose-700">{assessment.expectedStage.negativePole}</strong>
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.expectedStage.coreDevelopmentalTask}
          </p>
          <p className="font-mono text-[11px] text-slate-500 tabular-nums pt-0.5">
            {assessment.expectedStage.ageRangeLabel} · {assessment.expectedStage.classBandLabel}
          </p>
        </div>

        <div className="lg:col-span-7 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Present Assessed Stage (Live Synthesis)
            </span>
            <PolarityIndicator status={assessment.outcomeStatus} />
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p
              data-testid="erikson-present-stage"
              className="font-display text-lg font-bold text-slate-900"
            >
              {assessment.presentStageHeadline}
            </p>
            <span className="font-mono text-xl font-bold text-blue-900 tabular-nums shrink-0">
              {assessment.readinessScorePct !== null
                ? `${assessment.readinessScorePct}/100`
                : 'Pending'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {assessment.presentStageDetail}
          </p>

          {/* 4 Psychosocial Readiness Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {domainPillars.map((pillar) => (
              <div
                key={pillar.label}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  {pillar.label}
                </p>
                <p className="font-mono text-sm font-bold text-slate-900 tabular-nums mt-0.5">
                  {pillar.value !== null ? `${pillar.value}%` : '—'}
                </p>
                <div className="mt-1.5 h-1.5 w-full rounded bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded ${
                      pillar.value === null
                        ? 'bg-slate-300'
                        : pillar.value >= 72
                          ? 'bg-emerald-600'
                          : pillar.value >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-600'
                    }`}
                    style={{ width: `${pillar.value ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Remedial Check-In Form */}
      {isStaff && showCheckInForm && (
        <form
          onSubmit={handleSaveRemedialCheckIn}
          className="border-b border-slate-200 bg-blue-50/40 px-6 py-4 space-y-3 print:hidden"
        >
          <p className="text-xs font-bold text-blue-950">
            Record Remedial Support Observation · Guides {assessment.studentName} toward{' '}
            {assessment.expectedStage.positivePole} ({assessment.expectedStage.virtue})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            <label className="md:col-span-4 space-y-1">
              <span className="block font-medium text-slate-700">Remedial Strategy Applied</span>
              <input
                type="text"
                aria-label="Erikson remedial strategy applied"
                value={remedialTitle}
                onChange={(e) => setRemedialTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </label>
            <label className="md:col-span-6 space-y-1">
              <span className="block font-medium text-slate-700">
                Observed Student Response &amp; Progress *
              </span>
              <input
                type="text"
                aria-label="Erikson remedial progress observation"
                value={observedNote}
                onChange={(e) => setObservedNote(e.target.value)}
                placeholder="e.g. Completed chunked reading read-aloud without hesitation and volunteered peer role"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              />
            </label>
            <label className="md:col-span-2 space-y-1">
              <span className="block font-medium text-slate-700">Check-In Rating</span>
              <input
                type="number"
                aria-label="Erikson remedial check-in rating"
                min={60}
                max={98}
                value={checkInRating}
                onChange={(e) => setCheckInRating(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono tabular-nums"
              />
            </label>
          </div>
          {errorMsg && <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCheckInForm(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? 'Recording...' : 'Save Remedial Check-In'}
            </button>
          </div>
        </form>
      )}

      {feedback && (
        <div className="border-b border-slate-200 bg-emerald-50 px-6 py-2.5 text-xs text-emerald-800">
          {feedback}
        </div>
      )}

      {/* Evidence Signals: Positive vs Negative Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 border-b border-slate-200">
        <div className="p-5 space-y-2.5">
          <p className="text-xs font-bold text-emerald-800">
            Positive Stage Signals ({assessment.positiveSignals.length})
          </p>
          {assessment.positiveSignals.length === 0 ? (
            <p className="text-xs text-slate-500">
              No strong positive anchors recorded yet — build quick wins using the remedials below.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {assessment.positiveSignals.map((sig) => (
                <li key={sig.id} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {sig.label}{' '}
                      <span className="font-normal text-slate-500">· {sig.domain}</span>
                    </span>
                    {sig.scorePct !== null && (
                      <span className="font-mono font-semibold text-emerald-700 tabular-nums shrink-0">
                        {sig.scorePct}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{sig.evidenceSummary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5 space-y-2.5">
          <p
            className={`text-xs font-bold ${
              assessment.negativeSignals.length > 0 ? 'text-rose-800' : 'text-slate-700'
            }`}
          >
            {assessment.expectedStage.negativePole} Risk Signals ({assessment.negativeSignals.length})
          </p>
          {assessment.negativeSignals.length === 0 ? (
            <p className="text-xs text-slate-600">
              No negative-pole drift indicators detected across OLQs, fluency, numeracy, marks, or work habits.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {assessment.negativeSignals.map((sig) => (
                <li key={sig.id} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {sig.label}{' '}
                      <span className="font-normal text-slate-500">· {sig.domain}</span>
                    </span>
                    {sig.scorePct !== null && (
                      <span className="font-mono font-semibold text-rose-700 tabular-nums shrink-0">
                        {sig.scorePct}%
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">{sig.evidenceSummary}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Remedial Plan to Restore Positive Stage */}
      <div
        data-testid="erikson-remedials-section"
        className={`p-6 space-y-4 ${isNegativeOrTransitional ? 'bg-amber-50/35' : 'bg-white'}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">
              {isNegativeOrTransitional
                ? `Remedial Plan: Moving Back from ${assessment.expectedStage.negativePole} to ${assessment.expectedStage.positivePole}`
                : `Stage Reinforcement & Growth Actions (${assessment.expectedStage.positivePole})`}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">{assessment.transitionGoalStatement}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {assessment.remedials.map((rem) => {
            const actionHandler =
              rem.actionType === 'reading_test'
                ? onLaunchReadingTest
                : rem.actionType === 'numeracy_test'
                  ? onLaunchNumeracyTest
                  : rem.actionType === 'intelligence_game'
                    ? onOpenGames
                    : undefined;

            return (
              <div
                key={rem.id}
                className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-blue-900">{rem.track}</p>
                  <p className="font-semibold text-slate-900">{rem.title}</p>
                  <p className="text-slate-600 leading-relaxed">{rem.description}</p>
                  <p className="text-[11px] text-emerald-800 pt-1">
                    Goal: {rem.targetOutcome}
                  </p>
                </div>

                {actionHandler && rem.actionLabel && (
                  <button
                    type="button"
                    onClick={actionHandler}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900 bg-white px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap self-start print:hidden"
                  >
                    {rem.actionType === 'reading_test' && <BookOpenCheck className="h-3.5 w-3.5" />}
                    {rem.actionType === 'numeracy_test' && <Calculator className="h-3.5 w-3.5" />}
                    {rem.actionType === 'intelligence_game' && <Brain className="h-3.5 w-3.5" />}
                    {rem.actionLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {assignedRemedials.length > 0 && (
          <div
            data-testid="student-360-assigned-remedials"
            className="border-t border-slate-200 pt-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-xs font-bold text-slate-900">
                Teacher-Assigned Developmental Interventions ({assignedRemedials.length})
              </p>
              <span className="text-[11px] text-slate-500">
                Tracked via Developmental Remedial Dashboard
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedRemedials.map((asg) => (
                <div
                  key={asg.id}
                  className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-bold text-blue-900">
                      {asg.category} ·{' '}
                      {asg.source === 'ai_gemini'
                        ? 'AI-Tailored'
                        : asg.source === 'teacher_custom'
                          ? 'Teacher Plan'
                          : 'Erikson Mapped'}
                    </span>
                    <span
                      className={`font-bold whitespace-nowrap ${
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
                  <p className="font-bold text-slate-900">{asg.title}</p>
                  <p className="text-slate-600 leading-relaxed">{asg.description}</p>
                  {asg.steps.length > 0 && (
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                      {asg.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-mono tabular-nums">
                    <span>{asg.durationLabel}</span>
                    <span>Due {asg.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assessment.pathBackToPositiveChecklist.length > 0 && (
          <div className="border-t border-slate-200 pt-3.5 text-xs space-y-1.5">
            <p className="font-semibold text-slate-800">
              Positive-Stage Verification Milestones ({assessment.expectedStage.virtue}):
            </p>
            <ul className="space-y-1 text-slate-600">
              {assessment.pathBackToPositiveChecklist.map((step) => (
                <li key={step}>· {step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
