import React, { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Fingerprint,
  Lock,
  PenLine,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type {
  AttendanceMarkingMode,
  AttendanceRecord,
  MonthlyAttendanceSummary,
  ParentAttendanceNotification,
  School,
  StudentRecord,
  UserAccount,
} from '../types';
import {
  ATTENDANCE_MODE_SPECS,
  getAllowedAttendanceModesForSchool,
  isAttendanceModeEnabledForSchool,
} from '../utils/subscriptionEntitlements';
import {
  buildBatchAttendanceRecordId,
  summarizeAttendanceEntries,
} from '../utils/academicOperationsEngine';
import { apiRequest } from '../utils/api';
import { setWorkspaceDirtyState } from '../utils/dirtyGuard';
import { pushToast } from './ToastProvider';
import {
  sortAttendanceNotifications,
  summarizeParentAttendanceNotifications,
} from '../utils/attendanceNotificationEngine';
import {
  ACTIVE_SESSION_MONTHS,
  compareClassSections,
  resolveTodayIsoDate,
  summarizeDailyAttendanceDashboard,
  summarizeMonthlyAttendanceByMonth,
} from '../utils/visAcademicProgressEngine';

interface BatchAttendanceRosterPanelProps {
  students: StudentRecord[];
  attendance: AttendanceRecord[];
  monthlyAttendance?: MonthlyAttendanceSummary[];
  attendanceNotifications?: ParentAttendanceNotification[];
  user: UserAccount;
  schoolId: string;
  school?: School;
  canEdit: boolean;
  token: string;
  onRefresh: () => Promise<void>;
  requestedClassSection?: string | null;
  requestSeq?: number;
}

type AttendanceSubView = 'roster' | 'daily' | 'monthly' | 'notifications';

export const BatchAttendanceRosterPanel: React.FC<BatchAttendanceRosterPanelProps> = ({
  students,
  attendance,
  monthlyAttendance = [],
  attendanceNotifications = [],
  user,
  schoolId,
  school,
  canEdit,
  token,
  onRefresh,
  requestedClassSection = null,
  requestSeq = 0,
}) => {
  const allowedModes = useMemo(
    () => (school ? getAllowedAttendanceModesForSchool(school) : (['manual'] as AttendanceMarkingMode[])),
    [school],
  );
  const [captureMode, setCaptureMode] = useState<AttendanceMarkingMode>(() =>
    allowedModes[0] || 'manual',
  );
  const [deviceId, setDeviceId] = useState<string>('RFID-GATE-01');
  const [scanInput, setScanInput] = useState<string>('');
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<
    Array<{ studentName: string; classSection: string; mode: 'rfid' | 'biometric'; refCode: string; time: string }>
  >([]);

  useEffect(() => {
    if (!allowedModes.includes(captureMode)) {
      setCaptureMode(allowedModes[0] || 'manual');
    }
  }, [allowedModes, captureMode]);

  useEffect(() => {
    if (captureMode === 'rfid' && !deviceId.startsWith('RFID')) {
      setDeviceId('RFID-GATE-01');
    } else if (captureMode === 'biometric' && !deviceId.startsWith('BIO')) {
      setDeviceId('BIO-TERM-01');
    }
  }, [captureMode, deviceId]);

  const classSections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      counts.set(s.classSection, (counts.get(s.classSection) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([section, count]) => ({ section, count }))
      .sort((a, b) => compareClassSections(a.section, b.section));
  }, [students]);

  const [subView, setSubView] = useState<AttendanceSubView>('roster');
  const [selectedClass, setSelectedClass] = useState<string>(() => {
    if (
      requestedClassSection &&
      classSections.some((c) => c.section === requestedClassSection)
    ) {
      return requestedClassSection;
    }
    if (
      user.classTeacherOf &&
      classSections.some((c) => c.section === user.classTeacherOf)
    ) {
      return user.classTeacherOf;
    }
    return classSections[0]?.section || '';
  });

  useEffect(() => {
    if (
      requestSeq > 0 &&
      requestedClassSection &&
      classSections.some((c) => c.section === requestedClassSection)
    ) {
      setSelectedClass(requestedClassSection);
      setSubView('roster');
    }
  }, [requestSeq, requestedClassSection]);

  const [date, setDate] = useState<string>(() => resolveTodayIsoDate());
  const [defaultNote, setDefaultNote] = useState<string>('');
  const [notifyParents, setNotifyParents] = useState<boolean>(true);
  const [customNotifMessage, setCustomNotifMessage] = useState<string>('');
  const [statuses, setStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Leave'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [focusedRowIdx, setFocusedRowIdx] = useState<number>(0);

  // Notification log filters
  const [notifClassFilter, setNotifClassFilter] = useState<string>('All');
  const [notifStatusFilter, setNotifStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'Leave'>('All');
  const [notifSearch, setNotifSearch] = useState<string>('');

  // Daily Present / Absent explorer filters
  const [dailyStatusFilter, setDailyStatusFilter] = useState<'Absent' | 'Present' | 'Leave'>('Absent');
  const [dailyClassFilter, setDailyClassFilter] = useState<string>('All');
  const [dailySearch, setDailySearch] = useState<string>('');
  const [dailyLimit, setDailyLimit] = useState<number>(60);

  // Monthly ledger filters
  const [monthlyClassFilter, setMonthlyClassFilter] = useState<string>('All');
  const [monthlySearch, setMonthlySearch] = useState<string>('');
  const [monthlyLimit, setMonthlyLimit] = useState<number>(50);

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => s.classSection === selectedClass)
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true })),
    [students, selectedClass],
  );

  // Sync roster statuses whenever selectedClass, date, or attendance changes
  useEffect(() => {
    const nextStatuses: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    const nextNotes: Record<string, string> = {};
    for (const st of classStudents) {
      const deterministicId = buildBatchAttendanceRecordId(schoolId, date, st.id);
      const existing =
        attendance.find((a) => a.id === deterministicId) ||
        attendance.find((a) => a.studentId === st.id && a.date === date);
      nextStatuses[st.id] = existing?.status || 'Present';
      nextNotes[st.id] = existing?.contextNote || '';
    }
    setStatuses(nextStatuses);
    setNotes(nextNotes);
  }, [classStudents, attendance, schoolId, date]);

  const summary = useMemo(
    () =>
      summarizeAttendanceEntries(
        classStudents.map((st) => ({ status: statuses[st.id] || 'Present' })),
      ),
    [classStudents, statuses],
  );

  const dailyDashboard = useMemo(
    () => summarizeDailyAttendanceDashboard(students, attendance, date),
    [students, attendance, date],
  );

  const monthlyAgg = useMemo(() => {
    const visibleIds = new Set(
      (monthlyClassFilter === 'All'
        ? students
        : students.filter((s) => s.classSection === monthlyClassFilter)
      ).map((s) => s.id),
    );
    return summarizeMonthlyAttendanceByMonth(monthlyAttendance, visibleIds);
  }, [monthlyAttendance, students, monthlyClassFilter]);

  const monthlyByStudent = useMemo(() => {
    const map = new Map<string, Map<string, MonthlyAttendanceSummary>>();
    for (const row of monthlyAttendance) {
      if (!map.has(row.studentId)) map.set(row.studentId, new Map());
      map.get(row.studentId)!.set(row.month, row);
    }
    const q = monthlySearch.trim().toLowerCase();
    return students
      .filter((s) => {
        if (monthlyClassFilter !== 'All' && s.classSection !== monthlyClassFilter) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.classSection.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const cmp = compareClassSections(a.classSection, b.classSection);
        if (cmp !== 0) return cmp;
        return a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true });
      })
      .map((st) => ({
        student: st,
        months: map.get(st.id) || new Map<string, MonthlyAttendanceSummary>(),
      }));
  }, [monthlyAttendance, students, monthlyClassFilter, monthlySearch]);

  const filteredDailyEntries = useMemo(() => {
    const source =
      dailyStatusFilter === 'Absent'
        ? dailyDashboard.absentStudents
        : dailyStatusFilter === 'Present'
          ? dailyDashboard.presentStudents
          : dailyDashboard.leaveStudents;
    const q = dailySearch.trim().toLowerCase();
    return source.filter((item) => {
      if (dailyClassFilter !== 'All' && item.student.classSection !== dailyClassFilter) return false;
      if (!q) return true;
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.admissionNo.toLowerCase().includes(q)
      );
    });
  }, [dailyDashboard, dailyStatusFilter, dailyClassFilter, dailySearch]);

  const orderedNotifications = useMemo(
    () => sortAttendanceNotifications(attendanceNotifications),
    [attendanceNotifications],
  );

  const notificationSummary = useMemo(
    () => summarizeParentAttendanceNotifications(orderedNotifications, date),
    [orderedNotifications, date],
  );

  const filteredNotifications = useMemo(() => {
    const q = notifSearch.trim().toLowerCase();
    return orderedNotifications.filter((n) => {
      if (notifClassFilter !== 'All' && n.classSection !== notifClassFilter) return false;
      if (notifStatusFilter !== 'All' && n.attendanceStatus !== notifStatusFilter) return false;
      if (!q) return true;
      return (
        n.studentName.toLowerCase().includes(q) ||
        n.guardianName.toLowerCase().includes(q) ||
        n.messageEn.toLowerCase().includes(q)
      );
    });
  }, [orderedNotifications, notifClassFilter, notifStatusFilter, notifSearch]);

  function markAll(status: 'Present' | 'Absent' | 'Leave') {
    const next: Record<string, 'Present' | 'Absent' | 'Leave'> = {};
    for (const st of classStudents) {
      next[st.id] = status;
    }
    setStatuses(next);
    setWorkspaceDirtyState('attendance-roster', `Class ${selectedClass} Attendance`);
  }

  useEffect(() => {
    setFocusedRowIdx(0);
    setWorkspaceDirtyState('attendance-roster', null);
    return () => setWorkspaceDirtyState('attendance-roster', null);
  }, [selectedClass, date]);

  useEffect(() => {
    if (!canEdit || subView !== 'roster' || classStudents.length === 0) return;
    function handleRosterKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedRowIdx((idx) => Math.min(idx + 1, classStudents.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedRowIdx((idx) => Math.max(idx - 1, 0));
      } else if (key === 'p' || key === 'a' || key === 'l') {
        const student = classStudents[focusedRowIdx];
        if (!student) return;
        e.preventDefault();
        const nextStatus: 'Present' | 'Absent' | 'Leave' =
          key === 'p' ? 'Present' : key === 'a' ? 'Absent' : 'Leave';
        setStatuses((prev) => ({ ...prev, [student.id]: nextStatus }));
        setWorkspaceDirtyState('attendance-roster', `Class ${selectedClass} Attendance`);
        setFocusedRowIdx((idx) => Math.min(idx + 1, classStudents.length - 1));
      }
    }
    window.addEventListener('keydown', handleRosterKeyDown);
    return () => window.removeEventListener('keydown', handleRosterKeyDown);
  }, [canEdit, subView, classStudents, focusedRowIdx, selectedClass]);

  async function handleHardwareScan(identifierValue: string, modeOverride?: 'rfid' | 'biometric') {
    const activeMode = modeOverride || (captureMode === 'biometric' ? 'biometric' : 'rfid');
    const cleanId = identifierValue.trim();
    if (!cleanId) {
      setErr('Scan or enter a student RFID Card ID, Biometric ID, or Admission No.');
      return;
    }
    setErr(null);
    setMsg(null);
    setScanningId(cleanId);
    try {
      const res = await apiRequest<{
        attendance: AttendanceRecord;
        student: StudentRecord;
      }>(
        '/api/attendance/scan',
        {
          method: 'POST',
          body: JSON.stringify({
            mode: activeMode,
            date,
            identifier: cleanId,
            classSection: selectedClass || undefined,
            deviceId,
            notifyParents,
          }),
        },
        token,
      );
      setStatuses((prev) => ({ ...prev, [res.student.id]: 'Present' }));
      setScanInput('');
      setRecentScans((prev) => [
        {
          studentName: res.student.name,
          classSection: res.student.classSection,
          mode: activeMode,
          refCode: res.attendance.cardOrBiometricRef || cleanId,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        },
        ...prev.slice(0, 5),
      ]);
      await onRefresh();
      const modeLabel = activeMode === 'biometric' ? 'Biometric' : 'RFID Card';
      const notice = `${modeLabel} verified: ${res.student.name} (${res.student.classSection}) marked Present via ${deviceId}.`;
      pushToast(notice, 'success');
      setMsg(notice);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to verify scan.');
    } finally {
      setScanningId(null);
    }
  }

  async function handleSaveRoster(e: React.FormEvent) {
    e.preventDefault();
    if (classStudents.length === 0) return;
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await apiRequest<{
        summary: { present: number; absent: number; leave: number; total: number };
        notificationsSent?: number;
      }>(
        '/api/attendance/roster',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection: selectedClass,
            date,
            markingMode: captureMode,
            deviceId: captureMode === 'manual' ? undefined : deviceId,
            defaultContextNote: defaultNote.trim() || undefined,
            notifyParents,
            notificationMessage: notifyParents ? customNotifMessage.trim() || undefined : undefined,
            entries: classStudents.map((st) => ({
              studentId: st.id,
              status: statuses[st.id] || 'Present',
              contextNote: notes[st.id]?.trim() || undefined,
            })),
          }),
        },
        token,
      );
      await onRefresh();
      setWorkspaceDirtyState('attendance-roster', null);
      const notifiedSuffix = notifyParents
        ? ` Notified ${res.notificationsSent ?? res.summary.total} parent(s) via app.`
        : ' App parent alert paused for this submission.';
      const modeLabel =
        captureMode === 'biometric'
          ? 'Biometric'
          : captureMode === 'rfid'
            ? 'RFID Smart Card'
            : 'Manual';
      const summaryText = `Saved Class ${selectedClass} attendance via ${modeLabel} (${res.summary.present} Present, ${res.summary.absent} Absent, ${res.summary.leave} Leave).`;
      pushToast(summaryText, 'success');
      setMsg(
        `Saved Class ${selectedClass} attendance via ${modeLabel} for ${date} (${res.summary.present} Present, ${res.summary.absent} Absent, ${res.summary.leave} Leave).${notifiedSuffix} OLQ scores remain untouched.`,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to save whole-class attendance.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResendNotification(notif: ParentAttendanceNotification) {
    setErr(null);
    setMsg(null);
    setResendingId(notif.id);
    try {
      await apiRequest(
        '/api/attendance/notifications/send',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: notif.studentId,
            date: notif.date,
          }),
        },
        token,
      );
      await onRefresh();
      setMsg(`Resent daily attendance notification to ${notif.guardianName} (${notif.studentName}).`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Unable to resend parent attendance notification.');
    } finally {
      setResendingId(null);
    }
  }

  const recentClassRecords = useMemo(() => {
    const classIds = new Set(classStudents.map((s) => s.id));
    return attendance.filter((a) => classIds.has(a.studentId)).slice(0, 12);
  }, [attendance, classStudents]);

  return (
    <div className="space-y-5">
      {/* Live Institutional / Teacher-Scoped Attendance Strip for Selected Date */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Today Present Students ({date})</p>
          <p className="font-mono text-2xl font-semibold text-emerald-700 tabular-nums mt-1">
            {dailyDashboard.presentCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            Out of {dailyDashboard.totalStudents} visible students
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total Absent Students ({date})</p>
          <p className="font-mono text-2xl font-semibold text-red-700 tabular-nums mt-1">
            {dailyDashboard.absentCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requires guardian follow-up</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">On Approved Leave ({date})</p>
          <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
            {dailyDashboard.leaveCount}
          </p>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {dailyDashboard.unmarkedCount} unmarked
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Daily Attendance Rate</p>
          <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
            {dailyDashboard.presentRatePct}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Observational only · Never alters OLQs</p>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSubView('roster')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subView === 'roster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            One-Go Class Roll Call
          </button>
          <button
            type="button"
            onClick={() => setSubView('daily')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subView === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today Present &amp; Absent ({dailyDashboard.absentCount} Absent)
          </button>
          <button
            type="button"
            onClick={() => setSubView('monthly')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subView === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Attendance (Apr–Nov 2026)
          </button>
          <button
            type="button"
            onClick={() => setSubView('notifications')}
            data-testid="tab-parent-notification-log"
            className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              subView === 'notifications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Parent Notification Log ({orderedNotifications.length})
          </button>
        </div>
        <span className="text-xs text-slate-500 font-mono tabular-nums">
          Active Date: {date}
        </span>
      </div>

      {subView === 'daily' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Today Present &amp; Absent Student Directory ({date})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live roll-call roster across {dailyDashboard.classBreakdown.length} active class section(s).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['Absent', 'Present', 'Leave'] as const).map((statusOpt) => (
                <button
                  key={statusOpt}
                  type="button"
                  onClick={() => {
                    setDailyStatusFilter(statusOpt);
                    setDailyLimit(60);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${
                    dailyStatusFilter === statusOpt
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {statusOpt} (
                  {statusOpt === 'Absent'
                    ? dailyDashboard.absentCount
                    : statusOpt === 'Present'
                      ? dailyDashboard.presentCount
                      : dailyDashboard.leaveCount}
                  )
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              aria-label="Filter daily attendance by class"
              value={dailyClassFilter}
              onChange={(e) => setDailyClassFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="All">All Visible Classes</option>
              {classSections.map((c) => (
                <option key={c.section} value={c.section}>
                  Class {c.section}
                </option>
              ))}
            </select>
            <input
              type="search"
              aria-label="Search daily attendance student"
              value={dailySearch}
              onChange={(e) => setDailySearch(e.target.value)}
              placeholder="Search student or admission no..."
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            />
            <input
              type="date"
              aria-label="Select daily attendance date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Roll</th>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Guardian</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDailyEntries.slice(0, dailyLimit).map((entry) => (
                  <tr key={entry.student.id} className="hover:bg-slate-50">
                    <td className="px-5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                      {entry.student.classSection}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 tabular-nums">
                      {entry.student.rollNo}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                      {entry.student.name} ·{' '}
                      <span className="font-mono font-normal text-slate-500">
                        {entry.student.admissionNo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                      {entry.student.guardianName} · {entry.student.guardianPhone}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-semibold whitespace-nowrap ${
                        entry.status === 'Present'
                          ? 'text-emerald-700'
                          : entry.status === 'Absent'
                            ? 'text-red-700'
                            : 'text-amber-700'
                      }`}
                    >
                      {entry.status}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClass(entry.student.classSection);
                          setSubView('roster');
                        }}
                        className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                      >
                        Edit Class Roll →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDailyEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No students in {dailyStatusFilter} list for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredDailyEntries.length > dailyLimit && (
            <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing {dailyLimit} of {filteredDailyEntries.length} students
              </span>
              <button
                type="button"
                onClick={() => setDailyLimit((n) => n + 100)}
                className="font-semibold text-blue-900 hover:underline"
              >
                Load 100 more →
              </button>
            </div>
          )}
        </div>
      )}

      {subView === 'monthly' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-900" />
                  Month-Wise Attendance Summary (April–November 2026)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate working days, total student-present days, absent days, and monthly rate.
                </p>
              </div>
              <select
                aria-label="Filter monthly attendance by class"
                value={monthlyClassFilter}
                onChange={(e) => {
                  setMonthlyClassFilter(e.target.value);
                  setMonthlyLimit(50);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="All">All Visible Classes ({students.length})</option>
                {classSections.map((c) => (
                  <option key={c.section} value={c.section}>
                    Class {c.section}
                  </option>
                ))}
              </select>
            </div>
            {monthlyAgg.length > 0 && (
              <div className="border-b border-slate-200 bg-slate-50/50 p-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyAgg.map((m) => ({
                      shortMonth: m.month.slice(0, 3),
                      attendancePct: m.attendancePct,
                    }))}
                    margin={{ top: 8, right: 16, left: -12, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="shortMonth" tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine y={75} stroke="#d97706" strokeDasharray="4 4" />
                    <Bar dataKey="attendancePct" name="Cohort Attendance %" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Month</th>
                    <th className="px-4 py-3 font-semibold text-right">Students</th>
                    <th className="px-4 py-3 font-semibold text-right">Working Days</th>
                    <th className="px-4 py-3 font-semibold text-right">Present Days</th>
                    <th className="px-4 py-3 font-semibold text-right">Absent Days</th>
                    <th className="px-4 py-3 font-semibold text-right">Leave Days</th>
                    <th className="px-5 py-3 font-semibold text-right">Monthly %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyAgg.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50">
                      <td className="px-5 py-2.5 font-semibold text-slate-900">
                        {m.month} {m.year}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-slate-700 tabular-nums">
                        {m.studentCount}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-slate-700 tabular-nums">
                        {m.workingDays}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-emerald-700 tabular-nums">
                        {m.totalPresentDays.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-red-700 tabular-nums">
                        {m.totalAbsentDays.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right text-amber-700 tabular-nums">
                        {m.totalLeaveDays.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-right font-semibold text-blue-900 tabular-nums">
                        {m.attendancePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Student-Wise Monthly Attendance Register (Apr–Nov 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly % recorded per active student.
                </p>
              </div>
              <input
                type="search"
                aria-label="Search student monthly attendance"
                value={monthlySearch}
                onChange={(e) => setMonthlySearch(e.target.value)}
                placeholder="Search student or admission no..."
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs w-full sm:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold">Class</th>
                    {ACTIVE_SESSION_MONTHS.map((m) => (
                      <th key={m} className="px-2.5 py-3 font-semibold text-right">
                        {m.slice(0, 3)}
                      </th>
                    ))}
                    <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Apr→Nov Δ</th>
                    <th className="px-4 py-3 font-semibold text-right">YTD %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyByStudent.slice(0, monthlyLimit).map(({ student, months }) => {
                    const orderedRows = ACTIVE_SESSION_MONTHS.map((m) => months.get(m)).filter(
                      (r): r is NonNullable<typeof r> => Boolean(r),
                    );
                    const delta =
                      orderedRows.length > 1
                        ? Math.round(
                            (orderedRows[orderedRows.length - 1].attendancePct -
                              orderedRows[0].attendancePct) *
                              10,
                          ) / 10
                        : null;
                    return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-5 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                        {student.classSection}
                      </td>
                      {ACTIVE_SESSION_MONTHS.map((m) => {
                        const row = months.get(m);
                        return (
                          <td
                            key={m}
                            className={`px-2.5 py-2.5 font-mono text-right tabular-nums whitespace-nowrap ${
                              row && row.attendancePct < 75 ? 'text-amber-700 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            {row ? `${row.attendancePct}%` : '—'}
                          </td>
                        );
                      })}
                      <td
                        className={`px-3 py-2.5 font-mono text-right font-semibold tabular-nums whitespace-nowrap ${
                          delta === null
                            ? 'text-slate-300'
                            : delta > 0
                              ? 'text-emerald-700'
                              : delta < 0
                                ? 'text-amber-700'
                                : 'text-slate-500'
                        }`}
                      >
                        {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right font-semibold text-blue-900 tabular-nums">
                        {student.attendancePct}%
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {monthlyByStudent.length > monthlyLimit && (
              <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {monthlyLimit} of {monthlyByStudent.length} student attendance ledgers
                </span>
                <button
                  type="button"
                  onClick={() => setMonthlyLimit((n) => n + 100)}
                  className="font-semibold text-blue-900 hover:underline"
                >
                  Load 100 more →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {subView === 'notifications' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-900" />
                Parent In-App Attendance Notification Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-mono tabular-nums">{notificationSummary.totalSent} delivered</span>
                {' · '}
                <span className="font-mono tabular-nums text-emerald-700">
                  {notificationSummary.acknowledgedCount} acknowledged
                </span>
                {' · '}
                <span className="font-mono tabular-nums text-amber-700">
                  {notificationSummary.unreadCount} awaiting parent read
                </span>
              </p>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              aria-label="Filter notification log by class"
              value={notifClassFilter}
              onChange={(e) => setNotifClassFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="All">All Visible Classes</option>
              {classSections.map((c) => (
                <option key={c.section} value={c.section}>
                  Class {c.section}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter notification log by attendance status"
              value={notifStatusFilter}
              onChange={(e) =>
                setNotifStatusFilter(e.target.value as 'All' | 'Present' | 'Absent' | 'Leave')
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Absent">Absent Alerts Only</option>
              <option value="Leave">Leave Updates Only</option>
              <option value="Present">Present Confirmations Only</option>
            </select>
            <input
              type="search"
              aria-label="Search parent attendance notifications"
              value={notifSearch}
              onChange={(e) => setNotifSearch(e.target.value)}
              placeholder="Search student, guardian, or note..."
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
            />
          </div>

          {err && (
            <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
              {err}
            </div>
          )}
          {msg && (
            <div className="mx-5 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {msg}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Student · Class</th>
                  <th className="px-4 py-3 font-semibold">Guardian</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Delivered App Message</th>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                  {canEdit && <th className="px-5 py-3 font-semibold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.slice(0, 60).map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 align-top">
                    <td className="px-5 py-3 font-mono text-slate-700 whitespace-nowrap tabular-nums">
                      {n.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{n.studentName}</p>
                      <p className="text-[11px] text-slate-500">Class {n.classSection}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      <p className="font-medium text-slate-800">{n.guardianName}</p>
                      <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                        {n.guardianPhone}
                      </p>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold whitespace-nowrap ${
                        n.attendanceStatus === 'Present'
                          ? 'text-emerald-700'
                          : n.attendanceStatus === 'Absent'
                            ? 'text-red-700'
                            : 'text-amber-700'
                      }`}
                    >
                      {n.attendanceStatus}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md">
                      <p>{n.messageEn}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                        Sent by {n.sentBy} · {n.sentAt.slice(0, 16).replace('T', ' ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {n.acknowledgedByParent ? (
                        <span className="font-semibold text-emerald-700">
                          Read · Acknowledged
                        </span>
                      ) : n.readByParent ? (
                        <span className="font-medium text-slate-700">Read</span>
                      ) : (
                        <span className="font-medium text-amber-700">Unread</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={resendingId === n.id}
                          onClick={() => void handleResendNotification(n)}
                          className="font-semibold text-blue-900 hover:underline disabled:opacity-50"
                        >
                          {resendingId === n.id ? 'Sending...' : 'Resend Alert'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredNotifications.length === 0 && (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="px-5 py-8 text-center text-slate-500">
                      No parent attendance notifications match this filter yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subView === 'roster' && (
        <>
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-900" />
              One-Go Whole-Class Attendance Roster
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Mark attendance using modes allotted to your school plan ({allowedModes.map((m) => (m === 'manual' ? 'Manual' : m === 'rfid' ? 'RFID Card' : 'Biometric')).join(' · ')}).
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-950 self-start">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-blue-900" />
            Observational context only — never penalises OLQ or Learners Score
          </div>
        </div>

        {/* Plan-Allotted Attendance Capture Mode Switcher */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">Attendance Capture Mode</span>
            {school && (
              <span className="text-[11px] text-slate-500">
                Plan: <strong className="text-slate-700">{school.subscriptionPlan}</strong>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ATTENDANCE_MODE_SPECS.map((spec) => {
              const unlocked = school ? isAttendanceModeEnabledForSchool(school, spec.mode) : spec.mode === 'manual';
              const active = captureMode === spec.mode;
              const Icon =
                spec.mode === 'biometric'
                  ? Fingerprint
                  : spec.mode === 'rfid'
                    ? CreditCard
                    : PenLine;
              return (
                <button
                  key={spec.mode}
                  type="button"
                  data-testid={`roster-capture-mode-${spec.mode}`}
                  onClick={() => {
                    if (!unlocked) {
                      pushToast(
                        `${spec.label} is locked on your school's current plan (${school?.subscriptionPlan || 'Starter ERP'}). Ask Platform Admin to enable it.`,
                        'info',
                      );
                      return;
                    }
                    setCaptureMode(spec.mode);
                  }}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    !unlocked
                      ? 'border-slate-200 bg-slate-100/80 text-slate-400 cursor-not-allowed'
                      : active
                        ? 'border-[#142B46] bg-[#142B46] text-white cursor-pointer'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {spec.label}
                    </span>
                    {!unlocked && <Lock className="h-3.5 w-3.5 shrink-0" />}
                  </div>
                  <p className={`text-[11px] mt-0.5 ${active ? 'text-slate-200' : 'text-slate-500'}`}>
                    {unlocked ? spec.shortLabel + ' Active' : `Locked · ${spec.defaultPlanHint}`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Live RFID Card / Biometric Scan Desk when selected & unlocked */}
          {canEdit && (captureMode === 'rfid' || captureMode === 'biometric') && (
            <div className="border-t border-slate-200 pt-3 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-4">
                  <label htmlFor="att-device-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {captureMode === 'rfid' ? 'RFID Reader Terminal' : 'Biometric Hardware Terminal'}
                  </label>
                  <select
                    id="att-device-select"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    {captureMode === 'rfid' ? (
                      <>
                        <option value="RFID-GATE-01">RFID-GATE-01 · Main Campus Gate</option>
                        <option value="RFID-CLASS-02">RFID-CLASS-02 · Classroom Desk Reader</option>
                        <option value="RFID-BUS-01">RFID-BUS-01 · School Bus Boarding</option>
                      </>
                    ) : (
                      <>
                        <option value="BIO-TERM-01">BIO-TERM-01 · Main Gate Fingerprint</option>
                        <option value="BIO-FACE-02">BIO-FACE-02 · Classroom Face Terminal</option>
                        <option value="BIO-WING-03">BIO-WING-03 · Senior Wing Biometric</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <label htmlFor="att-scan-input" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {captureMode === 'rfid'
                      ? 'Tap / Enter RFID Card UID or Admission No'
                      : 'Verify Biometric ID or Admission No'}
                  </label>
                  <input
                    id="att-scan-input"
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleHardwareScan(scanInput);
                      }
                    }}
                    placeholder={
                      captureMode === 'rfid'
                        ? 'e.g. RFID-VIS-2026-001 or Admission No'
                        : 'e.g. BIO-VIS-2026-001 or Admission No'
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-slate-900"
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    data-testid="roster-hardware-scan-btn"
                    disabled={Boolean(scanningId)}
                    onClick={() => void handleHardwareScan(scanInput)}
                    className="w-full rounded-lg bg-[#3D6349] px-3 py-2 text-xs font-bold text-white hover:bg-[#31513B] disabled:opacity-60 whitespace-nowrap cursor-pointer"
                  >
                    {scanningId
                      ? 'Verifying...'
                      : captureMode === 'rfid'
                        ? 'Verify RFID Tap'
                        : 'Verify Biometric'}
                  </button>
                </div>
              </div>

              {recentScans.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-0.5">
                  <span className="font-semibold text-[#142B46]">Latest Scans:</span>
                  {recentScans.map((sc, idx) => (
                    <span key={`${sc.refCode}-${idx}`} className="font-mono tabular-nums">
                      {sc.studentName} ({sc.refCode} · {sc.time})
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <form onSubmit={handleSaveRoster} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label htmlFor="att-class-select" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Class & Section
              </label>
              <select
                id="att-class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
              >
                {classSections.map((c) => (
                  <option key={c.section} value={c.section}>
                    Class {c.section} ({c.count} student{c.count === 1 ? '' : 's'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="att-date-input" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Attendance Date
              </label>
              <input
                id="att-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="att-batch-note" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Optional Class Context Note
              </label>
              <input
                id="att-batch-note"
                type="text"
                value={defaultNote}
                onChange={(e) => setDefaultNote(e.target.value)}
                placeholder="e.g. Morning roll call, Zonal sports event, Pre-Board Cycle..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Quick Bulk Toolbar + Live Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700 inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-900" />
                {summary.total} Students:
              </span>
              <span className="font-mono font-bold text-emerald-700 tabular-nums">
                {summary.present} Present
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono font-bold text-red-700 tabular-nums">
                {summary.absent} Absent
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono font-bold text-amber-700 tabular-nums">
                {summary.leave} Leave
              </span>
            </div>

            {canEdit && classStudents.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => markAll('Present')}
                  className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 whitespace-nowrap"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll('Leave')}
                  className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-50 whitespace-nowrap"
                >
                  Mark All Leave
                </button>
                <button
                  type="button"
                  onClick={() => markAll('Absent')}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-50 whitespace-nowrap"
                >
                  Mark All Absent
                </button>
              </div>
            )}
          </div>

          {/* Whole-Class Roster List */}
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {classStudents.map((st, rowIdx) => {
              const currentStatus = statuses[st.id] || 'Present';
              const isFocusedRow = canEdit && rowIdx === focusedRowIdx;
              return (
                <div
                  key={st.id}
                  data-testid={`attendance-row-${st.id}`}
                  onClick={() => setFocusedRowIdx(rowIdx)}
                  className={`px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                    isFocusedRow
                      ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-200'
                      : 'bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                        Roll {st.rollNo}
                      </span>
                      <p className="text-sm font-bold text-slate-900 truncate">{st.name}</p>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                        ({st.attendancePct}% YTD)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {st.admissionNo} · Guardian: {st.guardianName}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                    <div
                      role="group"
                      aria-label={`Attendance status for ${st.name}`}
                      className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
                    >
                      {(['Present', 'Absent', 'Leave'] as const).map((option) => {
                        const active = currentStatus === option;
                        const activeClass =
                          option === 'Present'
                            ? 'bg-emerald-700 text-white'
                            : option === 'Absent'
                              ? 'bg-red-700 text-white'
                              : 'bg-amber-600 text-white';
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => {
                              setStatuses((prev) => ({ ...prev, [st.id]: option }));
                              setWorkspaceDirtyState('attendance-roster', `Class ${selectedClass} Attendance`);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                              active ? activeClass : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {canEdit && (captureMode === 'rfid' || captureMode === 'biometric') && (
                      <button
                        type="button"
                        disabled={scanningId === st.admissionNo}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleHardwareScan(st.admissionNo, captureMode);
                        }}
                        className="rounded-lg border border-[#3D6349]/40 bg-emerald-50/70 px-2.5 py-1.5 text-[11px] font-semibold text-[#2C4A35] hover:bg-emerald-100 whitespace-nowrap cursor-pointer"
                      >
                        {captureMode === 'rfid' ? 'Tap RFID' : 'Scan Bio'}
                      </button>
                    )}

                    {canEdit && (
                      <input
                        type="text"
                        aria-label={`Note for ${st.name}`}
                        value={notes[st.id] || ''}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [st.id]: e.target.value }))
                        }
                        placeholder="Optional student note..."
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs w-full sm:w-44"
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {classStudents.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No enrolled student records found for this class section yet.
              </div>
            )}
          </div>

          {canEdit && classStudents.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyParents}
                  onChange={(e) => setNotifyParents(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                />
                <span>
                  <span className="font-semibold text-slate-900">
                    Automatically notify all parents via app on save
                  </span>
                  <span className="block text-slate-500 mt-0.5">
                    Sends bilingual (English &amp; Hindi) Present / Absent / Leave alerts immediately to each guardian&apos;s app feed.
                  </span>
                </span>
              </label>

              {notifyParents && (
                <div>
                  <label htmlFor="att-parent-notif-note" className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Optional Additional Guardian Message (included in every alert)
                  </label>
                  <input
                    id="att-parent-notif-note"
                    type="text"
                    value={customNotifMessage}
                    onChange={(e) => setCustomNotifMessage(e.target.value)}
                    placeholder="e.g. Morning roll call completed; please confirm bus pickup if absent..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              )}
            </div>
          )}

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              {err}
            </div>
          )}
          {msg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {msg}
            </div>
          )}

          {canEdit && classStudents.length > 0 && (
            <div
              data-testid="attendance-sticky-save-bar"
              className="sticky bottom-3 z-20 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-xs px-4 py-3 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
                <span className="font-semibold text-slate-900">Class {selectedClass}</span>
                <span className="font-mono font-semibold text-emerald-700">
                  {summary.present} Present
                </span>
                <span className="font-mono font-semibold text-red-700">
                  {summary.absent} Absent
                </span>
                <span className="font-mono font-semibold text-amber-700">
                  {summary.leave} Leave
                </span>
                <span className="hidden md:inline text-[11px] text-slate-500">
                  · Keys: P / A / L &amp; ↑ ↓
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => markAll('Present')}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                >
                  All Present
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60 whitespace-nowrap"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {saving
                    ? 'Saving Attendance...'
                    : `Save Class ${selectedClass} (${classStudents.length})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Recent Attendance History for Selected Class */}
      {recentClassRecords.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Recent Attendance Log — Class {selectedClass}
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentClassRecords.map((rec) => {
              const st = students.find((s) => s.id === rec.studentId);
              return (
                <div
                  key={rec.id}
                  className="px-5 py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {st?.name || rec.studentId} (Roll {st?.rollNo || '—'})
                    </p>
                    <p className="text-slate-500">
                      {rec.date}
                      {rec.contextNote ? ` · ${rec.contextNote}` : ''}
                      {rec.correctedBy ? ` · Marked by ${rec.correctedBy}` : ''}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      rec.status === 'Present'
                        ? 'text-emerald-700'
                        : rec.status === 'Absent'
                          ? 'text-red-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
