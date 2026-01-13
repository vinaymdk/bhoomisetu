import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User, AuthResponse } from '../types/auth';

interface AuthContextType {
  user: User | null;
  roles: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRoles(data.roles);
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (authResponse: AuthResponse) => {
    localStorage.setItem('accessToken', authResponse.tokens.accessToken);
    localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
    setUser(authResponse.user);
    setRoles(authResponse.roles);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setRoles([]);
  };

  const refreshUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRoles(data.roles);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
