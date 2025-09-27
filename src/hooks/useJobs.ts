import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiClientError } from '@/lib/api';
import { Job, JobsResponse, SearchJobsRequest } from '@/types/api';

interface UseJobsOptions {
  initialParams?: SearchJobsRequest;
  autoFetch?: boolean;
}

export function useJobs(options: UseJobsOptions = {}) {
  const { initialParams, autoFetch = true } = options;
  const gigTypes = new Set(['micro-task', 'short-project', 'hourly', 'fixed-price', 'freelance']);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchJobs = useCallback(async (params?: SearchJobsRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = { ...initialParams, ...params };
      const shouldUseGigApi = searchParams?.type && typeof searchParams.type === 'string' && gigTypes.has(searchParams.type);
      if (process.env.NODE_ENV !== 'production' && shouldUseGigApi) {
        // Encourage migration
        // eslint-disable-next-line no-console
        console.warn('[deprecation] useJobs called with a gig type. Prefer useGigs for microjobs.');
      }
      const response: JobsResponse = shouldUseGigApi
        ? await apiClient.getGigs(searchParams)
        : await apiClient.getJobs(searchParams);
      
      setJobs(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.total,
        totalPages: response.pagination.totalPages
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  const loadMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;
    
    try {
      setLoading(true);
      const nextPage = pagination.page + 1;
      const shouldUseGigApi = initialParams?.type && typeof initialParams.type === 'string' && gigTypes.has(initialParams.type);
      const response: JobsResponse = shouldUseGigApi
        ? await apiClient.getGigs({ ...initialParams, page: nextPage })
        : await apiClient.getJobs({ ...initialParams, page: nextPage });
      
      setJobs(prev => [...prev, ...response.data]);
      setPagination(prev => ({
        ...prev,
        page: nextPage
      }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load more jobs');
    } finally {
      setLoading(false);
    }
  }, [initialParams, pagination.page, pagination.totalPages]);

  const refresh = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (autoFetch) {
      fetchJobs();
    }
  }, [fetchJobs, autoFetch]);

  return {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    loadMore,
    refresh,
    hasMore: pagination.page < pagination.totalPages
  };
}

// Hook for single job
export function useJob(jobId: string) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getJob(jobId);
      setJob(response.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob
  };
}

// Hook for job statistics
export function useJobStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getEmployerStats();
      setStats(response.data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch job statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Utility functions for job display
export const getJobStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getJobTypeColor = (type: string) => {
  switch (type) {
    case 'full-time': return 'bg-success/10 text-success border-success/20';
    case 'part-time': return 'bg-primary/10 text-primary border-primary/20';
    case 'contract': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'internship': return 'bg-warning/10 text-warning border-warning/20';
    case 'freelance': return 'bg-accent/10 text-accent border-accent/20';
    case 'micro-task': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'short-project': return 'bg-primary/10 text-primary border-primary/20';
    case 'hourly': return 'bg-accent/10 text-accent border-accent/20';
    case 'fixed-price': return 'bg-success/10 text-success border-success/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Technology': return 'bg-primary/10 text-primary border-primary/20';
    case 'Design': return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'Marketing': return 'bg-success/10 text-success border-success/20';
    case 'Sales': return 'bg-warning/10 text-warning border-warning/20';
    case 'Product': return 'bg-accent/10 text-accent border-accent/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const formatSalary = (job: Job) => {
  const { salary } = job;
  if (salary.min && salary.max) {
    return `${salary.currency}${salary.min.toLocaleString()} - ${salary.currency}${salary.max.toLocaleString()}`;
  } else if (salary.min) {
    return `From ${salary.currency}${salary.min.toLocaleString()}`;
  } else if (salary.max) {
    return `Up to ${salary.currency}${salary.max.toLocaleString()}`;
  }
  return 'Salary not disclosed';
};