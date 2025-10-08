import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const backendUrl = getBackendUrl(false);
    const notificationUrl = `${backendUrl}/api/notifications/${id}/read`;
    
    const response = await fetch(notificationUrl, {
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
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark notification as read'
      },
      { status: 500 }
    );
  }
}