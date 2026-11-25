import type {
  HandwritingRating,
  NotebookEntry,
  StudentRecord,
  WorkQualityRating,
} from '../types';
import { sortClassSectionsNaturally } from './classSubjectsEngine.ts';

export type NotebookCompletionStatus = 'Complete' | 'Incomplete' | 'Not Checked';

export interface ParsedChapterInfo {
  chapterNo: string;
  chapterName: string;
}

export interface StudentNotebookChapterRow {
  id: string;
  chapterNo: string;
  chapterName: string;
  rawChapter: string;
  subject: string;
  date: string;
  status: NotebookCompletionStatus;
  checked: boolean;
  homeworkDone: boolean;
  handwriting: HandwritingRating;
  workQuality: WorkQualityRating;
  teacherName: string;
  remarks: string;
}

export interface StudentBriefNotebookSummary {
  studentId: string;
  studentName: string;
  classSection: string;
  rollNo: string;
  admissionNo: string;
  totalChecks: number;
  completeCount: number;
  incompleteCount: number;
  notCheckedCount: number;
  totalDefaulterCount: number; // incompleteCount + notCheckedCount
  completionPct: number;
  readablePct: number;
  gradeCounts: { A: number; B: number; C: number };
  subjectsCovered: string[];
  latestCheckDate: string | null;
  rows: StudentNotebookChapterRow[];
}

export interface SchoolNotebookDefaulterRow {
  rank: number;
  studentId: string;
  studentName: string;
  classSection: string;
  rollNo: string;
  admissionNo: string;
  totalChecks: number;
  completeCount: number;
  incompleteCount: number;
  notCheckedCount: number;
  totalDefaulterCount: number;
  completionPct: number;
  latestIncompleteSubject: string | null;
  latestIncompleteChapterNo: string | null;
  latestIncompleteChapterName: string | null;
  latestIncompleteDate: string | null;
  incompleteSubjects: string[];
  severity: 'High' | 'Medium' | 'Clear';
}

export interface ClassNotebookHealthRow {
  classSection: string;
  totalChecks: number;
  completeCount: number;
  incompleteTotal: number;
  completionPct: number;
  studentsChecked: number;
  defaulterStudents: number;
}

export interface SubjectNotebookHealthRow {
  subject: string;
  totalChecks: number;
  completeCount: number;
  incompleteTotal: number;
  completionPct: number;
  defaulterInstances: number;
}

export interface SchoolNotebookDashboardSummary {
  totalChecks: number;
  completeChecks: number;
  incompleteChecks: number;
  notCheckedCount: number;
  totalIncompleteOrUnchecked: number;
  schoolCompletionPct: number;
  readablePct: number;
  studentsEvaluatedCount: number;
  totalDefaulterStudents: number;
  classesCheckedCount: number;
  subjectsCheckedCount: number;
  topDefaulters: SchoolNotebookDefaulterRow[];
  allStudentRows: SchoolNotebookDefaulterRow[];
  classBreakdown: ClassNotebookHealthRow[];
  subjectBreakdown: SubjectNotebookHealthRow[];
  availableClasses: string[];
  availableSubjects: string[];
}

/**
 * Extracts a clean Chapter Number and Chapter Name from strings like:
 * - "Ch. 4: Structure of the Atom" -> { chapterNo: "Ch. 4", chapterName: "Structure of the Atom" }
 * - "Chapter 7 - Fractions" -> { chapterNo: "Ch. 7", chapterName: "Fractions" }
 * - "Unit 2 · Algebra" -> { chapterNo: "Unit 2", chapterName: "Algebra" }
 * - "3. Photosynthesis" -> { chapterNo: "Ch. 3", chapterName: "Photosynthesis" }
 * - "Multiplication Tables 6 to 12" -> { chapterNo: "#1", chapterName: "Multiplication Tables 6 to 12" }
 */
