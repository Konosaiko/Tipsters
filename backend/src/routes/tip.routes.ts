import { Router } from 'express';
import { tipController } from '../controllers/tip.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Tip Routes
 *
 * Defines all tip-related endpoints
 */
const router = Router();

// POST /api/tips - Create a new tip (protected - authenticated tipsters only)
router.post('/', authenticate, (req, res) => tipController.createTip(req, res));

// GET /api/tips - Get all tips (public)
router.get('/', (req, res) => tipController.getAllTips(req, res));

// GET /api/tips/:id - Get a single tip by ID (public)
router.get('/:id', (req, res) => tipController.getTipById(req, res));

export default router;
