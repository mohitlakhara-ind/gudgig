import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gigId } = await params;
    
    // Try multiple backend endpoints for individual gig
    const possibleEndpoints = [
      `/jobs/${gigId}`,
      `/gigs/${gigId}`,
      `/api/jobs/${gigId}`,
      `/api/gigs/${gigId}`
    ];
    
    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        const backendUrl = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api');
        
        // Set a timeout for the backend request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Don't require authentication for viewing gigs
              ...(request.headers.get('authorization') && {
                'authorization': request.headers.get('authorization')!
              }),
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully fetched gig ${gigId} from ${endpoint}`);
            return NextResponse.json(data);
          } else if (response.status === 404) {
            console.warn(`❌ Gig ${gigId} not found at ${endpoint}, trying next...`);
            lastError = new Error(`Gig ${gigId} not found`);
            continue;
          } else if (response.status === 429) {
            console.warn('Rate limit exceeded, using fallback data');
            throw new Error('RATE_LIMIT_EXCEEDED');
          } else if (response.status >= 500) {
            console.warn(`Backend server error: ${response.status}`);
            throw new Error('SERVER_ERROR');
          } else {
            console.warn(`Backend responded with status: ${response.status} for ${endpoint}`);
            lastError = new Error(`Backend error: ${response.status}`);
            continue;
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.warn(`⏰ Timeout for ${endpoint}, trying next...`);
            lastError = new Error(`Timeout for ${endpoint}`);
            continue;
          }
          throw fetchError;
        }
      } catch (endpointError) {
        console.warn(`❌ Failed to fetch gig ${gigId} from ${endpoint}:`, endpointError);
        lastError = endpointError as Error;
        continue;
      }
    }
    
    // If all endpoints failed, return error
    console.error(`All backend endpoints failed for gig ${gigId}:`, lastError);
    
    return NextResponse.json(
      { 
        error: 'Unable to connect to server. Please check your connection and try again.',
        details: lastError?.message 
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('Error fetching gig:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch gig. Please try again.' },
      { status: 500 }
    );
  }
}
