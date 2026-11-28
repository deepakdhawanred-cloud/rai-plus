import type {
  AcademicVisitQuarter,
  EnrolledHomeVisitOutcome,
  HomeVisitRecord,
  StudentRecord,
} from '../types';

export interface AcademicVisitQuarterMeta {
  quarter: AcademicVisitQuarter;
  label: string;
  months: string;
  order: number;
}

export const ACADEMIC_VISIT_QUARTERS: AcademicVisitQuarterMeta[] = [
  { quarter: 'Q1', label: 'Visit 1 (Q1)', months: 'Apr – Jun', order: 1 },
  { quarter: 'Q2', label: 'Visit 2 (Q2)', months: 'Jul – Sep', order: 2 },
  { quarter: 'Q3', label: 'Visit 3 (Q3)', months: 'Oct – Dec', order: 3 },
  { quarter: 'Q4', label: 'Visit 4 (Q4)', months: 'Jan – Mar', order: 4 },
];

export const ANNUAL_ENROLLED_VISIT_TARGET = 4;

export const ENROLLED_VISIT_OUTCOMES: EnrolledHomeVisitOutcome[] = [
  'Thriving & On Track',
  'Needs Academic Follow-up',
  'Parent Support Requested',
  'Wellbeing / Counsellor Referral',
];

export function isEnrolledStudentVisit(visit: HomeVisitRecord): boolean {
  return visit.visitCategory === 'enrolled_student' || Boolean(visit.studentId);
}

export function isAdmissionCrmVisit(visit: HomeVisitRecord): boolean {
  return !isEnrolledStudentVisit(visit);
}

export function splitHomeVisitsByType(visits: HomeVisitRecord[]): {
  admissionCrmVisits: HomeVisitRecord[];
  enrolledStudentVisits: HomeVisitRecord[];
} {
  const admissionCrmVisits: HomeVisitRecord[] = [];
  const enrolledStudentVisits: HomeVisitRecord[] = [];
  for (const v of visits) {
    if (isEnrolledStudentVisit(v)) {
      enrolledStudentVisits.push(v);
    } else {
      admissionCrmVisits.push(v);
    }
  }
  return { admissionCrmVisits, enrolledStudentVisits };
}

export function inferQuarterFromDate(dateIso?: string): AcademicVisitQuarter {
  const month = Number(String(dateIso || '').slice(5, 7));
  if (month >= 4 && month <= 6) return 'Q1';
  if (month >= 7 && month <= 9) return 'Q2';
  if (month >= 10 && month <= 12) return 'Q3';
  return 'Q4';
}

export interface StudentQuarterlyVisitRow {
  studentId: string;
  admissionNo: string;
  studentName: string;
  classSection: string;
  guardianName: string;
  guardianPhone: string;
  quarters: Record<AcademicVisitQuarter, HomeVisitRecord | null>;
  completedCount: number;
  scheduledCount: number;
  targetCount: number;
  completionPct: number;
  nextDueQuarter: AcademicVisitQuarter | null;
  latestVisit: HomeVisitRecord | null;
}

export interface EnrolledHomeVisitSummary {
  totalStudents: number;
  totalTargetVisits: number;
  completedVisitsCount: number;
  scheduledVisitsCount: number;
  fullyCompletedStudentsCount: number;
  studentsNeedingVisitCount: number;
  overallCompliancePct: number;
  byQuarterCompleted: Record<AcademicVisitQuarter, number>;
  rows: StudentQuarterlyVisitRow[];
}

