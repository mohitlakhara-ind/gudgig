'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter } from './NotificationCenter';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    unreadCount,
    isPushSupported,
    pushPermission,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
  } = useNotifications();

  const handleToggleNotifications = async () => {
    if (isPushSubscribed) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const handleNotificationSettings = () => {
    setIsOpen(false);
    router.push('/settings/notifications');
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {isPushSupported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleNotifications}
                    className="h-8 w-8 p-0"
                    title={isPushSubscribed ? 'Disable notifications' : 'Enable notifications'}
                  >
                    {isPushSubscribed ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationSettings}
                  className="h-8 w-8 p-0"
                  title="Notification settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!isPushSupported && (
              <div className="mt-2 text-xs text-muted-foreground">
                Push notifications not supported in this browser
              </div>
            )}
            
            {isPushSupported && pushPermission === 'denied' && (
              <div className="mt-2 text-xs text-red-600">
                Notifications are blocked. Enable them in browser settings.
              </div>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <NotificationCenter 
              showHeader={false}
              maxHeight="300px"
              className="border-0"
            />
          </div>
          
          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllNotifications}
              className="w-full"
            >
              View All Notifications
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default NotificationBell;
