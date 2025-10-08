import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL as string;
    const base = rawBase.replace(/\/$/, '').replace('/api', '');

    // Preserve query params
    const url = new URL('/app-api/payments', base);
    const incoming = new URL(request.url);
    incoming.searchParams.forEach((value, key) => url.searchParams.set(key, value));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: authHeader,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return NextResponse.json({ success: false, message: `Backend error ${resp.status}` }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying payments:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payments' }, { status: 500 });
  }
}


