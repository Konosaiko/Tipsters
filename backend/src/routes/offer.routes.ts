import { Router } from 'express';
import { offerController } from '../controllers/offer.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Offer Routes
 *
 * Handles subscription offer management for tipsters
 */
const router = Router();

// POST /api/offers - Create a new subscription offer (protected)
router.post('/', authenticate, (req, res) =>
  offerController.createOffer(req, res)
);

// GET /api/offers - Get my subscription offers (protected, tipster dashboard)
router.get('/', authenticate, (req, res) =>
  offerController.getMyOffers(req, res)
);

// GET /api/offers/:id - Get a single offer by ID (public)
router.get('/:id', (req, res) => offerController.getOfferById(req, res));

// PATCH /api/offers/:id - Update a subscription offer (protected, owner only)
router.patch('/:id', authenticate, (req, res) =>
  offerController.updateOffer(req, res)
);

// DELETE /api/offers/:id - Delete a subscription offer (protected, owner only)
router.delete('/:id', authenticate, (req, res) =>
  offerController.deleteOffer(req, res)
);

export default router;
