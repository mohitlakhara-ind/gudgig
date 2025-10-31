import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header or cookie token
    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const tokenCookie = request.cookies.get('token')?.value;
      if (tokenCookie) authHeader = `Bearer ${tokenCookie}`;
    }
    if (!authHeader) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
    const ordersUrl = new URL('/api/orders/my', base);
    const bidsUrl = new URL('/api/bids/my', base);

    const doFetch = (url: URL, signal: AbortSignal) => fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': authHeader!,
        'Content-Type': 'application/json',
      },
      signal,
      cache: 'no-store'
    });

    // Try orders first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let response = await doFetch(ordersUrl, controller.signal).catch(() => null as any);
    clearTimeout(timeoutId);

    // Fallback to legacy bids if orders failed (except 401 which we'll pass through)
    if (!response || (!response.ok && response.status !== 401)) {
      const altController = new AbortController();
      const altTimeoutId = setTimeout(() => altController.abort(), 10000);
      response = await doFetch(bidsUrl, altController.signal).catch(() => null as any);
      clearTimeout(altTimeoutId);
    }

    if (!response) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    if (!response.ok) {
      // Graceful empty on authorization issues or backend errors
      if (response.status === 401) {
        return NextResponse.json({ success: true, data: [], count: 0 });
      }
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const raw = await response.json().catch(() => ({ data: [] }));
    const list = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
    return NextResponse.json({ success: true, data: list, count: list.length });
  } catch (error) {
    return NextResponse.json({ success: true, data: [], count: 0 });
  }
}



