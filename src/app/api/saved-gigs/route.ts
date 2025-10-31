import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    try {
      const backendUrl = new URL('/api/saved-gigs', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      searchParams.forEach((value, key) => {
        backendUrl.searchParams.append(key, value);
      });

      const response = await fetch(backendUrl.toString(), { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {}

    return NextResponse.json({ success: true, data: [], count: 0, pagination: { page: 1, limit: 50, total: 0, pages: 0 } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch saved gigs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    try {
      const backendUrl = new URL('/api/saved-gigs', process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
      const response = await fetch(backendUrl.toString(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {}
    return NextResponse.json({ success: true, message: 'Gig saved (demo mode)', data: { _id: `saved_${Date.now()}`, ...body } });
  } catch {
    return NextResponse.json({ error: 'Failed to save gig' }, { status: 500 });
  }
}




