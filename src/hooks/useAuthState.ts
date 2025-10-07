import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/lib/api';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
  isOffline: boolean;
}

export function useAuthState() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setError(null);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setError('You are offline. Please check your connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear error when auth state changes
  useEffect(() => {
    if (isAuthenticated && error) {
      setError(null);
    }
  }, [isAuthenticated, error]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setAuthError = useCallback((error: string) => {
    setError(error);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    isOffline,
    clearError,
    setAuthError,
  };
}

export function useAuthActions() {
  const { login, register, logout, refreshAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await login(credentials);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiClientError 
        ? err.message 
        : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await register(userData);
    } catch (err) {
      const errorMessage = err instanceof ApiClientError 
        ? err.message 
        : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [register]);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Don't throw error for logout failures
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await refreshAuth();
    } catch (err) {
      const errorMessage = err instanceof ApiClientError 
        ? err.message 
        : 'Session refresh failed. Please log in again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshAuth: handleRefresh,
    isLoading,
    error,
    clearError,
  };
}


