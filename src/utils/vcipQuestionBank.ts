import type {
  VcipClassTier,
  VcipDomainId,
  VcipFluidQuestion,
  VcipLanguage,
  VcipMatrixCellSpec,
  VcipMatrixFillKind,
  VcipMatrixShapeKind,
  VcipMemoryTrial,
  VcipProcessingSpeedItem,
  VcipSpatialQuestion,
  VcipSpatialSpec,
  VcipSymbolKeyEntry,
  VcipTextChoiceQuestion,
} from '../types/vcip';

export const VCIP_DOMAIN_META: Record<
  VcipDomainId,
  {
    id: VcipDomainId;
    label: string;
    shortLabel: string;
    estimatedMinutes: string;
    timedLimitSec: number;
    tagline: string;
    measures: string[];
    trainingActivities: string[];
  }
> = {
  fluid_reasoning: {
    id: 'fluid_reasoning',
    label: 'Fluid Reasoning & Visual Patterns',
    shortLabel: 'Fluid Reasoning',
    estimatedMinutes: '5–8 min',
    timedLimitSec: 360,
    tagline: 'Original 3×3 visual matrices testing rule discovery, rotation, count & multi-rule logic.',
    measures: [
      'Pattern recognition',
      'Logical rule discovery',
      'Abstract visual reasoning',
      'Multi-rule synthesis',
    ],
    trainingActivities: [
      'Solve 3×3 visual progression grids daily by isolating row vs column rules.',
      'Practice predicting shape rotation + shading shifts simultaneously.',
      'Explain pattern rules aloud before picking an answer option.',
    ],
  },
  working_memory: {
    id: 'working_memory',
    label: 'Working Memory & Sequence Processing',
    shortLabel: 'Working Memory',
    estimatedMinutes: '5–7 min',
    timedLimitSec: 360,
    tagline: 'Digit Span Forward & Backward, illuminated tile sequences, and rule-based recall.',
    measures: [
      'Short-term sequence retention',
      'Active information manipulation',
      'Visual-spatial span',
      'Focused attention',
    ],
    trainingActivities: [
      'Practice chunking 6–7 digit phone or bus numbers into pairs and reciting backwards.',
      'Play 3×3 illuminated visual path recall exercises for 5 minutes daily.',
      'Sort mixed letters and numbers mentally without writing intermediate steps.',
    ],
  },
  processing_speed: {
    id: 'processing_speed',
    label: 'Processing Speed & Symbol Matching',
    shortLabel: 'Processing Speed',
    estimatedMinutes: '3–5 min',
    timedLimitSec: 45,
    tagline: 'Timed symbol-number reference key challenge measuring speed and accuracy separately.',
    measures: [
      'Visual scanning efficiency',
      'Symbol-number association',
      'Sustained focus',
      'Speed-accuracy balance',
    ],
    trainingActivities: [
      'Run 45-second symbol-number matching sprints aiming for 95%+ accuracy before increasing pace.',
      'Practice rapid table scanning drills without skipping columns.',
      'Use rhythmic pacing rather than rushing into impulsive guesses.',
    ],
  },
  verbal_reasoning: {
    id: 'verbal_reasoning',
    label: 'Verbal Reasoning & Analogical Thinking',
    shortLabel: 'Verbal Reasoning',
    estimatedMinutes: '5–8 min',
    timedLimitSec: 360,
    tagline: 'Original English & Hindi analogies, logical deductions, classification & comprehension.',
    measures: [
      'Analogical thinking',
      'Logical deduction',
      'Conceptual classification',
      'Reading comprehension (separate EN / HI tracking)',
    ],
    trainingActivities: [
      'Create 3 original word analogies daily specifying the exact relationship bridge.',
      'Practice separating factual premises from assumptions in short editorial paragraphs.',
      'Build bilingual concept maps connecting English and Hindi academic vocabulary.',
    ],
  },
  quantitative_reasoning: {
    id: 'quantitative_reasoning',
    label: 'Quantitative Reasoning',
    shortLabel: 'Quantitative',
    estimatedMinutes: '5–8 min',
    timedLimitSec: 360,
    tagline: 'Original number series, relational logic, quantitative analogies & mini data tables.',
    measures: [
      'Number pattern logic',
      'Arithmetic reasoning',
      'Proportional relationships',
      'Data table interpretation',
    ],
    trainingActivities: [
      'Inspect first and second differences in number sequences before calculating.',
      'Practice mental estimation checks on word problems and school data tables.',
      'Translate everyday ratios (distance, time, budgets) into quick equations.',
    ],
  },
  spatial_reasoning: {
    id: 'spatial_reasoning',
    label: 'Spatial Reasoning & Mental Rotation',
    shortLabel: 'Spatial Reasoning',
    estimatedMinutes: '5–7 min',
    timedLimitSec: 360,
    tagline: 'Original 2D shape rotations, 3D block orientations, cube nets & visual assembly.',
    measures: [
      'Mental rotation (2D & 3D)',
      'Cube-net folding visualisation',
      'Orientation & reflection accuracy',
      'Geometric shape assembly',
    ],
    trainingActivities: [
      'Sketch top, front, and side views of household objects from memory.',
      'Practice folding paper nets mentally to identify opposite faces before confirming.',
      'Rotate asymmetrical L- and T-shapes 90° and 180° clockwise without turning the page.',
    ],
  },
};

export const ALL_VCIP_DOMAINS: VcipDomainId[] = [
  'fluid_reasoning',
  'working_memory',
  'processing_speed',
  'verbal_reasoning',
  'quantitative_reasoning',
  'spatial_reasoning',
];

export function getClassTierFromClassNumber(classNumber: number): VcipClassTier {
  if (classNumber <= 5) return 'foundation_5';
  if (classNumber <= 8) return 'middle_6_8';
  if (classNumber <= 10) return 'secondary_9_10';
  return 'senior_11_12';
}

