import type {
  BatteryCompositeScore,
  BatteryIndexKey,
  BatteryNormInfo,
  BatterySubtestKey,
  BigFiveTraitKey,
  BigFiveTraitResult,
  IqDomainKey,
  IqDomainScore,
  PsychometricBatteryRecord,
  PsychometricIqRecord,
  PsychometricPersonalityRecord,
  PsychometricRecord,
  PsychometricValidity,
  RiasecKey,
  ScoredBatteryProfile,
} from '../types';

// ============================================================================
// DETERMINISTIC PRNG & SHUFFLER
// ============================================================================

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const r = mulberry32(seed);
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================================
// 1. BIG FIVE (IPIP-50, GOLDBERG 1992) + ATTENTION CHECKS (CURRAN 2016)
// ============================================================================

export const BF_ITEMS: ReadonlyArray<readonly [string, BigFiveTraitKey, 1 | -1]> = [
  ['Am the life of the party.', 'E', 1],
  ['Feel little concern for others.', 'A', -1],
  ['Am always prepared.', 'C', 1],
  ['Get stressed out easily.', 'S', -1],
  ['Have a rich vocabulary.', 'O', 1],
  ["Don't talk a lot.", 'E', -1],
  ['Am interested in people.', 'A', 1],
  ['Leave my belongings around.', 'C', -1],
  ['Am relaxed most of the time.', 'S', 1],
  ['Have difficulty understanding abstract ideas.', 'O', -1],
  ['Feel comfortable around people.', 'E', 1],
  ['Insult people.', 'A', -1],
  ['Pay attention to details.', 'C', 1],
  ['Worry about things.', 'S', -1],
  ['Have a vivid imagination.', 'O', 1],
  ['Keep in the background.', 'E', -1],
  ["Sympathize with others' feelings.", 'A', 1],
  ['Make a mess of things.', 'C', -1],
  ['Seldom feel blue.', 'S', 1],
  ['Am not interested in abstract ideas.', 'O', -1],
  ['Start conversations.', 'E', 1],
  ["Am not interested in other people's problems.", 'A', -1],
  ['Get chores done right away.', 'C', 1],
  ['Am easily disturbed.', 'S', -1],
  ['Have excellent ideas.', 'O', 1],
  ['Have little to say.', 'E', -1],
  ['Have a soft heart.', 'A', 1],
  ['Often forget to put things back in their proper place.', 'C', -1],
  ['Get upset easily.', 'S', -1],
  ['Do not have a good imagination.', 'O', -1],
  ['Talk to a lot of different people at parties.', 'E', 1],
  ['Am not really interested in others.', 'A', -1],
  ['Like order.', 'C', 1],
  ['Change my mood a lot.', 'S', -1],
  ['Am quick to understand things.', 'O', 1],
  ["Don't like to draw attention to myself.", 'E', -1],
  ['Take time out for others.', 'A', 1],
  ['Shirk my duties.', 'C', -1],
  ['Have frequent mood swings.', 'S', -1],
  ['Use difficult words.', 'O', 1],
  ["Don't mind being the center of attention.", 'E', 1],
  ["Feel others' emotions.", 'A', 1],
  ['Follow a schedule.', 'C', 1],
  ['Get irritated easily.', 'S', -1],
  ['Spend time reflecting on things.', 'O', 1],
  ['Am quiet around strangers.', 'E', -1],
  ['Make people feel at ease.', 'A', 1],
  ['Am exacting in my work.', 'C', 1],
  ['Often feel blue.', 'S', -1],
  ['Am full of ideas.', 'O', 1],
];

export const AC_ITEMS: ReadonlyArray<{ after: number; text: string; expect: number }> = [
  {
    after: 17,
    text: 'To show you are reading carefully, choose “Very inaccurate” for this line.',
    expect: 1,
  },
  {
    after: 39,
    text: 'Please choose “Very inaccurate” here so we know you are paying attention.',
    expect: 1,
  },
];

export interface PersonalitySequenceItem {
  kind: 'bf' | 'ac' | 'ri';
  idx: number;
  text: string;
  sec: 'bf' | 'ri';
}

export function personalitySequence(): PersonalitySequenceItem[] {
  const seq: PersonalitySequenceItem[] = [];
  BF_ITEMS.forEach((it, i) => {
    seq.push({ kind: 'bf', idx: i, text: it[0], sec: 'bf' });
    AC_ITEMS.forEach((ac, k) => {
      if (ac.after === i + 1) {
        seq.push({ kind: 'ac', idx: k, text: ac.text, sec: 'bf' });
      }
    });
  });
  return seq;
}

export function fullPersonalityAndRiasecPages(): PersonalitySequenceItem[][] {
  const seq = personalitySequence().concat(
    RIASEC_ITEMS.map((it, i) => ({ kind: 'ri' as const, idx: i, text: it[0], sec: 'ri' as const })),
  );
  const pages: PersonalitySequenceItem[][] = [];
  for (let i = 0; i < 52; i += 9) pages.push(seq.slice(i, Math.min(i + 9, 52)));
  for (let i = 52; i < seq.length; i += 9) pages.push(seq.slice(i, i + 9));
  return pages;
}

export const TRAITS: Record<
  BigFiveTraitKey,
  { name: string; lo: string; mid: string; hi: string }
> = {
  E: {
    name: 'Extraversion',
    lo: 'Reserved, prefers small groups and quiet settings; recharges alone.',
    mid: 'Comfortable socially but also values time alone.',
    hi: 'Outgoing, energetic, talkative; enjoys groups and attention.',
  },
  A: {
    name: 'Agreeableness',
    lo: 'Direct, sceptical, competitive; puts the task before feelings.',
    mid: 'Generally cooperative while able to stand firm.',
    hi: 'Warm, kind, considerate; values harmony and helping others.',
  },
  C: {
    name: 'Conscientiousness',
    lo: 'Flexible and spontaneous; may find routines, deadlines and tidiness hard.',
    mid: 'Reasonably organised; plans when it matters.',
    hi: 'Organised, dependable, goal-directed; plans ahead and follows through.',
  },
  S: {
    name: 'Emotional Stability',
    lo: 'Feels stress, worry and mood changes strongly; may benefit from coping strategies.',
    mid: 'Usually steady with occasional stress.',
    hi: 'Calm, even-tempered, recovers quickly from setbacks.',
  },
  O: {
    name: 'Intellect / Imagination',
    lo: 'Practical and concrete; prefers the familiar.',
    mid: 'Balances curiosity with practicality.',
    hi: 'Curious, imaginative, enjoys ideas, reading and abstract thinking.',
  },
};

export const TRAIT_ORDER: BigFiveTraitKey[] = ['O', 'C', 'E', 'A', 'S'];

// ============================================================================
// 2. RIASEC CAREER INTERESTS (HOLLAND 1997, O*NET STYLE, 36 ITEMS)
// ============================================================================

