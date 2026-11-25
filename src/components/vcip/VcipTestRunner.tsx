import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type {
  VcipAttemptRecord,
  VcipDomainId,
  VcipLanguage,
  VcipMode,
} from '../../types/vcip';
import {
  VCIP_DOMAIN_META,
  VCIP_SYMBOL_KEY,
  generateFluidReasoningQuestions,
  generateProcessingSpeedStream,
  generateQuantitativeReasoningQuestions,
  generateSpatialReasoningQuestions,
  generateVerbalReasoningQuestions,
  generateWorkingMemoryTrials,
} from '../../utils/vcipQuestionBank';
import {
  VCIP_DISCLAIMER_TEXT,
  computeVcipDomainScore,
} from '../../utils/vcipScoringEngine';
import { apiRequest } from '../../utils/api';
import { MatrixCellSvg, ProcessingSymbolSvg, SpatialVisualSvg } from './VcipSvgVisuals';

interface VcipTestRunnerProps {
  token: string;
  studentId: string;
  studentName: string;
  classSection: string;
  classLevel: number;
  domain: VcipDomainId;
  mode: VcipMode;
  language: VcipLanguage;
  batterySessionId?: string;
  batteryStepLabel?: string;
  onCompleted: (saved: VcipAttemptRecord) => void;
  onExit: () => void;
}

