'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Users, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Loader2,
  MessageSquare,
  Crown,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BroadcastResult {
  userId: string;
  email: string;
  name: string;
  role: string;
  status: 'success' | 'failed';
  error?: string;
}

export default function BroadcastNotificationsPage() {
  const [title, setTitle] = useState('Welcome to Gudgig! 🎉');
  const [message, setMessage] = useState(`We're excited to have you join our professional freelancer marketplace! 

Here's what you can do on Gudgig:
• Browse and apply to amazing freelance opportunities
• Connect with top-tier clients and employers
• Build your professional portfolio
• Get paid securely through our platform

Start exploring gigs and take your freelance career to the next level!

Best regards,
The Gudgig Team`);
  const [includeAdmins, setIncludeAdmins] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BroadcastResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSendWelcomeMessage = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }

    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/admin/notifications/broadcast-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          includeAdmins
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setShowResults(true);
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

  const successCount = results.filter(r => r.status === 'success').length;
  const failureCount = results.filter(r => r.status === 'failed').length;
  const adminCount = results.filter(r => r.role === 'admin').length;
  const userCount = results.filter(r => r.role !== 'admin').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Broadcast Welcome Message</h1>
          <p className="text-muted-foreground">Send a welcome message to all users and admins</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          Admin Only
        </Badge>
      </div>

      {/* Welcome Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Welcome Message
          </CardTitle>
          <CardDescription>
            Create a personalized welcome message for all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter message title..."
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message Content</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your welcome message..."
              className="w-full min-h-[200px]"
              rows={8}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Include Administrators</span>
            </div>
            <Switch
              checked={includeAdmins}
              onCheckedChange={setIncludeAdmins}
            />
          </div>

          <Button
            onClick={handleSendWelcomeMessage}
            disabled={isLoading || !title.trim() || !message.trim()}
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
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Broadcast Results
            </CardTitle>
            <CardDescription>
              Summary of the welcome message broadcast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{successCount}</div>
                <div className="text-xs text-success">Successful</div>
              </div>
              <div className="text-center p-3 bg-error/10 rounded-lg">
                <div className="text-2xl font-bold text-error">{failureCount}</div>
                <div className="text-xs text-error">Failed</div>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{userCount}</div>
                <div className="text-xs text-primary">Users</div>
              </div>
              <div className="text-center p-3 bg-warning/10 rounded-lg">
                <div className="text-2xl font-bold text-warning">{adminCount}</div>
                <div className="text-xs text-warning">Admins</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.status === 'success' 
                      ? 'bg-success/10 border-success/20' 
                      : 'bg-error/10 border-error/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-error" />
                    )}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={result.role === 'admin' ? 'text-warning' : 'text-primary'}
                    >
                      {result.role === 'admin' ? (
                        <Crown className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {result.role}
                    </Badge>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                    >
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Error Details */}
            {failureCount > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {failureCount} message(s) failed to send. Check the detailed results above for error information.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Welcome Templates</CardTitle>
          <CardDescription>
            Use these pre-written templates for common welcome scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setTitle('Welcome to Gudgig! 🎉');
                setMessage(`Welcome to Gudgig! We're thrilled to have you join our professional freelancer marketplace.

Get started by:
• Completing your profile
• Browsing available gigs
• Connecting with clients
• Building your portfolio

Happy freelancing!
The Gudgig Team`);
              }}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              General Welcome
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTitle('New Features Available! 🚀');
                setMessage(`Exciting news! We've just launched new features on Gudgig:

✨ Enhanced notification system
🔔 Real-time push notifications
📱 Improved mobile experience
💬 Better messaging system

Update your app to enjoy these new features!

Best regards,
The Gudgig Team`);
              }}
              className="justify-start"
            >
              <Bell className="h-4 w-4 mr-2" />
              Feature Announcement
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setTitle('Thank You for Being Part of Our Community! 🙏');
                setMessage(`Dear Gudgig Community,

Thank you for being an integral part of our growing platform. Your success is our success!

We're constantly working to improve your experience and provide better opportunities for freelancers and clients alike.

Keep up the great work!

With gratitude,
The Gudgig Team`);
              }}
              className="justify-start"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Community Appreciation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


