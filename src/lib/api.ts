import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  JobsResponse,
  JobResponse,
  CreateJobRequest,
  ApplicationsResponse,
  ApplicationResponse,
  CreateApplicationRequest,
  NotificationsResponse,
  SearchJobsRequest,
  SearchSuggestionsResponse,
  ApiError,
  ApiResponse,
  User,
  Company,
  Job,
  Application,
  Notification,
  ServicesResponse,
  ServiceResponse,
  CreateServiceRequest,
  OrdersResponse,
  OrderResponse,
  CreateOrderRequest,
  ConversationsResponse,
  Review,
  ReviewsResponse
} from '@/types/api';

export class ApiClientError extends Error {
  constructor(public statusCode: number, public payload?: any, message?: string) {
    super(message || payload?.message || 'Request failed');
    this.name = 'ApiClientError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

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

  private isStateChangingMethod(method: string): boolean {
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Note: CSRF protection removed - JWT tokens provide sufficient protection
    // for API endpoints when properly implemented with SameSite cookies

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && this.refreshToken && retryCount === 0) {
        // Try to refresh token
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.request<T>(endpoint, options, retryCount + 1);
        }
      }

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          success: false,
          message: 'Network error',
          statusCode: response.status,
        }));
        throw new ApiClientError(response.status, errorData, errorData.message);
      }
      const json = await response.json();
      const metaHeaders: Record<string, string> = {};
      ['X-Remaining-Job-Views','X-Remaining-Applications'].forEach(h => {
        const v = response.headers.get(h);
        if (v !== null) metaHeaders[h] = v;
      });
      if (Object.keys(metaHeaders).length > 0 && typeof json === 'object' && json) {
        json.meta = { ...(json.meta || {}), headers: metaHeaders };
      }
      return json;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        // Network error
        throw new ApiClientError(0, null, 'Network error. Please check your connection.');
      }
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data: { token: string; refreshToken: string } = await response.json();
        this.setStoredToken(data.token);
        this.setStoredRefreshToken(data.refreshToken);
        return true;
      }
      return false;
    } catch {
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

  async getCurrentUser(): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/auth/me');
    return response.data!;
  }

  // Job methods
  async getJobs(params?: SearchJobsRequest): Promise<JobsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<JobsResponse>(`/jobs${query ? `?${query}` : ''}`);
  }

  // Gig methods (alias to jobs controller on backend)
  async getGigs(params?: SearchJobsRequest): Promise<JobsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<JobsResponse>(`/gigs${query ? `?${query}` : ''}`);
  }

  // Marketplace: Services
  async getServices(params?: Record<string, string | number | boolean | undefined>): Promise<ServicesResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<ServicesResponse>(`/services${query ? `?${query}` : ''}`);
  }

  async getService(id: string): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/services/${id}`);
  }

  async getUserServices(userId: string): Promise<ServicesResponse> {
    return this.request<ServicesResponse>(`/services/user/${userId}`);
  }

  async createService(payload: CreateServiceRequest): Promise<ServiceResponse> {
    return this.request<ServiceResponse>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateService(id: string, payload: Partial<CreateServiceRequest>): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteService(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  async updateServiceStatus(id: string, status: 'draft' | 'active' | 'paused' | 'denied'): Promise<ServiceResponse> {
    return this.request<ServiceResponse>(`/services/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Marketplace: Orders
  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    return this.request<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOrders(params?: { role?: 'buyer' | 'seller'; status?: string }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.request<OrdersResponse>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    }

  async deliverOrder(id: string, payload: { message?: string; files?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/orders/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Marketplace: Conversations
  async getConversations(): Promise<ConversationsResponse> {
    return this.request<ConversationsResponse>('/conversations');
  }

  async startConversation(participantId: string, orderId?: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId, orderId }),
    });
  }

  async getMessages(conversationId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/conversations/${conversationId}/messages`);
  }

  async sendMessage(conversationId: string, payload: { content?: string; attachments?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async markConversationRead(conversationId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  // Marketplace: Reviews
  async createReview(payload: { orderId: string; serviceId: string; revieweeId: string; rating: number; title?: string; comment?: string }): Promise<ApiResponse<Review>> {
    return this.request<ApiResponse<Review>>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getServiceReviews(serviceId: string): Promise<ReviewsResponse> {
    return this.request<ReviewsResponse>(`/reviews/service/${serviceId}`);
  }

  async getGig(id: string): Promise<JobResponse> {
    return this.request<JobResponse>(`/gigs/${id}`);
  }

  async createGig(jobData: CreateJobRequest): Promise<JobResponse> {
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

  async getJob(id: string): Promise<JobResponse> {
    return this.request<JobResponse>(`/jobs/${id}`);
  }

  async createJob(jobData: CreateJobRequest): Promise<JobResponse> {
    return this.request<JobResponse>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<CreateJobRequest>): Promise<JobResponse> {
    return this.request<JobResponse>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Application methods
  async getApplications(params?: { page?: number; limit?: number; status?: string }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<ApplicationsResponse>(`/applications${query ? `?${query}` : ''}`);
  }

  // Employer applications listing
  async getEmployerApplications(params?: { page?: number; limit?: number; status?: string; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<ApplicationsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<ApplicationsResponse>(`/applications/employer${query ? `?${query}` : ''}`);
  }

  async getApplication(id: string): Promise<ApplicationResponse> {
    return this.request<ApplicationResponse>(`/applications/${id}`);
  }

  async createApplication(applicationData: CreateApplicationRequest): Promise<ApplicationResponse> {
    return this.request<ApplicationResponse>('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<ApplicationResponse> {
    return this.request<ApplicationResponse>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Bulk update applications (employer actions)
  async bulkUpdateApplications(applicationIds: string[], action: string, payload?: Record<string, any>): Promise<ApiResponse> {
    return this.request<ApiResponse>('/applications/bulk', {
      method: 'POST',
      body: JSON.stringify({ applicationIds, action, ...payload }),
    });
  }

  async withdrawApplication(id: string, reason?: string): Promise<ApplicationResponse> {
    return this.request<ApplicationResponse>(`/applications/${id}/withdraw`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // Company methods
  async getCompanies(params?: { page?: number; limit?: number; industry?: string }): Promise<ApiResponse<Company[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<ApiResponse<Company[]>>(`/companies${query ? `?${query}` : ''}`);
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>(`/companies/${id}`);
  }

  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request<ApiResponse<Company>>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  // User methods
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Subscription methods
  async getMySubscription(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/my');
  }

  async getSubscriptionPlans(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/plans');
  }

  async getSubscriptionUsage(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/usage');
  }

  async createSubscriptionCheckout(payload: { priceId?: string; planId?: string; billingCycle?: 'monthly' | 'quarterly' | 'yearly'; successUrl: string; cancelUrl: string; trialPeriodDays?: number }): Promise<ApiResponse<{ id: string; url: string }>> {
    return this.request<ApiResponse<{ id: string; url: string }>>('/subscriptions/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async cancelSubscriptionAtPeriodEnd(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/cancel', { method: 'PUT' });
  }

  async resumeSubscriptionAutoRenew(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/subscriptions/resume', { method: 'PUT' });
  }

  async createStripeCustomerPortal(): Promise<ApiResponse<{ url: string }>> {
    return this.request<ApiResponse<{ url: string }>>('/subscriptions/portal', { method: 'POST' });
  }

  // Promotions
  async createJobPromotionCheckout(jobId: string, payload: { tier: 'feature' | 'urgent' | 'highlight' | 'boost'; durationDays?: number }): Promise<ApiResponse<{ id: string; url: string }>> {
    return this.request<ApiResponse<{ id: string; url: string }>>(`/jobs/${jobId}/promotions/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async applyJobPromotion(jobId: string, payload: { tier: 'feature' | 'urgent' | 'highlight' | 'boost'; durationDays?: number }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/jobs/${jobId}/promotions/apply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createStripeCheckout(plan: 'pro' | 'enterprise', options?: { billingCycle?: 'monthly' | 'quarterly' | 'yearly'; returnUrl?: string; allowTrial?: boolean }): Promise<ApiResponse<{ url: string }>> {
    const payload: any = { plan };
    if (options?.billingCycle) payload.billingCycle = options.billingCycle;
    if (options?.returnUrl) payload.returnUrl = options.returnUrl;
    if (typeof options?.allowTrial === 'boolean') payload.allowTrial = options.allowTrial;
    return this.request<ApiResponse<{ url: string }>>('/billing/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Razorpay
  async createRazorpayOrder(amount: number, currency: string = 'INR', receipt?: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/billing/razorpay/order', { method: 'POST', body: JSON.stringify({ amount, currency, receipt }) });
  }
  async verifyRazorpayPayment(payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/billing/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) });
  }

  // PayPal
  async createPaypalOrder(amount: number, currency: string = 'USD'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/billing/paypal/order', { method: 'POST', body: JSON.stringify({ amount, currency }) });
  }
  async capturePaypalOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/billing/paypal/capture', { method: 'POST', body: JSON.stringify({ orderId }) });
  }

  async uploadResume(file: File): Promise<ApiResponse<{ url: string; publicId: string; originalName: string }>> {
    const formData = new FormData();
    formData.append('resume', file);

    return this.request<ApiResponse<{ url: string; publicId: string; originalName: string }>>('/users/upload-resume', {
      method: 'POST',
      body: formData,
    });
  }

  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<ApiResponse<{ url: string; publicId: string }>>('/users/upload-avatar', {
      method: 'POST',
      body: formData,
    });
  }

  // Search methods
  async searchJobs(params: SearchJobsRequest): Promise<JobsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request<JobsResponse>(`/search/jobs${query ? `?${query}` : ''}`);
  }

  async getSearchSuggestions(query: string, type?: string): Promise<SearchSuggestionsResponse> {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    return this.request<SearchSuggestionsResponse>(`/search/suggestions?${params.toString()}`);
  }

  async saveSearch(searchData: {
    name: string;
    query: string;
    location?: string;
    category?: string;
    jobType?: string;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
    remote?: boolean;
    skills?: string[];
    alertFrequency?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/search/save', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async getSavedSearches(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<ApiResponse<any>>(`/search/saved${query ? `?${query}` : ''}`);
  }

  async deleteSavedSearch(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/search/saved/${id}`, {
      method: 'DELETE',
    });
  }

  async getTrendingSearches(limit?: number): Promise<ApiResponse<any>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<ApiResponse<any>>(`/search/trending${params}`);
  }

  // Notification methods
  async getNotifications(params?: { page?: number; limit?: number; read?: boolean }): Promise<NotificationsResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<NotificationsResponse>(`/notifications${query ? `?${query}` : ''}`);
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<ApiResponse<{ count: number }>>('/notifications/unread-count');
  }

  // Dashboard methods
  async getEmployerStats(timeframe?: string): Promise<ApiResponse<any>> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request<ApiResponse<any>>(`/stats/employer${params}`);
  }

  async getJobStats(timeframe?: string): Promise<ApiResponse<any>> {
    // Alias to employer stats for employer jobs page
    return this.getEmployerStats(timeframe);
  }

  async getEmployerApplicationStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/applications/stats/employer');
  }

  async getJobSeekerStats(timeframe?: string): Promise<ApiResponse<any>> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request<ApiResponse<any>>(`/stats/jobseeker${params}`);
  }

  async getAdminStats(timeframe?: string): Promise<ApiResponse<any>> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request<ApiResponse<any>>(`/stats/admin${params}`);
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

  // Request/Response interceptors for logging and monitoring
  private logRequest(endpoint: string, options: RequestInit): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${options.method || 'GET'} ${endpoint}`, {
        headers: options.headers,
        body: options.body instanceof FormData ? '[FormData]' : options.body,
      });
    }
  }

  private logResponse(endpoint: string, response: any, duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${endpoint} (${duration}ms)`, response);
    }
  }

  private logError(endpoint: string, error: any): void {
    console.error(`API Error: ${endpoint}`, error);
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

export default apiClient;