export function buildEnrolledStudentQuarterlyMatrix(
  students: StudentRecord[],
  allVisits: HomeVisitRecord[],
  academicSession = '2026-27',
): EnrolledHomeVisitSummary {
  const { enrolledStudentVisits } = splitHomeVisitsByType(allVisits);
  const sessionVisits = enrolledStudentVisits.filter(
    (v) => !v.academicSession || v.academicSession === academicSession,
  );

  const byStudent = new Map<string, HomeVisitRecord[]>();
  for (const v of sessionVisits) {
    if (!v.studentId) continue;
    const list = byStudent.get(v.studentId) || [];
    list.push(v);
    byStudent.set(v.studentId, list);
  }

  let completedVisitsCount = 0;
  let scheduledVisitsCount = 0;
  let fullyCompletedStudentsCount = 0;
  let studentsNeedingVisitCount = 0;
  const byQuarterCompleted: Record<AcademicVisitQuarter, number> = {
    Q1: 0,
    Q2: 0,
    Q3: 0,
    Q4: 0,
  };

  const rows: StudentQuarterlyVisitRow[] = students.map((stu) => {
    const stuVisits = (byStudent.get(stu.id) || [])
      .slice()
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

    const quarters: Record<AcademicVisitQuarter, HomeVisitRecord | null> = {
      Q1: null,
      Q2: null,
      Q3: null,
      Q4: null,
    };

    for (const v of stuVisits) {
      if (v.status === 'Cancelled') continue;
      const q = v.academicQuarter || inferQuarterFromDate(v.visitDate);
      // Prefer Completed visit for that quarter if multiple records exist
      if (!quarters[q] || (quarters[q]!.status !== 'Completed' && v.status === 'Completed')) {
        quarters[q] = v;
      }
    }

    let completed = 0;
    let scheduled = 0;
    let nextDueQuarter: AcademicVisitQuarter | null = null;

    for (const meta of ACADEMIC_VISIT_QUARTERS) {
      const rec = quarters[meta.quarter];
      if (rec?.status === 'Completed') {
        completed += 1;
        byQuarterCompleted[meta.quarter] += 1;
      } else {
        if (rec && (rec.status === 'Scheduled' || rec.status === 'Rescheduled')) {
          scheduled += 1;
        }
        if (!nextDueQuarter) {
          nextDueQuarter = meta.quarter;
        }
      }
    }

    completedVisitsCount += completed;
    scheduledVisitsCount += scheduled;
    if (completed >= ANNUAL_ENROLLED_VISIT_TARGET) {
      fullyCompletedStudentsCount += 1;
    } else {
      studentsNeedingVisitCount += 1;
    }

    return {
      studentId: stu.id,
      admissionNo: stu.admissionNo,
      studentName: stu.name,
      classSection: stu.classSection,
      guardianName: stu.guardianName,
      guardianPhone: stu.guardianPhone,
      quarters,
      completedCount: completed,
      scheduledCount: scheduled,
      targetCount: ANNUAL_ENROLLED_VISIT_TARGET,
      completionPct: Math.round((completed / ANNUAL_ENROLLED_VISIT_TARGET) * 100),
      nextDueQuarter,
      latestVisit: stuVisits[0] ?? null,
    };
  });

  const totalTargetVisits = students.length * ANNUAL_ENROLLED_VISIT_TARGET;
  const overallCompliancePct =
    totalTargetVisits > 0 ? Math.round((completedVisitsCount / totalTargetVisits) * 100) : 0;

  return {
    totalStudents: students.length,
    totalTargetVisits,
    completedVisitsCount,
    scheduledVisitsCount,
    fullyCompletedStudentsCount,
    studentsNeedingVisitCount,
    overallCompliancePct,
    byQuarterCompleted,
    rows,
  };
}

export function validateEnrolledStudentVisitInput(input: {
  studentId?: string;
  academicQuarter?: AcademicVisitQuarter;
  visitDate?: string;
  visitingStaff?: string;
  guardianMet?: string;
}): { valid: boolean; error?: string } {
  if (!input.studentId?.trim()) return { valid: false, error: 'Please select an enrolled student.' };
  if (!input.academicQuarter || !['Q1', 'Q2', 'Q3', 'Q4'].includes(input.academicQuarter)) {
    return { valid: false, error: 'Please choose an academic quarter (Q1, Q2, Q3, or Q4).' };
  }
  if (!input.visitDate?.trim()) return { valid: false, error: 'Please provide the home visit date.' };
  if (!input.visitingStaff?.trim()) return { valid: false, error: 'Please enter the visiting faculty / leader name.' };
  if (!input.guardianMet?.trim()) return { valid: false, error: 'Please enter the parent or guardian met.' };
  return { valid: true };
}
