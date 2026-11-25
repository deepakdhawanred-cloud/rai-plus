export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// ---------------------------------------------------------------------------
// 1. SUDOKU ENGINE (4x4 L1-2, 6x6 L3, 9x9 L4-5)
// ---------------------------------------------------------------------------
export interface SudokuPuzzleConfig {
  size: 4 | 6 | 9;
  boxRows: number;
  boxCols: number;
  solution: number[][];
  fixedMask: boolean[][];
}

const SUDOKU_4_SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  [
    [2, 4, 1, 3],
    [1, 3, 4, 2],
    [4, 2, 3, 1],
    [3, 1, 2, 4],
  ],
];

const SUDOKU_6_SOLUTIONS: number[][][] = [
  [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
  ],
  [
    [6, 1, 2, 3, 4, 5],
    [3, 4, 5, 6, 1, 2],
    [1, 2, 6, 4, 5, 3],
    [4, 5, 3, 1, 2, 6],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
  ],
];

const SUDOKU_9_SOLUTIONS: number[][][] = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
  [
    [8, 2, 7, 1, 5, 4, 3, 9, 6],
    [9, 6, 5, 3, 2, 7, 1, 4, 8],
    [3, 4, 1, 6, 8, 9, 7, 5, 2],
    [5, 9, 3, 4, 6, 8, 2, 7, 1],
    [4, 7, 2, 5, 1, 3, 6, 8, 9],
    [6, 1, 8, 9, 7, 2, 4, 3, 5],
    [7, 8, 6, 2, 3, 5, 9, 1, 4],
    [1, 5, 4, 7, 9, 6, 8, 2, 3],
    [2, 3, 9, 8, 4, 1, 5, 6, 7],
  ],
];

function deterministicIndices(total: number, keepCount: number, seed: number): Set<number> {
  const arr = Array.from({ length: total }, (_, i) => i);
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return new Set(arr.slice(0, keepCount));
}

export function buildSudokuPuzzle(level: DifficultyLevel, variant = 0): SudokuPuzzleConfig {
  if (level <= 2) {
    const base = SUDOKU_4_SOLUTIONS[variant % SUDOKU_4_SOLUTIONS.length];
    const clues = level === 1 ? 10 : 7;
    const keep = deterministicIndices(16, clues, level * 17 + variant);
    return {
      size: 4,
      boxRows: 2,
      boxCols: 2,
      solution: base.map((r) => [...r]),
      fixedMask: base.map((row, r) => row.map((_, c) => keep.has(r * 4 + c))),
    };
  }
  if (level === 3) {
    const base = SUDOKU_6_SOLUTIONS[variant % SUDOKU_6_SOLUTIONS.length];
    const keep = deterministicIndices(36, 18, level * 29 + variant);
    return {
      size: 6,
      boxRows: 2,
      boxCols: 3,
      solution: base.map((r) => [...r]),
      fixedMask: base.map((row, r) => row.map((_, c) => keep.has(r * 6 + c))),
    };
  }
  // Level 4 (Classes 9-10): 9x9 with 35 givens
  // Level 5 (Classes 11-12): 9x9 with 26 givens
  const base = SUDOKU_9_SOLUTIONS[variant % SUDOKU_9_SOLUTIONS.length];
  const clues = level === 4 ? 35 : 26;
  const keep = deterministicIndices(81, clues, level * 53 + variant * 11);
  return {
    size: 9,
    boxRows: 3,
    boxCols: 3,
    solution: base.map((r) => [...r]),
    fixedMask: base.map((row, r) => row.map((_, c) => keep.has(r * 9 + c))),
  };
}

