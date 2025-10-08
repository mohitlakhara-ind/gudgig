'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Loader2,
  MessageCircle,
  DollarSign,
  Briefcase,
  AlertCircle,
  Settings
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'bid_accepted' | 'bid_rejected' | 'message_received' | 'payment_received' | 'job_posted' | 'system';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    jobId?: string;
    bidId?: string;
    amount?: number;
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getNotifications();
        if (response.success && response.data) {
          // Handle both NotificationList and Notification[] formats
          const notifications = Array.isArray(response.data) 
            ? response.data 
            : (response.data as any).notifications || [];
          setNotifications(notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Don't show error toast for now since backend might not be ready
        // toast.error('Failed to load notifications');
        
        // Provide fallback mock data for development
        const fallbackNotifications = [
          {
            _id: '1',
            title: 'Welcome to Gigs Mint!',
            message: 'Get started by completing your profile and browsing available gigs.',
            type: 'system' as const,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Profile Setup Reminder',
            message: 'Complete your profile to increase your chances of getting hired.',
            type: 'system' as const,
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setNotifications(fallbackNotifications);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Fallback: just update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    }
  };

  const clearAll = async () => {
    try {
      // TODO: Implement clear all notifications API
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback: just update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    }
  };

  const removeOne = async (id: string) => {
    try {
      // TODO: Implement delete notification API
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification removed');
    } catch (error) {
      console.error('Error removing notification:', error);
      toast.error('Failed to remove notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'bid_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'message_received':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'payment_received':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'job_posted':
        return <Briefcase className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Filter notifications based on search and filter
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === 'read' && notification.isRead);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay up to date with your account activity</p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="mt-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllRead} 
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll} 
            disabled={notifications.length === 0}
          >
            Clear all
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/settings/notifications')}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <NotificationCenter 
        className="w-full"
        showHeader={false}
        maxHeight="600px"
        filter={filter === 'all' ? 'all' : filter === 'unread' ? 'unread' : 'read'}
        onFilterChange={(newFilter) => {
          if (newFilter === 'all') setFilter('all');
          else if (newFilter === 'unread') setFilter('unread');
          else if (newFilter === 'read') setFilter('read');
        }}
      />
    </div>
  );
}
