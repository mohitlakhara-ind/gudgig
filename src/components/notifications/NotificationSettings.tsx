'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  BellOff, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Smartphone,
  Mail,
  MessageSquare
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
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
  } = usePushNotifications();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [bidNotifications, setBidNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [jobMatchNotifications, setJobMatchNotifications] = useState(true);
  const [paymentNotifications, setPaymentNotifications] = useState(true);

  const handleTogglePushNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleTestNotification = async () => {
    await testNotification();
  };

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

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to manage your notification settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive instant notifications on your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Push notifications are not supported in this browser.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Browser Notifications</span>
                <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                  {isSubscribed ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
                Permission: {permissionStatus.text}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSubscribed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  disabled={isLoading}
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Test
                </Button>
              )}
              <Button
                variant={isSubscribed ? 'destructive' : 'default'}
                size="sm"
                onClick={handleTogglePushNotifications}
                disabled={isLoading || !isSupported}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : isSubscribed ? (
                  <BellOff className="h-4 w-4 mr-1" />
                ) : (
                  <Bell className="h-4 w-4 mr-1" />
                )}
                {isSubscribed ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>

          {permission === 'denied' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Notifications are blocked. Please enable them in your browser settings:
                <br />
                • Chrome: Settings → Privacy and security → Site settings → Notifications
                <br />
                • Firefox: Settings → Privacy & Security → Notifications
                <br />
                • Safari: Safari → Preferences → Websites → Notifications
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Email Notifications</span>
              <p className="text-sm text-muted-foreground">
                Get important updates delivered to your inbox
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive urgent notifications via SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">SMS Notifications</span>
              <p className="text-sm text-muted-foreground">
                Get critical updates via text message
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={setSmsNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Bid Updates</span>
              <p className="text-sm text-muted-foreground">
                Notifications about bid status changes
              </p>
            </div>
            <Switch
              checked={bidNotifications}
              onCheckedChange={setBidNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Messages</span>
              <p className="text-sm text-muted-foreground">
                Notifications about new messages
              </p>
            </div>
            <Switch
              checked={messageNotifications}
              onCheckedChange={setMessageNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Job Matches</span>
              <p className="text-sm text-muted-foreground">
                Notifications about matching job opportunities
              </p>
            </div>
            <Switch
              checked={jobMatchNotifications}
              onCheckedChange={setJobMatchNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">Payment Updates</span>
              <p className="text-sm text-muted-foreground">
                Notifications about payment status
              </p>
            </div>
            <Switch
              checked={paymentNotifications}
              onCheckedChange={setPaymentNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            // TODO: Save settings to backend
            toast.success('Notification settings saved!');
          }}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}

export default NotificationSettings;