export const RIASEC_ITEMS: ReadonlyArray<readonly [string, RiasecKey]> = [
  ['Repair a bicycle or motorbike', 'R'],
  ['Do a science experiment in a lab', 'I'],
  ['Draw, paint or design something', 'A'],
  ['Teach or tutor younger students', 'S'],
  ['Lead a team or a school club', 'E'],
  ['Keep records and accounts neatly', 'C'],
  ['Build or make things with wood or tools', 'R'],
  ['Solve challenging maths puzzles', 'I'],
  ['Write stories, poems or articles', 'A'],
  ['Help people work through their problems', 'S'],
  ['Start a small business of my own', 'E'],
  ['Organise files, data or a library', 'C'],
  ['Work outdoors on a farm, garden or field site', 'R'],
  ['Learn how the human body works', 'I'],
  ['Act in a play or perform on stage', 'A'],
  ['Look after people who are sick or injured', 'S'],
  ['Convince people to agree with my ideas', 'E'],
  ['Work with numbers in a spreadsheet', 'C'],
  ['Operate machines or equipment', 'R'],
  ['Find out why something happens by researching it', 'I'],
  ['Play a musical instrument or sing', 'A'],
  ['Volunteer for community service', 'S'],
  ['Sell a product or service', 'E'],
  ['Follow clear rules and procedures to finish a job', 'C'],
  ['Assemble electronic or robotics kits', 'R'],
  ['Read about space, planets and the universe', 'I'],
  ['Design clothes, posters, apps or websites', 'A'],
  ['Coach a sports team', 'S'],
  ['Organise and manage an event', 'E'],
  ['Check documents carefully for errors', 'C'],
  ['Drive, fix or maintain vehicles', 'R'],
  ['Analyse data to find patterns', 'I'],
  ['Take creative photos or make videos', 'A'],
  ['Listen to friends and give them advice', 'S'],
  ['Debate or speak in public', 'E'],
  ['Plan schedules and budgets', 'C'],
];

export const RIASEC: Record<
  RiasecKey,
  { name: string; tag: string; desc: string; careers: string }
> = {
  R: {
    name: 'Realistic',
    tag: 'Doers',
    desc: 'Hands-on work with tools, machines, plants or animals.',
    careers:
      'Mechanical / civil / automobile engineer, electrician, pilot, agriculture scientist, armed forces, physiotherapist, chef',
  },
  I: {
    name: 'Investigative',
    tag: 'Thinkers',
    desc: 'Observing, analysing and solving problems with ideas and evidence.',
    careers:
      'Doctor, research scientist, data scientist, software engineer, pharmacist, economist, forensic expert',
  },
  A: {
    name: 'Artistic',
    tag: 'Creators',
    desc: 'Self-expression, imagination and working without rigid rules.',
    careers:
      'Designer (graphic, fashion, UX), architect, writer / journalist, musician, animator, film-maker',
  },
  S: {
    name: 'Social',
    tag: 'Helpers',
    desc: 'Teaching, caring for and helping other people.',
    careers:
      'Teacher, counsellor / psychologist, nurse, social worker, HR professional, occupational therapist',
  },
  E: {
    name: 'Enterprising',
    tag: 'Persuaders',
    desc: 'Leading, persuading, selling and taking initiative.',
    careers:
      'Entrepreneur, manager, lawyer, marketing / sales, civil services, politician, hotel management',
  },
  C: {
    name: 'Conventional',
    tag: 'Organisers',
    desc: 'Working with data, records and clear procedures accurately.',
    careers:
      'Chartered accountant, banker, company secretary, auditor, actuary, administrator, logistics planner',
  },
};

export const RIASEC_ORDER: RiasecKey[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export const LIKERT_PERSONALITY_ANCHORS = [
  'Very inaccurate',
  'Moderately inaccurate',
  'Neither accurate nor inaccurate',
  'Moderately accurate',
  'Very accurate',
] as const;

export const LIKERT_INTEREST_ANCHORS = [
  'Strongly dislike',
  'Dislike',
  'Unsure',
  'Like',
  'Strongly like',
] as const;

export function scorePersonality(
  bfResp: number[],
  acResp: number[],
  riResp: number[],
  pageTimes?: number[],
): {
  traits: Record<BigFiveTraitKey, BigFiveTraitResult>;
  riasec: Record<RiasecKey, number>;
  code: string;
  differentiation: number;
  validity: PsychometricValidity;
} {
  const raw: Record<BigFiveTraitKey, number[]> = { E: [], A: [], C: [], S: [], O: [] };
  BF_ITEMS.forEach((it, i) => {
    const r = bfResp[i];
    if (r) raw[it[1]].push(it[2] > 0 ? r : 6 - r);
  });

  const traits = {} as Record<BigFiveTraitKey, BigFiveTraitResult>;
  for (const t of TRAIT_ORDER) {
    const a = raw[t];
    const m = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 3;
    traits[t] = { mean: +m.toFixed(3), pomp: Math.round(((m - 1) / 4) * 100), n: a.length };
  }

  const ri = {} as Record<RiasecKey, number>;
  RIASEC_ORDER.forEach((k) => {
    ri[k] = 0;
  });
  RIASEC_ITEMS.forEach((it, i) => {
    ri[it[1]] += riResp[i] || 0;
  });

  const sorted = RIASEC_ORDER.slice().sort(
    (a, b) => ri[b] - ri[a] || RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b),
  );
  const code = sorted.slice(0, 3).join('');
  const differentiation = ri[sorted[0]] - ri[sorted[5]];

  // Curran (2016) validity / careless-responding indices
  const all = [...bfResp, ...riResp];
  let longest = 1;
  let cur = 1;
  for (let i = 1; i < all.length; i++) {
    if (all[i] === all[i - 1]) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 1;
    }
  }
  const acFail = AC_ITEMS.filter((ac, k) => acResp[k] !== ac.expect).length;
  const mean = all.reduce((a, b) => a + b, 0) / Math.max(1, all.length);
  const sd = Math.sqrt(all.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, all.length));
  const totalSec = (pageTimes || []).reduce((a, b) => a + b, 0);
  const secPerItem = totalSec / (all.length + AC_ITEMS.length);

  const flags: string[] = [];
  if (acFail > 0) flags.push(`${acFail} of 2 attention checks missed`);
  if (longest >= 12) flags.push(`${longest} identical answers in a row`);
  if (sd < 0.6) flags.push('Very little variation in answers');
  if (totalSec > 0 && secPerItem < 1.8) {
    flags.push(`Very fast responding (${secPerItem.toFixed(1)} s per item)`);
  }

  return {
    traits,
    riasec: ri,
    code,
    differentiation,
    validity: {
      acFail,
      longest,
      sd: +sd.toFixed(2),
      secPerItem: +secPerItem.toFixed(1),
      flags,
      valid: flags.length === 0,
    },
  };
}

// ============================================================================
// 3. REASONING TEST (40 ITEMS, 4 CHC DOMAINS, 3PL IRT EAP)
// ============================================================================

export type MatrixShape = 'circle' | 'square' | 'triangle' | 'arrow';
export type MatrixFill = 'solid' | 'hollow' | 'striped';

export interface MatrixCell {
  shape: MatrixShape;
  fill: MatrixFill;
  n: number;
  rot: number;
}

export interface MatrixDef {
  b: number;
  f: (r: number, c: number) => MatrixCell;
}

const SH: MatrixShape[] = ['circle', 'square', 'triangle'];
const FI: MatrixFill[] = ['solid', 'hollow', 'striped'];

