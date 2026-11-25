import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Languages,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Save,
  Square,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import type {
  AcademicMonthKey,
  ClassAssessmentTier,
  MonthlyReadingReport,
  ReadingTestSession,
  StudentRecord,
} from '../types';
import { apiRequest } from '../utils/api';
import { useReadingMicrophone } from '../hooks/useReadingMicrophone';
import { evaluateNewPersonalBestStatus } from '../utils/personalBestEngine';
import {
  CLASS_READING_TIERS,
  computeFluencyBurstProfile,
  computeIncrementalSpokenWordTimestamps,
  computeLiveWpm,
  computeOverallReadingDiagnostic,
  computeReadingSpeedMetrics,
  evaluateSentenceTranslation,
  evaluateSpokenTranscriptAgainstPassage,
  type GradedReadingPassage,
  READING_PASSAGE_BANK,
  resolveClassTierFromSection,
  scoreComprehensionAnswers,
  tokenizePassageText,
  type WordReadEvent,
} from '../utils/readingAssessmentEngine';

interface ReadingTestArenaProps {
  student: StudentRecord;
  month: AcademicMonthKey;
  token: string;
  existingSessions?: ReadingTestSession[];
  existingReports?: MonthlyReadingReport[];
  onSaved: (session: ReadingTestSession) => Promise<void>;
}

type ReadingStage = 'reading' | 'comprehension' | 'translation' | 'report';

