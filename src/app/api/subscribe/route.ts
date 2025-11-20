import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const SUBSCRIPTIONS_DIR = path.join(process.cwd(), 'data');
const SUBSCRIPTIONS_FILE = path.join(SUBSCRIPTIONS_DIR, 'subscriptions.json');

function validateEmail(email: unknown) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body?.email;

    if (!validateEmail(email)) {
      return NextResponse.json({ success: false, message: 'Invalid email' }, { status: 400 });
    }

    // Ensure data directory exists
    await fs.mkdir(SUBSCRIPTIONS_DIR, { recursive: true });

    // Read existing subscriptions
    let list: Array<{ email: string; createdAt: string }> = [];
    try {
      const raw = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8');
      list = JSON.parse(raw) as any[];
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      // File may not exist yet; that's fine
      list = [];
    }

    // Avoid duplicate subscriptions
    const exists = list.find((s) => s.email.toLowerCase() === (email as string).toLowerCase());
    if (exists) {
      return NextResponse.json({ success: true, message: 'Already subscribed' }, { status: 200 });
    }

    const entry = { email: (email as string).toLowerCase(), createdAt: new Date().toISOString() };
    list.push(entry);

    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Subscribed' }, { status: 201 });
  } catch (error) {
    console.error('Subscribe API error', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return a safe list (no PII filtering done here) — only for internal use
    const raw = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf-8');
    const list = JSON.parse(raw);
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    return NextResponse.json({ success: true, data: [] });
  }
}
