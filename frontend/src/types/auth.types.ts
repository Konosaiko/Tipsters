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
 * User object
 */
export interface User {
  id: string;
  username: string;
  email: string;
  birthDate: string;
  createdAt: string;
}

/**
 * Response after successful authentication
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Decoded JWT payload (stored in context)
 */
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}
