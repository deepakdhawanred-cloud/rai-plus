import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import type {
  VcipBrainGymLog,
  VcipDomainId,
  VcipDomainSummary,
  VcipLanguage,
} from '../../types/vcip';
import {
  VCIP_DOMAIN_META,
  generateFluidReasoningQuestions,
  generateQuantitativeReasoningQuestions,
  generateSpatialReasoningQuestions,
  generateVerbalReasoningQuestions,
  generateWorkingMemoryTrials,
} from '../../utils/vcipQuestionBank';
import { computeBrainGymStreak } from '../../utils/vcipScoringEngine';
import { apiRequest } from '../../utils/api';
import { MatrixCellSvg, SpatialVisualSvg } from './VcipSvgVisuals';

interface VcipDailyBrainGymProps {
  token: string;
  studentId: string;
  studentName: string;
  classLevel: number;
  language: VcipLanguage;
  logs: VcipBrainGymLog[];
  summaries: VcipDomainSummary[];
  onRefresh: () => Promise<void>;
}

const DAILY_ORDER: Array<{ id: VcipDomainId; title: string }> = [
  { id: 'fluid_reasoning', title: '1. Visual Pattern Puzzle' },
  { id: 'working_memory', title: '2. Working Memory Sprint' },
  { id: 'quantitative_reasoning', title: '3. Numerical Logic Problem' },
  { id: 'verbal_reasoning', title: '4. Verbal Deduction Challenge' },
  { id: 'spatial_reasoning', title: '5. Spatial Rotation Activity' },
];

