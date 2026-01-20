import { Request, Response } from 'express';
import { followService } from '../services/follow.service';

/**
 * Follow Controller
 *
 * Handles HTTP requests for follow/unfollow operations
 */
export class FollowController {
  /**
   * Follow a tipster
   * POST /follow/:tipsterId
   */
  async followTipster(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId; // From auth middleware
      const { tipsterId } = req.params;

      await followService.followTipster(userId, tipsterId);

      res.status(200).json({ message: 'Successfully followed tipster' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Unfollow a tipster
   * DELETE /follow/:tipsterId
   */
  async unfollowTipster(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId; // From auth middleware
      const { tipsterId } = req.params;

      await followService.unfollowTipster(userId, tipsterId);

      res.status(200).json({ message: 'Successfully unfollowed tipster' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get followed tipsters for current user
   * GET /follow
   */
  async getFollowedTipsters(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId; // From auth middleware

      const tipsterIds = await followService.getFollowedTipsters(userId);

      res.json({ tipsterIds });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Check if current user is following a tipster
   * GET /follow/:tipsterId/status
   */
  async checkFollowStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId; // From auth middleware
      const { tipsterId } = req.params;

      const isFollowing = await followService.isFollowing(userId, tipsterId);

      res.json({ isFollowing });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

// Export a singleton instance
export const followController = new FollowController();
