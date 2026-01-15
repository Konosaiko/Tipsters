import { Router } from 'express';
import { tipsterController } from '../controllers/tipster.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Tipster Routes
 *
 * Defines all tipster profile management endpoints
 */
const router = Router();

// POST /api/tipsters - Create a tipster profile (protected)
router.post('/', authenticate, (req, res) => tipsterController.createTipster(req, res));

// GET /api/tipsters - Get all tipsters (public)
router.get('/', (req, res) => tipsterController.getAllTipsters(req, res));

// GET /api/tipsters/me/profile - Get my tipster profile (protected)
router.get('/me/profile', authenticate, (req, res) =>
  tipsterController.getMyTipsterProfile(req, res)
);

// GET /api/tipsters/:id - Get a tipster by ID (public)
router.get('/:id', (req, res) => tipsterController.getTipsterById(req, res));

// PATCH /api/tipsters/:id - Update a tipster profile (protected, owner only)
router.patch('/:id', authenticate, (req, res) => tipsterController.updateTipster(req, res));

// DELETE /api/tipsters/:id - Delete a tipster profile (protected, owner only)
router.delete('/:id', authenticate, (req, res) => tipsterController.deleteTipster(req, res));

export default router;
