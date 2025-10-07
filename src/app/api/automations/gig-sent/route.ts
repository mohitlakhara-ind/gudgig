import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications';
import { sendPushToUser } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, jobTitle } = await req.json();
    if (!userId || !userEmail) {
      return NextResponse.json({ success: false, message: 'userId and userEmail required' }, { status: 400 });
    }
    const notif = notificationService.createNotification({
      type: 'gig_sent',
      title: 'Gig Sent Successfully',
      message: jobTitle ? `Your gig for "${jobTitle}" was sent.` : 'Your gig was sent.',
      userId,
      data: { jobTitle }
    });
    await sendPushToUser(String(userId), { title: notif.title, body: notif.message, data: notif });
    return NextResponse.json({ success: true, data: notif });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Failed to trigger gig-sent' }, { status: 500 });
  }
}



