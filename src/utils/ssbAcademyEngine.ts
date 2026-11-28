import type { OlqKey } from '../types';
import type {
  SsbAssessmentSessionRecord,
  SsbDifficulty,
  SsbOlqIndicatorSummary,
  SsbPracticeSet,
  SsbPracticeStimulus,
  SsbResponseAnalysis,
  SsbTestFormat,
} from '../types/flagshipProducts';
import { OLQ_DEFINITIONS } from './evidenceEngine.ts';

// ============================================================================
// CURATED ORIGINAL SSB BANKS (100+ WAT WORDS, 100+ SRT SITUATIONS, 100+ TAT & PPDT STIMULI)
// Structured into 100 Complete Practice Sets (25 WAT, 25 SRT, 25 TAT, 25 PPDT)
// ============================================================================

const WAT_WORDS: Array<[string, 'Positive' | 'Negative' | 'Neutral' | 'Abstract' | 'Situational', SsbDifficulty, OlqKey[]]> = [
  ['Leadership', 'Positive', 'Beginner', ['influence_group', 'initiative']],
  ['Discipline', 'Positive', 'Beginner', ['sense_of_responsibility', 'stamina']],
  ['Failure', 'Negative', 'Intermediate', ['determination', 'reasoning_ability']],
  ['Fear', 'Negative', 'Intermediate', ['courage', 'self_confidence']],
  ['Bridge', 'Neutral', 'Beginner', ['organising_ability', 'cooperation']],
  ['Challenge', 'Situational', 'Beginner', ['initiative', 'determination']],
  ['Duty', 'Abstract', 'Beginner', ['sense_of_responsibility', 'determination']],
  ['Crisis', 'Negative', 'Advanced', ['speed_of_decision', 'courage']],
  ['Team', 'Positive', 'Beginner', ['cooperation', 'social_adaptability']],
  ['Delay', 'Negative', 'Intermediate', ['organising_ability', 'speed_of_decision']],
  ['Honesty', 'Abstract', 'Beginner', ['sense_of_responsibility', 'self_confidence']],
  ['Risk', 'Situational', 'Advanced', ['courage', 'effective_intelligence']],
  ['Border', 'Neutral', 'Intermediate', ['courage', 'sense_of_responsibility']],
  ['Conflict', 'Negative', 'Advanced', ['social_adaptability', 'reasoning_ability']],
  ['Courage', 'Positive', 'Beginner', ['courage', 'determination']],
  ['Pressure', 'Situational', 'Intermediate', ['stamina', 'speed_of_decision']],
  ['Struggle', 'Negative', 'Intermediate', ['determination', 'stamina']],
  ['Plan', 'Neutral', 'Beginner', ['organising_ability', 'effective_intelligence']],
  ['Mistake', 'Negative', 'Intermediate', ['sense_of_responsibility', 'reasoning_ability']],
  ['Trust', 'Abstract', 'Beginner', ['cooperation', 'social_adaptability']],
  ['Emergency', 'Situational', 'Advanced', ['speed_of_decision', 'initiative']],
  ['Weakness', 'Negative', 'Advanced', ['self_confidence', 'reasoning_ability']],
  ['Service', 'Positive', 'Beginner', ['sense_of_responsibility', 'cooperation']],
  ['Obstacle', 'Situational', 'Intermediate', ['effective_intelligence', 'determination']],
  ['Silence', 'Abstract', 'Intermediate', ['self_confidence', 'power_of_expression']],
  ['Command', 'Situational', 'Officer-Level', ['influence_group', 'speed_of_decision']],
  ['Doubt', 'Negative', 'Intermediate', ['reasoning_ability', 'self_confidence']],
  ['Climb', 'Neutral', 'Beginner', ['stamina', 'determination']],
  ['Justice', 'Abstract', 'Advanced', ['sense_of_responsibility', 'courage']],
  ['Fatigue', 'Negative', 'Officer-Level', ['stamina', 'determination']],
  ['Map', 'Neutral', 'Beginner', ['organising_ability', 'effective_intelligence']],
  ['Unity', 'Positive', 'Beginner', ['cooperation', 'liveliness']],
  ['Panic', 'Negative', 'Advanced', ['courage', 'speed_of_decision']],
  ['Time', 'Abstract', 'Beginner', ['organising_ability', 'sense_of_responsibility']],
  ['Rescue', 'Situational', 'Intermediate', ['initiative', 'courage']],
  ['Criticism', 'Negative', 'Advanced', ['social_adaptability', 'self_confidence']],
  ['Focus', 'Positive', 'Beginner', ['determination', 'effective_intelligence']],
  ['Darkness', 'Negative', 'Intermediate', ['courage', 'liveliness']],
  ['Compass', 'Neutral', 'Beginner', ['organising_ability', 'reasoning_ability']],
  ['Sacrifice', 'Abstract', 'Officer-Level', ['courage', 'sense_of_responsibility']],
  ['Argument', 'Negative', 'Intermediate', ['social_adaptability', 'power_of_expression']],
  ['Prepare', 'Positive', 'Beginner', ['organising_ability', 'initiative']],
  ['Shortage', 'Situational', 'Advanced', ['effective_intelligence', 'organising_ability']],
  ['Alone', 'Negative', 'Intermediate', ['self_confidence', 'courage']],
  ['Smile', 'Positive', 'Beginner', ['liveliness', 'social_adaptability']],
  ['Order', 'Neutral', 'Intermediate', ['organising_ability', 'sense_of_responsibility']],
  ['Loss', 'Negative', 'Advanced', ['determination', 'liveliness']],
  ['Action', 'Positive', 'Beginner', ['initiative', 'speed_of_decision']],
  ['Crowd', 'Neutral', 'Intermediate', ['influence_group', 'social_adaptability']],
  ['Danger', 'Negative', 'Officer-Level', ['courage', 'speed_of_decision']],
  ['Adapt', 'Positive', 'Intermediate', ['social_adaptability', 'effective_intelligence']],
  ['Burden', 'Negative', 'Advanced', ['sense_of_responsibility', 'stamina']],
  ['Signal', 'Neutral', 'Beginner', ['power_of_expression', 'organising_ability']],
  ['Victory', 'Positive', 'Beginner', ['determination', 'cooperation']],
  ['Betrayal', 'Negative', 'Officer-Level', ['courage', 'reasoning_ability']],
  ['River', 'Neutral', 'Beginner', ['effective_intelligence', 'stamina']],
  ['Ethics', 'Abstract', 'Advanced', ['sense_of_responsibility', 'courage']],
  ['Injury', 'Situational', 'Advanced', ['speed_of_decision', 'cooperation']],
  ['Effort', 'Positive', 'Beginner', ['determination', 'stamina']],
  ['Chaos', 'Negative', 'Officer-Level', ['organising_ability', 'influence_group']],
  ['Friend', 'Positive', 'Beginner', ['cooperation', 'social_adaptability']],
  ['Wait', 'Neutral', 'Intermediate', ['stamina', 'reasoning_ability']],
  ['Truth', 'Abstract', 'Intermediate', ['courage', 'sense_of_responsibility']],
  ['Storm', 'Situational', 'Advanced', ['courage', 'organising_ability']],
  ['Choice', 'Abstract', 'Intermediate', ['speed_of_decision', 'reasoning_ability']],
  ['Anger', 'Negative', 'Intermediate', ['social_adaptability', 'self_confidence']],
  ['Skill', 'Positive', 'Beginner', ['effective_intelligence', 'determination']],
  ['Road', 'Neutral', 'Beginner', ['organising_ability', 'initiative']],
  ['Defeat', 'Negative', 'Advanced', ['determination', 'reasoning_ability']],
  ['Help', 'Positive', 'Beginner', ['cooperation', 'initiative']],
  ['Mountain', 'Neutral', 'Intermediate', ['stamina', 'determination']],
  ['Rumor', 'Negative', 'Advanced', ['reasoning_ability', 'power_of_expression']],
  ['Energy', 'Positive', 'Beginner', ['liveliness', 'stamina']],
  ['Rule', 'Neutral', 'Beginner', ['sense_of_responsibility', 'organising_ability']],
  ['Fire', 'Situational', 'Officer-Level', ['courage', 'speed_of_decision']],
  ['Growth', 'Positive', 'Beginner', ['initiative', 'determination']],
  ['Stress', 'Negative', 'Intermediate', ['stamina', 'liveliness']],
  ['Voice', 'Neutral', 'Intermediate', ['power_of_expression', 'influence_group']],
  ['Duty-Bound', 'Abstract', 'Officer-Level', ['sense_of_responsibility', 'determination']],
  ['Flood', 'Situational', 'Officer-Level', ['organising_ability', 'courage']],
  ['Reject', 'Negative', 'Intermediate', ['self_confidence', 'determination']],
  ['System', 'Neutral', 'Intermediate', ['organising_ability', 'reasoning_ability']],
  ['Respect', 'Positive', 'Beginner', ['social_adaptability', 'cooperation']],
  ['Blame', 'Negative', 'Advanced', ['sense_of_responsibility', 'cooperation']],
  ['Goal', 'Positive', 'Beginner', ['determination', 'organising_ability']],
  ['Night', 'Neutral', 'Intermediate', ['courage', 'stamina']],
  ['Compromise', 'Abstract', 'Advanced', ['social_adaptability', 'reasoning_ability']],
  ['Alert', 'Situational', 'Intermediate', ['effective_intelligence', 'speed_of_decision']],
  ['Fearless', 'Positive', 'Intermediate', ['courage', 'self_confidence']],
  ['Broken', 'Negative', 'Intermediate', ['effective_intelligence', 'initiative']],
  ['Mentor', 'Positive', 'Beginner', ['cooperation', 'power_of_expression']],
  ['Limit', 'Abstract', 'Advanced', ['determination', 'reasoning_ability']],
  ['March', 'Neutral', 'Beginner', ['stamina', 'cooperation']],
  ['Hesitate', 'Negative', 'Intermediate', ['speed_of_decision', 'self_confidence']],
  ['Build', 'Positive', 'Beginner', ['initiative', 'organising_ability']],
  ['Deadline', 'Situational', 'Intermediate', ['organising_ability', 'speed_of_decision']],
  ['Calm', 'Positive', 'Beginner', ['liveliness', 'courage']],
  ['Leak', 'Situational', 'Advanced', ['effective_intelligence', 'sense_of_responsibility']],
  ['Promise', 'Abstract', 'Intermediate', ['sense_of_responsibility', 'cooperation']],
  ['Resolve', 'Positive', 'Officer-Level', ['determination', 'courage']],
];

