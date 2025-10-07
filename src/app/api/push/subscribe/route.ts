import { NextRequest, NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();
    if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ success: false, message: 'Invalid subscription' }, { status: 400 });
    }
    saveSubscription(String(userId), subscription);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to save subscription' }, { status: 500 });
  }
}



