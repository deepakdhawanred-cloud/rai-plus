import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Crown,
  Dices,
  Layers,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type {
  AcademicResource,
  BoardType,
  ChapterMasteryLeaderboardEntry,
  ProductionRegisterRow,
  SchoolClassNumber,
  UserRole,
} from '../types';
import { apiRequest } from '../utils/api';
import { extractClassNumFromLabel } from '../utils/chapterVisualStudyEngine';
import {
  QUICK_GAME_TYPE_META,
  QUICK_REVISE_CLASSES,
  getChapterQuestsForClass,
  getGamesForClass,
  getSubjectColor,
  getSubjectsForQuickReviseClass,
  type ChapterQuestBundle,
  type QuickGameType,
  type QuickRevisionGame,
} from '../data/quickRevisionGamesCatalog';
import {
  launchQuickReviseConfetti,
  playQuickReviseSfx,
} from '../utils/quickReviseAudio';
import {
  QuickReviseGameStage,
  type EngineCallbacks,
  type EngineConceptModal,
} from './quickRevise/QuickReviseEngines';
import { emitRevisionStreakUpdated } from '../utils/revisionStreakReminderEngine';
import { pushToast } from './ToastProvider';

const QUICK_REVISE_V2_STUDIO_PATH = '/assets/games/quick-revision-studio.html';

type StudioClassCode = -2 | -1 | 0 | SchoolClassNumber;

const STUDIO_CLASS_OPTIONS: Array<{
  code: StudioClassCode;
  label: string;
  queryValue: string;
}> = [
  { code: -2, label: 'Nursery', queryValue: 'nursery' },
  { code: -1, label: 'LKG', queryValue: 'lkg' },
  { code: 0, label: 'UKG', queryValue: 'ukg' },
  ...([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as SchoolClassNumber[]).map((n) => ({
    code: n as StudioClassCode,
    label: `Class ${n}`,
    queryValue: String(n),
  })),
];

function formatStudioClassLabel(code: StudioClassCode): string {
  if (code === -2) return 'Nursery';
  if (code === -1) return 'LKG';
  if (code === 0) return 'UKG';
  return `Class ${code}`;
}

function extractStudioClassFromLabel(label?: string): StudioClassCode {
  if (!label) return 6;
  const lower = label.toLowerCase();
  if (lower.includes('nursery') || lower.includes('play')) return -2;
  if (lower.includes('lkg') || lower.includes('kg1') || lower.includes('kg-1') || lower.includes('lower kg')) return -1;
  if (lower.includes('ukg') || lower.includes('kg2') || lower.includes('kg-2') || lower.includes('upper kg') || /\bkg\b/.test(lower)) return 0;
  return extractClassNumFromLabel(label) || 6;
}

const STUDIO_SUBJECTS = [
  'EVS',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Maths',
  'Accountancy',
  'Business Studies',
  'Economics',
  'History',
  'Political Science',
  'Geography',
  'Social Science',
  'Hindi',
  'Sanskrit',
  'English',
];

interface EmbeddedGameCompleteMessage {
  source: 'vis-quick-revision';
  type: 'game-complete';
  gameId: string;
  cls: number;
  subject: string;
  chapterNo?: string | number;
  chapter: string;
  gameType: string;
  title: string;
  accuracy: number;
  stars: number;
  xp: number;
  hits: number;
  misses: number;
  bestCombo: number;
  timeSec: number;
}

interface ChapterStudyGameWorkspaceProps {
  board: BoardType;
  userId: string;
  userRole: UserRole;
  token?: string;
  studentName?: string;
  defaultClassLabel?: string;
  subjectSpecialty?: string;
  registerRows: ProductionRegisterRow[];
  schoolResources: AcademicResource[];
}

interface QuickReviseProgress {
  stars: Record<string, number>;
  xp: number;
  streak: number;
  lastDay: string;
  mute: boolean;
  cls: SchoolClassNumber;
}

interface ActivePlaySession {
  mode: 'topic' | 'chapter';
  chapterTitle?: string;
  queue: QuickRevisionGame[];
  queueIndex: number;
  runNonce: number;
}

interface SessionStats {
  hits: number;
  misses: number;
  combo: number;
  bestCombo: number;
  pts: number;
  startedAt: number;
}

interface VictorySummary {
  mode: 'topic' | 'chapter';
  title: string;
  subtitle: string;
  stars: 1 | 2 | 3;
  accuracyPct: number;
  xpEarned: number;
  bestCombo: number;
  ideas: Array<[string, string]>;
  syncNotice?: string;
}

type BrowseMode = 'chapters' | 'topics';
type HubView = 'play' | 'leaderboard';
type GameLibraryMode = 'studio_full' | 'foundation_1_5';

function storageKeyForUser(userId: string): string {
  return `raiplus_quick_revise_v2_${userId}`;
}

function loadProgress(userId: string, fallbackClass: SchoolClassNumber): QuickReviseProgress {
  const base: QuickReviseProgress = {
    stars: {},
    xp: 0,
    streak: 0,
    lastDay: '',
    mute: false,
    cls: fallbackClass,
  };
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<QuickReviseProgress>;
    return {
      ...base,
      ...parsed,
      stars: parsed.stars && typeof parsed.stars === 'object' ? parsed.stars : {},
    };
  } catch {
    return base;
  }
}

function renderStars(count: number): React.ReactNode {
  return (
    <span className="inline-flex items-center gap-0.5 text-base leading-none" aria-label={`${count} of 3 stars`}>
      {[1, 2, 3].map((k) => (
        <span key={k} className={k <= count ? 'text-amber-400' : 'text-slate-200'}>
          ★
        </span>
      ))}
    </span>
  );
}

