'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest, LoginResponse, AuthState, Subscription } from '@/types/api';
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
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBSCRIPTION'; payload: Subscription | null };

// Auth Context Type
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  subscription: Subscription | null;
  refreshSubscription: () => Promise<void>;
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
    case 'SET_SUBSCRIPTION':
      return { ...state, user: state.user ? { ...state.user, subscription: action.payload || undefined } : state.user } as AuthState;
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
        try {
          // Try to get current user with existing token
          const user = await apiClient.getCurrentUser();
          dispatch({
            type: 'REFRESH_SUCCESS',
            payload: { user, token, refreshToken },
          });
          // Fetch subscription
          try {
            const subRes = await apiClient.getMySubscription();
            dispatch({ type: 'SET_SUBSCRIPTION', payload: (subRes.data as any) || null });
          } catch {}
        } catch (error) {
          // Token might be expired, try refresh
          try {
            await refreshAuth();
          } catch (refreshError) {
            // Both token and refresh failed, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await apiClient.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        },
      });
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
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
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
      try {
        const subRes = await apiClient.getMySubscription();
        dispatch({ type: 'SET_SUBSCRIPTION', payload: (subRes.data as any) || null });
      } catch {}
    } catch (error) {
      dispatch({ type: 'REFRESH_FAILURE' });
      throw error;
    }
  };

  const refreshSubscription = async () => {
    try {
      const subRes = await apiClient.getMySubscription();
      dispatch({ type: 'SET_SUBSCRIPTION', payload: (subRes.data as any) || null });
    } catch (e) {
      // ignore
    }
  };

  const setSession = (token: string, refreshToken: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token, refreshToken } });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    subscription: state.user?.subscription || null,
    refreshSubscription,
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