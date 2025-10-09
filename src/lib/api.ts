import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, JobsResponse, JobResponse, CreateJobRequest, ApiError, ApiResponse, User, Job, CreateBidRequest, BidResponse, BidsResponse, AdminSettings, AdminStatsResponse, ConversationsResponse, MessagesResponse, StartConversationRequest, SendMessageRequest, NotificationsResponse, UnreadCountResponse, JobSeekerStatsResponse, EmployerStatsResponse, ApplicationsResponse, ApplicationResponse, Service, Order, Review, FreelancerProfile, ServicesResponse, ServiceResponse, OrdersResponse, OrderResponse, ReviewsResponse, ReviewResponse, FreelancerProfileResponse, SearchJobsRequest } from '@/types/api';
import * as Sentry from '@sentry/nextjs';
import { log } from './logger';

export class ApiClientError extends Error {
  constructor(public statusCode: number, public payload?: any, message?: string) {
    super(message || payload?.message || 'Request failed');
    this.name = 'ApiClientError';
  }
}

// Resolve API base URL via backend-url utility: compose BACKEND_URL + API_URL
import { getBackendUrl } from '@/lib/backend-url';
const API_BASE_URL = (() => {
  // Compose BASE + API prefix from envs
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim().replace(/\/$/, '');
  const apiPath = (process.env.NEXT_PUBLIC_API_URL || '/api').trim();
  const apiPrefix = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  const composed = backend ? `${backend}${apiPrefix}` : '';
  if (composed) return composed;
  // Browser fallback to current origin + API prefix
  if (typeof window !== 'undefined') return `${window.location.origin}${apiPrefix}`;
  // SSR fallback to internal API proxy
  return apiPrefix;
})();

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private csrfToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
    this.refreshToken = this.getStoredRefreshToken();
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    this.token = token;
  }

  private setStoredRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken);
    }
    this.refreshToken = refreshToken;
  }

  private clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    this.token = null;
    this.refreshToken = null;
  }

  // Public methods to set tokens (for use by AuthContext)
  public setTokens(token: string, refreshToken: string): void {
    this.setStoredToken(token);
    this.setStoredRefreshToken(refreshToken);
  }

  public clearTokens(): void {
    this.clearStoredTokens();
  }

  private isStateChangingMethod(method: string): boolean {
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0,
    maxRetries = 3
  ): Promise<T> {
    const isInternalAppRoute = endpoint.startsWith('/app-api/') || endpoint.startsWith('/api/');
    // Always proxy external endpoints via Next.js internal /api to avoid browser CORS
    const url = isInternalAppRoute
      ? endpoint
      : (typeof window !== 'undefined'
          ? `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}` // browser proxy via Next
          : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`); // server direct
    const method = options.method || 'GET';
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Re-enable CSRF protection for state-changing requests
    if (this.isStateChangingMethod(method)) {
      if (!this.csrfToken) {
        try {
          this.csrfToken = await this.fetchCsrfToken();
        } catch (e) {
          log.warn('csrf_token_fetch_failed');
        }
      }
      if (this.csrfToken) {
        headers['X-CSRF-Token'] = this.csrfToken;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      

      if (response.status === 401 && this.refreshToken && retryCount === 0) {
        // Try to refresh token
        
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.request<T>(endpoint, options, retryCount + 1, maxRetries);
        }
      }

      // Safely parse JSON; handle text responses (e.g., rate limit HTML/text)
      const contentType = response.headers.get('content-type') || '';
      let json: any = null;
      let rawText: string | null = null;
      if (response.status === 204) {
        json = {};
      } else if (contentType.includes('application/json')) {
        json = await response.json().catch(() => null);
      } else {
        rawText = await response.text().catch(() => null);
      }

      if (process.env.NODE_ENV === 'development') {
        log.debug('api_response', { endpoint, status: response.status });
      }

      if (!response.ok) {
        const messageFromText = rawText && rawText.slice(0, 200);
        const errorData: ApiError = (json && typeof json === 'object') ? json : {
          success: false,
          message: messageFromText || response.statusText || 'Network error',
          statusCode: response.status,
        };
        
        // Retry on server errors (5xx) or rate limiting (429)
        if ((response.status >= 500 || response.status === 429) && retryCount < maxRetries) {
          log.info('request_retry', { attempt: retryCount + 1, maxRetries });
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)); // Exponential backoff
          return this.request<T>(endpoint, options, retryCount + 1, maxRetries);
        }
        
        throw new ApiClientError(response.status, errorData, errorData.message);
      }
      
      const metaHeaders: Record<string, string> = {};
      ['X-Remaining-Job-Views','X-Remaining-Applications'].forEach(h => {
        const v = response.headers.get(h);
        if (v !== null) metaHeaders[h] = v;
      });
      if (Object.keys(metaHeaders).length > 0 && typeof json === 'object' && json) {
        json.meta = { ...(json.meta || {}), headers: metaHeaders };
      }
      if (json !== null) return json as T;
      // Fallback shape for non-JSON successful responses
      return ({ success: true, message: rawText || 'OK' } as unknown) as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError(0, null, 'Request timeout. Please try again.');
        }
        if (error.name === 'TypeError') {
          throw new ApiClientError(0, null, 'Network error. Please check your connection.');
        }
      }
      throw error;
    }
  }

  private async fetchCsrfToken(): Promise<string> {
    // Use internal Next.js proxy in the browser to avoid CORS/misconfigured envs
    const url = (typeof window !== 'undefined')
      ? '/api/auth/csrf-token'
      : `${this.baseURL}/auth/csrf-token`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Failed to obtain CSRF token');
    }
    const data = await response.json();
    return data.csrfToken as string;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      log.info('refresh_access_token_start');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for refresh
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: { token: string; refreshToken: string } = await response.json();
        
        this.setStoredToken(data.token);
        this.setStoredRefreshToken(data.refreshToken);
        log.info('refresh_access_token_success');
        return true;
      } else {
        log.warn('refresh_access_token_failed', { status: response.status });
        return false;
      }
    } catch (error) {
      Sentry.captureException(error);
      return false;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.setStoredToken(response.token);
      this.setStoredRefreshToken(response.refreshToken);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearStoredTokens();
    }
  }

  // OTP helpers
  async sendOtp(payload: { email?: string; phone?: string; channel: 'email' | 'sms'; purpose: 'signup' | 'login' | 'password-reset' | 'verification'; }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/send-otp', { method: 'POST', body: JSON.stringify(payload) });
  }

  async verifyOtp(payload: { email?: string; phone?: string; otp: string; purpose: 'signup' | 'login' | 'password-reset' | 'verification'; }): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) });
  }

  async resendOtp(payload: { email?: string; phone?: string; channel: 'email' | 'sms'; purpose: 'signup' | 'login' | 'password-reset' | 'verification'; }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/resend-otp', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Forgot password with OTP
  async forgotPasswordOtp(payload: { email?: string; phone?: string; channel: 'email' | 'sms' }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/forgot-password-otp', { method: 'POST', body: JSON.stringify(payload) });
  }

  async resetPasswordOtp(payload: { email?: string; phone?: string; otp: string; newPassword: string }): Promise<ApiResponse & { token: string; refreshToken: string; user: User }> {
    return this.request<ApiResponse & { token: string; refreshToken: string; user: User }>('/auth/reset-password-otp', { method: 'POST', body: JSON.stringify(payload) });
  }

  async getCurrentUser(): Promise<User> {
    try {
      log.debug('get_current_user_start');
      const response = await this.request<ApiResponse<User>>('/auth/me');
      log.debug('get_current_user_success');
      return response.data!;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/app-api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Gigs
  async getGig(id: string): Promise<JobResponse> {
    return this.request<JobResponse>(`/gigs/${id}`);
  }

  /**
   * Fetch microgigs/services similar to jobs for recommendations and listings
   */
  async getGigs(params?: { limit?: number; page?: number; category?: string; status?: string }): Promise<JobsResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.category) qs.set('category', params.category);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return this.request<JobsResponse>(`/gigs${query ? `?${query}` : ''}`);
  }

  /**
   * Backwards-compatible jobs listing API. Currently aliases to gigs list
   * with basic parameter mapping until a dedicated /jobs endpoint exists.
   */
  async getJobs(params?: SearchJobsRequest): Promise<JobsResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.category) qs.set('category', String(params.category));
    if (params?.type) qs.set('type', String(params.type));
    if (params?.location) qs.set('location', params.location);
    if (params?.query) qs.set('search', params.query);
    if (params?.minBudget) qs.set('minBudget', String(params.minBudget));
    if (params?.maxBudget) qs.set('maxBudget', String(params.maxBudget));
    if (params?.sortBy) qs.set('sort', params.sortBy);
    const query = qs.toString();
    // Alias to gigs endpoint for now
    return this.request<JobsResponse>(`/gigs${query ? `?${query}` : ''}`);
  }

  /**
   * Saved jobs helpers
   */
  async getSavedJobs(params?: { 
    search?: string; 
    type?: string; 
    location?: string; 
    urgent?: boolean; 
    remote?: boolean; 
    limit?: number; 
    page?: number 
  }): Promise<ApiResponse<any[]>> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.type) qs.set('type', params.type);
    if (params?.location) qs.set('location', params.location);
    if (typeof params?.urgent === 'boolean') qs.set('urgent', String(params.urgent));
    if (typeof params?.remote === 'boolean') qs.set('remote', String(params.remote));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    return this.request<ApiResponse<any[]>>(`/api/saved-jobs${query ? `?${query}` : ''}`);
  }

  async saveJob(jobId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  }

  async unsaveJob(jobId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/saved-jobs/${jobId}`, { method: 'DELETE' });
  }

  /**
   * Job alerts helpers
   */
  async getJobAlerts(): Promise<ApiResponse<{ alerts: Array<{ _id: string; keyword?: string; category?: string; location?: string }> }>> {
    return this.request(`/app-api/job-alerts`);
  }

  async createJobAlert(criteria: { keyword?: string; category?: string; location?: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/app-api/job-alerts', { method: 'POST', body: JSON.stringify(criteria) });
  }

  async deleteJobAlert(alertId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/app-api/job-alerts/${alertId}`, { method: 'DELETE' });
  }

  // Backwards-compatible alias to gigs
  async getJob(id: string): Promise<JobResponse> {
    return this.getGig(id);
  }

  // Bids
  async createBid(payload: CreateBidRequest): Promise<BidResponse> {
    return this.request<BidResponse>('/bids', { method: 'POST', body: JSON.stringify(payload) });
  }
  async getMyBids(): Promise<BidsResponse> {
    return this.request<BidsResponse>('/bids/my');
  }

  /**
   * Create a bid for a gig/job via internal Next.js API route.
   * This route enforces auth and proxies to the backend with robust handling.
   */
  async createGigBid(jobId: string, payload: { quotation: string | number; proposal: string; bidFeePaid?: number }): Promise<ApiResponse> {
    // Use generic bids endpoint; backend resolves job by ID
    return this.request<ApiResponse>('/bids', {
      method: 'POST',
      body: JSON.stringify({ jobId, quotation: String(payload.quotation), proposal: payload.proposal, bidFeePaid: payload.bidFeePaid }),
    });
  }

  /**
   * Fetch bids for a specific gig via internal route (auth required on server).
   */
  async getGigBids(jobId: string): Promise<BidsResponse> {
    return this.request<BidsResponse>(`/gigs/${jobId}/bids`);
  }

  /**
   * Backwards-compatible alias for getGigBids
   */
  async getJobBids(jobId: string): Promise<BidsResponse> {
    return this.getGigBids(jobId);
  }

  /**
   * Get bid count for a job (counts succeeded payments as valid bids)
   */
  async getJobBidCount(jobId: string): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>(`/jobs/${jobId}/bids/count`);
  }

  // Upload image to backend (Cloudinary)
  async uploadImage(file: File, options?: { folder?: string }): Promise<ApiResponse<{ url: string; publicId: string; width: number; height: number; format: string; bytes: number; mime: string }>> {
    const form = new FormData();
    form.append('file', file);
    if (options?.folder) form.append('folder', options.folder);
    // Use explicit internal API path so that in the browser it proxies to
    // NEXT_PUBLIC_BACKEND_URL + NEXT_PUBLIC_API_URL + /uploads/image
    // and aligns with server expectations.
    return this.request<ApiResponse<{ url: string; publicId: string; width: number; height: number; format: string; bytes: number; mime: string }>>('/api/uploads/image', {
      method: 'POST',
      body: form
    });
  }

  // Admin: statistics
  async getAdminStats(): Promise<AdminStatsResponse> {
    return this.request<AdminStatsResponse>('/admin/stats');
  }

  /**
   * Returns dashboard statistics for job seekers: applications, interviews, offers, profileCompleteness
   */
  async getJobSeekerStats(): Promise<JobSeekerStatsResponse> {
    return this.request<JobSeekerStatsResponse>('/app-api/stats/jobseeker');
  }

  /**
   * Returns employer dashboard statistics like activeJobs, totalApplications, interviewsScheduled, hiresThisMonth, viewsThisMonth, responseRate
   */
  async getEmployerStats(): Promise<EmployerStatsResponse> {
    return this.request<EmployerStatsResponse>('/app-api/stats/employer');
  }

  /**
   * Fetch applications for the current user with optional filters
   */
  async getApplications(params?: { limit?: number; page?: number; status?: string }): Promise<ApplicationsResponse> {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.page) qs.set('page', String(params.page));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return this.request<ApplicationsResponse>(`/app-api/applications${query ? `?${query}` : ''}`);
  }

  /**
   * Update application status (e.g., withdraw, accept interview, etc.)
   */
  async updateApplicationStatus(applicationId: string, status: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/app-api/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  /**
   * Withdraw an application
   */
  async withdrawApplication(applicationId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/app-api/applications/${applicationId}/withdraw`, { method: 'PUT' });
  }

  /**
   * Create a new application for a job
   */
  async createApplication(data: { job: string; coverLetter: string }): Promise<ApplicationResponse> {
    return this.request<ApplicationResponse>('/app-api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin: gig bids (removed duplicate)

  // Admin: all bids
  async getAllBids(params?: { page?: number; limit?: number; jobId?: string; status?: 'pending' | 'succeeded' | 'failed'; from?: string; to?: string; sort?: string }): Promise<BidsResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.jobId) search.set('jobId', params.jobId);
    if (params?.status) search.set('status', params.status);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    if (params?.sort) search.set('sort', params.sort);
    const qs = search.toString();
    return this.request<BidsResponse>(`/admin/bids${qs ? `?${qs}` : ''}`);
  }

  // Admin: update bid selection status
  async updateAdminBidSelection(bidId: string, status: 'accepted' | 'rejected'): Promise<ApiResponse<{ bidId: string; status: string }>> {
    return this.request<ApiResponse<{ bidId: string; status: string }>>(`/admin/bids/${bidId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Admin Gigs
  async createGig(jobData: Partial<CreateJobRequest>): Promise<JobResponse> {
    return this.request<JobResponse>('/gigs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateGig(id: string, jobData: Partial<CreateJobRequest>): Promise<JobResponse> {
    return this.request<JobResponse>(`/gigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteGig(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/gigs/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin settings
  async getBidFees(): Promise<ApiResponse<AdminSettings>> {
    return this.request<ApiResponse<AdminSettings>>('/admin/bid-fees');
  }
  async setBidFees(fees: number[], active?: number): Promise<ApiResponse<AdminSettings>> {
    return this.request<ApiResponse<AdminSettings>>('/admin/bid-fees', { method: 'POST', body: JSON.stringify({ fees, active }) });
  }

  /**
   * Admin: users management - now connected to real backend endpoints.
   * These methods provide full CRUD operations for user management.
   */
  /**
   * Retrieve paginated list of users with optional filters.
   * @param params Optional filters and pagination
   * @returns ApiResponse with users list and pagination meta
   */
  async getAllUsers(params?: { page?: number; limit?: number; role?: string; isActive?: boolean; search?: string }): Promise<ApiResponse<{ users: User[]; total: number; page: number; pages: number }>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.role) qs.set('role', params.role);
    if (typeof params?.isActive === 'boolean') qs.set('isActive', String(params.isActive));
    if (params?.search) qs.set('search', params.search);
    const raw = await this.request<any>(`/admin/users${qs.toString() ? `?${qs.toString()}` : ''}`);
    // Normalize backend response { success, users, total, page, pages } -> ApiResponse<{...}>
    return {
      success: !!raw?.success,
      message: raw?.message,
      data: {
        users: raw?.users || [],
        total: raw?.total ?? 0,
        page: raw?.page ?? params?.page ?? 1,
        pages: raw?.pages ?? 1
      }
    } as ApiResponse<{ users: User[]; total: number; page: number; pages: number }>;
  }

  /**
   * Retrieve a single user by id.
   * @param userId User identifier
   * @returns ApiResponse<User>
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    const raw = await this.request<any>(`/admin/users/${userId}`);
    // Normalize backend response { success, user } -> ApiResponse<User>
    return {
      success: !!raw?.success,
      message: raw?.message,
      data: raw?.user as User
    } as ApiResponse<User>;
  }

  /**
   * Update user fields (partial update allowed).
   * @param userId User identifier
   * @param data Partial<User> fields to update
   * @returns ApiResponse<User>
   */
  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const raw = await this.request<any>(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
    // Normalize backend response { success, message, user } -> ApiResponse<User>
    return {
      success: !!raw?.success,
      message: raw?.message,
      data: raw?.user as User
    } as ApiResponse<User>;
  }

  /**
   * Delete (or soft delete) a user by id.
   * @param userId User identifier
   * @returns ApiResponse
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    const raw = await this.request<any>(`/admin/users/${userId}`, { method: 'DELETE' });
    return { success: !!raw?.success, message: raw?.message } as ApiResponse;
  }

  /**
   * Toggle a user's active status.
   * @param userId User identifier
   * @param isActive New active status
   * @returns ApiResponse<User>
   */
  async toggleUserStatus(
    userId: string,
    isActive: boolean,
    options?: { durationMinutes?: number; until?: string | Date }
  ): Promise<ApiResponse<User>> {
    const payload: any = { isActive };
    if (options?.durationMinutes) payload.durationMinutes = options.durationMinutes;
    if (options?.until) payload.until = options.until;
    const raw = await this.request<any>(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify(payload) });
    // Normalize backend response { success, message, user } -> ApiResponse<User>
    return {
      success: !!raw?.success,
      message: raw?.message,
      data: raw?.user as User
    } as ApiResponse<User>;
  }

  // Admin analytics
  async getAdminTodayMetrics(): Promise<ApiResponse<{ date: string; errors: number; pageViews: number; uniqueVisitors: number; alertSent: boolean }>> {
    return this.request(`/admin/analytics/metrics/today`);
  }

  async getAdminRecentMetrics(days: number = 7): Promise<ApiResponse<Array<{ date: string; errors: number; pageViews: number; uniqueVisitors: number; alertSent: boolean }>>> {
    const d = Math.max(1, Math.min(days, 30));
    return this.request(`/admin/analytics/metrics/recent?days=${d}`);
  }

  // Chat
  async getConversations(params?: { userId?: string }): Promise<ConversationsResponse> {
    const qs = new URLSearchParams();
    if (params?.userId) qs.set('userId', params.userId);
    const q = qs.toString();
    return this.request<ConversationsResponse>(`/chat${q ? `?${q}` : ''}`);
  }
  async startConversation(payload: StartConversationRequest): Promise<ConversationsResponse> {
    return this.request<ConversationsResponse>('/chat', { method: 'POST', body: JSON.stringify(payload) });
  }
  async getMessages(conversationId: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/${conversationId}/messages`);
  }
  async sendMessage(conversationId: string, payload: SendMessageRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/chat/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(payload) });
  }
  async markConversationRead(conversationId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/chat/${conversationId}/read`, { method: 'PUT' });
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; read?: boolean }): Promise<NotificationsResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (typeof params?.read === 'boolean') qs.set('read', String(params.read));
    const query = qs.toString();
    // Use internal Next routes to avoid external rewrite for now
    try {
      return await this.request<NotificationsResponse>(`/app-api/notifications${query ? `?${query}` : ''}`);
    } catch (error) {
      // If notifications API fails, return empty response
      console.warn('Notifications API not available, returning empty response');
      return {
        success: false,
        message: 'Notifications API not available',
        data: []
      };
    }
  }

  async getUnreadNotificationCount(): Promise<UnreadCountResponse> {
    try {
      // Use authenticated Next.js API proxy to backend
      return await this.request<UnreadCountResponse>('/api/notifications/unread-count');
    } catch (error) {
      // If unread count API fails, return zero count
      console.warn('Unread notification count API not available, returning zero');
      return {
        success: false,
        message: 'Unread count API not available',
        data: { count: 0 }
      };
    }
  }

  // Support
  async submitSupportTicket(payload: { subject: string; message: string; priority?: string }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/api/support', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notification automations
  async triggerWelcomeNotification(payload: { userId: string; userEmail: string; userName?: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/automations/welcome', { method: 'POST', body: JSON.stringify(payload) });
  }

  async triggerGigSentNotification(payload: { userId: string; userEmail: string; jobTitle?: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/automations/gig-sent', { method: 'POST', body: JSON.stringify(payload) });
  }

  async triggerBidFeePaidNotification(payload: { userId: string; userEmail: string; amount: number; jobTitle?: string }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/automations/bidfee-paid', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Admin notifications
  async adminSendNotifications(payload: { userIds: string[]; title: string; message: string; data?: any }): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/api/admin/notifications/send', { method: 'POST', body: JSON.stringify(payload) });
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>(`/app-api/notifications/${notificationId}/read`, { method: 'PUT' });
    } catch (error) {
      console.warn('Mark notification as read API not available');
      return { success: false, message: 'API not available' };
    }
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>('/app-api/notifications/read-all', { method: 'PUT' });
    } catch (error) {
      console.warn('Mark all notifications as read API not available');
      return { success: false, message: 'API not available' };
    }
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    try {
      return await this.request<ApiResponse>(`/app-api/notifications/${notificationId}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Delete notification API not available');
      return { success: false, message: 'API not available' };
    }
  }

  // Auth methods (CSRF endpoint removed)

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/auth/resetpassword/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/auth/verify/${token}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<ApiResponse<{ status: string }>>('/health');
  }

  // Services API
  async getServices(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<ServicesResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return this.request<ServicesResponse>(`/services${query ? `?${query}` : ''}`);
  }

  async getService(serviceId: string): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/services/${serviceId}`);
  }

  async getMyServices(): Promise<ServicesResponse> {
    return this.request<ServicesResponse>('/services/my');
  }

  async createService(serviceData: Partial<Service>): Promise<ServiceResponse> {
    return this.request<ServiceResponse>('/services', { 
      method: 'POST', 
      body: JSON.stringify(serviceData) 
    });
  }

  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/services/${serviceId}`, { 
      method: 'PUT', 
      body: JSON.stringify(serviceData) 
    });
  }

  async deleteService(serviceId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/services/${serviceId}`, { method: 'DELETE' });
  }

  // Orders API
  async getOrders(params?: { page?: number; limit?: number; status?: string; role?: 'buyer' | 'seller' }): Promise<OrdersResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.role) qs.set('role', params.role);
    const query = qs.toString();
    return this.request<OrdersResponse>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}`);
  }

  async createOrder(orderData: { serviceId: string; packageType: string; requirements: any }): Promise<OrderResponse> {
    return this.request<OrderResponse>('/orders', { 
      method: 'POST', 
      body: JSON.stringify(orderData) 
    });
  }

  async updateOrderStatus(orderId: string, status: string, deliverables?: any): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}/status`, { 
      method: 'PUT', 
      body: JSON.stringify({ status, deliverables }) 
    });
  }

  async requestRevision(orderId: string, revisionDetails: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}/revision`, { 
      method: 'POST', 
      body: JSON.stringify({ revisionDetails }) 
    });
  }

  async acceptDelivery(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}/accept`, { method: 'POST' });
  }

  async cancelOrder(orderId: string, reason: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${orderId}/cancel`, { 
      method: 'POST', 
      body: JSON.stringify({ reason }) 
    });
  }

  // Reviews API
  async getReviews(params?: { page?: number; limit?: number; serviceId?: string; userId?: string }): Promise<ReviewsResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.serviceId) qs.set('serviceId', params.serviceId);
    if (params?.userId) qs.set('userId', params.userId);
    const query = qs.toString();
    return this.request<ReviewsResponse>(`/reviews${query ? `?${query}` : ''}`);
  }

  async getMyReviews(type: 'received' | 'given' = 'received'): Promise<ReviewsResponse> {
    return this.request<ReviewsResponse>(`/reviews/my?type=${type}`);
  }

  async createReview(reviewData: { orderId: string; rating: number; comment: string }): Promise<ReviewResponse> {
    return this.request<ReviewResponse>('/reviews', { 
      method: 'POST', 
      body: JSON.stringify(reviewData) 
    });
  }

  async respondToReview(reviewId: string, response: string): Promise<ReviewResponse> {
    return this.request<ReviewResponse>(`/reviews/${reviewId}/respond`, { 
      method: 'POST', 
      body: JSON.stringify({ response }) 
    });
  }

  // Enhanced Freelancer Stats
  async getFreelancerStats(): Promise<JobSeekerStatsResponse> {
    return this.request<JobSeekerStatsResponse>('/app-api/stats/freelancer');
  }

  // My gigs/bids stats
  async getMyGigsStats(): Promise<ApiResponse<{ totalBids: number; wonBids: number; pendingBids: number; failedBids?: number; recent: Array<{ jobId: string; createdAt: string; job?: { _id: string; title: string; category?: string } }> }>> {
    return this.request('/app-api/stats/my-gigs');
  }

  // Freelancer Profile API
  async getFreelancerProfile(userId: string): Promise<FreelancerProfileResponse> {
    return this.request<FreelancerProfileResponse>(`/freelancer-profiles/${userId}`);
  }

  async getMyFreelancerProfile(): Promise<FreelancerProfileResponse> {
    return this.request<FreelancerProfileResponse>('/freelancer-profiles/my');
  }

  async createFreelancerProfile(profileData: Partial<FreelancerProfile>): Promise<FreelancerProfileResponse> {
    return this.request<FreelancerProfileResponse>('/freelancer-profiles', { 
      method: 'POST', 
      body: JSON.stringify(profileData) 
    });
  }

  async updateFreelancerProfile(profileData: Partial<FreelancerProfile>): Promise<FreelancerProfileResponse> {
    return this.request<FreelancerProfileResponse>('/freelancer-profiles/my', { 
      method: 'PUT', 
      body: JSON.stringify(profileData) 
    });
  }

  // User Profile API (single canonical endpoint)

  // Get user's services (for public profile viewing)
  async getUserServices(userId: string): Promise<ServicesResponse> {
    return this.request<ServicesResponse>(`/users/${userId}/services`);
  }

  // Additional saved jobs methods
  async getSavedJobById(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/saved-jobs/${id}`);
  }

  async removeSavedJob(jobId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/saved-jobs/${jobId}`, { method: 'DELETE' });
  }

  async isJobSaved(jobId: string): Promise<ApiResponse<{ saved: boolean }>> {
    return this.request<ApiResponse<{ saved: boolean }>>(`/api/saved-jobs/check/${jobId}`);
  }

  async getSavedJobsCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/api/saved-jobs/count');
  }

  // Fake Payments Service Methods (keeping for payments page)
  async getFakePayments(params?: { 
    status?: string; 
    method?: string; 
    dateFrom?: string; 
    dateTo?: string; 
    limit?: number; 
    page?: number 
  }): Promise<ApiResponse<any[]>> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.dateFrom) qs.set('from', params.dateFrom);
    if (params?.dateTo) qs.set('to', params.dateTo);
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.method) qs.set('method', params.method);
    if (params?.page) qs.set('page', String(params.page));
    const query = qs.toString();
    // Use internal Next.js routes for fake payments
    return this.request<ApiResponse<any[]>>(`/api/fake-payments${query ? `?${query}` : ''}`);
  }

  async getFakePaymentStats(): Promise<ApiResponse<any>> {
    const res = await this.request<any>('/api/fake-payments/stats');
    // Normalize to ApiResponse shape with stats in data
    return { success: !!res?.success, data: res?.stats } as any;
  }

  async getFakePaymentById(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/api/fake-payments/${id}`);
  }

  async updateFakePaymentStatus(id: string, status: string): Promise<ApiResponse<any>> {
    // Not supported on real payments; no-op to keep UI flows
    return { success: false, message: 'Not supported' } as any;
  }

  async deleteFakePayment(id: string): Promise<ApiResponse> {
    // Not supported on real payments; no-op
    return { success: false, message: 'Not supported' } as any;
  }

  async createFakePayment(paymentData: any): Promise<ApiResponse<any>> {
    // Not supported on real payments; no-op for demo button
    return { success: false, message: 'Not supported' } as any;
  }

  // Request/Response interceptors for logging and monitoring
  private logRequest(endpoint: string, options: RequestInit): void {
    log.debug('api_request', {
      endpoint,
      method: options.method || 'GET'
    });
  }

  private logResponse(endpoint: string, response: any, duration: number): void {
    log.debug('api_response_timing', { endpoint, duration });
  }

  private logError(endpoint: string, error: any): void {
    log.error('api_error', { endpoint, error: error?.message || String(error) });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;