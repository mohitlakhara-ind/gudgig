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
          const [freelancerStats, myGigsStats, myBids] = await Promise.all([
            apiClient.getFreelancerStats(),
            apiClient.getMyGigsStats(),
            apiClient.getMyBids().catch(() => null)
          ]);

          console.log('📊 Freelancer stats:', freelancerStats);
          console.log('📊 My gigs stats:', myGigsStats);

          if (freelancerStats.success && freelancerStats.data) {
            const data = freelancerStats.data as any;
            const gigs = (myGigsStats as any)?.data || {};
            const bidsArray = (myBids as any)?.data || [];

            // Map the real API data to our stats structure
            const normalizedBids = Array.isArray(bidsArray) ? bidsArray : [];
            const derived = {
              totalBids: normalizedBids.length,
              activeBids: normalizedBids.filter((b: any) => (b.selectionStatus && b.selectionStatus !== 'pending') ? b.selectionStatus === 'accepted' : b.paymentStatus === 'succeeded').length,
              completedBids: normalizedBids.filter((b: any) => b.selectionStatus === 'accepted').length,
            };

            setStats({
              totalBids: gigs.totalBids ?? derived.totalBids ?? data.applications ?? 0,
              activeBids: gigs.pendingBids ?? derived.activeBids ?? data.activeOrders ?? 0,
              completedBids: gigs.wonBids ?? derived.completedBids ?? data.completedOrders ?? 0,
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
      title: 'My Orders',
      description: 'Track your purchases/orders',
      icon: Clock,
      href: '/dashboard/orders',
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      description: 'Client conversations',
      icon: MessageSquare,
      // Messages page not implemented
      href: '/chat',
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Enhanced Recent Activity */}
        <RecentActivity />

        {/* Enhanced Profile Completion */}
        <ProfileCompletion />
      </div>
    </div>
  );
}

