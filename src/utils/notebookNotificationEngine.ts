import type {
  NotebookEntry,
  NotebookIncompleteNotification,
  StudentRecord,
  UserRole,
} from '../types';
import {
  getNotebookEntryStatus,
  parseChapterNumberAndName,
} from './notebookAnalyticsEngine.ts';
import type { PriorChapterGapItem } from './pendingCheckingEngine';

function slugifySegment(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'item'
  );
}

function ensureSentencePunctuation(text: string, suffix: '.' | '।'): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (/[.!?।]$/.test(trimmed)) return trimmed;
  return `${trimmed}${suffix}`;
}

/**
 * Deterministic ID per school + student + checking date + subject + chapter.
 * Ensures re-saving a class batch updates the alert in place rather than spamming duplicates.
 */
export function buildNotebookNotificationId(
  schoolId: string,
  studentId: string,
  date: string,
  subject: string,
  chapter: string,
): string {
  return `nbalert-${schoolId}-${studentId}-${date}-${slugifySegment(subject)}-${slugifySegment(chapter)}`;
}

/**
 * Deterministic ID for a Prior-Chapter Backlog alert (e.g. Ch. 1 still Not Checked when teacher started Ch. 3).
 */
export function buildPriorChapterBacklogAlertId(
  schoolId: string,
  studentId: string,
  subject: string,
  missingChapterNum: number,
): string {
  return `nbgap-${schoolId}-${studentId}-${slugifySegment(subject)}-ch${missingChapterNum}`;
}

/**
 * Returns true whenever a notebook checking entry requires an automated alert
 * (homework marked incomplete / Not Complete, or notebook Not Checked / not submitted).
 */
export function shouldTriggerNotebookIncompleteAlert(
  entry: Pick<NotebookEntry, 'checked' | 'homeworkDone'>,
): boolean {
  return !entry.checked || !entry.homeworkDone;
}

/**
 * Composes a system-generated bilingual alert targeting BOTH the student and parent
 * whenever a teacher marks a notebook entry as Incomplete or Not Checked.
 */
