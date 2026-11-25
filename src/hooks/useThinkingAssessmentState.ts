import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type {
  PpdtPerceptionDetails,
  TatStoryStructure,
  ThinkingAssessmentSession,
  ThinkingDifficulty,
  ThinkingQuestionItem,
  ThinkingTestType,
} from '../types';
import { apiRequest } from '../utils/api';

// ============================================================================
// THINKING ASSESSMENT STATE MACHINE (SRT, WAT, TAT, PPDT)
// ============================================================================

export type ThinkingAssessmentPhase =
  | 'selection'
  | 'configuring'
  | 'active'
  | 'submitting'
  | 'completed';

export interface ThinkingDraftEntry {
  questionId: string;
  responseText: string;
  responseTimeMs: number;
  updatedAt: number;
  tatStructure?: TatStoryStructure;
  ppdtPerception?: PpdtPerceptionDetails;
}

export interface ThinkingSessionConfig {
  timedMode: boolean;
  workflowMode: 'Individual' | 'Group';
  difficultyFilter: 'All' | ThinkingDifficulty;
  requestAiDraft: boolean;
  customTimeLimitSec: number | null;
}

export interface ThinkingTimerState {
  sessionStartedAt: number | null;
  promptStartedAt: number | null;
  promptElapsedSec: number;
  isPaused: boolean;
  accumulatedPromptMs: number;
}

export interface ThinkingAssessmentState {
  phase: ThinkingAssessmentPhase;
  selectedTestType: ThinkingTestType | null;
  studentId: string;
  config: ThinkingSessionConfig;
  activeQuestionIds: string[];
  currentIndex: number;
  drafts: Record<string, ThinkingDraftEntry>;
  timer: ThinkingTimerState;
  submittedSession: ThinkingAssessmentSession | null;
  error: string | null;
  hasRestorableDraft: boolean;
}

export interface PersistedThinkingDraft {
  version: 1;
  schoolId: string;
  studentId: string;
  selectedTestType: ThinkingTestType;
  config: ThinkingSessionConfig;
  activeQuestionIds: string[];
  currentIndex: number;
  drafts: Record<string, ThinkingDraftEntry>;
  savedAt: number;
}

export const DEFAULT_TAT_STRUCTURE: TatStoryStructure = {
  protagonist: '',
  objective: '',
  challenges: '',
  actions: '',
  outcome: '',
};

export const DEFAULT_PPDT_PERCEPTION: PpdtPerceptionDetails = {
  charactersCount: 4,
  approximateAges: '13-15 yrs',
  mood: 'Positive',
  centralSituation: '',
  narrationSummary: '',
};

export function defaultConfigForTest(testType: ThinkingTestType): ThinkingSessionConfig {
  return {
    timedMode: testType === 'SRT' || testType === 'WAT' || testType === 'PPDT',
    workflowMode: 'Individual',
    difficultyFilter: 'All',
    requestAiDraft: false,
    customTimeLimitSec: testType === 'WAT' ? 15 : testType === 'SRT' ? 30 : testType === 'PPDT' ? 240 : 300,
  };
}

export function createInitialThinkingAssessmentState(
  initialStudentId: string,
): ThinkingAssessmentState {
  return {
    phase: 'selection',
    selectedTestType: null,
    studentId: initialStudentId,
    config: defaultConfigForTest('SRT'),
    activeQuestionIds: [],
    currentIndex: 0,
    drafts: {},
    timer: {
      sessionStartedAt: null,
      promptStartedAt: null,
      promptElapsedSec: 0,
      isPaused: false,
      accumulatedPromptMs: 0,
    },
    submittedSession: null,
    error: null,
    hasRestorableDraft: false,
  };
}

