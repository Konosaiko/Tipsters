import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { accessService } from '../services/access.service';
import { tipsterService } from '../services/tipster.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Subscription Controller
 *
 * Handles HTTP requests for user subscriptions
 */
export class SubscriptionController {
  /**
   * POST /api/subscriptions/checkout
   * Create a checkout session for a subscription
   */
  async createCheckout(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { offerId, successUrl, cancelUrl } = req.body;

      if (!offerId) {
        res.status(400).json({ error: 'offerId is required' });
        return;
      }

      if (!successUrl || !cancelUrl) {
        res.status(400).json({ error: 'successUrl and cancelUrl are required' });
        return;
      }

      const checkoutUrl = await subscriptionService.createCheckout(
        req.user.userId,
        offerId,
        successUrl,
        cancelUrl
      );

      res.status(200).json({ url: checkoutUrl });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already have')) {
          res.status(409).json({ error: error.message });
          return;
        }
        if (error.message.includes('cannot subscribe to your own')) {
          res.status(400).json({ error: error.message });
          return;
        }
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message.includes('payment')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Error creating checkout:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  /**
   * GET /api/subscriptions
   * Get current user's subscriptions
   */
  async getMySubscriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const subscriptions = await subscriptionService.getUserSubscriptions(
        req.user.userId
      );

      res.status(200).json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/subscriptions/tipster/:tipsterId
   * Check subscription status for a specific tipster
   */
  async getSubscriptionToTipster(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { tipsterId } = req.params;

      const subscription = await subscriptionService.getActiveSubscriptionToTipster(
        req.user.userId,
        tipsterId
      );

      if (subscription) {
        res.status(200).json({ hasSubscription: true, subscription });
      } else {
        res.status(200).json({ hasSubscription: false, subscription: null });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/subscriptions/:id/cancel
   * Cancel a subscription
   */
  async cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { immediately } = req.body;

      await subscriptionService.cancelSubscription(
        id,
        req.user.userId,
        immediately === true
      );

      res.status(200).json({
        message: immediately
          ? 'Subscription cancelled immediately'
          : 'Subscription will be cancelled at the end of the current period',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message.includes('only cancel your own')) {
          res.status(403).json({ error: error.message });
          return;
        }
        if (error.message.includes('not active')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  /**
   * GET /api/tipsters/:tipsterId/access
   * Get access summary for a tipster (public, with optional auth)
   */
  async getTipsterAccess(req: Request, res: Response): Promise<void> {
    try {
      const { tipsterId } = req.params;
      const userId = (req as any).user?.userId || null;

      const accessSummary = await accessService.getTipsterAccessSummary(
        userId,
        tipsterId
      );

      res.status(200).json(accessSummary);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error('Error getting access summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/subscriptions/subscribers
   * Get my subscribers (for tipster dashboard)
   */
  async getMySubscribers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const tipster = await tipsterService.getTipsterByUserId(req.user.userId);

      if (!tipster) {
        res.status(404).json({ error: 'You need a tipster profile first' });
        return;
      }

      const subscribers = await subscriptionService.getTipsterSubscribers(
        tipster.id,
        req.user.userId
      );

      res.status(200).json(subscribers);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export singleton instance
export const subscriptionController = new SubscriptionController();
