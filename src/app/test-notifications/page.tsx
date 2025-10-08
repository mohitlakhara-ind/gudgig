'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    testNotification,
    checkSubscriptionStatus,
  } = usePushNotifications();

  const [testResults, setTestResults] = useState<any>(null);

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: CheckCircle, color: 'text-green-500', text: 'Granted' };
      case 'denied':
        return { icon: XCircle, color: 'text-red-500', text: 'Denied' };
      default:
        return { icon: AlertTriangle, color: 'text-yellow-500', text: 'Not requested' };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  const handleTestNotification = async () => {
    try {
      await testNotification();
      setTestResults({ success: true, message: 'Test notification sent successfully!' });
    } catch (error) {
      setTestResults({ success: false, message: error instanceof Error ? error.message : 'Test failed' });
    }
  };

  const handleRefreshStatus = async () => {
    await checkSubscriptionStatus();
    toast.success('Status refreshed');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Push Notifications Test</h1>
          <p className="text-muted-foreground mt-2">
            Test and debug push notification functionality
          </p>
        </div>

        {/* User Status */}
        <Card>
          <CardHeader>
            <CardTitle>User Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Logged in as: {user.email}</span>
                <Badge variant="default">User ID: {user.id}</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Not logged in</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Support */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isSupported ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span>Push notifications supported: {isSupported ? 'Yes' : 'No'}</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Service Worker: {'serviceWorker' in navigator ? '✓' : '✗'}<br />
              Push Manager: {'PushManager' in window ? '✓' : '✗'}
            </div>
          </CardContent>
        </Card>

        {/* Permission Status */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
              <span>Permission: {permissionStatus.text}</span>
            </div>
            {permission === 'denied' && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Notifications are blocked. Please enable them in your browser settings.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Subscribed: {isSubscribed ? 'Yes' : 'No'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStatus}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults && (
          <Alert variant={testResults.success ? 'default' : 'destructive'}>
            {testResults.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResults.message}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Test push notification functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              {!isSubscribed ? (
                <Button
                  onClick={subscribe}
                  disabled={isLoading || !isSupported || !user}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4 mr-1" />
                  )}
                  Subscribe to Notifications
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={unsubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4 mr-1" />
                  )}
                  Unsubscribe
                </Button>
              )}

              {isSubscribed && (
                <Button
                  variant="outline"
                  onClick={handleTestNotification}
                  disabled={isLoading}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Send Test Notification
                </Button>
              )}
            </div>

            {!user && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please log in to test push notifications.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div>User Agent: {navigator.userAgent}</div>
              <div>HTTPS: {location.protocol === 'https:' ? 'Yes' : 'No'}</div>
              <div>Service Worker Support: {'serviceWorker' in navigator ? 'Yes' : 'No'}</div>
              <div>Push Manager Support: {'PushManager' in window ? 'Yes' : 'No'}</div>
              <div>Notification Support: {'Notification' in window ? 'Yes' : 'No'}</div>
              <div>Current Permission: {permission}</div>
              <div>Is Subscribed: {isSubscribed ? 'Yes' : 'No'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
