import { Router } from 'express';
import { followController } from '../controllers/follow.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All follow routes require authentication
router.use(authenticate);

// GET /follow - Get list of followed tipster IDs
router.get('/', (req, res) => followController.getFollowedTipsters(req, res));

// GET /follow/:tipsterId/status - Check if following a specific tipster
router.get('/:tipsterId/status', (req, res) =>
  followController.checkFollowStatus(req, res)
);

// POST /follow/:tipsterId - Follow a tipster
router.post('/:tipsterId', (req, res) => followController.followTipster(req, res));

// DELETE /follow/:tipsterId - Unfollow a tipster
router.delete('/:tipsterId', (req, res) => followController.unfollowTipster(req, res));

export default router;
