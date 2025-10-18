'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Eye, 
  Briefcase, 
  DollarSign,
  TrendingUp,
  Star,
  Calendar,
  ArrowRight,
  Loader2,
  Activity
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface ActivityItem {
  _id: string;
  type: 'bid' | 'message' | 'profile_view' | 'order' | 'review' | 'application';
  title: string;
  description: string;
  status: 'success' | 'pending' | 'warning' | 'info';
  amount?: number;
  createdAt: string;
  metadata?: {
    jobTitle?: string;
    category?: string;
    rating?: number;
    reviewerName?: string;
  };
}

interface RecentActivityProps {
  className?: string;
  limit?: number;
}

export default function RecentActivity({ className, limit = 8 }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recent bids and activities
        const [bidsResponse, statsResponse] = await Promise.all([
          apiClient.getMyBids(),
          apiClient.getFreelancerStats()
        ]);

        const activities: ActivityItem[] = [];

        // Process recent bids
        if (bidsResponse.success && bidsResponse.data) {
          const recentBids = bidsResponse.data.slice(0, 5).map((bid: any) => ({
            _id: bid._id,
            type: 'bid' as const,
            title: 'Bid Submitted',
            description: `Applied for ${bid.job?.title || 'a job'}`,
            status: bid.paymentStatus === 'succeeded' ? 'success' : 'pending' as const,
            amount: bid.bidFeePaid,
            createdAt: bid.createdAt,
            metadata: {
              jobTitle: bid.job?.title,
              category: bid.job?.category
            }
          }));
          activities.push(...recentBids);
        }

        // Process recent activity from stats
        if (statsResponse.success && statsResponse.data?.recentActivity) {
          const recentActivity = statsResponse.data.recentActivity.slice(0, 3).map((activity: any) => ({
            _id: activity._id,
            type: activity.type === 'order_completed' ? 'order' : 
                  activity.type === 'message_received' ? 'message' :
                  activity.type === 'review_received' ? 'review' : 'info' as const,
            title: activity.title,
            description: activity.description,
            status: activity.type === 'order_completed' ? 'success' : 'info' as const,
            amount: activity.description?.includes('$') ? 
                   parseInt(activity.description.match(/\$(\d+)/)?.[1] || '0') : undefined,
            createdAt: activity.createdAt,
            metadata: {
              jobTitle: activity.jobTitle,
              category: activity.category
            }
          }));
          activities.push(...recentActivity);
        }

        // Add some mock activities for demonstration
        const mockActivities: ActivityItem[] = [
          {
            _id: 'mock-1',
            type: 'profile_view',
            title: 'Profile Viewed',
            description: 'Your profile was viewed by a potential client',
            status: 'info',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          },
          {
            _id: 'mock-2',
            type: 'review',
            title: 'New Review Received',
            description: 'Sarah M. left a 5-star review for your service',
            status: 'success',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
            metadata: {
              rating: 5,
              reviewerName: 'Sarah M.'
            }
          },
          {
            _id: 'mock-3',
            type: 'message',
            title: 'New Message',
            description: 'You received a message about your recent bid',
            status: 'info',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          }
        ];

        // Combine and sort by date
        const allActivities = [...activities, ...mockActivities]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);

        setActivities(allActivities);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError('Failed to load recent activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return <Briefcase className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'profile_view':
        return <Eye className="h-4 w-4" />;
      case 'order':
        return <CheckCircle className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'application':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm sm:text-base">Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm sm:text-base">Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm sm:text-base">Your latest updates and notifications</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/activity">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getStatusColor(activity.status)} text-xs`}>
                    {getActivityIcon(activity.type)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.metadata?.jobTitle && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Job: {activity.metadata.jobTitle}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">
                      {activity.amount && (
                        <Badge variant="secondary" className="text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {activity.amount}
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                        <span className="ml-1 capitalize">{activity.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                    {activity.metadata?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-muted-foreground">
                          {activity.metadata.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
              <p className="text-muted-foreground mb-4">
                Start bidding on gigs to see your activity here
              </p>
              <Button asChild>
                <Link href="/gigs">
                  Browse Gigs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
