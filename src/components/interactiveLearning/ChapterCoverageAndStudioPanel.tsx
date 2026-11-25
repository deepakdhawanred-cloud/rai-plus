import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Edit3,
  FileUp,
  FlaskConical,
  Gamepad2,
  Layers,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type {
  ApprovalStatus,
  ChapterCoverageScore,
  ChapterLearningBlueprint,
  DifficultyBand,
  ExperientialSimulationAsset,
  GameFormatType,
  InteractiveGameAsset,
  InteractiveLearningOverviewPayload,
  TeacherApprovalPolicyConfig,
} from '../../types/interactiveLearning';
import {
  ALL_20_GAME_FORMATS,
  GAME_FORMAT_CATALOG,
  isAttemptMastered,
} from '../../utils/interactiveLearningEngine';
import { apiRequest } from '../../utils/api';
import { pushToast } from '../ToastProvider';

interface ChapterCoverageAndStudioPanelProps {
  overview: InteractiveLearningOverviewPayload;
  token: string;
  userRole: string;
  onRefresh: () => Promise<void>;
  onPreviewGame: (game: InteractiveGameAsset) => void;
  onPreviewSim?: (sim: ExperientialSimulationAsset) => void;
}

const CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = [
  'Science',
  'Mathematics',
  'Social Science',
  'English',
  'Hindi',
  'EVS',
  'Computer Science',
];

type AnalyticsDimension = 'school' | 'class' | 'subject' | 'chapter' | 'student';

interface AggregatedMasteryRow {
  key: string;
  label: string;
  sublabel?: string;
  attempts: number;
  completed: number;
  mastered: number;
  timeMin: number;
  avgAccuracy: number;
  masteryRatePct: number;
  needsIntervention: boolean;
}

