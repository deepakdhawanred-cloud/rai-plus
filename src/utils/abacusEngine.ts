import type { AbacusOperation, AbacusSessionRecord } from '../types/interactiveLearning';

export interface SorobanColumnState {
  /** Place label: 10000, 1000, 100, 10, 1, 0.1, 0.01 */
  label: string;
  shortLabel: string;
  placeMultiplier: number;
  /** Upper Heaven bead (worth 5 when active / pushed down toward beam) */
  heavenActive: boolean;
  /** Lower Earth beads active (0..4 beads pushed up toward beam) */
  earthActiveCount: 0 | 1 | 2 | 3 | 4;
}

export interface AbacusLevelConfig {
  level: number;
  title: string;
  focus: string;
  operation: AbacusOperation;
  digits: number;
  decimalPlaces: number;
  targetTimeSec: number;
  minAccuracyToAdvance: number;
}

export const ABACUS_LEVELS: AbacusLevelConfig[] = [
  {
    level: 1,
    title: 'Introduction to Abacus',
    focus: 'Learn the frame, beam, Heaven (5) bead, and Earth (1) beads.',
    operation: 'represent',
    digits: 1,
    decimalPlaces: 0,
    targetTimeSec: 20,
    minAccuracyToAdvance: 80,
  },
  {
    level: 2,
    title: 'Number Representation',
    focus: 'Form 2-digit numbers (10–99) accurately on Tens and Units rods.',
    operation: 'represent',
    digits: 2,
    decimalPlaces: 0,
    targetTimeSec: 18,
    minAccuracyToAdvance: 80,
  },
  {
    level: 3,
    title: 'Place Value Mastery',
    focus: 'Represent 3-digit and 4-digit numbers across Thousands, Hundreds, Tens, Units.',
    operation: 'represent',
    digits: 4,
    decimalPlaces: 0,
    targetTimeSec: 18,
    minAccuracyToAdvance: 80,
  },
  {
    level: 4,
    title: 'Single-Digit Addition',
    focus: 'Direct bead addition plus 5-complement (Small Friend) transitions.',
    operation: 'add',
    digits: 1,
    decimalPlaces: 0,
    targetTimeSec: 15,
    minAccuracyToAdvance: 80,
  },
  {
    level: 5,
    title: 'Single-Digit Subtraction',
    focus: 'Direct subtraction and Small Friend 5-bead decompositions.',
    operation: 'subtract',
    digits: 1,
    decimalPlaces: 0,
    targetTimeSec: 15,
    minAccuracyToAdvance: 80,
  },
  {
    level: 6,
    title: 'Multi-Digit Addition',
    focus: '2-digit & 3-digit carry-over using 10-complement (Big Friend) rules.',
    operation: 'add',
    digits: 2,
    decimalPlaces: 0,
    targetTimeSec: 20,
    minAccuracyToAdvance: 80,
  },
  {
    level: 7,
    title: 'Multi-Digit Subtraction',
    focus: 'Borrowing cleanly across Hundreds, Tens, and Units columns.',
    operation: 'subtract',
    digits: 2,
    decimalPlaces: 0,
    targetTimeSec: 20,
    minAccuracyToAdvance: 80,
  },
  {
    level: 8,
    title: 'Abacus Multiplication',
    focus: '2-digit × 1-digit partial products placed left-to-right on rods.',
    operation: 'multiply',
    digits: 2,
    decimalPlaces: 0,
    targetTimeSec: 25,
    minAccuracyToAdvance: 78,
  },
  {
    level: 9,
    title: 'Abacus Division',
    focus: 'Quotient placement and step-by-step subtraction of partial dividends.',
    operation: 'divide',
    digits: 2,
    decimalPlaces: 0,
    targetTimeSec: 25,
    minAccuracyToAdvance: 78,
  },
  {
    level: 10,
    title: 'Decimal & Mental Abacus (Anzan)',
    focus: 'Represent & compute decimals (.1, .01) and visualize beads mentally.',
    operation: 'decimal',
    digits: 2,
    decimalPlaces: 1,
    targetTimeSec: 18,
    minAccuracyToAdvance: 80,
  },
  {
    level: 11,
    title: 'Speed Calculations',
    focus: '3-digit rapid addition/subtraction with rhythm and accuracy.',
    operation: 'add',
    digits: 3,
    decimalPlaces: 0,
    targetTimeSec: 14,
    minAccuracyToAdvance: 82,
  },
  {
    level: 12,
    title: 'Grandmaster Challenges',
    focus: 'Multi-step mental multiplication, decimals, and mixed operations.',
    operation: 'multiply',
    digits: 3,
    decimalPlaces: 0,
    targetTimeSec: 18,
    minAccuracyToAdvance: 85,
  },
];

