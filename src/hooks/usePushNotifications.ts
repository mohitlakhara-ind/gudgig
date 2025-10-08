'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = isSupported ? Notification.permission : 'denied';
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }));

    // Check if already subscribed
    if (isSupported && user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
      }));
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications are not supported in this browser',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));

      if (permission === 'granted') {
        toast.success('Notification permission granted!');
        return true;
      } else if (permission === 'denied') {
        setState(prev => ({
          ...prev,
          error: 'Notification permission denied. Please enable it in your browser settings.',
        }));
        toast.error('Notification permission denied');
        return false;
      } else {
        setState(prev => ({
          ...prev,
          error: 'Notification permission was not granted',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = 'Failed to request notification permission';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setState(prev => ({
        ...prev,
        error: 'User must be logged in to subscribe to notifications',
      }));
      return false;
    }

    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications are not supported in this browser',
      }));
      return false;
    }

    if (state.permission !== 'granted') {
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        return false;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch('/api/notifications/vapid-public-key');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get VAPID public key: ${response.status} ${errorText}`);
      }
      const { publicKey } = await response.json();

      if (!publicKey) {
        throw new Error('VAPID public key not received from server');
      }

      // Convert VAPID key to BufferSource (ArrayBuffer)
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const applicationServerKeyBuffer = new Uint8Array(applicationServerKey).buffer as ArrayBuffer;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKeyBuffer,
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      const saveResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscriptionData,
          userId: user._id,
        }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save subscription to server: ${saveResponse.status} ${errorText}`);
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      toast.success('Successfully subscribed to push notifications!');
      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe to notifications';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, [user, state.isSupported, state.permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from server
        if (user) {
          await fetch('/api/notifications/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
          userId: user._id,
              endpoint: subscription.endpoint,
            }),
          });
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      toast.success('Unsubscribed from push notifications');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unsubscribe from notifications';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      toast.error(errorMessage);
      return false;
    }
  }, [state.isSupported, user]);

  // Test notification
  const testNotification = useCallback(async (): Promise<void> => {
    if (state.permission !== 'granted') {
      toast.error('Notification permission not granted');
      return;
    }

    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      toast.success('Test notification sent!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send test notification';
      toast.error(errorMessage);
    }
  }, [state.permission, user]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    testNotification,
    checkSubscriptionStatus,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}


