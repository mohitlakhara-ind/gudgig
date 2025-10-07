/**
 * Real Saved Jobs Service
 * Integrates with backend API for saved jobs functionality
 */

export interface SavedJob {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  budget?: number;
  salary?: string;
  description: string;
  skills: string[];
  tags: string[];
  urgent: boolean;
  remote: boolean;
  experience: string;
  postedDate: string;
  savedDate: string;
  employer: {
    _id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
  status: 'active' | 'closed' | 'paused';
  applicationsCount: number;
  deadline?: string;
}

export interface SavedJobsResponse {
  success: boolean;
  data: SavedJob[];
  message?: string;
  meta?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface SavedJobResponse {
  success: boolean;
  data: SavedJob;
  message?: string;
}

class SavedJobsService {
  private baseUrl: string;

  constructor() {
    // Use standardized frontend backend URL (includes "/api") and default to port 5000
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
  }

  // Get all saved jobs
  async getSavedJobs(params?: {
    search?: string;
    type?: string;
    location?: string;
    urgent?: boolean;
    remote?: boolean;
    limit?: number;
    page?: number;
  }): Promise<SavedJobsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.set('search', params.search);
      if (params?.type && params.type !== 'all') queryParams.set('type', params.type);
      if (params?.location && params.location !== 'all') queryParams.set('location', params.location);
      if (typeof params?.urgent === 'boolean') queryParams.set('urgent', String(params.urgent));
      if (typeof params?.remote === 'boolean') queryParams.set('remote', String(params.remote));
      if (params?.limit) queryParams.set('limit', String(params.limit));
      if (params?.page) queryParams.set('page', String(params.page));

      const query = queryParams.toString();
      const url = `${this.baseUrl}/saved-jobs${query ? `?${query}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const meta = data?.pagination ? {
        total: data.pagination.total,
        page: data.pagination.page,
        pages: data.pagination.pages,
        limit: data.pagination.limit,
      } : undefined;
      return {
        success: !!data?.success,
        data: data?.data || [],
        message: data?.message,
        meta,
      };
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch saved jobs'
      };
    }
  }

  // Get saved job by ID
  async getSavedJobById(id: string): Promise<SavedJobResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching saved job:', error);
      return {
        success: false,
        data: {} as SavedJob,
        message: 'Failed to fetch saved job'
      };
    }
  }

  // Save a job
  async saveJob(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving job:', error);
      return {
        success: false,
        message: 'Failed to save job'
      };
    }
  }

  // Remove a saved job
  async removeSavedJob(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing saved job:', error);
      return {
        success: false,
        message: 'Failed to remove saved job'
      };
    }
  }

  // Check if job is saved
  async isJobSaved(jobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/check/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!(data?.success && (data?.data?.saved === true));
    } catch (error) {
      console.error('Error checking if job is saved:', error);
      return false;
    }
  }

  // Get saved jobs count
  async getSavedJobsCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data?.success ? Number(data?.data?.count || 0) : 0;
    } catch (error) {
      console.error('Error fetching saved jobs count:', error);
      return 0;
    }
  }

  // Bulk operations
  async bulkSaveJobs(jobIds: string[]): Promise<{ success: boolean; message: string; saved: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/bulk-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk saving jobs:', error);
      return {
        success: false,
        message: 'Failed to save jobs',
        saved: 0
      };
    }
  }

  async bulkRemoveJobs(jobIds: string[]): Promise<{ success: boolean; message: string; removed: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/saved-jobs/bulk-remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ jobIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk removing jobs:', error);
      return {
        success: false,
        message: 'Failed to remove jobs',
        removed: 0
      };
    }
  }
}

// Create and export singleton instance
export const savedJobsService = new SavedJobsService();
export default savedJobsService;


