import { NextRequest, NextResponse } from 'next/server';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url, icon, data } = await req.json();
    if (!userId || !title) {
      return NextResponse.json({ success: false, message: 'userId and title are required' }, { status: 400 });
    }
    const payload = { title, body, url, icon, data };
    const result = await sendPushToUser(String(userId), payload);
    return NextResponse.json({ success: true, data: result });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to send push' }, { status: 500 });
  }
}



