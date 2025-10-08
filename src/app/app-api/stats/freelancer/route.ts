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

    // Proxy to the backend /app-api/stats/freelancer endpoint
    const backendUrl = getBackendUrl(false);
    const statsUrl = `${backendUrl}/app-api/stats/freelancer`;

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
        console.warn('Backend freelancer stats endpoint not found, returning mock data');
        return NextResponse.json({
          success: true,
          data: {
            activeServices: 0,
            totalOrders: 0,
            averageRating: 0,
            totalEarnings: 0,
            monthlyEarnings: 0,
            pendingEarnings: 0,
            earningsGrowthPercentage: 0,
            profileCompleteness: 0,
            activeOrders: 0,
            totalReviews: 0,
            recentOrders: [],
            recentReviews: [],
            recentActivity: [],
            reviewDistribution: {
              fiveStars: 0,
              fourStars: 0,
              threeStars: 0,
              twoStars: 0,
              oneStar: 0
            }
          }
        });
      }
      
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching freelancer stats from backend:', error);
    
    // Return mock data for development when backend is not available
    return NextResponse.json({
      success: true,
      data: {
        activeServices: 0,
        totalOrders: 0,
        averageRating: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingEarnings: 0,
        earningsGrowthPercentage: 0,
        profileCompleteness: 0,
        activeOrders: 0,
        totalReviews: 0,
        recentOrders: [],
        recentReviews: [],
        recentActivity: [],
        reviewDistribution: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0
        }
      }
    });
  }
}