export function createEmptySoroban(decimalPlaces: 0 | 1 | 2 = 0): SorobanColumnState[] {
  const intSpecs: Array<{ label: string; shortLabel: string; mult: number }> = [
    { label: 'Ten-Thousands', shortLabel: 'TTh', mult: 10000 },
    { label: 'Thousands', shortLabel: 'Th', mult: 1000 },
    { label: 'Hundreds', shortLabel: 'H', mult: 100 },
    { label: 'Tens', shortLabel: 'T', mult: 10 },
    { label: 'Units', shortLabel: 'U', mult: 1 },
  ];
  const decSpecs: Array<{ label: string; shortLabel: string; mult: number }> = [];
  if (decimalPlaces >= 1) {
    decSpecs.push({ label: 'Tenths', shortLabel: '.1', mult: 0.1 });
  }
  if (decimalPlaces >= 2) {
    decSpecs.push({ label: 'Hundredths', shortLabel: '.01', mult: 0.01 });
  }

  return [...intSpecs, ...decSpecs].map((s) => ({
    label: s.label,
    shortLabel: s.shortLabel,
    placeMultiplier: s.mult,
    heavenActive: false,
    earthActiveCount: 0,
  }));
}

export function getColumnDigit(col: SorobanColumnState): number {
  return (col.heavenActive ? 5 : 0) + col.earthActiveCount;
}

/**
 * Mathematically exact Soroban value decoder (avoids floating-point drift via integer scaling).
 */
export function decodeSorobanValue(columns: SorobanColumnState[], decimalPlaces: 0 | 1 | 2 = 0): number {
  const scale = Math.pow(10, decimalPlaces);
  let scaledSum = 0;
  for (const col of columns) {
    const digit = getColumnDigit(col);
    scaledSum += digit * Math.round(col.placeMultiplier * scale);
  }
  return scaledSum / scale;
}

/**
 * Encodes any non-negative number (up to 99999.99) into exact Soroban bead states.
 */
export function encodeNumberToSoroban(
  value: number,
  decimalPlaces: 0 | 1 | 2 = 0,
): SorobanColumnState[] {
  const cols = createEmptySoroban(decimalPlaces);
  const safeVal = Math.max(0, Number.isFinite(value) ? value : 0);
  const scale = Math.pow(10, decimalPlaces);
  let remaining = Math.round(safeVal * scale);

  for (const col of cols) {
    const unitWeight = Math.round(col.placeMultiplier * scale);
    const digit = Math.min(9, Math.floor(remaining / unitWeight));
    remaining -= digit * unitWeight;
    col.heavenActive = digit >= 5;
    col.earthActiveCount = (digit % 5) as 0 | 1 | 2 | 3 | 4;
  }
  return cols;
}

export function toggleHeavenBead(
  columns: SorobanColumnState[],
  colIndex: number,
): SorobanColumnState[] {
  return columns.map((col, idx) =>
    idx === colIndex ? { ...col, heavenActive: !col.heavenActive } : col,
  );
}

/**
 * Clicking earth bead i (0 = topmost earth bead, 3 = bottommost earth bead):
 * - If bead i is currently inactive (i >= earthActiveCount), activate beads 0..i -> earthActiveCount = i + 1
 * - If bead i is currently active (i < earthActiveCount), deactivate beads i..3 -> earthActiveCount = i
 */
export function clickEarthBead(
  columns: SorobanColumnState[],
  colIndex: number,
  beadIndex: 0 | 1 | 2 | 3,
): SorobanColumnState[] {
  return columns.map((col, idx) => {
    if (idx !== colIndex) return col;
    const nextCount = (beadIndex < col.earthActiveCount ? beadIndex : beadIndex + 1) as
      | 0
      | 1
      | 2
      | 3
      | 4;
    return { ...col, earthActiveCount: nextCount };
  });
}

