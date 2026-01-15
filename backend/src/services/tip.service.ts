import { db } from '../lib/db';
import { CreateTipDto, UpdateTipDto, TipResponse, TipWithTipster } from '../types/tip.types';

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

    // Create the tip
    const tip = await db.tip.create({
      data: {
        tipsterId: tipster.id,
        event: data.event,
        prediction: data.prediction,
        odds: data.odds,
        explanation: data.explanation,
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

    // Update the tip
    const updatedTip = await db.tip.update({
      where: { id: tipId },
      data: {
        event: data.event,
        prediction: data.prediction,
        odds: data.odds,
        explanation: data.explanation,
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
}

// Export a singleton instance
export const tipService = new TipService();
