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
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token && !refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get current user with existing token
      const data = await authService.getCurrentUser();
      setUser(data.user);
      setRoles(data.roles);
    } catch (error: any) {
      // If token expired, try to refresh
      if (error.response?.status === 401 && refreshToken) {
        try {
          const tokens = await authService.refreshTokens(refreshToken);
          localStorage.setItem('accessToken', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }
          
          // Retry getting user with new token
          const data = await authService.getCurrentUser();
          setUser(data.user);
          setRoles(data.roles);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          authService.logout();
          setUser(null);
          setRoles([]);
        }
      } else {
        console.error('Auth check failed:', error);
        authService.logout();
        setUser(null);
        setRoles([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = (authResponse: AuthResponse) => {
    localStorage.setItem('accessToken', authResponse.tokens.accessToken);
    localStorage.setItem('refreshToken', authResponse.tokens.refreshToken);
    setUser(authResponse.user);
    setRoles(authResponse.roles || []);
    if (!authResponse.roles || authResponse.roles.length === 0) {
      // Ensure roles are loaded for role-guarded routes
      void refreshUser();
    }
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
