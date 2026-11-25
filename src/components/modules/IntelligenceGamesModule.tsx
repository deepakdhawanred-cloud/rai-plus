import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Brain,
  CalendarCheck,
  Clock,
  Languages,
  Play,
  Plus,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import type { CognitiveGameDefinition } from '../../types';
import type { WorkspaceData } from '../../types/workspace';
import { apiRequest } from '../../utils/api';
import {
  AGE_WISE_LEVEL_BANDS,
  getCognitiveGamesCatalog,
} from '../../utils/cognitiveGamesCatalog';
import {
  computeAdaptiveLevel,
  computeStudentCognitiveProfile,
  formatGameTitle,
  getAgeBandForClass,
  getDailyChallengeGame,
  getWeeklyMemoryGame,
} from '../../utils/cognitiveProfileEngine';
import { computeStudentGameRecommendations } from '../../utils/customRecommendationsEngine';
import { IntelligenceGames } from '../IntelligenceGames';
import { GameArenaModal } from '../games/GameArenaModal';
import type { GameRoundResult } from '../games/engines/gameEngineTypes';

interface IntelligenceGamesModuleProps {
  data: WorkspaceData;
  token: string;
  onRefresh: () => Promise<void>;
}

const OFFLINE_QUEUE_KEY = 'virat360_offline_cognitive_queue';

