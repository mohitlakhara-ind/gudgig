'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { log } from '@/lib/logger';
import { User, LoginRequest, RegisterRequest, LoginResponse } from '@/types/api';
import { apiClient, ApiClientError } from '@/lib/api';

// Auth Actions
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'REFRESH_FAILURE' }
  | { type: 'SET_LOADING'; payload: boolean };

// Auth Context Type
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  setSession: (token: string, refreshToken: string, user: User) => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
    case 'REFRESH_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, isLoading: false };
    case 'REFRESH_FAILURE':
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        // Set tokens in API client first
        apiClient.setTokens(token, refreshToken);
        
        try {
          // Try to get current user with timeout
          const userPromise = apiClient.getCurrentUser();
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          );
          
          const user = await Promise.race([userPromise, timeoutPromise]);
          
          dispatch({
            type: 'REFRESH_SUCCESS',
            payload: { user, token, refreshToken },
          });
          
          // Cache user data - handle nested structure
          try { 
            const actualUser = user?.data || user;
            localStorage.setItem('user', JSON.stringify(actualUser)); 
            const userRole = actualUser?.role;
            log.debug('auth_store_role', { role: userRole });
            localStorage.setItem('role', String(userRole || '')); 
          } catch (e) {
            log.warn('auth_cache_user_failed', { error: (e as any)?.message || String(e) });
          }
        } catch (error) {
          log.warn('auth_fetch_user_failed_using_cache', { error: (error as any)?.message || String(error) });
          
          // Try cached user data as fallback
          try {
            const cachedUserRaw = localStorage.getItem('user');
            if (cachedUserRaw) {
              const cachedUser = JSON.parse(cachedUserRaw) as User;
              dispatch({ 
                type: 'REFRESH_SUCCESS', 
                payload: { user: cachedUser, token, refreshToken } 
              });
              return;
            }
          } catch (cacheError) {
            log.warn('auth_parse_cached_user_failed', { error: (cacheError as any)?.message || String(cacheError) });
          }
          
          // Try token refresh as last resort
          try {
            await refreshAuth();
          } catch (refreshError) {
            log.warn('auth_refresh_failed_clearing_state', { error: (refreshError as any)?.message || String(refreshError) });
            // Clear invalid tokens
            apiClient.clearTokens();
            try { 
              localStorage.removeItem('user'); 
              localStorage.removeItem('role'); 
            } catch (e) {
              log.warn('auth_clear_localstorage_failed', { error: (e as any)?.message || String(e) });
            }
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();

    // Cross-tab sync for auth tokens
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'refreshToken') {
        if (!localStorage.getItem('token') || !localStorage.getItem('refreshToken')) {
          dispatch({ type: 'LOGOUT' });
        } else {
          refreshAuth().catch(() => dispatch({ type: 'REFRESH_FAILURE' }));
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.login(credentials);
      // Update API client tokens
      apiClient.setTokens(response.token, response.refreshToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
      // Cache user and role to localStorage for offline/refresh guard - handle nested structure
      try { 
        const actualUser = response.user?.data || response.user;
        localStorage.setItem('user', JSON.stringify(actualUser)); 
        const userRole = actualUser?.role;
        log.debug('auth_login_role', { role: userRole });
        localStorage.setItem('role', String(userRole || '')); 
      } catch (e) {
        log.warn('auth_cache_login_failed', { error: (e as any)?.message || String(e) });
      }
      return response;
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: message });
      throw error;
    }
  };

  // Register function
  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'REGISTER_START' });
    try {
      const response = await apiClient.register(userData);
      if (response.success) {
        // After registration, user needs to login
        // For now, we'll just set the state without token
        dispatch({ type: 'SET_LOADING', payload: false });
        // You might want to automatically login after registration
        // await login({ email: userData.email, password: userData.password });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      log.error('auth_logout_error', { error: error?.message || String(error) });
    } finally {
      // Clear API client tokens
      apiClient.clearTokens();
      try { localStorage.removeItem('user'); localStorage.removeItem('role'); } catch {}
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh auth function
  const refreshAuth = async () => {
    dispatch({ type: 'REFRESH_START' });
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        throw new Error('No tokens available');
      }

      // Get current user (this will trigger token refresh in apiClient if needed)
      const user = await apiClient.getCurrentUser();

      dispatch({
        type: 'REFRESH_SUCCESS',
        payload: { user, token, refreshToken },
      });
      try { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('role', String((user as any)?.role || '')); } catch {}
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE' });
      throw error;
    }
  };

  const setSession = (token: string, refreshToken: string, user: User) => {
    // Update API client tokens
    apiClient.setTokens(token, refreshToken);
    try { localStorage.setItem('user', JSON.stringify(user)); localStorage.setItem('role', String((user as any)?.role || '')); } catch {}
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token, refreshToken } });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    setSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;