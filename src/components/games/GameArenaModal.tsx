import React, { useCallback, useEffect, useState } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import type { CognitiveAttemptRecord, CognitiveGameDefinition } from '../../types';
import { AGE_WISE_LEVEL_BANDS } from '../../utils/cognitiveGamesCatalog';
import { isSoundMuted, setSoundMuted } from '../../utils/soundFx';
import { GameThumbnailGraphic } from './GameThumbnailGraphic';
import {
  ColourConflictGame,
  FocusTrailGame,
  ReactionControlGame,
  ReverseRuleGame,
  SpotTheDifferenceGame,
  VisualScanningGame,
} from './engines/AttentionAndSpeedGames';
import {
  MemoryMatchGame,
  NumberRecallGame,
  PictureMemoryGame,
  SequenceRecallGame,
  StorySequenceGame,
  WordRecallGame,
} from './engines/MemoryGames';
import {
  ChessTacticsGame,
  LogicReasoningGame,
  PerceptionVisualGame,
  SudokuChallengeGame,
  TowerOfHanoiGame,
} from './engines/PerceptionAndLogicGames';
import {
  PhonicsSoundMatchGame,
  SyllableWordBuilderGame,
  TableFactorGridGame,
  TimesTablesSprintGame,
} from './engines/SkillTargetedGames';
import type { GameRoundResult } from './engines/gameEngineTypes';

interface GameArenaModalProps {
  game: CognitiveGameDefinition;
  initialLevel: 1 | 2 | 3 | 4 | 5;
  studentName: string;
  studentClass: string;
  priorAttempts: CognitiveAttemptRecord[];
  lang: 'en' | 'hi';
  challengeTag: 'daily' | 'weekly' | 'assigned' | 'practice';
  autoStart?: boolean;
  onSaveAttempt: (result: GameRoundResult & { difficultyLevel: 1 | 2 | 3 | 4 | 5 }) => Promise<void>;
  onClose: () => void;
}

type ArenaState = 'TITLE_MENU' | 'PLAYING' | 'ROUND_SUMMARY';

