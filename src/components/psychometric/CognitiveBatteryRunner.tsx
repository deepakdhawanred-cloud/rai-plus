import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  BatteryBdSubtestResult,
  BatteryCdSubtestResult,
  BatteryDsSubtestResult,
  BatteryMcSubtestResult,
  BatterySpSubtestResult,
  BatterySsSubtestResult,
  BatterySubtestKey,
  BatterySubtestResultsMap,
  PsychometricParticipant,
} from '../../types';
import {
  BAT_INDEX,
  BAT_SUBS,
  BAT_TIMED_SEC,
  BD_ITEMS,
  BD_PRACTICE,
  CD_BTN_ORDER,
  CD_KEY,
  CD_SEQ,
  DS_PARTS,
  FW_ITEMS,
  MATRIX_DEFS,
  ROT_DEFS,
  SIM_ITEMS,
  SP_POS,
  SP_SEQS,
  SS_TRIALS,
  VOC_ITEMS,
  bdLimit,
  bdScore,
  dsExpected,
  matrixOptions,
  normCells,
  rotationOptions,
  seededShuffle,
} from '../../utils/psychometricEngine';
import {
  BalancePan,
  BalanceScaleFigure,
  BlockFaceSvg,
  CodingGlyphSvg,
  MatrixCellSvg,
  MatrixGrid,
  PolyominoSvg,
} from './PsychometricFigures';

const LETTERS = 'ABCDEF';

export interface SavedBatteryProgress {
  participant: PsychometricParticipant;
  index: number;
  results: Partial<BatterySubtestResultsMap>;
  startTs: number;
}

interface CognitiveBatteryRunnerProps {
  participant: PsychometricParticipant;
  initialProgress?: SavedBatteryProgress | null;
  onSaveProgress: (progress: SavedBatteryProgress) => void;
  onPauseAndExit: () => void;
  onComplete: (results: BatterySubtestResultsMap, durationSec: number) => Promise<void>;
}

// ---------- Generic Multiple Choice Subtest (SI, VC, MR, SR, FW) ----------
interface McItem {
  prompt?: React.ReactNode;
  figure?: React.ReactNode;
  options: React.ReactNode[];
  credits: number[];
}

