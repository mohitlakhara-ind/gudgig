import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

const BACKEND = getBackendUrl(false);

export async function GET(request: NextRequest) {
  try {
    const url = `${BACKEND}/api/auth/csrf-token`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') ? { authorization: request.headers.get('authorization')! } : {}),
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying csrf-token:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch csrf token' }, { status: 500 });
  }
}
