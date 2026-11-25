import React, { useMemo, useState } from 'react';
import {
  Brain,
  Eye,
  Gamepad2,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import type { CognitiveGameDefinition, CognitiveGamePhase } from '../types';
import { AGE_WISE_LEVEL_BANDS, getCognitiveGamesCatalog } from '../utils/cognitiveGamesCatalog';
import {
  filterShellGames,
  getShellCategorySummaries,
  mapGameToShellCategory,
  type IntelligenceShellCategory,
} from '../utils/intelligenceGamesShell';
import { GameThumbnailGraphic } from './games/GameThumbnailGraphic';

export interface IntelligenceGamesProps {
  games?: CognitiveGameDefinition[];
  lang?: 'en' | 'hi';
  isReadOnly?: boolean;
  title?: string;
  subtitle?: string;
  adaptiveLevelForGame?: (game: CognitiveGameDefinition) => 1 | 2 | 3 | 4 | 5;
  bestAccuracyForGame?: (game: CognitiveGameDefinition) => number | null;
  onLaunchGame?: (game: CognitiveGameDefinition) => void;
}

const CATEGORY_ICONS: Record<
  IntelligenceShellCategory,
  React.ComponentType<{ className?: string }>
> = {
  Attention: Eye,
  Memory: Sparkles,
  Perception: Brain,
  'Logical Thinking': Lightbulb,
  'Response Control': Timer,
};

export const IntelligenceGames: React.FC<IntelligenceGamesProps> = ({
  games,
  lang = 'en',
  isReadOnly = false,
  title = 'Intelligence Games Catalogue',
  subtitle = 'Structured cognitive practice across Attention, Memory, Perception, Logical Thinking, and Response Control.',
  adaptiveLevelForGame,
  bestAccuracyForGame,
  onLaunchGame,
}) => {
  const catalog = useMemo(() => games ?? getCognitiveGamesCatalog(), [games]);

  const [selectedCategory, setSelectedCategory] = useState<IntelligenceShellCategory | 'All'>(
    'All',
  );
  const [phaseFilter, setPhaseFilter] = useState<CognitiveGamePhase | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedGame, setInspectedGame] = useState<CognitiveGameDefinition | null>(null);

  const categorySummaries = useMemo(() => getShellCategorySummaries(catalog), [catalog]);

  const filteredGames = useMemo(
    () =>
      filterShellGames(catalog, {
        category: selectedCategory,
        phase: phaseFilter,
        query: searchQuery,
      }),
    [catalog, selectedCategory, phaseFilter, searchQuery],
  );

  function handleResetFilters() {
    setSelectedCategory('All');
    setPhaseFilter('All');
    setSearchQuery('');
  }

  return (
    <section className="space-y-5" aria-label="Intelligence Games Catalogue">
      {/* Section Header & Search/Phase Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-900 shrink-0" />
            <span>
              {title}{' '}
              <span className="font-mono text-sm font-semibold text-slate-500 tabular-nums">
                ({filteredGames.length} of {catalog.length})
              </span>
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search cognitive games"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games or skills..."
              className="rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 w-52 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
            />
          </div>

          <select
            aria-label="Filter by rollout phase"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as CognitiveGamePhase | 'All')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            <option value="All">All Rollout Phases</option>
            <option value="Phase 1 · Core">Phase 1 · Core</option>
            <option value="Phase 2 · Advanced">Phase 2 · Advanced</option>
            <option value="Phase 3 · Adaptive">Phase 3 · Adaptive</option>
          </select>
        </div>
      </div>

      {/* Five Core Category Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {categorySummaries.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                setSelectedCategory((prev) => (prev === cat.id ? 'All' : cat.id))
              }
              className={`text-left rounded-xl border p-4 transition-colors flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'border-blue-900 bg-blue-50/70 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-blue-900' : 'text-slate-600'
                    }`}
                  />
                  <span>{cat.label}</span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-500 tabular-nums whitespace-nowrap">
                  {cat.gameCount} games
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{cat.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Quick Category Segmented Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1.5">
        <button
          type="button"
          aria-pressed={selectedCategory === 'All'}
          onClick={() => setSelectedCategory('All')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === 'All'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Categories ({catalog.length})
        </button>
        {categorySummaries.map((cat) => (
          <button
            key={cat.id}
            type="button"
            aria-pressed={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label} ({cat.gameCount})
          </button>
        ))}
      </div>

      {/* Catalogue Grid or Empty State */}
      {filteredGames.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center space-y-3">
          <p className="font-display text-sm font-bold text-slate-900">
            No matching games found in the catalogue
          </p>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Try clearing your search term or switching back to all cognitive categories and rollout
            phases.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => {
            const shellCategory = mapGameToShellCategory(game.category);
            const level = adaptiveLevelForGame ? adaptiveLevelForGame(game) : 3;
            const bestAcc = bestAccuracyForGame ? bestAccuracyForGame(game) : null;

            return (
              <article
                key={game.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-4 hover:border-blue-300 transition-colors"
              >
                <div className="space-y-3">
                  <GameThumbnailGraphic gameId={game.id} category={game.category} />

                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      #{game.catalogNumber} · {shellCategory} · {game.phase}
                    </p>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {lang === 'hi' ? `${game.title} (${game.titleHi})` : game.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{game.shortDesc}</p>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2.5">
                    <p>
                      <span className="font-semibold text-slate-700">Develops:</span>{' '}
                      {game.develops.join(', ')}
                    </p>
                    <p>
                      <span className="font-semibold text-slate-700">Measures:</span>{' '}
                      {game.measurements.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="font-mono text-[11px] text-slate-600 tabular-nums">
                    <span>Level {level}</span>
                    {bestAcc !== null && <span> · Best {bestAcc}%</span>}
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        onLaunchGame ? onLaunchGame(game) : setInspectedGame(game)
                      }
                      aria-label={
                        onLaunchGame
                          ? `Play ${game.title}`
                          : `View details for ${game.title}`
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {onLaunchGame ? 'Play Game' : 'View Details'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Standalone Specification Drawer / Modal when onLaunchGame is not supplied */}
      {inspectedGame && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspected-game-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  #{inspectedGame.catalogNumber} · {mapGameToShellCategory(inspectedGame.category)} ·{' '}
                  {inspectedGame.phase}
                </p>
                <h3
                  id="inspected-game-title"
                  className="font-display text-lg font-bold text-slate-900 mt-0.5"
                >
                  {inspectedGame.title} ({inspectedGame.titleHi})
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close game specification"
                onClick={() => setInspectedGame(null)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>{lang === 'hi' ? inspectedGame.instructionsHi : inspectedGame.instructionsEn}</p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                <p>
                  <span className="font-semibold text-slate-900">Skills Developed:</span>{' '}
                  {inspectedGame.develops.join(', ')}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Practice Metrics:</span>{' '}
                  {inspectedGame.measurements.join(', ')}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Supported Bands:</span>{' '}
                  {AGE_WISE_LEVEL_BANDS.map((b) => `L${b.level} (${b.ageBand})`).join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectedGame(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default IntelligenceGames;
