import { db } from '../lib/db';
import {
  CreateOfferDto,
  UpdateOfferDto,
  OfferResponse,
} from '../types/subscription.types';
import { stripeService } from './stripe.service';

/**
 * Offer Service
 *
 * Handles CRUD operations for subscription offers.
 * Tipsters can create multiple offers with different prices,
 * durations, and sport scopes.
 */
export class OfferService {
  /**
   * Create a new subscription offer
   *
   * @param tipsterId - The tipster ID
   * @param userId - The authenticated user ID (for ownership check)
   * @param data - Offer data
   * @returns The created offer
   */
  async createOffer(
    tipsterId: string,
    userId: string,
    data: CreateOfferDto
  ): Promise<OfferResponse> {
    // Verify tipster exists and user owns it
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
      include: { stripeAccount: true },
    });

    if (!tipster) {
      throw new Error('Tipster not found');
    }

    if (tipster.userId !== userId) {
      throw new Error('You can only create offers for your own tipster profile');
    }

    // Check if Stripe account is set up
    if (!tipster.stripeAccount?.onboardingComplete) {
      throw new Error(
        'Please complete Stripe onboarding before creating offers'
      );
    }

    // Validate price (minimum 100 cents = €1)
    if (data.price < 100) {
      throw new Error('Price must be at least €1.00 (100 cents)');
    }

    // Create offer
    const offer = await db.subscriptionOffer.create({
      data: {
        tipsterId,
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        sports: data.sports || [],
        trialDays: data.trialDays,
        isActive: true,
      },
    });

    // Create Stripe product and price
    try {
      await stripeService.createProductForOffer(offer.id);
    } catch (error) {
      // Rollback: delete the offer if Stripe product creation fails
      await db.subscriptionOffer.delete({ where: { id: offer.id } });
      throw new Error(
        `Failed to create Stripe product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Return fresh offer with Stripe IDs
    const createdOffer = await db.subscriptionOffer.findUnique({
      where: { id: offer.id },
    });

    return createdOffer as OfferResponse;
  }

  /**
   * Get all offers for a tipster (public)
   *
   * @param tipsterId - The tipster ID
   * @param includeInactive - Include inactive offers (for owner only)
   * @returns Array of offers
   */
  async getOffersByTipster(
    tipsterId: string,
    includeInactive = false
  ): Promise<OfferResponse[]> {
    const where: { tipsterId: string; isActive?: boolean } = { tipsterId };

    if (!includeInactive) {
      where.isActive = true;
    }

    const offers = await db.subscriptionOffer.findMany({
      where,
      orderBy: { price: 'asc' },
    });

    return offers as OfferResponse[];
  }

  /**
   * Get a single offer by ID
   *
   * @param offerId - The offer ID
   * @returns The offer with tipster info
   */
  async getOfferById(offerId: string) {
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: {
        tipster: {
          select: {
            id: true,
            displayName: true,
            userId: true,
          },
        },
        _count: {
          select: {
            subscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    return offer;
  }

  /**
   * Get my offers (for tipster dashboard)
   *
   * @param userId - The user ID
   * @returns Array of offers with subscriber counts
   */
  async getMyOffers(userId: string) {
    const tipster = await db.tipster.findUnique({
      where: { userId },
    });

    if (!tipster) {
      throw new Error('You do not have a tipster profile');
    }

    const offers = await db.subscriptionOffer.findMany({
      where: { tipsterId: tipster.id },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return offers;
  }

  /**
   * Update a subscription offer
   *
   * @param offerId - The offer ID
   * @param userId - The authenticated user ID
   * @param data - Update data
   * @returns The updated offer
   */
  async updateOffer(
    offerId: string,
    userId: string,
    data: UpdateOfferDto
  ): Promise<OfferResponse> {
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: { tipster: true },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.tipster.userId !== userId) {
      throw new Error('You can only update your own offers');
    }

    // Check for active subscriptions before changing critical fields
    if (data.price !== undefined || data.duration !== undefined) {
      const activeSubscriptions = await db.subscription.count({
        where: { offerId, status: 'ACTIVE' },
      });

      if (activeSubscriptions > 0) {
        throw new Error(
          'Cannot change price or duration with active subscribers. ' +
            'Create a new offer instead and deactivate this one.'
        );
      }
    }

    // Validate price if provided
    if (data.price !== undefined && data.price < 100) {
      throw new Error('Price must be at least €1.00 (100 cents)');
    }

    // Update offer
    const updatedOffer = await db.subscriptionOffer.update({
      where: { id: offerId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        sports: data.sports,
        trialDays: data.trialDays,
        isActive: data.isActive,
      },
    });

    // If price or duration changed, update Stripe product
    if (
      (data.price !== undefined && data.price !== offer.price) ||
      (data.duration !== undefined && data.duration !== offer.duration)
    ) {
      try {
        await stripeService.createProductForOffer(offerId);
      } catch (error) {
        console.error('Failed to update Stripe product:', error);
      }
    }

    return updatedOffer as OfferResponse;
  }

  /**
   * Delete a subscription offer
   *
   * @param offerId - The offer ID
   * @param userId - The authenticated user ID
   */
  async deleteOffer(offerId: string, userId: string): Promise<void> {
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: { tipster: true },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.tipster.userId !== userId) {
      throw new Error('You can only delete your own offers');
    }

    // Check for any subscriptions (active or historical)
    const subscriptionCount = await db.subscription.count({
      where: { offerId },
    });

    if (subscriptionCount > 0) {
      // Soft delete by deactivating instead
      await db.subscriptionOffer.update({
        where: { id: offerId },
        data: { isActive: false },
      });
      throw new Error(
        'Offer has subscriptions and cannot be deleted. It has been deactivated instead.'
      );
    }

    // Hard delete if no subscriptions
    await db.subscriptionOffer.delete({
      where: { id: offerId },
    });
  }

  /**
   * Get total active subscriber count for a tipster
   * Used for fee tier calculation
   *
   * @param tipsterId - The tipster ID
   * @returns The total active subscriber count
   */
  async getActiveSubscriberCount(tipsterId: string): Promise<number> {
    return db.subscription.count({
      where: {
        offer: { tipsterId },
        status: 'ACTIVE',
      },
    });
  }
}

// Export singleton instance
export const offerService = new OfferService();
