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

    // Proxy to the backend /app-api/stats/freelancer endpoint
    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
    const statsUrl = rawBase.replace(/\/$/, '').replace('/api', '/app-api') + '/stats/freelancer';

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
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching freelancer stats from backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch freelancer stats' },
      { status: 500 }
    );
  }
}
