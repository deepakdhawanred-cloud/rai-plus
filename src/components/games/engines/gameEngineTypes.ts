export interface GameRoundResult {
  accuracyPct: number;
  completionTimeSec: number;
  reactionTimeMs: number | null;
  errorCount: number;
  scorePoints: number;
  completed: boolean;
  summaryDetail: string;
}

export interface PlayableEngineProps {
  gameId: string;
  level: 1 | 2 | 3 | 4 | 5;
  lang: 'en' | 'hi';
  onHudUpdate: (hud: { progressText: string; score: number; errors: number }) => void;
  onFinish: (result: GameRoundResult) => void;
}
