import { db } from '../lib/db';
import { CreateTipsterDto, UpdateTipsterDto, TipsterResponse } from '../types/tipster.types';

/**
 * Tipster Service
 *
 * Handles business logic for tipster profile management.
 * A tipster is a user who publishes betting tips.
 */
export class TipsterService {
  /**
   * Create a tipster profile for a user
   *
   * @param userId - The user ID
   * @param data - Tipster profile data
   * @returns The created tipster profile
   * @throws Error if user doesn't exist or already has a tipster profile
   */
  async createTipster(userId: string, data: CreateTipsterDto): Promise<TipsterResponse> {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a tipster profile
    const existingTipster = await db.tipster.findUnique({
      where: { userId },
    });

    if (existingTipster) {
      throw new Error('User already has a tipster profile');
    }

    // Create tipster profile
    const tipster = await db.tipster.create({
      data: {
        userId,
        displayName: data.displayName,
        bio: data.bio,
      },
    });

    return tipster;
  }

  /**
   * Get all tipsters
   *
   * @returns Array of all tipsters with user info
   */
  async getAllTipsters() {
    const tipsters = await db.tipster.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            tips: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tipsters;
  }

  /**
   * Get a tipster by ID
   *
   * @param id - The tipster ID
   * @returns The tipster with user info and tips
   * @throws Error if tipster not found
   */
  async getTipsterById(id: string) {
    const tipster = await db.tipster.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        tips: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Last 10 tips
        },
      },
    });

    if (!tipster) {
      throw new Error(`Tipster with id ${id} not found`);
    }

    return tipster;
  }

  /**
   * Get tipster profile by user ID
   *
   * @param userId - The user ID
   * @returns The tipster profile or null
   */
  async getTipsterByUserId(userId: string): Promise<TipsterResponse | null> {
    const tipster = await db.tipster.findUnique({
      where: { userId },
    });

    return tipster;
  }

  /**
   * Update a tipster profile
   *
   * @param tipsterId - The tipster ID
   * @param userId - The authenticated user ID
   * @param data - Update data
   * @returns The updated tipster
   * @throws Error if tipster not found or user is not the owner
   */
  async updateTipster(
    tipsterId: string,
    userId: string,
    data: UpdateTipsterDto
  ): Promise<TipsterResponse> {
    // Find tipster
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
    });

    if (!tipster) {
      throw new Error(`Tipster with id ${tipsterId} not found`);
    }

    // Check ownership
    if (tipster.userId !== userId) {
      throw new Error('You can only update your own tipster profile');
    }

    // Update tipster
    const updatedTipster = await db.tipster.update({
      where: { id: tipsterId },
      data: {
        displayName: data.displayName,
        bio: data.bio,
      },
    });

    return updatedTipster;
  }

  /**
   * Delete a tipster profile
   *
   * @param tipsterId - The tipster ID
   * @param userId - The authenticated user ID
   * @throws Error if tipster not found or user is not the owner
   */
  async deleteTipster(tipsterId: string, userId: string): Promise<void> {
    // Find tipster
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
    });

    if (!tipster) {
      throw new Error(`Tipster with id ${tipsterId} not found`);
    }

    // Check ownership
    if (tipster.userId !== userId) {
      throw new Error('You can only delete your own tipster profile');
    }

    // Delete tipster (will cascade delete all tips)
    await db.tipster.delete({
      where: { id: tipsterId },
    });
  }
}

// Export singleton instance
export const tipsterService = new TipsterService();
