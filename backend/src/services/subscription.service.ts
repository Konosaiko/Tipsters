import { db } from '../lib/db';
import { SubscriptionStatus } from '../types/subscription.types';
import { stripeService } from './stripe.service';

/**
 * Subscription Service
 *
 * Handles user subscriptions to tipster offers.
 * Manages subscription lifecycle and access checking.
 */
export class SubscriptionService {
  /**
   * Create a checkout session for subscribing to an offer
   *
   * @param userId - The user ID
   * @param offerId - The offer ID
   * @param successUrl - URL to redirect on success
   * @param cancelUrl - URL to redirect on cancel
   * @returns The checkout URL
   */
  async createCheckout(
    userId: string,
    offerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    // Check if user already has this subscription
    const existingSubscription = await db.subscription.findUnique({
      where: {
        userId_offerId: { userId, offerId },
      },
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'ACTIVE') {
        throw new Error('You already have an active subscription to this offer');
      }
      if (existingSubscription.status === 'TRIALING') {
        throw new Error('You already have a trial subscription to this offer');
      }
    }

    // Check user is not subscribing to their own offer
    const offer = await db.subscriptionOffer.findUnique({
      where: { id: offerId },
      include: { tipster: true },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    if (offer.tipster.userId === userId) {
      throw new Error('You cannot subscribe to your own offers');
    }

    return stripeService.createCheckoutSession(
      userId,
      offerId,
      successUrl,
      cancelUrl
    );
  }

  /**
   * Create a subscription record (called from webhook)
   *
   * @param userId - The user ID
   * @param offerId - The offer ID
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param status - Initial status
   * @param periodEnd - Current period end date
   * @param trialEnd - Trial end date (if applicable)
   */
  async createSubscription(
    userId: string,
    offerId: string,
    stripeSubscriptionId: string | null,
    status: SubscriptionStatus,
    periodEnd: Date | null,
    trialEnd: Date | null
  ) {
    // Delete any expired/cancelled subscription first
    await db.subscription.deleteMany({
      where: {
        userId,
        offerId,
        status: { in: ['EXPIRED', 'CANCELLED'] },
      },
    });

    return db.subscription.create({
      data: {
        userId,
        offerId,
        stripeSubscriptionId,
        status,
        currentPeriodEnd: periodEnd,
        trialEndsAt: trialEnd,
      },
    });
  }

  /**
   * Update subscription status (called from webhook)
   *
   * @param stripeSubscriptionId - The Stripe subscription ID
   * @param status - New status
   * @param periodEnd - New period end date
   * @param cancelAtPeriodEnd - Whether to cancel at period end
   */
  async updateSubscription(
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    periodEnd: Date | null,
    cancelAtPeriodEnd: boolean
  ) {
    return db.subscription.update({
      where: { stripeSubscriptionId },
      data: {
        status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd,
      },
    });
  }

  /**
   * Get user's subscriptions
   *
   * @param userId - The user ID
   * @returns Array of subscriptions with offer details
   */
  async getUserSubscriptions(userId: string) {
    return db.subscription.findMany({
      where: { userId },
      include: {
        offer: {
          include: {
            tipster: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active subscription to a specific tipster
   *
   * @param userId - The user ID
   * @param tipsterId - The tipster ID
   * @returns The active subscription or null
   */
  async getActiveSubscriptionToTipster(userId: string, tipsterId: string) {
    return db.subscription.findFirst({
      where: {
        userId,
        offer: { tipsterId },
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        offer: true,
      },
    });
  }

  /**
   * Check if user has access to a tipster's premium content
   *
   * @param userId - The user ID (can be null for anonymous)
   * @param tipsterId - The tipster ID
   * @param sport - Optional sport to check specific access
   * @returns Whether user has premium access
   */
  async hasAccessToTipster(
    userId: string | null,
    tipsterId: string,
    sport?: string
  ): Promise<boolean> {
    if (!userId) return false;

    // Check if user is the tipster owner
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
    });

    if (tipster?.userId === userId) {
      return true; // Tipster always has access to their own content
    }

    // Find active subscriptions to this tipster
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
        offer: { tipsterId },
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        offer: true,
      },
    });

    if (subscriptions.length === 0) {
      return false;
    }

    // Check if any subscription covers the sport
    for (const sub of subscriptions) {
      // Empty sports array means all sports
      if (sub.offer.sports.length === 0) {
        return true;
      }
      // Check if specific sport is covered
      if (sport && sub.offer.sports.includes(sport as any)) {
        return true;
      }
      // If no sport specified and user has any subscription, grant access
      if (!sport) {
        return true;
      }
    }

    return false;
  }

  /**
   * Cancel a subscription
   *
   * @param subscriptionId - The subscription ID
   * @param userId - The user ID (for ownership check)
   * @param immediately - Cancel immediately vs at period end
   */
  async cancelSubscription(
    subscriptionId: string,
    userId: string,
    immediately = false
  ): Promise<void> {
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.userId !== userId) {
      throw new Error('You can only cancel your own subscriptions');
    }

    if (
      subscription.status !== 'ACTIVE' &&
      subscription.status !== 'TRIALING'
    ) {
      throw new Error('Subscription is not active');
    }

    // Cancel in Stripe if it's a recurring subscription
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(
        subscription.stripeSubscriptionId,
        immediately
      );
    }

    // Update local record
    if (immediately) {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'CANCELLED' },
      });
    } else {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { cancelAtPeriodEnd: true },
      });
    }
  }

  /**
   * Get subscription by Stripe subscription ID
   *
   * @param stripeSubscriptionId - The Stripe subscription ID
   */
  async getByStripeId(stripeSubscriptionId: string) {
    return db.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: {
        offer: true,
        user: true,
      },
    });
  }

  /**
   * Get subscribers for a tipster (for tipster dashboard)
   *
   * @param tipsterId - The tipster ID
   * @param userId - The user ID (for ownership check)
   */
  async getTipsterSubscribers(tipsterId: string, userId: string) {
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
    });

    if (!tipster) {
      throw new Error('Tipster not found');
    }

    if (tipster.userId !== userId) {
      throw new Error('You can only view your own subscribers');
    }

    return db.subscription.findMany({
      where: {
        offer: { tipsterId },
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        offer: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check expired subscriptions and update their status
   * Should be called periodically (cron job)
   */
  async processExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const result = await db.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        currentPeriodEnd: { lt: now },
        stripeSubscriptionId: null, // Only lifetime subscriptions without Stripe
      },
      data: { status: 'EXPIRED' },
    });

    return result.count;
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
