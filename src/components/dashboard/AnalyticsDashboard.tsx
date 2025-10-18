'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Award,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import { analyticsService, DashboardAnalytics, EarningsAnalytics, PerformanceAnalytics } from '@/services/analyticsService';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [earnings, setEarnings] = useState<EarningsAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'performance'>('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [analyticsData, earningsData, performanceData] = await Promise.all([
          analyticsService.getDashboardAnalytics(),
          analyticsService.getEarningsAnalytics('12'),
          analyticsService.getPerformanceAnalytics()
        ]);
        
        setAnalytics(analyticsData);
        setEarnings(earningsData);
        setPerformance(performanceData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  if (!analytics) return null;

  // Prepare chart data
  const monthlyTrendsData = {
    labels: analytics.trends.monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: 'Bids',
        data: analytics.trends.monthlyTrends.map(t => t.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: analytics.categories.myBidsByCategory.map(c => c._id),
    datasets: [
      {
        data: analytics.categories.myBidsByCategory.map(c => c.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const earningsData = earnings?.monthlySpending ? {
    labels: earnings.monthlySpending.map(e => e.month),
    datasets: [
      {
        label: 'Spending',
        data: earnings.monthlySpending.map(e => e.amount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="flex-1"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'earnings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('earnings')}
          className="flex-1"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Earnings
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('performance')}
          className="flex-1"
        >
          <Target className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.successRate.toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.successfulBids} successful bids
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.overview.profileViews}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.profileCompleteness}% profile complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                {analytics.trends.monthlyGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.trends.monthlyGrowth >= 0 ? '+' : ''}{analytics.trends.monthlyGrowth}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Your bidding activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={monthlyTrendsData} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bids by Category</CardTitle>
                <CardDescription>Distribution of your bids across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <DoughnutChart data={categoryData} height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest bids and job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.activity.recentBids.slice(0, 5).map((bid) => (
                  <div key={bid._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{bid.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">{bid.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={bid.status === 'succeeded' ? 'default' : 'secondary'}>
                        {bid.status}
                      </Badge>
                      <span className="text-sm font-medium">${bid.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && earnings && (
        <>
          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.financial.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  All time spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.financial.monthlySpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Current month spending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Bid Fee</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.financial.averageBidFee.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per bid average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.financial.pendingAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Pending payments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Charts */}
          {earningsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending</CardTitle>
                  <CardDescription>Your spending pattern over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={earningsData} height={300} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Where your money goes</CardDescription>
                </CardHeader>
                <CardContent>
                  {earnings.categorySpending && earnings.categorySpending.length > 0 ? (
                    <DoughnutChart 
                      data={{
                        labels: earnings.categorySpending.map(c => c.category),
                        datasets: [{
                          data: earnings.categorySpending.map(c => c.amount),
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                          ],
                        }]
                      }} 
                      height={300} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No spending data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && performance && (
        <>
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Completeness</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.profileCompleteness}%</div>
                <Progress value={performance.profileCompleteness} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.averageRating?.toFixed(1) || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  {performance.totalReviews} reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.completionRate?.toFixed(1) || 'N/A'}%</div>
                <p className="text-xs text-muted-foreground">
                  Project completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performance.responseTime || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Average response
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key metrics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Profile Completeness</p>
                      <p className="text-sm text-muted-foreground">
                        {performance.profileCompleteness && performance.profileCompleteness < 80 
                          ? 'Complete your profile to get more opportunities'
                          : 'Great job! Your profile is well optimized'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={performance.profileCompleteness && performance.profileCompleteness >= 80 ? 'default' : 'secondary'}>
                    {performance.profileCompleteness}%
                  </Badge>
                </div>

                {performance.averageRating && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Client Satisfaction</p>
                        <p className="text-sm text-muted-foreground">
                          {performance.averageRating >= 4.5 
                            ? 'Excellent! Keep up the great work'
                            : performance.averageRating >= 4.0
                            ? 'Good ratings, room for improvement'
                            : 'Focus on improving client satisfaction'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant={performance.averageRating >= 4.0 ? 'default' : 'secondary'}>
                      {performance.averageRating.toFixed(1)} ⭐
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}



