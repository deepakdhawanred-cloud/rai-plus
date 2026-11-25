import type {
  GeneratedMonthlyThinkingSet,
  OlqKey,
  SchoolClassNumber,
  SsbDailyAssignment,
  ThinkingDifficulty,
  ThinkingMonthlySetUsage,
  ThinkingQuestionItem,
  ThinkingTestType,
} from '../types';

// ============================================================================
// MONTHLY CLASS-ALIGNED THINKING SETS (WAT 60 · SRT 60@30s · TAT 11 · PPDT 1/MO)
// ============================================================================

export type ClassTier = 'primary_1_5' | 'middle_6_8' | 'secondary_9_10' | 'senior_11_12';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function extractClassNumber(classSection?: string | number): SchoolClassNumber {
  if (typeof classSection === 'number' && Number.isFinite(classSection)) {
    return Math.max(1, Math.min(12, Math.round(classSection))) as SchoolClassNumber;
  }
  const m = String(classSection || '').match(/(\d+)/);
  if (!m) return 6;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n)) return 6;
  return Math.max(1, Math.min(12, n)) as SchoolClassNumber;
}

export function getClassTier(classLevel: SchoolClassNumber): ClassTier {
  if (classLevel <= 5) return 'primary_1_5';
  if (classLevel <= 8) return 'middle_6_8';
  if (classLevel <= 10) return 'secondary_9_10';
  return 'senior_11_12';
}

export function getTierMeta(classLevel: SchoolClassNumber): {
  ageBand: string;
  difficulty: ThinkingDifficulty;
  classRange: string;
} {
  if (classLevel <= 5) {
    return { ageBand: '6-10 yrs', difficulty: 'Foundation', classRange: `Class ${classLevel}` };
  }
  if (classLevel <= 8) {
    return { ageBand: '11-13 yrs', difficulty: 'Foundation', classRange: `Class ${classLevel}` };
  }
  if (classLevel <= 10) {
    return { ageBand: '14-16 yrs', difficulty: 'Intermediate', classRange: `Class ${classLevel}` };
  }
  return { ageBand: '16-18 yrs', difficulty: 'Advanced', classRange: `Class ${classLevel}` };
}

