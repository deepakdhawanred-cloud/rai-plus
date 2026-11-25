import type {
  DevelopmentEvidence,
  HomeworkAssignment,
  HomeworkSubmission,
  HomeworkSubmissionStatus,
  StudentRecord,
  TimetableSlot,
  UserRole,
} from '../types';
import { teacherMatchesSlot } from './academicOperationsEngine.ts';

export const HOMEWORK_SUBMISSION_STATUSES: HomeworkSubmissionStatus[] = [
  'Pending',
  'Handed In',
  'Late',
  'Missing',
];

export function isTeacherAuthorizedForHomeworkClass(params: {
  role: UserRole;
  classSection: string;
  visibleClassSections: Set<string>;
}): boolean {
  const { role, classSection, visibleClassSections } = params;
  if (role !== 'teacher') {
    return ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(role);
  }
  const clean = classSection.trim().toLowerCase();
  if (!clean) return false;
  for (const sec of visibleClassSections) {
    if (sec.trim().toLowerCase() === clean) return true;
  }
  return false;
}

export function validateHomeworkCreateInput(input: {
  classSection?: string;
  subject?: string;
  chapter?: string;
  title?: string;
  dueDate?: string;
}): { valid: boolean; error?: string } {
  if (!input.classSection?.trim()) {
    return { valid: false, error: 'Class & Section is required.' };
  }
  if (!input.subject?.trim()) {
    return { valid: false, error: 'Subject is required.' };
  }
  if (!input.title?.trim()) {
    return { valid: false, error: 'Homework title is required.' };
  }
  if (!input.dueDate?.trim()) {
    return { valid: false, error: 'Due date is required.' };
  }
  return { valid: true };
}

export function buildHomeworkSourceKey(assignmentId: string, studentId: string): string {
  return `hw:${assignmentId}:${studentId}`;
}

/**
 * Q4 Invariant:
 * Pending and Cancelled homework NEVER penalise Learning Habits or OLQs (returns null).
 * Only checked/closed submission states ('Handed In', 'Late', 'Missing') produce
 * deterministic evidence keyed by `hw:${assignmentId}:${studentId}`.
 */
export function mapHomeworkSubmissionToEvidence(
  assignment: HomeworkAssignment,
  submission: HomeworkSubmission,
): DevelopmentEvidence | null {
  if (assignment.status === 'Cancelled' || submission.status === 'Pending') {
    return null;
  }

  const sourceKey = buildHomeworkSourceKey(assignment.id, submission.studentId);
  const date = submission.markedAt || assignment.dueDate;

  if (submission.status === 'Handed In') {
    return {
      id: `ev-${sourceKey}`,
      schoolId: assignment.schoolId,
      studentId: submission.studentId,
      sourceKey,
      sourceType: 'homework',
      subject: assignment.subject,
      chapter: assignment.chapter,
      date,
      summary: `${assignment.subject} Homework ("${assignment.title}"): Handed In on schedule`,
      olqContributions: {
        sense_of_responsibility: 88,
        organising_ability: 84,
      },
      componentContributions: {
        learningHabits: 90,
      },
      learningSignals: {
        independentTaskCompletion: 90,
        consistencyOwnership: 88,
      },
      enteredBy: submission.markedBy,
      validated: true,
    };
  }

  if (submission.status === 'Late') {
    return {
      id: `ev-${sourceKey}`,
      schoolId: assignment.schoolId,
      studentId: submission.studentId,
      sourceKey,
      sourceType: 'homework',
      subject: assignment.subject,
      chapter: assignment.chapter,
      date,
      summary: `${assignment.subject} Homework ("${assignment.title}"): Submitted after due date`,
      olqContributions: {
        sense_of_responsibility: 68,
        determination: 72,
      },
      componentContributions: {
        learningHabits: 70,
      },
      learningSignals: {
        independentTaskCompletion: 74,
        consistencyOwnership: 66,
      },
      enteredBy: submission.markedBy,
      validated: true,
    };
  }

  // 'Missing' — never assigns zero; flags constructive learning habit follow-up
  return {
    id: `ev-${sourceKey}`,
    schoolId: assignment.schoolId,
    studentId: submission.studentId,
    sourceKey,
    sourceType: 'homework',
    subject: assignment.subject,
    chapter: assignment.chapter,
    date,
    summary: `${assignment.subject} Homework ("${assignment.title}"): Missing (Not Complete — follow-up planned)`,
    olqContributions: {
      sense_of_responsibility: 50,
    },
    componentContributions: {
      learningHabits: 48,
    },
    learningSignals: {
      consistencyOwnership: 46,
    },
    enteredBy: submission.markedBy,
    validated: true,
  };
}

