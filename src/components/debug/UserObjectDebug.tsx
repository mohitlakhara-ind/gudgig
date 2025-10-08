'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UserObjectDebug() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Object Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not authenticated</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Object Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading user data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Object Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">User object is null/undefined</p>
        </CardContent>
      </Card>
    );
  }

  // Handle nested user structure
  const actualUser = (user as any)?.data || user;
  const isNested = (user as any)?.data !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Object Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Raw User Object:</h4>
          <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {isNested && (
          <div>
            <h4 className="font-medium mb-2">Nested User Data (user.data):</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(actualUser, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Extracted Values (from {isNested ? 'user.data' : 'user'}):</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Name:</span>
              <Badge variant={actualUser.name ? 'default' : 'secondary'}>
                {actualUser.name || 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Email:</span>
              <Badge variant={actualUser.email ? 'default' : 'secondary'}>
                {actualUser.email || 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant={actualUser.role ? 'default' : 'secondary'}>
                {actualUser.role || 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Avatar:</span>
              <Badge variant={actualUser.avatar ? 'default' : 'secondary'}>
                {actualUser.avatar ? 'Present' : 'Missing'}
              </Badge>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Structure Info:</h4>
          <div className="space-y-1 text-sm">
            <div>Is Nested: {isNested ? 'Yes (user.data)' : 'No (direct user)'}</div>
            <div>User ID: {actualUser._id || 'Not found'}</div>
            <div>Email Verified: {actualUser.isEmailVerified ? 'Yes' : 'No'}</div>
            <div>Is Active: {actualUser.isActive ? 'Yes' : 'No'}</div>
            <div>Created: {actualUser.createdAt ? new Date(actualUser.createdAt).toLocaleString() : 'Not found'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
