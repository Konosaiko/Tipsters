import { db } from '../lib/db';

/**
 * Follow Service
 *
 * Handles user follow/unfollow operations for tipsters
 */
export class FollowService {
  /**
   * Follow a tipster
   *
   * @param userId - The authenticated user ID
   * @param tipsterId - The tipster ID to follow
   * @throws Error if already following or tipster not found
   */
  async followTipster(userId: string, tipsterId: string): Promise<void> {
    // Check if tipster exists
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
    });

    if (!tipster) {
      throw new Error('Tipster not found');
    }

    // Check if user is trying to follow themselves
    if (tipster.userId === userId) {
      throw new Error('You cannot follow yourself');
    }

    // Check if already following
    const existing = await db.follow.findUnique({
      where: {
        userId_tipsterId: {
          userId,
          tipsterId,
        },
      },
    });

    if (existing) {
      throw new Error('Already following this tipster');
    }

    // Create follow
    await db.follow.create({
      data: {
        userId,
        tipsterId,
      },
    });
  }

  /**
   * Unfollow a tipster
   *
   * @param userId - The authenticated user ID
   * @param tipsterId - The tipster ID to unfollow
   * @throws Error if not following
   */
  async unfollowTipster(userId: string, tipsterId: string): Promise<void> {
    const follow = await db.follow.findUnique({
      where: {
        userId_tipsterId: {
          userId,
          tipsterId,
        },
      },
    });

    if (!follow) {
      throw new Error('Not following this tipster');
    }

    await db.follow.delete({
      where: {
        id: follow.id,
      },
    });
  }

  /**
   * Get all tipsters followed by a user
   *
   * @param userId - The user ID
   * @returns Array of tipster IDs
   */
  async getFollowedTipsters(userId: string): Promise<string[]> {
    const follows = await db.follow.findMany({
      where: { userId },
      select: { tipsterId: true },
    });

    return follows.map((f) => f.tipsterId);
  }

  /**
   * Check if a user is following a tipster
   *
   * @param userId - The user ID
   * @param tipsterId - The tipster ID
   * @returns true if following, false otherwise
   */
  async isFollowing(userId: string, tipsterId: string): Promise<boolean> {
    const follow = await db.follow.findUnique({
      where: {
        userId_tipsterId: {
          userId,
          tipsterId,
        },
      },
    });

    return !!follow;
  }

  /**
   * Get follower count for a tipster
   *
   * @param tipsterId - The tipster ID
   * @returns Number of followers
   */
  async getFollowerCount(tipsterId: string): Promise<number> {
    return await db.follow.count({
      where: { tipsterId },
    });
  }

  /**
   * Get follower counts for multiple tipsters
   *
   * @param tipsterIds - Array of tipster IDs
   * @returns Map of tipsterId -> follower count
   */
  async getFollowerCounts(tipsterIds: string[]): Promise<Map<string, number>> {
    const counts = await db.follow.groupBy({
      by: ['tipsterId'],
      where: {
        tipsterId: { in: tipsterIds },
      },
      _count: true,
    });

    const map = new Map<string, number>();
    counts.forEach((count) => {
      map.set(count.tipsterId, count._count);
    });

    // Add zeros for tipsters with no followers
    tipsterIds.forEach((id) => {
      if (!map.has(id)) {
        map.set(id, 0);
      }
    });

    return map;
  }
}

// Export a singleton instance
export const followService = new FollowService();
