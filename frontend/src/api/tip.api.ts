import apiClient from './client';
import {
  CreateTipDto,
  UpdateTipDto,
  Tip,
  TipWithTipster,
  MarkTipResultDto,
  TipResult,
} from '../types/tip.types';

/**
 * Tip API endpoints
 */
export const tipApi = {
  /**
   * Create a new tip (requires auth, tipster only)
   */
  async createTip(data: CreateTipDto): Promise<Tip> {
    const response = await apiClient.post<Tip>('/tips', data);
    return response.data;
  },

  /**
   * Get all tips (public)
   * Returns tips with tipster information
   */
  async getAllTips(): Promise<TipWithTipster[]> {
    const response = await apiClient.get<TipWithTipster[]>('/tips');
    return response.data;
  },

  /**
   * Get a tip by ID (public)
   */
  async getTipById(id: string): Promise<Tip> {
    const response = await apiClient.get<Tip>(`/tips/${id}`);
    return response.data;
  },

  /**
   * Update a tip (requires auth, owner only)
   * Note: This endpoint needs to be added to backend
   */
  async updateTip(id: string, data: UpdateTipDto): Promise<Tip> {
    const response = await apiClient.patch<Tip>(`/tips/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tip (requires auth, owner only)
   */
  async deleteTip(id: string): Promise<void> {
    await apiClient.delete(`/tips/${id}`);
  },

  /**
   * Mark a tip result (requires auth, owner only)
   */
  async markTipResult(id: string, result: TipResult): Promise<Tip> {
    const response = await apiClient.patch<Tip>(`/tips/${id}/result`, {
      result,
    });
    return response.data;
  },
};
