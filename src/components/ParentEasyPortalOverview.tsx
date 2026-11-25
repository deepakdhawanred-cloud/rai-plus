import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Heart,
  IndianRupee,
  Languages,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ParentAttendanceNotification } from '../types';
import type { WorkspaceData, WorkspaceTab } from '../types/workspace';
import {
  buildParentFamilyOverview,
  type EasyStatusLevel,
  type ParentEasyChildSummary,
} from '../utils/parentEasyReportEngine';
import type { ParentLang } from '../utils/parentTranslations';
import { resolveTodayIsoDate } from '../utils/visAcademicProgressEngine';
import { ParentQuickDigestCard } from './ParentQuickDigestCard';

interface ParentEasyPortalOverviewProps {
  data: WorkspaceData;
  parentLang: ParentLang;
  onChangeLang: (lang: ParentLang) => void;
  onNavigateModule: (moduleId: string) => void;
  onAcknowledgeNotification: (notificationId: string) => Promise<void>;
  acknowledgingId: string | null;
  onOpenStudent?: (studentId: string) => void;
}

function statusTextClass(level: EasyStatusLevel): string {
  if (level === 'great') return 'text-emerald-700';
  if (level === 'good') return 'text-[#142B46]';
  return 'text-amber-700';
}

export const ParentEasyPortalOverview: React.FC<ParentEasyPortalOverviewProps> = ({
  data,
  parentLang,
  onChangeLang,
  onNavigateModule,
  onAcknowledgeNotification,
  acknowledgingId,
  onOpenStudent,
}) => {
  const isHi = parentLang === 'hi';
  const todayIso = resolveTodayIsoDate();

  const family = useMemo(
    () =>
      buildParentFamilyOverview({
        students: data.students,
        lang: parentLang,
        studentBreakdowns: data.studentBreakdowns,
        attendanceRecords: data.attendance,
        homeworkAssignments: data.homeworkAssignments,
        homeworkSubmissions: data.homeworkSubmissions,
        notebookEntries: data.notebookEntries,
        readingReports: data.readingReports,
        numeracyReports: data.numeracyReports,
        computerSkillAttempts: data.computerSkillAttempts,
        thinkingAssessments: data.thinkingAssessments,
        vcipAttempts: data.vcipAttempts,
        examMarks: data.examMarks,
      }),
    [data, parentLang],
  );

  // When parent has 2+ children, default to 'all' so both children are immediately visible,
  // and allow 1-click switching to Child 1, Child 2, etc.
  const [selectedChildId, setSelectedChildId] = useState<string>(() =>
    data.students.length > 1 ? 'all' : data.students[0]?.id || '',
  );
  const [showWeeklyDigest, setShowWeeklyDigest] = useState<boolean>(false);

  const effectiveSelectedId =
    selectedChildId === 'all' && family.children.length > 1
      ? 'all'
      : family.children.some((c) => c.student.id === selectedChildId)
        ? selectedChildId
        : family.children[0]?.student.id || '';

  const activeChild: ParentEasyChildSummary | null =
    effectiveSelectedId === 'all'
      ? null
      : family.children.find((c) => c.student.id === effectiveSelectedId) ||
        family.children[0] ||
        null;

  const notificationsForScope: ParentAttendanceNotification[] = useMemo(() => {
    const all = data.attendanceNotifications || [];
    if (!activeChild) return all.slice(0, 4);
    return all.filter((n) => n.studentId === activeChild.student.id).slice(0, 4);
  }, [data.attendanceNotifications, activeChild]);

  const digestChild = activeChild || family.children[0] || null;
  const digestTodayAttendance = digestChild
    ? (data.attendance || []).find(
        (a) => a.studentId === digestChild.student.id && a.date === todayIso,
      )
    : null;
  const digestTodayLabel = digestTodayAttendance
    ? digestTodayAttendance.status
    : isHi
      ? 'अपडेट लंबित'
      : 'Scheduled';
  const digestActiveHw = digestChild
    ? (data.homeworkAssignments || []).filter(
        (hw) => hw.classSection === digestChild.student.classSection && hw.dueDate >= todayIso,
      )
    : [];
  const digestPendingHwCount = digestChild
    ? digestActiveHw.filter((hw) => {
        const sub = (data.homeworkSubmissions || []).find(
          (s) => s.assignmentId === hw.id && s.studentId === digestChild.student.id,
        );
        return !sub || sub.status === 'Pending';
      }).length
    : 0;

  if (family.children.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
        <h1 className="font-display text-xl font-bold text-slate-900">
          {isHi ? 'अभिभावक पोर्टल' : 'Parent Family Portal'}
        </h1>
        <p className="text-sm text-slate-600">
          {isHi
            ? 'आपके खाते से अभी कोई विद्यार्थी जुड़ा नहीं है। कृपया स्कूल कार्यालय से संपर्क करें।'
            : 'No student profile is linked to this parent account yet. Please contact the school office.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="parent-easy-portal">
      {/* Top Calm Family Header + Language Switcher */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-900">
              {isHi ? 'सरल अभिभावक रिपोर्ट पोर्टल' : 'Easy Family Report Portal'}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              {isHi ? `नमस्ते, ${data.user.name.split('(')[0].trim()}` : `Hello, ${data.user.name.split('(')[0].trim()}`}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{family.familyHeadline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
            {digestChild && (
              <button
                type="button"
                onClick={() => setShowWeeklyDigest((prev) => !prev)}
                className="rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#F3E6D8] whitespace-nowrap cursor-pointer"
              >
                {showWeeklyDigest
                  ? isHi
                    ? 'साप्ताहिक सारांश छिपाएँ'
                    : 'Hide Weekly Digest'
                  : isHi
                    ? 'साप्ताहिक प्रिंट सारांश'
                    : 'Weekly Print Digest'}
              </button>
            )}
            <div
              className="inline-flex items-center gap-1 rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] p-0.5"
              role="group"
              aria-label="Choose parent portal language"
            >
              <Languages className="h-3.5 w-3.5 text-slate-500 ml-2 mr-0.5" />
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={parentLang === 'en'}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  parentLang === 'en'
                    ? 'bg-[#142B46] text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('hi')}
                aria-pressed={parentLang === 'hi'}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  parentLang === 'hi'
                    ? 'bg-[#142B46] text-white'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Absence Risk to Yearly Targets Alert Banner for Parents */}
        {(() => {
          const activeRiskAlerts = (data.absenceTargetRiskAlerts || []).filter(
            (a) => !activeChild || a.studentId === activeChild.student.id,
          );
          if (activeRiskAlerts.length === 0) return null;
          return (
            <div
              data-testid="parent-absence-target-risk-banner"
              className="space-y-2 pt-3 border-t border-slate-100"
            >
              {activeRiskAlerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                    alert.riskLevel === 'Critical Risk'
                      ? 'border-rose-300 bg-rose-50 text-rose-950'
                      : 'border-amber-300 bg-amber-50 text-amber-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {isHi
                        ? `वार्षिक कौशल लक्ष्य जोखिम चेतावनी · ${alert.studentName}`
                        : `Yearly Skill Target Risk Alert · ${alert.studentName} (${alert.riskLevel})`}
                    </p>
                    <span className="font-mono text-[11px] tabular-nums">
                      Attendance {alert.attendancePct}% · Absent {alert.absenceDate}
                    </span>
                  </div>
                  <p className="leading-relaxed">{alert.parentMessage}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="font-semibold">Catch-up: {alert.catchUpAction}</span>
                    {onOpenStudent && (
                      <button
                        type="button"
                        onClick={() => onOpenStudent(alert.studentId)}
                        className="rounded-lg bg-[#142B46] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap"
                      >
                        View Yearly Skill Plan →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Upcoming Events Calendar & Child Participation Shortcut */}
        {(data.schoolEvents || []).length > 0 && (
          <div className="rounded-xl border border-[#D9C9B6] bg-[#FAF4EC]/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-[#142B46] flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4 text-[#7B5D1C] shrink-0" />
                {isHi
                  ? `आगामी स्कूल कार्यक्रम (${(data.schoolEvents || []).length}) — बच्चे की भागीदारी हेतु अनुरोध भेजें`
                  : `Upcoming School Events (${(data.schoolEvents || []).length}) · Next: ${(data.schoolEvents || [])[0]?.title} (${(data.schoolEvents || [])[0]?.eventDate})`}
              </p>
              <p className="text-slate-600 mt-0.5">
                {isHi
                  ? 'कार्यक्रम की प्रगति रिपोर्ट देखें और अपने बच्चे की भागीदारी के लिए अनुरोध भेजें।'
                  : 'Check live event progress reports, assigned teachers, and push a participation request for your child.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateModule('events')}
              className="rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e3d63] whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              {isHi ? 'इवेंट कैलेंडर खोलें →' : 'Open Events & Push Request →'}
            </button>
          </div>
        )}

        {/* Child Switcher Bar (Always crystal clear for 1 child OR 2+ children) */}
        <div
          className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
          role="tablist"
          aria-label="Select child report"
        >
          {family.children.length > 1 && (
            <button
              type="button"
              role="tab"
              aria-selected={effectiveSelectedId === 'all'}
              onClick={() => setSelectedChildId('all')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                effectiveSelectedId === 'all'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              {isHi
                ? `सभी बच्चे एक साथ (${family.children.length})`
                : `All Children Together (${family.children.length})`}
            </button>
          )}
          {family.children.map((child, idx) => {
            const isSelected = effectiveSelectedId === child.student.id;
            return (
              <button
                key={child.student.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedChildId(child.student.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>
                  {child.student.name} · {isHi ? 'कक्षा' : 'Class'} {child.student.classSection}
                </span>
                {family.children.length > 1 && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Weekly Digest & Print Summary (Expanded on demand to avoid repeating daily cards) */}
      {showWeeklyDigest && digestChild && (
        <ParentQuickDigestCard
          data={data}
          linkedStudent={digestChild.student}
          allChildren={family.children.map((c) => c.student)}
          onSelectChild={(childId) => setSelectedChildId(childId)}
          todayStatusLabel={digestTodayLabel}
          activeHomeworkCount={digestActiveHw.length}
          pendingHomeworkCount={digestPendingHwCount}
          parentLang={parentLang}
          onNavigate={(tab: WorkspaceTab) => onNavigateModule(tab)}
          onOpenStudent={onOpenStudent}
        />
      )}

      {/* MODE A: Side-by-Side Comparison View for Parents with 2+ Children */}
      {effectiveSelectedId === 'all' && family.children.length > 1 && (
        <div className="space-y-5" data-testid="parent-all-children-view">
          {/* Quick Family Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                {isHi ? 'कुल पंजीकृत बच्चे' : 'Children Enrolled'}
              </p>
              <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {family.childCount}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {family.children.map((c) => `${c.student.name} (${c.student.classSection})`).join(' · ')}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                {isHi ? 'आज ध्यान देने योग्य बातें' : 'Items to Check Today'}
              </p>
              <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {family.totalAttentionItems}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {family.totalAttentionItems === 0
                  ? isHi
                    ? 'सब कुछ समय पर और ठीक है!'
                    : 'Everything is on track across all children!'
                  : isHi
                    ? 'होमवर्क, कॉपी या शुल्क की जाँच नीचे देखें'
                    : 'See homework, notebooks, or fees below'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">
                {isHi ? 'कुल बकाया स्कूल शुल्क' : 'Combined Fee Balance'}
              </p>
              <p
                className={`font-display text-2xl font-bold mt-1 tabular-nums ${
                  family.totalFeeDueInr === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {family.totalFeeDueInr === 0
                  ? isHi
                    ? '₹0 (सब जमा)'
                    : '₹0 (All Paid)'
                  : `₹${family.totalFeeDueInr.toLocaleString('en-IN')}`}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {isHi ? 'सभी बच्चों का कुल विवरण' : 'Across all linked children'}
              </p>
            </div>
          </div>

          {/* Side-by-Side Child Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {family.children.map((child) => (
              <div
                key={child.student.id}
                className="rounded-xl border border-[#E5D7C3] bg-white p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#142B46]">
                      {child.student.name}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {isHi ? 'कक्षा' : 'Class'} {child.student.classSection} · {child.student.house}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold shrink-0 ${statusTextClass(child.overallLevel)}`}
                  >
                    {child.overallLevel === 'great'
                      ? isHi
                        ? 'बहुत अच्छा'
                        : 'Doing Great'
                      : child.overallLevel === 'good'
                        ? isHi
                          ? 'अच्छी प्रगति'
                          : 'Growing Well'
                        : isHi
                          ? 'सहयोग चाहिए'
                          : 'Needs Practice'}
                  </span>
                </div>

                <p className="text-sm text-slate-700">{child.overallHeadline}</p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="font-semibold text-slate-500">
                      {isHi ? 'उपस्थिति' : 'Attendance'}
                    </p>
                    <p className="font-display text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
                      {child.attendance.attendancePct}%
                    </p>
                    <p className="text-[11px] text-slate-600">{child.attendance.todayStatusLabel}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="font-semibold text-slate-500">
                      {isHi ? 'होमवर्क व कॉपी' : 'Homework & Books'}
                    </p>
                    <p className="font-semibold text-slate-900 mt-1 leading-snug">
                      {child.homeworkAndNotebooks.headline}
                    </p>
                  </div>
                </div>

                {/* Compact 4-skill traffic lights */}
                <div className="grid grid-cols-2 gap-2">
                  {child.skills.map((sk) => {
                    const shortSkillLabel =
                      sk.id === 'reading'
                        ? isHi
                          ? 'पढ़ना'
                          : 'Reading'
                        : sk.id === 'math'
                          ? isHi
                            ? 'गणित'
                            : 'Maths'
                          : sk.id === 'computer'
                            ? isHi
                              ? 'कंप्यूटर'
                              : 'Computer'
                            : isHi
                              ? 'सोच व समझ'
                              : 'Thinking';
                    return (
                      <div
                        key={sk.id}
                        className="rounded-lg border border-slate-200 px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
                          {shortSkillLabel}
                        </span>
                        <span
                          className={`text-[11px] font-bold shrink-0 ${statusTextClass(sk.level)}`}
                        >
                          {sk.statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span
                    className={`text-xs font-semibold ${
                      child.fees.isCleared ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {child.fees.statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedChildId(child.student.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    {isHi ? `${child.student.name} की पूरी रिपोर्ट देखें` : `Open ${child.student.name}'s Easy Report`}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE B: Single-Child Crystal-Clear Plain-Language Dashboard */}
      {activeChild && (
        <div className="space-y-5" data-testid="parent-single-child-view">
          {/* 1. Overall Status Banner + Everyday Shortcuts */}
          <div className="rounded-xl border border-[#E5D7C3] bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500">
                  {activeChild.student.name} · {isHi ? 'कक्षा' : 'Class'} {activeChild.student.classSection}
                </span>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span className={`font-bold ${statusTextClass(activeChild.overallLevel)}`}>
                  {activeChild.overallLevel === 'great'
                    ? isHi
                      ? 'बहुत अच्छा'
                      : 'Doing Great'
                    : activeChild.overallLevel === 'good'
                      ? isHi
                        ? 'अच्छी प्रगति'
                        : 'Growing Well'
                      : isHi
                        ? 'अभ्यास ज़रूरी'
                        : 'Needs Practice'}
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#142B46]">
                {activeChild.overallHeadline}
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl">
                {activeChild.overallSummarySentence}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigateModule('marks_report_card')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#D6B66D]" />
                {isHi ? 'अंक व रिपोर्ट कार्ड' : 'Marks & Report Card'}
              </button>
              <button
                type="button"
                onClick={() => onNavigateModule('academics')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5D7C3] bg-white px-3.5 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#7B5D1C]" />
                {isHi ? 'अभ्यास खेल व नोट्स' : 'Study Games & Notes'}
              </button>
              <button
                type="button"
                onClick={() => onNavigateModule('operations')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5D7C3] bg-white px-3.5 py-2 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-[#7B5D1C]" />
                {isHi ? 'शुल्क व संदेश' : 'Fees & Messages'}
              </button>
            </div>
          </div>

          {/* 2. Top 3 Everyday Cards: Attendance Today | Homework Tonight | Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5D7C3] rounded-xl border border-[#E5D7C3] bg-white overflow-hidden">
            {/* Attendance Card */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <CalendarCheck className="h-4 w-4 text-[#142B46]" />
                  {isHi ? 'स्कूल उपस्थिति' : 'School Attendance'}
                </span>
                <span className="font-mono text-lg font-bold text-[#142B46] tabular-nums">
                  {activeChild.attendance.attendancePct}%
                </span>
              </div>
              <p className="text-sm font-bold text-[#142B46]">
                {activeChild.attendance.todayStatusLabel}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeChild.attendance.plainNote}
              </p>
            </div>

            {/* Homework & Notebook Tonight Card */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <BookOpen className="h-4 w-4 text-[#142B46]" />
                  {isHi ? 'आज का होमवर्क व कॉपी' : 'Homework & Notebooks'}
                </span>
                <span
                  className={`text-xs font-bold ${statusTextClass(activeChild.homeworkAndNotebooks.level)}`}
                >
                  {activeChild.homeworkAndNotebooks.pendingHomeworkCount === 0 &&
                  activeChild.homeworkAndNotebooks.notebookAttentionCount === 0
                    ? isHi
                      ? 'पूरा है'
                      : 'All Clear'
                    : isHi
                      ? 'जाँचें'
                      : 'Check Tonight'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {activeChild.homeworkAndNotebooks.headline}
              </p>
              <ul className="space-y-1 text-xs text-slate-600">
                {activeChild.homeworkAndNotebooks.plainItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-800 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fee Status Card */}
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <IndianRupee className="h-4 w-4 text-[#142B46]" />
                  {isHi ? 'स्कूल शुल्क स्थिति' : 'School Fee Status'}
                </span>
                <span
                  className={`text-xs font-bold ${
                    activeChild.fees.isCleared ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {activeChild.fees.isCleared
                    ? isHi
                      ? 'जमा है'
                      : 'Paid'
                    : isHi
                      ? 'बकाया'
                      : 'Due'}
                </span>
              </div>
              <p className="text-lg font-mono font-bold text-[#142B46] tabular-nums">
                {activeChild.fees.statusLabel}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeChild.fees.plainNote}
              </p>
            </div>
          </div>

          {/* 3. Learning & Skill Progress in Everyday Language */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {isHi
                  ? `${activeChild.student.name} पढ़ाई और कौशलों में कैसे कर रहे हैं?`
                  : `How is ${activeChild.student.name} doing in learning & skills?`}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {isHi
                  ? 'प्रत्येक विषय का सरल सारांश और घर पर मदद करने का 1 आसान तरीका।'
                  : 'Every report explained in plain words, with one simple way you can help at home.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChild.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 bg-slate-50/40"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-[#142B46]">
                        {skill.title}
                      </h4>
                      <span
                        className={`text-xs font-bold shrink-0 ${statusTextClass(skill.level)}`}
                      >
                        {skill.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-blue-900 tabular-nums">
                      {skill.headlineStat}
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {skill.plainExplanation}
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50/70 border border-blue-100 px-3 py-2 text-xs text-blue-950">
                    {skill.homeTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Strengths & Character + Daily Attendance Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-emerald-700" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  {isHi ? 'ताकत और अच्छी आदतें' : 'Strengths & Good Habits'}
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {isHi ? 'बच्चे की प्रमुख खूबियाँ' : 'What your child does well'}
                </p>
                <ul className="space-y-2">
                  {activeChild.characterStrengths.topStrengths.map((str, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-emerald-50/60 border border-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-950"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 space-y-1">
                <p className="text-xs font-bold text-amber-900">
                  {isHi ? 'इस महीने घर पर 1 आसान आदत' : '1 Simple Habit to Encourage This Month'}
                </p>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {activeChild.characterStrengths.focusHabit}
                </p>
              </div>
            </div>

            {/* School Attendance & Daily Updates */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-slate-900">
                  {isHi ? 'विद्यालय से दैनिक सूचनाएँ' : 'Recent Messages from School'}
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateModule('operations')}
                  className="text-xs font-semibold text-[#142B46] hover:underline cursor-pointer"
                >
                  {isHi ? 'शिक्षक/प्रबंधन को संदेश भेजें →' : 'Send a message to school →'}
                </button>
              </div>

              {notificationsForScope.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-5 text-xs text-slate-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>
                    {isHi
                      ? 'अभी कोई नई उपस्थिति या स्कूल सूचना नहीं है।'
                      : 'No new daily attendance alerts right now.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notificationsForScope.map((notif) => (
                    <div
                      key={notif.id}
                      className="rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">{notif.studentName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-600">{notif.date}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              notif.attendanceStatus === 'Present'
                                ? 'bg-emerald-50 text-emerald-800'
                                : notif.attendanceStatus === 'Leave'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-rose-50 text-rose-800'
                            }`}
                          >
                            {notif.attendanceStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">
                          {isHi ? notif.messageHi : notif.messageEn}
                        </p>
                      </div>

                      {notif.acknowledgedByParent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isHi ? 'पुष्ट किया गया' : 'Seen'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={acknowledgingId === notif.id}
                          onClick={() => onAcknowledgeNotification(notif.id)}
                          className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 shrink-0"
                        >
                          {acknowledgingId === notif.id
                            ? '...'
                            : isHi
                              ? 'ठीक है, देख लिया'
                              : 'Got It'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
