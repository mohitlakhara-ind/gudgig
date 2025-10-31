import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ success: false, message: 'Not implemented' }, { status: 501 });
}

export async function GET(
  _request: NextRequest,
  _ctx: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ success: false, message: 'Not implemented' }, { status: 501 });
}


