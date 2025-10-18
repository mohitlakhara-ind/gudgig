'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Filter, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/lib/api';
import { Notification } from '@/types/api';
import CustomLoader from '@/components/CustomLoader';
import { cn } from '@/lib/utils';

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
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

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
    
    return contextNotifications.filter(notification => {
      switch (effectiveFilter) {
        case 'unread':
          return !notification.read;
        case 'read':
          return notification.read;
        case 'applications':
          return notification.type === 'application_status' || notification.type === 'job_match' || notification.type === 'interview' || notification.type === 'offer';
        case 'messages':
          return notification.type === 'message';
        default:
          return true;
      }
    });
  }, [contextNotifications, effectiveFilter]);

  // Refresh notifications when refreshSignal changes
  useEffect(() => {
    if (refreshSignal) {
      refreshNotifications();
    }
  }, [refreshSignal, refreshNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [deleteNotification]);

  const handleRefresh = useCallback(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const toggleExpanded = useCallback((notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_accepted':
        return '🎉';
      case 'bid_rejected':
        return '❌';
      case 'message_received':
        return '💬';
      case 'payment_received':
        return '💰';
      case 'job_posted':
        return '📋';
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
  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
    
    switch (type) {
      case 'bid_accepted':
      case 'offer':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'bid_rejected':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'application_status':
      case 'job_posted':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'job_match':
        return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100';
      case 'interview':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      case 'message_received':
      case 'message':
        return 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100';
      case 'payment_received':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  // Get notification priority badge
  const getPriorityBadge = (type: string) => {
    switch (type) {
      case 'bid_accepted':
      case 'offer':
        return <Badge variant="default" className="bg-green-500 text-white text-xs">High</Badge>;
      case 'bid_rejected':
        return <Badge variant="destructive" className="text-xs">Important</Badge>;
      case 'payment_received':
        return <Badge variant="default" className="bg-yellow-500 text-white text-xs">Payment</Badge>;
      case 'interview':
        return <Badge variant="default" className="bg-purple-500 text-white text-xs">Interview</Badge>;
      default:
        return null;
    }
  };

  // Format time ago with better precision
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

  // Check if notification has long content
  const hasLongContent = (notification: Notification) => {
    return notification.message && notification.message.length > 100;
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
            <div key={i} className="flex items-start space-x-3 animate-pulse">
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
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-blue-600" />
              {contextUnreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {contextUnreadCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-bounce">
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
              className="hover:bg-blue-100"
            >
              {isLoading ? <CustomLoader size={16} color="#1FA9FF" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            {contextUnreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="hover:bg-green-100"
                title="Mark all as read"
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
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'unread', 'read', 'applications', 'messages'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={(effectiveFilter) === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setInternalFilter(filterType);
                  onFilterChange?.(filterType);
                }}
                className={cn(
                  "transition-all duration-200",
                  effectiveFilter === filterType 
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                    : "hover:bg-blue-50 hover:border-blue-300"
                )}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications list */}
        <div 
          className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{ maxHeight }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isExpanded = expandedNotifications.has(notification._id);
              const isLongContent = hasLongContent(notification);
              
              return (
                <div
                  key={notification._id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200 cursor-pointer group",
                    getNotificationColor(notification.type, notification.read),
                    !notification.read && "shadow-sm ring-1 ring-blue-200"
                  )}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-2xl transform transition-transform duration-200 group-hover:scale-110">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.read ? "text-gray-900" : "text-gray-700"
                          )}>
                            {notification.title}
                          </h4>
                          {getPriorityBadge(notification.type)}
                        </div>
                        <p className={cn(
                          "text-sm mt-1",
                          !notification.read ? "text-gray-800" : "text-gray-600",
                          isLongContent && !isExpanded ? "line-clamp-2" : ""
                        )}>
                          {notification.message}
                        </p>
                        {isLongContent && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(notification._id);
                            }}
                            className="mt-2 h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {isExpanded ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                            {isExpanded ? 'Show less' : 'Show more'}
                          </Button>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(typeof notification.createdAt === 'string' ? notification.createdAt : new Date(notification.createdAt).toISOString())}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                          title="Mark as read"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification._id);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        title="Delete notification"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}

