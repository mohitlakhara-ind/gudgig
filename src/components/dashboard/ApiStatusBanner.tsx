'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ApiStatus {
  status: 'checking' | 'online' | 'offline';
  message: string;
  lastChecked: Date | null;
}

export default function ApiStatusBanner() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'checking',
    message: 'Checking API status...',
    lastChecked: null
  });
  const [isVisible, setIsVisible] = useState(false);

  const checkApiStatus = async () => {
    try {
      setApiStatus(prev => ({ ...prev, status: 'checking', message: 'Checking API status...' }));
      
      // Try a simple API call to check if backend is available
      await apiClient.getFreelancerStats();
      
      setApiStatus({
        status: 'online',
        message: 'Backend API is online',
        lastChecked: new Date()
      });
      setIsVisible(false);
    } catch (error) {
      setApiStatus({
        status: 'offline',
        message: 'Backend API is offline - using demo data',
        lastChecked: new Date()
      });
      setIsVisible(true);
    }
  };

  useEffect(() => {
    checkApiStatus();
    
    // Check API status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible && apiStatus.status === 'online') {
    return null;
  }

  return (
    <Card className={`mb-4 transition-all duration-300 ${
      apiStatus.status === 'offline' 
        ? 'border-yellow-200 bg-yellow-50' 
        : apiStatus.status === 'online'
        ? 'border-green-200 bg-green-50'
        : 'border-blue-200 bg-blue-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {apiStatus.status === 'offline' && (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            {apiStatus.status === 'online' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {apiStatus.status === 'checking' && (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            
            <div>
              <p className="font-medium text-sm">
                {apiStatus.message}
              </p>
              {apiStatus.lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {apiStatus.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
            
            <Badge variant={apiStatus.status === 'offline' ? 'secondary' : 'default'}>
              {apiStatus.status === 'offline' ? 'Demo Mode' : 'Live Data'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkApiStatus}
              disabled={apiStatus.status === 'checking'}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${apiStatus.status === 'checking' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {apiStatus.status === 'offline' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {apiStatus.status === 'offline' && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The backend server is not running. You're seeing demo data. 
              To see real data, start the backend server with: <code className="bg-yellow-200 px-1 rounded">cd backend && npm run dev</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}






