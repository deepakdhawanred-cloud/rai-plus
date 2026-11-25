import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Filter,
  HeartHandshake,
  MessageSquare,
  Printer,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { apiRequest } from '../../utils/api';
import type {
  AcademicMonthKey,
  AttendanceStatus,
  AttendanceSupportPatternType,
  AttendanceSupportRecord,
  AttendanceSupportStatus,
  UserAccount,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import {
  ATTENDANCE_NON_DIAGNOSTIC_DISCLAIMER,
  HEATMAP_MONTH_OPTIONS,
  buildAttendanceHeatmapCsv,
  buildClassAttendanceHeatmap,
  buildIndividualAttendanceHeatmapProfile,
  buildSchoolAttendanceManagementReport,
  type DailyHeatmapCell,
  type HeatmapCellStatus,
} from '../../utils/attendanceHeatmapEngine';
import { getAllowedAttendanceModesForSchool } from '../../utils/subscriptionEntitlements';
import { BatchAttendanceRosterPanel } from '../BatchAttendanceRosterPanel';

interface Props {
  workspace: WorkspaceData;
  user: UserAccount;
  token: string;
  onRefresh: () => Promise<void>;
}

type SubTab = 'mark_attendance' | 'class_heatmap' | 'individual_profile' | 'early_support' | 'management';

const STATUS_CELL_STYLE: Record<
  HeatmapCellStatus,
  { bg: string; text: string; short: string; label: string }
> = {
  Present: { bg: 'bg-emerald-500', text: 'text-white', short: 'P', label: 'Present' },
  Absent: { bg: 'bg-rose-500', text: 'text-white', short: 'A', label: 'Absent' },
  Late: { bg: 'bg-amber-400', text: 'text-slate-900', short: 'L', label: 'Late' },
  Leave: { bg: 'bg-sky-500', text: 'text-white', short: 'LV', label: 'Approved Leave' },
  Holiday: { bg: 'bg-slate-200', text: 'text-slate-500', short: 'H', label: 'Holiday / Non-Working' },
  Unmarked: { bg: 'bg-slate-100 border border-dashed border-slate-300', text: 'text-slate-400', short: '·', label: 'Upcoming / Unmarked' },
};

const PATTERN_LABELS: Record<AttendanceSupportPatternType, string> = {
  sudden_decline: 'Sudden Attendance Shift',
  consecutive_absences: 'Consecutive Absences',
  monday_friday_pattern: 'Monday/Friday Pattern',
  irregular_attendance: 'Irregular Pattern',
  threshold_watch: 'Below Benchmark',
};

const SUPPORT_STATUS_OPTIONS: AttendanceSupportStatus[] = [
  'Open Alert',
  'Teacher Observing',
  'Parent Contacted',
  'Referred to Counsellor',
  'Follow-Up Scheduled',
  'Resolved',
];

export const AttendanceHeatmapModule: React.FC<Props> = ({
  workspace,
  user,
  token,
  onRefresh,
}) => {
  const isManagement = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    user.role,
  );
  const canLogSupport = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'teacher',
    'counsellor',
  ].includes(user.role);

  const canMarkAttendance = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'teacher',
  ].includes(user.role);
  const allowedAttendanceModes = useMemo(
    () => getAllowedAttendanceModesForSchool(workspace.activeSchool),
    [workspace.activeSchool],
  );

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('class_heatmap');

  // Filters
  const classSections = useMemo(() => {
    const set = new Set(workspace.students.map((s) => s.classSection));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [workspace.students]);

  const [selectedClass, setSelectedClass] = useState<string>(
    user.classTeacherOf && classSections.includes(user.classTeacherOf)
      ? user.classTeacherOf
      : classSections[0] || 'All',
  );
  const [selectedMonth, setSelectedMonth] = useState<AcademicMonthKey>('November');
  const [selectedSession, setSelectedSession] = useState<string>('2026-27');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | AttendanceStatus | 'Needs Follow-Up'
  >('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [thresholdPct, setThresholdPct] = useState<number>(80);

  // Selected individual student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    workspace.students[0]?.id || '',
  );

  // Follow-up form state
  const [supportStudentId, setSupportStudentId] = useState<string>('');
  const [supportStatus, setSupportStatus] = useState<AttendanceSupportStatus>('Teacher Observing');
  const [referredToCounsellor, setReferredToCounsellor] = useState<boolean>(false);
  const [teacherObservation, setTeacherObservation] = useState<string>('');
  const [parentCommunicationNote, setParentCommunicationNote] = useState<string>('');
  const [followUpAction, setFollowUpAction] = useState<string>('');
  const [nextCheckInDate, setNextCheckInDate] = useState<string>('2026-11-28');
  const [savingSupport, setSavingSupport] = useState<boolean>(false);
  const [supportFeedback, setSupportFeedback] = useState<string | null>(null);

  const supportRecords = workspace.attendanceSupportRecords || [];

  const heatmapRows = useMemo(() => {
    const rows = buildClassAttendanceHeatmap({
      students: workspace.students,
      attendanceRecords: workspace.attendance,
      monthlyAttendance: workspace.monthlyAttendance || [],
      supportRecords,
      classSection: selectedClass,
      monthKey: selectedMonth,
      attendanceCategory: selectedCategory,
      thresholdPct,
    });
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.admissionNo.toLowerCase().includes(q) ||
        r.classSection.toLowerCase().includes(q),
    );
  }, [
    workspace.students,
    workspace.attendance,
    workspace.monthlyAttendance,
    supportRecords,
    selectedClass,
    selectedMonth,
    selectedCategory,
    thresholdPct,
    searchQuery,
  ]);

  // All rows across visible students for Early Support & Management
  const allVisibleRows = useMemo(() => {
    return buildClassAttendanceHeatmap({
      students: workspace.students,
      attendanceRecords: workspace.attendance,
      monthlyAttendance: workspace.monthlyAttendance || [],
      supportRecords,
      classSection: 'All',
      monthKey: selectedMonth,
      thresholdPct,
    });
  }, [
    workspace.students,
    workspace.attendance,
    workspace.monthlyAttendance,
    supportRecords,
    selectedMonth,
    thresholdPct,
  ]);

  const flaggedRows = useMemo(
    () =>
      allVisibleRows.filter(
        (r) => r.patternTypes.length > 0 || Boolean(r.supportRecord),
      ),
    [allVisibleRows],
  );

  const activeStudent = useMemo(() => {
    return (
      workspace.students.find((s) => s.id === selectedStudentId) ||
      workspace.students[0] ||
      null
    );
  }, [workspace.students, selectedStudentId]);

  const individualProfile = useMemo(() => {
    if (!activeStudent) return null;
    return buildIndividualAttendanceHeatmapProfile({
      student: activeStudent,
      attendanceRecords: workspace.attendance,
      monthlyAttendance: workspace.monthlyAttendance || [],
      thresholdPct,
    });
  }, [activeStudent, workspace.attendance, workspace.monthlyAttendance, thresholdPct]);

  const managementReport = useMemo(() => {
    return buildSchoolAttendanceManagementReport({
      students: workspace.students,
      attendanceRecords: workspace.attendance,
      monthlyAttendance: workspace.monthlyAttendance || [],
      supportRecords,
      activeMonth: selectedMonth,
      thresholdPct,
    });
  }, [
    workspace.students,
    workspace.attendance,
    workspace.monthlyAttendance,
    supportRecords,
    selectedMonth,
    thresholdPct,
  ]);

  const activeSupportStudent = useMemo(() => {
    const targetId = supportStudentId || flaggedRows[0]?.studentId || workspace.students[0]?.id;
    return allVisibleRows.find((r) => r.studentId === targetId) || null;
  }, [supportStudentId, flaggedRows, workspace.students, allVisibleRows]);

  const activeSupportRecord: AttendanceSupportRecord | undefined = useMemo(() => {
    if (!activeSupportStudent) return undefined;
    return supportRecords.find((r) => r.studentId === activeSupportStudent.studentId);
  }, [activeSupportStudent, supportRecords]);

  const handleOpenStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveSubTab('individual_profile');
  };

  const handleOpenFollowUp = (studentId: string) => {
    setSupportStudentId(studentId);
    const existing = supportRecords.find((r) => r.studentId === studentId);
    setSupportStatus(existing?.status || 'Teacher Observing');
    setReferredToCounsellor(Boolean(existing?.referredToCounsellor));
    setParentCommunicationNote(existing?.parentCommunicationNote || '');
    setFollowUpAction(existing?.followUpAction || '');
    setNextCheckInDate(existing?.nextCheckInDate || '2026-11-28');
    setTeacherObservation('');
    setSupportFeedback(null);
    setActiveSubTab('early_support');
  };

  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSupportStudent) return;
    setSavingSupport(true);
    setSupportFeedback(null);
    try {
      await apiRequest(
        '/api/attendance/support',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeSupportStudent.studentId,
            patternTypes:
              activeSupportStudent.patternTypes.length > 0
                ? activeSupportStudent.patternTypes
                : ['threshold_watch'],
            indicatorSummary:
              activeSupportStudent.indicatorNote ||
              `Overall attendance ${activeSupportStudent.overallPct}% reviewed by ${user.name}.`,
            status: supportStatus,
            referredToCounsellor,
            teacherObservation: teacherObservation.trim() || undefined,
            parentCommunicationNote: parentCommunicationNote.trim() || undefined,
            followUpAction: followUpAction.trim() || undefined,
            nextCheckInDate: nextCheckInDate || undefined,
          }),
        },
        token,
      );
      setTeacherObservation('');
      setSupportFeedback('Support observation and follow-up timeline saved.');
      await onRefresh();
    } catch (err) {
      setSupportFeedback(
        err instanceof Error ? err.message : 'Unable to save support observation.',
      );
    } finally {
      setSavingSupport(false);
    }
  };

  const handleDownloadCsv = () => {
    const rowsToExport = activeSubTab === 'management' ? allVisibleRows : heatmapRows;
    const csv = buildAttendanceHeatmapCsv(rowsToExport, selectedMonth);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Heatmap_${selectedClass.replace(/\s+/g, '_')}_${selectedMonth}_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const monthDaysHeader: DailyHeatmapCell[] = heatmapRows[0]?.cells || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Calendar className="h-4 w-4" />
              Classroom Attendance Heatmap & Early Support Intelligence
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Longitudinal Attendance Patterns & Follow-Up
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Allotted modes for {workspace.activeSchool.name}:{' '}
              <span className="font-semibold text-slate-900">
                {allowedAttendanceModes
                  .map((m) => (m === 'manual' ? 'Manual' : m === 'rfid' ? 'RFID Smart Card' : 'Biometric'))
                  .join(' · ')}
              </span>{' '}
              ({workspace.activeSchool.subscriptionPlan})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              Export Excel (CSV)
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Non-Diagnostic Ethical Safeguarding Notice */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-xs text-sky-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
          <p className="leading-relaxed">
            <span className="font-bold">Human-Led Support Policy:</span>{' '}
            {ATTENDANCE_NON_DIAGNOSTIC_DISCLAIMER}
          </p>
        </div>

        {/* Sub-Tab Bar */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {[
            ...(canMarkAttendance
              ? [
                  {
                    id: 'mark_attendance' as SubTab,
                    label: 'Mark Attendance (Manual / RFID / Bio)',
                    icon: ClipboardCheck,
                  },
                ]
              : []),
            { id: 'class_heatmap' as SubTab, label: 'Class-Wise Calendar Heatmap', icon: Calendar },
            { id: 'individual_profile' as SubTab, label: 'Individual Student Profile', icon: UserCheck },
            {
              id: 'early_support' as SubTab,
              label: `Early Support Indicators (${flaggedRows.length})`,
              icon: HeartHandshake,
            },
            ...(isManagement
              ? [
                  {
                    id: 'management' as SubTab,
                    label: 'Management Attendance Dashboard',
                    icon: TrendingUp,
                  },
                ]
              : []),
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 0: MARK ATTENDANCE (MANUAL / RFID / BIOMETRIC) */}
      {activeSubTab === 'mark_attendance' && canMarkAttendance && (
        <BatchAttendanceRosterPanel
          students={workspace.students}
          attendance={workspace.attendance}
          monthlyAttendance={workspace.monthlyAttendance || []}
          attendanceNotifications={workspace.attendanceNotifications || []}
          user={user}
          schoolId={workspace.activeSchool.id}
          school={workspace.activeSchool}
          canEdit={canMarkAttendance}
          token={token}
          onRefresh={onRefresh}
        />
      )}

      {/* TAB 1: CLASS-WISE ATTENDANCE HEATMAP */}
      {activeSubTab === 'class_heatmap' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Academic Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value="2026-27">2026–27 (Active)</option>
                  <option value="2025-26">2025–26 (Baseline)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Class & Section
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value="All">All Visible Classes ({workspace.students.length})</option>
                  {classSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Class {sec}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value as AcademicMonthKey)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  {HEATMAP_MONTH_OPTIONS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.key} {m.year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Attendance Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value as 'All' | AttendanceStatus | 'Needs Follow-Up',
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Has Absences</option>
                  <option value="Late">Has Late Marks</option>
                  <option value="Leave">Has Approved Leave</option>
                  <option value="Needs Follow-Up">Support Indicators Only</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Benchmark Threshold
                </label>
                <select
                  value={thresholdPct}
                  onChange={(e) => setThresholdPct(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value={75}>75% Minimum</option>
                  <option value={80}>80% Standard</option>
                  <option value={85}>85% High Regularity</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Search Student / Adm. No
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name or Adm No..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
                {(['Present', 'Absent', 'Late', 'Leave', 'Holiday'] as HeatmapCellStatus[]).map(
                  (st) => (
                    <span key={st} className="inline-flex items-center gap-1.5">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${STATUS_CELL_STYLE[st].bg} ${STATUS_CELL_STYLE[st].text}`}
                      >
                        {STATUS_CELL_STYLE[st].short}
                      </span>
                      {STATUS_CELL_STYLE[st].label}
                    </span>
                  ),
                )}
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Showing {heatmapRows.length} learner{heatmapRows.length === 1 ? '' : 's'} ·{' '}
                {selectedMonth} 2026
              </div>
            </div>
          </div>

          {/* Calendar Matrix Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="sticky left-0 z-10 min-w-[200px] border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold">
                      Student / Adm No / Class
                    </th>
                    {monthDaysHeader.map((cell) => (
                      <th
                        key={cell.dateIso}
                        className={`border-b border-slate-200 px-1 py-2 text-center font-semibold ${
                          cell.status === 'Holiday' ? 'bg-slate-100 text-slate-400' : ''
                        }`}
                      >
                        <div>{cell.dayOfMonth}</div>
                        <div className="text-[10px] font-normal">{cell.weekdayShort[0]}</div>
                      </th>
                    ))}
                    <th className="border-b border-l border-slate-200 px-2.5 py-2 text-center font-bold">
                      Wk %
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-2 text-center font-bold">
                      Mo %
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-2 text-center font-bold">
                      Term %
                    </th>
                    <th className="border-b border-slate-200 px-2.5 py-2 text-center font-bold">
                      Overall
                    </th>
                    <th className="border-b border-slate-200 px-3 py-2 text-right font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {heatmapRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={monthDaysHeader.length + 6}
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        No students match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    heatmapRows.map((row) => (
                      <tr key={row.studentId} className="hover:bg-slate-50/80">
                        <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => handleOpenStudentProfile(row.studentId)}
                            className="text-left hover:text-indigo-600"
                          >
                            <div className="font-bold text-slate-900">{row.studentName}</div>
                            <div className="text-[11px] text-slate-500">
                              {row.admissionNo} · Class {row.classSection}
                            </div>
                          </button>
                          {row.patternTypes.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {row.patternTypes.slice(0, 2).map((pt) => (
                                <span
                                  key={pt}
                                  className="inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                                >
                                  {PATTERN_LABELS[pt]}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        {row.cells.map((cell) => {
                          const st = STATUS_CELL_STYLE[cell.status];
                          return (
                            <td key={cell.dateIso} className="px-0.5 py-2 text-center">
                              <span
                                title={`${row.studentName} · ${cell.dateIso} (${cell.weekdayShort}): ${st.label}${cell.note ? ` — ${cell.note}` : ''}`}
                                className={`inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${st.bg} ${st.text}`}
                              >
                                {st.short}
                              </span>
                            </td>
                          );
                        })}
                        <td className="border-l border-slate-200 px-2.5 py-2 text-center font-semibold text-slate-700">
                          {row.weeklyPct !== null ? `${row.weeklyPct}%` : '—'}
                        </td>
                        <td className="px-2.5 py-2 text-center font-semibold text-slate-700">
                          {row.monthlyPct !== null ? `${row.monthlyPct}%` : '—'}
                        </td>
                        <td className="px-2.5 py-2 text-center font-semibold text-slate-700">
                          {row.termPct !== null ? `${row.termPct}%` : '—'}
                        </td>
                        <td className="px-2.5 py-2 text-center">
                          <span
                            className={`inline-flex rounded-lg px-2 py-0.5 font-bold ${
                              row.overallPct >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.overallPct >= thresholdPct
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {row.overallPct}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStudentProfile(row.studentId)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Profile
                            </button>
                            {canLogSupport && (
                              <button
                                type="button"
                                onClick={() => handleOpenFollowUp(row.studentId)}
                                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                              >
                                Follow-Up
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDIVIDUAL STUDENT ATTENDANCE HEATMAP */}
      {activeSubTab === 'individual_profile' && individualProfile && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-indigo-600" />
              <label className="text-sm font-semibold text-slate-700">Select Student:</label>
              <select
                value={individualProfile.student.id}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
              >
                {workspace.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.admissionNo} · Class {s.classSection})
                  </option>
                ))}
              </select>
            </div>
            {canLogSupport && (
              <button
                type="button"
                onClick={() => handleOpenFollowUp(individualProfile.student.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <HeartHandshake className="h-4 w-4" />
                Record Teacher Observation / Follow-Up
              </button>
            )}
          </div>

          {/* 6 Key Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Overall Attendance</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {individualProfile.overallPct}%
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Prev session: {individualProfile.previousSessionPct}% (
                {individualProfile.sessionDeltaPct >= 0 ? '+' : ''}
                {individualProfile.sessionDeltaPct}%)
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Total Working Days</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {individualProfile.totalWorkingDays}
              </div>
              <div className="mt-1 text-xs text-slate-500">Session 2026–27</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Total Days Present</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                {individualProfile.totalDaysPresent}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Includes {individualProfile.totalDaysLate} late marks
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Total Days Absent</div>
              <div className="mt-1 text-2xl font-bold text-rose-600">
                {individualProfile.totalDaysAbsent}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Approved Leave: {individualProfile.totalDaysLeave}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Max Consecutive Absences</div>
              <div className="mt-1 text-2xl font-bold text-amber-600">
                {individualProfile.maxConsecutiveAbsences}
              </div>
              <div className="mt-1 text-xs text-slate-500">Working-day streak</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">Monday/Friday Absences</div>
              <div className="mt-1 text-2xl font-bold text-indigo-700">
                {individualProfile.mondayFridayAbsences}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                MoM shift:{' '}
                {individualProfile.suddenDropDeltaPct !== null
                  ? `${individualProfile.suddenDropDeltaPct >= 0 ? '+' : ''}${individualProfile.suddenDropDeltaPct}%`
                  : 'Stable'}
              </div>
            </div>
          </div>

          {/* Monthly Trend Chart + Objective Pattern Indicators */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h3 className="text-base font-bold text-slate-900">
                Monthly Attendance Comparison — {individualProfile.student.name}
              </h3>
              <p className="text-xs text-slate-500">
                Attendance percentage across each month of Academic Session 2026–27
              </p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={individualProfile.monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip
                      formatter={(val) => [`${val ?? 0}%`, 'Attendance']}
                    />
                    <Bar dataKey="attendancePct" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Objective Pattern Indicators</h3>
              <p className="mt-1 text-xs text-slate-500">
                Signals for supportive human review (non-diagnostic).
              </p>
              <div className="mt-4 space-y-2.5">
                {individualProfile.indicatorDescriptions.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Consistent attendance across the session. No follow-up indicators triggered.
                  </div>
                ) : (
                  individualProfile.indicatorDescriptions.map((desc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span>{desc}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Full Academic Session Calendar Heatmap Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Full Academic Session Daily Heatmap (April – November 2026)
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {HEATMAP_MONTH_OPTIONS.map((mOpt) => {
                const cells = individualProfile.dailyCalendarByMonth[mOpt.key] || [];
                const summary = individualProfile.monthlyComparison.find(
                  (m) => m.month === mOpt.key,
                );
                return (
                  <div
                    key={mOpt.key}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {mOpt.key} {mOpt.year}
                      </span>
                      <span className="text-xs font-bold text-indigo-700">
                        {summary?.attendancePct ?? 0}%
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((cell) => {
                        const st = STATUS_CELL_STYLE[cell.status];
                        return (
                          <span
                            key={cell.dateIso}
                            title={`${cell.dateIso} (${cell.weekdayShort}): ${st.label}`}
                            className={`flex h-6 items-center justify-center rounded text-[10px] font-bold ${st.bg} ${st.text}`}
                          >
                            {cell.dayOfMonth}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARLY SUPPORT IDENTIFICATION & FOLLOW-UP */}
      {activeSubTab === 'early_support' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Flagged Students List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
            <h3 className="text-base font-bold text-slate-900">
              Students With Attendance Indicators ({flaggedRows.length})
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Select a student to record teacher observations, parent contact, or a supportive
              counsellor referral.
            </p>
            <div className="mt-4 max-h-[540px] space-y-2.5 overflow-y-auto pr-1">
              {flaggedRows.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                  No students currently trigger early support attendance indicators.
                </div>
              ) : (
                flaggedRows.map((row) => {
                  const selected = activeSupportStudent?.studentId === row.studentId;
                  return (
                    <button
                      key={row.studentId}
                      type="button"
                      onClick={() => handleOpenFollowUp(row.studentId)}
                      className={`w-full rounded-xl border p-3.5 text-left transition ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50/70'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {row.studentName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.admissionNo} · Class {row.classSection} · Overall {row.overallPct}%
                          </div>
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                          {row.supportRecord?.status || 'Open Alert'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {row.patternTypes.map((pt) => (
                          <span
                            key={pt}
                            className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                          >
                            {PATTERN_LABELS[pt]}
                          </span>
                        ))}
                        {row.supportRecord?.referredToCounsellor && (
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-800">
                            Referred to Counsellor
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Follow-Up Workflow Form + Support History */}
          <div className="space-y-5 lg:col-span-7">
            {activeSupportStudent ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Support Follow-Up — {activeSupportStudent.studentName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Class {activeSupportStudent.classSection} · {activeSupportStudent.admissionNo} ·{' '}
                        {activeSupportStudent.indicatorNote || 'Active follow-up tracking'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenStudentProfile(activeSupportStudent.studentId)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      View Full Heatmap
                    </button>
                  </div>

                  {canLogSupport ? (
                    <form onSubmit={handleSaveSupport} className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Follow-Up Stage
                          </label>
                          <select
                            value={supportStatus}
                            onChange={(e) =>
                              setSupportStatus(e.target.value as AttendanceSupportStatus)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                          >
                            {SUPPORT_STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Next Check-In Date
                          </label>
                          <input
                            type="date"
                            value={nextCheckInDate}
                            onChange={(e) => setNextCheckInDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Teacher / Counsellor Objective Observation
                        </label>
                        <textarea
                          rows={2}
                          value={teacherObservation}
                          onChange={(e) => setTeacherObservation(e.target.value)}
                          placeholder="Record factual classroom context or student conversation (avoid diagnostic labels)..."
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Parent Communication Log
                          </label>
                          <input
                            type="text"
                            value={parentCommunicationNote}
                            onChange={(e) => setParentCommunicationNote(e.target.value)}
                            placeholder="e.g., Called guardian; seasonal fever recovery"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">
                            Planned Follow-Up Action
                          </label>
                          <input
                            type="text"
                            value={followUpAction}
                            onChange={(e) => setFollowUpAction(e.target.value)}
                            placeholder="e.g., Share missed chapter notes & review Friday"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5 text-sm font-medium text-indigo-900">
                        <input
                          type="checkbox"
                          checked={referredToCounsellor}
                          onChange={(e) => setReferredToCounsellor(e.target.checked)}
                          className="h-4 w-4 rounded border-indigo-300 text-indigo-600"
                        />
                        Refer to School Counsellor for a supportive human check-in
                      </label>

                      {supportFeedback && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
                          {supportFeedback}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={savingSupport}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        {savingSupport ? 'Saving Follow-Up...' : 'Save Support Observation'}
                      </button>
                    </form>
                  ) : null}
                </div>

                {/* Support History Timeline */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    Support & Communication History
                  </h4>
                  <div className="mt-3 space-y-2.5">
                    {activeSupportRecord && activeSupportRecord.history.length > 0 ? (
                      activeSupportRecord.history.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800">
                              {item.actorName} ({item.actorRole})
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-700">{item.note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        No follow-up notes logged yet for this student.
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Select a student on the left to manage supportive follow-up records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGEMENT ATTENDANCE DASHBOARD */}
      {activeSubTab === 'management' && isManagement && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>School-Wide Attendance ({selectedMonth})</span>
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {managementReport.schoolWidePct}%
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-600">
                Prior month: {managementReport.previousMonthSchoolPct}% (
                {managementReport.schoolTrendDeltaPct >= 0 ? '+' : ''}
                {managementReport.schoolTrendDeltaPct}%)
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Students Requiring Follow-Up</span>
                <HeartHandshake className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 text-3xl font-bold text-amber-600">
                {managementReport.totalStudentsNeedingFollowUp}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Out of {managementReport.totalStudents} tracked learners
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Classes With Declining Trend</span>
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </div>
              <div className="mt-2 text-3xl font-bold text-rose-600">
                {managementReport.decliningClasses.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Compared with previous month
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Classes Improving</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">
                {managementReport.improvingClasses.length}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Positive month-over-month gain
              </div>
            </div>
          </div>

          {/* Monthly Comparison Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Monthly School-Wide Attendance Comparison (2026–27)
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated across all active classes in {workspace.activeSchool.name}
                </p>
              </div>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={managementReport.monthlySchoolComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[60, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v ?? 0}%`, 'School Avg']} />
                  <Bar dataKey="attendancePct" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class-wise Summary Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">
                Class-Wise Attendance Trends & Follow-Up Load
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Class & Section</th>
                    <th className="px-5 py-3 text-center">Students</th>
                    <th className="px-5 py-3 text-center">{selectedMonth} %</th>
                    <th className="px-5 py-3 text-center">Previous Month %</th>
                    <th className="px-5 py-3 text-center">Trend Delta</th>
                    <th className="px-5 py-3 text-center">Follow-Up Indicators</th>
                    <th className="px-5 py-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {managementReport.classSummaries.map((c) => (
                    <tr key={c.classSection} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-bold text-slate-900">
                        Class {c.classSection}
                      </td>
                      <td className="px-5 py-3 text-center text-slate-700">{c.studentCount}</td>
                      <td className="px-5 py-3 text-center font-bold text-slate-900">
                        {c.currentMonthPct}%
                      </td>
                      <td className="px-5 py-3 text-center text-slate-600">
                        {c.previousMonthPct}%
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${
                            c.trendDeltaPct > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.trendDeltaPct < 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.trendDeltaPct > 0 ? '+' : ''}
                          {c.trendDeltaPct}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-semibold text-amber-700">
                        {c.studentsNeedingFollowUp}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClass(c.classSection);
                            setActiveSubTab('class_heatmap');
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                        >
                          Open Calendar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
