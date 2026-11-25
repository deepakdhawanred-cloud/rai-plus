import type {
  AcademicResource,
  AuditLogEntry,
  ClassGrowthLeaderboard,
  DevelopmentReviewItem,
  LessonPlan,
  ProductionRegisterRow,
  RankedStudentEntry,
  SchoolGrowthLeaderboards,
  SchoolRankingsSummary,
  StudentRecord,
  TimetableSlot,
  UserAccount,
  UserRole,
  ViratResourcePack,
  VisReportCatalogItem,
} from '../types';
import {
  mapTimetableSlotToCurriculumKey,
  normalizeCurriculumClassKey,
  normalizeCurriculumSubjectKey,
  teacherMatchesSlot,
} from './academicOperationsEngine.ts';

export interface TeacherTeachingScope {
  teacherName: string;
  authorizedClassSections: Set<string>;
  authorizedClassKeys: Set<string>;
  /** Map of normalized Class Key (e.g. "Class 10") -> Set of normalized Subject Keys */
  subjectPairs: Map<string, Set<string>>;
  assignedSubjectsLabel: string[];
  matchedSlotCount: number;
}

const KNOWN_SUBJECTS_FOR_SPECIALTY: Array<{ regex: RegExp; subject: string }> = [
  { regex: /\bmath(?:ematics|s)?\b/i, subject: 'Mathematics' },
  { regex: /\bphysics\b/i, subject: 'Physics' },
  { regex: /\bchemistry\b/i, subject: 'Chemistry' },
  { regex: /\bbiology\b/i, subject: 'Biology' },
  { regex: /\bsocial\s*science\b|\bsst\b/i, subject: 'Social Science' },
  { regex: /\bpolitical\s*science\b/i, subject: 'Political Science' },
  { regex: /\bgeography\b/i, subject: 'Geography' },
  { regex: /\bpsychology\b/i, subject: 'Psychology' },
  { regex: /\beconomics\b/i, subject: 'Economics' },
  { regex: /\baccount(?:ancy|s)\b/i, subject: 'Accountancy' },
  { regex: /\bbusiness\s*studies\b/i, subject: 'Business Studies' },
  { regex: /\bphysical\s*education\b|\bphy\.?\s*ed/i, subject: 'Physical Education' },
  { regex: /\benglish\b/i, subject: 'English' },
  { regex: /\bhindi\b/i, subject: 'Hindi' },
  { regex: /\bsanskrit\b/i, subject: 'Sanskrit' },
  { regex: /\bcomputer\b/i, subject: 'Computer Literacy' },
  { regex: /\bscience\b/i, subject: 'Science' },
];

export function expandTimetableSubjectsForCurriculum(
  classSection: string,
  rawSubject: string,
): string[] {
  const clean = rawSubject.trim();
  const lower = clean.toLowerCase();
  const classNum = Number(classSection.match(/^(\d+)/)?.[1] ?? 0);

  if (lower.includes('science & social science') || lower.includes('science and social science')) {
    return ['Science', 'Social Science'];
  }
  if (lower.includes('accounts & business studies') || lower.includes('accountancy & business')) {
    return ['Accountancy', 'Business Studies'];
  }
  if (lower === 'computer') {
    return ['Computer Literacy'];
  }
  if (lower === 'cbse') {
    return ['Hindi'];
  }
  if (lower === 'physics' && classNum >= 6 && classNum <= 10) {
    return ['Physics', 'Science'];
  }
  if (lower === 'chemistry' && classNum >= 6 && classNum <= 10) {
    return ['Chemistry', 'Science'];
  }
  if (lower === 'biology' && classNum >= 6 && classNum <= 10) {
    return ['Biology', 'Science'];
  }
  if (lower === 'sainik') {
    return ['Sainik'];
  }
  return [normalizeCurriculumSubjectKey(clean)];
}

