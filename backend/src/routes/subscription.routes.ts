import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Subscription Routes
 *
 * Handles user subscription management
 */
const router = Router();

// POST /api/subscriptions/checkout - Create checkout session for subscription
router.post('/checkout', authenticate, (req, res) =>
  subscriptionController.createCheckout(req, res)
);

// GET /api/subscriptions - Get my subscriptions
router.get('/', authenticate, (req, res) =>
  subscriptionController.getMySubscriptions(req, res)
);

// GET /api/subscriptions/subscribers - Get my subscribers (tipster dashboard)
router.get('/subscribers', authenticate, (req, res) =>
  subscriptionController.getMySubscribers(req, res)
);

// GET /api/subscriptions/tipster/:tipsterId - Check subscription to specific tipster
router.get('/tipster/:tipsterId', authenticate, (req, res) =>
  subscriptionController.getSubscriptionToTipster(req, res)
);

// POST /api/subscriptions/:id/cancel - Cancel a subscription
router.post('/:id/cancel', authenticate, (req, res) =>
  subscriptionController.cancelSubscription(req, res)
);

export default router;
