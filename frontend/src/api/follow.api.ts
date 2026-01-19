import { apiClient } from './client';

/**
 * Follow API Client
 *
 * Handles all HTTP requests related to following tipsters
 */
export const followApi = {
  /**
   * Follow a tipster
   *
   * @param tipsterId - The tipster ID to follow
   */
  async followTipster(tipsterId: string): Promise<void> {
    await apiClient.post(`/follow/${tipsterId}`);
  },

  /**
   * Unfollow a tipster
   *
   * @param tipsterId - The tipster ID to unfollow
   */
  async unfollowTipster(tipsterId: string): Promise<void> {
    await apiClient.delete(`/follow/${tipsterId}`);
  },

  /**
   * Get list of followed tipster IDs
   *
   * @returns Array of tipster IDs
   */
  async getFollowedTipsters(): Promise<{ tipsterIds: string[] }> {
    const response = await apiClient.get<{ tipsterIds: string[] }>('/follow');
    return response.data;
  },

  /**
   * Check if following a specific tipster
   *
   * @param tipsterId - The tipster ID
   * @returns Whether currently following
   */
  async checkFollowStatus(tipsterId: string): Promise<{ isFollowing: boolean }> {
    const response = await apiClient.get<{ isFollowing: boolean }>(
      `/follow/${tipsterId}/status`
    );
    return response.data;
  },
};
