// src/context/AuthContext.tsx

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const normalizeToken = (token?: string | null) => {
    if (!token) return null;
    const trimmed = token.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
    return trimmed;
  };

  const clearSession = () => {
    authService.logout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setRoles([]);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    void restoreSession(); // async - let it run in background
  }, []);

  /**
   * Restore auth state on page refresh
   * ✅ Trust tokens
   * ✅ Load user data async (don't block)
   */
  const restoreSession = async () => {
    const accessToken = normalizeToken(localStorage.getItem('accessToken'));
    const refreshToken = normalizeToken(localStorage.getItem('refreshToken'));

    if (!accessToken && !refreshToken) {
      clearSession();
      setIsLoading(false);
      return;
    }

    // Tokens exist → user is considered authenticated
    setIsAuthenticated(true);
    
    // Load user data in background (don't block, don't fail if error)
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRoles(data.roles || []);
    } catch (error: any) {
      // Tokens are invalid or user inactive → force logout
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        clearSession();
      } else {
        console.debug('User data load on restore:', error);
      }
    }
    
    setIsLoading(false);
  };

  /**
   * Login handler
   */
  const login = (authResponse: AuthResponse) => {
    const rawAccessToken = authResponse.tokens?.accessToken || (authResponse as any).accessToken;
    const rawRefreshToken = authResponse.tokens?.refreshToken || (authResponse as any).refreshToken;
    const accessToken = normalizeToken(rawAccessToken);
    const refreshToken = normalizeToken(rawRefreshToken);

    if (!accessToken || !refreshToken) {
      console.error('Login failed: missing tokens in auth response');
      setIsAuthenticated(false);
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    setUser(authResponse.user);
    setRoles(authResponse.roles || []);
    setIsAuthenticated(true);

    // Ensure roles are loaded
    if (!authResponse.roles || authResponse.roles.length === 0) {
      void refreshUser();
    }
  };

  /**
   * Logout handler
   */
  const logout = () => {
    clearSession();
  };

  /**
   * Explicit user refresh
   * (call after first protected API or when needed)
   */
  const refreshUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRoles(data.roles || []);
      setIsAuthenticated(true);
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
        isAuthenticated,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
