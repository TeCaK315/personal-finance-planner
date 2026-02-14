'use client';

import React, { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, setAuthToken, clearAuthToken } from '@/utils/api-client';
import type { User, AuthTokens } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthToken(token);
      try {
        const response = await apiClient.get('/api/user/profile');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        clearAuthToken();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { user: userData, tokens } = response.data.data;
      setUser(userData);
      setAuthToken(tokens.accessToken);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      router.push('/dashboard');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/api/auth/register', {
      email,
      password,
      name,
    });

    if (response.data.success) {
      const { user: userData, tokens } = response.data.data;
      setUser(userData);
      setAuthToken(tokens.accessToken);
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      clearAuthToken();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
    }
  };

  const refreshAuth = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/api/auth/refresh', {
      refreshToken,
    });

    if (response.data.success) {
      const { accessToken } = response.data.data;
      setAuthToken(accessToken);
      localStorage.setItem('accessToken', accessToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}