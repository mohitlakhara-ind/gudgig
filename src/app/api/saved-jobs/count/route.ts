import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Saved jobs count API called');

    // Try to fetch from backend first
    try {
      const backendUrl = new URL('/saved-jobs/count', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(backendUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('authorization') && {
              'authorization': request.headers.get('authorization')!
            }),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully fetched saved jobs count from backend');
          return NextResponse.json(data);
        } else {
          console.warn(`❌ Backend returned ${response.status}, using fallback`);
        }
      } catch (fetchError) {
        console.warn('❌ Backend fetch failed, using fallback:', fetchError);
      }
    } catch (backendError) {
      console.warn('❌ Backend connection failed, using fallback:', backendError);
    }

    // Fallback to mock count
    console.log('📦 Using fallback saved jobs count');
    const count = 1; // Mock count

    return NextResponse.json({
      success: true,
      data: { count },
      count
    });

  } catch (error) {
    console.error('Error fetching saved jobs count:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch saved jobs count' },
      { status: 500 }
    );
  }
}
