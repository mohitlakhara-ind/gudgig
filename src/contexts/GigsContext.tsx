'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Job } from '@/types/api';
import { useGigsManager } from '@/hooks/useGigsManager';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api';

interface GigsState {
  savedGigs: string[];
  recentSearches: string[];
  favoriteCategories: string[];
  viewMode: 'grid' | 'list';
  sortBy: string;
  filters: {
    category: string;
    budgetRange: [number, number] | null;
    skills: string[];
    location: string;
  };
}

type GigsAction =
  | { type: 'SET_SAVED_GIGS'; payload: string[] }
  | { type: 'TOGGLE_SAVED_GIG'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'TOGGLE_FAVORITE_CATEGORY'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SORT_BY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<GigsState['filters']> }
  | { type: 'RESET_FILTERS' }
  | { type: 'LOAD_FROM_STORAGE' };

const initialState: GigsState = {
  savedGigs: [],
  recentSearches: [],
  favoriteCategories: [],
  viewMode: 'grid',
  sortBy: 'recent',
  filters: {
    category: 'all',
    budgetRange: null,
    skills: [],
    location: ''
  }
};

function gigsReducer(state: GigsState, action: GigsAction): GigsState {
  switch (action.type) {
    case 'SET_SAVED_GIGS':
      return { ...state, savedGigs: action.payload };
    
    case 'TOGGLE_SAVED_GIG':
      const isSaved = state.savedGigs.includes(action.payload);
      const newSavedGigs = isSaved
        ? state.savedGigs.filter(id => id !== action.payload)
        : [...state.savedGigs, action.payload];
      return { ...state, savedGigs: newSavedGigs };
    
    case 'ADD_RECENT_SEARCH':
      const newRecentSearches = [action.payload, ...state.recentSearches.filter(s => s !== action.payload)].slice(0, 10);
      return { ...state, recentSearches: newRecentSearches };
    
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] };
    
    case 'TOGGLE_FAVORITE_CATEGORY':
      const isFavorite = state.favoriteCategories.includes(action.payload);
      const newFavoriteCategories = isFavorite
        ? state.favoriteCategories.filter(cat => cat !== action.payload)
        : [...state.favoriteCategories, action.payload];
      return { ...state, favoriteCategories: newFavoriteCategories };
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    
    case 'LOAD_FROM_STORAGE':
      if (typeof window === 'undefined') return state;
      
      try {
        const savedGigs = JSON.parse(localStorage.getItem('savedGigs') || '[]');
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const favoriteCategories = JSON.parse(localStorage.getItem('favoriteCategories') || '[]');
        const viewMode = localStorage.getItem('viewMode') as 'grid' | 'list' || 'grid';
        const sortBy = localStorage.getItem('sortBy') || 'recent';
        const filters = JSON.parse(localStorage.getItem('gigsFilters') || JSON.stringify(initialState.filters));
        
        return {
          ...state,
          savedGigs,
          recentSearches,
          favoriteCategories,
          viewMode,
          sortBy,
          filters
        };
      } catch (error) {
        console.error('Error loading gigs state from storage:', error);
        return state;
      }
    
    default:
      return state;
  }
}

interface GigsContextType {
  state: GigsState;
  actions: {
    toggleSavedGig: (gigId: string) => void;
    addRecentSearch: (search: string) => void;
    clearRecentSearches: () => void;
    toggleFavoriteCategory: (category: string) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setSortBy: (sort: string) => void;
    setFilters: (filters: Partial<GigsState['filters']>) => void;
    resetFilters: () => void;
  };
  gigsManager: ReturnType<typeof useGigsManager>;
}

const GigsContext = createContext<GigsContextType | undefined>(undefined);

export function GigsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(gigsReducer, initialState);

  // Initialize gigs manager with current filters
  // Note: No authentication required for viewing gigs
  const gigsManager = useGigsManager({
    initialParams: {
      category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
      // Add other search parameters as needed
    },
    autoFetch: true,
    enableCache: true
  });

  // Load saved gigs from backend when user is authenticated
  useEffect(() => {
    const loadSavedGigs = async () => {
      if (user) {
        try {
          const response = await apiClient.getSavedJobs();
          if (response.success && response.data) {
            const savedGigIds = response.data.map((savedJob: any) => {
              const jobObj = (savedJob?.jobId && typeof savedJob.jobId === 'object') ? savedJob.jobId : null;
              return jobObj?._id || savedJob?.jobId || savedJob?._id;
            }).filter(Boolean);
            dispatch({ type: 'SET_SAVED_GIGS', payload: savedGigIds });
          }
        } catch (error) {
          console.error('Error loading saved gigs:', error);
        }
      }
    };

    loadSavedGigs();
  }, [user]);

  // Load state from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'LOAD_FROM_STORAGE' });
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('savedGigs', JSON.stringify(state.savedGigs));
    localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    localStorage.setItem('favoriteCategories', JSON.stringify(state.favoriteCategories));
    localStorage.setItem('viewMode', state.viewMode);
    localStorage.setItem('sortBy', state.sortBy);
    localStorage.setItem('gigsFilters', JSON.stringify(state.filters));
  }, [state]);

  // Actions
  const toggleSavedGig = useCallback((gigId: string) => {
    dispatch({ type: 'TOGGLE_SAVED_GIG', payload: gigId });
  }, []);

  const addRecentSearch = useCallback((search: string) => {
    if (search.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: search.trim() });
    }
  }, []);

  const clearRecentSearches = useCallback(() => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  }, []);

  const toggleFavoriteCategory = useCallback((category: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE_CATEGORY', payload: category });
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSortBy = useCallback((sort: string) => {
    dispatch({ type: 'SET_SORT_BY', payload: sort });
  }, []);

  const setFilters = useCallback((filters: Partial<GigsState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Refetch gigs when filters change
  useEffect(() => {
    gigsManager.fetchGigs({
      category: state.filters.category !== 'all' ? state.filters.category as any : undefined,
    });
  }, [state.filters.category]); // Remove gigsManager.fetchGigs to prevent infinite loop

  const contextValue: GigsContextType = {
    state,
    actions: {
      toggleSavedGig,
      addRecentSearch,
      clearRecentSearches,
      toggleFavoriteCategory,
      setViewMode,
      setSortBy,
      setFilters,
      resetFilters
    },
    gigsManager
  };

  return (
    <GigsContext.Provider value={contextValue}>
      {children}
    </GigsContext.Provider>
  );
}

export function useGigs() {
  const context = useContext(GigsContext);
  if (context === undefined) {
    throw new Error('useGigs must be used within a GigsProvider');
  }
  return context;
}