const MultipleChoiceSubtest: React.FC<{
  title: string;
  introTitle: string;
  introBody: React.ReactNode;
  items: McItem[];
  optionLayout: 'one' | 'txt' | 'fig';
  discontinueZeros: number;
  timeLimitSec?: number;
  hint?: string;
  onDone: (res: BatteryMcSubtestResult) => void;
}> = ({
  title,
  introTitle,
  introBody,
  items,
  optionLayout,
  discontinueZeros,
  timeLimitSec,
  hint,
  onDone,
}) => {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(-1);
  const [remSec, setRemSec] = useState(timeLimitSec || 0);
  const stateRef = useRef({
    credits: [] as number[],
    choices: [] as number[],
    times: [] as number[],
    zeros: 0,
    t0: Date.now(),
    done: false,
  });

  const advance = (choiceIdx: number) => {
    if (stateRef.current.done) return;
    const st = stateRef.current;
    const credit = choiceIdx >= 0 ? items[idx].credits[choiceIdx] : 0;
    const elapsed = +((Date.now() - st.t0) / 1000).toFixed(1);
    st.credits.push(credit);
    st.choices.push(choiceIdx);
    st.times.push(elapsed);
    st.zeros = credit === 0 ? st.zeros + 1 : 0;

    const nextIdx = idx + 1;
    if (nextIdx >= items.length || st.zeros >= discontinueZeros) {
      st.done = true;
      const disc = nextIdx < items.length;
      while (st.credits.length < items.length) {
        st.credits.push(0);
        st.choices.push(-2);
        st.times.push(0);
      }
      onDone({
        raw: st.credits.reduce((a, b) => a + b, 0),
        items: st.credits,
        choices: st.choices,
        times: st.times,
        disc,
      });
    } else {
      st.t0 = Date.now();
      setSelected(-1);
      setIdx(nextIdx);
      if (timeLimitSec) setRemSec(timeLimitSec);
    }
  };

  useEffect(() => {
    if (!started || !timeLimitSec) return;
    stateRef.current.t0 = Date.now();
    setRemSec(timeLimitSec);
    const timer = window.setInterval(() => {
      const rem = timeLimitSec - (Date.now() - stateRef.current.t0) / 1000;
      setRemSec(Math.ceil(Math.max(0, rem)));
      if (rem <= 0) {
        window.clearInterval(timer);
        advance(-1);
      }
    }, 250);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, idx, timeLimitSec]);

  if (!started) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <h3 className="text-xl font-bold text-slate-900">{introTitle}</h3>
        <div className="text-sm text-slate-700 space-y-3 max-w-2xl">{introBody}</div>
        <button
          type="button"
          onClick={() => {
            stateRef.current.t0 = Date.now();
            setStarted(true);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Start {title}
        </button>
      </section>
    );
  }

  const cur = items[idx];
  const gridCls =
    optionLayout === 'fig'
      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
      : optionLayout === 'one'
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-4';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title} · Item {idx + 1} of {items.length}
        </p>
        {timeLimitSec && (
          <span
            className={`px-2.5 py-1 rounded-md text-sm font-mono font-semibold ${
              remSec < 10 ? 'bg-rose-600 text-white' : 'bg-[#e2ecf3] text-[#1d5b86]'
            }`}
          >
            {remSec}s
          </span>
        )}
      </div>

      {cur.prompt && <h3 className="text-lg font-semibold text-slate-900">{cur.prompt}</h3>}
      {cur.figure && <div className="py-2">{cur.figure}</div>}

      <div className={`grid ${gridCls} gap-3`}>
        {cur.options.map((opt, k) => {
          const isSel = selected === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={isSel}
              aria-label={`Option ${LETTERS[k]}`}
              onClick={() => setSelected(k)}
              className={`relative rounded-lg border-2 p-3 min-h-[56px] flex items-center justify-center text-sm font-medium transition ${
                isSel
                  ? 'border-[#1d5b86] bg-[#e2ecf3] text-slate-900'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="absolute top-1.5 left-2 text-[11px] font-semibold text-slate-400">
                {LETTERS[k]}
              </span>
              <span className="pt-1">{opt}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <span className="text-xs text-slate-500">{hint || 'Select an option, then click Next.'}</span>
        <button
          type="button"
          disabled={selected < 0}
          onClick={() => advance(selected)}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold disabled:opacity-40 hover:bg-[#16476a]"
        >
          Next
        </button>
      </div>
    </section>
  );
};

// ---------- BD: Block Patterns ----------
const BlockPatternsSubtest: React.FC<{ onDone: (res: BatteryBdSubtestResult) => void }> = ({
  onDone,
}) => {
  const [stage, setStage] = useState<'intro' | 'practice' | 'item'>('intro');
  const [itemIdx, setItemIdx] = useState(0);
  const [selectedFace, setSelectedFace] = useState<number>(1);
  const [workGrid, setWorkGrid] = useState<Array<Array<number | null>>>(() =>
    BD_PRACTICE.map((r) => r.map(() => null)),
  );
  const [feedback, setFeedback] = useState('');
  const [remSec, setRemSec] = useState(60);
  const [locked, setLocked] = useState(false);

  const metaRef = useRef({
    scores: [] as number[],
    times: [] as Array<number | null>,
    zeros: 0,
    t0: Date.now(),
    finished: false,
  });

  const activePattern = stage === 'practice' ? BD_PRACTICE : BD_ITEMS[itemIdx];
  const dim = activePattern.length;

  const initGridFor = (pat: number[][]) => {
    setWorkGrid(pat.map((r) => r.map(() => null)));
    setFeedback('');
    setLocked(false);
    metaRef.current.t0 = Date.now();
    setRemSec(bdLimit(pat));
  };

  const completeCurrentItem = (score: number, sec: number | null) => {
    if (metaRef.current.finished) return;
    const m = metaRef.current;
    m.scores.push(score);
    m.times.push(sec == null ? null : +sec.toFixed(1));
    m.zeros = score === 0 ? m.zeros + 1 : 0;
    const nextIdx = itemIdx + 1;
    if (nextIdx >= BD_ITEMS.length || m.zeros >= 3) {
      m.finished = true;
      const disc = nextIdx < BD_ITEMS.length;
      while (m.scores.length < BD_ITEMS.length) {
        m.scores.push(0);
        m.times.push(null);
      }
      onDone({
        raw: m.scores.reduce((a, b) => a + b, 0),
        items: m.scores,
        times: m.times,
        disc,
      });
    } else {
      setItemIdx(nextIdx);
      initGridFor(BD_ITEMS[nextIdx]);
    }
  };

  useEffect(() => {
    if (stage !== 'item') return;
    const lim = bdLimit(BD_ITEMS[itemIdx]);
    metaRef.current.t0 = Date.now();
    setRemSec(lim);
    const tk = window.setInterval(() => {
      const rem = lim - (Date.now() - metaRef.current.t0) / 1000;
      setRemSec(Math.ceil(Math.max(0, rem)));
      if (rem <= 0) {
        window.clearInterval(tk);
        completeCurrentItem(0, null);
      }
    }, 250);
    return () => window.clearInterval(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, itemIdx]);

  const handleCellTap = (r: number, c: number) => {
    if (locked) return;
    const next = workGrid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? selectedFace : val)),
    );
    setWorkGrid(next);

    const matched = next.every((row, ri) => row.every((val, ci) => val === activePattern[ri][ci]));
    if (matched) {
      setLocked(true);
      const sec = (Date.now() - metaRef.current.t0) / 1000;
      setFeedback('Correct! Moving to next pattern…');
      window.setTimeout(() => {
        if (stage === 'practice') {
          setStage('item');
          setItemIdx(0);
          initGridFor(BD_ITEMS[0]);
        } else {
          completeCurrentItem(bdScore(activePattern, sec), sec);
        }
      }, 650);
    }
  };

  if (stage === 'intro') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Block Patterns
        </p>
        <h3 className="text-xl font-bold text-slate-900">Copy red-and-white patterns</h3>
        <p className="text-sm text-slate-700 max-w-2xl">
          Each block has six faces: all white, all red, and four half-red faces split along the
          diagonal. Pick a face from the row of blocks, then click a square in your copy to place
          it. When your copy matches, the next pattern appears automatically. Patterns get bigger
          and harder; faster correct copies earn bonus points.
        </p>
        <button
          type="button"
          onClick={() => {
            setStage('practice');
            initGridFor(BD_PRACTICE);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Try the practice pattern
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Block Patterns · {stage === 'practice' ? 'Practice' : `Item ${itemIdx + 1} of ${BD_ITEMS.length}`}
        </p>
        {stage === 'item' && (
          <span
            className={`px-2.5 py-1 rounded-md text-sm font-mono font-semibold ${
              remSec < 10 ? 'bg-rose-600 text-white' : 'bg-[#e2ecf3] text-[#1d5b86]'
            }`}
          >
            {remSec}s
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        {stage === 'practice' ? 'Practice: copy the pattern on the left' : 'Copy the pattern'}
      </h3>

      <div className="flex flex-wrap gap-8 items-start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Target pattern</p>
          <div
            className="grid border-2 border-slate-900 w-max"
            style={{ gridTemplateColumns: `repeat(${dim}, 48px)` }}
          >
            {activePattern.flat().map((f, k) => (
              <BlockFaceSvg key={k} face={f} size={48} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            Your copy — tap a square to place the selected block
          </p>
          <div
            className="grid border-2 border-slate-900 w-max"
            style={{ gridTemplateColumns: `repeat(${dim}, 64px)` }}
          >
            {workGrid.map((row, r) =>
              row.map((val, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  aria-label={`Square ${r * dim + c + 1}`}
                  onClick={() => handleCellTap(r, c)}
                  className="p-0 border-0 bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                  <BlockFaceSvg face={val} size={64} />
                </button>
              )),
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Select block face</p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={selectedFace === f}
              aria-label={`Block face ${f + 1}`}
              onClick={() => setSelectedFace(f)}
              className={`p-1 rounded-lg border-2 transition ${
                selectedFace === f
                  ? 'border-[#1d5b86] ring-2 ring-[#1d5b86]/30 bg-[#e2ecf3]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <BlockFaceSvg face={f} size={44} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs font-medium text-emerald-700">
          {feedback ||
            (stage === 'practice'
              ? 'Take your time. Next items are timed, and faster correct copies earn bonus points.'
              : '')}
        </span>
        {stage === 'item' && (
          <button
            type="button"
            onClick={() => completeCurrentItem(0, null)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            I can&apos;t do this one
          </button>
        )}
      </div>
    </section>
  );
};

// ---------- DS: Digit Span (Forward, Backward, Sequencing) ----------
const DigitSpanSubtest: React.FC<{ onDone: (res: BatteryDsSubtestResult) => void }> = ({
  onDone,
}) => {
  const [partIdx, setPartIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'show' | 'ask' | 'practiceResult'>('intro');
  const [isPractice, setIsPractice] = useState(true);
  const [trialIdx, setTrialIdx] = useState(0);
  const [displayDigit, setDisplayDigit] = useState<string>('');
  const [answerText, setAnswerText] = useState('');
  const [practiceOk, setPracticeOk] = useState(false);

  const trialsRef = useRef<Array<{ part: 'F' | 'B' | 'S'; len: number; ok: number }>>([]);
  const longestRef = useRef({ F: 0, B: 0, S: 0 });
  const timeoutsRef = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => () => clearTimeouts(), []);

  const currentPart = DS_PARTS[partIdx];
  const practiceSeq = currentPart.key === 'S' ? [6, 1, 4] : [5, 2];
  const activeSeq = isPractice ? practiceSeq : currentPart.seqs[trialIdx];

  const instrMap: Record<'F' | 'B' | 'S', { name: string; desc: string; ex: string; ans: string }> = {
    F: {
      name: 'Forward',
      desc: 'Numbers will appear one at a time. When they finish, type them in the same order.',
      ex: '3 · 8 · 6',
      ans: '386',
    },
    B: {
      name: 'Backward',
      desc: 'Now type the numbers in reverse order, starting with the last one.',
      ex: '3 · 8 · 6',
      ans: '683',
    },
    S: {
      name: 'Sequencing',
      desc: 'Now type the numbers from smallest to largest, whatever order they appeared in.',
      ex: '7 · 2 · 5',
      ans: '257',
    },
  };

  const playSequence = (seq: number[]) => {
    clearTimeouts();
    setPhase('show');
    setDisplayDigit('');
    setAnswerText('');
    let delay = 650;
    seq.forEach((digit) => {
      timeoutsRef.current.push(
        window.setTimeout(() => setDisplayDigit(String(digit)), delay),
      );
      delay += 800;
      timeoutsRef.current.push(window.setTimeout(() => setDisplayDigit(''), delay));
      delay += 200;
    });
    timeoutsRef.current.push(window.setTimeout(() => setPhase('ask'), delay + 250));
  };

  const moveToNextPart = () => {
    clearTimeouts();
    if (partIdx + 1 >= DS_PARTS.length) {
      const trials = trialsRef.current;
      const sc = (k: 'F' | 'B' | 'S') => trials.filter((x) => x.part === k && x.ok).length;
      onDone({
        raw: trials.filter((x) => x.ok).length,
        F: sc('F'),
        B: sc('B'),
        S: sc('S'),
        longest: { ...longestRef.current },
        trials,
      });
    } else {
      setPartIdx((p) => p + 1);
      setIsPractice(true);
      setTrialIdx(0);
      setPhase('intro');
    }
  };

  const submitAnswer = () => {
    const expected = dsExpected(currentPart.key, activeSeq);
    const ok = answerText === expected;
    if (isPractice) {
      setPracticeOk(ok);
      setPhase('practiceResult');
      return;
    }
    trialsRef.current.push({ part: currentPart.key, len: activeSeq.length, ok: ok ? 1 : 0 });
    if (ok) {
      longestRef.current[currentPart.key] = Math.max(
        longestRef.current[currentPart.key],
        activeSeq.length,
      );
    }
    const prevTrial = trialsRef.current[trialsRef.current.length - 2];
    if (trialIdx % 2 === 1 && !ok && prevTrial && !prevTrial.ok) {
      moveToNextPart();
      return;
    }
    const nextT = trialIdx + 1;
    if (nextT >= currentPart.seqs.length) {
      moveToNextPart();
    } else {
      setTrialIdx(nextT);
      playSequence(currentPart.seqs[nextT]);
    }
  };

  const meta = instrMap[currentPart.key];

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Digit Span · {meta.name}
        </p>
        <h3 className="text-xl font-bold text-slate-900">{meta.name}</h3>
        <p className="text-sm text-slate-700">{meta.desc}</p>
        <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-4 py-3 text-sm text-slate-800">
          Example: if you see <strong>{meta.ex}</strong>, type <strong>{meta.ans}</strong>.
        </div>
        <p className="text-xs text-slate-500">
          Each number shows for about one second. Do not write anything down.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsPractice(true);
            playSequence(practiceSeq);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Try a practice one
        </button>
      </section>
    );
  }

  if (phase === 'show') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center gap-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Watch carefully · {currentPart.name}
        </p>
        <div className="w-40 h-40 rounded-2xl border-2 border-slate-200 bg-slate-50 grid place-items-center text-7xl font-serif font-bold text-slate-900 tabular-nums">
          {displayDigit}
        </div>
      </section>
    );
  }

  if (phase === 'practiceResult') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">{practiceOk ? 'Correct.' : 'Not quite.'}</h3>
        <p className="text-sm text-slate-700">
          The numbers were <strong>{practiceSeq.join(' · ')}</strong>, so the answer is{' '}
          <strong>{dsExpected(currentPart.key, practiceSeq)}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsPractice(false);
            setTrialIdx(0);
            playSequence(currentPart.seqs[0]);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Start {currentPart.name}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center gap-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {isPractice
          ? 'Practice: type your answer'
          : `${currentPart.name} · ${activeSeq.length} numbers`}
      </p>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Type the numbers"
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value.replace(/[^1-9]/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitAnswer();
          }
        }}
        className="w-full max-w-xs text-center text-2xl font-mono tracking-[0.3em] px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50"
      />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setAnswerText((prev) => prev + String(d))}
            className="w-[72px] h-[52px] rounded-lg border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-900 hover:bg-slate-100"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          aria-label="Delete digit"
          onClick={() => setAnswerText((prev) => prev.slice(0, -1))}
          className="w-[72px] h-[52px] rounded-lg border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-700"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={submitAnswer}
          className="col-span-2 h-[52px] rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Done
        </button>
      </div>
    </section>
  );
};