export const GameArenaModal: React.FC<GameArenaModalProps> = ({
  game,
  initialLevel,
  studentName,
  studentClass,
  priorAttempts,
  lang,
  challengeTag,
  autoStart = false,
  onSaveAttempt,
  onClose,
}) => {
  const [arenaState, setArenaState] = useState<ArenaState>(autoStart ? 'PLAYING' : 'TITLE_MENU');
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(initialLevel);
  const [runKey, setRunKey] = useState(0);
  const [muted, setMuted] = useState(isSoundMuted());
  const [hud, setHud] = useState({ progressText: 'Ready', score: 0, errors: 0 });
  const [elapsedSec, setElapsedSec] = useState(0);
  const [result, setResult] = useState<GameRoundResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  const levelInfo = AGE_WISE_LEVEL_BANDS.find((b) => b.level === level) ?? AGE_WISE_LEVEL_BANDS[2];

  useEffect(() => {
    document.body.dataset.gameState =
      arenaState === 'TITLE_MENU'
        ? 'title'
        : arenaState === 'PLAYING'
          ? 'playing'
          : 'gameover';
    return () => {
      delete document.body.dataset.gameState;
    };
  }, [arenaState]);

  useEffect(() => {
    if (arenaState !== 'PLAYING') return;
    setElapsedSec(0);
    const timer = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [arenaState, runKey]);

  const handleStart = useCallback(() => {
    setResult(null);
    setSaveNote(null);
    setHud({ progressText: '0', score: 0, errors: 0 });
    setRunKey((k) => k + 1);
    setArenaState('PLAYING');
  }, []);

  useEffect(() => {
    if (arenaState !== 'TITLE_MENU') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [arenaState, handleStart]);

  const handleHudUpdate = useCallback(
    (nextHud: { progressText: string; score: number; errors: number }) => {
      setHud(nextHud);
    },
    [],
  );

  const handleFinish = useCallback(
    async (roundResult: GameRoundResult) => {
      setResult(roundResult);
      setArenaState('ROUND_SUMMARY');
      setSaving(true);
      try {
        await onSaveAttempt({ ...roundResult, difficultyLevel: level });
        setSaveNote('Practice session saved to Cognitive Practice Profile.');
      } catch {
        setSaveNote('Saved offline to local queue — will sync automatically when connected.');
      } finally {
        setSaving(false);
      }
    },
    [level, onSaveAttempt],
  );

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setSoundMuted(next);
  }

  function renderPlayableEngine() {
    const engineKey = `${game.id}-${level}-${runKey}`;
    const props = {
      gameId: game.id,
      level,
      lang,
      onHudUpdate: handleHudUpdate,
      onFinish: (res: GameRoundResult) => void handleFinish(res),
    };

    switch (game.id) {
      case 'spot-the-difference':
        return <SpotTheDifferenceGame key={engineKey} {...props} />;
      case 'target-finder':
      case 'symbol-hunter':
      case 'focus-filter':
        return <VisualScanningGame key={engineKey} {...props} />;
      case 'focus-trail':
        return <FocusTrailGame key={engineKey} {...props} />;
      case 'colour-conflict':
        return <ColourConflictGame key={engineKey} {...props} />;
      case 'go-no-go':
      case 'quick-reaction':
        return <ReactionControlGame key={engineKey} {...props} />;
      case 'reverse-rule':
        return <ReverseRuleGame key={engineKey} {...props} />;
      case 'memory-match':
        return <MemoryMatchGame key={engineKey} {...props} />;
      case 'sequence-recall':
        return <SequenceRecallGame key={engineKey} {...props} />;
      case 'picture-memory':
        return <PictureMemoryGame key={engineKey} {...props} />;
      case 'number-recall':
        return <NumberRecallGame key={engineKey} {...props} />;
      case 'word-recall':
        return <WordRecallGame key={engineKey} {...props} />;
      case 'story-sequence':
        return <StorySequenceGame key={engineKey} {...props} />;
      case 'shape-rotation':
      case 'pattern-detective':
      case 'mirror-image':
      case 'hidden-figures':
      case 'spatial-builder':
        return <PerceptionVisualGame key={engineKey} {...props} />;
      case 'sudoku-challenge':
        return <SudokuChallengeGame key={engineKey} {...props} />;
      case 'chess-tactics':
        return <ChessTacticsGame key={engineKey} {...props} />;
      case 'tower-of-hanoi':
        return <TowerOfHanoiGame key={engineKey} {...props} />;
      case 'phonics-sound-match':
        return <PhonicsSoundMatchGame key={engineKey} {...props} />;
      case 'syllable-word-builder':
        return <SyllableWordBuilderGame key={engineKey} {...props} />;
      case 'times-tables-sprint':
        return <TimesTablesSprintGame key={engineKey} {...props} />;
      case 'table-factor-grid':
        return <TableFactorGridGame key={engineKey} {...props} />;
      case 'logic-escape':
      case 'number-detective':
      default:
        return <LogicReasoningGame key={engineKey} {...props} />;
    }
  }

  const gameHistory = priorAttempts.filter((a) => a.gameId === game.id);
  const priorAvg =
    gameHistory.length > 0
      ? Math.round(gameHistory.reduce((s, a) => s + a.accuracyPct, 0) / gameHistory.length)
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-arena-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-auto">
        {/* Game Shell Top HUD */}
        <div className="border-b border-slate-200 bg-slate-900 px-6 py-4 text-white flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-mono text-slate-300">
              #{game.catalogNumber} · {game.category} · Level {level} ({levelInfo.ageBand})
            </p>
            <h2 id="game-arena-heading" className="font-display text-lg font-bold truncate">
              {lang === 'hi' ? `${game.title} (${game.titleHi})` : game.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {arenaState === 'PLAYING' && (
              <div className="hidden sm:flex items-center gap-4 mr-3 font-mono text-xs tabular-nums text-slate-200">
                <span>Progress: {hud.progressText}</span>
                <span>Time: {elapsedSec}s</span>
                <span>Errors: {hud.errors}</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
              className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            {arenaState === 'PLAYING' && (
              <button
                type="button"
                onClick={handleStart}
                aria-label="Restart round"
                className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close game arena"
              className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body by GameState */}
        <div className="p-6">
          {arenaState === 'TITLE_MENU' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-5">
                  <GameThumbnailGraphic gameId={game.id} category={game.category} />
                </div>
                <div className="md:col-span-7 space-y-2">
                  <p className="text-xs font-semibold text-blue-900">
                    {studentName} · Class {studentClass} ·{' '}
                    {challengeTag === 'daily'
                      ? 'Daily Cognitive Challenge'
                      : challengeTag === 'weekly'
                        ? 'Weekly Memory Challenge'
                        : challengeTag === 'assigned'
                          ? 'Teacher-Assigned Activity'
                          : 'Adaptive Cognitive Practice'}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {lang === 'hi' ? game.instructionsHi : game.instructionsEn}
                  </p>
                  <p className="text-xs text-slate-500">
                    Develops: {game.develops.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="arena-level-select"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Adaptive Difficulty Level (Recommended Level {initialLevel})
                  </label>
                  <select
                    id="arena-level-select"
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900"
                  >
                    {AGE_WISE_LEVEL_BANDS.map((band) => (
                      <option key={band.level} value={band.level}>
                        Level {band.level} ({band.ageBand}) — {band.complexitySummary}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  data-start="true"
                  onClick={handleStart}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                >
                  <Play className="h-4 w-4" />
                  Start Game
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                Practice-performance indicator only — game results track your personal progress and
                never penalise or directly modify OLQ or Learners Scores.
              </p>
            </div>
          )}

          {arenaState === 'PLAYING' && (
            <div className="space-y-4">
              <div className="sm:hidden flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">
                <span>Progress: {hud.progressText}</span>
                <span>Time: {elapsedSec}s</span>
                <span>Errors: {hud.errors}</span>
              </div>
              {renderPlayableEngine()}
            </div>
          )}

          {arenaState === 'ROUND_SUMMARY' && result && (
            <div className="space-y-5 text-center py-2">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Trophy className="h-6 w-6" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Practice Round Complete
                </h3>
                <p className="text-sm text-slate-600 mt-1">{result.summaryDetail}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-medium text-slate-500">Accuracy</p>
                  <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                    {result.accuracyPct}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-medium text-slate-500">Completion Time</p>
                  <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                    {result.completionTimeSec}s
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-medium text-slate-500">
                    {result.reactionTimeMs ? 'Median Reaction' : 'Error Count'}
                  </p>
                  <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                    {result.reactionTimeMs ? `${result.reactionTimeMs} ms` : result.errorCount}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <p className="text-[11px] font-medium text-slate-500">Self-Comparison</p>
                  <p className="font-mono text-sm font-bold text-blue-900 tabular-nums mt-1">
                    {priorAvg !== null
                      ? `${result.accuracyPct - priorAvg >= 0 ? '+' : ''}${result.accuracyPct - priorAvg}% vs avg`
                      : 'Baseline Set'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600">
                {saving
                  ? 'Saving practice metrics to Student Cognitive Profile...'
                  : saveNote ||
                    (result.accuracyPct >= 85 && level < 5
                      ? `Adaptive Engine Recommendation: Ready for Level ${level + 1} next round!`
                      : 'Adaptive Engine Recommendation: Keep practising steadily at your own pace.')}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleStart}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                >
                  Return to Catalogue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