export function parseChapterNumberAndName(
  rawChapter: string,
  fallbackIndex = 1,
): ParsedChapterInfo {
  const trimmed = (rawChapter || '').trim();
  if (!trimmed) {
    return { chapterNo: `#${fallbackIndex}`, chapterName: 'General Classwork' };
  }

  // Matches "Ch. 4: Name", "Ch 4 - Name", "Chapter 12 · Name", "Lesson 3: Name", "Unit 2: Name"
  const explicitMatch = trimmed.match(
    /^(ch(?:apter)?\.?|unit|lesson|ex(?:ercise)?\.?)\s*([0-9]+[a-z]?)\s*[:\-·–—.]?\s*(.*)$/i,
  );
  if (explicitMatch) {
    const prefixRaw = explicitMatch[1].toLowerCase();
    const num = explicitMatch[2];
    const rest = explicitMatch[3].trim();
    const prefix = prefixRaw.startsWith('ch')
      ? 'Ch.'
      : prefixRaw.startsWith('unit')
        ? 'Unit'
        : prefixRaw.startsWith('lesson')
          ? 'Lesson'
          : 'Ex.';
    return {
      chapterNo: `${prefix} ${num}`,
      chapterName: rest || trimmed,
    };
  }

  // Matches leading number like "4. Linear Equations" or "4: Linear Equations"
  const leadingNumMatch = trimmed.match(/^([0-9]{1,2})\s*[.:)\-–—]\s+(.+)$/);
  if (leadingNumMatch) {
    return {
      chapterNo: `Ch. ${leadingNumMatch[1]}`,
      chapterName: leadingNumMatch[2].trim(),
    };
  }

  return {
    chapterNo: `#${fallbackIndex}`,
    chapterName: trimmed,
  };
}

export function getNotebookEntryStatus(entry: NotebookEntry): NotebookCompletionStatus {
  if (!entry.checked) return 'Not Checked';
  if (!entry.homeworkDone) return 'Incomplete';
  return 'Complete';
}

export function isNotebookIncomplete(entry: NotebookEntry): boolean {
  return !entry.checked || !entry.homeworkDone;
}

/**
 * Builds a complete, chapter-numbered Brief Notebook Checking Report for one student
 * (shared identically by Student, Parent, Teacher, and Top Management).
 */
