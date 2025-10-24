'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AvatarTestComponent() {
  const { user } = useAuth();

  const avatarStatus = {
    hasAvatar: !!user?.avatar,
    avatarUrl: user?.avatar || '',
    userName: user?.name || 'User',
    userEmail: user?.email || ''
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
          Avatar Display Test
        </CardTitle>
        <CardDescription>
          Testing avatar display across different components and contexts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Avatar Status</h4>
            <div className="flex items-center gap-2">
              {avatarStatus.hasAvatar ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {avatarStatus.hasAvatar ? 'Avatar Present' : 'No Avatar'}
              </span>
            </div>
            {avatarStatus.hasAvatar && (
              <div className="text-xs text-muted-foreground break-all">
                URL: {avatarStatus.avatarUrl}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">User Info</h4>
            <div className="text-sm">
              <div>Name: {avatarStatus.userName}</div>
              <div>Email: {avatarStatus.userEmail}</div>
            </div>
          </div>
        </div>

        {/* Avatar Display Tests */}
        <div className="space-y-4">
          <h4 className="font-semibold">Avatar Display Tests</h4>
          
          {/* Test 1: Small Avatar */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="text-sm font-medium w-20">Small:</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xs">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">8x8 pixels</span>
          </div>

          {/* Test 2: Medium Avatar */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="text-sm font-medium w-20">Medium:</span>
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-sm">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">12x12 pixels</span>
          </div>

          {/* Test 3: Large Avatar */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="text-sm font-medium w-20">Large:</span>
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">16x16 pixels</span>
          </div>

          {/* Test 4: Extra Large Avatar */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="text-sm font-medium w-20">X-Large:</span>
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">24x24 pixels</span>
          </div>
        </div>

        {/* Component Integration Tests */}
        <div className="space-y-4">
          <h4 className="font-semibold">Component Integration</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sidebar Style */}
            <div className="p-3 border rounded-lg">
              <div className="text-xs font-medium mb-2">Sidebar Style</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Profile Dropdown Style */}
            <div className="p-3 border rounded-lg">
              <div className="text-xs font-medium mb-2">Dropdown Style</div>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 ring-1 ring-border">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-sm">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Debug Information</h4>
          <div className="text-xs space-y-1">
            <div>User Object: {user ? 'Present' : 'Missing'}</div>
            <div>Avatar Field: {user?.avatar ? 'Set' : 'Not Set'}</div>
            <div>Avatar URL: {user?.avatar || 'None'}</div>
            <div>User Name: {user?.name || 'None'}</div>
            <div>User Email: {user?.email || 'None'}</div>
            <div>User Role: {user?.role || 'None'}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-900 mb-2">Testing Instructions</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p>1. Upload a profile photo using the profile photo upload component</p>
            <p>2. Check if the avatar appears in all the test displays above</p>
            <p>3. Navigate to different pages (dashboard, profile, etc.)</p>
            <p>4. Verify the avatar appears consistently across all pages</p>
            <p>5. Check the sidebar, navigation, and profile dropdown components</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}






