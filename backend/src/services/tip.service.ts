import { db } from '../lib/db';
import { CreateTipDto, TipResponse } from '../types/tip.types';

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
   * @returns Array of all tips, ordered by creation date (newest first)
   */
  async getAllTips(): Promise<TipResponse[]> {
    const tips = await db.tip.findMany({
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
}

// Export a singleton instance
export const tipService = new TipService();
