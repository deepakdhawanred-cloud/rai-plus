import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialThinkingAssessmentState,
  thinkingAssessmentReducer,
  type PersistedThinkingDraft,
} from './useThinkingAssessmentState.ts';
import type { ThinkingAssessmentSession } from '../types';

test('Thinking Assessment state machine', async (t) => {
  await t.test('initializes cleanly in selection phase with bound studentId', () => {
    const initial = createInitialThinkingAssessmentState('stu-101');
    assert.equal(initial.phase, 'selection');
    assert.equal(initial.selectedTestType, null);
    assert.equal(initial.studentId, 'stu-101');
    assert.deepEqual(initial.activeQuestionIds, []);
  });

  await t.test('selects SRT, WAT, TAT, and PPDT with format-appropriate defaults', () => {
    const s0 = createInitialThinkingAssessmentState('stu-101');

    const wat = thinkingAssessmentReducer(s0, { type: 'SELECT_TEST_TYPE', testType: 'WAT' });
    assert.equal(wat.phase, 'configuring');
    assert.equal(wat.selectedTestType, 'WAT');
    assert.equal(wat.config.timedMode, true);
    assert.equal(wat.config.customTimeLimitSec, 15);

    const tat = thinkingAssessmentReducer(s0, { type: 'SELECT_TEST_TYPE', testType: 'TAT' });
    assert.equal(tat.selectedTestType, 'TAT');
    assert.equal(tat.config.timedMode, false);

    const ppdt = thinkingAssessmentReducer(s0, { type: 'SELECT_TEST_TYPE', testType: 'PPDT' });
    assert.equal(ppdt.selectedTestType, 'PPDT');
    assert.equal(ppdt.config.workflowMode, 'Individual');
  });

  await t.test('tracks response latency, pause/resume, TAT/PPDT structured fields, and prompt navigation', () => {
    let state = createInitialThinkingAssessmentState('stu-101');
    state = thinkingAssessmentReducer(state, { type: 'SELECT_TEST_TYPE', testType: 'TAT' });
    state = thinkingAssessmentReducer(state, {
      type: 'START_SESSION',
      questionIds: ['q-tat-1', 'q-tat-2'],
      now: 10_000,
    });
    assert.equal(state.phase, 'active');
    assert.equal(state.currentIndex, 0);

    // Tick 6 seconds
    state = thinkingAssessmentReducer(state, { type: 'TICK_TIMER', now: 16_000 });
    assert.equal(state.timer.promptElapsedSec, 6);

    // Pause at 16s and resume at 26s (elapsed stays 6s)
    state = thinkingAssessmentReducer(state, { type: 'TOGGLE_PAUSE', now: 16_000 });
    assert.equal(state.timer.isPaused, true);
    state = thinkingAssessmentReducer(state, { type: 'TICK_TIMER', now: 26_000 });
    assert.equal(state.timer.promptElapsedSec, 6);
    state = thinkingAssessmentReducer(state, { type: 'TOGGLE_PAUSE', now: 26_000 });
    assert.equal(state.timer.isPaused, false);

    // Enter TAT structured fields and story text at 30s (6s + 4s = 10s latency)
    state = thinkingAssessmentReducer(state, {
      type: 'UPDATE_TAT_FIELDS',
      questionId: 'q-tat-1',
      patch: { protagonist: 'Aarav', objective: 'Repair village footbridge' },
      now: 30_000,
    });
    state = thinkingAssessmentReducer(state, {
      type: 'UPDATE_RESPONSE_TEXT',
      questionId: 'q-tat-1',
      text: 'Aarav organised classmates and elders to reinforce the footbridge before the monsoon.',
      now: 30_000,
    });
    assert.equal(state.drafts['q-tat-1'].responseTimeMs, 10_000);
    assert.equal(state.drafts['q-tat-1'].tatStructure?.protagonist, 'Aarav');

    // Navigate to prompt 2 resets prompt timer
    state = thinkingAssessmentReducer(state, { type: 'GO_TO_PROMPT', index: 1, now: 31_000 });
    assert.equal(state.currentIndex, 1);
    assert.equal(state.timer.promptElapsedSec, 0);
  });

  await t.test('restores saved draft and handles submission success/reset', () => {
    let state = createInitialThinkingAssessmentState('stu-101');
    const draft: PersistedThinkingDraft = {
      version: 1,
      schoolId: 'school-1',
      studentId: 'stu-101',
      selectedTestType: 'PPDT',
      config: {
        timedMode: true,
        workflowMode: 'Group',
        difficultyFilter: 'All',
        requestAiDraft: false,
        customTimeLimitSec: 240,
      },
      activeQuestionIds: ['q-ppdt-1'],
      currentIndex: 0,
      drafts: {
        'q-ppdt-1': {
          questionId: 'q-ppdt-1',
          responseText: 'Students coordinating an assembly safety plan.',
          responseTimeMs: 14_000,
          updatedAt: 50_000,
          ppdtPerception: {
            charactersCount: 4,
            approximateAges: '14-16 yrs',
            mood: 'Positive',
            centralSituation: 'Planning a science exhibition',
            narrationSummary: 'Clear collaborative lead.',
          },
        },
      },
      savedAt: 50_000,
    };

    state = thinkingAssessmentReducer(state, { type: 'RESTORE_DRAFT', draft, now: 60_000 });
    assert.equal(state.phase, 'active');
    assert.equal(state.selectedTestType, 'PPDT');
    assert.equal(state.config.workflowMode, 'Group');
    assert.equal(state.drafts['q-ppdt-1'].ppdtPerception?.mood, 'Positive');

    const mockSession = { id: 'sess-1', testType: 'PPDT' } as ThinkingAssessmentSession;
    state = thinkingAssessmentReducer(state, { type: 'SUBMIT_START' });
    assert.equal(state.phase, 'submitting');
    state = thinkingAssessmentReducer(state, { type: 'SUBMIT_SUCCESS', session: mockSession });
    assert.equal(state.phase, 'completed');
    assert.equal(state.submittedSession?.id, 'sess-1');

    state = thinkingAssessmentReducer(state, { type: 'RESET_TO_SELECTION' });
    assert.equal(state.phase, 'selection');
    assert.equal(state.selectedTestType, null);
  });
});
