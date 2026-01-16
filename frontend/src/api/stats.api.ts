import apiClient from './client';
import { TipsterStats, PeriodFilter, TopPerformer } from '../types/stats.types';

/**
 * Stats API endpoints
 */
export const statsApi = {
  /**
   * Get tipster statistics
   * @param tipsterId - Tipster ID
   * @param period - Time period filter
   */
  async getTipsterStats(
    tipsterId: string,
    period: PeriodFilter = 'all'
  ): Promise<TipsterStats> {
    const response = await apiClient.get<TipsterStats>(
      `/tipsters/${tipsterId}/stats`,
      {
        params: { period },
      }
    );
    return response.data;
  },

  /**
   * Get top performing tipsters
   * @param period - Time period filter
   * @param limit - Number of top performers to return
   */
  async getTopPerformers(
    period: PeriodFilter = '30d',
    limit: number = 3
  ): Promise<TopPerformer[]> {
    const response = await apiClient.get<TopPerformer[]>(
      '/stats/top-performers',
      {
        params: { period, limit },
      }
    );
    return response.data;
  },
};
