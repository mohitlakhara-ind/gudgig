// Simplified API Types for Gudgig

export interface ContactDetails {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  company?: string;
  position?: string;
  notes?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GigContactDetails {
  email?: string;
  phone?: string;
  name?: string;
  alternateContact?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'freelancer' | 'employer' | 'admin';
  isEmailVerified: boolean;
  lastLogin?: string | Date | null;
  isActive: boolean;
  deactivatedUntil?: string | Date | null;
  phone?: string;
  countryCode?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  avatar?: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: 'website development' | 'graphic design' | 'content writing' | 'social media management' | 'SEO' | 'app development' | 'game development';
  requirements: string[];
  createdAt: string;
  createdBy: string; // user id
  /**
   * Optional fields added for enhanced dashboard displays
   */
  company?: { name: string; logo?: string } | string;
  location?: string;
  type?: string;
  salary?: { min?: number; max?: number; currency?: string; period?: 'hourly' | 'project' };
  /** Gig model aligned fields */
  budget?: number;
  experienceLevel?: 'any' | 'junior' | 'mid' | 'senior';
  skills?: string[];
  /**
   * Optional explicit salary disclosure block used by UI helpers
   */
  salaryDisclosure?: { min?: number; max?: number; currency?: string; period?: 'hourly' | 'project' };
  status?: 'active' | 'paused' | 'closed' | 'draft';
  views?: number;
  applicationsCount?: number;
  bidsCount?: number;
  maxBids?: number;
  isHidden?: boolean;
  price?: number;
  bidFee?: number;
  contactDetails?: GigContactDetails;
}

// Gig is an alias for Job in this codebase
export type Gig = Job;

export interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  packages: {
    basic: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      features: string[];
      revisions: number;
    };
    standard?: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      features: string[];
      revisions: number;
    };
    premium?: {
      title: string;
      description: string;
      price: number;
      deliveryTime: number;
      features: string[];
      revisions: number;
    };
  };
  gallery: Array<{
    url: string;
    publicId: string;
    alt?: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  requirements: string[];
  createdBy: string | User;
  isActive: boolean;
  ordersCount: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  serviceId: string | Service;
  buyerId: string | User;
  sellerId: string | User;
  packageType: 'basic' | 'standard' | 'premium';
  price: number;
  status: 'pending' | 'active' | 'delivered' | 'revision' | 'completed' | 'cancelled';
  requirements: Record<string, any>;
  deliverables: Array<{
    url: string;
    name: string;
    size: number;
  }>;
  messages: Array<{
    sender: string;
    message: string;
    timestamp: string;
  }>;
  deadline: string;
  revisionCount: number;
  maxRevisions: number;
  paymentIntentId?: string;
  escrowReleased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  orderId: string | Order;
  serviceId: string | Service;
  reviewerId: string | User;
  revieweeId: string | User;
  rating: number;
  comment: string;
  response?: {
    message: string;
    createdAt: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FreelancerProfile {
  _id: string;
  userId: string | User;
  title: string;
  bio: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    yearsOfExperience?: number;
  }>;
  primarySkills: string[];
  portfolio: Array<{
    title: string;
    description: string;
    images: string[];
    technologies: string[];
    liveUrl?: string;
    githubUrl?: string;
    completedAt: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    isCurrentRole: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationYear: number;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialUrl?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  }>;
  socialLinks: {
    website?: string;
    linkedin?: string;
    github?: string;
    behance?: string;
    dribbble?: string;
    instagram?: string;
    twitter?: string;
  };
  hourlyRate?: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    hoursPerWeek: number;
    timezone: string;
  };
  location: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  jobId: string;
  userId: string | User; // populated in admin views
  quotation?: string;
  proposal?: string;
  bidFeePaid: number;
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
}

/**
 * Represents a job application submitted by a user to a job posting
 */
