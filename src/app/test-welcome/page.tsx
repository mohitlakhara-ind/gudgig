'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  CheckCircle, 
  Loader2,
  MessageSquare,
  Bell,
  Crown,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TestWelcomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSendWelcomeMessage = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/notifications/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
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

  const successCount = result?.successCount || 0;
  const totalUsers = result?.totalUsers || 0;
  const adminCount = result?.results?.filter((r: any) => r.role === 'admin').length || 0;
  const userCount = result?.results?.filter((r: any) => r.role !== 'admin').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome Message Test</h1>
          <p className="text-muted-foreground">
            Test the welcome message broadcast functionality
          </p>
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Send Welcome Message
            </CardTitle>
            <CardDescription>
              This will send a welcome message to all users and admins in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Message Preview */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Message Preview:</h4>
              <div className="text-sm space-y-2">
                <div className="font-medium">Title: Welcome to Gigs Mint! 🎉</div>
                <div className="text-muted-foreground">
                  Welcome to Gigs Mint! We're excited to have you join our professional freelancer marketplace!
                  <br /><br />
                  Here's what you can do on Gigs Mint:
                  <br />• Browse and apply to amazing freelance opportunities
                  <br />• Connect with top-tier clients and employers
                  <br />• Build your professional portfolio
                  <br />• Get paid securely through our platform
                  <br /><br />
                  Start exploring gigs and take your freelance career to the next level!
                  <br /><br />
                  Best regards,
                  <br />The Gigs Mint Team
                </div>
              </div>
            </div>

            {/* Recipients Info */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Recipients</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600">
                  <User className="h-3 w-3 mr-1" />
                  {userCount} Users
                </Badge>
                <Badge variant="outline" className="text-yellow-600">
                  <Crown className="h-3 w-3 mr-1" />
                  {adminCount} Admins
                </Badge>
              </div>
            </div>

            {/* Send Button */}
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

            {/* Results */}
            {result && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Welcome message sent successfully! Users will receive both in-app notifications and push notifications (if enabled).
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{successCount}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
                    <div className="text-sm text-blue-600">Total Users</div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="font-medium">Detailed Results:</h4>
                  {result.results?.map((user: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        user.status === 'success' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {user.status === 'success' ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-red-600"></div>
                        )}
                        <span className="font-medium">{user.name}</span>
                        <span className="text-muted-foreground">({user.email})</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={user.role === 'admin' ? 'text-yellow-600' : 'text-blue-600'}
                      >
                        {user.role === 'admin' ? (
                          <Crown className="h-3 w-3 mr-1" />
                        ) : (
                          <User className="h-3 w-3 mr-1" />
                        )}
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>In-App Notifications:</strong> Users will see the welcome message in their notification center
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <strong>Push Notifications:</strong> Users with push notifications enabled will receive a browser notification
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <strong>Real-time Updates:</strong> The notification will appear immediately in the user's interface
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


