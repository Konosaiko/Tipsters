import { db } from '../lib/db';
import {
  CreateTipDto,
  UpdateTipDto,
  TipResponse,
  TipWithTipster,
  TipResult,
  MarkTipResultDto,
} from '../types/tip.types';

/**
 * Tip Service
 *
 * Contains all business logic related to tips.
 * No HTTP concerns - pure business logic only.
 */
export class TipService {
  /**
   * Create a new tip (authenticated tipsters only)
   *
   * @param userId - The authenticated user ID
   * @param data - The tip data (without tipsterId)
   * @returns The created tip
   * @throws Error if user doesn't have a tipster profile or validation fails
   */
  async createTip(userId: string, data: Omit<CreateTipDto, 'tipsterId'>): Promise<TipResponse> {
    // Find user's tipster profile
    const tipster = await db.tipster.findUnique({
      where: { userId },
    });

    if (!tipster) {
      throw new Error('You must create a tipster profile before publishing tips');
    }

    // Validate odds (must be positive)
    if (data.odds <= 0) {
      throw new Error('Odds must be greater than 0');
    }

    // Validate stake if provided (must be positive)
    if (data.stake !== undefined && data.stake <= 0) {
      throw new Error('Stake must be greater than 0');
    }

    // Create the tip
    const tip = await db.tip.create({
      data: {
        tipsterId: tipster.id,
        event: data.event,
        prediction: data.prediction,
        odds: data.odds,
        explanation: data.explanation,
        stake: data.stake ?? 1, // Default to 1 unit if not provided
      },
    });

    return tip;
  }

  /**
   * Get all tips
   *
   * @returns Array of all tips with tipster info, ordered by creation date (newest first)
   */
  async getAllTips(): Promise<TipWithTipster[]> {
    const tips = await db.tip.findMany({
      include: {
        tipster: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tips;
  }

  /**
   * Get tips feed (for feed page)
   *
   * @param userId - Optional authenticated user ID (for filtering by followed)
   * @param filter - 'all' or 'following'
   * @returns Array of tips with tipster info, ordered by creation date (newest first)
   */
  async getTipsFeed(userId?: string, filter: 'all' | 'following' = 'all'): Promise<TipWithTipster[]> {
    // If filtering by following, we need a userId
    if (filter === 'following' && !userId) {
      return [];
    }

    // Build the where clause
    const where: any = {};

    if (filter === 'following' && userId) {
      // Get tipster IDs that the user follows
      const follows = await db.follow.findMany({
        where: { userId },
        select: { tipsterId: true },
      });

      const followedTipsterIds = follows.map((f) => f.tipsterId);

      if (followedTipsterIds.length === 0) {
        // User doesn't follow anyone
        return [];
      }

      where.tipsterId = { in: followedTipsterIds };
    }

    const tips = await db.tip.findMany({
      where,
      include: {
        tipster: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent tips for performance
    });

    return tips;
  }

  /**
   * Get a single tip by ID
   *
   * @param id - The tip ID
   * @returns The tip
   * @throws Error if tip not found
   */
  async getTipById(id: string): Promise<TipResponse> {
    const tip = await db.tip.findUnique({
      where: { id },
    });

    if (!tip) {
      throw new Error(`Tip with id ${id} not found`);
    }

    return tip;
  }

  /**
   * Update a tip (authenticated, owner only)
   *
   * @param tipId - The tip ID
   * @param userId - The authenticated user ID
   * @param data - Update data
   * @returns The updated tip
   * @throws Error if tip not found or user is not the owner
   */
  async updateTip(tipId: string, userId: string, data: UpdateTipDto): Promise<TipResponse> {
    // Find the tip with its tipster relation
    const tip = await db.tip.findUnique({
      where: { id: tipId },
      include: {
        tipster: true,
      },
    });

    if (!tip) {
      throw new Error(`Tip with id ${tipId} not found`);
    }

    // Check ownership: user must own the tipster who created this tip
    if (tip.tipster.userId !== userId) {
      throw new Error('You can only update your own tips');
    }

    // Validate odds if provided
    if (data.odds !== undefined && data.odds <= 0) {
      throw new Error('Odds must be greater than 0');
    }

    // Validate stake if provided
    if (data.stake !== undefined && data.stake <= 0) {
      throw new Error('Stake must be greater than 0');
    }

    // Update the tip
    const updatedTip = await db.tip.update({
      where: { id: tipId },
      data: {
        event: data.event,
        prediction: data.prediction,
        odds: data.odds,
        explanation: data.explanation,
        stake: data.stake,
      },
    });

    return updatedTip;
  }

  /**
   * Delete a tip (authenticated, owner only)
   *
   * @param tipId - The tip ID
   * @param userId - The authenticated user ID
   * @throws Error if tip not found or user is not the owner
   */
  async deleteTip(tipId: string, userId: string): Promise<void> {
    // Find the tip with its tipster relation
    const tip = await db.tip.findUnique({
      where: { id: tipId },
      include: {
        tipster: true,
      },
    });

    if (!tip) {
      throw new Error(`Tip with id ${tipId} not found`);
    }

    // Check ownership: user must own the tipster who created this tip
    if (tip.tipster.userId !== userId) {
      throw new Error('You can only delete your own tips');
    }

    // Delete the tip
    await db.tip.delete({
      where: { id: tipId },
    });
  }

  /**
   * Mark a tip result (authenticated, owner only)
   *
   * @param tipId - The tip ID
   * @param userId - The authenticated user ID
   * @param data - Result data
   * @returns The updated tip
   * @throws Error if tip not found, user is not the owner, or tip already settled
   */
  async markTipResult(
    tipId: string,
    userId: string,
    data: MarkTipResultDto
  ): Promise<TipResponse> {
    // Find the tip with its tipster relation
    const tip = await db.tip.findUnique({
      where: { id: tipId },
      include: {
        tipster: true,
      },
    });

    if (!tip) {
      throw new Error(`Tip with id ${tipId} not found`);
    }

    // Check ownership: user must own the tipster who created this tip
    if (tip.tipster.userId !== userId) {
      throw new Error('You can only mark results for your own tips');
    }

    // Prevent changing result if already settled
    if (tip.result !== null) {
      throw new Error('Tip result has already been marked. Cannot change result.');
    }

    // Update the tip with result
    const updatedTip = await db.tip.update({
      where: { id: tipId },
      data: {
        result: data.result,
        settledAt: new Date(),
      },
    });

    return updatedTip;
  }
}

// Export a singleton instance
export const tipService = new TipService();