// ---------- SP: Spatial Span (Corsi Block-Tapping) ----------
const SpatialSpanSubtest: React.FC<{ onDone: (res: BatterySpSubtestResult) => void }> = ({
  onDone,
}) => {
  const [phase, setPhase] = useState<'intro' | 'show' | 'respond' | 'practiceResult'>('intro');
  const [isPractice, setIsPractice] = useState(true);
  const [trialIdx, setTrialIdx] = useState(0);
  const [litBlock, setLitBlock] = useState<number>(-1);
  const [tappedBlock, setTappedBlock] = useState<number>(-1);
  const [practiceOk, setPracticeOk] = useState(false);

  const gotRef = useRef<number[]>([]);
  const trialsRef = useRef<Array<{ len: number; ok: number }>>([]);
  const longestRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];
  };
  useEffect(() => () => clearTimeouts(), []);

  const activeSeq = isPractice ? [2, 6] : SP_SEQS[trialIdx];

  const playBlocks = (seq: number[]) => {
    clearTimeouts();
    gotRef.current = [];
    setPhase('show');
    setLitBlock(-1);
    let delay = 700;
    seq.forEach((b) => {
      timeoutsRef.current.push(window.setTimeout(() => setLitBlock(b), delay));
      delay += 680;
      timeoutsRef.current.push(window.setTimeout(() => setLitBlock(-1), delay));
      delay += 280;
    });
    timeoutsRef.current.push(window.setTimeout(() => setPhase('respond'), delay + 250));
  };

  const handleBlockTap = (b: number) => {
    if (phase !== 'respond') return;
    setTappedBlock(b);
    timeoutsRef.current.push(window.setTimeout(() => setTappedBlock(-1), 220));
    gotRef.current.push(b);
    if (gotRef.current.length < activeSeq.length) return;

    const ok = gotRef.current.join(',') === activeSeq.join(',');
    setPhase('show');
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (isPractice) {
          setPracticeOk(ok);
          setPhase('practiceResult');
          return;
        }
        trialsRef.current.push({ len: activeSeq.length, ok: ok ? 1 : 0 });
        if (ok) longestRef.current = Math.max(longestRef.current, activeSeq.length);
        const prev = trialsRef.current[trialsRef.current.length - 2];
        if ((trialIdx % 2 === 1 && !ok && prev && !prev.ok) || trialIdx + 1 >= SP_SEQS.length) {
          onDone({
            raw: trialsRef.current.filter((x) => x.ok).length,
            longest: longestRef.current,
            trials: trialsRef.current,
          });
        } else {
          const nextIdx = trialIdx + 1;
          setTrialIdx(nextIdx);
          playBlocks(SP_SEQS[nextIdx]);
        }
      }, 350),
    );
  };

  if (phase === 'intro') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Spatial Span</p>
        <h3 className="text-xl font-bold text-slate-900">Remember where the blocks light up</h3>
        <p className="text-sm text-slate-700 max-w-2xl">
          Blocks will light up one after another. When they stop, tap the same blocks in the same
          order. The sequences get longer.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsPractice(true);
            playBlocks([2, 6]);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Try a practice one
        </button>
      </section>
    );
  }

  if (phase === 'practiceResult') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h3 className="text-xl font-bold text-slate-900">
          {practiceOk
            ? 'Correct.'
            : 'Not quite. The order was the middle block, then the lower-left one.'}
        </h3>
        <button
          type="button"
          onClick={() => {
            setIsPractice(false);
            setTrialIdx(0);
            playBlocks(SP_SEQS[0]);
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Start Spatial Span
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {isPractice ? 'Practice' : `Spatial Span · ${activeSeq.length} blocks`}
        </p>
        <span className="text-xs font-semibold text-[#1d5b86]">
          {phase === 'respond' ? 'Now tap the blocks in the same order' : 'Watch carefully…'}
        </span>
      </div>
      <div className="relative w-full max-w-[440px] aspect-[4/3] mx-auto rounded-xl border border-slate-200 bg-slate-50">
        {SP_POS.map(([x, y], k) => {
          const isLit = litBlock === k;
          const isTap = tappedBlock === k;
          return (
            <button
              key={k}
              type="button"
              disabled={phase !== 'respond'}
              aria-label={`Block ${k + 1}`}
              onClick={() => handleBlockTap(k)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute w-[13%] aspect-square rounded-lg transition ${
                isLit
                  ? 'bg-amber-600 opacity-100 scale-105'
                  : isTap
                    ? 'bg-[#1d5b86] opacity-100'
                    : 'bg-slate-500 opacity-60 hover:opacity-80 disabled:cursor-default'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
};

// ---------- CD: Symbol Coding (90s speed task) ----------
const SymbolCodingSubtest: React.FC<{ onDone: (res: BatteryCdSubtestResult) => void }> = ({
  onDone,
}) => {
  const [stage, setStage] = useState<'intro' | 'practice' | 'practiceDone' | 'main'>('intro');
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [remSec, setRemSec] = useState(BAT_TIMED_SEC);
  const statsRef = useRef({ correct: 0, errors: 0, attempted: 0, t0: 0, done: false });

  const practiceSeq = [3, 7, 1, 9, 5, 2];

  useEffect(() => {
    if (stage !== 'main') return;
    statsRef.current = { correct: 0, errors: 0, attempted: 0, t0: Date.now(), done: false };
    setRemSec(BAT_TIMED_SEC);
    const tk = window.setInterval(() => {
      const rem = BAT_TIMED_SEC - (Date.now() - statsRef.current.t0) / 1000;
      setRemSec(Math.ceil(Math.max(0, rem)));
      if (rem <= 0 && !statsRef.current.done) {
        statsRef.current.done = true;
        window.clearInterval(tk);
        onDone({
          raw: statsRef.current.correct,
          errors: statsRef.current.errors,
          attempted: statsRef.current.attempted,
        });
      }
    }, 200);
    return () => window.clearInterval(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === 'intro') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Symbol Coding
        </p>
        <h3 className="text-xl font-bold text-slate-900">Match numbers to symbols, fast</h3>
        <p className="text-sm text-slate-700 max-w-2xl">
          The key at the top shows which symbol goes with each number. A number appears in the
          middle: tap the symbol that goes with it. Work as quickly as you can without making
          mistakes. The task lasts 90 seconds.
        </p>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setFeedback('');
            setStage('practice');
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Try the practice
        </button>
      </section>
    );
  }

  const currentDigit = stage === 'practice' ? practiceSeq[idx] : CD_SEQ[idx];

  const handlePick = (digitIndex: number) => {
    if (stage === 'practice') {
      if (digitIndex === practiceSeq[idx] - 1) {
        setFeedback('Correct.');
        if (idx + 1 >= practiceSeq.length) {
          setStage('practiceDone');
        } else {
          setIdx(idx + 1);
        }
      } else {
        setFeedback(`Not quite: ${practiceSeq[idx]} goes with the symbol under ${practiceSeq[idx]} in the key.`);
      }
      return;
    }
    if (stage === 'main' && !statsRef.current.done) {
      if (digitIndex === CD_SEQ[idx] - 1) statsRef.current.correct += 1;
      else statsRef.current.errors += 1;
      statsRef.current.attempted += 1;
      if (idx + 1 >= CD_SEQ.length) {
        statsRef.current.done = true;
        onDone({
          raw: statsRef.current.correct,
          errors: statsRef.current.errors,
          attempted: statsRef.current.attempted,
        });
      } else {
        setIdx(idx + 1);
      }
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {stage === 'main' ? 'Symbol Coding' : 'Symbol Coding · Practice'}
        </p>
        {stage === 'main' && (
          <span
            className={`px-2.5 py-1 rounded-md text-sm font-mono font-semibold ${
              remSec < 10 ? 'bg-rose-600 text-white' : 'bg-[#e2ecf3] text-[#1d5b86]'
            }`}
          >
            {remSec}s
          </span>
        )}
      </div>

      {/* 1..9 Reference Key */}
      <div className="grid grid-cols-9 border-2 border-slate-900 rounded-lg overflow-hidden bg-slate-50">
        {CD_KEY.map((g, k) => (
          <div
            key={k}
            className="flex flex-col items-center gap-1 py-2 border-r last:border-r-0 border-slate-200"
          >
            <span className="text-xs font-bold text-slate-900 tabular-nums">{k + 1}</span>
            <CodingGlyphSvg id={g} size={30} />
          </div>
        ))}
      </div>

      {stage === 'practiceDone' ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm font-medium text-emerald-700">Practice complete!</p>
          <button
            type="button"
            onClick={() => {
              setIdx(0);
              setFeedback('');
              setStage('main');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
          >
            Start the 90-second task
          </button>
        </div>
      ) : (
        <>
          <div className="text-center py-2 space-y-1">
            <p className="text-xs text-slate-500">Which symbol goes with</p>
            <p className="text-5xl font-serif font-bold text-slate-900 tabular-nums">
              {currentDigit}
            </p>
            {stage === 'main' && (
              <p className="text-xs text-slate-400 font-mono">
                next: {CD_SEQ.slice(idx + 1, idx + 4).join('  ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {CD_BTN_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                aria-label={`Symbol ${d + 1}`}
                onClick={() => handlePick(d)}
                className="h-16 rounded-lg border border-slate-200 bg-slate-50 hover:border-[#1d5b86] hover:bg-[#e2ecf3] grid place-items-center transition"
              >
                <CodingGlyphSvg id={CD_KEY[d]} size={38} />
              </button>
            ))}
          </div>

          {feedback && <p className="text-xs text-slate-600">{feedback}</p>}
        </>
      )}
    </section>
  );
};

// ---------- SS: Symbol Search (90s speed task) ----------
const SymbolSearchSubtest: React.FC<{ onDone: (res: BatterySsSubtestResult) => void }> = ({
  onDone,
}) => {
  const [stage, setStage] = useState<'intro' | 'practice' | 'practiceDone' | 'main'>('intro');
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [remSec, setRemSec] = useState(BAT_TIMED_SEC);
  const statsRef = useRef({ correct: 0, errors: 0, attempted: 0, t0: 0, done: false });
  const practiceTrials = useMemo(() => SS_TRIALS.slice(146, 150), []);

  const answer = (yes: boolean) => {
    if (stage === 'practice') {
      const tr = practiceTrials[idx];
      if (yes === tr.present) {
        setFeedback('Correct.');
        if (idx + 1 >= practiceTrials.length) setStage('practiceDone');
        else setIdx(idx + 1);
      } else {
        setFeedback(`Not quite: a target ${tr.present ? 'is' : 'is not'} in the row.`);
      }
      return;
    }
    if (stage === 'main' && !statsRef.current.done) {
      const tr = SS_TRIALS[idx];
      if (yes === tr.present) statsRef.current.correct += 1;
      else statsRef.current.errors += 1;
      statsRef.current.attempted += 1;
      if (idx + 1 >= 146) {
        statsRef.current.done = true;
        onDone({
          raw: Math.max(0, statsRef.current.correct - statsRef.current.errors),
          correct: statsRef.current.correct,
          errors: statsRef.current.errors,
          attempted: statsRef.current.attempted,
        });
      } else {
        setIdx(idx + 1);
      }
    }
  };

  useEffect(() => {
    if (stage !== 'practice' && stage !== 'main') return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'y') answer(true);
      else if (k === 'n') answer(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, idx]);

  useEffect(() => {
    if (stage !== 'main') return;
    statsRef.current = { correct: 0, errors: 0, attempted: 0, t0: Date.now(), done: false };
    setRemSec(BAT_TIMED_SEC);
    const tk = window.setInterval(() => {
      const rem = BAT_TIMED_SEC - (Date.now() - statsRef.current.t0) / 1000;
      setRemSec(Math.ceil(Math.max(0, rem)));
      if (rem <= 0 && !statsRef.current.done) {
        statsRef.current.done = true;
        window.clearInterval(tk);
        onDone({
          raw: Math.max(0, statsRef.current.correct - statsRef.current.errors),
          correct: statsRef.current.correct,
          errors: statsRef.current.errors,
          attempted: statsRef.current.attempted,
        });
      }
    }, 200);
    return () => window.clearInterval(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === 'intro') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Symbol Search
        </p>
        <h3 className="text-xl font-bold text-slate-900">Is a target symbol in the row?</h3>
        <p className="text-sm text-slate-700 max-w-2xl">
          On the left are two target symbols. Look at the row of five symbols on the right. If{' '}
          <strong>either</strong> target appears in the row, answer <strong>Yes</strong>; otherwise{' '}
          <strong>No</strong>. Use the buttons or the <strong>Y</strong> and <strong>N</strong>{' '}
          keys. Wrong answers are subtracted. The task lasts 90 seconds.
        </p>
        <button
          type="button"
          onClick={() => {
            setIdx(0);
            setFeedback('');
            setStage('practice');
          }}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          Try the practice
        </button>
      </section>
    );
  }

  const trial = stage === 'practice' ? practiceTrials[idx] : SS_TRIALS[idx];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {stage === 'main' ? 'Symbol Search' : 'Symbol Search · Practice'}
        </p>
        {stage === 'main' && (
          <span
            className={`px-2.5 py-1 rounded-md text-sm font-mono font-semibold ${
              remSec < 10 ? 'bg-rose-600 text-white' : 'bg-[#e2ecf3] text-[#1d5b86]'
            }`}
          >
            {remSec}s
          </span>
        )}
      </div>

      {stage === 'practiceDone' ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-sm font-medium text-emerald-700">Practice complete!</p>
          <button
            type="button"
            onClick={() => {
              setIdx(0);
              setFeedback('');
              setStage('main');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
          >
            Start the 90-second task
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-6 py-4">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-[#1d5b86] bg-[#e2ecf3]/40">
              {trial.t.map((g, k) => (
                <CodingGlyphSvg key={k} id={g} size={44} />
              ))}
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
              {trial.g.map((g, k) => (
                <CodingGlyphSvg key={k} id={g} size={44} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => answer(true)}
              className="min-w-[130px] px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
            >
              Yes (Y)
            </button>
            <button
              type="button"
              onClick={() => answer(false)}
              className="min-w-[130px] px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900"
            >
              No (N)
            </button>
          </div>
          {feedback && <p className="text-xs text-center text-slate-600">{feedback}</p>}
        </>
      )}
    </section>
  );
};

// ---------- Main 10-Subtest Battery Orchestrator ----------
export const CognitiveBatteryRunner: React.FC<CognitiveBatteryRunnerProps> = ({
  participant,
  initialProgress,
  onSaveProgress,
  onPauseAndExit,
  onComplete,
}) => {
  const [subIdx, setSubIdx] = useState(initialProgress?.index ?? 0);
  const [phase, setPhase] = useState<'menu' | 'sub' | 'saving'>('menu');
  const [results, setResults] = useState<Partial<BatterySubtestResultsMap>>(
    initialProgress?.results ?? {},
  );
  const startTsRef = useRef<number>(initialProgress?.startTs ?? Date.now());

  const siItems = useMemo<McItem[]>(
    () =>
      SIM_ITEMS.map((it, k) => {
        const opts = seededShuffle(it.slice(2) as Array<readonly [string, number]>, 500 + k);
        return {
          prompt: (
            <>
              How are <strong>{it[0]}</strong> and <strong>{it[1]}</strong> alike?
            </>
          ),
          options: opts.map((o) => o[0]),
          credits: opts.map((o) => o[1]),
        };
      }),
    [],
  );

  const vcItems = useMemo<McItem[]>(
    () =>
      VOC_ITEMS.map((it) => ({
        prompt: (
          <>
            Which means the same as <strong>{it[0]}</strong>?
          </>
        ),
        options: [...it[1]],
        credits: it[1].map((_, k) => (k === it[2] ? 1 : 0)),
      })),
    [],
  );

  const mrItems = useMemo<McItem[]>(
    () =>
      MATRIX_DEFS.map((d, k) => {
        const o = matrixOptions(d, 101 + k);
        return {
          prompt: 'Which piece completes the pattern?',
          figure: <MatrixGrid def={d} />,
          options: o.opts.map((cell, idx) => <MatrixCellSvg key={idx} cell={cell} size={74} />),
          credits: o.opts.map((_, j) => (j === o.answer ? 1 : 0)),
        };
      }),
    [],
  );

  const srItems = useMemo<McItem[]>(
    () =>
      ROT_DEFS.map((d, k) => {
        const o = rotationOptions(d, 301 + k);
        return {
          prompt: 'Which option is this shape turned, not flipped?',
          figure: (
            <div className="grid place-items-center">
              <PolyominoSvg cells={normCells(d.cells)} size={115} />
            </div>
          ),
          options: o.opts.map((cells, idx) => <PolyominoSvg key={idx} cells={cells} size={76} />),
          credits: o.opts.map((_, j) => (j === o.answer ? 1 : 0)),
        };
      }),
    [],
  );

  const fwItems = useMemo<McItem[]>(
    () =>
      FW_ITEMS.map((it) => ({
        figure: <BalanceScaleFigure item={it} />,
        options: it.opts.map((str, idx) => <BalancePan key={idx} shapes={str} />),
        credits: it.opts.map((_, k) => (k === it.a ? 1 : 0)),
      })),
    [],
  );

  const handleSubtestDone = async <K extends BatterySubtestKey>(
    key: K,
    subResult: BatterySubtestResultsMap[K],
  ) => {
    const updated = { ...results, [key]: subResult };
    const nextIdx = subIdx + 1;
    setResults(updated);
    onSaveProgress({
      participant,
      index: nextIdx,
      results: updated,
      startTs: startTsRef.current,
    });
    if (nextIdx >= BAT_SUBS.length) {
      setPhase('saving');
      const durationSec = Math.round((Date.now() - startTsRef.current) / 1000);
      await onComplete(updated as BatterySubtestResultsMap, durationSec);
    } else {
      setSubIdx(nextIdx);
      setPhase('menu');
      window.scrollTo(0, 0);
    }
  };

  if (phase === 'saving') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <p className="text-sm font-semibold text-[#1d5b86]">Scoring Cognitive Profile Battery…</p>
        <p className="text-xs text-slate-500">
          Computing scaled scores, 5 index profiles, FSIQ, GAI, CPI and local norms.
        </p>
      </section>
    );
  }

  const activeSub = BAT_SUBS[subIdx];

  if (phase === 'sub') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cognitive Battery · Subtest {subIdx + 1} of {BAT_SUBS.length} · {activeSub.name}
          </p>
          <span className="text-xs text-slate-500">{participant.name}</span>
        </div>

        {activeSub.key === 'BD' && (
          <BlockPatternsSubtest onDone={(r) => void handleSubtestDone('BD', r)} />
        )}
        {activeSub.key === 'SI' && (
          <MultipleChoiceSubtest
            title="Similarities"
            introTitle="How are two things alike?"
            introBody={
              <>
                <p>
                  You will see two words. Choose the answer that <strong>best</strong> says how they
                  are alike. Some answers are partly right; the best answer names the most important
                  thing they have in common.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50/75 px-4 py-2.5 text-xs text-slate-800">
                  Example: <strong>RED</strong> and <strong>BLUE</strong>. “Both are colours” is the
                  best answer. “Both are in the flag” is only partly right.
                </div>
              </>
            }
            items={siItems}
            optionLayout="one"
            discontinueZeros={4}
            hint="Choose the best answer, then Next."
            onDone={(r) => void handleSubtestDone('SI', r)}
          />
        )}
        {activeSub.key === 'VC' && (
          <MultipleChoiceSubtest
            title="Vocabulary"
            introTitle="Which word means the same?"
            introBody={
              <p>
                Choose the word or phrase closest in meaning to the word in capitals. The words get
                harder; a careful guess is fine.
              </p>
            }
            items={vcItems}
            optionLayout="txt"
            discontinueZeros={4}
            onDone={(r) => void handleSubtestDone('VC', r)}
          />
        )}
        {activeSub.key === 'MR' && (
          <MultipleChoiceSubtest
            title="Matrix Reasoning"
            introTitle="Complete the pattern"
            introBody={
              <p>
                Each puzzle is a 3 × 3 grid with the bottom-right piece missing. Look across rows
                and down columns to find the rule, then pick the piece that fits. You have{' '}
                <strong>60 seconds</strong> per puzzle.
              </p>
            }
            items={mrItems}
            optionLayout="fig"
            discontinueZeros={4}
            timeLimitSec={60}
            onDone={(r) => void handleSubtestDone('MR', r)}
          />
        )}
        {activeSub.key === 'SR' && (
          <MultipleChoiceSubtest
            title="Shape Rotation"
            introTitle="Same shape, only turned"
            introBody={
              <p>
                Pick the option that is the shape at the top <strong>turned around</strong> on the
                page. Options that are flipped over (mirror images) are wrong. You have{' '}
                <strong>45 seconds</strong> per item.
              </p>
            }
            items={srItems}
            optionLayout="fig"
            discontinueZeros={4}
            timeLimitSec={45}
            onDone={(r) => void handleSubtestDone('SR', r)}
          />
        )}
        {activeSub.key === 'FW' && (
          <MultipleChoiceSubtest
            title="Balance Puzzles"
            introTitle="What balances the scale?"
            introBody={
              <>
                <p>
                  The scales show which shapes weigh the same. Use them to work out what balances
                  the question scale. You have <strong>40 seconds</strong> per puzzle.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50/75 p-3 space-y-2">
                  <BalanceScaleFigure item={{ eq: [['C', 'SS']], q: 'C' }} />
                  <p className="text-xs text-slate-700">
                    Here one circle balances two squares, so the answer to “one circle balances ?”
                    is two squares.
                  </p>
                </div>
              </>
            }
            items={fwItems}
            optionLayout="txt"
            discontinueZeros={3}
            timeLimitSec={40}
            onDone={(r) => void handleSubtestDone('FW', r)}
          />
        )}
        {activeSub.key === 'DS' && (
          <DigitSpanSubtest onDone={(r) => void handleSubtestDone('DS', r)} />
        )}
        {activeSub.key === 'SP' && (
          <SpatialSpanSubtest onDone={(r) => void handleSubtestDone('SP', r)} />
        )}
        {activeSub.key === 'CD' && (
          <SymbolCodingSubtest onDone={(r) => void handleSubtestDone('CD', r)} />
        )}
        {activeSub.key === 'SS' && (
          <SymbolSearchSubtest onDone={(r) => void handleSubtestDone('SS', r)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cognitive Profile Battery · {participant.name}
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {subIdx === 0 ? 'Ready to begin' : 'Subtest complete. Take a short break if needed.'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {subIdx} of {BAT_SUBS.length} done
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-[#1d5b86] transition-all"
            style={{ width: `${(subIdx / BAT_SUBS.length) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {BAT_SUBS.map((s, k) => {
            const done = k < subIdx;
            const isNext = k === subIdx;
            return (
              <div
                key={s.key}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs ${
                  isNext
                    ? 'border-[#1d5b86] bg-[#e2ecf3]/60'
                    : done
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-full grid place-items-center text-[11px] font-bold ${
                    done
                      ? 'bg-emerald-600 text-white'
                      : isNext
                        ? 'bg-[#1d5b86] text-white'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {k + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <p className="text-[11px] text-slate-500">{BAT_INDEX[s.idx].name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Next · about {activeSub.mins} minutes
        </p>
        <h3 className="text-xl font-bold text-slate-900">{activeSub.name}</h3>
        <p className="text-sm text-slate-700">{activeSub.desc}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPhase('sub')}
            className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
          >
            Start {activeSub.name}
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveProgress({
                participant,
                index: subIdx,
                results,
                startTs: startTsRef.current,
              });
              onPauseAndExit();
            }}
            className="px-4 py-2.5 rounded-lg border border-[#1d5b86] text-[#1d5b86] text-sm font-semibold hover:bg-[#e2ecf3]/50"
          >
            Save and continue later
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Progress is kept on this device after each subtest, so the battery can be split across two
          sittings on the same day.
        </p>
      </section>
    </div>
  );
};
