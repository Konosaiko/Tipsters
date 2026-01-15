import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../types/auth.types';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Auth Controller
 *
 * Handles HTTP requests for authentication
 */
export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const dto: RegisterDto = req.body;

      // Basic validation
      if (!dto.username || !dto.email || !dto.password || !dto.birthDate) {
        res.status(400).json({
          error: 'Missing required fields: username, email, password, birthDate',
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      // Password strength validation
      if (dto.password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }

      // Date validation
      const birthDate = new Date(dto.birthDate);
      if (isNaN(birthDate.getTime())) {
        res.status(400).json({ error: 'Invalid birth date format. Use YYYY-MM-DD' });
        return;
      }

      const result = await authService.register(dto);

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        // Handle known errors
        if (error.message.includes('already')) {
          res.status(409).json({ error: error.message });
          return;
        }

        if (error.message.includes('18 years old')) {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/auth/login
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto: LoginDto = req.body;

      // Basic validation
      if (!dto.email || !dto.password) {
        res.status(400).json({
          error: 'Missing required fields: email, password',
        });
        return;
      }

      const result = await authService.login(dto);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(401).json({ error: error.message });
        return;
      }

      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user info
   */
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      res.status(200).json({ user: req.user });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