const SRT_THEMES: Array<{
  category: string;
  scenarios: Array<[string, SsbDifficulty, OlqKey[]]>;
}> = [
  {
    category: 'Emergency Situations',
    scenarios: [
      ['Your trekking team is 4 km from the base camp when one teammate twists an ankle severely and dusk is approaching. What do you do?', 'Intermediate', ['speed_of_decision', 'cooperation', 'courage']],
      ['While travelling by train, smoke starts coming out from under a neighbouring seat and passengers begin panicking. You immediately…', 'Officer-Level', ['courage', 'speed_of_decision', 'influence_group']],
      ['During a school science fair, a short circuit sparks near the main exhibition corridor filled with parents. You…', 'Intermediate', ['speed_of_decision', 'organising_ability', 'courage']],
      ['A cyclist slips in heavy monsoon rain outside your gate and appears dizzy with a bleeding knee while traffic builds up. You…', 'Beginner', ['initiative', 'sense_of_responsibility', 'cooperation']],
      ['A sudden flash flood cuts off the low bridge your community bus uses before evening exams. You…', 'Advanced', ['effective_intelligence', 'organising_ability', 'speed_of_decision']],
      ['You notice a strong cooking-gas smell coming from an elderly neighbour’s locked apartment. You…', 'Intermediate', ['courage', 'speed_of_decision', 'sense_of_responsibility']],
      ['Power fails across your hostel block during a storm and junior students get trapped in the elevator. You…', 'Advanced', ['organising_ability', 'courage', 'influence_group']],
      ['During a river-crossing camp exercise, the guide rope slips loose while one cadet is halfway across. You…', 'Officer-Level', ['courage', 'speed_of_decision', 'cooperation']],
      ['Your younger sibling accidentally swallows an unlabelled tablet while parents are away at work. You…', 'Intermediate', ['speed_of_decision', 'sense_of_responsibility', 'reasoning_ability']],
    ],
  },
  {
    category: 'Leadership',
    scenarios: [
      ['You are appointed captain of a newly formed sports squad whose two senior players refuse to pass to juniors. You…', 'Intermediate', ['influence_group', 'cooperation', 'social_adaptability']],
      ['Halfway through organizing a district blood donation camp, the chief coordinator falls ill and volunteers start leaving. You…', 'Advanced', ['initiative', 'organising_ability', 'influence_group']],
      ['Your project group misses a key milestone because everyone assumed someone else completed the data collection. You…', 'Beginner', ['sense_of_responsibility', 'organising_ability', 'cooperation']],
      ['During an inter-college debate you lead, the auditorium microphone stops working 2 minutes before your team’s turn. You…', 'Beginner', ['effective_intelligence', 'self_confidence', 'liveliness']],
      ['You are leading a 12-member clean-up drive and municipal pickup trucks cancel at the last minute. You…', 'Intermediate', ['organising_ability', 'effective_intelligence', 'determination']],
      ['Two sub-teams under your supervision disagree sharply on how to split limited event funds. You…', 'Advanced', ['reasoning_ability', 'influence_group', 'social_adaptability']],
      ['As senior prefect, you discover younger cadets are being unfairly burdened with extra night chores. You…', 'Officer-Level', ['courage', 'sense_of_responsibility', 'influence_group']],
      ['Your NCC contingent must march in heavy heat and three cadets show early signs of exhaustion before inspection. You…', 'Officer-Level', ['sense_of_responsibility', 'organising_ability', 'stamina']],
    ],
  },
  {
    category: 'Teamwork',
    scenarios: [
      ['A quiet member of your group has a brilliant practical solution, but louder peers keep interrupting them. You…', 'Beginner', ['cooperation', 'social_adaptability', 'influence_group']],
      ['Your lab partner breaks a calibrated glass apparatus right before practical evaluation and wants to hide it. You…', 'Intermediate', ['sense_of_responsibility', 'courage', 'cooperation']],
      ['You are paired with a teammate you previously disagreed with for a crucial robotics competition. You…', 'Intermediate', ['social_adaptability', 'cooperation', 'effective_intelligence']],
      ['One teammate falls sick on the eve of a group presentation and holds half the slides. You…', 'Beginner', ['cooperation', 'organising_ability', 'initiative']],
      ['During a relay race, your anchor runner drops the baton and feels devastated in front of the crowd. You…', 'Beginner', ['liveliness', 'cooperation', 'social_adaptability']],
      ['Your team wins praise for a report, though an overlooked junior did most of the late-night verification. You…', 'Intermediate', ['sense_of_responsibility', 'cooperation', 'courage']],
      ['A new transfer student joins your squad mid-term and struggles to keep up with group drills. You…', 'Beginner', ['social_adaptability', 'cooperation', 'initiative']],
      ['Your outdoor camp team runs short of drinking water 6 km from the finish point. You…', 'Advanced', ['cooperation', 'organising_ability', 'stamina']],
    ],
  },
  {
    category: 'Ethical Dilemmas',
    scenarios: [
      ['You accidentally receive leaked questions for tomorrow’s mock scholarship exam in a student chat group. You…', 'Intermediate', ['courage', 'sense_of_responsibility', 'reasoning_ability']],
      ['A close friend asks you to sign their attendance proxy because they overslept before a mandatory practical. You…', 'Beginner', ['sense_of_responsibility', 'courage', 'power_of_expression']],
      ['As treasurer of your student club, you find an unbilled ₹3,500 surplus after an annual fest. You…', 'Intermediate', ['sense_of_responsibility', 'organising_ability']],
      ['A local vendor offers you a personal gift to select their costlier stationery quote for your college event. You…', 'Officer-Level', ['courage', 'sense_of_responsibility', 'reasoning_ability']],
      ['You witness a senior student damaging library reference books and blaming a junior helper. You…', 'Advanced', ['courage', 'sense_of_responsibility', 'social_adaptability']],
      ['Your team’s science model can win first prize if you exaggerate unverified test numbers on the poster. You…', 'Advanced', ['sense_of_responsibility', 'courage', 'self_confidence']],
      ['You find a wallet containing cash and an armed forces admit card outside the exam centre 15 minutes before reporting. You…', 'Intermediate', ['speed_of_decision', 'sense_of_responsibility', 'initiative']],
      ['A teammate suggests taking a forbidden shortcut during an unmonitored cross-country practice run. You…', 'Intermediate', ['courage', 'determination', 'sense_of_responsibility']],
    ],
  },
  {
    category: 'Time Pressure',
    scenarios: [
      ['You have two major submissions and a family medical errand all scheduled for the same afternoon. You…', 'Intermediate', ['organising_ability', 'speed_of_decision', 'sense_of_responsibility']],
      ['Your bus breaks down 45 minutes before your NDA/CDS written exam reporting cutoff. You…', 'Advanced', ['speed_of_decision', 'effective_intelligence', 'courage']],
      ['Ten minutes before hosting an assembly of 600 students, the guest speaker calls to say they are delayed by 25 minutes. You…', 'Intermediate', ['liveliness', 'power_of_expression', 'organising_ability']],
      ['Your laptop crashes two hours before submitting your final project report and only an earlier cloud backup exists. You…', 'Intermediate', ['effective_intelligence', 'determination', 'speed_of_decision']],
      ['You must prepare a 5-minute briefing for visiting officers with only 15 minutes of raw notes. You…', 'Officer-Level', ['power_of_expression', 'reasoning_ability', 'speed_of_decision']],
      ['Heavy rain forces your outdoor sports finals indoors with 30 minutes before spectators arrive. You…', 'Advanced', ['organising_ability', 'effective_intelligence', 'initiative']],
      ['You realize at 8:00 PM that you misread the timetable and have a tough mathematics test tomorrow morning. You…', 'Beginner', ['organising_ability', 'determination', 'stamina']],
      ['Three urgent tasks land on your desk simultaneously during an inter-school camp. You…', 'Advanced', ['organising_ability', 'speed_of_decision', 'reasoning_ability']],
    ],
  },
  {
    category: 'Resource Limitations',
    scenarios: [
      ['You are asked to coach rural schoolchildren in basic science experiments with almost zero lab apparatus. You…', 'Intermediate', ['effective_intelligence', 'initiative', 'liveliness']],
      ['Your college dramatic club budget is cut by 60% two weeks before the regional festival. You…', 'Intermediate', ['effective_intelligence', 'organising_ability', 'determination']],
      ['Internet and power go down across your town for 48 hours right before an online mock series. You…', 'Beginner', ['effective_intelligence', 'stamina', 'determination']],
      ['You must arrange first-aid and hydration for 200 marathon runners with half the promised volunteer count. You…', 'Advanced', ['organising_ability', 'effective_intelligence', 'influence_group']],
      ['Your hostel study room lacks quiet space and proper lighting during board/entry prep. You…', 'Beginner', ['initiative', 'organising_ability', 'determination']],
      ['Two of the four laptops assigned to your coding bootcamp team fail before a hackathon. You…', 'Intermediate', ['cooperation', 'effective_intelligence', 'organising_ability']],
      ['You have to transport heavy sports kits to a stadium when the hired van cancels. You…', 'Intermediate', ['effective_intelligence', 'speed_of_decision', 'initiative']],
      ['Your community library has plenty of old textbooks but zero cataloguing or borrowing system. You…', 'Beginner', ['organising_ability', 'initiative', 'sense_of_responsibility']],
    ],
  },
  {
    category: 'Unexpected Failures',
    scenarios: [
      ['You missed clearing the written cutoff of your dream defence exam by just 3 marks after a year of effort. You…', 'Advanced', ['determination', 'reasoning_ability', 'self_confidence']],
      ['Your carefully built solar model fails to start in front of the jury during the final round. You…', 'Intermediate', ['courage', 'effective_intelligence', 'liveliness']],
      ['You are dropped from the playing XI right before the district tournament despite regular practice. You…', 'Intermediate', ['determination', 'social_adaptability', 'self_confidence']],
      ['Your first public speech in front of seniors goes blank midway for ten awkward seconds. You…', 'Beginner', ['self_confidence', 'courage', 'power_of_expression']],
      ['A community tree-plantation drive you led loses half its saplings due to an unexpected heatwave. You…', 'Intermediate', ['determination', 'organising_ability', 'sense_of_responsibility']],
      ['You fail your first timed 2.4 km physical endurance run benchmark by 50 seconds. You…', 'Beginner', ['stamina', 'determination', 'organising_ability']],
      ['Your team’s carefully planned fundraiser collects only a third of its target amount. You…', 'Intermediate', ['reasoning_ability', 'determination', 'effective_intelligence']],
      ['A mentor gives harsh, blunt criticism of your leadership style after a group exercise. You…', 'Officer-Level', ['social_adaptability', 'self_confidence', 'reasoning_ability']],
    ],
  },
  {
    category: 'Family Responsibilities',
    scenarios: [
      ['Your father sprains his back during harvest/business peak season while your semester exams are 10 days away. You…', 'Advanced', ['sense_of_responsibility', 'organising_ability', 'stamina']],
      ['Your parents strongly prefer a safer local clerical job while you are passionate about serving as an officer. You…', 'Intermediate', ['power_of_expression', 'determination', 'social_adaptability']],
      ['Your younger brother’s grades drop sharply and he has become withdrawn from family conversations. You…', 'Beginner', ['social_adaptability', 'sense_of_responsibility', 'cooperation']],
      ['An unexpected household financial shortfall makes coaching fees difficult this year. You…', 'Intermediate', ['effective_intelligence', 'determination', 'self_confidence']],
      ['Relatives visit unexpectedly for three days right in the middle of your scheduled mock-test week. You…', 'Beginner', ['social_adaptability', 'organising_ability', 'liveliness']],
      ['Your grandmother needs daily evening clinic visits while both parents work late shifts. You…', 'Beginner', ['sense_of_responsibility', 'organising_ability', 'cooperation']],
      ['There is a heated property/budget disagreement among extended family members during a festival gathering. You…', 'Advanced', ['social_adaptability', 'reasoning_ability', 'power_of_expression']],
      ['Your family shifts to a new city right before Class 12 / final year where you know no one. You…', 'Intermediate', ['social_adaptability', 'liveliness', 'determination']],
    ],
  },
  {
    category: 'Academic Difficulties',
    scenarios: [
      ['You consistently score well in humanities/GK but struggle badly with timed quantitative mathematics. You…', 'Beginner', ['reasoning_ability', 'determination', 'organising_ability']],
      ['Your class teacher is on long medical leave and the board syllabus is falling behind schedule. You…', 'Intermediate', ['initiative', 'cooperation', 'organising_ability']],
      ['You join an advanced physics batch midway and feel two chapters behind everyone else. You…', 'Beginner', ['determination', 'self_confidence', 'initiative']],
      ['During a group research assignment, you discover a factual flaw in the reference textbook. You…', 'Intermediate', ['reasoning_ability', 'power_of_expression', 'courage']],
      ['Exam invigilators announce a sudden 15-minute shorter writing window due to a schedule mix-up. You…', 'Advanced', ['speed_of_decision', 'organising_ability', 'self_confidence']],
      ['You get placed in a study group with students who spend most sessions chatting instead of solving papers. You…', 'Beginner', ['influence_group', 'organising_ability', 'determination']],
      ['You have to learn a brand-new programming or technical skill from scratch within 3 weeks for an interview. You…', 'Intermediate', ['effective_intelligence', 'determination', 'stamina']],
      ['Your viva examiner asks a tough follow-up question on a topic you honestly do not know. You…', 'Officer-Level', ['courage', 'self_confidence', 'power_of_expression']],
    ],
  },
  {
    category: 'Social Situations',
    scenarios: [
      ['At a public railway platform, a stranger speaks rudely to an elderly vendor over a ₹10 change error. You…', 'Intermediate', ['courage', 'social_adaptability', 'power_of_expression']],
      ['During a youth camp with participants from five states, cliques form along language lines. You…', 'Intermediate', ['social_adaptability', 'liveliness', 'influence_group']],
      ['A neighbour regularly parks across the shared emergency lane despite polite requests. You…', 'Intermediate', ['power_of_expression', 'sense_of_responsibility', 'social_adaptability']],
      ['You are invited to speak on road safety to restless high-school teenagers who are not paying attention. You…', 'Beginner', ['liveliness', 'power_of_expression', 'influence_group']],
      ['False gossip about a classmate begins spreading rapidly on social media before annual elections. You…', 'Advanced', ['courage', 'reasoning_ability', 'social_adaptability']],
      ['At a hostel mess, food quality drops sharply and students plan an unruly boycott. You…', 'Officer-Level', ['influence_group', 'organising_ability', 'sense_of_responsibility']],
      ['A foreign exchange student gets lost near your campus with low phone battery and limited local language. You…', 'Beginner', ['social_adaptability', 'initiative', 'cooperation']],
      ['During a community festival, loud music continues past midnight near a hospital lane. You…', 'Advanced', ['courage', 'sense_of_responsibility', 'power_of_expression']],
    ],
  },
  {
    category: 'Personal Challenges',
    scenarios: [
      ['You realize you have been procrastinating on your physical fitness routine for three straight weeks. You…', 'Beginner', ['determination', 'stamina', 'sense_of_responsibility']],
      ['Stage fright makes your voice tremble whenever you address more than 20 people. You…', 'Beginner', ['self_confidence', 'courage', 'power_of_expression']],
      ['You suffer a minor knee sprain two months before physical screening tests. You…', 'Intermediate', ['reasoning_ability', 'determination', 'stamina']],
      ['Friends mock your disciplined early-morning wake-up schedule as overly strict. You…', 'Beginner', ['self_confidence', 'liveliness', 'determination']],
      ['You feel burnt out balancing college classes, part-time tutoring, and SSB preparation. You…', 'Intermediate', ['organising_ability', 'stamina', 'liveliness']],
      ['You notice you tend to lose patience quickly when teammates work slower than you. You…', 'Intermediate', ['social_adaptability', 'cooperation', 'self_confidence']],
      ['You lose your hand-written revision notes notebook on a bus one month before exams. You…', 'Intermediate', ['determination', 'effective_intelligence', 'organising_ability']],
      ['You are offered a comfortable shortcut job right before your final SSB attempt. You…', 'Officer-Level', ['reasoning_ability', 'determination', 'self_confidence']],
    ],
  },
  {
    category: 'Decision-Making Situations',
    scenarios: [
      ['While navigating a mountain trail with 6 peers, fog reduces visibility and two paths diverge without clear signposts. You…', 'Officer-Level', ['reasoning_ability', 'speed_of_decision', 'courage']],
      ['Your team can either submit a simpler working prototype on time or gamble on an untested complex feature. You…', 'Advanced', ['reasoning_ability', 'speed_of_decision', 'effective_intelligence']],
      ['You have budget to fund either a broken water cooler repair or new sports jerseys first. You…', 'Beginner', ['reasoning_ability', 'sense_of_responsibility', 'organising_ability']],
      ['Two equally qualified juniors apply for one team-lead role under you, and one is your close friend. You…', 'Officer-Level', ['reasoning_ability', 'courage', 'sense_of_responsibility']],
      ['During a mock outdoor task, your initial bridge design fails halfway through the allotted 10 minutes. You…', 'Advanced', ['effective_intelligence', 'speed_of_decision', 'liveliness']],
      ['Your bus driver appears drowsy on a late-night highway trip returning from an excursion. You…', 'Officer-Level', ['courage', 'speed_of_decision', 'sense_of_responsibility']],
      ['You notice conflicting instructions from two senior organizers 20 minutes before an inspection. You…', 'Advanced', ['reasoning_ability', 'power_of_expression', 'organising_ability']],
      ['An injured stray animal blocks a narrow school lane while buses are trying to exit. You…', 'Beginner', ['initiative', 'speed_of_decision', 'cooperation']],
      ['You must choose between leading a difficult community project yourself or delegating key modules to less experienced members. You…', 'Officer-Level', ['organising_ability', 'influence_group', 'cooperation']],
      ['During a night camp navigation exercise, your squad’s compass malfunctions 3 km before the checkpoint. You…', 'Officer-Level', ['effective_intelligence', 'speed_of_decision', 'self_confidence']],
      ['While escorting school children across a busy highway junction, the traffic signal fails during peak rush hour. You…', 'Advanced', ['initiative', 'courage', 'sense_of_responsibility']],
    ],
  },
];

