import type {
  AcademicCalendarEntry,
  BellPeriodSlot,
  CurriculumChapterSchedule,
} from '../types/controlRoomCalendar';

export const VIS_SCHOOL_ID = 'school-vis-jjr';

export const VIS_PERIOD_SHIFT_POLICY = {
  previousPeriodMinutes: 30,
  currentPeriodMinutes: 40,
  conversionFactor: 0.75, // 30 / 40
  workingDaysPerWeek: 6, // Mon-Sat except 2nd Saturday
  syllabusCompletionDeadline: '2026-12-31',
  revisionModel: '1-4-7-15-30 Spaced Revision Cycle',
  pedagogyModel: 'NEP 2020 (40% Concept · 20% Activity · 20% Application · 20% Revision & Assessment)',
  note: 'Original VIS 2026–27 subject planners were drafted for 30-minute periods. After upgrading period length to 40 minutes, weekly and total period counts have been shifted proportionally (× 0.75) to preserve total instructional minutes.',
} as const;

/**
 * Recalculates period counts when school period duration shifts (e.g., 30 min -> 40 min).
 */
export function recalculatePeriodsForDuration(
  originalPeriods: number,
  fromMinutes = 30,
  toMinutes = 40,
): number {
  if (!Number.isFinite(originalPeriods) || originalPeriods <= 0) return 0;
  if (!Number.isFinite(fromMinutes) || !Number.isFinite(toMinutes) || fromMinutes <= 0 || toMinutes <= 0) {
    return Math.round(originalPeriods);
  }
  return Math.max(1, Math.round((originalPeriods * fromMinutes) / toMinutes));
}

/**
 * Official Virat International School (Kapriwas, Rewari) 40-minute period Bell Schedule.
 * Shifted from earlier 30-minute period structure (8–9 × 30m) to 7 × 40m instructional periods.
 */
export const VIS_BELL_SCHEDULE_40MIN: BellPeriodSlot[] = [
  { id: 'asm', label: 'Morning Assembly', kind: 'assembly', startTime: '08:30', endTime: '08:50' },
  { id: 'p1', label: 'Period 1 (40m)', kind: 'period', periodNumber: 1, startTime: '08:50', endTime: '09:30' },
  { id: 'p2', label: 'Period 2 (40m)', kind: 'period', periodNumber: 2, startTime: '09:30', endTime: '10:10' },
  { id: 'p3', label: 'Period 3 (40m)', kind: 'period', periodNumber: 3, startTime: '10:10', endTime: '10:50' },
  { id: 'p4', label: 'Period 4 (40m)', kind: 'period', periodNumber: 4, startTime: '10:50', endTime: '11:30' },
  { id: 'brk', label: 'Mid-Day Recess', kind: 'break', startTime: '11:30', endTime: '11:50' },
  { id: 'p5', label: 'Period 5 (40m)', kind: 'period', periodNumber: 5, startTime: '11:50', endTime: '12:30' },
  { id: 'p6', label: 'Period 6 (40m)', kind: 'period', periodNumber: 6, startTime: '12:30', endTime: '13:10' },
  { id: 'p7', label: 'Period 7 (40m)', kind: 'period', periodNumber: 7, startTime: '13:10', endTime: '13:50' },
  { id: 'dry', label: 'Diary & Dispersal', kind: 'diary', startTime: '13:50', endTime: '14:00' },
];

export interface VisPlannerChapterItem {
  chapterNo: number;
  month: string;
  title: string;
  theme: string;
  originalPeriods30Min: number;
  shiftedPeriods40Min: number;
  plannedCompletionDate: string;
  examTag: 'UT-1' | 'UT-2' | 'Half-Yearly' | 'UT-3' | 'UT-4' | 'Pre-Board' | 'Annual';
  revisionDays?: string;
}

export interface VisSubjectPlanner2026 {
  id: string;
  classLabel: string;
  classSection: string;
  subject: string;
  boardAlignment: string;
  session: '2026-27';
  originalPeriodMinutes: 30;
  updatedPeriodMinutes: 40;
  originalPeriodsPerWeek: number;
  shiftedPeriodsPerWeek: number;
  originalTotalPeriodsYear: number;
  shiftedTotalPeriodsYear: number;
  syllabusDeadline: string;
  examSummary: Array<{ exam: string; dates: string; syllabus: string }>;
  enrichmentActivities: string[];
  chapters: VisPlannerChapterItem[];
}

function makeChapters(
  items: Array<{
    chapterNo: number;
    month: string;
    title: string;
    theme: string;
    periods30: number;
    plannedCompletionDate: string;
    examTag: VisPlannerChapterItem['examTag'];
    revisionDays?: string;
  }>,
): VisPlannerChapterItem[] {
  return items.map((item) => ({
    chapterNo: item.chapterNo,
    month: item.month,
    title: item.title,
    theme: item.theme,
    originalPeriods30Min: item.periods30,
    shiftedPeriods40Min: recalculatePeriodsForDuration(item.periods30, 30, 40),
    plannedCompletionDate: item.plannedCompletionDate,
    examTag: item.examTag,
    ...(item.revisionDays ? { revisionDays: item.revisionDays } : {}),
  }));
}

/**
 * Official VIS 2026–27 Academic Calendar entries synthesized from all VIS Kapriwas planners.
 * Covers Vacations, National/School Holidays, UT-1 through Final Exams, PTMs, Remedial Windows,
 * and Syllabus Completion Deadline.
 */
