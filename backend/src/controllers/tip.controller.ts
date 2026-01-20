import { Request, Response } from 'express';
import { tipService } from '../services/tip.service';
import { CreateTipDto, UpdateTipDto, MarkTipResultDto } from '../types/tip.types';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Tip Controller
 *
 * Handles HTTP requests and responses.
 * Delegates business logic to the service layer.
 */
export class TipController {
  /**
   * POST /api/tips
   * Create a new tip (authenticated tipsters only)
   */
  async createTip(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const dto: Omit<CreateTipDto, 'tipsterId'> = req.body;

      // Basic validation
      if (!dto.event || !dto.prediction || dto.odds === undefined) {
        res.status(400).json({
          error: 'Missing required fields: event, prediction, odds',
        });
        return;
      }

      const tip = await tipService.createTip(req.user.userId, dto);

      res.status(201).json(tip);
    } catch (error) {
      if (error instanceof Error) {
        // Handle known errors
        if (error.message.includes('tipster profile')) {
          res.status(403).json({ error: error.message });
          return;
        }

        // Handle validation errors
        if (error.message.includes('must be')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      // Handle unexpected errors
      console.error('Error creating tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tips
   * Get all tips
   */
  async getAllTips(req: Request, res: Response): Promise<void> {
    try {
      const tips = await tipService.getAllTips();
      res.status(200).json(tips);
    } catch (error) {
      console.error('Error fetching tips:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tips/feed?filter=all|following
   * Get tips feed (with optional filter for followed tipsters)
   */
  async getTipsFeed(req: Request, res: Response): Promise<void> {
    try {
      const filter = (req.query.filter as 'all' | 'following') || 'all';
      const userId = (req as any).user?.userId; // From optionalAuth middleware

      // Validate filter parameter
      if (filter !== 'all' && filter !== 'following') {
        res.status(400).json({ error: 'Invalid filter. Must be "all" or "following"' });
        return;
      }

      // If filter is 'following' but user is not authenticated, return error
      if (filter === 'following' && !userId) {
        res.status(401).json({ error: 'You must be logged in to view your following feed' });
        return;
      }

      const tips = await tipService.getTipsFeed(userId, filter);
      res.status(200).json(tips);
    } catch (error) {
      console.error('Error fetching tips feed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tips/:id
   * Get a single tip by ID
   */
  async getTipById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const tip = await tipService.getTipById(id);
      res.status(200).json(tip);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      console.error('Error fetching tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/tips/:id
   * Update a tip (authenticated, owner only)
   */
  async updateTip(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const dto: UpdateTipDto = req.body;

      // Validate odds if provided
      if (dto.odds !== undefined && dto.odds <= 0) {
        res.status(400).json({ error: 'Odds must be greater than 0' });
        return;
      }

      const tip = await tipService.updateTip(id, req.user.userId, dto);

      res.status(200).json(tip);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }

        if (error.message.includes('only update your own')) {
          res.status(403).json({ error: error.message });
          return;
        }

        if (error.message.includes('must be')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      console.error('Error updating tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/tips/:id
   * Delete a tip (authenticated, owner only)
   */
  async deleteTip(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      await tipService.deleteTip(id, req.user.userId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }

        if (error.message.includes('only delete your own')) {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error('Error deleting tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/tips/:id/result
   * Mark a tip result (authenticated, owner only)
   */
  async markTipResult(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const dto: MarkTipResultDto = req.body;

      // Validate result
      if (!dto.result || !['WON', 'LOST', 'VOID'].includes(dto.result)) {
        res
          .status(400)
          .json({ error: 'Invalid result. Must be WON, LOST, or VOID' });
        return;
      }

      const tip = await tipService.markTipResult(id, req.user.userId, dto);

      res.status(200).json(tip);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }

        if (error.message.includes('only mark results for your own')) {
          res.status(403).json({ error: error.message });
          return;
        }

        if (error.message.includes('already been marked')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }

      console.error('Error marking tip result:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export a singleton instance
export const tipController = new TipController();
