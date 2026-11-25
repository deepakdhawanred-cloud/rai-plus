import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditExistingPresentation,
  buildNotebookLmSourceBrief,
  enforcePresentationLanguagePolicy,
  parseNotebookLmStoryboardJson,
} from './presentationStudioEngine';
import type { AcademicResource } from '../types';

const MATH_RES: AcademicResource = {
  id: 'res-math-1',
  schoolId: 'sch-1',
  title: 'Linear Equations in Two Variables',
  classSection: '9-A',
  subject: 'Mathematics',
  chapter: 'Ch. 4: Linear Equations',
  session: '2026-27',
  board: 'CBSE',
  category: 'Presentations',
  status: 'Approved',
  contentSummary: 'Dense bullet slides covering equations.',
  createdBy: 'Deepak',
  aiAssisted: false,
  updatedAt: '2026-11-18',
};

test('Mathematics presentations strictly enforce English-only policy even if bilingual is requested', () => {
  const mathCheck = enforcePresentationLanguagePolicy('Mathematics', 'bilingual_en_hi');
  assert.equal(mathCheck.effectiveMode, 'english_only_math');
  assert.ok(mathCheck.enforcedReason?.includes('strictly in English'));

  const sciCheck = enforcePresentationLanguagePolicy('Science', 'bilingual_en_hi');
  assert.equal(sciCheck.effectiveMode, 'bilingual_en_hi');
});

test('Audit detects text-heavy & missing diagram issues and NotebookLM export/import strips Hindi from Math slides', () => {
  const audit = auditExistingPresentation({
    resource: MATH_RES,
    originalSlideCount: 14,
    avgWordsPerSlide: 82,
    visualCoveragePct: 20,
    hasInteractiveChecks: false,
    hasVisualSummary: false,
    requestedLanguageMode: 'bilingual_en_hi',
    learningObjectives: ['Plot linear equations on Cartesian plane'],
  });
  assert.ok(audit.issues.some((i) => i.code === 'TEXT_HEAVY'));
  assert.ok(audit.issues.some((i) => i.code === 'MISSING_DIAGRAM'));
  assert.ok(audit.issues.some((i) => i.code === 'LANGUAGE_POLICY_MISMATCH'));
  assert.equal(audit.languageMode, 'english_only_math');

  const brief = buildNotebookLmSourceBrief(audit, MATH_RES.contentSummary);
  assert.ok(brief.includes('STRICT ENGLISH ONLY'));

  const imported = parseNotebookLmStoryboardJson({
    subject: 'Mathematics',
    requestedLanguageMode: 'bilingual_en_hi',
    rawJson: JSON.stringify({
      redesignedTitle: 'Visual Linear Equations',
      slides: [
        {
          title: 'Slope & Intercept Map',
          hindiTitle: 'यह हटना चाहिए',
          template: 'concept_mind_map',
          keyTakeaway: 'Every linear equation forms a straight line.',
          visualNodes: [{ label: 'ax + by + c = 0', detail: 'Standard form' }],
        },
      ],
    }),
  });
  assert.equal(imported.ok, true);
  if (imported.ok) {
    assert.equal(imported.effectiveLanguageMode, 'english_only_math');
    assert.equal(imported.slides[0].hindiTitle, undefined);
  }
});
