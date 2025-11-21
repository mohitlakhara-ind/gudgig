import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'testimonials.json');

const getBackendUrl = () =>
  (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

function validatePayload(body: any) {
  if (!body) return false;
  const name = typeof body.name === 'string' && body.name.trim().length > 0;
  const content = typeof body.content === 'string' && body.content.trim().length > 10;
  const rating = body.rating === undefined || (typeof body.rating === 'number' && body.rating >= 1 && body.rating <= 5);
  return name && content && rating;
}

async function readFileList() {
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (e) {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(100, limitParam)) : undefined;

  // If BACKEND_URL is set, proxy to backend public endpoint
  const backendUrl = getBackendUrl();
  if (backendUrl) {
    try {
      const resp = await fetch(`${backendUrl}/api/testimonials/public${limit ? `?limit=${limit}` : ''}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 }
      });
      if (resp.ok) {
        const data = await resp.json();
        return NextResponse.json(data, { status: resp.status });
      }
      console.warn('Testimonials proxy GET received non-ok status', resp.status);
    } catch (e) {
      console.error('Testimonials proxy GET failed', e);
      // fallback to file
    }
  }

  const list = await readFileList();
  // Return only approved testimonials for public consumption
  const approved = list
    .filter((t: any) => t.approved === true)
    .sort((a: any, b: any) => (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime());

  const limited = typeof limit === 'number' ? approved.slice(0, limit) : approved;

  return NextResponse.json({ success: true, data: limited });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    if (!validatePayload(body)) {
      return NextResponse.json({ success: false, message: 'Invalid payload. Provide name and content (min 10 chars).' }, { status: 400 });
    }

    const backendUrl = getBackendUrl();
    if (backendUrl) {
      // Proxy submission to backend
      try {
        const resp = await fetch(`${backendUrl}/api/testimonials`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await resp.json();
        return NextResponse.json(data, { status: resp.status });
      } catch (e) {
        console.error('Testimonials proxy POST failed', e);
        // fallback to file-based storage
      }
    }

    await fs.mkdir(DATA_DIR, { recursive: true });
    const list = await readFileList();

    const entry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: String(body.name).trim(),
      role: body.role ? String(body.role).trim() : undefined,
      company: body.company ? String(body.company).trim() : undefined,
      content: String(body.content).trim(),
      rating: typeof body.rating === 'number' ? Math.max(1, Math.min(5, body.rating)) : 5,
      approved: false,
      createdAt: new Date().toISOString()
    };

    list.push(entry);
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Submitted for review' }, { status: 201 });
  } catch (error) {
    console.error('Testimonials API error', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}



