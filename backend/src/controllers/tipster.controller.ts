import { Request, Response } from 'express';
import { tipsterService } from '../services/tipster.service';
import { CreateTipsterDto, UpdateTipsterDto } from '../types/tipster.types';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Tipster Controller
 *
 * Handles HTTP requests for tipster profile management
 */
export class TipsterController {
  /**
   * POST /api/tipsters
   * Create a tipster profile (authenticated users only)
   */
  async createTipster(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const dto: CreateTipsterDto = req.body;

      // Validation
      if (!dto.displayName) {
        res.status(400).json({ error: 'Display name is required' });
        return;
      }

      const tipster = await tipsterService.createTipster(req.user.userId, dto);

      res.status(201).json(tipster);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
          return;
        }

        if (error.message.includes('already has')) {
          res.status(409).json({ error: error.message });
          return;
        }
      }

      console.error('Error creating tipster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tipsters
   * Get all tipsters (public)
   */
  async getAllTipsters(req: Request, res: Response): Promise<void> {
    try {
      const tipsters = await tipsterService.getAllTipsters();
      res.status(200).json(tipsters);
    } catch (error) {
      console.error('Error fetching tipsters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tipsters/:id
   * Get a single tipster by ID (public)
   */
  async getTipsterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const tipster = await tipsterService.getTipsterById(id);
      res.status(200).json(tipster);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      console.error('Error fetching tipster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tipsters/me/profile
   * Get current user's tipster profile (authenticated)
   */
  async getMyTipsterProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const tipster = await tipsterService.getTipsterByUserId(req.user.userId);

      if (!tipster) {
        res.status(404).json({ error: 'You do not have a tipster profile yet' });
        return;
      }

      res.status(200).json(tipster);
    } catch (error) {
      console.error('Error fetching tipster profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/tipsters/:id
   * Update a tipster profile (authenticated, owner only)
   */
  async updateTipster(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const dto: UpdateTipsterDto = req.body;

      const tipster = await tipsterService.updateTipster(id, req.user.userId, dto);

      res.status(200).json(tipster);
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
      }

      console.error('Error updating tipster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/tipsters/:id
   * Delete a tipster profile (authenticated, owner only)
   */
  async deleteTipster(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      await tipsterService.deleteTipster(id, req.user.userId);

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

      console.error('Error deleting tipster:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export singleton instance
export const tipsterController = new TipsterController();
