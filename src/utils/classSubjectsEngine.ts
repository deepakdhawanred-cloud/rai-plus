import type {
  ExamMark,
  HomeworkAssignment,
  LessonPlan,
  NotebookEntry,
  StudentRecord,
  TimetableSlot,
  UserAccount,
} from '../types';

export interface ClassSubjectResolution {
  subjects: string[];
  autoSelectedSubject: string;
  autoSelectReason: string;
  suggestedChapter: string;
}

const SUBJECT_CANONICAL_MAP: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /^maths?$|^mathematics$/i, label: 'Mathematics' },
  { pattern: /^eng(lish)?$/i, label: 'English' },
  { pattern: /^hin(di)?$/i, label: 'Hindi' },
  { pattern: /^sci(ence)?$/i, label: 'Science' },
  { pattern: /^soc(ial)?\s*sci(ence)?$|^sst$|^social\s*studies$/i, label: 'Social Science' },
  { pattern: /^sans(krit)?$/i, label: 'Sanskrit' },
  { pattern: /^phy(sics)?$/i, label: 'Physics' },
  { pattern: /^chem(istry)?$/i, label: 'Chemistry' },
  { pattern: /^bio(logy)?$/i, label: 'Biology' },
  { pattern: /^acc(ounts|ountancy)?$/i, label: 'Accountancy' },
  { pattern: /^bus(iness)?\s*st(udies)?$|^bst$/i, label: 'Business Studies' },
  { pattern: /^eco(nomics)?$/i, label: 'Economics' },
  { pattern: /^pol(\.|itical)?\s*sci(ence)?$/i, label: 'Political Science' },
  { pattern: /^geo(graphy)?$/i, label: 'Geography' },
  { pattern: /^hist(ory)?$/i, label: 'History' },
  { pattern: /^psych(ology)?$/i, label: 'Psychology' },
  { pattern: /^phy(sical)?\s*ed(ucation)?$|^pe$/i, label: 'Physical Education' },
  { pattern: /^comp(uter)?(\s*sci(ence)?)?$|^cs$/i, label: 'Computer Science' },
  { pattern: /^evs$|^environmental\s*studies$/i, label: 'EVS' },
  { pattern: /^gk$|^general\s*knowledge$/i, label: 'General Knowledge' },
  { pattern: /^sainik(\s*coaching)?$/i, label: 'Sainik Coaching' },
];