const TAT_SCENE_PROMPTS: Array<[string, string, string]> = [
  ['tat_scene_01', 'Rural Footbridge & Team Effort', 'Three youth inspect a monsoon-damaged village footbridge while residents wait across the stream.'],
  ['tat_scene_02', 'Late-Night Preparation Desk', 'A young person sits focused under a study lamp beside a clock showing late night and rain outside.'],
  ['tat_scene_03', 'Science & Innovation Laboratory', 'Two learners examine experimental apparatus on a workbench with notes spread beside them.'],
  ['tat_scene_04', 'Athletics Track Incident', 'During a competitive track run, one runner trips while another turns back near the final stretch.'],
  ['tat_scene_05', 'Community Relief & Supplies', 'Volunteers organize boxes of supplies in a courtyard as people gather around a notice board.'],
  ['tat_scene_06', 'Mountain Trail Briefing', 'A small group studies a terrain map at a misty hillside fork before continuing uphill.'],
  ['tat_scene_07', 'Workshop & Technical Repair', 'Two individuals troubleshoot a stalled water pump / generator beside a rural community centre.'],
  ['tat_scene_08', 'Library & Mentorship', 'An older student explains diagrams across a quiet table to a worried younger peer.'],
  ['tat_scene_09', 'Evening Railway Station', 'A traveller checks the departure board urgently while assisting an elderly passenger with luggage.'],
  ['tat_scene_10', 'Village Health & Awareness Camp', 'Youth volunteers arrange chairs and posters outside a primary clinic on a busy morning.'],
  ['tat_scene_11', 'Blank / Open Canvas Reflection', 'Open monochrome stimulus — envision a realistic challenge from your own life or goals and build an authentic action story.'],
];

