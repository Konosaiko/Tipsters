import { Router } from 'express';
import { tipsterController } from '../controllers/tipster.controller';
import { statsController } from '../controllers/stats.controller';
import { offerController } from '../controllers/offer.controller';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

/**
 * Tipster Routes
 *
 * Defines all tipster profile management endpoints
 */
const router = Router();

// POST /api/tipsters - Create a tipster profile (protected)
router.post('/', authenticate, (req, res) => tipsterController.createTipster(req, res));

// GET /api/tipsters - Get all tipsters (public, but reads auth if present)
router.get('/', optionalAuth, (req, res) => tipsterController.getAllTipsters(req, res));

// GET /api/tipsters/me/profile - Get my tipster profile (protected)
router.get('/me/profile', authenticate, (req, res) =>
  tipsterController.getMyTipsterProfile(req, res)
);

// GET /api/tipsters/:id/stats?period=30d - Get tipster stats (public)
router.get('/:id/stats', (req, res) => statsController.getTipsterStats(req, res));

// GET /api/tipsters/:id/offers - Get tipster's subscription offers (public)
router.get('/:id/offers', (req, res) => offerController.getTipsterOffers(req, res));

// GET /api/tipsters/:id/access - Get access summary for tipster (public, optional auth)
router.get('/:id/access', optionalAuth, (req, res) =>
  subscriptionController.getTipsterAccess(req, res)
);

// GET /api/tipsters/:id - Get a tipster by ID (public, but reads auth if present)
router.get('/:id', optionalAuth, (req, res) => tipsterController.getTipsterById(req, res));

// PATCH /api/tipsters/:id - Update a tipster profile (protected, owner only)
router.patch('/:id', authenticate, (req, res) => tipsterController.updateTipster(req, res));

// DELETE /api/tipsters/:id - Delete a tipster profile (protected, owner only)
router.delete('/:id', authenticate, (req, res) => tipsterController.deleteTipster(req, res));

export default router;
