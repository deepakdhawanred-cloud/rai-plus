import type {
  ParentAttendanceNotification,
  StudentRecord,
  UserRole,
} from '../types';

export function buildAttendanceNotificationId(
  schoolId: string,
  date: string,
  studentId: string,
): string {
  return `attmsg-${schoolId}-${date}-${studentId}`;
}

export function composeParentAttendanceMessage(params: {
  schoolId: string;
  schoolName: string;
  student: Pick<
    StudentRecord,
    'id' | 'name' | 'classSection' | 'guardianName' | 'guardianPhone'
  >;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  contextNote?: string;
  customMessage?: string;
  sentBy: string;
  sentByRole: UserRole | string;
  sentAt?: string;
  existing?: ParentAttendanceNotification | null;
}): ParentAttendanceNotification {
  const {
    schoolId,
    schoolName,
    student,
    date,
    status,
    contextNote,
    customMessage,
    sentBy,
    sentByRole,
    sentAt = new Date().toISOString(),
    existing,
  } = params;

  const cleanNote = contextNote?.trim() || undefined;
  const cleanCustom = customMessage?.trim() || undefined;
  const combinedNote =
    cleanCustom && cleanNote && cleanCustom !== cleanNote
      ? `${cleanCustom} (${cleanNote})`
      : cleanCustom || cleanNote;

  const statusHi =
    status === 'Present' ? 'उपस्थित (Present)' : status === 'Absent' ? 'अनुपस्थित (Absent)' : 'स्वीकृत अवकाश (Leave)';

  const title =
    status === 'Present'
      ? `Daily Attendance: ${student.name} Marked Present (${date})`
      : status === 'Absent'
        ? `Attendance Alert: ${student.name} Marked Absent (${date})`
        : `Attendance Update: ${student.name} on Approved Leave (${date})`;

  const noteSuffixEn = combinedNote ? ` Teacher note: ${combinedNote}.` : '';
  const noteSuffixHi = combinedNote ? ` शिक्षक टिप्पणी: ${combinedNote}।` : '';

  let messageEn = '';
  let messageHi = '';

  if (status === 'Present') {
    messageEn = `Dear ${student.guardianName}, ${student.name} (Class ${student.classSection}) has arrived safely and is marked Present on ${date} at ${schoolName}.${noteSuffixEn}`;
    messageHi = `प्रिय ${student.guardianName}, ${student.name} (कक्षा ${student.classSection}) आज दिनांक ${date} को ${schoolName} में समय पर पहुँचकर ${statusHi} दर्ज किए गए हैं।${noteSuffixHi}`;
  } else if (status === 'Absent') {
    messageEn = `Dear ${student.guardianName}, ${student.name} (Class ${student.classSection}) is marked Absent during morning roll call on ${date} at ${schoolName}. Please confirm safety or share reason via the portal.${noteSuffixEn}`;
    messageHi = `प्रिय ${student.guardianName}, ${student.name} (कक्षा ${student.classSection}) आज दिनांक ${date} को ${schoolName} की सुबह की हाज़िरी में ${statusHi} दर्ज हुए हैं। कृपया सुरक्षा या अनुपस्थिति का कारण ऐप में साझा करें।${noteSuffixHi}`;
  } else {
    messageEn = `Dear ${student.guardianName}, ${student.name} (Class ${student.classSection}) has been recorded on Approved Leave on ${date} at ${schoolName}.${noteSuffixEn}`;
    messageHi = `प्रिय ${student.guardianName}, ${student.name} (कक्षा ${student.classSection}) आज दिनांक ${date} को ${schoolName} में ${statusHi} पर दर्ज हैं।${noteSuffixHi}`;
  }

  const unchanged =
    existing &&
    existing.attendanceStatus === status &&
    (existing.contextNote || '') === (combinedNote || '') &&
    existing.messageEn === messageEn;

  return {
    id: existing?.id || buildAttendanceNotificationId(schoolId, date, student.id),
    schoolId,
    studentId: student.id,
    studentName: student.name,
    classSection: student.classSection,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    date,
    attendanceStatus: status,
    title,
    messageEn,
    messageHi,
    contextNote: combinedNote,
    sentBy,
    sentByRole: String(sentByRole),
    sentAt,
    deliveryChannel: 'In-App Parent Portal',
    readByParent: unchanged ? existing.readByParent : false,
    readAt: unchanged ? existing.readAt : undefined,
    acknowledgedByParent: unchanged ? existing.acknowledgedByParent : false,
    acknowledgedAt: unchanged ? existing.acknowledgedAt : undefined,
  };
}

export function sortAttendanceNotifications(
  notifications: ParentAttendanceNotification[],
): ParentAttendanceNotification[] {
  return [...notifications].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.sentAt.localeCompare(a.sentAt);
  });
}

export function summarizeParentAttendanceNotifications(
  notifications: ParentAttendanceNotification[],
  targetDate?: string,
): {
  totalSent: number;
  unreadCount: number;
  acknowledgedCount: number;
  todayCount: number;
  presentSentCount: number;
  absentSentCount: number;
  leaveSentCount: number;
} {
  let unreadCount = 0;
  let acknowledgedCount = 0;
  let todayCount = 0;
  let presentSentCount = 0;
  let absentSentCount = 0;
  let leaveSentCount = 0;

  for (const item of notifications) {
    if (!item.readByParent) unreadCount += 1;
    if (item.acknowledgedByParent) acknowledgedCount += 1;
    if (targetDate && item.date === targetDate) todayCount += 1;
    if (item.attendanceStatus === 'Present') presentSentCount += 1;
    else if (item.attendanceStatus === 'Absent') absentSentCount += 1;
    else if (item.attendanceStatus === 'Leave') leaveSentCount += 1;
  }

  return {
    totalSent: notifications.length,
    unreadCount,
    acknowledgedCount,
    todayCount,
    presentSentCount,
    absentSentCount,
    leaveSentCount,
  };
}
