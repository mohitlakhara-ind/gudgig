import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiClientError } from '@/lib/api';
import { Job, JobsResponse } from '@/types/api';

interface UseGigsOptions {
  initialParams?: any;
  autoFetch?: boolean;
}

export function useGigs(options: UseGigsOptions = {}) {
  const { initialParams, autoFetch = true } = options;

  const [gigs, setGigs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchGigs = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = { ...initialParams, ...params };
      const response: JobsResponse = await apiClient.getGigs(searchParams);

      // Handle both direct data array and nested data structure
      const gigsData = Array.isArray(response.data) ? response.data : response.data || [];
      
      setGigs(gigsData);
      setPagination({
        page: (response as any).pagination?.page || 1,
        limit: (response as any).pagination?.limit || 10,
        total: (response as any).total || gigsData.length,
        totalPages: (response as any).pagination?.totalPages || 1
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  const loadMoreGigs = useCallback(async () => {
    if (pagination.page >= pagination.totalPages) return;

    try {
      setLoading(true);
      const nextPage = pagination.page + 1;
      const response: JobsResponse = await apiClient.getGigs({
        ...initialParams,
        page: nextPage
      });

      // Handle both direct data array and nested data structure
      const newGigsData = Array.isArray(response.data) ? response.data : response.data || [];
      
      setGigs(prev => [...prev, ...newGigsData]);
      setPagination(prev => ({ ...prev, page: nextPage }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load more gigs');
    } finally {
      setLoading(false);
    }
  }, [initialParams, pagination.page, pagination.totalPages]);

  const refresh = useCallback(() => {
    fetchGigs();
  }, [fetchGigs]);

  useEffect(() => {
    if (autoFetch) {
      fetchGigs();
    }
  }, [fetchGigs, autoFetch]);

  return {
    gigs,
    loading,
    error,
    pagination,
    fetchGigs,
    refresh
  };
}

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
  const budget = job.salaryDisclosure?.min || job.salary?.min;
  const budgetMax = job.salaryDisclosure?.max || job.salary?.max;
  const currency = job.salaryDisclosure?.currency || job.salary?.currency || 'USD';
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


