// API Types based on backend Mongoose schemas

export interface SalaryInfo {
  min?: number;
  max?: number;
  currency: string;
  isNegotiable: boolean;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'project';
}

export interface Job {
  _id: string;
  title: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  employer: string; // User ID
  company: string | Company; // Company ID or Company object
  category: 'Technology' | 'Healthcare' | 'Finance' | 'Education' | 'Marketing' | 'Sales' | 'Human Resources' | 'Operations' | 'Design' | 'Engineering' | 'Writing' | 'Data Entry' | 'Research' | 'Customer Service' | 'Translation' | 'Virtual Assistance' | 'Social Media' | 'Other';
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'micro-task' | 'short-project' | 'hourly' | 'fixed-price';
  location: string;
  isRemote: boolean;
  salary: SalaryInfo;
  salaryDisclosure: {
    required: boolean;
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'project';
    isNegotiable: boolean;
  };
  remoteEligibility: {
    allowedStates: string[];
    allowedCountries: string[];
  };
  jobLocationType: 'TELECOMMUTE' | 'PHYSICAL_LOCATION' | 'HYBRID';
  eeocCompliant: boolean;
  federalContractor: boolean;
  disabilityAccommodations: boolean;
  veteranFriendly: boolean;
  metaDescription?: string;
  canonicalUrl?: string;
  structuredData?: any;
  lastModified: Date;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  qualityScore: number;
  fraudFlags: string[];
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  requirements: string[];
  skills: string[];
  benefits: string[];
  experience: 'fresher' | '1-2 years' | '3-5 years' | '5-10 years' | '10+ years';
  education: 'high-school' | 'bachelors' | 'masters' | 'phd' | 'any';
  applicationDeadline?: Date;
  status: 'active' | 'paused' | 'closed' | 'draft';
  featured: boolean;
  urgent: boolean;
  views: number;
  applicationsCount: number;
  tags: string[];
  applicationInstructions?: string;
  createdAt: string;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'jobseeker' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: any[];
  experience: any[];
  education?: any[];
  certifications?: any[];
  experienceLevel?: 'fresher' | '1-2 years' | '3-5 years' | '5-10 years' | '10+ years';
  resume?: string;
  profileImage?: string;
  company?: string; // Company ID
  isEmailVerified: boolean;
  lastLogin?: Date;
  isActive: boolean;
  privacyConsent: {
    gdpr: boolean;
    ccpa: boolean;
    timestamp?: Date;
  };
  twoFactorEnabled: boolean;
  accessibilitySettings: {
    screenReader: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  identityVerified: boolean;
  backgroundCheckStatus: 'not_started' | 'pending' | 'completed' | 'failed';
  kybStatus: 'not_started' | 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'inactive' | 'active' | 'past_due' | 'canceled';
    currentPeriodEnd?: Date | string;
    cancelAtPeriodEnd?: boolean;
  };
  sellerProfile?: {
    isSeller: boolean;
    level: 'new' | 'level_1' | 'level_2' | 'top_rated';
    rating: number;
    completedOrders: number;
    responseTimeHours: number;
    verifiedSeller: boolean;
    profileCompleted: boolean;
    tagline?: string;
    languages?: Array<{ name: string; proficiency: 'basic' | 'conversational' | 'fluent' | 'native' }>;
    sellerSince?: string | Date;
    earningsCents?: number;
  };
}

export interface Company {
  _id: string;
  name: string;
  slug?: string;
  description: string;
  website?: string;
  logo?: string;
  industry: 'Technology' | 'Healthcare' | 'Finance' | 'Education' | 'Marketing' | 'Sales' | 'Human Resources' | 'Operations' | 'Design' | 'Engineering' | 'Other';
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  founded?: number;
  headquarters?: string;
  locations: Array<{
    city: string;
    state: string;
    country: string;
  }>;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  culture?: string;
  benefits: string[];
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  businessLicense?: string;
  taxId?: string;
  kybDocuments: string[];
  verifiedDate?: Date;
  featured: boolean;
  jobsCount: number;
  followersCount: number;
  rating: number;
  reviewCount: number;
  eeocStatement?: string;
  diversityPolicy?: string;
  accessibilityStatement?: string;
  privacyPolicy?: string;
  trustScore: number;
  employeeCount: number;
  foundedYear?: number;
  certifications: string[];
  glassdoorRating: number;
  linkedinUrl?: string;
  offices: Array<{
    city: string;
    state: string;
    country: string;
    isHeadquarters: boolean;
  }>;
  remotePolicy: 'no_remote' | 'hybrid' | 'full_remote' | 'flexible';
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  _id: string;
  job: string; // Job ID
  applicant: string; // User ID
  employer: string; // User ID
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';
  coverLetter: string;
  resume?: string;
  additionalInfo?: string;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // User ID
  notes: Array<{
    content: string;
    addedBy: string; // User ID
    isPrivate: boolean;
    createdAt: Date;
  }>;
  rating?: number;
  interviewDate?: Date;
  interviewFeedback?: string;
  offerDetails: {
    salary?: number;
    benefits: string[];
    startDate?: Date;
    additionalTerms?: string;
  };
  withdrawnAt?: Date;
  withdrawnReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'jobseeker' | 'employer';
  company?: string; // For employers
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JobResponse {
  success: boolean;
  data: Job;
  structuredData?: any;
  subscription?: { plan: 'free' | 'pro' | 'enterprise'; status: string; hasFullAccess: boolean };
}

export interface CreateJobRequest {
  title: string;
  description: string;
  shortDescription?: string;
  company: string;
  category: string;
  type: string;
  location: string;
  isRemote: boolean;
  salary: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
    period: string;
  };
  requirements: string[];
  skills: string[];
  benefits: string[];
  experience: string;
  education: string;
  applicationDeadline?: string;
  tags: string[];
  applicationInstructions?: string;
}