export type ThinkingAssessmentAction =
  | { type: 'SET_STUDENT'; studentId: string }
  | { type: 'SELECT_TEST_TYPE'; testType: ThinkingTestType }
  | { type: 'UPDATE_CONFIG'; patch: Partial<ThinkingSessionConfig> }
  | { type: 'START_SESSION'; questionIds: string[]; now: number }
  | { type: 'RESTORE_DRAFT'; draft: PersistedThinkingDraft; now: number }
  | { type: 'SET_HAS_RESTORABLE_DRAFT'; value: boolean }
  | {
      type: 'UPDATE_RESPONSE_TEXT';
      questionId: string;
      text: string;
      now: number;
    }
  | {
      type: 'UPDATE_TAT_FIELDS';
      questionId: string;
      patch: Partial<TatStoryStructure>;
      now: number;
    }
  | {
      type: 'UPDATE_PPDT_FIELDS';
      questionId: string;
      patch: Partial<PpdtPerceptionDetails>;
      now: number;
    }
  | { type: 'GO_TO_PROMPT'; index: number; now: number }
  | { type: 'TICK_TIMER'; now: number }
  | { type: 'TOGGLE_PAUSE'; now: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; session: ThinkingAssessmentSession }
  | { type: 'SUBMIT_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_TO_SELECTION' };

function computePromptElapsedMs(timer: ThinkingTimerState, now: number): number {
  if (timer.isPaused || timer.promptStartedAt == null) {
    return timer.accumulatedPromptMs;
  }
  return timer.accumulatedPromptMs + Math.max(0, now - timer.promptStartedAt);
}

