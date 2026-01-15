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
   * Create a new tip
   *
   * @param data - The tip data
   * @returns The created tip
   * @throws Error if tipster doesn't exist or validation fails
   */
  async createTip(data: CreateTipDto): Promise<TipResponse> {
    // Validate that the tipster exists
    const tipster = await db.tipster.findUnique({
      where: { id: data.tipsterId },
    });

    if (!tipster) {
      throw new Error(`Tipster with id ${data.tipsterId} not found`);
    }

    // Validate odds (must be positive)
    if (data.odds <= 0) {
      throw new Error('Odds must be greater than 0');
    }

    // Create the tip
    const tip = await db.tip.create({
      data: {
        tipsterId: data.tipsterId,
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
