import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/webpush';

export async function GET() {
  const key = getVapidPublicKey();
  return NextResponse.json({ success: true, data: { publicKey: key } });
}