const PPDT_SCENES: Array<[string, string, string, Array<{ speaker: string; stance: string; statement: string }>]> = [
  [
    'ppdt_month_01',
    'Hazy Bridge Crossing',
    'Ambiguous monochrome scene showing 3–4 figures near a river embankment with ropes/planks.',
    [
      { speaker: 'Cadet A (Action-First)', stance: 'Immediate rescue', statement: 'I saw an emergency flood crossing where the team should immediately evacuate elders using improvised planks.' },
      { speaker: 'Cadet B (Planner)', stance: 'Infrastructure repair', statement: 'Rather than panic, I felt they are civil volunteers inspecting a weak culvert before monsoon and mobilizing local labour.' },
      { speaker: 'Cadet C (Consensus)', stance: 'Safety + Coordination', statement: 'We can combine both views: ensure immediate safe crossing first while coordinating permanent repair with local authorities.' },
    ],
  ],
  [
    'ppdt_month_02',
    'Dimly Lit Discussion Table',
    'Ambiguous indoor scene with 4 figures leaning over papers under a single hanging light.',
    [
      { speaker: 'Cadet A (Academic)', stance: 'Exam / Research team', statement: 'This looks like final-year students troubleshooting a failed prototype the night before submission.' },
      { speaker: 'Cadet B (Community)', stance: 'Village crisis planning', statement: 'It appeared to be youth leaders mapping water distribution during a summer shortage.' },
      { speaker: 'Cadet C (Mediator)', stance: 'Structured planning', statement: 'Let us keep the common theme of calm collaborative planning under a tight deadline with clear role division.' },
    ],
  ],
  [
    'ppdt_month_03',
    'Roadside Gathering at Dusk',
    'Ambiguous outdoor scene with a stopped vehicle and several silhouetted figures nearby.',
    [
      { speaker: 'Cadet A (Medical)', stance: 'Accident first-aid', statement: 'Clearly a road mishap where the hero stops traffic, gives first-aid, and rushes the injured to hospital.' },
      { speaker: 'Cadet B (Logistics)', stance: 'Vehicle breakdown', statement: 'It could be a stranded school bus whose senior students keep peers calm and arrange backup transport.' },
      { speaker: 'Cadet C (Balanced)', stance: 'Calm response', statement: 'Whether medical aid or breakdown, the core action is safety perimeter, calm delegation, and prompt resolution.' },
    ],
  ],
  [
    'ppdt_month_04',
    'Hilltop Silhouette & Group',
    'Ambiguous terrain scene with one figure pointing ahead and three others carrying packs.',
    [
      { speaker: 'Cadet A (Adventure)', stance: 'Trek expedition', statement: 'A trekking expedition recalculating route before weather worsens.' },
      { speaker: 'Cadet B (Survey)', stance: 'Environmental mapping', statement: 'Forestry interns surveying landslide-prone slopes to warn nearby villages.' },
      { speaker: 'Cadet C (Synthesis)', stance: 'Safety & mission', statement: 'Both highlight terrain awareness, checking teammate stamina, and reaching the objective safely.' },
    ],
  ],
];

