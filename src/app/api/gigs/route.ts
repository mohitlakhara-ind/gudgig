import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Try multiple backend endpoints for gigs/jobs
    const possibleEndpoints = [
      '/jobs',
      '/gigs', 
      '/api/jobs',
      '/api/gigs'
    ];
    
    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        const base = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api');
        const backendUrl = new URL(endpoint, base);
        
        // Forward all query parameters to the backend
        searchParams.forEach((value, key) => {
          backendUrl.searchParams.append(key, value);
        });

        // Set a timeout for the backend request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
            console.log(`✅ Successfully fetched gigs from ${endpoint}`);
            return NextResponse.json(data);
          } else if (response.status === 404) {
            console.warn(`❌ Endpoint ${endpoint} not found (404), trying next...`);
            lastError = new Error(`Endpoint ${endpoint} not found`);
            continue; // Try next endpoint
          } else if (response.status === 429) {
            console.warn('Rate limit exceeded');
            return NextResponse.json(
              { error: 'Rate limit exceeded. Please try again later.' },
              { status: 429 }
            );
          } else if (response.status >= 500) {
            console.warn(`Backend server error: ${response.status}`);
            return NextResponse.json(
              { error: 'Backend server error. Please try again later.' },
              { status: 503 }
            );
          } else {
            console.warn(`Backend responded with status: ${response.status} for ${endpoint}`);
            lastError = new Error(`Backend error: ${response.status}`);
            continue; // Try next endpoint
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
        console.warn(`❌ Failed to fetch from ${endpoint}:`, endpointError);
        lastError = endpointError as Error;
        continue;
      }
    }
    
    // If all endpoints failed, return error
    console.error('All backend endpoints failed:', lastError);
    
    return NextResponse.json(
      { 
        error: 'Unable to connect to server. Please check your connection and try again.',
        details: lastError?.message 
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('Error fetching gigs:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch gigs. Please try again.' },
      { status: 500 }
    );
  }
}