import type { Express, Request, Response, NextFunction } from 'express';
import type {
  AbsenceTargetRiskAlert,
  AcademicResource,
  EventParticipationRequest,
  EventParticipationStatus,
  EventTeacherIssue,
  EventTeacherIssueSeverity,
  EventTeacherIssueType,
  SchoolEvent,
  SchoolEventCategory,
  SchoolEventMilestone,
  SchoolEventStatus,
  StudentRecord,
  StudentYearlyPlan,
  StudentYearlySkillTarget,
  UserAccount,
  UserRole,
} from '../src/types';
import type { DatabaseState } from './seedData.ts';
import { getDb, saveDb } from './store.ts';
import {
  applyAttendanceRiskToPlan,
  buildAbsenceTargetRiskAlert,
  buildDefaultYearlyPlanForStudent,
} from '../src/utils/yearlyPlanEngine.ts';
import {
  canTeacherAccessSubjectResource,
  computeTeacherTeachingScope,
} from '../src/utils/roleVisibilityAudit.ts';
import { calculateLearnersScore } from '../src/utils/evidenceEngine.ts';

interface AuthedRequest extends Request {
  user?: UserAccount;
  activeSchoolId?: string | null;
}

interface RouteDeps {
  requireAuth: (req: AuthedRequest, res: Response, next: NextFunction) => void;
  requireRoles: (
    roles: UserRole[],
  ) => (req: AuthedRequest, res: Response, next: NextFunction) => void;
  appendAuditLog: (params: {
    schoolId: string | null;
    actor: UserAccount;
    action: string;
    entityType: string;
    entityId: string;
    detail: string;
  }) => void;
}

const VALID_EVENT_CATEGORIES: SchoolEventCategory[] = [
  'Academic',
  'Science & Innovation',
  'Sports',
  'Cultural',
  'Parent-School',
  'Competition',
];

const VALID_EVENT_STATUSES: SchoolEventStatus[] = [
  'Scheduled',
  'In Preparation',
  'Ready',
  'Completed',
];

const VALID_PARTICIPATION_STATUSES: EventParticipationStatus[] = [
  'Requested',
  'Approved',
  'Waitlisted',
  'Declined',
];

const VALID_ISSUE_TYPES: EventTeacherIssueType[] = [
  'Input / Suggestion',
  'Resource Need',
  'Issue / Blocker',
];

const VALID_ISSUE_SEVERITIES: EventTeacherIssueSeverity[] = ['Normal', 'Urgent'];

