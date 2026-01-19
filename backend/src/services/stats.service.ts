import { db } from '../lib/db';
import { TipsterStats, PeriodFilter, TopPerformer } from '../types/stats.types';
import { TipResult } from '../types/tip.types';

/**
 * Stats Service
 *
 * Calculates tipster performance statistics
 */
export class StatsService {
  /**
   * Calculate tipster statistics for a given period
   *
   * @param tipsterId - The tipster ID
   * @param period - Time period filter
   * @returns Calculated statistics
   */
  async calculateTipsterStats(
    tipsterId: string,
    period: PeriodFilter = 'all'
  ): Promise<TipsterStats> {
    // Get date filter based on period
    const dateFilter = this.getDateFilter(period);

    // Fetch all tips for this tipster within the period
    const tips = await db.tip.findMany({
      where: {
        tipsterId,
        ...(dateFilter && { createdAt: { gte: dateFilter } }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate counts
    const totalTips = tips.length;
    const settledTips = tips.filter((t) => t.result !== null).length;
    const pendingTips = tips.filter((t) => t.result === null).length;
    const wonTips = tips.filter((t) => t.result === TipResult.WON).length;
    const lostTips = tips.filter((t) => t.result === TipResult.LOST).length;
    const voidTips = tips.filter((t) => t.result === TipResult.VOID).length;

    // Calculate performance metrics
    const winRate = this.calculateWinRate(wonTips, settledTips - voidTips); // Exclude void from win rate
    const { roi, profit } = this.calculateROI(tips);
    const averageOdds = this.calculateAverageOdds(tips);
    const yieldValue = totalTips > 0 ? profit / totalTips : 0;
    const safeYield = isNaN(yieldValue) ? 0 : yieldValue;

    // Calculate streaks
    const { win: longestWinStreak, lose: longestLoseStreak } =
      this.calculateStreaks(tips);

    return {
      totalTips,
      settledTips,
      pendingTips,
      wonTips,
      lostTips,
      voidTips,
      winRate,
      roi,
      profit,
      averageOdds,
      yield: safeYield,
      longestWinStreak,
      longestLoseStreak,
    };
  }

  /**
   * Get top performing tipsters for a given period
   *
   * @param period - Time period filter
   * @param limit - Number of top performers to return
   * @returns Top performers list
   */
  async getTopPerformers(
    period: PeriodFilter = '30d',
    limit: number = 3
  ): Promise<TopPerformer[]> {
    const dateFilter = this.getDateFilter(period);

    // Get all tipsters
    const tipsters = await db.tipster.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        tips: {
          where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
        },
      },
    });

    // Calculate stats for each tipster
    const tipstersWithStats = tipsters
      .map((tipster) => {
        const tips = tipster.tips;
        const settledTips = tips.filter((t) => t.result !== null).length;
        const wonTips = tips.filter((t) => t.result === TipResult.WON).length;
        const voidTips = tips.filter((t) => t.result === TipResult.VOID).length;

        // Only include tipsters with at least 5 settled tips
        if (settledTips < 5) {
          return null;
        }

        const winRate = this.calculateWinRate(wonTips, settledTips - voidTips);
        const { roi } = this.calculateROI(tips);

        return {
          tipsterId: tipster.id,
          displayName: tipster.displayName,
          username: tipster.user.username,
          roi,
          winRate,
          totalTips: tips.length,
          settledTips,
        };
      })
      .filter((t): t is TopPerformer => t !== null);

    // Sort by ROI descending and return top N
    return tipstersWithStats
      .sort((a, b) => b.roi - a.roi)
      .slice(0, limit);
  }

  /**
   * Get date filter based on period
   */
  private getDateFilter(period: PeriodFilter): Date | null {
    const now = new Date();

    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
      case 'all':
      default:
        return null;
    }
  }

  /**
   * Calculate win rate percentage
   */
  private calculateWinRate(won: number, totalExcludingVoid: number): number {
    if (totalExcludingVoid === 0) return 0;
    return Math.round((won / totalExcludingVoid) * 10000) / 100; // 2 decimal places
  }

  /**
   * Calculate ROI and profit
   */
  private calculateROI(tips: any[]): { roi: number; profit: number } {
    let totalStake = 0;
    let totalReturns = 0;

    tips.forEach((tip) => {
      if (tip.result === null) return; // Skip pending tips

      const stake = tip.stake ?? 1; // Default to 1 if null
      totalStake += stake;

      if (tip.result === TipResult.WON) {
        totalReturns += stake * tip.odds; // Stake * odds for wins
      } else if (tip.result === TipResult.VOID) {
        totalReturns += stake; // Return stake for void
      }
      // Lost tips contribute 0 to returns
    });

    const profit = totalReturns - totalStake;
    const roi = totalStake > 0 ? (profit / totalStake) * 100 : 0;

    // Ensure we never return NaN or null
    return {
      roi: isNaN(roi) ? 0 : Math.round(roi * 100) / 100, // 2 decimal places
      profit: isNaN(profit) ? 0 : Math.round(profit * 100) / 100, // 2 decimal places
    };
  }

  /**
   * Calculate average odds across all tips
   */
  private calculateAverageOdds(tips: any[]): number {
    if (tips.length === 0) return 0;

    const totalOdds = tips.reduce((sum, tip) => sum + (tip.odds ?? 0), 0);
    const average = totalOdds / tips.length;
    return isNaN(average) ? 0 : Math.round(average * 100) / 100; // 2 decimal places
  }

  /**
   * Calculate longest winning and losing streaks
   */
  private calculateStreaks(tips: any[]): {
    win: number;
    lose: number;
  } {
    // Filter only settled tips and sort by date ascending
    const settledTips = tips
      .filter((t) => t.result !== null && t.result !== TipResult.VOID)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (settledTips.length === 0) {
      return { win: 0, lose: 0 };
    }

    let maxWinStreak = 0;
    let maxLoseStreak = 0;
    let currentWinStreak = 0;
    let currentLoseStreak = 0;

    settledTips.forEach((tip) => {
      if (tip.result === TipResult.WON) {
        currentWinStreak++;
        currentLoseStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
      } else if (tip.result === TipResult.LOST) {
        currentLoseStreak++;
        currentWinStreak = 0;
        maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
      }
    });

    return {
      win: maxWinStreak,
      lose: maxLoseStreak,
    };
  }
}

// Export singleton instance
export const statsService = new StatsService();
