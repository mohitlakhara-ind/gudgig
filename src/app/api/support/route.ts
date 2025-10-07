import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, message, priority } = body || {};
    if (!subject || !message) {
      return NextResponse.json({ success: false, message: 'subject and message are required' }, { status: 400 });
    }

    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';
    const backendUrl = `${rawBase.replace(/\/$/, '')}/support`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: authHeader,
      },
      body: JSON.stringify({ subject, message, priority }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      return NextResponse.json({ success: false, message: `Backend error ${resp.status}` }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit support ticket' }, { status: 500 });
  }
}



