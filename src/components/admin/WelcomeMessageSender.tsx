'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2,
  MessageSquare,
  Crown,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WelcomeMessageSenderProps {
  className?: string;
  showDetails?: boolean;
}

export function WelcomeMessageSender({ 
  className = '', 
  showDetails = true 
}: WelcomeMessageSenderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSendWelcomeMessage = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/admin/notifications/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setLastResult(data.data);
        toast.success(`Welcome message sent to ${data.data.successCount} users!`);
      } else {
        toast.error(data.message || 'Failed to send welcome message');
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
      toast.error('Failed to send welcome message');
    } finally {
      setIsLoading(false);
    }
  };

  const successCount = lastResult?.successCount || 0;
  const totalUsers = lastResult?.totalUsers || 0;
  const adminCount = lastResult?.results?.filter((r: any) => r.role === 'admin').length || 0;
  const userCount = lastResult?.results?.filter((r: any) => r.role !== 'admin').length || 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Welcome Message
        </CardTitle>
        <CardDescription>
          Send a welcome message to all users and admins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Recipients</span>
          </div>
          <Badge variant="outline">
            All Users & Admins
          </Badge>
        </div>

        <Button
          onClick={handleSendWelcomeMessage}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Messages...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Welcome Message
            </>
          )}
        </Button>

        {showDetails && lastResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{successCount}</div>
                <div className="text-xs text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{totalUsers}</div>
                <div className="text-xs text-blue-600">Total Users</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{userCount} Users</span>
              </div>
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span>{adminCount} Admins</span>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Welcome message sent successfully! Users will receive both in-app notifications and push notifications (if enabled).
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WelcomeMessageSender;