export const ChapterStudyGameWorkspace: React.FC<ChapterStudyGameWorkspaceProps> = ({
  board,
  userId,
  userRole,
  token,
  studentName,
  defaultClassLabel,
  subjectSpecialty,
  registerRows,
  schoolResources,
}) => {
  void registerRows;
  void schoolResources;

  const isClassLocked = userRole === 'student' || userRole === 'parent';
  const enrolledStudioClass: StudioClassCode = extractStudioClassFromLabel(defaultClassLabel);
  const enrolledClass: SchoolClassNumber =
    enrolledStudioClass >= 1 ? (enrolledStudioClass as SchoolClassNumber) : 1;

  const [progress, setProgress] = useState<QuickReviseProgress>(() =>
    loadProgress(userId, enrolledClass),
  );
  const [selectedClass, setSelectedClass] = useState<SchoolClassNumber>(
    isClassLocked ? enrolledClass : progress.cls || enrolledClass,
  );
  const [selectedStudioClass, setSelectedStudioClass] = useState<StudioClassCode>(
    isClassLocked ? enrolledStudioClass : (progress.cls || enrolledStudioClass),
  );
  const effectiveClass: SchoolClassNumber = isClassLocked ? enrolledClass : selectedClass;
  const effectiveStudioClass: StudioClassCode = isClassLocked
    ? enrolledStudioClass
    : selectedStudioClass;

  const [hubView, setHubView] = useState<HubView>('play');
  const [libraryMode, setLibraryMode] = useState<GameLibraryMode>('studio_full');
  const [studioExpanded, setStudioExpanded] = useState<boolean>(false);
  const [studioReloadNonce, setStudioReloadNonce] = useState<number>(0);
  const [lastSyncedNotice, setLastSyncedNotice] = useState<string | null>(null);
  const [browseMode, setBrowseMode] = useState<BrowseMode>('chapters');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | QuickGameType>('All');

  // Active gameplay state
  const [activeSession, setActiveSession] = useState<ActivePlaySession | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    hits: 0,
    misses: 0,
    combo: 0,
    bestCombo: 0,
    pts: 0,
    startedAt: Date.now(),
  });
  const statsRef = useRef<SessionStats>(stats);
  statsRef.current = stats;

  const [stageProgressPct, setStageProgressPct] = useState<number>(0);
  const [toast, setToast] = useState<{ text: string; kind: 'neutral' | 'ok' | 'bad' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [conceptModal, setConceptModal] = useState<EngineConceptModal | null>(null);
  const [victory, setVictory] = useState<VictorySummary | null>(null);

  // Leaderboard state (synced with /api/chapter-mastery/leaderboard)
  const [leaderboardRows, setLeaderboardRows] = useState<ChapterMasteryLeaderboardEntry[]>([]);
  const [leaderboardClasses, setLeaderboardClasses] = useState<string[]>([]);
  const [lbClassFilter, setLbClassFilter] = useState<string>('ALL');
  const [lbSubjectFilter, setLbSubjectFilter] = useState<string>('ALL');
  const [lbLoading, setLbLoading] = useState<boolean>(false);

  // Persist progress updates
  const persistProgress = useCallback(
    (updater: (prev: QuickReviseProgress) => QuickReviseProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        try {
          localStorage.setItem(storageKeyForUser(userId), JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });
    },
    [userId],
  );

  // Initialize subject filter from teacher specialty if relevant
  useEffect(() => {
    const subs = getSubjectsForQuickReviseClass(effectiveClass);
    if (subjectSpecialty && selectedSubject === 'All') {
      const matched = subs.find((s) => s.toLowerCase().includes(subjectSpecialty.toLowerCase()));
      if (matched) {
        setSelectedSubject(matched);
        return;
      }
    }
    if (selectedSubject !== 'All' && !subs.includes(selectedSubject)) {
      setSelectedSubject('All');
    }
  }, [effectiveClass, subjectSpecialty]);

  const classGames = useMemo(() => getGamesForClass(effectiveClass), [effectiveClass]);
  const classSubjects = useMemo(
    () => ['All', ...getSubjectsForQuickReviseClass(effectiveClass)],
    [effectiveClass],
  );

  const chapterBundles = useMemo(
    () => getChapterQuestsForClass(effectiveClass, selectedSubject),
    [effectiveClass, selectedSubject],
  );

  const filteredTopicGames = useMemo(
    () =>
      classGames.filter(
        (g) =>
          (selectedSubject === 'All' || g.subject === selectedSubject) &&
          (selectedTypeFilter === 'All' || g.type === selectedTypeFilter),
      ),
    [classGames, selectedSubject, selectedTypeFilter],
  );

  const classStarsEarned = useMemo(
    () => classGames.reduce((sum, g) => sum + (progress.stars[g.id] || 0), 0),
    [classGames, progress.stars],
  );
  const classStarsMax = classGames.length * 3;
  const classProgressPct = classStarsMax > 0 ? Math.round((classStarsEarned / classStarsMax) * 100) : 0;

  const loadLeaderboard = useCallback(
    async (classArg = lbClassFilter, subjectArg = lbSubjectFilter) => {
      if (!token) return;
      setLbLoading(true);
      try {
        const qs = new URLSearchParams({ classFilter: classArg, subjectFilter: subjectArg });
        const res = await apiRequest<{
          leaderboard: ChapterMasteryLeaderboardEntry[];
          availableClasses: string[];
        }>(`/api/chapter-mastery/leaderboard?${qs.toString()}`, { method: 'GET' }, token);
        setLeaderboardRows(res.leaderboard || []);
        setLeaderboardClasses(res.availableClasses || []);
      } catch {
        // Keep current leaderboard if offline
      } finally {
        setLbLoading(false);
      }
    },
    [token, lbClassFilter, lbSubjectFilter],
  );

  useEffect(() => {
    if (hubView === 'leaderboard') {
      void loadLeaderboard(lbClassFilter, lbSubjectFilter);
    }
  }, [hubView, lbClassFilter, lbSubjectFilter, loadLeaderboard]);

  // Listen to same-origin postMessage events from the embedded Quick Revise v2 HTML studio
  useEffect(() => {
    const handleStudioMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as Partial<EmbeddedGameCompleteMessage> | null;
      if (
        !payload ||
        typeof payload !== 'object' ||
        payload.source !== 'vis-quick-revision' ||
        payload.type !== 'game-complete'
      ) {
        return;
      }

      const gameId = typeof payload.gameId === 'string' ? payload.gameId.slice(0, 120) : 'qr-v2-game';
      const rawCls = Number(payload.cls);
      const clsCode: StudioClassCode =
        Number.isFinite(rawCls) && rawCls >= -2 && rawCls <= 12
          ? (Math.round(rawCls) as StudioClassCode)
          : effectiveStudioClass;
      const clsDisplayLabel = formatStudioClassLabel(clsCode);
      const apiClassNumber: SchoolClassNumber =
        clsCode >= 1 ? (clsCode as SchoolClassNumber) : 1;
      const subjectLabel =
        typeof payload.subject === 'string' && payload.subject.trim()
          ? payload.subject.trim().slice(0, 60)
          : 'Science';
      const chapterLabel =
        typeof payload.chapter === 'string' && payload.chapter.trim()
          ? payload.chapter.trim().slice(0, 120)
          : 'Chapter Revision';
      const titleLabel =
        typeof payload.title === 'string' && payload.title.trim()
          ? payload.title.trim().slice(0, 120)
          : 'Quick Revise Game';
      const accuracyPct = Math.min(100, Math.max(0, Math.round(Number(payload.accuracy) || 0)));
      const stars = Math.min(3, Math.max(1, Math.round(Number(payload.stars) || 1))) as 1 | 2 | 3;
      const xpEarned = Math.min(2000, Math.max(10, Math.round(Number(payload.xp) || accuracyPct)));
      const bestCombo = Math.max(0, Math.round(Number(payload.bestCombo) || 0));
      const missesCount = Math.max(0, Math.round(Number(payload.misses) || 0));
      const timeSec = Math.max(1, Math.round(Number(payload.timeSec) || 1));

      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      persistProgress((prev) => {
        const nextStreak =
          prev.lastDay === today
            ? prev.streak || 1
            : prev.lastDay === yesterday
              ? (prev.streak || 0) + 1
              : 1;
        return {
          ...prev,
          stars: {
            ...prev.stars,
            [gameId]: Math.max(prev.stars[gameId] || 0, stars),
          },
          xp: (prev.xp || 0) + xpEarned,
          streak: nextStreak,
          lastDay: today,
        };
      });
      emitRevisionStreakUpdated();

      const starIcons = '★'.repeat(stars);
      setLastSyncedNotice(
        `${starIcons} ${titleLabel} (${subjectLabel} · ${clsDisplayLabel}) — ${accuracyPct}% accuracy · +${xpEarned} XP synced`,
      );
      pushToast(
        `${starIcons} Completed "${titleLabel}" (${subjectLabel}, ${clsDisplayLabel}) — ${accuracyPct}% accuracy · +${xpEarned} XP`,
        'success',
      );

      if (token) {
        void apiRequest<{ leaderboard?: ChapterMasteryLeaderboardEntry[] }>(
          '/api/chapter-mastery/attempt',
          {
            method: 'POST',
            body: JSON.stringify({
              studentName: studentName || undefined,
              classSection: defaultClassLabel || (clsCode >= 1 ? `${clsCode}-A` : clsDisplayLabel),
              classNumber: apiClassNumber,
              subject: subjectLabel,
              chapterId: gameId,
              chapterTitle: `${chapterLabel}: ${titleLabel}`,
              xpEarned,
              masteryPct: accuracyPct,
              accuracyPct,
              stars,
              bestStreak: bestCombo,
              timedMode: payload.gameType === 'timed-sort',
              timeUsedSec: timeSec,
              timeLimitSec: 0,
              mistakesCount: missesCount,
              mistakesRecovered: 0,
              badgesEarned: stars === 3 ? ['quick-revise-3star'] : [],
            }),
          },
          token,
        )
          .then((res) => {
            if (Array.isArray(res.leaderboard)) {
              setLeaderboardRows(res.leaderboard);
              const myRow = res.leaderboard.find((r) => r.isCurrentUser);
              if (myRow) {
                setLastSyncedNotice(
                  `${starIcons} ${titleLabel} synced · School Rank #${myRow.rank} (${myRow.totalXp.toLocaleString()} XP)`,
                );
              }
            }
          })
          .catch(() => {
            // Local progress & streak already saved cleanly
          });
      }
    };

    window.addEventListener('message', handleStudioMessage);
    return () => window.removeEventListener('message', handleStudioMessage);
  }, [defaultClassLabel, effectiveStudioClass, persistProgress, studentName, token]);

  const studioClassOption = useMemo(
    () =>
      STUDIO_CLASS_OPTIONS.find((opt) => opt.code === effectiveStudioClass) ||
      STUDIO_CLASS_OPTIONS.find((opt) => opt.code === 6)!,
    [effectiveStudioClass],
  );

  const studioMatchedSubject = useMemo(() => {
    if (!subjectSpecialty) return '';
    const lower = subjectSpecialty.toLowerCase();
    return (
      STUDIO_SUBJECTS.find(
        (s) => s.toLowerCase() === lower || lower.includes(s.toLowerCase()) || s.toLowerCase().includes(lower),
      ) || ''
    );
  }, [subjectSpecialty]);

  const studioIframeSrc = useMemo(() => {
    const params = new URLSearchParams({ class: studioClassOption.queryValue });
    if (studioMatchedSubject && !isClassLocked) {
      params.set('subject', studioMatchedSubject);
    }
    if (studioReloadNonce > 0) {
      params.set('r', String(studioReloadNonce));
    }
    return `${QUICK_REVISE_V2_STUDIO_PATH}?${params.toString()}`;
  }, [isClassLocked, studioClassOption.queryValue, studioMatchedSubject, studioReloadNonce]);

  const showToast = useCallback((text: string, kind: 'neutral' | 'ok' | 'bad' = 'neutral') => {
    setToast({ text, kind });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const resetSessionStats = () => {
    const fresh: SessionStats = {
      hits: 0,
      misses: 0,
      combo: 0,
      bestCombo: 0,
      pts: 0,
      startedAt: Date.now(),
    };
    setStats(fresh);
    statsRef.current = fresh;
    setStageProgressPct(0);
    setConceptModal(null);
    setVictory(null);
    setToast(null);
  };

  const startSingleGame = (game: QuickRevisionGame) => {
    resetSessionStats();
    setHubView('play');
    setActiveSession({
      mode: 'topic',
      queue: [game],
      queueIndex: 0,
      runNonce: Date.now(),
    });
  };

  const startChapterQuest = (bundle: ChapterQuestBundle) => {
    if (bundle.games.length === 0) return;
    resetSessionStats();
    setHubView('play');
    setActiveSession({
      mode: 'chapter',
      chapterTitle: bundle.chapter,
      queue: bundle.games,
      queueIndex: 0,
      runNonce: Date.now(),
    });
  };

  const startSurpriseGame = () => {
    if (classGames.length === 0) return;
    const unmastered = classGames.filter((g) => (progress.stars[g.id] || 0) < 3);
    const pool = unmastered.length > 0 ? unmastered : classGames;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    startSingleGame(picked);
  };

  const activeGame = activeSession ? activeSession.queue[activeSession.queueIndex] : null;

  const finalizeSession = useCallback(
    (session: ActivePlaySession) => {
      const currentStats = statsRef.current;
      const total = currentStats.hits + currentStats.misses;
      const acc = total > 0 ? currentStats.hits / total : 1;
      const accuracyPct = Math.round(acc * 100);
      const stars: 1 | 2 | 3 = accuracyPct >= 90 ? 3 : accuracyPct >= 70 ? 2 : 1;
      const gameCountBonus = session.mode === 'chapter' && session.queue.length > 1 ? 25 * session.queue.length : 0;
      const xpEarned = accuracyPct + stars * 10 + currentStats.bestCombo * 2 + gameCountBonus;
      const timeSec = Math.max(1, Math.round((Date.now() - currentStats.startedAt) / 1000));

      // Save stars for every game completed in this session + update streak & XP
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      persistProgress((prev) => {
        const nextStars = { ...prev.stars };
        session.queue.forEach((gm) => {
          nextStars[gm.id] = Math.max(nextStars[gm.id] || 0, stars);
        });
        const nextStreak =
          prev.lastDay === today
            ? prev.streak || 1
            : prev.lastDay === yesterday
              ? (prev.streak || 0) + 1
              : 1;
        return {
          ...prev,
          stars: nextStars,
          xp: (prev.xp || 0) + xpEarned,
          streak: nextStreak,
          lastDay: today,
        };
      });
      emitRevisionStreakUpdated();

      playQuickReviseSfx('win', progress.mute);
      if (stars >= 2) {
        launchQuickReviseConfetti(stars === 3 ? 95 : 50);
      }

      // Collect consolidated Remember ideas
      const seen = new Set<string>();
      const consolidatedIdeas: Array<[string, string]> = [];
      session.queue.forEach((gm) => {
        gm.ideas.forEach(([ic, txt]) => {
          if (!seen.has(txt)) {
            seen.add(txt);
            consolidatedIdeas.push([ic, txt]);
          }
        });
      });

      const primary = session.queue[0];
      const summary: VictorySummary = {
        mode: session.mode,
        title:
          session.mode === 'chapter' && session.queue.length > 1
            ? `Full Chapter Revised!`
            : stars === 3
              ? 'Superstar!'
              : stars === 2
                ? 'Great job!'
                : 'Nice try!',
        subtitle:
          session.mode === 'chapter'
            ? `Class ${primary.cls} · ${primary.subject} · ${primary.chapter}`
            : `${primary.title} · ${primary.chapter}`,
        stars,
        accuracyPct,
        xpEarned,
        bestCombo: currentStats.bestCombo,
        ideas: consolidatedIdeas.slice(0, 8),
      };
      setVictory(summary);
      setStageProgressPct(100);

      // Sync completed revision session to school leaderboard API
      if (token) {
        void apiRequest<{ leaderboard?: ChapterMasteryLeaderboardEntry[] }>(
          '/api/chapter-mastery/attempt',
          {
            method: 'POST',
            body: JSON.stringify({
              studentName: studentName || undefined,
              classSection: defaultClassLabel || `${primary.cls}-A`,
              classNumber: primary.cls,
              subject: primary.subject,
              chapterId:
                session.mode === 'chapter'
                  ? `qr-ch-${primary.cls}-${primary.subject}-${primary.chapter}`
                  : primary.id,
              chapterTitle:
                session.mode === 'chapter'
                  ? `${primary.chapter} (Full Chapter)`
                  : `${primary.chapter}: ${primary.title}`,
              xpEarned,
              masteryPct: accuracyPct,
              accuracyPct,
              stars,
              bestStreak: currentStats.bestCombo,
              timedMode: false,
              timeUsedSec: timeSec,
              timeLimitSec: 0,
              mistakesCount: Math.round(currentStats.misses),
              mistakesRecovered: 0,
              badgesEarned: stars === 3 ? ['quick-revise-3star'] : [],
            }),
          },
          token,
        )
          .then((res) => {
            if (Array.isArray(res.leaderboard)) {
              setLeaderboardRows(res.leaderboard);
              const myRow = res.leaderboard.find((r) => r.isCurrentUser);
              if (myRow) {
                setVictory((prev) =>
                  prev
                    ? {
                        ...prev,
                        syncNotice: `School Leaderboard updated — Ranked #${myRow.rank} (${myRow.totalXp.toLocaleString()} XP)`,
                      }
                    : prev,
                );
              }
            }
          })
          .catch(() => {
            // Local progress already saved cleanly
          });
      }
    },
    [defaultClassLabel, persistProgress, progress.mute, studentName, token],
  );

  const handleEngineComplete = useCallback(() => {
    if (!activeSession) return;
    const currentGame = activeSession.queue[activeSession.queueIndex];

    // If revising an entire chapter and more games remain in the chapter queue
    if (activeSession.queueIndex + 1 < activeSession.queue.length) {
      // Save star credit for the game just completed
      persistProgress((prev) => ({
        ...prev,
        stars: {
          ...prev.stars,
          [currentGame.id]: Math.max(prev.stars[currentGame.id] || 0, 2),
        },
      }));
      const nextGame = activeSession.queue[activeSession.queueIndex + 1];
      setConceptModal({
        icon: nextGame.icon,
        title: `Topic ${activeSession.queueIndex + 1} Done! Up Next: ${nextGame.title}`,
        text: `${QUICK_GAME_TYPE_META[nextGame.type].name} — ${nextGame.topicLabel}`,
        btnLabel: `Continue Chapter (${activeSession.queueIndex + 2}/${activeSession.queue.length}) ▶`,
        onNext: () => {
          setConceptModal(null);
          setStageProgressPct(0);
          setActiveSession((prev) =>
            prev ? { ...prev, queueIndex: prev.queueIndex + 1 } : null,
          );
        },
      });
      return;
    }

    finalizeSession(activeSession);
  }, [activeSession, finalizeSession, persistProgress]);

  const engineCallbacks: EngineCallbacks | null = useMemo(() => {
    if (!activeGame) return null;
    const accentColor = getSubjectColor(activeGame.subject);
    return {
      accentColor,
      muted: progress.mute,
      onHit: (quiet?: boolean) => {
        if (!quiet) playQuickReviseSfx('ok', progress.mute);
        setStats((prev) => {
          const nextCombo = prev.combo + 1;
          const nextBest = Math.max(prev.bestCombo, nextCombo);
          const nextPts = prev.pts + 10 + Math.min(nextCombo, 5) * 2;
          const next = {
            ...prev,
            hits: prev.hits + 1,
            combo: nextCombo,
            bestCombo: nextBest,
            pts: nextPts,
          };
          statsRef.current = next;
          return next;
        });
      },
      onMiss: (weight = 1, quiet?: boolean) => {
        if (!quiet) playQuickReviseSfx('bad', progress.mute);
        setStats((prev) => {
          const next = {
            ...prev,
            misses: prev.misses + weight,
            combo: 0,
          };
          statsRef.current = next;
          return next;
        });
      },
      onProgress: (current: number, total: number) => {
        if (!activeSession) return;
        const perGameShare = 100 / activeSession.queue.length;
        const base = activeSession.queueIndex * perGameShare;
        const inGame = total > 0 ? Math.min(1, current / total) * perGameShare : 0;
        setStageProgressPct(Math.round(base + inGame));
      },
      onToast: showToast,
      onShowConcept: (modal) => setConceptModal(modal),
      onComplete: handleEngineComplete,
    };
  }, [activeGame, activeSession, handleEngineComplete, progress.mute, showToast]);

  /* =====================================================================
     ACTIVE GAMEPLAY VIEW
     ===================================================================== */
  if (activeSession && activeGame && engineCallbacks) {
    const accentColor = getSubjectColor(activeGame.subject);
    const currentIndexInClass = classGames.findIndex((g) => g.id === activeGame.id);
    const nextSuggestedGame =
      classGames.length > 1
        ? classGames[(currentIndexInClass + 1) % classGames.length]
        : null;

    return (
      <div className="mx-auto max-w-4xl space-y-4 pb-8" data-testid="quick-revise-game-shell">
        {/* Game Top Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveSession(null);
              setConceptModal(null);
              setVictory(null);
              setToast(null);
            }}
            aria-label="Back to all games"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#E5D7C3] bg-white text-[#142B46] shadow-xs hover:bg-[#FAF4EC]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg sm:text-xl font-extrabold text-[#142B46]">
              {activeGame.icon} {activeGame.title}
            </h2>
            <p className="truncate text-xs text-slate-600">
              Class {activeGame.cls} · {activeGame.subject} · {activeGame.chapter} ·{' '}
              {activeGame.topicLabel}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stats.combo >= 3 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                🔥 x{stats.combo}
              </span>
            )}
            <span className="rounded-full border border-[#E5D7C3] bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-[#142B46] shadow-xs tabular-nums">
              ⭐ {stats.pts}
            </span>
            <button
              type="button"
              onClick={() => persistProgress((p) => ({ ...p, mute: !p.mute }))}
              aria-label={progress.mute ? 'Unmute sound' : 'Mute sound'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5D7C3] bg-white text-[#142B46] hover:bg-[#FAF4EC]"
            >
              {progress.mute ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Entire Chapter Multi-Game Playlist Strip */}
        {activeSession.mode === 'chapter' && activeSession.queue.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5D7C3] bg-white px-4 py-2.5 text-xs">
            <span className="font-bold text-[#142B46]">
              Full Chapter Quest ({activeSession.queueIndex + 1}/{activeSession.queue.length}):
            </span>
            {activeSession.queue.map((gm, idx) => (
              <span
                key={gm.id}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${
                  idx === activeSession.queueIndex
                    ? 'bg-[#142B46] text-white'
                    : idx < activeSession.queueIndex
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span>{gm.icon}</span>
                <span>{gm.title}</span>
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(2, stageProgressPct))}%`,
              background: `linear-gradient(90deg, ${accentColor}, #FACC15)`,
            }}
          />
        </div>

        {/* Interactive Game Stage */}
        <QuickReviseGameStage
          key={`${activeGame.id}-${activeSession.runNonce}-${activeSession.queueIndex}`}
          game={activeGame}
          callbacks={engineCallbacks}
        />

        {/* Floating Feedback Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-lg ${
                toast.kind === 'ok'
                  ? 'bg-emerald-600'
                  : toast.kind === 'bad'
                    ? 'bg-red-600'
                    : 'bg-[#142B46]'
              }`}
            >
              {toast.text}
            </div>
          </div>
        )}

        {/* Concept Reveal Modal (Between Rounds / After Sequence & Label) */}
        {conceptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142B46]/55 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="text-5xl leading-none">{conceptModal.icon}</div>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-[#142B46]">
                {conceptModal.title}
              </h3>
              {conceptModal.text && (
                <p className="mt-1.5 text-sm text-slate-600">{conceptModal.text}</p>
              )}
              {conceptModal.emojis && (
                <div className="my-3 text-3xl tracking-wider">{conceptModal.emojis}</div>
              )}
              {conceptModal.fixes && conceptModal.fixes.length > 0 && (
                <div className="my-3 flex flex-wrap justify-center gap-1.5">
                  {conceptModal.fixes.map((fix, i) => (
                    <span
                      key={i}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        fix.kind === 'ok'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fix.kind === 'missed'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {fix.label}
                    </span>
                  ))}
                </div>
              )}
              {conceptModal.fnList && conceptModal.fnList.length > 0 && (
                <div className="my-4 space-y-1.5 text-left">
                  {conceptModal.fnList.map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl bg-[#FAF4EC] px-3 py-2 text-xs"
                    >
                      <span className="text-lg">{row.icon}</span>
                      <div>
                        <strong className="text-[#142B46]">{row.title}</strong>
                        {row.detail && <span className="text-slate-600"> · {row.detail}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const next = conceptModal.onNext;
                  setConceptModal(null);
                  next();
                }}
                className="mt-3 w-full rounded-2xl py-3 font-display text-base font-bold text-white shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {conceptModal.btnLabel}
              </button>
            </div>
          </div>
        )}

        {/* Victory & Remember Summary Modal */}
        {victory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#142B46]/60 p-4 backdrop-blur-xs">
            <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-center shadow-2xl">
              <div className="text-5xl tracking-widest">
                {[1, 2, 3].map((k) => (
                  <span key={k} className={k <= victory.stars ? 'text-amber-400' : 'text-slate-200'}>
                    ★
                  </span>
                ))}
              </div>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-[#142B46]">
                {victory.title}
              </h2>
              <p className="text-xs font-semibold text-slate-500">{victory.subtitle}</p>

              <div className="my-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl bg-[#FAF4EC] p-2.5">
                  <div className="font-mono text-xl font-extrabold text-[#142B46] tabular-nums">
                    {victory.accuracyPct}%
                  </div>
                  <div className="text-[11px] text-slate-500">Accuracy</div>
                </div>
                <div className="rounded-2xl bg-[#FAF4EC] p-2.5">
                  <div className="font-mono text-xl font-extrabold text-emerald-700 tabular-nums">
                    +{victory.xpEarned}
                  </div>
                  <div className="text-[11px] text-slate-500">XP Earned</div>
                </div>
                <div className="rounded-2xl bg-[#FAF4EC] p-2.5">
                  <div className="font-mono text-xl font-extrabold text-amber-700 tabular-nums">
                    🔥 {victory.bestCombo}
                  </div>
                  <div className="text-[11px] text-slate-500">Best Combo</div>
                </div>
              </div>

              {victory.syncNotice && (
                <p className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  {victory.syncNotice}
                </p>
              )}

              {victory.ideas.length > 0 && (
                <div className="mb-5 rounded-2xl bg-amber-50/80 p-3.5 text-left">
                  <h4 className="mb-2 font-display text-sm font-bold text-[#142B46]">
                    🧠 Key Points to Remember
                  </h4>
                  <div className="space-y-1.5">
                    {victory.ideas.map(([ic, txt], i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#142B46]">
                        <span className="w-6 shrink-0 text-center text-base leading-tight">
                          {ic}
                        </span>
                        <span className="font-medium leading-snug">{txt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const currentQueue = activeSession.queue;
                    const mode = activeSession.mode;
                    const chTitle = activeSession.chapterTitle;
                    resetSessionStats();
                    setActiveSession({
                      mode,
                      chapterTitle: chTitle,
                      queue: currentQueue,
                      queueIndex: 0,
                      runNonce: Date.now(),
                    });
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#E5D7C3] bg-white py-3 font-display text-sm font-bold text-[#142B46] hover:bg-[#FAF4EC]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Play Again
                </button>
                {nextSuggestedGame && (
                  <button
                    type="button"
                    onClick={() => startSingleGame(nextSuggestedGame)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 font-display text-sm font-bold text-white shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    Next Game ▶
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSession(null);
                  setVictory(null);
                }}
                className="mt-3 text-xs font-semibold text-slate-500 underline hover:text-[#142B46]"
              >
                Back to all chapters &amp; games
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     HOME BROWSE VIEW — REVISE ENTIRE CHAPTER OR SPECIFIC IMPORTANT TOPICS
     ===================================================================== */
  return (
    <div className="space-y-5" data-testid="quick-revise-hub">
      {/* Top Bar: Brand + Live Stats + Sound + Leaderboard Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] text-2xl shadow-sm">
            ⚡
          </div>
          <div>
            <h2 className="font-display text-xl font-extrabold leading-tight text-[#142B46]">
              Quick Revise · Study Games
            </h2>
            <p className="text-xs text-slate-600">
              See · Do · Remember · {board} Curriculum · Interactive Chapter &amp; Topic Revision
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-lg border border-[#E5D7C3] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#142B46] tabular-nums"
            title="Daily revision streak"
          >
            🔥 {progress.streak || 0}d
          </span>
          <span className="rounded-lg border border-[#E5D7C3] bg-white px-3 py-1.5 font-mono text-xs font-bold text-[#142B46] tabular-nums">
            ⭐ {progress.xp || 0} XP
          </span>
          {!isClassLocked && hubView === 'play' && (
            <div className="inline-flex rounded-lg border border-[#E5D7C3] bg-[#FAF4EC] p-0.5">
              <button
                type="button"
                onClick={() => setLibraryMode('studio_full')}
                data-testid="quick-revise-studio-6-12-btn"
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  libraryMode === 'studio_full'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Full Library (Nursery–12)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLibraryMode('foundation_1_5');
                  if (!isClassLocked && effectiveClass > 5) setSelectedClass(5);
                }}
                data-testid="quick-revise-foundation-1-5-btn"
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  libraryMode === 'foundation_1_5'
                    ? 'bg-[#142B46] text-white'
                    : 'text-[#142B46]/80 hover:bg-white'
                }`}
              >
                Classic Deck (1–5)
              </button>
            </div>
          )}
          <div className="inline-flex rounded-lg border border-[#E5D7C3] bg-[#F3E6D8] p-0.5">
            <button
              type="button"
              onClick={() => setHubView('play')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                hubView === 'play'
                  ? 'bg-[#142B46] text-white'
                  : 'text-[#142B46]/80 hover:text-[#142B46]'
              }`}
            >
              Play Games
            </button>
            <button
              type="button"
              onClick={() => setHubView('leaderboard')}
              data-testid="quick-revise-leaderboard-tab"
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                hubView === 'leaderboard'
                  ? 'bg-[#142B46] text-white'
                  : 'text-[#142B46]/80 hover:text-[#142B46]'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-[#D6B66D]" />
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* Class Selector Rail (Only shown for Foundation 1-5 mode or locked class badge) */}
      {hubView === 'play' && libraryMode === 'foundation_1_5' && (
        isClassLocked ? (
          <div
            data-testid="locked-student-class-display"
            className="inline-flex items-center gap-2 rounded-xl border border-[#D6B66D]/60 bg-white px-4 py-2 text-xs font-bold text-[#142B46]"
          >
            <Lock className="h-3.5 w-3.5 text-[#7B5D1C]" />
            <span>Dedicated Class: Class {effectiveClass}</span>
          </div>
        ) : (
          <nav
            aria-label="Select class"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            {QUICK_REVISE_CLASSES.filter((c) => c <= 5).map((clsNum) => {
              const active = clsNum === effectiveClass;
              return (
                <button
                  key={clsNum}
                  type="button"
                  onClick={() => {
                    setSelectedClass(clsNum);
                    persistProgress((p) => ({ ...p, cls: clsNum }));
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#142B46] text-white'
                      : 'border border-[#E5D7C3] bg-white text-[#142B46] hover:bg-[#FAF4EC]'
                  }`}
                >
                  Class {clsNum}
                </button>
              );
            })}
          </nav>
        )
      )}

      {/* ==================== LEADERBOARD VIEW ==================== */}
      {hubView === 'leaderboard' ? (
        <div
          data-testid="quick-revise-leaderboard-panel"
          className="rounded-2xl border border-[#E5D7C3] bg-white p-6 space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E5D7C3] pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#142B46]">
                Class &amp; School Revision Leaderboard
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Every completed chapter quest or topic game updates your live XP, stars, and rank.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter leaderboard by class"
                value={lbClassFilter}
                onChange={(e) => setLbClassFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46]"
              >
                <option value="ALL">All Classes</option>
                {leaderboardClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter leaderboard by subject"
                value={lbSubjectFilter}
                onChange={(e) => setLbSubjectFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#142B46]"
              >
                <option value="ALL">All Subjects</option>
                {STUDIO_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={lbLoading}
                onClick={() => void loadLeaderboard(lbClassFilter, lbSubjectFilter)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#142B46]/20 bg-[#FAF4EC] px-3 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#F3E6D8]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${lbLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {leaderboardRows.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              {lbLoading
                ? 'Loading live leaderboard...'
                : 'Complete any chapter or topic game to claim the #1 spot!'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5D7C3] text-slate-500">
                    <th className="py-2 pr-3 font-semibold">Rank</th>
                    <th className="py-2 px-3 font-semibold">Student</th>
                    <th className="py-2 px-3 font-semibold">Class</th>
                    <th className="py-2 px-3 font-semibold text-right">Games / Chapters</th>
                    <th className="py-2 px-3 font-semibold text-right">Avg Accuracy</th>
                    <th className="py-2 pl-3 font-semibold text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboardRows.map((row) => (
                    <tr
                      key={row.userId}
                      className={row.isCurrentUser ? 'bg-amber-50/70 font-semibold' : ''}
                    >
                      <td className="py-2.5 pr-3 font-mono font-bold text-[#142B46] tabular-nums">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Crown className="h-3.5 w-3.5" /> #1
                          </span>
                        ) : (
                          `#${row.rank}`
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[#142B46]">
                        {row.studentName}
                        {row.isCurrentUser && (
                          <span className="ml-1.5 text-[11px] font-bold text-amber-700">(You)</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{row.classSection}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {row.chaptersMastered}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                        {row.averageMasteryPct}%
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono font-bold tabular-nums text-[#142B46]">
                        {row.totalXp.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : libraryMode === 'studio_full' ? (
        /* ==================== FULL NURSERY–CLASS 12 QUICK REVISE + REMIX STUDIO ==================== */
        <div
          data-testid="quick-revise-v2-studio-container"
          className={
            studioExpanded
              ? 'fixed inset-3 z-50 flex flex-col rounded-2xl border border-[#142B46]/25 bg-white shadow-2xl overflow-hidden'
              : 'flex flex-col rounded-2xl border border-[#E5D7C3] bg-white overflow-hidden'
          }
        >
          {/* Compact Studio Context & Utility Bar */}
          <div className="border-b border-[#E5D7C3] bg-[#FAF4EC]/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {isClassLocked ? (
                <span
                  data-testid="locked-student-class-display"
                  className="inline-flex items-center gap-1.5 font-bold text-[#142B46]"
                >
                  <Lock className="h-3.5 w-3.5 text-[#7B5D1C]" />
                  {studioClassOption.label}
                </span>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <label
                    htmlFor="qr-studio-class-select"
                    className="font-semibold text-[#142B46] whitespace-nowrap"
                  >
                    Class:
                  </label>
                  <select
                    id="qr-studio-class-select"
                    value={String(effectiveStudioClass)}
                    onChange={(e) => {
                      const nextCode = Number(e.target.value) as StudioClassCode;
                      setSelectedStudioClass(nextCode);
                      if (nextCode >= 1) {
                        const clsNum = nextCode as SchoolClassNumber;
                        setSelectedClass(clsNum);
                        persistProgress((p) => ({ ...p, cls: clsNum }));
                      }
                    }}
                    className="rounded-lg border border-[#E5D7C3] bg-white px-2.5 py-1 text-xs font-bold text-[#142B46] cursor-pointer"
                  >
                    {STUDIO_CLASS_OPTIONS.map((opt) => (
                      <option key={opt.code} value={String(opt.code)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="hidden md:inline text-slate-400">·</span>
              <span className="hidden md:inline text-slate-600">
                Nursery–Class 12 · 16 Subjects · Chapter Remix, Timed Sort &amp; Read-Aloud · Auto-syncs XP &amp; Streak
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStudioReloadNonce((n) => n + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E5D7C3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#142B46] hover:bg-[#FAF4EC] whitespace-nowrap cursor-pointer"
                title="Reload Quick Revise Studio"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reload
              </button>
              <button
                type="button"
                onClick={() => setStudioExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#142B46] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D3A5C] whitespace-nowrap cursor-pointer"
              >
                {studioExpanded ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    Fullscreen
                  </>
                )}
              </button>
            </div>
          </div>

          {lastSyncedNotice && (
            <div className="border-b border-emerald-200 bg-emerald-50/90 px-4 py-2 flex items-center justify-between gap-2 text-xs text-emerald-900">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                {lastSyncedNotice}
              </span>
              <button
                type="button"
                onClick={() => setLastSyncedNotice(null)}
                aria-label="Dismiss sync notice"
                className="text-emerald-700 hover:text-emerald-950 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <iframe
            key={studioIframeSrc}
            src={studioIframeSrc}
            title="Quick Revise Interactive Study Games Studio"
            className={
              studioExpanded
                ? 'w-full flex-1 border-0 bg-[#FFF7ED]'
                : 'w-full min-h-[760px] h-[calc(100vh-14rem)] border-0 bg-[#FFF7ED]'
            }
          />
        </div>
      ) : (
        /* ==================== FOUNDATION CLASSES 1–5 PLAY HUB VIEW ==================== */
        <>
          {/* Class Progress Hero */}
          <section className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl bg-gradient-to-r from-[#142B46] to-[#234368] p-5 text-white shadow-sm">
            <div className="text-4xl leading-none">🏆</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="font-display text-xl font-extrabold">Class {effectiveClass}</h3>
                <span className="text-xs text-[#A9C5D8]">
                  {chapterBundles.length} chapters · {classGames.length} hands-on games
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-[#D6B66D] tabular-nums">
                {classStarsEarned} / {classStarsMax} stars earned ({classProgressPct}%)
              </p>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FACC15] to-[#FB923C] transition-all duration-500"
                  style={{ width: `${classProgressPct}%` }}
                />
              </div>
            </div>
            {classGames.length > 0 && (
              <button
                type="button"
                onClick={startSurpriseGame}
                data-testid="quick-revise-surprise-btn"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#FACC15] px-5 py-3 font-display text-sm font-extrabold text-[#142B46] shadow-sm transition-transform hover:bg-[#f5c20c] active:scale-95 whitespace-nowrap"
              >
                <Dices className="h-4 w-4" />
                Surprise Game
              </button>
            )}
          </section>

          {/* Mode Toggle (Revise Entire Chapter vs Specific Important Topics) + Subject Rail */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="inline-flex rounded-xl bg-[#F3E6D8] p-1 self-start">
              <button
                type="button"
                onClick={() => setBrowseMode('chapters')}
                data-testid="mode-entire-chapter-btn"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  browseMode === 'chapters'
                    ? 'bg-[#142B46] text-white shadow-xs'
                    : 'text-[#142B46]/80 hover:text-[#142B46]'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-[#D6B66D]" />
                Revise Entire Chapter ({chapterBundles.length})
              </button>
              <button
                type="button"
                onClick={() => setBrowseMode('topics')}
                data-testid="mode-specific-topics-btn"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  browseMode === 'topics'
                    ? 'bg-[#142B46] text-white shadow-xs'
                    : 'text-[#142B46]/80 hover:text-[#142B46]'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-[#D6B66D]" />
                Specific Important Topics ({filteredTopicGames.length})
              </button>
            </div>

            {/* Subject Chips */}
            <nav aria-label="Filter by subject" className="flex flex-wrap items-center gap-1.5">
              {classSubjects.map((sub) => {
                const active = selectedSubject === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors ${
                      active
                        ? 'border-[#142B46] bg-[#142B46] text-white'
                        : 'border-[#E5D7C3] bg-white text-[#142B46] hover:bg-[#FAF4EC]'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ==================== MODE 1: REVISE ENTIRE CHAPTER ==================== */}
          {browseMode === 'chapters' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapterBundles.map((bundle) => {
                const earned = bundle.games.reduce((s, gm) => s + (progress.stars[gm.id] || 0), 0);
                const max = bundle.games.length * 3;
                return (
                  <div
                    key={bundle.key}
                    data-testid={`chapter-bundle-${bundle.games[0].id}`}
                    className="flex flex-col justify-between rounded-2xl border border-[#E5D7C3] bg-white p-4 shadow-xs transition-all hover:shadow-md"
                    style={{ borderTopWidth: '6px', borderTopColor: bundle.accentColor }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-4xl leading-none">{bundle.primaryIcon}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {bundle.subject} · {bundle.games.length}{' '}
                          {bundle.games.length === 1 ? 'Game' : 'Games'}
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-lg font-extrabold leading-snug text-[#142B46]">
                        {bundle.chapter}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        {bundle.games
                          .map((gm) => `${QUICK_GAME_TYPE_META[gm.type].icon} ${gm.topicLabel}`)
                          .join(' · ')}
                      </p>

                      {/* Direct Important Topic Launchers inside this Chapter */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {bundle.games.map((gm) => (
                          <button
                            key={gm.id}
                            type="button"
                            onClick={() => startSingleGame(gm)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5D7C3] bg-[#FAF4EC]/70 px-2.5 py-1 text-[11px] font-semibold text-[#142B46] hover:border-[#142B46]/40 hover:bg-[#FAF4EC]"
                          >
                            <span>{gm.icon}</span>
                            <span>{gm.title}</span>
                            <span className="text-amber-500">
                              {'★'.repeat(progress.stars[gm.id] || 0)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="font-mono text-xs font-bold text-slate-600 tabular-nums">
                        ★ {earned} / {max}
                      </span>
                      <button
                        type="button"
                        onClick={() => startChapterQuest(bundle)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-display text-xs font-bold text-white shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                        style={{ backgroundColor: bundle.accentColor }}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        {bundle.games.length > 1
                          ? `Revise Full Chapter (${bundle.games.length})`
                          : 'Revise Chapter'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ==================== MODE 2: SPECIFIC IMPORTANT TOPICS ==================== */
            <div className="space-y-3">
              {/* Optional Game Mechanic Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'platter', 'bins', 'sequence', 'label', 'pairs', 'odd'] as const).map(
                  (tp) => {
                    const active = selectedTypeFilter === tp;
                    return (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setSelectedTypeFilter(tp)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-[#142B46] text-white'
                            : 'bg-white text-slate-600 border border-[#E5D7C3] hover:text-[#142B46]'
                        }`}
                      >
                        {tp === 'All'
                          ? 'All Game Styles'
                          : `${QUICK_GAME_TYPE_META[tp].icon} ${QUICK_GAME_TYPE_META[tp].name}`}
                      </button>
                    );
                  },
                )}
              </div>

              {filteredTopicGames.length === 0 ? (
                <div className="rounded-2xl border border-[#E5D7C3] bg-white p-10 text-center text-sm text-slate-500">
                  No games match this filter for Class {effectiveClass}. Try selecting All Game
                  Styles or All Subjects.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {filteredTopicGames.map((gm) => {
                    const col = getSubjectColor(gm.subject);
                    const meta = QUICK_GAME_TYPE_META[gm.type];
                    const stars = progress.stars[gm.id] || 0;
                    return (
                      <button
                        key={gm.id}
                        type="button"
                        data-testid={`topic-game-card-${gm.id}`}
                        onClick={() => startSingleGame(gm)}
                        className="flex flex-col justify-between rounded-2xl border border-[#E5D7C3] bg-white p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                        style={{ borderTopWidth: '6px', borderTopColor: col }}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-4xl leading-none">{gm.icon}</span>
                            <span className="text-[11px] font-bold text-slate-500">
                              {meta.icon} {meta.name}
                            </span>
                          </div>
                          <div className="mt-2.5 font-display text-base font-extrabold leading-tight text-[#142B46]">
                            {gm.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {gm.subject} · {gm.chapter}
                          </div>
                          <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                            Topic: {gm.topicLabel}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-2">
                          {renderStars(stars)}
                          <span
                            className="text-xs font-bold"
                            style={{ color: col }}
                          >
                            Play ▶
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
