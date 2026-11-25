import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Save,
  Timer,
  Zap,
} from 'lucide-react';
import type {
  AcademicMonthKey,
  ClassAssessmentTier,
  NumeracyTestSession,
  StudentRecord,
} from '../types';
import { apiRequest } from '../utils/api';
import {
  evaluateNumeracyTablesAttempt,
  generateJumbledTableQuestions,
  getNumeracyTierConfig,
  type JumbledTableQuestion,
  type JumbledTableResponse,
  NUMERACY_TIER_CONFIGS,
} from '../utils/numeracyTablesEngine';

interface NumeracyTablesArenaProps {
  student: StudentRecord;
  month: AcademicMonthKey;
  token: string;
  onSaved: (session: NumeracyTestSession) => Promise<void>;
}

type ArenaPhase = 'setup' | 'active' | 'results';

export const NumeracyTablesArena: React.FC<NumeracyTablesArenaProps> = ({
  student,
  month,
  token,
  onSaved,
}) => {
  const autoConfig = useMemo(
    () => getNumeracyTierConfig(student.classSection),
    [student.classSection],
  );
  const [selectedTier, setSelectedTier] = useState<ClassAssessmentTier>(autoConfig.tier);
  const tierConfig = NUMERACY_TIER_CONFIGS[selectedTier];

  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(
    autoConfig.defaultTimeLimitSeconds,
  );
  const [questionCount, setQuestionCount] = useState<number>(autoConfig.defaultQuestionCount);
  const [questionMode, setQuestionMode] = useState<'standard' | 'mixed_missing_factor'>(
    'standard',
  );
  const [focusWeakTables, setFocusWeakTables] = useState<number[] | undefined>(undefined);

  const [phase, setPhase] = useState<ArenaPhase>('setup');
  const [questions, setQuestions] = useState<JumbledTableQuestion[]>([]);
  const [responses, setResponses] = useState<JumbledTableResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);
  const [timedOut, setTimedOut] = useState(false);

  const sprintStartMsRef = useRef<number>(0);
  const questionStartMsRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedSession, setSavedSession] = useState<NumeracyTestSession | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  useEffect(() => {
    const cfg = getNumeracyTierConfig(student.classSection);
    setSelectedTier(cfg.tier);
    setTimeLimitSeconds(cfg.defaultTimeLimitSeconds);
    setQuestionCount(cfg.defaultQuestionCount);
    setFocusWeakTables(undefined);
    setPhase('setup');
    setSavedSession(null);
  }, [student.id, student.classSection]);

  function startSprint(overrideFocusTables?: number[]) {
    const activeFocus = overrideFocusTables ?? focusWeakTables;
    const generated = generateJumbledTableQuestions({
      minTable: tierConfig.minTable,
      maxTable: tierConfig.maxTable,
      minMultiplier: tierConfig.minMultiplier,
      maxMultiplier: tierConfig.maxMultiplier,
      count: activeFocus && activeFocus.length > 0 ? Math.min(12, questionCount) : questionCount,
      questionMode,
      focusTables: activeFocus,
    });
    const now = Date.now();
    sprintStartMsRef.current = now;
    questionStartMsRef.current = now;
    setQuestions(generated);
    setResponses([]);
    setCurrentIdx(0);
    setAnswerInput('');
    setSecondsLeft(timeLimitSeconds);
    setTimedOut(false);
    setSavedSession(null);
    setSaveErr(null);
    setPhase('active');
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  useEffect(() => {
    if (phase !== 'active') return;
    const id = window.setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - sprintStartMsRef.current) / 1000);
      const remaining = Math.max(0, timeLimitSeconds - elapsedSec);
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        setTimedOut(true);
        setPhase('results');
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, timeLimitSeconds]);

  function handleSubmitCurrentAnswer(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (phase !== 'active' || !questions[currentIdx]) return;
    const trimmed = answerInput.trim();
    if (!trimmed) return;

    const now = Date.now();
    const numericVal = Number(trimmed);
    const respMs = Math.max(250, now - questionStartMsRef.current);

    const nextResponses: JumbledTableResponse[] = [
      ...responses,
      {
        questionIndex: questions[currentIdx].index,
        userAnswer: Number.isFinite(numericVal) ? numericVal : null,
        responseTimeMs: respMs,
      },
    ];
    setResponses(nextResponses);
    setAnswerInput('');
    questionStartMsRef.current = now;

    if (currentIdx + 1 >= questions.length) {
      setTimedOut(false);
      setPhase('results');
    } else {
      setCurrentIdx((i) => i + 1);
      inputRef.current?.focus();
    }
  }

  function handleKeypadPress(key: string) {
    if (key === 'CLEAR') {
      setAnswerInput('');
      inputRef.current?.focus();
      return;
    }
    if (key === 'BACK') {
      setAnswerInput((prev) => prev.slice(0, -1));
      inputRef.current?.focus();
      return;
    }
    if (key === 'ENTER') {
      handleSubmitCurrentAnswer();
      return;
    }
    if (answerInput.length < 4) {
      setAnswerInput((prev) => `${prev}${key}`);
      inputRef.current?.focus();
    }
  }

  const elapsedSeconds = useMemo(() => {
    if (phase === 'setup') return 0;
    if (timedOut) return timeLimitSeconds;
    const sumMs = responses.reduce((s, r) => s + r.responseTimeMs, 0);
    return Math.max(1, Math.min(timeLimitSeconds, Math.round(sumMs / 1000)));
  }, [phase, timedOut, timeLimitSeconds, responses]);

  const evaluation = useMemo(
    () =>
      evaluateNumeracyTablesAttempt({
        questions,
        responses,
        timeLimitSeconds,
        elapsedSeconds: Math.max(1, elapsedSeconds),
        targetPaceMs: tierConfig.targetPaceMs,
      }),
    [questions, responses, timeLimitSeconds, elapsedSeconds, tierConfig.targetPaceMs],
  );

  const tableRangeLabel = useMemo(() => {
    if (focusWeakTables && focusWeakTables.length > 0) {
      return `Targeted Drill (${focusWeakTables.map((t) => `${t}×`).join(', ')})`;
    }
    return `Tables ${tierConfig.minTable} to ${tierConfig.maxTable}`;
  }, [focusWeakTables, tierConfig]);

  async function handleSaveNumeracySession() {
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await apiRequest<{ session: NumeracyTestSession }>(
        '/api/assessments/numeracy',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            month,
            year: 2026,
            classTier: selectedTier,
            tableRangeLabel,
            questionMode,
            timeLimitSeconds,
            elapsedSeconds: Math.max(1, elapsedSeconds),
            totalQuestions: evaluation.totalQuestions,
            attemptedCount: evaluation.attemptedCount,
            correctCount: evaluation.correctCount,
            accuracyPct: evaluation.accuracyPct,
            avgResponseMs: evaluation.avgResponseMs,
            questionsPerMinute: evaluation.questionsPerMinute,
            speedScorePct: evaluation.speedScorePct,
            tablesFluencyPct: evaluation.tablesFluencyPct,
            weakTables: evaluation.weakTables,
            tableBreakdown: evaluation.tableBreakdown,
            timedOut,
            conceptualGap: evaluation.conceptualGap,
            syncMonthlyReport: true,
          }),
        },
        token,
      );
      setSavedSession(res.session);
      await onSaved(res.session);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Unable to save timed tables diagnostic.');
    } finally {
      setSaving(false);
    }
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="space-y-6" data-testid="numeracy-tables-arena">
      {/* Configuration Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-900 shrink-0" />
              Time-Bound Jumbled Tables Speed &amp; Accuracy Test
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Student: <strong className="text-slate-900">{student.name}</strong> (Class{' '}
              {student.classSection}) · Anti-sequential jumbled multiplication · Target Month: {month} 2026
            </p>
          </div>
          {phase !== 'setup' && (
            <button
              type="button"
              onClick={() => {
                setFocusWeakTables(undefined);
                setPhase('setup');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Configure New Sprint
            </button>
          )}
        </div>

        {phase === 'setup' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-200 pt-4">
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Class Table Range</span>
              <select
                aria-label="Numeracy class table range"
                value={selectedTier}
                onChange={(e) => {
                  const nextTier = e.target.value as ClassAssessmentTier;
                  setSelectedTier(nextTier);
                  setTimeLimitSeconds(NUMERACY_TIER_CONFIGS[nextTier].defaultTimeLimitSeconds);
                  setQuestionCount(NUMERACY_TIER_CONFIGS[nextTier].defaultQuestionCount);
                  setFocusWeakTables(undefined);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {Object.values(NUMERACY_TIER_CONFIGS).map((cfg) => (
                  <option key={cfg.tier} value={cfg.tier}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Time Bound</span>
              <select
                aria-label="Numeracy sprint time bound"
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 tabular-nums"
              >
                <option value={30}>30 seconds (Blitz)</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds (Standard)</option>
                <option value={75}>75 seconds</option>
                <option value={90}>90 seconds</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Jumbled Questions</span>
              <select
                aria-label="Number of jumbled table questions"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 tabular-nums"
              >
                <option value={10}>10 Questions</option>
                <option value={12}>12 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={24}>24 Questions</option>
              </select>
            </label>

            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-700">Prompt Style</span>
              <select
                aria-label="Numeracy question mode"
                value={questionMode}
                onChange={(e) =>
                  setQuestionMode(e.target.value as 'standard' | 'mixed_missing_factor')
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
              >
                <option value="standard">Jumbled Products (14 × 7 = ?)</option>
                <option value="mixed_missing_factor">Mixed Missing-Factor (14 × ? = 98)</option>
              </select>
            </label>

            <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-600">
                Anti-sequential shuffling ensures consecutive questions never repeat the same table; speed &amp; accuracy are graded against {Math.round(tierConfig.targetPaceMs / 100) / 10}s/question pace.
              </p>
              <button
                type="button"
                onClick={() => startSprint()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
              >
                <Play className="h-3.5 w-3.5" />
                Start Timed Jumbled Tables ({timeLimitSeconds}s)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Timed Sprint Arena */}
      {phase === 'active' && currentQuestion && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          {/* Timer & Progress Telemetry */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-900 tabular-nums">
                  <Timer
                    className={`h-4 w-4 ${secondsLeft <= 10 ? 'text-red-600' : 'text-blue-900'}`}
                  />
                  {secondsLeft}s remaining
                </span>
                <span className="font-mono text-slate-600 tabular-nums">
                  Question {currentIdx + 1} / {questions.length}
                </span>
              </div>
              <span className="font-mono text-slate-600 tabular-nums">
                Correct so far:{' '}
                <strong className="text-emerald-700">
                  {
                    responses.filter(
                      (r) => r.userAnswer === questions[r.questionIndex]?.expectedAnswer,
                    ).length
                  }
                </strong>
                /{responses.length}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-200 ${
                  secondsLeft <= 10 ? 'bg-red-600' : 'bg-blue-900'
                }`}
                style={{ width: `${Math.round((secondsLeft / timeLimitSeconds) * 100)}%` }}
              />
            </div>
          </div>

          {/* Prompt + Answer Input + Keypad */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <form
              onSubmit={handleSubmitCurrentAnswer}
              className="md:col-span-7 rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center space-y-5"
            >
              <p className="text-xs font-semibold text-slate-500">
                {tableRangeLabel} · Table of {currentQuestion.tableBase}
              </p>
              <p
                data-testid="active-table-question"
                className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums tracking-tight"
              >
                {currentQuestion.promptText}
              </p>
              <div className="w-full max-w-xs flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label="Multiplication table answer input"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Type answer..."
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono text-2xl font-bold text-slate-900 tabular-nums focus:border-blue-900 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!answerInput.trim()}
                  className="rounded-lg bg-blue-900 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
                >
                  Next →
                </button>
              </div>
            </form>

            {/* Touch / Tablet Numeric Keypad */}
            <div className="md:col-span-5 grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeypadPress(k)}
                  className="rounded-lg border border-slate-200 bg-slate-50 py-3 font-mono text-sm font-bold text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                >
                  {k === 'BACK' ? '⌫' : k === 'CLEAR' ? 'CLR' : k}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results & Weak-Table Diagnostics */}
      {phase === 'results' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6" data-testid="numeracy-diagnostic-report">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Jumbled Tables Speed &amp; Accuracy Report ({student.name})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {tableRangeLabel} · {timedOut ? 'Time Expired' : 'Sprint Completed'} in{' '}
                <span className="font-mono tabular-nums">{elapsedSeconds}s</span> / {timeLimitSeconds}s limit
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {evaluation.weakTables.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setFocusWeakTables(evaluation.weakTables);
                    startSprint(evaluation.weakTables);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900 bg-white px-3.5 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Drill Weak Tables ({evaluation.weakTables.map((t) => `${t}×`).join(', ')})
                </button>
              )}
              <button
                type="button"
                disabled={saving || Boolean(savedSession)}
                onClick={() => void handleSaveNumeracySession()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 whitespace-nowrap"
              >
                <Save className="h-3.5 w-3.5" />
                {saving
                  ? 'Saving Report...'
                  : savedSession
                    ? `Saved to ${month} Report ✓`
                    : `Save to ${month} Numeracy Report`}
              </button>
            </div>
          </div>

          {saveErr && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              {saveErr}
            </div>
          )}

          {savedSession && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                Saved timed tables diagnostic ({savedSession.accuracyPct}% accuracy, {savedSession.questionsPerMinute} QPM) and synced {month} 2026 Numeracy Progress Chart.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Accuracy</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {evaluation.accuracyPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                {evaluation.correctCount}/{evaluation.totalQuestions} correct
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Speed Pace</p>
              <p className="font-mono text-2xl font-bold text-blue-900 tabular-nums mt-1">
                {evaluation.questionsPerMinute} QPM
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Avg {(evaluation.avgResponseMs / 1000).toFixed(1)}s / question
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Speed Score</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {evaluation.speedScorePct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                vs {(tierConfig.targetPaceMs / 1000).toFixed(1)}s class target
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Tables Fluency Score</p>
              <p className="font-mono text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {evaluation.tablesFluencyPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                65% Accuracy + 35% Speed
              </p>
            </div>
          </div>

          {evaluation.conceptualGap && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
              <strong>Diagnostic Note:</strong> {evaluation.conceptualGap}
            </div>
          )}

          {/* Per-Table Performance Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              Table-by-Table Accuracy &amp; Response Time Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {evaluation.tableBreakdown.map((item) => {
                const isWeak = evaluation.weakTables.includes(item.tableBase);
                return (
                  <div
                    key={item.tableBase}
                    className={`rounded-lg border p-3 text-xs ${
                      isWeak
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Table {item.tableBase}×</span>
                      <span
                        className={`font-mono tabular-nums ${
                          item.accuracyPct >= 80 ? 'text-emerald-700' : 'text-amber-800'
                        }`}
                      >
                        {item.accuracyPct}%
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 tabular-nums mt-1">
                      {item.correct}/{item.attempted} · {(item.avgResponseMs / 1000).toFixed(1)}s avg
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