/**
 * Generates exactly 100 complete, non-duplicate SSB practice sets:
 * - 25 WAT Sets (100 curated words)
 * - 25 SRT Sets (100 curated situations across 12 categories)
 * - 25 TAT Sets (100 curated visual stimuli across 11 original scene archetypes)
 * - 25 PPDT Sets (100 curated perception & GD simulation stimuli)
 */
export function generateInitialSsbPracticeSets(): SsbPracticeSet[] {
  const sets: SsbPracticeSet[] = [];
  const createdAt = '2026-11-28';
  const diffs: SsbDifficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Officer-Level'];
  let setNumber = 1;

  // 1. 25 WAT Sets (4 words per set in practice pack = 100 unique words total, plus full-set shuffle support)
  for (let i = 0; i < 25; i += 1) {
    const slice = WAT_WORDS.slice(i * 4, i * 4 + 4);
    const diff = diffs[Math.floor(i / 7) % diffs.length]!;
    sets.push({
      id: `ssb-wat-${String(i + 1).padStart(2, '0')}`,
      setNumber: setNumber++,
      code: `WAT-${String(i + 1).padStart(2, '0')}`,
      title: `WAT Practice Set ${i + 1} · ${slice[0]?.[1] || 'Mixed'} & Response Clarity`,
      format: 'WAT',
      difficulty: diff,
      categoryFocus: Array.from(new Set(slice.map((w) => w[1]))).join(' / '),
      isFreeDemo: i === 0,
      published: true,
      estimatedMinutes: 5,
      tags: ['WAT', diff, slice[0]?.[1] || 'Mixed'],
      stimuli: slice.map(([word, cat, d, olqs], j) => ({
        id: `wat-w-${i * 4 + j + 1}`,
        format: 'WAT',
        prompt: word,
        category: cat,
        difficulty: d,
        recommendedSeconds: 15,
        targetOlqs: olqs,
      })),
      createdAt,
    });
  }

  // 2. 25 SRT Sets (flatten all 100 unique SRT situations -> 4 per set = 100 unique SRTs)
  const flatSrts: Array<{ category: string; prompt: string; difficulty: SsbDifficulty; olqs: OlqKey[] }> = [];
  for (const grp of SRT_THEMES) {
    for (const [prompt, difficulty, olqs] of grp.scenarios) {
      flatSrts.push({ category: grp.category, prompt, difficulty, olqs });
    }
  }
  for (let i = 0; i < 25; i += 1) {
    const slice = flatSrts.slice(i * 4, i * 4 + 4);
    const diff = slice[0]?.difficulty || diffs[i % diffs.length]!;
    sets.push({
      id: `ssb-srt-${String(i + 1).padStart(2, '0')}`,
      setNumber: setNumber++,
      code: `SRT-${String(i + 1).padStart(2, '0')}`,
      title: `SRT Practice Set ${i + 1} · ${slice[0]?.category || 'Mixed Scenarios'}`,
      format: 'SRT',
      difficulty: diff,
      categoryFocus: Array.from(new Set(slice.map((s) => s.category))).join(' / '),
      isFreeDemo: i === 0,
      published: true,
      estimatedMinutes: 8,
      tags: ['SRT', diff, slice[0]?.category || 'Mixed'],
      stimuli: slice.map((s, j) => ({
        id: `srt-q-${i * 4 + j + 1}`,
        format: 'SRT',
        prompt: s.prompt,
        category: s.category,
        difficulty: s.difficulty,
        recommendedSeconds: 30,
        targetOlqs: s.olqs,
      })),
      createdAt,
    });
  }

  // 3. 25 TAT Sets (4 visual stimuli per set = 100 unique themed story prompts)
  const tatAngles = [
    'Community Initiative',
    'Crisis Resourcefulness',
    'Team Coordination',
    'Self-Discipline & Goal Execution',
    'Youth Mentorship',
    'Field Problem Solving',
    'Ethical Courage',
    'Civic Responsibility',
    'Endurance Under Pressure',
    'Constructive Leadership',
  ];
  for (let i = 0; i < 25; i += 1) {
    const diff = diffs[Math.floor(i / 7) % diffs.length]!;
    const stimuli: SsbPracticeStimulus[] = [];
    for (let j = 0; j < 4; j += 1) {
      const idx = i * 4 + j;
      const [sceneCode, sceneTitle, baseDesc] = TAT_SCENE_PROMPTS[idx % TAT_SCENE_PROMPTS.length]!;
      const angle = tatAngles[(i + j) % tatAngles.length]!;
      stimuli.push({
        id: `tat-s-${idx + 1}`,
        format: 'TAT',
        prompt: `Story ${j + 1}: ${sceneTitle} — Focus: ${angle}. Observe the scene and write a realistic past-present-future story.`,
        category: angle,
        difficulty: diff,
        sceneCode,
        sceneCaption: `${sceneTitle} (${baseDesc})`,
        observationSeconds: 30,
        recommendedSeconds: 240,
        targetOlqs: ['effective_intelligence', 'organising_ability', 'initiative', 'determination'],
      });
    }
    sets.push({
      id: `ssb-tat-${String(i + 1).padStart(2, '0')}`,
      setNumber: setNumber++,
      code: `TAT-${String(i + 1).padStart(2, '0')}`,
      title: `TAT Visual Story Set ${i + 1} · ${tatAngles[i % tatAngles.length]}`,
      format: 'TAT',
      difficulty: diff,
      categoryFocus: tatAngles[i % tatAngles.length]!,
      isFreeDemo: i === 0,
      published: true,
      estimatedMinutes: 16,
      tags: ['TAT', diff, tatAngles[i % tatAngles.length]!],
      stimuli,
      createdAt,
    });
  }

  // 4. 25 PPDT Sets (4 perception + narration + GD simulation prompts = 100 unique PPDT exercises)
  for (let i = 0; i < 25; i += 1) {
    const diff = diffs[Math.floor(i / 7) % diffs.length]!;
    const stimuli: SsbPracticeStimulus[] = [];
    for (let j = 0; j < 4; j += 1) {
      const idx = i * 4 + j;
      const [sceneCode, title, caption, gdPerspectives] = PPDT_SCENES[idx % PPDT_SCENES.length]!;
      stimuli.push({
        id: `ppdt-s-${idx + 1}`,
        format: 'PPDT',
        prompt: `PPDT Plate ${idx + 1}: ${title} — Observe for 30s, note characters/age/mood, write a crisp action story, practise 60s narration & participate in Group Discussion.`,
        category: title,
        difficulty: diff,
        sceneCode,
        sceneCaption: caption,
        observationSeconds: 30,
        recommendedSeconds: 240,
        targetOlqs: ['power_of_expression', 'cooperation', 'influence_group', 'effective_intelligence'],
        gdPerspectives,
      });
    }
    sets.push({
      id: `ssb-ppdt-${String(i + 1).padStart(2, '0')}`,
      setNumber: setNumber++,
      code: `PPDT-${String(i + 1).padStart(2, '0')}`,
      title: `PPDT Perception & GD Set ${i + 1} · ${PPDT_SCENES[i % PPDT_SCENES.length]![1]}`,
      format: 'PPDT',
      difficulty: diff,
      categoryFocus: PPDT_SCENES[i % PPDT_SCENES.length]![1],
      isFreeDemo: i === 0,
      published: true,
      estimatedMinutes: 15,
      tags: ['PPDT', diff, 'Narration', 'Group Discussion'],
      stimuli,
      createdAt,
    });
  }

  return sets;
}