export function composeNotebookIncompleteAlert(params: {
  schoolId: string;
  schoolName: string;
  student: Pick<
    StudentRecord,
    'id' | 'name' | 'classSection' | 'guardianName' | 'guardianPhone'
  >;
  entry: NotebookEntry;
  triggeredBy: string;
  triggeredByRole: UserRole | string;
  triggeredAt?: string;
  existing?: NotebookIncompleteNotification | null;
}): NotebookIncompleteNotification {
  const {
    schoolId,
    schoolName,
    student,
    entry,
    triggeredBy,
    triggeredByRole,
    triggeredAt = new Date().toISOString(),
    existing,
  } = params;

  const statusRaw = getNotebookEntryStatus(entry);
  const notebookStatus: 'Incomplete' | 'Not Checked' =
    statusRaw === 'Not Checked' ? 'Not Checked' : 'Incomplete';

  const parsedChapter = parseChapterNumberAndName(entry.chapter);
  const chapterDisplay =
    parsedChapter.chapterNo !== '—'
      ? `${parsedChapter.chapterNo}: ${parsedChapter.chapterName}`
      : parsedChapter.chapterName;

  const cleanRemarks = entry.remarks?.trim() || undefined;
  const remarkSuffixEn = cleanRemarks
    ? ` Teacher note: ${ensureSentencePunctuation(cleanRemarks, '.')}`
    : '';
  const remarkSuffixHi = cleanRemarks
    ? ` शिक्षक टिप्पणी: ${ensureSentencePunctuation(cleanRemarks, '।')}`
    : '';

  const statusLabelEn =
    notebookStatus === 'Not Checked' ? 'Not Submitted / Not Checked' : 'Incomplete';
  const statusLabelHi =
    notebookStatus === 'Not Checked'
      ? 'जाँच के लिए प्रस्तुत नहीं (Not Checked)'
      : 'अपूर्ण (Incomplete)';

  const title =
    notebookStatus === 'Not Checked'
      ? `Notebook Alert: ${entry.subject} (${chapterDisplay}) Not Checked`
      : `Incomplete Notebook Alert: ${entry.subject} (${chapterDisplay})`;

  const messageEn = `Dear ${student.guardianName}, during notebook checking on ${entry.date} at ${schoolName}, ${student.name} (Class ${student.classSection}) had ${entry.subject} — ${chapterDisplay} marked as ${statusLabelEn} by ${triggeredBy}.${remarkSuffixEn} Please ensure the pending chapter work is completed before the next check.`;

  const messageHi = `प्रिय ${student.guardianName}, दिनांक ${entry.date} को ${schoolName} में कॉपी जाँच के दौरान ${student.name} (कक्षा ${student.classSection}) की ${entry.subject} — ${chapterDisplay} की कॉपी ${triggeredBy} द्वारा ${statusLabelHi} दर्ज की गई है।${remarkSuffixHi} कृपया अगली जाँच से पहले शेष अध्याय कार्य पूर्ण करवाएँ।`;

  const studentMessage =
    notebookStatus === 'Not Checked'
      ? `Hi ${student.name}, your ${entry.subject} notebook (${chapterDisplay}) was marked Not Checked on ${entry.date} by ${triggeredBy}.${remarkSuffixEn} Please bring your completed notebook to class for re-checking.`
      : `Hi ${student.name}, your ${entry.subject} notebook for ${chapterDisplay} was marked Incomplete on ${entry.date} by ${triggeredBy}.${remarkSuffixEn} Please finish the remaining work and submit it for re-checking.`;

  const id =
    existing?.id ||
    buildNotebookNotificationId(
      schoolId,
      student.id,
      entry.date,
      entry.subject,
      entry.chapter,
    );

  const unchanged =
    existing &&
    existing.status === 'Active' &&
    existing.notebookStatus === notebookStatus &&
    (existing.teacherRemarks || '') === (cleanRemarks || '') &&
    existing.messageEn === messageEn;

  return {
    id,
    schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    notebookEntryId: entry.id,
    alertType: notebookStatus === 'Not Checked' ? 'unchecked_notebook' : 'incomplete_notebook',
    subject: entry.subject,
    chapter: entry.chapter,
    chapterNo: parsedChapter.chapterNo,
    chapterName: parsedChapter.chapterName,
    date: entry.date,
    notebookStatus,
    workQuality: entry.checked ? entry.workQuality : undefined,
    handwriting: entry.checked ? entry.handwriting : undefined,
    teacherRemarks: cleanRemarks,
    title,
    messageEn,
    messageHi,
    studentMessage,
    recipients: ['student', 'parent'],
    deliveryChannel: 'In-App Student & Parent Portal',
    triggeredBy,
    triggeredByRole: String(triggeredByRole),
    triggeredAt: unchanged ? existing.triggeredAt : triggeredAt,
    status: 'Active',
    resolvedAt: undefined,
    resolvedBy: undefined,
    readByStudent: unchanged ? existing.readByStudent : false,
    readByStudentAt: unchanged ? existing.readByStudentAt : undefined,
    acknowledgedByStudent: unchanged ? existing.acknowledgedByStudent : false,
    acknowledgedByStudentAt: unchanged ? existing.acknowledgedByStudentAt : undefined,
    readByParent: unchanged ? existing.readByParent : false,
    readByParentAt: unchanged ? existing.readByParentAt : undefined,
    acknowledgedByParent: unchanged ? existing.acknowledgedByParent : false,
    acknowledgedByParentAt: unchanged ? existing.acknowledgedByParentAt : undefined,
  };
}

/**
 * Composes a high-priority Prior-Chapter Backlog alert when a teacher has started a later
 * chapter (e.g. Ch. 3) while a student's earlier chapter (e.g. Ch. 1) is still NOT checked.
 */
