/**
 * Request body for user registration
 */
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  birthDate: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Request body for user login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Response after successful authentication
 */
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    birthDate: Date;
    createdAt: Date;
  };
  token: string;
}

/**
 * Decoded JWT payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
