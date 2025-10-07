import { NextRequest, NextResponse } from 'next/server';

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

    // Proxy to the backend /api/notifications/unread-count endpoint
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/notifications/unread-count`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader,
      },
    });

    if (!response.ok) {
      // Gracefully degrade for 404/429 or any backend failure
      if (response.status === 404 || response.status === 429) {
        return NextResponse.json({ success: true, data: { count: 0 } }, { status: 200 });
      }
      return NextResponse.json({ success: true, data: { count: 0 } }, { status: 200 });
    }

    const backendJson = await response.json();
    // Normalize to { success, data: { count } } shape
    const count =
      (typeof backendJson?.count === 'number' && backendJson.count) ??
      (typeof backendJson?.data?.count === 'number' && backendJson.data.count) ??
      (typeof backendJson?.data === 'number' && backendJson.data) ??
      0;

    return NextResponse.json({ success: true, data: { count } });

  } catch (error) {
    // On network or parsing errors, return zero without raising server error
    return NextResponse.json({ success: true, data: { count: 0 } }, { status: 200 });
  }
}