export const ReadingTestArena: React.FC<ReadingTestArenaProps> = ({
  student,
  month,
  token,
  existingSessions = [],
  existingReports = [],
  onSaved,
}) => {
  const autoTier = resolveClassTierFromSection(student.classSection);
  const [selectedTier, setSelectedTier] = useState<ClassAssessmentTier>(autoTier);
  const [stage, setStage] = useState<ReadingStage>('reading');

  // Reading runtime state
  const [isReadingActive, setIsReadingActive] = useState(false);
  const [readStartMs, setReadStartMs] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [wordEvents, setWordEvents] = useState<WordReadEvent[]>([]);
  const [flaggedSlips, setFlaggedSlips] = useState<number[]>([]);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [captureMode, setCaptureMode] = useState<'microphone' | 'assisted_pacer'>('assisted_pacer');
  const lastEventTsRef = useRef<number>(0);
  const lastActionClockRef = useRef<number>(0);

  const mic = useReadingMicrophone();

  // Comprehension & translation state
  const [compAnswers, setCompAnswers] = useState<Record<string, number>>({});
  const [compSubmitted, setCompSubmitted] = useState(false);
  const [translationText, setTranslationText] = useState('');
  const [showGlossaryHints, setShowGlossaryHints] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [savedSession, setSavedSession] = useState<ReadingTestSession | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const passage: GradedReadingPassage = useMemo(
    () => READING_PASSAGE_BANK.find((p) => p.tier === selectedTier) || READING_PASSAGE_BANK[2],
    [selectedTier],
  );
  const tierMeta = useMemo(
    () => CLASS_READING_TIERS.find((t) => t.tier === selectedTier) || CLASS_READING_TIERS[2],
    [selectedTier],
  );
  const tokens = useMemo(
    () => tokenizePassageText(passage.text, passage.phoneticOverrides),
    [passage],
  );

  // Reset stage cleanly when student or selected tier changes
  useEffect(() => {
    setSelectedTier(resolveClassTierFromSection(student.classSection));
  }, [student.id, student.classSection]);

  useEffect(() => {
    resetReadingSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passage.id, student.id]);

  useEffect(() => {
    if (!isReadingActive || readStartMs === null) return;
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - readStartMs);
    }, 200);
    return () => window.clearInterval(id);
  }, [isReadingActive, readStartMs]);

  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;
  const flaggedSlipsRef = useRef(flaggedSlips);
  flaggedSlipsRef.current = flaggedSlips;
  const pauseThresholdRef = useRef(tierMeta.pauseThresholdMs);
  pauseThresholdRef.current = tierMeta.pauseThresholdMs;

  function resetReadingSession() {
    mic.stopCapture();
    mic.setNotice(null);
    lastEventTsRef.current = 0;
    lastActionClockRef.current = 0;
    setStage('reading');
    setIsReadingActive(false);
    setReadStartMs(null);
    setElapsedMs(0);
    setWordEvents([]);
    setFlaggedSlips([]);
    setSpokenTranscript('');
    setCompAnswers({});
    setCompSubmitted(false);
    setTranslationText('');
    setShowGlossaryHints(false);
    setSavedSession(null);
    setSaveErr(null);
  }

  async function startMicrophoneCapture(startTimestamp: number) {
    const started = await mic.startCapture({
      lang: 'en-IN',
      pauseThresholdMs: tierMeta.pauseThresholdMs,
      onTranscriptFrame: (frame) => {
        setSpokenTranscript(frame.fullTranscript);
        setCaptureMode('microphone');

        const evalRes = evaluateSpokenTranscriptAgainstPassage({
          tokens: tokensRef.current,
          spokenTranscript: frame.fullTranscript,
          flaggedMispronouncedIndices: flaggedSlipsRef.current,
        });
        const now = Date.now();
        setWordEvents((prev) =>
          computeIncrementalSpokenWordTimestamps({
            existingEvents: prev,
            newlyMatchedIndices: evalRes.matchedIndices,
            nowMs: now,
            sessionStartMs: startTimestamp,
            observedSilenceMs: frame.observedSilenceMs,
            pauseThresholdMs: pauseThresholdRef.current,
          }),
        );
      },
      onFallbackToPacer: () => {
        setCaptureMode('assisted_pacer');
      },
    });
    if (!started) {
      setCaptureMode('assisted_pacer');
    } else {
      setCaptureMode('microphone');
    }
  }

  function handleStartReading(withMic: boolean) {
    const now = Date.now();
    lastEventTsRef.current = 0;
    lastActionClockRef.current = now;
    setReadStartMs(now);
    setElapsedMs(0);
    setWordEvents([]);
    setFlaggedSlips([]);
    setSpokenTranscript('');
    setSavedSession(null);
    setSaveErr(null);
    setIsReadingActive(true);
    setStage('reading');
    if (withMic) {
      void startMicrophoneCapture(now);
    } else {
      mic.stopCapture();
      setCaptureMode('assisted_pacer');
      mic.setNotice(
        'Interactive Word Pacer active: click words, press Spacebar for next word, or Advance Phrase as read.',
      );
    }
  }

  function recordWordProgress(
    targetIndices: number[],
    spacingMs = 240,
    forceChunkBoundary = false,
  ) {
    const now = Date.now();
    if (!isReadingActive || readStartMs === null) {
      setReadStartMs(now);
      setIsReadingActive(true);
    }

    const existingSet = new Set(wordEvents.map((p) => p.wordIndex));
    const freshIndices: number[] = [];
    for (const idx of targetIndices) {
      if (!existingSet.has(idx) && idx >= 0 && idx < tokens.length && !freshIndices.includes(idx)) {
        freshIndices.push(idx);
      }
    }
    if (freshIndices.length === 0) return;

    const clockGap =
      lastActionClockRef.current > 0 ? Math.max(0, now - lastActionClockRef.current) : 0;
    const burstStartTs =
      lastEventTsRef.current === 0
        ? now
        : forceChunkBoundary || freshIndices.length > 1
          ? lastEventTsRef.current + Math.max(tierMeta.pauseThresholdMs + 120, clockGap)
          : lastEventTsRef.current + Math.max(80, clockGap);

    const added: WordReadEvent[] = freshIndices.map((wordIndex, idx) => ({
      wordIndex,
      timestampMs: burstStartTs + idx * spacingMs,
    }));

    lastEventTsRef.current = burstStartTs + (freshIndices.length - 1) * spacingMs;
    lastActionClockRef.current = now;

    setWordEvents((prev) => {
      const seen = new Set(prev.map((p) => p.wordIndex));
      const uniqueAdded = added.filter((item) => !seen.has(item.wordIndex));
      return uniqueAdded.length > 0 ? [...prev, ...uniqueAdded] : prev;
    });
  }

  const nextUnreadIndex = useMemo(() => {
    const readSet = new Set(wordEvents.map((e) => e.wordIndex));
    const found = tokens.find((t) => !readSet.has(t.index));
    return found ? found.index : tokens.length;
  }, [wordEvents, tokens]);

  function handleAdvanceWords(count: number, forceChunkBoundary = false) {
    if (nextUnreadIndex >= tokens.length) return;
    const endIdx = Math.min(tokens.length, nextUnreadIndex + count);
    const indices: number[] = [];
    for (let i = nextUnreadIndex; i < endIdx; i++) {
      indices.push(i);
    }
    recordWordProgress(indices, 220, forceChunkBoundary);
  }

  function handleCompleteCurrentSentence() {
    if (nextUnreadIndex >= tokens.length) return;
    const currentSentenceIdx = tokens[nextUnreadIndex].sentenceIndex;
    const indices = tokens
      .filter((t) => t.index >= nextUnreadIndex && t.sentenceIndex === currentSentenceIdx)
      .map((t) => t.index);
    recordWordProgress(indices, 200, true);
  }

  function togglePronunciationSlip(wordIndex: number) {
    setFlaggedSlips((prev) =>
      prev.includes(wordIndex) ? prev.filter((i) => i !== wordIndex) : [...prev, wordIndex],
    );
  }

  function speakCorrectWord(word: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = 'en-IN';
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    } catch {
      // ignore if speech synthesis blocked
    }
  }

  function handleFinishReading() {
    mic.stopCapture();
    if (readStartMs !== null) {
      setElapsedMs(Math.max(1000, Date.now() - readStartMs));
    }
    setIsReadingActive(false);
    setStage('comprehension');
  }

  // Keyboard Space/ArrowRight pacer during active reading stage
  useEffect(() => {
    if (!isReadingActive || stage !== 'reading') return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAdvanceWords(1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadingActive, stage, nextUnreadIndex]);

  const readIndexSet = useMemo(
    () => new Set(wordEvents.map((e) => e.wordIndex)),
    [wordEvents],
  );
  const flaggedSet = useMemo(() => new Set(flaggedSlips), [flaggedSlips]);

  const wordsReadCount = readIndexSet.size;
  const elapsedSeconds = Math.max(1, Math.round(elapsedMs / 1000));
  const liveWpm = computeLiveWpm(wordsReadCount, Math.max(elapsedMs, 1000));

  const transcriptEval = useMemo(() => {
    if (spokenTranscript.trim().length > 0) {
      return evaluateSpokenTranscriptAgainstPassage({
        tokens,
        spokenTranscript,
        flaggedMispronouncedIndices: flaggedSlips,
      });
    }
    const readTokens = tokens.filter((t) => readIndexSet.has(t.index));
    const mispronouncedWords = flaggedSlips
      .filter((idx) => tokens[idx])
      .map((idx) => ({
        expectedWord: tokens[idx].raw.replace(/[.,!?;:"'()]/g, ''),
        spokenAs: '(Pronunciation slip flagged)',
        difficultyTier: tokens[idx].difficulty,
        phoneticHint: tokens[idx].phoneticHint,
      }));
    const baseCount = Math.max(1, readTokens.length || 1);
    const pronPct =
      readTokens.length === 0
        ? 0
        : Math.max(0, Math.round(((baseCount - mispronouncedWords.length) / baseCount) * 100));
    const compPct =
      tokens.length > 0 ? Math.min(100, Math.round((readTokens.length / tokens.length) * 100)) : 0;
    return {
      matchedIndices: Array.from(readIndexSet),
      mispronouncedWords,
      pronunciationPct: pronPct,
      completionPct: compPct,
      accuracyPct:
        readTokens.length === 0 ? 0 : Math.round(pronPct * 0.7 + compPct * 0.3),
    };
  }, [tokens, spokenTranscript, flaggedSlips, readIndexSet]);

  const fluencyProfile = useMemo(
    () =>
      computeFluencyBurstProfile({
        tokens,
        events: wordEvents,
        pauseThresholdMs: tierMeta.pauseThresholdMs,
      }),
    [tokens, wordEvents, tierMeta.pauseThresholdMs],
  );

  const speedMetrics = useMemo(
    () =>
      computeReadingSpeedMetrics({
        wordsRead: wordsReadCount,
        mispronouncedCount: transcriptEval.mispronouncedWords.length,
        elapsedMs: Math.max(elapsedMs, 1000),
        events: wordEvents,
        pauseThresholdMs: tierMeta.pauseThresholdMs,
      }),
    [wordsReadCount, transcriptEval.mispronouncedWords.length, elapsedMs, wordEvents, tierMeta.pauseThresholdMs],
  );

  const compResult = useMemo(
    () => scoreComprehensionAnswers(passage.comprehensionQuestions, compAnswers),
    [passage.comprehensionQuestions, compAnswers],
  );

  const translationEval = useMemo(
    () => evaluateSentenceTranslation(passage.translationTask, translationText),
    [passage.translationTask, translationText],
  );

  const overallDiagnostic = useMemo(
    () =>
      computeOverallReadingDiagnostic({
        pronunciationPct: transcriptEval.pronunciationPct,
        accuracyPct: transcriptEval.accuracyPct,
        comprehensionPct: compResult.scorePct,
        translationPct: translationEval.scorePct,
        avgBurstWords: fluencyProfile.avgBurstWords,
        targetWpm: passage.targetWpm,
        wpm: liveWpm,
      }),
    [
      transcriptEval.pronunciationPct,
      transcriptEval.accuracyPct,
      compResult.scorePct,
      translationEval.scorePct,
      fluencyProfile.avgBurstWords,
      passage.targetWpm,
      liveWpm,
    ],
  );

  const [personalBestAchieved, setPersonalBestAchieved] = useState<{
    beatWpm: boolean;
    beatAccuracy: boolean;
  } | null>(null);

  async function handleSaveSession() {
    setSaving(true);
    setSaveErr(null);
    const pbCheck = evaluateNewPersonalBestStatus({
      student,
      existingSessions,
      existingReports,
      candidateWpm: liveWpm,
      candidateAccuracyPct: transcriptEval.accuracyPct,
    });
    try {
      const res = await apiRequest<{ session: ReadingTestSession }>(
        '/api/assessments/reading',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            month,
            year: 2026,
            passageId: passage.id,
            passageTitle: passage.title,
            classTier: selectedTier,
            captureMode,
            wordsRead: wordsReadCount,
            totalPassageWords: tokens.length,
            elapsedSeconds,
            wpm: liveWpm,
            pronunciationPct: transcriptEval.pronunciationPct,
            accuracyPct: transcriptEval.accuracyPct,
            avgBurstWords: fluencyProfile.avgBurstWords,
            maxBurstWords: fluencyProfile.maxBurstWords,
            burstOneWordPct: fluencyProfile.burstOneWordPct,
            burstTwoWordsPct: fluencyProfile.burstTwoWordsPct,
            burstThreePlusPct: fluencyProfile.burstThreePlusPct,
            burstWholeSentencePct: fluencyProfile.burstWholeSentencePct,
            dominantFluencyStyle: fluencyProfile.dominantFluencyStyle,
            comprehensionPct: compResult.scorePct,
            translationPct: translationEval.scorePct,
            overallPct: overallDiagnostic.overallPct,
            readingBand: overallDiagnostic.readingBand,
            mispronouncedWords: transcriptEval.mispronouncedWords,
            translationPrompt: passage.translationTask.englishSentence,
            studentTranslation: translationText.trim(),
            syncMonthlyReport: true,
          }),
        },
        token,
      );
      setPersonalBestAchieved({
        beatWpm: pbCheck.beatWpm,
        beatAccuracy: pbCheck.beatAccuracy,
      });
      setSavedSession(res.session);
      await onSaved(res.session);
    } catch (err) {
      setSaveErr(err instanceof Error ? err.message : 'Could not save reading diagnostic.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="reading-test-arena">
      {/* Top Stage Header & Class Difficulty Tier Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-900 shrink-0" />
              Real-Time Reading, Fluency &amp; Bilingual Diagnostic
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Student: <strong className="text-slate-900">{student.name}</strong> (Class{' '}
              {student.classSection}) · Target Month: {month} 2026 · Benchmark {passage.targetWpm} WPM
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-600 flex items-center gap-2">
              <span className="font-medium whitespace-nowrap">Class Difficulty:</span>
              <select
                aria-label="Reading passage class difficulty"
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as ClassAssessmentTier)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
              >
                {CLASS_READING_TIERS.map((t) => (
                  <option key={t.tier} value={t.tier}>
                    {t.label} · {t.targetWpm} WPM
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={resetReadingSession}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Test
            </button>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {(
            [
              { id: 'reading', label: '1. Live Passage Read (WPM & Fluency)' },
              { id: 'comprehension', label: '2. Comprehension Quiz' },
              { id: 'translation', label: '3. Sentence Translation' },
              { id: 'report', label: '4. Full Reading Diagnostic' },
            ] as const
          ).map((step) => {
            const active = stage === step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setStage(step.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  active
                    ? 'border-blue-900 bg-blue-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage 1: Real-Time Reading + Pronunciation + Fluency Bursts */}
      {stage === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Class-Leveled Passage Canvas */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-blue-900">
                  {passage.tierLabel} · {passage.subjectContext}
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {passage.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{passage.difficultyNotes}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {!isReadingActive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void mic.testMicrophone(tierMeta.pauseThresholdMs)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      {mic.isTestingMic ? 'Stop Mic Check' : 'Test Mic'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartReading(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      Start Live Mic Read
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartReading(false)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Start Interactive Pacer
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishReading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <Square className="h-3.5 w-3.5 text-slate-600" />
                    End Read Early
                  </button>
                )}
              </div>
            </div>

            {(mic.notice || mic.micActive || mic.isTestingMic) && (
              <div
                data-testid="reading-mic-status"
                className={`rounded-lg border px-3.5 py-2.5 text-xs space-y-2 ${
                  mic.permissionState === 'denied' || mic.permissionState === 'unavailable'
                    ? 'border-amber-200 bg-amber-50/70 text-amber-950'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {mic.micActive || mic.isTestingMic ? (
                      <Mic className="h-4 w-4 text-emerald-700 shrink-0" />
                    ) : (
                      <MicOff className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                    <span>{mic.notice || 'Microphone stream active'}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums shrink-0">
                    Permission: {mic.permissionState}
                    {mic.micActive ? ` · Acoustic pauses: ${mic.acousticPauseCount}` : ''}
                  </span>
                </div>
                {(mic.micActive || mic.isTestingMic) && (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {mic.voiceActive ? 'Voice detected' : 'Quiet / Breath pause'}
                    </span>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          mic.voiceActive ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(4, mic.inputLevelPct)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 tabular-nums w-12 text-right">
                      {mic.inputLevelPct}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Passage Words Interactive Canvas */}
            <div
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 leading-loose text-lg text-slate-900 select-none"
              aria-label="Class-level reading passage"
            >
              <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                {tokens.map((tok) => {
                  const isRead = readIndexSet.has(tok.index);
                  const isSlipped = flaggedSet.has(tok.index);
                  const isCursor = tok.index === nextUnreadIndex;
                  const isChallenge = tok.difficulty === 'challenge';

                  return (
                    <button
                      key={tok.index}
                      type="button"
                      title={
                        isChallenge
                          ? `Challenge vocabulary (${tok.phoneticHint}) · Click to advance or mark`
                          : 'Click word when read'
                      }
                      onClick={(e) => {
                        if (e.shiftKey) {
                          togglePronunciationSlip(tok.index);
                        } else {
                          recordWordProgress([tok.index]);
                        }
                      }}
                      className={`rounded px-1.5 py-0.5 text-left transition-colors ${
                        isSlipped
                          ? 'bg-red-100 text-red-900 underline decoration-red-600 decoration-wavy'
                          : isRead
                            ? 'bg-emerald-100/90 text-emerald-950 font-medium'
                            : isCursor
                              ? 'bg-blue-100 text-blue-950 ring-2 ring-blue-900/40 font-semibold'
                              : isChallenge
                                ? 'underline decoration-dotted decoration-amber-600 underline-offset-4 hover:bg-slate-200/70'
                                : 'hover:bg-slate-200/70'
                      }`}
                    >
                      {tok.raw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Assisted Reading & Pronunciation Controls */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Live Read Pace &amp; Fluency Chunk Controls (Space / → reads 1 word)
                </span>
                <span className="text-[11px] text-slate-500">
                  Tip: Dotted underline = class difficulty word · Shift+Click any word to flag pronunciation slip
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdvanceWords(1)}
                  disabled={nextUnreadIndex >= tokens.length}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  +1 Word
                </button>
                <button
                  type="button"
                  onClick={() => handleAdvanceWords(2, true)}
                  disabled={nextUnreadIndex >= tokens.length}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  +2 Words Chunk
                </button>
                <button
                  type="button"
                  onClick={() => handleAdvanceWords(3, true)}
                  disabled={nextUnreadIndex >= tokens.length}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
                >
                  +3 Words Phrase
                </button>
                <button
                  type="button"
                  onClick={handleCompleteCurrentSentence}
                  disabled={nextUnreadIndex >= tokens.length}
                  className="rounded-lg border border-blue-900 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-40 whitespace-nowrap"
                >
                  Whole Sentence in One Go
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetIdx = Math.max(0, nextUnreadIndex - 1);
                    if (tokens[targetIdx]) {
                      if (!readIndexSet.has(targetIdx)) recordWordProgress([targetIdx]);
                      togglePronunciationSlip(targetIdx);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 whitespace-nowrap"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Flag Pronunciation Slip
                </button>
                {wordsReadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleFinishReading}
                    className="ml-auto rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                  >
                    Finish Read &amp; Go to Comprehension →
                  </button>
                )}
              </div>

              {spokenTranscript && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Live Speech Transcript: </span>
                  {spokenTranscript}
                </div>
              )}
            </div>
          </div>

          {/* Right 4 Cols: Live Telemetry Deck */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
              Live Reading Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">Speed (WPM)</p>
                <p
                  data-testid="live-reading-wpm"
                  className="font-mono text-2xl font-bold text-blue-900 tabular-nums mt-1"
                >
                  {liveWpm}
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">
                  {wordsReadCount > 0
                    ? `${speedMetrics.correctWpm} WCPM · Goal ${passage.targetWpm}`
                    : `Target ${passage.targetWpm} WPM`}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">Pronunciation</p>
                <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                  {wordsReadCount > 0 ? `${transcriptEval.pronunciationPct}%` : '—'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {transcriptEval.mispronouncedWords.length} flagged slip(s)
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">Words Read</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {wordsReadCount}/{tokens.length}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-medium text-slate-500">Elapsed Time</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums mt-1">
                  {elapsedMs > 0 ? `${elapsedSeconds}s` : '0s'}
                </p>
              </div>
            </div>

            {/* Fluency Burst Detector Readout */}
            <div className="border-t border-slate-200 pt-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Fluency Chunking (Words in One Go)</span>
                <span className="font-mono font-semibold text-blue-900 tabular-nums">
                  Avg {fluencyProfile.avgBurstWords} w/go
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Pattern: <strong className="text-slate-900">{fluencyProfile.dominantFluencyStyle}</strong>
              </p>

              <div className="space-y-1.5 text-xs">
                {[
                  { label: '1 Word at a time', pct: fluencyProfile.burstOneWordPct, color: 'bg-amber-500' },
                  { label: '2 Words in one go', pct: fluencyProfile.burstTwoWordsPct, color: 'bg-sky-600' },
                  { label: '3+ Words phrase', pct: fluencyProfile.burstThreePlusPct, color: 'bg-blue-700' },
                  { label: 'Whole sentence in one go', pct: fluencyProfile.burstWholeSentencePct, color: 'bg-emerald-600' },
                ].map((row) => (
                  <div key={row.label} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{row.label}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {row.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.color}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Natural Pausing & Phrasing Metrics */}
            <div className="border-t border-slate-200 pt-3 space-y-2" data-testid="live-pausing-metrics">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">Natural Pausing &amp; Phrasing</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {wordsReadCount > 1 ? `${fluencyProfile.pauseMetrics.pausingQualityPct}%` : '—'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {wordsReadCount > 1
                  ? fluencyProfile.pauseMetrics.prosodySummary
                  : 'Pause cadence updates as words are read.'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <span className="text-slate-500 block">Boundary pauses</span>
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    {fluencyProfile.pauseMetrics.naturalBoundaryPauses}
                  </span>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  <span className="text-slate-500 block">Mid-clause hesitations</span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {fluencyProfile.pauseMetrics.midSentenceHesitations}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2: Comprehension Quiz */}
      {stage === 'comprehension' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">
                Step 2 · Reading Comprehension Check ({passage.title})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Answer the questions based directly on the passage you just read.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-blue-900 tabular-nums">
              {Object.keys(compAnswers).length}/{passage.comprehensionQuestions.length} answered
            </span>
          </div>

          <div className="space-y-5">
            {passage.comprehensionQuestions.map((q, qIdx) => {
              const selectedIdx = compAnswers[q.id];
              return (
                <div key={q.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {qIdx + 1}. {q.prompt}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const picked = selectedIdx === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      let btnStyle = 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50';
                      if (compSubmitted) {
                        if (isCorrect) btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold';
                        else if (picked) btnStyle = 'border-red-500 bg-red-50 text-red-900';
                      } else if (picked) {
                        btnStyle = 'border-blue-900 bg-blue-900 text-white font-semibold';
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (compSubmitted) return;
                            setCompAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                          }}
                          className={`rounded-lg border px-3.5 py-2.5 text-left text-xs transition-colors ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {compSubmitted && (
                    <p className="text-xs text-slate-600 pt-1">
                      <strong className="text-slate-900">Explanation: </strong>
                      {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStage('reading')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back to Passage
            </button>
            <div className="flex items-center gap-2">
              {!compSubmitted && (
                <button
                  type="button"
                  onClick={() => setCompSubmitted(true)}
                  className="rounded-lg border border-blue-900 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50"
                >
                  Check Comprehension ({compResult.correctCount}/{compResult.totalCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setCompSubmitted(true);
                  setStage('translation');
                }}
                className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Continue to Sentence Translation →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage 3: Bilingual English -> Hindi / Hinglish Sentence Translation */}
      {stage === 'translation' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                <Languages className="h-4 w-4 text-blue-900 shrink-0" />
                Step 3 · Sentence Translation Check (English → Hindi / Hinglish)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Translate this key sentence from the passage in Hindi (Devanagari) or Romanized Hinglish to confirm true meaning transfer.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowGlossaryHints((v) => !v)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {showGlossaryHints ? 'Hide Word Hints' : 'Show Word Hints'}
            </button>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900">Translate This Passage Sentence:</p>
            <p className="text-base font-semibold text-slate-900">
              &ldquo;{passage.translationTask.englishSentence}&rdquo;
            </p>
          </div>

          {showGlossaryHints && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Vocabulary Meaning Hints:</p>
              {passage.translationTask.hintGlossary.map((h) => (
                <p key={h.english}>
                  <span className="font-medium text-slate-900">{h.english}</span> → {h.hindi}
                </p>
              ))}
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-slate-800">
              Your Hindi or Hinglish Translation *
            </span>
            <textarea
              rows={3}
              aria-label="Student Hindi translation input"
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              placeholder={`e.g. ${passage.translationTask.modelHinglish}`}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none"
            />
          </label>

          {translationText.trim().length >= 4 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Live Meaning Coverage</span>
                <span className="font-mono font-bold text-blue-900 tabular-nums">
                  {translationEval.scorePct}%
                </span>
              </div>
              <p className="text-slate-700">{translationEval.feedbackSummary}</p>
              {translationEval.matchedConcepts.length > 0 && (
                <p className="text-emerald-700">
                  Captured ideas: {translationEval.matchedConcepts.join(' · ')}
                </p>
              )}
              {translationEval.missingConcepts.length > 0 && (
                <p className="text-amber-700">
                  Missing ideas: {translationEval.missingConcepts.join(' · ')}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStage('comprehension')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back to Comprehension
            </button>
            <button
              type="button"
              onClick={() => setStage('report')}
              className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Generate Complete Reading Report →
            </button>
          </div>
        </div>
      )}

      {/* Stage 4: Diagnostic Reading Report Card + Save to Monthly Progress */}
      {stage === 'report' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6" data-testid="reading-diagnostic-report">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Complete Real-Time Reading Diagnostic ({student.name})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {passage.title} ({passage.tierLabel}) · Overall Band:{' '}
                <strong className="text-blue-900">{overallDiagnostic.readingBand}</strong> (
                <span className="font-mono tabular-nums">{overallDiagnostic.overallPct}%</span>)
              </p>
            </div>
            <button
              type="button"
              disabled={saving || Boolean(savedSession)}
              onClick={() => void handleSaveSession()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Save className="h-3.5 w-3.5" />
              {saving
                ? 'Saving Report...'
                : savedSession
                  ? `Saved to ${month} Report ✓`
                  : `Save to ${month} Reading Report`}
            </button>
          </div>

          {saveErr && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              {saveErr}
            </div>
          )}

          {savedSession && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                Saved reading diagnostic ({savedSession.wpm} WPM, {savedSession.accuracyPct}% accuracy, {savedSession.dominantFluencyStyle}) and synced {month} 2026 Reading Progress Chart.
                {(personalBestAchieved?.beatWpm || personalBestAchieved?.beatAccuracy) && (
                  <strong className="ml-1 text-blue-950">
                    New Personal Best{' '}
                    {personalBestAchieved.beatWpm && personalBestAchieved.beatAccuracy
                      ? '(WPM & Accuracy)'
                      : personalBestAchieved.beatWpm
                        ? '(WPM)'
                        : '(Accuracy)'}
                    !
                  </strong>
                )}
              </span>
            </div>
          )}

          {/* 5 Dimension Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Reading Speed</p>
              <p className="font-mono text-2xl font-bold text-blue-900 tabular-nums mt-1">
                {liveWpm} WPM
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {speedMetrics.correctWpm} WCPM · Goal {passage.targetWpm} WPM
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Pronunciation</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {transcriptEval.pronunciationPct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {transcriptEval.mispronouncedWords.length} word slip(s)
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Fluency &amp; Pausing</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {fluencyProfile.avgBurstWords} w/go
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 tabular-nums">
                {fluencyProfile.dominantFluencyStyle} · Pausing {fluencyProfile.pauseMetrics.pausingQualityPct}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Comprehension</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {compResult.scorePct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {compResult.correctCount}/{compResult.totalCount} questions right
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-xs text-slate-500">Translation</p>
              <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {translationEval.scorePct}%
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">English → Hindi/Hinglish</p>
            </div>
          </div>

          {/* Fluency Chunking, Pausing Cadence & Pronunciation Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                Fluency Breakdown &amp; Natural Pausing
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-md bg-amber-50 border border-amber-200 p-2">
                  <p className="font-mono font-bold text-amber-800 tabular-nums">
                    {fluencyProfile.burstOneWordPct}%
                  </p>
                  <p className="text-[11px] text-slate-600">1 Word</p>
                </div>
                <div className="rounded-md bg-sky-50 border border-sky-200 p-2">
                  <p className="font-mono font-bold text-sky-800 tabular-nums">
                    {fluencyProfile.burstTwoWordsPct}%
                  </p>
                  <p className="text-[11px] text-slate-600">2 Words</p>
                </div>
                <div className="rounded-md bg-blue-50 border border-blue-200 p-2">
                  <p className="font-mono font-bold text-blue-900 tabular-nums">
                    {fluencyProfile.burstThreePlusPct}%
                  </p>
                  <p className="text-[11px] text-slate-600">3+ Words</p>
                </div>
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2">
                  <p className="font-mono font-bold text-emerald-800 tabular-nums">
                    {fluencyProfile.burstWholeSentencePct}%
                  </p>
                  <p className="text-[11px] text-slate-600">Whole Sent.</p>
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 tabular-nums">
                <span>
                  Prosody: <strong className="text-slate-900">{fluencyProfile.pauseMetrics.prosodySummary}</strong>
                </span>
                <span className="font-mono text-[11px] text-slate-600">
                  {fluencyProfile.pauseMetrics.naturalBoundaryPauses} boundary ·{' '}
                  {fluencyProfile.pauseMetrics.midSentenceHesitations} hesitation · Active pace{' '}
                  {speedMetrics.activeSpeakingWpm} WPM
                </span>
              </div>
              {fluencyProfile.bursts.length > 0 && (
                <div className="text-xs text-slate-600 space-y-1 max-h-32 overflow-y-auto pt-1">
                  {fluencyProfile.bursts.slice(0, 6).map((b) => (
                    <p key={b.burstIndex} className="truncate">
                      <span className="font-mono text-slate-500 mr-1.5">[{b.wordCount}w]</span>
                      {b.textPreview}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                Pronunciation Practice Words &amp; Model Translation
              </h4>
              {transcriptEval.mispronouncedWords.length === 0 ? (
                <p className="text-xs text-emerald-700">
                  Zero mispronunciations flagged on read words.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {transcriptEval.mispronouncedWords.map((mw, idx) => (
                    <div
                      key={`${mw.expectedWord}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                    >
                      <div>
                        <strong className="text-slate-900">{mw.expectedWord}</strong>{' '}
                        <span className="font-mono text-[11px] text-slate-500">
                          [{mw.phoneticHint}]
                        </span>
                        <span className="text-slate-500"> · {mw.difficultyTier}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakCorrectWord(mw.expectedWord)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-900 hover:bg-blue-50"
                      >
                        <Volume2 className="h-3 w-3" />
                        Hear
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-slate-100 pt-2.5 text-xs space-y-1">
                <p className="font-semibold text-slate-800">Model Hindi Translation:</p>
                <p className="text-slate-900">{passage.translationTask.modelHindiDevanagari}</p>
                <p className="text-slate-500">{passage.translationTask.modelHinglish}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