export function filterHomeworkForStudents(
  assignments: HomeworkAssignment[],
  submissions: HomeworkSubmission[],
  students: StudentRecord[],
): Array<{
  assignment: HomeworkAssignment;
  student: StudentRecord;
  submission: HomeworkSubmission | null;
}> {
  const rows: Array<{
    assignment: HomeworkAssignment;
    student: StudentRecord;
    submission: HomeworkSubmission | null;
  }> = [];

  for (const assignment of assignments) {
    for (const student of students) {
      if (
        student.schoolId === assignment.schoolId &&
        student.classSection === assignment.classSection
      ) {
        const sub =
          submissions.find(
            (s) => s.assignmentId === assignment.id && s.studentId === student.id,
          ) || null;
        rows.push({ assignment, student, submission: sub });
      }
    }
  }
  return rows;
}

export interface StudentDailyHomeworkRow {
  assignment: HomeworkAssignment;
  submission: HomeworkSubmission | null;
  effectiveStatus: HomeworkSubmissionStatus | 'Cancelled';
  isAssignedToday: boolean;
  isDueTodayOrUpcoming: boolean;
}

export interface StudentDailyHomeworkSummary {
  rows: StudentDailyHomeworkRow[];
  activeCount: number;
  todayCount: number;
  pendingCount: number;
  handedInCount: number;
  attentionCount: number;
}

export function sortStudentHomeworkRows(params: {
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  studentId: string;
  classSection: string;
  todayIso: string;
}): StudentDailyHomeworkSummary {
  const { assignments, submissions, studentId, classSection, todayIso } = params;
  const subByAsg = new Map<string, HomeworkSubmission>();
  for (const sub of submissions) {
    if (sub.studentId === studentId) {
      subByAsg.set(sub.assignmentId, sub);
    }
  }

  const rows: StudentDailyHomeworkRow[] = assignments
    .filter((hw) => hw.classSection.trim().toLowerCase() === classSection.trim().toLowerCase())
    .map((assignment) => {
      const submission = subByAsg.get(assignment.id) || null;
      const effectiveStatus: HomeworkSubmissionStatus | 'Cancelled' =
        assignment.status === 'Cancelled' ? 'Cancelled' : submission?.status || 'Pending';
      return {
        assignment,
        submission,
        effectiveStatus,
        isAssignedToday: assignment.assignedDate === todayIso && assignment.status === 'Active',
        isDueTodayOrUpcoming: assignment.status === 'Active' && assignment.dueDate >= todayIso,
      };
    })
    .sort((a, b) => {
      if (a.assignment.status !== b.assignment.status) {
        return a.assignment.status === 'Active' ? -1 : 1;
      }
      if (a.isAssignedToday !== b.isAssignedToday) {
        return a.isAssignedToday ? -1 : 1;
      }
      const assignedCmp = b.assignment.assignedDate.localeCompare(a.assignment.assignedDate);
      if (assignedCmp !== 0) return assignedCmp;
      return a.assignment.dueDate.localeCompare(b.assignment.dueDate);
    });

  let activeCount = 0;
  let todayCount = 0;
  let pendingCount = 0;
  let handedInCount = 0;
  let attentionCount = 0;

  for (const r of rows) {
    if (r.assignment.status === 'Cancelled') continue;
    activeCount += 1;
    if (r.isAssignedToday) todayCount += 1;
    if (r.effectiveStatus === 'Pending') pendingCount += 1;
    else if (r.effectiveStatus === 'Handed In') handedInCount += 1;
    else if (r.effectiveStatus === 'Missing' || r.effectiveStatus === 'Late') attentionCount += 1;
  }

  return {
    rows,
    activeCount,
    todayCount,
    pendingCount,
    handedInCount,
    attentionCount,
  };
}

export function extractDefaultSubject(
  subjectSpecialty?: string | null,
  fallback = 'Mathematics',
): string {
  if (!subjectSpecialty || !subjectSpecialty.trim()) return fallback;
  const primarySegment = subjectSpecialty.split(',')[0] || '';
  const clean = primarySegment.replace(/\([^)]*\)/g, '').trim();
  return clean || fallback;
}

export interface TeacherClassProfileTarget {
  classSection: string;
  studentCount: number;
  subjectsTaught: string[];
  isClassTeacher: boolean;
  sampleStudentId: string | null;
  sampleStudentName: string | null;
}