export function buildVisOfficialCalendarEntries(schoolId = VIS_SCHOOL_ID): AcademicCalendarEntry[] {
  return [
    {
      id: `cal-${schoolId}-session-start`,
      date: '2026-04-01',
      title: 'Academic Session 2026–27 Commencement (40-Min Period Schedule)',
      type: 'Special Instructional Day',
      source: 'HBSE Official',
      description:
        'Session opening assembly, HBSE/NCERT syllabus orientation, and updated 40-minute period timetable (7 periods/day, shifted from 30-min planner baseline).',
    },
    {
      id: `cal-${schoolId}-ut1`,
      date: '2026-05-19',
      endDate: '2026-05-25',
      title: 'Unit Test 1 (UT-1)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['All Classes (1–12)'],
      description: 'First periodic checkpoint covering April–May syllabus across all subjects.',
    },
    {
      id: `cal-${schoolId}-summer-vac`,
      date: '2026-05-25',
      endDate: '2026-06-30',
      title: 'Summer Vacation',
      type: 'Vacation',
      source: 'HBSE Official',
      description: 'Official VIS Kapriwas annual summer break (25 May – 30 June 2026).',
    },
    {
      id: `cal-${schoolId}-remedial-ut1`,
      date: '2026-05-26',
      endDate: '2026-05-31',
      title: 'Post-UT-1 Remedial & Gap Analysis Window',
      type: 'Special Instructional Day',
      source: 'School Custom',
      affectedClasses: ['Classes 1–12'],
      description: '3–5 day error analysis, concept clarification, remedial groups & parent connect.',
    },
    {
      id: `cal-${schoolId}-ptm-ut1`,
      date: '2026-05-31',
      title: 'PTM — After UT-1',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
      description: 'Parent-Teacher Meeting reviewing UT-1 scores, DMIT learning insights & summer tasks.',
    },
    {
      id: `cal-${schoolId}-re-ut1`,
      date: '2026-07-06',
      endDate: '2026-07-11',
      title: 'Re-UT-1 (Remedial Assessment)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['Classes 1–12'],
      description: 'Focused re-assessment & gap closure after summer break (6–11 July 2026).',
    },
    {
      id: `cal-${schoolId}-remedial-reut1`,
      date: '2026-07-13',
      endDate: '2026-07-18',
      title: 'Post-Re-UT-1 Remedial & Peer Learning',
      type: 'Special Instructional Day',
      source: 'School Custom',
      description: 'Targeted weak-topic worksheets and 1-on-1 reflective learner mentoring.',
    },
    {
      id: `cal-${schoolId}-indep`,
      date: '2026-08-15',
      title: 'Independence Day',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-ut2`,
      date: '2026-08-17',
      endDate: '2026-08-22',
      title: 'Unit Test 2 (UT-2)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['All Classes (1–12)'],
      description: 'Second periodic unit test covering July–August chapters.',
    },
    {
      id: `cal-${schoolId}-remedial-ut2`,
      date: '2026-08-23',
      endDate: '2026-08-27',
      title: 'Post-UT-2 Remedial Window (3–5 Days)',
      type: 'Special Instructional Day',
      source: 'School Custom',
      description: 'Error analysis, re-teaching, oral assessments & remedial groups.',
    },
    {
      id: `cal-${schoolId}-janmashtami`,
      date: '2026-08-28',
      title: 'Janmashtami',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-ptm-ut2`,
      date: '2026-08-30',
      title: 'PTM — After UT-2',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
      description: 'UT-2 result review and Half-Yearly exam readiness plan with parents.',
    },
    {
      id: `cal-${schoolId}-teachers-day`,
      date: '2026-09-04',
      endDate: '2026-09-05',
      title: "Teachers' Day Celebration & Holiday",
      type: 'Event',
      source: 'School Custom',
      description: 'Student-led campus celebration and Teachers Day observance.',
    },
    {
      id: `cal-${schoolId}-half-yearly`,
      date: '2026-09-15',
      endDate: '2026-09-26',
      title: 'Half-Yearly Examinations (Term I — /80 Theory)',
      type: 'Examination',
      source: 'HBSE Official',
      affectedClasses: ['All Classes (1–12)'],
      description: 'Complete Term-I syllabus examination (15–26 September 2026) with /80 subject theory papers.',
    },
    {
      id: `cal-${schoolId}-remedial-hy`,
      date: '2026-09-28',
      endDate: '2026-10-02',
      title: 'Post-Half-Yearly Remedial & Concept Reinforcement',
      type: 'Special Instructional Day',
      source: 'School Custom',
      description: 'Learning gap analysis, worksheet reinforcement, and personalised counselling.',
    },
    {
      id: `cal-${schoolId}-gandhi`,
      date: '2026-10-02',
      title: 'Gandhi Jayanti',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-ptm-hy`,
      date: '2026-10-04',
      title: 'PTM — After Half-Yearly Examinations',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
      description: 'Half-Yearly report card review, DMIT growth review, and Term-II target setting.',
    },
    {
      id: `cal-${schoolId}-dussehra`,
      date: '2026-10-18',
      endDate: '2026-10-20',
      title: 'Dussehra Break',
      type: 'Vacation',
      source: 'HBSE Official',
      description: 'Dussehra festive break (18–20 October 2026).',
    },
    {
      id: `cal-${schoolId}-diwali`,
      date: '2026-11-07',
      endDate: '2026-11-11',
      title: 'Diwali Break',
      type: 'Vacation',
      source: 'HBSE Official',
      description: 'Diwali & Govardhan festive break (7–11 November 2026).',
    },
    {
      id: `cal-${schoolId}-ut3`,
      date: '2026-11-18',
      endDate: '2026-11-25',
      title: 'Unit Test 3 (UT-3)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['All Classes (1–12)'],
      description: 'Third unit test covering October–November chapters (18–25 November 2026).',
    },
    {
      id: `cal-${schoolId}-guru-nanak`,
      date: '2026-11-24',
      title: 'Guru Nanak / Guru Teg Bahadur Jayanti',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-constitution-day`,
      date: '2026-11-26',
      title: 'Constitution Day & Science Day Celebration',
      type: 'Event',
      source: 'School Custom',
      description: 'Mock Parliament, Political Science seminar, and Working Model Science Exhibition.',
    },
    {
      id: `cal-${schoolId}-remedial-ut3`,
      date: '2026-11-26',
      endDate: '2026-11-30',
      title: 'Post-UT-3 Remedial & Doubt Clearing',
      type: 'Special Instructional Day',
      source: 'School Custom',
      description: 'Post-UT-3 doubt clearing, practice papers, and parent follow-up.',
    },
    {
      id: `cal-${schoolId}-ptm-ut3`,
      date: '2026-11-29',
      title: 'PTM — After UT-3',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
      description: 'UT-3 performance discussion and December full syllabus completion plan.',
    },
    {
      id: `cal-${schoolId}-christmas`,
      date: '2026-12-25',
      title: 'Christmas Day',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-syllabus-deadline`,
      date: '2026-12-31',
      title: 'Syllabus Completion Deadline (100% Chapters, Map & Practical Files)',
      type: 'Academic Deadline',
      source: 'School Custom',
      affectedClasses: ['All Classes (1–12)'],
      description:
        'Mandatory VIS syllabus completion target across all subjects — map work, project files, and sample papers ready.',
    },
    {
      id: `cal-${schoolId}-winter-vac`,
      date: '2027-01-01',
      endDate: '2027-01-15',
      title: 'Winter Break',
      type: 'Vacation',
      source: 'HBSE Official',
      description: 'Official Haryana winter break (1–15 January 2027).',
    },
    {
      id: `cal-${schoolId}-preboards`,
      date: '2027-01-10',
      endDate: '2027-01-20',
      title: 'Pre-Board Examinations & Sample Papers (Classes 10 & 12)',
      type: 'Examination',
      source: 'HBSE Official',
      affectedClasses: ['10-A', '12-Arts', '12-Commerce', '12-Science'],
      description: 'Full-syllabus HBSE Pre-Board examinations and sample paper drills.',
    },
    {
      id: `cal-${schoolId}-republic`,
      date: '2027-01-26',
      title: 'Republic Day',
      type: 'Holiday',
      source: 'HBSE Official',
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-ut4`,
      date: '2027-01-27',
      endDate: '2027-02-02',
      title: 'Unit Test 4 (UT-4)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['All Classes (1–12)'],
      description: 'Fourth periodic unit test & post-half-yearly syllabus consolidation (27 Jan – 2 Feb 2027).',
    },
    {
      id: `cal-${schoolId}-remedial-ut4`,
      date: '2027-02-03',
      endDate: '2027-02-07',
      title: 'Post-UT-4 Final Revision & Concept Drills',
      type: 'Special Instructional Day',
      source: 'School Custom',
      description: 'Final remedial revision, peer learning, and exam readiness drills.',
    },
    {
      id: `cal-${schoolId}-ptm-ut4`,
      date: '2027-02-14',
      title: 'PTM — After UT-4 & Pre-Boards',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
      description: 'Final exam / board readiness consultation with parents.',
    },
    {
      id: `cal-${schoolId}-science-fair`,
      date: '2027-02-20',
      title: 'Annual Science Fair & Project Display',
      type: 'Event',
      source: 'School Custom',
      description: 'Annual STEM showcase, Math Lab exhibition, and student portfolio display.',
    },
    {
      id: `cal-${schoolId}-board-exam`,
      date: '2027-03-09',
      endDate: '2027-03-25',
      title: 'Final / Annual Examinations (HBSE & Classes 1–12)',
      type: 'Board Exam',
      source: 'HBSE Official',
      isLockedOfficial: true,
      affectedClasses: ['All Classes (1–12)'],
      description:
        'Official Annual & HBSE Board Examinations commencing 9 March 2027 onwards (complete syllabus, map work & practicals).',
    },
    {
      id: `cal-${schoolId}-ptm-finals`,
      date: '2027-03-30',
      endDate: '2027-03-31',
      title: 'Annual Result Declaration & PTM',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:30 PM',
      description: 'Final 360° Report Card handover and next-session promotion counselling.',
    },
  ];
}

