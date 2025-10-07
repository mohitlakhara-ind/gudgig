import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, ApiClientError } from '@/lib/api';
import { Job, JobsResponse, SearchJobsRequest } from '@/types/api';
import toast from 'react-hot-toast';

interface UseGigsManagerOptions {
  initialParams?: SearchJobsRequest;
  autoFetch?: boolean;
  enableCache?: boolean;
  cacheTimeout?: number; // in milliseconds
}

interface GigsManagerState {
  gigs: Job[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  hasMore: boolean;
  isRefreshing: boolean;
  lastFetchTime: number | null;
}

interface GigsManagerActions {
  fetchGigs: (params?: SearchJobsRequest) => Promise<void>;
  loadMoreGigs: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
  retry: () => Promise<void>;
}

export function useGigsManager(options: UseGigsManagerOptions = {}): GigsManagerState & GigsManagerActions {
  const { 
    initialParams, 
    autoFetch = true, 
    enableCache = true, 
    cacheTimeout = 5 * 60 * 1000 // 5 minutes
  } = options;

  // State
  const [state, setState] = useState<GigsManagerState>({
    gigs: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    hasMore: false,
    isRefreshing: false,
    lastFetchTime: null
  });

  // Cache management
  const cacheRef = useRef<Map<string, { data: JobsResponse; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialParamsRef = useRef(initialParams);

  // Generate cache key
  const getCacheKey = useCallback((params: SearchJobsRequest = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key as keyof SearchJobsRequest];
        return result;
      }, {} as any);
    return JSON.stringify(sortedParams);
  }, []);

  // Check if cache is valid
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheTimeout;
  }, [cacheTimeout]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Fetch gigs with caching and error handling
  const fetchGigs = useCallback(async (params?: SearchJobsRequest) => {
    const searchParams = { ...initialParamsRef.current, ...params };
    const cacheKey = getCacheKey(searchParams);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first
    if (enableCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      if (isCacheValid(cached.timestamp)) {
        setState(prev => ({
          ...prev,
          gigs: Array.isArray(cached.data.data) ? cached.data.data : cached.data.data || [],
          pagination: {
            page: cached.data.pagination?.page || 1,
            limit: cached.data.pagination?.limit || 10,
            total: cached.data.total || 0,
            totalPages: cached.data.pagination?.totalPages || 1
          },
          hasMore: (cached.data.pagination?.page || 1) < (cached.data.pagination?.totalPages || 1),
          error: null,
          lastFetchTime: cached.timestamp
        }));
        return;
      } else {
        // Remove expired cache
        cacheRef.current.delete(cacheKey);
      }
    }

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        isRefreshing: prev.gigs.length > 0
      }));

      const response: JobsResponse = await apiClient.getGigs(searchParams);

      // Handle response data
      const gigsData = Array.isArray(response.data) ? response.data : response.data || [];
      
      // Update cache
      if (enableCache) {
        cacheRef.current.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
      }

      setState(prev => ({
        ...prev,
        gigs: gigsData,
        pagination: {
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.total || gigsData.length,
          totalPages: response.pagination?.totalPages || 1
        },
        hasMore: (response.pagination?.page || 1) < (response.pagination?.totalPages || 1),
        loading: false,
        isRefreshing: false,
        error: null,
        lastFetchTime: Date.now()
      }));

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return; // Request was cancelled
      }

      const errorMessage = err instanceof ApiClientError ? err.message : 'Failed to fetch gigs';
      
      setState(prev => ({
        ...prev,
        loading: false,
        isRefreshing: false,
        error: errorMessage,
        gigs: [] // Clear gigs on error
      }));

      // Show error toast for all failed requests
      toast.error(errorMessage);
    }
  }, [enableCache, getCacheKey, isCacheValid]); // Remove initialParams to prevent infinite loop

  // Load more gigs
  const loadMoreGigs = useCallback(async () => {
    if (state.pagination.page >= state.pagination.totalPages || state.loading) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const nextPage = state.pagination.page + 1;
      const response: JobsResponse = await apiClient.getGigs({
        ...initialParamsRef.current,
        page: nextPage
      });

      const newGigsData = Array.isArray(response.data) ? response.data : response.data || [];
      
      setState(prev => ({
        ...prev,
        gigs: [...prev.gigs, ...newGigsData],
        pagination: {
          ...prev.pagination,
          page: nextPage
        },
        loading: false,
        hasMore: nextPage < (response.pagination?.totalPages || 1)
      }));

    } catch (err) {
      const errorMessage = err instanceof ApiClientError ? err.message : 'Failed to load more gigs';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      toast.error(errorMessage);
    }
  }, [state.pagination.page, state.pagination.totalPages, state.loading]); // Remove initialParams

  // Refresh data
  const refresh = useCallback(async () => {
    clearCache();
    await fetchGigs();
  }, [clearCache]); // Remove fetchGigs from dependencies

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry last request
  const retry = useCallback(async () => {
    clearError();
    await fetchGigs();
  }, [clearError]); // Remove fetchGigs from dependencies

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchGigs();
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [autoFetch]); // Remove fetchGigs from dependencies to prevent infinite loop

  // Cleanup expired cache periodically
  useEffect(() => {
    if (!enableCache) return;

    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of cacheRef.current.entries()) {
        if (!isCacheValid(value.timestamp)) {
          cacheRef.current.delete(key);
        }
      }
    }, cacheTimeout);

    return () => clearInterval(interval);
  }, [enableCache, isCacheValid, cacheTimeout]);

  return {
    ...state,
    fetchGigs,
    loadMoreGigs,
    refresh,
    clearError,
    clearCache,
    retry
  };
}

// Utility functions for gigs
export const getGigTypeColor = (type: string) => {
  switch (type) {
    case 'micro-task': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'short-project': return 'bg-primary/10 text-primary border-primary/20';
    case 'hourly': return 'bg-accent/10 text-accent border-accent/20';
    case 'fixed-price': return 'bg-success/10 text-success border-success/20';
    case 'freelance': return 'bg-accent/10 text-accent border-accent/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const formatGigBudget = (job: Job) => {
  const budget = job.salary?.min || job.salaryDisclosure?.min;
  const budgetMax = job.salary?.max || job.salaryDisclosure?.max;
  const currency = job.salary?.currency || job.salaryDisclosure?.currency || 'USD';
  const period = job.salaryDisclosure?.period || job.salary?.period || 'project';

  const prefix = period === 'hourly' ? '/hr' : '';

  if (budget && budgetMax) {
    return `${currency}${budget.toLocaleString()} - ${currency}${budgetMax.toLocaleString()}${prefix}`;
  } else if (budget) {
    return `From ${currency}${budget.toLocaleString()}${prefix}`;
  } else if (budgetMax) {
    return `Up to ${currency}${budgetMax.toLocaleString()}${prefix}`;
  }
  return period === 'hourly' ? 'Hourly rate not disclosed' : 'Project budget not disclosed';
};

export const getGigStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'closed': return 'bg-red-100 text-red-800 border-red-200';
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getDaysAgo = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};
