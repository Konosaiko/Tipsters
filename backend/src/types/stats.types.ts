/**
 * Tipster statistics response
 */
export interface TipsterStats {
  // Counts
  totalTips: number;
  settledTips: number;
  pendingTips: number;
  wonTips: number;
  lostTips: number;
  voidTips: number;

  // Performance metrics
  winRate: number; // percentage (0-100)
  roi: number; // return on investment percentage (can be negative)
  profit: number; // profit/loss in units
  averageOdds: number;
  yield: number; // profit per tip

  // Streaks
  longestWinStreak: number;
  longestLoseStreak: number;
}

/**
 * Period filter for stats calculation
 */
export type PeriodFilter = 'all' | '7d' | '30d' | '90d' | 'year';

/**
 * Top performer data
 */
export interface TopPerformer {
  tipsterId: string;
  displayName: string;
  username: string;
  roi: number;
  winRate: number;
  totalTips: number;
  settledTips: number;
}
