'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, RefreshCw, Trash2, Inbox, MoreVertical } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAllAsRead,
    clearAll,
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const lastActivity = useMemo(() => {
    if (!notifications.length) return null;
    return formatDistanceToNow(new Date(notifications[0].createdAt), { addSuffix: true });
  }, [notifications]);

  const totalCount = notifications.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[220px]">
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {totalCount ? 'Your most recent account activity appears here.' : 'No notifications yet — you’re all caught up.'}
          </p>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="mt-2">
              {unreadCount} unread
            </Badge>
          )}
          {lastActivity && (
            <p className="text-xs text-muted-foreground mt-1">Last update {lastActivity}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden flex-wrap gap-2 md:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshNotifications}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={!totalCount}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                aria-label="Notification actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  refreshNotifications();
                }}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  markAllAsRead();
                }}
                disabled={!unreadCount}
                className="flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  clearAll();
                }}
                disabled={!totalCount}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="text-2xl font-semibold text-primary">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-primary" />
              {isLoading ? 'Refreshing…' : totalCount ? 'Active' : 'Idle'}
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">
            Unable to load notifications: {error}
          </CardContent>
        </Card>
      )}

      {!totalCount && !isLoading ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Inbox className="mx-auto h-12 w-12 text-primary mb-4 opacity-60" />
            <p className="text-lg font-medium">You’re all caught up</p>
            <p className="text-sm mt-1">We’ll let you know when something needs your attention.</p>
          </CardContent>
        </Card>
      ) : (
        <NotificationCenter
          className="w-full"
          showHeader={false}
          maxHeight="600px"
          filter={filter}
          onFilterChange={(next) => {
            if (next === 'applications' || next === 'messages') return;
            setFilter(next as 'all' | 'unread' | 'read');
          }}
        />
      )}
    </div>
  );
}
