import { NextRequest, NextResponse } from 'next/server';
import { bidService } from '@/services/bidService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gigId } = await params;
    const body = await request.json();

    // Require auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Basic validation
    if (!body?.quotation || !body?.proposal) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Forward to backend /api/bids
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    const backendUrl = new URL('/bids', base);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': authHeader,
      },
      body: JSON.stringify({ jobId: gigId, quotation: String(body.quotation), proposal: body.proposal, bidFeePaid: body.bidFeePaid }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(data || { success: false, message: 'Failed to submit bid' }, { status: response.status });
    }

    return NextResponse.json(data || { success: true, message: 'Bid submitted' });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { success: false, message: isAbort ? 'Request timeout' : 'Failed to submit bid' },
      { status: isAbort ? 504 : 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gigId } = await params;
    
    // Check for authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required to view bids' },
        { status: 401 }
      );
    }

    // Try to fetch bids from backend
    const possibleEndpoints = [
      `/jobs/${gigId}/bids`,
      `/gigs/${gigId}/bids`,
      `/api/jobs/${gigId}/bids`,
      `/api/gigs/${gigId}/bids`
    ];
    
    let lastError: Error | null = null;
    
    for (const endpoint of possibleEndpoints) {
      try {
        const backendUrl = new URL(endpoint, process.env.NEXT_PUBLIC_BACKEND_URL);
        
        // Set a timeout for the backend request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
          const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'authorization': authHeader,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully fetched bids for gig ${gigId} via ${endpoint}`);
            return NextResponse.json(data);
          } else if (response.status === 401) {
            return NextResponse.json(
              { error: 'Authentication failed' },
              { status: 401 }
            );
          } else if (response.status === 404) {
            console.warn(`❌ Gig ${gigId} not found at ${endpoint}, trying next...`);
            lastError = new Error(`Gig ${gigId} not found`);
            continue;
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
        console.warn(`❌ Failed to fetch bids for gig ${gigId} via ${endpoint}:`, endpointError);
        lastError = endpointError as Error;
        continue;
      }
    }
    
    // If all endpoints failed, return bids from local storage
    console.warn(`Backend unavailable for fetching bids on gig ${gigId}, using local storage:`, lastError);
    
    const localBids = bidService.getBidsForGig(gigId);
    
    return NextResponse.json({
      success: true,
      data: localBids,
      count: localBids.length,
      message: 'Bids fetched successfully (demo mode)',
      warning: 'Backend service unavailable - showing locally stored bids'
    });

  } catch (error) {
    console.error('Error fetching bids:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch bids. Please try again.' },
      { status: 500 }
    );
  }
}



