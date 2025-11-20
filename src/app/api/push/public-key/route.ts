import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/webpush';

export async function GET() {
  const key = getVapidPublicKey();

  if (!key) {
    return NextResponse.json(
      { success: false, error: 'VAPID public key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { publicKey: key } });
}



