import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  RefreshCw,
} from 'lucide-react';
import type { VcipBrainGymLog, VcipLanguage } from '../../types/vcip';
import {
  DAILY_BRAIN_GYM_DOMAINS,
  buildDailyBrainGymSelection,
  getDailyBrainGymDomainList,
  summarizeDailyBrainGymProgress,
} from '../../utils/dailyBrainGymEngine';
import { apiRequest } from '../../utils/api';
import { MatrixCellSvg, SpatialVisualSvg } from './VcipSvgVisuals';

interface StudentDashboardBrainGymProps {
  token: string;
  studentId: string;
  studentName: string;
  classSection: string;
  classLevel: number;
  todayDateKey: string;
  logs: VcipBrainGymLog[];
  onRefresh: () => Promise<void>;
  onOpenFullBrainGym: () => void;
}

export const StudentDashboardBrainGym: React.FC<StudentDashboardBrainGymProps> = ({
  token,
  studentId,
  studentName,
  classSection,
  classLevel,
  todayDateKey,
  logs,
  onRefresh,
  onOpenFullBrainGym,
}) => {
  const [language, setLanguage] = useState<VcipLanguage>('en');
  const [variantNonce, setVariantNonce] = useState('base');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [selectedChoice, setSelectedChoice] = useState<Record<number, number>>({});
  const [memHidden, setMemHidden] = useState(false);
  const [memInput, setMemInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  const selection = useMemo(
    () =>
      buildDailyBrainGymSelection({
        classLevel,
        studentId,
        dateKey: todayDateKey,
        language,
        variantNonce,
      }),
    [classLevel, studentId, todayDateKey, language, variantNonce],
  );

  const progress = useMemo(
    () => summarizeDailyBrainGymProgress(logs, todayDateKey),
    [logs, todayDateKey],
  );

  const solvedCount = Object.keys(results).length;
  const correctCount = Object.values(results).filter(Boolean).length;
  const allFiveDone = solvedCount === DAILY_BRAIN_GYM_DOMAINS.length;

  function pickChoice(stepIdx: number, optionIdx: number, correctIdx: number) {
    setSelectedChoice((prev) => ({ ...prev, [stepIdx]: optionIdx }));
    setResults((prev) => ({ ...prev, [stepIdx]: optionIdx === correctIdx }));
  }

  function handleCheckMemory() {
    const cleaned = memInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const expected = selection.memory.expectedAnswer.join('');
    setResults((prev) => ({ ...prev, 1: cleaned === expected }));
  }

  function handleGoNextUnsolved() {
    const nextIdx = DAILY_BRAIN_GYM_DOMAINS.findIndex(
      (d, idx) => idx > activeIndex && results[idx] === undefined,
    );
    if (nextIdx >= 0) {
      setActiveIndex(nextIdx);
    } else {
      const anyUnsolved = DAILY_BRAIN_GYM_DOMAINS.findIndex((_, idx) => results[idx] === undefined);
      if (anyUnsolved >= 0) setActiveIndex(anyUnsolved);
    }
  }

  function handleResetFreshSet() {
    setVariantNonce(`r-${Date.now()}`);
    setActiveIndex(0);
    setResults({});
    setSelectedChoice({});
    setMemHidden(false);
    setMemInput('');
    setSaveMessage(null);
  }

  async function handleLogTodaySession() {
    setSaving(true);
    setSaveMessage(null);
    const durationSec = Math.max(20, Math.round((Date.now() - startedAt) / 1000));
    try {
      await apiRequest(
        '/api/vcip/brain-gym',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId,
            dateKey: todayDateKey,
            completedChallenges: getDailyBrainGymDomainList(),
            correctCount,
            totalCount: DAILY_BRAIN_GYM_DOMAINS.length,
            durationSec,
          }),
        },
        token,
      );
      setSaveMessage(
        `Today’s 5-exercise Daily Brain Gym logged (${correctCount}/5 correct). Practice logs stay separate from formal VCIP scores.`,
      );
      await onRefresh();
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Unable to save Daily Brain Gym session.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="Daily Brain Gym"
      data-testid="student-dashboard-brain-gym"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Top Section Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
            <span className="font-semibold text-blue-900">Daily Brain Gym</span>
            <span aria-hidden="true">·</span>
            <span>Class {classSection}</span>
            <span aria-hidden="true">·</span>
            <span>Practice only (separate from formal VCIP)</span>
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Today’s 5 Quick Cognitive Exercises ({todayDateKey})
          </h2>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-700 whitespace-nowrap">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
              <Flame className="h-4 w-4 text-amber-600" />
              {progress.currentStreak}d streak
            </span>
            <span className="text-slate-300" aria-hidden="true">|</span>
            <span>{progress.daysLast7}/7d</span>
            <span className="hidden xl:inline text-slate-500 font-sans">· {progress.milestoneLabel}</span>
          </div>

          <div className="inline-flex items-center rounded-lg bg-slate-200/70 p-0.5 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                language === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenFullBrainGym}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0"
          >
            Full VCIP Studio <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 5-Domain Exercise Selector Strip */}
      <div className="border-b border-slate-200 px-6 py-3.5 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {DAILY_BRAIN_GYM_DOMAINS.map((item) => {
            const isActive = activeIndex === item.index;
            const isDone = results[item.index] !== undefined;
            const isCorrect = results[item.index] === true;
            return (
              <button
                key={item.domain}
                type="button"
                onClick={() => setActiveIndex(item.index)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'border-blue-800 bg-blue-50/60'
                    : isDone
                      ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-slate-500">
                  <span>0{item.index + 1}. {item.domainLabel}</span>
                  {isDone && (
                    <span className={isCorrect ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                      {isCorrect ? '✓' : '•'}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs font-bold text-slate-900 truncate">{item.shortTitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Exercise Stage */}
      <div className="p-6 space-y-5">
        {progress.completedToday && !saveMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
            <span>
              <span className="font-semibold">Today’s workout completed:</span>{' '}
              {studentName} solved {progress.todayLog?.correctCount}/{progress.todayLog?.totalCount} exercises today. Feel free to run an extra practice set below.
            </span>
            <button
              type="button"
              onClick={handleResetFreshSet}
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline whitespace-nowrap"
            >
              <RefreshCw className="h-3.5 w-3.5" /> New Practice Set
            </button>
          </div>
        )}

        {saveMessage && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            {saveMessage}
          </div>
        )}

        {/* Exercise 1: Fluid Reasoning (Visual Pattern 3x3 SVG) */}
        {activeIndex === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Exercise 1 of 5 · Fluid Reasoning</p>
              <h3 className="text-sm font-bold text-slate-900">{selection.fluid.prompt}</h3>
              <div className="grid grid-cols-3 gap-2 max-w-[270px] rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                {selection.fluid.grid.map((cell, i) => (
                  <div key={i} className="rounded bg-white p-0.5">
                    <MatrixCellSvg spec={cell} size={70} uid={`dbg-m-${i}`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-7 space-y-3">
              <p className="text-xs font-semibold text-slate-700">Pick the missing pattern tile:</p>
              <div className="grid grid-cols-3 gap-2.5">
                {selection.fluid.options.map((opt, idx) => {
                  const chosen = selectedChoice[0] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Daily visual option ${String.fromCharCode(65 + idx)}`}
                      onClick={() => pickChoice(0, idx, selection.fluid.correctIndex)}
                      className={`rounded-lg border p-2 text-center transition-colors ${
                        chosen
                          ? idx === selection.fluid.correctIndex
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-rose-500 bg-rose-50'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <MatrixCellSvg spec={opt} size={64} uid={`dbg-o-${idx}`} />
                      <span className="mt-1 block text-[11px] font-semibold text-slate-700">
                        Option {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedChoice[0] !== undefined && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">
                    {results[0] ? 'Correct! ' : 'Pattern note: '}
                  </span>
                  {selection.fluid.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Exercise 2: Working Memory */}
        {activeIndex === 1 && (
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Exercise 2 of 5 · Working Memory ({selection.memory.ruleHint})
            </p>
            <h3 className="text-sm font-bold text-slate-900">{selection.memory.instruction}</h3>

            {!memHidden ? (
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-center space-y-3">
                <p className="text-xs text-slate-300">Memorize this sequence, then click Hide & Recall:</p>
                <p className="font-mono text-3xl sm:text-4xl font-bold tracking-[0.3em] text-white">
                  {selection.memory.sequence.join(' ')}
                </p>
                <button
                  type="button"
                  onClick={() => setMemHidden(true)}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Hide &amp; Enter Recall
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <label htmlFor="dashboard-gym-memory-input" className="block text-xs font-semibold text-slate-700">
                  Enter recalled sequence ({selection.memory.ruleHint}):
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="dashboard-gym-memory-input"
                    type="text"
                    value={memInput}
                    onChange={(e) => setMemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && memInput.trim()) handleCheckMemory();
                    }}
                    placeholder="Type sequence without spaces..."
                    className="flex-1 min-w-[200px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 font-mono text-base tracking-widest text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleCheckMemory}
                    disabled={!memInput.trim()}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Check Recall
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemHidden(false)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Peek Again
                  </button>
                </div>
                {results[1] !== undefined && (
                  <p className="text-xs text-slate-700">
                    {results[1]
                      ? 'Exact sequence recalled!'
                      : `Expected answer: ${selection.memory.expectedAnswer.join(' ')}`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Exercise 3: Quantitative Reasoning */}
        {activeIndex === 2 && (
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Exercise 3 of 5 · Quantitative Reasoning · {selection.quantitative.category}
            </p>
            {selection.quantitative.passage && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800">
                {selection.quantitative.passage}
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900">{selection.quantitative.prompt}</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {selection.quantitative.options.map((opt, idx) => {
                const chosen = selectedChoice[2] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickChoice(2, idx, selection.quantitative.correctIndex)}
                    className={`rounded-lg border px-4 py-3 text-left text-xs font-medium transition-colors ${
                      chosen
                        ? idx === selection.quantitative.correctIndex
                          ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-semibold'
                          : 'border-rose-500 bg-rose-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-mono text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selectedChoice[2] !== undefined && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">{results[2] ? 'Correct! ' : 'Solution: '}</span>
                {selection.quantitative.explanation}
              </p>
            )}
          </div>
        )}

        {/* Exercise 4: Verbal Reasoning (EN / HI) */}
        {activeIndex === 3 && (
          <div className="max-w-2xl space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Exercise 4 of 5 · Verbal Reasoning · {selection.verbal.category} ·{' '}
              {language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
            </p>
            {selection.verbal.passage && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 leading-relaxed">
                {selection.verbal.passage}
              </div>
            )}
            <h3 className="text-sm font-bold text-slate-900">{selection.verbal.prompt}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selection.verbal.options.map((opt, idx) => {
                const chosen = selectedChoice[3] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => pickChoice(3, idx, selection.verbal.correctIndex)}
                    className={`rounded-lg border px-4 py-3 text-left text-xs font-medium transition-colors ${
                      chosen
                        ? idx === selection.verbal.correctIndex
                          ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-semibold'
                          : 'border-rose-500 bg-rose-50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-mono text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {selectedChoice[3] !== undefined && (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">{results[3] ? 'Correct! ' : 'Explanation: '}</span>
                {selection.verbal.explanation}
              </p>
            )}
          </div>
        )}

        {/* Exercise 5: Spatial Reasoning */}
        {activeIndex === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-2.5">
              <p className="text-xs font-medium text-slate-500">Exercise 5 of 5 · Spatial Reasoning</p>
              <h3 className="text-sm font-bold text-slate-900">{selection.spatial.prompt}</h3>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <SpatialVisualSvg spec={selection.spatial.reference} size={136} />
              </div>
            </div>
            <div className="md:col-span-7 space-y-3">
              <p className="text-xs font-semibold text-slate-700">Choose the matching spatial figure:</p>
              <div className="grid grid-cols-2 gap-2.5">
                {selection.spatial.options.map((opt, idx) => {
                  const chosen = selectedChoice[4] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Daily spatial ${opt.label}`}
                      onClick={() => pickChoice(4, idx, selection.spatial.correctIndex)}
                      className={`rounded-lg border p-2.5 text-center transition-colors ${
                        chosen
                          ? idx === selection.spatial.correctIndex
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-rose-500 bg-rose-50'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <SpatialVisualSvg spec={opt.spec} size={90} />
                      <span className="mt-1 block text-xs font-semibold text-slate-800">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedChoice[4] !== undefined && (
                <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">{results[4] ? 'Correct! ' : 'Spatial insight: '}</span>
                  {selection.spatial.explanation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Progress & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-mono font-semibold tabular-nums text-slate-900">
              {solvedCount}/5 exercises completed
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{correctCount} correct</span>
          </div>

          <div className="flex items-center gap-2.5">
            {!allFiveDone && (
              <button
                type="button"
                onClick={handleGoNextUnsolved}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
              >
                Next Exercise
              </button>
            )}
            <button
              type="button"
              disabled={!allFiveDone || saving}
              onClick={() => void handleLogTodaySession()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-45 whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? 'Logging Workout...' : 'Log Today’s Brain Gym'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
