import { NextRequest, NextResponse } from 'next/server';

// Public contact form endpoint (no authentication required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body || {};
    
    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, email, subject, and message are required' 
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email address' 
      }, { status: 400 });
    }

    const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL as string;
    const backendUrl = `${rawBase.replace(/\/$/, '')}/api/support/contact`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, subject, message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      return NextResponse.json({ 
        success: false, 
        message: errorData.message || `Backend error ${resp.status}` 
      }, { status: resp.status });
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit contact form. Please try again later.' 
    }, { status: 500 });
  }
}



