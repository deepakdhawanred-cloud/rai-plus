import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Brain,
  Calculator,
  Compass,
  FlaskConical,
  Gamepad2,
  Layers,
  Loader2,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { WorkspaceData } from '../../types/workspace';
import type {
  ChapterLearningBlueprint,
  DifficultyBand,
  ExperientialSimulationAsset,
  InteractiveGameAsset,
  InteractiveLearningOverviewPayload,
  PersonalizedCoachPlan,
} from '../../types/interactiveLearning';
import {
  buildPersonalizedCoachPlan,
  computeStudentBadges,
  GAME_FORMAT_CATALOG,
  isAttemptMastered,
} from '../../utils/interactiveLearningEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';
import { SorobanAbacusStudio } from './SorobanAbacusStudio';
import { ExperientialMotionLab } from './ExperientialMotionLab';
import { UniversalGameArena } from './UniversalGameArena';
import { ChapterCoverageAndStudioPanel } from './ChapterCoverageAndStudioPanel';
import { ChapterConceptStudyDrawer } from './ChapterConceptStudyDrawer';

interface InteractiveLearningModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
  embedded?: boolean;
}

type InteractiveTabId =
  | 'hub'
  | 'games'
  | 'experiential'
  | 'abacus'
  | 'coach_rewards'
  | 'studio';

