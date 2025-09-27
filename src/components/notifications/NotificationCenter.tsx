'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocketContext } from '@/contexts/SocketContext';
import { apiClient } from '@/lib/api';
import { Notification } from '@/types/api';

interface NotificationCenterProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function NotificationCenter({ 
  className = '', 
  showHeader = true, 
  maxHeight = '400px' 
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const { 
    onNotificationReceived, 
    onNotificationUpdated, 
    markNotificationAsRead,
    isConnected 
  } = useSocketContext();

  // Load notifications
  const loadNotifications = useCallback(async (pageNum = 1, filterType = filter, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = {
        page: pageNum,
        limit: 20,
        ...(filterType !== 'all' && { read: filterType === 'read' })
      };

      const response = await apiClient.getNotifications(params);
      
      if (response.success && response.data) {
        const responseData = response.data as any;
        const newNotifications = Array.isArray(responseData) ? responseData : responseData?.notifications || [];
        
        if (reset || pageNum === 1) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }

        const pagination = responseData?.pagination;
        if (pagination) {
          setHasMore(pagination.page < pagination.pages);
        }
        setPage(pageNum);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.getUnreadNotificationCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNotifications(1, filter, true);
    loadUnreadCount();
  }, [filter, loadNotifications, loadUnreadCount]);

  // Socket event listeners
  useEffect(() => {
    const unsubscribeNewNotification = onNotificationReceived((notification) => {
      // Convert NotificationEvent to Notification format
      const newNotification: Notification = {
        _id: notification.id,
        user: '', // Will be populated by backend
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: false,
        createdAt: new Date(notification.createdAt)
      } as Notification;
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    const unsubscribeNotificationUpdate = onNotificationUpdated((data) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === data.id
            ? { ...notif, read: data.read, readAt: data.read ? new Date() : undefined }
            : notif
        )
      );
      if (data.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    return () => {
      unsubscribeNewNotification();
      unsubscribeNotificationUpdate();
    };
  }, [onNotificationReceived, onNotificationUpdated]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      markNotificationAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await apiClient.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadNotifications(page + 1, filter, false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadNotifications(1, filter, true);
    loadUnreadCount();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return '📋';
      case 'job_match':
        return '🎯';
      case 'interview':
        return '🤝';
      case 'offer':
        return '🎉';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application_status':
        return 'bg-blue-50 border-blue-200';
      case 'job_match':
        return 'bg-green-50 border-green-200';
      case 'interview':
        return 'bg-purple-50 border-purple-200';
      case 'offer':
        return 'bg-yellow-50 border-yellow-200';
      case 'message':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && notifications.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        )}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Filter buttons */}
        <div className="flex space-x-2 mb-4">
          {(['all', 'unread', 'read'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
            >
              <Filter className="h-3 w-3 mr-1" />
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>

        {/* Connection status */}
        {!isConnected && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            ⚠️ Real-time updates unavailable. Refresh to see latest notifications.
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Notifications list */}
        <div 
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight }}
        >
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-white border-gray-200' 
                    : `${getNotificationColor(notification.type)} font-medium`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimeAgo(typeof notification.createdAt === 'string' ? notification.createdAt : new Date(notification.createdAt).toISOString())}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete notification"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Load more button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default NotificationCenter;