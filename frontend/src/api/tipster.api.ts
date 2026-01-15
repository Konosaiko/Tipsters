import apiClient from './client';
import {
  CreateTipsterDto,
  UpdateTipsterDto,
  Tipster,
  TipsterWithDetails,
} from '../types/tipster.types';

/**
 * Tipster API endpoints
 */
export const tipsterApi = {
  /**
   * Create a tipster profile (requires auth)
   */
  async createTipster(data: CreateTipsterDto): Promise<Tipster> {
    const response = await apiClient.post<Tipster>('/tipsters', data);
    return response.data;
  },

  /**
   * Get all tipsters (public)
   */
  async getAllTipsters(): Promise<TipsterWithDetails[]> {
    const response = await apiClient.get<TipsterWithDetails[]>('/tipsters');
    return response.data;
  },

  /**
   * Get a tipster by ID (public)
   */
  async getTipsterById(id: string): Promise<TipsterWithDetails> {
    const response = await apiClient.get<TipsterWithDetails>(`/tipsters/${id}`);
    return response.data;
  },

  /**
   * Get current user's tipster profile (requires auth)
   */
  async getMyTipsterProfile(): Promise<Tipster> {
    const response = await apiClient.get<Tipster>('/tipsters/me/profile');
    return response.data;
  },

  /**
   * Update a tipster profile (requires auth, owner only)
   */
  async updateTipster(id: string, data: UpdateTipsterDto): Promise<Tipster> {
    const response = await apiClient.patch<Tipster>(`/tipsters/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tipster profile (requires auth, owner only)
   */
  async deleteTipster(id: string): Promise<void> {
    await apiClient.delete(`/tipsters/${id}`);
  },
};