export function getClassTierLabel(tier: VcipClassTier): string {
  switch (tier) {
    case 'foundation_5':
      return 'Class 5 Foundation Tier';
    case 'middle_6_8':
      return 'Classes 6–8 Middle Tier';
    case 'secondary_9_10':
      return 'Classes 9–10 Secondary Tier';
    case 'senior_11_12':
      return 'Classes 11–12 Senior Tier';
  }
}

// Deterministic seeded PRNG for reproducible question banks & Daily Brain Gym
export function createSeededRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ============================================================================
// MODULE 1: FLUID REASONING — ORIGINAL 3×3 VISUAL MATRIX GENERATOR
// ============================================================================

const MATRIX_COLORS = ['#1d4ed8', '#0f766e', '#b45309', '#6d28d9', '#be123c'];
const MATRIX_SHAPES: VcipMatrixShapeKind[] = [
  'circle',
  'triangle',
  'square',
  'diamond',
  'pentagon',
  'hexagon',
  'plus',
  'ring',
];
const MATRIX_FILLS: VcipMatrixFillKind[] = ['solid', 'outline', 'striped', 'dot'];

function buildDistinctMatrixOptions(
  correct: VcipMatrixCellSpec,
  rng: () => number,
): { options: VcipMatrixCellSpec[]; correctIndex: number } {
  const keyOf = (c: VcipMatrixCellSpec) =>
    `${c.shape}|${c.count}|${((c.rotation % 360) + 360) % 360}|${c.fill}|${c.color}|${c.dotCorner ?? -1}`;
  const seen = new Set<string>([keyOf(correct)]);
  const distractors: VcipMatrixCellSpec[] = [];

  const candidates: VcipMatrixCellSpec[] = [
    { ...correct, rotation: (correct.rotation + 90) % 360 },
    { ...correct, rotation: (correct.rotation + 180) % 360 },
    { ...correct, count: correct.count === 4 ? 2 : correct.count + 1 },
    { ...correct, count: correct.count === 1 ? 3 : correct.count - 1 },
    {
      ...correct,
      fill: MATRIX_FILLS[(MATRIX_FILLS.indexOf(correct.fill) + 1) % MATRIX_FILLS.length],
    },
    {
      ...correct,
      shape: MATRIX_SHAPES[(MATRIX_SHAPES.indexOf(correct.shape) + 1) % MATRIX_SHAPES.length],
    },
    {
      ...correct,
      shape: MATRIX_SHAPES[(MATRIX_SHAPES.indexOf(correct.shape) + 2) % MATRIX_SHAPES.length],
      fill: MATRIX_FILLS[(MATRIX_FILLS.indexOf(correct.fill) + 2) % MATRIX_FILLS.length],
    },
    {
      ...correct,
      color: MATRIX_COLORS[(MATRIX_COLORS.indexOf(correct.color) + 1) % MATRIX_COLORS.length],
    },
    {
      ...correct,
      dotCorner: correct.dotCorner !== undefined ? (correct.dotCorner + 1) % 4 : 2,
    },
  ];

  for (const cand of candidates) {
    const k = keyOf(cand);
    if (!seen.has(k)) {
      seen.add(k);
      distractors.push(cand);
    }
    if (distractors.length === 5) break;
  }

  const all = shuffleWithRng([correct, ...distractors], rng);
  const correctIndex = all.findIndex((c) => keyOf(c) === keyOf(correct));
  return { options: all, correctIndex };
}

