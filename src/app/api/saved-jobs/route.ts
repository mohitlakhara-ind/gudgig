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
      const backendUrl = new URL('/saved-jobs', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api');
      
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

    // Fallback to mock data
    console.log('📦 Using fallback saved jobs data');
    const mockSavedJobs = [
      {
        _id: 'saved_job_1',
        jobId: 'job_123',
        userId: 'demo_user',
        title: 'Frontend Developer',
        company: 'Tech Corp',
        location: 'Remote',
        type: 'Full-time',
        salary: '$80,000 - $120,000',
        description: 'Looking for an experienced frontend developer...',
        savedAt: new Date().toISOString(),
        job: {
          _id: 'job_123',
          title: 'Frontend Developer',
          company: 'Tech Corp',
          location: 'Remote',
          type: 'Full-time',
          salary: '$80,000 - $120,000',
          description: 'Looking for an experienced frontend developer...',
          createdAt: new Date().toISOString()
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockSavedJobs,
      count: mockSavedJobs.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockSavedJobs.length,
        pages: Math.ceil(mockSavedJobs.length / parseInt(limit))
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
    const { jobId } = body;

    console.log('Saving job:', jobId);

    // Try to save to backend first
    try {
      const backendUrl = new URL('/saved-jobs', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api');
      
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
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Successfully saved job to backend');
          return NextResponse.json(data);
        } else {
          console.warn(`❌ Backend returned ${response.status}, using fallback`);
        }
      } catch (fetchError) {
        console.warn('❌ Backend save failed, using fallback:', fetchError);
      }
    } catch (backendError) {
      console.warn('❌ Backend connection failed, using fallback:', backendError);
    }

    // Fallback to mock response
    console.log('📦 Using fallback save response');
    return NextResponse.json({
      success: true,
      message: 'Job saved successfully (demo mode)',
      data: {
        _id: `saved_${Date.now()}`,
        jobId,
        userId: 'demo_user',
        savedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error saving job:', error);
    
    return NextResponse.json(
      { error: 'Failed to save job' },
      { status: 500 }
    );
  }
}