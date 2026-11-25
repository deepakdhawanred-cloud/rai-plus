import type {
  CognitiveCategory,
  CognitiveGameDefinition,
  CognitiveGamePhase,
} from '../types';

export type IntelligenceShellCategory =
  | 'Attention'
  | 'Memory'
  | 'Perception'
  | 'Logical Thinking'
  | 'Response Control';

export interface ShellCategoryDefinition {
  id: IntelligenceShellCategory;
  label: string;
  subtitle: string;
  focusArea: string;
  mappedCategories: CognitiveCategory[];
}

export const INTELLIGENCE_SHELL_CATEGORIES: ShellCategoryDefinition[] = [
  {
    id: 'Attention',
    label: 'Attention',
    subtitle: 'Focus, observation and concentration',
    focusArea: 'Sustained focus & selective visual scanning',
    mappedCategories: ['Visual Attention'],
  },
  {
    id: 'Memory',
    label: 'Memory',
    subtitle: 'Working, visual and auditory memory',
    focusArea: 'Short-term recall, sequence span & retrieval',
    mappedCategories: ['Memory Training'],
  },
  {
    id: 'Perception',
    label: 'Perception',
    subtitle: 'Visual discrimination and spatial awareness',
    focusArea: 'Mental rotation, mirror reflection & patterns',
    mappedCategories: ['Perception Training'],
  },
  {
    id: 'Logical Thinking',
    label: 'Logical Thinking',
    subtitle: 'Reasoning, patterns, planning & adaptability',
    focusArea: 'Deduction, multi-step planning & rule switching',
    mappedCategories: ['Logical Thinking', 'Cognitive Flexibility'],
  },
  {
    id: 'Response Control',
    label: 'Response Control',
    subtitle: 'Impulse control and selective attention',
    focusArea: 'Inhibition, reaction timing & accuracy under rules',
    mappedCategories: ['Response Control'],
  },
];

export function mapGameToShellCategory(
  category: CognitiveCategory,
): IntelligenceShellCategory {
  const match = INTELLIGENCE_SHELL_CATEGORIES.find((item) =>
    item.mappedCategories.includes(category),
  );
  return match ? match.id : 'Logical Thinking';
}

export interface ShellCategorySummary extends ShellCategoryDefinition {
  gameCount: number;
}

export function getShellCategorySummaries(
  games: CognitiveGameDefinition[],
): ShellCategorySummary[] {
  return INTELLIGENCE_SHELL_CATEGORIES.map((cat) => ({
    ...cat,
    gameCount: games.filter((g) => mapGameToShellCategory(g.category) === cat.id).length,
  }));
}

export interface FilterShellGamesOptions {
  category?: IntelligenceShellCategory | 'All';
  phase?: CognitiveGamePhase | 'All';
  query?: string;
}

export function filterShellGames(
  games: CognitiveGameDefinition[],
  options: FilterShellGamesOptions = {},
): CognitiveGameDefinition[] {
  const { category = 'All', phase = 'All', query = '' } = options;
  const normalizedQuery = query.trim().toLowerCase();

  return games.filter((game) => {
    if (category !== 'All' && mapGameToShellCategory(game.category) !== category) {
      return false;
    }
    if (phase !== 'All' && game.phase !== phase) {
      return false;
    }
    if (normalizedQuery) {
      const searchable = [
        game.title,
        game.titleHi,
        game.shortDesc,
        game.category,
        mapGameToShellCategory(game.category),
        ...game.develops,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}
