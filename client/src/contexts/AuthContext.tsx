import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService, type User, type AuthResponse } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  stores: string[] | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<string[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    const initAuth = async () => {
      try {
        authService.initializeAuth();
        
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData.user);
          setStores(userData.stores);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setStores(response.stores);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setStores(undefined);
    authService.logout();
  };

  const value: AuthContextType = {
    user,
    stores,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 