export interface AbacusStepInstruction {
  step: number;
  columnLabel: string;
  action: string;
  ruleUsed: string;
  resultingValue: number;
}

export interface AbacusProblem {
  id: string;
  level: number;
  operation: AbacusOperation;
  prompt: string;
  operandA: number;
  operandB?: number;
  expectedAnswer: number;
  decimalPlaces: 0 | 1 | 2;
  steps: AbacusStepInstruction[];
}

export function generateAbacusStepByStepMoves(
  a: number,
  b: number | undefined,
  op: AbacusOperation,
  decimalPlaces: 0 | 1 | 2 = 0,
): AbacusStepInstruction[] {
  const steps: AbacusStepInstruction[] = [];
  if (op === 'represent' || b === undefined) {
    const encoded = encodeNumberToSoroban(a, decimalPlaces);
    let running = 0;
    const scale = Math.pow(10, decimalPlaces);
    encoded.forEach((col) => {
      const digit = getColumnDigit(col);
      if (digit === 0) return;
      running = (Math.round(running * scale) + digit * Math.round(col.placeMultiplier * scale)) / scale;
      const parts: string[] = [];
      if (col.heavenActive) parts.push('push 1 Heaven bead down (5)');
      if (col.earthActiveCount > 0) {
        parts.push(`push ${col.earthActiveCount} Earth bead${col.earthActiveCount > 1 ? 's' : ''} up (+${col.earthActiveCount})`);
      }
      steps.push({
        step: steps.length + 1,
        columnLabel: `${col.label} (${col.shortLabel})`,
        action: `Set digit ${digit}: ${parts.join(' and ')}.`,
        ruleUsed: 'Direct Place-Value Placement',
        resultingValue: running,
      });
    });
    if (steps.length === 0) {
      steps.push({
        step: 1,
        columnLabel: 'All Rods',
        action: 'Keep all Heaven beads up and Earth beads down for 0.',
        ruleUsed: 'Zero State',
        resultingValue: 0,
      });
    }
    return steps;
  }

  const scale = Math.pow(10, decimalPlaces);
  steps.push({
    step: 1,
    columnLabel: 'Initial Setup',
    action: `Set starting number ${a} on the Soroban rods.`,
    ruleUsed: 'Base Entry',
    resultingValue: a,
  });

  if (op === 'add' || op === 'decimal') {
    const ans = (Math.round(a * scale) + Math.round(b * scale)) / scale;
    const aUnit = Math.floor(a) % 10;
    const bUnit = Math.floor(b) % 10;
    const usesBigFriend = aUnit + bUnit >= 10;
    const usesSmallFriend = !usesBigFriend && aUnit < 5 && aUnit + bUnit >= 5;
    steps.push({
      step: 2,
      columnLabel: decimalPlaces > 0 ? 'Units & Tenths Rods' : 'Left-to-Right Rods',
      action: usesBigFriend
        ? `Add ${b}: units sum exceeds 9 — carry +1 to the Tens rod and subtract ${10 - bUnit} on Units (Big Friend of ${bUnit}).`
        : usesSmallFriend
          ? `Add ${b}: push Heaven bead down (+5) and clear ${5 - bUnit} Earth bead(s) (Small Friend of ${bUnit}).`
          : `Add ${b} column by column starting from the highest place value.`,
      ruleUsed: usesBigFriend
        ? '10-Complement (Big Friend)'
        : usesSmallFriend
          ? '5-Complement (Small Friend)'
          : 'Direct Bead Addition',
      resultingValue: ans,
    });
    return steps;
  }

  if (op === 'subtract') {
    const ans = Math.max(0, (Math.round(a * scale) - Math.round(b * scale)) / scale);
    const aUnit = Math.floor(a) % 10;
    const bUnit = Math.floor(b) % 10;
    const borrows = aUnit < bUnit;
    steps.push({
      step: 2,
      columnLabel: 'Subtraction Rods',
      action: borrows
        ? `Subtract ${b}: borrow 1 from the Tens rod (-10) and add ${10 - bUnit} on the Units rod (Big Friend subtraction).`
        : `Subtract ${b} directly by moving Earth beads down and releasing the Heaven bead where needed.`,
      ruleUsed: borrows ? '10-Complement Borrow' : 'Direct Bead Subtraction',
      resultingValue: ans,
    });
    return steps;
  }

  if (op === 'multiply') {
    const ans = a * b;
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    if (tens > 0) {
      steps.push({
        step: 2,
        columnLabel: 'Tens & Hundreds Rods',
        action: `Multiply ${tens} × ${b} = ${tens * b} and place ${tens * b} on the rods.`,
        ruleUsed: 'Left-to-Right Partial Product',
        resultingValue: tens * b,
      });
    }
    steps.push({
      step: steps.length + 1,
      columnLabel: 'Units & Tens Rods',
      action: `Add ${ones} × ${b} = ${ones * b} to reach the product ${ans}.`,
      ruleUsed: 'Partial Product Accumulation',
      resultingValue: ans,
    });
    return steps;
  }

  // Division
  const ans = Math.floor(a / Math.max(1, b));
  steps.push({
    step: 2,
    columnLabel: 'Quotient & Remainder Rods',
    action: `Divide ${a} by ${b}: find how many groups of ${b} fit in ${a} (${ans} × ${b} = ${ans * b}) and clear the dividend to leave quotient ${ans}.`,
    ruleUsed: 'Soroban Quotient Placement',
    resultingValue: ans,
  });
  return steps;
}

