import type { BoardType } from '../types';

export type ClassroomFacility =
  | 'Smart Board'
  | 'Projector'
  | 'Science Lab'
  | 'Computer Lab'
  | 'Audio System'
  | 'AC';

export type ClassroomMaintenanceStatus = 'Active' | 'Maintenance' | 'Reserved';

export interface SchoolClassroom {
  id: string;
  schoolId: string;
  roomNumber: string;
  name: string;
  floor: string;
  building: string;
  capacity: number;
  facilities: ClassroomFacility[];
  maintenanceStatus: ClassroomMaintenanceStatus;
  maintenanceNote?: string;
  reservedBy?: string;
  reservedUntil?: string; // HH:mm
}

export type PeriodCheckInStatus = 'verified_teaching' | 'verified_vacant' | 'admin_override';

export interface PeriodCheckInRecord {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  period: number;
  classSection: string;
  roomNumber: string;
  teacherName: string;
  subject: string;
  status: PeriodCheckInStatus;
  verifiedBy: string;
  verifiedAt: string; // ISO timestamp
  note?: string;
}

export type TeacherDutyType =
  | 'Meeting'
  | 'Assigned Duty'
  | 'Exam Invigilation'
  | 'Assembly'
  | 'Event Duty';

export interface TeacherDutyRecord {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  teacherName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  period?: number;
  dutyType: TeacherDutyType;
  title: string;
  location?: string;
  createdBy: string;
  createdAt: string;
}

export interface BellPeriodSlot {
  id: string;
  label: string;
  kind: 'assembly' | 'period' | 'break' | 'diary';
  periodNumber?: number;
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
}

export type LiveTeacherStatus =
  | 'Teaching'
  | 'Free'
  | 'On Leave'
  | 'Absent'
  | 'Meeting'
  | 'Assigned Duty'
  | 'Substitution'
  | 'Not Yet Verified';

export type LiveClassroomOccupancyStatus =
  | 'Occupied (verified)'
  | 'Occupied (scheduled)'
  | 'Vacant (verified)'
  | 'Vacant (scheduled)'
  | 'Reserved'
  | 'Maintenance';

export type CalendarCreationMode = 'Automatic' | 'Manual' | 'Hybrid';

export type AcademicCalendarEntryType =
  | 'Holiday'
  | 'Working Day'
  | 'Examination'
  | 'Board Exam'
  | 'PTM'
  | 'Event'
  | 'Vacation'
  | 'Academic Deadline'
  | 'Special Instructional Day';

export interface AcademicCalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (inclusive)
  title: string;
  type: AcademicCalendarEntryType;
  source: 'CBSE Official' | 'HBSE Official' | 'School Custom';
  isLockedOfficial?: boolean;
  affectedClasses?: string[];
  timeRange?: string;
  description?: string;
}

export type CurriculumChapterStatus =
  | 'Completed'
  | 'In Progress'
  | 'Partially Completed'
  | 'Planned'
  | 'At Risk';

export interface CurriculumChapterSchedule {
  id: string;
  schoolId: string;
  classSection: string;
  subject: string;
  chapterNumber: number;
  chapterTitle: string;
  plannedPeriods: number;
  completedPeriods: number;
  plannedCompletionDate: string; // YYYY-MM-DD
  revisedCompletionDate?: string; // YYYY-MM-DD
  examWindowDate?: string; // YYYY-MM-DD
  teacherName?: string;
  status: CurriculumChapterStatus;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

export interface BoardCircularNotice {
  id: string;
  board: BoardType;
  circularNo: string;
  publishedDate: string;
  title: string;
  summary: string;
  suggestedDate: string;
  suggestedEndDate?: string;
  suggestedType: AcademicCalendarEntryType;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type CalendarReschedulingMode = 'Automatic' | 'Semi-Automatic' | 'Manual';

export interface CalendarImpactAffectedItem {
  id: string;
  category: 'Examination' | 'PTM' | 'Event' | 'Curriculum Chapter' | 'Lesson Plan' | 'Instructional Day';
  title: string;
  classSection?: string;
  subject?: string;
  originalDate: string;
  proposedDate: string;
  periodsAffected?: number;
  isLockedOfficial?: boolean;
  recoveryAction: string;
  approved: boolean;
}

export interface CalendarConflictWarning {
  id: string;
  severity: 'High' | 'Medium';
  date: string;
  message: string;
  lockedOfficialConflict?: boolean;
}

export interface CalendarImpactReport {
  instructionalDaysDelta: number;
  totalAffectedPeriods: number;
  affectedSubjectDeficits: Array<{
    classSection: string;
    subject: string;
    periodsLost: number;
    recommendedExtraPeriodsPerWeek: number;
    recoveryStrategy: string;
  }>;
  affectedItems: CalendarImpactAffectedItem[];
  conflicts: CalendarConflictWarning[];
  recoverySummary: string;
}

export interface CalendarModificationDraft {
  id: string;
  schoolId: string;
  createdAt: string;
  createdBy: string;
  reason: string;
  reschedulingMode: CalendarReschedulingMode;
  actionType: 'Add' | 'Update' | 'Remove';
  proposedEntry: AcademicCalendarEntry;
  impactReport: CalendarImpactReport;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AcademicCalendarVersion {
  version: number;
  publishedAt: string;
  publishedBy: string;
  reason: string;
  mode: CalendarCreationMode;
  summary: string;
  entriesSnapshot: AcademicCalendarEntry[];
  curriculumSnapshot: CurriculumChapterSchedule[];
}

export interface CalendarChangeNotification {
  id: string;
  schoolId: string;
  createdAt: string;
  audience: Array<'Teachers' | 'Coordinators' | 'Management' | 'Parents'>;
  title: string;
  summary: string;
  changedItems: Array<{ title: string; before: string; after: string }>;
}

export interface AcademicCalendarState {
  schoolId: string;
  session: string;
  board: BoardType;
  creationMode: CalendarCreationMode;
  sessionStartDate: string; // YYYY-MM-DD
  sessionEndDate: string; // YYYY-MM-DD
  workingDays: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>;
  bufferDays: number;
  currentVersion: number;
  updatedAt: string;
  updatedBy: string;
  entries: AcademicCalendarEntry[];
  curriculumPlans: CurriculumChapterSchedule[];
  boardCirculars: BoardCircularNotice[];
  pendingDrafts: CalendarModificationDraft[];
  versions: AcademicCalendarVersion[];
  notifications: CalendarChangeNotification[];
}

export interface ControlRoomWorkspaceBundle {
  classrooms: SchoolClassroom[];
  bellSchedule: BellPeriodSlot[];
  periodCheckIns: PeriodCheckInRecord[];
  teacherDuties: TeacherDutyRecord[];
}
