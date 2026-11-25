import type { SchoolClassNumber } from '../types';

export type QuickGameType = 'platter' | 'bins' | 'sequence' | 'label' | 'pairs' | 'odd';

export interface QuickGameFaceItem {
  e?: string;
  n?: string;
  t?: string;
  img?: string;
  svgHtml?: string;
  tip?: string;
}

export interface PlatterItem extends QuickGameFaceItem {
  tags: string[];
  also?: string[];
}

export interface PlatterRound {
  tag: string;
  icon: string;
  label: string;
  hint: string;
  idea: string;
}

export interface BinDef {
  id: string;
  icon: string;
  iconSvgHtml?: string;
  label: string;
  sub?: string;
}

export interface BinItem extends QuickGameFaceItem {
  bin: string;
}

export interface SequenceItem extends QuickGameFaceItem {
  sub?: string;
}

export interface LabelSpot {
  x: number;
  y: number;
  n: string;
  e?: string;
  fn?: string;
}

export interface OddRound {
  items: Array<[emojiOrText: string, name: string]>;
  odd: number;
  why: string;
}

export interface QuickGameBase {
  id: string;
  cls: SchoolClassNumber;
  subject: string;
  chapter: string;
  topicLabel: string;
  title: string;
  icon: string;
  type: QuickGameType;
  ideas: Array<[icon: string, text: string]>;
}

export interface PlatterGameDef extends QuickGameBase {
  type: 'platter';
  tagNames: Record<string, string>;
  items: PlatterItem[];
  rounds: PlatterRound[];
  perRound?: number;
  perRoundRight?: number;
}

export interface BinsGameDef extends QuickGameBase {
  type: 'bins';
  bins: BinDef[];
  items: BinItem[];
  showNames?: boolean;
  count?: number;
}

export interface SequenceGameDef extends QuickGameBase {
  type: 'sequence';
  prompt: string;
  hint?: string;
  headIcon?: string;
  items: SequenceItem[];
  reveal?: { icon: string; title: string; text: string };
}

export interface LabelGameDef extends QuickGameBase {
  type: 'label';
  svg: string;
  w?: number;
  h?: number;
  spots: LabelSpot[];
}

export interface PairsGameDef extends QuickGameBase {
  type: 'pairs';
  pairs: Array<[QuickGameFaceItem, QuickGameFaceItem]>;
}

export interface OddGameDef extends QuickGameBase {
  type: 'odd';
  rounds: OddRound[];
}

export type QuickRevisionGame =
  | PlatterGameDef
  | BinsGameDef
  | SequenceGameDef
  | LabelGameDef
  | PairsGameDef
  | OddGameDef;

export interface ChapterQuestBundle {
  key: string;
  cls: SchoolClassNumber;
  subject: string;
  chapter: string;
  games: QuickRevisionGame[];
  primaryIcon: string;
  accentColor: string;
  topics: string[];
  rememberHighlights: Array<[string, string]>;
}

export const QUICK_GAME_TYPE_META: Record<
  QuickGameType,
  { icon: string; name: string; subtitle: string }
> = {
  platter: { icon: '🍽️', name: 'Plate it', subtitle: 'Pick & place all matching items' },
  bins: { icon: '🗂️', name: 'Sort it', subtitle: 'Swipe or tap into the right group' },
  sequence: { icon: '🔗', name: 'Chain it', subtitle: 'Build the flow in exact order' },
  label: { icon: '🏷️', name: 'Label it', subtitle: 'Pin every part on the diagram' },
  pairs: { icon: '🃏', name: 'Match it', subtitle: 'Flip & pair cause with effect' },
  odd: { icon: '🎯', name: 'Spot it', subtitle: 'Catch the one that does not belong' },
};

export const SUBJECT_ACCENT_COLORS: Record<string, string> = {
  Science: '#10B981',
  EVS: '#10B981',
  Maths: '#6366F1',
  Mathematics: '#6366F1',
  English: '#EC4899',
  'Social Science': '#F59E0B',
  Hindi: '#EA580C',
  'Computer Science': '#0284C7',
  Physics: '#0EA5E9',
  Chemistry: '#8B5CF6',
  Biology: '#22C55E',
  Economics: '#D97706',
};

export function getSubjectColor(subject: string): string {
  return SUBJECT_ACCENT_COLORS[subject] || '#FF6B35';
}

/* ---------- Reusable SVG Visual Generators ---------- */

export function pieSvg(n: number, d: number, col = '#F97316'): string {
  let s =
    '<svg viewBox="-34 -34 68 68" xmlns="http://www.w3.org/2000/svg"><circle r="31" fill="#FDE68A" stroke="#92400E" stroke-width="2.5"/>';
  for (let i = 0; i < d; i++) {
    const a0 = (i / d) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const x0 = (30 * Math.cos(a0)).toFixed(2);
    const y0 = (30 * Math.sin(a0)).toFixed(2);
    const x1 = (30 * Math.cos(a1)).toFixed(2);
    const y1 = (30 * Math.sin(a1)).toFixed(2);
    s += `<path d="M0 0L${x0} ${y0}A30 30 0 0 1 ${x1} ${y1}Z" fill="${
      i < n ? col : '#FFFBEB'
    }" stroke="#92400E" stroke-width="1.6"/>`;
    if (i < n) {
      s += `<circle cx="${(16 * Math.cos((a0 + a1) / 2)).toFixed(1)}" cy="${(
        16 * Math.sin((a0 + a1) / 2)
      ).toFixed(1)}" r="3" fill="#B91C1C"/>`;
    }
  }
  return `${s}</svg>`;
}

export function angleSvg(deg: number, col = '#4F46E5'): string {
  const rad = (deg * Math.PI) / 180;
  const cx = 36;
  const cy = 50;
  const r = 28;
  const x2 = (cx + r * Math.cos(-rad)).toFixed(1);
  const y2 = (cy + r * Math.sin(-rad)).toFixed(1);
  const ar = 14;
  const ax = (cx + ar * Math.cos(-rad)).toFixed(1);
  const ay = (cy + ar * Math.sin(-rad)).toFixed(1);
  const large = deg > 180 ? 1 : 0;
  const arc =
    deg === 90
      ? `<path d="M${cx + 12} ${cy}V${cy - 12}H${cx}" fill="none" stroke="${col}" stroke-width="2.5"/>`
      : `<path d="M${cx + ar} ${cy}A${ar} ${ar} 0 ${large} 0 ${ax} ${ay}" fill="none" stroke="${col}" stroke-width="2.5"/>`;
  return `<svg viewBox="0 0 80 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="72" rx="12" fill="#EEF2FF"/>
    <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
    ${arc}
    <circle cx="${cx}" cy="${cy}" r="3.2" fill="${col}"/>
    <text x="40" y="67" text-anchor="middle" font-size="11" font-weight="700" fill="#1E293B">${deg}°</text>
  </svg>`;
}

/* ---------- Educational Interactive Diagram SVGs ---------- */

const SVG_PLANT_CELL = `
<rect width="400" height="300" fill="#F7FEE7"/>
<rect x="12" y="12" width="376" height="276" rx="34" fill="#BBF7D0" stroke="#15803D" stroke-width="12"/>
<rect x="32" y="32" width="336" height="236" rx="24" fill="#F0FDF4" stroke="#4ADE80" stroke-width="3"/>
<g fill="#BBF7D0"><circle cx="60" cy="60" r="3"/><circle cx="150" cy="45" r="2.5"/><circle cx="200" cy="80" r="3"/><circle cx="60" cy="160" r="3"/><circle cx="150" cy="250" r="3"/><circle cx="270" cy="250" r="2.5"/><circle cx="350" cy="140" r="3"/><circle cx="250" cy="55" r="2.5"/></g>
<ellipse cx="235" cy="160" rx="88" ry="66" fill="#BAE6FD" stroke="#0284C7" stroke-width="3"/>
<circle cx="95" cy="100" r="34" fill="#DDD6FE" stroke="#7C3AED" stroke-width="3"/><circle cx="103" cy="93" r="11" fill="#7C3AED"/>
<g stroke="#166534" stroke-width="2"><ellipse cx="95" cy="215" rx="26" ry="13" fill="#22C55E"/><path d="M78 215h34M83 209v12M95 207v16M107 209v12" fill="none"/>
<ellipse cx="335" cy="72" rx="20" ry="11" fill="#22C55E"/><ellipse cx="170" cy="252" rx="18" ry="9" fill="#22C55E"/></g>
<ellipse cx="335" cy="236" rx="25" ry="13" fill="#FDBA74" stroke="#C2410C" stroke-width="2.5"/>
<path d="M316 236q5-8 9 0t9 0t9 0t9 0" stroke="#C2410C" stroke-width="2" fill="none"/>`;

const SVG_FLOWER = `
<rect width="400" height="300" fill="#F0F9FF"/>
<path d="M200 300C197 265 203 230 200 182" stroke="#16A34A" stroke-width="9" fill="none" stroke-linecap="round"/>
<ellipse cx="158" cy="262" rx="36" ry="12" fill="#22C55E" transform="rotate(-25 158 262)"/>
<ellipse cx="122" cy="128" rx="84" ry="40" fill="#F9A8D4" stroke="#DB2777" stroke-width="2" transform="rotate(-28 122 128)"/>
<ellipse cx="278" cy="128" rx="84" ry="40" fill="#F9A8D4" stroke="#DB2777" stroke-width="2" transform="rotate(28 278 128)"/>
<ellipse cx="170" cy="192" rx="32" ry="10" fill="#15803D" transform="rotate(22 170 192)"/>
<ellipse cx="230" cy="192" rx="32" ry="10" fill="#15803D" transform="rotate(-22 230 192)"/>
<path d="M189 160Q172 128 158 96" stroke="#F59E0B" stroke-width="3.5" fill="none"/>
<path d="M211 160Q228 128 242 96" stroke="#F59E0B" stroke-width="3.5" fill="none"/>
<ellipse cx="156" cy="90" rx="11" ry="8" fill="#B45309"/><ellipse cx="244" cy="90" rx="11" ry="8" fill="#B45309"/>
<rect x="195" y="80" width="10" height="72" rx="5" fill="#84CC16" stroke="#4D7C0F" stroke-width="1.5"/>
<ellipse cx="200" cy="74" rx="17" ry="9" fill="#65A30D"/>
<ellipse cx="200" cy="166" rx="23" ry="21" fill="#BEF264" stroke="#4D7C0F" stroke-width="3"/>
<g fill="#FEF9C3" stroke="#4D7C0F" stroke-width="1"><circle cx="193" cy="162" r="4"/><circle cx="207" cy="162" r="4"/><circle cx="200" cy="174" r="4"/></g>`;

const SVG_PLANT_PARTS = `
<rect width="400" height="300" fill="#F0FDF4"/>
<rect x="0" y="218" width="400" height="82" fill="#D6B588"/>
<path d="M0 218H400" stroke="#92400E" stroke-width="3"/>
<g stroke="#78350F" stroke-width="4" fill="none" stroke-linecap="round">
  <path d="M200 218V274"/><path d="M200 232L162 260"/><path d="M200 238L238 265"/>
  <path d="M200 254L176 282"/><path d="M200 258L228 284"/>
</g>
<path d="M200 218V76" stroke="#15803D" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="144" cy="166" rx="44" ry="20" fill="#22C55E" stroke="#166534" stroke-width="2.5" transform="rotate(-18 144 166)"/>
<path d="M110 176L194 152" stroke="#166534" stroke-width="2"/>
<ellipse cx="256" cy="144" rx="44" ry="20" fill="#22C55E" stroke="#166534" stroke-width="2.5" transform="rotate(18 256 144)"/>
<circle cx="152" cy="116" r="18" fill="#EF4444" stroke="#991B1B" stroke-width="2.5"/>
<path d="M152 98Q162 90 166 96" stroke="#166534" stroke-width="3" fill="none"/>
<g transform="translate(200 62)">
  <circle cx="0" cy="-18" r="15" fill="#F472B6"/><circle cx="18" cy="0" r="15" fill="#F472B6"/>
  <circle cx="0" cy="18" r="15" fill="#F472B6"/><circle cx="-18" cy="0" r="15" fill="#F472B6"/>
  <circle cx="0" cy="0" r="11" fill="#FACC15" stroke="#B45309" stroke-width="2"/>
</g>
<ellipse cx="236" cy="100" rx="10" ry="15" fill="#86EFAC" stroke="#15803D" stroke-width="2" transform="rotate(28 236 100)"/>`;

const SVG_WATER_CYCLE = `
<rect width="400" height="300" fill="#E0F2FE"/>
<circle cx="62" cy="54" r="28" fill="#FACC15" stroke="#EA580C" stroke-width="3"/>
<path d="M0 225Q100 205 200 222T400 218V300H0Z" fill="#0284C7"/>
<path d="M225 220L295 112L365 220Z" fill="#78716C" stroke="#44403C" stroke-width="2"/>
<path d="M278 138L295 112L312 138Z" fill="#F8FAFC"/>
<g fill="#FFFFFF" stroke="#64748B" stroke-width="2">
  <ellipse cx="176" cy="70" rx="34" ry="20"/><ellipse cx="204" cy="64" rx="28" ry="18"/>
  <ellipse cx="288" cy="66" rx="36" ry="20"/><ellipse cx="318" cy="62" rx="24" ry="16"/>
</g>
<g stroke="#0369A1" stroke-width="3" fill="none" stroke-dasharray="5 5">
  <path d="M98 205V115"/><path d="M126 205V115"/>
</g>
<path d="M92 124L98 112L104 124M120 124L126 112L132 124" fill="none" stroke="#0369A1" stroke-width="3"/>
<g stroke="#2563EB" stroke-width="3" stroke-linecap="round">
  <line x1="274" y1="92" x2="268" y2="114"/><line x1="294" y1="92" x2="288" y2="114"/><line x1="314" y1="92" x2="308" y2="114"/>
</g>
<path d="M250 185Q230 205 190 224" stroke="#38BDF8" stroke-width="7" fill="none" stroke-linecap="round"/>`;

const SVG_HUMAN_HEART = `
<rect width="400" height="300" fill="#FFF1F2"/>
<path d="M200 264C125 222 88 168 96 114C102 74 140 58 176 82L200 100L224 82C260 58 298 74 304 114C312 168 275 222 200 264Z" fill="#FDA4AF" stroke="#BE123C" stroke-width="4"/>
<path d="M200 98V258" stroke="#9F1239" stroke-width="8" stroke-linecap="round"/>
<path d="M104 152H196" stroke="#BE123C" stroke-width="4" stroke-dasharray="6 4"/>
<path d="M204 152H296" stroke="#BE123C" stroke-width="4" stroke-dasharray="6 4"/>
<path d="M148 118C130 118 118 134 118 148H188V118Z" fill="#93C5FD" stroke="#1D4ED8" stroke-width="2.5"/>
<path d="M122 158C128 196 156 226 192 246V158Z" fill="#60A5FA" stroke="#1D4ED8" stroke-width="2.5"/>
<path d="M212 118H282C282 134 272 148 252 148H212Z" fill="#FCA5A5" stroke="#B91C1C" stroke-width="2.5"/>
<path d="M208 158V246C244 226 272 196 278 158Z" fill="#F87171" stroke="#B91C1C" stroke-width="2.5"/>
<path d="M214 96V42Q214 22 248 26Q276 30 276 62" fill="none" stroke="#DC2626" stroke-width="14" stroke-linecap="round"/>
<path d="M174 98V52Q174 36 140 44" fill="none" stroke="#2563EB" stroke-width="12" stroke-linecap="round"/>`;

const SVG_COMPUTER_PARTS = `
<rect width="400" height="300" fill="#F0F9FF"/>
<rect x="64" y="42" width="180" height="120" rx="12" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
<rect x="76" y="54" width="156" height="94" rx="6" fill="#38BDF8"/>
<rect x="138" y="162" width="32" height="22" fill="#64748B"/>
<rect x="114" y="182" width="80" height="10" rx="5" fill="#475569"/>
<rect x="278" y="42" width="82" height="162" rx="10" fill="#334155" stroke="#0F172A" stroke-width="3"/>
<rect x="292" y="60" width="54" height="14" rx="4" fill="#94A3B8"/>
<circle cx="319" cy="144" r="12" fill="#22C55E"/>
<rect x="54" y="216" width="204" height="52" rx="10" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
<g fill="#94A3B8"><rect x="68" y="228" width="22" height="10" rx="2"/><rect x="96" y="228" width="22" height="10" rx="2"/><rect x="124" y="228" width="22" height="10" rx="2"/><rect x="152" y="228" width="22" height="10" rx="2"/><rect x="180" y="228" width="22" height="10" rx="2"/><rect x="208" y="228" width="34" height="10" rx="2"/><rect x="96" y="246" width="106" height="12" rx="3"/></g>
<rect x="296" y="220" width="46" height="56" rx="22" fill="#F8FAFC" stroke="#475569" stroke-width="3"/>
<line x1="319" y1="220" x2="319" y2="244" stroke="#475569" stroke-width="2.5"/>`;

