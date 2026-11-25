import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  Gamepad2,
  IndianRupee,
  ListChecks,
  ShieldCheck,
} from 'lucide-react';
import type { HomeworkAssignment } from '../../types';
import type { WorkspaceData, WorkspaceTab } from '../../types/workspace';
import { AssignHomeworkModal } from '../AssignHomeworkModal';
import { ConsistencyStreakCard } from '../ConsistencyStreakCard';
import { GrowthLeaderboardCard } from '../GrowthLeaderboardCard';
import { LearnersTop3Board } from '../LearnersTop3Board';
import { ParentEasyPortalOverview } from '../ParentEasyPortalOverview';
import { SkillMonthlyGrowthLeaderboard } from '../SkillMonthlyGrowthLeaderboard';
import { apiRequest } from '../../utils/api';
import {
  sortAttendanceNotifications,
  summarizeParentAttendanceNotifications,
} from '../../utils/attendanceNotificationEngine';
import { computeStudentConsistencyStreak } from '../../utils/consistencyStreakEngine';
import { NotebookIncompleteAlertsPanel } from '../NotebookIncompleteAlertsPanel';
import {
  buildTeacherClassTargets,
  extractDefaultSubject,
  sortStudentHomeworkRows,
  summarizeTeacherRecentHomework,
} from '../../utils/homeworkEngine';
import {
  computeManagementAlerts,
  computeSchoolSetupChecklist,
  computeTeacherTodayDigest,
} from '../../utils/managementIntelligenceEngine';
import {
  loadParentLangPreference,
  PARENT_TRANSLATIONS,
  saveParentLangPreference,
  type ParentLang,
} from '../../utils/parentTranslations';
import {
  resolveTodayIsoDate,
  summarizeDailyAttendanceDashboard,
  summarizeMonthlyAttendanceByMonth,
} from '../../utils/visAcademicProgressEngine';
import { extractClassNumber } from '../../utils/thinkingMonthlyBank';
import { StudentDashboardBrainGym } from '../vcip/StudentDashboardBrainGym';
import { GlobalClassroomLeaderboard } from '../GlobalClassroomLeaderboard';
import { TodayWorkspace, type TodayFocusMode } from '../teacher/TodayWorkspace';
import { AccountantDashboardPanel } from '../AccountantDashboardPanel';
import { AccountsDailyClosingStrip } from '../AccountsDailyClosingStrip';
import { LeadershipDecisionInbox } from '../LeadershipDecisionInbox';