export function thinkingAssessmentReducer(
  state: ThinkingAssessmentState,
  action: ThinkingAssessmentAction,
): ThinkingAssessmentState {
  switch (action.type) {
    case 'SET_STUDENT':
      return {
        ...state,
        studentId: action.studentId,
        error: null,
      };

    case 'SELECT_TEST_TYPE':
      return {
        ...state,
        phase: 'configuring',
        selectedTestType: action.testType,
        config: defaultConfigForTest(action.testType),
        activeQuestionIds: [],
        currentIndex: 0,
        drafts: {},
        submittedSession: null,
        error: null,
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.patch,
        },
        error: null,
      };

    case 'START_SESSION': {
      if (action.questionIds.length === 0) {
        return {
          ...state,
          error: 'No active prompts match the selected test and difficulty filter.',
        };
      }
      return {
        ...state,
        phase: 'active',
        activeQuestionIds: action.questionIds,
        currentIndex: 0,
        drafts: {},
        timer: {
          sessionStartedAt: action.now,
          promptStartedAt: action.now,
          promptElapsedSec: 0,
          isPaused: false,
          accumulatedPromptMs: 0,
        },
        submittedSession: null,
        error: null,
      };
    }

    case 'RESTORE_DRAFT':
      return {
        ...state,
        phase: 'active',
        selectedTestType: action.draft.selectedTestType,
        studentId: action.draft.studentId || state.studentId,
        config: action.draft.config,
        activeQuestionIds: action.draft.activeQuestionIds,
        currentIndex: Math.min(
          Math.max(0, action.draft.currentIndex),
          Math.max(0, action.draft.activeQuestionIds.length - 1),
        ),
        drafts: action.draft.drafts,
        timer: {
          sessionStartedAt: action.now,
          promptStartedAt: action.now,
          promptElapsedSec: 0,
          isPaused: false,
          accumulatedPromptMs: 0,
        },
        submittedSession: null,
        error: null,
      };

    case 'SET_HAS_RESTORABLE_DRAFT':
      return {
        ...state,
        hasRestorableDraft: action.value,
      };

    case 'UPDATE_RESPONSE_TEXT': {
      const existing = state.drafts[action.questionId];
      const measuredMs = Math.max(
        1000,
        existing?.responseTimeMs ?? 0,
        computePromptElapsedMs(state.timer, action.now),
      );
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.questionId]: {
            questionId: action.questionId,
            responseText: action.text,
            responseTimeMs: measuredMs,
            updatedAt: action.now,
            tatStructure: existing?.tatStructure,
            ppdtPerception: existing?.ppdtPerception,
          },
        },
        error: null,
      };
    }

    case 'UPDATE_TAT_FIELDS': {
      const existing = state.drafts[action.questionId];
      const nextTat: TatStoryStructure = {
        ...DEFAULT_TAT_STRUCTURE,
        ...(existing?.tatStructure || {}),
        ...action.patch,
      };
      const measuredMs = Math.max(
        1000,
        existing?.responseTimeMs ?? 0,
        computePromptElapsedMs(state.timer, action.now),
      );
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.questionId]: {
            questionId: action.questionId,
            responseText: existing?.responseText || '',
            responseTimeMs: measuredMs,
            updatedAt: action.now,
            tatStructure: nextTat,
            ppdtPerception: existing?.ppdtPerception,
          },
        },
        error: null,
      };
    }

    case 'UPDATE_PPDT_FIELDS': {
      const existing = state.drafts[action.questionId];
      const nextPpdt: PpdtPerceptionDetails = {
        ...DEFAULT_PPDT_PERCEPTION,
        ...(existing?.ppdtPerception || {}),
        ...action.patch,
      };
      const measuredMs = Math.max(
        1000,
        existing?.responseTimeMs ?? 0,
        computePromptElapsedMs(state.timer, action.now),
      );
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.questionId]: {
            questionId: action.questionId,
            responseText: existing?.responseText || '',
            responseTimeMs: measuredMs,
            updatedAt: action.now,
            tatStructure: existing?.tatStructure,
            ppdtPerception: nextPpdt,
          },
        },
        error: null,
      };
    }

    case 'GO_TO_PROMPT': {
      const clamped = Math.min(
        Math.max(0, action.index),
        Math.max(0, state.activeQuestionIds.length - 1),
      );
      // Persist latency on the prompt we are leaving if it already has text
      const leavingId = state.activeQuestionIds[state.currentIndex];
      let nextDrafts = state.drafts;
      if (leavingId && state.drafts[leavingId]) {
        const leavingMs = Math.max(
          1000,
          state.drafts[leavingId].responseTimeMs,
          computePromptElapsedMs(state.timer, action.now),
        );
        nextDrafts = {
          ...state.drafts,
          [leavingId]: {
            ...state.drafts[leavingId],
            responseTimeMs: leavingMs,
          },
        };
      }
      return {
        ...state,
        currentIndex: clamped,
        drafts: nextDrafts,
        timer: {
          ...state.timer,
          promptStartedAt: state.timer.isPaused ? null : action.now,
          promptElapsedSec: 0,
          accumulatedPromptMs: 0,
        },
      };
    }

    case 'TICK_TIMER': {
      if (state.phase !== 'active' || state.timer.isPaused || state.timer.promptStartedAt == null) {
        return state;
      }
      const totalMs = computePromptElapsedMs(state.timer, action.now);
      const sec = Math.floor(totalMs / 1000);
      if (sec === state.timer.promptElapsedSec) return state;
      return {
        ...state,
        timer: {
          ...state.timer,
          promptElapsedSec: sec,
        },
      };
    }

    case 'TOGGLE_PAUSE': {
      if (state.phase !== 'active') return state;
      if (!state.timer.isPaused) {
        const acc = computePromptElapsedMs(state.timer, action.now);
        return {
          ...state,
          timer: {
            ...state.timer,
            isPaused: true,
            promptStartedAt: null,
            accumulatedPromptMs: acc,
            promptElapsedSec: Math.floor(acc / 1000),
          },
        };
      }
      return {
        ...state,
        timer: {
          ...state.timer,
          isPaused: false,
          promptStartedAt: action.now,
        },
      };
    }

    case 'SUBMIT_START':
      return {
        ...state,
        phase: 'submitting',
        error: null,
      };

    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        phase: 'completed',
        submittedSession: action.session,
        error: null,
        hasRestorableDraft: false,
      };

    case 'SUBMIT_ERROR':
      return {
        ...state,
        phase: 'active',
        error: action.message,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_TO_SELECTION':
      return {
        ...createInitialThinkingAssessmentState(state.studentId),
        hasRestorableDraft: state.hasRestorableDraft,
      };

    default:
      return state;
  }
}

// ============================================================================
// REACT HOOK: useThinkingAssessmentState
// ============================================================================