export const IntelligenceGamesModule: React.FC<IntelligenceGamesModuleProps> = ({
  data,
  token,
  onRefresh,
}) => {
  const catalog = useMemo(() => getCognitiveGamesCatalog(), []);
  const isStaff = ['super_admin', 'school_admin', 'principal', 'coordinator', 'teacher'].includes(
    data.user.role,
  );
  const isParent = data.user.role === 'parent';

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    data.students[0]?.id ?? '',
  );
  const activeStudent =
    data.students.find((s) => s.id === selectedStudentId) ?? data.students[0] ?? null;

  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Active playable game modal
  const [activeLaunch, setActiveLaunch] = useState<{
    game: CognitiveGameDefinition;
    challengeTag: 'daily' | 'weekly' | 'assigned' | 'practice';
    levelOverride?: 1 | 2 | 3 | 4 | 5;
  } | null>(null);

  // Break reminder & session limits
  const [sessionRounds, setSessionRounds] = useState(0);
  const [breakDismissed, setBreakDismissed] = useState(false);

  // Offline queue sync state
  const [offlineCount, setOfflineCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? (JSON.parse(raw) as unknown[]).length : 0;
    } catch {
      return 0;
    }
  });

  // Teacher Assignment Form
  const availableClasses = Array.from(new Set(data.students.map((s) => s.classSection)));
  const [assignGameId, setAssignGameId] = useState(catalog[0].id);
  const [assignClass, setAssignClass] = useState(availableClasses[0] || '9-A');
  const [assignStudentId, setAssignStudentId] = useState<string>('');
  const [assignLevel, setAssignLevel] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [assignDueDate, setAssignDueDate] = useState('2026-11-22');
  const [assignNote, setAssignNote] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudent && data.students[0]) {
      setSelectedStudentId(data.students[0].id);
    }
  }, [activeStudent, data.students]);

  const studentAttempts = useMemo(
    () =>
      activeStudent
        ? data.cognitiveAttempts.filter((a) => a.studentId === activeStudent.id)
        : [],
    [data.cognitiveAttempts, activeStudent],
  );

  const profile = useMemo(
    () =>
      activeStudent
        ? computeStudentCognitiveProfile(activeStudent.id, data.cognitiveAttempts, '2026-11-14')
        : null,
    [activeStudent, data.cognitiveAttempts],
  );

  const dailyChallenge = useMemo(() => getDailyChallengeGame('2026-11-14'), []);
  const weeklyMemory = useMemo(() => getWeeklyMemoryGame('2026-11-14'), []);

  const customRecommendations = useMemo(() => {
    if (!activeStudent) return [];
    return computeStudentGameRecommendations({
      student: activeStudent,
      examMarks: data.examMarks,
      notebookEntries: data.notebookEntries,
      evidence: data.evidence,
      breakdown: data.studentBreakdowns[activeStudent.id],
      cognitiveAttempts: data.cognitiveAttempts,
      readingReports: data.readingReports || [],
      numeracyReports: data.numeracyReports || [],
    });
  }, [
    activeStudent,
    data.examMarks,
    data.notebookEntries,
    data.evidence,
    data.studentBreakdowns,
    data.cognitiveAttempts,
    data.readingReports,
    data.numeracyReports,
  ]);

  const visibleAssignments = useMemo(() => {
    if (!activeStudent) return data.cognitiveAssignments;
    return data.cognitiveAssignments.filter(
      (a) =>
        a.targetClassSection === activeStudent.classSection &&
        (!a.studentId || a.studentId === activeStudent.id),
    );
  }, [data.cognitiveAssignments, activeStudent]);

  async function handleSaveGameAttempt(
    result: GameRoundResult & { difficultyLevel: 1 | 2 | 3 | 4 | 5 },
  ) {
    if (!activeStudent || !activeLaunch) return;
    setSessionRounds((r) => r + 1);
    const payload = {
      studentId: activeStudent.id,
      gameId: activeLaunch.game.id,
      difficultyLevel: result.difficultyLevel,
      accuracyPct: result.accuracyPct,
      completionTimeSec: result.completionTimeSec,
      reactionTimeMs: result.reactionTimeMs,
      errorCount: result.errorCount,
      scorePoints: result.scorePoints,
      completed: result.completed,
      challengeTag: activeLaunch.challengeTag,
    };

    try {
      await apiRequest(
        '/api/cognitive/attempts',
        { method: 'POST', body: JSON.stringify(payload) },
        token,
      );
      await onRefresh();
    } catch {
      // Offline-friendly local persistence queue
      try {
        const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
        const updated = [...existing, payload];
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
        setOfflineCount(updated.length);
      } catch {
        // ignore storage limits
      }
      throw new Error('Offline queued');
    }
  }

  async function syncOfflineQueue() {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const items = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : [];
      if (items.length === 0) return;
      for (const item of items) {
        await apiRequest(
          '/api/cognitive/attempts',
          { method: 'POST', body: JSON.stringify(item) },
          token,
        );
      }
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      setOfflineCount(0);
      await onRefresh();
      setFeedbackMsg(`Synced ${items.length} offline cognitive practice session(s).`);
    } catch {
      setFeedbackMsg('Could not sync offline queue yet. Check network connection.');
    }
  }

  async function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault();
    setAssignSaving(true);
    setFeedbackMsg(null);
    try {
      await apiRequest(
        '/api/cognitive/assignments',
        {
          method: 'POST',
          body: JSON.stringify({
            gameId: assignGameId,
            targetClassSection: assignClass,
            studentId: assignStudentId || undefined,
            recommendedLevel: assignLevel,
            dueDate: assignDueDate,
            note: assignNote,
          }),
        },
        token,
      );
      setAssignNote('');
      await onRefresh();
      const targetStudentName = assignStudentId
        ? data.students.find((s) => s.id === assignStudentId)?.name
        : null;
      setFeedbackMsg(
        `Assigned ${formatGameTitle(assignGameId)} (Level ${assignLevel}) to ${
          targetStudentName ? targetStudentName : `Class ${assignClass}`
        }.`,
      );
    } finally {
      setAssignSaving(false);
    }
  }

  async function handleAssignRecommendation(
    game: CognitiveGameDefinition,
    level: 1 | 2 | 3 | 4 | 5,
    triggerLabel: string,
  ) {
    if (!activeStudent) return;
    setAssignSaving(true);
    setFeedbackMsg(null);
    try {
      await apiRequest(
        '/api/cognitive/assignments',
        {
          method: 'POST',
          body: JSON.stringify({
            gameId: game.id,
            targetClassSection: activeStudent.classSection,
            studentId: activeStudent.id,
            recommendedLevel: level,
            dueDate: assignDueDate,
            note: `Custom support (${triggerLabel})`,
          }),
        },
        token,
      );
      await onRefresh();
      setFeedbackMsg(
        `Recommended & assigned ${game.title} (Level ${level}) to ${activeStudent.name}.`,
      );
    } finally {
      setAssignSaving(false);
    }
  }

  // Optional non-stigmatising positive participation milestones (no low-score shaming)
  const participationHighlights = useMemo(() => {
    return data.students
      .map((st) => {
        const count = data.cognitiveAttempts.filter((a) => a.studentId === st.id).length;
        return { id: st.id, name: st.name, classSection: st.classSection, count };
      })
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [data.students, data.cognitiveAttempts]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Intelligence & Cognitive Practice Games
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Structured brain-training across Attention, Memory, Perception, Response Control,
            Logical Thinking & Cognitive Flexibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isStaff && data.students.length > 0 && (
            <select
              aria-label="Select student for cognitive profile"
              value={activeStudent?.id || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900"
            >
              {data.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} (Class {st.classSection})
                </option>
              ))}
            </select>
          )}

          {/* Multilingual EN / HI Switch */}
          <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 text-xs">
            <span className="px-2 text-slate-500 flex items-center gap-1">
              <Languages className="h-3.5 w-3.5" />
            </span>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-md px-2.5 py-1 font-semibold ${
                lang === 'en' ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`rounded-md px-2.5 py-1 font-semibold ${
                lang === 'hi' ? 'bg-blue-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              हिन्दी
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-700 tabular-nums flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-900" />
            Session: {sessionRounds}/5 rounds
          </div>
        </div>
      </div>

      {/* Healthy Break Reminder & Offline Queue */}
      {sessionRounds >= 3 && !breakDismissed && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-medium text-amber-950">
            Healthy Focus Break Recommended: You have completed {sessionRounds} cognitive practice
            rounds in this sitting. Consider resting your eyes for 2 minutes or drinking water.
          </p>
          <button
            type="button"
            onClick={() => setBreakDismissed(true)}
            className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 whitespace-nowrap shrink-0"
          >
            Acknowledge Break Note
          </button>
        </div>
      )}

      {offlineCount > 0 && (
        <div className="rounded-xl border border-slate-300 bg-slate-100 px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-800">
            <WifiOff className="h-4 w-4 text-slate-600" />
            <span>{offlineCount} offline cognitive session(s) queued locally.</span>
          </div>
          <button
            type="button"
            onClick={() => void syncOfflineQueue()}
            className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Sync Now
          </button>
        </div>
      )}

      {/* Non-Scoring Policy Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-5 py-3 text-xs text-blue-950">
        <strong>Practice-Only Guidance Policy:</strong> Cognitive games measure practice progress
        (attempts, accuracy, response time, and adaptive levels) compared primarily against{' '}
        <strong>{activeStudent?.name ?? 'the student'}&apos;s own earlier baseline</strong>. Game
        scores never directly determine OLQ scores or Learners Score.
      </div>

      {/* Custom Report-Driven Game Recommendations */}
      {activeStudent && customRecommendations.length > 0 && (
        <section
          aria-label="Custom Game Recommendations"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Custom Game Recommendations for {activeStudent.name}
              </h2>
              <p className="text-xs text-slate-600">
                Tailored automatically from {activeStudent.name}&apos;s academic reports, reading &
                tables checks, and notebook evidence.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-blue-900 tabular-nums whitespace-nowrap">
              {customRecommendations.filter((r) => r.severity !== 'enrichment').length} report focus
              area(s)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-xl border p-4 space-y-3 ${
                  rec.severity === 'priority'
                    ? 'border-amber-300 bg-amber-50/40'
                    : rec.severity === 'support'
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-emerald-200 bg-emerald-50/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-600">
                      {rec.severity === 'priority'
                        ? 'Priority Support Needed'
                        : rec.severity === 'support'
                          ? 'Targeted Skill Support'
                          : 'On-Track Enrichment'}{' '}
                      · {rec.needArea}
                    </p>
                    <h3 className="font-display text-sm font-bold text-slate-900 mt-0.5">
                      {rec.triggerLabel}
                    </h3>
                  </div>
                  {rec.reportScorePct !== null && (
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums shrink-0">
                      {rec.reportScorePct}%
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rec.rationale}</p>

                <div className="space-y-2 pt-1">
                  {rec.recommendedGames.map((game) => (
                    <div
                      key={game.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          #{game.catalogNumber}. {lang === 'hi' ? `${game.title} (${game.titleHi})` : game.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {game.develops.slice(0, 2).join(' · ')} · Level {rec.suggestedLevel}
                        </p>
                      </div>
                      {!isParent && (
                        <div className="flex items-center gap-2 shrink-0">
                          {isStaff && (
                            <button
                              type="button"
                              disabled={assignSaving}
                              onClick={() =>
                                void handleAssignRecommendation(
                                  game,
                                  rec.suggestedLevel,
                                  rec.needArea,
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                            >
                              Assign to Student
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLaunch({
                                game,
                                challengeTag: 'practice',
                                levelOverride: rec.suggestedLevel,
                              })
                            }
                            aria-label={`Play recommended ${game.title}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                          >
                            <Play className="h-3 w-3" />
                            Play
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Challenge & Weekly Memory Spotlight */}
      {activeStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900">
                Daily Cognitive Challenge ·{' '}
                {profile?.dailyChallengeCompleted ? 'Completed Today' : 'Open Today'}
              </p>
              <h2 className="font-display text-base font-bold text-slate-900">
                #{dailyChallenge.catalogNumber}.{' '}
                {lang === 'hi' ? dailyChallenge.titleHi : dailyChallenge.title}
              </h2>
              <p className="text-xs text-slate-600">
                {dailyChallenge.category} · Adaptive Level{' '}
                {computeAdaptiveLevel(
                  activeStudent.classSection,
                  studentAttempts,
                  dailyChallenge.id,
                )}{' '}
                ({getAgeBandForClass(activeStudent.classSection)})
              </p>
            </div>
            {!isParent && (
              <button
                type="button"
                onClick={() =>
                  setActiveLaunch({ game: dailyChallenge, challengeTag: 'daily' })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                <Play className="h-3.5 w-3.5" />
                {profile?.dailyChallengeCompleted ? 'Practise Again' : 'Play Daily'}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-800">
                Weekly Memory Challenge ·{' '}
                {profile?.weeklyMemoryCompleted ? 'Completed This Week' : 'Active'}
              </p>
              <h2 className="font-display text-base font-bold text-slate-900">
                #{weeklyMemory.catalogNumber}.{' '}
                {lang === 'hi' ? weeklyMemory.titleHi : weeklyMemory.title}
              </h2>
              <p className="text-xs text-slate-600">
                {weeklyMemory.develops.join(' · ')}
              </p>
            </div>
            {!isParent && (
              <button
                type="button"
                onClick={() =>
                  setActiveLaunch({ game: weeklyMemory, challengeTag: 'weekly' })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <Play className="h-3.5 w-3.5" />
                Play Weekly
              </button>
            )}
          </div>
        </div>
      )}

      {/* Personal Improvement Dashboard */}
      {activeStudent && profile && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {isParent
                  ? `Parent-Visible Cognitive Practice Summary — ${activeStudent.name}`
                  : `Personal Cognitive Improvement Dashboard — ${activeStudent.name}`}
              </h2>
              <p className="text-xs text-slate-500">
                Self-referenced improvement vs {activeStudent.name}&apos;s earlier baseline · Class{' '}
                {activeStudent.classSection} ({getAgeBandForClass(activeStudent.classSection)})
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 tabular-nums">
              {profile.gamesExploredCount}/{catalog.length} games explored
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Total Attempts</p>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {profile.totalAttempts}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Accuracy Avg</p>
              <p className="font-mono text-xl font-bold text-blue-900 tabular-nums mt-0.5">
                {profile.overallAccuracyPct !== null ? `${profile.overallAccuracyPct}%` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Completion Time</p>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {profile.avgCompletionTimeSec !== null ? `${profile.avgCompletionTimeSec}s` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Reaction Time</p>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {profile.avgReactionTimeMs !== null ? `${profile.avgReactionTimeMs}ms` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Total Errors</p>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {profile.totalErrors}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Highest Level</p>
              <p className="font-mono text-xl font-bold text-emerald-700 tabular-nums mt-0.5">
                {profile.highestLevelCompleted > 0 ? `L${profile.highestLevelCompleted}` : '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Personal Trend</p>
              <p className="font-mono text-xl font-bold text-blue-900 tabular-nums mt-0.5">
                {profile.improvementDeltaPct !== null
                  ? `${profile.improvementDeltaPct >= 0 ? '+' : ''}${profile.improvementDeltaPct}%`
                  : `${profile.practiceConsistencyDays}d`}
              </p>
            </div>
          </div>

          {/* Category Progress & Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-700">
                Practice Performance by Cognitive Category
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.categorySummaries.map((cat) => (
                  <div
                    key={cat.category}
                    className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{cat.category}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {cat.learningIndicator}
                      </p>
                    </div>
                    <div className="text-right shrink-0 font-mono tabular-nums">
                      <p className="text-xs font-bold text-blue-900">
                        {cat.accuracyPct !== null ? `${cat.accuracyPct}%` : 'No runs'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {cat.attempts} runs · Max L{cat.highestLevel || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-600" />
                Earned Practice Milestones ({profile.earnedBadges.length})
              </h3>
              {profile.earnedBadges.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Complete any cognitive practice game to unlock personal milestones.
                </p>
              ) : (
                <ul className="space-y-2">
                  {profile.earnedBadges.map((badge) => (
                    <li
                      key={badge.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <p className="font-semibold text-slate-900">{badge.title}</p>
                      <p className="text-[11px] text-slate-600">{badge.criteria}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                <p className="font-semibold text-slate-800 mb-1">Next Practice Focus</p>
                <p className="text-slate-600">{profile.practiceRecommendations[0]}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher-Assigned Practice & Staff Assignment Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          className={`${
            isStaff ? 'lg:col-span-7' : 'lg:col-span-12'
          } rounded-xl border border-slate-200 bg-white p-5 space-y-3`}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-blue-900" />
              Teacher-Assigned Cognitive Activities ({visibleAssignments.length})
            </h2>
          </div>
          {visibleAssignments.length === 0 ? (
            <p className="text-xs text-slate-500">No active cognitive assignments yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleAssignments.slice(0, 5).map((asg) => {
                const gameDef = catalog.find((g) => g.id === asg.gameId);
                return (
                  <div
                    key={asg.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {gameDef?.title ?? asg.gameId} · Class {asg.targetClassSection} · Level{' '}
                        {asg.recommendedLevel}
                      </p>
                      <p className="text-slate-600">{asg.note}</p>
                      <p className="text-[11px] text-slate-400">
                        Assigned by {asg.teacherName} · Due {asg.dueDate}
                      </p>
                    </div>
                    {gameDef && !isParent && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveLaunch({
                            game: gameDef,
                            challengeTag: 'assigned',
                            levelOverride: asg.recommendedLevel,
                          })
                        }
                        className="rounded-lg border border-blue-900 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 whitespace-nowrap shrink-0"
                      >
                        Start Assigned Practice
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {isStaff && (
          <form
            onSubmit={handleCreateAssignment}
            className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3"
          >
            <h2 className="font-display text-sm font-bold text-slate-900">
              Assign Cognitive Practice Game
            </h2>
            <div>
              <label
                htmlFor="assign-game-select"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Cognitive Game
              </label>
              <select
                id="assign-game-select"
                value={assignGameId}
                onChange={(e) => setAssignGameId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                {catalog.map((g) => (
                  <option key={g.id} value={g.id}>
                    #{g.catalogNumber}. {g.title} ({g.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label
                  htmlFor="assign-class-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Class
                </label>
                <select
                  id="assign-class-select"
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  {(availableClasses.length > 0 ? availableClasses : ['9-A']).map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="assign-level-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Level
                </label>
                <select
                  id="assign-level-select"
                  value={assignLevel}
                  onChange={(e) => setAssignLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  {[1, 2, 3, 4, 5].map((lv) => (
                    <option key={lv} value={lv}>
                      Level {lv}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="assign-due-input"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Due Date
                </label>
                <input
                  id="assign-due-input"
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-mono"
                />
              </div>
            </div>
              <div>
                <label
                  htmlFor="assign-student-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Target Student (Optional)
                </label>
                <select
                  id="assign-student-select"
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
                >
                  <option value="">All Students in Class {assignClass}</option>
                  {data.students
                    .filter((st) => st.classSection === assignClass)
                    .map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} (Roll {st.rollNo})
                      </option>
                    ))}
                </select>
              </div>
            <input
              type="text"
              aria-label="Assignment guidance note"
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              placeholder="Optional teacher guidance note..."
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              disabled={assignSaving}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {assignSaving ? 'Assigning...' : 'Assign Cognitive Activity'}
            </button>
          </form>
        )}
      </div>

      {feedbackMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800">
          {feedbackMsg}
        </div>
      )}

      {/* Cognitive Games Catalogue Shell */}
      <IntelligenceGames
        games={catalog}
        lang={lang}
        isReadOnly={isParent}
        title="Cognitive Games Catalogue"
        subtitle="Extensible plugin game engine — adaptive levels adjust automatically for Classes 1–12."
        adaptiveLevelForGame={(game) =>
          activeStudent
            ? computeAdaptiveLevel(activeStudent.classSection, studentAttempts, game.id)
            : 3
        }
        bestAccuracyForGame={(game) => {
          const gameAttempts = studentAttempts.filter((a) => a.gameId === game.id);
          return gameAttempts.length > 0
            ? Math.max(...gameAttempts.map((a) => a.accuracyPct))
            : null;
        }}
        onLaunchGame={(game) => setActiveLaunch({ game, challengeTag: 'practice' })}
      />

      {/* Age-Wise Complexity & Non-Stigmatising Practice Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-900" />
            Age-Wise & Adaptive Complexity Framework
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {AGE_WISE_LEVEL_BANDS.map((band) => (
              <div key={band.level} className="py-2 flex items-center justify-between gap-4">
                <span className="font-semibold text-slate-900 whitespace-nowrap">
                  Level {band.level} · {band.ageBand}
                </span>
                <span className="text-slate-600 text-right">{band.complexitySummary}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            Non-Stigmatising Practice Consistency Highlights
          </h3>
          <p className="text-xs text-slate-500">
            Recognises regular cognitive practice participation without public score rankings.
          </p>
          <div className="space-y-2">
            {participationHighlights.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="font-medium text-slate-900">
                  {item.name} · Class {item.classSection}
                </span>
                <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                  {item.count} practice sessions
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Playable Game Arena Modal */}
      {activeLaunch && activeStudent && (
        <GameArenaModal
          game={activeLaunch.game}
          initialLevel={
            activeLaunch.levelOverride ??
            computeAdaptiveLevel(
              activeStudent.classSection,
              studentAttempts,
              activeLaunch.game.id,
            )
          }
          studentName={activeStudent.name}
          studentClass={activeStudent.classSection}
          priorAttempts={studentAttempts}
          lang={lang}
          challengeTag={activeLaunch.challengeTag}
          onSaveAttempt={handleSaveGameAttempt}
          onClose={() => setActiveLaunch(null)}
        />
      )}
    </div>
  );
};
