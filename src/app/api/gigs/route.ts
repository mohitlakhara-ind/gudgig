import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Prefer canonical backend API endpoints first (backend may expose /api/*)
    const possibleEndpoints = [
      '/api/jobs',
      '/api/gigs',
      '/jobs',
      '/gigs'
    ];
    
    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
  const base = getBackendUrl(false);
  const backendUrl = new URL(endpoint, base);
        
        // Forward all query parameters to the backend
        searchParams.forEach((value, key) => {
          backendUrl.searchParams.append(key, value);
        });

        // Set a timeout for the backend request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          try {
          console.debug(`Attempting backend fetch: ${backendUrl.toString()}`);
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
          console.warn(`❌ Fetch failed for ${backendUrl.toString()}:`, fetchError);
          lastError = fetchError as Error;
          continue;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const base = getBackendUrl(false);

    const endpoints = [
      '/api/gigs',
      '/gigs',
      '/api/jobs',
      '/jobs'
    ];

    // Forward auth header if present (required for admin)
    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const tokenCookie = request.cookies.get('token')?.value;
      if (tokenCookie) authHeader = `Bearer ${tokenCookie}`;
    }

    for (const ep of endpoints) {
      const url = new URL(ep, base).toString();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { authorization: authHeader } : {}),
          },
          body,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return NextResponse.json(data);
        }
        if (res.status === 401) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (res.status >= 500) continue; // try next
        // For 4xx (other than 401), return response content
        const err = await res.json().catch(() => ({ success: false, message: res.statusText }));
        return NextResponse.json(err, { status: res.status });
      } catch (e: any) {
        clearTimeout(timeoutId);
        if (e?.name === 'AbortError') {
          continue;
        }
        // try next endpoint
        continue;
      }
    }

    return NextResponse.json({ success: false, message: 'Failed to create gig' }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error creating gig' }, { status: 500 });
  }
}