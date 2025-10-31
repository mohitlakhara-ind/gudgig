import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const urgent = searchParams.get('urgent');
    const remote = searchParams.get('remote');
    const page = searchParams.get('page') || '1';

    console.log('Saved jobs API called with params:', {
      limit, search, type, location, urgent, remote, page
    });

    // Try to fetch from backend first
    try {
      const rawBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const origin = rawBase.endsWith('/api') ? rawBase.replace(/\/api$/, '') : rawBase;
      // Use real backend endpoint for saved gigs
      const backendUrl = new URL('/api/saved-gigs', origin);
      
      // Forward all query parameters to the backend
      searchParams.forEach((value, key) => {
        backendUrl.searchParams.append(key, value);
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(backendUrl.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('authorization') && {
              'authorization': request.headers.get('authorization')!
            }),
            ...(request.headers.get('cookie') && {
              'cookie': request.headers.get('cookie')!
            }),
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully fetched saved jobs from backend');
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

    // Fallback to empty result to avoid showing fake demo data
    console.log('📦 Backend unavailable, returning empty saved gigs');
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });

  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch saved jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Normalize payload to backend shape: expects { gigId }
    const jobId = body?.jobId || body?.gigId;

    console.log('Saving job:', jobId);

    // Try to save to backend first
    try {
      const rawBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const origin = rawBase.endsWith('/api') ? rawBase.replace(/\/api$/, '') : rawBase;
      // Use real backend endpoint for saved gigs
      const backendUrl = new URL('/api/saved-gigs', origin);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(backendUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('authorization') && {
              'authorization': request.headers.get('authorization')!
            }),
            ...(request.headers.get('cookie') && {
              'cookie': request.headers.get('cookie')!
            }),
          },
          body: JSON.stringify({ gigId: jobId }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully saved job to backend');
          return NextResponse.json(data);
        } else {
          const err = await response.json().catch(() => ({ message: 'Failed to save gig' }));
          console.warn(`❌ Backend returned ${response.status}: ${err?.message || 'error'}`);
          return NextResponse.json({ success: false, message: err?.message || 'Failed to save gig' }, { status: response.status });
        }
      } catch (fetchError) {
        console.warn('❌ Backend save failed, using fallback:', fetchError);
      }
    } catch (backendError) {
      console.warn('❌ Backend connection failed, using fallback:', backendError);
    }

    // Fallback to error to avoid implying save succeeded without backend
    console.log('📦 Backend unavailable for save, returning error');
    return NextResponse.json(
      { success: false, message: 'Backend unavailable. Could not save job.' },
      { status: 503 }
    );

  } catch (error) {
    console.error('Error saving job:', error);
    
    return NextResponse.json(
      { error: 'Failed to save job' },
      { status: 500 }
    );
  }
}