function trimMax(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

/**
 * Idempotently ensures every school tenant has distinct, school-specific academic resources
 * tailored to its board & curriculum, with clear teacher-pushed vs staff-only state.
 */
export function ensureSchoolSpecificResourcesSeeded(db: DatabaseState): boolean {
  let mutated = false;
  if (!Array.isArray(db.resources)) {
    db.resources = [];
    mutated = true;
  }

  // Ensure existing seeded resources have explicit boolean pushedToStudents flags
  for (const r of db.resources) {
    if (typeof r.pushedToStudents !== 'boolean') {
      // Teacher Guides and Answer Keys stay staff-only by default; Approved Worksheets/Presentations for students stay unpushed unless explicitly pushed
      const isStudentFacingCategory =
        r.category === 'Worksheets' || r.category === 'Presentations';
      if (r.status === 'Approved' && isStudentFacingCategory && (r.id === 'res-3' || r.id === 'res-1')) {
        r.pushedToStudents = true;
        r.pushedBy = r.createdBy;
        r.pushedAt = r.updatedAt || '2026-11-12';
      } else {
        r.pushedToStudents = false;
      }
      mutated = true;
    }
  }

  const schoolDistinctPacks: AcademicResource[] = [
    // School 1: Virat International School, Jhajjar (HBSE)
    {
      id: 'res-vis-c6-sci-food',
      schoolId: 'school-vis-jjr',
      title: 'VIS Lab Sheet: Components of Food & Iodine Starch Test',
      classSection: '6-A',
      subject: 'Science',
      chapter: 'Ch. 1: Components of Food',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Neha',
      pushedAt: '2026-11-14',
      contentSummary:
        'Jhajjar HBSE Class 6 Science lab activity: Classify carbohydrates, proteins, fats & vitamins using home thali foods and iodine test.',
      createdBy: 'Neha',
      aiAssisted: false,
      updatedAt: '2026-11-14',
    },
    {
      id: 'res-vis-c6-math-num',
      schoolId: 'school-vis-jjr',
      title: 'VIS Class 6 Maths: Knowing Our Numbers Practice Set',
      classSection: '6-A',
      subject: 'Mathematics',
      chapter: 'Ch. 1: Knowing Our Numbers',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Anand',
      pushedAt: '2026-11-13',
      contentSummary:
        'Indian & International place value drills and estimation problems pushed specifically for VIS Class 6-A.',
      createdBy: 'Anand',
      aiAssisted: false,
      updatedAt: '2026-11-13',
    },
    {
      id: 'res-vis-c6-eng-draft',
      schoolId: 'school-vis-jjr',
      title: 'VIS Class 6 Science: Unit Test Question Bank (Staff Only — Not Pushed)',
      classSection: '6-A',
      subject: 'Science',
      chapter: 'Ch. 1: Components of Food',
      session: '2026-27',
      board: 'HBSE',
      category: 'Assessments and Rubrics',
      status: 'Approved',
      pushedToStudents: false,
      contentSummary:
        'Teacher-only assessment rubric & marking blueprint. Hidden from Class 6 students until teacher pushes it.',
      createdBy: 'Neha',
      aiAssisted: false,
      updatedAt: '2026-11-14',
    },
    {
      id: 'res-vis-c10-phy-light',
      schoolId: 'school-vis-jjr',
      title: 'VIS Class 10 HBSE Board Ray Diagrams & Mirror Formula Pack',
      classSection: '10-A',
      subject: 'Science',
      chapter: 'Ch. 10: Light — Reflection and Refraction',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Anand',
      pushedAt: '2026-11-12',
      contentSummary:
        'Concave/convex ray-diagram step sheets and HBSE board numerical bank exclusively for Class 10-A.',
      createdBy: 'Anand',
      aiAssisted: false,
      updatedAt: '2026-11-12',
    },
    // School 2: Saraswati Vidya Mandir, Kurukshetra (HBSE/NCERT)
    {
      id: 'res-svm-c9-sci-motion',
      schoolId: 'school-svm-kk',
      title: 'SVM Kurukshetra Class 9 Science: Motion & Velocity-Time Graphs',
      classSection: '9-A',
      subject: 'Science',
      chapter: 'Ch. 7: Motion',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Kavita Sharma',
      pushedAt: '2026-11-13',
      contentSummary:
        'Kurukshetra campus graphical derivation workbook & NCERT exemplar numericals pushed for SVM Class 9-A.',
      createdBy: 'Kavita Sharma',
      aiAssisted: false,
      updatedAt: '2026-11-13',
    },
    {
      id: 'res-svm-c6-sci-food',
      schoolId: 'school-svm-kk',
      title: 'SVM Kurukshetra Class 6 Science: Balanced Diet Activity Journal',
      classSection: '6-A',
      subject: 'Science',
      chapter: 'Ch. 1: Components of Food',
      session: '2026-27',
      board: 'HBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Anil Kumar Hooda',
      pushedAt: '2026-11-11',
      contentSummary:
        'SVM Kurukshetra 7-day nutrition diary & deficiency disease matching sheet distinct to SVM curriculum.',
      createdBy: 'Anil Kumar Hooda',
      aiAssisted: false,
      updatedAt: '2026-11-11',
    },
    // School 3: Doon Public Academy, Karnal (CBSE)
    {
      id: 'res-dpa-c11-phy-laws',
      schoolId: 'school-dpa-knl',
      title: 'DPA Karnal CBSE Class 11 Physics: Free-Body Diagrams & Friction',
      classSection: '11-Science',
      subject: 'Physics',
      chapter: 'Ch. 5: Laws of Motion',
      session: '2026-27',
      board: 'CBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Harpreet Kaur Sandhu',
      pushedAt: '2026-11-14',
      contentSummary:
        'CBSE competency-based assertion-reasoning & JEE-foundation mechanics problems exclusive to Doon Public Academy Karnal.',
      createdBy: 'Harpreet Kaur Sandhu',
      aiAssisted: false,
      updatedAt: '2026-11-14',
    },
    {
      id: 'res-dpa-c8-math-mensuration',
      schoolId: 'school-dpa-knl',
      title: 'DPA Karnal CBSE Class 8 Maths: Case-Study Mensuration Workbook',
      classSection: '8-A',
      subject: 'Mathematics',
      chapter: 'Ch. 9: Mensuration',
      session: '2026-27',
      board: 'CBSE',
      category: 'Worksheets',
      status: 'Approved',
      pushedToStudents: true,
      pushedBy: 'Harpreet Kaur Sandhu',
      pushedAt: '2026-11-12',
      contentSummary:
        'CBSE SAFAL-aligned 3D surface area & volume case studies created for Doon Public Academy Class 8.',
      createdBy: 'Harpreet Kaur Sandhu',
      aiAssisted: false,
      updatedAt: '2026-11-12',
    },
  ];

  const existingIds = new Set(db.resources.map((r) => r.id));
  for (const item of schoolDistinctPacks) {
    if (!existingIds.has(item.id)) {
      db.resources.push(item);
      mutated = true;
    }
  }

  return mutated;
}

/**
 * Idempotently initializes upcoming school events, participation requests, teacher issues,
 * personalized student yearly plans, and baseline absence-risk alerts for a given school.
 */
export function ensureEventsAndPlansInitialized(db: DatabaseState, schoolId: string): boolean {
  let mutated = false;
  if (!Array.isArray(db.schoolEvents)) {
    db.schoolEvents = [];
    mutated = true;
  }
  if (!Array.isArray(db.eventParticipationRequests)) {
    db.eventParticipationRequests = [];
    mutated = true;
  }
  if (!Array.isArray(db.eventTeacherIssues)) {
    db.eventTeacherIssues = [];
    mutated = true;
  }
  if (!Array.isArray(db.studentYearlyPlans)) {
    db.studentYearlyPlans = [];
    mutated = true;
  }
  if (!Array.isArray(db.absenceTargetRiskAlerts)) {
    db.absenceTargetRiskAlerts = [];
    mutated = true;
  }

  const school = db.schools.find((s) => s.id === schoolId);
  const schoolUsers = db.users.filter((u) => u.schoolId === schoolId);
  const coordinatorUser =
    schoolUsers.find((u) => u.role === 'coordinator') ||
    schoolUsers.find((u) => u.role === 'principal');
  const teacherUsers = schoolUsers.filter((u) => u.role === 'teacher');
  const t1 = teacherUsers[0];
  const t2 = teacherUsers[1] || teacherUsers[0];
  const coordName = coordinatorUser?.name || 'Academic Coordinator';
  const coordId = coordinatorUser?.id;

  const schoolEvents = db.schoolEvents.filter((e) => e.schoolId === schoolId);
  if (schoolEvents.length === 0) {
    const prefix = school?.code?.split('-')[0] || 'SCH';
    const isVis = schoolId === 'school-vis-jjr';
    const seededEvents: SchoolEvent[] = [
      {
        id: `evt-${schoolId}-sci-expo`,
        schoolId,
        title: isVis
          ? 'Annual Science & Nutrition Model Exhibition'
          : `${prefix} STEM & Working Model Showcase`,
        category: 'Science & Innovation',
        eventDate: '2026-12-05',
        timeSlot: '09:30 AM – 01:30 PM',
        venue: 'Main Auditorium & Science Courtyard',
        targetClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        description:
          'Students demonstrate live science experiments (including balanced food tests, solar water heaters, and robotics prototypes) before parents and guest judges.',
        dedicatedCoordinatorId: coordId,
        dedicatedCoordinatorName: coordName,
        assignedTeachers: [
          {
            teacherUserId: t1?.id,
            teacherName: t1?.name || 'Science Lead Teacher',
            responsibility: 'Exhibit curation, lab safety & student demo briefing',
          },
          {
            teacherUserId: t2?.id,
            teacherName: t2?.name || 'Activity Co-Lead',
            responsibility: 'Stall layout, parent visitor routing & judging rubric sheets',
          },
        ],
        registrationDeadline: '2026-11-29',
        maxParticipants: 60,
        status: 'In Preparation',
        readinessPct: 68,
        progressSummary:
          '24 working models shortlisted; demonstration tables booked. Awaiting extra iodine dropper kits and extension cords for Wing B stalls.',
        milestones: [
          {
            id: `ms-${schoolId}-1`,
            title: 'Finalize theme guidelines & parent circular',
            dueDate: '2026-11-18',
            ownerName: coordName,
            completed: true,
            completedAt: '2026-11-16',
          },
          {
            id: `ms-${schoolId}-2`,
            title: 'Shortlist class-wise student project teams',
            dueDate: '2026-11-25',
            ownerName: t1?.name || 'Science Lead Teacher',
            completed: true,
            completedAt: '2026-11-21',
          },
          {
            id: `ms-${schoolId}-3`,
            title: 'Set up lab glassware, display boards & power strips',
            dueDate: '2026-12-02',
            ownerName: t2?.name || 'Activity Co-Lead',
            completed: false,
          },
          {
            id: `ms-${schoolId}-4`,
            title: 'Conduct full dress rehearsal with assigned teachers',
            dueDate: '2026-12-04',
            ownerName: coordName,
            completed: false,
          },
        ],
        createdBy: coordName,
        createdAt: '2026-11-10',
        updatedAt: '2026-11-21',
      },
      {
        id: `evt-${schoolId}-sports-meet`,
        schoolId,
        title: 'Inter-House Annual Athletics & Fitness Meet',
        category: 'Sports',
        eventDate: '2026-12-14',
        timeSlot: '08:30 AM – 02:00 PM',
        venue: 'Campus Sports Ground',
        targetClasses: ['All Classes'],
        description:
          'Track relays, kho-kho, march-past, and junior obstacle races celebrating OLQ stamina, teamwork, and sportsmanship.',
        dedicatedCoordinatorId: coordId,
        dedicatedCoordinatorName: coordName,
        assignedTeachers: [
          {
            teacherUserId: t2?.id,
            teacherName: t2?.name || 'Sports House Lead',
            responsibility: 'Track heats, house rosters & first-aid station setup',
          },
        ],
        registrationDeadline: '2026-12-06',
        maxParticipants: 180,
        status: 'Scheduled',
        readinessPct: 45,
        progressSummary:
          'House captains appointed and track lime-marking scheduled. Parent participation requests open for junior & senior relays.',
        milestones: [
          {
            id: `ms-${schoolId}-s1`,
            title: 'Publish event schedule & safety consent circular',
            dueDate: '2026-11-22',
            ownerName: coordName,
            completed: true,
            completedAt: '2026-11-20',
          },
          {
            id: `ms-${schoolId}-s2`,
            title: 'Confirm student race entries & house bib kits',
            dueDate: '2026-12-07',
            ownerName: t2?.name || 'Sports House Lead',
            completed: false,
          },
          {
            id: `ms-${schoolId}-s3`,
            title: 'Arrange hydration booth & medical desk on ground',
            dueDate: '2026-12-12',
            ownerName: coordName,
            completed: false,
          },
        ],
        createdBy: coordName,
        createdAt: '2026-11-12',
        updatedAt: '2026-11-20',
      },
      {
        id: `evt-${schoolId}-reading-fest`,
        schoolId,
        title: 'Bilingual Story-Telling, Debate & Reading Olympiad',
        category: 'Academic',
        eventDate: '2026-12-21',
        timeSlot: '10:00 AM – 12:45 PM',
        venue: 'Seminar Hall & Library Wing',
        targetClasses: ['Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'],
        description:
          'Stage storytelling, rapid comprehension rounds, and structured Hindi/English debate aligned with student yearly reading targets.',
        dedicatedCoordinatorId: coordId,
        dedicatedCoordinatorName: coordName,
        assignedTeachers: [
          {
            teacherUserId: t1?.id,
            teacherName: t1?.name || 'Language Coordinator',
            responsibility: 'Debate topics, judging sheets & microphone checks',
          },
        ],
        registrationDeadline: '2026-12-15',
        maxParticipants: 80,
        status: 'Ready',
        readinessPct: 85,
        progressSummary:
          'Topic cards and rubrics finalized. Stage audio check complete; open for parent-nominated student entries.',
        milestones: [
          {
            id: `ms-${schoolId}-r1`,
            title: 'Release grade-wise debate & story prompts',
            dueDate: '2026-11-28',
            ownerName: t1?.name || 'Language Coordinator',
            completed: true,
            completedAt: '2026-11-21',
          },
          {
            id: `ms-${schoolId}-r2`,
            title: 'Prepare participation certificates & podium timers',
            dueDate: '2026-12-18',
            ownerName: coordName,
            completed: false,
          },
        ],
        createdBy: coordName,
        createdAt: '2026-11-14',
        updatedAt: '2026-11-21',
      },
    ];

    db.schoolEvents.push(...seededEvents);
    mutated = true;

    // Seed sample participation requests & teacher inputs/issues for immediate coordinator workflow
    const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
    const firstStu = schoolStudents[0];
    const secondStu = schoolStudents[1];
    if (firstStu) {
      db.eventParticipationRequests.push({
        id: `evreq-${schoolId}-1`,
        schoolId,
        eventId: seededEvents[0].id,
        studentId: firstStu.id,
        studentName: firstStu.name,
        classSection: firstStu.classSection,
        requestedByUserId:
          schoolUsers.find((u) => u.role === 'parent' && u.linkedStudentIds?.includes(firstStu.id))
            ?.id || 'parent-seed',
        requestedByName: firstStu.guardianName,
        requestedByRole: 'parent',
        parentNote:
          'Prepared a working Balanced Thali & Iodine Starch Test chart at home; eager to present.',
        status: 'Approved',
        reviewedBy: coordName,
        reviewedAt: '2026-11-21',
        reviewNote: 'Allotted Stall #4 in Science Courtyard.',
        createdAt: '2026-11-20',
      });
    }
    if (secondStu) {
      db.eventParticipationRequests.push({
        id: `evreq-${schoolId}-2`,
        schoolId,
        eventId: seededEvents[1].id,
        studentId: secondStu.id,
        studentName: secondStu.name,
        classSection: secondStu.classSection,
        requestedByUserId: 'parent-seed-2',
        requestedByName: secondStu.guardianName,
        requestedByRole: 'parent',
        parentNote: 'Requesting enrollment for 200m relay and House march-past.',
        status: 'Requested',
        createdAt: '2026-11-21',
      });
    }

    db.eventTeacherIssues.push(
      {
        id: `eviss-${schoolId}-1`,
        schoolId,
        eventId: seededEvents[0].id,
        teacherUserId: t1?.id || 'teacher-seed-1',
        teacherName: t1?.name || 'Science Lead Teacher',
        entryType: 'Resource Need',
        severity: 'Urgent',
        title: 'Need 12 additional iodine dropper bottles & 4 extension power boards',
        detail:
          'Class 6 and Class 8 teams have live food-test & motor demos requiring safe low-voltage sockets at Courtyard Wing B.',
        status: 'Open',
        assignedCoordinatorName: coordName,
        createdAt: '2026-11-21',
      },
      {
        id: `eviss-${schoolId}-2`,
        schoolId,
        eventId: seededEvents[0].id,
        teacherUserId: t2?.id || 'teacher-seed-2',
        teacherName: t2?.name || 'Activity Co-Lead',
        entryType: 'Input / Suggestion',
        severity: 'Normal',
        title: 'Stagger parent visiting slots by class wing',
        detail:
          'Scheduling Classes 6–8 parents at 10:00 AM and Classes 9–10 at 11:30 AM will avoid corridor crowding.',
        status: 'Resolved',
        assignedCoordinatorName: coordName,
        resolutionNote: 'Approved — staggered parent visiting pass timings added to circular.',
        resolvedBy: coordName,
        resolvedAt: '2026-11-21',
        createdAt: '2026-11-19',
      },
    );
  }

  // Ensure every student in this school has an individual achievable Yearly Plan
  const schoolStudents = db.students.filter((s) => s.schoolId === schoolId);
  const existingPlanStudentIds = new Set(
    db.studentYearlyPlans.filter((p) => p.schoolId === schoolId).map((p) => p.studentId),
  );
  const weights = db.schoolWeights[schoolId]?.weights;
  const schoolAttendance = db.attendance.filter((a) => a.schoolId === schoolId);
  const schoolSession = school?.session || '2026-27';

  for (const stu of schoolStudents) {
    if (!existingPlanStudentIds.has(stu.id)) {
      const breakdown = weights
        ? calculateLearnersScore(
            db.evidence.filter((e) => e.schoolId === schoolId && e.studentId === stu.id),
            weights,
          )
        : null;
      const basePlan = buildDefaultYearlyPlanForStudent(stu, breakdown, schoolSession);
      const evaluated = applyAttendanceRiskToPlan(basePlan, stu, schoolAttendance);
      db.studentYearlyPlans.push(evaluated);
      mutated = true;
    }
  }

  // Refresh risk status on plans for this school & seed baseline absence risk alerts for students with absences
  const schoolPlans = db.studentYearlyPlans.filter((p) => p.schoolId === schoolId);
  const existingAlertStudentIds = new Set(
    db.absenceTargetRiskAlerts
      .filter((a) => a.schoolId === schoolId && a.status === 'Active')
      .map((a) => a.studentId),
  );

  for (const plan of schoolPlans) {
    const stu = schoolStudents.find((s) => s.id === plan.studentId);
    if (!stu) continue;
    const updated = applyAttendanceRiskToPlan(plan, stu, schoolAttendance);
    if (
      updated.overallRiskLevel !== plan.overallRiskLevel ||
      updated.projectedAttainmentDropPct !== plan.projectedAttainmentDropPct
    ) {
      plan.targets = updated.targets;
      plan.overallRiskLevel = updated.overallRiskLevel;
      plan.projectedAttainmentDropPct = updated.projectedAttainmentDropPct;
      mutated = true;
    }

    // If student already has an Absent mark or low attendance (<85%) and no active alert yet, create one
    const latestAbsence = schoolAttendance
      .filter((a) => a.studentId === stu.id && a.status === 'Absent')
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    if (
      !existingAlertStudentIds.has(stu.id) &&
      (latestAbsence || stu.attendancePct < plan.attendanceThresholdPct)
    ) {
      const alert = buildAbsenceTargetRiskAlert({
        schoolId,
        schoolName: school?.name || 'School Campus',
        student: stu,
        plan,
        absenceDate: latestAbsence?.date || new Date().toISOString().slice(0, 10),
        attendanceRecords: schoolAttendance,
        triggeredBy: 'Yearly Target Attendance Monitor',
      });
      db.absenceTargetRiskAlerts.unshift(alert);
      existingAlertStudentIds.add(stu.id);
      mutated = true;
    }
  }

  return mutated;
}

/**
 * Called whenever attendance is recorded for a student. Updates the student's yearly plan risk
 * and dispatches an automatic AbsenceTargetRiskAlert to both Parent & Management when Absent.
 */
export function recordAbsenceRiskAlertOnAttendance(
  db: DatabaseState,
  params: {
    schoolId: string;
    schoolName: string;
    student: StudentRecord;
    date: string;
    status: 'Present' | 'Absent' | 'Leave';
    actorName: string;
  },
): AbsenceTargetRiskAlert | null {
  const { schoolId, schoolName, student, date, status, actorName } = params;
  if (!Array.isArray(db.studentYearlyPlans)) db.studentYearlyPlans = [];
  if (!Array.isArray(db.absenceTargetRiskAlerts)) db.absenceTargetRiskAlerts = [];

  const schoolAttendance = db.attendance.filter((a) => a.schoolId === schoolId);
  let planIdx = db.studentYearlyPlans.findIndex(
    (p) => p.schoolId === schoolId && p.studentId === student.id,
  );
  if (planIdx < 0) {
    const school = db.schools.find((s) => s.id === schoolId);
    const created = buildDefaultYearlyPlanForStudent(student, null, school?.session || '2026-27');
    db.studentYearlyPlans.push(created);
    planIdx = db.studentYearlyPlans.length - 1;
  }

  const updatedPlan = applyAttendanceRiskToPlan(
    db.studentYearlyPlans[planIdx],
    student,
    schoolAttendance,
  );
  db.studentYearlyPlans[planIdx] = updatedPlan;

  if (status !== 'Absent') {
    return null;
  }

  const alert = buildAbsenceTargetRiskAlert({
    schoolId,
    schoolName,
    student,
    plan: updatedPlan,
    absenceDate: date,
    attendanceRecords: schoolAttendance,
    triggeredBy: actorName,
  });

  const existingIdx = db.absenceTargetRiskAlerts.findIndex((a) => a.id === alert.id);
  if (existingIdx >= 0) {
    db.absenceTargetRiskAlerts[existingIdx] = alert;
  } else {
    db.absenceTargetRiskAlerts.unshift(alert);
  }
  return alert;
}

export function registerEventsAndPlansRoutes(app: Express, deps: RouteDeps) {
  const { requireAuth, requireRoles, appendAuditLog } = deps;

  // ---------------- TEACHER PUSH / RECALL ACADEMIC RESOURCE TO DEDICATED CLASS ----------------
  app.post(
    '/api/resources/:id/push',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      const resource = db.resources.find(
        (r) => r.id === req.params.id && r.schoolId === schoolId,
      );
      if (!resource) {
        res.status(404).json({ error: 'Academic resource not found in active school.' });
        return;
      }

      // Teachers may only push/recall resources for their assigned class & subject (or their own created item)
      if (req.user!.role === 'teacher') {
        const teacherScope = computeTeacherTeachingScope(
          req.user!,
          db.timetable.filter((t) => t.schoolId === schoolId),
        );
        const allowed =
          resource.createdBy === req.user!.name ||
          canTeacherAccessSubjectResource(teacherScope, resource.classSection, resource.subject);
        if (!allowed) {
          res.status(403).json({
            error: 'Teachers can only push or recall resources for their assigned classes and subjects.',
          });
          return;
        }
      }

      const desiredPush =
        typeof req.body?.pushed === 'boolean' ? req.body.pushed : !Boolean(resource.pushedToStudents);

      resource.pushedToStudents = desiredPush;
      if (desiredPush) {
        resource.status = 'Approved';
        resource.pushedBy = req.user!.name;
        resource.pushedAt = new Date().toISOString().slice(0, 10);
      } else {
        resource.pushedBy = undefined;
        resource.pushedAt = undefined;
      }
      resource.updatedAt = new Date().toISOString().slice(0, 10);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: desiredPush ? 'PUSHED_RESOURCE_TO_CLASS' : 'RECALLED_RESOURCE_FROM_CLASS',
        entityType: 'AcademicResource',
        entityId: resource.id,
        detail: `${desiredPush ? 'Pushed' : 'Recalled'} "${resource.title}" (${resource.subject}) for Class ${resource.classSection}.`,
      });

      saveDb();
      res.json({ resource });
    },
  );

  // ---------------- SCHOOL EVENTS CALENDAR, PROGRESS, PARTICIPATION & ISSUES ----------------
  app.get('/api/events', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId!;
    const mutated = ensureEventsAndPlansInitialized(db, schoolId);
    if (mutated) saveDb();

    const user = req.user!;
    const isParentOrStudent = user.role === 'parent' || user.role === 'student';
    const linkedIds = new Set(user.linkedStudentIds || []);

    const events = (db.schoolEvents || [])
      .filter((e) => e.schoolId === schoolId)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

    const requests = (db.eventParticipationRequests || []).filter((r) => {
      if (r.schoolId !== schoolId) return false;
      if (isParentOrStudent) return linkedIds.has(r.studentId);
      return true;
    });

    const issues = isParentOrStudent
      ? []
      : (db.eventTeacherIssues || []).filter((i) => i.schoolId === schoolId);

    res.json({ events, participationRequests: requests, teacherIssues: issues });
  });

  app.post(
    '/api/events',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const title = trimMax(req.body?.title, 140);
      const categoryRaw = trimMax(req.body?.category, 40) as SchoolEventCategory;
      const category = VALID_EVENT_CATEGORIES.includes(categoryRaw) ? categoryRaw : 'Academic';
      const eventDate = trimMax(req.body?.eventDate, 20);
      const timeSlot = trimMax(req.body?.timeSlot, 60) || '09:30 AM – 01:00 PM';
      const venue = trimMax(req.body?.venue, 100) || 'School Auditorium';
      const description = trimMax(req.body?.description, 600);
      const registrationDeadline = trimMax(req.body?.registrationDeadline, 20) || eventDate;
      const maxParticipants = Math.max(10, Math.min(1000, Number(req.body?.maxParticipants) || 80));
      const dedicatedCoordinatorName =
        trimMax(req.body?.dedicatedCoordinatorName, 80) || req.user!.name;

      if (!title || !eventDate) {
        res.status(400).json({ error: 'Event title and date are required.' });
        return;
      }

      const rawClasses: unknown[] = Array.isArray(req.body?.targetClasses)
        ? req.body.targetClasses
        : ['All Classes'];
      const targetClasses = rawClasses
        .map((c) => trimMax(c, 30))
        .filter(Boolean)
        .slice(0, 14);

      const rawTeachers: unknown[] = Array.isArray(req.body?.assignedTeachers)
        ? req.body.assignedTeachers
        : [];
      const assignedTeachers = rawTeachers
        .map((item) => {
          const obj = item as { teacherName?: string; responsibility?: string; teacherUserId?: string };
          const tName = trimMax(obj?.teacherName, 80);
          if (!tName) return null;
          return {
            teacherUserId: trimMax(obj?.teacherUserId, 60) || undefined,
            teacherName: tName,
            responsibility: trimMax(obj?.responsibility, 160) || 'Student preparation & event supervision',
          };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));

      const today = new Date().toISOString().slice(0, 10);
      const newEvent: SchoolEvent = {
        id: `evt-${schoolId}-${Date.now()}`,
        schoolId,
        title,
        category,
        eventDate,
        timeSlot,
        venue,
        targetClasses: targetClasses.length > 0 ? targetClasses : ['All Classes'],
        description: description || 'School calendar event open for student participation.',
        dedicatedCoordinatorName,
        assignedTeachers,
        registrationDeadline,
        maxParticipants,
        status: 'Scheduled',
        readinessPct: 20,
        progressSummary: 'Event published to school calendar; parent & student participation requests open.',
        milestones: [
          {
            id: `ms-${Date.now()}-1`,
            title: 'Confirm assigned teachers & student participation roster',
            dueDate: registrationDeadline,
            ownerName: dedicatedCoordinatorName,
            completed: false,
          },
          {
            id: `ms-${Date.now()}-2`,
            title: 'Finalize venue setup, equipment & rehearsal',
            dueDate: eventDate,
            ownerName: assignedTeachers[0]?.teacherName || dedicatedCoordinatorName,
            completed: false,
          },
        ],
        createdBy: req.user!.name,
        createdAt: today,
        updatedAt: today,
      };

      db.schoolEvents!.unshift(newEvent);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'CREATED_SCHOOL_EVENT',
        entityType: 'SchoolEvent',
        entityId: newEvent.id,
        detail: `Scheduled "${newEvent.title}" on ${newEvent.eventDate} (Coordinator: ${newEvent.dedicatedCoordinatorName}).`,
      });
      saveDb();
      res.status(201).json({ event: newEvent });
    },
  );

  app.patch(
    '/api/events/:id/progress',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const event = (db.schoolEvents || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!event) {
        res.status(404).json({ error: 'Event not found in active school.' });
        return;
      }

      const nextStatus = trimMax(req.body?.status, 30) as SchoolEventStatus;
      if (nextStatus && VALID_EVENT_STATUSES.includes(nextStatus)) {
        event.status = nextStatus;
      }

      if (typeof req.body?.progressSummary === 'string') {
        event.progressSummary = trimMax(req.body.progressSummary, 600);
      }

      if (Array.isArray(req.body?.milestones)) {
        const sanitized: SchoolEventMilestone[] = req.body.milestones
          .slice(0, 12)
          .map((m: Partial<SchoolEventMilestone>, idx: number) => ({
            id: trimMax(m.id, 60) || `ms-${Date.now()}-${idx}`,
            title: trimMax(m.title, 160) || 'Preparation milestone',
            dueDate: trimMax(m.dueDate, 20) || event.eventDate,
            ownerName: trimMax(m.ownerName, 80) || event.dedicatedCoordinatorName,
            completed: Boolean(m.completed),
            completedAt: m.completed
              ? m.completedAt || new Date().toISOString().slice(0, 10)
              : undefined,
          }));
        event.milestones = sanitized;
      }

      if (typeof req.body?.readinessPct === 'number' && Number.isFinite(req.body.readinessPct)) {
        event.readinessPct = Math.max(0, Math.min(100, Math.round(req.body.readinessPct)));
      } else if (event.milestones.length > 0) {
        const done = event.milestones.filter((m) => m.completed).length;
        event.readinessPct = Math.round((done / event.milestones.length) * 100);
      }

      event.updatedAt = new Date().toISOString().slice(0, 10);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_EVENT_PROGRESS',
        entityType: 'SchoolEvent',
        entityId: event.id,
        detail: `Updated event progress for "${event.title}" (${event.readinessPct}% ready · ${event.status}).`,
      });
      saveDb();
      res.json({ event });
    },
  );

  app.post(
    '/api/events/:id/participation-request',
    requireAuth,
    requireRoles([
      'parent',
      'student',
      'super_admin',
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
    ]),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const event = (db.schoolEvents || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!event) {
        res.status(404).json({ error: 'Event not found in active school.' });
        return;
      }

      const studentId = trimMax(req.body?.studentId, 80);
      const parentNote = trimMax(req.body?.parentNote, 400);
      if (!studentId) {
        res.status(400).json({ error: 'Student selection is required.' });
        return;
      }

      // Strict ownership enforcement for parents & students
      const user = req.user!;
      if (user.role === 'parent' || user.role === 'student') {
        const linked = new Set(user.linkedStudentIds || []);
        if (!linked.has(studentId)) {
          res.status(403).json({
            error: 'Access denied: you may only submit participation requests for your linked student.',
          });
          return;
        }
      }

      const student = db.students.find((s) => s.id === studentId && s.schoolId === schoolId);
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      const existing = (db.eventParticipationRequests || []).find(
        (r) => r.schoolId === schoolId && r.eventId === event.id && r.studentId === student.id,
      );
      if (existing) {
        existing.parentNote = parentNote || existing.parentNote;
        if (existing.status === 'Declined') {
          existing.status = 'Requested';
        }
        saveDb();
        res.json({ request: existing, duplicate: true });
        return;
      }

      const reqItem: EventParticipationRequest = {
        id: `evreq-${Date.now()}`,
        schoolId,
        eventId: event.id,
        studentId: student.id,
        studentName: student.name,
        classSection: student.classSection,
        requestedByUserId: user.id,
        requestedByName: user.name,
        requestedByRole: user.role,
        parentNote:
          parentNote || `Requesting ${student.name} (${student.classSection}) to participate.`,
        status: 'Requested',
        createdAt: new Date().toISOString().slice(0, 10),
      };

      db.eventParticipationRequests!.unshift(reqItem);
      appendAuditLog({
        schoolId,
        actor: user,
        action: 'SUBMITTED_EVENT_PARTICIPATION_REQUEST',
        entityType: 'EventParticipationRequest',
        entityId: reqItem.id,
        detail: `${user.name} pushed participation request for ${student.name} (${student.classSection}) in "${event.title}".`,
      });
      saveDb();
      res.status(201).json({ request: reqItem });
    },
  );

  app.patch(
    '/api/events/participation-requests/:reqId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const entry = (db.eventParticipationRequests || []).find(
        (r) => r.id === req.params.reqId && r.schoolId === schoolId,
      );
      if (!entry) {
        res.status(404).json({ error: 'Participation request not found.' });
        return;
      }

      const statusRaw = trimMax(req.body?.status, 30) as EventParticipationStatus;
      if (!VALID_PARTICIPATION_STATUSES.includes(statusRaw)) {
        res.status(400).json({ error: 'Invalid participation request status.' });
        return;
      }

      entry.status = statusRaw;
      entry.reviewNote = trimMax(req.body?.reviewNote, 300) || entry.reviewNote;
      entry.reviewedBy = req.user!.name;
      entry.reviewedAt = new Date().toISOString().slice(0, 10);

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'REVIEWED_EVENT_PARTICIPATION',
        entityType: 'EventParticipationRequest',
        entityId: entry.id,
        detail: `Marked ${entry.studentName} as ${entry.status} for event ${entry.eventId}.`,
      });
      saveDb();
      res.json({ request: entry });
    },
  );

  app.post(
    '/api/events/:id/teacher-inputs',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const event = (db.schoolEvents || []).find(
        (e) => e.id === req.params.id && e.schoolId === schoolId,
      );
      if (!event) {
        res.status(404).json({ error: 'Event not found in active school.' });
        return;
      }

      const title = trimMax(req.body?.title, 160);
      const detail = trimMax(req.body?.detail, 600);
      const entryTypeRaw = trimMax(req.body?.entryType, 40) as EventTeacherIssueType;
      const severityRaw = trimMax(req.body?.severity, 20) as EventTeacherIssueSeverity;

      if (!title || !detail) {
        res.status(400).json({ error: 'Issue/input title and details are required.' });
        return;
      }

      const issue: EventTeacherIssue = {
        id: `eviss-${Date.now()}`,
        schoolId,
        eventId: event.id,
        teacherUserId: req.user!.id,
        teacherName: req.user!.name,
        entryType: VALID_ISSUE_TYPES.includes(entryTypeRaw) ? entryTypeRaw : 'Issue / Blocker',
        severity: VALID_ISSUE_SEVERITIES.includes(severityRaw) ? severityRaw : 'Normal',
        title,
        detail,
        status: 'Open',
        assignedCoordinatorName: event.dedicatedCoordinatorName,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      db.eventTeacherIssues!.unshift(issue);
      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'LOGGED_EVENT_TEACHER_INPUT',
        entityType: 'EventTeacherIssue',
        entityId: issue.id,
        detail: `${req.user!.name} logged ${issue.entryType} ("${issue.title}") for "${event.title}" -> assigned to ${event.dedicatedCoordinatorName}.`,
      });
      saveDb();
      res.status(201).json({ issue });
    },
  );

  app.patch(
    '/api/events/teacher-inputs/:issueId/resolve',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const issue = (db.eventTeacherIssues || []).find(
        (i) => i.id === req.params.issueId && i.schoolId === schoolId,
      );
      if (!issue) {
        res.status(404).json({ error: 'Teacher input/issue not found.' });
        return;
      }

      const resolutionNote = trimMax(req.body?.resolutionNote, 500);
      const nextStatus = req.body?.status === 'In Review' ? 'In Review' : 'Resolved';
      if (nextStatus === 'Resolved' && !resolutionNote) {
        res.status(400).json({ error: 'Coordinator resolution note is required to resolve an issue.' });
        return;
      }

      issue.status = nextStatus;
      if (resolutionNote) {
        issue.resolutionNote = resolutionNote;
      }
      if (nextStatus === 'Resolved') {
        issue.resolvedBy = req.user!.name;
        issue.resolvedAt = new Date().toISOString().slice(0, 10);
      }

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'RESOLVED_EVENT_TEACHER_ISSUE',
        entityType: 'EventTeacherIssue',
        entityId: issue.id,
        detail: `Coordinator ${req.user!.name} marked "${issue.title}" as ${issue.status}: ${issue.resolutionNote || ''}`,
      });
      saveDb();
      res.json({ issue });
    },
  );

  // ---------------- STUDENT YEARLY SKILL PLANS & ABSENCE TARGET RISK ALERTS ----------------
  app.get('/api/yearly-plans', requireAuth, (req: AuthedRequest, res) => {
    const db = getDb();
    const schoolId = req.activeSchoolId!;
    const mutated = ensureEventsAndPlansInitialized(db, schoolId);
    if (mutated) saveDb();

    const user = req.user!;
    const isParentOrStudent = user.role === 'parent' || user.role === 'student';
    const linkedIds = new Set(user.linkedStudentIds || []);

    const plans = (db.studentYearlyPlans || []).filter((p) => {
      if (p.schoolId !== schoolId) return false;
      if (isParentOrStudent) return linkedIds.has(p.studentId);
      return true;
    });

    const alerts = (db.absenceTargetRiskAlerts || []).filter((a) => {
      if (a.schoolId !== schoolId) return false;
      if (isParentOrStudent) return linkedIds.has(a.studentId);
      return true;
    });

    res.json({ yearlyPlans: plans, absenceRiskAlerts: alerts });
  });

  app.put(
    '/api/yearly-plans/:studentId',
    requireAuth,
    requireRoles(['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher']),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const student = db.students.find(
        (s) => s.id === req.params.studentId && s.schoolId === schoolId,
      );
      if (!student) {
        res.status(404).json({ error: 'Student not found in active school.' });
        return;
      }

      let planIdx = (db.studentYearlyPlans || []).findIndex(
        (p) => p.schoolId === schoolId && p.studentId === student.id,
      );
      if (planIdx < 0) {
        const school = db.schools.find((s) => s.id === schoolId);
        db.studentYearlyPlans!.push(
          buildDefaultYearlyPlanForStudent(student, null, school?.session || '2026-27'),
        );
        planIdx = db.studentYearlyPlans!.length - 1;
      }

      const plan = db.studentYearlyPlans![planIdx];
      if (typeof req.body?.overallTargetSummary === 'string') {
        plan.overallTargetSummary = trimMax(req.body.overallTargetSummary, 500) || plan.overallTargetSummary;
      }
      if (typeof req.body?.weeklyHomeCommitment === 'string') {
        plan.weeklyHomeCommitment = trimMax(req.body.weeklyHomeCommitment, 240) || plan.weeklyHomeCommitment;
      }
      if (typeof req.body?.attendanceThresholdPct === 'number') {
        plan.attendanceThresholdPct = Math.max(70, Math.min(95, Math.round(req.body.attendanceThresholdPct)));
      }
      if (Array.isArray(req.body?.targets)) {
        const cleanedTargets: StudentYearlySkillTarget[] = req.body.targets
          .slice(0, 8)
          .map((t: Partial<StudentYearlySkillTarget>, idx: number) => ({
            id: trimMax(t.id, 80) || `tgt-${student.id}-${Date.now()}-${idx}`,
            domain: t.domain || 'Science Mastery',
            skillName: trimMax(t.skillName, 140) || 'Skill Target',
            baselineScore: Math.max(0, Math.min(250, Number(t.baselineScore) || 60)),
            currentScore: Math.max(0, Math.min(250, Number(t.currentScore) || 70)),
            targetScore: Math.max(1, Math.min(250, Number(t.targetScore) || 85)),
            unitLabel: trimMax(t.unitLabel, 12) || '%',
            minAttendanceRequiredPct: Math.max(
              70,
              Math.min(98, Number(t.minAttendanceRequiredPct) || 85),
            ),
            weeklyPracticePlan:
              trimMax(t.weeklyPracticePlan, 220) || '20 min structured weekly practice',
            quarterlyMilestones: {
              q1: {
                label: trimMax(t.quarterlyMilestones?.q1?.label, 140) || 'Q1 foundation milestone',
                completed: Boolean(t.quarterlyMilestones?.q1?.completed),
              },
              q2: {
                label: trimMax(t.quarterlyMilestones?.q2?.label, 140) || 'Q2 mid-term milestone',
                completed: Boolean(t.quarterlyMilestones?.q2?.completed),
              },
              q3: {
                label: trimMax(t.quarterlyMilestones?.q3?.label, 140) || 'Q3 application milestone',
                completed: Boolean(t.quarterlyMilestones?.q3?.completed),
              },
              q4: {
                label: trimMax(t.quarterlyMilestones?.q4?.label, 140) || 'Q4 mastery target',
                completed: Boolean(t.quarterlyMilestones?.q4?.completed),
              },
            },
            riskStatus: 'On Track',
          }));
        if (cleanedTargets.length > 0) {
          plan.targets = cleanedTargets;
        }
      }

      plan.updatedBy = req.user!.name;
      plan.updatedAt = new Date().toISOString();

      const schoolAttendance = db.attendance.filter((a) => a.schoolId === schoolId);
      const evaluatedPlan = applyAttendanceRiskToPlan(plan, student, schoolAttendance);
      db.studentYearlyPlans![planIdx] = evaluatedPlan;

      appendAuditLog({
        schoolId,
        actor: req.user!,
        action: 'UPDATED_STUDENT_YEARLY_PLAN',
        entityType: 'StudentYearlyPlan',
        entityId: evaluatedPlan.id,
        detail: `Updated yearly skill target plan for ${student.name} (${student.classSection}) with ${evaluatedPlan.targets.length} achievable targets.`,
      });
      saveDb();
      res.json({ yearlyPlan: evaluatedPlan });
    },
  );

  app.post(
    '/api/yearly-plans/alerts/:alertId/acknowledge',
    requireAuth,
    requireRoles([
      'parent',
      'super_admin',
      'school_admin',
      'principal',
      'coordinator',
      'teacher',
    ]),
    (req: AuthedRequest, res) => {
      const db = getDb();
      const schoolId = req.activeSchoolId!;
      ensureEventsAndPlansInitialized(db, schoolId);

      const alert = (db.absenceTargetRiskAlerts || []).find(
        (a) => a.id === req.params.alertId && a.schoolId === schoolId,
      );
      if (!alert) {
        res.status(404).json({ error: 'Absence risk alert not found.' });
        return;
      }

      const user = req.user!;
      if (user.role === 'parent') {
        const linked = new Set(user.linkedStudentIds || []);
        if (!linked.has(alert.studentId)) {
          res.status(403).json({
            error: 'Access denied: parents may only acknowledge alerts for their own child.',
          });
          return;
        }
        alert.acknowledgedByParent = true;
        alert.acknowledgedByParentAt = new Date().toISOString();
      } else {
        alert.acknowledgedByManagement = true;
        alert.acknowledgedByManagementAt = new Date().toISOString();
        alert.acknowledgedByManagementName = user.name;
      }

      if (alert.acknowledgedByParent && alert.acknowledgedByManagement) {
        alert.status = 'Acknowledged';
      }

      appendAuditLog({
        schoolId,
        actor: user,
        action: 'ACKNOWLEDGED_ABSENCE_RISK_ALERT',
        entityType: 'AbsenceTargetRiskAlert',
        entityId: alert.id,
        detail: `${user.name} (${user.role}) acknowledged yearly-target absence risk alert for ${alert.studentName} (${alert.absenceDate}).`,
      });
      saveDb();
      res.json({ alert });
    },
  );
}