export function buildStudentBriefNotebookReport(
  student: StudentRecord,
  notebookEntries: NotebookEntry[],
): StudentBriefNotebookSummary {
  const studentEntries = notebookEntries
    .filter((nb) => nb.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  let completeCount = 0;
  let incompleteCount = 0;
  let notCheckedCount = 0;
  let readableCount = 0;
  let checkedCount = 0;
  const gradeCounts = { A: 0, B: 0, C: 0 };
  const subjectSet = new Set<string>();

  const rows: StudentNotebookChapterRow[] = studentEntries.map((entry, idx) => {
    const status = getNotebookEntryStatus(entry);
    if (status === 'Complete') completeCount += 1;
    else if (status === 'Incomplete') incompleteCount += 1;
    else notCheckedCount += 1;

    if (entry.checked) {
      checkedCount += 1;
      if (entry.handwriting === 'Readability') readableCount += 1;
      if (entry.workQuality === 'A' || entry.workQuality === 'B' || entry.workQuality === 'C') {
        gradeCounts[entry.workQuality] += 1;
      }
    }
    subjectSet.add(entry.subject);

    const parsed = parseChapterNumberAndName(entry.chapter, studentEntries.length - idx);
    return {
      id: entry.id,
      chapterNo: parsed.chapterNo,
      chapterName: parsed.chapterName,
      rawChapter: entry.chapter,
      subject: entry.subject,
      date: entry.date,
      status,
      checked: entry.checked,
      homeworkDone: entry.homeworkDone,
      handwriting: entry.handwriting,
      workQuality: entry.workQuality,
      teacherName: entry.teacherName,
      remarks: entry.remarks || '',
    };
  });

  const totalChecks = rows.length;
  const totalDefaulterCount = incompleteCount + notCheckedCount;
  const completionPct =
    totalChecks > 0 ? Math.round((completeCount / totalChecks) * 100) : 100;
  const readablePct =
    checkedCount > 0 ? Math.round((readableCount / checkedCount) * 100) : 0;

  return {
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    rollNo: student.rollNo,
    admissionNo: student.admissionNo,
    totalChecks,
    completeCount,
    incompleteCount,
    notCheckedCount,
    totalDefaulterCount,
    completionPct,
    readablePct,
    gradeCounts,
    subjectsCovered: Array.from(subjectSet).sort((a, b) => a.localeCompare(b)),
    latestCheckDate: rows[0]?.date ?? null,
    rows,
  };
}

/**
 * Computes school-wide Notebook Checking metrics, Top Defaulters ranked by incomplete/unchecked
 * notebooks, and class-wise + subject-wise completion breakdowns in O(N + M) time.
 */
export function computeSchoolNotebookDashboard(params: {
  students: StudentRecord[];
  notebookEntries: NotebookEntry[];
  classFilter?: string;
  subjectFilter?: string;
  searchQuery?: string;
}): SchoolNotebookDashboardSummary {
  const {
    students,
    notebookEntries,
    classFilter = 'ALL',
    subjectFilter = 'ALL',
    searchQuery = '',
  } = params;

  const studentMap = new Map<string, StudentRecord>();
  for (const st of students) studentMap.set(st.id, st);

  const availableClasses = sortClassSectionsNaturally(
    Array.from(
      new Set([
        ...students.map((s) => s.classSection),
        ...notebookEntries.map((n) => n.classSection),
      ]),
    ),
  );
  const availableSubjects = Array.from(
    new Set(notebookEntries.map((n) => n.subject).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const q = searchQuery.trim().toLowerCase();

  // Filter entries by class + subject + student search
  const filteredEntries = notebookEntries.filter((entry) => {
    if (classFilter !== 'ALL' && entry.classSection !== classFilter) return false;
    if (subjectFilter !== 'ALL' && entry.subject !== subjectFilter) return false;
    if (q) {
      const st = studentMap.get(entry.studentId);
      const hay = `${st?.name || ''} ${st?.rollNo || ''} ${st?.admissionNo || ''} ${entry.classSection} ${entry.subject} ${entry.chapter}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  let completeChecks = 0;
  let incompleteChecks = 0;
  let notCheckedCount = 0;
  let checkedEntriesCount = 0;
  let readableEntriesCount = 0;

  const entriesByStudent = new Map<string, NotebookEntry[]>();
  const classAgg = new Map<
    string,
    {
      total: number;
      complete: number;
      incomplete: number;
      students: Set<string>;
      defaulterStudents: Set<string>;
    }
  >();
  const subjectAgg = new Map<
    string,
    { total: number; complete: number; incomplete: number }
  >();

  for (const entry of filteredEntries) {
    const status = getNotebookEntryStatus(entry);
    const isInc = status !== 'Complete';
    if (status === 'Complete') completeChecks += 1;
    else if (status === 'Incomplete') incompleteChecks += 1;
    else notCheckedCount += 1;

    if (entry.checked) {
      checkedEntriesCount += 1;
      if (entry.handwriting === 'Readability') readableEntriesCount += 1;
    }

    let list = entriesByStudent.get(entry.studentId);
    if (!list) {
      list = [];
      entriesByStudent.set(entry.studentId, list);
    }
    list.push(entry);

    // Class aggregation
    let cBucket = classAgg.get(entry.classSection);
    if (!cBucket) {
      cBucket = {
        total: 0,
        complete: 0,
        incomplete: 0,
        students: new Set<string>(),
        defaulterStudents: new Set<string>(),
      };
      classAgg.set(entry.classSection, cBucket);
    }
    cBucket.total += 1;
    cBucket.students.add(entry.studentId);
    if (isInc) {
      cBucket.incomplete += 1;
      cBucket.defaulterStudents.add(entry.studentId);
    } else {
      cBucket.complete += 1;
    }

    // Subject aggregation
    let sBucket = subjectAgg.get(entry.subject);
    if (!sBucket) {
      sBucket = { total: 0, complete: 0, incomplete: 0 };
      subjectAgg.set(entry.subject, sBucket);
    }
    sBucket.total += 1;
    if (isInc) sBucket.incomplete += 1;
    else sBucket.complete += 1;
  }

  const rawStudentRows: Omit<SchoolNotebookDefaulterRow, 'rank'>[] = [];
  for (const [studentId, list] of entriesByStudent.entries()) {
    const st = studentMap.get(studentId);
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
    let completeCount = 0;
    let incompleteCount = 0;
    let stuNotChecked = 0;
    const incompleteSubjectSet = new Set<string>();
    let latestIncomplete: NotebookEntry | null = null;

    for (const item of sorted) {
      const status = getNotebookEntryStatus(item);
      if (status === 'Complete') {
        completeCount += 1;
      } else {
        if (status === 'Incomplete') incompleteCount += 1;
        else stuNotChecked += 1;
        incompleteSubjectSet.add(item.subject);
        if (!latestIncomplete) latestIncomplete = item;
      }
    }

    const totalDefaulterCount = incompleteCount + stuNotChecked;
    const totalChecks = sorted.length;
    const completionPct =
      totalChecks > 0 ? Math.round((completeCount / totalChecks) * 100) : 100;
    const parsedLatest = latestIncomplete
      ? parseChapterNumberAndName(latestIncomplete.chapter, 1)
      : null;

    rawStudentRows.push({
      studentId,
      studentName: st?.name || studentId,
      classSection: st?.classSection || sorted[0].classSection,
      rollNo: st?.rollNo || '—',
      admissionNo: st?.admissionNo || '—',
      totalChecks,
      completeCount,
      incompleteCount,
      notCheckedCount: stuNotChecked,
      totalDefaulterCount,
      completionPct,
      latestIncompleteSubject: latestIncomplete?.subject ?? null,
      latestIncompleteChapterNo: parsedLatest?.chapterNo ?? null,
      latestIncompleteChapterName: parsedLatest?.chapterName ?? null,
      latestIncompleteDate: latestIncomplete?.date ?? null,
      incompleteSubjects: Array.from(incompleteSubjectSet),
      severity:
        totalDefaulterCount >= 2 ? 'High' : totalDefaulterCount === 1 ? 'Medium' : 'Clear',
    });
  }

  // Sort: highest incomplete/unchecked count first, then lowest completion %, then student name
  rawStudentRows.sort((a, b) => {
    if (b.totalDefaulterCount !== a.totalDefaulterCount) {
      return b.totalDefaulterCount - a.totalDefaulterCount;
    }
    if (a.completionPct !== b.completionPct) {
      return a.completionPct - b.completionPct;
    }
    return a.studentName.localeCompare(b.studentName);
  });

  const allStudentRows: SchoolNotebookDefaulterRow[] = rawStudentRows.map((row, idx) => ({
    ...row,
    rank: idx + 1,
  }));

  const topDefaulters = allStudentRows.filter((r) => r.totalDefaulterCount > 0);

  const classBreakdown: ClassNotebookHealthRow[] = sortClassSectionsNaturally(
    Array.from(classAgg.keys()),
  ).map((cls) => {
    const agg = classAgg.get(cls)!;
    return {
      classSection: cls,
      totalChecks: agg.total,
      completeCount: agg.complete,
      incompleteTotal: agg.incomplete,
      completionPct: agg.total > 0 ? Math.round((agg.complete / agg.total) * 100) : 100,
      studentsChecked: agg.students.size,
      defaulterStudents: agg.defaulterStudents.size,
    };
  });

  const subjectBreakdown: SubjectNotebookHealthRow[] = Array.from(subjectAgg.entries())
    .map(([subject, agg]) => ({
      subject,
      totalChecks: agg.total,
      completeCount: agg.complete,
      incompleteTotal: agg.incomplete,
      completionPct: agg.total > 0 ? Math.round((agg.complete / agg.total) * 100) : 100,
      defaulterInstances: agg.incomplete,
    }))
    .sort((a, b) => b.defaulterInstances - a.defaulterInstances || a.completionPct - b.completionPct);

  const totalChecks = filteredEntries.length;
  const totalIncompleteOrUnchecked = incompleteChecks + notCheckedCount;

  return {
    totalChecks,
    completeChecks,
    incompleteChecks,
    notCheckedCount,
    totalIncompleteOrUnchecked,
    schoolCompletionPct:
      totalChecks > 0 ? Math.round((completeChecks / totalChecks) * 100) : 100,
    readablePct:
      checkedEntriesCount > 0
        ? Math.round((readableEntriesCount / checkedEntriesCount) * 100)
        : 0,
    studentsEvaluatedCount: allStudentRows.length,
    totalDefaulterStudents: topDefaulters.length,
    classesCheckedCount: classBreakdown.length,
    subjectsCheckedCount: subjectBreakdown.length,
    topDefaulters,
    allStudentRows,
    classBreakdown,
    subjectBreakdown,
    availableClasses,
    availableSubjects,
  };
}
