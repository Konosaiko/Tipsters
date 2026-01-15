import apiClient from './client';
import { RegisterDto, LoginDto, AuthResponse } from '../types/auth.types';

/**
 * Authentication API endpoints
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login a user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
