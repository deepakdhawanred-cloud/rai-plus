import React, { useState } from 'react';
import {
  BellRing,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  FileSearch,
  Loader2,
  Lock,
  Plus,
  Printer,
  SearchCheck,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type {
  AcademicMonthKey,
  HomeworkAssignment,
  ObservationContext,
  OlqGroup,
  OlqKey,
  VisParsedReportProfile,
  VisReportCatalogItem,
} from '../../types';
import {
  compareClassSections,
  resolveTodayIsoDate,
} from '../../utils/visAcademicProgressEngine';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { sortAttendanceNotifications } from '../../utils/attendanceNotificationEngine';
import { extractDefaultSubject, sortStudentHomeworkRows } from '../../utils/homeworkEngine';
import { PARENT_TRANSLATIONS, type ParentLang } from '../../utils/parentTranslations';
import { buildLearnersEvidenceTrace, OLQ_DEFINITIONS } from '../../utils/evidenceEngine';
import { computeStudentCognitiveProfile } from '../../utils/cognitiveProfileEngine';
import { computeStudentGameRecommendations } from '../../utils/customRecommendationsEngine';
import {
  type IncidentRatingInput,
  OBSERVATION_CONTEXTS,
} from '../../utils/olqActivityEngine';
import { computeStudentPersonalBest } from '../../utils/personalBestEngine';
import { computeStudentConsistencyStreak } from '../../utils/consistencyStreakEngine';
import { assessStudentEriksonDevelopment } from '../../utils/eriksonDevelopmentEngine';
import {
  ActivityDutyRegisterPanel,
  SectionEvidenceCoveragePanel,
} from '../ActivityCoveragePanels';
import { ConsistencyStreakCard } from '../ConsistencyStreakCard';
import { PersonalBestCard } from '../PersonalBestCard';
import { EriksonDevelopmentCard } from '../EriksonDevelopmentCard';
import { StudentBriefNotebookReport } from '../StudentBriefNotebookReport';
import { NotebookIncompleteAlertsPanel } from '../NotebookIncompleteAlertsPanel';
import { StudentGrowthReportsPanel } from '../StudentGrowthReportsPanel';
import { LearnersScoreGrowthPanel } from '../LearnersScoreGrowthPanel';
import { StudentTop3EffortCard } from '../StudentTop3EffortCard';
import { DevelopmentReviewQueuePanel } from '../DevelopmentReviewQueuePanel';
import { VisDmitProfilePanel, VisReportVisualizerModal } from '../VisReportVisualizerModal';
import { VisReportsVaultPanel } from '../VisReportsVaultPanel';
import { StudentYearlyPlanPanel } from '../StudentYearlyPlanPanel';
import { StudentPaymentTimelineModal } from '../StudentPaymentTimelinePanel';
import {
  buildStudentPaymentTimeline,
  resolveCurrentAcademicFeeMonth,
} from '../../utils/financialDashboardEngine';
import { exportStudentPaymentTimelinePdf } from '../../utils/financialPdfExporter';
import { pushToast } from '../ToastProvider';

interface Student360ModuleProps {
  data: WorkspaceData;
  token: string;
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onRefresh: () => Promise<void>;
  onApproveStudentReport: (studentId: string) => Promise<void>;
  onOpenGames?: () => void;
  onOpenAssessmentLab?: (mode: 'reading' | 'numeracy' | 'history', studentId?: string | null) => void;
  parentLang?: ParentLang;
}

const OLQ_GROUPS: OlqGroup[] = [
  'Planning and Organising',
  'Social Adjustment',
  'Social Effectiveness',
  'Dynamic Qualities',
];

export const Student360Module: React.FC<Student360ModuleProps> = ({
  data,
  token,
  selectedStudentId,
  onSelectStudent,
  onRefresh,
  onApproveStudentReport,
  onOpenGames,
  onOpenAssessmentLab,
  parentLang = 'en',
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [directoryLimit, setDirectoryLimit] = useState(80);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Longitudinal Reading & Numeracy saving state (managed via StudentGrowthReportsPanel)
  const [skillSaving, setSkillSaving] = useState(false);

  // Inline Daily Class Homework creator state (staff)
  const [showInlineHwForm, setShowInlineHwForm] = useState(false);
  const [hwSubject, setHwSubject] = useState(() => extractDefaultSubject(data.user.subjectSpecialty));
  const [hwChapter, setHwChapter] = useState('Daily Classwork & Practice');
  const [hwTitle, setHwTitle] = useState('');
  const [hwAssignedDate, setHwAssignedDate] = useState(resolveTodayIsoDate());
  const [hwDueDate, setHwDueDate] = useState('2026-11-17');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwSaving, setHwSaving] = useState(false);
  const [hwMsg, setHwMsg] = useState<string | null>(null);
  const [hwError, setHwError] = useState<string | null>(null);

  // Teacher multi-OLQ incident observation & exam marks state
  const [obsContext, setObsContext] = useState<ObservationContext>('Classroom');
  const [obsSummary, setObsSummary] = useState('');
  const [obsRatings, setObsRatings] = useState<IncidentRatingInput[]>([
    { olqKey: 'cooperation', score: 85 },
  ]);
  const [obsError, setObsError] = useState<string | null>(null);
  const [obsSaving, setObsSaving] = useState(false);

  const [examName, setExamName] = useState('Unit Assessment II');
  const [examSubject, setExamSubject] = useState('Mathematics');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [conceptualGap, setConceptualGap] = useState('');
  const [markSaving, setMarkSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<{
    targetType: 'component' | 'olq';
    targetKey: string;
  } | null>(null);
  const [subView, setSubView] = useState<'profile' | 'activity' | 'coverage' | 'vault'>('profile');
  const [modalVisProfile, setModalVisProfile] = useState<{
    profile: VisParsedReportProfile;
    item?: VisReportCatalogItem;
  } | null>(null);
  const [extractingLinked, setExtractingLinked] = useState(false);
  const [notifAckId, setNotifAckId] = useState<string | null>(null);
  const [notifResending, setNotifResending] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<string | null>(null);
  const [showPaymentTimeline, setShowPaymentTimeline] = useState(false);
  const [feeAlertAckId, setFeeAlertAckId] = useState<string | null>(null);

  const isStaff = !['parent', 'student'].includes(data.user.role);
  const canEditAcademic = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    data.user.role,
  );
  const canApprove = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(
    data.user.role,
  );

  const directoryClassOptions = Array.from(
    new Set(data.students.map((s) => s.classSection)),
  ).sort(compareClassSections);

  const filteredStudents = data.students.filter((s) => {
    if (classFilter !== 'All' && s.classSection !== classFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.classSection.toLowerCase().includes(q)
    );
  });

  const activeStudent =
    data.students.find((s) => s.id === selectedStudentId) ||
    filteredStudents[0] ||
    data.students[0];

  if (!activeStudent) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        No student records available in this tenant view.
      </div>
    );
  }

  const canViewFeeTimeline = [
    'super_admin',
    'school_admin',
    'principal',
    'coordinator',
    'accountant',
    'parent',
  ].includes(data.user.role);
  const activeFeeMonth =
    data.financialTarget?.monthKey ?? resolveCurrentAcademicFeeMonth(resolveTodayIsoDate());
  const activeStudentFeeAccount = canViewFeeTimeline
    ? (data.feeAccounts || []).find(
        (acc) =>
          acc.studentId === activeStudent.id ||
          acc.admissionNo.trim().toUpperCase() === activeStudent.admissionNo.trim().toUpperCase(),
      ) || null
    : null;
  const activeStudentPaymentTimeline = activeStudentFeeAccount
    ? buildStudentPaymentTimeline({
        account: activeStudentFeeAccount,
        activeMonth: activeFeeMonth,
        receipts: data.feeReceipts || [],
      })
    : null;
  const activeStudentFeeAlerts = canViewFeeTimeline
    ? (data.feeDefaulterAlertLogs || []).filter(
        (n) =>
          n.studentId === activeStudent.id ||
          n.admissionNo.trim().toUpperCase() === activeStudent.admissionNo.trim().toUpperCase(),
      )
    : [];

  const breakdown = data.studentBreakdowns[activeStudent.id];
  const studentEvidence = data.evidence.filter((e) => e.studentId === activeStudent.id);
  const studentMarks = data.examMarks.filter((m) => m.studentId === activeStudent.id);
  const activeTrace = selectedTrace
    ? buildLearnersEvidenceTrace(
        studentEvidence,
        selectedTrace.targetType,
        selectedTrace.targetKey,
        data.weightsConfig.weights,
      )
    : null;
  const cognitiveProfile = computeStudentCognitiveProfile(
    activeStudent.id,
    data.cognitiveAttempts || [],
    '2026-11-14',
  );
  const customGameRecommendations = computeStudentGameRecommendations({
    student: activeStudent,
    examMarks: data.examMarks || [],
    notebookEntries: data.notebookEntries || [],
    evidence: data.evidence || [],
    breakdown,
    cognitiveAttempts: data.cognitiveAttempts || [],
    readingReports: data.readingReports || [],
    numeracyReports: data.numeracyReports || [],
  });
  const studentStanding = data.rankings?.studentStandings?.[activeStudent.id];

  const todayIso = resolveTodayIsoDate();
  const studentTodayAttendance = (data.attendance || []).find(
    (a) => a.studentId === activeStudent.id && a.date === todayIso,
  );
  const studentMonthlyAttendance = (data.monthlyAttendance || []).filter(
    (row) => row.studentId === activeStudent.id,
  );
  const studentReadingReports = (data.readingReports || []).filter(
    (row) => row.studentId === activeStudent.id,
  );
  const studentNumeracyReports = (data.numeracyReports || []).filter(
    (row) => row.studentId === activeStudent.id,
  );
  const studentAttendanceNotifications = sortAttendanceNotifications(
    (data.attendanceNotifications || []).filter((n) => n.studentId === activeStudent.id),
  );
  const isParent = data.user.role === 'parent';
  const parentStrings = PARENT_TRANSLATIONS[isParent ? parentLang : 'en'];

  async function handleResendTodayAttendanceAlert() {
    setNotifFeedback(null);
    setNotifResending(true);
    try {
      await apiRequest(
        '/api/attendance/notifications/send',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            date: todayIso,
          }),
        },
        token,
      );
      await onRefresh();
      setNotifFeedback(`Sent today's attendance notification (${todayIso}) to ${activeStudent.guardianName}.`);
    } catch (e) {
      setNotifFeedback(e instanceof Error ? e.message : 'Unable to send daily attendance message.');
    } finally {
      setNotifResending(false);
    }
  }

  async function handleAcknowledgeStudentNotif(notifId: string) {
    setNotifFeedback(null);
    setNotifAckId(notifId);
    try {
      await apiRequest(
        `/api/attendance/notifications/${notifId}/acknowledge`,
        { method: 'POST' },
        token,
      );
      await onRefresh();
    } catch (e) {
      setNotifFeedback(e instanceof Error ? e.message : 'Unable to acknowledge attendance alert.');
    } finally {
      setNotifAckId(null);
    }
  }

  async function handleGenerateInsight() {
    setAiLoading(true);
    setAiInsight(null);
    try {
      const res = await apiRequest<{ insight: string }>(
        '/api/ai/student-insight',
        {
          method: 'POST',
          body: JSON.stringify({ studentId: activeStudent.id }),
        },
        token,
      );
      setAiInsight(res.insight);
    } catch (err) {
      setAiInsight(err instanceof Error ? err.message : 'Unable to generate insight.');
    } finally {
      setAiLoading(false);
    }
  }

  function handleAddRatingSlot() {
    if (obsRatings.length >= 3) return;
    const used = new Set(obsRatings.map((r) => r.olqKey));
    const nextDef = OLQ_DEFINITIONS.find((d) => !used.has(d.key)) || OLQ_DEFINITIONS[0];
    setObsRatings((prev) => [...prev, { olqKey: nextDef.key, score: 82 }]);
  }

  async function handleAddObservation(e: React.FormEvent) {
    e.preventDefault();
    setObsError(null);
    setFormMsg(null);
    if (!obsSummary.trim()) {
      setObsError('Observed evidence summary is required.');
      return;
    }
    setObsSaving(true);
    try {
      await apiRequest(
        '/api/evidence/incident',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            context: obsContext,
            date: new Date().toISOString().slice(0, 10),
            summary: obsSummary.trim(),
            ratings: obsRatings.map((r) => ({
              olqKey: r.olqKey,
              score: Math.max(40, Math.min(100, Number(r.score) || 80)),
            })),
          }),
        },
        token,
      );
      setObsSummary('');
      setObsRatings([{ olqKey: obsRatings[0]?.olqKey || 'cooperation', score: 85 }]);
      await onRefresh();
      setFormMsg(
        `Logged [${obsContext}] observation across ${obsRatings.length} OLQ quality rating(s) and refreshed Learners Score.`,
      );
    } catch (err) {
      setObsError(err instanceof Error ? err.message : 'Unable to save observation incident.');
    } finally {
      setObsSaving(false);
    }
  }

  async function handleAddExamMark(e: React.FormEvent) {
    e.preventDefault();
    if (!obtainedMarks.trim()) return;
    setMarkSaving(true);
    setFormMsg(null);
    try {
      await apiRequest(
        '/api/exams/marks',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            examName,
            subject: examSubject,
            maxMarks: Number(maxMarks) || 100,
            obtainedMarks: Number(obtainedMarks),
            conceptualGap,
          }),
        },
        token,
      );
      setObtainedMarks('');
      setConceptualGap('');
      await onRefresh();
      setFormMsg('Examination mark recorded and Academic Development score refreshed.');
    } finally {
      setMarkSaving(false);
    }
  }

  async function handleSaveStudentReading(payload: {
    month: AcademicMonthKey;
    wpm: number;
    accuracyPct: number;
    comprehensionPct: number;
    remarks?: string;
  }) {
    setSkillSaving(true);
    setFormMsg(null);
    try {
      await apiRequest(
        '/api/reports/reading',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            month: payload.month,
            year: 2026,
            wpm: payload.wpm,
            accuracyPct: payload.accuracyPct,
            comprehensionPct: payload.comprehensionPct,
            remarks: payload.remarks,
          }),
        },
        token,
      );
      await onRefresh();
      setFormMsg(`Saved ${payload.month} 2026 reading report for ${activeStudent.name}.`);
    } finally {
      setSkillSaving(false);
    }
  }

  async function handleSaveStudentNumeracy(payload: {
    month: AcademicMonthKey;
    tablesFluencyPct: number;
    mentalMathPct: number;
    problemSolvingPct: number;
    conceptualGap?: string;
    remarks?: string;
  }) {
    setSkillSaving(true);
    setFormMsg(null);
    try {
      await apiRequest(
        '/api/reports/numeracy',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            month: payload.month,
            year: 2026,
            tablesFluencyPct: payload.tablesFluencyPct,
            mentalMathPct: payload.mentalMathPct,
            problemSolvingPct: payload.problemSolvingPct,
            conceptualGap: payload.conceptualGap,
            remarks: payload.remarks,
          }),
        },
        token,
      );
      await onRefresh();
      setFormMsg(`Saved ${payload.month} 2026 numeracy report for ${activeStudent.name}.`);
    } finally {
      setSkillSaving(false);
    }
  }

  async function handleInlineCreateHomework(e: React.FormEvent) {
    e.preventDefault();
    setHwError(null);
    setHwMsg(null);
    if (!hwSubject.trim() || !hwTitle.trim() || !hwDueDate.trim()) {
      setHwError('Subject, daily homework title, and due date are required.');
      return;
    }
    setHwSaving(true);
    try {
      const res = await apiRequest<{ assignment: HomeworkAssignment }>(
        '/api/homework',
        {
          method: 'POST',
          body: JSON.stringify({
            classSection: activeStudent.classSection,
            subject: hwSubject.trim(),
            chapter: hwChapter.trim() || 'Daily Practice',
            title: hwTitle.trim(),
            assignedDate: hwAssignedDate || todayIso,
            dueDate: hwDueDate,
            instructions: hwInstructions.trim() || 'Complete neatly in your subject notebook.',
          }),
        },
        token,
      );
      setHwTitle('');
      setHwInstructions('');
      setShowInlineHwForm(false);
      await onRefresh();
      setHwMsg(
        `Assigned daily homework "${res.assignment.title}" to Class ${res.assignment.classSection} — now visible in ${activeStudent.name}'s profile and all classmates' profiles.`,
      );
    } catch (err) {
      setHwError(err instanceof Error ? err.message : 'Unable to assign daily homework.');
    } finally {
      setHwSaving(false);
    }
  }

  const visCatalog = data.visReportsCatalog || [];
  const visParsedMap = data.visParsedReports || {};
  const linkedVisCatalogItem = activeStudent.visReportFileId
    ? visCatalog.find((c) => c.fileId === activeStudent.visReportFileId)
    : undefined;
  const linkedVisProfile = activeStudent.visReportFileId
    ? visParsedMap[activeStudent.visReportFileId]
    : undefined;

  async function handleExtractLinkedVisReport(fileId: string) {
    setExtractingLinked(true);
    try {
      const res = await apiRequest<{ profile: VisParsedReportProfile }>(
        `/api/vis-reports/${encodeURIComponent(fileId)}/extract`,
        { method: 'POST', body: JSON.stringify({}) },
        token,
      );
      await onRefresh();
      setModalVisProfile({ profile: res.profile, item: linkedVisCatalogItem });
    } finally {
      setExtractingLinked(false);
    }
  }

  const dailyHomeworkSummary = sortStudentHomeworkRows({
    assignments: data.homeworkAssignments || [],
    submissions: data.homeworkSubmissions || [],
    studentId: activeStudent.id,
    classSection: activeStudent.classSection,
    todayIso,
  });

  const personalBestSummary = computeStudentPersonalBest({
    student: activeStudent,
    readingTestSessions: data.readingTestSessions || [],
    readingReports: studentReadingReports,
  });

  const consistencyStreakSummary = computeStudentConsistencyStreak({
    studentId: activeStudent.id,
    notebookEntries: data.notebookEntries || [],
    homeworkAssignments: data.homeworkAssignments || [],
    homeworkSubmissions: data.homeworkSubmissions || [],
    referenceDate: todayIso,
  });

  const eriksonAssessment = assessStudentEriksonDevelopment({
    student: activeStudent,
    breakdown,
    evidence: data.evidence || [],
    examMarks: data.examMarks || [],
    notebookEntries: data.notebookEntries || [],
    homeworkAssignments: data.homeworkAssignments || [],
    homeworkSubmissions: data.homeworkSubmissions || [],
    readingReports: data.readingReports || [],
    readingTestSessions: data.readingTestSessions || [],
    numeracyReports: data.numeracyReports || [],
    numeracyTestSessions: data.numeracyTestSessions || [],
    activityRecords: data.activityRecords || [],
    cognitiveAttempts: data.cognitiveAttempts || [],
    personalBest: personalBestSummary,
    visProfile: linkedVisProfile || null,
  });

  return (
    <div className="space-y-5">
      {isStaff && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 print:hidden">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSubView('profile')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subView === 'profile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student 360° Record
            </button>
            <button
              type="button"
              onClick={() => setSubView('activity')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subView === 'activity'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activity & Duty Register
            </button>
            <button
              type="button"
              onClick={() => setSubView('coverage')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subView === 'coverage'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evidence Coverage
            </button>
            {visCatalog.length > 0 && (
              <button
                type="button"
                onClick={() => setSubView('vault')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  subView === 'vault'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                VIS Reports Vault ({visCatalog.length})
              </button>
            )}
          </div>
          <span className="text-xs text-slate-500">
            Holistic OLQ, Activity Roster, Evidence Density & Real VIS Telemetry
          </span>
        </div>
      )}

      {subView === 'activity' && isStaff ? (
        <ActivityDutyRegisterPanel
          data={data}
          token={token}
          onRefresh={onRefresh}
          onOpenStudent={(sid) => {
            onSelectStudent(sid);
            setSubView('profile');
          }}
        />
      ) : subView === 'coverage' && isStaff ? (
        <SectionEvidenceCoveragePanel
          data={data}
          onOpenStudent={(sid) => {
            onSelectStudent(sid);
            setSubView('profile');
          }}
        />
      ) : subView === 'vault' && isStaff ? (
        <VisReportsVaultPanel
          catalog={visCatalog}
          parsedReports={visParsedMap}
          enrolledStudents={data.students}
          token={token}
          onRefresh={onRefresh}
          onOpenProfileModal={(profile, item) => setModalVisProfile({ profile, item })}
          onOpenStudent360={(sid) => {
            onSelectStudent(sid);
            setSubView('profile');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Student Selector */}
      <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white overflow-hidden print:hidden">
        <div className="border-b border-slate-200 p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-sm font-bold text-slate-900">Student Directory</h2>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">
              {filteredStudents.length}
            </span>
          </div>
          {directoryClassOptions.length > 1 && (
            <select
              aria-label="Filter student directory by class"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setDirectoryLimit(80);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-900 focus:outline-none"
            >
              <option value="All">All Classes ({data.students.length})</option>
              {directoryClassOptions.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          )}
          {data.students.length > 1 && (
            <input
              type="search"
              aria-label="Search students by name or admission number"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDirectoryLimit(80);
              }}
              placeholder="Search name or adm no..."
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-900 focus:outline-none"
            />
          )}
        </div>
        <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
          {filteredStudents.slice(0, directoryLimit).map((st) => {
            const score = data.studentBreakdowns[st.id]?.overallScore;
            const selected = st.id === activeStudent.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  onSelectStudent(st.id);
                  setAiInsight(null);
                  setFormMsg(null);
                  setSelectedTrace(null);
                }}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-2 transition-colors ${
                  selected ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{st.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    Class {st.classSection} · {st.admissionNo}
                  </p>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums shrink-0">
                  {score ?? '—'}
                </span>
              </button>
            );
          })}
          {filteredStudents.length > directoryLimit && (
            <button
              type="button"
              onClick={() => setDirectoryLimit((n) => n + 150)}
              className="w-full px-4 py-2.5 text-xs font-semibold text-blue-900 hover:bg-slate-50 text-center"
            >
              Show more ({filteredStudents.length - directoryLimit} remaining)
            </button>
          )}
        </div>
      </div>

      {/* Main Student 360° Canvas */}
      <div className="lg:col-span-9 space-y-6">
        {/* Identity & Identifiers */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs text-slate-500">
                {activeStudent.admissionNo} · Roll {activeStudent.rollNo} · {activeStudent.house}
              </p>
              <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
                {activeStudent.name}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Class {activeStudent.classSection} · Guardian: {activeStudent.guardianName} (
                {activeStudent.guardianPhone})
              </p>
              <p className="font-mono text-xs text-slate-500 mt-1 tabular-nums">
                UDISE+: {activeStudent.udiseStudentId} · Haryana MIS: {activeStudent.haryanaMisId}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">Learners Score ({activeStudent.formulaVersion})</p>
                <p
                  className="font-mono text-3xl font-bold text-blue-900 tabular-nums"
                  data-testid="student-learners-score"
                >
                  {breakdown?.overallScore ?? 'Pending'}{' '}
                  <span className="text-sm font-normal text-slate-500">/ 100</span>
                </p>
                {studentStanding && (
                  <p className="font-mono text-[11px] font-semibold text-slate-700 tabular-nums mt-0.5">
                    Class {activeStudent.classSection}:{' '}
                    {studentStanding.classTarget.rank !== null
                      ? `#${studentStanding.classTarget.rank}/${studentStanding.classTarget.totalRanked}`
                      : 'Unranked'}{' '}
                    · School:{' '}
                    {studentStanding.schoolTarget.rank !== null
                      ? `#${studentStanding.schoolTarget.rank}/${studentStanding.schoolTarget.totalRanked}`
                      : 'Unranked'}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Report Status: <span className="font-semibold text-slate-800">{activeStudent.reportApprovalStatus}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print 360° Summary
                </button>
                {canApprove && activeStudent.reportApprovalStatus !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => void onApproveStudentReport(activeStudent.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve 360° Report
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Context + Documents + Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <p className="font-semibold text-slate-800">Attendance & Fee Context</p>
              <p className="font-mono text-slate-700 tabular-nums">
                Attendance: {activeStudent.attendancePct}%
              </p>
              <p className="text-slate-500">
                Attendance provides learning context only and never auto-penalises OLQ scores.
              </p>
              {canViewFeeTimeline && (
                <div className="pt-1 space-y-1">
                  <p className="font-mono text-slate-700 tabular-nums">
                    Fee Balance: ₹
                    {(activeStudentFeeAccount?.balanceFeesInr ?? activeStudent.feeBalanceInr).toLocaleString('en-IN')}{' '}
                    / ₹
                    {(
                      activeStudentPaymentTimeline?.defaulterMetrics.grossFeeInr ??
                      activeStudent.totalFeeAnnualInr
                    ).toLocaleString('en-IN')}
                  </p>
                  {activeStudentFeeAccount && activeStudentPaymentTimeline && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                      <span
                        className={`font-semibold ${
                          activeStudentPaymentTimeline.paymentNatureTone === 'positive'
                            ? 'text-emerald-700'
                            : activeStudentPaymentTimeline.paymentNatureTone === 'warning'
                              ? 'text-amber-700'
                              : activeStudentPaymentTimeline.paymentNatureTone === 'critical'
                                ? 'text-rose-700'
                                : 'text-slate-700'
                        }`}
                      >
                        {activeStudentPaymentTimeline.paymentNature}
                      </span>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {activeStudentPaymentTimeline.activePaymentMonthsCount}/
                        {activeStudentPaymentTimeline.monthsElapsed}m paid
                      </span>
                      <button
                        type="button"
                        data-testid="student360-open-payment-timeline-btn"
                        onClick={() => setShowPaymentTimeline(true)}
                        className="font-semibold text-blue-900 hover:underline print:hidden"
                      >
                        View Payment Timeline
                      </button>
                      <span className="text-slate-300 print:hidden" aria-hidden="true">
                        ·
                      </span>
                      <button
                        type="button"
                        data-testid="student360-export-payment-timeline-pdf-btn"
                        onClick={() => {
                          const filename = exportStudentPaymentTimelinePdf({
                            account: activeStudentFeeAccount,
                            schoolName: data.activeSchool.name,
                            schoolCode: data.activeSchool.code,
                            session: data.activeSchool.session,
                            activeMonth: activeFeeMonth,
                            receipts: data.feeReceipts || [],
                            generatedBy: data.user.name,
                          });
                          pushToast(
                            `Saved ${filename} for ${activeStudentFeeAccount.studentName}.`,
                            'success',
                            { title: 'Payment Timeline PDF Downloaded' },
                          );
                        }}
                        className="font-semibold text-slate-700 hover:text-slate-900 hover:underline print:hidden"
                      >
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-slate-800">Document Checklist</p>
              <ul className="space-y-1 text-slate-600">
                {activeStudent.documents.map((doc) => (
                  <li key={doc.name} className="flex items-center justify-between gap-2">
                    <span className="truncate">{doc.name}</span>
                    <span className={doc.verified ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-slate-800">Responsibilities & Achievements</p>
              <ul className="space-y-1 text-slate-600">
                {activeStudent.responsibilities.map((r) => (
                  <li key={r}>· {r}</li>
                ))}
                {activeStudent.achievements.map((a) => (
                  <li key={a} className="text-blue-900">
                    · {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Dispatched Fee Reminder Alerts (Visible to Parent & Authorized Fee Staff) */}
          {activeStudentFeeAlerts.length > 0 && (
            <div
              data-testid="student360-fee-alert-banner"
              className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-slate-800 space-y-2 print:hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <BellRing className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  Fee Payment Reminder Notice ({activeStudentFeeAlerts[0].activeMonth} ·{' '}
                  {activeStudentFeeAlerts[0].channel})
                </p>
                <span className="font-mono text-[11px] text-slate-600 tabular-nums">
                  Status: {activeStudentFeeAlerts[0].status}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {activeStudentFeeAlerts[0].messageBody}
              </p>
              {activeStudentFeeAlerts[0].status !== 'Acknowledged' && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    disabled={feeAlertAckId === activeStudentFeeAlerts[0].id}
                    onClick={async () => {
                      const targetId = activeStudentFeeAlerts[0].id;
                      setFeeAlertAckId(targetId);
                      try {
                        await apiRequest(
                          `/api/finance/defaulter-notifications/${targetId}/acknowledge`,
                          { method: 'PATCH' },
                          token,
                        );
                        await onRefresh();
                        pushToast('Fee reminder notice acknowledged.', 'success', {
                          title: 'Notice Acknowledged',
                        });
                      } catch (err) {
                        pushToast(
                          err instanceof Error ? err.message : 'Unable to acknowledge notice.',
                          'error',
                        );
                      } finally {
                        setFeeAlertAckId(null);
                      }
                    }}
                    className="rounded-lg border border-amber-400 bg-white px-3 py-1 text-[11px] font-semibold text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                  >
                    {feeAlertAckId === activeStudentFeeAlerts[0].id
                      ? 'Saving...'
                      : 'Acknowledge Fee Notice'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Confidential Note strictly restricted to Staff */}
          {isStaff && activeStudent.confidentialCounsellorNote && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-slate-800 flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">
                  Restricted Staff & Counsellor Note (Hidden from Parent & Student Portals)
                </p>
                <p className="mt-0.5 text-slate-700">{activeStudent.confidentialCounsellorNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Individual Student Yearly Skill Plan & Absence Risk Monitor */}
        <StudentYearlyPlanPanel
          student={activeStudent}
          plan={(data.studentYearlyPlans || []).find((p) => p.studentId === activeStudent.id)}
          alerts={data.absenceTargetRiskAlerts || []}
          userRole={data.user.role}
          token={token}
          onRefresh={onRefresh}
        />

        {/* Class & School Top 3 Standing & Effort Needed */}
        {studentStanding && <StudentTop3EffortCard standing={studentStanding} />}

        {/* Daily Class Homework & Teacher Feedback (Elevated for immediate Student/Parent/Staff visibility) */}
        <section
          aria-label="Daily Class Homework & Teacher Feedback"
          data-testid="student-daily-homework-card"
          className="scroll-mt-20 rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-blue-900" />
                Daily Class Homework &amp; Teacher Feedback (Class {activeStudent.classSection})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks assigned by class &amp; subject teachers · Pending and Cancelled homework never penalise OLQs.
              </p>
            </div>
            {canEditAcademic && (
              <button
                type="button"
                onClick={() => {
                  setHwError(null);
                  setShowInlineHwForm((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0 self-start sm:self-auto print:hidden"
              >
                <Plus className="h-3.5 w-3.5" />
                {showInlineHwForm
                  ? 'Close Homework Form'
                  : `Assign Daily Homework to Class ${activeStudent.classSection}`}
              </button>
            )}
          </div>

          {/* Inline 4-Metric KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Active Tasks</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {dailyHomeworkSummary.activeCount}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Assigned Today</p>
              <p className="font-mono text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                {dailyHomeworkSummary.todayCount}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Pending Check</p>
              <p className="font-mono text-lg font-bold text-blue-900 tabular-nums mt-0.5">
                {dailyHomeworkSummary.pendingCount}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Handed In</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {dailyHomeworkSummary.handedInCount}
              </p>
            </div>
          </div>

          {canEditAcademic && showInlineHwForm && (
            <form
              onSubmit={handleInlineCreateHomework}
              className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3 print:hidden"
            >
              <p className="text-xs font-bold text-blue-950">
                Assign Daily Homework to Class {activeStudent.classSection} (Posted as {data.user.name})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
                <label className="lg:col-span-3 space-y-1">
                  <span className="block font-medium text-slate-700">Subject *</span>
                  <input
                    type="text"
                    aria-label="Inline homework subject"
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                </label>
                <label className="lg:col-span-3 space-y-1">
                  <span className="block font-medium text-slate-700">Chapter / Topic</span>
                  <input
                    type="text"
                    aria-label="Inline homework chapter"
                    value={hwChapter}
                    onChange={(e) => setHwChapter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                </label>
                <label className="lg:col-span-3 space-y-1">
                  <span className="block font-medium text-slate-700">Assigned Date</span>
                  <input
                    type="date"
                    aria-label="Inline homework assigned date"
                    value={hwAssignedDate}
                    onChange={(e) => setHwAssignedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </label>
                <label className="lg:col-span-3 space-y-1">
                  <span className="block font-medium text-slate-700">Due Date *</span>
                  <input
                    type="date"
                    aria-label="Inline homework due date"
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <label className="sm:col-span-5 space-y-1">
                  <span className="block font-medium text-slate-700">Daily Task Title *</span>
                  <input
                    type="text"
                    aria-label="Inline homework title"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="e.g. Ex 6.2 Quadratic Factorization Q1-Q8"
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                </label>
                <label className="sm:col-span-7 space-y-1">
                  <span className="block font-medium text-slate-700">Instructions for Students &amp; Parents</span>
                  <input
                    type="text"
                    aria-label="Inline homework instructions"
                    value={hwInstructions}
                    onChange={(e) => setHwInstructions(e.target.value)}
                    placeholder="Solve in fair notebook with all intermediate steps."
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                  />
                </label>
              </div>
              {hwError && (
                <p className="text-xs text-rose-700 font-medium">{hwError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInlineHwForm(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hwSaving}
                  className="rounded-lg bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {hwSaving ? 'Publishing...' : `Publish to Class ${activeStudent.classSection}`}
                </button>
              </div>
            </form>
          )}

          {hwMsg && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800">
              {hwMsg}
            </div>
          )}

          {dailyHomeworkSummary.rows.length === 0 ? (
            <p className="text-xs text-slate-500">
              No daily homework assignments posted for Class {activeStudent.classSection} yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {dailyHomeworkSummary.rows.map(
                ({ assignment, submission, effectiveStatus, isAssignedToday }) => (
                  <div
                    key={assignment.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs"
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
                        Assigned {assignment.assignedDate} · Due {assignment.dueDate} · Given by{' '}
                        {assignment.createdBy} · {assignment.chapter}
                        {assignment.status === 'Cancelled' && assignment.cancellationReason
                          ? ` · Cancelled: ${assignment.cancellationReason}`
                          : submission?.feedback
                            ? ` · Teacher Feedback: "${submission.feedback}"`
                            : ''}
                      </p>
                    </div>
                    <span
                      className={`font-semibold whitespace-nowrap shrink-0 ${
                        effectiveStatus === 'Handed In'
                          ? 'text-emerald-700'
                          : effectiveStatus === 'Missing'
                            ? 'text-amber-700'
                            : effectiveStatus === 'Cancelled'
                              ? 'text-rose-700'
                              : effectiveStatus === 'Late'
                                ? 'text-blue-900'
                                : 'text-slate-500'
                      }`}
                    >
                      {effectiveStatus === 'Pending'
                        ? 'Pending (Not Penalized)'
                        : effectiveStatus === 'Missing'
                          ? 'Not Complete (Missing)'
                          : effectiveStatus}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        {/* Daily Parent Attendance Notifications Log (Staff Resend + Parent Acknowledgement) */}
        {data.user.role !== 'counsellor' && (
          <section
            aria-label="Daily Parent Attendance Notifications"
            data-testid="student-attendance-notifications-card"
            className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-blue-900" />
                  {isParent ? parentStrings.dailyAttendanceAlertsTitle : 'Daily Parent Attendance Notifications'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated daily app alerts for {activeStudent.guardianName} ({activeStudent.guardianPhone})
                </p>
              </div>
              {canEditAcademic && (
                <button
                  type="button"
                  disabled={notifResending}
                  onClick={() => void handleResendTodayAttendanceAlert()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50 whitespace-nowrap shrink-0 self-start sm:self-auto print:hidden"
                >
                  {notifResending
                    ? 'Sending Alert...'
                    : `Send / Resend Today's Attendance Message (${todayIso})`}
                </button>
              )}
            </div>

            {notifFeedback && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-800">
                {notifFeedback}
              </p>
            )}

            {studentAttendanceNotifications.length === 0 ? (
              <p className="text-xs text-slate-500">
                {isParent
                  ? parentStrings.noAttendanceMessages
                  : 'No daily attendance notifications delivered yet for this student.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {studentAttendanceNotifications.slice(0, 6).map((n) => (
                  <div
                    key={n.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-slate-900">
                        <span className="font-mono tabular-nums">{n.date}</span>
                        {' · '}
                        <span
                          className={
                            n.attendanceStatus === 'Present'
                              ? 'text-emerald-700'
                              : n.attendanceStatus === 'Absent'
                                ? 'text-red-700'
                                : 'text-amber-700'
                          }
                        >
                          {n.attendanceStatus}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        {isParent && parentLang === 'hi' ? n.messageHi : n.messageEn}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        Sent by {n.sentBy} · {n.sentAt.slice(0, 16).replace('T', ' ')}
                        {n.acknowledgedByParent
                          ? ` · Acknowledged ${n.acknowledgedAt?.slice(0, 16).replace('T', ' ') || ''}`
                          : n.readByParent
                            ? ' · Read by parent'
                            : ' · Unread'}
                      </p>
                    </div>
                    {!isStaff && !n.acknowledgedByParent && (
                      <button
                        type="button"
                        disabled={notifAckId === n.id}
                        onClick={() => void handleAcknowledgeStudentNotif(n.id)}
                        className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap shrink-0 self-start sm:self-center"
                      >
                        {notifAckId === n.id
                          ? 'Confirming...'
                          : isParent
                            ? parentStrings.acknowledgeReceiptBtn
                            : 'Acknowledge'}
                      </button>
                    )}
                    {n.acknowledgedByParent && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 whitespace-nowrap shrink-0 self-start sm:self-center">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isParent ? parentStrings.acknowledgedLabel : 'Acknowledged'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5 Learners Score Components */}
        {breakdown && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Learners Score Component Breakdown (0–100)
                </h2>
                <p className="text-xs text-slate-500">
                  Evidence coverage: {breakdown.evidenceCoveragePct}% · Missing evidence is excluded
                  rather than scored as zero.
                </p>
              </div>
              {isStaff && (
                <button
                  type="button"
                  onClick={() => void handleGenerateInsight()}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900/30 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiLoading ? 'Synthesizing...' : 'AI Learning Synthesis'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {Object.entries(breakdown.components).map(([key, comp]) => {
                const isSelected =
                  selectedTrace?.targetType === 'component' && selectedTrace.targetKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setSelectedTrace(
                        isSelected ? null : { targetType: 'component', targetKey: key },
                      )
                    }
                    className={`rounded-lg border p-3.5 flex flex-col justify-between text-left transition-colors ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/70'
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-600">{comp.label}</p>
                    <div className="mt-2">
                      <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                        {comp.score !== null ? comp.score : 'No Evidence'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 tabular-nums">
                        Weight {comp.weight}% · {comp.evidenceCount}{' '}
                        {comp.evidenceCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeTrace && activeTrace.targetType === 'component' && (
              <div
                data-testid="evidence-trace-panel"
                className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                      <SearchCheck className="h-3.5 w-3.5 text-blue-900" />
                      Evidence Trace: {activeTrace.targetLabel} (
                      {activeTrace.score !== null ? `${activeTrace.score}/100` : 'No Evidence'})
                    </p>
                    <p className="text-slate-600 mt-0.5">{activeTrace.formulaNote}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close evidence trace"
                    onClick={() => setSelectedTrace(null)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {activeTrace.items.length > 0 && (
                  <div className="divide-y divide-blue-100 rounded-lg border border-blue-200/80 bg-white">
                    {activeTrace.items.map((item) => (
                      <div
                        key={item.evidenceId}
                        className="px-3.5 py-2 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.summary}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.date} · {item.sourceType} · By {item.enteredBy}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-blue-900 tabular-nums shrink-0">
                          {item.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aiInsight && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-xs text-slate-800 leading-relaxed">
                <p className="font-semibold text-blue-900 mb-1">
                  AI-Assisted Student 360° Synthesis (Advisory — Requires Human Review)
                </p>
                <p>{aiInsight}</p>
              </div>
            )}

            <LearnersScoreGrowthPanel
              studentId={activeStudent.id}
              studentName={activeStudent.name}
              evidence={studentEvidence}
              examMarks={studentMarks}
              readingReports={studentReadingReports}
              numeracyReports={studentNumeracyReports}
              weights={data.weightsConfig.weights}
            />
          </div>
        )}

        {/* 15 Officer Like Qualities (OLQs) */}
        {breakdown && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  15 Officer Like Qualities (OLQs)
                </h2>
                <p className="text-xs text-slate-500">
                  School-development framework inspired by OLQs (not an officially validated SSB assessment). Click any quality to inspect its underlying evidence trace.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {OLQ_GROUPS.map((group) => {
                const traits = OLQ_DEFINITIONS.filter((d) => d.group === group);
                return (
                  <div key={group} className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                      {group}
                    </h3>
                    <div className="space-y-1">
                      {traits.map((trait) => {
                        const val = breakdown.olqScores[trait.key];
                        const isSelected =
                          selectedTrace?.targetType === 'olq' &&
                          selectedTrace.targetKey === trait.key;
                        return (
                          <button
                            key={trait.key}
                            type="button"
                            onClick={() =>
                              setSelectedTrace(
                                isSelected
                                  ? null
                                  : { targetType: 'olq', targetKey: trait.key },
                              )
                            }
                            className={`w-full rounded-md px-2 py-1.5 flex items-center justify-between gap-3 text-xs text-left transition-colors ${
                              isSelected ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 truncate">
                                {trait.index}. {trait.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-slate-400 tabular-nums">
                                {val.evidenceCount} ev
                              </span>
                              <span className="font-mono font-semibold text-slate-900 w-10 text-right tabular-nums">
                                {val.score !== null ? val.score : '—'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {activeTrace && activeTrace.targetType === 'olq' && (
              <div
                data-testid="evidence-trace-panel"
                className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-2.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                      <SearchCheck className="h-3.5 w-3.5 text-blue-900" />
                      Why is {activeTrace.targetLabel} ={' '}
                      {activeTrace.score !== null ? `${activeTrace.score}/100` : 'No Evidence'}?
                    </p>
                    <p className="text-slate-600 mt-0.5">{activeTrace.formulaNote}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close OLQ evidence trace"
                    onClick={() => setSelectedTrace(null)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {activeTrace.items.length > 0 && (
                  <div className="divide-y divide-blue-100 rounded-lg border border-blue-200/80 bg-white">
                    {activeTrace.items.map((item) => (
                      <div
                        key={item.evidenceId}
                        className="px-3.5 py-2 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{item.summary}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.date} · {item.sourceType} · Entered by {item.enteredBy}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-blue-900 tabular-nums shrink-0">
                          {item.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIS 360° DMIT & Brain Dominance Telemetry (Linked Drive PDF) */}
        {activeStudent.visReportFileId && (
          linkedVisProfile ? (
            <VisDmitProfilePanel
              profile={linkedVisProfile}
              catalogItem={linkedVisCatalogItem}
              onOpenFullModal={() =>
                setModalVisProfile({ profile: linkedVisProfile, item: linkedVisCatalogItem })
              }
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-blue-900">VIS Drive DMIT Report Linked</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Run live Drive PDF extraction to inspect VAK, Multiple Intelligences, Brain Lobes, and DISC Bird profile.
                </p>
              </div>
              <button
                type="button"
                disabled={extractingLinked}
                onClick={() => void handleExtractLinkedVisReport(activeStudent.visReportFileId!)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                {extractingLinked ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSearch className="h-3.5 w-3.5" />}
                {extractingLinked ? 'Extracting PDF...' : 'Extract Live VIS DMIT Report'}
              </button>
            </div>
          )
        )}

        {/* Reading Personal Best Tracker (WPM & Accuracy Highlights) */}
        <PersonalBestCard
          studentName={activeStudent.name}
          summary={personalBestSummary}
          onLaunchReadingTest={
            onOpenAssessmentLab ? () => onOpenAssessmentLab('reading', activeStudent.id) : undefined
          }
        />

        {/* Erikson Theory of Psychosocial Development (Expected vs Present Stage & Remedials) */}
        <EriksonDevelopmentCard
          assessment={eriksonAssessment}
          assignedRemedials={(data.remedialAssignments || []).filter(
            (r) => r.studentId === activeStudent.id,
          )}
          isStaff={isStaff}
          token={token}
          onRefresh={onRefresh}
          onLaunchReadingTest={
            onOpenAssessmentLab ? () => onOpenAssessmentLab('reading', activeStudent.id) : undefined
          }
          onLaunchNumeracyTest={
            onOpenAssessmentLab ? () => onOpenAssessmentLab('numeracy', activeStudent.id) : undefined
          }
          onOpenGames={onOpenGames}
        />

        {/* Automated Incomplete Notebook Alerts for this Student (Student, Parent & Teacher visibility) */}
        <NotebookIncompleteAlertsPanel
          notifications={(data.notebookNotifications || []).filter(
            (n) => n.studentId === activeStudent.id,
          )}
          viewerRole={data.user.role}
          token={token}
          onRefresh={onRefresh}
          parentLang={isParent ? parentLang : 'en'}
          maxItems={6}
          showWhenEmpty={false}
          compact
        />

        {/* Notebook Consistency Streak & Virtual Badges */}
        <ConsistencyStreakCard
          studentName={activeStudent.name}
          summary={consistencyStreakSummary}
          compact
        />

        {/* Brief Student Notebook Checking Report (Visible to Both Student/Parent and Teacher) */}
        <StudentBriefNotebookReport
          student={activeStudent}
          notebookEntries={data.notebookEntries || []}
          viewerLabel={isStaff ? 'Teacher & Management View' : 'Student & Parent Record'}
        />

        {/* Active & Independent Learning Profile (Non-Labelling) */}
        {breakdown && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-slate-900">
              Learning Engagement Profile (Non-Labelling)
            </h2>
            <p className="text-xs text-slate-600">
              {breakdown.learningProfile.advisoryNote}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
                <p className="font-semibold text-emerald-800">Observed Learning Strengths</p>
                {breakdown.learningProfile.strengths.map((s) => (
                  <p key={s} className="text-slate-700">
                    · {s}
                  </p>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-1.5">
                <p className="font-semibold text-blue-900">Recommended Classroom & Home Support</p>
                {breakdown.learningProfile.supportAreas.map((s) => (
                  <p key={s} className="text-slate-700">
                    · {s}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daily Class Homework is displayed prominently near the top of the profile */}

        {/* Staff Entry: Add Multi-OLQ Incident Observation or Exam Mark */}
        {canEditAcademic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
            <form
              onSubmit={handleAddObservation}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-slate-900">
                  Log Classroom / Activity OLQ Incident (1–3 Qualities)
                </h3>
                {obsRatings.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddRatingSlot}
                    className="text-xs font-semibold text-blue-900 hover:underline whitespace-nowrap"
                  >
                    + Add Quality ({obsRatings.length}/3)
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="obs-context" className="block text-xs font-medium text-slate-600 mb-1">
                  Observation Context *
                </label>
                <select
                  id="obs-context"
                  value={obsContext}
                  onChange={(e) => setObsContext(e.target.value as ObservationContext)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                >
                  {OBSERVATION_CONTEXTS.map((ctx) => (
                    <option key={ctx} value={ctx}>
                      {ctx}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {obsRatings.map((rating, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      aria-label={`OLQ quality ${idx + 1}`}
                      value={rating.olqKey}
                      onChange={(e) => {
                        const nextKey = e.target.value as OlqKey;
                        setObsRatings((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, olqKey: nextKey } : item)),
                        );
                      }}
                      className="col-span-8 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {OLQ_DEFINITIONS.map((d) => (
                        <option key={d.key} value={d.key}>
                          {d.index}. {d.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      aria-label={`OLQ score ${idx + 1}`}
                      min={40}
                      max={100}
                      value={rating.score}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setObsRatings((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, score: val } : item)),
                        );
                      }}
                      className="col-span-3 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                    />
                    {obsRatings.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove quality ${idx + 1}`}
                        onClick={() =>
                          setObsRatings((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 flex justify-center text-slate-400 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="obs-text" className="block text-xs font-medium text-slate-600 mb-1">
                  Observed Evidence Summary *
                </label>
                <input
                  id="obs-text"
                  type="text"
                  value={obsSummary}
                  onChange={(e) => setObsSummary(e.target.value)}
                  placeholder="e.g. Led science lab setup and guided peers safely"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              {obsError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">
                  {obsError}
                </div>
              )}

              <button
                type="submit"
                disabled={obsSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Plus className="h-3.5 w-3.5" />
                {obsSaving ? 'Saving Incident...' : 'Add Incident Evidence'}
              </button>
            </form>

            <form
              onSubmit={handleAddExamMark}
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
            >
              <h3 className="font-display text-sm font-bold text-slate-900">
                Record Examination Marks
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  aria-label="Exam name"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Exam Name"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
                <input
                  type="text"
                  aria-label="Subject"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  placeholder="Subject"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="number"
                  aria-label="Obtained marks"
                  value={obtainedMarks}
                  onChange={(e) => setObtainedMarks(e.target.value)}
                  placeholder="Obtained"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
                />
                <input
                  type="number"
                  aria-label="Maximum marks"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="Max"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-mono"
                />
                <input
                  type="text"
                  aria-label="Conceptual gap note"
                  value={conceptualGap}
                  onChange={(e) => setConceptualGap(e.target.value)}
                  placeholder="Conceptual gap (optional)"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={markSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                {markSaving ? 'Saving...' : 'Save Assessment Marks'}
              </button>
            </form>
          </div>
        )}

        {formMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
            {formMsg}
          </div>
        )}

        {/* Cognitive Practice Profile (Advisory · Non-Scoring) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-900" />
                Cognitive Practice Profile (Advisory · Non-Scoring)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{cognitiveProfile.advisoryNotice}</p>
            </div>
            {onOpenGames && (
              <button
                type="button"
                onClick={onOpenGames}
                className="rounded-lg border border-blue-900 px-3.5 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
              >
                Open Intelligence Games →
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Practice Attempts</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {cognitiveProfile.totalAttempts}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Practice Accuracy</p>
              <p className="font-mono text-lg font-bold text-blue-900 tabular-nums mt-0.5">
                {cognitiveProfile.overallAccuracyPct !== null
                  ? `${cognitiveProfile.overallAccuracyPct}%`
                  : 'No runs'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Highest Level</p>
              <p className="font-mono text-lg font-bold text-emerald-700 tabular-nums mt-0.5">
                {cognitiveProfile.highestLevelCompleted > 0
                  ? `Level ${cognitiveProfile.highestLevelCompleted}`
                  : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Practice Consistency</p>
              <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {cognitiveProfile.practiceConsistencyDays} days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="font-semibold text-slate-800 mb-1">
                Supporting Learning Indicators & Potential OLQ Clues
              </p>
              {cognitiveProfile.strengths.length > 0 ? (
                <ul className="space-y-1 text-slate-600">
                  {cognitiveProfile.strengths.map((s) => (
                    <li key={s}>· {s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">
                  No cognitive practice attempts logged yet for this student.
                </p>
              )}
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="font-semibold text-slate-800 mb-1">
                Custom Report-Driven Game Recommendations
              </p>
              <ul className="space-y-1 text-slate-600">
                {customGameRecommendations.map((rec) => (
                  <li key={rec.id}>
                    · <strong>{rec.needArea}:</strong>{' '}
                    {rec.recommendedGames.map((g) => g.title).join(', ')} (
                    {rec.reportScorePct !== null ? `${rec.reportScorePct}% report` : rec.triggerLabel})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* All-Months Longitudinal Growth Comparison Reports (Reading, Numeracy, UT Cycles & Attendance) */}
        <StudentGrowthReportsPanel
          student={activeStudent}
          readingReports={studentReadingReports}
          numeracyReports={studentNumeracyReports}
          monthlyAttendance={studentMonthlyAttendance}
          todayAttendanceRecord={studentTodayAttendance}
          todayIso={todayIso}
          examMarks={studentMarks}
          hideAttendance={data.user.role === 'counsellor'}
          canEditAcademic={canEditAcademic}
          skillSaving={skillSaving}
          onSaveReading={handleSaveStudentReading}
          onSaveNumeracy={handleSaveStudentNumeracy}
          onLaunchReadingTest={
            onOpenAssessmentLab ? () => onOpenAssessmentLab('reading', activeStudent.id) : undefined
          }
          onLaunchNumeracyTest={
            onOpenAssessmentLab ? () => onOpenAssessmentLab('numeracy', activeStudent.id) : undefined
          }
        />

        {/* Staff Development Review Queue (Work Quality C & Verification) */}
        {isStaff && (
          <DevelopmentReviewQueuePanel
            data={data}
            token={token}
            activeStudentId={activeStudent.id}
            onRefresh={onRefresh}
          />
        )}

        {/* Traceable Evidence & Exam History */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900">
              Traceable Evidence Ledger ({studentEvidence.length} records)
            </h2>
            <span className="text-xs text-slate-500">
              {studentMarks.length} exam marks recorded
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {studentEvidence.slice(0, 10).map((ev) => (
              <div key={ev.id} className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-medium text-slate-900">{ev.summary}</p>
                  <p className="text-slate-500">
                    {ev.date} · Source: {ev.sourceType} · Entered by {ev.enteredBy}
                  </p>
                </div>
                {ev.reviewRequired && (
                  <span className="font-semibold text-amber-700 shrink-0">
                    Needs Gentle Teacher Review
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
      )}

      <VisReportVisualizerModal
        profile={modalVisProfile?.profile || null}
        catalogItem={modalVisProfile?.item}
        onClose={() => setModalVisProfile(null)}
      />

      {showPaymentTimeline && activeStudentFeeAccount && (
        <StudentPaymentTimelineModal
          account={activeStudentFeeAccount}
          schoolName={data.activeSchool.name}
          schoolCode={data.activeSchool.code}
          session={data.activeSchool.session}
          generatedBy={data.user.name}
          activeMonth={activeFeeMonth}
          receipts={data.feeReceipts || []}
          onClose={() => setShowPaymentTimeline(false)}
        />
      )}
    </div>
  );
};
