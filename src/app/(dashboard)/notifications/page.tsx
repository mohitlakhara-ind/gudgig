
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocketContext } from '@/contexts/SocketContext';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { apiClient } from '@/lib/api';
import UsageMeter from '@/components/subscription/UsageMeter';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isConnected } = useSocketContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadUnreadCount();
  }, [isAuthenticated, router]);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUnreadNotificationCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPreferencesClick = () => {
    // Navigate to notification preferences page
    router.push('/dashboard/settings/notifications');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with your job search progress and important updates.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNotificationPreferencesClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Real-time notifications unavailable
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You're currently offline. Notifications will update when connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unread</span>
                  <Badge variant="destructive">{unreadCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Online" : "Offline"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageMeter />
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Application Updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Job Matches</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Interview Invites</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Job Offers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span>Messages</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Notification Center */}
          <div className="lg:col-span-3">
            <NotificationCenter
              showHeader={false}
              maxHeight="600px"
              className="border-0 shadow-sm"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