export function normalizeSubjectName(raw: string): string {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';
  for (const entry of SUBJECT_CANONICAL_MAP) {
    if (entry.pattern.test(cleaned)) return entry.label;
  }
  return cleaned
    .split(' ')
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export function sortClassSectionsNaturally(classes: string[]): string[] {
  const rank = (cls: string): number => {
    const upper = cls.trim().toUpperCase();
    if (upper.startsWith('NUR')) return -3;
    if (upper.startsWith('LKG')) return -2;
    if (upper.startsWith('UKG')) return -1;
    const match = upper.match(/\d+/);
    return match ? Number(match[0]) : 99;
  };
  return Array.from(new Set(classes.filter(Boolean))).sort((a, b) => {
    const diff = rank(a) - rank(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

/**
 * Returns the standard CBSE/HBSE/VIS curriculum subject list for a given class/stream.
 */
export function getCurriculumSubjectsForClass(classSection: string): string[] {
  const upper = classSection.trim().toUpperCase();

  if (upper.startsWith('NUR') || upper.startsWith('LKG') || upper.startsWith('UKG')) {
    return ['English', 'Hindi', 'Mathematics', 'EVS & Oral', 'Drawing & Rhymes'];
  }

  const numMatch = upper.match(/\d+/);
  const grade = numMatch ? Number(numMatch[0]) : 6;

  if (grade >= 11) {
    if (upper.includes('COMM')) {
      return [
        'Accountancy',
        'Business Studies',
        'Economics',
        'English',
        'Physical Education',
        'Mathematics',
      ];
    }
    if (upper.includes('ART') || upper.includes('HUM')) {
      return [
        'Political Science',
        'Geography',
        'Psychology',
        'History',
        'English',
        'Hindi',
        'Physical Education',
        'Mathematics',
      ];
    }
    if (upper.includes('MED') && !upper.includes('NON')) {
      return ['Biology', 'Physics', 'Chemistry', 'English', 'Physical Education'];
    }
    // Science / Non-Medical default for 11-12
    return [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
      'English',
      'Computer Science',
      'Physical Education',
    ];
  }

  if (grade >= 9) {
    return [
      'Mathematics',
      'Science',
      'English',
      'Hindi',
      'Social Science',
      'Sanskrit',
      'Physics',
      'Information Technology',
    ];
  }

  if (grade >= 6) {
    return [
      'Mathematics',
      'Science',
      'English',
      'Hindi',
      'Social Science',
      'Sanskrit',
      'Computer Science',
      'Sainik Coaching',
    ];
  }

  // Primary Classes 1 to 5
  return [
    'English',
    'Hindi',
    'Mathematics',
    'EVS',
    'General Knowledge',
    'Computer Science',
    'Sainik Coaching',
  ];
}

function tokenizeSpecialty(specialty?: string): string[] {
  if (!specialty) return [];
  return specialty
    .split(/[,/&|+·()-]+/)
    .map((part) => normalizeSubjectName(part))
    .filter((token) => token.length >= 2);
}

function matchesTeacherName(slotTeacherName: string, userName: string): boolean {
  const a = slotTeacherName.trim().toLowerCase();
  const b = userName.trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const bTokens = b
    .replace(/\b(mr|mrs|ms|dr|shri|smt|miss)\.?\s*/g, '')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
  return bTokens.some((tok) => a.includes(tok));
}

/**
 * Resolves the exact subject dropdown list and auto-selected subject for a given classSection
 * inside Notebook Checking, combining:
 * 1) Logged-in teacher's timetable slots for that class
 * 2) School timetable slots for that class
 * 3) Existing lesson plans, homework assignments, notebook logs, and exam marks for that class
 * 4) Grade/stream-appropriate curriculum subjects
 */
export function resolveClassSubjectsForNotebook(params: {
  classSection: string;
  user: UserAccount;
  students?: StudentRecord[];
  timetable?: TimetableSlot[];
  lessonPlans?: LessonPlan[];
  homeworkAssignments?: HomeworkAssignment[];
  notebookEntries?: NotebookEntry[];
  examMarks?: ExamMark[];
}): ClassSubjectResolution {
  const {
    classSection,
    user,
    students = [],
    timetable = [],
    lessonPlans = [],
    homeworkAssignments = [],
    notebookEntries = [],
    examMarks = [],
  } = params;

  const classKey = classSection.trim().toLowerCase();
  const classStudentIds = new Set(
    students
      .filter((s) => s.classSection.trim().toLowerCase() === classKey)
      .map((s) => s.id),
  );

  const orderedSubjects: string[] = [];
  const seen = new Set<string>();
  const addSubject = (raw?: string) => {
    if (!raw) return;
    const norm = normalizeSubjectName(raw);
    if (!norm) return;
    const key = norm.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    orderedSubjects.push(norm);
  };

  // 1. Timetable slots for this class
  const classSlots = timetable.filter(
    (slot) => slot.classSection.trim().toLowerCase() === classKey,
  );
  const teacherOwnSlots =
    user.role === 'teacher'
      ? classSlots.filter((slot) => matchesTeacherName(slot.teacherName, user.name))
      : [];

  for (const slot of teacherOwnSlots) addSubject(slot.subject);
  for (const slot of classSlots) addSubject(slot.subject);

  // 2. Lesson plans, homework, and notebook history for this class
  const classLessons = lessonPlans.filter(
    (lp) => lp.classSection.trim().toLowerCase() === classKey,
  );
  for (const lp of classLessons) addSubject(lp.subject);

  const classHomeworks = homeworkAssignments.filter(
    (hw) => hw.classSection.trim().toLowerCase() === classKey,
  );
  for (const hw of classHomeworks) addSubject(hw.subject);

  const classNotebooks = notebookEntries.filter(
    (nb) => nb.classSection.trim().toLowerCase() === classKey,
  );
  for (const nb of classNotebooks) addSubject(nb.subject);

  // 3. Exam marks recorded for students in this class
  for (const mk of examMarks) {
    if (classStudentIds.has(mk.studentId)) {
      addSubject(mk.subject);
    }
  }

  // 4. Curriculum subjects for this grade & stream
  const curriculumDefaults = getCurriculumSubjectsForClass(classSection);
  for (const sub of curriculumDefaults) addSubject(sub);

  // Determine auto-selected subject + human-readable reason
  let autoSelectedSubject = orderedSubjects[0] || 'Mathematics';
  let autoSelectReason = `Class ${classSection} curriculum`;

  if (user.role === 'teacher') {
    if (teacherOwnSlots.length > 0) {
      autoSelectedSubject = normalizeSubjectName(teacherOwnSlots[0].subject);
      autoSelectReason = `Auto-selected from your Class ${classSection} timetable`;
    } else {
      const specialtyTokens = tokenizeSpecialty(user.subjectSpecialty);
      const specialtyMatch = specialtyTokens.find((tok) =>
        orderedSubjects.some((s) => s.toLowerCase() === tok.toLowerCase()),
      );
      if (specialtyMatch) {
        const canonicalMatch = orderedSubjects.find(
          (s) => s.toLowerCase() === specialtyMatch.toLowerCase(),
        )!;
        autoSelectedSubject = canonicalMatch;
        autoSelectReason = `Auto-selected from your specialty (${canonicalMatch})`;
      } else if (classSlots.length > 0) {
        autoSelectedSubject = normalizeSubjectName(classSlots[0].subject);
        autoSelectReason = `Auto-selected from Class ${classSection} timetable`;
      }
    }
  } else if (classSlots.length > 0) {
    autoSelectedSubject = normalizeSubjectName(classSlots[0].subject);
    autoSelectReason = `Auto-selected from Class ${classSection} timetable`;
  } else if (classLessons.length > 0) {
    autoSelectedSubject = normalizeSubjectName(classLessons[0].subject);
    autoSelectReason = `Auto-selected from active Class ${classSection} lesson plan`;
  }

  const suggestedChapter = resolveSuggestedChapterForSubject({
    classSection,
    subject: autoSelectedSubject,
    lessonPlans,
    homeworkAssignments,
    notebookEntries,
  });

  return {
    subjects: orderedSubjects,
    autoSelectedSubject,
    autoSelectReason,
    suggestedChapter,
  };
}

export function resolveSuggestedChapterForSubject(params: {
  classSection: string;
  subject: string;
  lessonPlans?: LessonPlan[];
  homeworkAssignments?: HomeworkAssignment[];
  notebookEntries?: NotebookEntry[];
}): string {
  const {
    classSection,
    subject,
    lessonPlans = [],
    homeworkAssignments = [],
    notebookEntries = [],
  } = params;

  const classKey = classSection.trim().toLowerCase();
  const subKey = normalizeSubjectName(subject).toLowerCase();

  const matchingLesson = lessonPlans.find(
    (lp) =>
      lp.classSection.trim().toLowerCase() === classKey &&
      normalizeSubjectName(lp.subject).toLowerCase() === subKey,
  );
  if (matchingLesson?.topic) return matchingLesson.topic;

  const matchingHomework = homeworkAssignments.find(
    (hw) =>
      hw.classSection.trim().toLowerCase() === classKey &&
      normalizeSubjectName(hw.subject).toLowerCase() === subKey &&
      hw.chapter,
  );
  if (matchingHomework?.chapter) return matchingHomework.chapter;

  const matchingNotebook = notebookEntries.find(
    (nb) =>
      nb.classSection.trim().toLowerCase() === classKey &&
      normalizeSubjectName(nb.subject).toLowerCase() === subKey &&
      nb.chapter,
  );
  if (matchingNotebook?.chapter) return matchingNotebook.chapter;

  return `${subject || 'Class'} · Current Chapter Practice`;
}