function addPair(map: Map<string, Set<string>>, classKey: string, subjectKey: string) {
  if (!map.has(classKey)) map.set(classKey, new Set());
  map.get(classKey)!.add(subjectKey);
}

function parseSpecialtyFallback(user: UserAccount): {
  classKeys: string[];
  classSections: string[];
  subjects: string[];
} {
  const raw = user.subjectSpecialty || '';
  const classKeys = new Set<string>();
  const classSections = new Set<string>();
  const subjects = new Set<string>();

  for (const item of KNOWN_SUBJECTS_FOR_SPECIALTY) {
    if (item.regex.test(raw)) {
      if (item.subject === 'Science' && /\bsocial\s*science\b/i.test(raw)) {
        // Avoid adding 'Science' solely because 'Social Science' matched unless standalone Science appears
        const withoutSocial = raw.replace(/\bsocial\s*science\b/gi, '');
        if (/\bscience\b/i.test(withoutSocial)) subjects.add('Science');
      } else {
        subjects.add(item.subject);
      }
    }
  }

  // Parse explicit sections like "9-A", "10-B", "11-Science"
  const explicitSecMatches = raw.matchAll(/\b(\d{1,2}-[A-Za-z]+)\b/g);
  for (const m of explicitSecMatches) {
    classSections.add(m[1]);
    classKeys.add(normalizeCurriculumClassKey(m[1]));
  }

  // Parse ranges like "Classes 6–10" or "6-10"
  const rangeMatches = raw.matchAll(/(?:classes?\s*)?(\d{1,2})\s*[–-]\s*(\d{1,2})/gi);
  for (const m of rangeMatches) {
    const start = Number(m[1]);
    const end = Number(m[2]);
    if (start >= 1 && end >= start && end <= 12) {
      for (let c = start; c <= end; c++) {
        classKeys.add(`Class ${c}`);
        classSections.add(`${c}-A`);
      }
    }
  }

  // Parse standalone class numbers like "Class 9 & 10"
  const numMatches = raw.matchAll(/(?:class(?:es)?\s*|[&\s,])(\d{1,2})(?=\b)/gi);
  for (const m of numMatches) {
    const c = Number(m[1]);
    if (c >= 1 && c <= 12) {
      classKeys.add(`Class ${c}`);
      classSections.add(`${c}-A`);
    }
  }

  if (user.classTeacherOf) {
    classSections.add(user.classTeacherOf);
    classKeys.add(normalizeCurriculumClassKey(user.classTeacherOf));
  }

  return {
    classKeys: Array.from(classKeys),
    classSections: Array.from(classSections),
    subjects: Array.from(subjects),
  };
}

/**
 * Computes exact per-teacher teaching assignments from school timetable slots
 * (plus specialty fallback when a partner tenant has no dedicated slot entries).
 */
export function computeTeacherTeachingScope(
  user: UserAccount,
  schoolTimetable: TimetableSlot[],
): TeacherTeachingScope {
  const authorizedClassSections = new Set<string>();
  const authorizedClassKeys = new Set<string>();
  const subjectPairs = new Map<string, Set<string>>();
  const subjectNames = new Set<string>();

  if (user.classTeacherOf) {
    authorizedClassSections.add(user.classTeacherOf);
    authorizedClassKeys.add(normalizeCurriculumClassKey(user.classTeacherOf));
  }

  let matchedSlotCount = 0;
  for (const slot of schoolTimetable) {
    const teaches =
      teacherMatchesSlot(slot.teacherName, user.name) ||
      (slot.substitutionTeacher ? teacherMatchesSlot(slot.substitutionTeacher, user.name) : false);
    if (!teaches) continue;

    matchedSlotCount += 1;
    authorizedClassSections.add(slot.classSection);
    const classKey = normalizeCurriculumClassKey(slot.classSection);
    authorizedClassKeys.add(classKey);

    const mapped = mapTimetableSlotToCurriculumKey(slot.classSection, slot.subject);
    addPair(subjectPairs, mapped.classKey, mapped.subjectKey);
    subjectNames.add(mapped.subjectKey);

    for (const sub of expandTimetableSubjectsForCurriculum(slot.classSection, slot.subject)) {
      addPair(subjectPairs, classKey, sub);
      subjectNames.add(sub);
    }
  }

  if (matchedSlotCount === 0 && user.role === 'teacher') {
    const fallback = parseSpecialtyFallback(user);
    for (const sec of fallback.classSections) authorizedClassSections.add(sec);
    for (const ck of fallback.classKeys) {
      authorizedClassKeys.add(ck);
      for (const sub of fallback.subjects) {
        addPair(subjectPairs, ck, sub);
        subjectNames.add(sub);
      }
    }
  }

  return {
    teacherName: user.name,
    authorizedClassSections,
    authorizedClassKeys,
    subjectPairs,
    assignedSubjectsLabel: Array.from(subjectNames).sort(),
    matchedSlotCount,
  };
}