/* =====================================================================
   COMPLETE HANDCRAFTED CATALOG — CLASSES 1 TO 12 ACROSS ALL SUBJECTS
   Includes all 23 games from quick-revision-games.html + full expansion!
   ===================================================================== */

export const QUICK_REVISION_GAMES: QuickRevisionGame[] = [
  /* ================= CLASS 1 ================= */
  {
    id: 'c1-tiffin-plate',
    cls: 1,
    subject: 'EVS',
    chapter: 'Food We Eat',
    topicLabel: 'Healthy vs Junk Food',
    title: 'Pack a Healthy Tiffin',
    icon: '🍱',
    type: 'platter',
    tagNames: { healthy: 'Healthy Food', treat: 'Occasional Treat' },
    items: [
      { e: '🍎', n: 'Apple', tags: ['healthy'] },
      { e: '🍌', n: 'Banana', tags: ['healthy'] },
      { e: '🥛', n: 'Milk', tags: ['healthy'] },
      { e: '🥕', n: 'Carrot', tags: ['healthy'] },
      { e: '🫓', n: 'Roti', tags: ['healthy'] },
      { e: '🍚', n: 'Rice', tags: ['healthy'] },
      { e: '🥚', n: 'Egg', tags: ['healthy'] },
      { e: '🍟', n: 'Chips', tags: ['treat'] },
      { e: '🍭', n: 'Lollipop', tags: ['treat'] },
      { e: '🥤', n: 'Soda', tags: ['treat'] },
      { e: '🍩', n: 'Donut', tags: ['treat'] },
      { e: '🍬', n: 'Candy', tags: ['treat'] },
    ],
    rounds: [
      {
        tag: 'healthy',
        icon: '🥗',
        label: 'Healthy Tiffin Foods',
        hint: 'Fill the plate with foods that help you grow strong',
        idea: 'Fruits, milk, vegetables and roti keep us active and strong.',
      },
      {
        tag: 'treat',
        icon: '🍭',
        label: 'Spot the Junk Treats',
        hint: 'Pick foods we should eat only rarely',
        idea: 'Too much sugar and fried snacks harm teeth and energy.',
      },
    ],
    ideas: [
      ['🍎', 'Fruits & veggies keep us fit'],
      ['🥛', 'Milk builds strong bones & teeth'],
      ['💧', 'Drink plenty of clean water daily'],
    ],
  },
  {
    id: 'c1-five-senses',
    cls: 1,
    subject: 'EVS',
    chapter: 'My Body & Sense Organs',
    topicLabel: 'Five Sense Organs',
    title: 'Sense Organ Match',
    icon: '👀',
    type: 'pairs',
    pairs: [
      [{ e: '👀', n: 'Eyes' }, { e: '🌈', n: 'See colours' }],
      [{ e: '👂', n: 'Ears' }, { e: '🎵', n: 'Hear music' }],
      [{ e: '👃', n: 'Nose' }, { e: '🌸', n: 'Smell flowers' }],
      [{ e: '👅', n: 'Tongue' }, { e: '🥭', n: 'Taste mango' }],
      [{ e: '✋', n: 'Skin' }, { e: '🧊', n: 'Feel hot & cold' }],
    ],
    ideas: [
      ['👀', 'Eyes → sight'],
      ['👂', 'Ears → hearing'],
      ['👃', 'Nose → smell'],
      ['👅', 'Tongue → taste · ✋ Skin → touch'],
    ],
  },
  {
    id: 'c1-shapes-sort',
    cls: 1,
    subject: 'Maths',
    chapter: 'Shapes and Space',
    topicLabel: 'Rolling vs Sliding Objects',
    title: 'Roll or Slide?',
    icon: '⚽',
    type: 'bins',
    bins: [
      { id: 'roll', icon: '⚽', label: 'Rolls', sub: 'round face' },
      { id: 'slide', icon: '📦', label: 'Slides', sub: 'flat face' },
    ],
    items: [
      { e: '⚽', n: 'Football', bin: 'roll' },
      { e: '🍊', n: 'Orange', bin: 'roll' },
      { e: '🏀', n: 'Basketball', bin: 'roll' },
      { e: '🎾', n: 'Tennis Ball', bin: 'roll' },
      { e: '📦', n: 'Box', bin: 'slide' },
      { e: '📘', n: 'Book', bin: 'slide' },
      { e: '🧱', n: 'Brick', bin: 'slide' },
      { e: '🎲', n: 'Dice', bin: 'slide' },
    ],
    ideas: [
      ['⚽', 'Round objects roll easily'],
      ['📦', 'Flat-sided objects slide and stack'],
    ],
  },
  {
    id: 'c1-daily-routine',
    cls: 1,
    subject: 'Maths',
    chapter: 'Time and Daily Routine',
    topicLabel: 'Order of the Day',
    title: 'My School Day Chain',
    icon: '⏰',
    type: 'sequence',
    prompt: 'Order your day from morning to night',
    hint: 'Wake up first → sleep last',
    headIcon: '🌅',
    items: [
      { e: '🌅', n: 'Wake up & brush', sub: 'early morning' },
      { e: '🚌', n: 'Go to school', sub: 'morning' },
      { e: '🍱', n: 'Eat lunch', sub: 'afternoon' },
      { e: '⚽', n: 'Play outside', sub: 'evening' },
      { e: '🌙', n: 'Sleep at night', sub: 'night' },
    ],
    reveal: { icon: '⏰', title: 'Daily Sequence', text: 'Morning → Afternoon → Evening → Night repeats every day!' },
    ideas: [
      ['🌅', 'Sun rises in the morning'],
      ['☀️', 'Lunch is in the afternoon'],
      ['🌙', 'Stars shine at night'],
    ],
  },
  {
    id: 'c1-english-words',
    cls: 1,
    subject: 'English',
    chapter: 'Naming & Action Words',
    topicLabel: 'Naming vs Doing Words',
    title: 'Name It or Do It?',
    icon: '🔤',
    type: 'bins',
    bins: [
      { id: 'name', icon: '🏷️', label: 'Naming Word', sub: 'person, animal, thing' },
      { id: 'act', icon: '🏃', label: 'Action Word', sub: 'what we do' },
    ],
    items: [
      { e: '🐶', n: 'Dog', bin: 'name' },
      { e: '🌳', n: 'Tree', bin: 'name' },
      { e: '🍎', n: 'Apple', bin: 'name' },
      { e: '🚌', n: 'Bus', bin: 'name' },
      { e: '🏃', n: 'Run', bin: 'act' },
      { e: '🦘', n: 'Jump', bin: 'act' },
      { e: '📖', n: 'Read', bin: 'act' },
      { e: '😴', n: 'Sleep', bin: 'act' },
    ],
    ideas: [
      ['🏷️', 'Naming words = Nouns (Dog, Bus, Tree)'],
      ['🏃', 'Action words = Verbs (Run, Jump, Read)'],
    ],
  },
  {
    id: 'c1-computer-parts',
    cls: 1,
    subject: 'Computer Science',
    chapter: 'Parts of a Computer',
    topicLabel: 'Identify Computer Parts',
    title: 'Label the Computer',
    icon: '🖥️',
    type: 'label',
    svg: SVG_COMPUTER_PARTS,
    w: 400,
    h: 300,
    spots: [
      { x: 154, y: 100, n: 'Monitor', e: '🖥️', fn: 'shows pictures and text' },
      { x: 319, y: 118, n: 'CPU Box', e: '🧠', fn: 'brain of the computer' },
      { x: 156, y: 242, n: 'Keyboard', e: '⌨️', fn: 'used for typing letters & numbers' },
      { x: 319, y: 248, n: 'Mouse', e: '🖱️', fn: 'points and clicks on screen' },
    ],
    ideas: [
      ['🖥️', 'Monitor looks like a TV screen'],
      ['🧠', 'CPU is the brain of the computer'],
      ['⌨️', 'Keyboard types · 🖱️ Mouse clicks'],
    ],
  },

  /* ================= CLASS 2 ================= */
  {
    id: 'c2-plant-parts',
    cls: 2,
    subject: 'EVS',
    chapter: 'Plants Around Us',
    topicLabel: 'Parts of a Plant',
    title: 'Label the Plant',
    icon: '🌱',
    type: 'label',
    svg: SVG_PLANT_PARTS,
    w: 400,
    h: 300,
    spots: [
      { x: 200, y: 62, n: 'Flower', e: '🌸', fn: 'makes seeds & fruits' },
      { x: 152, y: 116, n: 'Fruit', e: '🍎', fn: 'protects the seeds inside' },
      { x: 256, y: 144, n: 'Leaf', e: '🍃', fn: 'kitchen of the plant (makes food)' },
      { x: 200, y: 184, n: 'Stem', e: '🌿', fn: 'carries water up to leaves' },
      { x: 200, y: 256, n: 'Roots', e: '🌱', fn: 'fixes plant & absorbs water' },
    ],
    ideas: [
      ['🌱', 'Roots hold soil & drink water'],
      ['🍃', 'Green leaves make food in sunlight'],
      ['🌸', 'Flowers grow into fruits with seeds'],
    ],
  },
  {
    id: 'c2-seasons-sort',
    cls: 2,
    subject: 'EVS',
    chapter: 'Seasons & Clothes',
    topicLabel: 'Summer, Winter & Rainy Gear',
    title: 'Season Wardrobe Sort',
    icon: '🌦️',
    type: 'bins',
    bins: [
      { id: 'sum', icon: '☀️', label: 'Summer', sub: 'hot & sunny' },
      { id: 'win', icon: '❄️', label: 'Winter', sub: 'cold & chilly' },
      { id: 'rain', icon: '🌧️', label: 'Rainy', sub: 'wet & cloudy' },
    ],
    items: [
      { e: '👕', n: 'Cotton T-shirt', bin: 'sum' },
      { e: '🕶️', n: 'Sunglasses', bin: 'sum' },
      { e: '🍉', n: 'Watermelon', bin: 'sum' },
      { e: '🧥', n: 'Woollen Coat', bin: 'win' },
      { e: '🧣', n: 'Muffler', bin: 'win' },
      { e: '🧤', n: 'Gloves', bin: 'win' },
      { e: '☂️', n: 'Umbrella', bin: 'rain' },
      { e: '🥾', n: 'Rain Boots', bin: 'rain' },
      { e: '🧥', n: 'Raincoat', bin: 'rain' },
    ],
    ideas: [
      ['☀️', 'Cotton clothes keep us cool in summer'],
      ['❄️', 'Woollen clothes trap warmth in winter'],
      ['🌧️', 'Waterproof raincoats keep us dry'],
    ],
  },
  {
    id: 'c2-2d-3d-shapes',
    cls: 2,
    subject: 'Maths',
    chapter: 'What is Long, What is Round?',
    topicLabel: '2D Flat vs 3D Solid Shapes',
    title: 'Flat or Solid Shape?',
    icon: '🧊',
    type: 'bins',
    bins: [
      { id: '2d', icon: '⬜', label: '2D Flat', sub: 'length & width' },
      { id: '3d', icon: '🧊', label: '3D Solid', sub: 'you can hold it' },
    ],
    items: [
      { t: 'Circle', bin: '2d' },
      { t: 'Triangle', bin: '2d' },
      { t: 'Square', bin: '2d' },
      { t: 'Rectangle', bin: '2d' },
      { e: '🧊', n: 'Cube', bin: '3d' },
      { e: '⚽', n: 'Sphere', bin: '3d' },
      { e: '🥫', n: 'Cylinder', bin: '3d' },
      { e: '🍦', n: 'Cone', bin: '3d' },
    ],
    ideas: [
      ['⬜', '2D shapes are flat drawings'],
      ['🧊', '3D solids have faces, edges and corners'],
    ],
  },
  {
    id: 'c2-opposites-pairs',
    cls: 2,
    subject: 'English',
    chapter: 'Vocabulary & Opposites',
    topicLabel: 'Antonym Pairs',
    title: 'Opposites Flip',
    icon: '🔄',
    type: 'pairs',
    pairs: [
      [{ e: '🔥', n: 'Hot' }, { e: '🧊', n: 'Cold' }],
      [{ e: '☀️', n: 'Day' }, { e: '🌙', n: 'Night' }],
      [{ e: '🐘', n: 'Big' }, { e: '🐜', n: 'Small' }],
      [{ e: '😊', n: 'Happy' }, { e: '😢', n: 'Sad' }],
      [{ e: '🐇', n: 'Fast' }, { e: '🐢', n: 'Slow' }],
      [{ e: '⬆️', n: 'Up' }, { e: '⬇️', n: 'Down' }],
    ],
    ideas: [
      ['🔄', 'Opposites have completely different meanings'],
      ['📖', 'Knowing opposites makes sentences sharper'],
    ],
  },

  /* ================= CLASS 3 ================= */
  {
    id: 'c3-water-cycle-chain',
    cls: 3,
    subject: 'EVS',
    chapter: 'Water O’ Water',
    topicLabel: 'Water Cycle Steps',
    title: 'Water Cycle Chain',
    icon: '💧',
    type: 'sequence',
    prompt: 'How does rain come back to Earth?',
    hint: 'Start with Sun heating water → rain falls back',
    headIcon: '☀️',
    items: [
      { e: '☀️', n: 'Sun heats water', sub: 'warm rivers & seas' },
      { e: '💨', n: 'Evaporation', sub: 'water turns to vapour' },
      { e: '☁️', n: 'Condensation', sub: 'vapour cools into clouds' },
      { e: '🌧️', n: 'Precipitation', sub: 'rain falls down' },
      { e: '🌊', n: 'Collection', sub: 'flows back to rivers & seas' },
    ],
    reveal: { icon: '♻️', title: 'Endless Water Cycle', text: 'Earth recycles the same water again and again!' },
    ideas: [
      ['💨', 'Evaporation = liquid → vapour'],
      ['☁️', 'Condensation = vapour → cloud droplets'],
      ['🌧️', 'Precipitation = rain, snow or hail'],
    ],
  },
  {
    id: 'c3-water-cycle-label',
    cls: 3,
    subject: 'EVS',
    chapter: 'Water O’ Water',
    topicLabel: 'Label the Water Cycle',
    title: 'Label the Water Cycle',
    icon: '☁️',
    type: 'label',
    svg: SVG_WATER_CYCLE,
    w: 400,
    h: 300,
    spots: [
      { x: 62, y: 54, n: 'Sun', e: '☀️', fn: 'heats water in seas & lakes' },
      { x: 112, y: 162, n: 'Evaporation', e: '💨', fn: 'water rises as invisible vapour' },
      { x: 190, y: 66, n: 'Condensation', e: '☁️', fn: 'vapour cools to form clouds' },
      { x: 294, y: 102, n: 'Precipitation', e: '🌧️', fn: 'water falls as rain or snow' },
      { x: 120, y: 254, n: 'Collection', e: '🌊', fn: 'water gathers in oceans & rivers' },
    ],
    ideas: [
      ['☀️', 'Sun powers the entire water cycle'],
      ['☁️', 'Clouds form high up where air is cool'],
    ],
  },
  {
    id: 'c3-odd-even',
    cls: 3,
    subject: 'Maths',
    chapter: 'Fun with Numbers',
    topicLabel: 'Even vs Odd Numbers',
    title: 'Even or Odd Sorter',
    icon: '🔢',
    type: 'bins',
    bins: [
      { id: 'even', icon: '👯', label: 'Even', sub: 'ends in 0, 2, 4, 6, 8' },
      { id: 'odd', icon: '☝️', label: 'Odd', sub: 'ends in 1, 3, 5, 7, 9' },
    ],
    items: [
      { t: '14', bin: 'even' },
      { t: '28', bin: 'even' },
      { t: '100', bin: 'even' },
      { t: '46', bin: 'even' },
      { t: '72', bin: 'even' },
      { t: '19', bin: 'odd' },
      { t: '35', bin: 'odd' },
      { t: '81', bin: 'odd' },
      { t: '57', bin: 'odd' },
      { t: '93', bin: 'odd' },
    ],
    ideas: [
      ['👯', 'Even numbers make complete pairs (÷ 2 leaves 0)'],
      ['☝️', 'Odd numbers leave 1 extra when paired'],
    ],
  },
  {
    id: 'c3-helpers-pairs',
    cls: 3,
    subject: 'Social Science',
    chapter: 'Work We Do',
    topicLabel: 'Community Helpers',
    title: 'Community Helpers Match',
    icon: '🧑‍⚕️',
    type: 'pairs',
    pairs: [
      [{ e: '🧑‍⚕️', n: 'Doctor' }, { e: '🏥', n: 'Hospital' }],
      [{ e: '👩‍🏫', n: 'Teacher' }, { e: '🏫', n: 'School' }],
      [{ e: '🧑‍🚒', n: 'Firefighter' }, { e: '🚒', n: 'Fire Station' }],
      [{ e: '📮', n: 'Postman' }, { e: '✉️', n: 'Letters & Parcels' }],
      [{ e: '🧑‍🌾', n: 'Farmer' }, { e: '🌾', n: 'Grows Crops' }],
      [{ e: '👮', n: 'Police' }, { e: '🛡️', n: 'Keeps City Safe' }],
    ],
    ideas: [
      ['🤝', 'Every community helper makes daily life better'],
      ['🙏', 'Respect every profession equally'],
    ],
  },

  /* ================= CLASS 4 ================= */
  {
    id: 'c4-angles-sort',
    cls: 4,
    subject: 'Maths',
    chapter: 'Shapes and Angles',
    topicLabel: 'Acute, Right & Obtuse Angles',
    title: 'Angle Spotter',
    icon: '📐',
    type: 'bins',
    showNames: false,
    bins: [
      { id: 'acute', icon: '📐', label: 'Acute', sub: 'less than 90°' },
      { id: 'right', icon: '🔲', label: 'Right', sub: 'exactly 90°' },
      { id: 'obtuse', icon: '📖', label: 'Obtuse', sub: '90° to 180°' },
    ],
    items: [
      { svgHtml: angleSvg(30), n: '30°', bin: 'acute' },
      { svgHtml: angleSvg(45), n: '45°', bin: 'acute' },
      { svgHtml: angleSvg(75), n: '75°', bin: 'acute' },
      { svgHtml: angleSvg(90, '#16A34A'), n: '90°', bin: 'right' },
      { svgHtml: angleSvg(120, '#D97706'), n: '120°', bin: 'obtuse' },
      { svgHtml: angleSvg(150, '#D97706'), n: '150°', bin: 'obtuse' },
      { svgHtml: angleSvg(105, '#D97706'), n: '105°', bin: 'obtuse' },
      { svgHtml: angleSvg(60), n: '60°', bin: 'acute' },
    ],
    ideas: [
      ['📐', 'Acute < 90° (sharp corner)'],
      ['🔲', 'Right = 90° (L-shape corner)'],
      ['📖', 'Obtuse = between 90° and 180° (wide open)'],
    ],
  },
  {
    id: 'c4-animal-odd',
    cls: 4,
    subject: 'EVS',
    chapter: 'Ear to Ear & Animal Life',
    topicLabel: 'Egg-Laying vs Mammals & Habitats',
    title: 'Animal Kingdom Odd One',
    icon: '🐘',
    type: 'odd',
    rounds: [
      { items: [['🐘', 'Elephant'], ['🐄', 'Cow'], ['🐶', 'Dog'], ['🐸', 'Frog']], odd: 3, why: '🐸 lays eggs · others give birth to babies' },
      { items: [['🦅', 'Eagle'], ['🦜', 'Parrot'], ['🦇', 'Bat'], ['🦆', 'Duck']], odd: 2, why: '🦇 is a mammal with fur · others are birds with feathers' },
      { items: [['🐟', 'Fish'], ['🐙', 'Octopus'], ['🐬', 'Dolphin'], ['🐫', 'Camel']], odd: 3, why: '🐫 lives on desert land · others live in water' },
      { items: [['🦒', 'Giraffe'], ['🦌', 'Deer'], ['🐅', 'Tiger'], ['🐎', 'Horse']], odd: 2, why: '🐅 eats meat (carnivore) · others eat plants' },
    ],
    ideas: [
      ['👂', 'Animals with visible ears & body hair give birth to young'],
      ['🥚', 'Animals without visible ears usually lay eggs'],
    ],
  },
  {
    id: 'c4-tenses-sort',
    cls: 4,
    subject: 'English',
    chapter: 'Tenses in Action',
    topicLabel: 'Past, Present & Future Tense',
    title: 'Time Machine Verbs',
    icon: '⏳',
    type: 'bins',
    bins: [
      { id: 'past', icon: '⏪', label: 'Past', sub: 'already happened' },
      { id: 'pres', icon: '▶️', label: 'Present', sub: 'happening now' },
      { id: 'fut', icon: '⏩', label: 'Future', sub: 'will happen' },
    ],
    items: [
      { t: 'Walked', bin: 'past' },
      { t: 'Ate', bin: 'past' },
      { t: 'Played', bin: 'past' },
      { t: 'Reads', bin: 'pres' },
      { t: 'Is singing', bin: 'pres' },
      { t: 'Writes', bin: 'pres' },
      { t: 'Will go', bin: 'fut' },
      { t: 'Shall win', bin: 'fut' },
      { t: 'Will travel', bin: 'fut' },
    ],
    ideas: [
      ['⏪', 'Past tense often uses -ed or irregular forms (ate, went)'],
      ['⏩', 'Future tense uses will / shall + base verb'],
    ],
  },
  {
    id: 'c4-landforms-pairs',
    cls: 4,
    subject: 'Social Science',
    chapter: 'Landforms of India',
    topicLabel: 'India Physical Features',
    title: 'India Landforms Match',
    icon: '🗺️',
    type: 'pairs',
    pairs: [
      [{ e: '🏔️', n: 'Himalayas' }, { e: '❄️', n: 'Northern Mountains' }],
      [{ e: '🏜️', n: 'Thar' }, { e: '🐪', n: 'Great Indian Desert' }],
      [{ e: '🌾', n: 'Ganga Plains' }, { e: '🚜', n: 'Fertile Flat Land' }],
      [{ e: '⛰️', n: 'Deccan Plateau' }, { e: '🪨', n: 'Tableland in South' }],
      [{ e: '🏝️', n: 'Andaman & Lakshadweep' }, { e: '🌊', n: 'Island Groups' }],
    ],
    ideas: [
      ['🏔️', 'Himalayas guard the north of India'],
      ['🌾', 'River plains grow most of our food crops'],
    ],
  },

  /* ================= CLASS 5 ================= */
  {
    id: 'c5-prime-sort',
    cls: 5,
    subject: 'Maths',
    chapter: 'Be My Multiple, I’ll be Your Factor',
    topicLabel: 'Prime vs Composite Numbers',
    title: 'Prime Number Vault',
    icon: '🔐',
    type: 'bins',
    bins: [
      { id: 'p', icon: '💎', label: 'Prime', sub: 'exactly 2 factors (1 & itself)' },
      { id: 'c', icon: '🧱', label: 'Composite', sub: 'more than 2 factors' },
    ],
    items: [
      { t: '2', bin: 'p', tip: 'only even prime!' },
      { t: '3', bin: 'p' },
      { t: '7', bin: 'p' },
      { t: '11', bin: 'p' },
      { t: '17', bin: 'p' },
      { t: '23', bin: 'p' },
      { t: '9', bin: 'c', tip: '3 × 3 = 9' },
      { t: '12', bin: 'c', tip: 'factors: 1,2,3,4,6,12' },
      { t: '15', bin: 'c', tip: '3 × 5 = 15' },
      { t: '21', bin: 'c', tip: '3 × 7 = 21' },
    ],
    ideas: [
      ['💎', '2 is the smallest and only even prime number'],
      ['⚠️', '1 is neither prime nor composite'],
      ['🧱', 'Odd numbers like 9, 15, 21 are composite!'],
    ],
  },
  {
    id: 'c5-metric-ladder',
    cls: 5,
    subject: 'Maths',
    chapter: 'Length, Mass & Capacity',
    topicLabel: 'Metric Length Ladder',
    title: 'Metric Units Ladder',
    icon: '📏',
    type: 'sequence',
    prompt: 'Order length units from SMALLEST to LARGEST',
    hint: 'Millimetre first → Kilometre last',
    headIcon: '📏',
    items: [
      { e: '🐜', n: 'Millimetre (mm)', sub: 'thickness of a coin' },
      { e: '📎', n: 'Centimetre (cm)', sub: '10 mm' },
      { e: '📐', n: 'Decimetre (dm)', sub: '10 cm' },
      { e: '🚪', n: 'Metre (m)', sub: '100 cm' },
      { e: '🛣️', n: 'Kilometre (km)', sub: '1000 m' },
    ],
    reveal: { icon: '🔟', title: 'Base-10 Metric Steps', text: '1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm.' },
    ideas: [
      ['📏', '10 mm = 1 cm · 100 cm = 1 m'],
      ['🛣️', '1000 m = 1 km (road distance)'],
    ],
  },
  {
    id: 'c5-seed-chain',
    cls: 5,
    subject: 'EVS',
    chapter: 'Seeds and Seeds',
    topicLabel: 'Seed Germination Stages',
    title: 'From Seed to Fruit',
    icon: '🌱',
    type: 'sequence',
    prompt: 'How does a tiny seed become a fruit-bearing plant?',
    hint: 'Order the plant life stages',
    headIcon: '🌱',
    items: [
      { e: '🫘', n: 'Dry Seed', sub: 'soaks water & swells' },
      { e: '🌱', n: 'Sprout / Seedling', sub: 'root down, shoot up' },
      { e: '🪴', n: 'Young Plant', sub: 'green leaves make food' },
      { e: '🌸', n: 'Flowering', sub: 'pollination happens' },
      { e: '🍎', n: 'Fruit with Seeds', sub: 'new cycle begins' },
    ],
    reveal: { icon: '☀️', title: 'Needs for Germination', text: 'Seeds need Water, Air (oxygen) and right Warmth to sprout.' },
    ideas: [
      ['💧', 'Germination needs water + air + warmth'],
      ['🌬️', 'Seeds disperse by wind, water, animals & bursting'],
    ],
  },
  {
    id: 'c5-seed-dispersal',
    cls: 5,
    subject: 'EVS',
    chapter: 'Seeds and Seeds',
    topicLabel: 'Agents of Seed Dispersal',
    title: 'How Seeds Travel',
    icon: '🌬️',
    type: 'bins',
    bins: [
      { id: 'wind', icon: '🌬️', label: 'Wind', sub: 'light & winged' },
      { id: 'water', icon: '🌊', label: 'Water', sub: 'floats easily' },
      { id: 'anim', icon: '🐿️', label: 'Animals', sub: 'hooks or sweet fruit' },
    ],
    items: [
      { e: '🌼', n: 'Dandelion', bin: 'wind' },
      { e: '☁️', n: 'Cotton Seed', bin: 'wind' },
      { e: '🍁', n: 'Maple Wing', bin: 'wind' },
      { e: '🥥', n: 'Coconut', bin: 'water', tip: 'fibrous husk floats' },
      { e: '🪷', n: 'Lotus Seed', bin: 'water' },
      { e: '🥭', n: 'Mango', bin: 'anim' },
      { e: '🫐', n: 'Berries', bin: 'anim' },
      { e: '🪝', n: 'Xanthium Burr', bin: 'anim', tip: 'hooks stick to fur' },
    ],
    ideas: [
      ['🌬️', 'Light hairy seeds fly with wind'],
      ['🥥', 'Coconut floats across seas by water'],
      ['🐿️', 'Animals eat fruits or carry hooked burrs'],
    ],
  },
  {
    id: 'c5-english-grammar',
    cls: 5,
    subject: 'English',
    chapter: 'Parts of Speech Builder',
    topicLabel: 'Pronouns, Prepositions & Conjunctions',
    title: 'Sentence Glue Sorter',
    icon: '🧩',
    type: 'bins',
    bins: [
      { id: 'pro', icon: '👤', label: 'Pronoun', sub: 'replaces a noun' },
      { id: 'prep', icon: '📍', label: 'Preposition', sub: 'shows position/time' },
      { id: 'conj', icon: '🔗', label: 'Conjunction', sub: 'joins clauses' },
    ],
    items: [
      { t: 'They', bin: 'pro' },
      { t: 'Herself', bin: 'pro' },
      { t: 'Ours', bin: 'pro' },
      { t: 'Under', bin: 'prep' },
      { t: 'Between', bin: 'prep' },
      { t: 'Across', bin: 'prep' },
      { t: 'Because', bin: 'conj' },
      { t: 'Although', bin: 'conj' },
      { t: 'And / But', bin: 'conj' },
    ],
    ideas: [
      ['👤', 'Pronouns avoid repeating nouns (he, she, they)'],
      ['📍', 'Prepositions tell where or when (on, under, before)'],
      ['🔗', 'Conjunctions join words or sentences (and, but, because)'],
    ],
  },
  {
    id: 'c5-world-geography',
    cls: 5,
    subject: 'Social Science',
    chapter: 'Continents & Oceans',
    topicLabel: 'Earth’s Continents & Oceans',
    title: 'Globe Explorer Match',
    icon: '🌍',
    type: 'pairs',
    pairs: [
      [{ e: '🌏', n: 'Asia' }, { e: '🏆', n: 'Largest Continent' }],
      [{ e: '🦘', n: 'Australia' }, { e: '🏝️', n: 'Smallest Continent' }],
      [{ e: '🐧', n: 'Antarctica' }, { e: '❄️', n: 'Frozen South Pole' }],
      [{ e: '🌊', n: 'Pacific Ocean' }, { e: '🌍', n: 'Largest & Deepest Ocean' }],
      [{ e: '🇮🇳', n: 'Indian Ocean' }, { e: '🧭', n: 'Named after India' }],
      [{ e: '🦒', n: 'Africa' }, { e: '🏜️', n: 'Sahara & Nile River' }],
    ],
    ideas: [
      ['🌍', '7 Continents & 5 Oceans cover our planet'],
      ['🌊', 'About 71% of Earth’s surface is covered with water'],
    ],
  },

  /* ================= CLASS 6 (All 5 attached + full-chapter companions!) ================= */
  {
    id: 'c6-food-plate',
    cls: 6,
    subject: 'Science',
    chapter: 'Components of Food',
    topicLabel: 'Nutrient-Rich Food Groups',
    title: 'Build the Plate',
    icon: '🍽️',
    type: 'platter',
    tagNames: {
      carb: 'Carbohydrate',
      protein: 'Protein',
      fat: 'Fat',
      vit: 'Vitamins & Minerals',
    },
    items: [
      { e: '🍚', n: 'Rice', tags: ['carb'] },
      { e: '🍞', n: 'Bread', tags: ['carb'] },
      { e: '🥔', n: 'Potato', tags: ['carb'] },
      { e: '🌽', n: 'Maize', tags: ['carb'] },
      { e: '🫓', n: 'Roti', tags: ['carb'] },
      { e: '🍯', n: 'Honey', tags: ['carb'] },
      { e: '🍌', n: 'Banana', tags: ['carb'], also: ['vit'] },
      { e: '🥚', n: 'Egg', tags: ['protein'], also: ['fat'] },
      { e: '🐟', n: 'Fish', tags: ['protein'] },
      { e: '🫘', n: 'Rajma', tags: ['protein'] },
      { e: '🍗', n: 'Chicken', tags: ['protein'] },
      { e: '🥛', n: 'Milk', tags: ['protein'], also: ['fat', 'vit'] },
      { e: '🧀', n: 'Paneer', tags: ['protein'], also: ['fat'] },
      { e: '🧈', n: 'Butter', tags: ['fat'] },
      { e: '🥥', n: 'Coconut', tags: ['fat'] },
      { e: '🫒', n: 'Oil', tags: ['fat'] },
      { e: '🥜', n: 'Peanuts', tags: ['fat', 'protein'] },
      { e: '🍊', n: 'Orange', tags: ['vit'] },
      { e: '🥕', n: 'Carrot', tags: ['vit'] },
      { e: '🥬', n: 'Spinach', tags: ['vit'] },
      { e: '🍅', n: 'Tomato', tags: ['vit'] },
      { e: '🍎', n: 'Apple', tags: ['vit'] },
      { e: '🍋', n: 'Lemon', tags: ['vit'] },
    ],
    rounds: [
      {
        tag: 'carb',
        icon: '⚡',
        label: 'Carbohydrates',
        hint: 'Fill the plate · energy foods',
        idea: 'Quick energy. Starch + sugar.',
      },
      {
        tag: 'protein',
        icon: '💪',
        label: 'Proteins',
        hint: 'Fill the plate · body-builders',
        idea: 'Build & repair the body.',
      },
      {
        tag: 'fat',
        icon: '🔋',
        label: 'Fats',
        hint: 'Fill the plate · energy store',
        idea: 'More energy than carbs. Stored for later.',
      },
      {
        tag: 'vit',
        icon: '🛡️',
        label: 'Vitamins & Minerals',
        hint: 'Fill the plate · protectors',
        idea: 'Protect us from diseases.',
      },
    ],
    ideas: [
      ['⚡', 'Carbs → energy'],
      ['💪', 'Protein → growth & repair'],
      ['🔋', 'Fats → stored energy'],
      ['🛡️', 'Vitamins & minerals → protection'],
      ['🥗', 'Balanced diet = all of them + water + roughage'],
    ],
  },
  {
    id: 'c6-deficiency',
    cls: 6,
    subject: 'Science',
    chapter: 'Components of Food',
    topicLabel: 'Deficiency Diseases',
    title: 'Missing Nutrient',
    icon: '🩺',
    type: 'pairs',
    pairs: [
      [{ e: '🥕', n: 'Vitamin A' }, { e: '👁️', n: 'Poor eyesight' }],
      [{ e: '🍊', n: 'Vitamin C' }, { e: '🦷', n: 'Scurvy · bleeding gums' }],
      [{ e: '☀️', n: 'Vitamin D' }, { e: '🦴', n: 'Rickets · soft bones' }],
      [{ e: '🍚', n: 'Vitamin B1' }, { e: '🦵', n: 'Beriberi · weak muscles' }],
      [{ e: '🧂', n: 'Iodine' }, { e: '🧣', n: 'Goitre · swollen neck' }],
      [{ e: '🥬', n: 'Iron' }, { e: '🩸', n: 'Anaemia · tiredness' }],
    ],
    ideas: [
      ['🥕', 'A → eyes'],
      ['🍊', 'C → gums'],
      ['☀️', 'D → bones'],
      ['🧂', 'Iodine → thyroid'],
      ['🥬', 'Iron → blood'],
    ],
  },
  {
    id: 'c6-food-tests',
    cls: 6,
    subject: 'Science',
    chapter: 'Components of Food',
    topicLabel: 'Lab Tests for Starch, Protein & Fat',
    title: 'Food Test Lab',
    icon: '🧪',
    type: 'bins',
    bins: [
      { id: 'starch', icon: '🫐', label: 'Starch Test', sub: 'Iodine → blue-black' },
      { id: 'prot', icon: '🟣', label: 'Protein Test', sub: 'CuSO₄ + NaOH → violet' },
      { id: 'fat', icon: '📄', label: 'Fat Test', sub: 'Oily patch on paper' },
    ],
    items: [
      { e: '🥔', n: 'Boiled Potato turns blue-black', bin: 'starch', tip: 'iodine detects starch' },
      { e: '🍚', n: 'Cooked Rice + Iodine', bin: 'starch' },
      { e: '🍞', n: 'Bread slice turns blue-black', bin: 'starch' },
      { e: '🥚', n: 'Egg white turns violet', bin: 'prot', tip: 'copper sulphate + caustic soda' },
      { e: '🫘', n: 'Crushed Dal turns violet', bin: 'prot' },
      { e: '🥛', n: 'Milk sample turns violet', bin: 'prot' },
      { e: '🥜', n: 'Crushed Peanuts leave translucent patch', bin: 'fat' },
      { e: '🧈', n: 'Butter makes paper oily', bin: 'fat' },
      { e: '🥥', n: 'Dry Coconut leaves grease spot', bin: 'fat' },
    ],
    ideas: [
      ['🫐', 'Iodine + Starch → Blue-Black'],
      ['🟣', 'CuSO₄ + Caustic Soda + Protein → Violet'],
      ['📄', 'Fats leave an oily translucent patch on paper'],
    ],
  },
  {
    id: 'c6-odd',
    cls: 6,
    subject: 'Science',
    chapter: 'Living World & Materials',
    topicLabel: 'Habitats, Food Habits & Matter',
    title: 'Odd One Out',
    icon: '🎯',
    type: 'odd',
    rounds: [
      { items: [['🌵', 'Cactus'], ['🐪', 'Camel'], ['🦎', 'Lizard'], ['🐧', 'Penguin']], odd: 3, why: '🐧 lives in cold · others are desert-adapted' },
      { items: [['🥕', 'Carrot'], ['🥔', 'Potato'], ['🧅', 'Onion'], ['🍎', 'Apple']], odd: 3, why: '🍎 grows above ground · others underground' },
      { items: [['🐄', 'Cow'], ['🐐', 'Goat'], ['🦁', 'Lion'], ['🐇', 'Rabbit']], odd: 2, why: '🦁 is a carnivore · others are herbivores' },
      { items: [['🐝', 'Bee'], ['🦋', 'Butterfly'], ['🕷️', 'Spider'], ['🐜', 'Ant']], odd: 2, why: '🕷️ has 8 legs · insects have 6' },
      { items: [['🪨', 'Stone'], ['🧊', 'Ice'], ['💧', 'Water'], ['🪵', 'Wood']], odd: 2, why: '💧 is liquid · others are solids' },
      { items: [['🪟', 'Glass'], ['💧', 'Water'], ['🧱', 'Brick'], ['🌫️', 'Air']], odd: 2, why: '🧱 is opaque · others let light through' },
    ],
    ideas: [
      ['🏜️', 'Adaptation fits habitat'],
      ['🥕', 'We eat roots, stems, leaves, fruits'],
      ['🦗', 'Insects = 6 legs'],
      ['🔦', 'Transparent · translucent · opaque'],
    ],
  },
  {
    id: 'c6-materials-light',
    cls: 6,
    subject: 'Science',
    chapter: 'Living World & Materials',
    topicLabel: 'Transparent, Translucent & Opaque',
    title: 'Light Pass-Through',
    icon: '🔦',
    type: 'bins',
    bins: [
      { id: 'tr', icon: '🪟', label: 'Transparent', sub: 'all light passes' },
      { id: 'tl', icon: '🧴', label: 'Translucent', sub: 'blurry light passes' },
      { id: 'op', icon: '🧱', label: 'Opaque', sub: 'blocks light · shadow' },
    ],
    items: [
      { e: '🪟', n: 'Clear Glass', bin: 'tr' },
      { e: '💧', n: 'Clean Water', bin: 'tr' },
      { e: '🌬️', n: 'Air', bin: 'tr' },
      { e: '🧈', n: 'Butter Paper', bin: 'tl' },
      { e: '🧊', n: 'Frosted Glass', bin: 'tl' },
      { e: '🌫️', n: 'Thin Fog', bin: 'tl' },
      { e: '🧱', n: 'Brick Wall', bin: 'op' },
      { e: '🪵', n: 'Wooden Door', bin: 'op' },
      { e: '📘', n: 'Cardboard Book', bin: 'op' },
    ],
    ideas: [
      ['🪟', 'Transparent → clear view through'],
      ['🧈', 'Translucent → partial blurred light'],
      ['🧱', 'Opaque objects cast sharp dark shadows'],
    ],
  },
  {
    id: 'c6-fractions',
    cls: 6,
    subject: 'Maths',
    chapter: 'Fractions',
    topicLabel: 'Compare Fractions with ½',
    title: 'Pizza Fractions',
    icon: '🍕',
    type: 'bins',
    showNames: false,
    bins: [
      { id: 'lt', icon: '🍕', iconSvgHtml: pieSvg(1, 4, '#94A3B8'), label: 'Less than ½' },
      { id: 'eq', icon: '🍕', iconSvgHtml: pieSvg(1, 2, '#94A3B8'), label: 'Equal to ½' },
      { id: 'gt', icon: '🍕', iconSvgHtml: pieSvg(3, 4, '#94A3B8'), label: 'More than ½' },
    ],
    items: [
      { svgHtml: pieSvg(1, 4), n: '1/4', bin: 'lt' },
      { svgHtml: pieSvg(2, 4), n: '2/4', bin: 'eq' },
      { svgHtml: pieSvg(3, 4), n: '3/4', bin: 'gt' },
      { svgHtml: pieSvg(1, 3), n: '1/3', bin: 'lt' },
      { svgHtml: pieSvg(2, 3), n: '2/3', bin: 'gt' },
      { svgHtml: pieSvg(3, 6), n: '3/6', bin: 'eq' },
      { svgHtml: pieSvg(1, 8), n: '1/8', bin: 'lt' },
      { svgHtml: pieSvg(5, 8), n: '5/8', bin: 'gt' },
      { svgHtml: pieSvg(4, 8), n: '4/8', bin: 'eq' },
      { svgHtml: pieSvg(2, 5), n: '2/5', bin: 'lt' },
      { svgHtml: pieSvg(3, 5), n: '3/5', bin: 'gt' },
      { svgHtml: pieSvg(5, 6), n: '5/6', bin: 'gt' },
    ],
    ideas: [
      ['🍕', 'Half = numerator is half the denominator'],
      ['⚖️', '2/4 = 3/6 = 4/8 = ½ (equivalent)'],
      ['🔍', 'More slices eaten than left → more than ½'],
    ],
  },
  {
    id: 'c6-equiv-fractions',
    cls: 6,
    subject: 'Maths',
    chapter: 'Fractions',
    topicLabel: 'Equivalent & Simplified Fractions',
    title: 'Equivalent Fraction Pairs',
    icon: '⚖️',
    type: 'pairs',
    pairs: [
      [{ t: '1/2' }, { t: '4/8' }],
      [{ t: '2/3' }, { t: '4/6' }],
      [{ t: '3/4' }, { t: '6/8' }],
      [{ t: '1/3' }, { t: '3/9' }],
      [{ t: '2/5' }, { t: '4/10' }],
      [{ t: '3/5' }, { t: '6/10' }],
    ],
    ideas: [
      ['⚖️', 'Multiply top & bottom by the same number → equivalent fraction'],
      ['✂️', 'Divide by HCF to get the simplest form'],
    ],
  },
  {
    id: 'c6-pos',
    cls: 6,
    subject: 'English',
    chapter: 'Grammar',
    topicLabel: 'Nouns, Verbs & Adjectives',
    title: 'Word Sorter',
    icon: '🔤',
    type: 'bins',
    bins: [
      { id: 'n', icon: '🏷️', label: 'Noun', sub: 'naming word' },
      { id: 'v', icon: '🏃', label: 'Verb', sub: 'action word' },
      { id: 'a', icon: '🎨', label: 'Adjective', sub: 'describing word' },
    ],
    items: [
      { t: 'Kite', bin: 'n' },
      { t: 'River', bin: 'n' },
      { t: 'Teacher', bin: 'n' },
      { t: 'Delhi', bin: 'n' },
      { t: 'Run', bin: 'v' },
      { t: 'Write', bin: 'v' },
      { t: 'Sing', bin: 'v' },
      { t: 'Jump', bin: 'v' },
      { t: 'Happy', bin: 'a' },
      { t: 'Tall', bin: 'a' },
      { t: 'Bright', bin: 'a' },
      { t: 'Soft', bin: 'a' },
    ],
    ideas: [
      ['🏷️', 'Noun → person, place, thing'],
      ['🏃', 'Verb → what is done'],
      ['🎨', 'Adjective → what kind'],
    ],
  },
  {
    id: 'c6-solar-system',
    cls: 6,
    subject: 'Social Science',
    chapter: 'The Earth in the Solar System',
    topicLabel: 'Planets in Order from Sun',
    title: 'Solar System Order',
    icon: '🪐',
    type: 'sequence',
    prompt: 'Order the planets from closest to farthest from the Sun',
    hint: 'My Very Efficient Mother Just Served Us Nuts',
    headIcon: '☀️',
    items: [
      { e: '🪨', n: 'Mercury', sub: 'closest · smallest' },
      { e: '🌕', n: 'Venus', sub: 'hottest · Earth twin' },
      { e: '🌍', n: 'Earth', sub: 'blue planet · life' },
      { e: '🔴', n: 'Mars', sub: 'red planet' },
      { e: '🟠', n: 'Jupiter', sub: 'largest planet' },
      { e: '🪐', n: 'Saturn', sub: 'famous icy rings' },
    ],
    reveal: { icon: '🌌', title: 'Inner & Outer Planets', text: 'Mercury–Mars are rocky inner planets; Jupiter–Neptune are giant outer planets.' },
    ideas: [
      ['🌍', 'Earth is the 3rd planet from the Sun'],
      ['🟠', 'Jupiter is the largest · Saturn has bright rings'],
      ['☄️', 'Asteroid belt lies between Mars and Jupiter'],
    ],
  },
  {
    id: 'c6-hindi-vyakaran',
    cls: 6,
    subject: 'Hindi',
    chapter: 'व्याकरण: शब्द भेद',
    topicLabel: 'संज्ञा, सर्वनाम और क्रिया',
    title: 'शब्द पहचानो',
    icon: '🪶',
    type: 'bins',
    bins: [
      { id: 'sangya', icon: '🏷️', label: 'संज्ञा', sub: 'नाम शब्द' },
      { id: 'sarv', icon: '👤', label: 'सर्वनाम', sub: 'संज्ञा के स्थान पर' },
      { id: 'kriya', icon: '🏃', label: 'क्रिया', sub: 'काम का होना' },
    ],
    items: [
      { t: 'हिमालय', bin: 'sangya' },
      { t: 'किताब', bin: 'sangya' },
      { t: 'गंगा', bin: 'sangya' },
      { t: 'वह', bin: 'sarv' },
      { t: 'हम', bin: 'sarv' },
      { t: 'तुम', bin: 'sarv' },
      { t: 'पढ़ना', bin: 'kriya' },
      { t: 'खेलना', bin: 'kriya' },
      { t: 'लिखना', bin: 'kriya' },
    ],
    ideas: [
      ['🏷️', 'संज्ञा → व्यक्ति, वस्तु, स्थान या भाव का नाम'],
      ['👤', 'सर्वनाम → संज्ञा के बदले प्रयुक्त शब्द (मैं, तुम, वह)'],
      ['🏃', 'क्रिया → किसी कार्य के करने या होने का बोध'],
    ],
  },
  {
    id: 'c6-ipo-computer',
    cls: 6,
    subject: 'Computer Science',
    chapter: 'Computer Systems & IPO Cycle',
    topicLabel: 'Input, Processing & Output Devices',
    title: 'Input or Output?',
    icon: '💻',
    type: 'bins',
    bins: [
      { id: 'in', icon: '⌨️', label: 'Input', sub: 'sends data in' },
      { id: 'proc', icon: '🧠', label: 'Processing', sub: 'thinks & computes' },
      { id: 'out', icon: '🖥️', label: 'Output', sub: 'shows result' },
    ],
    items: [
      { e: '⌨️', n: 'Keyboard', bin: 'in' },
      { e: '🖱️', n: 'Mouse', bin: 'in' },
      { e: '🎤', n: 'Microphone', bin: 'in' },
      { e: '📷', n: 'Scanner', bin: 'in' },
      { e: '🧠', n: 'CPU', bin: 'proc' },
      { e: '⚡', n: 'ALU & Control Unit', bin: 'proc' },
      { e: '🖥️', n: 'Monitor', bin: 'out' },
      { e: '🖨️', n: 'Printer', bin: 'out' },
      { e: '🔊', n: 'Speakers', bin: 'out' },
    ],
    ideas: [
      ['⌨️', 'Input → gives commands & data'],
      ['🧠', 'CPU processes data using ALU + CU'],
      ['🖥️', 'Output → displays or prints information'],
    ],
  },

  /* ================= CLASS 7 (All 3 attached + full chapter & multi-subject expansion) ================= */
  {
    id: 'c7-digestion',
    cls: 7,
    subject: 'Science',
    chapter: 'Nutrition in Animals',
    topicLabel: 'Human Digestive Pathway',
    title: "Food's Journey",
    icon: '🍎',
    type: 'sequence',
    prompt: 'Where does food go?',
    hint: 'Tap or drag in order · start → end',
    headIcon: '🍎',
    items: [
      { e: '👄', n: 'Mouth', sub: 'chew + saliva' },
      { e: '⬇️', n: 'Food pipe', sub: 'push down' },
      { e: '🧪', n: 'Stomach', sub: 'acid + juices' },
      { e: '🌀', n: 'Small intestine', sub: 'absorbs food' },
      { e: '💧', n: 'Large intestine', sub: 'absorbs water' },
      { e: '🚪', n: 'Anus', sub: 'waste out' },
    ],
    reveal: {
      icon: '🌀',
      title: 'Digestive tract',
      text: 'Most digestion + absorption happens in the small intestine.',
    },
    ideas: [
      ['👄', 'Saliva starts starch digestion'],
      ['🧪', 'Stomach acid kills germs'],
      ['🌀', 'Villi absorb nutrients'],
      ['💧', 'Large intestine takes water back'],
    ],
  },
  {
    id: 'c7-digestion-pairs',
    cls: 7,
    subject: 'Science',
    chapter: 'Nutrition in Animals',
    topicLabel: 'Organs & Digestive Juices',
    title: 'Digestive Helpers Match',
    icon: '🧬',
    type: 'pairs',
    pairs: [
      [{ e: '👄', n: 'Saliva' }, { e: '🍚', n: 'Breaks starch to sugar' }],
      [{ e: '🫁', n: 'Liver (Bile)' }, { e: '🧈', n: 'Digests fats' }],
      [{ e: '🧪', n: 'Stomach HCl' }, { e: '🦠', n: 'Kills bacteria' }],
      [{ e: '🌀', n: 'Villi' }, { e: '⬆️', n: 'Increases absorption area' }],
      [{ e: '🐄', n: 'Rumen' }, { e: '🌿', n: 'Digests cellulose in cows' }],
      [{ e: '🧫', n: 'Pseudopodia' }, { e: '🦠', n: 'Amoeba catches food' }],
    ],
    ideas: [
      ['🫁', 'Liver is the largest gland; bile is stored in gall bladder'],
      ['🌀', 'Finger-like villi absorb digested nutrients into blood'],
    ],
  },
  {
    id: 'c7-acid-base',
    cls: 7,
    subject: 'Science',
    chapter: 'Acids, Bases & Salts',
    topicLabel: 'Litmus Test Classification',
    title: 'Litmus Lab',
    icon: '🧪',
    type: 'bins',
    bins: [
      { id: 'a', icon: '🔴', label: 'Acidic', sub: 'blue litmus → red' },
      { id: 'b', icon: '🔵', label: 'Basic', sub: 'red litmus → blue' },
      { id: 'n', icon: '⚪', label: 'Neutral', sub: 'no change' },
    ],
    items: [
      { e: '🍋', n: 'Lemon juice', bin: 'a' },
      { e: '🍶', n: 'Vinegar', bin: 'a' },
      { e: '🍊', n: 'Orange juice', bin: 'a' },
      { e: '🥣', n: 'Curd', bin: 'a' },
      { e: '🧼', n: 'Soap solution', bin: 'b' },
      { e: '🪥', n: 'Toothpaste', bin: 'b' },
      { e: '💊', n: 'Antacid', bin: 'b' },
      { e: '🥛', n: 'Lime water', bin: 'b' },
      { e: '💧', n: 'Pure water', bin: 'n' },
      { e: '🧂', n: 'Salt solution', bin: 'n' },
      { e: '🍬', n: 'Sugar solution', bin: 'n' },
    ],
    ideas: [
      ['🍋', 'Sour taste → acid'],
      ['🧼', 'Soapy feel → base'],
      ['🔴', 'Acid turns blue litmus red'],
      ['🤝', 'Acid + base → salt + water (neutralisation)'],
    ],
  },
  {
    id: 'c7-acid-sources',
    cls: 7,
    subject: 'Science',
    chapter: 'Acids, Bases & Salts',
    topicLabel: 'Natural Acid Sources',
    title: 'Which Acid Is Inside?',
    icon: '🍋',
    type: 'pairs',
    pairs: [
      [{ e: '🍶', n: 'Vinegar' }, { e: '🧪', n: 'Acetic acid' }],
      [{ e: '🐜', n: 'Ant sting' }, { e: '🧪', n: 'Formic acid' }],
      [{ e: '🍋', n: 'Lemon & Orange' }, { e: '🧪', n: 'Citric acid' }],
      [{ e: '🥣', n: 'Curd' }, { e: '🧪', n: 'Lactic acid' }],
      [{ e: '🥬', n: 'Spinach' }, { e: '🧪', n: 'Oxalic acid' }],
      [{ e: '🍇', n: 'Tamarind & Grapes' }, { e: '🧪', n: 'Tartaric acid' }],
    ],
    ideas: [
      ['🐜', 'Baking soda neutralises formic acid in ant stings'],
      ['🌼', 'Turmeric turns reddish-brown with a base!'],
    ],
  },
  {
    id: 'c7-heat',
    cls: 7,
    subject: 'Science',
    chapter: 'Heat',
    topicLabel: 'Conduction, Convection & Radiation',
    title: 'Heat on the Move',
    icon: '🔥',
    type: 'bins',
    bins: [
      { id: 'cd', icon: '🥄', label: 'Conduction', sub: 'by touch' },
      { id: 'cv', icon: '🌊', label: 'Convection', sub: 'by flow' },
      { id: 'rd', icon: '☀️', label: 'Radiation', sub: 'by rays' },
    ],
    items: [
      { e: '🍳', n: 'Pan handle gets hot', bin: 'cd' },
      { e: '🥄', n: 'Spoon in hot tea', bin: 'cd' },
      { e: '🧊', n: 'Ice melts in hand', bin: 'cd' },
      { e: '🌬️', n: 'Sea breeze', bin: 'cv' },
      { e: '🫧', n: 'Boiling water swirls', bin: 'cv' },
      { e: '🎈', n: 'Hot air rises up', bin: 'cv' },
      { e: '🌍', n: 'Sun warms Earth', bin: 'rd' },
      { e: '🔥', n: 'Warmth near bonfire', bin: 'rd' },
      { e: '👕', n: 'Dark shirt feels hotter', bin: 'rd' },
    ],
    ideas: [
      ['🥄', 'Solids → conduction'],
      ['🌊', 'Liquids & gases → convection'],
      ['☀️', 'No medium needed → radiation'],
    ],
  },
  {
    id: 'c7-integers',
    cls: 7,
    subject: 'Maths',
    chapter: 'Integers',
    topicLabel: 'Product Sign Rules',
    title: 'Sign of the Answer',
    icon: '➕',
    type: 'bins',
    bins: [
      { id: 'pos', icon: '➕', label: 'Positive (+)', sub: 'same signs' },
      { id: 'neg', icon: '➖', label: 'Negative (−)', sub: 'opposite signs' },
      { id: 'zero', icon: '0️⃣', label: 'Zero (0)', sub: 'times zero' },
    ],
    items: [
      { t: '(−4) × (−5)', bin: 'pos', tip: '− × − = +20' },
      { t: '(+6) × (+3)', bin: 'pos' },
      { t: '(−18) ÷ (−3)', bin: 'pos', tip: '= +6' },
      { t: '(−7) × (+4)', bin: 'neg', tip: '= −28' },
      { t: '(+9) × (−2)', bin: 'neg' },
      { t: '(−24) ÷ (+6)', bin: 'neg', tip: '= −4' },
      { t: '(−12) × 0', bin: 'zero' },
      { t: '0 ÷ (−5)', bin: 'zero' },
    ],
    ideas: [
      ['➕', 'Same signs multiply/divide to POSITIVE'],
      ['➖', 'Different signs multiply/divide to NEGATIVE'],
      ['0️⃣', 'Anything multiplied by 0 equals 0'],
    ],
  },
  {
    id: 'c7-atmosphere',
    cls: 7,
    subject: 'Social Science',
    chapter: 'Air & Atmosphere',
    topicLabel: 'Layers of the Atmosphere',
    title: 'Atmosphere Climb',
    icon: '🚀',
    type: 'sequence',
    prompt: 'Stack Earth’s atmosphere from ground up to space',
    hint: 'Bottom layer (weather) → outer space layer',
    headIcon: '🌍',
    items: [
      { e: '🌧️', n: 'Troposphere', sub: 'weather & air we breathe' },
      { e: '✈️', n: 'Stratosphere', sub: 'ozone layer & jets' },
      { e: '☄️', n: 'Mesosphere', sub: 'meteors burn up' },
      { e: '📡', n: 'Thermosphere', sub: 'radio transmission' },
      { e: '🛰️', n: 'Exosphere', sub: 'merges into space' },
    ],
    reveal: { icon: '🛡️', title: 'Ozone Shield', text: 'The stratosphere contains the ozone layer that blocks harmful UV rays.' },
    ideas: [
      ['🌧️', 'Troposphere → all rain, fog & storms'],
      ['✈️', 'Stratosphere → ozone layer & smooth flying'],
      ['☄️', 'Mesosphere → burns up incoming meteors'],
    ],
  },
  {
    id: 'c7-voice-sort',
    cls: 7,
    subject: 'English',
    chapter: 'Active & Passive Voice',
    topicLabel: 'Identify Active vs Passive',
    title: 'Voice Switcher',
    icon: '🗣️',
    type: 'bins',
    bins: [
      { id: 'act', icon: '⚡', label: 'Active Voice', sub: 'subject does action' },
      { id: 'pas', icon: '🎯', label: 'Passive Voice', sub: 'action done to subject' },
    ],
    items: [
      { t: 'Riya painted the wall.', bin: 'act' },
      { t: 'The cat chased the mouse.', bin: 'act' },
      { t: 'Chef cooked pasta.', bin: 'act' },
      { t: 'The wall was painted by Riya.', bin: 'pas' },
      { t: 'The mouse was chased by the cat.', bin: 'pas' },
      { t: 'Pasta was cooked by the chef.', bin: 'pas' },
      { t: 'Homework is checked daily.', bin: 'pas' },
      { t: 'Students planted trees.', bin: 'act' },
    ],
    ideas: [
      ['⚡', 'Active: Doer → Action → Receiver'],
      ['🎯', 'Passive: Receiver + be-verb + V3 (+ by Doer)'],
    ],
  },

  /* ================= CLASS 8 (All 3 attached + full chapter & multi-subject expansion) ================= */
  {
    id: 'c8-microbes',
    cls: 8,
    subject: 'Science',
    chapter: 'Microorganisms',
    topicLabel: 'Useful vs Harmful Microbes',
    title: 'Microbe: Friend or Foe?',
    icon: '🦠',
    type: 'bins',
    bins: [
      { id: 'f', icon: '😊', label: 'Friend', sub: 'useful' },
      { id: 'x', icon: '😈', label: 'Foe', sub: 'harmful' },
    ],
    items: [
      { e: '🥣', n: 'Milk → curd', bin: 'f', tip: 'Lactobacillus' },
      { e: '🍞', n: 'Dough rises', bin: 'f', tip: 'Yeast' },
      { e: '💉', n: 'Vaccines', bin: 'f' },
      { e: '💊', n: 'Antibiotics', bin: 'f' },
      { e: '🌱', n: 'Nitrogen in soil', bin: 'f', tip: 'Rhizobium' },
      { e: '🍂', n: 'Compost', bin: 'f' },
      { e: '🦟', n: 'Malaria', bin: 'x', tip: 'Plasmodium · protozoa' },
      { e: '🤢', n: 'Food poisoning', bin: 'x' },
      { e: '🌾', n: 'Wheat rust', bin: 'x', tip: 'Fungus' },
      { e: '🤧', n: 'Common cold', bin: 'x', tip: 'Virus' },
      { e: '🐄', n: 'Anthrax', bin: 'x', tip: 'Bacteria' },
    ],
    ideas: [
      ['🦠', 'Bacteria · fungi · protozoa · algae · viruses'],
      ['🍞', 'Yeast → fermentation'],
      ['🌱', 'Rhizobium fixes nitrogen'],
      ['💉', 'Vaccines train the body'],
    ],
  },
  {
    id: 'c8-microbe-diseases',
    cls: 8,
    subject: 'Science',
    chapter: 'Microorganisms',
    topicLabel: 'Disease & Causative Microbe',
    title: 'Pathogen Match',
    icon: '🔬',
    type: 'pairs',
    pairs: [
      [{ e: '🫁', n: 'Tuberculosis' }, { e: '🦠', n: 'Bacteria (Air)' }],
      [{ e: '🦟', n: 'Malaria' }, { e: '🧫', n: 'Protozoa (Anopheles)' }],
      [{ e: '🦟', n: 'Dengue' }, { e: '🧬', n: 'Virus (Aedes)' }],
      [{ e: '🌾', n: 'Rust of Wheat' }, { e: '🍄', n: 'Fungi' }],
      [{ e: '🍋', n: 'Citrus Canker' }, { e: '🦠', n: 'Bacteria (Plants)' }],
      [{ e: '💧', n: 'Cholera' }, { e: '🦠', n: 'Bacteria (Water)' }],
    ],
    ideas: [
      ['🦟', 'Female Anopheles carries Malaria · Aedes carries Dengue'],
      ['🧊', 'Pasteurisation heats milk to 70°C then chills rapidly'],
    ],
  },
  {
    id: 'c8-crops',
    cls: 8,
    subject: 'Science',
    chapter: 'Crop Production',
    topicLabel: 'Kharif vs Rabi Crops',
    title: 'Kharif or Rabi?',
    icon: '🌾',
    type: 'bins',
    bins: [
      { id: 'k', icon: '🌧️', label: 'Kharif', sub: 'Jun–Sep · rainy' },
      { id: 'r', icon: '❄️', label: 'Rabi', sub: 'Oct–Mar · winter' },
    ],
    items: [
      { e: '🍚', n: 'Paddy', bin: 'k' },
      { e: '🌽', n: 'Maize', bin: 'k' },
      { e: '☁️', n: 'Cotton', bin: 'k' },
      { e: '🫘', n: 'Soybean', bin: 'k' },
      { e: '🥜', n: 'Groundnut', bin: 'k' },
      { e: '🌾', n: 'Wheat', bin: 'r' },
      { e: '🧆', n: 'Gram (chana)', bin: 'r' },
      { e: '🟢', n: 'Pea', bin: 'r' },
      { e: '🌼', n: 'Mustard', bin: 'r' },
      { e: '🌿', n: 'Linseed', bin: 'r' },
    ],
    ideas: [
      ['🌧️', 'Kharif → sown with monsoon'],
      ['❄️', 'Rabi → sown in winter'],
      ['🍚', 'Paddy needs lots of water'],
    ],
  },
  {
    id: 'c8-farming-steps',
    cls: 8,
    subject: 'Science',
    chapter: 'Crop Production',
    topicLabel: '7 Agricultural Practices',
    title: 'Field to Granary Chain',
    icon: '🚜',
    type: 'sequence',
    prompt: 'Order the farming practices from soil prep to storage',
    hint: 'Plough first → store grains last',
    headIcon: '🚜',
    items: [
      { e: '🚜', n: 'Preparation of Soil', sub: 'ploughing & levelling' },
      { e: '🌱', n: 'Sowing', sub: 'healthy seeds at right depth' },
      { e: '🪴', n: 'Adding Manure', sub: 'replenishes nutrients' },
      { e: '💧', n: 'Irrigation', sub: 'sprinkler / drip water' },
      { e: '🌿', n: 'Weeding', sub: 'remove unwanted plants' },
      { e: '🌾', n: 'Harvesting & Storage', sub: 'cut, thresh & store dry' },
    ],
    reveal: { icon: '💧', title: 'Smart Irrigation', text: 'Drip irrigation saves maximum water by delivering drops right at the roots.' },
    ideas: [
      ['🚜', 'Loosened soil lets roots breathe & earthworms thrive'],
      ['🌾', 'Dry grains well before storage to prevent fungus'],
    ],
  },
  {
    id: 'c8-metals',
    cls: 8,
    subject: 'Science',
    chapter: 'Metals & Non-metals',
    topicLabel: 'Metals vs Non-metals',
    title: 'Metal Detector',
    icon: '🔩',
    type: 'bins',
    bins: [
      { id: 'm', icon: '🔔', label: 'Metal', sub: 'shiny · sonorous · conducts' },
      { id: 'nm', icon: '🪨', label: 'Non-metal', sub: 'dull · brittle · insulator' },
    ],
    items: [
      { e: '🔩', n: 'Iron', bin: 'm' },
      { e: '🔌', n: 'Copper', bin: 'm' },
      { e: '🥇', n: 'Gold', bin: 'm' },
      { e: '🥈', n: 'Silver', bin: 'm' },
      { e: '🥫', n: 'Aluminium', bin: 'm' },
      { e: '🌡️', n: 'Mercury', bin: 'm', tip: 'only liquid metal' },
      { e: '🟡', n: 'Sulphur', bin: 'nm' },
      { e: '⚫', n: 'Carbon (coal)', bin: 'nm' },
      { e: '🫧', n: 'Oxygen', bin: 'nm' },
      { e: '🎈', n: 'Hydrogen', bin: 'nm' },
      { e: '🟣', n: 'Iodine', bin: 'nm' },
      { e: '💎', n: 'Diamond', bin: 'nm', tip: 'carbon · non-metal' },
    ],
    ideas: [
      ['🔔', 'Metals ring when struck'],
      ['🌡️', 'Mercury → liquid metal'],
      ['💎', 'Graphite & diamond → non-metal carbon'],
      ['🔥', 'Metal oxides basic · non-metal oxides acidic'],
    ],
  },
  {
    id: 'c8-squares-pairs',
    cls: 8,
    subject: 'Maths',
    chapter: 'Squares & Cubes',
    topicLabel: 'Perfect Squares & Roots',
    title: 'Square Root Flip',
    icon: '√',
    type: 'pairs',
    pairs: [
      [{ t: '12²' }, { t: '144' }],
      [{ t: '15²' }, { t: '225' }],
      [{ t: '13²' }, { t: '169' }],
      [{ t: '√196' }, { t: '14' }],
      [{ t: '∛27' }, { t: '3' }],
      [{ t: '∛125' }, { t: '5' }],
    ],
    ideas: [
      ['🚫', 'No perfect square ends in 2, 3, 7 or 8'],
      ['🔢', 'Sum of first n odd numbers = n²'],
    ],
  },
  {
    id: 'c8-constitution-pairs',
    cls: 8,
    subject: 'Social Science',
    chapter: 'The Indian Constitution',
    topicLabel: 'Six Fundamental Rights',
    title: 'Fundamental Rights Match',
    icon: '⚖️',
    type: 'pairs',
    pairs: [
      [{ e: '⚖️', n: 'Right to Equality' }, { e: '🤝', n: 'Equal before law' }],
      [{ e: '🕊️', n: 'Right to Freedom' }, { e: '🗣️', n: 'Speech & movement' }],
      [{ e: '🛡️', n: 'Against Exploitation' }, { e: '🚫', n: 'Bans child labour' }],
      [{ e: '🕌', n: 'Freedom of Religion' }, { e: '🙏', n: 'Practice any faith' }],
      [{ e: '📚', n: 'Cultural & Educational' }, { e: '🏫', n: 'Protect language/script' }],
      [{ e: '🏛️', n: 'Constitutional Remedies' }, { e: '📜', n: 'Move court if violated' }],
    ],
    ideas: [
      ['⚖️', 'Fundamental Rights protect citizens against arbitrary state power'],
      ['🏛️', 'Dr. B.R. Ambedkar called Constitutional Remedies the heart & soul'],
    ],
  },

  /* ================= CLASS 9 (All 3 attached + full chapter & multi-subject expansion) ================= */
  {
    id: 'c9-plant-cell',
    cls: 9,
    subject: 'Science',
    chapter: 'The Fundamental Unit of Life',
    topicLabel: 'Plant Cell Organelles Diagram',
    title: 'Label the Plant Cell',
    icon: '🔬',
    type: 'label',
    svg: SVG_PLANT_CELL,
    w: 400,
    h: 300,
    spots: [
      { x: 12, y: 150, n: 'Cell wall', e: '🧱', fn: 'rigid outer layer' },
      { x: 368, y: 105, n: 'Cell membrane', e: '🚪', fn: 'controls entry & exit' },
      { x: 95, y: 100, n: 'Nucleus', e: '🧠', fn: 'control centre · DNA' },
      { x: 235, y: 160, n: 'Vacuole', e: '💧', fn: 'stores water & sap' },
      { x: 95, y: 215, n: 'Chloroplast', e: '🌿', fn: 'makes food (photosynthesis)' },
      { x: 335, y: 236, n: 'Mitochondria', e: '🔋', fn: 'powerhouse · energy' },
      { x: 190, y: 55, n: 'Cytoplasm', e: '🫙', fn: 'jelly where reactions happen' },
    ],
    ideas: [
      ['🧱', 'Cell wall → only in plants'],
      ['🌿', 'Chloroplast → only in plants'],
      ['💧', 'Plant vacuole is big'],
      ['🔋', 'Mitochondria → energy (ATP)'],
    ],
  },
  {
    id: 'c9-cell-nicknames',
    cls: 9,
    subject: 'Science',
    chapter: 'The Fundamental Unit of Life',
    topicLabel: 'Organelle Roles & Nicknames',
    title: 'Organelle Job Match',
    icon: '🧬',
    type: 'pairs',
    pairs: [
      [{ e: '🔋', n: 'Mitochondria' }, { e: '⚡', n: 'Powerhouse (ATP)' }],
      [{ e: '🧹', n: 'Lysosome' }, { e: '💥', n: 'Suicide bag · waste cleanup' }],
      [{ e: '📦', n: 'Golgi Apparatus' }, { e: '🚚', n: 'Packages & dispatches' }],
      [{ e: '🏭', n: 'Ribosome' }, { e: '💪', n: 'Protein factory' }],
      [{ e: '🌿', n: 'Plastid / Chloroplast' }, { e: '☀️', n: 'Kitchen of plant cell' }],
      [{ e: '🧠', n: 'Nucleus' }, { e: '📜', n: 'Holds chromosomes / DNA' }],
    ],
    ideas: [
      ['🔋', 'Mitochondria & Plastids have their own DNA!'],
      ['🧹', 'Lysosomes digest worn-out cell organelles'],
    ],
  },
  {
    id: 'c9-matter',
    cls: 9,
    subject: 'Science',
    chapter: 'Matter in Our Surroundings',
    topicLabel: 'Properties of States of Matter',
    title: 'Solid · Liquid · Gas',
    icon: '🧊',
    type: 'bins',
    bins: [
      { id: 's', icon: '🧊', label: 'Solid' },
      { id: 'l', icon: '💧', label: 'Liquid' },
      { id: 'g', icon: '💨', label: 'Gas' },
    ],
    items: [
      { e: '📦', n: 'Fixed shape', bin: 's' },
      { e: '🧱', n: 'Particles tightly packed', bin: 's' },
      { e: '🪨', n: 'Stone', bin: 's' },
      { e: '🫙', n: 'Takes shape of container', bin: 'l' },
      { e: '🍯', n: 'Honey', bin: 'l' },
      { e: '🌊', n: 'Flows · fixed volume', bin: 'l' },
      { e: '🎈', n: 'Fills whole container', bin: 'g' },
      { e: '🗜️', n: 'Easily compressed', bin: 'g' },
      { e: '♨️', n: 'Steam', bin: 'g' },
      { e: '🏃', n: 'Particles far & fast', bin: 'g' },
    ],
    ideas: [
      ['🧊', 'Solid → fixed shape + volume'],
      ['💧', 'Liquid → fixed volume only'],
      ['💨', 'Gas → neither fixed'],
      ['🌡️', 'Heat ↑ → particles move faster'],
    ],
  },
  {
    id: 'c9-state-changes',
    cls: 9,
    subject: 'Science',
    chapter: 'Matter in Our Surroundings',
    topicLabel: 'Phase Transitions & Sublimation',
    title: 'Phase Change Match',
    icon: '♨️',
    type: 'pairs',
    pairs: [
      [{ e: '🧊➡️💧', n: 'Solid → Liquid' }, { e: '🔥', n: 'Fusion (Melting)' }],
      [{ e: '💧➡️💨', n: 'Liquid → Gas' }, { e: '♨️', n: 'Vaporisation' }],
      [{ e: '🧊➡️💨', n: 'Solid → Gas direct' }, { e: '✨', n: 'Sublimation (Camphor)' }],
      [{ e: '💨➡️💧', n: 'Gas → Liquid' }, { e: '🌧️', n: 'Condensation' }],
      [{ e: '💧➡️🧊', n: 'Liquid → Solid' }, { e: '❄️', n: 'Solidification' }],
      [{ e: '🌬️', n: 'Surface cooling' }, { e: '🏺', n: 'Evaporation (Matka)' }],
    ],
    ideas: [
      ['✨', 'Camphor, Naphthalene & Dry Ice sublimate directly'],
      ['🏺', 'Evaporation causes cooling (absorbs latent heat)'],
    ],
  },
  {
    id: 'c9-newton-laws',
    cls: 9,
    subject: 'Science',
    chapter: 'Force & Laws of Motion',
    topicLabel: 'Newton’s Three Laws',
    title: 'Which Newton’s Law?',
    icon: '🚀',
    type: 'bins',
    bins: [
      { id: 'l1', icon: '🛑', label: '1st Law', sub: 'Inertia' },
      { id: 'l2', icon: '⚡', label: '2nd Law', sub: 'F = ma' },
      { id: 'l3', icon: '🔁', label: '3rd Law', sub: 'Action = Reaction' },
    ],
    items: [
      { e: '🚌', n: 'Passenger leans forward on sudden brake', bin: 'l1' },
      { e: '🪙', n: 'Coin drops into glass when card flicked', bin: 'l1' },
      { e: '🏏', n: 'Fielder pulls hands back catching ball', bin: 'l2', tip: 'increases time → reduces force' },
      { e: '🚛', n: 'Heavy truck needs more force to push', bin: 'l2' },
      { e: '🚀', n: 'Rocket lifts off pushing gas down', bin: 'l3' },
      { e: '🔫', n: 'Gun recoils backward on firing', bin: 'l3' },
      { e: '🚣', n: 'Rowing pushes water back, boat moves forward', bin: 'l3' },
      { e: '🌳', n: 'Fruits fall when branch is shaken', bin: 'l1' },
    ],
    ideas: [
      ['🛑', '1st Law: Mass measures inertia'],
      ['⚡', '2nd Law: F = Δp / t = ma'],
      ['🔁', '3rd Law: Forces act on two different bodies'],
    ],
  },
  {
    id: 'c9-numbers',
    cls: 9,
    subject: 'Maths',
    chapter: 'Number Systems',
    topicLabel: 'Rational vs Irrational Numbers',
    title: 'Rational or Not?',
    icon: '♾️',
    type: 'bins',
    bins: [
      { id: 'r', icon: '➗', label: 'Rational', sub: 'p/q form' },
      { id: 'i', icon: '♾️', label: 'Irrational', sub: 'never ends · never repeats' },
    ],
    items: [
      { t: '0.75', bin: 'r' },
      { t: '1/3', bin: 'r' },
      { t: '√9', bin: 'r', tip: '√9 = 3' },
      { t: '22/7', bin: 'r', tip: '22/7 is p/q · π is not' },
      { t: '3.14', bin: 'r' },
      { t: '−4', bin: 'r' },
      { t: '0.333…', bin: 'r', tip: 'repeats → 1/3' },
      { t: '√2', bin: 'i' },
      { t: 'π', bin: 'i' },
      { t: '√5', bin: 'i' },
      { t: '0.1010010001…', bin: 'i', tip: 'no repeating block' },
      { t: '1 + √3', bin: 'i' },
    ],
    ideas: [
      ['➗', 'Rational → p/q, q ≠ 0'],
      ['🔁', 'Terminating or repeating → rational'],
      ['♾️', '√2, √3, π → irrational'],
      ['⚠️', '22/7 ≈ π, but not equal'],
    ],
  },
  {
    id: 'c9-polynomials',
    cls: 9,
    subject: 'Maths',
    chapter: 'Polynomials',
    topicLabel: 'Linear, Quadratic & Cubic',
    title: 'Polynomial Degree Sort',
    icon: '📈',
    type: 'bins',
    bins: [
      { id: 'lin', icon: '📏', label: 'Linear', sub: 'degree 1' },
      { id: 'quad', icon: '🧲', label: 'Quadratic', sub: 'degree 2' },
      { id: 'cub', icon: '🧊', label: 'Cubic', sub: 'degree 3' },
    ],
    items: [
      { t: '3x + 5', bin: 'lin' },
      { t: 'y − 7', bin: 'lin' },
      { t: 'x² + 4x + 1', bin: 'quad' },
      { t: '5t² − 9', bin: 'quad' },
      { t: 'p³ − 2p + 8', bin: 'cub' },
      { t: '4x³', bin: 'cub' },
      { t: '2x − 1', bin: 'lin' },
      { t: 'x² − 16', bin: 'quad' },
    ],
    ideas: [
      ['📏', 'Degree = highest power of variable'],
      ['🧲', 'Quadratic has at most 2 zeroes; Cubic at most 3'],
    ],
  },
  {
    id: 'c9-french-rev',
    cls: 9,
    subject: 'Social Science',
    chapter: 'The French Revolution',
    topicLabel: 'Key Revolutionary Timeline',
    title: 'French Revolution Chain',
    icon: '🏰',
    type: 'sequence',
    prompt: 'Order the turning points of the French Revolution',
    hint: '1789 Estates-General → Napoleon Bonaparte',
    headIcon: '🇫🇷',
    items: [
      { e: '🏛️', n: 'Estates-General (May 1789)', sub: 'Third Estate walks out' },
      { e: '🏰', n: 'Storming of Bastille (14 Jul 1789)', sub: 'symbol of royal power falls' },
      { e: '📜', n: 'Declaration of Rights (Aug 1789)', sub: 'liberty & equality' },
      { e: '⚖️', n: 'Reign of Terror (1793–94)', sub: 'Robespierre & Jacobins' },
      { e: '👑', n: 'Napoleon Crowned (1804)', sub: 'Emperor of France' },
    ],
    reveal: { icon: '🕊️', title: 'Legacy of 1789', text: 'Liberty, Equality and Fraternity inspired democratic constitutions worldwide.' },
    ideas: [
      ['🏰', '14 July 1789 → Fall of the Bastille'],
      ['📜', '1791 Constitution limited the monarch’s powers'],
    ],
  },

  /* ================= CLASS 10 (All 5 attached + full chapter & multi-subject expansion) ================= */
  {
    id: 'c10-food-chain',
    cls: 10,
    subject: 'Science',
    chapter: 'Our Environment',
    topicLabel: 'Trophic Levels & 10% Law',
    title: 'Build a Food Chain',
    icon: '🦅',
    type: 'sequence',
    prompt: 'Who eats whom?',
    hint: 'Producer first → top consumer',
    headIcon: '🌿',
    items: [
      { e: '🌿', n: 'Grass', sub: 'producer' },
      { e: '🦗', n: 'Grasshopper', sub: 'herbivore' },
      { e: '🐸', n: 'Frog', sub: '2° consumer' },
      { e: '🐍', n: 'Snake', sub: '3° consumer' },
      { e: '🦅', n: 'Eagle', sub: 'top consumer' },
    ],
    reveal: {
      icon: '🔟',
      title: '10% Law',
      text: 'Only ~10% energy passes to the next level.',
    },
    ideas: [
      ['🌿', 'Every chain starts with a producer'],
      ['🔟', '10% energy moves up each level'],
      ['⚠️', 'Pesticides pile up at the top (biomagnification)'],
    ],
  },
  {
    id: 'c10-biodeg-sort',
    cls: 10,
    subject: 'Science',
    chapter: 'Our Environment',
    topicLabel: 'Biodegradable vs Non-biodegradable',
    title: 'Waste Bin Master',
    icon: '♻️',
    type: 'bins',
    bins: [
      { id: 'bio', icon: '🌿', label: 'Biodegradable', sub: 'broken down by microbes' },
      { id: 'non', icon: '🧴', label: 'Non-biodegradable', sub: 'persists in nature' },
    ],
    items: [
      { e: '🍌', n: 'Banana Peel', bin: 'bio' },
      { e: '📰', n: 'Newspaper', bin: 'bio' },
      { e: '🍂', n: 'Dry Leaves', bin: 'bio' },
      { e: '🧵', n: 'Cotton Cloth', bin: 'bio' },
      { e: '🧴', n: 'Plastic Bottle', bin: 'non' },
      { e: '🪟', n: 'Broken Glass', bin: 'non' },
      { e: '🔋', n: 'DDT Pesticide', bin: 'non', tip: 'causes biomagnification' },
      { e: '🥫', n: 'Aluminium Foil', bin: 'non' },
    ],
    ideas: [
      ['🦠', 'Enzymes are specific — microbes cannot digest plastics'],
      ['🛡️', 'CFCs depleted ozone; Montreal Protocol froze CFC production'],
    ],
  },
  {
    id: 'c10-reflex',
    cls: 10,
    subject: 'Science',
    chapter: 'Control & Coordination',
    topicLabel: 'Reflex Arc Signal Path',
    title: 'Reflex Arc',
    icon: '⚡',
    type: 'sequence',
    prompt: 'Touch a hot pan! What happens?',
    hint: 'Order the signal path',
    headIcon: '🔥',
    items: [
      { e: '✋', n: 'Receptor (skin)', sub: 'senses heat' },
      { e: '➡️', n: 'Sensory neuron', sub: 'carries signal in' },
      { e: '🦴', n: 'Spinal cord', sub: 'relay · decides fast' },
      { e: '⬅️', n: 'Motor neuron', sub: 'carries order out' },
      { e: '💪', n: 'Effector (muscle)', sub: 'pulls hand back' },
    ],
    reveal: {
      icon: '⚡',
      title: 'Reflex = no brain wait',
      text: 'Spinal cord answers first. Brain knows later.',
    },
    ideas: [
      ['✋', 'Receptor → sensory → spinal cord → motor → effector'],
      ['⚡', 'Reflex is quick & automatic'],
    ],
  },
  {
    id: 'c10-hormones',
    cls: 10,
    subject: 'Science',
    chapter: 'Control & Coordination',
    topicLabel: 'Human & Plant Hormones',
    title: 'Hormone Function Match',
    icon: '🧪',
    type: 'pairs',
    pairs: [
      [{ e: '🍬', n: 'Insulin' }, { e: '📉', n: 'Lowers blood sugar' }],
      [{ e: '⚡', n: 'Adrenaline' }, { e: '🏃', n: 'Fight or flight response' }],
      [{ e: '🦋', n: 'Thyroxin' }, { e: '🔥', n: 'Regulates metabolism (Iodine)' }],
      [{ e: '🌱', n: 'Auxin' }, { e: '☀️', n: 'Bends shoot toward light' }],
      [{ e: '🍂', n: 'Abscisic Acid' }, { e: '🛑', n: 'Inhibits growth · wilting' }],
      [{ e: '📏', n: 'Growth Hormone' }, { e: '🧠', n: 'Pituitary · body growth' }],
    ],
    ideas: [
      ['🍬', 'Pancreas secretes insulin; deficiency causes diabetes'],
      ['🌱', 'Auxin, Gibberellin, Cytokinin promote plant growth'],
    ],
  },
  {
    id: 'c10-reactions',
    cls: 10,
    subject: 'Science',
    chapter: 'Chemical Reactions & Equations',
    topicLabel: '4 Core Chemical Reactions',
    title: 'Reaction Types',
    icon: '⚗️',
    type: 'bins',
    bins: [
      { id: 'c', icon: '🤝', label: 'Combination', sub: 'A + B → AB' },
      { id: 'd', icon: '💥', label: 'Decomposition', sub: 'AB → A + B' },
      { id: 's', icon: '🔀', label: 'Displacement', sub: 'A + BC → AC + B' },
      { id: 'dd', icon: '🔁', label: 'Double displacement', sub: 'AB + CD → AD + CB' },
    ],
    items: [
      { t: 'CaO + H₂O → Ca(OH)₂', bin: 'c' },
      { t: '2H₂ + O₂ → 2H₂O', bin: 'c' },
      { t: 'CaCO₃ → CaO + CO₂', bin: 'd', tip: 'heat' },
      { t: '2AgCl → 2Ag + Cl₂', bin: 'd', tip: 'sunlight' },
      { t: 'Fe + CuSO₄ → FeSO₄ + Cu', bin: 's', tip: 'Fe is more reactive' },
      { t: 'Zn + H₂SO₄ → ZnSO₄ + H₂', bin: 's' },
      { t: 'Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl', bin: 'dd', tip: 'white precipitate' },
      { t: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', bin: 'dd' },
    ],
    ideas: [
      ['🤝', 'Combination → one product'],
      ['💥', 'Decomposition → one reactant (heat/light/electricity)'],
      ['🔀', 'More reactive pushes out less reactive'],
      ['🔁', 'Ions swap partners'],
    ],
  },
  {
    id: 'c10-flower',
    cls: 10,
    subject: 'Science',
    chapter: 'How do Organisms Reproduce?',
    topicLabel: 'Structure of a Bisexual Flower',
    title: 'Label the Flower',
    icon: '🌸',
    type: 'label',
    svg: SVG_FLOWER,
    w: 400,
    h: 300,
    spots: [
      { x: 200, y: 72, n: 'Stigma', e: '🎯', fn: 'catches pollen' },
      { x: 200, y: 118, n: 'Style', e: '🧵', fn: 'tube to ovary' },
      { x: 200, y: 166, n: 'Ovary', e: '🥚', fn: 'has ovules → becomes fruit' },
      { x: 244, y: 88, n: 'Anther', e: '🟡', fn: 'makes pollen' },
      { x: 229, y: 130, n: 'Filament', e: '📏', fn: 'holds the anther' },
      { x: 88, y: 112, n: 'Petal', e: '🌸', fn: 'attracts insects' },
      { x: 168, y: 194, n: 'Sepal', e: '🛡️', fn: 'protects the bud' },
    ],
    ideas: [
      ['♂️', 'Stamen = anther + filament'],
      ['♀️', 'Pistil = stigma + style + ovary'],
      ['🐝', 'Pollination → fertilisation → seed'],
      ['🍎', 'Ovary → fruit · ovule → seed'],
    ],
  },
  {
    id: 'c10-asexual-pairs',
    cls: 10,
    subject: 'Science',
    chapter: 'How do Organisms Reproduce?',
    topicLabel: 'Modes of Asexual Reproduction',
    title: 'Asexual Methods Match',
    icon: '🧫',
    type: 'pairs',
    pairs: [
      [{ e: '🦠', n: 'Amoeba' }, { e: '✂️', n: 'Binary Fission' }],
      [{ e: '🌿', n: 'Hydra & Yeast' }, { e: '🫧', n: 'Budding' }],
      [{ e: '🪱', n: 'Planaria' }, { e: '✨', n: 'Regeneration' }],
      [{ e: '🍄', n: 'Rhizopus (Bread Mould)' }, { e: '💨', n: 'Spore Formation' }],
      [{ e: '🍃', n: 'Bryophyllum' }, { e: '🌱', n: 'Vegetative (Leaf Buds)' }],
      [{ e: '🌊', n: 'Spirogyra' }, { e: '🧩', n: 'Fragmentation' }],
    ],
    ideas: [
      ['🧬', 'Asexual reproduction needs only one parent'],
      ['✨', 'Planaria regrows an entire organism from cut pieces'],
    ],
  },
  {
    id: 'c10-heart-label',
    cls: 10,
    subject: 'Science',
    chapter: 'Life Processes',
    topicLabel: 'Human Heart Chambers & Vessels',
    title: 'Label the Human Heart',
    icon: '❤️',
    type: 'label',
    svg: SVG_HUMAN_HEART,
    w: 400,
    h: 300,
    spots: [
      { x: 152, y: 134, n: 'Right Atrium', e: '🔵', fn: 'receives deoxygenated blood from body' },
      { x: 158, y: 196, n: 'Right Ventricle', e: '💙', fn: 'pumps blood to lungs' },
      { x: 248, y: 134, n: 'Left Atrium', e: '🔴', fn: 'receives oxygen-rich blood from lungs' },
      { x: 242, y: 196, n: 'Left Ventricle', e: '❤️', fn: 'thickest wall · pumps blood to body' },
      { x: 248, y: 36, n: 'Aorta', e: '🩸', fn: 'largest artery carrying O₂ blood out' },
      { x: 200, y: 224, n: 'Septum', e: '🧱', fn: 'dividing wall stopping blood mixing' },
    ],
    ideas: [
      ['❤️', 'Left side carries oxygenated blood; Right side deoxygenated'],
      ['🔁', 'Double circulation gives warm-blooded humans high energy'],
    ],
  },
  {
    id: 'c10-trig-pairs',
    cls: 10,
    subject: 'Maths',
    chapter: 'Introduction to Trigonometry',
    topicLabel: 'Standard Trig Table Values',
    title: 'Trig Values Flip',
    icon: '📐',
    type: 'pairs',
    pairs: [
      [{ t: 'sin 30°' }, { t: '1/2' }],
      [{ t: 'cos 30°' }, { t: '√3/2' }],
      [{ t: 'tan 45°' }, { t: '1' }],
      [{ t: 'tan 60°' }, { t: '√3' }],
      [{ t: 'sin 45°' }, { t: '1/√2' }],
      [{ t: 'sec 60°' }, { t: '2' }],
    ],
    ideas: [
      ['📐', 'sin²θ + cos²θ = 1'],
      ['🔄', 'sin 30° = cos 60° = ½ · tan 45° = 1'],
    ],
  },
  {
    id: 'c10-quadratic-roots',
    cls: 10,
    subject: 'Maths',
    chapter: 'Quadratic Equations',
    topicLabel: 'Nature of Roots via Discriminant',
    title: 'Discriminant Sorter',
    icon: '🎯',
    type: 'bins',
    bins: [
      { id: 'two', icon: '✌️', label: '2 Distinct Real', sub: 'D = b²−4ac > 0' },
      { id: 'eq', icon: '⚖️', label: '2 Equal Real', sub: 'D = 0' },
      { id: 'no', icon: '🚫', label: 'No Real Roots', sub: 'D < 0' },
    ],
    items: [
      { t: 'x² − 5x + 6 = 0', bin: 'two', tip: 'D = 25 − 24 = 1 > 0' },
      { t: 'x² − 9 = 0', bin: 'two', tip: 'D = 36 > 0' },
      { t: 'x² − 4x + 4 = 0', bin: 'eq', tip: 'D = 16 − 16 = 0' },
      { t: '4x² + 4x + 1 = 0', bin: 'eq', tip: 'D = 0' },
      { t: 'x² + x + 1 = 0', bin: 'no', tip: 'D = 1 − 4 = −3 < 0' },
      { t: 'x² + 4 = 0', bin: 'no', tip: 'D = −16 < 0' },
    ],
    ideas: [
      ['✌️', 'b² − 4ac > 0 → two distinct real roots'],
      ['⚖️', 'b² − 4ac = 0 → two equal real roots'],
      ['🚫', 'b² − 4ac < 0 → no real roots'],
    ],
  },
  {
    id: 'c10-resources',
    cls: 10,
    subject: 'Social Science',
    chapter: 'Resources & Development',
    topicLabel: 'Renewable vs Non-renewable',
    title: 'Use Forever?',
    icon: '♻️',
    type: 'bins',
    bins: [
      { id: 'r', icon: '♻️', label: 'Renewable' },
      { id: 'n', icon: '⏳', label: 'Non-renewable' },
    ],
    items: [
      { e: '☀️', n: 'Solar energy', bin: 'r' },
      { e: '🌬️', n: 'Wind', bin: 'r' },
      { e: '💧', n: 'Water', bin: 'r' },
      { e: '🌳', n: 'Forests', bin: 'r' },
      { e: '🐄', n: 'Wildlife', bin: 'r' },
      { e: '⚫', n: 'Coal', bin: 'n' },
      { e: '⛽', n: 'Petroleum', bin: 'n' },
      { e: '🔥', n: 'Natural gas', bin: 'n' },
      { e: '⛏️', n: 'Minerals', bin: 'n' },
    ],
    ideas: [
      ['♻️', 'Renewable → can be replenished'],
      ['⏳', 'Non-renewable → takes millions of years'],
      ['🌍', 'Sustainable development → use wisely'],
    ],
  },
  {
    id: 'c10-freedom-timeline',
    cls: 10,
    subject: 'Social Science',
    chapter: 'Nationalism in India',
    topicLabel: 'Indian Freedom Movement Order',
    title: 'Freedom Struggle Chain',
    icon: '🇮🇳',
    type: 'sequence',
    prompt: 'Order the milestones of India’s Freedom Movement',
    hint: '1917 Champaran → 1942 Quit India',
    headIcon: '🇮🇳',
    items: [
      { e: '🌾', n: 'Champaran Satyagraha (1917)', sub: 'indigo farmers in Bihar' },
      { e: '🕊️', n: 'Non-Cooperation (1920)', sub: 'boycott & Swadeshi' },
      { e: '🧂', n: 'Dandi Salt March (1930)', sub: 'Civil Disobedience begins' },
      { e: '🤝', n: 'Poona Pact (1932)', sub: 'Gandhi & Ambedkar' },
      { e: '🚩', n: 'Quit India Movement (1942)', sub: 'Do or Die call' },
    ],
    reveal: { icon: '🇮🇳', title: 'Satyagraha Journey', text: 'Mass participation united farmers, workers, students and women across India.' },
    ideas: [
      ['🧂', '1930 Salt March covered 240 miles from Sabarmati to Dandi'],
      ['🚩', '1942 Quit India demanded immediate end to British rule'],
    ],
  },

  /* ================= CLASS 11 (All 2 attached + Physics, Chemistry, Maths, Economics, CS) ================= */
  {
    id: 'c11-kingdoms',
    cls: 11,
    subject: 'Biology',
    chapter: 'Biological Classification',
    topicLabel: 'Whittaker’s Five Kingdoms',
    title: 'Five Kingdoms',
    icon: '🧬',
    type: 'bins',
    bins: [
      { id: 'mo', icon: '🦠', label: 'Monera', sub: 'no nucleus' },
      { id: 'pr', icon: '💧', label: 'Protista', sub: '1 cell + nucleus' },
      { id: 'fu', icon: '🍄', label: 'Fungi', sub: 'absorb food' },
      { id: 'pl', icon: '🌿', label: 'Plantae', sub: 'make food' },
      { id: 'an', icon: '🐾', label: 'Animalia', sub: 'eat food' },
    ],
    items: [
      { t: 'E. coli', bin: 'mo' },
      { t: 'Nostoc', bin: 'mo', tip: 'cyanobacteria' },
      { t: 'Amoeba', bin: 'pr' },
      { t: 'Paramecium', bin: 'pr' },
      { t: 'Euglena', bin: 'pr', tip: 'has chlorophyll but still protist' },
      { e: '🍄', n: 'Mushroom', bin: 'fu' },
      { e: '🍞', n: 'Yeast', bin: 'fu' },
      { e: '🟢', n: 'Bread mould', bin: 'fu', tip: 'Rhizopus' },
      { e: '🌿', n: 'Fern', bin: 'pl' },
      { e: '🌳', n: 'Mango tree', bin: 'pl' },
      { e: '⭐', n: 'Starfish', bin: 'an' },
      { e: '🦋', n: 'Butterfly', bin: 'an' },
    ],
    ideas: [
      ['🦠', 'Monera → prokaryotes'],
      ['💧', 'Protista → single-celled eukaryotes'],
      ['🍄', 'Fungi → chitin wall, saprophytes'],
      ['🧑‍🔬', 'Whittaker, 1969'],
    ],
  },
  {
    id: 'c11-cell-cycle',
    cls: 11,
    subject: 'Biology',
    chapter: 'Cell Cycle & Division',
    topicLabel: 'Mitosis Phases Sequence',
    title: 'Cell Cycle Chain',
    icon: '🔬',
    type: 'sequence',
    prompt: 'Order the stages of Cell Division (Interphase → Cytokinesis)',
    hint: 'DNA duplicates in S-phase before M-phase',
    headIcon: '🧬',
    items: [
      { e: '🌱', n: 'G1 Phase', sub: 'cell grows metabolically' },
      { e: '🧬', n: 'S Phase', sub: 'DNA replication (2C → 4C)' },
      { e: '📦', n: 'G2 Phase', sub: 'proteins ready for mitosis' },
      { e: '✖️', n: 'Prophase & Metaphase', sub: 'chromosomes align at equator' },
      { e: '↔️', n: 'Anaphase & Telophase', sub: 'sister chromatids separate' },
      { e: '🫧', n: 'Cytokinesis', sub: 'two daughter cells split' },
    ],
    reveal: { icon: '🧬', title: 'Equational Division', text: 'Mitosis preserves chromosome number (2n → 2n); Meiosis halves it (2n → n).' },
    ideas: [
      ['🧬', 'DNA replicates in S phase; chromosome number stays same'],
      ['✖️', 'Metaphase is best to study chromosome morphology'],
    ],
  },
  {
    id: 'c11-vectors',
    cls: 11,
    subject: 'Physics',
    chapter: 'Motion in a Plane',
    topicLabel: 'Scalar vs Vector Quantities',
    title: 'Scalar or Vector?',
    icon: '➡️',
    type: 'bins',
    bins: [
      { id: 's', icon: '🔢', label: 'Scalar', sub: 'size only' },
      { id: 'v', icon: '➡️', label: 'Vector', sub: 'size + direction' },
    ],
    items: [
      { t: 'Speed', bin: 's' },
      { t: 'Distance', bin: 's' },
      { t: 'Mass', bin: 's' },
      { t: 'Time', bin: 's' },
      { t: 'Work', bin: 's', tip: 'F·d → dot product → scalar' },
      { t: 'Energy', bin: 's' },
      { t: 'Temperature', bin: 's' },
      { t: 'Velocity', bin: 'v' },
      { t: 'Displacement', bin: 'v' },
      { t: 'Force', bin: 'v' },
      { t: 'Acceleration', bin: 'v' },
      { t: 'Momentum', bin: 'v' },
    ],
    ideas: [
      ['🔢', 'Scalar → just a number + unit'],
      ['➡️', 'Vector → needs direction'],
      ['⚠️', 'Work & energy are scalars'],
    ],
  },
  {
    id: 'c11-aufbau',
    cls: 11,
    subject: 'Chemistry',
    chapter: 'Structure of Atom',
    topicLabel: 'Aufbau Orbital Filling Order',
    title: 'Aufbau Energy Ladder',
    icon: '⚛️',
    type: 'sequence',
    prompt: 'Fill atomic orbitals from LOWEST to HIGHEST energy',
    hint: 'Use the (n + l) rule · note 4s vs 3d!',
    headIcon: '⚛️',
    items: [
      { t: '1s', n: '1s', sub: 'n+l = 1' },
      { t: '2s', n: '2s', sub: 'n+l = 2' },
      { t: '2p', n: '2p', sub: 'n+l = 3' },
      { t: '3s', n: '3s', sub: 'n+l = 3 (higher n)' },
      { t: '3p', n: '3p', sub: 'n+l = 4' },
      { t: '4s', n: '4s', sub: 'n+l = 4 (fills before 3d!)' },
      { t: '3d', n: '3d', sub: 'n+l = 5' },
    ],
    reveal: { icon: '⚛️', title: '4s Fills Before 3d!', text: '4s has (4+0)=4 while 3d has (3+2)=5, so electrons enter 4s first.' },
    ideas: [
      ['⚛️', 'Aufbau: lower (n + l) fills first'],
      ['🧲', 'Hund’s rule: orbitals fill singly before pairing'],
    ],
  },
  {
    id: 'c11-chemical-bonds',
    cls: 11,
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    topicLabel: 'Ionic, Covalent & Hydrogen Bonds',
    title: 'Bond Type Sorter',
    icon: '🔗',
    type: 'bins',
    bins: [
      { id: 'ion', icon: '⚡', label: 'Ionic', sub: 'electron transfer' },
      { id: 'cov', icon: '🤝', label: 'Covalent', sub: 'electron sharing' },
      { id: 'hb', icon: '💧', label: 'H-Bonding', sub: 'H with F, O, N' },
    ],
    items: [
      { t: 'NaCl', bin: 'ion' },
      { t: 'MgO', bin: 'ion' },
      { t: 'CaCl₂', bin: 'ion' },
      { t: 'CH₄', bin: 'cov' },
      { t: 'CO₂', bin: 'cov' },
      { t: 'N₂', bin: 'cov', tip: 'triple covalent bond' },
      { t: 'H₂O ··· H₂O', bin: 'hb', tip: 'gives water high boiling point' },
      { t: 'HF ··· HF', bin: 'hb' },
    ],
    ideas: [
      ['⚡', 'Metal + Non-metal → Ionic (electrostatic)'],
      ['🤝', 'Non-metal + Non-metal → Covalent sharing'],
      ['💧', 'H-bonds occur when H attaches to F, O, or N'],
    ],
  },
  {
    id: 'c11-conics',
    cls: 11,
    subject: 'Maths',
    chapter: 'Conic Sections',
    topicLabel: 'Identify Conic Equations',
    title: 'Conic Curve Identifier',
    icon: '⭕',
    type: 'bins',
    bins: [
      { id: 'cir', icon: '⭕', label: 'Circle' },
      { id: 'par', icon: '🧲', label: 'Parabola' },
      { id: 'ell', icon: '🥚', label: 'Ellipse' },
      { id: 'hyp', icon: '⏳', label: 'Hyperbola' },
    ],
    items: [
      { t: 'x² + y² = 25', bin: 'cir' },
      { t: '(x−1)² + (y+2)² = 9', bin: 'cir' },
      { t: 'y² = 12x', bin: 'par' },
      { t: 'x² = −8y', bin: 'par' },
      { t: 'x²/16 + y²/9 = 1', bin: 'ell' },
      { t: 'x²/4 + y²/25 = 1', bin: 'ell' },
      { t: 'x²/9 − y²/4 = 1', bin: 'hyp' },
      { t: 'y²/16 − x²/9 = 1', bin: 'hyp' },
    ],
    ideas: [
      ['🧲', 'Parabola: only ONE squared variable (e = 1)'],
      ['🥚', 'Ellipse: + between x²/a² and y²/b² (e < 1)'],
      ['⏳', 'Hyperbola: − between x²/a² and y²/b² (e > 1)'],
    ],
  },
  {
    id: 'c11-economics-scope',
    cls: 11,
    subject: 'Economics',
    chapter: 'Introduction to Economics',
    topicLabel: 'Microeconomics vs Macroeconomics',
    title: 'Micro or Macro?',
    icon: '📊',
    type: 'bins',
    bins: [
      { id: 'mi', icon: '🔍', label: 'Microeconomics', sub: 'individual firm / household' },
      { id: 'ma', icon: '🌍', label: 'Macroeconomics', sub: 'whole economy' },
    ],
    items: [
      { e: '🍎', n: 'Price of Apples', bin: 'mi' },
      { e: '🏭', n: 'Output of One Factory', bin: 'mi' },
      { e: '👨‍👩‍👧', n: 'Household Demand', bin: 'mi' },
      { e: '📈', n: 'National GDP Growth', bin: 'ma' },
      { e: '💸', n: 'Country Inflation Rate', bin: 'ma' },
      { e: '🏛️', n: 'Union Budget & Tax Policy', bin: 'ma' },
      { e: '👷', n: 'National Unemployment', bin: 'ma' },
      { e: '💼', n: 'Wage of One Engineer', bin: 'mi' },
    ],
    ideas: [
      ['🔍', 'Micro = worm’s-eye view (price theory)'],
      ['🌍', 'Macro = bird’s-eye view (income & employment theory)'],
    ],
  },
  {
    id: 'c11-python-types',
    cls: 11,
    subject: 'Computer Science',
    chapter: 'Python Data Types',
    topicLabel: 'Mutable vs Immutable Types',
    title: 'Python Mutability Sort',
    icon: '🐍',
    type: 'bins',
    bins: [
      { id: 'mut', icon: '✏️', label: 'Mutable', sub: 'can change in-place' },
      { id: 'imm', icon: '🔒', label: 'Immutable', sub: 'cannot change in-place' },
    ],
    items: [
      { t: 'list  [1, 2]', bin: 'mut' },
      { t: 'dict  {"a": 1}', bin: 'mut' },
      { t: 'set  {1, 2}', bin: 'mut' },
      { t: 'tuple  (1, 2)', bin: 'imm' },
      { t: 'str  "hello"', bin: 'imm' },
      { t: 'int  42', bin: 'imm' },
      { t: 'float  3.14', bin: 'imm' },
      { t: 'bool  True', bin: 'imm' },
    ],
    ideas: [
      ['✏️', 'Lists, Dictionaries & Sets are Mutable'],
      ['🔒', 'Strings, Tuples & Numbers are Immutable'],
    ],
  },

  /* ================= CLASS 12 (All 2 attached + Physics, Biology, Chemistry, Maths, Economics, CS) ================= */
  {
    id: 'c12-em',
    cls: 12,
    subject: 'Physics',
    chapter: 'Electromagnetic Waves',
    topicLabel: 'EM Spectrum Wavelength Order',
    title: 'EM Spectrum Ladder',
    icon: '🌈',
    type: 'sequence',
    prompt: 'Shortest → longest wavelength',
    hint: 'Order the waves',
    headIcon: '〰️',
    items: [
      { e: '☢️', n: 'Gamma rays', sub: 'nuclear' },
      { e: '🦴', n: 'X-rays', sub: 'bone scans' },
      { e: '🧴', n: 'Ultraviolet', sub: 'sunburn' },
      { e: '🌈', n: 'Visible', sub: 'VIBGYOR' },
      { e: '🔥', n: 'Infrared', sub: 'heat' },
      { e: '📡', n: 'Microwaves', sub: 'radar · oven' },
      { e: '📻', n: 'Radio waves', sub: 'broadcast' },
    ],
    reveal: {
      icon: '⚡',
      title: 'λ ↑ means energy ↓',
      text: 'Gamma = most energy. Radio = least.',
    },
    ideas: [
      ['〰️', 'All travel at c in vacuum'],
      ['📏', 'Wavelength ↑ → frequency ↓'],
      ['☢️', 'Gamma → highest energy'],
    ],
  },
  {
    id: 'c12-em-uses',
    cls: 12,
    subject: 'Physics',
    chapter: 'Electromagnetic Waves',
    topicLabel: 'Real-World Applications of EM Waves',
    title: 'Wave Application Match',
    icon: '📡',
    type: 'pairs',
    pairs: [
      [{ e: '📻', n: 'Radio Waves' }, { e: '📱', n: 'FM & Cellular Comms' }],
      [{ e: '📡', n: 'Microwaves' }, { e: '✈️', n: 'Radar & Speed Guns' }],
      [{ e: '🔥', n: 'Infrared' }, { e: '📺', n: 'TV Remotes & Night Vision' }],
      [{ e: '🧴', n: 'Ultraviolet' }, { e: '💧', n: 'Water Purifier & LASIK' }],
      [{ e: '🦴', n: 'X-rays' }, { e: '🏥', n: 'Detect Bone Fractures' }],
      [{ e: '☢️', n: 'Gamma Rays' }, { e: '🩺', n: 'Destroy Cancer Cells' }],
    ],
    ideas: [
      ['📡', 'Microwaves work in radar due to short wavelength'],
      ['🔥', 'Infrared waves are also called heat waves'],
    ],
  },
  {
    id: 'c12-biotech',
    cls: 12,
    subject: 'Biology',
    chapter: 'Biotechnology: Principles & Processes',
    topicLabel: 'Molecular Tools & Techniques',
    title: 'Biotech Toolkit',
    icon: '🧪',
    type: 'pairs',
    pairs: [
      [{ e: '✂️', n: 'Restriction enzyme' }, { e: '🧬', n: 'Cuts DNA' }],
      [{ e: '🧷', n: 'DNA ligase' }, { e: '🔗', n: 'Joins DNA' }],
      [{ e: '⭕', n: 'Plasmid' }, { e: '🚚', n: 'Vector · carrier' }],
      [{ e: '🔁', n: 'PCR' }, { e: '📈', n: 'Makes many copies' }],
      [{ e: '⚡', n: 'Gel electrophoresis' }, { e: '📏', n: 'Separates by size' }],
      [{ e: '🦠', n: 'Agrobacterium' }, { e: '🌱', n: 'Gene into plants' }],
    ],
    ideas: [
      ['✂️', 'EcoRI → first restriction enzyme'],
      ['🔁', 'PCR → Taq polymerase'],
      ['⚡', 'DNA moves to + pole'],
    ],
  },
  {
    id: 'c12-rdna-steps',
    cls: 12,
    subject: 'Biology',
    chapter: 'Biotechnology: Principles & Processes',
    topicLabel: 'Recombinant DNA Process Order',
    title: 'rDNA Workflow Chain',
    icon: '🧬',
    type: 'sequence',
    prompt: 'Order the steps of Recombinant DNA Technology',
    hint: 'Isolate DNA → Purify final product',
    headIcon: '🧬',
    items: [
      { e: '🧫', n: 'Isolation of DNA', sub: 'lysozyme + chilled ethanol' },
      { e: '✂️', n: 'Cutting at Specific Sites', sub: 'restriction endonuclease' },
      { e: '🔁', n: 'Amplification (PCR)', sub: 'billions of copies' },
      { e: '🔗', n: 'Ligation into Vector', sub: 'DNA ligase forms rDNA' },
      { e: '🦠', n: 'Transfer into Host', sub: 'transformation into E. coli' },
      { e: '🏭', n: 'Bioreactor & Downstream', sub: 'mass culture & purification' },
    ],
    reveal: { icon: '🏭', title: 'Downstream Processing', text: 'Separation and purification of the protein product before clinical trials.' },
    ideas: [
      ['✂️', 'Same restriction enzyme cuts both donor DNA & vector for sticky ends'],
      ['🔁', 'PCR steps: Denaturation → Annealing → Extension'],
    ],
  },
  {
    id: 'c12-organic-groups',
    cls: 12,
    subject: 'Chemistry',
    chapter: 'Aldehydes, Ketones & Carboxylic Acids',
    topicLabel: 'Functional Group Identification',
    title: 'Functional Group Sorter',
    icon: '⚗️',
    type: 'bins',
    bins: [
      { id: 'alc', icon: '🧪', label: 'Alcohol', sub: '−OH' },
      { id: 'ald', icon: '✨', label: 'Aldehyde', sub: '−CHO' },
      { id: 'ket', icon: '🔗', label: 'Ketone', sub: '>C=O' },
      { id: 'acid', icon: '🍋', label: 'Carboxylic Acid', sub: '−COOH' },
    ],
    items: [
      { t: 'CH₃CH₂OH', bin: 'alc', tip: 'Ethanol' },
      { t: 'CH₃OH', bin: 'alc', tip: 'Methanol' },
      { t: 'HCHO', bin: 'ald', tip: 'Methanal (Formaldehyde)' },
      { t: 'CH₃CHO', bin: 'ald', tip: 'Ethanal · gives Tollens test' },
      { t: 'CH₃COCH₃', bin: 'ket', tip: 'Propanone (Acetone)' },
      { t: 'C₆H₅COCH₃', bin: 'ket', tip: 'Acetophenone' },
      { t: 'CH₃COOH', bin: 'acid', tip: 'Ethanoic acid' },
      { t: 'HCOOH', bin: 'acid', tip: 'Methanoic acid' },
    ],
    ideas: [
      ['🪞', 'Tollens’ silver mirror test distinguishes Aldehydes from Ketones'],
      ['🫧', 'Carboxylic acids give brisk CO₂ effervescence with NaHCO₃'],
    ],
  },
  {
    id: 'c12-calculus-pairs',
    cls: 12,
    subject: 'Maths',
    chapter: 'Continuity & Differentiability',
    topicLabel: 'Standard Derivatives Formulae',
    title: 'Derivative Match',
    icon: '∫',
    type: 'pairs',
    pairs: [
      [{ t: 'd/dx (sin x)' }, { t: 'cos x' }],
      [{ t: 'd/dx (cos x)' }, { t: '−sin x' }],
      [{ t: 'd/dx (tan x)' }, { t: 'sec²x' }],
      [{ t: 'd/dx (eˣ)' }, { t: 'eˣ' }],
      [{ t: 'd/dx (ln x)' }, { t: '1/x' }],
      [{ t: 'd/dx (xⁿ)' }, { t: 'n·xⁿ⁻¹' }],
    ],
    ideas: [
      ['⚡', 'Chain rule: d/dx f(g(x)) = f’(g(x)) · g’(x)'],
      ['📐', 'Every co-function derivative (cos, cot, cosec) carries a minus sign!'],
    ],
  },
  {
    id: 'c12-macro-policy',
    cls: 12,
    subject: 'Economics',
    chapter: 'Money, Banking & Govt Budget',
    topicLabel: 'Monetary (RBI) vs Fiscal (Govt) Tools',
    title: 'RBI or Government?',
    icon: '🏛️',
    type: 'bins',
    bins: [
      { id: 'rbi', icon: '🏦', label: 'Monetary (RBI)', sub: 'money supply & credit' },
      { id: 'gov', icon: '🏛️', label: 'Fiscal (Govt)', sub: 'taxes & public spending' },
    ],
    items: [
      { t: 'Repo Rate', bin: 'rbi' },
      { t: 'Cash Reserve Ratio (CRR)', bin: 'rbi' },
      { t: 'Open Market Operations', bin: 'rbi' },
      { t: 'Reverse Repo Rate', bin: 'rbi' },
      { t: 'Income Tax & GST', bin: 'gov' },
      { t: 'Infrastructure Spending', bin: 'gov' },
      { t: 'Subsidies & Welfare', bin: 'gov' },
      { t: 'Public Borrowing / Deficit', bin: 'gov' },
    ],
    ideas: [
      ['🏦', 'RBI raises Repo Rate / CRR to curb inflation'],
      ['🏛️', 'Government uses Fiscal Policy (Budget) to manage aggregate demand'],
    ],
  },
  {
    id: 'c12-sql-order',
    cls: 12,
    subject: 'Computer Science',
    chapter: 'Database Query using SQL',
    topicLabel: 'SQL SELECT Query Clause Order',
    title: 'SQL Query Builder Chain',
    icon: '🗄️',
    type: 'sequence',
    prompt: 'Order SQL clauses as written in a SELECT query',
    hint: 'SELECT first → ORDER BY last',
    headIcon: '🗄️',
    items: [
      { t: 'SELECT', n: 'SELECT', sub: 'pick columns' },
      { t: 'FROM', n: 'FROM', sub: 'choose table' },
      { t: 'WHERE', n: 'WHERE', sub: 'filter rows' },
      { t: 'GROUP BY', n: 'GROUP BY', sub: 'aggregate groups' },
      { t: 'HAVING', n: 'HAVING', sub: 'filter groups' },
      { t: 'ORDER BY', n: 'ORDER BY', sub: 'sort output ASC/DESC' },
    ],
    reveal: { icon: '🗄️', title: 'WHERE vs HAVING', text: 'WHERE filters individual rows before grouping; HAVING filters grouped aggregates.' },
    ideas: [
      ['🔍', 'WHERE runs before GROUP BY · HAVING runs after GROUP BY'],
      ['📊', 'Aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX()'],
    ],
  },
];

/* ---------- Query & Chapter Bundling Helpers ---------- */

export const QUICK_REVISE_CLASSES: SchoolClassNumber[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

export function getGamesForClass(cls: SchoolClassNumber): QuickRevisionGame[] {
  return QUICK_REVISION_GAMES.filter((g) => g.cls === cls);
}

export function getSubjectsForQuickReviseClass(cls: SchoolClassNumber): string[] {
  return Array.from(new Set(getGamesForClass(cls).map((g) => g.subject)));
}

export function getChapterQuestsForClass(
  cls: SchoolClassNumber,
  subjectFilter: string = 'All',
): ChapterQuestBundle[] {
  const games = getGamesForClass(cls).filter(
    (g) => subjectFilter === 'All' || g.subject === subjectFilter,
  );

  const grouped = new Map<string, QuickRevisionGame[]>();
  for (const g of games) {
    const key = `${g.cls}::${g.subject}::${g.chapter}`;
    const list = grouped.get(key) || [];
    list.push(g);
    grouped.set(key, list);
  }

  return Array.from(grouped.entries()).map(([key, chapterGames]) => {
    const first = chapterGames[0];
    const seenIdeas = new Set<string>();
    const rememberHighlights: Array<[string, string]> = [];
    for (const gm of chapterGames) {
      for (const [ic, txt] of gm.ideas) {
        if (!seenIdeas.has(txt)) {
          seenIdeas.add(txt);
          rememberHighlights.push([ic, txt]);
        }
      }
    }
    return {
      key,
      cls: first.cls,
      subject: first.subject,
      chapter: first.chapter,
      games: chapterGames,
      primaryIcon: first.icon,
      accentColor: getSubjectColor(first.subject),
      topics: chapterGames.map((g) => g.topicLabel),
      rememberHighlights: rememberHighlights.slice(0, 8),
    };
  });
}