interface DashboardOverviewProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onNavigate: (tab: WorkspaceTab) => void;
  onApproveStudentReport: (studentId: string) => Promise<void>;
  onOpenStudent?: (studentId: string) => void;
  onOpenDailyHomework?: () => void;
  onOpenAssessmentLab?: (
    mode: 'reading' | 'numeracy' | 'leaderboard' | 'history',
    studentId?: string | null,
  ) => void;
  onOpenPresentationStudio?: () => void;
  onOpenDailyBrainGym?: () => void;
  onOpenStudyGames?: () => void;
  parentLang?: ParentLang;
  onChangeParentLang?: (next: ParentLang) => void;
  initialTodayFocusMode?: TodayFocusMode;
  todayFocusNonce?: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  data,
  token,
  onRefresh,
  onNavigate,
  onApproveStudentReport,
  onOpenStudent,
  onOpenDailyHomework,
  onOpenAssessmentLab,
  onOpenPresentationStudio,
  onOpenDailyBrainGym,
  onOpenStudyGames,
  parentLang: controlledLang,
  onChangeParentLang,
  initialTodayFocusMode = 'all',
  todayFocusNonce = 0,
}) => {
  const { user, activeSchool, students, studentBreakdowns, notebookEntries, feeTransactions, auditLogs } =
    data;

  const isParent = user.role === 'parent';
  const isStudent = user.role === 'student';
  const isTeacher = user.role === 'teacher';
  const isAccountant = user.role === 'accountant';
  const isStaff = !['parent', 'student'].includes(user.role);
  const canApprove = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(user.role);
  const canViewSetup = ['super_admin', 'school_admin', 'principal'].includes(user.role);

  const [localParentLang, setLocalParentLang] = useState<ParentLang>(() => loadParentLangPreference());
  const [leadershipView, setLeadershipView] = useState<'daily' | 'insights'>('daily');
  const [ackBusyId, setAckBusyId] = useState<string | null>(null);
  const [ackError, setAckError] = useState<string | null>(null);
  const [homeworkModalOpen, setHomeworkModalOpen] = useState(false);
  const [homeworkPrefill, setHomeworkPrefill] = useState<{
    classSection?: string;
    subject?: string;
  }>({});
  const [publishedHomeworkBanner, setPublishedHomeworkBanner] = useState<{
    assignments: HomeworkAssignment[];
    totalStudents: number;
    sampleStudentId: string | null;
  } | null>(null);
  const parentLang = controlledLang ?? localParentLang;
  const t = PARENT_TRANSLATIONS[isParent ? parentLang : 'en'];

  function handleParentLangChange(next: ParentLang) {
    if (onChangeParentLang) {
      onChangeParentLang(next);
    } else {
      setLocalParentLang(next);
      saveParentLangPreference(next);
    }
  }

  const pendingApprovals = students.filter((s) => s.reportApprovalStatus !== 'Approved');
  const hasRealTimeFeeLedger = Boolean(canApprove && data.feeAccounts && data.feeAccounts.length > 0);
  const pendingFeeInr = hasRealTimeFeeLedger
    ? (data.feeAccounts || []).reduce((acc, a) => acc + a.balanceFeesInr, 0)
    : feeTransactions
        .filter((f) => f.status !== 'Paid')
        .reduce((acc, f) => acc + Math.max(0, f.amountDueInr - f.concessionInr - f.amountPaidInr), 0);
  const unreviewedSiblingAlertsCount = hasRealTimeFeeLedger
    ? (data.siblingGroups || []).filter((g) => g.status === 'Alert').length
    : 0;

  const avgLearnersScore = (() => {
    const valid = students
      .map((s) => studentBreakdowns[s.id]?.overallScore)
      .filter((v): v is number => typeof v === 'number');
    if (valid.length === 0) return null;
    return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
  })();

  const teacherDigest = isTeacher ? computeTeacherTodayDigest(data, 'Monday') : null;
  const managementAlerts = canApprove ? computeManagementAlerts(data) : [];
  const setupChecklist = canViewSetup ? computeSchoolSetupChecklist(data) : null;

  const showCommandCenter = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'counsellor',
  ].includes(user.role);
  const thinkingPendingReviewCount = (data.thinkingAssessments || []).filter(
    (s) => s.status === 'submitted',
  ).length;
  const pendingLeavesCount = (data.teacherLeaveRequests || []).filter(
    (l) => l.status === 'Pending',
  ).length;
  const unpublishedCoversCount = (data.substitutionAssignments || []).filter(
    (c) => c.publishStatus === 'pending_review',
  ).length;
  const decksAwaitingApprovalCount = (data.redesignedDecks || []).filter(
    (d) => d.approvalStatus !== 'principal_approved',
  ).length;
  const activeCareerPlansCount = (data.studentCareerPlans || []).length;

  const todayDate = resolveTodayIsoDate();
  const todayAttendance = summarizeDailyAttendanceDashboard(
    students,
    data.attendance || [],
    todayDate,
  );
  const monthlyAttendanceAgg = summarizeMonthlyAttendanceByMonth(data.monthlyAttendance || []);

  const linkedStudent = !isStaff ? students[0] || null : null;
  const linkedTodayRecord = linkedStudent
    ? (data.attendance || []).find((a) => a.studentId === linkedStudent.id && a.date === todayDate) ||
      null
    : null;
  const linkedLatestReading = linkedStudent
    ? (data.readingReports || [])
        .filter((r) => r.studentId === linkedStudent.id)
        .slice(-1)[0] || null
    : null;
  const linkedLatestNumeracy = linkedStudent
    ? (data.numeracyReports || [])
        .filter((r) => r.studentId === linkedStudent.id)
        .slice(-1)[0] || null
    : null;
  const linkedHomework = linkedStudent
    ? sortStudentHomeworkRows({
        assignments: data.homeworkAssignments || [],
        submissions: data.homeworkSubmissions || [],
        studentId: linkedStudent.id,
        classSection: linkedStudent.classSection,
        todayIso: todayDate,
      })
    : null;
  const linkedAttendanceNotifications = linkedStudent
    ? sortAttendanceNotifications(
        (data.attendanceNotifications || []).filter((n) => n.studentId === linkedStudent.id),
      )
    : [];
  const linkedNotifSummary = summarizeParentAttendanceNotifications(
    linkedAttendanceNotifications,
    todayDate,
  );
  const linkedNotebookNotifications = linkedStudent
    ? (data.notebookNotifications || []).filter((n) => n.studentId === linkedStudent.id)
    : [];
  const linkedConsistencyStreak = linkedStudent
    ? computeStudentConsistencyStreak({
        studentId: linkedStudent.id,
        notebookEntries: data.notebookEntries || [],
        homeworkAssignments: data.homeworkAssignments || [],
        homeworkSubmissions: data.homeworkSubmissions || [],
        referenceDate: todayDate,
      })
    : null;
  const linkedBrainGymLogs = linkedStudent
    ? (data.vcipBrainGymLogs || []).filter((g) => g.studentId === linkedStudent.id)
    : [];

  async function handleAcknowledgeAttendanceNotification(notifId: string) {
    setAckError(null);
    setAckBusyId(notifId);
    try {
      await apiRequest(
        `/api/attendance/notifications/${notifId}/acknowledge`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
    } catch (e) {
      setAckError(e instanceof Error ? e.message : 'Unable to acknowledge attendance alert.');
    } finally {
      setAckBusyId(null);
    }
  }

  const teacherClassTargets =
    isStaff && user.role !== 'counsellor'
      ? buildTeacherClassTargets({
          students,
          timetable: data.timetable,
          userName: user.name,
          classTeacherOf: user.classTeacherOf,
          defaultSubject: extractDefaultSubject(user.subjectSpecialty),
        })
      : [];

  const teacherRecentHomework = isTeacher
    ? summarizeTeacherRecentHomework({
        assignments: data.homeworkAssignments || [],
        submissions: data.homeworkSubmissions || [],
        todayIso: todayDate,
      })
    : [];

  function openAssignHomeworkModal(prefill?: { classSection?: string; subject?: string }) {
    setHomeworkPrefill(prefill || {});
    setHomeworkModalOpen(true);
  }

  // Easy-to-understand plain-language Family Portal for Parents (supports 1 child or multiple children)
  if (isParent) {
    return (
      <ParentEasyPortalOverview
        data={data}
        parentLang={parentLang}
        onChangeLang={handleParentLangChange}
        onNavigateModule={(mod) => onNavigate(mod as WorkspaceTab)}
        onAcknowledgeNotification={handleAcknowledgeAttendanceNotification}
        acknowledgingId={ackBusyId}
        onOpenStudent={onOpenStudent}
      />
    );
  }

  const teacherClassCount = new Set(students.map((s) => s.classSection)).size;
  const teacherPendingCReviews = notebookEntries.filter((n) => n.workQuality === 'C').length;

  return (
    <div className="space-y-6">
      {/* Focused Role-Specific Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold text-amber-700">
            {isStudent
              ? `${activeSchool.name} · Session ${activeSchool.session}`
              : `${activeSchool.name} · ${activeSchool.board} · Session ${activeSchool.session}`}
          </p>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
            {isStudent
              ? `Welcome back, ${user.name.split(' ')[0]}`
              : isTeacher
                ? `Good day, ${user.name}`
                : `Welcome, ${user.name}`}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isStudent && linkedStudent
              ? `Class ${linkedStudent.classSection} · Roll ${linkedStudent.rollNo} · Daily learning & homework`
              : isTeacher
                ? `${user.designation}${user.classTeacherOf ? ` · Class Teacher ${user.classTeacherOf}` : ''}`
                : `${user.designation} · ${activeSchool.code}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAccountant && (
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
            >
              <IndianRupee className="h-4 w-4" />
              Open Finance &amp; Fees
            </button>
          )}

          {isStudent && (
            <>
              <button
                type="button"
                onClick={() =>
                  onOpenStudyGames ? onOpenStudyGames() : onNavigate('academics')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="h-4 w-4" />
                Play Study Games
              </button>
              <button
                type="button"
                onClick={() => onNavigate('marks_report_card')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#142B46]" />
                Marks &amp; Report Card
              </button>
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <CalendarDays className="h-4 w-4 text-[#142B46]" />
                Events
              </button>
            </>
          )}

          {isTeacher && (
            <>
              <button
                type="button"
                onClick={() => openAssignHomeworkModal()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
              >
                <BookOpenCheck className="h-4 w-4" />
                Assign Homework
              </button>
              <button
                type="button"
                onClick={() => onNavigate('marks_report_card')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#142B46]" />
                Enter Exam Marks
              </button>
            </>
          )}

          {canApprove && (
            <>
              <div
                role="tablist"
                aria-label="Leadership dashboard view"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 text-xs"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={leadershipView === 'daily'}
                  onClick={() => setLeadershipView('daily')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                    leadershipView === 'daily'
                      ? 'bg-[#142B46] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Daily Command
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={leadershipView === 'insights'}
                  onClick={() => setLeadershipView('insights')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                    leadershipView === 'insights'
                      ? 'bg-[#142B46] text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Rankings &amp; Setup
                </button>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('marks_report_card')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#142B46]" />
                Marks &amp; Reports
              </button>
              <button
                type="button"
                onClick={() => onNavigate('finance')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
              >
                <IndianRupee className="h-4 w-4 text-[#D6B66D]" />
                Finance &amp; Fees
              </button>
            </>
          )}

          {user.role === 'counsellor' && (
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E3B5C] transition-colors whitespace-nowrap shrink-0"
            >
              Student 360° Profiles
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {publishedHomeworkBanner && (
        <div
          data-testid="dashboard-homework-pushed-banner"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Pushed &ldquo;{publishedHomeworkBanner.assignments[0]?.title}&rdquo; to{' '}
                {publishedHomeworkBanner.assignments
                  .map((a) => `Class ${a.classSection}`)
                  .join(', ')}
              </p>
              <p className="text-emerald-800 mt-0.5 font-mono tabular-nums">
                Delivered to {publishedHomeworkBanner.totalStudents} student profiles · Immediate visibility in Student 360° &amp; Parent Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {onOpenStudent && publishedHomeworkBanner.sampleStudentId && (
              <button
                type="button"
                onClick={() => onOpenStudent(publishedHomeworkBanner.sampleStudentId!)}
                className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap"
              >
                Inspect Class Profile →
              </button>
            )}
            <button
              type="button"
              onClick={() => setPublishedHomeworkBanner(null)}
              className="font-semibold text-emerald-800 hover:underline whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Yearly Target Absence Risk Alert Banner (Management, Coordinators, Teachers & Students) */}
      {(() => {
        const riskAlerts = (data.absenceTargetRiskAlerts || []).filter(
          (a) => a.status === 'Active' || !a.acknowledgedByManagement,
        );
        if (riskAlerts.length === 0 || isAccountant) return null;
        return (
          <div
            data-testid="management-absence-target-risk-banner"
            className="rounded-xl border border-amber-300 bg-amber-50/70 p-5 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                  Absence Risk Alerts · Student Yearly Skill Targets ({riskAlerts.length})
                </p>
                <p className="text-xs text-amber-950/80 mt-0.5">
                  Absences below target pace make achievable yearly targets harder to hit. Parents and school management are alerted simultaneously.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="rounded-lg border border-[#142B46]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap shrink-0 self-start"
              >
                Open Events Calendar ({(data.schoolEvents || []).length}) →
              </button>
            </div>
            <div className="divide-y divide-amber-200/70">
              {riskAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-[#142B46]">
                      {alert.studentName} · Class {alert.classSection} ·{' '}
                      <span
                        className={
                          alert.riskLevel === 'Critical Risk' ? 'text-rose-700' : 'text-amber-800'
                        }
                      >
                        {alert.riskLevel}
                      </span>{' '}
                      <span className="font-mono font-normal text-slate-600 tabular-nums">
                        (Att: {alert.attendancePct}% · Absent {alert.absenceDate})
                      </span>
                    </p>
                    <p className="text-slate-700">
                      {user.role === 'student' ? alert.parentMessage : alert.managementMessage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenStudent && (
                      <button
                        type="button"
                        onClick={() => onOpenStudent(alert.studentId)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50 whitespace-nowrap"
                      >
                        View Yearly Plan
                      </button>
                    )}
                    {isStaff && !alert.acknowledgedByManagement && (
                      <button
                        type="button"
                        disabled={ackBusyId === alert.id}
                        onClick={async () => {
                          setAckBusyId(alert.id);
                          try {
                            await apiRequest(
                              `/api/yearly-plans/alerts/${alert.id}/acknowledge`,
                              { method: 'POST' },
                              token,
                            );
                            await onRefresh();
                          } finally {
                            setAckBusyId(null);
                          }
                        }}
                        className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap"
                      >
                        {ackBusyId === alert.id ? 'Saving...' : 'Acknowledge'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {user.role === 'accountant' && (
        <>
          <AccountsDailyClosingStrip data={data} />
          <AccountantDashboardPanel
            data={data}
            user={user}
            token={token}
            onRefresh={onRefresh}
          />
        </>
      )}

      {isTeacher && (
        <TodayWorkspace
          data={data}
          token={token}
          onRefresh={onRefresh}
          onNavigate={onNavigate}
          onOpenStudent={onOpenStudent}
          onAssignHomework={openAssignHomeworkModal}
          onOpenDailyHomework={onOpenDailyHomework}
          teacherDigest={teacherDigest}
          teacherRecentHomework={teacherRecentHomework}
          teacherClassTargets={teacherClassTargets}
          initialFocusMode={initialTodayFocusMode}
          focusModeNonce={todayFocusNonce}
        />
      )}

      {canApprove && leadershipView === 'daily' && (
        <LeadershipDecisionInbox
          data={data}
          token={token}
          onRefresh={onRefresh}
          onNavigate={onNavigate}
          onApproveStudentReport={onApproveStudentReport}
        />
      )}

      {canApprove &&
        leadershipView === 'daily' &&
        (data.substitutionAssignments || []).some((c) => Boolean(c.substituteTeacherName)) && (
          <section
            data-testid="leadership-adjusted-substitutes"
            aria-label="Adjusted Substitute Periods"
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-5 py-3.5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Adjusted Substitute Periods (
                  {
                    (data.substitutionAssignments || []).filter((c) =>
                      Boolean(c.substituteTeacherName),
                    ).length
                  }
                  )
                </h2>
                <p className="text-xs text-slate-500">
                  Live substitute cover adjustments showing each period, assigned substitute teacher, and acknowledgement status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('timetable_leave')}
                className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                Manage in Smart Timetable →
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {(data.substitutionAssignments || [])
                .filter((c) => Boolean(c.substituteTeacherName))
                .slice(0, 6)
                .map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums">
                      <span className="font-mono font-semibold text-blue-900">P{c.period}</span>
                      <span className="font-semibold text-slate-900">
                        Class {c.classSection} · {c.subject}
                      </span>
                      <span className="text-slate-500">
                        · {c.day} {c.date} · {c.timeRange}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="font-semibold text-blue-900">
                        Substitute Teacher: {c.substituteTeacherName}
                      </span>
                      <span className="text-slate-500">for {c.absentTeacherName}</span>
                      <span
                        className={`font-medium ${
                          c.publishStatus === 'published' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {c.publishStatus === 'published' ? 'Published' : 'Pending Publish'}
                      </span>
                      <span
                        className={`font-medium ${
                          c.acknowledgedBySubstitute ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {c.acknowledgedBySubstitute
                          ? '✓ Confirmed by Substitute'
                          : 'Awaiting Teacher Ack'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* Key Institutional KPIs (Leadership Daily Command & Counsellor only — hidden for Teachers, Students, Accountants) */}
      {user.role !== 'accountant' &&
        !isTeacher &&
        !isStudent &&
        (!canApprove || leadershipView === 'daily') && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Active Students</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
                {students.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Enrolled in {activeSchool.code}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Mean Learners Score</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
                {avgLearnersScore !== null ? `${avgLearnersScore} / 100` : 'Pending'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                School-wide holistic average
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Notebook Checks Logged</p>
              <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
                {notebookEntries.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Updated by subject teachers
              </p>
            </div>

            {canApprove ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-500">Outstanding Fee Balance</p>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
                  ₹{pendingFeeInr.toLocaleString('en-IN')}
                </p>
                {hasRealTimeFeeLedger ? (
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">
                      {(data.feeAccounts || []).filter((a) => a.balanceFeesInr > 0).length} pending ·{' '}
                      {unreviewedSiblingAlertsCount} sibling alerts
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('finance')}
                      className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                    >
                      Open →
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    {feeTransactions.filter((f) => f.status !== 'Paid').length} pending accounts
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-medium text-slate-500">Approved Study Resources</p>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums mt-2">
                  {data.resources.filter((r) => r.status === 'Approved').length}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {data.resources.length} total class materials
                </p>
              </div>
            )}
          </div>
        )}

      {/* Consolidated Principal / Coordinator / Counsellor Intelligence Command Center (shown in Rankings & Setup or for Counsellor) */}
      {showCommandCenter && (!canApprove || leadershipView === 'insights') && (
        <section
          aria-label="Consolidated Intelligence Command Center"
          data-testid="intelligence-command-center"
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
            <div>
              <h2 className="font-display text-sm font-bold text-slate-900">
                Integrated School Intelligence Command Strip
              </h2>
              <p className="text-xs text-slate-500">
                Live operational queues across Thinking Tests &amp; OLQ, Smart Timetable &amp; Leave, Faculty Productivity, Career Intelligence, and Visual Presentations.
              </p>
            </div>
            <span className="font-mono text-[11px] font-semibold text-blue-900">
              {activeSchool.code} · {user.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
            <div className="p-4 flex flex-col justify-between gap-2.5">
              <div>
                <p className="text-slate-500 font-medium">Thinking Tests &amp; OLQ</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {thinkingPendingReviewCount} pending review
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {(data.thinkingAssessments || []).length} total SRT/WAT/TAT/PPDT records
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('thinking')}
                className="self-start text-xs font-semibold text-blue-900 hover:underline"
              >
                Open Thinking Tests →
              </button>
            </div>

            {user.role !== 'counsellor' && (
              <div className="p-4 flex flex-col justify-between gap-2.5">
                <div>
                  <p className="text-slate-500 font-medium">Timetable &amp; Leave Cover</p>
                  <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                    {pendingLeavesCount} {pendingLeavesCount === 1 ? 'leave' : 'leaves'} · {unpublishedCoversCount} draft {unpublishedCoversCount === 1 ? 'cover' : 'covers'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {data.timetable.length} lessons scheduled · {data.timetableMasterConfig?.publishState === 'published' ? 'Published' : 'Draft'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('timetable_leave')}
                  className="self-start text-xs font-semibold text-blue-900 hover:underline"
                >
                  Open Smart Timetable →
                </button>
              </div>
            )}

            {user.role !== 'counsellor' && (
              <div className="p-4 flex flex-col justify-between gap-2.5">
                <div>
                  <p className="text-slate-500 font-medium">Teacher Productivity</p>
                  <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                    {(data.teacherLeaveBalances || []).length} faculty tracked
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Contextual KPIs · Alphabetical · Zero ranking
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('productivity')}
                  className="self-start text-xs font-semibold text-blue-900 hover:underline"
                >
                  Open Productivity Report →
                </button>
              </div>
            )}

            <div className="p-4 flex flex-col justify-between gap-2.5">
              <div>
                <p className="text-slate-500 font-medium">Career Intelligence</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {activeCareerPlansCount} student {activeCareerPlansCount === 1 ? 'plan' : 'plans'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {(data.careerProfiles || []).length} 9-section verified career paths
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('career')}
                className="self-start text-xs font-semibold text-blue-900 hover:underline"
              >
                Open Career Platform →
              </button>
            </div>

            {user.role !== 'counsellor' && (
              <div className="p-4 flex flex-col justify-between gap-2.5">
                <div>
                  <p className="text-slate-500 font-medium">Visual Presentations</p>
                  <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                    {decksAwaitingApprovalCount} awaiting approval
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(data.presentationAudits || []).length} audited · Math EN-only enforced
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenPresentationStudio
                      ? onOpenPresentationStudio()
                      : onNavigate('academics')
                  }
                  className="self-start text-xs font-semibold text-blue-900 hover:underline"
                >
                  Open Redesign Studio →
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Management Today Present & Absent Snapshot + Monthly Attendance Trend (Leadership Daily Command) */}
      {isStaff &&
        !isTeacher &&
        user.role !== 'counsellor' &&
        user.role !== 'accountant' &&
        (!canApprove || leadershipView === 'daily') && (
        <section
          aria-label="Today Attendance Monitor"
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Today&apos;s Student Attendance Snapshot ({todayDate})
              </h2>
              <p className="text-xs text-slate-500">
                Live roll-call counts across {students.length} visible active student(s) · Attendance never alters OLQs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('attendance_heatmap')}
              className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              Open Attendance Heatmap &amp; Support →
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-b border-slate-200">
            <div className="p-4">
              <p className="text-xs text-slate-500">Today Present Students</p>
              <p className="font-mono text-2xl font-semibold text-emerald-700 tabular-nums mt-1">
                {todayAttendance.presentCount}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500">Total Absent Students</p>
              <p className="font-mono text-2xl font-semibold text-red-700 tabular-nums mt-1">
                {todayAttendance.absentCount}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500">On Approved Leave</p>
              <p className="font-mono text-2xl font-semibold text-amber-700 tabular-nums mt-1">
                {todayAttendance.leaveCount}
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500">Today Present Rate</p>
              <p className="font-mono text-2xl font-semibold text-blue-900 tabular-nums mt-1">
                {todayAttendance.presentRatePct}%
              </p>
            </div>
          </div>

          {monthlyAttendanceAgg.length > 0 && (
            <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className="font-semibold text-slate-700">Monthly Attendance (2026):</span>
              {monthlyAttendanceAgg.map((m) => (
                <span key={m.month} className="font-mono text-slate-700 tabular-nums">
                  {m.month.slice(0, 3)}:{' '}
                  <strong className="text-slate-900">{m.attendancePct}%</strong>
                </span>
              ))}
            </div>
          )}

          {todayAttendance.absentStudents.length > 0 && (
            <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <p className="text-slate-600 truncate">
                <span className="font-semibold text-red-700">Absent Today: </span>
                {todayAttendance.absentStudents
                  .slice(0, 6)
                  .map((a) => `${a.student.name} (${a.student.classSection})`)
                  .join(' · ')}
                {todayAttendance.absentStudents.length > 6
                  ? ` · +${todayAttendance.absentStudents.length - 6} more`
                  : ''}
              </p>
              {onOpenStudent && todayAttendance.absentStudents[0] && (
                <button
                  type="button"
                  onClick={() => onOpenStudent(todayAttendance.absentStudents[0].student.id)}
                  className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
                >
                  Inspect Student 360° →
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Student Daily Learning Home (Clean, Calm, Action-First) */}
      {!isStaff && linkedStudent && (
        <>
          {/* Compact 4-Metric Personal Hairline Strip */}
          <section
            aria-label="My Daily Summary"
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-slate-200 text-xs">
              <div className="p-4">
                <p className="text-slate-500">Today&apos;s Attendance</p>
                <p
                  className={`font-mono text-lg font-bold mt-1 ${
                    linkedTodayRecord?.status === 'Present'
                      ? 'text-emerald-700'
                      : linkedTodayRecord?.status === 'Absent'
                        ? 'text-red-700'
                        : 'text-slate-900'
                  }`}
                >
                  {linkedTodayRecord?.status || 'Not Marked'}
                </p>
              </div>
              <div className="p-4">
                <p className="text-slate-500">Overall Attendance</p>
                <p className="font-mono text-lg font-bold text-[#142B46] tabular-nums mt-1">
                  {linkedStudent.attendancePct}%
                </p>
              </div>
              <div className="p-4">
                <p className="text-slate-500">Active Homework</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {linkedHomework ? `${linkedHomework.activeCount} tasks` : '0 tasks'}
                </p>
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <p className="text-slate-500">Reading &amp; Numeracy</p>
                  <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                    {linkedLatestReading ? `${linkedLatestReading.overallPct}%` : '—'} /{' '}
                    {linkedLatestNumeracy ? `${linkedLatestNumeracy.overallPct}%` : '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('marks_report_card')}
                  className="text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
                >
                  Marks →
                </button>
              </div>
            </div>
          </section>

          {isStudent && (
            <>
              <StudentDashboardBrainGym
                token={token}
                studentId={linkedStudent.id}
                studentName={linkedStudent.name}
                classSection={linkedStudent.classSection}
                classLevel={extractClassNumber(linkedStudent.classSection)}
                todayDateKey={todayDate}
                logs={linkedBrainGymLogs}
                onRefresh={onRefresh}
                onOpenFullBrainGym={() =>
                  onOpenDailyBrainGym
                    ? onOpenDailyBrainGym()
                    : onNavigate('cognitive_profile')
                }
              />

              <GlobalClassroomLeaderboard
                token={token}
                studentName={linkedStudent.name}
                classSection={linkedStudent.classSection}
                onOpenStudyGames={() =>
                  onOpenStudyGames ? onOpenStudyGames() : onNavigate('academics')
                }
              />
            </>
          )}

          {linkedHomework && (
            <section
              aria-label="Daily Class Homework"
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4 text-[#142B46]" />
                    Daily Homework (Class {linkedStudent.classSection})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-mono tabular-nums">{linkedHomework.activeCount} active</span>
                    {' · '}
                    <span className="font-mono tabular-nums">{linkedHomework.todayCount} assigned today</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenStudent ? onOpenStudent(linkedStudent.id) : onNavigate('students')
                  }
                  className="text-xs font-semibold text-[#142B46] hover:underline whitespace-nowrap shrink-0"
                >
                  Full History →
                </button>
              </div>

              {linkedHomework.rows.filter((r) => r.assignment.status === 'Active').length === 0 ? (
                <div className="px-6 py-5 text-xs text-slate-500">
                  No active homework for Class {linkedStudent.classSection} today.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {linkedHomework.rows
                    .filter((r) => r.assignment.status === 'Active')
                    .slice(0, 5)
                    .map(({ assignment, effectiveStatus, isAssignedToday, submission }) => (
                      <div
                        key={assignment.id}
                        className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-slate-900">
                            {isAssignedToday && (
                              <span className="font-mono text-emerald-700 mr-2">TODAY</span>
                            )}
                            {assignment.subject}: {assignment.title}
                          </p>
                          <p className="text-slate-600">{assignment.instructions}</p>
                          <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                            Due {assignment.dueDate} · {assignment.createdBy}
                            {submission?.feedback ? ` · "${submission.feedback}"` : ''}
                          </p>
                        </div>
                        <span
                          className={`font-semibold whitespace-nowrap shrink-0 ${
                            effectiveStatus === 'Handed In'
                              ? 'text-emerald-700'
                              : effectiveStatus === 'Missing'
                                ? 'text-amber-700'
                                : effectiveStatus === 'Late'
                                  ? 'text-blue-900'
                                  : 'text-slate-600'
                          }`}
                        >
                          {effectiveStatus === 'Missing' ? 'Not Complete' : effectiveStatus}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          )}

          {linkedConsistencyStreak && (
            <ConsistencyStreakCard
              studentName={linkedStudent.name}
              summary={linkedConsistencyStreak}
              onOpenNotebookReport={() =>
                onOpenStudent ? onOpenStudent(linkedStudent.id) : onNavigate('students')
              }
            />
          )}

          {linkedNotebookNotifications.length > 0 && (
            <NotebookIncompleteAlertsPanel
              notifications={linkedNotebookNotifications}
              viewerRole={user.role}
              token={token}
              onRefresh={onRefresh}
              parentLang="en"
              maxItems={4}
              showWhenEmpty={false}
            />
          )}

          {linkedAttendanceNotifications.length > 0 && (
            <section
              aria-label="Daily Attendance Notifications"
              data-testid="parent-attendance-notifications-card"
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-[#142B46] shrink-0" />
                  Recent Attendance Updates
                </h2>
                <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums shrink-0">
                  {linkedNotifSummary.unreadCount > 0
                    ? `${linkedNotifSummary.unreadCount} unread`
                    : `${linkedNotifSummary.totalSent} delivered`}
                </span>
              </div>

              {ackError && (
                <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
                  {ackError}
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {linkedAttendanceNotifications.slice(0, 4).map((notif) => {
                  const statusColor =
                    notif.attendanceStatus === 'Present'
                      ? 'text-emerald-700'
                      : notif.attendanceStatus === 'Absent'
                        ? 'text-red-700'
                        : 'text-amber-700';
                  return (
                    <div
                      key={notif.id}
                      data-testid={`parent-notif-item-${notif.id}`}
                      className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900 tabular-nums">
                            {notif.date}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className={`font-semibold ${statusColor}`}>
                            {notif.attendanceStatus}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{notif.messageEn}</p>
                      </div>

                      <div className="shrink-0">
                        {notif.acknowledgedByParent ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 whitespace-nowrap">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Acknowledged
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={ackBusyId === notif.id}
                            onClick={() => void handleAcknowledgeAttendanceNotification(notif.id)}
                            className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1E3B5C] disabled:opacity-50 whitespace-nowrap"
                          >
                            {ackBusyId === notif.id ? 'Confirming...' : 'Acknowledge'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* Teacher Today Digest consolidated into TodayWorkspace above */}

      {/* Management Intelligence Alerts (Leadership Daily Command) */}
      {canApprove && leadershipView === 'daily' && managementAlerts.length > 0 && (
        <section
          aria-label="Management Intelligence Alerts"
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-900" />
                Management Intelligence & Family Engagement Alerts
              </h2>
              <p className="text-xs text-slate-500">
                Rule-based operational cues with explicit explanations and recommended staff actions.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {managementAlerts.length} Active
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {managementAlerts.map((alert) => {
              const sevColor =
                alert.severity === 'High'
                  ? 'text-red-700'
                  : alert.severity === 'Attention'
                    ? 'text-amber-700'
                    : 'text-blue-900';
              return (
                <div
                  key={alert.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      <span className={`font-mono mr-2 ${sevColor}`}>[{alert.severity}]</span>
                      {alert.title}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Why: </span>
                      {alert.why}
                    </p>
                    <p className="text-slate-500">
                      <span className="font-semibold text-slate-700">Action: </span>
                      {alert.recommendedAction}
                    </p>
                  </div>
                  {alert.targetTab !== 'overview' && (
                    <button
                      type="button"
                      onClick={() => onNavigate(alert.targetTab)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      Review Now →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Learners Score Top 3 Ranks — Leadership Rankings & Setup view or Counsellor */}
      {((canApprove && leadershipView === 'insights') || user.role === 'counsellor') &&
        data.rankings && (
          <LearnersTop3Board
            rankings={data.rankings}
            schoolName={activeSchool.name}
            schoolCode={activeSchool.code}
            activeStudentId={null}
            canInspectStudents={isStaff && Boolean(onOpenStudent)}
            onInspectStudent={onOpenStudent}
          />
        )}

      {/* Monthly Class Growth Leaderboard — Leadership Rankings & Setup view */}
      {canApprove && leadershipView === 'insights' && (
        <SkillMonthlyGrowthLeaderboard
          data={data}
          skillKey="reading"
          allowSkillSwitch={true}
          onInspectStudent={onOpenStudent}
          compact={true}
        />
      )}

      {/* Class-Level Anonymized Growth Leaderboard — Leadership Rankings & Setup view */}
      {canApprove && leadershipView === 'insights' && data.growthLeaderboards && (
        <GrowthLeaderboardCard
          leaderboards={data.growthLeaderboards}
          activeStudentId={null}
          isStaff={isStaff}
          onInspectStudent={onOpenStudent}
          onLaunchReadingTest={
            onOpenAssessmentLab
              ? () => onOpenAssessmentLab('reading', linkedStudent?.id)
              : undefined
          }
          onLaunchNumeracyTest={
            onOpenAssessmentLab
              ? () => onOpenAssessmentLab('numeracy', linkedStudent?.id)
              : undefined
          }
          compactLimit={8}
        />
      )}

      {/* School Onboarding & Readiness Checklist (Leadership Rankings & Setup view) */}
      {setupChecklist && leadershipView === 'insights' && (
        <section
          aria-label="School Onboarding Readiness Checklist"
          className="rounded-xl border border-slate-200 bg-white overflow-hidden"
        >
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-emerald-700" />
                School Setup & Operational Readiness ({activeSchool.code})
              </h2>
              <p className="text-xs text-slate-500">
                Tenant configuration checklist across UDISE+, Learners Score weights, timetable, resources, admissions, and family accounts.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
              {setupChecklist.completedCount}/{setupChecklist.totalCount} ({setupChecklist.completionPct}%)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
            {setupChecklist.steps.map((step) => (
              <div
                key={step.id}
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 shrink-0 ${
                        step.completed ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    {step.label}
                  </p>
                  <p className="text-slate-500 mt-1">{step.detail}</p>
                </div>
                {step.targetTab !== 'overview' && (
                  <button
                    type="button"
                    onClick={() => onNavigate(step.targetTab)}
                    className="self-start text-[11px] font-semibold text-blue-900 hover:underline"
                  >
                    Configure / Inspect →
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Report Approvals (Leadership Daily Command) */}
      {canApprove && leadershipView === 'daily' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Student 360° Report Approvals
              </h2>
              <p className="text-xs text-slate-500">
                Important Learners Score reports require academic coordinator or principal sign-off before parent release.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-amber-700 tabular-nums">
              {pendingApprovals.length} Pending
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              All visible student reports in {activeSchool.name} are approved.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApprovals.slice(0, 12).map((st) => {
                const bd = studentBreakdowns[st.id];
                return (
                  <div
                    key={st.id}
                    className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {st.name} · Class {st.classSection}
                      </p>
                      <p className="text-xs text-slate-500">
                        Learners Score: {bd?.overallScore ?? 'Pending'}/100 · Coverage:{' '}
                        {bd?.evidenceCoveragePct ?? 0}% · Status: {st.reportApprovalStatus}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onApproveStudentReport(st.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Approve Report
                    </button>
                  </div>
                );
              })}
              {pendingApprovals.length > 12 && (
                <div className="px-6 py-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50/70">
                  <span>
                    Showing 12 of {pendingApprovals.length} pending 360° report approvals
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('students')}
                    className="font-semibold text-blue-900 hover:underline whitespace-nowrap"
                  >
                    Open Student 360° Directory →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Audit Logs & Evidence Trail (Leadership Rankings & Setup view) */}
      {canApprove && leadershipView === 'insights' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-slate-900">
              Recent Tenant Audit Trail
            </h2>
            <span className="text-xs text-slate-500">Immutable change history</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                  <th className="px-6 py-3 font-semibold">Actor</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                  <th className="px-6 py-3 font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.slice(0, 6).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-500 whitespace-nowrap tabular-nums">
                      {log.timestamp.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="px-6 py-3 text-slate-900 font-medium whitespace-nowrap">
                      {log.actorName} · {log.actorRole}
                    </td>
                    <td className="px-6 py-3 font-mono text-blue-900 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAccountant && isStaff && user.role !== 'counsellor' && (
        <AssignHomeworkModal
          open={homeworkModalOpen}
          onClose={() => setHomeworkModalOpen(false)}
          data={data}
          token={token}
          initialClassSection={homeworkPrefill.classSection}
          initialSubject={homeworkPrefill.subject}
          onRefresh={onRefresh}
          onPublished={(res) => setPublishedHomeworkBanner(res)}
        />
      )}
    </div>
  );
};

