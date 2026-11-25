import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FLOWCHART_CANVAS,
  MINDMAP_CANVAS,
  clampZoomLevel,
  computeFlowchartLayout,
  computeMindmapLayout,
  normalizeAiChapterVisualPayload,
  truncateLabel,
} from './knowledgeVisualGraph';
import {
  generateChapterVisualStudyPack,
  getChaptersForClassSubject,
} from './chapterVisualStudyEngine';

test('computes clean non-overlapping edge-to-edge SVG mindmap coordinates', () => {
  const chapter = getChaptersForClassSubject(10, 'Science')[0];
  const pack = generateChapterVisualStudyPack(chapter);
  const layout = computeMindmapLayout(pack.mindmap.branches);

  assert.equal(layout.length, 5);
  for (const node of layout) {
    assert.ok(node.x >= 0 && node.x + node.width <= MINDMAP_CANVAS.width);
    assert.ok(node.y >= 0 && node.y + node.height <= MINDMAP_CANVAS.height);
    assert.ok(node.pathD.startsWith('M '), 'Connector path should be a valid SVG Bezier path');
    if (node.align === 'left') {
      assert.equal(node.anchorPoint.x, node.x + node.width);
    } else {
      assert.equal(node.anchorPoint.x, node.x);
    }
  }
});

test('computes sequential connected SVG flowchart layout with connectors between stages', () => {
  const chapter = getChaptersForClassSubject(12, 'Physics')[1];
  const pack = generateChapterVisualStudyPack(chapter);
  const { nodes, totalHeight } = computeFlowchartLayout(pack.flowchart);

  assert.equal(nodes.length, 5);
  assert.ok(totalHeight > FLOWCHART_CANVAS.nodeHeight * 5);

  for (let i = 0; i < nodes.length; i++) {
    if (i < nodes.length - 1) {
      assert.ok(nodes[i].connectorPathD, `Stage ${i + 1} should connect to Stage ${i + 2}`);
      assert.ok(nodes[i + 1].topY > nodes[i].bottomY, 'Stages must not vertically overlap');
    } else {
      assert.equal(nodes[i].connectorPathD, null, 'Final stage has no outgoing connector');
    }
  }
});

test('normalizes partial or full Gemini AI visual JSON payload cleanly against schema defaults', () => {
  const chapter = getChaptersForClassSubject(10, 'Mathematics')[2];
  const pack = generateChapterVisualStudyPack(chapter);

  const normalized = normalizeAiChapterVisualPayload(
    {
      centralIdea: 'Quadratic equations model parabolic relationships solved via factorisation or discriminant.',
      mindmapBranches: [
        {
          title: '1. Standard Form',
          colorKey: 'blue',
          summary: 'ax^2 + bx + c = 0 where a != 0.',
          subNodes: ['Coefficients a, b, c', 'Degree 2 polynomial', 'Zeroes vs Roots'],
        },
      ],
      flowchartStages: [
        {
          title: 'Identify a, b, c',
          nodeType: 'start',
          connectorLabel: 'Compute Discriminant',
          headline: 'Rewrite in standard form first',
          details: ['Move all terms to LHS', 'Ensure a is positive'],
          keyQuestion: 'Why must a != 0?',
          quickAnswer: 'Otherwise the equation becomes linear.',
        },
      ],
      quickSummaryTakeaways: ['Always check D = b^2 - 4ac first', 'Verify roots in original equation'],
    },
    pack,
    {
      model: 'gemini-4-hydrogen',
      generatedAt: '2026-11-20T08:30:00.000Z',
      focusPrompt: 'Board exam formulas',
    },
  );

  assert.equal(normalized.chapterId, chapter.id);
  assert.equal(normalized.mindmapBranches.length, 5);
  assert.equal(normalized.mindmapBranches[0].title, '1. Standard Form');
  assert.equal(normalized.flowchartStages.length, 5);
  assert.equal(normalized.flowchartStages[0].title, 'Identify a, b, c');
  assert.equal(normalized.quickSummaryTakeaways.length, 2);
  assert.equal(normalized.focusPrompt, 'Board exam formulas');
});

test('clamps zoom levels and truncates SVG labels safely', () => {
  assert.equal(clampZoomLevel(0.2), 0.7);
  assert.equal(clampZoomLevel(1.15), 1.15);
  assert.equal(clampZoomLevel(3.0), 1.4);
  assert.equal(truncateLabel('Short', 10), 'Short');
  assert.equal(truncateLabel('Very Long Chapter Title', 10), 'Very Long…');
});