export function composePriorChapterBacklogAlert(params: {
  schoolId: string;
  schoolName: string;
  student: Pick<
    StudentRecord,
    'id' | 'name' | 'classSection' | 'guardianName' | 'guardianPhone'
  >;
  gap: PriorChapterGapItem;
  triggeredBy: string;
  triggeredByRole: UserRole | string;
  triggeredAt?: string;
  existing?: NotebookIncompleteNotification | null;
}): NotebookIncompleteNotification {
  const {
    schoolId,
    schoolName,
    student,
    gap,
    triggeredBy,
    triggeredByRole,
    triggeredAt = new Date().toISOString(),
    existing,
  } = params;

  const missingDisplay = `${gap.missingChapterNo}: ${gap.missingChapterName}`;
  const gapWord = gap.chapterGap === 1 ? '1 chapter behind' : `${gap.chapterGap} chapters behind`;

  const title = `Prior Chapter Pending: ${gap.subject} ${gap.missingChapterNo} Not Checked (Class started ${gap.currentChapterLabel.split(':')[0]})`;

  const messageEn = `Dear ${student.guardianName}, in Class ${student.classSection} ${gap.subject} at ${schoolName}, the teacher has started ${gap.currentChapterLabel}, but ${student.name}'s earlier chapter (${missingDisplay}) is still Not Checked (${gapWord}). Please ensure the pending ${gap.missingChapterNo} notebook work is submitted for checking immediately.`;

  const messageHi = `प्रिय ${student.guardianName}, ${schoolName} की कक्षा ${student.classSection} के ${gap.subject} विषय में शिक्षक ने ${gap.currentChapterLabel} प्रारंभ कर दिया है, लेकिन ${student.name} का पिछला अध्याय (${missingDisplay}) अभी तक जाँचा नहीं गया है (Not Checked)। कृपया शीघ्र ही ${gap.missingChapterNo} की कॉपी जाँच के लिए प्रस्तुत करवाएँ।`;

  const studentMessage = `Hi ${student.name}, your class has started ${gap.currentChapterLabel} in ${gap.subject}, but your earlier ${missingDisplay} notebook is still Not Checked (${gapWord}). Please complete and submit ${gap.missingChapterNo} for checking right away.`;

  const id =
    existing?.id ||
    buildPriorChapterBacklogAlertId(
      schoolId,
      student.id,
      gap.subject,
      gap.missingChapterNum,
    );

  const unchanged =
    existing &&
    existing.status === 'Active' &&
    existing.currentClassChapter === gap.currentChapterLabel &&
    existing.chapterGap === gap.chapterGap;

  return {
    id,
    schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    notebookEntryId: `gap-${gap.subject}-${gap.missingChapterNum}`,
    alertType: 'prior_chapter_backlog',
    subject: gap.subject,
    chapter: gap.missingRawChapter,
    chapterNo: gap.missingChapterNo,
    chapterName: gap.missingChapterName,
    currentClassChapter: gap.currentChapterLabel,
    chapterGap: gap.chapterGap,
    date: gap.referenceDate,
    notebookStatus: 'Not Checked',
    teacherRemarks: `Class has moved to ${gap.currentChapterLabel}; ${gap.missingChapterNo} still pending check (${gapWord}).`,
    title,
    messageEn,
    messageHi,
    studentMessage,
    recipients: ['student', 'parent'],
    deliveryChannel: 'In-App Student & Parent Portal',
    triggeredBy,
    triggeredByRole: String(triggeredByRole),
    triggeredAt: unchanged ? existing.triggeredAt : triggeredAt,
    status: 'Active',
    resolvedAt: undefined,
    resolvedBy: undefined,
    readByStudent: unchanged ? existing.readByStudent : false,
    readByStudentAt: unchanged ? existing.readByStudentAt : undefined,
    acknowledgedByStudent: unchanged ? existing.acknowledgedByStudent : false,
    acknowledgedByStudentAt: unchanged ? existing.acknowledgedByStudentAt : undefined,
    readByParent: unchanged ? existing.readByParent : false,
    readByParentAt: unchanged ? existing.readByParentAt : undefined,
    acknowledgedByParent: unchanged ? existing.acknowledgedByParent : false,
    acknowledgedByParentAt: unchanged ? existing.acknowledgedByParentAt : undefined,
  };
}

/**
 * Automatically resolves an existing Active alert when a teacher re-saves the same
 * chapter entry as Complete.
 */
export function resolveNotebookIncompleteAlert(
  existing: NotebookIncompleteNotification,
  resolvedBy: string,
  resolvedAt = new Date().toISOString(),
): NotebookIncompleteNotification {
  return {
    ...existing,
    status: 'Resolved',
    resolvedBy,
    resolvedAt,
  };
}

export function sortNotebookNotifications(
  notifications: NotebookIncompleteNotification[],
): NotebookIncompleteNotification[] {
  return [...notifications].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'Active' ? -1 : 1;
    }
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.triggeredAt.localeCompare(a.triggeredAt);
  });
}

export function summarizeNotebookNotifications(
  notifications: NotebookIncompleteNotification[],
  viewerRole: UserRole | string = 'parent',
): {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  unreadForViewer: number;
  acknowledgedByParent: number;
  acknowledgedByStudent: number;
} {
  let activeAlerts = 0;
  let resolvedAlerts = 0;
  let unreadForViewer = 0;
  let acknowledgedByParent = 0;
  let acknowledgedByStudent = 0;

  for (const item of notifications) {
    if (item.status === 'Active') {
      activeAlerts += 1;
      if (viewerRole === 'student' && !item.readByStudent) {
        unreadForViewer += 1;
      } else if (viewerRole === 'parent' && !item.readByParent) {
        unreadForViewer += 1;
      }
    } else {
      resolvedAlerts += 1;
    }
    if (item.acknowledgedByParent) acknowledgedByParent += 1;
    if (item.acknowledgedByStudent) acknowledgedByStudent += 1;
  }

  return {
    totalAlerts: notifications.length,
    activeAlerts,
    resolvedAlerts,
    unreadForViewer,
    acknowledgedByParent,
    acknowledgedByStudent,
  };
}
