import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

const BACKEND = getBackendUrl(false);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = new URL(`${BACKEND}/api/analytics/earnings`);
    searchParams.forEach((v, k) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {})
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying analytics/earnings:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch earnings analytics' }, { status: 500 });
  }
}
