import test from 'node:test';
import assert from 'node:assert/strict';
import { getCognitiveGamesCatalog } from './cognitiveGamesCatalog';
import {
  INTELLIGENCE_SHELL_CATEGORIES,
  filterShellGames,
  getShellCategorySummaries,
  mapGameToShellCategory,
} from './intelligenceGamesShell';

test('IntelligenceGames shell exposes the 5 canonical cognitive categories in order', () => {
  assert.deepEqual(
    INTELLIGENCE_SHELL_CATEGORIES.map((c) => c.id),
    ['Attention', 'Memory', 'Perception', 'Logical Thinking', 'Response Control'],
  );
});

test('all catalogue games map cleanly into the 5 shell categories with non-zero counts', () => {
  const catalog = getCognitiveGamesCatalog();
  const summaries = getShellCategorySummaries(catalog);

  for (const summary of summaries) {
    assert.ok(summary.gameCount > 0, `Expected non-zero count for ${summary.id}`);
  }

  const totalCount = summaries.reduce((sum, s) => sum + s.gameCount, 0);
  assert.equal(totalCount, catalog.length);
  assert.equal(mapGameToShellCategory('Visual Attention'), 'Attention');
  assert.equal(mapGameToShellCategory('Memory Training'), 'Memory');
  assert.equal(mapGameToShellCategory('Perception Training'), 'Perception');
  assert.equal(mapGameToShellCategory('Logical Thinking'), 'Logical Thinking');
  assert.equal(mapGameToShellCategory('Cognitive Flexibility'), 'Logical Thinking');
  assert.equal(mapGameToShellCategory('Response Control'), 'Response Control');
});

test('filterShellGames filters deterministically by category, phase, and search query', () => {
  const catalog = getCognitiveGamesCatalog();

  const attentionGames = filterShellGames(catalog, { category: 'Attention' });
  assert.equal(attentionGames.length, 6);
  assert.ok(attentionGames.every((g) => g.category === 'Visual Attention'));

  const responseControlGames = filterShellGames(catalog, { category: 'Response Control' });
  assert.equal(responseControlGames.length, 4);

  const coreMemoryGames = filterShellGames(catalog, {
    category: 'Memory',
    phase: 'Phase 1 · Core',
  });
  assert.deepEqual(
    coreMemoryGames.map((g) => g.id),
    ['memory-match', 'sequence-recall', 'phonics-sound-match'],
  );

  const searchMatches = filterShellGames(catalog, { query: 'sudoku' });
  assert.equal(searchMatches.length, 1);
  assert.equal(searchMatches[0].id, 'sudoku-challenge');
});
