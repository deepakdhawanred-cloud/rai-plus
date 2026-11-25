import type {
  HomeworkAssignment,
  HomeworkSubmission,
  LessonPlan,
  NotebookEntry,
  StudentRecord,
} from '../types';
import { parseChapterNumberAndName } from './notebookAnalyticsEngine.ts';

export interface PriorChapterGapItem {
  studentId: string;
  studentName: string;
  classSection: string;
  rollNo: string;
  subject: string;
  missingChapterNum: number;
  missingChapterNo: string;
  missingChapterName: string;
  missingRawChapter: string;
  currentChapterNum: number;
  currentChapterLabel: string;
  chapterGap: number;
  reason: 'Not Checked (Explicit)' | 'Not Checked While Class Moved Ahead';
  severity: 'Critical' | 'High';
  referenceDate: string;
}

export interface PendingHomeworkItem {
  assignmentId: string;
  subject: string;
  chapter: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Missing';
  overdue: boolean;
}

export interface StudentPendingCheckingRecord {
  studentId: string;
  studentName: string;
  classSection: string;
  rollNo: string;
  guardianName: string;
  priorChapterGaps: PriorChapterGapItem[];
  pendingNotebookEntries: Array<{
    id: string;
    subject: string;
    chapterNo: string;
    chapterName: string;
    date: string;
    status: 'Not Checked' | 'Incomplete';
  }>;
  pendingHomeworks: PendingHomeworkItem[];
  totalPendingItems: number;
  highestChapterGap: number;
  priority: 'Critical' | 'High' | 'Medium';
}

export interface PendingCheckingHighlightsSummary {
  studentsWithPendingCount: number;
  priorChapterGapStudentsCount: number;
  priorChapterGapCount: number;
  pendingNotebookChecksCount: number;
  pendingHomeworkChecksCount: number;
  rankedStudents: StudentPendingCheckingRecord[];
  byStudentId: Record<string, StudentPendingCheckingRecord>;
}

/**
 * Extracts a positive integer chapter number from strings such as:
 * - "Ch. 1: Knowing Our Numbers" -> 1
 * - "Chapter 3 - Playing With Numbers" -> 3
 * - "Unit 4: Reading" -> 4
 * - "Lesson 2 · Pronouns" -> 2
 * - "3. Photosynthesis" -> 3
 */
