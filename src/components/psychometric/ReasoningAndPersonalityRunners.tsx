import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PsychometricParticipant } from '../../types';
import {
  IQ_BANK,
  IQ_TIME_MIN,
  LIKERT_INTEREST_ANCHORS,
  LIKERT_PERSONALITY_ANCHORS,
  MATRIX_DEFS,
  fullPersonalityAndRiasecPages,
} from '../../utils/psychometricEngine';
import { MatrixCellSvg, MatrixGrid, PolyominoSvg } from './PsychometricFigures';

const LETTERS = 'ABCDEF';

function fmtCountdown(sec: number): string {
  const s = Math.ceil(Math.max(0, sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ============================================================================
// 1. REASONING TEST RUNNER (40 ITEMS, 35 MIN, 4 CHC DOMAINS)
// ============================================================================

interface ReasoningTestRunnerProps {
  participant: PsychometricParticipant;
  onCancel: () => void;
  onComplete: (choices: number[], times: number[], durationSec: number) => Promise<void>;
}

export const ReasoningTestRunner: React.FC<ReasoningTestRunnerProps> = ({
  participant,
  onCancel,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'intro' | 'running' | 'saving'>('intro');
  const [practiceChoice, setPracticeChoice] = useState<number>(-1);
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<number[]>(() => Array(IQ_BANK.length).fill(-1));
  const [remSec, setRemSec] = useState(IQ_TIME_MIN * 60);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const timesRef = useRef<number[]>(Array(IQ_BANK.length).fill(0));
  const startRef = useRef<number>(0);
  const enterRef = useRef<number>(0);
  const submittedRef = useRef(false);

  const logElapsedForCurrent = (curIndex: number) => {
    if (enterRef.current > 0) {
      timesRef.current[curIndex] += (Date.now() - enterRef.current) / 1000;
      enterRef.current = Date.now();
    }
  };

  const submitNow = async (finalChoices: number[]) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    logElapsedForCurrent(idx);
    setConfirmOpen(false);
    setPhase('saving');
    const durationSec = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
    await onComplete(
      finalChoices,
      timesRef.current.map((t) => +t.toFixed(1)),
      durationSec,
    );
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const tk = window.setInterval(() => {
      const left = Math.max(0, IQ_TIME_MIN * 60 - (Date.now() - startRef.current) / 1000);
      setRemSec(left);
      if (left <= 0) {
        window.clearInterval(tk);
        void submitNow(choices);
      }
    }, 1000);
    return () => window.clearInterval(tk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, choices]);

  const jumpTo = (target: number) => {
    logElapsedForCurrent(idx);
    setIdx(target);
    window.scrollTo(0, 0);
  };

  if (phase === 'saving') {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <p className="text-sm font-semibold text-[#1d5b86]">Scoring Reasoning Test (3PL IRT)…</p>
        <p className="text-xs text-slate-500">
          Computing EAP ability θ, 90% confidence band, CHC domain scores and validity checks.
        </p>
      </section>
    );
  }

  if (phase === 'intro') {
    const exOpts = ['4', '5', '6', '7', '8'];
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reasoning Test · Instructions · {participant.name}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">Before you begin</h3>
        </div>

        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5 max-w-2xl">
          <li>
            There are <strong>{IQ_BANK.length} questions</strong> and{' '}
            <strong>{IQ_TIME_MIN} minutes</strong>. The timer starts when you press Start.
          </li>
          <li>
            Questions get harder as you go. Most people will not finish every one, and that is
            expected.
          </li>
          <li>
            If a question is too hard, skip it and come back using the numbered boxes. Unanswered
            questions count as wrong, so a sensible guess is better than a blank.
          </li>
          <li>No calculators, phones or help from others. Rough paper is fine.</li>
        </ul>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Practice example (not scored)
          </p>
          <p className="text-2xl font-serif font-semibold tracking-wider text-slate-900">
            1, 2, 3, 4, 5, ?
          </p>
          <div className="grid grid-cols-5 gap-2 max-w-lg">
            {exOpts.map((o, k) => (
              <button
                key={o}
                type="button"
                aria-pressed={practiceChoice === k}
                onClick={() => setPracticeChoice(k)}
                className={`relative rounded-lg border-2 py-2.5 text-sm font-semibold transition ${
                  practiceChoice === k
                    ? 'border-[#1d5b86] bg-[#e2ecf3] text-slate-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="absolute top-1 left-1.5 text-[10px] text-slate-400">
                  {LETTERS[k]}
                </span>
                {o}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600">
            {practiceChoice < 0
              ? 'Pick an answer to see how it works.'
              : practiceChoice === 2
                ? 'Correct: each number is one more than the last. In the real test you will get no feedback.'
                : 'Not quite: each number goes up by one, so the answer is 6 (C). In the real test you will get no feedback.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              startRef.current = Date.now();
              enterRef.current = Date.now();
              setRemSec(IQ_TIME_MIN * 60);
              setPhase('running');
            }}
            className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
          >
            Start the {IQ_TIME_MIN}-minute test
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  const item = IQ_BANK[idx];
  const currentChoice = choices[idx];
  const answeredCount = choices.filter((x) => x !== -1).length;
  const unansweredCount = IQ_BANK.length - answeredCount;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Question {idx + 1} of {IQ_BANK.length} · {item.domName}
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {item.type === 'matrix'
                ? 'Which option completes the pattern?'
                : item.type === 'rot'
                  ? 'Which option is this same shape, only turned around? (Flipped-over shapes are wrong.)'
                  : item.dom === 'Gf-S'
                    ? 'What comes next in the series?'
                    : item.q}
            </h3>
          </div>
          <span
            aria-label="Time remaining"
            className={`px-3 py-1 rounded-md text-sm font-mono font-semibold tabular-nums ${
              remSec < 120 ? 'bg-rose-600 text-white' : 'bg-[#e2ecf3] text-[#1d5b86]'
            }`}
          >
            {fmtCountdown(remSec)}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-[#1d5b86] transition-all"
            style={{ width: `${(answeredCount / IQ_BANK.length) * 100}%` }}
          />
        </div>

        <div className="py-2">
          {item.type === 'matrix' && <MatrixGrid def={MATRIX_DEFS[item.def]} />}
          {item.type === 'rot' && (
            <div className="grid place-items-center">
              <PolyominoSvg cells={item.cells} size={120} />
            </div>
          )}
          {item.type === 'text' && item.dom === 'Gf-S' && (
            <p className="text-2xl font-serif font-semibold text-center tracking-wider text-slate-900">
              {item.q}
            </p>
          )}
        </div>

        <div
          className={`grid gap-3 ${
            item.type === 'text'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
          }`}
        >
          {item.opts.map((opt, k) => {
            const isSel = currentChoice === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={isSel}
                aria-label={`Option ${LETTERS[k]}`}
                onClick={() => {
                  const next = choices.slice();
                  next[idx] = k;
                  setChoices(next);
                }}
                className={`relative rounded-lg border-2 p-3 min-h-[56px] flex items-center justify-center text-sm font-medium transition ${
                  isSel
                    ? 'border-[#1d5b86] bg-[#e2ecf3] text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="absolute top-1.5 left-2 text-[11px] font-semibold text-slate-400">
                  {LETTERS[k]}
                </span>
                <span className="pt-1">
                  {item.type === 'matrix' ? (
                    <MatrixCellSvg cell={opt as Parameters<typeof MatrixCellSvg>[0]['cell']} size={76} />
                  ) : item.type === 'rot' ? (
                    <PolyominoSvg cells={opt as Parameters<typeof PolyominoSvg>[0]['cells']} size={76} />
                  ) : (
                    String(opt)
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => jumpTo(idx - 1)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2 rounded-lg border border-[#1d5b86] text-[#1d5b86] text-sm font-semibold hover:bg-[#e2ecf3]/50"
            >
              Finish test
            </button>
            <button
              type="button"
              onClick={() => {
                if (idx < IQ_BANK.length - 1) jumpTo(idx + 1);
                else setConfirmOpen(true);
              }}
              className="px-5 py-2 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
            >
              {idx === IQ_BANK.length - 1 ? 'Review & submit' : 'Next'}
            </button>
          </div>
        </div>
      </section>

      {/* Question Jump Palette */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">Jump to a question</h4>
          <span className="text-xs text-slate-500">
            {answeredCount} answered · {unansweredCount} left
          </span>
        </div>
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-20 gap-1.5">
          {IQ_BANK.map((q, k) => {
            const done = choices[k] !== -1;
            const cur = k === idx;
            return (
              <button
                key={q.id}
                type="button"
                aria-label={`Question ${k + 1}${done ? ', answered' : ''}`}
                onClick={() => jumpTo(k)}
                className={`h-8 rounded text-xs font-semibold tabular-nums border transition ${
                  done
                    ? 'bg-[#e2ecf3] text-[#1d5b86] border-[#bfd4e3]'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                } ${cur ? 'ring-2 ring-[#1d5b86]' : ''}`}
              >
                {k + 1}
              </button>
            );
          })}
        </div>
      </section>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 grid place-items-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h4 className="text-lg font-bold text-slate-900">Submit your reasoning test?</h4>
            <p className="text-sm text-slate-600">
              {unansweredCount > 0
                ? `${unansweredCount} question${unansweredCount === 1 ? ' is' : 's are'} still unanswered and will count as wrong. You have ${fmtCountdown(remSec)} left.`
                : 'You have answered every question.'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void submitNow(choices)}
                className="px-4 py-2 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
              >
                Submit test
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Keep going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. PERSONALITY (IPIP-50) + RIASEC (36) RUNNER (88 ITEMS, PAGINATED)
// ============================================================================

interface PersonalityTestRunnerProps {
  participant: PsychometricParticipant;
  onCancel: () => void;
  onComplete: (payload: {
    bf: number[];
    ac: number[];
    ri: number[];
    pageTimes: number[];
    durationSec: number;
  }) => Promise<void>;
}

export const PersonalityTestRunner: React.FC<PersonalityTestRunnerProps> = ({
  participant,
  onCancel,
  onComplete,
}) => {
  const pages = useMemo(() => fullPersonalityAndRiasecPages(), []);
  const [pageIdx, setPageIdx] = useState(0);
  const [bf, setBf] = useState<number[]>(() => Array(50).fill(0));
  const [ac, setAc] = useState<number[]>([0, 0]);
  const [ri, setRi] = useState<number[]>(() => Array(36).fill(0));
  const [showMissing, setShowMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  const pageTimesRef = useRef<number[]>([]);
  const enterRef = useRef<number>(Date.now());
  const startRef = useRef<number>(Date.now());

  const currentPage = pages[pageIdx];
  const isRiasec = currentPage[0].sec === 'ri';
  const anchors = isRiasec ? LIKERT_INTEREST_ANCHORS : LIKERT_PERSONALITY_ANCHORS;

  const getValue = (item: (typeof currentPage)[number]) =>
    item.kind === 'bf' ? bf[item.idx] : item.kind === 'ac' ? ac[item.idx] : ri[item.idx];

  const setValue = (item: (typeof currentPage)[number], value: number) => {
    if (item.kind === 'bf') {
      setBf((prev) => {
        const next = prev.slice();
        next[item.idx] = value;
        return next;
      });
    } else if (item.kind === 'ac') {
      setAc((prev) => {
        const next = prev.slice();
        next[item.idx] = value;
        return next;
      });
    } else {
      setRi((prev) => {
        const next = prev.slice();
        next[item.idx] = value;
        return next;
      });
    }
  };

  const answeredCount =
    bf.filter(Boolean).length + ac.filter(Boolean).length + ri.filter(Boolean).length;
  const totalItems = 88;

  const handleNext = async () => {
    if (currentPage.some((it) => !getValue(it))) {
      setShowMissing(true);
      return;
    }
    pageTimesRef.current[pageIdx] =
      (pageTimesRef.current[pageIdx] || 0) + (Date.now() - enterRef.current) / 1000;
    enterRef.current = Date.now();
    setShowMissing(false);

    if (pageIdx === pages.length - 1) {
      setSaving(true);
      const durationSec = Math.max(1, Math.round((Date.now() - startRef.current) / 1000));
      await onComplete({
        bf,
        ac,
        ri,
        pageTimes: pageTimesRef.current,
        durationSec,
      });
    } else {
      setPageIdx((p) => p + 1);
      window.scrollTo(0, 0);
    }
  };

  if (saving) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <p className="text-sm font-semibold text-[#1d5b86]">
          Scoring Personality &amp; Career Interests…
        </p>
        <p className="text-xs text-slate-500">
          Computing Big Five scores, Holland RIASEC 3-letter career code and Curran response-quality
          checks.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Part {isRiasec ? '2 of 2 · Career Interests (RIASEC)' : '1 of 2 · Personality (IPIP-50)'}{' '}
            · Page {pageIdx + 1} of {pages.length} · {participant.name}
          </p>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5">
            {isRiasec
              ? 'How much would you like doing each activity?'
              : 'How accurately does each statement describe you?'}
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-600 tabular-nums">
          {answeredCount} of {totalItems} answered
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[#1d5b86] transition-all"
          style={{ width: `${(answeredCount / totalItems) * 100}%` }}
        />
      </div>

      <p className="text-xs text-slate-500">
        {isRiasec
          ? "Don't think about education or pay — just whether you would enjoy the activity."
          : 'Describe yourself as you generally are now, not as you wish to be. Answer honestly; there are no right or wrong answers.'}
      </p>

      <div className="divide-y divide-slate-200 border-t border-slate-200">
        {currentPage.map((it) => {
          const val = getValue(it);
          const missing = showMissing && !val;
          return (
            <div
              key={`${it.kind}-${it.idx}`}
              role="group"
              aria-label={it.text}
              className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3 items-center py-3.5"
            >
              <p className={`text-sm font-medium ${missing ? 'text-rose-700' : 'text-slate-900'}`}>
                {isRiasec ? '' : 'I… '}
                {it.text}
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {anchors.map((label, k) => {
                  const pressed = val === k + 1;
                  return (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setValue(it, k + 1)}
                      className={`min-h-[44px] px-1.5 py-2 rounded-md border text-[11px] leading-tight font-medium transition ${
                        pressed
                          ? 'bg-[#1d5b86] border-[#1d5b86] text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showMissing && (
        <p role="alert" className="text-xs font-semibold text-rose-700">
          Answer the statements marked in red to continue.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageIdx === 0}
            onClick={() => {
              setShowMissing(false);
              setPageIdx((p) => p - 1);
              window.scrollTo(0, 0);
            }}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            Previous page
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-slate-500 text-xs font-medium hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          onClick={() => void handleNext()}
          className="px-5 py-2.5 rounded-lg bg-[#1d5b86] text-white text-sm font-semibold hover:bg-[#16476a]"
        >
          {pageIdx === pages.length - 1 ? 'Finish and see results' : 'Next page'}
        </button>
      </div>
    </section>
  );
};
