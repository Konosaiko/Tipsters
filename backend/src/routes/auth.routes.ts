import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Auth Routes
 *
 * Defines all authentication-related endpoints
 */
const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login - Login a user
router.post('/login', (req, res) => authController.login(req, res));

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authenticate, (req, res) => authController.getCurrentUser(req, res));

export default router;
