import { NextRequest, NextResponse } from 'next/server';

const resolveBackendStatsUrl = () => {
  const rawBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').trim();
  const base = rawBase.replace(/\/$/, '');
  const apiBase = base.endsWith('/api') ? base : `${base}/api`;
  return `${apiBase}/payments/stats`;
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = resolveBackendStatsUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: authHeader,
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {})
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorBody?.message || 'Failed to fetch payment stats'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('app-api/payments/stats proxy error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch payment stats' }, { status: 500 });
  }
}




