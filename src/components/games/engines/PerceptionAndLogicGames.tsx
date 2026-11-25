import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildChessPuzzleBank,
  buildLogicEscapeStages,
  buildNumberDetectiveStages,
  buildSudokuPuzzle,
  hasSudokuCellConflict,
  type ChessPiecePlacement,
  type DifficultyLevel,
} from '../../../utils/cognitiveGamePuzzles';
import { playErrorCue, playSuccessChime, playVictoryFanfare } from '../../../utils/soundFx';
import type { PlayableEngineProps } from './gameEngineTypes';

// ---------------------------------------------------------------------------
// 12–16: PERCEPTION & SPATIAL REASONING (Raven 3x3 Matrices, D4 Chirality,
//        Camouflaged Hidden Figures, 3D Isometric Cube Dissection)
// ---------------------------------------------------------------------------
interface RavenCellSpec {
  shape: 'triangle' | 'square' | 'diamond' | 'circle';
  rot: number;
  fill: 'empty' | 'striped' | 'solid';
  dots: number;
}

const RavenTileSvg: React.FC<{ cell: RavenCellSpec; sizeClass?: string }> = ({
  cell,
  sizeClass = 'h-14 w-14',
}) => {
  const fillVal =
    cell.fill === 'solid'
      ? '#1E3A8A'
      : cell.fill === 'striped'
        ? '#93C5FD'
        : 'none';
  return (
    <svg viewBox="0 0 60 60" className={sizeClass}>
      <g transform={`rotate(${cell.rot} 30 30)`}>
        {cell.shape === 'triangle' && (
          <polygon points="30,10 50,46 10,46" fill={fillVal} stroke="#1E3A8A" strokeWidth="2.5" />
        )}
        {cell.shape === 'square' && (
          <rect x="13" y="13" width="34" height="34" fill={fillVal} stroke="#1E3A8A" strokeWidth="2.5" />
        )}
        {cell.shape === 'diamond' && (
          <polygon points="30,8 50,30 30,52 10,30" fill={fillVal} stroke="#1E3A8A" strokeWidth="2.5" />
        )}
        {cell.shape === 'circle' && (
          <circle cx="30" cy="30" r="18" fill={fillVal} stroke="#1E3A8A" strokeWidth="2.5" />
        )}
      </g>
      {cell.dots >= 1 && (
        <circle cx={cell.dots === 1 ? 30 : 23} cy="53" r="2.6" fill="#D97706" />
      )}
      {cell.dots >= 2 && <circle cx={cell.dots === 2 ? 37 : 30} cy="53" r="2.6" fill="#D97706" />}
      {cell.dots >= 3 && <circle cx="37" cy="53" r="2.6" fill="#D97706" />}
    </svg>
  );
};

function buildRavenPuzzle(round: number, level: DifficultyLevel) {
  const shapes: RavenCellSpec['shape'][] = ['triangle', 'square', 'diamond'];
  const fills: RavenCellSpec['fill'][] = ['empty', 'striped', 'solid'];
  const rots = [0, 90, 180, 270];

  const cells: RavenCellSpec[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (round % 5 === 0) {
        // Latin square shape + row fill + col dots
        cells.push({
          shape: shapes[(r + c) % 3],
          rot: 0,
          fill: fills[r % 3],
          dots: ((c + r) % 3) + 1,
        });
      } else if (round % 5 === 1) {
        // Progressive rotation (+90 per col, +90 per row) + alternating fill
        cells.push({
          shape: 'triangle',
          rot: rots[(r + c + level) % 4],
          fill: fills[(r + c) % 3],
          dots: (c % 3) + 1,
        });
      } else if (round % 5 === 2) {
        // Constant shape per row, column rotation, cyclic dot count
        cells.push({
          shape: shapes[r % 3],
          rot: c * 90,
          fill: fills[(r * 2 + c) % 3],
          dots: ((r + 2 * c) % 3) + 1,
        });
      } else if (round % 5 === 3) {
        // Multi-attribute shift: shape shifts -1, fill shifts +1, dots = (3 - (r+c)%3)
        cells.push({
          shape: shapes[(2 * r + c) % 3],
          rot: ((r + c) % 2) * 45,
          fill: fills[(r + 2 * c) % 3],
          dots: 3 - ((r + c) % 3),
        });
      } else {
        // Senior L5 rule: shape Latin square + rot = (r + 2*c)*90 + fill invariant on anti-diagonal
        cells.push({
          shape: shapes[(r + 2 * c) % 3],
          rot: rots[(r + 2 * c) % 4],
          fill: fills[(r + c) % 3],
          dots: ((r * 2 + c + level) % 3) + 1,
        });
      }
    }
  }
  const ans = cells[8];
  const optionPool: RavenCellSpec[] = [
    ans,
    { ...ans, shape: shapes[(shapes.indexOf(ans.shape) + 1) % 3] },
    { ...ans, fill: fills[(fills.indexOf(ans.fill) + 1) % 3] },
    {
      ...ans,
      dots: (ans.dots % 3) + 1,
      rot: (ans.rot + 90) % 360,
    },
  ];
  const shuffled = optionPool
    .map((spec, idx) => ({ spec, isAns: idx === 0, key: `${idx}-${spec.shape}-${spec.fill}-${spec.dots}-${spec.rot}` }))
    .sort((a, b) => ((a.key.length * 13 + round * 7) % 19) - ((b.key.length * 13 + round * 7) % 19));

  return { given: cells.slice(0, 8), options: shuffled };
}