export const VcipTestRunner: React.FC<VcipTestRunnerProps> = ({
  token,
  studentId,
  studentName,
  classSection,
  classLevel,
  domain,
  mode,
  language,
  batterySessionId,
  batteryStepLabel,
  onCompleted,
  onExit,
}) => {
  const meta = VCIP_DOMAIN_META[domain];
  const [seedNonce] = useState(() => `${studentId}-${Date.now()}`);
  const [speedDurationSec, setSpeedDurationSec] = useState<30 | 45 | 60>(45);
  const [started, setStarted] = useState(domain !== 'processing_speed');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<VcipAttemptRecord | null>(null);

  // Timers
  const startTimeRef = useRef<number>(Date.now());
  const itemStartRef = useRef<number>(Date.now());
  const responseTimesRef = useRef<number[]>([]);
  const initialLimit = domain === 'processing_speed' ? speedDurationSec : meta.timedLimitSec;
  const [remainingSec, setRemainingSec] = useState<number>(initialLimit);

  // Standard 6-question index + answers for Fluid / Verbal / Quantitative / Spatial
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(false);

  // Working Memory state
  const memoryTrials = useMemo(
    () => (domain === 'working_memory' ? generateWorkingMemoryTrials(classLevel, seedNonce) : []),
    [domain, classLevel, seedNonce],
  );
  const [memPhase, setMemPhase] = useState<'ready' | 'showing' | 'input' | 'feedback'>('ready');
  const [memRevealIndex, setMemRevealIndex] = useState<number>(-1);
  const [memTextInput, setMemTextInput] = useState('');
  const [memTileInput, setMemTileInput] = useState<string[]>([]);
  const [memResults, setMemResults] = useState<Array<{ correct: boolean; skipped?: boolean }>>([]);

  // Processing Speed state
  const speedStream = useMemo(
    () => (domain === 'processing_speed' ? generateProcessingSpeedStream(45, seedNonce) : []),
    [domain, seedNonce],
  );
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedCorrect, setSpeedCorrect] = useState(0);
  const [speedIncorrect, setSpeedIncorrect] = useState(0);
  const [lastFlashFeedback, setLastFlashFeedback] = useState<'ok' | 'err' | null>(null);

  // Generate domain question lists
  const fluidQuestions = useMemo(
    () => (domain === 'fluid_reasoning' ? generateFluidReasoningQuestions(classLevel, seedNonce) : []),
    [domain, classLevel, seedNonce],
  );
  const verbalQuestions = useMemo(
    () => (domain === 'verbal_reasoning' ? generateVerbalReasoningQuestions(classLevel, language) : []),
    [domain, classLevel, language],
  );
  const quantQuestions = useMemo(
    () => (domain === 'quantitative_reasoning' ? generateQuantitativeReasoningQuestions(classLevel) : []),
    [domain, classLevel],
  );
  const spatialQuestions = useMemo(
    () => (domain === 'spatial_reasoning' ? generateSpatialReasoningQuestions(classLevel, seedNonce) : []),
    [domain, classLevel, seedNonce],
  );

  // Countdown timer when in timed mode (or always for Processing Speed sprint)
  useEffect(() => {
    if (!started || savedRecord) return;
    if (mode !== 'timed' && domain !== 'processing_speed') return;

    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, mode, domain, savedRecord]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (remainingSec === 0 && started && !savedRecord && !submitting) {
      void finalizeAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec, started, savedRecord]);

  // Working Memory sequential reveal playback
  useEffect(() => {
    if (domain !== 'working_memory' || memPhase !== 'showing') return;
    const trial = memoryTrials[qIndex];
    if (!trial) return;

    let step = 0;
    setMemRevealIndex(0);
    const interval = setInterval(() => {
      step += 1;
      if (step >= trial.sequence.length) {
        clearInterval(interval);
        setMemRevealIndex(-1);
        setMemPhase('input');
        itemStartRef.current = Date.now();
      } else {
        setMemRevealIndex(step);
      }
    }, trial.displayMsPerItem);

    return () => clearInterval(interval);
  }, [domain, memPhase, qIndex, memoryTrials]);

  // Keyboard 1-9 support for Processing Speed
  useEffect(() => {
    if (domain !== 'processing_speed' || !started || savedRecord) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleSpeedDigitPick(Number(e.key));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, started, savedRecord, speedIndex]);

  function handleStartSpeedChallenge() {
    setRemainingSec(speedDurationSec);
    startTimeRef.current = Date.now();
    itemStartRef.current = Date.now();
    setStarted(true);
  }

  function handleSpeedDigitPick(digit: number) {
    const current = speedStream[speedIndex];
    if (!current || savedRecord) return;

    const elapsed = Date.now() - itemStartRef.current;
    responseTimesRef.current.push(elapsed);
    itemStartRef.current = Date.now();

    if (digit === current.correctDigit) {
      setSpeedCorrect((c) => c + 1);
      setLastFlashFeedback('ok');
    } else {
      setSpeedIncorrect((c) => c + 1);
      setLastFlashFeedback('err');
    }

    if (speedIndex + 1 >= speedStream.length) {
      void finalizeAttempt({
        overrideCorrect: speedCorrect + (digit === current.correctDigit ? 1 : 0),
        overrideIncorrect: speedIncorrect + (digit !== current.correctDigit ? 1 : 0),
      });
    } else {
      setSpeedIndex((idx) => idx + 1);
    }
  }

  function handleChoiceSelect(optionIdx: number) {
    const elapsed = Date.now() - itemStartRef.current;
    responseTimesRef.current.push(elapsed);
    itemStartRef.current = Date.now();
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIdx }));
    if (mode === 'practice') {
      setShowPracticeExplanation(true);
    }
  }

  function handleSubmitMemoryTrial() {
    const trial = memoryTrials[qIndex];
    if (!trial) return;
    const elapsed = Date.now() - itemStartRef.current;
    responseTimesRef.current.push(elapsed);

    let studentSeq: string[] = [];
    if (trial.subtask === 'visual_tiles') {
      studentSeq = memTileInput;
    } else {
      studentSeq = memTextInput
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .split('');
    }

    const isCorrect =
      studentSeq.length === trial.expectedAnswer.length &&
      studentSeq.every((v, idx) => v === trial.expectedAnswer[idx]);

    const nextResults = [...memResults];
    nextResults[qIndex] = { correct: isCorrect };
    setMemResults(nextResults);

    if (mode === 'practice') {
      setMemPhase('feedback');
    } else if (qIndex + 1 < memoryTrials.length) {
      setQIndex(qIndex + 1);
      setMemTextInput('');
      setMemTileInput([]);
      setMemPhase('ready');
    } else {
      void finalizeAttempt({ memoryOverride: nextResults });
    }
  }

  function handleNextMemoryTrial() {
    if (qIndex + 1 < memoryTrials.length) {
      setQIndex(qIndex + 1);
      setMemTextInput('');
      setMemTileInput([]);
      setMemPhase('ready');
    } else {
      void finalizeAttempt();
    }
  }

  async function finalizeAttempt(overrides?: {
    overrideCorrect?: number;
    overrideIncorrect?: number;
    memoryOverride?: Array<{ correct: boolean; skipped?: boolean }>;
  }) {
    if (submitting || savedRecord) return;
    setSubmitting(true);
    setSubmitError(null);

    const totalDurationSec = Math.max(
      1,
      domain === 'processing_speed'
        ? speedDurationSec - remainingSec || speedDurationSec
        : Math.round((Date.now() - startTimeRef.current) / 1000),
    );
    const rts = responseTimesRef.current;
    const avgResponseTimeMs =
      rts.length > 0 ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 4500;

    let totalQuestions = 6;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let skippedQuestions = 0;

    if (domain === 'processing_speed') {
      totalQuestions = speedStream.length;
      correctAnswers = overrides?.overrideCorrect ?? speedCorrect;
      incorrectAnswers = overrides?.overrideIncorrect ?? speedIncorrect;
      skippedQuestions = Math.max(0, totalQuestions - correctAnswers - incorrectAnswers);
    } else if (domain === 'working_memory') {
      const list = overrides?.memoryOverride ?? memResults;
      totalQuestions = memoryTrials.length;
      correctAnswers = list.filter((r) => r?.correct).length;
      incorrectAnswers = list.filter((r) => r && !r.correct && !r.skipped).length;
      skippedQuestions = Math.max(0, totalQuestions - correctAnswers - incorrectAnswers);
    } else {
      const items =
        domain === 'fluid_reasoning'
          ? fluidQuestions
          : domain === 'verbal_reasoning'
            ? verbalQuestions
            : domain === 'quantitative_reasoning'
              ? quantQuestions
              : spatialQuestions;
      totalQuestions = items.length;
      items.forEach((item, idx) => {
        const picked = selectedAnswers[idx];
        if (picked === undefined) {
          skippedQuestions += 1;
        } else if (picked === item.correctIndex) {
          correctAnswers += 1;
        } else {
          incorrectAnswers += 1;
        }
      });
    }

    const difficultyLevel: 1 | 2 | 3 = classLevel >= 10 ? 3 : classLevel >= 6 ? 2 : 1;

    try {
      const saved = await apiRequest<VcipAttemptRecord>(
        '/api/vcip/attempts',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            domain,
            mode,
            language,
            batterySessionId,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            skippedQuestions,
            totalDurationSec,
            avgResponseTimeMs,
            difficultyLevel,
            completionStatus: skippedQuestions > totalQuestions / 2 ? 'partial' : 'completed',
          }),
        },
        token,
      );
      setSavedRecord(saved);
      onCompleted(saved);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to save VCIP assessment result.');
    } finally {
      setSubmitting(false);
    }
  }

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ============================================================================
  // SUMMARY VIEW AFTER SUBMISSION
  // ============================================================================
  if (savedRecord) {
    const scorePreview = computeVcipDomainScore({
      domain: savedRecord.domain,
      mode: savedRecord.mode,
      totalQuestions: savedRecord.totalQuestions,
      correctAnswers: savedRecord.correctAnswers,
      incorrectAnswers: savedRecord.incorrectAnswers,
      skippedQuestions: savedRecord.skippedQuestions,
      totalDurationSec: savedRecord.totalDurationSec,
      avgResponseTimeMs: savedRecord.avgResponseTimeMs,
      difficultyLevel: savedRecord.difficultyLevel,
    });
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {meta.label} · {savedRecord.mode === 'timed' ? 'Timed Assessment' : 'Practice Mode'} ·{' '}
              {savedRecord.language === 'hi' ? 'Hindi' : 'English'}
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Domain Session Recorded — Internal Developmental Summary
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {studentName} ({classSection}) · Scoring Rule {savedRecord.scoringRuleVersion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
            >
              {batteryStepLabel ? 'Continue Battery / Return' : 'Return to VCIP Dashboard'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Internal Score</p>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {savedRecord.developmentalScore}/100
            </p>
            <p className="text-xs text-blue-700 font-medium mt-0.5">{scorePreview.bandLabel}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Accuracy</p>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {savedRecord.accuracyPct}%
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {savedRecord.correctAnswers} correct · {savedRecord.incorrectAnswers} incorrect
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Unanswered</p>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {savedRecord.skippedQuestions}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">of {savedRecord.totalQuestions} items</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Avg Response Time</p>
            <p className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900">
              {(savedRecord.avgResponseTimeMs / 1000).toFixed(1)}s
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Total {savedRecord.totalDurationSec}s</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Speed-Accuracy Balance</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {savedRecord.speedAccuracyLabel}
            </p>
            <p className="text-xs text-slate-500 mt-1">Non-IQ developmental indicator</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <span>{VCIP_DISCLAIMER_TEXT}</span>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ACTIVE INTERACTIVE ASSESSMENT RUNNER
  // ============================================================================
  const totalChoiceCount =
    domain === 'fluid_reasoning'
      ? fluidQuestions.length
      : domain === 'verbal_reasoning'
        ? verbalQuestions.length
        : domain === 'quantitative_reasoning'
          ? quantQuestions.length
          : domain === 'spatial_reasoning'
            ? spatialQuestions.length
            : memoryTrials.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </button>
            <span aria-hidden="true">·</span>
            <span>{mode === 'timed' ? 'Timed Assessment' : 'Practice Mode (Untimed)'}</span>
            {batteryStepLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-blue-700">{batteryStepLabel}</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{meta.label}</h3>
          <p className="text-xs text-slate-600">
            {studentName} ({classSection}) · {meta.tagline}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {(mode === 'timed' || domain === 'processing_speed') && started && (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-slate-900">
              <Clock className="h-4 w-4 text-blue-700" />
              <span>{formatClock(remainingSec)}</span>
            </div>
          )}
          {domain !== 'processing_speed' && (
            <span className="text-xs font-mono tabular-nums text-slate-600">
              Item {qIndex + 1} / {totalChoiceCount}
            </span>
          )}
        </div>
      </div>

      {submitError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {submitError}
        </div>
      )}

      {/* ---------------- MODULE 1: FLUID REASONING (3×3 SVG MATRIX) ---------------- */}
      {domain === 'fluid_reasoning' && fluidQuestions[qIndex] && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Question {qIndex + 1}: {fluidQuestions[qIndex].prompt}
            </p>
            <p className="text-xs text-slate-500">
              Category: {fluidQuestions[qIndex].category.replace(/_/g, ' ')} · Difficulty Level{' '}
              {fluidQuestions[qIndex].difficulty}
            </p>
            <div
              data-testid="vcip-fluid-matrix"
              className="grid grid-cols-3 gap-2.5 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-3.5"
            >
              {fluidQuestions[qIndex].grid.map((cell, idx) => (
                <div key={idx} className="rounded-lg bg-white p-1">
                  <MatrixCellSvg spec={cell} size={86} uid={`g-${qIndex}-${idx}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <p className="text-xs font-semibold text-slate-700">
              Select the missing tile for the bottom-right (?) position:
            </p>
            <div className="grid grid-cols-3 gap-3">
              {fluidQuestions[qIndex].options.map((opt, idx) => {
                const isSelected = selectedAnswers[qIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoiceSelect(idx)}
                    aria-label={`Matrix option ${String.fromCharCode(65 + idx)}`}
                    className={`rounded-xl border p-2.5 text-center transition-colors ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <MatrixCellSvg spec={opt} size={76} uid={`opt-${qIndex}-${idx}`} />
                    <span className="mt-1.5 block text-xs font-semibold text-slate-700">
                      Option {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {mode === 'practice' && showPracticeExplanation && selectedAnswers[qIndex] !== undefined && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-slate-800">
                <p className="font-semibold">
                  {selectedAnswers[qIndex] === fluidQuestions[qIndex].correctIndex
                    ? 'Correct pattern rule identified.'
                    : `Correct answer: Option ${String.fromCharCode(65 + fluidQuestions[qIndex].correctIndex)}`}
                </p>
                <p className="mt-1 text-slate-700">{fluidQuestions[qIndex].explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- MODULE 2: WORKING MEMORY & SEQUENCE PROCESSING ---------------- */}
      {domain === 'working_memory' && memoryTrials[qIndex] && (
        <div className="max-w-2xl mx-auto space-y-5 py-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Trial {qIndex + 1} of {memoryTrials.length} · Length {memoryTrials[qIndex].sequence.length} ·
              Difficulty Level {memoryTrials[qIndex].difficulty}
            </p>
            <h4 className="text-base font-bold text-slate-900">
              {memoryTrials[qIndex].instruction}
            </h4>
            <p className="text-xs text-slate-600">Rule: {memoryTrials[qIndex].ruleHint}</p>
          </div>

          {memPhase === 'ready' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center space-y-4">
              <p className="text-sm text-slate-700">
                Focus on the display area. Each item will flash briefly one at a time.
              </p>
              <button
                type="button"
                onClick={() => setMemPhase('showing')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Eye className="h-4 w-4" /> Reveal Sequence Now
              </button>
            </div>
          )}

          {memPhase === 'showing' && (
            <div className="rounded-xl border border-blue-200 bg-slate-900 p-8 text-center">
              {memoryTrials[qIndex].subtask === 'visual_tiles' ? (
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {Array.from({ length: 9 }, (_, tileIdx) => {
                    const active =
                      memRevealIndex >= 0 &&
                      memoryTrials[qIndex].sequence[memRevealIndex] === String(tileIdx);
                    return (
                      <div
                        key={tileIdx}
                        className={`h-20 rounded-lg border transition-colors ${
                          active
                            ? 'bg-sky-400 border-white shadow-lg'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="py-6">
                  <p className="text-xs text-slate-400 mb-2">
                    Item {memRevealIndex + 1} of {memoryTrials[qIndex].sequence.length}
                  </p>
                  <p className="text-6xl font-mono font-bold text-white tracking-wider">
                    {memRevealIndex >= 0 ? memoryTrials[qIndex].sequence[memRevealIndex] : '·'}
                  </p>
                </div>
              )}
            </div>
          )}

          {memPhase === 'input' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-4">
              {memoryTrials[qIndex].subtask === 'visual_tiles' ? (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-700 text-center">
                    Click {memoryTrials[qIndex].expectedAnswer.length} squares in the exact order they lit up
                    ({memTileInput.length}/{memoryTrials[qIndex].expectedAnswer.length} selected)
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {Array.from({ length: 9 }, (_, tileIdx) => {
                      const orderPos = memTileInput.indexOf(String(tileIdx));
                      const picked = orderPos >= 0;
                      return (
                        <button
                          key={tileIdx}
                          type="button"
                          aria-label={`Memory grid tile ${tileIdx + 1}`}
                          onClick={() => {
                            if (memTileInput.length < memoryTrials[qIndex].expectedAnswer.length) {
                              setMemTileInput((prev) => [...prev, String(tileIdx)]);
                            }
                          }}
                          className={`h-20 rounded-lg border text-sm font-bold font-mono transition-colors ${
                            picked
                              ? 'bg-blue-700 text-white border-blue-800'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                          }`}
                        >
                          {picked ? orderPos + 1 : ''}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMemTileInput([])}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Clear Selection
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitMemoryTrial}
                      disabled={memTileInput.length === 0}
                      className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Submit Sequence
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label htmlFor="vcip-mem-input" className="block text-xs font-semibold text-slate-700">
                    Type your recalled sequence ({memoryTrials[qIndex].ruleHint}):
                  </label>
                  <input
                    id="vcip-mem-input"
                    type="text"
                    value={memTextInput}
                    onChange={(e) => setMemTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && memTextInput.trim()) handleSubmitMemoryTrial();
                    }}
                    placeholder="Enter digits or letters without spaces..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-lg tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Expected length: {memoryTrials[qIndex].expectedAnswer.length} characters
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitMemoryTrial}
                      disabled={!memTextInput.trim()}
                      className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Submit Trial
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {memPhase === 'feedback' && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-3">
              <p className="text-sm font-bold text-slate-900">
                {memResults[qIndex]?.correct
                  ? 'Exact sequence recalled!'
                  : `Expected sequence: ${memoryTrials[qIndex].expectedAnswer.join(' ')}`}
              </p>
              <button
                type="button"
                onClick={handleNextMemoryTrial}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                {qIndex + 1 < memoryTrials.length ? 'Next Memory Trial' : 'Finish Working Memory'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULE 3: PROCESSING SPEED & SYMBOL MATCHING ---------------- */}
      {domain === 'processing_speed' && (
        <div className="space-y-6">
          {/* Symbol Reference Key */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-3">
              Symbol–Number Reference Key (Match the displayed symbol to its paired digit 1–9)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {VCIP_SYMBOL_KEY.map((entry) => (
                <div
                  key={entry.digit}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-center"
                >
                  <ProcessingSymbolSvg symbolId={entry.symbolId} size={30} />
                  <span className="mt-1 block font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {entry.digit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!started ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center space-y-4">
              <h4 className="text-base font-bold text-slate-900">
                Configure Your Timed Symbol-Matching Sprint
              </h4>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Both speed and accuracy are recorded separately. Aim for steady precision rather than
                rushing guesses. You can click the digit buttons or press keys 1–9 on your keyboard.
              </p>
              <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {([30, 45, 60] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSpeedDurationSec(sec)}
                    className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
                      speedDurationSec === sec
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sec} seconds
                  </button>
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleStartSpeedChallenge}
                  className="rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
                >
                  Start {speedDurationSec}s Symbol Matching
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-5 text-center">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-mono tabular-nums">
                <span>Item {speedIndex + 1}/{speedStream.length}</span>
                <span className="text-emerald-700 font-semibold">Correct: {speedCorrect}</span>
                <span className="text-rose-700 font-semibold">Errors: {speedIncorrect}</span>
              </div>

              <div
                className={`mx-auto w-36 h-36 rounded-2xl border-2 flex items-center justify-center transition-colors ${
                  lastFlashFeedback === 'ok'
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : lastFlashFeedback === 'err'
                      ? 'border-rose-300 bg-rose-50/40'
                      : 'border-slate-300 bg-slate-50'
                }`}
              >
                {speedStream[speedIndex] && (
                  <ProcessingSymbolSvg symbolId={speedStream[speedIndex].symbolId} size={72} color="#1e3a8a" />
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    aria-label={`Match digit ${num}`}
                    onClick={() => handleSpeedDigitPick(num)}
                    className="rounded-lg border border-slate-300 bg-white py-3 font-mono text-base font-bold text-slate-900 hover:bg-blue-50 hover:border-blue-600 active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void finalizeAttempt()}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Finish & Record Early
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODULES 4 & 5: VERBAL (EN/HI) & QUANTITATIVE ---------------- */}
      {(domain === 'verbal_reasoning' || domain === 'quantitative_reasoning') && (() => {
        const list = domain === 'verbal_reasoning' ? verbalQuestions : quantQuestions;
        const item = list[qIndex];
        if (!item) return null;
        return (
          <div className="max-w-3xl space-y-5">
            <p className="text-xs font-medium text-slate-500">
              {item.category} · Difficulty Level {item.difficulty}
              {domain === 'verbal_reasoning' && ` · Language: ${item.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}`}
            </p>
            {item.passage && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 leading-relaxed">
                {item.passage}
              </div>
            )}
            <h4 className="text-base font-bold text-slate-900 leading-snug">{item.prompt}</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {item.options.map((opt, idx) => {
                const selected = selectedAnswers[qIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoiceSelect(idx)}
                    className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                      selected
                        ? 'border-blue-700 bg-blue-50 text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-500 mr-2">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {mode === 'practice' && showPracticeExplanation && selectedAnswers[qIndex] !== undefined && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-slate-800">
                <p className="font-semibold">
                  {selectedAnswers[qIndex] === item.correctIndex
                    ? 'Correct reasoning.'
                    : `Correct answer: ${String.fromCharCode(65 + item.correctIndex)}. ${item.options[item.correctIndex]}`}
                </p>
                <p className="mt-1 text-slate-700">{item.explanation}</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* ---------------- MODULE 6: SPATIAL REASONING & MENTAL ROTATION ---------------- */}
      {domain === 'spatial_reasoning' && spatialQuestions[qIndex] && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-medium text-slate-500">
              {spatialQuestions[qIndex].category.replace(/_/g, ' ')} · Difficulty Level{' '}
              {spatialQuestions[qIndex].difficulty}
            </p>
            <h4 className="text-sm font-bold text-slate-900">{spatialQuestions[qIndex].prompt}</h4>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-xs font-medium text-slate-500 mb-3">Reference Figure</p>
              <SpatialVisualSvg spec={spatialQuestions[qIndex].reference} size={156} />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold text-slate-700">Choose the matching spatial transformation:</p>
            <div className="grid grid-cols-2 gap-3">
              {spatialQuestions[qIndex].options.map((opt, idx) => {
                const selected = selectedAnswers[qIndex] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoiceSelect(idx)}
                    className={`rounded-xl border p-3 text-center transition-colors ${
                      selected
                        ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <SpatialVisualSvg spec={opt.spec} size={108} />
                    <span className="mt-2 block text-xs font-semibold text-slate-800">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {mode === 'practice' && showPracticeExplanation && selectedAnswers[qIndex] !== undefined && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-slate-800">
                <p className="font-semibold">
                  {selectedAnswers[qIndex] === spatialQuestions[qIndex].correctIndex
                    ? 'Accurate spatial visualization!'
                    : `Correct answer: ${spatialQuestions[qIndex].options[spatialQuestions[qIndex].correctIndex].label}`}
                </p>
                <p className="mt-1 text-slate-700">{spatialQuestions[qIndex].explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Navigation for Choice-based Modules */}
      {domain !== 'processing_speed' && domain !== 'working_memory' && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            disabled={qIndex === 0}
            onClick={() => {
              setQIndex((i) => Math.max(0, i - 1));
              setShowPracticeExplanation(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {qIndex + 1 < totalChoiceCount ? (
              <button
                type="button"
                onClick={() => {
                  setQIndex((i) => i + 1);
                  setShowPracticeExplanation(false);
                  itemStartRef.current = Date.now();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Next Item <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void finalizeAttempt()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {submitting ? 'Saving Score...' : 'Submit Domain Assessment'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