/**
 * All 12 Official VIS 2026–27 Subject Planners converted from 30-min periods -> 40-min periods (× 0.75).
 */
export const VIS_SUBJECT_PLANNERS_2026: VisSubjectPlanner2026[] = [
  {
    id: 'vis-plan-6-sci',
    classLabel: 'Class VI',
    classSection: '6-A',
    subject: 'Science',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 180,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(180, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 1–2 (Wonderful World of Science, Diversity in Living World)' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 3–4 (Mindful Eating, Exploring Magnets)' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Chapters 1 to 6 + Full Revision' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 7–8 (Temperature, States of Water)' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Ch 9–12 (Separation, Living Creatures, Nature Treasures, Beyond Earth)' },
    ],
    enrichmentActivities: ['Eco Club Activities', 'Nutrition Week', 'Science Model Exhibition', 'STEM Activity', 'Annual Science Fair'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'May', title: 'The Wonderful World of Science', theme: 'Nature of Science', periods30: 12, plannedCompletionDate: '2026-05-15', examTag: 'UT-1', revisionDays: '15 May · 19 May · 22 May · 30 May · 12 Jun' },
      { chapterNo: 2, month: 'May', title: 'Diversity in the Living World', theme: 'Living World', periods30: 14, plannedCompletionDate: '2026-05-22', examTag: 'UT-1', revisionDays: '16 May · 20 May · 23 May · 31 May · 13 Jun' },
      { chapterNo: 3, month: 'July', title: 'Mindful Eating: A Path to a Healthy Body', theme: 'Health & Wellbeing', periods30: 14, plannedCompletionDate: '2026-07-19', examTag: 'UT-2', revisionDays: '19 Jul · 23 Jul · 26 Jul · 2 Aug · 14 Aug' },
      { chapterNo: 4, month: 'July', title: 'Exploring Magnets', theme: 'Magnetism', periods30: 12, plannedCompletionDate: '2026-07-29', examTag: 'UT-2' },
      { chapterNo: 5, month: 'August', title: 'Measurement of Length and Motion', theme: 'Measurement', periods30: 14, plannedCompletionDate: '2026-08-14', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'August', title: 'Materials Around Us', theme: 'Materials', periods30: 14, plannedCompletionDate: '2026-08-29', examTag: 'Half-Yearly' },
      { chapterNo: 7, month: 'October', title: 'Temperature and its Measurement', theme: 'Temperature', periods30: 14, plannedCompletionDate: '2026-10-17', examTag: 'UT-3' },
      { chapterNo: 8, month: 'October', title: 'A Journey through States of Water', theme: 'Water', periods30: 14, plannedCompletionDate: '2026-10-29', examTag: 'UT-3' },
      { chapterNo: 9, month: 'November', title: 'Methods of Separation in Everyday Life', theme: 'Separation', periods30: 14, plannedCompletionDate: '2026-11-16', examTag: 'UT-4' },
      { chapterNo: 10, month: 'November', title: 'Living Creatures: Exploring their Characteristics', theme: 'Living World', periods30: 14, plannedCompletionDate: '2026-11-28', examTag: 'UT-4' },
      { chapterNo: 11, month: 'December', title: "Nature's Treasures", theme: 'Nature', periods30: 14, plannedCompletionDate: '2026-12-14', examTag: 'Annual' },
      { chapterNo: 12, month: 'December', title: 'Beyond Earth', theme: 'Space', periods30: 14, plannedCompletionDate: '2026-12-24', examTag: 'Annual' },
    ]),
  },
  {
    id: 'vis-plan-6-eng',
    classLabel: 'Class VI',
    classSection: '6-A',
    subject: 'English',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 900,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(900, 30, 40),
    syllabusDeadline: '2027-02-20',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Unit I: A Bottle of Dew, The Raven and the Fox, Rama to the Rescue' },
      { exam: 'Re-UT-1 (6–11 Jul)', dates: '6–11 Jul', syllabus: 'Unit I Remedial + Reading Comprehension' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Unit II: Friendships + Articles, Nouns, Letter & Story Writing' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Units I–III (Ch 1–8) + Grammar & Application Writing' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 9–12 (Spices, Change of Heart, The Winner, Yoga) + Prepositions' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Unit V (Hamara Bharat, The Kites, Ila Sachani) + Tenses' },
    ],
    enrichmentActivities: ['Oral Storytelling & Recitation', 'Reading Fluency Tracker', 'Portfolio Showcase', 'Peer Assessment'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'A Bottle of Dew', theme: 'Fables & Folk Tales', periods30: 36, plannedCompletionDate: '2026-04-20', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'The Raven and the Fox & Rama to the Rescue', theme: 'Language Development', periods30: 72, plannedCompletionDate: '2026-05-16', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: "The Unlikely Best Friends & A Friend's Prayer", theme: 'Values & Life Skills', periods30: 72, plannedCompletionDate: '2026-07-28', examTag: 'UT-2' },
      { chapterNo: 4, month: 'August', title: 'The Chair + Articles, Nouns, Letter & Story Writing', theme: 'Grammar & Writing', periods30: 144, plannedCompletionDate: '2026-08-26', examTag: 'UT-2' },
      { chapterNo: 5, month: 'September', title: 'Neem Baba & What a Bird Thought + Sentence, SVA', theme: 'Nurturing Nature', periods30: 144, plannedCompletionDate: '2026-09-12', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'October', title: 'Spices that Heals Us & Change of Heart + Pronouns, Verb', theme: 'Vocabulary & Expression', periods30: 144, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 7, month: 'November', title: 'The Winner & Yoga — A Way of Life + Prepositions', theme: 'Sports & Wellness', periods30: 108, plannedCompletionDate: '2026-11-26', examTag: 'UT-3' },
      { chapterNo: 8, month: 'December', title: 'Hamara Bharat — Incredible India! + Conjunction', theme: 'Culture & Tradition', periods30: 72, plannedCompletionDate: '2026-12-26', examTag: 'UT-4' },
      { chapterNo: 9, month: 'January', title: 'The Kites & Ila Sachani + Tense', theme: 'Culture & Language', periods30: 72, plannedCompletionDate: '2027-01-25', examTag: 'UT-4' },
      { chapterNo: 10, month: 'February', title: 'National War Memorial + Punctuation & Full Revision', theme: 'Patriotism & Grammar', periods30: 36, plannedCompletionDate: '2027-02-22', examTag: 'Annual' },
    ]),
  },
  {
    id: 'vis-plan-6-sst',
    classLabel: 'Class VI',
    classSection: '6-A',
    subject: 'Social Science',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 504,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(504, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 1–4 (Locating Places, Oceans, Landforms, Timeline)' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 5–8 (India That Is Bharat, Civilisation, Cultural Roots, Unity in Diversity)' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Ch 1–10 including Family & Community + Grassroots Democracy Part 1' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 11–14 (Rural & Urban Local Govt, Value of Work, Economic Activities)' },
    ],
    enrichmentActivities: ['Map & Timeline Skills', 'Local Governance Role Play', 'Heritage Portfolio', 'Oral Assessment'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'Locating Places on the Earth & Oceans and Continents', theme: 'Geography & Map Skills', periods30: 72, plannedCompletionDate: '2026-04-28', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'Landforms and Life & Timeline and Sources of History', theme: 'Map & Timeline Skills', periods30: 72, plannedCompletionDate: '2026-05-18', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: 'India, That Is Bharat & The Beginnings of Indian Civilisation', theme: 'History & Culture', periods30: 72, plannedCompletionDate: '2026-07-28', examTag: 'UT-2' },
      { chapterNo: 4, month: 'August', title: "India's Cultural Roots & Unity in Diversity", theme: 'Diversity & Heritage', periods30: 72, plannedCompletionDate: '2026-08-25', examTag: 'UT-2' },
      { chapterNo: 5, month: 'September', title: 'Family and Community & Grassroots Democracy — Part 1: Governance', theme: 'Civics & Governance', periods30: 72, plannedCompletionDate: '2026-09-12', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'October', title: 'Grassroots Democracy — Part 2 (Rural) & Part 3 (Urban)', theme: 'Local Government', periods30: 72, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 7, month: 'November', title: 'The Value of Work & Economic Activities Around Us', theme: 'Economy & Work', periods30: 72, plannedCompletionDate: '2026-11-26', examTag: 'UT-3' },
    ]),
  },
  {
    id: 'vis-plan-7-sci',
    classLabel: 'Class VII',
    classSection: '7-A',
    subject: 'Science',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 180,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(180, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 1–2 (Ever-Evolving World of Science, Acidic/Basic/Neutral Substances)' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 3–4 (Electricity Circuits, Metals & Non-Metals)' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Chapters 1 to 6 + Full Revision' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 7–10 (Heat Transfer, Time & Motion, Life Processes in Animals & Plants)' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Ch 11–12 (Light: Shadows & Reflections, Earth, Moon & Sun)' },
    ],
    enrichmentActivities: ['World Environment Day', 'Science Quiz', 'Working Model Exhibition', 'STEM Activity', 'Annual Science Fair'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'May', title: 'The Ever-Evolving World of Science', theme: 'Nature of Science', periods30: 12, plannedCompletionDate: '2026-05-15', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'Exploring Substances: Acidic, Basic and Neutral', theme: 'Substances', periods30: 14, plannedCompletionDate: '2026-05-22', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: 'Electricity: Circuits and Their Components', theme: 'Electricity', periods30: 14, plannedCompletionDate: '2026-07-19', examTag: 'UT-2' },
      { chapterNo: 4, month: 'July', title: 'The World of Metals and Non-Metals', theme: 'Materials', periods30: 14, plannedCompletionDate: '2026-07-28', examTag: 'UT-2' },
      { chapterNo: 5, month: 'August', title: 'Changes Around Us: Physical and Chemical', theme: 'Chemical Changes', periods30: 14, plannedCompletionDate: '2026-08-18', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'August', title: 'Adolescence: A Stage of Growth and Change', theme: 'Human Body', periods30: 14, plannedCompletionDate: '2026-08-29', examTag: 'Half-Yearly' },
      { chapterNo: 7, month: 'October', title: 'Heat Transfer in Nature', theme: 'Heat', periods30: 14, plannedCompletionDate: '2026-10-15', examTag: 'UT-3' },
      { chapterNo: 8, month: 'October', title: 'Measurement of Time and Motion', theme: 'Motion & Time', periods30: 14, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 9, month: 'November', title: 'Life Processes in Animals', theme: 'Life Processes', periods30: 14, plannedCompletionDate: '2026-11-15', examTag: 'UT-3' },
      { chapterNo: 10, month: 'November', title: 'Life Processes in Plants', theme: 'Life Processes', periods30: 14, plannedCompletionDate: '2026-11-28', examTag: 'UT-3' },
      { chapterNo: 11, month: 'December', title: 'Light: Shadows and Reflections', theme: 'Light', periods30: 14, plannedCompletionDate: '2026-12-14', examTag: 'UT-4' },
      { chapterNo: 12, month: 'December', title: 'Earth, Moon and the Sun', theme: 'Space', periods30: 14, plannedCompletionDate: '2026-12-26', examTag: 'Annual' },
    ]),
  },
  {
    id: 'vis-plan-7-eng',
    classLabel: 'Class VII',
    classSection: '7-A',
    subject: 'English',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 7,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(7, 30, 40),
    originalTotalPeriodsYear: 1344,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(1344, 30, 40),
    syllabusDeadline: '2027-02-20',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Unit I: The Day The River Spoke, Try Again, Three Days to See' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Unit II: Dr. Dolittle, A Funny Man, Say the Right Thing + Nouns, Articles, Verbs' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Units I–III (Ch 1–8) + Notice & Application Writing' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 9–11 (North South East West, The Tunnel, Travel) + Pronouns, Modals' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Ch 12–14 (Conquering Summit, Brave Soldiers) + Tense, Voice' },
    ],
    enrichmentActivities: ['Monthly Class Tests', 'Competency Writing Tasks', 'Oral Presentation Skills', 'Portfolio Showcase'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'The Day The River Spoke', theme: 'Learning Together', periods30: 42, plannedCompletionDate: '2026-04-22', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'Try Again & Three Days to See', theme: 'Language Development', periods30: 84, plannedCompletionDate: '2026-05-18', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: 'Animals, Birds and Dr. Dolittle & A Funny Man', theme: 'Wit & Humour', periods30: 84, plannedCompletionDate: '2026-07-28', examTag: 'UT-2' },
      { chapterNo: 4, month: 'August', title: 'Say the Right Thing + Nouns, Articles, Verbs, Letter & Story', theme: 'Grammar & Writing', periods30: 210, plannedCompletionDate: '2026-08-26', examTag: 'UT-2' },
      { chapterNo: 5, month: 'September', title: "My Brother's Great Invention & Paper Boats + Punctuation, Notice", theme: 'Dreams & Discoveries', periods30: 210, plannedCompletionDate: '2026-09-12', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'October', title: 'North, South, East, West & The Tunnel + Adverbs, Prepositions', theme: 'Vocabulary & Expression', periods30: 168, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 7, month: 'November', title: 'Travel + Pronouns & Modals', theme: 'Travel & Discoveries', periods30: 126, plannedCompletionDate: '2026-11-26', examTag: 'UT-3' },
      { chapterNo: 8, month: 'December', title: 'Conquering the Summit + Subject-Verb Agreement & Tense', theme: 'Comprehension & Grammar', periods30: 126, plannedCompletionDate: '2026-12-26', examTag: 'UT-4' },
      { chapterNo: 9, month: 'January', title: 'A Homage to Our Brave Soldiers & My Dear Soldiers + Sentence, Voice', theme: 'Brave Hearts', periods30: 168, plannedCompletionDate: '2027-01-25', examTag: 'UT-4' },
      { chapterNo: 10, month: 'February', title: 'Rani Abbakka + Reported Speech & Revision', theme: 'Biography & Grammar', periods30: 126, plannedCompletionDate: '2027-02-22', examTag: 'Annual' },
    ]),
  },
  {
    id: 'vis-plan-7-math',
    classLabel: 'Class VII',
    classSection: '7-A',
    subject: 'Mathematics',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 7, // 6 + 1 (Test/Revision)
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(7, 30, 40),
    originalTotalPeriodsYear: 210,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(210, 30, 40),
    syllabusDeadline: '2027-01-25',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 1–4 (Large Numbers, Arithmetic Expression, Decimals, Algebra)' },
      { exam: 'Re-UT-1 (6–11 Jul)', dates: '6–11 Jul', syllabus: 'Ch 5–6 (Parallel Lines, Number Play) + Gap Analysis' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 7–8 (Intersecting Lines, Fractions)' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Ch 1–10 (including Geometric Twins & Integers)' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 11–13 (Common Ground, Decimals II, Connecting Dots)' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Ch 14–15 (Construction & Tilings, Finding the Unknown)' },
    ],
    enrichmentActivities: ['Math Lab Activities', 'Math Olympiad Practice', 'Puzzles & Brain Teasers', 'Peer Teaching Sessions'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'Large Numbers Around Us & Arithmetic Expression', theme: 'Numbers & Operations', periods30: 28, plannedCompletionDate: '2026-04-28', examTag: 'UT-1', revisionDays: '1 Apr · 6 Apr · 9 Apr · 17 Apr · 4 May' },
      { chapterNo: 2, month: 'May', title: 'A Peek Beyond the Point & Expression Using Letter-Number', theme: 'Decimals & Algebra', periods30: 24, plannedCompletionDate: '2026-05-18', examTag: 'UT-1' },
      { chapterNo: 3, month: 'June', title: 'Parallel and Intersecting Line', theme: 'Geometry', periods30: 12, plannedCompletionDate: '2026-06-15', examTag: 'UT-2' },
      { chapterNo: 4, month: 'July', title: 'Number Play', theme: 'Logical Patterns', periods30: 20, plannedCompletionDate: '2026-07-24', examTag: 'UT-2' },
      { chapterNo: 5, month: 'August', title: 'A Tale of 3 Intersecting Lines & Working with Fractions', theme: 'Geometry & Fractions', periods30: 28, plannedCompletionDate: '2026-08-24', examTag: 'UT-2' },
      { chapterNo: 6, month: 'September', title: 'Geometric Twins & Operation with Integers', theme: 'Congruence & Integers', periods30: 26, plannedCompletionDate: '2026-09-12', examTag: 'Half-Yearly' },
      { chapterNo: 7, month: 'October', title: 'Finding Common Ground', theme: 'Rational & Common Factors', periods30: 18, plannedCompletionDate: '2026-10-24', examTag: 'UT-3' },
      { chapterNo: 8, month: 'November', title: 'Another Peek Beyond the Point & Connecting the Dots', theme: 'Decimals & Coordinates', periods30: 24, plannedCompletionDate: '2026-11-24', examTag: 'UT-3' },
      { chapterNo: 9, month: 'December', title: 'Construction and Tilings', theme: 'Spatial Geometry', periods30: 16, plannedCompletionDate: '2026-12-22', examTag: 'UT-4' },
      { chapterNo: 10, month: 'January', title: 'Finding the Unknown (Equations)', theme: 'Algebraic Solving', periods30: 14, plannedCompletionDate: '2027-01-24', examTag: 'UT-4' },
    ]),
  },
  {
    id: 'vis-plan-8-sci',
    classLabel: 'Class VIII',
    classSection: '8-A',
    subject: 'Science',
    boardAlignment: 'HBSE / NCERT Curated',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 184,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(184, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 1–2 (Investigative World of Science, Invisible Living World)' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 3–4 (Health, Electricity: Magnetic & Heating Effects)' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Chapters 1 to 6 + Full Revision' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 7–10 (Matter, Elements/Compounds, Solutions, Light Mirrors & Lenses)' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Ch 11–13 (Skies, Ecology, Earth Science)' },
    ],
    enrichmentActivities: ['Fitness & Yoga Week', 'Science Quiz', 'Working Model Exhibition', 'STEM Activity', 'Annual Science Fair'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'May', title: 'Exploring the Investigative World of Science', theme: 'Science & Inquiry', periods30: 12, plannedCompletionDate: '2026-05-15', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'The Invisible Living World: Beyond Our Naked Eye', theme: 'Microbiology', periods30: 14, plannedCompletionDate: '2026-05-22', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: 'Health: The Ultimate Treasure', theme: 'Health', periods30: 14, plannedCompletionDate: '2026-07-19', examTag: 'UT-2' },
      { chapterNo: 4, month: 'July', title: 'Electricity: Magnetic and Heating Effects', theme: 'Energy', periods30: 14, plannedCompletionDate: '2026-07-29', examTag: 'UT-2' },
      { chapterNo: 5, month: 'August', title: 'Exploring Forces', theme: 'Force & Motion', periods30: 14, plannedCompletionDate: '2026-08-15', examTag: 'Half-Yearly' },
      { chapterNo: 6, month: 'August', title: 'Pressure, Winds, Storms, and Cyclones', theme: 'Weather & Climate', periods30: 14, plannedCompletionDate: '2026-08-29', examTag: 'Half-Yearly' },
      { chapterNo: 7, month: 'October', title: 'Particulate Nature of Matter', theme: 'Matter', periods30: 14, plannedCompletionDate: '2026-10-16', examTag: 'UT-3' },
      { chapterNo: 8, month: 'October', title: 'Nature of Matter: Elements, Compounds, and Mixtures', theme: 'Chemistry', periods30: 16, plannedCompletionDate: '2026-10-29', examTag: 'UT-3' },
      { chapterNo: 9, month: 'November', title: 'The Amazing World of Solutes, Solvents, and Solutions', theme: 'Solutions', periods30: 14, plannedCompletionDate: '2026-11-17', examTag: 'UT-3' },
      { chapterNo: 10, month: 'November', title: 'Light: Mirrors and Lenses', theme: 'Optics', periods30: 16, plannedCompletionDate: '2026-11-28', examTag: 'UT-3' },
      { chapterNo: 11, month: 'December', title: 'Keeping Time with the Skies', theme: 'Astronomy', periods30: 14, plannedCompletionDate: '2026-12-16', examTag: 'UT-4' },
      { chapterNo: 12, month: 'December', title: 'How Nature Works in Harmony', theme: 'Ecology', periods30: 14, plannedCompletionDate: '2026-12-22', examTag: 'Annual' },
      { chapterNo: 13, month: 'December', title: 'Our Home: Earth, a Unique Life Sustaining Planet', theme: 'Earth Science', periods30: 14, plannedCompletionDate: '2026-12-29', examTag: 'Annual' },
    ]),
  },
  {
    id: 'vis-plan-9-sst',
    classLabel: 'Class IX',
    classSection: '9-A',
    subject: 'Social Science',
    boardAlignment: 'HBSE Official (Haryana Board)',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 180,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(180, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Civics (Democracy, Constitutional Design, Electoral Politics) + India Size & Location' },
      { exam: 'Re-UT-1 (6–11 Jul)', dates: '6–11 Jul', syllabus: 'Gap Analysis + Remedial' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Moderates & Nationalists, Physical Features, Drainage, Village Palampur' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'Indian Revolutionary Movements (1857–1947), Climate, People as Resource + Term-I' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Renaissance, National Awakening, Mahatma Gandhi & INA, Vegetation & Wildlife' },
      { exam: 'UT-4 (27 Jan–2 Feb)', dates: '27 Jan–2 Feb', syllabus: 'Partition & Princely States, Role of Haryana in Freedom Movement, Population' },
    ],
    enrichmentActivities: ['Map Work & Timelines', 'Debates & Role Play', 'Source Analysis', 'Haryana Heritage Case Studies'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'What is Democracy? Constitutional Design, Electoral Politics & India Size/Location', theme: 'Civics & Geography', periods30: 28, plannedCompletionDate: '2026-05-15', examTag: 'UT-1' },
      { chapterNo: 2, month: 'July', title: 'Moderates & Nationalists (1857–1919), Physical Features, Drainage & Palampur', theme: 'HBSE History, Geo & Eco', periods30: 36, plannedCompletionDate: '2026-07-30', examTag: 'UT-2' },
      { chapterNo: 3, month: 'August', title: 'Indian Revolutionary Movements (1857–1947), Climate & People as Resource', theme: 'History, Climate & Eco', periods30: 36, plannedCompletionDate: '2026-08-30', examTag: 'Half-Yearly' },
      { chapterNo: 4, month: 'October', title: 'Social & Cultural Renaissance, National Awakening & Natural Vegetation', theme: 'History & Geography', periods30: 28, plannedCompletionDate: '2026-10-29', examTag: 'UT-3' },
      { chapterNo: 5, month: 'November', title: 'Mahatma Gandhi & Indian Freedom Struggle, INA & Netaji, Population', theme: 'Freedom Movement & Civics', periods30: 28, plannedCompletionDate: '2026-11-28', examTag: 'UT-3' },
      { chapterNo: 6, month: 'December', title: 'Partition, Integration of Princely States & Role of Haryana in National Movement', theme: 'HBSE Modern India', periods30: 24, plannedCompletionDate: '2026-12-28', examTag: 'UT-4' },
    ]),
  },
  {
    id: 'vis-plan-10-bio',
    classLabel: 'Class X',
    classSection: '10-A',
    subject: 'Science (Biology)',
    boardAlignment: 'HBSE Official (Board Class)',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 120,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(120, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (19–25 May)', dates: '19–25 May', syllabus: 'Ch 5: Our Environment' },
      { exam: 'UT-2 (17–22 Aug)', dates: '17–22 Aug', syllabus: 'Ch 1: Life Processes + Ch 2: Control and Coordination' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'UT-1 + UT-2 Complete Portion (Book-1 Complete)' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Ch 4: Heredity + Ch 3: How Do Organisms Reproduce?' },
      { exam: 'Pre-Board (10–20 Jan)', dates: '10–20 Jan', syllabus: 'Full HBSE Board Syllabus + Sample Papers' },
    ],
    enrichmentActivities: ['Botanical Garden Visit', 'Eco Club & Plantation Drive', 'Science Exhibition', 'Career Talk (Biology)'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'May', title: 'Our Environment (Ecosystem, Food Chains, Biogeochemical Cycles)', theme: 'Environment', periods30: 20, plannedCompletionDate: '2026-05-16', examTag: 'UT-1', revisionDays: '16 May · 19 May · 23 May · 30 May · 14 Jun' },
      { chapterNo: 2, month: 'July', title: 'Life Processes (Nutrition, Respiration, Transportation, Excretion)', theme: 'Health & Survival', periods30: 28, plannedCompletionDate: '2026-07-28', examTag: 'UT-2', revisionDays: '16 Jul · 19 Jul · 23 Jul · 1 Aug · 16 Aug' },
      { chapterNo: 3, month: 'August', title: 'Control and Coordination (Nervous System, Reflex, Hormones)', theme: 'Body Functions', periods30: 24, plannedCompletionDate: '2026-08-26', examTag: 'UT-2', revisionDays: '18 Aug · 21 Aug · 25 Aug · 2 Sep · 17 Sep' },
      { chapterNo: 4, month: 'October', title: 'Heredity (Variations, DNA & Genes, Sex Determination, Evolution)', theme: 'Genetics', periods30: 24, plannedCompletionDate: '2026-10-26', examTag: 'UT-3', revisionDays: '15 Oct · 18 Oct · 22 Oct · 31 Oct · 15 Nov' },
      { chapterNo: 5, month: 'November', title: 'How Do Organisms Reproduce? (Asexual, Sexual & Reproductive Health)', theme: 'Reproduction', periods30: 24, plannedCompletionDate: '2026-11-26', examTag: 'UT-3', revisionDays: '17 Nov · 20 Nov · 24 Nov · 1 Dec · 16 Dec' },
    ]),
  },
  {
    id: 'vis-plan-10-sst',
    classLabel: 'Class X',
    classSection: '10-A',
    subject: 'Social Science',
    boardAlignment: 'HBSE Official (Board Class)',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 180,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(180, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (May / Aug)', dates: 'May & Aug', syllabus: 'Sarasvati Sindhu Civilisation, Major Civilizations & Philosophies, Outcomes of Democracy' },
      { exam: 'Half-Yearly (15–26 Sep)', dates: '15–26 Sep', syllabus: 'All Completed History (HBSE), Geography, Civics & Economics Chapters' },
      { exam: 'UT-3 (18–25 Nov)', dates: '18–25 Nov', syllabus: 'Agriculture, Minerals, Manufacturing, Lifelines, Challenges to Democracy' },
      { exam: 'Pre-Board (10–20 Jan)', dates: '10–20 Jan', syllabus: 'Globalization, Consumer Rights + Full HBSE Board Syllabus' },
    ],
    enrichmentActivities: ['Case Studies & HOTS', 'Map Practice & Flowcharts', 'HBSE Previous Year Paper Drills', 'Mock Board Tests'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'Sarasvati Sindhu Civilisation, Colonialism & 50 Years of Independent India + Resources & Federalism', theme: 'HBSE History, Geo & Civics', periods30: 44, plannedCompletionDate: '2026-05-15', examTag: 'UT-1' },
      { chapterNo: 2, month: 'July', title: 'Major Civilizations of the Ancient World, Major Philosophies & Outcomes of Democracy', theme: 'HBSE History & Civics', periods30: 32, plannedCompletionDate: '2026-07-28', examTag: 'UT-2' },
      { chapterNo: 3, month: 'August', title: 'Medieval Society (Europe & India), Movement Against British Colonialism & Print Culture', theme: 'HBSE History', periods30: 32, plannedCompletionDate: '2026-08-28', examTag: 'Half-Yearly' },
      { chapterNo: 4, month: 'October', title: 'Agriculture & Minerals and Energy Resources', theme: 'Geography', periods30: 24, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 5, month: 'November', title: 'Manufacturing Industries, Lifelines of National Economy & Challenges to Democracy', theme: 'Geography & Civics', periods30: 28, plannedCompletionDate: '2026-11-28', examTag: 'UT-3' },
      { chapterNo: 6, month: 'December', title: 'Globalization & the Indian Economy, Consumer Rights + Full Board Revision', theme: 'Economics', periods30: 20, plannedCompletionDate: '2026-12-28', examTag: 'Pre-Board' },
    ]),
  },
  {
    id: 'vis-plan-11-polsci',
    classLabel: 'Class XI',
    classSection: '11-Arts',
    subject: 'Political Science',
    boardAlignment: 'HBSE Official (Senior Secondary)',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 180,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(180, 30, 40),
    syllabusDeadline: '2027-01-25',
    examSummary: [
      { exam: 'UT-1 (Apr–May)', dates: '19–25 May', syllabus: 'Ch 1–4: Constitution, Rights, Election & Representation, Executive' },
      { exam: 'Half-Yearly (Sep)', dates: '15–26 Sep', syllabus: 'Ch 1–9 including Legislature, Judiciary, Federalism, Local Govt & Political Theory' },
      { exam: 'UT-2 (Oct)', dates: 'Oct', syllabus: 'Legislature, Judiciary, Federalism, Local Govts & Political Theory' },
      { exam: 'UT-3 (Nov)', dates: '18–25 Nov', syllabus: 'Ch 10–13: Living Document, Philosophy of Constitution, Freedom, Equality' },
      { exam: 'UT-4 (Jan)', dates: '27 Jan–2 Feb', syllabus: 'Ch 14–18: Social Justice, Rights, Citizenship, Nationalism, Secularism' },
    ],
    enrichmentActivities: ['Constitution Day Celebration (26 Nov)', 'Mock Parliament Activity', 'Monthly Political Awareness Quiz', 'Debates & Case Studies'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'Constitution: Why and How? & Rights in the Indian Constitution', theme: 'Indian Constitution', periods30: 24, plannedCompletionDate: '2026-04-28', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'Election and Representation & Executive', theme: 'Governance', periods30: 24, plannedCompletionDate: '2026-05-15', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: 'Legislature & Judiciary', theme: 'Organs of State', periods30: 24, plannedCompletionDate: '2026-07-28', examTag: 'Half-Yearly' },
      { chapterNo: 4, month: 'August', title: 'Federalism, Local Governments & Political Theory: An Introduction', theme: 'Federal Structure', periods30: 28, plannedCompletionDate: '2026-08-29', examTag: 'Half-Yearly' },
      { chapterNo: 5, month: 'October', title: 'Constitution as a Living Document & The Philosophy of the Constitution', theme: 'Constitutional Philosophy', periods30: 20, plannedCompletionDate: '2026-10-25', examTag: 'UT-3' },
      { chapterNo: 6, month: 'November', title: 'Freedom & Equality', theme: 'Political Theory', periods30: 20, plannedCompletionDate: '2026-11-25', examTag: 'UT-3' },
      { chapterNo: 7, month: 'December', title: 'Social Justice & Rights', theme: 'Rights & Justice', periods30: 20, plannedCompletionDate: '2026-12-24', examTag: 'UT-4' },
      { chapterNo: 8, month: 'January', title: 'Citizenship, Nationalism & Secularism', theme: 'Civic Identity', periods30: 20, plannedCompletionDate: '2027-01-25', examTag: 'UT-4' },
    ]),
  },
  {
    id: 'vis-plan-12-polsci',
    classLabel: 'Class XII',
    classSection: '12-Arts',
    subject: 'Political Science',
    boardAlignment: 'HBSE Official (Board Class)',
    session: '2026-27',
    originalPeriodMinutes: 30,
    updatedPeriodMinutes: 40,
    originalPeriodsPerWeek: 6,
    shiftedPeriodsPerWeek: recalculatePeriodsForDuration(6, 30, 40),
    originalTotalPeriodsYear: 168,
    shiftedTotalPeriodsYear: recalculatePeriodsForDuration(168, 30, 40),
    syllabusDeadline: '2026-12-31',
    examSummary: [
      { exam: 'UT-1 (May)', dates: '19–25 May', syllabus: 'End of Bipolarity, Contemporary Centres of Power, South Asia, International Organisations' },
      { exam: 'Half-Yearly (Sep)', dates: '15–26 Sep', syllabus: 'World Politics Complete + India External Relations + Congress System' },
      { exam: 'UT-2 (Oct)', dates: 'Oct', syllabus: 'Security, Environment, Globalisation, External Relations, Congress System' },
      { exam: 'UT-3 (Nov–Dec)', dates: '18–25 Nov', syllabus: 'Challenges of Nation Building, One-Party Dominance, Planned Dev, Crisis of Democratic Order' },
      { exam: 'UT-4 & Pre-Board (Jan)', dates: '10–20 Jan / 27 Jan–2 Feb', syllabus: 'Regional Aspirations, Recent Developments + Complete Board Revision' },
    ],
    enrichmentActivities: ['World Political Map Activity', 'SAARC & UN Presentation', 'Planning Commission vs NITI Aayog Seminar', 'Board Exam Prep Workshop'],
    chapters: makeChapters([
      { chapterNo: 1, month: 'April', title: 'The End of Bipolarity & Contemporary Centres of Power', theme: 'World Politics', periods30: 24, plannedCompletionDate: '2026-04-28', examTag: 'UT-1' },
      { chapterNo: 2, month: 'May', title: 'Contemporary South Asia & International Organisations', theme: 'International Relations', periods30: 24, plannedCompletionDate: '2026-05-18', examTag: 'UT-1' },
      { chapterNo: 3, month: 'July', title: "Security in the Contemporary World & India's External Relations", theme: 'Security Studies', periods30: 24, plannedCompletionDate: '2026-07-28', examTag: 'Half-Yearly' },
      { chapterNo: 4, month: 'August', title: 'Environment & Natural Resources, Globalisation & Challenges to Congress System', theme: 'Global Issues', periods30: 28, plannedCompletionDate: '2026-08-29', examTag: 'Half-Yearly' },
      { chapterNo: 5, month: 'October', title: 'Challenges of Nation Building & Era of One-Party Dominance', theme: 'Indian Government', periods30: 24, plannedCompletionDate: '2026-10-28', examTag: 'UT-3' },
      { chapterNo: 6, month: 'November', title: 'Politics of Planned Development & The Crisis of Democratic Order', theme: 'Political Theory', periods30: 24, plannedCompletionDate: '2026-11-26', examTag: 'UT-3' },
      { chapterNo: 7, month: 'December', title: 'Regional Aspirations & Recent Developments in Indian Politics', theme: 'Indian Politics', periods30: 20, plannedCompletionDate: '2026-12-28', examTag: 'Pre-Board' },
    ]),
  },
];

