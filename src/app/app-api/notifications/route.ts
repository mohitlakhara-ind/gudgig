import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backendUrl = getBackendUrl(false);
    const notificationsUrl = `${backendUrl}/api/notifications`;
    
    // Forward all query parameters to the backend
    const queryString = searchParams.toString();
    const fullUrl = queryString ? `${notificationsUrl}?${queryString}` : notificationsUrl;
    
    const response = await fetch(fullUrl, {
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
            message: 'Notifications endpoint not found on backend',
            data: []
          },
          { status: 200 } // Return 200 with empty data instead of 404
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
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch notifications',
        data: []
      },
      { status: 200 } // Return 200 with empty data instead of 500
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl(false);
    const notificationsUrl = `${backendUrl}/api/notifications/read-all`;
    
    const response = await fetch(notificationsUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
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
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark notifications as read'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const backendUrl = getBackendUrl(false);
    const notificationsUrl = `${backendUrl}/api/notifications`;

    const response = await fetch(notificationsUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!
        }),
      },
    });

    if (!response.ok) {
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
    console.error('Error clearing notifications:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to clear notifications'
      },
      { status: 500 }
    );
  }
}