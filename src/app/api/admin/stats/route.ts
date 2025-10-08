import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl(false);
    const statsUrl = `${backendUrl}/api/admin/stats`;
    
    const response = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Admin stats endpoint not found on backend',
            error: 'Backend endpoint not available'
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Backend server error',
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch admin stats',
        error: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}


