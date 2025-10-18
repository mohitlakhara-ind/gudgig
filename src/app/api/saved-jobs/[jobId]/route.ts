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
      const backendUrl = new URL(`/api/saved-jobs/${jobId}`, process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      
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

    // Fallback to mock data
    console.log('📦 Using fallback saved job data');
    const mockSavedJob = {
      _id: `saved_${jobId}`,
      jobId,
      userId: 'demo_user',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      salary: '$80,000 - $120,000',
      description: 'Looking for an experienced frontend developer...',
      savedAt: new Date().toISOString(),
      job: {
        _id: jobId,
        title: 'Frontend Developer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$80,000 - $120,000',
        description: 'Looking for an experienced frontend developer...',
        createdAt: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: mockSavedJob
    });

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
      const backendUrl = new URL(`/api/saved-jobs/${jobId}`, process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      
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

    // Fallback to mock response
    console.log('📦 Using fallback delete response');
    return NextResponse.json({
      success: true,
      message: 'Job removed from saved jobs (demo mode)',
      data: { jobId }
    });

  } catch (error) {
    console.error('Error removing saved job:', error);
    
    return NextResponse.json(
      { error: 'Failed to remove saved job' },
      { status: 500 }
    );
  }
}