export function canTeacherAccessSubjectResource(
  scope: TeacherTeachingScope,
  rawClassSectionOrLabel: string,
  rawSubject: string,
): boolean {
  const classKey = normalizeCurriculumClassKey(rawClassSectionOrLabel);
  const subjectKey = normalizeCurriculumSubjectKey(rawSubject);

  // Institutional school-wide handbooks ("All Subjects" across classes) remain readable only if general school-wide
  if (classKey === 'School-Wide' && subjectKey === 'All Subjects') {
    return true;
  }

  const allowedSubjects = scope.subjectPairs.get(classKey);
  if (!allowedSubjects || allowedSubjects.size === 0) {
    return false;
  }

  return allowedSubjects.has(subjectKey);
}

export function filterResourcePacksForRole(
  role: UserRole,
  packs: ViratResourcePack[],
  teacherScope?: TeacherTeachingScope | null,
): ViratResourcePack[] {
  if (
    role === 'parent' ||
    role === 'student' ||
    role === 'counsellor' ||
    role === 'accountant' ||
    role === 'transport_incharge'
  ) {
    return [];
  }
  if (role === 'teacher' && teacherScope) {
    return packs.filter((p) =>
      canTeacherAccessSubjectResource(teacherScope, p.className, p.subject),
    );
  }
  return packs;
}

export function filterProductionRegisterForRole(
  role: UserRole,
  rows: ProductionRegisterRow[],
  teacherScope?: TeacherTeachingScope | null,
): ProductionRegisterRow[] {
  if (
    role === 'parent' ||
    role === 'student' ||
    role === 'counsellor' ||
    role === 'accountant' ||
    role === 'transport_incharge'
  ) {
    return [];
  }
  if (role === 'teacher' && teacherScope) {
    return rows.filter((row) =>
      canTeacherAccessSubjectResource(teacherScope, row.classLabel, row.subject),
    );
  }
  return rows;
}

export function filterSchoolResourcesForRole(params: {
  role: UserRole;
  userName: string;
  resources: AcademicResource[];
  visibleClassSections: Set<string>;
  teacherScope?: TeacherTeachingScope | null;
}): AcademicResource[] {
  const { role, userName, resources, visibleClassSections, teacherScope } = params;

  if (role === 'counsellor' || role === 'accountant' || role === 'transport_incharge') return [];

  if (role === 'parent' || role === 'student') {
    const visibleClassKeys = new Set(
      Array.from(visibleClassSections).map((c) => normalizeCurriculumClassKey(c)),
    );
    return resources.filter((r) => {
      if (r.status !== 'Approved') return false;
      if (r.pushedToStudents !== true) return false;
      const ck = normalizeCurriculumClassKey(r.classSection);
      return visibleClassSections.has(r.classSection) || visibleClassKeys.has(ck);
    });
  }

  if (role === 'teacher' && teacherScope) {
    return resources.filter(
      (r) =>
        canTeacherAccessSubjectResource(teacherScope, r.classSection, r.subject) ||
        r.createdBy === userName,
    );
  }

  return resources;
}

