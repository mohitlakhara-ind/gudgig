import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(request: NextRequest) {
  try {
    // Extract the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Proxy to the backend /app-api/stats/employer endpoint
    const backendUrl = getBackendUrl(false);
    const statsUrl = `${backendUrl}/app-api/stats/employer`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If backend returns 404, return mock data for development
      if (response.status === 404) {
        console.warn('Backend employer stats endpoint not found, returning mock data');
        return NextResponse.json({
          success: true,
          data: {
            activeJobs: 0,
            totalApplications: 0,
            interviewsScheduled: 0,
            hiresThisMonth: 0,
            viewsThisMonth: 0,
            responseRate: 0,
            recentJobs: [],
            recentApplications: [],
            recentActivity: []
          }
        });
      }
      
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching employer stats from backend:', error);
    
    // Return mock data for development when backend is not available
    return NextResponse.json({
      success: true,
      data: {
        activeJobs: 0,
        totalApplications: 0,
        interviewsScheduled: 0,
        hiresThisMonth: 0,
        viewsThisMonth: 0,
        responseRate: 0,
        recentJobs: [],
        recentApplications: [],
        recentActivity: []
      }
    });
  }
}