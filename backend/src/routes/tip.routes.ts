import { Router } from 'express';
import { tipController } from '../controllers/tip.controller';

/**
 * Tip Routes
 *
 * Defines all tip-related endpoints
 */
const router = Router();

// POST /api/tips - Create a new tip
router.post('/', (req, res) => tipController.createTip(req, res));

// GET /api/tips - Get all tips
router.get('/', (req, res) => tipController.getAllTips(req, res));

// GET /api/tips/:id - Get a single tip by ID
router.get('/:id', (req, res) => tipController.getTipById(req, res));

export default router;
