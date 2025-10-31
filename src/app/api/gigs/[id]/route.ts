import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';

    // Forward auth header (optional) for hidden/admin visibility if available
    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const tokenCookie = request.cookies.get('token')?.value;
      if (tokenCookie) authHeader = `Bearer ${tokenCookie}`;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['authorization'] = authHeader;

    // Try common backend paths
    const endpoints = [
      `/api/gigs/${id}`,
      `/gigs/${id}`,
      `/api/jobs/${id}`,
      `/jobs/${id}`
    ];

    for (const ep of endpoints) {
      const url = new URL(ep, base).toString();
      const res = await fetch(url, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        return NextResponse.json(data ?? { success: true });
      }
      if (res.status === 404) continue; // try next endpoint
      if (res.status === 401) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: false, message: 'Gig not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch gig' }, { status: 500 });
  }
}

// Duplicate handler removed; consolidated above