interface UseThinkingAssessmentStateOptions {
  schoolId: string;
  initialStudentId: string;
  questionBank: ThinkingQuestionItem[];
  token: string;
  onRefresh: () => Promise<void>;
}

export interface ThinkingSessionLaunchMetadata {
  classLevel?: number;
  monthKey?: string;
  setVersion?: number;
  dailyAssignmentId?: string;
  customQuestions?: ThinkingQuestionItem[];
  forcedTestType?: ThinkingTestType;
  forcedTimeLimitSec?: number;
}

function getDraftStorageKey(schoolId: string, studentId: string): string {
  return `virat-thinking-draft-${schoolId}-${studentId || 'default'}`;
}

export function useThinkingAssessmentState({
  schoolId,
  initialStudentId,
  questionBank,
  token,
  onRefresh,
}: UseThinkingAssessmentStateOptions) {
  const [state, dispatch] = useReducer(
    thinkingAssessmentReducer,
    initialStudentId,
    createInitialThinkingAssessmentState,
  );
  const [sessionQuestionPool, setSessionQuestionPool] = useReducer(
    (_prev: ThinkingQuestionItem[], next: ThinkingQuestionItem[]) => next,
    [],
  );
  const [sessionMeta, setSessionMeta] = useReducer(
    (
      _prev: Omit<ThinkingSessionLaunchMetadata, 'customQuestions'>,
      next: Omit<ThinkingSessionLaunchMetadata, 'customQuestions'>,
    ) => next,
    {},
  );

  // Keep studentId synced when workspace tenant/user changes while in selection phase
  useEffect(() => {
    if (state.phase === 'selection' && initialStudentId && initialStudentId !== state.studentId) {
      dispatch({ type: 'SET_STUDENT', studentId: initialStudentId });
    }
  }, [initialStudentId, state.phase, state.studentId]);

  const storageKey = useMemo(
    () => getDraftStorageKey(schoolId, state.studentId),
    [schoolId, state.studentId],
  );

  // Check if a saved localStorage draft exists for this school + student
  const loadSavedDraft = useCallback((): PersistedThinkingDraft | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedThinkingDraft;
      if (
        parsed &&
        parsed.version === 1 &&
        parsed.selectedTestType &&
        Array.isArray(parsed.activeQuestionIds) &&
        parsed.activeQuestionIds.length > 0
      ) {
        return parsed;
      }
    } catch {
      // Ignore malformed storage entries
    }
    return null;
  }, [storageKey]);

  useEffect(() => {
    dispatch({ type: 'SET_HAS_RESTORABLE_DRAFT', value: Boolean(loadSavedDraft()) });
  }, [loadSavedDraft]);

  // Persist in-progress drafts automatically while active
  useEffect(() => {
    if (state.phase !== 'active' || !state.selectedTestType || state.activeQuestionIds.length === 0) {
      return;
    }
    const payload: PersistedThinkingDraft = {
      version: 1,
      schoolId,
      studentId: state.studentId,
      selectedTestType: state.selectedTestType,
      config: state.config,
      activeQuestionIds: state.activeQuestionIds,
      currentIndex: state.currentIndex,
      drafts: state.drafts,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      if (!state.hasRestorableDraft) {
        dispatch({ type: 'SET_HAS_RESTORABLE_DRAFT', value: true });
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [
    schoolId,
    state.activeQuestionIds,
    state.config,
    state.currentIndex,
    state.drafts,
    state.hasRestorableDraft,
    state.phase,
    state.selectedTestType,
    state.studentId,
    storageKey,
  ]);

  // Live 500ms timer tick when assessment is active & unpaused
  useEffect(() => {
    if (state.phase !== 'active' || state.timer.isPaused) return;
    const id = window.setInterval(() => {
      dispatch({ type: 'TICK_TIMER', now: Date.now() });
    }, 500);
    return () => window.clearInterval(id);
  }, [state.phase, state.timer.isPaused]);

  const combinedPool = useMemo(() => {
    const map = new Map<string, ThinkingQuestionItem>();
    questionBank.forEach((q) => map.set(q.id, q));
    sessionQuestionPool.forEach((q) => map.set(q.id, q));
    return Array.from(map.values());
  }, [questionBank, sessionQuestionPool]);

  // Filter candidate prompts for the currently selected testType + difficulty
  const matchingQuestions = useMemo(() => {
    if (!state.selectedTestType) return [];
    const basePool =
      sessionQuestionPool.length > 0 && sessionQuestionPool[0]?.testType === state.selectedTestType
        ? sessionQuestionPool
        : questionBank.filter((q) => q.active && q.testType === state.selectedTestType);

    return basePool.filter((q) => {
      if (state.config.difficultyFilter !== 'All' && q.difficulty !== state.config.difficultyFilter) {
        return false;
      }
      return true;
    });
  }, [questionBank, sessionQuestionPool, state.config.difficultyFilter, state.selectedTestType]);

  // Resolved active prompt objects in order
  const activeQuestions = useMemo(() => {
    const byId = new Map(combinedPool.map((q) => [q.id, q]));
    return state.activeQuestionIds
      .map((id) => byId.get(id))
      .filter((q): q is ThinkingQuestionItem => Boolean(q));
  }, [combinedPool, state.activeQuestionIds]);

  const currentQuestion = activeQuestions[state.currentIndex] || null;

  const answeredCount = useMemo(() => {
    return state.activeQuestionIds.filter((id) => {
      const d = state.drafts[id];
      return Boolean(d && d.responseText.trim().length > 0);
    }).length;
  }, [state.activeQuestionIds, state.drafts]);

  const clearSavedDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    dispatch({ type: 'SET_HAS_RESTORABLE_DRAFT', value: false });
  }, [storageKey]);

  const selectTestType = useCallback(
    (
      testType: ThinkingTestType,
      customQuestions?: ThinkingQuestionItem[],
      meta?: Omit<ThinkingSessionLaunchMetadata, 'customQuestions'>,
    ) => {
      setSessionQuestionPool(customQuestions || []);
      setSessionMeta(meta || {});
      dispatch({ type: 'SELECT_TEST_TYPE', testType });
    },
    [],
  );

  const setStudentId = useCallback((studentId: string) => {
    dispatch({ type: 'SET_STUDENT', studentId });
  }, []);

  const updateConfig = useCallback((patch: Partial<ThinkingSessionConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', patch });
  }, []);

  const startSession = useCallback(
    (launch?: ThinkingSessionLaunchMetadata) => {
      if (launch?.forcedTestType) {
        dispatch({ type: 'SELECT_TEST_TYPE', testType: launch.forcedTestType });
      }
      if (launch?.forcedTimeLimitSec) {
        dispatch({
          type: 'UPDATE_CONFIG',
          patch: { timedMode: true, customTimeLimitSec: launch.forcedTimeLimitSec },
        });
      }
      if (launch?.customQuestions && launch.customQuestions.length > 0) {
        setSessionQuestionPool(launch.customQuestions);
        setSessionMeta({
          classLevel: launch.classLevel,
          monthKey: launch.monthKey,
          setVersion: launch.setVersion,
          dailyAssignmentId: launch.dailyAssignmentId,
        });
        dispatch({
          type: 'START_SESSION',
          questionIds: launch.customQuestions.map((q) => q.id),
          now: Date.now(),
        });
        return;
      }
      const ids = matchingQuestions.map((q) => q.id);
      dispatch({ type: 'START_SESSION', questionIds: ids, now: Date.now() });
    },
    [matchingQuestions],
  );

  const resumeSavedDraft = useCallback(
    (fallbackPool?: ThinkingQuestionItem[]) => {
      const draft = loadSavedDraft();
      if (!draft) return;
      if (fallbackPool && fallbackPool.length > 0) {
        setSessionQuestionPool(fallbackPool);
      }
      dispatch({ type: 'RESTORE_DRAFT', draft, now: Date.now() });
    },
    [loadSavedDraft],
  );

  const updateResponseText = useCallback((questionId: string, text: string) => {
    dispatch({ type: 'UPDATE_RESPONSE_TEXT', questionId, text, now: Date.now() });
  }, []);

  const updateTatFields = useCallback(
    (questionId: string, patch: Partial<TatStoryStructure>) => {
      dispatch({ type: 'UPDATE_TAT_FIELDS', questionId, patch, now: Date.now() });
    },
    [],
  );

  const updatePpdtFields = useCallback(
    (questionId: string, patch: Partial<PpdtPerceptionDetails>) => {
      dispatch({ type: 'UPDATE_PPDT_FIELDS', questionId, patch, now: Date.now() });
    },
    [],
  );

  const goToPrompt = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_PROMPT', index, now: Date.now() });
  }, []);

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE', now: Date.now() });
  }, []);

  const resetToSelection = useCallback(() => {
    setSessionQuestionPool([]);
    setSessionMeta({});
    dispatch({ type: 'RESET_TO_SELECTION' });
  }, []);

  const submitSession = useCallback(async () => {
    if (!state.selectedTestType) return;
    if (!state.studentId) {
      dispatch({ type: 'SUBMIT_ERROR', message: 'Please select a student before submitting.' });
      return;
    }

    const responsesPayload = state.activeQuestionIds
      .map((qId) => {
        const entry = state.drafts[qId];
        if (!entry || !entry.responseText.trim()) return null;
        return {
          questionId: qId,
          responseText: entry.responseText.trim(),
          responseTimeMs: Math.max(1000, entry.responseTimeMs || 12000),
          tatStructure:
            state.selectedTestType === 'TAT'
              ? { ...DEFAULT_TAT_STRUCTURE, ...(entry.tatStructure || {}) }
              : undefined,
          ppdtPerception:
            state.selectedTestType === 'PPDT'
              ? { ...DEFAULT_PPDT_PERCEPTION, ...(entry.ppdtPerception || {}) }
              : undefined,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    if (responsesPayload.length === 0) {
      dispatch({
        type: 'SUBMIT_ERROR',
        message: 'Please complete at least one prompt response before submitting.',
      });
      return;
    }

    dispatch({ type: 'SUBMIT_START' });
    try {
      const timeLimitSec =
        state.config.customTimeLimitSec ||
        currentQuestion?.defaultTimeLimitSec ||
        30;

      const res = await apiRequest<{ session: ThinkingAssessmentSession }>(
        '/api/thinking/sessions',
        {
          method: 'POST',
          body: JSON.stringify({
            studentId: state.studentId,
            testType: state.selectedTestType,
            workflowMode:
              state.selectedTestType === 'PPDT' ? state.config.workflowMode : 'Individual',
            timedMode: state.config.timedMode,
            timeLimitSec,
            requestAiDraft: state.config.requestAiDraft,
            classLevel: sessionMeta.classLevel,
            monthKey: sessionMeta.monthKey,
            setVersion: sessionMeta.setVersion,
            dailyAssignmentId: sessionMeta.dailyAssignmentId,
            responses: responsesPayload,
          }),
        },
        token,
      );

      clearSavedDraft();
      dispatch({ type: 'SUBMIT_SUCCESS', session: res.session });
      await onRefresh();
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ERROR',
        message: err instanceof Error ? err.message : 'Unable to submit thinking assessment.',
      });
    }
  }, [
    clearSavedDraft,
    currentQuestion?.defaultTimeLimitSec,
    onRefresh,
    sessionMeta.classLevel,
    sessionMeta.dailyAssignmentId,
    sessionMeta.monthKey,
    sessionMeta.setVersion,
    state.activeQuestionIds,
    state.config.customTimeLimitSec,
    state.config.requestAiDraft,
    state.config.timedMode,
    state.config.workflowMode,
    state.drafts,
    state.selectedTestType,
    state.studentId,
    token,
  ]);

  return {
    state,
    sessionMeta,
    matchingQuestions,
    activeQuestions,
    currentQuestion,
    answeredCount,
    savedDraftPreview: state.hasRestorableDraft ? loadSavedDraft() : null,
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
  };
}
