import { Router } from 'express';
import { stripeController } from '../controllers/stripe.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Stripe Routes
 *
 * Handles Stripe Connect onboarding for tipsters
 */
const router = Router();

// POST /api/stripe/connect/onboard - Start Stripe Connect onboarding
router.post('/connect/onboard', authenticate, (req, res) =>
  stripeController.startOnboarding(req, res)
);

// GET /api/stripe/connect/status - Get Stripe account status
router.get('/connect/status', authenticate, (req, res) =>
  stripeController.getStatus(req, res)
);

// GET /api/stripe/connect/dashboard - Get Stripe dashboard link
router.get('/connect/dashboard', authenticate, (req, res) =>
  stripeController.getDashboardLink(req, res)
);

// POST /api/stripe/connect/refresh - Refresh Stripe account status
router.post('/connect/refresh', authenticate, (req, res) =>
  stripeController.refreshStatus(req, res)
);

export default router;
