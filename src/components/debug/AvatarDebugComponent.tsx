'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AvatarDebugComponent() {
  const { user, isAuthenticated } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profilePhotoData, setProfilePhotoData] = useState<any>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // Test 1: Get current user data
      const currentUser = await apiClient.getCurrentUser();
      
      // Test 2: Get profile photo data
      let photoData = null;
      try {
        photoData = await apiClient.getProfilePhoto();
      } catch (error) {
        console.warn('Profile photo API not available:', error);
      }

      setDebugData({
        currentUser,
        profilePhoto: photoData,
        timestamp: new Date().toISOString()
      });

      if (photoData) {
        setProfilePhotoData(photoData);
      }
    } catch (error) {
      console.error('Error fetching debug data:', error);
      setDebugData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDebugData();
    }
  }, [isAuthenticated]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Avatar Debug - Not Authenticated</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to test avatar functionality.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.name || 'U')}
            </AvatarFallback>
          </Avatar>
          Avatar Debug Component
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current User Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current User Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user?.avatar ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">Avatar Field: {user?.avatar ? 'Present' : 'Missing'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Avatar URL: {user?.avatar || 'None'}
              </div>
              <div className="text-xs text-muted-foreground">
                Name: {user?.name || 'None'}
              </div>
              <div className="text-xs text-muted-foreground">
                Email: {user?.email || 'None'}
              </div>
              <div className="text-xs text-muted-foreground">
                Role: {user?.role || 'None'}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Avatar Display Test</h4>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Data */}
        {debugData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Debug Data</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Timestamp:</strong> {debugData.timestamp}</div>
                {debugData.error ? (
                  <div className="text-red-600"><strong>Error:</strong> {debugData.error}</div>
                ) : (
                  <>
                    <div><strong>Current User API:</strong> {debugData.currentUser ? 'Success' : 'Failed'}</div>
                    <div><strong>Profile Photo API:</strong> {debugData.profilePhoto ? 'Success' : 'Failed'}</div>
                    {debugData.currentUser && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          <strong>Current User Avatar:</strong> {debugData.currentUser.avatar || 'None'}
                        </div>
                      </div>
                    )}
                    {debugData.profilePhoto && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground">
                          <strong>Profile Photo Avatar:</strong> {debugData.profilePhoto.data?.avatar || 'None'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <strong>Has Avatar:</strong> {debugData.profilePhoto.data?.hasAvatar ? 'Yes' : 'No'}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Photo Data */}
        {profilePhotoData && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Photo Service Data</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div><strong>Avatar URL:</strong> {profilePhotoData.data?.avatar || 'None'}</div>
                <div><strong>Has Avatar:</strong> {profilePhotoData.data?.hasAvatar ? 'Yes' : 'No'}</div>
                {profilePhotoData.data?.user && (
                  <div>
                    <strong>User Info:</strong>
                    <div className="text-xs text-muted-foreground ml-2">
                      Name: {profilePhotoData.data.user.name}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">
                      Email: {profilePhotoData.data.user.email}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={fetchDebugData} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Debug Steps:</strong></p>
              <ol className="text-sm space-y-1 ml-4">
                <li>1. Check if "Avatar Field" shows "Present" above</li>
                <li>2. If "Missing", the backend is not returning avatar data</li>
                <li>3. If "Present" but still showing default avatar, check the URL validity</li>
                <li>4. Try uploading a new profile photo to test the upload flow</li>
                <li>5. Check browser network tab for API responses</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}