export const MATRIX_DEFS: MatrixDef[] = [
  { b: -2.0, f: (r, c) => ({ shape: SH[r], fill: 'solid', n: c + 1, rot: 0 }) },
  { b: -1.5, f: (r, c) => ({ shape: SH[c], fill: FI[r], n: 1, rot: 0 }) },
  { b: -1.0, f: (r, c) => ({ shape: SH[(r + c) % 3], fill: FI[r], n: 1, rot: 0 }) },
  { b: -0.5, f: (r, c) => ({ shape: 'arrow', fill: 'solid', n: 1, rot: ((r * 3 + c) * 45) % 360 }) },
  { b: 0.0, f: (r, c) => ({ shape: SH[(r + c) % 3], fill: FI[c], n: ((r + 2 * c) % 3) + 1, rot: 0 }) },
  { b: 0.4, f: (r, c) => ({ shape: SH[r], fill: 'hollow', n: [[1, 1, 2], [1, 2, 3], [2, 2, 4]][r][c], rot: 0 }) },
  { b: 0.8, f: (r, c) => ({ shape: SH[(r + c) % 3], fill: FI[(r + 2 * c) % 3], n: c + 1, rot: 0 }) },
  { b: 1.2, f: (r, c) => ({ shape: 'arrow', fill: 'hollow', n: r + 1, rot: (c * 90 + r * 45) % 360 }) },
  { b: 1.6, f: (r, c) => ({ shape: SH[(r + c) % 3], fill: 'solid', n: [[4, 1, 3], [3, 2, 1], [4, 2, 2]][r][c], rot: 0 }) },
  { b: 2.0, f: (r, c) => ({ shape: SH[(r + 2 * c) % 3], fill: FI[(r + c) % 3], n: [[1, 2, 3], [2, 1, 3], [1, 1, 2]][r][c], rot: 0 }) },
];

export function cellKey(a: MatrixCell): string {
  return [a.shape, a.fill, a.n, a.rot].join('|');
}

export function matrixOptions(def: MatrixDef, seed: number): { opts: MatrixCell[]; answer: number } {
  const ans = def.f(2, 2);
  const cands: MatrixCell[] = [];
  const push = (o: MatrixCell) => {
    if (
      o.n >= 1 &&
      o.n <= 4 &&
      cellKey(o) !== cellKey(ans) &&
      !cands.some((x) => cellKey(x) === cellKey(o))
    ) {
      cands.push(o);
    }
  };
  push(def.f(2, 1));
  if (ans.shape === 'arrow') {
    [45, 90, 180, 270, 315, 135].forEach((d) => push({ ...ans, rot: (ans.rot + d) % 360 }));
    push({ ...ans, n: ans.n + 1 });
  } else {
    SH.filter((s) => s !== ans.shape).forEach((s) => push({ ...ans, shape: s }));
  }
  FI.filter((f) => f !== ans.fill).forEach((f) => push({ ...ans, fill: f }));
  push({ ...ans, n: ans.n + 1 });
  push({ ...ans, n: ans.n - 1 });
  const pick = [cands[0], ...seededShuffle(cands.slice(1), seed).slice(0, 4)];
  const opts = seededShuffle([ans, ...pick], seed * 7 + 3);
  return { opts, answer: opts.findIndex((o) => cellKey(o) === cellKey(ans)) };
}

export const SERIES_ITEMS = [
  { b: -2.0, q: '2, 4, 6, 8, ?', o: ['9', '10', '11', '12', '14'], a: 1 },
  { b: -1.5, q: '3, 6, 12, 24, ?', o: ['30', '36', '48', '42', '27'], a: 2 },
  { b: -1.0, q: 'A, C, E, G, ?', o: ['H', 'J', 'I', 'K', 'F'], a: 2 },
  { b: -0.5, q: '1, 4, 9, 16, 25, ?', o: ['30', '36', '34', '49', '32'], a: 1 },
  { b: 0.0, q: '2, 3, 5, 8, 12, ?', o: ['16', '17', '18', '20', '15'], a: 1 },
  { b: 0.4, q: 'Z, X, U, Q, ?', o: ['M', 'L', 'K', 'N', 'O'], a: 1 },
  { b: 0.8, q: '3, 5, 9, 17, 33, ?', o: ['49', '64', '65', '66', '57'], a: 2 },
  { b: 1.1, q: '2, 6, 3, 9, 6, 18, ?', o: ['15', '12', '54', '21', '9'], a: 0 },
  { b: 1.5, q: 'B2, D4, G7, K11, ?', o: ['O15', 'P16', 'N14', 'P15', 'Q17'], a: 1 },
  { b: 1.9, q: '4, 9, 25, 49, 121, ?', o: ['144', '169', '196', '225', '143'], a: 1 },
] as const;

export const VERBAL_ITEMS = [
  { b: -2.0, q: 'Hot is to cold as up is to …', o: ['high', 'down', 'sky', 'over', 'top'], a: 1 },
  { b: -1.5, q: 'Which word does not belong with the others?', o: ['apple', 'mango', 'carrot', 'banana', 'grape'], a: 2 },
  { b: -1.0, q: 'Book is to author as painting is to …', o: ['canvas', 'museum', 'artist', 'colour', 'frame'], a: 2 },
  { b: -0.8, q: 'Which one does not belong with the others?', o: ['Mercury', 'Venus', 'Moon', 'Mars', 'Jupiter'], a: 2 },
  { b: -0.6, q: 'Doctor is to patient as lawyer is to …', o: ['judge', 'court', 'client', 'law', 'case'], a: 2 },
  { b: -0.3, q: 'Choose the word closest in meaning to CANDID.', o: ['careful', 'frank', 'sweet', 'hidden', 'bright'], a: 1 },
  { b: 0.0, q: 'Which word does not belong with the others?', o: ['anxious', 'apprehensive', 'uneasy', 'serene', 'nervous'], a: 3 },
  { b: 0.2, q: 'Ravi is taller than Amit. Amit is taller than Sunil. Sunil is taller than Joy. Who is the second shortest?', o: ['Ravi', 'Amit', 'Sunil', 'Joy', 'Cannot be determined'], a: 2 },
  { b: 0.4, q: 'In a code, CAT is written as DBU. How is DOG written in the same code?', o: ['EPH', 'EPG', 'CNF', 'DPH', 'FQI'], a: 0 },
  { b: 0.8, q: 'All roses are flowers. Some flowers fade quickly. Which statement must be true?', o: ['Some roses fade quickly', 'All roses fade quickly', 'No roses fade quickly', 'Some flowers are roses that fade', 'None of these must be true'], a: 4 },
  { b: 0.9, q: 'Choose the word most nearly OPPOSITE to EPHEMERAL.', o: ['permanent', 'fragile', 'ethereal', 'sudden', 'visible'], a: 0 },
  { b: 1.6, q: 'Some A are B. No B are C. Which statement must be true?', o: ['Some A are C', 'No A are C', 'Some A are not C', 'All C are A', 'Some C are B'], a: 2 },
] as const;

export type PolyCell = [number, number];

export interface RotationDef {
  b: number;
  cells: PolyCell[];
  k: number;
}

export const ROT_DEFS: RotationDef[] = [
  { b: -1.2, cells: [[0, 0], [0, 1], [0, 2], [1, 2]], k: 2 },
  { b: -0.6, cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], k: 1 },
  { b: -0.2, cells: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], k: 1 },
  { b: 0.2, cells: [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], k: 3 },
  { b: 0.6, cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], k: 2 },
  { b: 1.0, cells: [[0, 1], [1, 0], [1, 1], [1, 2], [1, 3]], k: 1 },
  { b: 1.4, cells: [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [1, 2]], k: 3 },
  { b: 1.8, cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2], [1, 3]], k: 1 },
];

