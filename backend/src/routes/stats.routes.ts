import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';

const router = Router();

/**
 * Stats Routes
 */

// GET /api/stats/top-performers?period=30d&limit=3
// Public endpoint to get top performing tipsters
router.get('/top-performers', (req, res) =>
  statsController.getTopPerformers(req, res)
);

export default router;
