import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend-url';

const BACKEND = getBackendUrl(false);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = `${BACKEND}/api/auth/login`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    // Try to parse JSON, fallback to text
    try {
      const json = JSON.parse(data);
      return NextResponse.json(json, { status: response.status });
    } catch {
      return new NextResponse(data, { status: response.status });
    }
  } catch (error) {
    console.error('Error proxying auth/login:', error);
    return NextResponse.json({ success: false, message: 'Failed to proxy login' }, { status: 500 });
  }
}