export function normCells(c: PolyCell[]): PolyCell[] {
  const mx = Math.min(...c.map((p) => p[0]));
  const my = Math.min(...c.map((p) => p[1]));
  return c
    .map(([x, y]): PolyCell => [x - mx, y - my])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

export function rot90(c: PolyCell[]): PolyCell[] {
  return normCells(c.map(([x, y]): PolyCell => [-y, x]));
}

export function rotK(c: PolyCell[], k: number): PolyCell[] {
  let r = normCells(c);
  for (let i = 0; i < k; i++) r = rot90(r);
  return r;
}

export function mirrorCells(c: PolyCell[]): PolyCell[] {
  return normCells(c.map(([x, y]): PolyCell => [-x, y]));
}

export function cellsKey(c: PolyCell[]): string {
  return JSON.stringify(normCells(c));
}

export function isChiral(c: PolyCell[]): boolean {
  const m = cellsKey(mirrorCells(c));
  for (let k = 0; k < 4; k++) {
    if (cellsKey(rotK(c, k)) === m) return false;
  }
  return true;
}

export function rotationOptions(
  def: RotationDef,
  seed: number,
): { opts: PolyCell[][]; answer: number } {
  const correct = rotK(def.cells, def.k);
  const m = mirrorCells(def.cells);
  const mir: PolyCell[][] = [];
  seededShuffle([0, 1, 2, 3], seed).forEach((k) => {
    const o = rotK(m, k);
    if (!mir.some((x) => cellsKey(x) === cellsKey(o))) mir.push(o);
  });
  const opts = seededShuffle([correct, ...mir.slice(0, 3)], seed * 11 + 5);
  return { opts, answer: opts.findIndex((o) => cellsKey(o) === cellsKey(correct)) };
}

export type IqBankItem =
  | {
      id: string;
      dom: 'Gf-M';
      domName: string;
      type: 'matrix';
      def: number;
      b: number;
      opts: MatrixCell[];
      a: number;
      k: number;
    }
  | {
      id: string;
      dom: 'Gf-S' | 'Gc';
      domName: string;
      type: 'text';
      q: string;
      b: number;
      opts: readonly string[];
      a: number;
      k: number;
    }
  | {
      id: string;
      dom: 'Gv';
      domName: string;
      type: 'rot';
      cells: PolyCell[];
      b: number;
      opts: PolyCell[][];
      a: number;
      k: number;
    };

export function buildIQBank(): IqBankItem[] {
  const M: IqBankItem[] = MATRIX_DEFS.map((d, i) => {
    const o = matrixOptions(d, 101 + i);
    return {
      id: '',
      dom: 'Gf-M',
      domName: 'Matrix reasoning',
      type: 'matrix',
      def: i,
      b: d.b,
      opts: o.opts,
      a: o.answer,
      k: o.opts.length,
    };
  });
  const S: IqBankItem[] = SERIES_ITEMS.map((d) => ({
    id: '',
    dom: 'Gf-S',
    domName: 'Number & letter series',
    type: 'text',
    q: d.q,
    b: d.b,
    opts: d.o,
    a: d.a,
    k: d.o.length,
  }));
  const V: IqBankItem[] = VERBAL_ITEMS.map((d) => ({
    id: '',
    dom: 'Gc',
    domName: 'Verbal reasoning',
    type: 'text',
    q: d.q,
    b: d.b,
    opts: d.o,
    a: d.a,
    k: d.o.length,
  }));
  const R: IqBankItem[] = ROT_DEFS.map((d, i) => {
    const o = rotationOptions(d, 301 + i);
    return {
      id: '',
      dom: 'Gv',
      domName: 'Spatial rotation',
      type: 'rot',
      cells: normCells(d.cells),
      b: d.b,
      opts: o.opts,
      a: o.answer,
      k: o.opts.length,
    };
  });

  const bank: IqBankItem[] = [];
  const pools = [M, S, V, R];
  const maxLen = Math.max(...pools.map((p) => p.length));
  for (let i = 0; i < maxLen; i++) {
    pools.forEach((p) => {
      if (p[i]) bank.push(p[i]);
    });
  }
  bank.sort((x, y) => x.b - y.b);
  bank.forEach((it, i) => {
    it.id = `Q${i + 1}`;
  });
  return bank;
}

export const IQ_BANK: IqBankItem[] = buildIQBank();
export const IQ_TIME_MIN = 35;

// 3PL IRT EAP ability estimation (Embretson & Reise, 2000)
const IRT_A = 1.2;
const IRT_D = 1.7;

export function p3(theta: number, b: number, c: number): number {
  return c + (1 - c) / (1 + Math.exp(-IRT_D * IRT_A * (theta - b)));
}

export function eap(correct: number[], bank: IqBankItem[] = IQ_BANK): { theta: number; se: number } {
  let num = 0;
  let den = 0;
  let num2 = 0;
  for (let t = -4; t <= 4.0001; t += 0.05) {
    let lp = (-t * t) / 2;
    bank.forEach((it, i) => {
      const p = p3(t, it.b, 1 / it.k);
      lp += correct[i] ? Math.log(p) : Math.log(1 - p);
    });
    const w = Math.exp(lp);
    num += t * w;
    num2 += t * t * w;
    den += w;
  }
  const th = num / den;
  const sd = Math.sqrt(Math.max(num2 / den - th * th, 1e-6));
  return { theta: th, se: sd };
}

export function iqBand(iq: number): string {
  if (iq >= 130) return 'Very high';
  if (iq >= 120) return 'High';
  if (iq >= 110) return 'High average';
  if (iq >= 90) return 'Average';
  if (iq >= 80) return 'Low average';
  if (iq >= 70) return 'Low';
  return 'Very low';
}

export function scoreIQ(
  choices: number[],
  times?: number[],
): {
  correct: number[];
  raw: number;
  theta: number;
  se: number;
  iq: number;
  ci: number;
  band: string;
  domains: Record<IqDomainKey, IqDomainScore>;
  answered: number;
  guttman: number;
  validity: PsychometricValidity;
} {
  const correct: number[] = IQ_BANK.map((it, i) => (choices[i] === it.a ? 1 : 0));
  const raw = correct.reduce((a, b) => a + b, 0);
  const { theta, se } = eap(correct, IQ_BANK);
  const iq = Math.round(100 + 15 * theta);
  const ci = Math.round(1.645 * 15 * se);

  const domains = {} as Record<IqDomainKey, IqDomainScore>;
  IQ_BANK.forEach((it, i) => {
    domains[it.dom] = domains[it.dom] || { name: it.domName, n: 0, c: 0 };
    domains[it.dom].n++;
    domains[it.dom].c += correct[i];
  });

  const answered = choices.filter((x) => x !== -1 && x != null).length;
  const flags: string[] = [];
  const fast = (times || []).filter((t, i) => choices[i] !== -1 && t > 0 && t < 2.5).length;
  if (fast >= 8) flags.push(`${fast} answers given in under 2.5 seconds`);
  if (answered < IQ_BANK.length * 0.6) {
    flags.push(`Only ${answered} of ${IQ_BANK.length} items answered`);
  }

  let guttman = 0;
  for (let i = 0; i < IQ_BANK.length; i++) {
    for (let j = i + 1; j < IQ_BANK.length; j++) {
      if (!correct[i] && correct[j] && IQ_BANK[j].b - IQ_BANK[i].b > 1.5) guttman++;
    }
  }
  if (guttman > 25) {
    flags.push('Unusual answer pattern (many easy items wrong, hard items right)');
  }

  return {
    correct,
    raw,
    theta: +theta.toFixed(3),
    se: +se.toFixed(3),
    iq,
    ci,
    band: iqBand(iq),
    domains,
    answered,
    guttman,
    validity: { flags, valid: flags.length === 0 },
  };
}

// ============================================================================
// 4. COGNITIVE PROFILE BATTERY (WECHSLER-STYLE 10 SUBTESTS, FSIQ + 5 INDICES)
// ============================================================================

export interface BatterySubtestDefinition {
  key: BatterySubtestKey;
  name: string;
  idx: BatteryIndexKey;
  core: boolean;
  mins: number;
  desc: string;
}

export const BAT_SUBS: BatterySubtestDefinition[] = [
  { key: 'BD', name: 'Block Patterns', idx: 'VSI', core: true, mins: 6, desc: 'Copy red-and-white patterns with blocks. Faster correct copies earn bonus points.' },
  { key: 'SI', name: 'Similarities', idx: 'VCI', core: true, mins: 4, desc: 'Choose the best way in which two things are alike.' },
  { key: 'MR', name: 'Matrix Reasoning', idx: 'FRI', core: true, mins: 6, desc: 'Find the missing piece that completes a visual pattern.' },
  { key: 'DS', name: 'Digit Span', idx: 'WMI', core: true, mins: 7, desc: 'Remember strings of numbers forwards, backwards and in order.' },
  { key: 'CD', name: 'Symbol Coding', idx: 'PSI', core: true, mins: 3, desc: 'Use a key to match numbers to symbols as fast as you can (90 seconds).' },
  { key: 'VC', name: 'Vocabulary', idx: 'VCI', core: true, mins: 3, desc: 'Choose the word that means the same.' },
  { key: 'FW', name: 'Balance Puzzles', idx: 'FRI', core: true, mins: 6, desc: 'Work out what balances a scale from the scales shown.' },
  { key: 'SR', name: 'Shape Rotation', idx: 'VSI', core: false, mins: 4, desc: 'Find the same shape turned around, not flipped.' },
  { key: 'SP', name: 'Spatial Span', idx: 'WMI', core: false, mins: 4, desc: 'Remember the order in which blocks light up.' },
  { key: 'SS', name: 'Symbol Search', idx: 'PSI', core: false, mins: 3, desc: 'Decide quickly whether a target symbol appears in a row (90 seconds).' },
];

export const BAT_INDEX: Record<BatteryIndexKey, { name: string; subs: [BatterySubtestKey, BatterySubtestKey] }> = {
  VCI: { name: 'Verbal Comprehension', subs: ['SI', 'VC'] },
  VSI: { name: 'Visual Spatial', subs: ['BD', 'SR'] },
  FRI: { name: 'Fluid Reasoning', subs: ['MR', 'FW'] },
  WMI: { name: 'Working Memory', subs: ['DS', 'SP'] },
  PSI: { name: 'Processing Speed', subs: ['CD', 'SS'] },
};

export const BAT_INDEX_ORDER: BatteryIndexKey[] = ['VCI', 'VSI', 'FRI', 'WMI', 'PSI'];
export const FSIQ_SUBS: BatterySubtestKey[] = ['BD', 'SI', 'MR', 'DS', 'CD', 'VC', 'FW'];
export const GAI_SUBS: BatterySubtestKey[] = ['SI', 'VC', 'BD', 'MR', 'FW'];
export const CPI_SUBS: BatterySubtestKey[] = ['DS', 'SP', 'CD', 'SS'];

// Similarities: 2 = abstract category, 1 = concrete/partial, 0 = wrong
export const SIM_ITEMS: ReadonlyArray<
  readonly [string, string, readonly [string, number], readonly [string, number], readonly [string, number], readonly [string, number]]
> = [
  ['CAT', 'DOG', ['Both are animals', 2], ['Both have tails', 1], ['Both chase mice', 0], ['Both are brown', 0]],
  ['SHIRT', 'TROUSERS', ['Both are clothing', 2], ['Both are made of cloth', 1], ['Both have buttons', 0], ['Both are worn only in winter', 0]],
  ['PIANO', 'FLUTE', ['Both are musical instruments', 2], ['Both make sounds', 1], ['Both have keys', 0], ['Both are played with the mouth', 0]],
  ['RIVER', 'OCEAN', ['Both are bodies of water', 2], ['Both have fish in them', 1], ['Both are salty', 0], ['Both flow downhill', 0]],
  ['APPLE', 'POTATO', ['Both are plant parts we eat', 2], ['Both are roundish', 1], ['Both are fruits', 0], ['Both are red', 0]],
  ['ELBOW', 'KNEE', ['Both are joints', 2], ['Both bend', 1], ['Both are on the arm', 0], ['Both can get scraped', 0]],
  ['ICE', 'STEAM', ['Both are forms of water', 2], ['Both depend on temperature', 1], ['Both are cold', 0], ['Both are gases', 0]],
  ['HOUR', 'KILOMETRE', ['Both are units of measurement', 2], ['Both come up when travelling', 1], ['Both measure time', 0], ['Both are long', 0]],
  ['FLY', 'TREE', ['Both are living things', 2], ['Both are found outdoors', 1], ['Both have wings', 0], ['Both grow leaves', 0]],
  ['POEM', 'STATUE', ['Both are works of art', 2], ['Both are made by people', 1], ['Both are made of stone', 0], ['Both are old', 0]],
  ['EGG', 'SEED', ['Both are the start of new life', 2], ['Both have a covering', 1], ['Both are eaten at breakfast', 0], ['Both are white', 0]],
  ['FIRST', 'LAST', ['Both are positions in an order', 2], ['Both are about numbers', 1], ['Both mean the beginning', 0], ['Both are prizes', 0]],
  ['PRAISE', 'PUNISHMENT', ['Both are responses that shape behaviour', 2], ['Both are things parents do', 1], ['Both make people happy', 0], ['Both are punishments', 0]],
  ['FREEDOM', 'JUSTICE', ['Both are ideals a society aims for', 2], ['Both appear in the Constitution', 1], ['Both are laws', 0], ['Both mean doing whatever you like', 0]],
];

export const VOC_ITEMS: ReadonlyArray<readonly [string, readonly string[], number]> = [
  ['BIG', ['small', 'large', 'heavy', 'tall'], 1],
  ['RAPID', ['quick', 'loud', 'steady', 'sharp'], 0],
  ['ANCIENT', ['broken', 'very old', 'famous', 'huge'], 1],
  ['FRAGILE', ['easily broken', 'very light', 'rare', 'colourful'], 0],
  ['GENEROUS', ['clever', 'giving', 'wealthy', 'polite'], 1],
  ['CONCEAL', ['reveal', 'hide', 'collect', 'destroy'], 1],
  ['RELUCTANT', ['unwilling', 'angry', 'tired', 'eager'], 0],
  ['ABUNDANT', ['missing', 'plentiful', 'valuable', 'strange'], 1],
  ['DILIGENT', ['lazy', 'careful and hard-working', 'intelligent', 'punctual'], 1],
  ['OBSOLETE', ['out of date', 'obvious', 'expensive', 'hidden'], 0],
  ['METICULOUS', ['very precise', 'nervous', 'generous', 'quick'], 0],
  ['AMBIGUOUS', ['two-handed', 'having more than one meaning', 'ambitious', 'enormous'], 1],
  ['GREGARIOUS', ['greedy', 'sociable', 'serious', 'angry'], 1],
  ['UBIQUITOUS', ['found everywhere', 'unique', 'very rare', 'uncertain'], 0],
  ['LACONIC', ['using few words', 'lazy', 'tearful', 'excessive'], 0],
  ['SANGUINE', ['bloody', 'optimistic', 'sad', 'sensible'], 1],
];

export interface BalancePuzzleItem {
  eq: ReadonlyArray<readonly [string, string]>;
  q: string;
  opts: readonly string[];
  a: number;
}

export const FW_ITEMS: BalancePuzzleItem[] = [
  { eq: [['C', 'SS']], q: 'CC', opts: ['SS', 'SSS', 'SSSS', 'SSSSS'], a: 2 },
  { eq: [['S', 'TTT']], q: 'SS', opts: ['TTTTT', 'TTTTTT', 'TTT', 'TTTTTTTTT'], a: 1 },
  { eq: [['C', 'SS'], ['S', 'TT']], q: 'C', opts: ['TT', 'TTTT', 'TTT', 'ST'], a: 1 },
  { eq: [['CS', 'TTTTT'], ['S', 'TT']], q: 'C', opts: ['TT', 'TTT', 'TTTT', 'S'], a: 1 },
  { eq: [['DD', 'C'], ['C', 'SSS']], q: 'SSSSSS', opts: ['DD', 'DDD', 'DDDD', 'DDDDDD'], a: 2 },
  { eq: [['C', 'ST'], ['S', 'TT']], q: 'CC', opts: ['TTTT', 'TTTTT', 'TTTTTT', 'STT'], a: 2 },
  { eq: [['R', 'CC'], ['C', 'SSS'], ['S', 'TT']], q: 'R', opts: ['SSSS', 'SSSSS', 'SSSSSS', 'SSSSSSSS'], a: 2 },
  { eq: [['CS', 'DDD'], ['C', 'SS']], q: 'S', opts: ['D', 'DD', 'DDD', 'C'], a: 0 },
  { eq: [['CC', 'SSS'], ['SS', 'TTTT']], q: 'CCCC', opts: ['TTTTTTTT', 'TTTTTTTTTT', 'TTTTTTTTTTTT', 'TTTTTT'], a: 2 },
  { eq: [['RT', 'CC'], ['C', 'TTT']], q: 'R', opts: ['TTTT', 'TTTTT', 'TTTTTT', 'TTTTTTT'], a: 1 },
  { eq: [['CS', 'TTTT'], ['C', 'STT']], q: 'S', opts: ['T', 'TT', 'TTT', 'C'], a: 0 },
  { eq: [['CCS', 'R'], ['SS', 'C']], q: 'R', opts: ['SSSS', 'SSSSS', 'SSSSSS', 'SSS'], a: 1 },
  { eq: [['DD', 'CT'], ['C', 'TTT'], ['S', 'DT']], q: 'S', opts: ['TT', 'TTT', 'TTTT', 'TTTTT'], a: 1 },
  { eq: [['R', 'CD'], ['CDD', 'SSSS'], ['D', 'S']], q: 'R', opts: ['SS', 'SSS', 'SSSS', 'SSSSS'], a: 1 },
];

// Block patterns: 0 white, 1 red, 2 red top-left, 3 top-right, 4 bottom-right, 5 bottom-left
export const BD_ITEMS: number[][][] = [
  [[1, 0], [0, 1]],
  [[4, 5], [3, 2]],
  [[1, 2], [4, 1]],
  [[2, 3], [5, 4]],
  [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
  [[4, 1, 5], [1, 1, 1], [3, 1, 2]],
  [[2, 0, 3], [0, 1, 0], [5, 0, 4]],
  [[1, 4, 0], [4, 0, 2], [0, 2, 1]],
  [[3, 2, 3], [4, 5, 4], [3, 2, 3]],
  [[2, 1, 3], [0, 4, 5], [5, 3, 1]],
];

export const BD_PRACTICE: number[][] = [[1, 0], [0, 0]];

export function bdLimit(p: number[][]): number {
  return p.length === 2 ? 60 : 120;
}

export function bdScore(p: number[][], sec: number | null): number {
  const lim = bdLimit(p);
  if (sec == null || sec > lim) return 0;
  const base = p.length === 2 ? 2 : 4;
  const maxB = p.length === 2 ? 2 : 3;
  return base + Math.max(0, Math.floor(maxB * (1 - sec / lim) + 0.0001));
}

export const BD_MAX = BD_ITEMS.reduce((a, p) => a + (p.length === 2 ? 4 : 7), 0);

// Span sequences (fixed seeds so every participant sees identical items)
export function spanSeqs(seed: number, from: number, to: number, pool: number[]): number[][] {
  const r = mulberry32(seed);
  const out: number[][] = [];
  for (let L = from; L <= to; L++) {
    for (let t = 0; t < 2; t++) {
      const s: number[] = [];
      while (s.length < L) {
        const d = pool[Math.floor(r() * pool.length)];
        if (!s.includes(d)) s.push(d);
      }
      out.push(s);
    }
  }
  return out;
}

export const DS_PARTS: ReadonlyArray<{ key: 'F' | 'B' | 'S'; name: string; seqs: number[][] }> = [
  { key: 'F', name: 'Forward', seqs: spanSeqs(11, 2, 9, [1, 2, 3, 4, 5, 6, 7, 8, 9]) },
  { key: 'B', name: 'Backward', seqs: spanSeqs(23, 2, 8, [1, 2, 3, 4, 5, 6, 7, 8, 9]) },
  { key: 'S', name: 'Sequencing', seqs: spanSeqs(37, 2, 9, [1, 2, 3, 4, 5, 6, 7, 8, 9]) },
];

export function dsExpected(part: 'F' | 'B' | 'S', seq: number[]): string {
  if (part === 'F') return seq.join('');
  if (part === 'B') return seq.slice().reverse().join('');
  return seq.slice().sort((a, b) => a - b).join('');
}

export const SP_SEQS: number[][] = spanSeqs(53, 2, 9, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
export const SP_POS: ReadonlyArray<readonly [number, number]> = [
  [10, 62],
  [28, 14],
  [48, 46],
  [74, 10],
  [86, 56],
  [62, 80],
  [32, 84],
  [8, 24],
  [66, 36],
];

export const CD_KEY = [0, 7, 14, 21, 2, 9, 16, 23, 4] as const;
export const CD_BTN_ORDER = [4, 0, 7, 2, 8, 5, 1, 6, 3] as const;

export const CD_SEQ: number[] = (() => {
  const r = mulberry32(71);
  const s: number[] = [];
  while (s.length < 250) {
    const d = 1 + Math.floor(r() * 9);
    if (d !== s[s.length - 1]) s.push(d);
  }
  return s;
})();

export interface SymbolSearchTrial {
  t: [number, number];
  g: number[];
  present: boolean;
}

export const SS_TRIALS: SymbolSearchTrial[] = (() => {
  const r = mulberry32(89);
  const out: SymbolSearchTrial[] = [];
  for (let i = 0; i < 150; i++) {
    const pick = () => Math.floor(r() * 24);
    const t1 = pick();
    let t2 = pick();
    while (t2 === t1) t2 = pick();
    const g: number[] = [];
    while (g.length < 5) {
      const x = pick();
      if (x !== t1 && x !== t2 && !g.includes(x)) g.push(x);
    }
    const present = r() < 0.5;
    if (present) g[Math.floor(r() * 5)] = r() < 0.5 ? t1 : t2;
    out.push({ t: [t1, t2], g, present });
  }
  return out;
})();

export const BAT_TIMED_SEC = 90;

// Provisional norms -> replaced automatically by local school norms at n >= 30 per age band
export const BAT_PRIOR: Record<BatterySubtestKey, [number, number]> = {
  SI: [20, 4.5],
  VC: [10.5, 3],
  BD: [36, 10],
  SR: [5, 2],
  MR: [6.5, 2.2],
  FW: [8.5, 3],
  DS: [26, 5],
  SP: [9, 2.5],
  CD: [52, 11],
  SS: [34, 9],
};

export const BAT_MAX: Record<BatterySubtestKey, number> = {
  SI: 28,
  VC: 16,
  BD: BD_MAX,
  SR: 8,
  MR: 10,
  FW: 14,
  DS: 46,
  SP: 16,
  CD: 250,
  SS: 150,
};

export const BAT_AGEF: Record<string, number> = {
  '11–12': 0.78,
  '13–14': 0.86,
  '15–16': 0.93,
  '17–18': 0.97,
  '19–25': 1,
  '26+': 0.97,
  Unknown: 1,
};

export const NORM_MIN = 30;
export const AGE_BANDS = ['11–12', '13–14', '15–16', '17–18', '19–25', '26+'] as const;

export function ageBand(age: number): string {
  const n = Number(age);
  if (!n) return 'Unknown';
  if (n <= 12) return '11–12';
  if (n <= 14) return '13–14';
  if (n <= 16) return '15–16';
  if (n <= 18) return '17–18';
  if (n <= 25) return '19–25';
  return '26+';
}

export function inferAgeFromClassSection(classSection?: string): number {
  if (!classSection) return 14;
  const m = classSection.match(/\d+/);
  if (!m) return 14;
  const grade = Number(m[0]);
  if (grade >= 1 && grade <= 12) return Math.max(10, grade + 5);
  return 14;
}

export function formatClassLabel(classSection?: string): string {
  if (!classSection) return 'Class 9';
  const m = classSection.match(/\d+/);
  if (m) {
    const g = Number(m[0]);
    if (g >= 6 && g <= 12) return `Class ${g}`;
  }
  return classSection;
}

// ============================================================================
// 5. PSYCHOMETRIC STATISTICS & NORMING
// ============================================================================

export function meanOf(a: number[]): number {
  return a.reduce((x, y) => x + y, 0) / a.length;
}

export function variance(a: number[]): number {
  const m = meanOf(a);
  return a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1);
}

export function corr(x: number[], y: number[]): number {
  const mx = meanOf(x);
  const my = meanOf(y);
  let sxy = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sx += (x[i] - mx) ** 2;
    sy += (y[i] - my) ** 2;
  }
  return sx && sy ? sxy / Math.sqrt(sx * sy) : 0;
}

export function cronbach(matrix: number[][]): number | null {
  if (matrix.length < 3) return null;
  const k = matrix[0].length;
  if (k < 2) return null;
  const itemVar = [...Array(k).keys()].map((j) => variance(matrix.map((r) => r[j])));
  const tot = variance(matrix.map((r) => r.reduce((a, b) => a + b, 0)));
  return tot ? (k / (k - 1)) * (1 - itemVar.reduce((a, b) => a + b, 0) / tot) : null;
}

export function itemAnalysis(matrix: number[][]): Array<{ p: number; rit: number }> {
  const k = matrix[0].length;
  return [...Array(k).keys()].map((j) => {
    const item = matrix.map((r) => r[j]);
    const rest = matrix.map((r) => r.reduce((a, b) => a + b, 0) - r[j]);
    return { p: meanOf(item), rit: corr(item, rest) };
  });
}

export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p =
    d *
    t *
    (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export function batNormFor(
  key: BatterySubtestKey,
  band: string,
  pool: PsychometricBatteryRecord[],
): BatteryNormInfo {
  const g = (pool || [])
    .filter((r) => r.p.band === band)
    .map((r) => r.raw[key])
    .filter((v): v is number => v != null);
  if (g.length >= NORM_MIN) {
    const m = meanOf(g);
    const sd = Math.sqrt(variance(g)) || 1;
    return { m, sd, local: true, n: g.length };
  }
  const f = BAT_AGEF[band] || 1;
  const [m, sd] = BAT_PRIOR[key];
  return { m: m * f, sd: sd * Math.sqrt(f), local: false, n: g.length };
}

export function scaledScore(raw: number, nm: BatteryNormInfo): number {
  return Math.max(1, Math.min(19, Math.round(10 + (3 * (raw - nm.m)) / nm.sd)));
}

export function compositeScore(sum: number, k: number, r: number): number {
  const mean = 10 * k;
  const sd = 3 * Math.sqrt(k + k * (k - 1) * r);
  return Math.max(40, Math.min(160, Math.round(100 + (15 * (sum - mean)) / sd)));
}

export function wechslerBand(s: number): string {
  if (s >= 130) return 'Extremely high';
  if (s >= 120) return 'Very high';
  if (s >= 110) return 'High average';
  if (s >= 90) return 'Average';
  if (s >= 80) return 'Low average';
  if (s >= 70) return 'Very low';
  return 'Extremely low';
}

const BAT_REL = { index: 0.85, FSIQ: 0.93, GAI: 0.91, CPI: 0.86 };

export function ci90(score: number, rel: number): [number, number] {
  const h = Math.round(1.645 * 15 * Math.sqrt(1 - rel));
  return [score - h, score + h];
}

export function scoreBattery(
  rec: Pick<PsychometricBatteryRecord, 'p' | 'raw'>,
  pool: PsychometricBatteryRecord[],
): ScoredBatteryProfile {
  const band = rec.p.band;
  const ss = {} as Record<BatterySubtestKey, number>;
  const norms = {} as Record<BatterySubtestKey, BatteryNormInfo>;

  BAT_SUBS.forEach((s) => {
    const nm = batNormFor(s.key, band, pool);
    norms[s.key] = nm;
    ss[s.key] = scaledScore(rec.raw[s.key], nm);
  });

  const idx = {} as Record<BatteryIndexKey, BatteryCompositeScore>;
  BAT_INDEX_ORDER.forEach((k) => {
    const sum = BAT_INDEX[k].subs.reduce((a, s) => a + ss[s], 0);
    const sc = compositeScore(sum, 2, 0.6);
    idx[k] = {
      sum,
      score: sc,
      ci: ci90(sc, BAT_REL.index),
      pct: Math.round(normalCdf((sc - 100) / 15) * 100),
      band: wechslerBand(sc),
    };
  });

  const comp = (subs: BatterySubtestKey[], r: number, rel: number): BatteryCompositeScore => {
    const sum = subs.reduce((a, s) => a + ss[s], 0);
    const sc = compositeScore(sum, subs.length, r);
    return {
      sum,
      score: sc,
      ci: ci90(sc, rel),
      pct: Math.round(normalCdf((sc - 100) / 15) * 100),
      band: wechslerBand(sc),
    };
  };

  const FSIQ = comp(FSIQ_SUBS, 0.45, BAT_REL.FSIQ);
  const GAI = comp(GAI_SUBS, 0.5, BAT_REL.GAI);
  const CPI = comp(CPI_SUBS, 0.4, BAT_REL.CPI);

  const scores = BAT_INDEX_ORDER.map((k) => idx[k].score);
  const meanIdx = meanOf(scores);
  const spread = Math.max(...scores) - Math.min(...scores);
  const sw = {} as Record<BatteryIndexKey, '' | 'S' | 'W'>;
  BAT_INDEX_ORDER.forEach((k) => {
    const d = idx[k].score - meanIdx;
    sw[k] = d >= 12 ? 'S' : d <= -12 ? 'W' : '';
  });

  const local = Object.values(norms).every((n) => n.local);
  return { ss, idx, FSIQ, GAI, CPI, sw, spread, meanIdx, local, normN: norms.SI.n };
}

export function evaluateBatteryValidity(res: PsychometricBatteryRecord['res']): PsychometricValidity {
  const flags: string[] = [];
  if (res.CD.attempted && res.CD.errors / res.CD.attempted > 0.15) {
    flags.push(`Symbol Coding error rate ${Math.round((res.CD.errors / res.CD.attempted) * 100)}%`);
  }
  if (res.SS.attempted && res.SS.errors / res.SS.attempted > 0.25) {
    flags.push(`Symbol Search error rate ${Math.round((res.SS.errors / res.SS.attempted) * 100)}%`);
  }
  if (res.DS.longest.F < 3) {
    flags.push('Digit Span forward below 3, check the task was understood');
  }
  const fast = (['SI', 'VC', 'MR', 'FW', 'SR'] as const).reduce(
    (a, k) => a + res[k].times.filter((t, j) => res[k].choices[j] >= 0 && t < 2).length,
    0,
  );
  if (fast >= 8) {
    flags.push(`${fast} reasoning answers given in under 2 seconds`);
  }
  return { flags, valid: flags.length === 0 };
}

export function localIQNorm(
  rec: PsychometricIqRecord,
  allRecords: PsychometricRecord[],
): { n: number; iq?: number; pr?: number } {
  const pool = allRecords.filter(
    (r): r is PsychometricIqRecord =>
      r.type === 'iq' && Boolean(r.validity?.valid) && r.p.band === rec.p.band,
  );
  if (pool.length < NORM_MIN) return { n: pool.length };
  const th = pool.map((r) => r.theta);
  const m = meanOf(th);
  const sd = Math.sqrt(variance(th)) || 1;
  const z = (rec.theta - m) / sd;
  const pr = Math.round(
    (pool.filter((r) => r.theta < rec.theta).length / pool.length) * 100 +
      (pool.filter((r) => r.theta === rec.theta).length / pool.length) * 50,
  );
  return { n: pool.length, iq: Math.round(100 + 15 * z), pr };
}

export function personalityLocalPercentile(
  rec: PsychometricPersonalityRecord,
  trait: BigFiveTraitKey,
  allRecords: PsychometricRecord[],
): number | null {
  const pool = allRecords.filter(
    (r): r is PsychometricPersonalityRecord =>
      r.type === 'personality' && Boolean(r.validity?.valid),
  );
  if (pool.length < NORM_MIN) return null;
  const v = rec.traits[trait].pomp;
  return Math.round(
    ((pool.filter((r) => r.traits[trait].pomp < v).length +
      pool.filter((r) => r.traits[trait].pomp === v).length / 2) /
      pool.length) *
      100,
  );
}

// ============================================================================
// 6. CSV EXPORT
// ============================================================================

export function exportPsychometricCsv(records: PsychometricRecord[]): string {
  const validBats = records.filter(
    (r): r is PsychometricBatteryRecord => r.type === 'battery' && Boolean(r.validity?.valid),
  );

  const header = [
    'id',
    'date',
    'test',
    'student_id',
    'name',
    'age',
    'age_band',
    'class',
    'gender',
    'quality_ok',
    'flags',
    'duration_sec',
    'prov_iq',
    'ci90',
    'raw',
    'theta',
    'se',
    'matrix',
    'series',
    'verbal',
    'spatial',
    'O',
    'C',
    'E',
    'A',
    'S_stability',
    'R',
    'I',
    'A_art',
    'S_soc',
    'E_ent',
    'C_conv',
    'holland_code',
    ...BAT_SUBS.map((s) => `bat_raw_${s.key}`),
    ...BAT_SUBS.map((s) => `bat_ss_${s.key}`),
    ...BAT_INDEX_ORDER,
    'FSIQ',
    'GAI',
    'CPI',
    'bat_norms',
    ...IQ_BANK.map((i) => i.id),
    ...BF_ITEMS.map((_, i) => `bf${i + 1}`),
    ...RIASEC_ITEMS.map((_, i) => `ri${i + 1}`),
  ];

  const rows: Array<Array<string | number>> = [header];

  for (const r of records) {
    const isPers = r.type === 'personality';
    const isIq = r.type === 'iq';
    const isBat = r.type === 'battery';
    const bs = isBat ? scoreBattery(r, validBats) : null;

    rows.push([
      r.id,
      new Date(r.ts).toISOString(),
      r.type,
      r.studentId || '',
      r.p.name,
      r.p.age,
      r.p.band,
      r.p.cls,
      r.p.gender,
      r.validity.valid ? 1 : 0,
      r.validity.flags.join(' | '),
      r.durationSec,
      ...(isIq
        ? [
            r.iq,
            r.ci,
            r.raw,
            r.theta,
            r.se,
            r.domains['Gf-M'].c,
            r.domains['Gf-S'].c,
            r.domains.Gc.c,
            r.domains.Gv.c,
          ]
        : ['', '', '', '', '', '', '', '', '']),
      ...TRAIT_ORDER.map((t) => (isPers ? r.traits[t].pomp : '')),
      ...RIASEC_ORDER.map((k) => (isPers ? r.riasec[k] : '')),
      isPers ? r.code : '',
      ...BAT_SUBS.map((s) => (isBat ? r.raw[s.key] : '')),
      ...BAT_SUBS.map((s) => (bs ? bs.ss[s.key] : '')),
      ...BAT_INDEX_ORDER.map((k) => (bs ? bs.idx[k].score : '')),
      bs ? bs.FSIQ.score : '',
      bs ? bs.GAI.score : '',
      bs ? bs.CPI.score : '',
      bs ? (bs.local ? 'local' : 'provisional') : '',
      ...IQ_BANK.map((_, i) => (isIq ? r.correct[i] : '')),
      ...BF_ITEMS.map((_, i) => (isPers ? r.bf[i] : '')),
      ...RIASEC_ITEMS.map((_, i) => (isPers ? r.ri[i] : '')),
    ]);
  }

  return rows
    .map((row) =>
      row
        .map((v) => {
          const s = String(v ?? '');
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    )
    .join('\n');
}
