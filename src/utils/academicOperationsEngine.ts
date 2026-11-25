import type {
  AcademicResource,
  AttendanceRecord,
  ProductionRegisterRow,
  RegisterApprovalRecord,
  ResourceCategory,
  TimetableSlot,
  ViratResourcePack,
} from '../types';
import { VIS_DAYS, VIS_PERIOD_TIMINGS } from '../data/visTimetableNov2026.ts';
import { resolveRegisterApprovalState } from './viratCurriculumEngine.ts';

export const RESOURCE_CATEGORIES_ORDER: ResourceCategory[] = [
  'Presentations',
  'Teacher Guides',
  'Worksheets',
  'Answer Keys',
  'Assessments and Rubrics',
];

export interface BatchAttendanceEntryInput {
  studentId: string;
  status: 'Present' | 'Absent' | 'Leave';
  contextNote?: string;
}

export interface ClassSubjectCurriculumNode {
  classKey: string;
  subject: string;
  packs: ViratResourcePack[];
  registerRows: ProductionRegisterRow[];
  schoolResources: AcademicResource[];
  totalDriveFiles: number;
  categoryCounts: Record<ResourceCategory, number>;
  approvedCount: number;
  awaitingApprovalCount: number;
  producedCount: number;
  books: string[];
}

export interface ClassCurriculumGroup {
  classKey: string;
  classOrder: number;
  subjects: ClassSubjectCurriculumNode[];
  totalPacks: number;
  totalDriveFiles: number;
  totalChapters: number;
  totalSchoolResources: number;
  approvedCount: number;
}

function normalizeTeacherTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/\b(dr|mr|mrs|ms|shri|smt)\.?\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 2);
}

/**
 * Token-safe matcher so "Dr. Deepak Dhawan" matches "Deepak Dhawan",
 * "Pooja Dhillon" matches "Yatish, Pooja Dhillon", and "Manisha" never falsely
 * matches an unrelated prefix substring.
 */
export function teacherMatchesSlot(slotTeacherName: string, userName: string): boolean {
  const userTokens = normalizeTeacherTokens(userName);
  if (userTokens.length === 0) return false;
  const parts = slotTeacherName
    .split(',')
    .map((p) => normalizeTeacherTokens(p))
    .filter((toks) => toks.length > 0);

  return parts.some((partTokens) => {
    if (partTokens.length === 1) {
      return userTokens.length === 1
        ? partTokens[0] === userTokens[0]
        : userTokens[0] === partTokens[0] || userTokens.includes(partTokens[0]);
    }
    return partTokens.every((t) => userTokens.includes(t));
  });
}

export function normalizeCurriculumClassKey(raw: string): string {
  const clean = raw.trim();
  if (!clean) return 'General';
  if (/to/i.test(clean) && /\d/.test(clean)) return 'School-Wide';
  if (/^class\s+\d+/i.test(clean)) {
    const num = clean.match(/\d+/)?.[0];
    return num ? `Class ${num}` : clean;
  }
  const numMatch = clean.match(/^(\d+)(?:\s*[-–]|\s+|$)/);
  if (numMatch) {
    return `Class ${numMatch[1]}`;
  }
  if (/^(lkg|ukg|nursery)/i.test(clean)) {
    return clean.toUpperCase();
  }
  return clean;
}

export function normalizeCurriculumSubjectKey(raw: string): string {
  const clean = raw.trim();
  if (!clean) return 'General';
  const lower = clean.toLowerCase();
  if (lower.startsWith('english')) return 'English';
  if (lower.startsWith('hindi')) return 'Hindi';
  if (lower === 'maths' || lower.startsWith('mathematics')) return 'Mathematics';
  if (lower.startsWith('social science') || lower.includes('sst')) return 'Social Science';
  if (lower.startsWith('pol') && lower.includes('sci')) return 'Political Science';
  if (lower.startsWith('phyical education') || lower.startsWith('physical education')) {
    return 'Physical Education';
  }
  if (lower.startsWith('account')) return 'Accountancy';
  if (lower.startsWith('business')) return 'Business Studies';
  if (lower.startsWith('computer')) return 'Computer Literacy';
  if (lower === 'cbse') return 'Hindi';
  return clean;
}

function classSortWeight(classKey: string): number {
  const upper = classKey.toUpperCase();
  if (upper === 'NURSERY') return 0;
  if (upper === 'LKG') return 1;
  if (upper === 'UKG') return 2;
  const num = classKey.match(/\d+/);
  if (num) return 10 + Number(num[0]);
  return 999;
}

function emptyCategoryCounts(): Record<ResourceCategory, number> {
  return {
    Presentations: 0,
    'Teacher Guides': 0,
    Worksheets: 0,
    'Answer Keys': 0,
    'Assessments and Rubrics': 0,
  };
}

