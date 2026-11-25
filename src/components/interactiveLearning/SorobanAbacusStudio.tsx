import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Eye,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import type {
  AbacusSessionMode,
  AbacusSessionRecord,
} from '../../types/interactiveLearning';
import {
  ABACUS_LEVELS,
  analyzeAbacusSessionCoach,
  clickEarthBead,
  createEmptySoroban,
  decodeSorobanValue,
  encodeNumberToSoroban,
  generateAbacusProblem,
  getColumnDigit,
  summarizeAbacusHistory,
  toggleHeavenBead,
  type AbacusProblem,
  type SorobanColumnState,
} from '../../utils/abacusEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface SorobanAbacusStudioProps {
  token: string;
  studentId?: string;
  sessions: AbacusSessionRecord[];
  initialLevel?: number;
  onSessionSaved: () => Promise<void>;
}

const QUESTIONS_PER_ROUND = 5;

function playBeadClickTone(isHeaven: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isHeaven ? 520 : 390, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(isHeaven ? 280 : 210, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  } catch {
    // Audio optional
  }
}

export const SorobanAbacusStudio: React.FC<SorobanAbacusStudioProps> = ({
  token,
  studentId,
  sessions,
  initialLevel = 1,
  onSessionSaved,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevel);
  const [mode, setMode] = useState<AbacusSessionMode>('soroban_practice');
  const [decimalPlaces, setDecimalPlaces] = useState<0 | 1 | 2>(0);
  const [columns, setColumns] = useState<SorobanColumnState[]>(() => createEmptySoroban(0));

  // Round state
  const [roundActive, setRoundActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [problem, setProblem] = useState<AbacusProblem>(() => generateAbacusProblem(initialLevel, 1));
  const [showStepsHint, setShowStepsHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ expected: number; actual: number; prompt: string }>>([]);
  const [feedbackBanner, setFeedbackBanner] = useState<{ kind: 'correct' | 'wrong'; text: string } | null>(null);
  const [roundSummary, setRoundSummary] = useState<{
    accuracyPct: number;
    avgSec: number;
    xpEarned: number;
    coachFeedback: string;
    mistakePatterns: string[];
    recommendedNextLevel: number;
  } | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  // Speed drill & Mental Flash (Anzan) state
  const [typedAnswer, setTypedAnswer] = useState('');
  const [flashSequence, setFlashSequence] = useState<number[]>([]);
  const [flashIndex, setFlashIndex] = useState<number>(-1);
  const [flashExpected, setFlashExpected] = useState<number>(0);
  const [flashReadyToAnswer, setFlashReadyToAnswer] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const roundStartRef = useRef<number>(Date.now());
  const flashTimerRef = useRef<number | null>(null);

  const levelConfig = useMemo(
    () => ABACUS_LEVELS.find((l) => l.level === selectedLevel) || ABACUS_LEVELS[0],
    [selectedLevel],
  );

  const historySummary = useMemo(() => summarizeAbacusHistory(sessions), [sessions]);
  const currentSorobanValue = useMemo(
    () => decodeSorobanValue(columns, decimalPlaces),
    [columns, decimalPlaces],
  );

  useEffect(() => {
    const reqDec = (levelConfig.decimalPlaces as 0 | 1 | 2) || 0;
    setDecimalPlaces(reqDec);
    setColumns(createEmptySoroban(reqDec));
    setProblem(generateAbacusProblem(selectedLevel, Date.now() % 97));
    setShowStepsHint(false);
    setFeedbackBanner(null);
  }, [selectedLevel, levelConfig.decimalPlaces]);

  useEffect(() => {
    if (!roundActive) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.round((Date.now() - roundStartRef.current) / 1000));
    }, 500);
    return () => window.clearInterval(id);
  }, [roundActive]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handleToggleDecimal = (nextDec: 0 | 1 | 2) => {
    setDecimalPlaces(nextDec);
    setColumns(encodeNumberToSoroban(currentSorobanValue, nextDec));
  };

  const handleHeavenClick = (colIdx: number) => {
    playBeadClickTone(true);
    setColumns((prev) => toggleHeavenBead(prev, colIdx));
  };

  const handleEarthClick = (colIdx: number, beadIdx: 0 | 1 | 2 | 3) => {
    playBeadClickTone(false);
    setColumns((prev) => clickEarthBead(prev, colIdx, beadIdx));
  };

  const triggerFlashSequence = (lvl: number, nonce: number) => {
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    const count = lvl <= 3 ? 3 : lvl <= 7 ? 4 : 5;
    const maxNum = lvl <= 3 ? 9 : lvl <= 6 ? 25 : 65;
    const nums: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const n = Math.max(1, Math.floor(Math.abs(Math.sin((nonce + i + 1) * 19.7 + Date.now() * 0.001)) * maxNum) + 1);
      nums.push(n);
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    setFlashSequence(nums);
    setFlashExpected(sum);
    setFlashReadyToAnswer(false);
    setTypedAnswer('');
    setFlashIndex(0);

    const speedMs = lvl <= 4 ? 1200 : lvl <= 8 ? 950 : 750;
    let step = 0;
    const advance = () => {
      step += 1;
      if (step < nums.length) {
        setFlashIndex(step);
        flashTimerRef.current = window.setTimeout(advance, speedMs);
      } else {
        setFlashIndex(-1);
        setFlashReadyToAnswer(true);
      }
    };
    flashTimerRef.current = window.setTimeout(advance, speedMs);
  };

  const startRound = (nextMode: AbacusSessionMode = mode) => {
    setMode(nextMode);
    setRoundActive(true);
    setRoundSummary(null);
    setQuestionIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setMistakes([]);
    setFeedbackBanner(null);
    setShowStepsHint(false);
    setTypedAnswer('');
    setElapsedSec(0);
    roundStartRef.current = Date.now();

    const reqDec = (levelConfig.decimalPlaces as 0 | 1 | 2) || 0;
    setDecimalPlaces(reqDec);
    setColumns(createEmptySoroban(reqDec));

    if (nextMode === 'mental_flash') {
      triggerFlashSequence(selectedLevel, 1);
    } else {
      setProblem(generateAbacusProblem(selectedLevel, 1));
    }
  };

  const finalizeRound = async (
    finalCorrect: number,
    finalBestStreak: number,
    finalMistakes: Array<{ expected: number; actual: number; prompt: string }>,
  ) => {
    setRoundActive(false);
    const totalTimeSec = Math.max(3, (Date.now() - roundStartRef.current) / 1000);
    const avgSec = Math.round((totalTimeSec / QUESTIONS_PER_ROUND) * 10) / 10;
    const accuracyPct = Math.round((finalCorrect / QUESTIONS_PER_ROUND) * 100);
    const localCoach = analyzeAbacusSessionCoach({
      level: selectedLevel,
      operation: levelConfig.operation,
      accuracyPct,
      avgResponseSec: avgSec,
      mistakes: finalMistakes,
    });

    setSavingSession(true);
    try {
      const resp = await apiRequest<{ session: AbacusSessionRecord }>(
        '/api/interactive-learning/abacus/sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            level: selectedLevel,
            mode,
            operation: levelConfig.operation,
            digits: levelConfig.digits,
            questionsAttempted: QUESTIONS_PER_ROUND,
            correctCount: finalCorrect,
            avgResponseSec: avgSec,
            bestStreak: finalBestStreak,
            mistakes: finalMistakes,
          }),
        },
        token,
      );
      setRoundSummary({
        accuracyPct: resp.session.accuracyPct,
        avgSec: resp.session.avgResponseSec,
        xpEarned: resp.session.xpEarned,
        coachFeedback: resp.session.coachFeedback,
        mistakePatterns: resp.session.mistakePatterns,
        recommendedNextLevel: resp.session.recommendedNextLevel,
      });
      pushToast(`Abacus session saved (+${resp.session.xpEarned} XP)`, 'success');
      await onSessionSaved();
    } catch (err) {
      setRoundSummary({
        accuracyPct,
        avgSec,
        xpEarned: 35,
        coachFeedback: localCoach.coachFeedback,
        mistakePatterns: localCoach.mistakePatterns,
        recommendedNextLevel: localCoach.recommendedNextLevel,
      });
      pushToast(err instanceof Error ? err.message : 'Unable to save abacus session.', 'error');
    } finally {
      setSavingSession(false);
    }
  };

  const handleCheckAnswer = async () => {
    const expected = mode === 'mental_flash' ? flashExpected : problem.expectedAnswer;
    const promptText =
      mode === 'mental_flash' ? `Flash Sum (${flashSequence.join(' + ')})` : problem.prompt;

    const studentValue =
      mode === 'soroban_practice'
        ? currentSorobanValue
        : Number(typedAnswer.trim());

    if (mode !== 'soroban_practice' && (!typedAnswer.trim() || Number.isNaN(studentValue))) {
      pushToast('Enter your numeric answer before checking.', 'info');
      return;
    }

    const isCorrect = Math.abs(studentValue - expected) < 0.001;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    const nextMistakes = isCorrect
      ? mistakes
      : [...mistakes, { expected, actual: studentValue, prompt: promptText }];

    setCorrectCount(nextCorrect);
    setStreak(nextStreak);
    setBestStreak(nextBestStreak);
    setMistakes(nextMistakes);
    setFeedbackBanner({
      kind: isCorrect ? 'correct' : 'wrong',
      text: isCorrect
        ? `Exact! ${promptText} = ${expected}.`
        : `Your answer was ${studentValue}, expected ${expected}. Check the bead steps or try the next one carefully.`,
    });

    if (!roundActive) {
      // Free single-problem practice outside timed round
      return;
    }

    const nextIdx = questionIndex + 1;
    if (nextIdx >= QUESTIONS_PER_ROUND) {
      await finalizeRound(nextCorrect, nextBestStreak, nextMistakes);
      return;
    }

    setQuestionIndex(nextIdx);
    setShowStepsHint(false);
    setTypedAnswer('');
    setColumns(createEmptySoroban(decimalPlaces));
    if (mode === 'mental_flash') {
      triggerFlashSequence(selectedLevel, nextIdx + 2);
    } else {
      setProblem(generateAbacusProblem(selectedLevel, nextIdx + 3));
    }
  };

  const handleShowSolutionOnAbacus = () => {
    setColumns(encodeNumberToSoroban(problem.expectedAnswer, problem.decimalPlaces));
    setShowStepsHint(true);
  };

  return (
    <div className="space-y-5">
      {/* Compact Header Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Soroban Level
          </p>
          <p className="mt-1 font-display text-xl font-bold text-[#142B46] tabular-nums">
            Level {selectedLevel} <span className="text-xs font-medium text-slate-500">/ 12</span>
          </p>
          <p className="text-xs text-slate-600 truncate">{levelConfig.title}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Average Accuracy
          </p>
          <p className="mt-1 font-display text-xl font-bold text-[#3D6349] tabular-nums">
            {historySummary.avgAccuracyPct > 0 ? `${historySummary.avgAccuracyPct}%` : '—'}
          </p>
          <p className="text-xs text-slate-600 tabular-nums">
            {historySummary.totalSessions} session{historySummary.totalSessions === 1 ? '' : 's'} logged
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Best Accuracy Streak
          </p>
          <p className="mt-1 font-display text-xl font-bold text-[#142B46] tabular-nums">
            {Math.max(historySummary.bestStreak, bestStreak)}
          </p>
          <p className="text-xs text-slate-600">Consecutive accurate answers</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Abacus XP Earned
          </p>
          <p className="mt-1 font-display text-xl font-bold text-amber-700 tabular-nums">
            {historySummary.totalXp} XP
          </p>
          <p className="text-xs text-slate-600">Highest unlocked: L{historySummary.highestLevel}</p>
        </div>
      </div>

      {/* Mode Switcher + 12-Level Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'soroban_practice', label: 'Virtual Soroban Practice', icon: Sparkles },
                { id: 'mental_flash', label: 'Mental Flash (Anzan)', icon: Eye },
                { id: 'speed_drill', label: 'Speed & Accuracy Drill', icon: Zap },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMode(item.id);
                    setRoundActive(false);
                    setRoundSummary(null);
                    setFeedbackBanner(null);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#142B46] text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600" htmlFor="abacus-level-select">
              Curriculum Level:
            </label>
            <select
              id="abacus-level-select"
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(Number(e.target.value));
                setRoundActive(false);
                setRoundSummary(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {ABACUS_LEVELS.map((lvl) => (
                <option key={lvl.level} value={lvl.level}>
                  Level {lvl.level}: {lvl.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => startRound(mode)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6349] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b] whitespace-nowrap shrink-0"
            >
              <Play className="h-3.5 w-3.5" />
              {roundActive ? 'Restart 5-Q Round' : 'Start 5-Q Challenge'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 border-t border-slate-100 pt-2.5">
          <span className="font-semibold text-[#142B46]">Level {levelConfig.level} Objective:</span>{' '}
          {levelConfig.focus}
        </p>
      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left/Center: Virtual Soroban Frame or Flash/Drill Stage */}
        <div className="xl:col-span-8 space-y-4">
          {/* Active Prompt Bar */}
          <div className="rounded-xl border border-slate-200 bg-[#FAF4EC] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {roundActive
                  ? `Question ${questionIndex + 1} of ${QUESTIONS_PER_ROUND}`
                  : 'Free Interactive Practice'}
              </p>
              <p className="mt-0.5 font-display text-2xl font-bold text-[#142B46] tabular-nums">
                {mode === 'mental_flash'
                  ? flashIndex >= 0
                    ? 'Watch the flashing numbers...'
                    : flashReadyToAnswer
                      ? 'What was the total sum?'
                      : 'Press Start 5-Q Challenge to flash numbers'
                  : problem.prompt}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {roundActive && (
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-4 w-4 text-amber-600" />
                    Streak {streak}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="h-4 w-4 text-[#142B46]" />
                    {elapsedSec}s
                  </span>
                </div>
              )}
              {mode === 'soroban_practice' && (
                <button
                  type="button"
                  onClick={() => setShowStepsHint((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showStepsHint ? 'Hide Steps' : 'Bead Steps'}
                </button>
              )}
            </div>
          </div>

          {/* Interactive Virtual Soroban Board */}
          {mode === 'soroban_practice' && (
            <div className="rounded-2xl border-2 border-[#3E2723] bg-[#2D1B14] p-4 sm:p-5 text-white space-y-4">
              {/* Top Readout & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/15 pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-amber-200/75 font-semibold">
                    Live Soroban Readout
                  </p>
                  <p
                    data-testid="soroban-live-value"
                    className="font-mono text-3xl font-bold text-[#D6B66D] tabular-nums"
                  >
                    {decimalPlaces > 0
                      ? currentSorobanValue.toFixed(decimalPlaces)
                      : currentSorobanValue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-amber-200/20 bg-black/25 p-0.5 text-[11px] font-semibold">
                    {([0, 1, 2] as const).map((dp) => (
                      <button
                        key={dp}
                        type="button"
                        onClick={() => handleToggleDecimal(dp)}
                        className={`rounded-md px-2.5 py-1 transition-colors ${
                          decimalPlaces === dp
                            ? 'bg-[#D6B66D] text-[#142B46]'
                            : 'text-amber-100/80 hover:text-white'
                        }`}
                      >
                        {dp === 0 ? 'Whole' : dp === 1 ? '.1 Dec' : '.01 Dec'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setColumns(createEmptySoroban(decimalPlaces))}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-amber-50 hover:bg-white/20 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear Frame
                  </button>
                </div>
              </div>

              {/* Soroban Frame with Rods & Clickable Beads */}
              <div className="overflow-x-auto pb-1">
                <div
                  className="min-w-[460px] rounded-xl border-4 border-[#5D4037] bg-[#F5EAD9] p-3"
                  role="region"
                  aria-label="Interactive Virtual Soroban Frame"
                >
                  {/* Place Value Labels */}
                  <div
                    className="grid gap-2 mb-2 text-center"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((col) => (
                      <div key={col.label} className="space-y-0.5">
                        <p className="text-[11px] font-bold text-[#142B46]">{col.shortLabel}</p>
                        <p className="text-[10px] text-slate-600 truncate">{col.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Heaven Deck (5-value beads) */}
                  <div
                    className="grid gap-2 py-2 relative"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((col, colIdx) => (
                      <div
                        key={`h-${col.label}`}
                        className="relative flex flex-col items-center h-20 justify-between"
                      >
                        {/* Vertical bamboo rod */}
                        <div className="absolute inset-y-0 w-1.5 bg-[#8D6E63] rounded-full" />
                        <button
                          type="button"
                          onClick={() => handleHeavenClick(colIdx)}
                          aria-label={`${col.label} Heaven bead value 5 (${col.heavenActive ? 'active' : 'inactive'})`}
                          className={`relative z-10 w-12 h-7 rounded-full border-2 shadow-sm transition-transform duration-200 cursor-pointer flex items-center justify-center text-[10px] font-bold select-none ${
                            col.heavenActive
                              ? 'translate-y-11 bg-[#C85A32] border-[#7E3115] text-white ring-2 ring-[#D6B66D]'
                              : 'translate-y-0 bg-[#9C4A2B] border-[#5D2914] text-amber-100 hover:brightness-110'
                          }`}
                        >
                          5
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Reckoning Beam (with unit dot marker) */}
                  <div
                    className="grid gap-2 items-center bg-[#3E2723] h-4 rounded-sm my-1 px-1"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((col) => (
                      <div key={`beam-${col.label}`} className="flex justify-center">
                        {col.placeMultiplier === 1 && (
                          <span
                            title="Units Rod Dot"
                            className="h-2.5 w-2.5 rounded-full bg-[#FAF4EC] border border-[#D6B66D]"
                          />
                        )}
                        {col.placeMultiplier === 1000 && (
                          <span
                            title="Thousands Rod Dot"
                            className="h-2 w-2 rounded-full bg-[#D6B66D]/80"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Earth Deck (4 × 1-value beads per rod) */}
                  <div
                    className="grid gap-2 py-2 relative"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((col, colIdx) => (
                      <div
                        key={`e-${col.label}`}
                        className="relative flex flex-col items-center justify-between h-44 py-1"
                      >
                        <div className="absolute inset-y-0 w-1.5 bg-[#8D6E63] rounded-full" />
                        {([0, 1, 2, 3] as const).map((beadIdx) => {
                          const isActive = beadIdx < col.earthActiveCount;
                          return (
                            <button
                              key={beadIdx}
                              type="button"
                              onClick={() => handleEarthClick(colIdx, beadIdx)}
                              aria-label={`${col.label} Earth bead ${beadIdx + 1} (${isActive ? 'active' : 'inactive'})`}
                              className={`relative z-10 w-12 h-7 rounded-full border-2 shadow-sm transition-transform duration-200 cursor-pointer flex items-center justify-center text-[10px] font-bold select-none ${
                                isActive
                                  ? '-translate-y-2.5 bg-[#D6B66D] border-[#8B6B22] text-[#142B46] ring-2 ring-[#142B46]/25'
                                  : 'translate-y-3 bg-[#795548] border-[#4E342E] text-amber-100 hover:brightness-110'
                              }`}
                            >
                              1
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Column Digit Readout Footer */}
                  <div
                    className="grid gap-2 mt-2 pt-2 border-t border-[#D7C4A8] text-center"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
                  >
                    {columns.map((col) => (
                      <div
                        key={`d-${col.label}`}
                        className="rounded-md bg-white border border-slate-200 py-1 font-mono text-sm font-bold text-[#142B46] tabular-nums"
                      >
                        {getColumnDigit(col)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShowSolutionOnAbacus}
                  className="rounded-lg border border-amber-200/30 bg-white/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:bg-white/20 whitespace-nowrap shrink-0"
                >
                  Demonstrate Answer on Rods
                </button>
                <div className="flex items-center gap-2">
                  {!roundActive && (
                    <button
                      type="button"
                      onClick={() => {
                        setColumns(createEmptySoroban(decimalPlaces));
                        setProblem(generateAbacusProblem(selectedLevel, Math.floor(Math.random() * 500)));
                        setFeedbackBanner(null);
                      }}
                      className="rounded-lg border border-amber-200/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 whitespace-nowrap shrink-0"
                    >
                      New Practice Problem
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D6B66D] px-4 py-2 text-xs font-bold text-[#142B46] hover:bg-[#e1c47f] whitespace-nowrap shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Check Soroban Value
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mental Flash (Anzan) & Speed Drill Interactive Stage */}
          {mode !== 'soroban_practice' && (
            <div className="rounded-2xl border border-slate-200 bg-[#142B46] p-6 text-white space-y-5">
              {mode === 'mental_flash' ? (
                <div className="text-center space-y-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D6B66D]">
                    Mental Abacus (Anzan) Flash Stage
                  </p>
                  <div className="mx-auto flex h-32 w-56 items-center justify-center rounded-2xl border-2 border-[#D6B66D]/50 bg-[#0D1E33]">
                    {flashIndex >= 0 ? (
                      <span className="font-mono text-6xl font-extrabold text-white tabular-nums">
                        {flashSequence[flashIndex]}
                      </span>
                    ) : flashReadyToAnswer ? (
                      <span className="font-display text-xl font-bold text-[#D6B66D]">
                        Enter Total Sum
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 px-4">
                        Visualize beads moving as each number flashes
                      </span>
                    )}
                  </div>
                  {flashReadyToAnswer && (
                    <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                      <input
                        type="number"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCheckAnswer();
                        }}
                        placeholder="Sum..."
                        className="w-full rounded-lg border border-slate-500 bg-white px-3.5 py-2 text-center font-mono text-lg font-bold text-[#142B46]"
                      />
                      <button
                        type="button"
                        onClick={handleCheckAnswer}
                        className="rounded-lg bg-[#D6B66D] px-4 py-2.5 text-xs font-bold text-[#142B46] hover:bg-[#e5c983] whitespace-nowrap shrink-0"
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#D6B66D]">
                    Speed &amp; Accuracy Mental Calculation
                  </p>
                  <p className="font-mono text-4xl font-extrabold text-white tabular-nums">
                    {problem.prompt}
                  </p>
                  <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                    <input
                      type="number"
                      step="any"
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheckAnswer();
                      }}
                      placeholder="Type answer..."
                      className="w-full rounded-lg border border-slate-500 bg-white px-3.5 py-2 text-center font-mono text-lg font-bold text-[#142B46]"
                    />
                    <button
                      type="button"
                      onClick={handleCheckAnswer}
                      className="rounded-lg bg-[#D6B66D] px-4 py-2.5 text-xs font-bold text-[#142B46] hover:bg-[#e5c983] whitespace-nowrap shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Immediate Feedback Banner */}
          {feedbackBanner && (
            <div
              className={`rounded-xl border px-4 py-3 text-xs font-semibold ${
                feedbackBanner.kind === 'correct'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              {feedbackBanner.text}
            </div>
          )}

          {/* Completed Round Summary + AI Abacus Coach */}
          {roundSummary && (
            <div className="rounded-xl border border-[#3D6349]/30 bg-emerald-50/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#3D6349]" />
                  <h4 className="font-display text-sm font-bold text-[#142B46]">
                    Round Complete · AI Abacus Coach Analysis
                  </h4>
                </div>
                <span className="font-mono text-xs font-bold text-[#3D6349] tabular-nums">
                  {roundSummary.accuracyPct}% Accuracy · {roundSummary.avgSec}s/q · +{roundSummary.xpEarned} XP
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">{roundSummary.coachFeedback}</p>
              {roundSummary.mistakePatterns.length > 0 && (
                <ul className="space-y-1 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  {roundSummary.mistakePatterns.map((pat, i) => (
                    <li key={i}>• {pat}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {roundSummary.recommendedNextLevel !== selectedLevel && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel(roundSummary.recommendedNextLevel);
                      setRoundSummary(null);
                    }}
                    className="rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
                  >
                    Move to Recommended Level {roundSummary.recommendedNextLevel}
                  </button>
                )}
                <button
                  type="button"
                  disabled={savingSession}
                  onClick={() => startRound(mode)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Practice Another Round
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Step-by-Step Bead Guide & Recent AI Coach History */}
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#142B46]" />
              <h4 className="font-display text-sm font-bold text-[#142B46]">
                Step-by-Step Bead Guide
              </h4>
            </div>
            {showStepsHint ? (
              <ol className="space-y-2.5">
                {problem.steps.map((st) => (
                  <li
                    key={st.step}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#142B46]">
                      <span>
                        Step {st.step} · {st.columnLabel}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        → {st.resultingValue}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{st.action}</p>
                    <p className="text-[11px] font-medium text-[#3D6349]">{st.ruleUsed}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Click <span className="font-semibold text-[#142B46]">Bead Steps</span> if you want to
                see Small Friend (5-complement) or Big Friend (10-complement) moves for the current
                problem.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h4 className="font-display text-sm font-bold text-[#142B46]">
              Recent Abacus Sessions
            </h4>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500">
                Complete a 5-question challenge to receive personalized AI Abacus Coach guidance.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sessions.slice(0, 6).map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#142B46]">
                      <span>
                        Level {s.level} ({s.operation})
                      </span>
                      <span className="font-mono text-[#3D6349] tabular-nums">
                        {s.accuracyPct}% · +{s.xpEarned} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{s.coachFeedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