function classSortOrder(classSection: string): number {
  const clean = classSection.trim().toUpperCase();
  if (clean.startsWith('NURSERY')) return 0;
  if (clean.startsWith('LKG')) return 1;
  if (clean.startsWith('UKG')) return 2;
  const m = clean.match(/^(\d+)/);
  return m ? 10 + Number(m[1]) : 99;
}

export function buildTeacherClassTargets(params: {
  students: StudentRecord[];
  timetable: TimetableSlot[];
  userName: string;
  classTeacherOf?: string | null;
  defaultSubject?: string;
}): TeacherClassProfileTarget[] {
  const { students, timetable, userName, classTeacherOf, defaultSubject } = params;
  const byClass = new Map<string, StudentRecord[]>();
  for (const st of students) {
    const list = byClass.get(st.classSection) || [];
    list.push(st);
    byClass.set(st.classSection, list);
  }

  const subjectsByClass = new Map<string, Set<string>>();
  for (const slot of timetable) {
    const matchesTeacher =
      teacherMatchesSlot(slot.teacherName, userName) ||
      (slot.substitutionTeacher ? teacherMatchesSlot(slot.substitutionTeacher, userName) : false);
    if (!matchesTeacher) continue;
    const set = subjectsByClass.get(slot.classSection) || new Set<string>();
    if (slot.subject.trim()) set.add(slot.subject.trim());
    subjectsByClass.set(slot.classSection, set);
  }

  const normalizedHomeroom = classTeacherOf?.trim().toLowerCase() || '';
  const targets: TeacherClassProfileTarget[] = [];

  for (const [classSection, classStudents] of byClass.entries()) {
    const isClassTeacher =
      Boolean(normalizedHomeroom) && classSection.trim().toLowerCase() === normalizedHomeroom;
    const slotSubjects = Array.from(subjectsByClass.get(classSection) || []);
    const subjectsTaught =
      slotSubjects.length > 0
        ? slotSubjects
        : defaultSubject
          ? [defaultSubject]
          : [];
    const sortedStudents = [...classStudents].sort((a, b) => a.name.localeCompare(b.name));
    targets.push({
      classSection,
      studentCount: classStudents.length,
      subjectsTaught,
      isClassTeacher,
      sampleStudentId: sortedStudents[0]?.id ?? null,
      sampleStudentName: sortedStudents[0]?.name ?? null,
    });
  }

  return targets.sort((a, b) => {
    if (a.isClassTeacher !== b.isClassTeacher) return a.isClassTeacher ? -1 : 1;
    const ordDiff = classSortOrder(a.classSection) - classSortOrder(b.classSection);
    if (ordDiff !== 0) return ordDiff;
    return a.classSection.localeCompare(b.classSection);
  });
}

export function validateHomeworkModalDraft(input: {
  selectedClasses: string[];
  subject?: string;
  title?: string;
  dueDate?: string;
}): { valid: boolean; error?: string } {
  if (!input.selectedClasses || input.selectedClasses.length === 0) {
    return { valid: false, error: 'Select at least one Class Profile to push homework.' };
  }
  return validateHomeworkCreateInput({
    classSection: input.selectedClasses[0],
    subject: input.subject,
    title: input.title,
    dueDate: input.dueDate,
  });
}

export interface TeacherRecentHomeworkRow {
  assignment: HomeworkAssignment;
  totalStudents: number;
  pendingCount: number;
  handedInCount: number;
  isToday: boolean;
}

export function summarizeTeacherRecentHomework(params: {
  assignments: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  todayIso: string;
}): TeacherRecentHomeworkRow[] {
  const { assignments, submissions, todayIso } = params;
  const subByAsg = new Map<string, HomeworkSubmission[]>();
  for (const s of submissions) {
    const list = subByAsg.get(s.assignmentId) || [];
    list.push(s);
    subByAsg.set(s.assignmentId, list);
  }

  return [...assignments]
    .filter((a) => a.status === 'Active')
    .sort((a, b) => {
      const aToday = a.assignedDate === todayIso ? 1 : 0;
      const bToday = b.assignedDate === todayIso ? 1 : 0;
      if (aToday !== bToday) return bToday - aToday;
      const dateCmp = b.assignedDate.localeCompare(a.assignedDate);
      if (dateCmp !== 0) return dateCmp;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    })
    .map((assignment) => {
      const subs = subByAsg.get(assignment.id) || [];
      let pendingCount = 0;
      let handedInCount = 0;
      for (const s of subs) {
        if (s.status === 'Pending') pendingCount += 1;
        else if (s.status === 'Handed In') handedInCount += 1;
      }
      return {
        assignment,
        totalStudents: subs.length,
        pendingCount,
        handedInCount,
        isToday: assignment.assignedDate === todayIso,
      };
    });
}