export const PerceptionVisualGame: React.FC<PlayableEngineProps> = ({
  gameId,
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const [round, setRound] = useState(0);
  const totalRounds = level >= 4 ? 5 : level === 3 ? 4 : 3;
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${round}/${totalRounds}`,
      score: Math.round((hits / totalRounds) * 100),
      errors,
    });
  }, [round, totalRounds, hits, errors, onHudUpdate]);

  const puzzle = useMemo(() => {
    const lvl = level as DifficultyLevel;
    if (gameId === 'shape-rotation') {
      const deg = ((round + level) % 3 + 1) * 90;
      const isCompound = level >= 5 && round % 2 === 1;
      const allOpts = isCompound
        ? [
            { id: 'match', transform: `translate(100 0) scale(-1 1) rotate(${deg} 50 50)`, label: 'Option A' },
            { id: 'pureRot', transform: `rotate(${deg} 50 50)`, label: 'Option B' },
            { id: 'wrongFlip', transform: `translate(0 100) scale(1 -1) rotate(${deg} 50 50)`, label: 'Option C' },
            { id: 'wrongDeg', transform: `translate(100 0) scale(-1 1) rotate(${(deg + 90) % 360} 50 50)`, label: 'Option D' },
            { id: 'wrongRot2', transform: `rotate(${(deg + 180) % 360} 50 50)`, label: 'Option E' },
            { id: 'ident', transform: 'rotate(0 50 50)', label: 'Option F' },
          ]
        : [
            { id: 'match', transform: `rotate(${deg} 50 50)`, label: 'Option A' },
            { id: 'mirror', transform: `translate(100 0) scale(-1 1) rotate(${deg} 50 50)`, label: 'Option B' },
            { id: 'wrong1', transform: `rotate(${(deg + 90) % 360} 50 50)`, label: 'Option C' },
            { id: 'wrong2', transform: `translate(0 100) scale(1 -1) rotate(${deg} 50 50)`, label: 'Option D' },
            { id: 'wrong3', transform: `rotate(${(deg + 180) % 360} 50 50)`, label: 'Option E' },
            { id: 'wrong4', transform: `translate(100 100) scale(-1 -1) rotate(90 50 50)`, label: 'Option F' },
          ];
      const shown = allOpts.slice(0, level >= 4 ? 6 : 4);
      const rotatedOrder = shown
        .map((o, idx) => ({ ...o, label: `Option ${String.fromCharCode(65 + idx)}` }))
        .sort((a, b) => ((a.id.charCodeAt(0) * 11 + round * 5) % 13) - ((b.id.charCodeAt(0) * 11 + round * 5) % 13))
        .map((o, idx) => ({ ...o, label: `Option ${String.fromCharCode(65 + idx)}` }));
      return {
        kind: 'rotation' as const,
        complexShape: level >= 4,
        prompt: isCompound
          ? `Compound Transform: First rotate ${deg}° clockwise, THEN reflect across the VERTICAL mirror axis:`
          : `Which figure shows the reference shape rotated ${deg}° clockwise (NO reflection)?`,
        promptHi: isCompound
          ? `पहले ${deg}° दक्षिणावर्त घुमाएँ, फिर ऊर्ध्वाधर दर्पण प्रतिबिंब चुनें:`
          : `मुख्य आकृति को ${deg}° दक्षिणावर्त घुमाने पर कौन-सी आकृति बनेगी?`,
        options: rotatedOrder,
        correctId: 'match',
      };
    }

    if (gameId === 'mirror-image') {
      const horiz = level >= 4 && round % 2 === 1;
      const allOpts = horiz
        ? [
            { id: 'mirror', transform: 'translate(0 100) scale(1 -1)', label: 'A' },
            { id: 'flipX', transform: 'translate(100 0) scale(-1 1)', label: 'B' },
            { id: 'rot90', transform: 'rotate(90 50 50)', label: 'C' },
            { id: 'rot180', transform: 'rotate(180 50 50)', label: 'D' },
            { id: 'rot270', transform: 'rotate(270 50 50)', label: 'E' },
            { id: 'flipRot', transform: 'translate(100 0) scale(-1 1) rotate(90 50 50)', label: 'F' },
          ]
        : [
            { id: 'mirror', transform: 'translate(100 0) scale(-1 1)', label: 'A' },
            { id: 'flipY', transform: 'translate(0 100) scale(1 -1)', label: 'B' },
            { id: 'rot90', transform: 'rotate(90 50 50)', label: 'C' },
            { id: 'rot180', transform: 'rotate(180 50 50)', label: 'D' },
            { id: 'rot270', transform: 'rotate(270 50 50)', label: 'E' },
            { id: 'flipRot', transform: 'translate(0 100) scale(1 -1) rotate(90 50 50)', label: 'F' },
          ];
      const shown = allOpts
        .slice(0, level >= 4 ? 6 : 4)
        .sort((a, b) => ((a.id.charCodeAt(0) * 7 + round * 3) % 11) - ((b.id.charCodeAt(0) * 7 + round * 3) % 11))
        .map((o, idx) => ({ ...o, label: `Option ${String.fromCharCode(65 + idx)}` }));
      return {
        kind: 'mirror' as const,
        complexShape: level >= 4,
        prompt: horiz
          ? 'Horizontal Water-Axis Reflection: Which option reflects the shape top-to-bottom across a HORIZONTAL line?'
          : 'Vertical Mirror Reflection: Which option shows the exact left-to-right reflection?',
        promptHi: horiz ? 'क्षैतिज (जल) दर्पण प्रतिबिंब चुनें:' : 'ऊर्ध्वाधर दर्पण प्रतिबिंब चुनें:',
        options: shown,
        correctId: 'mirror',
      };
    }

    if (gameId === 'pattern-detective') {
      if (level >= 3) {
        return { kind: 'raven' as const, matrix: buildRavenPuzzle(round, lvl) };
      }
      const patterns = [
        { seq: ['●', '▲', '■', '●', '▲'], choices: ['■', '●', '▲', '◆'], ans: '■' },
        { seq: ['2★', '4★', '6★', '8★'], choices: ['10★', '9★', '12★', '7★'], ans: '10★' },
        { seq: ['↗', '↘', '↙', '↖'], choices: ['↗', '↓', '←', '↘'], ans: '↗' },
      ];
      return { kind: 'pattern' as const, data: patterns[round % patterns.length] };
    }

    if (gameId === 'hidden-figures') {
      // Genuine Witkin Embedded Figures: Target polygon at top, dense UNIFORM-SLATE line mesh below (no blue spoiler highlight!)
      const embeddedBank = [
        {
          targetPts: '15,10 65,10 40,55',
          q: 'Which quadrant / sector inside the camouflaged line grid embeds this EXACT upright equilateral wedge?',
          choices: ['Upper-Center Vertex', 'Bottom-Left Corner', 'Bottom-Right Corner', 'Upper-Left Wing'],
          ans: 'Upper-Center Vertex',
          variant: 0,
        },
        {
          targetPts: '15,48 40,12 65,48 52,48 40,30 28,48',
          q: 'Where is this symmetric chevron / kite-notch cleanly traced along existing grid strokes?',
          choices: ['Centered Peak', 'Left Edge Vertical', 'Right Flank Inverted', 'Not present in left half'],
          ans: 'Centered Peak',
          variant: 1,
        },
        {
          targetPts: '15,15 55,15 68,45 28,45',
          q: 'Locate the parallelogram of matching slant and aspect ratio hidden inside the uniform mesh:',
          choices: ['Left-Mid Band (Top-Left to Center)', 'Top-Right Triangle Only', 'Lower Border Inverted', 'Center Vertical Rhombus'],
          ans: 'Left-Mid Band (Top-Left to Center)',
          variant: 2,
        },
        {
          targetPts: '20,12 58,12 58,48 34,48',
          q: 'Which region embeds this right-angled trapezoid without adding any new line segments?',
          choices: ['Right-Half Chamber', 'Left-Half Upper Cell', 'Bottom-Center Span', 'Diagonal Corner'],
          ans: 'Right-Half Chamber',
          variant: 3,
        },
        {
          targetPts: '22,10 56,30 22,50',
          q: 'Which sector embeds this right-pointing acute wedge cleanly along the existing diagonals?',
          choices: ['Left-to-Center Wedge', 'Top-Right Horizontal', 'Bottom-Right Vertical', 'Center Vertical Band'],
          ans: 'Left-to-Center Wedge',
          variant: 4,
        },
      ];
      return { kind: 'hidden' as const, data: embeddedBank[round % embeddedBank.length], round };
    }

    // spatial-builder: L4-5 features Isometric Cube Stack Counting + 3D Painted Cube Dissection + 2D Net Folding
    const spatialBank =
      level <= 2
        ? [
            { kind: 'stack' as const, q: 'Count the total unit cubes in this 3D stepped block:', choices: ['6', '8', '9', '10'], ans: '8', mode: '2x2' as const },
            { kind: 'net' as const, q: 'When this 6-square cross net folds into a cube, which face sits OPPOSITE Face 1?', choices: ['Face 2', 'Face 3', 'Face 4', 'Face 6'], ans: 'Face 3', mode: 'net1' as const },
            { kind: 'stack' as const, q: 'Count every cube in this 3-step tower (including hidden cubes underneath):', choices: ['9', '10', '11', '12'], ans: '10', mode: 'stairs3' as const },
          ]
        : [
            { kind: 'stack' as const, q: 'Count ALL unit cubes in this 3-tier asymmetric tower (include hidden supporting cubes under upper layers!):', choices: ['12', '13', '14', '15'], ans: '14', mode: 'stairs3' as const },
            { kind: 'dissect' as const, q: 'A solid 3×3×3 cube (27 unit cubes) is painted blue on ALL 6 outer faces, then sliced. How many unit cubes have EXACTLY 2 painted faces?', choices: ['8', '12', '6', '1'], ans: '12', mode: 'cube3' as const },
            { kind: 'net' as const, q: 'Fold the numbered cross net into a closed cube (numbers on OUTSIDE). Which face sits OPPOSITE Face 5?', choices: ['Face 2', 'Face 4', 'Face 6', 'Face 1'], ans: 'Face 6', mode: 'net1' as const },
            { kind: 'dissect' as const, q: 'A solid 4×4×4 cube (64 unit cubes) is painted emerald on all 6 faces and sliced. How many interior unit cubes have ZERO painted faces?', choices: ['4', '8', '12', '16'], ans: '8', mode: 'cube4' as const },
            { kind: 'dissect' as const, q: 'In a painted 4×4×4 cube sliced into 64 unit cubes, how many edge cubes have EXACTLY 2 painted faces?', choices: ['16', '24', '32', '12'], ans: '24', mode: 'cube4' as const },
          ];
    return { kind: 'spatial' as const, data: spatialBank[round % spatialBank.length] };
  }, [gameId, round, level]);

  function handleAnswer(isCorrect: boolean) {
    if (isCorrect) playSuccessChime();
    else playErrorCue();

    const nextHits = hits + (isCorrect ? 1 : 0);
    const nextErr = errors + (isCorrect ? 0 : 1);
    setHits(nextHits);
    setErrors(nextErr);

    const nextRound = round + 1;
    if (nextRound >= totalRounds) {
      playVictoryFanfare();
      const acc = Math.round((nextHits / totalRounds) * 100);
      const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: nextErr,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Solved ${nextHits}/${totalRounds} Level-${level} visual-spatial discrimination rounds.`,
      });
    } else {
      setRound(nextRound);
    }
  }

  function renderShapeBody(complex: boolean) {
    if (!complex) {
      return (
        <>
          <polygon points="26,20 44,20 44,64 74,64 74,80 26,80" fill="#1E3A8A" />
          <circle cx="35" cy="30" r="4" fill="#F59E0B" />
        </>
      );
    }
    return (
      <>
        <polygon points="22,16 52,16 52,32 36,32 36,64 78,64 78,82 22,82" fill="#1E3A8A" />
        <circle cx="32" cy="24" r="4.5" fill="#F59E0B" />
        <polygon points="64,67 74,73 64,79" fill="#10B981" />
      </>
    );
  }

  if (puzzle.kind === 'rotation' || puzzle.kind === 'mirror') {
    return (
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-700">
          {lang === 'hi' ? puzzle.promptHi : puzzle.prompt}
        </p>
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Reference Figure</p>
            <svg viewBox="0 0 100 100" className="h-24 w-24 rounded-lg border border-slate-300 bg-white">
              {renderShapeBody(puzzle.complexShape)}
            </svg>
          </div>
        </div>
        <div
          className={`grid gap-3 ${
            puzzle.options.length === 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
          }`}
        >
          {puzzle.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleAnswer(opt.id === puzzle.correctId)}
              className="rounded-xl border border-slate-300 bg-white p-2.5 hover:border-blue-800 flex flex-col items-center gap-1.5"
            >
              <svg viewBox="0 0 100 100" className="h-20 w-20">
                <g transform={opt.transform}>{renderShapeBody(puzzle.complexShape)}</g>
              </svg>
              <span className="text-xs font-semibold text-slate-700">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (puzzle.kind === 'raven') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold text-slate-700">
          {lang === 'hi'
            ? '3×3 मैट्रिक्स में पंक्ति और स्तंभ दोनों नियमों को पहचानकर लुप्त टाइल चुनें:'
            : 'Deduce BOTH the row and column transformation rules in this 3×3 matrix to complete the bottom-right cell:'}
        </p>
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto rounded-xl border border-slate-300 bg-slate-100 p-3">
          {puzzle.matrix.given.map((cell, idx) => (
            <div key={idx} className="rounded-lg border border-slate-300 bg-white p-1.5 flex items-center justify-center">
              <RavenTileSvg cell={cell} sizeClass="h-14 w-14" />
            </div>
          ))}
          <div className="rounded-lg border-2 border-dashed border-blue-800 bg-blue-50 flex items-center justify-center font-mono text-xl font-bold text-blue-900">
            ?
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {puzzle.matrix.options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleAnswer(opt.isAns)}
              className="rounded-xl border border-slate-300 bg-white p-2.5 hover:border-blue-800 flex items-center justify-center"
            >
              <RavenTileSvg cell={opt.spec} sizeClass="h-14 w-14" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (puzzle.kind === 'pattern') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold text-slate-700">
          {lang === 'hi' ? 'पैटर्न में अगली आकृति चुनें:' : 'Predict the next tile in the visual pattern:'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          {puzzle.data.seq.map((item, i) => (
            <div key={i} className="h-14 w-14 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-xl font-bold text-slate-900">
              {item}
            </div>
          ))}
          <div className="h-14 w-14 rounded-lg border-2 border-dashed border-blue-800 bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-900">
            ?
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {puzzle.data.choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleAnswer(c === puzzle.data.ans)}
              className="rounded-lg border border-slate-300 bg-white py-3 text-lg font-bold text-slate-900 hover:bg-blue-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (puzzle.kind === 'hidden') {
    return (
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-700">{puzzle.data.q}</p>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="sm:col-span-4 text-center">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">Target Figure</p>
            <svg viewBox="0 0 80 62" className="mx-auto h-20 w-24 rounded-lg border border-slate-300 bg-white">
              <polygon points={puzzle.data.targetPts} fill="none" stroke="#1E3A8A" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="sm:col-span-8 flex justify-center">
            {/* Uniform-slate camouflaged line mesh — ZERO colour spoilers */}
            <svg viewBox="0 0 220 140" className="h-44 w-72 rounded-lg border border-slate-300 bg-white">
              <g stroke="#334155" strokeWidth="1.6">
                <rect x="20" y="16" width="180" height="108" fill="none" />
                <line x1="110" y1="16" x2="110" y2="124" />
                <line x1="20" y1="70" x2="200" y2="70" />
                <line x1="20" y1="16" x2="200" y2="124" />
                <line x1="200" y1="16" x2="20" y2="124" />
                <line x1="65" y1="16" x2="110" y2="124" />
                <line x1="155" y1="16" x2="110" y2="124" />
                <line x1="65" y1="16" x2="155" y2="16" />
                <line x1="80" y1="16" x2="140" y2="16" />
                <line x1="80" y1="16" x2="110" y2="70" />
                <line x1="140" y1="16" x2="110" y2="70" />
                <line x1="65" y1="124" x2="110" y2="38" />
                <line x1="155" y1="124" x2="110" y2="38" />
                <line x1="20" y1="42" x2="110" y2="70" />
                <line x1="20" y1="98" x2="110" y2="70" />
                <line x1="110" y1="16" x2="170" y2="16" />
                <line x1="170" y1="16" x2="170" y2="100" />
                <line x1="170" y1="100" x2="110" y2="100" />
                <line x1="50" y1="16" x2="90" y2="70" />
                <line x1="20" y1="70" x2="90" y2="70" />
              </g>
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {puzzle.data.choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleAnswer(c === puzzle.data.ans)}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-blue-50"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // spatial-builder with isometric visual diagrams & cube net SVG
  return (
    <div className="space-y-4 max-w-lg mx-auto text-center">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex justify-center">
        {puzzle.data.kind === 'net' ? (
          <svg viewBox="0 0 180 120" className="h-28 w-44">
            {[
              { x: 65, y: 10, n: 1 },
              { x: 35, y: 40, n: 5 },
              { x: 65, y: 40, n: 2 },
              { x: 95, y: 40, n: 6 },
              { x: 65, y: 70, n: 3 },
              { x: 65, y: 98, n: 4 },
            ].map((sq) => (
              <g key={sq.n}>
                <rect x={sq.x} y={sq.y} width="26" height="26" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="1.8" />
                <text x={sq.x + 13} y={sq.y + 17} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0F172A">
                  {sq.n}
                </text>
              </g>
            ))}
          </svg>
        ) : puzzle.data.mode === 'cube3' || puzzle.data.mode === 'cube4' ? (
          <svg viewBox="0 0 140 120" className="h-28 w-36">
            <polygon points="70,12 118,36 70,60 22,36" fill="#3B82F6" stroke="#1E293B" strokeWidth="1.5" />
            <polygon points="22,36 70,60 70,108 22,84" fill="#1D4ED8" stroke="#1E293B" strokeWidth="1.5" />
            <polygon points="118,36 70,60 70,108 118,84" fill="#1E3A8A" stroke="#1E293B" strokeWidth="1.5" />
            <text x="70" y="88" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#FFFFFF">
              {puzzle.data.mode === 'cube4' ? '4×4×4' : '3×3×3'}
            </text>
          </svg>
        ) : (
          <svg viewBox="0 0 180 120" className="h-28 w-44">
            {/* Stepped 3D cube stack diagram: 3x3 base (9) + 2x2 middle (4) + 1 top (1) = 14 */}
            <rect x="25" y="78" width="130" height="24" rx="2" fill="#1E3A8A" opacity="0.85" />
            <text x="90" y="94" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="bold">
              {puzzle.data.mode === '2x2' ? 'Bottom Layer: 2×2' : 'Layer 1 (Bottom): 3×3'}
            </text>
            <rect x="45" y="50" width="90" height="24" rx="2" fill="#2563EB" />
            <text x="90" y="66" textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="bold">
              {puzzle.data.mode === '2x2' ? 'Top Layer: 2×2' : 'Layer 2 (Middle): 2×2'}
            </text>
            {puzzle.data.mode === 'stairs3' && (
              <>
                <rect x="72" y="22" width="36" height="24" rx="2" fill="#60A5FA" stroke="#1E3A8A" />
                <text x="90" y="38" textAnchor="middle" fontSize="10" fill="#0F172A" fontWeight="bold">
                  Top: 1
                </text>
              </>
            )}
          </svg>
        )}
      </div>
      <p className="text-sm font-bold text-slate-900">{puzzle.data.q}</p>
      <div className="grid grid-cols-2 gap-3">
        {puzzle.data.choices.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleAnswer(c === puzzle.data.ans)}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-900 hover:bg-blue-50"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 21. SUDOKU CHALLENGE (4x4 L1-2, 6x6 L3, Authentic 9x9 at Levels 4-5)
// ---------------------------------------------------------------------------
export const SudokuChallengeGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const [variant, setVariant] = useState(0);
  const puzzle = useMemo(
    () => buildSudokuPuzzle(level as DifficultyLevel, variant),
    [level, variant],
  );
  const { size, boxRows, boxCols, solution, fixedMask } = puzzle;

  const [grid, setGrid] = useState<number[][]>(() =>
    solution.map((row, r) => row.map((v, c) => (fixedMask[r][c] ? v : 0))),
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  function resetWithVariant(nextVariant: number) {
    const nextCfg = buildSudokuPuzzle(level as DifficultyLevel, nextVariant);
    setVariant(nextVariant);
    setGrid(
      nextCfg.solution.map((row, r) => row.map((v, c) => (nextCfg.fixedMask[r][c] ? v : 0))),
    );
    setSelectedCell(null);
    setHintsUsed(0);
    setErrors(0);
    startRef.current = Date.now();
  }

  const filledCount = grid.flat().filter((n) => n > 0).length;
  const totalCells = size * size;

  useEffect(() => {
    onHudUpdate({
      progressText: `${filledCount}/${totalCells} (${size}×${size})`,
      score: Math.round((filledCount / totalCells) * 100),
      errors,
    });
  }, [filledCount, totalCells, size, errors, onHudUpdate]);

  function setCellValue(r: number, c: number, digit: number) {
    if (fixedMask[r][c]) return;
    setGrid((prev) =>
      prev.map((row, ri) => row.map((val, ci) => (ri === r && ci === c ? digit : val))),
    );
  }

  useEffect(() => {
    if (!selectedCell) return;
    const onKey = (e: KeyboardEvent) => {
      const [sr, sc] = selectedCell;
      if (fixedMask[sr]?.[sc]) return;
      if (e.key >= '1' && e.key <= String(size)) {
        setCellValue(sr, sc, Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        setCellValue(sr, sc, 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCell, size, fixedMask]);

  function applyHint() {
    if (selectedCell) {
      const [sr, sc] = selectedCell;
      if (!fixedMask[sr][sc] && grid[sr][sc] !== solution[sr][sc]) {
        setHintsUsed((h) => h + 1);
        setCellValue(sr, sc, solution[sr][sc]);
        playSuccessChime();
        return;
      }
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== solution[r][c]) {
          setHintsUsed((h) => h + 1);
          setCellValue(r, c, solution[r][c]);
          playSuccessChime();
          return;
        }
      }
    }
  }

  function handleCheckGrid() {
    let wrong = 0;
    let editable = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!fixedMask[r][c]) {
          editable++;
          if (grid[r][c] !== solution[r][c]) wrong++;
        }
      }
    }
    if (wrong > 0) {
      playErrorCue();
      setErrors((e) => e + wrong);
      return;
    }
    playVictoryFanfare();
    const acc = Math.max(40, Math.round(((editable - hintsUsed) / Math.max(1, editable)) * 100));
    const elapsed = Math.max(4, Math.round((Date.now() - startRef.current) / 1000));
    onFinish({
      accuracyPct: acc,
      completionTimeSec: elapsed,
      reactionTimeMs: null,
      errorCount: errors,
      scorePoints: acc,
      completed: true,
      summaryDetail: `Solved ${size}×${size} Sudoku in ${elapsed}s with ${hintsUsed} hints and ${errors} check errors.`,
    });
  }

  return (
    <div className="space-y-3 max-w-md mx-auto text-center">
      <p className="text-xs font-medium text-slate-600">
        {lang === 'hi'
          ? `${size}×${size} सुडोकू: किसी भी सफेद खाने को चुनें और नीचे दिए अंक (1–${size}) भरें।`
          : `${size}×${size} Sudoku: Click any white cell, then tap a digit (1–${size}) or press keyboard 1–${size}.`}
      </p>

      <div
        className={`grid gap-0.5 rounded-xl border-2 border-slate-800 bg-slate-800 p-1 mx-auto ${
          size === 9 ? 'grid-cols-9 max-w-[380px]' : size === 6 ? 'grid-cols-6 max-w-xs' : 'grid-cols-4 max-w-[260px]'
        }`}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const fixed = fixedMask[r][c];
            const isSel = selectedCell?.[0] === r && selectedCell?.[1] === c;
            const conflict = !fixed && hasSudokuCellConflict(grid, r, c, boxRows, boxCols);
            const thickRight = (c + 1) % boxCols === 0 && c + 1 < size;
            const thickBottom = (r + 1) % boxRows === 0 && r + 1 < size;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => {
                  if (fixed) return;
                  setSelectedCell([r, c]);
                  if (size <= 4) {
                    setCellValue(r, c, (val % size) + 1);
                  }
                }}
                className={`${
                  size === 9 ? 'h-9 sm:h-10 text-sm' : size === 6 ? 'h-11 text-base' : 'h-14 text-xl'
                } font-mono font-bold tabular-nums transition-colors ${
                  thickRight ? 'mr-0.5' : ''
                } ${thickBottom ? 'mb-0.5' : ''} ${
                  fixed
                    ? 'bg-slate-100 text-slate-900 cursor-default'
                    : isSel
                      ? 'bg-blue-100 text-blue-950 ring-2 ring-inset ring-blue-700'
                      : conflict
                        ? 'bg-red-50 text-red-700'
                        : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
              >
                {val > 0 ? val : ''}
              </button>
            );
          }),
        )}
      </div>

      {/* Digit Entry Keypad */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: size }, (_, i) => i + 1).map((d) => (
          <button
            key={d}
            type="button"
            disabled={!selectedCell}
            onClick={() => {
              if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], d);
            }}
            className="h-10 w-10 rounded-lg border border-slate-300 bg-white font-mono text-sm font-bold text-slate-900 hover:bg-blue-50 disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          disabled={!selectedCell}
          onClick={() => {
            if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 0);
          }}
          className="h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          Erase
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => resetWithVariant(variant + 1)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
        >
          New Board
        </button>
        <button
          type="button"
          onClick={applyHint}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
        >
          Hint ({hintsUsed})
        </button>
        <button
          type="button"
          onClick={handleCheckGrid}
          className="flex-1 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
        >
          Verify Sudoku
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 23. CHESS TACTICS (1-ply L1-3, Forced 2-Ply Combinations L4-5)
// ---------------------------------------------------------------------------
export const ChessTacticsGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const bank = useMemo(() => buildChessPuzzleBank(level as DifficultyLevel), [level]);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [boardPieces, setBoardPieces] = useState<ChessPiecePlacement[]>(() => bank[0].pieces);
  const [selectedSq, setSelectedSq] = useState<string | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const [errors, setErrors] = useState(0);
  const [hintMsg, setHintMsg] = useState('');
  const startRef = useRef(Date.now());

  const puzzle = bank[Math.min(puzzleIdx, bank.length - 1)];
  const currentStep = puzzle.steps[Math.min(stepIdx, puzzle.steps.length - 1)];

  useEffect(() => {
    onHudUpdate({
      progressText: `Tactic ${puzzleIdx + 1}/${bank.length} · Move ${stepIdx + 1}/${puzzle.steps.length}`,
      score: Math.round((puzzleIdx / bank.length) * 100),
      errors,
    });
  }, [puzzleIdx, bank.length, stepIdx, puzzle.steps.length, errors, onHudUpdate]);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  function applyMove(
    pieces: ChessPiecePlacement[],
    fromSq: string,
    toSq: string,
  ): ChessPiecePlacement[] {
    const moving = pieces.find((p) => p.sq === fromSq);
    if (!moving) return pieces;
    // Handle pawn promotion on 8th rank visually
    const nextSym = moving.sym === '♙' && toSq.endsWith('8') ? '♕' : moving.sym;
    return pieces
      .filter((p) => p.sq !== fromSq && p.sq !== toSq)
      .concat({ ...moving, sq: toSq, sym: nextSym });
  }

  function handleSquareClick(sq: string) {
    if (botThinking) return;
    const piece = boardPieces.find((p) => p.sq === sq);
    if (!selectedSq) {
      if (piece && piece.side === 'w') {
        setSelectedSq(sq);
        setHintMsg(`Selected ${piece.sym} at ${sq}. Click target square.`);
      }
      return;
    }

    if (selectedSq === currentStep.fromSq && sq === currentStep.toSq) {
      playSuccessChime();
      const afterWhite = applyMove(boardPieces, selectedSq, sq);
      setBoardPieces(afterWhite);
      setSelectedSq(null);

      if (currentStep.blackReply && stepIdx + 1 < puzzle.steps.length) {
        const reply = currentStep.blackReply;
        setBotThinking(true);
        setHintMsg(reply.note);
        setTimeout(() => {
          const afterBlack = applyMove(afterWhite, reply.fromSq, reply.toSq);
          setBoardPieces(afterBlack);
          setStepIdx((s) => s + 1);
          setBotThinking(false);
          setHintMsg('Your move — deliver the winning follow-up!');
        }, 550);
        return;
      }

      // Solved current puzzle
      const nextPuzzleIdx = puzzleIdx + 1;
      if (nextPuzzleIdx >= bank.length) {
        playVictoryFanfare();
        const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
        const totalMoves = bank.reduce((s, p) => s + p.steps.length, 0);
        const acc = Math.max(40, Math.round((totalMoves / (totalMoves + errors)) * 100));
        onFinish({
          accuracyPct: acc,
          completionTimeSec: elapsed,
          reactionTimeMs: null,
          errorCount: errors,
          scorePoints: acc,
          completed: true,
          summaryDetail: `Solved all ${bank.length} Level-${level} chess combinations in ${elapsed}s (${errors} misses).`,
        });
      } else {
        setTimeout(() => {
          setPuzzleIdx(nextPuzzleIdx);
          setStepIdx(0);
          setBoardPieces(bank[nextPuzzleIdx].pieces);
          setHintMsg('Next tactical position loaded!');
        }, 450);
      }
    } else if (piece && piece.side === 'w') {
      setSelectedSq(sq);
      setHintMsg(`Switched selection to ${piece.sym} at ${sq}.`);
    } else {
      playErrorCue();
      setErrors((e) => e + 1);
      setHintMsg('Not the forced winning move — inspect checks, sacrifices & mating squares.');
      setSelectedSq(null);
    }
  }

  return (
    <div className="space-y-3 max-w-sm mx-auto text-center">
      <p className="text-xs font-bold text-slate-900">
        {lang === 'hi' ? `सफेद मोहरा चुनकर सही चाल चलें (${puzzle.title})` : puzzle.title}
      </p>
      <div className="grid grid-cols-8 border-2 border-slate-800 rounded-lg overflow-hidden">
        {ranks.map((rk, rIdx) =>
          files.map((fl, fIdx) => {
            const sq = `${fl}${rk}`;
            const isDark = (rIdx + fIdx) % 2 === 1;
            const piece = boardPieces.find((p) => p.sq === sq);
            const isSel = selectedSq === sq;
            return (
              <button
                key={sq}
                type="button"
                aria-label={`Chess square ${sq}${piece ? ` ${piece.sym}` : ''}`}
                onClick={() => handleSquareClick(sq)}
                className={`h-10 w-full flex items-center justify-center text-xl ${
                  isSel
                    ? 'bg-amber-300'
                    : isDark
                      ? 'bg-slate-600 text-white'
                      : 'bg-amber-50 text-slate-900'
                }`}
              >
                {piece ? piece.sym : ''}
              </button>
            );
          }),
        )}
      </div>
      {hintMsg && <p className="text-xs text-slate-600">{hintMsg}</p>}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 24. TOWER OF HANOI (Scales up to 5 Disks L4 [31] & 6 Disks L5 [63])
// ---------------------------------------------------------------------------
export const TowerOfHanoiGame: React.FC<PlayableEngineProps> = ({
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const diskCount = level <= 2 ? 3 : level === 3 ? 4 : level === 4 ? 5 : 6;
  const optimalMoves = Math.pow(2, diskCount) - 1;
  const [pegs, setPegs] = useState<number[][]>(() => [
    Array.from({ length: diskCount }, (_, i) => diskCount - i),
    [],
    [],
  ]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [violations, setViolations] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    onHudUpdate({
      progressText: `${moves} moves (min ${optimalMoves})`,
      score: Math.max(0, 100 - violations * 10),
      errors: violations,
    });
  }, [moves, optimalMoves, violations, onHudUpdate]);

  function handlePegClick(pegIdx: number) {
    if (selectedPeg === null) {
      if (pegs[pegIdx].length > 0) {
        setSelectedPeg(pegIdx);
      }
      return;
    }
    if (selectedPeg === pegIdx) {
      setSelectedPeg(null);
      return;
    }

    const fromStack = pegs[selectedPeg];
    const toStack = pegs[pegIdx];
    const disk = fromStack[fromStack.length - 1];
    const topTarget = toStack[toStack.length - 1];

    if (topTarget !== undefined && disk > topTarget) {
      playErrorCue();
      setViolations((v) => v + 1);
      setSelectedPeg(null);
      return;
    }

    playSuccessChime();
    const nextPegs = pegs.map((st, idx) => {
      if (idx === selectedPeg) return st.slice(0, -1);
      if (idx === pegIdx) return [...st, disk];
      return st;
    });
    const nextMoves = moves + 1;
    setPegs(nextPegs);
    setMoves(nextMoves);
    setSelectedPeg(null);

    if (nextPegs[2].length === diskCount) {
      playVictoryFanfare();
      const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
      const efficiency = Math.min(100, Math.round((optimalMoves / nextMoves) * 100));
      const acc = Math.max(40, efficiency - violations * 5);
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: violations,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Transferred ${diskCount}-disk Tower of Hanoi in ${nextMoves} moves (optimal ${optimalMoves}, ${violations} violations).`,
      });
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-slate-600 text-center">
        {lang === 'hi'
          ? `सभी ${diskCount} डिस्क को Peg A से Peg C पर ले जाएँ (न्यूनतम चाल: ${optimalMoves})।`
          : `Transfer all ${diskCount} disks from Peg A to Peg C (optimal = ${optimalMoves} moves). Larger disks cannot rest on smaller ones.`}
      </p>
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {pegs.map((stack, pIdx) => {
          const isSel = selectedPeg === pIdx;
          const label = ['Peg A', 'Peg B', 'Peg C (Goal)'][pIdx];
          return (
            <button
              key={label}
              type="button"
              onClick={() => handlePegClick(pIdx)}
              className={`h-52 rounded-xl border-2 p-3 flex flex-col justify-end items-center gap-1 transition-colors ${
                isSel
                  ? 'border-blue-800 bg-blue-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-400'
              }`}
            >
              <div className="flex-1 flex flex-col-reverse items-center justify-start gap-1 w-full">
                {stack.map((size) => (
                  <div
                    key={size}
                    style={{ width: `${24 + (size / diskCount) * 70}%` }}
                    className="h-5 rounded bg-blue-900 text-[10px] font-mono font-bold text-white flex items-center justify-center"
                  >
                    {size}
                  </div>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 pt-2 border-t border-slate-300 w-full">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 22 & 25: LOGIC ESCAPE & NUMBER DETECTIVE (Level-Graded Rigorous Banks)
// ---------------------------------------------------------------------------
export const LogicReasoningGame: React.FC<PlayableEngineProps> = ({
  gameId,
  level,
  lang,
  onHudUpdate,
  onFinish,
}) => {
  const isEscape = gameId === 'logic-escape';
  const [step, setStep] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const startRef = useRef(Date.now());

  const stages = useMemo(
    () =>
      isEscape
        ? buildLogicEscapeStages(level as DifficultyLevel)
        : buildNumberDetectiveStages(level as DifficultyLevel),
    [isEscape, level],
  );

  useEffect(() => {
    onHudUpdate({
      progressText: `Stage ${step + 1}/${stages.length}`,
      score: Math.round((hits / stages.length) * 100),
      errors,
    });
  }, [step, stages.length, hits, errors, onHudUpdate]);

  function handleOption(opt: string) {
    const ok = opt === stages[step].ans;
    if (ok) playSuccessChime();
    else playErrorCue();

    const nextHits = hits + (ok ? 1 : 0);
    const nextErr = errors + (ok ? 0 : 1);
    setHits(nextHits);
    setErrors(nextErr);

    const nextStep = step + 1;
    if (nextStep >= stages.length) {
      playVictoryFanfare();
      const acc = Math.round((nextHits / stages.length) * 100);
      const elapsed = Math.max(3, Math.round((Date.now() - startRef.current) / 1000));
      onFinish({
        accuracyPct: acc,
        completionTimeSec: elapsed,
        reactionTimeMs: null,
        errorCount: nextErr,
        scorePoints: acc,
        completed: true,
        summaryDetail: `Solved ${nextHits}/${stages.length} Level-${level} deduction steps in ${elapsed}s.`,
      });
    } else {
      setStep(nextStep);
    }
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-xs font-semibold text-blue-900 mb-1 tabular-nums">
          {lang === 'hi' ? `चरण ${step + 1} / ${stages.length}` : `Stage ${step + 1} of ${stages.length}`}
        </p>
        <p className="text-sm font-bold text-slate-900 leading-relaxed">{stages[step].q}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stages[step].options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleOption(opt)}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-900 hover:bg-blue-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};
