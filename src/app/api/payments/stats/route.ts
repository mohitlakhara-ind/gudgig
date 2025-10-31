import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const rawBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const origin = rawBase.endsWith('/api') ? rawBase.replace(/\/api$/, '') : rawBase;
    const backendUrl = new URL('/api/payments/stats', origin);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('authorization') && { 'authorization': request.headers.get('authorization')! }),
          ...(request.headers.get('cookie') && { 'cookie': request.headers.get('cookie')! }),
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }

      const err = await response.json().catch(() => ({ message: 'Failed to fetch payment stats' }));
      // Always return 200 to avoid client throw; include safe defaults
      return NextResponse.json({ success: false, message: err?.message || 'Failed to fetch payment stats', data: { total: 0, count: 0 } }, { status: 200 });
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('payments_stats_proxy_error', e);
    }

    return NextResponse.json({ success: true, data: { total: 0, count: 0 } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch payment stats' }, { status: 500 });
  }
}