export function filterLessonPlansForRole(params: {
  role: UserRole;
  userName: string;
  lessonPlans: LessonPlan[];
  teacherScope?: TeacherTeachingScope | null;
}): LessonPlan[] {
  const { role, userName, lessonPlans, teacherScope } = params;
  if (
    role === 'parent' ||
    role === 'student' ||
    role === 'counsellor' ||
    role === 'accountant' ||
    role === 'transport_incharge'
  ) {
    return [];
  }
  if (role === 'teacher' && teacherScope) {
    return lessonPlans.filter(
      (lp) =>
        canTeacherAccessSubjectResource(teacherScope, lp.classSection, lp.subject) ||
        teacherMatchesSlot(lp.teacherName, userName),
    );
  }
  return lessonPlans;
}

export function filterTimetableForRole(params: {
  user: UserAccount;
  schoolTimetable: TimetableSlot[];
  visibleClassSections: Set<string>;
}): TimetableSlot[] {
  const { user, schoolTimetable, visibleClassSections } = params;

  if (user.role === 'counsellor' || user.role === 'accountant' || user.role === 'transport_incharge') {
    return [];
  }

  if (user.role === 'parent' || user.role === 'student') {
    const normalizedTargets = new Set(
      Array.from(visibleClassSections).map((s) => s.trim().toLowerCase()),
    );
    return schoolTimetable.filter((slot) =>
      normalizedTargets.has(slot.classSection.trim().toLowerCase()),
    );
  }

  if (user.role === 'teacher') {
    return schoolTimetable.filter(
      (slot) =>
        teacherMatchesSlot(slot.teacherName, user.name) ||
        (slot.substitutionTeacher
          ? teacherMatchesSlot(slot.substitutionTeacher, user.name)
          : false) ||
        (user.classTeacherOf
          ? slot.classSection.toLowerCase() === user.classTeacherOf.toLowerCase()
          : false),
    );
  }

  return schoolTimetable;
}

export function filterStudentsForRole(params: {
  user: UserAccount;
  schoolStudents: StudentRecord[];
  teacherScope?: TeacherTeachingScope | null;
}): StudentRecord[] {
  const { user, schoolStudents, teacherScope } = params;

  if (user.role === 'parent' || user.role === 'student') {
    const linkedIds = new Set(user.linkedStudentIds ?? []);
    return schoolStudents.filter((s) => linkedIds.has(s.id));
  }

  if (user.role === 'teacher' && teacherScope) {
    if (teacherScope.authorizedClassSections.size === 0 && teacherScope.authorizedClassKeys.size === 0) {
      return [];
    }
    return schoolStudents.filter(
      (s) =>
        teacherScope.authorizedClassSections.has(s.classSection) ||
        teacherScope.authorizedClassKeys.has(normalizeCurriculumClassKey(s.classSection)),
    );
  }

  return schoolStudents;
}

export function sanitizeStudentForRole(student: StudentRecord, role: UserRole): StudentRecord {
  if (role === 'parent') {
    return {
      ...student,
      confidentialCounsellorNote: '',
    };
  }
  if (role === 'student') {
    return {
      ...student,
      confidentialCounsellorNote: '',
      feeBalanceInr: 0,
      totalFeeAnnualInr: 0,
    };
  }
  if (role === 'teacher') {
    return {
      ...student,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 0,
    };
  }
  if (role === 'counsellor') {
    return {
      ...student,
      feeBalanceInr: 0,
      totalFeeAnnualInr: 0,
    };
  }
  if (role === 'accountant') {
    return {
      ...student,
      confidentialCounsellorNote: '',
    };
  }
  if (role === 'transport_incharge') {
    return {
      ...student,
      confidentialCounsellorNote: '',
      feeBalanceInr: 0,
      totalFeeAnnualInr: 0,
    };
  }
  return student;
}

