import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Flame,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { InteractiveGameAsset } from '../../types/interactiveLearning';
import { GAME_FORMAT_CATALOG } from '../../utils/interactiveLearningEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface UniversalGameArenaProps {
  game: InteractiveGameAsset;
  token: string;
  studentId?: string;
  onAttemptSaved: () => Promise<void>;
  onClose: () => void;
}

function playFeedbackTone(positive: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = positive ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(positive ? 560 : 240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(positive ? 740 : 175, ctx.currentTime + 0.11);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch {
    // Optional sound
  }
}

function buildWordSearchGrid(words: string[]): { grid: string[][]; size: number } {
  const cleanWords = words
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8))
    .filter((w) => w.length >= 3);
  const size = 9;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  cleanWords.slice(0, 5).forEach((word, rowIdx) => {
    const row = (rowIdx * 2) % size;
    const startCol = Math.max(0, Math.min(size - word.length, rowIdx % 2 === 0 ? 0 : size - word.length));
    for (let i = 0; i < word.length; i += 1) {
      grid[row][startCol + i] = word[i];
    }
  });
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) {
        grid[r][c] = letters[(r * 7 + c * 11 + 5) % letters.length];
      }
    }
  }
  return { grid, size };
}

export const UniversalGameArena: React.FC<UniversalGameArenaProps> = ({
  game,
  token,
  studentId,
  onAttemptSaved,
  onClose,
}) => {
  const formatMeta = GAME_FORMAT_CATALOG[game.gameFormat];
  const mechanic = formatMeta?.mechanicFamily || 'choice';

  const [completedSummary, setCompletedSummary] = useState<{
    accuracyPct: number;
    correct: number;
    total: number;
    mistakes: string[];
    xpSaved: boolean;
  } | null>(null);
  const [streak, setStreak] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(game.timeLimitSec || 0);
  const startRef = useRef<number>(Date.now());

  // 1. Choice / Error Fix / Step-by-step state
  const [qIdx, setQIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [choiceCorrectCount, setChoiceCorrectCount] = useState(0);
  const [choiceMistakes, setChoiceMistakes] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  // 2. Classify (Drag & Drop / Concept Classification) state
  const categories = useMemo(() => {
    if (game.categories && game.categories.length > 0) return game.categories;
    return Array.from(new Set(game.items.map((it) => it.category || it.correctAnswer))).filter(Boolean);
  }, [game.categories, game.items]);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [classifySubmitted, setClassifySubmitted] = useState(false);

  // 3. Matching state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const shuffledRight = useMemo(() => {
    const arr = game.items.map((it) => ({
      id: it.id,
      text: it.pairRight || it.correctAnswer,
    }));
    return arr.slice().sort((a, b) => a.text.localeCompare(b.text));
  }, [game.items]);

  // 4. Memory Flip Cards state
  const memoryDeck = useMemo(() => {
    const cards: Array<{ uid: string; pairId: string; text: string; kind: 'term' | 'def' }> = [];
    game.items.slice(0, 6).forEach((it) => {
      cards.push({ uid: `${it.id}-a`, pairId: it.id, text: it.pairLeft || it.prompt, kind: 'term' });
      cards.push({ uid: `${it.id}-b`, pairId: it.id, text: it.pairRight || it.correctAnswer, kind: 'def' });
    });
    return cards.sort((a, b) => ((a.uid.charCodeAt(3) * 7 + a.text.length) % 19) - ((b.uid.charCodeAt(3) * 7 + b.text.length) % 19));
  }, [game.items]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [solvedPairIds, setSolvedPairIds] = useState<string[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // 5. Sequence Builder state (supports both 0-based and 1-based orderIndex cleanly)
  const expectedSeqIds = useMemo(
    () =>
      game.items
        .map((it, idx) => ({ id: it.id, rank: it.orderIndex ?? idx }))
        .sort((a, b) => a.rank - b.rank)
        .map((x) => x.id),
    [game.items],
  );
  const [seqOrder, setSeqOrder] = useState<string[]>(() =>
    game.items
      .slice()
      .sort((a, b) => a.prompt.localeCompare(b.prompt))
      .map((i) => i.id),
  );
  const [seqChecked, setSeqChecked] = useState(false);

  // 6. Crossword & Word Search state
  const [crosswordInputs, setCrosswordInputs] = useState<Record<string, string>>({});
  const [crosswordChecked, setCrosswordChecked] = useState(false);
  const wordSearchWords = useMemo(
    () => game.items.map((it) => it.correctAnswer.toUpperCase().replace(/[^A-Z]/g, '')),
    [game.items],
  );
  const wordSearch = useMemo(() => buildWordSearchGrid(wordSearchWords), [wordSearchWords]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<string[]>([]);

  // 7. Diagram Labelling state
  const [labelAssignments, setLabelAssignments] = useState<Record<string, string>>({});
  const [activePinId, setActivePinId] = useState<string | null>(game.items[0]?.id || null);
  const [labelsChecked, setLabelsChecked] = useState(false);

  // 8. Flashcards state
  const [flashIdx, setFlashIdx] = useState(0);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [flashSelfScore, setFlashSelfScore] = useState<Record<string, boolean>>({});

  // Timed challenge countdown
  useEffect(() => {
    if (game.gameFormat !== 'timed_challenge' || !game.timeLimitSec || completedSummary) return;
    setTimeLeftSec(game.timeLimitSec);
    const id = window.setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [game.id, game.gameFormat, game.timeLimitSec, completedSummary]);

  const saveAttempt = async (params: {
    status: 'in_progress' | 'completed';
    progressPct: number;
    accuracyPct: number;
    mistakes: string[];
  }) => {
    try {
      await apiRequest(
        '/api/interactive-learning/attempts',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            subject: game.subject,
            chapterId: game.chapterId,
            conceptId: game.conceptId,
            assetId: game.id,
            assetTitle: game.title,
            assetType: 'game',
            status: params.status,
            progressPct: params.progressPct,
            scorePct: params.accuracyPct,
            accuracyPct: params.accuracyPct,
            timeSpentSec: Math.max(8, Math.round((Date.now() - startRef.current) / 1000)),
            mistakes: params.mistakes,
          }),
        },
        token,
      );
      if (params.status === 'completed') {
        await onAttemptSaved();
      }
    } catch (err) {
      if (params.status === 'completed') {
        pushToast(err instanceof Error ? err.message : 'Unable to save game progress.', 'error');
      }
    }
  };

  const finishGame = async (correct: number, total: number, mistakes: string[]) => {
    const accuracyPct = Math.round((correct / Math.max(1, total)) * 100);
    setCompletedSummary({ accuracyPct, correct, total, mistakes, xpSaved: false });
    await saveAttempt({
      status: 'completed',
      progressPct: 100,
      accuracyPct,
      mistakes,
    });
    setCompletedSummary({ accuracyPct, correct, total, mistakes, xpSaved: true });
    pushToast(
      accuracyPct >= 75
        ? `Concept Mastered (${accuracyPct}% accuracy)!`
        : `Activity completed (${accuracyPct}% accuracy) — review mistakes to reach 75%+ mastery.`,
      accuracyPct >= 75 ? 'success' : 'info',
    );
  };

  const handleRestart = () => {
    setCompletedSummary(null);
    setStreak(0);
    setQIdx(0);
    setSelectedChoice(null);
    setChoiceCorrectCount(0);
    setChoiceMistakes([]);
    setShowHint(false);
    setPlacements({});
    setClassifySubmitted(false);
    setMatchedPairs({});
    setSelectedLeftId(null);
    setFlippedUids([]);
    setSolvedPairIds([]);
    setMemoryMoves(0);
    setSeqChecked(false);
    setCrosswordInputs({});
    setCrosswordChecked(false);
    setFoundWords([]);
    setSelectedCells([]);
    setLabelAssignments({});
    setLabelsChecked(false);
    setFlashIdx(0);
    setFlashFlipped(false);
    setFlashSelfScore({});
    startRef.current = Date.now();
  };

  const currentItem = game.items[qIdx] || game.items[0];

  const handleChoiceSelect = (opt: string) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(opt);
    const expected = currentItem.correctedText || currentItem.correctAnswer;
    const isCorrect = opt.trim().toLowerCase() === expected.trim().toLowerCase();
    playFeedbackTone(isCorrect);
    if (isCorrect) {
      setChoiceCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
      setChoiceMistakes((m) => [...m, `${currentItem.prompt} (expected: ${expected})`]);
    }
    const progress = Math.round(((qIdx + 1) / game.items.length) * 100);
    if (qIdx + 1 < game.items.length) {
      void saveAttempt({
        status: 'in_progress',
        progressPct: progress,
        accuracyPct: Math.round(((choiceCorrectCount + (isCorrect ? 1 : 0)) / (qIdx + 1)) * 100),
        mistakes: isCorrect ? choiceMistakes : [...choiceMistakes, currentItem.prompt],
      });
    }
  };

  const handleNextChoice = () => {
    if (qIdx + 1 >= game.items.length) {
      void finishGame(choiceCorrectCount, game.items.length, choiceMistakes);
    } else {
      setQIdx((i) => i + 1);
      setSelectedChoice(null);
      setShowHint(false);
    }
  };

  const handleMemoryCardClick = (uid: string, pairId: string) => {
    if (solvedPairIds.includes(pairId) || flippedUids.includes(uid) || flippedUids.length >= 2) {
      return;
    }
    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);
    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const first = memoryDeck.find((c) => c.uid === nextFlipped[0]);
      const second = memoryDeck.find((c) => c.uid === nextFlipped[1]);
      if (first && second && first.pairId === second.pairId) {
        playFeedbackTone(true);
        const nextSolved = [...solvedPairIds, first.pairId];
        setSolvedPairIds(nextSolved);
        setFlippedUids([]);
        setStreak((s) => s + 1);
        if (nextSolved.length >= Math.min(6, game.items.length)) {
          const idealMoves = nextSolved.length;
          const acc = Math.max(55, Math.min(100, Math.round((idealMoves / Math.max(idealMoves, memoryMoves + 1)) * 100)));
          void finishGame(Math.round((acc / 100) * nextSolved.length), nextSolved.length, []);
        }
      } else {
        playFeedbackTone(false);
        setStreak(0);
        window.setTimeout(() => setFlippedUids([]), 850);
      }
    }
  };

  const handleWordSearchCellToggle = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const next = selectedCells.includes(key)
      ? selectedCells.filter((k) => k !== key)
      : [...selectedCells, key];
    setSelectedCells(next);

    const formed = next
      .map((k) => {
        const [rr, cc] = k.split('-').map(Number);
        return wordSearch.grid[rr]?.[cc] || '';
      })
      .join('');
    const matched = wordSearchWords.find((w) => w === formed && !foundWords.includes(w));
    if (matched) {
      playFeedbackTone(true);
      const nextFound = [...foundWords, matched];
      setFoundWords(nextFound);
      setSelectedCells([]);
      setStreak((s) => s + 1);
      if (nextFound.length >= wordSearchWords.length) {
        void finishGame(nextFound.length, wordSearchWords.length, []);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="bg-[#142B46] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
            {formatMeta?.label || game.gameFormat} · Class {game.classLevel} {game.subject} · {game.difficulty}
          </p>
          <h3 className="font-display text-lg font-bold">{game.title}</h3>
          <p className="text-xs text-slate-300">{game.instructions}</p>
        </div>
        <div className="flex items-center gap-3">
          {game.gameFormat === 'timed_challenge' && timeLeftSec > 0 && !completedSummary && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-300/40 px-2.5 py-1 font-mono text-xs font-bold text-[#D6B66D] tabular-nums">
              <Clock className="h-3.5 w-3.5" />
              {timeLeftSec}s
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#D6B66D] tabular-nums">
            <Flame className="h-4 w-4" />
            Streak {streak}
          </span>
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 whitespace-nowrap shrink-0"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main Playable Body */}
      <div className="p-5 space-y-5">
        {completedSummary ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center space-y-4">
            <Trophy className="h-10 w-10 text-[#3D6349] mx-auto" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3D6349]">
                {completedSummary.accuracyPct >= 75 ? 'Concept Mastery Verified' : 'Revision Recommended'}
              </p>
              <h4 className="font-display text-2xl font-bold text-[#142B46] tabular-nums mt-1">
                {completedSummary.accuracyPct}% Accuracy ({completedSummary.correct}/{completedSummary.total})
              </h4>
              <p className="text-xs text-slate-600 mt-1">{game.answerKeySummary}</p>
            </div>
            {completedSummary.mistakes.length > 0 && (
              <div className="max-w-lg mx-auto text-left rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                <p className="text-xs font-bold text-amber-900">Focus Areas for Revision:</p>
                {completedSummary.mistakes.map((m, i) => (
                  <p key={i} className="text-xs text-amber-800">• {m}</p>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c]"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to Games Arena
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MECHANIC 1: DRAG & DROP / CONCEPT CLASSIFICATION */}
            {mechanic === 'classify' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Drag each concept card into its matching bucket (or tap a card, then tap a bucket).
                </p>
                <div className="flex flex-wrap gap-2">
                  {game.items
                    .filter((it) => !placements[it.id])
                    .map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        draggable
                        onDragStart={() => setActiveDragId(it.id)}
                        onClick={() => setActiveDragId(activeDragId === it.id ? null : it.id)}
                        className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-grab ${
                          activeDragId === it.id
                            ? 'border-[#142B46] bg-[#142B46] text-white'
                            : 'border-slate-300 bg-[#FAF4EC] text-[#142B46] hover:border-[#142B46]'
                        }`}
                      >
                        {it.prompt}
                      </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const placedItems = game.items.filter((it) => placements[it.id] === cat);
                    return (
                      <div
                        key={cat}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (activeDragId) {
                            setPlacements((p) => ({ ...p, [activeDragId]: cat }));
                            setActiveDragId(null);
                          }
                        }}
                        onClick={() => {
                          if (activeDragId) {
                            setPlacements((p) => ({ ...p, [activeDragId]: cat }));
                            setActiveDragId(null);
                          }
                        }}
                        className="min-h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 space-y-2 hover:border-[#142B46] transition-colors cursor-pointer"
                      >
                        <p className="text-xs font-bold text-[#142B46] border-b border-slate-200 pb-1.5">
                          {cat}
                        </p>
                        <div className="space-y-1.5">
                          {placedItems.map((it) => {
                            const expectedCat = it.category || it.correctAnswer;
                            const isCorrect = expectedCat.toLowerCase() === cat.toLowerCase();
                            return (
                              <div
                                key={it.id}
                                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                                  classifySubmitted
                                    ? isCorrect
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                      : 'border-rose-300 bg-rose-50 text-rose-900'
                                    : 'border-slate-200 bg-white text-slate-800'
                                }`}
                              >
                                <span>{it.prompt}</span>
                                {!classifySubmitted && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPlacements((p) => {
                                        const next = { ...p };
                                        delete next[it.id];
                                        return next;
                                      });
                                    }}
                                    className="text-[11px] text-slate-400 hover:text-rose-600 ml-2"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={Object.keys(placements).length < game.items.length}
                    onClick={() => {
                      setClassifySubmitted(true);
                      let correct = 0;
                      const mistakes: string[] = [];
                      game.items.forEach((it) => {
                        const expected = it.category || it.correctAnswer;
                        if ((placements[it.id] || '').toLowerCase() === expected.toLowerCase()) {
                          correct += 1;
                        } else {
                          mistakes.push(`${it.prompt} belongs in ${expected}`);
                        }
                      });
                      playFeedbackTone(correct >= Math.ceil(game.items.length * 0.75));
                      void finishGame(correct, game.items.length, mistakes);
                    }}
                    className="rounded-lg bg-[#3D6349] px-5 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    Verify Sorting ({Object.keys(placements).length}/{game.items.length})
                  </button>
                </div>
              </div>
            )}

            {/* MECHANIC 2: CONCEPT MATCHING */}
            {mechanic === 'match' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Select a concept on the left, then click its matching pair on the right.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {game.items.map((it) => {
                      const isMatched = Boolean(matchedPairs[it.id]);
                      const isSelected = selectedLeftId === it.id;
                      return (
                        <button
                          key={it.id}
                          type="button"
                          disabled={isMatched}
                          onClick={() => setSelectedLeftId(it.id)}
                          className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                            isMatched
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : isSelected
                                ? 'border-[#142B46] bg-[#142B46] text-white'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-[#142B46]'
                          }`}
                        >
                          {it.pairLeft || it.prompt}
                          {isMatched && <span className="block text-[11px] font-normal text-emerald-700 mt-0.5">→ {matchedPairs[it.id]}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {shuffledRight.map((right) => {
                      const used = Object.values(matchedPairs).includes(right.text);
                      return (
                        <button
                          key={right.id}
                          type="button"
                          disabled={used || !selectedLeftId}
                          onClick={() => {
                            if (!selectedLeftId) return;
                            const next = { ...matchedPairs, [selectedLeftId]: right.text };
                            setMatchedPairs(next);
                            setSelectedLeftId(null);
                            if (Object.keys(next).length >= game.items.length) {
                              let correct = 0;
                              const mistakes: string[] = [];
                              game.items.forEach((it) => {
                                const expected = it.pairRight || it.correctAnswer;
                                if (next[it.id] === expected) correct += 1;
                                else mistakes.push(`${it.pairLeft || it.prompt} → ${expected}`);
                              });
                              playFeedbackTone(correct >= Math.ceil(game.items.length * 0.75));
                              void finishGame(correct, game.items.length, mistakes);
                            }
                          }}
                          className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs font-medium transition-colors ${
                            used
                              ? 'border-slate-100 bg-slate-50 text-slate-400'
                              : 'border-slate-200 bg-[#FAF4EC] text-[#142B46] hover:border-[#142B46]'
                          }`}
                        >
                          {right.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* MECHANIC 3: MEMORY FLIP CARDS */}
            {mechanic === 'memory' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
                  <span>Matched pairs: <strong>{solvedPairIds.length}/{Math.min(6, game.items.length)}</strong></span>
                  <span>Moves: <strong>{memoryMoves}</strong></span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {memoryDeck.map((card) => {
                    const isRevealed =
                      solvedPairIds.includes(card.pairId) || flippedUids.includes(card.uid);
                    return (
                      <button
                        key={card.uid}
                        type="button"
                        onClick={() => handleMemoryCardClick(card.uid, card.pairId)}
                        className={`h-24 rounded-xl border p-3 text-center flex items-center justify-center text-xs font-semibold transition-all ${
                          solvedPairIds.includes(card.pairId)
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : isRevealed
                              ? 'border-[#142B46] bg-[#FAF4EC] text-[#142B46]'
                              : 'border-[#142B46]/30 bg-[#142B46] text-[#D6B66D] hover:bg-[#1d3b5e]'
                        }`}
                      >
                        {isRevealed ? card.text : 'Flip Card'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MECHANIC 4: SEQUENCE BUILDER */}
            {mechanic === 'sequence' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Arrange the steps in exact chronological or scientific order using the Up / Down controls.
                </p>
                <div className="space-y-2">
                  {seqOrder.map((id, idx) => {
                    const item = game.items.find((i) => i.id === id)!;
                    const isRightSpot = seqChecked && expectedSeqIds[idx] === id;
                    return (
                      <div
                        key={id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                          seqChecked
                            ? isRightSpot
                              ? 'border-emerald-300 bg-emerald-50'
                              : 'border-rose-300 bg-rose-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-md bg-[#142B46] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-800">{item.prompt}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0 || seqChecked}
                            onClick={() => {
                              const next = seqOrder.slice();
                              [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                              setSeqOrder(next);
                            }}
                            className="rounded border border-slate-300 p-1 text-slate-600 disabled:opacity-30"
                            aria-label="Move step up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === seqOrder.length - 1 || seqChecked}
                            onClick={() => {
                              const next = seqOrder.slice();
                              [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                              setSeqOrder(next);
                            }}
                            className="rounded border border-slate-300 p-1 text-slate-600 disabled:opacity-30"
                            aria-label="Move step down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSeqChecked(true);
                      let correct = 0;
                      const mistakes: string[] = [];
                      seqOrder.forEach((id, idx) => {
                        const it = game.items.find((i) => i.id === id)!;
                        if (expectedSeqIds[idx] === id) correct += 1;
                        else {
                          const expectedStepNum = expectedSeqIds.indexOf(id) + 1;
                          mistakes.push(`Step ${expectedStepNum}: ${it.prompt}`);
                        }
                      });
                      playFeedbackTone(correct === seqOrder.length);
                      void finishGame(correct, seqOrder.length, mistakes);
                    }}
                    className="rounded-lg bg-[#3D6349] px-5 py-2 text-xs font-semibold text-white"
                  >
                    Verify Sequence Order
                  </button>
                </div>
              </div>
            )}

            {/* MECHANIC 5: CROSSWORD & WORD SEARCH */}
            {mechanic === 'grid_word' && game.gameFormat === 'crossword' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Solve each chapter clue below. Live letter boxes show the exact word length.
                </p>
                <div className="space-y-3">
                  {game.items.map((it, idx) => {
                    const ans = it.correctAnswer.toUpperCase().replace(/[^A-Z]/g, '');
                    const val = (crosswordInputs[it.id] || '').toUpperCase();
                    const isExact = val === ans;
                    return (
                      <div key={it.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                        <p className="text-xs font-semibold text-[#142B46]">
                          {idx + 1}. {it.clue || it.prompt} <span className="text-slate-500">({ans.length} letters)</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength={ans.length}
                            value={val}
                            onChange={(e) =>
                              setCrosswordInputs((prev) => ({
                                ...prev,
                                [it.id]: e.target.value.toUpperCase().replace(/[^A-Z]/g, ''),
                              }))
                            }
                            placeholder={`Type ${ans.length}-letter term`}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-[#142B46] uppercase w-48"
                          />
                          <div className="flex gap-1">
                            {Array.from({ length: ans.length }).map((_, li) => (
                              <span
                                key={li}
                                className={`h-8 w-8 rounded border font-mono text-xs font-bold flex items-center justify-center ${
                                  crosswordChecked
                                    ? isExact
                                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                                      : 'border-rose-300 bg-rose-50 text-rose-900'
                                    : 'border-slate-300 bg-white text-[#142B46]'
                                }`}
                              >
                                {val[li] || ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCrosswordChecked(true);
                      let correct = 0;
                      const mistakes: string[] = [];
                      game.items.forEach((it) => {
                        const ans = it.correctAnswer.toUpperCase().replace(/[^A-Z]/g, '');
                        const val = (crosswordInputs[it.id] || '').toUpperCase().trim();
                        if (val === ans) correct += 1;
                        else mistakes.push(`${it.clue || it.prompt} → ${ans}`);
                      });
                      playFeedbackTone(correct >= Math.ceil(game.items.length * 0.75));
                      void finishGame(correct, game.items.length, mistakes);
                    }}
                    className="rounded-lg bg-[#3D6349] px-5 py-2 text-xs font-semibold text-white"
                  >
                    Check Crossword Answers
                  </button>
                </div>
              </div>
            )}

            {mechanic === 'grid_word' && game.gameFormat === 'word_search' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-7 overflow-x-auto">
                  <div
                    className="inline-grid gap-1 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    style={{ gridTemplateColumns: `repeat(${wordSearch.size}, 36px)` }}
                  >
                    {wordSearch.grid.map((row, r) =>
                      row.map((ch, c) => {
                        const key = `${r}-${c}`;
                        const active = selectedCells.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleWordSearchCellToggle(r, c)}
                            className={`h-9 w-9 rounded-md border font-mono text-xs font-bold transition-colors ${
                              active
                                ? 'border-[#142B46] bg-[#142B46] text-[#D6B66D]'
                                : 'border-slate-200 bg-white text-[#142B46] hover:bg-[#FAF4EC]'
                            }`}
                          >
                            {ch}
                          </button>
                        );
                      }),
                    )}
                  </div>
                </div>
                <div className="md:col-span-5 space-y-3">
                  <p className="text-xs font-bold text-[#142B46]">
                    Tap letters in order to find ({foundWords.length}/{wordSearchWords.length}):
                  </p>
                  <div className="space-y-1.5">
                    {game.items.map((it) => {
                      const clean = it.correctAnswer.toUpperCase().replace(/[^A-Z]/g, '');
                      const done = foundWords.includes(clean);
                      return (
                        <div
                          key={it.id}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            done
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 line-through'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <strong className="font-mono">{clean}</strong> — {it.hint || it.prompt}
                        </div>
                      );
                    })}
                  </div>
                  {selectedCells.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedCells([])}
                      className="text-xs font-semibold text-slate-500 underline"
                    >
                      Clear selected letters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MECHANIC 6: DIAGRAM LABELLING */}
            {mechanic === 'label' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-7 rounded-xl border border-slate-200 bg-[#FAF4EC] p-4 relative min-h-64">
                  <svg viewBox="0 0 360 220" className="w-full h-56" role="img" aria-label="Interactive Diagram Hotspots">
                    {/* Stylized biological/structural diagram canvas */}
                    <rect x="20" y="20" width="320" height="180" rx="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                    <path d="M 80 155 C 120 65, 240 65, 285 145 C 240 190, 130 190, 80 155 Z" fill="#DCFCE7" stroke="#3D6349" strokeWidth="2" />
                    <path d="M 80 155 Q 185 130 285 145" fill="none" stroke="#166534" strokeWidth="2" />
                    {game.items.map((it, idx) => {
                      const x = ((it.xPct ?? 25 + idx * 18) / 100) * 320 + 20;
                      const y = ((it.yPct ?? 35 + (idx % 2) * 35) / 100) * 180 + 20;
                      const assigned = labelAssignments[it.id];
                      const active = activePinId === it.id;
                      return (
                        <g
                          key={it.id}
                          onClick={() => setActivePinId(it.id)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={active ? 15 : 12}
                            fill={assigned ? '#3D6349' : active ? '#142B46' : '#D6B66D'}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text x={x - 3.5} y={y + 4} className="text-[11px] font-bold fill-white">
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="md:col-span-5 space-y-3">
                  <p className="text-xs font-bold text-[#142B46]">Assign Label to Each Numbered Pin:</p>
                  {game.items.map((it, idx) => (
                    <div
                      key={it.id}
                      onClick={() => setActivePinId(it.id)}
                      className={`rounded-lg border p-2.5 space-y-1.5 cursor-pointer ${
                        activePinId === it.id ? 'border-[#142B46] bg-[#FAF4EC]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800">
                        Pin #{idx + 1}: {it.prompt}
                      </p>
                      <select
                        value={labelAssignments[it.id] || ''}
                        onChange={(e) =>
                          setLabelAssignments((prev) => ({ ...prev, [it.id]: e.target.value }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      >
                        <option value="">Select label...</option>
                        {(it.options && it.options.length > 0
                          ? it.options
                          : game.items.map((x) => x.correctAnswer)
                        ).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={Object.keys(labelAssignments).length < game.items.length}
                    onClick={() => {
                      setLabelsChecked(true);
                      let correct = 0;
                      const mistakes: string[] = [];
                      game.items.forEach((it) => {
                        if (labelAssignments[it.id] === it.correctAnswer) correct += 1;
                        else mistakes.push(`${it.prompt} → ${it.correctAnswer}`);
                      });
                      playFeedbackTone(correct >= Math.ceil(game.items.length * 0.75));
                      void finishGame(correct, game.items.length, mistakes);
                    }}
                    className="w-full rounded-lg bg-[#3D6349] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  >
                    {labelsChecked ? 'Verified' : 'Verify Diagram Labels'}
                  </button>
                </div>
              </div>
            )}

            {/* MECHANIC 7: ACTIVE RECALL FLASHCARDS */}
            {mechanic === 'flashcard' && (
              <div className="max-w-xl mx-auto space-y-4 text-center">
                <p className="text-xs text-slate-500 tabular-nums">
                  Card {flashIdx + 1} of {game.items.length}
                </p>
                <div
                  onClick={() => setFlashFlipped((f) => !f)}
                  className="min-h-48 rounded-2xl border-2 border-[#142B46]/20 bg-[#FAF4EC] p-6 flex flex-col items-center justify-center cursor-pointer space-y-3"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3D6349]">
                    {flashFlipped ? 'Answer & Concept Explanation' : 'Tap Card to Reveal Answer'}
                  </span>
                  <p className="font-display text-lg font-bold text-[#142B46]">
                    {flashFlipped
                      ? game.items[flashIdx].correctAnswer
                      : game.items[flashIdx].prompt}
                  </p>
                  {flashFlipped && (
                    <p className="text-xs text-slate-700">{game.items[flashIdx].explanation}</p>
                  )}
                </div>
                {flashFlipped && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextScore = { ...flashSelfScore, [game.items[flashIdx].id]: false };
                        setFlashSelfScore(nextScore);
                        setFlashFlipped(false);
                        if (flashIdx + 1 >= game.items.length) {
                          const correct = Object.values(nextScore).filter(Boolean).length;
                          void finishGame(correct, game.items.length, []);
                        } else {
                          setFlashIdx((i) => i + 1);
                        }
                      }}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900"
                    >
                      Needs More Practice
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playFeedbackTone(true);
                        const nextScore = { ...flashSelfScore, [game.items[flashIdx].id]: true };
                        setFlashSelfScore(nextScore);
                        setFlashFlipped(false);
                        if (flashIdx + 1 >= game.items.length) {
                          const correct = Object.values(nextScore).filter(Boolean).length;
                          void finishGame(correct, game.items.length, []);
                        } else {
                          setFlashIdx((i) => i + 1);
                        }
                      }}
                      className="rounded-lg bg-[#3D6349] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Got It Right
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MECHANIC 8 & 9: CHOICE / DETECTIVE / MATH / SCENARIO / ERROR IDENTIFICATION */}
            {(mechanic === 'choice' || mechanic === 'error_fix') && currentItem && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-600 tabular-nums">
                  <span>
                    Challenge <strong>{qIdx + 1}</strong> of <strong>{game.items.length}</strong>
                  </span>
                  {currentItem.hint && (
                    <button
                      type="button"
                      onClick={() => setShowHint((h) => !h)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#142B46] hover:underline"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-[#FAF4EC] p-4 space-y-2">
                  {mechanic === 'error_fix' && currentItem.errorText && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-900">
                      Statement to Fix: <strong>“{currentItem.errorText}”</strong>
                    </div>
                  )}
                  <p className="font-display text-base font-bold text-[#142B46]">{currentItem.prompt}</p>
                  {showHint && currentItem.hint && (
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                      Hint: {currentItem.hint}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(currentItem.options && currentItem.options.length > 0
                    ? currentItem.options
                    : [currentItem.correctAnswer, 'None of the above']
                  ).map((opt) => {
                    const expected = currentItem.correctedText || currentItem.correctAnswer;
                    const isSelected = selectedChoice === opt;
                    const isRight = opt.trim().toLowerCase() === expected.trim().toLowerCase();
                    let cls = 'border-slate-200 bg-white text-slate-800 hover:border-[#142B46]';
                    if (selectedChoice !== null) {
                      if (isRight) cls = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                      else if (isSelected) cls = 'border-rose-300 bg-rose-50 text-rose-900';
                      else cls = 'border-slate-200 bg-slate-50 text-slate-400';
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleChoiceSelect(opt)}
                        className={`text-left rounded-xl border px-4 py-3 text-xs font-semibold transition-colors flex items-center justify-between gap-2 ${cls}`}
                      >
                        <span>{opt}</span>
                        {selectedChoice !== null && isRight && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                        )}
                        {selectedChoice !== null && isSelected && !isRight && (
                          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedChoice !== null && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-700 flex-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#3D6349] inline mr-1" />
                      <strong>Explanation:</strong> {currentItem.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={handleNextChoice}
                      className="rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
                    >
                      {qIdx + 1 >= game.items.length ? 'Finish & Save Score' : 'Next Challenge'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
