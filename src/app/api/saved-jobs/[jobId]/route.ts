import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    console.log('Getting saved job by ID:', jobId);

    // Try to fetch from backend first
    try {
      // Align with real backend saved gigs endpoint
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const origin = base.endsWith('/api') ? base : `${base}/api`;
      const backendUrl = new URL(`/saved-gigs/${jobId}`, origin);
      
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
          console.log('✅ Successfully fetched saved job from backend');
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

    // Fallback to not found to avoid fake demo data
    console.log('📦 Backend unavailable for saved job detail');
    return NextResponse.json({ success: false, message: 'Saved job not found' }, { status: 404 });

  } catch (error) {
    console.error('Error fetching saved job:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch saved job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    console.log('Removing saved job:', jobId);

    // Try to delete from backend first
    try {
      // Align with real backend saved gigs endpoint
      const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
      const origin = base.endsWith('/api') ? base : `${base}/api`;
      const backendUrl = new URL(`/saved-gigs/${jobId}`, origin);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(backendUrl.toString(), {
          method: 'DELETE',
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
          console.log('✅ Successfully removed saved job from backend');
          return NextResponse.json(data);
        } else {
          console.warn(`❌ Backend returned ${response.status}, using fallback`);
        }
      } catch (fetchError) {
        console.warn('❌ Backend delete failed, using fallback:', fetchError);
      }
    } catch (backendError) {
      console.warn('❌ Backend connection failed, using fallback:', backendError);
    }

    // Fallback to error to avoid misreporting success
    console.log('📦 Backend unavailable for delete');
    return NextResponse.json({ success: false, message: 'Backend unavailable. Could not remove saved job.' }, { status: 503 });

  } catch (error) {
    console.error('Error removing saved job:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove saved job' },
      { status: 500 }
    );
  }
}
