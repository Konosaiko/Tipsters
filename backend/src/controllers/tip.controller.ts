import { Request, Response } from 'express';
import { tipService } from '../services/tip.service';
import { CreateTipDto } from '../types/tip.types';

/**
 * Tip Controller
 *
 * Handles HTTP requests and responses.
 * Delegates business logic to the service layer.
 */
export class TipController {
  /**
   * POST /api/tips
   * Create a new tip
   */
  async createTip(req: Request, res: Response): Promise<void> {
    try {
      const dto: CreateTipDto = req.body;

      // Basic validation
      if (!dto.tipsterId || !dto.event || !dto.prediction || dto.odds === undefined) {
        res.status(400).json({
          error: 'Missing required fields: tipsterId, event, prediction, odds',
        });
        return;
      }

      const tip = await tipService.createTip(dto);

      res.status(201).json(tip);
    } catch (error) {
      if (error instanceof Error) {
        // Handle known errors (e.g., tipster not found)
        if (error.message.includes('not found')) {
          res.status(404).json({ error: error.message });
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
}

// Export a singleton instance
export const tipController = new TipController();
