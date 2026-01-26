import { Response } from 'express';
import { stripeService } from '../services/stripe.service';
import { tipsterService } from '../services/tipster.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Stripe Controller
 *
 * Handles Stripe Connect onboarding for tipsters
 */
export class StripeController {
  /**
   * POST /api/stripe/connect/onboard
   * Start Stripe Connect onboarding for a tipster
   */
  async startOnboarding(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get user's tipster profile
      const tipster = await tipsterService.getTipsterByUserId(req.user.userId);

      if (!tipster) {
        res.status(404).json({ error: 'You need a tipster profile first' });
        return;
      }

      const { returnUrl, refreshUrl } = req.body;

      if (!returnUrl || !refreshUrl) {
        res.status(400).json({ error: 'returnUrl and refreshUrl are required' });
        return;
      }

      const onboardingUrl = await stripeService.createOnboardingLink(
        tipster.id,
        returnUrl,
        refreshUrl
      );

      res.status(200).json({ url: onboardingUrl });
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      res.status(500).json({ error: 'Failed to start onboarding' });
    }
  }

  /**
   * GET /api/stripe/connect/status
   * Get Stripe Connect account status for a tipster
   */
  async getStatus(req: AuthRequest, res: Response): Promise<void> {
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

      const status = await stripeService.getAccountStatus(tipster.id);

      res.status(200).json(status);
    } catch (error) {
      console.error('Error getting Stripe status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  }

  /**
   * GET /api/stripe/connect/dashboard
   * Get a login link to the Stripe Express Dashboard
   */
  async getDashboardLink(req: AuthRequest, res: Response): Promise<void> {
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

      const dashboardUrl = await stripeService.createDashboardLink(tipster.id);

      res.status(200).json({ url: dashboardUrl });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('No Stripe account')) {
          res.status(404).json({ error: 'No Stripe account found. Complete onboarding first.' });
          return;
        }
        if (error.message.includes('not complete')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Error getting dashboard link:', error);
      res.status(500).json({ error: 'Failed to get dashboard link' });
    }
  }

  /**
   * POST /api/stripe/connect/refresh
   * Refresh Stripe account status (sync from Stripe API)
   */
  async refreshStatus(req: AuthRequest, res: Response): Promise<void> {
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

      const currentStatus = await stripeService.getAccountStatus(tipster.id);

      if (!currentStatus.hasAccount || !currentStatus.accountId) {
        res.status(404).json({ error: 'No Stripe account found' });
        return;
      }

      await stripeService.syncAccountStatus(currentStatus.accountId);

      const updatedStatus = await stripeService.getAccountStatus(tipster.id);

      res.status(200).json(updatedStatus);
    } catch (error) {
      console.error('Error refreshing Stripe status:', error);
      res.status(500).json({ error: 'Failed to refresh status' });
    }
  }
}

// Export singleton instance
export const stripeController = new StripeController();
