import { db } from '../lib/db';
import { subscriptionService } from './subscription.service';

/**
 * Access Service
 *
 * Handles access control for premium tips.
 * Determines what content a user can view based on their subscriptions.
 */
export class AccessService {
  /**
   * Check if a user can view a specific tip
   *
   * @param userId - The user ID (null for anonymous)
   * @param tipId - The tip ID
   * @returns Object with canView status and reason
   */
  async canViewTip(
    userId: string | null,
    tipId: string
  ): Promise<{ canView: boolean; reason?: string }> {
    const tip = await db.tip.findUnique({
      where: { id: tipId },
      include: {
        tipster: true,
      },
    });

    if (!tip) {
      return { canView: false, reason: 'Tip not found' };
    }

    // Free tips are visible to everyone
    if (tip.visibility === 'FREE') {
      return { canView: true };
    }

    // Premium tip - check access
    if (!userId) {
      return { canView: false, reason: 'Login required for premium content' };
    }

    // Check if user is the tipster
    if (tip.tipster.userId === userId) {
      return { canView: true };
    }

    // Check subscription
    const hasAccess = await subscriptionService.hasAccessToTipster(
      userId,
      tip.tipsterId,
      tip.sport || undefined
    );

    if (hasAccess) {
      return { canView: true };
    }

    return {
      canView: false,
      reason: 'Subscription required to view this tip',
    };
  }

  /**
   * Filter tips based on user access
   * Used for tip feeds - hides premium tip details for non-subscribers
   *
   * @param userId - The user ID (null for anonymous)
   * @param tips - Array of tips to filter
   * @returns Tips with hidden details for inaccessible premium tips
   */
  async filterTipsForUser<
    T extends {
      id: string;
      tipsterId: string;
      visibility: string;
      sport: string | null;
      prediction: string;
      explanation: string | null;
      odds: number;
      tipster: { userId: string };
    },
  >(userId: string | null, tips: T[]): Promise<(T & { isLocked: boolean })[]> {
    // Get all tipster IDs to batch check subscriptions
    const tipsterIds = [...new Set(tips.map((t) => t.tipsterId))];

    // Check access for each tipster
    const accessMap = new Map<string, boolean>();

    for (const tipsterId of tipsterIds) {
      const hasAccess = userId
        ? await subscriptionService.hasAccessToTipster(userId, tipsterId)
        : false;
      accessMap.set(tipsterId, hasAccess);
    }

    return tips.map((tip) => {
      const isOwner = userId && tip.tipster.userId === userId;
      const hasSubscription = accessMap.get(tip.tipsterId) || false;
      const isFree = tip.visibility === 'FREE';

      const canView = isFree || isOwner || hasSubscription;

      if (canView) {
        return { ...tip, isLocked: false };
      }

      // Hide premium content details
      return {
        ...tip,
        prediction: '🔒 Premium tip - Subscribe to view',
        explanation: null,
        odds: 0,
        isLocked: true,
      };
    });
  }

  /**
   * Get user's accessible tipsters
   * Returns list of tipster IDs the user has premium access to
   *
   * @param userId - The user ID
   * @returns Array of tipster IDs with active subscriptions
   */
  async getAccessibleTipsters(userId: string): Promise<string[]> {
    const subscriptions = await db.subscription.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        offer: {
          select: { tipsterId: true },
        },
      },
    });

    const tipsterIds = subscriptions.map((s: { offer: { tipsterId: string } }) => s.offer.tipsterId);
    return [...new Set<string>(tipsterIds)];
  }

  /**
   * Get access summary for a tipster
   * Used to show subscription status on tipster profile
   *
   * @param userId - The user ID (null for anonymous)
   * @param tipsterId - The tipster ID
   */
  async getTipsterAccessSummary(userId: string | null, tipsterId: string) {
    // Get tipster info
    const tipster = await db.tipster.findUnique({
      where: { id: tipsterId },
      include: {
        subscriptionOffers: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!tipster) {
      throw new Error('Tipster not found');
    }

    // Check if user is the tipster owner
    const isOwner = userId === tipster.userId;

    // Check existing subscription
    let activeSubscription = null;
    if (userId && !isOwner) {
      activeSubscription =
        await subscriptionService.getActiveSubscriptionToTipster(
          userId,
          tipsterId
        );
    }

    // Get tip counts
    const tipCounts = await db.tip.groupBy({
      by: ['visibility'],
      where: { tipsterId },
      _count: true,
    });

    const freeTips =
      tipCounts.find((t: { visibility: string; _count: number }) => t.visibility === 'FREE')?._count || 0;
    const premiumTips =
      tipCounts.find((t: { visibility: string; _count: number }) => t.visibility === 'PREMIUM')?._count || 0;

    return {
      isOwner,
      hasAccess: isOwner || !!activeSubscription,
      activeSubscription: activeSubscription
        ? {
            id: activeSubscription.id,
            offerName: activeSubscription.offer.name,
            expiresAt: activeSubscription.currentPeriodEnd,
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          }
        : null,
      availableOffers: isOwner ? [] : tipster.subscriptionOffers,
      tipCounts: {
        free: freeTips,
        premium: premiumTips,
        total: freeTips + premiumTips,
      },
    };
  }
}

// Export singleton instance
export const accessService = new AccessService();
