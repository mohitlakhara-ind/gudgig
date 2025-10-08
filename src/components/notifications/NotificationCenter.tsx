'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/lib/api';
import { Notification } from '@/types/api';
import CustomLoader from '@/components/CustomLoader';

interface NotificationCenterProps {
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
  // Optional external control over filter; when provided, internal filter UI is hidden
  filter?: 'all' | 'unread' | 'read' | 'applications' | 'messages';
  // Optional callback when internal filter is changed (uncontrolled mode only)
  onFilterChange?: (next: 'all' | 'unread' | 'read' | 'applications' | 'messages') => void;
  // Optional signal to force reload when value changes
  refreshSignal?: number;
}

export function NotificationCenter({ 
  className = '', 
  showHeader = true, 
  maxHeight = '400px',
  filter: externalFilter,
  onFilterChange,
  refreshSignal,
}: NotificationCenterProps) {
  const [internalFilter, setInternalFilter] = useState<'all' | 'unread' | 'read' | 'applications' | 'messages'>('all');

  const { 
    notifications: contextNotifications,
    unreadCount: contextUnreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications();

  // Determine effective filter
  const effectiveFilter = externalFilter ?? internalFilter;

  // Filter notifications based on the current filter
  const filteredNotifications = useMemo(() => {
    if (!contextNotifications) return [];
    
    switch (effectiveFilter) {
      case 'unread':
        return contextNotifications.filter(n => !n.read);
      case 'read':
        return contextNotifications.filter(n => n.read);
      case 'applications':
        return contextNotifications.filter(n => 
          ['application_status', 'job_match', 'interview', 'offer', 'bid_accepted', 'bid_rejected'].includes(n.type)
        );
      case 'messages':
        return contextNotifications.filter(n => n.type === 'message');
      default:
        return contextNotifications;
    }
  }, [contextNotifications, effectiveFilter]);

  // Refresh notifications when refreshSignal changes
  useEffect(() => {
    if (refreshSignal) {
      refreshNotifications();
    }
  }, [refreshSignal, refreshNotifications]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshNotifications();
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

  if (isLoading && filteredNotifications.length === 0) {
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
            {contextUnreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {contextUnreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? <CustomLoader size={16} color="#1FA9FF" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            {contextUnreadCount > 0 && (
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
        {/* Filter buttons (only when uncontrolled) */}
        {!externalFilter && (
          <div className="flex space-x-2 mb-4">
            {(['all', 'unread', 'read', 'applications', 'messages'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={(effectiveFilter) === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setInternalFilter(filterType);
                  onFilterChange?.(filterType);
                }}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
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
          className="space-y-3 overflow-y-auto scrollbar-thin"
          style={{ maxHeight }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
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

        </div>
      </div>
    </Card>
  );
}

export default NotificationCenter;