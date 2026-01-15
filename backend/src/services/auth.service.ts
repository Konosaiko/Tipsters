import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import { RegisterDto, LoginDto, AuthResponse, JwtPayload } from '../types/auth.types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

/**
 * Auth Service
 *
 * Handles user authentication:
 * - User registration with age validation
 * - Password hashing
 * - User login with JWT token generation
 */
export class AuthService {
  /**
   * Register a new user
   *
   * @param data - Registration data
   * @returns User info and JWT token
   * @throws Error if validation fails or user already exists
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const { username, email, password, birthDate } = data;

    // Validate age (must be 18+)
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Adjust age if birthday hasn't occurred this year yet
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 18) {
      throw new Error('You must be at least 18 years old to register');
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        birthDate: birth,
      },
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        birthDate: user.birthDate,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Login a user
   *
   * @param data - Login credentials
   * @returns User info and JWT token
   * @throws Error if credentials are invalid
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        birthDate: user.birthDate,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   *
   * @param payload - Token payload
   * @returns JWT token
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify JWT token
   *
   * @param token - JWT token
   * @returns Decoded payload
   * @throws Error if token is invalid
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