export interface Application {
  _id: string;
  job: string | Job;
  applicant: string | User;
  status: 'pending' | 'interviewing' | 'rejected' | 'accepted';
  coverLetter: string;
  appliedAt: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSettings {
  _id: string;
  bidFeeOptions: number[];
  currentBidFee: number;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'freelancer' | 'admin';
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface JobsResponse extends ApiResponse<Job[]> {
  count: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobResponse extends ApiResponse<Job> {}

export interface CreateJobRequest {
  title: string;
  description: string;
  category: Job['category'];
  requirements?: string[];
  maxBids?: number;
  location?: string;
  price?: number;
  bidFee?: number;
  contactDetails?: GigContactDetails;
}

// Search/filter request parameters used by gigs hooks and API client
export interface SearchJobsRequest {
  page?: number;
  limit?: number;
  query?: string;
  category?: Job['category'] | string;
  location?: string;
  type?: string;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: 'newest' | 'budget_high_to_low' | 'budget_low_to_high' | 'recent' | 'budget-high' | 'budget-low' | 'deadline' | 'bids' | 'views';
  /**
   * Optional skills filter; can be passed as a comma-separated string or array.
   * The backend expects a comma-separated string and matches gigs that contain all skills.
   */
  skills?: string | string[];
}

export interface CreateBidRequest {
  jobId: string;
  quotation?: string;
  proposal?: string;
  bidFeePaid: number;
}

export interface BidResponse extends ApiResponse<Bid> {}
export interface BidsResponse extends ApiResponse<Bid[]> { count: number }

// Admin & Chat types
export interface AdminStats {
  totalJobs: number;
  totalBids: number;
  totalRevenue: number;
  activeFreelancers: number;
  recentJobs: Array<Pick<Job, '_id' | 'title' | 'createdAt'>>;
  recentBids: Array<Pick<Bid, '_id' | 'createdAt'> & { job?: Pick<Job, '_id' | 'title'>; user?: Pick<User, '_id' | 'name'>; quotation?: string | number } >;
}

export interface AdminStatsResponse extends ApiResponse<AdminStats> {}

/**
 * Dashboard statistics for freelancers
 */
export interface FreelancerStats {
  applications: number;
  interviews: number;
  offers: number;
  profileCompleteness: number; // 0-100
  
  // Service-related stats
  activeServices: number;
  totalServices: number;
  
  // Order-related stats
  totalOrders: number;
  monthlyOrders: number;
  activeOrders: number;
  completedOrders: number;
  
  // Financial stats
  totalEarnings: number;
  monthlyEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  
  // Reputation stats
  averageRating: number;
  totalReviews: number;
  
  // Review distribution (percentage for each star rating)
  reviewDistribution?: {
    fiveStars: number;
    fourStars: number;
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
  
  // Growth metrics
  earningsGrowthPercentage?: number;
  
  // Recent activity
  recentOrders?: Array<{
    _id: string;
    title: string;
    status: string;
    price: number;
    deadline: string;
    progress: number;
  }>;
  
  recentReviews?: Array<{
    _id: string;
    reviewerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  
  recentActivity?: Array<{
    _id: string;
    type: 'order_completed' | 'message_received' | 'review_received' | 'order_received';
    title: string;
    description: string;
    createdAt: string;
  }>;
}

/**
 * Dashboard statistics for employers
 */
export interface EmployerStats {
  activeJobs: number;
  totalApplications: number;
  interviewsScheduled: number;
  hiresThisMonth: number;
  viewsThisMonth: number;
  responseRate: number; // 0-100
}

export interface Conversation {
  _id: string;
  participants: Array<string | User>;
  lastMessageAt: string;
  unreadBy: string[];
  context?: { jobId?: string; bidId?: string };
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string | User;
  content: string;
  createdAt: string;
  readBy: string[];
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> {}
export interface MessagesResponse extends ApiResponse<Message[]> {}

// Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'freelancer' | 'admin';
  phone?: string;
  countryCode?: string;
}

export interface LoginResponse extends ApiResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse extends ApiResponse {
  token: string;
  user: User;
}

export interface StartConversationRequest { participantId?: string; participantRole?: 'admin'; context?: { jobId?: string; bidId?: string } }
export interface SendMessageRequest { content?: string; attachments?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }
export interface UpdateBidFeesRequest { fees: number[]; active?: number }

// Notifications
export interface Notification {
  _id: string;
  user: string | User;
  type: 'application_status' | 'job_match' | 'interview' | 'offer' | 'message' | string;
  title: string;
  message: string;
  data?: Record<string, any> | null;
  read: boolean;
  readAt?: string | Date;
  createdAt: string | Date;
}

export interface NotificationList {
  notifications: Notification[];
  pagination?: { page: number; limit: number; pages: number; total: number };
}

export interface NotificationsResponse extends ApiResponse<NotificationList | Notification[]> {}
export interface UnreadCountResponse extends ApiResponse<{ count: number }> {}

// Response type aliases for dashboard and applications
export interface JobSeekerStatsResponse extends ApiResponse<FreelancerStats> {}
export interface EmployerStatsResponse extends ApiResponse<EmployerStats> {}
export interface ApplicationsResponse extends ApiResponse<Application[]> { count?: number }
export interface ApplicationResponse extends ApiResponse<Application> {}

// Service, Order, Review, and FreelancerProfile response types
export interface ServicesResponse extends ApiResponse<Service[]> { count?: number }
export interface ServiceResponse extends ApiResponse<Service> {}
export interface OrdersResponse extends ApiResponse<Order[]> { count?: number }
export interface OrderResponse extends ApiResponse<Order> {}
export interface ReviewsResponse extends ApiResponse<Review[]> { count?: number }
export interface ReviewResponse extends ApiResponse<Review> {}
export interface FreelancerProfileResponse extends ApiResponse<FreelancerProfile> {}