export function buildClassSubjectResourceIndex(params: {
  packs: ViratResourcePack[];
  registerRows: ProductionRegisterRow[];
  registerApprovals: Record<string, RegisterApprovalRecord>;
  schoolResources: AcademicResource[];
}): ClassCurriculumGroup[] {
  const groupMap = new Map<string, Map<string, ClassSubjectCurriculumNode>>();

  function ensureNode(classKey: string, subject: string): ClassSubjectCurriculumNode {
    if (!groupMap.has(classKey)) {
      groupMap.set(classKey, new Map());
    }
    const subMap = groupMap.get(classKey)!;
    if (!subMap.has(subject)) {
      subMap.set(subject, {
        classKey,
        subject,
        packs: [],
        registerRows: [],
        schoolResources: [],
        totalDriveFiles: 0,
        categoryCounts: emptyCategoryCounts(),
        approvedCount: 0,
        awaitingApprovalCount: 0,
        producedCount: 0,
        books: [],
      });
    }
    return subMap.get(subject)!;
  }

  for (const pack of params.packs) {
    const classKey = normalizeCurriculumClassKey(pack.className);
    const subject = normalizeCurriculumSubjectKey(pack.subject);
    const node = ensureNode(classKey, subject);
    node.packs.push(pack);
    node.totalDriveFiles += pack.totalFiles;
    node.producedCount += 1;
    for (const cat of RESOURCE_CATEGORIES_ORDER) {
      node.categoryCounts[cat] += (pack.filesByCategory[cat] || []).length;
    }
  }

  for (const row of params.registerRows) {
    const classKey = normalizeCurriculumClassKey(row.classLabel);
    const subject = normalizeCurriculumSubjectKey(row.subject);
    const node = ensureNode(classKey, subject);
    node.registerRows.push(row);
    if (row.book && !node.books.includes(row.book)) {
      node.books.push(row.book);
    }
    const state = resolveRegisterApprovalState(row, params.registerApprovals);
    if (state === 'Teacher Approved') {
      node.approvedCount += 1;
      node.producedCount += 1;
    } else if (state !== 'Not Produced') {
      node.awaitingApprovalCount += 1;
      node.producedCount += 1;
    }
  }

  for (const res of params.schoolResources) {
    const classKey = normalizeCurriculumClassKey(res.classSection);
    const subject = normalizeCurriculumSubjectKey(res.subject);
    const node = ensureNode(classKey, subject);
    node.schoolResources.push(res);
    node.categoryCounts[res.category] += 1;
    if (res.status === 'Approved') {
      node.approvedCount += 1;
    } else {
      node.awaitingApprovalCount += 1;
    }
  }

  const groups: ClassCurriculumGroup[] = [];
  for (const [classKey, subMap] of groupMap.entries()) {
    const subjects = Array.from(subMap.values()).sort((a, b) => {
      if (a.subject === 'All Subjects') return -1;
      if (b.subject === 'All Subjects') return 1;
      return a.subject.localeCompare(b.subject);
    });
    groups.push({
      classKey,
      classOrder: classSortWeight(classKey),
      subjects,
      totalPacks: subjects.reduce((s, n) => s + n.packs.length, 0),
      totalDriveFiles: subjects.reduce((s, n) => s + n.totalDriveFiles, 0),
      totalChapters: subjects.reduce((s, n) => s + n.registerRows.length, 0),
      totalSchoolResources: subjects.reduce((s, n) => s + n.schoolResources.length, 0),
      approvedCount: subjects.reduce((s, n) => s + n.approvedCount, 0),
    });
  }

  return groups.sort((a, b) =>
    a.classOrder !== b.classOrder ? a.classOrder - b.classOrder : a.classKey.localeCompare(b.classKey),
  );
}

export function buildClassWeeklyMatrix(
  timetable: TimetableSlot[],
  classSection: string,
): {
  classSection: string;
  days: readonly string[];
  periods: typeof VIS_PERIOD_TIMINGS;
  grid: Record<string, Record<number, TimetableSlot | null>>;
  totalPeriods: number;
} {
  const grid: Record<string, Record<number, TimetableSlot | null>> = {};
  for (const day of VIS_DAYS) {
    grid[day] = {};
    for (const p of VIS_PERIOD_TIMINGS) {
      grid[day][p.period] = null;
    }
  }
  let totalPeriods = 0;
  for (const slot of timetable) {
    if (slot.classSection.toLowerCase() !== classSection.toLowerCase()) continue;
    if (!grid[slot.day]) grid[slot.day] = {};
    grid[slot.day][slot.period] = slot;
    totalPeriods += 1;
  }
  return {
    classSection,
    days: VIS_DAYS,
    periods: VIS_PERIOD_TIMINGS,
    grid,
    totalPeriods,
  };
}