function anonymizeRankEntries(
  entries: RankedStudentEntry[],
  visibleStudentIds: Set<string>,
  prefix: string,
): RankedStudentEntry[] {
  return entries.map((entry) =>
    visibleStudentIds.has(entry.studentId)
      ? entry
      : {
          ...entry,
          studentId: `peer-${entry.classSection}-${entry.rank}`,
          studentName: `${prefix} #${entry.rank}`,
        },
  );
}

export function filterRankingsForRole(params: {
  role: UserRole;
  fullRankings: SchoolRankingsSummary;
  visibleStudentIds: Set<string>;
  visibleClassSections: Set<string>;
}): SchoolRankingsSummary {
  const { role, fullRankings, visibleStudentIds, visibleClassSections } = params;

  if (role === 'parent' || role === 'student') {
    const scopedClassTop3: Record<string, RankedStudentEntry[]> = {};
    const scopedClassTotals: Record<string, { total: number; ranked: number }> = {};

    for (const sec of visibleClassSections) {
      if (fullRankings.classTop3BySection[sec]) {
        scopedClassTop3[sec] = anonymizeRankEntries(
          fullRankings.classTop3BySection[sec],
          visibleStudentIds,
          `Class ${sec} Peer`,
        );
      }
      if (fullRankings.classTotalsBySection[sec]) {
        scopedClassTotals[sec] = fullRankings.classTotalsBySection[sec];
      }
    }

    const scopedStandings: SchoolRankingsSummary['studentStandings'] = {};
    for (const [sid, standing] of Object.entries(fullRankings.studentStandings)) {
      if (!visibleStudentIds.has(sid)) continue;
      scopedStandings[sid] = {
        ...standing,
        classTarget: {
          ...standing.classTarget,
          cutoffStudentName: null,
        },
        schoolTarget: {
          ...standing.schoolTarget,
          cutoffStudentName: null,
        },
      };
    }

    return {
      schoolTop3: anonymizeRankEntries(
        fullRankings.schoolTop3,
        visibleStudentIds,
        'School Peer',
      ),
      classTop3BySection: scopedClassTop3,
      classTotalsBySection: scopedClassTotals,
      schoolTotals: fullRankings.schoolTotals,
      studentStandings: scopedStandings,
    };
  }

  if (role === 'teacher') {
    const scopedClassTop3: Record<string, RankedStudentEntry[]> = {};
    const scopedClassTotals: Record<string, { total: number; ranked: number }> = {};
    for (const sec of Object.keys(fullRankings.classTop3BySection)) {
      if (visibleClassSections.has(sec)) {
        scopedClassTop3[sec] = fullRankings.classTop3BySection[sec];
        scopedClassTotals[sec] = fullRankings.classTotalsBySection[sec];
      }
    }
    const scopedStandings = Object.fromEntries(
      Object.entries(fullRankings.studentStandings).filter(([id]) => visibleStudentIds.has(id)),
    );
    return {
      ...fullRankings,
      classTop3BySection: scopedClassTop3,
      classTotalsBySection: scopedClassTotals,
      studentStandings: scopedStandings,
    };
  }

  return fullRankings;
}

export function filterAuditLogsForRole(
  role: UserRole,
  logs: AuditLogEntry[],
  schoolId: string | null,
): AuditLogEntry[] {
  if (role === 'super_admin') return logs;
  if (role === 'school_admin' || role === 'principal' || role === 'coordinator') {
    return logs.filter((l) => l.schoolId === schoolId);
  }
  return [];
}

export function filterDevelopmentReviewsForRole(
  role: UserRole,
  reviews: DevelopmentReviewItem[],
  visibleStudentIds: Set<string>,
): DevelopmentReviewItem[] {
  if (
    role === 'parent' ||
    role === 'student' ||
    role === 'counsellor' ||
    role === 'accountant' ||
    role === 'transport_incharge'
  ) {
    return [];
  }
  if (role === 'teacher') {
    return reviews.filter((r) => visibleStudentIds.has(r.studentId));
  }
  return reviews;
}