export const InteractiveLearningModule: React.FC<InteractiveLearningModuleProps> = ({
  data,
  token,
  onRefresh,
  embedded = false,
}) => {
  const isStaff = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    data.user.role,
  );
  const [activeTab, setActiveTab] = useState<InteractiveTabId>(isStaff ? 'studio' : 'hub');
  const [overview, setOverview] = useState<InteractiveLearningOverviewPayload | null>(
    data.interactiveLearning || null,
  );
  const [loading, setLoading] = useState(!data.interactiveLearning);

  // Selected student for Coach/Attempts view
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    data.students[0]?.id || '',
  );

  // Filters for Games & Experiential Libraries
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Active playables
  const [activeGame, setActiveGame] = useState<InteractiveGameAsset | null>(null);
  const [activeSim, setActiveSim] = useState<ExperientialSimulationAsset | null>(null);
  const [studyingBlueprint, setStudyingBlueprint] = useState<ChapterLearningBlueprint | null>(null);
  const [abacusStartLevel, setAbacusStartLevel] = useState<number>(1);

  // AI Coach narrative & Teacher Override state
  const [aiNarrative, setAiNarrative] = useState<{ guidance: string; reTeachingTip: string } | null>(
    null,
  );
  const [loadingNarrative, setLoadingNarrative] = useState(false);
  const [overrideDifficulty, setOverrideDifficulty] = useState<DifficultyBand>('Intermediate');
  const [overrideNote, setOverrideNote] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  const loadOverview = async () => {
    try {
      const payload = await apiRequest<InteractiveLearningOverviewPayload>(
        '/api/interactive-learning/overview',
        {},
        token,
      );
      setOverview(payload);
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : 'Unable to load interactive learning workspace.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.interactiveLearning) {
      setOverview(data.interactiveLearning);
      setLoading(false);
    } else {
      void loadOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.interactiveLearning]);

  useEffect(() => {
    if (!selectedStudentId && data.students[0]?.id) {
      setSelectedStudentId(data.students[0].id);
    }
  }, [data.students, selectedStudentId]);

  const handleFullRefresh = async () => {
    await loadOverview();
    await onRefresh();
  };

  const activeStudent = useMemo(
    () => data.students.find((s) => s.id === selectedStudentId) || data.students[0],
    [data.students, selectedStudentId],
  );

  const studentAttempts = useMemo(() => {
    if (!overview) return [];
    if (!activeStudent) return overview.attempts;
    return overview.attempts.filter((a) => a.studentId === activeStudent.id);
  }, [overview, activeStudent]);

  const studentAbacus = useMemo(() => {
    if (!overview) return [];
    if (!activeStudent) return overview.abacusSessions;
    return overview.abacusSessions.filter((s) => s.studentId === activeStudent.id);
  }, [overview, activeStudent]);

  const studentBadges = useMemo(() => {
    if (!overview) return [];
    return computeStudentBadges({
      attempts: studentAttempts,
      abacusSessions: studentAbacus,
      blueprints: overview.blueprints,
    });
  }, [overview, studentAttempts, studentAbacus]);

  const coachPlan: PersonalizedCoachPlan | null = useMemo(() => {
    if (!overview || !activeStudent) return null;
    const override =
      overview.coachOverrides.find((o) => o.studentId === activeStudent.id) || null;
    return buildPersonalizedCoachPlan({
      studentId: activeStudent.id,
      blueprints: overview.blueprints,
      games: overview.games,
      experientialAssets: overview.experientialAssets,
      attempts: overview.attempts,
      abacusSessions: overview.abacusSessions,
      examMarks: data.examMarks,
      teacherOverride: override,
    });
  }, [overview, activeStudent, data.examMarks]);

  const unfinishedAttempts = useMemo(
    () => studentAttempts.filter((a) => a.status === 'in_progress'),
    [studentAttempts],
  );

  const totalXp = useMemo(
    () =>
      studentAttempts.reduce((s, a) => s + a.xpEarned, 0) +
      studentAbacus.reduce((s, a) => s + a.xpEarned, 0),
    [studentAttempts, studentAbacus],
  );

  const masteredCount = useMemo(
    () => new Set(studentAttempts.filter(isAttemptMastered).map((a) => a.conceptId)).size,
    [studentAttempts],
  );

  const availableSubjects = useMemo(() => {
    if (!overview) return [];
    return Array.from(
      new Set([
        ...overview.blueprints.map((b) => b.subject),
        ...overview.games.map((g) => g.subject),
        ...overview.experientialAssets.map((e) => e.subject),
      ]),
    ).sort();
  }, [overview]);

  const availableClasses = useMemo(() => {
    if (!overview) return [];
    return Array.from(
      new Set([
        ...overview.blueprints.map((b) => b.classLevel),
        ...overview.games.map((g) => g.classLevel),
        ...overview.experientialAssets.map((e) => e.classLevel),
      ]),
    ).sort((a, b) => a - b);
  }, [overview]);

  const filteredGames = useMemo(() => {
    if (!overview) return [];
    return overview.games.filter((g) => {
      if (subjectFilter !== 'ALL' && g.subject !== subjectFilter) return false;
      if (classFilter !== 'ALL' && String(g.classLevel) !== classFilter) return false;
      return true;
    });
  }, [overview, subjectFilter, classFilter]);

  const filteredSims = useMemo(() => {
    if (!overview) return [];
    return overview.experientialAssets.filter((e) => {
      if (subjectFilter !== 'ALL' && e.subject !== subjectFilter) return false;
      if (classFilter !== 'ALL' && String(e.classLevel) !== classFilter) return false;
      return true;
    });
  }, [overview, subjectFilter, classFilter]);

  const handleLaunchRecommended = (rec: PersonalizedCoachPlan['recommendedActivities'][number]) => {
    if (!overview) return;
    if (rec.assetType === 'abacus') {
      const lvl = Number(rec.assetId.replace('abacus-level-', '')) || 1;
      setAbacusStartLevel(lvl);
      setActiveTab('abacus');
      return;
    }
    if (rec.assetType === 'experiential') {
      const sim = overview.experientialAssets.find((e) => e.id === rec.assetId);
      if (sim) {
        setActiveSim(sim);
        setActiveTab('experiential');
      }
      return;
    }
    const game = overview.games.find((g) => g.id === rec.assetId);
    if (game) {
      setActiveGame(game);
      setActiveTab('games');
    }
  };

  const handleGenerateAiCoachNarrative = async () => {
    if (!activeStudent) return;
    setLoadingNarrative(true);
    try {
      const res = await apiRequest<{
        aiNarrative: { guidance: string; reTeachingTip: string } | null;
      }>(
        '/api/interactive-learning/coach/recommend',
        {
          method: 'POST',
          body: JSON.stringify({ studentId: activeStudent.id, useAiNarrative: true }),
        },
        token,
      );
      setAiNarrative(res.aiNarrative);
      pushToast('AI Learning Coach guidance refreshed.', 'success');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to fetch AI coach guidance.', 'error');
    } finally {
      setLoadingNarrative(false);
    }
  };

  const handleSaveTeacherOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    setSavingOverride(true);
    try {
      await apiRequest(
        '/api/interactive-learning/coach/override',
        {
          method: 'PUT',
          body: JSON.stringify({
            studentId: activeStudent.id,
            recommendedDifficulty: overrideDifficulty,
            focusConcepts: coachPlan?.weakConcepts.map((w) => w.title) || [],
            teacherNote: overrideNote,
          }),
        },
        token,
      );
      pushToast(`Teacher override saved for ${activeStudent.name}.`, 'success');
      setOverrideNote('');
      await handleFullRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to save teacher override.', 'error');
    } finally {
      setSavingOverride(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#142B46] mx-auto" />
        <p className="text-xs font-semibold text-slate-600">
          Loading Rai Plus Interactive Learning &amp; Experiential Education Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Hero Header (compact bar when embedded inside unified Class Learning Hub) */}
      {embedded ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#142B46]">
              Interactive Learning Lab · AI Blueprints, Motion Labs &amp; Virtual Soroban
            </p>
            <p className="text-xs text-slate-600">
              Concept explanations, 20-format games, experiential simulations, mental maths abacus, and chapter coverage.
            </p>
          </div>
          {data.students.length > 1 && (
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="il-student-picker" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                Active Learner:
              </label>
              <select
                id="il-student-picker"
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setAiNarrative(null);
                }}
                className="rounded-lg bg-white border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-[#142B46]"
              >
                {data.students.slice(0, 60).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classSection})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-[#142B46] text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#D6B66D]">
              Rai Plus Interactive Learning &amp; Experiential Education Engine
            </p>
            <h2 className="font-display text-xl font-bold tracking-tight">
              Chapter Intelligence, 20-Format Games, Motion Labs &amp; Virtual Soroban
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Every textbook chapter converted into approved concept explanations, playable games,
              interactive virtual labs, mental maths Soroban practice, and personalized AI coaching.
            </p>
          </div>

          {data.students.length > 1 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl border border-white/15 px-3 py-2">
              <label htmlFor="il-student-picker" className="text-[11px] font-semibold text-[#D6B66D]">
                Active Learner:
              </label>
              <select
                id="il-student-picker"
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setAiNarrative(null);
                }}
                className="rounded-md bg-[#0E2036] border border-white/20 px-2.5 py-1 text-xs font-semibold text-white"
              >
                {data.students.slice(0, 60).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.classSection})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Primary Module Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'hub', label: 'Student Learning Hub', icon: Compass, show: true },
            { id: 'games', label: `Games Arena (${overview.games.length})`, icon: Gamepad2, show: true },
            {
              id: 'experiential',
              label: `Experiential Motion Labs (${overview.experientialAssets.length})`,
              icon: FlaskConical,
              show: true,
            },
            { id: 'abacus', label: 'Abacus & Mental Maths', icon: Calculator, show: true },
            { id: 'coach_rewards', label: 'AI Coach & Rewards', icon: Trophy, show: true },
            {
              id: 'studio',
              label: 'Chapter Coverage & Teacher Studio',
              icon: Layers,
              show: isStaff,
            },
          ] as const
        )
          .filter((t) => t.show)
          .map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#142B46] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
      </div>

      {/* TAB 1: MODULE H — STUDENT LEARNING HUB */}
      {activeTab === 'hub' && (
        <div className="space-y-5">
          {/* Student Snapshot KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Balanced Learning XP
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#142B46] tabular-nums">
                {totalXp} XP
              </p>
              <p className="text-xs text-slate-600 tabular-nums">
                Level {Math.max(1, Math.floor(totalXp / 180) + 1)} Learner
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Verified Concepts Mastered
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#3D6349] tabular-nums">
                {masteredCount}
              </p>
              <p className="text-xs text-slate-600">Accuracy &ge; 75% verified</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Badges Earned
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums">
                {studentBadges.filter((b) => b.earned).length}{' '}
                <span className="text-xs font-medium text-slate-500">/ {studentBadges.length}</span>
              </p>
              <p className="text-xs text-slate-600">Accuracy, Science, Math &amp; Abacus</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                In-Progress Activities
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#142B46] tabular-nums">
                {unfinishedAttempts.length}
              </p>
              <p className="text-xs text-slate-600">Auto-saved for quick resume</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recommended Next Activities + Continue Unfinished */}
            <div className="lg:col-span-7 space-y-4">
              {unfinishedAttempts.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                  <h3 className="font-display text-sm font-bold text-[#142B46]">
                    Continue Unfinished Activities
                  </h3>
                  <div className="space-y-2">
                    {unfinishedAttempts.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-xl border border-amber-200 bg-white p-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#142B46]">{att.assetTitle}</p>
                          <p className="text-[11px] text-slate-600 tabular-nums">
                            {att.subject} · {att.progressPct}% completed · Auto-saved
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const g = overview.games.find((x) => x.id === att.assetId);
                            if (g) {
                              setActiveGame(g);
                              setActiveTab('games');
                              return;
                            }
                            const s = overview.experientialAssets.find((x) => x.id === att.assetId);
                            if (s) {
                              setActiveSim(s);
                              setActiveTab('experiential');
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0"
                        >
                          <Play className="h-3 w-3" />
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-[#142B46]">
                      Recommended Next Activities
                    </h3>
                    <p className="text-xs text-slate-600">
                      Tailored to {activeStudent?.name || 'Learner'}&apos;s adaptive level (
                      <strong>{coachPlan?.recommendedDifficulty || 'Intermediate'}</strong>).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('coach_rewards')}
                    className="text-xs font-semibold text-[#142B46] hover:underline"
                  >
                    Full AI Coach Plan
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(coachPlan?.recommendedActivities || []).slice(0, 5).map((rec) => (
                    <div
                      key={rec.assetId}
                      className="rounded-xl border border-slate-200 bg-[#FAF4EC]/60 p-3.5 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3D6349]">
                          {rec.assetType === 'experiential'
                            ? 'Interactive Motion Lab'
                            : rec.assetType === 'abacus'
                              ? 'Mental Maths & Soroban'
                              : 'Concept Game'}
                        </p>
                        <p className="text-xs font-bold text-[#142B46]">{rec.title}</p>
                        <p className="text-[11px] text-slate-600">{rec.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleLaunchRecommended(rec)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Launch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: My Interactive Chapters */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#142B46]" />
                <h3 className="font-display text-base font-bold text-[#142B46]">
                  Interactive Chapter Library
                </h3>
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {overview.blueprints.map((bp) => {
                  const cov = overview.coverageScores.find((c) => c.chapterId === bp.id);
                  const bpGames = overview.games.filter((g) => g.chapterId === bp.id);
                  const bpSims = overview.experientialAssets.filter((e) => e.chapterId === bp.id);
                  return (
                    <div
                      key={bp.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500">
                            Class {bp.classLevel} · {bp.subject} · Ch. {bp.chapterNumber}
                          </p>
                          <p className="font-display text-sm font-bold text-[#142B46]">
                            {bp.chapterTitle}
                          </p>
                        </div>
                        {cov && (
                          <span className="font-mono text-xs font-bold text-[#3D6349] tabular-nums">
                            {cov.overallCoveragePct}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{bp.overview}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setStudyingBlueprint(bp)}
                          className="rounded-lg bg-[#142B46] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1e3b5c]"
                        >
                          Study Concepts ({bp.concepts.length})
                        </button>
                        {bpSims[0] && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSim(bpSims[0]);
                              setActiveTab('experiential');
                            }}
                            className="rounded-lg bg-[#3D6349] px-2.5 py-1 text-[11px] font-semibold text-white"
                          >
                            Open Motion Lab
                          </button>
                        )}
                        {bpGames[0] && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGame(bpGames[0]);
                              setActiveTab('games');
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#142B46]"
                          >
                            Play Game ({bpGames.length})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODULE B — GAMES ARENA (ALL 20 FORMATS) */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          {activeGame ? (
            <UniversalGameArena
              game={activeGame}
              token={token}
              studentId={activeStudent?.id}
              onAttemptSaved={handleFullRefresh}
              onClose={() => setActiveGame(null)}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[#142B46]">
                    Chapter-Wise Interactive Games (20 Pedagogical Formats)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Drag &amp; Drop, Matching, Memory, Crosswords, Word Search, Sequences, Diagram
                    Labelling, Scientific Detective, Maths Challenges, Error Fixing &amp; more.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    <option value="ALL">All Classes</option>
                    {availableClasses.map((c) => (
                      <option key={c} value={String(c)}>Class {c}</option>
                    ))}
                  </select>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    <option value="ALL">All Subjects</option>
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map((g) => {
                  const lastAttempt = studentAttempts.find((a) => a.assetId === g.id);
                  return (
                    <div
                      key={g.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                          <span className="text-[#3D6349]">
                            {GAME_FORMAT_CATALOG[g.gameFormat]?.label || g.gameFormat}
                          </span>
                          <span className="text-slate-500">
                            Class {g.classLevel} · {g.subject}
                          </span>
                        </div>
                        <h4 className="font-display text-sm font-bold text-[#142B46]">{g.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{g.instructions}</p>
                        <p className="text-[11px] text-slate-500">
                          Chapter: {g.chapterTitle} · {g.difficulty}
                        </p>
                      </div>
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-slate-600 tabular-nums">
                          {lastAttempt
                            ? `Best: ${lastAttempt.accuracyPct}%`
                            : `${g.items.length} interactive tasks`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveGame(g)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#142B46] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
                        >
                          <Play className="h-3.5 w-3.5" />
                          Play Game
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: MODULE D — EXPERIENTIAL LEARNING & MOTION GRAPHICS LABS */}
      {activeTab === 'experiential' && (
        <div className="space-y-4">
          {activeSim ? (
            <ExperientialMotionLab
              asset={activeSim}
              token={token}
              studentId={activeStudent?.id}
              onAttemptSaved={handleFullRefresh}
              onClose={() => setActiveSim(null)}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-[#142B46]">
                    Interactive Virtual Labs &amp; Motion Graphics
                  </h3>
                  <p className="text-xs text-slate-600">
                    Step-by-step animated biological systems, physics circuits, climate simulators,
                    3D geometry solids, volcanoes, and English tense timelines.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                  >
                    <option value="ALL">All Subjects</option>
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSims.map((sim) => (
                  <div
                    key={sim.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#3D6349]">
                        Class {sim.classLevel} · {sim.subject} · {sim.stages.length} interactive stages
                      </p>
                      <h4 className="font-display text-sm font-bold text-[#142B46]">{sim.title}</h4>
                      <p className="text-xs text-slate-600">{sim.subtitle}</p>
                      <p className="text-[11px] text-slate-500">Chapter: {sim.chapterTitle}</p>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">{sim.difficulty}</span>
                      <button
                        type="button"
                        onClick={() => setActiveSim(sim)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#3D6349] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b] whitespace-nowrap shrink-0"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        Launch Simulation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: MODULE C — ABACUS & MENTAL MATHEMATICS */}
      {activeTab === 'abacus' && (
        <SorobanAbacusStudio
          token={token}
          studentId={activeStudent?.id}
          sessions={studentAbacus}
          initialLevel={abacusStartLevel}
          onSessionSaved={handleFullRefresh}
        />
      )}

      {/* TAB 5: MODULES E & F — AI PERSONALIZED LEARNING COACH, BADGES & LEADERBOARD */}
      {activeTab === 'coach_rewards' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 7 cols: AI Personalized Learning Coach + Teacher Override */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#142B46]" />
                  <div>
                    <h3 className="font-display text-base font-bold text-[#142B46]">
                      Module E · AI Personalized Learning Coach
                    </h3>
                    <p className="text-xs text-slate-600">
                      Diagnostic view for <strong>{activeStudent?.name || 'Student'}</strong> ·
                      Adaptive Difficulty: <strong>{coachPlan?.recommendedDifficulty}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loadingNarrative}
                  onClick={handleGenerateAiCoachNarrative}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c] disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {loadingNarrative ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-[#D6B66D]" />
                  )}
                  Generate AI Coach Narrative
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#FAF4EC] p-3.5 text-xs text-slate-800 leading-relaxed">
                {aiNarrative ? (
                  <div className="space-y-1.5">
                    <p>
                      <strong className="text-[#142B46]">AI Coach Guidance:</strong>{' '}
                      {aiNarrative.guidance}
                    </p>
                    <p>
                      <strong className="text-[#3D6349]">Re-Teaching Tip:</strong>{' '}
                      {aiNarrative.reTeachingTip}
                    </p>
                  </div>
                ) : (
                  <p>{coachPlan?.reTeachingNote}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Concepts Needing Attention (&lt;75%)
                  </p>
                  {coachPlan && coachPlan.weakConcepts.length > 0 ? (
                    coachPlan.weakConcepts.map((w) => (
                      <p key={w.conceptId} className="text-xs text-amber-950 tabular-nums">
                        • <strong>{w.title}</strong> ({w.subject}) — {w.accuracyPct}%
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600">No weak concepts detected yet.</p>
                  )}
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                    Verified Strong Concepts (&ge;75%)
                  </p>
                  {coachPlan && coachPlan.strongConcepts.length > 0 ? (
                    coachPlan.strongConcepts.map((s) => (
                      <p key={s.conceptId} className="text-xs text-emerald-950 tabular-nums">
                        • <strong>{s.title}</strong> ({s.subject}) — {s.accuracyPct}%
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600">Complete an activity to log mastery.</p>
                  )}
                </div>
              </div>

              {/* 3-Day Revision Schedule */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Suggested 3-Day Revision Schedule
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(coachPlan?.revisionSchedule || []).map((item) => (
                    <div
                      key={item.dayLabel}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#142B46]">
                        <span>{item.dayLabel}</span>
                        <span className="font-mono text-[#3D6349]">{item.durationMin}m</span>
                      </div>
                      <p className="text-xs text-slate-700">{item.focus}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Override Form */}
              {isStaff && activeStudent && (
                <form
                  onSubmit={handleSaveTeacherOverride}
                  className="border-t border-slate-200 pt-4 space-y-3"
                >
                  <p className="text-xs font-bold text-[#142B46]">
                    Teacher Override for {activeStudent.name}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <select
                      value={overrideDifficulty}
                      onChange={(e) => setOverrideDifficulty(e.target.value as DifficultyBand)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                    >
                      <option value="Foundation">Override: Foundation</option>
                      <option value="Intermediate">Override: Intermediate</option>
                      <option value="Advanced">Override: Advanced</option>
                    </select>
                    <input
                      type="text"
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      placeholder="Custom teacher focus note..."
                      className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingOverride}
                    className="rounded-lg bg-[#3D6349] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b]"
                  >
                    {savingOverride ? 'Saving Override...' : 'Save Teacher Override'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right 5 cols: Module F Badges & Balanced School Leaderboard */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                <h4 className="font-display text-sm font-bold text-[#142B46]">
                  Achievement Badges (Accuracy &amp; Consistency)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {studentBadges.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-xl border p-3 space-y-1.5 ${
                      b.earned
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : 'border-slate-200 bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#142B46]">
                      <span className="truncate">{b.title}</span>
                      <span className="font-mono text-[11px] text-[#3D6349] tabular-nums">
                        {b.progressPct}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#D6B66D]" />
                  <h4 className="font-display text-sm font-bold text-[#142B46]">
                    Balanced Mastery Leaderboard
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">Accuracy + Mastery + Streak</span>
              </div>
              {overview.leaderboard.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Complete games or Abacus sessions to appear on the leaderboard.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {overview.leaderboard.slice(0, 8).map((row, idx) => (
                    <div
                      key={row.studentId}
                      className="py-2 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-md bg-[#142B46] text-[#D6B66D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-[#142B46]">{row.studentName}</p>
                          <p className="text-[11px] text-slate-500">
                            {row.classSection} · {row.masteredConceptsCount} mastered ·{' '}
                            {row.avgAccuracyPct}% acc
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#3D6349] tabular-nums">
                        {row.totalXp} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHAPTER COVERAGE SCORE & TEACHER STUDIO (MODULES A, G, I) */}
      {activeTab === 'studio' && isStaff && (
        <ChapterCoverageAndStudioPanel
          overview={overview}
          token={token}
          userRole={data.user.role}
          onRefresh={handleFullRefresh}
          onPreviewGame={(game) => {
            setActiveGame(game);
            setActiveTab('games');
          }}
          onPreviewSim={(sim) => {
            setActiveSim(sim);
            setActiveTab('experiential');
          }}
        />
      )}

      {/* Chapter Concept Study Guide Drawer */}
      {studyingBlueprint && (
        <ChapterConceptStudyDrawer
          blueprint={studyingBlueprint}
          games={overview.games}
          simulations={overview.experientialAssets}
          studentAttempts={studentAttempts}
          token={token}
          studentId={activeStudent?.id}
          onAttemptSaved={handleFullRefresh}
          onLaunchGame={(game) => {
            setActiveGame(game);
            setActiveTab('games');
          }}
          onLaunchSim={(sim) => {
            setActiveSim(sim);
            setActiveTab('experiential');
          }}
          onClose={() => setStudyingBlueprint(null)}
        />
      )}
    </div>
  );
};