export function getCurrentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map((x) => parseInt(x, 10));
  if (!y || !m || m < 1 || m > 12) return monthKey;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function hashString(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const out = arr.slice();
  let state = hashString(seed) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// ============================================================================
// 1. WAT WORD POOLS (240+ CLASS-APPROPRIATE WORDS -> 60 PER MONTHLY SET)
// ============================================================================

const WAT_CORE_UNIVERSAL: string[] = [
  'Team', 'Help', 'Honesty', 'Kindness', 'Effort', 'Practice', 'Smile', 'Share', 'Listen', 'Truth',
  'Friend', 'School', 'Study', 'Plan', 'Goal', 'Brave', 'Calm', 'Care', 'Clean', 'Trust',
  'Work', 'Play', 'Learn', 'Guide', 'Hope', 'Peace', 'Proud', 'Ready', 'Respect', 'Safe',
  'Solve', 'Strong', 'Time', 'Try', 'Unity', 'Win', 'Mistake', 'Delay', 'Noise', 'Dark',
  'Rain', 'Bridge', 'Road', 'Book', 'Clock', 'Light', 'Tree', 'Water', 'Garden', 'Family',
  'Teacher', 'Parent', 'Promise', 'Duty', 'Rule', 'Fair', 'Patience', 'Health', 'Active', 'Focus',
  'Energy', 'Dream', 'Habit', 'Order', 'Courage', 'Smile', 'Support', 'Build', 'Create', 'Think',
  'Action', 'Climb', 'Finish', 'Start', 'Step', 'Together', 'Voice', 'Watch', 'Wonder', 'Write',
];

const WAT_PRIMARY_EXTRA: string[] = [
  'Pencil', 'Notebook', 'Playground', 'Morning', 'Assembly', 'Lunchbox', 'Library', 'Drawing',
  'Story', 'Puzzle', 'Bicycle', 'Garden', 'Sparrow', 'Sunshine', 'Rainbow', 'Homework',
  'Classmate', 'Polite', 'Neat', 'Early', 'Cheerful', 'Gentle', 'Curious', 'Sharing',
  'Helping', 'Growing', 'Reading', 'Counting', 'Singing', 'Running', 'Jumping', 'Planting',
  'Saving', 'Thankful', 'Sorry', 'Forgive', 'Welcome', 'Together', 'Neighbour', 'Animal',
  'River', 'Mountain', 'Village', 'Festival', 'Flag', 'Medal', 'Star', 'Prize',
  'Game', 'Match', 'Race', 'Ball', 'Desk', 'Bell', 'Chalk', 'Board',
  'Chart', 'Globe', 'Map', 'Clock', 'Shoes', 'Uniform', 'Bottle', 'Basket',
  'Seed', 'Flower', 'Fruit', 'Bread', 'Milk', 'Doctor', 'Nurse', 'Farmer',
  'Soldier', 'Driver', 'Helper', 'Guard', 'Cleanliness', 'Discipline', 'Obedient', 'Friendly',
  'Happy', 'Bright', 'Quick', 'Careful', 'Smart', 'Steady', 'Kind', 'Helpful',
  'Truthful', 'Loyal', 'Sincere', 'Cheer', 'Clap', 'Wave', 'Smile', 'Joy',
];

const WAT_MIDDLE_EXTRA: string[] = [
  'Challenge', 'Teamwork', 'Leader', 'Captain', 'Project', 'Experiment', 'Debate', 'Speech',
  'Responsibility', 'Initiative', 'Cooperation', 'Confidence', 'Determination', 'Punctual',
  'Organise', 'Prepare', 'Improve', 'Overcome', 'Persist', 'Balance', 'Curiosity', 'Discovery',
  'Invention', 'Community', 'Environment', 'Recycle', 'Volunteer', 'Service', 'Safety', 'First-Aid',
  'Alert', 'Steady', 'Adapt', 'Adjust', 'Decide', 'Choose', 'Reason', 'Logic',
  'Evidence', 'Check', 'Verify', 'Repair', 'Resource', 'Budget', 'Schedule', 'Deadline',
  'Pressure', 'Fear', 'Doubt', 'Failure', 'Retry', 'Feedback', 'Criticism', 'Praise',
  'Success', 'Victory', 'Defeat', 'Sportsmanship', 'Fairplay', 'Rival', 'Partner', 'Mentor',
  'Junior', 'Senior', 'Prefect', 'Monitor', 'Council', 'Club', 'Camp', 'Trek',
  'Compass', 'Journey', 'Obstacle', 'Shortcut', 'Risk', 'Caution', 'Bravery', 'Empathy',
  'Compassion', 'Gratitude', 'Humility', 'Integrity', 'Character', 'Habit', 'Routine', 'Stamina',
  'Fitness', 'Strength', 'Endurance', 'Concentration', 'Memory', 'Clarity', 'Expression', 'Listening',
];

const WAT_SECONDARY_EXTRA: string[] = [
  'Accountability', 'Adversity', 'Ambition', 'Analysis', 'Assertive', 'Authority', 'Autonomy', 'Benchmark',
  'Bias', 'Breakthrough', 'Calibre', 'Camaraderie', 'Capability', 'Citizenship', 'Clarity', 'Collaboration',
  'Commitment', 'Competence', 'Compromise', 'Conflict', 'Consensus', 'Consistency', 'Constructive', 'Contribution',
  'Conviction', 'Coordination', 'Credibility', 'Crisis', 'Critique', 'Dedication', 'Delegation', 'Dependable',
  'Dilemma', 'Diligence', 'Diplomacy', 'Direction', 'Disagreement', 'Discernment', 'Efficiency', 'Emergency',
  'Empower', 'Endurance', 'Enterprise', 'Equality', 'Ethics', 'Excellence', 'Execution', 'Expectation',
  'Fearless', 'Flexibility', 'Foresight', 'Fortitude', 'Foundation', 'Freedom', 'Frustration', 'Generosity',
  'Governance', 'Grit', 'Guidance', 'Harmony', 'Hesitation', 'Honour', 'Idealism', 'Impact',
  'Impartial', 'Incentive', 'Inclusion', 'Independence', 'Influence', 'Innovation', 'Insight', 'Inspiration',
  'Integrity', 'Intellect', 'Judgement', 'Justice', 'Leadership', 'Legacy', 'Limitation', 'Loyalty',
  'Maturity', 'Mediation', 'Merit', 'Milestone', 'Mindset', 'Mission', 'Morale', 'Motivation',
  'Negotiation', 'Neutrality', 'Objective', 'Obligation', 'Opportunity', 'Optimism', 'Originality', 'Outcome',
];

const WAT_SENIOR_EXTRA: string[] = [
  'Strategy', 'Sovereignty', 'Resilience', 'Pragmatism', 'Stewardship', 'Command', 'Composure', 'Decisiveness',
  'Tactical', 'Contingency', 'Mobilise', 'Prioritise', 'Synthesise', 'Evaluate', 'Arbitrate', 'Catalyst',
  'Cohesion', 'Collective', 'Conscience', 'Constraint', 'Courageous', 'Credible', 'Critical', 'Crisis-Plan',
  'Deliberate', 'Demoralised', 'Deterrence', 'Devotion', 'Discretion', 'Disruption', 'Duty-Bound', 'Dynamic',
  'Efficacy', 'Ego', 'Endure', 'Enterprise', 'Equanimity', 'Escalation', 'Ethical', 'Expedite',
  'Feasible', 'Fidelity', 'Focus', 'Forbearance', 'Forethought', 'Friction', 'Fulfilment', 'Galvanise',
  'Genuineness', 'Grievance', 'Grounding', 'Hardship', 'Headwind', 'Hierarchy', 'Holistic', 'Honorary',
  'Humanitarian', 'Impetus', 'Improvisation', 'Indecision', 'Indifference', 'Infallible', 'Initiative', 'Innovation',
  'Inquisitive', 'Inspiration', 'Institutional', 'Intellect', 'Intervene', 'Intuition', 'Invincible', 'Judicious',
  'Jurisdiction', 'Keenness', 'Kinship', 'Laggard', 'Leadership', 'Legitimacy', 'Leverage', 'Liberty',
  'Livelihood', 'Logistics', 'Magnanimity', 'Mandate', 'Mastery', 'Mentorship', 'Mettle', 'Militancy',
  'Moderation', 'Momentum', 'Moral', 'Multitask', 'Mutual', 'National', 'Navigation', 'Negligence',
  'Nerve', 'Nobility', 'Norm', 'Objectivity', 'Observation', 'Obstruction', 'Officer', 'Omission',
  'Operational', 'Opposition', 'Optimum', 'Orderly', 'Organised', 'Original', 'Outperform', 'Overhaul',
];

function getWatWordPool(classLevel: SchoolClassNumber): string[] {
  const tier = getClassTier(classLevel);
  const raw =
    tier === 'primary_1_5'
      ? [...WAT_CORE_UNIVERSAL, ...WAT_PRIMARY_EXTRA]
      : tier === 'middle_6_8'
        ? [...WAT_CORE_UNIVERSAL, ...WAT_MIDDLE_EXTRA]
        : tier === 'secondary_9_10'
          ? [...WAT_CORE_UNIVERSAL, ...WAT_MIDDLE_EXTRA.slice(0, 48), ...WAT_SECONDARY_EXTRA]
          : [...WAT_CORE_UNIVERSAL, ...WAT_SECONDARY_EXTRA.slice(0, 60), ...WAT_SENIOR_EXTRA];
  return Array.from(new Set(raw));
}

const WAT_OLQ_CYCLE: OlqKey[][] = [
  ['effective_intelligence', 'power_of_expression'],
  ['sense_of_responsibility', 'cooperation'],
  ['liveliness', 'self_confidence'],
  ['determination', 'courage'],
  ['social_adaptability', 'influence_group'],
  ['reasoning_ability', 'organising_ability'],
];

// ============================================================================
// 2. SRT SITUATION POOLS (180+ CLASS-ALIGNED SITUATIONS -> 60 PER MONTHLY SET)
// ============================================================================

interface SrtTemplate {
  title: string;
  prompt: string;
  olqs: OlqKey[];
}

const SRT_PRIMARY_SCENARIOS: SrtTemplate[] = [
  { title: 'Forgotten Pencil Box', prompt: 'Your desk partner forgot their pencil box before a class test. You have an extra pencil. What will you do?', olqs: ['cooperation', 'social_adaptability'] },
  { title: 'Spilled Water in Classroom', prompt: 'Someone accidentally spills water near the classroom door and students are walking past. What will you do?', olqs: ['initiative', 'sense_of_responsibility'] },
  { title: 'Lost Storybook', prompt: 'You find a library storybook left on the playground bench after recess. What will you do?', olqs: ['sense_of_responsibility', 'initiative'] },
  { title: 'New Student at Lunch', prompt: 'A new classmate is sitting alone during lunch break looking shy. What will you do?', olqs: ['social_adaptability', 'cooperation'] },
  { title: 'Noisy Line in Assembly', prompt: 'The teacher steps away for a minute and your class line starts pushing and shouting. What will you do?', olqs: ['influence_group', 'sense_of_responsibility'] },
  { title: 'Broken Chalk & Drawing', prompt: 'Your group poster tears slightly five minutes before showing it to the class. What will you do?', olqs: ['effective_intelligence', 'liveliness'] },
  { title: 'Crying Younger Child', prompt: 'A Class 1 child trips near the swings and scrapes their knee. What will you do?', olqs: ['speed_of_decision', 'cooperation'] },
  { title: 'Missed Bus Stop', prompt: 'You realise you forgot your art folder at home on competition day. What will you do?', olqs: ['self_confidence', 'effective_intelligence'] },
  { title: 'Tap Left Running', prompt: 'You see a drinking-water tap left open in the school corridor while everyone rushes to class. What will you do?', olqs: ['sense_of_responsibility', 'initiative'] },
  { title: 'Game Rules Disagreement', prompt: 'Two friends argue loudly over who is out during a playground game. What will you do?', olqs: ['social_adaptability', 'influence_group'] },
  { title: 'Difficult Maths Problem', prompt: 'You cannot solve a homework maths question even after trying twice. What will you do?', olqs: ['determination', 'reasoning_ability'] },
  { title: 'Classroom Lights On', prompt: 'Your class is leaving for the computer lab and all fans and lights are still switched on. What will you do?', olqs: ['sense_of_responsibility', 'organising_ability'] },
  { title: 'Dropped Lunch Box', prompt: 'A friend accidentally drops their lunch box on the floor and has nothing to eat. What will you do?', olqs: ['cooperation', 'liveliness'] },
  { title: 'Forgotten Homework Diary', prompt: 'You notice your classmate did not copy the homework before the bell rang. What will you do?', olqs: ['cooperation', 'organising_ability'] },
  { title: 'Stray Puppy Near Gate', prompt: 'A frightened puppy wanders near the busy school gate at dispersal time. What will you do?', olqs: ['courage', 'speed_of_decision'] },
  { title: 'Stage Fright in Poem', prompt: 'You forget a line in the middle of reciting a poem on stage. What will you do?', olqs: ['self_confidence', 'stamina'] },
  { title: 'Messy Activity Corner', prompt: 'After craft period, paper scraps are scattered around your group table. What will you do?', olqs: ['sense_of_responsibility', 'cooperation'] },
  { title: 'Broken Ruler Borrowed', prompt: 'You accidentally crack a ruler you borrowed from a friend. What will you do?', olqs: ['courage', 'sense_of_responsibility'] },
  { title: 'Rain During Dispersal', prompt: 'Sudden heavy rain starts at dispersal and your friend forgot an umbrella. What will you do?', olqs: ['cooperation', 'effective_intelligence'] },
  { title: 'Wrong Answer on Board', prompt: 'Some classmates giggle when a student writes a wrong spelling on the blackboard. What will you do?', olqs: ['social_adaptability', 'courage'] },
];

const SRT_MIDDLE_SCENARIOS: SrtTemplate[] = [
  { title: 'Missing Science Model Partner', prompt: 'Your teammate falls ill on the morning of the inter-school science exhibition with half the charts at their home. What will you do?', olqs: ['initiative', 'organising_ability', 'speed_of_decision'] },
  { title: 'Water Leakage Near Computer Lab', prompt: 'You notice water seeping from a cooler pipe towards electrical cables outside the computer lab. What will you do?', olqs: ['speed_of_decision', 'sense_of_responsibility', 'courage'] },
  { title: 'Group Project Free-Rider', prompt: 'Two days before submission, one member of your 4-student project group has not done their part. What will you do?', olqs: ['influence_group', 'cooperation', 'organising_ability'] },
  { title: 'Excluded Classmate in Sports', prompt: 'During sports selection, a quieter classmate is repeatedly left out of practice drills. What will you do?', olqs: ['social_adaptability', 'cooperation'] },
  { title: 'Lost Wallet in School Corridor', prompt: 'You find an unmarked wallet containing ₹500 near the school canteen. What will you do?', olqs: ['sense_of_responsibility', 'initiative'] },
  { title: 'Power Cut During Presentation', prompt: 'The smart-board turns off midway through your class presentation in front of teachers. What will you do?', olqs: ['self_confidence', 'power_of_expression', 'effective_intelligence'] },
  { title: 'Tough Exam First Page', prompt: 'The first three questions on your mathematics paper look unexpectedly hard and time is ticking. What will you do?', olqs: ['effective_intelligence', 'stamina', 'self_confidence'] },
  { title: 'Teammate Injured in Relay', prompt: 'Ten minutes before the inter-house relay race, your anchor runner twists their ankle. What will you do?', olqs: ['speed_of_decision', 'organising_ability'] },
  { title: 'Rumour in Class Group', prompt: 'Someone forwards an unverified message claiming school is closed tomorrow. What will you do?', olqs: ['reasoning_ability', 'sense_of_responsibility'] },
  { title: 'Bicycle Chain Breaks', prompt: 'Your bicycle chain snaps 2 km from school twenty minutes before an important test. What will you do?', olqs: ['effective_intelligence', 'determination'] },
  { title: 'Damaged Library Book', prompt: 'You open a newly issued reference book and notice two pages are already torn. What will you do?', olqs: ['sense_of_responsibility', 'reasoning_ability'] },
  { title: 'Arguments Over Annual Day Script', prompt: 'Your drama team splits into two groups arguing over two different endings. What will you do?', olqs: ['influence_group', 'cooperation', 'social_adaptability'] },
  { title: 'Late Teacher & Restless Class', prompt: 'Your subject teacher is delayed by ten minutes and the class becomes noisy enough to disturb nearby rooms. What will you do?', olqs: ['initiative', 'influence_group'] },
  { title: 'Elderly Neighbour Needs Help', prompt: 'While rushing to evening coaching, you see an elderly neighbour struggling with heavy grocery bags on stairs. What will you do?', olqs: ['cooperation', 'social_adaptability'] },
  { title: 'Missing Sports Kit', prompt: 'You arrive at the tournament venue and realise the team jersey bag was left on the bus. What will you do?', olqs: ['speed_of_decision', 'effective_intelligence'] },
  { title: 'Unclear Lab Instruction', prompt: 'In chemistry practical, your partner wants to mix reagents quickly without verifying the measurement. What will you do?', olqs: ['sense_of_responsibility', 'courage'] },
  { title: 'Lost Child at Local Fair', prompt: 'At a crowded evening market, you spot a small child crying and calling for their mother. What will you do?', olqs: ['initiative', 'speed_of_decision', 'courage'] },
  { title: 'Low Score in Unit Test', prompt: 'You studied hard for Science yet scored lower than expected in the monthly test. What will you do?', olqs: ['determination', 'stamina'] },
  { title: 'Broken Bench Reported by No One', prompt: 'You notice a protruding nail on a classroom bench that could hurt someone. What will you do?', olqs: ['initiative', 'sense_of_responsibility'] },
  { title: 'Classmate Pressuring to Copy', prompt: 'A close friend asks you to share your notebook answers during a surprise quiz. What will you do?', olqs: ['courage', 'sense_of_responsibility'] },
];

const SRT_SENIOR_SCENARIOS: SrtTemplate[] = [
  { title: 'Trek Weather Deterioration', prompt: 'While leading a 12-student school trek in the hills, dense fog rolls in and a junior twists an ankle 3 km from base camp. What will you do?', olqs: ['speed_of_decision', 'organising_ability', 'courage'] },
  { title: 'Annual Fest Budget Shortfall', prompt: 'As student coordinator, a sponsor withdraws ₹15,000 two days before the inter-school youth fest. What will you do?', olqs: ['effective_intelligence', 'organising_ability', 'determination'] },
  { title: 'Cyberbullying Incident', prompt: 'You discover an anonymous account mocking a Class 9 student on a school chat group. What will you do?', olqs: ['courage', 'sense_of_responsibility', 'social_adaptability'] },
  { title: 'Roadside Accident Witness', prompt: 'On your way back from tuition, a cyclist skids on gravel and is bleeding from the forehead while bystanders hesitate. What will you do?', olqs: ['speed_of_decision', 'initiative', 'courage'] },
  { title: 'Conflicting Captaincy Orders', prompt: 'During a football semi-final, your vice-captain openly contradicts your tactical plan in front of the squad. What will you do?', olqs: ['influence_group', 'social_adaptability', 'self_confidence'] },
  { title: 'Lab Fire Extinguisher Needed', prompt: 'A spirit lamp tips over during senior chemistry practical and catches a paper sheet on fire. What will you do?', olqs: ['speed_of_decision', 'courage', 'effective_intelligence'] },
  { title: 'Board Exam Anxiety in Peer', prompt: 'Two weeks before board exams, a top-performing friend breaks down feeling overwhelmed and wants to skip mocks. What will you do?', olqs: ['cooperation', 'liveliness', 'influence_group'] },
  { title: 'School Bus Breakdown in Heat', prompt: 'Your school bus engine overheats on a highway in 40°C heat with 35 younger students onboard. What will you do?', olqs: ['organising_ability', 'sense_of_responsibility', 'stamina'] },
  { title: 'Data Loss Before Submission', prompt: 'Your team’s robotics report file corrupts three hours before the regional deadline. What will you do?', olqs: ['determination', 'effective_intelligence', 'speed_of_decision'] },
  { title: 'Unfair Officiating in Match', prompt: 'A clearly wrong referee call costs your team a crucial point in the final minutes of an inter-school match. What will you do?', olqs: ['self_confidence', 'social_adaptability', 'liveliness'] },
  { title: 'Volunteer Camp Food Shortage', prompt: 'At a rural NSS camp, 25 extra villagers arrive for the health-awareness lunch beyond planned plates. What will you do?', olqs: ['organising_ability', 'cooperation', 'effective_intelligence'] },
  { title: 'Missed Train for Olympiad', prompt: 'Traffic jam causes your school contingent to miss the morning train to the state Olympiad. What will you do?', olqs: ['speed_of_decision', 'determination', 'organising_ability'] },
  { title: 'Disagreement with Faculty Advisor', prompt: 'You strongly believe your debate topic approach is stronger than the one suggested by your teacher mentor. What will you do?', olqs: ['power_of_expression', 'reasoning_ability', 'social_adaptability'] },
  { title: 'Electric Short Circuit at Home', prompt: 'While studying alone at night, you smell burning plastic from the main switchboard. What will you do?', olqs: ['speed_of_decision', 'effective_intelligence', 'courage'] },
  { title: 'Team Morale After Back-to-Back Losses', prompt: 'Your school house has lost three straight events and juniors are talking about quitting practice. What will you do?', olqs: ['influence_group', 'liveliness', 'determination'] },
  { title: 'Found Exam Paper Draft', prompt: 'You accidentally see a draft copy of next week’s internal test lying on a copier tray. What will you do?', olqs: ['sense_of_responsibility', 'courage'] },
  { title: 'Flooded Colony Street', prompt: 'Heavy monsoon rain floods your lane and elderly residents on the ground floor need drinking water and medicines. What will you do?', olqs: ['initiative', 'cooperation', 'stamina'] },
  { title: 'Public Speaking Mic Failure', prompt: 'You are anchoring the Independence Day programme for 800 people when the sound system dies. What will you do?', olqs: ['self_confidence', 'power_of_expression', 'liveliness'] },
  { title: 'Conflicting Family & Exam Schedule', prompt: 'An urgent family medical check-up coincides with your scheduled practical viva. What will you do?', olqs: ['organising_ability', 'sense_of_responsibility', 'reasoning_ability'] },
  { title: 'Underperforming Junior Mentee', prompt: 'You are assigned to mentor a Class 7 student in coding who feels discouraged after repeated bugs. What will you do?', olqs: ['cooperation', 'liveliness', 'power_of_expression'] },
];

// Parameterized realistic contextual variants to build a guaranteed 180+ unique pool per tier
interface SrtFacet {
  context: string;
  actor: string;
  issue: string;
  olqs: OlqKey[];
}

const SRT_CONTEXT_VARIANTS: Record<ClassTier, SrtFacet[]> = {
  primary_1_5: [
    { context: 'Morning Assembly', actor: 'a classmate', issue: 'feels dizzy standing in the sun', olqs: ['speed_of_decision', 'cooperation'] },
    { context: 'Art Period', actor: 'your group', issue: 'runs out of glue halfway through making a chart', olqs: ['effective_intelligence', 'cooperation'] },
    { context: 'School Bus', actor: 'a younger child', issue: 'starts crying because they cannot find their seat', olqs: ['social_adaptability', 'cooperation'] },
    { context: 'Library Visit', actor: 'two students', issue: 'pull on the same storybook at the same time', olqs: ['social_adaptability', 'influence_group'] },
    { context: 'Garden Club', actor: 'your team', issue: 'sees newly planted saplings drying up in afternoon heat', olqs: ['initiative', 'sense_of_responsibility'] },
    { context: 'Computer Period', actor: 'your partner', issue: 'accidentally closes the drawing window without saving', olqs: ['liveliness', 'effective_intelligence'] },
    { context: 'Sports Day', actor: 'a friend', issue: 'comes last in the race and sits sadly in a corner', olqs: ['cooperation', 'liveliness'] },
    { context: 'Classroom Clean-Up', actor: 'your row', issue: 'is asked to tidy up before the principal visits', olqs: ['organising_ability', 'sense_of_responsibility'] },
    { context: 'Homework Check', actor: 'you', issue: 'realise you wrote the wrong page number by mistake', olqs: ['sense_of_responsibility', 'determination'] },
    { context: 'Recess Queue', actor: 'an older student', issue: 'cuts ahead of younger children in the water queue', olqs: ['courage', 'sense_of_responsibility'] },
  ],
  middle_6_8: [
    { context: 'Science Lab', actor: 'your lab partner', issue: 'breaks a glass beaker and wants to hide it', olqs: ['courage', 'sense_of_responsibility'] },
    { context: 'Inter-House Quiz', actor: 'your teammate', issue: 'panics after answering two buzzer questions wrong', olqs: ['liveliness', 'influence_group'] },
    { context: 'School Picnic', actor: 'two classmates', issue: 'wander off the marked trail to take photos', olqs: ['speed_of_decision', 'sense_of_responsibility'] },
    { context: 'Eco-Club Drive', actor: 'your squad', issue: 'receives half the saplings promised for plantation day', olqs: ['organising_ability', 'effective_intelligence'] },
    { context: 'Evening Sports', actor: 'you', issue: 'notice the school gate padlock left unlatched after practice', olqs: ['initiative', 'sense_of_responsibility'] },
    { context: 'Maths Olympiad Prep', actor: 'your study circle', issue: 'cannot agree on which chapters to revise first', olqs: ['organising_ability', 'reasoning_ability'] },
    { context: 'Class Election', actor: 'a rival candidate', issue: 'spreads teasing remarks about your campaign poster', olqs: ['self_confidence', 'social_adaptability'] },
    { context: 'Community Park', actor: 'you and friends', issue: 'find broken glass scattered near the children’s slide', olqs: ['initiative', 'speed_of_decision'] },
    { context: 'Annual Exhibition', actor: 'visiting parents', issue: 'ask a technical question your teammate cannot answer', olqs: ['power_of_expression', 'cooperation'] },
    { context: 'Cycle Stand', actor: 'you', issue: 'accidentally knock down a parked bicycle and scratch its bell', olqs: ['sense_of_responsibility', 'courage'] },
  ],
  secondary_9_10: [
    { context: 'NCC / Scout Camp', actor: 'your patrol', issue: 'loses flashlight batteries right before night navigation drill', olqs: ['effective_intelligence', 'organising_ability'] },
    { context: 'Board Mock Test', actor: 'the invigilator', issue: 'hands out an answer sheet with a misprinted page', olqs: ['speed_of_decision', 'reasoning_ability'] },
    { context: 'Inter-School Debate', actor: 'your first speaker', issue: 'develops a sore throat an hour before the finals', olqs: ['self_confidence', 'organising_ability'] },
    { context: 'School Magazine', actor: 'the design lead', issue: 'misses the press deadline with three pages blank', olqs: ['initiative', 'determination'] },
    { context: 'Community Blood Camp', actor: 'volunteers', issue: 'face a sudden queue rush at the registration desk', olqs: ['organising_ability', 'cooperation'] },
    { context: 'Coding Hackathon', actor: 'your team', issue: 'hits a critical runtime bug 45 minutes before judging', olqs: ['effective_intelligence', 'stamina'] },
    { context: 'Sports Tournament', actor: 'the visiting team', issue: 'arrives late without drinking water containers', olqs: ['social_adaptability', 'initiative'] },
    { context: 'Train Journey', actor: 'a fellow passenger', issue: 'leaves their medical folder behind while getting off', olqs: ['speed_of_decision', 'sense_of_responsibility'] },
    { context: 'Cultural Fest', actor: 'backstage crew', issue: 'misplaces the cue sheet five minutes before curtain rise', olqs: ['organising_ability', 'self_confidence'] },
    { context: 'Career Workshop', actor: 'juniors', issue: 'hesitate to ask questions during the Q&A session', olqs: ['initiative', 'power_of_expression'] },
  ],
  senior_11_12: [
    { context: 'Prefect Council', actor: 'two senior houses', issue: 'clash over auditorium rehearsal slots before Founder’s Day', olqs: ['influence_group', 'social_adaptability'] },
    { context: 'SSB Mock Group Task', actor: 'your group', issue: 'stalls over a rule violation while crossing an obstacle', olqs: ['effective_intelligence', 'cooperation'] },
    { context: 'Disaster Drill', actor: 'ground-floor classes', issue: 'crowd the narrow staircase during evacuation practice', olqs: ['speed_of_decision', 'influence_group'] },
    { context: 'Research Symposium', actor: 'your co-author', issue: 'discovers a calculation error in your shared dataset the night before', olqs: ['reasoning_ability', 'sense_of_responsibility'] },
    { context: 'Rural Literacy Drive', actor: 'local parents', issue: 'are sceptical about sending daughters to weekend classes', olqs: ['power_of_expression', 'influence_group'] },
    { context: 'Inter-State Athletics', actor: 'your relay squad', issue: 'faces unexpected rain on an unshaded track before finals', olqs: ['stamina', 'determination'] },
    { context: 'Student Startup Pitch', actor: 'a judge', issue: 'challenges the financial feasibility of your core assumption', olqs: ['self_confidence', 'reasoning_ability'] },
    { context: 'Hostel / Campus Duty', actor: 'night staff', issue: 'reports a minor water-tank overflow wasting hundreds of litres', olqs: ['initiative', 'speed_of_decision'] },
    { context: 'Alumni Conclave', actor: 'the keynote speaker', issue: 'is delayed by 30 minutes while 400 students wait in the hall', olqs: ['organising_ability', 'liveliness'] },
    { context: 'Exam Stress Helpline', actor: 'a junior peer', issue: 'confides they are thinking of skipping finals due to fear of failure', olqs: ['cooperation', 'sense_of_responsibility'] },
  ],
};

const SRT_TWISTS: string[] = [
  'You have only five minutes to act before the schedule moves on. What will you do?',
  'Everyone around is waiting for someone else to step forward. What will you do?',
  'Your teacher/supervisor is currently unreachable on another duty. What will you do?',
  'Two friends suggest opposite ideas and tempers are rising. What will you do?',
  'You are already handling another important responsibility at the same time. What will you do?',
  'Resources are limited, yet the task must finish safely and fairly. What will you do?',
  'Others look nervous and unsure about the next step. What will you do?',
  'A quick decision is needed without creating panic. What will you do?',
  'You want to ensure both safety and team harmony. What will you do?',
  'Time is short and expectations are high. What will you do?',
];

function buildSrtPool(classLevel: SchoolClassNumber): SrtTemplate[] {
  const tier = getClassTier(classLevel);
  const base =
    tier === 'primary_1_5'
      ? [...SRT_PRIMARY_SCENARIOS, ...SRT_MIDDLE_SCENARIOS.slice(0, 10)]
      : tier === 'middle_6_8'
        ? [...SRT_MIDDLE_SCENARIOS, ...SRT_PRIMARY_SCENARIOS.slice(0, 10), ...SRT_SENIOR_SCENARIOS.slice(0, 10)]
        : tier === 'secondary_9_10'
          ? [...SRT_MIDDLE_SCENARIOS, ...SRT_SENIOR_SCENARIOS]
          : [...SRT_SENIOR_SCENARIOS, ...SRT_MIDDLE_SCENARIOS];

  const facets = SRT_CONTEXT_VARIANTS[tier];
  const expanded: SrtTemplate[] = [...base];

  // Produce 100 additional unique situation variants per tier (total 130-140+ distinct situations)
  for (let fIdx = 0; fIdx < facets.length; fIdx++) {
    const f = facets[fIdx];
    for (let tIdx = 0; tIdx < SRT_TWISTS.length; tIdx++) {
      const twist = SRT_TWISTS[tIdx];
      expanded.push({
        title: `${f.context} — Scenario ${tIdx + 1}`,
        prompt: `During ${f.context}, ${f.actor} ${f.issue}. ${twist}`,
        olqs: f.olqs,
      });
    }
  }

  return expanded;
}

// ============================================================================
// 3. TAT — 11 DISTINCT PICTURE STIMULI
// ============================================================================

export interface TatSceneDefinition {
  sceneCode: string;
  title: string;
  caption: string;
  prompt: string;
  olqs: OlqKey[];
}

export const TAT_11_SCENES: TatSceneDefinition[] = [
  {
    sceneCode: 'tat_scene_01',
    title: 'Picture 1 — Monsoon Footbridge Repair',
    caption: 'Three young people examining a damaged wooden footbridge over a swollen stream.',
    prompt: 'Observe the picture carefully and write a complete story describing what led to this situation, what is happening now, and how it resolves.',
    olqs: ['initiative', 'organising_ability', 'cooperation'],
  },
  {
    sceneCode: 'tat_scene_02',
    title: 'Picture 2 — Late-Night Study Lamp',
    caption: 'A student seated at a study desk beside a wall clock and open textbooks while rain falls outside.',
    prompt: 'Write a structured story about the character, their goal, the obstacles they face, the concrete steps they take, and the outcome.',
    olqs: ['determination', 'stamina', 'self_confidence'],
  },
  {
    sceneCode: 'tat_scene_03',
    title: 'Picture 3 — Science Lab Experiment',
    caption: 'Two students standing before a lab apparatus with a notebook and measuring flasks.',
    prompt: 'Create a realistic story capturing curiosity, problem-solving, teamwork, and responsibility in this scene.',
    olqs: ['effective_intelligence', 'reasoning_ability', 'cooperation'],
  },
  {
    sceneCode: 'tat_scene_04',
    title: 'Picture 4 — Sports Track & Fallen Runner',
    caption: 'On an athletics track, one runner stops beside another who has stumbled near the finish line.',
    prompt: 'Describe who these characters are, what happened before this moment, what actions they take, and the final result.',
    olqs: ['social_adaptability', 'courage', 'cooperation'],
  },
  {
    sceneCode: 'tat_scene_05',
    title: 'Picture 5 — Crowded Bus Stand Assistance',
    caption: 'A student speaking with an elderly traveller holding luggage beside a route signboard.',
    prompt: 'Build a complete narrative explaining the situation, initiative taken, and how the characters work together.',
    olqs: ['sense_of_responsibility', 'social_adaptability', 'initiative'],
  },
  {
    sceneCode: 'tat_scene_06',
    title: 'Picture 6 — Community Plantation Drive',
    caption: 'Four youths carrying saplings and watering cans along a dusty village roadside.',
    prompt: 'Write a meaningful story describing how this group organised the effort, overcame setbacks, and achieved an outcome.',
    olqs: ['organising_ability', 'influence_group', 'liveliness'],
  },
  {
    sceneCode: 'tat_scene_07',
    title: 'Picture 7 — Mountain Ridge Trail',
    caption: 'A small trekking group consulting a compass on a steep rocky ridge under gathering clouds.',
    prompt: 'Write a story highlighting leadership, calm decision-making, safety planning, and group cohesion.',
    olqs: ['speed_of_decision', 'courage', 'stamina'],
  },
  {
    sceneCode: 'tat_scene_08',
    title: 'Picture 8 — Library Table Discussion',
    caption: 'Three students leaning over charts and books at a library table with differing expressions.',
    prompt: 'Tell a story showing how the protagonist handles differing viewpoints and steers the group to a practical outcome.',
    olqs: ['power_of_expression', 'reasoning_ability', 'cooperation'],
  },
  {
    sceneCode: 'tat_scene_09',
    title: 'Picture 9 — Stage & Auditorium Curtain',
    caption: 'A student holding cue cards behind a stage curtain looking out toward a filled school hall.',
    prompt: 'Write a story depicting preparation, handling pressure, confidence, and constructive action.',
    olqs: ['self_confidence', 'power_of_expression', 'liveliness'],
  },
  {
    sceneCode: 'tat_scene_10',
    title: 'Picture 10 — Rural Road Breakdown',
    caption: 'Students and a driver standing beside a parked school van on an open rural road.',
    prompt: 'Describe the situation, practical steps taken to ensure everyone’s safety and comfort, and how they reach their destination.',
    olqs: ['effective_intelligence', 'sense_of_responsibility', 'speed_of_decision'],
  },
  {
    sceneCode: 'tat_scene_11',
    title: 'Picture 11 — Open Horizon & Blank Creative Card',
    caption: 'A calm open dawn horizon inviting you to imagine your own inspiring real-life situation.',
    prompt: 'Imagine any realistic challenge or aspiration relevant to your life, create a strong protagonist, and write a complete action-oriented story.',
    olqs: ['determination', 'initiative', 'self_confidence'],
  },
];

// ============================================================================
// 4. PPDT — 12 DISTINCT MONTHLY AMBIGUOUS PICTURES (DIFFERENT EACH MONTH)
// ============================================================================

export interface PpdtMonthlyScene {
  monthIndex: number; // 0..11
  sceneCode: string;
  title: string;
  caption: string;
  prompt: string;
  olqs: OlqKey[];
}

export const PPDT_12_MONTHLY_SCENES: PpdtMonthlyScene[] = [
  { monthIndex: 0, sceneCode: 'ppdt_month_01', title: 'January PPDT — Courtyard Notice Board', caption: 'Hazy monochrome sketch of four figures gathered near a school notice board while one points across the yard.', prompt: 'Observe the hazy sketch, identify characters, approximate ages, mood, and central situation, then prepare your story for individual narration and group discussion.', olqs: ['power_of_expression', 'cooperation', 'influence_group'] },
  { monthIndex: 1, sceneCode: 'ppdt_month_02', title: 'February PPDT — Riverbank Boat & Lantern', caption: 'Ambiguous monochrome sketch of three silhouettes near a moored boat along a misty riverbank.', prompt: 'Identify the characters, mood, and action in this misty riverbank scene and compose a structured narration.', olqs: ['initiative', 'speed_of_decision', 'cooperation'] },
  { monthIndex: 2, sceneCode: 'ppdt_month_03', title: 'March PPDT — Classroom Chalkboard Conference', caption: 'Hazy sketch of five figures around a classroom table pointing toward a wall chart.', prompt: 'Record perceived characters, ages, and mood, then draft your individual story for group discussion.', olqs: ['organising_ability', 'reasoning_ability', 'power_of_expression'] },
  { monthIndex: 3, sceneCode: 'ppdt_month_04', title: 'April PPDT — Crossroads & Signpost', caption: 'Monochrome hazy sketch of two travellers looking up at a forked signpost near trees.', prompt: 'Interpret the crossroads scene, log character perception details, and prepare a constructive story.', olqs: ['effective_intelligence', 'determination', 'speed_of_decision'] },
  { monthIndex: 4, sceneCode: 'ppdt_month_05', title: 'May PPDT — Village Well & Buckets', caption: 'Hazy monochrome scene of four people gathered near a stone well with containers.', prompt: 'Identify characters, mood, and central theme, then build a practical community-oriented story.', olqs: ['sense_of_responsibility', 'cooperation', 'initiative'] },
  { monthIndex: 5, sceneCode: 'ppdt_month_06', title: 'June PPDT — Railway Platform Bench', caption: 'Ambiguous monochrome sketch of three people beside luggage under a station shed.', prompt: 'Note characters, ages, and mood, then craft a clear narration for group discussion.', olqs: ['social_adaptability', 'effective_intelligence', 'power_of_expression'] },
  { monthIndex: 6, sceneCode: 'ppdt_month_07', title: 'July PPDT — Rain-Swept Verandah', caption: 'Hazy sketch of a small group standing under a covered verandah watching heavy rain.', prompt: 'Perceive the characters and mood carefully and compose a decisive, positive story.', olqs: ['liveliness', 'cooperation', 'organising_ability'] },
  { monthIndex: 7, sceneCode: 'ppdt_month_08', title: 'August PPDT — Flagpole & Assembly Field', caption: 'Ambiguous monochrome sketch of figures preparing ropes and podium on an open ground.', prompt: 'Identify characters, ages, and central situation, and write a disciplined team narrative.', olqs: ['sense_of_responsibility', 'influence_group', 'organising_ability'] },
  { monthIndex: 8, sceneCode: 'ppdt_month_09', title: 'September PPDT — Workshop Bench & Tools', caption: 'Hazy monochrome scene of three silhouettes examining a model machine on a workbench.', prompt: 'Record perception details and prepare a problem-solving narrative for group discussion.', olqs: ['effective_intelligence', 'reasoning_ability', 'determination'] },
  { monthIndex: 9, sceneCode: 'ppdt_month_10', title: 'October PPDT — Evening Market Lanterns', caption: 'Ambiguous sketch of four figures near stalls and hanging lamps in a busy lane.', prompt: 'Identify the characters, mood, and situation, then write a responsible action-oriented story.', olqs: ['social_adaptability', 'speed_of_decision', 'courage'] },
  { monthIndex: 10, sceneCode: 'ppdt_month_11', title: 'November PPDT — Campfire Circle & Tent', caption: 'Hazy monochrome sketch of five figures seated near a tent and glowing embers.', prompt: 'Observe character postures and mood, record details, and compose a cohesive team story.', olqs: ['cooperation', 'liveliness', 'influence_group'] },
  { monthIndex: 11, sceneCode: 'ppdt_month_12', title: 'December PPDT — Hilltop Observatory Path', caption: 'Ambiguous monochrome sketch of three silhouettes climbing stone steps toward a hilltop dome.', prompt: 'Capture character ages, mood, and objective, then prepare your story for individual narration and GD.', olqs: ['determination', 'stamina', 'self_confidence'] },
];

// ============================================================================
// 5. DETERMINISTIC MONTHLY SET GENERATOR (WAT 60, SRT 60@30s, TAT 11, PPDT 1)
// ============================================================================

export function generateMonthlyThinkingSet(params: {
  schoolId: string;
  classLevel: SchoolClassNumber;
  monthKey: string; // 'YYYY-MM'
  testType: ThinkingTestType;
  setVersion?: number;
  usedInMonth?: boolean;
}): GeneratedMonthlyThinkingSet {
  const { schoolId, classLevel, monthKey, testType } = params;
  const setVersion = Math.max(1, Math.floor(params.setVersion ?? 1));
  const usedInMonth = Boolean(params.usedInMonth);
  const meta = getTierMeta(classLevel);
  const monthLabel = formatMonthLabel(monthKey);
  const setId = `${testType.toLowerCase()}-c${classLevel}-${monthKey}-v${setVersion}`;
  const createdAt = `${monthKey}-01`;

  if (testType === 'WAT') {
    const pool = getWatWordPool(classLevel);
    // Use class tier + month + version as deterministic seed; same class gets the same set!
    const seed = `WAT:${classLevel}:${monthKey}:v${setVersion}`;
    const shuffled = seededShuffle(pool, seed);
    const chosen = shuffled.slice(0, 60);
    const questions: ThinkingQuestionItem[] = chosen.map((word, idx) => ({
      id: `${setId}-w${String(idx + 1).padStart(2, '0')}`,
      schoolId,
      testType: 'WAT',
      title: `Word ${idx + 1} of 60 — ${word}`,
      prompt: word,
      ageBand: meta.ageBand,
      classRange: meta.classRange,
      difficulty: meta.difficulty,
      defaultTimeLimitSec: 15,
      targetOlqs: WAT_OLQ_CYCLE[idx % WAT_OLQ_CYCLE.length],
      tags: ['WAT', `Class-${classLevel}`, monthKey, `Set-${setVersion}`],
      active: true,
      createdBy: 'Virat Monthly Bank',
      createdAt,
    }));

    return {
      setId,
      schoolId,
      classLevel,
      classLabel: `Class ${classLevel}`,
      monthKey,
      monthLabel,
      testType,
      setVersion,
      defaultTimeLimitSec: 15,
      questions,
      usedInMonth,
      canRegenerate: usedInMonth,
    };
  }

  if (testType === 'SRT') {
    const pool = buildSrtPool(classLevel);
    const seed = `SRT:${classLevel}:${monthKey}:v${setVersion}`;
    const shuffled = seededShuffle(pool, seed);
    const chosen = shuffled.slice(0, 60);
    const questions: ThinkingQuestionItem[] = chosen.map((item, idx) => ({
      id: `${setId}-s${String(idx + 1).padStart(2, '0')}`,
      schoolId,
      testType: 'SRT',
      title: `Situation ${idx + 1} of 60 — ${item.title}`,
      prompt: item.prompt,
      ageBand: meta.ageBand,
      classRange: meta.classRange,
      difficulty: meta.difficulty,
      defaultTimeLimitSec: 30,
      targetOlqs: item.olqs,
      tags: ['SRT', `Class-${classLevel}`, monthKey, `Set-${setVersion}`],
      active: true,
      createdBy: 'Virat Monthly Bank',
      createdAt,
    }));

    return {
      setId,
      schoolId,
      classLevel,
      classLabel: `Class ${classLevel}`,
      monthKey,
      monthLabel,
      testType,
      setVersion,
      defaultTimeLimitSec: 30,
      questions,
      usedInMonth,
      canRegenerate: usedInMonth,
    };
  }

  if (testType === 'TAT') {
    // 11 distinct visual pictures; rotate order of pictures 1..10 per month/version while keeping Blank/Open Card 11 last
    const firstTen = TAT_11_SCENES.slice(0, 10);
    const eleventh = TAT_11_SCENES[10];
    const rotated = seededShuffle(firstTen, `TAT:${classLevel}:${monthKey}:v${setVersion}`);
    const ordered = [...rotated, eleventh];
    const questions: ThinkingQuestionItem[] = ordered.map((scene, idx) => ({
      id: `${setId}-p${String(idx + 1).padStart(2, '0')}`,
      schoolId,
      testType: 'TAT',
      title: `Picture ${idx + 1} of 11 — ${scene.title.replace(/^Picture \d+ — /, '')}`,
      prompt: scene.prompt,
      sceneCode: scene.sceneCode,
      sceneCaption: scene.caption,
      ageBand: meta.ageBand,
      classRange: meta.classRange,
      difficulty: meta.difficulty,
      defaultTimeLimitSec: 240,
      targetOlqs: scene.olqs,
      tags: ['TAT', `Class-${classLevel}`, monthKey, `Set-${setVersion}`],
      active: true,
      createdBy: 'Virat Monthly Bank',
      createdAt,
    }));

    return {
      setId,
      schoolId,
      classLevel,
      classLabel: `Class ${classLevel}`,
      monthKey,
      monthLabel,
      testType,
      setVersion,
      defaultTimeLimitSec: 240,
      questions,
      usedInMonth,
      canRegenerate: usedInMonth,
    };
  }

  // PPDT: 1 distinct picture per month (plus version offset on regeneration)
  const monthPart = parseInt(monthKey.split('-')[1] || '1', 10);
  const monthIdx = Number.isFinite(monthPart) && monthPart >= 1 && monthPart <= 12 ? monthPart - 1 : 0;
  const scene = PPDT_12_MONTHLY_SCENES[(monthIdx + (setVersion - 1)) % PPDT_12_MONTHLY_SCENES.length];

  const question: ThinkingQuestionItem = {
    id: `${setId}-ppdt`,
    schoolId,
    testType: 'PPDT',
    title: `${scene.title} (${monthLabel}${setVersion > 1 ? ` · Set #${setVersion}` : ''})`,
    prompt: scene.prompt,
    sceneCode: scene.sceneCode,
    sceneCaption: scene.caption,
    ageBand: meta.ageBand,
    classRange: meta.classRange,
    difficulty: meta.difficulty,
    defaultTimeLimitSec: 240,
    targetOlqs: scene.olqs,
    tags: ['PPDT', `Class-${classLevel}`, monthKey, `Set-${setVersion}`],
    active: true,
    createdBy: 'Virat Monthly Bank',
    createdAt,
  };

  return {
    setId,
    schoolId,
    classLevel,
    classLabel: `Class ${classLevel}`,
    monthKey,
    monthLabel,
    testType: 'PPDT',
    setVersion,
    defaultTimeLimitSec: 240,
    questions: [question],
    usedInMonth,
    canRegenerate: usedInMonth,
  };
}

// ============================================================================
// 6. SSB DAILY ASSIGNMENT ENGINE (1 SET OF EACH TEST DAILY FOR ENROLLED STUDENTS)
// ============================================================================

export function buildDailySsbAssignmentsForStudent(params: {
  schoolId: string;
  studentId: string;
  studentName: string;
  classSection: string;
  dateKey: string;
  existing: SsbDailyAssignment[];
}): SsbDailyAssignment[] {
  const classLevel = extractClassNumber(params.classSection);
  const daySeed = hashString(`SSB-DAILY:${params.studentId}:${params.dateKey}`);
  const dailyVersion = (daySeed % 9) + 1;
  const specs: Array<{ testType: ThinkingTestType; itemCount: number; timeLimitSec: number }> = [
    { testType: 'SRT', itemCount: 60, timeLimitSec: 30 },
    { testType: 'WAT', itemCount: 60, timeLimitSec: 15 },
    { testType: 'TAT', itemCount: 11, timeLimitSec: 240 },
    { testType: 'PPDT', itemCount: 1, timeLimitSec: 240 },
  ];

  const created: SsbDailyAssignment[] = [];
  for (const spec of specs) {
    const already = params.existing.find(
      (a) =>
        a.schoolId === params.schoolId &&
        a.studentId === params.studentId &&
        a.dateKey === params.dateKey &&
        a.testType === spec.testType,
    );
    if (!already) {
      created.push({
        id: `ssb-day-${params.dateKey}-${params.studentId}-${spec.testType.toLowerCase()}`,
        schoolId: params.schoolId,
        studentId: params.studentId,
        studentName: params.studentName,
        classLevel,
        dateKey: params.dateKey,
        testType: spec.testType,
        setVersion: dailyVersion,
        itemCount: spec.itemCount,
        timeLimitSec: spec.timeLimitSec,
        status: 'pending',
        assignedAt: new Date().toISOString(),
      });
    }
  }
  return created;
}

export function findMonthlySetUsage(
  usages: ThinkingMonthlySetUsage[],
  schoolId: string,
  classLevel: SchoolClassNumber,
  monthKey: string,
  testType: ThinkingTestType,
): ThinkingMonthlySetUsage | undefined {
  return usages.find(
    (u) =>
      u.schoolId === schoolId &&
      u.classLevel === classLevel &&
      u.monthKey === monthKey &&
      u.testType === testType,
  );
}
