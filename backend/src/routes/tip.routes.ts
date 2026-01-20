import { Router } from 'express';
import { tipController } from '../controllers/tip.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';

/**
 * Tip Routes
 *
 * Defines all tip-related endpoints
 */
const router = Router();

// POST /api/tips - Create a new tip (protected - authenticated tipsters only)
router.post('/', authenticate, (req, res) => tipController.createTip(req, res));

// GET /api/tips/feed?filter=all|following - Get tips feed (public, but reads auth if present)
router.get('/feed', optionalAuth, (req, res) => tipController.getTipsFeed(req, res));

// GET /api/tips - Get all tips (public)
router.get('/', (req, res) => tipController.getAllTips(req, res));

// GET /api/tips/:id - Get a single tip by ID (public)
router.get('/:id', (req, res) => tipController.getTipById(req, res));

// PATCH /api/tips/:id - Update a tip (protected - owner only)
router.patch('/:id', authenticate, (req, res) => tipController.updateTip(req, res));

// DELETE /api/tips/:id - Delete a tip (protected - owner only)
router.delete('/:id', authenticate, (req, res) => tipController.deleteTip(req, res));

// PATCH /api/tips/:id/result - Mark tip result (protected - owner only)
router.patch('/:id/result', authenticate, (req, res) =>
  tipController.markTipResult(req, res)
);

export default router;
