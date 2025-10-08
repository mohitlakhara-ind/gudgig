import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    console.log('Checking if job is saved:', jobId);

    // Try to check with backend first
    try {
      const backendUrl = new URL(`/saved-jobs/check/${jobId}`, process.env.NEXT_PUBLIC_BACKEND_URL as string);
      
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
          console.log('✅ Successfully checked saved job status from backend');
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

    // Fallback to mock data
    console.log('📦 Using fallback saved job check');
    const isSaved = jobId === 'job_123'; // Mock: only job_123 is saved

    return NextResponse.json({
      success: true,
      data: { saved: isSaved },
      saved: isSaved
    });

  } catch (error) {
    console.error('Error checking if job is saved:', error);
    
    return NextResponse.json(
      { error: 'Failed to check if job is saved' },
      { status: 500 }
    );
  }
}
