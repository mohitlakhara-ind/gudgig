import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
    const body = await request.text();

    let authHeader = request.headers.get('authorization');
    if (!authHeader) {
      const tokenCookie = request.cookies.get('token')?.value;
      if (tokenCookie) authHeader = `Bearer ${tokenCookie}`;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['authorization'] = authHeader;

    const endpoints = [
      `/api/gigs/${id}/visibility`,
      `/gigs/${id}/visibility`
    ];

    for (const ep of endpoints) {
      const url = new URL(ep, base).toString();
      const res = await fetch(url, { method: 'PATCH', headers, body });
      if (res.ok) {
        const data = await res.json().catch(() => ({ success: true }));
        return NextResponse.json(data);
      }
      if (res.status === 401) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      if (res.status >= 500) continue;
      const err = await res.json().catch(() => ({ success: false, message: res.statusText }));
      return NextResponse.json(err, { status: res.status });
    }

    return NextResponse.json({ success: false, message: 'Failed to update visibility' }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating visibility' }, { status: 500 });
  }
}


























