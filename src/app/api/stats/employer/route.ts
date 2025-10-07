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

    // Proxy to the backend /app-api/stats/employer endpoint
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/stats/employer`;
    
    const response = await fetch(backendUrl.replace('/api/', '/app-api/'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching employer stats from backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employer stats' },
      { status: 500 }
    );
  }
}