export function generateFluidReasoningQuestions(
  classNumber: number,
  seed = 'vcip-fluid',
): VcipFluidQuestion[] {
  const tier = getClassTierFromClassNumber(classNumber);
  const rng = createSeededRng(`${seed}-${tier}`);
  const questions: VcipFluidQuestion[] = [];

  // Q1: Shape Progression across columns (Difficulty 1)
  {
    const rowShapes: VcipMatrixShapeKind[] = ['circle', 'square', 'triangle'];
    const fills: VcipMatrixFillKind[] = ['solid', 'outline', 'striped'];
    const color = MATRIX_COLORS[0];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: rowShapes[r],
            count: 1,
            rotation: 0,
            fill: fills[c],
            color,
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: rowShapes[2],
      count: 1,
      rotation: 0,
      fill: fills[2],
      color,
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-1`,
      domain: 'fluid_reasoning',
      category: 'shape_progression',
      difficulty: 1,
      classTier: tier,
      prompt: 'Identify the missing visual tile that completes the row shape and column fill pattern.',
      grid,
      options,
      correctIndex,
      explanation:
        'Each row keeps one shape (circle, square, triangle) while columns progress from solid → outline → striped.',
    });
  }

  // Q2: Object Count Progression (Difficulty 1)
  {
    const shapes: VcipMatrixShapeKind[] = ['diamond', 'circle', 'hexagon'];
    const color = MATRIX_COLORS[1];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: shapes[c],
            count: r + 1 + (tier === 'senior_11_12' && c === 2 ? 1 : 0) > 4 ? 4 : r + 1,
            rotation: 0,
            fill: 'solid',
            color,
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: shapes[2],
      count: 3,
      rotation: 0,
      fill: 'solid',
      color,
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-2`,
      domain: 'fluid_reasoning',
      category: 'object_count',
      difficulty: 1,
      classTier: tier,
      prompt: 'Observe how the shape type and object count change across rows and columns.',
      grid,
      options,
      correctIndex,
      explanation:
        'Columns fix the shape (diamond, circle, hexagon), and each row increases object count from 1 → 2 → 3.',
    });
  }

  // Q3: Progressive Clockwise Rotation (Difficulty 2)
  {
    const baseShapes: VcipMatrixShapeKind[] = ['triangle', 'pentagon', 'triangle'];
    const color = MATRIX_COLORS[2];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: baseShapes[r],
            count: 1,
            rotation: (r * 90 + c * 90) % 360,
            fill: r === 1 ? 'outline' : 'solid',
            color,
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: baseShapes[2],
      count: 1,
      rotation: (2 * 90 + 2 * 90) % 360,
      fill: 'solid',
      color,
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-3`,
      domain: 'fluid_reasoning',
      category: 'rotation',
      difficulty: 2,
      classTier: tier,
      prompt: 'Track the clockwise rotation rule across each row to choose the missing cell.',
      grid,
      options,
      correctIndex,
      explanation:
        'Moving left-to-right rotates the shape by +90° clockwise each step; Row 3 goes 180° → 270° → 0°.',
    });
  }

  // Q4: Spatial Corner Marker Orbit (Difficulty 2)
  {
    const color = MATRIX_COLORS[3];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: 'square',
            count: 1,
            rotation: 0,
            fill: 'outline',
            color,
            dotCorner: (r + c) % 4,
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: 'square',
      count: 1,
      rotation: 0,
      fill: 'outline',
      color,
      dotCorner: (2 + 2) % 4,
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-4`,
      domain: 'fluid_reasoning',
      category: 'spatial_relationship',
      difficulty: 2,
      classTier: tier,
      prompt: 'Watch how the corner indicator dot moves around the square across every row and column.',
      grid,
      options,
      correctIndex,
      explanation:
        'The corner marker advances 1 corner clockwise for every step right or down (Row 3 Col 3 returns to corner 0, top-left).',
    });
  }

  // Q5: Latin-Square Shape Transformation (Difficulty 2)
  {
    const latinShapes: VcipMatrixShapeKind[] = ['hexagon', 'plus', 'ring'];
    const latinColors = [MATRIX_COLORS[0], MATRIX_COLORS[1], MATRIX_COLORS[4]];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: latinShapes[(r + c) % 3],
            count: 1,
            rotation: 0,
            fill: 'solid',
            color: latinColors[(r + 2 * c) % 3],
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: latinShapes[(2 + 2) % 3],
      count: 1,
      rotation: 0,
      fill: 'solid',
      color: latinColors[(2 + 4) % 3],
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-5`,
      domain: 'fluid_reasoning',
      category: 'shape_transformation',
      difficulty: 2,
      classTier: tier,
      prompt: 'Every row and column contains each shape and colour exactly once. Find the missing tile.',
      grid,
      options,
      correctIndex,
      explanation:
        'Using the Latin-square distribution rule, Row 3 needs the remaining shape (plus) paired with the remaining colour (blue).',
    });
  }

  // Q6: Multi-Rule Synthesis (Shape + Count + Fill + Rotation) (Difficulty 3)
  {
    const shapes: VcipMatrixShapeKind[] = ['triangle', 'diamond', 'pentagon'];
    const fills: VcipMatrixFillKind[] = ['solid', 'striped', 'dot'];
    const color = MATRIX_COLORS[0];
    const grid: Array<VcipMatrixCellSpec | null> = [];
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (r === 2 && c === 2) {
          grid.push(null);
        } else {
          grid.push({
            shape: shapes[(r + c) % 3],
            count: ((r + c) % 3) + 1,
            rotation: c * 90,
            fill: fills[r],
            color,
          });
        }
      }
    }
    const correct: VcipMatrixCellSpec = {
      shape: shapes[(2 + 2) % 3],
      count: ((2 + 2) % 3) + 1,
      rotation: 2 * 90,
      fill: fills[2],
      color,
    };
    const { options, correctIndex } = buildDistinctMatrixOptions(correct, rng);
    questions.push({
      id: `fluid-${tier}-6`,
      domain: 'fluid_reasoning',
      category: 'multi_rule',
      difficulty: 3,
      classTier: tier,
      prompt: 'Combine three simultaneous rules: shape cycle, count cycle, row fill, and column rotation.',
      grid,
      options,
      correctIndex,
      explanation:
        'Row 3 uses dotted fill; Column 3 uses 180° rotation; the diagonal cycle completes with 2 diamonds.',
    });
  }

  return questions;
}

// ============================================================================
// MODULE 2: WORKING MEMORY & SEQUENCE PROCESSING GENERATOR
// ============================================================================

export function generateWorkingMemoryTrials(
  classNumber: number,
  seed = 'vcip-memory',
): VcipMemoryTrial[] {
  const tier = getClassTierFromClassNumber(classNumber);
  const rng = createSeededRng(`${seed}-${tier}`);
  const baseSpan =
    tier === 'foundation_5' ? 4 : tier === 'middle_6_8' ? 5 : tier === 'secondary_9_10' ? 5 : 6;

  const pickDigits = (len: number): string[] => {
    const out: string[] = [];
    while (out.length < len) {
      const d = String(Math.floor(rng() * 9) + 1);
      if (out[out.length - 1] !== d) out.push(d);
    }
    return out;
  };

  const pickTiles = (len: number, gridSize: 3 | 4): string[] => {
    const total = gridSize * gridSize;
    const out: string[] = [];
    while (out.length < len) {
      const idx = String(Math.floor(rng() * total));
      if (!out.includes(idx)) out.push(idx);
    }
    return out;
  };

  const forwardSeq1 = pickDigits(baseSpan);
  const forwardSeq2 = pickDigits(baseSpan + 1);
  const backwardSeq = pickDigits(Math.max(3, baseSpan - 1));
  const visualTiles1 = pickTiles(Math.max(4, baseSpan - 1), 3);
  const visualTiles2 = pickTiles(baseSpan, 3);

  // Rule-based sequence recall: letters then numbers in order
  const letters = shuffleWithRng(['K', 'M', 'R', 'T', 'P', 'V'], rng).slice(0, 2);
  const nums = pickDigits(baseSpan >= 6 ? 3 : 2);
  const mixedSeq = shuffleWithRng([...letters, ...nums], rng);
  const ruleExpected = [...mixedSeq.filter((c) => /[A-Z]/.test(c)), ...mixedSeq.filter((c) => /[0-9]/.test(c))];

  return [
    {
      id: `mem-${tier}-1`,
      domain: 'working_memory',
      subtask: 'digit_forward',
      difficulty: 1,
      classTier: tier,
      instruction: 'Digit Span Forward — Watch the digits carefully and enter them in the EXACT same order.',
      sequence: forwardSeq1,
      expectedAnswer: forwardSeq1,
      ruleHint: 'Same order (first shown → last shown).',
      displayMsPerItem: 950,
    },
    {
      id: `mem-${tier}-2`,
      domain: 'working_memory',
      subtask: 'digit_backward',
      difficulty: 2,
      classTier: tier,
      instruction: 'Digit Span Backward — Watch the digits and enter them in REVERSE order.',
      sequence: backwardSeq,
      expectedAnswer: [...backwardSeq].reverse(),
      ruleHint: 'Reverse order (last shown → first shown).',
      displayMsPerItem: 950,
    },
    {
      id: `mem-${tier}-3`,
      domain: 'working_memory',
      subtask: 'visual_tiles',
      difficulty: 2,
      classTier: tier,
      instruction: 'Visual Memory Grid — Watch the illuminated tiles light up, then click them in the SAME order.',
      sequence: visualTiles1,
      expectedAnswer: visualTiles1,
      gridSize: 3,
      ruleHint: 'Click each grid square in the exact sequence illuminated.',
      displayMsPerItem: 850,
    },
    {
      id: `mem-${tier}-4`,
      domain: 'working_memory',
      subtask: 'digit_forward',
      difficulty: 2,
      classTier: tier,
      instruction: 'Extended Digit Span Forward — Reproduce this longer number sequence in exact order.',
      sequence: forwardSeq2,
      expectedAnswer: forwardSeq2,
      ruleHint: 'Group digits into chunks of 2–3 mentally.',
      displayMsPerItem: 900,
    },
    {
      id: `mem-${tier}-5`,
      domain: 'working_memory',
      subtask: 'visual_tiles',
      difficulty: 3,
      classTier: tier,
      instruction: 'Extended Visual Memory Grid — Reproduce this longer spatial lighting sequence.',
      sequence: visualTiles2,
      expectedAnswer: visualTiles2,
      gridSize: 3,
      ruleHint: 'Trace a visual path connecting each flashing square.',
      displayMsPerItem: 800,
    },
    {
      id: `mem-${tier}-6`,
      domain: 'working_memory',
      subtask: 'sequence_recall',
      difficulty: 3,
      classTier: tier,
      instruction:
        'Rule-Based Sequence Recall — Watch the mixed letters & numbers, then type ALL LETTERS first (in order seen) followed by ALL DIGITS (in order seen).',
      sequence: mixedSeq,
      expectedAnswer: ruleExpected,
      ruleHint: 'Letters first (in order seen), then digits (in order seen).',
      displayMsPerItem: 1000,
    },
  ];
}

// ============================================================================
// MODULE 3: PROCESSING SPEED — ORIGINAL SYMBOL-NUMBER KEY & STREAM
// ============================================================================

export const VCIP_SYMBOL_KEY: VcipSymbolKeyEntry[] = [
  { digit: 1, symbolId: 'chevron', label: 'Double Chevron' },
  { digit: 2, symbolId: 'hourglass', label: 'Hourglass' },
  { digit: 3, symbolId: 'diamond_dot', label: 'Dotted Diamond' },
  { digit: 4, symbolId: 'crescent', label: 'Crescent Arc' },
  { digit: 5, symbolId: 'cross_bar', label: 'Cross Bar' },
  { digit: 6, symbolId: 'trident', label: 'Three Prong' },
  { digit: 7, symbolId: 'arch', label: 'Bridge Arch' },
  { digit: 8, symbolId: 'parallel', label: 'Parallel Bars' },
  { digit: 9, symbolId: 'spiral_box', label: 'Nested Square' },
];

export function generateProcessingSpeedStream(
  count = 40,
  seed = 'vcip-speed',
): VcipProcessingSpeedItem[] {
  const rng = createSeededRng(seed);
  const items: VcipProcessingSpeedItem[] = [];
  let prevDigit = -1;
  for (let i = 0; i < count; i += 1) {
    let entry = VCIP_SYMBOL_KEY[Math.floor(rng() * VCIP_SYMBOL_KEY.length)];
    if (entry.digit === prevDigit) {
      entry = VCIP_SYMBOL_KEY[(entry.digit) % VCIP_SYMBOL_KEY.length];
    }
    prevDigit = entry.digit;
    items.push({
      id: `ps-${i + 1}`,
      symbolId: entry.symbolId,
      correctDigit: entry.digit,
    });
  }
  return items;
}

// ============================================================================
// MODULE 4: VERBAL REASONING — ORIGINAL ENGLISH & HINDI QUESTION BANKS
// ============================================================================

const VERBAL_BANK_EN: VcipTextChoiceQuestion[] = [
  {
    id: 'vr-en-1',
    domain: 'verbal_reasoning',
    category: 'Word Analogy',
    difficulty: 1,
    classTier: 'middle_6_8',
    language: 'en',
    prompt: 'Thermometer is to Temperature as Barometer is to ____.',
    options: ['Air Pressure', 'Wind Speed', 'Rainfall Volume', 'Sunlight Angle'],
    correctIndex: 0,
    explanation: 'A thermometer measures temperature; a barometer measures atmospheric air pressure.',
  },
  {
    id: 'vr-en-2',
    domain: 'verbal_reasoning',
    category: 'Conceptual Classification',
    difficulty: 1,
    classTier: 'middle_6_8',
    language: 'en',
    prompt: 'Three words share a structural relationship. Which word does NOT belong?',
    options: ['Compass', 'Protractor', 'Ruler', 'Paragraph'],
    correctIndex: 3,
    explanation: 'Compass, protractor, and ruler are geometry measurement instruments; paragraph is a writing unit.',
  },
  {
    id: 'vr-en-3',
    domain: 'verbal_reasoning',
    category: 'Logical Deduction',
    difficulty: 2,
    classTier: 'secondary_9_10',
    language: 'en',
    prompt:
      'Premise 1: Every solar panel on the science wing generates clean electricity. Premise 2: Panel B-4 is installed on the science wing. Which statement must be true?',
    options: [
      'Panel B-4 generates clean electricity.',
      'Only the science wing uses electricity.',
      'Panel B-4 works best at night.',
      'All school buildings have solar panels.',
    ],
    correctIndex: 0,
    explanation: 'By direct deductive logic, membership in the science wing guarantees the property stated in Premise 1.',
  },
  {
    id: 'vr-en-4',
    domain: 'verbal_reasoning',
    category: 'Verbal Similarities',
    difficulty: 2,
    classTier: 'middle_6_8',
    language: 'en',
    prompt: 'How are a Library Index and a Road Map most conceptually alike?',
    options: [
      'Both are printed only on glossy paper.',
      'Both organize information to help locate specific destinations efficiently.',
      'Both measure physical speed of travel.',
      'Both require electronic batteries to read.',
    ],
    correctIndex: 1,
    explanation: 'Both act as structured navigational systems that map locations for quick retrieval.',
  },
  {
    id: 'vr-en-5',
    domain: 'verbal_reasoning',
    category: 'Sentence Completion',
    difficulty: 2,
    classTier: 'secondary_9_10',
    language: 'en',
    prompt:
      'Although the initial experiment produced unexpected readings, the research team remained ____ and audited each calibration step carefully.',
    options: ['methodical', 'impulsive', 'indifferent', 'hasty'],
    correctIndex: 0,
    explanation: '"Although" signals contrast with unexpected readings; "methodical" aligns with carefully auditing calibration steps.',
  },
  {
    id: 'vr-en-6',
    domain: 'verbal_reasoning',
    category: 'Reading Comprehension',
    difficulty: 3,
    classTier: 'senior_11_12',
    language: 'en',
    passage:
      'Urban tree canopies lower neighbourhood street temperatures by shading asphalt surfaces and releasing moisture through transpiration. However, planting trees without matching native soil and rainfall needs often leads to high sapling loss during dry summers.',
    prompt: 'Which conclusion is directly supported by the passage?',
    options: [
      'Any tree species cools every city equally without maintenance.',
      'Effective urban cooling depends on selecting species suited to local soil and rainfall.',
      'Asphalt absorbs less heat than shaded soil.',
      'Transpiration happens only during winter rainfall.',
    ],
    correctIndex: 1,
    explanation: 'The second sentence explicitly links tree survival and success to matching native soil and rainfall conditions.',
  },
];

const VERBAL_BANK_HI: VcipTextChoiceQuestion[] = [
  {
    id: 'vr-hi-1',
    domain: 'verbal_reasoning',
    category: 'शब्द सादृश्य (Word Analogy)',
    difficulty: 1,
    classTier: 'middle_6_8',
    language: 'hi',
    prompt: 'जैसे "डॉक्टर" का संबंध "अस्पताल" से है, वैसे ही "अध्यापक" का संबंध किससे है?',
    options: ['विद्यालय', 'बाज़ार', 'डाकघर', 'बंदरगाह'],
    correctIndex: 0,
    explanation: 'डॉक्टर अस्पताल में कार्य करते हैं और अध्यापक विद्यालय में शिक्षण कार्य करते हैं।',
  },
  {
    id: 'vr-hi-2',
    domain: 'verbal_reasoning',
    category: 'वर्गीकरण (Classification)',
    difficulty: 1,
    classTier: 'middle_6_8',
    language: 'hi',
    prompt: 'निम्न में से कौन-सा शब्द अन्य तीन से अलग श्रेणी का है?',
    options: ['गंगा', 'यमुना', 'नर्मदा', 'हिमालय'],
    correctIndex: 3,
    explanation: 'गंगा, यमुना और नर्मदा नदियाँ हैं, जबकि हिमालय एक पर्वत श्रृंखला है।',
  },
  {
    id: 'vr-hi-3',
    domain: 'verbal_reasoning',
    category: 'तार्किक निष्कर्ष (Logical Deduction)',
    difficulty: 2,
    classTier: 'secondary_9_10',
    language: 'hi',
    prompt:
      'कथन 1: सभी हरे पौधे प्रकाश-संश्लेषण से भोजन बनाते हैं। कथन 2: नीम एक हरा पौधा है। निश्चित रूप से कौन-सा निष्कर्ष सही है?',
    options: [
      'नीम प्रकाश-संश्लेषण से भोजन बनाता है।',
      'केवल नीम ही ऑक्सीजन देता है।',
      'नीम को पानी की आवश्यकता नहीं होती।',
      'सभी वृक्ष केवल रेगिस्तान में उगते हैं।',
    ],
    correctIndex: 0,
    explanation: 'दोनों कथनों के सीधे तार्किक संयोजन से सिद्ध होता है कि नीम प्रकाश-संश्लेषण करता है।',
  },
  {
    id: 'vr-hi-4',
    domain: 'verbal_reasoning',
    category: 'वैचारिक समानता (Verbal Similarity)',
    difficulty: 2,
    classTier: 'middle_6_8',
    language: 'hi',
    prompt: '"शब्दकोश" और "मानचित्र" में सबसे मुख्य समानता क्या है?',
    options: [
      'दोनों केवल गणित के सूत्र बताते हैं।',
      'दोनों व्यवस्थित जानकारी देकर सही अर्थ या स्थान खोजने में मदद करते हैं।',
      'दोनों केवल रात में उपयोगी हैं।',
      'दोनों में संख्याएँ नहीं होतीं।',
    ],
    correctIndex: 1,
    explanation: 'शब्दकोश शब्दों के अर्थ और मानचित्र स्थानों की जानकारी व्यवस्थित रूप से खोजने में सहायक होते हैं।',
  },
  {
    id: 'vr-hi-5',
    domain: 'verbal_reasoning',
    category: 'वाक्य पूर्ति (Sentence Completion)',
    difficulty: 2,
    classTier: 'secondary_9_10',
    language: 'hi',
    prompt: 'कठिन समस्या सामने आने पर भी आरव शांत रहा और उसने ____ तरीके से हर चरण की जाँच की।',
    options: ['व्यवस्थित', 'लापरवाह', 'अधीर', 'अनुचित'],
    correctIndex: 0,
    explanation: '"शांत रहकर हर चरण की जाँच" करना व्यवस्थित दृष्टिकोण को दर्शाता है।',
  },
  {
    id: 'vr-hi-6',
    domain: 'verbal_reasoning',
    category: 'गद्यांश बोध (Reading Comprehension)',
    difficulty: 3,
    classTier: 'senior_11_12',
    language: 'hi',
    passage:
      'वर्षा जल संचयन से भूजल स्तर को संतुलित रखने में बड़ी मदद मिलती है। यदि विद्यालयों और घरों की छतों पर सरल फ़िल्टर प्रणाली लगाई जाए, तो गर्मियों में जल संकट को काफी हद तक कम किया जा सकता है।',
    prompt: 'गद्यांश के अनुसार कौन-सा कथन प्रत्यक्ष रूप से समर्थित है?',
    options: [
      'वर्षा जल संचयन से भूजल स्तर बेहतर होता है और जल संकट घटता है।',
      'छतों पर फ़िल्टर लगाने से वर्षा कम हो जाती है।',
      'गर्मियों में पानी की आवश्यकता नहीं होती।',
      'भूजल केवल बड़े शहरों में पाया जाता है।',
    ],
    correctIndex: 0,
    explanation: 'गद्यांश स्पष्ट रूप से बताता है कि वर्षा जल संचयन भूजल संतुलन और जल संकट घटाने में मदद करता है।',
  },
];

export function generateVerbalReasoningQuestions(
  classNumber: number,
  language: VcipLanguage = 'en',
): VcipTextChoiceQuestion[] {
  const tier = getClassTierFromClassNumber(classNumber);
  const bank = language === 'hi' ? VERBAL_BANK_HI : VERBAL_BANK_EN;
  return bank.map((q) => ({ ...q, classTier: tier }));
}

// ============================================================================
// MODULE 5: QUANTITATIVE REASONING — CLASS-SCALED ORIGINAL GENERATOR
// ============================================================================

export function generateQuantitativeReasoningQuestions(
  classNumber: number,
): VcipTextChoiceQuestion[] {
  const tier = getClassTierFromClassNumber(classNumber);
  const isJunior = tier === 'foundation_5' || tier === 'middle_6_8';

  if (isJunior) {
    return [
      {
        id: `qr-${tier}-1`,
        domain: 'quantitative_reasoning',
        category: 'Number Series',
        difficulty: 1,
        classTier: tier,
        language: 'en',
        prompt: 'Find the next number in the sequence: 4, 9, 15, 22, 30, ___',
        options: ['37', '39', '40', '42'],
        correctIndex: 1,
        explanation: 'Differences increase by +1 each step: +5, +6, +7, +8, so next is 30 + 9 = 39.',
      },
      {
        id: `qr-${tier}-2`,
        domain: 'quantitative_reasoning',
        category: 'Missing Number',
        difficulty: 1,
        classTier: tier,
        language: 'en',
        prompt: 'Row 1: (3, 5 → 15) · Row 2: (4, 6 → 24) · Row 3: (7, ? → 56). Find the missing number.',
        options: ['6', '7', '8', '9'],
        correctIndex: 2,
        explanation: 'Each row multiplies the first two numbers (7 × 8 = 56).',
      },
      {
        id: `qr-${tier}-3`,
        domain: 'quantitative_reasoning',
        category: 'Arithmetic Reasoning',
        difficulty: 2,
        classTier: tier,
        language: 'en',
        prompt:
          'A school library shelf holds 18 science books and 12 maths books. If 6 more science books are added, what fraction of all books on the shelf are science books?',
        options: ['1/2', '2/3', '3/4', '5/6'],
        correctIndex: 1,
        explanation: 'Science books = 18 + 6 = 24; total books = 24 + 12 = 36; 24/36 = 2/3.',
      },
      {
        id: `qr-${tier}-4`,
        domain: 'quantitative_reasoning',
        category: 'Numerical Analogy',
        difficulty: 2,
        classTier: tier,
        language: 'en',
        prompt: '6 : 36 :: 9 : ___',
        options: ['72', '81', '90', '63'],
        correctIndex: 1,
        explanation: 'The second number is the square of the first (6² = 36, so 9² = 81).',
      },
      {
        id: `qr-${tier}-5`,
        domain: 'quantitative_reasoning',
        category: 'Data Interpretation',
        difficulty: 2,
        classTier: tier,
        language: 'en',
        passage: 'Weekly Reading Pages — Mon: 14 · Tue: 18 · Wed: 16 · Thu: 22 · Fri: 20',
        prompt: 'What is the average number of pages read per day across these 5 days?',
        options: ['16', '17', '18', '19'],
        correctIndex: 2,
        explanation: 'Total = 14 + 18 + 16 + 22 + 20 = 90 pages; 90 ÷ 5 = 18 pages/day.',
      },
      {
        id: `qr-${tier}-6`,
        domain: 'quantitative_reasoning',
        category: 'Quantitative Problem-Solving',
        difficulty: 3,
        classTier: tier,
        language: 'en',
        prompt:
          'A cyclist covers 36 km in 2 hours at steady speed. How far will the cyclist travel in 3 hours 30 minutes at the same speed?',
        options: ['54 km', '60 km', '63 km', '72 km'],
        correctIndex: 2,
        explanation: 'Speed = 18 km/h; in 3.5 hours, distance = 18 × 3.5 = 63 km.',
      },
    ];
  }

  return [
    {
      id: `qr-${tier}-1`,
      domain: 'quantitative_reasoning',
      category: 'Number Series',
      difficulty: 1,
      classTier: tier,
      language: 'en',
      prompt: 'Identify the next term in the series: 3, 8, 18, 38, 78, ___',
      options: ['148', '156', '158', '162'],
      correctIndex: 2,
      explanation: 'Rule is (previous × 2) + 2: 78 × 2 + 2 = 158.',
    },
    {
      id: `qr-${tier}-2`,
      domain: 'quantitative_reasoning',
      category: 'Mathematical Relationships',
      difficulty: 2,
      classTier: tier,
      language: 'en',
      prompt: 'If 3x + 2y = 26 and x − y = 2, what is the value of x + y?',
      options: ['8', '10', '12', '14'],
      correctIndex: 1,
      explanation: 'Substitute x = y + 2 into 3(y + 2) + 2y = 26 → 5y = 20 → y = 4, x = 6; x + y = 10.',
    },
    {
      id: `qr-${tier}-3`,
      domain: 'quantitative_reasoning',
      category: 'Numerical Analogy',
      difficulty: 2,
      classTier: tier,
      language: 'en',
      prompt: '4 : 68 :: 5 : ___ (Hint: compare cubes and original numbers)',
      options: ['125', '130', '135', '150'],
      correctIndex: 1,
      explanation: 'Rule is n³ + n: 4³ + 4 = 68, so 5³ + 5 = 125 + 5 = 130.',
    },
    {
      id: `qr-${tier}-4`,
      domain: 'quantitative_reasoning',
      category: 'Data Interpretation',
      difficulty: 2,
      classTier: tier,
      language: 'en',
      passage:
        'School Solar Output (kWh) — Q1: 420 · Q2: 525 · Q3: 480 · Q4: 575',
      prompt: 'By what percentage did solar output increase from Q1 to Q2?',
      options: ['20%', '22.5%', '25%', '28%'],
      correctIndex: 2,
      explanation: 'Increase = 525 − 420 = 105 kWh; (105 / 420) × 100 = 25%.',
    },
    {
      id: `qr-${tier}-5`,
      domain: 'quantitative_reasoning',
      category: 'Arithmetic Reasoning',
      difficulty: 3,
      classTier: tier,
      language: 'en',
      prompt:
        'A lab mixture of 40 litres contains water and saline in the ratio 3:1. How many litres of saline must be added to make the ratio 2:1?',
      options: ['4 litres', '5 litres', '6 litres', '8 litres'],
      correctIndex: 1,
      explanation: 'Initially 30 L water and 10 L saline. For 2:1 with 30 L water, saline must be 15 L → add 5 L.',
    },
    {
      id: `qr-${tier}-6`,
      domain: 'quantitative_reasoning',
      category: 'Quantitative Problem-Solving',
      difficulty: 3,
      classTier: tier,
      language: 'en',
      prompt:
        'Two trains 330 km apart start towards each other at 50 km/h and 60 km/h. After how many hours will they meet?',
      options: ['2.5 hours', '3 hours', '3.3 hours', '3.5 hours'],
      correctIndex: 1,
      explanation: 'Combined closing speed = 50 + 60 = 110 km/h; time = 330 ÷ 110 = 3 hours.',
    },
  ];
}

// ============================================================================
// MODULE 6: SPATIAL REASONING & MENTAL ROTATION — ORIGINAL SVG SPEC GENERATOR
// ============================================================================

export function generateSpatialReasoningQuestions(
  classNumber: number,
  seed = 'vcip-spatial',
): VcipSpatialQuestion[] {
  const tier = getClassTierFromClassNumber(classNumber);
  const rng = createSeededRng(`${seed}-${tier}`);

  const makeRotationQ = (
    id: string,
    difficulty: 1 | 2 | 3,
    cells: Array<[number, number]>,
    targetRot: number,
    accentColor: string,
    prompt: string,
  ): VcipSpatialQuestion => {
    const correctSpec: VcipSpatialSpec = {
      kind: 'rotation_2d',
      cells,
      rotationDeg: targetRot,
      mirrored: false,
      accentColor,
    };
    const distractors: VcipSpatialSpec[] = [
      { kind: 'rotation_2d', cells, rotationDeg: targetRot, mirrored: true, accentColor },
      { kind: 'rotation_2d', cells, rotationDeg: (targetRot + 90) % 360, mirrored: true, accentColor },
      { kind: 'rotation_2d', cells, rotationDeg: (targetRot + 180) % 360, mirrored: true, accentColor },
    ];
    const all = shuffleWithRng(
      [
        { isCorrect: true, spec: correctSpec },
        ...distractors.map((s) => ({ isCorrect: false, spec: s })),
      ],
      rng,
    );
    const correctIndex = all.findIndex((x) => x.isCorrect);
    return {
      id,
      domain: 'spatial_reasoning',
      category: 'rotation_2d',
      difficulty,
      classTier: tier,
      prompt,
      reference: { kind: 'rotation_2d', cells, rotationDeg: 0, mirrored: false, accentColor },
      options: all.map((item, idx) => ({ label: `Option ${String.fromCharCode(65 + idx)}`, spec: item.spec })),
      correctIndex,
      explanation: `Only Option ${String.fromCharCode(65 + correctIndex)} is a pure ${targetRot}° clockwise rotation without mirroring (flipping).`,
    };
  };

  // Q1: 2D Asymmetric L-hook 90° CW rotation
  const q1 = makeRotationQ(
    `sp-${tier}-1`,
    1,
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 3],
    ],
    90,
    '#1d4ed8',
    'Which figure shows the exact reference shape rotated (NOT flipped or mirrored)?',
  );

  // Q2: 2D Asymmetric Stepped Polyomino 180° rotation
  const q2 = makeRotationQ(
    `sp-${tier}-2`,
    2,
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    180,
    '#0f766e',
    'Mentally rotate the asymmetric stepped block 180°. Identify the exact match without reflection.',
  );

  // Q3: 3D Isometric Block Orientation
  const baseBlocks: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
  ];
  const rotatedBlocks: Array<[number, number, number]> = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 0],
    [0, 0, 1],
    [1, 0, 0],
  ];
  const wrongBlocks1: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [2, 0, 1],
    [0, 1, 0],
  ];
  const wrongBlocks2: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 2, 0],
    [1, 2, 1],
  ];
  const wrongBlocks3: Array<[number, number, number]> = [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [1, 0, 1],
    [1, 1, 0],
  ];

  const isoAll = shuffleWithRng(
    [
      { isCorrect: true, blocks: rotatedBlocks },
      { isCorrect: false, blocks: wrongBlocks1 },
      { isCorrect: false, blocks: wrongBlocks2 },
      { isCorrect: false, blocks: wrongBlocks3 },
    ],
    rng,
  );
  const isoCorrectIdx = isoAll.findIndex((x) => x.isCorrect);
  const q3: VcipSpatialQuestion = {
    id: `sp-${tier}-3`,
    domain: 'spatial_reasoning',
    category: 'isometric_3d',
    difficulty: 2,
    classTier: tier,
    prompt:
      'Rotate the 3D unit-cube assembly 90° around the vertical axis. Which isometric view represents the exact same 5-cube object?',
    reference: { kind: 'isometric_3d', blocks3d: baseBlocks, accentColor: '#6d28d9' },
    options: isoAll.map((item, idx) => ({
      label: `View ${String.fromCharCode(65 + idx)}`,
      spec: { kind: 'isometric_3d', blocks3d: item.blocks, accentColor: '#6d28d9' },
    })),
    correctIndex: isoCorrectIdx,
    explanation:
      'Count the 5 unit cubes and track the raised vertical block anchored at the L-junction corner.',
  };

  // Q4: Cube Net Folding — Opposite Faces
  const netFaces = ['★', '▲', '●', '■', '◆', '✚'];
  // Standard cross net: top=0(★), left=1(▲), center=2(●), right=3(■), bottom=4(◆), far-bottom=5(✚)
  // Opposite pairs: (0,4), (1,3), (2,5)
  const q4: VcipSpatialQuestion = {
    id: `sp-${tier}-4`,
    domain: 'spatial_reasoning',
    category: 'cube_net',
    difficulty: 2,
    classTier: tier,
    prompt:
      'When this flat 2D cross net is folded upward into a 3D cube, which pair of symbols will land on OPPOSITE faces?',
    reference: { kind: 'cube_net', netFaces, accentColor: '#b45309' },
    options: [
      { label: '★ and ◆', spec: { kind: 'cube_net', netFaces: ['★', '◆'], accentColor: '#b45309' } },
      { label: '★ and ●', spec: { kind: 'cube_net', netFaces: ['★', '●'], accentColor: '#b45309' } },
      { label: '▲ and ●', spec: { kind: 'cube_net', netFaces: ['▲', '●'], accentColor: '#b45309' } },
      { label: '● and ■', spec: { kind: 'cube_net', netFaces: ['●', '■'], accentColor: '#b45309' } },
    ],
    correctIndex: 0,
    explanation:
      'In a standard cross net, faces separated by exactly one square along a straight line fold onto opposite sides (★ opposes ◆; ▲ opposes ■; ● opposes ✚).',
  };

  // Q5: Shape Assembly (Combine two pieces into a 3×3 or rectangle)
  const q5: VcipSpatialQuestion = {
    id: `sp-${tier}-5`,
    domain: 'spatial_reasoning',
    category: 'shape_assembly',
    difficulty: 3,
    classTier: tier,
    prompt:
      'Combine Piece 1 and Piece 2 (rotations allowed, no overlap). Which completed silhouette is formed?',
    reference: {
      kind: 'shape_assembly',
      pieceA: [
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      pieceB: [
        [0, 0],
        [1, 0],
        [1, 1],
      ],
      accentColor: '#0284c7',
    },
    options: [
      {
        label: '2×3 Solid Rectangle',
        spec: {
          kind: 'rotation_2d',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [1, 1],
            [2, 1],
          ],
          rotationDeg: 0,
          accentColor: '#0284c7',
        },
      },
      {
        label: '3×3 Hollow Frame',
        spec: {
          kind: 'rotation_2d',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1],
            [2, 1],
            [0, 2],
          ],
          rotationDeg: 0,
          accentColor: '#0284c7',
        },
      },
      {
        label: 'Cross Plus Shape',
        spec: {
          kind: 'rotation_2d',
          cells: [
            [1, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [1, 2],
          ],
          rotationDeg: 0,
          accentColor: '#0284c7',
        },
      },
      {
        label: '4×1 Straight Bar',
        spec: {
          kind: 'rotation_2d',
          cells: [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
          ],
          rotationDeg: 0,
          accentColor: '#0284c7',
        },
      },
    ],
    correctIndex: 0,
    explanation:
      'Two 3-unit L-triominoes interlock along their inner notch to form a clean 2×3 rectangle (6 total unit squares).',
  };

  // Q6: Advanced 270° Rotation
  const q6 = makeRotationQ(
    `sp-${tier}-6`,
    3,
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [1, 2],
      [2, 2],
    ],
    270,
    '#be123c',
    'Final Spatial Challenge: Rotate this 6-unit C-bracket 270° clockwise (90° counter-clockwise).',
  );

  return [q1, q2, q3, q4, q5, q6];
}
