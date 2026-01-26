import { Request, Response } from 'express';
import { offerService } from '../services/offer.service';
import { tipsterService } from '../services/tipster.service';
import { CreateOfferDto, UpdateOfferDto } from '../types/subscription.types';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Offer Controller
 *
 * Handles HTTP requests for subscription offer management
 */
export class OfferController {
  /**
   * POST /api/offers
   * Create a new subscription offer
   */
  async createOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const tipster = await tipsterService.getTipsterByUserId(req.user.userId);

      if (!tipster) {
        res.status(404).json({ error: 'You need a tipster profile first' });
        return;
      }

      const dto: CreateOfferDto = req.body;

      // Validation
      if (!dto.name) {
        res.status(400).json({ error: 'Offer name is required' });
        return;
      }

      if (!dto.price || dto.price < 100) {
        res.status(400).json({ error: 'Price must be at least €1.00 (100 cents)' });
        return;
      }

      if (!dto.duration) {
        res.status(400).json({ error: 'Duration is required' });
        return;
      }

      const validDurations = ['WEEKLY', 'MONTHLY', 'YEARLY', 'LIFETIME'];
      if (!validDurations.includes(dto.duration)) {
        res.status(400).json({ error: 'Invalid duration' });
        return;
      }

      const offer = await offerService.createOffer(tipster.id, req.user.userId, dto);

      res.status(201).json(offer);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Stripe onboarding')) {
          res.status(400).json({ error: error.message });
          return;
        }
        if (error.message.includes('Price must be')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Error creating offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/offers
   * Get my subscription offers (tipster dashboard)
   */
  async getMyOffers(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const offers = await offerService.getMyOffers(req.user.userId);

      res.status(200).json(offers);
    } catch (error) {
      if (error instanceof Error && error.message.includes('do not have a tipster')) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error('Error fetching offers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/tipsters/:tipsterId/offers
   * Get a tipster's public subscription offers
   */
  async getTipsterOffers(req: Request, res: Response): Promise<void> {
    try {
      const { tipsterId } = req.params;

      const offers = await offerService.getOffersByTipster(tipsterId, false);

      res.status(200).json(offers);
    } catch (error) {
      console.error('Error fetching tipster offers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/offers/:id
   * Get a single offer by ID
   */
  async getOfferById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const offer = await offerService.getOfferById(id);

      res.status(200).json(offer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      console.error('Error fetching offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PATCH /api/offers/:id
   * Update a subscription offer
   */
  async updateOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const dto: UpdateOfferDto = req.body;

      // Validate price if provided
      if (dto.price !== undefined && dto.price < 100) {
        res.status(400).json({ error: 'Price must be at least €1.00 (100 cents)' });
        return;
      }

      const offer = await offerService.updateOffer(id, req.user.userId, dto);

      res.status(200).json(offer);
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
        if (error.message.includes('Cannot change price')) {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      console.error('Error updating offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/offers/:id
   * Delete a subscription offer
   */
  async deleteOffer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;

      await offerService.deleteOffer(id, req.user.userId);

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
        if (error.message.includes('has been deactivated')) {
          // Soft delete happened, return success with message
          res.status(200).json({ message: error.message });
          return;
        }
      }
      console.error('Error deleting offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export singleton instance
export const offerController = new OfferController();
