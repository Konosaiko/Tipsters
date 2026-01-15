/**
 * LocalStorage utility functions
 */

const TOKEN_KEY = 'tipster_auth_token';
const USER_KEY = 'tipster_user';

export const storage = {
  /**
   * Save auth token to localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Remove auth token from localStorage
   */
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Save user data to localStorage
   */
  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Get user data from localStorage
   */
  getUser(): any | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Remove user data from localStorage
   */
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Clear all auth data
   */
  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};
