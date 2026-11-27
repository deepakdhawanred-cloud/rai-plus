import type { BoardType, LessonPlan, SchoolEvent, TimetableSlot } from '../types';
import type {
  AcademicCalendarEntry,
  AcademicCalendarEntryType,
  AcademicCalendarState,
  BoardCircularNotice,
  CalendarChangeNotification,
  CalendarConflictWarning,
  CalendarCreationMode,
  CalendarImpactAffectedItem,
  CalendarImpactReport,
  CalendarModificationDraft,
  CalendarReschedulingMode,
  CurriculumChapterSchedule,
} from '../types/controlRoomCalendar';
import { dateToTimetableDay, normalizeTimetableDay } from './smartTimetableEngine.ts';

function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIsoDate(d);
}

export function enumerateIsoDates(startIso: string, endIso?: string): string[] {
  const start = parseIsoDate(startIso);
  const end = parseIsoDate(endIso || startIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const out: string[] = [];
  const cursor = new Date(start.getTime());
  let guard = 0;
  while (cursor <= end && guard < 400) {
    out.push(toIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return out;
}

export function isHolidayOrVacationType(type: AcademicCalendarEntryType): boolean {
  return type === 'Holiday' || type === 'Vacation';
}

export function buildBoardReferenceEntries(board: BoardType, schoolId: string): AcademicCalendarEntry[] {
  const src: AcademicCalendarEntry['source'] =
    board === 'HBSE' ? 'HBSE Official' : 'CBSE Official';
  const boardExamDate = board === 'HBSE' ? '2027-02-26' : '2027-02-15';
  const boardExamEnd = board === 'HBSE' ? '2027-03-22' : '2027-03-28';

  return [
    {
      id: `cal-${schoolId}-session-start`,
      date: '2026-04-01',
      title: 'Academic Session 2026–27 Commencement',
      type: 'Special Instructional Day',
      source: src,
      description: `Official ${board} session opening assembly and syllabus orientation.`,
    },
    {
      id: `cal-${schoolId}-summer-vac`,
      date: '2026-05-25',
      endDate: '2026-06-30',
      title: 'Summer Vacation',
      type: 'Vacation',
      source: src,
      description: 'Annual summer break per state education department schedule.',
    },
    {
      id: `cal-${schoolId}-ut1`,
      date: '2026-07-20',
      endDate: '2026-07-25',
      title: 'Unit Test 1 (Periodic Assessment I)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['All Classes'],
    },
    {
      id: `cal-${schoolId}-indep`,
      date: '2026-08-15',
      title: 'Independence Day',
      type: 'Holiday',
      source: src,
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-half-yearly`,
      date: '2026-09-14',
      endDate: '2026-09-25',
      title: 'Half-Yearly / Term-1 Examinations',
      type: 'Examination',
      source: src,
      affectedClasses: ['All Classes'],
    },
    {
      id: `cal-${schoolId}-gandhi`,
      date: '2026-10-02',
      title: 'Gandhi Jayanti',
      type: 'Holiday',
      source: src,
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-diwali`,
      date: '2026-11-06',
      endDate: '2026-11-10',
      title: 'Diwali & Govardhan Break',
      type: 'Vacation',
      source: src,
    },
    {
      id: `cal-${schoolId}-ut3`,
      date: '2026-11-26',
      endDate: '2026-11-28',
      title: 'Unit Test 3 (Periodic Assessment III)',
      type: 'Examination',
      source: 'School Custom',
      affectedClasses: ['Classes 1–12'],
      description: 'Pre-winter syllabus checkpoint across core subjects.',
    },
    {
      id: `cal-${schoolId}-ptm-nov`,
      date: '2026-11-28',
      title: 'Parent-Teacher Meeting (Term II Progress)',
      type: 'PTM',
      source: 'School Custom',
      timeRange: '09:00 AM – 01:00 PM',
    },
    {
      id: `cal-${schoolId}-science-ex`,
      date: '2026-11-27',
      title: 'Inter-House Science & Robotics Exhibition',
      type: 'Event',
      source: 'School Custom',
      description: 'Campus STEM showcase and model demonstrations.',
    },
    {
      id: `cal-${schoolId}-winter-vac`,
      date: '2027-01-01',
      endDate: '2027-01-12',
      title: 'Winter Vacation (Haryana / North India)',
      type: 'Vacation',
      source: src,
    },
    {
      id: `cal-${schoolId}-republic`,
      date: '2027-01-26',
      title: 'Republic Day',
      type: 'Holiday',
      source: src,
      isLockedOfficial: true,
    },
    {
      id: `cal-${schoolId}-syllabus-lock`,
      date: '2027-02-05',
      title: 'Full Syllabus Completion & Revision Window Start',
      type: 'Academic Deadline',
      source: 'School Custom',
    },
    {
      id: `cal-${schoolId}-board-exam`,
      date: boardExamDate,
      endDate: boardExamEnd,
      title: `${board} Official Board Examinations (Classes 10 & 12)`,
      type: 'Board Exam',
      source: src,
      isLockedOfficial: true,
      affectedClasses: ['10-A', '12-Arts', '12-Commerce', '12-Science'],
      description: `Locked external ${board} examination window — cannot be auto-moved without explicit authority override.`,
    },
  ];
}

export function buildDefaultBoardCirculars(board: BoardType, schoolId: string): BoardCircularNotice[] {
  return [
    {
      id: `circ-${schoolId}-1`,
      board,
      circularNo: board === 'HBSE' ? 'HBSE/ACAD/2026-27/114' : 'CBSE/ACAD/2026/89',
      publishedDate: '2026-11-20',
      title: `${board} Practical Assessment & Internal Marks Upload Window`,
      summary: `Recommended campus window for Class 10 & 12 internal/practical verification prior to final ${board} datesheet.`,
      suggestedDate: '2027-01-18',
      suggestedEndDate: '2027-01-24',
      suggestedType: 'Examination',
      acknowledged: false,
    },
    {
      id: `circ-${schoolId}-2`,
      board,
      circularNo: board === 'HBSE' ? 'DSE-HRY/2026/WIN-04' : 'CBSE/ADMIN/2026/102',
      publishedDate: '2026-11-24',
      title: 'Cold-Wave & Air-Quality Contingency Advisory (Buffer Days)',
      summary: 'Schools advised to preserve 5 instructional buffer days and review chapter recovery timelines before declaring weather closures.',
      suggestedDate: '2026-12-26',
      suggestedEndDate: '2026-12-28',
      suggestedType: 'Holiday',
      acknowledged: false,
    },
  ];
}

export function buildDefaultCurriculumPlans(schoolId: string): CurriculumChapterSchedule[] {
  return [
    {
      id: `cur-${schoolId}-7a-sci-1`,
      schoolId,
      classSection: '7-A',
      subject: 'Science',
      chapterNumber: 1,
      chapterTitle: 'Nutrition in Plants',
      plannedPeriods: 6,
      completedPeriods: 6,
      plannedCompletionDate: '2026-07-10',
      examWindowDate: '2026-12-18',
      status: 'Completed',
    },
    {
      id: `cur-${schoolId}-7a-sci-2`,
      schoolId,
      classSection: '7-A',
      subject: 'Science',
      chapterNumber: 4,
      chapterTitle: 'Heat & Thermal Transfer',
      plannedPeriods: 7,
      completedPeriods: 7,
      plannedCompletionDate: '2026-07-25',
      examWindowDate: '2026-12-18',
      status: 'Completed',
    },
    {
      id: `cur-${schoolId}-7a-sci-3`,
      schoolId,
      classSection: '7-A',
      subject: 'Science',
      chapterNumber: 5,
      chapterTitle: 'Acids, Bases and Salts',
      plannedPeriods: 7,
      completedPeriods: 7,
      plannedCompletionDate: '2026-08-15',
      examWindowDate: '2026-12-18',
      status: 'Completed',
    },
    {
      id: `cur-${schoolId}-7a-sci-4`,
      schoolId,
      classSection: '7-A',
      subject: 'Science',
      chapterNumber: 11,
      chapterTitle: 'Light — Reflection & Spherical Mirrors',
      plannedPeriods: 8,
      completedPeriods: 5,
      plannedCompletionDate: '2026-11-28',
      examWindowDate: '2026-12-18',
      status: 'In Progress',
    },
    {
      id: `cur-${schoolId}-7a-sci-5`,
      schoolId,
      classSection: '7-A',
      subject: 'Science',
      chapterNumber: 12,
      chapterTitle: 'Electric Current and Its Effects',
      plannedPeriods: 8,
      completedPeriods: 0,
      plannedCompletionDate: '2026-12-15',
      examWindowDate: '2027-02-05',
      status: 'Planned',
    },
    {
      id: `cur-${schoolId}-10a-sci-1`,
      schoolId,
      classSection: '10-A',
      subject: 'Science',
      chapterNumber: 10,
      chapterTitle: 'Light: Reflection & Refraction',
      plannedPeriods: 10,
      completedPeriods: 7,
      plannedCompletionDate: '2026-11-30',
      examWindowDate: '2027-01-15',
      teacherName: 'Pooja Dhillon',
      status: 'In Progress',
    },
    {
      id: `cur-${schoolId}-10a-math-1`,
      schoolId,
      classSection: '10-A',
      subject: 'Maths',
      chapterNumber: 8,
      chapterTitle: 'Introduction to Trigonometry',
      plannedPeriods: 12,
      completedPeriods: 8,
      plannedCompletionDate: '2026-12-02',
      examWindowDate: '2027-01-15',
      status: 'In Progress',
    },
    {
      id: `cur-${schoolId}-6a-sci-1`,
      schoolId,
      classSection: '6-A',
      subject: 'Science',
      chapterNumber: 1,
      chapterTitle: 'Components of Food',
      plannedPeriods: 6,
      completedPeriods: 6,
      plannedCompletionDate: '2026-07-15',
      examWindowDate: '2026-12-18',
      status: 'Completed',
    },
    {
      id: `cur-${schoolId}-6a-eng-1`,
      schoolId,
      classSection: '6-A',
      subject: 'English',
      chapterNumber: 7,
      chapterTitle: 'Fair Play & Comprehension Skills',
      plannedPeriods: 6,
      completedPeriods: 3,
      plannedCompletionDate: '2026-11-29',
      examWindowDate: '2026-12-18',
      status: 'Partially Completed',
    },
  ];
}

export function createInitialAcademicCalendar(params: {
  schoolId: string;
  board: BoardType;
  session?: string;
  mode?: CalendarCreationMode;
  createdBy?: string;
}): AcademicCalendarState {
  const mode = params.mode || 'Hybrid';
  const session = params.session || '2026-27';
  const nowIso = new Date().toISOString();
  const entries =
    mode === 'Manual' ? [] : buildBoardReferenceEntries(params.board, params.schoolId);
  const curriculumPlans = buildDefaultCurriculumPlans(params.schoolId);
  const boardCirculars = buildDefaultBoardCirculars(params.board, params.schoolId);

  return {
    schoolId: params.schoolId,
    session,
    board: params.board,
    creationMode: mode,
    sessionStartDate: '2026-04-01',
    sessionEndDate: '2027-03-31',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    bufferDays: 8,
    currentVersion: 1,
    updatedAt: nowIso,
    updatedBy: params.createdBy || 'Academic Coordinator',
    entries,
    curriculumPlans,
    boardCirculars,
    pendingDrafts: [],
    versions: [
      {
        version: 1,
        publishedAt: nowIso,
        publishedBy: params.createdBy || 'Academic Coordinator',
        reason: `Initial ${mode} ${params.board} calendar created for Session ${session}`,
        mode,
        summary: `${entries.length} scheduled dates · ${curriculumPlans.length} linked curriculum chapters`,
        entriesSnapshot: JSON.parse(JSON.stringify(entries)),
        curriculumSnapshot: JSON.parse(JSON.stringify(curriculumPlans)),
      },
    ],
    notifications: [],
  };
}

export interface WorkingDaysMetrics {
  totalSessionDays: number;
  nonWorkingWeekends: number;
  holidayAndVacationDays: number;
  examinationDays: number;
  eventAndPtmDays: number;
  instructionalTeachingDays: number;
  bufferDays: number;
}

export function computeWorkingDaysMetrics(calendar: AcademicCalendarState): WorkingDaysMetrics {
  const allDates = enumerateIsoDates(calendar.sessionStartDate, calendar.sessionEndDate);
  const workingDaySet = new Set(calendar.workingDays);

  const holidayDates = new Set<string>();
  const examDates = new Set<string>();
  const eventPtmDates = new Set<string>();

  for (const entry of calendar.entries) {
    const dates = enumerateIsoDates(entry.date, entry.endDate);
    for (const d of dates) {
      if (isHolidayOrVacationType(entry.type)) holidayDates.add(d);
      else if (entry.type === 'Examination' || entry.type === 'Board Exam') examDates.add(d);
      else if (entry.type === 'Event' || entry.type === 'PTM') eventPtmDates.add(d);
    }
  }

  let nonWorkingWeekends = 0;
  let holidayAndVacationDays = 0;
  let examinationDays = 0;
  let eventAndPtmDays = 0;
  let instructionalTeachingDays = 0;

  for (const iso of allDates) {
    const dayCode = dateToTimetableDay(iso);
    const isWorkingWeekday = dayCode !== null && workingDaySet.has(dayCode);
    if (!isWorkingWeekday) {
      nonWorkingWeekends += 1;
      continue;
    }
    if (holidayDates.has(iso)) {
      holidayAndVacationDays += 1;
      continue;
    }
    if (examDates.has(iso)) {
      examinationDays += 1;
      continue;
    }
    if (eventPtmDates.has(iso)) {
      eventAndPtmDays += 1;
    }
    instructionalTeachingDays += 1;
  }

  return {
    totalSessionDays: allDates.length,
    nonWorkingWeekends,
    holidayAndVacationDays,
    examinationDays,
    eventAndPtmDays,
    instructionalTeachingDays,
    bufferDays: calendar.bufferDays,
  };
}

function findNextAvailableWorkingDate(
  fromDateIso: string,
  workingDays: Set<string>,
  blockedDates: Set<string>,
): string {
  let candidate = addDaysIso(fromDateIso, 1);
  for (let i = 0; i < 60; i += 1) {
    const day = dateToTimetableDay(candidate);
    if (day && workingDays.has(day) && !blockedDates.has(candidate)) {
      return candidate;
    }
    candidate = addDaysIso(candidate, 1);
  }
  return candidate;
}

/**
 * Intelligent Impact Analysis & Rescheduling Engine:
 * Evaluates a proposed calendar modification against the school's timetable,
 * curriculum chapters (based on actual completed periods), examinations, PTMs,
 * school events, lesson plans, and locked board exams.
 */
export function analyzeCalendarModificationImpact(params: {
  calendar: AcademicCalendarState;
  proposedEntry: AcademicCalendarEntry;
  actionType: 'Add' | 'Update' | 'Remove';
  timetable: TimetableSlot[];
  schoolEvents?: SchoolEvent[];
  lessonPlans?: LessonPlan[];
}): CalendarImpactReport {
  const { calendar, proposedEntry, actionType } = params;
  const workingDaySet = new Set(calendar.workingDays);
  const modifiedDates = enumerateIsoDates(proposedEntry.date, proposedEntry.endDate);
  const modifiedDateSet = new Set(modifiedDates);

  // Build existing holiday/exam blocked set for smart next-slot finding
  const blockedDates = new Set<string>(modifiedDates);
  for (const e of calendar.entries) {
    if (e.id === proposedEntry.id) continue;
    if (isHolidayOrVacationType(e.type) || e.type === 'Examination' || e.type === 'Board Exam') {
      for (const d of enumerateIsoDates(e.date, e.endDate)) blockedDates.add(d);
    }
  }

  const affectedWorkingDays = modifiedDates.filter((iso) => {
    const day = dateToTimetableDay(iso);
    return day !== null && workingDaySet.has(day);
  });

  const isClosureAddition =
    actionType !== 'Remove' && isHolidayOrVacationType(proposedEntry.type);
  const instructionalDaysDelta = isClosureAddition
    ? -affectedWorkingDays.length
    : actionType === 'Remove' && isHolidayOrVacationType(proposedEntry.type)
      ? affectedWorkingDays.length
      : proposedEntry.type === 'Working Day' || proposedEntry.type === 'Special Instructional Day'
        ? affectedWorkingDays.length
        : 0;

  const schoolSlots = params.timetable.filter((s) => s.schoolId === calendar.schoolId);
  const affectedDayCodes = affectedWorkingDays
    .map((iso) => dateToTimetableDay(iso))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  // Subject-wise period loss calculated directly from the school's master timetable
  const deficitMap = new Map<string, { classSection: string; subject: string; periodsLost: number }>();
  let totalAffectedPeriods = 0;

  if (isClosureAddition) {
    for (const dayCode of affectedDayCodes) {
      const slotsForDay = schoolSlots.filter((s) => normalizeTimetableDay(s.day) === dayCode);
      for (const slot of slotsForDay) {
        totalAffectedPeriods += 1;
        const key = `${slot.classSection}::${slot.subject}`;
        const prev = deficitMap.get(key);
        if (prev) prev.periodsLost += 1;
        else {
          deficitMap.set(key, {
            classSection: slot.classSection,
            subject: slot.subject,
            periodsLost: 1,
          });
        }
      }
    }
  }

  const affectedSubjectDeficits = Array.from(deficitMap.values())
    .sort((a, b) => b.periodsLost - a.periodsLost)
    .slice(0, 12)
    .map((d) => {
      const extraPerWeek = Math.max(1, Math.ceil(d.periodsLost / 2));
      return {
        ...d,
        recommendedExtraPeriodsPerWeek: extraPerWeek,
        recoveryStrategy: `Add +${extraPerWeek} period/week or reallocate ${Math.min(2, d.periodsLost)} activity/buffer periods to protect revision window.`,
      };
    });

  const affectedItems: CalendarImpactAffectedItem[] = [];
  const conflicts: CalendarConflictWarning[] = [];

  // 1. Check existing calendar entries colliding with modified dates
  for (const entry of calendar.entries) {
    if (entry.id === proposedEntry.id) continue;
    const entryDates = enumerateIsoDates(entry.date, entry.endDate);
    const overlapping = entryDates.filter((d) => modifiedDateSet.has(d));
    if (overlapping.length === 0) continue;

    const category: CalendarImpactAffectedItem['category'] =
      entry.type === 'Examination' || entry.type === 'Board Exam'
        ? 'Examination'
        : entry.type === 'PTM'
          ? 'PTM'
          : 'Event';

    if (entry.isLockedOfficial) {
      conflicts.push({
        id: `conf-lock-${entry.id}`,
        severity: 'High',
        date: overlapping[0],
        message: `Conflict with locked official ${entry.source} entry "${entry.title}" on ${overlapping[0]}. Cannot be auto-moved without explicit authority approval.`,
        lockedOfficialConflict: true,
      });
      affectedItems.push({
        id: `aff-entry-${entry.id}`,
        category,
        title: entry.title,
        originalDate: entry.date,
        proposedDate: entry.date, // Locked: never auto-moved!
        isLockedOfficial: true,
        recoveryAction: 'Locked official date preserved — requires authorized manual override to modify.',
        approved: false,
      });
    } else if (isClosureAddition || proposedEntry.type === 'Examination' || proposedEntry.type === 'PTM') {
      const proposedNext = findNextAvailableWorkingDate(
        proposedEntry.endDate || proposedEntry.date,
        workingDaySet,
        blockedDates,
      );
      blockedDates.add(proposedNext);
      conflicts.push({
        id: `conf-ov-${entry.id}`,
        severity: category === 'Examination' ? 'High' : 'Medium',
        date: overlapping[0],
        message: `"${entry.title}" (${entry.type}) overlaps with "${proposedEntry.title}" on ${overlapping[0]}.`,
      });
      affectedItems.push({
        id: `aff-entry-${entry.id}`,
        category,
        title: entry.title,
        originalDate: entry.date,
        proposedDate: proposedNext,
        recoveryAction:
          category === 'Examination'
            ? `Shift examination to next conflict-free window (${proposedNext}) preserving revision days.`
            : category === 'PTM'
              ? `Reschedule PTM to ${proposedNext} after verifying faculty & parent availability.`
              : `Move event to ${proposedNext} without disturbing scheduled examinations.`,
        approved: true,
      });
    }
  }

  // 2. Check linked School Events from db.schoolEvents
  for (const ev of (params.schoolEvents || []).filter((e) => e.schoolId === calendar.schoolId)) {
    if (!modifiedDateSet.has(ev.eventDate)) continue;
    const proposedNext = findNextAvailableWorkingDate(
      proposedEntry.endDate || proposedEntry.date,
      workingDaySet,
      blockedDates,
    );
    blockedDates.add(proposedNext);
    conflicts.push({
      id: `conf-schoolev-${ev.id}`,
      severity: 'Medium',
      date: ev.eventDate,
      message: `Campus event "${ev.title}" (${ev.category}) falls inside modified range on ${ev.eventDate}.`,
    });
    affectedItems.push({
      id: `aff-schoolev-${ev.id}`,
      category: 'Event',
      title: ev.title,
      originalDate: ev.eventDate,
      proposedDate: proposedNext,
      recoveryAction: `Reschedule campus event to ${proposedNext} and notify event coordinator (${ev.dedicatedCoordinatorName}).`,
      approved: true,
    });
  }

  // 3. Check Curriculum Chapters (based on actual incomplete periods, not just dates!)
  if (isClosureAddition && affectedWorkingDays.length > 0) {
    const windowEnd = addDaysIso(proposedEntry.endDate || proposedEntry.date, 7);
    for (const ch of calendar.curriculumPlans) {
      const remainingPeriods = Math.max(0, ch.plannedPeriods - ch.completedPeriods);
      if (remainingPeriods === 0 || ch.status === 'Completed') continue;
      if (ch.plannedCompletionDate >= proposedEntry.date && ch.plannedCompletionDate <= windowEnd) {
        const deficitKey = `${ch.classSection}::${ch.subject}`;
        const lost = deficitMap.get(deficitKey)?.periodsLost ?? Math.min(remainingPeriods, Math.max(1, Math.ceil(affectedWorkingDays.length * 0.6)));
        const revisedTarget = findNextAvailableWorkingDate(
          addDaysIso(ch.plannedCompletionDate, affectedWorkingDays.length),
          workingDaySet,
          new Set<string>(),
        );
        const preservesExam = !ch.examWindowDate || revisedTarget < ch.examWindowDate;
        affectedItems.push({
          id: `aff-cur-${ch.id}`,
          category: 'Curriculum Chapter',
          title: `Ch ${ch.chapterNumber}: ${ch.chapterTitle}`,
          classSection: ch.classSection,
          subject: ch.subject,
          originalDate: ch.plannedCompletionDate,
          proposedDate: revisedTarget,
          periodsAffected: lost,
          recoveryAction: preservesExam
            ? `Recover ${lost} periods via +1 period/week or 2 activity periods; target shifts to ${revisedTarget} while preserving exam revision window.`
            : `URGENT: Exam window (${ch.examWindowDate}) at risk — assign ${Math.min(lost, 2)} remedial/buffer periods immediately.`,
          approved: true,
        });
      }
    }
  }

  // 4. Check Lesson Plans if any match
  if (isClosureAddition && Array.isArray(params.lessonPlans)) {
    for (const lp of params.lessonPlans.filter((l) => l.schoolId === calendar.schoolId && l.status !== 'Completed')) {
      affectedItems.push({
        id: `aff-lp-${lp.id}`,
        category: 'Lesson Plan',
        title: `${lp.classSection} ${lp.subject} — ${lp.topic}`,
        classSection: lp.classSection,
        subject: lp.subject,
        originalDate: proposedEntry.date,
        proposedDate: findNextAvailableWorkingDate(
          proposedEntry.endDate || proposedEntry.date,
          workingDaySet,
          blockedDates,
        ),
        recoveryAction: 'Shift teacher planner sequence forward into next available subject slot.',
        approved: true,
      });
    }
  }

  const recoverySummary = isClosureAddition
    ? `${affectedWorkingDays.length} instructional day(s) lost across ${totalAffectedPeriods} timetabled periods. ${affectedItems.length} academic activities/chapters analyzed with proposed conflict-free recovery dates.`
    : `Calendar modification spans ${modifiedDates.length} day(s) with ${conflicts.length} detected schedule conflict(s).`;

  return {
    instructionalDaysDelta,
    totalAffectedPeriods,
    affectedSubjectDeficits,
    affectedItems,
    conflicts,
    recoverySummary,
  };
}

/**
 * Applies an approved CalendarModificationDraft to the school's AcademicCalendarState,
 * increments version history with full rollback snapshot, updates curriculum targets,
 * and returns notifications + linked event date updates.
 */
export function applyApprovedCalendarDraft(params: {
  calendar: AcademicCalendarState;
  draft: CalendarModificationDraft;
  approvedBy: string;
  itemOverrides?: Record<string, { approved?: boolean; customDate?: string }>;
  allowLockedOverride?: boolean;
}): {
  updatedCalendar: AcademicCalendarState;
  eventDateUpdates: Array<{ eventTitle: string; originalDate: string; newDate: string }>;
  notification: CalendarChangeNotification;
} {
  const { calendar, draft, approvedBy, itemOverrides = {}, allowLockedOverride = false } = params;
  const nowIso = new Date().toISOString();

  // Deep-clone entries & curriculum so version snapshots remain immutable
  const nextEntries: AcademicCalendarEntry[] = JSON.parse(JSON.stringify(calendar.entries));
  const nextCurriculum: CurriculumChapterSchedule[] = JSON.parse(
    JSON.stringify(calendar.curriculumPlans),
  );

  // 1. Apply the primary modification entry
  if (draft.actionType === 'Remove') {
    const idx = nextEntries.findIndex((e) => e.id === draft.proposedEntry.id);
    if (idx >= 0) {
      if (!nextEntries[idx].isLockedOfficial || allowLockedOverride) {
        nextEntries.splice(idx, 1);
      }
    }
  } else {
    const idx = nextEntries.findIndex((e) => e.id === draft.proposedEntry.id);
    if (idx >= 0) {
      nextEntries[idx] = { ...draft.proposedEntry };
    } else {
      nextEntries.push({ ...draft.proposedEntry });
    }
  }

  const changedItems: Array<{ title: string; before: string; after: string }> = [
    {
      title: draft.proposedEntry.title,
      before: draft.actionType === 'Add' ? 'Not scheduled' : draft.proposedEntry.date,
      after:
        draft.actionType === 'Remove'
          ? 'Removed'
          : draft.proposedEntry.endDate
            ? `${draft.proposedEntry.date} → ${draft.proposedEntry.endDate} (${draft.proposedEntry.type})`
            : `${draft.proposedEntry.date} (${draft.proposedEntry.type})`,
    },
  ];
  const eventDateUpdates: Array<{ eventTitle: string; originalDate: string; newDate: string }> = [];

  // 2. Apply approved rescheduled items (respecting locked official protection)
  for (const item of draft.impactReport.affectedItems) {
    const override = itemOverrides[item.id];
    const isApproved = override?.approved ?? item.approved;
    if (!isApproved) continue;
    if (item.isLockedOfficial && !allowLockedOverride) continue;

    const targetDate = override?.customDate?.trim() || item.proposedDate;
    if (targetDate === item.originalDate) continue;

    if (item.id.startsWith('aff-entry-')) {
      const entryId = item.id.replace('aff-entry-', '');
      const target = nextEntries.find((e) => e.id === entryId);
      if (target) {
        const spanDays = target.endDate
          ? Math.max(0, enumerateIsoDates(target.date, target.endDate).length - 1)
          : 0;
        target.date = targetDate;
        if (target.endDate) target.endDate = addDaysIso(targetDate, spanDays);
        changedItems.push({ title: target.title, before: item.originalDate, after: targetDate });
      }
    } else if (item.id.startsWith('aff-schoolev-')) {
      eventDateUpdates.push({
        eventTitle: item.title,
        originalDate: item.originalDate,
        newDate: targetDate,
      });
      changedItems.push({ title: item.title, before: item.originalDate, after: targetDate });
    } else if (item.id.startsWith('aff-cur-')) {
      const curId = item.id.replace('aff-cur-', '');
      const chapter = nextCurriculum.find((c) => c.id === curId);
      if (chapter) {
        chapter.revisedCompletionDate = targetDate;
        chapter.status =
          chapter.examWindowDate && targetDate >= chapter.examWindowDate ? 'At Risk' : 'In Progress';
        chapter.lastUpdatedAt = nowIso;
        chapter.lastUpdatedBy = approvedBy;
        changedItems.push({
          title: `${chapter.classSection} ${chapter.subject} (${chapter.chapterTitle})`,
          before: item.originalDate,
          after: targetDate,
        });
      }
    }
  }

  nextEntries.sort((a, b) => a.date.localeCompare(b.date));
  const nextVersionNum = calendar.currentVersion + 1;

  const notification: CalendarChangeNotification = {
    id: `cal-ntf-${Date.now().toString(36)}`,
    schoolId: calendar.schoolId,
    createdAt: nowIso,
    audience: ['Teachers', 'Coordinators', 'Management', 'Parents'],
    title: `Academic Calendar v${nextVersionNum} Published — ${draft.proposedEntry.title}`,
    summary: `${approvedBy} approved ${changedItems.length} schedule update(s). Reason: ${draft.reason}`,
    changedItems,
  };

  const nextDrafts = calendar.pendingDrafts.map((d) =>
    d.id === draft.id
      ? { ...d, status: 'Approved' as const, reviewedBy: approvedBy, reviewedAt: nowIso }
      : d,
  );

  const updatedCalendar: AcademicCalendarState = {
    ...calendar,
    currentVersion: nextVersionNum,
    updatedAt: nowIso,
    updatedBy: approvedBy,
    entries: nextEntries,
    curriculumPlans: nextCurriculum,
    pendingDrafts: nextDrafts,
    versions: [
      {
        version: nextVersionNum,
        publishedAt: nowIso,
        publishedBy: approvedBy,
        reason: draft.reason,
        mode: calendar.creationMode,
        summary: `${changedItems.length} change(s) applied · ${draft.reschedulingMode} rescheduling`,
        entriesSnapshot: JSON.parse(JSON.stringify(nextEntries)),
        curriculumSnapshot: JSON.parse(JSON.stringify(nextCurriculum)),
      },
      ...calendar.versions,
    ].slice(0, 25),
    notifications: [notification, ...calendar.notifications].slice(0, 40),
  };

  return { updatedCalendar, eventDateUpdates, notification };
}

export function rollbackAcademicCalendarToVersion(params: {
  calendar: AcademicCalendarState;
  targetVersion: number;
  rolledBackBy: string;
  reason?: string;
}): AcademicCalendarState | null {
  const { calendar, targetVersion, rolledBackBy, reason } = params;
  const snapshot = calendar.versions.find((v) => v.version === targetVersion);
  if (!snapshot) return null;

  const nowIso = new Date().toISOString();
  const nextVersionNum = calendar.currentVersion + 1;
  const restoredEntries: AcademicCalendarEntry[] = JSON.parse(
    JSON.stringify(snapshot.entriesSnapshot),
  );
  const restoredCurriculum: CurriculumChapterSchedule[] = JSON.parse(
    JSON.stringify(snapshot.curriculumSnapshot),
  );

  return {
    ...calendar,
    currentVersion: nextVersionNum,
    updatedAt: nowIso,
    updatedBy: rolledBackBy,
    entries: restoredEntries,
    curriculumPlans: restoredCurriculum,
    versions: [
      {
        version: nextVersionNum,
        publishedAt: nowIso,
        publishedBy: rolledBackBy,
        reason: reason || `Rolled back to Version v${targetVersion}`,
        mode: snapshot.mode,
        summary: `Restored calendar snapshot from v${targetVersion} (${restoredEntries.length} entries)`,
        entriesSnapshot: JSON.parse(JSON.stringify(restoredEntries)),
        curriculumSnapshot: JSON.parse(JSON.stringify(restoredCurriculum)),
      },
      ...calendar.versions,
    ].slice(0, 25),
    notifications: [
      {
        id: `cal-ntf-rb-${Date.now().toString(36)}`,
        schoolId: calendar.schoolId,
        createdAt: nowIso,
        audience: ['Teachers', 'Coordinators', 'Management'] as Array<
          'Teachers' | 'Coordinators' | 'Management' | 'Parents'
        >,
        title: `Academic Calendar Restored to v${targetVersion} (now v${nextVersionNum})`,
        summary: `${rolledBackBy} rolled back the academic calendar. Reason: ${reason || 'Administrative restoration'}`,
        changedItems: [
          {
            title: 'Active Calendar Version',
            before: `v${calendar.currentVersion}`,
            after: `Restored v${targetVersion} as v${nextVersionNum}`,
          },
        ],
      },
      ...calendar.notifications,
    ].slice(0, 40),
  };
}