export function filterVisReportsCatalogForRole(params: {
  role: UserRole;
  catalog: VisReportCatalogItem[];
  visibleStudents: StudentRecord[];
  teacherScope?: TeacherTeachingScope | null;
}): VisReportCatalogItem[] {
  const { role, catalog, visibleStudents, teacherScope } = params;
  if (role === 'parent' || role === 'student') {
    const fileIds = new Set(visibleStudents.map((s) => s.visReportFileId).filter(Boolean));
    return catalog.filter((item) => fileIds.has(item.fileId));
  }
  if (role === 'teacher' && teacherScope) {
    return catalog.filter((item) =>
      teacherScope.authorizedClassKeys.has(normalizeCurriculumClassKey(item.normalizedClass)),
    );
  }
  return catalog;
}

/**
 * Strictly scopes student-level telemetry (reading reports, numeracy reports, monthly attendance)
 * so parents/students only see linked children, teachers only see students in their classes,
 * and counsellors do not receive attendance records.
 */
export function filterStudentTelemetryForRole<T extends { schoolId: string; studentId: string }>(
  role: UserRole,
  records: T[],
  schoolId: string,
  visibleStudentIds: Set<string>,
  opts?: { hideFromCounsellor?: boolean },
): T[] {
  if (opts?.hideFromCounsellor && role === 'counsellor') {
    return [];
  }
  return records.filter(
    (rec) => rec.schoolId === schoolId && visibleStudentIds.has(rec.studentId),
  );
}

/**
 * Enforces strict class-level anonymization for Students and Parents:
 * - Only visible classes are returned
 * - Peer classmates receive opaque synthetic IDs and anonymized handles (e.g. "Class 9-A Learner #2")
 * - realStudentName is stripped on the wire for non-staff roles
 * - Counsellors receive an empty leaderboard
 */
export function filterClassGrowthLeaderboardsForRole(params: {
  role: UserRole;
  fullLeaderboards: SchoolGrowthLeaderboards;
  visibleStudentIds: Set<string>;
  visibleClassSections: Set<string>;
}): SchoolGrowthLeaderboards {
  const { role, fullLeaderboards, visibleStudentIds, visibleClassSections } = params;

  if (role === 'counsellor' || role === 'accountant' || role === 'transport_incharge') {
    return {
      schoolCode: fullLeaderboards.schoolCode,
      classSections: [],
      classLeaderboards: {},
    };
  }

  const scopedBoards: Record<string, ClassGrowthLeaderboard> = {};
  const scopedSections: string[] = [];

  for (const sec of fullLeaderboards.classSections) {
    const board = fullLeaderboards.classLeaderboards[sec];
    if (!board) continue;

    if (role === 'teacher' && !visibleClassSections.has(sec)) {
      continue;
    }
    if ((role === 'parent' || role === 'student') && !visibleClassSections.has(sec)) {
      continue;
    }

    scopedSections.push(sec);

    if (role === 'parent' || role === 'student') {
      scopedBoards[sec] = {
        classSection: sec,
        benchmarks: board.benchmarks,
        entries: board.entries.map((entry, idx) => {
          const isSelf = visibleStudentIds.has(entry.studentId);
          if (isSelf) {
            return {
              ...entry,
              displayName: entry.realStudentName || entry.displayName,
              realStudentName: undefined,
              isCurrentUser: true,
            };
          }
          return {
            ...entry,
            studentId: `anon-${sec}-${entry.combinedRank ?? 'u'}-${idx + 1}`,
            displayName: entry.aliasLabel,
            realStudentName: undefined,
            isCurrentUser: false,
          };
        }),
      };
    } else {
      scopedBoards[sec] = board;
    }
  }

  return {
    schoolCode: fullLeaderboards.schoolCode,
    classSections: scopedSections,
    classLeaderboards: scopedBoards,
  };
}