export function generateAbacusProblem(level: number, seedNonce = 0): AbacusProblem {
  const cfg = ABACUS_LEVELS.find((l) => l.level === level) || ABACUS_LEVELS[0];
  const rand = (min: number, max: number) => {
    const r = Math.abs(Math.sin(Date.now() * 0.001 + seedNonce * 17.3 + min * 3.1));
    return Math.floor(r * (max - min + 1)) + min;
  };
  const dec = (cfg.decimalPlaces as 0 | 1 | 2) || 0;

  if (cfg.operation === 'represent') {
    const min = cfg.digits === 1 ? 1 : Math.pow(10, cfg.digits - 1);
    const max = Math.pow(10, cfg.digits) - 1;
    const target = rand(min, Math.min(max, 9999));
    return {
      id: `abq-${level}-${Date.now()}-${seedNonce}`,
      level: cfg.level,
      operation: 'represent',
      prompt: `Show ${target} on the Soroban`,
      operandA: target,
      expectedAnswer: target,
      decimalPlaces: 0,
      steps: generateAbacusStepByStepMoves(target, undefined, 'represent', 0),
    };
  }

  if (cfg.operation === 'add') {
    const min = cfg.digits === 1 ? 2 : cfg.digits === 2 ? 12 : 115;
    const max = cfg.digits === 1 ? 9 : cfg.digits === 2 ? 78 : 480;
    const a = rand(min, max);
    const b = rand(min, max);
    return {
      id: `abq-${level}-${Date.now()}-${seedNonce}`,
      level: cfg.level,
      operation: 'add',
      prompt: `${a} + ${b}`,
      operandA: a,
      operandB: b,
      expectedAnswer: a + b,
      decimalPlaces: 0,
      steps: generateAbacusStepByStepMoves(a, b, 'add', 0),
    };
  }

  if (cfg.operation === 'subtract') {
    const min = cfg.digits === 1 ? 4 : 24;
    const max = cfg.digits === 1 ? 9 : 95;
    const a = rand(min, max);
    const b = rand(1, a - 1);
    return {
      id: `abq-${level}-${Date.now()}-${seedNonce}`,
      level: cfg.level,
      operation: 'subtract',
      prompt: `${a} − ${b}`,
      operandA: a,
      operandB: b,
      expectedAnswer: a - b,
      decimalPlaces: 0,
      steps: generateAbacusStepByStepMoves(a, b, 'subtract', 0),
    };
  }

  if (cfg.operation === 'multiply') {
    const a = cfg.digits >= 3 ? rand(105, 240) : rand(12, 48);
    const b = rand(2, 9);
    return {
      id: `abq-${level}-${Date.now()}-${seedNonce}`,
      level: cfg.level,
      operation: 'multiply',
      prompt: `${a} × ${b}`,
      operandA: a,
      operandB: b,
      expectedAnswer: a * b,
      decimalPlaces: 0,
      steps: generateAbacusStepByStepMoves(a, b, 'multiply', 0),
    };
  }

  if (cfg.operation === 'divide') {
    const b = rand(2, 9);
    const q = rand(4, 24);
    const a = b * q;
    return {
      id: `abq-${level}-${Date.now()}-${seedNonce}`,
      level: cfg.level,
      operation: 'divide',
      prompt: `${a} ÷ ${b}`,
      operandA: a,
      operandB: b,
      expectedAnswer: q,
      decimalPlaces: 0,
      steps: generateAbacusStepByStepMoves(a, b, 'divide', 0),
    };
  }

  // Decimal mode
  const aInt = rand(12, 65);
  const bInt = rand(11, 34);
  const a = aInt / 10;
  const b = bInt / 10;
  const ans = (aInt + bInt) / 10;
  return {
    id: `abq-${level}-${Date.now()}-${seedNonce}`,
    level: cfg.level,
    operation: 'decimal',
    prompt: `${a.toFixed(1)} + ${b.toFixed(1)}`,
    operandA: a,
    operandB: b,
    expectedAnswer: ans,
    decimalPlaces: dec || 1,
    steps: generateAbacusStepByStepMoves(a, b, 'decimal', dec || 1),
  };
}

