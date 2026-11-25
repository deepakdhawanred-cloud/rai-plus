import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildStorySequenceSteps,
  buildWordRecallBank,
  type DifficultyLevel,
} from '../../../utils/cognitiveGamePuzzles';
import { playErrorCue, playSuccessChime, playTone, playVictoryFanfare } from '../../../utils/soundFx';
import type { PlayableEngineProps } from './gameEngineTypes';

// ---------------------------------------------------------------------------
// 6. MEMORY MATCH (Up to 12 Pairs with High-Interference Glyphs at L4-5)
// ---------------------------------------------------------------------------
const BASIC_CARD_ICONS = ['☀', '★', '▲', '◆', '♣', '♠', '●', '✿'];
const INTERFERENCE_CARD_ICONS = ['◰', '◳', '◩', '◪', '∀', '∃', 'λ', 'μ', '∑', '∏', '△', '▽'];

export const MemoryMatchGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const pairCount = level === 1 ? 3 : level === 2 ? 4 : level === 3 ? 6 : level === 4 ? 10 : 12;
  const [cards] = useState(() => {
    const pool = level >= 4 ? INTERFERENCE_CARD_ICONS : BASIC_CARD_ICONS;
    const chosen = pool.slice(0, pairCount);
    const deck = [...chosen, ...chosen].map((icon, idx) => ({ id: idx, icon }));
    let seed = level * 83 + 17;
    for (let i = deck.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = seed % (i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  });

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [locked, setLocked] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${matched.length}/${pairCount}`,
      score: Math.round((matched.length / pairCount) * 100),
      errors,
    });
  }, [matched.length, pairCount, errors, onHudUpdate]);

  function handleFlip(index: number) {
    if (locked || flipped.includes(index)) return;
    const card = cards[index];
    if (matched.includes(card.icon)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setAttempts((a) => a + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (cards[firstIdx].icon === cards[secondIdx].icon) {
        playSuccessChime();
        const nextMatched = [...matched, cards[firstIdx].icon];
        setMatched(nextMatched);
        setFlipped([]);

        if (nextMatched.length >= pairCount) {
          playVictoryFanfare();
          const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
          const acc = Math.max(
            40,
            Math.round((pairCount / Math.max(pairCount, attempts + 1)) * 100),
          );
          onFinish({
            accuracyPct: acc,
            completionTimeSec: elapsed,
            reactionTimeMs: null,
            errorCount: errors,
            scorePoints: acc,
            completed: true,
            summaryDetail: `Matched ${pairCount} pairs (${pairCount * 2} cards) in ${attempts + 1} attempts (${elapsed}s).`,
          });
        }
      } else {
        playErrorCue();
        setErrors((e) => e + 1);
        setLocked(true);
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, level >= 4 ? 500 : 650);
      }
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-slate-600">
        {lang === 'hi'
          ? `दो-दो कार्ड पलटें और सभी ${pairCount} जोड़ियाँ मिलाएँ।`
          : `Flip two cards at a time to match all ${pairCount} ${level >= 4 ? 'high-similarity ' : ''}pairs.`}
      </p>
      <div
        className={`grid gap-2.5 mx-auto ${
          pairCount === 12
            ? 'grid-cols-6 max-w-xl'
            : pairCount === 10
              ? 'grid-cols-5 max-w-lg'
              : 'grid-cols-4 max-w-md'
        }`}
      >
        {cards.map((card, idx) => {
          const isOpen = flipped.includes(idx) || matched.includes(card.icon);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(idx)}
              aria-label={isOpen ? `Card ${card.icon}` : `Hidden card ${idx + 1}`}
              className={`${pairCount >= 10 ? 'h-16 text-xl' : 'h-20 text-2xl'} rounded-xl border-2 font-bold transition-transform ${
                matched.includes(card.icon)
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : isOpen
                    ? 'border-blue-900 bg-white text-blue-900'
                    : 'border-slate-300 bg-blue-950 text-white hover:bg-blue-900'
              }`}
            >
              {isOpen ? card.icon : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 7. SEQUENCE RECALL (Up to 9 Pads + REVERSE Order at Level 5)
// ---------------------------------------------------------------------------
const SIMON_PADS = [
  { id: 0, label: 'P1', color: 'bg-blue-700', active: 'bg-blue-300 ring-4 ring-blue-400', freq: 392 },
  { id: 1, label: 'P2', color: 'bg-emerald-700', active: 'bg-emerald-300 ring-4 ring-emerald-400', freq: 440 },
  { id: 2, label: 'P3', color: 'bg-amber-600', active: 'bg-amber-200 ring-4 ring-amber-300', freq: 493.88 },
  { id: 3, label: 'P4', color: 'bg-red-600', active: 'bg-red-300 ring-4 ring-red-400', freq: 523.25 },
  { id: 4, label: 'P5', color: 'bg-violet-700', active: 'bg-violet-300 ring-4 ring-violet-400', freq: 587.33 },
  { id: 5, label: 'P6', color: 'bg-teal-700', active: 'bg-teal-300 ring-4 ring-teal-400', freq: 659.25 },
  { id: 6, label: 'P7', color: 'bg-indigo-700', active: 'bg-indigo-300 ring-4 ring-indigo-400', freq: 739.99 },
  { id: 7, label: 'P8', color: 'bg-orange-600', active: 'bg-orange-200 ring-4 ring-orange-300', freq: 783.99 },
  { id: 8, label: 'P9', color: 'bg-slate-700', active: 'bg-slate-300 ring-4 ring-slate-400', freq: 880 },
];

export const SequenceRecallGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const padCount = level <= 3 ? 4 : level === 4 ? 6 : 9;
  const seqLength = level <= 2 ? level + 2 : level === 3 ? 5 : level === 4 ? 7 : 8;
  const reverseOrder = level === 5;
  const pads = useMemo(() => SIMON_PADS.slice(0, padCount), [padCount]);

  const sequence = useMemo(() => {
    let seed = level * 97 + 23;
    const seq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      let nextPad = seed % padCount;
      if (seq.length > 0 && nextPad === seq[seq.length - 1]) {
        nextPad = (nextPad + 1) % padCount;
      }
      seq.push(nextPad);
    }
    return seq;
  }, [level, padCount, seqLength]);

  const expectedSequence = useMemo(
    () => (reverseOrder ? [...sequence].reverse() : sequence),
    [reverseOrder, sequence],
  );

  const [showingIdx, setShowingIdx] = useState<number | null>(null);
  const [phase, setPhase] = useState<'WATCH' | 'INPUT'>('WATCH');
  const [inputIdx, setInputIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${inputIdx}/${seqLength}`,
      score: Math.round((inputIdx / seqLength) * 100),
      errors,
    });
  }, [inputIdx, seqLength, errors, onHudUpdate]);

  useEffect(() => {
    setPhase('WATCH');
    const stepDelay = level >= 4 ? 460 : 600;
    const flashMs = level >= 4 ? 290 : 380;
    const timers: ReturnType<typeof setTimeout>[] = [];

    sequence.forEach((padId, stepIdx) => {
      const t1 = setTimeout(() => {
        setShowingIdx(padId);
        playTone(SIMON_PADS[padId].freq, 0.18);
        const t2 = setTimeout(() => setShowingIdx(null), flashMs);
        timers.push(t2);
      }, 420 + stepIdx * stepDelay);
      timers.push(t1);
    });

    const endTimer = setTimeout(() => {
      setPhase('INPUT');
    }, 480 + sequence.length * stepDelay);
    timers.push(endTimer);

    return () => timers.forEach(clearTimeout);
  }, [sequence, level]);

  function handlePadClick(padId: number) {
    if (phase !== 'INPUT') return;
    playTone(SIMON_PADS[padId].freq, 0.14);
    if (expectedSequence[inputIdx] === padId) {
      const nextIdx = inputIdx + 1;
      setInputIdx(nextIdx);
      if (nextIdx >= seqLength) {
        playVictoryFanfare();
        const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
        const acc = Math.round((seqLength / (seqLength + errors)) * 100);
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: null,
          errorCount: errors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `${reverseOrder ? 'Reverse' : 'Forward'} ${seqLength}-step sequence across ${padCount} pads (${errors} errors).`,
        });
      }
    } else {
      playErrorCue();
      setErrors((e) => e + 1);
    }
  }

  return (
    <div className="space-y-5 text-center">
      <p className="text-xs font-semibold text-slate-700">
        {phase === 'WATCH'
          ? lang === 'hi'
            ? `${seqLength} चरणों का क्रम ध्यान से देखें...`
            : `Watch the ${seqLength}-step sequence across ${padCount} pads${reverseOrder ? ' (you will repeat in REVERSE!)' : ''}...`
          : reverseOrder
            ? `REVERSE MODE: Repeat from LAST flashed pad back to FIRST (${inputIdx}/${seqLength})`
            : `Your turn: repeat the sequence in exact order (${inputIdx}/${seqLength})`}
      </p>

      <div
        className={`grid gap-3 mx-auto ${
          padCount === 9
            ? 'grid-cols-3 max-w-sm'
            : padCount === 6
              ? 'grid-cols-3 max-w-sm'
              : 'grid-cols-2 max-w-xs'
        }`}
      >
        {pads.map((pad) => {
          const lit = showingIdx === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              disabled={phase === 'WATCH'}
              onClick={() => handlePadClick(pad.id)}
              className={`${padCount === 9 ? 'h-20' : 'h-24'} rounded-xl text-sm font-mono font-bold text-white transition-all ${
                lit ? pad.active : pad.color
              } disabled:cursor-not-allowed`}
            >
              {pad.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 8. PICTURE MEMORY (Up to 3x4 Spatial Matrix + Relational / Arithmetic Recall)
// ---------------------------------------------------------------------------
interface MatrixTile {
  row: number;
  col: number;
  sym: string;
  label: string;
  colorName: string;
  colorHex: string;
  badge: number;
}

export const PictureMemoryGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const rows = level <= 2 ? 2 : level === 3 ? 2 : 3;
  const cols = level <= 2 ? 2 : level === 3 ? 3 : level === 4 ? 3 : 4;
  const studySeconds = level <= 2 ? 6 : level === 3 ? 5 : level === 4 ? 5 : 4;

  const { tiles, questions } = useMemo(() => {
    const syms = [
      { sym: '▲', label: 'Triangle' },
      { sym: '●', label: 'Circle' },
      { sym: '◆', label: 'Diamond' },
      { sym: '■', label: 'Square' },
      { sym: '★', label: 'Star' },
      { sym: '✦', label: 'Spark' },
      { sym: '⬡', label: 'Hexagon' },
      { sym: '✚', label: 'Cross' },
      { sym: '◈', label: 'Gem' },
      { sym: '▼', label: 'Delta' },
      { sym: '◉', label: 'Ring' },
      { sym: '◩', label: 'Split' },
    ];
    const colors = [
      { name: 'Blue', hex: '#1D4ED8' },
      { name: 'Red', hex: '#DC2626' },
      { name: 'Emerald', hex: '#059669' },
      { name: 'Amber', hex: '#D97706' },
    ];
    const generated: MatrixTile[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const s = syms[(idx + level) % syms.length];
        const col = colors[(idx * 3 + level) % colors.length];
        const badge = 1 + ((idx * 5 + level * 2) % 9);
        generated.push({
          row: r + 1,
          col: c + 1,
          sym: s.sym,
          label: s.label,
          colorName: col.name,
          colorHex: col.hex,
          badge,
        });
      }
    }

    if (level <= 2) {
      const t0 = generated[0];
      const t1 = generated[1];
      const tLast = generated[generated.length - 1];
      return {
        tiles: generated,
        questions: [
          {
            q: `Which colour was the ${t0.label} (${t0.sym})?`,
            options: ['Blue', 'Red', 'Emerald', 'Amber'],
            answer: t0.colorName,
          },
          {
            q: `Which shape sat in Row 1, Col 2?`,
            options: [t1.label, t0.label, tLast.label, 'Hexagon'].filter((v, i, a) => a.indexOf(v) === i),
            answer: t1.label,
          },
          {
            q: `What number badge was shown on the ${tLast.label} (${tLast.sym})?`,
            options: [String(tLast.badge), String((tLast.badge % 9) + 1), String(((tLast.badge + 2) % 9) + 1), String(((tLast.badge + 4) % 9) + 1)],
            answer: String(tLast.badge),
          },
        ],
      };
    }

    // Level 3-5 relational, spatial, and numerical matrix questions
    const mid = generated[Math.floor(generated.length / 2)];
    const corner = generated[generated.length - 1];
    const row2 = generated.filter((t) => t.row === 2);
    const row2Sum = row2.reduce((s, t) => s + t.badge, 0);
    const blueCount = generated.filter((t) => t.colorName === 'Blue').length;
    const anchor = generated[1];
    const rightOfAnchor = generated.find((t) => t.row === anchor.row && t.col === anchor.col + 1)!;

    const qBank = [
      {
        q: `Which symbol occupied Row ${mid.row}, Column ${mid.col}?`,
        options: Array.from(new Set([mid.label, corner.label, anchor.label, generated[0].label, 'Hexagon'])).slice(0, 4),
        answer: mid.label,
      },
      {
        q: `What was the sum of all badge numbers in Row 2?`,
        options: [String(row2Sum), String(row2Sum + 3), String(Math.max(2, row2Sum - 2)), String(row2Sum + 5)],
        answer: String(row2Sum),
      },
      {
        q: `Which symbol sat immediately to the RIGHT of ${anchor.label} (${anchor.sym})?`,
        options: Array.from(new Set([rightOfAnchor.label, anchor.label, mid.label, corner.label, 'Spark'])).slice(0, 4),
        answer: rightOfAnchor.label,
      },
      {
        q: `What colour and badge number belonged to the bottom-right corner (${corner.label})?`,
        options: [
          `${corner.colorName} · #${corner.badge}`,
          `${colors[(colors.findIndex((c) => c.name === corner.colorName) + 1) % 4].name} · #${corner.badge}`,
          `${corner.colorName} · #${(corner.badge % 9) + 1}`,
          `${colors[(colors.findIndex((c) => c.name === corner.colorName) + 2) % 4].name} · #${((corner.badge + 1) % 9) + 1}`,
        ],
        answer: `${corner.colorName} · #${corner.badge}`,
      },
      {
        q: `How many tiles in the entire ${rows}×${cols} grid were coloured Blue?`,
        options: Array.from(new Set([String(blueCount), String(blueCount + 1), String(Math.max(0, blueCount - 1)), String(blueCount + 2)])).slice(0, 4),
        answer: String(blueCount),
      },
      {
        q: `What was the badge number on the tile at Row 1, Column 1?`,
        options: Array.from(new Set([String(generated[0].badge), String((generated[0].badge % 9) + 1), String(((generated[0].badge + 3) % 9) + 1), String(((generated[0].badge + 5) % 9) + 1)])).slice(0, 4),
        answer: String(generated[0].badge),
      },
    ];

    const countQ = level === 3 ? 4 : level === 4 ? 5 : 6;
    return { tiles: generated, questions: qBank.slice(0, countQ) };
  }, [cols, level, rows]);

  const [countdown, setCountdown] = useState(studySeconds);
  const [phase, setPhase] = useState<'STUDY' | 'QUIZ'>('STUDY');
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: phase === 'STUDY' ? `Study ${countdown}s` : `Q ${qIdx + 1}/${questions.length}`,
      score: Math.round((correct / questions.length) * 100),
      errors,
    });
  }, [phase, countdown, qIdx, questions.length, correct, errors, onHudUpdate]);

  useEffect(() => {
    if (phase !== 'STUDY') return;
    if (countdown <= 0) {
      setPhase('QUIZ');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  function answerQuestion(opt: string) {
    const isHit = opt === questions[qIdx].answer;
    if (isHit) playSuccessChime();
    else playErrorCue();
    const nextCorrect = correct + (isHit ? 1 : 0);
    const nextErrors = errors + (isHit ? 0 : 1);
    setCorrect(nextCorrect);
    setErrors(nextErrors);

    const nextQ = qIdx + 1;
    if (nextQ >= questions.length) {
      playVictoryFanfare();
      const elapsed = Math.max(4, Math.round((Date.now() - startRef.current) / 1000));
      const acc = Math.round((nextCorrect / questions.length) * 100);
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: nextErrors,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Recalled ${nextCorrect}/${questions.length} ${rows}×${cols} visual-spatial matrix details.`,
      });
    } else {
      setQIdx(nextQ);
    }
  }

  return (
    <div className="space-y-4">
      {phase === 'STUDY' ? (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              {lang === 'hi'
                ? `${rows}×${cols} ग्रिड में आकृतियाँ, रंग, स्थान और अंक याद करें`
                : `Memorise positions, symbols, colours & badge numbers in this ${rows}×${cols} matrix`}
            </span>
            <span className="font-mono text-blue-900 tabular-nums">Hides in {countdown}s</span>
          </div>
          <div
            className={`grid gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 ${
              cols === 4 ? 'grid-cols-4' : cols === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {tiles.map((t) => (
              <div key={`${t.row}-${t.col}`} className="rounded-lg border border-slate-200 bg-white p-2.5 text-center">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>R{t.row}C{t.col}</span>
                  <span className="font-bold text-slate-700">#{t.badge}</span>
                </div>
                <div className="my-1 text-2xl font-bold leading-none" style={{ color: t.colorHex }}>
                  {t.sym}
                </div>
                <p className="text-[11px] font-semibold text-slate-800">{t.label}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase('QUIZ')}
            className="text-xs font-semibold text-blue-900 underline"
          >
            Ready for questions now →
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-lg mx-auto">
          <p className="text-sm font-bold text-slate-900">{questions[qIdx].q}</p>
          <div className="grid grid-cols-2 gap-3">
            {questions[qIdx].options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => answerQuestion(opt)}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-900 hover:bg-blue-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 9. NUMBER RECALL (Multi-Stage Random Digit Span + "+1 Mod 10 Reverse" at L5)
// ---------------------------------------------------------------------------
interface DigitStage {
  digits: string;
  mode: 'FORWARD' | 'REVERSE' | 'TRANSFORM_REV';
  expected: string;
}

export const NumberRecallGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const stages = useMemo<DigitStage[]>(() => {
    const count = level >= 4 ? 3 : 2;
    let seed = level * 131 + 29;
    return Array.from({ length: count }, (_, idx) => {
      const len =
        level === 1 ? 4 + idx : level === 2 ? 5 + idx : level === 3 ? 6 + idx : level === 4 ? 7 + (idx >= 2 ? 1 : 0) : 8 + (idx >= 2 ? 1 : 0);
      let d = '';
      for (let k = 0; k < len; k++) {
        seed = (seed * 9301 + 49297) % 233280;
        let ch = seed % 10;
        if (k > 0 && String(ch) === d[k - 1]) ch = (ch + 3) % 10;
        d += String(ch);
      }
      const mode: DigitStage['mode'] =
        level <= 2 ? 'FORWARD' : level === 5 && idx >= 1 ? 'TRANSFORM_REV' : 'REVERSE';
      const expected =
        mode === 'FORWARD'
          ? d
          : mode === 'REVERSE'
            ? d.split('').reverse().join('')
            : d
                .split('')
                .map((x) => String((Number(x) + 1) % 10))
                .reverse()
                .join('');
      return { digits: d, mode, expected };
    });
  }, [level]);

  const [stageIdx, setStageIdx] = useState(0);
  const [phase, setPhase] = useState<'SHOW' | 'RECALL'>('SHOW');
  const [countdown, setCountdown] = useState(4);
  const [entry, setEntry] = useState('');
  const [totalChars, setTotalChars] = useState(0);
  const [matchedCharsTotal, setMatchedCharsTotal] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  const current = stages[Math.min(stageIdx, stages.length - 1)];

  useEffect(() => {
    onHudUpdate({
      progressText: `Span ${stageIdx + 1}/${stages.length} · ${phase === 'SHOW' ? `${countdown}s` : `${entry.length}/${current.digits.length}`}`,
      score: totalChars > 0 ? Math.round((matchedCharsTotal / totalChars) * 100) : 0,
      errors,
    });
  }, [stageIdx, stages.length, phase, countdown, entry.length, current.digits.length, totalChars, matchedCharsTotal, errors, onHudUpdate]);

  useEffect(() => {
    if (phase !== 'SHOW') return;
    if (countdown <= 0) {
      setPhase('RECALL');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = entry.replace(/\s+/g, '');
    let hits = 0;
    for (let i = 0; i < current.expected.length; i++) {
      if (cleaned[i] === current.expected[i]) hits++;
    }
    const stageErr = current.expected.length - hits;
    const nextMatched = matchedCharsTotal + hits;
    const nextTotal = totalChars + current.expected.length;
    const nextErrors = errors + stageErr;

    if (stageErr === 0) playSuccessChime();
    else playErrorCue();

    setMatchedCharsTotal(nextMatched);
    setTotalChars(nextTotal);
    setErrors(nextErrors);

    const nextStage = stageIdx + 1;
    if (nextStage >= stages.length) {
      playVictoryFanfare();
      const acc = Math.round((nextMatched / Math.max(1, nextTotal)) * 100);
      const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: nextErrors,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Completed ${stages.length} working-memory digit spans (${nextMatched}/${nextTotal} digits exact).`,
      });
    } else {
      setStageIdx(nextStage);
      setEntry('');
      setCountdown(level >= 4 ? 4 : 5);
      setPhase('SHOW');
    }
  }

  const instructionText =
    current.mode === 'FORWARD'
      ? 'Enter the digits in the SAME order'
      : current.mode === 'REVERSE'
        ? 'Enter the digits in REVERSE order'
        : 'COGNITIVE TRANSFORM: Add +1 (mod 10, so 9→0) to EACH digit, then enter in REVERSE order!';

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      {phase === 'SHOW' ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-700">
            {lang === 'hi'
              ? `चरण ${stageIdx + 1}/${stages.length} · याद करें (${countdown}s)`
              : `Stage ${stageIdx + 1}/${stages.length}: ${instructionText} · ${countdown}s`}
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 font-mono text-2xl sm:text-3xl font-bold tracking-widest text-blue-950 tabular-nums">
            {current.digits.split('').join(' ')}
          </div>
          <button
            type="button"
            onClick={() => setPhase('RECALL')}
            className="text-xs font-semibold text-blue-900 underline"
          >
            Enter answer now →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="num-recall-input" className="block text-xs font-semibold text-slate-700">
            {instructionText} ({current.digits.length} digits):
          </label>
          <input
            id="num-recall-input"
            type="text"
            autoFocus
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={`${current.digits.length} digits`}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center font-mono text-xl tracking-widest tabular-nums"
          />
          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-blue-900 px-4 text-xs font-semibold text-white hover:bg-blue-800"
          >
            {stageIdx + 1 < stages.length ? 'Submit & Next Span' : 'Verify Final Span'}
          </button>
        </form>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 10. WORD RECALL (Up to 12 Senior Academic Concepts + Phonological Foils)
// ---------------------------------------------------------------------------
export const WordRecallGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const { targets, foils } = useMemo(() => buildWordRecallBank(level as DifficultyLevel), [level]);
  const wordCount = targets.length;
  const mixedList = useMemo(
    () => [...targets, ...foils].sort((a, b) => a.localeCompare(b)),
    [targets, foils],
  );

  const studySec = level <= 3 ? 5 : level === 4 ? 7 : 8;
  const [phase, setPhase] = useState<'STUDY' | 'SELECT'>('STUDY');
  const [countdown, setCountdown] = useState(studySec);
  const [picked, setPicked] = useState<string[]>([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: phase === 'STUDY' ? `Study ${countdown}s` : `${picked.length}/${wordCount}`,
      score: Math.round((picked.filter((w) => targets.includes(w)).length / wordCount) * 100),
      errors: picked.filter((w) => !targets.includes(w)).length,
    });
  }, [phase, countdown, picked, wordCount, targets, onHudUpdate]);

  useEffect(() => {
    if (phase !== 'STUDY') return;
    if (countdown <= 0) {
      setPhase('SELECT');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  function toggleWord(word: string) {
    setPicked((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word],
    );
  }

  function handleCheck() {
    const hits = picked.filter((w) => targets.includes(w)).length;
    const falseAlarms = picked.filter((w) => !targets.includes(w)).length;
    const omissions = wordCount - hits;
    const err = falseAlarms + omissions;
    const acc = Math.max(0, Math.round(((hits - falseAlarms * 0.5) / wordCount) * 100));
    playVictoryFanfare();
    const elapsed = Math.max(4, Math.round((Date.now() - startRef.current) / 1000));
    onFinish({
      accuracyPct: acc,
      completionTimeSec: elapsed,
      reactionTimeMs: null,
      errorCount: err,
      scorePoints: acc,
      completed: true,
      summaryDetail: `Recalled ${hits}/${wordCount} target terms (${omissions} omitted, ${falseAlarms} near-homograph foils picked).`,
    });
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {phase === 'STUDY' ? (
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold text-slate-600">
            {lang === 'hi'
              ? `इन ${wordCount} शब्दों को ध्यान से याद करें (${countdown}s शेष)`
              : `Study these ${wordCount} exact terms carefully — similar-looking foils will appear next (${countdown}s left)`}
          </p>
          <div className={`grid gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 ${wordCount >= 10 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {targets.map((w) => (
              <div key={w} className="rounded-lg bg-white border border-slate-200 py-2.5 px-2 text-xs sm:text-sm font-bold text-slate-900">
                {w}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPhase('SELECT')}
            className="text-xs font-semibold text-blue-900 underline"
          >
            Start word selection →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-700">
            Select ONLY the {wordCount} exact words from your study list ({picked.length}/{wordCount} selected):
          </p>
          <div className={`grid gap-2 ${mixedList.length >= 20 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {mixedList.map((w) => {
              const active = picked.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWord(w)}
                  className={`min-h-10 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleCheck}
            className="w-full h-11 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Submit Recalled Words
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 11. STORY SEQUENCE (Level-Graded Unnumbered Process & Causal Chains)
// ---------------------------------------------------------------------------
export const StorySequenceGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const correctOrder = useMemo(() => buildStorySequenceSteps(level as DifficultyLevel), [level]);
  const count = correctOrder.length;
  const [shuffled] = useState(() => {
    const arr = [...correctOrder];
    let seed = level * 47 + 13;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${selectedOrder.length}/${count}`,
      score: Math.round((selectedOrder.length / count) * 100),
      errors: 0,
    });
  }, [selectedOrder.length, count, onHudUpdate]);

  function pickCard(card: string) {
    if (selectedOrder.includes(card)) {
      setSelectedOrder((prev) => prev.filter((c) => c !== card));
      return;
    }
    const next = [...selectedOrder, card];
    setSelectedOrder(next);
    playSuccessChime();
    if (next.length === count) {
      let matches = 0;
      next.forEach((step, idx) => {
        if (step === correctOrder[idx]) matches++;
      });
      const acc = Math.round((matches / count) * 100);
      const err = count - matches;
      playVictoryFanfare();
      const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: err,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Ordered ${matches}/${count} causal sequence stages accurately in ${elapsed}s.`,
      });
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-700">
        {lang === 'hi'
          ? `घटनाओं को पहले से अंतिम (${count}) तक सही क्रम में क्लिक करें:`
          : `Click the ${count} shuffled stages in exact chronological/causal order from Step 1 to Step ${count}:`}
      </p>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {shuffled.map((card) => {
          const orderIdx = selectedOrder.indexOf(card);
          return (
            <button
              key={card}
              type="button"
              onClick={() => pickCard(card)}
              className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                orderIdx >= 0
                  ? 'border-blue-900 bg-blue-50 text-blue-950'
                  : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{card}</span>
              <span className="font-mono font-bold text-blue-900 ml-3 shrink-0 tabular-nums">
                {orderIdx >= 0 ? `#${orderIdx + 1}` : 'Select'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