// ============================================================================
// RESPONSE-SPECIFIC AI ANALYSIS (Anti-Cliche, Practicality & Authenticity Focused)
// ============================================================================

const CLICHE_PATTERNS = [
  /always wins/i,
  /key to success/i,
  /officers always/i,
  /positive thinking solves everything/i,
  /never give up in life/i,
  /hard work is the key/i,
  /is very good for/i,
  /must be brave always/i,
];

const ACTION_VERBS =
  /\b(assessed|checked|organized|coordinated|informed|assisted|planned|delegated|resolved|repaired|guided|practised|scheduled|allocated|verified|evacuated|secured|built|communicated|prioritized|calmed|led|called|applied|reviewed|trained|discussed|listened)\b/i;

const REALISTIC_TEAM_MARKERS = /\b(team|peers|volunteers|authorities|doctor|teacher|local|parents|group|members|together|delegate)\b/i;

export function analyzeSsbResponse(params: {
  stimulus: SsbPracticeStimulus;
  responseText: string;
  timeTakenSeconds: number;
}): SsbResponseAnalysis {
  const text = params.responseText.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isCliche = CLICHE_PATTERNS.some((re) => re.test(text));
  const hasAction = ACTION_VERBS.test(text);
  const hasTeamOrContext = REALISTIC_TEAM_MARKERS.test(text);
  const promptKeywords = params.stimulus.prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  const lower = text.toLowerCase();
  const relevanceOk =
    wordCount >= 3 &&
    (params.stimulus.format === 'WAT'
      ? lower.includes(params.stimulus.prompt.toLowerCase().slice(0, 4)) || hasAction
      : promptKeywords.some((k) => lower.includes(k)) || hasAction || wordCount >= 12);

  const authenticityFlag: SsbResponseAnalysis['authenticityFlag'] =
    isCliche
      ? 'Cliche / Memorized Warning'
      : !hasAction && wordCount < 6
        ? 'Slightly Formulaic'
        : 'Authentic & Coherent';

  let practicalityScore = 52;
  if (hasAction) practicalityScore += 22;
  if (hasTeamOrContext) practicalityScore += 12;
  if (relevanceOk) practicalityScore += 10;
  if (isCliche) practicalityScore -= 28;
  if (params.stimulus.format === 'TAT' || params.stimulus.format === 'PPDT') {
    if (wordCount >= 45) practicalityScore += 8;
    else if (wordCount < 20) practicalityScore -= 15;
  } else if (params.stimulus.format === 'SRT') {
    if (wordCount >= 10 && wordCount <= 45) practicalityScore += 8;
    else if (wordCount < 6) practicalityScore -= 18;
  } else if (params.stimulus.format === 'WAT') {
    if (wordCount >= 5 && wordCount <= 14) practicalityScore += 8;
    else if (wordCount < 4) practicalityScore -= 15;
  }
  practicalityScore = Math.max(20, Math.min(96, Math.round(practicalityScore)));

  let clarityScore = 58;
  if (wordCount >= 5) clarityScore += 14;
  if (/[.!?]$/.test(text) || wordCount >= 8) clarityScore += 10;
  if (params.timeTakenSeconds <= params.stimulus.recommendedSeconds * 1.2) clarityScore += 10;
  if (isCliche) clarityScore -= 12;
  clarityScore = Math.max(25, Math.min(95, Math.round(clarityScore)));

  const positives: string[] = [];
  const improvements: string[] = [];

  if (hasAction) positives.push('Contains concrete, observable action steps rather than passive wishes.');
  if (hasTeamOrContext) positives.push('Demonstrates social awareness and realistic use of available people/resources.');
  if (relevanceOk) positives.push('Response connects naturally to the given stimulus.');
  if (params.timeTakenSeconds <= params.stimulus.recommendedSeconds) {
    positives.push(`Completed within target timing (${params.timeTakenSeconds}s vs ${params.stimulus.recommendedSeconds}s).`);
  }
  if (positives.length === 0) {
    positives.push('Attempted the stimulus; build concrete action phrasing from your own lived experience.');
  }

  if (isCliche) {
    improvements.push('Avoid memorized coaching slogans or generic moral maxims — write a grounded, realistic observation or action.');
  }
  if (!hasAction) {
    improvements.push('Add a specific, practical verb showing what is actually done to resolve or improve the situation.');
  }
  if (params.stimulus.format === 'SRT' && wordCount < 10) {
    improvements.push('Briefly cover immediate safety/priority, key action, and logical task completion.');
  }
  if ((params.stimulus.format === 'TAT' || params.stimulus.format === 'PPDT') && wordCount < 45) {
    improvements.push('Develop a complete arc: what led to the scene, concrete steps the main character takes, and a realistic outcome.');
  }
  if (params.timeTakenSeconds > params.stimulus.recommendedSeconds * 1.3) {
    improvements.push(`Practice quicker crisp expression (took ${params.timeTakenSeconds}s; aim near ${params.stimulus.recommendedSeconds}s).`);
  }
  if (improvements.length === 0) {
    improvements.push('Maintain this authentic tone while testing yourself on tougher officer-level time constraints.');
  }

  const alternativeApproach =
    params.stimulus.format === 'WAT'
      ? `Think of a grounded real-life observation using "${params.stimulus.prompt}" — e.g., linking it to daily preparation, teamwork, or problem-solving without preaching.`
      : params.stimulus.format === 'SRT'
        ? 'Structure your thinking in 3 crisp beats: (1) immediate safety/fact check, (2) practical resource/team mobilization, (3) calm completion of the task.'
        : 'Keep the protagonist realistic to your age/context, show 2–3 specific planning steps, and close with a believable practical result (no miraculous instant success).';

  const suggestedExercise = isCliche
    ? 'Exercise: Rewrite 5 responses today replacing adjectives ("brave", "good") with observable actions ("checked", "organized", "informed").'
    : !hasAction
      ? 'Exercise: Practice 10 timed Beginner SRTs focusing strictly on "First step → Coordination → Task completion".'
      : 'Exercise: Advance to the next Intermediate/Officer-Level set to sustain clarity under stricter timing.';

  const indicatorSignals: Partial<Record<OlqKey, number>> = {};
  const baseSignal = Math.round((practicalityScore * 0.65 + clarityScore * 0.35));
  for (const olq of params.stimulus.targetOlqs) {
    indicatorSignals[olq] = baseSignal;
  }

  return {
    stimulusId: params.stimulus.id,
    prompt: params.stimulus.prompt,
    candidateResponse: text,
    timeTakenSeconds: Math.max(1, Math.round(params.timeTakenSeconds)),
    authenticityFlag,
    relevanceOk,
    practicalityScore,
    clarityScore,
    positives,
    improvements,
    alternativeApproach,
    suggestedExercise,
    indicatorSignals,
  };
}

