import { apiClient } from '@/lib/api';

export interface DashboardAnalytics {
  overview: {
    totalBids: number;
    successfulBids: number;
    pendingBids: number;
    failedBids: number;
    successRate: number;
    profileCompleteness: number;
    profileViews: number;
  };
  financial: {
    totalSpent: number;
    monthlySpent: number;
    averageBidFee: number;
    pendingAmount: number;
  };
  trends: {
    bidsThisMonth: number;
    bidsLastMonth: number;
    bidsThisYear: number;
    monthlyGrowth: number;
    monthlyTrends: Array<{ month: string; count: number }>;
  };
  categories: {
    myBidsByCategory: Array<{ _id: string; count: number; totalSpent: number }>;
    availableJobsByCategory: Array<{ _id: string; count: number }>;
    categoryPerformance: Array<{ _id: string; totalBids: number; successfulBids: number; successRate: number; totalSpent: number }>;
  };
  activity: {
    recentBids: Array<{
      _id: string;
      jobTitle: string;
      category: string;
      amount: number;
      status: string;
      createdAt: string;
    }>;
    recentJobs: Array<{
      _id: string;
      title: string;
      category: string;
      company: string;
      createdAt: string;
    }>;
  };
  performance: {
    successRate: number;
    averageResponseTime: number;
    profileCompleteness: number;
  };
}

export interface EarningsAnalytics {
  totalEarnings?: number;
  totalSpent?: number;
  averageOrderValue?: number;
  averageBidFee?: number;
  monthlyEarnings?: Array<{ month: string; amount: number }>;
  monthlySpending?: Array<{ month: string; amount: number }>;
  categoryEarnings?: Array<{ category: string; amount: number }>;
  categorySpending?: Array<{ category: string; amount: number }>;
  ordersCount?: number;
  bidsCount?: number;
}

export interface PerformanceAnalytics {
  completionRate?: number;
  averageRating?: number;
  totalReviews?: number;
  responseTime?: number;
  profileCompleteness?: number;
  activeServices?: number;
  totalServices?: number;
  totalJobs?: number;
  totalApplications?: number;
  averageApplicationsPerJob?: number;
  activeJobs?: number;
  completedJobs?: number;
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await apiClient.getDashboardAnalytics();
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      throw error;
    }
  }

  async getEarningsAnalytics(period: string = '12'): Promise<EarningsAnalytics> {
    try {
      const response = await apiClient.getEarningsAnalytics(period);
      return response.data;
    } catch (error) {
      console.error('Error fetching earnings analytics:', error);
      throw error;
    }
  }

  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    try {
      const response = await apiClient.getPerformanceAnalytics();
      return response.data;
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