/**
 * Generates VIS CurriculumChapterSchedule rows (using 40-minute shifted period counts)
 * so the Smart Academic Calendar Curriculum Recovery tracker reflects real VIS 2026–27 chapters.
 */
export function buildVisCurriculumPlans40Min(schoolId = VIS_SCHOOL_ID): CurriculumChapterSchedule[] {
  const plans: CurriculumChapterSchedule[] = [];
  for (const planner of VIS_SUBJECT_PLANNERS_2026) {
    for (const ch of planner.chapters) {
      const isDone = ch.plannedCompletionDate <= '2026-10-31';
      const isActive = !isDone && ch.plannedCompletionDate <= '2026-12-05';
      const planned = ch.shiftedPeriods40Min;
      const completed = isDone ? planned : isActive ? Math.max(1, Math.round(planned * 0.65)) : 0;
      const status: CurriculumChapterSchedule['status'] = isDone
        ? 'Completed'
        : isActive
          ? 'In Progress'
          : 'Planned';
      const examWindowDate =
        ch.examTag === 'UT-1'
          ? '2026-05-19'
          : ch.examTag === 'UT-2'
            ? '2026-08-17'
            : ch.examTag === 'Half-Yearly'
              ? '2026-09-15'
              : ch.examTag === 'UT-3'
                ? '2026-11-18'
                : ch.examTag === 'Pre-Board'
                  ? '2027-01-10'
                  : ch.examTag === 'UT-4'
                    ? '2027-01-27'
                    : '2027-03-09';

      plans.push({
        id: `cur-${schoolId}-${planner.id}-ch${ch.chapterNo}`,
        schoolId,
        classSection: planner.classSection,
        subject: planner.subject,
        chapterNumber: ch.chapterNo,
        chapterTitle: `${ch.title} (${ch.shiftedPeriods40Min}×40m; shifted from ${ch.originalPeriods30Min}×30m)`,
        plannedPeriods: planned,
        completedPeriods: completed,
        plannedCompletionDate: ch.plannedCompletionDate,
        examWindowDate,
        status,
      });
    }
  }
  return plans;
}