export function extractNumericChapterIndex(rawChapter: string | undefined | null): number | null {
  const trimmed = (rawChapter || '').trim();
  if (!trimmed) return null;

  const explicit = trimmed.match(
    /^(?:ch(?:apter)?\.?|unit|lesson)\s*([0-9]{1,2})\b/i,
  );
  if (explicit) {
    const n = Number.parseInt(explicit[1], 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  const leading = trimmed.match(/^([0-9]{1,2})\s*[.:)\-–—]\s+/);
  if (leading) {
    const n = Number.parseInt(leading[1], 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  // Fallback: "... Chapter 3 ..." anywhere in string
  const embedded = trimmed.match(/\b(?:ch(?:apter)?\.?|unit|lesson)\s*([0-9]{1,2})\b/i);
  if (embedded) {
    const n = Number.parseInt(embedded[1], 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  return null;
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Detects students in a single (classSection, subject) whose earlier chapter (e.g. Ch. 1)
 * is still NOT checked even though the teacher has moved ahead to a later chapter (e.g. Ch. 3).
 *
 * Scope rule (avoids false positives on unrelated students):
 * - Evaluates every student who belongs to `classSection` AND either:
 *   (a) is explicitly included in `targetStudentIds` (e.g. active batch or live matrix), OR
 *   (b) has any notebook/homework activity in that class/subject, OR
 *   (c) had an earlier chapter explicitly marked `checked: false` (Not Checked).
 *   When `includeAllClassStudents` is true (e.g., live teacher checking matrix for that class),
 *   all students in that class section are evaluated against every known earlier chapter.
 */
export function detectPriorChapterBacklogsForClassSubject(params: {
  classSection: string;
  subject: string;
  students: StudentRecord[];
  notebookEntries: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  lessonPlans?: LessonPlan[];
  liveChapter?: string;
  liveDate?: string;
  targetStudentIds?: Set<string>;
  includeAllClassStudents?: boolean;
}): PriorChapterGapItem[] {
  const {
    classSection,
    subject,
    students,
    notebookEntries,
    homeworkAssignments = [],
    lessonPlans = [],
    liveChapter,
    liveDate = '2026-11-19',
    targetStudentIds,
    includeAllClassStudents = false,
  } = params;

  const clsKey = normalizeKey(classSection);
  const subKey = normalizeKey(subject);
  if (!clsKey || !subKey) return [];

  const classStudents = students.filter((s) => normalizeKey(s.classSection) === clsKey);
  if (classStudents.length === 0) return [];

  const matchingNotebooks = notebookEntries.filter(
    (n) => normalizeKey(n.classSection) === clsKey && normalizeKey(n.subject) === subKey,
  );
  const matchingHomeworks = homeworkAssignments.filter(
    (h) =>
      h.status !== 'Cancelled' &&
      normalizeKey(h.classSection) === clsKey &&
      normalizeKey(h.subject) === subKey,
  );
  const matchingLessons = lessonPlans.filter(
    (l) => normalizeKey(l.classSection) === clsKey && normalizeKey(l.subject) === subKey,
  );

  // Map chapterNum -> canonical label & latest date
  const knownChapters = new Map<
    number,
    { rawChapter: string; chapterNo: string; chapterName: string; date: string; hasClassCheck: boolean }
  >();

  function registerChapter(raw: string | undefined, date: string, hasClassCheck: boolean) {
    const num = extractNumericChapterIndex(raw);
    if (!num || !raw) return;
    const parsed = parseChapterNumberAndName(raw, num);
    const prev = knownChapters.get(num);
    if (!prev) {
      knownChapters.set(num, {
        rawChapter: raw.trim(),
        chapterNo: parsed.chapterNo,
        chapterName: parsed.chapterName,
        date,
        hasClassCheck,
      });
    } else {
      knownChapters.set(num, {
        rawChapter:
          parsed.chapterName.length > prev.chapterName.length ? raw.trim() : prev.rawChapter,
        chapterNo: prev.chapterNo,
        chapterName:
          parsed.chapterName.length > prev.chapterName.length
            ? parsed.chapterName
            : prev.chapterName,
        date: date > prev.date ? date : prev.date,
        hasClassCheck: prev.hasClassCheck || hasClassCheck,
      });
    }
  }

  for (const nb of matchingNotebooks) {
    registerChapter(nb.chapter, nb.date, true);
  }
  for (const hw of matchingHomeworks) {
    registerChapter(hw.chapter, hw.assignedDate, false);
  }
  for (const lp of matchingLessons) {
    registerChapter(lp.topic, lp.targetDate, false);
  }
  if (liveChapter) {
    registerChapter(liveChapter, liveDate, true);
  }

  if (knownChapters.size === 0) return [];

  const chapterNumbers = Array.from(knownChapters.keys()).sort((a, b) => a - b);
  const currentChapterNum = chapterNumbers[chapterNumbers.length - 1];
  if (currentChapterNum < 2) return [];

  const currentChapterMeta = knownChapters.get(currentChapterNum)!;
  const currentChapterLabel =
    currentChapterMeta.chapterNo !== '—'
      ? `${currentChapterMeta.chapterNo}: ${currentChapterMeta.chapterName}`
      : currentChapterMeta.rawChapter;

  // Earlier chapters that we know were taught/checked before currentChapterNum
  const earlierChapters = chapterNumbers
    .filter((num) => num < currentChapterNum)
    .map((num) => ({ num, meta: knownChapters.get(num)! }));

  if (earlierChapters.length === 0) return [];

  // Index each student's notebook status per chapterNum in this subject
  const studentChapterState = new Map<
    string,
    Map<number, { anyChecked: boolean; explicitUnchecked: boolean; latestDate: string }>
  >();
  const activeSubjectStudentIds = new Set<string>();

  for (const nb of matchingNotebooks) {
    activeSubjectStudentIds.add(nb.studentId);
    const num = extractNumericChapterIndex(nb.chapter);
    if (!num) continue;
    let byChap = studentChapterState.get(nb.studentId);
    if (!byChap) {
      byChap = new Map();
      studentChapterState.set(nb.studentId, byChap);
    }
    const prev = byChap.get(num) || {
      anyChecked: false,
      explicitUnchecked: false,
      latestDate: nb.date,
    };
    byChap.set(num, {
      anyChecked: prev.anyChecked || nb.checked,
      explicitUnchecked: prev.explicitUnchecked || !nb.checked,
      latestDate: nb.date > prev.latestDate ? nb.date : prev.latestDate,
    });
  }

  const candidateStudents = classStudents.filter((st) => {
    if (includeAllClassStudents) return true;
    if (targetStudentIds && targetStudentIds.has(st.id)) return true;
    return activeSubjectStudentIds.has(st.id);
  });

  const gaps: PriorChapterGapItem[] = [];

  for (const st of candidateStudents) {
    const byChap = studentChapterState.get(st.id);
    for (const { num: missingNum, meta } of earlierChapters) {
      const state = byChap?.get(missingNum);
      // If student already has checked: true for this earlier chapter, they are clear!
      if (state?.anyChecked) continue;

      const isExplicitUnchecked = Boolean(state?.explicitUnchecked);
      // Only flag an unlogged missing chapter if at least one classmate had it checked/logged
      // OR the student explicitly has checked: false on it.
      if (!isExplicitUnchecked && !meta.hasClassCheck) continue;

      const chapterGap = currentChapterNum - missingNum;
      gaps.push({
        studentId: st.id,
        studentName: st.name,
        classSection: st.classSection,
        rollNo: st.rollNo,
        subject: subject.trim(),
        missingChapterNum: missingNum,
        missingChapterNo: meta.chapterNo,
        missingChapterName: meta.chapterName,
        missingRawChapter: meta.rawChapter,
        currentChapterNum,
        currentChapterLabel,
        chapterGap,
        reason: isExplicitUnchecked
          ? 'Not Checked (Explicit)'
          : 'Not Checked While Class Moved Ahead',
        severity: chapterGap >= 2 ? 'Critical' : 'High',
        referenceDate: state?.latestDate || meta.date || liveDate,
      });
    }
  }

  gaps.sort((a, b) => {
    if (b.chapterGap !== a.chapterGap) return b.chapterGap - a.chapterGap;
    if (a.missingChapterNum !== b.missingChapterNum) return a.missingChapterNum - b.missingChapterNum;
    const aExplicit = a.reason === 'Not Checked (Explicit)' ? 1 : 0;
    const bExplicit = b.reason === 'Not Checked (Explicit)' ? 1 : 0;
    if (bExplicit !== aExplicit) return bExplicit - aExplicit;
    return a.studentName.localeCompare(b.studentName);
  });

  return gaps;
}

/**
 * Computes school-wide (or filtered) pending notebook checking, prior-chapter backlog,
 * and pending homework checking highlights for teachers, management, students, and parents.
 */
export function computePendingCheckingHighlights(params: {
  students: StudentRecord[];
  notebookEntries: NotebookEntry[];
  homeworkAssignments?: HomeworkAssignment[];
  homeworkSubmissions?: HomeworkSubmission[];
  lessonPlans?: LessonPlan[];
  todayIso?: string;
  classFilter?: string;
  subjectFilter?: string;
  searchQuery?: string;
  liveContext?: {
    classSection: string;
    subject: string;
    chapter: string;
    date?: string;
  };
}): PendingCheckingHighlightsSummary {
  const {
    students,
    notebookEntries,
    homeworkAssignments = [],
    homeworkSubmissions = [],
    lessonPlans = [],
    todayIso = '2026-11-19',
    classFilter = 'ALL',
    subjectFilter = 'ALL',
    searchQuery = '',
    liveContext,
  } = params;

  const studentMap = new Map<string, StudentRecord>();
  for (const st of students) studentMap.set(st.id, st);

  const q = searchQuery.trim().toLowerCase();

  // Discover all (classSection, subject) pairs across notebooks, homeworks, lessons, and liveContext
  const pairMap = new Map<string, { classSection: string; subject: string }>();
  const addPair = (cls: string, sub: string) => {
    if (!cls.trim() || !sub.trim()) return;
    if (classFilter !== 'ALL' && cls !== classFilter) return;
    if (subjectFilter !== 'ALL' && sub !== subjectFilter) return;
    const key = `${normalizeKey(cls)}||${normalizeKey(sub)}`;
    if (!pairMap.has(key)) {
      pairMap.set(key, { classSection: cls.trim(), subject: sub.trim() });
    }
  };

  for (const nb of notebookEntries) addPair(nb.classSection, nb.subject);
  for (const hw of homeworkAssignments) {
    if (hw.status !== 'Cancelled') addPair(hw.classSection, hw.subject);
  }
  for (const lp of lessonPlans) addPair(lp.classSection, lp.subject);
  if (liveContext) addPair(liveContext.classSection, liveContext.subject);

  const byStudent = new Map<string, StudentPendingCheckingRecord>();
  const ensureStudentBucket = (studentId: string): StudentPendingCheckingRecord | null => {
    const existing = byStudent.get(studentId);
    if (existing) return existing;
    const st = studentMap.get(studentId);
    if (!st) return null;
    const created: StudentPendingCheckingRecord = {
      studentId: st.id,
      studentName: st.name,
      classSection: st.classSection,
      rollNo: st.rollNo,
      guardianName: st.guardianName,
      priorChapterGaps: [],
      pendingNotebookEntries: [],
      pendingHomeworks: [],
      totalPendingItems: 0,
      highestChapterGap: 0,
      priority: 'Medium',
    };
    byStudent.set(studentId, created);
    return created;
  };

  // 1. Prior-Chapter Unchecked Backlogs
  const seenGapKeys = new Set<string>();
  for (const { classSection, subject } of pairMap.values()) {
    const isLivePair =
      liveContext &&
      normalizeKey(liveContext.classSection) === normalizeKey(classSection) &&
      normalizeKey(liveContext.subject) === normalizeKey(subject);

    const gaps = detectPriorChapterBacklogsForClassSubject({
      classSection,
      subject,
      students,
      notebookEntries,
      homeworkAssignments,
      lessonPlans,
      liveChapter: isLivePair ? liveContext.chapter : undefined,
      liveDate: isLivePair ? liveContext.date || todayIso : todayIso,
      includeAllClassStudents: Boolean(isLivePair),
    });

    for (const gap of gaps) {
      const gapKey = `${gap.studentId}||${normalizeKey(gap.subject)}||${gap.missingChapterNum}`;
      if (seenGapKeys.has(gapKey)) continue;
      seenGapKeys.add(gapKey);
      const bucket = ensureStudentBucket(gap.studentId);
      if (bucket) {
        bucket.priorChapterGaps.push(gap);
      }
    }
  }

  // 2. Direct Pending / Incomplete Notebook Entries
  for (const nb of notebookEntries) {
    if (nb.checked && nb.homeworkDone) continue;
    if (classFilter !== 'ALL' && nb.classSection !== classFilter) continue;
    if (subjectFilter !== 'ALL' && nb.subject !== subjectFilter) continue;
    const bucket = ensureStudentBucket(nb.studentId);
    if (!bucket) continue;
    const parsed = parseChapterNumberAndName(nb.chapter, 1);
    bucket.pendingNotebookEntries.push({
      id: nb.id,
      subject: nb.subject,
      chapterNo: parsed.chapterNo,
      chapterName: parsed.chapterName,
      date: nb.date,
      status: !nb.checked ? 'Not Checked' : 'Incomplete',
    });
  }

  // 3. Pending / Missing Homework Checking
  const subByAssignmentAndStudent = new Map<string, HomeworkSubmission>();
  for (const sub of homeworkSubmissions) {
    subByAssignmentAndStudent.set(`${sub.assignmentId}||${sub.studentId}`, sub);
  }

  const activeAssignments = homeworkAssignments.filter((hw) => {
    if (hw.status !== 'Active') return false;
    if (classFilter !== 'ALL' && hw.classSection !== classFilter) return false;
    if (subjectFilter !== 'ALL' && hw.subject !== subjectFilter) return false;
    return true;
  });

  for (const hw of activeAssignments) {
    const overdue = hw.dueDate < todayIso;
    const hwSubs = homeworkSubmissions.filter((s) => s.assignmentId === hw.id);
    for (const sub of hwSubs) {
      if (sub.status !== 'Pending' && sub.status !== 'Missing') continue;
      const bucket = ensureStudentBucket(sub.studentId);
      if (!bucket) continue;
      bucket.pendingHomeworks.push({
        assignmentId: hw.id,
        subject: hw.subject,
        chapter: hw.chapter,
        title: hw.title,
        dueDate: hw.dueDate,
        status: sub.status,
        overdue,
      });
    }

    // In liveContext for a specific class, also highlight students who have no submission row yet
    if (
      liveContext &&
      normalizeKey(hw.classSection) === normalizeKey(liveContext.classSection)
    ) {
      const clsStudents = students.filter(
        (s) => normalizeKey(s.classSection) === normalizeKey(hw.classSection),
      );
      for (const st of clsStudents) {
        if (subByAssignmentAndStudent.has(`${hw.id}||${st.id}`)) continue;
        const bucket = ensureStudentBucket(st.id);
        if (!bucket) continue;
        bucket.pendingHomeworks.push({
          assignmentId: hw.id,
          subject: hw.subject,
          chapter: hw.chapter,
          title: hw.title,
          dueDate: hw.dueDate,
          status: 'Pending',
          overdue,
        });
      }
    }
  }

  // Finalize counts, search filter, and sort
  const rankedStudents: StudentPendingCheckingRecord[] = [];
  let priorChapterGapStudentsCount = 0;
  let priorChapterGapCount = 0;
  let pendingNotebookChecksCount = 0;
  let pendingHomeworkChecksCount = 0;

  for (const rec of byStudent.values()) {
    if (q) {
      const hay = [
        rec.studentName,
        rec.classSection,
        rec.rollNo,
        ...rec.priorChapterGaps.map((g) => `${g.subject} ${g.missingRawChapter} ${g.currentChapterLabel}`),
        ...rec.pendingNotebookEntries.map((n) => `${n.subject} ${n.chapterNo} ${n.chapterName}`),
        ...rec.pendingHomeworks.map((h) => `${h.subject} ${h.chapter} ${h.title}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) continue;
    }

    rec.highestChapterGap = rec.priorChapterGaps.reduce(
      (max, g) => Math.max(max, g.chapterGap),
      0,
    );
    rec.totalPendingItems =
      rec.priorChapterGaps.length +
      rec.pendingNotebookEntries.length +
      rec.pendingHomeworks.length;
    if (rec.totalPendingItems === 0) continue;

    rec.priority =
      rec.highestChapterGap >= 2 || rec.priorChapterGaps.length >= 2
        ? 'Critical'
        : rec.priorChapterGaps.length >= 1 || rec.pendingNotebookEntries.length >= 2
          ? 'High'
          : 'Medium';

    if (rec.priorChapterGaps.length > 0) priorChapterGapStudentsCount += 1;
    priorChapterGapCount += rec.priorChapterGaps.length;
    pendingNotebookChecksCount += rec.pendingNotebookEntries.length;
    pendingHomeworkChecksCount += rec.pendingHomeworks.length;

    rankedStudents.push(rec);
  }

  rankedStudents.sort((a, b) => {
    if (b.highestChapterGap !== a.highestChapterGap) {
      return b.highestChapterGap - a.highestChapterGap;
    }
    if (b.priorChapterGaps.length !== a.priorChapterGaps.length) {
      return b.priorChapterGaps.length - a.priorChapterGaps.length;
    }
    const aExplicit = a.priorChapterGaps.some((g) => g.reason === 'Not Checked (Explicit)') ? 1 : 0;
    const bExplicit = b.priorChapterGaps.some((g) => g.reason === 'Not Checked (Explicit)') ? 1 : 0;
    if (bExplicit !== aExplicit) return bExplicit - aExplicit;
    if (b.totalPendingItems !== a.totalPendingItems) {
      return b.totalPendingItems - a.totalPendingItems;
    }
    return a.studentName.localeCompare(b.studentName);
  });

  const byStudentId: Record<string, StudentPendingCheckingRecord> = {};
  for (const rec of rankedStudents) {
    byStudentId[rec.studentId] = rec;
  }

  return {
    studentsWithPendingCount: rankedStudents.length,
    priorChapterGapStudentsCount,
    priorChapterGapCount,
    pendingNotebookChecksCount,
    pendingHomeworkChecksCount,
    rankedStudents,
    byStudentId,
  };
}
