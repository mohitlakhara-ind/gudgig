import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, userName } = await req.json();
    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, message: 'userId and userEmail required' }, { status: 400 });
    }
    const notif = notificationService.createNotification({
      type: 'welcome',
      title: `Welcome to Gudgig, ${userName || 'there'}!`,
      message: 'Thanks for joining. Explore gigs and start bidding!',
      userId,
      data: { userName }
    });
    await sendPushToUser(String(userId), { title: notif.title, body: notif.message, data: notif });
    return NextResponse.json({ success: true, data: notif });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to trigger welcome' }, { status: 500 });
  }
}



