'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { log } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, LoadingButton } from '@/components/ui/loading-states';

export default function UserDataDebug() {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      log.debug('health_check_client', { success: data?.success });
    } catch (error: any) {
      log.error('health_check_client_error', { error: error?.message || String(error) });
      setHealthStatus({ error: error?.message });
    }
  };

  const testUserData = async () => {
    setLoading(true);
    try {
      log.debug('debug_user_data_fetch_start');
      
      // Test 1: Check localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      
      log.debug('debug_local_storage_state', { hasToken: !!storedToken, hasUser: !!storedUser, hasRole: !!storedRole });
      
      // Test 2: Try direct API call
      if (storedToken) {
        try {
          const response = await fetch('/api/debug/user', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          log.debug('debug_api_response_received', { status: response.status });
          setDebugInfo(data);
        } catch (error: any) {
          log.error('debug_api_error', { error: error?.message || String(error) });
          setDebugInfo({ error: error?.message });
        }
      }
      
      // Test 3: Try API client
      try {
        const userData = await apiClient.getCurrentUser();
        log.debug('api_client_user_data_received', { hasUser: !!userData });
      } catch (error: any) {
        log.error('api_client_error', { error: error?.message || String(error) });
      }
      
    } catch (error: any) {
      log.error('debug_test_error', { error: error?.message || String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Data Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Auth State:</strong>
            <div className="space-y-1 mt-2">
              <div>Loading: <Badge variant={isLoading ? 'destructive' : 'secondary'}>{isLoading ? 'Yes' : 'No'}</Badge></div>
              <div>Authenticated: <Badge variant={isAuthenticated ? 'default' : 'secondary'}>{isAuthenticated ? 'Yes' : 'No'}</Badge></div>
              <div>User: <Badge variant={user ? 'default' : 'secondary'}>{user ? 'Present' : 'Missing'}</Badge></div>
              <div>Token: <Badge variant={token ? 'default' : 'secondary'}>{token ? 'Present' : 'Missing'}</Badge></div>
            </div>
          </div>
          
          <div>
            <strong>Local Storage:</strong>
            <div className="space-y-1 mt-2">
              <div>Token: <Badge variant={localStorage.getItem('token') ? 'default' : 'secondary'}>{localStorage.getItem('token') ? 'Present' : 'Missing'}</Badge></div>
              <div>User: <Badge variant={localStorage.getItem('user') ? 'default' : 'secondary'}>{localStorage.getItem('user') ? 'Present' : 'Missing'}</Badge></div>
              <div>Role: <Badge variant={localStorage.getItem('role') ? 'default' : 'secondary'}>{localStorage.getItem('role') ? 'Present' : 'Missing'}</Badge></div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={checkHealth} className="flex-1">
            Check Backend Health
          </Button>
          <LoadingButton 
            onClick={testUserData} 
            loading={loading}
            loadingText="Testing..."
            className="flex-1"
          >
            Test User Data Fetch
          </LoadingButton>
        </div>
        
        {healthStatus && (
          <div className="mt-4">
            <strong>Backend Health:</strong>
            <div className="bg-muted p-3 rounded text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${healthStatus.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{healthStatus.success ? 'Connected' : 'Disconnected'}</span>
              </div>
              {healthStatus.backend && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Status: {healthStatus.backend.status}</div>
                  <div>Environment: {healthStatus.backend.environment}</div>
                  <div>Backend URL: {healthStatus.backendUrl}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-4">
            <strong>Debug Info:</strong>
            <div className="bg-muted p-3 rounded text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${debugInfo.hasAuthHeader ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Auth Header: {debugInfo.hasAuthHeader ? 'Present' : 'Missing'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Backend URL: {debugInfo.backendUrl}
                </div>
                {debugInfo.responseStatus && (
                  <div className="text-xs text-muted-foreground">
                    Response Status: {debugInfo.responseStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {user && (
          <div className="mt-4">
            <strong>Current User Data:</strong>
            <div className="bg-muted p-3 rounded text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium">{user.name || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Role: <span className="font-medium">{user.role || 'N/A'}</span></div>
                  <div>ID: <span className="font-medium">{user._id?.substring(0, 8) || 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