export interface ApplicationsResponse {
  success: boolean;
  data: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApplicationResponse {
  success: boolean;
  data: Application;
}

export interface CreateApplicationRequest {
  job: string;
  coverLetter: string;
  resume?: string;
  additionalInfo?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Notification {
  _id: string;
  user: string;
  type: 'application_status' | 'job_match' | 'interview' | 'offer' | 'message' | 'job_new_application';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface SearchJobsRequest {
  query?: string;
  category?: string;
  type?: string;
  location?: string;
  isRemote?: boolean;
  experience?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  jobs: string[];
  locations: string[];
  skills: string[];
}

// Marketplace Types

export interface ServicePackage {
  name: 'Basic' | 'Standard' | 'Premium';
  description?: string;
  price: number;
  deliveryTimeDays: number;
  revisions?: number;
  features?: string[];
}

export interface Service {
  _id: string;
  seller: string | User;
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string | null;
  tags?: string[];
  packages: ServicePackage[];
  requirements?: Array<{ prompt: string; type: 'text' | 'attachment' | 'multiple_choice'; required: boolean; options?: string[] }>;
  faq?: Array<{ question: string; answer: string }>;
  gallery?: Array<{ url: string; publicId?: string; caption?: string }>;
  startingPrice: number;
  averageDeliveryDays: number;
  status: 'draft' | 'active' | 'paused' | 'denied' | 'deleted';
  featured: boolean;
  analytics?: { impressions: number; clicks: number; saves: number; orders: number; conversionRate: number };
  rating?: { average: number; count: number };
  createdAt: string;
  updatedAt: string;
}

export interface ServicesResponse extends ApiResponse<Service[]> {
  count: number;
  total: number;
  pagination: { page: number; limit: number; totalPages: number };
}

export interface ServiceResponse extends ApiResponse<Service> {}

export interface CreateServiceRequest {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  packages: ServicePackage[];
  requirements?: Array<{ prompt: string; type?: 'text' | 'attachment' | 'multiple_choice'; required?: boolean; options?: string[] }>;
  faq?: Array<{ question: string; answer: string }>;
  gallery?: Array<{ url: string; publicId?: string; caption?: string }>;
  status?: 'draft' | 'active' | 'paused';
}

export interface OrderPackageSnapshot {
  name: 'Basic' | 'Standard' | 'Premium';
  price: number;
  deliveryTimeDays: number;
  revisions?: number;
  features?: string[];
}

export interface Order {
  _id: string;
  buyer: string | User;
  seller: string | User;
  service: string | Service;
  package: OrderPackageSnapshot;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  milestones?: Array<{ title: string; description?: string; amount: number; dueDate?: string; status: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'released' | 'cancelled'; deliveredAt?: string; approvedAt?: string }>;
  payment: { provider?: 'stripe' | 'paypal' | 'razorpay' | 'other'; intentId?: string; chargeId?: string; escrowHeld: boolean; amount: number; currency: string; fees?: number; status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed' };
  delivery?: { message?: string; files?: Array<{ url: string; publicId?: string; name?: string; size?: number }>; deliveredAt?: string };
  communicationThread?: Message[];
  timeline?: Array<{ event: string; data?: any; createdAt: string }>;
  reviewGivenByBuyer?: boolean;
  reviewGivenBySeller?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse extends ApiResponse<Order[]> {
  count: number;
}

export interface OrderResponse extends ApiResponse<Order> {}

export interface CreateOrderRequest {
  serviceId: string;
  packageName: 'Basic' | 'Standard' | 'Premium';
  requirementsAnswers?: Array<{ prompt: string; answer: string }>;
}

export interface Message {
  sender: string | User;
  content: string;
  attachments?: Array<{ url: string; publicId?: string; name?: string; size?: number }>;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<string | User>;
  order?: string | Order | null;
  lastMessageAt: string;
  unreadBy: string[];
  messages: Message[];
  archivedBy?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationsResponse extends ApiResponse<Conversation[]> {
  count: number;
}

export interface Review {
  _id: string;
  order: string | Order;
  reviewer: string | User;
  reviewee: string | User;
  service: string | Service;
  rating: number;
  title?: string;
  comment?: string;
  response?: string;
  helpfulVotes: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse extends ApiResponse<Review[]> {
  count: number;
}

export interface CreateReviewRequest {
  orderId: string;
  serviceId: string;
  revieweeId: string;
  rating: number;
  title?: string;
  comment?: string;
}

// Error Response
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    headers?: Record<string, string>;
  };
}

// Pagination Metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled';
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
  currentPeriodStart?: string | Date | null;
  currentPeriodEnd?: string | Date | null;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionUsage {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled';
  limits: { jobViewsPerDay: number | null; applicationsPerDay: number | null };
  usage: { jobViewsToday: number; applicationsToday: number };
}

// Subscription Plans Types
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface PlanDefinition {
  name: string;
  description: string;
  features: {
    jobViewsPerDay: number | null;
    applicationsPerDay: number | null;
    fullJobDescription: boolean;
    premiumFilters: boolean;
    prioritySupport: boolean;
  };
  pricing: Record<BillingCycle, { amount: number; currency: string }>;
  priceIds?: Partial<Record<BillingCycle, string | null>>;
  trialDays: number;
  graceDays: number;
}

export type SubscriptionPlansResponse = Record<string, PlanDefinition>;