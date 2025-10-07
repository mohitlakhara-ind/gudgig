'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import DismissibleBanner from '@/components/dashboard/DismissibleBanner';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Briefcase,
  CalendarCheck,
  Award,
  UserCheck,
  Plus,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  MessageCircle,
  DollarSign,
  Package,
  Users,
  Globe,
  Heart,
  Zap,
  Settings,
  Bell,
  Target,
  FileText,
  MapPin,
  User,
  ShoppingBag,
  Calendar,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { WelcomeBannerSkeleton, ApplicationCardSkeleton, ProfileCardSkeleton, RecommendedJobSkeleton, ChartSkeleton } from '@/components/ui/loading-skeleton';

export default function FreelancerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const statsResponse = await apiClient.getFreelancerStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        } else {
          setStatsError('Failed to load stats');
        }
      } catch (err) {
        console.error('Error fetching freelancer stats:', err);
        setStatsError('Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (isAuthenticated) {
    fetchStats();
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* Welcome Banner */}
      {statsLoading ? (
        <WelcomeBannerSkeleton />
      ) : (
        <DismissibleBanner id="freelancer-welcome" variant="compact">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                Welcome back, {user?.name || 'Freelancer'}!
                <Sparkles className="h-6 w-6" />
              </h1>
              <p className="text-primary-foreground/90 text-base md:text-lg">
                Manage your services and grow your freelancing business.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard 
              label="Active Services" 
              value={stats?.activeServices ?? 0} 
              icon={Package} 
              tooltip="Your published services" 
            />
            <StatCard 
              label="Total Orders" 
              value={stats?.totalOrders ?? 0} 
              icon={ShoppingBag} 
              tooltip="All time orders received" 
            />
            <StatCard 
              label="Avg Rating" 
              value={stats?.averageRating ?? 0} 
              icon={Star} 
              tooltip="Your average service rating" 
            />
            <StatCard 
              label="Earnings" 
              value={`$${stats?.totalEarnings ?? 0}`} 
              icon={DollarSign} 
              tooltip="Total earnings to date" 
            />
          </div>
        </DismissibleBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Profile & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Enhanced Profile Card */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary rounded-bl-full opacity-20"></div>
            <CardContent className="px-6 py-5 pt-6 relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-medium">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{user?.name}</h3>
                  <p className="text-muted-foreground">Professional Freelancer</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user?.location || 'Location not set'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Profile Completeness</span>
                    <span className="font-semibold text-primary">{stats?.profileCompleteness ?? 0}%</span>
                  </div>
                  <Progress value={stats?.profileCompleteness ?? 0} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-xl font-bold text-primary">{stats?.activeOrders ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Active Orders</div>
                  </div>
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-xl font-bold text-success">{stats?.averageRating ?? 0}</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="px-6 py-4 pb-4 border-b border-border">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-warning" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-3">
              <Button className="w-full justify-start hover:scale-105 transition-transform glow-primary" asChild>
                <Link href="/gigs">
                  <Plus className="h-4 w-4 mr-2" />
                  Find Gigs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/saved-gigs">
                  <Package className="h-4 w-4 mr-2" />
                  Saved Gigs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/orders">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  View Orders
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                {/* Messages page not implemented */}
                {/* <Link href="/dashboard/messages"> */}
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                {/* </Link> */}
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/freelancer-profile">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Services Overview removed */}

          {/* Earnings Dashboard */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-success" />
                  Earnings Overview
                </CardTitle>
                <CardDescription>Track your financial performance</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View Analytics <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-success">${stats?.monthlyEarnings ?? 0}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-primary">${stats?.totalEarnings ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-warning">${stats?.pendingEarnings ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-success mr-2" />
                  <span className="text-sm font-medium">
                    {stats?.earningsGrowthPercentage !== undefined 
                      ? `${stats.earningsGrowthPercentage > 0 ? '+' : ''}${stats.earningsGrowthPercentage}% from last month`
                      : 'No growth data available'
                    }
                  </span>
                </div>
                <Badge className={`${
                  (stats?.earningsGrowthPercentage ?? 0) > 0 
                    ? 'bg-success text-success-foreground' 
                    : (stats?.earningsGrowthPercentage ?? 0) < 0 
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {(stats?.earningsGrowthPercentage ?? 0) > 0 ? 'Growing' : 
                   (stats?.earningsGrowthPercentage ?? 0) < 0 ? 'Declining' : 'Stable'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-primary" />
                  Active Orders
                </CardTitle>
                <CardDescription>Orders currently in progress</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/orders">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 3).map((order: any) => (
                    <div key={order._id} className="p-4 border rounded-lg hover:shadow-medium transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{order.title}</h4>
                          <p className="text-sm text-muted-foreground">Order #{order._id}</p>
                        </div>
                        <Badge className={`${
                          order.status === 'active' ? 'bg-primary text-primary-foreground' :
                          order.status === 'revision' ? 'bg-warning text-warning-foreground' :
                          order.status === 'completed' ? 'bg-success text-success-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Due: {new Date(order.deadline).toLocaleDateString()}
                        </span>
                        <span className="font-medium">${order.price}</span>
                      </div>
                      <Progress value={order.progress} className="mt-2 h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active orders</p>
                  </div>
      )}
    </div>
            </CardContent>
          </Card>

          {/* Reviews & Feedback */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-6 w-6 mr-2 text-warning" />
                  Client Reviews
                </CardTitle>
                <CardDescription>Your reputation and feedback</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">{stats?.averageRating ?? 0}</div>
                  <div className="flex justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className={`h-5 w-5 ${
                        star <= Math.floor(stats?.averageRating ?? 0) 
                          ? 'fill-warning text-warning' 
                          : 'text-gray-300'
                      }`} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Based on {stats?.totalReviews ?? 0} reviews</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">5 stars</span>
                    <Progress value={stats?.reviewDistribution?.fiveStars ?? 0} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{stats?.reviewDistribution?.fiveStars ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4 stars</span>
                    <Progress value={stats?.reviewDistribution?.fourStars ?? 0} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{stats?.reviewDistribution?.fourStars ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">3 stars</span>
                    <Progress value={stats?.reviewDistribution?.threeStars ?? 0} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{stats?.reviewDistribution?.threeStars ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">2 stars</span>
                    <Progress value={stats?.reviewDistribution?.twoStars ?? 0} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{stats?.reviewDistribution?.twoStars ?? 0}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">1 star</span>
                    <Progress value={stats?.reviewDistribution?.oneStar ?? 0} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">{stats?.reviewDistribution?.oneStar ?? 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {stats?.recentReviews && stats.recentReviews.length > 0 ? (
                  stats.recentReviews.slice(0, 2).map((review: any) => (
                    <div key={review._id} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {review.reviewerName.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.reviewerName}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((star) => (
                                <Star key={star} className={`h-3 w-3 ${
                                  star <= review.rating ? 'fill-warning text-warning' : 'text-gray-300'
                                }`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">"{review.comment}"</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No reviews yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.slice(0, 4).map((activity: any) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'order_completed':
                          return <CheckCircle className="h-4 w-4 text-success" />;
                        case 'message_received':
                          return <MessageCircle className="h-4 w-4 text-primary" />;
                        case 'review_received':
                          return <Star className="h-4 w-4 text-warning" />;
                        case 'order_received':
                          return <ShoppingBag className="h-4 w-4 text-success" />;
                        default:
                          return <Clock className="h-4 w-4 text-muted-foreground" />;
                      }
                    };

                    const getActivityBgColor = (type: string) => {
                      switch (type) {
                        case 'order_completed':
                          return 'bg-success/10';
                        case 'message_received':
                          return 'bg-primary/10';
                        case 'review_received':
                          return 'bg-warning/10';
                        case 'order_received':
                          return 'bg-success/10';
                        default:
                          return 'bg-muted/10';
                      }
                    };

                    const timeAgo = (dateString: string) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                      
                      if (diffInHours < 1) return 'Just now';
                      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                      const diffInDays = Math.floor(diffInHours / 24);
                      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                    };

                    return (
                      <div key={activity._id} className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                        <div className={`w-8 h-8 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description.replace(/- \d+ \w+ ago/, `- ${timeAgo(activity.createdAt)}`)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}


