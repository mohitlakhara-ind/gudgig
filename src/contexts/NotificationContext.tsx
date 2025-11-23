'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  // Push notification methods
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  pushPermission: NotificationPermission;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  testPushNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const BROADCAST_CHANNEL_NAME = 'gigsmint-notifications';

type IncomingNotificationPayload = Partial<Notification> & {
  id?: string;
  notificationId?: string;
  body?: string;
};

const sortNotifications = (items: Notification[]) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const generateNotificationId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `notification-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeIncomingNotification = (
  incoming: IncomingNotificationPayload
): Notification => {
  const createdAtRaw = incoming?.createdAt ?? Date.now();
  const createdAt =
    typeof createdAtRaw === 'string'
      ? createdAtRaw
      : new Date(createdAtRaw).toISOString();

  return {
    _id: incoming?._id || incoming?.id || incoming?.notificationId || generateNotificationId(),
    title: incoming?.title || 'New notification',
    message: incoming?.message || incoming?.body || 'You have a new notification.',
    type: incoming?.type || 'general',
    read: Boolean(incoming?.read),
    createdAt,
    data: incoming?.data,
  };
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
    testNotification: testPushNotification,
  } = usePushNotifications();

  const handleIncomingNotification = useCallback(
    (incoming: IncomingNotificationPayload | null | undefined, options?: { silent?: boolean; skipBroadcast?: boolean }) => {
      if (!incoming) return;
      const normalized = normalizeIncomingNotification(incoming);
      let unreadDelta = 0;

      setNotifications(prev => {
        const existingIndex = prev.findIndex(n => n._id === normalized._id);
        if (existingIndex >= 0) {
          const next = [...prev];
          const previousItem = next[existingIndex];
          const merged = { ...previousItem, ...normalized };
          next[existingIndex] = merged;

          if (!previousItem.read && merged.read) {
            unreadDelta -= 1;
          } else if (previousItem.read && !merged.read) {
            unreadDelta += 1;
          }

          return sortNotifications(next);
        }

        if (!normalized.read) {
          unreadDelta += 1;
        }

        return sortNotifications([normalized, ...prev]);
      });

      if (unreadDelta !== 0) {
        setUnreadCount(prev => Math.max(0, prev + unreadDelta));
      }

      if (!options?.skipBroadcast) {
        broadcastRef.current?.postMessage({
          type: 'NOTIFICATION_NEW',
          payload: normalized,
          source: 'notification-context',
        });
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification:new', { detail: normalized }));

        if (
          !options?.silent &&
          typeof document !== 'undefined' &&
          document.visibilityState === 'visible' &&
          !normalized.read
        ) {
          toast.success(normalized.title || 'New notification');
        }
      }
    },
    []
  );

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getNotifications();
      if (response.success && response.data) {
        const responseData = response.data as any;
        const notificationList = Array.isArray(responseData) ? responseData : responseData?.notifications || [];
        setNotifications(notificationList);
        setUnreadCount(notificationList.filter((n: Notification) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiClient.getUnreadNotificationCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, [user]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
    await loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if (!user) {
      broadcastRef.current?.close();
      broadcastRef.current = null;
      return;
    }

    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastRef.current = channel;

    const handleMessage = (event: MessageEvent) => {
      const { type, payload, source } = event.data || {};
      if (source === 'notification-context') return;

      if (type === 'NOTIFICATION_NEW') {
        handleIncomingNotification(payload, { skipBroadcast: true, silent: true });
      } else if (type === 'NOTIFICATION_REFRESH') {
        refreshNotifications();
      }
    };

    channel.onmessage = handleMessage;

    return () => {
      channel.onmessage = null;
      channel.close();
      if (broadcastRef.current === channel) {
        broadcastRef.current = null;
      }
    };
  }, [user, handleIncomingNotification, refreshNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Fallback: just update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // Fallback: just update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.deleteNotification(id);
      const deletedNotification = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
    }
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await apiClient.clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      toast.error('Failed to clear notifications');
    }
  }, []);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id || user?._id]); // Only depend on user ID to prevent infinite loops

  // Listen for service worker push messages
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !user
    ) {
      return;
    }

    const handler = (event: MessageEvent) => {
      const { type, payload } = (event.data || {}) as { type?: string; payload?: any };
      if (type === 'PUSH_NOTIFICATION') {
        handleIncomingNotification(payload);
      } else if (type === 'NOTIFICATION_REFRESH') {
        refreshNotifications();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handler);
    };
  }, [user, handleIncomingNotification, refreshNotifications]);

  // Listen for new notifications via custom events
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent) => {
      handleIncomingNotification(event.detail);
    };

    const handleNotificationUpdate = (event: CustomEvent) => {
      const { id, read } = event.detail;
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read } : n)
      );
      if (read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('notification:new', handleNewNotification as EventListener);
    window.addEventListener('notification:updated', handleNotificationUpdate as EventListener);

    return () => {
      window.removeEventListener('notification:new', handleNewNotification as EventListener);
      window.removeEventListener('notification:updated', handleNotificationUpdate as EventListener);
    };
  }, [handleIncomingNotification]);

  // Refresh when coming back online or tab becomes visible
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !user) {
      return;
    }

    const handleOnline = () => {
      refreshNotifications();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    isPushSupported,
    isPushSubscribed,
    pushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testPushNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}