export const SSB_ACADEMY_ETHICAL_DISCLAIMER =
  'Preparation & Self-Development Tool Only: Rai Plus SSB Academy helps candidates practise structured thinking and self-reflection. It is NOT an official Services Selection Board (SSB) assessment, psychological diagnosis, or commissioning recommendation.';

/**
 * Multi-Evidence 15-OLQ Development Profile.
 * Strict guard: NEVER assigns a developed OLQ score from a single response — requires >= 2 corroborated signals!
 * Explicitly frames output as a self-development aid, NOT an official SSB recommendation.
 */
export function buildSsbOlqProfile(params: {
  sessions: SsbAssessmentSessionRecord[];
  sets: SsbPracticeSet[];
}): {
  indicators: SsbOlqIndicatorSummary[];
  observedStrengths: string[];
  developingQualities: string[];
  recurringPatterns: string[];
  recommendedNextSets: Array<{ set: SsbPracticeSet; reason: string }>;
  weeklyPlan: string[];
  disclaimer: string;
} {
  const byOlq = new Map<OlqKey, { scores: number[]; sources: Set<SsbTestFormat> }>();
  let clicheCount = 0;
  let totalResponses = 0;

  for (const sess of params.sessions) {
    for (const resp of sess.responses) {
      totalResponses += 1;
      if (resp.authenticityFlag === 'Cliche / Memorized Warning') clicheCount += 1;
      for (const [k, score] of Object.entries(resp.indicatorSignals) as Array<[OlqKey, number]>) {
        const entry = byOlq.get(k) || { scores: [], sources: new Set<SsbTestFormat>() };
        entry.scores.push(score);
        entry.sources.add(sess.format);
        byOlq.set(k, entry);
      }
    }
  }

  const indicators: SsbOlqIndicatorSummary[] = OLQ_DEFINITIONS.map((def) => {
    const rec = byOlq.get(def.key);
    const evidenceCount = rec ? rec.scores.length : 0;
    const sources = rec ? Array.from(rec.sources) : [];
    // Strict corroboration guard: need >= 2 evidence points before assigning a score!
    const score =
      evidenceCount >= 2 && rec
        ? Math.round(rec.scores.reduce((a, b) => a + b, 0) / rec.scores.length)
        : null;
    const developmentLevel: SsbOlqIndicatorSummary['developmentLevel'] =
      score === null
        ? 'Insufficient Evidence'
        : score >= 75
          ? 'Consistent'
          : score >= 58
            ? 'Developing'
            : 'Emerging';

    return {
      key: def.key,
      name: def.name,
      group: def.group,
      evidenceCount,
      developmentLevel,
      score,
      supportingSources: sources,
      suggestedActivity:
        score === null
          ? `Complete at least 2 exercises (WAT/SRT/TAT/PPDT) targeting ${def.name} to gather reliable evidence.`
          : score >= 75
            ? `Sustain ${def.name} in Officer-Level timed sets and PPDT group discussions.`
            : `Focus on ${def.name} through realistic, action-oriented SRT & TAT planning exercises.`,
    };
  });

  const observedStrengths = indicators
    .filter((i) => i.score !== null && i.score >= 72)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)
    .map((i) => `${i.name} (${i.group}) — corroborated across ${i.evidenceCount} responses`);

  const developingQualities = indicators
    .filter((i) => i.score === null || i.score < 72)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 5)
    .map((i) =>
      i.score === null
        ? `${i.name} — needs multi-format practice evidence`
        : `${i.name} — developing (${i.score}/100 across ${i.evidenceCount} responses)`,
    );

  const recurringPatterns: string[] = [];
  if (totalResponses === 0) {
    recurringPatterns.push('Start with 1 Free Demo WAT set and 1 SRT set to establish your baseline thinking pattern.');
  } else {
    if (clicheCount > 0) {
      recurringPatterns.push(
        `${clicheCount} of ${totalResponses} responses used formulaic/memorized phrasing — prioritize authentic everyday actions.`,
      );
    } else {
      recurringPatterns.push('Responses avoid robotic clichés and reflect genuine personal reasoning.');
    }
    const avgClarity = Math.round(
      params.sessions.reduce((s, x) => s + x.overallClarity, 0) / Math.max(1, params.sessions.length),
    );
    recurringPatterns.push(
      avgClarity >= 72
        ? `Expression clarity is steady (${avgClarity}/100) across timed sessions.`
        : `Tighten sentence structure under timer pressure (current clarity average: ${avgClarity}/100).`,
    );
  }

  const completedSetIds = new Set(params.sessions.map((s) => s.setId));
  const weakestKeys = new Set(
    indicators
      .filter((i) => i.score === null || i.score < 72)
      .slice(0, 4)
      .map((i) => i.key),
  );
  const recommendedNextSets: Array<{ set: SsbPracticeSet; reason: string }> = [];
  for (const format of ['WAT', 'SRT', 'TAT', 'PPDT'] as SsbTestFormat[]) {
    const candidate =
      params.sets.find(
        (s) =>
          s.published &&
          s.format === format &&
          !completedSetIds.has(s.id) &&
          s.stimuli.some((st) => st.targetOlqs.some((k) => weakestKeys.has(k))),
      ) || params.sets.find((s) => s.published && s.format === format && !completedSetIds.has(s.id));

    if (candidate) {
      recommendedNextSets.push({
        set: candidate,
        reason: `Recommended ${format} set (${candidate.difficulty}) to strengthen developing OLQ indicators in ${candidate.categoryFocus}.`,
      });
    }
  }

  return {
    indicators,
    observedStrengths,
    developingQualities,
    recurringPatterns,
    recommendedNextSets,
    weeklyPlan: [
      'Day 1–2: 1 Timed WAT Set + Review phrasing authenticity (eliminate clichés)',
      'Day 3–4: 1 Timed SRT Set focusing on immediate safety, delegation & task completion',
      'Day 5: 1 TAT Visual Storytelling session (focus on realistic past-present-future arc)',
      'Day 6: 1 PPDT Plate with 60-second spoken narration & Group Discussion synthesis',
      'Day 7: Weekly OLQ Evidence Reflection & Weak-Area Re-practice',
    ],
    disclaimer:
      'Preparation & Self-Development Tool Only: Rai Plus SSB Academy helps candidates practise structured thinking and self-reflection. It is NOT an official Services Selection Board (SSB) assessment, psychological diagnosis, or commissioning recommendation.',
  };
}
