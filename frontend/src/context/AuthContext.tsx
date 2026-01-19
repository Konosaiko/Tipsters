import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import { storage } from '../utils/storage';
import { User, LoginDto, RegisterDto, JwtPayload } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use the AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  /**
   * Register a new user
   */
  const register = async (data: RegisterDto): Promise<void> => {
    try {
      const response = await authApi.register(data);

      // Save to state and localStorage
      setUser(response.user);
      setToken(response.token);
      storage.setToken(response.token);
      storage.setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login a user
   */
  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      const response = await authApi.login(credentials);

      // Save to state and localStorage
      setUser(response.user);
      setToken(response.token);
      storage.setToken(response.token);
      storage.setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout the user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    storage.clear();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