export const VcipDailyBrainGym: React.FC<VcipDailyBrainGymProps> = ({
  token,
  studentId,
  studentName,
  classLevel,
  language,
  logs,
  summaries,
  onRefresh,
}) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [seedSuffix, setSeedSuffix] = useState('v1');
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [memRevealed, setMemRevealed] = useState(true);
  const [memInput, setMemInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const seed = `gym-${todayKey}-${studentId}-${seedSuffix}`;

  const fluidQ = useMemo(
    () => generateFluidReasoningQuestions(classLevel, seed)[0],
    [classLevel, seed],
  );
  const memTrial = useMemo(
    () => generateWorkingMemoryTrials(classLevel, seed)[1], // Backward span for quick mental workout
    [classLevel, seed],
  );
  const quantQ = useMemo(
    () => generateQuantitativeReasoningQuestions(classLevel)[0],
    [classLevel],
  );
  const verbalQ = useMemo(
    () => generateVerbalReasoningQuestions(classLevel, language)[0],
    [classLevel, language],
  );
  const spatialQ = useMemo(
    () => generateSpatialReasoningQuestions(classLevel, seed)[0],
    [classLevel, seed],
  );

  const streakStats = useMemo(() => computeBrainGymStreak(logs), [logs]);
  const completedToday = logs.some((l) => l.dateKey === todayKey);

  const focusRecommendations = useMemo(() => {
    const assessed = summaries.filter((s) => s.latestScore !== null);
    const lowest = [...assessed]
      .sort((a, b) => (a.latestScore ?? 100) - (b.latestScore ?? 100))
      .slice(0, 2);
    if (lowest.length === 0) {
      return [
        {
          domain: 'fluid_reasoning' as VcipDomainId,
          label: VCIP_DOMAIN_META.fluid_reasoning.shortLabel,
          tip: VCIP_DOMAIN_META.fluid_reasoning.trainingActivities[0],
        },
        {
          domain: 'working_memory' as VcipDomainId,
          label: VCIP_DOMAIN_META.working_memory.shortLabel,
          tip: VCIP_DOMAIN_META.working_memory.trainingActivities[0],
        },
      ];
    }
    return lowest.map((s) => ({
      domain: s.domain,
      label: s.shortLabel,
      tip: VCIP_DOMAIN_META[s.domain].trainingActivities[0],
    }));
  }, [summaries]);

  function recordStepResult(stepIdx: number, isCorrect: boolean) {
    setAnswers((prev) => ({ ...prev, [stepIdx]: isCorrect }));
  }

  function advanceStep() {
    setPickedOption(null);
    setMemInput('');
    setMemRevealed(true);
    if (activeStep < DAILY_ORDER.length - 1) {
      setActiveStep((s) => s + 1);
    }
  }

  async function handleFinishCircuit() {
    setSaving(true);
    setSavedNotice(null);
    const correctCount = Object.values(answers).filter(Boolean).length;
    const durationSec = Math.max(15, Math.round((Date.now() - startedAt) / 1000));
    try {
      await apiRequest(
        '/api/vcip/brain-gym',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            dateKey: todayKey,
            completedChallenges: DAILY_ORDER.map((d) => d.id),
            correctCount,
            totalCount: DAILY_ORDER.length,
            durationSec,
          }),
        },
        token,
      );
      setSavedNotice(
        `Daily Brain Gym circuit saved (${correctCount}/${DAILY_ORDER.length} solved). Recorded strictly under Practice Logs — formal VCIP scores remain unchanged.`,
      );
      await onRefresh();
    } catch (err) {
      setSavedNotice(err instanceof Error ? err.message : 'Unable to save Brain Gym log.');
    } finally {
      setSaving(false);
    }
  }

  const answeredCount = Object.keys(answers).length;
  const allStepsDone = answeredCount === DAILY_ORDER.length;

  return (
    <div className="space-y-6">
      {/* Separation Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
        <ShieldAlert className="h-4 w-4 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950">
          <span className="font-semibold">Practice Experience — Separate from Formal VCIP Assessments:</span>{' '}
          Daily Brain Gym builds thinking habits in 5–10 minutes per day. Practice performance never
          overwrites or alters formal timed VCIP cognitive profile scores.
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Current Practice Streak</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-amber-600" />
            {streakStats.currentStreak} day{streakStats.currentStreak === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {completedToday ? 'Today’s circuit logged' : 'Ready for today’s 5-puzzle circuit'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Practice Days</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {streakStats.totalDays}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Milestone: {streakStats.totalDays >= 7 ? 'Weekly Consistency' : 'Building Habit'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Brain Gym Puzzles Solved</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {streakStats.totalPuzzlesSolved}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Across 5 cognitive domains</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Practice Accuracy</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
            {streakStats.accuracyPct}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{studentName} · Practice Tracker</p>
        </div>
      </div>

      {/* Main 2-column Interactive Daily Circuit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 5-Challenge Stepper + Interactive Stage */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900">
                Daily 5-Challenge Cognitive Workout ({todayKey})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete all 5 short puzzles (Visual · Memory · Numerical · Verbal · Spatial) to log today’s workout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSeedSuffix(`v${Date.now()}`);
                setActiveStep(0);
                setAnswers({});
                setPickedOption(null);
                setMemInput('');
                setMemRevealed(true);
                setSavedNotice(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 self-start"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Fresh Practice Set
            </button>
          </div>

          {/* 5-step selector bar */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg">
            {DAILY_ORDER.map((step, idx) => {
              const done = answers[idx] !== undefined;
              const isCurrent = activeStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveStep(idx);
                    setPickedOption(null);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : done
                        ? 'text-emerald-800 hover:bg-white/60'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {done ? '✓ ' : ''}
                  {step.title}
                </button>
              );
            })}
          </div>

          {savedNotice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
              {savedNotice}
            </div>
          )}

          {/* Step 0: Fluid Pattern */}
          {activeStep === 0 && fluidQ && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-6 space-y-2">
                <p className="text-sm font-semibold text-slate-900">{fluidQ.prompt}</p>
                <div className="grid grid-cols-3 gap-2 max-w-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {fluidQ.grid.map((cell, i) => (
                    <div key={i} className="rounded bg-white p-0.5">
                      <MatrixCellSvg spec={cell} size={70} uid={`gym-m-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-6 space-y-3">
                <p className="text-xs font-medium text-slate-600">Select the missing pattern:</p>
                <div className="grid grid-cols-3 gap-2">
                  {fluidQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPickedOption(idx);
                        recordStepResult(0, idx === fluidQ.correctIndex);
                      }}
                      className={`rounded-lg border p-2 transition-colors ${
                        pickedOption === idx
                          ? idx === fluidQ.correctIndex
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-rose-500 bg-rose-50'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <MatrixCellSvg spec={opt} size={62} uid={`gym-o-${idx}`} />
                    </button>
                  ))}
                </div>
                {pickedOption !== null && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="font-semibold">
                      {pickedOption === fluidQ.correctIndex ? 'Correct! ' : 'Good try — '}
                    </span>
                    {fluidQ.explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Working Memory Reverse Recall */}
          {activeStep === 1 && memTrial && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900">{memTrial.instruction}</p>
              {memRevealed ? (
                <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-center space-y-3">
                  <p className="text-xs text-slate-400">Study these digits carefully, then click Hide & Recall:</p>
                  <p className="text-4xl font-mono font-bold tracking-[0.35em] text-white">
                    {memTrial.sequence.join(' ')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMemRevealed(false)}
                    className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Hide Digits & Enter in Reverse
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <label htmlFor="gym-mem-input" className="block text-xs font-semibold text-slate-700">
                    Type the digits in REVERSE order:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="gym-mem-input"
                      type="text"
                      value={memInput}
                      onChange={(e) => setMemInput(e.target.value)}
                      placeholder="e.g. 9421"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-base tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const clean = memInput.replace(/\D/g, '');
                        recordStepResult(1, clean === memTrial.expectedAnswer.join(''));
                      }}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Check Answer
                    </button>
                  </div>
                  {answers[1] !== undefined && (
                    <p className="text-xs text-slate-700">
                      {answers[1]
                        ? 'Exact reverse recall!'
                        : `Expected reverse sequence: ${memTrial.expectedAnswer.join(' ')}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Numerical Reasoning */}
          {activeStep === 2 && quantQ && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">{quantQ.category}</p>
              <p className="text-sm font-semibold text-slate-900">{quantQ.prompt}</p>
              <div className="grid grid-cols-2 gap-3">
                {quantQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickedOption(idx);
                      recordStepResult(2, idx === quantQ.correctIndex);
                    }}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      pickedOption === idx
                        ? idx === quantQ.correctIndex
                          ? 'border-emerald-600 bg-emerald-50 font-semibold'
                          : 'border-rose-500 bg-rose-50'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {pickedOption !== null && (
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {quantQ.explanation}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Verbal Logic */}
          {activeStep === 3 && verbalQ && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                {verbalQ.category} · {language === 'hi' ? 'Hindi' : 'English'}
              </p>
              <p className="text-sm font-semibold text-slate-900">{verbalQ.prompt}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {verbalQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPickedOption(idx);
                      recordStepResult(3, idx === verbalQ.correctIndex);
                    }}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      pickedOption === idx
                        ? idx === verbalQ.correctIndex
                          ? 'border-emerald-600 bg-emerald-50 font-semibold'
                          : 'border-rose-500 bg-rose-50'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {pickedOption !== null && (
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {verbalQ.explanation}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Spatial Rotation */}
          {activeStep === 4 && spatialQ && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-900 text-left">{spatialQ.prompt}</p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <SpatialVisualSvg spec={spatialQ.reference} size={132} />
                </div>
              </div>
              <div className="md:col-span-7 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {spatialQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPickedOption(idx);
                        recordStepResult(4, idx === spatialQ.correctIndex);
                      }}
                      className={`rounded-lg border p-2.5 text-center transition-colors ${
                        pickedOption === idx
                          ? idx === spatialQ.correctIndex
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-rose-500 bg-rose-50'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <SpatialVisualSvg spec={opt.spec} size={92} />
                      <span className="mt-1 block text-xs font-semibold text-slate-700">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {pickedOption !== null && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    {spatialQ.explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
            <span className="text-xs font-mono tabular-nums text-slate-600">
              Completed {answeredCount}/{DAILY_ORDER.length} daily challenges
            </span>
            <div className="flex items-center gap-2">
              {activeStep < DAILY_ORDER.length - 1 && (
                <button
                  type="button"
                  onClick={advanceStep}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Next Challenge
                </button>
              )}
              <button
                type="button"
                disabled={!allStepsDone || saving}
                onClick={() => void handleFinishCircuit()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-45"
              >
                <CheckCircle2 className="h-4 w-4" />
                {saving ? 'Logging Practice...' : 'Log Today’s Brain Gym'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Personalised Improvement Plan based on observed VCIP performance */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-700" />
              <h4 className="text-sm font-bold text-slate-900">Recommended Personal Drills</h4>
            </div>
            <p className="text-xs text-slate-600">
              Targeted to your observed VCIP growth areas for steady skill building:
            </p>
            <div className="space-y-3">
              {focusRecommendations.map((rec) => (
                <div key={rec.domain} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-900">{rec.label}</p>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{rec.tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">Recent Brain Gym Log</h4>
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500">Complete your first 5-puzzle circuit to start a streak.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-xs">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="py-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-slate-700">{log.dateKey}</span>
                    <span className="text-slate-600 font-mono tabular-nums">
                      {log.correctCount}/{log.totalCount} solved · {Math.round(log.durationSec / 60)}m
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
