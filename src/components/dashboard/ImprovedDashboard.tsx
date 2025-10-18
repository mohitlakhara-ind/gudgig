'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { bidService } from '@/services/bidService';
import AnalyticsDashboard from './AnalyticsDashboard';
import RecentActivity from './RecentActivity';
import ProfileCompletion from './ProfileCompletion';

export default function ImprovedDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    completedBids: 0,
    earnings: 0,
    profileViews: 0,
    responseRate: 0
  });
  const [showAllStats, setShowAllStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle different user object structures
  const actualUser = user;
  const userName = actualUser?.name || actualUser?.email?.split('@')[0] || 'User';
  const userRole = actualUser?.role;

  // Fetch real stats from API and local storage
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Try to get stats from API first
        try {
          const [freelancerStats, myGigsStats] = await Promise.all([
            apiClient.getFreelancerStats(),
            apiClient.getMyGigsStats()
          ]);
          
          console.log('📊 Freelancer stats:', freelancerStats);
          console.log('📊 My gigs stats:', myGigsStats);
          
          if (freelancerStats.success && freelancerStats.data) {
            const data = freelancerStats.data as any;
            const gigs = (myGigsStats as any)?.data || {};
            
            // Map the real API data to our stats structure
            setStats({
              totalBids: gigs.totalBids ?? data.applications ?? 0,
              activeBids: gigs.pendingBids ?? data.activeOrders ?? 0,
              completedBids: gigs.wonBids ?? data.completedOrders ?? 0,
              earnings: gigs.totalSpent ?? data.totalEarnings ?? 0,
              profileViews: data.profileViews ?? 0,
              responseRate: data.responseRate ?? 85
            });
            
            setProfileCompleteness(data.profileCompleteness || 0);
            
            
            console.log('✅ Stats loaded successfully from API');
            return;
          }
        } catch (apiError) {
          console.warn('API stats failed, using local storage:', apiError);
        }
        
        // Fallback to local storage
        const userId = user?._id || 'demo_user';
        const userBids = bidService.getBidsByUser(userId);
        const bidStats = bidService.getBidStats();
        
        setStats({
          totalBids: userBids.length,
          activeBids: userBids.filter(bid => bid.status === 'pending').length,
          completedBids: userBids.filter(bid => bid.status === 'accepted').length,
          earnings: bidStats.totalRevenue,
          profileViews: 0,
          responseRate: 85
        });
        
        setProfileCompleteness(75); // Demo value
        
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Listen for new bid events to update stats
    const handleBidCreated = () => {
      fetchStats();
    };
    
    window.addEventListener('bidCreated', handleBidCreated);
    
    return () => {
      window.removeEventListener('bidCreated', handleBidCreated);
    };
  }, [isAuthenticated, user]);

  const [profileCompleteness, setProfileCompleteness] = useState(0);

  const quickActions = [
    {
      title: 'Browse Gigs',
      description: 'Find new opportunities',
      icon: Briefcase,
      href: '/gigs',
      color: 'bg-blue-500'
    },
    {
      title: 'My Bids',
      description: 'Track your applications',
      icon: Clock,
      href: '/dashboard/bids',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Client conversations',
      icon: MessageSquare,
      // Messages page not implemented
      // href: '/dashboard/messages',
      color: 'bg-purple-500'
    },
    {
      title: 'Profile',
      description: 'Update your profile',
      icon: Users,
      href: '/profile',
      color: 'bg-orange-500'
    }
  ];


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-subtle-primary rounded-lg p-4 sm:p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Here&apos;s what&apos;s happening with your freelancing journey today.
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Card>
        ) : (
          /* Mobile: Show first 2 stats, then expandable */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* First two stats - always visible */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Bids</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.totalBids}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from last month
                </p>
              </CardContent>
            </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Bids</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats.activeBids}</div>
              <p className="text-xs text-muted-foreground">
                Currently pending
              </p>
            </CardContent>
          </Card>

          {/* Additional stats - hidden on mobile unless expanded */}
          <div className={`${showAllStats ? 'block' : 'hidden sm:block'} sm:block`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Bid Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">${stats.earnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className={`${showAllStats ? 'block' : 'hidden sm:block'} sm:block`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Profile Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.profileViews}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

            {/* Mobile expand/collapse button */}
            <div className="sm:hidden text-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAllStats(!showAllStats)}
                className="text-xs"
              >
                {showAllStats ? 'Show Less' : 'Show More Stats'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm sm:text-base">Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const key = action.href || action.title;
              const CardInner = (
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">{action.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              return action.href ? (
                <Link key={key} href={action.href}>
                  {CardInner}
                </Link>
              ) : (
                <div key={key} aria-disabled className="opacity-80">
                  {CardInner}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Analytics & Insights</CardTitle>
          <CardDescription className="text-sm sm:text-base">Comprehensive analytics and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsDashboard />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Enhanced Recent Activity */}
        <RecentActivity />

        {/* Enhanced Profile Completion */}
        <ProfileCompletion />
      </div>
    </div>
  );
}