export const ChapterCoverageAndStudioPanel: React.FC<ChapterCoverageAndStudioPanelProps> = ({
  overview,
  token,
  userRole,
  onRefresh,
  onPreviewGame,
  onPreviewSim,
}) => {
  const [subView, setSubView] = useState<'coverage' | 'ai_analyzer' | 'approval' | 'analytics'>('coverage');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    overview.coverageScores[0]?.chapterId || '',
  );

  // Blueprint inline concept explanation editor
  const [editingConceptId, setEditingConceptId] = useState<string | null>(null);
  const [conceptDraftText, setConceptDraftText] = useState<string>('');

  // Module A: AI Chapter Analyzer form (supports notes OR Textbook PDF / TXT upload)
  const [anClass, setAnClass] = useState<number>(7);
  const [anSubject, setAnSubject] = useState<string>('Science');
  const [anChapNum, setAnChapNum] = useState<number>(3);
  const [anTitle, setAnTitle] = useState<string>('');
  const [anLanguage, setAnLanguage] = useState<string>('English');
  const [anObjectives, setAnObjectives] = useState<string>('');
  const [anContent, setAnContent] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // Module B: AI Game Generator form
  const [genBlueprintId, setGenBlueprintId] = useState<string>(overview.blueprints[0]?.id || '');
  const [genConceptId, setGenConceptId] = useState<string>(
    overview.blueprints[0]?.concepts[0]?.conceptId || '',
  );
  const [genFormat, setGenFormat] = useState<GameFormatType | ''>('');
  const [genDifficulty, setGenDifficulty] = useState<DifficultyBand>('Intermediate');
  const [generatingGame, setGeneratingGame] = useState(false);

  // Module G: Approval & inline editing
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | ApprovalStatus>('ALL');
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyBand>('Intermediate');
  const [editDeadline, setEditDeadline] = useState('');
  const [editClassSections, setEditClassSections] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  // Module I: Multi-level analytics dimension
  const [analyticsDim, setAnalyticsDim] = useState<AnalyticsDimension>('school');

  // Policy saving
  const [savingPolicy, setSavingPolicy] = useState(false);
  const canConfigurePolicy = ['super_admin', 'school_admin', 'principal', 'coordinator'].includes(userRole);

  const selectedCoverage: ChapterCoverageScore | undefined = useMemo(
    () =>
      overview.coverageScores.find((c) => c.chapterId === selectedChapterId) ||
      overview.coverageScores[0],
    [overview.coverageScores, selectedChapterId],
  );

  const selectedBlueprint: ChapterLearningBlueprint | undefined = useMemo(
    () =>
      overview.blueprints.find((b) => b.id === (selectedCoverage?.chapterId || selectedChapterId)) ||
      overview.blueprints[0],
    [overview.blueprints, selectedCoverage, selectedChapterId],
  );

  const selectedGenBlueprint: ChapterLearningBlueprint | undefined = useMemo(
    () => overview.blueprints.find((b) => b.id === genBlueprintId) || overview.blueprints[0],
    [overview.blueprints, genBlueprintId],
  );

  const schoolAvgCoverage = useMemo(() => {
    if (overview.coverageScores.length === 0) return 0;
    return Math.round(
      overview.coverageScores.reduce((s, c) => s + c.overallCoveragePct, 0) /
        overview.coverageScores.length,
    );
  }, [overview.coverageScores]);

  const pendingQueueCount = useMemo(() => {
    return (
      overview.blueprints.filter((b) => b.approvalStatus === 'Pending Review').length +
      overview.games.filter((g) => g.approvalStatus === 'Pending Review').length +
      overview.experientialAssets.filter((e) => e.approvalStatus === 'Pending Review').length
    );
  }, [overview]);

  // Module I: Multi-level aggregation helper (School / Class / Subject / Chapter / Student)
  const buildAggregatedRows = (
    groupFn: (a: InteractiveLearningOverviewPayload['attempts'][number]) => {
      key: string;
      label: string;
      sublabel?: string;
    },
  ): AggregatedMasteryRow[] => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        sublabel?: string;
        attempts: number;
        completed: number;
        mastered: number;
        timeSec: number;
        accSum: number;
      }
    >();
    for (const a of overview.attempts) {
      const g = groupFn(a);
      const cur = map.get(g.key) || {
        key: g.key,
        label: g.label,
        sublabel: g.sublabel,
        attempts: 0,
        completed: 0,
        mastered: 0,
        timeSec: 0,
        accSum: 0,
      };
      cur.attempts += 1;
      if (a.status === 'completed') cur.completed += 1;
      if (isAttemptMastered(a)) cur.mastered += 1;
      cur.timeSec += a.timeSpentSec;
      cur.accSum += a.accuracyPct;
      map.set(g.key, cur);
    }
    return Array.from(map.values())
      .map((row) => {
        const avgAccuracy = row.attempts > 0 ? Math.round(row.accSum / row.attempts) : 0;
        const masteryRatePct = row.completed > 0 ? Math.round((row.mastered / row.completed) * 100) : 0;
        const timeMin = Math.max(1, Math.round(row.timeSec / 60));
        return {
          key: row.key,
          label: row.label,
          sublabel: row.sublabel,
          attempts: row.attempts,
          completed: row.completed,
          mastered: row.mastered,
          timeMin,
          avgAccuracy,
          masteryRatePct,
          needsIntervention: row.completed > 0 && masteryRatePct < 65,
        };
      })
      .sort((a, b) => a.masteryRatePct - b.masteryRatePct);
  };

  const chapterTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    overview.blueprints.forEach((b) => m.set(b.id, `Class ${b.classLevel} · ${b.subject} — ${b.chapterTitle}`));
    return m;
  }, [overview.blueprints]);

  const analyticsRows = useMemo(() => {
    if (analyticsDim === 'class') {
      return buildAggregatedRows((a) => ({
        key: a.classSection || 'Unassigned',
        label: `Class ${a.classSection || 'Unassigned'}`,
      }));
    }
    if (analyticsDim === 'subject') {
      return buildAggregatedRows((a) => ({ key: a.subject, label: a.subject }));
    }
    if (analyticsDim === 'chapter') {
      return buildAggregatedRows((a) => ({
        key: a.chapterId,
        label: chapterTitleMap.get(a.chapterId) || a.chapterId,
        sublabel: a.subject,
      }));
    }
    if (analyticsDim === 'student') {
      return buildAggregatedRows((a) => ({
        key: a.studentId,
        label: a.studentName,
        sublabel: `Class ${a.classSection}`,
      }));
    }
    return buildAggregatedRows((a) => ({ key: a.subject, label: a.subject }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsDim, overview.attempts, chapterTitleMap]);

  const schoolKpis = useMemo(() => {
    const totalAttempts = overview.attempts.length;
    const completed = overview.attempts.filter((a) => a.status === 'completed');
    const mastered = completed.filter(isAttemptMastered);
    const totalMinutes = Math.round(
      overview.attempts.reduce((s, a) => s + a.timeSpentSec, 0) / 60,
    );
    const avgAbacusAcc =
      overview.abacusSessions.length > 0
        ? Math.round(
            overview.abacusSessions.reduce((s, x) => s + x.accuracyPct, 0) /
              overview.abacusSessions.length,
          )
        : 0;
    return {
      totalAttempts,
      completedCount: completed.length,
      masteredCount: mastered.length,
      masteryRatePct:
        completed.length > 0 ? Math.round((mastered.length / completed.length) * 100) : 0,
      totalMinutes,
      abacusSessionsCount: overview.abacusSessions.length,
      avgAbacusAcc,
    };
  }, [overview.attempts, overview.abacusSessions]);

  const handleTextbookFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      pushToast('Please upload a textbook PDF or text file under 5 MB.', 'error');
      return;
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const res = typeof reader.result === 'string' ? reader.result : '';
        const base64 = res.includes(',') ? res.split(',')[1] : res;
        setPdfBase64(base64);
        setPdfFileName(file.name);
        if (!anTitle.trim()) {
          setAnTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
        }
        pushToast(`Attached textbook PDF "${file.name}" for AI Chapter Analysis.`, 'info');
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        setAnContent(text.slice(0, 7500));
        setPdfBase64(null);
        setPdfFileName('');
        pushToast(`Loaded chapter text from "${file.name}".`, 'info');
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anTitle.trim() || (!pdfBase64 && anContent.trim().length < 20)) {
      pushToast(
        'Enter a chapter title and either attach a textbook PDF or paste at least 20 characters of notes.',
        'error',
      );
      return;
    }
    setAnalyzing(true);
    try {
      const res = await apiRequest<{ blueprint: ChapterLearningBlueprint }>(
        '/api/interactive-learning/blueprints/analyze',
        {
          method: 'POST',
          body: JSON.stringify({
            classLevel: anClass,
            subject: anSubject,
            chapterNumber: anChapNum,
            chapterTitle: anTitle,
            teachingLanguage: anLanguage,
            learningObjectives: anObjectives,
            textbookContent: anContent,
            pdfBase64: pdfBase64 || undefined,
          }),
        },
        token,
      );
      pushToast(
        `Blueprint generated for "${res.blueprint.chapterTitle}" (${res.blueprint.concepts.length} concepts · ${res.blueprint.approvalStatus}).`,
        'success',
      );
      setAnTitle('');
      setAnObjectives('');
      setAnContent('');
      setPdfBase64(null);
      setPdfFileName('');
      await onRefresh();
      setSelectedChapterId(res.blueprint.id);
      setSubView('coverage');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'AI chapter analysis failed.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateGame = async (
    e?: React.FormEvent,
    overrideParams?: {
      chapterId: string;
      conceptId: string;
      gameFormat?: GameFormatType;
      difficulty?: DifficultyBand;
      language?: string;
    },
  ) => {
    if (e) e.preventDefault();
    const targetBp = overrideParams
      ? overview.blueprints.find((b) => b.id === overrideParams.chapterId)
      : selectedGenBlueprint;
    if (!targetBp) return;
    const conceptId = overrideParams?.conceptId || genConceptId || targetBp.concepts[0]?.conceptId;
    if (!conceptId) return;

    setGeneratingGame(true);
    try {
      const res = await apiRequest<{ game: InteractiveGameAsset }>(
        '/api/interactive-learning/games/generate',
        {
          method: 'POST',
          body: JSON.stringify({
            chapterId: targetBp.id,
            conceptId,
            gameFormat: overrideParams?.gameFormat || genFormat || undefined,
            difficulty: overrideParams?.difficulty || genDifficulty,
            language: overrideParams?.language || targetBp.teachingLanguage,
          }),
        },
        token,
      );
      pushToast(
        `AI Game "${res.game.title}" created (${res.game.approvalStatus}). Approve it to publish & update Chapter Coverage Score.`,
        'success',
      );
      await onRefresh();
      setSubView('approval');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'AI game generation failed.', 'error');
    } finally {
      setGeneratingGame(false);
    }
  };

  const handleAssetApproval = async (
    kind: 'blueprint' | 'game' | 'experiential',
    id: string,
    approvalStatus: ApprovalStatus,
    extras?: Record<string, unknown>,
  ) => {
    setSavingId(id);
    try {
      await apiRequest(
        `/api/interactive-learning/assets/${kind}/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ approvalStatus, ...extras }),
        },
        token,
      );
      pushToast(`Asset updated to "${approvalStatus}". Chapter Coverage Score recalculated.`, 'success');
      setEditingGameId(null);
      setEditingConceptId(null);
      await onRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to update asset.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveConceptExplanation = async (blueprint: ChapterLearningBlueprint, conceptId: string) => {
    if (!conceptDraftText.trim()) return;
    await handleAssetApproval('blueprint', blueprint.id, blueprint.approvalStatus, {
      conceptExplanations: { [conceptId]: conceptDraftText.trim() },
    });
  };

  const handlePolicyToggle = async (patch: Partial<TeacherApprovalPolicyConfig>) => {
    setSavingPolicy(true);
    try {
      await apiRequest(
        '/api/interactive-learning/policy',
        {
          method: 'PATCH',
          body: JSON.stringify(patch),
        },
        token,
      );
      pushToast('School AI publishing policy updated.', 'success');
      await onRefresh();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to save policy.', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  const filteredGames = useMemo(
    () =>
      overview.games.filter(
        (g) => approvalFilter === 'ALL' || g.approvalStatus === approvalFilter,
      ),
    [overview.games, approvalFilter],
  );

  const filteredExperiential = useMemo(
    () =>
      overview.experientialAssets.filter(
        (e) => approvalFilter === 'ALL' || e.approvalStatus === approvalFilter,
      ),
    [overview.experientialAssets, approvalFilter],
  );

  return (
    <div className="space-y-5">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'coverage', label: 'Chapter Coverage Score', icon: Layers },
              { id: 'ai_analyzer', label: 'AI Chapter & Game Studio', icon: Sparkles },
              {
                id: 'approval',
                label: `Teacher Approval Queue (${pendingQueueCount})`,
                icon: ShieldCheck,
              },
              { id: 'analytics', label: 'Mastery vs Time Analytics', icon: BarChart3 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = subView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubView(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#142B46] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-slate-600 tabular-nums">
          School Interactive Conversion Average:{' '}
          <strong className="font-mono text-[#3D6349]">{schoolAvgCoverage}%</strong>
        </div>
      </div>

      {/* VIEW 1: CHAPTER COVERAGE SCORE + FULL BLUEPRINT CONCEPT INSPECTOR */}
      {subView === 'coverage' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Featured Chapter Coverage Score Card */}
            <div className="lg:col-span-5">
              {selectedCoverage ? (
                <div
                  data-testid="chapter-coverage-score-card"
                  className="rounded-2xl border border-[#223B5B] bg-[#0F1E31] text-white p-6 space-y-5"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D6B66D]">
                      Chapter Coverage Score
                    </p>
                    <h3 className="font-display text-xl font-bold text-white leading-snug">
                      Class {selectedCoverage.classLevel} – {selectedCoverage.subject} –{' '}
                      {selectedCoverage.chapterTitle}
                    </h3>
                  </div>

                  {/* Big % + Concept Coverage Indicator + Progress Bar */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-display text-4xl font-extrabold text-emerald-400 tabular-nums">
                        {selectedCoverage.overallCoveragePct}%
                      </span>
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Concept coverage
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${selectedCoverage.overallCoveragePct}%` }}
                      />
                    </div>
                  </div>

                  {/* 5-Row Component Breakdown Table matching Screenshot */}
                  <div className="border-t border-slate-700/80 pt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-2 border-b border-slate-800">
                      <span>Learning component</span>
                      <span>Coverage</span>
                    </div>
                    <div className="divide-y divide-slate-800/80 text-sm">
                      {[
                        { label: 'Concept explanations', pct: selectedCoverage.conceptExplanationsPct },
                        { label: 'Games', pct: selectedCoverage.gamesPct },
                        { label: 'Visual explanations', pct: selectedCoverage.visualExplanationsPct },
                        { label: 'Experiential activities', pct: selectedCoverage.experientialActivitiesPct },
                        { label: 'Assessments', pct: selectedCoverage.assessmentsPct },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-2.5">
                          <span className="text-slate-200">{row.label}</span>
                          <span className="font-mono font-semibold text-white tabular-nums">
                            {row.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                    Actual coverage calculated strictly from approved assets and eligible concepts (
                    {selectedCoverage.approvedConceptsCount}/{selectedCoverage.totalEligibleConcepts}{' '}
                    concepts approved).
                  </div>
                  {selectedCoverage.pendingReviewAssetsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSubView('approval')}
                      className="w-full rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25"
                    >
                      {selectedCoverage.pendingReviewAssetsCount} pending asset(s) awaiting teacher
                      approval — Review to increase coverage
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-xs text-slate-600">
                  Analyze a chapter to view its interactive Chapter Coverage Score.
                </div>
              )}
            </div>

            {/* Right: School-Wide Interactive Chapter Coverage Matrix */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-base font-bold text-[#142B46]">
                    School-Wide Chapter Conversion Matrix
                  </h4>
                  <p className="text-xs text-slate-600">
                    Select any chapter to inspect its approved coverage &amp; atomic concept blueprint below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubView('ai_analyzer')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1e3b5c] whitespace-nowrap shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D6B66D]" />
                  Convert New Chapter
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Class &amp; Chapter</th>
                      <th className="py-2 px-2 font-semibold text-right">Overall</th>
                      <th className="py-2 px-2 font-semibold text-right">Games</th>
                      <th className="py-2 px-2 font-semibold text-right">Labs</th>
                      <th className="py-2 pl-2 font-semibold text-right">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overview.coverageScores.map((cov) => {
                      const active = cov.chapterId === selectedCoverage?.chapterId;
                      return (
                        <tr
                          key={cov.chapterId}
                          onClick={() => {
                            setSelectedChapterId(cov.chapterId);
                            setEditingConceptId(null);
                          }}
                          className={`cursor-pointer transition-colors ${
                            active ? 'bg-[#FAF4EC]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 pr-3">
                            <p className="font-semibold text-[#142B46]">
                              Class {cov.classLevel} · {cov.subject}
                            </p>
                            <p className="text-[11px] text-slate-600">{cov.chapterTitle}</p>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-bold text-[#3D6349] tabular-nums">
                            {cov.overallCoveragePct}%
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-700 tabular-nums">
                            {cov.gamesPct}%
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-700 tabular-nums">
                            {cov.experientialActivitiesPct}%
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono tabular-nums">
                            {cov.pendingReviewAssetsCount > 0 ? (
                              <span className="font-bold text-amber-700">
                                {cov.pendingReviewAssetsCount}
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Selected Chapter Learning Blueprint — Atomic Concept Inspector & Inline Editor */}
          {selectedBlueprint && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#142B46]" />
                    <h4 className="font-display text-base font-bold text-[#142B46]">
                      Chapter Learning Blueprint · {selectedBlueprint.chapterTitle}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 max-w-3xl">{selectedBlueprint.overview}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <p className="font-semibold text-[#142B46]">
                    {selectedBlueprint.board} · Class {selectedBlueprint.classLevel} ·{' '}
                    {selectedBlueprint.teachingLanguage}
                  </p>
                  <p>
                    Status: <strong>{selectedBlueprint.approvalStatus}</strong> · v
                    {selectedBlueprint.version}
                  </p>
                </div>
              </div>

              {/* Concept-level Matrix with Inline Edit & 1-Click AI Game Fill */}
              <div className="space-y-3">
                {selectedBlueprint.concepts.map((c, idx) => {
                  const linkedGame = overview.games.find(
                    (g) => g.chapterId === selectedBlueprint.id && g.conceptId === c.conceptId,
                  );
                  const linkedSim = overview.experientialAssets.find(
                    (e) => e.chapterId === selectedBlueprint.id && e.conceptId === c.conceptId,
                  );
                  const isEditingThis = editingConceptId === c.conceptId;

                  return (
                    <div
                      key={c.conceptId}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-semibold text-slate-500">
                            Concept {idx + 1} · {c.difficulty}
                            {c.isDifficult ? ' · Difficult Concept (Priority Support)' : ''} ·
                            Recommended Game: {GAME_FORMAT_CATALOG[c.suggestedGameFormat]?.label}
                          </p>
                          <h5 className="font-display text-sm font-bold text-[#142B46]">
                            {c.title}
                          </h5>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingThis) {
                                setEditingConceptId(null);
                              } else {
                                setEditingConceptId(c.conceptId);
                                setConceptDraftText(c.explanation);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit Explanation
                          </button>

                          {linkedGame ? (
                            <button
                              type="button"
                              onClick={() => onPreviewGame(linkedGame)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 whitespace-nowrap shrink-0"
                            >
                              <Gamepad2 className="h-3 w-3" />
                              {linkedGame.approvalStatus === 'Approved'
                                ? 'Approved Game'
                                : `Game (${linkedGame.approvalStatus})`}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={generatingGame}
                              onClick={() =>
                                handleGenerateGame(undefined, {
                                  chapterId: selectedBlueprint.id,
                                  conceptId: c.conceptId,
                                  gameFormat: c.suggestedGameFormat,
                                  difficulty: c.difficulty,
                                  language: selectedBlueprint.teachingLanguage,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-[#142B46] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1e3b5c] disabled:opacity-50 whitespace-nowrap shrink-0"
                            >
                              <Sparkles className="h-3 w-3 text-[#D6B66D]" />
                              Generate Missing Game
                            </button>
                          )}

                          {linkedSim && onPreviewSim && (
                            <button
                              type="button"
                              onClick={() => onPreviewSim(linkedSim)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#3D6349] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#31523b] whitespace-nowrap shrink-0"
                            >
                              <FlaskConical className="h-3 w-3" />
                              Open Motion Lab
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditingThis ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={conceptDraftText}
                            onChange={(e) => setConceptDraftText(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingConceptId(null)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={savingId === selectedBlueprint.id}
                              onClick={() =>
                                handleSaveConceptExplanation(selectedBlueprint, c.conceptId)
                              }
                              className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Save Concept Explanation
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 leading-relaxed">{c.explanation}</p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                        {c.prerequisites.length > 0 && (
                          <span>
                            <strong className="text-slate-700">Prerequisites:</strong>{' '}
                            {c.prerequisites.join(', ')}
                          </span>
                        )}
                        {c.practicalApplications.length > 0 && (
                          <span>
                            <strong className="text-slate-700">Practical Link:</strong>{' '}
                            {c.practicalApplications[0]}
                          </span>
                        )}
                        <span>
                          <strong className="text-slate-700">Traceable Source:</strong>{' '}
                          {c.sourceReference}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MODULE A (AI CHAPTER INTELLIGENCE + PDF UPLOAD) & MODULE B (AI GAME GENERATOR) */}
      {subView === 'ai_analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* AI Chapter Analyzer Form */}
          <form
            onSubmit={handleAnalyzeChapter}
            className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div>
              <h4 className="font-display text-base font-bold text-[#142B46]">
                Module A · AI Chapter Intelligence Analyzer
              </h4>
              <p className="text-xs text-slate-600">
                Upload a textbook chapter PDF or paste chapter notes to extract topics, atomic
                concepts, prerequisites, difficult concepts, and recommended games &amp; simulations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Class</span>
                <select
                  value={anClass}
                  onChange={(e) => setAnClass(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                >
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Subject</span>
                <select
                  value={anSubject}
                  onChange={(e) => setAnSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Chapter #</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={anChapNum}
                  onChange={(e) => setAnChapNum(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700 space-y-1">
                <span>Language</span>
                <select
                  value={anLanguage}
                  onChange={(e) => setAnLanguage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bilingual (English + Hindi)">Bilingual</option>
                </select>
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Chapter Title</span>
              <input
                type="text"
                required
                value={anTitle}
                onChange={(e) => setAnTitle(e.target.value)}
                placeholder="e.g., Heat and Temperature / Fractions and Decimals / Our Environment"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Learning Objectives (Optional)</span>
              <input
                type="text"
                value={anObjectives}
                onChange={(e) => setAnObjectives(e.target.value)}
                placeholder="e.g., Distinguish conduction, convection, and radiation in daily life"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>

            {/* Textbook PDF / TXT Upload Dropzone */}
            <div className="rounded-xl border border-dashed border-slate-300 bg-[#FAF4EC]/60 p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <FileUp className="h-4 w-4 text-[#142B46] shrink-0" />
                <span>
                  {pdfFileName
                    ? `Attached PDF: ${pdfFileName}`
                    : 'Optional: Upload NCERT/HBSE Textbook Chapter PDF or .txt (max 5 MB)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {pdfFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setPdfBase64(null);
                      setPdfFileName('');
                    }}
                    className="text-[11px] font-semibold text-rose-700 hover:underline"
                  >
                    Remove PDF
                  </button>
                )}
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-slate-50">
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleTextbookFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Textbook Chapter Text / Key Notes {pdfBase64 ? '(Optional when PDF attached)' : ''}</span>
              <textarea
                rows={4}
                required={!pdfBase64}
                value={anContent}
                onChange={(e) => setAnContent(e.target.value)}
                placeholder="Paste chapter headings, definitions, diagrams, or NCERT/HBSE notes here..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </label>

            <button
              type="submit"
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-lg bg-[#142B46] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1e3b5c] disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#D6B66D]" />}
              {analyzing ? 'Analyzing Chapter with AI...' : 'Generate Chapter Learning Blueprint'}
            </button>
          </form>

          {/* AI Game Generator (All 20 Formats) */}
          <form
            onSubmit={handleGenerateGame}
            className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <div>
              <h4 className="font-display text-base font-bold text-[#142B46]">
                Module B · AI Concept Game Generator
              </h4>
              <p className="text-xs text-slate-600">
                Generate a playable game from any concept across all 20 pedagogical formats.
              </p>
            </div>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Target Chapter Blueprint</span>
              <select
                value={genBlueprintId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setGenBlueprintId(nextId);
                  const bp = overview.blueprints.find((b) => b.id === nextId);
                  setGenConceptId(bp?.concepts[0]?.conceptId || '');
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {overview.blueprints.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    Class {bp.classLevel} · {bp.subject} · {bp.chapterTitle}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Concept to Gamify</span>
              <select
                value={genConceptId}
                onChange={(e) => setGenConceptId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                {(selectedGenBlueprint?.concepts || []).map((c) => (
                  <option key={c.conceptId} value={c.conceptId}>
                    {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Game Format (Auto-Select or Choose from 20)</span>
              <select
                value={genFormat}
                onChange={(e) => setGenFormat(e.target.value as GameFormatType | '')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="">AI Pedagogical Auto-Selection</option>
                {ALL_20_GAME_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {GAME_FORMAT_CATALOG[fmt].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700 space-y-1">
              <span>Difficulty Band</span>
              <select
                value={genDifficulty}
                onChange={(e) => setGenDifficulty(e.target.value as DifficultyBand)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option value="Foundation">Foundation</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={generatingGame || !selectedGenBlueprint}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#3D6349] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#31523b] disabled:opacity-50"
            >
              {generatingGame ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gamepad2 className="h-4 w-4" />}
              {generatingGame ? 'Generating Interactive Game...' : 'Generate Playable Game Asset'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW 3: MODULE G — TEACHER CONTENT MANAGEMENT & APPROVAL DASHBOARD */}
      {subView === 'approval' && (
        <div className="space-y-4">
          {/* School Publishing Governance Policy Bar */}
          <div className="rounded-xl border border-slate-200 bg-[#FAF4EC] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#142B46]">
                School AI Publishing Governance Policy
              </p>
              <p className="text-[11px] text-slate-600">
                Unapproved assets never count toward the official Chapter Coverage Score.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="inline-flex items-center gap-2 font-medium text-slate-800">
                <input
                  type="checkbox"
                  disabled={!canConfigurePolicy || savingPolicy}
                  checked={overview.approvalPolicy.requireTeacherApprovalForAi}
                  onChange={(e) =>
                    handlePolicyToggle({ requireTeacherApprovalForAi: e.target.checked })
                  }
                  className="accent-[#142B46]"
                />
                Require Teacher Approval for AI Content
              </label>
              <label className="inline-flex items-center gap-2 font-medium text-slate-800">
                <input
                  type="checkbox"
                  disabled={!canConfigurePolicy || savingPolicy}
                  checked={overview.approvalPolicy.allowStudentsPracticeDrafts}
                  onChange={(e) =>
                    handlePolicyToggle({ allowStudentsPracticeDrafts: e.target.checked })
                  }
                  className="accent-[#142B46]"
                />
                Allow Students to Practice Drafts
              </label>
            </div>
          </div>

          {/* Filter Strip */}
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'Pending Review', 'Approved', 'Draft', 'Rejected'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setApprovalFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  approvalFilter === st
                    ? 'bg-[#142B46] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Blueprints Review */}
          {overview.blueprints
            .filter((b) => approvalFilter === 'ALL' || b.approvalStatus === approvalFilter)
            .filter((b) => b.approvalStatus !== 'Approved' || approvalFilter === 'Approved')
            .map((bp) => (
              <div
                key={bp.id}
                className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    Chapter Blueprint · {bp.approvalStatus} · v{bp.version}
                  </p>
                  <p className="font-display text-sm font-bold text-[#142B46]">
                    Class {bp.classLevel} {bp.subject} — {bp.chapterTitle}
                  </p>
                  <p className="text-xs text-slate-600">
                    {bp.concepts.length} extracted concepts · Created by {bp.createdBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={savingId === bp.id}
                    onClick={() => handleAssetApproval('blueprint', bp.id, 'Approved')}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#3D6349] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Blueprint
                  </button>
                  <button
                    type="button"
                    disabled={savingId === bp.id}
                    onClick={() => handleAssetApproval('blueprint', bp.id, 'Rejected')}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}

          {/* Interactive Game Assets Review List */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Interactive Games ({filteredGames.length})
            </h5>
            {filteredGames.map((g) => {
              const isEditing = editingGameId === g.id;
              return (
                <div
                  key={g.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-slate-500">
                        Class {g.classLevel} · {g.subject} · {g.chapterTitle} ·{' '}
                        {GAME_FORMAT_CATALOG[g.gameFormat]?.label || g.gameFormat} · v{g.version}
                      </p>
                      <h5 className="font-display text-sm font-bold text-[#142B46]">{g.title}</h5>
                      <p className="text-xs text-slate-600">{g.instructions}</p>
                      {(g.assignedClassSections?.length || g.assignedDeadline) && (
                        <p className="text-[11px] text-[#3D6349] font-medium">
                          {g.assignedClassSections?.length
                            ? `Assigned to: ${g.assignedClassSections.join(', ')}`
                            : ''}
                          {g.assignedDeadline ? ` · Due: ${g.assignedDeadline}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          g.approvalStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : g.approvalStatus === 'Pending Review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {g.approvalStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() => onPreviewGame(g)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGameId(isEditing ? null : g.id);
                          setEditTitle(g.title);
                          setEditInstructions(g.instructions);
                          setEditDifficulty(g.difficulty);
                          setEditDeadline(g.assignedDeadline || '');
                          setEditClassSections((g.assignedClassSections || []).join(', '));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit &amp; Assign
                      </button>
                      {g.approvalStatus !== 'Approved' && (
                        <button
                          type="button"
                          disabled={savingId === g.id}
                          onClick={() => handleAssetApproval('game', g.id, 'Approved')}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#3D6349] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b]"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve &amp; Publish
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Game title"
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <select
                          value={editDifficulty}
                          onChange={(e) => setEditDifficulty(e.target.value as DifficultyBand)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="Foundation">Foundation</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <input
                          type="text"
                          value={editClassSections}
                          onChange={(e) => setEditClassSections(e.target.value)}
                          placeholder="Assign classes (e.g. 7-A, 7-B)"
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={editInstructions}
                        onChange={(e) => setEditInstructions(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingGameId(null)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingId === g.id}
                          onClick={() =>
                            handleAssetApproval('game', g.id, g.approvalStatus, {
                              title: editTitle,
                              instructions: editInstructions,
                              difficulty: editDifficulty,
                              assignedDeadline: editDeadline,
                              assignedClassSections: editClassSections
                                .split(',')
                                .map((x) => x.trim())
                                .filter(Boolean),
                            })
                          }
                          className="rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Save Edits &amp; Assignment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Experiential Simulation Assets Review List */}
          {filteredExperiential.length > 0 && (
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Experiential Virtual Labs &amp; Motion Graphics ({filteredExperiential.length})
              </h5>
              {filteredExperiential.map((sim) => (
                <div
                  key={sim.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Class {sim.classLevel} · {sim.subject} · {sim.chapterTitle} · {sim.stages.length}{' '}
                      stages · v{sim.version}
                    </p>
                    <p className="font-display text-sm font-bold text-[#142B46]">{sim.title}</p>
                    <p className="text-xs text-slate-600">{sim.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        sim.approvalStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {sim.approvalStatus}
                    </span>
                    {onPreviewSim && (
                      <button
                        type="button"
                        onClick={() => onPreviewSim(sim)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Preview Lab
                      </button>
                    )}
                    {sim.approvalStatus !== 'Approved' && (
                      <button
                        type="button"
                        disabled={savingId === sim.id}
                        onClick={() => handleAssetApproval('experiential', sim.id, 'Approved')}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#3D6349] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#31523b]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve Lab
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: MODULE I — 5-LEVEL ANALYTICS (SCHOOL / CLASS / SUBJECT / CHAPTER / STUDENT) */}
      {subView === 'analytics' && (
        <div className="space-y-4">
          {/* School Summary KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Active Study Time
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#142B46] tabular-nums">
                {schoolKpis.totalMinutes} min
              </p>
              <p className="text-xs text-slate-600 tabular-nums">
                {schoolKpis.completedCount} / {schoolKpis.totalAttempts} activities finished
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Verified Concept Mastery
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#3D6349] tabular-nums">
                {schoolKpis.masteryRatePct}%
              </p>
              <p className="text-xs text-slate-600 tabular-nums">
                {schoolKpis.masteredCount} completions &ge; 75% accuracy
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Interactive Conversion Avg
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#142B46] tabular-nums">
                {schoolAvgCoverage}%
              </p>
              <p className="text-xs text-slate-600 tabular-nums">
                Across {overview.coverageScores.length} chapters
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Abacus Mental Maths
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-amber-700 tabular-nums">
                {schoolKpis.avgAbacusAcc > 0 ? `${schoolKpis.avgAbacusAcc}%` : '—'}
              </p>
              <p className="text-xs text-slate-600 tabular-nums">
                {schoolKpis.abacusSessionsCount} Soroban sessions logged
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-bold text-[#142B46]">
                  Time Spent &amp; Completion vs. Verified Concept Mastery (&ge; 75% Accuracy)
                </h4>
                <p className="text-xs text-slate-600">
                  Explicitly separates passive screen time from verified conceptual understanding across
                  all 5 institutional analytics levels.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'school', label: 'School (By Subject)' },
                    { id: 'class', label: 'By Class' },
                    { id: 'subject', label: 'By Subject' },
                    { id: 'chapter', label: 'By Chapter' },
                    { id: 'student', label: 'By Student' },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setAnalyticsDim(d.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      analyticsDim === d.id
                        ? 'bg-[#142B46] text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {analyticsRows.length === 0 ? (
              <p className="text-xs text-slate-500">
                No student attempts recorded yet in this scope.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-3 font-semibold">
                        {analyticsDim === 'student'
                          ? 'Student'
                          : analyticsDim === 'chapter'
                            ? 'Chapter'
                            : analyticsDim === 'class'
                              ? 'Class Section'
                              : 'Subject'}
                      </th>
                      <th className="py-2 px-2 font-semibold text-right">Screen Time</th>
                      <th className="py-2 px-2 font-semibold text-right">Completed</th>
                      <th className="py-2 px-2 font-semibold text-right">Verified Mastered</th>
                      <th className="py-2 px-2 font-semibold text-right">Mastery Rate</th>
                      <th className="py-2 pl-2 font-semibold text-right">Avg Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    {analyticsRows.map((row) => (
                      <tr key={row.key}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#142B46]">{row.label}</span>
                            {row.needsIntervention && (
                              <span
                                title="Completed activities without reaching 75% mastery threshold — recommend guided re-teaching"
                                className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                Needs Re-Teaching
                              </span>
                            )}
                          </div>
                          {row.sublabel && (
                            <p className="text-[11px] text-slate-500">{row.sublabel}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                          {row.timeMin} min
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                          {row.completed} / {row.attempts}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-[#3D6349]">
                          {row.mastered}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-[#142B46]">
                          {row.masteryRatePct}%
                        </td>
                        <td className="py-2.5 pl-2 text-right font-mono text-slate-700">
                          {row.avgAccuracy}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
