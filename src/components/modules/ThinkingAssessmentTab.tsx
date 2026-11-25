import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Image as ImageIcon,
  MessageSquareText,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import type {
  SchoolClassNumber,
  SsbDailyAssignment,
  ThinkingDifficulty,
  ThinkingTestType,
} from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import { OLQ_DEFINITIONS } from '../../utils/evidenceEngine';
import { computeStudentThinkingComposite } from '../../utils/thinkingAssessmentEngine';
import {
  extractClassNumber,
  findMonthlySetUsage,
  formatMonthLabel,
  generateMonthlyThinkingSet,
  getCurrentDateKey,
  getCurrentMonthKey,
} from '../../utils/thinkingMonthlyBank';
import {
  DEFAULT_PPDT_PERCEPTION,
  DEFAULT_TAT_STRUCTURE,
  useThinkingAssessmentState,
} from '../../hooks/useThinkingAssessmentState';
import { ThinkingSceneIllustration } from '../thinking/ThinkingSceneIllustrations';

interface ThinkingAssessmentTabProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  onOpenAnalytics?: () => void;
}

interface TestTypeCardSpec {
  id: ThinkingTestType;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  timingLabel: string;
  measures: string[];
  accentBg: string;
  accentText: string;
  accentBorder: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TEST_CATALOG: TestTypeCardSpec[] = [
  {
    id: 'SRT',
    code: 'SRT',
    title: 'Situation Reaction Test',
    subtitle: '60 class-aligned situations · 30 sec each · Monthly unique set',
    description:
      'Presents 60 real-life school, team, and emergency dilemmas calibrated for the student’s class. Different set every month; regenerable once used.',
    timingLabel: '60 situations · 30 sec each',
    measures: ['Practical Thinking', 'Decision-Making', 'Initiative', 'Responsibility', 'Team Orientation'],
    accentBg: 'bg-blue-50',
    accentText: 'text-blue-800',
    accentBorder: 'border-blue-200',
    icon: Zap,
  },
  {
    id: 'WAT',
    code: 'WAT',
    title: 'Word Association Test',
    subtitle: '60 class-aligned cue words · Monthly unique set + regenerate',
    description:
      'Displays 60 stimulus words one by one under a configurable timer (15s default). Identical across the same class each month and regenerable once used.',
    timingLabel: '60 words · 15 sec / word',
    measures: ['Response Speed', 'Constructive Framing', 'Positive Attitude', 'Emotional Maturity'],
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-800',
    accentBorder: 'border-emerald-200',
    icon: MessageSquareText,
  },
  {
    id: 'TAT',
    code: 'TAT',
    title: 'Thematic Apperception Test',
    subtitle: '11 illustrated picture scenes · Structured 5-part narrative arc',
    description:
      'Complete 11-picture visual storytelling battery (10 illustrated real-life scenes + 11th open horizon card) capturing protagonist, objective, challenges, actions, and outcome.',
    timingLabel: '11 pictures · 4 min / scene',
    measures: ['Planning & Organising', 'Empathy', 'Problem-Solving', 'Confidence & Ownership'],
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-800',
    accentBorder: 'border-amber-200',
    icon: ImageIcon,
  },
  {
    id: 'PPDT',
    code: 'PPDT',
    title: 'Picture Perception & Discussion Test',
    subtitle: 'Unique monochrome picture every month · Individual & Group GD',
    description:
      'Rotates across 12 distinct ambiguous monochrome pictures (one per calendar month). Students identify characters, ages, mood, and central theme before narration & GD.',
    timingLabel: '1 monthly picture · 4 min story',
    measures: ['Perception Clarity', 'Narration', 'Cooperation', 'Listening & Leadership'],
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-800',
    accentBorder: 'border-indigo-200',
    icon: Eye,
  },
];

const DIFFICULTY_OPTIONS: Array<'All' | ThinkingDifficulty> = [
  'All',
  'Foundation',
  'Intermediate',
  'Advanced',
];

function buildMonthOptions(): string[] {
  const now = new Date();
  const list: string[] = [];
  for (let offset = -2; offset <= 4; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return list;
}

function formatSeconds(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const ThinkingAssessmentTab: React.FC<ThinkingAssessmentTabProps> = ({
  data,
  token,
  onRefresh,
  onOpenAnalytics,
}) => {
  const { user, activeSchool, students } = data;
  const questionBank = useMemo(() => data.thinkingQuestionBank || [], [data.thinkingQuestionBank]);
  const allSessions = useMemo(() => data.thinkingAssessments || [], [data.thinkingAssessments]);
  const setUsages = useMemo(() => data.thinkingSetUsages || [], [data.thinkingSetUsages]);
  const ssbEnrollments = useMemo(() => data.ssbEnrollments || [], [data.ssbEnrollments]);
  const ssbDailyAssignments = useMemo(
    () => data.ssbDailyAssignments || [],
    [data.ssbDailyAssignments],
  );
  const scoringConfig = data.thinkingScoringConfig;

  const isStudent = user.role === 'student';
  const isParent = user.role === 'parent';
  const isStaff = ['super_admin', 'school_admin', 'principal', 'coordinator', 'counsellor', 'teacher'].includes(
    user.role,
  );

  const selectableStudents = useMemo(() => {
    if ((isStudent || isParent) && user.linkedStudentIds?.length) {
      const allowed = new Set(user.linkedStudentIds);
      const filtered = students.filter((s) => allowed.has(s.id));
      if (filtered.length > 0) return filtered;
    }
    return students;
  }, [isParent, isStudent, students, user.linkedStudentIds]);

  const initialStudentId = useMemo(() => {
    if (isStudent && selectableStudents[0]) return selectableStudents[0].id;
    const senior = selectableStudents.find((s) => /(?:^|\D)([6-9]|1[0-2])(?:\D|$)/.test(s.classSection));
    return senior?.id || selectableStudents[0]?.id || '';
  }, [isStudent, selectableStudents]);

  const {
    state,
    sessionMeta,
    matchingQuestions,
    activeQuestions,
    currentQuestion,
    answeredCount,
    savedDraftPreview,
    selectTestType,
    setStudentId,
    updateConfig,
    startSession,
    resumeSavedDraft,
    clearSavedDraft,
    updateResponseText,
    updateTatFields,
    updatePpdtFields,
    goToPrompt,
    togglePause,
    resetToSelection,
    submitSession,
  } = useThinkingAssessmentState({
    schoolId: activeSchool.id,
    initialStudentId,
    questionBank,
    token,
    onRefresh,
  });

  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey());
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [promptPage, setPromptPage] = useState(0);

  const activeStudent = useMemo(
    () => selectableStudents.find((s) => s.id === state.studentId) || selectableStudents[0] || null,
    [selectableStudents, state.studentId],
  );

  const activeClassLevel: SchoolClassNumber = useMemo(
    () => extractClassNumber(activeStudent?.classSection),
    [activeStudent?.classSection],
  );

  const todayKey = useMemo(() => getCurrentDateKey(), []);

  // Enrollment & today's 4 SSB daily assignments for the active student
  const activeEnrollment = useMemo(
    () => ssbEnrollments.find((e) => e.studentId === activeStudent?.id && e.enrolled) || null,
    [activeStudent?.id, ssbEnrollments],
  );

  const todayDailyQueue = useMemo(() => {
    if (!activeStudent) return [];
    const order: ThinkingTestType[] = ['SRT', 'WAT', 'TAT', 'PPDT'];
    return ssbDailyAssignments
      .filter((a) => a.studentId === activeStudent.id && a.dateKey === todayKey)
      .sort((a, b) => order.indexOf(a.testType) - order.indexOf(b.testType));
  }, [activeStudent, ssbDailyAssignments, todayKey]);

  const dailyDoneCount = todayDailyQueue.filter((a) => a.status === 'completed').length;

  // Generate the active month + class-aligned sets for all 4 test types
  const monthlySets = useMemo(() => {
    const types: ThinkingTestType[] = ['SRT', 'WAT', 'TAT', 'PPDT'];
    return Object.fromEntries(
      types.map((t) => {
        const usage = findMonthlySetUsage(
          setUsages,
          activeSchool.id,
          activeClassLevel,
          selectedMonthKey,
          t,
        );
        const set = generateMonthlyThinkingSet({
          schoolId: activeSchool.id,
          classLevel: activeClassLevel,
          monthKey: selectedMonthKey,
          testType: t,
          setVersion: usage?.setVersion ?? 1,
          usedInMonth: Boolean(usage && usage.usedCount > 0),
        });
        return [t, set];
      }),
    ) as Record<ThinkingTestType, ReturnType<typeof generateMonthlyThinkingSet>>;
  }, [activeClassLevel, activeSchool.id, selectedMonthKey, setUsages]);

  const studentSessions = useMemo(
    () => allSessions.filter((s) => s.studentId === activeStudent?.id),
    [allSessions, activeStudent?.id],
  );

  const composite = useMemo(
    () => (activeStudent ? computeStudentThinkingComposite(activeStudent.id, allSessions) : null),
    [activeStudent, allSessions],
  );

  const completedCounts = useMemo(() => {
    const counts: Record<ThinkingTestType, number> = { SRT: 0, WAT: 0, TAT: 0, PPDT: 0 };
    studentSessions.forEach((s) => {
      if (counts[s.testType] !== undefined) {
        counts[s.testType] += 1;
      }
    });
    return counts;
  }, [studentSessions]);

  const selectedSpec = useMemo(
    () => TEST_CATALOG.find((t) => t.id === state.selectedTestType) || null,
    [state.selectedTestType],
  );

  const olqNameByKey = useMemo(() => {
    const map = new Map<string, string>();
    OLQ_DEFINITIONS.forEach((d) => map.set(d.key, d.name));
    return map;
  }, []);

  const currentDraft = currentQuestion ? state.drafts[currentQuestion.id] : undefined;
  const currentTat = currentDraft?.tatStructure || DEFAULT_TAT_STRUCTURE;
  const currentPpdt = currentDraft?.ppdtPerception || DEFAULT_PPDT_PERCEPTION;

  const targetSec =
    state.config.customTimeLimitSec || currentQuestion?.defaultTimeLimitSec || 30;
  const remainingSec = Math.max(0, targetSec - state.timer.promptElapsedSec);

  // Handlers for monthly regeneration and SSB daily enrollment/launch
  const handleRegenerateMonthlySet = async (testType: ThinkingTestType) => {
    setActionError(null);
    setNoticeBanner(null);
    setBusyAction(`regen-${testType}`);
    try {
      const res = await apiRequest<{ set: ReturnType<typeof generateMonthlyThinkingSet> }>(
        '/api/thinking/monthly-set/regenerate',
        {
          method: 'POST',
          body: JSON.stringify({
            testType,
            classLevel: activeClassLevel,
            monthKey: selectedMonthKey,
          }),
        },
        token,
      );
      await onRefresh();
      setNoticeBanner(
        `Generated fresh ${testType} Set #${res.set.setVersion} (${res.set.questions.length} ${
          testType === 'WAT' ? 'words' : testType === 'SRT' ? 'situations' : 'pictures'
        }) for Class ${activeClassLevel} · ${res.set.monthLabel}.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to regenerate monthly set.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleToggleSsbEnrollment = async (enroll: boolean) => {
    if (!activeStudent) return;
    setActionError(null);
    setNoticeBanner(null);
    setBusyAction('ssb-enroll');
    try {
      await apiRequest(
        '/api/thinking/ssb-enrollment',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: activeStudent.id,
            enrolled: enroll,
          }),
        },
        token,
      );
      await onRefresh();
      setNoticeBanner(
        enroll
          ? `${activeStudent.name} enrolled in SSB Daily Classes. Today’s 4 daily sets (SRT 60, WAT 60, TAT 11, PPDT 1) are now assigned.`
          : `${activeStudent.name} paused from SSB Daily Classes.`,
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update SSB enrollment.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleLaunchMonthlyConfigure = (testType: ThinkingTestType) => {
    const mSet = monthlySets[testType];
    setPromptPage(0);
    selectTestType(testType, mSet.questions, {
      classLevel: activeClassLevel,
      monthKey: selectedMonthKey,
      setVersion: mSet.setVersion,
    });
  };

  const handleLaunchDailyAssignment = (assignment: SsbDailyAssignment) => {
    const dailySet = generateMonthlyThinkingSet({
      schoolId: activeSchool.id,
      classLevel: assignment.classLevel,
      monthKey: assignment.dateKey.slice(0, 7),
      testType: assignment.testType,
      setVersion: assignment.setVersion + 100, // distinct daily sequence
      usedInMonth: false,
    });
    setPromptPage(0);
    startSession({
      forcedTestType: assignment.testType,
      forcedTimeLimitSec: assignment.timeLimitSec,
      classLevel: assignment.classLevel,
      monthKey: assignment.dateKey.slice(0, 7),
      setVersion: dailySet.setVersion,
      dailyAssignmentId: assignment.id,
      customQuestions: dailySet.questions,
    });
  };

  // Pagination for 60-prompt jump bar (shows 20 prompts per page so UI stays ultra-clean)
  const PROMPTS_PER_PAGE = 20;
  const totalJumpPages = Math.max(1, Math.ceil(activeQuestions.length / PROMPTS_PER_PAGE));
  const currentJumpPage = Math.min(
    Math.floor(state.currentIndex / PROMPTS_PER_PAGE),
    totalJumpPages - 1,
  );
  const displayPage = promptPage < totalJumpPages ? promptPage : currentJumpPage;
  const jumpStart = displayPage * PROMPTS_PER_PAGE;
  const jumpSlice = activeQuestions.slice(jumpStart, jumpStart + PROMPTS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
            <Sparkles className="h-4 w-4" />
            <span>Thinking Assessment &amp; SSB Studio · {activeSchool.name}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Monthly Class-Aligned SRT (60), WAT (60), TAT (11) &amp; PPDT
          </h2>
          <p className="text-xs text-slate-600">
            Same-class monthly test sets with regeneration after use, automatic daily SSB practice
            queues, and direct 15-OLQ evidence mapping.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <select
              aria-label="Assessment Month"
              value={selectedMonthKey}
              disabled={state.phase === 'active' || state.phase === 'submitting'}
              onChange={(e) => setSelectedMonthKey(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 disabled:bg-slate-100"
            >
              {monthOptions.map((mk) => (
                <option key={mk} value={mk}>
                  {formatMonthLabel(mk)}
                </option>
              ))}
            </select>
          </div>

          {!isStudent ? (
            <select
              id="ta-student-select"
              aria-label="Select student"
              value={state.studentId}
              disabled={state.phase === 'active' || state.phase === 'submitting'}
              onChange={(e) => setStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 disabled:bg-slate-100 focus:border-blue-800 focus:outline-none"
            >
              {selectableStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.classSection})
                </option>
              ))}
            </select>
          ) : (
            activeStudent && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {activeStudent.name} · Class {activeClassLevel}
              </div>
            )
          )}

          {onOpenAnalytics && (
            <button
              type="button"
              onClick={onOpenAnalytics}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              OLQ Dashboard &amp; Review
            </button>
          )}
        </div>
      </div>

      {/* Feedback & Error Banners */}
      {(state.error || actionError) && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.error || actionError}</span>
        </div>
      )}
      {noticeBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            {noticeBanner}
          </span>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================================================
          PHASE 1: SELECTION SCREEN (SSB DAILY QUEUE + 4 MONTHLY TEST CARDS)
         ===================================================================== */}
      {state.phase === 'selection' && (
        <div className="space-y-6">
          {/* Resume Saved Draft Banner */}
          {savedDraftPreview && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">
                  In-progress {savedDraftPreview.selectedTestType} Assessment Saved
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {Object.values(savedDraftPreview.drafts).filter((d) => d.responseText.trim()).length}{' '}
                  of {savedDraftPreview.activeQuestionIds.length} prompts drafted.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    resumeSavedDraft(monthlySets[savedDraftPreview.selectedTestType]?.questions)
                  }
                  className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resume {savedDraftPreview.selectedTestType}
                </button>
                <button
                  type="button"
                  onClick={clearSavedDraft}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* SSB CLASSES ENROLLMENT & DAILY 4-TEST ASSIGNMENT QUEUE */}
          {activeStudent && (
            <section className="rounded-xl border-2 border-blue-900/20 bg-gradient-to-br from-white via-white to-blue-50/50 p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">
                      <Award className="h-3.5 w-3.5" />
                      SSB Preparation Classes · Daily Assignment Engine
                    </span>
                    {activeEnrollment ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Enrolled · {dailyDoneCount}/4 Completed Today ({todayKey})
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Not enrolled in SSB Daily Batch
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeEnrollment
                      ? `${activeStudent.name}’s Daily SSB Practice Set (${todayKey})`
                      : `Enroll ${activeStudent.name} in SSB Classes for Daily Auto-Assigned Sets`}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Students enrolled in SSB Classes automatically receive one fresh set of every
                    format daily: <strong>SRT (60 @ 30s)</strong>, <strong>WAT (60 words)</strong>,{' '}
                    <strong>TAT (11 pictures)</strong>, and <strong>PPDT (1 sketch)</strong>.
                  </p>
                </div>

                <div className="shrink-0">
                  {activeEnrollment ? (
                    <button
                      type="button"
                      disabled={busyAction === 'ssb-enroll'}
                      onClick={() => void handleToggleSsbEnrollment(false)}
                      className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Pause SSB Enrollment
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busyAction === 'ssb-enroll'}
                      onClick={() => void handleToggleSsbEnrollment(true)}
                      className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 inline-flex items-center gap-1.5"
                    >
                      <Award className="h-3.5 w-3.5" />
                      Enroll in SSB Daily Classes
                    </button>
                  )}
                </div>
              </div>

              {activeEnrollment && todayDailyQueue.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {todayDailyQueue.map((item) => {
                    const done = item.status === 'completed';
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-3.5 flex flex-col justify-between gap-2.5 ${
                          done
                            ? 'border-emerald-200 bg-emerald-50/60'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            Daily {item.testType}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              done
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {done ? 'Completed' : 'Assigned Today'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {item.testType === 'SRT'
                            ? '60 situations · 30s each'
                            : item.testType === 'WAT'
                              ? '60 cue words · 15s each'
                              : item.testType === 'TAT'
                                ? '11 visual picture scenes'
                                : '1 daily ambiguous picture'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleLaunchDailyAssignment(item)}
                          className={`w-full py-1.5 rounded-md text-xs font-semibold transition ${
                            done
                              ? 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                              : 'bg-blue-900 text-white hover:bg-blue-800'
                          }`}
                        >
                          {done ? `Practice ${item.testType} Again` : `Start Daily ${item.testType}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Student Thinking Dimensions Snapshot */}
          {activeStudent && composite && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeStudent.name}&apos;s Thinking Development Profile (Class {activeClassLevel})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Four separate developmental dimensions — fast thinking is never equated with
                    better thinking, and self-centred patterns are non-diagnostic observations.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {studentSessions.length} completed · Corroboration threshold:{' '}
                  {scoringConfig?.minCorroborationCount ?? 3} responses
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Fast Thinking',
                    score: composite.dimensions.fastThinking,
                    note: 'Speed of understanding & responding',
                    bar: 'bg-sky-600',
                  },
                  {
                    label: 'Better Thinking',
                    score: composite.dimensions.betterThinking,
                    note: 'Practicality & decision effectiveness',
                    bar: 'bg-blue-800',
                  },
                  {
                    label: 'Positive Thinking',
                    score: composite.dimensions.positiveThinking,
                    note: 'Constructive & solution-oriented framing',
                    bar: 'bg-emerald-600',
                  },
                  {
                    label: 'Self-Centred Pattern',
                    score: composite.dimensions.selfCentredThinking,
                    note: 'Individualistic watch (lower is more team-oriented)',
                    bar: 'bg-amber-600',
                  },
                ].map((dim) => (
                  <div
                    key={dim.label}
                    className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-semibold text-slate-700">{dim.label}</span>
                      <span className="text-base font-bold text-slate-900">
                        {studentSessions.length > 0 ? dim.score : '—'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${dim.bar}`}
                        style={{ width: `${studentSessions.length > 0 ? dim.score : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{dim.note}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4-Card Monthly Assessment Selection Grid */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Monthly Class {activeClassLevel} Sets · {formatMonthLabel(selectedMonthKey)}
                </p>
                <h3 className="text-lg font-bold text-slate-900">
                  Choose One of the Four Thinking Tests
                </h3>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Same-class aligned · Fresh set every month · Regenerate after use
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEST_CATALOG.map((spec) => {
                const Icon = spec.icon;
                const mSet = monthlySets[spec.id];
                const doneCount = completedCounts[spec.id];
                const canRegen = mSet.usedInMonth || isStaff;
                return (
                  <div
                    key={spec.id}
                    className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between gap-4 hover:border-blue-300 transition shadow-2xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${spec.accentBg} ${spec.accentText} ${spec.accentBorder}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {spec.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            Class {activeClassLevel} · Set #{mSet.setVersion}
                          </span>
                          {mSet.usedInMonth && (
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              Used this month
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {spec.timingLabel}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{spec.title}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{spec.subtitle}</p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">{spec.description}</p>

                      {spec.id === 'PPDT' && mSet.questions[0] && (
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2 text-xs text-indigo-950">
                          <strong>{formatMonthLabel(selectedMonthKey)} Picture:</strong>{' '}
                          {mSet.questions[0].title}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {spec.measures.map((m) => (
                          <span
                            key={m}
                            className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
                      <div className="text-xs text-slate-500 space-x-2">
                        <span className="font-semibold text-slate-800">
                          {mSet.questions.length}{' '}
                          {spec.id === 'WAT'
                            ? 'words'
                            : spec.id === 'SRT'
                              ? 'situations'
                              : spec.id === 'TAT'
                                ? 'pictures'
                                : 'picture'}
                        </span>
                        <span>·</span>
                        <span>{doneCount} completed</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {canRegen && (
                          <button
                            type="button"
                            disabled={busyAction === `regen-${spec.id}`}
                            onClick={() => void handleRegenerateMonthlySet(spec.id)}
                            title="Generate a fresh set for this month & class"
                            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1"
                          >
                            <RefreshCw
                              className={`h-3.5 w-3.5 ${
                                busyAction === `regen-${spec.id}` ? 'animate-spin' : ''
                              }`}
                            />
                            Regenerate Set
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleLaunchMonthlyConfigure(spec.id)}
                          className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 inline-flex items-center gap-1.5"
                        >
                          Configure &amp; Start {spec.code}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          PHASE 2: SESSION CONFIGURATION & READINESS
         ===================================================================== */}
      {state.phase === 'configuring' && selectedSpec && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <button
                type="button"
                onClick={resetToSelection}
                className="text-xs font-semibold text-blue-900 hover:underline inline-flex items-center gap-1 mb-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to test selection
              </button>
              <h3 className="text-xl font-bold text-slate-900">
                Configure {selectedSpec.code} — Class {activeClassLevel} ·{' '}
                {formatMonthLabel(selectedMonthKey)} (Set #{sessionMeta.setVersion ?? 1})
              </h3>
              <p className="text-sm text-slate-600">{selectedSpec.description}</p>
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded border ${selectedSpec.accentBg} ${selectedSpec.accentText} ${selectedSpec.accentBorder}`}
            >
              {matchingQuestions.length}{' '}
              {selectedSpec.id === 'WAT'
                ? 'Words'
                : selectedSpec.id === 'SRT'
                  ? 'Situations (30s each)'
                  : selectedSpec.id === 'TAT'
                    ? 'Pictures'
                    : 'Monthly Picture'}{' '}
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Timed Mode */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">Timing Mode</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateConfig({ timedMode: true })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                    state.config.timedMode
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Timed
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ timedMode: false })}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                    !state.config.timedMode
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Untimed
                </button>
              </div>
              {state.config.timedMode && (
                <div className="pt-1">
                  <label htmlFor="ta-time-limit" className="block text-[11px] text-slate-500 mb-1">
                    Seconds per prompt ({selectedSpec.id === 'SRT' ? '30s standard' : 'configurable'})
                  </label>
                  <input
                    id="ta-time-limit"
                    type="number"
                    min={10}
                    max={600}
                    value={state.config.customTimeLimitSec ?? 30}
                    onChange={(e) =>
                      updateConfig({
                        customTimeLimitSec: Math.max(10, Math.min(600, Number(e.target.value) || 30)),
                      })
                    }
                    className="w-full rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Difficulty Filter */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <label htmlFor="ta-difficulty" className="block text-xs font-semibold text-slate-700">
                Difficulty Level
              </label>
              <select
                id="ta-difficulty"
                value={state.config.difficultyFilter}
                onChange={(e) =>
                  updateConfig({
                    difficultyFilter: e.target.value as 'All' | ThinkingDifficulty,
                  })
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'All' ? `All Class ${activeClassLevel} Prompts` : opt}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Calibrated automatically to Class {activeClassLevel} age &amp; comprehension level.
              </p>
            </div>

            {/* Workflow Mode */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">Assessment Workflow</p>
              {selectedSpec.id === 'PPDT' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateConfig({ workflowMode: 'Individual' })}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                      state.config.workflowMode === 'Individual'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => updateConfig({ workflowMode: 'Group' })}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition ${
                      state.config.workflowMode === 'Group'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Group GD
                  </button>
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  Individual Student Assessment
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                {selectedSpec.id === 'PPDT'
                  ? 'Group GD unlocks teacher evaluation of communication, cooperation, listening, and leadership.'
                  : 'Submitting marks this monthly set as used and unlocks Set Regeneration.'}
              </p>
            </div>

            {/* Observation Assistance */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">Observation Assistance</p>
              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.config.requestAiDraft}
                  onChange={(e) => updateConfig({ requestAiDraft: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-900"
                />
                <span>Generate draft counsellor observation after submission (human-reviewed).</span>
              </label>
            </div>
          </div>

          {/* Prompt Bank Preview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sample Prompts &amp; Mapped OLQs (Showing 4 of {matchingQuestions.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {matchingQuestions.slice(0, 4).map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {idx + 1}. {q.title}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      {q.defaultTimeLimitSec}s · {q.classRange}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    OLQs:{' '}
                    {q.targetOlqs
                      .map((k) => olqNameByKey.get(k) || k)
                      .slice(0, 3)
                      .join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetToSelection}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={matchingQuestions.length === 0}
              onClick={() => startSession()}
              className="px-5 py-2.5 rounded-lg bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-40 inline-flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Begin {selectedSpec.code} Assessment ({matchingQuestions.length}{' '}
              {selectedSpec.id === 'WAT'
                ? 'words'
                : selectedSpec.id === 'SRT'
                  ? 'situations'
                  : selectedSpec.id === 'TAT'
                    ? 'pictures'
                    : 'picture'}
              )
            </button>
          </div>
        </section>
      )}

      {/* =====================================================================
          PHASE 3: ACTIVE ASSESSMENT RUNNER (60 WAT / 60 SRT / 11 TAT / PPDT)
         ===================================================================== */}
      {(state.phase === 'active' || state.phase === 'submitting') &&
        selectedSpec &&
        currentQuestion && (
          <div className="space-y-4">
            {/* Active Session Status Bar */}
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${selectedSpec.accentBg} ${selectedSpec.accentText} ${selectedSpec.accentBorder}`}
                >
                  {selectedSpec.code}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {selectedSpec.id === 'WAT'
                    ? `Word ${state.currentIndex + 1} of ${activeQuestions.length}`
                    : selectedSpec.id === 'SRT'
                      ? `Situation ${state.currentIndex + 1} of ${activeQuestions.length}`
                      : selectedSpec.id === 'TAT'
                        ? `Picture ${state.currentIndex + 1} of ${activeQuestions.length}`
                        : `Monthly PPDT`}
                </span>
                <span className="text-xs text-slate-500">
                  {answeredCount}/{activeQuestions.length} drafted · Class {activeClassLevel}
                  {sessionMeta.dailyAssignmentId ? ' · SSB Daily Set' : ''}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`px-3 py-1 rounded-md text-xs font-mono font-bold border flex items-center gap-1.5 ${
                    state.config.timedMode && remainingSec === 0
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {state.config.timedMode
                    ? remainingSec > 0
                      ? `${formatSeconds(remainingSec)} left`
                      : `Overtime +${formatSeconds(state.timer.promptElapsedSec - targetSec)}`
                    : `Elapsed ${formatSeconds(state.timer.promptElapsedSec)}`}
                </div>

                <button
                  type="button"
                  onClick={togglePause}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                >
                  {state.timer.isPaused ? (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setExitModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Compact Paginated Prompt Navigator (handles 60 prompts effortlessly) */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {jumpSlice.map((q, offset) => {
                  const idx = jumpStart + offset;
                  const isCurrent = idx === state.currentIndex;
                  const hasText = Boolean(state.drafts[q.id]?.responseText.trim());
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => goToPrompt(idx)}
                      className={`h-8 min-w-8 px-2 rounded-md text-xs font-semibold border transition ${
                        isCurrent
                          ? 'bg-blue-900 text-white border-blue-900'
                          : hasText
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {totalJumpPages > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  {Array.from({ length: totalJumpPages }, (_, p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPromptPage(p)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                        displayPage === p
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p * PROMPTS_PER_PAGE + 1}–
                      {Math.min(activeQuestions.length, (p + 1) * PROMPTS_PER_PAGE)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Prompt Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              {state.timer.isPaused ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-10 text-center space-y-3">
                  <p className="text-base font-bold text-slate-900">Assessment Paused</p>
                  <p className="text-xs text-slate-600">
                    Your draft responses are preserved on this device. Resume whenever you are ready.
                  </p>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 inline-flex items-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Resume Prompt
                  </button>
                </div>
              ) : (
                <>
                  {/* Stimulus Presentation */}
                  {selectedSpec.id === 'WAT' ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 py-8 px-6 text-center space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                        Word {state.currentIndex + 1} of {activeQuestions.length} · Class{' '}
                        {activeClassLevel} · Write your first meaningful sentence
                      </p>
                      <p className="text-4xl font-bold tracking-wide text-slate-900">
                        {currentQuestion.prompt}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {currentQuestion.title}
                        </p>
                        <p className="text-base font-semibold text-slate-900 mt-1 leading-relaxed">
                          {currentQuestion.prompt}
                        </p>
                      </div>

                      {(selectedSpec.id === 'TAT' || selectedSpec.id === 'PPDT') && (
                        <ThinkingSceneIllustration
                          sceneCode={currentQuestion.sceneCode}
                          caption={currentQuestion.sceneCaption}
                        />
                      )}
                    </div>
                  )}

                  {/* TAT Structured 5-Part Story Arc */}
                  {selectedSpec.id === 'TAT' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                      {(
                        [
                          ['protagonist', 'Protagonist', 'Who is the lead character?'],
                          ['objective', 'Objective', 'What is their goal?'],
                          ['challenges', 'Challenges', 'What obstacle appears?'],
                          ['actions', 'Actions', 'What steps do they take?'],
                          ['outcome', 'Outcome', 'How does it resolve?'],
                        ] as const
                      ).map(([field, label, ph]) => (
                        <div key={field}>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            {label}
                          </label>
                          <input
                            type="text"
                            value={currentTat[field]}
                            onChange={(e) =>
                              updateTatFields(currentQuestion.id, { [field]: e.target.value })
                            }
                            placeholder={ph}
                            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-800 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PPDT Picture Perception Grid */}
                  {selectedSpec.id === 'PPDT' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Characters Identified
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={currentPpdt.charactersCount}
                          onChange={(e) =>
                            updatePpdtFields(currentQuestion.id, {
                              charactersCount: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Approximate Ages
                        </label>
                        <input
                          type="text"
                          value={currentPpdt.approximateAges}
                          onChange={(e) =>
                            updatePpdtFields(currentQuestion.id, {
                              approximateAges: e.target.value,
                            })
                          }
                          placeholder="e.g. 13-15 yrs"
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Perceived Mood
                        </label>
                        <select
                          value={currentPpdt.mood}
                          onChange={(e) =>
                            updatePpdtFields(currentQuestion.id, {
                              mood: e.target.value as 'Positive' | 'Neutral' | 'Negative',
                            })
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        >
                          <option value="Positive">Positive</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Negative">Negative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Central Situation
                        </label>
                        <input
                          type="text"
                          value={currentPpdt.centralSituation}
                          onChange={(e) =>
                            updatePpdtFields(currentQuestion.id, {
                              centralSituation: e.target.value,
                            })
                          }
                          placeholder="What is happening in the scene?"
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Individual Narration Summary (1-minute oral gist)
                        </label>
                        <input
                          type="text"
                          value={currentPpdt.narrationSummary}
                          onChange={(e) =>
                            updatePpdtFields(currentQuestion.id, {
                              narrationSummary: e.target.value,
                            })
                          }
                          placeholder="Key theme the student will narrate before group discussion..."
                          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Main Response Input */}
                  <div>
                    <label
                      htmlFor="ta-response-input"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      {selectedSpec.id === 'WAT'
                        ? 'Spontaneous Thought / Meaningful Sentence'
                        : selectedSpec.id === 'SRT'
                          ? 'Your Immediate Practical Action (30s target)'
                          : 'Complete Story Narrative'}
                    </label>
                    {selectedSpec.id === 'WAT' ? (
                      <input
                        id="ta-response-input"
                        type="text"
                        value={currentDraft?.responseText || ''}
                        onChange={(e) => updateResponseText(currentQuestion.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && state.currentIndex < activeQuestions.length - 1) {
                            e.preventDefault();
                            const nextIdx = state.currentIndex + 1;
                            goToPrompt(nextIdx);
                            setPromptPage(Math.floor(nextIdx / PROMPTS_PER_PAGE));
                          }
                        }}
                        placeholder="Type a natural, meaningful sentence and press Enter for the next word..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                      />
                    ) : (
                      <textarea
                        id="ta-response-input"
                        rows={selectedSpec.id === 'SRT' ? 4 : 6}
                        value={currentDraft?.responseText || ''}
                        onChange={(e) => updateResponseText(currentQuestion.id, e.target.value)}
                        placeholder={
                          selectedSpec.id === 'SRT'
                            ? 'Write what you would realistically do first, how you coordinate with others, and how you resolve the situation...'
                            : 'Write a complete story with a clear beginning, concrete actions, and constructive outcome...'
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-800 focus:outline-none"
                      />
                    )}
                    <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                      <span>
                        Mapped OLQs:{' '}
                        {currentQuestion.targetOlqs
                          .map((k) => olqNameByKey.get(k) || k)
                          .join(', ')}
                      </span>
                      <span>Auto-saved locally</span>
                    </div>
                  </div>

                  {/* Navigation & Submit Footer */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      disabled={state.currentIndex === 0}
                      onClick={() => {
                        const prevIdx = state.currentIndex - 1;
                        goToPrompt(prevIdx);
                        setPromptPage(Math.floor(prevIdx / PROMPTS_PER_PAGE));
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 inline-flex items-center gap-1.5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>

                    <div className="flex items-center gap-2.5">
                      {state.currentIndex < activeQuestions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = state.currentIndex + 1;
                            goToPrompt(nextIdx);
                            setPromptPage(Math.floor(nextIdx / PROMPTS_PER_PAGE));
                          }}
                          className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 text-xs font-semibold hover:bg-blue-50 inline-flex items-center gap-1.5"
                        >
                          Next Prompt
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={state.phase === 'submitting' || answeredCount === 0}
                        onClick={() => void submitSession()}
                        className="px-5 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-40 inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {state.phase === 'submitting'
                          ? 'Evaluating & Saving...'
                          : `Submit ${selectedSpec.code} (${answeredCount}/${activeQuestions.length})`}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

      {/* =====================================================================
          PHASE 4: COMPLETED EVIDENCE SUMMARY
         ===================================================================== */}
      {state.phase === 'completed' && state.submittedSession && (
        <section className="rounded-xl border border-emerald-200 bg-white p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {state.submittedSession.testType} Assessment Recorded
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Thinking Evidence Summary — {state.submittedSession.studentName}
              </h3>
              <p className="text-xs text-slate-600">
                {state.submittedSession.responses.length} response
                {state.submittedSession.responses.length === 1 ? '' : 's'} evaluated. This month’s
                set is now marked as used (you can regenerate a fresh set from the selection
                screen), and any matching SSB daily assignment has been marked Completed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetToSelection}
                className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
              >
                Back to Selection / Daily Queue
              </button>
              {onOpenAnalytics && (
                <button
                  type="button"
                  onClick={onOpenAnalytics}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Open OLQ &amp; Counsellor Review
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: 'Fast Thinking',
                val: state.submittedSession.dimensionScores.fastThinking,
                bar: 'bg-sky-600',
              },
              {
                label: 'Better Thinking',
                val: state.submittedSession.dimensionScores.betterThinking,
                bar: 'bg-blue-800',
              },
              {
                label: 'Positive Thinking',
                val: state.submittedSession.dimensionScores.positiveThinking,
                bar: 'bg-emerald-600',
              },
              {
                label: 'Self-Centred Pattern',
                val: state.submittedSession.dimensionScores.selfCentredThinking,
                bar: 'bg-amber-600',
              },
            ].map((d) => (
              <div key={d.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-700">{d.label}</span>
                  <span className="text-lg font-bold text-slate-900">{d.val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${d.bar}`} style={{ width: `${d.val}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Observed Strengths
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                {state.submittedSession.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Areas for Further Observation
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                {state.submittedSession.developmentAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Suggested Improvement Exercises
              </h4>
              <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                {state.submittedSession.suggestedExercises.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {Object.keys(state.submittedSession.candidateOlqSignals || {}).length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                <Brain className="h-4 w-4" />
                <span>Candidate OLQ Evidence Signals (Awaiting Corroboration &amp; Review)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(state.submittedSession.candidateOlqSignals).map(([k, v]) => (
                  <span
                    key={k}
                    className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
                  >
                    {olqNameByKey.get(k) || k}: <span className="text-blue-900">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* In-App Exit Confirmation Modal */}
      {exitModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Return to Test Selection?</h3>
            <p className="text-sm text-slate-600">
              Your drafted answers are saved locally on this device so you can resume later, or you
              can return to the monthly selection screen &amp; SSB daily queue now.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setExitModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Continue Assessment
              </button>
              <button
                type="button"
                onClick={() => {
                  setExitModalOpen(false);
                  resetToSelection();
                }}
                className="px-4 py-2 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 inline-flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Back to Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