export function buildTeacherWeeklyMatrix(
  timetable: TimetableSlot[],
  teacherName: string,
): {
  teacherName: string;
  days: readonly string[];
  periods: typeof VIS_PERIOD_TIMINGS;
  grid: Record<string, Record<number, TimetableSlot[]>>;
  totalWeeklyPeriods: number;
  classesTaught: string[];
  subjectsTaught: string[];
} {
  const grid: Record<string, Record<number, TimetableSlot[]>> = {};
  for (const day of VIS_DAYS) {
    grid[day] = {};
    for (const p of VIS_PERIOD_TIMINGS) {
      grid[day][p.period] = [];
    }
  }

  const classSet = new Set<string>();
  const subjectSet = new Set<string>();
  let totalWeeklyPeriods = 0;

  for (const slot of timetable) {
    const matched =
      teacherMatchesSlot(slot.teacherName, teacherName) ||
      (slot.substitutionTeacher ? teacherMatchesSlot(slot.substitutionTeacher, teacherName) : false);
    if (!matched) continue;
    if (!grid[slot.day]) grid[slot.day] = {};
    if (!grid[slot.day][slot.period]) grid[slot.day][slot.period] = [];
    grid[slot.day][slot.period].push(slot);
    classSet.add(slot.classSection);
    subjectSet.add(slot.subject);
    totalWeeklyPeriods += 1;
  }

  return {
    teacherName,
    days: VIS_DAYS,
    periods: VIS_PERIOD_TIMINGS,
    grid,
    totalWeeklyPeriods,
    classesTaught: Array.from(classSet),
    subjectsTaught: Array.from(subjectSet).sort(),
  };
}

export function mapTimetableSlotToCurriculumKey(
  classSection: string,
  subject: string,
): { classKey: string; subjectKey: string } {
  return {
    classKey: normalizeCurriculumClassKey(classSection),
    subjectKey: normalizeCurriculumSubjectKey(subject),
  };
}

export function buildBatchAttendanceRecordId(
  schoolId: string,
  date: string,
  studentId: string,
): string {
  return `att-${schoolId}-${date}-${studentId}`;
}

export function validateBatchAttendanceInput(input: {
  classSection?: string;
  date?: string;
  entries?: BatchAttendanceEntryInput[];
}): { valid: boolean; error?: string } {
  if (!input.classSection?.trim()) {
    return { valid: false, error: 'Class & section selection is required.' };
  }
  if (!input.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date.trim())) {
    return { valid: false, error: 'A valid YYYY-MM-DD attendance date is required.' };
  }
  if (!Array.isArray(input.entries) || input.entries.length === 0) {
    return { valid: false, error: 'At least one student attendance entry is required.' };
  }
  for (const entry of input.entries) {
    if (!entry.studentId?.trim()) {
      return { valid: false, error: 'Each attendance row must specify a valid studentId.' };
    }
    if (entry.status !== 'Present' && entry.status !== 'Absent' && entry.status !== 'Leave') {
      return { valid: false, error: `Invalid attendance status for ${entry.studentId}.` };
    }
  }
  return { valid: true };
}

export function summarizeAttendanceEntries(
  entries: Array<{ status: 'Present' | 'Absent' | 'Leave' }>,
): { total: number; present: number; absent: number; leave: number } {
  let present = 0;
  let absent = 0;
  let leave = 0;
  for (const entry of entries) {
    if (entry.status === 'Present') present += 1;
    else if (entry.status === 'Absent') absent += 1;
    else if (entry.status === 'Leave') leave += 1;
  }
  return { total: entries.length, present, absent, leave };
}

/**
 * Adjusts student attendancePct deterministically across logged school days while
 * keeping historical baseline realistic. Strictly observational — NEVER alters OLQs.
 */
export function computeUpdatedStudentAttendancePct(
  records: AttendanceRecord[],
  studentId: string,
  baselinePct = 94.0,
): number {
  const mine = records.filter((r) => r.studentId === studentId);
  if (mine.length === 0) return baselinePct;
  // Blend historical 24-day baseline with newly logged roster records
  const BASELINE_DAYS = 24;
  const baselinePresent = (baselinePct / 100) * BASELINE_DAYS;
  const loggedPresent = mine.filter((r) => r.status === 'Present').length;
  const totalDays = BASELINE_DAYS + mine.length;
  const pct = ((baselinePresent + loggedPresent) / totalDays) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)) * 10) / 10;
}