export function analyzeAbacusSessionCoach(params: {
  level: number;
  operation: AbacusOperation;
  accuracyPct: number;
  avgResponseSec: number;
  mistakes: Array<{ expected: number; actual: number; prompt: string }>;
}): { mistakePatterns: string[]; coachFeedback: string; recommendedNextLevel: number } {
  const patterns: string[] = [];
  let heavenErrors = 0;
  let placeValueErrors = 0;
  let offByOneErrors = 0;

  for (const m of params.mistakes) {
    const diff = Math.abs(m.expected - m.actual);
    if (Math.abs(diff - 5) < 0.01 || Math.abs(diff - 50) < 0.01) heavenErrors += 1;
    else if (diff >= 10 && diff % 10 === 0) placeValueErrors += 1;
    else if (diff <= 2) offByOneErrors += 1;
  }

  if (heavenErrors > 0) {
    patterns.push('Heaven bead (value 5) toggle slip — double-check whether the top bead touches the beam.');
  }
  if (placeValueErrors > 0) {
    patterns.push('Tens/Hundreds carry or borrow alignment — keep left-to-right column tracking steady.');
  }
  if (offByOneErrors > 0) {
    patterns.push('Earth bead count off by 1 — pause briefly to visually group beads in pairs.');
  }

  const cfg = ABACUS_LEVELS.find((l) => l.level === params.level) || ABACUS_LEVELS[0];
  let nextLevel = params.level;
  let coachFeedback = '';

  if (params.accuracyPct >= cfg.minAccuracyToAdvance) {
    nextLevel = Math.min(12, params.level + 1);
    coachFeedback =
      nextLevel > params.level
        ? `Strong ${params.accuracyPct}% accuracy at Level ${params.level} (${cfg.title})! You are ready to advance to Level ${nextLevel} (${ABACUS_LEVELS[nextLevel - 1].title}).`
        : `Outstanding ${params.accuracyPct}% mastery at Grandmaster Level 12! Keep sharpening mental visualization.`;
  } else if (params.accuracyPct >= 60) {
    coachFeedback = `Good effort (${params.accuracyPct}% accuracy). Stay on Level ${params.level} for one more calm accuracy round before speeding up.${patterns[0] ? ` Focus tip: ${patterns[0]}` : ''}`;
  } else {
    nextLevel = Math.max(1, params.level - 1);
    coachFeedback = `Let's strengthen fundamentals first (${params.accuracyPct}% accuracy). Try guided step-by-step hints on Level ${nextLevel} to build confident bead memory.`;
  }

  return {
    mistakePatterns: patterns,
    coachFeedback,
    recommendedNextLevel: nextLevel,
  };
}

export function summarizeAbacusHistory(sessions: AbacusSessionRecord[]) {
  if (sessions.length === 0) {
    return {
      highestLevel: 1,
      totalSessions: 0,
      avgAccuracyPct: 0,
      bestStreak: 0,
      totalXp: 0,
    };
  }
  return {
    highestLevel: Math.max(...sessions.map((s) => s.recommendedNextLevel || s.level)),
    totalSessions: sessions.length,
    avgAccuracyPct: Math.round(
      sessions.reduce((sum, s) => sum + s.accuracyPct, 0) / sessions.length,
    ),
    bestStreak: Math.max(...sessions.map((s) => s.bestStreak)),
    totalXp: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
  };
}
