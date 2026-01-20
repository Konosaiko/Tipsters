import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { JwtPayload } from '../types/auth.types';

/**
 * Extended Express Request with user data
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication Middleware
 *
 * Protects routes by requiring a valid JWT token.
 * Token should be sent in the Authorization header as "Bearer <token>"
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided. Please login first.' });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional Authentication Middleware
 *
 * Reads JWT token if present, but doesn't reject if missing.
 * Use this for public routes that need to know if user is authenticated.
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token (remove "Bearer " prefix)
      const token = authHeader.substring(7);

      // Verify token
      const decoded = authService.verifyToken(token);

      // Attach user info to request
      req.user = decoded;
    }

    // Continue regardless of whether token was present/valid
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    // (don't reject the request)
    next();
  }
};