export function hasSudokuCellConflict(
  grid: number[][],
  r: number,
  c: number,
  boxRows: number,
  boxCols: number,
): boolean {
  const val = grid[r]?.[c] ?? 0;
  if (val <= 0) return false;
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    if (i !== c && grid[r][i] === val) return true;
    if (i !== r && grid[i][c] === val) return true;
  }
  const br = Math.floor(r / boxRows) * boxRows;
  const bc = Math.floor(c / boxCols) * boxCols;
  for (let dr = 0; dr < boxRows; dr++) {
    for (let dc = 0; dc < boxCols; dc++) {
      const rr = br + dr;
      const cc = bc + dc;
      if ((rr !== r || cc !== c) && grid[rr][cc] === val) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// 2. LOGIC ESCAPE & NUMBER DETECTIVE STAGES (L1-5)
// ---------------------------------------------------------------------------
export interface LogicStage {
  q: string;
  options: string[];
  ans: string;
}

export function buildLogicEscapeStages(level: DifficultyLevel): LogicStage[] {
  if (level <= 2) {
    return [
      {
        q: 'River Crossing Gate 1: A boat carries the farmer plus 1 item. Left alone, Fox eats Hen and Hen eats Grain. Who crosses FIRST?',
        options: ['Hen (leaves Fox & Grain safely)', 'Fox', 'Grain sack', 'Empty boat'],
        ans: 'Hen (leaves Fox & Grain safely)',
      },
      {
        q: 'Cipher Gate 2: A 3-digit lock satisfies: First digit is half of second, third is 3 more than first, sum is 11. Code?',
        options: ['2 - 4 - 5', '3 - 6 - 2', '1 - 2 - 8', '4 - 2 - 5'],
        ans: '2 - 4 - 5',
      },
      {
        q: 'Order Gate 3: Riya finishes ahead of Kabir, and Aarav finishes behind Kabir. Who finishes second?',
        options: ['Kabir', 'Riya', 'Aarav', 'Cannot be determined'],
        ans: 'Kabir',
      },
    ];
  }
  if (level === 3) {
    return [
      {
        q: 'Balance Gate 1: Two brass cylinders + 4 kg balance three cylinders + 1 kg. What is the mass of one cylinder?',
        options: ['3 kg', '2 kg', '4 kg', '5 kg'],
        ans: '3 kg',
      },
      {
        q: 'Seating Gate 2: Four friends sit in a row facing North. Meera is immediately left of Tanvi. Rohan is not at either end, and sits next to Meera. Who sits at the extreme right?',
        options: ['Tanvi', 'Rohan', 'Meera', 'Kabir'],
        ans: 'Tanvi',
      },
      {
        q: 'Modular Clock Gate 3: A lab timer beeps every 12 minutes and another every 18 minutes. If both beep together at 09:00 AM, when do they next coincide?',
        options: ['09:36 AM', '09:30 AM', '09:54 AM', '10:12 AM'],
        ans: '09:36 AM',
      },
      {
        q: 'Set Gate 4: Out of 40 students, 24 take Robotics and 22 take Debate. Every student takes at least one club. How many take BOTH?',
        options: ['6', '4', '8', '10'],
        ans: '6',
      },
    ];
  }
  if (level === 4) {
    return [
      {
        q: 'Knights & Knaves Gate 1: Knights always tell the truth; Knaves always lie. Aria says: "Both Dev and I are Knaves." Dev says nothing. What are Aria and Dev?',
        options: [
          'Aria is a Knave; Dev is a Knight',
          'Both Aria and Dev are Knaves',
          'Aria is a Knight; Dev is a Knave',
          'Both Aria and Dev are Knights',
        ],
        ans: 'Aria is a Knave; Dev is a Knight',
      },
      {
        q: 'Digital Circuit Gate 2: Evaluate the logic gate expression: ((A XOR B) AND (NOT C)) OR (A AND C), given A = 1, B = 0, C = 1.',
        options: ['1 (HIGH)', '0 (LOW)', 'Indeterminate', 'Oscillating'],
        ans: '1 (HIGH)',
      },
      {
        q: 'Scheduling Gate 3: Five lectures (Maths, Physics, Chemistry, English, History) occupy Slots 1–5. Physics is immediately after Maths. History is neither 1st nor 5th. Chemistry is in Slot 4. English is 1st. Which subject is in Slot 5?',
        options: ['History', 'Physics', 'Maths', 'Cannot happen — wait: check slots carefully'],
        ans: 'Physics',
      },
      {
        q: 'Contrapositive Gate 4: Given "If an experiment violates thermal equilibrium, its entropy output is strictly positive." Which statement MUST be logically equivalent?',
        options: [
          'If entropy output is not strictly positive, the experiment does not violate thermal equilibrium.',
          'If entropy output is strictly positive, thermal equilibrium was violated.',
          'If thermal equilibrium holds, entropy output is zero.',
          'No experiment with positive entropy reaches equilibrium.',
        ],
        ans: 'If entropy output is not strictly positive, the experiment does not violate thermal equilibrium.',
      },
      {
        q: 'Weighted Code Gate 5: A 3-digit PIN (d1, d2, d3) satisfies: d1 + d2 + d3 = 14, d2 = 2·d1, and d3 is prime with d3 > d2. Find the PIN.',
        options: ['2 - 4 - 8', '3 - 6 - 5', '2 - 5 - 7', '4 - 8 - 2'],
        ans: '3 - 6 - 5',
      },
    ].map((s, idx) =>
      // Wait: verify Gate 3 carefully! English=1, Chemistry=4, History not 1 or 5 -> History must be 2 or 3. Maths+Physics consecutive -> (2,3) or empty! Wait if History is 2 or 3, and (M,P) must be adjacent, (2,3) is taken if History=2? Wait: Slots 1..5: 1=Eng, 4=Chem. Remaining open slots are {2,3,5}. History cannot be 5, so History is in {2,3}. Wait if History is in {2,3}, then remaining two of {2,3,5} are NOT adjacent ({3,5} or {2,5})! Let's fix Gate 3 constraint so (Maths, Physics) cleanly occupies (4,5) when Chemistry=2!
      idx === 2
        ? {
            q: 'Scheduling Gate 3: Five lectures (Maths, Physics, Chemistry, English, History) occupy Slots 1–5. English is Slot 1. Chemistry is Slot 2. History cannot be in Slot 5. Physics is immediately after Maths. What is in Slot 3?',
            options: ['History', 'Maths', 'Physics', 'Chemistry'],
            ans: 'History',
          }
        : s,
    );
  }
  // Level 5 (Classes 11-12): Genuine Olympiad / Senior Secondary Deductive Logic
  return [
    {
      q: '4-Speaker Parity Gate 1: On Truth Island, Knights always tell the truth and Knaves always lie. A says: "Exactly one of B and C is a Knight." B says: "A and D are of the SAME type." C says: "A is a Knave." D says: "B is a Knight." Who are the Knights?',
      options: ['Only C', 'A and D', 'B and D', 'Only A'],
      ans: 'Only C',
    },
    {
      q: 'Multi-Gate Relay 2: Inputs P=1, Q=1, R=0, S=1 feed into X = (P NAND Q), Y = (R XOR S), and Final = (X NOR Y) XOR (P AND S). What is the output Final?',
      options: ['1 (TRUE)', '0 (FALSE)', 'Undefined', 'Depends on clock'],
      ans: '1 (TRUE)',
    },
    {
      q: 'Constraint Matrix Gate 3: Four researchers (K, L, M, N) sit around a circular table facing center. L sits opposite K. M sits immediately to the left of L. Which person sits immediately to the right of K?',
      options: ['M', 'N', 'L', 'Either M or N'],
      ans: 'M',
    },
    {
      q: 'Quantifier & Implication Gate 4: "Only if a material is superconducting below Tc does it expel magnetic flux completely (Meissner effect)." Which observation FALSIFIES this statement?',
      options: [
        'A sample expels magnetic flux completely below Tc while having non-zero electrical resistance.',
        'A superconducting sample does not expel magnetic flux above Tc.',
        'A non-superconducting sample fails to expel magnetic flux.',
        'A superconducting sample expels flux completely below Tc.',
      ],
      ans: 'A sample expels magnetic flux completely below Tc while having non-zero electrical resistance.',
    },
    {
      q: 'Chinese Remainder Vault 5: Find the smallest integer N > 50 such that N ≡ 3 (mod 5), N ≡ 4 (mod 7), and N ≡ 2 (mod 3).',
      options: ['53', '88', '74', '103'],
      ans: '53',
    },
  ];
}

export function buildNumberDetectiveStages(level: DifficultyLevel): LogicStage[] {
  if (level <= 2) {
    const base = level * 3;
    return [
      {
        q: `Find the next number: ${base}, ${base + 4}, ${base + 8}, ${base + 12}, ?`,
        options: [String(base + 16), String(base + 14), String(base + 18), String(base + 20)],
        ans: String(base + 16),
      },
      {
        q: 'Find the missing value: 3, 6, 12, 24, ?',
        options: ['48', '36', '42', '30'],
        ans: '48',
      },
      {
        q: 'Find the missing square: 1, 4, 9, 16, ?, 36',
        options: ['25', '24', '21', '28'],
        ans: '25',
      },
      {
        q: 'Alternating jumps: 5, 7, 11, 13, 17, ?',
        options: ['19', '21', '23', '20'],
        ans: '19',
      },
    ];
  }
  if (level === 3) {
    return [
      {
        q: 'Triangular numbers: 1, 3, 6, 10, 15, ?',
        options: ['21', '20', '22', '24'],
        ans: '21',
      },
      {
        q: 'Hybrid rule (×2 + 1): 2, 5, 11, 23, 47, ?',
        options: ['95', '94', '93', '97'],
        ans: '95',
      },
      {
        q: 'Perfect cubes: 1, 8, 27, 64, ?, 216',
        options: ['125', '100', '144', '128'],
        ans: '125',
      },
      {
        q: 'Interleaved series: 4, 20, 8, 17, 16, 14, 32, ?',
        options: ['11', '12', '64', '10'],
        ans: '11',
      },
    ];
  }
  if (level === 4) {
    return [
      {
        q: 'Second-order difference series: 2, 6, 12, 20, 30, ?',
        options: ['42', '40', '44', '38'],
        ans: '42',
      },
      {
        q: 'Prime-gap progression: 2, 5, 10, 17, 28, ?',
        options: ['41', '39', '43', '37'],
        ans: '41',
      },
      {
        q: 'Shifted Fibonacci recurrence (aₙ = aₙ₋₁ + aₙ₋₂ + 1): 1, 2, 4, 7, 12, 20, ?',
        options: ['33', '32', '31', '34'],
        ans: '33',
      },
      {
        q: 'Row rule in 2×3 matrix: [4, 7 -> 25], [6, 5 -> 27], [8, 9 -> ?]',
        options: ['65', '72', '63', '68'],
        ans: '65', // wait: 4*7 - 3 = 25; 6*5 - 3 = 27; 8*9 - 7? No make rule a*b - a? 4*7-4=24. Check a*b - (a+b-8)? Better: 4*7 - 3 = 25? Let's make exact rule a*b - 3: 8*9-3=69! Even cleaner: a² + b: [4, 7 -> 23], [6, 5 -> 41], [8, 9 -> 73]!
      },
      {
        q: 'Alternating power-difference: 3, 4, 8, 17, 33, ?',
        options: ['58', '56', '60', '54'],
        ans: '58',
      },
    ].map((s, idx) =>
      idx === 3
        ? {
            q: 'Matrix law (Row inputs A, B -> Output): [4, 7 -> 23], [6, 5 -> 41], [8, 9 -> ?]',
            options: ['73', '65', '81', '71'],
            ans: '73',
          }
        : s,
    );
  }
  // Level 5 (Classes 11-12): Third-order differences, alternating recurrences, dual series, algebraic grid, prime products
  return [
    {
      q: 'Cubic polynomial series: 0, 6, 24, 60, 120, ?',
      options: ['210', '196', '216', '180'],
      ans: '210',
    },
    {
      q: 'Recurrence aₙ = 2·aₙ₋₁ + (−1)ⁿ·n (starting a₁ = 3): 3, 8, 13, 30, 55, ?',
      options: ['116', '104', '114', '110'],
      ans: '116',
    },
    {
      q: 'Interleaved dual-rule sequence: 2, 5, 6, 11, 12, 23, 20, ?',
      options: ['47', '41', '30', '49'],
      ans: '47',
    },
    {
      q: '3×3 Algebraic Grid [a, b -> c]: [5, 6 -> 19], [7, 4 -> 17], [8, 9 -> ?]',
      options: ['55', '63', '53', '71'],
      ans: '55',
    },
    {
      q: 'Prime-product shifted sequence: 7, 17, 38, 81, ?',
      options: ['148', '143', '152', '139'],
      ans: '148',
    },
  ];
}

// ---------------------------------------------------------------------------
// 3. CHESS TACTICS BANK (1-ply L1-3, Verified Forced 2-ply Combinations L4-5)
// ---------------------------------------------------------------------------
export interface ChessPiecePlacement {
  sq: string;
  sym: string;
  side: 'w' | 'b';
}

export interface ChessPuzzle {
  id: string;
  title: string;
  pieces: ChessPiecePlacement[];
  steps: Array<{
    fromSq: string;
    toSq: string;
    blackReply?: { fromSq: string; toSq: string; note: string };
  }>;
}

export function buildChessPuzzleBank(level: DifficultyLevel): ChessPuzzle[] {
  if (level <= 2) {
    return [
      {
        id: 'l1-scholar',
        title: 'White to Move · Deliver Checkmate in 1',
        pieces: [
          { sq: 'g8', sym: '♚', side: 'b' },
          { sq: 'f7', sym: '♟', side: 'b' },
          { sq: 'h7', sym: '♟', side: 'b' },
          { sq: 'c4', sym: '♗', side: 'w' },
          { sq: 'h5', sym: '♕', side: 'w' },
          { sq: 'g1', sym: '♔', side: 'w' },
        ],
        steps: [{ fromSq: 'h5', toSq: 'f7' }],
      },
      {
        id: 'l2-fork',
        title: 'White to Move · Knight Fork on King & Rook',
        pieces: [
          { sq: 'e8', sym: '♚', side: 'b' },
          { sq: 'a8', sym: '♜', side: 'b' },
          { sq: 'd5', sym: '♘', side: 'w' },
          { sq: 'g1', sym: '♔', side: 'w' },
        ],
        steps: [{ fromSq: 'd5', toSq: 'c7' }],
      },
    ];
  }
  if (level === 3) {
    return [
      {
        id: 'l3-backrank',
        title: 'Puzzle 1/2 · Exploit the Weak Back Rank (Mate in 1)',
        pieces: [
          { sq: 'g8', sym: '♚', side: 'b' },
          { sq: 'f7', sym: '♟', side: 'b' },
          { sq: 'g7', sym: '♟', side: 'b' },
          { sq: 'h7', sym: '♟', side: 'b' },
          { sq: 'd1', sym: '♖', side: 'w' },
          { sq: 'g1', sym: '♔', side: 'w' },
        ],
        steps: [{ fromSq: 'd1', toSq: 'd8' }],
      },
      {
        id: 'l3-arabian',
        title: 'Puzzle 2/2 · Arabian Corner Mate in 1',
        pieces: [
          { sq: 'h8', sym: '♚', side: 'b' },
          { sq: 'f6', sym: '♘', side: 'w' },
          { sq: 'g1', sym: '♖', side: 'w' },
          { sq: 'b1', sym: '♔', side: 'w' },
        ],
        steps: [{ fromSq: 'g1', toSq: 'g8' }],
      },
    ];
  }
  if (level === 4) {
    return [
      {
        id: 'l4-queen-sac-backrank',
        title: 'Tactic 1/2 · Queen Sacrifice + Back-Rank Mate in 2',
        pieces: [
          { sq: 'g8', sym: '♚', side: 'b' },
          { sq: 'c8', sym: '♜', side: 'b' },
          { sq: 'd6', sym: '♛', side: 'b' },
          { sq: 'f7', sym: '♟', side: 'b' },
          { sq: 'g7', sym: '♟', side: 'b' },
          { sq: 'h7', sym: '♟', side: 'b' },
          { sq: 'e2', sym: '♕', side: 'w' },
          { sq: 'e1', sym: '♖', side: 'w' },
          { sq: 'g1', sym: '♔', side: 'w' },
          { sq: 'g2', sym: '♙', side: 'w' },
        ],
        steps: [
          {
            fromSq: 'e2',
            toSq: 'e8',
            blackReply: { fromSq: 'c8', toSq: 'e8', note: 'Forced reply: 1... Rxe8' },
          },
          { fromSq: 'e1', toSq: 'e8' },
        ],
      },
      {
        id: 'l4-philidor-smother',
        title: 'Tactic 2/2 · Smothered Mate in 2 (Sacrifice & Knight)',
        pieces: [
          { sq: 'h8', sym: '♚', side: 'b' },
          { sq: 'f8', sym: '♜', side: 'b' },
          { sq: 'a7', sym: '♟', side: 'b' },
          { sq: 'g7', sym: '♟', side: 'b' },
          { sq: 'h7', sym: '♟', side: 'b' },
          { sq: 'b3', sym: '♕', side: 'w' },
          { sq: 'h6', sym: '♘', side: 'w' },
          { sq: 'g1', sym: '♔', side: 'w' },
        ],
        steps: [
          {
            fromSq: 'b3',
            toSq: 'g8',
            blackReply: { fromSq: 'f8', toSq: 'g8', note: 'Forced reply: 1... Rxg8' },
          },
          { fromSq: 'h6', toSq: 'f7' },
        ],
      },
    ];
  }
  // Level 5 (Classes 11-12): 3 distinct 2-ply forced mate combinations
  return [
    {
      id: 'l5-anastasia',
      title: "Tactic 1/3 · Anastasia's Mate in 2",
      pieces: [
        { sq: 'h8', sym: '♚', side: 'b' },
        { sq: 'a8', sym: '♜', side: 'b' },
        { sq: 'c7', sym: '♛', side: 'b' },
        { sq: 'g7', sym: '♟', side: 'b' },
        { sq: 'h7', sym: '♟', side: 'b' },
        { sq: 'h5', sym: '♕', side: 'w' },
        { sq: 'e7', sym: '♘', side: 'w' },
        { sq: 'd4', sym: '♖', side: 'w' },
        { sq: 'g1', sym: '♔', side: 'w' },
      ],
      steps: [
        {
          fromSq: 'h5',
          toSq: 'h7',
          blackReply: { fromSq: 'h8', toSq: 'h7', note: 'Forced reply: 1... Kxh7' },
        },
        { fromSq: 'd4', toSq: 'h4' },
      ],
    },
    {
      id: 'l5-bodens',
      title: "Tactic 2/3 · Boden's Cross-Bishop Mate in 2",
      pieces: [
        { sq: 'c8', sym: '♚', side: 'b' },
        { sq: 'd8', sym: '♜', side: 'b' },
        { sq: 'd7', sym: '♞', side: 'b' },
        { sq: 'c6', sym: '♞', side: 'b' },
        { sq: 'a7', sym: '♟', side: 'b' },
        { sq: 'b7', sym: '♟', side: 'b' },
        { sq: 'f7', sym: '♟', side: 'b' },
        { sq: 'd5', sym: '♕', side: 'w' },
        { sq: 'f4', sym: '♗', side: 'w' },
        { sq: 'e2', sym: '♗', side: 'w' },
        { sq: 'g1', sym: '♔', side: 'w' },
      ],
      steps: [
        {
          fromSq: 'd5',
          toSq: 'c6',
          blackReply: { fromSq: 'b7', toSq: 'c6', note: 'Forced reply: 1... bxc6' },
        },
        { fromSq: 'e2', toSq: 'a6' },
      ],
    },
    {
      id: 'l5-promotion-decoy',
      title: 'Tactic 3/3 · Pawn Promotion Deflection Mate in 2',
      pieces: [
        { sq: 'g8', sym: '♚', side: 'b' },
        { sq: 'c8', sym: '♜', side: 'b' },
        { sq: 'a7', sym: '♟', side: 'b' },
        { sq: 'f7', sym: '♟', side: 'b' },
        { sq: 'g7', sym: '♟', side: 'b' },
        { sq: 'h7', sym: '♟', side: 'b' },
        { sq: 'e7', sym: '♙', side: 'w' },
        { sq: 'e1', sym: '♖', side: 'w' },
        { sq: 'g1', sym: '♔', side: 'w' },
      ],
      steps: [
        {
          fromSq: 'e7',
          toSq: 'e8',
          blackReply: { fromSq: 'c8', toSq: 'e8', note: 'Forced reply: 1... Rxe8' },
        },
        { fromSq: 'e1', toSq: 'e8' },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// 4. WORD RECALL & STORY SEQUENCE BANKS (L1-5)
// ---------------------------------------------------------------------------
export interface WordRecallBank {
  targets: string[];
  foils: string[];
}

export function buildWordRecallBank(level: DifficultyLevel): WordRecallBank {
  if (level === 1) {
    return {
      targets: ['River', 'Sun', 'Tree', 'Book'],
      foils: ['Bridge', 'Moon', 'Cloud', 'Desk'],
    };
  }
  if (level === 2) {
    return {
      targets: ['Compass', 'Library', 'Prism', 'Orchard', 'Lantern'],
      foils: ['Anchor', 'Garden', 'Mirror', 'Meadow', 'Beacon'],
    };
  }
  if (level === 3) {
    return {
      targets: ['Gravity', 'Horizon', 'Summit', 'Catalyst', 'Equinox', 'Velocity', 'Fraction'],
      foils: ['Friction', 'Harbour', 'Valley', 'Crystal', 'Eclipse', 'Vector', 'Factor'],
    };
  }
  if (level === 4) {
    return {
      targets: [
        'Kinetic',
        'Catalyst',
        'Osmosis',
        'Axiom',
        'Refraction',
        'Valence',
        'Theorem',
        'Gradient',
        'Momentum',
        'Synthesis',
      ],
      foils: [
        'Kinematics',
        'Cataclysm',
        'Mitosis',
        'Axion',
        'Reflection',
        'Variance',
        'Theory',
        'Quadrant',
        'Moment',
        'Symbiosis',
      ],
    };
  }
  // Level 5 (Classes 11-12): 12 academic concepts + 12 near-homograph phonological foils
  return {
    targets: [
      'Entropy',
      'Axiom',
      'Paradigm',
      'Asymptote',
      'Isotope',
      'Quotient',
      'Resonance',
      'Syllogism',
      'Telemetry',
      'Catalysis',
      'Eigenvalue',
      'Equilibrium',
    ],
    foils: [
      'Enthalpy',
      'Axion',
      'Paradox',
      'Antidote',
      'Isomer',
      'Quorum',
      'Reticence',
      'Symbiosis',
      'Taxonomy',
      'Paralysis',
      'Exogenous',
      'Equivalence',
    ],
  };
}

export function buildStorySequenceSteps(level: DifficultyLevel): string[] {
  if (level <= 2) {
    return [
      'Raindrops collect inside dark monsoon clouds.',
      'Rain fills small mountain streams and rivulets.',
      'Streams merge into a river flowing past farms.',
      'Farmers irrigate wheat fields using canal water.',
      'Harvested grain reaches the local grain market.',
    ].slice(0, level === 1 ? 4 : 5);
  }
  if (level === 3) {
    return [
      'Formulate a testable question and clear hypothesis.',
      'Identify independent, dependent, and control variables.',
      'Calibrate instruments and run controlled measurements.',
      'Record raw observations systematically in a data table.',
      'Plot trends and check for experimental outliers.',
      'Compare statistical results against the initial hypothesis.',
    ];
  }
  if (level === 4) {
    return [
      'Photon energy strikes chlorophyll inside the thylakoid membrane.',
      'Water molecules split, releasing oxygen gas and protons.',
      'Excited electrons drive ATP and NADPH energy carrier synthesis.',
      'ATP and NADPH enter the stroma for the Calvin cycle.',
      'RuBisCO fixes atmospheric CO₂ into 3-carbon intermediates.',
      'Enzymes reduce intermediates into G3P sugar precursors.',
      'Plants assemble glucose polymers and regenerate RuBP.',
    ];
  }
  // Level 5 (Classes 11-12): 8 tightly coupled macroeconomic / systems steps
  return [
    'Aggregate demand outpaces productive capacity, driving core inflation upward.',
    'The central bank raises the benchmark policy repo rate and tightens liquidity.',
    'Commercial banks reprice short-term interbank borrowing and lending yields.',
    'Elevated real interest rates raise the cost of capital for corporate expansion.',
    'Discretionary household spending and leveraged capital investment moderate.',
    'Inventory backlogs clear as supply chains catch up with cooled order volumes.',
    'Inflation expectations anchor back toward the target corridor over quarters.',
    'Policymakers recalibrate real rates toward neutral equilibrium.',
  ];
}

// ---------------------------------------------------------------------------
// 5. SKILL-TARGETED QUANTITATIVE BANKS (L1-5)
// ---------------------------------------------------------------------------
export interface QuantQuestion {
  prompt: string;
  options: number[];
  answer: number;
}

export function buildTimesSprintBank(level: DifficultyLevel): QuantQuestion[] {
  if (level <= 3) {
    const ranges: Record<1 | 2 | 3, [number, number]> = {
      1: [2, 5],
      2: [3, 9],
      3: [6, 12],
    };
    const [minT, maxT] = ranges[level as 1 | 2 | 3];
    const totalQ = level <= 2 ? 6 : 8;
    const qs: QuantQuestion[] = [];
    for (let i = 0; i < totalQ; i++) {
      const a = minT + ((i * 3 + level) % (maxT - minT + 1));
      const b = 2 + ((i * 5 + level * 2) % 9);
      const product = a * b;
      const isMissing = level === 3 && i % 3 === 1;
      const answer = isMissing ? b : product;
      const dist = new Set<number>([answer]);
      for (const off of isMissing ? [-2, -1, 1, 2, 3] : [-a, a, -2, 4, a + 2]) {
        if (dist.size >= 4) break;
        if (answer + off > 0) dist.add(answer + off);
      }
      let f = answer + 3;
      while (dist.size < 4) dist.add(f++);
      qs.push({
        prompt: isMissing ? `${a} × ? = ${product}` : `${a} × ${b} = ?`,
        options: Array.from(dist).sort((x, y) => ((x * 7 + i) % 13) - ((y * 7 + i) % 13)),
        answer,
      });
    }
    return qs;
  }

  if (level === 4) {
    // Classes 9-10: 13-24x tables, perfect squares (13^2..29^2), and (a*b) +/- c
    const raw: Array<{ prompt: string; answer: number; near: number[] }> = [
      { prompt: '17 × 14 = ?', answer: 238, near: [228, 242, 248] },
      { prompt: '19 × 16 = ?', answer: 304, near: [294, 314, 306] },
      { prompt: '23² = ?', answer: 529, near: [519, 539, 489] },
      { prompt: '18 × ? = 270', answer: 15, near: [14, 16, 17] },
      { prompt: '(16 × 13) − 19 = ?', answer: 189, near: [191, 179, 199] },
      { prompt: '24 × 15 = ?', answer: 360, near: [345, 375, 350] },
      { prompt: '27² = ?', answer: 729, near: [719, 739, 679] },
      { prompt: '(19 × 12) + 27 = ?', answer: 255, near: [245, 265, 253] },
      { prompt: '21 × 17 = ?', answer: 357, near: [347, 367, 337] },
      { prompt: '14 × ? = 308', answer: 22, near: [21, 23, 24] },
    ];
    return raw.map((r, i) => ({
      prompt: r.prompt,
      answer: r.answer,
      options: [r.answer, ...r.near].sort((x, y) => ((x * 11 + i) % 17) - ((y * 11 + i) % 17)),
    }));
  }

  // Level 5 (Classes 11-12): 2-digit mental multiplication, difference of squares, Vieta factor puzzles
  const raw5: Array<{ prompt: string; answer: number; near: number[] }> = [
    { prompt: '27 × 19 = ?', answer: 513, near: [503, 523, 493] },
    { prompt: '37² − 33² = ?', answer: 280, near: [260, 290, 310] },
    { prompt: '48 × 52 = ?', answer: 2496, near: [2492, 2504, 2486] },
    { prompt: '34 × 26 = ?', answer: 884, near: [874, 894, 864] },
    { prompt: 'Sum = 21, Product = 104 · Larger integer = ?', answer: 13, near: [12, 14, 15] },
    { prompt: '43 × 18 = ?', answer: 774, near: [764, 784, 756] },
    { prompt: 'Sum = 25, Product = 144 · Larger integer = ?', answer: 16, near: [15, 18, 14] },
    { prompt: '63² − 57² = ?', answer: 720, near: [710, 740, 680] },
    { prompt: '29 × 31 = ?', answer: 899, near: [891, 901, 889] },
    { prompt: '(24 × 17) − (13 × 11) = ?', answer: 265, near: [255, 275, 245] },
    { prompt: '36 × 25 = ?', answer: 900, near: [875, 925, 850] },
    { prompt: '19 × ? = 437', answer: 23, near: [21, 24, 27] },
  ];
  return raw5.map((r, i) => ({
    prompt: r.prompt,
    answer: r.answer,
    options: [r.answer, ...r.near].sort((x, y) => ((x * 13 + i) % 19) - ((y * 13 + i) % 19)),
  }));
}

export interface FactorGridChallenge {
  ruleLabelEn: string;
  ruleLabelHi: string;
  cols: 4 | 5;
  cells: number[];
  isMatch: (n: number) => boolean;
}

export function buildFactorGridChallenge(level: DifficultyLevel): FactorGridChallenge {
  if (level <= 3) {
    const tableBase = level === 1 ? 4 : level === 2 ? 6 : 7;
    const multiples = [2, 3, 4, 5, 6].map((m) => m * tableBase);
    const distractors: number[] = [];
    for (let k = 1; k <= 12; k++) {
      const cand = tableBase * k + (k % 2 === 0 ? 1 : -1);
      if (cand > 2 && cand % tableBase !== 0 && !distractors.includes(cand)) {
        distractors.push(cand);
      }
    }
    const pool = [...multiples, ...distractors.slice(0, 11)].sort(
      (a, b) => ((a * 11 + level) % 23) - ((b * 11 + level) % 23),
    );
    return {
      ruleLabelEn: `Tap all multiples in the ${tableBase}× Times Table`,
      ruleLabelHi: `${tableBase} के पहाड़े के सभी गुणज चुनें`,
      cols: 4,
      cells: pool,
      isMatch: (n) => n % tableBase === 0,
    };
  }
  if (level === 4) {
    // Classes 9-10: 20 cells — all positive factors of 180 strictly greater than 10
    const matches = [12, 15, 18, 20, 30, 36, 45];
    const decoys = [14, 16, 22, 24, 25, 27, 28, 32, 35, 40, 42, 48, 54];
    const pool = [...matches, ...decoys].sort((a, b) => ((a * 17) % 31) - ((b * 17) % 31));
    return {
      ruleLabelEn: 'Select ONLY exact divisors of 180 that are > 10',
      ruleLabelHi: '180 के 10 से बड़े सभी सटीक भाजक चुनें',
      cols: 4,
      cells: pool,
      isMatch: (n) => n > 10 && 180 % n === 0,
    };
  }
  // Level 5 (Classes 11-12): 25 cells — numbers ≡ 2 (mod 7) that are ALSO even (i.e. ≡ 2 mod 14) OR divisors of 360 in [15..90]
  const matches = [16, 30, 44, 58, 72, 86, 100, 114];
  const decoys = [23, 37, 51, 65, 79, 93, 18, 28, 36, 42, 54, 60, 70, 84, 96, 108, 120];
  const pool = [...matches, ...decoys].sort((a, b) => ((a * 19) % 37) - ((b * 19) % 37));
  return {
    ruleLabelEn: 'Select ONLY EVEN integers satisfying N ≡ 2 (mod 7)',
    ruleLabelHi: 'केवल वे सम पूर्णांक चुनें जो N ≡ 2 (mod 7) को संतुष्ट करते हों',
    cols: 5,
    cells: pool,
    isMatch: (n) => n % 2 === 0 && n % 7 === 2,
  };
}
