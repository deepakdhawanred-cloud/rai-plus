import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUICK_REVISE_CLASSES,
  QUICK_REVISION_GAMES,
  getChapterQuestsForClass,
  getGamesForClass,
  getSubjectsForQuickReviseClass,
} from './quickRevisionGamesCatalog.ts';

test('Quick Revise catalog covers every Class 1 through 12 with multiple subjects', () => {
  for (const cls of QUICK_REVISE_CLASSES) {
    const games = getGamesForClass(cls);
    const subjects = getSubjectsForQuickReviseClass(cls);
    assert.ok(games.length >= 4, `Class ${cls} should have at least 4 games (found ${games.length})`);
    assert.ok(
      subjects.length >= 3,
      `Class ${cls} should cover at least 3 subjects (found ${subjects.join(', ')})`,
    );
  }
});

test('Quick Revise catalog preserves all 23 original games from quick-revision-games.html', () => {
  const originalIds = [
    'c6-food-plate',
    'c6-deficiency',
    'c6-fractions',
    'c6-odd',
    'c6-pos',
    'c7-digestion',
    'c7-acid-base',
    'c7-heat',
    'c8-microbes',
    'c8-crops',
    'c8-metals',
    'c9-plant-cell',
    'c9-matter',
    'c9-numbers',
    'c10-food-chain',
    'c10-reflex',
    'c10-reactions',
    'c10-flower',
    'c10-resources',
    'c11-kingdoms',
    'c11-vectors',
    'c12-em',
    'c12-biotech',
  ];
  const catalogIds = new Set(QUICK_REVISION_GAMES.map((g) => g.id));
  for (const id of originalIds) {
    assert.ok(catalogIds.has(id), `Missing original game id: ${id}`);
  }
});

test('Every Quick Revise game has unique ID and valid engine-specific structure', () => {
  const seen = new Set<string>();
  const typesPresent = new Set<string>();

  for (const game of QUICK_REVISION_GAMES) {
    assert.ok(!seen.has(game.id), `Duplicate game id: ${game.id}`);
    seen.add(game.id);
    typesPresent.add(game.type);
    assert.ok(game.ideas.length >= 2, `Game ${game.id} should have at least 2 remember ideas`);

    if (game.type === 'platter') {
      assert.ok(game.rounds.length >= 2, `Platter game ${game.id} needs >= 2 rounds`);
      for (const r of game.rounds) {
        assert.ok(game.tagNames[r.tag], `Missing tagName for ${r.tag} in ${game.id}`);
        const matches = game.items.filter((i) => i.tags.includes(r.tag));
        assert.ok(matches.length >= 2, `Round ${r.tag} in ${game.id} has too few matching items`);
      }
    } else if (game.type === 'bins') {
      const binIds = new Set(game.bins.map((b) => b.id));
      assert.ok(game.bins.length >= 2 && game.bins.length <= 5, `Bins count invalid in ${game.id}`);
      for (const item of game.items) {
        assert.ok(binIds.has(item.bin), `Item bin "${item.bin}" not found in ${game.id}`);
      }
    } else if (game.type === 'sequence') {
      assert.ok(game.items.length >= 4, `Sequence ${game.id} should have >= 4 steps`);
    } else if (game.type === 'label') {
      assert.ok(game.svg.length > 50, `Label game ${game.id} must have SVG markup`);
      assert.ok(game.spots.length >= 4, `Label game ${game.id} should have >= 4 hotspots`);
    } else if (game.type === 'pairs') {
      assert.ok(game.pairs.length >= 5, `Pairs game ${game.id} should have >= 5 pairs`);
    } else if (game.type === 'odd') {
      assert.ok(game.rounds.length >= 4, `Odd game ${game.id} should have >= 4 rounds`);
      for (const r of game.rounds) {
        assert.equal(r.items.length, 4, `Odd round in ${game.id} must have 4 items`);
        assert.ok(r.odd >= 0 && r.odd < 4, `Odd index out of range in ${game.id}`);
      }
    }
  }

  for (const expectedType of ['platter', 'bins', 'sequence', 'label', 'pairs', 'odd']) {
    assert.ok(typesPresent.has(expectedType), `Engine type ${expectedType} missing from catalog`);
  }
});

test('Chapter bundling combines multi-topic games for full-chapter revision', () => {
  const c6ScienceChapters = getChapterQuestsForClass(6, 'Science');
  const foodChapter = c6ScienceChapters.find((c) => c.chapter === 'Components of Food');
  assert.ok(foodChapter, 'Class 6 Components of Food chapter bundle should exist');
  assert.equal(
    foodChapter.games.length,
    3,
    'Components of Food should bundle Build the Plate + Missing Nutrient + Food Test Lab',
  );
  assert.ok(foodChapter.rememberHighlights.length >= 5);
});
