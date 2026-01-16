import { Request, Response } from 'express';
import { statsService } from '../services/stats.service';
import { PeriodFilter } from '../types/stats.types';

/**
 * Stats Controller
 *
 * Handles HTTP requests for statistics endpoints
 */
export class StatsController {
  /**
   * GET /api/tipsters/:id/stats?period=30d
   *
   * Get tipster statistics
   */
  async getTipsterStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const period = (req.query.period as PeriodFilter) || 'all';

      // Validate period
      const validPeriods: PeriodFilter[] = ['all', '7d', '30d', '90d', 'year'];
      if (!validPeriods.includes(period)) {
        res.status(400).json({ error: 'Invalid period parameter' });
        return;
      }

      const stats = await statsService.calculateTipsterStats(id, period);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch stats' });
    }
  }

  /**
   * GET /api/stats/top-performers?period=30d&limit=3
   *
   * Get top performing tipsters
   */
  async getTopPerformers(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as PeriodFilter) || '30d';
      const limit = parseInt(req.query.limit as string) || 3;

      // Validate period
      const validPeriods: PeriodFilter[] = ['all', '7d', '30d', '90d', 'year'];
      if (!validPeriods.includes(period)) {
        res.status(400).json({ error: 'Invalid period parameter' });
        return;
      }

      // Validate limit
      if (limit < 1 || limit > 10) {
        res.status(400).json({ error: 'Limit must be between 1 and 10' });
        return;
      }

      const topPerformers = await statsService.getTopPerformers(period, limit);
      res.json(topPerformers);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || 'Failed to fetch top performers' });
    }
  }
}

// Export singleton instance
export const statsController = new StatsController();
